# What the app can already do for learning, and what a new learning style could use

Written 24 Oct 2026 for Dan's question: "analyse what's left to build and tell me what we should
build next. I also want a new innovative build style and learning style for the next one as a test."
This file is the platform half of the answer: what the app already gives a lesson, the hard limits
any new style must live inside, and the small app additions that would unlock new ways of learning.
The ranked list of courses is in `inventory.md` beside this file; the build pipeline review is in
`build-process.md`.

Analysis only. Nothing was changed, built or published. Read: `docs/ARCHITECTURE.md` (sections
1 to 11), `app/kit/KIT.md`, `app/kit/REFRESHER.md`, the headers and key parts of every file in
`app/src/js/`, a built lesson body (`docs/courses/electrical/design-and-verification/i5.body.final.html`),
`docs/courses/electrical/design-and-verification/format/refresher.md`, `docs/NEXT.md` and
`docs/research/how-to-teach-pre-built-courses.md`.

---

## 0. The short version

- **The app is already a strong "explain, try, check, keep" machine.** A ready-made lesson is one
  kit page of steps: a recall question first, short explanation screens, a hands-on picture, choice
  and typed-number questions with hints for the usual slips, a written answer marked by Claude
  against set points, and a Keep this card. It is then read through as stills, bound into the Book,
  and turned into puzzles for spaced review. That is the whole learning loop, and it works.
- **What it cannot do yet is let Dan *act in a situation*.** Every lesson is a straight line of
  screens that the build fixed in advance. Nothing branches on his choice, nothing simulates a fault
  he has to find, and Claude only speaks inside a lesson to mark a written answer. That is why every
  course feels alike, as Dan noticed on Design and verification.
- **The cheapest unlock is already half built.** The page can already send Dan's words to Claude and
  draw the reply (`K.written`, used for Section B answers). The same path, with a new message type,
  gives a live Claude turn inside a lesson: Claude asks *him* a question about what he just saw, or
  plays a person on the job. That is size M.
- **The best test, matched to the top course in `inventory.md` (Fault-finding), is a "find the
  fault" style:** a job card opens with a symptom; Dan chooses which tests to make on a drawn circuit;
  the readings come from a rule the lesson shows; Claude asks "what does that reading tell you?";
  the lesson ends with him explaining the fault to a junior rating and a Keep this card. It needs
  three additions: a fault-finding sandbox in the kit (L), a branching step (S once there is a steps
  engine, M without), and the in-lesson Claude turn (M).
- **Sizes are guesses.** S is about 0.3 to 0.6M tokens of agent work, M about 0.7 to 1.5M, L about
  1.5 to 3M. The only earlier app-work estimate (the four refresher pieces, about 3M) was never
  measured either. All of them sit on top of course build costs, which run about 0.9 to 1.65M a lesson.

---

## 1. Capability map: what exists, and what each piece is good for

### 1a. Inside a lesson (the kit page, `app/kit/kit.js`)

| Piece | What it does | Good for, in learning terms |
|---|---|---|
| Steps page (`format: 'steps'`) | The whole lesson is one kit page: short screens and questions, step dots, Check and Why?, `K.complete()` at the end | Brilliant-style "small commitments": explain a little, ask straight away |
| `K.control`, `K.choice`, `K.toggle`, `K.drag`, `K.stepper`, `K.button` | Sliders with snap points, named choices, switches, dragging the thing itself, walking a process | Learning by doing: he causes the effect and sees the cause drawn |
| `K.model` / `K.update` / `K.at` | One pure rule computes every number from the controls | Faithful numbers: every figure is a control, computed by a shown rule, or a cited constant |
| `k-after-move`, `K.moved`, `afterMove` | Hides the answer until his first move | Predict before play: he commits, then sees |
| `K.plot`, `K.bars`, `K.readout`, `K.labels` | Graphs, bar charts, readouts, labels kept clear of each other | Seeing a relationship, not just a number |
| `K.anim`, `K.fade`, `K.ease` | Calm motion with Play and Reset | Showing a process unfold (a motor starting, a fault current rising) |
| `K.sound` | Tones and chords from a button press | Hearing a frequency or a beat (used in AC circuits) |
| `K.answer` (refresher) | Decimal keypad field graded to the course's rounding; named slips with their own hint | C&G Section A: "Determine the design current", with the usual slip caught ("You left out √3") |
| `K.written` (refresher) | His words sent to Claude through the app, marked point by point against the lesson's points; one more go, then the model answer; self-tick when Claude is out of reach | C&G Section B: "Explain why…" in his own words, the strongest retention move in the research (say it back) |
| `K.figure`, `K.scenario`, `K.carried` (refresher) | A running case file shared by every lesson; earlier parts carried forward at the course's figures | A long design problem (the showroom) built up across lessons, as a real job is |
| `K.summary` (refresher) | The Keep this card: what it is for, the rule, the traps, the figures, where it lives | One card he can come back to on a real job; it opens the chapter in his Book |
| `K.check` and the self-test | Known answers checked, every control swept at 340, 720 and 1040 px, XL text, both themes | Quality: nothing broken, cut off, unreadable or invented reaches him |

