# Differential equations: research notes

Researched 25 Oct 2026 for the Differential equations course brief (the sixth course in the Maths shelf's Advanced maths
folder, which now runs Calculus fundamentals, Vectors, Matrices, Linear algebra, Vector calculus, Differential equations,
Group theory; blurb "Equations about change, and how to solve and read them."; benchmark Brilliant's Differential
Equations courses). The brief itself is not written here; these notes are its evidence. Dan is an electrician and a Royal
Navy submariner on the electrical engineering path; next year he does a Level 3 marine engineering course (general
engineering first, then submarine and nuclear propulsion). He asked for foundations that see him through any new topic,
not a remake of Brilliant's course.

Every finding has its source title, URL and the exact words, copied from a saved tool result by script (the quotes were not
retyped into this file). All of them are listed in `quotes.json` beside this file and were checked with
`node tools/eval/sources.mjs --quotes ... --tools ...` (`failed: 0`). The tool files are in `tools/`. A quote joined by
" ... " is several passages of one page, in page order, with the links and formulas between them left out. Findings I could
not confirm are marked **UNCONFIRMED**; where only a non-original site said it, **SECONDARY**. My own readings are marked
"My reading" and are not quotes. Mirror and copy sites were avoided; Class Central (a listing site) is the only place
Brilliant's old lesson list can be quoted, so it is marked SECONDARY, and the Wayback Machine copy of Brilliant's own page
is described but not quoted because the checker rejects archive copies (marked UNCONFIRMED below).

Where the tool output carried maths as plain text, the quotes show it as it came (for example `_dy dx_`); read the formula
from the HELM or LibreTexts page, not from the quote.

---

## 1. Benchmark: Brilliant's Differential Equations

### 1.1 The course itself
**Brilliant no longer has a differential equations course.** Its own help page, with data pulled on 9 Oct 2026, says so, and
tells learners to look elsewhere for slope fields and separation of variables. Its Advanced Math band is now Limits,
Derivatives, Calculus, Vectors and Matrices.

- **Brilliant's own list of its calculus and advanced math courses now**
  - Source: What math does Brilliant cover? | Brilliant. https://brilliant.org/help/courses-and-curriculum/what-math-does-brilliant-cover/
  - Quote: "Calculus and advanced math |Limits , Derivatives , Calculus , Vectors , and Matrices"
- **Brilliant's own help page (data pulled 9 Oct 2026) says there is now no differential equations course**
  - Source: Does Brilliant cover Calculus? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-calculus
  - Quote: "No. Brilliant's calculus material is single-variable throughout. There is no multivariable calculus, linear algebra, or differential equations course."
- **The Brilliant help page's data date**
  - Source: Does Brilliant cover Calculus? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-calculus
  - Quote: "The data here was pulled on October 9, 2026."
- **Brilliant tells learners to look elsewhere for slope fields and separation of variables, and points to its exponentials course for growth and decay**
  - Source: Does Brilliant cover Calculus? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-calculus
  - Quote: "Slope fields, separation of variables, and the full Unit 7 treatment. Exponential growth and decay models are covered,"
- **Brilliant's current Advanced Math band: derivatives, integrals, vectors and beyond (no differential equations named)**
  - Source: Topics | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "Advanced Math New Dive into key ideas in derivatives, integrals, vectors, and beyond"

**What the course was.** The Wayback Machine holds Brilliant's own page for it as it stood on 6 Jan 2024, at
`web.archive.org/web/2023/https://brilliant.org/courses/differential-equations/`. It is headed 5.2 Differential Equations,
in Advanced Math, Level 5, with 30 lessons. Its named topics include direction fields, Euler's method, integrating factors,
linear systems, the matrix exponential, phase portraits, separable first-order equations and Wronskian determinants. Its
prerequisites say a first semester of calculus, with linear algebra up to eigenvalues and eigenvectors and multivariable
calculus up to gradients as essential. **UNCONFIRMED** by the checker: the Wayback host is an archive copy, so none of this
is in `quotes.json`; the lesson list is the same as Class Central's copy of the same course, quoted below.

Class Central kept Brilliant's syllabus for Differential Equations I (the page says the course "may be unavailable", and its
workload is shown as 40 to 50 hours):

- **Brilliant's description of Differential Equations I** (SECONDARY)
  - Source: Online Course: Differential Equations I from Brilliant | Class Central. https://www.classcentral.com/course/brilliant-differential-equations-59260
  - Quote: "Differential equations show up in just about every branch of science, including classical mechanics, electromagnetism, circuit design, chemistry, biology, economics, and medicine. From analyzing the simple harmonic motion of a spring to looking at the population growth of a species, differential equations come in a rich variety of different flavors and complexities. This course takes you on a grand tour of some of the most important differential equations of the natural sciences, giving you the hands-on experience needed to master the essentials."
- **Brilliant's Differential Equations I, as Class Central copied its syllabus: five parts, from the first equation to the higher-order equations** (SECONDARY)
  - Source: Online Course: Differential Equations I from Brilliant | Class Central. https://www.classcentral.com/course/brilliant-differential-equations-59260
  - Quote: "Introduction: Discover why differential equations are so important! ... First-Order Separable Equations: Build and explore real-world models with first-order equations. ... Advanced First-Order Equations: Learn the power of combining geometry and differential equations ... Basics of Linear Systems: Matrices and vectors unlock the gateway to higher-order equations. ... Higher-Order Equations: The workhorse of physics, engineering, and applied mathematics."
- **The lessons on the path to the circuit and spring material, in order: cooling, drag, separate-and-integrate, direction fields, integrating factor, mixing, phase plane, underdamped springs, order two, RLC filter, motor** (SECONDARY)
  - Source: Online Course: Differential Equations I from Brilliant | Class Central. https://www.classcentral.com/course/brilliant-differential-equations-59260
  - Quote: "Differential Equations in a Nutshell ... Our First Equation ... Modeling: The Drag Equation ... Separate and Integrate ... The Phase Portrait ... Direction Fields ... Integrating Factor ... Application: A Mixing Problem ... The Phase Plane ... The Matrix Exponential ... Application: Underdamped Springs ... Equations of Order Two ... Application: RLC Filter ... Application: Get Your Motor Runnin"
- **Class Central's copy of Brilliant's Differential Equations I: the first lesson builds Newton's law of cooling** (SECONDARY)
  - Source: Online Course: Differential Equations I from Brilliant | Class Central. https://www.classcentral.com/course/brilliant-differential-equations-59260
  - Quote: "Our First Equation: Use Newton's Law of Cooling to build and solve your first differential equation."
- **Differential Equations I reaches second-order equations through matrices, and has an RLC lesson for electrical engineers** (SECONDARY)
  - Source: Online Course: Differential Equations I from Brilliant | Class Central. https://www.classcentral.com/course/brilliant-differential-equations-59260
  - Quote: "Basics of Linear Systems: Matrices and vectors unlock the gateway to higher-order equations. ... Application: RLC Filter: Find out what second-order equations can do for electrical engineers."
- **Differential Equations I took 40 to 50 hours** (SECONDARY)
  - Source: Online Course: Differential Equations I from Brilliant | Class Central. https://www.classcentral.com/course/brilliant-differential-equations-59260
  - Quote: "Duration & workload 40-50 hours"

