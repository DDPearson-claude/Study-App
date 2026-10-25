# Differential equations: the course brief

Written 25 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
the sixth course in the Maths shelf's Advanced maths folder, "Equations about change, and how to
solve and read them." The folder runs Calculus fundamentals, Vectors, Matrices, Linear algebra,
Vector calculus, Differential equations and Group theory. You are doing this one before Matrices,
Linear algebra, Vector calculus and Group theory (docs/plans/maths-queue.md), so it leans on none
of them. Their ground is left for them, and each deferral below says where it goes. You chose this
course next on 24 Oct and approved the build, so I have taken the decisions for you and listed them
below. Change any you like. Sources and quotes are in `research-notes.md` beside this file (126
quotes, cut by script from the 53 saved tool results and checked with `tools/eval/sources.mjs`,
`failed: 0`). Section numbers below point there.

## The short version
**Seven lessons**
1. A rule for change (built first)
2. Decay: separate and integrate
3. Steady state plus a dying transient
4. One small step at a time: Euler's method
5. The spring and the circuit: one equation
6. Overdamped, critical and ringing
7. Pushing it: resonance, and reading a model

**The main pictures** (one per lesson, each moved with your finger, each showing the cause):
- **The rule drawn as arrows (lesson 1).** A temperature against time grid for a hot engine part
  in a cooler room. Drag a probe anywhere and a short arrow shows the slope the rule gives there:
  steeper the hotter it is above the room. Your trail of arrows fills in to a slope field. Tap to
  drop a start and its curve flows along the arrows. A room-temperature slider moves the flat line
  that is itself a solution. "Try a curve" lays a candidate on the field and marks in red every
  place its slope disagrees with the rule.
- **Equal times, equal fractions (lesson 2).** A capacitor discharging through a resistor. Drag a
  window of fixed width along the curve. The readout "end ÷ start" never changes wherever you put
  it. Set the window to RC and it reads 0.368. A tangent from the window's start reaches zero
  exactly at its end. Sliders for R and C stretch the whole curve.
- **The steady line and the gap (lesson 3).** A coil switched onto a supply. The steady current
  E ÷ R is a dashed line, and the gap between it and the actual current is shaded. Drag the supply,
  the resistance or the starting current, or flip the switch mid-run. The shaded gap always shrinks
  by the same fraction each time constant. "Split" shows the curve as the steady line plus the
  shrinking gap. The same picture reskins as a motor running up to speed and a tank filling.
- **The stepper (lesson 4).** A slope field with the exact curve drawn faintly. Drag the step size.
  Each step reads the slope at its start, draws it as an arrow, and walks a straight line along it.
  Small steps hug the curve. Big ones cut corners, overshoot, and at last swing either side of the
  steady state.
- **The spring and the circuit side by side (lesson 5).** A mass on a spring with a damper, and a
  series RLC circuit, moving together. One set of sliders carries both names: mass and inductance,
  damping and resistance, stiffness and 1 ÷ capacitance. Pull the mass or charge the capacitor and
  let go. Both traces are the same curve. Three bars show each term of the equation at the moment
  you drag to, and they always add to zero.
- **The roots and the motion (lesson 6).** On the left, the two roots of the characteristic
  equation on Complex numbers' plane. On the right, the response they give. Drag the damping. The
  roots slide towards each other along the real axis, meet, then split up and down into a mirror
  pair, and the response goes from a slow creep, to the fastest return, to ringing. The roots'
  distance left of the axis sets how fast it dies, and their height sets how fast it rings.
- **The driven swing (lesson 7).** The lesson 5 spring or circuit with a push that comes and goes.
  Drag the drive's frequency. The trace shows a start-up wobble dying away, then a steady swing at
  the drive's own frequency. Each setting drops a dot on a swing-size against frequency graph, which
  builds up as you sweep. A damping slider lowers and widens the peak, and an overdamped setting
  has none.

**Decisions taken for you** (say if you want any changed):
- **Seven lessons.** You approved seven. The research gives a seven-lesson core: four on first
  order, two on second order, one on forcing and reading a model (notes 8). For scale, Brilliant's
  old Differential Equations I was 30 lessons and 40 to 50 hours (Class Central, SECONDARY, notes
  1.1), and SQA's HN Engineering Mathematics 4 gives first-order equations 12 of its 40 hours (notes
  3.1). Seven fits because Exponentials and logarithms already taught the curves, and this course
  teaches where they come from.
- **Lesson 1 is built first, without a pause.** You approved the build, so lesson 1 is built and
  checked first, and the others follow without waiting. You can try it on your phone as soon as it
  lands.
- **Steps lessons, partly visual ("Partly", RUNBOOK section 0, item 3).** Every lesson carries
  `format: 'steps'`, about 12 screens, SHOW then DO, ending on two or three mixed puzzles. SHOW
  screens may carry a short paragraph, at most about 90 words, because a model's terms need saying
  in words. Most screens will be shorter. The runbook names calculus as "Partly", and this is
  calculus put to work.
- **Meaning first, methods second.** Engineering students' bigger trouble is the ideas, not the
  working (Maynooth, notes 6.1). The main difficulties are not knowing "what a solution to a DE is"
  and leaning on memorised procedures (SEFI, notes 6.1). For RC and LR circuits, "student
  understanding is improved by initially focusing on conceptual ideas" (Mungan, notes 6.5). So
  every lesson has you predict the curve, play with it, and only then name the method. Every
  solution is drawn as a curve and checked against its rule.
