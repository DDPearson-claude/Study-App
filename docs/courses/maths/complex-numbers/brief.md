# Complex numbers: the course brief

Written 18 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
the ninth and last course in the Maths shelf's Algebra folder, "The square root of minus one and the
plane it opens up: j-notation phasors in polar form, as AC circuits are written." It comes after
Trigonometry, and no course in the folder follows it. You asked for the whole Algebra folder in one
push (17 Oct), so I have taken the decisions for you and listed them below; change any you like.
Sources and quotes are in `research-notes.md` beside this file (202 quotes, cut by script from the
69 saved tool results and checked with `tools/eval/sources.mjs`, `failed: 0`; section numbers below
point there).

## The short version
**Eight lessons**
1. A number whose square is minus one (built first)
2. The complex plane, and adding
3. Multiplying: stretch and turn
4. The conjugate, and dividing
5. Polar form: length and angle
6. Multiplying and dividing in polar form
7. Impedance: Z = R + jX
8. Ohm's law with j: series and parallel

**The main pictures** (one per lesson, each moved with your finger):
- **The quarter turn (lesson 1).** An arrow from 0 to 1 on a number line. Times −1 swings it round
  half a turn to −1. Drag a turn handle to find the turn that, done twice, makes that half turn. It
  is a quarter turn, and the arrow it leaves pointing straight up is j. Tap "× j" again and again:
  1, j, −1, −j, 1.
- **Arrows on the plane (lesson 2).** The coordinate plane with its axes renamed: real across
  (resistance), j up (reactance). Drag the tips of two arrows. Their sum is drawn tip to tail, and
  the across parts and up parts add on their own.
- **Stretch and turn (lesson 3).** An arrow z, and z turned a quarter (jz), dashed. Two sliders set
  c and d. The product z × (c + jd) is c lots of z, then d lots of jz, laid tip to tail. Beside it,
  the four-tile grid from Quadratics, with the j × j tile moving across to the real pile with its
  sign changed.
- **The mirror pair (lesson 4).** Drag z, and its conjugate mirrors it in the real axis. Their
  product is always an arrow lying flat on the real axis, a² + b² long. The grid shows the two j
  tiles cancelling.
- **One arrow, two names (lesson 5).** Drag an arrow's tip into any quarter. It reads out as a + jb
  and as r∠θ at once. A ghost arrow shows what the calculator's tan⁻¹(b ÷ a) gives, which lands in
  the wrong quarter for −1 − j.
- **Turn and stretch (lesson 6).** Two arrows with their angles drawn as arcs. The product's arc is
  the two arcs stacked, and its length is the two lengths multiplied. A switch divides instead.
- **The impedance builder (lesson 7).** Sliders for R, L, C and the frequency. The parts R, +jX_L
  and −jX_C are laid tip to tail, and the arrow from start to finish is Z. Its angle φ and the power
  factor cos φ read out. Raise the frequency and the coil's arrow grows while the capacitor's
  shrinks.
- **The circuit's phasor diagram (lesson 8).** The supply voltage V is a fixed arrow at 0°. The
  current arrow I = V ÷ Z swings back by Z's angle and shrinks by its size. In series, the part
  voltages add tip to tail to make V. In parallel, the branch currents add tip to tail to make the
  supply current.

**Decisions taken for you** (say if you want any changed):
- **Eight lessons.** The research suggests seven core lessons plus a worked circuit lesson, eight
  in all (notes 8). Brilliant spends 85 lessons on the ground across two courses (notes 1), but the
  sources written for engineers spend far less: mathcentre has seven short leaflets, Bird's chapter
  has eight sections, and SQA's old unit gave vectors and complex numbers together 14 hours (notes
  8). Seven is possible by joining lessons 7 and 8. It would save about 1.15M tokens, but
  impedance and Ohm's law with j would each get half a lesson, and they are what the college's
  electrical units use (notes 3.3).
- **Lesson 1 is built first, without a pause.** The runbook asks for a pilot you try before the
  rest. You asked for the folder in one push, so lesson 1 is built and checked first, and the others
  follow without waiting. You can try it on your phone as soon as it lands.
- **Steps lessons, with a little more explaining ("Partly", RUNBOOK section 0, item 3).** About 12
  screens each, SHOW then DO, ending on two or three mixed puzzles. SHOW screens may carry a short
  paragraph where an idea needs words: why j × j is a half turn, why the conjugate makes the bottom
  real, why the calculator's angle can be wrong, why a coil gets +j and a capacitor −j. Every
  lesson still has a picture you move.
- **j from the first screen.** Engineers write j because i already means current (MathWorld,
  Waterloo, MIT, notes 4.1), and SQA's HN guidance says "engineers tend to use j" (notes 3.1). One
  screen in lesson 1 says that maths books, Brilliant, Khan and HELM write i for the same number
  (notes 2.4, 4.1).
- **The rule j × j = −1 leads, and "√−1" is only a nickname. This is taught as contested.**
  mathcentre writes "j = √−1. It follows that j² = −1" (notes 4.1). A paper on teaching the complex
  unit says to "banish the commonly used equation 𝑖 = √−1 ... and instead write 𝑖² = −1" (Scimath,
  notes 6.1). Egan, as reported in the Zimbabwe study, wanted students to meet the square root of
  −1 through its square first (notes 6.1). So lesson 1 leads with j × j = −1 and the quarter turn.
  It names "the square root of minus one" as what people call j, and never hands you a √ of a
  negative to calculate with. One screen shows both views.
- **Geometry first, then algebra.** Teaching that stays in the algebra "results in a loss of
  essential characteristics of complex numbers", and a sequence that tied the algebra to the
  geometry "improve[d] their conceptions" (PME-NA, notes 6.4). Brilliant teaches multiplying as a
  rotation before conjugates and division (notes 1.1). So every operation is an arrow move before it
  is a rule, and lesson 3's stretch-and-turn comes before polar form names it.
