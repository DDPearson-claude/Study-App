# Eval runner: play the in-app model for one topic

You are testing My University's generation prompts. The app sends these exact prompts to Claude
inside the page. Your job is to answer them **exactly as that in-page Claude would**, run the
app's own validators and self-tests on what you produced, and report honestly.

Inputs (given to you): QUERY, LEVEL (new|some|solid), SLUG, RUN (e.g. run1), RESEARCH (live|none).
QUERY should be a fresh topic: not one an earlier eval used (`EVAL_SET` in `tests/prompts.test.mjs`
keeps their words out of the prompts: vaccines, noise-cancelling headphones, rainbows, the Bronze
Age collapse, the seasons, tides), and not a test fixture's (jet engines, the Roman Republic).
Work in `/home/user/Study-App`. Output dir: `D=tests/out/eval-$RUN/$SLUG` (create it).
Do not edit any file outside `$D`. Do not commit.

## The two hats
- **Model hat** (writing replies): you are the in-page model. Your reply must come ONLY from the
  prompt text you were given, as if you had no tools, no repo and no memory of other files. Do not
  read fixtures, examples or source code to help you. Write the reply exactly in the format the
  prompt demands (JSON only / HTML body only). Save it with the Write tool.
- **Operator hat** (everything else): run commands, validate, render, look at screenshots, take notes.

## Steps
1. `mkdir -p $D` and make sure `tests/out/kit.html` exists (else `node tools/build.mjs --only 32,33 --out tests/out/kit.html`).
2. Plan: `node tools/eval/prompts.mjs plan-topic --query "$QUERY" --level $LEVEL > $D/plan.prompt.txt`.
   Model hat: Read `$D/plan.prompt.txt`, write the reply to `$D/plan.reply.txt`.
   Operator: `node tools/eval/validate.mjs plan $D/plan.reply.txt`. If it reports problems, do what the app does:
   model hat again, reply with corrected JSON given the problem list, to `$D/plan.reply2.txt`, validate again.
   Save the final plan JSON as `$D/topic.json` with `"query": "$QUERY"` and `"level": "$LEVEL"` added, as the app
   stores them (the lesson and build prompts read the level from it).
2b. Research (only when RESEARCH=live). This is what the app does right after planning, with the
   real Parallel Search connector (`mcp__Parallel_Search__web_search` / `web_fetch`; load them with
   ToolSearch).
   `node tools/eval/prompts.mjs research --topic $D/topic.json > $D/research.prompt.txt`, then `mkdir -p $D/tools`.
   Model hat: read the prompt and decide each tool call exactly as the in-page model would (its
   input shapes, its budget). For every call: operator makes the real call with that input (add
   `"session_id": "mu-eval-$SLUG-0000000000000000000000"`), then saves the result verbatim with
   the Write tool as `$D/tools/NN-<tool>.json` = `{"tool": "...", "input": {...}, "output": <the
   result JSON exactly as returned>}` (NN = 01, 02, ... in call order). Model hat then reads ONLY
   `node tools/eval/sources.mjs --show $D/tools/NN-<tool>.json`: that is the cleaned, size-fitted
   text the in-page model gets. Never quote from the raw file. The app refuses a web_fetch of an
   address that no earlier web_search returned (the reply is `Tool error (refused): ...`); behave
   the same and don't make that call.
   Model hat writes the research reply to `$D/research.reply.txt`. Operator:
   `node tools/eval/sources.mjs --reply $D/research.reply.txt --tools $D/tools --topic $D/topic.json --out $D/research.json`.
   Record how many sources were cited, kept and dropped, and why each was dropped. Pass
   `--research $D/research.json` to every write-lesson prompt below, and `--sources $D/research.json`
   to every lesson validation.
3. Pick two ideas: `i1` and the idea with the richest thing to manipulate (if that is i1, take i2).
   For each idea `I`:
   a. `node tools/eval/prompts.mjs write-lesson --topic $D/topic.json --idea I [--research $D/research.json] > $D/I.lesson.prompt.txt`
      For the second idea, pass the first lesson as an earlier lesson, as the app does:
      add `--prior $D/i1.lesson.json`.
      Model hat -> `$D/I.lesson.reply.txt`. Operator: `node tools/eval/validate.mjs lesson $D/I.lesson.reply.txt --iid I [--sources $D/research.json --topic $D/topic.json]`;
      one corrective round if needed. Save the final lesson JSON as `$D/I.lesson.json`.
   b. If the lesson has an interactive: `node tools/eval/prompts.mjs build-interactive --topic $D/topic.json --idea I --lesson $D/I.lesson.json > $D/I.build.prompt.txt`
      Model hat -> the body HTML into `$D/I.body1.html` (strip nothing; the app's extractor runs in the next step).
      Operator: extract the way the app does and self-test + screenshot:
      `node --input-type=module -e "const {loadPrompts}=await import('./tools/eval/prompts.mjs');const U=loadPrompts();const fs=await import('fs');fs.writeFileSync('$D/I.body1.x.html',U.interactive.extract(fs.readFileSync('$D/I.body1.html','utf8')))"`
      `node tools/eval/render.mjs $D/I.body1.x.html --out $D/I.a1 --app tests/out/kit.html`
      Then add what the app's builder checks on top of the self-test (the lesson's ids, web addresses other than the
      lesson's sources, and whether every target check can be reached):
      `node tools/eval/prompts.mjs verdict --lesson $D/I.lesson.json --html $D/I.body1.x.html --report $D/I.a1-report.json > $D/I.a1.verdict.json`
      If its `ok` is false: write its `report` object to `$D/I.a1.report-only.json`, then
      `node tools/eval/prompts.mjs repair-interactive --topic $D/topic.json --idea I --lesson $D/I.lesson.json --html $D/I.body1.x.html --report $D/I.a1.report-only.json > $D/I.repair1.prompt.txt`,
      model hat -> `$D/I.body2.html`, extract + render as `I.a2`. Up to two repairs (a3), exactly like the app.
   c. Look at the screenshots of the last attempt with the Read tool: the opening state (`-360-light.png`, `-360-dark.png`,
      `-1280-light.png`) and the `-moved` shots render.mjs takes after moving the controls. The opening state must not show
      the predicted answer yet still look alive; the moved state must show it; sentences and labels must read right at
      the extremes (none/all, singular/plural) and nothing may be clipped.
4. Write `$D/notes.md`: per step, the validation problems you hit, self-test results per attempt, and anything in the
   prompts that was ambiguous, contradictory, missing or hard to follow while you wore the model hat (be specific: quote
   the prompt line). Also anything the interactive screenshots show that is wrong or ugly.

## Final answer
A short structured summary: files produced; plan valid first time (y/n); per lesson: valid first time (y/n), problems;
per interactive: attempts and final self-test ok (y/n), main issues; the top 5 prompt problems you noticed, quoted.
