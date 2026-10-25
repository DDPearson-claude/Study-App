# Vectors: the course brief

Written 24 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
the second course in the Maths shelf's Advanced maths folder, "Quantities with a size and a
direction, and how to combine them." It comes after Calculus fundamentals. Matrices, Linear
algebra, Vector calculus and Differential equations come after it, so their ground is left for them
and each deferral below says where it goes. You chose this course next on 24 Oct and approved the
build, so I have taken the decisions for you and listed them below. Change any you like. Sources
and quotes are in `research-notes.md` beside this file (170 quotes, cut by script from the 59 saved
tool results and checked with `tools/eval/sources.mjs`, `failed: 0`). Section numbers below point
there.

## The short version
**Seven lessons**
1. What a vector is (built first)
2. Components: i, j and k
3. Adding: the resultant and the equilibrant
4. Taking away: displacement and relative velocity
5. The dot product: how much lies along
6. The cross product: turning and the motor force
7. Vectors and phasors

**The main pictures** (one per lesson, each moved with your finger, each showing the cause):
- **The arrow that slides (lesson 1).** One arrow on a grid. Drag its tip to set its size and
  direction. Drag its middle and it slides anywhere, while its readout does not change. A slider
  multiplies it by a number from −3 to 3, so it stretches, shrinks to nothing and flips. A tap
  shrinks it to length 1.
- **The arrow and its shadows (lesson 2).** Drag a force arrow. Its two parts are drawn dashed
  along the axes, nose to tail, closing a right triangle with the arrow. Switch the angle from "off
  the x-axis" to "a bearing off north", and cos and sin swap sides with it. A 3-D switch stands the
  arrow in a box whose three edges are its i, j and k parts. Drag to turn the box.
- **Forces on a ring (lesson 3).** A ring pulled by two or three ropes. Drag each pull. Beside it
  the same arrows are laid nose to tail, and the resultant is the gap from start to finish. A
  needle on the ring shows its net pull. Add the equilibrant and the chain closes and the needle
  drops to zero.
- **The boat and the stream (lesson 4).** A boat on moving water. Drag its heading and speed
  through the water, and the stream. Its track over the ground is the sum, and a ghost boat follows
  it. Switch to "seen from the boat" and the bank and a second vessel slide past along the
  difference of the two velocities.
- **The shadow on the line (lesson 5).** Two arrows from one point. A light above one arrow casts
  the other's shadow onto its line. The shadow's length times the first arrow's length is the dot
  product, and both formulas read out beside it. At 90° the shadow vanishes. Past 90° it falls
  behind and counts as minus. The arrows become a rope and a rail, then a voltage and a current.
- **The spanner and the bolt (lesson 6).** A spanner on a bolt, drawn in 3-D so you can turn the
  view. Drag where you push and at what angle. The moment arrow grows along the bolt, out of the
  nut or into it, and its size is the area of the parallelogram the lever and the force span. The
  same picture then holds a wire between two magnet poles.
- **The fixed arrow and the turning arrow (lesson 7).** A force arrow that stays still, beside a
  phasor that turns and traces its wave. Freeze stops the phasor. Then three phase currents, each
  size dragged. Balanced, their chain closes like lesson 3's ring. Unbalance one and the gap that
  opens is the neutral current.

**Decisions taken for you** (say if you want any changed):
- **Seven lessons.** You approved seven. The research supports a seven-lesson core (notes 8). The
  SQA HN unit gives vectors and complex numbers 14 of its 40 hours together (notes 3.1). Bird gives
  vectors three chapters (notes 2.5) and HELM one workbook of five sections (notes 2.4). Brilliant
  spends 39 lessons, but all in two dimensions, and about a fifth of them are Matrices and Linear
  algebra ground (notes 1.1).
- **Eight topics fold into seven lessons like this.** Scaling and the unit vector join lesson 1,
  because a unit vector is just a vector scaled to length 1 (Isaac Science, notes 4.4), and every
  benchmark puts scaling early (notes 2.6, point 3). The third axis and k join lesson 2, because a
  3-D vector is one more component and Pythagoras twice (notes 4.4). Taking away gets a lesson of its
  own with displacement and relative velocity. Most subtraction errors are effectively adding the
  two vectors (Heckler and Scaife, notes 6.2), and displacement and relative velocity are
  subtraction at work (notes 4.5). If lesson 2 runs long when it is written, k moves to the start
  of lesson 5. SQA asks for the angle between two 3-D vectors there anyway (notes 3.1).
- **Lesson 1 is built first, without a pause.** You approved the build, so lesson 1 is built and
  checked first, and the others follow without waiting. You can try it on your phone as soon as it
  lands.
- **Steps lessons, taught visually ("Yes", RUNBOOK section 0, item 3).** About 12 screens each,
  SHOW then DO, ending on two or three mixed puzzles. SHOW screens carry one to three plain
  sentences. The runbook lists vectors under "Partly". I chose "Yes" because every idea here is an
  arrow you can move. Arrows and numbers together also beat arrows alone (Heckler and Scaife, notes
  6.5). Two places may need a short paragraph, at most about 90 words: lesson 6's right-hand rule
  and lesson 7's list of differences.
