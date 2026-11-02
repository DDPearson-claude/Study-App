# Scientific thinking: the course brief

Written 2 Nov 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
the first course in the Science shelf's Science folder, "Puzzles about the physical world, and how to
reason your way through them." The folder runs Scientific thinking, Circuits, Science puzzles, Quantum
computing. Circuits comes next and owns current, voltage and resistance as puzzles. Waves and light,
in the Physics folder, owns waves, sound and the wave equation; this course takes only reflection
and refraction, drawn as rays. Each deferral below says where the ground goes. You chose this course
on 2 Nov and approved the build, so I have taken the decisions for you and listed them below. Change
any you like. Sources and quotes are in `research-notes.md` beside this file (279 quotes, cut by
script from the 94 saved tool results and checked with `tools/eval/sources.mjs`, `failed: 0`).
Section numbers below point there.

**What you asked for (2 Nov):** visual and interactive puzzles with some mathematics, following
Brilliant's Scientific Thinking but adding the working Brilliant leaves out. Brilliant says its course
will "dispense with number-crunching and mathematics" (notes 1.1). This one keeps Brilliant's puzzles
and adds the sums, worked on paper and typed in, GCSE-exam style. Lessons 1 to 5 are puzzles and
practice on ground you already have from Mechanics and materials, Vectors, Trigonometry and Linear
systems. Lessons 6 and 7, mirrors and refraction, are new ground. The examples are gearboxes, winches,
cranes, lifting beams and a periscope as general physics. Nothing in it is about a submarine's
systems, and nothing claims how the Navy or any boat does a thing.

## The short version
**Seven lessons**
1. Gears (the pilot)
2. Compound gear trains
3. Balancing mobiles
4. Collisions
5. Structures
6. Mirrors
7. Refraction and prisms

**The main pictures** (one per lesson, each moved with your finger, each showing the cause):
- **The gear board (lesson 1).** A board of pegs with a driving gear on one. Drag gears onto pegs to
  build a chain, then turn the driver round with your finger. One tooth on each gear is marked, and
  at every mesh a counter ticks the teeth that pass on both gears. The two counts always match. Close
  the chain into a loop: with an even number of gears it turns, with an odd number one mesh goes red
  and nothing moves.
- **The two-stage train (lesson 2).** A motor pinion drives a wheel. A second pinion sits keyed to
  that wheel's shaft and drives the output wheel, which carries a winch drum. Drag the tooth counts
  and turn the input. A revolution counter on every gear shows the two gears on one shaft turning
  together. Speed and torque bars on each shaft move in opposite ways, and the power bar stays the
  same all the way through.
- **The mobile (lesson 3).** A mobile two or three levels deep. Drag the weights and hooks along the
  bars. Each bar tilts the way its bigger moment turns it. At each pivot, a clockwise bar and an
  anticlockwise bar grow and shrink, and the bar hangs level only when they match. Tap a lower level
  and it folds into one weight at its hook. One box is marked "?".
- **The pool table (lesson 4).** A table seen from above. Drag the cue ball's aim and pull back for
  speed. Momentum arrows on every ball before and after, and beside the table their sum drawn nose to
  tail: it is the same arrow after the hit as before. A bounce slider runs from bouncy to sticky, and
  a kinetic energy bar shows what each hit keeps. A glancing hit splits each arrow into along and
  across parts.
- **The frame on two supports (lesson 5).** Pin-jointed bars on two supports. Drag a joint: a square
  folds flat, a triangle will not move. Add a diagonal and the square locks. A counter compares the
  bars with what the joints need. Hang a load on a joint. The support reactions appear, then tap any
  joint and its bar forces close into a triangle, each bar marked as pulling or pushing.
- **The mirror bench (lesson 6).** A plane mirror seen from above, with an object and an eye. Drag
  either one, or turn the mirror. The ray that reaches the eye is drawn, its two angles to the normal
  always equal. Dashed lines run back behind the mirror to where the image sits, as far behind as the
  object is in front. Move the eye out of the reflected light and the image cannot be seen. A switch
  adds a second mirror at 45° for a periscope.
- **The boundary (lesson 7).** A ray of light meets a block of water or glass. Drag the ray's angle.
  The bent ray and a faint reflected ray follow, with readouts of both angles and sin i ÷ sin r. A
  switch shows the light's front as a row of marchers that slow as they cross, so the row turns.
  Send the ray from inside the block outwards and drag it past the critical angle: the bent ray lies
  flat along the surface, then all the light reflects. A prism mode splits white light, violet most.

**Decisions taken for you** (say if you want any changed):
- **Seven lessons, in the order you gave (2 Nov).** Brilliant spends 40 lessons in six levels: gears
  9 (levels 1 and 6), mobiles 8, pool 7, structures 9, optics 7 (notes 1.1). The six levels fold into
  seven lessons: the two gear levels become lessons 1 and 2, mobiles, pool and structures one lesson
  each, and optics splits into mirrors and refraction (notes 8). So each lesson is about six of
  Brilliant's. Seven keeps both new optics lessons and does not repeat the gears you met in Mechanics
  and materials lesson 7 (notes 8).
- **Lesson 1 is the pilot.** You said "build the pilot" (2 Nov). Gears is built and checked first,
  and you try it on your phone. The other six wait for your word.
- **Steps lessons, taught visually ("Yes", RUNBOOK section 0, item 3).** About 12 to 14 screens a
  lesson, SHOW then DO, short whole sentences. Every lesson carries `format: 'steps'`, with `read`
  and `still` entries for the read-through.