- **Slope fields and steady states go into lesson 1.** A field "can be introduced without any
  knowledge of how to solve" an equation (Lamar, notes 4.2), and the research core folds them into
  lesson 1 (notes 8). Reading before solving then comes back in every lesson's first screens.
- **Euler's method comes after the formulas, as lesson 4.** Khan puts it beside slope fields,
  before separating (notes 2.1). Bird's Higher puts it after the first-order methods (chapter 49,
  notes 2.4). I chose the later spot. "When no formula exists" only means something once you have
  formulas. And Rasmussen found students think "approximate solutions always just follow the exact
  solutions" (notes 6.6). The stepper needs an exact curve from lessons 2 and 3 to show the drift.
- **Separating is taught as a shorthand, and every answer is checked by putting it back.**
  Calculus fundamentals taught dy/dx as one symbol, and one puzzle there asked whether the d's
  cancel. Khan gives "treating differentials algebraically" a lesson of its own (notes 2.1). So
  lesson 2 says plainly that "moving the dt across" is shorthand for integrating both sides over
  time. It shows that once and then uses it. The real check is substituting the answer back, which
  is a skill of its own (Khan, SEFI, notes 4.9, 6.4).
- **Inputs by "steady state plus a dying transient", with the integrating factor on one screen.**
  HELM solves the same cooling equation both ways (notes 4.5). The steady-state route is the one
  that meets your AC circuits course, because a sine input's steady state "yields the same result"
  as the impedance method (HELM, notes 4.5). SQA's EM4 lists the integrating factor (notes 3.1), and
  SQA's examiners say "established routines" help with it (notes 6.3). So lesson 3 shows it once,
  as a routine with its standard form, and checks it gives the same answer.
- **Second order through the characteristic equation, not matrices.** Brilliant reached second
  order through "Matrices and vectors" (Class Central, SECONDARY, notes 1.1), which you do not have
  yet. Khan, HELM, Bird and SQA's EM5 use the characteristic equation and its roots (notes 2.1,
  2.3, 2.4, 3.1). That uses your Quadratics formula and discriminant and your Complex numbers roots.
- **Taught inline, because no course you have holds them.** The shelf's Derivatives course was
  removed on 24 Oct (docs/plans/maths-queue.md), and the derivatives of eˣ, ln x, sin and cos had
  been left for it. This course teaches only the pieces it needs, each on the screen that needs it:
  - **The slope of e^(kt) is k times its height** (lesson 2). Exponentials lesson 2 previewed the
    slope of eˣ equalling its height.
  - **The area rule for 1 ÷ y gives ln y** (lesson 2). Exponentials lesson 8 previewed the slope of
    ln x as 1 ÷ x.
  - **e^(jωt) as Complex numbers' turning arrow** (lesson 6). Complex numbers left the exponential
    form re^(jθ) for this course (its brief). The arrow's slope is the same arrow turned a quarter
    turn and scaled by ω, which is why a coil's voltage peaks a quarter cycle early (Complex numbers
    lesson 7).
  - **A spring's pull and a damper's drag** (lesson 5): the spring pulls back in proportion to the
    stretch, and the damper in proportion to the speed.
  Each is cited at the research stage (see the gaps).
- **Exponentials' facts are not re-taught.** v = V e^(−t/RC), the charging curve, 63%, 98% at 4T,
  99.3% at 5T, RC in seconds and the cooling formula are all its lesson 3. Here they are derived
  from the rule, and each is reminded in one line where it is used.
- **Forcing and resonance are shown, not solved by a method.** The research core keeps lesson 7 to
  an outline and drops undetermined coefficients (notes 8). The page computes the steady swing from
  the rule and you read it. Your AC circuits lesson 7 found the series resonance by setting
  2πfL = 1 ÷ (2πfC). Lesson 7 shows that peak as the steady state of lesson 5's equation.
- **Reading a model runs through every lesson, and lesson 7 gathers it.** MIT's aim is to "model
  ..., solve ... and interpret" (notes 4.9). Each lesson ends with a DO screen that names a term,
  checks units or substitutes an answer back. Lesson 7's mixed puzzles do all three on equations
  from the whole course.
- **Damping that grows with speed only.** That kind gives the dying exponential envelope. Students
  come to believe "any friction" does (notes 6.7). Lesson 6 names dry friction once, as the case
  that does not, and leaves it there.
- **Ship roll as a model with its limit.** Roll with damping and a righting moment is "a
  second-order nonlinear differential equation" (Springer, notes 7). The course uses the straight,
  small-angle version and says so on the screen.
- **Naval and nuclear examples are labelled for what they are.** The naval architecture, submarine
  and reactor pages are American (US Naval Academy, US DOE and NRC) or Canadian and Swedish
  research (notes 7). They show the same equations at work. They are not Royal Navy practice, and
  no Navy syllabus was read (UNCONFIRMED, notes 7). Reactor period gets one screen as a growth
  example and no reactor physics.
- **Colour as before.** Ink for curves, arrows and controls. Amber for key terms. Teal for small
  labels such as units, τ and the roots' values. Red only for a slip, such as a candidate curve that
  breaks the rule. Green only for finished. Euler's drift from the exact curve is hatched ink, not
  red, because it is the method's cost, not a mistake.
- **Example numbers are labelled.** Resistances, capacitances, masses, temperatures and tank sizes
  in the puzzles are example figures, said so on screen, or computed from a rule the screen shows.
  No figure is presented as a real ship's, motor's or plant's.