The 30 lessons, in order, as that syllabus gives them (titles only, my wording of the groupings):
1. **Introduction (2):** Differential Equations in a Nutshell; Our First Equation (Newton's law of cooling).
2. **First-order separable (7):** Modeling: The Drag Equation; Separate and Integrate; Application: Molecular Motor; The Phase
   Portrait; Concavity and Partial Fractions; Application: In the Chem Lab; Capstone: Vampires of Cancelvania.
3. **Advanced first-order (6):** Direction Fields; Integrating Factor; Application: A Mixing Problem; The Potential;
   Application: Fluid Flow; Capstone: The Great Escape.
4. **Basics of linear systems (8):** The Phase Plane; The Matrix Exponential; Application: Underdamped Springs;
   Non-Diagonalizable Matrices; Review: Math of a Salesman; Nonhomogeneous Systems Parts I and II; Challenge: Floquet Theory.
5. **Higher-order equations (7):** Equations of Order Two; Application: RLC Filter; Challenge: Higher-Order Equations;
   Application: Hangin' Around; Beam Me Up!; Application: Get Your Motor Runnin'; Challenge: Why's The Sky Blue?

My reading, the course in one line: cooling first, then drag, separate and integrate, the phase portrait; direction fields
and the integrating factor; then straight into matrices and eigenvectors for springs and circuits; then order two with an
RLC filter and a motor. Three things for the brief. (1) Brilliant puts the first equation, Newton's cooling, at lesson 2, so
the "rule for change" idea comes before any method. (2) It reaches second-order equations through linear algebra, which Dan
does not have (Matrices and Linear algebra come after); his course takes the other classic route, the characteristic
equation and its roots, which uses his Complex numbers course. (3) Its picture tools are the direction field and the phase
portrait, with a picture-and-play feel, but the lesson pages themselves are **UNCONFIRMED** (I did not see a lesson).

### 1.2 Where it sat in Brilliant's path
- In its old path, Differential Equations was level 5.2 of Advanced Math (**UNCONFIRMED**, Wayback copy), after the calculus
  courses and with linear algebra and multivariable calculus as stated prerequisites. Brilliant's Calculus page names what
  follows Calculus in a Nutshell:

- **After Calculus in a Nutshell, Brilliant sends learners to Calculus Fundamentals and Integral Calculus, not to differential equations**
  - Source: Practice Calculus | Brilliant. https://brilliant.org/courses/calculus-nutshell/
  - Quote: "Calculus Fundamentals and Integral Calculus are the two courses that can follow next in the Calculus sequence."

- A second course, Differential Equations II, took nonlinear equations, partial differential equations, transforms
  (Fourier and Laplace) and power series. All of it is deferred for Dan (Laplace, systems, PDEs go to Matrices, Linear
  algebra and Vector calculus, as the task says):

- **Differential Equations II is nonlinear and partial equations, with Laplace transforms (all deferred for Dan)** (SECONDARY)
  - Source: Online Course: Differential Equations II from Brilliant | Class Central. https://www.classcentral.com/course/brilliant-differential-equations-ii-59289
  - Quote: "This course provides an immersive and interactive experience covering the essentials of nonlinear and partial differential equations. ... The Laplace Transform: Come full circle and see how transform methods work on ordinary differential equations."

My reading: on Dan's shelf the course comes after Vector calculus, as Brilliant's did, but Dan asked for foundations, so the
brief must not lean on Matrices, Linear algebra or Vector calculus. It leans on Calculus fundamentals, Exponentials and
logarithms, Quadratics and polynomials, Complex numbers, Trigonometry and AC circuits (section 5).

---

## 2. Other courses' order for the same ground

### 2.1 Khan Academy
Khan has two routes. The stand-alone Differential equations course is three units (first order; second order linear; Laplace).
The calculus-course route is one unit of eleven skills.

- **Khan Academy, Differential equations: three units; unit 1 runs intro, slope fields, Euler's method, separable, exponential models (Newton's law of cooling), logistic, exact and integrating factors, homogeneous**
  - Source: Differential Equations | Khan Academy. https://www.khanacademy.org/math/differential-equations
  - Quote: "Unit 1: First order differential equations ... Intro to differential equations ... Slope fields ... Euler's Method ... Separable equations ... Exponential models ... Newton's Law of Cooling ... Logistic models ... Exact equations and integrating factors ... Homogeneous equations"
- **Khan gives the 'dy/dx as a fraction' move its own lesson inside separable equations**
  - Source: Differential Equations | Khan Academy. https://www.khanacademy.org/math/differential-equations
  - Quote: "Separable equations ... Addressing treating differentials algebraically ... Working an example: identifying separable equations"
- **Khan unit 2 is second-order linear equations with complex and repeated roots of the characteristic equation; unit 3 is Laplace**
  - Source: Differential Equations | Khan Academy. https://www.khanacademy.org/math/differential-equations
  - Quote: "Unit 2: Second order linear equations ... Linear homogeneous equations ... Complex and repeated roots of characteristic equation ... Method of undetermined coefficients ... Unit 3: Laplace transform"
- **Khan's calculus-course unit on differential equations (the AP route): write them, check a solution, slope fields, separable, particular solutions**
  - Source: Differential equations | Calculus 1 | Math | Khan Academy. https://en.khanacademy.org/math/calculus-1/cs1-differential-equations
  - Quote: "Unit 7: Differential equations ... Write differential equations ... Verify solutions to differential equations ... Slope fields and equations ... Reasoning using slope fields ... Separable differential equations ... Particular solutions to separable differential equations"

My reading of the order: what a differential equation is and checking a solution; slope fields (read before solving);
Euler's method (before the formulas); separable equations; exponential models and Newton's law of cooling; logistic growth;
integrating factors; then second order by the characteristic equation (real, complex and repeated roots), then Laplace. Khan
puts Euler's method and slope fields before separation, which is the order the scope in the task asks for.

### 2.2 BBC Bitesize and SQA Higher / Advanced Higher
Bitesize Higher Maths has no differential equations page. It mentions them only as something integration can do. SQA Higher
has one differential equation question in 2023 (Q12), solved by integrating. The full run is SQA Advanced Higher.

- **BBC Bitesize Higher Maths touches differential equations only as an use of integration**
  - Source: Higher Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/subjects/z6nygk7
  - Quote: "Integration is the inverse of differentiation of algebraic and trigonometric expressions involving brackets and powers. This can solve differential equations and evaluate definite integrals."
- **SQA Higher 2023 report: the one differential equation question (Q12)**
  - Source: SQA Higher Mathematics 2023 course report. https://www.sqa.org.uk/files_ccc/2023-h-course-report-mathematics.pdf
  - Quote: "Many candidates identified the strategy required to solve the differential equation; however, a few candidates did not include the ‘ + c ’ when they integrated."
- **SQA Advanced Higher course specification: first-order linear with an integrating factor, then second-order linear**
  - Source: SQA Advanced Higher Mathematics course specification. https://www.sqa.org.uk/files_ccc/AHCourseSpecMathematics.pdf
  - Quote: "Solving first-order linear differential equations using an integrating factor ... Solving second-order differential equations"
- **Advanced Higher order of the four types** (SECONDARY)
  - Source: Differential Equations - Advanced Higher Maths. https://www.advancedhighermaths.co.uk/differential-equations-ah
  - Quote: "Variables Separable Differential Equations ... First Order Linear Differential Equations ... Second Order Homogeneous Linear Differential Equations ... Second Order Non-Homogeneous Differential Equations"

Bitesize's own named mistakes for differential equations: **UNCONFIRMED** (none exist for this topic; the SQA course reports
in section 6 are used instead).

### 2.3 HELM workbooks (Loughborough)
HELM Workbook 19 is the one written for engineers. Its first section is modelling, with Newton's law of cooling as the
case study, then first order, then second order, then applications. (The Imperial College copy of the PDF failed to load;
the Loughborough and Newcastle copies were read.)

- **HELM Workbook 19, Differential Equations (70 pages): modelling, first order, second order, applications; Laplace is the next workbook**
  - Source: HELM Workbook 49: Student's Guide (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2049%20Student's%20Guide.pdf
  - Quote: "Workbook 19 - Differential Equations (70 pages) ... Modelling with Differential Equations ... First Order Differential Equations ... Second Order Differential Equations ... Applications of Differential Equations ... Workbook 20 - Laplace Transforms (73 pages)"
- **HELM 19.1 learning outcomes**
  - Source: HELM Workbook 19: Differential Equations (Loughborough University, 2008). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2019%20Differential%20Equations.pdf
  - Quote: "understand the use of differential equations in modelling engineering systems ... identify the order and type of a differential equation ... recognise the nature of a general solution"
- **HELM 19.4 learning outcomes: electrical circuits, Newton's law of cooling, free electrical and mechanical oscillations**
  - Source: HELM Workbook 19: Differential Equations (Loughborough University, 2008). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2019%20Differential%20Equations.pdf
  - Quote: "recognise and solve first-order ordinary differential equations, modelling simple electrical circuits, projectile motion and Newton’s law of cooling ... recognise and solve second-order ordinary differential equations with constant coefficients modelling free electrical and mechanical oscillations"
- **HELM 19.3: second-order constant coefficient equations for vibrations and circuits**
  - Source: HELM Workbook 19: Differential Equations (Loughborough University, 2008). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2019%20Differential%20Equations.pdf
  - Quote: "In this Section we start to learn how to solve second order differential equations of a particular type: those that are linear and have constant coefficients. Such equations are used widely in the modelling of physical phenomena, for example, in the analysis of vibrating systems and the analysis of electrical circuits."

### 2.4 Bird's Engineering Mathematics
Bird's Engineering Mathematics (the book the Royal Navy's marine engineering college lecturer wrote, at HMS Sultan) gives
differential equations a single chapter; Bird's Higher Engineering Mathematics gives them chapters 46 to 51.

- **Bird's Engineering Mathematics (9th ed.) gives differential equations one chapter, the last of a 'Section 9'; as the one chapter of its Section 9**
  - Source: Bird's Engineering Mathematics - 9th Edition - John Bird - Routledge B. https://www.routledge.com/Birds-Engineering-Mathematics/Bird/p/book/9780367643782
  - Quote: "Section 9: Differential equations 56. Introduction to differential equations"
- **Bird's author taught at the Royal Navy's Defence College of Marine Engineering (HMS Sultan), where marine engineers train**
  - Source: Bird's Engineering Mathematics - 9th Edition - John Bird - Routledge B. https://www.routledge.com/Birds-Engineering-Mathematics/Bird/p/book/9780367643782
  - Quote: "He has recently retired from lecturing at the Royal Navy's Defence College of Marine Engineering in the Defence College of Technical Training at H.M.S. Sultan, Gosport, Hampshire, UK"
