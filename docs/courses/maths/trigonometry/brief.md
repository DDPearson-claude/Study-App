# Trigonometry: the course brief

Written 18 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
the eighth course in the Maths shelf's Algebra folder, "Sine, cosine and tangent, from triangles to
waves: AC, phasors and conduit bends." It comes after Exponentials and logarithms and before Complex
numbers. You asked for the whole Algebra folder in one push (17 Oct), so I have taken the decisions
for you and listed them below; change any you like. Sources and quotes are in `research-notes.md`
beside this file (178 quotes, cut by script from the 43 saved tool results and checked with
`tools/eval/sources.mjs`, `failed: 0`; section numbers below point there).

## The short version
**Eight lessons**
1. Sides in proportion: sin, cos and tan (built first)
2. Finding angles, and splitting a force
3. Round the circle: any angle
4. Triangles without a right angle
5. Radians: angle as arc over radius
6. From circle to wave
7. Adding waves with phasors
8. Power factor as a cosine

**The main pictures** (one per lesson, each moved with your finger):
- **The growing triangle (lesson 1).** A right-angled triangle with two handles, one for its size
  and one for its angle. Drag the size and every side grows, but the readouts opposite ÷ hypotenuse
  and adjacent ÷ hypotenuse do not move. Drag the angle and they change. The ratio belongs to the
  angle, not to the triangle.
- **The arrow and its shadows (lesson 2).** A force arrow of fixed length that you turn. Its shadow
  on the floor and its shadow on the wall are drawn as the two short sides of a triangle, labelled
  F cos θ and F sin θ. Run it backwards: drag the two shadows and the angle reads out by the inverse
  key.
- **The turning arm (lesson 3).** An arm of length 1 turning round a circle. The point at its tip is
  (cos θ, sin θ). The triangle under the arm flips into each quarter with its sides signed, and a
  readout adds the two squares, which always make 1.
- **The hinge (lesson 4).** Two arms of fixed length joined by a hinge you open. The third side
  closes the triangle. Its length is shown beside Pythagoras' answer and the correction −2ab cos C,
  which is zero at 90°, takes away below it and adds above it.
- **Wrap the radius (lesson 5).** A circle with its radius lifted off as a bendy rod and laid
  around the edge. Drag the angle and count the arc in radius-lengths. Resize the circle and the
  count does not change.
- **The arm and its wave (lesson 6).** The turning arm from lesson 3 on the left. Its height is
  carried across and traced against time on the right, drawing the sine wave. Sliders set the arm's
  length (amplitude), its speed (frequency, and ω) and where it starts (phase).
- **Two arrows, one sum (lesson 7).** Two arrows turning together at the same speed, drawn tip to
  tail, and the arrow that joins start to finish. Under them, the two waves and their sum. At every
  instant the sum's height is the two heights added. Switch one arrow to a different speed and the
  sum stops being one steady arrow.
- **The power triangle (lesson 8).** Drag the angle φ between the voltage and the current. The
  hypotenuse is the apparent power, the adjacent side the true power, so power factor is cos φ. A
  bar beside it shows the current needed for the same true power, which grows as cos φ falls.

**Decisions taken for you** (say if you want any changed):
- **Eight lessons.** Brilliant's Trigonometric Functions is 70 lessons in 14 levels (notes 1.1, 1.2),
  Khan's course is four units (notes 2.1), HELM's Workbook 4 is five sections in 77 pages (notes 2.3,
  8), and Bird gives trigonometry six chapters, with adding waveforms later (notes 2.4). The research
  suggests eight, with a ninth possible (notes 8). Seven is possible by joining lessons 1 and 2. It
  would save about 1.15M tokens, but finding angles and resolving forces would get three or four
  screens, and both are MCA lines (notes 3.3). Nine is possible by adding compound-angle formulae as
  their own lesson (see "Left out" below).
- **Lesson 1 is built first, without a pause.** The runbook asks for a pilot you try before the
  rest. You asked for the folder in one push, so lesson 1 is built and checked first, and the others
  follow without waiting. You can try it on your phone as soon as it lands.
- **Steps lessons, with a little more explaining ("Partly", RUNBOOK section 0, item 3).** About 12
  screens each, SHOW then DO, ending on two or three mixed puzzles. SHOW screens may carry a short
  paragraph where an idea needs words: why the ratio is fixed, why the cosine rule has a minus sign,
  why a radian has no unit, why adding arrows adds waves. Every lesson still has a picture you move,
  and the words stay short where the picture carries it.
- **Triangles first, then the circle.** Everyone except Brilliant starts from right-angled triangles
  (notes 2.4). The evidence on the order is mixed (notes 6.1): one study summary found students taught
  by ratios better at naming the functions (SECONDARY), and Weber's group, who built the circle
  themselves, could justify its properties and estimate values for odd angles such as 40° (SECONDARY
  report, notes 6.1). So the triangle comes first, because conduit, slopes and forces need it at
  once, and lesson 3 has you build the circle from the triangle rather than handing it over.
- **The sine and cosine rules come after the circle, not straight after the triangles.** The
  research's suggested order put them sixth (notes 8). I moved them to lesson 4, after the circle,
  following HELM, whose order is right-angled triangles, any angle, identities, then triangles, then
  waves (notes 2.3). The cosine rule with an obtuse angle needs the cosine of an angle past 90°, and
  "The negative value of cos 110 also led to errors" (Cambridge examiners, notes 6.2). Lesson 3 gives
  you that first. The sine rule's ambiguous case is lesson 3's "two angles with the same sine".
- **Radians come right before the wave.** A wave's ω is in radians a second, so lesson 5 sits
  between the rules and the wave. It is taught as arc length over radius, the way Moore designs it
  (notes 4.3), not as "180° = π" alone. Students "do not regard the radian as a unit of angle
  measure" (Moore 2013, reported, SECONDARY, notes 6.1), and Orhun found radian measure
  "inadequate" (notes 6.1).
- **Angles are taught properly, inline.** Geometry fundamentals left them for this course (notes 5).
  Lesson 1 opens with a turn of 360°, a triangle's 180°, acute, right, obtuse and complementary
  angles. Lesson 3 adds reflex and supplementary angles. These are MCA lines 5.1.2 and 5.1.3
  (notes 3.3).
