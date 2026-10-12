# Eval run 1: findings to fix

Source: six eval runs (tools/eval/RUNNER.md) where an agent played the in-app model on real
prompts, then self-tested and screenshotted each interactive. Automated checks passed almost
everywhere; these are the problems people would notice.

## Prompts
1. **Source rules contradict.** With no research, the build prompt asks the model to cite "the standard
   reference you would trust" in K.check, and KIT.md says sources come from the lesson. Models attach
   URLs from memory that nothing verifies. Fix: K.check `source` only ever comes from the lesson's own
   sources; with none, checks carry no URL (known-answer checks only). Builder strips any other URL.
2. **The opening state answers the prediction.** "Open in an interesting state" + a typical starting
   value means the screen already shows the predicted answer. Fix: the lesson writer must make the
   prediction about a setting the interactive does NOT open on; the build prompt must keep the answer
   hidden until Dan moves a control; the kit gets `.k-after-move` / `K.afterMove()` to reveal things.
3. **Assumed constants are called "cited".** Add a number kind `assumed` (an illustrative value,
   shown as "for example"), distinct from `constant` (cited).
4. **Plan prompt's dangling "known" instruction** when Dan has no earlier ideas.
5. **Lessons can't see earlier lessons** (only one-line summaries + briefs), so analogies repeat and
   "refer back by name" is guesswork. Pass each earlier lesson's key terms, analogy and interactive brief.
6. **Readout rounding** (3 significant figures by default) disagrees with numbers in the text.
7. **Choice controls are missing from the schema**: controls are numeric only; categorical choices
   (sort by size / habitat / covering) need `options`.
8. **Explanations narrate actions Dan may not have taken** ("When you slid…"). Write conditionally
   ("Slide it to 20 and…", "If you pushed it up, you saw…").
9. **Colour words break in dark mode** ("dark square"). Never name colours by lightness; name the
   thing, or use the legend.
10. **Grammar bug:** "Dan is knows a little about this topic."
11. **"Never check the formula against itself"** is impossible for simple models; require at least one
    check from outside the model (a worked example, an everyday known case, or a cited value).
12. **Fair examples:** a dataset where two features are the same split inflates the contrast. Ask for
    fair, representative examples.
13. **Money, health, law:** teach mechanisms, no advice; say returns/outcomes are not guaranteed.
14. **Off-kind exemplar:** concept/structure/history ideas get the quantity exemplar. Add exemplars.

## Kit
15. **Clipped text is not detected** (SVG labels cut off, ellipsised labels at 360 px). Self-test must
    flag text clipped by its container or running outside an SVG's viewBox.
16. **Dark-mode fills are weak:** amber turns olive, shaded regions vanish. Retune dark fills.
17. **Custom SVGs blow up on desktop:** cap figure width.
18. **No "shade between two lines"** in K.plot.
19. **Small-screen layout:** slider end labels wrap, readout labels wrap to three lines, mark labels
    sit on lines.
20. **KIT.md CSS variable list** misses variables its own example uses.

## Harness
21. topic.json lost `level`; write-lesson evals never pass `prior`. Fix RUNNER/prompts.mjs.
22. Screenshots only show the opening state; also capture a moved state.

## Added after the chords and Roman Republic runs
23. **Sound:** topics about sound or music need audio; the kit had none (now a kit task).
24. **History is forced into invented numbers:** "outputs: 1-3 live readouts", numeric-only controls and
    "include a target check whenever your interactive has outputs" push every lesson to a numeric model, so
    a contested history lesson invented "10% chance a farm is lost per year". The interactive's form must
    follow the idea's kind (timeline, stepper, sorter, choice for history/process/concept); never invent
    probabilities or rates to make a model; outputs and target checks only when a real rule exists.
25. **Dates fit no number kind.** Add dates as facts (cited when sources exist). Numbers in hypothetical
    check cases and tempting wrong options are allowed; the number rule governs claims and the interactive.
26. **Prompt examples reuse likely topics** (Roman Republic, jet engines): the model is handed a lesson.
    Use short, varied examples from other domains; never a full model lesson.
27. **Switches must be allowed to start off**, contradicting "not zero or the minimum".
28. **Too few ideas for big topics:** allow 6-8 when the story needs it.
29. **deps [] vs "refer back by name"** contradiction in the lesson prompt.
30. **Predict for contested ideas:** ask which view he finds convincing, or what evidence would settle it.
31. **Contested shape** isn't shown in the output template.
32. **Sentences computed from numbers** must handle extremes ("0 of the 100 families still have their farm"
    should read "none"); check the moved/extreme states.
33. **Readouts cut into false statements** ("181 for every 120" shown as "181 for every 1").
