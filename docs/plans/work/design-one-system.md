# The Living Map: one system, grown a layer a lesson

A design for the next course's learning style and build style, written 24 Oct 2026 for Dan's
request: "analyse what's left to build and tell me what we should build next. I also want a new
innovative build style and learning style for the next one as a test."

Analysis only. Nothing in the app, the build or the db was changed. Read for it: the four reports
beside this file (`inventory.md`, `build-process.md`, `platform.md`, `learning-research.md`),
CLAUDE.md, `app/kit/KIT.md`, `app/kit/REFRESHER.md`, `docs/ARCHITECTURE.md` (sections 4, 6, 12),
`tools/course/attempt.mjs` and `guide.mjs`, `app/src/js/41-cards.js` and `72-map.js`, the shelf, and
the marine sources already quoted in `docs/courses/electrical/ac-circuits/research-notes.md`. Two
pages were read on the web for the storyboard's facts (section 4c). The research stage must harvest
them again before any quote is kept.

---

## 0. The short version

- **The style.** A course is one working drawing of one real system. For the pilot, that is a ship's
  main switchboard with its generators. Lesson 1 draws the whole plant once. Each later lesson starts
  on that same drawing, zooms into one part, and switches on a new live layer: what it does, the
  instrument that watches it, the rule that drives its numbers. Each lesson ends by zooming back
  out, and the new layer stays lit. By the last lesson Dan has the whole plant running, and he runs
  it as one job.
- **Why it should teach better.** Every idea gets a place on a drawing he already knows. That gives
  him the layered model of the system that the fault-finding research ties to better results, and
  the medium-fidelity "schematic that behaves" that gave the best transfer. Words sit on the drawing
  instead of under it. The drawing is explained once, not once a lesson. Sections 1e and 1f give the
  evidence and its limits.
- **Why it should build cheaper.** Today every lesson gets a new bespoke interactive and a new page
  machine. Here the course gets one tested **plant package**: one pure model, one drawing with its
  zoom views, one steps runner and the instruments. It is built, fact-checked and reviewed once. Each
  lesson adds a layer's detail and its screens as data. Estimate: about 0.55 to 0.6M tokens for each
  lesson after the plant exists, and about 1.0M a lesson for the whole first course with everything
  counted. That is roughly the same as today for the first course. Every later course on the same
  plant should come in at about 0.65 to 0.8M a lesson. These are reasoned guesses, not measurements.
- **App work for the test: none in the app.** Each lesson body carries its own copy of the plant
  package, so the app needs no change. Three small build tools are needed (an inliner, the writing
  lint and a still-size check), about 0.4M once. One app page ("Open the plant", about 0.6M) is
  worth building only after the pilot passes.
- **The pilot: "Three-phase power systems at sea"**, the shelf course whose blurb is "Generators,
  their speed and excitation, running in parallel, insulated and earthed neutrals, and earth fault
  detection". It runs to 5 lessons: the plant and one set; bringing a second set on the board;
  sharing the load; the insulated neutral and the first earth fault; and a watch on the board (the
  whole plant, as one job). It uses public sources only, with no Inspection and testing material
  and no amendments. Build lessons 1 and 2 first (about 2.6M plus 0.4M of tools), let Dan try them
  on his phone, and then decide.

---

## 1. The learning style

### 1a. What Dan sees: the map

One plant, drawn as a one-line diagram, portrait on a phone (a viewBox about 340 by 460):

```
   DG1          DG2                      EMERGENCY GEN
    |            |                            |
   [x]          [ ]  <- breakers             [x]
 ====== MAIN SWITCHBOARD BUS 440 V 60 Hz ======  ===== EMERGENCY BOARD =====
   |        |        |        |        |      <-- interconnector -->  |
 STEERING  FIRE    FANS   LIGHTING   SHORE                         LIGHTS
  GEAR     PUMP          TRANSFORMER  CONNECTION
```

- **One plant, labelled honestly.** The lead line says once that this is "an example ship's plant,
  simplified", and the loads are example values. Its ratings and loads live in the course's case file
  (`K.caseFile`, figures by id, practice values flagged), so every lesson prints the same 504 kW.
  Nothing claims to be how the Royal Navy lays out a board: we hold no Navy material
  (`inventory.md` section 5).
- **Layers.** A part he has learned is drawn in ink, with its detail. A part he has not reached yet
  is drawn solid and plain: a block with its name and nothing more. That follows the kit's rule that
  what is still there stays solid and carries a label, never a fade. Today's part gets an ink ring
  with a small teal "Today" label. Green appears once, as the course's finished mark. Red is only for
  a warning, such as an out-of-phase close or an earth fault. Amber is only for key terms in the
  words.
- **Zoom.** Zooming is a scale-and-fade between two drawn views, not a magnified picture. The
  overview shows blocks. A region view (DG2's breaker and the synchronising panel, the two governors,
  the neutral and the earth lamps) shows the parts and instruments at full label size, so text never
  falls below the kit's 13 units at 340 px. The camera move takes about a second (`K.anim` and
  `K.ease`), and the new parts arrive about 0.6 s apart (`K.fade(el, K.arrive(...))`).
- **It behaves.** One pure model computes every number the plant shows: frequency from engine
  speed, the synchroscope angle, the voltage across the open contacts, each set's kW and power factor,
  and the line-to-hull voltages with an earth fault. Every rule comes from the research and is shown
  where it acts (KIT.md: "draw the mechanism as it physically works").

### 1b. A typical lesson, screen by screen

About 12 to 14 screens, most of them 25 to 55 words. None goes over 90 words, and the lint refuses a
screen that does.

