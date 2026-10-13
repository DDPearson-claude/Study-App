# Calculus fundamentals: the course brief

Written 13 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
the fourth course in the Maths shelf's Advanced maths folder, "Derivatives and integrals properly:
rules, meaning and uses". You are jumping ahead to it. The shelf puts the Algebra folder's functions,
powers, exponentials, logarithms and trigonometry first, and Limits and Derivatives before this
course. So this course teaches inline the few things it needs from them and leaves the rest for
later. Sources and quotes are in `research-notes.md` beside this file (139 quotes, every one
checked against the saved search results; section numbers below point there).

## The short version
**Ten lessons**
1. Average rate of change (the pilot)
2. The rate at an instant
3. The derivative as a function
4. The power rule
5. Rates on the job
6. Highest and lowest
7. Integration, the reverse
8. Adding up: the definite integral
9. Work from a pV diagram
10. Mean and RMS values

**The main pictures:**
- **A chord on a curve.** Drag two points on a curve and read the slope of the straight line between
  them, with its units (volts per second, metres per second). The MCA calls this line a "chord".
- **A secant that becomes a tangent.** A slider shrinks the step between the two points. The chord
  turns into the tangent and a slope readout settles on one number.
- **A slope tracker.** Drag a point along a curve. Its slope drops a dot on a second graph below,
  and the dots trace out the derivative.
- **A growing square and a growing cube.** A square of side x grows a little. The new area is two
  thin strips and a tiny corner, which is where 2x comes from.
- **A bar count that becomes an area.** Bars under a rate graph, with a slider for how many. Their
  total settles on the exact answer, and bars below the axis count as minus.
- **A pV diagram** for an expanding gas, pV^n = C, with the work as the area under it.
- **A sine wave squared.** Its humps fold exactly into its dips, so the mean of the square is half
  the peak squared. That gives RMS without trigonometry.

**Decisions taken for you** (say if you want any changed):
- **Ten lessons.** The research supports eight to ten (notes 7). The SQA HN unit spends 18 of its
  40 hours on calculus, 10 on differentiation and 8 on integration (H7K1 34, notes 3.1). Brilliant's
  complete Calculus course spends 20 lessons on the same ground, in its levels 1 to 4 (notes 1.1,
  7). Nine is possible by joining lessons 9 and 10 into one "Using integrals" lesson. It would save
  about 1.2M tokens, but pV^n = C and RMS would each get half a lesson.
- **Lesson 1 is the pilot.** You try Average rate of change on your phone before the other nine are built.
- **Steps lessons, with a little more explaining.** The runbook names calculus as "partly" visual.
  So SHOW screens may carry a short paragraph, not just one to three sentences.
- **Average rate before the tangent.** Bressoud (MAA) found that almost everyone can work out an
  instant rate by rule, but "Almost no one gives me the correct average rate of change". He says
  the derivative must start from "a multiplicative relationship between changes in the variables"
  (notes 5.2). So lesson 1 is all average rate, in units, and the tangent waits for lesson 2.
- **No limits course first.** The limit is taught as a picture: make the step smaller and watch
  what the slope settles on (notes 4, point 2). There is no epsilon-delta and no sequences. That
  is how Khan, MIT, 3Blue1Brown, Bitesize and the HN unit do it; only Brilliant's Limits course
  starts from sequences (notes 4). The word "never" is kept out of it (see the mistakes below).
- **Derivatives before integrals.** Every benchmark except MIT's 2023 syllabus does it this way, and so
  do the MCA syllabus (section 7 then 8) and the HN unit (outcome 2 then 3) (notes 2.2, 3.1, 3.4, 7).
