# Lesson quality: plan and contracts

Source of the changes: `docs/eval/run2-panel.md` (24 judgements of 8 lessons; overall 3.13 of 5;
predict 2.96, interactive 3.0, checks 3.17, explain 3.54, say 3.79, accuracy 3.63) and its raw
`run2-panel.json`. Its 21 ranked changes quote the current wording and give the new wording; line
numbers there are from an older commit, so find the text, not the line. Where this plan and the
panel differ, this plan wins. Goal: every part scores 4+ in eval round 3.

Three groups work in parallel worktrees. Each owns its files; the contracts below are what they
share. Nobody edits another group's files except where a contract says so.

## Group P: prompts and validators (`app/src/js/30-prompts.js`)

Panel changes 1 (a-e), 2 (a-f), 3 (a-g), 4 (a-f), 5, 6 (a-d), 8, 9, 10, 13, 15, 16, 20, applied to
the plan, research and write-lesson prompts and to `U.validate.*`. Also:
- Keep every prompt's first line `TASK: <name>`, keep builders pure, keep the word budget sane:
  the write-lesson prompt may grow, but cut repetition as you add (merge overlapping rules, one
  place per rule). Report its length in words before and after.
- Validator changes from 2 (f): the required target check becomes advice (a `warnings` entry,
  not a problem); new problems for a target or estimate answer printed in predict.reveal or
  explain.text, a choice check's right option sharing 4+ consecutive words with explain.text,
  predict.reveal or say.model, and a right option over 1.5x the others' average length. Make
  each message tell the writer exactly what to change.
- `docs/ARCHITECTURE.md` section 5: the target-check rule and the new problems.
- Unit tests in `tests/prompts.test.mjs` (or the existing prompt/validator test file) for every
  new validator rule, both directions.

## Group K: kit, build prompt, sandbox (`app/kit/*`, `33-interactive.js`, `32-sandbox.js`)

Panel changes 3 (h, i), 7, 11, 12, 14, 17, 18, 19, 21, and the kit half of 2 (g):
- Quiz mode (contract Q below), and `reach` also reporting `exact` (some step of the control
  displays the target exactly at the output's decimals).
- K.drag, a true mechanism exemplar (a pushable or draggable cause, K.anim({button:false}),
  K.reveal() on drag), compound-growth re-tagged `kind: quantity`.
- Legibility (7): SVG text 13-16 units, K.labels size default 13 and `avoid`, the self-test
  failing SVG text under 11 CSS px in the 340 px frame and text crossing stroked lines or
  arrowheads, warnings for same-row labels under ~4 px apart, unknown K.color roles and invalid
  fills/strokes as errors, SVG text contrast >= 3:1 against --k-bg/--k-panel in both themes.
  Every exemplar and the KIT.md example must still pass at 338/368/720/926/1086 px, M and XL.
- KIT.md stays under its word limit (check the limit enforced in tests); cut to make room.
- Tests in `tests/e2e/kit.spec.mjs` for each new check (fails on the bad case, passes the good).

## Group A: generation, lesson screen, review cards, eval tools

Owns `31-generate.js`, a new `app/src/js/34-verify.js`, `50-lesson.js`, `41-cards.js`,
`tools/eval/*`, `tests/generate.test.mjs`, `tests/e2e/lesson.spec.mjs`, `tests/e2e/review.spec.mjs`,
and the ARCHITECTURE sections for these (7, 9).

1. Research reach (6 e): `lessonResearch` also passes, after the idea's own notes, every note
   from any other idea whose claim holds a date (always, for a `history` idea), and every note
   that names this idea's id or limits its main claim, marked "(from another idea in this
   course)". Keep the prompt size bounded (cap the borrowed notes, nearest ideas first).
2. Predict not given away (1 f): the idea's oneLine stays hidden until the predict is answered
   or skipped; before play, friendlyBrief shows "Try this: <action>" and the "Watch for …"
   sentence only after the reveal.
3. Quiz mode (2 g, app half): target checks in the lesson and target review cards mount the
   interactive with contract Q, and send `reveal` when Dan presses Check.
4. The fact-check step (contract V below), in `31-generate.js` with its prompt, validator and
   patcher in `34-verify.js` (pure, loadable in Node like 30-prompts.js; add it to the file lists
   in `tools/eval/*.mjs` and any test loader that lists files).
5. Show the fact-check honestly: in the lesson's sources panel (where "Sources" are listed), one
   quiet line: "Checked against these sources: N corrections made." / "Checked against these
   sources." / nothing when not checked. No badge, no colour beyond the existing teal label.
