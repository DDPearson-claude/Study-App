# Eval run 2: findings to fix

Source: four runs of tools/eval/RUNNER.md with live Parallel Search research (headphones,
vaccines, rainbows, the Late Bronze Age collapse), each agent playing the in-page model on the
app's real prompts. Everything passed the app's own checks at least by the first repair; these are
what a person would notice, or what the checks let through.

## Research (10-runtime.js, 31-generate.js, research prompt)
1. **Fitting results to size cut the best results.** Trimming the longest excerpt first cut the
   top-ranked, most authoritative pages (OpenStax, NOAA, LibreTexts) to a few words, while
   worksheets and boilerplate came through whole. Fit by rank: keep the top results whole and
   shorten from the bottom of the list up.
2. **Free-tier rate limits.** Parallel Search's free tier rate-limits bursts ("You've hit the
   free-tier rate limit…"). Every run hit it. Background research should wait and retry; a failed
   call must not use up the budget; the prompt must say what to do on a tool error.
3. **Quoting real excerpts.** Excerpts carry damage (PDF hyphen breaks "dis- turbances", stray
   spaces "antigen , the", LaTeX "[latex]1−1/R_0[/latex]", "$42^\circ$"). Allow a quote to be part
   of a sentence; say to pick clean passages; join hyphen breaks when matching.
4. **Titles** come with whitespace, "[PDF]" prefixes or a trailing "…": tidy them in code; never
   complete a title from memory.
5. **Numbers that differ between good sources** (ranges, conventions) are not "contested": state
   the spread in the claim. A reputable source that oversimplifies: prefer the fuller source.
6. **Shared constants** several ideas compute with belong in the topic notes.
7. **Manufacturer explainers** are not shops; prefer independent sources.

## Lesson prompt
8. **"Builds on" an idea with no lesson yet** conflicts with "ideas above without a lesson here are
   new to him". Say: recap the earlier idea in a sentence or two if this one needs it; pass that
   idea's research notes too.
9. **Maths for a new learner** vs "the equation if there is one": for level new the panel gives the
   rule in words; a formula only when short, every symbol named.
10. **Sketched curves** (peak days, "10 times higher") inside sourced ranges are `assumed`, and the
    caption says it is a sketch.
11. **Key terms the picture needs** may appear on it before the explanation marks them.
12. **Word limits** overshot by a few words in two of eight lessons: aim lower than the limit.
13. **Plan prompt's title example** is one of the eval topics ("How vaccines teach the body").

## Build prompt and kit
14. **SVG labels touching** ("germ arrives" / "same germ returns") pass the overlap check, which
    needs a quarter of the smaller label's area to overlap. Flag any real overlap.
15. **Text over lines and shapes** (rays across angle labels): give SVG text a background halo.
16. **Canvas plot axis titles** run off the edge at 360 px ("(% of a wave"). Fit them; flag a title
    too long for a phone.
17. **`K.color('amber-line')`** returns an invalid colour (the role is `amberLine`): accept both
    spellings; warn about unknown roles.
18. **Legend markup** is never shown; examples use `dp:` while the reference says `decimals`.
19. **`K.anim` always adds a Play button**, doubling a page's own controls: `button: false`.
20. **Sound:** no way to hold a tone that follows a slider; no guidance on phone speakers (nothing
    below about 200 Hz is heard).
21. **Hiding a whole plot until Dan moves** leaves a large blank card: hide the answer (a line, a
    mark), not the figure; warn on large after-move blocks.
22. **Wide frames:** a plot not in a stage spans the whole 1000 px card; with a short controls
    panel beside a tall figure the column below is empty. Cap plots; centre the controls.
23. **Floating-point checks:** say what tolerance to use; loosening an unrealistic tolerance is
    not "weakening a check".
24. **Ideas without numbers** list (process, structure, history, concept) leaves out mechanism.

## Eval tooling
25. `validate.mjs --sources` compared against the topic-wide numbering (fixed: per idea).
26. render.mjs's "moved" shot moves a stepper one step and waits 0.5-1.5 s: also shoot the far end
    of every control after a longer wait.

## From the Late Bronze Age run (history, contested)
27. **SVG text with no fill is black in dark mode** (K.labels without `color`): a drawing's default
    ink now follows the theme.
28. **Contested predict** ("which view is more convincing") contradicted "he answers it by moving":
    for a contested idea, playing shows what each view explains and the reveal names no winner.
29. **Plan details research does not back** ("letters begging for grain") reached the lesson: the
    lesson leaves them out or says them with care.
30. **Quotes:** 40 words (30 forced cold-unreadable fragments); no reference markers; the original
    publisher, never a mirror; abstracts are fine; "years before present" quoted with its definition.
31. **History outputs:** plain counts of what is on screen are fine; nothing else.
32. **Fitting:** results below the top three now shrink fully before the top three are touched.
