# Building a ready-made course, with care

A ready-made course on a shelf (docs/shelves-*.json) is built here, in Claude Code, with the app's
own prompts, validators and self-tests, then written to the live db so it shows "Ready to browse".
Dan (10 Oct): "Every single individual lesson needs to be crafted with love, thought and care. No
expense spared: these lessons are going to remain with me forever." So every step below takes the
time the page never has: more than one draft, a critic, a fresh fact-check, a built and tested
interactive that someone has actually looked at.

Work in `/home/user/Study-App`. The build folder is `build/<shelf>/<course>/` (`$D` below; ignored
by git until the course is copied into `docs/courses/`). Commands are run from the repo root.

## The two hats
- **Model hat** (writing a reply): you are the in-page model. Answer the prompt text you were given,
  in exactly the format it demands (JSON only / HTML body only), obeying every rule in it. Take
  the time to do it well: this is a pre-built lesson, not a five-second reply.
- **Operator hat**: run the commands, read the validator's output, look at the screenshots, fix.

## Files (per course, per idea `I` = i1, i2, …)
```
$D/intake.json              Dan's answers to the intake (what he wants the course for)
$D/plan.prompt.txt          the app's plan prompt; $D/topic.json the plan + query, level, mode, intake
$D/research.prompt.txt      the app's research prompt; $D/tools/NN-*.json every tool call; $D/research.json kept sources
$D/I.lesson.prompt.txt      the write-lesson prompt (with --prior: the earlier lessons)
$D/I.lesson.draft1.txt …    drafts (JSON); $D/I.critique.json the critic's findings
$D/I.lesson.json            the validated written lesson (the last draft that passed)
$D/I.lesson.final.json      finalised (assemble.mjs finalise): what the app fact-checks and saves
$D/I.verify.prompt.txt      the fact-check prompt; $D/I.verify.reply.txt its reply
$D/I.lesson.verified.json   the lesson with the fact-check's fixes applied; $D/I.verify.result.json {status, applied, notes}
$D/I.build.prompt.txt       the build prompt; $D/I.bodyN.html each attempt as replied; $D/I.bodyN.x.html extracted
$D/I.aN-report.json + PNGs  render.mjs self-test and screenshots per attempt; $D/I.aN.verdict.json the builder's verdict
$D/I.body.final.html        the body that passed; $D/I.verdict.final.json its verdict; $D/I.attempts.txt how many attempts
$D/I.review.json            the reader's review of the whole lesson (text + screenshots)
$D/out/                     assemble.mjs docs: the db documents and manifest.json
$D/tid.txt                  the topic id, made once
```

## 1. Plan (once per course)
```
node tools/eval/prompts.mjs plan-topic --query "<course title>" --level some --mode read --intake $D/intake.json > $D/plan.prompt.txt
node tools/eval/validate.mjs plan $D/plan.reply.txt
```
Several candidate plans, judged, refined; the final one validated and saved as `$D/topic.json` with
`"query"`, `"level"`, `"mode"` and `"intake"` added, as the app stores them.

## 2. Research (once per course)
```
node tools/eval/prompts.mjs research --topic $D/topic.json > $D/research.prompt.txt
node tools/eval/sources.mjs --reply $D/research.reply.txt --tools $D/tools --topic $D/topic.json --out $D/research.json
```
Every tool call saved verbatim as `$D/tools/NN-<tool>.json` = `{"tool", "input", "output"}`; every
quote copied word for word from a tool result; sources.mjs keeps only sources the tools returned
with their quote on the page. Aim for 10-14 kept sources and notes for every idea.

## 3. Write each lesson (in order: i1 first, each later one with --prior)
```
node tools/eval/prompts.mjs write-lesson --topic $D/topic.json --idea I --research $D/research.json --prior $D/i1.lesson.final.json,$D/i2.lesson.final.json > $D/I.lesson.prompt.txt
node tools/eval/validate.mjs lesson $D/I.lesson.draftN.txt --iid I --sources $D/research.json --topic $D/topic.json
node tools/course/assemble.mjs finalise --dir $D --idea I
```
Craft rules, on top of the prompt's own:
- Draft, then critique, then rewrite. The critic reads the draft against the seven faults the eval
  panel found in nearly every generated lesson: the explanation skipping the causal step; false
  absolutes ("always", "never", "the only"); an interactive brief that shows only the effect, not
  the cause; checks that test recall (not in read mode); thin or decorative research; unreadable
  labels; and text that talks about the idea instead of teaching it. Also against the lesson
  template the research report recommends (docs/research/how-to-teach-pre-built-courses.md,
  "Recommended shape"): the idea named in one line up front; the rule stated in words; one fully
  worked example with real numbers computed from the rule; the common misconception shown failing;
  the analogy from Dan's trade with where it breaks; "Put it into practice" with steps, a rule of
  thumb, a worked example and the mistakes; a recap he could say back.