- **The engineer's order, with phasors last.** HELM and Bird run concepts, components, adding and
  taking away, then the two products (notes 2.4, 2.5). Brilliant does relative velocity before the
  dot product too (notes 1.1). Bird puts adding waveforms straight after the first chapter (notes
  2.5). Here phasors come last instead. Lesson 7's point is where a phasor differs, and that needs
  the dot product (power) and lesson 3's closed chain (three-phase balance).
- **Arrows and numbers on every screen.** Students did "typically excellent" in the i, j, k format
  and often much worse with arrows alone (Heckler and Scaife, notes 6.5). Arrows cue spatial
  thinking and numbers cue calculation (notes 6.5). So every arrow carries its numbers, and every
  sum is done both ways. The layouts vary (aligned, opposed, tail to tail, apart) and are
  two-dimensional from the start, because one-dimensional practice alone does not carry over (notes
  6.5).
- **Notation.** In print a vector is **bold**. By hand you underline it (Bitesize, notes 2.2), as
  HELM does in print too (notes 2.4). The vector from A to B is written AB with an arrow over it.
  Its size is |a|. Column vectors on the grid, and 3i + 4j alongside from lesson 2. A unit vector
  wears a hat, â (Isaac Science, notes 4.4). The arrowhead goes in the middle of a force line on a
  diagram (Pearson Edexcel, notes 4.1). "Magnitude" is the main word, and "modulus" is named once.
- **Two ways to give an angle, both taught.** Maths measures from the positive x-axis,
  anticlockwise, as Trigonometry did. Navigation gives a bearing, clockwise from north. Trigonometry
  left bearings out (its brief), so they are taught inline in lesson 2. Measuring from the other
  axis is exactly where sin and cos get swapped (Zavala and Barniol, notes 4.2), so a bearing is
  the natural way to catch it. Brilliant also has "Velocity from Bearing" (notes 1.1).
- **Parts are one arrow drawn two ways, never extra pushes.** One study found students more often
  thought "forces and their components act on a body independently and simultaneously" (Aviani and
  others, notes 6.4). So the parts are drawn dashed, the arrow stays solid, and a screen says it is
  one push with two names.
- **True power is taught as the same shape as the dot product, not as one.** P = VI cos φ is the two
  sizes times the cosine of the angle between them (Louisville, ABB, notes 7.3). Only the part of
  the current in step with the voltage carries real power (Moffat, notes 7.3). That is the dot
  product's "shadow" reading. But no source I found says "true power is the dot product of the
  phasors" (UNCONFIRMED, notes 4.6, 9). The lesson says the arithmetic has the same shape, and
  lesson 7 says why a phasor is not quite a vector.
- **The cross product by size and direction, plus i × j = k.** The component formula is usually
  written as a determinant (HELM 9.4, Bird 24.3, notes 2.4, 2.5), and determinants belong to
  Matrices (notes 1.2). So the formula waits for Matrices. The SQA HN unit does not name the vector
  product at all (notes 3.1). It is here because moments and the motor force are cross products
  (notes 4.7, 7.1, 7.2).
- **Fleming's left-hand rule is linked, not replaced.** Motor makers give the force's direction by
  the left-hand rule and its size by "the BLI law" (Nidec, notes 7.2). Physics texts give F = IlB
  sin θ with a right-hand rule (OpenStax, notes 7.2). Both describe the same force, so they must
  agree. That they give the same direction is my reading, and the fact-check confirms it.
- **Phasors at rms, as Complex numbers and AC circuits drew them.** Peak or rms length stays
  contested (Electronics Tutorials against Rose-Hulman, notes 4.8), and Trigonometry lesson 7
  already taught it as contested. Lesson 7 says it once.
- **"A phasor turns" and "a phasor is a fixed number" are both taught, as two views.** One view is
  "phasors-rotating vectors" (SECONDARY, notes 4.8). The other is "not a rotating thing. It is
  static, a complex constant" (SECONDARY, notes 4.8). Trigonometry used the turning arrow frozen at
  t = 0, and Complex numbers used the fixed number. Both views are right, and one screen shows how.
- **Collinearity gets two screens in lesson 4.** It is on the SQA HN unit and the MCA cadet
  syllabus (notes 3.1, 3.3), and it is just lesson 1's scaling: AB is a multiple of BC, and they
  share B. The internal division point (SQA Higher, notes 2.3) waits for Linear algebra, with lines.
- **Bow's notation is named, not taught.** The MCA's General Engineering Science I wants the
  triangle of forces "with the aid of Bow's notation" (notes 3.3). Lesson 3 teaches the triangle of
  forces. No source in the notes explains Bow's notation, so it is named once. It belongs with your
  shelf's mechanical course, which waits for your Level 3 syllabus.
- **Example numbers are labelled.** Forces, speeds, currents and fields in the puzzles are example
  figures, said so on screen, or computed from a rule the screen shows. No figure is presented as a
  real ship's or a regulation's.
- **Your intake answers** (`intake.json`): to understand vectors and how to work with them; on the
  job and in everyday life; hands-on, with the why explained in full.

