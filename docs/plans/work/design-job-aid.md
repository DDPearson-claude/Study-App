# Field kit: a course you use on the job, with the lesson folded underneath

One of five independent designs for Dan's 24 Oct request: "analyse what's left to build and tell me
what we should build next. I also want a new innovative build style and learning style for the next
one as a test." My angle is the point of work. Dan uses his courses as references on the job
("a reference for myself in the real world"; "just gives me what I need to know on each motor").
So in this design each course is first a field kit he can use in under a minute. The learning sits
underneath it for when he has time, and using the kit feeds his review.

Analysis only. Nothing in the repository was changed, and nothing was built or published. I read the
four reports beside this file, the Motors course (brief, lesson 2's final lesson and Keep this card,
`research.json` with its 495 checked quotes), his DOL handouts, the Drive listing, `ARCHITECTURE.md`
(data model, puzzles, guides, review, D4), and the parts of `32-sandbox.js`, `75-dossier.js` and
`77-library.js` the design touches. In this file "S" numbers are the `n` of a quote already kept in
`build/electrical/motors/research.json` (checked word for word by `sources.mjs`). "To be sourced"
marks a fact that the research stage must still find and check.

---

## 0. The short version

- **Key:** `job-aid`. **Style:** **Field kit**, "use it to learn it".
- **One line:** each course opens on a phone-ready field kit of look-up cards, checklists, fault
  trees and calculators. Short lessons teach the why behind each tool. Every time Dan uses a tool on
  a job, the matching question comes back in his review, so the use itself becomes the spaced practice.
- **Pilot:** **Motor and starter faults**, part 1 of the shelf's "Maintenance and fault-finding". It
  has four tools and four lessons: Won't start; Trips or runs hot; Hums, won't turn or runs backwards;
  Is the winding healthy? The fourth lesson is built only if he asks for it after using its tool.
  It builds on the live Motors course and reuses its checked research. It uses none of the
  inspection and testing handouts, so it does not touch the hold on that topic.