- **Each lesson runs puzzle, rule, then typed puzzles.** It opens with a puzzle you can feel your
  way through on the picture, with a prediction before anything moves. Then the rule, in one screen.
  Then typed-answer puzzles you work on paper and type in, GCSE-exam style, ending on two or three
  mixed ones. Predict, observe, explain is the "elicit, confront, resolve" cycle, and predicting
  first raises learning from a demonstration (notes 6.5). Demonstrations teach best when you already
  have the basics (notes 6.5), which you have for lessons 1 to 5.
- **GCSE-exam style means equations recalled and units given.** A typed puzzle does not print the
  equation; you recall it. The unit sits beside the answer box. Every GCSE board puts the moment
  equation on its recall list or sheet, and momentum = mass × velocity is on AQA's and Edexcel's
  Higher Tier list (notes 3.1). Each typed answer carries the usual slips with their own hints, so a
  wrong answer that comes from a named mistake is told which one.
- **Pitched at GCSE for your January course, with the stretch said plainly.** Your January Leading
  Rate enabling course tests maths and physics at GCSE level, by your own description; no public
  syllabus was found (UNCONFIRMED, notes 3.1, 9). So the typed puzzles start at GCSE and go past it
  where you have the maths. Past GCSE, and said so on screen: Snell's law with trigonometry and the
  critical angle by arcsine (CCEA: "a knowledge of Snell's law is not expected"; Edexcel: "equations
  not needed", notes 3.1, 3.4); glancing hits by components and elastic against inelastic (in no
  GCSE line read, notes 3.1); the method of joints. Gear ratios are "explain how" at GCSE, not a
  calculation; whether January asks for one is UNCONFIRMED (notes 3.1).
- **Lessons 1 to 5 are puzzles and practice, never a re-teach.** You have the gear rule, compound
  trains, the principle of moments, beam reactions and momentum from Mechanics and materials lessons
  2, 4 and 7, components from Vectors, sines from Trigonometry and two equations from Linear systems
  (notes 5.1). Each is used, with a one-line reminder if a puzzle shows you need it. The new parts
  are taught inline (notes 5.2): the direction rule and the odd loop, elastic against inelastic,
  components in a glancing hit, rigid frames and the forces in their bars.
- **Lessons 6 and 7 add one worked example before the typed puzzles.** They are new ground, and
  worked examples help a newcomer more than unguided problem solving (notes 6.5). Their SHOW screens
  stay short; the worked example is one screen, step by step.
- **Several gear chains before the direction rule.** People who trace many chains find the odd and
  even rule for themselves (notes 6.4). So lesson 1 gives three chains to trace before it states it.
- **The light's front in lesson 7 is a picture of slowing, not wave theory.** The cause of the bend
  is that light is slower in glass (Isaac Science, notes 4.7). The marchers show it. Wavelength,
  frequency and the wave equation are left for Waves and light.
- **The periscope is general physics only.** Older periscopes held mirrors at 45°, later prisms
  (notes 4.6), and OpenStax notes that modern submarines use photonic masts instead (notes 4.6). The
  lessons use the two-mirror and two-prism periscope as a textbook device and say nothing about any
  navy's.
- **The gearbox examples are a winch, a crane and a reduction box.** The marine reduction and winch
  sources are makers' catalogues, which show that such boxes are made and sold (notes 7.1, 7.2). The
  IMarEST idler paper is about a surface warship (notes 7.1), so the idler screen uses a plain
  reversing gear and does not name it.
- **Pool balls are nearly elastic, never perfectly.** "Everyday observable examples of perfectly
  elastic collisions don't exist" (OpenStax, notes 4.4). The bouncy end of the slider is labelled as
  the ideal, and the lesson says so.
- **Left out of lesson 5:** Brilliant's "Equivalent structures", the first thing to cut if the lesson
  runs long (notes 8). Shear force and bending moment diagrams stay with your Level 3 course, as
  Mechanics and materials decided.
- **Left out of lessons 6 and 7:** Brilliant's "Light bulbs" lesson as its own topic; its idea, where
  light reaches and from where an image can be seen, is one screen of lesson 6. Lenses and curved
  mirrors (OpenStax 25.6, 25.7, notes 2.3) go to Waves and light. Kaleidoscopes go to Science puzzles.
  Dispersion is one SHOW and one DO screen, the first detail to cut if lesson 7 runs long (notes 8).
- **Colour as before:** ink for rays, arrows, gears and controls; amber for key terms; teal for small
  labels (angles, units, "pull" and "push" on a bar); red only for a slip or a jam (the odd loop's
  locked mesh, an answer that fails); green only for finished. The one exception is the prism's
  spectrum, where the colours are the thing being taught.
- **Example numbers are labelled.** Teeth, speeds, masses, loads and distances are example figures,
  said so, or computed from a rule the screen shows. Water's index of 1.333 is cited (notes 4.7).
  The speed of light and glass's index are cited at research before a lesson uses them (see the
  gaps). No figure is presented as a real machine's.
- **Your intake answers** (`intake.json`): to understand scientific thinking and how to work with it;
  on the job and in everyday life; hands-on, with the why explained in full.

## 1. The overall topic
Scientific thinking here means reasoning your way through a physical puzzle before you calculate it.
You look at a set-up, predict what it will do, test the prediction on the picture, find the rule that
explains it, then use the rule to work a sum on paper. The puzzles come from five corners of physics:
gears, balances, collisions, frames and light. Each one has a single idea at its heart: teeth passing
the mesh, moments about a pivot, momentum kept in a hit, two freedoms at every joint, and light
taking the angle the rule allows.

