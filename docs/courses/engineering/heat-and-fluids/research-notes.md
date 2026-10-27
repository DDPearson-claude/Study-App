# Heat and fluids: research notes

Researched 26 Oct 2026 for the Heat and fluids course brief (the second course in the Engineering science shelf's Engineering science folder,
after Mechanics and materials; blurb "Temperature, heat and how it moves; gases and pressure; flow, pumps and the engines that turn heat into work").
The brief itself is not written here; these notes are its evidence. Dan is an electrician and a Royal Navy submariner on the electrical
engineering path; next year he does a Level 3 marine engineering course, general engineering first, then submarine and nuclear propulsion.
He asked for foundations, not a remake of that course (CLAUDE.md). Nothing here is about any boat, plant or submarine system.

Every finding has its source title, URL and the exact words, cut by script from the saved tool results (the quotes were not retyped
into this file). All of them are in `quotes.json` beside it and were checked with
`node tools/eval/sources.mjs --quotes ... --tools ...` (`failed: 0`). The tool files are in `tools/`; they were harvested from this
run's own transcript with `tools/course/harvest.mjs`. Two oversize fetch results (Khan and OpenStax lesson lists) were reported by the
connector as errors with the payload saved to a file; the harvester skips those, so I copied the saved payload into `tools/49-web_fetch.json`
and `tools/50-web_fetch.json` unchanged, with the call's input. One later call was refused by the free-tier rate limit and returned nothing; it was repeated.
Findings I could not confirm are marked **UNCONFIRMED**; where only a non-original site said it, **SECONDARY** (and the line says what kind).
My own readings are marked "My reading" and are not quotes. Mirror and copy sites were avoided: a Scribd upload, a dokumen.pub copy, a
mirror of a Bird PDF and a college copy of an MCA notice were dropped; the checker rejected the Scribd and dokumen.pub ones itself.
Quotes copied from a page that the app's fitter shortens keep its own cut marks (for example the "..." and a broken word at an excerpt joint);
they are the page's words as the tool returned them.

## What the research found, in short

- **Benchmark:** Brilliant has no heat, thermodynamics or fluids course. Its closest are Physics of the Everyday (33 lessons) and Classical
  Mechanics (48 lessons, with single lessons on Pressure, Buoyancy and the Ideal Gas Law). It is a good source of how to open (a toilet, a water
  tower, a refrigerator), not of content.
- **Best syllabus lines:** Dan's own BTEC L3 Diploma Unit 8 (heat transfer, gas laws, Archimedes, continuity); Pearson HN Units 11, 13 and 64
  (pumps, head loss, heat exchangers, work done); MCA General Engineering Science B and Applied Heat sections 1 to 3, 5 and 7; Applied Mechanics 7 and 8.
- **Strongest misconception sources:** Prince and Vigeant's Heat and Energy Concept Inventory (ASEE and Journal of Engineering Education); the 2025
  Polish study of 470 students (IOP); Chu et al. via IOPSpark; Bessas et al. (hydrostatic pressure, 4-tier); the Oregon State study of Bernoulli use by
  engineers; the DOE slide on the Carnot limit; the ChemTeam and Science Insights gas-law lists.
- **Where it is used:** BS 7671 Appendix 4 (Ca, Ci) and the CDC and SEL thermal-model papers for cables; Electrical4U and a fan maker for motor
  heating; ZVEI and FM Global for battery rooms; Cummins and Caterpillar for generator rooms and jacket-water coolers; Neutrium and ElectroMechCalc for
  pump power from the motor's side.
- **Contested points to teach as contested:** the Carnot limit for real engines (4.4, 6.5); the Reynolds-number cut-offs (4.7); the 90 C versus 70 C
  cable tables (7.7).
- **Unconfirmed:** Rogers and Mayhew and Eastop and McConkey contents (2.3); whether Dan's diploma included Units 8, 11, 66 or 70 (3.5); the
  full Isaac topic tree (2.6); lesson insides of every Brilliant course (1); the LMTD formula source (4.2); a ship's battery-room ventilation rule
  (only a US rule and an industrial one were found, and neither is used as how any boat does it); no "marine engineering technician" standard on the
  register (3.1).

**Sixteen key sources** (of the many quoted): 1 Brilliant Physics of the Everyday; 2 Brilliant Classical Mechanics; 3 Pearson BTEC National Unit 1;
4 Pearson BTEC L3 Diploma in Advanced Manufacturing Engineering unit specification (Units 8, 11, 66, 70); 5 Pearson HN Engineering specification (Units 11, 13, 64);
6 MCA Applied Heat syllabus; 7 MCA General Engineering Science B; 8 MCA Applied Mechanics; 9 Skills England ST0457, ST0364, ST0276; 10 OpenStax University Physics Volumes 1
and 2; 11 Khan AP Physics 2 Unit 1; 12 Bird, Science and Mathematics for Engineering; 13 Prince and Vigeant's concept-inventory papers; 14 the DOE Carnot slide and the
2025 marine paper; 15 the CDC, Electrical4U and SEL thermal-model sources; 16 KSB, Grundfos and the DOE handbook text on pumps.

---

## 1. Benchmark: Brilliant on heat, thermodynamics and fluids

Brilliant has no course named for heat, thermodynamics or fluids. Its science list is Physics of the Everyday,
Classical Mechanics, Special Relativity, Scientific Thinking, Science Puzzles and Circuits (the last two from the
educators' list and the course pages). I read every one of those pages that came back. Brilliant's own wiki has
articles on the zeroth and second laws, but a wiki article is not a course and is only used where marked.
Brilliant is also renaming (courses are now "topics", levels "units", lessons "concepts", per its learning-paths help
page); the old URLs still answer. Pages move; the lists below are as seen on 26 Oct 2026.

### 1.1 Brilliant: Physics of the Everyday
- **Physics of the Everyday is 33 lessons and 208 exercises; Level 1 opens with Toilets, Water Towers, Refrigerators**
  - Source: Practice Physics of the Everyday | Brilliant. https://brilliant.org/courses/physics-of-the-everyday
  - Quote: "33 Lessons 208 Exercises ## Level 1 Toilets Water Towers Refrigerators Helicopter Toy Water Contamination"
- **Physics of the Everyday levels 2 and 3: motion and sport, then energy sources**
  - Source: Practice Physics of the Everyday | Brilliant. https://brilliant.org/courses/physics-of-the-everyday
  - Quote: "Level 2 Axe Throwing BMX Motocross Tug of War Skiing Gymnastics: Spinning Gymnastics: Flipping Baseball: Hitting & Catching Baseball: Throwing & Running ## Level 3 Fossil Fuels Mammalian Caloric Intake Solar Power Nuclear Energy Nuclear Reactors Dyson Sphere"
- **Physics of the Everyday levels 4 and 5: weather and water, then pressure-led engineering (airplanes, bridges)**
  - Source: Practice Physics of the Everyday | Brilliant. https://brilliant.org/courses/physics-of-the-everyday
  - Quote: "Level 4 Seasons The Greenhouse Effect Weather Systems The Water Cycle Hurricanes Tides ## Level 5 Fluoridated Water Airplanes Traffic Beam and Truss Bridges Arch and Suspension Bridges Skyscrapers Queen of the Monsters"
- **Brilliant's description of Physics of the Everyday**
  - Source: Practice Physics of the Everyday | Brilliant. https://brilliant.org/courses/physics-of-the-everyday
  - Quote: "Discover physics in unexpected places: from refrigerators and toilets, to traffic jams and water towers."
- **Physics of the Everyday topics covered: Heat and Pressure sit among twelve**
  - Source: Practice Physics of the Everyday | Brilliant. https://brilliant.org/courses/physics-of-the-everyday
  - Quote: "Topics covered * Estimation * Forces * Heat * Kinematics * Kinetic Energy * Momentum * Nuclear Physics * Potential Energy * Pressure * Rotational Dynamics * Torque * Weather"
- **Physics of the Everyday prerequisite line**
  - Source: Practice Physics of the Everyday | Brilliant. https://brilliant.org/courses/physics-of-the-everyday
  - Quote: "A nodding familiarity with basic concepts like heat, energy, and force will help."

My reading: the heat and fluid ground is scattered across 33 lessons that open on objects. Level 1 is Toilets, Water
Towers, Refrigerators, Helicopter Toy, Water Contamination (the titles suggest pressure, head and a refrigeration loop). Level 3 is energy
sources (Fossil Fuels, Solar, Nuclear: not for us). Level 4 is weather and water (Greenhouse Effect, Water Cycle).
Level 5 starts with Fluoridated Water and Airplanes (titles only). The lesson titles are all the page gives, so the
pictures inside each lesson are **UNCONFIRMED** (I did not see a lesson). What to borrow is the way in: a real thing
Dan has stood next to (a header tank, a cooler, an air receiver), then the idea. It is a low-maths course, so it is a
mood benchmark, not a content one.

### 1.2 Brilliant: Classical Mechanics (pressure, buoyancy, ideal gas)
- **Brilliant's Classical Mechanics is 48 lessons; Level 3 has Pressure and Buoyancy**
  - Source: Practice Classical Mechanics | Brilliant. https://brilliant.org/courses/dynamics-bootcamp
  - Quote: "What are Forces? The Three Laws of Motion Weight and Scales Pressure Buoyancy Drag Forces Banked Curve Problem"
- **Classical Mechanics Level 5 holds the Ideal Gas Law as a single lesson**
  - Source: Practice Classical Mechanics | Brilliant. https://brilliant.org/courses/dynamics-bootcamp
  - Quote: "Level 5 Momentum in the Office Impulse-Momentum Theorem Rocket Equation Ideal Gas Law Photon Problem"
- **Classical Mechanics tells the learner to start with Physics of the Everyday**
  - Source: Practice Classical Mechanics | Brilliant. https://brilliant.org/courses/dynamics-bootcamp
  - Quote: "We recommend starting your physics journey with Physics of the Everyday."

My reading: Brilliant spends three lessons on this whole ground inside its mechanics course: Pressure and Buoyancy
(level 3, with forces, drag) and Ideal Gas Law (level 5, with momentum and the rocket equation). No heat engine, no
flow, no pump. It places pressure after forces and before energy, which is the order Dan's own shelf follows (Mechanics
and materials, then Heat and fluids).

### 1.3 Brilliant: Scientific Thinking and Science Puzzles (heat flow, fluids)
- **Brilliant's Scientific Thinking lists Heat Flow among its topics**
  - Source: Practice Scientific Thinking | Brilliant. https://brilliant.org/courses/puzzle-science/
  - Quote: "Electric Circuits * Forces * Gears * Heat Flow * Kaleidoscopes * Pulleys * Quantum Superposition * Scientific Thinking"
- **Scientific Thinking trades number-crunching for physical insight**
  - Source: Practice Scientific Thinking | Brilliant. https://brilliant.org/courses/puzzle-science/
  - Quote: "In this course we'll dispense with number-crunching and mathematics in search of something more useful: physical insight."
- **Brilliant's Science Puzzles has heat flow, fluids and Pascal's paradox as single puzzles**
  - Source: Practice Science Puzzles | Brilliant. https://brilliant.org/courses/science-puzzles-long-set/
  - Quote: "Topics include: heat flow, light ray tracing, balancing mobiles, pulleys, electrical circuits, gear mechanisms, kinematics,"

