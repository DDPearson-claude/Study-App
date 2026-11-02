# Scientific thinking: research notes

Researched 2 Nov 2026 for the Scientific thinking course brief (the first course in the Science shelf's Science
folder; blurb "Puzzles about the physical world, and how to reason your way through them.", from "Brilliant:
Scientific Thinking"). The brief itself is not written here; these notes are its evidence. Dan is an electrician
and a Royal Navy submariner on the electrical engineering path. Next year he does a Level 3 marine engineering
course, and in January a one-week Leading Rate marine engineering enabling course. He asked (2 Nov) for visual and
interactive puzzles with some mathematics, following Brilliant's Scientific Thinking but adding the working
Brilliant leaves out. He already has Mechanics and materials, Heat and fluids, Trigonometry, Vectors and Linear
systems, plus the rest of the maths and electrical courses (CLAUDE.md lists them), so lessons 1 to 5 are puzzles and
practice on ground he has, and lessons 6 and 7 (mirrors, refraction and prisms) are new.

Every finding has its source title, URL and the exact words, copied from a saved tool result by script (the quotes
were not retyped into this file). All of them are listed in `quotes.json` beside this file and were checked with
`node tools/eval/sources.mjs --quotes ... --tools ...` (`failed: 0`). The tool files are in `tools/`.
Findings I could not confirm are marked **UNCONFIRMED**; where only a non-original site said it, **SECONDARY**.
My own readings are marked "My reading" and are not quotes. Pages the checker treats as copies (archive.org and
similar) are not quoted. Sources marked "vendor" are makers' own catalogue or manual pages: they show that a thing is
made and sold, nothing about how any navy uses it.

One thing about the checker shaped what could be quoted. It sees a search result in a shortened form (lower-ranked
results are cut to a few hundred characters), so for most pages I fetched the page itself with a focused request and
quoted from that. A quote below is therefore always from words the checker holds.

---

## 1. Benchmark: Brilliant's Scientific Thinking, Physics of the Everyday and Classical Mechanics

### 1.1 Scientific Thinking itself
Brilliant's page for the course is `brilliant.org/courses/puzzle-science/` (the old address still works; `/gears`
and `/mechanics` on the end show the same page). The course is **40 lessons in 6 levels**, with a Level Review at the
end of levels 1 to 5. Counting lessons without the reviews: Gears 4, Mobiles 8, Pool 7, Structures 9, Optics 7,
Compound Gears 5 (4 + 8 + 7 + 9 + 7 + 5 = 40). So gears take 9 of the 40 lessons (levels 1 and 6), mobiles 8,
collisions 7, structures 9, optics 7.

- **Brilliant Scientific Thinking is 40 lessons and 557 exercises**
  - Source: Practice Scientific Thinking | Brilliant. https://brilliant.org/courses/puzzle-science/
  - Quote: "Open your eyes to the world around you by solving puzzles with science. 40 Lessons 557 Exercises"
- **Level 1, Gears: four lessons and a review**
  - Source: Practice Scientific Thinking | Brilliant. https://brilliant.org/courses/puzzle-science/
  - Quote: "Level 1 Gears Connecting Gears Gears Changing Speeds Compound Gears Compound Gear Chains Level Review"
- **Level 2, Mobiles: eight lessons, ending on a mystery weight, multiple unknowns and simultaneous solving**
  - Source: Practice Scientific Thinking | Brilliant. https://brilliant.org/courses/puzzle-science/
  - Quote: "Level 2 Mobiles Balancing Weights Moments Adding Moments Adding a Level Multiple Levels A Mystery Weight Multiple Unknowns Simultaneous Solving"
- **Level 3, Pool: seven lessons**
  - Source: Practice Scientific Thinking | Brilliant. https://brilliant.org/courses/puzzle-science/
  - Quote: "Level 3 Pool Playing Pool Combination Shots Predetermined Collisions Chain Reactions Momentum Transfer Momentum Components Chains of Prediction"
- **Level 4, Structures: nine lessons, from rigid shapes to beams, joints and screws**
  - Source: Practice Scientific Thinking | Brilliant. https://brilliant.org/courses/puzzle-science/
  - Quote: "Level 4 Structures Structure Components Rigid Shapes Extending Structures Building Structures Degrees of Freedom Equivalent Structures Analyzing Beams Analyzing Joints Analyzing Screws"
- **Level 5, Optics: seven lessons, reflection to refraction and triangular prisms**
  - Source: Practice Scientific Thinking | Brilliant. https://brilliant.org/courses/puzzle-science/
  - Quote: "Level 5 Optics Reflecting Light Adjusting Mirrors Light Bulbs Images Apparent Distance Refraction Triangular Prisms"
- **Level 6, Compound Gears: five lessons, jammed gears to shifting gears**
  - Source: Practice Scientific Thinking | Brilliant. https://brilliant.org/courses/puzzle-science/
  - Quote: "Level 6 Compound Gears Jammed Gears Counting Rotations Rates of Rotation The Fastest Gear Shifting Gears"
- **The course sets out to dispense with number-crunching**
  - Source: Practice Scientific Thinking | Brilliant. https://brilliant.org/courses/puzzle-science/
  - Quote: "Explaining the world means thinking with scientific principles — but usually they're cloaked in technical manipulations. In this course we'll dispense with number-crunching and mathematics in search of something more useful: physical insight."
- **No prerequisites; the learner plays and picks up the rules**
  - Source: Practice Scientific Thinking | Brilliant. https://brilliant.org/courses/puzzle-science/
  - Quote: "There are no prerequisites for this course — in it you'll explore the laws of physics and principles of engineering and learn the rules as you play."
- **Topics Brilliant lists for the course**
  - Source: Practice Scientific Thinking | Brilliant. https://brilliant.org/courses/puzzle-science/
  - Quote: "Balances * Buoyancy * Electric Circuits * Forces * Gears * Heat Flow * Kaleidoscopes * Pulleys * Quantum Superposition * Scientific Thinking"

My reading of the order: Brilliant splits the gear ground in two. Level 1 does one pair (Connecting Gears), speed
change, then a first compound gear and a chain; level 6, after optics, comes back to jammed gears, counting
rotations, rates, the fastest gear and shifting gears. Dan's plan joins the two into lessons 1 and 2. The mobiles
level climbs from balancing to moments to adding a level, multiple levels, a mystery weight, then multiple unknowns
and simultaneous solving: Dan's lesson 3 has the same stair. Optics runs reflecting light, adjusting mirrors, light
bulbs, images, apparent distance, refraction, triangular prisms: Dan's lessons 6 and 7. The page gives titles only,
so the pictures and puzzles inside each lesson are **UNCONFIRMED** (I did not see a lesson).

### 1.2 Physics of the Everyday (the "same ground with numbers" course)
Address: `brilliant.org/courses/physics-of-the-everyday`. The old address `brilliant.org/courses/physics-everyday/`
now shows **Circuits**, so a link to the old one lands on the wrong course. The levels are Level 1 (5 lessons: Toilets,
Water Towers, Refrigerators, Helicopter Toy, Water Contamination), Level 2 (9), Level 3 (6, energy and nuclear),
Level 4 (6, weather) and Level 5 (7, ending on bridges and skyscrapers): 5 + 9 + 6 + 6 + 7 = 33.

- **Physics of the Everyday: 33 lessons, 208 exercises**
  - Source: Practice Physics of the Everyday | Brilliant. https://brilliant.org/courses/physics-of-the-everyday
  - Quote: "Investigate everyday physics, from household objects to weather patterns. 33 Lessons 208 Exercises"
- **Level 2 is sport and motion: axe throwing to baseball**
  - Source: Practice Physics of the Everyday | Brilliant. https://brilliant.org/courses/physics-of-the-everyday
  - Quote: "Level 2 Axe Throwing BMX Motocross Tug of War Skiing Gymnastics: Spinning Gymnastics: Flipping Baseball: Hitting & Catching Baseball: Throwing & Running"
- **Level 5 ends on bridges and skyscrapers: beam and truss bridges are the only structures lessons**
  - Source: Practice Physics of the Everyday | Brilliant. https://brilliant.org/courses/physics-of-the-everyday
  - Quote: "Level 5 Fluoridated Water Airplanes Traffic Beam and Truss Bridges Arch and Suspension Bridges Skyscrapers Queen of the Monsters"
- **Its description: forces, energy and estimation**
  - Source: Practice Physics of the Everyday | Brilliant. https://brilliant.org/courses/physics-of-the-everyday
  - Quote: "Discover physics in unexpected places: from refrigerators and toilets, to traffic jams and water towers. By the end of this course, you'll use powerful ideas like forces, energy, and estimation to catch criminals, design bridges, and throw axes through the lens of a physicist."
- **Topics covered include momentum, torque and rotational dynamics**
  - Source: Practice Physics of the Everyday | Brilliant. https://brilliant.org/courses/physics-of-the-everyday
  - Quote: "Estimation * Forces * Heat * Kinematics * Kinetic Energy * Momentum * Nuclear Physics * Potential Energy * Pressure * Rotational Dynamics * Torque * Weather"
- **It expects a nodding familiarity with heat, energy and force**
  - Source: Practice Physics of the Everyday | Brilliant. https://brilliant.org/courses/physics-of-the-everyday
  - Quote: "A nodding familiarity with basic concepts like heat, energy, and force will help."

My reading: it covers the same physics (torque, momentum, forces) as sport and household objects rather than as
puzzles in the dark, and lists "Estimation". Whether its lessons use numbers is **UNCONFIRMED**; the page lists titles
and topics only. It has no gear, mobile or optics level, only beam and truss bridges as structures.

### 1.3 Classical Mechanics
Address: `brilliant.org/courses/dynamics-bootcamp`. 48 lessons in 10 levels: 3, 4, 7, 7, 5, 4, 6, 5, 5, 2.

- **Classical Mechanics: 48 lessons, 411 exercises**
  - Source: Practice Classical Mechanics | Brilliant. https://brilliant.org/courses/dynamics-bootcamp
  - Quote: "Use core principles of physics to understand matter in motion—from drones to fireflies. 48 Lessons 411 Exercises"
- **Level 5 is momentum: impulse, the rocket equation**
  - Source: Practice Classical Mechanics | Brilliant. https://brilliant.org/courses/dynamics-bootcamp
  - Quote: "Level 5 Momentum in the Office Impulse-Momentum Theorem Rocket Equation Ideal Gas Law Photon Problem"
- **Level 7 is statics, with towers, ropes, bodies and planks**
  - Source: Practice Classical Mechanics | Brilliant. https://brilliant.org/courses/dynamics-bootcamp
  - Quote: "Level 7 Tower of Cards Irregular Towers Static Equilibrium Rope Statics Body Statics Plank Statics"
- **It asks for mathematics and physics first and points to Physics of the Everyday**
  - Source: Practice Classical Mechanics | Brilliant. https://brilliant.org/courses/dynamics-bootcamp
  - Quote: "You’ll need an understanding of mathematics and fundamental physics. We recommend starting your physics journey with Physics of the Everyday."

My reading: statics (level 7) and momentum (level 5) are the two places Dan's lessons 3 to 5 touch it. It is
calculus-level and assumes the learner has Physics of the Everyday first, which is the "same ground with numbers"
the request meant. Gears and optics do not appear in its lesson titles.

### 1.4 Courses next to it
Circuits is a separate 31-lesson Brilliant course and Science Puzzles a separate 59-lesson set; both appear in
Dan's Science folder after this course (Circuits, Science puzzles), so their ground is deferred.

- **Brilliant Circuits is a separate course of 31 lessons**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits
  - Quote: "Explore the physics behind electricity. 31 Lessons 394 Exercises"
- **Its first level is current loops and short circuits**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits
  - Quote: "Level 1 Circuits Current Loops Short Circuits Choosing Bulbs Splitting Current"
- **Its description: current, voltage, resistance and power**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits
  - Quote: "Build an intuitive understanding of how electric circuits work, and the underlying concepts of current, voltage, resistance and power."
- **Brilliant Science Puzzles is a month of daily puzzles, 59 lessons**
  - Source: Practice Science Puzzles | Brilliant. https://brilliant.org/courses/science-puzzles-long-set/
  - Quote: "Science puzzles focused on foundational mechanics, chemistry, and biology. Do one puzzle a day for a month! 59 Lessons 236 Exercises"
- **Its topics reuse mobiles, pulleys and gears**
  - Source: Practice Science Puzzles | Brilliant. https://brilliant.org/courses/science-puzzles-long-set/
  - Quote: "A one-month puzzle-a-day challenge! Topics include: heat flow, light ray tracing, balancing mobiles, pulleys, electrical circuits, gear mechanisms"

My reading: Science Puzzles' topic list (light ray tracing, balancing mobiles, pulleys, electrical circuits, gear
mechanisms) is Scientific Thinking's ground again as one-a-day puzzles, which fits the folder: Scientific thinking
teaches it, Science puzzles (later) tests it.

Brilliant's older course catalogue grouped Scientific Thinking with Waves and Light and Physics of the Everyday under
one "Scientific Thinking" heading, and put Classical Mechanics under "Classical Physics". I saw that in a Wayback
Machine copy of the 2021 page; the checker does not accept archive copies as sources, so I give it as a reading only
(**UNCONFIRMED**, not quoted). Brilliant's current catalogue page names no path for these courses.

### 1.5 Pages move
- **Brilliant is renaming courses, levels and lessons as topics, units and concepts**
  - Source: What is XP on Brilliant? | Brilliant. https://brilliant.org/help/features/what-is-xp
  - Quote: "We're updating names across Brilliant: courses are now topics, levels are units, and lessons are concepts."
- **Brilliant lists Science as "See the science in the world around you"**
  - Source: Topics | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "Science See the science in the world around you"

My reading: expect "course", "level" and "lesson" to read "topic", "unit" and "concept" on Brilliant before long. The
course names and counts above were read on 2 Nov 2026.

---

## 2. Other courses' order for the same ground

### 2.1 AQA GCSE Physics (8463) and Combined Science (8464)
AQA 4.5 Forces holds 4.5.1 forces and their interactions to 4.5.7 momentum; moments, levers and gears is 4.5.4,
momentum is 4.5.7, and reflection and refraction sit in 4.6 Waves. The labels matter for Dan:
"physics only" means it is not in Combined Science, and "HT only" means Higher Tier.

- **AQA GCSE Physics 8463 sections, in order**
  - Source: GCSE Physics 8463 | Specification | Subject Content | Waves | AQA. https://www.aqa.org.uk/subjects/physics/gcse/physics-8463/specification/subject-content/waves
  - Quote: "4.1 Energy 4.2 Electricity 4.3 Particle model of matter 4.4 Atomic structure 4.5 Forces 4.6 Waves 4.7 Magnetism and electromagnetism 4.8 Space physics (physics only) 4.9 Key ideas"
