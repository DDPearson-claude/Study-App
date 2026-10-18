# Trigonometry: research notes

Researched 18 Oct 2026 for the Trigonometry course brief (Maths shelf, Algebra folder; blurb "Sine, cosine and
tangent, from triangles to waves: AC, phasors and conduit bends."; benchmark "Brilliant: Trigonometry"). The brief
itself is not written here; these notes are its evidence. Dan is an electrician preparing for marine engineering
college (HNC/HND route). He has Fractions, Negative numbers, Percentages, Proportional reasoning, Solving equations,
The coordinate plane, Geometry fundamentals, Linear equations and Calculus fundamentals, and (being built in the same
push) Straight-line graphs, Linear systems, Powers and roots, Functions and their graphs, Quadratics and
polynomials, and Exponentials and logarithms. Complex numbers comes after this course.

Every finding below has its source title, URL and the exact words. The words were copied from the saved tool results
by script (`quotes.json` beside this file is the same list; none was retyped here) and checked with
`node tools/eval/sources.mjs --quotes ... --tools ...` (`failed: 0`). The tool files are in `tools/`. Six tool files
(`02`, the Brilliant courses page, from the Calculus fundamentals research; `20`, `21`, `22`, the MCA syllabus
fetches, and `34`, `39`, the SQA H7K0 33 fetches, from the Calculus fundamentals build) were copied unchanged and are
quoted from there; the rest are this run's own calls, harvested from its transcript. Findings I could not confirm are
marked **UNCONFIRMED**; where only a non-original site said it, **SECONDARY** (a tutorial, revision or forum site, a
page that republishes a textbook, or a page that only reports a paper). My own readings are marked "My reading" and
are not quotes. Numbers I computed myself are in section 10, with the rule shown.

Two things about the tools. The connector cuts each search result to about 12 KB, so later results show only their
first lines; every quote here is from text the checker can see, and a few findings were re-fetched page by page to
get them. And Brilliant has no page called `/courses/trigonometry/` (it returns the courses index): the course is
`Trigonometric Functions`.

---

## 1. Benchmark: Brilliant's Trigonometric Functions

### 1.1 The course itself
Brilliant's page is `brilliant.org/courses/trigonometric-functions/` (grades 11 to 12). It was seen in two states:
62 lessons in 12 levels, and 70 lessons in 14 levels (Functions of Time and Combining Functions were added). Either
way it is about eight times the size Dan's course can have (seven to nine lessons).

- **Brilliant Trigonometric Functions: 62 lessons in an earlier listing**
  - Source: Practice Trigonometric Functions | Brilliant. https://brilliant.org/courses/trigonometric-functions/
  - Quote: "Explore how periodic patterns and circular motion give rise to trigonometric functions. 62 Lessons 1125 Exercises"
- **Brilliant Trigonometric Functions: 70 lessons, 14 levels in the current listing**
  - Source: Practice Trigonometric Functions | Brilliant. https://brilliant.org/courses/trigonometric-functions/graphing-sine-and-cosine?lesson=the-sine-graph
  - Quote: "Explore how periodic patterns and circular motion give rise to trigonometric functions. 70 Lessons 1327 Exercises"


### 1.2 The levels, in order (current listing, 14 levels, 70 lessons)
One line for the brief: Periodic functions; periodic functions from circular motion; sine and cosine; right-triangle
trigonometry (the Pythagorean identity, 45-45-90, 30-60-90, key angles); arc length and radians; working in radians;
cosine and sine with radian input; graphing sine and cosine; the tangent function; transforming trig functions
(amplitude, midline, phase); functions of time; solving trig equations; inverse trig functions; combining functions.

- **Levels 1 to 3: periodic functions, circular motion, sine and cosine**
  - Source: Practice Trigonometric Functions | Brilliant. https://brilliant.org/courses/trigonometric-functions/graphing-sine-and-cosine?lesson=the-sine-graph
  - Quote: "Level 1 Periodic Functions Periodic Phenomena The Period of a Function Horizontal Shifts of Periodic Functions Midline of a Periodic Function Amplitude of a Periodic Function Predator and Prey Level Check Level 2 Periodic Functions from Circular Motion Sine from Circular Motion Cosine from Circular Motion Period and Speed Level Check Level 3 Sine and Cosine The Unit Circle The Cosine Function The Sine Function Cosine & Sine Together Complementary Angles"
- **Levels 4 to 6: the Pythagorean identity, special triangles, arc length, radians**
  - Source: Practice Trigonometric Functions | Brilliant. https://brilliant.org/courses/trigonometric-functions/graphing-sine-and-cosine?lesson=the-sine-graph
  - Quote: "Level 4 Right Triangle Trigonometry The Pythagorean Identity Triangles and the Unit Circle The 45-45-90 Triangle 30-60-90 Triangles Key Angles on the Unit Circle Level 5 Arc Length and Radians Arc Length on the Unit Circle Arc Length on Any Circle Radians Level 6 Working in Radians Degrees to Radians Radians to Degrees Angle Identification Coterminal Angles Negative Angles"
- **Levels 7 to 9: radians in sine and cosine, the graphs, tangent**
  - Source: Practice Trigonometric Functions | Brilliant. https://brilliant.org/courses/trigonometric-functions/graphing-sine-and-cosine?lesson=the-sine-graph
  - Quote: "Level 7 Cosine and Sine with Radian Input Evaluating Cosine and Sine with Radians Unit Circle Coordinates of 1, 0, and -1 Repeated Values of Cosine and Sine Negative Values of Cosine Negative Values of Sine Evaluating Sine and Cosine Level 8 Graphing Sine and Cosine The Sine Graph The Cosine Graph Cosine and Sine at Negative Angles Sine and Cosine after 2π Half-period shifts of Cosine and Sine Quarter-period Shifts Level 9 The Tangent Function Tangent Tangent and Triangles Values of Tangent Tangent in Four Quadrants The Graph of Tangent"
- **Levels 10 to 12: transforming waves, functions of time, trig equations**
  - Source: Practice Trigonometric Functions | Brilliant. https://brilliant.org/courses/trigonometric-functions/graphing-sine-and-cosine?lesson=the-sine-graph
  - Quote: "Level 10 Transforming Trig Functions Horizontal Stretches Period of a Wave Rational Periods Amplitude Midline Shifts Phase Shifts General Transformations Level 11 Functions of Time Interpreting Time Functions Modeling with Cosine Time Offset Interpreting Models Level 12 Solving Trigonometric Equations Equations in cos(θ) and sin(θ) Infinitely Many Solutions All Solutions to Trig Equations Trig Equations with Dilations Non-linear Trig Equations"
- **Levels 13 and 14: inverse trig functions, combining functions**
  - Source: Practice Trigonometric Functions | Brilliant. https://brilliant.org/courses/trigonometric-functions/graphing-sine-and-cosine?lesson=the-sine-graph
  - Quote: "Level 13 Inverse Trigonometric Functions Inverse Cosine Graphing Inverse Cosine Inverse Sine Inverse Tangent Solving Equations with Inverse Cosine Solving Equations with Inverse Sine Level 14 Combining Functions Changing Oscillations Changing Midline Changing Amplitude Combined Models"


My reading of the order. Brilliant starts from repeating graphs and circular motion, not from triangles. The
right triangle arrives at level 4, and arrives as the unit circle's special triangles and the identity, not as
"opposite over hypotenuse". Radians get three levels. There is no sine rule, no cosine rule, no phasor, no power
factor in the level list (the lists have none of those words), and no finding sides of a triangle from an angle as a
topic. So Brilliant's course is the wave half of Dan's course, plus radians; the triangle half and the AC half come
from the other benchmarks and the HN and MCA lines.

### 1.3 Description and what it promises

- **Brilliant starts from periodic graphs, not triangles**
  - Source: Practice Trigonometric Functions | Brilliant. https://brilliant.org/courses/trigonometric-functions/graphing-sine-and-cosine?lesson=the-sine-graph
  - Quote: "This course starts with periodic functions: reading graphs, identifying period, amplitude, and midline, and predicting future behavior from a repeating pattern."
- **Brilliant outcome: degrees and radians, the unit circle, graphs, circular motion and triangle geometry**
  - Source: Practice Trigonometric Functions | Brilliant. https://brilliant.org/courses/trigonometric-functions/graphing-sine-and-cosine?lesson=the-sine-graph
  - Quote: "By the end of this course, you'll be able to measure angles in both degrees and radians, evaluate sine and cosine at any angle on the unit circle, and understand the deep connection between periodic graphs, circular motion, and triangle geometry."
- **Brilliant uses a dynamic unit circle**
  - Source: Practice Trigonometric Functions | Brilliant. https://brilliant.org/courses/trigonometric-functions/
  - Quote: "Using interactive graphs and a dynamic unit circle, you'll build intuition for trigonometric functions from the ground up."

The pictures inside each lesson are **UNCONFIRMED** (I did not see a lesson; the pages give titles only).

### 1.4 Where it sits in Brilliant's path

- **Brilliant puts Trigonometric Functions first in Advanced Algebra, then Polynomials, Logarithms, Polar and Complex Numbers**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "GR 11–12 Trigonometric Functions GR 11–12 Polynomials New GR 11–12 Equations and Curves New GR 11–12 Logarithms GR 12 Polar Coordinate Plane GR 11–12 Complex Numbers"
- **Brilliant lists Introduction to Functions, Linear Systems, Quadratics, Exponential Functions in the band before**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "GR 8–9 Introduction to Functions GR 8–9 Linear Systems New GR 9 Quadratics GR 8–9 Coordinate Transformations GR 9–10 Exponential Functions"
- **Brilliant: most Algebra 2 courses end by introducing trigonometry as a function, not just triangle ratios**
  - Source: Does Brilliant cover Algebra 2? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-algebra-2
  - Quote: "Most Algebra 2 courses end by introducing trigonometry as a function, not just as triangle ratios."

My reading: Brilliant puts Trigonometric Functions first in "Advanced Algebra", before Polynomials, Logarithms, Polar
Coordinate Plane and Complex Numbers, after Introduction to Functions, Linear Systems, Quadratics, Coordinate
Transformations and Exponential Functions. Dan's folder has the same neighbours but puts Trigonometry after
Exponentials and logarithms and straight before Complex numbers. Brilliant's page calls it the course where
trigonometry stops being "just triangle ratios", which is the step from lesson 3 to lesson 4 of Dan's course.

---

## 2. Other courses on the same ground

### 2.1 Khan Academy: Trigonometry (4 units)
Right triangles; trigonometric functions (radians, unit circle, identity, special angles, sinusoids, modelling);
non-right triangles (laws of sines and cosines); trigonometric equations and identities.

- **Khan Academy Trigonometry has four units**
  - Source: Trigonometry | Khan Academy. https://www.khanacademy.org/mathematics/trigonometry
  - Quote: "Trigonometry 4 units Unit 1 Right triangles & trigonometry Unit 2 Trigonometric functions Unit 3 Non-right triangles & trigonometry Unit 4 Trigonometric equations and identities"
- **Khan unit 1 lessons: ratios, sides, angles, word problems, reciprocal ratios**
  - Source: Trigonometry | Khan Academy. https://www.khanacademy.org/mathematics/trigonometry
  - Quote: "Use ratios in right triangles 3. Trigonometric ratios in right triangles 4. Right triangles & trigonometry: Quiz 1 5. Solve for a side in right triangles 6. Solve for an angle in right triangles 7. Relate ratios in right triangles 8. Right triangle trigonometry word problems 9. Right triangles & trigonometry: Quiz 2 10. Reciprocal trig ratios 11. Right triangles & trigonometry: Unit test"
- **Khan unit 1 builds the ratio from similarity**
  - Source: Trigonometry | Khan Academy. https://www.khanacademy.org/mathematics/trigonometry
  - Quote: "Getting ready for right triangles and trigonometry 2. Hypotenuse, opposite, and adjacent 3. Side ratios in right triangles as a function of the angles 4. Using similarity to estimate ratio between side lengths 5. Using right triangle ratios to approximate angle measure"
- **Khan unit 2: unit circle, radians, Pythagorean identity, special angles, sinusoids, modelling**
  - Source: Trigonometry | Khan Academy. https://www.khanacademy.org/mathematics/trigonometry
  - Quote: "Unit 2: Trigonometric functions 13. Unit circle 14. Radians & degrees 15. Unit circle (with radians) 16. Use the Pythagorean identity 17. Trig values of π/6, π/4, and π/3 18. Trig identities from reflections and rotations 19. Trig values of special angles 20. Trigonometric functions: Quiz 1 21. Midline of sinusoidal functions from graph 22. Amplitude of sinusoidal functions from graph 23. Period of sinusoidal functions from graph 24. Amplitude of sinusoidal functions from equation 25. Midline of sinusoidal functions from equation 26. Period of sinusoidal functions from equation 27. Trigonometric functions: Quiz 2 28. Graph sinusoidal functions 29. Construct sinusoidal functions 30. Graph sinusoidal functions: phase shift 31. Interpret trigonometric graphs in context 32. Model with sinusoidal functions 33. Modeling with sinusoidal functions: phase shift 34. Trigonometric functions: Quiz 3 35. Trigonometric functions: Unit test"
- **Khan units 3 and 4: law of sines and cosines, inverse trig, sinusoidal equations**
  - Source: Trigonometry | Khan Academy. https://www.khanacademy.org/mathematics/trigonometry
  - Quote: "Unit 3: Non-right triangles & trigonometry 37. Solve triangles using the law of sines 38. Solve triangles using the law of cosines 39. General triangle word problems 40. Non-right triangles & trigonometry: Unit test 41. Unit 4 Unit 4: Trigonometric equations and identities 42. Evaluate inverse trig functions 43. Solve sinusoidal equations (basic) 44. Solve sinusoidal equations 45. Interpret solutions of trigonometric equations in context 46. Sinusoidal models word problems"
- **Khan course description**
  - Source: Trigonometry | Khan Academy. https://www.khanacademy.org/trigonometry
  - Quote: "Explore the world of trigonometry by mastering right triangles and their applications, understanding and graphing trig functions, solving problems involving non-right triangles, and unlocking the power of trigonometric equations and identities. This course builds foundational skills and real-world problem-solving techniques essential for advanced math and science studies."


### 2.2 BBC Bitesize and SQA (National 5, GCSE, Higher)
Bitesize National 5 "Trigonometric skills" has five items: graphs of trig functions, trig relationships in degrees
(signs by quadrant), the area of a triangle, the sine and cosine rules, and bearings. SQA Higher adds radians, the
addition formulae and the wave function. SQA says trigonometry is a tenth to a quarter of the Higher marks.

- **Bitesize National 5 trigonometric skills**
  - Source: Trigonometric skills - National 5 Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/topics/zt7wb82
  - Quote: "Working with the graphs of trigonometric functions Trigonometric graphs can be sketched when you know the amplitude, period, phase and maximum and minimum turning points. * Working with trigonometric relationships in degrees Trigonometric functions can have several solutions. Sine, cosine and tangent all have different positive or negative values depending on what quadrant they are in. * Calculating the area of a triangle using trigonometry Trigonometry can be used to find the area of a triangle when you know the length of two sides and the included angle. * Using the sine and cosine rules to find a side or angle in a triangle The sine rule can find a side from another side and two angles or an angle from two sides and a non-included angle. The cosine rule can find a side from two sides and the included angle, or an angle from three sides. * Using bearings in trigonometry Bearings are angles used in navigation. They are based on moving clockwise from due north. Missing information about bearings can be worked out using the sine and cosine rules."
- **Bitesize GCSE geometry: right-angled trigonometry, exact values, sine and cosine rules**
  - Source: Geometry and measure - GCSE Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/topics/zs2pdmn
  - Quote: "Revise finding the length of a side with an unknown numerator or denominator and using trigonometry to calculate an unknown angle, with interactive activities and a quiz. * NEW: Exact trigonometric values Revise how to find exact trigonometric values for sinθ, cosθ and tanθ and to solve problems. This guide contains a video, quiz and exam style questions. * NEW: Higher – Sine rule Revise finding an unknown side or angle using the sine rule, and the ambiguous case when finding unknown angles."
- **SQA National 5 suggests showing two waves adding**
  - Source: National 5 Mathematics Course Specification. https://www.sqa.org.uk/files_ccc/n5-course-spec-mathematics.pdf
  - Quote: "Consider including software displays involving addition (superposition/interference) of two waves (eg same wavelength, different phase or same phase at origin, slightly different wavelengths)."
- **SQA National 5 uses the graphs to find further solutions**
  - Source: National 5 Mathematics Course Specification. https://www.sqa.org.uk/files_ccc/n5-course-spec-mathematics.pdf
  - Quote: "Use the graphs of sine/cosine to increase understanding and use symmetry in these graphs to find further solutions to trigonometric equations."
- **SQA Higher: trig equations in degrees or radians, wave function**
  - Source: Higher Mathematics Course Specification. https://www.sqa.org.uk/sqa/files_ccc/h-course-spec-mathematics.pdf
  - Quote: "solving trigonometric equations in degrees or radians, including those involving the wave function or trigonometric formulae or identities, in a given interval"
- **SQA Higher: no degree symbol means radians**
  - Source: Higher Mathematics Course Specification. https://www.sqa.org.uk/sqa/files_ccc/h-course-spec-mathematics.pdf
  - Quote: "explain that in the absence of a degree symbol, candidates should use radians in solutions"
- **SQA Higher: share of marks for trigonometry**
  - Source: Higher Mathematics Course Specification. https://www.sqa.org.uk/sqa/files_ccc/h-course-spec-mathematics.pdf
  - Quote: "Approximately 30–45% of the overall marks relate to algebra. Approximately 15–35% of the overall marks relate to geometry. Approximately 15–40% of the overall marks relate to calculus. Approximately 10–25% of the overall marks relate to trigonometry."


### 2.3 HELM (Loughborough): Workbook 4, Trigonometry (77 pages)
Order: right-angled triangles; trigonometric functions (radians, any angle, graphs); identities; applications to
triangles (sine and cosine rules); applications to waves (amplitude, period, time shift, two waves of one frequency
combined as one). Complex numbers is a separate workbook (HELM 10), so HELM's wave section needs no complex numbers.

- **HELM Workbook 4 contents: five sections**
  - Source: HELM workbook 4 - Trigonometry. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%204%20Trigonometry.pdf
  - Quote: "Contents Contents 4 Trigonometry 4.1 Right-angled Triangles 2 4.2 Trigonometric Functions 19 4.3 Trigonometric Identities 36 4.4 Applications of Trigonometry to Triangles 53 4.5 Applications of Trigonometry to Waves 65"
- **HELM 4.1 learning outcomes**
  - Source: 44. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%204%20Trigonometry.pdf
  - Quote: "define trigonometric functions both in right-angled triangles and more generally _•_ express angles in degrees _•_ calculate all the angles and sides in any right-angled triangle given certain information"
- **HELM 4.2 learning outcomes: radians, general definitions, graphs**
  - Source: HELM workbook 4 - Trigonometry. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%204%20Trigonometry.pdf
  - Quote: "express angles in radians • define trigonometric functions generally • sketch the graphs of the three main trigonometric functions: sin , cos , tan"
- **HELM 4.4 the cosine rule is for two sides and the angle between**
  - Source: 44. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%204%20Trigonometry.pdf
  - Quote: "It is particularly useful for the case where the Sine rule cannot be used, i.e. when two sides of the triangle are known together with the angle between these two sides."
- **HELM 4.5 learning outcomes: describe waves, combine two waves of one frequency**
  - Source: 44. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%204%20Trigonometry.pdf
  - Quote: "use simple trigonometric functions to describe waves _•_ combine two waves of the same frequency as a single wave in amplitude-phase form"
- **HELM 4.5 introduction: sinusoids need sine and cosine**
  - Source: 44. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%204%20Trigonometry.pdf
  - Quote: "Waves and vibrations occur in many contexts. The water waves on the sea and the vibrations of a stringed musical instrument are just two everyday examples. If the vibrations are simple ‘to and fro’ oscillations they are referred to as ‘sinusoidal’ which implies that a knowledge of trigonometry, particularly of the sine and cosine functions, is a necessary pre-requisite for dealing with their analysis. In this Section we give a brief introduction to this topic."
- **HELM list: Trigonometry is workbook 4 and Complex Numbers is workbook 10**
  - Source: Helping Engineers Learn Mathematics Workbooks (HELM) | Mathematics Learning Support Centre | Loughborough University. https://www.lboro.ac.uk/departments/mlsc/student-resources/helm-workbooks/
  - Quote: "HELM 4: Trigonometry ‌ HELM 5: Functions and Modelling ‌ HELM 6: Exponential and Logarithmic Functions HELM 7: Matrices HELM 8: Matrix Solution of Equations HELM 9: Vectors HELM 10: Complex Numbers"


### 2.4 Bird's Engineering Mathematics (9th edition)
Section 2, Trigonometry: introduction; waveforms; Cartesian and polar co-ordinates; triangles and practical
applications; identities and equations; compound angles. Complex numbers (32, 33) and then Vectors, which ends
with "Methods of adding alternating waveforms" (35), come after it.

- **Bird's Section 2 is Trigonometry, six chapters**
  - Source: Bird's Engineering Mathematics - 9th Edition - John Bird - Routledge B. https://www.routledge.com/Birds-Engineering-Mathematics/Bird/p/book/9780367643782
  - Quote: "Section 2: Trigonometry 17. Introduction to trigonometry 18. Trigonometric waveforms 19. Cartesian and polar co-ordinates 20. Triangles and some practical applications 21. Trigonometric identities and equations 22. Compound angles"
- **Bird's Section 5 complex numbers and Section 6 vectors including adding alternating waveforms come after**
  - Source: Bird's Engineering Mathematics - 9th Edition - John Bird - Routledge B. https://www.routledge.com/Birds-Engineering-Mathematics/Bird/p/book/9780367643782
  - Quote: "Section 5: Complex numbers 32. Complex numbers 33. De Moivre’s theorem Section 6: Vectors 34. Vectors 35. Methods of adding alternating waveforms"
- **Bird's approach**
  - Source: Bird's Engineering Mathematics - 9th Edition - John Bird - Routledge B. https://www.routledge.com/Birds-Engineering-Mathematics/Bird/p/book/9780367643782
  - Quote: "Mathematical theories are explained in a straightforward manner, supported by practical engineering examples and applications to ensure that readers can relate theory to practice."

My reading of the order across the five. Everyone does right triangles first except Brilliant. Bitesize, HELM and
Bird do the sine and cosine rules before waves; Khan puts waves before the rules. HELM and Bird keep waves (and
adding them) in the trigonometry book without complex numbers; Bird's chapter on adding alternating waveforms
comes after complex numbers. For Dan: triangles, radians, circle to wave, wave features, rules for any triangle,
adding two waves with turning arrows, power factor. Complex-number phasors wait for Complex numbers.

---

## 3. What a marine engineering HNC uses of this

### 3.1 SQA Higher National (Scotland)
H7K0 33 Engineering Mathematics 1 (SCQF level 6, 2014) has trigonometric equations as its first outcome, with the
radian introduced and one problem in degrees and one in radians. The older SQA unit (Introductory Mathematics for
Engineering, 2001) is more explicit about waves: amplitude, phase and period. Vectors and complex numbers are Outcome
3 of H7K0 33 (deferred to Complex numbers). The exact formula in H7K0 33's evidence requirement was garbled in the
text the tool returned (an equation image), so "expressions of the form A cos(nx + B)" is **UNCONFIRMED** as to the
exact form.

- **SQA HN Engineering Mathematics 1 (H7K0 33): outcome 1 is functions and trigonometric equations**
  - Source: Engineering Mathematics 1 (SCQF level 6) Unit code: H7K0 33. https://www.sqa.org.uk/files/hn/H7K033.pdf
  - Quote: "Solve problems involving functions and trigonometric equations. 2 Solve problems involving exponential and logarithmic equations. 3 Apply mathematical techniques involving vectors and complex numbers. Credit points and level Entry requirements are at the discretion of the centre. However, it would be advantageous if learners had good algebraic skills together with an ability to transpose engineering formulae and solve simple trigonometric equations. Outcome 1 Solve problems involving functions and trigonometric equations. Knowledge and/or Skills  Properties of functions  Inverse functions  Composite Functions  Trigonometric equations"
- **SQA H7K0 33 entry: transpose formulae and solve simple trig equations**
  - Source: Engineering Mathematics 1 (SCQF level 6) Unit code: H7K0 33. https://www.sqa.org.uk/files/hn/H7K033.pdf
  - Quote: "it would be advantageous if learners had good algebraic skills together with an ability to transpose engineering formulae and solve simple trigonometric equations."
- **SQA H7K0 33 purpose**
  - Source: Engineering Mathematics 1 (SCQF level 6) Unit code: H7K0 33. https://www.sqa.org.uk/files/hn/H7K033.pdf
  - Quote: "This Unit is designed to develop or consolidate a basic level of mathematical skills required of learners across a range of Engineering disciplines. The Unit provides learners with opportunities to develop knowledge, understanding and skills to solve mathematical problems including polynomial, trigonometrical, exponential and logarithmic functions."
- **SQA H7K0 33 evidence: one problem in degrees and one in radians**
  - Source: Engineering Mathematics 1 (SCQF level 6) Unit code: H7K0 33. https://www.sqa.org.uk/sqa/files/hn/H7K033.pdf
  - Quote: "Solve two problems (one in degrees and one in radians) involving expressions of the form"
- **SQA H7K0 33 guidance: introduce the radian**
  - Source: Engineering Mathematics 1 (SCQF level 6) Unit code: H7K0 33. https://www.sqa.org.uk/sqa/files/hn/H7K033.pdf
  - Quote: "Introduce the concept of the radian Convert degrees to radians and vice versa"
- **SQA earlier HN unit: analyse trig functions by amplitude, phase and period**
  - Source: SCOTTISH VOCATIONAL EDUCATION COUNCIL. https://www.sqa.org.uk/files/hn/D7481997.pdf
  - Quote: "The analysis of trigonometric functions and their graphs in terms of amplitude, phase and period is correct."
- **SQA earlier HN unit: a worked trig-equation example with 100 pi t**
  - Source: SCOTTISH VOCATIONAL EDUCATION COUNCIL. https://www.sqa.org.uk/files/hn/D7481997.pdf
  - Quote: "Solution of simple trigonometric equations eg 10 sin 100πt = - 8.3."
- **SQA earlier HN unit: one solution in radians, one in degrees**
  - Source: SCOTTISH VOCATIONAL EDUCATION COUNCIL. https://www.sqa.org.uk/files/hn/D7481997.pdf
  - Quote: "At least one of the correct solutions for Performance Criterion (b) must have angles specified in radians, and one must have angles specified in degrees."


### 3.2 Pearson BTEC HN, Unit 4002 Engineering Mathematics (2024 descriptors)
Unit 4002 is a core mandatory Level 4 unit in Pearson's Manufacturing Engineering HNC (quoted below); I did not
retrieve the equivalent line for the plain Engineering HNC, so that is **UNCONFIRMED** for Dan's route. The fetched pages gave the outcomes and
criteria, not the full "Essential Content" list for LO3, so the exact content topics under "sinusoidal wave and vector
functions" are **UNCONFIRMED** for 2024; the older (2010) unit shows what that content has meant.

- **Pearson Unit 4002 aim**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "The aim of this unit is to develop students’ skills in the mathematical principles and theories that underpin the engineering curriculum. Students will be introduced to mathematical methods and statistical techniques in order to analyse and solve problems within an engineering and manufacturing context."
- **Pearson Unit 4002 P3: engineering equations with trigonometric functions**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "P3 Determine solutions of engineering equations using exponential, logarithmic, trigonometric, and hyperbolic functions."
- **Pearson Unit 4002 LO3: sinusoidal wave and vector functions**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "LO3 Use analytical and computational methods for solving engineering and manufacturing sector problems by relating sinusoidal wave and vector functions to their respective applications"
- **Pearson Unit 4002 P6 sinusoidal functions**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "P6 Solve engineering/ manufacturing problems relating to sinusoidal functions."
- **Pearson Unit 4002 M3 compound angle identities combine sine waves**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "M3 Use compound angle identities to combine individual sine waves into a single wave, and illustrate graphically."
- **Pearson Level 4 units list 4002 Engineering Mathematics**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "4002 Engineering Mathematics [Previous tile: Engineering Maths]"
- **Pearson earlier HN unit (2010 spec): sinusoidal functions, radian measure, AC waveforms and phase shift**
  - Source: BTEC Higher Nationals units - Pearson qualifications. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/Operations-Engineering/2010/Specification/9781446955215-HNCD-L45-in-Engineering-units-Iss3.pdf
  - Quote: "Sinusoidal functions: review of the trigonometric ratios; Cartesian and polar co-ordinate systems; properties of the circle; radian measure; sinusoidal functions Applications: angular velocity, angular acceleration, centripetal force, frequency, amplitude, phase, the production of complex waveforms using sinusoidal graphical synthesis, AC waveforms and phase shift"
- **Pearson earlier HN unit: learning outcome 2.2**
  - Source: BTEC Higher Nationals units - Pearson qualifications. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/Operations-Engineering/2010/Specification/9781446955215-HNCD-L45-in-Engineering-units-Iss3.pdf
  - Quote: "2.2 use sinusoidal functions and radian measure to solve engineering problems"
- **Pearson HN advice on GCSE maths and diagnostic assessment**
  - Source: Engineering High - Pearson qualifications. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/General-Engineering/2024/specification-and-sample-assessments/btec-hncd-engineering-2024.pdf
  - Quote: "we strongly recommend that all students complete diagnostic mathematics assessments before beginning a Higher National course, as well as having a grade 9 to 4 or A* to C in GCSE Mathematics."
- **Pearson HN Manufacturing Engineering lists Unit 4002 as core mandatory**
  - Source: BTEC Higher Nationals in Manufacturing Engineering for England: Specification. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/manufacturing-engineering-for-england/2024/specification/9781292448497-btec-hn-l4-l5-man-engin-england.pdf
  - Quote: "Core Mandatory Unit 4002: Engineering Maths 15 4"


### 3.3 MCA engineer officer syllabuses (GOV.UK)
The Second Engineer Mathematics syllabus has a full trigonometry section (degrees and radians, the six ratios, any
angle, right triangles, the sine rule, the cosine rule, any triangle) and two graph lines for waves
(a sin mx + b cos nx, and a tan mx). Marine Electro-technology has e = Emax sin 2πft, phasors, adding ac voltages by
phasors, phasor diagrams for R, L, C, and power factor. The Applied Mechanics list resolves forces and vectors into
perpendicular components. The 2023 cadet-training syllabus review (consultation templates) marks the Marine
Engineering "Engineering Mathematics 2" trig outcome "Modernise", wants waves shown graphically and used on ship,
and keeps compound angle formulae in the list. (The text of line "e = E MAX sin 2reft" is the page's own OCR
rendering of "2πft".)

- **MCA Second Engineer Mathematics 5.1: degrees and radians, six ratios, quadrants, right triangles, sine rule, cosine rule**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "States that angles are measured in degrees or radians and relates the two. 2. Defines acute, right, obtuse and reflex angles. 3. Defines complementary angles and supplementary angles. 4. Defines Sine, Cosine, Tangent, Secant, Cosecant, Cotangent and the relationships between them. 5. Determines Sin, Cos and Tan from given right angled triangle. 6. Reads values of Sin, Cos, Tan, Sec, Cosec and Cot for any angle between 0’ and 90’. 7. Determines an angle from tables knowing its sin, cos, tan, sec, cosec or cot. 8. Determines values of sin, etc, for angles 90’ - 360’ and also is able to obtain an angle (00 - 360’) knowing its sin, etc. 9. States the theorem of Pythagoras. 10. Solves right angled triangles for any side or angle. 11. States the Sine Rule. 12. States the Cosine Rule. 13. Solves any triangle for any side or angle using the above rules."
- **MCA Second Engineer Mathematics 4.1: graphs of a sin mx + b cos nx**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "Solves graphic problems of trigometric form no more complex than y = a sin mx + b cos nx, and finds the solution of simultaneous equations involving such graphs. 17. Solves graphical problems of the form y = a tan mx."
- **MCA Marine Electro-technology: e = Emax sin 2 pi f t (OCR gives 2reft)**
  - Source: Marine Electro-technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "States that e = E MAX sin 2reft volts."
- **MCA Marine Electro-technology: phasor, adding ac voltages by phasors**
  - Source: Marine Electro-technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Explains the term phasor quantity. 20. Explains how phasors may be used to represent sinusoidal quantities. 21. Solves graphical problems involving addition and subtraction of ac voltages and currents using phasor method."
- **MCA Marine Electro-technology: phasor diagram, power factor**
  - Source: Marine Electro-technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Draws a phasor diagram from the results in 2.1.33 and calculates the power factor and capacitance/inductance of the circuit."
- **MCA Marine Electro-technology: phasor diagrams for R, L, C and leading and lagging**
  - Source: Marine Electro-technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Draws phasor diagrams for pure resistive, inductive and capacitive circuits and distinguishes between in phase, lagging and leading currents."
- **MCA General Engineering Science I 1.4: degrees to radians, right-angled triangles, similar triangles**
  - Source: General Engineering Science I Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses
  - Quote: "Convert degrees to radians and vice-versa. 2. Solve problems relating to right angle triangles given two facts about the triangle. 3. Solve problems on similar triangles."
- **MCA General Engineering Science I: resolve forces into components**
  - Source: General Engineering Science I Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses
  - Quote: "Resolve forces in horizontal and vertical components restricted to the first quadrant."
- **MCA Applied Mechanics: resolve vectors into perpendicular components**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Resolves vectors into mutually perpendicular components."
- **MCA Applied Mechanics: forces on an inclined plane**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Resolves forces acting on a body resting on a frictionless plane inclined to the horizontal."
- **MCA cadet syllabus review, Marine Engineering Engineering Mathematics 2: trig outcome and waves**
  - Source: 09. Marine Engineering - Engineering Mathematics 2 - GOV.UK. https://www.gov.uk/government/consultations/cadet-training-modernisation-programmesyllabus-review-sixth-group-of-consultation-templates/09-marine-engineering-engineering-mathematics-2
  - Quote: "Outcome1: Solve trigonometric and hyperbolic function problems | Modernise"
- **MCA cadet syllabus review: include graphical representation of waves, show use on ship**
  - Source: 09. Marine Engineering - Engineering Mathematics 2 - GOV.UK. https://www.gov.uk/government/consultations/cadet-training-modernisation-programmesyllabus-review-sixth-group-of-consultation-templates/09-marine-engineering-engineering-mathematics-2
  - Quote: "Include graphical representation of waves Contextualise in an applied maths sense. Show how they are used on ship and where problems can arise."
- **MCA cadet syllabus review: compound angle formulae**
  - Source: 09. Marine Engineering - Engineering Mathematics 2 - GOV.UK. https://www.gov.uk/government/consultations/cadet-training-modernisation-programmesyllabus-review-sixth-group-of-consultation-templates/09-marine-engineering-engineering-mathematics-2
  - Quote: "1.2 Compound angle formulae | Modernise"
- **MCA cadet syllabus review, ETO Mathematics for Engineering 1: functions and trig equations kept**
  - Source: 01. ETO - Mathematics for Engineering - GOV.UK. https://www.gov.uk/government/consultations/cadet-training-modernisation-programmesyllabus-review-first-group-of-consultation-templates/01-eto-mathematics-for-engineering
  - Quote: "Outcome 1: Solve problems involving functions and trigonometric equations. | Keep | Remains relevant"


---

## 4. The scope, part by part

### 4.1 Right-angled triangles: sin, cos, tan as ratios, finding sides and angles, slope
Why the ratio exists: similar triangles. Sides are named from the angle being used. Finding a side is label, choose,
calculate; finding an angle uses the inverse function. A line's slope m is the tangent of the angle it makes (that
was deferred here by Straight-line graphs).

