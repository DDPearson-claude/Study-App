# Mechanics and materials: the course brief

Written 26 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
the first course in the Engineering science shelf's Engineering science folder, "Forces, moments and
stress; motion, energy and power; rotation, torque and the shafts and gears that carry it." Heat and
fluids comes next in the folder and is built alongside. It owns temperature, heat, gases, pressure,
buoyancy, flow, pumps and heat engines, so that ground is left for it and each deferral below says
where it goes. You said "Start with engineering science" on 26 Oct and approved the build, so I have
taken the decisions for you and listed them below. Change any you like. Sources and quotes are in
`research-notes.md` beside this file (178 quotes, cut by script from the 43 saved tool results and
checked with `tools/eval/sources.mjs`, `failed: 0`). Section numbers below point there.

**What you asked for (24 Oct):** foundations that see you through any new topic, not a remake of
next year's marine engineering course. So this is general mechanical engineering from first
principles. It goes fast through what a BTEC Level 3 already gave you and deeper where a marine
engineering course goes. The examples are cranes and slings, pumps, motors, gearboxes, diesel
generators and shafts. Nothing in it is about a submarine's systems or propulsion plant.

## The short version
**Eight lessons**
1. Forces in balance (built first)
2. Moments and beams
3. Stress, strain and how materials fail
4. Motion and Newton's laws
5. Work, energy and power
6. Rotation: torque, inertia and run-up
7. Shafts, couplings, belts and gears
8. Vibration, resonance and balance

**The main pictures** (one per lesson, each moved with your finger, each showing the cause):
- **The sling and its hook (lesson 1).** A load hangs from a two-leg sling on a crane hook. Drag the
  hook up and down, or the legs' angle. The load stays the same, but each leg's tension arrow grows
  as the legs spread. Beside it, the hook's free-body diagram closes into a force triangle. At 120°
  between the legs, each leg carries the whole load.
- **The beam on two supports (lesson 2).** A lifting beam on two trestles with a chain block on it.
  Drag the block along the beam and change its load. The two support reactions are arrows that grow
  and shrink, and the nearer support always takes more. A switch adds the beam's own weight at its
  middle. Tap a support to take moments about it, and the clockwise and anticlockwise totals balance.
- **The tensile test bar (lesson 3).** A steel test bar in a testing machine. Drag the stretch and
  the stress-strain curve draws itself. It runs straight, yields, climbs to its peak and necks. Let
  go anywhere and the bar springs back. Before yield it comes back to zero. After yield it keeps a
  permanent stretch.
- **The trolley and its two graphs (lesson 4).** A crane trolley on a rail, with its velocity-time
  graph above and its net force graph below. Drag the corners of the speed graph. The trolley moves
  to match. A force arrow appears only while the speed is changing. Switch friction off, take the
  push away, and the trolley keeps rolling at a steady speed.
- **The winch and its energy ledger (lesson 5).** A motor winch lifting a load. Drag the load and
  the hoist speed. Bars show electrical power in, losses, and power into the load as it rises. The
  same lift done at half the speed takes the same energy at half the power. Release the brake and
  the load's stored energy turns into speed.
- **The spin-up rig (lesson 6).** A motor turning a disc with two masses on arms. Slide the masses
  out or in and set the motor's torque. Press start. With a steady torque the speed climbs steadily,
  and it does not just jump to a speed. Masses further out mean a slower run-up. The stored energy
  bar grows with the speed squared. A switch puts in a motor's torque-speed curve and a pump load,
  and the run-up slows and settles where they meet.
- **The gear pair (lesson 7).** A motor drives a pinion that meshes with a bigger wheel on a pump
  shaft. Drag the teeth on each. The output speed falls and its torque rises by the same ratio, and
  the power bar passes through, less a small loss. A dot at the mesh shows both gears' teeth moving
  at the same speed there. Switches add a second pair or swap the gears for a belt.
- **The unbalanced rotor (lesson 8).** A rotor with a heavy spot, on springy mounts. Drag its speed
  up. The heavy spot's pull grows with the speed squared and shakes the mounts. The shaking peaks at
  one speed, the critical speed, and falls again above it. Drag a damping slider and the peak drops
  and widens. Drag a balance weight round the disc, and opposite the heavy spot the shaking stops at
  every speed.

**Decisions taken for you** (say if you want any changed):
- **Eight lessons, in the statics-first order you gave.** You approved eight. The eight parts of
  the scope map one to one onto the BTEC Unit 1 static and dynamic sections, the HN Mechanical
  Principles outcomes and the MCA lists (notes 2.1, 3.3, 3.4, 8.1). Statics first is the engineers'
  order. Pearson's BTEC Unit 1, Bird, the MCA Applied Mechanics syllabus and Isaac's A level book
  all put forces, moments and stress before motion (notes 2). Bird lectures at the Defence School
  of Marine Engineering, HMS Sultan, and his book is the closest guide to a marine course (notes
  2.2). Khan, OpenStax and Brilliant go motion first (notes 2.3, 2.4, 1.1). That works too, but it
  leaves stress and statics till late.
- **Lesson 1 is built first, without a pause.** You approved the build, so lesson 1 is built and
  checked first, and the others follow without waiting. You can try it on your phone as soon as it
  lands.
- **Steps lessons, partly visual ("Partly", RUNBOOK section 0, item 3).** About 12 screens a
  lesson, SHOW then DO, ending on two or three mixed puzzles. SHOW screens may carry a short
  paragraph, at most about 90 words, because each lesson has words a picture cannot say alone:
  what a free-body diagram leaves out, what yield means, what Newton's laws say. Every lesson
  carries `format: 'steps'`, with `read` and `still` entries for the read-through.