- **Bird's Engineering Mathematics chapter 56: family of curves, then differential equations, then dy/dx = f(x)**
  - Source: Bird’s Engineering Mathematics; NinthEdition. https://api.pageplace.de/preview/DT0400.9781000351941_A40491292/preview-9781000351941_A40491292.pdf
  - Quote: "56 Introduction to differential equations 561 ... Family of curves 561 ... Differential equations 562"
- **Bird's Higher Engineering Mathematics, chapter 46: separation of variables**
  - Source: Higher Engineering Mathematics - John Bird - Google Books. https://books.google.com.et/books?id=jefW5y24Vg4C&lr
  - Quote: "Chapter 46 Solution of first order differential equations by separation of variables"
- **Bird's Higher: chapters 47 and 48 (homogeneous, then linear first order)**
  - Source: Higher Engineering Mathematics - John Bird - Google Books. https://books.google.com.et/books?id=jefW5y24Vg4C&lr
  - Quote: "Chapter 47 Homogeneous first order differential equations ... Chapter 48 Linear first order differential equations"
- **Bird's Higher: chapter 49, numerical methods for first order equations**
  - Source: Higher Engineering Mathematics - John Bird - Google Books. https://books.google.com.et/books?id=jefW5y24Vg4C&lr
  - Quote: "Chapter 49 Numerical methods for first order differential equations"
- **Bird's Higher: chapters 50 and 51, second order with right-hand side zero and then f(x)**
  - Source: Higher Engineering Mathematics - John Bird - Google Books. https://books.google.com.et/books?id=jefW5y24Vg4C&lr
  - Quote: "Chapter 50 Second order differential equations of the form ... Chapter 51 Second order differential equations of the form"

My reading: all four agree on the core order: a rule for change and checking a solution; separate the variables; the linear
first-order equation with an input (integrating factor); a numerical method for first order; then second order with
constant coefficients, first with right-hand side zero (the characteristic equation), then with a forcing term.

---

## 3. What a marine engineering HNC actually uses of this topic

None of the MCA marine syllabi found asks for differential equations. The honest picture: first-order equations are an SQA
HN Engineering Mathematics 4 outcome; second-order constant coefficient equations are SQA Engineering Mathematics 5 (new
from August 2026) and Pearson's Further Mathematics unit (a specialist unit; its level is not shown in the excerpt I read);
the MCA mathematics syllabus stops at differentiation and integration.

### 3.1 SQA Higher National (Scotland)
- **SQA HN Engineering Mathematics 4 (SCQF 8), outcome 4: first order only**
  - Source: SQA Higher National Unit H7K3 35, Engineering Mathematics 4 (SCQF level 8). https://www.sqa.org.uk/sqa/files/hn/H7K335.pdf
  - Quote: "Solve a first order differential equation using the method of separation of variables  Solve a first order differential equation by substitution  Solve a first order differential equation using the integrating factor method  Solve a first order differential equation with an initial value using one of the three methods shown"
- **SQA Engineering Mathematics 4: the delivery notes (12 of 40 hours; 'that arise in Engineering'; engineering initial values)**
  - Source: SQA Higher National Unit H7K3 35, Engineering Mathematics 4 (SCQF level 8). https://www.sqa.org.uk/sqa/files/hn/H7K335.pdf
  - Quote: "Outcome 4 (12 hours) Solve first order differential equations ... including first order differential equations that arise in Engineering ... Solve first order differential equations taken from Engineering with an initial value using one of the methods shown above"
- **SQA Engineering Mathematics 4: recommended entry is calculus**
  - Source: SQA Higher National Unit H7K3 35, Engineering Mathematics 4 (SCQF level 8). https://www.sqa.org.uk/sqa/files/hn/H7K335.pdf
  - Quote: "it would be advantageous if learners had a good knowledge and understanding of differential and integral calculus together with sound numerical and algebraic skills."
- **SQA tells learners why: first order equations arise in engineering, and complex numbers in AC circuits**
  - Source: SQA Higher National Unit H7K3 35, Engineering Mathematics 4 (SCQF level 8). https://www.sqa.org.uk/sqa/files/hn/H7K335.pdf
  - Quote: "Complex numbers arise in many branches of Engineering (eg ac electrical circuits). ... finally you will be introduced to a range of techniques for solving an important class of equations known as first order differential equations which arise extensively in many areas of Engineering."
- **SQA NextGen Engineering Mathematics 5 (valid from August 2026): second-order, constant coefficient equations**
  - Source: SQA NextGen HN unit J7LB 48, Engineering Mathematics 5 (SCQF level 8). https://www.sqa.org.uk/sqa/files_ccc/j7lb-48-engineering-mathematics-5.pdf
  - Quote: "solve second-order, constant coefficient differential equations ... Provide examples of second-order differential equations from engineering. ... Introduce the auxiliary equation (characteristic equation)"
- **SQA Engineering Mathematics 5: recommended entry includes first-order techniques, and Laplace transforms come at this unit (deferred)**
  - Source: SQA NextGen HN unit J7LB 48, Engineering Mathematics 5 (SCQF level 8). https://www.sqa.org.uk/sqa/files_ccc/j7lb-48-engineering-mathematics-5.pdf
  - Quote: "a good knowledge and understanding of differential and integral calculus, including techniques for solving first-order differential equations ... Solve first- and second-order differential equations with initial conditions using"

### 3.2 Pearson BTEC Higher National (England)
Unit 4002 Engineering Maths is a core unit of the Level 4 HNC. I could read its learning outcomes only in the Issue 7
specification (October 2020), where it is Unit 2; the 2024 specification lists the same unit under 4002 and the LSBU
specification gives the same code under Unit 02. **UNCONFIRMED** that the 2024 wording of Unit 4002 is unchanged (the PDF
excerpts I got did not show its outcomes).

- **Pearson 2024 specification lists Unit 4002 Engineering Maths as core and mandatory at Level 4**
  - Source: Pearson BTEC Higher Nationals in Mechanical Engineering for England, specification 2024. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/mechanical-engineering-for-england/2024/specification/9781292448503-btec-hn-l4-l5-mech-engin-england.pdf
  - Quote: "Unit 4002: Engineering Maths 15 4 Core Mandatory"
- **The same unit code M/615/1476 is Unit 02 in the older numbering (so the 2020 Unit 2 text stands for Unit 4002)** (SECONDARY)
  - Source: Pearson BTEC Level 4 HNC in Engineering (Mechanical Engineering), LSBU course specification. https://www.lsbu.ac.uk/_resources/pdf/course-specification/2024-2025/undergraduate/eng/Pearson_HNC_in_Engineering_Mechanical_Engineering_01_11_2023.pdf
  - Quote: "Unit 02: Engineering Maths Core M/615/1476 15 4"
- **Pearson HNC/HND Engineering, Unit 2 Engineering Maths (Unit 4002 in the 2024 numbering): the calculus outcome stops at rates of change; no differential equations here**
  - Source: Pearson BTEC Levels 4 and 5 Higher Nationals in Engineering Specification, Issue 7 (October 2020). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/General-Engineering/2017/specification-and-sample-assessments/hncd-l45-engineering-rqf.pdf
  - Quote: "Determine solutions of equations using exponential, logarithmic, trigonometric and hyperbolic functions ... Examine how differential and integral calculus can be used to solve engineering problems ... Determine rates of change for algebraic, logarithmic and trigonometric functions"
- **Pearson Unit 39 Further Mathematics (a specialist unit) holds the differential equations: first order, second order and Laplace**
  - Source: Pearson BTEC Levels 4 and 5 Higher Nationals in Engineering Specification, Issue 7 (October 2020). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/General-Engineering/2017/specification-and-sample-assessments/hncd-l45-engineering-rqf.pdf
  - Quote: "review models of engineering systems using ordinary differential equations ... Formulate and solve first order differential equations related to engineering systems ... Formulate and solve second order homogeneous and non- homogeneous differential equations related to engineering systems ... Calculate solutions to linear ordinary differential equations using Laplace transforms"
- **Pearson also names first and second order systems in its control unit**
  - Source: Pearson BTEC Levels 4 and 5 Higher Nationals in Engineering Specification, Issue 7 (October 2020). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/General-Engineering/2017/specification-and-sample-assessments/hncd-l45-engineering-rqf.pdf
  - Quote: "Analyse the behaviour and response of first and second order systems"

### 3.3 MCA engineer officer syllabuses
The MCA mathematics syllabus I could read is the Second Engineer written examination syllabus; General Engineering Science I
carries the basic mathematics and mechanics. A syllabus titled Applied Mathematics: **UNCONFIRMED** (not found under that
name). The written examinations are being replaced by digital assessments, so these lines will move.

- **MSN 1857: the Second Engineer academic examinations (mathematics is the first)**
  - Source: MSN 1857 (M+F): UK Requirements for Engineer Officers and Engineer Operators. https://assets.publishing.service.gov.uk/media/5a80116fe5274a2e8ab4dfe4/MSN_1857.pdf
  - Quote: "Second Engineer: Mathematics, Applied Mechanics, Applied Heat, Engineering Drawing, Electro Technology"