- **Your intake answers** (`intake.json`): to understand differential equations and how to work
  with them; on the job and in everyday life; hands-on, with the why explained in full.

## 1. The overall topic
A differential equation is a rule for how fast something changes, written in terms of the thing
itself. "The hotter it is above the room, the faster it cools" is one. Its answer is not a number.
It is a whole curve: the temperature at every moment. This course is about reading such rules,
solving the common ones, and stepping through the ones that will not solve. It covers the two
families that run most of engineering. First order: one store of energy, one time constant, a
smooth settle. Second order: two stores, which can overshoot and ring. It ends on what happens when
you keep pushing, and on reading any model you meet: what each term means, its units, and whether
an answer fits.

**It builds on:**
- **Calculus fundamentals:** rates and their units (lesson 1), the derivative as a function (lesson
  3), the power rule (lesson 4), i = C dv/dt, v = L di/dt, "in steady state every d/dt is zero" and
  the second derivative (lesson 5), integration as the reverse with + c found from a starting value
  (lesson 7). The chain rule's one stretch screen (lesson 4).
- **Exponentials and logarithms:** e and e^(kt) (lesson 2), the time constant, the RC curves, 63%
  and 5T, and Newton's cooling as a formula (lesson 3), ln (lesson 4), solving e^(−t/RC) for t
  (lesson 6). The two previews named above.
- **Functions and their graphs:** a curve flipped and lifted, as charging is to discharging.
- **Quadratics and polynomials:** the formula and the discriminant.
- **Complex numbers:** the roots of a quadratic with "no real roots", such as −1 ± j2 (lesson 1),
  the plane (lesson 2), times j as a quarter turn (lesson 3), polar form (lesson 5), and the coil's
  quarter cycle (lesson 7).
- **Trigonometry:** radians, ω in radians a second, the sine wave and the turning phasor.
- **AC circuits:** reactance, impedance and series RLC resonance at 159.15 Hz for 100 mH and 10 µF
  (lesson 7).
- **Vectors:** forces adding along a line (lesson 3). Its brief left "motion that follows from
  forces over time" for this course.
- **Motors** and **Design and verification:** a motor coming up to speed, and a cable warming under
  load, as things you have seen.
- **Solving equations and Linear equations:** rearranging and substituting.

**Not taught again:** rates and units, the power rule, integrating with + c, i = C dv/dt and
v = L di/dt, e and the eˣ key, the RC and cooling curves as formulas, 63% and 5T, ln and solving for
t, the quadratic formula and discriminant, j and complex roots, reactance and the resonant frequency.
Each is reminded in one line where it is used.

**Left for later courses:**
- **Matrices:** systems of equations written as one matrix equation. Two tanks feeding each other,
  a circuit with two loops, and the two-equation submarine dive model (notes 7). Lesson 4 only names
  the dive model.
- **Linear algebra:** eigenvalues and eigenvectors for those systems, the matrix exponential and the
  phase plane, which is where Brilliant put its springs (notes 1.1).
- **Vector calculus:** partial differential equations, where the unknown depends on place as well
  as time, such as heat along a cable or a wave on a line (notes 4.10).
- **Group theory:** none of its ground is used.
- **Not on the shelf:** Laplace transforms. HELM gives them their own workbook, and SQA's EM5,
  Pearson's Unit 39 and Khan's unit 3 teach them (notes 2.3, 3.1, 3.2, 2.1). Say if you want a
  course for them. Also left out: logistic growth, exact and homogeneous equations, undetermined
  coefficients and series solutions (notes 4.10).

**Edges.** One unknown that changes with time. First order, and second order with constant
coefficients. Nonlinear equations only through Euler's method. Forcing in outline. Scientific
calculator only.

## 2. The lessons, in the order they build
The order is the research core (notes 8), which follows the order all four engineering texts agree
on: a rule for change and checking a solution, separating, the first-order equation with an input,
a numerical method, then second order, unforced then forced (Khan, HELM, Bird, SQA, notes 2.1 to
2.4; Coursera, notes 8).

