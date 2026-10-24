# Daily Rounds: five minutes a day, a course that unfolds over weeks

One of five independent designs for Dan's 24 Oct request: "analyse what's left to build and tell
me what we should build next. I also want a new innovative build style and learning style for the
next one as a test." The angle given to this design: **five minutes a day**. Analysis only. Nothing
was built, changed or published. Read for it: `inventory.md`, `build-process.md`, `platform.md` and
`learning-research.md` beside this file, CLAUDE.md, `docs/ARCHITECTURE.md` sections 4 and 8, and the
review code (`app/src/js/40-fsrs.js`, `41-cards.js`, `60-today.js`).

Key: `micro`. Name: **Daily Rounds**. (In the Navy, rounds are the short routine walk round the
machinery, done every watch. That is the idea: a short, regular look at what matters, every day.)

---

## 0. The short version

- **The learning style.** A course is no longer a run of lessons. It is a deck of about 48 small
  **items**, each one moment of "look at this picture, predict what happens, say how sure you are,
  see what really happens, read two or three sentences on why". Three new items a day drip into the
  Today screen Dan already uses, mixed in with the puzzles from his other courses. Each item comes
  back on the spaced schedule the app already runs. A wrong answer comes back once more before the
  session ends. A course unfolds over three to four weeks at about five minutes a day. Items he
  already knows cost him ten seconds once and then stay away for weeks. That is the "do not re-teach
  what he knows" rule, done item by item instead of lesson by lesson.
- **Both ways stay.** "Quiz me" is the daily round. He can also take a whole strand in one sitting
  when he has a long watch off. "Just read" is each strand as a flip-book: picture, question, answer
  and why, opening on its Keep this card. That flip-book is also the reference he looks things up in
  at work.
- **Why it should work.** Every item is a prequestion, which helps for the material it asks about
  (g = 0.54). Spacing from the first meeting, interleaving of look-alike ideas, confidence ratings
  that make confident errors stick when corrected, and successive relearning are among the
  best-supported moves in the research report. Little text sits on each screen, with the labels on
  the picture. Microlearning has no evidence of its own as a cause, and this design does not claim
  it does. Short sessions are only the way to deliver the spacing and retrieval, which are the parts
  that work (`learning-research.md` sections 2, 3, 5, 9, 10).
- **The build style.** Items are data. One writer writes the whole course's items in one voice, with
  a mechanical writing lint in the loop. Pictures come from a few tested, reusable drawing parts.
  Every item's before and after stills are made from those parts by a script, not built as a
  lesson page. Fact-check, review and fix run once per course and look at one card sheet per strand,
  not once per lesson. There are no per-lesson page bodies, no per-lesson research top-ups, no plain
  edit pass and no case file. Quote-checked research and the fresh fact-check both stay.
- **Cost.** About **2.2 to 3.2M tokens for a 4-strand course**, so about **0.55 to 0.8M per
  lesson-equivalent** (a strand of 12 items), against 1.0M today and 1.65M for the full process. A
  later course that reuses the drawing parts should cost about 1.8 to 2.6M. On top of that comes a
  one-off of about **1.9 to 2.7M**: about 1.3 to 1.9M of app work and about 0.6 to 0.9M of build
  tools. These are reasoned estimates. Past estimates have run about 50% low (Motors was estimated
  at 0.7M a lesson and measured 1.05M), so section 4.7 sets a stop rule.
- **App work.** Small, and all in code that exists: a daily intake that adds the day's new items to
  the puzzle box, three upgrades to the puzzle card (a "before" picture, a first-meeting note, and
  Sure / Not sure buttons), "one more go" for wrong answers within a session, and a read-through that
  shows the before picture and folds away items not met yet. This design needs **no** kit steps
  engine, **no** live Claude turn, **no** new card type and **no** new sandbox message.
- **The pilot: Transformers**, 4 strands and about 48 items (section 4). It is on the shelf, it is
  clean physics with every number computed from a shown rule, and it is partly known ground, which
  is exactly where an item-by-item test-out should beat a lesson. CTs and VTs feed every switchboard
  meter, so it also leads into the shipboard courses. Earth faults at sea is the natural second
  course in this style.
- **How we judge it.** Dan does a round on at least 10 of the first 14 days without being reminded.
  At least 80% of items are right at their second look. At least 75% of week-one items are right a
  month later. Most of his confident misses are right the next time. He asks for the next course
  this way. Every one of these numbers is already in the cards' history in the db.

---

## 1. The learning style

### 1.1 What Dan does

**A typical day (day 6 of the pilot, on his phone, about five minutes).**

| # | Screen | What he sees and does | Time |
|---|---|---|---|
| 0 | Library home | The puzzle row says "8 puzzles today · 3 new". One tap. Nothing else asks for attention. | 2 s |
| 1 | A second look (Transformers s1-3) | The picture of the core with its turn counts. "What voltage does the secondary give?" He types 110 and taps **Sure**. "Right. Back in 8 days." | 15 s |
| 2 | New item (s1-11) | A small teal label: **New**. The picture shows a transformer feeding a heater, and the question asks what doubling the secondary turns does to the heater's power. He picks "It doubles" and taps **Sure**. It is wrong. The after picture shows the power bar four times as high. Below it is a 40-word note: twice the volts, twice the current, four times the power. He is told he will see it again in a minute. | 50 s |
| 3 | A puzzle from another course | A Design and verification worked example, as today. The mixing of courses is already in the app. | 40 s |
| 4 | New item (s2-4) | An efficiency sum with example values. He types 96.6 and taps **Not sure**. It is right, and he gets a short note. Because he was unsure, it comes back sooner (graded Hard). | 45 s |
| 5 | A second look (s2-2) | "Secondary open, primary on. Which loss is still there?" Right, and sure. | 15 s |
| 6 | A second look (s1-7) | The isolating transformer and the steel deck. Right. | 15 s |
| 7 | New item (s1-12, say it back) | "Explain to a new hand on your section why the low-voltage winding is wound with thicker wire." He types two sentences. Claude marks them against three points, as written answers are marked today, and shows "Got it". | 70 s |
| 8 | A second look (s1-5) | Thick or thin wire. Right. | 12 s |
| 9 | One more go (s1-11 again) | The same heater question. He picks "Four times": "That's it." This second answer does not move the schedule. The first answer already set it to come back tomorrow. | 15 s |
| 10 | Done | "Done for today. 3 new ones tomorrow." Under it are three quiet links: "3 more new ones", "Read what you've met" and "Try it on the bench". No streak, no score, no badge. | 5 s |

That is about 4.5 minutes. On a Light day (a setting that exists today) the session stops at 5
puzzles, of which at most 2 are new.

**One new item, screen by screen.** An item is one card in the app's own review screen. It is not a
page inside an iframe.

1. **Before.** A small teal label "New", then the before picture on its white well, with its labels
   on the drawing. Under it, the question in at most 25 words. Then two to four answer buttons, or a
   number field with its unit. The foot has two buttons, **Sure** and **Not sure**, which stay
   disabled until he answers. One tap both rates his confidence and checks the answer. There is no
   extra screen for it.