- **MCA Second Engineer mathematics syllabus: the maths ends with differentiation and integration**
  - Source: Mathematics Written Examination Syllabus (MCA Second Engineer), GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "Calculus - differentiation ... Calculus - integration"
- **MCA syllabus lines on rate of change and the constant of integration (the nearest it comes to this topic)**
  - Source: Mathematics Written Examination Syllabus (MCA Second Engineer), GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "Discusses the concept of rate of change. ... Discusses the concept of the indefinite integral and the need for a constant. ... Determines the constant of integration from given conditions."
- **MCA General Engineering Science I mathematics stops before calculus; its nearest line is the gradient of a velocity-time graph**
  - Source: General Engineering Science I Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses
  - Quote: "Calculate and interpret the gradient of velocity time graph as acceleration."
- **The MCA written exams are being replaced by digital assessments**
  - Source: MIN 720 (M) Amendment 1 - Transforming seafarer training: the UK’s modernised officer qualifications syllabus - GOV.UK. https://www.gov.uk/government/publications/min-720-m-amendment-1-transforming-seafarer-training-the-uks-modernised-officer-qualifications-syllabus/min-720-m-amendment-1-transforming-seafarer-training-the-uks-modernised-officer-qualifications-syllabus
  - Quote: "All MCA written exams in their current format will cease from April 2028."

My reading: no marine syllabus asks Dan for differential equations, but all three lead straight to them: rates of change
and the constant of integration are the MCA's last calculus lines, first-order equations are the HN's first step, and
second-order equations are the HND's. The course earns its place as the foundation Dan needs for the second half of a
marine engineering qualification, and for the Navy's nuclear and propulsion training, where these curves are named
(section 7). What his Level 3 marine engineering course will actually ask is **UNCONFIRMED** (no syllabus for it was found).

---

## 4. The scope, and what research says about each part

### 4.1 What a differential equation is: a rule for how a quantity changes in terms of the quantity itself
- **In a differential equation the unknown is a function, not a number**
  - Source: Rasmussen, Reform in Differential Equations: A Case Study of Students' Understandings and Difficulties (AERA 1998, ERIC ED420508). https://files.eric.ed.gov/fulltext/ED420508.pdf
  - Quote: "In differential equations, however, the ”unknown” that one is interested in is no longer a number, but a function."
- **Newton's law of cooling written as words first**
  - Source: HELM Workbook 19: Differential Equations (Loughborough University, 2008). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2019%20Differential%20Equations.pdf
  - Quote: "Newton’s law of cooling states that the rate of cooling of liquid is proportional to the difference between its temperature and the temperature of its environment (the ambient temperature)."
- **HELM's definitions of ODE and order**
  - Source: HELM Workbook 19: Differential Equations (Loughborough University, 2008). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2019%20Differential%20Equations.pdf
  - Quote: "An ordinary differential equation (ODE) is any relation between a function of a single variable and its derivatives. ... The order of a differential equation is the order of the highest derivative in the equation."

My reading: start from what Dan has (Calculus fundamentals lesson 5, a capacitor's current follows how fast its voltage
changes). A differential equation is a rule for the rate; its answer is a whole function of time, not one number. Cooling is
the classic first rule: the rate depends on the gap to the surroundings.

### 4.2 Reading one before solving it: slope fields and steady states
- **Direction fields can be read before any method of solving**
  - Source: Differential Equations - Direction Fields. https://tutorial.math.lamar.edu/classes/de/directionfields.aspx
  - Quote: "understanding direction fields and what they tell us about a differential equation and its solution is important and can be introduced without any knowledge of how to solve a differential equation"
- **Students can classify steady states yet not see them as constant functions**
  - Source: Rasmussen, Reform in Differential Equations: A Case Study of Students' Understandings and Difficulties (AERA 1998, ERIC ED420508). https://files.eric.ed.gov/fulltext/ED420508.pdf
  - Quote: "Students could find the equilibrium solutions and even classify them as stable or unstable, but they did not appear to think of equilibrium solutions to differential equations as collections of functions, but rather as a collection of numbers where the derivative is zero."

My reading: a slope field is "at this point, go this way"; a steady state is where the rate is zero. The research warns
that students find steady states as numbers and not as constant solutions (section 6), so the interactive should draw the
flat line as a solution, and a start value should be a point you place and watch the curve follow.

### 4.3 First-order equations that separate; growth, decay, cooling, charging
- **HELM solves Newton's law of cooling by separating variables; the temperature settles at the surroundings**
  - Source: HELM Workbook 19: Differential Equations (Loughborough University, 2008). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2019%20Differential%20Equations.pdf
  - Quote: "We see that as time increases ... cools down to that of the environment"
- **HELM on separation of variables: what it does and that it does not always work**
  - Source: HELM Workbook 19, Section 19.2 First Order Differential Equations (copy at Newcastle University). https://www.mas.ncl.ac.uk/ask/numeracy-maths-statistics/images/First_order_odes.pdf
  - Quote: "Separation of variables is a technique commonly used to solve first order ordinary differential equations. It is so-called because we rearrange the equation to be solved such that all terms involving the dependent variable appear on one side of the equation, and all terms involving the independent variable appear on the other. Integration completes the solution. ... Not all first order equations can be rearranged in this way so this technique is not always appropriate."
- **HELM exercise: the RL equation separates and gives i = E/R (1 - e^(-t/tau)) with tau = L/R**
  - Source: HELM Workbook 19, Section 19.2 First Order Differential Equations (copy at Newcastle University). https://www.mas.ncl.ac.uk/ask/numeracy-maths-statistics/images/First_order_odes.pdf
  - Quote: "where R, L and E are constants arises in electrical circuit theory. This equation can be solved by separation of variables. ... where τ = L/R"

### 4.4 The time constant, the 63% and five-time-constant rules
Dan's Exponentials and logarithms course already teaches the curve and the rules (its lesson 3: 63%, 98% at 4T, 99.3% at
5T, Newton's cooling in the same shape). This course should explain *where the rule comes from*: a rate proportional to the
gap, so the gap shrinks by the same fraction in equal times.

- **RC charging: 63% after one RC, more than 99% by five**
  - Source: The RC Circuit (R. Fitzpatrick, University of Texas). https://farside.ph.utexas.edu/teaching/302l/lectures/node105.html
  - Quote: "The charge has risen to approximately 63 % of its final value ... By the time t=5, tau, the charge has risen to more than 99 % of its final value"
- **RL: the final value is never exactly reached, but 0.632 of the remainder is covered each time constant**
  - Source: 23.10 RL Circuits - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/23-10-rl-circuits
  - Quote: "A well-known property of the exponential is that the final value is never exactly reached, but 0.632 of the remainder to that value is achieved in every characteristic time"
- **A first-order ODE has a time constant; the response to a constant input reaches 63.2% in one time constant; electrical, mechanical, thermal and fluid systems with one energy store follow it**
  - Source: 1.2: First-Order ODE Models (Engineering LibreTexts). https://eng.libretexts.org/@api/deki/pages/24383/pdf/1.2%253A%2bFirst-Order%2bODE%2bModels.pdf
  - Quote: "Electrical, mechanical, thermal, and fluid systems that contain a single energy storage element are described by first- order ODE models. ... denotes the time when the system response to a constant input rises to 63.2% of its final value"
- **Two readings of the time constant: the 1/e time, and the time to finish at the starting rate**
  - Source: 2.4: Analogies - Engineering LibreTexts. https://eng.libretexts.org/Bookshelves/Industrial_and_Systems_Engineering/The_Art_of_Insight_in_Science_and_Engineering_(Mahajan)/01:_Part_I-_Organizing_Complexity/02:_Abstraction/2.04:_Analogies
  - Quote: "After one time constant ... the capacitor voltage falls by a factor of ... if the capacitor voltage had decayed at its initial rate ... it would have reached zero voltage after one time constant"
- **A lab pre-lab question: why is the time constant not the time to fully charge**
  - Source: The RC Circuit (UNC Department of Physics and Astronomy lab). https://physics.unc.edu/wp-content/uploads/sites/218/2012/10/RC-Circuit.pdf
  - Quote: "Why isn’t the time constant defined to be the time it takes the capacitor to become fully charged or discharged?"
- **RL: the current rises 0.632 of the remainder each time constant, and falls to 0.368 of the last value each time constant when switched off (a coil, as an electrician meets it)**
  - Source: RL Circuits | Physics II. https://courses.lumenlearning.com/atd-austincc-physics2/chapter/23-10-rl-circuits
  - Quote: "In the first time constant τ, the current rises from zero to 0.632 I ₀, and 0.632 of the remainder in every subsequent time interval ... In each successive time τ, the current falls to 0.368 of the preceding value"

### 4.5 First-order linear equations with an input: integrating factor, or steady state plus a dying transient
- **HELM solves the same cooling equation both ways: separation, then the integrating factor**
  - Source: HELM Workbook 19: Differential Equations (Loughborough University, 2008). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2019%20Differential%20Equations.pdf
  - Quote: "We could have solved ... by the integrating factor method, which you are now asked to do."
