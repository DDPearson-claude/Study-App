# How ready-made courses are built today, and what the history teaches

Review for the "what next, and a new build style" decision (24 Oct 2026). Analysis only. Read:
`tools/course/RUNBOOK.md`; the workflow scripts (`subsea-course.js`, `motors-course.js`, `dv-l10.js`,
`electrical-course.js`, `dv-refresher-pilot`, `dv-refresher-lessons`, `dv-plain-rewrite`); the run records
in `~/.claude/projects/.../workflows/wf_*.json`, which hold per-agent token counts; every
`build/electrical/*/i*.build.log.md`, `i*.attempts.txt` and `i*.review.json`; the course briefs; `refresher.md`;
`app/kit/KIT.md` and `REFRESHER.md`; and `git log` (the last 150 commits).

---

## 0. The short version

- **The pipeline is sound and it works.** Since 13 Oct it has shipped 34 electrical lessons and the 16 maths
  courses. In those 34 lessons, 3 interactives went to a third attempt, and 2 of them were blocked and
  rebuilt. Every reviewer score is 3 or more, and most are 4 or 5.
- **Checking costs more than making.** Over the measured runs, the build takes 18 to 33% of a lesson's
  tokens. Review, fix and confirm together take 30 to 37%. Writing and the plain edit take 20 to 25%,
  research top-up about 15% (refresher courses), and the fact-check 8 to 10%. Most review "fix" findings
  are things a script could catch: screens over 90 words, too many footnotes, a source named in the
  words, the right answer always in the same place, a number shown with no rule behind it.
- **Four structural causes drive most of the cost and most of the failures:**
  1. **The words live in three places.** They are in the brief (drafted screen by screen), in the lesson
     JSON (`explain`, `whatAmILookingAt`, checks, summary) and in the page body (retyped as
     `const STEPS` and a "lesson's words" block). The fact-check reads the JSON *before* the plain edit and
     the build change the words. The reviewer then has to fact-check again, and every fix agent is told
     to "keep final.json in step".
  2. **Every page re-implements the steps engine.** Each body is 35 to 70 KB. It carries its own stepper,
     picks, Check / Why? / Continue, feedback state, navigation, Keep this and text helpers. AC circuits
     copied "i9's steps engine" forward lesson to lesson, but the kit never gained one.
  3. **Research only grows.** AC circuits kept 53 sources. Design and verification now keeps 582,
     Motors 495 and Subsea 359. The write prompt grew from about 24 KB to 55 to 70 KB, and every
     agent re-reads it on every turn.
  4. **Writing rules are enforced only by agents.** The 90-word screen, sparing footnotes, no
     narrated sources and no semicolon chains appear in five prompts and a reviewer's checklist. No
     validator counts them.
- **Any new style must keep:** quotes checked word for word on the page they cite; every number a
  control, computed from a shown rule, or cited (practice values labelled); a fresh reader who wrote none
  of it; the 360 px self-test in both themes and at Text size XL; "explain in your own words"; at most
  three attempts; and the read-through, the Book and the puzzle cards, which all feed off the same guide.
- **The best levers, in order of payoff:** (a) screens as data, with one source of words and a kit steps
  engine; (b) a mechanical writing lint run before any reader; (c) a per-lesson source pack instead of
  the whole course research; (d) one writer per course or per unit, then the fact-check on the final
  on-screen words; (e) a small library of tested picture components for the course's domain. Together
  they could plausibly take a refresher lesson from about 1.0M to about 0.55 to 0.7M tokens. This is a
  reasoned estimate, not a measurement. It needs a one-off kit job of roughly 1 to 2M (also a guess).

---

## 1. The pipeline, stage by stage

The settings are from CLAUDE.md (approved by Dan on 11 Oct). Token figures are the workflow records'
`tokens` per fresh agent (agents replayed from cache on a resumed run are left out). Shares are of the
run's total.

### Once per course