- **Fast where you have been, deep where the course goes.** Lessons 1, 2, 4 and 5 are BTEC Level 3
  ground you probably met (notes 3.5), so they move quickly. Lessons 3, 6, 7 and 8 are where the HN
  and MCA lists go further: the stress-strain curve and fatigue, moment of inertia, gears and
  couplings, and vibration (notes 3.3, 3.4, 8.1). Which BTEC units you sat is UNCONFIRMED (notes
  3.5), so nothing assumes you met them.
- **Every lesson opens with one "still have it?" puzzle** on the earlier course it leans on. A
  right answer says "Still there" and carries on. A wrong one gives a one-line reminder, never a
  re-teach. The research suggests this so the lessons can move fast through what you pass (notes
  3.5). Motors does the same (its brief).
- **Predict first, then play.** Every DO screen on a cause asks you to predict with a reason before
  the picture moves. Prediction questions are what make a demonstration teach (PhET, notes 6.5), and
  misconceptions resist change (notes 6.5). Only 9% of students with one dynamics misconception got
  past it in a normal class (ASEE, notes 6.4). Interactive courses gained about twice what
  traditional ones did, 0.48 against 0.23 (Hake, notes 6.5).
- **Units and a size check in every lesson.** N, N m, J, W, Pa and rad/s are said every time. Each
  calculation lesson ends on "is that answer sensible?" Examiners report an inverted stress formula
  giving an extension "they should have realised was impossible" (Edexcel, notes 6.3).
- **Not taught again:** resolving, adding forces nose to tail, the equilibrant, the dot product as
  work and the cross product as a moment (Vectors). Slope and area under a graph (Calculus
  fundamentals). Hooke's law as a gradient and the law of a machine (Straight-line graphs).
  Inverse proportion and a gearbox as a ratio of speeds (Proportional reasoning). Radians, rev/min to
  rad/s and P = ωT (Trigonometry lesson 5). The spring-mass-damper, its roots and the driven swing
  (Differential equations lessons 5 to 7). Normal modes (Linear algebra lesson 7). Series resonance
  (AC circuits). Each is reminded in one line where it is used.
- **P = Tω goes deeper, not over.** The notes could not find P = Tω in the Motors brief (UNCONFIRMED,
  notes 5.1). I checked: Motors' lessons do not state it. Trigonometry lesson 5 taught P = ωT with
  rev/min × 2π ÷ 60 (its brief), and Motors lesson 4 ran a motor up its torque-speed curve until the
  motor's torque met the load's. Lesson 6 uses both and adds what neither had: why it takes time to
  run up, which is moment of inertia.
- **Couples get one screen in lesson 2.** No syllabus line names them (UNCONFIRMED, notes 4.2). But
  a shaft's torque is a couple, so the screen is the bridge to lesson 6.
- **Fatigue is named as the most common way shafts fail, with no percentage.** The "about 90
  percent" figure is a textbook estimate from a copied chapter (SECONDARY, notes 4.3). The lessons say
  "most common", which two sources support (notes 4.3, 7.2).
- **The tie to electrical power is taught as the energy rule, not as a quote.** A motor turns
  electrical power into shaft power, and a generator the reverse, each with losses. No source in the
  notes draws that link (my reading, notes 4.5). It follows from conservation of energy, which BTEC
  lists (notes 2.1), and the fact-check confirms the wording.
- **Lifting machines get one screen in lesson 5.** BTEC and the MCA both list mechanical advantage,
  velocity ratio and efficiency (notes 2.1, 3.4). You have the law of a machine from Straight-line
  graphs, so the new part is efficiency = MA ÷ VR on a chain block.
- **Centripetal pull arrives in lesson 8, as the unbalance force.** BTEC lists a = ω²r (notes 2.1).
  Here it is the heavy spot's pull, m r ω², which is why unbalance grows with speed squared (notes
  4.8).
- **Gearbox examples are a pump drive and a winch, never propulsion.** The only gearbox quote found
  is about a marine diesel and its propeller (notes 7.4). Only its ratio rule is used.
- **Left out, and named in lesson 8's last screen as what comes next.** Shear force and bending
  moment diagrams, second moment of area, bending stress and the torsion of shafts, T/J = Gθ/L = τ/R
  (HN and MCA ground, notes 3.3, 3.4, 8.1). Pin-jointed frames (notes 3.5). Universal couplings,
  lead screws, belt tension and gyroscopic motion (notes 3.3). These belong to the course you start
  next year. Bow's notation stays out too. Vectors sent it here, but no source in either course's
  notes explains it.
- **Left for Heat and fluids, built alongside.** Pressure, density, buoyancy, flow, pumps' head and
  flow, drag, heat engines, thermal expansion and the materials' response to temperature (notes
  1.2, 2.1, 3.3, 3.4). A pump here is only a load on a shaft. A diesel generator here is only its
  flywheel and its coupling.
- **Example numbers are labelled.** Loads, speeds and dimensions in the puzzles are example figures,
  said so on screen, or computed from a rule the screen shows. Material constants such as steel's
  stiffness and strength, and friction coefficients, are cited before a lesson uses them (see the
  gaps). No figure is presented as a real machine's or a regulation's.
- **Your intake answers** (`intake.json`): to understand mechanics and materials and how to work
  with them; on the job and in everyday life; hands-on, with the why explained in full.

## 1. The overall topic
Mechanics is about what forces do. Held still, forces balance and turn things, and they stress the
parts that carry them. Unbalanced, they change how things move. A force moved through a distance
does work, and how fast it does it is power. Turned into rotation, the same ideas become torque,
angular speed and moment of inertia. A machine's shafts, couplings, belts and gears carry that
power from a motor to a load. When something turns out of balance, it vibrates.