- **HELM on the integrating factor and the standard form**
  - Source: HELM Workbook 19, Section 19.2 First Order Differential Equations (copy at Newcastle University). https://www.mas.ncl.ac.uk/ask/numeracy-maths-statistics/images/First_order_odes.pdf
  - Quote: "The function by which we multiplied the given differential equation in order to make it exact is called an integrating factor ... Write the differential equation in standard form i.e. with the coefficient of the derivative equal to 1."
- **HELM: an RC circuit's steady-state solution with a sine input matches the impedance method (Dan's AC circuits)**
  - Source: HELM Workbook 19, Section 19.2 First Order Differential Equations (copy at Newcastle University). https://www.mas.ncl.ac.uk/ask/numeracy-maths-statistics/images/First_order_odes.pdf
  - Quote: "We have shown that for an RC circuit finding the steady state solution of the differential equation with a single frequency input voltage yields the same result for"
- **A forced oscillator's answer is a transient that depends on the start plus a steady state that depends only on the drive**
  - Source: 15.4: Damped and Driven Oscillations - Physics LibreTexts. https://phys.libretexts.org/Bookshelves/University_Physics/Physics_(Boundless)/15%3A_Waves_and_Vibrations/15.4%3A_Damped_and_Driven_Oscillations
  - Quote: "The general solution is a sum of a transient solution that depends on initial conditions, and a steady state that is independent of initial conditions and depends only on the driving amplitude"

My reading: HELM solves the same cooling equation two ways, separation and the integrating factor. For Dan the
steady-state-plus-transient route is the one that links to his AC circuits course: the sine-input steady state in HELM matches
his impedance method. The integrating factor can be one screen, as SQA's EM4 lists it, not a drill.

### 4.6 Euler's method when no formula exists, and why the step size matters
- **Sometimes no formula exists, and a numerical solution must be sought**
  - Source: Differential Equations for Engineers, lecture notes (J. Chasnov, HKUST). https://www.math.hkust.edu.hk/~machas/differential-equations-for-engineers.pdf
  - Quote: "Sometimes there is no analytical solution to a first-order differential equation and a nu- merical solution must be sought."
- **Euler's method: step size and error**
  - Source: Euler's Method (First Order Runge-Kutta). https://lpsa.swarthmore.edu/NumInt/NumIntFirst.html
  - Quote: "Obviously a smaller h would result in a better approximation, and a larger h in a worse approximation. ... Note that larger values of h result in poorer approximations (including bad oscillations with h=0.8"
- **A naval teaching paper solves a second-order submarine equation with the Euler-Cromer step**
  - Source: How Quickly Can a Submarine Dive? (C. Mungan, US Naval Academy). https://www.usna.edu/Users/physics/mungan/_files/documents/Publications/TPE2.pdf
  - Quote: "the resulting second-order equation is solved using the Euler–Cromer algorithm."

### 4.7 Second-order equations with constant coefficients: spring and series RLC, the characteristic equation and its roots
- **RLC circuit is the electrical analog of the damped spring-mass; the three cases mirror the spring cases**
  - Source: 6.3: The RLC Circuit - Mathematics LibreTexts. https://math.libretexts.org/Bookshelves/Differential_Equations/Elementary_Differential_Equations_with_Boundary_Value_Problems_(Trench)/06%3A_Applications_of_Linear_Second_Order_Equations/6.03%3A_The_RLC_Circuit
  - Quote: "As we’ll see, the (RLC) circuit is an electrical analog of a spring-mass system with damping."
- **The three damping cases of the circuit mirror the spring cases**
  - Source: 6.3: The RLC Circuit - Mathematics LibreTexts. https://math.libretexts.org/Bookshelves/Differential_Equations/Elementary_Differential_Equations_with_Boundary_Value_Problems_(Trench)/06%3A_Applications_of_Linear_Second_Order_Equations/6.03%3A_The_RLC_Circuit
  - Quote: "There are three cases to consider, all analogous to the cases considered in Section 6.2 for free vibrations of a damped spring-mass system."
- **Mass is the inductor, spring is the inverse capacitance**
  - Source: P301 E5. https://courses.physics.illinois.edu/phys401/fa2018/Files/RLC/E5_TransientsInRLC_20120125_v2.pdf
  - Quote: "the mass behaves the same as an inductor, and the spring the same as an inverse capacitance."
- **An exact analogy, term for term (B with R, k with 1/C)**
  - Source: R-L-C Circuits and Resonant Circuits (Ohio State University lecture). https://www.asc.ohio-state.edu/gan.1/teaching/summer04/Lec4.pdf
  - Quote: "There is an exact analogy between an RLC circuit and a harmonic oscillator"
- **HELM: the characteristic ('auxiliary') equation and what complex or equal roots give**
  - Source: HELM Workbook 19: Differential Equations (Loughborough University, 2008). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2019%20Differential%20Equations.pdf
  - Quote: "the roots will be real and distinct. ... If the auxiliary equation has complex roots, α + β i and α − β i, then the complementary function is ... If the auxiliary equation has two equal roots, k, the complementary function is"
- **What overdamped, underdamped and critically damped look like, in a naval architecture course**
  - Source: EN455 Course Notes, Chapter 4: The System: Ship Dynamics (US Naval Academy). https://www.usna.edu/NAOE/_files/documents/Courses/EN455/EN455_Course_Notes_Chapter_4_revisedAY21.pdf
  - Quote: "If the system is over-damped the response will look like an exponential decay back to equilibrium. If the system is under-damped the position will be a decaying oscillation where the amplitudes of oscillation get smaller and smaller until equilibrium is finally reached. And if the system is critically damped the position returns to equilibrium in the shortest amount of time with one or no oscillations."
- **Damping factor above, below and at one**
  - Source: EN455 Course Notes, Chapter 4: The System: Ship Dynamics (US Naval Academy). https://www.usna.edu/NAOE/_files/documents/Courses/EN455/EN455_Course_Notes_Chapter_4_revisedAY21.pdf
  - Quote: "Damping Factor - the amount of damping in the system (> 1 for over-damped, < 1 for under-damped, and = 1 for critically damped)"
- **HELM: no damping gives simple harmonic motion, 'expect it to continue for ever'**
  - Source: HELM Workbook 19: Differential Equations (Loughborough University, 2008). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2019%20Differential%20Equations.pdf
  - Quote: "If k = 0 then there is no damping. We expect, in this case, that once motion has started it will continue for ever."

My reading: the two systems are the same equation with different names for the terms (mass with inductance, damping with
resistance, spring stiffness with the inverse of capacitance). The characteristic equation is a quadratic, so Dan's
Quadratics course gives the formula and the discriminant, and his Complex numbers course gives the complex roots. The three
cases are the three signs of the discriminant: overdamped (two real roots), critically damped (one repeated root),
underdamped (complex roots, which ring). Complex numbers gives the exponential form re^{jθ} one line and leaves e^{jωt}
for this course (its brief says so).

### 4.8 A forced oscillation and resonance, in outline
- **Resonance: maximum amplitude when forcing frequency equals natural frequency**
  - Source: EN200 NAVAL ENGINEERING I. https://usna.edu/NAOE/_files/documents/Courses/EN400/02.08%20Chapter%208.pdf
  - Quote: "a SHM system will experience maximum amplitude oscillations when the frequency of the forcing function is equal to the natural frequency of the system."
- **Resonance only appears in underdamped systems**
  - Source: 15.4: Damped and Driven Oscillations - Physics LibreTexts. https://phys.libretexts.org/Bookshelves/University_Physics/Physics_(Boundless)/15%3A_Waves_and_Vibrations/15.4%3A_Damped_and_Driven_Oscillations
  - Quote: "The resonance effect occurs only in the underdamped systems."
- **A forced ship equation: transient first, then a steady response at the forcing frequency**
  - Source: EN455 Course Notes, Chapter 4: The System: Ship Dynamics (US Naval Academy). https://www.usna.edu/NAOE/_files/documents/Courses/EN455/EN455_Course_Notes_Chapter_4_revisedAY21.pdf
  - Quote: "The solution to this equation will be a system that has a transient oscillation until the damp- ing has eliminated the ship’s natural buoyant/damping response to the initial displacement and then an equilibrium solution that will have the same frequency as the excitation force."
- **A ship's roll is lightly damped, so resonance can capsize it**
  - Source: EN455 Course Notes, Chapter 4: The System: Ship Dynamics (US Naval Academy). https://www.usna.edu/NAOE/_files/documents/Courses/EN455/EN455_Course_Notes_Chapter_4_revisedAY21.pdf
  - Quote: "Because of the limited hydrodynamic damping available in roll (rolling causes only small waves, as opposed to the waves generated from ship heave or pitch), motions are generally large in roll and can be devastating (cause capsize, for example) if the encountered excitation wave frequency is too close to the ship’s natural frequency in roll."