| Stage | Who, model, effort | What it does | Gate | Measured |
|---|---|---|---|---|
| Course brief (section 0) | Opus high, often with a Sonnet "brief research" step first | Topic, what is useful, the format (steps / partly / reading), benchmark, Dan's starting point, slips, cost. Dan agrees it. | Dan's yes; pilot lesson first | brief research 0.44 to 0.64M; brief about 0.2M (AC circuits, Algebra) |
| Plan | Opus high | `plan-topic` answered to the brief and `lessons.json`; `topic.json` | `validate.mjs plan` | about 0.1M |
| Research | Sonnet high (quote checker) | His materials page by page (`material.mjs`, OCR pages checked against the image), then the web for what they lack; tool calls harvested from the transcript (`harvest.mjs`) | `sources.mjs`: a quote is kept only if it is on the cited page | 0.15M (AC circuits) to 0.30M (D&V pilot) |
| Case file (refresher only) | the setup or writer agent | Givens, assumptions and worked figures by id; Subsea's is generated by `case.make.py` with asserts | `validate.mjs case` | in other stages |

### Per lesson (in order, each later lesson given the earlier ones with `--prior`)

| Stage | Model, effort | What it does | Gate | Avg fresh-agent tokens (share) |
|---|---|---|---|---|
| Research top-up (refresher and Motors) | Sonnet high | At most 8 searches and 5 fetches; appends sources, never renumbers; sets labelled practice or example values | `sources.mjs`, every earlier source still kept | 0.24 to 0.30M (15%) |
| Write | Opus high | Draft, a critique against the seven faults, a rewrite; `assemble finalise` | `validate.mjs lesson` (`--case`) | 0.15M (AC circuits) to 0.28M (D&V); 13 to 18% |
| Fact-check | Opus high, fresh | `verify-lesson`: every number, rule, point, trap and citation against the sources and pages; figures recomputed | `validate.mjs verify`, `--final` | 0.09 to 0.16M (8 to 10%) |
| Plain edit (since 20 Oct) | Opus high, fresh | Rewrites every word Dan reads under the PLAIN rule, facts frozen | `validate.mjs lesson --final` | about 0.1M (7%) |
| Build | Opus xhigh | Answers `build-interactive` with the whole body; `attempt.mjs` per attempt (extract, self-test, screenshots, verdict, film, repair prompt); at most three attempts | the self-test at 340/720/1040 px, XL text, both themes; the `lookAt` contact sheets | 0.23 to 0.38M (18 to 33%), 28 to 45 tool calls, 15 to 35 min |
| Review | Opus xhigh, fresh | Teaching and motion in one pass: scores 1 to 5 on six counts; findings marked "fix" or "polish" | scores of 4 or more, or another round | 0.18 to 0.19M (13 to 16%) |
| Fix | Opus high | Applies every finding; re-runs `attempt.mjs` as attempts 8 and 9 | verdict ok, `validate --final` | 0.17 to 0.19M (13 to 16%) |
| Confirm | Sonnet medium | Checks that each "fix" finding is addressed (skipped when only polish was found) | the reader's word | about 0.07M (5%) |

### Once per course, at the end

| Stage | Who | What | Gate |
|---|---|---|---|
| Guide and assemble | Sonnet low | `guide.mjs` (stills at 328 px, worked examples, the summary first, warnings); `assemble.mjs docs` | refuses mixed formats, typed answers the self-test did not grade, written questions not on the page, a guide not opening on its summary, a guide over 250 KB; writes the case file compact when needed |
| Publish | Dan's session (operator) | One ArtifactData batch per manifest, the shelf's `tid`, a copy into `docs/courses/`, a commit, the token cost reported | none automatic |

### Measured totals