- **Trig ratios compare two sides**
  - Source: Introduction to trigonometry for right-angled triangles. https://www.bbc.co.uk/bitesize/articles/zyjtfdm
  - Quote: "Trigonometric ratios show how long one side of the triangle is compared to another."
- **Similar triangles have sides in the same proportion**
  - Source: Introduction to trigonometry for right-angled triangles. https://www.bbc.co.uk/bitesize/articles/zyjtfdm
  - Quote: "The angles in similar triangles are the same. The sides of similar triangles are in the same proportion"
- **Sides are named from the angle**
  - Source: Hypotenuse, opposite, and adjacent (article) | Khan Academy. https://www.khanacademy.org/math/trigonometry/trigonometry-right-triangles/xfefa5515:ratios-in-right-triangles/a/opposite-adjacent-hypotenuse
  - Quote: "These sides are labeled in relation to an angle. The opposite side is across from a given angle."
- **Finding a side: label, choose the ratio, calculate**
  - Source: Module 3 (M3) - geometry & measures - trigonometry - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zms9239
  - Quote: "To find the length of a side when an angle and the length of one side are known: * Label the sides of the triangle, * Select the appropriate trig ratio by identifying which sides will be used, * Use the trig ratio to calculate the missing side length."
- **Finding an angle uses the inverse function**
  - Source: Finding angles in right-angled triangles - KS3 Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zk6b9ty
  - Quote: "An inverse function takes the output and does the opposite to get back to the input."