- **The way in is the quadratic with no real roots.** Quadratics lesson 5 stopped at "no real
  roots" and pointed here. Bird starts with x² + 2x + 5 = 0, whose answers −1 + j2 and −1 − j2 "are
  known as complex numbers" (SECONDARY, notes 5), and Brilliant says complex numbers "arise naturally
  as solutions to equations" (notes 1.1). Lesson 1 finishes that quadratic.
- **Written a + jb, with a + bj named once.** Circuit texts put the j first, as in R + jX, −1 + j2
  and 0 + j4 (Bird, Electronics Tutorials, notes 4.3, 5). mathcentre writes z = a + bj (notes 4.1).
  The course writes a + jb and says once that both mean the same.
- **"Magnitude" and "angle" are the main words; "modulus" and "argument" are named once.**
  mathcentre calls it "the modulus, or magnitude" (notes 4.5), and SQA asks for the "principal
  argument" (notes 3.1), so you will meet both at college. "Imaginary" is said once and then the
  course says "the j part". The Zimbabwe study found terms like "imaginary, conjugate, argand
  diagram" hard to grasp, and the Scimath paper calls "imaginary unit" "most unfortunate" (notes
  6.1).
- **Angles from −180° to 180°, in degrees.** HELM takes −π < θ ≤ π and allows degrees (SECONDARY,
  notes 4.5). SQA asks you to note "the domain of principal argument" (notes 3.1). Adding 360° names
  the same arrow, said once with the picture. Radians are named once with mathcentre's worked
  example, which gives both (notes 4.5).
- **Polar form is written r∠θ.** That is mathcentre's and HELM's engineering form (notes 2.4,
  4.5). r(cos θ + j sin θ) is shown once, as the same arrow split into its parts.
- **Everything by hand with a scientific calculator.** SQA bans calculators with "complex number
  manipulation" in the assessment (notes 3.1). So every conversion uses sin, cos, tan, their
  inverses and Pythagoras, which you have from Trigonometry.
- **The conjugate taught as one move, with rationalising inline.** Powers and roots left
  rationalising out (notes 5). Here it is one move: multiply top and bottom by the bottom's
  conjugate, so the bottom becomes a² + b², a real number (HELM, Bird, notes 2.4, 4.4).
- **No de Moivre screen.** You asked for it only if the HNC lines ask, and they do not. SQA
  Engineering Mathematics 1 and Pearson 4002 do not list it; it is in Pearson's HND unit 5006
  ("M1 Solve problems using de Moivre's Theorem"), SQA Advanced Higher, HELM 10.4 and Bird's second
  chapter (notes 2.3, 2.4, 2.5, 3.4, 4.8). If you want it, it is one stretch screen at the end of
  lesson 6: multiply an arrow by itself n times and you get rⁿ∠nθ.
- **Phasors drawn at rms, with V = IZ working either way.** Trigonometry drew phasors at peak
  length in lessons 6 and 7, named the rms habit, and used rms in lesson 8. Here every arrow is an
  rms value, said on each screen. V = IZ holds for peak or rms, because both sides scale by the same
  factor (my reading).
- **Reactance taught inline from your trade and Calculus fundamentals.** X_L = 2πfL is in Bird
  (SECONDARY, notes 4.7), and Rose-Hulman gives Z_L = jωL and Z_C = −j/ωC (notes 4.7), so
  X_C = 1/(ωC). ω = 2πf is from Trigonometry lesson 6. Why a coil's voltage leads its current is
  told with Calculus fundamentals lesson 5: a coil's voltage follows how fast its current changes,
  and a sine changes fastest as it crosses zero (my reading; see the gaps).
- **A ship's supply at 60 Hz.** MIT's power-systems notes say "most ships at sea" run at 60 Hz
  (notes 7.1). So ω = 2π × 60 = 376.99 rad/s, computed on screen. Voltages, resistances, coils and
  capacitors in the puzzles are example figures, said so on screen.
- **Taught inline, because you have not met them** (notes 5): naming a point by length and angle
  (lesson 5); the conjugate and rationalising (lesson 4); reactance and impedance (lesson 7).
- **Left for later courses, with a one-line look ahead where it fits.** No course in the Algebra
  folder follows this one, so these go to the Advanced maths folder or to college:
  - **The exponential form, re^{jθ}.** Exponentials and logarithms left "e raised to an imaginary
    power" for this course. Pearson's HND unit 5006 asks for "polar and exponential forms" (notes
    3.4), HELM has it as 10.3 (notes 2.4), and SQA's HNC unit does not list it (notes 3.1). Lesson
    6 says in one line that HND texts write r∠θ as re^{jθ}, the same arrow. The shelf's
    Differential equations course is where e^{jωt} would sit (my reading; not researched here).
  - **Vectors.** A phasor shares some qualities with a vector but is a complex number: "We cannot
    apply curl, divergence, and dot product to phasore and get other phasors" (UTK, notes 6.5).
    Lesson 2 adds arrows the way vectors add (HELM, notes 4.4) and says the shelf's Vectors course
    has the rest.
- **Left out, not deferred:**
  - **Kirchhoff's laws in j.** Linear systems pointed here (its brief, section 1). Utah's notes say
    "ALL the DC circuit analysis techniques will work with AC" once the complex arithmetic is done
    (notes 4.7). Lesson 8 says so in one line with no puzzle, because two complex simultaneous
    equations by hand are long, and HyperPhysics already calls even parallel impedances "lengthy"
    (notes 4.7).
  - **Complex power, power factor correction and resonance as topics.** SQA Electrical
    Engineering Principles teaches them after complex notation (notes 3.3). Lesson 7's frequency
    slider shows the coil and capacitor cancelling at one frequency, and lesson 8's parallel
    capacitor shows the supply current falling. Each gets one sentence and a pointer to college.
  - **Roots, loci and complex equations.** SQA Advanced Higher has loci and roots (notes 2.3), and
    Bird has "complex equations" (notes 2.5). No HNC line found asks for them (notes 3.1).
  - **Three-phase in j.** SQA Electrical Engineering Principles asks you to "Draw phasor diagrams for
    balanced three-phase loads" (notes 3.3). Trigonometry lesson 7 added three-phase arrows by
    parts, and that is where it stays; writing them in j is college work.