### 1b. Around a lesson (the app, `app/src/js/`)

| Piece | File | Good for, in learning terms |
|---|---|---|
| Library home with look-up, the course left open, the puzzle box, shelves | `77-library.js`, `76-shelves.js` | Today's study one tap away; look up a lesson by name ("power factor") |
| Course page: path of lessons, two ways in ("Quiz me through it" / "Just read it through") | `71-topic.js`, `70-learn.js` | He chooses effort: test himself, or refresh by reading |
| Lesson player, organic study flow: Predict, Play, Explain, Say it back, Check | `50-lesson.js` | The original five-stage loop for topics Claude writes in the page |
| Read-through: each step as a still picture with its sentence, examples with answer and why, Keep this | `53-read.js` (+ `tools/course/guide.mjs`) | A quick refresh with nothing to answer; the "reference in the real world" use |
| Checks and review cards: choice, order, estimate, target (on the live interactive), recall, puzzle, written | `41-cards.js` | Retrieval practice in mixed formats (the research's best-supported move) |
| FSRS-4.5 scheduling, Today, daily cap 15, Light day 5, interleaving across ideas and courses, "Learn it again" when slipping | `40-fsrs.js`, `60-today.js` | Spaced, interleaved review of what he answered, with no guilt mechanics |
| Puzzles from guides: each worked example of a quizzed lesson becomes a review card, spread over days | `60-today.js`, `41-cards.js` | Ready-made courses feed review without extra build work |
| Ask Claude: a chat sheet about the lesson, with the lesson, the interactive's live state and the sources as context; can search the web and reopen sources | `51-tutor.js`, `30-prompts.js` (tutor), `31-generate.js` | Questions in the moment; explains a check after he answers it |
| Claude's notes: feedback cards with reply chips that open Ask Claude | `52-notes.js` | Turns a mistake into a conversation at the moment it happens (the Khanmigo study's lesson: tutoring only helps if offered at the mistake) |
| The Book: one dossier per course (At a glance, chapters, Put it into practice, glossary from the lesson's key terms, bibliography); "In your own words" (his say-it-backs, first and latest, and the questions he asked) | `73-book.js`, `75-dossier.js` | A field guide he keeps; seeing his understanding grow |
| In-page generation: intake, plan, research (Parallel Search), write, fact-check, build and self-test an interactive | `30`-`34` | Any topic he types (the old Learn screen, unhooked since 18 Oct but still in the code) |
| Course pictures (image model through the Claude MCP connector) | `35-art.js` | Decoration only: a cover per course, said to be drawn by an image model. It teaches nothing |
| Settings: light and dark, text size up to XL, easier reading, daily reviews, backup | `74-settings.js` | Calm reading on his phone and laptop |
| Downloads: saved copy of a dossier, Markdown or JSON of his own words, a full backup | `10-runtime.js` (`U.saveFile`) | Keeping his work outside the app |

### 1c. What the build pipeline adds (Claude Code, not the app)

Course research with every quote checked word for word (web pages and pages of Dan's own course
materials), a written brief, a fact-check by a fresh reader, contact-sheet reviews, a case file,
still guides for the read-through and the Book, and `assemble.mjs` writing it all to the db. A new
learning style has to fit this too: whatever a lesson does must also render as a still for the
read-through and the Book, and must say what becomes a review card.

---

## 2. Constraints any new style must live inside

**The page and the frame**
- Plain JS, no frameworks, no dependencies, one global `U`. Model-written text never goes into
  `innerHTML`; `U.h()` / `U.rich()` only (no links, no raw HTML).
- A lesson body runs in `<iframe sandbox="allow-scripts">`, never `allow-same-origin`, behind a CSP of
  `default-src 'none'`: no network, no storage, images and fonts only as `data:` URLs, no workers in
  practice. **The frame cannot reach Claude.** Only the host can, and only through a closed set of
  messages (today: `written` and `ticked` for Section B, plus `change`, `complete`, `height`, `ready`,
  `error`, `leaving`). Each new Claude-in-lesson feature is a new message type, a host handler and a
  per-mount limit (written answers: 4 marks per question per mount).
- Body at most 150 KB; every update under 150 ms; `K.ready()` within 12 s; frame height capped at
  6,000 px; a frame silent for 4 to 6 s is removed. A simulation must run in small steps on the main
  thread.
- No `alert`, `confirm`, `prompt`, `window.print`, blob: frames or downloads except through the
  downloads capability (`U.saveFile`). Use `U.confirmSheet()` and `U.sheet()`.

**The data**
- db documents under 256 KiB, written through `U.store` (serialised, coalesced, held in an outbox when
  the bridge drops). Guides are already 100 to 240 KB each, close to the limit; a course's puzzles come
  to about 110 KB of its cards document; a dossier chapter stays under 240 KB. A new style that adds a
  big data block per lesson needs its own document.
- Review cards come only from what Dan answered, in seven types (choice, order, estimate, target,
  recall, puzzle, written). A new kind of step reaches review only if it maps to one of them or a new
  type is added to `41-cards.js` and `60-today.js`.
- FSRS at day granularity: reviewing a card early is not "free practice"; a practice mode that should
  not move the schedule must say so and skip the save.

**The look and the reader**
- Phone first: a 340 px frame on a 360 px phone, tap targets 44 px, SVG text never under 12 units,
  Text size XL must still fit, no hover-only information, no sideways scroll. Desktop equally good
  (`K.stage` puts controls beside the picture from 860 px).
- Light by default; dark mode and text size in settings, and the self-test checks both themes.
- D4, "Claude's notes". Colour only for meaning: ink for progress and controls, green for finished
  only, red for warnings and mistakes, teal for small labels, amber for what is due and key terms.
  Never name a colour in words he reads.
- Text screens at most about 90 words (Dan, 21 Oct); short sentences, one idea each, no bracketed
  asides, never narrate sources (Dan, 20 Oct), never talk about "the course".

**Truth and cost**
- Nothing invented: every number a control, computed from a shown rule, a cited constant, an example
  value named once, or a date. Contested points taught as contested. **Live Claude replies inside a
  lesson are not fact-checked**, so they must be anchored to the lesson's checked points (as
  `K.written` is) or clearly be Claude talking, never new facts dressed as the lesson.