- **Taught inline, because you have not done them yet:**
  - **f(x) notation** in lesson 1: a rule that takes a number and gives one back, so f(3) means
    "the rule applied to 3". The MCA asks you to write "derivatives in terms of functional
    notation" (notes 3.4), and Brilliant's Derivatives course lists f(x) as its starting point (notes 1.2).
  - **Gradient as change in y per change in x**, written Δy ÷ Δx, in lesson 1. You have it already
    for straight lines through zero (The coordinate plane, lesson 6). Here it gets a name and units.
  - **Whole-number powers:** x² as the area of a square (lesson 1), x³ as the volume of a cube
    (lesson 4), xⁿ as n of the same number multiplied together (lesson 4).
  - **A power below zero**, only in lesson 9 and only as "one over": V⁻ⁿ means 1 ÷ Vⁿ. A power
    like 1.3 is a number your calculator handles. Indices properly wait for Exponents and radicals.
    HN Mathematics 2 also revises them as a separate step (notes 3.1, 4).
- **Left for later courses.** Trigonometric, exponential and logarithmic derivatives need radians,
  e and logs first (Bitesize: "This only works when (x) is measured in radians", notes 2.4, 4).
  The MCA does want them: "States the derivatives for sinx, cosx and lnx" (notes 3.4). So they come
  after your Trigonometry, Exponentials and Logarithms courses. The product and quotient rules
  (Pearson lists them, notes 3.3), implicit differentiation, and integration by substitution or
  parts wait too.
- **The chain rule is one optional stretch screen**, at the end of lesson 4. The HN unit lists it
  (outcome 2, notes 3.1); the MCA Second Engineer list does not (notes 4, point 3). The screen
  says it is a look ahead, and nothing later depends on it.
- **The capacitor charging curve is a picture, not a formula.** In lesson 5 the charge rises to its
  maximum while the current, its slope, falls towards zero (OpenStax, notes 6.1). The formula with
  e waits for Exponentials. Newton's law of cooling is left out: no marine syllabus line for it was
  found (UNCONFIRMED, notes 6.7), and your shelf's Differential equations course is where it belongs.
- **Where an equation would need quadratics, read it off the picture.** Setting a slope to zero
  can give an equation like 12x² − 240x + 900 = 0, and you have not done quadratics. Then the
  lesson finds where the slope readout hits zero and checks that value by putting it back in.
  Worked solves use curves whose slope is a straight line, like A = 20x − x².
- **Below the axis is hatched, not red.** Red is kept for mistakes, so area below the axis is ink
  with hatching and a minus sign.
- **Example numbers are labelled.** Charges, currents, pressures and volumes in the puzzles are
  example figures, said so on screen, or computed from a rule the screen shows. No figure is
  presented as a real engine's or a regulation's.
- **Your intake answers** (`intake.json`): to understand calculus and how to work with it; on the
  job and in everyday life; hands-on, with the why explained in full.

## 1. The overall topic
Calculus is the maths of things that change. It has two halves that undo each other:
- **The derivative** is a rate: how fast one thing changes per unit of another, at one instant.
  Current is how fast charge flows, i = dq/dt. Speed is how fast distance grows.
- **The integral** adds up a rate to give the total. Charge is current added up over time. Work is
  pressure added up over the change in volume.

This course builds both from first principles, then gives you the one rule that does most of the
work (the power rule, forwards for derivatives and backwards for integrals). It ends on the uses
your college papers ask for: rates in circuits and motion, maximum and minimum, work from a pV
diagram, and mean and RMS values.

**It builds on:**
- **The coordinate plane:** points, scales, reading graphs and straight lines through zero. The
  slope of a straight line is where lesson 1 starts.
- **Proportional reasoning and Percentages:** rates and "per" (miles per hour, pounds per metre).
- **Linear equations:** expanding brackets with the area model (lesson 2 there). Lesson 3 here
  grows it to (x + h)², the square with two strips and a corner.
- **Solving equations:** formulas like P = VI and P = I²R, and rearranging. Lesson 6 uses them for
  maximum power, and lesson 9 rearranges pV^n = C.
- **Geometry fundamentals:** the area of a rectangle and the volume of a box.

**Not taught again:** reading a graph, the slope of a straight line through zero, expanding a
single bracket, rearranging formulas without powers.