- **Elevation and depression are part of the Bitesize unit**
  - Source: Module 3 (M3) - geometry & measures - trigonometry - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zms9239
  - Quote: "Trigonometry ratios, sine, cosine and tangent can be used to calculate lengths of sides and sizes of angles in right-angled triangles."
- **Slope: a line y = mx + c makes an angle with tan theta = m**
  - Source: Mathematical Explorations. https://sheffield.ac.uk/media/32127/download?attachment
  - Quote: "If a line has the equation _y_ = _mx_ + _c_ then the angle _θ_ which the line makes with the _x_ -axis satisfies tan( _θ_ ) = _m_ ."
- **In similar right-angled triangles the ratio is the same however big the triangle**
  - Source: Introduction to trigonometry for right-angled triangles - KS3 Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zyjtfdm
  - Quote: "For similar right-angled triangles, the hypotenuse , opposite and adjacent sides stay in the same proportion . For example, the adjacent side divided by the hypotenuse will give the same answer no matter how much the triangle is enlarged."
- **Pythagoras when you have three sides and no angle, trigonometry when two sides and an angle**
  - Source: Introduction to trigonometry for right-angled triangles - KS3 Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zyjtfdm
  - Quote: "When a question about right-angled triangles involves all three sides and no angles , Pythagoras’ theorem is used to calculate the value of a missing side. When the question involves two sides and an angle in a right-angled triangle, trigonometry is used."


