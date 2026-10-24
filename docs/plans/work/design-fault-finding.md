# Fault Bench: learn by finding the fault, build from one checked fault table

One of five designs answering Dan's 24 Oct question: "analyse what's left to build and tell me what
we should build next. I also want a new innovative build style and learning style for the next one
as a test." The angle of this one is **fault-finding first**.

This is analysis only. Nothing was built, changed or published. It rests on the four reports beside
it: `inventory.md`, `build-process.md`, `platform.md` and `learning-research.md`. Where this file says
"Motors [45]", it means source 45 in `build/electrical/motors/research.json`. Those quotes are already
checked word for word. "To be sourced" marks a claim no checked quote holds yet.

---

## 0. In one page

**The learning style: Fault Bench.** Each lesson is one live system on the screen, such as a
starter, a motor circuit or a ship's switchboard, with a hidden fault. It is drawn as a working
schematic, not a photograph. Dan gets the report, the way a job reaches him. He chooses where to
look and what to test. He says what he expects before each reading, and the meter shows what that
fault would really give. He names the fault and proves the fix. Then he explains it to a new hand.
Theory is never served up front. It turns up as a short note card when a reading surprises him, or
when he names the wrong part. Each lesson runs three jobs on the same bench, from coached to solo.
"Just read it through" becomes **Watch it found**: an expert's route through the same three jobs,
step by step, with the thinking written beside each reading.

**The build style: bench-first.** Each lesson's teaching comes from one data file, `bench.json`. It
holds the parts, the test points, the faults, every reading, the expert's route, the short note
cards and the Keep this card. A Node script, `bench.mjs`, computes every reading from a stated rule
and checks the table. It checks that each fault can be told apart from the others, that the expert's
route is valid and safe, and that no screen breaks the writing rules. The page reads the table through
the existing case-file route, so words are never retyped into the page, and a wording fix needs no
rebuild. The read-through, the Book chapter and the review puzzles all come from the same file.

**App work for the test: almost none.** The player is built inside lesson 1's own page from kit
pieces that exist today, as AC circuits' steps engine was. New tooling is `bench.mjs` (about 0.4 to
0.6M tokens), plus perhaps a small change to `guide.mjs` (0.1 to 0.3M). One optional extra (0.2 to
0.3M) lets the app save his routes, so we can measure them.

**The pilot: "Fault-finding: from symptom to cause"**, rank 1 in the inventory, as 4 lessons. Lesson 1
is built and tried first: "The pump that won't run", on a DOL starter's control circuit. It uses only
his Motors material and checked Motors quotes, so it needs no inspection and testing handout. It is
written out screen by screen in section 4c.

**Cost.** Lesson 1, player included: about 1.05M, against today's 1.0M. Lessons 2 to 4: about 0.7 to
0.85M each. The whole 4-lesson course: about 4.4M, in a band of 4.3 to 5.5M, against about 5.0M the
current way. Estimates have run low before: Motors was estimated at 0.7M a lesson and measured 1.05M.
So the measured figure decides.

**What Dan decides:** (1) whether lesson 1 is built as the test; (2) whether his RCD handouts,
which sit with the held inspection and testing material, may be used as fault cases in lesson 4.
If not, lesson 4 uses public sources.

---

## 1. The learning style: Fault Bench

### 1a. The idea

A qualified electrician does not need the rule explained before he meets the fault. He needs the
fault, his own guess, and the reading that proves him right or wrong. The rule comes when the guess
fails. That is how the work goes on a ship, and it is what the research says suits someone who already
knows a field (section 1d). Every live course today runs the other way: rule, example, check. This
style turns that round, and only for a subject where Dan is the expert.

### 1b. A typical session, screen by screen

A lesson is about 10 to 15 minutes: one bench and three jobs. He can stop between jobs, and a row at
the top jumps straight to job 2 or 3.

1. **The bench.** One drawing of the whole system, labelled on the drawing itself. Each layer is
   marked: supply, control, contactor, motor. Numbered test points are 44 px tap targets. One line
   says what the lesson is: "Three faults on one starter." There is no theory screen.
2. **The report.** A short job report, as it would reach him: "Pump 2 only runs while someone holds
   Start." There is no story colour (research section 7: vivid detail that does not help the decision
   hurts transfer).
3. **Your first move.** Four choices of where to look first, then "Sure / Not sure". This is the rapid
   first-step test from the research (section 4). If he is right and sure, the job skips the
   coaching and goes to the proof. If he is wrong or unsure, the job runs coached.
4. **Suspects** (coached jobs). Chips sit on the parts of the drawing. He taps every part that could
   cause the symptom. The bench tells him which he missed or wrongly included, and why. "Suspects
   left: 6."
5. **Make it safe.** Before the first dead test of a lesson, he puts isolation in order: isolate,
   lock off, prove the tester, test dead, prove the tester again. Later jobs take it in one tap
   ("as before"), and the log still lists every step. A live test is offered only where the bench's
   sources allow it, with a red note that he must be able to justify it.
6. **The test loop.** He picks a test (look, continuity, voltage) and two points. He says what he
   expects ("Near zero: a path" or "Over range: open") and how sure he is. The meter on the drawing
   shows the reading, with the leads on his two points. In coached jobs he then taps the suspects that
   reading clears, and the count drops. In the solo job he keeps his own list. Every reading comes from
   the bench's table, so every number was worked out from a shown rule.
7. **A note card when it matters.** A short card of at most 90 words, in the D4 "Claude's notes"
   style, opens when something triggers it: a confident prediction that was wrong, a wrong part named,
   or three piece-by-piece tests in a row. It holds the one rule the moment needs, such as "Split it
   in half" or "A healthy open contact", with the drawing showing it. If he never needs it, it waits
   folded in the debrief, and it always appears in the read-through.
8. **Name the fault.** He taps the place on the drawing and picks what kind of fault it is: open,
   short, high resistance or wrong part. If he is wrong, the bench quotes his own log back to him:
   "That doesn't fit test 2: P0 to P2 read near zero."
9. **Prove the fix.** He chooses the checks that prove it, such as start, hold and every Stop. The
   job turns green only here, because green means finished.