## 1. The overall topic
A vector is a quantity with a size and a direction: a push, a movement, a velocity. Two of them do
not combine by adding their sizes. Two 3 kN pulls can make 6 kN, nothing, or anything between,
depending on their directions. This course is about combining them correctly. You split a vector
into parts, then add and take away vectors by drawing and by parts. Then come the two ways to
multiply them. The dot product says how much of one lies along the other, which is work. The cross
product says how hard one turns the other, which is a moment. The course ends where vectors meet
your trade: a phasor looks like a vector, adds like one, and differs in ways that matter.

**It builds on:**
- **Trigonometry:** sin, cos, tan and their inverses (lessons 1 and 2). Resolving a force into
  F cos θ and F sin θ in the first quadrant (lesson 2). Any angle round the circle and its signs
  (lesson 3). The sine and cosine rules (lesson 4). Adding phasors by parts and the three-phase √3
  (lesson 7). Power factor as a cosine (lesson 8).
- **Complex numbers:** arrows on a plane added tip to tail (lesson 2). One arrow with two names,
  a + jb and r∠θ, with the quadrant check on the calculator's angle (lesson 5). Times j as a quarter
  turn (lesson 3).
- **The coordinate plane and Geometry fundamentals:** points, axes and Pythagoras.
- **Solving equations:** rearranging, for a course to steer or an angle.
- **AC circuits:** phasors at rms, the power triangle, true power V I cos φ, star and delta, and the
  balanced neutral carrying nothing (lessons 8 and 10).
- **Motors:** torque and the force on a conductor, as ideas.
- **Calculus fundamentals:** velocity as the rate of change of position.

**Not taught again:** the trig ratios and their inverses, Pythagoras, the sine and cosine rules,
signs in the four quarters, resolving in the first quadrant, converting between a + jb and r∠θ,
j arithmetic, adding phasors, the three-phase √3, rms, power factor and the power triangle. Each is
reminded in one line where it is used.

**Left for later courses:**
- **Matrices:** linear combinations as a system to solve, linear interpolation (Brilliant level 3,
  notes 1.1), determinants, and so the cross product's component formula.
- **Linear algebra:** span, linear independence, bases other than i, j, k, and lines and planes
  (HELM 9.5, Bird 24.4, Khan, notes 2.4, 2.5, 5). The internal division point (SQA Higher, notes
  2.3).
- **Vector calculus:** fields, gradient, divergence and curl, and vectors that change with time,
  velocity and acceleration as derivatives of a position vector (notes 5).
- **Differential equations:** motion that follows from forces over time. Here forces are only
  combined at one instant.

**Edges.** Two and three dimensions only. Vectors as arrows and as lists of parts, not as abstract
objects. Statics and steady velocities, no motion over time. Scientific calculator only.

## 2. The lessons, in the order they build
The order is the consensus spine (notes 2.6): what a vector is, parts, adding and taking away, unit
vectors and three dimensions, position and velocity, the scalar product, the vector product. Phasors
come last (see the decisions).

