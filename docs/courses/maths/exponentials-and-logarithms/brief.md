# Exponentials and logarithms: the course brief

Written 18 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
the seventh course in the Maths shelf's Algebra folder, "Growth that multiplies, the number e, and
the logarithm that undoes it: capacitor charging, decibels and pVⁿ = C when n = 1." It comes after
Quadratics and polynomials and before Trigonometry. Sources and quotes are in `research-notes.md`
beside this file (every quote cut by script from the 67 saved tool results and checked with
`tools/eval/sources.mjs`, `failed: 0`; section numbers below point there).

## The short version
**Eight lessons**
1. Growth by multiplying (built first)
2. The number e
3. The time constant: capacitors and cooling
4. Logarithms: the power you need
5. The log laws and decibels
6. Solving exponential equations
7. Log graphs: curved laws as straight lines
8. Isothermal work: when n = 1

**The main pictures** (one per lesson, each moved with your finger):
- **Add or multiply (lesson 1).** Two columns of bars over the same equal steps. One adds a fixed
  amount each step, the other multiplies by a fixed factor. Drag the factor and the amount, and
  step forward. The bars become dots on a graph. Set the factor below 1 and the bars shrink.
- **Split the year (lesson 2).** 100% growth in a year, paid in 1, 2, 4, 12, 365 parts. Drag how
  many parts. The steps get finer, the staircase turns into a smooth curve, and the year's total
  settles on 2.718…
- **The shrinking gap (lesson 3).** A capacitor charging towards its supply voltage. Drag the time
  along in steps of one time constant. A bar shows the gap still to close, and each step leaves
  0.368 of it. R and C sliders stretch the time axis. A switch turns it to discharging, then to a
  cooling bar whose gap is to the room's temperature.
- **The power ruler (lesson 4).** A ruler marked 1, 10, 100, 1000, with "× 10" on every step, and
  under it the powers 0, 1, 2, 3. Drag a pointer and read a number on top and its log below. A
  switch makes it a ruler of 2s, and another of e.
- **The slide rule (lesson 5).** Two power rulers, one sliding along the other. Slide 2 along to 3
  and the pointer reads 6: adding lengths multiplies the numbers. Then the decibel ruler, where
  each power step is 10 dB.
- **Read the time back (lesson 6).** A discharge curve with a level line you drag to a target, say
  75 V. Beside it the formula's machine and its undoing machine, which run the steps backwards to
  give the time where the line crosses.
- **Straighten the curve (lesson 7).** Readings that curve. Two switches turn each axis from
  ordinary to log. With the right switches on, the points fall on a line, and you lay a line with
  two handles, as in Straight-line graphs lesson 6.
- **Equal ratios, equal areas (lesson 8).** The curve p = C/V with bars under it from V₁ to V₂.
  Drag the two ends. Double the volume from anywhere and the area added is always the same, which
  is why the answer is a log.

**Decisions taken for you** (say if you want any changed):
- **Eight lessons.** Brilliant spends 71 lessons on this ground, 42 in Exponential Functions and 29
  in Logarithms (notes 1.1, 1.2, 8). The engineering sources are small: SQA's HN Outcome 2 is 8
  hours, NSW's Year 11 unit is 7 lessons, and Bird gives logs 8 pages and exponentials 14 (notes 3.1,
  2.5, 8). The research suggests seven, with e, decay and the time constant in one lesson (notes 8).
  I split them: e needs its own picture and its own reason, and the capacitor and cooling curves are
  the course's main use, so they get a full lesson. Decay goes into lesson 1 instead, as growth with
  a factor below 1. Seven is possible by joining lessons 2 and 3, as the research has it. It would
  save about 1.15M tokens, but e would get three or four screens.
- **Lesson 1 is built first, without a pause.** The runbook asks for a pilot you try before the
  rest. You asked for the folder in one push, so lesson 1 is built and checked first, and the
  others follow without waiting. You can try it on your phone as soon as it lands.
- **Steps lessons, with a little more explaining ("Partly", RUNBOOK section 0, item 3).** About 12
  screens each, SHOW then DO, ending on two or three mixed puzzles. SHOW screens may carry a short
  paragraph where an idea needs words: why e, why a time constant, why a log graph is straight, why
  n = 1 is special. Every lesson still has a picture you move, and the words stay short where the
  picture carries it.
- **A table before a formula.** Confrey and Smith build exponentials on "splitting", a multiplying
  step "that is not repeated addition", and warn that the topic is usually taught as "formulas ...
  and routine algorithms" (notes 4.1). Ellis and others show learners lining up "multiplicative
  growth" in the output with "additive growth" in the input (notes 4.1). So lesson 1 starts with a
  table of equal steps and a factor, and the formula A × bˣ comes from the table.
- **Predict first, then see.** Exponential growth is "grossly underestimated" (Wagenaar and
  Sagaria), and a short lecture reduced the bias only "slightly" (Ciccione and others) (notes 6.3).
  So lessons 1 and 2 ask you to guess before the picture runs, and the gap between the guess and
  the answer is the lesson.
- **Doubling time first, the percentage second.** In one study 65% underestimated growth given as a
  rate and 41% given as a doubling time (PMC, notes 6.3). Lesson 1 leads with "how long to double",
  and the paper's own suggestion, the rule of 72, is a check, not a rule (notes 6.3).
- **"Exponential growth is fast" is taught as contested.** HELM says "Exponential growth is very
  rapid" (notes 2.4). A PLOS ONE paper names "exponential growth is always very fast" as one of
  three misconceptions, and says it can hide growth "in its early stages" (notes 6.3). Lesson 1 shows
  both: e^x racing past x², and 9% a day that looks harmless for a week.