| Beat | Kind | What Dan does | What it is for |
|---|---|---|---|
| 1. Where we are | SHOW | Sees the whole plant, the learned layers in ink and today's part ringed. One short paragraph says why today's part matters now. | Puts the new idea in its place before it is taught. |
| 2. From last time | DO | Answers one question on an earlier layer, on the map: tap the part, or choose. | Retrieval and interleaving at no build cost. The question reuses the drawing. |
| 3. First step | DO | Answers a first-step question on today's layer, then taps "Sure" or "Not sure". If he is right and sure, he is offered "Skip to the practice". | Expertise reversal: he skips what he knows. A confident miss gets the longer explanation. |
| 4. Zoom in | SHOW (motion) | Watches the camera glide into today's region as the new parts arrive one by one. | Spatial continuity. New terms appear on the drawing, highlighted. |
| 5. The mechanism | SHOW (motion) | Watches the rule act. In lesson 2: two phasors, the gap between their tips, and the lamps following that gap. | The cause is drawn, so the words can stay short. |
| 6. Predict, then play | DO | Predicts first, then drives one or two controls on the zoomed plant. The model answers. | Predict before reveal, with the answer within about 3 seconds of his first move. |
| 7. Practise on the map | DO x2-3 | A choice, a typed figure from a shown rule, and "what happens if a new hand does this?" | Mixed retrieval, and studying someone else's mistake. |
| 8. Say it back | written | Explains it to a new hand in his own words. Claude marks it against the lesson's points (`K.written`). | Conceptual self-explanation, and practice at explaining, which leading needs. |
| 9. Zoom out | SHOW + play | Watches the camera return to the whole plant. The new layer is now lit. He can play with every layer learned so far. | The "grown" moment, and free exploration. |
| 10. Keep this | summary | Gets a card: what it is for, the rule, the traps, the figures, and where it lives, shown as a ringed spot on the map. | A reference he can use on a job. Its "where it lives" is literal. |

**The "just read" way.** The read-through already shows each step as a still with its sentence, and
each question as a worked example. In this style that becomes a guided tour of one drawing: overview,
zoom, the mechanism, the right close, and back out. It suits "a reference for myself in the real
world" better than a run of unrelated pictures. Every still is a named (view, layer, state), so the
build can draw and check every still before review. Today the guide works its stills out after the
event, which is where "the images are blank" (20 Oct) came from.

**The "quiz me" way** is the steps lesson above, with the same puzzles going to the review box. Every
puzzle shows a drawing he already knows, so he spends his attention on the question.

### 1c. Across a course

1. **Lesson 1 draws the whole plant** and lights the first layer. The opening is quick, because he
   knows a switchboard from shore work. What is new is that the ship makes its own supply.
2. **Each middle lesson adds one layer.** Its opener asks about an earlier layer on the same map.
3. **The last lesson adds no new layer.** It runs the whole plant as one job, a scenario in short
   stages, each a decision on the map. It ends with a written handover to the next watch. That is a
   whole task in the 4C/ID sense, and it also gives his Level 4 leadership path some practice in
   briefing.
4. **The course page shows the map growing at no cost.** The current node of "Your path" already
   shows the lesson's first drawing (ARCHITECTURE section 12, "the topic page"). Here, that drawing is
   the plant with the lesson's part ringed. The path becomes the map filling in.
5. **The Book becomes an atlas** of one plant. Its chapters' plates are the same drawing at
   different zooms, and the glossary comes from one parts register, so names never drift.
6. **Review** works as it does today: puzzles from the guides, spaced and mixed across courses by
   `60-today.js`.

### 1d. How it keeps Dan's rules

| Rule | How this style keeps it |
|---|---|
| Plain own words, never narrating sources (20 Oct) | One writer per unit writes the screens as data, with the lint in the loop: no "your slides", no "(p.", no "the course", no brackets, sentences under about 25 words. Citations stay as data. |
| At most about 90 words a screen (21 Oct) | The target is 25 to 55. Labels sit on the map, so the paragraph never has to say what the picture shows. Counted by the lint, not by a reviewer. |
| Faithful: nothing invented | Every number comes from a model rule tied to a source id, a control, or a case-file figure. The example plant and its loads are said to be examples once. Any lesson value with no source, such as a practice target for the slip speed, is marked as the lesson's own setting. Contested points are taught as contested: ships differ on insulated and earthed neutrals. |
| Calm reading, colour for meaning | Ink for learned layers and controls, teal for small labels, red only for warnings, amber only for key terms, green only for finished. No decoration on the map. The research's "seductive details" warning applies to a ship drawing too. |
| Light mode, phone first, desktop equally good | The overview and every zoom view are tested once at 340, 720 and 1040 px, at Text size XL and in both themes, before any lesson is built. On a laptop, `K.stage` puts the controls beside the map. |
| Nothing in the way | A lesson opens straight onto the map. "Skip to the practice" is offered when he is right and sure. No streaks, no badges. |
| Both ways through | Both kept, and the read-through improves (a tour of one drawing). |
| Learn by doing | Every layer has a control he drives: governor, voltage regulator, breaker, the feeder he opens to hunt an earth. |
| Not a job card (D&V, 20 Oct) | The lessons teach the why and let him play with the plant. The plant is a model, not a checklist. |

### 1e. Why it should work (from `learning-research.md`)

- **A layered model of the system.** Structured troubleshooting training that paired a strategy
  with a layered functional breakdown of the system gave trained technicians twice as many faults
  solved, in less time. The companion naval study found novices struggled to reach the right system
  knowledge at each stage and to keep track of where they were (section 6, moderate). Jonassen and
  Hung's design puts a layered conceptual model first (a proposal, untested). Functional flow
  diagrams helped learners build more accurate knowledge of how the parts work (section 6). The map
  is that layered model, made visible and kept in one place.
- **Medium fidelity: a schematic that behaves.** In the fidelity meta-analysis for troubleshooting
  professionals, medium fidelity gave the highest transfer, and low fidelity was worst (section 6,
  moderate). The plant is a one-line diagram whose numbers move by real rules. It is not a
  photo-real panel, and not a static picture.
- **Words on the diagram.** Split attention, g = 0.63 (section 9, strong). For someone who already
  knows a topic, the diagram alone can beat diagram plus text. One map, learned once, lets later
  lessons carry fewer words. This is the root fix for "a bit too much text after the diagrams".
- **Skip what he knows.** Expertise reversal, and the first-step test that predicted expertise well
  and cut testing time (section 4, moderate). That is beat 3.
- **Predict, with confidence.** Prequestions g = 0.54. Confident errors are the ones most often
  corrected (section 5, moderate to emerging).