- **Colour as before.** Ink for arrows, axes and controls. The second arrow in a pair, the
  conjugate and the turned copy jz are dashed ink, not another colour. Amber for key terms, teal for
  small labels (real, j, R, X_L, X_C, units), red only for a slip, green only for finished.
- **Your intake answers** (`intake.json`): to understand complex numbers and how to work with them;
  on the job and in everyday life; hands-on, with the why explained in full.

## 1. The overall topic
Some equations have no answer among the ordinary numbers: no number on the number line, multiplied
by itself, gives −9. Complex numbers add one new number, j, with the rule j × j = −1. The picture
that makes it make sense: multiplying by −1 turns an arrow half a turn, so j is the quarter turn
that, done twice, makes that half turn. Numbers then live on a plane, not a line. A complex number
a + jb is an arrow with an across part a and an up part b.

You can add, take away, multiply and divide these arrows. Adding is easiest by parts (a + jb form).
Multiplying and dividing are easiest by length and angle (r∠θ form): multiply the lengths and add
the angles. Converting between the two forms is Pythagoras and the trigonometry you have.

Then the payoff. In an AC circuit, a resistor, a coil and a capacitor each push back on the current
by a size and at an angle. Written as one complex number, the impedance Z = R + jX, Ohm's law
V = IZ works the way it does for DC, series impedances add, and parallel ones combine like
resistors. The angle of Z is the angle between voltage and current, whose cosine is the power factor
from Trigonometry.

**It builds on:**
- **Quadratics and polynomials:** two brackets multiplied out as four tiles (lesson 1), used for
  multiplying and the conjugate (lessons 3 and 4 here). The quadratic formula and "no real roots"
  (lesson 5), where lesson 1 here starts. Lesson 8 there said a polynomial's roots can be complex.
- **Trigonometry:** splitting an arrow into F cos θ and F sin θ and finding the angle with tan⁻¹
  (lesson 2); signs in each quarter of the circle (lesson 3); radians (lesson 5); ω = 2πf and phase
  (lesson 6); phasors added by their parts (lesson 7, whose last screen pointed here); power factor
  as cos φ (lesson 8).
- **Geometry fundamentals:** Pythagoras, for the length of an arrow.
- **The coordinate plane:** plotting points in all four quarters. The complex plane is that plane
  with its axes renamed.
- **Negative numbers:** minus times minus is plus, which j × j × j × j = 1 depends on.
- **Powers and roots:** square roots and surds; it left rationalising for here.
- **Solving equations and Linear equations:** rearranging V = IZ for I or Z.
- **Calculus fundamentals:** a capacitor's i = C dv/dt and a coil's v = L di/dt (lesson 5), the
  reason for their quarter turns.
- **Your trade:** Ohm's law, resistors in series and in parallel, product over sum, and what a coil
  and a capacitor are. None of this is taught to you.

**Not taught again:** expanding two brackets, the quadratic formula, sin, cos and tan, inverse trig,
signs by quarter, Pythagoras, plotting points, adding phasors by parts, ω = 2πf, power factor as
cos φ, rearranging formulas, Ohm's law for DC. Each is used with a one-line reminder.

**Edges.** Complex numbers in a + jb and r∠θ form, the four operations, conversions both ways, and
single-phase AC circuits with one supply, in series or two branches in parallel. No exponential form,
no de Moivre, no roots of complex numbers, no loci, no complex power, no Kirchhoff's laws in j.

## 2. The lessons, in the order they build
The order is the one all the sources share: the number, the plane, arithmetic by parts with the
conjugate for division, then polar form and its multiplying and dividing (notes 2), followed by
Bird's "Applications of complex numbers" to AC circuits (notes 2.5) and the research's suggested
core (notes 8).

