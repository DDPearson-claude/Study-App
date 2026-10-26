# Statistics for engineers: the course brief

Written 26 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
the first course in the Maths shelf's Probability, statistics and data folder, "Measurements, trends
and reliability: how far to trust a reading, whether a drift is wear or noise, and how often
equipment fails." The seven courses listed after it in the folder (Descriptive statistics, Data
visualisation, Probability fundamentals, Conditional probability, Expected value, Regression and
prediction, Bayesian reasoning) are not planned. You asked for this one short practical course
instead, so it carries inline the little probability it needs. Electronics and power electronics
(Electrical shelf) comes next, and the ground this course leaves for it is named below. You chose
this course on 25 Oct and approved the build, so I have taken the decisions for you and listed them
below. Change any you like. Sources and quotes are in `research-notes.md` beside this file (183
quotes, cut by script from the 74 saved tool results and checked with `tools/eval/sources.mjs`,
`failed: 0`). Section numbers below point there. The data pictures follow `dataviz.md` beside this
file, the one visual language chosen by the design contest you asked for. It binds every lesson.

## The short version
**Five lessons**
1. The middle and the spread (built first)
2. How far to trust a reading
3. The normal curve and honest outliers
4. Drift or noise: trends over time
5. How often equipment fails: reliability

**The main pictures** (one per lesson, each moved with your finger, each showing the cause). All
five are the same "beads" language (dataviz.md): every simulated reading is a bead that drops from a
hopper through a field of pegs, its random nudges, and lands on a beam. The pile balances on a
fulcrum at the mean. The numbers come out of the pile, and the pile comes out of a rule on screen.
- **The balancing pile (lesson 1).** Fifty repeat earth fault loop impedance readings of one circuit
  pour onto the beam, the first few as numbers. A slider sets the random error. Halve it and the pile
  halves in width and grows taller, with the same balance point. Then drag the ringed bead, a slipped
  probe. The beam tips, the fulcrum creeps a fiftieth of the slip, and the median barely moves.
- **Offset and repeats (lesson 2).** The hopper sits at the true value plus an offset you set, inside
  the meter's accuracy window. A choice makes each bead the mean of 1, 2 or 4 readings. The pile
  tightens, but round where the meter centres, not round the true value. A second choice makes the
  meter coarser, and the beads hop into bricks one display step wide.
- **The bell and the ruler (lesson 3).** A UPS output read on rounds. The pile's skyline relaxes into
  the normal curve, the 1, 2 and 3 SD bands bloom, and the beads inside each band are counted
  against the rule. Example limits appear. Drag the ringed bead along a ruler marked in standard
  deviations, and drop fresh batches while a tally counts how often an honest reading lands out.
- **Tip and peel (lesson 4).** The pile tips onto its side and the readings peel off in the order
  they were taken. A slider adds a drift. With no drift the best-fit line still leans a little, and
  swings on every fresh batch. That lean is noise. A second view folds two strings of readings
  (a pump bearing's temperature and a battery's float current) one against the other: they line up
  closely though neither drives the other, because the air temperature moves both.
- **The shelf of units (lesson 5).** Fifty units on a shelf. Drag "Years in service" and each unit
  drops off when its random lifetime runs out, into a pile of failure times. A choice runs them one by
  one, in series pairs or in parallel pairs. A last view runs the clock to 30 years through a
  sketched bathtub: an early heap, a quiet floor, then a wear-out hump.

**Decisions taken for you** (say if you want any changed):
- **Five lessons, one per part of the scope you set.** The research supports a five-lesson core
  (notes 8). Brilliant spends about 55 lessons on ground near these five parts, spread over six
  courses, and none at all on measurement uncertainty or reliability (notes 1.7, 8). HELM, the
  workbook series written for engineers, covers four of the five parts in one section each (36, 39,
  43 and 46), and the calibration bodies cover the fifth (NPL Good Practice Guide 11, UKAS LAB 12)
  (notes 2.4, 3.4, 8).
- **Lesson 5 may run to 14 screens rather than split.** It is the fullest lesson. The researcher
  suggests splitting series and parallel into a sixth lesson if it will not fit (notes 8,
  UNCONFIRMED until built). You asked for five, so it stays one lesson with up to 14 screens. Say if
  you would rather have six.
- **"Partly" visual: steps lessons with a little more explaining.** Every lesson is a steps lesson
  (`format: 'steps'`) of about 12 screens. SHOW screens may carry a short paragraph, at most about 90
  words (RUNBOOK section 0, item 3). Statistics needs a sentence of meaning beside each picture, as
  calculus did.
- **One data language, pasted unchanged.** Every picture that shows data uses the beads language in
  `dataviz.md` and pastes its "Copy this code" CSS and JS blocks unchanged. So all five lessons look
  and move the same: the pour, the hop, the fulcrum on its spring, the tip and peel, the fold and the
  shelf. A lesson's own extras build on those helpers and never replace them. Each lesson's picture
  is taken from the dataviz lesson list; where I adapt one, section 3 says how and why.