6. Eval tools: `tools/eval/prompts.mjs verify-lesson` prints the verify prompt for a saved
   lesson; `tools/eval/validate.mjs` (or prompts.mjs) applies and validates a verify reply and
   writes the patched lesson; `tools/eval/RUNNER.md` gains the step after write-lesson;
   `render.mjs` renders target checks in quiz mode.

## Contract Q: quiz mode (kit and host)

- `U.sandbox.mount(container, {…, quiz: {hide: '<output id>'}})`. After the frame is ready the
  host posts `{type:'quiz', hide:'<output id>'}` (re-sent on reload). `{type:'quiz', hide:null}`
  or `{type:'reveal'}` ends it.
- Kit: while a quiz is on, the readout with that id shows "?" (like an afterMove readout before
  a move, with an accessible label saying it is hidden until he checks), every `.say` element is
  hidden (visibility, so the layout does not jump), and K.plot/K.bars draw no value label for that
  output. `state`/`change` messages still carry the real outputs (the host grades with them).
  On `reveal` everything shows again.
- The self-test ignores quiz mode (it is never on in test frames).

## Contract V: the fact-check step ("verify-lesson")

Why: the panel found an absolute or over-broad claim in every lesson, misread dates, causes
skipped, and checks whose "right" answer was arguable. A second, fresh read against the sources
catches what the writer cannot see in its own text.

- `U.prompts.verifyLesson(topic, idea, lesson, {research, later, level})`, first line
  `TASK: verify-lesson`. It gives the verifier: the lesson JSON (with its numbered sources and
  quotes), the research notes the writer had (same `lessonResearch`), THE COURSE's later ideas
  (title + oneLine) so claims stay true after them, Dan's level, and the rules the claims must
  meet (from panel changes 4, 10 and 15: every general claim holds across the interactive's whole
  range, in everyday life and after every later idea; dates read correctly; numbers follow THE
  NUMBER RULE; each check has exactly one defensible right answer and wrong options that are
  really wrong; nothing claimed beyond what the cited quotes support, or else worded as "One way
  to picture it"/hedged). No tools.
- Reply: `{ issues: [ { path, problem, now?, severity: 'fix'|'note' } ] }`.
  `path` names one string field: `predict.reveal`, `explain.text`, `analogy.text`,
  `analogy.breaks`, `interactive.whatAmILookingAt`, `interactive.ignores`, `say.model`,
  `say.rubric[i]`, `checks[i].q`, `checks[i].why`, `checks[i].options[j]`,
  `checks[i].misconception[j]`, `checks[i].items[j]`, `contested.views[i].text`.
  `now` is the replacement text for that field (required when severity is `fix`). Frozen (never
  patchable): predict.q and predict.options (Dan may already have answered them), the whole
  interactive spec apart from the two text fields above, check ids, types, answers, targets,
  numbers and order, sources. An issue with no fix (`note`) is recorded, not applied.
- `U.validate.verify(reply, {lesson})`: well-formed, every path patchable and present, at most 12
  issues, and the lesson after applying every `fix` still passes `U.validate.lesson` with the
  same options the writer's reply had (citations included). Problems go back through the usual
  repair round, at most once.
- `U.verify.apply(lesson, reply) -> {lesson, applied, notes}` (pure).
- Pipeline (`31-generate.js` write()): after the lesson validates and its citations are
  filtered, start verify and the interactive build in parallel; the build uses the unverified
  lesson (the interactive spec is frozen, so it stays valid). Dan sees a lesson only when it is
  whole (his request, already in place by the time this work starts: a lesson opens only at
  `ready`, with its interactive or its no-interactive note), so the patched text and the
  interactive are saved together as `ready` once both have settled. The doc gets
  `verified: {status:'done'|'failed'|'skipped', at, applied:[{path, problem}], notes:[{path,
  problem}]}`. Verify failing (any error, timeout 90 s, rate limit) never blocks the lesson:
  save unverified with status `failed`. A `building` doc resumed later runs verify if it has
  none. Relearn verifies too. Progress line while it runs: "Checking the lesson against its
  sources…".
- Prefetch (background) verifies with priority background like its other calls.
- Tests: generate.test.mjs covers apply (each path kind; a frozen path refused), validation
  (lesson broken by a patch is a problem), the pipeline (verify and build run in parallel; the
  lesson is saved only after verify; verify failing still saves the lesson with
  verified.status 'failed'), and lesson.spec covers the sources-panel line.