It covers gear chains and compound trains, balanced mobiles, collisions in one and two dimensions,
pin-jointed frames and the screw, plane mirrors and periscopes, refraction, total internal reflection
and dispersion. Its edges: plane mirrors and flat boundaries only, rays only, two dimensions only, and
frames whose bar forces come from the joints alone. Scientific calculator only.

**It builds on:**
- **Mechanics and materials:** moments and the principle of moments, beam reactions by moments
  about one support (lesson 2); momentum, two trolleys that couple, "momentum is not a moment"
  (lesson 4); kinetic energy (lesson 5); the gear pair by teeth, torque and speed trading, a compound
  train multiplying its ratios (lesson 7) (notes 5.1).
- **Vectors:** components, adding nose to tail, the equilibrant (lessons 2 and 3), for the glancing
  hit and the joint's force triangle.
- **Trigonometry:** sine, cosine and the inverse keys (lessons 1 and 2), for resolving at a joint,
  Snell's law and the critical angle.
- **Linear systems:** two unknowns from two equations (lessons 1 to 4), for the mobile's two
  unknowns and the frame's joints.
- **Proportional reasoning:** inverse proportion, for speed against teeth.
- **Heat and fluids** has buoyancy and pressure; this course does not touch them (notes 5.1).

**Taught inline, because no course has built it** (notes 5.2): the direction rule and the odd closed
loop; elastic against inelastic collisions by kinetic energy and momentum components in a glancing
hit; the rigid frame (degrees of freedom, m = 2j − 3) and tension against compression at a joint; the
screw as a ramp; all of lessons 6 and 7.

**Not taught again:** the moment equation and principle of moments, beam reactions, momentum as mass
× velocity, the gear rule by teeth, torque and speed through a gear pair, compound ratios multiplying
(Mechanics and materials). Resolving and adding vectors (Vectors). Sin, cos, tan and their inverses
(Trigonometry). Substitution and elimination (Linear systems). Each is reminded in one line where a
puzzle uses it.

**Left for later:**
- **Circuits** (next in this folder): current, voltage and resistance as puzzles (notes 5.3). Brilliant's
  Circuits is its own 31-lesson course (notes 1.4).
- **Science puzzles** (later in this folder): the same ground again as one puzzle a day. Brilliant's
  Science Puzzles reuses ray tracing, mobiles, pulleys and gears (notes 1.4). Kaleidoscopes and
  pulleys wait there.
- **Quantum computing** (last in this folder): quantum superposition, which Brilliant lists among this
  course's topics (notes 1.1, 5.3).
- **Waves and light** (Physics folder): waves, sound, the wave equation, wavelength, lenses and
  curved mirrors (notes 5.3).
- **Your Level 3 course next year:** bending, beam diagrams and the rest of structures beyond the
  joints.

## 2. The lessons, in the order they build
Brilliant's own order, with its two gear levels joined at the start (notes 1.1). Within each topic
the order matches Bitesize and OpenStax: moment, balance, lever, gears; calculate, conserve; reflect,
refract, total internal reflection, dispersion (notes 2.2, 2.3).