**Edges.** Powers of x only, whole numbers mostly. No trigonometry, e or logs, no product or
quotient rule, no hard integration technique. Brilliant's own guide says its courses are "deep on
the concepts and thin on technique" (notes 1.4). This course aims for both, but only for the
technique a marine HNC/HND asks for first.

## 2. The lessons, in the order they build
The order follows the research's core (notes 7): rate of change, then the rate at an instant, then
the rules, then integration, then the uses.

| # | Lesson | The skill Dan leaves with |
|---|---|---|
| 1 | Average rate of change | A rule f(x) and its graph. The average rate between two points is Δy ÷ Δx, the slope of the chord, always with units. On a straight line every chord gives the same slope. On a curve they differ, and a falling graph gives a negative rate. Read it from a table and from a graph. Δ means "change in", as in the MCA's e = LΔi/Δt (notes 3.5). |
| 2 | The rate at an instant | Shrink the step and the chord's slope settles on one number: the rate at that instant. On y = x² at x = 3 the chord slopes go 7, 6.5, 6.1, 6.01, settling on 6. Zoom in and the curve looks straight. The settled value is written dy/dx, the MCA's "limiting value of δy/δx" (notes 3.4). The tangent is the line with that slope. |
| 3 | The derivative as a function | Do lesson 2 at every point at once. The square of side x + h is x², two strips of xh and a corner h², so the chord's slope is 2x + h, which settles on 2x. Now f′(x) = 2x is a new rule, drawn as its own graph. f′(3) = 6 is one number, f′(x) = 2x is the whole rule. A straight line y = mx has derivative m everywhere. |
| 4 | The power rule | The derivative of xⁿ is nxⁿ⁻¹, seen in the growing square (2x) and growing cube (3x²). A number in front stays: 5x³ gives 15x². Terms are done one at a time: 4x³ − 2x² + 7x − 9 gives 12x² − 4x + 7. A constant has derivative 0, because shifting a graph up does not change its slopes (MCA "States the derivative of a constant", notes 3.4). Optional last screen: the chain rule, seen once. |
| 5 | Rates on the job | Read a derivative in its units. Current from charge, i = dq/dt. A capacitor, i = C dv/dt: the current follows how fast the voltage changes, not the voltage. An inductor, v = L di/dt. Velocity from displacement and acceleration from velocity, which is the second derivative. In steady state every d/dt is zero (Stanford, notes 6.2). |
| 6 | Highest and lowest | At a top or bottom of a smooth curve the slope is zero (MCA: "at the turning point of a curve, the differential coefficient is zero", notes 3.4). The second derivative says which: slope falling means a top, rising means a bottom. Solve for the largest area from a fixed length, A = 20x − x². Maximum power to a load from a source with internal resistance, P = EI − I²r, built from P = VI. A box's largest volume, found from the slope readout and checked. |
| 7 | Integration, the reverse | Find the rule whose derivative you are given. Add one to the power and divide by the new power (Bitesize, notes 2.4), for any power except −1 (MCA, notes 3.4). Any constant could have been there, so add + c, and find c from a starting value: the charge at t = 0, the distance at the start (MCA "Determines the constant of integration from given conditions", notes 3.4). |
| 8 | Adding up: the definite integral | A rate times a time is an amount, so the bars under a rate graph add up to the total. More, thinner bars settle on the exact total, and the reverse rule gets it at once: F(b) − F(a). Charge from a current graph and distance from a speed graph. Bars below the axis count as minus, so current flowing back takes charge away. The bars at mid-height are the mid-ordinate rule from the MCA papers (notes 3.5, 3.6). |
| 9 | Work from a pV diagram | Work done by a gas is pressure added up over the change in volume, the area under the pV curve (notes 6.6). With pV^n = C, p = CV⁻ⁿ, and the reverse rule gives the MCA's area under pV^n = C, W = (p₁V₁ − p₂V₂) ÷ (n − 1) (notes 3.4). Check it against the bar count, which is how an indicator card's area is found. Expansion gives positive work, compression negative. Mean effective pressure is the area ÷ the length. n = 1 needs logs and waits. |
| 10 | Mean and RMS values | The mean value of a graph is its area ÷ its length, the MCA's "mean height of a figure" (notes 3.4). RMS is the root of the mean of the squares (notes 6.3). For a ramp the power rule gives it exactly: RMS = peak ÷ √3. For a sine wave the squared wave folds flat at half the peak squared, so RMS = peak ÷ √2, about 0.707 of the peak, with no trig needed (Khan, notes 6.3). Form factor is RMS ÷ mean (MCA, notes 3.5). |