### 4.2 Exact values at 30, 45 and 60 degrees
They come from two triangles (square halved, equilateral halved), so Dan can rebuild them rather than memorise them.
They are surds (Powers and roots covers surds but left rationalising out, so 1/√2 = √2/2 would be taught inline in
one line, or avoided by keeping 1/√2).

- **Exact values come from two triangles (45-45-90 and halved equilateral)** **SECONDARY**
  - Source: Trigonometry at GCSE: SOH CAH TOA explained – Cognito. https://cognito.org/blog/gcse-maths-trigonometry-soh-cah-toa
  - Quote: "The 45° values come from an isosceles right-angled triangle with two sides of length 1 and a hypotenuse of √2. The 30° and 60° values come from an equilateral triangle with side length 2, cut in half to create a right-angled triangle with sides 1, √3, and 2."
- **Exact values are surds; recall them for no-calculator work**
  - Source: What are exact trigonometric values? - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zj6mkhv
  - Quote: "To solve right-angle trigonometry problems without a calculator, the exact trigonometric values must be recalled."


### 4.3 Degrees and radians; radians as arc length over radius
The research is clear that a radian taught as "180° = π" is a conversion factor, not a unit. Moore's design is arc
length measured in radius-lengths, so every circle is a unit circle. Geometry fundamentals left arc length for
this course.

- **One radian: the arc equals the radius**
  - Source: Trigonometry Angles & Radian Measure Study Guide | Notes. https://www.pearson.com/channels/trigonometry/study-guides/angles-and-radian-measure-foundations-of-trigonometry
  - Quote: "One radian is the measure of the central angle of a circle that intercepts an arc equal in length to the radius of the circle."
- **Radian as a ratio of arc length to radius**
  - Source: An Investigation into Precalculus Students' Conceptions of .... http://sigmaa.maa.org/rume/crume2009/Moore2_LONG.pdf
  - Quote: "The unit of a radian as the ratio of a linear measurement of arc-length to the length of a radius, giving a number of radius lengths"
- **Radians: pi over 4 radians means the arc is pi over 4 radii long**
  - Source: An Investigation into Precalculus Students' Conceptions of .... http://sigmaa.maa.org/rume/crume2009/Moore2_LONG.pdf
  - Quote: "Thus, if an angle has a measurement of π/4 radians, the length of the arc subtended by the angle is π/4 ths the radius used to create the arc."
- **Sine and cosine take an angle in radians and give a ratio of lengths**
  - Source: An Investigation into Precalculus Students' Conceptions of .... http://sigmaa.maa.org/rume/crume2009/Moore2_LONG.pdf
  - Quote: "Sine and cosine functions with an input quantity of angle measure, measured in radians, and an output quantity of a ratio of lengths."
- **Degrees to radians in HELM**
  - Source: HELM workbook 4 - Trigonometry. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%204%20Trigonometry.pdf
  - Quote: "The radian 180 ◦ = π radians 360 ◦ = 2 π radians 1 radian"


### 4.4 The sine and cosine rules for triangles without a right angle
Sine rule: a side and its opposite angle plus one more piece. Cosine rule: two sides and the angle between them, or
three sides. The ambiguous case is real and is a named exam topic.

- **Sine rule: when it applies (HELM)**
  - Source: 44. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%204%20Trigonometry.pdf
  - Quote: "we must know either two angles and one side : (knowing two angles of a triangle really means that all three are known since the sum of the angles is 180 _◦_ ) or two sides and an angle opposite one of those two sides."
- **Cosine rule: two sides and the included angle, or three sides (Bitesize)**
  - Source: What is the cosine rule? - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z3stdnb
  - Quote: "The cosine rule is a formula used to find a missing side or angle in a triangle when two sides and included angle , or all the lengths of all three sides, are known."
- **Sine and cosine rules, N5: which data fit which rule**
  - Source: Trigonometric skills - National 5 Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/topics/zt7wb82
  - Quote: "The sine rule can find a side from another side and two angles or an angle from two sides and a non-included angle. The cosine rule can find a side from two sides and the included angle, or an angle from three sides."
- **A marine cosine-rule example: distance apart of two ships**
  - Source: 44. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%204%20Trigonometry.pdf
  - Quote: "We must use the Cosine rule to obtain the required distance apart of the ships. Denoting the distance _AB_ by _c_ , as usual, _c_ ² = 48 ² + 40 ² _−_ 2(48)(40) cos 113 _◦_ from which _c_ ² = 5404 _._ 41 and _c_ = 73 _._ 5 nautical miles."
- **Ambiguous case of the sine rule**
  - Source: Higher – How to use the sine rule - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z9dm46f
  - Quote: "When calculating an angle using the sine rule, sometimes there are two possible answers. This is called the ambiguous case"
- **Ambiguous case: second answer is 180 minus the first**
  - Source: Higher – How to use the sine rule - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z9dm46f
  - Quote: "The second answer is found by subtracting the first answer from 180°. If the angles in the triangle do not exceed the angle sum of a triangle, 180°, the second answer can exist."


### 4.5 The unit circle becomes the sine wave; amplitude, period, frequency, phase; ω = 2πf

- **A rotating arrow projects onto an axis as a sine wave** **SECONDARY**
  - Source: 15.3: Simple AC Circuits - Physics LibreTexts. https://phys.libretexts.org/Bookshelves/University_Physics/University_Physics_(OpenStax)/University_Physics_II_-_Thermodynamics_Electricity_and_Magnetism_(OpenStax)/15:_Alternating-Current_Circuits/15.03:_Simple_AC_Circuits
  - Quote: "If the length of the arrow corresponds to the current amplitude \(I_0\), the projection of the rotating arrow onto the vertical axis is \(i_R(t) = I_0 \, sin \, \omega t\), which is the instantaneous current."
- **Height of the rotating arrow gives v(t)**
  - Source: AC circuits, alternating current electricity. https://www.animations.physics.unsw.edu.au/jw/AC.html
  - Quote: "Because we have sinusoidal variation in time, the vertical component (magnitude times the sine of the angle it makes with the x axis) gives us v(t)."
- **Sine wave formula with omega = 2 pi f**
  - Source: AC Waveform and AC Circuit Theory of Sinusoids. https://www.electronics-tutorials.ws/accircuits/ac-waveform.html
  - Quote: "A(t) = A max *sin(ωt) = A max *sin(2πƒt)"
- **Peak, period, frequency, and v(t) = 4 sin(2 pi 5 t)** **SECONDARY**
  - Source: 9.2: Sinusoidal Waveforms - Engineering LibreTexts. https://eng.libretexts.org/Courses/Canada_College/Circuits_and_Devices/09%3A_AC_Signal_Fundamentals/9.02%3A_Sinusoidal_Waveforms
  - Quote: "For a quick and practical example, the waveform shown in Figure (\PageIndex{4}) has an amplitude of 4 volts peak, a frequency of 5 Hz, and no DC offset or phase shift. Thus, its expression is (v(t) = 4 \sin (2 \pi 5 t))"
- **Phase shift sign: plus if leading and drawn to the left** **SECONDARY**
  - Source: 1.2: Sinusoidal Waveforms - Engineering LibreTexts. https://eng.libretexts.org/Bookshelves/Electrical_Engineering/Electronics/AC_Electrical_Circuit_Analysis:_A_Practical_Approach_(Fiore)/01:_Fundamentals/1.2:_Sinusoidal_Waveforms
  - Quote: "is the phase shift (+ if leading and drawn to the left, − if lagging and drawn to the right)"
- **Time shift in HELM**
  - Source: HELM workbook 4 - Trigonometry. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%204%20Trigonometry.pdf
  - Quote: "The graphs of _x_ 1 against _t_ and of _x_ 2 against _t_ are said to have a time shift"
- **OpenStax AC example: omega = 2 pi f = 120 pi rad/s** **SECONDARY**
  - Source: 15.3: Simple AC Circuits - Physics LibreTexts. https://phys.libretexts.org/Bookshelves/University_Physics/University_Physics_(OpenStax)/University_Physics_II_-_Thermodynamics_Electricity_and_Magnetism_(OpenStax)/15:_Alternating-Current_Circuits/15.03:_Simple_AC_Circuits
  - Quote: "The voltage across the terminals of the source is \[v(t) = V_0 \, sin \, \omega t = (10 \, V) sin \, 120 \pi t, \nonumber \] where \(\omega = 2\pi f = 120 \pi \, rad/s\) is the angular frequency."