2. **After.** "Right" or "Not quite", and "You said X. The answer: Y." Then the after picture,
   showing what happened, then Claude's note: at most 60 words the first time, at most 40 on later
   looks, with key terms in amber. The reply row that opens Ask Claude is there as today (optional).
   Last, "Back in N days" and Continue.

Text on any one screen stays under about 70 words. That is well inside Dan's 90-word limit of
21 Oct.

**Across a course (Transformers, 4 strands of 12).**

- **Days 1 and 2.** Strand 1 only: the core, the turns ratio, current going the other way. Nothing
  later makes sense without these.
- **From day 3.** Strand 2 (losses) mixes in, and from about day 5 strands 3 and 4 do too. New items
  then come from whichever strands are open, mixed. The order is written into the course as data by
  the planner, and each item's prerequisites come first.
- **Each say-it-back** card arrives after its strand's items have been met at least once (day 6 for
  strand 1).
- **About day 17** (if he opens the app every day) all 48 items have been met. After that only second
  looks come, spreading out as the schedule lengthens. The course does not end with a lesson. It
  thins out into a puzzle or two a day, which is the long-term retention his "I'll never forget
  that now" was about.
- **About day 28**, a short **final round**: three items held back by the build, the same ideas in
  situations he has not seen. This checks transfer, not just recall.

**Missed days pile nothing up.** New items are added only on a day he opens the app. While six or
more of this course's second looks are waiting, no new ones are added. Nothing is "behind" and
nothing nags. That keeps CLAUDE.md's "no guilt mechanics".

**When he wants more.** "3 more new ones" at the end of a session adds the next three. On the course
page, "Do strand 2 now" takes all of a strand's unmet items in one sitting (about 8 to 10 minutes),
like quizzing through a lesson today. After that they follow the same schedule.

### 1.2 The kinds of item

Every kind becomes an existing card type, so review needs no new type (`41-cards.js`: puzzle `pick`
and `typed`, and `written`).

| Kind | What it does | Card | About how many a strand |
|---|---|---|---|
| **Map** | The whole system drawn, with one question about how the parts connect. This is the layered model the troubleshooting research asks for. | puzzle, pick | 1 |
| **Predict** | Before: a set-up. "What happens when…?" After: what happens. | puzzle, pick | 4 to 5 |
| **Number** | A computed figure from a shown rule, with example values labelled. | puzzle, typed | 2 to 3 |
| **Which is it?** | Two look-alike ideas side by side (iron loss or copper loss, CT or VT). This is interleaving at its most useful. | puzzle, pick | 1 to 2 |
| **Spot the slip** | A new hand's working with one mistake (learning from someone else's failure). | puzzle, pick | 1 |
| **Known ground** | A bridge to what his qualifications cover. It is answered fast and pushed out for weeks. | puzzle, pick or typed | 1 |
| **Say it back** | A "why" in his own words, marked by Claude against points. | written | 1 |
| **Keep this** | The strand's rule, traps and figures. It is not a card: it is the first page of the strand's read-through and its Book chapter. | guide summary page | 1 |

### 1.3 Why it should work (from `learning-research.md`)

| Move | Evidence | How Daily Rounds uses it |
|---|---|---|
| Retrieval, spaced, until correct (successive relearning) | Strong. Practice testing and spacing are the only two "high utility" techniques. Relearning beat single-session learning by d = 1.52 to 4.19 (section 2). | Every item is retrieved from its first meeting on. Wrong answers come back within the session and again the next day. FSRS spaces them out after that. |
| Prequestions and prediction | Moderate. g = 0.54 for the questioned material, about 0 for material not asked about. Prediction works through surprise (section 5). | **Everything** is asked before it is told, so all of the content is "questioned" material. A lesson asks about only a few of its points. |
| Hypercorrection | Moderate (lab). Errors made with high confidence are the most corrected, especially by people who know the field (section 5). | Sure / Not sure on every item. A confident miss gets the full note and one more go at the end of the session. |
| Interleaving | Moderate. g = 0.42, strongest where categories look alike. Interleaving single items works; long blocks do not (section 3). | "Which is it?" items, mixing across strands from day 3, and mixing across courses on Today (already built). |
| Expertise reversal | Moderate. Explanations that help novices can hurt people who already know. A first-step check found to predict expertise well (section 4). | Each first meeting is a check. Right, sure and fast earns the Easy grade (the existing auto-grade), so he sees a known item rarely. Nobody explains what he already knows. |
| Split attention and redundancy | Strong. g = 0.63 for words placed on the picture (section 9). | Labels sit on the drawing. The note never repeats what the picture shows. At most 60 words, and usually under 40. |
| Self-explanation | Moderate to strong. "Conceptualise" prompts g = 0.87, typed answers better than picked ones (section 8). | One say-it-back per strand, marked by Claude against points. |
| Vicarious failure | Emerging (section 5). | One "spot the slip" item per strand. |
| Successive relearning matching his Level 4 experience | His "I'll never forget that now" (section 2). | The course keeps coming back in small doses for months, not once. |

**Honest limits.** Spacing has not been shown to help *concept* learning (Cepeda, Pashler and
colleagues, section 2). The cure here is the map items, the say-it-back cards, the Keep this cards
and the strand read-through, which hold the concepts together. Microlearning as a cause in itself is
weak evidence (section 10). The bet is on spacing, retrieval and prediction, delivered small. There
is also the 2025 warning that when retrieval mostly fails, learners engage less (section 2). So
first meetings are pitched to be answerable by reasoning one step from what he knows. We aim for
about 60 to 75% right at first meeting, and we measure it (section 4.8).

### 1.4 How it keeps his rules