- **e by compounding, with its slope as one preview screen.** HELM admits "It will not be clear to
  the reader why this particular value is so important" (notes 4.3). So lesson 2 earns e with
  numbers: split a year's growth into more and more parts and watch the total settle (OpenStax,
  notes 4.3). Its last screen previews the second reason. The slope of eˣ equals its height (Colorado,
  OCR, notes 4.13), so growth is "proportional to the current function value" (OpenStax, notes 4.3),
  with a pointer back to Calculus fundamentals' slope tracker. It is a look ahead, and nothing later
  depends on it.
- **The capacitor before logs.** Lesson 3 works the curves forwards with the eˣ key: the voltage
  after a given time. The time to reach a voltage needs a log, so it waits for lesson 6. This is
  where Calculus fundamentals said "The formula with e waits for Exponentials".
- **Five time constants is a convention.** The trade tutorial calls 4T "virtually fully charged"
  at 98% and 5T "fully charged" at 99.3%, and says the capacitor "never reaches 100%" (SECONDARY,
  notes 4.4). OpenStax: "the final value is never reached" (notes 4.4). Lesson 3 says 5T is the
  usual line, shows the rule it comes from, 1 − e⁻⁵, and never calls it a law.
- **Newton's law of cooling is in, as an application.** No marine syllabus line for it was found
  (UNCONFIRMED, notes 4.5, 7.5). It is the discharging curve lifted by the room's temperature, and
  Bird's Higher book works a cooling steel bar with it (SECONDARY, notes 7.4). Calculus fundamentals
  left it out, and the differential equation that produces it stays in Differential equations. The
  screen gives its limit: it "holds only for very small temperature differences" when radiation
  carries the heat (Wikipedia, SECONDARY, notes 4.5).
- **"log" is base 10, "ln" is base e, and any other base is written.** Your calculator has both keys
  (Bitesize, notes 2.2). 35 of 59 students said ln(x) equals log(x) (Kenney and Kastberg, notes 6.2),
  and OCR's examiners say "state the base if not 10" (notes 4.14). So every log on screen carries
  its base until lesson 4 has named the two keys, and log₂ always does.
- **A log is a number before it is a rule.** The main finding in Chua and Wood is students who "fail
  to see the logarithm as a number" and so "cancel the word 'log'" (notes 6.2). Kuper and Carlson
  found that teaching the idea "has not been broadly effective" (notes 6.6). So lesson 4 is all
  about reading logs as numbers on the ruler, and the laws wait for lesson 5.
- **The laws come from the index laws and the slide rule, never from slogans.** Brilliant: "every
  logarithm rule is proved from an exponent rule" (notes 1.2). HELM pairs each log law with its
  index law (notes 2.4, 4.7). Chua and Wood call "times means add" and "divide means subtract"
  "misleading and unhelpful" (notes 6.2), so those phrases are never used. Wrong rules are checked on
  the calculator, as Chua and Wood suggest (notes 6.2).
- **Change of base gets one screen.** Khan, HELM 6.3 and Brilliant all teach it (notes 2.1, 2.4,
  1.2), and your calculator has no log₂ key. It is in lesson 5, with the examiners' slip beside it
  (notes 6.5).
- **Decibels are in the laws lesson.** A gain that multiplies becomes decibels that add, which is
  the product law at work. The decibel is 10 log of a power ratio (ITU, Britannica), and 20 log for
  a voltage or pressure ratio (Britannica) (notes 4.10). "10 dB sounds twice as loud" is taught as
  a perception, "approximately a perceived doubling" (SECONDARY, notes 4.10), not as physics.
- **Equations with the unknown inside a log get two screens.** Brilliant gives them a level and
  SQA's HN Outcome 2 names "logarithmic equations" (notes 1.2, 3.1). One screen converts log form to
  exponential form, which SQA's 2023 report found some could not do (notes 6.5). The other uses
  factorising from Quadratics and polynomials and throws out a root that would need the log of a
  negative number (Bird, SECONDARY, notes 6.5).
- **Two straight-line forms only.** y = abˣ (plot log y against x) and y = axⁿ (plot log y against
  log x). They are OCR's and SQA Higher's two forms (notes 2.3, 4.11), and pVⁿ = C is the second
  one. Straight-line graphs left exactly this to here (notes 5).
- **n = 1 is shown from the bars first, then the formula.** Calculus fundamentals' formula
  (p₁V₁ − p₂V₂) ÷ (n − 1) divides by zero at n = 1, because its reverse rule works "for any power
  except −1" (notes 4.12, 5). Lesson 8 counts the bars under p = C/V first, as the research asks,
  then gives W = p₁V₁ ln(V₂/V₁) (notes 4.12).
- **Left for later courses, with a one-line look ahead where it fits:**
  - **Derivatives** (Advanced maths): the derivatives of eˣ and ln x. The MCA wants "the
    derivatives for sinx, cosx and lnx" and SQA puts them in Advanced Higher (notes 3.3, 4.13).
    Lesson 2 previews eˣ, and lesson 8 previews ln x as the area rule run backwards.
  - **Differential equations** (Advanced maths): where the capacitor and cooling curves come from,
    and Pearson's merit criterion, "predictions of exponential growth and decay models using
    integration methods" (notes 3.2).
  - **Trigonometry:** none of its ground is used. Angles, sine waves and AC stay there.
  - **Complex numbers:** e raised to an imaginary power, the polar form of a phasor. This course
    keeps every power real.
- **Left out, not deferred:** the hyperbolic functions. HELM 6.2 and Pearson's function list have
  them (notes 2.4, 3.2), but no course in your folder does. If your college asks for cosh and sinh,
  they are built from eˣ, which you will have.
- **Example numbers are labelled.** Cited values are named with their source: e = 2.718…, 0.632 and
  0.368 per time constant (OpenStax, notes 4.4), 99.3% at 5T and the 4.4 V worked example (trade
  tutorial, SECONDARY, notes 4.4), discharge below 75 V within 3 minutes (IEC 60831 as a trade page
  reports it, SECONDARY, notes 7.2), the engine-room reading of 108.7 dB(A) (IMO, notes 7.1) and the
  85 dB(A) limit (trade news, SECONDARY, notes 7.1). Every other voltage, resistance, temperature,
  pressure and volume is an example figure, said so on screen, or computed from a rule the screen
  shows.