- **Simulated readings, and said so.** The readings are made by the rule on screen: true value, plus
  any offset and drift, plus random error times the sum of twelve nudges, read to the meter's step
  (dataviz.md). "Simulated" leads every caption and axis title. No pile is ever presented as a real
  circuit's or a real boat's data.
- **Picture first, then the rule.** Khan puts the idea of spread before the formula, z-scores before
  the empirical rule and "Eyeballing the line of best fit" before least squares (notes 2.1). delMas and
  Liu found that a formula plus the 68-95-99.7 rule "does not necessarily promote a conceptual
  understanding of standard deviation", while software where students predict, test and see
  feedback does (notes 6.1). So every number appears first as something the pile does.
- **Standard deviation divides by n − 1.** For readings from an instrument this is the usual choice.
  NPL says use the "sigma n minus one" key for readings, and Bitesize calls it the most commonly used
  formula (notes 4.1). One screen says why (a few readings are a small sample of all you could take)
  and that dividing by n is used for a whole population (HELM's µ and σ, notes 4.1). The shared code's
  `B.stats` already divides by n − 1, so every readout agrees.
- **Standard deviation as the RMS of the deviations.** You have RMS from AC circuits lesson 2 and
  Calculus fundamentals lesson 10: square, take the mean, take the root. The standard deviation is the
  same recipe applied to each reading's distance from the mean (HELM's recipe, notes 4.1). One screen
  makes the link, and the recipe is not taught from scratch.
- **Probability taught inline in two places.** Lesson 3 introduces a probability as a share of the
  time, from 0 to 1: "95% of readings within 2 SD" is the chance one reading lands there. Lesson 5
  teaches NOT (1 − p), AND for independent parts (multiply) and "at least one works" (1 minus the
  chance that all fail), on reliabilities directly, as HELM does (notes 3.5, 4.5). Brilliant places
  these rules late, after expected value (notes 1.4). This course cannot afford that route.