| # | Lesson | What it teaches |
|---|---|---|
| 1 | A number whose square is minus one | x² = −9 has no answer on the number line, and Quadratics' x² + 2x + 5 = 0 has "no real roots". Times −1 is a half turn, not a mirror (RUME, notes 6.4). A quarter turn done twice is a half turn, so call the quarter turn j: j × j = −1 (mathcentre, HELM, notes 2.4, 4.1). It is a new direction, off the number line ("the quantity j is not real", mathcentre, notes 4.1). Taught as contested: some write j = √−1, some say only j² = −1 (mathcentre, Scimath, notes 4.1, 6.1). Powers of j go round: j² = −1, j³ = −j, j⁴ = 1 (mathcentre, notes 4.1). x² = −9 has two answers, j3 and −j3, checked by squaring. Back to the quadratic: b² − 4ac = −16 = (j4)², so x = −1 ± j2 (Bird, SECONDARY, notes 5). A complex number is a + jb, with real part a and j part b (mathcentre, notes 4.1). Why j and not i: i is current (MathWorld, Waterloo, MIT, UC Davis, notes 4.1). |
| 2 | The complex plane, and adding | The Argand diagram: real across, j up (Bird, SECONDARY, notes 4.3), in all four quarters (SQA, notes 3.1). The point stands for the number, it is not the number (HELM tutor's guide, SECONDARY, notes 4.3). Read each number as an arrow from 0. Add the real parts and the j parts separately, which is laying the arrows tip to tail: adding complex numbers "is essentially equivalent to addition ... of two-dimensional vectors" (HELM, SECONDARY, notes 4.4), and an arrow can slide anywhere if its length and direction stay (HELM, notes 2.4). Taking away is adding the arrow turned half round (lesson 1's × −1). Trigonometry lesson 7's phasors added by parts were this all along. For you the real axis is resistance and the j axis reactance: 6 + j0 is a pure resistance and 0 + j4 a pure reactance (Electronics Tutorials, notes 4.3). |
| 3 | Multiplying: stretch and turn | Multiply as two brackets (Quadratics lesson 1) and put j × j = −1: "the same rules as for normal algebra" plus j² = −1 (Electronics Tutorials, notes 4.4). (2 + j3)(1 − j2) = 2 − j4 + j3 − j²6 = 8 − j. Times a real number stretches an arrow. Times j turns any arrow a quarter turn anticlockwise "without altering its length" (Bird, SECONDARY; Khan circuit analysis, notes 4.2), and four times brings it home (HELM, SECONDARY, notes 4.2). So z × (c + jd) is c lots of z plus d lots of z turned: the product is z stretched and turned. That is why multiplying by 2j "multiplies lengths by 2 and adds π/2 to arguments" (MIT, notes 4.2). The last screen notices the stretch and turn and leaves the rule for lesson 6. |
| 4 | The conjugate, and dividing | The conjugate of a + jb is a − jb: flip the sign of the j part and nothing else, the mirror in the real axis. A number times its conjugate is a² + b², "always a non-negative real number" (HELM, notes 2.4), because the two j tiles cancel and j × j turns −b² into +b². (3 + j4)(3 − j4) = 25. Lesson 1's two roots −1 ± j2 are a mirror pair. To divide, multiply top and bottom by the bottom's conjugate (Bird, SECONDARY, notes 4.4), because "a complex number divided by a real number is easy to evaluate" (HELM, notes 2.4). This is called rationalising (Electronics Tutorials, notes 4.4). 10 ÷ (3 + j4) = 10(3 − j4) ÷ 25 = 1.2 − j1.6. Check every division by multiplying back. |
| 5 | Polar form: length and angle | A point can be named by how far and which way, as well as by across and up (Brilliant's Polar Coordinate Plane, notes 1.2; inline, notes 5). The length r = √(a² + b²), using b and not jb (Zimbabwe study, MIT, notes 6.3); it is never negative (mathcentre, notes 4.5). The angle from tan⁻¹(b ÷ a), then checked against the drawing, because the calculator gives the same answer for 1 + j and −1 − j (Newcastle, notes 6.3): draw it first (mathcentre, HELM, notes 4.5). −2 + j is at 180° − 26.57° = 153.43° (mathcentre, notes 4.5). Angles from −180° to 180°; + 360° is the same arrow (HELM, notes 4.5). Written r∠θ (mathcentre, notes 4.5). Back again: a = r cos θ and b = r sin θ (OpenStax, notes 4.5), Trigonometry lesson 2's shadows, the MCA's "I cos 0 and I sin 0" (notes 3.5). A phasor is a complex number for "the magnitude and phase of a voltage or a current" (UTK, notes 6.5), so a voltage is written 230∠0° (example figure). |
| 6 | Multiplying and dividing in polar form | To multiply, "multiply their moduli and add their arguments. To divide, we divide their moduli and subtract their arguments" (mathcentre, notes 4.6; HELM, OpenStax, notes 4.6). The reason is lesson 3: times a number of length r turns by its angle and stretches by r (HELM, SECONDARY, notes 4.2). Check: (2 + j3)(1 − j2) is 3.606∠56.31° × 2.236∠−63.43° = 8.062∠−7.12°, which is lesson 3's 8 − j. j is 1∠90°, so ÷ j is a quarter turn back and 1 ÷ j = −j ("division by 𝑖 is the same as rotation by −𝜋/2", MIT, notes 4.2). Bring a sum of angles back into −180° to 180°; +90° and −270° are the same phase (ModEL, notes 6.5). Choose the form for the job: add and take away by parts, multiply and divide by length and angle (HELM Key Point 7, Electronics Tutorials, Kuphaldt, notes 4.6). One line: HND texts write r∠θ as re^{jθ} (Pearson 5006, notes 3.4). |
| 7 | Impedance: Z = R + jX | Impedance is "a generalization of resistance", in ohms (Rose-Hulman, notes 4.7): its real part is resistance and its j part reactance (HMC, notes 4.7). A resistor is R at 0°, "zero phase shift" (ModEL, notes 4.7). A coil is +jX_L, with X_L = 2πfL (Bird, SECONDARY, notes 4.7), and a capacitor −jX_C, from Z_c = −j/ωC (Rose-Hulman, notes 4.7). Why the quarter turns: a coil's voltage follows how fast its current changes (Calculus fundamentals lesson 5), so it peaks a quarter cycle early: "ELI the ICE man", labelled as a memory aid (OpenStax, notes 6.5). Your calculator gives the reactance's size only; you attach the +j or −j (ModEL, notes 6.5). In series the parts add: Z = R + j(X_L − X_C), the impedance triangle (MCA, notes 3.5; series rule, MIT, notes 4.7). Example: 8 + j6 = 10∠36.87°. The angle of Z is the angle between voltage and current (Kirtley, SECONDARY, notes 4.7), so cos 36.87° = 0.8 is the power factor (Trigonometry lesson 8). At 60 Hz (MIT, notes 7.1), X_L = 6 Ω needs L = 15.9 mH, computed. Z is a complex number, not a phasor: it does not turn (Oregon State, notes 4.7). |
| 8 | Ohm's law with j: series and parallel | V = IZ, "the generalized version of the Ohm's law for AC circuits" (HMC; MIT 18.03SC; Bird, notes 4.7). The supply is the reference at 0°, because only angle differences mean anything (Kirtley, ModEL, notes 6.5). I = V ÷ Z in polar: 230∠0° ÷ 10∠36.87° = 23∠−36.87° A, so the current lags by Z's angle (example figures). The part voltages, I × R = 184∠−36.87° and I × j6 = 138∠53.13°, add tip to tail back to 230∠0° (MCA phasor diagrams for series circuits, notes 3.5). Parallel impedances combine "exactly the same as those for resistance" (MIT, notes 4.7): add the branch currents as arrows, or use product over sum for two, which needs lesson 4's division (HyperPhysics, notes 4.7). Add a −j10 Ω capacitor across the coil: the branch currents 18.4 − j13.8 and j23 add to 18.4 + j9.2 = 20.57∠26.57° A, less than 23 A. One line: all your DC methods carry over (Utah, notes 4.7). The last screens are a mixed set from the whole course, where you choose the form first. |

## 3. Can it be taught mostly visually, through interaction?
**Partly** (RUNBOOK section 0, item 3). Every lesson is a steps lesson of about 12 screens, SHOW then
DO, ending on two or three mixed puzzles. SHOW screens can carry a short paragraph where the idea
needs words. Each lesson has one main picture you move with your finger, chosen because it shows the
cause, not just the answer:
- **Lesson 1, the quarter turn.** A number line with an arrow from 0 to 1. A "× −1" button swings the
  arrow round through the top to −1, animated as a turn, never a flip. A turn handle lets you set
  any turn and shows the turn done twice. Find the turn that lands on −1 when doubled: the quarter
  turn, leaving the arrow pointing straight up, off the line. That direction is j. A "× j" button
  then steps 1, j, −1, −j, 1, with the power of j read out at each step. A last card stretches the
  arrow to 3 and turns it, so (j3)² lands on −9. *Why:* multiplying by j "corresponds to a rotation
  by +90 degrees" (Khan circuit analysis, notes 4.2), and four turns bring it home (HELM, SECONDARY,
  notes 4.2). Students "do not view multiplying a number by – 1 as a rotation of 180°, rather they
  perceive it as a reflection" (RUME, notes 6.4), so the half turn is shown as a turn. The cycle
  answers the documented sign errors on powers of j (Ahmad and Shahrill, in the Zimbabwe study,
  notes 6.1), and the rule j × j = −1 is something you watch happen, as Egan and the Scimath paper
  advise (notes 6.1).