- **Colour as before.** Ink for curves, bars and controls. The capacitor's shrinking gap is ink, not
  red, because it is not a mistake. Amber for key terms, teal for small labels, red only for a slip,
  green only for finished.
- **Your intake answers** (`intake.json`): to understand exponentials and logarithms and how to work
  with them; on the job and in everyday life; hands-on, with the why explained in full.

## 1. The overall topic
Some things grow by adding the same amount each step. Others grow by multiplying by the same factor
each step, and that is exponential growth. Multiply by less than 1 and it is decay. This course
builds that idea from a table, draws it as a graph, and meets the number e, the base nature uses for
growth that never stops to take a step. The capacitor charging and discharging, and a hot part
cooling to the room, are the same curve, and the time constant measures how fast it runs.

The logarithm undoes the exponential. It answers "what power do I need?" A log is a number, read
off a ruler where every step is "× 10". The three log laws come straight from the laws of powers,
and they turn multiplying into adding: that is how decibels work, and how a slide rule worked.
Then logs solve equations with the unknown in the power (how long until this capacitor is safe?),
straighten curved laws on a graph (find n in pVⁿ = C from readings), and give the work done when a
gas expands at constant temperature, W = pV ln(V₂/V₁).

**It builds on:**
- **Powers and roots:** the three laws of powers (lesson 1), zero and negative powers (lesson 2),
  fractional powers such as 2^1.3 as a calculator job (lesson 4), and powers in formulas, with
  pVⁿ = C for a given n (lesson 7). Here the power becomes the unknown.
- **Percentages:** a rise or cut as a multiplier, + 5% is × 1.05 (lesson 3). That brief left
  compound change for later. It is lesson 1 here.
- **Functions and their graphs:** the machine, shifting and flipping a graph (lessons 5 and 6), and
  the inverse as a machine undone, mirrored in y = x (lesson 8), which ends by naming the
  exponential and the logarithm as the next pair.
- **Straight-line graphs:** gradient, y = mx + c, laws from readings and laying a line through
  scattered readings (lessons 5 and 6). It left "reducing y = axⁿ and y = abˣ to straight lines, and
  pVⁿ = C with n unknown" to this course.
- **Calculus fundamentals:** the capacitor curve as a picture (lesson 5), the slope tracker (lesson
  3), the bar count and work from a pV diagram for n ≠ 1 (lessons 8 and 9), and the reverse rule for
  any power except −1 (lesson 7).
- **Quadratics and polynomials:** factorising, used once, in lesson 6's log equation.
- **Linear equations and Solving equations:** rearranging formulas and the flow diagram.

**Not taught again:** the laws of powers, negative and fractional powers, multipliers for percentage
change, shifting and flipping a graph, the inverse function and its mirror, gradient and intercept,
laying a line through readings, the bar count, work as the area under a pV curve, rearranging. Each
is used with a one-line reminder, and only what is new is taught.

**Taught inline, because you have not met them** (notes 5): a power with a letter in it, bˣ; the
growth factor against the growth rate (1.05 against 5%); why the base must be positive and not 1;
e; the time constant; the calculator's eˣ, log and ln keys; why there is no log of zero or of a
negative number; the decibel; the words isothermal and polytropic.

**Edges.** Real numbers only. Bases 10, e and 2 mostly. Two straight-line forms. No hyperbolic
functions, no series for e, no derivatives beyond two one-screen previews.

## 2. The lessons, in the order they build
The order follows the research's core (notes 8) and the benchmarks' shared run: growth, then decay,
then e and its uses, then the log, its laws, solving, and log graphs (Brilliant, Khan, Bitesize,
HELM, Bird, notes 1, 2).