## 3. Can it be taught mostly visually, through interaction?
Partly, as the runbook says for calculus. Every lesson is a steps lesson of about 12 screens, and
its SHOW screens can carry a short paragraph where an idea needs saying in words. The pictures:
- **The chord on a curve (lessons 1 and 2).** Two draggable points on a curve, the chord between
  them, and a rise-over-run triangle labelled Δy and Δx. The readout shows Δy ÷ Δx in units, as
  Bressoud's "relationship between changes" asks (notes 5.2). Lesson 1 starts on a straight line,
  which you know, where every chord agrees. Then the line bends and they stop agreeing. Brilliant's
  Derivatives course runs the same order: "Constant Rate of Change", "Variable Rate of Change",
  "Secant Lines" (notes 1.2).
- **The shrinking step (lesson 2).** One point stays put, and a slider brings the other towards
  it. The chord swings into the tangent while a small table of slopes fills in and settles. A
  zoom lens shows the curve going straight close up, Brilliant's "Local Linearity" (notes 1.2).
  The MCA itself starts here: "Determines the gradient of a chord", then "the limiting value of
  δy/δx" (notes 3.4).
- **The slope tracker (lessons 3 to 6).** Drag a point along the top graph. The tangent rides with
  it, and its slope is plotted as a dot on a second graph underneath. Drag all the way and the
  dots draw f′(x). Zandieh's research says the derivative is three things in turn: a ratio, its
  limit at a point (a number), then the collection of those limits (a function) (notes 5.1). This
  picture shows the number and the function side by side. In lesson 5 the two graphs are charge
  and current, or displacement and velocity. In lesson 6 the bottom graph crossing zero marks the top.
- **The growing square and cube (lessons 3 and 4).** A square of side x gets a little longer. Its
  extra area is two strips of x by h and a corner of h by h, the same area model as Linear
  equations lesson 2. Lesson 4 does the cube, with three slabs. The picture comes from Brilliant's
  "Growing Squares" lesson title (notes 1.2) and 3Blue1Brown's "Derivative formulas through
  geometry" (notes 2.3).
- **A family of curves (lesson 7).** A slider for c moves one curve up and down. Its slopes never
  change, so they all have the same derivative. The puzzle is to pick the one through the starting
  point.
- **The bar count (lessons 8 to 10).** Bars under a rate graph, each a rate times a time, with a
  slider from 4 bars to 100 and a running total that settles. Bars below the axis are hatched and
  count as minus. Khan's integral unit starts this way, with "Accumulation of change" and Riemann
  sums (notes 2.1). MIT's syllabus calls an integral "a sum of many small pieces" (notes 2.2) and
  the MCA calls it "elemental summation" (notes 3.4). The research says to teach "adding up thin
  slices of a rate" first and "area" second (notes 5.5).
- **The pV diagram (lesson 9).** An expansion curve pV^n = C, with sliders for n and the end
  volume. The bar count under it is compared with the formula, and a toggle runs it as a
  compression. The MCA Applied Heat paper: "the area of the pV diagram represents W.D." and "the
  area of an indicator card using the mid-ordinate rule" (notes 3.5).
- **The sine wave squared (lesson 10).** A wave, then its square drawn under it. The square's humps
  above the half-way line lift off and drop exactly into its dips, leaving a flat band at half the
  peak squared. Khan finds the mean of the square "without using calculus" this way (notes 6.3).
  The sine is shown as the shape of an AC wave, computed by the page. Its trigonometry waits for
  later.