- **"How many SDs from the mean" before the word z-score.** The ruler in lesson 3 counts standard
  deviations. The word z-score is named once, after the idea (Khan's unit 4 title, notes 2.1).
- **The page fits the line; you read what it means.** You laid a line by eye in Straight-line graphs
  lesson 6. HELM says doing it by eye "is unsatisfactory as a general statistical method" (notes 2.4),
  so here the page fits the best line and you learn what it tells you: its slope is the drift per
  reading, and it passes through the mean of the points, HELM's check (notes 4.4). The least-squares
  formula is not taught.
- **"How closely they line up" is a readout, not a calculation.** The fold view shows the
  correlation coefficient as a tile whose hint is its meaning ("+1 a perfect line, 0 none",
  dataviz.md). It is never worked by hand. Regression beyond a fitted line stays out, as you asked.
- **Counts of points are conventions.** A trend is "6 in a row" in NIST, HELM, Minitab and Ontario
  Health, but 7 in the Weitzman guide. A shift is 6, 8 or 9 on one side of the middle, depending on the
  source (notes 4.4). The lesson teaches the reason (six going the same way is rare by chance) and
  calls the number a choice, not a law. It is taught as contested.
- **Outliers: investigate first.** HELM marks a reading beyond 3.3 SD as an outlier, while control
  charts use 3 SD (notes 4.3). Every source agrees on the habit: ask why it happened, and delete it
  only when a cause is found (HELM 36, NIST, notes 4.3). The lesson teaches the habit, with the number
  as a convention.
- **The normal curve is a model, said so.** HELM says deviations from a target "are often modelled
  very well" by the normal distribution (notes 4.2). The course says "often" too and never claims
  every set of readings is normal.
- **Uncertainty of a mean, and what it leaves out.** Lesson 2 states a result as the mean ± 2 × s ÷ √n,
  at about 95% (UKAS's k = 2, notes 3.4), and the picture keeps it apart from "most beads", the
  mean ± 2 SD (dataviz.md). The lesson says plainly that this covers only the random part. The meter's
  accuracy is a separate band that repeating cannot shrink (NPL, notes 3.4). Combining the two into
  one uncertainty budget (UKAS LAB 12) is left out. One screen names Fluke's "operating uncertainty",
  which counts every influence factor (notes 3.4), so you know the budget exists.
- **The pass-fail rule from UKAS is in.** If the result's interval overlaps a limit, "it is not
  possible to confirm conformity or non-conformity" (UKAS LAB 12, notes 3.4). The notes call it the
  most useful single idea for an inspector. It closes lesson 2.
- **Reliability examples are public, general equipment.** A UPS, a battery bank, a standby diesel
  generator and a pump, with example figures labelled. The Kohler UPS paper's failure rates are a
  maker's figures (SECONDARY, notes 3.5). They appear only as labelled examples, never as facts about
  a real UPS. Nothing beyond the public submarine outline in CLAUDE.md is used or needed.
- **The bathtub is a sketch, said so.** Its shape is cited (NIST, HELM, notes 3.5). Its formula in the
  picture is a drawn shape, not a law, and the screen says so (dataviz.md). R = e^(−λt) is taught for
  the flat middle only, where Bel and NREL put it (notes 3.5). Early-failure and wear-out models
  (Weibull, HELM 46.1) are left out.
- **MTBF is a rate turned over, not a life.** At t equal to the MTBF only 36.7% of units still work
  (Bel, notes 3.5). That is the same 0.368 you met after one time constant in Exponentials and
  logarithms lesson 3. The MTBF is 1 ÷ λ, just as the time constant is RC. The decay curve is not
  taught again.
- **Your trade's tests are the examples.** Earth fault loop impedance readings (lesson 1), a meter's
  accuracy as ±(% of reading + counts) and an RCD tester's ±5% (lesson 2), insulation resistance
  trending and PAT records (lessons 1 and 4). Limits in puzzles are example limits, labelled. No
  BS 7671 figure is quoted unless the research stage cites it.
- **Example numbers are labelled.** Readings, limits, failure rates and lifetimes are example
  figures, said so on screen, or computed from a rule the screen shows. Every worked number in this
  brief was computed by script, and the fact-check recomputes them.
- **Left out:** hypothesis tests (Pearson 4002's Merit line), Bayesian reasoning, regression beyond a
  fitted line (residuals, multiple regression), binomial and Poisson distributions, sampling
  distributions and confidence intervals as a topic, the Weibull distribution, control charts as a
  method (their limits and run rules appear as ideas only), and uncertainty budgets. These would
  belong to the folder's unplanned courses if you ever want them.
- **Your intake answers** (`intake.json`): to understand statistics for engineers and how to work with
  it; on the job and in everyday life; hands-on, with the why explained in full.

## 1. The overall topic
Every reading you take is a little different from the last. This course is about what to do with
that. It covers four questions an engineer meets on every job:
- **What is the reading, really?** The middle of a set of readings (mean and median) and how widely
  they spread (range and standard deviation).
- **How far can I trust it?** A meter's resolution and accuracy, random against systematic error,
  and a result stated with its uncertainty and checked against a limit.
- **Is this reading unusual?** The normal curve, the 68-95-99.7 rule, tolerance bands, and how many
  standard deviations out a reading sits.
- **Is it wearing, or is it noise? And how often will it fail?** Readings over time, a fitted line,
  drift against scatter, and correlation against cause. Then failure rate, MTBF, the bathtub curve,
  survival probability, and systems in series and in parallel.

Konold and Pollatsek call data as "a mixture of signal and noise ... perhaps the most fundamental
concept in statistics" (notes 6.1). That is the thread through all five lessons.

**It builds on:**
- **Percentages, Fractions and Proportional reasoning:** percent of reading, a percentage tolerance,
  a probability as a share of one.
- **Negative numbers:** a reading above or below the mean, a deviation with a sign.
- **Powers and roots:** squaring and the square root, all the standard deviation needs.
- **AC circuits (lesson 2) and Calculus fundamentals (lesson 10):** RMS, the root of the mean of the
  squares. The standard deviation is the same recipe on deviations.
- **The coordinate plane (lessons 4 and 5) and Straight-line graphs (lessons 1 and 6):** gradient,
  a line laid through scattered readings, reading inside and beyond the data.
- **Exponentials and logarithms (lesson 3, the time constant; lesson 7, log graphs) and Differential
  equations (lesson 2, decay):** the decay curve behind R = e^(−λt), and a log scale for insulation
  resistance.
- **Functions and their graphs:** a rule drawn as a curve, which is what the normal curve and the
  survival curve are.
- **Design and verification, HV Subsea Cable Testing and your inspection and testing
  qualifications:** insulation resistance, earth fault loop impedance, RCD trip times, PAT records,
  limits and records.

**Not taught again:** percentages, square roots, gradient and y = mx + c, laying a line by eye, RMS,
e and the decay curve, the time constant's 0.368, logs and log scales, and anything about the tests
themselves (how to do an insulation resistance or loop impedance test, or what the limits are).

**Left for Electronics and power electronics (Electrical shelf, next):** noise and tolerance in
electronic circuits, and the decibel and signal-to-noise ideas that come with them (notes 5). This
course stops at readings, trends and lifetimes.

**Edges.** Readings of one quantity, or two side by side. No inference beyond a stated uncertainty,
no hypothesis tests, no distributions other than the normal and the exponential.

## 2. The lessons, in the order they build
The order is HELM's, with measurement put second: centre and spread (HELM 36), measurement (NPL and
UKAS), the normal curve (HELM 39 and 46.2), trends (HELM 43, Megger, the run rules), then reliability
(HELM 46.1) (notes 2.4, 8). Khan and Bird run centre and spread, the normal curve, then lines, in the
same order (notes 2.1, 2.5).

| # | Lesson | What it teaches |
|---|---|---|
| 1 | The middle and the spread | Fifty repeat Zs readings of one circuit are not one number but a spread, and they pile up round a middle. The mean is the balance point of the pile, delMas and Liu's "self-adjusting fulcrum" (notes 6.1). The median is the middle reading. Range is highest minus lowest. Two sets can share a mean, a median and even a range and still differ in spread (Bitesize, notes 2.2), so the standard deviation measures how far, on average, readings sit from the mean (Bitesize, notes 2.2). It is worked by hand on five readings, as the RMS of the deviations with n − 1 (HELM, NPL, notes 4.1). One slipped reading drags the mean and the SD, while the median barely moves (HELM 36: "sensitive to the influence of extreme values", notes 4.1). Ten readings of one circuit against one reading each on ten appliances: say which kind of mean you have (Konold and Pollatsek, notes 6.1). |
| 2 | How far to trust a reading | Resolution is the smallest step the display shows (Fluke; NUSTEM and NPL on "precision", notes 3.4, 4.2). Accuracy is the largest allowable error, as ±(% of reading + counts): Fluke's 100.0 V at ±(2% + 2) can be 97.8 V to 102.2 V (notes 3.4). Random error scatters readings round a mean, and averaging repeats shrinks its effect. Systematic error shifts every reading the same way, and "you learn nothing extra just by repeating" (NPL, UKAS, notes 3.4). State a result with its uncertainty and its confidence: mean ± 2 × s ÷ √n, at about 95% (NPL, UKAS k = 2, notes 3.4). Report to the decimal place the uncertainty allows (NPL, notes 3.4). If the interval overlaps a limit, a pass or a fail is not shown (UKAS, notes 3.4). |
| 3 | The normal curve and honest outliers | Many small causes adding up give a bell-shaped pile, often modelled by the normal curve (HELM 39, notes 4.2). About 68% of readings land within 1 SD, 95% within 2 and 99.7% within 3 (LibreTexts, SECONDARY; UKAS k = 2 and 3; HELM 36, notes 3.4, 4.3). A share of the time is a probability. How unusual a reading is: count its distance in SDs, the z-score (Khan, notes 2.1). A tolerance band in SDs: HELM's strain gauge, 100 Ω with SD 0.2 Ω and limits ±0.5 Ω, is 2.5 SD each side, and about 1.24% fall outside (HELM 39, notes 4.3). Honest readings land out now and then. One far out is more likely a slip or a fault: investigate before deleting (HELM 36, NIST, notes 4.3). |
| 4 | Drift or noise: trends over time | Plot readings in the order taken. A single reading varies; "What really matters is the trend" (Megger, notes 4.4). The fitted line's slope is the drift per reading, and the line passes through the mean point (HELM 43, notes 4.4). With no drift at all the line still leans a little: that is noise. A run of six going the same way is rare by chance, so it signals a cause; the count is a convention (NIST, HELM 46.2, Minitab, Weitzman, notes 4.4). Compare like with like: same connections, voltage, time and temperature, or correct to 20 °C (Megger's halve-per-10 °C rule of thumb, notes 4.4). Insulation resistance on a log scale. Two strings that line up closely need not cause each other (Australian Bureau of Statistics, SQA Higher, notes 2.3, 4.4); a cause is shown by changing one thing and watching (notes 6.3). Stay inside the data when you read a line forward (SQA Higher, notes 2.3). |
| 5 | How often equipment fails: reliability | The failure rate λ is failures per unit time. In the flat middle of the bathtub it is constant, and the chance a unit is still working at time t is R = e^(−λt) (NIST, Bel, NREL, notes 3.5). MTBF = 1 ÷ λ, yet only 36.7% of units reach it (Bel, notes 3.5). The bathtub: early failures, a long flat stretch, then wear-out (NIST, HELM, notes 3.5). NOT: the chance of failing is 1 − R. Series fails if any part fails, so multiply the R's (AND), and failure rates add (HELM; Kohler, notes 3.5). Parallel works while any part works, so R = 1 − (1 − R₁)(1 − R₂) (OR, "at least one") (HELM, NREL, notes 3.5). Both assume the parts fail independently (HELM), and a shared part breaks that (Kohler's parallel bus, notes 3.5). A standby generator can also fail to start, which MTBF does not cover (NREL, notes 3.5). |