- **Mixed questions where the skill is choosing.** Interleaving g = 0.42, strongest when cases look
  alike but differ in what matters (section 3, moderate). The openers and the final lesson ask which
  control, which meter and which feeder.
- **Whole tasks.** 4C/ID, d = 0.79, from a small meta-analysis, so treat the number with care
  (section 7). The last lesson is a whole task.
- **Explaining.** Self-explanation g = 0.55, and conceptual prompts g = 0.87 (section 8). Beat 8
  asks why, not "how sure are you".
- **Another person's mistake.** Vicarious failure gave the same conceptual gains as failing yourself
  (section 5, emerging). Each lesson has one "a new hand does this" question.
- **Retrieval and spacing** (section 2, strong): unchanged, through the puzzle box.
- **A reference that lives with the lessons.** Job aids plus training beat either alone (section 11,
  weak to moderate). The map, with each Keep this card's spot on it, is the reference. The plant page
  in Tier 1 (section 3) makes it one tap away.

**Honest limits.** No study tests "one persistent drawing across a course". The claim that a single
map works as a memory index is my reasoning from the layered-model and split-attention evidence, not
a finding. The research also warns that new ground needs guidance before problems
(`inventory.md` on candidate 2; research section 4). That is why this style shows and explains on
the map before it asks him to run anything, which suits generators, ground Dan has not covered.

### 1f. How it improves on today's lessons

1. **A place for every idea.** Today each lesson brings a new picture. The lesson JSON even has a
   `whatAmILookingAt` field, because every picture has to be explained. Here the picture is
   explained once.
2. **Fewer words**, because the map carries the labels, as above.
3. **Numbers that agree across lessons.** One model and one case file mean no "another core
   1.80 km" against 2.40 km (Subsea i1), and no card holding a replaced figure (D&V i8).
4. **A whole task at the end**, which no live course has.
5. **A better read-through:** one continuous tour, with every still planned.
6. **Room to grow.** A later course on the same shelf adds layers to the same plant (section 4e).

---

## 2. The build style

### 2a. What gets built

**Once per course: the plant package** (`$D/system/`):

| File | What it is | Size budget |
|---|---|---|
| `system-sheet.json` | The contract: a parts register (id, name, one plain line, first lesson), layers (id, lesson, what switches on, the rules each adds with their source ids), views (id, region, parts shown in detail, label budget), each lesson's opening state, and the case-file ids of the example values | about 10 KB |
| `plant.model.js` | One pure model, `(state) -> outputs`, for every layer, with 30 to 50 `K.check` known answers, sourced where a source states them | 8 to 12 KB |
| `plant.map.js` | The drawing: the overview, about 5 zoom views, layers on and off, tap targets of 44 px, `aria-label` following the state | 20 to 25 KB |
| `plant.steps.js` | The steps runner: screens as data with Check, Why?, Continue, the Sure / Not sure chips, "Skip to the practice", and the `read` and `still` fields that `guide.mjs` reads. It is lifted from AC circuits' proven steps machinery and written once per course, not once per lesson. | 12 to 15 KB |
| `plant.instruments.js` | The meters, synchroscope dial, lamps, droop chart and earth lamps, all wrapping at 340 px | 8 to 10 KB |
| `plant.test.html` | Every view at every layer and every planned still, through the existing self-test, onto one contact sheet | n/a |

**Per lesson:**
- `iN.lesson.json`: the screens as data, the only home of the words. Each screen names its view,
  layers and state, and carries `words`, `read`, `still`, its question, `slips`, `why`, and the
  `written` points and `summary` as today.
- `iN.glue.js`: anything the lesson needs that the package lacks. Usually it is small: a scenario
  stepper, or a free-play panel.
- `iN.body.html`, made by the new `tools/course/system.mjs`: package plus glue plus the screens, in
  one body under 150 KB (the budget is about 100 KB). The app sees an ordinary steps lesson.

**This removes "words in three places"** (`build-process.md`, cause 1). The builder never retypes a
word. The fact-checker reads the exact words Dan will see. A fix to the words is a data change, with
no new page rebuild.

### 2b. Stages, models and effort

CLAUDE.md's table stays as it is. The style adds once-only stages, and each takes the setting of the
row it matches. I would not change any setting: the saving comes from smaller tasks, not lower
effort, and Dan set Build to xhigh on 11 Oct.