| # | Lesson | What it teaches |
|---|---|---|
| 1 | Gears | Opening puzzle: a driver and one 20-tooth gear, still; which way will it turn? Then a chain of five gears in a line (review, 2 Nov: the pair comes first). Trace it gear by gear. Where two gears meet, their teeth move the same way, so the gears turn opposite ways (Bitesize, notes 4.1). Three more chains to trace before the rule, since tracing many is how people find it (notes 6.4). An odd number of gears in a line turns the last the same way as the first, an even number the opposite way (CED, notes 4.1). An idler between two gears makes them turn the same way (Bitesize D and T, notes 4.1) and does not change the ratio (Bitesize 2025, CED, REV, notes 4.1). A closed loop of an odd number "will not turn no matter what their size and tooth count" (notes 4.1): two gears at one mesh are both trying to turn the same way and "jam each other" (Schwartz and Black, notes 6.4). An even loop turns smoothly (notes 4.1). An internal gear with an external one keeps the direction (CED, notes 4.1): moved out of the screens (review, 2 Nov) into the board's note on what it leaves out, since every gear on the board has outside teeth. Then the count: the teeth that pass the mesh are the same on both gears (CED, notes 4.1), so speed × teeth is the same on both, n₁T₁ = n₂T₂ (CED's N1 Z1 = N2 Z2, notes 4.1). A recall from Mechanics and materials lesson 7, now from counting. Typed: a 12-tooth gear at 60 rev/min drives a 36-tooth gear, which turns at 20 rev/min (example figures, computed). Put a 20-tooth idler between them: still 20 rev/min, now the same way. The bigger driven gear turns slower with a greater moment (Bitesize, notes 4.1). |
| 2 | Compound gear trains | Opening puzzle: a two-stage train; which gear turns fastest? Two gears keyed to one shaft "must revolve at the same velocity" (Notes and Sketches, notes 4.2), so the second pair starts from the first pair's output speed. The train's ratio is the stage ratios multiplied (Bitesize 2025, REV, CED, notes 4.2): 3 : 1 then 3 : 1 is 9 : 1 (Notes and Sketches, notes 4.2). Each stage reverses the direction (CED, notes 4.2). The fastest gear is the last of a speeding-up chain (my reading, notes 4.2). Why compound at all: one pair stops at about 10 : 1 (IIT Bombay, notes 4.2), and marine reduction boxes run 2 : 1 to 10 : 1 with "an additional gear train" for more (vendor, notes 7.1). Speed is traded for torque and the power is not affected (REV, notes 4.2; CUNY, notes 4.2), as a lever trades force for distance with the same work (UCSB, notes 4.2). Typed: an example 1450 rev/min motor through 15 : 45 then 12 : 48 is 12 : 1, so 120.8 rev/min (computed). A winch drum's torque is the cable pull × the drum's radius (ZF, notes 7.2): 5 kN on a 0.2 m radius is 1000 N m; through an ideal 50 : 1 train the motor gives 20 N m (example figures, computed). Winch boxes run from 21 to 1200 : 1 (Zollern, vendor, notes 7.2). |
| 3 | Balancing mobiles | Opening puzzle: a one-bar mobile with two weights at different distances; drag one until it hangs level. The balance rule: total clockwise moment equals total anticlockwise moment about the pivot (AQA, Bitesize, notes 2.1, 4.3), with the distance from the pivot measured at right angles to the force (Bitesize KS3, notes 4.3), a recall from Mechanics and materials lesson 2. Write the clockwise and anticlockwise moments down separately before you equate them (WJEC examiners, notes 6.1). Adding moments: three weights, two on one side. Adding a level: a lower bar hangs from a hook and acts as its total weight at that hook (my reading, notes 4.3). A bar's own weight acts at its middle (Mechanics and materials lesson 2), and a crane arm's own weight is the moment people leave out (Edexcel 2019, notes 6.1). A force through the pivot turns nothing, and any point may be the pivot (OpenStax, notes 4.3). The mystery weight: find it from the balance, CCEA's "find the weight of an object" (notes 3.1). Two unknowns: a two-level mobile with A at 10 cm and B at 20 cm on the lower bar, hung 15 cm left of the top pivot against 6 N at 15 cm right. So A + B = 6 N and 10A = 20B, which gives A = 4 N and B = 2 N (example figures, computed; Linear systems). Centimetres are fine if used throughout (Edexcel 2023, notes 6.1). Typed: Bitesize's see-saw, 750 N and 250 N with the child at 2.4 m, so the parent sits 0.8 m out (notes 4.3, computed); a crane jib in kN. |
| 4 | Collisions | Opening puzzle: a combination shot; aim the cue ball so the second ball drops in the pocket. Momentum is mass × velocity, a recall (Mechanics and materials lesson 4), in kg m/s (Edexcel 2020, notes 6.2). In a closed system, one with no outside forces, total momentum before equals total momentum after (Bitesize, AQA, notes 4.4, 2.1), in collisions and explosions (Bitesize, notes 4.4). Momentum has a direction, so a ball going the other way counts as negative (Bitesize, notes 4.4). Chain reactions, a Brilliant lesson title (notes 1.1): in a row of balls the same rule, applied hit by hit, passes the momentum along (my reading). Sticking: an example 2 kg trolley at 3 m/s hits a still 1 kg one and they join, so 6 kg m/s shared by 3 kg is 2 m/s (computed). Elastic or not: an elastic hit keeps all the kinetic energy (OpenStax, notes 4.4); a sticking hit loses the most (OpenStax, notes 4.4); most lose some (Isaac Science, notes 4.4). That example loses 3 J of its 9 J (computed). The kinetic energy that may be kept is the whole system's, not each ball's (notes 6.2). Glancing hits: work each direction on its own (Isaac Science, notes 4.4). An example ball at 2.0 m/s hits an equal still ball; one leaves at 1.73 m/s at 30°, the other at 1.00 m/s at 60° on the other side. Along: 1.5 + 0.5 = 2.0. Across: 0.87 − 0.87 = 0 (computed, Vectors). Typed: Bitesize's cannon, 4.0 kg at 120 m/s from a 96 kg cannon recoils at 5 m/s (notes 4.4, computed). |
| 5 | Structures | Opening puzzle: push on a square frame and a triangle frame; which holds its shape? A triangle of three bars is rigid (CSUS, notes 4.5), and a truss is built from triangles (MIT, notes 4.5). Degrees of freedom: each joint can move two ways, the supports take away three, each bar takes away one, so a rigid simple frame has m = 2j − 3 bars (CSUS, IIT Bombay, notes 4.5). A square has 4 joints and needs 5 bars, so with 4 it has a freedom and folds; a diagonal locks it (my reading, notes 4.5). Two new bars to each new joint keep it rigid (CSUS, notes 4.5). Then the forces: reactions first, from the whole frame by moments (CSUS, notes 4.5; Mechanics and materials lesson 2). Then each joint in turn, in an order with only two unknowns (CSUS, notes 4.5), with the forces at the joint closing into a triangle (Vectors). A bar that pushes on its joint is in compression; one that pulls away is in tension (CSUS, notes 4.5). Assume tension; a minus sign means compression (UPEI, notes 4.5). Typed: a triangle frame on two supports with 10 kN at its apex and sides at 30°: reactions 5 kN each, 10 kN of compression in each sloping bar and 8.66 kN of tension in the tie (example figures, computed). Lifting beams are bent in the middle; spreader beams work in compression (NSW, notes 4.5, 7.3). The screw is a ramp wrapped round a shaft (BoxSand, notes 4.5); one turn moves it one pitch (TeachEngineering, notes 4.5), and its advantage is circumference ÷ pitch (BoxSand, notes 4.5): an example 20 mm screw with a 2 mm pitch gives about 31, with friction ignored (computed). A fine thread gives more advantage (TeachEngineering, notes 4.5). A loose screw terminal has less contact area and gets hot (IAFSS, FVEAA, notes 7.4). |
| 6 | Mirrors | Opening puzzle: turn a mirror so a beam hits a target. Light is drawn as rays, the DfE's "ray model" (notes 3.1). The normal is a line at 90° to the surface, and both angles are measured from it (Bitesize, notes 4.6). The angle of incidence equals the angle of reflection (Bitesize, notes 4.6). Aiming mirrors: turn a mirror and the reflected ray turns twice as far (computed from the rule on screen). Images: the rays reaching the eye seem to come from behind the mirror (Bitesize, notes 4.6), from a point as far behind as the object is in front (OpenStax, notes 4.6). The image is the same size and upright (OpenStax, notes 4.6) and cannot be caught on a screen (OpenStax, notes 4.6). It is seen only from where the reflected light reaches (Galili, notes 6.3). Worked example: an object 1.5 m in front is seen 1.5 m behind, 3.0 m from itself (example figures, computed). Apparent distance: two mirrors at 45° make a periscope (SPS, notes 4.6), and the image is as far away as the whole folded path. An object 30 m from the top mirror, with the mirrors 2 m apart and the eye 0.1 m from the lower mirror, looks 32.1 m away (example figures, computed). Typed: angles from a ray drawn to the surface, image distances, the periscope. |
| 7 | Refraction and prisms | Opening puzzle: a coin in a tank; aim a rod where it looks, and miss. Light changes direction at a boundary because it changes speed (AQA, Bitesize, Isaac Science, notes 2.1, 4.7). Slower bends towards the normal (Bitesize, notes 4.7); a bigger change of speed bends it more (OpenStax, notes 4.7). The refractive index n = c ÷ v (Britannica, Isaac Science, notes 4.7), never below 1 (OpenStax, notes 4.7). Fresh water's is 1.333 (OpenStax, notes 4.7), so light there travels at about 2.25 × 10⁸ m/s (computed once c is cited). Things in water look nearer the surface (DfE, Bitesize, notes 3.1, 4.7); looking straight down, a fish looks 3/4 of its depth (OpenStax, notes 4.7), so a 1.2 m tank looks 0.9 m deep (computed). Snell's law, n₁ sin i = n₂ sin r, with the index as the ratio of the sines (Britannica, notes 4.7), beyond GCSE and said so (notes 3.4). Worked example: from air into water at 40°, sin r = 0.643 ÷ 1.333, so r = 28.8° (computed). The critical angle is where the bent ray reaches 90° (StatPearls, notes 4.7): sin c = n₂ ÷ n₁, 48.6° for water to air (computed). Past it, all the light reflects (OpenStax, notes 4.7), and only going from higher n to lower n (Isaac Science, notes 4.7). A 45° prism turns light through 90° by total internal reflection, as in older periscopes and binoculars (OpenStax, notes 4.6, 7.5). Dispersion: the index rises as the wavelength falls (OpenStax, notes 4.7), so violet bends more than red (OpenStax, CCEA, notes 4.7, 3.4). A fibre's core has a higher index than its cladding, which keeps light in by total internal reflection (EarthDate, notes 7.5). |