This course builds those ideas from first principles in that order. It starts with what you already
do on the job: rigging a lift, judging a load on a beam. It ends at the turning machinery an
electrician meets every day: a motor coupled to a pump through a gearbox, and the shaking that
warns it is going wrong.

**It builds on:**
- **Vectors:** resolving a force (lesson 2), adding forces nose to tail with the equilibrant and the
  closed chain (lesson 3), work as the dot product (lesson 5), a moment as the cross product, the
  spanner and the bolt (lesson 6).
- **Calculus fundamentals:** velocity and acceleration as rates (lesson 5), the area under a rate
  graph as a total (lesson 8), work as an area (lesson 9).
- **Trigonometry:** sin and cos for resolving, radians, rev/min to rad/s and P = ωT (lesson 5).
- **Straight-line graphs:** load against extension, whose gradient is the spring's stiffness, the
  limit of proportionality, and a lifting machine's law, P = aW + b (lessons 5 and 6).
- **Proportional reasoning:** inverse proportion, and a reduction gearbox as a ratio of speeds
  (lesson 6).
- **Geometry fundamentals:** circle areas, for a bar's cross-section.
- **Powers and roots and Solving equations:** square roots and rearranging formulas.
- **Differential equations:** the spring-mass-damper (lesson 5), overdamped, critical and ringing
  (lesson 6), the driven swing and resonance (lesson 7), and a motor's mechanical time constant
  (lesson 3).
- **Linear algebra:** two masses on springs and their normal modes (lesson 7).
- **AC circuits and Motors:** power, efficiency and series resonance, and a motor's torque-speed
  curve meeting its load (Motors lesson 4).

**Taught inline, because no course has built it** (notes 5.1): the free-body diagram habit; the
moment of a force, a couple and the centre of gravity; stress, strain, Young's modulus and the
curve; Newton's three laws and momentum as plain ideas; kinetic and potential energy; moment of
inertia and angular acceleration; gear ratio and efficiency; the natural frequency of a mass and a
spring in plain words, now as a machine.

**Left for later:**
- **Heat and fluids** (same folder, built alongside): pressure, density, buoyancy, hydrostatics,
  flow, pumps, drag, gases, heat and heat engines. Brilliant's "Pressure" and "Buoyancy" lessons
  sit there too (notes 1.2), as do BTEC's fluid section D and the MCA's Applied Heat and General
  Engineering Science B (notes 2.1, 3.4).
- **Your Level 3 course next year:** beam diagrams, bending, torsion theory, frameworks and the
  rest of the HN and MCA second engineer list (notes 3.3, 3.4, 8.1).

