# Mechanics and materials: research notes

Researched 26 Oct 2026 for the Mechanics and materials course brief (the first course in the Engineering science shelf's
Engineering science folder; blurb "Forces, moments and stress; motion, energy and power; rotation, torque and the shafts and
gears that carry it."). Heat and fluids is built alongside and owns temperature, heat, gases, pressure, buoyancy, flow, pumps
and heat engines. The brief itself is not written here; these notes are its evidence. Dan is an electrician and Royal Navy
submariner on the electrical engineering path. Next year he does a Level 3 marine engineering course (general engineering
first, then submarine and nuclear propulsion). He asked for foundations that see him through any new topic, not a remake of
that course (CLAUDE.md), so nothing below is about submarine systems or propulsion plant, and none of it should go in the course.

Every finding has its source title, URL and the exact words, copied from a saved tool result by script (the quotes were not
retyped into this file). All of them are listed in `quotes.json` beside this file and were checked with
`node tools/eval/sources.mjs --quotes ... --tools ...` (`failed: 0`). The tool files are in `tools/`.
Findings I could not confirm are marked **UNCONFIRMED**; where a page is not the original publisher or is a copy, **SECONDARY**.
My own readings are marked "My reading" and are not quotes. Some quotes keep a hyphen and a space where the source broke a
word across a line (for example "approxi- mately"); they are copied as the page gave them.

**What I could not reach (also listed at the end):** the lessons inside Brilliant's courses (only titles); the text of the
Pearson unit specification for Dan's Diploma units (only the qualification structure and college listings); the live pages of
the ST1402 and ST1403 apprenticeship standards (they load their text by script, so the standards' PDFs are quoted); any
public syllabus for the Navy's Level 3 marine engineering course (Dan said none exists to send); a standard literally titled
"marine engineering technician" (the nearest are listed in 3.1).

---


## 1. Benchmark: Brilliant on the same ground

Brilliant has no "mechanics and materials" course. Two of its physics courses and one puzzle course cover parts of it. The
address `brilliant.org/courses/classical-mechanics/` now shows the Topics list; the course itself is at `/courses/dynamics-bootcamp`
(its title there is Classical Mechanics). Physics of the Everyday was reachable at its own address.


### 1.1 Classical Mechanics (48 lessons, 10 levels)

- **Brilliant's Classical Mechanics is 48 lessons and 411 exercises**
  - Source: Practice Classical Mechanics | Brilliant. https://brilliant.org/courses/dynamics-bootcamp
  - Quote: "Use core principles of physics to understand matter in motion—from drones to fireflies. 48 Lessons 411 Exercises"

- **Classical Mechanics levels 1 to 5: kinematics, forces, energy, momentum**
  - Source: Practice Classical Mechanics | Brilliant. https://brilliant.org/courses/dynamics-bootcamp
  - Quote: "Level 1 Formula One Racing Cellular Automaton Kinematics in the City ## Level 2 The Kinematic Equations Angular Kinematics Projectile Motion Gene Expression Problem ## Level 3 What are Forces? The Three Laws of Motion Weight and Scales Pressure Buoyancy Drag Forces Banked Curve Problem ## Level 4 Exploring Energy Work-Energy Theorem Conservation of Energy Power Elastic Energy Potential Energy Drone Battery Problem ## Level 5 Momentum in the Office Impulse-Momentum Theorem Rocket Equation Ideal Gas Law Photon Problem"

- **Classical Mechanics levels 6 to 10: relativity frames, statics, springs and oscillations, strings, Lagrangian**
  - Source: Practice Classical Mechanics | Brilliant. https://brilliant.org/courses/dynamics-bootcamp
  - Quote: "Level 6 Relativity on the Train Center-of-Mass Frame Rotating Frames Einstein's Theory of Relativity ## Level 7 Tower of Cards Irregular Towers Static Equilibrium Rope Statics Body Statics Plank Statics ## Level 8 Springs Energy Landscapes Elastic Forces Simple Harmonic Oscillators Pendulums Large-Angle Pendulum ## Level 9 Oscillations Vibrations in Molecules Coupled Oscillations Strings Loaded Strings Firefly Problem ## Level 10 General Considerations Natural Units Lagrangian Mechanics"

- **Classical Mechanics description: bedrock principles, drones to skyscrapers**
  - Source: Practice Classical Mechanics | Brilliant. https://brilliant.org/courses/dynamics-bootcamp
  - Quote: "Here we'll establish the bedrock principles of physics and use them to reveal matter in motion; from drones and rockets to skyscrapers and blinking fireflies. By the end, you'll develop a rigorous approach to describing the natural world and you'll be ready to take on new challenges in quantum mechanics and special relativity."

- **Classical Mechanics topics covered**
  - Source: Practice Classical Mechanics | Brilliant. https://brilliant.org/courses/dynamics-bootcamp
  - Quote: "Topics covered * Forces * Kinematics * Kinetic Energy * Momentum * Newton's Laws * Oscillations * Potential Energy * Projectile Motion * Reference Frames * Rocket Equation * Static Equilibrium * Work"


### 1.2 Where Classical Mechanics sits

- **Classical Mechanics asks for maths and physics first and recommends Physics of the Everyday as the start**
  - Source: Practice Classical Mechanics | Brilliant. https://brilliant.org/courses/dynamics-bootcamp
  - Quote: "You’ll need an understanding of mathematics and fundamental physics. We recommend starting your physics journey with Physics of the Everyday."

- **Classical Mechanics next step is Special Relativity**
  - Source: Practice Classical Mechanics | Brilliant. https://brilliant.org/courses/dynamics-bootcamp
  - Quote: "Next steps * Special Relativity"

My reading of Classical Mechanics from the level lists above: its 48 lessons are 3 (level 1) + 4 + 7 + 7 + 5 + 4 + 6 + 5 + 5 + 2
by level. About 30 of them are on Dan's ground: kinematics (levels 1 and 2), forces and the laws (3, leaving out pressure and
buoyancy, which Heat and fluids owns), work, energy and power (4), impulse and momentum (5), statics (7) and springs and simple
harmonic motion (8). The rest is relativity, frames, strings, molecules and Lagrangian mechanics, which Dan does not need.
Its order is motion first and statics late (level 7). It has **no stress, strain or materials lesson, no torque or moment of
inertia lesson by name, and nothing on gears, shafts or couplings**. Those parts come from the engineering sources in 2 and 3.
Its lesson titles are the pictures worth borrowing: "Formula One Racing", "Banked Curve Problem", "Drone Battery Problem",
"Tower of Cards", "Plank Statics". The page gives only titles, so what happens inside each lesson is **UNCONFIRMED**.


### 1.3 Physics of the Everyday (38 lessons, 6 levels)

- **Brilliant's Physics of the Everyday is 38 lessons and 152 exercises**
  - Source: Practice Physics of the Everyday | Brilliant. https://brilliant.org/courses/physics-of-the-everyday/
  - Quote: "Investigate everyday physics, from household objects to weather patterns. 38 Lessons 152 Exercises"

- **Physics of the Everyday level 2: spinning, torque and collisions in sport**
  - Source: Practice Physics of the Everyday | Brilliant. https://brilliant.org/courses/physics-of-the-everyday/
  - Quote: "Level 2 Axe Throwing BMX Motocross Tug of War Skiing Gymnastics: Spinning Gymnastics: Flipping Baseball: Hitting & Catching Baseball: Throwing & Running"

- **Physics of the Everyday level 5: beams, trusses, bridges**
  - Source: Practice Physics of the Everyday | Brilliant. https://brilliant.org/courses/physics-of-the-everyday/
  - Quote: "Level 5 Fluoridated Water Airplanes Traffic Beam and Truss Bridges Arch and Suspension Bridges Skyscrapers Queen of the Monsters"

- **Physics of the Everyday description**
  - Source: Practice Physics of the Everyday | Brilliant. https://brilliant.org/courses/physics-of-the-everyday/
  - Quote: "Discover physics in unexpected places: from refrigerators and toilets, to traffic jams and water towers. By the end of this course, you'll use powerful ideas like forces, energy, and estimation to catch criminals, design bridges, and throw axes through the lens of a physicist."

- **Physics of the Everyday topics covered**
  - Source: Practice Physics of the Everyday | Brilliant. https://brilliant.org/courses/physics-of-the-everyday/
  - Quote: "Topics covered * Estimation * Forces * Heat * Kinematics * Kinetic Energy * Momentum * Nuclear Physics * Potential Energy * Pressure * Rotational Dynamics * Torque * Weather"

- **Physics of the Everyday asks only for a nodding familiarity**
  - Source: Practice Physics of the Everyday | Brilliant. https://brilliant.org/courses/physics-of-the-everyday/
  - Quote: "A nodding familiarity with basic concepts like heat, energy, and force will help."

My reading: this is the context-led course. Rotation and torque appear only inside sport ("Gymnastics: Spinning", "Gymnastics:
Flipping") and structures only as "Beam and Truss Bridges" and "Skyscrapers". Its useful lesson is the idea that one everyday
object carries one physics idea. Its topics list names "Torque" and "Rotational Dynamics" but the page gives no lessons for them.


### 1.4 Scientific Thinking (40 lessons): the nearest Brilliant has to gears, moments and structures

- **Brilliant's Scientific Thinking opens with gears and moments (no prerequisites)**
  - Source: Practice Scientific Thinking | Brilliant. https://brilliant.org/courses/puzzle-science/mechanics
  - Quote: "Level 1 Gears Connecting Gears Gears Changing Speeds Compound Gears Compound Gear Chains Level Review"

- **Scientific Thinking: moments and balances in Level 2 Mobiles**
  - Source: Practice Scientific Thinking | Brilliant. https://brilliant.org/courses/puzzle-science/mechanics
  - Quote: "Level 2 Mobiles Balancing Weights Moments Adding Moments Adding a Level Multiple Levels A Mystery Weight Multiple Unknowns Simultaneous Solving Level Review"

- **Scientific Thinking: Structures level covers beams and joints**
  - Source: Practice Scientific Thinking | Brilliant. https://brilliant.org/courses/puzzle-science/mechanics
  - Quote: "Level 4 Structures Structure Components Rigid Shapes Extending Structures Building Structures Degrees of Freedom Equivalent Structures Analyzing Beams Analyzing Joints Analyzing Screws"

- **Scientific Thinking spends 40 lessons and asks for no mathematics**
  - Source: Practice Scientific Thinking | Brilliant. https://brilliant.org/courses/puzzle-science/mechanics
  - Quote: "Open your eyes to the world around you by solving puzzles with science. 40 Lessons 557 Exercises"

My reading: this puzzle course is the closest Brilliant gets to lessons 2 and 7 of Dan's scope. It starts with four gear
lessons (compound gears and gear chains), then eight on moments with balancing mobiles, nine on structures, beams and joints,
and five more on gears at the end, each level closing with a review; its own words are "we'll dispense with number-crunching". It sits in the Science band, with no prerequisites. It shows that moments and gear ratios can
be taught as pictures you move before any formula, which is the app's own way of teaching.


### 1.5 Where Brilliant files it

- **Brilliant's Science band sits beside Math and Programming**
  - Source: Topics | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/classical-mechanics/
  - Quote: "Science See the science in the world around you"

My reading: Brilliant's own advice is Physics of the Everyday, then Classical Mechanics, then Special Relativity. Its catalogue has a Science band beside the maths bands; I did not see these courses listed in it. Dan's Engineering science shelf instead follows the engineering order in section 2.


## 2. Other courses, in the order they teach the same ground

Two orders exist. **Statics first**: Pearson BTEC Unit 1, Bird, the MCA Applied Mechanics syllabus and Isaac's A level book all
put forces in equilibrium, moments and stress before motion. **Motion first**: Khan Academy, OpenStax and Brilliant put
kinematics and Newton's laws before energy, momentum, rotation and (late) static equilibrium and elasticity.


### 2.1 Pearson BTEC National Engineering Unit 1: Engineering Principles

- **Pearson BTEC National Unit 1 sums up its mechanical content as static, dynamic and fluid systems**
  - Source: Specification - Pearson BTEC Level 3 National Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/btec-nat-eng-cert-spec.pdf
  - Quote: "The mechanical problems you will encounter cover static, dynamic and fluid systems."

- **BTEC Unit 1 static systems: free body diagrams, moments, resolution, equilibrium conditions**
  - Source: Specification - Pearson BTEC Level 3 National Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/btec-nat-eng-cert-spec.pdf
  - Quote: "representation of forces using space and free body diagrams o moments o resolution of forces in perpendicular directions _Fx_ = _F_ cos _θ_ , _Fy_ = _F_ sin _θ_ o vector addition of forces – resultant, equilibrant and line of action o conditions for static equilibrium Σ _Fx_ = 0, Σ _Fy_ = 0, Σ _M_ = 0"

- **BTEC Unit 1: simply supported beams and reactions**
  - Source: Specification - Pearson BTEC Level 3 National Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/btec-nat-eng-cert-spec.pdf
  - Quote: "Simply supported beams: o concentrated loads o uniformly distributed loads (UDL). • Reactions: o support reactions o pin reaction forces o roller reaction forces."

- **BTEC Unit 1 dynamic content: Newton's laws, momentum, energy conservation**
  - Source: Specification - Pearson BTEC Level 3 National Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/btec-nat-eng-cert-spec.pdf
  - Quote: "Newton’s Laws of Motion o principles of conservation of momentum o principles of conservation of energy."

- **BTEC Unit 1 angular content: P = Tω and rotational kinetic energy**
  - Source: Specification - Pearson BTEC Level 3 National Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/btec-nat-eng-cert-spec.pdf
  - Quote: "angular velocity (ω) o centripetal acceleration _a_ = ω² _r_ = _v_ ² _r_ o uniform circular motion power _P_ = _T_ ω o rotational kinetic energy _KE_ = ¹ 2 _I_ ω ²"

- **BTEC Unit 1 lifting machines**
  - Source: Specification - Pearson BTEC Level 3 National Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/btec-nat-eng-cert-spec.pdf
  - Quote: "lifting machines, including inclined planes, scissor jacks, pulleys: o velocity ratio o mechanical advantage o effort and load motion o friction effects."

- **BTEC Unit 1 content order: B static systems**
  - Source: Specification - Pearson BTEC Level 3 National Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/btec-nat-eng-cert-spec.pdf
  - Quote: "B Static engineering systems • Application of appropriate units B1 Static engineering systems"

- **BTEC Unit 1 content order: C dynamic systems follows**
  - Source: Specification - Pearson BTEC Level 3 National Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/btec-nat-eng-cert-spec.pdf
  - Quote: "C Dynamic engineering systems • Application of appropriate units C1 Dynamic engineering systems"

- **BTEC Unit 1 content order: D fluid systems last (Heat and fluids owns this)**
  - Source: Specification - Pearson BTEC Level 3 National Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/btec-nat-eng-cert-spec.pdf
  - Quote: "D Fluid engineering systems • Application of appropriate units D1 Fluid systems"

My reading: Unit 1 teaches B static systems (free body diagrams, moments, resolving, equilibrium, simply supported beams,
reactions, direct and shear stress and strain, E and G), then C dynamic systems (kinematics, force, inertia, torque, work,
power, efficiency, energy, Newton's laws, momentum, angular velocity, P = Tω, rotational kinetic energy, lifting machines),
then D fluids. This is the Level 3 ground Dan's Diploma sits beside. The content lines I could see list **no vibration, gear, coupling or shaft
alignment items** (the excerpt I saw was partial, so this is UNCONFIRMED); those first appear in the HN units (3.3).


### 2.2 Bird: Mechanical Engineering Principles, and Science and Mathematics for Engineering

- **Bird's Mechanical Engineering Principles, Part Two: statics and strength of materials**
  - Source: Mechanical Engineering Principles - 4th Edition - John Bird - Carl Ros. https://www.routledge.com/Mechanical-Engineering-Principles/Bird-Ross/p/book/9780367253240
  - Quote: "Part Two: Statics and Strength of Materials. 3. The effects of forces on materials. 4. Tensile testing. 5. Forces acting at a point. 6. Simply supported beams. Revision Test 3 Forces, tensile testing and beams. 7. Forces in structures. 8. Bending moment and shear force diagrams. 9. First and second moments of area. Revision Test 4 Forces in structures, bending moment and shear force diagrams, and second moments of area. 10. Bending of beams. 11. Torque. 12. Twisting of shafts."

- **Bird's Mechanical Engineering Principles, Part Three: dynamics**
  - Source: Mechanical Engineering Principles - 4th Edition - John Bird - Carl Ros. https://www.routledge.com/Mechanical-Engineering-Principles/Bird-Ross/p/book/9780367253240
  - Quote: "Part Three: Dynamics. 15. Linear and angular motion. 16. Linear momentum and impulse. 17. Force, mass and acceleration. 18. Work, energy and power. Revision Test 6 Linear and angular motion, momentum and impulse, force, mass and acceleration, work, energy and power. 19. Friction. 20. Motion in a circle. 21. Simple harmonic motion. 22. Simple machines."

- **Bird's Mechanical Engineering Principles can be used on marine engineering courses**
  - Source: Mechanical Engineering Principles - 4th Edition - John Bird - Carl Ros. https://www.routledge.com/Mechanical-Engineering-Principles/Bird-Ross/p/book/9780367253240
  - Quote: "can also be used on undergraduate courses in mechanical, civil, structural, aeronautical and marine engineering, and naval architecture."

- **Bird's Science and Mathematics for Engineering, the mechanical applications section**
  - Source: Science and Mathematics for Engineering - 6th Edition - John Bird - Ro. https://www.routledge.com/Science-and-Mathematics-for-Engineering/Bird/p/book/9780367204747
  - Quote: "SECTION II MECHANICAL APPLICATIONS 14. SI units and density 15. Atomic structure of matter 16. Speed and velocity 17. Acceleration 18. Force, mass and acceleration Revision Test 7: SI units, density, speed and velocity, force, mass and acceleration 19. Forces acting at a point 20. Work, energy and power 21. Simply supported beams Revision Test 8: Forces acting at a point, work, energy and power and simply supported beams 22. Linear and angular motion 23. Friction 24. Simple machines Revision Test 9: Linear and angular motion, friction and simple machines 25. The effects of forces on materials 26. Linear momentum and impulse Revision Test 10: Forces on materials and linear momentum and impulse 27. Torque"

- **Bird, the author of both books, lectures at the Defence School of Marine Engineering**
  - Source: Mechanical Engineering Principles - 4th Edition - John Bird - Carl Ros. https://www.routledge.com/Mechanical-Engineering-Principles/Bird-Ross/p/book/9780367253240
  - Quote: "is currently lecturing at the Defence School of Marine Engineering in the Defence College of Technical Training at H.M.S. Sultan, Gosport, Hampshire, UK"

My reading: Bird's Mechanical Engineering Principles is statics and strength first, then dynamics, then heat and fluids. The
author lectures at the Defence School of Marine Engineering, HMS Sultan (the publisher's own biography on the same page), and
the book says it suits marine engineering courses. That makes its Part Two and Part Three the best single guide to what a
marine engineering student meets, in this order: effects of forces on materials, tensile testing, forces at a point, simply
supported beams, torque, then linear and angular motion, momentum, force-mass-acceleration, work-energy-power, friction,
motion in a circle, simple harmonic motion, simple machines. Science and Mathematics for Engineering is the Level 3 version
and puts motion and force first, then work and energy, beams, linear and angular motion, friction, simple machines,
materials, momentum, torque.


### 2.3 Khan Academy physics

- **Khan Academy AP Physics 1 unit order**
  - Source: AP Physics 1 review | AP®︎/College Physics 1 | Science | Khan Academy. https://www.khanacademy.org/science/ap-college-physics-1/xf557a762645cccc5:ap-physics-1-review/xf557a762645cccc5:ap-physics-1-concept-review
  - Quote: "Unit 1 Kinematics Unit 2 Force and translational dynamics [Unit 3 Work, energy, and power](https://www.khanacademy.org/science/ap-college-physics-1/xf557a762645cccc5:work-energy-and-power) [Unit 4 Linear momentum](https://www.khanacademy.org/science/ap-college-physics-1/xf557a762645cccc5:linear-momentum) [Unit 5 Torque and rotational dynamics](https://www.khanacademy.org/science/ap-college-physics-1/xf557a762645cccc5:torque-and-rotational-dynamics) [Unit 6 Energy and momentum of rotating xf557a762645cccc5:energy-and-momentum-of-rotating-systems) Unit 7 Oscillations"

- **Khan Academy physics library units 1 to 8**
  - Source: Physics library (intl) | Science | Khan Academy. https://www.khanacademy.org/science/physics-library-intl
  - Quote: "Unit 1 One-dimensional motion Unit 2 Two-dimensional motion Unit 3 Forces and Newton's laws of motion [Unit 4 Centripetal force and gravitation](https://www.khanacademy.org/science/physics-library-intl/x10bf974b5c2ada11:centripetal-force-and-gravitation) Unit 5 Work and energy Unit 6 Impacts and linear momentum [Unit 7 Torque and angular momentum](https://www.khanacademy.org/science/physics-library-intl/x10bf974b5c2ada11:torque-angular-momentum) Unit 8 Oscillations and mechanical waves"


### 2.4 OpenStax University Physics volume 1

- **OpenStax University Physics volume 1 mechanics chapters in order**
  - Source: Preface - University Physics Volume 1 | OpenStax. https://openstax.org/books/university-physics-volume-1/pages/preface
  - Quote: "Chapter 5: Newton’s Laws of Motion * Chapter 6: Applications of Newton’s Laws * Chapter 7: Work and Kinetic Energy * Chapter 8: Potential Energy and Conservation of Energy * Chapter 9: Linear Momentum and Collisions * Chapter 10: Fixed-Axis Rotation * Chapter 11: Angular Momentum * Chapter 12: Static Equilibrium and Elasticity * Chapter 13: Gravitation * Chapter 14: Fluid Mechanics"

- **OpenStax chapter 15 oscillations includes damped and forced**
  - Source: Preface - University Physics Volume 1 | OpenStax. https://openstax.org/books/university-physics-volume-1/pages/preface
  - Quote: "Unit 2: Waves and Acoustics * Chapter 15: Oscillations"

My reading: OpenStax is the university calculus-based order: Newton's laws, energy, momentum, fixed-axis rotation (10),
angular momentum (11), static equilibrium and elasticity (12), then oscillations (15), where damped and forced oscillations and
resonance are the last two sections. Dan has Calculus and Differential equations, so this order is open to him, but its
statics and elasticity come late. Chapter 12's title appears in the book's own index as "12.3 Stress, Strain, and Elastic
Modulus" (the page text carries backslash escapes, so it is not quoted).


### 2.5 Isaac Physics (Cambridge)

- **Isaac Physics A level book chapter B Mechanics I**
  - Source: Book — Isaac Science. https://isaacscience.org/book
  - Quote: "Chapter B ###### Mechanics I - B1 Components of a Vector - B2 Adding Vectors - B3 Uniform Accelerated Motion in 1-d - B4 Trajectories - B5 Moments - B6 Stress, Strain and Young's Modulus - B7 Springs - B8 Work, Energy and Power - B9 Energy, Springs and Materials"

- **Isaac Physics concept lessons: forces in equilibrium and friction**
  - Source: Question decks by topic — Isaac Science. https://isaacscience.org/physics/a_level/question_decks
  - Quote: "Lesson: Forces in equilibrium"

- **Isaac Physics: very challenging questions on moments are kept off its standard boards**
  - Source: Question decks by topic — Isaac Science. https://isaacscience.org/physics/a_level/question_decks
  - Quote: "We have some very challenging questions on moments, which are not included on these boards."

My reading: Isaac's A level book is statics-first as well: vectors, then 1-d motion and trajectories, then moments (B5),
stress, strain and Young's modulus (B6), springs (B7), work, energy and power (B8), and energy, springs and materials (B9).
It treats moments and Young's modulus as one mechanics chapter. Its question decks cover forces in equilibrium and friction on
inclined planes. Isaac's own note says it keeps "some very challenging questions on moments" off its standard boards.


## 3. What a Level 3 marine engineering course and an engineering HNC use of this

Exact lines from the public standards and syllabi. There is no public syllabus for the Navy's Level 3 marine engineering
course, so the brief plans against these (and says where a choice is a guess).


### 3.1 Apprenticeship standards on the Institute for Apprenticeships (Skills England) site

- **Engineering technician standard (ST0457): general mathematical and scientific principles and materials**
  - Source: Engineering technician / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0457
  - Quote: "understanding of general engineering/manufacturing mathematical and scientific principles, methods, techniques, graphical expressions, symbols formulae and calculations used by engineering technicians * understanding the structure, properties and characteristics of common materials used in the sector"

- **ST0457 maritime lines: engineering technology and principles in the design, build, operation and maintenance of maritime vessels**
  - Source: Engineering technician / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0457
  - Quote: "understand engineering technology and principles applied in the design, build, operation and maintenance of maritime vessels."

- **ST0457 core: apply mechanical principles**
  - Source: Engineering technician / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0457-v1-5
  - Quote: "apply mechanical principles and joining techniques to develop products, devices and equipment"

- **Marine engineer standard (ST0364): mathematical techniques that underpin marine engineering; characteristics of materials**
  - Source: Marine engineer / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0364-v1-0
  - Quote: "Characteristics and reaction of materials to their environment: temperature, humidity, pressure * Mathematical techniques, formula, and calculations that underpin marine engineering"

- **Marine engineer standard: recognised by IMarEST at Engineering Technician level**
  - Source: Marine engineer / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0364-v1-0
  - Quote: "the apprentice will be recognised by the Institute of Marine Engineering, Science and Technology (IMarEST) at Engineering Technician level."

- **Maritime Electrical / Mechanical Mechanic standard (ST0276) knowledge line**
  - Source: Apprenticeship Standard for: Maritime Electrical / Mechanical Mechanic. https://dera.ioe.ac.uk/id/eprint/30533/1/Mechanical_Mechanic_Apprenticeship_Standard-Final_Draft_Clean_MA.pdf (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "Mathematical techniques, formula and calculation appropriate to their role. 2. Electrical, mechanical, pneumatic and fluid power engineering technology and principles."

- **ST0457 maritime options use a Level 3 Diploma in Maritime Defence (Development Knowledge)**
  - Source: Engineering technician / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0457
  - Quote: "Level 3 Diploma in Maritime Defence (Development Knowledge)"

- **Marine engineer (ST0364) is listed as retired from 15 Dec 2023**
  - Source: Apprenticeship search / route Legal-finance-and-accounting / Skills England. https://www.instituteforapprenticeships.org/apprenticeship-standards?routes=Legal-finance-and-accounting
  - Quote: "Marine engineer Retired on 15 Dec 2023"

- **The Maritime electrical fitter option of the engineering technician standard was replaced by ST1403**
  - Source: Engineering technician / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0457
  - Quote: "this option retired on 25 April 2025. It has been replaced by: ST1403 Maritime electrical fitter"

- **Maritime electrical fitter (ST1403) K2: engineering, mathematical and scientific principles in a maritime electrical and electronic environment**
  - Source: Standard in development L3: Maritime electrical fitter (ST1403) — Education England. https://skillsengland.education.gov.uk/media/o5npn24d/st1403-maritime-electrical-fitter-l3-standard.pdf
  - Quote: "K2 : Engineering, mathematical and scientific principles, methods, techniques, graphical expressions, symbols, formulae and calculations used in a maritime electrical and electronic environment."

- **Maritime electrical fitter (OCC0457F) K23: engineering technology and principles of maritime vessels**
  - Source: Engineering technician - Maritime Electrical Fitter / Skills England. https://skillsengland.education.gov.uk/occupations/OCC0457F
  - Quote: "understand maritime electrical/electronic engineering technology and principles in the design, equipment build, operation and maintenance of maritime vessels."

- **Maritime mechanical fitter (ST1402) K2: the same principles in a mechanical fitting environment**
  - Source: Standard in development L3: Maritime mechanical fitter (ST1402). https://skillsengland.education.gov.uk/media/41ujrwli/st1402-maritime-mechanical-fitter-l3-standard.pdf
  - Quote: "K2 : Engineering, mathematical and scientific principles, methods, techniques, graphical expressions, symbols, formulae and calculations used in a maritime mechanical fitting environment."

- **Maritime mechanical and electrical mechanic (ST0276, current page): electrical, mechanical, pneumatic and fluid power principles**
  - Source: Maritime mechanical and electrical mechanic / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0276-v1-1
  - Quote: "Electrical, mechanical, pneumatic and fluid power engineering technology and principles."

- **ST0276 employers include the Royal Navy and the Royal Fleet Auxiliary**
  - Source: Maritime mechanical and electrical mechanic. https://occupational-maps.skillsengland.education.gov.uk/maps/occupation/OCC0276
  - Quote: "Royal Navy, Royal Fleet Auxiliary Service, P&O Ferries"

My reading: the standards for Dan's path say little in detail. They ask for "mathematical and scientific principles", "the
structure, properties and characteristics of common materials", mechanical principles, and the maritime principles. None
lists a topic such as stress, torque or gears. **No standard titled "marine engineering technician" was found.** The nearest are:
Engineering technician (ST0457) with maritime options (Pipeworker, and the Electrical and Mechanical Fitter options, now
retired and replaced by ST1403 Maritime electrical fitter and ST1402 Maritime mechanical fitter); Marine engineer (ST0364,
retired 15 Dec 2023); and Maritime mechanical and electrical mechanic (ST0276), whose employers include the Royal Navy.
ST1403 and ST1402 are Dan's trade, and their live pages load by script, so the knowledge lines are read from the standards'
PDFs (marked "Standard in development", Nov 2023): the exact K2 wording may have changed, **UNCONFIRMED** for the current version.
For the maritime options the standard lists a Level 3 Diploma in Maritime Defence (Development Knowledge); for other options
it lists the Advanced Manufacturing Engineering Diploma that Dan holds (3.5). Which one his route requires I did not find.


### 3.2 Pearson BTEC National Engineering Unit 1 outcomes (mechanical parts)

- **BTEC Unit 1 hours and learners: mechanical and electrical problems**
  - Source: Specification - Pearson BTEC Level 3 National Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/btec-nat-eng-cert-spec.pdf
  - Quote: "Learners apply mathematical and physical science principles to solve electrical-, electronic- and mechanical-based engineering problems."

- **BTEC Unit 1 loaded components: stress, strain, Young's modulus, shear**
  - Source: Specification - Pearson BTEC Level 3 National Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/btec-nat-eng-cert-spec.pdf
  - Quote: "direct stress and strain: direct stress _σ_ = _F_ _A_ , direct strain _ε_ = _L_ _L_ ∆ • shear stress and strain: shear stress τ = _F_ _A_ , shear strain γ = _a_ ### _b_ • tensile and shear strength • elastic constants: Young’s Modulus (modulus of elasticity) _E_ = σ ε ; Modulus of rigidity"


### 3.3 Pearson BTEC Higher National units that cover it

- **Pearson HN Unit 8 Mechanical Principles: learning outcomes**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "1. Identify solutions to problems within static mechanical systems. 2. Illustrate the effects that constraints have on the performance of a dynamic mechanical system. 3. Investigate elements of simple mechanical power transmission systems. 4. Analyse natural and damped vibrations within translational and rotational mass-spring systems."

- **HN Mechanical Principles: shafts, beams, torsion**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "The effect of shear forces on beams Bending moments and stress due to bending in beams Selection of appropriate beams and columns to satisfy given specifications The theory of torsion in solid and hollow circular shafts"

- **HN Mechanical Principles: gear systems, lead screws, couplings, energy storage**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "Parameters of simple and compounded geared systems Efficiency of lead screws and screw jacks _Couplings and energy storage:_ Universal couplings and conditions for constant-velocity Importance of energy storage elements and their applications"

- **HN Mechanical Principles: SHM, natural frequency, damped, resonance**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "Simple harmonic motion Natural frequency of vibration in mass-spring systems _Damped systems:_ Frequency of damped vibrations in mass-spring-damper systems The conditions for an external force to produce resonance"

- **HN Advanced Mechanical Principles: flywheels, balancing, coupling**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "Operating principles of flywheels to store mechanical energy Balancing of rotating mass systems The effects of coupling on freely rotating systems"

- **HN Advanced Mechanical Principles: misalignment of shafts**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "Evaluate the effects of misalignment of shafts and the measures that are taken to prevent problems from occurring"

- **HN Unit 4063 Engineering Mechanics and Materials: calculate shear force, bending moment, static and dynamic systems**
  - Source: Unit 4063: Engineering Mechanics and Materials. https://unicourse.org/wp-content/uploads/2024/06/Engineering-Mechanics-and-Materials.pdf
  - Quote: "Calculate the shear force, bending moment and stress due to bending in given examples of simply supported beams."

- **HN Unit 4063: material properties named**
  - Source: Unit 4063: Engineering Mechanics and Materials. https://unicourse.org/wp-content/uploads/2024/06/Engineering-Mechanics-and-Materials.pdf
  - Quote: "density, modulus of elasticity, Poisson’s ratio, yield and tensile strength, percentage elongation, strength and fracture toughness, coefficient of thermal expansion"

My reading: the HN **Mechanical Principles** unit is the plainest picture of the target. Its four outcomes are static systems
(shafts and beams, torsion), dynamic systems (energy, angular motion, gyroscopic motion), power transmission (gear systems,
lead screws, couplings, energy storage) and vibration (SHM, natural frequency, damped systems, resonance). **Advanced Mechanical
Principles** adds flywheel mass, balancing, and shaft misalignment. **Engineering Mechanics and Materials** (Unit 4063)
adds properties of materials, beam shear force and bending moment, and the relationship between forms of mechanical energy.
Fluid mechanics and thermodynamics are separate HN units and belong to Heat and fluids.


### 3.4 MCA engineer officer syllabi (Applied Mechanics, General Engineering Science, Applied Heat)

- **MCA General Engineering Science A: the candidate will know (mechanics)**
  - Source: MCA General Engineering Science A Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/mca-general-engineering-science-a-written-examination-syllabuses
  - Quote: "The relationship of linear and angular velocity, distance and acceleration. 2. The effect of forces and torques on motion and lifting machines. 3. * Maritime & Coastguard Agency Guidance # MCA General Engineering Science A Written Examination Syllabuses Published 1 July 2021 ## Contents 1. 1\. Mechanics 2. 2\. Naval Architecture Print this page This publication is licensed rgy theory and momentum. 5. The relationship between mass, volume and density. 6. Static and dynamic friction. 7. The effects of tensile, compressive and shear forces. 8. properties of materials. 10. Factor of safety."

- **MCA General Engineering Science A: lifting machines, work power energy efficiency**
  - Source: MCA General Engineering Science A Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/mca-general-engineering-science-a-written-examination-syllabuses
  - Quote: "Solve problems relating to work, power, energy and efficiency. 3. Solve problems relating to lifting machines using mechanical advantage and velocity ratio."

- **MCA General Engineering Science A: explain material terms and factor of safety**
  - Source: MCA General Engineering Science A Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/mca-general-engineering-science-a-written-examination-syllabuses
  - Quote: "Explain ductility, brittleness, toughness, hardness, elasticity, plasticity, malleability. 16. Explain working stress and factor of safety. 17. Solve problems relating to stress and strain, safe working load and factor of safety."

- **MCA Applied Mechanics: work done = T x angle, Power = T x omega**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Derives the expressions: WorkDone = T x Θ, Power = T x ω = 2πNT"

- **MCA Applied Mechanics: kinematic equations**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Derives the equations: ν = u + at, s = ut + 1/2(at ² ), v ² = u ² + 2as, s = ((u + v)/2)t"

- **MCA Applied Mechanics (Chief Engineer): movement ratio of simple and compound gear trains**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Determines the movement ratio for simple and compound gear trains."

- **MCA General Engineering Science A: explain the tensile test for an elastic material**
  - Source: MCA General Engineering Science A Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/mca-general-engineering-science-a-written-examination-syllabuses
  - Quote: "Explain the tensile test for an elastic material."

- **MCA General Engineering Science A: explain working stress and factor of safety**
  - Source: MCA General Engineering Science A Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/mca-general-engineering-science-a-written-examination-syllabuses
  - Quote: "Explain working stress and factor of safety."

- **MCA Applied Mechanics: balancing coplanar rotating masses**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Determines the unbalanced force and balancing mass required for coplanar rotating mass systems not in equilibrium."

- **MCA Applied Mechanics: torsion of circular shafts and coupling bolts**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Derives the expression: T/J = GΘ/L = τ/R. 3. Recalls the expression for the power transmitted by a rotating shaft."

- **MCA Applied Mechanics: the moment of a force and the principle of moments**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Defines the moment of a force. 8. Explains the principle of moments."

- **MCA Applied Mechanics: centre of gravity by moments of mass**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Explains how a centre of gravity can be determined by taking moments of mass."

- **MCA Applied Mechanics (chief engineer): SHM frequency expression**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Derives the general expression: frequency = (1/2π)√(Acceleration/Displacement)."

- **MCA Applied Heat (Chief Engineer) is its own syllabus, so it belongs to Heat and fluids**
  - Source: Applied Heat Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-heat-written-examination-syllabus
  - Quote: "Applied Heat Written Examination Syllabus"

- **MCA General Engineering Science B holds the thermodynamics and hydrostatics**
  - Source: MCA General Engineering Science B Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/mca-general-engineering-science-b-written-examination-syllabuses
  - Quote: "The heat required to change the temperature of solids, liquids and gases."

My reading: the MCA lines are the closest public thing to what a marine engineering student is examined on. General Engineering
Science A lists, in this order: linear and angular velocity and acceleration, forces and torques with lifting
machines, equilibrium, conservation of energy and momentum, density, friction, tensile, compressive and shear forces, stress
and strain, material properties, factor of safety. Applied Mechanics (Second and Chief Engineer) goes further: statics,
frameworks, centres of gravity, friction, kinematics, dynamics (including work diagrams, torque and power, balancing of
rotating masses), machines (lifting machines, gears, belts), strength of materials (the tensile test of mild steel, factor of
safety, beams, torsion of shafts), and at Chief Engineer level simple harmonic motion with a mass on a spring. **Hydrostatics,
hydrodynamics and Applied Heat go to Heat and fluids.** The working power formula MCA gives for a shaft, Power = T x ω = 2πNT,
is "P = Tω" written with N in revolutions per second (my reading of the formula; the line does not give N's unit).


### 3.5 Dan's BTEC Level 3 Diploma in Advanced Manufacturing Engineering: what it covered of this

Which units Dan sat is **UNCONFIRMED**: I only have the qualification's published structure, not his transcript. Colleges list health and safety,
communications and mathematics as the core units. Mechanical Principles is an optional unit on the Extended Diploma, and one
of the core units on a college's mechanical pathway of the 12-unit Diploma.

- **Dan's BTEC Diploma (Advanced Manufacturing Engineering): mandatory units are health and safety, communications and mathematics**
  - Source: BTEC Level 3 Extended Diploma in Advanced Manufacturing Engineering - DCG. https://www.derby-college.ac.uk/course/btec-level-3-extended-diploma-in-advanced-manufacturing-engineering (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "The mandatory units are: * Health and Safety in the Workplace * Communications for Engineering Technicians * Mathematics for Technicians"

- **Optional units on that qualification include Mechanical Principles**
  - Source: BTEC Level 3 Extended Diploma in Advanced Manufacturing Engineering - DCG. https://www.derby-college.ac.uk/course/btec-level-3-extended-diploma-in-advanced-manufacturing-engineering (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "Mechanical Principles * Electro, Pneumatic and Hydraulic Systems and Devices"

- **The same Diploma lists Mechanical Principles of Engineering Systems and Properties & Applications of Engineering Materials among its units**
  - Source: Mechanical Engineering BTEC Level 3 Diploma – BBD1000 – 2026 | The Bedford College Group. https://bedfordcollegegroup.ac.uk/courses/mechanical-engineering-btec-level-3-diploma-bbd1000 (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "Mechanical Principles of Engineering Systems * Properties & Applications of Engineering Materials * Engineering Drawing for Technicians * Electro-Pneumatic and Hydraulic Systems and Devices * Engineering Project * Applications of Mechanical Systems in Engineering * Further Mechanical Principles and Applications * Further Engineering Mathematics"

- **Unit A8 Mechanical Principles: static, dynamic, fluids, thermodynamics**
  - Source: UA8 Mechanical Principles and Applications. http://tecol.co.uk/9-unit-eng-btec-l3/awards/mechanical-principles-and-applications/ (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "On completion of this unit you should: 1 Be able to determine the effects of loading in static engineering systems 2 Be able to determine work, power and energy transfer in dynamic engineering systems 3 Be able to determine the parameters of fluid systems 4 Be able to determine the effects of energy transfer in thermodynamic systems."

- **Unit A8: it builds on GCSE or BTEC level 2**
  - Source: UA8 Mechanical Principles and Applications. http://tecol.co.uk/9-unit-eng-btec-l3/awards/mechanical-principles-and-applications/ (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "This unit enables learners to build on knowledge gained at GCSE or BTEC level 2 and use it in a more practical context for their chosen discipline. It will develop your knowledge of static and dynamic systems"

- **Unit 55 Further Mechanical Principles: learning outcomes**
  - Source: Further Mechanical Principles and Applications. http://tecol.co.uk/9-unit-eng-btec-l3/awards/further-mechanical-principles-and-applications/ (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "Be able to determine the forces acting in pin-jointed framed structures and simply supported beams * Be able to determine the stress in structural members and joints * Be able to determine the characteristics of rotating systems * Be able to determine the operating characteristics of simple lifting"

- **Mathematics for Engineering Technicians: algebra, radian, trig, elementary calculus**
  - Source: UA3 Mathematics for Engineering Technicians. http://tecol.co.uk/btec-level-3-courses/awards/mathematics-for-engineering-technicians/ (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "Be able to use algebraic methods * Be able to use trigonometric methods and standard formulae to determine areas and volumes * Be able to use statistical methods to display data * Be able to use elementary calculus"

- **The engineering technician standard names the Advanced Manufacturing Engineering Diploma (Development Knowledge) as a knowledge qualification for some of its options**
  - Source: Engineering technician / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0457
  - Quote: "Level 3 Diploma or Extended Diploma in Advanced Manufacturing Engineering (Development Knowledge) - for all starts from 1st July 2017"

My reading: if Dan took the Mechanical Principles of Engineering Systems unit (A8) he met static loading, work, power and energy
transfer in dynamic systems, plus fluids and thermodynamics, at a level "built on GCSE or BTEC level 2". If he took Further
Mechanical Principles (A55) he met pin-jointed frames, simply supported beams, stress in
members and joints, rotating systems and simple lifting machines. His Mathematics for Engineering
Technicians unit (A3) gave algebra, radians, trigonometry and elementary calculus. **So the course should not assume either;
it should open with a short "do you still have it?" check per lesson and move fast through whatever he passes**, as the Motors
course does. It should spend its weight beyond that unit set: stress, strain and fatigue as a way of failing, rotation with
P = Tω and moment of inertia, power transmission, and vibration. Fatigue, moment of inertia with P = Tω, gears, belts and couplings, and vibration are not in the A8 or A55 learning outcomes as listed (A55 has "characteristics of rotating systems" and stress in members and joints), so they are the new ground.


## 4. The scope, and what the research says about each part

The eight parts follow the order the task gave. Each lists the evidence the brief can lean on. Where a part is Level 3 ground
Dan probably met, the brief goes quickly; where it is HN or MCA ground it goes deeper.


### 4.1 Forces and equilibrium: free-body diagrams, resolving, a lifting sling, friction

- **HSE: sling leg load rises as the angle between the legs rises**
  - Source: Safe lifting by machine - HSE. https://www.hse.gov.uk/work-equipment-machinery/lift-equipment.htm
  - Quote: "Remember that the load in the legs of a sling increases as the angle between the legs increases"

- **HSE: take sling angle into account with multi-slings**
  - Source: Safe lifting by machine - HSE. https://www.hse.gov.uk/work-equipment-machinery/lift-equipment.htm
  - Quote: "when using multi-slings make sure the sling angle is taken into account"

- **US DOE rigging guide: leg tension rises with no extra load lifted**
  - Source: Hoisting & Rigging Fundamentals. https://www.energy.gov/sites/prod/files/2014/01/f6/HoistingRigging_Fundamentals.pdf
  - Quote: "The tension in each leg increases without an increase in the load lifted."

- **US DOE rigging guide: the sling's strength does not change, the leg load does**
  - Source: Hoisting & Rigging Fundamentals. https://www.energy.gov/sites/prod/files/2014/01/f6/HoistingRigging_Fundamentals.pdf
  - Quote: "Actually, there is no change in the tensile strength of the sling leg."

- **Load angle factor is a ratio of lengths**
  - Source: Hoisting & Rigging Fundamentals. https://www.energy.gov/sites/prod/files/2014/01/f6/HoistingRigging_Fundamentals.pdf
  - Quote: "Divide the sling length by the vertical height. The result is the "Load Angle Factor" (LAF)."

- **MCA: static and dynamic friction, and friction's useful and harmful effects**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Distinguishes between static and dynamic friction. 4. Describes in simple terms the effects of lubrication. 5. States examples of both useful and detrimental effects of friction in engineering."

- **LibreTexts: free body diagram frees the body from its surroundings**
  - Source: 1.7: Free Body Diagrams - Engineering LibreTexts. https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Mechanics_Map_(Moore_2nd_Edition)/01%3A_Basics_of_Newtonian_Mechanics/1.07%3A_Free_Body_Diagrams (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "A free body diagram is a tool used to solve engineering mechanics problems."

My reading: a sling is the natural picture. Two legs, a load, an angle that slides: the leg force is W ÷ (2 cos of the angle
from vertical), which uses only what Vectors built (resolving). HSE and the US rigging guide both say the load in each leg rises as
the legs spread. The guide also names the misconception outright: the capacity falls but the strength of the leg does not change.
Friction is taught as a force that points against sliding, with the static-then-dynamic step the MCA lists. Free-body diagram
research is in 6.5.


### 4.2 Moments: turning effect, couples, centre of gravity, beam support reactions

- **BBC Bitesize: a moment is the turning effect of a force**
  - Source: Moments - Forces and movement - KS3 Physics - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z96g3j6
  - Quote: "A moment is the turning effect of a force."

- **BBC Bitesize: distance measured at a right angle**
  - Source: Moments - Forces and movement - KS3 Physics - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z96g3j6
  - Quote: "It is very important to remember that the distance from the pivot is measured at a right angle, or perpendicular"

- **MCA: principle of moments and conditions of equilibrium**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Explains the principle of moments. 9. States the conditions of equilibrium for non-current coplanar force systems."

- **MCA: centre of gravity by taking moments of mass**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Explains how a centre of gravity can be determined by taking moments of mass."

- **MCA: beam support reactions (simply supported and cantilever)**
  - Source: MCA General Engineering Science A Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/mca-general-engineering-science-a-written-examination-syllabuses
  - Quote: "Solve problems relating to simply supported beams involving vertical forces and uniformly distributed loads."

My reading: the syllabi list the principle of moments, centre of gravity by moments of mass, and support reactions for simply
supported beams with concentrated loads and UDLs. **A "couple" as a topic word did not appear in any syllabus line I could
quote, so it is UNCONFIRMED as a required item**; the HN and MCA lists use "torque" and the moment of a force. Vectors lesson 6
already showed the spanner and bolt as a cross product, so lesson 2 here connects that to a beam on two supports.


### 4.3 Stress, strain and materials: Young's modulus, the stress-strain curve, factor of safety, fatigue

- **LibreTexts Mechanics and Science of Materials: stiffness is Young's modulus, strength is yield or ultimate stress**
  - Source: Chapter 5: Mechanical Behavior of Materials Part I - Engineering LibreTexts. https://eng.libretexts.org/Courses/California_State_Polytechnic_University_Humboldt/Mechanics_and_Science_of_Materials/Chapter_5%3A_Mechanical_Behavior_of_Materials_Part_I (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "When we talk about the stiffness of materials we are talking about the Young’s modulus of the material."

- **Fatigue is the most common failure mechanism of shafts**
  - Source: Failure modes, mechanisms and causes of shafts in mechanical equipment - ScienceDirect. https://www.sciencedirect.com/science/article/pii/S135063072200190X
  - Quote: "Fatigue fracture is the most common failure mechanism of shafts owing to the influence of cyclic loads on shafts under normal working conditions."

- **Fatigue loads are far below the load that deforms the part**
  - Source: Shaft Failure Analysis. https://kh.aquaenergyexpo.com/wp-content/uploads/2023/03/Shaft-Failure-Analysis.pdf (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "Fatigue is caused by cyclical stresses, and the forces that cause fatigue failures are substantially less than those that would cause plastic deformation."

- **Fatigue contributes to about 90 percent of mechanical service failures (estimate)**
  - Source: Fatigue. https://dl.icdst.org/pdfs/files/98887906524869bb3a115372888c0dc4.pdf (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "It has been estimated that fatigue contributes to approxi- mately 90% of all mechanical service failures."

- **A rotating shaft sees a full stress reversal every turn**
  - Source: 6. https://wwww.uomus.edu.iq/img/lectures21/MUCLecture_2023_102427879.pdf (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "during each revolution every fibre on the surface of the shaft under- goes a complete reversal of stress due to bending moment."

My reading: stiffness and strength are different things, and Cal Poly Humboldt's course text says word choice matters (6.4).
Fatigue is the way rotating parts usually fail, and the evidence is solid at "most common" but soft at a number: the "about
90 percent" figure is a textbook estimate ("it has been estimated"), from a copy of a book chapter (SECONDARY), so use the
words "most common" and leave the percentage out unless it is footnoted as an estimate. Fatigue loads are well below what
would deform the part once, which is the surprising idea to build a picture around.


### 4.4 Motion: displacement, velocity, acceleration, equations and graphs, Newton's laws, momentum and impulse

- **MCA: the four kinematic equations and graph slopes**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Sketches velocity/time graphs for uniform acceleration and identifies the slope as acceleration and the area as displacement."

- **Brilliant Classical Mechanics Level 2 starts with the kinematic equations**
  - Source: Practice Classical Mechanics | Brilliant. https://brilliant.org/courses/dynamics-bootcamp
  - Quote: "Level 2 The Kinematic Equations Angular Kinematics Projectile Motion"

- **MCA General Engineering Science A: force, inertia and momentum problems**
  - Source: MCA General Engineering Science A Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/mca-general-engineering-science-a-written-examination-syllabuses
  - Quote: "Solve problems relating to force, inertia and momentum."

My reading: the MCA lists the four constant-acceleration equations and slope and area on velocity-time graphs. Calculus
fundamentals already taught slope and area, so lesson 4 uses those and derives nothing. Brilliant's Classical Mechanics starts
here too, and its impulse-momentum lesson is level 5.


### 4.5 Work, energy and power

- **Brilliant Classical Mechanics level 4 energy lessons**
  - Source: Practice Classical Mechanics | Brilliant. https://brilliant.org/courses/dynamics-bootcamp
  - Quote: "Level 4 Exploring Energy Work-Energy Theorem Conservation of Energy Power Elastic Energy Potential Energy"

- **BBC Bitesize: power is work done per unit of time**
  - Source: Energy, work and power - IGCSE Physics - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zfgkh4j
  - Quote: "power is work done per unit of time, and also energy transferred per unit time"

- **Pearson formula booklet for Unit 1 lists P = Tω, rotational kinetic energy and ω = 2πf**
  - Source: Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/Additional-sample-assessment-material-Unit-1-Engineering-Principles-Information-Booklet.pdf
  - Quote: "Power _P_ = _T_ ω Rotational Kinetic energy _KE_ = ¹ 2 _I_ ω ² Angular frequency ω = 2π _f_"

My reading: Brilliant has seven lessons on this (level 4), BBC Bitesize defines power as work done per unit time, and Pearson's
booklet gives P = Fv, P = W/t and efficiency. Dan already knows electrical power; the tie is that mechanical power in is
electrical power out in a generator and the reverse in a motor, with the same efficiency idea. The sources I found do not draw that
link, so it is **my reading, not sourced**.


### 4.6 Rotation: angular velocity, rpm to rad/s, torque, P = Tω, moment of inertia, flywheels and run-up time

- **MTU motor notes: rev/min to rad/s by multiplying by 2π/60**
  - Source: Motor Calculations.PDF. https://pages.mtu.edu/~wjendres/ProductRealization1Course/DC_Motor_Calculations.pdf (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "In calculating rotational power, it is necessary to convert the velocity to units of rad/sec. This is accomplished by simply multiplying the velocity in RPM by the constant (2 x π) /60"

- **MTU motor notes: P = M ω with torque and angular velocity**
  - Source: Motor Calculations.PDF. https://pages.mtu.edu/~wjendres/ProductRealization1Course/DC_Motor_Calculations.pdf (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "Where: Prot = rotational mechanical power M = torque ω = angular velocity"

- **OpenStax: work and power for rotational motion apply to physics and engineering**
  - Source: 10.8 Work and Power for Rotational Motion - University Physics Volume 1 | OpenStax. https://openstax.org/books/university-physics-volume-1/pages/10-8-work-and-power-for-rotational-motion
  - Quote: "we define work and power within the context of rotation about a fixed axis, which has applications to both physics and engineering."

- **Wikipedia: a flywheel stores energy from its moment of inertia and speed**
  - Source: Flywheel - Wikipedia. https://en.wikipedia.org/wiki/Flywheel (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "kinetic energy proportional to the product of its [moment of inertia](https://en.wikipedia.org/wiki/Moment_of_inertia "Moment of inertia") and the square of its"

- **Flywheel energy: doubling speed gives four times the energy**
  - Source: Flywheel Energy Ratio Calculator: How Speed Changes Storage | FIRGELLI. https://www.firgelliauto.com/blogs/mechanisms/flywheel (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "The stored-energy ratio is the square of the speed ratio. Doubling speed gives four times the energy for the same rotor."


### 4.7 Power transmission: shafts, couplings, belts and gears, gear ratios, efficiency, alignment in outline

- **HN unit: gear trains, belt drives, clutches**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "Flat and v-section belts drives: maximum power and initial tension requirements"

- **MCA Applied Mechanics (Chief Engineer): power transmitted by a rotating shaft**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Recalls the expression for the power transmitted by a rotating shaft."

- **US DOE: misalignment does not change motor efficiency but affects smooth power transmission**
  - Source: The Importance of Motor Shaft Alignment. https://www.energy.gov/sites/prod/files/2014/04/f15/importance_motor_shaft_motor_systemts4.pdf
  - Quote: "While misalignment has no measurable effect on motor efficiency, correct shaft alignment ensures the smooth, efficient transmission of power from the motor to the driven equipment."

- **SKF: two types of misalignment, angular and parallel**
  - Source: CM5118 EN Spectrum Analysis 121712.indd. https://cdn.skfmediahub.skf.com/api/public/0901d1968024acef/pdf_preview_medium/0901d1968024acef_pdf_preview_medium.pdf (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "The two types of misalignment are angular and parallel, or a combination of both."


### 4.8 Vibration: mass and spring, natural frequency, resonance and critical speed, damping, balancing, condition monitoring

- **HN: natural frequency, damped systems and resonance**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "Frequency of damped vibrations in mass-spring-damper systems"

- **OpenStax: resonance is driving at the natural frequency**
  - Source: 15.6 Forced Oscillations - University Physics Volume 1 | OpenStax. https://openstax.org/books/university-physics-volume-1/pages/15-6-forced-oscillations
  - Quote: "The phenomenon of driving a system with a frequency equal to its natural frequency is called resonance ."

- **OpenStax: the biggest response comes with the least damping**
  - Source: 15.6 Forced Oscillations - University Physics Volume 1 | OpenStax. https://openstax.org/books/university-physics-volume-1/pages/15-6-forced-oscillations
  - Quote: "Resonance occurs when the driving frequency equals the natural frequency, and the greatest response is for the least amount of damping."

- **MCA Chief Engineer: frequency of a mass on a helical spring and SHM**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Derives the expression for the frequency of a mass vibrating on a helical spring."

- **Critical speed is the speed at which the rotating element excites resonance**
  - Source: Vibration Analysis for Machinery Health Diagnosis. https://www.emerson.com/is/content/emerson/en/systems-and-software/ams/brochures-and-flyers/documents/vibration-analysis-for-machinery-health-diagnosis-booklet.pdf (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "A critical speed occurs when the rotating element is turning at a speed which excites resonance in the machine."

- **Keep operating speed 10 percent away from a critical speed**
  - Source: by (Buddy) Wachel and Fred Szenasi. https://rotorlab.tamu.edu/me459/NOTES%209%20TPS%20lectures%20on%20torsional%20vibrations/1993%20Turbo%2022%20Torsional%20Vibes%20-%20Wachel.pdf (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "they should be avoided by a 10 percent margin, if feasible."

- **Unbalance forces rise with speed squared**
  - Source: 6.1 GENERAL OBJECTIVES 1) To gain insight into the causes of undesirable vibration of rotors and to understand static and. https://web.mst.edu/~stutts/ME242/LABMANUAL/DynamicBalancingExp.pdf (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "The forces generated due to an unbalance are proportional to the rotating speed of the rotor squared."

- **Misalignment defined: the centre lines of coupled shafts are not in one line**
  - Source: Vibration Analysis for Machinery Health Diagnosis. https://www.emerson.com/is/content/emerson/en/systems-and-software/ams/brochures-and-flyers/documents/vibration-analysis-for-machinery-health-diagnosis-booklet.pdf (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "Misalignment is when rotational center lines of coupled shafts are not collinear."

My reading: Differential equations built the mass-spring-damper and the driven swing (its lessons 5 to 7), so lesson 8 here uses
those pictures on a machine: a rotor with an unbalance, a speed sweep that crosses a critical speed, and a damping slider.
The practical rules the sources give are short and teachable: unbalance force rises with speed squared, keep running speed
about 10 percent clear of a critical speed (an industrial rule of thumb from a turbomachinery tutorial, SECONDARY), and
vibration monitoring separates unbalance, misalignment, looseness, and bearing and gear faults.


## 5. Prerequisites: what this leans on and what must be taught inline

Two lists. The first is evidence from sources about what the topic assumes. The second is my reading of the built courses.


### 5.1 What the sources assume

- **BTEC Unit 1 expects algebraic and trigonometric methods**
  - Source: Specification - Pearson BTEC Level 3 National Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/btec-nat-eng-cert-spec.pdf
  - Quote: "You will explore and apply the algebraic and trigonometric mathematical methods required to solve engineering problems."

- **Bird's Mechanical Engineering Principles opens with a mathematics revision part**
  - Source: Mechanical Engineering Principles - 4th Edition - John Bird - Carl Ros. https://www.routledge.com/Mechanical-Engineering-Principles/Bird-Ross/p/book/9780367253240
  - Quote: "Part One: Revision of Mathematics. 1. Revisionary mathematics. Revision Test 1 Revisionary mathematics. 2. Further revisionary mathematics."

- **Classical Mechanics assumes mathematics and physics first**
  - Source: Practice Classical Mechanics | Brilliant. https://brilliant.org/courses/dynamics-bootcamp
  - Quote: "You’ll need an understanding of mathematics and fundamental physics."

**What Dan has from the built courses (my reading, from their briefs in `build/`; nothing here is re-taught):**
- *Vectors* (7 lessons): resolving a force into F cos θ and F sin θ; adding forces tip to tail, including a ring pulled by ropes;
  the closed chain for equilibrium; the dot product as work; the cross product as a moment (the spanner and bolt).
- *Calculus fundamentals*: velocity as a rate of change, the derivative as a slope, area under a graph as a total (work as an
  area is a short step from that).
- *Differential equations*: the spring and damper, the roots and the motion, the driven swing and resonance.
- *Trigonometry*: radians (lesson 5 there), so rpm to rad/s needs only the 2π ÷ 60 step; *Powers and roots*: square roots
  for natural frequency; *Proportional reasoning*: ratios for gears and levers; *Straight-line graphs*: Hooke's law as a slope;
  *Solving equations*: rearranging formulae; *Geometry fundamentals*: circle areas for stress.
- *AC circuits* (resonance and the phasor idea), *Electronics and power electronics* and *Motors* (torque, speed and power at
  the shaft). Motors is where Dan met P = Tω, per the task note; **I could not find P = Tω written in the Motors brief I read,
  so the brief writer should check Motors' lessons for how far it went (UNCONFIRMED).**

**Must be taught inline (not built anywhere, my reading):** the free-body diagram habit; the moment of a force as force times
perpendicular distance, a couple, and the centre of gravity; stress, strain, Young's modulus and the curve; Newton's three laws
and momentum as plain ideas (Vectors gave the arrows, not the laws); kinetic and potential energy; moment of inertia and
angular acceleration; gear ratio and efficiency; the natural frequency of a mass and spring in plain words (Differential
equations derived it as a rule, here it is a machine). Unit habits (N, N m, J, W, Pa, rad/s) run through every lesson
because the examiner reports in 6.3 show where marks go.


## 6. Misconceptions and learning science

Each group lists the named mistake and its source, then how it shapes a lesson.


### 6.1 Force, motion, Newton's third law and friction

- **Over 70 percent of secondary students held a significant mechanics misconception; force-motion confusion and impetus most common**
  - Source: Identifying and Addressing Misconceptions in Physics Among Secondary School Students: A Classroom-Based Study – IJERT. https://www.ijert.org/identifying-and-addressing-misconceptions-in-physics-among-secondary-school-students-a-classroom-based-study-ijertv15is040103 (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "Results reveal that over 70% of students held at least one significant misconception in mechanics, with force-motion confusion and the impetus theory being the most prevalent."

- **Student idea: no force pushing it, it will just stop**
  - Source: Identifying and Addressing Misconceptions in Physics Among Secondary School Students: A Classroom-Based Study – IJERT. https://www.ijert.org/identifying-and-addressing-misconceptions-in-physics-among-secondary-school-students-a-classroom-based-study-ijertv15is040103 (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "'If there's no force pushing it, it will just stop."

- **Intuitive misconceptions come from generalising everyday life, where friction is always present**
  - Source: Intuitive physics and cognitive algebra: A review - ScienceDirect. https://www.sciencedirect.com/science/article/abs/pii/S1162908820301237
  - Quote: "many of the students’ misconceptions about object motion can be attributed to the incorrect generalization of everyday life experience."

- **Students underestimate the force object B exerts on object A (Newton's third law)**
  - Source: Grounding Intuitive Physics in Perceptual Experience. https://www.mdpi.com/2079-3200/11/10/187 (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "However, they frequently neglect or underestimate the force exerted by object B on object A , thereby deviating from the principles of Newton’s third law"

- **FCI cluster analysis: strong Newton's third law misconceptions form their own group**
  - Source: Examining the relation of correct knowledge and misconceptions using the nominal response model. https://link.aps.org/doi/10.1103/PhysRevPhysEducRes.17.010122
  - Quote: "non-Newtonian thinkers strongly applying Newton’s third law misconceptions"

- **IOPSpark: many students think a force is a property of an object**
  - Source: Many students think of a force as a property of objects, not as something that arises when two objects interact | IOPSpark. https://spark.iop.org/many-students-think-force-property-objects-not-something-arises-when-two-objects-interact
  - Quote: "Many students think of a force as a property of objects, not as something that arises when two objects interact"

- **IOPSpark: many students see friction as a phenomenon rather than a force**
  - Source: Many students see friction as a phenomenon, rather than as a force | IOPSpark. https://spark.iop.org/many-students-see-friction-phenomenon-rather-force
  - Quote: "Many students see friction as a phenomenon, rather than as a force"

- **FCI items show Newton's third law, motion implies active force, circular impetus misconceptions**
  - Source: Discovering Misconceptions and Misunderstandings From Administrations of Research-Designed Multiple Choice Instruments. https://arxiv.org/html/2606.08986v1 (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "Newton’s 3rd law misconceptions {4A, 15C, 28D}, motion implies active forces {5D, 18D}, motion implies active forces with a centrifugal force {5E, 18E}, circular impetus"

My reading: the best-evidenced mistakes are "motion needs a force" (the impetus idea), forces as properties of objects,
the force-pair mistake in Newton's third law, and friction as something that "just happens" instead of a force. The lessons
should have Dan **predict** first (will the box keep sliding on frictionless ice? which of the pair is bigger?), then play,
then say it back. The sling example gives a trade-flavoured version: "does the sling get weaker when the legs spread?"


### 6.2 Rotation

- **Rotational version of 'constant net force means constant velocity': 'constant net torque means constant angular velocity'**
  - Source: Student understanding of rotational and rolling motion concepts. https://journals.aps.org/prper/pdf/10.1103/PhysRevSTPER.1.010102
  - Quote: "“constant net torque implies constant angular velocity.”"

- **Students had great difficulty with how rotational kinetic energy depends on the moment of inertia**
  - Source: Student understanding of rotational and rolling motion concepts. https://journals.aps.org/prper/pdf/10.1103/PhysRevSTPER.1.010102
  - Quote: "Student re- sponses to questions related to rotational kinetic energy showed that students had great difficulty with the exact de- pendence of the kinetic energy on the moment of inertia"

- **WJEC examiners: squaring of angular velocity frequently omitted**
  - Source: WELSH JOINT EDUCATION COMMITTEE. https://www.wjec.co.uk/media/n1lp5ufh/wjec-gce-physics-final-report-s24-e-1.pdf
  - Quote: "the squaring of the angular velocity was frequently omitted even though the correct equation was correctly identified."


### 6.3 Mistakes examiners name (units, moments, stress, power)

- **Cambridge examiners: weaker candidates confused power and work**
  - Source: PHYSICS. https://www.cambridgeinternational.org/Images/567861-june-2024-examiner-report.pdf
  - Quote: "Some weaker candidates confused power and work"

- **Cambridge examiners: confusing moment with momentum**
  - Source: PHYSICS. https://www.cambridgeinternational.org/Images/567861-june-2024-examiner-report.pdf
  - Quote: "a small number referred to ‘moment’ rather than ‘momentum’."

- **Cambridge examiners: a given stress treated as a force**
  - Source: PHYSICS. https://www.cambridgeinternational.org/Images/567861-june-2024-examiner-report.pdf
  - Quote: "Often weaker candidates confused the given value of stress with a force"

- **Edexcel examiners: reversing stress formula gives an impossibly large extension**
  - Source: Examiners’ Report Principal Examiner Feedback. https://qualifications.pearson.com/content/dam/pdf/A-Level/Physics/2015/Exam-materials/9PH0_02_pef_20201217.pdf
  - Quote: "The most common error was reversing the numerator and denominator in the stress formula to arrive at a very large extension they should have realised was impossible."

- **Edexcel examiners: moment needs force and distance perpendicular**
  - Source: Examiners’ Report June 2016 GCE Physics 8PH0 01. https://qualifications.pearson.com/content/dam/pdf/A-Level/Physics/2015/Exam-materials/8PH0_01_pef_20160817.pdf
  - Quote: "moment of a force is Fx where the force and the distance must be perpendicular to one another."

- **Edexcel examiners: weight acts at the centre of a slab when taking moments**
  - Source: GCE. https://qualifications.pearson.com/content/dam/pdf/A-Level/Physics/2015/Exam-materials/9PH0_01_pef_20201217.pdf
  - Quote: "the weight of the slab acts at its centre"

- **Edexcel examiners (2016): saw mass and velocity and calculated kinetic energy instead of power**
  - Source: Examiners’ Report June 2016 GCE Physics 8PH0 01. https://qualifications.pearson.com/content/dam/pdf/A-Level/Physics/2015/Exam-materials/8PH0_01_pef_20160817.pdf
  - Quote: "However, most, on seeing the mass and velocity of the block, chose to calculate the kinetic energy."

- **Edexcel examiners (International GCSE): conservation of momentum confused with the principle of moments**
  - Source: GCE. https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Physics/2017/exam-materials/4PH1_2PR_pef_20200305.pdf
  - Quote: "Conservation of momentum was described well in Q3(c), the most common errors being, again, confusion with the principle of moments"

- **BBC Bitesize: do not confuse newton-metres with Newton meters**
  - Source: The work done equation - Momentum, work and power - OCR Gateway - GCSE Physics (Single Science) Revision - OCR Gateway - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zw3wtv4/revision/3
  - Quote: "It is important not to confuse newton-metres (a unit of work done) with Newton meters"

My reading: these are mistakes worth building a "which slip is this?" check around: power versus work, moment versus
momentum, a stress given as a force, an inverted stress formula giving an impossible answer (a size check is the cure),
forgetting to square ω, using a distance that is not perpendicular, moving the weight off the centre of a uniform body, and
mixing up N m (work) with the newton meter (a spring balance), which Bitesize names. The size check (is the answer sensible?)
shows up in an Edexcel examiner report ("they should have realised was impossible"), so each calculation lesson ends on it.


### 6.4 Materials and design thinking

- **Cal Poly Humboldt text: stiffness and strength mean very different things**
  - Source: Chapter 5: Mechanical Behavior of Materials Part I - Engineering LibreTexts. https://eng.libretexts.org/Courses/California_State_Polytechnic_University_Humboldt/Mechanics_and_Science_of_Materials/Chapter_5%3A_Mechanical_Behavior_of_Materials_Part_I (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "Word choice is critical here because they mean very different things."

- **Materials science research: four kinds of student difficulty with basic concepts**
  - Source: Student difficulties with basic concepts in introductory materials science engineering. https://www.computer.org/csdl/proceedings-article/fie/2011/06142989/12OmNy4IF6u
  - Quote: "We identified four general areas in which students have difficulties: Student confusion of similar concepts"

- **Dynamics Concept Inventory: only 9 percent of students with a misconception improved**
  - Source: Wip Implementation Of A Dynamics Concept Inventory Before And After A Dynamics Class. https://peer.asee.org/wip-implementation-of-a-dynamics-concept-inventory-before-and-after-a-dynamics-class.pdf
  - Quote: "only 9 % of those students who had a misconception on this"


### 6.5 Learning science for the lesson design

- **Hake's survey: interactive engagement courses gained 0.48, traditional 0.23**
  - Source: Interactive-engagement versus traditional methods: A six-thousand-student survey of mechanics test data for introductory physics courses - ADS. https://ui.adsabs.harvard.edu/abs/1998AmJPh..66...64H
  - Quote: "achieved an average gain <g> IE-ave =0.48±0.14 (std dev)"

- **Hake's survey: traditional courses gained 0.23**
  - Source: Interactive-engagement versus traditional methods: A six-thousand-student survey of mechanics test data for introductory physics courses - ADS. https://ui.adsabs.harvard.edu/abs/1998AmJPh..66...64H
  - Quote: "Fourteen "traditional" (T) courses (N=2084) which made little or no use of interactive-engagement (IE) methods achieved an average gain <g> T-ave =0.23±0.04 (std dev)."

- **PhET research: prediction questions are necessary to gain conceptual understanding from a demonstration**
  - Source: What Levels of Guidance Promote Engaged Exploration with Interactive Simulations?. https://phet.colorado.edu/publications/PERC_Interview_Guidance.pdf
  - Quote: "Physics education researchers have found that prediction questions are necessary for students to gain a conceptual understanding from lecture demonstration."

- **PhET research: minimal but nonzero guidance works best with simulations**
  - Source: What Levels of Guidance Promote Engaged Exploration with Interactive Simulations?. https://phet.colorado.edu/publications/PERC_Interview_Guidance.pdf
  - Quote: "Minimal but nonzero guidance with many of these simulations promotes optimum engaged exploration and learning."

- **PhET: best driving questions are open and conceptual**
  - Source: What Levels of Guidance Promote Engaged Exploration with Interactive Simulations?. https://phet.colorado.edu/publications/PERC_Interview_Guidance.pdf
  - Quote: "The driving questions that work best are open, conceptual questions that do not ask specifically about the simulation, but rather ask about the actual science concept."

- **Predict-Explain-Observe-Explain: ask for a prediction with reasoning, not a guess**
  - Source: 12. Predict Explain Observe Explain — ShowingPhysics. https://interactivetextbooks.tudelft.nl/showthephysics/Pedagogy/PoE.html
  - Quote: "we ask students for a prediction with reasoning, not just a guess."

- **Misconceptions resist change and need explicit discussion**
  - Source: Grounding Intuitive Physics in Perceptual Experience. https://www.mdpi.com/2079-3200/11/10/187 (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "students’ misconceptions regarding basic physical phenomena are resistant to change"

My reading: all of these point at the app's own pattern. Hake's survey of mechanics courses compares interactive-engagement
methods (hands-on, immediate feedback) with traditional ones; the PhET research says prediction questions are needed, a little
guidance works best, and open questions about the science, not the controls, work best. A simulation with no question is a
toy. Misconceptions resist change, so a wrong prediction that the picture then shows to be wrong is worth more than a right
explanation first. The strongest sources here are Hake (a peer-reviewed survey) and the PhET group's guidance; the physics-
education papers on misconceptions are good, and the IJERT study is a single recent classroom study (SECONDARY).


## 7. Where it is used for an electrician going into marine engineering

Each use has a quote from a reachable page. All are general marine or industrial, never a specific boat. **One caution:**
the only gearbox quote I found is about a marine diesel engine and propeller; the brief should use the ratio rule with a pump
drive or generator set instead, not propulsion plant.


### 7.1 Cranes and slings

- **Crane and sling work: HSE says take the sling angle into account**
  - Source: Safe lifting by machine - HSE. https://www.hse.gov.uk/work-equipment-machinery/lift-equipment.htm
  - Quote: "when using multi-slings make sure the sling angle is taken into account"

- **Slinger/signaller guide: the safe working load of a multi-leg sling falls as the angle opens**
  - Source: Slinger Signaller. https://www.highwayssafetyhub.com/uploads/5/1/2/9/51294565/3a_-_hr_t_d_slinger_signaller_study_guide.pdf (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "In the case of multi-leg slinging applications the SWL of each sling is reduced as the lifting angle is increased."

- **Slinging guidance: low sling angles are hazardous**
  - Source: ihsa.ca. https://www.ihsa.ca/PDFs/Products/Id/DS033.pdf
  - Quote: "Sling angles approaching 30° are extremely hazardous and must be avoided at all"


### 7.2 Shafts that break: fatigue

- **Pump shafts: fatigue is probably the most common cause of failure**
  - Source: (PDF) Pump shaft failures - a compendium of case studies. https://www.researchgate.net/publication/30509313_Pump_shaft_failures_-_a_compendium_of_case_studies (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "Probably the most common cause of failure on pump shafts is fatigue."

- **A keyway raised local stress on a machine's output shaft and started fatigue cracks**
  - Source: Failure analysis by keyway stress concentration of a pickling decoiler machine output shaft - ScienceDirect. https://www.sciencedirect.com/science/article/abs/pii/S1350630725002560
  - Quote: "They found that the shaft failed due to torsional-bending fatigue stresses concentrated at the keyway edges."


### 7.3 Alignment, vibration and condition monitoring

- **Motor shaft alignment: misalignment causes vibration, heat and early bearing, coupling or shaft failure**
  - Source: The Importance of Motor Shaft Alignment. https://www.energy.gov/sites/prod/files/2014/04/f15/importance_motor_shaft_motor_systemts4.pdf
  - Quote: "Misalignment produces excessive vibration, noise, coupling, and bearing temperature increases, and premature bearing, coupling, or shaft failure."

- **Predictive maintenance can tell bearing wear, misalignment and electrical vibration apart**
  - Source: The Importance of Motor Shaft Alignment. https://www.energy.gov/sites/prod/files/2014/04/f15/importance_motor_shaft_motor_systemts4.pdf
  - Quote: "Apply predictive maintenance techniques, including vibration tests and frequency spectrum analysis, to distinguish between bearing wear, shaft misalignment, or electrically caused vibrations."

- **Pump rotordynamics: misalignment is the most common vibration cause after imbalance**
  - Source: An End-User’s Guide to Centrifugal Pump Rotordynamics. https://oaktrust.library.tamu.edu/server/api/core/bitstreams/e04e45a2-d43f-48ed-b826-4fef2953481f/content (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "Next to imbalance, misalignment is the most common cause of vibration problems in rotating machinery."

- **Vibration monitoring faults list: misalignment, unbalance, looseness, bearing deterioration, gear wear**
  - Source: Introduction to Vibration Based Condition Monitoring. https://prod-edam.honeywell.com/content/dam/honeywell-edam/pmt/hps/products/pmc/field-instruments/honeywell-versatilis-transmitter/hon-ia-pmc-introduction-to-vibration-based-condition-monitoring.pdf (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "Misalignment of couplings, bearings and gears • Unbalance of rotating components • Looseness • Deterioration of rolling-element bearings • Gear wear"

- **ISO 20816-1 covers vibration measurement and evaluation on rotating machines**
  - Source: ISO 20816-1 - Mechanical vibration — Measurement and evaluation of machine vibration — Part 1: General guidelines. https://www.iso.org/standard/89921.html
  - Quote: "establishes general conditions and procedures for the measurement and evaluation of vibration"

- **US DOE: check alignment of production-critical equipment annually**
  - Source: The Importance of Motor Shaft Alignment. https://www.energy.gov/sites/prod/files/2014/04/f15/importance_motor_shaft_motor_systemts4.pdf
  - Quote: "Check shaft alignment of all production-critical equipment annually."

My reading: the electrician's link is strong here. A motor and a pump are coupled by a shaft, and misalignment is the
mechanical fault behind a lot of motor-bearing trouble; the US Department of Energy page says alignment is checked
annually for critical equipment and that vibration trends warn of misalignment. ISO 20816 is the measurement standard; the
course should name it once and not teach it.


### 7.4 Motors, flywheels and gearboxes

- **Motor calculations: convert RPM to rad/s before multiplying torque**
  - Source: Motor Calculations.PDF. https://pages.mtu.edu/~wjendres/ProductRealization1Course/DC_Motor_Calculations.pdf (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "In calculating rotational power, it is necessary to convert the velocity to units of rad/sec."

- **Flywheels control speed variations from an engine's fluctuating torque**
  - Source: Ch 16 .pmd. https://cdnx.uobabylon.edu.iq/lectures/exrvgga2SUCdmhXkJ0zj8g.pdf (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "a flywheel controls the speed variations caused by the fluctuation of the engine"

- **Reduction gearbox slows the shaft so the driven load turns at a suitable speed**
  - Source: Gearbox Ratio - AB Marine. https://ab-marine.com/knowledge-base-propeller-basics/marine-gearbox (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "Most marine diesel engines have a reduction gearbox, which makes the shaft turn slower than the engine, at a speed more suitable for the propeller."

- **Propeller speed from engine speed and ratio**
  - Source: Gearbox Ratio - AB Marine. https://ab-marine.com/knowledge-base-propeller-basics/marine-gearbox (SECONDARY: not the original publisher or a non-original copy)
  - Quote: "Propeller speed (SRPM) = Engine rated RPM ÷ Gearbox reduction ratio"


## 8. Size: how many lessons the benchmarks spend, and which core supports eight lessons

Counts below are the benchmark's own, or my counts from its own lists.


### 8.1 What the benchmarks spend

- **Pearson BTEC Unit 1 is 120 guided learning hours**
  - Source: Specification - Pearson BTEC Level 3 National Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/btec-nat-eng-cert-spec.pdf
  - Quote: "Guided learning hours: 120"

- **Khan Academy AP Physics 1 is nine units**
  - Source: AP Physics 1 review | AP®︎/College Physics 1 | Science | Khan Academy. https://www.khanacademy.org/science/ap-college-physics-1/xf557a762645cccc5:ap-physics-1-review/xf557a762645cccc5:ap-physics-1-concept-review
  - Quote: "AP®︎/College Physics 1 9 units"

- **Khan Academy Physics library (intl) is 19 units**
  - Source: Torque and angular momentum | Physics library (intl) | Khan Academy. https://www.khanacademy.org/science/physics-library-intl/x10bf974b5c2ada11:torque-angular-momentum
  - Quote: "Physics library (intl) 19 units"

- **Pearson HN unit credit size**
  - Source: Unit 4063: Engineering Mechanics and Materials. https://unicourse.org/wp-content/uploads/2024/06/Engineering-Mechanics-and-Materials.pdf
  - Quote: "Unit 4063: Engineering Mechanics and Materials ### Unit Code: F/650/2943 ### Level: 4 ### Credits: 15"

**Counts from the sources:** Brilliant Classical Mechanics 48 lessons, about 30 on this ground; Physics of the Everyday 38,
with five on rotation and structures; Scientific Thinking 40, with about 26 on gears, moments and structures. Khan Academy's
mechanics path is 9 units for AP Physics 1 and 19 for the international physics library. Pearson BTEC Unit 1 is 120 guided
learning hours, covering mechanical, electrical and electronic principles together, so its mechanical content is a part of
that (the split is **UNCONFIRMED**). An HN unit such as Engineering Mechanics and Materials is 15 credits (quoted above).

**Which core supports eight lessons for Dan (my reading, a guess where marked):**

| # | Lesson | Fast or deep | Sources |
|---|---|---|---|
| 1 | Forces in balance: free-body diagrams, resolving, a sling, friction | Fast: Vectors has the maths, BTEC has the rest | 4.1, 2.1, 3.4 |
| 2 | Moments: turning effect, centre of gravity, beam reactions | Fast to medium: couples in a line (guess) | 4.2, 3.4 |
| 3 | Stress, strain and materials: curve, factor of safety, fatigue named | **Deep:** not in Brilliant, only listed at Level 3 | 4.3, 3.2, 3.4 |
| 4 | Motion: equations and graphs, Newton, momentum and impulse | Fast: Calculus and Vectors have the tools | 4.4, 3.4 |
| 5 | Work, energy and power: efficiency, tied to electrical power | Fast to medium | 4.5, 2.1 |
| 6 | Rotation: ω, rpm to rad/s, torque, P = Tω, moment of inertia, run-up time | **Deep** | 4.6, 3.3, 3.4 |
| 7 | Power transmission: shafts, couplings, belts, gear ratios, alignment | **Deep** | 4.7, 3.3 |
| 8 | Vibration: natural frequency, resonance, critical speed, damping, balancing | **Deep:** Differential equations built the maths | 4.8, 3.3 |

Eight is a fit because the eight parts of the scope map one to one to the BTEC Unit 1 sections B and C, the HN Mechanical
Principles outcomes, and the MCA lists, with no part needing two lessons if the first five go quickly. **Risks (guess):**
lesson 3 may need splitting (stress and strain, then the curve and failure), and lesson 4 carries Newton, graphs and
momentum. If either splits, merging lessons 1 and 2 (forces and moments, a single "statics" lesson) keeps the count at eight.
Beam shear force and bending moment diagrams and the theory of torsion are HN and MCA second-engineer ground: **I suggest
leaving them out** (a guess, because Dan asked for foundations, not a remake of the Navy course) and naming them as "what comes
next" in the closing lesson.


---

## UNCONFIRMED or limits, in one place
- **Brilliant:** lesson titles only; what happens inside any lesson is UNCONFIRMED.
- **Dan's Diploma:** which units he sat is UNCONFIRMED; unit descriptions for A8, A55 and A3 are from a college listing
  of the unit text (SECONDARY), not Pearson's unit specification.
- **Standards:** no standard titled "marine engineering technician" was found; the ST1402/ST1403 lines are from PDFs marked
  "Standard in development" (UNCONFIRMED for the current text); the Navy's Level 3 marine engineering course syllabus is not public.
- **Couples** as a named syllabus item: not found in a quotable line.
- **Fatigue "about 90 percent":** a textbook estimate ("it has been estimated"), from a copy of a book chapter; not for use as a fact.
- **"Mechanical power in is electrical power out" tie:** my reading, no source.
- **Heat and fluids:** MCA Applied Heat, GES B, BTEC unit D and the HN fluid and thermodynamics units are named so the brief can leave
  them to that course.
- **Gearbox quotes** are about a marine diesel and a propeller; use only the ratio rule.
- **Lessons 1 and 2 split/merge, deep versus fast** in 8.1 are guesses.