10. **Teach it back** (once a lesson, after the hardest job). "A new AB asks why it buzzed and how you
    knew." This uses `K.written`, marked by Claude against set points through the app, as Section B
    answers are today, with one extra point for plain words.
11. **Your routes.** For each job, his route sits beside a short route: "Job 2: you 6 tests, short
    route 4." There is no score, no stars and no timer. Tapping a job plays the short route.
12. **Keep this.** A fault-signature card for that system: symptom, suspects, the test that splits
    them, and what each reading means, with the traps. It is meant to be read before a real job
    (research section 11).
13. **Another fault** (optional). The bench hides a random fault from its list. Nothing is marked
    and no card is saved. This is free practice on new faults (research section 6).

### 1c. Across a course

- **Support fades.** In lesson 1, jobs 1 and 2 are coached and job 3 is solo. In lesson 2, only job 1
  is coached. Lesson 4 is solo throughout. The first-move check can drop coaching at any point.
  This is cognitive apprenticeship's order: modelling (Watch it found), coaching, scaffolding that
  fades, articulation (predictions and teach-back), reflection (routes) and exploration (Another fault).
- **The method arrives inside the faults.** Nothing teaches "the method" on its own. Lesson 1's
  three jobs bring in, in turn: look first, isolate and prove dead, split it in half, read the
  rating, and prove the fix. Lesson 2 adds "which layer?": the contactor's click splits the starter
  in two. Lesson 3 adds sectionalising, the ship's version of the half-split.
- **New ground gets guidance first.** Where Dan is not yet expert (lesson 3, insulated systems at
  sea), the lesson opens with one note card on how the system differs, before the first job. The
  research is clear that problem-first suits experts and can overload newcomers (section 4; section
  5, Ashman et al.). The style follows the evidence, not a slogan.
- **Review mixes the benches.** Each lesson gives 3 to 4 review puzzles: "Given these readings, where
  is the fault?", the first move, and the isolation order, plus the teach-back as a written card.
  Today's review interleaves them across lessons and courses. That is interleaving where the skill is
  choosing (research section 3) and successive relearning (section 2).

### 1d. Why it should work (from `learning-research.md`)

| Move in the style | Evidence (section of the research report) | Strength there |
|---|---|---|
| A strategy taught with a layered model of the system, then simulated faults | Structured troubleshooting (Schaafstal et al. 2000): trained technicians solved twice as many faults in less time; naval technicians needed help keeping track of where they were (section 6) | Moderate |
| Coached practice on realistic faults | Sherlock, Air Force avionics: about 20 hours of coached practice brought airmen close to far more experienced technicians (section 6; the numbers are from a summary and must not be quoted to Dan as fact) | Moderate |
| A hypothesis before every test, and an interpretation after | Jonassen and Hung's troubleshooting design: state, test and interpret a hypothesis for every action (section 6) | Design proposal |
| A schematic that behaves, not a photo-real panel | Fidelity meta-analysis: medium fidelity gave the best transfer (section 6) | Moderate |
| Problem first, the explanation only when a miss shows it is needed | Expertise reversal: worked explanations can hurt people who already know; fast transition to problems for the knowledgeable (Reisslein, on circuit analysis) (section 4) | Moderate |
| First-move check decides coached or solo | The rapid first-step test predicted expertise (r of .71 and .75), and instruction adapted with it gained more (0.46) (section 4) | Moderate |
| Predict each reading, with Sure / Not sure | Prequestions g = 0.54; hypercorrection: confident errors are the ones best corrected (section 5) | Moderate |
| No discovery of safety steps | Productive failure helps concepts but not procedures (g = −0.03); isolation is told, never found by failing (section 5) | Moderate, contested |
| Watch it found, with the expert's thinking shown | Cognitive apprenticeship's modelling; studying someone else's attempt gave the same conceptual gains as failing yourself (sections 5 and 6) | Emerging to moderate |
| Words on the drawing, theory behind a trigger | Split attention g = 0.63; for experts the diagram alone can beat diagram plus text (section 9) | Strong |
| Teach it back to a new hand | Self-explanation g = 0.55, conceptual prompts highest (section 8) | Moderate to strong |
| Keep this as a fault-signature card | Job aids improve work, and training plus an aid did about twice as well as either alone (section 11) | Moderate, dated |
| Three jobs, easy to hard, support fading | 4C/ID whole tasks (d = 0.79, small meta-analysis) (section 7) | Weak to moderate |

What the research does not say: no study covers an AI-built course, or a qualified electrician
refreshing on his phone (section 15). The pilot is how we find out.

### 1e. How it keeps Dan's rules

| Rule (CLAUDE.md, his feedback) | How Fault Bench keeps it |
|---|---|
| Plain own words; never narrate sources; no brackets; short sentences | The bench's words are short fields: a report up to 40 words, an expert's thought up to 25, a note card up to 90. `bench.mjs` lints every field (section 2b) before any reader sees it. Sources stay as ids in the data and are never shown. |
| Text screens at most about 90 words (21 Oct) | Most screens carry under 30 words; the picture does the work. Only note cards approach 90, and the lint refuses more. |
| Faithful; numbers are controls, computed from a shown rule, or cited | Every reading is computed by `bench.mjs` from a named rule, and the note card shows that rule. Cited constants keep their ids. A case value, such as "a 400 V coil", is an example named once. Where no value is sourced, the reading is a class ("near zero", "over range"), never an invented number. |
| Contested points taught as contested | Live testing for fault-finding is taught as a judgement: what the law asks, and when it is hard to defend. |
| Learn by doing; a visual earns its place | The bench is the lesson. There is one drawing per lesson, used for three jobs, and nothing decorative. |
| Predict, play, explain, say it back, checks, review | Predict each reading, play the bench, a note card when needed, teach it back, review puzzles. |
| Calm reading; colour only for meaning | Ink for the leads, the meter and the controls. Red for a fault found and for live-work warnings. Green only when the fix is proven. Amber for key terms. Teal for the test-point labels. No colour is named in the words. |
| Light by default; phone first at 360 px | The control circuit is drawn as a vertical ladder, which suits a narrow screen. Test points are 44 px. The log and chips wrap. From 860 px, `K.stage` puts the bench beside the log. |
| Nothing in the way; no guilt mechanics | No timer, score, lives or streak. "Show me a short route" is always there. He can jump to any job. Routes are shown side by side, never ranked. |
| Two ways through: "quiz me" and "just read" | Quiz me plays the bench. Just read is Watch it found (section 1f). |
| Never re-teach his qualifications; pitch above them | No screen teaches a test procedure. Jobs start where Motors lesson 2 stopped ("Runs only while Start is held: check 7"): that rule is job 1's first-move check, so it doubles as spaced recall. |
| Inspection and testing waits for his green light | Lesson 1 uses no I&T material. Lesson 4 uses his RCD handouts only if he agrees. |