- **AQA puts moments, levers and gears in 4.5.4, for the physics-only paper**
  - Source: GCSE Physics 8463 | Specification | Subject Content | Forces | AQA. https://www.aqa.org.uk/subjects/physics/gcse/physics-8463/specification/subject-content/forces
  - Quote: "4.5.4 Moments, levers and gears (physics only)"
- **AQA balance rule**
  - Source: GCSE Physics 8463 | Specification | Subject Content | Forces | AQA. https://www.aqa.org.uk/subjects/physics/gcse/physics-8463/specification/subject-content/forces
  - Quote: "If an object is balanced, the total clockwise moment about a pivot equals the total anticlockwise moment about that pivot."
- **AQA: calculate a force or a distance on a balanced object**
  - Source: GCSE Physics 8463 | Specification | Subject Content | Forces | AQA. https://www.aqa.org.uk/subjects/physics/gcse/physics-8463/specification/subject-content/forces
  - Quote: "Students should be able to calculate the size of a force, or its distance from a pivot, acting on an object that is balanced."
- **AQA: levers and gears both transmit rotational effects**
  - Source: GCSE Physics 8463 | Specification | Subject Content | Forces | AQA. https://www.aqa.org.uk/subjects/physics/gcse/physics-8463/specification/subject-content/forces
  - Quote: "A simple lever and a simple gear system can both be used to transmit the rotational effects of forces."
- **AQA: explain how levers and gears transmit the rotational effects**
  - Source: GCSE Physics 8463 | Specification | Subject Content | Forces | AQA. https://www.aqa.org.uk/subjects/physics/gcse/physics-8463/specification/subject-content/forces
  - Quote: "Students should be able to explain how levers and gears transmit the rotational effects of forces."
- **AQA momentum is Higher Tier only**
  - Source: GCSE Physics 8463 | Specification | Subject Content | Forces | AQA. https://www.aqa.org.uk/subjects/physics/gcse/physics-8463/specification/subject-content/forces
  - Quote: "4.5.7 Momentum (HT only)"
- **AQA conservation of momentum**
  - Source: GCSE Physics 8463 | Specification | Subject Content | Forces | AQA. https://www.aqa.org.uk/subjects/physics/gcse/physics-8463/specification/subject-content/forces
  - Quote: "In a closed system, the total momentum before an event is equal to the total momentum after the event."
- **AQA: collision calculations are physics only**
  - Source: GCSE Physics 8463 | Specification | Subject Content | Forces | AQA. https://www.aqa.org.uk/subjects/physics/gcse/physics-8463/specification/subject-content/forces
  - Quote: "(physics only) complete calculations involvingan event, such as the collision oftwo objects."
- **AQA: resolving a force into components is Higher Tier only**
  - Source: GCSE Physics 8463 | Specification | Subject Content | Forces | AQA. https://www.aqa.org.uk/subjects/physics/gcse/physics-8463/specification/subject-content/forces
  - Quote: "(HT only) A single force can be resolved into two components acting at right angles to each other. The two component forces together have the same effect as the single force."
- **AQA reflection of waves (physics only): ray diagrams**
  - Source: GCSE Physics 8463 | Specification | Subject Content | Waves | AQA. https://www.aqa.org.uk/subjects/physics/gcse/physics-8463/specification/subject-content/waves
  - Quote: "Students should be able to construct ray diagrams to illustrate the reflection of a wave at a surface."
- **AQA refraction is Higher Tier only and by a change of speed**
  - Source: GCSE Physics 8463 | Specification | Subject Content | Waves | AQA. https://www.aqa.org.uk/subjects/physics/gcse/physics-8463/specification/subject-content/waves
  - Quote: "(HT only) Some effects, for example refraction, are due to the difference in velocity of the waves in different substances."
- **AQA: ray diagrams for refraction at a boundary**
  - Source: GCSE Physics 8463 | Specification | Subject Content | Waves | AQA. https://www.aqa.org.uk/subjects/physics/gcse/physics-8463/specification/subject-content/waves
  - Quote: "Students should be able to construct ray diagrams to illustrate the refraction of a wave at the boundary between two different media."
- **AQA required practical 9 covers reflection and refraction**
  - Source: GCSE Physics 8463 | Specification | Subject Content | Waves | AQA. https://www.aqa.org.uk/subjects/physics/gcse/physics-8463/specification/subject-content/waves
  - Quote: "Required practical activity 9 (physics only): investigate the reflection of light by different types of surface and the refraction of light by different substances."
- **AQA Combined Science: momentum is Higher Tier only**
  - Source: GCSE Science 8464 | Specification | Physics Subject Content | AQA. https://www.aqa.org.uk/subjects/science/gcse/science-8464/specification/physics-subject-content
  - Quote: "5.5 Momentum (HT only) 6.5.5.1 Momentum is a property of moving objects"

My reading, from those lines:
- Moments, levers and gears is physics-only, Foundation and Higher alike, with a balanced-object calculation but no
  gear-ratio calculation in the AQA wording: gears are "explain how", not "calculate".
- Momentum is Higher Tier only, in both Physics and Combined Science; collision calculations are physics only.
- Reflection with ray diagrams is physics-only; refraction by a change of speed is Higher Tier only; AQA's lines say
  nothing of a refractive index or Snell's law in the parts I read. Total internal reflection and the critical angle
  are not in the AQA lines I read (**UNCONFIRMED**: I read the waves content only through the page's excerpts, not the
  whole specification).

### 2.2 BBC Bitesize (AQA guides)
Bitesize builds each topic as short pages in order. The pages for the same ground:

- **Bitesize AQA moments pages in order**
  - Source: Gears - Moments, levers and gears - AQA - GCSE Physics (Single Science) Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/ztjpb82/revision/4
  - Quote: "1. Moments 2. Moments and balanced objects 3. Levers 4. Gears"
- **Bitesize AQA momentum pages in order**
  - Source: Momentum calculations - Momentum - Higher - AQA - GCSE Physics (Single Science) Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zytb8mn/revision/1
  - Quote: "1. Momentum calculations 2. Conservation of momentum 3. Force and momentum"
- **Bitesize AQA reflection and refraction pages in order**
  - Source: Refraction of waves - Reflection and refraction - AQA - GCSE Physics (Single Science) Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zw42ng8/revision/2
  - Quote: "1. Reflection of waves 2. Refraction of waves 3. Required practical"
- **Bitesize KS3 moments page runs from moments to levers to an upward force**
  - Source: Moments - Forces and movement - KS3 Physics - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z96g3j6
  - Quote: "5. Balancing moments 6. Using moments 7. Calculating an upwards force"

My reading: the order is the same as Brilliant's within a topic (moment, balance, lever, gears; calculate, conserve,
force; reflect, refract), but Bitesize teaches gears as one page after levers, and the idler appears in the Design and
Technology pages I read, not in the physics gears page I read, which is why 4.1 below quotes both.

### 2.3 OpenStax College Physics
- **OpenStax College Physics chapters: momentum, statics, then rotation**
  - Source: Index - College Physics 2e | OpenStax. https://openstax.org/apps/rex/portal/channelview-isd-portal/books/college-physics-2e/pages/index
  - Quote: "8 Linear Momentum and Collisions 9 Statics and Torque 10 Rotational Motion and Angular Momentum"
- **OpenStax College Physics: geometric optics comes after electromagnetic waves**
  - Source: Index - College Physics 2e | OpenStax. https://openstax.org/apps/rex/portal/channelview-isd-portal/books/college-physics-2e/pages/index
  - Quote: "24 Electromagnetic Waves 25 Geometric Optics 26 Vision and Optical Instruments"
- **OpenStax chapter 8, Linear Momentum and Collisions: sections 8.1 to 8.7**
  - Source: Ch. 8 Introduction to Linear Momentum and Collisions - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/8-introduction-to-linear-momentum-and-collisions
  - Quote: "8.1 Linear Momentum and Force * 8.2 Impulse * 8.3 Conservation of Momentum * 8.4 Elastic Collisions in One Dimension * 8.5 Inelastic Collisions in One Dimension * 8.6 Collisions of Point Masses in Two Dimensions * 8.7 Introduction to Rocket Propulsion"
- **OpenStax chapter 9, Statics and Torque: sections 9.1 to 9.6**
  - Source: Ch. 9 Introduction to Statics and Torque - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/9-introduction-to-statics-and-torque
  - Quote: "9.1 The First Condition for Equilibrium * 9.2 The Second Condition for Equilibrium * 9.3 Stability * 9.4 Applications of Statics, Including Problem-Solving Strategies * 9.5 Simple Machines * 9.6 Forces and Torques in Muscles and Joints"
- **OpenStax chapter 25, Geometric Optics: sections 25.1 to 25.7**
  - Source: Ch. 25 Introduction to Geometric Optics - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/25-introduction-to-geometric-optics
  - Quote: "25.1 The Ray Aspect of Light * 25.2 The Law of Reflection * 25.3 The Law of Refraction * 25.4 Total Internal Reflection * 25.5 Dispersion: The Rainbow and Prisms * 25.6 Image Formation by Lenses * 25.7 Image Formation by Mirrors"

My reading: OpenStax puts momentum and collisions (chapter 8) before statics and torque (chapter 9), and geometric
optics late (chapter 25: ray aspect, law of reflection, law of refraction, total internal reflection, dispersion, then
lenses and mirrors). So reflection, then refraction, then total internal reflection, then dispersion is the textbook
order for lessons 6 and 7 as well. Gears are not a section of their own; "Simple Machines" is 9.5.

### 2.4 Isaac Science (formerly Isaac Physics)
Isaac Physics is now part of Isaac Science (`isaacscience.org`). It grades each question GCSE or A Level and Practice
or Challenge.

- **Isaac Science gears questions run from one pair to multiple-stage reduction**
  - Source: Levers and Gears – Isaac Science. https://isaacscience.org/concepts/cp_levers_gears
  - Quote: "Bicycle Gears GCSE Practice 2 A Level Practice 1 * Multiple Stage Reduction GCSE Challenge 2 A Level Practice 1 * Properties of Gears GCSE Practice 1 A Level Practice 1 * Spirograph GCSE Challenge 3 A Level Challenge 1 * Tuning a Guitar GCSE Challenge 3 A Level Challenge 1 * Turning Gears GCSE Practice 1"
- **Isaac Science treats levers and gears as moments at work**
  - Source: Levers and Gears – Isaac Science. https://isaacscience.org/concepts/cp_levers_gears
  - Quote: "Levers and gears are mechanical components which transmit rotational motion . They both take advantage of forces and moments."
- **Isaac Science collisions: two types**
  - Source: Collisions – Isaac Science. https://isaacscience.org/concepts/cp_collisions
  - Quote: "There are two types of collisions: 1. Inelastic collisions: momentum is conserved, 2. Elastic collisions: momentum is conserved _and_ kinetic energy is conserved."
- **Isaac Science GCSE refraction lessons: refraction, TIR, refractive index and Snell, critical angles**
  - Source: GCSE Video Revision Lessons – Isaac Science. https://isaacscience.org/pages/remote_revision_gcse
  - Quote: "Concept lesson 42 - Refraction Concept lesson 43 - Total Internal Reflection Concept lesson 46 - Refractive Index & Snell's Law Concept lesson 47 - Calculating Critical Angles"

My reading: Isaac has gear puzzles from one pair to multiple-stage reduction, a collisions concept, and a refraction
set (refraction, TIR, refractive index and Snell, critical angles) at GCSE. I found no mobile or truss puzzle set.
Its GCSE refraction lessons include Snell's law and critical-angle sums, which is more than the exam boards below
expect (3.4).

---

## 3. Dan's January course and the public standards