- **OpenStax: a capacitor current leads by pi/2 rad (cos = sin of a shifted angle)** **SECONDARY**
  - Source: 15.3: Simple AC Circuits - Physics LibreTexts. https://phys.libretexts.org/Bookshelves/University_Physics/University_Physics_(OpenStax)/University_Physics_II_-_Thermodynamics_Electricity_and_Magnetism_(OpenStax)/15:_Alternating-Current_Circuits/15.03:_Simple_AC_Circuits
  - Quote: "Using the trigonometric relationship \(cos \, \omega t = sin (\omega t + \pi/2)\), we may express the instantaneous current as"

My reading: the turning arrow and its height give the wave, and ω = 2πf is just "radians a second" (Geometry's circle
plus 4.3). Functions and their graphs lesson 6 already gave Dan shifts, stretches and an offset on an AC wave
(look-ahead only), so amplitude, midline and phase are the same moves he knows, now with sin. Brilliant Level 10 and
Khan unit 2 use the same set of features.

### 4.6 sin² θ + cos² θ = 1
It is the Pythagorean theorem on the unit circle (my reading). HELM's Workbook 4 has a section on identities (2.3),
Brilliant has a lesson called The Pythagorean Identity (1.2), and SQA lists it at National 5 and Higher.

- **The identity: sin squared plus cos squared (Brilliant wiki, archived)** **SECONDARY**
  - Source: Trigonometry made easy | Brilliant Math & Science Wiki. https://brilliant.org/wiki/trigonometry-made-easy
  - Quote: "The Pythagorean Theorem relates to trig functions by the identity: (cosx^2+sinx^2=1"
- **The identity is on SQA National 5 and Higher lists** **SECONDARY**
  - Source: Trig Formulae & Equations - Higher Mathematics. https://www.highermathematics.co.uk/trig-formulae-equations
  - Quote: "Trig Identities sin²x + cos² = 1 & tanx = sinx/cosx"


### 4.7 Adding two sine waves of one frequency as phasors (vectors that turn)
Phasors, drawn as turning arrows, are a graphical device; adding the arrows adds the waves because heights add.
HELM does the same job algebraically in "amplitude/phase form" without complex numbers. The complex-number
treatment (a phasor as a complex number; impedance) belongs to Complex numbers (Bird puts it after complex
numbers, 2.4).

- **Phasors add sinusoids of one frequency**
  - Source: Phasor Diagrams and Phasor Algebra used in AC Circuits. https://www.electronics-tutorials.ws/accircuits/phasors.html
  - Quote: "One good use of phasors is for the summing of sinusoids of the same frequency."
- **Why phasor addition works: y-projections add**
  - Source: AC circuits, alternating current electricity. https://www.animations.physics.unsw.edu.au/jw/AC.html
  - Quote: "So v(t), the sum of the y projections of the component phasors, is just the y projection of the sum of the component phasors."
- **Different frequencies cannot share a phasor diagram**
  - Source: Phasor Diagrams and Phasor Algebra used in AC Circuits. https://www.electronics-tutorials.ws/accircuits/phasors.html
  - Quote: "Sinusoids of different frequencies cannot be represented on the same phasor diagram due to the different speed of the vectors."
- **Phasors are drawn rotating anticlockwise; ahead is leading**
  - Source: Phasor Diagrams and Phasor Algebra used in AC Circuits. https://www.electronics-tutorials.ws/accircuits/phasors.html
  - Quote: "All phasors are drawn rotating in an anticlockwise direction. All the phasors ahead of the reference phasor are said to be “leading” while all the phasors behind the reference phasor are said to be “lagging”."
- **Amplitude/phase form of a combined wave (HELM)**
  - Source: HELM workbook 4 - Trigonometry. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%204%20Trigonometry.pdf
  - Quote: "The form _R_ cos( _ωt_ _−_ _α_ ) is said to be the amplitude/phase form of the wave."


### 4.8 Power factor as a cosine

- **Power factor is the cosine of the angle (ORNL)**
  - Source: Power Factor. https://bptraining.ornl.gov/wp-content/uploads/2023/08/VInPLT-Power-Factor-2023.pdf
  - Quote: "Power Factor is the cosine of the angle between the Real Power and the Apparent Power; kW/kVa pf = kW/kVa = cos(φ)"
- **Power factor from the power triangle (All About Circuits)**
  - Source: Calculating Power Factor | Power Factor | Electronics Textbook. https://www.allaboutcircuits.com/textbook/alternating-current/chpt-11/calculating-power-factor
  - Quote: "Because true power and apparent power form the adjacent and hypotenuse sides of a right triangle, respectively, the power factor ratio is also equal to the cosine of that phase angle."
- **Power factor and the power triangle (Fiore)** **SECONDARY**
  - Source: 7.3: Power Triangle - Engineering LibreTexts. https://eng.libretexts.org/Bookshelves/Electrical_Engineering/Electronics/AC_Electrical_Circuit_Analysis%3A_A_Practical_Approach_(Fiore)/07%3A_AC_Power/7.3%3A_Power_Triangle
  - Quote: "shows that the ratio of true power to apparent power is the cosine of the impedance angle, \(P/S = \cos \theta \). This is known as the power factor and is abbreviated \(PF\)."


---

## 5. Prerequisites: what Dan has, what is taught inline

From the built courses (read in their briefs under `build/maths/` and `docs/courses/maths/`):
- **Pythagoras and the right angle** (Geometry fundamentals lessons 4 and 5). The Geometry brief says angles are not a
  lesson there and "the rest waits for Trigonometry, which will need angles properly" and lists arc length as left for
  later. So **angles properly are taught inline**: a turn is 360°, angles in a triangle sum to 180°, acute, obtuse and
  reflex, complementary angles, measuring from a reference direction (MCA 5.1.2 and 5.1.3, section 3.3).
- **Circles** (Geometry lesson 2: circumference from the radius) is the root of radians (4.3). Arc length is new here.
- **Scaling and ratio** (Geometry lesson 3, Proportional reasoning, Fractions): similar triangles are enlargements,
  and the ratio of sides stays put (4.1). This is the bridge into sin, cos, tan.
- **Rearranging and solving** (Solving equations, Linear equations: "rearranging formulas"): finding a side divides
  or multiplies (6.1 shows the common error is multiplying instead of dividing).
- **Straight-line graphs** deferred "the angle a line makes, m = tan θ, and perpendicular lines if wanted" to this
  course.
- **Functions and their graphs**: inverse functions (arcsin undoes sin), shifts and stretches (wave features), and
  the one-screen look at an AC wave. **Powers and roots**: squares, square roots (the identity, the cosine rule),
  surds as exact values (rationalising left out), and Pythagoras. **Quadratics and polynomials** deferred
  "splitting a launch into components" to here. **The coordinate plane**: points (the unit circle's point
  (cos θ, sin θ)). **Exponentials and logarithms**: nothing used here.
- **Calculus fundamentals** (built): rates and the derivative are not needed; d/dt of a wave is out of scope.

Taught inline (my reading, from the above): angles; SOH CAH TOA as a memory aid after the similar-triangle idea;
the calculator's degree and radian modes (6.2); the notation sin² θ means (sin θ)²; sin⁻¹ is "the angle whose sine is"
(Functions brief: say "inverse", not a power); exact values by two triangles; revolutions per minute to radians per
second; the idea of a phase and of leading and lagging. Entry expectation in the sources: SQA H7K0 33 "good algebraic
skills together with an ability to transpose engineering formulae and solve simple trigonometric equations"; Pearson
"grade 9 to 4 or A* to C in GCSE Mathematics" (3.1, 3.2). Bitesize: be confident with right-angled triangles before
non-right-angled ones (4.4 and section 5 quotes).

- **Pythagoras finds one side when two are known**
  - Source: What are exact trigonometric values? - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zj6mkhv
  - Quote: "can be used to find the length of one side in a right-angled triangle when two sides are known."
- **Non-right-angled trig needs right-angled trig first**
  - Source: Higher – How to use the sine rule - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z9dm46f
  - Quote: "To be successful with non-right-angled trigonometry , make sure you are confident in finding unknown sides and angles in right-angled triangles"


---

## 6. Misconceptions and learning science

### 6.1 What research says students get wrong
Papers: Weber 2005 (two college trigonometry courses); Moore 2009, 2013, 2014 (angle measure as arc length;
quantitative reasoning and the sine function); Orhun's test of 77 students; Williams's Georgia College paper (a small
study of student work, **SECONDARY** as a source for a general claim). Moore's 2013 and 2014 papers were not read; they are known
only from reports of them (**SECONDARY**). Thompson 2008 ("triangle trigonometry before circle trigonometry ...") was
seen only as quoted on a copy site and is dropped. Evidence on the order (triangle first or circle first) is mixed:
the academia.edu summary (**SECONDARY**) found ratio-taught students better at identifying the functions and
unit-circle students worse at division sums; Weber's group that built the unit circle by repetition could justify
properties and estimate odd angles.

- **Weber 2005: study of two college trigonometry courses**
  - Source: Students' understanding of trigonometric functions | SpringerLink. https://link.springer.com/article/10.1007/bf03217423
  - Quote: "In this article students' understanding of trigonometric functions in the context of two college trigonometry courses is investigated."
- **Weber: control students could not construct geometric objects or justify properties (reported in ScienceDirect 2020)** **SECONDARY**
  - Source: What generalizations do students achieve with respect to trigonometric functions in the transition from angles in degrees to real numbers? - ScienceDirect. https://www.sciencedirect.com/science/article/abs/pii/S0732312320300420
  - Quote: "study showed that the students in the control group were unable to construct geometric objects to help them deal with trigonometric situations. Furthermore, they were unable to justify why the sine and cosine functions possessed their respective properties."
- **Weber: the experimental group could justify the properties and estimate values for atypical angles such as 40 degrees** **SECONDARY**
  - Source: What generalizations do students achieve with respect to trigonometric functions in the transition from angles in degrees to real numbers? - ScienceDirect. https://www.sciencedirect.com/science/article/abs/pii/S0732312320300420
  - Quote: "the students in the experimental group were able to justify the properties of these functions and to estimate their values for atypical angle measures such as 40°."
- **Students do not regard the radian as a unit of angle measure (Moore 2013, reported)** **SECONDARY**
  - Source: What generalizations do students achieve with respect to trigonometric functions in the transition from angles in degrees to real numbers? - ScienceDirect. https://www.sciencedirect.com/science/article/abs/pii/S0732312320300420
  - Quote: "These studies revealed that students do not regard the radian as a unit of angle measure (Moore, 2013)."
- **Moore: applets supporting angle measure as arc fraction and the sine function (reported)** **SECONDARY**
  - Source: What generalizations do students achieve with respect to trigonometric functions in the transition from angles in degrees to real numbers? - ScienceDirect. https://www.sciencedirect.com/science/article/abs/pii/S0732312320300420
  - Quote: "His results demonstrated that use of applets supported students understanding of angle measure as a subtended arc-length’s fraction of a circle’s circumference and helped them see how a changing arc-length relates to the changes of vertical distance -- a keystone in developing an understanding of the sine function."
- **Moore 2009: comfort with degrees, not radians**
  - Source: An Investigation into Precalculus Students' Conceptions of .... http://sigmaa.maa.org/rume/crume2009/Moore2_LONG.pdf
  - Quote: "students and teachers appear much more comfortable with degree angle measurements"
- **Orhun: radian arc-length questions answered poorly**
  - Source: Student's Mistakes and Misconceptions on Teaching of .... https://sites.unipa.it/grim/AOrhun.PDF
  - Quote: "It can be seen that the concept of measure of an angle in radians through the students is inadequate."