| # | Lesson | What it teaches |
|---|---|---|
| 1 | A rule for change | Start from Calculus fundamentals: i = C dv/dt links a rate to a quantity. A differential equation gives the rate in terms of the quantity itself. Newton's law of cooling in words, "the rate of cooling ... is proportional to the difference" between its temperature and the room's (HELM, notes 4.1), then as dT/dt = −k(T − T_room). The rate is in °C a minute, a rate, not an amount of change (SEFI, SECONDARY, notes 6.4). The unknown "is no longer a number, but a function" (Rasmussen, notes 4.1). Its order is the highest derivative in it (HELM, notes 4.1), so this is first order. The rule as arrows: at every time and temperature it gives a slope, and together the arrows make a slope field, read before any solving (Lamar, notes 4.2). Drop a start and the curve follows the arrows. Each start gives a different curve, and a starting value picks one, as + c did in Calculus fundamentals lesson 7. A steady state is where the rate is zero, T = T_room, and it is a solution too, a flat line, not just a number (Rasmussen, notes 4.2). dy/dt = 2t is flat all along t = 0 but has no flat solution, because its rule depends on time (Rasmussen, notes 6.2). Its solutions are the parabolas t² + c (SEFI, notes 6.1). To check a solution, put it in and see both sides agree everywhere (Khan "Verify solutions", notes 2.1, 4.9), here by the slope readout and by the power rule. |
| 2 | Decay: separate and integrate | A rate in proportion to what is there: dy/dt = −y ÷ τ. Cooling's gap to the room. A capacitor discharging through a resistor, dv/dt = −v ÷ RC, built from i = C dv/dt and Ohm's law. A coil's current dying. Radioactive decay, dN/dt = −λN (Britannica, notes 7). Equal times take equal fractions, which is the picture. Separate: all the y on one side and all the t on the other, then integrate (HELM, notes 4.3). The area rule for 1 ÷ y gives ln y (inline), so ln y = −t ÷ τ + c, and y = A e^(−t/τ). The start value fixes A (Calculus fundamentals lesson 7; Edexcel 2024, notes 6.3). Moving dt across is shorthand (Khan, notes 2.1). The slope of e^(kt) is k times its height (inline), so substitute the answer back and both sides agree. The time constant: after each τ the amount is 0.368 of what it was (Lumen, notes 4.4). Read another way, it is the time to reach zero if it kept its starting rate (Mahajan, notes 4.4). τ = RC is in seconds (MSU, notes 4.9), and a coil's is L ÷ R (HELM, notes 4.3). A plus sign gives growth: reactor period is "the time required for reactor power to change by a factor of e" (DOE, notes 7), the "inverse rate of exponential growth" (NRC, notes 7). Not every equation separates (HELM, notes 4.3). |
| 3 | Steady state plus a dying transient | An input. A coil switched onto a supply: L di/dt + Ri = E, which HELM solves for i = E/R (1 − e^(−t/τ)) with τ = L ÷ R (notes 4.3). The steady state comes from setting the rate to zero: i = E ÷ R (Calculus fundamentals lesson 5). The gap to it obeys lesson 2's decay. So the answer is a steady state plus a transient that dies, the transient set by the start and the steady state by the input (LibreTexts, notes 4.5). 24 V, 10 Ω and 0.5 H give τ = 0.05 s and 2.4 A, and 1.52 A after one τ (example figures, computed). Each τ closes 0.632 of what is left (OpenStax, Lumen, notes 4.4): 63% after one, "more than 99 %" by five (Fitzpatrick, notes 4.4), and never quite there (OpenStax, notes 4.4). Why τ is not the time to charge fully (UNC, notes 6.5). These are Exponentials lesson 3's rules, now with their cause. One store of energy, one time constant: "Electrical, mechanical, thermal, and fluid systems" (Engineering LibreTexts, notes 4.4). A capacitor charging. A motor running up to speed with its mechanical time constant (maxon, notes 4.10), whose speed is "analogous to voltage" (TI, notes 4.10). A cable warming to its running temperature (ONR-funded naval study, notes 7). A tank filling, and a mixing tank (MIT, notes 4.10). A ship answering its rudder, with a gain K and a time constant T (NRC Canada, notes 7). The integrating factor on one screen: standard form, with the derivative's coefficient 1 (HELM, notes 4.5), multiply through, and the left side becomes one derivative. It gives the same answer (SQA EM4, notes 3.1). A sine input: its steady state is what AC circuits found by impedance (HELM, notes 4.5), plus a transient at switch-on. |
| 4 | One small step at a time: Euler's method | "Sometimes there is no analytical solution" (Chasnov, notes 4.6). Stand at the start, read the slope from the rule, walk a straight step h along it, and read again. On lesson 2's discharge with τ = 1 s, from 1: h = 0.1 s gives 0.349 at 1 s against the exact 0.368, h = 0.5 s gives 0.25, and h = 1.5 s flips sign every step (example figures, computed). Halving the step about halves the error at a fixed time (computed). "Larger values of h result in poorer approximations (including bad oscillations" (Swarthmore, notes 4.6). The stepped path drifts from the exact one, it does not just follow it (Rasmussen, notes 6.6). Then an equation with no tidy formula: a tank with a steady inflow, draining through a hole whose flow grows with the square root of the depth (Waterloo, notes 4.10; the rule cited at research). Step it to find when it settles. Bird's Higher gives numerical methods a chapter (notes 2.4). A US Naval Academy paper steps a submarine's dive the same way (notes 7). |
| 5 | The spring and the circuit: one equation | A mass on a spring with a damper. The forces add along one line (Vectors lesson 3): mass × acceleration = −(stiffness × stretch) − (damping × speed), so m x″ + c x′ + k x = 0. Second order, because of x″ (HELM, notes 4.1). A series RLC circuit: the voltages round the loop add up, so L q″ + R q′ + q ÷ C = 0, from v = L di/dt and i = dq/dt. Term for term, "the mass behaves the same as an inductor, and the spring the same as an inverse capacitance" (Illinois, notes 4.7), "an exact analogy" (Ohio State, notes 4.7). Read each term: inertia, loss and store. Every term has the same unit, newtons or volts. It needs two starting values, where it starts and how fast. Guess e^(rt): each derivative brings out an r, and e^(rt) is never zero, so m r² + c r + k = 0, the characteristic or "auxiliary" equation (SQA EM5, notes 3.1; HELM, notes 4.7). Quadratics' formula solves it. m = 1, c = 5 and k = 4 give r = −1 and −4, so x = A e^(−t) + B e^(−4t), two decays added (example figures, computed), checked by substituting. With no damping it would "continue for ever" (HELM, notes 4.7). The position-time graph is not a picture of the spring's path (Rasmussen, notes 6.2). Ship roll moves to lesson 6 (review, 25 Oct). |
| 6 | Overdamped, critical and ringing | The discriminant decides (Quadratics). Two real roots: overdamped, "an exponential decay back to equilibrium" (USNA, notes 4.7). Two equal roots: critically damped, (A + Bt)e^(rt) (HELM, notes 4.7), back "in the shortest amount of time with one or no oscillations" (USNA, notes 4.7). Complex roots α ± jβ (Complex numbers lesson 1): underdamped, "a decaying oscillation" (USNA, notes 4.7). Inline: e^(jβt) is the arrow of length 1 turning at β radians a second, so e^((α + jβ)t) is an arrow that shrinks as it turns. Its shadow is a cosine inside a dying envelope (HELM's complex-roots case, notes 4.7), the "exponentially decaying cosine" of a ship's roll decay (ASME, notes 7). α sets how fast it dies and β how fast it rings. The damping factor is above 1, below 1 or equal to 1 (USNA, notes 4.7). With m = 1 and k = 4, damping 5, 4, 2 and 0 give roots −1 and −4, −2 twice, −1 ± j1.732, and ±j2 (example figures, computed). AC circuits' 100 mH and 10 µF ring at 1000 rad/s, which is 159.15 Hz, that course's resonant frequency. 200 Ω makes the circuit critical, and 40 Ω rings at about 980 rad/s inside an e^(−200t) envelope (computed). Ship roll at small angles is lesson 5's equation, so name it here with its limit: the straight version holds only at small angles (Springer, notes 7). Roll damping "increases with forward speed" (USNA, notes 7). Only damping that grows with speed gives the dying exponential envelope (notes 6.7). |
| 7 | Pushing it: resonance, and reading a model | Add a push that comes and goes, m x″ + c x′ + k x = F cos ωt, or put an AC supply on the RLC circuit. The answer has lesson 3's shape: "a transient oscillation" until damping removes it, then a steady swing at "the same frequency as the excitation force" (USNA, notes 4.8; LibreTexts, notes 4.5). Sweep the drive. The swing is largest when the drive's frequency "is equal to the natural frequency" (USNA EN200, notes 4.8). "The resonance effect occurs only in the underdamped systems" (LibreTexts, notes 4.8), and more damping gives "a smaller maximum resonant peak" (USNA, notes 7). That peak is AC circuits lesson 7's series resonance. A ship's roll is lightly damped, so a wave frequency near its roll frequency can "cause capsize" (USNA, notes 4.8): "synchronous rolling" (ClassNK, notes 4.8). Shown in outline, not solved by a method (notes 8). Reading a model, gathered: name each term, check every term has the same unit (ohms times farads is seconds, MSU, notes 4.9), substitute the answer back (Khan, notes 4.9), and check its start and end values. Mixed puzzles over the whole course. |

## 3. Can it be taught mostly visually, through interaction?
Partly. Every lesson is a steps lesson of about 12 screens, and SHOW screens may carry up to about
90 words (see the decisions). Each lesson has one main picture you move with your finger, and each
shows the cause, not just the answer:
- **The rule drawn as arrows (lesson 1).** A temperature against time grid. Drag a probe and an
  arrow at that point shows the rule's slope, with its readout in °C a minute. Hotter above the room
  means steeper down, at the room it is flat, and below the room it points up. The arrows you leave
  behind fill in to the slope field, and "show all" completes it. Tap to drop a start, and its curve
  flows along the arrows. The room slider moves the flat steady line, drawn as a curve like any
  other. "Try a curve" lays a straight line or a guessed curve on the field. A slope tracker rides
  along it, red wherever the curve's slope and the rule's slope disagree. A switch swaps in
  dy/dt = 2t, whose arrows are flat down the middle and whose solutions are parabolas. *Why:* the
  unknown is a function (Rasmussen, notes 4.1). Students find steady states as numbers, not as flat
  solutions (Rasmussen, notes 4.2), and think a parabola does not "form a DE" (SEFI, notes 6.1). A
  field can be read before any solving (Lamar, notes 4.2). The cause shown is that the rule sets
  the slope at every point, and the solution is whatever curve obeys it everywhere.
- **Equal times, equal fractions (lesson 2).** A discharge curve with R and C sliders. A shaded
  window of fixed width slides along it, and the readout shows the value at each end and their
  ratio. Drag it anywhere and the ratio holds. Widen it to one RC and the ratio is 0.368. A tangent
  from the window's start, at the starting rate, reaches zero at one RC. A switch turns the sign to
  plus and the same window shows growth by a fixed factor. *Why:* Exponentials taught the curve and
  its numbers. The research says the course should show "where the rule comes from" (notes 4.4):
  a rate in proportion to the amount takes the same fraction in every equal time. Both readings of
  τ are drawn (Lumen, Mahajan, notes 4.4).
- **The steady line and the gap (lesson 3).** A coil and resistor on a supply, with the current
  plotted live. The steady value E ÷ R is a dashed ink line. The gap between it and the current is
  shaded. Drag E or R and the line moves. Drag the starting current, above or below it. Flip the
  switch mid-run and a new gap opens to the new steady line. Each τ is marked, and the gap shrinks
  to 0.368 of itself at every mark. "Split" draws the curve as the steady line plus the dying gap.
  Skins: a motor's speed running up to its load speed, and a tank's level. *Why:* the answer is a
  transient that "depends on initial conditions" plus a steady state that "depends only on the
  driving" (LibreTexts, notes 4.5). Ideas before the equation (Mungan, notes 6.5). The cause shown
  is that the rate follows the gap, so the gap decays exactly as in lesson 2. Why five τ is not
  "full" is the gap that never quite closes (UNC, OpenStax, notes 4.4, 6.5).
- **The stepper (lesson 4).** A faint slope field and, at first, the exact discharge curve drawn
  faintly. Drag the step size from 0.05 s to 2 s. Each step reads the arrow at its start, drawn
  bold, and walks along it. The drift from the exact curve is hatched. A small table logs the value
  at 1 s for each step size, so halving shows up as halving. Then the exact curve goes away and the
  tank equation, which has none, is stepped instead. *Why:* "a smaller h would result in a better
  approximation" and large h brings "bad oscillations" (Swarthmore, notes 4.6). Students assume an
  approximation "just follow[s]" the exact curve (Rasmussen, notes 6.6). The cause shown is that
  each step uses the slope at its start, which goes stale over a long step.
- **The spring and the circuit side by side (lesson 5).** A mass on a spring with a damper, and a
  series RLC circuit. Each slider is labelled twice: mass and L, damping and R, stiffness and 1 ÷ C.
  Pull the mass, or charge the capacitor, and let go. One trace shows both, position and charge,
  because they are the same curve. Scrub the time and three bars show the three terms at that
  moment: the push from inertia, the loss and the store. They always add to zero. *Why:* the circuit
  "is an electrical analog of a spring-mass system with damping" (LibreTexts, notes 4.7), term for
  term (Illinois, Ohio State, notes 4.7). You know the circuit, so the spring is explained by it.
  The bars are the equation, so reading terms is the picture itself. Students read a time graph as
  a picture of the motion (Rasmussen, notes 6.2), so the spring moves up and down beside its graph,
  never along it.
- **The roots and the motion (lesson 6).** On the left, Complex numbers' plane with the two roots.
  On the right, the response from the same start. Drag the damping down from high. The roots slide
  together along the real axis (overdamped, a creep), meet at one point (critical, the fastest
  return), then split into a mirror pair above and below (underdamped, ringing). With no damping
  they sit on the j axis and the ringing never dies. A ghost envelope e^(αt) wraps the ringing. A
  switch shows the turning, shrinking arrow whose shadow is the response. *Why:* the three cases are
  the three kinds of roots (HELM, notes 4.7) and look as USNA describes (notes 4.7). The cause shown
  is that a root's real part is a decay rate and its j part a ringing rate. That uses your Complex
  numbers plane rather than a new rule to learn.
- **The driven swing (lesson 7).** Lesson 5's system with a drive. Drag the drive's frequency. The
  trace shows the start-up wobble dying, then a steady swing at the drive's frequency. Its size drops
  a dot on a swing against frequency graph, and the sweep traces the resonance curve. The damping
  slider lowers the peak and moves it a little lower (USNA, notes 7), and at overdamped settings
  the peak goes. A switch relabels it as an RLC current against frequency, AC circuits lesson 7's
  peak. *Why:* resonance is the steady state of a forced, underdamped system (USNA, LibreTexts,
  notes 4.8). The cause shown is the transient dying and the steady response being set by the drive
  alone (USNA, notes 4.8).
- **Colour as in the decisions.** Ink for curves, arrows and controls, amber for key terms, teal for
  small labels, red only for a slip, green only for finished.

## 4. What else
- **Benchmark (notes 1 and 2).**
  - **Brilliant** has no differential equations course now. Its own help page, pulled on 9 Oct
    2026, says "There is no ... differential equations course" (notes 1.1). Its old
    Differential Equations I survives on Class Central (SECONDARY, notes 1.1): 30 lessons, cooling
    first ("Our First Equation"), then the drag equation, separate and integrate, direction fields,
    the integrating factor and a mixing problem. It then went through matrices and the phase plane
    to springs, then "Equations of Order Two", an RLC filter and a motor (notes 1.1). Its lesson
    pages were not seen, and its own page survives only as a Wayback copy (UNCONFIRMED, notes 1.1).
    Its Differential Equations II held nonlinear and partial equations and Laplace (SECONDARY, notes
    1.2).
  - **Khan:** what an equation is and checking a solution, slope fields, Euler's method, separable
    equations, exponential models with Newton's cooling, logistic, integrating factors, then second
    order with "Complex and repeated roots of characteristic equation", then Laplace (notes 2.1).
  - **SQA Advanced Higher:** separable, first-order linear with an integrating factor, then second
    order (notes 2.2). SQA Higher has one differential equation question, solved by integrating
    (notes 2.2).
  - **HELM Workbook 19,** written for engineers: modelling with Newton's cooling, first order, second
    order with constant coefficients "for vibrating systems and ... electrical circuits", then
    applications (notes 2.3).
  - **Bird**, who lectured at the Royal Navy's marine engineering college at HMS Sultan (notes 2.4):
    one chapter in the basic book, and in the Higher book separation, homogeneous, linear first
    order, numerical methods, then second order unforced and forced (chapters 46 to 51, notes 2.4).

  The course follows Brilliant's start, the cooling rule before any method (notes 1.1), and the
  engineers' order from HELM, Bird and SQA. What Brilliant lacked that you need: second order
  without matrices, and the time-constant habits that every first-order system in your trade
  shares. What it drops: logistic growth, the drag equation, exact and homogeneous equations, and
  everything in Brilliant's linear-systems part, which belongs to Matrices and Linear algebra.
- **Starting point.** Calculus fundamentals and Exponentials and logarithms give you rates, + c,
  the RC curves and the 63% rule (see "It builds on"). Quadratics and Complex numbers give you every
  root lesson 6 needs. AC circuits gives you the resonance lesson 7 explains. The research names
  missing algebra and calculus as engineering students' first difficulty (SEFI, notes 5), and SQA
  asks teachers to "reinforce prior knowledge, including ... the laws of logarithms and indices"
  (notes 5). You have those courses, so each is reminded in one line. What is new is the idea of an
  equation whose answer is a curve, and the few pieces listed in the decisions (notes 5).
- **His aim (notes 3 and 7).** No MCA syllabus asks for differential equations (notes 3.3). Its
  last calculus lines are "the concept of rate of change" and "Determines the constant of
  integration from given conditions" (notes 3.3). What your Level 3 marine engineering course will
  ask is UNCONFIRMED (notes 3.3). So is any Royal Navy or nuclear propulsion syllabus (notes 7). The
  nearest published lines:
  - **SQA HN Engineering Mathematics 4 (H7K3 35), Outcome 4:** separation of variables, substitution,
    the integrating factor, and "a first order differential equation with an initial value", for
    "first order differential equations that arise in Engineering", 12 hours (notes 3.1). Lessons 1
    to 4 here, without the substitution method.
  - **SQA NextGen Engineering Mathematics 5 (J7LB 48), from August 2026:** "second-order, constant
    coefficient differential equations", examples "from engineering", and "the auxiliary equation
    (characteristic equation)" (notes 3.1). Lessons 5 and 6. Its Laplace part is not here.
  - **Pearson BTEC HN Unit 39, Further Mathematics** (a specialist unit): first order, then "second
    order homogeneous and non-homogeneous" equations "related to engineering systems", then Laplace
    (notes 3.2). Its control unit asks you to "Analyse the behaviour and response of first and second
    order systems" (notes 3.2). Pearson's core Unit 4002 stops at rates of change (notes 3.2), and
    its 2024 wording is UNCONFIRMED.
  - **MCA:** the written exams "will cease from April 2028" (notes 3.3), so these lines will move.
- **Where it is used (each cited before a lesson uses it).**
  - **A rule for change (1):** HELM 19.1, "the use of differential equations in modelling
    engineering systems" (notes 2.3). SQA: first-order equations "arise extensively in many areas of
    Engineering" (notes 3.1). Newton's cooling (HELM, notes 4.1). MCA "the concept of rate of change"
    (notes 3.3).
  - **Decay (2):** SQA EM4 separation of variables (notes 3.1). The RL equation "arises in
    electrical circuit theory" (HELM, notes 4.3). Radioactive decay (Britannica; the DOE handbook
    hosted by the Naval Nuclear Power Training Command, notes 7). Reactor period (DOE, NRC, notes 7).
  - **Steady state plus transient (3):** single-store systems in four fields (Engineering
    LibreTexts, notes 4.4). Motor run-up (maxon, notes 4.10), and the dynamic torque "present only
    during the transient operations" (eeeguide, SECONDARY, notes 7). Naval cable heating (ONR-funded,
    notes 7). Ship steering (NRC Canada, notes 7). A submarine simulator's hydroplanes as "a simple
    first order system" with a time constant (Lund, notes 7). SQA EM4's integrating factor (notes
    3.1). HELM 19.4, "modelling simple electrical circuits ... and Newton's law of cooling" (notes
    2.3).
  - **Euler's method (4):** Bird's Higher chapter 49 (notes 2.4). Chasnov's engineers' notes (notes
    4.6). Tank draining, "an important problem in engineering" (Waterloo, notes 4.10). The submarine
    dive, "about two minutes" after the ballast tanks flood (USNA, notes 7), named only, since it is
    two coupled equations.
  - **Spring and circuit (5):** HELM 19.3, "vibrating systems and ... electrical circuits" (notes
    2.3). SQA EM5 (notes 3.1). Pearson Unit 39 (notes 3.2). Ship roll (Springer, notes 7).
  - **The three cases (6):** USNA's naval architecture notes (notes 4.7). Roll decay tests on ship
    models (ASME, notes 7). HELM 19.4, "free electrical and mechanical oscillations" (notes 2.3).
    Khan unit 2 (notes 2.1).
  - **Resonance and reading a model (7):** USNA EN200 and EN455 (notes 4.8). ClassNK's synchronous
    rolling (notes 4.8). AC circuits lesson 7. MIT's "model ..., solve ... and interpret" (notes 4.9).
    Pearson's "behaviour and response of first and second order systems" (notes 3.2).