### 3.1 What GCSE physics asks for
Dan's January course is a one-week Leading Rate marine engineering enabling course that tests maths and physics at
GCSE level in relation to engineering. I found **no public syllabus** for it (**UNCONFIRMED**: the only description is
Dan's own), so the plan is against GCSE physics, and every choice that goes beyond it is a guess. The DfE document I
could read is the June 2013 version of the GCSE science subject content; the gov.uk page for the final 2014 content
(DFE-00352-2014) lists a PDF I could not fetch, so the DfE lines are quoted from the 2013 document and checked
against what the exam boards print from the final text.

- **DfE GCSE content: moments and rotational forces, levers and gears**
  - Source: Department for Education -. https://assets.publishing.service.gov.uk/media/5a7b9491e5274a7202e1817e/GCSE_Sciences_final_updated.pdf
  - Quote: "recognise forces that cause rotation  define the moment of such forces and calculate their values  explain how levers and gears transmit the effects of linear and rotational forces"
- **DfE: forces and conservation of momentum in collisions**
  - Source: Department for Education -. https://assets.publishing.service.gov.uk/media/5a7b9491e5274a7202e1817e/GCSE_Sciences_final_updated.pdf
  - Quote: "recall and apply Newton’s Third Law both to equilibrium situations and to collision interactions and relate it to the conservation of momentum in collisions."
- **DfE: apply equations about conservation in collisions**
  - Source: Department for Education -. https://assets.publishing.service.gov.uk/media/5a7b9491e5274a7202e1817e/GCSE_Sciences_final_updated.pdf
  - Quote: "apply equations about conservation in collisions."
- **DfE: plane mirrors and the apparent position of images**
  - Source: Department for Education -. https://assets.publishing.service.gov.uk/media/5a7b9491e5274a7202e1817e/GCSE_Sciences_final_updated.pdf
  - Quote: "use the ray model to show how light travels and to illustrate specular reflection and the apparent position of images in plane mirrors"
- **DfE: refraction is qualitative only**
  - Source: Department for Education -. https://assets.publishing.service.gov.uk/media/5a7b9491e5274a7202e1817e/GCSE_Sciences_final_updated.pdf
  - Quote: "use the ray model to illustrate refraction and explain the apparent displacement of an image in a refracting substance (qualitative only)"
- **DfE: ray diagrams to find the image in a plane mirror**
  - Source: Department for Education -. https://assets.publishing.service.gov.uk/media/5a7b9491e5274a7202e1817e/GCSE_Sciences_final_updated.pdf
  - Quote: "construct two-dimensional ray diagrams to illustrate specular reflection, to locate the position of an image in a plane mirror"
- **DfE: the equation list to recall includes momentum = mass x velocity**
  - Source: Department for Education -. https://assets.publishing.service.gov.uk/media/5a7b9491e5274a7202e1817e/GCSE_Sciences_final_updated.pdf
  - Quote: "momentum = m x velocity"
- **DfE: the moment equation to recall**
  - Source: Department for Education -. https://assets.publishing.service.gov.uk/media/5a7b9491e5274a7202e1817e/GCSE_Sciences_final_updated.pdf
  - Quote: "moment of a force = force x perpendicular distance from pivot"
- **AQA booklet: the equations to recall, with SI units**
  - Source: GCSE SCIENCE Physics equations and maths skills Booklet 1. https://filestore.aqa.org.uk/resources/science/AQA-GCSE-SCIENCE-BOOKLET1-PHYSICS-EQUATIONS-MATHS-SKILLS.PDF
  - Quote: "In solving quantitative problems, students should be able to recall and apply the following equations, using standard SI units."
- **AQA booklet: moment is on the recall list**
  - Source: GCSE SCIENCE Physics equations and maths skills Booklet 1. https://filestore.aqa.org.uk/resources/science/AQA-GCSE-SCIENCE-BOOKLET1-PHYSICS-EQUATIONS-MATHS-SKILLS.PDF
  - Quote: "moment of a force = force × distance normal to direction of force"
- **AQA booklet: momentum is on the recall list for Higher Tier**
  - Source: GCSE SCIENCE Physics equations and maths skills Booklet 1. https://filestore.aqa.org.uk/resources/science/AQA-GCSE-SCIENCE-BOOKLET1-PHYSICS-EQUATIONS-MATHS-SKILLS.PDF
  - Quote: "HT momentum = mass × velocity"
- **AQA 2026 equation sheet gives the moment equation**
  - Source: AQA-GCSE Science-8463-INS-AI-V2.2. https://www.aqa.org.uk/files/resources.physics.AQA-8463-FS-INS-2025_PDF/6b5358e1159b1b6cc2d622fc5eb894320d6fb763.pdf
  - Quote: "moment of a force = force × distance (normal to direction of force)"
- **Edexcel: recall the moment equation**
  - Source: GCSE Physics. https://qualifications.pearson.com/content/dam/pdf/GCSE/Science/2016/Specification/gcse-physics-spec.pdf
  - Quote: "9.7P Recall and use the equation: moment of a force (newton metre, N m) = force (newton, N) × distance normal to the direction of the force (metre, m)"
- **Edexcel: the principle of moments**
  - Source: GCSE Physics. https://qualifications.pearson.com/content/dam/pdf/GCSE/Science/2016/Specification/gcse-physics-spec.pdf
  - Quote: "9.8P Recall and use the principle of moments in situations where rotational forces are in equilibrium: the sum of clockwise moments = the sum of anti-clockwise moments for rotational forces in equilibrium"
- **Edexcel: explain how levers and gears transmit rotational effects**
  - Source: GCSE Physics. https://qualifications.pearson.com/content/dam/pdf/GCSE/Science/2016/Specification/gcse-physics-spec.pdf
  - Quote: "9.9P Explain how levers and gears transmit the rotational effects of forces"
- **Edexcel: suggested practical on levers and gears**
  - Source: GCSE Physics. https://qualifications.pearson.com/content/dam/pdf/GCSE/Science/2016/Specification/gcse-physics-spec.pdf
  - Quote: "Investigate levers and gears."
- **Edexcel: momentum in collisions**
  - Source: GCSE Physics. https://qualifications.pearson.com/content/dam/pdf/GCSE/Science/2016/Specification/gcse-physics-spec.pdf
  - Quote: "2.25 Describe examples of momentum in collisions"
- **Edexcel physics includes reflection, refraction, total internal reflection, the law of reflection and the critical angle**
  - Source: GCSE Physics. https://qualifications.pearson.com/content/dam/pdf/GCSE/Science/2016/Specification/gcse-physics-spec.pdf
  - Quote: "5.1P Explain, with the aid of ray diagrams, reflection, refraction and total internal reflection (TIR), including the law of reflection and critical angle"
- **Edexcel: refraction ray diagrams are qualitative, equations not needed**
  - Source: GCSE Physics. https://qualifications.pearson.com/content/dam/pdf/GCSE/Science/2016/Specification/gcse-physics-spec.pdf
  - Quote: "Construct two-dimensional ray diagrams to illustrate reflection and refraction (qualitative – equations not needed)"
- **Edexcel June 2025 equation list: moment is among the extra Physics equations**
  - Source: GCSE Physics Combined Science - Equations list. https://qualifications.pearson.com/content/dam/pdf/GCSE/Science/2016/teaching-and-learning-materials/gcse-physics-exam-aid-1ph0-1sc0-june-2025.pdf
  - Quote: "moment of a force = force × distance normal to the direction of the force"
- **CCEA: moments with no more than two forces**
  - Source: Physics. https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Physics%20%282017%29/GCSE%20Physics%20%282017%29-specification-Standard_0.pdf
  - Quote: "use the Principle of Moments to calculate the size of a force, or its distance from the pivot, when an object is balanced under the turning effects of no more than two forces, one of which"
- **WJEC: principle of moments limited to a pivot and parallel forces**
  - Source: WJEC GCSE Physics. https://www.wjec.co.uk/media/5hxbdcwn/wjec-gcse-physics-spec-from-2016.pdf
  - Quote: "the Principle of Moments, limited to situations involving a pivot and parallel forces, e.g. a balanced metre rule"
- **CCEA eGuide: use the principle of moments to find the weight of an object**
  - Source: GCSE Physics Unit 1: Higher Tier Motion, Force, Moments, Density and Kinetic Theory, Energy and Atomic and Nuclear Physics. https://ccea.org.uk/downloads/docs/Support/eGuide/2025/GCSE%20Physics%20Unit%201:%20Higher%20Tier%20eGuide.pdf
  - Quote: "use the Principle of Moments to carry out a practical task to find the weight of an object;"

My reading, from those lines:
- The moment equation is on every board's recall or sheet list, with the distance "normal" (perpendicular) to the
  force. The principle of moments is set for a balanced object, mostly one or two forces; WJEC and CCEA say so.
- Momentum = mass x velocity is Higher Tier on AQA's list and on Edexcel's; conservation in collisions is on the DfE
  list. Elastic against inelastic, glancing hits and momentum components are not in any line I read.
- Gears: the boards say "explain how levers and gears transmit" (AQA, Edexcel, DfE). None says "calculate a gear ratio" in
  the lines I read. Bitesize's AQA physics page works a moment through two gears, and its Design and Technology page
  teaches gear ratio by teeth (4.1). **UNCONFIRMED** whether January asks for a gear ratio.
- Optics: the ray model, law of reflection and the image in a plane mirror are DfE content. Edexcel adds reflection,
  refraction, TIR, critical angle in words.

### 3.2 The Navy's own pages
- **Royal Navy: the aptitude test covers electrical and mechanical comprehension**
  - Source: Engineering Technician (Weapon Submariner) | Royal Navy Jobs. https://www.royalnavy.mod.uk/careers/roles/engineering-technician-weapon-submariner
  - Quote: "You’ll be tested on: Verbal Reasoning, Numerical Reasoning, Work Rate, Spatial Reasoning, Electrical Comprehension and Mechanical Comprehension."
- **Royal Navy: first promotion Leading Hand, second Petty Officer**
  - Source: Engineering Technician (Marine Submariner) | Royal Navy Jobs. https://www.royalnavy.mod.uk/careers/roles/engineering-technician-marine-submariner
  - Quote: "First promotion – Leading Hand Further training, more responsibility, lead junior ratings Second promotion – Petty Officer Become a manager, take responsibility for defect diagnosis"
- **Royal Navy accelerated apprenticeship: GCSE maths, English and a science at grade 4**
  - Source: The Royal Navy - Marine Engineering - Accelerated Apprenticeship – Find an apprenticeship – GOV.UK. https://www.findapprenticeship.service.gov.uk/apprenticeship/VAC2000041740
  - Quote: "GCSE in: Math and English and at least one science (grade GCSE Level C/4)"

My reading: entry is GCSE maths, English and a science at grade 4. The Defence Aptitude Assessment lists "Mechanical
Comprehension" as one of its sections; the page does not say what is in that section (**UNCONFIRMED**). Neither page says
anything about what the Leading Rate course contains.

### 3.3 The apprenticeship standards
The standards that cover Royal Navy marine engineering technicians are the Level 2 Maritime mechanical and electrical
mechanic (ST0276) and the Level 3 Maritime mechanical fitter (the 2015 standard, which now sits as option 6 of the
Engineering technician standard ST0457, and its draft replacement ST1402). Dan's own path is electrical, so the Maritime electrical fitter
option is quoted too.

- **Maritime mechanical fitter (L3, 2015): the role on ships and submarines**
  - Source: Apprenticeship Standard for: Maritime Mechanical Fitter. https://assets.publishing.service.gov.uk/media/5a807fd5e5274a2e8ab507ed/MARITIME_DEFENCE-_Maritime_Mechanical_Fitter.pdf
  - Quote: "The Mechanical Fitter role involves working from engineering drawings, data and documentation in order to undertake the manufacture, installation, testing, commissioning, fault diagnosis, maintenance, overhaul and removal of mechanical and fluid power equipment on ships and submarines involved in defence and commercial shipping."
- **Maritime mechanical fitter: mathematical techniques, formula and calculation**
  - Source: Apprenticeship Standard for: Maritime Mechanical Fitter. https://assets.publishing.service.gov.uk/media/5a807fd5e5274a2e8ab507ed/MARITIME_DEFENCE-_Maritime_Mechanical_Fitter.pdf
  - Quote: "An understanding of mathematical techniques, formula and calculation applied."
- **Maritime mechanical fitter: maritime engineering technology and principles**
  - Source: Apprenticeship Standard for: Maritime Mechanical Fitter. https://assets.publishing.service.gov.uk/media/5a807fd5e5274a2e8ab507ed/MARITIME_DEFENCE-_Maritime_Mechanical_Fitter.pdf
  - Quote: "An understanding of maritime engineering technology and principles applied in the design, build, operation and maintenance of Maritime vessels."
- **Maritime mechanical fitter: material and fluid properties**
  - Source: Apprenticeship Standard for: Maritime Mechanical Fitter. https://assets.publishing.service.gov.uk/media/5a807fd5e5274a2e8ab507ed/MARITIME_DEFENCE-_Maritime_Mechanical_Fitter.pdf
  - Quote: "Knowledge of material and fluid properties used in the mechanical area of the Maritime Industry."
- **Maritime mechanical fitter: Level 3 including mathematics at Level 3**
  - Source: Apprenticeship Standard for: Maritime Mechanical Fitter. https://assets.publishing.service.gov.uk/media/5a807fd5e5274a2e8ab507ed/MARITIME_DEFENCE-_Maritime_Mechanical_Fitter.pdf
  - Quote: "This Apprenticeship Standard is at Level 3, including mathematics at Level 3"
- **Maritime mechanical fitter: typical entry includes GCSE maths and a science**
  - Source: Apprenticeship Standard for: Maritime Mechanical Fitter. https://assets.publishing.service.gov.uk/media/5a807fd5e5274a2e8ab507ed/MARITIME_DEFENCE-_Maritime_Mechanical_Fitter.pdf
  - Quote: "candidates will typically have 4 GCSEs at Grade C or equivalent, including Mathematics, English and a Science."
- **Maritime mechanical and electrical mechanic (L2): the job on ships and submarines**
  - Source: Maritime mechanical and electrical mechanic / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0276-v1-1
  - Quote: "undertake the testing, fault diagnosis and maintenance of electrical, mechanical and fluid power equipment on ships and submarines."
- **Mechanic standard: mathematical techniques, formula and calculation**
  - Source: Maritime mechanical and electrical mechanic / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0276-v1-1
  - Quote: "Mathematical techniques, formula and calculation appropriate to their role."
- **Mechanic standard: electrical, mechanical, pneumatic and fluid power principles**
  - Source: Maritime mechanical and electrical mechanic / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0276-v1-1
  - Quote: "Electrical, mechanical, pneumatic and fluid power engineering technology and principles."
- **Mechanic standard: confined spaces**
  - Source: Maritime mechanical and electrical mechanic / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0276-v1-1
  - Quote: "Comply with correct entry procedures and precautions for confined spaces."
- **Engineering technician standard: mathematical and scientific principles**
  - Source: Engineering technician / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0457-v1-4
  - Quote: "understanding of general engineering/manufacturing mathematical and scientific principles, methods, techniques, graphical expressions, symbols formulae and calculations used by engineering"
- **Draft Level 3 fitter standard: typical entry with GCSE maths and a science**
  - Source: Standard in development L3: Maritime mechanical fitter. https://skillsengland.education.gov.uk/media/41ujrwli/st1402-maritime-mechanical-fitter-l3-standard.pdf
  - Quote: "Candidates will typically have 4 GCSEs at grade C or grade 4 or equivalent, including mathematics, English and a science."
- **Draft Level 3 fitter standard: engineering, mathematical and scientific principles in a maritime mechanical fitting environment**
  - Source: Standard in development L3: Maritime mechanical fitter. https://skillsengland.education.gov.uk/media/41ujrwli/st1402-maritime-mechanical-fitter-l3-standard.pdf
  - Quote: "K2 : Engineering, mathematical and scientific principles, methods, techniques, graphical expressions, symbols, formulae and calculations used in a maritime mechanical fitting environment."
- **Draft Level 3 fitter standard: materials and fluid properties**
  - Source: Standard in development L3: Maritime mechanical fitter. https://skillsengland.education.gov.uk/media/41ujrwli/st1402-maritime-mechanical-fitter-l3-standard.pdf
  - Quote: "K3 : The structure, properties and characteristics of common materials and fluid properties used in the maritime sector."
- **Engineering technician standard, maritime mechanical fitter option: specific mathematical techniques**
  - Source: Engineering technician / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0457-v1-4
  - Quote: "understand the specific mathematical techniques, formula and calculation applied in a maritime mechanical fitting environment"
- **Engineering technician standard, maritime electrical fitter option: mathematics in a maritime electrical and electronic environment**
  - Source: Engineering technician / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0457-v1-4
  - Quote: "understand the specific mathematical techniques, formula and calculation in a maritime electrical/electronic environment"
- **Engineering technician standard, maritime electrical fitter option: technology and principles of maritime vessels**
  - Source: Engineering technician / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0457-v1-4
  - Quote: "understand maritime electrical/electronic engineering technology and principles in the design, equipment build, operation and maintenance of maritime vessels."

My reading: no line names moments, gear trains, momentum, structures or optics. The closest lines are
"mathematical techniques, formula and calculation", "mechanical ... principles", and (draft ST1402) "engineering,
mathematical and scientific principles ... used in a maritime mechanical fitting environment". The 2015 fitter
standard puts the work "on ships and submarines" and sets Level 3 "including mathematics at Level 3". So a course on
these foundations answers the standards' general lines; none of them proves a particular lesson is needed.

### 3.4 How far past GCSE are Snell's law and trigonometry on light?
- **CCEA: knowledge of Snell's law is not expected at GCSE**
  - Source: Physics. https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Physics%20%282017%29/GCSE%20Physics%20%282017%29-specification-Standard_0.pdf
  - Quote: "2.2.6 relate the amount of refraction to the change of speed, so that the greater the refraction, the larger the change of speed of the light (a knowledge of Snell’s law is not expected);"
- **CCEA: a prism disperses white light; red is slowed least, violet most**
  - Source: Physics. https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Physics%20%282017%29/GCSE%20Physics%20%282017%29-specification-Standard_0.pdf
  - Quote: "since red is refracted the least, it is slowed the least, and violet is refracted the most because it has been slowed the most;"
- **CCEA: total internal reflection related to the critical angle**
  - Source: Physics. https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Physics%20%282017%29/GCSE%20Physics%20%282017%29-specification-Standard_0.pdf
  - Quote: "They study how a prism disperses white light and also investigate total internal reflection of light and relate it to the idea of a critical angle."
- **CCEA: moment problems only with force and distance at right angles**
  - Source: Physics. https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Physics%20%282017%29/GCSE%20Physics%20%282017%29-specification-Standard_0.pdf
  - Quote: "(problems will only be set in which the force and distance are perpendicular to each other)."

My reading: two boards are explicit. CCEA says "a knowledge of Snell's law is not expected", and Edexcel says
refraction ray diagrams are "qualitative - equations not needed". Isaac Science teaches Snell's law at GCSE anyway.
So lesson 7's Snell's law with trigonometry is above the January level; Dan's Trigonometry course gives him the
means, and the lesson should say it is beyond GCSE. The refractive index n = c/v and the critical angle in words are
inside Edexcel and CCEA. This is a choice, not a requirement.

---

## 4. The scope, lesson by lesson

### 4.1 Lesson 1, Gears
Dan has the gear rule and the idler from Mechanics and materials lesson 7 (its brief), so this lesson is puzzles.
- **Bitesize: meshed gears turn opposite ways**
  - Source: Gears - Moments, levers and gears - AQA - GCSE Physics (Single Science) Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/ztjpb82/revision/4
  - Quote: "Where the gears meet, the teeth must both move in the same direction. In the diagram, the teeth of both gears move upwards. This means that the gears rotate in opposite directions."
- **Bitesize: a larger driven gear turns slower with more moment**
  - Source: Gears - Moments, levers and gears - AQA - GCSE Physics (Single Science) Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/ztjpb82/revision/4
  - Quote: "If the driven gear is made larger is will rotate more slowly but with a greater moment."
- **Bitesize: double the radius, double the turning effect**
  - Source: Gears - Moments, levers and gears - AQA - GCSE Physics (Single Science) Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/ztjpb82/revision/4
  - Quote: "Turning a gear that has double the radius doubles the turning effect - it is a 2× force multiplier."
- **Bitesize D and T: a simple train turns the driven gear the opposite way**
  - Source: Gear trains - Mechanical devices - AQA - GCSE Design and Technology Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zbt26yc/revision/5
  - Quote: "In a simple gear train, the drive gear causes the driven gear to turn in the opposite direction."
- **Bitesize D and T: gear ratio from teeth**
  - Source: Gear trains - Mechanical devices - AQA - GCSE Design and Technology Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zbt26yc/revision/5
  - Quote: "Gear ratio = number of teeth on driven gear ÷ number of teeth on the drive gear"
- **Bitesize D and T: an idler makes them turn the same way**
  - Source: Gear trains - Mechanical devices - AQA - GCSE Design and Technology Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zbt26yc/revision/5
  - Quote: "If the drive gear and the driven gear are separated by another gear, called the idler , they will move in the same direction."
- **Bitesize 2025: an idler does not change the ratio**
  - Source: 2.23 transmission of motion using gears - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zqgdywx
  - Quote: "The idler gear does not change the overall gear ratio between the driver and driven gears."
- **Tooth count: teeth passing the mesh are equal on both gears**
  - Source: Basic Fundamentals of Gear Drives. https://www.cedengineering.ca/userfiles/M06-031%20-%20Basic%20Fundamentals%20of%20Gear%20Drives.pdf
  - Quote: "If you turn a gear with 6 teeth 3 times and is meshed with a second gear having 18 teeth, than the driving gear 18 teeth (6 x 3) will move through the meshed area. This means that the 18 teeth from the second gear also move through the meshed area."
- **Teeth times speed is the same on both meshed gears (N1 Z1 = N2 Z2)**
  - Source: Basic Fundamentals of Gear Drives. https://www.cedengineering.ca/userfiles/M06-031%20-%20Basic%20Fundamentals%20of%20Gear%20Drives.pdf
  - Quote: "When gear 1 and gear 2 are in mesh: N1 * Z1 = N2 * Z2"
- **Intermediate gears do not change the overall ratio**
  - Source: Basic Fundamentals of Gear Drives. https://www.cedengineering.ca/userfiles/M06-031%20-%20Basic%20Fundamentals%20of%20Gear%20Drives.pdf
  - Quote: "The number of teeth on the intermediate gears does not affect the overall velocity ratio, which is governed purely by the number of teeth on the first and last gear."
- **Odd or even number of gears decides the direction**
  - Source: Basic Fundamentals of Gear Drives. https://www.cedengineering.ca/userfiles/M06-031%20-%20Basic%20Fundamentals%20of%20Gear%20Drives.pdf
  - Quote: "If the train contains an odd number of gears, the output gear will rotate in the same direction as the input gear, but if the train contains an even number of gears, the output gear will rotate opposite that of the input gear."
- **Idlers: only the first and last gear set the reduction**
  - Source: Advanced Gears | REV DUO Build System. https://docs.revrobotics.com/duo-build/motion/gears/gears-advanced (vendor documentation (robot kit))
  - Quote: "Regardless of the number or size of idler gears in the chain, only the first and last gear determine the reduction."
- **An odd closed loop of gears will not turn**
  - Source: https://www.dsimanek.vialattea.net/gearprob.htm. https://www.dsimanek.vialattea.net/gearprob.htm
  - Quote: "An odd number of gears in a closed loop in a plane will not turn no matter what their size and tooth count."
- **An even closed loop turns smoothly: the contact points move in opposite directions**
  - Source: https://www.dsimanek.vialattea.net/gearprob.htm. https://www.dsimanek.vialattea.net/gearprob.htm
  - Quote: "If you closed a loop of an even number of gears, they would all turn quite smoothly through the same arc."
- **Isaac Science: a 1:3 pair multiplies torque by 3**
  - Source: Levers and Gears – Isaac Science. https://isaacscience.org/concepts/cp_levers_gears
  - Quote: "So for a gear ratio of 1 : 3 , where A is driving and B is driven, the torque is multiplied by 3"
- **Isaac Science: adjacent gears change speed and torque together**
  - Source: Levers and Gears – Isaac Science. https://isaacscience.org/concepts/cp_levers_gears
  - Quote: "Along with changing the rotational speed, adjacent gears also change the torque, depending on the gear ratio."
- **Isaac Science: meshed gears rotate in opposite directions**
  - Source: Levers and Gears – Isaac Science. https://isaacscience.org/concepts/cp_levers_gears
  - Quote: "Note that B rotates in the opposite direction to A"
- **With teeth, speed times teeth is conserved between two meshed gears**
  - Source: Basic Fundamentals of Gear Drives. https://www.cedengineering.ca/userfiles/M06-031%20-%20Basic%20Fundamentals%20of%20Gear%20Drives.pdf
  - Quote: "product of speed (revolutions) and teeth must be conserved"
- **External gears reverse the direction; an internal gear with an external gear keeps it**
  - Source: Basic Fundamentals of Gear Drives. https://www.cedengineering.ca/userfiles/M06-031%20-%20Basic%20Fundamentals%20of%20Gear%20Drives.pdf
  - Quote: "In the meshing of two external gears, rotation goes in the opposite direction. In the meshing of an internal gear with an external gear the rotation goes in the same direction."

My reading: the rule "teeth times turns is the same on both gears" is the cleanest way in, and it gives "bigger gear,
slower, more moment" with no formula. The idler (direction only) and the closed loop with an odd number of gears
(locks) are the two surprises. The odd loop is stated on the "gear rotation questions" page quoted above, and Schwartz and
Black's study (6.4) records students reasoning "they jam each other". The "even loop turns" case is on the same page.

### 4.2 Lesson 2, Compound gear trains
- **Compound train: the driven gear of one pair shares a shaft with the driver of the next**
  - Source: Mechanisms: Gears. https://www.notesandsketches.co.uk/Gears.html
  - Quote: "Compound gear trains consist of two or more pairs of meshed gears, with the driven gear of one pair of gears being on the same shaft as the driver gear of the next pair of gears."
- **Two gears on one shaft turn at the same speed**
  - Source: Mechanisms: Gears. https://www.notesandsketches.co.uk/Gears.html
  - Quote: "As both gears are keyed onto shaft B, they must revolve at the same velocity."
- **Compound reduction: multiply each stage's reduction**
  - Source: Advanced Gears | REV ION Build System | REV Robotics Documentation. https://docs.revrobotics.com/ion-build/motion/gears/advanced-gears (vendor documentation (robot kit))
  - Quote: "To calculate the total reduction of a compound reduction, identify the reduction of each stage and then multiply each reduction together."
- **Compound gearing by a shared shaft**
  - Source: Advanced Gears | REV ION Build System | REV Robotics Documentation. https://docs.revrobotics.com/ion-build/motion/gears/advanced-gears (vendor documentation (robot kit))
  - Quote: "There are multiple gear pairs in a compound reduction with each pair of gears linked by a shared shaft."
- **Bitesize 2025: overall ratio is the product of the stage ratios**
  - Source: 2.23 transmission of motion using gears - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zqgdywx
  - Quote: "Compound gear train : uses multiple gear pairs to achieve a higher gear ratio. Each pair of gears in a compound train can have its own gear ratio, and the overall gear ratio of the train is the product of the individual gear ratios."
- **One pair is limited to about 10 to 1, so compound two gears on one shaft**
  - Source: Gears. https://www.me.iitb.ac.in/~ramesh/courses/ME423/Gears.pdf
  - Quote: "A practical limit on train value for one pair of gears is 10 to 1 # • To obtain more, compound two gears onto the same shaft"
- **Speed and torque trade, power unchanged**
  - Source: Advanced Gears | REV DUO Build System. https://docs.revrobotics.com/duo-build/motion/gears/gears-advanced (vendor documentation (robot kit))
  - Quote: "Selecting the gears in the gear train as larger or smaller relative to the input gear can either increase the output speed or increase the output torque, but the total power is not affected."
- **Torque up means speed down, and the other way**
  - Source: CORC 3303 – Exploring Robotics Joel Kammet Supplemental notes on gear ratios, torque and speed Vocabulary SI (Système International d'Unités). https://www.sci.brooklyn.cuny.edu/~kammet/gear_notes.pdf
  - Quote: "if as a result of the gear arrangement the torque increases, the rotational speed decreases. And if the torque decreases, the rotational speed increases."
- **A lever has the same trade: less force, more distance, same work**
  - Source: 20.03 -- Lever arm. https://web.physics.ucsb.edu/~lecturedemonstrations/Composer/Pages/20.03.html
  - Quote: "but the work you do to lift it a given distance is the same as it would be without the lever."
- **Isaac Science: gears multiply the input moment at the output**
  - Source: Levers and Gears – Isaac Science. https://isaacscience.org/concepts/cp_levers_gears
  - Quote: "Gears are capable of taking an input moment (or torque ) and multiplying it at the output."
- **Compound train, worked in stages: the product of the two stage ratios**
  - Source: Basic Fundamentals of Gear Drives. https://www.cedengineering.ca/userfiles/M06-031%20-%20Basic%20Fundamentals%20of%20Gear%20Drives.pdf
  - Quote: "Note that the resultant gear ratio is just the product of the two separate gear ratios: (Z1/Z2)*(Z3/Z4)."
- **Each stage of a compound train reverses direction**
  - Source: Basic Fundamentals of Gear Drives. https://www.cedengineering.ca/userfiles/M06-031%20-%20Basic%20Fundamentals%20of%20Gear%20Drives.pdf
  - Quote: "Each chain reverses the direction of rotation so if A is clockwise, B and C rotate anti- clockwise, so D and E rotate clockwise."
- **Notes and Sketches: a 3:1 then 3:1 pair makes 9:1 overall**
  - Source: Mechanisms: Gears. https://www.notesandsketches.co.uk/Gears.html
  - Quote: "Therefore the ratio between the input and output is 9:1 (600 ÷ 66.66 recurring = 9)."

My reading: the stage ratios multiply, two gears on a shaft turn as one, the fastest gear is the last of a
speeding-up chain, and one pair is limited to roughly 10:1, which is why a compound stage exists. Speed and torque
trade, with power the same (minus losses): the REV page and the lever page say the same thing from different sides.

### 4.3 Lesson 3, Balancing mobiles
- **Bitesize: balanced means clockwise equals anticlockwise**
  - Source: Moments and balanced objects - Moments, levers and gears - AQA - GCSE Physics (Single Science) Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/ztjpb82/revision/2
  - Quote: "If an object is balanced, the total clockwise moment about a pivot is equal to the total anticlockwise moment about that pivot."
- **Bitesize see-saw example: find the distance from a known force and moment**
  - Source: Moments and balanced objects - Moments, levers and gears - AQA - GCSE Physics (Single Science) Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/ztjpb82/revision/2
  - Quote: "A parent and child are at opposite ends of a playground see-saw. The parent weighs 750 N and the child weighs 250 N. The child sits 2.4 m from the pivot. Calculate the distance the parent must sit from the pivot for the see-saw to be balanced."
- **The distance is the perpendicular one, from the pivot**
  - Source: Moments - Forces and movement - KS3 Physics - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z96g3j6
  - Quote: "It is very important to remember that the distance from the pivot is measured at a right angle, or perpendicular , to the line of action of the force."
- **Any pivot can be chosen, and a force through the pivot has no moment**
  - Source: 9.2 The Second Condition for Equilibrium - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/9-2-the-second-condition-for-equilibrium
  - Quote: "The point can be the physical pivot point of a system or any other point in space—but it must be the same point for all torques."
- **A force acting on the pivot cannot cause a rotation**
  - Source: 9.2 The Second Condition for Equilibrium - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/9-2-the-second-condition-for-equilibrium
  - Quote: "A force acting on the pivot cannot cause a rotation, just as pushing directly on the hinges of a door will not cause it to rotate."
- **A 4:1 lever: the moment arms are 40 cm and 10 cm, so the effort is a quarter of the load**
  - Source: 20.03 -- Lever arm. https://web.physics.ucsb.edu/~lecturedemonstrations/Composer/Pages/20.03.html
  - Quote: "the ratio of their moment arms is 40 cm/10 cm, which gives a mechanical advantage of 4:1, so, as noted above, the effort must be 1/4 the load to balance."
- **Isaac Science: balanced lever, moments equal, mechanical advantage**
  - Source: Levers and Gears – Isaac Science. https://isaacscience.org/concepts/cp_levers_gears
  - Quote: "If the system is balanced, then we know that the moments, clockwise and anticlockwise, must be equal."

My reading: the distance is the perpendicular distance from the pivot; any point may be taken as the pivot, and
choosing the one a force passes through removes it. A "mystery weight" is the CCEA task "use the Principle of Moments
to find the weight of an object" and the "two unknowns" step is two moment equations solved together (Linear systems,
which Dan has). Levels hung from levels is the same equation applied twice, one level's total weight acting at its
hook.

### 4.4 Lesson 4, Collisions (pool)
- **Bitesize: momentum before equals momentum after in a closed system**
  - Source: Conservation of momentum - Momentum - Higher - AQA - GCSE Physics (Single Science) Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zytb8mn/revision/2
  - Quote: "In a closed system: total momentum before an event = total momentum after the event"
- **Bitesize: a closed system has no external forces**
  - Source: Conservation of momentum - Momentum - Higher - AQA - GCSE Physics (Single Science) Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zytb8mn/revision/2
  - Quote: "A ‘closed system’ is something that is not affected by external forces."
- **Bitesize: conserved in collisions and explosions**
  - Source: Conservation of momentum - Momentum - Higher - AQA - GCSE Physics (Single Science) Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zytb8mn/revision/2
  - Quote: "Momentum is conserved in collisions and explosions"
- **Bitesize: the cannon recoil example**
  - Source: Conservation of momentum - Momentum - Higher - AQA - GCSE Physics (Single Science) Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zytb8mn/revision/2
  - Quote: "A cannon ball of mass 4.0 kg is fired from a stationary 96 kg cannon at 120 m/s. Calculate the velocity of the cannon immediately after firing."
- **Bitesize: momentum is a vector, direction matters**
  - Source: Conservation of momentum - Momentum - Higher - AQA - GCSE Physics (Single Science) Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zytb8mn/revision/2
  - Quote: "Momentum is a vector quantity, so it is important to consider both magnitude and direction."
- **OpenStax: elastic collisions lose no kinetic energy**
  - Source: 8.3 Elastic and Inelastic Collisions - Physics | OpenStax. https://openstax.org/books/physics/pages/8-3-elastic-and-inelastic-collisions
  - Quote: "In an elastic collision , the objects separate after impact and don’t lose any of their kinetic energy"
- **OpenStax: perfectly inelastic collisions lose the most**
  - Source: 8.3 Elastic and Inelastic Collisions - Physics | OpenStax. https://openstax.org/books/physics/pages/8-3-elastic-and-inelastic-collisions
  - Quote: "A perfectly inelastic collision (also sometimes called completely or maximally inelastic) is one in which objects stick together after impact, and the maximum amount of kinetic energy is lost."
- **OpenStax: momentum conserved, kinetic energy not**
  - Source: 8.3 Elastic and Inelastic Collisions - Physics | OpenStax. https://openstax.org/books/physics/pages/8-3-elastic-and-inelastic-collisions
  - Quote: "Momentum is conserved, but kinetic energy is not conserved."
- **Isaac Science: some inelastic collisions lose only some kinetic energy**
  - Source: Collisions – Isaac Science. https://isaacscience.org/concepts/cp_collisions
  - Quote: "In inelastic collisions, some kinetic energy is converted to another form. In fully inelastic collisions the maximum possible kinetic energy is lost and the objects stick together. However in many inelastic collisions this is not the case — only some kinetic energy is lost."
- **Isaac Science: 2D collisions use momentum components along two perpendicular directions**
  - Source: Collisions – Isaac Science. https://isaacscience.org/concepts/cp_collisions
  - Quote: "Collisions in two dimensions follow the same rules as in one dimension — momentum must be always be conserved, and in an elastic collision kinetic energy must also be conserved. However it is often easier to consider components of the momentum in two perpendicular directions (at right angles to each other)."
- **OpenStax: perfectly elastic collisions only occur with subatomic particles**
  - Source: 8.3 Elastic and Inelastic Collisions - Physics | OpenStax. https://openstax.org/books/physics/pages/8-3-elastic-and-inelastic-collisions
  - Quote: "Perfectly elastic collisions can happen only with subatomic particles. Everyday observable examples of perfectly elastic collisions don’t exist—some kinetic energy is always lost"

My reading: GCSE stops at one dimension with momentum conserved and "closed system". Dan's Vectors course gives him
components, so the glancing hit (components along two perpendicular directions) is a use of Vectors, not new
mathematics. Elastic against inelastic is the kinetic-energy question and is where the research says students slip
(6.2). The pool-ball case is close to elastic but never perfectly (OpenStax); the lesson must say so.

### 4.5 Lesson 5, Structures
- **A triangle of three bars is rigid**
  - Source: Chapter 6 ANALYSIS OF STRUCTURES. https://athena.ecs.csus.edu/~grandajj/e70/CHAP06.PDF
  - Quote: "A truss is said to be rigid if it is designed in such a way that it will not greatly deform or collapse under a small load. A triangular truss consisting of three members connected at three joints is clearly a rigid truss."
- **Truss: reactions first, from the whole truss as a free body**
  - Source: CHAP06.PDF. https://athena.ecs.csus.edu/~grandajj/e70/CHAP06.PDF
  - Quote: "The forces in the various members of a truss can be determined by the _method of joints_ . First, the reactions at the supports can be obtained by considering the entire truss as a free body."
- **Truss: draw joints in an order with only two unknowns each**
  - Source: Chapter 6 ANALYSIS OF STRUCTURES. https://athena.ecs.csus.edu/~grandajj/e70/CHAP06.PDF
  - Quote: "It is always possible in the case of a simple truss to draw the free-body diagrams of the pins in such an order that only two unknown forces are included in each diagram."
- **Tension or compression by the direction at the joint**
  - Source: Chapter 6 ANALYSIS OF STRUCTURES. https://athena.ecs.csus.edu/~grandajj/e70/CHAP06.PDF
  - Quote: "If the force exerted by a member on a pin is directed toward that pin, the member is in compression ; if it is directed away from the pin, the member is in tension"
- **Joints: 2j equations for 2j unknowns, so m + 3 = 2j for a simple truss**
  - Source: Trusses. https://www.civil.iitb.ac.in/~minamdar/ce102/Files/Trusses.pdf
  - Quote: "Conditions of equilibrium on the pins provide 2j equations for 2j unknowns. For a simple truss, 2j = m + 3. May solve for m member forces and 3 reaction forces at the supports."
- **A simple truss has m = 2j - 3**
  - Source: Trusses. https://www.civil.iitb.ac.in/~minamdar/ce102/Files/Trusses.pdf
  - Quote: "In a simple truss, m = 2j - 3 # where m is the total number of members and j is the number of joints."
- **A rigid truss will not collapse under load**
  - Source: Trusses. https://www.civil.iitb.ac.in/~minamdar/ce102/Files/Trusses.pdf
  - Quote: "A rigid truss will not collapse under the application of a load."
- **Members are loaded at the joints, so each is pure tension or compression**
  - Source: CHAP06.PDF. https://athena.ecs.csus.edu/~grandajj/e70/CHAP06.PDF
  - Quote: "The members being slender and unable to support lateral loads, all the loads must be applied at the joints"
- **A truss is built from triangles and stays stable**
  - Source: Lecture: Truss Analysis - MIT OpenCourseWare. https://ocw.mit.edu/courses/16-001-unified-engineering-materials-and-structures-fall-2021/mit16_001_f21_lec06lec07.pdf
  - Quote: "A truss is a structure formed by combining linear structural members in triangular patterns."
- **Truss: shape changes only by deformation of the elements**
  - Source: Lecture: Truss Analysis - MIT OpenCourseWare. https://ocw.mit.edu/courses/16-001-unified-engineering-materials-and-structures-fall-2021/mit16_001_f21_lec06lec07.pdf
  - Quote: "These structures are internally stable in the sense that the only change in shape under load is due to deformation of the truss elements."
- **Stability of a truss relates to its triangular shape**
  - Source: Trusses – Basic Concepts of Structural Design for Architecture Students. https://lbcc.pressbooks.pub/structuraldesign/chapter/chapter-5-trusses-2/
  - Quote: "The stability of a truss relates to its triangular shape."
- **More unknowns than equations means statically indeterminate**
  - Source: Trusses – Basic Concepts of Structural Design for Architecture Students. https://lbcc.pressbooks.pub/structuraldesign/chapter/chapter-5-trusses-2/
  - Quote: "But if the number of unknown forces is greater than the number of equilibrium equations, the truss is considered statically indeterminate."
- **Sign rule: positive is tension, negative is compression**
  - Source: 5.1 Trusses Introduction – Engineering Mechanics: Statics. https://pressbooks.library.upei.ca/statics/chapter/trusses-introduction
  - Quote: "One standard sign convention is to assume all members are in tension, labelled as positive (+), then any negative number (-) means the member is in compression."
- **Method of joints is usually the easiest and fastest**
  - Source: 5.1: Trusses Introduction - Engineering LibreTexts. https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Engineering_Mechanics_-_Statics_(Osgood_Cameron_and_Christensen)/05%3A_Trusses/5.01%3A_Trusses_Introduction (SECONDARY (a textbook hosted on LibreTexts))
  - Quote: "The method of joints is usually the easiest and fastest method for solving for all the unknown forces in a truss."
- **A screw is a modified inclined plane**
  - Source: Mechanical Advantage of Simple Machines | BoxSand – Flip the Classroom. https://boxsand.physics.oregonstate.edu/PH201/Mechanics/Mechanical-Advantage/Content/Mechanical-Advantage-of-Simple-Machines
  - Quote: "A screw is a simple machine that works as a modified incline plane."
- **The thread is an inclined plane wrapped round the shaft**
  - Source: Mechanical Advantage of Simple Machines | BoxSand – Flip the Classroom. https://boxsand.physics.oregonstate.edu/PH201/Mechanics/Mechanical-Advantage/Content/Mechanical-Advantage-of-Simple-Machines
  - Quote: "The thread of the screw may be viewed as an inclined plane wrapped around the shaft of the screw."
- **Screw mechanical advantage is circumference over pitch**
  - Source: Mechanical Advantage of Simple Machines | BoxSand – Flip the Classroom. https://boxsand.physics.oregonstate.edu/PH201/Mechanics/Mechanical-Advantage/Content/Mechanical-Advantage-of-Simple-Machines
  - Quote: "The mechanical advantage of a screw can be found by dividing the circumference of the screw by the pitch (lead) of the screw."
- **One turn advances the load by one pitch**
  - Source: Just Plane Simple - Lesson - Teach Engineering. https://www.teachengineering.org/lessons/view/cub_simp_machines_lesson02
  - Quote: "In theory, after rotating the screw by one revolution the load will advance along the screw's axis by the thread pitch, which is the axial distance from one thread groove to the next."
- **Fine threads give more advantage, coarse threads less**
  - Source: Just Plane Simple - Lesson - Teach Engineering. https://www.teachengineering.org/lessons/view/cub_simp_machines_lesson02
  - Quote: "Fine thread screws (lower pitch screws) have a greater mechanical advantage so they can do work with little supplied effort, while coarse thread screws (higher pitch screws) have a relatively lower mechanical advantage"
- **Many turns for a short advance: less effort**
  - Source: Just Plane Simple - Lesson - Teach Engineering. https://www.teachengineering.org/lessons/view/cub_simp_machines_lesson02
  - Quote: "Since the screw must rotate many times to advance a load a short distance, the effort required to turn the screw is reduced and so mechanical advantage is gained."
- **Lifting beams are bent in the middle; spreader beams are squeezed**
  - Source: Dogging and Rigging guide – Lifting and spreader beams | NSW Government. https://www.nsw.gov.au/employment/dogging-and-rigging/guide/part-1-general-rigging-principles/lifting-equipment/general-rigging-appliances-and-storage/lifting-and-spreader-beams (a state government guide)
  - Quote: "Lifting beams are subject to a bending moment at the centre of the beam. They are normally connected directly to the crane hook."
- **Spreader beams work in compression**
  - Source: Dogging and Rigging guide – Lifting and spreader beams | NSW Government. https://www.nsw.gov.au/employment/dogging-and-rigging/guide/part-1-general-rigging-principles/lifting-equipment/general-rigging-appliances-and-storage/lifting-and-spreader-beams (a state government guide)
  - Quote: "spreader beams work in compression"
- **Adding two new members to a joint keeps a truss rigid**
  - Source: CHAP06.PDF. https://athena.ecs.csus.edu/~grandajj/e70/CHAP06.PDF
  - Quote: "A truss obtained by adding two new members to the first one and connecting them to a new joint ( _D_ ) will also be rigid."
- **In a simple truss, members = 2 x joints - 3**
  - Source: CHAP06.PDF. https://athena.ecs.csus.edu/~grandajj/e70/CHAP06.PDF
  - Quote: "We may check that in a simple truss the total number of members is _m_ = 2 _n_ - 3, where _n_ is the total number of joints."

My reading: a bar structure needs two bars joined to a new joint for each new joint (m = 2j - 3), which is the
degrees-of-freedom count in plain form: each joint has two freedoms, three are removed by the supports and each bar
removes one. A square (j = 4, m = 4) is one bar short of the 5 it needs, so it has a freedom; a diagonal fixes it.
Reactions on a beam by moments Dan has (Mechanics and materials lesson 2). Pin-jointed frames were left out of that
course (its brief), so tension and compression by the direction at the joint is taught inline here, with the
equilibrium of a joint as two component equations (Vectors, Trigonometry). The screw as a ramp wrapped round a
cylinder is general mechanics; for an electrician the link is the terminal screw (7.4).

### 4.6 Lesson 6, Mirrors (new ground)
- **Bitesize: law of reflection**
  - Source: Reflection of waves - Reflection and refraction - AQA - GCSE Physics (Single Science) Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zw42ng8/revision/1
  - Quote: "The law of reflection states that: angle of incidence = angle of reflection"
- **Bitesize: angles are measured from the normal**
  - Source: Reflection of waves - Reflection and refraction - AQA - GCSE Physics (Single Science) Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zw42ng8/revision/1
  - Quote: "The angles of incidence and reflection are measured between the light ray and the normal - an imaginary line at 90° to the surface."
- **Bitesize: a virtual image seems to come from behind the mirror**
  - Source: Reflection of waves - Reflection and refraction - AQA - GCSE Physics (Single Science) Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zw42ng8/revision/1
  - Quote: "In a virtual image , the rays appear to diverge from behind the mirror, so the image appears to come from behind the mirror."
- **OpenStax: the image is as far behind the mirror as the object is in front**
  - Source: 2.1 Images Formed by Plane Mirrors - University Physics Volume 3 | OpenStax. https://openstax.org/books/university-physics-volume-3/pages/2-1-images-formed-by-plane-mirrors
  - Quote: "This means that the distance PB from the object to the mirror is the same as the distance BQ from the mirror to the image."
- **OpenStax: a plane mirror image is the same size, behind the mirror, upright**
  - Source: 2.1 Images Formed by Plane Mirrors - University Physics Volume 3 | OpenStax. https://openstax.org/books/university-physics-volume-3/pages/2-1-images-formed-by-plane-mirrors
  - Quote: "Images in a plane mirror are the same size as the object, are located behind the mirror, and are oriented in the same direction as the object (i.e., “upright”)."
- **OpenStax: a virtual image cannot be projected on a screen**
  - Source: 2.1 Images Formed by Plane Mirrors - University Physics Volume 3 | OpenStax. https://openstax.org/books/university-physics-volume-3/pages/2-1-images-formed-by-plane-mirrors
  - Quote: "The difference is that a virtual image cannot be projected onto a screen, whereas a real image can."
- **Older periscopes held mirrors at 45 degrees, later replaced by prisms**
  - Source: Up Periscope-Down Periscope Submarine's Eye at Sea. https://www.spsnavalforces.com/story?id=438
  - Quote: "Earlier periscopes had mirrors held at 45 degrees but these were later on replaced by prisms."
- **Optical periscopes on older submarines used total internal reflection prisms**
  - Source: 25.4 Total Internal Reflection - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/25-4-total-internal-reflection
  - Quote: "Another use was in optical periscopes found in older submarines, although modern subs have replaced periscopes and their lenses, mirrors, and prisms with photonic masts that use sensors, lasers, and fiber optics."
- **Long periscope tubes distorted the image; the image could flip**
  - Source: The eyes of a submarine. https://www.spie.org/news/the-eyes-of-a-submarine_photonics-masts
  - Quote: "At increased speeds, pressure bent long tubes, distorting the image. If the periscope was rotated too far, the image flipped upside down."

My reading: the law of reflection is measured from the normal. A plane mirror's image sits as far behind as the
object is in front, so a periscope is two mirrors, each at 45 degrees, and the apparent distance is the whole
folded path. "General physics only": the sources are about older optical periscopes and they say nothing about
how any Royal Navy boat does it.

### 4.7 Lesson 7, Refraction and prisms (new ground)
- **OpenStax: refractive index is at least 1 because light is slower in matter**
  - Source: 25.3 The Law of Refraction - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/25-3-the-law-of-refraction
  - Quote: "Since the speed of light is always less than in matter and equals only in a vacuum, the index of refraction is always greater than or equal to one."
- **OpenStax: slower in medium 2 means the ray bends towards the perpendicular**
  - Source: 25.3 The Law of Refraction - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/25-3-the-law-of-refraction
  - Quote: "medium 2 has a greater index of refraction than medium 1. This means that the speed of light is less in medium 2 than in medium 1."
- **OpenStax: a bigger change in speed bends the ray more**
  - Source: 25.3 The Law of Refraction - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/25-3-the-law-of-refraction
  - Quote: "For a ray at a given incident angle, a large change in speed causes a large change in direction, and thus a large change in angle."
- **OpenStax: index of refraction from the speed of light can be measured directly**
  - Source: 25.3 The Law of Refraction - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/25-3-the-law-of-refraction
  - Quote: "Today we can verify that the index of refraction is related to the speed of light in a medium by measuring that speed directly."
- **OpenStax: the index of refraction of fresh water is 1.333**
  - Source: 25.3 The Law of Refraction - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/25-3-the-law-of-refraction
  - Quote: "Water, fresh | 1.333"
- **Refractive index n = c / v**
  - Source: Refractive index | Definition & Equation | Britannica. https://www.britannica.com/science/refractive-index
  - Quote: "Refractive index is also equal to the velocity of light _c_ of a given wavelength in empty space divided by its velocity _v_ in a substance"
- **Refractive index as a ratio of sines**
  - Source: Refractive index | Definition & Equation | Britannica. https://www.britannica.com/science/refractive-index
  - Quote: "the ratio of the sine of the angle of incidence to the sine of the angle of refraction"
- **Bitesize: slower in glass bends towards the normal**
  - Source: Refraction of waves - Reflection and refraction - AQA - GCSE Physics (Single Science) Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zw42ng8/revision/2
  - Quote: "Glass is denser than air, so a light ray passing from air into glass slows down. If the ray meets the boundary at an angle to the normal , it bends towards the normal."
- **Bitesize: refraction makes light seem to come from another place**
  - Source: Refraction of waves - Reflection and refraction - AQA - GCSE Physics (Single Science) Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zw42ng8/revision/2
  - Quote: "Refraction can cause optical illusions as the light waves appear to come from a different position to their actual source."
- **Isaac Science: why light bends in glass**
  - Source: Waves - 42. Refraction — Isaac Science. https://isaacscience.org/concepts/gcse_phys_ch5_42_concept
  - Quote: "Light bends as it enters a glass block because the light travels slower in glass. This causes the wavelength of the light to get smaller , and causes the direction of the light to change."
- **OpenStax University Physics: a fish looks 3/4 of its real depth**
  - Source: 2.3 Images Formed by Refraction - University Physics Volume 3 | OpenStax. https://openstax.org/books/university-physics-volume-3/pages/2-3-images-formed-by-refraction
  - Quote: "Thus, a fish appears at 3/4 of the real depth when viewed from above."
- **OpenStax University Physics: small angles, looking straight down**
  - Source: 2.3 Images Formed by Refraction - University Physics Volume 3 | OpenStax. https://openstax.org/books/university-physics-volume-3/pages/2-3-images-formed-by-refraction
  - Quote: "For a view from above (the so-called “normal” view), we can approximate the refraction angle to be small"
- **OpenStax: total internal reflection beyond the critical angle**
  - Source: 25.4 Total Internal Reflection - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/25-4-total-internal-reflection
  - Quote: "If the incident angle is greater than the critical angle, as shown in Figure 25.13 (c), then all of the light is reflected back into medium 1, a condition called total internal reflection ."
- **Isaac Science: total internal reflection needs light to cross from a higher to a lower refractive index**
  - Source: Waves - 47. Calculating Critical Angles. https://isaacscience.org/concepts/gcse_phys_ch5_47_concept
  - Quote: "The conditions for total internal reflection are that the light * must be attempting to leave a material into air, or more generally * crossing from a higher to lower refractive index material"
- **Critical angle by an arcsine**
  - Source: Refractive Index - StatPearls - NCBI Bookshelf. https://www.ncbi.nlm.nih.gov/sites/books/NBK592413/
  - Quote: "The critical angle is given by (theta)c= arcsin ( n2/n1)"
- **The critical angle is where the refracted angle reaches 90 degrees**
  - Source: Refractive Index - StatPearls - NCBI Bookshelf. https://www.ncbi.nlm.nih.gov/sites/books/NBK592413/
  - Quote: "the critical angle is reached when the angle of refraction reaches 90 degrees."
- **Isaac Science: TIR in a prism with Snell**
  - Source: Reflection and Refraction – Isaac Science. https://isaacscience.org/concepts/cp_reflection_and_refraction
  - Quote: "For light that passes from a medium with a higher refractive index to one with a lower refractive index, there is a critical angle of incidence above which all light is reflected. This phenomenon is called total internal reflection."
- **OpenStax: dispersion defined**
  - Source: 25.5 Dispersion: The Rainbow and Prisms - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/25-5-dispersion-the-rainbow-and-prisms
  - Quote: "Dispersion is defined as the spreading of white light into its full spectrum of wavelengths."
- **OpenStax: violet bends more than red in a prism**
  - Source: 25.5 Dispersion: The Rainbow and Prisms - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/25-5-dispersion-the-rainbow-and-prisms
  - Quote: "Thus violet light is bent more than red light, as shown for a prism"
- **OpenStax: index rises as wavelength falls**
  - Source: 25.5 Dispersion: The Rainbow and Prisms - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/25-5-dispersion-the-rainbow-and-prisms
  - Quote: "because the index of refraction increases steadily with decreasing wavelength."
- **OpenStax: reflection itself causes no dispersion**
  - Source: 25.5 Dispersion: The Rainbow and Prisms - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/25-5-dispersion-the-rainbow-and-prisms
  - Quote: "There is no dispersion caused by reflection at the back surface, since the law of reflection does not depend on wavelength"
- **Isaac Science: refractive index as a ratio of speeds**
  - Source: Waves - 42. Refraction — Isaac Science. https://isaacscience.org/concepts/gcse_phys_ch5_42_concept
  - Quote: "Refractive Index = Speed of light in material Speed of light in air"

My reading: a ray bends towards the normal when it slows (FAST: faster, away; slower, towards). n = c/v is the speed
ratio, Snell's law is the exact bend (n1 sin i = n2 sin r), the critical angle is where r would reach 90 degrees
(sin ic = n2/n1), and total internal reflection happens only going from higher n to lower n. An object in water looks
nearer the surface because rays from it bend away from the normal as they leave; looking straight down the apparent
depth is real depth x n2/n1, which is 3/4 for water. Dispersion is n depending on wavelength: violet bends most.
Fibre optics ties in total internal reflection and dispersion.

---

## 5. Prerequisites

### 5.1 What Dan has, from the built courses
These come from the briefs, not from the web (docs/courses/.../brief.md).
Torque itself is the one web finding here, since Dan's courses use "moment" and OpenStax calls the same thing torque:
- **OpenStax: torque is the rotational equivalent of a force**
  - Source: 9.2 The Second Condition for Equilibrium - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/9-2-the-second-condition-for-equilibrium
  - Quote: "Torque is the rotational equivalent of a force."

- **Mechanics and materials** (8 lessons): forces in balance; moments and beams (the spanner and the bolt, the
  principle of moments, simply supported beams by moments about one support); motion and Newton's laws (momentum as
  mass x velocity, two trolleys that couple share their momentum, "momentum is not a moment"); work, energy and power
  (kinetic energy, lifting machines); the gear pair (gear rule by teeth, the idler, a compound train multiplies its
  ratios). It left out pin-jointed frames and shear and bending diagrams.