### 1f. Both ways through

- **Quiz me through it**: the live bench, as in section 1b.
- **Just read it through**: Watch it found. The Keep this card comes first (the guide always opens on
  it). Then come the bench, and each job's short route as stills: the leads on two points, the reading
  on the meter, and one line of the expert's thinking. Every note card appears in its place. The
  first-move and "where is the fault" questions appear as worked examples with their answer and why,
  and the teach-back as its question and model answer. This is not a cut-down quiz. It is the
  modelling stage of cognitive apprenticeship, so reading it is a real way to learn. It is also the
  reference he would open before a job.

### 1g. What it improves on today's lessons

1. **It trains judgement.** Today every course teaches a rule and then checks it. Here he decides what
   to test, which is the skill a leading hand is asked to direct and check.
2. **Less text, by design.** Theory appears only when a miss calls for it, so a lesson he mostly knows
   shows little text. This answers the 21 Oct complaint at its root (research section 9).
3. **The read-through means something.** It is the expert's route, not a quiz with the answers filled
   in, so the 20 Oct "blank images" problem cannot recur in the same form.
4. **Numbers are honest by construction.** A reading is a lookup in a table that a script built from a
   rule and checked.
5. **Every lesson adds to a field card.** The Keep this cards, one per system, add up to a fault-finding
   reference for the ship.

---

## 2. The build style: bench-first

### 2a. The one new file: `bench.json`

One file a lesson is the only source of everything Dan reads or plays. It is written by the bench
author, checked by `bench.mjs`, fact-checked, then written into the course's case file
(`topics/{tid}/case`, read in the page as `K.caseFile.benches.i1`). The case file already reaches the
page this way for refresher courses, so no app change is needed.

```
{
  system:  { title, layers: [{id, name, parts: [...]}] },
  parts:   [{id, name, kind: 'fuse'|'nc'|'no'|'coil'|'core'|..., from, to, rating?, src}],
  points:  [{id: 'P2', x, y, label}],                  // where the leads go on the drawing
  tests:   [{id, kind: 'look'|'continuity'|'voltageToN'|'voltageAcross'|'ir'|'clamp',
             live: false|true, needs: 'dead'|'live', hold?: ['start'], src}],
  rules:   [{id: 'series-break', words, compute: 'seriesLoop'}],   // the words are the note card's rule line
  faults:  [{id: 'f3', part, effect: 'open'|'short'|'highR'|'wrongRating', report}],
  table:   generated by bench.mjs: reading per fault, test and point pair, with its rule id
  jobs:    [{id, fault, report, mode: 'coached'|'solo', firstMove: {options, answer, slips, why},
             suspects, short: [{test, a, b, hold?, thought}], name: {...}, prove: {...},
             notes: [{id, trigger, words, picture, src}], live?: {why, src}}],
  written: { b1: {q, points, model, audience} },        // the existing K.written shape
  keep:    { the existing K.summary shape: for, rule, traps, where },
  steps:   the read-through spine (generated): SHOW and DO entries with read and still
}
```

### 2b. Stages, models and effort

CLAUDE.md's table is kept as it stands. One stage is renamed: Write becomes **Bench author**, at the
same model and effort as Write, and it absorbs the plain edit. No stage changes model or effort.
Build stays at Opus xhigh as Dan set on 11 Oct. If lessons 2 to 4 come in well under budget, a later
test could try Build at high for copied lessons, but only with Dan's say-so.

| # | Stage | Model, effort | What it does in this style | Gate |
|---|---|---|---|---|
| 0 | Course brief | Opus high | As today, plus a **fault design** per lesson: the system, its layers, 5 to 7 faults, three jobs, the coached and solo pattern, what it builds on. Dan agrees it. | Dan's yes; lesson 1 first |
| 1 | Plan | Opus high | `lessons.json`, `topic.json` | `validate.mjs plan` |
| 2 | Research | Sonnet high, quote checker | **Once, fully**, for the whole course: his materials page by page, then the web for gaps. Motors' checked quotes are carried over by id, unchanged. Then a cheap cut: a per-lesson source pack by id. | `sources.mjs`, unchanged |
| 3 | Bench author (was Write, plus the plain edit) | Opus high | Writes `bench.json`: parts, faults, jobs, short routes, note cards, written, keep. Runs `bench.mjs` in its own loop until clean. | `bench.mjs check` |
| 3a | `bench.mjs check` | script | Computes the table from the rules. Checks that every fault is reachable, that each job's short route leaves exactly one fault consistent with the readings, that no fault pair is identical on every test unless the brief says so, that no dead test comes before prove-dead, that every live test carries a sourced reason, and that every number is a rule output, a cited id or a named example. It also lints the words: a field over its limit, narration patterns ("your slides", "(p.", "one site", "the course"), brackets, semicolon chains, sentences over about 25 words, a DO step whose `read` gives the answer, and the right option always in the same place. | fails or passes |
| 4 | Fact-check | Opus high, fresh | Reads the **final words** in `bench.json` and the source pack. Checks each rule and fault behaviour against the sources, recomputes with `bench.mjs`, and audits safety (isolation order, live tests, the proof of the fix). | `validate.mjs verify`, adapted |
| 5 | Build | Opus xhigh | Lesson 1: the player plus the bench drawing (SVG with named points), wired to `K.caseFile`. Lessons 2 to 4: copy the player forward and draw a new bench. At most three attempts. | `attempt.mjs` self-test at 340, 720 and 1040 px, XL text, both themes; plus the page's own `K.check`s, which play every job's short route and one wrong route |
| 6 | Review (teaching and motion) | Opus xhigh, fresh | Plays every job as Dan would, from one contact sheet per job (the film of the short route plus one wrong route), and reads Watch it found. | scores of 4 or more |
| 7 | Fix | Opus high | Most fixes are edits to `bench.json`, regenerated into the case file. That needs no page rebuild and no new attempt. | `bench.mjs check`, `attempt.mjs` only if the page changed |
| 8 | Confirm | Sonnet medium | Skipped when only polish was found, or when every fix was a data edit that `bench.mjs` re-passed | the reader's word |
| 9 | Guide and assemble | Sonnet low | `guide.mjs` walks the page's spine; `assemble.mjs` writes the lesson, the guide and the case file | as today |