| Run | Lessons | Tokens | Per lesson |
|---|---|---|---|
| AC circuits (one run, brief to assemble) | 10 | 10.94M | 1.09M with course stages; about 1.0M for the lessons alone |
| Algebra courses (five full runs) | 7 to 8 | 7.7 to 9.4M | about 1.05 to 1.18M |
| D&V pilot (plan, research, lesson 1) | 1 | 1.52M | about 1.1M for lesson 1 |
| D&V lessons 2 to 9 | 8 | about 1.0M a lesson (Dan's figure; the run was resumed, so the record is partial) | |
| D&V plain rewrite of lessons 1 to 5 | 5 | 1.67M | 0.33M a lesson, a cost caused by the writing failure |
| Subsea | 7 | about 0.93M a lesson | |
| Motors | 8 | about 1.05M a lesson, against an estimate of 0.7M | |

**Estimates run low.** The Motors brief estimated 0.7M a lesson and the build measured 1.05M. The
Motors and BS 7671 amendments briefs assumed "light" eight-screen lessons would cost much less.
They did not, because the fixed costs (reading, research top-up, the review and fix cycle) do not shrink
with the screen count. The Inspection and testing brief's 1.0M a lesson is the realistic figure under
today's process.

---

## 2. Where the tokens go

1. **Fixed reading in every agent.** Each of the seven or eight agents per lesson is told to read the
   RUNBOOK (26 KB), the brief (36 to 78 KB), `refresher.md` (37 KB) or the kit docs (19 KB),
   `lessons.json` (15 KB), CONTEXT plus PLAIN (about 4 KB, repeated in every prompt), and an exemplar
   lesson with its body (about 100 KB). That is roughly 40 to 70k tokens before any work starts, and
   every later turn re-reads it ("every turn re-reads your whole context" is in ECONOMY for this reason).
   A build agent takes 28 to 45 turns.
2. **Research that only grows.** The top-up appends; nothing is pruned to the lesson. One D&V top-up
   added 50 sources (209 kept by lesson 2; 582 by lesson 9). The write prompt carries the research, so
   it doubled (`i2.lesson.prompt.txt`: 24 KB for AC circuits, 55 to 70 KB for D&V, Subsea and Motors).
   The fact-checker and the writer both pay for it.
3. **Bespoke page bodies.** 35 to 70 KB of HTML a lesson (AC circuits about 70 KB, Motors about 44 KB).
   Roughly 40% of a body's script is the same machinery every time: the step list, the text and term
   helpers, picks with named slips, Check / Why? / Continue, Back and Continue, Keep this, the entry
   animation. Each repair answer rewrites the whole body.
4. **The review, fix and confirm loop.** Each lesson gets 10 to 25 findings, and every one is applied,
   polish included. The fix agent re-runs the self-test and re-reads pictures, so it costs about as much
   as the review. Motors averaged 6 "fix" findings a lesson. About a third of them were screens over 90 words, and two
   more were footnote counts.
5. **Writing done twice.** The plain-edit stage exists because writers kept narrating sources and
   stacking caveats. It costs about 0.1M a lesson on top of the write. Before it existed, the D&V
   rewrite of lessons 1 to 5 cost 1.67M.
6. **Words in three places.** The brief drafts the screens, the writer writes JSON, and the builder
   retypes and trims the words into the body. The fix agent then keeps the JSON, `final.json` and the
   body in step. Every handover costs reading and invites drift.

---

## 3. Recurring failures and their fixes

| Failure | Where it bit | What it cost | Fix made | What is still weak |
|---|---|---|---|---|
| **Blocked builds at 360 px**: a readout or row too narrow, so a word splits | Subsea i3 ("1.33, satisfactory" in a kit-sized tile), Motors i2 ("stoppe / d"), both blocked after three attempts; D&V i5 (the carried panel's label column shrank to 25 px); Subsea i1 ("Capacitance" split at XL); D&V i7 (a line label too wide) | Each block cost three attempts and a rebuild (the RUNBOOK says each further try costs about as much as a research stage) | RUNBOOK 4b29ff9: rows of three or more wrap with `repeat(auto-fit, minmax(6rem, 1fr))`, and a brief never asks for one row. Rebuilds restart from attempt 3's body and count "3 + 1". | The kit still sets `.k-cr-value { white-space: nowrap }`, so D&V i5 and Subsea i1 each patched the carried panel with scoped page CSS. Layout fixes stay in pages instead of moving into the kit, so the next builder can repeat them. |
| **Writing quality and narrated sources** | D&V lessons 1 to 4: "makes no sense at all, it's horribly written" (20 Oct); "your slides p.16", "pack p.4", "the course's reasoning" | 1.67M rewrite workflow, then about 0.1M a lesson for the plain edit | ca9cef5: CLAUDE.md and RUNBOOK section 3; PLAIN in every prompt; a fresh plain editor before the build; citations kept as data and never shown (bced117); `K.scenario` shows no source line (a18b5d5) | Still found in review after the plain edit: D&V i8 "Your assignment ED4-01A: pack p.3"; Subsea i4 "One offshore cable spec asks…"; Motors i6 with 13 footnotes and i8 with 11 (the rule says "a few"); "has to be read twice" findings in every course. Nothing mechanical checks these. |
| **Too much text after the pictures** | Motors i1: 120 to 240-word screens ("a bit too much text after the diagrams", 21 Oct) | i1 trimmed by hand (d86c064); i2, 6 and 7 trimmed after review (413225b, 49def49) | A 90-word SHOW screen added to the write, plain-edit, build and review prompts; a screen over 90 words is a "fix" finding | Applied by prompt only, and from lesson index 1 or 2 onwards, so it reached the scripts late. The Motors i2 review still found screens of 230, 170, 135, 120 and 115 words. The builder is told to trim words "from the lesson where needed", which moves words away from the fact-checked JSON. |
| **Case-file drops and size** | Subsea: `case.json` regenerated from `case.make.py` lost lesson 1's hand-added figures (9a511f7 restored them); D&V `case.json` at 295 KB against a 250 KB document limit | A repair commit, and a rule added mid-run ("never edit case.json by hand" from lesson 4) | Generated case files with asserts; assemble writes the case compact when the indented form is too big (6deee3a) | Two ways to edit (by hand, or the generator) remain open to agents. D&V is near the limit and lesson 10 adds more. Every agent reads the whole case file. |
| **Read-through stills** | D&V: "the images are blank" (phase cards as empty lanes under "Drag a card…"); stills at the start state; 17 examples showing their answer as the question; stale right marks | A read-through rework (bced117, d8a3623), guides regenerated, guideV 3 to 5 | `read` and `still` STEPS fields; stills in a script-free frame at 328 px; guide warnings; assemble refuses a guide not opening on its summary; units fixed (49971fa); "undefined" refused (ff33c31); SVG xmlns (1845e6c); D&V 5 and 6 questions no longer give the answer (bfa2db2) | Works now, but every builder must remember `read` and `still` by hand. The guide reverse-engineers stills from a live page, so each new widget is a new way to fail. |
| **Guide warnings** | "gives the answer", "empty box", "choices nobody chose", "quiz-only words left out", "do not read as words" | Found at the assemble step at the course's end, after the review | RUNBOOK 6b: read every warning, fix the lesson, not the guide | The warnings come after review and fix, so a fix there is not reviewed. They belong in `attempt.mjs`. |
| **Steps format missing** | Trigonometry 3 to 8 and Linear systems 5 and 6 shipped as long reading lessons until 18 Oct | A republish (93b650d) | `assemble.mjs` refuses a lesson with a still guide but no steps format, and a mixed course | Fixed |
| **Facts and safety caught only at review** | D&V i2 (an EV trap resting on a misread regulation), i6 ("trips on residual current, not on fault current"); Subsea i3 (IEEE 43 limit misapplied), i7 (earths lifted before the leads go on); Motors i3 (VSD isolation never proves the input dead), i2 (a live test with no warning) | Review and fix rounds | The reviewer prompt asks for every worked example to be recomputed | The fact-check reads the JSON before the plain edit and the build change the words. The reviewer is the only stage that sees the final words, so it is doing a second fact-check at xhigh. |
| **A step behind a number is never shown** | Motors i3, i4, i5, i6, i7, i8 (an example motor's windings, "why flux follows V/f", where 353 A comes from); Subsea i6 (a rule with no line); D&V i6 and i8 (a key input only on another screen) | 1 to 3 fix findings a lesson | none specific | The root cause is structural. A steps lesson never shows `explain`, `analogy` or `practice`, but the writer still puts the causal step there, and the builder picks what reaches the screens. |
| **Rendering slips** | Motors i5 (`0.00009999999999999999`; µF shown as "MF" by a capitals class); Subsea i2 and i3 (formula lines losing their spaces in the summary card) | One attempt each | The kit's unit handling (4970949) | Number formatting and the summary's rule lines could be kit-owned |
| **Quiz pattern** | Motors i3: the right answer always the first button | A fix finding | none | A lint could check it |
| **Usage limit** | 21 Oct: the weekly limit hit mid-build | Lost time; Dan pauses builds | Workflows resume from cached agents (the run records show it) | Cost is the binding constraint in practice |

What went right, and should be copied:
- **Lesson packs.** D&V lesson 1 was built from `lesson-1-pack.md` (numbers, rules, citations, accepted
  answers and model points worked out in advance). It passed on the first attempt, with review scores of
  4/5 and 2 fixes. D&V lessons 1 to 4, 8 and 9 all passed on the first attempt; lesson 10 is planned the
  same way (`extras-plan.md`: 13 screens of draft text, every figure worked by hand).
- **Informal reuse.** AC circuits lessons 6 to 10 were each built "on i(N−1)'s steps engine" and passed
  in 1 or 2 attempts.
- **Fresh eyes.** Every safety error above was caught by a reader who wrote none of it.
- **Contact sheets, and `attempt.mjs` in one command.** These cut the builder that read 18 pictures and
  ran 48 commands.

---

## 4. What each stage protects (keep all of these in any new style)

| Promise to Dan | Enforced today by | Must survive as |
|---|---|---|
| **Faithful**: nothing invented | `sources.mjs` (quote on the cited page, from a harvested tool call, never retyped); material page locators; OCR digits checked against the page image; a fresh fact-check; `K.check` sources only from the lesson's own; practice and example values labelled (`examples.json`, `"practice": true`, `K.figure().practice`); case figures by id and never retyped; no C&G scenario copied; BS 7671 one value at a time | Any source pack is cut from checked `research.json` by id, never re-quoted. The fact-check reads the words Dan sees. Figures stay data. |
| **Numbers from shown rules** | the writer's worked lines; the fact-checker recomputes; the builder's `K.check`; typed answers self-tested (`accept`, `slips`); assemble refuses ungraded answers | Kept. A lint can also flag a number on a screen that is not a control, a case figure or a computed output. |
| **Plain words** (20 Oct) | PLAIN in prompts; the plain editor; reviewer findings; citations never shown | A mechanical lint first (words a screen, footnotes, banned narration, semicolons, brackets, sentence length), then one human-style reader |
| **Short screens** (21 Oct) | prompts and the reviewer | Counted by a script from the screen data |
| **Phone first, both themes, XL text** | `attempt.mjs` self-test (340/720/1040 px, XL, dark, overflow, clipping, under 11 px, contrast, NaN, timings); `lookAt` contact sheets; the reviewer | Kept. Kit-owned rows and panels reduce what each page can get wrong. |
| **Learning design** | predict before play (`k-after-move`, `afterMove`); slips with their own hints; recall opener with skip; Section A typed and Section B marked; Keep this; read-through; puzzles to FSRS from the guide | Kept as engine features rather than page code, so every lesson gets them for free |
| **Fresh eyes** | fact-check, plain edit, review and confirm, each by an agent who wrote none of it | At least two independent readers: one on facts, one on the page. Confirm can be mechanical when only lint or layout changed. |
| **Cost discipline** | at most three attempts; ECONOMY; contact sheets; token report to Dan; pilot first | Kept, with the estimate rebased on measured figures |
| **Data limits** | db documents under 256 KiB; guide under 250 KB; case compact | Kept; per-lesson packs keep the documents small |

---

## 5. Where a different build style could cut cost or raise quality

Each lever below says what it changes, the evidence, a rough saving (reasoned, not measured), and the
risk.

### A. Screens as data, one source of words, and a kit steps engine
**What.** The lesson JSON carries `screens: [{kind: show|do|recall|sectionA|sectionB|keep, words, read,
still, picture: {component, state}, options, slips, …}]`. A kit `K.lesson(screens)` draws the navigation,
picks, slips and hints, Check / Why? / Continue, the recall skip, the typed and written answers and Keep
this. It also draws the read-through stills straight from the same data. The builder writes only the
picture or pictures, with their model, `K.check`s and named states.
**Evidence.** About 40% of each body is repeated machinery. AC circuits' copy-forward engine passed in 1
or 2 attempts. The "never shown" `explain` failures and the "keep final.json in step" instructions vanish
when the screen words are the lesson. The guide's stills stop being reverse-engineered.
**Saving.** Build about 40 to 50% smaller. Fix rounds shrink, since words change without a page
rebuild. The plain edit and fact-check then act on the exact words shown. Perhaps 0.15 to 0.2M a lesson.
**Risk.** Sameness: Dan invited other styles, and a visual must earn its place. Keep the picture fully
bespoke, and let a lesson opt out of the engine. A one-off kit job (a guess of 1 to 2M) and a migration
rule (old lessons keep their bodies).

### B. A mechanical writing lint, run before any reader
**What.** `validate.mjs lesson` (or `attempt.mjs`) fails on: a SHOW screen over 90 words; more than N
footnotes in a lesson, or two in a sentence; narration patterns ("your slides", "(p.", "pack p.",
"the course", "one site", "a forum"); semicolon chains; mid-sentence brackets; sentences over about 25
words; a DO step whose `read` contains its answer; the right option in the same position on every
check; a "Drag / Tap" sentence with no `read`; a screen number with no source in the controls, outputs
or case file.
**Evidence.** About a third of Motors' 47 "fix" findings were screens over 90 words, and two more were
footnote counts. The reviewer at xhigh is the most expensive stage, and it is counting words.
**Saving.** Fewer and smaller fix rounds, and confirm skipped more often. Perhaps 0.1M a lesson. Near-free
to run.
**Risk.** A lint cannot judge "reads twice". The reader still does that, with the counts done for it.

### C. Per-lesson source packs instead of the whole research
**What.** After research, a cheap step cuts `research.json` to the sources each lesson cites or needs
(by id, quotes unchanged), plus the case figures it uses. Writer, fact-checker and builder read the pack.
Top-up appends to the course file and regenerates the pack.
**Evidence.** Prompts went from 24 KB to 55 to 70 KB as the research grew to 500 or more sources. D&V
lesson 1, from a pack, passed first time.
**Saving.** Perhaps 0.05 to 0.1M a lesson across the write, fact-check and fix stages, and more as
courses grow.
**Risk.** None to faithfulness if the pack is cut by id and `sources.mjs` still checks the course file.

### D. One writer per course (or per unit), then the fact-check on the final words
**What.** One Opus agent writes the screen data for a unit of 3 or 4 lessons in one voice, with the
lint in its loop (the write and plain-edit stages merge). A fresh fact-checker then reads those final
on-screen words, not an earlier JSON. Builds then run per lesson, in parallel where the case file allows.
**Evidence.** Cross-lesson slips: D&V i8's card kept a figure the lesson had replaced; Subsea i1 gave
"another core 1.80 km" against String B's 2.40 km. The plain editor exists to undo per-lesson writers'
habits. The D&V `extras-plan` already drafts all 13 screens in one place.
**Saving.** The plain edit (about 0.1M) goes, and the fixed reading is paid once per unit instead of
once per lesson. The writer's context grows, though. Net perhaps 0.1M a lesson.
**Risk.** One writer's blind spots repeat across lessons. The independent fact-check and page review
must stay per lesson. Keep the unit small enough that the pack and case file fit comfortably.

### E. A picture component library for the domain
**What.** Tested, phone-safe kit components for the shapes these courses keep drawing: a waveform and
time scrubber, phasors, a plot with a moving operating point and guides, a circuit or one-line diagram
from a netlist, bar comparisons, a readout row that wraps, and a carried-figures panel that wraps. A lesson
composes and configures them, and still draws something bespoke where the idea needs it.
**Evidence.** AC circuits reused one "scrubber layout" across i3 to i8. Motors and Subsea drew
torque-speed curves, traces and bars again each time. All three builds that reached a third attempt
failed on a width: two readout rows and a plot label.
**Saving.** Fewer attempts, and smaller bodies. Hard to size until a course is mapped onto the components.
**Risk.** Pictures that look alike. The rule "a visual earns its place by teaching" still decides.

### F. Fewer stages where the data says they add little
- **Confirm** (5%): make it mechanical (re-run `attempt.mjs`, the lint and the guide warnings) and send
  only teaching or safety fixes to a Sonnet reader.
- **Polish findings**: apply them only when they touch a sentence Dan reads, or batch them into a
  course-end pass. Today every one triggers a fix round.
- **Guide warnings**: run them inside `attempt.mjs`, so they are seen before review, not at assemble.
- **Research top-up** (15%): for a course from Dan's own materials, research the course once, fully, and
  top up only for named gaps (the brief's "still to find" list).

### What not to cut
- The fresh fact-check and the fresh page review. Every safety error (isolation, earths, a live test) was
  caught there.
- The quote checker, and harvesting from the transcript (Percentages lost every source to retyping on
  11 Oct).
- The 360 px self-test and the three-attempt cap.
- A pilot lesson Dan tries on his phone before the rest.

### A combined "lean" pipeline, to pilot on one course

| Per lesson | Today (refresher, about 1.0M) | Lean (a reasoned estimate) |
|---|---|---|
| Research top-up | about 0.15M | 0 to 0.05M (gaps only; course research done fully up front) |
| Write and plain edit | about 0.25M | about 0.15M (unit writer, lint in the loop, from a pack) |
| Fact-check | about 0.1M | about 0.1M (on the final screen words) |
| Build | about 0.2M | about 0.1M (picture only, on the engine and components) |
| Review | about 0.15M | about 0.12M (counts done by the lint) |
| Fix and confirm | about 0.15M | about 0.06M (smaller, mostly mechanical confirm) |
| **Total** | **about 1.0M** | **about 0.55 to 0.6M** |

Plus a one-off kit and validator job, roughly 1 to 2M (a guess), paid once and shared by every later
course. Inspection and testing's 17 lessons would then cost about 10 to 11M instead of about 19M,
if the estimate holds. **Pilot it on one lesson**, then compare the measured cost and the review scores
with a lesson built the current way before switching a whole course.

---

## 6. Facts for whoever designs the next build style

- The steps lesson is the only format in use for ready-made courses. Its read-through, Book chapter and
  puzzle cards are all generated from the STEPS data and stills, so a new format must still produce a
  guide (`topics/{tid}/guide/{iid}`) with stills, examples, written questions and the summary first.
- The light format (Motors: about 8 screens, one picture, 2 or 3 checks, Keep this, no case file) did not
  save what was expected (0.7M estimated, 1.05M measured). The fixed costs dominate: reading, research
  top-up, review, fix.
- Dan's feedback has been about writing and quantity of text, never about too few stages or checks. He
  valued the outcome: "I'm glad we digitised my level 4 course, I'll never forget that now."
- Cost matters to him in practice: the weekly limit was hit on 21 Oct mid-build, and he pauses builds.
  Report each build's measured tokens against this document's per-stage figures.