| # | Lesson | What it teaches |
|---|---|---|
| 1 | Growth by multiplying | Adding the same each step against multiplying by the same each step (Confrey and Smith, Ellis and others, notes 4.1; Khan starts with "Exponential vs. linear growth", notes 2.1). Each equal step in the input multiplies the output by the same factor. The factor is not the rate: 5% a step is × 1.05 (Mathwords, SECONDARY, notes 6.3). A start value and a factor give A × bˣ, with a letter in the power. Doubling time, and the rule of 72 as a check (PMC, notes 6.3). Compound change over years, which Percentages left here, and depreciation (Brilliant level 6, notes 1.1). A factor below 1 is decay: halving, b⁻ˣ = (1/b)ˣ from Powers and roots, and it never reaches zero (Brilliant level 3, notes 1.1). The graph of bˣ passes through (0, 1) and (1, b) (SECONDARY, notes 4.2), and fills in between the steps with fractional powers. Growth is not always fast early on; unbounded is not what makes it exponential (PMC, notes 6.3). The base must be positive (HELM, notes 5). |
| 2 | The number e | Pay 100% growth in a year in n parts: (1 + 1/n)ⁿ goes 2, 2.25, 2.44, 2.61, 2.71… and settles on e = 2.718… (OpenStax, HELM, notes 4.3). More parts help less and less. e is a number like π, and irrational (HELM, SECONDARY, notes 4.3). The eˣ key. Growth that never stops to take a step is eᵏᵗ, where k is the growth rate and eᵏ the factor per unit of time; k and b are not the same thing (Mathwords, SECONDARY, notes 6.3). A minus in the power is decay, e⁻ᵏᵗ. A continuous model of whole things is read in context (OpenStax, notes 6.5). Last screen, a preview: the slope of eˣ equals its height (Colorado, OCR, notes 4.13), so it grows in proportion to what is there (OpenStax, notes 4.3). |
| 3 | The time constant: capacitors and cooling | A capacitor discharging: v = V e^(−t/RC). After one time constant RC it is at 0.368 of the start (OpenStax via Lumen, notes 4.4). RC "has dimensions of time", ohms times farads is seconds (IIT Delhi, notes 4.4). Charging: v = V(1 − e^(−t/RC)), the discharge curve flipped and lifted, as in Functions lessons 5 and 6 (notes 4.2, 4.4). Each time constant closes 0.632 "of the remainder" (OpenStax, notes 4.4). The tutorial's worked example: 5 V, RC = 47 s, t = 100 s gives 4.4 V (SECONDARY, notes 4.4). 63%, 98% at 4T and 99.3% at 5T, with 5T as the usual line for "full", a convention (notes 4.4). Why it matters: a PFC capacitor bank must fall below 75 V within 3 minutes (IEC 60831 via a trade page, SECONDARY, notes 7.2). Newton's law of cooling: the gap to the room shrinks the same way, T = T_room + (T₀ − T_room)e^(−t/τ) (Waterloo, Wikipedia SECONDARY, notes 4.5), with its limit stated. Megger's charging current that "quickly falls to zero" is the same picture, with no maths of the PI test (notes 7.3). |
| 4 | Logarithms: the power you need | "What power of 2 makes 8?" is 3, and that number is log₂ 8 (Maths is Fun, SECONDARY; Brilliant wiki, notes 4.6). log 1000 = 3, log 45 = 1.653 on the log key (Bitesize, notes 2.2). The same fact in two forms, 10³ = 1000 and log 1000 = 3, moved both ways (SQA HN Outcome 2, notes 3.1). A log is a number: log 1000 + log 1000 is 3 + 3 (Kenney and Kastberg, Chua and Wood, notes 6.2). Between the marks: log 2 = 0.301, so 2 sits 0.301 of the way to 10. ln is log to base e, on the ln key (Bitesize, notes 2.2, 4.9). ln and log give different numbers (Kenney and Kastberg, notes 6.2). No log of zero or a negative number, and the base must be positive and not 1 (Bitesize, Khan, notes 2.2, 5). The log graph is the exponential's mirror in y = x (SQA Higher spec, notes 2.3; Functions lesson 8), and ln undoes eˣ (HELM, SECONDARY, notes 4.8). |
| 5 | The log laws and decibels | Slide one ruler along another and lengths add while numbers multiply: log(ab) = log a + log b (Khan, HELM, notes 4.6, 4.7; the card activity, notes 6.6; the slide rule, SECONDARY, notes 2.3). Each law beside the power law it comes from: aᵐ × aⁿ = aᵐ⁺ⁿ, the quotient law, and log(aⁿ) = n log a (HELM table, SECONDARY, notes 4.7; Brilliant, notes 1.2). log 1 = 0 and the log of the base is 1, as HELM's ln(1) = 0 and ln(e) = 1 (notes 4.7). The laws need one base throughout (Khan, notes 4.6). log(a + b) has no law, checked on the calculator (Chua and Wood, Kenney and Kastberg, notes 6.2). Change of base, log₂ 5 = log 5 ÷ log 2, which is not log(5 ÷ 2) (Pearson examiners, notes 6.5). The decibel: 10 log of a power ratio (ITU, Britannica, notes 4.10). Twice the power is 3 dB, ten times is 10 dB (Britannica; UNSW copy, SECONDARY, notes 4.10). Voltage and pressure ratios use 20 log (Britannica, notes 4.10). Gains that multiply become decibels that add, from the product law. Engine-room readings in dB(A) (IMO, notes 7.1). |
| 6 | Solving exponential equations | Get the power alone first, then take logs of both sides, the same base on each (OCR examiners, notes 6.5; HELM, notes 4.8). The power law brings the unknown down. 2ˣ = 20 by log; e^(−t/RC) by ln (HELM, notes 4.8). The time for a capacitor to fall to a target, such as 75 V from an example start voltage (notes 7.2). Doubling time exactly, checked against the rule of 72 (notes 6.3). Bird's cooling steel bar, 35 = 17 + 1250 e^(−0.17t): take 17 away first (SECONDARY, notes 7.4). Bird's indicial equation for a volume, V₂^1.25 = 0.02304, by log₁₀ (SECONDARY, notes 7.4). An unknown inside a log: change to the power form (SQA 2023 report, notes 6.5). log x + log(x − 3) = 1 becomes a quadratic, and a root that needs the log of a negative number is thrown out (Bird, SECONDARY, notes 6.5). Check the answer in its context (OCR, notes 6.5). Dropped on review (18 Oct): Bird's indicial equation V₂^1.25 = 0.02304 is on no screen, as the lesson already has fourteen; the power law with log₁₀ is taught on 2ˣ = 20 and 1.05ˣ = 2, and pVⁿ = C comes in lesson 7. |
| 7 | Log graphs: curved laws as straight lines | Readings that fit y = abˣ lie on a straight line when you plot log y against x: gradient log b, intercept log a (HELM, SECONDARY, OCR spec, notes 4.11). Readings that fit y = axⁿ lie on a line when you plot log y against log x, gradient n (HELM, OCR spec, notes 4.11). The intercept is log a, so convert it back (OCR examiners, notes 6.5). pVⁿ = C becomes log p = log C − n log V, so n is minus the gradient: the MCA's "Solves graphically problems of the form pV n = C, where n is unknown" (notes 3.3, 4.11). A capacitor's readings: log(V₀ − V) against t is straight, with slope −1/RC (IIT Delhi, notes 4.4). Read a log axis, where each major mark is 10 times the last and the minor marks are not evenly spaced (PMC, Heckler and others, notes 6.4). Real readings scatter, and a model need not hit every reading exactly (Pearson examiners, notes 6.5). |
| 8 | Isothermal work: when n = 1 | pVⁿ = C with n = 1 is pV = C, the isothermal case for an ideal gas (Purdue, SFU, notes 4.12). Calculus fundamentals' formula divides by zero here, because the reverse rule fails for V⁻¹ (notes 4.12, 5). Count the bars under p = C/V from V₁ to V₂ (Calculus fundamentals lesson 8). Doubling the volume from anywhere adds the same area, so the area depends only on V₂ ÷ V₁. That area is C ln(V₂/V₁), so W = p₁V₁ ln(V₂/V₁), which is nRT ln(V₂/V₁) (Edinburgh, notes 4.12). Use the ln key, not log (Kenney and Kastberg, notes 6.2). Compression gives negative work. Isothermal compression takes the least work of the curves shown (lecture note, SECONDARY, notes 4.12). The MCA asks for the work "during isothermal, adiabatic and polytropic non-flow processes" (Applied Heat 4.2.7, notes 3.3). Last screen, a preview: run the area rule backwards and the slope of ln x is 1/x, the MCA's "derivatives for ... lnx", for Derivatives (notes 3.3). |