- **Lesson 2, arrows on the plane.** The coordinate plane, its axes labelled real (resistance) and
  j (reactance) in teal. Drag the tips of two arrows anywhere in the four quarters. A third, bold
  arrow is their sum, drawn with the second arrow slid to the tip of the first. Readouts show the
  across parts and the up parts adding on their own. A switch takes away instead: the second arrow
  turns half round, then adds. *Why:* addition "is essentially equivalent to addition (subtraction)
  of two-dimensional vectors" and the arrows are "slidable" (HELM, SECONDARY, notes 2.4, 4.4), and
  Khan's skill is "Graphically add & subtract complex numbers" (notes 2.1). The four quarters are
  SQA's "all four quadrants of an Argand diagram" (notes 3.1). Seeing the parts add on their own is
  the cause of the rule "real with real, j with j".
- **Lesson 3, stretch and turn.** An arrow z you can drag, and beside it z turned a quarter, jz,
  dashed. Sliders set c and d. The product z × (c + jd) is built as c lots of z, then d lots of jz,
  laid tip to tail, and its end is the answer. Under it, the four-tile grid from Quadratics lesson 1,
  with the j × j tile sliding across to the real pile with its sign changed. *Why:* this is the
  research's case for tying algebra to geometry, a sequence that "allowed students to coordinate
  algebraic and geometric processes on complex numbers" (PME-NA, notes 6.4). Brilliant's level 4
  runs "Multiplying by i, Rotation by Multiplication, ... Scaling and Rotating, General
  Multiplication" (notes 1.1). The grid shows where the −1 comes in; the arrows show what the
  answer means. The answer is z turned and stretched, which lesson 6 names.
- **Lesson 4, the mirror pair.** Drag z anywhere; its conjugate, dashed, mirrors it in the real
  axis. Their product is drawn as an arrow, and wherever you drag, it lies flat on the real axis,
  a² + b² long. The grid beside it shows +jab and −jab cancelling and j × j turning −b² into +b².
  A second card divides: the top and bottom are both multiplied by the mirror, and the bottom
  becomes a plain number on the real axis. *Why:* "the product of a complex number with its
  conjugate is always a non-negative real number" (HELM, notes 2.4), and the reason to rationalise
  is "to get a real number in the denominator" (HELM, notes 2.4). The mirror answers the Zimbabwe
  study's wrong ideas, that a conjugate "must have a positive and negative number" and that the
  conjugate of √2 is √−2 (notes 6.2): it is one move, flip the j part.
- **Lesson 5, one arrow, two names.** Drag an arrow's tip into any quarter. Two readouts show it as
  a + jb and as r∠θ, with the length drawn as the arrow and the angle as an arc from the real axis.
  A ghost arrow, dashed, shows the calculator's tan⁻¹(b ÷ a). In the right-hand quarters it sits on
  the real arrow; in the left-hand quarters it points the opposite way, and the arc shows the 180°
  that fixes it. A switch runs it backwards: set r and θ, and the across and up shadows read r cos θ
  and r sin θ, as in Trigonometry lesson 2. *Why:* the calculator returns "the same number" for
  1 + i and −1 − i (Newcastle, notes 6.3), "obtaining an angle in the correct quadrant" was "much
  more troublesome" for exam candidates (Pearson examiners, notes 6.3), and every source says draw
  it first (mathcentre, HELM, NZQA, notes 4.5, 6.3). The ghost arrow shows the cause: the
  calculator only sees b ÷ a.