## 3. Can it be taught mostly visually, through interaction?
Partly, as the runbook says for probability. Every lesson is a steps lesson of about 12 screens (up
to 14 for lesson 5), with SHOW screens of up to about 90 words. Every picture is the beads language
of `dataviz.md`, its shared CSS and JS pasted unchanged. The prototype `dataviz.proto.html` has ten
steps, two per lesson, and each lesson's picture starts from its two steps. Opening settings are
never the one the question is about (dataviz.md, "Interaction"). The `.say` line gives one or two
warm sentences on the state, never a readout's number, with the prediction first and the answer
only after your move.

- **Lesson 1, the balancing pile (dataviz lesson 1, steps 1 to 3, as listed).** Fifty Zs readings
  (an example circuit at 0.80 Ω, read to 0.01 Ω) pour, the first few as numbers dissolving into
  beads. Tap a bead and its path through the pegs draws: twelve small nudges add up to its error.
  Predict, then halve the random error: the pile halves in width, nearly doubles in height, and
  balances in the same place. Drag the ringed bead, a slipped probe: the beam tips, the fulcrum
  creeps a fiftieth of the slip, the median barely moves. Then insulation resistance, simulated as
  200 MΩ nudged by factors, pours into a bell on a scale by factors; turned onto an even scale it leans
  into a long high tail and the beam balances at a mean above the median, because the mean is pulled
  towards the heavier tail (NIST, research source 19). Why this picture: delMas and Liu found the
  mean as "a self-adjusting fulcrum on a balance comes close to the necessary conception", and that
  predict-and-test software builds the idea of SD (notes 6.1). Each reading is drawn as itself, so
  you judge spread by distance from the mean, not by bar heights or the range, the two mistakes
  Cooper and Shore and delMas and Liu found (notes 6.1). Same mean, different spread is Bitesize's
  example and Cooper and Shore's advice (notes 2.2, 6.1). **Adaptation:** for the hand-worked SD
  screens, a pile of five beads on the same beam, made with the same helpers, so you can square and
  average five deviations yourself. A pile of five is too small for a bell, and the screen says so.