- **Williams: some students believe the whole circle is one radian (student work)** **SECONDARY**
  - Source: UNDERSTANDINGS AND MISUNDERSTANDINGS OF TRIGONOMETRY 1 Understandings and Misunderstandings of Trigonometry Christopher Williams Georgia College & State University December 13,. https://www.gcsu.edu/sites/files/page-assets/node-808/attachments/williams.pdf
  - Quote: "One misconception that students showed was that they believe that the whole unit circle was equal to one radian."
- **Williams: students switch the unit circle coordinates and take x as sine** **SECONDARY**
  - Source: UNDERSTANDINGS AND MISUNDERSTANDINGS OF TRIGONOMETRY 1 Understandings and Misunderstandings of Trigonometry Christopher Williams Georgia College & State University December 13,. https://www.gcsu.edu/sites/files/page-assets/node-808/attachments/williams.pdf
  - Quote: "Other students incorrectly identified the x-coordinate as the sine ratio"
- **Ratio method students identified functions better than unit-circle students; most common mistake multiplying not dividing (SECONDARY host)** **SECONDARY**
  - Source: Trigonometry: Comparing ratio and unit circle methods. https://www.academia.edu/48403488/Trigonometry_Comparing_ratio_and_unit_circle_methods
  - Quote: "The most common mistake for both methods was to multiply instead of divide."
- **Ratio method: where division was involved success fell (SECONDARY host)** **SECONDARY**
  - Source: Trigonometry: Comparing ratio and unit circle methods. https://www.academia.edu/48403488/Trigonometry_Comparing_ratio_and_unit_circle_methods
  - Quote: "However questions where division was involved (e.g. finding the hypotenuse from the sine of an angle as in Figures 1 and 3) the formulation and transposition was more difficult and the success rate was 77% for ratio students and 38% for the unit circle students."


### 6.2 Examiner reports and named mistakes
Cambridge International (IGCSE 0580, June 2024) and Pearson IAL (Summer 2024) examiner reports; Bitesize on the
calculator mode; Lamar's "Common Math Errors"; revision-site tips are **SECONDARY**.

- **Calculator mode: degrees versus radians (Lamar)**
  - Source: Common Math Errors - Trig Errors. https://tutorial.math.lamar.edu/Extras/CommonErrors/TrigErrors.aspx
  - Quote: "If you are asked to evaluate \(\cos \left( x \right)\) at \(x = 10\) we are asking you to use 10 radians not 10 degrees! The answers are very, very different! Consider the following, \[\begin{array}{lcl}\cos \left( {10} \right) = - 0.839071529076 & \hspace{0.5in} & {\mbox{in radians}}\\ \cos \left( {10} \right) = 0.984807753012 & \hspace{0.5in} & {\mbox{in degrees"
- **cos is not multiplication (Lamar)**
  - Source: Common Math Errors - Trig Errors. https://tutorial.math.lamar.edu/Extras/CommonErrors/TrigErrors.aspx
  - Quote: "The only reason that I can think of for these mistakes is that students must be thinking of \(\cos \left( x \right)\) as a multiplication of something called \(\cos \) and \(x\). This couldn’t be farther from the truth! Cosine is a function and the \(\cos \) is used to denote that we are dealing with the cosine function!"
- **Bitesize: calculator in degrees mode**
  - Source: What is right-angled trigonometry? - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zck7rmn
  - Quote: "Scientific calculators need to be used for trigonometry and should be in degrees mode. Often there is a small D or DEG at the top of the calculator screen. If not, go into the calculator settings to change the angle units to degrees."
- **Pearson examiners: answer left in degrees, not converted to radians**
  - Source: Examiners’ Report Principal Examiner Feedback Summer 2024. https://qualifications.pearson.com/content/dam/pdf/International-Advanced-Level/Mathematics/2018/Exam-materials/wma11-01-pef-20240815.pdf
  - Quote: "it was usually because the answer was given in degrees and not converted to radians at any stage, or arccosine was not used at the end."
- **Pearson examiners: wrong sector area and arc formulae**
  - Source: Examiners’ Report Principal Examiner Feedback Summer 2024. https://qualifications.pearson.com/content/dam/pdf/International-Advanced-Level/Mathematics/2018/Exam-materials/wma11-01-pef-20240815.pdf
  - Quote: "Errors in method were usually a result of an incorrect formula such as rθ , πrθ , or θr 2 ."
- **Cambridge examiners: cosine rule misquoted, mis-evaluated as (a2+b2-2ab) cos B**
  - Source: MATHEMATICS. https://www.cambridgeinternational.org/Images/569918-june-2024-examiner-report.pdf
  - Quote: "Common errors included errors in stating the cosine formula, errors in substituting into the formula and errors in evaluation, with A 2 + b 2 – 2 abccosB being evaluated as ( a 2 + b 2 – 2ab ) cosB."
- **Cambridge examiners: cosine rule slips (omitting the 2, swapping the minus, sin instead of cos)**
  - Source: MATHEMATICS. https://www.cambridgeinternational.org/Images/569918-june-2024-examiner-report.pdf
  - Quote: "Some recognised that the cosine rule was required but used the rule incorrectly, sometimes omitting the 2, replacing the – with + or using sin 110 instead of cos 110. The negative value of cos 110 also led to errors."
- **Cambridge examiners: right-angled trig is enough but candidates reached for the sine or cosine rule; premature rounding**
  - Source: MATHEMATICS. https://www.cambridgeinternational.org/Images/569918-june-2024-examiner-report.pdf
  - Quote: "Some made it even more complicated and applied the sine rule or the cosine rule not realising all that was required was right-angled triangle trigonometry. These methods, although often successful, also saw a few losing accuracy marks due to prematurely rounding the vertical side length to 11.1."
- **Cambridge examiners: some wrongly used right-angle trig on a non-right triangle**
  - Source: MATHEMATICS. https://www.cambridgeinternational.org/Images/569918-june-2024-examiner-report.pdf
  - Quote: "Some candidates wrongly tried to use right angle trigonometry."
- **Cosine rule rearranged wrongly gives Maths ERROR (SECONDARY, revision site)** **SECONDARY**
  - Source: Sine, Cosine Rule & Area of Triangles | AQA GCSE Further Maths Revision Notes 2018. https://www.savemyexams.com/gcse/further-maths/aqa/20/revision-notes/6-geometry/trigonometry/sine-cosine-rule-and-area-of-triangles
  - Quote: "If your calculator gives you a ‘Maths ERROR’ message when trying to find an angle using the cosine rule, you probably subtracted things the wrong way around when you rearranged the formula"
- **Inverse trig only when finding an angle; a side is found by rearranging (SECONDARY)** **SECONDARY**
  - Source: Trigonometry at GCSE: SOH CAH TOA explained – Cognito. https://cognito.org/blog/gcse-maths-trigonometry-soh-cah-toa
  - Quote: "You only need inverse trig when the question asks you to find a missing angle. If you are finding a missing side, you will not need them – you will rearrange the formula algebraically instead."


### 6.3 Contested conventions and numbers on pages that do not add up
- **Phasor length: peak or rms?** Two reachable pages disagree. Electronics Tutorials says a vector's magnitude is the
  peak and a phasor's is rms, and draws phasor lengths as rms; UNSW Physclips scales the same diagram by 0.71. Teach
  the diagram's shape as the same either way, and say which scale each example uses.
- **Pages with arithmetic that fails.** The Electronics Tutorials phasor example calls a 43.6 V side the hypotenuse of
  a triangle with a 70 V side (a hypotenuse cannot be shorter than a side). The FIRGELLI crank-slider page shows a
  piston position of 7.14 in for r = 2, l = 7.5, θ = 90° (its own formula gives 7.228 in, section 10) and says the
  piston swings "between about 3.44 and 6.44" for l = 5 and r = 1.5 (the formula gives 3.5 and 6.5). Lesson numbers
  must be computed from a shown rule, not taken from these pages.
- **Conduit shrink and the 10° multiplier.** Section 7.1 shows tables that disagree (shrink 1/4 in or 3/16 in at 30°;
  multiplier 6.0 or 5.759 at 10°). Nobody's table is "the" answer.

- **Phasor convention: vector length is peak, phasor length is rms (contested)**
  - Source: Phasor Diagrams and Phasor Algebra used in AC Circuits. https://www.electronics-tutorials.ws/accircuits/phasors.html
  - Quote: "the main difference between the two is that a vectors magnitude is the “peak value” of the sinusoid, while a phasors complex magnitude is the “rms value” of the sinusoid."
- **Phasor convention: RMS diagrams have the same shape, scaled by 0.71 (UNSW)**
  - Source: AC circuits, alternating current electricity. https://www.animations.physics.unsw.edu.au/jw/AC.html
  - Quote: "Phasor diagrams in RMS have the same shape as those drawn using amplitudes, but everything is scaled by a factor of 0.71 = 1/√2.)"
- **Phasor tutorial arithmetic that does not add up: hypotenuse 43.6 shorter than side 70**
  - Source: Phasor Diagrams and Phasor Algebra used in AC Circuits. https://www.electronics-tutorials.ws/accircuits/phasors.html
  - Quote: "Since the definitions and terms: _opposite_ , _adjacent_ , and _hypotenuse_ refer to the lengths of the sides which are 17.32V, 70V (30 + 40), and 43.6V respectively. This would give V T a sine angle of: sin -1 (opposite/hypotenuse) = sin -1 (17.32/43.6) = 23.4 o ."
- **A calculator page whose own worked sum does not match its shown value (r 2, l 7.5, 90 deg shows 7.14 in)** **SECONDARY**
  - Source: Free Crank-Slider Mechanism Calculator | FIRGELLI Engineering. https://www.firgelliauto.com/blogs/engineering-calculators/crank-slider-mechanism-calculator
  - Quote: "Crank Radius 2.0 in Rod Length 7.5 in Crank Angle 90° PISTON POSITION 7.14 in"
- **The same page says the piston swings between 3.44 and 6.44 in with rod 5.0 and crank 1.5** **SECONDARY**
  - Source: Free Crank-Slider Mechanism Calculator | FIRGELLI Engineering. https://www.firgelliauto.com/blogs/engineering-calculators/crank-slider-mechanism-calculator
  - Quote: "The total stroke for this setup is 3.0 inches (twice the crank radius). The piston will swing between about 3.44 and 6.44 inches from the pivot as it cycles."
- **Electronics Tutorials: phasor length generally stands for the rms value**
  - Source: Phasor Diagrams and Phasor Algebra used in AC Circuits. https://www.electronics-tutorials.ws/accircuits/phasors.html
  - Quote: "Generally, the length of a phasor represents the RMS value of the sinusoidal quantity rather than its maximum or peak value."


### 6.4 Learning science to build on
Interleaved practice (mixing triangle, wave and power-factor problems so Dan has to choose the method) gave higher
delayed scores in a classroom experiment (2015) and a cluster randomised trial (2020). The lesson plan's "choose the rule" practice (right triangle or any
triangle? sine rule or cosine rule?) is exactly this, and the Cambridge report in 6.2 shows what happens when the
rule is not chosen from the problem. Prediction before a slider (does the height of the arrow match the wave?) fits
Weber's and Moore's findings (6.1).

- **Interleaved practice: immediate and delayed tests (Rohrer 2015)**
  - Source: ERIC - EJ1071568 - Interleaved Practice Improves Mathematics Learning, Journal of Educational Psychology, 2015-Aug. https://eric.ed.gov/?id=EJ1071568
  - Quote: "Compared with blocked practice, interleaved practice produced higher scores on both the immediate and delayed tests (Cohen's d = 0.42 and 0.79, respectively)."
- **Interleaved practice: why it works (choose the strategy from the problem)**
  - Source: ERIC - EJ1071568 - Interleaved Practice Improves Mathematics Learning, Journal of Educational Psychology, 2015-Aug. https://eric.ed.gov/?id=EJ1071568
  - Quote: "Interleaved practice requires students to choose a strategy on the basis of the problem itself, as they must do when they encounter a problem during a comprehensive examination or subsequent course."
