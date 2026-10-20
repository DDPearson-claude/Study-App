# case.json: changes made while writing lesson 1 (20 Oct 2026)

The original file is unchanged in substance; every figure was recomputed and all of lesson 1's
figures stand (28.87, 50.00, 86.96, 22.99, 28.74, 41.48, 58.90, 41.48, 36.08, 33.18, 29.38, 660,
23.08, 13.33, 21.87 and their accepted values). What was wrong was the file's shape and a few entries.

1. **Shape.** `validate.mjs case` refused the file: no `title`, no flat `figures` list (figures sat
   under `lessons[].figures`), and assumptions without `text`. Reshaped to RUNBOOK section 8:
   - `title` "The showroom" (the kit labels the summary's figures "The showroom so far") and a
     `scenario` {title, text, source} written from the givens (pack p.3, question 4 on p.4).
   - `figures`: every worked figure, each with `lesson` ("i1") and `text` as printed ("23.08 A",
     taken from the end of its working); `working` renamed `work`. Section A parts carry `part`.
   - `pending`: the figures not yet worked (value null), with their lesson and part, so the
     validator's "every figure has a value" holds; they move to `figures` when a lesson works them.
   - `lessons` keeps each lesson's n, title and Section A parts, without the figures.
   - each assumption gains `text` ("The course's own assumption: …"); its other fields are kept.
2. **Section A ids.** `l1.A.1a` and `l1.A.1b` are now `1a` and `1b`, with labels "Motor's design
   current, Ib" and "Each winding, in delta": K.answer's id must equal the figure id for K.carried
   to know when a part was missed, and RUNBOOK section 8 names parts this way. Later lessons should
   rename their pending parts (`l3.A.1c` → `1c`, and so on) when they work them.
3. **1b's citation.** It said a quote was still to be found; research.json now quotes the delta
   relation (All About Circuits and LibreTexts, Kuphaldt AC chapter 10: "line current is equal to
   phase current times the square root of 3"). The cite says so, and `r.delta` is gone from
   `toResearch`. Its `accept.why` adds 13.35 A (23.10 A ÷ 1.73).
4. **l1.check.** Slides p.17 call the 20 kW load "the same pump"; the build pack said it was the
   heater of p.16. A heater with a power factor of 0.8 and an efficiency of 87% is not a heater's
   behaviour, so the lesson calls it the slides' 20 kW worked again as a motor load (they call it a
   pump). Label and a note changed; the figure is unchanged.
5. **l5.limits.** Its printed text would have come out as 20.00 V (the last figure in its working)
   while its value is 11.50 V; text set to "11.50 V" and the label narrowed to "5% of 230 V".