## 3. Can it be taught mostly visually, through interaction?
**Partly** (RUNBOOK section 0, item 3). Every lesson is a steps lesson of about 12 screens, SHOW
then DO, ending on two or three mixed puzzles. SHOW screens can carry a short paragraph where the
idea needs words. Ganesan and Dindyal ask for logs in "two different representations namely
symbolic and graphical" (notes 5), and every picture below shows the symbols beside the thing they
stand for. Each lesson has one main picture you move with your finger, chosen because it shows the
cause, not just the answer:
- **Lesson 1, add or multiply.** Two columns of bars on the same equal steps. The left column adds
  an amount each step; the right column multiplies by a factor. Sliders set the amount and the
  factor, and a step button moves on. Each bar's label shows the sum that made it (× 1.5, × 1.5, …),
  and the bars drop dots onto a graph below. Before the run, you guess step 10. A switch fills in
  the curve between the steps. Set the factor to 0.5 and the right column halves each step, towards
  the axis but never onto it. *Why:* the cause is the same factor on every equal step. Confrey and
  Smith's "splitting" and Ellis and others' tables of a ratio per step are the research's route
  (notes 4.1), and Weber found students could compute powers but few could "reason about the process"
  (notes 6.1), so the process is on screen. The guess first is for the growth bias (notes 6.3).
  Racing the two columns answers "growth is either linear or exponential": with a small factor the
  columns stay close for a while (PMC, notes 6.3).
- **Lesson 2, split the year.** A year's 100% growth paid as one step, then 2, 4, 12, 365. Drag the
  number of parts. The staircase of steps gets finer and hugs a smooth curve, and a readout of
  (1 + 1/n)ⁿ fills a small table and settles at 2.718… *Why:* this is the route OpenStax and HELM
  give, compounding more and more often (notes 4.3). The research says to show it with numbers
  because HELM itself admits the reason "will not be clear" from the definition (notes 4.3). The
  table settling, with no "never", follows Calculus fundamentals' shrinking step. The last screen
  puts lesson 2's curve on the slope tracker from Calculus fundamentals, where slope and height
  read the same (notes 4.13).
- **Lesson 3, the shrinking gap.** A charging curve with the supply voltage as a dashed line at the
  top. Drag the time handle; it snaps to 1τ, 2τ, 3τ. A bar between the curve and the supply line
  shows the gap left, and at each τ it reads 0.368 of the one before. R and C sliders stretch the
  time axis, and the readout gives RC in seconds. A switch shows discharge (the gap is the voltage
  itself) and a third shows a cooling bar (the gap is to the room). *Why:* "0.632 of the remainder ...
  is achieved in every time, τ" (OpenStax, notes 4.4) is the cause, and the gap bar shows it. The
  same gap explains why it is never quite full (notes 4.4) and why 5T is a line someone drew. The
  cooling switch shows Newton's law as a shrinking temperature difference (Waterloo, Wikipedia,
  notes 4.5), so cooling is the discharge curve lifted, not a new idea.
- **Lesson 4, the power ruler.** A ruler with major marks 1, 10, 100, 1000, each labelled "× 10",
  and under it a second scale of powers 0, 1, 2, 3. Drag a pointer. The top reads the number, the
  bottom its log, and the readout writes both forms: 10^2.5 ≈ 316 and log 316 ≈ 2.5. Minor marks 2,
  3, 5 sit at 0.301, 0.477, 0.699. Switches give a ruler of 2s (1, 2, 4, 8) and one of e. Drag the
  pointer left of 1 and the powers go negative; there is no mark for 0 or below. *Why:* a log is
  "the power to which a number (the base) must be raised" (Brilliant wiki, notes 4.6), and the ruler
  makes it a length you can see, which is the "log as a number" the research says learners lack
  (Chua and Wood, notes 6.2). Engineering students read log scales "as linear", 52% in one study,
  minor marks included, and pointing out that "each label is 10 times as large as the previous one"
  was the repair (Heckler and others, PMC, notes 6.4). The empty left end shows why there is no log
  of zero or a negative number (notes 6.2). The last screen folds the exponential graph over y = x
  into the log graph (SQA Higher spec, notes 2.3; Functions lesson 8).
- **Lesson 5, the slide rule.** Two power rulers, the top one sliding. Put its 1 over 2 on the bottom
  ruler, find 3 on the top, and read 6 below it. The lengths add, so the numbers multiply. A readout
  writes log 2 + log 3 = log 6 beside 10^0.301 × 10^0.477 = 10^0.778. Slide backwards for division.
  Then the bottom ruler is relabelled in decibels, 10 dB a decade, and two amplifier stages slide
  their gains together. *Why:* this is the card activity the research reports, "multiply the two
  numbers on the top" and add "the values on the bottom" (Sevgi and Kabalcı, notes 6.6), and the
  slide rule that logs made possible (SECONDARY, notes 2.3). Kenney and Kastberg: logs are useful
  "where adding two numbers might be far easier and more accurate than multiplying them" (notes 6.6).
  The picture earns the product law before it is stated, so it never becomes "times means add"
  (Chua and Wood, notes 6.2). Sliding 2 then 3 lands on 6, never on 5, which answers log(a + b).