- **Interleaved practice RCT (Rohrer 2020): 61% v 38%**
  - Source: ERIC - EJ1237752 - A Randomized Controlled Trial of Interleaved Mathematics Practice, Journal of Educational Psychology, 2020-Jan. https://eric.ed.gov/?id=EJ1237752
  - Quote: "the interleaved group outscored the blocked group, 61% versus 38%, d = 0.83."

The retrieval and prediction parts of the brief rest on the product rules, not on new research here.

---

## 7. Where an electrician going to marine engineering uses it

### 7.1 Conduit offsets: multiplier = 1 / sin of the bend angle
The multiplier is a cosecant (1/sin). The exact travel along the pipe is offset ÷ sin θ. Tables in the field use
rounded numbers, and the shrink figures differ between sources (my reading: exact shrink per inch of offset is
tan(θ/2), section 10; field constants of 1/4 and 3/8 in are rounded and are described as a field allowance, not a
code rule). The multiplier method ignores the arc of the bend. Stub deduct is bender-specific and is not trig.

- **Conduit offset: the multiplier is a cosecant, from a right triangle** **SECONDARY**
  - Source: Conduit Bending Multiplier Chart: Complete Reference Guide. https://conduitbending.com/insights/conduit-bending-multiplier
  - Quote: "The multiplier isn't some arbitrary number someone made up. It comes directly from basic trigonometry, as explained in this EC&M bending fundamentals article . When you bend an offset, the conduit forms a right triangle. The offset depth is the vertical side (opposite), the distance between bends is the diagonal (hypotenuse), and the horizontal run is the adjacent side. From trigonometry: sin(angle) = offset depth / distance between bends Rearranging to solve for the distance between bends: distance between bends = offset depth / sin(angle) Since dividing by the sine is the same as multiplying by the cosecant: distance between bends = offset depth x cosecant(angle)"
- **Conduit offset: 30 degrees gives 2.0, 45 degrees 1.414** **SECONDARY**
  - Source: Conduit Bending Multiplier Chart: Complete Reference Guide. https://conduitbending.com/insights/conduit-bending-multiplier
  - Quote: "That cosecant value is the multiplier. For 30 degrees, sin(30) = 0.5, so the cosecant = 1/0.5 = 2.0. For 45 degrees, sin(45) = 0.7071, so the cosecant = 1/0.7071 = 1.414."
- **Conduit offset: the method is an approximation (ignores the arc of the bend)** **SECONDARY**
  - Source: Conduit Bending Multiplier Chart: Complete Reference Guide. https://conduitbending.com/insights/conduit-bending-multiplier
  - Quote: "This method is an approximation because it doesn't account for the arc of the bend itself, but for most field work up to about 30 degrees the difference is negligible. Even at 45 degrees, the error is small enough that it falls within normal conduit bending tolerances."