- **Vectors** (7 lessons): components, adding and the equilibrant, the cross product as a moment.
- **Trigonometry** (8 lessons): sine, cosine and tangent, inverse functions, the sine and cosine rules, the right
  triangle. This is what lesson 7 needs for Snell's law and the critical angle.
- **Linear systems** (6 lessons): two unknowns from two equations; this is the mobile's "two unknowns" step.
- **Proportional reasoning** and **Straight-line graphs**: inverse proportion (speed against teeth), the law of a machine.
- **Heat and fluids** has buoyancy and pressure; this course does not touch them.

### 5.2 What must be taught inline
- The geometry of a rigid frame (degrees of freedom, m = 2j - 3), and tension against compression at a joint:
  not in any built course.
- Elastic against inelastic collisions in terms of kinetic energy, and momentum components in a glancing hit.
- All of lessons 6 and 7: the ray model, the law of reflection, plane-mirror images, refraction, n = c/v, Snell's law,
  the critical angle, total internal reflection, dispersion.
- The counting rule for closed gear loops (odd locks, even turns).

### 5.3 What is deferred, and where it goes
- Current, voltage and resistance as puzzles: **Circuits** (same folder). Brilliant's Circuits is a separate course.
- Waves, sound and the wave equation: **Waves and light** (Physics folder). This course takes only reflection and
  refraction as rays.