- **Lesson 2, offset and repeats (dataviz lesson 2, steps 3 and 4).** The hopper sits at the true
  value plus an offset you set ("Meter reads high by"), behind a window as wide as an example meter's
  accuracy, ±(0.1% of reading + 2 digits). "Each bead is the mean of 1, 2 or 4 readings" and the pegs
  close in. The surprise: repeats tighten the pile round where the meter centres, and the true value
  can fall outside the result. Then "The meter reads to 0.01 V or 0.05 V", and the beads hop into
  bricks one display step wide. Why this picture: NPL says systematic error is the case where "you
  learn nothing extra just by repeating", and the notes ask for exactly this "shifted cluster" to be
  made visible (notes 3.4, 6.2). It answers the point paradigm, the belief that one reading can give
  the true value (Buffler and others, notes 6.2). **Adaptation:** a last screen adds an example limit
  line (the dataviz `bd-limit` mark) near the result bracket. Slide the offset and the bracket clears
  the limit, crosses it, or straddles it. That gives UKAS's rule: an interval that overlaps the limit
  cannot show a pass or a fail (notes 3.4). The dataviz list has no limit in lesson 2. I added it
  because the notes call this rule the most useful single idea for an inspector.
- **Lesson 3, the bell and the ruler (dataviz lesson 3, steps 5 and 6, as listed).** An example UPS
  output on rounds. The amber curve traces the skyline and relaxes into the bell. Each band blooms
  and its beads ring as the tile counts them, with a share bar filling to the rule's tick. Example
  limits grow, and an honest reading beyond one shivers to a warning. Drop fresh batches ("Batches
  with a reading out" keeps count) and drag the ringed bead along the SD ruler. The surprise: honest
  readings land out now and then, and one far out on the ruler is more likely a slip, so test again.
  Why this picture: the 68-95-99.7 rule is shown as a count of real beads beside the rule, never as a
  formula alone, which delMas and Liu warn against (notes 6.1). HELM and NIST's habit, ask why before
  deleting (notes 4.3), is the tally's point.
- **Lesson 4, tip and peel (dataviz lesson 4, steps 7 and 8).** The pile turns onto its side and the
  readings peel off leftwards in the order taken, the mean so far writing itself. A flat amber line
  at the mean tilts into the best fit. Set the drift: with none, the line still leans, and swings on
  every fresh batch. Then "Same cause": a pump bearing's temperature and a battery's float current, a
  reading every 4 hours, with the air temperature between them (the dataviz example rule). Fold them
  "One against the other": with the air swinging ±3 °C they line up closely (r about 0.9) though
  neither drives the other; with the air steady they make a round cloud. Insulation resistance uses a
  log scale. Why this picture: signal against noise is "perhaps the most fundamental concept in
  statistics" (Konold and Pollatsek, notes 6.1), and the zero-drift lean shows the noise with your
  own hand on the cause. The fold shows a shared cause, the way to teach correlation without teaching
  the slogan as a ban (notes 6.3). **Adaptation:** a "longest run up or down" tile beside the trend
  tile, so the six-in-a-row idea can be counted on the peeled string (notes 4.4). And on the
  insulation resistance string, a choice "As measured | Corrected to 20 °C" re-sorts the beads with the
  hop. Megger's own record shows the downward trend only after correction (Curves A and B, notes 4.4).
  Both build on the shared helpers.
- **Lesson 5, the shelf of units (dataviz lesson 5, steps 9 and 10, as listed).** Fifty units on a
  shelf. "Years in service" opens at 5. Drag it and each unit drops when its lifetime, t = −ln(u) ÷ λ,
  runs out. The failure-rate strip below reads flat. "Units: one by one, pairs in series, pairs in
  parallel." The surprises: at the MTBF only about 37% still work; series pairs empty the shelf twice
  as fast; a parallel pair's failure rate starts at zero and rises. Then the bathtub: the clock runs
  to 30 years, and the pile grows an early heap, a quiet floor and a wear-out hump while the dot rides
  the sketched rate. Why this picture: survival is a share of a population, so watching units leave
  a shelf shows R(t) as "the share still here" (Bel's definition, notes 3.5). The series and parallel
  choice puts the working case and the failing case side by side, which is what the OCR examiners'
  muddle calls for (notes 6.4).
- **Colour as the dataviz table sets it:** beads in the kit's accent2, the beam, fulcrum and mean in
  ink, small labels and spans in teal accent, the one teaching line of a view (bell, best fit, what
  the rule expects) in amber, and anything beyond a limit in red warn. Green is never used in a data
  picture. No colour is named in words you read.

## 4. What else
- **Benchmark (notes 1, 2 and 8).**
  - **Brilliant** has no single statistics-for-engineers course. Its ground is spread over six
    courses, 153 lessons in all (notes 1, 8). Everyday Statistics starts with the mean as a balance
    and brings in the median by comparison, outliers last (notes 1.1). That is lesson 1's order.
    Exploring Data Visually has Trends and Scatter Plots (notes 1.2), and Regression starts with
    Correlation (notes 1.5): lesson 4. Probability and Chance puts AND and OR in levels 6 and 7
    (notes 1.4): lesson 5, taught much earlier and on reliabilities. What is inside Brilliant's
    lessons is UNCONFIRMED: only titles were seen (notes 1).
  - **What Brilliant lacks that you need:** measurement uncertainty, tolerance, run rules and
    reliability (notes 1.7). Those come from HELM, NPL, UKAS, Fluke, NIST and Megger.
  - **Khan:** centre and spread, then z-scores and the empirical rule, then trend lines (notes 2.1).
  - **HELM:** descriptive statistics (36), the normal distribution (39), regression and correlation
    (43), reliability and quality control (46) (notes 2.4). Four of the five lessons lean on it.
  - **Bird's Engineering Mathematics:** the same order, with mean, median, mode, SD and quartiles in
    one chapter (notes 2.5).
  - **SQA National 5 and Higher Applications of Mathematics** are the school floor: mean, median,
    range, SD, a line of best fit, tolerance limits, correlation and cause, AND and OR (notes 2.3).
- **His aim (notes 3 and 7).** No public syllabus for your Level 3 marine engineering course was
  sought, as you asked (notes 7, UNCONFIRMED). What the public standards show:
  - **Pearson HN Unit 4002** (core in every HN Engineering pathway), LO2: "Investigate engineering
    data by calculating mean, mode, median, and standard deviation" and normal probabilities (P4,
    P5). Its Merit line, a hypothesis test, is outside your scope (notes 3.1).
  - **Pearson 4037 Statistical Process Control:** "natural and assignable causes of variation", the
    noise-against-drift split of lesson 4 (notes 3.1).
  - **The MCA management-level mathematics syllabus has no statistics heading.** Its nearest lines
    are an error as a percentage and averages (notes 3.3). The MCA ETO syllabus is where this course's
    habits show up: measuring and calibrating instruments, "Trending HV IR tests", and testing the
    emergency generator, battery bank and UPS (notes 3.3).
  - **ST0457 Engineering technician, option 5 Maritime electrical fitter** (public standard; the
    Royal Navy has its own approved assessment, which is not claimed here as how it trains): "read,
    analyse and interpret engineering data" and test "to ensure individual components and assemblies
    meet the required specification" (notes 7). It does not use the word statistics. That your first
    meeting with these ideas will be through test and maintenance records, not a maths unit, is my
    guess (UNCONFIRMED, notes 7).
- **Where it is used (each cited before a lesson uses it).**
  - **Centre and spread (1):** Pearson 4002 P4, 4037 M1 and 4079 P4, mean and standard deviation of
    engineering and manufactured data (notes 3.1). HELM 36: engineers "reach defensible conclusions"
    from test data (notes 4.1). ST0457 option 5, interpreting engineering data (notes 7).
  - **Trusting a reading (2):** MCA ETO "The use of measuring and calibrating instruments" (notes
    3.3). An installation tester's accuracy "defined as ±(% reading +digit counts)" and its RCD
    trip-current accuracy of ±5% (Fluke 1660 manual and 1664 FC page, notes 3.4). UKAS's rule for a
    result against a limit (notes 3.4). MCA "Expresses an error as a percentage" (notes 3.3).
  - **The normal curve (3):** HELM 39's piston rings and strain gauge, tolerance against a normal
    spread (notes 2.4, 4.3). SQA National 5 "Given the tolerance, calculate the limits" (notes 2.3).
    Pearson 4002 P5 and 4079 P5, normal and Gaussian probabilities (notes 3.1). HELM 46.2's control
    limits at the mean ± 3σ (notes 4.3).
  - **Trends (4):** MCA ETO "Trending HV IR tests" (notes 3.3). Megger: "What really matters is the
    trend in readings over a time period" and a persistent downward trend is "fair warning ... even
    though the readings may be higher than the suggested minimum" (notes 4.4). Condition monitoring:
    SKYbrary's definition, the class society ABS's machinery vibration programme, ST0457 option 10 (notes 7).
  - **Reliability (5):** IMO ISM Code 10.3, "the regular testing of stand-by arrangements" for
    equipment whose sudden failure may be hazardous (notes 7). MCA ETO emergency generator, battery
    bank and UPS testing (notes 3.3). NREL's standby diesel generator reliability report, and NFPA
    110: "battery failure is the most common cause of generator failure" (notes 3.5). The Kohler UPS
    paper's rectifier, battery and inverter in series, with failure rates that add (SECONDARY
    figures, notes 3.5).