| # | Lesson | What it teaches |
|---|---|---|
| 1 | What a vector is | A vector has "both a magnitude (length) and a direction" (Khan, notes 4.1); a scalar measures size only (Bitesize Physics, notes 2.2). Forces, displacements, velocities and accelerations are vectors in engineering (LibreTexts, notes 4.1). Sort scalars from vectors: speed against velocity, mass against weight, energy against force (examples from notes 4.1's reading, cited at research). Equal vectors have the same size and direction "regardless of their position" (Bitesize, notes 2.2), so a vector can be moved if its size and direction are kept (Nguyen and Meltzer, notes 4.3). Going backwards makes it negative (Bitesize, notes 2.2), so AB and BA have opposite signs (SECONDARY, notes 6.6). Notation: bold in print, underlined by hand (Bitesize, HELM, notes 2.2, 2.4), AB with an arrow, column vectors, |a| for the size, found from the grid by Pythagoras. Scaling: 2a is twice as long the same way, and −a points back (Brilliant level 3, notes 1.1); a negative number reverses it (SECONDARY, notes 6.6). Parallel vectors are multiples of each other (SECONDARY, notes 6.6). The unit vector: divide by its own length to keep only the direction, â = a ÷ \|a\|, with no units (Isaac Science, notes 4.4). |
| 2 | Components: i, j and k | The same arrow as two parts at right angles, written (3, 4) as a column or 3i + 4j, where i and j are unit vectors along the axes (Isaac Science, SQA Higher, notes 4.4, 2.3). Resolving from Trigonometry lesson 2, now in any direction: across is \|v\| cos θ and up is \|v\| sin θ when θ is off the x-axis (Isaac Science's projection, notes 4.2). A bearing is clockwise from north, so east is \|v\| sin θ and north is \|v\| cos θ: the side next to the given angle takes cos. A component is shorter than its vector, never equal unless the vector lies along the axis (Zavala and Barniol, notes 4.2). Back from parts to size and direction, with Complex numbers lesson 5's quadrant check (SQA HN "Cartesian form to polar form" and back, notes 3.1; Brilliant level 4, notes 1.1). Size from parts is Pythagoras, never the parts added (SECONDARY, notes 6.6). Parts are one push named twice (Aviani, notes 6.4). Then a third axis at right angles to both, and k: (2, 3, 6) = 2i + 3j + 6k. Its size is Pythagoras twice: √(2² + 3² + 6²) = 7 (computed). SQA HN asks for "3-dimension coordinates" and 3-D components (notes 3.1); National 5 the "Magnitude of a two- or three-dimensional vector" (notes 2.3). |
| 3 | Adding: the resultant and the equilibrant | A resultant "'results' from adding two or more vectors together" (Bitesize, notes 2.2). Nose to tail, the triangle law (HELM, notes 2.4). The parallelogram gives the same arrow (Electronics Tutorials, notes 4.3). By parts: add the i parts and the j parts separately (Bitesize, notes 2.2). Vectors cannot be added "by simply adding ... the magnitudes" (LibreTexts, notes 4.1). Sizes add only when the arrows point the same way (a learner's question, SECONDARY, notes 4.3). Two 3 kN pulls at 0°, 90°, 120° and 180° give 6, 4.24, 3 and 0 kN (computed). The equilibrant is equal and opposite to the resultant, the MCA's pair of terms (notes 3.3). Forces in balance close into a polygon with no gap (notes 4.3). Three non-parallel forces in balance must meet at a point (MCA, notes 3.3). Lesson 6 shows why. The triangle of forces (MCA GES I, notes 3.3). Every sum drawn and done by parts, because SQA's 2025 report found many found the resultant by parts but "few candidates correctly drew the resultant vector" (notes 6.6). |
| 4 | Taking away: displacement and relative velocity | Taking away a vector is adding its reverse (Bitesize N5, notes 2.2). On the parallelogram it is the other diagonal (Electronics Tutorials, notes 4.8). A position vector locates a point from the origin, and the displacement from A to B is b − a (SECONDARY, notes 4.5): where you ended minus where you started. Collinearity: three points lie in a line when AB is a multiple of BC (SQA HN, MCA cadet syllabus, notes 3.1, 3.3). A boat's velocity over the ground is "the vector sum of the boat velocity and the river velocity" (Physics Classroom, notes 4.5), so its path is diagonal (OpenStax, notes 4.5). Heading across at 4 m/s in a 3 m/s stream gives 5 m/s over the ground, 36.9° off (example figures, computed). The parts across and along do not affect each other (K12 LibreTexts, notes 4.5). The course to steer aims upstream so the stream's part cancels: at 48.6° into the stream, 2.65 m/s straight across (computed). Do not "join the dots" from the tide's end to the destination (PBO, notes 7.5). Relative velocity: what another vessel seems to do, seen from yours, is its velocity minus yours (Bird 22.8, Brilliant level 6, notes 2.5, 1.1). That is the manoeuvring board's speed triangle (USNI, notes 7.5). One screen on steam over a moving turbine blade (MCA Applied Heat, notes 3.3). |
| 5 | The dot product: how much lies along | The part of u along v is \|u\| cos θ, its "projection (or resolution)" (Isaac Science, notes 4.2). Times \|v\| it is the dot product, a·b = \|a\|\|b\| cos θ. The answer is a scalar, a plain number (HELM, Isaac Science, notes 2.4, 4.6). By parts it is a₁b₁ + a₂b₂ + a₃b₃, built on screen from i·i = 1 and i·j = 0 (cited at research, see the gaps). Perpendicular vectors give zero (Isaac Science, notes 4.6). The angle between two vectors is the main use (Bitesize Higher, notes 2.2): SQA HN wants it between two 3-D vectors (notes 3.1). It also gives "the component of a vector in the direction of another" (HELM, notes 2.4). Work: only the part of the force along the movement does work, W = F·d (Isaac Science, notes 4.6). A 200 N pull at 30° to a rail over 5 m does 866 J (example figures, computed). True power: P = VI cos φ (Louisville, notes 7.3), power factor the cosine of the angle (ABB, notes 7.3), and only the current in step with the voltage counts (Moffat, notes 7.3). This is the same shape as the dot product (UNCONFIRMED as "is the dot product", notes 4.6). Complex numbers' 230 V and 23 A at 36.87° give 4232 W (computed). |
| 6 | The cross product: turning and the motor force | A moment is "the 'tendency of a force to rotate a body'" (LibreTexts, notes 7.1). Moments are vectors (engineering statics, notes 7.1), and "Taking the cross product r x F results in M" (notes 7.1). The size is \|r\|\|F\| sin θ: only the part of the push square to the spanner turns it. A 150 N push on a 0.3 m spanner gives 45 N m square on and 22.5 N m at 30° (example figures, computed). That size is the area of the parallelogram the two arrows span. The direction is at right angles to both, along the bolt, by the right-hand rule, and swapping the order flips it. HELM's line: one product is a scalar and "the second ... is a vector" (notes 2.4). i × j = k, and so on round (cited at research). Back to lesson 3: three forces that do not meet at a point leave a moment, so they cannot balance. The motor force: F = IlB sin θ with its direction by a right-hand rule (OpenStax, notes 7.2), perpendicular to both current and field (Bitesize, notes 7.2), none when they are parallel (Bitesize, notes 7.2). 10 A in 0.2 m of wire across 0.8 T gives 1.6 N (example figures, computed). Fleming's left-hand rule gives the same direction (Nidec, notes 7.2; agreement is my reading). |
| 7 | Vectors and phasors | "Phasors and vectors share some qualities but not others" (Tennessee, notes 4.8). Shared: a size and an angle, and "We can add phasor voltages and phasor currents graphically ... exactly the same as if we were adding vectors" (Tennessee, notes 4.8). Different: a phasor stands for a voltage or current that changes in time, so its angle is a time shift, not a direction in space. "A phasor is a complex number" (Tennessee, notes 4.8), named "in analogy to a vector" (MIT, notes 4.8). It leaves its frequency out (Swarthmore, notes 4.8), so different frequencies cannot share one diagram (Electronics Tutorials, notes 4.8). Being a number, it can be divided, V ÷ I = Z, where a vector cannot (SECONDARY, notes 4.8), and times j turns it. The dot product of two phasors is not another phasor (Tennessee, notes 4.8), and real power "cannot be obtained by multiplying phasors" because that adds the angles (AC Electrical 101, notes 4.6). Turning or fixed: two views, both shown (SECONDARY, notes 4.8). Rms length, said once (notes 4.8). Three-phase: balanced phasors sum to zero (Electronics Tutorials, notes 4.8), lesson 3's closed chain. Unbalanced, the gap is the neutral current: 10, 10 and 4 A leave 6 A (example figures, computed by parts). The line voltage is a phasor difference (eeeguide, Texas Instruments, notes 7.4), lesson 4's taking away, 30° ahead (eeeguide, notes 7.4). The √3 is reminded from Trigonometry, not re-taught. |

## 3. Can it be taught mostly visually, through interaction?
Yes. Every lesson is a steps lesson of about 12 screens, with short SHOW screens (see the
decisions). Each lesson has one main picture you move with your finger, and each shows the cause,
not just the answer:
- **The arrow that slides (lesson 1).** A grid and one arrow. Drag the tip to set it. Drag the body
  and it slides, while its readout, (3, 4) and size 5, does not change and a ghost copy at the
  origin stays identical. The scale slider runs from −3 to 3, so the arrow passes through nothing
  and comes out reversed. "Unit" shrinks it to length 1 along the same line. *Why:* Nguyen and
  Meltzer traced many errors to one root, missing "that vectors may be moved in space ... as long as
  their magnitudes and directions are exactly preserved" (notes 4.3). Brilliant starts the same
  way, "vectors as shifts in space, using grids and arrows" (notes 1.1). The cause shown is that a
  vector is its size and direction and nothing about where it sits.
- **The arrow and its shadows (lesson 2).** Drag a force arrow. Its across and up parts are drawn
  dashed along the axes, nose to tail, making a right triangle with the arrow as the long side.
  Both read out as a column and as i and j. The angle marker switches between "off the x-axis" and
  "a bearing off north", and the cos and sin labels move with it to the side next to the angle. A
  3-D switch stands the arrow in a box: its edges are the i, j and k parts, and you drag to turn
  the box. *Why:* students who drew the vector triangle more often picked the right component (AQA
  report, SECONDARY copy, notes 4.2). Zavala and Barniol found sin and cos swapped when the angle
  came from the other axis (notes 4.2). The picture shows the cause: cos goes with the side next to
  the angle, whichever axis that is.
- **Forces on a ring (lesson 3).** A ring pulled by two ropes, then three. Drag each pull. Beside
  it the same arrows are laid nose to tail, and the resultant runs from the first tail to the last
  nose. A needle on the ring shows its net pull, by parts. Tap "equilibrant" and the closing arrow
  appears, the chain becomes a closed triangle, and the needle drops to zero. *Why:* students' feel
  for adding "was based on their experience with forces" (Nguyen and Meltzer, notes 4.3), so forces
  are the way in. A third of students just added the sizes (Heckler and Scaife, notes 4.3). The
  picture shows the sum as the gap the chain leaves, not its total length. Two opposing ropes cancel
  only along their line, which answers the "competing arrows" habit (notes 6.4). The MCA wants the
  resultant and equilibrant by name (notes 3.3).
- **The boat and the stream (lesson 4).** Moving water with a boat on it. Drag the boat's arrow
  (heading and speed through the water) and the stream's arrow. The track over the ground is their
  sum, drawn nose to tail, and a ghost boat follows it. A "steer for" target asks you to aim off
  until the track hits it. Switch to "seen from the boat": your own velocity is taken away from
  everything, so the bank and a second vessel slide past along the relative velocity. *Why:*
  subtraction errors were mostly adding instead (Heckler and Scaife, notes 6.2), and an Edexcel
  report found velocities "added instead of subtracted" (notes 4.3). Seeing the scene from the boat
  is the subtraction made visible. Context can help with signs, though the evidence is mixed
  (notes 6.5). This one is your own: the tidal triangle and the relative-motion plot (notes 7.5).
- **The shadow on the line (lesson 5).** Two arrows from one point, both draggable. A light shines
  straight down onto b's line, and a's shadow falls on it. The shadow's length times |b| is a·b.
  The readout shows \|a\|\|b\| cos θ and a₁b₁ + a₂b₂ agreeing. At 90° the shadow shrinks to a dot,
  and past 90° it falls behind the start and the number goes negative. The arrows become a hauling
  rope and a rail (work), then a voltage and a current (true power). *Why:* only 4% of students gave
  the projection reading, and 23% took the dot product to be a vector (Zavala and Barniol, notes
  4.6). A shadow is a length, so the answer is plainly a number.
- **The spanner and the bolt (lesson 6).** A spanner on a bolt, drawn in 3-D, with the view turned
  by dragging. Drag where along the handle you push and the push's angle. The parallelogram of r and
  F is shaded, and its area is the moment's size. The moment arrow stands along the bolt, out of the
  nut to undo it and in to do it up. Swap r and F and the arrow flips. Then the same picture holds a
  wire between two poles: drag the wire's angle to the field, and the force arrow stands square to
  both, shrinking to nothing as the wire lines up with the field. *Why:* cross-product direction is
  "particularly poor", mostly from misapplied right-hand rules, and turning the paper helps
  (Kustusch, notes 4.7). Turning the view is that. 32% of those who got the size left out the
  direction (Zavala and Barniol, notes 4.7), so the arrow is always drawn.
- **The fixed arrow and the turning arrow (lesson 7).** On the left, a force arrow on a beam that
  stays put. On the right, a phasor that turns, its shadow tracing a sine wave, with a freeze button.
  Both add tip to tail the same way. Then a star point with three phase currents, each size dragged.
  Balanced, the nose-to-tail chain closes. Unbalance one and the gap that opens is the neutral
  current, read out by parts. *Why:* the side-by-side shows what is shared and what is not. A
  phasor's angle is a moment in time, and a force's is a direction in space. The three-phase part
  reuses lesson 3's closed chain, so balance is the same idea in both trades.
- **Colour as before:** ink for arrows, working and controls; amber for key terms; teal for small
  labels (i, j, k, units, angles); red only for a slip; green only for finished. The equilibrant
  and the shadow are ink, dashed, not a new colour.

## 4. What else
- **Benchmark (notes 1 and 2).**
  - **Brilliant Vectors**, 39 lessons in 8 levels (notes 1.1). It runs shifts on a grid, adding
    and taking away, scaling and linear combinations, magnitude and direction, components from
    angles, velocities and bearings, then the dot product from unit vectors (notes 1.1). It is all
    two-dimensional and stops short of linear algebra (notes 1.2). Matrices "picks up right where
    this one leaves off" (notes 1.1). What happens inside each lesson is UNCONFIRMED (titles only,
    notes 1.1).
  - **Khan Precalculus** has the same spine with no dot product (notes 2.1). Khan's Linear
    algebra adds dot and cross products, planes and distances (notes 2.1).
  - **Bitesize and SQA** give the school order: components and position vectors (National 5), then
    3-D pathways, collinearity, the scalar product and i, j, k (Higher). They never reach the vector
    product (notes 2.2, 2.3).
  - **HELM 9** runs concepts and the triangle law, Cartesian components, scalar product, vector
    product, lines and planes (notes 2.4).
  - **Bird**, who lectured at the Royal Navy's marine engineering college at HMS Sultan (notes
    2.5), runs vectors, adding waveforms (phasors), then scalar and vector products (notes 2.5).

  The course follows Brilliant's arrows-first approach, geometry "before any formulas appear"
  (notes 1.1), and HELM's and Bird's engineering order. It adds what Brilliant lacks and you need:
  three dimensions, the cross product, moments, work, the motor force and the phasor link. It drops
  Brilliant's level 3, linear combinations and interpolation, which belongs to Matrices and
  Linear algebra (notes 1.1).
- **Starting point.** All of Algebra, so the arrows, trig and j arithmetic are yours already (see
  "It builds on"). Your trade gives you the force on a conductor, three-phase and power factor.
  What is new is the vector as an object, and the third axis, which The coordinate plane did not
  have (notes 4.4). Both products are new, as is the line between a vector and a phasor (notes 5).
- **His aim (notes 3).** A Level 3 marine engineering syllabus that names vectors was not found
  (UNCONFIRMED, notes 3). Nor was a Royal Navy or submarine and nuclear-propulsion one (UNCONFIRMED,
  notes 9). So the course builds to the nearest published lines, and you can send your syllabus
  when you have it:
  - **SQA HN Engineering Mathematics 1 (HP48 46), Outcome 3:** collinearity; adding, taking away
    and scaling; the scalar product; the angle between two 3-D vectors; a 2-D vector from Cartesian
    to polar and back (notes 3.1). Whether a newer version replaces it is UNCONFIRMED (notes 3.1).
  - **Pearson BTEC HN 4002, LO3 and P7:** "determine engineering parameters of data represented in
    vector form", paired with sine waves (notes 3.2). The 2024 content list is UNCONFIRMED (notes 3.2).
  - **MCA Chief Engineer Applied Mechanics 1.1 and 2.1:** adding and taking away by drawing and by
    calculation; "Resultant and Equilibrant"; three forces concurrent for balance; resolving into
    perpendicular parts; non-coplanar forces; moments (notes 3.3).
  - **MCA General Engineering Science I:** scalar against vector, resolving, two forces at a point,
    the triangle of forces (notes 3.3).
  - **MCA Second Engineer Marine Electro-Technology 2.1:** phasors, and adding and taking away AC
    quantities by the phasor method (notes 3.3).
- **Where it is used (each cited before a lesson uses it).**
  - **What a vector is (1):** SQA HN "Introduce the concept of a vector and scalar and give examples
    of each form from Engineering" and "notation commonly used with vectors" (notes 3.1). MCA GES I
    "Differentiate between scalar and vector quantities" (notes 3.3). Scaling: SQA HN Outcome 3
    (notes 3.1); MCA cadet syllabus 3.2 (notes 3.3).
  - **Components (2):** MCA Applied Mechanics 1.1 "Resolves vectors into mutually perpendicular
    components" (notes 3.3). GES I "Resolve forces in horizontal and vertical components" (notes
    3.3). SQA HN Cartesian to polar and back, and 3-D components (notes 3.1). Pearson's 2020 list,
    "Vectors in three dimensions" (notes 3.2). MCA 1.1 "non-coplanar concurrent vector quantities"
    (notes 3.3).
  - **Adding (3):** MCA Applied Mechanics 1.1 items 1 to 3 and 5 (notes 3.3). GES I "two forces
    meeting at a point" and the triangle of forces (notes 3.3). SQA HN Outcome 3 (notes 3.1).
    Pearson 4008 "vector diagrams of velocities and accelerations" (notes 3.2).
  - **Taking away (4):** MCA 1.1 subtraction "by both graphical and analytical methods" (notes
    3.3). Bird 22.8 "Relative velocity" (notes 2.5). The RYA tidal triangle (PBO, notes 7.5). The
    manoeuvring board's speed triangle (USNI, notes 7.5). Nautical Institute: radar and AIS are safe
    only with "a good understanding of both true and relative motion" (notes 7.5). MCA Applied Heat
    8.1, the velocity diagrams over a turbine blade (notes 3.3). Collinearity: SQA HN, MCA cadet
    syllabus 3.1 (notes 3.1, 3.3). The naval pages are American and the tidal advice is for
    yachtsmen. They show the method, not Royal Navy practice (notes 7.5).
  - **Dot product (5):** SQA HN "Calculate the angle between two 3-dimensional vectors using the
    scalar product" (notes 3.1). MCA cadet syllabus 3.3 "Scalar product" (notes 3.3). Work (Isaac
    Science, notes 4.6). Power factor (ABB, Louisville, Moffat, notes 7.3).
  - **Cross product (6):** MCA Applied Mechanics 2.1, "Recalls a moment of force" and "States the
    Principle of Moments" (notes 3.3). GES I "the principle of moments" (notes 3.3). Moments as
    r × F (engineering statics, notes 7.1). The motor force (OpenStax, Bitesize, Nidec, notes 7.2).
    HELM 9.4 and Bird 24.3 teach it (notes 2.4, 2.5). The SQA HN unit does not (notes 3.1), so this
    lesson goes past the maths unit because your mechanics and motors use it.
  - **Phasors (7):** MCA Marine Electro-Technology 2.1, "Explains the term phasor quantity" and
    "addition and subtraction of ac voltages and currents using phasor method" (notes 3.3). Pearson
    4049 "the sum and difference of two sinusoidal signals" (notes 3.2). A college 4002 assignment,
    "Using addition of vectors, find the total voltage" (SECONDARY, notes 3.2). Bird chapter 23
    (notes 2.5). Three-phase line voltage as a phasor difference (eeeguide, Texas Instruments,
    notes 7.4).