- **Lesson 6, read the time back.** A discharge curve with a level line you drag to a target
  voltage. Beside it, the formula as a machine: t, then ÷ (−RC), then eˣ, then × V. Under it the
  undoing machine runs the other way: ÷ V, then ln, then × (−RC). The level line marks where the
  curve crosses, so the machine's answer can be checked by eye. A second card is Bird's cooling bar,
  where the machine has "+ 17" on the end, so the undo starts with "− 17". *Why:* "The natural
  logarithmic functions 'undoes' the exponential function" (HELM, notes 4.8), and you built undoing
  machines in Functions lesson 8. The machine makes the order visible, so taking logs before
  getting the power alone, OCR's first named mistake, shows up as undoing the wrong step first
  (notes 6.5). The level line is a check, not the method; OCR's examiners discourage trial and
  improvement "where an efficient analytical technique such as logarithms is available" (notes 6.5).
- **Lesson 7, straighten the curve.** A set of readings plotted on ordinary axes, curving. Two
  switches: log the y-axis, log the x-axis. The points slide to their new places as each axis
  changes. With the right switches on, the points fall on a line, and the switch pattern tells you
  the law (y only: abˣ; both: axⁿ). Then lay a line with two handles, as in Straight-line graphs
  lesson 6, and read its gradient and intercept. The intercept label reads "log a" with a "convert
  back" step under it. Cards: the pVⁿ readings, the capacitor's log(V₀ − V), and an inverse-square
  set. *Why:* "If the exponential function is appropriate, the resulting data points should lie on
  or near a straight line" (HELM, notes 4.11), and the MCA wants pVⁿ = C solved "graphically"
  (notes 3.3). The switches show the cause: logs turn powers into gradients. The convert-back label
  is for OCR's "forgetting to convert log values back into a normal number" and "A = 1.9 rather
  than ... ln A = 1.9" (notes 6.5). The axis labels follow lesson 4's ruler, for the log-scale
  reading error (notes 6.4).
- **Lesson 8, equal ratios, equal areas.** The curve p = C/V with bars under it from V₁ to V₂, the
  bar count from Calculus fundamentals. Drag V₁ and V₂. A "double it" button jumps V₂ to 2V₁, and
  the area reads the same wherever you start. A readout shows the area beside C ln(V₂/V₁). A switch
  runs it as a compression, with the area counted as minus. A second switch lays a polytropic curve,
  n = 1.3 (an example value), over it from the same start. *Why:* the research asks to "show the step
  from p = C/V with a bar count first" (notes 4.12). Equal areas for equal ratios is the cause of the
  log, and it is computed by the page from the shown rule. The overlay shows the whole family on one
  page, as the Purdue note does (notes 4.12), and that the isothermal curve takes the least
  compression work of the two shown (SECONDARY, notes 4.12).

## 4. What else
- **Benchmark (notes 1 and 2).** The shelf's benchmark is two Brilliant courses (notes 1).
  - **Brilliant Exponential Functions** (42 lessons, 10 levels; its listing title is "Exponentials
    and Logarithms"). It runs growth, functions, decay, comparisons with linear and quadratic growth,
    general bases, compound interest, applications, shifted exponentials ("Decaying to a Value",
    "Rising to a Value") and exponentials between the integers (notes 1.1). Lesson 1 here covers
    its levels 1 to 6 and 10, and lesson 3 its level 8. The guessed address for a course named
    "Exponentials and Logarithms" returns the Courses list (notes 1.1, 1.3).
  - **Brilliant Logarithms** (29 lessons, 5 levels). It runs the logarithm, its graph, the identities
    with proofs, changing bases, then solving and checking solutions (notes 1.2). Lessons 4 to 6 here
    follow that order.
  - **Khan** splits the ground: Algebra 1 starts with linear against exponential growth; Algebra 2
    builds models, defines logs, gives the properties, the change of base, then solves with base 10
    and e first (notes 2.1).
  - **Bitesize Higher** runs what a log is, the laws, the calculator keys, solving, natural logs and
    graphs (notes 2.2). **SQA Higher** adds confirming y = axᵇ and y = abˣ with a straight-line graph
    (notes 2.3).
  - **HELM 6** (73 pages) is the engineering order: the exponential function, logs, the log function,
    modelling and log-linear graphs (notes 2.4). **Bird** puts logs and exponentials in algebra and
    "Reduction of non-linear laws to linear form" in graphs, after straight lines (notes 2.5).

  What they lack that you need: Brilliant has no e, no time constant, no natural log, no log graphs
  or decibels and no uses, and it avoids the calculator (notes 1.1, 1.2). Khan and Bitesize have no
  engineering. Lessons 3, 7 and 8 and the decibels come from HELM, Bird, the MCA and the physics
  sources.
- **His aim (notes 3).**
  - **SQA HN Engineering Mathematics 1 (H7K0 33, SCQF 6), Outcome 2 (8 hours):** "Evaluation of
    logarithmic and exponential expressions", "Transposition from logarithmic to exponential form
    and vice versa", "Laws of logarithms", "Graphics of logarithmic and exponential functions", and
    expressions from engineering with an "Ae^kt" term (the formula came back garbled, UNCONFIRMED,
    notes 3.1).
  - **Pearson BTEC HN Unit 4002:** "P3 Determine solutions of engineering equations using exponential,
    logarithmic, trigonometric, and hyperbolic functions" (2024 descriptor, notes 3.2). The 2024
    essential content was not seen (UNCONFIRMED). Which awarding body your college uses is
    UNCONFIRMED.
  - **MCA Second Engineer Mathematics 3.1:** logs are "not directly examinable but such knowledge
    will be assumed": define them, state the laws, the base of natural logarithms, natural log
    expressions (notes 3.3). **4.1.11:** pVⁿ = C graphically with n unknown. **8.1.12:** the area
    under pVⁿ = C. **Applied Heat 4.2.7:** the work in isothermal, adiabatic and polytropic processes
    (notes 3.3).
  - No MCA or HN line for the RC time constant or Newton's law of cooling was found (UNCONFIRMED,
    notes 3.3, 7.5). Lesson 3 is taught as an application, and says so.