- **The mistakes to catch, each with a puzzle and its own hint.**
  - **Lesson 1, spread read from the range alone:** Cooper and Shore found students use "the range
    for a measure of variability, ignoring the significance of the frequencies" (notes 6.1). A DO
    gives two piles with the same range and asks which is more spread.
  - **Lesson 1, spread read from bar heights:** "50% of the students judged variability by focusing
    on the varying heights of the bars" (Cooper and Shore), the "bumpiness" of delMas and Liu (notes
    6.1). Beads replace bars, and a DO offers a bumpy narrow pile against a smooth wide one.
  - **Lesson 1, far apart rather than far from the mean:** students place values "as far away from
    each other as possible", with "No mention ... of distance (or deviation) from the mean" (delMas
    and Liu, notes 6.1). A DO asks which arrangement of five readings gives the largest SD.
  - **Lesson 1, the recipe without the readings:** the "add up and divide" mean used without "a
    connection to the appropriate data values" (Cooper and Shore), and students who can compute means
    but "do not know how to apply or interpret them" (Konold and Pollatsek) (notes 6.1). Each DO asks
    what the number says about the circuit. SQA's 2025 National 5 report: some answers showed no
    "clear understanding of the term 'standard deviation'" (notes 6.1).
  - **Lesson 2, one reading is the answer:** the point paradigm holds "that a single measurement can
    in principle yield the true value" and that "uncertainty can in principle be zero" (Buffler and
    others 2001; the 2022 study, notes 6.2). The lesson opens on the same circuit giving different
    readings.
  - **Lesson 2, averaging fixes everything:** Oak National Academy lists "a mean of repeat readings
    reduces random errors" as a misconception: the mean reduces their effect, but "The random errors
    in the original readings are unaffected" (notes 6.2). NPL adds that repeating does nothing for a
    systematic error (notes 3.4). A DO sets an offset and asks whether four repeats bring the result
    to the true value.
  - **Lesson 2, precision for accuracy:** NPL says precision is "often misused to mean 'accuracy' or
    'uncertainty'", and NUSTEM says "A better term might be 'resolution'" (notes 3.4, 4.2). The
    lesson uses resolution and accuracy and avoids "precision". A DO asks which a finer display
    improves.
  - **Lesson 3, the rule as a formula:** "emphasis on calculations and procedures does not
    necessarily promote a conceptual understanding" (delMas and Liu, notes 6.1). Every share is
    counted on beads first.
  - **Lesson 3, deleting the awkward reading:** a teaching statement, not a counted mistake. HELM:
    "never automatically used simply to reject an outlier"; NIST: "we typically do not want to simply
    delete the outlying observation" (notes 4.3). A DO offers "delete it" against "test again and
    look for a cause".
  - **Lesson 4, the slogan as a ban:** students may take it to mean "correlation cannot mean
    causation" (Frontiers, 2025), and one held it as "a universal rule" (think-aloud study) (notes
    6.3). A DO asks how you would show that warmth lowers insulation resistance (change the
    temperature and watch), not just "is it cause?".
  - **Lesson 4, noise read as drift:** no source counts this mistake. It is taught as a check (drop a
    fresh batch; does the lean hold?) not as a cited mistake. Signal and noise is cited as the
    fundamental idea (Konold and Pollatsek, notes 6.1).
  - **Lesson 5, "and" and "or" muddled:** OCR's January 2024 examiners saw candidates use "the machine
    still working 'if A was still working but B was not'" when the question was simpler (notes 6.4).
    Series and parallel sit side by side, with the working case and the failing case written for
    each.
  - **Lesson 5, MTBF as a life:** Bel's 36.7% (notes 3.5) and NREL's point that MTBF "cannot be used
    to estimate the probability of an EDG's runtime failure" for a generator that sits idle (notes
    3.5). These are a maker's blog and a laboratory report, SECONDARY as teaching sources (notes 6.4).
    A DO asks what share of units reach their MTBF.
  - **Not stated as common:** no source counts these, so they are taught as checks, not as cited
    mistakes.
    - Forgetting the square root at the end of the SD (lesson 1).
    - Reading "the result ± 2 s ÷ √n" as where most readings land (lesson 2; dataviz keeps "result"
      and "most beads" apart).
    - Running a fitted line out past the last reading to predict a date (lesson 4; SQA Higher,
      notes 2.3).
    - Adding reliabilities in series instead of multiplying them (lesson 5).