**Stages that stay:** the brief with Dan's yes; research with the word-for-word quote checker and
harvesting from the transcript; a fresh fact-check; the build's self-test and the three-attempt cap;
a fresh review; fix; confirm; the guide; the token report to Dan.
**Stages that go:** the per-lesson research top-up (the research is done once, with gaps only after);
the separate plain edit (the lint does the counting and the fact-checker reads the final words); and
retyping words into the page.
**Stages that change:** Write becomes fault design; the fact-check checks rules and safety rather
than a dozen worked examples; review plays the jobs.

### 2c. What is reused

- **Across lessons:** the player, the isolation stepper, the routes screen, the Keep this card's
  shape, the reviewer's play script, and the brief's fault-design template.
- **Across courses:** the rule functions in `bench.mjs`, each small and pure, written once.
  `seriesLoop` covers control circuits; `threePhase` covers motor power circuits (open phase,
  imbalance); `insulatedEarth` covers an insulated board with earth lamps or a monitor; `leakageSum`
  covers RCD standing leakage. The same benches suit Earthing at sea, Generators and the switchboard
  (a set that will not share load), Instrumentation (a loop that will not control) and, once Dan
  green-lights it, Inspection and testing (patterns of readings on a ring final circuit).
- **If the pilot passes:** the player moves into the kit as `K.bench`, and later lessons only draw a
  bench and write data.

### 2d. Tokens per lesson

Reasoned estimates, not measurements. The "today" column is the refresher figure from
`build-process.md`.

| Stage | Today (refresher) | Bench-first, lesson 1 | Bench-first, lessons 2-4 |
|---|---|---|---|
| Research top-up | 0.15M | 0.02M (gaps only) | 0.02M |
| Write and plain edit | 0.25M | 0.20M (bench author, lint in the loop) | 0.18M |
| Fact-check | 0.10M | 0.10M | 0.09M |
| Build | 0.20-0.38M | 0.45M (the player plus the bench) | 0.18M (new drawing, copied player) |
| Review | 0.15M | 0.16M | 0.14M |
| Fix and confirm | 0.15M | 0.10M (mostly data edits) | 0.08M |
| **Per lesson** | **about 1.0M** | **about 1.05M** | **about 0.70M (0.7 to 0.85M)** |

**The course:** brief with fault design 0.25M; research once 0.4M; `bench.mjs` 0.5M (one-off, reused
by every later course); guide and assemble 0.05M; lessons 1.05 + 3 × 0.70 = 3.15M. **Total: about
4.35M**, in a band of 4.3 to 5.5M. The inventory's estimate the current way was about 5.0M.

**Why lessons 2 to 4 should cost less:** fewer words per lesson (about 500 to 800, against 1,500 to
2,500), no plain-edit stage, no top-up, one drawing used for three jobs, words outside the page, and
readings checked by a script. **Why it might not:** Motors' light format promised 0.7M and measured
1.05M, because reading, review and fix costs do not shrink with screen count. The bench's fault
design is new thinking work. **Stop rules:** if lesson 1 passes 1.5M, or its build is blocked
after three attempts, stop and report before lessons 2 to 4.

### 2e. Failure modes removed and added

| Removed (from `build-process.md` section 3) | How |
|---|---|
| Words in three places; "keep final.json in step" | One file; the page reads it from the case file |
| Screens over 90 words, footnote counts, narrated sources | Linted by `bench.mjs` before any reader |
| A number on screen with its step never shown | Every reading names its rule, and the note card shows the rule; a bare number is refused |
| Read-through stills worked out backwards from a live page | An explicit spine with `still: () => runTo(job, k)` for every expert step |
| The right answer always in the same place | Linted |
| Research that only grows | Researched once; packs cut by id |
| Hand edits to the case file | `bench.json` is written into the case file by script only |