## 3. Can it be taught mostly visually, through interaction?
Yes. Every idea here is something you can watch happen: a gear turning, a bar tilting, a ball
leaving, a frame folding, a ray bending. So these are steps lessons of about 12 to 14 screens, short
SHOW screens and a DO screen after each, one main picture per lesson and still drawings elsewhere. The
typed puzzles at the end of each lesson carry the mathematics. The pictures, and why each was chosen:
- **The gear board (lesson 1).** Pegs on a board, a driving gear on one. Drag gears from a tray onto
  pegs; a gear meshes when it touches. Turn the driver by dragging round its rim. Each gear has one
  marked tooth and a direction arrow. At each mesh a counter ticks the teeth that pass on both sides,
  and a revolution counter sits on each gear. Drop a gear that closes a loop: an even loop turns, an
  odd loop locks, with the one mesh where two gears push the same way drawn in red. *Why:* "the teeth
  of both gears move upwards. This means that the gears rotate in opposite directions" (Bitesize,
  notes 4.1), and the tooth count at the mesh is CED's own way in: 6 teeth turned 3 times move 18
  teeth through the mesh (notes 4.1). The cause shown is that teeth meet one for one, which gives the
  direction rule, the idler and n₁T₁ = n₂T₂ from one picture. The odd loop jams because two gears "are
  both trying to turn this way" (Schwartz and Black, notes 6.4), and the red mesh shows that pair.
- **The two-stage train (lesson 2).** A motor pinion, a wheel, a second pinion keyed on the wheel's
  shaft, an output wheel and a winch drum with a hanging load. Drag any gear's tooth count and turn
  the motor. A revolution counter on each gear. Speed and torque bars on each of the three shafts,
  and one power bar running through. Tap any gear to ask "is this the fastest?" *Why:* Brilliant's
  sixth level asks for "The Fastest Gear" and "Counting Rotations" (notes 1.1). The shared shaft is
  the step people skip: two gears "keyed onto shaft B ... must revolve at the same velocity" (notes
  4.2). The cause shown is that the shaft passes its speed on unchanged, so the stage ratios multiply,
  and the power bar shows that speed is only ever traded for torque (REV, notes 4.2).
- **The mobile (lesson 3).** A mobile of two or three levels. Drag weights and hooks along any bar.
  Each bar tilts in proportion to its net moment and settles level when balanced. At each pivot a
  clockwise and an anticlockwise bar, each labelled force × distance from the pivot. A distance
  readout measures from the pivot, never from the end. Tap a lower level to fold it into one weight
  at its hook. The "?" box's weight shows only when you type it. *Why:* Brilliant's mobiles level
  climbs from balancing to multiple unknowns and simultaneous solving (notes 1.1). Children move from
  weight alone to weight and distance together (NSTA, notes 6.1), and conflict problems, where one
  side has more weight and the other more distance, are where they fail (Frontiers, notes 6.1). The
  bars show the product, not the weight, as the cause of the tilt. Writing the two moments separately
  is what examiners say decides success (WJEC, notes 6.1), and the two bars do exactly that.