- **SOH CAH TOA comes after the reason, as a memory aid.** The ratio is first a fixed fraction you
  watch stay put (lesson 1's picture). The three words come on the screen after, as a way to
  remember which sides, not as the lesson.
- **All six ratios, but three are one screen.** The MCA asks you to define "Sine, Cosine, Tangent,
  Secant, Cosecant, Cotangent and the relationships between them" (5.1.4, notes 3.3), and Khan has
  "Reciprocal trig ratios" (notes 2.1). Lesson 1's conduit multiplier is 1 ÷ sin θ, the cosecant
  (SECONDARY, notes 7.1), so lesson 2 names cosec, sec and cot on one screen and moves on.
- **"sin⁻¹" is read "inverse sine", never "one over sine".** The Functions course read f⁻¹ as
  "f inverse" (notes 5). Here it matters twice: sin⁻¹ undoes sin to find an angle, and the conduit
  multiplier 1 ÷ sin θ is a different thing. One DO screen puts them side by side.
- **Exact values from two triangles you can rebuild.** Half a square gives 45°, half an equilateral
  triangle gives 30° and 60° (Cognito, SECONDARY, notes 4.2), and Bitesize says they must be recalled
  for work without a calculator (notes 4.2). They are surds, which you have from Powers and roots.
  1/√2 stays as 1/√2, because Powers and roots left rationalising out (notes 4.2). Lesson 7 reuses
  sin 60° = √3/2 for three-phase.
- **Simple trig equations get two screens, not a lesson.** SQA's HN unit H7K0 33 hopes learners can
  "solve simple trigonometric equations" on entry and sets "two problems (one in degrees and one in
  radians)" (notes 3.1). So lesson 3 finds both angles from 0° to 360° with a given sine (MCA 5.1.8,
  notes 3.3), and lesson 6 finds the two times in a cycle for the SQA's own example, 10 sin 100πt =
  −8.3 (notes 3.1). The full general solution waits for college.
- **sin² θ + cos² θ = 1 is Pythagoras on the turning arm.** It is shown, not just stated: the arm is
  the hypotenuse, length 1, and its two shadows are cos θ and sin θ (my reading, notes 4.6). sin² θ
  means (sin θ)², said once (notes 5).
- **Phasors are turning arrows drawn to peak length, and the rms habit is named.** Two sources
  disagree. Electronics Tutorials says a phasor's length "represents the RMS value", while UNSW says
  rms diagrams "have the same shape ... scaled by a factor of 0.71" (notes 6.3). Lessons 6 and 7 draw
  the arrow at peak length, because its height is the wave. One screen in lesson 7 says many
  electrical texts draw it at rms, same shape, smaller, and each example says which it uses. Lesson 8
  uses rms, which you have from Calculus fundamentals lesson 10.
- **Phasors are added by their parts.** Each arrow is split into a floor part and a wall part, as in
  lesson 2. The parts add, and Pythagoras and inverse tan give the sum's size and phase. This is
  the graphical phasor method the MCA asks for (notes 3.3) and HELM's "amplitude/phase form" without
  any complex numbers (notes 2.3, 4.7). The cosine rule from lesson 4 is a check for two arrows.
- **Three-phase √3 is in lesson 7.** Three voltages 120° apart (notes 7.3). The line voltage is the
  difference of two phase arrows, which closes a triangle with a 30° angle (Fiore, SECONDARY, notes
  7.3). It is lesson 2's exact values at work. "The difference between them is not twice either one"
  (ElectronicsInfoline, SECONDARY, notes 7.3).
- **Conduit numbers are worked from the triangle, and the tables are taught as rounded.** The
  multiplier is 1 ÷ sin θ (conduitbending.com, SECONDARY, notes 7.1). Two tables disagree at 10°
  (5.759 against 6.0) and on shrink at 30° (1/4 in against 3/16 in), and the method "doesn't account
  for the arc of the bend" (notes 6.3, 7.1). So the lesson computes the multiplier from the rule
  shown, calls shrink "a common field allowance, not a code rule" (EleCalculator, SECONDARY, notes
  7.1), and leaves stub deduct out, because it "is bender-specific" (notes 7.1). The sources work in
  inches; the puzzles use example figures in millimetres.
- **The crank and conrod is one puzzle, labelled as a reach.** It is a triangle without a right
  angle that every engine has (EPI, notes 7.6), but no HN or MCA line names it (UNCONFIRMED, notes
  7.6). Lesson 4 has one sine-rule puzzle on it with example figures computed from the rule shown.
  The FIRGELLI page's own numbers do not add up, so none is taken from it (notes 6.3).
- **Taught inline, because you have not met them** (notes 5): angles and their names; similar
  triangles as the bridge to the ratio; naming sides from the angle; the calculator's degree and
  radian modes; sin⁻¹ as an inverse; sin² θ; exact values; signs by quarter of the circle; rev/min to
  rad/s; phase, leading and lagging.
- **Left for later courses, with a one-line look ahead where it fits:**
  - **Complex numbers:** a phasor written as a complex number, the j operator, impedance and the
    polar form. Bird puts adding waveforms by complex numbers after the complex numbers chapters
    (notes 2.4), and HELM keeps Complex Numbers as its own workbook 10 (notes 2.3). Lesson 7's last
    screen says that splitting an arrow into a floor part and a wall part is exactly what a complex
    number keeps track of, and points there.
  - **Derivatives** (Advanced maths): the derivatives of sin and cos. The Calculus fundamentals brief
    left them until radians had been taught. Lesson 5 says radians are the reason they work, in one
    line.
- **Left out, not deferred:**
  - **Compound-angle formulae as algebra.** Pearson's merit criterion asks to "Use compound angle
    identities to combine individual sine waves into a single wave, and illustrate graphically"
    (notes 3.2), and the cadet syllabus review keeps "Compound angle formulae" (notes 3.3). Lesson 7
    combines the waves with arrows, which is the "illustrate graphically" half. If your college
    teaches the formulae, they are the one thing to add, as a ninth lesson.
  - **The area of a triangle as ½ab sin C, and bearings as a topic.** Bitesize National 5 has both
    (notes 2.2); no HN or MCA line for either was found. HELM's two ships (notes 4.4) appear as a
    cosine-rule puzzle, with the angle given.
  - **Perpendicular lines.** Straight-line graphs left them here "if wanted" (notes 5). No MCA or HN
    line asks for them, so they stay out.
  - **Graphs of sec, cosec and cot, inverse trig graphs, double angles and other identities.**
    Brilliant level 13 and HELM 4.3 have more (notes 1.2, 2.3); the MCA list stops at the six ratios,
    the rules, and the graphs of a sin mx + b cos nx and a tan mx (notes 3.3).