| Rule (CLAUDE.md, Dan's words) | How Daily Rounds keeps it |
|---|---|
| First principles, plain words, from what he knows | One writer for the whole course in one voice. The lint fails sentences over 20 words, semicolons, brackets, narrated sources and "the course". The known-ground items start from his BS 7671 and site experience. |
| "Explain in your own words", no narrating sources (20 Oct) | Sources are data on each item (`src` ids) and are never shown. The lint bans "your slides", "(p.", "one site", "according to" and similar. |
| At most about 90 words of text a screen (21 Oct) | The schema caps them: a question of at most 25 words, options at most 6 words each, a note at most 60 words (first meeting) or 40 (later). The lint counts the whole card, picture labels included, against 90. |
| Faithful: numbers are controls, computed from a shown rule, or cited | Every number in an item's words is one of its given values (labelled "Example values" when they are practice values), the output of its `calc` rule, or a cited constant by id. The script works out every answer from the rule. The writer never types a computed answer. |
| Contested points taught as contested | An item can carry `contested: true` and its note says so (for example, the capacitance leakage on an isolating transformer, s1-7). |
| Learn by doing; every manipulable idea gets an interactive | One **bench** per course: a single kit page drawn from the same parts as the stills, where he can change the turns, the supply, the load and AC or DC, and see the losses. Cards link to it after the reveal ("Try it on the bench"). The before and after stills are frames of the same parts. |
| Predict, play, explain, say it back, quick checks, spaced review | Predict on every item, play on the bench, the note explains, one say-it-back a strand, every item is a quick check, review is the whole point. |
| Calm reading, D4 colours | The app's own card screen. Teal for the "New" label, amber only for key terms and today's count, red only for a wrong answer, green only for a finished strand. |
| Light mode default, phone first | Cards are the app's own tested UI. The stills are drawn on the white well at 328 px, as guide stills are now. |
| Nothing in the way, no guilt | One tap from home. Missed days add nothing. New items wait while second looks are waiting. Pause at any time. "3 more" is optional. |
| Two ways through ("quiz me" / "just read") | Quiz: the daily round, or "Do this strand now". Read: each strand's read-through, a flip-book opening on Keep this. |
| Never re-teach what his qualifications cover | Known-ground items are answered once, then spaced far out. No explanation is written for them beyond the link to what is new. |

### 1.5 What it does better than today's lessons, and what it gives up

**Better:**
- It answers his three complaints at the root. "Too much text after the diagrams": items have about
  40 words. "Horribly written": one writer, a lint, and the read-through uses the same words as the
  quiz. "Just gives me what I need to know": every item is one thing he needs to know.
- Retrieval starts at the first meeting, not after a 15-screen lesson. Today a lesson's puzzles
  first come back the day after he finishes it.
- It asks about everything, not a few checks a lesson, so the prequestion effect covers the whole
  course.
- His daily cost is small and predictable, and almost none of it uses his Claude allowance (only
  marking the say-it-back answers).

**Gives up:**
- **The long worked case.** Design and verification's showroom, built up across lessons, does not
  fit into 40-second items. Daily Rounds is for principles, rules, behaviours and checks. It is not
  for long design problems. It is not offered for courses like that.
- **An interactive for every lesson.** There is one bench per course. Ideas that cannot be
  manipulated (the CT safety rule, the vector group) are taught by before and after stills.
- **Finishing fast.** A course takes three to four weeks unless he takes strands in one sitting.
  Some learners want the whole thing now. "Do this strand now" is there for that.

---

## 2. The build style

### 2.1 The unit of work is the item, not the lesson

```
item = {
  id: "s1-11", strand: "s1", kind: "predict", order: 16,          // where it falls in the drip
  q: "You double the secondary turns. The same heater stays connected. What happens to the heater's power?",
  input: "pick", options: ["It doubles", "Four times", "No change", "It halves"], answer: "Four times",
  slips: { "It doubles": "Volts double and current doubles too. Power is both.", ... },
  first: "Twice the turns gives twice the volts. ...",              // at most 60 words, the first meeting
  why:   "Volts and current both double, so power goes up four times.",   // at most 40 words, later looks
  pic:   { part: "coreAndCoils", pre: { ns: 300, load: "heater", hide: ["P"] },
           post: { ns: 600, load: "heater", show: ["P", "Ip"] } },
  calc:  { rule: "P = V^2 / R", given: { ratio: 2 }, out: { P: "x4" } },
  values: { example: true },                                       // practice values, labelled on the picture
  src: ["R3", "R7"], contested: false, safety: false, known: false, conf: true
}
```

Each strand also has a `keep` (the Keep this card: for, rule, traps, figures, where) and one
`written` question (q, 2 to 4 points, need, model answer). There is one `items.json` per course,
about 40 to 60 KB. **It is the only place the words live.** The guide, the cards, the read-through,
the Book chapter and the review all read it.

### 2.2 Stages

Models and effort follow CLAUDE.md's table, unchanged. What changes is how often each stage runs:
once per course, not once per lesson. There are also new scripts that do the counting a reviewer
does today.

| # | Stage | Model, effort | Input | Output | Gate | Tokens (about) |
|---|---|---|---|---|---|---|
| 0 | Brief and item plan | Opus high | Inventory entry, Dan's background, his materials if any | A brief of at most 15 KB: the strands, what he already knows per strand, the **likely confident wrong guesses** (the seeds of predict items), the drawing parts needed, the drip outline, the cost | Dan's yes | 0.15 to 0.2M |
| 1 | Research | Sonnet high (quote checker) | The claim list from the plan, one line per item | `research.json`, every quote checked word for word on its page (`sources.mjs`, `harvest.mjs` as today). One source pack per strand, cut by id. | `sources.mjs` | 0.3 to 0.45M |
| 2 | Write the items | Opus high, **one writer for the whole course** | Brief, the strand packs, the item schema | `items.json` (48 items, 4 Keep this, 4 written, the drip order) | `items.mjs lint` in the writer's loop (2.5) | 0.3 to 0.45M |
| 3 | Drawing parts | Opus xhigh | The parts list (for the pilot: core-and-coils with meters, loss bars and efficiency curve, three-phase windings with phasors, a switchboard one-line with CT and VT) | Pure functions, `state -> SVG`, in `tools/course/pics/`, usable by Node and by the kit | Render check on every item's two states (2.5). At most three attempts per part. | 0.4 to 0.6M |
| 3b | The bench | Opus xhigh | The same parts | One kit page with free play and 3 challenges, built and self-tested with `attempt.mjs` as today | Self-test at 340/720/1040 px, XL text, both themes. At most three attempts. | 0.25 to 0.35M |
| 4 | Fact-check | Opus high, fresh | `items.json` (the final words), the strand packs, the calc results | Each claim checked against its quote. Every calc recomputed by script, and one in four by hand. Every safety item read twice. Contested points marked. | `items.mjs verify` | 0.25 to 0.35M |
| 5 | Review (teaching and look) | Opus xhigh, fresh | **One card sheet per strand** (2.5), the drip order | Scores 1 to 5 on: is each prediction worth making; does the after picture teach; plain and short; pitch above what he knows; order and interleaving; read-through sense. Fix and polish findings. | Scores of 4 or more | 0.25 to 0.35M |
| 6 | Fix | Opus high | Findings | Edits to `items.json` and the parts. Lint, render and sheets run again. | Lint, render and verify clean | 0.1 to 0.2M |
| 7 | Confirm | Mechanical. Sonnet medium only for teaching or safety fixes. | The diff and the new sheets | The reader's word | Skipped when only polish was found | 0.03 to 0.06M |
| 8 | Assemble | Script (Sonnet low only for warnings) | `items.json`, the SVGs | One guide per strand (summary first, then example pages with `pre`, `svg`, `first`, `input`, `options`, `unit`), a lesson doc per strand holding `written`, the topic doc with `style: 'rounds'` and the drip order, `guideV` | `assemble.mjs` limits (guide under 250 KB, and so on) | 0.03 to 0.05M |
| | **Course total** | | | | | **about 2.1 to 3.1M** |

Publishing is as today: Dan's session, an ArtifactData batch per manifest, the shelf's `tid`, and the
token cost reported to Dan by stage.

### 2.3 What stays, what goes, what changes

| Today's stage | In Daily Rounds | Why |
|---|---|---|
| Research with quote checking (Sonnet high) | **Stays**, once per course, then cut into strand packs by id | A Daily Rounds course has many claims, so the quote checker is needed even more |
| Research top-up per lesson | **Goes**. One full research run, with gaps topped up only by name. | It accounted for 15% of a lesson, and prompts doubled as the research grew |
| Write per lesson (Opus high) | **Becomes one writer for the course**, with the lint in its loop | One voice, and the fixed reading is paid once |
| Plain edit per lesson | **Goes**. The lint and the single writer replace it. | It existed to undo per-lesson writers' habits |
| Fact-check (Opus high, fresh) | **Stays**, once per course, **on the final words** | Today it reads the JSON before the words change. Here the words cannot change after it except through fix, which runs verify again |
| Build a page body per lesson (Opus xhigh, 35 to 70 KB) | **Goes**. Instead, drawing parts once per course (xhigh, at most 3 attempts each) and one bench page | This is where blocked builds at 360 px came from, and about 40% of each body was repeated machinery |
| Guide stills made back from a live page | **Goes**. The stills are the rendered states. | "The images are blank" cannot happen when the still is the data |
| Review (Opus xhigh, fresh) | **Stays**, once per course, on one sheet per strand | Every safety error so far was caught by a fresh reader |
| Fix and confirm | **Stay, smaller.** Fixes are edits to data, and confirm is mostly mechanical. | Words change without rebuilding a page |
| Case file | **Goes** (not needed for items) | No 295 KB file, no drift between lessons |
| Pilot first | **Stays**: strand 1 goes to Dan on his phone before strands 2 to 4 are checked (4.7) | |

### 2.4 What is reused

| Thing | Across strands | Across courses |
|---|---|---|
| Drawing parts (`tools/course/pics/`) | Every item's stills and the bench | Core-and-coils for any machine course. The one-line, lamp row and meter for Earth faults at sea and Generators. Phasors for AC circuits follow-ups. |
| Item schema, `items.mjs` (lint, verify, render, sheets) | All | All Daily Rounds courses, and the lint is useful to today's pipeline too |
| `assemble.mjs` items mode | All | All |
| Items themselves (`concept` tags) | "Which is it?" items draw on two strands | A later course can borrow a checked item by id. For example the CT items would serve a Generators protection strand, and the isolation item opens Earth faults at sea. |
| The app's intake and card upgrades | | Any course. Every live course's worked examples are already items in this format (puzzles), so a "keep-alive round" of Design and verification would cost nothing to build. |

### 2.5 The new scripts (a one-off, about 0.6 to 0.9M)

- **`items.mjs lint`.** Counts and checks:
  - Word caps per field, and the 90-word whole card.
  - Sentences at most 20 words. No semicolons, no brackets in prose, no colour names.
  - Banned narration ("your slides", "(p.", "pack", "the course", "one site", "according to").
  - Numbers in words must come from the item's given values, its calc or a cited constant.
  - The question must name every value its calc needs, so it stands without the picture.
  - The right answer must not sit in the same position on more than half of a strand's pick items.
  - Typed answers must parse as figures the way the app's `figureOf` reads them.
  - Written items need 2 to 4 points, with `need` no more than the number of points.
- **`items.mjs verify`.** Runs every `calc` through a tiny safe evaluator (no `eval`), compares it with
  the answer, and checks every `src` id is in `research.json` with its quote kept.
- **`items.mjs render`.** Draws each item's `pre` and `post` states with the parts. It checks text is
  at least 12 units, labels do not overlap, everything fits the viewBox at 328 px, and **the answer
  is not visible in the before picture** (its label hidden, its value absent from the SVG text).
- **`items.mjs sheets`.** Lays out every item exactly as the review screen will show it, at 360 px,
  in light and dark and at Text size XL, using the app's own CSS through `tools/harness/page.mjs`.
  It makes one contact sheet per strand, which is what the fact-checker and reviewer look at
  ("one contact sheet per check").

### 2.6 Tokens: what to expect against today

| | Today, refresher | Full process | Daily Rounds, first course | Daily Rounds, later courses |
|---|---|---|---|---|
| Per lesson-equivalent (12 items) | about 1.0M | about 1.65M | **about 0.55 to 0.8M** | **about 0.45 to 0.65M** |
| 4-lesson course | about 4.4M (inventory) | about 7M | about 2.2 to 3.2M | about 1.8 to 2.6M |
| Per item | | | about 45 to 65k | about 40 to 55k |
| One-off | | | 1.9 to 2.7M (app 1.3 to 1.9M, scripts 0.6 to 0.9M) | none |

**Why it should be cheaper.** Today a 4-lesson course runs about 30 fresh agents, each reading 40 to
70k tokens of fixed context before it starts (`build-process.md` section 2). Daily Rounds runs about
9, each once per course. The biggest single stage, the bespoke page body (18 to 33% of a lesson),
becomes a few small drawing functions. Counting words, footnotes and answer positions moves from an
xhigh reviewer to a script.

**Why it might not be.** The writer, fact-checker and reviewer each hold the whole course, so their
contexts are larger. Drawing parts that must cover 24 states each may take all three attempts. No
Daily Rounds course has been measured.

**The pilot as a whole**, one-off included, comes to about 4.1 to 5.9M. That is about the same as
building Transformers the usual way (about 4.4M), and up to about 1.5M more. From the second course
on, it saves about 40 to 50% a course.

### 2.7 Failure modes it removes, and the ones it adds

| Removed | Because |
|---|---|
| Blocked builds at 360 px (Subsea i3, Motors i2) | No per-lesson HTML. The words are drawn by the app's own tested card screen. Only the parts and the bench are bespoke, and they are tested once. |
| Screens over 90 words (a third of Motors' fix findings) | Schema caps and the lint |
| Narrated sources, footnote counts, answer always first | The lint |
| Words in three places, final.json drift, the case file at its size limit | One `items.json` |
| Guide stills blank or showing the start state | The stills are the item's states |
| Research growing to 500 or more sources in every prompt | One research run, strand packs by id |
| Facts changed after the fact-check | Fact-check reads the final words, and any fix runs verify again |

| Added | How it is kept small |
|---|---|
| **Bitty**: items that do not join up into understanding | A map item opens every strand. Keep this cards, the strand read-through and one say-it-back a strand hold it together. The review scores "does the strand add up". |
| **Trivia**: items that test recall of a word, not understanding | The review's first score is "is this prediction worth making". At most one recall-only item a strand. Prefer predict, number and "which is it". |
| **Samey pictures** | At least two kinds of picture per strand. The review sheet shows a whole strand at once, so sameness is visible. |
| **Too many states** for a drawing part | The plan lists every state before the part is built, and a part with more than about 30 states is split. |
| **Drip too slow** or too fast for him | Three a day by default, "3 more" and "Do this strand now", and we ask him on day 7 |
| **Guide size** (two SVGs an item) | About 12 items times 2 times 5 KB is about 120 KB a strand. The 250 KB guide limit holds. Shared `<defs>` and minified SVG if needed. |
| **New app code** with bugs (piling up, double grading) | Unit tests on the intake and the in-session repeat, the existing e2e harness, and the intake designed to be lazy and run once a day |

---

## 3. App work needed

All of it sits on code that exists (`60-today.js`, `41-cards.js`, `53-read.js`, `71-topic.js`). The
puzzle machinery already turns guide example pages into cards (`puzzlesFrom`), writes them with
chosen first days (`addPuzzles(..., {due})`), and spreads new cards across lessons in turns
(`spread`). Daily Rounds is mostly that machinery run every day instead of once.

| # | Piece | What exactly | Files | Size (guess) |
|---|---|---|---|---|
| A1 | **The daily intake** | A topic with `style: 'rounds'` carries `rounds: {order: [[iid, n]…], perDay: 3, holdAt: 6}`. Progress carries `rounds: {on, since, met, day}`. When Today plans on a study day, it adds that day's new items for each course that is switched on (`puzzlesFrom` on the strand's guide, then `addPuzzles` due today). It does this lazily, at most once a study day, never on a day he does not open the app, and not while `holdAt` second looks of that course are waiting. It adds 2 on a Light day. New items are placed in the first half of the session. The course page gets: Start ("About five minutes a day"), Pause, "Met 18 of 48", per strand "Do this strand now" and "Read it through". The Library row gets "3 new". | 60-today.js, 71-topic.js, 77-library.js, tests | M, 0.6 to 0.8M |
| A2 | **Card upgrades** | `puzzleSpec` copies `first`. An example page may carry `pre` (an SVG), drawn as an image above the question (the way the solved picture is drawn now, but before the answer). On a card's first meeting (`reps` 0) it gets a teal "New" label and the `first` note in place of `why`. The two foot buttons **Sure** and **Not sure** replace Check on items with `conf`. Grades: right and sure as today (Good or Easy); right and not sure, Hard; wrong, Again. `conf` is saved in the history entry. | 41-cards.js, 60-today.js, 40-fsrs untouched | S, 0.3 to 0.5M |
| A3 | **One more go** | A card answered wrong in a session joins the end of the queue once ("One more go"). Its schedule comes only from the first answer. The second is recorded as `practice: true` and does not move FSRS. | 60-today.js session runner | S, 0.2 to 0.3M |
| A4 | **The read-through for a strand** | Each example page shows `pre`, question, answer, note and `svg`. Items not yet met fold under "Not met yet (5)" and open on a tap, so reading ahead is his choice. | 53-read.js | S, 0.15 to 0.25M |
| A5 | "Try it on the bench" | A link on the reveal to the course's bench lesson | 41-cards.js | XS, about 0.05M |
| | **Total** | | | **about 1.3 to 1.9M** |

**Not needed:** the kit steps engine (`platform.md` 3.1, L), the live Claude turn (3.2, M), the fault
sandbox (3.4, L), a new card type, a new sandbox message, or any change to FSRS. Model-written text
stays out of `innerHTML`: items are drawn with `U.h` and `U.rich`, and stills are SVG `data:` images
(no script runs), as guide stills are now.

**Docs to update with it:** ARCHITECTURE.md section 4 (guide example pages get `pre` and `first`, as
guide version 4; older readers ignore them), section 8 (the intake, and the second answer of "One
more go"), and RUNBOOK.md (a "Daily Rounds course" section).

**A fallback if the app work has to wait.** The same `items.json` can be assembled as an ordinary
ready-made course: 4 short strand "lessons", each played by one shared generated deck page (built
once, about 0.3M), with puzzles spread from the next day as today. That tests the build style and
the item format, but not the daily drip. So it is a fallback, not the test. Nothing built for the
pilot is wasted if Dan dislikes the drip: the items are ordinary puzzles and read-throughs either
way.

---

## 4. The pilot: Transformers

### 4.1 Why this course

- **It is on his shelf and it is unbuilt** (Electrical principles, "Turns ratios, losses, efficiency
  and regulation, and three-phase transformer connections", `tid: null`). No standing instruction is
  against it. It is not Inspection and testing, Building Regs or an amendments course.
- **It tests the style, not the content.** It is clean physics. Every number is computed from a
  shown rule, so the fact-check is cheap and a good or bad result will be about the learning style,
  not about thin sources. The inventory rates it the lowest-risk candidate.
- **It is partly known ground**, which is exactly where Daily Rounds should beat a lesson. His NVQ,
  BTEC and Level 4 cover the basics. A lesson would re-teach them or skip them blind. Items let him
  prove each one in ten seconds and move on. That is the expertise-reversal finding put to work.
- **It has many look-alike pairs** (iron and copper loss, CT and VT, star and delta, isolating and
  auto), which is where interleaving helps most.
- **It serves the Navy path.** CTs and VTs feed every switchboard meter and protection relay.
  Transformers step ships' supplies down for lighting and small power. Strand 4's isolation item
  leads straight into the insulated-neutral idea of Earth faults at sea. It also builds on AC
  circuits lessons 4, 8 and 10 without repeating them.
- **Size:** 4 strands of 12. About 3 to 4 weeks at five minutes a day.

**Why not the others for this style.** Fault-finding wants whole problems, not 40-second items.
Generators and the switchboard is new ground, where the research says guidance comes first, and it
suits a simulator. **Earth faults at sea** suits this style well: his shore habits would produce
confident wrong predictions, which is the hypercorrection effect at its best. It is the natural
second Daily Rounds course, and it would reuse the meter, lamp row and one-line parts. It is also
another design's pilot, so running Transformers here lets the two styles be compared on
neighbouring content.

**Sources.** Public, and permitted under their licences. These are leads found while writing this,
**not checked quotes**. The research stage checks each one word for word:
- Kuphaldt, *Lessons in Electric Circuits* Vol. II, chapter 9, "Transformers"
  (https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_9.html): basic operation, step-up and
  step-down, electrical isolation, winding configurations, voltage regulation, special transformers.
  AC circuits' brief already names it as this course's source.
- OpenStax *University Physics* Vol. 2, 15.6 Transformers.
- Bird, transformers chapter (named in AC circuits' brief).
- For CT safety, manufacturers' instructions: Schneider Electric's CT installation FAQ ("Do NOT
  open-circuit the CT secondary while primary current is flowing"), Eaton switchgear manual, Janitza.
- For losses and %Z, textbook-level sources to be found. The web leads seen so far are calculator
  sites, so the research stage should prefer a textbook, an IEEE source or BS EN 60076.
- Dan's own BS 7671 pages for the known-ground site transformer item, if they are in his materials.
  Otherwise that item is sourced publicly.

No screen claims how the Royal Navy does anything.

### 4.2 The strands (the "lesson list")

| Strand | Title | Items (12 each, including one say-it-back) | Opens in the drip |
|---|---|---|---|
| s1 | **Two coils on a core** | What carries the energy across; DC gives one flick; volts per turn; current goes the other way; thick or thin wire; your site transformer (known ground); touch one pin (isolation); current with nothing connected; step it up; spot the slip; double the turns; say it back | Day 1 |
| s2 | **Where the power goes** | Where the heat is made (map); the loss that is there at no load; half load means a quarter of the copper loss; efficiency from losses (example: 10 kVA, iron 100 W, copper 250 W gives 96.6%); where efficiency peaks; at what load (iron 100 W, copper 400 W at full load gives 50%); lightly loaded all night, which loss (which is it?); voltage drops on load, and the leading power factor exception (taught as such); %Z and fault current (100 A at 5% gives 2,000 A, a bridge to his prospective fault current work); 4% or 8% (which lets more through); spot the slip ("400 W at full load, so 200 W at half"); say it back (why light load still wastes energy) | Day 3 |
| s3 | **Three-phase transformers** | Which side gives a neutral (map); delta primary on 6,600 V, what each winding sees; star secondary 440 V, each winding 254 V (known ground, from his trigonometry ship puzzle); a Dy line voltage (254 × √3 gives 440 V); in step or shifted 30°; Dyn11 as a clock; the letters D, y, n; paralleling Dyn11 with Dyn1 (do not); which side feeds 400 V and 230 V loads; spot the slip (× √3 instead of ÷); full-load current of 500 kVA at 440 V (656 A); say it back (why vector groups must match) | Day 5 |
| s4 | **Transformers on the switchboard** | A thin-wired ammeter reading 600 A (map: a CT); CT 800/5 with 600 A on the bar gives 3.75 A; the meter removed with the secondary open (safety, predict, confidence); why a shorted CT is safe; VT 3,300/110 reading 105 V means 3,150 V on the bar; never open or never short, CT and VT (which is it?); is an autotransformer's output isolated; where an autotransformer starts a motor (known ground, from Motors); an unearthed secondary with one fault to earth (the bridge to Earth faults at sea); spot the slip (a 400/5 CT read without dividing by 5: 200 A, not 1,000 A); say it back (why a CT's secondary is shorted before its meter is disconnected) | Day 7 |
| | **The bench** | One kit page: turns, supply, AC or DC, load. Readouts of Vs, Is and Ip, the loss bars and an efficiency curve. Three challenges: make 110 V from 440 V; find the load where efficiency peaks; see what DC does. | Linked from day 1 |
| | **Final round** | Three held-back transfer items, one each from s2, s3 and s4, in situations he has not seen | About day 28 |

All example values are labelled on the picture as example values. Every computed answer above was
worked by hand for this plan, and is computed again by the script and the fact-checker.

### 4.3 Strand 1, item by item

Each item: its picture before and after, the words exactly as he would read them (word counts in
brackets), the rule behind every number, and its source status. "To be sourced" means the claim is
standard physics we expect to quote from the leads above. None of these words has been fact-checked
yet.

**s1-1 · What carries it across** · map · pick · day 1
- *Before:* an iron ring core. On the left a coil marked "440 V in", on the right a coil marked
  "110 V out". The space between the coils is drawn plainly. No flux is shown.
- *Asks (18):* "The two windings are not wired to each other. What carries the energy from one to
  the other?"
- *Options:* Magnetic flux in the iron core · Current through the core · Heat from the primary.
  *Answer:* Magnetic flux in the iron core.
- *After:* the flux drawn as arrows round the core, labelled "flux", and a small tag "no wire
  between the windings".
- *First note (46):* "The primary's alternating current sets up a flux that runs round the iron
  core. The flux passes through the secondary and induces a voltage in it. No wire joins the two
  windings. That gap is what lets a transformer keep one circuit apart from another."
- *Later note (13):* "Flux in the core links the two windings. Nothing else joins them."
- *Slips:* "Current through the core": "The core is built to carry flux. Any current in it is wasted
  as heat, which is why it is made of thin layers." (This plants s2's iron loss.) "Heat from the
  primary": "Heat is what gets lost, not what carries the energy."
- *Source:* to be sourced (Kuphaldt 9.1, OpenStax 15.6).

**s1-2 · Only change counts** · predict · pick · confidence · day 1
- *Before:* the same core. The primary goes through an open switch to a 12 V battery, and the
  secondary goes to a small lamp.
- *Asks (13):* "You close the switch and leave it closed. What does the lamp do?"
- *Options:* Stays lit · Flicks once, then stays dark · Never lights. *Answer:* Flicks once, then
  stays dark.
- *After:* the switch closed, the flux arrow labelled "steady", the lamp dark, and beside it a tiny
  trace with one blip at switch-on.
- *First note (46):* "The secondary only feels the core's flux when it changes. Closing the switch
  builds the flux, so the lamp flicks. Then the current settles, the flux stops changing and the
  secondary gets nothing. AC changes all the time, so it feeds the secondary all the time."
- *Later note (27):* "Only a changing flux induces a voltage. DC builds the flux once and then holds
  it, so the secondary sees one blip at switch-on and nothing after."
- *Slips:* "Stays lit": "That needs the flux to keep changing. With DC it stops changing once the
  current settles." "Never lights": "The flux does change once, while it builds. That is the flick."
- *Source:* to be sourced (Faraday's law: Kuphaldt 9.1, OpenStax 15.6).

**s1-3 · Volts per turn** · number · typed · day 1
- *Before:* the primary labelled "440 V, 1,200 turns", the secondary "300 turns", a voltmeter
  showing "? V", and a small teal tag "Example values".
- *Asks (19):* "The primary has 1,200 turns on 440 V. The secondary has 300 turns. What voltage does
  the secondary give?"
- *Answer:* 110 V. *Rule:* Vs = Vp × Ns ÷ Np = 440 × 300 ÷ 1,200.
- *After:* the meter reads 110 V, with the working line under the drawing.
- *First note (35):* "Every turn on the core carries the same volts. Here that is 440 ÷ 1,200,
  about 0.37 V a turn. The secondary's 300 turns at that rate give 110 V. Fewer turns, fewer volts."
- *Later note (9):* "Volts follow turns: 440 × 300 ÷ 1,200 = 110 V."
- *Source:* to be sourced (Kuphaldt 9.2). The numbers are example values, computed.

**s1-4 · Volts down, current up** · predict · pick (typed on later looks, as the app does now) · day 2
- *Before:* the same transformer. A load on the 110 V side marked "20 A", and an ammeter on the
  440 V side showing "?".
- *Asks (18):* "That transformer's 110 V side feeds a 20 A load. Roughly what current does the 440 V
  side draw?"
- *Options:* 80 A · 20 A · 5 A · 0.5 A. *Answer:* 5 A. *Rule:* 110 × 20 = 2,200 VA; 2,200 ÷ 440 = 5 A
  (ideal transformer).
- *After:* the primary ammeter reads 5 A, with two equal "2,200 VA" tags, one on each side.
- *First note (42):* "Leave aside the small losses and the power in equals the power out. The load
  takes 110 × 20 = 2,200 VA. At 440 V that needs 2,200 ÷ 440 = 5 A. Volts went down four times, so
  current comes up four times."
- *Slips:* 80 A: "That is the ratio turned upside down. The high-voltage side always carries the
  smaller current." 20 A: "Current changes through a transformer too, the opposite way to the
  volts." 0.5 A: "Check the division. 2,200 ÷ 440 is 5."
- *Source:* to be sourced (Kuphaldt 9.2).

**s1-5 · Thick or thin** · predict · pick · day 3
- *Before:* a cutaway of the two windings, drawn the same thickness, marked "440 V" and "110 V".
- *Asks (20):* "A step-down transformer has a 440 V winding and a 110 V winding. Which one is wound
  with the thicker wire?"
- *Options:* The 440 V winding · The 110 V winding · Both the same. *Answer:* The 110 V winding.
- *After:* the 110 V winding redrawn thick with few turns, the 440 V winding thin with many turns,
  and current tags "5 A" and "20 A".
- *First note (46):* "The 110 V winding carries four times the current. Heat in a wire goes with the
  square of the current, so it needs far more copper to stay cool. Few turns of thick wire on the low
  side. Many turns of thin wire on the high side."
- *Source:* to be sourced (Kuphaldt 9.2), and I²R from AC circuits.

**s1-6 · Your site transformer** · known ground · typed · day 2
- *Before:* a 110 V secondary winding with its middle tapped to an earth symbol, output lines L1 and
  L2, and "? V to earth" on each.
- *Asks (19):* "A 110 V site transformer has its secondary centre-tapped to earth. What is the most
  voltage to earth from either output line?"
- *Answer:* 55 V. *Rule:* 110 ÷ 2.
- *After:* both lines tagged "55 V to earth", and "110 V between them".
- *First note (45):* "You know the rule. The transformer is what makes it work. Its secondary is a
  separate winding, so you can earth it wherever you choose. Earthing the middle splits the 110 V
  into two halves, so neither line is more than 55 V from earth."
- *Source:* BS 7671, the reduced low voltage system, from Dan's own pages if they are in his
  materials. Otherwise to be sourced. Answered right and sure, it goes out for weeks.

**s1-7 · Touch one pin** · predict · pick · confidence · **safety** · contested detail · day 3
- *Before:* a 1:1 isolating transformer feeding a socket, the secondary marked "not earthed", a hand
  at one output pin, and feet on a steel deck. Tagged "Example: 230 V".
- *Asks (24):* "A 1:1 isolating transformer feeds a socket. Its secondary is earthed nowhere.
  Standing on a steel deck, you touch one output pin. What happens?"
- *Options:* A full 230 V shock · Almost no current flows · You get half, 115 V. *Answer:* Almost no
  current flows.
- *After:* a dashed line from the deck back to the secondary labelled "no way back", and a red tag
  "Both pins: the full voltage is across you".
- *First note (49):* "Nothing joins the secondary to the deck, so current through you has no way
  back to the winding. That is what isolation buys. It is not leave to work live. Touch both pins and
  you are the load. A long cable can also leak a little through its capacitance."
- *Source:* to be sourced (Kuphaldt 9.3 "Electrical isolation"; BS 7671 electrical separation). The
  fact-checker reads this item twice. The capacitance point is taught as a limit, not hidden.

**s1-8 · Current with nothing connected** · pick · day 2
- *Before:* the primary on 440 V, the secondary open, and an ammeter on the primary showing a small
  reading (drawn as "small", with no number).
- *Asks (18):* "Nothing is connected to the secondary, yet the primary still draws a small current.
  What is that current doing?"
- *Options:* Magnetising the core · Charging the secondary · Nothing, the meter is wrong. *Answer:*
  Magnetising the core.
- *After:* the flux drawn in the core with the tag "no-load current sets this up".
- *First note (41):* "The primary is a coil on iron. It needs a small current to set up the flux,
  and a little more to cover the core's own losses. That no-load current flows whenever the
  transformer is switched on, loaded or not."
- *Source:* to be sourced (Kuphaldt 9.1). It is the bridge to s2-2.

**s1-9 · Step it up** · number · typed · day 4
- *Asks (18):* "A transformer has 15 secondary turns for every primary turn. Fed with 440 V, what does
  the secondary give?"
- *Answer:* 6,600 V. *Rule:* 440 × 15.
- *Before / after:* a ratio tag "1 : 15" and a meter at "?" / at 6,600 V, with the current tag
  shrinking.
- *First note (23):* "Fifteen times the turns gives fifteen times the volts: 440 × 15 = 6,600 V. The
  current goes the other way, fifteen times smaller."
- *Source:* computed from s1-3's rule. Example values.

**s1-10 · Spot the slip** · pick · day 5
- *Before:* a notepad drawing: "440/110 V transformer, 20 A load. Primary current = 20 × 440 ÷ 110 =
  80 A".
- *Asks (15):* "A new hand works out the primary current. Which part of the working is wrong?"
- *Options:* The ratio is upside down · He left out √3 · Nothing, 80 A is right. *Answer:* The ratio
  is upside down.
- *After:* the line corrected to "20 × 110 ÷ 440 = 5 A", with the slip struck through in red.
- *First note (29):* "The high-voltage side always carries the smaller current. It should be
  20 × 110 ÷ 440 = 5 A. A quick sense check catches it: more volts, fewer amps."
- *Source:* computed. It is placed three days after s1-4 on purpose, so it works as spaced
  retrieval.

**s1-11 · Double the turns** · predict · pick · confidence · day 6
- *Before:* a secondary feeding a heater, with a tag "turns × 2" and power and current readouts
  hidden.
- *Asks (16):* "You double the secondary turns. The same heater stays connected. What happens to the
  heater's power?"
- *Options:* It doubles · Four times · No change · It halves. *Answer:* Four times.
- *After:* a power bar four times as high, the secondary current doubled and the primary current four
  times as high.
- *First note (40):* "Twice the turns gives twice the volts. The heater's current doubles too,
  because its resistance is the same. Power is volts times amps, so it goes up four times. The
  primary has to supply all of it."
- *Rule:* P = V² ÷ R, with V × 2. *Source:* computed from the rule.
- *Why it is here:* "It doubles" is the likely confident wrong answer, so this is the item most likely
  to show the hypercorrection effect.

**s1-12 · Say it back** · written, marked by Claude · day 6
- *Asks:* "Explain to a new hand on your section why the low-voltage winding of a step-down
  transformer is wound with thicker wire."
- *Points (need 2 of 3):*
  - Fewer turns give the lower voltage.
  - Power in is about power out, so the low-voltage side carries more current.
  - More current heats a wire more, by I squared R, so it needs more copper.
- *Model answer (52):* "The low-voltage winding has fewer turns, which is what drops the voltage.
  The power going in and out is about the same, so the low side has to carry more current. More
  current means more heating in the wire, so it is wound in thicker copper to stay cool."
- When Claude cannot be reached, the points become a checklist he ticks, as written cards work now.

**Keep this · Two coils on a core** (the first page of the strand's read-through and its Book
chapter)
- *For:* working out what a transformer gives and what it draws.
- *Rule:* volts follow turns, Vs ÷ Vp = Ns ÷ Np. Current goes the other way. Power in is about power
  out.
- *Traps:*
  - The ratio upside down: the high-voltage side carries the smaller current.
  - DC gives one flick at switch-on, then nothing.
  - Isolation stops a one-pin shock, not a two-pin one.
- *Figures:* example 440/110 V and 2.2 kVA: 5 A and 20 A. A 110 V site supply, centre-tapped: 55 V
  to earth.
- *Where it lives:* ships' and site supplies, switchboard instruments (s4), motor starters (s4).

### 4.4 The first week's drip

| Day | New (3) | Second looks (FSRS, about) | Strands open |
|---|---|---|---|
| 1 | s1-1, s1-2, s1-3 | none | s1 |
| 2 | s1-4, s1-6, s1-8 | the 3 from day 1 | s1 |
| 3 | s1-5, s2-1, s1-7 | day 2's 3, plus any Again | s1, s2 |
| 4 | s2-2, s1-9, s2-3 | day 3's 3, and day 1's coming back | s1, s2 |
| 5 | s1-10, s2-5, s3-1 | about 4 | s1, s2, s3 |
| 6 | s1-11, s2-4, s1-12 | about 5 | s1, s2, s3 |
| 7 | s3-2, s2-7, s4-1 | about 5 | all four |

At steady state, three new a day with FSRS second looks gives about 4 to 6 looks a day from this
course, which is about five minutes. The `holdAt` rule stops it growing past that. Day 7 is also
when we ask Dan one question in chat: "Keep it as it is, faster, slower, or stop?"

### 4.5 "Just read" for a strand

"Read it through" on strand 1 opens on its Keep this card. Then each item he has met follows as one
block: the after picture, the question, "Answer: 5 A", and the note. Then come the say-it-back
question and its model answer. Items not met yet sit folded under "Not met yet (5)". Opening them is
his choice, and the fold says plainly that reading them first spoils the guess. Reading makes no
cards and does not move the drip, as reading works today. The Book chapter is the same pages. This
is the reference he looks things up in at work: short, picture first, nothing to answer.

### 4.6 The bench (the interactive)

One kit page, built by today's build stage with `attempt.mjs`, at most three attempts. It uses the
same core-and-coils and loss parts as the stills.
- **Controls:** turns on each side, supply voltage, AC or DC, load.
- **Readouts:** Vs, Is and Ip, iron and copper loss bars, and an efficiency curve with the operating
  point marked.
- **Challenges:** make 110 V from 440 V; find the load where efficiency peaks; see what DC does.

It is a normal ready-made lesson in the course path ("The transformer bench"), so it gets a
read-through and puzzles the usual way. Strands 3 and 4 are taught with stills only. They would earn
a bench of their own only if the review finds a still that cannot teach the idea.

### 4.7 Build order, gates and cost

1. App work A1 to A5, plus the scripts (2.5). Unit tests, and e2e on the stub. About 1.9 to 2.7M.
2. Brief and item plan. Dan's yes on the strands, three a day, and Transformers as the pilot.
3. Research, the writer (all 48 items), the drawing parts.
4. Fact-check, review and fix on **strand 1 only**, then publish strand 1 with the intake off. Dan
   takes it as "Do this strand now" on his phone and says what he thinks of the words, pictures and
   pace. **Stop rule: if the run has passed 2.6M of course tokens at this gate, stop and look before
   going on.**
5. Fact-check, review and fix on strands 2 to 4, the bench, and assemble. Publish, then Dan presses
   Start. Strand 2 is not needed until day 3 and strand 4 not until day 7, so if a pause is needed it
   can fall inside the drip.
6. Report tokens by stage against `build-process.md`'s figures and against this plan.

### 4.8 How we judge whether the test worked

Decided now, before the data, so the result is not read to suit.

**What Dan does and says**
- He opens a round on at least 10 of the first 14 days without a reminder.
- At day 7 he picks "keep it as it is" or "faster". If he picks "stop", we stop and use the
  fallback.
- At about day 28 he asks for the next course in this style, or says which parts to keep.
- Watch for "too bitty", "too slow" or "I'd rather sit a lesson". Each one has a ready answer: more
  map items, a higher `perDay`, or "Do this strand now".

**What the app already records** (cards `hist` with time, grade and right or wrong, plus the new
`conf`; `profile.days` with study minutes; `progress.rounds`). It is read by the operator's session
through ArtifactData, read only. It needs no app code.

| Measure | Target |
|---|---|
| Right at first meeting | 60 to 75%. Higher means the items are too easy, lower means too hard. |
| Right at the second look | at least 80% |
| Week-one items right at about day 30 | at least 75% |
| Confident misses at first meeting that are right at the next look (hypercorrection) | at least 70% |
| Say-it-back marked "Got it" | at least 3 of 4 |
| Final round, three new transfer items | at least 2 of 3 |
| Median minutes on a round day | at most 6 |
| "This looks wrong" reports | none on facts |
| Build tokens, course only | at most 3.4M, with the one-off reported apart |

**A rough comparison, honestly labelled.** Second-look accuracy of Design and verification and Motors
puzzles, which use the same card machinery and the same app. The content and his prior knowledge
differ, and there is one learner, so this gives signals, not proof.

---

## 5. Risks, and how to keep them small

| Risk | How to keep it small |
|---|---|
| **It feels bitty.** Items do not add up to understanding (spacing does not help concept learning, per the research). | A map item opens each strand. Keep this cards, the strand read-through and one say-it-back a strand. The reviewer scores "does the strand add up". Ask him on day 7. |
| **Too slow.** He wants the whole course now. | "3 more new ones", "Do this strand now", and `perDay` can rise with one setting. |
| **Pile-up after a missed week.** | New items are added lazily, and none while 6 or more second looks are waiting. Existing second looks follow today's cap and Light day. |
| **First meetings that feel like being tested on things never taught.** | The "New" label and "Not sure" make a guess normal. Items are pitched one step from what he knows. The note teaches. No score is shown, ever. We watch the first-meeting accuracy band (60 to 75%). |
| **Trivia instead of understanding.** | The review's first score is "is this prediction worth making". At most one pure recall item a strand. "Spot the slip" and "which is it" are favoured. |
| **A wrong fact on 48 items at once** (one writer). | Fresh fact-check on the final words. Script recomputation of every calc. Quote-checked sources by id. Safety items read twice. Fix runs verify again. |
| **The before picture gives the answer away.** | The render check fails if the answer's value or label is visible before. The question must stand without the picture. |
| **The drawing parts take every attempt.** | At most three attempts per part, then fix the brief (Dan, 12 Oct). Parts are small pure functions, checked in Node before any page exists. |
| **Estimates run low again.** | The stop rule at the strand 1 gate (2.6M). Report tokens by stage. Most of the course's cost is up front, so the gate sees it early. |
| **The new app code misbehaves** (double grading, "One more go" moving the schedule). | Unit tests for the intake, the grades and practice saves. E2e on the stub. Lazy, once-a-day intake. Nothing in FSRS changes. |
| **Size limits.** | About 120 KB a strand guide, under the 250 KB limit. About 40 KB of cards. The topic's drip order is a few KB. |
| **Usage limit.** | The style uses Dan's Claude allowance only to mark say-it-back answers, about 4 to 8 a course. The build is about half a normal one per lesson-equivalent. |
| **It suits some subjects and not others.** | It is stated plainly: Daily Rounds is for principles, rules, behaviours and checks (Transformers, Earth faults at sea, keeping Design and verification alive). It is not for long design cases or whole-job fault-finding, which other styles serve better. |
| **Inspection and testing creeping in.** | The items teach the machine, not test procedures. The site transformer and isolation items use his BS 7671 knowledge as a bridge only. |

---

## 6. Questions for Dan before the pilot

1. Is a course that unfolds over three to four weeks, five minutes a day, something you would use,
   with "do a whole strand now" there when you have time?
2. Three new a day to start: too many, too few, or about right?
3. Transformers as the test, with Earth faults at sea next in the same style? Or the other way round?
4. Is it all right to have no lessons in the usual sense, just items, a flip-book to read, and one
   bench to play with?