- **Colour as before:** ink for curves, working and controls, amber for key terms, teal for small
  labels, red only for a slip, green only for finished.

## 4. What else
- **Benchmark (notes 1 and 2).** Brilliant no longer has a Calculus Fundamentals course. Its address
  returns the Courses page (notes 1.0). Whether it was retired or folded in is UNCONFIRMED, and its
  2019 lesson list survives only as a web-archive copy (UNCONFIRMED, notes 1.5). So the benchmark is
  the rest:
  - **Brilliant Calculus** (42 lessons). Its levels 1 to 4 are what a derivative is, using
    derivatives, the rules and integrals (notes 1.1). Lessons 1 to 8 here cover that ground.
  - **Brilliant Derivatives** (23 lessons, 4 of 11 levels written). Its written levels run average
    rate, signed change, the instant rate, then the derivative as a limit, worked on x² first
    (notes 1.2). Lessons 1 to 3 follow that order. Its power rule level is "Coming soon", and
    lesson 4 adds it.
  - **Khan** puts limits first, then rules, then applications, then integration as "accumulation
    of change" (notes 2.1).
  - **MIT 18.01** starts with "Velocity and Rate of Change" and treats integrals as "a sum" from
    chapter 11 (notes 2.2).
  - **SQA Higher and Bitesize** go first principles, then powers of x, then stationary points and
    rates, then integration and area (notes 2.4).
  - **HELM** has differentiation, its applications, integration, then integration's applications,
    with "The Mean Value and the Root-Mean-Square Value" at 14.2 (notes 2.5).

  What they lack that you need: Brilliant stops before the integral's engineering uses (work from
  a pV diagram, mean and RMS) and is "thin on technique" (notes 1.4). Khan and MIT assume
  trigonometry first. Lessons 9 and 10 and the power-rule practice come from the MCA, HN and HELM
  lists.
- **His aim (notes 3).**
  - **SQA Engineering Mathematics 2 (H7K1 34, SCQF 7):** 40 notional hours, with "Outcome 2 (10
    hours)" differentiation and "Outcome 3 (8 hours)" integration. First principles is taught but
    "(not assessable)" (notes 3.1). The unit wants functions, trig, log and exponentials first, so
    this course is the core, not the whole unit. Whether the code is still current is UNCONFIRMED.
  - **Pearson BTEC HN Unit 4002, LO4:** "Examine how differential and integral calculus can be used
    to solve engineering and manufacturing sector problems", with maxima and minima (notes 3.3).
    Which awarding body your college uses is UNCONFIRMED.
  - **MCA Second Engineer mathematics, section 7:** the chord, δy/δx to dy/dx, axⁿ, the derivative
    of a constant, second derivatives, velocity and acceleration, turning points, max and min
    volumes (notes 3.4).
  - **MCA section 8:** integration as the reverse, the constant, axⁿ for n ≠ −1, elemental
    summation, and "the area under the curve, given by pV n = C" (notes 3.4).