- **The pool table (lesson 4).** A table from above. Drag the aim, pull back for speed. Each ball
  carries a momentum arrow before and after. Beside the table, the arrows add nose to tail into one
  total, before and after: the same arrow. A bounce slider runs from "ideal bouncy" to "sticky", with a
  kinetic energy bar for the system before and after. A heavy ball switch makes the masses unequal. On
  a glancing hit, each arrow splits into its part along the first ball's line and its part across.
  *Why:* students treat momentum as a scalar (notes 6.2), and the total arrow cannot be read without
  its direction. Many think momentum and kinetic energy are kept "for each object" (Singh, notes 6.2);
  the per-ball arrows change while the total stays. The bounce slider separates the two: the total
  momentum never changes, the kinetic energy bar does. Momentum components in two directions are
  Isaac Science's way through glancing hits (notes 4.4), and Vectors gives you the parts.
- **The frame on two supports (lesson 5).** Joints you drag and bars you add between them, on a pin
  and a roller support. Drag a joint: a square folds, a triangle holds. A counter reads bars against
  2j − 3. Hang a load on a joint: reaction arrows appear at the supports. Tap a joint: its bar forces
  and the load close into a triangle beside it, and each bar is labelled "pull" or "push", its arrow
  pointing away from the joint or into it. A closing still unrolls a screw's thread into a ramp.
  *Why:* Brilliant's structures level runs from rigid shapes and degrees of freedom to analysing
  joints and screws (notes 1.1). A rigid truss "will not collapse under the application of a load"
  (IIT Bombay, notes 4.5), and the drag shows a missing bar as a freedom. The direction at the pin is
  CSUS's test for tension and compression (notes 4.5), and the triangle is Vectors' equilibrant.
- **The mirror bench (lesson 6).** A plane mirror from above, an object, an eye. Drag the object or
  the eye, or turn the mirror by its handle. The ray from object to mirror to eye is drawn with the
  normal and both angles. Dashed lines continue the reflected rays behind the mirror and meet at the
  image. Move the eye outside the reflected light: the ray goes and a note says the image cannot be
  seen from here. A switch adds a second mirror at 45° to make a periscope, and a readout gives the
  folded path. *Why:* students believe the image lies "somewhere along the observer-object line of
  sight" (notes 6.3), that image formation does not depend on the observer, and that the image can be
  seen from anywhere (Galili, notes 6.3). Ray diagrams "can be both the cause and the solution" of
  these (IOP, notes 6.3), so the eye and its rays are always drawn. The cause shown is that the eye
  traces rays back in straight lines, so the image sits where they seem to start.
- **The boundary (lesson 7).** A ray meeting a flat block of water or glass. Drag the ray's angle;
  swap the block's material. The bent ray, a faint reflected ray, the normal, both angles, and sin i
  ÷ sin r, which stays fixed for one material. A "marchers" switch shows the light's front as a row
  that slows as each end crosses, so the row turns. Reverse the ray to go from inside to outside and
  drag towards the critical angle: the bent ray lies along the surface, then vanishes and all of it
  reflects. A prism mode sends white light through a triangle of glass and fans it into colours. An
  apparent-depth mode draws a coin in water with an eye above and the rays traced back. *Why:* a
  "large change in speed causes a large change in direction" (OpenStax, notes 4.7), and the marchers
  show the slowing as the cause. Only 1 of 220 students placed a refracted image correctly with
  correct reasoning (Thai study, notes 6.3), so the apparent-depth mode always draws the observer.
- **Colour as before:** see the decisions.

## 4. What else
- **Benchmark (notes 1 and 2).**
  - **Brilliant's Scientific Thinking** is 40 lessons and 557 exercises in six levels: Gears,
    Mobiles, Pool, Structures, Optics, Compound Gears (notes 1.1). It has no prerequisites and sets out
    to "dispense with number-crunching" (notes 1.1). What happens inside each lesson is UNCONFIRMED;
    the page lists titles only (notes 1.1, 9). Brilliant is renaming courses, levels and lessons as
    topics, units and concepts (notes 1.5).
  - **Physics of the Everyday** (33 lessons) covers momentum and torque through sport and household
    objects, with beam and truss bridges as its only structures (notes 1.2). Whether its lessons use
    numbers is UNCONFIRMED (notes 1.2). **Classical Mechanics** (48 lessons) has momentum at level 5
    and statics at level 7, at calculus level, and no gears or optics (notes 1.3).
  - **The GCSE boards** (AQA, Edexcel, CCEA, WJEC, the DfE content): moments, levers and gears as one
    topic, momentum Higher Tier, reflection and refraction in waves (notes 2.1, 3.1). Bitesize runs
    moment, balance, lever, gears; calculate, conserve; reflect, refract (notes 2.2).
  - **OpenStax College Physics** puts momentum before statics, and its geometric optics runs rays,
    reflection, refraction, total internal reflection, dispersion, then lenses and mirrors (notes
    2.3).
  - **Isaac Science** has gear puzzles up to multiple-stage reduction, a collisions concept, and a
    GCSE refraction set that includes Snell's law and critical angles (notes 2.4).

  The course follows Brilliant's six levels with its gears joined at the start, and adds what
  Brilliant leaves out and you asked for: the working, typed and checked. It takes the exam boards'
  equations and units, OpenStax's order inside optics, and Isaac Science's reach to Snell's law.