- **The mistakes to catch, each with a puzzle and its own hint.** Most of the research is on
  university students, not engineers at work. That you would slip the same way is UNCONFIRMED,
  though the slips are about the maths, so likely (notes 6).
  - **Lesson 1, the answer is a number:** the "function dilemma" (Rasmussen, notes 6.1); "the
    unknown ... is ... a function" (notes 4.1). A puzzle offers a number and a curve as answers.
  - **Lesson 1, a solution is not a normal function:** some students "cannot imagine that the
    solution of a DE is represented in a diagram" (SEFI, notes 6.1). Others say a parabola "does
    not form a DE" (SEFI, notes 6.1). The dy/dt = 2t puzzle.
  - **Lesson 1, the derivative as an amount:** reading it as "a change of amount instead of a rate
    of change" (SEFI, SECONDARY, notes 6.4). A puzzle asks for the rate's units.
  - **Lesson 1, steady states as numbers:** students find them but not "as collections of
    functions" (Rasmussen, notes 4.2). A puzzle asks which curve the steady state is.
  - **Lesson 1, a steady state wherever the slope is zero:** even when the rule depends on time
    (Rasmussen, notes 6.2). The flat arrows of dy/dt = 2t.
  - **Lesson 1, checking a solution:** "Difficulty verifying that a given (or found) algebraic
    function is a solution" (SEFI, notes 6.4). A candidate that fits at one point only.
  - **Lesson 2, separating wrongly:** "did not realise how to separate the variables correctly"
    (AQA 2019, notes 6.3); "did not correctly separate variables or integrate to give a negative
    logarithmic term" (SQA AH 2024, notes 6.3).
  - **Lesson 2, the + c left out:** SQA Higher 2023 and Edexcel 2019 (notes 6.3).
  - **Lessons 2 and 3, the start value not used:** "including a constant but then ... failing to
    use the initial conditions" (Edexcel 2024, notes 6.3).
  - **Lessons 2 and 5, rearranging:** "serious mistakes when rearranging equations" (SEFI, notes
    6.4).
  - **Lesson 3, τ as the time to charge fully:** UNC's pre-lab question (notes 6.5), and "the final
    value is never exactly reached" (OpenStax, notes 4.4). This is a teaching question, not a counted
    mistake.
  - **Lesson 4, the stepped path follows the exact one:** Rasmussen (notes 6.6). A puzzle asks which
    of two step sizes lands nearer, then which way it drifts.
  - **Lessons 5 and 6, a time graph read as a picture:** "the tendency to interpret a graph as a
    literal picture of the situation" (Rasmussen, notes 6.2).
  - **Lesson 6, any friction gives exponential decay:** "some students are led to believe" it (notes
    6.7). A puzzle with a dry-friction trace whose swings shrink by equal steps.
  - **Throughout, a procedure without meaning:** students "proceduralized this graphical technique"
    (Rasmussen, notes 6.2), and concepts matter more than procedure (Maynooth, notes 6.1). Every DO
    screen asks what the answer means in its units.
  - **Not stated as common:** no source counts these, so they are taught as checks (substitute it
    back, check the units, look at the start and end), not as cited mistakes.
    - Writing the equation in a form other than standard before using the integrating factor.
    - Matching the spring to capacitance instead of to 1 ÷ capacitance.
    - Expecting a resonance peak in an overdamped system.
    - Giving a second-order equation only one starting value.