- In-app Claude calls run on Dan's own usage (`sample`; about 2.3 s for a quick call on his phone).
  A turn is small next to a build (a few thousand tokens against about 1M a lesson), but he hit his
  weekly limit on 21 Oct, so a style should use a handful of Claude turns a lesson, not dozens, and
  every one must degrade gracefully when Claude is out of reach (as `K.written` falls back to ticking).
- Image generation is for decoration: an image model cannot be trusted to draw a circuit, a
  nameplate or a test result correctly, so it never carries teaching.
- Inspection and testing is on hold until Dan says go; a style built around a schedule of test results
  or a certificate would step on it.

---

## 3. Small app additions that unlock new learning styles

Ordered by how much they open up for their size. "Engine" means the kit steps engine in 3.1.

### 3.1 A steps engine in the kit (screens as data) — L, the enabler
Today every lesson body carries its own copy of the steps machinery (step dots, Check and Why?,
tries, hints, the recall opener's skip): about 40% of a 35 to 70 KB body (`build-process.md`, cause 2).
A `K.steps(STEPS, {into})` that plays a list of screens and questions, and that `guide.mjs` reads
directly for the read-through and puzzles, makes every new step kind below a small addition instead
of something each build re-invents. It also cuts build cost on every lesson after it. Keep an
opt-out for a lesson whose picture is bespoke.
- **Learning gain:** none by itself; it makes the rest cheap and consistent.
- **Size:** L (1.5 to 2.5M), plus migrating nothing: old lessons keep their own engines.

### 3.2 A live Claude turn inside a lesson (`K.ask`) — M
A new message `{type: 'ask', id, text}` handled like `written`: the host sends Claude the lesson's
checked words, the step's question, the picture's current state (as Ask Claude already does with
`getState`) and Dan's words; the reply comes back as plain text the kit draws with `textContent`.
Two uses, both short and capped (say 3 turns per step):
- **Socratic probe**: after a reading or a reveal, Claude asks "What does that tell you?", listens,
  and nudges toward the lesson's point without handing it over (the "holds, not the answer" rule from
  the research). Anchored to `lesson.probe[id] = {q, points, need}`, so it is marked like `K.written`.