- **Starting point.** All of Foundational maths and Algebra, Calculus fundamentals, Vectors,
  Differential equations, Matrices, Linear algebra and Statistics for engineers; AC circuits,
  Electronics and power electronics, Design and verification, Motors, HV Subsea Cable Testing,
  Insulated systems and earth faults, and Batteries; Mechanics and materials and Heat and fluids (see
  "It builds on"). From your trade: winches, lifting and slinging, screw terminals and their torque.
  Whether HV Subsea Cable Testing covered fibre is UNCONFIRMED (notes 7.5), so lesson 7's fibre screen
  teaches it from the start.
- **His aim (notes 3).** No public syllabus was found for your January course (notes 3.1) or your
  Level 3 course (notes 3.3), so the course is planned against the nearest public lines, and each
  guess is said:
  - **GCSE physics,** for January: the DfE content's moments, levers and gears, momentum in
    collisions, plane-mirror images and refraction in words (notes 3.1).
  - **The Royal Navy's aptitude test** names "Mechanical Comprehension" (notes 3.2). What is in that
    section is UNCONFIRMED.
  - **Maritime mechanical and electrical mechanic (ST0276):** "Electrical, mechanical, pneumatic and
    fluid power engineering technology and principles" (notes 3.3).
  - **Engineering technician (ST0457), maritime electrical fitter option:** "the specific
    mathematical techniques, formula and calculation in a maritime electrical/electronic environment"
    (notes 3.3).
  - **Draft Level 3 maritime mechanical fitter (ST1402) K2:** "Engineering, mathematical and
    scientific principles" in a maritime fitting environment (notes 3.3), from a draft PDF.

  No standard names moments, gear trains, momentum, structures or optics (notes 3.3). So the course
  answers their general lines; none of them proves a particular lesson is needed. Lessons 6 and 7 are
  the furthest from any line and are there because you chose the scope.
- **Where it is used (each cited before a lesson uses it).**
  - **Gears (1):** a published warship transmission paper uses an idler to set a shaft's sense of
    rotation (IMarEST, notes 7.1). It is a surface ship, so the lesson uses it as a reversing idler
    only and names no vessel. GCSE: "explain how levers and gears transmit the rotational effects of
    forces" (AQA, Edexcel, notes 2.1, 3.1).
  - **Compound trains (2):** marine reduction gearboxes of 2 : 1 to 10 : 1, more by an extra train,
    and two propeller speeds from one engine speed (Finnoy, vendor, notes 7.1). Winch gearboxes for
    ship and port cranes, ratios 21 to 1200, chosen from cable pull × drum radius (ZF, Zollern,
    vendor, notes 7.2).
  - **Mobiles (3):** a crane arm in a moments question (Edexcel 2019, notes 7.3); a crane's safe load
    falls as its radius grows (load chart, vendor, notes 7.3); a winch drum's torque (ZF, notes 7.2).
  - **Collisions (4):** no trade or marine use was found in the notes. The lesson uses the GCSE line
    "apply equations about conservation in collisions" (DfE, notes 3.1) and Mechanics and materials'
    coupling trolleys, and claims no job use (UNCONFIRMED; see the gaps).
  - **Structures (5):** lifting beams bend and spreader beams are squeezed (NSW rigging guide, notes
    4.5, 7.3); keep to the marked SWL and sling angle (safe-use leaflet, notes 7.3). Loose screw
    terminals overheat (IAFSS, FVEAA, notes 7.4), a US laboratory study of mains sockets, so a general
    electrician's point.
  - **Mirrors (6):** older periscopes held two mirrors at 45° (SPS Naval Forces, notes 4.6), as general
    physics.
  - **Refraction (7):** older periscopes and binoculars use prisms by total internal reflection
    (OpenStax, notes 4.6, 7.5); a subsea fibre keeps its light in because its core's index is higher
    (EarthDate, notes 7.5); dispersion spreads a fibre's pulses (OpenStax, notes 7.5).