- **The mistakes to catch, each with a puzzle and its own hint.** The research is on university
  physics students, not electricians. That you would slip the same way is UNCONFIRMED, though the
  errors are about the maths, so likely (notes 6).
  - **Lesson 1, scalar against vector:** examiners report "confusion between scalar and vector
    quantities" and direction not stated clearly (OCR, notes 4.1). A sorting puzzle.
  - **Lesson 1, notation:** "Confusion over notation" loses marks (OCR, notes 4.1). A puzzle reads
    AB against BA.
  - **Lesson 1, a moved vector is a new one:** Nguyen and Meltzer's single root (notes 4.3). A
    puzzle asks which of four arrows in different places are equal.
  - **Lesson 1, a negative number reverses:** "Forgetting that a negative scalar reverses
    direction" (SECONDARY, notes 6.6).
  - **Lesson 2, a part as long as the vector:** some students think "the magnitude of a component is
    equal to the magnitude of the vector" (Zavala and Barniol, notes 4.2).
  - **Lesson 2, sin and cos swapped** when the angle is off the other axis (Zavala and Barniol,
    notes 4.2). A bearing puzzle.
  - **Lesson 2, resolving at all:** over half of algebra-based students could not resolve in two
    dimensions (reported second-hand, notes 4.2); "A considerable number of students had difficulty
    in resolving vectors" (AQA, SECONDARY copy, notes 4.2).
  - **Lesson 2, size by adding the parts:** "the magnitude is found using Pythagoras on the
    components, not by adding them" (SECONDARY, notes 6.6). Also parts written the wrong way round,
    (y, x) (SECONDARY, notes 6.6).
  - **Lesson 2, parts as extra forces** (Aviani, notes 6.4). A puzzle counts the pushes on a ring.
  - **Lesson 3, adding the sizes:** 33% "simply added the magnitudes" (Heckler and Scaife, notes
    4.3). Only 20% to 40% of algebra-based students could draw the sum of two arrows (Nguyen and
    Meltzer via Heckler and Scaife, notes 4.3).
  - **Lesson 3, "the forces cancel"** when they do not (10%), and Pythagoras used on arrows not at
    right angles (Heckler and Scaife, notes 4.3).
  - **Lesson 3, tip-to-tail against parallelogram:** "Many students are confused" (Nguyen and
    Meltzer, notes 4.3). Both are drawn and give the same arrow.
  - **Lesson 3, sum by parts but never drawn** (SQA 2025 report, notes 6.6). One puzzle asks for the
    drawing.
  - **Lesson 4, adding instead of taking away:** 10% to 15% added when asked to subtract, and 10% to
    20% made an overall sign error (Heckler and Scaife, notes 6.2); velocities "added instead of
    subtracted" (Edexcel, notes 4.3).
  - **Lesson 4, "join the dots"** on a course to steer (PBO, notes 7.5).
  - **Lesson 5, the dot product as a vector:** 23% (Zavala and Barniol, notes 4.6). The answer box
    takes a number only, and the hint says why.
  - **Lesson 5, sine for the dot product:** "The most common error (10%)" (Zavala and Barniol,
    notes 4.6).
  - **Lessons 5 and 7, power by multiplying phasors** (AC Electrical 101, notes 4.6).
  - **Lesson 6, direction left out:** 32% of those who got the size (Zavala and Barniol, notes 4.7).
  - **Lesson 6, cosine for the cross product:** 14% (Zavala and Barniol, notes 4.7).
  - **Lesson 6, the right-hand rule misapplied** (Kustusch, notes 4.7). A puzzle with the picture
    turned to an awkward view, then turned back.
  - **Lessons 5 and 6, which product gives a number:** "serious difficulties in interpreting the
    scalar nature of the dot product and the vector nature of the cross product" (Zavala and
    Barniol, notes 4.7). A mixed puzzle at the end of lesson 6.
  - **Lesson 7, a phasor is a vector:** the Tennessee sheet names the thought, "one might think that a
    phasor is a vector" (notes 4.8). And two frequencies on one diagram (Electronics Tutorials,
    notes 4.8).
  - **Not stated as common:** no source counts these, so they are taught as checks (draw it, check
    the size against Pythagoras), not as cited mistakes.
    - Mixing up a bearing with an angle off the x-axis without the swap.
    - Giving a unit vector units. It has none (Isaac Science, notes 4.4).
    - Drawing the line voltage as a sum instead of a difference.