- **Example numbers are labelled.** Cited values are named with their source: the multipliers 2.0
  at 30° and 1.414 at 45° (SECONDARY, notes 7.1); HELM's two ships, 48 and 40 nautical miles at 113°,
  73.5 nautical miles apart (notes 4.4); Bird's ship shaft, 400 kN m at 400 rev/min, 16.76 MW (notes
  7.5); OpenStax's 10 sin 120πt and LibreTexts' 4 sin(2π5t) (SECONDARY, notes 4.5); the motor drawing
  2.7 A on 230 V with 450 W (SECONDARY, notes 7.2); ORNL's 45° and 0.7071 (notes 7.2); 230 V a phase
  giving about 400 V a line (SECONDARY, notes 7.3); a ship's 440 V three-phase supply (a college notes
  PDF, SECONDARY, notes 7.3). Values computed from a rule are recomputed on screen (notes 10). Every
  other length, force, angle and voltage is an example figure, said so on screen.
- **Colour as before.** Ink for triangles, arms, arrows, waves and controls. A side or a part that
  is negative is drawn dashed, not red, because it is not a mistake. Amber for key terms, teal for
  small labels (opposite, adjacent, hypotenuse, units), red only for a slip, green only for finished.
  In lesson 7 the two arrows are solid and dashed ink and the sum is bold, so no colour is spent on
  telling them apart.
- **Your intake answers** (`intake.json`): to understand trigonometry and how to work with it; on the
  job and in everyday life; hands-on, with the why explained in full.

## 1. The overall topic
Trigonometry starts with one fact: in right-angled triangles with the same angle, the sides keep
the same proportions, however big the triangle is. So an angle fixes three ratios of sides, called
sine, cosine and tangent. With them you can find a side from an angle (how long the conduit between
two bends must be) or an angle from two sides (how steep a slope is), and split a force into the part
along the floor and the part up the wall.

Then the triangle goes round a circle. An arm turning round a circle carries the triangle into every
angle, so sine and cosine work past 90° and turn negative. The sine and cosine rules then solve any
triangle, with or without a right angle. Measuring the turn in radius-lengths of arc gives the
radian, the angle unit that rotating machines and AC use. Trace the turning arm's height against time
and you have the sine wave: its amplitude, frequency, ω = 2πf and phase are the arm's length, speed
and starting angle. Two waves of the same frequency add by adding their arrows, which are called
phasors. It ends on power factor, which is the cosine of the angle between voltage and current.

**It builds on:**
- **Geometry fundamentals:** Pythagoras (lessons 4 and 5), the circle's circumference 2πr (lesson
  2), and scaling (lesson 3). It left angles and arc length for this course (notes 5).
- **Proportional reasoning and Fractions:** ratios that stay the same when both parts scale. A trig
  ratio is one.
- **Solving equations and Linear equations:** rearranging a formula. Finding a hypotenuse is
  rearranging sin θ = opp ÷ hyp, and the most common slip is multiplying where you should divide
  (notes 6.1).
- **Straight-line graphs:** gradient as rise over run (lesson 1), with a vertical line's gradient
  undefined, and distance as √(run² + rise²) (lesson 2). It left "the angle a line makes, m = tan θ"
  to this course (notes 4.1, 5).
- **Functions and their graphs:** the inverse as a machine run backwards (lesson 8), and shifting
  and stretching a graph (lessons 5 and 6), whose last screen previewed an AC wave with a peak, an
  offset and a phase (notes 4.5, 5).
- **Powers and roots:** squares, square roots and surds, for exact values and the cosine rule.
- **Quadratics and polynomials:** it left "splitting a launch into components" to here (notes 5).
- **The coordinate plane:** points (x, y), for the turning arm's tip (cos θ, sin θ).
- **Calculus fundamentals:** RMS as peak ÷ √2 (lesson 10), used in lesson 8.

**Not taught again:** Pythagoras, the circumference of a circle, rearranging formulas, gradient and
distance between two points, the inverse function, shifting and stretching a graph, square roots and
surds, RMS. Each is used with a one-line reminder, and only what is new is taught.

**Edges.** Angles in degrees and radians, triangles of any shape, waves of one frequency at a time
or two of the same frequency added. No complex numbers, no calculus of sine, no compound-angle
algebra, no general solutions of trig equations.

## 2. The lessons, in the order they build
The order follows HELM (notes 2.3) and the research's core (notes 8), with the rules moved after the
circle and radians moved before the wave, as above. Bitesize, HELM and Bird all do the rules before
waves (notes 2.4).