- Buoyancy, heat flow, pulleys, quantum superposition (Brilliant's topic list): other courses or left out.

---

## 6. Misconceptions and learning science

### 6.1 Moments and balance
- **NSTA: the youngest children use weight only**
  - Source: Balance Beam | NSTA. https://www.nsta.org/balance-beam
  - Quote: "Young children (ages 4 and 5) consider only weight when deciding whether a beam will balance."
- **NSTA: ages 7 to 9 use both but fail when they conflict**
  - Source: Balance Beam | NSTA. https://www.nsta.org/balance-beam
  - Quote: "Around ages 7–9, children begin to consider both weight and distance but have difficulty predicting what would happen when one side has greater weight and the other side has greater distance."
- **NSTA: only the last stage multiplies distance by weight**
  - Source: Balance Beam | NSTA. https://www.nsta.org/balance-beam
  - Quote: "In the last stage (ages 10 and into adulthood), children use a mathematical rule to multiply distance by weight and compare the products to determine whether the beam will balance."
- **Pine and Messer: children believe "all things balance in the middle"**
  - Source: Children's Misconceptions in Primary Science: A Survey of teachers' views. https://www.tandfonline.com/doi/pdf/10.1080/02635140120046240
  - Quote: "These children seem to operate according to a maxim, or theory, that ‘all things balance in the middle"
- **Lever balance needs weight and distance together**
  - Source: An Effect of the Preliminary Formation of the Balance Concept: The Change in Ways of Elementary Physics Problem Solving. https://pmc.ncbi.nlm.nih.gov/articles/PMC12893739
  - Quote: "The classical “lever balance problem” has always been a challenge for students, as it requires special coordination of weight and distance changes."
- **Students guess when the moment formula has no sense behind it**
  - Source: An Effect of the Preliminary Formation of the Balance Concept: The Change in Ways of Elementary Physics Problem Solving. https://pmc.ncbi.nlm.nih.gov/articles/PMC12893739
  - Quote: "resorted to the “trial-and-error” method when they did not see any sense behind the “moment of force” calculations from the lesson materials"
- **Conflict problems: weight and distance differ on the two arms**
  - Source: Frontiers | Children's (Mis)understanding of the Balance Beam (Online Edition). https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.702524/full
  - Quote: "In conflict problems, the weight and the distance values differ on each arm of the scale."
- **Even physics majors add a rotation along the torque vector**
  - Source: Students' Difficulties in Interpreting the Torque Vector in a Physical Situation. https://www.per-central.org/items/detail.cfm?ID=12662
  - Quote: "We detected an alternative conception in which students thought that the left side of the beam and the weight would have additional motion in the direction of the torque vector."
- **Edexcel examiners: distances taken from the pivot (not from the end)**
  - Source: Examiners’ Report Principal Examiner Feedback January 2017. https://qualifications.pearson.com/content/dam/pdf/Edexcel%20Certificate/Physics/2011/Exam%20materials/4PH0_2P_pef_20170301.pdf
  - Quote: "The biggest error was in not realising that measurements of distance needed to be taken from the pivot."
- **Edexcel examiners: a balance measures mass, not weight**
  - Source: Examiners’ Report Principal Examiner Feedback January 2017. https://qualifications.pearson.com/content/dam/pdf/Edexcel%20Certificate/Physics/2011/Exam%20materials/4PH0_2P_pef_20170301.pdf
  - Quote: "A large number of candidates did not appreciate that a balance measured mass and so did not make the necessary link to weight"
- **Edexcel examiners: moments confused with momentum**
  - Source: Examiners’ Report Principal Examiner Feedback January 2017. https://qualifications.pearson.com/content/dam/pdf/Edexcel%20Certificate/Physics/2011/Exam%20materials/4PH0_2P_pef_20170301.pdf
  - Quote: "A small number of candidates confused moments with momentum and either referred to what happens in a collision or stated that clockwise and anticlockwise moments are only equal when no external forces act."
- **Edexcel examiners: the crane arm's own weight was left out**
  - Source: Examiners’ Report Principal Examiner Feedback January 2019. https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Physics/2011/Exam%20materials/4PH0_2P_pef_20190307.pdf
  - Quote: "Most candidates did not realise that the weight of the crane arm produced an additional anti-clockwise moment and so did not include it in their calculation. Candidates would benefit from practising principle of moments calculations involving more than two moments."
- **Edexcel examiners: a crane context for moments, and kilonewtons not converted**
  - Source: Examiners’ Report Principal Examiner Feedback January 2019. https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Physics/2011/Exam%20materials/4PH0_2P_pef_20190307.pdf
  - Quote: "The main error was not converting kilonewtons to newtons, which resulted in a one-mark penalty."
- **Edexcel examiners 2019: "moment" and "momentum" mixed up**
  - Source: Examiners’ Report Principal Examiner Feedback January 2019. https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Physics/2011/Exam%20materials/4PH0_2P_pef_20190307.pdf
  - Quote: "A common error seen was confusing the word “moment” with “momentum”."
- **Edexcel 2025 examiners: principle of moments confused with momentum or energy**
  - Source: Int GCSE Physics 4PH1 2P - Pearson qualifications. https://qualifications.pearson.com/content/dam/pdf/International-GCSE/Physics/2017/Exam-materials/4ph1-2p-pef-20250821.pdf
  - Quote: "although most candidates correctly quoted the Principle of Moments, others confused this with the conservation of momentum or conservation of energy."
- **Edexcel GCSE 2023 examiners: show a calculation of moments, not a ratio**
  - Source: GCSE Physics 1PH0 2H - Examiners' Report June 2023. https://qualifications.pearson.com/content/dam/pdf/GCSE/Science/2016/exam-materials/1ph0-2h-pef-20230824.pdf
  - Quote: "Questions that ask you to use the principle of moments will expect you to show a calculation of moments using force x distance."
- **Edexcel GCSE 2023 examiners: cm kept consistent is fine**
  - Source: GCSE Physics 1PH0 2H - Examiners' Report June 2023. https://qualifications.pearson.com/content/dam/pdf/GCSE/Science/2016/exam-materials/1ph0-2h-pef-20230824.pdf
  - Quote: "This is good practice but not essential in moment calculations provided that the units are consistent all the way through."
- **AQA examiners 2023: lever question, distance without reference to force**
  - Source: Examiner report (Higher) : Paper 2 - June 2023. https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2023/june/AQA-84632H-WRE-JUN23.PDF
  - Quote: "Common mistakes included physically changing the length of the lever, increasing the distance from the pivot without any reference to force, and increasing the distance of the lever to the pivot."
- **WJEC examiners 2025: positions on the ruler instead of distances from the pivot**
  - Source: WELSH JOINT EDUCATION COMMITTEE. https://www.wjec.co.uk/media/hechlma5/wjec-gcse-physics-report-s25-e.pdf
  - Quote: "Q.8 Basic bookwork about the principle of moments and the unit in which moment of a force is expressed were not well known. The main source of error in this question involved calculations involving the positions on the ruler instead of the distances from the pivot."
- **WJEC examiners 2025: write the clockwise and anticlockwise moments separately before equating them**
  - Source: WELSH JOINT EDUCATION COMMITTEE. https://www.wjec.co.uk/media/hechlma5/wjec-gcse-physics-report-s25-e.pdf
  - Quote: "Candidates are reluctant to write down expressions or values for the clockwise moment and for the anticlockwise moment separately before equating them. Such structured steps are paramount in the success in solving moments problems."

My reading: the research shows a clear ladder from "only weight counts" to "multiply weight and distance"; the exam
reports show the same slips at GCSE (positions on the ruler used instead of distances from the pivot, kilonewtons not converted,
a balance giving mass not weight, moments mixed with momentum, a beam's own weight left out; centimetres are fine if
they are used throughout). The mobile with several levels is the best place to teach "weight of the beam acts at its middle".

### 6.2 Momentum and collisions
- **Singh: students unsure which system conserves momentum**
  - Source: Students’ conceptual knowledge of energy and momentum. https://www.compadre.org/repository/Items/4301/Singh.pdf
  - Quote: "Collision problems that were designed to evaluate whether students can identify the appropriate “system” for which momen- tum (and also the kinetic energy for elas- tic collisions) is conserved show that more than 40% of the students were confused about it."
- **Singh: many believed momentum and kinetic energy are conserved for each object**
  - Source: Students’ conceptual knowledge of energy and momentum. https://www.compadre.org/repository/Items/4301/Singh.pdf
  - Quote: "Many believed that momentum and kinetic energy are conserved for each object."
- **Singh: some students believe momentum is force**
  - Source: [1602.07756] Students’ conceptual knowledge of energy and momentum. https://ar5iv.labs.arxiv.org/html/1602.07756
  - Quote: "of the students believed that momentum is force."
- **Momentum treated as a scalar, or as depending on mass or velocity but not both**
  - Source: Identifying student resources for understanding linear momentum. https://www.per-central.org/items/perc/5479.pdf
  - Quote: "the literature reports that students: (1) tend to treat momentum as a scalar quantity [2–7], (2) think about momentum as dependent on either _velocity_ or _mass_ , but not both"
- **Soft objects are thought not to conserve momentum**
  - Source: Microsoft Word - MSCEIS201.docx. https://iopscience.iop.org/article/10.1088/1742-6596/1280/5/052008/pdf
  - Quote: "Momentum Conservation If soft objects collide with other objects then momentum doesn’t converse. In the momentum conservation, objects must experience perfectly elastic collision."
- **Elastic collisions: the kinetic energy that is constant is the system's**
  - Source: Using the Energy and Momentum Conceptual Survey to investigate .... https://arxiv.org/pdf/2311.17054
  - Quote: "did not think carefully about the fact that it is the kinetic energy of the system which is constant."
- **Edexcel Jan 2020: unit of momentum, and mix-up with moments**
  - Source: GCE. https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Physics/2017/exam-materials/4PH1_2PR_pef_20200305.pdf
  - Quote: "A minority of students could not recall the correct unit for momentum, instead giving answers such as kg/m/s or kgm/s ² ."
- **Edexcel Jan 2020: conservation of momentum confused with the principle of moments**
  - Source: GCE. https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Physics/2017/exam-materials/4PH1_2PR_pef_20200305.pdf
  - Quote: "Conservation of momentum was described well in Q3(c), the most common errors being, again, confusion with the principle of moments"
- **Edexcel Jan 2019: bodies that join together need more practice**
  - Source: Examiners’ Report Principal Examiner Feedback January 2019. https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Physics/2011/Exam%20materials/4PH0_2P_pef_20190307.pdf
  - Quote: "Candidates would benefit from practising similar conservation of momentum problems involving bodies coalescing."

My reading: the two slips to design against are momentum treated as a scalar (direction lost) and momentum and
kinetic energy both said to be conserved for each object. The lesson should have a case with an object going the
other way (negative momentum) and one where kinetic energy is lost.

### 6.3 Mirrors and refraction
- **Goldberg and McDermott: many students cannot place the image**
  - Source: Title Goes Here. https://www.per-central.org/items/perc/3453.pdf
  - Quote: "Goldberg and McDermott found that many students fail at these tasks, both pre- and post-instruction."
- **The "line of sight" idea of where the image is**
  - Source: Title Goes Here. https://www.per-central.org/items/perc/3453.pdf
  - Quote: "The image is believed to lie somewhere along the observer-object line of sight."
- **Students think the image does not depend on the observer**
  - Source: Representation of Image Formation—Observation in Optics in Ethiopian Textbooks: Student Learning Difficulties as an Analytical Tool. https://www.mdpi.com/2227-7102/13/5/445
  - Quote: "The students in Galili’s [ 11 ] study thought that image formation by a plane mirror was independent of the observer."
- **Students think they can see the image from anywhere**
  - Source: Representation of Image Formation—Observation in Optics in Ethiopian Textbooks: Student Learning Difficulties as an Analytical Tool. https://www.mdpi.com/2227-7102/13/5/445
  - Quote: "the students thought that they could see the image of the object placed in front of the mirror, even though they were out of the range of the reflected light"
- **Thai students: very few place the refracted image correctly**
  - Source: Thai high-school students’ misconceptions about and models of light refraction through a planar surface - IOPscience. https://iopscience.iop.org/article/10.1088/0031-9120/45/1/012
  - Quote: "Only 22% of all students had a qualitative understanding of how to use a ray diagram to determine image position, and only 1 of 220 students could identify the correct image position using correct reasoning."
- **Thai students, even after instruction, are wrong about refraction**
  - Source: Thai high-school students’ misconceptions about and models of light refraction through a planar surface - IOPscience. https://iopscience.iop.org/article/10.1088/0031-9120/45/1/012
  - Quote: "The study indicates that these high-school students, even after instruction, had significant misconceptions about the direction of propagation of light, how light refracts at an interface, and how to determine the position of an image."
- **Teachers in training struggle with the ray model and the observer**
  - Source: Physics Education Research special collection - European Journal of Physics - IOPscience. https://iopscience.iop.org/journal/0143-0807/page/Physics-Education-Research-special-collection
  - Quote: "We found that PSPTs mainly had difficulties with the ray model, the function of the observer in the real and virtual image formation and observation processes, and the function of the screen in image formation and observation processes."
- **Ray diagrams cause and cure misconceptions**
  - Source: Tackling misconceptions in geometrical optics - IOPscience. https://iopscience.iop.org/article/10.1088/1361-6552/aac604
  - Quote: "Since ray diagrams can be both the cause and the solution for many misconceptions we focus strongly on improving understanding of this tool to solve and understand optical phenomena."

My reading: the "line of sight" belief (the image lies on the line from eye to object) is what a periscope puzzle
breaks, since the image is behind the mirror and the eye sees the image, not the object itself. Students also think the
image does not depend on where the viewer stands. For refraction, the studies say students are wrong about where
the refracted image sits even after instruction, so the apparent-depth puzzle needs a ray diagram with the observer
drawn in.

### 6.4 Gears
- **Gears: meshed gears opposing, idlers, inverted ratio (test-prep site: SECONDARY)**
  - Source: ASVAB Mechanical Comprehension: Gears | Forever Wingman. https://foreverwingman.com/asvab/mechanical-comprehension/gears/
  - Quote: "Saying meshed gears turn the same way. They oppose. Thinking an idler changes the ratio. It changes direction only. Inverting the ratio. Driven over driver."
- **Gears: a pair cannot raise both speed and torque (SECONDARY)**
  - Source: ASVAB Mechanical Comprehension: Gears | Forever Wingman. https://foreverwingman.com/asvab/mechanical-comprehension/gears/
  - Quote: "Saying a gear pair increases both speed and torque. Impossible; it is a trade."
- **People discover the odd/even rule when they work many gear examples**
  - Source: On the spontaneous discovery of a mathematical relation during problem solving. https://backend.production.deepblue-documents.lib.umich.edu/server/api/core/bitstreams/328e8a48-19a5-45cb-b73c-6b6d7e68a0b5/content
  - Quote: "Many participants went on to discover a mathematical representation of the problem in which the parity of the number of gears (i.e., whether the number of gears was odd or even) indicates whether the target gear will turn clockwise or counterclockwise."
- **In a jammed odd loop, two gears each try to turn the same way**
  - Source: Shuttling Between Depictive Models and Abstract Rules. https://aaalab.stanford.edu/assets/papers/earlier/Shuttling_between.pdf
  - Quote: "When there are an odd number of gears, these two top gears are both trying to turn this way. But touching gears can’t both turn this way. See how they jam each other."

My reading: I found **no examiner report or study naming gear-direction or idler errors**. The "where people lose
points" list is from an exam-preparation site (**SECONDARY**) and is useful as a list of likely slips, not as
evidence. The research that does exist is about how people reason about gear chains: they start by tracing gear by
gear and then find the odd/even rule, which supports giving several chains before stating it.

### 6.5 Learning science
- **Predict, observe, explain: elicit, confront, resolve**
  - Source: Role of physics lecture demonstrations in conceptual learning | Phys. Rev. ST Phys. Educ. Res.. https://journals.aps.org/prper/abstract/10.1103/PhysRevSTPER.9.020113
  - Quote: "In the context of demonstrations, the “elicit, confront, resolve” cycle is better known as “predict, observe, explain” (POE)"
- **Demonstrations teach best when students already have the basics**
  - Source: Role of physics lecture demonstrations in conceptual learning | Phys. Rev. ST Phys. Educ. Res.. https://journals.aps.org/prper/abstract/10.1103/PhysRevSTPER.9.020113
  - Quote: "demonstrations are most effective in promoting learning when students have at least a basic level of conceptual understanding beforehand."
- **Learning depends on observing the outcome accurately, right or wrong prediction**
  - Source: Role of physics lecture demonstrations in conceptual learning | Phys. Rev. ST Phys. Educ. Res.. https://journals.aps.org/prper/abstract/10.1103/PhysRevSTPER.9.020113
  - Quote: "conceptual learning depends on students accurately observing the outcome of the demonstration, regardless of whether their initial prediction is correct or incorrect."
- **A couple of minutes to predict raises engagement and learning**
  - Source: What Levels of Guidance Promote Engaged Exploration with Interactive Simulations?. https://phet.colorado.edu/publications/PERC_Interview_Guidance.pdf
  - Quote: "Giving students a couple of minutes to predict the outcome and record their ideas increases student engagement and learning from demonstrations."
- **Innovation tasks: attempt your own solution to an unfamiliar problem**
  - Source: What Levels of Guidance Promote Engaged Exploration with Interactive Simulations?. https://phet.colorado.edu/publications/PERC_Interview_Guidance.pdf
  - Quote: "Innovation requires students to attempt to create their own solution to an unfamiliar problem and helps novices form a suitable mental framework."
- **Worked examples help novices more than unguided problem solving**
  - Source: Full article: The effect of worked examples on learning solution steps and knowledge transfer. https://www.tandfonline.com/doi/full/10.1080/01443410.2023.2273762
  - Quote: "teaching with examples would be superior to engaging in unguided problem solving, particularly for novices, as using worked examples would reduce their cognitive load, compared to solving problems,"
- **Predict-observe-explain with simulations beat the control group**
  - Source: ERIC - EJ1496573 - An Experimental Study Exploring the Effects of Predict-Observe-Explain Method Supported with Simulations, Research in Science & Technological Education, 2025. https://eric.ed.gov/?id=EJ1496573
  - Quote: "The results showed that the experimental group outperformed the control group regarding physics achievement."

My reading: predict-observe-explain fits "open with a puzzle he can feel his way through, then the rule". One finding
cuts the other way, that demonstrations work best "when students have at least a basic level of conceptual
understanding beforehand", which Dan has for lessons 1 to 5. For lessons 6 and 7, which are new ground, a short
worked example before the typed-answer puzzles has the support of the worked-example effect.

---

## 7. Where it is used for an electrician going into marine engineering

None of these says how the Navy or a boat does it; they show the physics in marine and lifting hardware that anyone
can buy or read about.

### 7.1 Gearboxes between engine and propeller
- **Marine reduction gearboxes: single-stage ratios up to 10:1, more by an extra train**
  - Source: Finnoy Reduction Gearboxes - Headland Engineering. https://headlandengineering.com.au/finnoygearandpropelleras/finnoygear (vendor page)
  - Quote: "reduction ratios from 2:1 to 10:1. Higher reduction ratios are achieved using an additional gear train."
- **Marine gearbox: two propeller speeds from one engine speed**
  - Source: Finnoy Reduction Gearboxes - Headland Engineering. https://headlandengineering.com.au/finnoygearandpropelleras/finnoygear (vendor page)
  - Quote: "Two selectable propeller speeds while maintaining constant engine speed"
- **Marine gearboxes use different reduction ratios for different power sources**
  - Source: Marine Gears: Special Aspects for High Performance. https://www.geartechnology.com/marine-gears-special-aspects-for-high-performance
  - Quote: "Depending on the combination, the power sources often operate at different speeds, so they require gear trains with different reduction ratios."
- **A published warship gearbox paper: an idler sets the sense of rotation of a shaft**
  - Source: library.imarest.org. https://library.imarest.org/record/9455/files/v19b1p08a.pdf
  - Quote: "This is done by placing an idler in the train for one primary gearbox without altering the disposition of the input and output axes."

My reading: reduction between an engine and a propeller is the clearest case of lesson 1 and 2 (single-stage ratios
stop near 10:1, so a second stage). The IMarEST paper on a naval warship transmission is public and about a surface
ship; it uses an idler to reverse a shaft. Do not apply it to a submarine.

### 7.2 Winches and cranes
- **Winch gearboxes for ship, port and container cranes**
  - Source: Winch Gearboxes GPT-W. https://www.zf.com/products/media/industrial/industrial_gearboxes/kataloge/ZF_Katalog_Drive_gearboxes-for_winches_GPT-W.pdf (vendor catalogue)
  - Quote: "ZF gearboxes GPT-W are drive components for winch applications, like crawler cranes, ship-, port- and container cranes, railway cranes, cranes on work ships or offshore platforms."
- **Winch gearbox selection starts from torque = cable pull x winding radius**
  - Source: Winch Gearboxes GPT-W. https://www.zf.com/products/media/industrial/industrial_gearboxes/kataloge/ZF_Katalog_Drive_gearboxes-for_winches_GPT-W.pdf (vendor catalogue)
  - Quote: "T2 = Output torque [Nm] F = Cable pull in [N] D = Relevant winding diameter in [m]"
- **Winch gear ratios run from 21 to 1,200**
  - Source: Winch gearboxes - ZOLLERN. https://www.zollern.com/en/products/gearboxes/winch-gearboxes (vendor catalogue)
  - Quote: "Gear ratios 21 to 1,200 (as a standard)"
- **Winch gearboxes are marine products too**
  - Source: Winch gearboxes - ZOLLERN. https://www.zollern.com/en/products/gearboxes/winch-gearboxes (vendor catalogue)
  - Quote: "Marine: Ship crane, mobile harbour crane, heavy duty crane, shipyard cranes, handling equipment"

My reading: a winch gearbox is chosen first from the torque on the drum, which is cable pull x drum radius: a moment,
then a gear train to bring the motor's speed down to the drum's.

### 7.3 Cranes and lifting beams
- **A crane load chart gives safe load against radius and boom angle**
  - Source: FAR FROM THE COASTS, CLOSE TO THE BEST CHOICE YOU EVER MADE. https://marinetechnic.com/wp-content/uploads/2025/03/x388allegato1-2xoffshore-cranes-b-292.pdf (vendor brochure)
  - Quote: "RADIUS (METER) BOOM ANGLE (DEGREES) SAFE WORKING LOAD (IN TONNES)"
- **A ship crane on a 440 V, 60 Hz supply**
  - Source: FAR FROM THE COASTS, CLOSE TO THE BEST CHOICE YOU EVER MADE. https://marinetechnic.com/wp-content/uploads/2025/03/x388allegato1-2xoffshore-cranes-b-292.pdf (vendor brochure)
  - Quote: "ELECTRIC POWER 440V-60Hz"
- **Edexcel examiners: moments questions use a crane arm**
  - Source: Examiners’ Report Principal Examiner Feedback January 2019. https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Physics/2011/Exam%20materials/4PH0_2P_pef_20190307.pdf
  - Quote: "Part 8(c) assessed candidates’ knowledge of the principle of moments and their ability to apply it to the crane context."
- **Lifting beams carry a bending moment and hang from the crane hook**
  - Source: Dogging and Rigging guide – Lifting and spreader beams | NSW Government. https://www.nsw.gov.au/employment/dogging-and-rigging/guide/part-1-general-rigging-principles/lifting-equipment/general-rigging-appliances-and-storage/lifting-and-spreader-beams (a state government guide)
  - Quote: "Lifting beams are used in lower headroom applications where the multi leg sling angle is greater than 120 degrees."
- **Never exceed the marked load or the specified sling angle**
  - Source: Instructions for the safe use of: Lifting Beams and Spreader Beams. https://www.liftingsafety.co.uk/pdf/legislation/lifting-beams_spreader.pdf (a safe-use leaflet)
  - Quote: "For straight lift never exceed the marked SWL and in the case of multi-leg slings the specified angle or range of angles."

My reading: a crane's safe load falls as the radius grows, which is a moment about the pedestal. A lifting beam is
loaded in bending, and a spreader beam in compression with the load in two slings, so the sling angle sets the force
in each leg. The 440 V, 60 Hz crane is a vendor brochure for a ship's deck crane, not a boat.

### 7.4 The screw in an electrician's work
- **Loose screw terminals overheat**
  - Source: Electrical Receptacles - Overheating, Arcing, and Melting. https://publications.iafss.org/publications/fss/11/1010/view/fss_11-1010.pdf
  - Quote: "A prominent cause of electrical fires in receptacles is overheating at loose terminal connections."
- **Loose connections have higher resistance and get hotter**
  - Source: Achieving (and maintaining) electrical connection tightness - FVEAA. https://www.fveaa.org/fb/Electrical_Connection_Tightness_145.pdf
  - Quote: "“Loose connections” do develop higher resistance and are likely to get hotter than they should."
- **A firm screw joint has a large contact area and little heating; a loose one has less**
  - Source: Electrical Receptacles - Overheating, Arcing, and Melting. https://publications.iafss.org/publications/fss/11/1010/view/fss_11-1010.pdf
  - Quote: "When two electrical conductors make firm contact over a large surface area relative to the cross-sectional area of the conductors, a good connection is formed and ohmic heating at the connection is minimal. However, loose terminal connections typically result in reduced contact area between conductors."
- **Loose connections overheat only when also carrying high current**
  - Source: Electrical Receptacles - Overheating, Arcing, and Melting. https://publications.iafss.org/publications/fss/11/1010/view/fss_11-1010.pdf
  - Quote: "both a very loose connection and a relatively high current load are required for overheating to begin at a receptacle screw connection (< 0.339 N-m and >9 A)."

My reading: a screw terminal is a screw used as a clamp; its tightness (torque) sets the contact area and so the
heating. The study is of mains receptacles in a US lab, not marine work, so it is a general electrician's point.
BS 7671 and Dan's own inspection and test courses cover terminals; I have not quoted them.

### 7.5 Light in glass: fibres and prisms
- **Fibre light stays inside by total internal reflection (subsea fibre)**
  - Source: ED476_26Q2_Light Speed, Under the Sea. https://www.earthdate.org/files/000/005/162/ED476_26Q2_Light%20Speed,%20Under%20the%20Sea.pdf
  - Quote: "They stay confined because the core has a higher refractive index than the cladding. That difference causes the light to reflect completely back inward, a phenomenon known as total internal reflection."
- **OpenStax: fibre optics use total internal reflection, with cladding of lower index**
  - Source: 25.4 Total Internal Reflection - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/25-4-total-internal-reflection
  - Quote: "Fiber optics employs the transmission of light down fibers of plastic or glass."
- **OpenStax: dispersion spreads signals in a fibre**
  - Source: 25.5 Dispersion: The Rainbow and Prisms - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/25-5-dispersion-the-rainbow-and-prisms
  - Quote: "White light used to transmit messages in a fiber is dispersed, spreading out in time and eventually overlapping with other messages."
- **OpenStax: binoculars use prisms by total internal reflection**
  - Source: 25.4 Total Internal Reflection - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/25-4-total-internal-reflection
  - Quote: "One use of these perfect mirrors is in binoculars"

My reading: subsea cables carry fibre (the EarthDate page), and a fibre's core and cladding are lesson 7 in practice;
dispersion is also why a fibre's pulses spread. Whether Dan's Subsea Cable Testing course covers fibre is **UNCONFIRMED**.

### 7.6 The standards
- **The mechanic standard: testing and fault diagnosis on ships and submarines**
  - Source: Maritime mechanical and electrical mechanic / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0276-v1-1
  - Quote: "Maritime mechanical and electrical mechanics work from engineering drawings, data and documentation in order to undertake the testing, fault diagnosis and maintenance of electrical, mechanical and fluid power equipment on ships and submarines."
- **Fitter standard: propulsion machinery, weapons, reactor and auxiliary systems**
  - Source: Apprenticeship Standard for: Maritime Mechanical Fitter. https://assets.publishing.service.gov.uk/media/5a807fd5e5274a2e8ab507ed/MARITIME_DEFENCE-_Maritime_Mechanical_Fitter.pdf
  - Quote: "This can include propulsion machinery, weapons, reactor and auxiliary systems (such as water, air conditioning and power generation)."

My reading: both standards set the work on ships and submarines and include propulsion, power generation and
distribution; they are public, and say nothing beyond that outline.

---

## 8. Size: how many lessons the benchmarks spend, and which core supports 7

- **Scientific Thinking: 40 lessons** (557 exercises): gears 9 (levels 1 and 6), mobiles 8, pool 7, structures 9,
  optics 7. **Physics of the Everyday: 33.** **Classical Mechanics: 48** (momentum 5, statics 6, no gears or optics).
  Circuits 31; Science Puzzles 59 (one puzzle a day).
- **OpenStax College Physics:** 7 sections in the momentum chapter, 7 in geometric optics, and statics in chapter 9.
- **AQA:** moments, levers and gears is one sub-section (4.5.4); momentum is three (4.5.7.1 to 4.5.7.3); reflection and
  refraction are parts of two (4.6.1.3, 4.6.2.2).

My reading: Brilliant spends 40 lessons and Dan wants 7, so each of his lessons is about six of Brilliant's. The core
that supports seven is Scientific Thinking itself: its six levels fold into seven lessons by joining the two gear
levels into two lessons (1 and 2), keeping mobiles (3), pool (4) and structures (5) as one lesson each, and splitting
optics into mirrors (6) and refraction with prisms (7). The tight lessons are 5 (nine Brilliant lessons, from
rigid shapes to joints and screws) and 7 (refraction, index, Snell, critical angle, prism, dispersion). If either runs
long, the first things to move out are "equivalent structures" and the dispersion detail, not the working. Seven is
supported by the sources; fewer would drop one of the two new-ground optics lessons, and more would repeat gears
Dan has just met in Mechanics and materials.

---

## 9. What I could not confirm

- The January Leading Rate enabling course's syllabus: not public. Plan against GCSE; say where a choice is a guess.
- What is inside a Brilliant lesson (the pictures and puzzles), and whether Physics of the Everyday and Classical
  Mechanics lessons use numbers: the course pages list titles and topics only.
- The final June 2014 DfE subject content: I read the June 2013 document and the exam boards' printed versions.
- Whether AQA 8463 names total internal reflection or the critical angle, and whether any board's equation list
  carries n = c/v: not seen in the excerpts (Edexcel does name TIR and the critical angle; CCEA says Snell's law is
  not expected).
- Whether Combined Science (8464) has moments, levers and gears: AQA labels 4.5.4 "physics only", which says it does not.
- Any examiner report or study on gear-direction, idler or compound-ratio errors: none found (6.4).
- A public source for how a lifting beam's sling angle changes the leg force with figures: the safe-use pages say
  to keep to the marked angle but give no formula.
- Brilliant's older catalogue grouping (an archive copy, not quotable).