My reading: Scientific Thinking has a Heat Flow level and Science Puzzles has "Which Feels Colder?", "This Is Pascal's
Paradox" and "Who Gets Their Tea Cooler?" as single puzzles. They are predict-then-find-out prompts, which is the shape
the app wants for conduction (why metal feels colder) and for liquid pressure (the container's shape does not matter).
Only the titles and topic lists were visible; the puzzles themselves are **UNCONFIRMED**.

### 1.4 What Brilliant does not have, and where its science sits
- **Brilliant has no named thermodynamics or fluids course in its science list; its science list is circuits, scientific thinking and mechanics**
  - Source: What courses are available in Brilliant for Educators? | Brilliant. https://brilliant.org/help/for-educators/what-courses-are-available-in-brilliant-for-educators
  - Quote: "Core topics: * Physics of the everyday * Classical mechanics and special relativity * Circuits and electricity * Scientific thinking and problem-solving * Science puzzles"
- **Brilliant's Science path is labelled foundational to advanced**
  - Source: What are Learning Paths? | Brilliant. https://brilliant.org/help/features/what-are-learning-paths
  - Quote: "Science |Foundational to advanced"
- **Brilliant is renaming courses, levels and lessons**
  - Source: What are Learning Paths? | Brilliant. https://brilliant.org/help/features/what-are-learning-paths
  - Quote: "We're updating names across Brilliant: courses are now topics, levels are units, and lessons are concepts."

My reading: Brilliant's path is Physics of the Everyday first ("We recommend starting your physics journey with
Physics of the Everyday", section 1.2), then Classical Mechanics, then Special Relativity. Nothing in it goes on to
pumps, pipes or engines. So there is no benchmark for flow, pump curves or the diesel cycle: for those the order comes
from the engineering sources in section 2. Brilliant lessons are small (33 lessons across a whole course; 3 lessons for
the pressure, buoyancy and gas ground), which supports eight lessons being a deep course for this ground, not a thin one.


---

## 2. Other courses' order for the same ground

Each entry is a chapter or lesson list in the source's own words. The courses split two ways: heat first, then fluids
(OpenStax, Khan, Isaac) or fluids first, then heat (Bird's Mechanical Engineering Principles starts Part Four with heat; the
Pocket Book and the 6th edition of Science and Mathematics for Engineering put pressure in fluids before heat). Dan's blurb
says "Temperature, heat and how it moves; gases and pressure; flow, pumps and the engines that turn heat into work", so
the brief's order of heat, gases, engines, then liquids, flow and pumps follows OpenStax's split (Volume 2 then Volume 1),
and it keeps the engine (part 4) before fluids, which the BTEC HN unit pair (13 then 11) also does.

### 2.1 Pearson BTEC National Engineering, Unit 1 Engineering Principles
- **Pearson BTEC National Engineering Unit 1 in brief: maths and physical science applied to electrical, electronic and mechanical problems**
  - Source: Specification - Pearson BTEC Level 3 National Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/btec-nat-eng-cert-spec.pdf
  - Quote: "Learners apply mathematical and physical science principles to solve electrical-, electronic- and mechanical-based engineering problems."
- **Unit 1 says its mechanical problems cover static, dynamic and fluid systems**
  - Source: Specification - Pearson BTEC Level 3 National Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/btec-nat-eng-cert-spec.pdf
  - Quote: "The mechanical problems you will encounter cover static, dynamic and fluid systems."
- **Unit 1 information booklet lists thermodynamic formulae: sensible heat, latent heat, enthalpy, linear expansivity**
  - Source: Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/Additional-sample-assessment-material-Unit-1-Engineering-Principles-Information-Booklet.pdf
  - Quote: "Thermodynamic principles Sensible heat _Q_ = _mc_ Δ _T_ Latent heat _Q_ = _ml_ Entropy and enthalpy _H_ = _U_ \+ _pV_ Linear expansivity"
- **Unit 1 fluid content D1: submerged surfaces, immersed bodies, Archimedes, tapering pipe, continuity**
  - Source: Specification - Pearson BTEC Level 3 National Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/btec-nat-eng-cert-spec.pdf
  - Quote: "submerged surfaces in fluid systems: o hydrostatic pressure and hydrostatic thrust on an immersed plane surface _F_ = ρ _gAx_ o centre of pressure of a rectangular retaining surface with one edge in the free surface of a liquid • immersed bodies: o Archimedes’ principle o determination of density using floatation methods o relative density UNIT 1: ENGINEERING PRINCIPLES Pearson BTEC Level 3 National Certificate in Engineering – Specification – Issue 6 – September 2022 © Pearson Education Limited 2022 32 • fluid flow in a gradually tapering pipe: o flow rate (volumetric and mass) o flow velocities (input and output) o input and output pipe diameters"
- **Unit 1 information booklet lists the fluid principles: continuity of flow and hydrostatic thrust**
  - Source: Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/Additional-sample-assessment-material-Unit-1-Engineering-Principles-Information-Booklet.pdf
  - Quote: "Fluid principles Continuity of volumetric flow _A_ 1 _v_ 1 = _A_ 2 _v_ 2 Continuity of mass flow ρ _A_ 1 _v_ 1 = ρ _A_ 2 _v_ 2 Hydrostatic thrust on an immersed plane surface"

My reading: Unit 1 is the hinge. On the public specification, its mechanical block "covers static, dynamic and fluid
systems", and for fluids it lists hydrostatic thrust on an immersed plane surface, Archimedes, density by flotation,
and continuity in a tapering pipe. The excerpts that came back showed no thermal or gas-law line in its essential content (the fetch returns
excerpts, not the whole file, so a thermal block elsewhere in the unit is **UNCONFIRMED**). The 2015 sample information booklet
does print formulae for sensible heat, latent heat, enthalpy and linear expansivity, so thermal questions may appear in the paper.

### 2.2 Bird: Science and Mathematics for Engineering; Mechanical Engineering Principles
- **Bird, Science and Mathematics for Engineering (6th ed): torque, pressure in fluids, heat energy and transfer, then thermal expansion, ideal gas laws, temperature measurement**
  - Source: Science and Mathematics for Engineering - 6th Edition - John Bird - Ro. https://www.routledge.com/Science-and-Mathematics-for-Engineering/Bird/p/book/9780367204747
  - Quote: "27. Torque 28. Pressure in fluids 29. Heat energy and transfer Revision Test 11: Torque, pressure in fluids, heat energy and transfer 30. Thermal expansion 31. Ideal gas laws 32. The measurement of temperature"
- **Bird, Mechanical Engineering Principles 4th ed: Part Four Heat Transfer and Fluid Mechanics**
  - Source: Mechanical Engineering Principles - 4th Edition - John Bird - Carl Ros. https://www.routledge.com/Mechanical-Engineering-Principles/Bird-Ross/p/book/9780367253240
  - Quote: "Part Four: Heat Transfer and Fluid Mechanics. 22. Heat energy and transfer. 24. Thermal expansion."
- **Bird, Mechanical Engineering Principles 4th ed (search excerpt): hydrostatics, fluid flow, ideal gas laws, measurement of temperature**
  - Source: Mechanical Engineering Principles - 4th Edition - John Bird - Carl Ros. https://www.routledge.com/Mechanical-Engineering-Principles/Bird-Ross/p/book/9780367253240
  - Quote: "Hydrostatics. 26\. Fluid flow. 27\. Ideal gas laws. 28\. The measurement of temperature."
- **Bird, author of the 6th edition, lectures at the Defence School of Marine Engineering, HMS Sultan**
  - Source: Science and Mathematics for Engineering - 6th Edition - John Bird - Ro. https://www.routledge.com/Science-and-Mathematics-for-Engineering/Bird/p/book/9780367204747
  - Quote: "is currently lecturing at the Defence School of Marine Engineering in the Defence College of Technical Training at H.M.S. Sultan"

My reading: Bird's Science and Mathematics for Engineering (6th ed., 2020) runs torque, pressure in fluids, heat
energy and transfer, thermal expansion, ideal gas laws, measurement of temperature, then electrical applications. Its
author is lecturing at the Defence School of Marine Engineering at HMS Sultan, per the Routledge page (quoted
above), so the book is in use around naval marine-engineering teaching; that does not show it is on Dan's own syllabus. The chapter titles are all I could read from official sources; the Newnes Pocket Book's fuller
contents (heat energy, expansion, temperature measurement, pressure in fluids, gas laws, fluids in motion, flow
measurement) is **UNCONFIRMED** from an official page: only a mirror of the PDF showed the list, and I dropped it.
Bird has no chapter on heat engines or pumps in these books; Mechanical Engineering Principles Part Four has heat
transfer and fluid mechanics only. The textbooks stop where an HNC unit begins.

### 2.3 Rogers and Mayhew; Eastop and McConkey
- **Rogers and Mayhew became the standard text and sold over a million copies (obituary)**
  - Source: Yon Mayhew: Scientist who co-wrote the seminal text on engineering thermodynamics and was hailed as an inspirational teacher | The Independent | The Independent. https://prod-mw.independent.co.uk/news/obituaries/yon-mayhew-scientist-who-cowrote-the-seminal-text-on-engineering-thermodynamics-and-was-hailed-as-an-inspirational-teacher-9025295.html (**SECONDARY**: a newspaper obituary)
  - Quote: "Published in 1957, it quickly became known as “Rogers and Mayhew”, and has gone on to sell more than a million copies, remarkable for a university text in a specialist subject. It remains the standard text on university engineering courses, and most practising mechanical engineers will have a copy on their shelves."

**UNCONFIRMED.** I could not see Rogers and Mayhew's or Eastop and McConkey's contents from an original page. The only
pages that carried them were Scribd uploads, which the checker rejects as copies, so I dropped the quotes. What I saw
before dropping them: Rogers and Mayhew is the standard thermodynamics text (obituary, above); Eastop and McConkey has
chapters on steam cycles, turbines, reciprocating compressors with clearance, multi-stage compression, and a refrigeration
chapter (14) that gives heat pumps more weight in the 5th edition. These are university-level and go well past what
Dan's foundations need. I would not build lessons from them, only point to them as where a marine course goes next.

### 2.4 Khan Academy
- **Khan Academy AP/College Physics 2 opens with Unit 1 Thermodynamics (gases, thermal energy, thermodynamic processes)**
  - Source: Thermodynamics | AP®︎/College Physics 2 | Science | Khan Academy. https://www.khanacademy.org/science/ap-physics-2/x0e2f5a2c:thermodynamics
  - Quote: "1. Calculations using the ideal gas equation 2. Kinetic molecular theory 3. RMS speed and average kinetic energy of gas molecules 4. Thermodynamics: Quiz 1 5. Understand: Thermal energy and equilibrium 6. Apply: Thermal energy and equilibrium 7. Understand: thermodynamics 8. Apply: thermodynamics 9. ... First law of thermodynamics: word problems 12. Thermodynamic processes 13. Thermodynamics: Quiz 3 14. Thermodynamics: Unit test"
- **Khan describes the unit: ideal gases, first law, PV diagrams, specific heat, conductivity, second law**
  - Source: Thermodynamics | AP®︎/College Physics 2 | Science | Khan Academy. https://www.khanacademy.org/science/ap-physics-2/x0e2f5a2c:thermodynamics
  - Quote: "Examine the properties of ideal gases. Describe mathematically what happens when a physical scenario changes, such as the consequences of heating or cooling a system. Use the first law of thermodynamics and PV diagrams to represent and analyze thermodynamic processes. Learn about thermal energy transfer, material properties such as specific heat and thermal conductivity, and the second law of thermodynamics."
- **Khan Academy keeps fluids in its MCAT course, not in the current AP Physics 2 unit list**
  - Source: Physics – TL;DR MCAT. https://tldrmcat.wordpress.com/content/physics (**SECONDARY**: a study-guide blog pointing at Khan)
  - Quote: "Fluids #### Content Review Khan Academy: * Fluids at Rest"

My reading: Khan's current physics courses have no fluids unit. AP/College Physics 2 opens with Unit 1
Thermodynamics (ideal gas calculations and kinetic theory, then thermal energy and equilibrium with specific heat and
thermal conductivity, then the first law and PV diagrams). Fluids sit only in its MCAT course ("Fluids at Rest").
The old "Physics archive" on Khan holds four units, none of them fluids. So Khan's order for this ground is gases, then
heat, then first law, which is the reverse of OpenStax's order (heat, gases, first law). Both end in the first law and
the PV diagram, which Dan has built the maths for (Calculus fundamentals lesson 9).

### 2.5 OpenStax University Physics
- **OpenStax University Physics Volume 1 chapter 14: density and pressure, measuring pressure, Pascal, Archimedes, fluid dynamics, Bernoulli, viscosity and turbulence**
  - Source: Ch. 14 Introduction - University Physics Volume 1 | OpenStax. https://openstax.org/books/university-physics-volume-1/pages/14-introduction
  - Quote: "14.1 Fluids, Density, and Pressure * 14.2 Measuring Pressure * 14.3 Pascal's Principle and Hydraulics * 14.4 Archimedes’ Principle and Buoyancy * 14.5 Fluid Dynamics * 14.6 Bernoulli’s Equation * 14.7 Viscosity and Turbulence"
- **OpenStax University Physics Volume 2 chapter 1: temperature, scales, expansion, specific heat, phase changes, heat transfer**
  - Source: Ch. 1 Introduction - University Physics Volume 2 | OpenStax. https://openstax.org/books/university-physics-volume-2/pages/1-introduction
  - Quote: "1.1 Temperature and Thermal Equilibrium * 1.2 Thermometers and Temperature Scales * 1.3 Thermal Expansion * 1.4 Heat Transfer, Specific Heat, and Calorimetry * 1.5 Phase Changes * 1.6 Mechanisms of Heat Transfer"
- **OpenStax University Physics Volume 2 chapters 1 to 4 are Unit 1 Thermodynamics**
  - Source: University Physics Volume 2. https://assets.openstax.org/oscms-prodcms/media/documents/university-physics-volume-2_-_WEB.pdf
  - Quote: "Chapter 1: Temperature and Heat Chapter 2: The Kinetic Theory of Gases Chapter 3: The First Law of Thermodynamics Chapter 4: The Second Law of Thermodynamics"

My reading: OpenStax is the most complete free order. Volume 2 chapter 1 is temperature and equilibrium, scales,
expansion, heat transfer with specific heat, phase changes, mechanisms of heat transfer (six sections), then kinetic
theory, first law (with processes, heat capacities, adiabatic) and the second law. Volume 1 chapter 14 is fluids:
density and pressure, measuring pressure, Pascal and hydraulics, Archimedes, fluid dynamics, Bernoulli, viscosity and
turbulence (seven sections). Together that is the same eight-part scope with no pump and no heat exchanger in it.

### 2.6 Isaac Physics (now Isaac Science)
- **Isaac gameboards on the Linking Concepts list include Temperature Scales, Gases, Specific Heat Capacity, Specific Latent Heat (SECONDARY, a tutor's page)**
  - Source: Isaac Physics. https://www.alevelphysicsonline.com/isaac-science (**SECONDARY**: a tutor's page listing Isaac gameboards)
  - Quote: "Temperature Scales Gases Specific Heat Capacity Specific Latent Heat and Capacity"
- **Isaac Science concept page: laws of thermodynamics, including the Carnot engine**
  - Source: Laws of Thermodynamics – Isaac Science. https://isaacscience.org/concepts/cc_laws_of_thermodynamics
  - Quote: "The second law of thermodynamics has many equivalent statements, among them being the flow of heat from hot to cold, the efficiency of thermal (Carnot) engines,"
- **Isaac: gas laws at GCSE, Boyle's law as the product of pressure and volume**
  - Source: Ideal Gases — Isaac Science. https://isaacscience.org/concepts/cc_ideal_gas
  - Quote: "Boyle's Law - The product of pressure and volume is constant for a fixed temperature."

My reading: Isaac has moved to isaacscience.org ("Isaac Science is the new home of Isaac Physics"). I could read only its
concept pages (ideal gases, laws of thermodynamics) and a tutor's list of gameboard titles (temperature scales, gases,
specific heat capacity, specific latent heat). Isaac's value to the brief is its A Level wording of the gas laws and
the second law's "efficiency of thermal (Carnot) engines". The full Isaac topic tree was not reachable: **UNCONFIRMED**.

### 2.7 Pearson BTEC Higher Nationals in Engineering
- **Pearson BTEC HN Unit 11 Fluid Mechanics content: Pascal, manometers, hydraulics**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf (**SECONDARY**: a college copy of Pearson's HN specification, issue 5, October 2017)
  - Quote: "How Pascal’s laws define hydrostatic pressure Pressure with the use of manometers Transmission of force in hydraulic devices"
- **HN Unit 11 flow content: Bernoulli, Reynolds, pipelines, head losses**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf (**SECONDARY**: a college copy of Pearson's HN specification, issue 5, October 2017)
  - Quote: "Energy present within a flowing fluid and the formulation of Bernoulli’s Equation Classification of fluid flow using Reynolds numbers Calculations of flow within pipelines Head losses that occur within a fluid flowing in a pipeline"
- **HN Unit 11 flow measuring devices and pumps**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf (**SECONDARY**: a college copy of Pearson's HN specification, issue 5, October 2017)
  - Quote: "Flow measuring devices and their operating principles LO4 Explore the operating principles and efficiencies of hydraulic machines _Hydraulic machinery:_ Operating principles of different types of water turbine Reciprocating and centrifugal pump theory"
- **HN Unit 13 Fundamentals of Thermodynamics and Heat Engines: first law, gas laws, pV diagrams**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf (**SECONDARY**: a college copy of Pearson's HN specification, issue 5, October 2017)
  - Quote: "Forms of energy and basic definitions Definitions of systems (open and closed) and surroundings First law of thermodynamics The gas laws: Charles’ Law, Boyle’s Law, general gas law and the Characteristic Gas Equation The importance and applications of pressure/volume diagrams and the concept of work done"
- **HN Unit 13 heat transfer: lagging, heat exchangers**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf (**SECONDARY**: a college copy of Pearson's HN specification, issue 5, October 2017)
  - Quote: "Heat losses in thick and thin walled pipes, optimum lagging thickness"
- **HN Unit 64 Thermofluids: pump types, friction factors, Moody, Darcy**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf (**SECONDARY**: a college copy of Pearson's HN specification, issue 5, October 2017)
  - Quote: "Characteristics of fluid flow: laminar and turbulent flow, Reynolds number Friction factors: relative roughness of pipe, use of Moody diagrams Head losses across various industrial pipe fittings and valves, use of Bernoulli’s Equation and Darcy’s Formula"
- **HN 2024 Engineering Science (Unit 4003): fluid and thermodynamic content**
  - Source: Unit 4003: Engineering Science I - UniCourse. https://unicourse.org/wp-content/uploads/2024/06/Engineering-Science.pdf (**SECONDARY**: a provider copy of Pearson's HN unit descriptors, 2024)
  - Quote: "Fluid definition and properties Definition of pressure, hydrostatic pressure, and basic equations, manometry, application and calculations, Archimedes’ principle Flow characteristics and definitions, introduction to ideal fluid flow Continuity of volume and mass flow for an incompressible fluid Bernoulli’s equation"
- **HN 2024 Engineering Science (Unit 4003): thermodynamics list**
  - Source: Unit 4003: Engineering Science I - UniCourse. https://unicourse.org/wp-content/uploads/2024/06/Engineering-Science.pdf (**SECONDARY**: a provider copy of Pearson's HN unit descriptors, 2024)
  - Quote: "Thermodynamic properties, temperature, the zeroth law"

My reading: the HN specification is the best public statement of where a marine engineering course goes. Unit 11
Fluid Mechanics goes pressure and force (Pascal, manometers, hydraulic force), submerged surfaces, viscosity, then
dynamic flow (Bernoulli, Reynolds, pipelines, head loss, flow measuring devices), then hydraulic machines (turbines and
pumps, "Calculate the input power requirements of centrifugal pumps"). Unit 13 Thermodynamics and Heat Engines goes
forms of energy, the first law, the gas laws, pV diagrams and work, then the steady flow energy equation for plant,
heat transfer (lagging, heat exchangers), and IC engine performance. Unit 64 Thermofluids adds friction factors, Moody
diagrams and Darcy's formula. Those three are the targets that Dan's foundations should make easy. The 2024 HN
Engineering Science unit (4003) pairs fluids and thermodynamics in one list. Both copies I could read are on provider
sites (marked SECONDARY); Pearson's own file at hnglobal returned the General Engineering specification, not this one.


---

## 3. What a Level 3 marine engineering course and an engineering HNC actually use

Dan is Royal Navy, so the MCA (Merchant Navy) syllabus is not his route. It is the closest public statement of what a
marine engineering course examines, which is why it is used here. Nothing from it is claimed as how the Navy does
anything. The public apprenticeship standards that name this ground are general: there is no standard called "marine
engineering technician" on the register that I could reach. What exists is Engineering technician (ST0457, which lists
Maritime Engineering among its job titles), Marine engineer (ST0364, boats, retired December 2023) and Maritime
mechanical and electrical mechanic (ST0276). Each is quoted for the general line only; the text of ST0276 itself mentions
ships and submarines, and this course uses none of that.

### 3.1 Apprenticeship standards on the public register
- **Engineering technician standard (ST0457): knowledge of general mathematical and scientific principles**
  - Source: Engineering technician / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0457
  - Quote: "understanding of general engineering/manufacturing mathematical and scientific principles, methods, techniques, graphical expressions, symbols formulae and calculations used by engineering technicians"
- **ST0457: the systems technicians work on include mechanical, electrical and fluid power**
  - Source: Engineering technician / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0457
  - Quote: "Engineered and manufactured products and systems that Engineering Technicians work on could involve mechanical, electrical, electronic, electromechanical and fluid power components/systems."
- **ST0364 Marine engineer (retired 2023; boats): knowledge of materials in their environment and of the mathematics behind marine engineering**
  - Source: Marine engineer / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0364-v1-0
  - Quote: "Characteristics and reaction of materials to their environment: temperature, humidity, pressure * Mathematical techniques, formula, and calculations that underpin marine engineering"
- **ST0364: engines and ancillary systems knowledge**
  - Source: Marine engineer / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0364-v1-0
  - Quote: "Principles of 2 and 4 stroke petrol and diesel engines and their operation + Principles of boat ancillary systems - propulsion + How marine engineering systems relate to each other"
- **Maritime mechanical and electrical mechanic standard (ST0276): testing, fault diagnosis and maintenance of electrical, mechanical and fluid power equipment (the standard's own text names ships and submarines; the course uses none of it)**
  - Source: Maritime mechanical and electrical mechanic / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0276-v1-1
  - Quote: "Maritime mechanical and electrical mechanics work from engineering drawings, data and documentation in order to undertake the testing, fault diagnosis and maintenance of electrical, mechanical and fluid power equipment"
- **No 'marine engineering technician' standard was found on the Institute site; the Technicians site describes the role**
  - Source: What is a Marine Engineering Technician? | Technicians. https://www.technicians.org.uk/roles/marine-engineering-technician/ (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "A Marine Engineering Technician attends to boats, from yachts to cargo ships, to keep them seaworthy"

My reading: the register asks for "mathematical and scientific principles" and "fluid power" knowledge in general
terms, and ST0364 asks for how "materials ... react to temperature, humidity, pressure" and for engines and ancillary
systems. None of the three gives topic lines for heat or fluids beyond the words "fluid power". The exam-board and MCA syllabuses below do. For Dan's
path I have no syllabus for the Navy courses (CLAUDE.md), so the choice of HN Units 11 and 13 and the MCA Applied
Heat and Applied Mechanics hydro sections as the target is **a guess**, said so.

### 3.2 BTEC National Unit 1: what it says it is for
- **Pearson BTEC National Unit 1 gives a foundation for any engineering technician role, apprenticeship or higher education**
  - Source: Specification - Pearson BTEC Level 3 National Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/btec-nat-eng-cert-spec.pdf
  - Quote: "It sits at the heart of the qualification and gives you a foundation to support you in any engineering technician role, an engineering apprenticeship or in higher education."
- **Unit 1 AO3: understanding of electrical, electronic and mechanical principles**
  - Source: Specification - Pearson BTEC Level 3 National Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/btec-nat-eng-cert-spec.pdf
  - Quote: "AO3 Demonstrate an understanding of electrical, electronic and mechanical principles to solve engineering problems"

My reading: Pearson says Unit 1 "gives you a foundation to support you in any engineering technician role, an engineering
apprenticeship or in higher education". That matches Dan's own words (CLAUDE.md): "foundational skills that can see me
through any new topics". It is the same pitch for this course.

### 3.3 BTEC HN units that cover this ground
- **HN Unit 11 Fluid Mechanics: fluid mechanics matters to engineers who do not work directly with fluid systems**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf (**SECONDARY**: a college copy of Pearson's HN specification, issue 5, October 2017)
  - Quote: "Fluid mechanics is an important subject to engineers of many disciplines, not just those working directly with fluid systems."
- **HN Unit 13: what a learner can do after it**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf (**SECONDARY**: a college copy of Pearson's HN specification, issue 5, October 2017)
  - Quote: "On successful completion of this unit students will be able to investigate fundamental thermodynamic systems and their properties, apply the steady flow energy equation to plant equipment, examine the principles of heat transfer to industrial applications, and determine the performance of internal combustion engines."
- **HN Unit 11: operating characteristics of hydraulic machines, centrifugal pumps**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf (**SECONDARY**: a college copy of Pearson's HN specification, issue 5, October 2017)
  - Quote: "Calculate the input power requirements of centrifugal pumps."
- **HN Unit 64 Thermofluids: head losses across fittings, Bernoulli and Darcy**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf (**SECONDARY**: a college copy of Pearson's HN specification, issue 5, October 2017)
  - Quote: "Head losses across various industrial pipe fittings and valves, use of Bernoulli’s Equation and Darcy’s Formula"

My reading: an HN student in these units is asked to calculate, not just to explain: input power of a centrifugal pump,
head loss in a pipeline, heat transfer formulae for heat exchangers. The skills to get Dan to are the arithmetic and the
reading of curves, with the idea of each behind it.

### 3.4 MCA engineer officer syllabus lines
- **MCA Applied Heat syllabus: thermodynamic systems and the first law**
  - Source: Applied Heat Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-heat-written-examination-syllabus
  - Quote: "States the conservation of energy in thermodynamic terms and identifies it as the First Law of Thermodynamics."
- **MCA Applied Heat: Boyle, Charles and the combination law**
  - Source: Applied Heat Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-heat-written-examination-syllabus
  - Quote: "Recalls Boyle’s and Charles’ Law and the combination law. 2. Recalls the Equation of State."
- **MCA Applied Heat: the Carnot cycle and its efficiency**
  - Source: Applied Heat Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-heat-written-examination-syllabus
  - Quote: "Describes the Carnot Cycle with reference to a heat engine. 3. Derives the thermal efficiency of a Carnot Cycle."
- **MCA Applied Heat: the ideal engine cycles, including the Diesel**
  - Source: Applied Heat Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-heat-written-examination-syllabus
  - Quote: "Describe the ideal ie. engine cycles, Otto, Diesel, Dual Combustion and Joule"
- **MCA Applied Heat: the distribution of energy in an engine and a heat balance**
  - Source: Applied Heat Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-heat-written-examination-syllabus
  - Quote: "Determines the distribution of energy in an engine and produces a heat balance account."
- **MCA Applied Heat: conduction by Fourier's law and lagged pipes**
  - Source: Applied Heat Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-heat-written-examination-syllabus
  - Quote: "States Fourier’s Law for conductive heat transfer. 2. Applies 7.1.1 to single flat plate and composite flat plate and derives an expression for conductive heat transfer through composite flat plates."
- **MCA Applied Heat: lagged pipes and heat exchangers by log mean temperature difference**
  - Source: Applied Heat Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-heat-written-examination-syllabus
  - Quote: "Relates 7.1.3 to single and double lagged pipes, spheres and hemispherical ends of cylinders."
- **MCA Applied Heat: heat exchangers with log mean temperature difference**
  - Source: Applied Heat Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-heat-written-examination-syllabus
  - Quote: "Solves problems involving heat exchangers using “log mean temp difference”."
- **MCA Applied Heat: heat transfer during compression and interstage cooling**
  - Source: Applied Heat Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-heat-written-examination-syllabus
  - Quote: "Discusses heat transfer during compression and interstage cooling."
- **MCA Applied Heat also holds steam, nozzles and turbines (sections 8 and 9), which are the Navy course's ground and are left out here**
  - Source: Applied Heat Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-heat-written-examination-syllabus
  - Quote: "8. Properties of Steam and Steam Cycles 9. 9. Nozzles and Steam Turbines"
- **MCA General Engineering Science B (EOOW): heat and temperature, gas laws, energy balance**
  - Source: MCA General Engineering Science B Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/mca-general-engineering-science-b-written-examination-syllabuses
  - Quote: "Differentiate between heat and temperature. 3. Describe heat transfer between different media and methods of improving and/or reducing heat transfer."
- **MCA GES B: gas laws and the steady flow energy equation**
  - Source: MCA General Engineering Science B Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/mca-general-engineering-science-b-written-examination-syllabuses
  - Quote: "Solve problems involving the gas laws. 9. Solve problems involving the steady flow energy equation."
- **MCA GES B: engine energy balance with cooling water and exhaust losses**
  - Source: MCA General Engineering Science B Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/mca-general-engineering-science-b-written-examination-syllabuses
  - Quote: "Solve problems to determine the energy balance of an engine involving: Indicated Power; Brake Power; Friction Power; Brake Thermal Efficiency; Friction losses; Cooling Water losses; Exhaust losses."
- **MCA GES B hydrostatics: pressure at depth by the formula rho g h**
  - Source: MCA General Engineering Science B Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/mca-general-engineering-science-b-written-examination-syllabuses
  - Quote: "Solve problems involving the use of formula ρgh to establish pressure at a specified depth."
- **MCA GES B hydrostatics: Archimedes applied to floating rectangular vessels**
  - Source: MCA General Engineering Science B Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/mca-general-engineering-science-b-written-examination-syllabuses
  - Quote: "Solve problems applying the Principles of Archimedes to floating rectangular shaped vessels."
- **MCA Applied Mechanics: pressure ρgh, manometers, barometer**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Derives the expression: Pressure pgh. 2. Describes the principle of: U-Tube manometers; inclined manometer; and mercury barometer."
- **MCA Applied Mechanics hydrodynamics: continuity and the sharp-edged orifice**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Derives the continuity equation in terms of both volume and mass. 2. Applies 8.1.1 above to the flow of liquid through parallel pipes. 3. Explains the concepts of: C v , C c and C d for a sharp edge orifice."
- **MCA Engineering Knowledge (Chief Engineer): operation, testing and maintenance of fire pumps and pumping systems**
  - Source: Engineering Knowledge Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/engineering-knowledge-written-examination-syllabus
  - Quote: "Principles of the operation, testing and maintenance of fire pumps and associated pumping systems."
- **SQA HND Marine Engineering gives MCA exemptions in Applied Mechanics and Applied Heat**
  - Source: HNC/HND Marine Engineering - Qualifications Scotland. https://www.sqa.org.uk/sqa/79333.html
  - Quote: "The HND will give exemptions for the STCW Management Level Engineer in the following subjects: Mathematics; Applied Mechanics; Applied Heat; Engineering Drawing; Electro-Technology;"
- **MCA's modernised EOOW syllabus: new Operational level Engineering Knowledge assessment from August 2025**
  - Source: MIN 720 (M) Amendment 1 - Transforming seafarer training: the UK’s modernised officer qualifications syllabus. https://assets.publishing.service.gov.uk/media/6ac636e0b016250bca01396d/min-720-amendment-1-transforming-seafarer-training-the-uks-modernised-officer-qualifications-syllabus.pdf
  - Quote: "From August 2025: all new EOOW Cadet starters will follow the modernised syllabus and must pass: • the MCA Digital Assessment: Engineering Knowledge – General – Operational Level STCW Reg."
- **MCA lists Applied Mechanics and Applied Heat among the Second and Chief Engineer academic subjects (UK statutory instrument text)**
  - Source: The Merchant Shipping (Standards of Training, Certification and Watchkeeping) Regulations 2015. https://www.legislation.gov.uk/uksi/2015/782/pdfs/uksiod_20150782_en.pdf
  - Quote: "The SQA Second Engineer and Chief Engineer Officer academic examinations are currently: **Second Chief Engineer: Applied Mechanics, Applied Heat, Electro-Technology and Naval Architecture."
- **MCA lets candidates sit the SQA written Engineering Knowledge exams until April 2028 at the college's discretion**
  - Source: M-Notice template. https://assets.publishing.service.gov.uk/media/6a9fef5e92e72b8ac437ef04/MIN_720_Transforming_Seafarer_Training_-_The_UKs_Modernised_Officer_Qualifications_Syllabus_-_Final__Proofing_changes_April_2026___1_.pdf
  - Quote: "Alternatively, up until April 2028, they may complete the SQA Written Examinations for Engineering Knowledge at the college's discretion."

My reading, for the merchant route as a reference: Applied Heat (Management level) has ten sections: thermodynamic
systems, thermodynamic processes, heat engine cycles, IC engine performance, reciprocating air compressors, combustion,
heat transfer, steam and steam cycles, nozzles and steam turbines, refrigeration. Sections 8 and 9 (steam, nozzles,
turbines) and combustion, refrigeration and the practical entropy work are the marine engineering course's ground and
are **deferred, not built here**. Sections 1 to 3, 4.1.4 (the heat balance), 5 (compressors, in outline) and 7 (heat
transfer, lagged pipes, heat exchangers) are what this course can prepare Dan for. The EOOW paper General Engineering
Science B (thermodynamics and hydrostatics) is the smaller, closer match: it asks to "differentiate between heat and
temperature", "solve problems involving the gas laws", the engine energy balance with cooling water and exhaust losses,
pressure by ρgh, and Archimedes for floating rectangular vessels. Applied Mechanics hydrodynamics stops at continuity
and the sharp-edged orifice; pumps appear in the Engineering Knowledge paper as "operation, testing and maintenance",
not as calculation. The MCA is moving to digital Engineering Knowledge assessments from August 2025 (MIN 720), so these
lines will move; the notice lets candidates sit the SQA written Engineering Knowledge exams "up until April 2028".

### 3.5 Dan's BTEC Level 3 Diploma in Advanced Manufacturing Engineering (Development Technical Knowledge)
- **Dan's BTEC L3 Diploma: Unit 8 Mechanical Principles of Engineering Systems ends with heat transfer, gases and liquids**
  - Source: BTEC L3 Advanced Manufacturing Engineering Unit Specification. https://qualifications.pearson.com/content/dam/pdf/BTEC-Specialist-Qualifications/advanced-manufacturing-engineering-development-technical-knowledge/2016/specification/adv-man-eng-unit-spec.pdf
  - Quote: "Finally, they will deal with the effects of heat transfer, the expansion and compression of gases and the characteristic behaviour of liquids at rest and in motion."
- **Unit 8 learning outcomes 3 and 4: fluid systems and thermodynamic systems**
  - Source: BTEC L3 Advanced Manufacturing Engineering Unit Specification. https://qualifications.pearson.com/content/dam/pdf/BTEC-Specialist-Qualifications/advanced-manufacturing-engineering-development-technical-knowledge/2016/specification/adv-man-eng-unit-spec.pdf
  - Quote: "3 Be able to determine the parameters of fluid systems 4 Be able to determine the effects of energy transfer in thermodynamic systems."
- **Unit 8 fluid content: immersed bodies and Archimedes, density by flotation**
  - Source: BTEC L3 Advanced Manufacturing Engineering Unit Specification. https://qualifications.pearson.com/content/dam/pdf/BTEC-Specialist-Qualifications/advanced-manufacturing-engineering-development-technical-knowledge/2016/specification/adv-man-eng-unit-spec.pdf
  - Quote: "Archimedes’ principle; fluid, e.g. liquid, gas; immersion of a body, e.g. fully immersed, partly immersed; determination of density, e.g. using floatation, specific gravity bottle"
- **Unit 8 fluid content: a gradually tapering pipe and continuity**
  - Source: BTEC L3 Advanced Manufacturing Engineering Unit Specification. https://qualifications.pearson.com/content/dam/pdf/BTEC-Specialist-Qualifications/advanced-manufacturing-engineering-development-technical-knowledge/2016/specification/adv-man-eng-unit-spec.pdf
  - Quote: "volume flow rate, mass flow rate, input and output flow velocities, input and output diameters, continuity of volume and mass for incompressible fluid"
- **Unit 8 heat transfer content: specific heat, latent heat, linear expansivity, heat exchangers**
  - Source: BTEC L3 Advanced Manufacturing Engineering Unit Specification. https://qualifications.pearson.com/content/dam/pdf/BTEC-Specialist-Qualifications/advanced-manufacturing-engineering-development-technical-knowledge/2016/specification/adv-man-eng-unit-spec.pdf
  - Quote: "heat transfer parameters, e.g. temperature, pressure, mass, linear dimensions, time, specific heat capacity, specific latent heat of fusion, specific latent heat of vaporisation, linear expansivity; phase, e.g. solid, liquid, gas; heat transfer principles, e.g. sensible and latent heat transfer, thermal efficiency and power rating of heat exchangers; linear expansion"
- **Unit 8 P8: dimensional change, and heat for a change of temperature and phase**
  - Source: BTEC L3 Advanced Manufacturing Engineering Unit Specification. https://qualifications.pearson.com/content/dam/pdf/BTEC-Specialist-Qualifications/advanced-manufacturing-engineering-development-technical-knowledge/2016/specification/adv-man-eng-unit-spec.pdf
  - Quote: "calculate the dimensional change when a solid material undergoes a change in temperature and the heat transfer that accompanies a change of temperature and phase"
- **Unit 8 M4: thermal efficiency of a heat transfer process from flow rate, temperature change and input power**
  - Source: BTEC L3 Advanced Manufacturing Engineering Unit Specification. https://qualifications.pearson.com/content/dam/pdf/BTEC-Specialist-Qualifications/advanced-manufacturing-engineering-development-technical-knowledge/2016/specification/adv-man-eng-unit-spec.pdf
  - Quote: "determine the thermal efficiency of a heat transfer process from given values of flow rate, temperature change and input power"
- **Unit 8 P9: thermodynamic process equations for a perfect gas**
  - Source: BTEC L3 Advanced Manufacturing Engineering Unit Specification. https://qualifications.pearson.com/content/dam/pdf/BTEC-Specialist-Qualifications/advanced-manufacturing-engineering-development-technical-knowledge/2016/specification/adv-man-eng-unit-spec.pdf
  - Quote: "solve two or more problems that require application of thermodynamic process equations for a perfect gas to determine the unknown parameters of the problems."
- **Unit 8 P7 and M3: continuity in a tapering pipe; upthrust on an immersed body**
  - Source: BTEC L3 Advanced Manufacturing Engineering Unit Specification. https://qualifications.pearson.com/content/dam/pdf/BTEC-Specialist-Qualifications/advanced-manufacturing-engineering-development-technical-knowledge/2016/specification/adv-man-eng-unit-spec.pdf
  - Quote: "use the continuity of volume and mass flow for an incompressible fluid to determine the design characteristics of a gradually tapering pipe"
- **Unit 8 M3: upthrust by Archimedes**
  - Source: BTEC L3 Advanced Manufacturing Engineering Unit Specification. https://qualifications.pearson.com/content/dam/pdf/BTEC-Specialist-Qualifications/advanced-manufacturing-engineering-development-technical-knowledge/2016/specification/adv-man-eng-unit-spec.pdf
  - Quote: "determine the upthrust on an immersed body"
- **Unit 11 fluid power principles: gas laws, Bernoulli, receiver volume, Pascal's law**
  - Source: BTEC L3 Advanced Manufacturing Engineering Unit Specification. https://qualifications.pearson.com/content/dam/pdf/BTEC-Specialist-Qualifications/advanced-manufacturing-engineering-development-technical-knowledge/2016/specification/adv-man-eng-unit-spec.pdf
  - Quote: "Fluid power principles_ : properties and behaviour of air and hydraulic fluids; gas laws, e.g. Boyle’s, Charles’, Gay-Lussac’s, general gas, dew point; fluid flow, e.g. Bernoulli’s principle, volumetric rate, receiver volume, actuator flow requirements; fluid pressure, e.g. units of measurement, Pascal’s law, inlet and outlet pressure, pressure drop, actuator efficiency, clamping force"
- **Unit 11 formulae: absolute pressure is gauge plus atmospheric; force is pressure times area**
  - Source: BTEC L3 Advanced Manufacturing Engineering Unit Specification. https://qualifications.pearson.com/content/dam/pdf/BTEC-Specialist-Qualifications/advanced-manufacturing-engineering-development-technical-knowledge/2016/specification/adv-man-eng-unit-spec.pdf
  - Quote: "absolute pressure = gauge + atmospheric pressure, force = pressure × area"
- **Unit 66 Fluid Mechanics: fluid flow in piped systems and flow measurement**
  - Source: BTEC L3 Advanced Manufacturing Engineering Unit Specification. https://qualifications.pearson.com/content/dam/pdf/BTEC-Specialist-Qualifications/advanced-manufacturing-engineering-development-technical-knowledge/2016/specification/adv-man-eng-unit-spec.pdf
  - Quote: "Learners will be introduced to fluid flow in piped systems and to the measurement of flow velocities, pressures and energy, using a variety of measuring instruments."
- **Unit 66 content: venturi meter, orifice meter, manometer, Pitot-static tube**
  - Source: BTEC L3 Advanced Manufacturing Engineering Unit Specification. https://qualifications.pearson.com/content/dam/pdf/BTEC-Specialist-Qualifications/advanced-manufacturing-engineering-development-technical-knowledge/2016/specification/adv-man-eng-unit-spec.pdf
  - Quote: "measuring instruments (such as Venturi Meter, orifice meter, manometer, Pitot-static tube"
- **Unit 70 Applications of Thermodynamic Principles: expansion and compression of gases, work and thermal energy transfer**
  - Source: BTEC L3 Advanced Manufacturing Engineering Unit Specification. https://qualifications.pearson.com/content/dam/pdf/BTEC-Specialist-Qualifications/advanced-manufacturing-engineering-development-technical-knowledge/2016/specification/adv-man-eng-unit-spec.pdf
  - Quote: "The basic laws concerned with the expansion and compression of gases and associated thermal energy transfer and work done will be introduced."
- **Unit 5 Calculus lists charge and discharge of an air receiver and heat flow as rates of change**
  - Source: BTEC L3 Advanced Manufacturing Engineering Unit Specification. https://qualifications.pearson.com/content/dam/pdf/BTEC-Specialist-Qualifications/advanced-manufacturing-engineering-development-technical-knowledge/2016/specification/adv-man-eng-unit-spec.pdf
  - Quote: "Engineering examples of rates of change, e.g. velocity/acceleration of a moving object, rate of charge/discharge of a capacitor, heat flow, radioactive decay, cutting tool life, charge/discharge rate for an air receiver, hydraulic flow rates."
- **A BTEC Level 3 Diploma in this qualification lists Mechanical Principles of Engineering Systems among its units (a college's list)**
  - Source: Mechanical Engineering BTEC Level 3 Diploma – BBD1000 – 2026 | The Bedford College Group. https://bedfordcollegegroup.ac.uk/courses/mechanical-engineering-btec-level-3-diploma-bbd1000 (**SECONDARY**: a college course page)
  - Quote: "Health & Safety in the Engineering Workplace * Communications for Engineering Technicians * Mathematics for Engineering Technicians * Mechanical Principles of Engineering Systems * Properties & Applications of Engineering Materials * Engineering Drawing for Technicians * Electro-Pneumatic and Hydraulic Systems and Devices * Engineering Project * Applications of Mechanical Systems in Engineering"
- **Tecol: Unit A8 Mechanical Principles of Engineering Systems is one of the core units of the 12-unit diploma (SECONDARY, a provider)**
  - Source: BTEC Level 3 Diploma in Mechanical Engineering (12-unit). https://tecol.co.uk/diploma/btec-level-3-diploma-in-mechanical-engineering-12-unit (**SECONDARY**: a distance-learning provider)
  - Quote: "The 5 core units are:"

My reading: Unit 8 of Dan's qualification (if he did it) already covers, in its own words: heat transfer
parameters (specific heat capacity, specific latent heat of fusion and vaporisation, linear expansivity) and "sensible and
latent heat transfer, thermal efficiency and power rating of heat exchangers"; thermodynamic process equations with
absolute temperature and pressure, Boyle, Charles and the general gas equation; hydrostatic thrust F = ρgAx and centre
of pressure; Archimedes and density by flotation; continuity in a gradually tapering pipe. So the course should move
quickly through: sensible and latent heat sums, the gas laws as formulas, Archimedes' upthrust, and continuity A1v1 =
A2v2. It should spend its lessons on what Unit 8 does not give him: why heat moves the way it does and how to model a
warming cable or motor with Newton's cooling; absolute and gauge pressure as a trap; the first law and the work a gas
does (the pV-area Calculus fundamentals lesson 9 built); the Carnot limit and where a diesel's heat goes; Bernoulli (only
in Units 11 and 66 of the same specification, which may not have been his); flow measurement; pipe friction; and pumps. Unit 11 (Electro-pneumatic and hydraulic)
already gives him, if he met it, "absolute pressure = gauge + atmospheric pressure", Pascal's law and the receiver volume.
**UNCONFIRMED:** whether Dan's diploma included Unit 8, 11, 66 or 70. The qualification's mandatory units are not
shown on the Pearson unit specification I read; two provider pages list Mechanical Principles of Engineering Systems
among the units (Tecol calls it a core unit A8). The specification quoted is issue 8 (February 2026), so the wording he met
may differ in detail. The brief should say "if you met these" and keep the check short.


---

## 4. The scope, part by part

Each part gives what the sources say about teaching it and the numbers a lesson may cite. Numbers a lesson may use as
constants: water 4,200 J per kg per degree (Bitesize); heat of fusion 334 and vaporisation 2,260 J/g (University of Texas
table); seawater density about 1025 kg/m3 (Scripps/UCSD notes); dry-air gas constant 287 J/(kg K) and air's ratio of
specific heats 1.4 (FAO annex, NASA). Every other number in a lesson should be a control or computed from a shown rule.

### 4.1 Part 1: temperature and heat
- **A kelvin step equals a Celsius step, but the zero is absolute zero (SECONDARY, revision notes)**
  - Source: Notes - Topic 5.1 Thermal Physics - OCR (A) Physics A-level. https://pmt.physicsandmathstutor.com/download/Physics/A-level/Notes/OCR-A/5-Newtonian-World-and-Astrophysics/Detailed/5.1.%20Thermal%20Physics.pdf (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "A temperature increase of 1 kelvin is equal to an increase of 1 Celsius, but the 0 point is absolute 0"
- **A kelvin difference equals a Celsius difference, and Celsius is not absolute**
  - Source: Thermodynamic Temperature Scale (Kelvin) | A Level Physics. https://www.miniphysics.com/thermodynamic-temperature-scale.html (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "Because it is a pure shift, a temperature difference of 1°C is the same size as a difference of 1 K"
- **Celsius is not an absolute scale**
  - Source: Thermodynamic Temperature Scale (Kelvin) | A Level Physics. https://www.miniphysics.com/thermodynamic-temperature-scale.html (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "Treating Celsius as an absolute scale (it is not: 0°C is not “no thermal energy”)."
- **Heat is energy transferred because of a temperature difference**
  - Source: 1.4 Heat Transfer, Specific Heat, and Calorimetry - University Physics Volume 2 | OpenStax. https://openstax.org/books/university-physics-volume-2/pages/1-4-heat-transfer-specific-heat-and-calorimetry
  - Quote: "Heat is a type of energy transfer that is caused by a temperature difference, and it can change the temperature of an object."
- **Adding internal energy does not always raise the temperature (phase change)**
  - Source: 1.4 Heat Transfer, Specific Heat, and Calorimetry - University Physics Volume 2 | OpenStax. https://openstax.org/books/university-physics-volume-2/pages/1-4-heat-transfer-specific-heat-and-calorimetry
  - Quote: "Incidentally, increasing the internal energy of a system does not necessarily increase its temperature."
- **Latent heat is energy that changes the phase without changing the temperature**
  - Source: 11.3 Phase Change and Latent Heat - Physics | OpenStax. https://openstax.org/books/physics/pages/11-3-phase-change-and-latent-heat
  - Quote: "Because this energy enters or leaves a system during a phase change without causing a temperature change in the system, it is known as latent heat"
- **Specific heat capacity of water is 4,200 J per kg per degree**
  - Source: Specific heat capacity - Temperature changes and energy - Edexcel - GCSE Physics (Single Science) Revision - Edexcel - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zpjpgdm/revision/4
  - Quote: "The specific heat capacity of water is 4,200 joules per kilogram per degree Celsius (J/kg°C). This means that it takes 4,200 J to raise the temperature of 1 kg of water by 1°C."
- **Energy to change temperature depends on mass, substance and the temperature change**
  - Source: Specific heat capacity - Energy and heating - AQA - GCSE Physics (Single Science) Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z2gjtv4/revision/5
  - Quote: "The amount of energy needed depends on: * the mass of the material * the substance of the material ( specific heat capacity ) * the desired temperature change"
- **Heat transfer Bitesize: temperature and heat are not the same thing**
  - Source: Heat transfer - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zh63ydm
  - Quote: "Temperature and heat are not the same thing because:"
- **Internal energy and temperature are very different things (Bitesize AQA)**
  - Source: Energy and temperature - Temperature change and energy - AQA - GCSE Combined Science Revision - AQA Trilogy - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zwwfxfr/revision/3
  - Quote: "Internal energy is linked to the temperature of matter but the two are very different things:"
- **Cited constant: heat of fusion of water 334 J/g and of vaporisation 2260 J/g (University of Texas data table)**
  - Source: Heat of Fusion and Vaporization. https://gchem.cm.utexas.edu/data/section2.php?target=heat-transition.php
  - Quote: "|water |334 |2260 |"
- **Cited constant: seawater density about 1025 kg/m3 and specific heat about 3850 J/(kg C)**
  - Source: Properties of seawater. https://talleylab.ucsd.edu/sio210/lect_2/lecture_2.html
  - Quote: "The density of seawater is about 1025 kg/m^3 and the specific heat is about 3850 J/(kg C)."

My reading: the sources agree on the order: temperature and thermal equilibrium, scales (kelvin, absolute zero), specific heat
capacity (Q = mcΔT), phase change and latent heat. The trap in the research is heat versus temperature (section 6.1). Heating
water to steam is a clean test of latent heat: energy goes in and the temperature does not change. Absolute zero as the zero of
the gas laws is the link to part 3. The EOOW syllabus (General Engineering Science B) asks the learner to "differentiate between heat and
temperature", so the distinction is examined, not just taught.

### 4.2 Part 2: heat transfer, Newton's cooling, exchangers
- **Convection is heat transfer by the movement of a fluid**
  - Source: 11.2 Heat, Specific Heat, and Heat Transfer - Physics | OpenStax. https://openstax.org/books/physics/pages/11-2-heat-specific-heat-and-heat-transfer
  - Quote: "Convection is heat transfer by the movement of a fluid."
- **Thermal resistance (R-value) is a material's ability to resist heat flow**
  - Source: The Science of Insulation Explained | Knauf Insulation Australia. https://knauf.com/en-AU/performance/thermal-efficiency/science-of-insulation-explained (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "Thermal Resistance (R-Value): The measure of a material’s ability to resist the transfer of heat"
- **Jacket water can be cooled by a central loop or directly by seawater (SECONDARY)**
  - Source: Marine heat exchanger - Wikipedia. https://en.wikipedia.org/wiki/Marine_heat_exchanger (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "Jacket water cooling systems can be cooled by a central cooling water loop or can be cooled directly by seawater."
- **In a marine cooler the raw water usually runs in the tubes and the engine coolant in the shell**
  - Source: 3600 Marine Engine Installation Guide. https://s7d2.scene7.com/is/content/Caterpillar/CM20160714-36168-02562
  - Quote: "Since heat exchanger tubes can be cleaned easily, raw water is usually routed through tubes and engine coolant through the shell."
- **A shell-and-tube marine seawater cooler has raw water in its tubes (jacket water, lube oil, central cooler)**
  - Source: Marine Seawater Coolers | Raw Water Shell and Tube Coolers. https://www.marineheatexchanger.org/Heat-Exchangers/Shell-and-Tube/Seawater-Coolers.html (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "A marine seawater cooler is any shell and tube unit that has raw water in its tubes."
- **A motor's temperature rise follows a first-order equation and an exponential response**
  - Source: Thermal Model of a Motor – Electrical4U. https://www.electrical4u.com/thermal-model-of-motor (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "For constant losses and constant model parameters, solving the first-order equation gives an exponential temperature response"
- **One thermal time constant reaches about 63.2% of the final rise**
  - Source: Thermal Model of a Motor – Electrical4U. https://www.electrical4u.com/thermal-model-of-motor (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "With the same constant parameters, one thermal time constant reaches about 63.2% of the final rise."
- **A stopped self-cooled motor has a longer cooling time constant**
  - Source: Thermal Model of a Motor – Electrical4U. https://www.electrical4u.com/thermal-model-of-motor (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "Cooling is also exponential, although a stopped self-cooled motor can have a longer cooling time constant because its fan is no longer moving air."
- **Thermal time constant is the time to reach 63 per cent of the final rise**
  - Source: IC 9278 Impact of Current Load on Mine Trailing Cable Thermal Life. https://stacks.cdc.gov/view/cdc/235873/cdc_235873_DS1.pdf
  - Quote: "The thermal time constant, assumed to be independent of current magnitude, is defined here as the time to reach 63 pct of the final temperature rise."
- **Well-ventilated machines have smaller time constants (SECONDARY)**
  - Source: Electric Motor Cooling and Heating | Heating time constant | Cooling Curve. https://www.eeeguide.com/electric-motor-cooling-and-heating (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "Well ventilated machines have smaller time constants."
- **The convective thermal resistance runs from air cooling to water cooling**
  - Source: Development of a Fast Thermal Model for Calculating the Temperature of the Interior PMSM. https://www.mdpi.com/1996-1073/14/22/7455
  - Quote: "The smaller the convective thermal resistance, the stronger the convective heat transfer ability; the range covers air cooling to water cooling."
- **Jacket water is the fresh closed loop that the seawater circuit cools**
  - Source: The open cooling systems. https://tpub.com/engine3/en32-15.htm (**SECONDARY**: a site republishing US Navy training manuals)
  - Quote: "flows to a freshwater cooler (heat exchanger) where it is cooled by the seawater cooling circuit."
- **A protection relay's thermal model comes from the differential equation for temperature rise caused by current in a conductor**
  - Source: Thermal Models in Power System Protection. https://selinc.com/api/download/3678
  - Quote: "The thermal model and its relation to an I ² t time-current characteristic is derived from the differential equation for temperature rise caused by current in a conductor"

My reading: the engineering sources want conduction by Fourier's law and thermal resistance in series (flat plates, lagged
pipes), convection and radiation as modes, and heat exchangers by overall coefficient and log mean temperature difference
(MCA Applied Heat 7.1; HN Unit 13). Dan's Differential equations course built Newton's cooling, dT/dt = −k(T − T_room),
and the cable-warming and motor time constants (its brief, notes 7), so this course should use them: a motor or cable heats to
a steady rise set by losses and thermal resistance, and the rise is exponential with a time constant. The sources
for that are in 4.2 and in section 7.2. A shell-and-tube cooler with seawater in the tubes and engine coolant on the shell is
the standard marine picture (Caterpillar). The search results for heat exchangers were manufacturer and training pages; the
LMTD line is from the MCA syllabus, not from a worked source, so the log-mean formula itself is **UNCONFIRMED** for lessons
(show it as an average of end differences, and say it is a standard result).

### 4.3 Part 3: gases, absolute and gauge pressure, the receiver
- **BTEC Unit 11 formulae: absolute pressure = gauge + atmospheric; force = pressure x area**
  - Source: BTEC L3 Advanced Manufacturing Engineering Unit Specification. https://qualifications.pearson.com/content/dam/pdf/BTEC-Specialist-Qualifications/advanced-manufacturing-engineering-development-technical-knowledge/2016/specification/adv-man-eng-unit-spec.pdf
  - Quote: "absolute pressure = gauge + atmospheric pressure, force = pressure × area, actuator force = pressure × area × efficiency"
- **Gas laws need absolute pressure, not gauge**
  - Source: Gas Laws Explained: Formulas, Chart & Examples. https://turn2engineering.com/mechanical-engineering/thermodynamics/gas-laws (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "Use absolute pressure, not gauge pressure."
- **Convert gauge to absolute before using gas-law equations**
  - Source: Gas Laws Explained: Formulas, Chart & Examples. https://turn2engineering.com/mechanical-engineering/thermodynamics/gas-laws (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "Convert psig to psia, or gauge pressure to absolute pressure, before using gas-law equations."
- **Be certain to use absolute temperature and absolute pressure**
  - Source: 13.3 The Ideal Gas Law - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/13-3-the-ideal-gas-law
  - Quote: "Be certain to use absolute temperature and absolute pressure."
- **A receiver collects condensate and buffers demand**
  - Source: Compressed Air Receivers. https://www.engineeringtoolbox.com/compressed-air-receivers-d_846.html (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "In addition the receiver serve the purpose of * collecting condensate and water in the air after the compressor"
- **A receiver only stores air the compressor has already made**
  - Source: Air Receiver Tank Sizing | Mech Codex. https://mechcodex.com/learn/fluid-mechanics/air-receiver-tank-sizing (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "It only stores air the compressor has already made."
- **Only the pressure band between cut-out and the lowest usable pressure is usable storage**
  - Source: Air Receiver Sizing Calculator (CAGI Formula) | Reuven Engineering Tools. https://reuven.tools/tools/air-receiver (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "Only the band between them is usable storage — a 120 to 100 psi band stores far less than the tank's nameplate suggests."
- **CAGI: receiver should give at least 2 minutes between cut-in and cut-out**
  - Source: 2. https://www.cagi.org/assets/documents/pdfs/handbook/CAGI-Handbook_Chap2Mar19PostedtoWebsite.pdf?updated=1659810710
  - Quote: "receiver should assure at least 2 minutes of operation of the compressor between the pressure control cut-in and cut-out pressures, with zero draw from the receiver."
- **A larger receiver stops frequent motor starts (Atlas Copco)**
  - Source: What is an Air Receiver? - Atlas Copco USA. https://www.atlascopco.com/en-us/compressors/wiki/compressed-air-articles/what-is-an-air-receiver
  - Quote: "This will also prevent pressure fluctuation and frequent motor starts, while providing steady pressure and extending the life of"
- **Higher pressure does not equal more flow (Atlas Copco)**
  - Source: What is an Air Receiver? - Atlas Copco USA. https://www.atlascopco.com/en-us/compressors/wiki/compressed-air-articles/what-is-an-air-receiver
  - Quote: "higher pressure does not equal more flow (CFM or l/s), but just the opposite, as we raise pressure, the flow decreases"
- **Cited constant: air at sea level has density 1.229 kg/m3 and a ratio of specific heats of 1.4 (NASA)**
  - Source: Properties of Air - Text Version | Glenn Research Center | NASA. https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/properties-of-air-text-version
  - Quote: "Density: 1.229 kilogram per cubic meter"
- **Cited constant: ratio of specific heats of air is 1.4 (NASA)**
  - Source: Properties of Air - Text Version | Glenn Research Center | NASA. https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/properties-of-air-text-version
  - Quote: "Ratio of specific heats: 1.4"
- **Cited constant: specific gas constant of air R = 287 J per kg per kelvin (FAO annex)**
  - Source: Annex 3. Background on physical parameters used in evapotranspiration computations. https://www.fao.org/4/X0490E/x0490e0k.htm
  - Quote: "R specific gas constant == 287 [J kg \-1 K \-1 ]"

My reading: the trap is the units: absolute pressure and kelvin in every gas-law line, and the difference between an
absolute reading and a gauge reading. Boyle's law is inverse proportion (Dan has it, Proportional reasoning lesson 6); the
combined gas law is the ratio form; pV = mRT brings in the gas constant (287 J/(kg K) for air). The receiver is the
engineering picture: it stores air already made, and the usable storage is the band between cut-out and the lowest
pressure the demand will accept, in free-air terms. Atlas Copco warns that higher pressure does not mean more flow.

### 4.4 Part 4: the first law and heat engines
- **NASA: the first law defines internal energy change as heat in minus work out by the system**
  - Source: First Law of Thermodynamics. https://www.grc.nasa.gov/www/k-12/VirtualAero/BottleRocket/airplane/thermo1.html
  - Quote: "The first law of thermodynamics defines the internal energy (E) as equal to the difference of the heat transfer (Q) into a system and the work (W) done by the system."
- **Brilliant wiki: no heat engine can beat a Carnot engine between two temperatures**
  - Source: Second Law of Thermodynamics | Brilliant Math & Science Wiki. https://brilliant.org/wiki/second-law-thermodynamics (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "It is impossible for any heat engine to be more efficient than a Carnot engine when operating between two given temperatures"
- **MIT: the Diesel cycle is compression ignition and runs at higher compression because only air is compressed**
  - Source: 3.6 Diesel Cycle. https://web.mit.edu/16.unified/www/FALL/thermodynamics/notes/node27.html
  - Quote: "The Diesel cycle is a compression ignition (rather than spark ignition) engine."
- **MIT: only air is compressed so no risk of auto-ignition, so a higher compression ratio than the Otto cycle**
  - Source: 3.6 Diesel Cycle. https://web.mit.edu/16.unified/www/FALL/thermodynamics/notes/node27.html
  - Quote: "This cycle can operate with a higher compression ratio than the Otto cycle because only air is compressed and there is no risk of auto-ignition of the fuel."
- **US DOE slide: internal combustion engines are not Carnot heat engines and not limited by Carnot efficiency (contested)**
  - Source: Defining engine efficiency limits. https://www.energy.gov/sites/prod/files/2014/03/f8/deer11_edwards.pdf
  - Quote: "Carnot efficiency: a common misconception ### • IC engines are _not_ Carnot heat engines and therefore are _not_ **limited by Carnot"
- **A 2025 marine paper: marine two-stroke engines operate close to the limits set by Carnot's theorem (the other side of the contest)**
  - Source: Performance analysis of a novel marine engine waste heat recovery system for combined power and cooling generation - ScienceDirect. https://www.sciencedirect.com/science/article/pii/S1359431125031965
  - Quote: "operate at roughly 50 % efficiency, close to the thermodynamic limits established by Carnot's theorem"
- **A marine paper: medium-speed diesel energy balance, exhaust heat is the largest loss**
  - Source: Energy efficiency analysis of marine high-powered medium-speed diesel engine base on energy balance and exergy. https://ideas.repec.org/a/eee/energy/v176y2019icp991-1006.html (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "From the energy balance analysis, about 25% of the total energy is lost through exhaust heat. This forms the largest energy loss."
- **EPA: exhaust and cooling systems carry 60 to 70 percent of the fuel energy in a reciprocating engine**
  - Source: Catalog of CHP Technologies, Section 2. Technology Characterization – Reciprocating Internal Combustion Engines. https://www.epa.gov/sites/default/files/2015-07/documents/catalog_of_chp_technologies_section_2._technology_characterization_-_reciprocating_internal_combustion_engines.pdf
  - Quote: "energy contained in the exhaust gas and cooling systems, which generally represents 60 to 70 percent of the inlet fuel energy."
- **EPA: compression ignition diesels are among the most efficient simple-cycle options**
  - Source: Catalog of CHP Technologies, Section 2. Technology Characterization – Reciprocating Internal Combustion Engines. https://www.epa.gov/sites/default/files/2015-07/documents/catalog_of_chp_technologies_section_2._technology_characterization_-_reciprocating_internal_combustion_engines.pdf
  - Quote: "Compression ignition diesel engines are among the most efficient simple-cycle power generation options on the market."
- **Energy goes in as fuel and out as work, cooling water, exhaust and radiation (a 2006 experimental study)**
  - Source: An experimental study of energy balance in low heat rejection diesel engine - ScienceDirect. https://www.sciencedirect.com/science/article/abs/pii/S036054420500037X
  - Quote: "Energy is supplied to the engine as a chemical energy of the fuel and leaves as energy in the cooling water, exhaust"
- **'Heat loss' is a misleading term because heat is energy in transit (same study)**
  - Source: An experimental study of energy balance in low heat rejection diesel engine - ScienceDirect. https://www.sciencedirect.com/science/article/abs/pii/S036054420500037X
  - Quote: "But, this usage is misleading as heat is energy in transit"

My reading: the first law is Q − W = ΔU (non-flow) in the MCA syllabus. Work out equals area on the pV diagram, built in
Calculus fundamentals lesson 9 and Exponentials lesson 8. The diesel cycle in outline: only air is compressed, fuel is injected
at the end, no spark, so a higher compression ratio. Where the heat goes: the EPA catalog says exhaust and cooling carry
60 to 70 per cent of fuel energy for reciprocating engines; a marine paper gives exhaust 25 per cent as the largest single
loss; the GES B syllabus lists "Cooling Water losses; Exhaust losses; Friction losses" as the energy-balance items. **Contested:**
the Carnot limit. A US DOE slide calls it "a common misconception" that internal combustion engines are limited by Carnot
efficiency (they run an open cycle with a chemical reaction), while a 2025 marine-engine paper says a two-stroke at about
50 per cent is "close to the thermodynamic limits established by Carnot's theorem". These can both be read as true for
different choices of hot and cold temperature; the course should teach the Carnot limit as an upper bound for any heat
engine between two temperatures and say plainly that real-engine limits are argued over.

### 4.5 Part 5: pressure in liquids, gauges, hydraulics
- **OpenStax: p = pressure due to the fluid's weight plus the atmosphere; formula only good for constant density**
  - Source: 14.1 Fluids, Density, and Pressure - University Physics Volume 1 | OpenStax. https://openstax.org/books/university-physics-volume-1/pages/14-1-fluids-density-and-pressure
  - Quote: "The pressure at the bottom of the container is due to the pressure of the atmosphere plus the pressure due to the weight of the fluid."
- **OpenStax: the depth formula is only good for a fluid of constant density**
  - Source: 14.1 Fluids, Density, and Pressure - University Physics Volume 1 | OpenStax. https://openstax.org/books/university-physics-volume-1/pages/14-1-fluids-density-and-pressure
  - Quote: "This equation is only good for pressure at a depth for a fluid of constant density."
- **Bitesize: pressure in a fluid depends on height, depth and temperature**
  - Source: Pressure in fluids guide for KS3 physics students - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zv7ybqt
  - Quote: "This means that the pressure in a fluid changes depending on its height, depth and temperature."
- **BTEC Unit 11 lists Pascal's law, pressure drop and clamping force**
  - Source: BTEC L3 Advanced Manufacturing Engineering Unit Specification. https://qualifications.pearson.com/content/dam/pdf/BTEC-Specialist-Qualifications/advanced-manufacturing-engineering-development-technical-knowledge/2016/specification/adv-man-eng-unit-spec.pdf
  - Quote: "Pascal’s law, inlet and outlet pressure, pressure drop, actuator efficiency, clamping force"
- **HN Unit 11: transmission of force in hydraulic devices**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf (**SECONDARY**: a college copy of Pearson's HN specification, issue 5, October 2017)
  - Quote: "Transmission of force in hydraulic devices"
- **A 10 m column of seawater weighs as much as the whole atmosphere (WHOI course notes)**
  - Source: Some Physical Properties of Sea Water or, More than you ever wanted to know about the basic state variables of the ocean…. https://www.whoi.edu/science/PO/people/tjoyce/whoi-mit_course/notes/course_notes_1b.pdf
  - Quote: "For a column of saltwater with a density of 1025 kg/m ³ that is 10 m high with a gravity of 9.81 m/s ² , using (p1) we get: δP = (1025)(9.81)(10) ~ 10 ⁵ Pa, which is the pressure at the bottom of the atmosphere. Thus, the weight of the entire atmosphere is equivalent to 10 m of seawater!"

My reading: p = ρgh and its three facts (pressure depends on depth, not shape; acts in all directions; the atmosphere
adds to it) are what every source teaches. Gauges: the U-tube manometer, the barometer, the Bourdon gauge. Pascal's principle
gives hydraulics (force = pressure × area; the BTEC Unit 11 formulae). A cited fact for a "feel it" control: a 10 m column of
seawater weighs as much as the whole atmosphere (WHOI notes, about 10^5 Pa), which is a neat link to part 3's absolute versus gauge.

### 4.6 Part 6: buoyancy
- **MCA Applied Mechanics: states Archimedes, solves problems for bodies totally and partially immersed**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "States Archimedes principle. 2. Solves problems involving bodies totally and partially immersed in liquids."
- **BTEC Unit 1: Archimedes, density by flotation, relative density**
  - Source: Specification - Pearson BTEC Level 3 National Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/btec-nat-eng-cert-spec.pdf
  - Quote: "Archimedes’ principle o determination of density using floatation methods o relative density"
- **Brilliant puts Pressure and Buoyancy as two lessons in Classical Mechanics level 3**
  - Source: Practice Classical Mechanics | Brilliant. https://brilliant.org/courses/dynamics-bootcamp
  - Quote: "Weight and Scales Pressure Buoyancy"

My reading: Archimedes is in every syllabus, as upthrust equals the weight of fluid displaced, for floating and
fully immersed bodies. The MCA keeps floating rectangular vessels in the EOOW hydrostatics paper and puts ship stability in a
separate Naval Architecture paper. This course teaches general buoyancy with ships and tanks, and stops before trim, ballast and
stability, which belong to the marine course and to the rules in CLAUDE.md.

### 4.7 Part 7: fluid flow
- **OpenStax fluid dynamics: laminar flow is smooth parallel streamlines**
  - Source: 14.5 Fluid Dynamics - University Physics Volume 1 | OpenStax. https://openstax.org/books/university-physics-volume-1/pages/14-5-fluid-dynamics
  - Quote: "The first fluid exhibits a laminar flow (sometimes described as a steady flow), represented by smooth, parallel streamlines."
- **OpenStax fluid dynamics: flow rate, velocity and the equation of continuity**
  - Source: 14.5 Fluid Dynamics - University Physics Volume 1 | OpenStax. https://openstax.org/books/university-physics-volume-1/pages/14-5-fluid-dynamics
  - Quote: "Calculate flow rate * Describe the relationship between flow rate and velocity * Explain the consequences of the equation of continuity to the conservation of mass"
- **OpenStax: an ideal fluid has negligible viscosity**
  - Source: 14.5 Fluid Dynamics - University Physics Volume 1 | OpenStax. https://openstax.org/books/university-physics-volume-1/pages/14-5-fluid-dynamics
  - Quote: "An ideal fluid is a fluid with negligible viscosity"
- **OpenStax University Physics: Bernoulli explained through conservation of energy**
  - Source: 14.6 Bernoulli’s Equation - University Physics Volume 1 | OpenStax. https://openstax.org/books/university-physics-volume-1/pages/14-6-bernoullis-equation
  - Quote: "Explain how Bernoulli’s equation is related to the conservation of energy"
- **NASA: static plus dynamic pressure is a constant through the flow**
  - Source: Bernoulli's Equation | Glenn Research Center | NASA. https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/bernoullis-equation/
  - Quote: "The equation states that the static pressure p s in the flow plus the dynamic pressure, one half of the density rho ( ρ ) times the velocity V squared, is equal to a constant A graphic showing Bernoulli's equations which relates the velocity and static pressure of a flow. ## In the 1700s In the 1700s, Daniel Bernoulli investigated the forces present in a moving fluid. throughout the flow."
- **ASHRAE: laminar to turbulent transition region 2000 < Re < 10 000**
  - Source: CHAPTER 3. FLUID FLOW. https://handbook.ashrae.org/(S(sriqhilv3nrnvqccyiw1imm0))/Handbooks/F17/SI/F17_Ch03/f17_ch03_si.aspx
  - Quote: "A transition region from laminar to turbulent flow occurs when 2000 < Re < 10 000"
- **CED: pipe flow laminar below 2100 and turbulent above 4000**
  - Source: Spreadsheet Use for Pipe Flow- Friction Factor Calculations. https://www.cedengineering.com/userfiles/C03-079%20-%20Spreadsheet%20Use%20for%20Pipe%20Flow-Friction%20Factor%20Calculations%20-%20US%20-%20R1.pdf (**SECONDARY**: a continuing-education site republishing the US DOE fundamentals handbook)
  - Quote: "pipe flow will be laminar for a Reynolds Number (Re) less than 2100 and it will be turbulent for a Re greater than 4000."
- **OpenStax College Physics: pressure drops in a rapidly moving fluid, confined or not**
  - Source: 12.2 Bernoulli’s Equation - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/12-2-bernoullis-equation
  - Quote: "pressure will drop in a rapidly-moving fluid_ , whether or not the fluid is confined to a tube."
- **Curtin fluid mechanics syllabus: Pitot, venturi meter, orifice plate**
  - Source: Curtin Courses Online Handbook 2004 - ChE 221 Fluid Mechanics. https://archive.handbook.curtin.edu.au/july2004/units/30/302246.html
  - Quote: "Measurement of pressure and flow speed (Pitot/Pitot-static tubes, venturi meter, orifice plate)"
- **Portland State course slide: laminar below Re 2000, turbulent above 2000**
  - Source: Head Loss in Pipe Systems Laminar Flow and Introduction to Turbulent Flow. https://web.cecs.pdx.edu/~gerry/class/ME322/notes/pdf/ME322_lect03slides.pdf
  - Quote: "Laminar: Re _<_ 2000 ## Turbulent: Re _>_ 2000"

My reading: continuity (A1v1 = A2v2) and Bernoulli as conservation of energy (OpenStax) in an incompressible, frictionless
fluid; a venturi or orifice plate turns a pressure difference into a flow rate; laminar and turbulent flow in outline by Reynolds
number. **Contested:** the transition values. ASHRAE gives a transition region 2000 < Re < 10 000, the CED/DOE text says laminar
below 2100 and turbulent above 4000, and a Portland State slide says laminar below 2000 and turbulent above 2000. Teach "about
2000 to 4000, depending on the source and the pipe" and do not use a single cut-off as a control.

### 4.8 Part 8: pumps and pipes
- **Darcy-Weisbach head loss and friction factor (UTA lab manual)**
  - Source: Experiment #4: Energy Loss in Pipes – Applied Fluid Mechanics Lab Manual. https://uta.pressbooks.pub/appliedfluidmechanics/chapter/experiment-4
  - Quote: "The head loss due to friction can be calculated from the Darcy-Weisbach equation:"
- **Laminar flow friction factor depends only on Reynolds number (UTA)**
  - Source: Experiment #4: Energy Loss in Pipes – Applied Fluid Mechanics Lab Manual. https://uta.pressbooks.pub/appliedfluidmechanics/chapter/experiment-4
  - Quote: "For laminar flow, the Darcy-Weisbach coefficient (or friction factor _f_ ) is only a function of the Reynolds number (Re) and is independent of the surface roughness of the pipe"
- **KSB: the pump's operating point is where the pump curve meets the system curve**
  - Source: Operating point | KSB. https://www.ksb.com/en-global/centrifugal-pump-lexicon/article/operating-point-1117036
  - Quote: "The operating point of a centrifugal pump is the intersection of the pump characteristic cu rve (H/Q curve"
- **Cavitation is when liquid pressure falls to the vapour pressure**
  - Source: Hydraulic_Pumps. https://web.eng.fiu.edu/arleon/courses/Fluid_Mechanics/Lectures/Pumps_unfilled.pdf
  - Quote: "Cavitation occurs when the liquid pressure at a given location is reduced to the vapor pressure of the liquid."
- **Grundfos: NPSH is the minimum absolute suction pressure needed to avoid cavitation**
  - Source: ABOUT PUMP CURVES. https://www.grundfos.com/content/dam/global/page-assets/learn/ecademy/pdfs/master-36-module-4-About-pump-curves.pdf
  - Quote: "The NPSH-value of a pump is the minimum absolute pressure that must be present at the suction side of the pump to avoid cavitation."
- **NPSH available must exceed NPSH required**
  - Source: Centrifugal and Positive Displacement Pumps. https://www.cedengineering.com/userfiles/M03-002%20-%20Centrifugal%20and%20Positive%20Displacement%20Pumps%20-%20US.pdf (**SECONDARY**: a continuing-education site republishing the US DOE fundamentals handbook)
  - Quote: "To avoid pump cavitation, the net positive suction head available must be greater than the net positive suction head required."
- **Positive displacement pumps trap a quantity of liquid at the suction**
  - Source: Centrifugal and Positive Displacement Pumps. https://www.cedengineering.com/userfiles/M03-002%20-%20Centrifugal%20and%20Positive%20Displacement%20Pumps%20-%20US.pdf (**SECONDARY**: a continuing-education site republishing the US DOE fundamentals handbook)
  - Quote: "Positive displacement pumps operate on a different principle than centrifugal pumps. Positive displacement pumps physically entrap a quantity of liquid at the suction of the pump and"
- **A centrifugal pump gives continuous flow; a positive displacement pump differs**
  - Source: Centrifugal and Positive Displacement Pumps. https://www.cedengineering.com/userfiles/M03-002%20-%20Centrifugal%20and%20Positive%20Displacement%20Pumps%20-%20US.pdf (**SECONDARY**: a continuing-education site republishing the US DOE fundamentals handbook)
  - Quote: "The positive displacement pump differs from centrifugal pumps, which deliver a continuous flow for any given pump speed and discharge resistance."
- **Pump shaft power is hydraulic power divided by pump efficiency**
  - Source: Pump Power Calculation | Neutrium. https://neutrium.net/articles/equipment/pump-power-calculation (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "Shaft power is typically calculated as the hydraulic power of the pump divided by the pump efficiency as follows:"
- **Motor input power is higher than shaft power by the motor efficiency**
  - Source: Pump Power Calculator (Hydraulic, Shaft & Motor Input) | ElectroMechCalc. https://www.electromechcalc.com/mechanical/pump-power (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "the motor itself also has losses (electrical and mechanical), so the motor input power — the actual electrical power drawn from the supply — is higher again than the shaft power, by the motor's own efficiency:"
- **Purdue pump example: head rise, hydraulic power, efficiency and electric power with 85 per cent motor efficiency**
  - Source: NotesOnThermodynamicsFluidMechanicsAndGasDynamics. https://engineering.purdue.edu/~wassgren/teaching/ME30800/NotesAndReading/Pumps_HeadCurvesAndBEP_Reading.pdf
  - Quote: "Evaluate the head rise across the pump, the hydraulic power input to the fluid, and the pump efficiency. If the electric motor efficiency is 85%, calculate the electric power requirement."
- **FIU: select a pump with both the system curve and the pump performance curve**
  - Source: Hydraulic_Pumps. https://web.eng.fiu.edu/arleon/courses/Fluid_Mechanics/Lectures/Pumps_unfilled.pdf
  - Quote: "To select a pump, it is necessary to utilize both the system curve ( determined by the system equation ), and the pump performance curve"
- **FIU: the intersection of the two curves is the operating point, which should sit near the best efficiency point**
  - Source: Hydraulic_Pumps. https://web.eng.fiu.edu/arleon/courses/Fluid_Mechanics/Lectures/Pumps_unfilled.pdf
  - Quote: "The intersection of both curves represents the operating point for the system . #  The operating point should be near the best efficiency point."

My reading: pump head is the energy per unit weight added to the fluid; pipe friction head loss h = f (L/D) v²/2g
(Darcy-Weisbach); the system curve is static head plus friction (rising with flow squared); the operating point is where the
pump curve meets it (KSB, FIU); NPSH available must exceed NPSH required (Grundfos, DOE handbook text) or the pump cavitates,
because the liquid pressure falls to the vapour pressure. Centrifugal pumps give continuous flow that depends on discharge
resistance; positive displacement pumps trap a quantity of liquid and push it on. Pump power: hydraulic power ρgQH, shaft
power = hydraulic ÷ pump efficiency, electrical input = shaft ÷ motor efficiency. Dan has already seen pump power going with
speed cubed (Powers and roots lesson 7).


---

## 5. Prerequisites: what Dan has, and what must be taught inline

No web quotes here: this section is from the built briefs, with the file and the line that says it.

| This course leans on | Dan has it from | What must be taught inline |
|---|---|---|
| Rearranging formulas (Q = mcΔT for T, p = ρgh for h); units and conversions | Solving equations; Powers and roots (litres and cubic metres, mm²) | Only unit traps: kelvin, absolute pressure, bar and kPa |
| Inverse proportion: Boyle's law; ratios | Proportional reasoning lesson 6 ("inverse proportion and Boyle's law", per the Powers and roots brief, line 116, and Functions brief, line 158) | The combined gas law as a ratio; pV = mRT |
| Squares and cubes: v² in Bernoulli and Darcy, pump power with speed cubed | Powers and roots lessons 2 and 7 (the factor dial for P = I²R and pump power with speed cubed, Functions brief line 156) | Head loss varies as flow squared; the affinity laws only as a note |
| Curves: pump curve, system curve, cooling curve | Functions and their graphs; Exponentials and logarithms lesson 3 (Newton's cooling as a formula); Differential equations (cooling, time constants, cable warming, brief lines 214 to 216, 345 to 362) | Reading the intersection of two curves as an operating point |
| Work done by an expanding gas = area under pV | Calculus fundamentals lesson 9 (pV^n = C, W = (p1V1 − p2V2)/(n − 1)); Exponentials and logarithms lesson 8 (isothermal work) | The first law with signs: Q in, W out; where the rest goes |
| Newton's cooling, time constant, 63 per cent and 5T | Exponentials lesson 3; Differential equations lessons 1 to 3 | The physical thermal resistance and heat capacity behind k and the time constant |
| Power, energy, efficiency (η = P_out ÷ P_in), work, forces, moments, stress | Mechanics and materials (built alongside; scope given in the task text, its brief not yet written). Electrical power and efficiency: the electrical courses | None: use by name. Never re-teach |
| Cable ratings with ambient and insulation factors (Ca, Ci) and the thermal constraint | Design and verification (brief lines 53, 223, 229) | The reason in heat-flow terms: I²R heating balanced by loss to the surroundings. Do not teach BS 7671 methods |
| Pumps, compressors and ventilation as electrical loads | Motors (brief line 206: "cranes, winches, bow thrusters, ventilation, pumps, compressors") | The fluid side of the same machines |
| Heat in electronics (transistor dissipation, battery ripple heating) | Electronics and power electronics (brief lines 126, 217) | Only a link back |
| Hydrogen and battery ventilation as a safety matter | Electronics brief line 126 ("Nothing about any boat's battery, ventilation or limits") | Section 7.3 gives public sources if a lesson wants the ventilation sum; keep to the general rule |

My reading: the shape of the gap is that Dan has the maths (inverse proportion, squares and cubes, exponentials, pV area) and the
electrical side, and has not met the physical ideas of heat capacity and thermal resistance, absolute pressure as a trap,
continuity and Bernoulli, pipe head loss and the pump curve. The Unit 8 content (section 3.5) may have given him some of the
formulas; the unit pages do not show whether it gave him the reasons.

---

## 6. Misconceptions and learning science for each skill

Each skill's trap is stated with its source. The learning-science points: every source below finds misconceptions
stubborn (Prince and Vigeant's inquiry activities improved scores only modestly, "statistically significant, but modest"), so the course
should have Dan predict before it shows (the app's own rule) and put the wrong idea on the screen for him to test. The "Misconceptions Reconceived" paper (Smith, diSessa and Roschelle, 1993; the authors are my own knowledge, the page excerpt does not name them)
argues that students' ideas are resources rather than only errors, so the lessons should start from what Dan already feels
is true (a metal rail feels colder; a bigger pipe makes the water slower) and test it.

### 6.1 Heat, temperature and energy
- **Heat and temperature: students treat them as synonyms (2025 study of 470 Polish students)**
  - Source: Research on the understanding of the concepts of heat and temperature among students of Polish schools. https://iopscience.iop.org/article/10.1088/1742-6596/3155/1/012026/pdf
  - Quote: "Equating heat with temperature – students often treat these concepts as synonyms, failing to distinguish between temperature as a measure of thermal state and heat as a form of energy transfer"
- **Heat as a substance that flows from warm to cool**
  - Source: Research on the understanding of the concepts of heat and temperature among students of Polish schools. https://iopscience.iop.org/article/10.1088/1742-6596/3155/1/012026/pdf
  - Quote: "Perceiving heat as a substance (‘caloric’) – many students consider heat to be a specific substance that flows from a warmer body to a cooler one"
- **Engineering students keep four robust heat-transfer misconceptions: temperature vs energy, rate vs amount, temperature vs feel, surface and radiation**
  - Source: ASEE PEER - The Use of Inquiry-Based Activities to Repair Student Misconceptions Related to Heat, Energy and Temperature. https://peer.asee.org/the-use-of-inquiry-based-activities-to-repair-student-misconceptions-related-to-heat-energy-and-temperature
  - Quote: "(1) temperature vs. energy, (2) factors that affect the rate vs. the am ount of energytransferred, (3) temperature vs. perceptions of hot and cold and (4) the effect of surfaceproperties on thermal radiation."
- **Many students think temperature is a measure of how hot or cold things feel**
  - Source: Development Of A Concept Inventory In Heat Transfer. https://peer.asee.org/development-of-a-concept-inventory-in-heat-transfer.pdf
  - Quote: "Many students think that temperature is a measure of how hot or cold things feel."
- **Students believe a higher temperature always means more energy**
  - Source: Development Of A Concept Inventory In Heat Transfer. https://peer.asee.org/development-of-a-concept-inventory-in-heat-transfer.pdf
  - Quote: "Students commonly believe that temperature is a direct measure of the energy in an object, so something at a higher temperature always has more energy."
- **Inquiry activities gave a statistically significant but modest gain**
  - Source: ASEE PEER - The Use of Inquiry-Based Activities to Repair Student Misconceptions Related to Heat, Energy and Temperature. https://peer.asee.org/the-use-of-inquiry-based-activities-to-repair-student-misconceptions-related-to-heat-energy-and-temperature
  - Quote: "The improvement wasstatistically significant, but modest."
- **Teachers and students of physical science could not judge how well they understood heat and temperature (Oberem, via Nottis and Prince)**
  - Source: Addressing Misconceptions about Heat Transfer in Undergraduate Chemical Engineering Instruction. https://digitalcommons.lib.uconn.edu/cgi/viewcontent.cgi?article=1016&context=nera_2008
  - Quote: "Oberem (2002) found that both students and teachers of physical science were unable to ### accurately assess their understanding of heat and temperature concepts."
- **IOPSpark summary of Chu et al.: heat as a process, not a thing; heat versus cold**
  - Source: Chu et al. (2012) | IOPSpark. https://spark.iop.org/chu-et-al-2012 (**SECONDARY**: IOP's summary of the Chu et al. paper, not the paper)
  - Quote: "To understand the view that heat is energy that moves between objects at different temperatures, students would first need to differentiate between heat and 'cold', temperature and heat, and fully appreciate the idea of thermal equilibrium."
- **IOPSpark: the boiling point of water is not always 100 C and steam is not always at the boiling temperature (listed misconceptions)**
  - Source: Chu et al. (2012) | IOPSpark. https://spark.iop.org/chu-et-al-2012 (**SECONDARY**: IOP's summary of the Chu et al. paper, not the paper)
  - Quote: "Heat is proportional to temperature. * The amount of heat in an object depends on the material that the object is made up of"
- **Cold flows like a liquid is a recorded misconception among physics students (four-tier test)**
  - Source: Identification of misconceptions on heat and temperature among physics education students using four-tier diagnostic test. https://iopscience.iop.org/article/10.1088/1742-6596/1470/1/012055/pdf
  - Quote: "12.8% students answers get misconception on convection doesn’t occur in the air subtopic and get 8.3% on temperature and cold can flow subtopic."
- **A thermal-physics lecture intervention using hints and peer interaction targets the same misconceptions**
  - Source: Overcoming students' misconceptions concerning thermal physics with the aid of hints and peer interaction during a lecture course | Phys. Rev. ST Phys. Educ. Res.. https://link.aps.org/doi/10.1103/PhysRevSTPER.9.020112
  - Quote: "In order to help them overcome misconceptions observed prior to instruction, we implemented a one-hour lecture-based intervention in their introductory thermal physics course."
- **The first law and its processes had demonstrably not been understood from earlier study**
  - Source: Overcoming students' misconceptions concerning thermal physics with the aid of hints and peer interaction during a lecture course | Phys. Rev. ST Phys. Educ. Res.. https://link.aps.org/doi/10.1103/PhysRevSTPER.9.020112
  - Quote: "The concepts and processes related to the first law of thermodynamics demonstrably had not been understood from students’ previous studies; this is a finding that is familiar from previous research"
- **Specific latent heat was mistaken for specific heat capacity (WAEC examiner observation)**
  - Source: Physics (Essay) Paper 2, May-June 2018. https://waeconline.org.ng/e-learning/Physics/Phys227mq9.html
  - Quote: "Some mistook ‘Specific latent heat’ for ‘Specific heat capacity’. Some candidates lost some marks because they gave just the definition."
- **Misconceptions research is itself contested: students' ideas can be productive, not only wrong (Smith, diSessa, Roschelle)**
  - Source: Misconceptions Reconceived: A Constructivist Analysis of Knowledge in Transition: Journal of the Learning Sciences: Vol 3, No 2. https://www.tandfonline.com/doi/abs/10.1207/s15327809jls0302_1
  - Quote: "Students have often been viewed as holding flawed ideas that are strongly held, that interfere with learning, and that instruction must confront and replace."

My reading: three traps recur and are named in the sources: (a) heat is a thing that is stored and flows (caloric), cold flows
too; (b) temperature measures energy or how hot something feels; (c) rate versus amount: factors that set how fast energy moves
differ from those that set how much moves. A lesson on conduction should separate rate (area, difference, material, thickness)
from amount (mass, specific heat, temperature change). The examiner point from WAEC (latent heat mistaken for specific
heat) is a two-line check: "does the temperature change?" The ASEE and Nottis papers are engineering-student studies,
not primary research on electricians; no study of Dan's group was found.

### 6.2 Gases
- **Kelvin, not Celsius, in gas laws: the single most common mistake**
  - Source: How to Use the Ideal Gas Law to Solve Problems - ScienceInsights. https://scienceinsights.org/how-to-use-the-ideal-gas-law-to-solve-problems (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "The single most common mistake is using Celsius instead of Kelvin."
- **Celsius temperatures must be converted to Kelvin before use in any gas-law problem**
  - Source: ChemTeam: Converting between Celsius and Kelvin. https://www.chemteam.info/GasLaw/Convert-Celsius-Kelvin.html (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "If you have a Celsius temperature in the problem, you MUST change it to Kelvin, in order to use it in your problem."
- **Students assign absolute relationships among gas variables**
  - Source: Murray State's Digital Commons - Posters-at-the-Capitol: Student Learning in Chemistry: Cognitive Skills and Conceptual Models: Study 1 (Daugherty): Student Misconceptions of the Properties of Gases. https://digitalcommons.murraystate.edu/postersatthecapitol/2012/NKU/3/
  - Quote: "The most prevalent misconception from the variables category was found to be assigning absolute relationships among variables."
- **Gas-law misconceptions are classed into 16 categories, including understanding formulas and the particulate nature of gas**
  - Source: Murray State's Digital Commons - Posters-at-the-Capitol: Student Learning in Chemistry: Cognitive Skills and Conceptual Models: Study 1 (Daugherty): Student Misconceptions of the Properties of Gases. https://digitalcommons.murraystate.edu/postersatthecapitol/2012/NKU/3/
  - Quote: "A literature review of gas law misconceptions was conducted in order to identify common misconceptions held by students on the properties of gases."
- **Using gauge pressure in a gas-law equation is a named mistake**
  - Source: Gas Laws Explained: Formulas, Chart & Examples. https://turn2engineering.com/mechanical-engineering/thermodynamics/gas-laws (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "Using gauge pressure: Convert gauge pressure to absolute pressure before using gas laws."

My reading: Celsius in a ratio, gauge instead of absolute, wrong gas constant for the unit. The cure the sources agree on
is a unit line every time: "absolute pressure, kelvin". A control that flips gauge to absolute and shows the answer change is
a good prediction task.

### 6.3 Pressure in liquids and buoyancy
- **Hydrostatic pressure: Greek junior high students show misconceptions on container shape, area and pressure direction**
  - Source: Diagnosing students' misconception in Hydrostatic Pressure through a 4-tier test.. https://pubmed.ncbi.nlm.nih.gov/39654768
  - Quote: "Statistical analysis of the results revealed a high incidence of misconceptions related to the effects of container shape, area, and pressure direction, as well as a significant lack of knowledge."
- **Students think hydrostatic pressure only occurs if water moves**
  - Source: Journal of Education and Learning (EduLearn). https://files.eric.ed.gov/fulltext/EJ1507396.pdf
  - Quote: "The students think that hydrostatic pressure only occurs if there is water movement"
- **Research-based materials on hydrostatic pressure improved results in a university course**
  - Source: Identifying and addressing student difficulties with hydrostatic pressure | American Journal of Physics | AIP Publishing. https://pubs.aip.org/aapt/ajp/article/78/1/75/1058101/Identifying-and-addressing-student-difficulties
  - Quote: "We describe the development and assessment of research-based instructional materials designed to address student difficulties with pressure"
- **Floating and sinking: 74 misconceptions among 377 pre-service science teachers**
  - Source: ERIC - EJ1096070 - A Descriptive Study of Pre-Service Science Teachers' Misconceptions about Sinking-Floating, Asia-Pacific Forum on Science Learning and Teaching, 2015-Dec. https://eric.ed.gov/?id=EJ1096070
  - Quote: "74 misconceptions about floating and sinking were found."
- **Middle-school beliefs: big things sink, small float, hollow things float, and so on**
  - Source: Determining the Understandings and Misconceptions of Science Teacher Candidates on the Buoyancy Force of Liquids. https://dergipark.org.tr/en/download/article-file/5195155
  - Quote: "big/heavy things sink and small/light things float"
- **People of all ages usually focus on only one dimension of sinking and floating**
  - Source: Determining the Understandings and Misconceptions of Science Teacher Candidates on the Buoyancy Force of Liquids. https://dergipark.org.tr/en/download/article-file/5195155
  - Quote: "individuals of all ages generally ### focus on only one dimension of the phenomenon of sinking and floating"
- **Buoyancy force is thought to depend on the object's volume and shape (Chinese eighth-graders)**
  - Source: Determining the Understandings and Misconceptions of Science Teacher Candidates on the Buoyancy Force of Liquids. https://dergipark.org.tr/en/download/article-file/5195155
  - Quote: "the magnitude ### of buoyancy depends on the volume and shape of the object."

My reading: pressure at depth is thought to depend on the container's shape or on movement of the liquid, and floating to
depend on size, weight or shape alone. A one-dimension-at-a-time slider (size, weight, shape, density) breaks the "only one
factor" habit named by the buoyancy reviews. Predict: two containers of different shape with the same depth.

### 6.4 Flow and Bernoulli
- **Pressure and Bernoulli: some students state that pressure rises in proportion to flow rate**
  - Source: Determining Students’ Conceptual Understandings of Physics Concepts. https://files.eric.ed.gov/fulltext/EJ1256065.pdf
  - Quote: "Some of them stated the opposite of the Bernoulli Principle that the pressure increase in liquids is directly proportional to the flow rate."
- **Civil engineering students named Bernoulli often but only 30% of those answered correctly**
  - Source: Civil Engineering Students’ and Practicing Civil Engineers’ Understanding of Engineering Concepts. https://ir.library.oregonstate.edu/downloads/vh53wz25z
  - Quote: "Of the 60% that mentioned Bernoulli’s equation, only 30% of them ### answered correctly."

My reading: the 8th-grade study finds students reverse Bernoulli (more flow, more pressure); the Oregon State study of civil
engineering students and engineers finds Bernoulli mentioned by 60 per cent and used correctly by 30 per cent of those. Both
support starting with continuity (speed up in a narrow section, mass in equals mass out), then asking the pressure question
as a prediction.

### 6.5 Engines, Carnot and entropy
- **Heat engine energy balance: 'heat loss' is misleading because heat is energy in transit**
  - Source: An experimental study of energy balance in low heat rejection diesel engine - ScienceDirect. https://www.sciencedirect.com/science/article/abs/pii/S036054420500037X
  - Quote: "often termed ‘heat loss’. But, this usage is misleading as heat is energy in transit"
- **Carnot limit: internal combustion engines are not Carnot engines (DOE slide)**
  - Source: Defining engine efficiency limits. https://www.energy.gov/sites/prod/files/2014/03/f8/deer11_edwards.pdf
  - Quote: "IC engines are _not_ Carnot heat engines and therefore are _not_ **limited by Carnot efficiency**"
- **DOE slide: an engine runs an open cycle with a chemical reaction and gas exchange, not the ideal closed Otto or Diesel cycle**
  - Source: Defining engine efficiency limits. https://www.energy.gov/sites/prod/files/2014/03/f8/deer11_edwards.pdf
  - Quote: "Operates on _open_ cycle involving a chemical reaction and gas exchange (not _ideal,_ _closed_ Otto or Diesel cycle)"
- **Introductory students link entropy to energy and expect it to be conserved**
  - Source: [2408.00944v1] Investigating introductory and advanced students' difficulties with entropy and the second law of thermodynamics using a validated instrument. https://arxiv.org/abs/2408.00944v1
  - Quote: "We find that a widespread unproductive tendency for introductory students to associate the properties of entropy with those of energy leads to many errors based on an idea of "conservation of"

My reading: the entropy paper finds introductory students treat entropy like energy and expect it to be conserved; the
course only needs the Carnot limit and the first law, so entropy stays out (a defer note). 'Heat loss' as a term is called
misleading in the engine-energy-balance paper; teach 'heat rejected'. The Carnot question is contested (section 4.4).

### 6.6 Compressed air
- **Higher pressure does not mean more flow from a compressor**
  - Source: What is an Air Receiver? - Atlas Copco USA. https://www.atlascopco.com/en-us/compressors/wiki/compressed-air-articles/what-is-an-air-receiver
  - Quote: "higher pressure does not equal more flow (CFM or l/s), but just the opposite, as we raise pressure, the flow decreases"

My reading: a compressed-air system's pressure and flow are different things. Atlas Copco says so directly.


---

## 7. Where it is used for an electrician going into marine engineering

Each use is quoted from a page that came back. Dan's electrical courses already hold the BS 7671 method; these uses
give the heat and fluid reasons behind it.

### 7.1 Cables: why the ratings and correction factors exist
- **BS 7671 rating factors: Ca for ambient temperature, Cg for grouping, Ci for thermal insulation**
  - Source: 2008 28 Autumn Wiring Matters. https://electrical.theiet.org/media/1617/appendix-4-of-bs-7671.pdf
  - Quote: "The various rating factors are identified as follows: Ca Cg Ci For ambient temperature. For grouping. For thermal insulation."
- **BS 7671 current-carrying capacity: Iz = It Ca Cg Ci Cc**
  - Source: 2008 28 Autumn Wiring Matters. https://electrical.theiet.org/media/1617/appendix-4-of-bs-7671.pdf
  - Quote: "Iz = It Ca Cg Ci Cc"
- **BS 7671 ambient factors are applied when the location differs from the reference ambient (IET EngX thread quoting Appendix 4)**
  - Source: Ambient Temperature Correction Factor - Wiring and the Regulations BS 7671 - IET EngX - IET EngX. https://engx.theiet.org/f/wiring-and-regulations/31281/ambient-temperature-correction-factor (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "Where the ambient temperature in the intended location of the non-sheathed or sheathed cables differs from the reference ambient temperature, the appropriate rating factors given in Tables 4B1"
- **Tabulated ratings are at 30 C ambient and a conductor operating temperature of 70 C (Table 4D4A reproduced by a cable maker)**
  - Source: TABLE 4D4A. https://www.elandcables.com/media/of4pe0xx/table-4d4a-and-4d4b.pdf (**SECONDARY**: a cable maker reproducing BS 7671 tables)
  - Quote: "Ambient temperature: 30°C Ground ambient temperature: 20°C Conductor operating temperature: 70°C"
- **Where a manufacturer does not confirm 90 C operation, the 70 C tables apply (IET Wiring Matters)**
  - Source: WIRING MATTERS ISSUE 93. https://electrical.theiet.org/media/3023/wiring-matters-issue-93-november-2022.pdf
  - Quote: "The increased current-carrying capacity is due to a higher conductor operating temperature of 90 °C."
- **Heat in a conductor is current squared times resistance, per metre (US government cable study)**
  - Source: Calculated operating temperatures of thermally insulated electric cables. https://www.govinfo.gov/content/pkg/GOVPUB-C13-301a9f4c05b826df45326ea608ad780f/pdf/GOVPUB-C13-301a9f4c05b826df45326ea608ad780f.pdf
  - Quote: "For a given electric current, the heat generated per unit length of conductor can be calculated as the product of the square of the current and the electrical resistance per unit length (I ² R)"

My reading: the ratings in BS 7671 Appendix 4 are heat-flow results: the tabulated current is the one that makes the
conductor reach its rated operating temperature (70 degrees C for PVC) at 30 degrees C ambient, installed alone. The correction
factors Ca, Cg and Ci change how fast heat can leave. This is Dan's own trade, and the lesson on heat transfer can end on it: why
a cable in insulation carries less. The method itself is not taught (Design and verification).

### 7.2 Motors: heating and cooling
- **Motor heating constant is typically between 0.5 and 5 hours**
  - Source: 24_1_Electrical_motors_Estimating_the_temperature_rise. https://www.wittfan.de/files/pdf/Know-how%20Center/Anleitung%20und%20Fallbeispiele/07_Elektrische%20Motoren%20-%20Temperaturerh%C3%B6hung_EN.pdf (**SECONDARY**: a fan maker's technical note)
  - Quote: "The motor heating constant is typically between 0.5 and 5 hours."
- **Motor winding temperature rise follows an inverse exponential curve**
  - Source: 24_1_Electrical_motors_Estimating_the_temperature_rise. https://www.wittfan.de/files/pdf/Know-how%20Center/Anleitung%20und%20Fallbeispiele/07_Elektrische%20Motoren%20-%20Temperaturerh%C3%B6hung_EN.pdf (**SECONDARY**: a fan maker's technical note)
  - Quote: "As a first approximation it is often assumed that the temperature rise follows an inverse exponential curve (i.e. 1-1/e x ). The time it takes for the winding temperature to reach 63 %"
- **Cable temperature response is set by thermal time constants of heating and cooling (CDC)**
  - Source: IC 9278 Impact of Current Load on Mine Trailing Cable Thermal Life. https://stacks.cdc.gov/view/cdc/235873/cdc_235873_DS1.pdf
  - Quote: "Response can be predicted knowing the thermal time con- stants of heating and cooling."

My reading: a motor is a thermal mass with losses in and a path out. The heating curve is 1 − e^(−t/τ) (Differential
equations lesson 3); τ is of the order of 0.5 to 5 hours for the motors in that note, and a self-cooled motor cools more slowly
when stopped. This is a use of Newton's cooling the course can show with a slider for losses, cooling and time.

### 7.3 Battery rooms: hydrogen, ventilation, heat
- **Battery rooms must keep hydrogen below the lower explosion limit of 4 per cent by volume**
  - Source: Ventilation of battery charging rooms for lead traction batteries. https://www.zvei.org/fileadmin/user_upload/Verband/Fachverbaende/Batterien/Merkblaetter/Industriebatterien/14e-Leaflet-Ventilation_of_battery_charging_rooms_for_lead_traction_batteries_01.pdf
  - Quote: "The ventilation of battery charging rooms must safely ensure that the hydrogen concentration does not exceed the lower explosion limit of 4% by volume."
- **Battery room ventilation flow Q = 0.055 m3/Ah x n (lead traction batteries, ZVEI)**
  - Source: Ventilation of battery charging rooms for lead traction batteries. https://www.zvei.org/fileadmin/user_upload/Verband/Fachverbaende/Batterien/Merkblaetter/Industriebatterien/14e-Leaflet-Ventilation_of_battery_charging_rooms_for_lead_traction_batteries_01.pdf
  - Quote: "combines gas evolution rate, the necessary dilution factor of hydrogen and a general safety factor"
- **US Coast Guard rule for ships' large battery rooms: power exhaust ventilation, air intake near the floor**
  - Source: eCFR :: 46 CFR Part 111 Subpart 111.15 -- Storage Batteries and Battery Chargers: Construction and Installation. https://www.ecfr.gov/current/title-46/chapter-I/subchapter-J/part-111/subpart-111.15
  - Quote: "Each battery room for large battery installations must have a power exhaust ventilation system and have openings for intake air near the floor"
- **Battery capacity is rated at 25 C ambient and varies away from it**
  - Source: Battery Room Ventilation and Safety. https://www.cedengineering.ca/userfiles/M05-021%20-%20Battery%20Room%20Ventilation%20and%20Safety.pdf (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "The rated capacity of a battery is based on an ambient temperature of 25°C (77°F)."
- **FM Global: high battery temperature needs more float current, which adds heat and raises the temperature further**
  - Source: DS 5-28 DC Battery Systems (Data Sheet). https://www.fm.com/FMAApi/data/ApprovalStandardsDownload?isGated=false&itemId=%7B63308874-AD98-4F42-ACD7-D5FABAFC6A91%7D
  - Quote: "High battery temperatures require more current to maintain float voltage. High currents increase heat generation, which in turn results in even higher currents."

My reading: the public rules are about hydrogen staying below 4 per cent by volume and about ventilation that dilutes
it. The ZVEI leaflet gives a flow rule for lead traction battery rooms (not a ship's), and the US Coast Guard text is a rule for a
class of US vessels. Neither is how any boat does it, and CLAUDE.md says to teach nothing beyond the public outline. A lesson could
use the ventilation idea only as an air-flow-and-concentration sum with labelled example numbers. Heat matters too: the FM Global data sheet
describes a positive loop (hot battery draws more float current, which adds heat).

### 7.4 Generator rooms and jacket-water coolers
- **Cummins: generator room air flow is set by the allowed temperature rise**
  - Source: tmp_3T5SZI. https://www.cummins.com/sites/default/files/2024-08/t030-Liquid-cooled-gen-set-application-manual.pdf
  - Quote: "The required air flow rate to maintain a specific temperature rise in the generator room is described by the formula:"
- **Generator sets are sold by electrical output but the cooler is sized on what the engine rejects**
  - Source: Marine Generator Set Cooling | Marine Heat Exchangers. https://www.marineheatexchanger.org/Applications/Engine-Cooling/Generator-Set-Cooling.html (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "Generator sets are sold by electrical output, but the cooler is sized on what the engine rejects."
- **Caterpillar marine installation guide: separate jacket water and after-cooler circuits, and a maximum coolant temperature at the pump inlet**
  - Source: 3600 Marine Engine Installation Guide. https://s7d2.scene7.com/is/content/Caterpillar/CM20160714-36168-02562
  - Quote: "The jacket water heat exchanger should be sized using a maximum coolant temperature at the jacket water pump inlet of 93°C"

My reading: generator sets are electrical outputs but cooling is sized on the engine's heat rejection; the cooler is a shell-and-tube
unit with seawater in the tubes; room air flow is set by the allowed temperature rise. These are general marine and industrial
practices and need no claim about any boat.

### 7.5 Pumps: the electrician's load
- **A pump's motor draws more than the shaft power, by the motor efficiency (this is the electrician's number)**
  - Source: Pump Power Calculator (Hydraulic, Shaft & Motor Input) | ElectroMechCalc. https://www.electromechcalc.com/mechanical/pump-power (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "the actual electrical power drawn from the supply — is higher again than the shaft power, by the motor's own efficiency:"
- **Pump input power from current and voltage includes motor and pump efficiencies (a process-plant formula page)**
  - Source: Pump related formulas | Power calculation, Total Head, NPSH, Affinity laws. https://www.sugarprocesstech.com/pump-related-formulas/ (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "Electrical Input Power} = \frac{\text{Pump Shaft Power}}{\eta_m} * + η m =motor efficiency"
- **Motor efficiency for industrial motors is typically 0.90 to 0.97**
  - Source: Powering the Flow: Sizing Electric Motors and VFDs for Industrial Pumps – Filipino Engineer. https://filipinoengineer.com/blog/2026/01/powering-the-flow-sizing-electric-motors-and-vfds-for-industrial-pumps.html (**SECONDARY**: a republisher, tutor or maker rather than the original)
  - Quote: "Motor efficiency (expressed as a decimal, typically 0\.90 to 0.97 for industrial motors)."

My reading: a pump has three efficiencies in a row: hydraulic power, shaft power (÷ pump efficiency), motor input (÷ motor
efficiency). Dan reads the last one off an ammeter. A sum that starts from a measured current and works back to flow or head is
the electrician's way into pumps.

### 7.6 Compressed air: receiver size and motor starts
- **A compressed air receiver's size sets how often the compressor motor starts**
  - Source: What is an Air Receiver? - Atlas Copco USA. https://www.atlascopco.com/en-us/compressors/wiki/compressed-air-articles/what-is-an-air-receiver
  - Quote: "This will also prevent pressure fluctuation and frequent motor starts, while providing steady pressure and extending the life of"

My reading: a bigger receiver means fewer compressor starts, which links straight to Motors (starting current).

### 7.7 A caution from IET
- **IET (BS 7671) view: unconfirmed manufacturer data on 90 C means the lower-rated tables stay in use**
  - Source: WIRING MATTERS ISSUE 93. https://electrical.theiet.org/media/3023/wiring-matters-issue-93-november-2022.pdf
  - Quote: "If manufacturers do not confirm their equipment is suitable to operate at a temperature in excess of 70 °C"

My reading: if a cable maker does not confirm 90 degrees C operation, the 70 degrees C tables apply. This is a good example of why the
temperature is the number, not the cable colour.


---

## 8. Size

Counts of what the benchmarks spend.

### 8.1 Brilliant's sizes
- **Brilliant: Physics of the Everyday is 33 lessons**
  - Source: Practice Physics of the Everyday | Brilliant. https://brilliant.org/courses/physics-of-the-everyday
  - Quote: "33 Lessons 208 Exercises"
- **Brilliant: Classical Mechanics is 48 lessons**
  - Source: Practice Classical Mechanics | Brilliant. https://brilliant.org/courses/dynamics-bootcamp
  - Quote: "48 Lessons 411 Exercises"
- **Brilliant: Scientific Thinking is 40 lessons**
  - Source: Practice Scientific Thinking | Brilliant. https://brilliant.org/courses/puzzle-science/
  - Quote: "40 Lessons 557 Exercises"
- **Brilliant: Science Puzzles is 59 lessons**
  - Source: Practice Science Puzzles | Brilliant. https://brilliant.org/courses/science-puzzles-long-set/
  - Quote: "59 Lessons 236 Exercises"

My reading: Brilliant spends 33 lessons on Physics of the Everyday (heat and fluids scattered through it) and 3 on
pressure, buoyancy and the ideal gas law inside a 48-lesson mechanics course.

### 8.2 Other cores' sizes
- **OpenStax University Physics Volume 2 chapter 1 has six sections**
  - Source: Ch. 1 Introduction - University Physics Volume 2 | OpenStax. https://openstax.org/books/university-physics-volume-2/pages/1-introduction
  - Quote: "1.1 Temperature and Thermal Equilibrium * 1.2 Thermometers and Temperature Scales * 1.3 Thermal Expansion * 1.4 Heat Transfer, Specific Heat, and Calorimetry * 1.5 Phase Changes * 1.6 Mechanisms of Heat Transfer"
- **OpenStax University Physics Volume 1 chapter 14 has seven sections**
  - Source: Ch. 14 Introduction - University Physics Volume 1 | OpenStax. https://openstax.org/books/university-physics-volume-1/pages/14-introduction
  - Quote: "14.1 Fluids, Density, and Pressure * 14.2 Measuring Pressure * 14.3 Pascal's Principle and Hydraulics * 14.4 Archimedes’ Principle and Buoyancy * 14.5 Fluid Dynamics * 14.6 Bernoulli’s Equation * 14.7 Viscosity and Turbulence"
- **Khan Academy AP Physics 2 Unit 1 is 14 items; the unit is the whole thermodynamics offer**
  - Source: Thermodynamics | AP®︎/College Physics 2 | Science | Khan Academy. https://www.khanacademy.org/science/ap-physics-2/x0e2f5a2c:thermodynamics
  - Quote: "10 skills Mastered Proficient Familiar Attempted Not started Quiz Unit test"

My reading: OpenStax spends 6 sections on temperature, heat and heat transfer, plus 4 or more on the first and second laws and
gases (chapters 2 to 4), plus 7 on fluids. Khan spends 14 items in one unit. That is about 13 lessons of university material for the same
ground without pumps or exchangers.

### 8.3 Course and unit sizes
- **BTEC National Unit 1 is 120 guided learning hours, a two-hour paper of 80 marks for all of mechanics, electrics and maths**
  - Source: Specification - Pearson BTEC Level 3 National Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/btec-nat-eng-cert-spec.pdf
  - Quote: "Written exam set and marked by Pearson. • Two hours. • 80 marks."

My reading: BTEC Unit 1 spends part of 120 guided hours on fluids; each HN unit (11 and 13) is a full 15-credit unit.
Eight lessons is therefore a compressed treatment, and the choice of what to leave out is the brief's. **Which core supports eight lessons for Dan:** the
eight-part scope above, with parts 5 and 6 (pressure in liquids and buoyancy) merged into one lesson and part 8 (pumps and pipes)
split in two (head, friction and pump power; the pump curve, NPSH and pump types). That is: 1 temperature and heat; 2 heat transfer and
cooling curves; 3 gases and the receiver; 4 the first law and heat engines; 5 pressure in liquids and buoyancy; 6 flow; 7 pipes and pump power;
8 the pump curve and its limits. Merging 5 and 6 is the safest cut because Unit 8 already gave Dan Archimedes. This is a reading, not a finding.