| # | Lesson | What it teaches |
|---|---|---|
| 1 | Sides in proportion: sin, cos and tan | Angles inline: a turn is 360°, a triangle's angles make 180°, acute, right, obtuse, complementary (MCA 5.1.2, 5.1.3, notes 3.3, 5). Similar triangles have their sides "in the same proportion" (Bitesize, notes 4.1), so "the adjacent side divided by the hypotenuse will give the same answer no matter how much the triangle is enlarged" (Bitesize, notes 4.1; Khan builds the ratio from similarity, notes 2.1). The sides are named from the angle you are using (Khan, notes 4.1). sin, cos and tan as the three ratios, then SOH CAH TOA as the memory aid. "Trigonometric ratios show how long one side of the triangle is compared to another" (Bitesize, notes 4.1). The calculator in degree mode (Bitesize, notes 6.2). cos 30° is one number, not "cos times 30" (Lamar, notes 6.2). Find a side: label, choose the ratio, calculate (Bitesize, notes 4.1). The hypotenuse needs a divide (notes 6.1). Pythagoras when there are three sides and no angle, trigonometry when there are two sides and an angle (Bitesize, notes 4.1). The conduit offset: the travel between bends is the hypotenuse, offset ÷ sin θ, so the multiplier is 1 ÷ sin θ, 2.0 at 30° and 1.414 at 45° (conduitbending.com, SECONDARY, notes 7.1, 10). |
| 2 | Finding angles, and splitting a force | The inverse key finds the angle: "An inverse function takes the output and does the opposite to get back to the input" (Bitesize, notes 4.1), read "inverse sine" (notes 5). You only need it for an angle; a side is found by rearranging (Cognito, SECONDARY, notes 6.2). Choose the ratio from the two sides you have, mixed so you have to choose (notes 6.4). The angle of a slope: a line y = mx + c makes an angle with tan θ = m (Sheffield, notes 4.1), left here by Straight-line graphs. Exact values from half a square and half an equilateral triangle (Cognito, SECONDARY; Bitesize, notes 4.2). Cosec, sec and cot on one screen (MCA 5.1.4, Khan, notes 2.1, 3.3), and the multiplier 1 ÷ sin θ is cosec θ, not sin⁻¹ θ. Resolve a force into horizontal and vertical parts, F cos θ and F sin θ, "restricted to the first quadrant" (MCA GES I, notes 3.3), on a slope (MCA Applied Mechanics, notes 3.3), and a launch split into its two parts (Quadratics, notes 5). Conduit shrink as the hypotenuse minus the run, 0.268 per unit of offset at 30° from the triangle, against field tables of 1/4 and 3/16 (notes 6.3, 7.1, 10). Do not round in the middle (Cambridge examiners, notes 6.2). |
| 3 | Round the circle: any angle | An arm of length 1 turns from the positive x-axis. Its tip is (cos θ, sin θ): cosine across, sine up (Brilliant's "dynamic unit circle", notes 1.3; Khan unit 2, notes 2.1). For acute angles this is lesson 1's triangle with a hypotenuse of 1. Past 90° the same rule gives negative values: "Sine, cosine and tangent all have different positive or negative values depending on what quadrant they are in" (Bitesize N5, notes 2.2). Reflex and supplementary angles (MCA 5.1.2, 5.1.3, notes 3.3). sin(180° − θ) = sin θ, so a level line at sin = 0.5 meets the circle twice: both angles from 0° to 360° with a given sine (MCA 5.1.8, notes 3.3; SQA N5 "use symmetry ... to find further solutions", notes 2.2). The calculator's sin⁻¹ gives only one of them. sin² θ + cos² θ = 1 is Pythagoras on the arm (notes 4.6; Brilliant's "The Pythagorean Identity", notes 1.2), and tan θ = sin θ ÷ cos θ is the arm's slope (Higher Maths, SECONDARY, notes 4.6), undefined at 90° as in Straight-line graphs. |
| 4 | Triangles without a right angle | Right-angle trig on a triangle with no right angle gives a wrong answer (Cambridge examiners, notes 6.2). The cosine rule, for two sides and the angle between, or three sides (Bitesize, HELM, notes 4.4): Pythagoras with a correction, −2ab cos C, which is zero at 90°. Past 90° the cosine is negative, so the correction adds (Cambridge, notes 6.2, and lesson 3). Work it in order, square, square, the product with its cosine, then take away; do not take away first (Cambridge, notes 6.2). Rearranged for an angle, a "Maths ERROR" means the subtraction is the wrong way round (Save My Exams, SECONDARY, notes 6.2). The sine rule, for "two angles and one side" or "two sides and an angle opposite one of those two sides" (HELM, notes 4.4), shown by dropping a height. The ambiguous case: "sometimes there are two possible answers", the second being 180° minus the first (Bitesize, notes 4.4), which is lesson 3's two angles. Which rule from the data you are given (Bitesize N5, notes 4.4), and plain right-angle trig when that is all you need (Cambridge, notes 6.2). HELM's two ships, 73.5 nautical miles apart (notes 4.4, 10). One labelled puzzle on a crank and conrod (EPI, notes 7.6). |
| 5 | Radians: angle as arc over radius | "One radian is the measure of the central angle of a circle that intercepts an arc equal in length to the radius" (Pearson, notes 4.3). A radian counts "radius lengths" of arc (Moore, notes 4.3), so it is the same on any circle, and it has no unit because it is "the ratio of two lengths" (OpenStax, notes 7.5). A whole turn is 2π radians, about 6.28 radius-lengths, not one radian (Williams, SECONDARY, notes 6.1). 180° = π radians (HELM, notes 4.3), so 1 radian is about 57.3° (notes 10). Arc length is the angle in radians times the radius, from the definition. Convert both ways (MCA 5.1.1, GES I 1.4, SQA H7K0 33, notes 3.1, 3.3). The calculator in radian mode: cos 10 is −0.839 in radians and 0.985 in degrees (Lamar, notes 6.2, 10). No degree sign means radians (SQA Higher, notes 2.2). rev/min to rad/s, × 2π ÷ 60 (MTU, Mississippi State, notes 7.5). Shaft power P = ωT: Bird's ship shaft, 400 kN m at 400 rev/min, 16.76 MW (notes 7.5, 10). One line: radians are why the derivatives of sin and cos work, for Derivatives. |
| 6 | From circle to wave | Turn lesson 3's arm steadily and trace its height against time: "the projection of the rotating arrow onto the vertical axis" is the wave (OpenStax via LibreTexts, SECONDARY; UNSW, notes 4.5). The arm's length is the amplitude, one turn is one period, turns a second is the frequency in hertz, and the arm's speed in radians a second is ω = 2πf, so A sin(ωt) = A sin(2πft) (Electronics Tutorials, notes 4.5). Read e = E_max sin 2πft (MCA, notes 3.3), 10 sin 120πt with ω = 120π rad/s (OpenStax, SECONDARY, notes 4.5), and 4 sin(2π5t), 4 V peak at 5 Hz (LibreTexts, SECONDARY, notes 4.5). 50 Hz is 314.16 rad/s and 60 Hz is 376.99 rad/s (notes 10). The cosine wave is the arm's shadow across, the sine wave started a quarter turn early: cos ωt = sin(ωt + π/2) (OpenStax, SECONDARY, notes 4.5). Phase is the arm's starting angle; "+ if leading and drawn to the left, − if lagging and drawn to the right" (Fiore, SECONDARY, notes 4.5). Amplitude, midline and phase are Functions' stretch and shift, now with sin (notes 4.5). The two times in a cycle when 10 sin 100πt = −8.3 (SQA, notes 3.1). The tangent's graph on one screen (HELM 4.2, MCA 4.1.17, notes 2.3, 3.3). |
| 7 | Adding waves with phasors | A phasor is the turning arrow, frozen at t = 0 (MCA "Explains the term phasor quantity", notes 3.3). Phasors turn anticlockwise; ahead of the reference is leading, behind is lagging (Electronics Tutorials, notes 4.7). Two waves of one frequency add by adding their arrows, because "the sum of the y projections of the component phasors, is just the y projection of the sum" (UNSW, notes 4.7). Add by parts: split each arrow as in lesson 2, add the floor parts and the wall parts, then Pythagoras for the size and inverse tan for the phase (HELM's "amplitude/phase form", notes 4.7). The cosine rule from lesson 4 as a check. Different frequencies cannot share a diagram (Electronics Tutorials, notes 4.7). Peak or rms length, taught as contested (notes 6.3). Three-phase: three equal voltages 120° apart (MTU, UNSW, notes 7.3). The line voltage is the difference of two phase arrows, twice the phase voltage times sin 60°, so √3 times it (SECONDARY, notes 7.3): 230 V gives about 398 V, and a ship's 440 V line is about 254 V a phase (notes 7.3, 10). Last screen: an arrow's two parts are what Complex numbers writes as one number. |
| 8 | Power factor as a cosine | True power and apparent power "form the adjacent and hypotenuse sides of a right triangle", so power factor "is also equal to the cosine of that phase angle" (All About Circuits, notes 4.8); pf = kW ÷ kVA = cos φ (ORNL, notes 4.8). The angle is the phase angle between voltage and current from lessons 6 and 7 (Mustansiriyah, SECONDARY, notes 7.2), with lagging and leading (MCA, notes 3.3). 45° lagging gives 0.7071 (ORNL, notes 7.2). The motor drawing 2.7 A on 230 V with 450 W has a power factor of 0.725 and an angle of 43.6° (Electrical A2Z, SECONDARY, notes 7.2, 10). A lower power factor needs more current for the same true power: 10 kW on 230 V takes 43.5 A at 1, 72.5 A at 0.6 and about 54.3 A at 0.8 (notes 7.2, 10; the page prints 54.5). Draw the phasor diagram and calculate the power factor (MCA, notes 3.3). The last screens are a mixed set from the whole course, where you choose the tool first: right-angle trig, a rule, radians, or arrows (Rohrer, notes 6.4; Cambridge, notes 6.2). |

## 3. Can it be taught mostly visually, through interaction?
**Partly** (RUNBOOK section 0, item 3). Every lesson is a steps lesson of about 12 screens, SHOW then
DO, ending on two or three mixed puzzles. SHOW screens can carry a short paragraph where the idea
needs words. Each lesson has one main picture you move with your finger, chosen because it shows the
cause, not just the answer:
- **Lesson 1, the growing triangle.** A right-angled triangle, its angle θ marked at the bottom left,
  with a size handle on the far corner and an angle handle on the top. Teal labels name the sides
  from θ: opposite, adjacent, hypotenuse. Readouts show the three ratios to three places. Drag the
  size handle and the triangle grows, its sides' lengths change, and the ratios do not. Drag the
  angle and they do. A switch moves θ to the other corner and the labels swap. Later cards turn the
  triangle into a conduit offset: the offset is the opposite side, the travel between bends is the
  hypotenuse, and the multiplier reads 1 ÷ sin θ. *Why:* the cause of trigonometry is that "the
  adjacent side divided by the hypotenuse will give the same answer no matter how much the triangle
  is enlarged" (Bitesize, notes 4.1). Khan builds the ratio the same way, "Using similarity to
  estimate ratio between side lengths" (notes 2.1). Weber's comparison group "were unable to
  construct geometric objects to help them deal with trigonometric situations" (SECONDARY report,
  notes 6.1), so the triangle is something you make and stretch, not a fixed drawing. The angle
  switch is for naming sides from the angle in use (Khan, notes 4.1).