| Added | Kept small by |
|---|---|
| An inconsistent fault table (two faults that can't be told apart, a reading against its rule) | `bench.mjs` computes and checks; the fact-checker re-runs it |
| An unsafe route taught (a dead test before prove-dead, an unjustified live test) | The safety gate in `bench.mjs`; the fact-check's safety audit; a fresh reviewer |
| Player state bugs (a test that never answers, a stuck job) | Page `K.check`s play every fault's short route and a random route; "Show me a short route" always works |
| Too many tap targets for a phone | The ladder layout; at most about 9 points a bench; 44 px targets; the kit's wrapping rows |
| The bench is too easy for Dan | The first-move check; a solo job 3; jobs pitched above Motors' rules |

---

## 3. App work needed

The smallest set, from `platform.md`'s menu. Sizes are guesses: S is about 0.2 to 0.6M tokens of
agent work, M about 0.7 to 1.5M.

| Piece | For the pilot? | Size | Notes |
|---|---|---|---|
| The bench player, inside lesson 1's page | Yes | in lesson 1's build (about +0.25M) | Uses only kit pieces that exist: `K.choice`, `K.button`, `K.drag` (isolation order), `K.written`, `K.summary`, `K.check`, `K.stage`. No kit change. |
| `tools/course/bench.mjs` (rules, table, checks, lint, pack cut) | Yes | S to M, 0.4 to 0.6M | Build tooling, not app code. It holds the solver the platform report sized as L, but in Node at build time, so the page only looks readings up. |
| Bench data through the case file | Yes | 0 | `K.caseFile` exists; `assemble.mjs` already writes the case file. A bench is about 10 to 20 KB. |
| `guide.mjs` reading the spine | Probably no change | 0 to S, 0.1 to 0.3M | The guide sets a `step` control and reads `STEPS` with `read` and `still`. The page answers `step` by drawing spine step k. Budget a small fix in case a branching page trips its checks. |
| Teach it back to a new hand | Yes | 0 | The existing `K.written`: the audience goes in the question, and one point covers plain words. |
| Review cards | Yes | 0 | Choice puzzles and an order card from the guide; the teach-back as a written card. All existing types. |
| Save his routes (`complete` carrying `{jobs: [{tests, short, firstRight, sure, notesOpened}], free}` into progress) | Optional | S, 0.2 to 0.3M | Only to measure the pilot. Shown nowhere at first. |
| **Later, only if the pilot passes:** `K.bench` in the kit | No | M, 0.8 to 1.2M | Makes lessons 2+ cheaper still |
| **Later:** a "fresh fault" review card that mounts a bench with a random fault | No | M, about 1M | Varied practice in review |
| **Later:** `K.ask`, so Claude can ask "What does that reading tell you?" in free words | No | M, 0.8 to 1.2M | The pilot uses checked choice picks instead, so nothing unchecked is said |

**Pilot app and tooling total: about 0.5 to 0.9M**, of which 0.4 to 0.6M is `bench.mjs`, which every
later bench course reuses.

---

## 4. The pilot

### 4a. Which course, and why

**"Fault-finding: from symptom to cause"**: the first part of the shelf's "Maintenance and
fault-finding". It is rank 1 in the inventory. It is the daily work of an electrician and the work a
leading hand directs. It builds on four live courses: Motors, AC circuits, Design and verification,
and Subsea. Dan holds material for it. It is also the one subject where starting from the fault is
natural, so it tests the style fairly.

Standing instructions are respected. Lesson 1 uses only his Motors material and checked Motors
quotes. Lesson 3 uses public sources and never says how the Royal Navy does things. Lesson 4 uses
his RCD handouts, which sit with the held inspection and testing material, only if he agrees. No
lesson teaches a test procedure, an amendment or the Building Regulations.

### 4b. Lesson list (4 lessons, plus one that waits)

| # | Lesson and bench | Its three jobs | Coaching | Sources |
|---|---|---|---|---|
| 1 | **The pump that won't run.** A DOL starter's control circuit: fuse, Stop at the panel, Stop at the pump through a two-core cable, Start with the hold-in contact across it, the overload contact, and the coil | Runs only while Start is held (hold-in contact wire out); won't start, no click (a core to the remote Stop open); buzzes after a contactor change (a 400 V coil on a 230 V circuit) | Coached, coached, solo | His DOL study sheet and handout; Motors [42], [45], [46], [48]-[50], [52], [60]-[62], [67], [78], [245], [248], [260], [262]. To copy from his Drive: "Fault finding and rectification.pdf", "hsg85.pdf", "Health & Safety (1).pdf" |
| 2 | **The motor that hums, trips or runs hot.** The power circuit: supply, main contacts, overload, motor terminals; a clamp meter on each line, line-to-line voltage, an insulation tester | Hums, won't turn, then trips (a burnt main contact pole: single-phasing); trips after running a while (a binding pump, against an overload set wrong); trips at once after standing wet (low insulation resistance on the windings) | Coached, solo, solo | His motor sheets; Motors [32], [34], [106], [227] (173% current), [228], [229], and the Motors trap "set the overload to full-load current". Insulation resistance limits: to be sourced (Subsea's checked IR material may carry over) |
| 3 | **The earth fault that doesn't trip.** An insulated 440 V three-wire ship's board with earth lamps or an insulation monitor and six outgoing circuits. One note card first: why one earth gives an alarm, not a trip | A lamp goes dim: which line is it?; sectionalise the board, keeping essential services on; a second earth on another line, and why that is the dangerous one | A note card first, then coached, solo, solo | Public sources only: the MCA ETO syllabus lines and the "Ships' 440 V three-wire insulated neutral" quote already in AC circuits' research; the rest to be sourced. If built here, "Earthing at sea" shrinks from 3 lessons to 2 |
| 4 | **Trips that come and go.** A board with one RCD over several circuits, a leakage clamp and an insulation tester | Random trips, worse in the morning (standing leakage adding up); trips only when one appliance runs (a neutral-to-earth fault on that circuit); trips in wet weather (insulation falling on an outdoor circuit) | Solo throughout | Public sources by default; his "RCD's 29.9.24" and "RCD Ramble" handouts only with his OK. The leakage limit in BS 7671: to be sourced |
| (5) | **Readings that tell a story**: a broken ring, reversed polarity, an open PEN | (waits) | | His inspection and testing handouts: waits for his green light on that material |

**The test is lesson 1 alone.** Build it, let Dan play it on his phone, then decide on lessons 2 to 4.

### 4c. Lesson 1 written out: "The pump that won't run"

**The bench.** A vertical ladder, top to bottom: the control supply L; test point **P0**; the control
fuse; **P1**; Stop at the panel (normally closed); **P2**; a two-core cable out to the pump's Stop
station, with its terminals **R1** and **R2** and the Stop (normally closed) between them, then back;
**P3**; Start (normally open) with the hold-in contact 13-14 wired across it; **P4**; the overload
contact 95-96 (normally closed); **P5**; the coil A1-A2; N. The motor and main contacts are drawn faint
beside it as the power layer. A "Hold Start in" toggle sits under the drawing for dead tests.

Wiring facts and their sources: Stops in series (Motors [262]); Starts in parallel (Motors [78]); the
hold-in contact across Start (Motors [45]); it pulls in and holds (Motors [50]) and returns to open
(Motors [52]); the overload contact breaks the coil circuit as Stop does (Motors [48]); a 230 V coil
between one line and neutral (Motors [60]); DOL for pumps, fans and compressors (Motors [67]).