- **Where it is used (each cited before a lesson uses it).**
  - **Average rate (1):** the MCA's "gradient of a chord" (notes 3.4). Applied Mechanics: distance
    against time graphs "and defines the slope" (notes 3.5). General Engineering Science I: "the
    gradient of distance time graph as speed" (notes 3.6). Electro-technology writes emf with
    changes, e = NΔΦ/Δt and e = LΔi/Δt (notes 3.5).
  - **The rate at an instant (2):** MCA "the limiting value of δy/δx ... defining it as dy/dx"
    (notes 3.4). SQA H7K1 34 first principles, "(not assessable)" (notes 3.1).
  - **The derivative as a function (3):** MCA "Writes derivatives in terms of functional notation"
    (notes 3.4). HELM 11's outcomes: the gradient of a curve at a point, and derivatives "from
    first principles" (notes 2.5).
  - **The power rule (4):** MCA "Derives the derivative of ax n", "multinomial algebraic
    expressions" and "the derivative of a constant" (notes 3.4). SQA Higher: "an expression in
    powers of x" (notes 2.4). The chain rule: HN outcome 2 (notes 3.1).
  - **Rates (5):** current as "the time derivative of the charge" (OpenStax, notes 6.1). i = C dv/dt
    (Fiore, Khan, Stanford) and v = L di/dt (Stanford, LibreTexts) (notes 6.2). MCA "Determines
    velocity from displacement-time functions and acceleration from velocity-time functions"
    (notes 3.4). SQA outcome 2: "the rate of change of a variable in an Engineering problem"
    (notes 3.1). Applied Mechanics: "force is equal to the rate of change of momentum" (notes 3.5).
  - **Max and min (6):** MCA turning points, the second derivative and "max and/or min volumes"
    (notes 3.4). SQA's own example, "the condition under which the maximum electrical power will be
    transferred from a voltage source to load" (notes 3.1). Pearson LO4 "maxima and minima"
    (notes 3.3).
  - **The reverse (7):** MCA "integration is the reverse of differentiation", "the need for a
    constant", "Determines the constant of integration from given conditions" (notes 3.4). Bitesize
    on where + c comes from (notes 2.4). SQA "Solve one indefinite and one definite integral"
    (notes 3.1).
  - **The definite integral (8):** SQA "area under a velocity time curve giving distance travelled"
    (notes 3.1). Applied Mechanics: velocity against time graphs, relating "the slope and area to
    the motion" (notes 3.5). The mid-ordinate rule (Applied Heat, notes 3.5; General Engineering
    Science I, notes 3.6). Charge accumulating on a capacitor (notes 6.1).
  - **Work (9):** SQA "work done by an expanding gas" (notes 3.1). MCA "pV n = C" (notes 3.4).
    Applied Heat: the pV diagram's area is the work, mean effective pressure, indicator cards
    (notes 3.5). General Engineering Science II: "Mean Effective Pressure from indicator card data"
    (notes 3.6). LibreTexts on the sign: "positive for expansion and negative for compression"
    (notes 6.6).
  - **Mean and RMS (10):** Electro-technology: "mean value, rms value and form factor with
    reference to a sine wave", and for "non-sinusoidal wave forms" (notes 3.5). MCA "mean height
    of a figure from area and length" (notes 3.4). SQA "mean values, root mean square values"
    (notes 3.1). HELM 14.2 (notes 2.5).