- **Lesson 2, the arrow and its shadows.** A force arrow of fixed length F from the corner of a
  floor and a wall. Turn it with your finger. Its shadow on the floor and its shadow up the wall are
  drawn as the triangle's two short sides, labelled F cos θ and F sin θ with their values. Then a
  switch runs it backwards: drag the two shadows to set their lengths, and the arrow swings to fit,
  with θ read out as tan⁻¹(wall ÷ floor). A tilt handle turns the floor into a slope, for a block
  on an incline. *Why:* the MCA asks you to "Resolve forces in horizontal and vertical components"
  and "Resolves vectors into mutually perpendicular components" (notes 3.3), and the shadows are
  those components, so the cause (the parts are the triangle's sides) is what you move. Running it
  backwards is the inverse, which "takes the output and does the opposite to get back to the input"
  (Bitesize, notes 4.1). The same picture comes back in lesson 7, where the arrows are phasors.
- **Lesson 3, the turning arm.** A circle of radius 1 on axes. Drag the arm's tip round. Dashed
  lines drop from the tip to each axis and read cos θ across and sin θ up, with their signs. The
  triangle under the arm is drawn in whichever quarter the arm is in. A readout shows cos² θ +
  sin² θ = 1 at every angle. A level line you drag up and down meets the circle at two points: two
  angles with the same sine. *Why:* Brilliant teaches with "a dynamic unit circle" (notes 1.3), and
  Weber's experimental group, who built these properties themselves, "were able to justify the
  properties of these functions and to estimate their values for atypical angle measures such as
  40°" (SECONDARY report, notes 6.1). Some students "incorrectly identified the x-coordinate as the
  sine ratio" (Williams, SECONDARY, notes 6.1), so the two readouts sit on their own axes, sine up
  and cosine across. The level line is SQA's "use symmetry ... to find further solutions" (notes
  2.2) and gets lesson 4's ambiguous case ready. Negative values come from the arm, not from a rule
  of signs to learn, for the Cambridge slip with cos 110° (notes 6.2).
- **Lesson 4, the hinge.** Two arms of lengths a and b, joined at a hinge with angle C. Open and
  close the hinge; the third side c stretches between their ends. Three bars show a² + b², the
  correction −2ab cos C, and c². At 90° the correction bar is empty and Pythagoras is exact. Close
  the hinge and the correction takes away; open it past 90° and it adds, because the cosine has gone
  negative. A second card is the swing arm for the sine rule: a side of fixed length swings from a
  corner, and for some lengths it lands on the base line in two places, both triangles shown.
  *Why:* the cosine rule is for "two sides of the triangle ... together with the angle between these
  two sides" (HELM, notes 4.4), and the hinge is exactly that data. Seeing the correction as a bar
  answers the Cambridge examiners' slips, "omitting the 2, replacing the – with +", and evaluating
  a² + b² − 2ab before multiplying by the cosine (notes 6.2). The swing arm is the ambiguous case,
  "sometimes there are two possible answers" (Bitesize, notes 4.4), drawn so you can see both.
- **Lesson 5, wrap the radius.** A circle with its radius drawn as a bendy rod. Drag the angle open
  and the rod is laid round the edge again and again, each length numbered, with the part left over
  as a fraction. The readout gives the angle in radius-lengths and in degrees. A size handle grows
  the circle; the count stays the same. Wrap it all the way round and the count reads 6.28, which is
  2π. A last card spins a shaft: rev/min in, rad/s out. *Why:* this is Moore's design, a radian as
  "the ratio of a linear measurement of arc-length to the length of a radius, giving a number of
  radius lengths" (notes 4.3), and his applets "supported students understanding of angle measure as
  a subtended arc-length's fraction" (SECONDARY report, notes 6.1). Resizing shows why the radian has
  no unit, a ratio "of two lengths" (OpenStax, notes 7.5). The full wrap answers "the whole unit
  circle was equal to one radian" (Williams, SECONDARY, notes 6.1).