**Edges.** One- and two-dimensional statics, straight-line motion and rotation about a fixed axis.
No projectiles, no circular motion beyond the unbalance force, no relativity or Lagrangian
mechanics (Brilliant's later levels, notes 1.2). Scientific calculator only.

## 2. The lessons, in the order they build
Statics, then strength, then motion, then energy, then rotation and the machinery that carries it,
then vibration. This follows Bird's Mechanical Engineering Principles, the BTEC Unit 1 order and the
HN Mechanical Principles outcomes (notes 2.1, 2.2, 3.3).

| # | Lesson | What it teaches |
|---|---|---|
| 1 | Forces in balance | Recall: forces on a ring close into a triangle when balanced (Vectors lesson 3). A free-body diagram frees one object from its surroundings and draws every force on it (BTEC "space and free body diagrams", notes 2.1; LibreTexts, notes 4.1). Every force has a giver: the rope, the deck, the Earth. A force arises when two objects interact; it is not something an object carries (IOPSpark, notes 6.1). Balance: ΣFx = 0, ΣFy = 0 (BTEC, notes 2.1). The two-leg sling: each leg holds up half the load's weight with its vertical part only, so the tension is W ÷ (2 cos θ) with θ measured from the vertical (my reading in notes 4.1, from Vectors' resolving). A 1000 kg load (9.81 kN) gives 5.66 kN a leg at 60° between the legs, 6.94 kN at 90° and 9.81 kN at 120° (example figures, computed). The leg's strength does not change, only its load (US DOE, notes 4.1). The rigger's load angle factor is the sling length ÷ the vertical height (US DOE, notes 4.1): 2.0 at 120° (computed). Angles near 30° to the horizontal are "extremely hazardous" (IHSA, notes 7.1). Friction is a force along the surface that opposes sliding (IOPSpark, notes 6.1). It grows to match the push until the surface lets go, then slips at a slightly lower value: static then dynamic friction (MCA, notes 4.1). F = μN, with μ cited at research. Useful and harmful friction, and what lubrication does (MCA, notes 4.1). |
| 2 | Moments and beams | Recall: the spanner and the bolt, 150 N on 0.3 m is 45 N m (Vectors lesson 6). A moment is the turning effect of a force (Bitesize, notes 4.2): force times the distance measured at right angles to it (Bitesize, Edexcel, notes 4.2, 6.3). The principle of moments: balanced, the clockwise total equals the anticlockwise total (MCA, notes 4.2). Full balance needs ΣFx = 0, ΣFy = 0 and ΣM = 0 (BTEC, notes 2.1). A uniform body's weight acts at its middle (Edexcel, notes 6.3). The centre of gravity of a group is found by taking moments of mass (MCA, notes 3.4, 4.2). A simply supported beam: take moments about one support to find the other's reaction, then the forces add to find the first (BTEC, MCA GES A, notes 2.1, 4.2). A 6 kN load 1 m along a 4 m beam gives 4.5 kN and 1.5 kN (example figures, computed). A uniformly distributed load acts as one load at its middle (BTEC, MCA, notes 2.1, 4.2). A couple: two equal, opposite, offset forces turn without pushing anywhere, the same moment about any point (one screen; UNCONFIRMED as a syllabus item, notes 4.2). A shaft's torque is a couple, which lesson 6 picks up. |
| 3 | Stress, strain and how materials fail | Recall: a spring's load against extension is a straight line whose gradient is its stiffness, until the limit of proportionality (Straight-line graphs lessons 5 and 6). Direct stress σ = F ÷ A and strain ε = ΔL ÷ L (BTEC, notes 3.2). Stress is force per area, in pascals or N/mm², not a force (Cambridge examiners, notes 6.3). Tension, compression and shear; shear stress τ = F ÷ A on a bolt or key cut across (BTEC, MCA GES A, notes 3.2, 3.4). A 10 kN pull on a 20 mm bar is 31.8 N/mm² (example figures, computed). Young's modulus E = σ ÷ ε is the material's stiffness (BTEC, LibreTexts, notes 3.2, 4.3), and stiffness and strength "mean very different things" (Cal Poly Humboldt, notes 6.4). The tensile test (MCA, notes 3.4): the straight elastic part, the elastic limit, yield, the ultimate tensile strength and necking. Elastic and plastic, ductile and brittle, tough and hard (MCA GES A, notes 3.4). Working stress and factor of safety: the failing stress ÷ the working stress, and safe working load (MCA GES A, notes 3.4). Fatigue: a load that comes and goes, far below what would bend the part once, cracks it in time (Shaft Failure Analysis, SECONDARY, notes 4.3). A turning shaft's surface goes from tension to compression every turn (SECONDARY, notes 4.3). Fatigue is the most common way shafts fail (ScienceDirect, notes 4.3), "probably" pump shafts too (SECONDARY, notes 7.2). A keyway concentrates stress and starts the crack (ScienceDirect, notes 7.2). |
| 4 | Motion and Newton's laws | Recall: velocity is the slope of a distance-time graph, and distance the area under a speed-time graph (Calculus fundamentals lessons 5 and 8). Displacement, velocity and acceleration. On a velocity-time graph the slope is the acceleration and the area is the displacement (MCA, notes 4.4). Read off that graph, the four constant-acceleration equations, v = u + at, s = ut + ½at², v² = u² + 2as and s = ((u + v) ÷ 2)t, each found from the slope and the area (MCA, notes 3.4). Newton's first law: with no net force, a moving thing keeps moving at a steady speed. Everyday friction is what makes things seem to stop by themselves (ScienceDirect review, notes 6.1). Second law: net force = mass × acceleration. A 2000 kg trolley taken from 0 to 0.5 m/s in 2 s needs 500 N net (example figures, computed). Third law: forces come in equal and opposite pairs on two different objects (MDPI, APS, notes 6.1). Momentum is mass × velocity. An impulse, force × time, the area under a force-time graph, changes it. Two trolleys that couple share their momentum, which is conserved (BTEC, MCA GES A, notes 2.1, 4.4). Momentum is not a moment (Cambridge, Edexcel, notes 6.3). |
| 5 | Work, energy and power | Recall: only the part of a force along the movement does work, 200 N at 30° over 5 m is 866 J (Vectors lesson 5). Work = force × distance moved along it, in joules, a newton-metre, not a newton meter (Bitesize, notes 6.3). Work is the area under a force-distance graph (Calculus fundamentals lesson 9). Potential energy mgh and kinetic energy ½mv². Conservation of energy: energy changes form but the total stays (BTEC, notes 2.1). Released, a load's height turns into speed. Power is work done per unit time (Bitesize, notes 4.5), and for a steady pull it is force × speed. A winch lifting 500 kg at 0.2 m/s needs 981 W at the load; 10 m takes 50 s and stores 49.05 kJ (example figures, computed). Power and work are different things (Cambridge, notes 6.3). Efficiency is useful power out ÷ power in. At an example 80%, that winch draws 1226 W from the supply (computed). The electrical tie: a motor's electrical power in is its shaft power plus its losses, as P = VI met P = Fv (my reading, notes 4.5). Lifting machines: mechanical advantage, velocity ratio, and efficiency = MA ÷ VR (BTEC, MCA GES A, notes 2.1, 3.4). |
| 6 | Rotation: torque, inertia and run-up | Recall: 1450 rev/min is 151.8 rad/s, by × 2π ÷ 60 (Trigonometry lesson 5). Angle, angular speed ω and angular acceleration, the rotating twins of lesson 4. Torque is the turning moment on a shaft, a couple (lesson 2). Work done = T × θ and power = T × ω = 2πNT (MCA, notes 3.4; BTEC, notes 2.1). An example 11 kW motor at 1450 rev/min gives 72.4 N m (computed). Convert to rad/s before multiplying (MTU, notes 4.6). Moment of inertia I: how hard a body is to spin up, set by its mass and how far out the mass sits. Net torque = I × angular acceleration, lesson 4's second law turned round. A steady net torque gives a steadily rising speed, not a steady speed (Rimoldini and Singh, notes 6.2). Run-up: 50 N m net on 2 kg m² gives 25 rad/s², so 6.1 s to 151.8 rad/s (example figures, computed). With a real motor and pump the net torque shrinks as the speed rises and the run-up settles where the curves meet (Motors lesson 4). Rotational kinetic energy ½Iω² (BTEC, Pearson booklet, notes 2.1, 4.5): 23.1 kJ in that disc at full speed (computed). Doubling the speed stores four times the energy (FIRGELLI, SECONDARY, notes 4.6). A flywheel uses that store to smooth an engine's uneven torque (SECONDARY, notes 7.4), as on a diesel generator. |
| 7 | Shafts, couplings, belts and gears | Recall: a 5 : 1 reduction turns 1450 rev/min into 290 rev/min (Proportional reasoning lesson 6). A shaft carries torque from a driver to a load; P = Tω says a slower shaft carries more torque for the same power (MCA, notes 4.7). A coupling joins two shafts (to cite at research). Two gears in mesh move their teeth past the mesh at the same speed, so speeds go inversely as the teeth. Torque goes the other way, and power passes through less a small loss. Through a 5 : 1 box at an example 95%, 72.4 N m at 1450 rev/min becomes 344 N m at 290 rev/min, 10.45 kW out of 11 kW (computed). Output speed = input speed ÷ reduction ratio (AB Marine's rule, notes 7.4, used for a pump drive). A compound train multiplies its ratios: the MCA's "movement ratio for simple and compound gear trains" (notes 3.4). Gear trains, belts and clutches (HN, notes 4.7): a belt does the same with pulley diameters. Alignment in outline: the shafts' centre lines must be in one line (Emerson, notes 4.8). Misalignment is angular, parallel or both (SKF, notes 4.7). It does not cost the motor efficiency measurably, but it makes vibration, noise and heat, and wears out bearings, couplings and shafts early (US DOE, notes 4.7, 7.3). Critical machines are checked for alignment every year (US DOE, notes 7.3). |
| 8 | Vibration, resonance and balance | Recall: a driven spring swings hardest when the drive matches its own frequency (Differential equations lesson 7). A mass on a spring vibrates at its natural frequency, f = (1/2π)√(acceleration ÷ displacement) (MCA, notes 3.4), which is (1/2π)√(k ÷ m) for a spring, from Differential equations lesson 6. Stiffer goes faster, heavier goes slower. Resonance is driving at the natural frequency (OpenStax, notes 4.8). A rotor with a heavy spot pulls on its bearings once a turn with a force m r ω², BTEC's a = ω²r (notes 2.1), so the force grows with the speed squared (Missouri S&T, SECONDARY, notes 4.8). 10 g at 0.1 m pulls 24.7 N at 1500 rev/min and 98.7 N at 3000 (example figures, computed). A critical speed is a running speed that excites resonance (Emerson, notes 4.8). Keep about 10% clear of it where you can (Wachel, SECONDARY, notes 4.8). Damping lowers and widens the peak; the biggest response comes with the least damping (OpenStax, notes 4.8). Balancing: a mass placed opposite the heavy spot cancels its pull (MCA, HN, notes 3.4, 3.3). Condition monitoring: vibration reveals misalignment, unbalance, looseness, worn bearings and gear wear (Honeywell, SECONDARY, notes 7.3). Misalignment is the commonest cause after imbalance (TAMU, SECONDARY, notes 7.3). Spectrum analysis tells bearing wear, misalignment and electrical causes apart (US DOE, notes 7.3). ISO 20816-1 is the measurement standard, named once (notes 7.3). Normal modes and torsional vibration are named, not taught (Linear algebra lesson 7). The last screen names what comes next (see the decisions). |

## 3. Can it be taught mostly visually, through interaction?
Partly. Every idea has one cause a picture shows better than words, and around it are a few words a
picture cannot carry: a definition, a law, a habit. So these are steps lessons of about 12 screens,
SHOW screens up to about 90 words, one main picture per lesson and still drawings elsewhere. The
pictures, and why each was chosen:
- **The sling and its hook (lesson 1).** A load on a two-leg sling. Drag the hook height or the leg
  angle; the angle reads both between the legs and from the horizontal. Each leg's tension arrow
  grows as the legs spread, while the load's arrow stays the same. The hook's free-body diagram sits
  beside it: two leg tensions and the hook's pull, closing into a triangle. A readout gives each
  leg's tension and the load angle factor. A second, small picture is a crate on a deck: push
  harder and the friction arrow grows to match, until it slips. *Why:* HSE says "the load in the legs
  of a sling increases as the angle between the legs increases" (notes 4.1), and the US DOE rigging
  guide names the mistake, that the leg itself weakens (notes 4.1). Vectors' ring is the same maths,
  so the new part is the free-body habit and a lift you have rigged. The cause shown is that the legs
  share only the vertical work, while their sideways parts fight each other.
- **The beam on two supports (lesson 2).** A lifting beam on two trestles. Drag the chain block
  along it and set its load. The reactions are arrows with readouts. Tap a support to take moments
  about it: the clockwise and anticlockwise totals show as two bars that always match. A switch adds
  the beam's own weight, drawn at its middle. A last switch replaces the block with a spread load.
  *Why:* Brilliant teaches moments with balancing mobiles before any formula (notes 1.4) and has a
  "Plank Statics" lesson (notes 1.1). BTEC and the MCA want support reactions with point loads and
  spread loads (notes 2.1, 4.2). The cause shown is that the nearer support takes more, because the
  far one's moment arm is longer.
- **The tensile test bar (lesson 3).** A bar between grips, its gauge length marked. Drag the
  stretch. The force and extension read out, and stress and strain beside them. The curve draws as
  you go, with the elastic line, yield, the peak and necking marked. Let go anywhere. Before yield the
  bar springs back to zero. After it, the bar unloads along a line parallel to the first and keeps a
  permanent stretch. The slope of the straight part is labelled stiffness, the height of the peak
  strength. A material switch compares two curve shapes from cited values only. *Why:* the MCA asks
  you to "Explain the tensile test" (notes 3.4). Stiffness and strength are easily confused (Cal Poly
  Humboldt, notes 6.4; FIE 2011, notes 6.4), and the curve shows them as different things: a slope
  and a height. The curve's shape is drawn from the material's cited values or labelled as a shape.
  A closing still shows a turning shaft whose surface goes from stretched to squeezed every turn,
  for fatigue (notes 4.3).
- **The trolley and its two graphs (lesson 4).** A crane trolley on a rail. Above, its
  velocity-time graph with draggable corners: speed up, run steady, brake. Below, the net force
  graph that follows from it. The slope is shaded as acceleration and the area as distance. The
  trolley runs along with them. Switch friction off and take the push away mid-run, and the trolley
  keeps going at a steady speed. A "couple up" mode rolls one trolley into another, with the pair of
  equal and opposite forces drawn on each. *Why:* the MCA wants slope and area read from the graph
  (notes 4.4). Over 70% of school students in one study held a mechanics misconception, most often
  that motion needs a force (IJERT, SECONDARY, notes 6.1). The force graph shows force with changes
  of speed, not with speed itself.
- **The winch and its energy ledger (lesson 5).** A motor winch, a rope and a load. Drag the load
  and the hoist speed. Three bars: electrical power in, losses, power into the load. A height and an
  energy readout climb as it lifts. A "same lift, half speed" button shows the same energy at half
  the power over twice the time. "Brake off" lets the load fall a short way: the stored energy bar
  empties into a speed bar. *Why:* Bitesize defines power as work done, or energy transferred, per
  unit time (notes 4.5). Examiners find power and work confused (Cambridge, notes 6.3), and kinetic
  energy worked out where power was asked (Edexcel, notes 6.3). The ledger keeps the energy and how
  fast it moves apart, and its first bar is the electrical power you already know.
- **The spin-up rig (lesson 6).** A disc with two masses on arms, driven by a motor. Slide the
  masses in or out and set the torque. Press start. The speed trace climbs in a straight line and
  the run-up time reads out. A bar for ½Iω² climbs as a curve, not a line. A switch puts in a
  motor's torque-speed curve and a pump's load curve: the gap between them is the net torque, which
  shrinks as the speed rises, and the run-up settles where they meet. *Why:* students think
  "constant net torque implies constant angular velocity" and struggle with how kinetic energy
  depends on the moment of inertia (Rimoldini and Singh, notes 6.2). Examiners find ω not squared
  (WJEC, notes 6.2). The rig shows all three as causes you can see, and the switch goes deeper than
  Motors lesson 4's picture, not over it.
- **The gear pair (lesson 7).** A motor pinion meshing with a wheel on a pump shaft. Drag the
  teeth on each gear. Speed and torque arrows on both shafts change in opposite ways. A power bar
  runs through, less a loss set by an efficiency slider. A dot at the mesh moves at the same speed
  on both gears. A switch adds a second pair, so ratios multiply. Another swaps the gears for a belt
  and pulleys. *Why:* Brilliant's Scientific Thinking starts with four gear lessons as pictures
  before any number ("Gears Changing Speeds", "Compound Gears", notes 1.4). The MCA wants simple and
  compound trains (notes 3.4). The cause shown is the shared speed at the mesh. A still drawing of
  angular and parallel misalignment follows (SKF, notes 4.7).
- **The unbalanced rotor (lesson 8).** A disc with a heavy spot, on springy mounts. Drag the speed.
  The heavy spot's pull is an arrow that turns with it and grows with the speed squared. The mounts
  shake and a response curve builds dot by dot as you sweep, peaking at the critical speed. A
  damping slider lowers and widens the peak. A balance weight you drag round the disc cancels the
  heavy spot when it sits opposite, and the curve goes flat. *Why:* Differential equations lesson 7
  built the driven swing, so the new part is where the drive comes from: the unbalance itself, whose
  force rises with speed squared (notes 4.8). Emerson defines a critical speed as one that "excites
  resonance in the machine" (notes 4.8). The MCA asks for the balancing mass (notes 3.4). Balancing
  removes the cause, which damping only softens.
- **Colour as before:** ink for forces, curves, working and controls; amber for key terms; teal for
  small labels (units, angles); red only for a slip or a danger (a sling past its limit, a speed in
  the critical band); green only for finished.

## 4. What else
- **Benchmark (notes 1 and 2).**
  - **Brilliant has no mechanics and materials course** (notes 1). Its Classical Mechanics is 48
    lessons, about 30 on this ground: kinematics, forces and the laws, energy and power, momentum,
    statics, springs and oscillations (notes 1.1, 1.2). It goes motion first, with statics at level
    7, and has no stress, strain, torque, moment of inertia, gears or shafts lesson (notes 1.2).
    Physics of the Everyday gives torque only inside sport (notes 1.3). Scientific Thinking teaches
    gears, moments and structures as puzzles with no number-crunching (notes 1.4). What happens
    inside any Brilliant lesson is UNCONFIRMED (titles only, notes 1.2).
  - **Pearson BTEC Unit 1** runs static, then dynamic, then fluid systems (notes 2.1).
  - **Bird's Mechanical Engineering Principles** runs statics and strength of materials, then
    dynamics (notes 2.2).
  - **Khan and OpenStax** go motion, energy, momentum, rotation, then statics and elasticity late,
    and oscillations last (notes 2.3, 2.4).
  - **Isaac Physics** runs vectors, motion, moments, then stress and Young's modulus (notes 2.5).

  The course follows Bird and BTEC's order. It takes Brilliant's pictures-first way for moments and
  gears and adds what Brilliant lacks and you need: strength of materials, moment of inertia, gears,
  couplings, alignment, balancing and machine vibration.
- **Starting point.** All of Foundational maths, Algebra, Calculus fundamentals, Vectors,
  Differential equations, Matrices, Linear algebra and Statistics for engineers, plus AC circuits,
  Electronics and power electronics, Design and verification, Motors and HV Subsea Cable Testing
  (see "It builds on"). From your trade: lifting and slinging around installations, motors and their
  loads, P = VI and efficiency. Your BTEC Diploma may have had Mechanical Principles units (notes 3.5,
  UNCONFIRMED), so lessons 1, 2, 4 and 5 move fast.
- **His aim (notes 3).** No public syllabus for the Navy's Level 3 marine engineering course exists,
  and no standard titled "marine engineering technician" was found (notes 3.1). So the course is
  planned against the nearest public lines, and each guess is said:
  - **Maritime electrical fitter (ST1403) K2:** "Engineering, mathematical and scientific
    principles ... used in a maritime electrical and electronic environment" (notes 3.1). The text is
    from a "Standard in development" PDF, so the current wording is UNCONFIRMED.
  - **Engineering technician (ST0457):** "apply mechanical principles", and "the structure,
    properties and characteristics of common materials" (notes 3.1).
  - **Maritime mechanical and electrical mechanic (ST0276),** whose employers include the Royal Navy:
    "Electrical, mechanical, pneumatic and fluid power engineering technology and principles" (notes
    3.1).
  - **Pearson HN Mechanical Principles:** static systems, dynamic systems, power transmission and
    vibration (notes 3.3). Advanced Mechanical Principles adds flywheels, balancing and misalignment
    (notes 3.3).
  - **MCA General Engineering Science A and Applied Mechanics:** equilibrium, friction, energy and
    momentum, stress and strain, material terms, factor of safety, P = Tω, gear trains, balancing,
    and a mass on a spring (notes 3.4).

  None of the standards lists a topic like stress or gears (notes 3.1). The weighting towards
  rotation, transmission and vibration is my guess from the HN and MCA lists.
- **Where it is used (each cited before a lesson uses it).**
  - **Forces in balance (1):** HSE on sling angles (notes 4.1, 7.1). The US DOE rigging guide's leg
    tension and load angle factor (notes 4.1). A slinger's guide: "the SWL of each sling is reduced
    as the lifting angle is increased" (SECONDARY, notes 7.1). IHSA on angles near 30° (notes 7.1).
    BTEC free-body diagrams and resolution (notes 2.1). MCA static and dynamic friction and
    lubrication (notes 4.1).
  - **Moments and beams (2):** MCA principle of moments, equilibrium and centre of gravity (notes 3.4,
    4.2). MCA GES A simply supported beams with spread loads (notes 4.2). BTEC beams and reactions
    (notes 2.1).
  - **Stress and materials (3):** BTEC direct and shear stress and strain, Young's modulus (notes
    3.2). MCA GES A material terms, working stress, factor of safety and safe working load; the
    tensile test (notes 3.4). HN 4063's list of properties (notes 3.3). Pump shafts and keyways that
    failed by fatigue (notes 7.2). ST0457's materials line (notes 3.1).
  - **Motion (4):** MCA kinematic equations and graph slope and area (notes 3.4, 4.4). MCA GES A
    force, inertia and momentum (notes 4.4). BTEC Newton's laws and conservation of momentum (notes
    2.1).
  - **Work, energy and power (5):** MCA GES A work, power, energy and efficiency, and lifting
    machines (notes 3.4). BTEC conservation of energy (notes 2.1). Bitesize on power (notes 4.5).
  - **Rotation (6):** MCA Work Done = T × Θ and Power = T × ω = 2πNT (notes 3.4). BTEC P = Tω and
    ½Iω² (notes 2.1). MTU on converting to rad/s (notes 4.6, 7.4). HN flywheels (notes 3.3). A
    flywheel smoothing an engine (SECONDARY, notes 7.4).
  - **Transmission (7):** MCA gear trains and the power in a shaft (notes 3.4, 4.7). HN gear systems,
    belts and couplings, and shaft misalignment (notes 3.3, 4.7). US DOE on alignment (notes 4.7, 7.3).
    SKF on its two kinds (notes 4.7).
  - **Vibration (8):** HN natural frequency, damping and resonance (notes 3.3, 4.8). MCA mass on a
    spring and balancing (notes 3.4, 4.8). Emerson on critical speed (notes 4.8). The 10% margin
    (Wachel, SECONDARY, notes 4.8). Condition monitoring: Honeywell, TAMU, US DOE, ISO 20816-1 (notes
    7.3).