- **Size and cost.** 7 lessons of about 12 screens on the agreed settings (CLAUDE.md).
  - Recent courses ran about 0.99M to 1.14M tokens a lesson, about 1.0M lately
    (docs/plans/next-build.md). Lessons 2 and 6 draw in 3-D with a view you turn, which is heavier.
    So I estimate about 1.0M to 1.25M a lesson.
  - That is about 7.0M to 8.75M for the course, plus about 0.3M for the plan and research. The
    research can start from the 59 saved tool results.
  - The full process measured on Fractions lessons 4 to 8 was about 1.65M a lesson, about 11.6M for
    seven.
  - Each build's real cost is reported to you.
- **Lesson 1 first.** Lesson 1 is built and checked first (about 1.1M, plus the plan and
  research). The rest follow without waiting, since you approved the build.
- **Gaps to close at build time.** None blocks the build.
  - **Lesson 1:** the scalar examples (speed and velocity, mass and weight, energy and force) are my
    reading in notes 4.1. The research stage cites them.
  - **Lesson 2:** a bearing measured clockwise from north, in three figures, has no quote in the
    notes. Nor does drawing right-handed x, y and z axes. The research stage cites both.
  - **Lesson 4:** displacement = b − a rests on a SECONDARY revision site (notes 4.5). The research
    stage finds a primary source.
  - **Lesson 5:** the component form a₁b₁ + a₂b₂ + a₃b₃ is not quoted. HELM 9.3 has it (notes 2.4).
    The lesson builds it on screen from i·i = 1 and i·j = 0, and the research stage cites it.
  - **Lesson 6:** a × b = −(b × a), i × j = k and the right-hand rule's wording need quotes. The
    statics text and OpenStax point there (notes 7.1, 7.2). That the right-hand rule and Fleming's
    left-hand rule agree is my reading, and the fact-check confirms it.
  - **Lesson 7:** that the neutral current is the phasor sum of the line currents needs a quote.
    AC circuits' notes 3.10 hold the balanced case. "True power is the dot product of the phasors"
    is UNCONFIRMED in those words and is never said (notes 4.6, 9).
  - **Throughout:** what happens inside Brilliant's lessons is UNCONFIRMED (notes 9). So is any
    vector-specific study of predicting before computing (notes 6.5, 9). Every DO screen still asks
    for a prediction first, as the house style does.