- **Lesson 6, the arm and its wave.** Lesson 3's arm on the left, turning. A dashed line carries the
  tip's height across to a graph of height against time on the right, where it draws the wave as it
  goes. Sliders: the arm's length (the wave's peak), its speed (turns a second, with ω in rad/s
  beside it), and its starting angle (the wave slides left or right). A pause button freezes it at
  any instant to read the height. A switch traces the arm's across shadow instead, which draws the
  cosine wave. *Why:* "the projection of the rotating arrow onto the vertical axis is ... the
  instantaneous current" (OpenStax via LibreTexts, SECONDARY, notes 4.5), and "the vertical component
  ... gives us v(t)" (UNSW, notes 4.5). Moore found that seeing "how a changing arc-length relates to
  the changes of vertical distance" is "a keystone in developing an understanding of the sine
  function" (SECONDARY report, notes 6.1). The sliders are the features SQA says you sketch from,
  "amplitude, period, phase" (notes 2.2), and the cadet syllabus review asks for "graphical
  representation of waves" (notes 3.3).
- **Lesson 7, two arrows, one sum.** Two arrows from the centre, turning together, the second
  drawn dashed. A third, bold arrow runs from the start of the first to the tip of the second when
  they are laid tip to tail. Drag each arrow's length and angle. Below, the two waves and the sum's
  wave; a pause shows the two heights stacked to make the sum's height. A parts switch shows each
  arrow's floor and wall parts, as in lesson 2, and the sums of the parts. A speed switch sets the
  second arrow turning faster; the sum arrow now changes length as it goes, and the sum's wave is no
  longer a clean sine. A three-phase card: three 230 V arrows 120° apart, and the line voltage as the
  arrow between two tips. *Why:* "v(t), the sum of the y projections of the component phasors, is
  just the y projection of the sum of the component phasors" (UNSW, notes 4.7). That is the cause,
  and pausing shows it at one instant. SQA suggests "software displays involving addition ... of two
  waves" (notes 2.2), and the MCA asks for "addition and subtraction of ac voltages and currents
  using phasor method" (notes 3.3). The speed switch shows why "Sinusoids of different frequencies
  cannot be represented on the same phasor diagram" (Electronics Tutorials, notes 4.7). No study of
  how students learn phasors was found (UNCONFIRMED, notes 9), so the picture leans on the projection
  idea that lessons 3 and 6 built.
- **Lesson 8, the power triangle.** The voltage and current arrows from lesson 7, with the angle φ
  between them, and beside them a right-angled triangle: hypotenuse the apparent power V × I in kVA,
  adjacent side the true power in kW, opposite side the reactive power. Drag φ. The adjacent side
  shrinks as cos φ, and the power factor reads out. A switch fixes the true power instead: drag φ
  and the current bar grows, so a poor power factor means more current in the cables for the same
  work. Cards: the 2.7 A motor, and the 10 kW load at 0.6 and 0.8. *Why:* "Because true power and
  apparent power form the adjacent and hypotenuse sides of a right triangle, respectively, the power
  factor ratio is also equal to the cosine of that phase angle" (All About Circuits, notes 4.8). The
  triangle is lesson 1's, so power factor is a cosine you already own. The current bar shows the
  cause of the A2Z figures (notes 7.2): the current must grow to keep the adjacent side the same.

## 4. What else
- **Benchmark (notes 1 and 2).**
  - **Brilliant Trigonometric Functions** (70 lessons, 14 levels; seen earlier at 62 lessons). It
    starts with periodic functions and circular motion, reaches the right triangle at level 4 and
    radians at levels 5 to 7, then graphs, tangent, transforming waves, functions of time,
    equations, inverses and combining functions (notes 1.1, 1.2). Lessons 3, 5 and 6 here cover its
    levels 1 to 8 and 10. There is no sine rule, cosine rule, phasor or power factor in its level
    list (notes 1.2). The course's address is `/trigonometric-functions/`; `/trigonometry/` returns
    the courses list (notes, opening).
  - **Khan Trigonometry** (four units): right triangles, trig functions (unit circle, radians, the
    identity, special angles, sinusoids), non-right triangles, then equations and identities (notes
    2.1).
  - **Bitesize and SQA:** National 5 has graphs, quadrants, the area of a triangle, the sine and
    cosine rules and bearings (notes 2.2). Higher adds radians, the wave function and trig equations
    "in degrees or radians" (notes 2.2).
  - **HELM Workbook 4** (77 pages): right-angled triangles, trig functions, identities, triangles,
    then waves, ending on "combine two waves of the same frequency as a single wave in
    amplitude-phase form" (notes 2.3). This course follows its order.
  - **Bird's Engineering Mathematics:** introduction, waveforms, polar co-ordinates, triangles,
    identities, compound angles; adding alternating waveforms comes after complex numbers and vectors
    (notes 2.4).

  What they lack that you need: Brilliant has the waves and radians but none of the triangle rules
  or the AC (notes 1.2). Khan and Bitesize have no engineering. Lessons 1, 2, 7 and 8 take their uses
  from the MCA lines, Bird, HELM and the electrical sources.
- **His aim (notes 3).**
  - **SQA HN Engineering Mathematics 1 (H7K0 33, SCQF 6), Outcome 1:** "Solve problems involving
    functions and trigonometric equations", with "Introduce the concept of the radian Convert degrees
    to radians and vice versa" and two problems, "one in degrees and one in radians" (notes 3.1). The
    exact form of the expressions came back garbled (UNCONFIRMED, notes 3.1). The older SQA unit asks
    for "amplitude, phase and period" and gives 10 sin 100πt = −8.3 (notes 3.1).
  - **Pearson BTEC HN Unit 4002:** "P3 Determine solutions of engineering equations using ...
    trigonometric ... functions", "LO3 ... relating sinusoidal wave and vector functions to their
    respective applications", "P6 Solve engineering/ manufacturing problems relating to sinusoidal
    functions" (2024, notes 3.2). It is core in the Manufacturing Engineering HNC; for the plain
    Engineering HNC it is UNCONFIRMED, and so is the 2024 essential content for LO3 (notes 3.2). The
    2010 unit listed "radian measure ... AC waveforms and phase shift" (notes 3.2). Which awarding
    body your college uses is UNCONFIRMED.
  - **MCA Second Engineer Mathematics 5.1:** degrees and radians, the six ratios, any angle up to
    360°, Pythagoras, right triangles, "States the Sine Rule", "States the Cosine Rule", "Solves any
    triangle for any side or angle" (notes 3.3). **4.1:** graphs of "y = a sin mx + b cos nx" and
    "y = a tan mx" (notes 3.3).
  - **MCA Marine Electro-technology:** "e = E MAX sin 2πft", phasors, adding ac voltages and currents
    "using phasor method", phasor diagrams for R, L and C with "in phase, lagging and leading
    currents", and "calculates the power factor" (notes 3.3).
  - **MCA General Engineering Science I and Applied Mechanics:** convert degrees and radians, right
    triangles "given two facts", similar triangles, resolving forces and vectors into components, the
    inclined plane, and "the power developed by a torque" (notes 3.3, 7.5).
  - **The 2023 cadet syllabus review** marks the Marine Engineering trig outcome "Modernise" and asks
    to "Include graphical representation of waves ... Show how they are used on ship and where
    problems can arise" (notes 3.3).