- **Size and cost.** 5 lessons of about 12 screens (lesson 5 up to 14) on the agreed settings
  (CLAUDE.md).
  - Vectors came to about 8.2M tokens, Differential equations about 9.2M, Matrices about 8.5M and
    Linear algebra about 8.9M for seven lessons each (docs/plans/maths-queue.md), so about 1.2M to
    1.3M a lesson. These pictures are heavier: each body pastes the shared beads code and animates a
    pour, springs and a second view, and the "Partly" screens carry more words. So I estimate about
    1.3M to 1.5M a lesson.
  - That is about 6.5M to 7.5M for the course, plus about 0.3M for the plan. The research is done
    (74 saved tool results) and the visual language is chosen.
  - The full process measured on Fractions lessons 4 to 8 was about 1.65M a lesson, about 8.3M for
    five.
  - Each build's real cost is reported to you.
- **Lesson 1 first.** Lesson 1 is built and checked first (about 1.4M, plus the plan). The rest follow
  without waiting, since you approved the build.
- **Gaps to close at build time.** None blocks the build.
  - **Lesson 2:** "the standard deviation of a mean is s ÷ √n" is standard and the dataviz result
    bracket uses it, but no quote in the notes states it (notes 5 says the uncertainty of a mean is
    taken from NPL, not derived). The research stage cites it (NPL GPG 11 or UKAS LAB 12) before the
    lesson states it.
  - **Lesson 3:** the 68% figure is quoted only from LibreTexts (SECONDARY, notes 4.3). UKAS and HELM
    give the 95% and 99.7%. The research stage finds an original source for 68% (the NIST handbook
    is the likely one).
  - **Lesson 3:** dataviz.md says that with limits at ±2.7 SD "about one batch in five or six has an
    honest reading out". I checked it by script: for the twelve-nudge simulation read to 0.01 V it is
    about one in six (0.17), but for a true normal curve it is about one in three (0.32 for 50
    readings), because twelve nudges have thinner tails than the normal curve. So the lesson states
    only what the tally counts, or names that figure as the simulation's. It never gives one in six as
    a fact about the normal curve.
  - **Lesson 4:** the "same cause" pair is the dataviz example rule. That a battery's float current
    rises with temperature, and a bearing's temperature with the air, are physical claims the notes
    do not hold. The research stage cites both, or the screen says the rule is an example made to show
    a shared cause and claims nothing about real batteries or bearings.
  - **Lesson 4:** Megger's halve-per-10 °C rule is "a rule of thumb" in its own words (notes 4.4), and
    the lesson calls it that.
  - **Lesson 5:** HELM's worked bulb example has a slip. It gives 49%, but 1 − e^(−7000/8000) is about
    58% (notes 3.5). The lesson does not reuse it. The series example (just under 92% fail before
    8000 hours) checks out and may be used.
  - **Lesson 5:** worked numbers computed for this brief: Bel's 36.7%, 60.6% and 90.5% at 1, ½ and
    1/10 of the MTBF (notes 3.5); a series pair at one unit's MTBF keeps e^(−2) ≈ 13.5%; a parallel
    pair keeps 2e^(−1) − e^(−2) ≈ 60.0%; a series pair's MTBF is 1 ÷ (2λ) and a parallel pair's 1.5 ÷ λ
    (the dataviz rules). Kohler's 20 + 10 + 20 per million hours gives an MTBF of 20,000 hours,
    labelled as a maker's example. The fact-check recomputes all of them.
  - **Lesson 1:** the earth electrode "E1" averaging rule from your Inspection and testing slides is
    UNCONFIRMED (notes 5). It is not used unless the research stage confirms its wording.
  - **Throughout:** what is inside Brilliant's lessons is UNCONFIRMED (notes 1). So are the MCA oral
    syllabus and any syllabus for your Level 3 course (notes, open points).