- **A person on the job**: Claude plays the Officer of the Watch, a chief, or a junior rating asking
  why ("Why can't we just reset it?"). The lesson gives the role, the situation and the points a good
  answer covers; Claude stays in role for two or three turns, then steps out and marks it.
- **Read-through and Book:** shows the question and the model answer, as a written step does today.
- **Review:** becomes a `written` card.
- **Size:** M (0.8 to 1.2M): prompt and validator, host handler, kit drawing, self-test stub, guide kind.

### 3.3 A branching step — S on the engine, M without
A choice that sends him to different next screens: `next: {[option]: stepIndex}` with paths that
rejoin. Lets a lesson follow *his* decision ("Which test first?", "Isolate here or there?") and show
the consequence of a poor choice before the better one, instead of only marking it wrong.
- **Read-through:** the main path in order, each other branch as a short "If you had chosen…" card.
- **Review:** the decision becomes a choice puzzle.
- **Size:** S (0.3 to 0.5M) on the engine; M inside one hand-built body, with guide.mjs taught to read it.

### 3.4 A fault-finding sandbox in the kit (`K.faults`) — L
A drawn circuit (supply, protective device, cable runs, loads, test points) with one hidden fault
picked from a list the lesson names: open circuit, high resistance joint, short, earth fault, a
reversed polarity. Dan picks a test (continuity, insulation resistance, voltage at a point, loop
impedance) and where to make it; the reading is computed from a small resistive-network rule the
lesson shows, with the fault injected, so every number is "computed from a shown rule". A log keeps
the tests he made, in order; the step ends when he names the fault and its place. Safe isolation is
a step the sandbox insists on before any dead test, and a live test is only where the lesson's
sources say it is the right test.
- **Learning gain:** reasoning from evidence, the core of fault-finding and of a leading hand's job;
  varied practice (a new hidden fault each go) that the research ties to transfer.
- **Self-test:** every listed fault findable, every test's reading checked by hand for one case.
- **Read-through:** one solved run as stills: the log, the readings, the conclusion.
- **Review:** "Given these readings, where is the fault?" as a choice puzzle.
- **Cheaper first cut (S to M):** an evidence table instead of a solver: for each fault, the reading
  each test gives, worked out by hand and cited, and the page only looks it up. Pilot that way in
  one lesson; promote to a solver if it earns it.
- **Size:** L (1.5 to 2.5M) for the solver; S to M for the evidence-table version.

### 3.5 "Teach it back" to a named listener — S
`K.written` with an audience: "Explain to a new AB on your section why the breaker tripped." Same
marking against points, plus one point about pitch (no unexplained jargon, safe way first). Fits his
Level 4 leadership path: explaining is part of leading.
- **Size:** S (0.2 to 0.4M): one prompt line, one field, the rest exists.

### 3.6 "Spot the mistake" step — S on the engine
A worked design or calculation shown line by line with one planted slip (the √3 left out, the wrong
column of a table, a Ca applied twice). He taps the line that is wrong, then says what it should be
(typed answer). The research's worked-example and error-detection findings both point this way, and
it is exactly what a supervisor does to someone else's work.
- **Review:** a choice puzzle ("Which line is wrong?").
- **Size:** S (0.3M) on the engine.

### 3.7 Fresh-numbers practice cards (`calc`) — M
The planned "Keep it fresh" card: the same question shape with new numbers each review, from the
same rule and rounding. The rule must run somewhere safe: either a tiny expression evaluator in the
app (no `eval`; `+ − × ÷ √ ^`, named inputs and ranges, one rounding), or the card mounts a small kit
page in the sandbox. Turns one Section A part into endless practice; strong for Design and
verification and the maths courses.
- **Size:** M (0.8 to 1.2M): card type, evaluator, generator in guide.mjs, review screen.