- **Where it is used (each cited before a lesson uses it).**
  - **Ratios and sides (1):** MCA 5.1.4, 5.1.5 and 5.1.10, "Solves right angled triangles for any
    side or angle" (notes 3.3). GES I, "Solve problems relating to right angle triangles given two
    facts about the triangle" and "Solve problems on similar triangles" (notes 3.3). Conduit offsets
    (conduitbending.com, SECONDARY, notes 7.1); no syllabus line names them (UNCONFIRMED, notes 9).
  - **Angles and forces (2):** MCA 5.1.7, "Determines an angle from tables knowing its sin" (notes
    3.3). GES I, "Resolve forces in horizontal and vertical components restricted to the first
    quadrant"; Applied Mechanics, "Resolves vectors into mutually perpendicular components" and the
    "frictionless plane inclined to the horizontal" (notes 3.3). The angle of a line, tan θ = m
    (Sheffield, notes 4.1). The projectile's two parts (Quadratics brief, notes 5).
  - **Any angle (3):** MCA 5.1.8, "Determines values of sin, etc, for angles 90' - 360' and also is
    able to obtain an angle ... knowing its sin" (notes 3.3). Bitesize National 5 on quadrants (notes
    2.2). The identity, Brilliant level 4 and HELM 4.3 (notes 1.2, 2.3).
  - **The rules (4):** MCA 5.1.11 to 5.1.13 (notes 3.3). HELM's two ships, "the required distance
    apart of the ships", 73.5 nautical miles (notes 4.4), and HELM's "surveying, navigation or the
    study of mechanisms" (notes 7.4). The crank and conrod, a reach (EPI, notes 7.6).
  - **Radians (5):** MCA 5.1.1, "States that angles are measured in degrees or radians and relates
    the two"; GES I, "Convert degrees to radians and vice-versa" (notes 3.3). SQA H7K0 33, "Introduce
    the concept of the radian" (notes 3.1). Shaft power, P = ωT with rev/min × 2π ÷ 60 (MTU,
    Mississippi State, notes 7.5), Bird's ship drive shaft (notes 7.5), MCA Applied Mechanics,
    "States the expression for the power developed by a torque" (notes 7.5).
  - **The wave (6):** MCA "e = E MAX sin 2πft volts" (notes 3.3). SQA's older HN unit, amplitude,
    phase and period, and 10 sin 100πt = −8.3 (notes 3.1). Pearson P6 (notes 3.2). MCA 4.1, graphs
    of a sin mx + b cos nx and a tan mx (notes 3.3). Ships' supplies at 60 Hz "most common" (a
    college notes PDF, SECONDARY, notes 7.3).
  - **Phasors (7):** MCA, "Explains the term phasor quantity" and adding ac voltages and currents by
    phasors (notes 3.3). HELM 4.5's two waves of one frequency (notes 2.3). Pearson LO3 and M3
    (notes 3.2). Three-phase at 120° and √3 (MTU, UNSW, Fiore, Electrical PE Review,
    ElectronicsInfoline, notes 7.3). "The majority of ships have a 3 phase, 3 wire, 440V insulated
    neutral system" (SECONDARY, notes 7.3).
  - **Power factor (8):** MCA, "Draws a phasor diagram ... and calculates the power factor" (notes
    3.3). ORNL and All About Circuits (notes 4.8). The motor and the 10 kW load (Electrical A2Z,
    SECONDARY, notes 7.2).