- **Where it is used (each cited before a lesson uses it).**
  - **Growth and decay (1):** SQA H7K0 33, "Evaluation of logarithmic and exponential expressions"
    (notes 3.1). HELM 6.1, "understand the terms exponential growth and exponential decay" (notes
    4.2). Compound interest and depreciation, Brilliant level 6 (notes 1.1). Pearson's merit
    criterion on "exponential growth and decay models" (notes 3.2).
  - **e (2):** MCA 3.1, "States base of natural logarithms" (notes 3.3). SQA's "Ae^kt" line (garbled,
    notes 3.1). e in the capacitor formula, "the base of the natural logarithm" (OpenStax via Lumen,
    notes 4.4).
  - **The time constant (3):** the charging formula and 0.368 (OpenStax via Lumen, SECONDARY host,
    notes 4.4), RC as "the time constant of the circuit" (IIT Delhi, notes 4.4), the 63% and 5T
    figures (trade tutorial, SECONDARY, notes 4.4). A PFC bank discharging below 75 V within 3
    minutes (IEC 60831 as reported by a trade page, SECONDARY, notes 7.2); whether such banks are
    fitted aboard ship is UNCONFIRMED, so the screen makes no ship claim. Why discharge matters:
    "0.25 J ... can provide a heavy shock, and 10 J can be fatal" (Northumbria, notes 7.2). Megger's
    charging current (notes 7.3). Cooling: Waterloo's statement of the law (notes 4.5), Bird's steel
    bar (SECONDARY, notes 7.4), Brilliant's "cooling coffee" (notes 1.1).
  - **Logs (4):** MCA 3.1, "Defines logarithms" and "Evaluates expressions involving natural
    logarithms" (notes 3.3). SQA's transposition between the two forms (notes 3.1). The log and ln
    keys (Bitesize, notes 2.2).
  - **The laws and decibels (5):** MCA 3.1, "States laws of logarithms" and "Uses laws of logarithms
    to evaluate powers etc." (notes 3.3). SQA, "Introduce the three laws of logarithms" (notes 3.1).
    Sound readings "in decibels using an A-weighting (dB(A))", and the engine-room example of
    108.7 dB(A) (IMO MSC.337(91), notes 7.1). The 85 dB(A) engine-room limit (trade news, SECONDARY,
    notes 7.1).
  - **Solving (6):** SQA, "Transpose and evaluate expressions from Engineering which include the
    term" Ae^kt (notes 3.1). Pearson P3 (notes 3.2). The 75 V discharge (notes 7.2). Bird's cooling
    bar and volume equation (SECONDARY, notes 7.4).
  - **Log graphs (7):** MCA 4.1.11 (notes 3.3). SQA Higher, "Use a straight-line graph to confirm
    relationships" (SECONDARY host, notes 2.3). OCR 1.06h, "estimate parameters" in y = axⁿ and
    y = kbˣ (notes 4.11). The capacitor's straight-line check (IIT Delhi, notes 4.4). HELM's sound
    intensity that fits "exponential decaying with time" (SECONDARY, notes 7.5).
  - **Isothermal work (8):** MCA 8.1.12, "Derives expressions for the area under the curve, given by
    pV n = C" (notes 3.3). Applied Heat 4.2 and 4.2.7, isothermal operation and its work (notes 3.3).
    Applied Heat 6.1, "work input" to a reciprocating air compressor (notes 7.4). The isothermal
    compressor line (lecture note, SECONDARY, notes 4.12).