- **The mistakes to catch, each with a puzzle and its own hint.** Most of the research is on school
  and university physics students, not engineers. That you would slip the same way is UNCONFIRMED,
  though these are slips about the ideas, so likely.
  - **Lesson 1, a force as something an object has:** "Many students think of a force as a property
    of objects, not as something that arises when two objects interact" (IOPSpark, notes 6.1). A
    puzzle asks who gives each force on the hook.
  - **Lesson 1, friction as something that just happens:** "Many students see friction as a
    phenomenon, rather than as a force" (IOPSpark, notes 6.1). The crate puzzle asks for its arrow.
  - **Lesson 1, the sling gets weaker as the legs spread:** "there is no change in the tensile
    strength of the sling leg" (US DOE, notes 4.1). The leg's load rises instead.
  - **Lesson 2, a distance not at right angles:** "the force and the distance must be perpendicular"
    (Edexcel 2016, notes 6.3; Bitesize, notes 4.2). A puzzle with a slanted push.
  - **Lesson 2, the weight off the middle:** "the weight of the slab acts at its centre" (Edexcel
    2020, notes 6.3). A puzzle with the beam's own weight.
  - **Lesson 3, a stress taken as a force:** "weaker candidates confused the given value of stress
    with a force" (Cambridge 2024, notes 6.3).
  - **Lesson 3, the stress formula upside down:** it gave "a very large extension they should have
    realised was impossible" (Edexcel 2020, notes 6.3). The size check.
  - **Lesson 3, stiffness and strength mixed up** (Cal Poly Humboldt, notes 6.4), part of a wider
    "confusion of similar concepts" in materials science (FIE 2011, notes 6.4).
  - **Lesson 4, no force, it will just stop:** the impetus idea and force-motion confusion, the most
    common in one classroom study (IJERT, SECONDARY, notes 6.1), from everyday life where friction is
    always there (ScienceDirect review, notes 6.1). FCI items name "motion implies active forces"
    (SECONDARY, notes 6.1).
  - **Lesson 4, the third law pair:** students "frequently neglect or underestimate the force exerted
    by object B on object A" (MDPI, SECONDARY, notes 6.1); third law misconceptions form their own
    group (APS, notes 6.1). The coupling trolleys.
  - **Lesson 4, momentum and moments:** "confusion with the principle of moments" (Edexcel IGCSE,
    notes 6.3) and "'moment' rather than 'momentum'" (Cambridge, notes 6.3).
  - **Lesson 5, power and work:** "Some weaker candidates confused power and work" (Cambridge, notes
    6.3).
  - **Lesson 5, kinetic energy where power was asked:** "on seeing the mass and velocity of the
    block, chose to calculate the kinetic energy" (Edexcel 2016, notes 6.3).
  - **Lesson 5, newton-metres and newton meters** (Bitesize, notes 6.3).
  - **Lesson 6, steady torque means steady speed:** "constant net torque implies constant angular
    velocity" (Rimoldini and Singh, notes 6.2).
  - **Lesson 6, kinetic energy and the moment of inertia:** "great difficulty with the exact
    dependence" (Rimoldini and Singh, notes 6.2).
  - **Lesson 6, ω not squared:** "frequently omitted" (WJEC, notes 6.2).
  - **Lessons 7 and 8:** no source in the notes counts a mistake about gears, alignment or vibration.
    So these are taught as checks, not cited mistakes: a gearbox does not make power (the power bar);
    the slower shaft carries more torque (P = Tω); misalignment does not cost measurable motor
    efficiency but does wreck bearings (US DOE, notes 4.7); shaking does not just rise with speed but
    peaks and falls (the sweep); damping softens resonance but only balancing removes its cause. Lesson
    7 also catches the lesson 5 slip of power and work, and lesson 8 the unconverted rev/min (MTU,
    notes 4.6). The research stage looks once more for counted gear and vibration slips.