- **Class society definition of synchronous rolling**
  - Source: Introduction of “Guidelines on Preventive Measures against Parametric Rolling”. https://www.classnk.or.jp/hp/pdf/research/rd/2023/07_e03.pdf
  - Quote: "Synchronous rolling is a resonance phenomenon that occurs when the ship’s natural roll period coincides with the wave encounter period, and its amplitude is increased due to forced oscillation of waves."

### 4.9 Reading a model: what each term means, units, and substituting back
- **Check a time constant by units: ohm times farad is a second**
  - Source: RC Circuits (Michigan State University, Physics 232). https://web.pa.msu.edu/courses/2000fall/phy232/lectures/rccircuits/rc.html
  - Quote: "has the dimensions of time: (1 Ohm) x (1 Farad) = (1 second)"
- **MIT's aim for differential equations: model, solve, interpret**
  - Source: Syllabus | Differential Equations | Mathematics | MIT OpenCourseWare. https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/pages/syllabus/syllabus
  - Quote: "Scientists and engineers must know how to model the world in terms of differential equations, and how to solve those equations and interpret the solutions."
- **Checking a solution is a skill of its own in Khan's unit**
  - Source: Differential equations | Calculus 1 | Math | Khan Academy. https://en.khanacademy.org/math/calculus-1/cs1-differential-equations
  - Quote: "Verify solutions to differential equations"

My reading: three habits. Name each term (the rate, the thing that pushes it, the thing that resists). Check units (every
term of the equation has the same unit; the product of ohms and farads is seconds). Substitute a proposed answer back into
the equation, and look at its start and end values.

### 4.10 Examples from electrical and mechanical engineering
- **A motor's speed run-up is an exponential with a mechanical time constant**
  - Source: maxon motor: how a DC motor speeds up (mechanical time constant). https://www.maxongroup.com/medias/sys_master/8798985748510.pdf
  - Quote: "The speed as a function of time (top right) shows an exponential behavior which is best characterized by the mechanical time constant"
- **Motor speed is analogous to voltage and torque to current**
  - Source: U-120 A Simplified Approach to DC Motor Modeling for Dynamic Stability Analysis (Texas Instruments). https://www.ti.com/lit/an/slua076/slua076.pdf?ts=1787093751260
  - Quote: "equations (2) and (4) give us a clear hint that the angular velocity (ωM) is analogous to voltage, while the torque (TM) is analogous to current."
- **Mixing tank: a worked first order case**
  - Source: 18.03SCF11 text: Examples of Constant Coefficient First order Equations. https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/405eab6315cacca040f25ed7293af29f_MIT18_03SCF11_s8_2text.pdf
  - Quote: "Mixing Tanks. A tank containing a volume V of salt solution has solution entering the tank at rate ... We have seen a number of physical systems that are modeled by first order constant coefficient linear ODE"
- **Draining a tank is a standard engineering estimate**
  - Source: Torricelli’s law revisited. https://www.math.uwaterloo.ca/~sdalessi/EJP-2021Torricelli.pdf
  - Quote: "Estimating the time to drain a tank, pond or reservoir is an important problem in engineering and the applied sciences."

Deferred, and where it goes: Laplace transforms (HELM Workbook 20; SQA EM5; Khan unit 3; Brilliant's Differential Equations
II) and systems of equations (Matrices and Linear algebra: Brilliant's linear-systems section, the matrix exponential,
eigenvalue methods) and partial differential equations (Vector calculus). Also left out: exact and homogeneous equations,
logistic growth, undetermined coefficients, series solutions.

---

## 5. Prerequisites: what this leans on, and what Dan already has

What other courses and examiners say a differential equations student must already have:

- **SQA Engineering Mathematics 4: recommended entry is calculus**
  - Source: SQA Higher National Unit H7K3 35, Engineering Mathematics 4 (SCQF level 8). https://www.sqa.org.uk/sqa/files/hn/H7K335.pdf
  - Quote: "it would be advantageous if learners had a good knowledge and understanding of differential and integral calculus together with sound numerical and algebraic skills."
- **Engineering students' first difficulty is missing algebra and calculus**
  - Source: Understanding of differential equations in a highly heterogeneous student group (SEFI 2022). https://www.researchgate.net/publication/368537265_Understanding_of_differential_equations_in_a_highly_heterogeneous_student_group
  - Quote: "substantial lack of basic knowledge from algebra and calculus"
- **SQA on the prior knowledge that sinks solutions: algebra, logs and indices**
  - Source: SQA Advanced Higher Mathematics course report 2024. https://www.sqa.org.uk/files_ccc/2024-ah-course%20report-mathematics.pdf
  - Quote: "Teachers and lecturers should be aware of the continuing need to reinforce prior knowledge, including basic algebra, trigonometric exact values, and the laws of logarithms and indices."

What Dan has, from his built courses (from the repo's briefs; my reading, not quotes):
- **Calculus fundamentals:** average and instant rate; the derivative as a function; the power rule; integration as the
  reverse, with + c found from a starting value; a capacitor's i = C dv/dt and an inductor's v = L di/dt; the second
  derivative. Its brief left Newton's law of cooling for this course, and showed the charging curve only as a picture.
- **Exponentials and logarithms:** growth by multiplying; e and e^x; the slope of e^x equals its height (a one-screen
  preview); the time constant, 63%, 5T and Newton's cooling shape; solving e^(-t/RC) by ln; shifted exponentials (Functions
  and their graphs).
- **Quadratics and polynomials:** the formula and the discriminant, stopping at no real roots (it points to Complex numbers).
- **Complex numbers:** j, the quadratic with complex roots, polar form (r at an angle). It left the exponential form
  re^{jθ} for this course.
- **Trigonometry:** radians, sine and cosine waves. **AC circuits:** phasors, reactance, three-phase, star and delta (series
  resonance not confirmed in what I read). **Motors**, **Design and verification** (cable sizing), **Vectors** (not needed).
- **Solving equations, Linear equations, Functions and graphs:** rearranging, substituting, reading a graph.