- **The mistakes to catch, each with a puzzle and its own hint.**
  - **Lesson 1, linearising:** "the pervasive tendency to linearize exponential functions" (Stango
    and Zinman, notes 6.3), and growth "grossly underestimated" (Wagenaar and Sagaria, notes 6.3). A
    guess-first puzzle on step 10.
  - **Lesson 1, the three popular misconceptions:** growth "either linear or exponential", unbounded
    as the definition, and "always very fast" (PMC, notes 6.3). A DO screen asks which of x², 2ˣ and
    10x is exponential, and another shows 9% a day for a week. The PMC paper's advice: linear and
    quadratic functions "grow beyond any bound" too (notes 6.3).
  - **Lessons 1 and 2, rate against factor:** "Confusing the growth rate k with the growth factor b"
    (Mathwords, SECONDARY, notes 6.3). Lesson 1 asks for the factor for 5%; lesson 2 for the factor
    per year of e^(0.05t).
  - **Lesson 1, exponentiation as a process:** few students "could reason about the process of
    exponentiation" (Weber, notes 6.1). A DO screen asks what one more step does to the output,
    with no formula on screen.
  - **Lesson 3, negative powers:** "mishandling negative exponents" (OCR examiners, notes 6.5), and
    the sign of k "sometimes" wrong (Pearson examiners, notes 6.5). A puzzle offers e^(+t/RC) for a
    discharge, which grows.
  - **Lesson 3, the curve as a straight line:** "the charging curve ... is exponential and not
    linear" (trade tutorial, SECONDARY, notes 4.4). A DO screen asks whether two time constants
    give twice 63%.
  - **Lesson 4, the log as a number:** students "fail to see the logarithm as a number" and "cancel
    the word 'log'" (Chua and Wood, notes 6.2). 16 of 59 said two log expressions were equal because
    log "could be 'cancelled out'" (Kenney and Kastberg, notes 6.2). Kenney and Kastberg's own
    exercise, log₂x + log₂x + log₂x against x + x + x, tried at x = 2, is a DO screen (notes 6.2).
  - **Lesson 4, the log of a negative number:** given log₄(−16), students guessed for "a negative
    number or a fraction" (Kenney and Kastberg, notes 6.2). The ruler has no mark there.
  - **Lesson 4, ln and log:** 35 of 59 said ln(x) equals log(x) (Kenney and Kastberg, notes 6.2).
    Lesson 8 asks it again on the ln key.
  - **Lessons 4 and 6, between the two forms:** some candidates "were unable to convert from
    logarithmic form into exponential form" (SQA 2023 Higher report, notes 6.5).
  - **Lessons 4, 5 and 7, the log scale read as linear:** students "interpreted the log scale as
    linear" (Heckler and others), and 52% misread it in one study, minor marks especially (PMC,
    notes 6.4). One puzzle per lesson asks where 2 or 5 sits between 1 and 10. Brief practice set
    several times worked and lasted a month (Heckler and others, notes 6.4), which spaced review does.
  - **Lesson 5, splitting a sum:** log(M + N) = log M + log N "can appear reasonable" from the
    distributive law (Kenney and Kastberg), the "linear extrapolation error" (Chua and Wood, citing
    Matz) (notes 6.2). Checked on the calculator, Chua and Wood's repair (notes 6.2).
  - **Lesson 5, divide and subtract mixed up:** "because divide means minus" (Ganesan and Dindyal)
    and "you can always change subtraction to division when doing logarithms" (Chua and Wood)
    (notes 6.2). OCR's examiners regularly see "misuse of laws" (notes 6.5).
  - **Lesson 5, change of base:** log 5 ÷ log 4 changed to log(5/4) (Pearson examiners, notes 6.5),
    and cancelling "lg" top and bottom (Chua and Wood, notes 6.2).
  - **Lesson 5, 10 or 20:** a voltage ratio uses 20 log, a power ratio 10 log (Britannica, notes
    4.10). Taught as a check, not a counted mistake: no source counts it.
  - **Lesson 6, logs before rearranging:** "Log y = Log ( a + x b )" instead of rearranging first
    (OCR examiners, notes 6.5). Bird's cooling bar is the puzzle.
  - **Lesson 6, both sides:** "not doing the same to both sides ..., using different bases on each
    side, or only taking logarithms on one side" (OCR examiners, notes 6.5).
  - **Lesson 6, the answer in context:** N = 17.19 when only 17 experiments fit (OCR examiners,
    notes 6.5). A discharge puzzle asks for whole minutes. A root that needs the log of a negative
    number is not a solution (Bird, SECONDARY, notes 6.5).
  - **Lesson 7, converting back:** "forgetting to convert log values back into a normal number"
    and "A = 1.9 rather than ... ln A = 1.9" (OCR examiners, notes 6.5).
  - **Lesson 7, the linear form:** equations with "Q = …" or "n log aP" (OCR examiners, notes 6.5).
    A DO screen offers log p = n log CV.
  - **Lesson 7, exact fit:** some candidates thought "a model was only acceptable if it gave the exact
    real value" (Pearson examiners, notes 6.5). Scattered readings, one fitted line.
  - **Not stated as common:** no source counts these, so they are taught as checks (put the answer
    back in, look at the picture), not as cited mistakes.
    - Rounding a log too early. The notes' heading for OCR's feedback names it, but the quoted words do not.
    - Using (p₁V₁ − p₂V₂) ÷ (n − 1) at n = 1.
    - Counting compression work as positive.
    - Reading a time constant as the time to fill.
- **Size and cost.** 8 lessons of about 12 screens on the agreed settings.
  - The last six measured courses ran about 0.99M to 1.14M tokens a lesson
    (docs/plans/foundational-maths-roadmap.md). The pictures here are live graphs, rulers and a bar
    count, closer to Calculus fundamentals than to tiles, so I estimate about 1.1M to 1.25M a lesson.
  - That is about 8.8M to 10M for the course, plus about 0.3M for the plan and research. The
    research can start from the 67 saved tool results.
  - The full process measured on Fractions lessons 4 to 8 was about 1.65M a lesson, about 13.2M for
    eight.
  - Each build's real cost is reported to you.
- **Lesson 1 first.** Lesson 1 is built and checked before the others (about 1.15M, plus the plan and
  research). Because you asked for the folder in one push, the rest follow without waiting for you
  to try it.
- **Gaps to close at build time.** None blocks the build.
  - Brilliant's lesson pictures were not seen, only its lesson titles (notes 1.1).
  - Which awarding body your college uses, and Pearson's 2024 essential content, are UNCONFIRMED
    (notes 3.2). The exact form of SQA's "Ae^kt" line is UNCONFIRMED (notes 3.1).
  - **Lesson 2:** the limit (1 + 1/n)ⁿ came back garbled in the tool text, so it is not quoted (notes
    4.3). The research stage must cite it cleanly (OpenStax 6.8 or HELM 6.1) before the lesson
    writes it. The values in the table are computed by the page from the rule it shows.
  - **Lesson 3:** the discharge formula v = V e^(−t/RC) is quoted only at t = RC (notes 4.4), and
    Newton's law in the form T = T_room + (T₀ − T_room)e^(−t/τ) is the notes' own reading (notes 4.5).
    The research stage must cite both forms (OpenStax 21.6 and a cooling source) before the lesson
    states them. The Bird cooling bar's time unit is not in the quote, so the puzzle takes it from
    the book or uses labelled units.
  - **Lesson 5:** that decibels add along a chain is computed from the product law, which the screen
    shows. No marine source for amplifier chains is in the notes, so the stages are example figures.
  - **Lesson 8:** ∫ dV/V = ln(V₂/V₁) and the slope of ln x being 1/x are not quoted in the notes.
    The research stage must cite them (HELM or OpenStax Calculus) before the lesson states them.
    W = p₁V₁ ln(V₂/V₁) is computed from the Edinburgh form, nRT ln(V₂/V₁), with p₁V₁ = nRT from Edinburgh's
    "P = nRT/V" (notes 4.12).
  - Whether your college texts write "log" for ln anywhere is UNCONFIRMED (notes 4.14).
  - Typical values of n for a real compressor or engine are not in the notes. The puzzles use
    labelled example values.