- **Lesson 6, turn and stretch.** Two arrows, z and w, with their angles drawn as arcs and their
  lengths labelled. The product is drawn with its arc made of the two arcs stacked end to end and
  its length shown as r × s. A divide switch takes w's arc away instead and divides the lengths. A
  "× j" button sets w to 1∠90°, which is lesson 1's quarter turn. *Why:* "the effect of multiplying
  w by z is to rotate the line ... anti-clockwise through an angle θ which is arg(z), and preserving
  the length" (HELM, SECONDARY, notes 4.2); with the length, "the moduli r and t multiply together
  whilst the arguments ... add together" (HELM, SECONDARY, notes 4.6). Stacking the arcs is that
  cause. Khan places "Graphically multiply complex numbers" right before the polar rules (notes 2.1).
- **Lesson 7, the impedance builder.** Sliders for R, L, C and the frequency f. The resistor's arrow
  lies along the real axis, the coil's points up and the capacitor's points down, each with its
  size in ohms. Laid tip to tail, they end at Z, drawn bold, with its angle φ and the power factor
  cos φ read out. Drag f up and the coil's arrow grows while the capacitor's shrinks, so Z swings
  from leading to lagging; at one frequency they cancel and Z = R. A small wave panel, from
  Trigonometry lesson 6, shows the current and the coil's voltage a quarter cycle apart. *Why:* the
  MCA asks you to define and calculate reactance and "Sketches and uses impedance triangles" (notes
  3.5), and SQA asks you to "Analyse RL, RC and RLC electrical circuits using complex notation"
  (notes 3.3). Reactance and impedance "often strike students as being vague and confusing" (ModEL,
  notes 6.5); the builder shows impedance as resistance with an angle, each part's angle fixed by
  its kind and its size set by f.
- **Lesson 8, the circuit's phasor diagram.** A small circuit drawing above a phasor diagram. The
  supply V is a fixed arrow at 0°. Drag the impedance (R and X, or pick a coil or a capacitor). The
  current arrow I = V ÷ Z shrinks by |Z| and swings back by Z's angle. In series mode, I × R lies
  along I and I × jX stands at a quarter turn to it, and the two add tip to tail to V. In parallel
  mode, each branch current is V ÷ Z for its branch, and they add tip to tail to the supply current;
  add a capacitor branch and watch the total fall. *Why:* V = IZ is "the generalized version of the
  Ohm's law for AC circuits" (HMC, notes 4.7), and "the phase angle between voltage and current is
  the same as the phase angle of the impedance" (Kirtley, SECONDARY, notes 4.7), which is what the
  swing shows. Students "view AC circuit analysis as wholly different from DC circuit analysis"
  (ModEL, notes 6.5); the circuit drawing and the series and parallel rules are your DC ones, with
  arrows. The MCA asks you to construct "phasor diagrams for R-L, R-C and R-L-C series circuits"
  (notes 3.5), and SQA Electrical Engineering Principles to draw "phasor diagrams" (notes 3.3).

## 4. What else
- **Benchmark (notes 1 and 2).**
  - **Brilliant Complex Numbers** (50 lessons, 11 levels): the square root of −1 and plotting,
    adding, distance and scaling, multiplication as rotation, conjugates, division, polar form,
    adding arguments, polar multiplication and division, powers and roots (notes 1.1). It assumes
    "the cartesian and polar coordinate plane, quadratic equations and basic trigonometry" (notes
    1.1). Its address is `/complex-plane/`; `/complex-numbers/` returns the courses list (notes 1).
  - **Brilliant Polar Coordinate Plane** (35 lessons, 7 levels): length and angle, in degrees then
    radians, ending with polar to rectangular "Using Sine and Cosine" and back (notes 1.2). Lesson 5
    here takes what this course needs from it.
  - **Khan** splits it: Algebra 2 does the number, the plane, adding and multiplying and quadratics
    (notes 2.2); Precalculus Unit 3, which comes right after its trigonometry unit, does
    conjugates and division, modulus and angle, polar form, then multiplying graphically and in
    polar form (notes 2.1).
  - **SQA Advanced Higher** has the arithmetic, then the Argand diagram, polar form, de Moivre and
    loci (notes 2.3). Bitesize has no complex-numbers guide in its Higher list (notes 2.3).
  - **HELM Workbook 10** (34 pages): arithmetic, the Argand diagram and polar form, the exponential
    form, de Moivre (notes 2.4). Its Key Point 7 is lesson 6's choice of form.
  - **Bird**, who taught at the Royal Naval School of Marine Engineering (SECONDARY, notes 2.5):
    Cartesian, the Argand diagram, the four operations, complex equations, polar form, polar
    multiplication and division, then "Applications of complex numbers" (notes 2.5).
  - **mathcentre's seven leaflets**, written for engineers and using j, follow the same order
    (notes 2.6).

  What they lack that you need: Brilliant and Khan use i and stop before circuits (notes 1.1, 2.1).
  Brilliant spends 85 lessons, far beyond the HNC. Lessons 7 and 8 come from Bird's applications,
  SQA Electrical Engineering Principles and the MCA's electro-technology lines.