**Faults on the bench (6):** the hold-in contact open (wire out of terminal 14); the overload contact
open; the core from P2 to R1 open; the control fuse open; the coil open circuit; a coil rated 400 V
fitted to this 230 V circuit. Each has a one-line report for Another fault.

**Bench rules** (each is the rule line of a note card; `bench.mjs` computes the table from them):
- *Continuity, dead:* a whole wire or a closed contact reads near zero. A break reads over range. So
  does a healthy normally open contact, unless it is held in. The coil reads a resistance, the
  winding, shown as a class, never as a number.
- *Voltage to N, live, Start held:* points before the first break read 230 V. Points after it read
  0 V, because the coil ties them to N.
- *Voltage across, live:* across a break, the whole 230 V; across a closed contact, 0 V; across the
  coil when the rung is whole, 230 V.
- *Coil band:* the coil pulls in only within a band around its rating, for example 85% to 110%
  (Motors [245], one maker's figure, so it is always shown as "for example"; a general source such
  as the contactor standard's operating limits: to be sourced).

Screens follow. Word counts are of the words on screen. **R** says how the screen appears in Watch it
found.

---

**S0. The bench** (SHOW)
Picture: the healthy rung, labelled on the drawing, with the test points as numbered dots.
Words (37): "Three faults on one starter. Each starts with a report. You choose the tests, say what you
expect, then read the meter. Name the fault and prove it fixed. Theory turns up when a reading
surprises you."
Controls: Job 1 · Job 2 · Job 3.
R: the bench as the first picture after Keep this.

**S1. Job 1: first move** (DO, first-step check)
Words (19): "Report: Pump 2 only runs while someone holds Start. Let go and it stops. What do you check
first?"
Options: "The hold-in contact and its wires" (right) · "The overload: reset it" · "The coil: fit a new
one" · "The motor's insulation". Then: Sure · Not sure.
Right (40): "Yes. The coil pulls in while Start is held, so the fuse, both Stops, the overload contact
and the coil are all doing their job. Only the path that keeps the coil fed after Start springs back
is in doubt."
Slips: overload: "A tripped overload stops the coil pulling in at all. Here it pulls in." · coil: "The
coil pulls in while Start is held. It works." · insulation: "The motor runs while Start is held. The
fault is in what keeps it running."
Branch: right and Sure goes to S4 with no coaching. Otherwise, S2.
Sources: Motors [45], [46], [48], [50], [52].
R: a worked example with its options, answer and why. **Review card:** choice puzzle.

**S2. Note card: what keeps the coil fed** (SHOW; coached route only, always in R)
Picture: the current path drawn in ink. Press Start: the path runs through the button and the coil
pulls in. The hold-in contact closes. Release Start: the path runs through the hold-in contact. Play
and Reset.
Words (60): "Press Start and current reaches the coil through the button. The coil pulls in the main
contacts. A small hold-in contact, wired across Start, closes with them. Let go and Start springs
open. Now the coil is fed through the hold-in contact instead. If that contact or its wires are open,
the coil drops out the moment you let go."
Sources: Motors [42], [45], [49], [50], [52].

**S3. Make it safe** (DO, put in order; the first time only)
Picture: the panel's isolator with a lock and tag, a two-pole tester, a proving unit.
Words (16): "Before you touch a terminal, make it dead and prove it. Put the steps in order."
Steps: Isolate · Lock off and tag · Prove the tester on a known supply · Test dead where you will work ·
Prove the tester again.
Feedback (21): "That's the order. A tester that fails can show dead on a live circuit, so it is proved
before and after."
Later jobs: one tap, "Isolate and prove dead, as before"; the log lists all five steps.
Sources: Motors [260] (prove before and after use). The isolation and lock-off order: to be sourced
from HSG85 and his NVQ Health and Safety slides.
R: the ordered steps. **Review card:** order.

**S4. Job 1: found** (DO, look)
He taps Look and picks from: terminals 13 and 14 · the overload's flag · the coil's rating plate · the
fuse. Looking costs nothing.
Picture: terminal 14 enlarged, the wire pulled clear of the clamp, ringed in red.
Words (25): "Terminal 14 on the hold-in contact: the wire has pulled out of the clamp. With it open,
nothing feeds the coil once Start springs back."
R: the still with its sentence.

**S5. Prove the fix** (DO, pick all that apply)
Words (15): "You've re-made the joint. Locks off, people told, supply back. Which checks prove the fix?"
Options: "Start, then let go: it keeps running" (right) · "Press each Stop: it stops" (right) ·
"Insulation test the motor" · "Reset the overload".
Why (23): "You worked on the control circuit, so prove everything it does: start, hold, and every Stop,
at the panel and at the pump."
The job turns green.
Sources: Motors [52], [262]. "Prove the fix" as a step of the method: to be sourced from his NVQ
fault-finding slides.
R: a worked example. **Review card:** choice puzzle.

**S6. Job 2: suspects** (DO, tap the chips)
Words (27): "Report: Pump 2 won't start from the panel. No click from the starter. The overload flag
shows it hasn't tripped. Tap every part that could cause this."
Chips on the drawing: Fuse · Stop at the panel · Stop at the pump and its cable · Start · Hold-in ·
Overload contact · Coil.
Answer: all but Hold-in.
Feedback (33): "Anything in the coil's path could. The hold-in contact can't: with Start held, it plays
no part. The overload flag makes a trip unlikely, but its contact or wires could still be open."
Shown under the drawing: "Suspects left: 6."
Sources: Motors [45], [46], [48].
R: a worked example.

**S7. Live or dead?** (DO)
Words: "How will you trace it?" Options: "Isolate, and test continuity dead" · "Leave it live and trace
the voltage".
Dead (17): "Good. A dead test will find an open circuit, so there is no reason to work live."
Live, as a red note (31): "Many electricians trace control faults live. The law asks whether it is
reasonable to work dead. Here a continuity test will find it, so live is hard to defend. Isolate
instead?" Buttons: Isolate · Carry on live. If he carries on live, the bench gives voltage readings
from the live rules.
Sources: to be sourced: the Electricity at Work Regulations, regulation 14, and HSG85 on live testing
for fault-finding. Taught as a judgement.
R: a worked example.

**S8. The bench, coached** (DO, the main loop)
Words, the fixed prompt (13): "Pick a test and two points. Say what you expect, then read it."
Each test: he predicts "Near zero: a path" or "Over range: open", then Sure or Not sure. The meter shows
the reading with the leads on his points. Then: "Which parts does that clear?" He taps chips, the
bench checks, and "Suspects left" updates.
Hint, on tap (13): "Try a test that clears half of what's left, whichever way it reads."
The short route, as the expert's thoughts (each a still in R):
1. "P0 to P3 reads over range. The break is in the top half: the fuse, the panel Stop or the pump's Stop
   loop." (23)
2. "P0 to P2 reads near zero. Fuse and panel Stop are whole. It's in the pump's Stop loop." (18)
3. "At the pump, R1 to R2, across the Stop, reads near zero. The Stop is fine, so a core is open." (21)
4. "P2 to R1 reads over range. The core out to the pump is open." (14)

**Note card A: split it in half.** It opens after three piece-by-piece tests in a row, and is always in
R. Picture: the six places as a bar, halving with each test.
Words (48): "Six places could hold the break. Test across the top three. Whichever way it reads, you
have cleared three. Test across half of what's left and you are down to one or two. Piece by piece
from the top can take six tests. Halving takes three at most."
The rule shown: each test halves the places, 6, 3, 2, 1, so three tests at most. Computed, not cited.
Source for the method's name and use: to be sourced (his NVQ fault-finding slides; a public
troubleshooting text such as Kuphaldt's).

**Note card B: a healthy open contact.** It opens if he blames Start after testing P3 to P4 without
holding it in.
Words (41): "Start is normally open. Dead, with nobody pressing it, it reads over range even when it
is perfect. Hold it in, or use the toggle, before you call it faulty. The hold-in contact is open too
while the contactor is out."
Sources: Motors [42], [52].

**S9. Name it, fix it** (DO)
Words (8): "Where is the break, and what is it?" He taps the place on the drawing, then picks: Open
circuit · Short circuit · Wrong part fitted · High resistance.
Right (18): "Yes. The core from the panel to the pump's Stop is open. The Stop itself reads near zero."
Wrong: the bench quotes the reading in his own log that rules his answer out, such as "That doesn't
fit test 2: P0 to P2 read near zero, so the panel Stop is whole."
Then the fix and its proof, as a pick: "Move to a spare core or replace the cable" · then "Continuity of
the new core" and "Start, hold, and both Stops". The job turns green.
R: a worked example: "P0 to P3 over range. P0 to P2 near zero. R1 to R2 near zero. P2 to R1 over range.
Where is the break?" **Review card:** choice puzzle.

**S10. Job 3, solo** (DO)
Words (28): "Report: The contactor on Pump 2 was changed yesterday. Now it buzzes when Start is
pressed, and the pump won't run. You're on your own for this one."
The bench runs with no suspect chips and no interpretation checks. The Look menu includes the coil's
rating plate. "Show me a short route" is there.
Readings: rating plate, "Coil 400 V AC" (the case's example value, named once). Voltage across A1-A2
with Start held, a live test, "230 V". Its note (22): "This fault only shows with power on, so a live
reading is reasonable here, with a two-pole tester and the panel guarded." To be sourced: HSG85, GS38.
This is the counterpart to S7: live testing judged both ways.
The short route: one look at the rating plate, one reading to confirm.
Name: Wrong part fitted, at the coil.
R: the report, then the rating plate still, then the reading still with its thought: "230 V across
the coil. That would be healthy for a 230 V coil. This one is rated 400 V." (20)

**S11. Note card: the right voltage for the wrong coil** (SHOW, after he names it or asks for the short
route; always in R)
Picture: the coil with its plate reading 400 V; the meter reading 230 V; a bar from 0 to 110% of the
rating, with the 85% to 110% band marked as an example and 58% marked.
Words (68): "The circuit feeds the coil from one line and neutral, so it gets 230 V. That is only healthy
if the coil is rated 230 V. This one is rated 400 V, so it gets about 58% of its rating. A coil is made
to pull in within a band, for example 85% to 110% of its rating. Below it, the armature can't seat
fully, so it buzzes."
The rule shown: 230 ÷ 400 = 0.575, about 58%.
Sources: Motors [60] (230 V, one line and neutral); [61], [62] (match the coil to the supply); [245]
(0.85 to 1.1 times, as an example); [248] (buzzing from too little coil voltage or the wrong coil).

**S12. Teach it back** (DO, `K.written` b1)
Words (25): "A new AB on your section asks why Pump 2 buzzed and wouldn't run, and how you knew. Tell
them in a few plain sentences."
Points: (1) The buzz meant the coil was getting power, so the wiring was whole. (2) The new coil is
rated 400 V, but the circuit feeds it 230 V from one line and neutral. (3) At about 58% of its rating
it can't pull in fully, so it buzzes. (4) Fit a coil rated 230 V, then prove start, hold and every
Stop. (5) Plain words a new hand would follow.
Model answer (62): "It buzzed, so the coil was getting power and the wiring was whole. The new
contactor's coil is rated 400 V, but this circuit feeds it 230 V from one line and neutral. That's well
short of what it needs to pull in, so it chattered. We fit a 230 V coil, then check it starts, holds
and stops from both Stops."
R: the question and the model answer. **Review card:** written.

**S13. Your routes** (SHOW)
Words (14): "Your routes, beside a short one. Tap a job to watch the short route."
Rows, computed from his log: "Job 1: you 1 look, short route 1". "Job 2: you 6 tests, short route 4".
"Job 3: you 2, short route 1". When his route was as short: "Same as the short route." No ranking.
R: left out; Watch it found already is the short route.

**S14. Keep this** (summary; first page in R and in the Book)
For: "Finding why a DOL starter won't run, from the report to the proof."
Rule lines: "Stops in series, Starts in parallel, the hold-in contact across Start." · "Runs only while
Start is held: the hold-in contact or its wires." · "No click, overload not tripped: split the circuit
in half, dead." · "Buzzes after a change: read the coil's rating, then how it is fed." · "Each test
should clear half of what's left." · "After any control repair, prove start, hold and every Stop."
Traps: "A healthy normally open contact reads open. Hold it in before you blame it." · "230 V at the
coil is only good if the coil is rated 230 V." · "Prove the tester before and after."
Where: "Any DOL starter: pumps, fans and compressors."
Sources: as above, with Motors [67] for where.

**S15. Another fault** (optional, unmarked)
Words (15): "Another fault on this starter? It's picked at random from the six. Nothing is marked."

---

**Watch it found, in order:** Keep this; the bench; job 1's first move; what keeps the coil fed;
make it safe; the found wire; prove the fix; job 2's suspects; live or dead; the four route stills;
split it in half; a healthy open contact; where the break is; job 3's report; the rating plate; the
reading; the right voltage for the wrong coil; teach it back. That is about 19 pages, each under 90
words. **Review cards:** 4 choice puzzles, 1 order card and 1 written card.

### 4d. How we judge whether the test worked

**What Dan says.** After lesson 1, ask him three things:
1. "Did finding it teach you more than being told it?"
2. "Too easy, about right, or too hard for you?"
3. "Would you open the Keep this card before a real job?"

It passes if he says yes to 1 and 3, and "about right" or "too easy" to 2. "Too easy" means harder
jobs, not a different style. It fails if he calls it slow, fiddly on the phone, or a game.

**What he does.**
- He plays all three jobs, not just the first. He opens lesson 2 without being asked.
- He tries Another fault at least once.
- Which way he takes: quiz or read. Either is a good sign. A read-through with no quiz is a sign the
  bench is too slow.
- His teach-back covers at least 4 of the 5 points.

**What the app measures today, with no change.** Completion by quiz or read (`quizRound` and
`readThrough` in progress). Review grades on the bench's puzzle cards at one and three weeks, against
Motors' puzzle cards on the same starter. His teach-back words in the Book's "In your own words".

**With the optional route saving:** his tests per job against the short route; whether his routes
shorten from job 1 to job 3 and from lesson 1 to later lessons; how often his first move was right and
sure; which note cards opened.

**What the build measures.** Tokens by stage against `build-process.md`'s figures (target: lesson 1
at or under 1.3M with the player; later lessons at or under 0.85M). Attempts (two or fewer). Review
scores of 4 or more. Findings that reached the reviewer that the lint should have caught (target: none).
No blank stills in Watch it found.

**Decisions.**
- **Go:** Dan passes it, and lesson 1 came in at or under 1.5M. Build lessons 2 to 4; consider `K.bench`
  in the kit.
- **Adjust:** Dan likes the idea but finds it slow. Cut to two jobs a lesson, or drop predictions from
  coached jobs.
- **Stop:** Dan prefers being told. Keep the bench as an optional "Practise on a fault" section at the
  end of normal lessons. The fault tables and the source pack are not wasted.
- **Fallback if the build is blocked after three attempts:** ship lesson 1 as a normal steps lesson,
  with the bench as a still picture and the same jobs as choice questions. The checked content still
  reaches Dan.

---

## 5. Risks, and how to keep them small

1. **Teaching something unsafe or wrong.** This is the biggest risk, because the bench decides what
   "right" looks like. Kept small by: the rules computed by script; a safety gate on order; isolation
   told, never discovered; live testing taught as a judgement with its source; a fresh fact-checker
   whose brief is safety first; a fresh reviewer. Every safety error in past builds was caught by a
   fresh reader (`build-process.md`), and both stay.
2. **Too easy for Dan.** He is the expert. Kept small by: the first-move check that skips the coaching;
   job 3 solo; jobs that start where Motors stopped; "too easy" in the judging questions. Lesson 2 onward
   can be pitched harder at no extra build cost.
3. **Slow or fiddly on a phone.** Kept small by: two taps a test; predictions only in coached jobs;
   three jobs at most; a jump row; the ladder drawn vertically; "Show me a short route" at any point.
   Target: 10 to 15 minutes a lesson.
4. **A read-through that makes no sense** (20 Oct). Kept small by: an explicit spine of expert steps,
   each with its own sentence and still; guide warnings run before review, not after.
5. **Cost overrun.** Kept small by: lesson 1 alone first; the 1.5M stop rule; the three-attempt cap; a
   per-stage token report; the fallback above.
6. **Invented numbers.** Kept small by: reading classes where no value is sourced; no coil resistance,
   insulation figure or leakage limit without a checked quote; example values named once, as examples.
7. **The held I&T material.** Kept small by: lesson 1 uses none; lesson 4 asks first; the
   "readings that tell a story" lesson waits.
8. **Claims about the Navy.** Kept small by: lesson 3 on public sources, saying general marine practice
   and never "how the Royal Navy does it".
9. **It feels like a game.** Kept small by: no score, timer, stars or streak; routes shown side by side,
   never ranked; green only for a proven fix.
10. **Hidden fault leaking to Ask Claude.** The Ask Claude sheet sees the page's state. The hidden fault
    stays out of that state until he names it.
11. **Sameness over four lessons.** Each lesson is a different system (control, power, an insulated
    board, an RCD board), so it brings a different kind of reasoning.
12. **Limits.** One drawing and a lookup table keep the page well under 150 KB and each update far under
    150 ms. A bench adds about 10 to 20 KB to the case file. Watch the case file's size if a course
    grows past six benches.

---

## 6. Questions for Dan

1. Shall we build lesson 1, "The pump that won't run", as the test of this style?
2. May lesson 4 use your RCD group handouts as fault cases? They sit with the inspection and testing
   material you have on hold. If not, it uses public sources.
3. When you can, share the syllabi for the leading rate engineering qualifications and the Level 3
   marine engineering qualification. Lessons 2 and 3 would then be pitched at them.