- Plain, warm British English. No word limits, but no padding: as long as Dan needs to understand
  it, and no longer. Jargon only once earned, always explained. Key terms marked [[like this]] once.
- Nothing invented: every number is a control, computed from a shown rule, or cited; every claim
  that needs a source has one ([^n]). Unsourced content is said to be unsourced.
- Dan is an electrician: build on volts, amps, cable sizes, loads, ratios on a drawing by name;
  never teach him his own trade.

## 4. Fact-check each lesson (a fresh reader, never the writer)
```
node tools/eval/prompts.mjs verify-lesson --topic $D/topic.json --idea I --lesson $D/I.lesson.final.json --research $D/research.json > $D/I.verify.prompt.txt
node tools/eval/validate.mjs verify $D/I.verify.reply.txt --lesson $D/I.lesson.final.json --out $D/I.lesson.verified.json
```
Save the printed `applied` and `notes` as `$D/I.verify.result.json` = `{"status": "done", "applied": [...], "notes": [...]}`.
If hard problems remain after one repair, copy the final lesson to the verified file and record
`{"status": "failed", "applied": [], "notes": []}`, as the app would.

## 5. Build and test each interactive
```
node tools/build.mjs --only 32,33 --out tests/out/kit.html          # once, the kit test page
node tools/eval/prompts.mjs build-interactive --topic $D/topic.json --idea I --lesson $D/I.lesson.final.json > $D/I.build.prompt.txt
node --input-type=module -e "const {loadPrompts}=await import('./tools/eval/prompts.mjs');const U=loadPrompts();const fs=await import('fs');fs.writeFileSync('$D/I.bodyN.x.html',U.interactive.extract(fs.readFileSync('$D/I.bodyN.html','utf8')))"
node tools/eval/render.mjs $D/I.bodyN.x.html --out $D/I.aN --app tests/out/kit.html
node tools/eval/prompts.mjs verdict --lesson $D/I.lesson.final.json --html $D/I.bodyN.x.html --report $D/I.aN-report.json --app tests/out/kit.html > $D/I.aN.verdict.json
```
If the verdict's `ok` is false: write its `report` object to `$D/I.aN.report-only.json`, then
```
node tools/eval/prompts.mjs repair-interactive --topic $D/topic.json --idea I --lesson $D/I.lesson.final.json --html $D/I.bodyN.x.html --report $D/I.aN.report-only.json > $D/I.repairN.prompt.txt
```
and answer it (model hat) as the next attempt. Up to five attempts (the page allows three).
Then look at the screenshots with the Read tool (`$D/I.aN-360-light.png`, `-360-dark.png`,
`-1280-light.png`, and the `-moved` and `-end` shots): the opening state must look alive and
show the thing to be moved; the moved state must show the cause and the effect; sentences and
labels must read right at the extremes; nothing clipped, overlapping or too small on a phone.
Anything wrong is a problem for one more repair, written into a report-only JSON by hand
(`{"ok": false, "errors": ["what is wrong, in one sentence"], "sweep": {"ok": false, "problems": []}}`).
When it passes: copy the body to `$D/I.body.final.html`, the verdict to `$D/I.verdict.final.json`,
and write the attempt count to `$D/I.attempts.txt`.

## 6. Read it as Dan would
A reader who wrote none of it reads `$D/I.lesson.verified.json` with the final screenshots and
scores the lesson 1-5 on: the idea lands (he could say it back); the why is complete (no skipped
step); the interactive shows the cause; the trade comparison is honest (its "breaks" is true);
nothing invented or absolute; it reads as a pleasure. Below 4 on any count, one more rewrite
round (steps 3-5 for what changed). Saved as `$D/I.review.json`.

## 7. Assemble, write to the db, mark the shelf
```
node tools/course/assemble.mjs docs --dir $D
```
Writes `$D/out/` and `manifest.json`. Then, in the Claude Code session, one ArtifactData batch to
the live artifact (docs/DEPLOY.md has its URL): a `set` per manifest entry (`file_path` = its file;
no `if_version`: they are new documents). Then read `shelves/<sid>`, set the course's `tid` in its
JSON (docs/shelves-<sid>.json too), and `set` it back with `if_version`. Finally copy `$D` (without
`tools/` and the PNGs) into `docs/courses/<shelf>/<course>/` and commit.