- **His aim (notes 3).**
  - **SQA HN Engineering Mathematics 1 (J7GK 46, replacing H7K0 33), a mandatory HNC unit** (notes
    3.2). Its third outcome is "vectors and complex numbers" (notes 3.1). The guidance lists "Add and
    subtract complex numbers. • Multiply complex numbers in both Cartesian and polar form. •
    Introduce the complex conjugate. • Divide complex numbers in both Cartesian and polar form. •
    Represent complex numbers in all four quadrants of an Argand diagram", noting "the domain of
    principal argument" (notes 3.1). Lessons 2 to 6 cover it. The old unit gave the outcome 14
    hours (notes 3.1). The exact evidence sentences are UNCONFIRMED (notes 3.1).
  - **SQA Electrical Engineering Principles (J6CW 47):** "Analyse RL, RC and RLC electrical
    circuits using complex notation", with phasor diagrams, then AC power and power factor
    improvement (notes 3.3). Lessons 7 and 8 lead into it. Its delivery guidance is UNCONFIRMED
    (notes 3.3).
  - **Pearson BTEC HN Unit 4002 (HNC core):** "Complex Numbers" as a concept, with "Complex numbers
    and resultants", adding sine waves by the vector method and "Leading and lagging circuit
    examples using LRC circuits" (notes 3.4). **Unit 5006 (HND):** polar and exponential forms and
    de Moivre (notes 3.4). Which awarding body your college uses is not known.
  - **MCA:** the Second Engineer Mathematics syllabus has eight headings, none of them complex
    numbers (notes 3.5). Marine Electro-Technology asks for phasors, reactance, impedance triangles,
    phase angle, active and reactive components and power factor (notes 3.5), which a complex
    impedance carries. An HND passed at 50% in each academic subject means "you will not need to
    complete the MCA Second and Chief Engineer academic examinations"; an HNC alone does not (MSN
    1857, notes 3.5). So the college units above are what count. What the MCA's modernised syllabus
    from 2025 says is UNCONFIRMED (notes 3.5).
- **Where it is used (each cited before a lesson uses it).**
  - **j and j² (1):** complex numbers are "useful in a variety of engineering applications,
    especially alternating current circuit analysis" (mathcentre, notes 4.1). SQA's notation line,
    "engineers tend to use j" (notes 3.1). The quadratic with no real roots (Bird, SECONDARY, notes
    5).
  - **The plane and adding (2):** SQA's four quadrants and "addition and subtraction of complex
    numbers" (notes 3.1). MCA "Solves graphical problems involving addition and subtraction of ac
    voltages and currents using phasor method" (notes 3.5). Pearson 4002, "Adding two sine waves
    using vector method" (notes 3.4). Pure resistance and pure reactance on the axes (Electronics
    Tutorials, notes 4.3).
  - **Multiplying (3):** SQA "Multiply complex numbers in both Cartesian and polar form" (notes 3.1).
    Multiplying by j as a rotation, in circuit analysis (Khan, notes 4.2).
  - **The conjugate and dividing (4):** SQA "Introduce the complex conjugate" (notes 3.1). Parallel
    impedances "must be rationalized" (HyperPhysics, notes 4.7).
  - **Polar form (5):** SQA's conversions both ways and the principal argument (notes 3.1). MCA
    "Resolves phasor quantities into active, and reactive components eg I cos 0 and I sin 0" (notes
    3.5). A phasor as magnitude and phase in one complex number (UTK, notes 6.5; Wikipedia,
    SECONDARY, notes 7.1).
  - **Polar multiplying and dividing (6):** SQA "Divide complex numbers in both Cartesian and polar
    form" (notes 3.1). "Multiplication and division of complex numbers is the same as multiplication
    or division of magnitudes and addition or subtraction of angles", from a power-systems text
    (Kirtley, SECONDARY, notes 4.6). Pearson 5006 at HND (notes 3.4).
  - **Impedance (7):** MCA reactance and impedance triangles, and "distinguishes between in phase,
    lagging and leading currents" (notes 3.5). SQA RL, RC and RLC with complex notation (notes 3.3).
    MCA General Engineering Science B, "AC circuits comprising resistance capacitance and
    inductance" (notes 3.5). Pearson 4002's leading and lagging LRC circuits (notes 3.4). Pearson's
    2017 Unit 52, "Application of complex numbers to represent quantities in AC circuits" (SECONDARY,
    notes 7.1).
  - **V = IZ, series and parallel (8):** "Impedances and admittances are also complex numbers, so
    that phasors can be used to visualize the relationship between voltages and currents in a
    network" (MIT 6.061, notes 7.1). Ships at 60 Hz (MIT 6.061, notes 7.1). SQA's RLC analysis and
    phasor diagrams (notes 3.3). Alternators sharing a load at different power factors, an ETO
    certificate question, shows where this leads (SECONDARY, notes 7.1); it is not a puzzle here.