| Stage | When | Model | Effort | What it does | Gate |
|---|---|---|---|---|---|
| Course brief and system sheet | once | Opus | high | The brief as today, plus the plant: parts, layers, views and example values. Dan agrees it. | Dan's yes |
| Research | once, up front, aimed at the sheet's list of rules and facts | Sonnet | high | Quote checker as today. After that, top-ups only for named gaps. | `sources.mjs` |
| **Plant build** | once (pilot: base map plus layers 1-2; later layers added in phase B) | Opus | xhigh | Model, map, views, runner, instruments, test page. At most 3 attempts (Dan's rule, applied to the plant as one interactive). | Self-test of every view and still at 340/720/1040 px, XL and dark; one contact sheet |
| **Plant fact-check** | once per layer batch | Opus | high | A fresh reader recomputes every rule, constant and `K.check` against the sources | `validate.mjs verify` |
| **Plant review and fix** | once per layer batch | Opus xhigh / Opus high | as table | Drawing, motion, clutter at 360 px, label budget, colour meaning | Scores of 4 or more |
| Unit writer (write and plain edit merged) | once per unit of 2 or 3 lessons | Opus | high | Screens as data in one voice, lint in the loop, from a per-lesson source pack | `validate.mjs lesson` and the lint |
| Fact-check | per lesson | Opus | high | The final on-screen words, figures and questions, against the pack and the model | `validate.mjs verify --final` |
| Layer build | per lesson | Opus | xhigh | Today's layer detail plus glue. At most 3 attempts. | `attempt.mjs` |
| Review (teaching and motion) | per lesson | Opus | xhigh | As today, with the counts already done by the lint, plus a continuity check: same parts, same places, same names | Scores of 4 or more |
| Fix | per lesson | Opus | high | As today | `attempt.mjs` ok |
| Confirm | per lesson | Sonnet | medium | Skipped when only polish, lint or layout findings were raised (re-running the lint and self-test covers those) | |
| Guide and assemble | once | Sonnet | low | As today, plus a check that no still is over its size budget | `assemble.mjs` |

**Stays:** Dan's yes on a brief; research quote-checking, word for word on the cited page; the fresh
fact-check, now done twice (once on the physics, once on the words); a fresh page review; the 340 px
self-test in both themes and at XL; at most three attempts; a pilot before the rest; the
read-through, Book and puzzles; one contact sheet per check; the token report to Dan.

**Goes, or merges:**
- The per-lesson research top-up (about 15% of a lesson today). Research is done once, up front.
- The separate plain-edit stage. It merges into the unit writer, with the lint doing the counting.
- The bespoke interactive and page machine for every lesson.
- The builder retyping words.
- Confirm for findings a script can confirm.

**Reused:**
- Across lessons: the whole package, the case file, the research file (cut into packs by id), the
  parts register, and the steps runner.
- Across courses on the same shelf: the plant itself (section 4e), plus the lint and `system.mjs`.
  If the runner proves itself, it becomes the kit steps engine (`platform.md` 3.1), shared by every
  course.

### 2c. Expected tokens

Reasoned estimates, built from the measured per-stage figures in `build-process.md`. They are not
measurements, and estimates have run low before (Motors: 0.7M estimated, 1.05M measured).

**Per lesson once the plant exists:**

| Stage | Today, refresher (measured, about 1.0M) | Living Map (estimate) |
|---|---|---|
| Research top-up | about 0.15M | about 0.02M (named gaps only) |
| Write and plain edit | about 0.25M | about 0.12M (the unit writer's share, from a pack) |
| Fact-check | about 0.10M | about 0.08M (words only; the physics is checked once) |
| Build | 0.20 to 0.38M | about 0.18M (layer detail and glue) |
| Review | about 0.15M | about 0.12M |
| Fix and confirm | about 0.15M | about 0.07M |
| **Total** | **about 1.0M** | **about 0.55 to 0.6M** |

**The pilot course, all in (5 lessons):**

| Phase | What | Tokens (about) |
|---|---|---|
| A | Brief and system sheet 0.25; research for lessons 1-2 0.35; plant build (base map plus layers 1-2) 0.5; plant fact-check 0.1; plant review and fix 0.25; lessons 1 and 2 at 0.57 each; guide 0.05 | **2.6M** |
| A, one-off tools | `system.mjs` inliner and plant test runner 0.2; writing lint 0.15; still-size check 0.05 (reported separately, shared by later courses) | **0.4M** |
| B | Research for layers 3-4 0.25; adding layers 3-4 to the model and map, with fact-check 0.2; lessons 3 to 5 at 0.57 each (lesson 5 adds no layer); guide 0.03 | **2.2M** |
| Total | 5 lessons | **about 4.8M, plus 0.4M of tools** |

Against today's process, the same 5 lessons would cost about 5 x 1.0 + research 0.7 + brief 0.2 =
about 5.9M, or about 9M at the full-process rate of 1.65M. So the first course in this style saves
perhaps 15 to 20%. If the estimate runs a third low, as Motors did, it saves nothing. **The real
saving comes from the second course on the same plant.** That course needs no plant build, only
its layers, at about 0.65 to 0.8M a lesson all in, against about 1.1 to 1.2M today.

**Stop rules:**
- If phase A's plant build passes 0.9M, or lesson 2 passes 0.8M, stop and report before phase B.
- If any layer takes three attempts, stop and fix the system sheet, as RUNBOOK section 5 says for a
  brief.

### 2d. Failure modes it removes and adds

| Removes | Why |
|---|---|
| Builds blocked by width at 360 px. All three third-attempt failures were a readout row or a label too wide. | The map, its views and its instruments are tested once at 340 px and XL before any lesson. Lessons reuse them, not reinvent them. |
| Figures drifting between lessons (Subsea i1, D&V i8) | One model and one case file, so one value |
| Words drifting between the JSON, the final file and the body; a step behind a number never reaching a screen | The screens are the lesson data. The rule is drawn on the instrument it drives. |
| Read-through stills blank or showing the wrong state | Every still is a planned (view, layer, state) and rendered in the plant test |
| A research file that only grows, with prompts doubling | One research file per plant, cut into per-lesson packs by id |
| Writing rules enforced only by xhigh reviewers | The lint counts words, footnotes, narration, brackets and sentence length before any reader sees them |

| Adds | How it is kept small (section 5 has more) |
|---|---|
| A model bug spreads to every lesson | A deep fact-check once, 30 to 50 checks, each lesson pinned to a package version, the plant test re-run on every lesson build |
| Clutter on a 360 px phone | Level of detail by view, at most about 10 labels a view, the plant reviewed at 340 px before any lesson |
| "Same picture again" | Every layer brings its own instrument and motion. The map is the frame, not the whole show. |
| More is spent before Dan sees anything | Phase A is two lessons, with stop rules |
| The base drawing has no room for a later layer | The system sheet lists every layer before drawing begins. Space is reserved. Later layers add parts and never move old ones. |
| Guides grow, because a map still can be heavy (stills are 10 to 36 KB each today) | Views cull parts outside the frame, the overview draws blocks only, and each still has a 15 KB budget, checked in the plant test |

---

## 3. App work needed

**Tier 0: needed for the test. Build tools only, no app code.**

| Piece | What | Size |
|---|---|---|
| `tools/course/system.mjs` | Inlines the plant package, the lesson's glue and its screens into one body. Records the package version in the lesson. Refuses a body over 150 KB. Runs `plant.test.html` through the existing `render.mjs` and puts every view and planned still onto one contact sheet. | S, about 0.2M |
| Writing lint in `validate.mjs` | The 90-word screen, sentence length, footnote count, narrated-source patterns, brackets, the right answer in the same position on every question, a `read` that gives the answer away. For this style, also: every screen names a view in the sheet, and part names match the parts register. It pays off on every course (`build-process.md` lever B). | S, about 0.15M |
| Still-size check in `guide.mjs` | A warning when a still is over 15 KB or a guide is over 200 KB | XS, about 0.05M |

Everything else already exists. The case file passes the plant's figures (`K_CASE`). `K.written`
marks "say it back". `K.summary` draws Keep this, and its "where it lives" gets a map still. The
topic page shows each lesson's first drawing, so the path shows the map growing. Puzzles come from
the guide. No live Claude turn, no branching and no new card type is needed.

**Tier 1: only if the pilot passes.**

| Piece | What | Size |
|---|---|---|
| "Open the plant" page | A `topics/{tid}/system/file` document, written by `assemble.mjs` like the case file, holds the plant body. The course page gets a card showing the map, and `#/plant/:tid` mounts it with `K_SYSTEM = {done: [iids]}`, so the layers he has finished are lit. Tapping a region sends a new `open` message, and the host opens that lesson. This is the explorable reference, one tap from the course page. | S to M, about 0.6M |
| Steps runner promoted to the kit | `platform.md` 3.1. After two courses use the package runner, it becomes `K.steps` for every course. | L, 1.5 to 2.5M (shared with every style) |

**Tier 2: later.** Plant drills as review cards ("bring DG2 on the board" as a target card that
mounts the plant with one task, M, about 1M), and saving the Sure / Not sure tap (`platform.md`
3.11, S).

---

## 4. The pilot: "Three-phase power systems at sea"

### 4a. Why this course

- **It is one system.** Generators, the bus, synchronising, sharing and the neutral are one plant by
  nature. The shelf blurb is a list of that plant's layers. `inventory.md` already suggests "one live
  switchboard he runs across all four lessons" for it.
- **Dan would value it.** It is the plant he will maintain on the electrical path, and the closest
  candidate to a Level 3 marine engineering syllabus. AC circuits passed alternators, synchronising
  and load sharing on to this course by name. The insulated neutral is "the single biggest difference
  between shore work under BS 7671 and a ship" (`inventory.md`, candidate 4).
- **It respects his instructions.** No Inspection and testing material and no test procedures, so
  his green light is not needed. Nothing on amendments or Building Regs.
- **The style fits its risk.** The ground is new to him, and the research says new ground wants
  guidance first. This style is guidance-first and spatial, where a problem-first style would be the
  riskier bet here.
- **Size.** 5 lessons, the top of the range. Lessons 1 and 2 are the test. Lessons 3 to 5 follow only
  on Dan's yes.
- **Why not Fault-finding** (inventory rank 1)? Its cases span domestic final circuits, S and Y plan
  heating and motor starters: several systems, not one. Four of its best handouts also sit under the
  Inspection and testing hold. It suits a problem-first style better. Once the plant exists, "Faults
  at sea" can run on it (section 4e).

**Sources.** Public sources only. Already quoted and checked in AC circuits' research notes:
- "The majority of ships have a 3 phase, 3 wire, 440V insulated neutral system..." (JEE129 notes).
- "60 Hz is the most common frequency adopted for use on board ship..." (the same notes).
- Warships' 440 V / 60 Hz systems "were operated without any connection to the ship's hull" (IMarEST).
- kVA rating and "630 kVA = 504 kW at 0.8" (the AD630-6 datasheet).
- Under- and over-excitation in parallel (PEG-3722).
- MCA ETO lines 3.13, 3.14 and 3.15.

The research stage must find the rest: the frequency rule, droop, reverse power, earth lamps and
insulation monitors, and sectionalising. Ask Dan once whether he holds any Navy notes on generation
or switchboards. If he does, they come first.

### 4b. The lessons

| # | Lesson | Layer switched on | New instrument | Builds on (never re-taught) | Sources |
|---|---|---|---|---|---|
| 1 | **One plant, one page: what a set does** | Prime mover, alternator, governor and voltage regulator. Speed sets frequency (f = poles x rpm / 120). Excitation sets volts. Rated in kVA. | Generator panel: V, Hz, kW and A meters. Every motor on the map changes speed with the frequency. | AC circuits 1 and 8-10 (the turning coil, kVA, three-phase); his switchboard work ashore | 440 V, 60 Hz and kVA quoted; f = p x n / 120 to be sourced |
| 2 | **Bringing a second set on the board** | Synchronising: the four conditions, the synchroscope, dark lamps, the moment to close, the check-synchronising relay | Synchroscope and lamps across DG2's breaker | Phasors (AC circuits, Complex numbers) | Mostly found (section 4c) |
| 3 | **Sharing the load, and a set that motors** | The governor's droop shares kW and the voltage regulator shares kVAr. Unloading a set. Reverse power, where a set that joins slow or loses fuel is driven as a motor and the relay trips it. | A droop chart beside the two kW meters; power factor meters; the reverse power relay | Power factor (AC circuits 8-9) | Excitation and power factor quoted; droop and reverse power settings to be sourced |
| 4 | **The insulated neutral and the first earth fault** | No star point to the hull. The first earth fault does not trip, and the healthy lines rise towards line voltage to the hull. A second fault is a short through the hull. Earth lamps and the insulation monitor. Finding the earth by opening feeders one at a time. Contested: high-voltage plants often earth through a resistor. | Earth lamps and the insulation monitor; feeder breakers he opens to hunt the fault | IT systems from BS 7671's system types; ADS from D&V 6, as the contrast; insulation resistance from Subsea | Insulated neutral quoted; the rest to be sourced |
| 5 | **A watch on the board** | No new layer. Everything is live. | None: the whole plant | Lessons 1-4 | The scenario's rules come from 1-4 |

In lesson 5, the scenario plays in short stages:
1. The load climbs.
2. He brings DG2 in.
3. He shares the load.
4. An earth shows on the monitor, and he finds it.
5. DG1 loses fuel, and the reverse power relay trips it.

Each stage is one decision on the map with at most 40 words of why. The lesson ends with "Brief the
oncoming watchkeeper in four lines", marked by `K.written`.

The emergency generator and emergency board are drawn from lesson 1 as plain blocks. They are the
next course's layer, "Protection and the emergency board", which shows the plant growing beyond one
course.

### 4c. Storyboard: lesson 2, "Bringing a second set on the board"

The opening state comes from the case file. The bus is at 440 V and 60.0 Hz. DG1 and DG2 are each
630 kVA, 504 kW at power factor 0.8 (quoted from the AD630-6 datasheet, an example set). DG1 carries
380 kW, and the fire pump needs another 110 kW (example loads). The kit lead line, shown once, reads:
"An example ship's plant, simplified. The loads are example values."

**Source key** (each must be harvested again by the research stage before use):
- **[PEG]** PEG-3722 Electrotechnology, "Part 7: Parallel Operation of Generators", eCampus Ontario.
  Found 24 Oct:
  - "1. Equal terminal voltages 2. Equal frequency 3. Phase voltages in proper phase relation 4.
    Phase sequence must be the same"
  - "rotation of the pointer in the 'fast' direction when the incoming machine's frequency is
    greater than the system's"
  - "close the breaker just before the synchroscope pointer approaches the vertical position and
    begins to move slowly in the 'fast' direction. This action ensures that the incoming generator
    gradually takes on a small load"
  - "Adjust the frequency of the alternator by controlling the speed of the prime mover."
  - "Adjust terminal voltage using a voltage regulator or rheostat to match the system voltage."
- **[WIKI]** Wikipedia, "Synchronization (alternating current)". Found 24 Oct:
  - lamps "will be bright" when opposite and "dark" when matching
  - "if the phase difference is large, there will be heavy cross-currents which can cause voltage
    fluctuations and, in extreme cases, damage to the machines"
  - a "synchro check" relay "prevents closing the generator circuit breaker unless the machine is
    within a few electrical degrees of being in-phase"
- **[RULE]** Computed from a rule shown on the screen. The fact-checker recomputes it.
- **[TBS]** To be sourced. If no source is found, the point is cut or said as the lesson's own
  setting.

---

**Screen 1. Where we are** (SHOW, 46 words)
- **Picture:** The overview. Layer 1 is in ink. DG1's breaker is closed and the bus is live. DG2 is
  drawn with its breaker open. An ink ring and a teal "Today" sit on DG2's breaker. DG1's meter
  reads 380 of 504 kW.
- **Words:** "DG1 is carrying the ship on its own: 380 kW of the 504 kW it can give. The fire pump needs
  another 110 kW, which would leave almost nothing spare. DG2 is running, but its breaker is open.
  Today: joining DG2 to a live board, safely."
- **Numbers:** case-file figures, and 504 − 490 = 14 kW spare [RULE].

**Screen 2. From last time** (DO, choice, tap on the map or a button)
- **Question:** "DG1 is the only set on the board. Which control sets the frequency of every motor on
  the ship?" The options are DG1's governor, DG1's voltage regulator, and the fire pump's starter.
- **Answer:** the governor.
- **Why:** "With one set on the board, its engine speed is the ship's frequency. The governor holds
  that speed." [PEG, the prime mover sentence; lesson 1's rule]
- **Slip, the voltage regulator:** "That sets the volts, through the excitation. Speed sets the
  hertz."

**Screen 3. First step** (DO, choice, then confidence)
- **Question:** "Before DG2's breaker closes, one of these does not have to match. Which one?" The
  options are voltage, frequency, phase sequence, and the load each set carries.
- **Answer:** the load each set carries.
- **Then:** "How sure were you?" with Sure / Not sure. Right and sure gives "You have the rules.
  Skip to the practice, or zoom in anyway." The skip goes to screen 10.
- **Why** (33 words): "Load is shared out after the breaker closes. Until then DG2 carries nothing. Voltage,
  frequency and phase sequence must all match, and the two must be in step at the moment of
  closing." [PEG]
- **Slip, phase sequence:** "With the sequence wrong, the three phases can never all line up at
  once." [RULE: phasor reasoning, for the fact-checker]
- A confident miss gets the longer why plus screen 5 played slowly.

**Screen 4. Zoom in** (SHOW, motion, 47 words)
- **Picture:** The camera glides to DG2's breaker. Arriving one by one: the bus V and Hz meters, DG2's
  V and Hz meters, the synchroscope (FAST and SLOW marked, twelve o'clock at the top), and three
  lamps across the open contacts.
- **Words:** "This is DG2's breaker up close. Above it is the live bus. Below it is DG2, running but not
  connected. Two instruments watch the gap between them. The **synchroscope** shows whether DG2 is
  ahead of the bus or behind it. Three **lamps** sit across the open contacts."
- **Read:** the same words.

**Screen 5. The mechanism** (SHOW, a 5-second demonstration, 50 words)
- **Picture:** An inset shows two phasors turning, the bus's and DG2's, with DG2 creeping ahead. A
  line joins their tips. The lamps' brightness follows that line, and the synchroscope pointer
  follows the angle.
- **Words:** "Each voltage is a phasor turning 60 times a second. DG2 runs a little faster, so its
  phasor creeps ahead. The pointer shows the angle between the two. Each lamp feels the gap between
  the two tips. When the phasors line up, the gap closes and the lamps go dark."
- **Caption:** "Lamp voltage = 2 × 254 V × sin(half the angle). 254 V is 440 V ÷ √3."
- **Sources:** [WIKI] for dark and bright; [RULE] for the gap.
  - The rule holds for three equal lamps across a balanced three-wire set. By symmetry the lamps'
    common point sits at the middle, so each lamp sees its own phase's difference. The fact-checker
    confirms this.
  - Checks: 0° gives 0 V, 90° gives 359 V, 180° gives 508 V.
- **Still:** DG2 30° ahead, the lamps half lit.

**Screen 6. Predict** (DO, choice)
- **Question:** "DG2 reads 60.2 Hz and the bus reads 60.0 Hz. Which way will the pointer turn?" The
  options are towards FAST, towards SLOW, and it stands still.
- **Answer:** towards FAST. After he answers, the pointer turns, and a readout appears: "One turn every
  5 s".
- **Why:** "DG2 gains 0.2 of a cycle on the bus every second. So the pointer turns towards FAST, once
  every 5 seconds." [PEG for the direction; RULE: time for a turn = 1 ÷ the difference]

**Screen 7. Match DG2 to the bus** (DO, play, two controls)
- **Lead:** "Bring DG2's voltage to 440 V with its voltage regulator. Then set its governor so the
  pointer turns slowly towards FAST."
- **Controls:** DG2 voltage regulator, Lower / Raise, starting at 452 V. DG2 governor, Lower / Raise,
  in 0.01 Hz steps, starting at 60.30 Hz.
- **Readouts:** DG2 volts, DG2 hertz, and "Pointer: one turn every N s, towards FAST".
- **Done when:** the volts are within 2 V of the bus, and the pointer takes 10 s or more a turn,
  towards FAST.
- **Sources:** [PEG] for both adjustments. The 10 s target is [TBS]: a typical slip used at sea. If
  none is found, the screen says "slowly" and calls 10 s the lesson's own practice setting.

**Screen 8. The close** (DO, play)
- **Words:** "Close DG2's breaker when the moment is right." There is one button: "Close DG2's
  breaker".
- **Model:** reads the angle at the press.
  - **Within the window, approaching twelve from the SLOW side while turning towards FAST:** "DG2 is
    on the board. It came in a touch fast, so it took a small share of the load at once." DG2's kW
    meter rises a little, by the model's droop rule (the layer is drawn in lesson 3 but already in
    the model).
  - **Outside the window:** a red warning: "The contacts closed with 299 V across them. Expect a heavy
    rush of current and a jolt on both sets." The voltage is worked out from the screen 5 rule at the
    angle of the press (299 V at 72°). Then "Try again".
- **Sources:** [PEG] for the small load; [WIKI] for cross-currents. The window width is [TBS]: a
  check-synchronising relay's typical setting. If none is found, it is "a few degrees" [WIKI], set
  in the model as a labelled lesson value.
- **Read:** "The breaker is closed just before twelve, with the pointer turning slowly towards FAST.
  DG2 joins and takes a small share of the load straight away."
- **Still:** a close 5° before twelve.

**Screen 9. Why a touch fast** (SHOW, 55 words)
- **Picture:** The moment after the close. DG2's kW meter shows a small figure, and DG1's has fallen
  by the same amount.
- **Words:** "Close as the pointer creeps towards FAST, just before twelve o'clock. At twelve the sets
  are in step, and the gap across the contacts is zero. Coming in a touch fast, DG2 pushes in a
  little power the moment it joins. It arrives as a helper, not as one more load on DG1."
- **Source:** [PEG]. Why "just before" and not "at" twelve is [TBS]: the breaker's closing time. If
  unsourced, the screen does not explain it.

**Screen 10. A new hand's mistake** (DO, choice)
- **Question:** "A new hand presses Close with the pointer at nine o'clock, spinning towards SLOW.
  This board has no check relay. What happens?" The options are: DG2 joins smoothly; a heavy rush of
  current and a jolt on both sets; and the breaker refuses to close.
- **Answer:** a heavy rush of current and a jolt on both sets.
- **Why** (49 words): "At nine o'clock the phasors are a quarter turn apart, so 359 V sits across each
  contact. Closing forces the sets into step with a heavy rush of current. Many boards fit a
  **check-synchronising relay**. It stops the breaker closing unless the sets are within a few
  degrees." [RULE; WIKI]
- "Many boards" is [TBS]. If unsourced, the sentence becomes "A check-synchronising relay, where one
  is fitted, ...".

**Screen 11. Work it out** (DO, typed, `K.answer`)
- **Question:** "The bus reads 60.0 Hz. DG2 reads 60.05 Hz. How many seconds does the pointer take for
  one turn?"
- **Answer:** 20 s.
- **Slip, 0.05:** "That is the difference in hertz. One turn takes 1 ÷ 0.05 seconds."
- **Why:** "DG2 gains one twentieth of a cycle a second, so one full turn takes 20 seconds, towards
  FAST." [RULE]

**Screen 12. Say it back** (written, `K.written`)
- **Task:** "Explain to a new hand why you wait until the pointer turns slowly towards FAST, then
  close just before twelve."
- **Points:**
  1. At twelve the sets are in step: no voltage across the contacts, and the lamps are dark. [WIKI,
     RULE]
  2. Slowly means the frequencies are nearly equal, so the moment can be judged and the sets stay in
     step. [RULE and PEG; the fact-checker words it]
  3. A touch fast means DG2 takes a small share as it joins. [PEG]
  4. Far from twelve, there is a heavy rush of current and a jolt. [WIKI]

**Screen 13. Zoom out, and try it** (SHOW plus free play, 45 words)
- **Picture:** The camera returns to the overview. DG2 is now in ink with its breaker closed, and both
  sets feed the bus. The fire pump starts, and both kW meters rise.
- **Free play:** DG2 governor, Open / Close DG2's breaker.
- **Words:** "Back to the whole plant. Two sets now feed one bus, held in step by the bus itself. The
  fire pump can start. Try it: open DG2's breaker and bring it in again. How the two share the load
  comes next."
- **Read:** the first three sentences only.
- "Held in step by the bus" is [TBS], from [WIKI]'s "Synchronous operation" section.

**Screen 14. Keep this** (`K.summary`)
- **For:** Joining a second set to a live board.
- **Rule:** Match volts with the voltage regulator. Match hertz with the governor. The phase sequence
  must be the same. Close in step: the pointer turning slowly towards FAST, just before twelve.
- **Traps:** Closing far from twelve gives a heavy rush of current and a jolt. A check relay, where
  fitted, blocks it. Joining slow means DG2 is driven by the bus ([TBS], taught in lesson 3).
- **Figures:** bus 440 V, 60 Hz. DG1 and DG2 are 630 kVA, 504 kW at 0.8.
- **Where it lives:** the synchronising panel on the main switchboard, by each set's breaker ([TBS]
  for "by each set's breaker"), with a map still with the panel ringed.

---

**Puzzles for review:** screens 2, 3, 6, 10 and 11, plus screen 12 as a written card. Every one draws
the same panel, so a puzzle reads in seconds.

**Word check:** the longest screen has 55 words, and every SHOW screen is under 60.

**Lesson 1's opening, for continuity:**
1. The plant arrives block by block with "Ashore, the grid is always there behind the board. At sea,
   the ship makes every watt it uses. This is the whole plant on one page."
2. A tap-tour question he will find easy: "Tap the breaker you would lock off to work on the fire
   pump's cable."
3. The zoom into DG1.

### 4d. How we judge the test

**Dan tries lessons 1 and 2 on his phone, once quizzed and once read through.** We ask him four
things:
1. Could you point to where synchronising happens, and say what DG2's breaker joins?
2. Did one drawing help, or did it feel like the same picture again?
3. Was anything too small, too busy, or too wordy on your phone?
4. Would you open the plant on its own, as a reference?

**Signs it worked:**
- He says, in some form, "I can see how it all fits together".
- He moves on to lesson 3 within the week without being asked.
- His screen 12 answer meets at least 3 of the 4 points on the first go.
- He makes no comment about text length.

**Signs it failed:**
- "Same picture every time."
- "Too small" or "too busy".
- "What am I looking at?"
- He switches to "just read" and stops.

**What the app already records:**

| Measure | Where | Good sign |
|---|---|---|
| Time per lesson | `startedAt` and `doneAt` in progress | Not longer than a Motors lesson, despite the play |
| Way chosen | `way` | Both used, and the read-through reopened later (the reference use) |
| Say-it-back quality | `written[...].met` | 3 or 4 of the points met on the first go |
| Retention | FSRS results on this course's puzzles at their first and second review | First-review recall at or above his average on Motors and D&V puzzles |
| Confusion | Ask Claude questions on these lessons (`questions`) | Few or no "what is this part" questions |

**Build measures:**
- Each stage's tokens against section 2c.
- Attempts per layer: 2 or fewer, and no block.
- Review scores of 4 or more.
- 3 or fewer "fix" findings a lesson, none of them about word counts.
- Bodies of 110 KB or less, guides of 200 KB or less.

**Decision:**
- **Go to phase B** if Dan says yes and phase A comes within 25% of 2.6M.
- **Adopt the style** for the "Power and machines at sea" shelf if the 5-lesson course comes in
  under about 5.5M and lessons 3 to 5 average 0.65M or less.
- **Stop** if Dan says no, or phase A passes 3.5M. The kit pieces and the lint still pay off for the
  current process.

### 4e. If it works: one ship for the shelf

The plant does not have to stop at one course. The "Power and machines at sea" shelf and its
neighbours could each become layers on the same ship:

| Course | Its layers on the plant |
|---|---|
| Protection and the emergency board | Preferential trips, blackout, the emergency generator and interconnector |
| Transformers | The lighting transformer and the shore connection |
| Motors at sea | The feeders' starters, linking back to Motors |
| Instrumentation and control | The plant's monitoring and alarms |
| Fault-finding at sea | Faults injected into the plant model: the evidence-table sandbox (`platform.md` 3.4), drawn on a plant Dan already knows |

Each later course pays only for its layers, about 0.65 to 0.8M a lesson all in.

---

## 5. Risks and how to keep them small

| Risk | Early sign | How to keep it small |
|---|---|---|
| **The map is cluttered on a 360 px phone** | Plant review contact sheet; Dan's "too busy" | Blocks only at overview, detail only in zoom views, at most about 10 labels a view, label size fixed per view (never scaled). Reviewed at 340 px and XL before any lesson is written. |
| **Sameness** | Dan: "same picture again" | Every layer brings its own instrument and motion (synchroscope, droop chart, earth lamps). Zoom views look different from the overview. Lesson 5 is a different kind of task. |
| **A model error spreads to every lesson** | A fact-check finding in the plant | A fresh plant fact-check that recomputes every rule; 30 to 50 checks, sourced where possible; each lesson pinned to a package version; a model fix re-runs `system.mjs` and the self-test for every lesson (cheap: the glue is unchanged) |
| **Invented ship detail** (we hold no Navy material) | Review flags a claim about "how ships do it" | The lead says "an example ship's plant, simplified"; example values flagged in the case file; anything not quoted is cut or said as the lesson's own setting; differences between ships taught as contested; Dan asked for any Navy notes |
| **Safety: it reads like an operating procedure** | Review | Teach principles and consequences, never a ship's procedure. A warning note wherever a wrong action is dangerous (closing out of phase, working with an earth present). Lesson 4's fault hunt says plainly that a real hunt follows the ship's own orders. |
| **Up-front cost before Dan sees anything** | Phase A tokens | Two lessons only in phase A. Stop rules in 2c. Tokens reported per stage after each lesson. |
| **Lock-in: the base drawing cannot take a later layer** | A layer build wants to move a part | Every layer listed in the system sheet before drawing begins, with space reserved. Layers add parts and never move old ones. A new base version only by a deliberate decision, with the lessons re-inlined. |
| **Guide and body size** | Still-size check; `assemble.mjs` | Culling by view, a 15 KB budget per still, `still: false` on a step that repeats the picture before it, package about 60 KB and bodies about 110 KB |
| **Research thin on marine practice** | Many [TBS] in the brief | Research up front on the sheet's fact list, with a budget. A point with no source is cut, not guessed. The MCA, PEG, IMarEST and class-rule sources first. |
| **Estimates run low again** (Motors +50%) | Phase A over 2.6M | Measure per stage. If phase A runs over, rebase phase B's estimate before Dan decides, and say so plainly. |
| **"Explorable" is thin without the Tier 1 page** | Dan asks to open the plant on its own | Free play at the end of every lesson in the meantime. Build the plant page (about 0.6M) only once the pilot passes. |

---

## 6. What to ask Dan before starting

1. **The course.** "Three-phase power systems at sea", 5 lessons, test lessons 1 and 2 first. Is
   this the one, or would you rather it ran on a different system?
2. **Navy notes.** Do you hold any notes on generators, switchboards or earth fault detection from
   your Navy training so far? They would come before any public source.
3. **The plant.** Two main generators plus an emergency set is the simplest true-to-type plant. Would
   you rather see three sets, or a high-voltage plant?