- **The mistakes to catch, each with a puzzle and its own hint.**
  - **Lesson 1, multiply or divide:** "The most common mistake for both methods was to multiply
    instead of divide", and where division was involved, such as "finding the hypotenuse from the
    sine of an angle", success fell to 77% and 38% (academia.edu summary, SECONDARY, notes 6.1).
    Lesson 1's conduit travel is that exact case. A DO screen offers offset × sin θ.
  - **Lesson 1, the calculator mode:** calculators "should be in degrees mode" (Bitesize, notes
    6.2). A puzzle shows sin 30 = −0.988 on screen and asks what went wrong.
  - **Lesson 1, cos as a multiplication:** students "must be thinking of cos(x) as a multiplication
    of something called cos and x" (Lamar, notes 6.2). A DO screen asks whether sin 60° is 2 × sin
    30°, checked on the calculator.
  - **Lesson 1, 2.0 or 1.414:** "Using 2.0 for 45° bends (should be 1.414) or 1.414 for 30° bends
    (should be 2.0)" (HVAC Calculator Pro, SECONDARY, notes 7.1). The multiplier is worked from
    1 ÷ sin θ, not remembered.
  - **Lesson 2, inverse only for angles:** "You only need inverse trig when the question asks you to
    find a missing angle" (Cognito, SECONDARY, notes 6.2). Mixed puzzles ask for a side or an angle.
  - **Lessons 2 and 4, rounding early:** candidates lost marks "due to prematurely rounding the
    vertical side length" (Cambridge examiners, notes 6.2). A two-step puzzle keeps the first answer
    in the calculator.
  - **Lesson 3, sine across:** students "incorrectly identified the x-coordinate as the sine ratio"
    (Williams, SECONDARY, notes 6.1). A DO screen gives a point on the circle and asks for sin θ.
  - **Lesson 3, one answer only:** the calculator gives one angle; MCA 5.1.8 asks for the angle from
    0° to 360° (notes 3.3), and SQA asks for "further solutions" by symmetry (notes 2.2). A puzzle
    asks for both angles with sin θ = 0.5.
  - **Lessons 3 and 4, a negative cosine:** "The negative value of cos 110 also led to errors"
    (Cambridge examiners, notes 6.2). Lesson 4's hinge opened to 110°.
  - **Lesson 4, right-angle trig where there is no right angle:** "Some candidates wrongly tried to
    use right angle trigonometry" (Cambridge, notes 6.2). And the reverse: some "applied the sine rule
    or the cosine rule not realising all that was required was right-angled triangle trigonometry"
    (Cambridge, notes 6.2). The which-rule puzzles carry both.
  - **Lesson 4, the cosine rule's form:** "omitting the 2, replacing the – with + or using sin 110
    instead of cos 110", and a² + b² − 2ab cos B evaluated as (a² + b² − 2ab) cos B (Cambridge, notes
    6.2). Each has a DO screen whose wrong answer is that slip.
  - **Lesson 4, Maths ERROR:** "you probably subtracted things the wrong way around when you
    rearranged the formula" (Save My Exams, SECONDARY, notes 6.2).
  - **Lesson 4, the ambiguous case:** a named exam topic, "sometimes there are two possible answers"
    (Bitesize, notes 4.4). Not a counted mistake; a puzzle has two triangles that both fit.
  - **Lesson 5, the radian as a unit:** students "do not regard the radian as a unit of angle
    measure" (Moore 2013, reported, SECONDARY, notes 6.1), and are "much more comfortable with degree
    angle measurements" (Moore 2009, notes 6.1). Orhun's students answered radian arc-length questions
    poorly (notes 6.1). A DO screen asks how many radius-lengths fit round a quarter circle.
  - **Lesson 5, the whole circle is one radian:** some students "believe that the whole unit circle
    was equal to one radian" (Williams, SECONDARY, notes 6.1).
  - **Lessons 5 and 6, the wrong mode:** "cos(10) = −0.839 ... in radians, cos(10) = 0.985 ... in
    degrees" (Lamar, notes 6.2), and Pearson's examiners saw answers "given in degrees and not
    converted to radians" (notes 6.2). Lesson 6's 10 sin 100πt is the radian-mode puzzle.
  - **Lesson 5, arc formulas:** in a sector question Pearson's examiners saw "an incorrect formula
    such as rθ, πrθ, or θr²" (notes 6.2). Arc length is built from the picture, and a DO screen
    checks it by units.
  - **Lesson 6, the sign of a phase:** "+ if leading and drawn to the left, − if lagging and drawn to
    the right" (Fiore, SECONDARY, notes 4.5). Taught as a check on the picture (the wave slides the
    way the arm started), not a counted mistake.
  - **Lesson 7, adding sizes:** "Why is the line voltage 400 V when each phase is only 230 V? ...
    the difference between them is not twice either one" (ElectronicsInfoline, SECONDARY, notes
    7.3). A DO screen offers 460 V.
  - **Lesson 7, mixed frequencies on one diagram:** "Sinusoids of different frequencies cannot be
    represented on the same phasor diagram" (Electronics Tutorials, notes 4.7). The speed switch is
    the puzzle.
  - **Lesson 8, choosing the method:** interleaved practice "requires students to choose a strategy
    on the basis of the problem itself" and gave higher delayed scores (Rohrer 2015, d = 0.79) and
    61% against 38% in a trial (Rohrer 2020) (notes 6.4). The mixed set is built that way.
  - **Not stated as common:** no source counts these, so they are taught as checks (look at the
    picture, put the answer back in), not as cited mistakes.
    - Naming the sides from the wrong angle.
    - Reading sin⁻¹ θ as 1 ÷ sin θ.
    - Mixing up f and ω, or leaving out the 2π.
    - Reading period as frequency.
    - Taking power factor as sin φ.
    - Mixing peak and rms on one phasor diagram.
- **Size and cost.** 8 lessons of about 12 screens on the agreed settings.
  - The last six measured courses ran about 0.99M to 1.14M tokens a lesson
    (docs/plans/foundational-maths-roadmap.md). The pictures here are a turning arm tracing a wave,
    linked arrows and live triangles, closer to Calculus fundamentals than to tiles, so I estimate
    about 1.1M to 1.25M a lesson.
  - That is about 8.8M to 10M for the course, plus about 0.3M for the plan. The research is done
    (178 quotes from 43 saved tool results).
  - The full process measured on Fractions lessons 4 to 8 was about 1.65M a lesson, about 13.2M for
    eight.
  - Each build's real cost is reported to you.
- **Lesson 1 first.** Lesson 1 is built and checked before the others (about 1.15M, plus the plan).
  Because you asked for the folder in one push, the rest follow without waiting for you to try it.
- **Gaps to close at build time.** None blocks the build.
  - Brilliant's lesson pictures were not seen, only its level and lesson titles (UNCONFIRMED, notes
    1.3).
  - Which awarding body your college uses, Pearson 4002's place in the plain Engineering HNC, its
    2024 LO3 content, and the exact form of SQA H7K0 33's equations are UNCONFIRMED (notes 3.1, 3.2).
  - No syllabus line names conduit offsets, shrink or piston position (UNCONFIRMED, notes 9). Lessons
    1 and 2 say the conduit work is from the trade, and lesson 4's crank is labelled a reach.
  - **Lesson 3:** the identity is quoted only from SECONDARY pages, Brilliant's archived wiki and a
    Higher revision site (notes 4.6). The research stage must cite HELM 4.3 or another primary text
    for sin² θ + cos² θ = 1 and tan θ = sin θ ÷ cos θ before the lesson states them. The picture
    shows the identity from Pythagoras either way.
  - **Lesson 4:** the cosine rule appears in the notes only inside HELM's worked ships example, and
    the sine rule's formula is not quoted (notes 4.4). The research stage must cite both formulas in
    their general form before the lesson writes them.
  - **Lesson 6:** T = 1/f and the UK mains frequency of 50 Hz are not quoted in the notes. The
    research stage must cite them before the lesson states them; 314.16 rad/s is computed from
    ω = 2πf (notes 10). Ships' 60 Hz and 440 V are from one college PDF (SECONDARY, notes 7.3), so the
    lesson says "a college's notes say", not "ships use".
  - **Lesson 7:** the sum of two arrows found by parts is computed from the shown rule (my reading,
    from HELM's amplitude/phase form, notes 4.7). The Electronics Tutorials worked example has a
    "hypotenuse" shorter than a side, so none of its numbers is used (notes 6.3). No research on how
    students learn phasors was found (UNCONFIRMED, notes 9).
  - **Lesson 8:** apparent power as V × I with rms values is used by the A2Z example (computed, notes
    10) but not stated in a quote. The research stage must cite S = VI before the lesson states it.
    The 10 kW figure at 0.8 is 54.3 A from the rule, where the page prints 54.5 A (notes 10); the
    lesson uses the computed value and shows the rule.