- **Size and cost.** 8 lessons of about 12 screens (lessons 3, 6 and 8 up to 14) on the agreed
  settings (CLAUDE.md).
  - Vectors came to about 8.2M tokens, Differential equations about 9.2M, Matrices about 8.5M and
    Linear algebra about 8.9M for seven lessons each, and Electronics and power electronics about
    10.2M (docs/plans/maths-queue.md). That is about 1.2M to 1.3M a lesson. Lessons 6 to 8 animate
    turning machines, which is heavier. So I estimate about 1.1M to 1.3M a lesson.
  - That is about 8.8M to 10.4M for the course, plus about 0.3M for the plan. The research is done
    (43 saved tool results). The maths queue plan allows 8 to 10M a course.
  - The full process measured on Fractions lessons 4 to 8 was about 1.65M a lesson, about 13.2M for
    eight.
  - Each build's real cost is reported to you.
- **Lesson 1 first.** Lesson 1 is built and checked first (about 1.2M, plus the plan). The rest
  follow without waiting, since you approved the build.
- **Gaps to close at build time.** None blocks the build. The research stage quotes each before a
  lesson states it:
  - **Constants:** g = 9.81 m/s²; steel's Young's modulus, yield and tensile strength; typical
    friction coefficients, static and dynamic. Until cited, the curve and the crate use labelled
    example values.
  - **Lesson 1:** the sling formula W ÷ (2 cos θ) is my reading of the rigging quotes (notes 4.1); a
    rigging table or text that states it. A plain free-body diagram definition beyond "a tool"
    (notes 4.1).
  - **Lesson 2:** a couple's definition; that a UDL acts at its middle, in words.
  - **Lesson 3:** the elastic limit, yield and ultimate strength in one source's words; the material
    terms' definitions; a bolt or key in shear as a worked case.
  - **Lesson 4:** Newton's three laws and momentum and impulse in a source's words.
  - **Lesson 5:** mgh, ½mv² and efficiency in a source's words; that a motor's rating is its shaft
    output, for the electrical tie (notes 4.5, my reading).
  - **Lesson 6:** moment of inertia and T = Iα in a source's words.
  - **Lesson 7:** the gear rule by teeth and the idler; belt ratio by diameters; what a coupling is
    and what a flexible one tolerates. Gear and belt efficiencies used are example figures until
    cited.
  - **Lesson 8:** natural frequency of a mass on a spring in Hz; static and dynamic balance.
  - **Throughout:** what happens inside Brilliant's lessons is UNCONFIRMED (notes 1.2). Which BTEC
    units you sat is UNCONFIRMED (notes 3.5). The ST1402 and ST1403 lines are from draft PDFs (notes
    3.1). The split and merge risks in notes 8.1 (lesson 3 into two, lessons 1 and 2 into one) are
    guesses. If lesson 3 runs long when written, fatigue keeps its screens and the material terms
    shrink to one sorting puzzle, so the count stays at eight.