- **Conduit offset: multiplier table with 10 degrees = 5.759** **SECONDARY**
  - Source: Conduit Bending Multiplier Chart: Complete Reference Guide. https://conduitbending.com/insights/conduit-bending-multiplier
  - Quote: "5° | 11.474 | 3/64" (0.004") * 10° | 5.759 | 1/64" (0.015") * 15° | 3.864 | 1/32" (0.034") * 20° | 2.924 | 1/16" (0.064") * 22.5° | 2.613 | 3/16" (0.199") * 25° | 2.366 | 1/8" (0.103") * 30° | 2.000 | 1/4" (0.250") * 35° | 1.743 | 5/16" (0.306") * 40° | 1.556 | 5/16" (0.342") * 45° | 1.414 | 3/8" (0.375") * 50° | 1.305 | 3/8" (0.398") * 55° | 1.221 | 7/16" (0.426") * 60° | 1.155"
- **Conduit offset: a rounded field table with 10 degrees = 6.0 and shrink 1/16 inch** **SECONDARY**
  - Source: Offset Bend Guide: Conduit Bending Formulas & Charts — HVAC Calculator Pro. https://hvaccalcpro.com/guides/offset-bend-guide
  - Quote: "Multiplier and Shrink Table * Bend Angle | Multiplier | Shrink per Inch | Common Use * 10° | 6.0 | 1/16" | Very shallow offsets * 22.5° | 2.6 | 3/32" | Gentle offsets * 30° | 2.0 | 3/16" | Most common offset angle * 45° | 1.414 | 1/4" | Standard offset * 60° | 1.155 | 3/8" | Steep offset (limited space)"
- **Conduit offset: shrink is a common field allowance, not a code rule** **SECONDARY**
  - Source: Offset Bend Calculator | 4 in at 30 deg = 8 in | EleCalculator. https://elecalculator.com/calculator/conduit-bending/offset-bend-calculator/
  - Quote: "Shrinkage allowance uses a common field allowance, not a code rule."
- **Conduit offset: stub deduct is bender-specific** **SECONDARY**
  - Source: Conduit Bending Chart & Bend Mark Calculator. https://turn2engineering.com/charts-and-tables/conduit-bending-chart
  - Quote: "Stub deduct/take-up is bender-specific."
- **Conduit offset: a common mistake is mixing up 2.0 and 1.414** **SECONDARY**
  - Source: Offset Bend Guide: Conduit Bending Formulas & Charts — HVAC Calculator Pro. https://hvaccalcpro.com/guides/offset-bend-guide
  - Quote: "Incorrect multiplier: Using 2.0 for 45° bends (should be 1.414) or 1.414 for 30° bends (should be 2.0). Always verify your angle."
- **Conduit offset: shrink table is a rounded field method, not exact trigonometry (turn2engineering)** **SECONDARY**
  - Source: Conduit Bending Chart & Bend Mark Calculator. https://turn2engineering.com/charts-and-tables/conduit-bending-chart
  - Quote: "Total shrink equals offset height multiplied by the published field shrink constant. Keep this rounded field method consistent with the calculator rather than mixing it with exact trigonometric values."
- **Conduit offset: shallow offsets use more length; steeper ones need more pulling force (turn2engineering)** **SECONDARY**
  - Source: Conduit Bending Chart & Bend Mark Calculator. https://turn2engineering.com/charts-and-tables/conduit-bending-chart
  - Quote: "Shallow offsets use more conduit length because the multiplier is larger. Steeper offsets shorten the run needed to gain the same height, but Greenlee cautions that steeper bends require more pulling force."


### 7.2 Power factor and current

- **Power factor example: motor at 230 V, 2.7 A, 450 W** **SECONDARY**
  - Source: Power Triangle and Power Factor in AC Circuits | Electrical A2Z. https://electricala2z.com/electrical-power/power-triangle-power-factor-ac-circuits
  - Quote: "A single-phase motor draws 2.7 A on 230 V and a wattmeter in the circuit reads 450 W. Find the power factor and phase angle."
- **Power factor 0.7071 at 45 degrees lagging (ORNL)**
  - Source: Power Factor. https://bptraining.ornl.gov/wp-content/uploads/2023/08/VInPLT-Power-Factor-2023.pdf
  - Quote: "with a lagging power factor (φ=45º, cosφ=0.7071)"
- **Low power factor means more current for the same power (Mustansiriyah notes, SECONDARY)** **SECONDARY**
  - Source: Power Factor Improvement. https://uomustansiriyah.edu.iq/media/lectures/5/5_2020_10_06!01_14_50_PM.pdf
  - Quote: "The cosine of angle between voltage and current in an a.c. circuit is known as power factor."
- **Power factor 0.6 to 0.8 cuts line current about 20 per cent for the same true power (ship-style motors, 230 V)** **SECONDARY**
  - Source: Power Triangle and Power Factor in AC Circuits | Electrical A2Z. https://electricala2z.com/electrical-power/power-triangle-power-factor-ac-circuits
  - Quote: "a 230 V single-phase installation supplies a number of motors requiring 10 kW of power. On single phase, this results in a load current of 43.5 A. If the power factor of the load is 0.6 (cos 53°), the total current in the line will be 72.5 A. Correcting the PF to 0.8 (cos 37°) would reduce the current to 54.5 A, a decrease of ∼20 per cent for the same true power."


### 7.3 Three-phase supplies, 120 degrees, and √3
On ships the usual supply is three-phase 440 V at 60 Hz (only **SECONDARY** sources, a college notes PDF; the MCA
syllabus lines do not state voltage or frequency). The √3 is the sum (really a difference) of two phasors 120° apart:
a 30-60-90 triangle in Fiore's proof, which is Lesson 2's exact values reused.

- **Ships: 440 V, 60 Hz, three-phase (SECONDARY)** **SECONDARY**
  - Source: maritime electrical installations - notes on design .... http://www.iqytechnicalcollege.com/JEE129-MarineElectricalSystems.pdf
  - Quote: "The majority of ships have a 3 phase, 3 wire, 440V insulated neutral system."
- **Ships: 60 Hz most common (SECONDARY)** **SECONDARY**
  - Source: maritime electrical installations - notes on design .... http://www.iqytechnicalcollege.com/JEE129-MarineElectricalSystems.pdf
  - Quote: "60 Hz is the most common frequency adopted for use on board ship"
- **Three-phase: three equal voltages 120 degrees apart**
  - Source: CHAPTER 2. https://pages.mtu.edu/~avsergue/EET2233/Lectures/CHAPTER2.pdf
  - Quote: "3-phase systems consist of 3 equal in magnitude voltages and 120 degrees out of phase relative to each other."
- **Three-phase: three coils at 120 degrees (Physclips)**
  - Source: AC power, RMS and 3-Phase circuits. https://www.animations.physics.unsw.edu.au/jw/power.html
  - Quote: "If it has three coils, mounted at relative angles of 120°, then it will produce three sinusoidal emfs with relative phases of 120°"
- **Three-phase: line voltage of a Y generator is root 3 times the phase voltage (Fiore)** **SECONDARY**
  - Source: 9.3: Three-Phase Connections - Engineering LibreTexts. https://eng.libretexts.org/Bookshelves/Electrical_Engineering/Electronics/AC_Electrical_Circuit_Analysis%3A_A_Practical_Approach_(Fiore)/09%3A_Polyphase_Power/9.3%3A_Three-Phase_Connections
  - Quote: "For example, if the phase voltage of a Y-connected generator is 120 volts, the line voltage would be \(\sqrt{3}\) times larger, or approximately 208 volts."
- **Three-phase: the proof is a triangle with a 30 degree angle (Fiore)** **SECONDARY**
  - Source: 9.3: Three-Phase Connections - Engineering LibreTexts. https://eng.libretexts.org/Bookshelves/Electrical_Engineering/Electronics/AC_Electrical_Circuit_Analysis%3A_A_Practical_Approach_(Fiore)/09%3A_Polyphase_Power/9.3%3A_Three-Phase_Connections
  - Quote: "half of 120 degrees, or 60 degrees. As the sum of the interior angles of a triangle must be 180 degrees, this means that the third angle must be 30 degrees."
- **Three-phase: root 3 comes from subtracting two vectors 120 degrees apart** **SECONDARY**
  - Source: Square Root 3 and Three Phase Power – Where Does it Come From – Electrical PE Review. https://www.electricalpereview.com/square-root-three-3-electrical
  - Quote: "In the most simplest terms, the square root three is a magnitude multiplier that accompanies a 30 degree phase shift between line voltages and their respective phase voltages for a wye system, and line currents and their respective phase currents for a delta system that is a result of adding (or subtracting) two vectors that are equal in magnitude and 120 degrees apart."
- **Three-phase: closing side is twice the phase voltage times sin 60 (SECONDARY)** **SECONDARY**
  - Source: Three-Phase Power Basics — three voltages, one steady total | ElectronicsInfoline. https://www.electronicsinfoline.com/fundamentals/ac-circuits/three-phase-basics/
  - Quote: "Two phasors of equal length with a third of a cycle between them, drawn head to tail with one reversed, close an isosceles triangle whose apex angle is 120 degrees, so the closing side is twice the phase voltage times the sine of 60 degrees. Root three is that sine, doubled."
- **Three-phase: 230 V phase gives about 400 V line, the figure that catches people out (SECONDARY)** **SECONDARY**
  - Source: Three-Phase Power Basics — three voltages, one steady total | ElectronicsInfoline. https://www.electronicsinfoline.com/fundamentals/ac-circuits/three-phase-basics/
  - Quote: "Why is the line voltage 400 V when each phase is only 230 V? The two phase voltages are a third of a cycle apart, so the difference between them is not twice either one. Doing the subtraction as phasors gives the square root of three times the phase voltage, which comes out close to 400 V for a 230 V phase."


### 7.4 Navigation, forces and surveying
The MCA lines for resolving vectors and forces are in 3.3. Wikipedia (**SECONDARY**) for the sextant. HELM's
cosine-rule example (two ships' distance apart, 73.5 nautical miles) is in 4.4.

- **Navigation: trigonometry fixes a ship position from a sextant angle (SECONDARY)** **SECONDARY**
  - Source: Trigonometry - Wikipedia. https://en.wikipedia.org/wiki/Trigonometry
  - Quote: "are used to measure the angle of the sun or stars with respect to the horizon."
- **HELM: surveying, navigation, mechanisms use any triangle**
  - Source: 44. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%204%20Trigonometry.pdf
  - Quote: "the subject has appli- cations in dealing with any triangles such as those that might arise in surveying, navigation or the study of mechanisms."


### 7.5 Shaft power and radians per second
Power = torque × angular velocity needs ω in radians a second, so rev/min is multiplied by 2π/60. Bird's solution to
a ship propeller shaft is a ready example.

- **Shaft: ship drive shaft torque 400 kN m at 400 rev/min gives power (Bird and Ross solutions)**
  - Source: CHAPTER 10 TORQUE. https://s3-eu-west-1.amazonaws.com/s3-euw1-ap-pe-ws4-cws-documents.ri-prod/9781138781573/study/11.pdf
  - Quote: "The drive shaft of a ship supplies a torque of 400 kN m to its propeller at 400 rev/min. Determine the power delivered by the shaft. Power, P = ωT = 2πnT = 2π × 400 60 × 400 × 3 10 = 16.76 × 6 10 W = 16.76 MW"
- **Shaft: rev/min must become rad/s by 2 pi over 60 (MTU)**
  - Source: Motor Calculations - Michigan Technological University. https://pages.mtu.edu/~wjendres/ProductRealization1Course/DC_Motor_Calculations.pdf
  - Quote: "In calculating rotational power, it is necessary to convert the velocity to units of rad/sec. This is accomplished by simply multiplying the velocity in RPM by the constant (2 x π) /60"
- **Shaft: P = T w and RPM times 2 pi over 60 (Mississippi State)**
  - Source: Section I.2. https://www.ae.msstate.edu/tupas/SA2/chA6.3_text.html
  - Quote: "P = T w where w is the angular velocity of the shaft. This is the relationship between the torque in the shaft and the power transmitted through it from one end to the other. It is important that we use consistent units for P, T, and w . Power is commonly specified in horsepower, HP. In that case we can convert HP to ft-lb/sec by multiplying it by 550, and to in-lb/sec by multiplying it by 6600. Angular velocity is usually given in revolutions per minute or RPM. It should then be converted to rad/sec. To do this multiply the value in RPM by 2 pi and divide by 60."
- **Shaft: the radian is dimensionless, a ratio of two lengths (OpenStax)**
  - Source: 10.8 Work and Power for Rotational Motion - University Physics Volume 1 | OpenStax. https://openstax.org/books/university-physics-volume-1/pages/10-8-work-and-power-for-rotational-motion
  - Quote: "It is important to note the radian is a dimensionless unit because its definition is the ratio of two lengths."
- **MCA Applied Mechanics: the power developed by a torque**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "States the expression for the power developed by a torque."


### 7.6 Engines: crank angle and piston position (a possible reach, not a marine line)
The EPI and FIRGELLI pages are about engines in general, not a marine syllabus line: use only if a lesson wants a
turning crank. The HN and MCA lists in section 3 do not name it (**UNCONFIRMED** as a syllabus line).

- **Crank and conrod: the effective length is the rod length times a cosine (not marine-specific)**
  - Source: Piston Motion: The Obvious and not-so-Obvious, by EPI, Inc.. https://www.epi-eng.com/piston_engine_technology/piston_motion_basics.htm
  - Quote: "at any point other than TDC or BDC is the actual conrod center-to-center length multiplied by the cosine of the angle between the rod and the cylinder centerline."
- **Crank and conrod: the cosine effect adds to a sinusoidal motion**
  - Source: Piston Motion: The Obvious and not-so-Obvious, by EPI, Inc.. https://www.epi-eng.com/piston_engine_technology/piston_motion_basics.htm
  - Quote: "It is clear that the dynamic change in the conrod effective length adds to and subtracts from the purely sinusoidal motion caused by crankpin rotation."
- **Crank and conrod: a right triangle of rod, half-stroke and effective length**
  - Source: Piston Motion: The Obvious and not-so-Obvious, by EPI, Inc.. https://www.epi-eng.com/piston_engine_technology/piston_motion_basics.htm
  - Quote: "The actual length of the conrod { 6.100 inches }, the projected length in the vertical plane, and the 2.00 inch horizontal travel"
- **Crank-slider: x = r cos theta + l root(1 - (r sin theta / l)^2)** **SECONDARY**
  - Source: Free Crank-Slider Mechanism Calculator | FIRGELLI Engineering. https://www.firgelliauto.com/blogs/engineering-calculators/crank-slider-mechanism-calculator
  - Quote: "x = r cos θ + l √(1 - (r sin θ / l)²)"
- **Crank-slider: a triangle and a little trigonometry** **SECONDARY**
  - Source: Free Crank-Slider Mechanism Calculator | FIRGELLI Engineering. https://www.firgelliauto.com/blogs/engineering-calculators/crank-slider-mechanism-calculator
  - Quote: "Nothing magic—just a triangle and a little trigonometry."


---

## 8. Size: how many lessons, and which core

Brilliant spends 70 lessons (14 levels); Khan has four units; Bitesize National 5 has five trigonometry items;
HELM is 5 sections and 77 pages; Bird has six chapters, plus the waveform-adding chapter 35. SQA Higher gives
trigonometry a tenth to a quarter of its marks.

- **HELM Workbook 4 is 77 pages in five sections (Student guide)**
  - Source: HELM Workbook 49 Student's Guide. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2049%20Student's%20Guide.pdf
  - Quote: "Workbook 4 - Trigonometry (77 pages) 4.1 Right-angled Triangles 4.2 Trigonometric Functions 4.3 Trigonometric Identities 4.4 Applications of Trigonometry to Triangles 4.5 Applications of Trigonometry to Waves"
- **Brilliant: Trigonometric Functions is 14 levels**
  - Source: Practice Trigonometric Functions | Brilliant. https://brilliant.org/courses/trigonometric-functions/graphing-sine-and-cosine?lesson=the-sine-graph
  - Quote: "Level 14 Combining Functions Changing Oscillations Changing Midline Changing Amplitude Combined Models"

My reading: the benchmarks' common core, cut to what the HN and MCA lines ask for, supports **eight** lessons, with a
ninth possible:
1. Ratios from similar triangles; sin, cos, tan; finding a side; slope as tan θ; the conduit multiplier.
2. Finding an angle (inverse), choosing the ratio, the 30-45-60 triangles, forces resolved into parts.
3. Degrees and radians (arc over radius, rev/min to rad/s, arc length).
4. The unit circle becomes the sine and cosine waves; sin² + cos² = 1; angles past 90°.
5. The wave's features: amplitude, midline, period, frequency, ω = 2πf, phase; AC at 50 and 60 Hz.
6. Triangles without a right angle: the sine and cosine rules, the ambiguous case, area ½ab sin C, ships and bearings.
7. Adding two waves of one frequency: phasors as turning arrows, amplitude and phase of the sum, three-phase √3.
8. Power factor as a cosine, the power triangle, and a mixed set of "which rule?" problems.
9. (optional) Solving simple trigonometric equations (the many answers of sin x = 0.5; SQA H7K0 33 outcome 1).
Seven is possible by joining 1 and 2 and leaving out 9; nine adds equations as their own lesson. The reason for
eight: Brilliant, Khan and HELM each give the circle-to-wave step several lessons, units or sections (Brilliant levels
2, 3, 8 and 10), and the MCA and Pearson lines ask for both the rules and the waves.

---

## 9. Unconfirmed, secondary and contested, in one place
- **UNCONFIRMED:** what is inside each Brilliant lesson; the full Pearson 4002 "Essential Content" for LO3 (2024);
  the exact form of the equations in SQA H7K0 33's evidence requirement; any peer-reviewed study on how students learn
  phasors (none turned up in two searches); any syllabus line naming conduit offsets, shrink or piston position.
- **SECONDARY:** Williams (student paper), academia.edu (a summary of a study), ScienceDirect (a 2020 paper
  reporting Weber and Moore), Cognito, Save My Exams and Wikipedia pages, Brilliant's archived wiki, the Higher Maths
  site, HVAC Calculator Pro, EleCalculator, Turn2Engineering, conduitbending.com, Electrical A2Z, Electrical PE Review,
  ElectronicsInfoline, the ship notes PDF and the Mustansiriyah notes, and every LibreTexts page (they host textbooks).
- **Contested or inconsistent:** the order (triangle first or circle first), phasor length (peak or rms), conduit
  shrink and the 10° multiplier, and the numbers on two pages in 6.3.
- **Dropped:** Thompson 2008 (only seen on a copy site); the Warsash refresher (it has no trigonometry).

---

## 10. Numbers I computed (my reading; each follows from the rule shown)
- Conduit multiplier = 1 ÷ sin θ: 10°, 5.759; 15°, 3.864; 22.5°, 2.613; 30°, 2.000; 45°, 1.414; 60°, 1.155.
- Exact shrink per inch of offset = csc θ − cot θ = tan(θ/2): 10°, 0.0875; 22.5°, 0.1989; 30°, 0.2679; 45°, 0.4142;
  60°, 0.5774 (against the field constants 1/16, 3/16, 1/4, 3/8, 1/2 = 0.0625, 0.1875, 0.25, 0.375, 0.5).
- Motor example (Electrical A2Z): PF = 450 ÷ (230 × 2.7) = 0.7246, φ = arccos 0.7246 = 43.6° (the page says 0.72 and 43.6°).
- 10 kW on 230 V single phase: 43.5 A at PF 1, 72.5 A at 0.6, 54.3 A at 0.8 (the page says 72.5 and 54.5; cos 53° = 0.602, cos 37° = 0.799).
- Three-phase: 230 × √3 = 398.4 V; 240 × √3 = 415.7 V; 120 × √3 = 207.8 V; and a ship's 440 V line gives 440 ÷ √3 = 254.0 V a phase.
- ω = 2πf: 50 Hz, 314.16 rad/s; 60 Hz, 376.99 rad/s.
- Ship shaft: P = 2π × (400 ÷ 60) × 400 000 = 16.755 MW (Bird's solution prints 16.76 MW).
- HELM ships: c² = 48² + 40² − 2 × 48 × 40 × cos 113° = 5404.4, c = 73.5 nautical miles.
- Crank-slider: x = r cos θ + √(l² − r² sin² θ); r = 2, l = 7.5, θ = 90° gives 7.228; r = 1.5, l = 5, θ = 45° gives 5.947 (page: 5.946), range 3.5 to 6.5.
- cos 10 rad = −0.8391, cos 10° = 0.9848 (Lamar), so a wrong calculator mode flips the sign.
- sin²θ + cos²θ at 30°: 0.25 + 0.75 = 1.