- **Why this pilot, not the inventory's wider "Fault-finding":** it is the same idea (rank 1), cut
  to the part that is (a) everywhere on a ship and ashore (his own DOL sheet says "Compressors, pumps
  and fans are typically controlled by DOL starters"), (b) largely researched already, since about 40 of the facts it needs are checked quotes in Motors' research, and (c) free
  of the I&T handouts the inventory had to ask about. Final circuits, RCD tripping and the S and Y
  plan cases become part 2, once Dan says those handouts may be used.
- **Cost, honestly:** the kit itself is about 1.1M tokens, and it is usable before any lesson exists.
  Each lesson is about 0.6M after that. All in, that is about 0.85 to 0.9M a lesson, against today's
  1.0M (refresher) to 1.65M (full process). The app work is about 2.0M, paid once and reused by every
  later course. Our estimates have run low before (Motors: 0.7M estimated, 1.05M measured), so we stop
  and report after the kit and after lesson 1. The real gain is value per token: a working tool after
  about 1.1M, and kits for the four live courses at about 0.4 to 0.6M each, with no new lessons.
- **How we judge it:** Dan opens the kit on three or more separate days in the first fortnight,
  outside a lesson. He tells us a tool helped on a real job, or asks for a kit for another course.
  He rates lesson 1 against a Motors lesson. Puzzles from the kit are recalled at least as well as
  Motors puzzles. The measured tokens stay within the limits above.

---

## 1. The learning style

### 1a. What a course looks like

The course page opens on the kit, and the lessons sit below it:

```
 Motor and starter faults
 ┌───────────────────────────────────────────┐
 │ ▌Before you open a starter    checklist  │   pinned; red edge (a safety line)
 └───────────────────────────────────────────┘
 ┌──────────────────┐ ┌──────────────────┐
 │ Won't start      │ │ Trips or         │      four tools, named by the symptom
 │ fault tree       │ │ runs hot         │      he meets, not by the theory
 └──────────────────┘ └──────────────────┘
 ┌──────────────────┐ ┌──────────────────┐
 │ Hums, won't turn │ │ Is the winding   │
 │ or runs backwards│ │ healthy? checker │
 └──────────────────┘ └──────────────────┘
 [ Look up in this kit … ]        [ Save the kit to my phone ]

 Learn the kit · 4 short lessons
   1 Won't start           12 min   ● done
   2 Trips or runs hot     12 min
   …
```

Every tool works from the first day, learned or not. A tool he has not learned yet carries one quiet
line under it ("Lesson: 12 min"). It is never a badge or a count.

### 1b. The four kinds of tool

The kit is data that the app draws (`U.h()` only, no model-written HTML), in four kinds. They are the
Keep this card grown into tools.

| Kind | What it is on the phone | Limits |
|---|---|---|
| **Card** | Rules, limits and figures, one per row, in big type. Each row has a one-line reason, and "Why?" opens the lesson screen that teaches it. | Row at most about 25 words |
| **Checklist** | Ordered steps with ticks, cleared when he leaves. Each step has its why behind a tap. | 3 to 8 steps |
| **Fault tree** | One question a screen with two to four full-width answers. A trail at the top shows his path so far ("Contactor: nothing → Overload: not tripped →"). Back is always there, and any earlier step can be tapped. Each leaf says the likely cause, the test that proves it, the fix, and what to check next. "None of these" opens Ask Claude with the trail as context, labelled as Claude talking, not the kit. | Node at most about 40 words; at most about 12 questions and 8 leaves, and a deeper tree links to another tool |
| **Calculator or reading checker** | Number fields with units, giving an answer worked from a rule shown beside it (rule line, then worked line). A checker gives a verdict against a cited limit, and a contested limit shows both versions. | Every input a control, every output computed, every limit cited or labelled as a practice value |

Each kind has a **"Test me first"** chip, off by default. With it on, the kit asks before it tells.
On a tree he bets on the cause before the leaf opens. On a card he says the figure before it shows.
On a calculator he types his estimate before the answer appears.

### 1c. Three kinds of session, screen by screen

**On the job (30 seconds to 3 minutes). Nothing to answer.**
1. In the Library he types "won't". A row for the **Won't start** tool in the Motor and starter faults
   kit sits above the lesson rows. He taps it. (Or: course page, then the tool tile.)
2. The tool opens on its pinned red-edged line, "Isolate and prove dead before any dead test", which
   opens the checklist when tapped. Below it is the first question in big type: "Press Start. What
   does the contactor do?", with four full-width answers.
3. He taps "Nothing". The trail grows and the next question shows: "Has the overload tripped?"
4. A leaf: **Likely** · **Prove it** · **Fix** · **Then**, each about 25 words, with "Why?" linking to
   lesson 1's screen on it.
5. At the foot are three quiet buttons: "Found it", "Not this one", "Still looking". "Not this one"
   goes back to the last split.

The app logs the tool, the path, the leaf, the mode and the day. Nothing else happens now.

**Learning a tool (10 to 12 minutes, once per tool).** This is the lesson, storyboarded in full in 4c:
- First-step check with "How sure?". If he is right and sure, he skips the explanation. This is the
  rapid first-step test from the expertise-reversal work.
- Cases walked on the real tool in "Test me first" mode, from two different branches.
- No more than three "why" screens, each a picture with at most 90 words, shown only where he
  missed or was unsure.
- One interactive that teaches: here, finding a break in his own DOL coil circuit by halving.
- Spot the apprentice's mistake.
- Explain it to a new hand on his section (Claude marks his answer against set points).
- Keep this: "Won't start is in your kit."

Both ways through stay: **Quiz me through** is the above. **Just read it through** shows every step
as a still. It walks the cases as a finished trail, shows the solved hunt, the corrected log and the
model answer, and ends on the tool itself with every "why" opened.

**Review (3 to 5 minutes, Today).** It is the existing puzzle box with one new row at the top, shown
only when there is something in it: "From your kit this week: 2 things you used. Try them without
it?" Those puzzles come first, then the usual mixed box. After each answer, the leaf or card he used
is shown as the worked-through picture, with "Open in kit". A miss comes back once more at the end of
the same session until he gets it right (successive relearning; a small optional change in section 3).

### 1d. Across a course

| When | What happens |
|---|---|
| Day 0 | The kit is published alone, with no lessons. He can use all four tools at once, and the pinned checklist is plain reference he already knows. |
| Week 1 | Lesson 1 when he has twelve minutes. Its puzzles go in the box from the next day. |
| Any day he uses a tool | The puzzle for that leaf or card moves to the next study day, once a week at most, so his next meeting with it is a recall rather than a re-read (1e and 3.2). |
| Weeks 2 to 4 | Lessons 2 and 3, and lesson 4 only if he asks for it after using its tool. |
| After | The kit stays as his reference. Review keeps it alive. A saved copy sits on his phone for places with no signal. |

### 1e. Why it should work (from `learning-research.md`)

- **Aid and training together.** Job aids improve performance on the job, and in one of the few
  direct comparisons, training plus an aid gave almost double the gain of either alone (§11, moderate,
  dated). Finding information often takes about 20% of a maintenance technician's time (§11). So the kit
  comes first, and the lessons are what make the kit more than a crutch.
- **Aids alone do not cover complex fault-finding** (§11: fully step-by-step aids did not, and
  experienced troubleshooters may reject rigid procedures). So the trees say *where to look first and
  why*, not "do step 7". Every branch has its reason, any step can be skipped, and "None of these" is
  always there. The lessons teach the reasoning.
- **Structured troubleshooting** (§6: a general strategy plus a layered breakdown of the system gave
  twice as many faults solved in less time). Each tree starts with the cheapest test that splits the
  system (the contactor: coil side or power side), then narrows down. Novices lost track of where
  they were (§6), so the trail is always on screen. **Medium fidelity** transferred best (§6), so the
  lesson's interactive is a schematic that behaves correctly, not a photo of a panel.
- **Expertise reversal** (§4): worked explanations can hurt someone who already knows the material,
  and a rapid first-step test predicts expertise well. Each lesson opens with one, and right-and-sure
  skips the explanation. Dan is an electrician of long standing, so this matters more for him than
  for most learners.
- **Predict, with confidence** (§5: prequestions g = 0.54 for the questioned material; confident
  errors are the ones most often corrected). "Test me first" and the lesson's case walks ask before
  they tell, and every prediction carries "Sure / Not sure".
- **Vicarious failure** (§5: studying someone else's failed attempt gave the same conceptual gains as
  failing yourself). Hence the apprentice's log. **Productive failure does not help procedures** (§5),
  so isolation is a told checklist, never a puzzle to discover.
- **Retrieval, spaced, until right** (§2: recall beats re-reading; successive relearning is the
  strongest form). Review is recall. Items he needed on the job come back next day as a recall.
- **Use slows forgetting** (§12: cognitive and procedural skills decay with non-use, and chances to
  perform in between showed a trend toward less decay, though not a significant one). The kit makes those chances easy, and the
  "Test me first" chip turns them into reps.
- **Less text, on the picture** (§9: split attention g = 0.63; for experts, the diagram alone with the
  explanation on a tap). Tree nodes stay under about 40 words, and the "why" sits behind a tap.
- **Mixed choosing** (§3: interleave where the skill is choosing). Review mixes leaves across the four
  tools, because the job is choosing which fault it is.

**What the evidence does not show.** Nothing in the report says that looking something up is
practice. A look-up is reading, not recall. So this design never counts a look-up as a review. A
look-up only moves the matching recall closer, and only a recall counts. "Quiz me / just read" is
offered as Dan's preference, not as a learning-style match (§13).

### 1f. How it keeps Dan's rules

| Rule (CLAUDE.md, his feedback) | How the field kit keeps it |
|---|---|
| Plain own words, no narrated sources (20 Oct) | Every kit item carries its source ids as data, never as words. A lint blocks "your slides", "(p.", "one site" and the like. One writer writes the whole kit in one voice. |
| Faithful: numbers are controls, computed from a shown rule, or cited | Calculators show the rule line next to every answer. Checkers show the cited limit. A contested limit (motor insulation minimums, lesson 4) shows both versions and says why they differ. Example values are named once as examples. |
| At most about 90 words a screen (21 Oct) | Tree nodes about 40, card rows about 25, why screens 90, all counted by the validator, not by a reviewer. |
| Calm reading, colour only for meaning | Tools are white cards outlined in `--edge` (things he acts on). Reading panels use `--sunk`. The trail is in `--mono`. Red only on safety lines and warnings. Amber for key terms and the "used this week" row. Green only for "Found it" and a finished lesson. Teal for small labels. |
| Light by default; dark and text size in settings | The kit is drawn in the app's own tokens, so both themes and XL text come free, and the self-test checks them. |
| Phone first (360 px), desktop equally good | One question a screen, full-width 44 px answers, a decimal keypad for calculators. From 860 px the tree sits beside its why panel. |
| Nothing in the way; no guilt | The kit asks nothing unless "Test me first" is on. A look-up never says "you should have known". The review row is optional, worded as an offer, and drawn only when it has something in it. |
| Two ways through | The lessons keep "Quiz me through" and "Just read it through". The kit has the same choice in small: plain use, or "Test me first". |
| Not a job card (Dan, of Design and verification) | The kit is a reference with reasons, which Dan asked for ("a reference for myself in the real world"). It is not a lesson that marches him through steps. The platform report makes the same distinction (3.10). |
| Never re-teach what he holds | Safe isolation is a pinned checklist with no lesson. The lessons pitch at the judgement above his NVQ: why a contactor chatters, what 173% in two lines means, why two motor insulation minimums disagree. |

### 1g. What it improves on today

1. **Keep this stops being a dead end.** Today it is a lesson's last screen and a tile deep in the
   Book. Here it is the front door, and it can be used on a ladder in thirty seconds.
2. **Lessons stop teaching what he knows.** The first-step check skips explanations he does not need.
3. **Review follows his real work.** Today's box is filled by what he finished. This one is also
   filled by what he needed on the job.
4. **Fewer words.** The kit carries the rules and figures, so lessons carry only the why and the
   practice. That fixes "a bit too much text after the diagrams" at its root.
5. **It works where there is no signal.** A saved copy of the kit stays on his phone.
6. **Judgement, not just rules.** No live course asks him to act in a situation. This one does, in a
   small way, and safely.

---

## 2. The build style: "kit first, lessons second"

### 2a. Stages, models and tokens

Dan's table (11 Oct) is kept unchanged. No stage needs a different model or effort, so none is
proposed. The one new check is a script, not an agent.

**Once per course (the kit):**

| Stage | Model, effort | What it does | Gate | Tokens (about) |
|---|---|---|---|---|
| Course brief | Opus high | One page. The jobs and symptoms he meets, the tool list named by symptom, a sketch of each tree, which lesson teaches which tool, and what is reused. Dan agrees it. | Dan's yes | 0.2M |
| Research | Sonnet high (quote checker) | **Reuse first:** cut the quotes the kit needs from Motors' `research.json` by id, never retyped. Then research only the named gaps (2c, 4d) once, in full. Per-tool packs are cut by id. | `sources.mjs` | 0.35M |
| Write the kit | Opus high | `kit.json`: tools as data (tree nodes, card rows, checklist steps, calculator rules in a small formula grammar with test values), each item tied to its source ids and to the lesson screen that teaches it. One writer, one voice, with the lint run in its loop. | `validate.mjs kit` (2b) | 0.2M |
| Fact-check the kit | Opus high, fresh | Every node, limit and rule against the sources. Every calculator recomputed from its test values. Every tree walked for one real fault per leaf. The order of tests checked for safety. **This reads the exact words Dan sees**, because the kit data is the only copy of them. | `validate.mjs verify --kit` | 0.12M |
| Review the kit | Opus xhigh, fresh | One contact sheet: every tool at 360 px, both themes, XL text, plus each tree's longest path. Teaching and safety in one pass, scored like a lesson. | scores of 4 or more | 0.12M |
| Fix, confirm | Opus high; Sonnet medium | As today. Confirm is mechanical when only lint or layout changed. | | 0.1M |
| **Publish the kit alone** | operator | Dan can use it on the job while the lessons are made. This is the cheap first look. | Dan's word | |
| | | | **Kit total** | **about 1.1M** |

**Per lesson (one per tool):**

| Stage | Model, effort | What it does | Tokens (about) |
|---|---|---|---|
| Write | Opus high | Screens as data that point at kit items by id: the first-step check, two cases (readings computed from the kit's rules), at most three why screens, the apprentice's log, the say-it-back points, and the brief for the one interactive. The rules and figures are not written again. | 0.10M |
| Fact-check | Opus high, fresh | Only what is new to the lesson: the cases, the whys, the log and the model answer. Kit items are already checked and cited by id. | 0.07M |
| Build | Opus xhigh, at most three attempts | The one teaching interactive, plus the walk on the tree through the kit's `K.tree`. Reuses the Motors lesson 2 DOL drawing as its base. | 0.20M |
| Review | Opus xhigh, fresh | As today, with the word counts already done by the lint. | 0.13M |
| Fix, confirm | Opus high; Sonnet medium | Smaller rounds. Confirm is mechanical when only lint or layout changed. | 0.10M |
| | | **Lesson total** | **about 0.6M** |

### 2b. The kit validator (`validate.mjs kit`, a script, no tokens)

It refuses a kit where:
- a tree path does not end in a leaf, a node has no way in, or a leaf lacks "likely / prove it / fix";
- a dead-test leaf can be reached without passing the isolation line, or a live test appears with no
  warning and no source (the HSG85 basis, to be sourced);
- a calculator's test values do not reproduce its worked example, or an output can be NaN;
- an item has no source id, unless it is labelled as an example or practice value;
- any text goes over its cap (node 40, row 25, why 90), names a source in the words, uses a semicolon
  chain or a mid-sentence bracket, or narrates "the course";
- the same answer position is right on every node of a lesson's cases;
- the kit document would pass 230 KB.

### 2c. What is reused

- **Across lessons:** the checked kit (rules, traps and figures written and checked once), the source
  pack, the DOL drawing, `K.tree`, and readings computed from the kit's own rules.
- **Across courses:** the kit page, the four renderers, the formula evaluator, the offline save,
  `K.tree`, the validator, and a tree pattern (observe, split, test, narrow, leaf) that suits any
  "it doesn't work" topic: Generators, Earthing at sea, Transformers, and Inspection and testing when
  Dan green-lights it.
- **From live courses:** Motors' 495 checked sources. Of the facts this pilot needs, about 40 are
  already kept (4d). Its lesson 2 drawing and its Keep this card are reused too.

### 2d. What stays, what goes, what is new

| Stays (must) | Goes | New |
|---|---|---|
| Quote checking word for word (`sources.mjs`, harvested tool calls) | Per-lesson research top-up. The course is researched once, gaps only, after reuse. | The kit write, its validator, its fact-check and its phone review, once per course |
| A fresh fact-check, now on the exact words Dan sees | The separate plain edit. It merges into one writer per kit with the lint in the loop, and the fresh reviewer still reads every screen. | Publishing the kit before any lesson, as the first look |
| The 360 px self-test in both themes at XL; contact sheets | Writing a Keep this card per lesson. The kit tool is the Keep this. | A conditional last lesson, built only if Dan asks after using its tool |
| At most three attempts per interactive | Confirm by an agent when only lint or layout changed | |
| A fresh page review at xhigh | | |
| A pilot lesson Dan tries on his phone first; a token report | | |
| Guides, the read-through and puzzles from the guide | | |

### 2e. Tokens against today

| | Today, refresher (measured) | Today, full (measured) | Field kit (reasoned estimate) |
|---|---|---|---|
| Per lesson | about 1.0M | about 1.65M | about 0.6M |
| Kit, shared over 4 lessons | none | none | about 0.27M a lesson |
| **All in, per lesson** | **about 1.0M** | **about 1.65M** | **about 0.85 to 0.9M** |
| A kit for a live course, no lessons | | | about 0.4 to 0.6M |

The per-lesson saving is modest and not yet measured. It comes from three things: no research top-up
(about 0.15M), a smaller write and fact-check with no separate plain edit, because the rules are
written once (about 0.18M together), and smaller fix rounds (about 0.05M). The build and the review, the expensive stages, barely shrink,
and should not. If our usual under-estimate repeats (+30 to 50%), the field kit costs about the same
as today per lesson. The case for it is what Dan gets for the tokens: a reference he can use after
about 1.1M, and later kits for Motors, Design and verification and Subsea at about 0.4 to 0.6M each,
because their research and fact-checked Keep this cards already exist.

### 2f. Failure modes it removes, and ones it adds

**Removes or shrinks:**
- *Words in three places* for the reference half. The kit document is the one copy. Lessons point at
  it by id, so a lesson can no longer keep a figure the course has replaced (D&V i8's card did).
- *A number shown with no step behind it* (Motors i3 to i8). A calculator always prints its rule line.
- *Screens over 90 words, too many footnotes, narrated sources.* The lint counts them before any reader.
- *Research that only grows.* The pack is cut by id, and the gaps are named in the brief.
- *Read-through stills that fail* for the reference half. The kit is drawn by the app from data, so
  there are no stills to reverse-engineer. The offline copy is made from the same data.

**Adds, with the guard for each:**
- *A wrong tree acted on at work* is worse than a wrong lesson. Guards: the isolation line on every
  tree, enforced by the validator; a fresh fact-check of every path; leaves that say "prove it with a
  test before you replace anything"; no live-work step without its HSG85 basis (to be sourced); and
  one standing line on the kit that the ship's or site's own procedures and permits come first.
- *Two renderers of one tree* (the app's kit page and `K.tree` in lessons) drifting apart. Guard: one
  data shape with one validator, and the self-test renders a tree both ways.
- *Trees too rigid for an expert.* Guard: every step can be jumped, "None of these" is always
  there, and a reason sits behind every branch.
- *Trees growing too big.* Guard: caps of about 12 questions and 8 leaves, after which the tree links
  to another tool.

---

## 3. App work needed

The smallest set for an honest test. Sizes follow the platform report's scale: S about 0.3 to 0.6M,
M about 0.7 to 1.5M. They are guesses.

| # | Piece | What it does | Size |
|---|---|---|---|
| 3.1 | **Kit page** `#/kit/:tid` and the `topics/{tid}/kit/file` document | Draws card, checklist, tree and calculator from data with `U.h()`. Has search within the kit, the trail, "Why?" links to a lesson screen or read-through page, and a small formula evaluator (no `eval`: + − × ÷ ^ √, named inputs, one rounding, about 150 lines with tests). "None of these" opens Ask Claude with the trail. The topic page shows the kit above "Your path". This is the platform's 3.10 "on the job quick reference", grown to include trees and calculators. | M, about 1.0M |
| 3.2 | **Use log and "Test me first"** | A private `profile/kituse/{tid}` (newest 200 uses). A plain use moves the matching puzzle to the next study day, at most once a week per item, never pushing a card later, within the daily cap. "Test me first" on an item whose puzzle is due within three days counts as that review. Otherwise it is practice and saves nothing (the platform's rule). Adds Today's "From your kit this week" row. Puzzles gain a `kit` field naming their item, written by `guide.mjs`. | S, about 0.4M |
| 3.3 | **Save the kit to my phone** | A static HTML copy through `U.saveFile`, like the dossier's saved copy. Trees become nested `<details>`, checklists numbered lists, cards tables. Calculators become ready-reckoner tables computed at save time, with the rule printed. Dated, with one line to check the app for the latest. | S, about 0.3M |
| 3.4 | **`K.tree` in the lesson kit** | The case walk inside a lesson: predict, "Sure / Not sure", reveal, skip if right and sure. It writes a still of the finished trail for the read-through, and a pick puzzle for each case node. | S to M, about 0.5M |
| 3.5 | **Pipeline:** `validate.mjs kit`, `assemble.mjs` writing the kit document, Library look-up indexing tool and leaf names | The checks in 2b. The Library change is small: tools and leaves join the lesson rows already searched. | S, about 0.3M |
| | | **Total for the test** | **about 2.0M (1.6 to 2.6M)** |

Not needed for the test: a new card type (kit puzzles are ordinary `puzzle` cards), the steps engine
(the platform's 3.1, still worth doing later), live Claude turns inside a lesson (3.2 there), and
fresh-numbers calculator cards (3.7 there; a natural next step for calculators).

Optional and small (about 0.2M): **repeat a missed puzzle once at the end of the same session**, the
cheapest form of successive relearning.

**An even cheaper first probe, if Dan wants one (about 0.8M):** skip 3.1 to 3.3, 3.5 and the log,
and publish the kit as one more steps page in the course, using `K.tree` only. It tests whether he
reaches for a kit at all. It cannot log use, save offline, or feed review, so we would judge it only
by what he tells us. I would not start there, because the use-to-review loop is the new idea.

---

## 4. The pilot: Motor and starter faults

### 4a. Why this course

- **He would use it.** Pumps, fans and compressors on DOL starters are everywhere, ashore and at sea.
  A motor that won't start, trips or hums is a daily call. It is also work a leading hand directs and
  checks.
- **It follows on from what he valued.** Motors gives "what I need to know on each motor". This gives
  what to do when one won't go.
- **It is cheap to make faithful.** Motors' research already keeps about 40 checked quotes on exactly
  these faults (4d). His DOL study sheet and handouts are in the repo. His NVQ "Fault finding and
  rectification.pdf" slides (0.22 MB) and `hsg85.pdf` are in Drive for the research stage.
- **It respects his standing instructions.** No inspection and testing material, no Building
  Regulations, nothing about amendments. Lesson 4 reads motor insulation results against motor
  guidance, which goes beyond his BS 7671 testing awards. It does not teach the test procedure.
- **It is small and quick to judge.** Four tools, three or four lessons, and a verdict within two
  weeks of the kit going live.

### 4b. The kit and the lessons

| Tool | Kind | Built from (S = Motors research quote) | Lesson |
|---|---|---|---|
| **Before you open a starter** | Checklist, pinned | Isolate and prove all lines and the neutral dead (S258, S259). Prove the tester before and after (S260). Isolation must stop re-energising (S261). A contactor can hold line voltage with its coil off (S249). | None. He knows it. Recall only. |
| **Won't start** | Fault tree | Coil circuit parts (his DOL sheet). The holding contact across Start (S45, S52). Overload opens only the coil circuit (S56, S244). Won't reset until cooled (S243). Auto-reset motors can restart (S315). No-volt protection after a power cut (S51, S52, S53). Chatter causes (S248). Under 85% may not pull in (S238, S247). Open reads infinity, short reads zero (S312). Worn main contacts are the commonest cause of single-phasing (S34). | 1 |
| **Trips or runs hot** | Fault tree and calculators | Overload set to full-load current, holds at 1.05 ×, trips at 1.2 × (S236, S241). On a star-delta's line contactor, set to 0.58 × (S266). Single-phasing puts 173% in the two remaining lines (S227). Fuses do not protect against overload (S57). Restarting before it stops can double the peak (S239). Current imbalance %: definition to be sourced (NEMA MG 1). | 2 |
| **Hums, won't turn or runs backwards** | Fault tree | Single-phased at rest it hums and won't accelerate (S228, S229). A blown fuse or one open pole (S32). Reverse a three-phase motor by swapping two lines (S20). A single-phase motor that hums has lost its starting circuit (S338, S339). Capacitor checks (S141, S142, S364, S365, S368). Single-phase reversal through the start winding leads (S341). | 3 |
| **Is the winding healthy?** | Reading checker | Two insulation minimums that disagree: 1 MΩ plus 1 MΩ per kV (S230) against 5 MΩ up to 1,000 V (S232). Taught as contested: which IEEE 43 edition and which winding type, to be sourced from the standard's own summary (S436 names its scope). An IR test cannot prove a motor good (S37). Winding resistance balance: method from S400, threshold to be sourced and labelled as a practice value. Start against run winding resistance, compressor-specific (S342). | 4, only if he asks |

The supply is an input, never assumed: 400 V for shore work, and 440 V for a ship, which the AC
circuits research already quotes ("Ships' 440 V three-wire insulated neutral").

### 4c. Storyboard: the Won't start tool, then lesson 1

**The tool in the field (what lesson 1 teaches).** On-screen words are in quotes.

```
PINNED  "Isolate, lock off and prove dead before any dead test.
         Prove your tester before and after."                         S258 S259 S260
Q1  "Did it stop by itself, or will it not start when you press Start?"
    → "Stopped after a power cut"  LEAF "No-volt protection, working as it should.
       The coil dropped out and nothing restarts it until someone presses Start." S51 S52 S53
    → "Will not start"  Q2
Q2  "Press Start. What does the contactor do?"
    → "Nothing"                 Q3  (coil side)
    → "Buzzes or chatters"      LEAF chatter
    → "Pulls in, motor silent"  Q5  (power side)
    → "Runs only while Start is held"  LEAF "The latching contact is not making.
       It should keep the coil fed when Start springs back."          S45 S52
Q3  "Has the overload tripped?"
    → "Yes"  LEAF "Reset once it has cooled. Then find why it tripped
       before you hand it back: open Trips or runs hot.
       ⚠ A motor with an automatic reset can start at any time."      S243 S315; cause-first to be sourced
    → "No"   Q4
Q4  "Isolated and proved dead. Measure across the coil circuit, halving as you go."
    LEAVES: Stop open · Start not making · coil open (reads infinity) or shorted (reads zero) ·
            overload contact open · neutral link open                  S312
LEAF chatter  "Some voltage, but not enough or not steady. Below about 85% of its rating
       a contactor may not pull in. Check the coil's label against what is wired,
       and look for a loose control wire."                             S238 S247 S248
Q5  "Isolated. Check the main contacts, the overload's heaters and the motor's
     connections. A worn main contact can leave one line open."       S34 S249
    → "Motor hums when it's tried"  link: Hums, won't turn or runs backwards
TO BE SOURCED: a live-testing node ("Testing it live"), only on HSG85's basis and with its
warning (the HSG85 decision chart text is already in a harvested search,
build/electrical/subsea-cable-testing/tools/06-web_search.json, still to be checked).
```

**Lesson 1, "Won't start", quiz me through.** Eleven screens, about 12 minutes, or about 8 if he
skips. Every screen is within 90 words.

| # | Kind | On the phone | Words Dan reads (quoted) | Source |
|---|---|---|---|---|
| 1 | First-step check | His DOL drawing as a still. Four answers, then "Sure / Not sure". | "A fan on a DOL starter will not start. The isolator is on. You press Start and nothing happens. What do you do first?" Answers: "Watch the contactor while someone presses Start" · "Megger the motor" · "Fit a new coil" · "Check the cable to the motor". Slip hints: Megger, "That tests one part, and takes a while. One look can first tell you which half to test." New coil, "That swaps a part before any test has pointed at it." | His DOL sheet's drawing; S56, S244 |
| | Branch | Right and sure: "You know this. Skip to the fault hunt?", which goes to 4. Otherwise go to 2. | | |
| 2 | Why | The drawing split into two bands, teal labels "Coil side" and "Power side", the contactor where they meet. | "A DOL starter is two circuits that meet at the contactor. The coil side decides whether it pulls in. The power side carries the motor's current once it has. So watch the contactor as Start is pressed. It tells you which side to search. It costs one look, and no tool." | His DOL sheet; S56, S244 |
| 3 | Why | Three small contactor states: still, pulled in, chattering. | "If it pulls in, the coil side works. Search the power side and the motor. If it stays still, the fault is on the coil side. If it buzzes or chatters, the coil is getting something, but not enough." | S248 |
| 4 | Case A on the tree, "Test me first" | `K.tree` with its trail. Predict, then "Sure / Not sure", then the reveal. | "Case A. Press Start. The contactor does nothing. On the coil side, what do you check first?" Answers: "The overload" · "The Stop button" · "The coil" · "The Start button". After: "The overload is the part whose job is to open this circuit. It has no main contacts. It stops the motor only by opening the coil's circuit. You can usually see if it has tripped." | S56, S244; "trip shows on the relay" to be sourced from a relay data sheet |
| 5 | Case A, the reading | The trail grows. A red warning line under the reveal. | "The overload shows tripped. You press reset. It will not reset. Why not?" Answers: "It has to cool first" · "The reset is broken" · "The coil is open". After: "A thermal overload will not reset until it has cooled. It reset a few minutes later. Is the job done?" "No. It tripped for a reason. Find it before you hand the fan back." Warning: "A motor with an automatic reset can start again at any time." | S243, S315; "find the cause first" to be sourced (his NVQ fault-finding slides) |
| 6 | Case B, another branch | `K.tree` from Q2. | "Case B. Another day. The overload is set. Press Start: the contactor buzzes and chatters but will not close. What is the chatter telling you?" Answers: "The coil gets some voltage, but not enough or not steadily" · "The coil is open circuit" · "The motor is jammed". Slip hints: open, "An open coil carries no current, so it stays silent." Jammed, "The main contacts have not closed, so the motor has no supply yet." | S248 |
| 7 | Why, with a picture that moves | A bar for the voltage at a 230 V coil, with a line at 85%. A slider "Voltage at the coil". The readout says "pulls in" above the line and "may not pull in" below it. | "A contactor needs enough voltage to pull in firmly. Below about 85% of its coil's rating it may not close, and the coil can overheat. For a 230 V coil that line is 0.85 × 230 = 195.5 V. Check the coil's label against what is wired. A 230 V coil needs a phase and the neutral. A loose control wire can do the same." (about 65 words) | S238, S247, S248; his DOL sheet "230V contactor coil" and his handout on getting the coil voltage right |
| 8 | **The one interactive: Find the break** | His coil circuit as a chain of five parts: Stop, Start held in, coil, overload contact, neutral link. A padlock on the isolator and the pinned red line. One part is open, picked at random each go. He taps two test points to measure between them. A counter shows the tests used. | "Five parts, one of them open. Measure between any two points. A closed contact reads near zero. An open part reads infinity. Find it in as few tests as you can." After he finds it: "Part by part can take 4 tests. Halving what is left never takes more than 3: five parts, then three, then two, then one." | S312; S258 to S260; half-split method to be sourced (his NVQ slides, or a public method source). Readings come from a shown rule: infinity if any open part lies between the probes, otherwise the sum of what lies between. The coil is "an example coil, 120 Ω", named once. |
| 9 | Spot the mistake | An apprentice's log, four lines. Pick a line, then pick what is missing. | "An apprentice's log. Which step would you challenge first? 1. Pressed Start. Contactor did nothing. 2. Fitted a new coil. Still nothing. 3. Found the overload tripped. Reset it. 4. Fan ran. Signed it off." Answer: 2, "A part was changed before any test pointed at it." Then: "What is still missing at the end?" Answer: "Why the overload tripped." | Practice; "test before you replace" to be sourced (NVQ slides) |
| 10 | Say it back, to a new hand | `K.written`, marked by Claude against three points. One more go, then the model answer. Self-tick when Claude cannot be reached. | "A new hand on your section asks: 'Why look at the contactor before you get the meter out?' Tell them in two or three sentences." Points: splits the starter into coil side and power side · one look shows which, with no tool · then you test only that side. Need 2. Model: "The contactor sits between the two halves of the starter. If it pulls in, the coil side is fine and I look at the power side. If it doesn't, I stay on the coil side. One look halves the job before I touch a meter." | From screens 2 and 3 |
| 11 | Keep this | The tool tile, with the tree's first two questions as a still. | "Won't start is in your kit. Open it from the course page, or type 'won't start' in the Library. Next time you use it, try Test me first." Then, as today: "Its 6 puzzles go in your puzzle box, ready from tomorrow." | |

**Just read it through.** Screen 1 with its answer and why. Screens 2, 3 and 7 as stills, with the
bar at 195.5 V. Cases A and B as finished trails. One solved run of screen 8 as a log ("Between 1 and
4: infinity, so the break is in the first three. Between 1 and 2: near zero. Between 2 and 3:
infinity, so Start is not making."). The apprentice's log with line 2 marked and the missing line
added. The model answer. The tool, with its whys opened.

**Puzzles from lesson 1.** Six picks or typed answers from screens 1, 4, 5, 6, 7 and 9, and one
written card from screen 10. The typed one from screen 7 asks the same thing at another voltage: "A
400 V coil. Below what voltage may it not pull in?", answer 0.85 × 400 = 340 V. Each carries its kit
item, so using that leaf on a job brings it forward.

### 4d. Sources: what is reused, and what must still be found

- **Reused, already checked** (Motors `research.json`): S20, S32, S34, S37, S49 to S53, S56, S57,
  S227 to S230, S232, S236, S238, S239, S241, S243, S244, S247 to S249, S258 to S261, S266, S312,
  S315, S338, S339, S341, S342, S364, S365, S368, S400, S436, and S45 for the holding contact. That is
  about 40, enough for most of tools 1 to 3.
- **His own:** `dol-study-sheet` (the drawing and parts list, already locatable),
  `handouts/dol-starter-components.txt` and `dol-start-stop-buttons.txt` (in the repo). From Drive:
  "Fault finding and rectification.pdf" (NVQ slides, 0.22 MB) and `hsg85.pdf`.
- **To be sourced (the research stage's named gaps):** the HSG85 and EAWR regulation 14 basis for any
  live test (the decision chart's text is already in a harvested search, still to be checked); the
  half-split method and "test before you replace" (his NVQ slides first); trip indication on a
  thermal overload relay; the contactor operating band (85 to 110% of the rated control voltage, as
  IEC 60947-4-1 is usually summarised; S245 holds one maker's 0.85 to 1.1, so the general figure needs
  its own source); current imbalance % and any derating (NEMA MG 1); the IEEE 43 minimums by edition
  and winding type; IR temperature correction; a winding-balance threshold, which will be a practice
  value. That is about eight gaps, and the reason research is 0.35M rather than 0.6M.
- **No Navy material is held.** Nothing in the kit claims how the Royal Navy does it.

### 4e. Order of work and cost

| Step | Tokens (about) | Dan's part |
|---|---|---|
| 1. App work (3.1 to 3.5) | 2.0M | none |
| 2. Brief, research, kit, fact-check, review | 1.1M | agrees the one-page brief; then uses the kit for about a week |
| 3. Lesson 1 | 0.6M | tries it on his phone: better, same or worse than a Motors lesson? |
| 4. Lessons 2 and 3 | 1.2M | |
| 5. Lesson 4, only if he asks after using its checker | 0.6M | his call |
| **Course** | **2.9 to 3.5M** | |
| **With the one-off app work** | **4.9 to 5.5M** | |

This is close to the inventory's 5.0M for the wider Fault-finding course, but the app work is paid
once, and Dan has a working tool after step 2. Report each step's measured tokens against these
figures, and stop after step 3 if the lesson is over 0.8M or the kit over 1.4M.

### 4f. How we judge whether the test worked

**What Dan says or does:**
- He uses the kit on the job without being asked, and tells us so: "I used the won't-start tree on a
  vent fan." This is the main signal.
- He asks for a kit for another course (Motors, Design and verification, Subsea).
- On lesson 1 he says it is better than or as good as a Motors lesson, and does not say there is too
  much text.
- Whether he asks for lesson 4 after a week with its checker tells us whether an expert needs the
  lesson at all once the tool exists.

**What the app can measure** (use log, card history, progress):
- Kit opens per week, split into field use (not from a lesson or review) and use from a lesson. The
  target is field use on three or more separate days in the first fortnight.
- How often "Test me first" is chosen, and "Found it" against "Not this one" at leaves. Many "Not
  this one" answers on one node mean the tree is wrong there.
- First-step skips taken, and whether puzzles on skipped material hold up at first review. If they
  fail, the skip was wrong and the threshold must change.
- First-review recall (Good or Easy) of this course's puzzles against Motors' puzzles.
- Recall on puzzles brought forward by a look-up, and whether it rises across weeks.
- Measured tokens against 4e. Review scores of 4 or more. Attempts per interactive at two or fewer in
  most lessons.

**Verdict rules.** If he has not opened the kit outside a lesson within two weeks, the point-of-work
premise failed for him. Keep what worked inside the lessons (first-step skip, cases, the apprentice's
mistake) and drop the kit front door. If he uses the kit but the lessons feel thin, keep the kit and
go back to fuller lessons. If both work, retrofit kits to Motors, Design and verification and Subsea
next (about 0.4 to 0.6M each), then use the style for Generators and the switchboard.

---

## 5. Risks, and how to keep them small

| Risk | How we keep it small |
|---|---|
| **Wrong advice acted on at work.** A tree is followed, not studied. | Isolation enforced by the validator on every tree. A fresh fact-check walks every path. Every leaf says "prove it with a test before you replace anything". No live test without its HSG85 basis and warning. One standing line on the kit: your ship's or site's procedures and permits come first. The safety order is on the reviewer's score sheet. |
| **The kit becomes a crutch.** He looks things up and never recalls them. | A look-up never counts as a review. It only brings the recall forward. "Test me first" is one tap away. Review asks recall, not recognition, where the answer can be typed. |
| **Trees feel rigid to an expert** (the research warns of this). | Every step can be jumped, a reason sits behind every branch, and "None of these" opens Ask Claude with the trail. Trees are "where to look first", never a procedure to sign off. |
| **Ask Claude says something nobody checked.** | It opens only on "None of these" or a reply chip. It is labelled as Claude's notes, not the kit, and gets the trail and the kit's checked items as context, as Ask Claude does today. |
| **Moving a puzzle forward upsets the schedule.** | Only forward, at most once a week per item, never past the daily cap, no grade written. FSRS works from the time actually elapsed, so an early review is a real review, not a broken one. |
| **Costs run over, as Motors did.** | Stop points after the kit and after lesson 1, a measured token report at each, and a conditional lesson 4. The cheaper probe in section 3 if Dan wants one. |
| **App work grows past 2M before Dan sees anything.** | Build in this order: 3.1, then 3.5, then publish the kit (Dan can use it), then 3.2 to 3.4. Each piece stands alone. |
| **Copyright in later kits.** A Design and verification kit would want BS 7671's tables. | Calculators take the table value as an input he reads from his own book. The kit quotes one value at a time, as the courses do now. |
| **A stale offline copy.** | It is dated, carries one line to check the app for the latest, and the kit page offers a fresh save when the kit has changed since his last one. |
| **"It looks like a job card"** (he turned one down for Design and verification). | Show him the kit alone first and ask. The kit carries reasons, and the lessons teach judgement. |
| **Little motor work in his current post** would make field use slow to show. | Ask him first (section 6). If so, run the same style on Generators and the switchboard, where the trees are "bringing a set on line" and "load won't share". |
| **His use log is personal data.** | It lives in his private profile and goes into his backup. Nothing is shared. |

---

## 6. Three questions for Dan before building

1. Do you meet motor and starter faults now, ashore or at sea? If not, which kind of fault do you meet most?
2. Is it all right to publish the kit on its own first, before the lessons, so you can try it on the job?
3. Do you want a copy saved to your phone for places with no signal? (It costs about 0.3M.)