- **The mistakes to catch, each with a puzzle and its own hint.**
  - **Lesson 1, average rate:** most learners can give an instant rate by rule but not the average
    rate, and "slope" itself is a weak idea to build on (Bressoud, MAA, notes 5.2). An AP study
    found the same rate-of-change misconceptions under two different curricula (notes 5.2).
  - **Lesson 2, "a limit is never reached":** in Williams' 1991 survey 70% of 341 students agreed
    that a limit is a number the function "gets close to but never reaches". The figure is
    SECONDARY, reported in a dissertation (notes 5.4). The informal models "were met with extreme
    resistance" when challenged (Williams, ERIC, notes 5.4). The slope of the tangent is exactly 6,
    and the chord gets as close as you like. The lesson never says "never".
  - **Lesson 2, "instantaneous rate" by rule:** "finding the instantaneous rate is formulaic"
    (Bressoud, notes 5.2). Every DO screen asks what the number means in its units, not just the number.
  - **Lesson 2, the tangent "only touches once":** a pre-calculus text defines it that way and then
    qualifies it, since a tangent may meet the curve again elsewhere (Lumen, notes 5.2).
  - **Lesson 2, dy/dx as a fraction (SECONDARY only):** a teachers' forum warns it "deludes students"
    and that dx and dy "are not real numbers" (notes 5.3). No research paper tests it. So dy/dx is
    taught as one symbol, the settled value of δy/δx, as the MCA defines it. One puzzle asks
    whether the d's cancel.
  - **Lesson 3, the derivative as a number or a function:** Zandieh's three layers (notes 5.1).
    A learner on Khan took g′(−1) = −2 to mean the tangent passes through (−1, −2). That is a single
    comment, an anecdote (notes 5.2). A DO screen offers that exact choice.
  - **Lesson 5, the value or its rate:** "Not the voltage itself, but to the rate of change of
    voltage" (Khan), and "the value of the voltage is not important, but rather how quickly the
    voltage is changing" (Fiore) (notes 6.2). These are teaching statements, not a counted
    mistake. A puzzle shows a high but steady voltage and asks for the capacitor current, which is zero.
  - **Lesson 7, the constant:** SQA's 2023 Higher report says "a few candidates did not include
    the ‘ + c ’", and the Advanced Higher report found "basic errors ... in dealing with the
    constant of integration" (notes 5.6).
  - **Lesson 8, area or accumulation:** integration as the limit of a sum was "difficult even for
    good students" (Orton 1983, 100 interviews, notes 5.5). Students who could say "the integral
    equaled the area under the curve" still could not link it to accumulation (Physical Review
    PER, notes 5.5). SQA's 2023 report: "Only a few candidates were able to identify the area
    represented by the integral on the sketch provided" (notes 5.6).
  - **Lessons 8 and 9, negative area:** students treat area below the axis "as a spatial area",
    not a negative quantity, in maths and in physics (IJRUME 2023, notes 5.5). Lesson 8 has a
    current graph that dips below the axis. Lesson 9 runs the pV diagram as a compression.
  - **Not stated as common:** no source counts these, so they are taught as checks (take the
    derivative back, look at the picture), not as cited mistakes.
    - Reading the height of a graph as its slope.
    - Forgetting to lower the power.
    - Taking a zero slope to mean a maximum. x³ is flat at 0 and is neither.
    - Taking RMS to be the plain mean. A sine wave's mean over a whole cycle is zero.
- **Size and cost.** 10 lessons of about 12 screens on the agreed settings.
  - The last six courses measured about 0.99M to 1.14M tokens a lesson
    (docs/plans/foundational-maths-roadmap.md). Calculus pictures are heavier: two linked graphs,
    a shrinking step, a bar count. So I estimate about 1.1M to 1.3M a lesson.
  - That is about 11M to 13M for the course, plus about 0.3M for the plan and research. The
    research can start from the 61 saved tool results.
  - The full process measured on Fractions lessons 4 to 8 was about 1.65M a lesson, about 16.5M
    for ten.
  - Each build's real cost is reported to you.
- **Pilot first.** Lesson 1 is built first (about 1.2M, plus the plan and research). You try it on
  your phone, and the other nine wait for your say.
- **Gaps to close at build time.** None blocks the build.
  - Brilliant's lesson pictures were not seen, only its contents lists (notes 8).
  - Which awarding body your college uses, and whether H7K1 34 is current, is UNCONFIRMED (notes 8).
  - **Lesson 6:** P = EI − I²r and "the load gets most power when its resistance equals the
    source's internal resistance" are standard results. But the research holds only SQA's line
    naming the problem. The lesson builds it from P = VI and V = E − Ir, both shown. The research
    stage must cite V = E − Ir and the R = r result before the lesson states them.
  - **Lesson 10:** the Notre Dame notes say a sine's "mean over half a period is equal to A/π"
    (notes 6.4). Read in context, that is the integral over the half period. The mean, which
    divides by the half period, is 2A/π, about 0.637 of the peak. So that number is not cited. The
    lesson finds the half-cycle mean with the bar count (computed from the drawn wave), and the
    fact-check confirms it against a second source.
  - **Lesson 10:** any claim about mains (such as what 230 V measures) needs its own source. None
    is in the notes, so none is made unless the research stage finds one.
  - **Lesson 9:** typical values of n for a real engine are not in the notes. The puzzles use
    labelled example values.