### 3.8 A mixed review on demand — S
Today already interleaves due cards across ideas and courses. What is missing is a "Level Review" Dan
can start: ten cards drawn across a course (or a shelf), mixed, closed-book, from any day, marked as
practice so the schedule only moves for cards that were due. The research rates mixed, cumulative
review as one of the best-supported moves, and it is the cheapest one here.
- **Size:** S (0.3 to 0.5M): a route (`#/review/mix?topic=`), a queue builder, a "practice" flag on saves.

### 3.9 The glossary in the lesson and in look-up — S
Each dossier already has a glossary built from the lesson's key terms. Make a highlighted term in a
lesson or read-through tappable (a sheet with its sentence), and let the Library's look-up find terms
and Keep this rules, not just lesson titles.
- **Size:** S (0.3 to 0.5M).

### 3.10 An "on the job" quick reference — M
Dan said Design and verification is "a reference for myself in the real world". The pieces exist (Keep
this cards, figures, the Book) but are spread over chapters and big guide docs. A small
`topics/{tid}/ref` document written by `assemble.mjs` (every Keep this card, the formulas, the traps,
the glossary) and a `#/ref/:tid` page: one scroll, searchable, big type, nothing to answer, opening
straight from the course page. Optionally the course's calculators (voltage drop, design current) as
tools, labelled as tools. This is a separate mode, not a lesson format: Dan turned down a job-card
*lesson* on 20 Oct, not a reference.
- **Size:** M (0.7 to 1M).

### 3.11 Confidence before the reveal — S
One tap after he answers: "Sure / Not sure". A confident wrong answer gets a longer why and comes back
sooner (the hypercorrection effect). Light, no score shown.
- **Size:** S (0.2 to 0.4M).

### Not recommended now
- Voice in and out: the page has not declared microphone access and speech in the viewer is untested
  on his phone. Worth a ten-minute check before any plan.
- Teaching pictures from the image model: they cannot be trusted to be right.
- A certificate or schedule-of-test-results simulator: it belongs to Inspection and testing, on hold.

---

## 4. What a new learning style could be, and what each needs

| Style | What a lesson is like for Dan | Needs | Best course for it |
|---|---|---|---|
| **Find the fault** (recommended test) | A job opens with a symptom. He chooses tests on a drawn circuit, reads results computed from a shown rule, is asked by Claude what each tells him, names the fault, explains it to a junior, keeps a card | 3.4 (evidence-table cut first), 3.2, 3.3, 3.5 | Fault-finding: from symptom to cause |
| Decide and see | Each lesson is three or four decisions on a real job (a generator to parallel, a load to shed); a poor choice plays out before the better one | 3.3, 3.2 | Generators and the ship's switchboard |
| Spot the mistake | He checks someone else's design or working, line by line, as a supervisor | 3.6, 3.7 | A Design and verification follow-up; Transformers |
| Talk it through | Claude plays a person on the job; he explains, persuades, briefs | 3.2, 3.5 | Leading a team (Level 4), once Dan shares the syllabus |
| Keep it fresh | Short mixed drills with new numbers, plus the quick reference on the job | 3.7, 3.8, 3.10 | Design and verification, the maths courses |

**Why "Find the fault" for the test.** It is the most different from what Dan has used (the order is
symptom first, theory when he needs it), it is the work he does and will supervise, and it tests the
one capability the app lacks: acting in a situation. It keeps everything that works: predict before
reveal, numbers from a shown rule, written answers marked against points, Keep this, the read-through
and puzzles.

**The smallest platform for the test (one or two lessons first):**
1. The in-lesson Claude turn, 3.2 (M, about 1M).
2. The fault sandbox as an evidence table, built inside the lesson's own page first, with a branch or
   two hand-made in that page (about 0.5M on top of the lesson's build).
3. Teach it back to a junior, 3.5 (S, about 0.3M).

That is about 1.8M of app work before the course's own lessons. If the pilot lesson works, promote the
sandbox to the kit (3.4) and build the steps engine (3.1) before the rest of the course, so the next
lessons get cheaper rather than each re-inventing it.

**Risks to watch.**
- A live Claude turn says things nobody fact-checked. Keep it anchored to the lesson's checked points,
  short, and marked like a written answer.
- Branches and a sandbox must still read as plain sense in the read-through (Dan, 20 Oct: "the images
  are blank"). Give every branch and every sandbox run a still.
- His own fault-finding handouts sit partly in the inspection and testing material on hold: ask Dan
  before using them (`inventory.md`, section 0).
- Each Claude turn uses his allowance. Three or four a lesson is the budget.