What must be taught inline: what a differential equation is and what a solution is (check by substituting); a slope field;
separating the variables and integrating (with ln and the + c, with a start value); a rate proportional to the gap, and
therefore the exponential; the steady-state-plus-transient idea; Euler's step; guessing e^(rt) and getting the
characteristic equation; the three cases; ringing and damping; e^{jωt} (just enough Euler's formula); forced response and
resonance in outline. Linear algebra is not a prerequisite for this route.

---

## 6. Misconceptions and learning science, for each skill

### 6.1 What a differential equation and its solution are
- **Rasmussen's four obstacles (function dilemma, overgeneralising, informal notions, graphs)**
  - Source: Rasmussen, Reform in Differential Equations: A Case Study of Students' Understandings and Difficulties (AERA 1998, ERIC ED420508). https://files.eric.ed.gov/fulltext/ED420508.pdf
  - Quote: "the function dilemma, the tendency to overgeneralize, interference from informal or intuitive notions, and the complexity involved with graphical interpretations"
- **German engineering students: memorised procedures, and no sense of what a solution is**
  - Source: Understanding of differential equations in a highly heterogeneous student group (SEFI 2022). https://www.researchgate.net/publication/368537265_Understanding_of_differential_equations_in_a_highly_heterogeneous_student_group
  - Quote: "We found that the main difficulties students experience are connected to: substantial lack of prior knowledge, attempting (sometimes unsuccessfully) to apply memorized procedures, and a failure to understand both the difference between a DE and a function and what a solution to a DE is."
- **Students cannot see a solution as a normal function**
  - Source: Understanding of differential equations in a highly heterogeneous student group (SEFI 2022). https://www.researchgate.net/publication/368537265_Understanding_of_differential_equations_in_a_highly_heterogeneous_student_group
  - Quote: "Many students make a fundamental distinction between a solution of a DE and a function as they know them. Some students cannot imagine that the solution of a DE is represented in a diagram and looks like a"
- **Students think a DE is not needed if the thing can be drawn as a normal function (parabola, straight line)**
  - Source: Understanding of differential equations in a highly heterogeneous student group (SEFI 2022). https://www.researchgate.net/publication/368537265_Understanding_of_differential_equations_in_a_highly_heterogeneous_student_group
  - Quote: "For some students , however , DEs and functions are fundamentally different. If something can be described as or be graphically displayed as a function known to them (e.g. a parabola or straight line in a diagram) it is no longer associated with a DE . For instance, they think that there is “ no need ” for a DE if something can be described by a ”regular” function . S tudents said “With a parabola, the slope is not dependent on the function itself, so a normal parabola does not form a DE.”"
- **Dublin physics students: concepts are the bigger problem than procedure**
  - Source: Outcomes of a service teaching module on ODEs for physics students (Maynooth University). https://mural.maynoothuniversity.ie/id/eprint/18235/1/Outcomes%20of%20a%20service.pdf
  - Quote: "students’ mathematical ability in relation to procedural competence is an issue in their study of differential equations, but not as severe an issue as their conceptual understanding. ... Mathematical competence alone is insufficient if we expect our students to be able to recognize the need for differential equations in a physical context and to be able to set up, solve, and interpret the solutions of such equations."
- **The learning goals of the German worksheets: difference between a function and a DE, what the terms mean, setting a DE up from a problem, what a solution is**
  - Source: Understanding of differential equations in a highly heterogeneous student group (SEFI 2022). https://www.researchgate.net/publication/368537265_Understanding_of_differential_equations_in_a_highly_heterogeneous_student_group
  - Quote: "what the difference between a f unction and a differential equation is , - what the terms and variables in a differential equation mean and do (mathematically) , - how to set up a differential equation from a given problem , and - what a solution to a differential equation is and how it differs from the DE."

### 6.2 Slope fields, steady states and graphs
- **Overgeneralising: equilibrium wherever the derivative is zero, even in non-autonomous equations**
  - Source: Rasmussen, Reform in Differential Equations: A Case Study of Students' Understandings and Difficulties (AERA 1998, ERIC ED420508). https://files.eric.ed.gov/fulltext/ED420508.pdf
  - Quote: "Students tended to think that such equilibrium solutions existed whenever the derivative was zero, even for differential equations that were not autonomous."
- **Graphs read as literal pictures (a pendulum's angle against time)**
  - Source: Rasmussen, Reform in Differential Equations: A Case Study of Students' Understandings and Difficulties (AERA 1998, ERIC ED420508). https://files.eric.ed.gov/fulltext/ED420508.pdf
  - Quote: "A common obstacle when dealing with graphs is the tendency to interpret a graph as a literal picture of the situation being modeled"
- **A graphical technique learned as an isolated skill**
  - Source: Rasmussen, Reform in Differential Equations: A Case Study of Students' Understandings and Difficulties (AERA 1998, ERIC ED420508). https://files.eric.ed.gov/fulltext/ED420508.pdf
  - Quote: "What seems to have happened is that students proceduralized this graphical technique"

### 6.3 Separating, integrating, the constant and the starting value
- **SQA Higher 2023: + c forgotten when integrating a differential equation**
  - Source: SQA Higher Mathematics 2023 course report. https://www.sqa.org.uk/files_ccc/2023-h-course-report-mathematics.pdf
  - Quote: "a few candidates did not include the ‘ + c ’ when they integrated."
- **Edexcel Further Maths 2024: the constant is there but the initial condition is not used**
  - Source: Pearson Edexcel A Level Further Mathematics 9FM0 Paper 01, Principal Examiner Feedback, Summer 2024. https://qualifications.pearson.com/content/dam/pdf/A-Level/Mathematics/2017/Exam-materials/9fm0-01-pef-20240815.pdf
  - Quote: "The most common error in this part was to integrate correctly on both sides, including a constant but then ... failing to use the initial conditions"
- **Edexcel 2019: constant omitted, and wrong values used to find it**
  - Source: Pearson Edexcel AS Further Mathematics Core Pure 1 (9FM0/01), Principal Examiner Feedback, Summer 2019. https://qualifications.pearson.com/content/dam/pdf/A-Level/Mathematics/2017/Exam-materials/9FM0_01_pef_20190815.pdf
  - Quote: "A small number of candidates omitted the constant of integration and lost the subsequent marks. ... Common errors when attempting to find the constant of integration are"
- **AQA 2019: separating the variables correctly**
  - Source: AQA A-level Mathematics 7357/2 Report on the Examination, June 2019. https://filestore.aqa.org.uk/sample-papers-and-mark-schemes/2019/june/AQA-73572-WRE-JUN19.PDF
  - Quote: "number of students did not realise how to separate the variables correctly"
- **SQA Advanced Higher 2024: separation and the constant of integration**
  - Source: SQA Advanced Higher Mathematics course report 2024. https://www.sqa.org.uk/files_ccc/2024-ah-course%20report-mathematics.pdf
  - Quote: "Many candidates did not correctly separate variables or integrate to give a negative logarithmic term. ... The constant of integration must be present in questions that require its evaluation or subsequent manipulation"
- **SQA Advanced Higher 2024: routines for the integrating factor**
  - Source: SQA Advanced Higher Mathematics course report 2024. https://www.sqa.org.uk/files_ccc/2024-ah-course%20report-mathematics.pdf
  - Quote: "Established routines are particularly useful when solving a differential equation using an integrating factor"

### 6.4 The rate (a change of amount against a rate of change), checking a solution, rearranging
- **A German study of engineering students: the derivative in a differential equation read as a change of amount, not a rate of change; context-rich problems helped (page snippet of a related paper, SECONDARY)** (SECONDARY)
  - Source: Understanding of differential equations in a highly heterogeneous student group (SEFI 2022). https://www.researchgate.net/publication/368537265_Understanding_of_differential_equations_in_a_highly_heterogeneous_student_group
  - Quote: "The experimental group is offered context-rich problems in which the construction of a differential equation and the interpretation of its solution in the given context is emphasized, while the control group is offered problems that mostly lack context and focus on procedural knowledge and skills only. ... this approach seems to be effective in eliminating the misconception concerning the interpretation of the derivative in a differential equation as a change of amount instead of a rate of change."
- **Checking a solution by substitution is a difficulty of its own, and rearranging is another**
  - Source: Understanding of differential equations in a highly heterogeneous student group (SEFI 2022). https://www.researchgate.net/publication/368537265_Understanding_of_differential_equations_in_a_highly_heterogeneous_student_group
  - Quote: "Some s tudents make serious mistakes when rearranging equations. ... Difficulty verify ing that a given (or found) algebraic function is a solution to a DE."

### 6.5 The time constant and exponential decay
- **Physics-education advice for RC and LR circuits: ideas before the differential equation**
  - Source: A gentle introduction to RC and LR circuits (C. Mungan, Latin-American Journal of Physics Education, 2021). https://www.researchgate.net/publication/357536245_A_gentle_introduction_to_RC_and_LR_circuits_Latin-American_Journal_of_Physics_Education
  - Quote: "The conventional approach to such circuits is to begin with the differential equations describing them or, at minimum, to write down the exponential functions for the solutions of those equations. ... However, student understanding is improved by initially focusing on conceptual ideas and basic algebra to discuss their time-dependent behavior."
- **A lab pre-lab question: why is the time constant not the time to fully charge**
  - Source: The RC Circuit (UNC Department of Physics and Astronomy lab). https://physics.unc.edu/wp-content/uploads/sites/218/2012/10/RC-Circuit.pdf
  - Quote: "Why isn’t the time constant defined to be the time it takes the capacitor to become fully charged or discharged?"

### 6.6 Euler's method
- **Euler's method: students think an approximate solution just follows the exact one**
  - Source: Rasmussen, Reform in Differential Equations: A Case Study of Students' Understandings and Difficulties (AERA 1998, ERIC ED420508). https://files.eric.ed.gov/fulltext/ED420508.pdf
  - Quote: "conceivably have an overgeneralized notion that approximate solutions always just follow the exact solutions."

### 6.7 Damped oscillation
- **Damping myth: students believe any friction gives exponential decay**
  - Source: Exponential Versus Linear Amplitude Decay in Damped Oscillators. http://materias.df.uba.ar/f1qa2020v/files/2020/02/PTE000485.pdf
  - Quote: "some students are led to believe that in the absence of driving forces the motion of a harmonic oscillator in the presence of any friction will decay exponentially in time."

My reading for the brief: (1) put the meaning first: a differential equation is a rule for the rate, and its solution is a
function, so every screen shows the solution as a curve on a graph and lets Dan check it against the rule. (2) Make steady
states visible as flat solutions. (3) Make Euler's picture show the slope being taken at the start of each step, with the
exact curve drawn faintly, so the approximate path is not drawn as following the exact one. (4) Put the constant and the
starting value in a worked example in every lesson. (5) Teach the RC and RL curves from the idea first, then the formula
(the physics-education advice). (6) Learning order: predict the curve, play, then name the rule. Bitesize's named mistakes
for this topic and NCTM: **UNCONFIRMED** (none found).

---

## 7. Where it is used by an electrician going into marine engineering

Electrical (what Dan already works with):
- **HELM Workbook 19 is written round electrical and mechanical examples**
  - Source: HELM Workbook 19: Differential Equations (Loughborough University, 2008). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2019%20Differential%20Equations.pdf
  - Quote: "Another application of first-order differential equations arises in the modelling of electrical circuits."
- **Motor speed is analogous to voltage and torque to current**
  - Source: U-120 A Simplified Approach to DC Motor Modeling for Dynamic Stability Analysis (Texas Instruments). https://www.ti.com/lit/an/slua076/slua076.pdf?ts=1787093751260
  - Quote: "equations (2) and (4) give us a clear hint that the angular velocity (ωM) is analogous to voltage, while the torque (TM) is analogous to current."
- **Motor run-up: the dynamic torque J dw/dt is present only during transients** (SECONDARY)
  - Source: Torque Equation of Motor Load System (eeeguide). https://www.eeeguide.com/torque-equation-of-motor-load-system
  - Quote: "is called the dynamic torque because it is present only during the transient operations."
- **Naval shipboard cables: temperature rises exponentially to a steady state set by the current (ONR-funded)**
  - Source: Digital Twin Model for Predicting the Thermal Profile of Power Cables for Naval Shipboard Power Systems (Sado et al., ESTS 2023, ONR-funded). https://research.cec.sc.edu/files/booth/files/2023_ESTS_C33_0543-710-23_Slides_Digital%20Twin%20Model%20for%20Predicting%20the%20Thermal%20Profile.pdf
  - Quote: "Naval ships rely on cabling from ... As power cables heat up ... carrying capacity decreases due to increased conductor resistance. ... Characterized the exponential thermal changes in the cable."

Motors, ships and submarines:
- **A motor's speed run-up is an exponential with a mechanical time constant**
  - Source: maxon motor: how a DC motor speeds up (mechanical time constant). https://www.maxongroup.com/medias/sys_master/8798985748510.pdf
  - Quote: "The speed as a function of time (top right) shows an exponential behavior which is best characterized by the mechanical time constant"
- **Ship steering: the first-order Nomoto model, with a gain K and a time constant T**
  - Source: An advanced model autopilot control system (National Research Council Canada). https://nrc-publications.canada.ca/fra/voir/td?id=b9d45f26-f67e-42fc-b367-ef85776e9836
  - Quote: "The first-order Nomoto steering model relates the rudder angle to the heading angle, characterizing the steering of a vessel with two parameters, K and T, that vary as a function of forward speed."
- **A submarine simulator models hydroplane and rotor response as first-order systems with a time constant**
  - Source: Simulation and Control of Submarines (Lund University). https://lup.lub.lu.se/luur/download?fileOId=4646331&func=downloadFile&recordOId=4646251
  - Quote: "the positioning of the hydroplanes is approximated by a simple first order system where it is possible for the user to specify a time constant for each control surface."
- **Ship roll with damping and restoring moment is a second-order equation (nonlinear at large angles; linear for small ones, as in the Navy course notes)**
  - Source: Estimation of Rolling Motion of Ship in Random Beam Seas by Efficient Analytical and Numerical Approaches | Journal of Marine Science and Application | Springer Nature Link. https://link.springer.com/article/10.1007/s11804-020-00183-x
  - Quote: "roll motion of ships with nonlinear damping and restoring moments for all times is modeled by a second-order nonlinear differential equation."
- **Roll decay of a ship model is an exponentially decaying cosine, the underdamped second-order solution**
  - Source: 100-Year Analysis of Roll Decay for Surface-Ship Models | J. Verif. Valid. Uncert. | ASME Digital Collection. https://asmedigitalcollection.asme.org/verification/article/10/1/011001/1212613/100-Year-Analysis-of-Roll-Decay-for-Surface-Ship
  - Quote: "a curve fit of exponentially decaying cosine function"
- **Ship roll damping and metacentric height set the roll's natural frequency**
  - Source: EN455 Course Notes, Chapter 4: The System: Ship Dynamics (US Naval Academy). https://www.usna.edu/NAOE/_files/documents/Courses/EN455/EN455_Course_Notes_Chapter_4_revisedAY21.pdf
  - Quote: "The roll damping increases with forward speed. The increase in damping results in a smaller maximum resonant peak, but also a slight reduction in the frequency at which the peak response will occur."
- **Submarine diving: two coupled equations; about two minutes after the ballast tanks are opened**
  - Source: How Quickly Can a Submarine Dive? (C. Mungan, US Naval Academy). https://www.usna.edu/Users/physics/mungan/_files/documents/Publications/TPE2.pdf
  - Quote: "A two-equation model is developed to describe the descent of a submarine as it floods its ballast tanks. The flow into the tanks is assumed to be inviscid, and the drag on the vertical sinking motion of the craft is neglected. ... Typical values for a submarine imply a dive time of about two minutes after the top flaps are opened to flood the ballast tanks."
- **A naval teaching paper solves a second-order submarine equation with the Euler-Cromer step**
  - Source: How Quickly Can a Submarine Dive? (C. Mungan, US Naval Academy). https://www.usna.edu/Users/physics/mungan/_files/documents/Publications/TPE2.pdf
  - Quote: "the resulting second-order equation is solved using the Euler–Cromer algorithm."

Nuclear propulsion (the DOE handbook is the standard public text; the Naval Nuclear Power Training Command hosts a copy):
- **Nuclear plant: reactor period is the time for power to change by a factor of e (DOE Fundamentals Handbook, the text on which US naval nuclear training pages are hosted)**
  - Source: DOE Fundamentals Handbook: Nuclear Physics and Reactor Theory, Volume 2 of 2 (DOE-HDBK-1019/2-93). http://large.stanford.edu/courses/2013/ph241/waisberg1/docs/h1019v2.pdf
  - Quote: "Reactor period is the time required for reactor power to change by a factor of e (2.718)."
- **Reactor physics: the period is the inverse of an exponential growth rate**
  - Source: Module 8: Low Power Reactor Dynamics (US NRC). https://www.nrc.gov/docs/ml1214/ml12142a098.pdf
  - Quote: "In reactor physics “period” is inverse rate of exponential growth"
- **Radioactive decay is the plainest dN/dt = -lambda N**
  - Source: Decay constant (Encyclopaedia Britannica). https://www.britannica.com/science/decay-constant
  - Quote: "then the rate of change is given by the equation d N / d t = −λ N, where λ is the decay constant. ... This shows that the population decays exponentially at a rate that depends on the decay constant."
- **The Naval Nuclear Power Training Command hosts the DOE handbook that defines the decay constant**
  - Source: DOE Fundamentals Handbook: Nuclear Physics and Reactor Theory, Volume 1 (copy hosted by the Naval Nuclear Power Training Command). https://www.navsea.navy.mil/Portals/103/Documents/NNPTC/Physics/doe_phys_nuc.pdf
  - Quote: "The radioactive decay constant () is the probability per unit time that an atom will decay."

My reading: the shared shape is a first-order lag (time constant) for coil current, motor speed, cable temperature, rudder
and hydroplane response, cooling and tank level; a second-order damped system for ship roll, a submarine's depth response and
the RLC circuit; and a growth or decay at a rate proportional to the size, for reactor period and radioactive decay. That is
three picture families, and the course teaches one rule for all of them. Whether the Navy's L3 marine engineering and
nuclear propulsion training uses these treatments: **UNCONFIRMED** (public, third-party sources only; no Navy syllabus read).

---

## 8. Size: lessons in the benchmarks, and a core that fits 7

How big the benchmarks are:
- Brilliant (gone): Differential Equations I, 30 lessons, 40 to 50 hours; its whole Calculus course is 42 lessons.
- Khan Academy: three units; unit 1 (first order) has eight groups of lessons; the AP calculus unit is eleven skills.
- HELM Workbook 19: four sections, 70 pages. Bird's Higher: six chapters (46 to 51). Bird's basic book: one chapter.
- SQA HN Engineering Mathematics 4: first-order differential equations are 12 of its 40 notional hours. A one-term
  engineers' course covers first order and then second order:

- **For scale: Brilliant's whole Calculus course is 42 lessons**
  - Source: Practice Calculus | Brilliant. https://brilliant.org/courses/calculus-nutshell/
  - Quote: "42 Lessons 353 Exercises"
- **A one-term engineers' course: first-order (separable, linear) then second-order (homogeneous and inhomogeneous)**
  - Source: Differential Equations for Engineers | Coursera. https://www.coursera.org/learn/differential-equations-engineers
  - Quote: "Separable and linear first-order differential equations, and their applications ... Homogeneous and inhomogeneous second-order differential equations, and their applications"

My reading, a core that fits 7 lessons for Dan (first order three-and-a-bit, second order three):
1. **A rule for change.** What a differential equation is; checking a solution by substituting; a slope field; a steady state.
2. **Rates that follow the gap.** Newton's cooling, RC discharge, RL; separate and integrate; the + c and a starting value;
   the time constant as the 1/e rule, and 63% and five time constants.
3. **A steady state plus a dying transient.** First-order with an input: charging, a motor reaching speed, a coil; the
   integrating factor in one screen, or the steady-state route; units and the shape.
4. **One small step at a time.** Euler's method, the step size, a tank filling or draining.
5. **The spring and the circuit are one equation.** Mass, damper, spring; series RLC; guess e^(rt); the characteristic equation.
6. **Overdamped, critically damped, underdamped.** The three kinds of roots; ringing; damping on a ship's roll and in a
   circuit.
7. **Push it, and read the model.** A forced oscillation; resonance in outline; reading a model's terms, units, and checking
   by substituting.

What goes if time is short: the integrating factor as a method, the numerical part of lesson 4 beyond one example, and
undetermined coefficients (forced response is shown, not solved by method). Laplace transforms, systems, and PDEs are
deferred.

Summary of what stayed UNCONFIRMED: Brilliant's own page (Wayback copy only); the 2024 wording of Pearson Unit 4002; an MCA
syllabus called Applied Mathematics; Bitesize and NCTM named mistakes for this topic; any Royal Navy marine engineering or
nuclear propulsion syllabus; the lesson pages inside any benchmark course.