- **The mistakes to catch, each with a puzzle and its own hint.** Most of the research is on school
  and university students. That you would slip the same way is UNCONFIRMED, but these are slips
  about the ideas, so they are likely.
  - **Lesson 1, meshed gears turning the same way; an idler changing the ratio; the ratio upside
    down** ("Driven over driver"): from an exam-preparation site (Forever Wingman, SECONDARY, notes
    6.4). No examiner report or study counts gear mistakes (notes 6.4, 9), so these are hints on
    typed slips, not cited as common.
  - **Lesson 1, the odd loop:** reasoning by tracing finds it (Schwartz and Black, notes 6.4); the
    puzzle asks why it jams before it is named.
  - **Lesson 2, a gear pair raising both speed and torque:** "Impossible; it is a trade" (Forever
    Wingman, SECONDARY, notes 6.4). The power bar.
  - **Lesson 2, adding stage ratios instead of multiplying them:** no source counts it; it was a trap
    in Mechanics and materials lesson 7, so it is a slip on a typed answer, not a cited mistake.
  - **Lesson 3, weight alone decides; "all things balance in the middle":** NSTA's ladder and Pine and
    Messer (notes 6.1). The conflict puzzle, more weight one side and more distance the other
    (Frontiers, notes 6.1).
  - **Lesson 3, positions on the ruler instead of distances from the pivot:** WJEC 2025 and Edexcel
    2017 (notes 6.1).
  - **Lesson 3, the bar's own weight left out:** Edexcel 2019's crane arm (notes 6.1).
  - **Lesson 3, kilonewtons not converted:** Edexcel 2019 (notes 6.1).
  - **Lesson 3, a balance measures mass, not weight:** Edexcel 2017 (notes 6.1).
  - **Lesson 3, guessing when the moment sum makes no sense:** students "resorted to the
    'trial-and-error' method" (PMC, notes 6.1). The tilting bars give the sense first.
  - **Lessons 3 and 4, moment and momentum confused:** Edexcel 2017, 2019, 2020 and 2025 (notes 6.1,
    6.2).
  - **Lesson 4, momentum without its direction, or depending on mass or speed but not both:**
    per-central (notes 6.2). A ball going backwards.
  - **Lesson 4, momentum and kinetic energy kept for each object:** Singh (notes 6.2); more than 40%
    unsure which system keeps momentum (Singh, notes 6.2); the kinetic energy kept is the system's
    (notes 6.2).
  - **Lesson 4, soft objects do not keep momentum:** "objects must experience perfectly elastic
    collision" (IOP, notes 6.2). The sticky end of the slider.
  - **Lesson 4, momentum is a force:** Singh (notes 6.2).
  - **Lesson 4, the unit of momentum:** kg/m/s or kg m/s² written (Edexcel 2020, notes 6.2).
  - **Lesson 4, bodies that join:** "Candidates would benefit from practising ... bodies coalescing"
    (Edexcel 2019, notes 6.2). Two typed puzzles.
  - **Lesson 5:** no source in the notes counts a mistake about frames or screws. So these are checks,
    not cited mistakes: a square looks as strong as a triangle (the drag); a bar's push and pull are
    told by its arrow at the joint (CSUS, notes 4.5); a minus sign means compression (UPEI, notes 4.5).
  - **Lesson 6, the image on the line of sight:** per-central (notes 6.3). The periscope puzzle breaks
    it.
  - **Lesson 6, the image independent of the observer, seen from anywhere:** Galili (MDPI, notes 6.3).
    The eye dragged out of the light.
  - **Lesson 6, placing the image at all:** "many students fail at these tasks, both pre- and
    post-instruction" (Goldberg and McDermott, notes 6.3).
  - **Lesson 6, an angle measured from the surface:** both angles are measured from the normal
    (Bitesize, notes 4.6). No source counts the slip, so it is a typed slip with its hint.
  - **Lesson 7, where a refracted image sits and how light bends at the boundary:** the Thai study, 22%
    with a qualitative idea and 1 of 220 right with correct reasoning, misconceptions "even after
    instruction" (IOP, notes 6.3); teachers in training struggle with the ray model and the observer
    (EJP, notes 6.3).
- **Size and cost.** 7 lessons of about 12 to 14 screens on the agreed settings (CLAUDE.md).
  - Recent courses measured about 8.2M to 11M tokens for seven or eight lessons, about 1.1M to 1.3M a
    lesson (docs/plans/maths-queue.md). These lessons are lighter on words but each has a live
    puzzle picture; lessons 4 and 7 animate collisions and rays. So I estimate about 1.0M to 1.3M a
    lesson.
  - That is about 7.0M to 9.1M for the course, plus about 0.3M for the plan and the research
    top-up (the gaps below). The research itself is done (279 quotes).
  - The full process measured on Fractions lessons 4 to 8 was about 1.65M a lesson, about 11.6M for
    seven.
  - Each build's real cost is reported to you.
- **Pilot first.** Lesson 1 is built and checked first (about 1.1M, plus the plan). You try it on
  your phone; the other six wait for your say.
- **Gaps to close at build time.** None blocks the pilot. Each is cited at the research stage or the
  screen says less:
  - **Constants:** the speed of light in a vacuum, about 3.00 × 10⁸ m/s; a typical glass's index (an
    example 1.50 until cited, which would give a 41.8° critical angle); g = 9.81 m/s² if a mobile
    turns a mass into a weight.
  - **Lesson 1:** none; every rule it states is quoted (notes 4.1).
  - **Lesson 2:** "the fastest gear is the last of a speeding-up chain" is my reading (notes 4.2).
  - **Lesson 3:** that a hanging level acts as its total weight at its hook, in a source's words.
  - **Lesson 4:** that a smooth ball is pushed along the line joining the centres, for the combination
    shot; that two equal balls leave a glancing elastic hit at 90° to each other, which the example
    shows but no source states; any job use of collisions (UNCONFIRMED, notes 7).
  - **Lesson 5:** a public source giving a lifting beam's sling-angle forces with figures was not found
    (notes 9), so the beam screen stays qualitative.
  - **Lesson 6:** that turning a mirror by an angle turns the reflected ray by twice it, in a source's
    words; it is derived on screen from the law of reflection until then.
  - **Lesson 7:** the apparent depth rule as real depth × n₂ ÷ n₁ in a source's words (my reading,
    notes 4.7), beyond OpenStax's 3/4 for water.
  - **Throughout:** what is inside Brilliant's lessons is UNCONFIRMED (notes 1.1). The January
    syllabus is not public (notes 3.1). Whether AQA names total internal reflection or any board's
    list carries n = c ÷ v is UNCONFIRMED (notes 2.1, 9); Edexcel does name total internal reflection
    and the critical angle (notes 3.1). The final 2014 DfE content was read through its 2013 draft and
    the boards' printed versions (notes 3.1). The ST1402 lines are from a draft PDF (notes 3.3).
    Brilliant's older catalogue grouping is from an archive copy and is not quoted (notes 1.4).