- **Size and cost.** 7 lessons of about 12 screens on the agreed settings (CLAUDE.md).
  - Vectors measured about 8.2M tokens for seven lessons, about 1.17M a lesson
    (docs/plans/maths-queue.md). These pictures are heavier: linked plots, a live circuit, a roots
    plane beside a response, a frequency sweep. So I estimate about 1.1M to 1.3M a lesson.
  - That is about 7.7M to 9.1M for the course, plus about 0.3M for the plan and research. The
    research can start from the 53 saved tool results.
  - The full process measured on Fractions lessons 4 to 8 was about 1.65M a lesson, about 11.6M for
    seven.
  - Each build's real cost is reported to you.
- **Lesson 1 first.** Lesson 1 is built and checked first (about 1.2M, plus the plan and
  research). The rest follow without waiting, since you approved the build.
- **Gaps to close at build time.** None blocks the build.
  - **Lesson 2:** the slope of e^(kt) is k e^(kt), and the area rule for 1 ÷ y is ln y + c. Neither
    is quoted in these notes (Exponentials only previewed them). The research stage cites both,
    with ln of the size of y for a negative y.
  - **Lesson 2:** τ = L ÷ R in seconds (henries over ohms) is not quoted. HELM gives τ = L/R (notes
    4.3). The research stage cites the units.
  - **Lesson 3:** the motor's mechanical time constant is described, not given as a formula (maxon,
    notes 4.10). The puzzles use example figures and no formula for it.
  - **Lesson 3:** a tank whose outflow grows in step with its level is a first-order lag. That is my
    reading, beside MIT's mixing tank (notes 4.10). The research stage cites it.
  - **Lesson 4:** Torricelli's law, outflow growing with the square root of the depth, is not quoted
    (notes 4.10). Nor is any source saying the tank with an inflow has no formula. The research stage
    cites one equation that has none, or the screen says "no tidy formula" and nothing stronger.
  - **Lesson 5:** a spring's pull in proportion to the stretch, a damper's drag in proportion to the
    speed, and the loop voltages adding to the supply are not quoted. Nor is the need for two
    starting values. The research stage cites them.
  - **Lesson 6:** e^(jθ) = cos θ + j sin θ is not quoted, and nor is the damping factor's formula or
    the natural frequency √(k ÷ m), 1 ÷ √(LC). AC circuits found 159.15 Hz by its own shown rule. The
    research stage cites them, and the word "ringing" for a circuit.
  - **Lesson 7:** that AC circuits' series resonance is the steady state of this equation is my
    reading. HELM shows the first-order version, RC with a sine input (notes 4.5). The fact-check
    confirms it.
  - **Throughout:** what happens inside Brilliant's lessons is UNCONFIRMED (notes 1.1). So is Bitesize
    or any other named list of mistakes for this topic (notes 2.2, 6). So is whether the Navy's
    marine and nuclear training uses these treatments (notes 7). Send your syllabus when you have it,
    and the course can be checked against it.