- **The mistakes to catch, each with a puzzle and its own hint.**
  - **Lesson 1, × −1 as a mirror:** students "perceive it as a reflection" rather than a half turn
    (RUME, notes 6.4). The quarter-turn question only makes sense once −1 is a turn, so a DO screen
    asks what a turn done twice gives.
  - **Lesson 1, the sign of a power of j:** errors "in failing to replace √−1 by j as well ignoring
    the sign of the negative numbers and powers of j" (Ahmad and Shahrill, in the Zimbabwe study,
    notes 6.1). A DO screen asks for j³, with −j and +j both offered.
  - **Lesson 1, calculating with √ of a negative:** 60% of the Zimbabwe participants "could not
    figure out the need to use the definition √−𝑎 = 𝑖√𝑎" (notes 6.1), and the Scimath paper says
    i = √−1 "leads to fundamental misconceptions" (notes 6.1). A DO screen asks for j3 × j2, with 6
    offered beside −6. The rule j × j = −1 decides it.
  - **Lesson 1, "imaginary" means not real-world:** the Zimbabwe study found such terms "difficult
    to comprehend" (notes 6.1). Taught as a word to notice, not a counted mistake: the j part of an
    impedance is a reactance you can measure.
  - **Lesson 2, the point is the number:** HELM's tutor's guide asks teachers to "stress that a point
    on the diagram represents a complex number and is not the number itself" (SECONDARY, notes
    4.3). Not a counted mistake; the arrow from 0 is drawn on every screen.
  - **Lesson 3, j × j as +1:** the same sign errors (notes 6.1). A DO screen multiplies (2 + j3)(1 −
    j2) with −4 + j beside 8 − j.
  - **Lessons 3 and 6, algebra without the picture:** teaching that stays in the algebra "results
    in a loss of essential characteristics" (PME-NA, notes 6.4). Each rule is first an arrow move.
  - **Lesson 4, what a conjugate is:** "a complex conjugate of a complex number must have a positive
    and negative number", and "the complex conjugate of √2 is √−2" (Zimbabwe study, notes 6.2). DO
    screens ask for the conjugates of −3 − j2 and of 5.
  - **Lesson 4, a confident wrong method:** "the participants were confident in applying algorithms
    wrongly", and rationalising "was used out of its domain" (Zimbabwe study, notes 6.2). Every
    division ends by multiplying back.
  - **Lesson 5, squaring the j:** students were "squaring 𝑏𝑖 instead of 𝑏" and got a negative
    (Zimbabwe study, notes 6.3); "The norm ... does not include the 𝑖" (MIT, notes 6.3). NZQA found a
    wrong modulus wasted "all consequent evidence in the question" (notes 6.3). A DO screen offers
    √(3² + (j4)²).
  - **Lesson 5, the wrong quarter:** "Much more troublesome was obtaining an angle in the correct
    quadrant" (Pearson examiners, notes 6.3); tan⁻¹ gives the same number for 1 + j and −1 − j
    (Newcastle, notes 6.3). A DO screen gives −1 − j with 45° offered.
  - **Lesson 5, argument or principal argument:** participants "failed to distinguish the argument
    in polar form of a complex number and the principal argument" and did not draw the number
    (Zimbabwe study, notes 6.3). A DO screen gives 270° and asks for it in range.
  - **Lesson 6, phase written two ways:** "+90 o phase shift is equivalent to −270 o phase shift"
    (ModEL, notes 6.5). Taught as a check, not a counted mistake.
  - **Lesson 7, AC as a separate subject:** students "view AC circuit analysis as wholly different
    from DC circuit analysis" (ModEL, notes 6.5). Every rule here is shown beside its DC twin.
  - **Lesson 7, the reactance without its angle:** "the result provided by your calculator is a
    scalar quantity and not a complex (phasor) quantity" (ModEL, notes 6.5). A DO screen gives
    X_C = 10 Ω and asks for the capacitor's impedance, with +j10 offered beside −j10.
  - **Lesson 7, Z as a phasor:** Z is a complex impedance, "Not a phasor" (Oregon State, notes 4.7).
    Taught as one sentence and a check, not a counted mistake.
  - **Lesson 8, a phase on its own:** "it is the difference between phase angles that is important"
    (Kirtley, SECONDARY, notes 6.5), and "A single AC waveform ... cannot have a phase value at all"
    (ModEL, notes 6.5). A DO screen asks what the current's −36.87° is measured from.
  - **Not stated as common:** no source counts these, so they are taught as checks (look at the
    picture, multiply back, convert back), not as cited mistakes.
    - Adding lengths instead of arrows: |Z| = R + X.
    - Multiplying the angles in polar form, or adding the lengths.
    - Adding in polar form without converting.
    - Using X_L where X_L − X_C belongs.
    - Taking power factor as sin φ.
- **Size and cost.** 8 lessons of about 12 screens on the agreed settings.
  - The last six measured courses ran about 0.99M to 1.14M tokens a lesson
    (docs/plans/foundational-maths-roadmap.md). The pictures here are linked arrows on a plane,
    turning arcs and a phasor diagram that follows a circuit, close to Trigonometry's, so I estimate
    about 1.1M to 1.25M a lesson.
  - That is about 8.8M to 10M for the course, plus about 0.3M for the plan. The research is done
    (202 quotes from 69 saved tool results).
  - The full process measured on Fractions lessons 4 to 8 was about 1.65M a lesson, about 13.2M for
    eight.
  - Each build's real cost is reported to you.
- **Lesson 1 first.** Lesson 1 is built and checked before the others (about 1.15M, plus the plan).
  Because you asked for the folder in one push, the rest follow without waiting for you to try it.
- **Gaps to close at build time.** None blocks the build.
  - Brilliant's lesson contents were not seen, only its level and lesson titles (UNCONFIRMED, notes
    1.1).
  - SQA EM1's exact evidence sentences, its 40-hour length and entry line, and Electrical Engineering
    Principles' delivery guidance were read but fall outside the checker's view (UNCONFIRMED, notes
    3.1, 3.3, 5). The brief cites only the checked lines.
  - The MCA's modernised syllabus contents, and whether any MCA paper is called "Applied
    Mathematics", are UNCONFIRMED (notes 3.5).
  - **Lesson 1:** the √a × √b slip is computed from the rule, not quoted. The Scimath paper warns in
    general terms only (notes 6.1).
  - **Lesson 7:** X_L = 2πfL is quoted only from Bird's SECONDARY copy, and X_C = 1/(2πfC) only
    through Rose-Hulman's −j/ωC (notes 4.7). The research stage must cite both in a primary text
    before the lesson states them. ModEL's line covers the resistor's 0° only; the coil's +90° and
    the capacitor's −90° come from the j and −j in Rose-Hulman's impedances (notes 4.7). The reason
    told with v = L di/dt is my reading, from Calculus fundamentals lesson 5; the research stage
    must cite a source that ties the 90° to it.
  - **Lesson 8:** the formula 1/Z = 1/Z₁ + 1/Z₂ is not quoted; MIT says the rules are "exactly the
    same as those for resistance" (notes 4.7), and product over sum is computed from it. The 60 Hz
    line is MIT's own phrase, "In North America, most ships at sea and eastern Japan that frequency
    is 60 Hz" (notes 7.1), so the lesson says "MIT's notes say most ships run at 60 Hz", not that
    every ship does. 230 V, 8 Ω, j6 Ω and −j10 Ω are example figures; every answer is computed
    from the rule on screen.
  - No study of how students learn impedance with complex numbers was found beyond ModEL's teaching
    notes (notes 6.5). The pictures for lessons 7 and 8 lean on the arrow ideas lessons 2 to 6
    built.
