# Calculus fundamentals: research notes

Researched 13 Oct 2026 for the Calculus fundamentals course brief (the Maths shelf's Advanced maths folder; blurb
"Derivatives and integrals properly: rules, meaning and uses"; in `docs/shelves-maths.json` it has no `from` tag, and it
follows Limits and Derivatives (both "from Brilliant") and "Calculus in a nutshell" in that folder). The brief
itself is not written here; these notes are its evidence. Dan is an electrician preparing for marine engineering
college (HNC/HND route). He is jumping ahead: his built courses are Fractions, Negative numbers, Percentages,
Proportional reasoning, Solving equations, The coordinate plane, Geometry fundamentals and Linear equations. He has
NOT done functions, exponentials and logarithms, trigonometry or sequences, so section 4 says what calculus leans on.

Every finding has its source title, URL and the exact words, copied from a saved tool result by script (the quotes
were not retyped into this file). All of them are listed in `quotes.json` beside this file and were checked with
`node tools/eval/sources.mjs --quotes ... --tools ...` (`failed: 0`). The tool files are in `tools/`.
Findings I could not confirm are marked **UNCONFIRMED**; where only a non-original site said it, **SECONDARY**.
My own readings are marked "My reading" and are not quotes. Mirror and copy sites were avoided; the checker also
refuses web-archive copies, so the one set of findings that rests on a Wayback Machine copy (Brilliant's 2019
Calculus Fundamentals) is shown below as UNCONFIRMED and is not in `quotes.json`.

Two things to know about the tools. (1) The search and fetch connector returns a different slice of a page depending on
the query, and the checker only sees what fits in 12 KB (search) or 20 KB (fetch), so several pages were fetched twice
with narrower questions; the tool files hold both. (2) Brilliant's own help page changed between my two reads: the
15 Sep 2026 copy said Limits had 20 lessons and "3 of its 14 levels written", the 9 Oct 2026 copy says 27 lessons and
"4 of its 12 levels"; Exponential Functions went from 34 to 42 lessons and Trigonometric Functions from 62 to 70.
Both reads are in `tools/` (04 and 41). Brilliant is editing these courses now, so every Brilliant number below is a
snapshot of 9 to 13 Oct 2026.

---

## 1. Benchmark: Brilliant's Calculus Fundamentals

### 1.0 What I found, in short (my reading)
- **There is no longer a Brilliant course called Calculus Fundamentals.** Fetching
  `brilliant.org/courses/calculus-fundamentals/` returned the general Courses page, not a course (tool file 03).
  Brilliant's calculus now lives in three courses under Advanced Math: **Limits**, **Derivatives** and **Calculus**
  (section 1.6). "Calculus in a Nutshell" is the old name of that last one: its address is still
  `/courses/calculus-nutshell/` and its page still says so (1.1).
- **Whether Calculus Fundamentals was retired or folded in is UNCONFIRMED.** Brilliant says it renames, merges and
  retires courses and moves retired ones to an Archived section (1.6). The Calculus page still names "Calculus
  Fundamentals and Integral Calculus" as the next courses, which looks like stale wording. I could not see the
  Archived section.
- **The separate Limits and Derivatives courses are not retired.** They are the newest calculus courses, listed as
  New under Advanced Math, and both are only part written (Limits 4 of 12 levels, Derivatives 4 of 11; the rest are
  marked "Coming soon", including the power, product and chain rules).
- **Dan's shelf mirrors Brilliant's catalogue from before the rename.** The Advanced maths folder lists Limits,
  Derivatives, Calculus in a nutshell, Calculus fundamentals, Vectors, Matrices... in that order, and it sits after the
  Algebra folder's exponentials, logarithms, polynomials, sequences, trigonometry. Today's Brilliant Calculus
  is the shelf's "Calculus in a nutshell" under its new name, so "Calculus fundamentals" has no live Brilliant twin to
  copy and must be planned from the sources in sections 2 and 3.
- Brilliant's old Calculus Fundamentals (a 2019 copy only, 1.5) was limits first, then derivatives, with no integration:
  5 levels and 19 lessons, prerequisite Pre-Calculus, next step Integral Calculus. The Maths shelf's blurb for this
  course ("Derivatives and integrals properly: rules, meaning and uses") is therefore broader than Brilliant's old
  course and closer to today's Calculus plus the rules that Derivatives has not yet written.

### 1.1 Brilliant "Calculus" (the course formerly Calculus in a Nutshell): 42 lessons
- **Brilliant now has one big calculus course, called Calculus: 42 lessons, 353 exercises**
  - Source: Practice Calculus | Brilliant. https://brilliant.org/courses/calculus-nutshell/
  - Quote: "Investigate the central ideas of calculus and learn how to put them to use. 42 Lessons 353 Exercises"
- **The same page still carries the old name: Calculus in a Nutshell, 19 quizzes**
  - Source: Practice Calculus | Brilliant. https://brilliant.org/courses/calculus-nutshell/
  - Quote: "Calculus in a Nutshell is a short course with only 19 quizzes."
- **Calculus levels 1 to 4: what a derivative is, using it, the rules, integrals**
  - Source: Practice Calculus | Brilliant. https://brilliant.org/courses/calculus-nutshell/
  - Quote: "Level 1 What is a Derivative? Rate Of Change Tangents Maxima And Minima Critical Points Apply: Drop Testing Level Review ... Level 2 Using Derivatives Identifying Extremes Test Limitations Higher-Order Derivatives Apply: From Distance To Jerk Level Review ... Level 3 Finding Derivatives Constant Multiples Sums Products and Powers Chain Rule Quotients Apply: Optimization ... Level 4 Integrals The Area Problem The Integral The Fundamental Theorem Antiderivatives Apply: Falling objects"
- **Calculus levels 5 to 8: three dimensions, sequences and series, limits and continuity, advanced topics**
  - Source: Practice Calculus | Brilliant. https://brilliant.org/courses/calculus-nutshell/
  - Quote: "Level 5 Three Dimensions Volume With Integrals Surface Area via Integrals Apply: Gabriel ... Level 6 Sequences and Series Sequences and Limits Apply: Carbon Dating What is an Infinite Sum? Geometric Sums Harmonic Sum Apply: The Tower of Lire Quadratic Approximations Apply: The Spring Equation ... Level 7 Limits and Continuity Function Limits Limit Theorems Continuity Smooth Functions Intermediate Value Theorem Extreme Value Theorem ... Level 8 Advanced Topics Sine and Cosine The Exponential Function Taylor Series Geometric Series Revisited Apply: Normal Curves"
- **Calculus description: a bird's-eye view of limits, derivatives, integrals and infinite sums**
  - Source: Practice Calculus | Brilliant. https://brilliant.org/courses/calculus-nutshell/
  - Quote: "This course takes a bird's-eye view, using visual and physical intuition to present the major pillars of calculus: limits, derivatives, integrals, and infinite sums."
- **Calculus prerequisites: algebra and the basics of functions**
  - Source: Practice Calculus | Brilliant. https://brilliant.org/courses/calculus-nutshell/
  - Quote: "need an understanding of algebra and the basics of functions, such as domain and range, graphs, and intercepts."
- **The same page still names Calculus Fundamentals and Integral Calculus as the next courses (stale wording)**
  - Source: Practice Calculus | Brilliant. https://brilliant.org/courses/calculus-nutshell/
  - Quote: "Calculus Fundamentals and Integral Calculus are the two courses that can follow next"
My reading of the order: rate of change, tangents and maxima first (level 1), then using derivatives (2), then the
rules (3: constant multiples, sums, products and powers, chain rule, quotients), integrals (4: the area problem, the
integral, the Fundamental Theorem, antiderivatives, falling objects), then volumes, series, and limits and continuity
only at level 7. So Brilliant's big course teaches limits late and applications ("Drop Testing", "From Distance To
Jerk", "Optimization", "Falling objects") inside each level. Lesson titles only; I did not open a lesson, so the
pictures inside each are **UNCONFIRMED**.

### 1.2 Brilliant "Derivatives": 23 lessons, the slow route
- **Derivatives course: "start your calculus journey here", 23 lessons, 366 exercises**
  - Source: Practice Derivatives | Brilliant. https://brilliant.org/courses/derivatives/
  - Quote: "Start your calculus journey here by measuring how fast things change. 23 Lessons 366 Exercises"
- **Derivatives levels 1 to 4 (the written ones): average rate, signed change, instantaneous rate, the derivative as a limit**
  - Source: Practice Derivatives | Brilliant. https://brilliant.org/courses/derivatives/
  - Quote: "Level 1 Average Rate of Change Visualizing Change Constant Rate of Change Variable Rate of Change Average Rate of Change Secant Lines Average Change of Functions ... Level 2 Signed Change Net Change Negative Rate of Change Displacement Velocity Difference Quotients ... Level 3 Instantaneous Rate of Change Local Linearity The Tangent Line The Derivative at a Point The Limit Definition of Derivative Interpreting Limits as Derivatives ... Level 4 The Derivative as a Limit Computing Derivatives for f(x) = x² The Derivative Function of f(x) = x² Derivatives of Linear Functions The Derivative of f(x) = 2ᕽ Derivatives of Exponential Functions Derivative of the Square Root Function Linear Approximation"
- **Derivatives levels 5 to 11 (graphing the derivative, polynomial rules, product and chain rule, related rates, maxima) are marked "Coming soon"**
  - Source: Practice Derivatives | Brilliant. https://brilliant.org/courses/derivatives/
  - Quote: "Level 6 Derivatives of Polynomials Growing Squares (Coming soon) The Power Rule (Coming soon) ... Level 9 The Chain Rule Compression and Dilation (Coming soon) ... Level 10 Related Rates Growing Circles (Coming soon)"
- **Derivatives teaches the derivatives of squares, lines, exponentials and square roots from the definition, before any shortcut rule**
  - Source: Practice Derivatives | Brilliant. https://brilliant.org/courses/derivatives/
  - Quote: "You'll work out the derivatives of squares, lines, exponentials, and square roots from that definition, so the shortcut rules make sense when you meet them."
- **Derivatives prerequisites: reading graphs, f(x) notation, the slope of a straight line**
  - Source: Practice Derivatives | Brilliant. https://brilliant.org/courses/derivatives/
  - Quote: "Before you get started, you should be comfortable reading graphs, working with function notation like f(x), and finding the slope of a straight line. You don't need any prior experience with calculus, limits, or derivatives to begin"
My reading: this is the course closest to what Dan needs for the meaning of a derivative. It never uses a rule before
the idea: average rate (graphs and tables), then signed change and velocity, then zooming in ("Local Linearity"), then
the limit definition applied to x squared, straight lines, 2 to the x and the square root, then linear approximation.
Its stated prerequisites are reading graphs, f(x) notation and the slope of a straight line, and it says no calculus
or limits are needed first. The rules (power, sum, constant multiple, product, chain) and the applications (related
rates, maxima) are planned but not written.

### 1.3 Brilliant "Limits": 27 lessons, sequences first
- **Limits course: sequences first, then functions**
  - Source: Practice Limits | Brilliant. https://brilliant.org/courses/limits/
  - Quote: "Understand the limits of sequences and functions, and build the foundation for calculus. 27 Lessons 467 Exercises"
- **Limits levels 1, 3 and 5 (sequences on a number line, convergent sequences, then functions "Coming soon")**
  - Source: Practice Limits | Brilliant. https://brilliant.org/courses/limits/
  - Quote: "Level 1 Sequences on a Number Line Sequences The Index Recursive Sequences Increasing or Decreasing Bounded Decimal Expansions Approximating a Number ... Level 3 Convergent Sequences Hitting the Target The Limit Any Target Size Looping Toward the Target Comparing Powers Comparing Coefficients Limits on a Graph ... Level 5 Limits of Functions Vertical Asymptotes (Coming soon)"
- **Limits prerequisites**
  - Source: Practice Limits | Brilliant. https://brilliant.org/courses/limits/
  - Quote: "You should start the course with a foundation in algebra and the basics of functions, including graphing equations."
My reading: Brilliant builds the idea of a limit on sequences (hit a target band, then any target size) before
functions. Function limits, one-sided limits and continuity are "Coming soon" here and live in Calculus level 7 today.

### 1.4 Brilliant's own guide to its calculus courses
- **Brilliant teaches calculus across three courses, one complete and two still being built**
  - Source: Does Brilliant cover Calculus? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-calculus
  - Quote: "Brilliant teaches calculus across three courses. Calculus is the complete one: 42 lessons that run the whole subject, from the derivative through integrals, limits, continuity, and infinite series. ... are newer and much slower, and they are still being built — between them they cover sequences, convergence, and the derivative at a point in 50 lessons"
- **Limits and Derivatives are only partly built**
  - Source: Does Brilliant cover Calculus? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-calculus
  - Quote: "Limits has 4 of its 12 levels written and Derivatives 4 of 11"
- **Concepts deep, technique thin**
  - Source: Does Brilliant cover Calculus? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-calculus
  - Quote: "Coverage is deep on the concepts and thin on technique"
- **The differentiation rules are in Calculus level 3, not yet in Derivatives**
  - Source: Does Brilliant cover Calculus? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-calculus
  - Quote: "What it does not yet have is the differentiation rules. The power, product, and chain rules, related rates, and curve sketching are announced as coming levels but are not written."
- **Intended order from scratch: Limits, then Derivatives, then Calculus**
  - Source: Does Brilliant cover Calculus? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-calculus
  - Quote: "Starting from scratch and not in a hurry, Limits then Derivatives then Calculus is the intended order."
- **Calculus builds the definite integral as an accumulation and links it to differentiation through the Fundamental Theorem**
  - Source: Does Brilliant cover Calculus? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-calculus
  - Quote: "build the definite integral as an accumulation ... explains why differentiation and integration are inverses"
- **Integration technique and applied optimisation and related rates are left to a textbook**
  - Source: Does Brilliant cover Calculus? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-calculus
  - Quote: "Integration technique. Substitution, integration by parts, partial fractions, and improper integrals. Brilliant builds what an integral is, then stops short of how to evaluate hard ones. ... Apply: Optimization is one lesson, not a unit."
- **What Brilliant says a calculus student should have done first (trig, exponentials, logarithms, polynomials)**
  - Source: Does Brilliant cover Calculus? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-calculus
  - Quote: "Calculus assumes work these courses teach and a calculus class rarely reteaches. ... Exponential models, the groundwork for growth and decay problems ... Logarithms as the inverse of exponentiation, and the log laws ... Radians, the unit circle, and periodicity, assumed throughout"
- **If limits are hard because upstream algebra or radians are shaky, calculus practice will not fix it**
  - Source: Does Brilliant cover Calculus? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-calculus
  - Quote: "If limits are hard because rational functions, asymptotes, logarithms, or radians are still shaky, the problem is upstream and calculus practice will not fix it."
### 1.5 Brilliant's older Calculus Fundamentals (2019, Wayback copy only)
The live page is gone, so these are shown only as a record. The checker refuses a web-archive copy, so none of this is in
`quotes.json`; treat all of it as **UNCONFIRMED**.
- **UNCONFIRMED (a Wayback Machine copy, not the publisher's own page; not in quotes.json): Brilliant's older Calculus Fundamentals (2019 archive): limits, then derivatives, for the aspiring scientist or engineer**
  - Source: Practice Calculus Fundamentals | Brilliant. https://web.archive.org/web/2019/https://brilliant.org/courses/calculus-done-right/
  - Quote: "This course sets you on the path to calculus fluency. The first part provides a firm intuitive understanding of limits, the central idea underlying the entire subject. The second part applies limits to define derivatives, an indispensable tool for measuring change. By the end of the course you'll have practical calculus experience that any aspiring scientist, engineer, or mathematician needs."
- **UNCONFIRMED (a Wayback Machine copy, not the publisher's own page; not in quotes.json): Its five levels and 19 lessons (limits first, then derivatives, rules, applications)**
  - Source: Practice Calculus Fundamentals | Brilliant. https://web.archive.org/web/2019/https://brilliant.org/courses/calculus-done-right/
  - Quote: "Learn about the basics of limits! 1. Indeterminate Forms Examine the speed of motion from the perspective of calculus. 2. Limits Intuition Take your first step towards mastering limits. 3. Limits of Functions Learn the essentials of computing limits. 2. 2 Computing Limits Master the infinitesimal. 1. Included with Brilliant Premium Infinite Limits Discover how limits tame the infinite. 2. Included with Brilliant Premium Continuity When does a function's graph come in pieces? 3. Included with Brilliant Premium Computing Limits I Take limits of algebraic expressions. 4. Included with Brilliant Premium Computing Limits II Learn limit techniques to conquer derivatives. 3. 3 Derivatives Making quantitative sense of the moment when everything's changing. 1. Included with Brilliant Premium The Derivative at a Point Learn what derivatives can do for you. 2. Included with Brilliant Premium First Examples of Derivatives Gain hands-on experience with a few basic derivatives. 3. Included with Brilliant Premium What Derivatives Tell Us What's the point of taking a derivative, anyway? 4. Included with Brilliant Premium The Second Derivative Try taking a derivative's derivative, and explore what it can do for you. 4. 4 Computing Derivatives The practitioner's toolkit: the product rule, chain rule, and more. 1. Included with Brilliant Premium Polynomials Apply your calculus skills to find shortcuts for polynomial derivatives. 2. Included with Brilliant Premium Products, Reciprocals, and Quotients Find the derivatives of compound functions that are made by multiplying and dividing simpler pieces. 3. Included with Brilliant Premium Trigonometric Functions Step away from algebraic expressions and into the world of trigonometric derivatives. 4. Included with Brilliant Premium The Chain Rule Break a complicated derivative problem into a chain of simpler ones. 5. 5 Linear Approximation and Applications Linear approximation, implicit differentiation, L'Hôpital's Rule, and some physics! 1. Included with Brilliant Premium Linear Approximation Apply tangent lines to the classic root-finding problem. 2. Included with Brilliant Premium Pendulums: An Application Use rates of change to model the swing of a pendulum. 3. Included with Brilliant Premium Optimization Find extreme values with derivatives, one of the most important uses of calculus. 4. Included with Brilliant Premium Implicit Differentiation Compute rates of change of related quantities."
- **UNCONFIRMED (a Wayback Machine copy, not the publisher's own page; not in quotes.json): Its prerequisite was Pre-Calculus and the next step was Integral Calculus**
  - Source: Practice Calculus Fundamentals | Brilliant. https://web.archive.org/web/2019/https://brilliant.org/courses/calculus-done-right/
  - Quote: "Pre-Calculus Master the fundamentals of exponential, logarithmic, hyperbolic, and parametric equations. ... Integral Calculus Take the next step on the calculus journey with integrals and sums."
- **UNCONFIRMED (a Wayback Machine copy, not the publisher's own page; not in quotes.json): Brilliant's courses page in December 2019 (Wayback): Calculus Fundamentals, Integral Calculus, and Calculus in a Nutshell "Coming soon"**
  - Source: Courses | Brilliant. https://web.archive.org/web/20191211020422/https://brilliant.org/courses/
  - Quote: "Calculus Fundamentals Understand the mathematics of continuous change. Integral Calculus Take the next step on the calculus journey with integrals and sums. Calculus in a Nutshell Coming soon. Notify Me Advanced Mathematics"
My reading of the old lesson list, in order: Introduction (Indeterminate Forms, Limits Intuition, Limits of
Functions); Computing Limits (Infinite Limits, Continuity, Computing Limits I and II); Derivatives (The Derivative at a
Point, First Examples of Derivatives, What Derivatives Tell Us, The Second Derivative); Computing Derivatives
(Polynomials; Products, Reciprocals and Quotients; Trigonometric Functions; The Chain Rule); Linear Approximation and
Applications (Linear Approximation, Pendulums, Optimization, Implicit Differentiation). 3 + 4 + 4 + 4 + 4 = 19 lessons.

### 1.6 Where calculus sits in Brilliant's path
- **Where calculus sits in Brilliant's path (Advanced Algebra, then Advanced Math)**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "Study the functions and graphs of later high school courses like Algebra 2 ... Dive into key ideas in derivatives, integrals, vectors, and beyond"
- **Brilliant's own list of its calculus and advanced courses**
  - Source: What math does Brilliant cover? Courses, grade levels, and .... https://brilliant.org/help/courses-and-curriculum/what-math-does-brilliant-cover/
  - Quote: "Calculus and advanced math | Limits , Derivatives , Calculus , Vectors , and Matrices | Advanced high school, college, and adult learners"
- **Brilliant renames, merges and separates courses**
  - Source: Why is my course missing? | Brilliant. https://brilliant.org/help/help-and-support/why-is-my-course-missing
  - Quote: "The course was updated, renamed, or restructured ... Sometimes, this includes merging or separating existing courses"
- **Brilliant also retires courses to an Archived section**
  - Source: Why is my course missing? | Brilliant. https://brilliant.org/help/help-and-support/why-is-my-course-missing
  - Quote: "we occasionally retire courses that no longer meet our threshold for content or best practices. When this occurs, these courses are moved to the "Archived"
My reading: on the Courses page the order is Math Foundations (Fractions, Solving Equations, Negative Numbers,
Coordinate Plane, Percents, Proportional Reasoning), Algebra Fundamentals (Linear Equations, Coordinate Geometry,
Linear Relationships, Exponents and Radicals, Visual Algebra), Intermediate Algebra (Introduction to Functions, Linear
Systems, Quadratics, Coordinate Transformations, Exponential Functions), Advanced Algebra (Trigonometric Functions,
Polynomials, Equations and Curves, Logarithms, Polar Coordinate Plane, Complex Numbers), then Advanced Math (Limits,
Derivatives, Calculus, Vectors, Matrices) (tool files 02 and 03, the Courses page). So Brilliant puts functions,
exponentials, trigonometry and logarithms before calculus, and Dan's shelf follows the same order (his Advanced
maths folder comes after Algebra). Dan is skipping that stretch.

---

## 2. Other courses' order for the same ground

### 2.1 Khan Academy
- **Khan Academy AP Calculus AB: ten units, limits first, integration in unit 6**
  - Source: AP®︎ Calculus AB | College Calculus AB | Khan Academy. https://www.khanacademy.org/math/ap-calculus-ab
  - Quote: "10 units Unit 1 Limits and continuity Unit 2 Differentiation: definition and basic derivative rules Unit 3 Differentiation: composite, implicit, and inverse functions Unit 4 Contextual applications of differentiation Unit 5 Analytical applications of differentiation Unit 6 Integration and accumulation of change Unit 7 Differential equations Unit 8 Applications of integration"
- **Khan Academy Differential Calculus: six units**
  - Source: Differential Calculus | Khan Academy. https://www.khanacademy.org/math/differential-calculus
  - Quote: "Differential Calculus 6 units Unit 1 Limits and continuity Unit 2 Derivatives: definition and basic rules Unit 3 Derivatives: chain rule and other advanced topics Unit 4 Applications of derivatives Unit 5 Analyzing functions Unit 6 Parametric equations, polar coordinates, and vector-valued functions"
- **Khan Academy Calculus 1**
  - Source: Calculus 1 | Math | Khan Academy. https://us.khanacademy.org/math/calculus-1
  - Quote: "Calculus 1 8 units · 171 skills Unit 1 Limits and continuity Unit 2 Derivatives: definition and basic rules Unit 3 Derivatives: chain rule and other advanced topics"
- **Khan Academy Integral Calculus: integrals first, then differential equations**
  - Source: Integral Calculus | Khan Academy. https://www.khanacademy.org/math/integral-calculus
  - Quote: "A brief introduction to integral calculus · Unit 1: Integrals · Unit 2: Differential equations · Unit 3: Applications of integrals · Unit 4: Parametric equations,"
- **Khan Academy's first integral unit starts with accumulation of change and Riemann sums**
  - Source: Integral Calculus | Math - Khan Academy. https://www.khanacademy.org/math/integral-calculus/ic-integration
  - Quote: "Unit 1: Integrals · Accumulation of change · Left and right Riemann sums · Over- and under-estimation of Riemann sums · Midpoint & trapezoidal sums"
- **Khan Academy's "what to know before calculus": algebra, geometry, trigonometry, and fluency with functions**
  - Source: What to know before taking calculus (article) | Khan Academy. https://www.khanacademy.org/math/ap-calculus-ab/x2dd7feea:about-the-course/x2dd7feea:untitled-840/a/ap-calc-prerequisites?qa_expand_key=ag5zfmtoYW4tYWNhZGVteXJBCxIIVXNlckRhdGEiHmthaWRfMTkzNzIyMDY2ODYwMTIyNjM2MTcwMjUzNgwLEghGZWVkYmFjaxiAgIeE8LOKCww&qa_expand_type=reply
  - Quote: "In some sense, the prerequisite for Calculus is to have an overall comfort with algebra , geometry , and trigonometry . ... Calculus is all about functions, so it is helpful to be pretty fluent when it comes to thinking about functions, graphing functions, and using the appropriate terminology when talking about functions. ... Linear functions * Quadratic functions * Have at least a loose idea for what the graph of an ‍ degree polynomial might look like. * Exponentials * Logarithms ... Be comfortable with each of the basic trigonometry functions"
- **Khan Academy's separate "Get ready for AP Calculus" course**
  - Source: Get ready for AP® Calculus | Math | Khan Academy. https://www.khanacademy.org/math/get-ready-for-ap-calc
  - Quote: "9 units Unit 1 Get ready for limits and continuity Unit 2 Get ready for differentiation: definition and basic derivative rules Unit 3 Get ready for differentiation: composite, implicit, and inverse functions Unit 4 Get ready for contextual applications of differentiation Unit 5 Get ready for applying derivatives to analyze functions Unit 6 Get ready for integration and accumulation of change"
My reading: Khan puts limits first, then definition and basic rules, then chain/implicit/inverse, then contextual
applications, then analytical applications (curve analysis), and only then integration and accumulation (AB unit 6).
Integration is a whole separate second course in the college sequence. Khan also publishes a separate "Get ready for AP
Calculus" course, so even its calculus course assumes the algebra, functions and trigonometry are done.

### 2.2 MIT 18.01 Single Variable Calculus
- **MIT 18.01 (Jerison/Kleiman text) chapter order: velocity and rate of change first, integration from chapter 11**
  - Source: 18.01 - MIT Mathematics. https://math.mit.edu/~djk/18_01/contents.html
  - Quote: "Chapter 1 Velocity and Rate of Change Chapter 2 Limits. Continuity. Slope and Derivative Chapter 3 Differentiation Formulae ... Chapter 11 The Antiderivative or Indefinite Integral Chapter 12 Definite Integrals. Area. Riemann Sums Chapter 13 First Fundamental Theorem of Calculus Chapter 14 Second Fundamental Theorem of Calculus ... Chapter 19 Surface Area. Average Value"
- **MIT OCW 18.01SC prerequisites and the two basic concepts**
  - Source: Syllabus | Single Variable Calculus | Mathematics | MIT OpenCourseWare. https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/pages/syllabus/
  - Quote: "The prerequisites are high school algebra and trigonometry. ... Derivatives as rates of change, computed as a limit of ratios 2. Integrals as a “sum,” computed as a limit of Riemann sums"
- **MIT 18.01 Fall 2023 starts with the meaning of integrals, then derivatives, then the link**
  - Source: SYLLABUS, 18.01 FALL 2023 This is an outline of the topics we will study in the course. Part 1: Integrals. https://math.mit.edu/documents/18.01_syllabus.pdf
  - Quote: "Integrals: The meaning of integrals and setting up integrals. An integral describes a quantity as a sum of many small pieces. ... Derivatives: The idea of derivative and straight line approximation. ... The relationship between integrals and derivatives. Accumulation func- tions. Rates. The fundamental theorem of calculus."
My reading: the 18.01 textbook begins with velocity and rate of change, then limits and slope, then formulas, and reaches
antiderivatives, definite integrals and the Fundamental Theorem in chapters 11 to 14; "Average Value" is chapter 19.
MIT's Fall 2023 syllabus does it the other way round: the meaning of integrals first ("a sum of many small pieces"),
then derivatives as straight-line approximation, then the link. Its stated prerequisite is high school algebra and
trigonometry.

### 2.3 3Blue1Brown, Essence of Calculus
- **3Blue1Brown Essence of Calculus: the twelve chapters in order**
  - Source: Essence of calculus. https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr
  - Quote: "A free course offering the core concept of Calculus, with a visuals-first approach aimed at making you feel like you could have discovered the subject yourself."
- **3Blue1Brown Essence of Calculus: the twelve chapters in order**
  - Source: youtube.com. https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr
  - Quote: "The paradox of the derivative | Chapter 2, Essence of calculus 4.5M 9y ago 17:34 # Derivative formulas through geometry | Chapter 3, Essence of calculus 3.6M 9y ago 15:56 # Visualizing the chain rule and product rule | Chapter 4, Essence of calculus 2.3M 9y ago 13:50 # What's so special about Euler's number e? | Chapter 5, Essence of calculus 5.2M 9y ago 15:34 # Implicit differentiation, what's going on here? | Chapter 6, Essence of calculus 2.3M 9y ago ... # Limits, L'Hôpital's rule, and epsilon delta definitions | Chapter 7, Essence of calculus 2.6M 9y ago 20:46 # Integration and the fundamental theorem of calculus | Chapter 8, Essence of calculus 3.1M 9y ago 12:39 # What does area have to do with slope? | Chapter 9, Essence of calculus 1.6M 9y ago 5:39 # Higher order derivatives | Chapter 10, Essence of calculus 913K 9y ago 22:20 # Taylor series | Chapter 11, Essence of calculus 5.1M 9y ago 14:26 # The other way to visualize derivatives | Chapter 12, Essence of calculus"
- **3Blue1Brown's stated goal**
  - Source: The Essence of Calculus | 3Blue1Brown. https://www.3blue1brown.com/lessons/essence-of-calculus/
  - Quote: "My goal is for you to come away from this series feeling like you could have invented calculus."
- **3Blue1Brown on the derivative of a^x and e^x**
  - Source: 3Blue1Brown. https://www.3blue1brown.com/topics/calculus
  - Quote: "An introduction to what a derivative is, and how it formalizes an otherwise paradoxical idea. ... What is the derivative of a^x? Why is e^x its own derivative? This video shows how to think about the rule for differentiating exponential functions. ... Derivatives are about slope, and integration is about area."
My reading of the 12 chapters in order: 1 The essence of calculus (area of a circle); 2 The paradox of the derivative;
3 Derivative formulas through geometry; 4 Visualizing the chain rule and product rule; 5 What's so special about
Euler's number e; 6 Implicit differentiation; 7 Limits, L'Hopital's rule and epsilon delta; 8 Integration and the
fundamental theorem of calculus; 9 What does area have to do with slope; 10 Higher order derivatives; 11 Taylor series;
12 The other way to visualize derivatives. Derivative before limit, geometry before formula, integration after.

### 2.4 BBC Bitesize and SQA Higher Maths (the UK school route)
- **BBC Bitesize Higher Maths, Differentiation: the seven pages in order**
  - Source: Differentiating simple trigonometric expressions - Differentiation - Higher Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zyj77ty/revision/3
  - Quote: "Differentiation from first principles 2. Differentiating simple algebraic expressions 3. Differentiating simple trigonometric expressions 4. The chain rule 5. Equation of a tangent 6. Increasing and decreasing functions 7. Curve sketching"
- **Bitesize on what differentiation is for**
  - Source: Calculus skills - Higher Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/topics/zh92tfr
  - Quote: "Differentiation of algebraic and trigonometric expressions can be used for calculating rates of change, stationary points and their nature."
- **Bitesize on integration as the inverse, and where the + c comes from**
  - Source: Integrating simple algebraic expressions. https://www.bbc.co.uk/bitesize/guides/zgxttfr/revision/1
  - Quote: "Integration is the inverse of differentiation of algebraic and trigonometric expressions involving brackets and powers. ... The + c appears because when you differentiate a constant term, the answer is zero ... Remember, add one to the power and divide by the new power."
- **Bitesize: the derivative of sin x is cos x only in radians**
  - Source: Differentiating simple trigonometric expressions - Differentiation - Higher Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zyj77ty/revision/3
  - Quote: "Note: This only works when (x) is measured in radians"
- **Bitesize worked example: speed is found by differentiating distance**
  - Source: Rate of change - Applying differential calculus - Higher Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zwy334j/revision/3
  - Quote: "The speed is the rate of change between the distance and the time. Remember to calculate a rate of change, we differentiate."
- **SQA Higher Maths course specification: calculus skills**
  - Source: Higher Mathematics Course Specification. https://www.sqa.org.uk/files_ccc/h-course-spec-mathematics.pdf
  - Quote: "differentiating an algebraic function which is, or can be simplified to, an expression in powers of x"
- **SQA Higher Maths course specification: calculus skills**
  - Source: Higher Mathematics Course Specification. https://www.sqa.org.uk/files_ccc/h-course-spec-mathematics.pdf
  - Quote: "calculating definite integrals of functions with limits which are integers, radians, surds or fractions"
- **SQA Higher Maths course specification: calculus skills**
  - Source: Higher Mathematics Course Specification. https://www.sqa.org.uk/files_ccc/h-course-spec-mathematics.pdf
  - Quote: "determining the greatest and/or least values of a function on a closed interval"
- **SQA Higher Maths course specification: calculus skills**
  - Source: Higher Mathematics Course Specification. https://www.sqa.org.uk/files_ccc/h-course-spec-mathematics.pdf
  - Quote: "finding the area between a curve and the x -axis"
- **SQA Higher Maths course specification: calculus skills**
  - Source: Higher Mathematics Course Specification. https://www.sqa.org.uk/files_ccc/h-course-spec-mathematics.pdf
  - Quote: "determining and using a function from a given rate of change and initial conditions"
- **SQA Higher Mathematics 1 (old unit D321 12): basic differentiation**
  - Source: MATHEMATICS. https://www.sqa.org.uk/files/nu/D32112.pdf
  - Quote: "Use basic differentiation. Performance criteria a) Differentiate a function reducible to a sum of powers of x . b) Determine the gradient of a tangent to a curve by differentiation. c) Determine the coordinates of the stationary points on a curve and justify their nature using differentiation."
My reading: the Scottish Higher is the nearest thing to a "fundamentals" calculus in the UK. Differentiation is seven
short pages (first principles, algebraic, trigonometric, chain rule, equation of a tangent, increasing/decreasing,
curve sketching), then integration (inverse of differentiation, definite integrals, area, differential equations) and
the applications (optimisation, rate of change). Powers of x are the working function; sin and cos are added.

### 2.5 UK engineering texts: HELM (Loughborough) and Bird
- **HELM: 50 workbooks for the first two years of a UK engineering degree**
  - Source: Helping Engineers Learn Mathematics Workbooks (HELM) | Mathematics Learning Support Centre | Loughborough University. https://www.lboro.ac.uk/departments/mlsc/student-resources/helm-workbooks/
  - Quote: "There are 50 workbooks in total. They cover the basic engineering mathematics and statistics teaching for first and second year students in a typical UK undergraduate engineering course. ... contain examples of engineering applications of the mathematics and statistics"
- **HELM workbook order: functions, trigonometry and exponentials/logs before differentiation**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "2 Basic Functions ... 4 Trigonometry ... 5 Functions and Modelling ... 6 Exponential and Logarithmic Functions ... 11 Differentiation ... 12 Applications of Differentiation ... 13 Integration ... 14 Applications of Integration 1 ... 15 Applications of Integration 2 ... 16 Sequences and Series"
- **HELM Workbook 11 sections**
  - Source: HELM Workbook 49 Student's Guide - Loughborough University. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2049%20Student's%20Guide.pdf
  - Quote: "11.1 Introducing Differentiation 11.2 Using a Table of Derivatives 11.3 Higher Derivatives 11.4 Differentiating Products and Quotients 11.5 The Chain Rule 11.6 Parametric Differentiation 11.7 Implicit Differentiation"
- **HELM Workbooks 12, 13 and 14 sections (14.2 is the mean and RMS value)**
  - Source: HELM Workbook 49 Student's Guide - Loughborough University. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2049%20Student's%20Guide.pdf
  - Quote: "Workbook 12 - Applications of Differentiation (63 pages) 12.1 Tangents and Normals 12.2 Maxima and Minima 12.3 The Newton-Raphson Method 12.4 Curvature 12.5 Differentiation of Vectors 12.6 Case Study: Complex Impedance"
- **HELM Workbooks 12, 13 and 14 sections (14.2 is the mean and RMS value)**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2049%20Student's%20Guide.pdf
  - Quote: "Workbook 13 - Integration (62 pages) 13.1 Basic Concepts of Integration 13.2 Definite Integrals 13.3 The Area Bounded by a Curve 13.4 Integration by Parts 13.5 Integration by Substitution and Using Partial Fractions 13.6 Integration of Trigonometric Functions Workbook 14 - Applications of Integration 1 (34 pages) 14.1 Integration as the Limit of a Sum 14.2 The Mean Value and the Root-Mean-Square Value"
- **HELM Workbook 14 includes the mean value and RMS value**
  - Source: Help Engineers Learn Mathematics (HELM) workbooks | MASH | The University of Sheffield. https://sheffield.ac.uk/mash/maths-resources/helm
  - Quote: "13. Integration Basic Concepts of Integration Definite Integrals The area Bounded by a Curve Integration by Parts ... 14. Applications of Integration 1 Integration as the Limits of a Sum The Mean Value and Root-Mean-Square Value Volumes of Revolution"
- **HELM Workbook 11 learning outcomes**
  - Source: HELM workbook 11 - Differentiation. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2011%20Differentiation.pdf
  - Quote: "explain what is meant by the tangent to a curve ... explain what is meant by the gradient of a curve at a point ... calculate the derivative of a number of simple functions from first principles"
- **Bird's Basic Engineering Mathematics: powers, exponentials and trigonometry come before one chapter on differentiation and one on integration**
  - Source: Bird's Basic Engineering Mathematics - 8th Edition - John Bird - Routl. https://www.routledge.com/Birds-Basic-Engineering-Mathematics/Bird/p/book/9780367643676
  - Quote: "7. Powers, roots and laws of indices ... 16. Exponential functions ... 17. Straight line graphs ... 22. Introduction to trigonometry ... 29. Irregular areas and volumes and mean values ... 35. Introduction to differentiation 36. Standard integration 37. Number sequences"
- **Bird's Understanding Engineering Mathematics has chapters on areas under curves and on mean and RMS values**
  - Source: Understanding Engineering Mathematics | John Bird | Taylor & Francis e. https://www.taylorfrancis.com/books/mono/10.4324/9781315889764/understanding-engineering-mathematics-john-bird
  - Quote: "Areas under and between curves ... Mean and root mean square values"
My reading: in HELM the numbering says it all. Basic Functions (2), Trigonometry (4), Functions and Modelling (5),
Exponential and Logarithmic Functions (6) come before Differentiation (11), Applications of Differentiation (12),
Integration (13) and Applications of Integration 1 (14, which holds "The Mean Value and the Root-Mean-Square Value").
Bird's Basic Engineering Mathematics has powers (7), exponentials (16), straight-line graphs (17), trigonometry (22) and
irregular areas and mean values (29) before one chapter on differentiation (35) and one on standard integration (36)
(I could not see the section lists inside those chapters on Routledge's page, so I do not rely on them).

---

## 3. What a marine engineering HNC/HND actually uses

### 3.1 SQA Higher National: Engineering Mathematics 2 (H7K1 34, SCQF level 7)
This is the unit with the calculus. The SQA file is dated August 2014 (version 01); I did not find a newer version, so
whether the code is still current in 2026 is **UNCONFIRMED**. I also could not tell which awarding body Dan's college
uses (SQA or Pearson); sections 3.1 to 3.3 give both.
- **SQA Engineering Mathematics 2 (H7K1 34, SCQF 7): purpose**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K134.pdf
  - Quote: "The Unit provides learners with opportunities to develop knowledge, understanding and skills to solve problems involving trigonometric and hyperbolic functions and identities; to differentiate and integrate a wide range of functions and use differentiation and integration techniques to solve Engineering problems."
- **SQA Engineering Mathematics 2: the three outcomes**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K134.pdf
  - Quote: "1 Solve trigonometric and hyperbolic function problems. ... 2 Use differentiation techniques to solve Engineering problems. ... 3 Use integration techniques to solve Engineering problems."
- **Outcome 2 knowledge and skills (differentiation)**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K134.pdf
  - Quote: "Differentiation of standards functions ... Chain Rule ... Second derivatives ... Rates of change ... Optimisation"
- **Outcome 3 knowledge and skills (integration)**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K134.pdf
  - Quote: "Indefinite and definite integrals ... Integration of standard functions ... Applications of integration"
- **Outcome 2 evidence: turning points, rate of change in an engineering problem, optimum solution**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K134.pdf
  - Quote: "Apply first and second derivatives to determine the position and nature of a turning point on a curve ... Use differentiation to determine the rate of change of a variable in an Engineering problem ... Apply differentiation techniques to find the optimum solution to a problem"
- **Outcome 3 evidence: an indefinite and a definite integral**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K134.pdf
  - Quote: "Solve one indefinite and one definite integral"
- **First principles is taught but not assessed**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K134.pdf
  - Quote: "Introduce the concept of differentiation from first principles (not assessable)"
- **Optimising example: maximum power transfer**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K134.pdf
  - Quote: "Apply differentiation to optimise a parameter or parameters of a problem (eg the condition under which the maximum electrical power will be transferred from a voltage source to load)"
- **What integration means and where it is applied**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K134.pdf
  - Quote: "Define what is meant by integration (eg as anti-differentiation, as the area bounded by curves, etc ... Apply integration to solve problems in Engineering (area under a velocity time curve giving distance travelled, work done by an expanding gas, first and second moments of area, centroids, mean values, root mean square values, etc)"
- **Hours: ten for differentiation, eight for integration, within a 40 hour unit**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K134.pdf
  - Quote: "the notional design length is 40 hours ... Outcome 2 (10 hours) ... Outcome 3 (8 hours)"
- **Outcome 2 begins by revising indices, including negative and fractional ones**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K134.pdf
  - Quote: "Revise indices including negative and fractional indices"
- **Recommended entry: functions, trig, log and exponential, passed Engineering Mathematics 1**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K134.pdf
  - Quote: "it would be advantageous if learners had a knowledge and understanding of functions including trigonometrical, log and exponential functions together with sound algebraic skills ... Learners considering taking this Unit will normally be expected to have passed the _Engineering Mathematics 1_ HN Unit or equivalent."
- **Recommended to be delivered early in an HND**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K134.pdf
  - Quote: "It is recommended that the Unit be delivered towards the beginning of these awards."
### 3.2 SQA Higher National: Engineering Mathematics 1 (H7K0 33, SCQF level 6), the unit before it
- **SQA Engineering Mathematics 1 (H7K0 33, SCQF 6): functions and trig; exponentials and logs; vectors and complex numbers**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K033.pdf
  - Quote: "1 Solve problems involving functions and trigonometric equations. 2 Solve problems involving exponential and logarithmic equations. 3 Apply mathematical techniques involving vectors and complex numbers."
- **Engineering Mathematics 1 introduces the radian and works with engineering expressions that contain an exponential term**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K033.pdf
  - Quote: "Introduce the concept of the radian ... Transpose and evaluate expressions from Engineering which include the term"
- **Engineering Mathematics 1 entry: good algebra, transposing engineering formulae, National 5 maths**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K033.pdf
  - Quote: "Entry requirements are at the discretion of the centre. However, it would be advantageous if learners had good algebraic skills together with an ability to transpose engineering formulae and solve simple trigonometric equations. This knowledge and understanding may be evidenced by possession of the NQ Unit _Mathematics: Technician 1_ or a pass at Intermediate 2 or National 5 in Mathematics."
- **SQA HN Engineering Systems arrangements: the older unit Mathematics for Engineering 2 (replaced by H7K1 34) was in the HND to give knowledge of calculus and "to study Calculus in some depth"**
  - Source: Hncdengineeringsystems G85G15 G85G16. https://www.sqa.org.uk/files_ccc/HNCDEngineeringSystems-G85G15-G85G16.pdf
  - Quote: "to provide candidates with knowledge and understanding of Calculus ... to allow candidates to study Calculus in some depth"
My reading: the HN route teaches functions, trigonometry, exponentials and logarithms (Mathematics 1) before calculus
(Mathematics 2), and its calculus unit is mostly technique: standard derivatives, the chain rule, second derivatives,
rates of change, optimisation, indefinite and definite integrals, and applications. Differentiation from first principles
is "not assessable". Of the 40 notional hours, 10 are differentiation and 8 integration.

### 3.3 Pearson BTEC Higher Nationals, Engineering Mathematics (Unit 4002, level 4)
- **Pearson BTEC HN Engineering Mathematics (Unit 4002, level 4): learning outcome 4 and its criteria**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "LO4 Examine how differential and integral calculus can be used to solve engineering and manufacturing sector problems ... P8 Examine rates of change for a range of mathematical functions. ... P9 Use integral calculus to determine a range of mathematical functions. ... Evaluate a range of engineering/ manufacturing problems that involve second- order derivatives and the concept of maxima and minima."
- **Pearson essential content: rules, higher derivatives, definite and indefinite integration, area, exponential growth and decay**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "Differential calculus: Definitions and concepts ... using the chain, product, and quotient rules ... second order and higher derivatives ... Integral calculus: Definite and indefinite integration Integrating to determine the area"
### 3.4 MCA written examinations: Second Engineer, Mathematics syllabus (management level)
The MCA's own syllabus for the Second Engineer certificate has two calculus sections. These lines are the clearest
statement of what a marine engineer must be able to do.
- **MCA Second Engineer Mathematics syllabus, section 7 (differentiation): the lines that matter**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "7.1 Discusses differential calculus and solves associated problems ... Determines the gradient of a chord. ... Discusses the meaning of the limiting value of δy/δx as X - 0, defining it as dy/dx. ... Derives the derivative of ax n where n is +ve or -ve. ... Determines the derivatives of multinomial algebraic expressions. ... States the derivative of a constant. ... Discusses the concept of 2nd derivatives. ... States the derivatives for sinx, cosx and lnx."
- **MCA section 7, rate of change, velocity, acceleration and turning points**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "Discusses the concept of rate of change. ... Determines velocity from displacement-time functions and acceleration from velocity-time functions. ... States that at the turning point of a curve, the differential coefficient is zero. ... Discusses the concept of maximum and minimum. ... Identifies max/min values for examination of 2nd derivative. ... Determines the max and/or min volumes for given functions."
- **MCA Second Engineer Mathematics syllabus, section 8 (integration)**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "8.1 Discusses integral calculus and solves associated problems ... States that integration is the reverse of differentiation. 2. Discusses the concept of the indefinite integral and the need for a constant. ... States the integral of ax n where n 3≠ -1. ... Determines the constant of integration from given conditions. ... Discusses the concept of limits. ... States the integrals of sinx and cosx."
- **MCA section 8, integration as summation, areas and the area under pV^n = C**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "Discusses the concept of elemental summation to determine areas and volumes and relates this to integration. ... Determines areas and volumes by integration given the law of the boundary curve and limits. ... Derives expressions for the area under the curve, given by pV n = C."
- **MCA assumes logarithms; powers and mean height appear earlier in the same syllabus**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "Defines the term index (power). ... States what is meant by fractional, negative and zero indices. ... Uses logarithms to under take simple calculations (not directly examinable but such knowledge will be assumed) ... Determines the mean height of a figure from area and length. ... Writes derivatives in terms of functional notation."
### 3.5 MCA Applied Mechanics, Applied Heat and Marine Electro-technology (Second/Chief Engineer)
- **MCA Applied Mechanics: slope and area of a velocity-time graph**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Sketches distance/time graphs for both constant speed and uniform acceleration and defines the slope. ... Sketches velocity/time graphs for both constant speed and uniform acceleration and relates the slope and area to the motion."
- **MCA Applied Mechanics: rates of change in dynamics and fluids**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Recalls that force is equal to the rate of change of momentum."
- **MCA Applied Mechanics: rates of change in dynamics and fluids**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Derives the expression for the rate of change of angular momentum and hence angular impulse."
- **MCA Applied Mechanics: rates of change in dynamics and fluids**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Represents graphically angular work done."
- **MCA Applied Mechanics: SHM displacement, velocity and acceleration**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Derives expressions for displacement, velocity and acceleration of the projection, on a diameter, of a point moving in a circular path at constant angular velocity and hence concludes the motion is SHM. ... expressions for instantaneous displacement, velocity and acceleration of piston to be given as required"
- **MCA Applied Heat: work is the area of the pV diagram; indicator cards by mid-ordinate rule**
  - Source: Applied Heat Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-heat-written-examination-syllabus
  - Quote: "States that power is the rate of transfer of energy. ... Shows that the area of the pV diagram represents W.D. during the operation. ... Defines mean effective pressure (m.e.p.). ... Determines the area of an indicator card using the mid-ordinate rule."
- **MCA Marine Electro-technology: mean value and rms value of a sine wave**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Explains terms, mean value, rms value and form factor with reference to a sine wave. 18. Calculates the rms value, mean value and form factor of sinusoidal and non-sinusoidal wave forms."
- **MCA Marine Electro-technology: induced emf is written with changes (Delta), not d**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "the rate of change of flux cutting the coil and e = NΔΦ/Δtvolts. ... States that e = LΔ i /Δt volts."
My reading: in these three papers calculus mostly appears as ideas in words, not as sums to do: the slope and area of a
velocity-time graph, force as the rate of change of momentum, the area of a pV diagram as work done, indicator cards by
the mid-ordinate rule, the mean and rms value of a sine wave. Notice the electro-technology syllabus writes induced emf
with changes (delta flux over delta t, delta i over delta t), not d over dt. That is the bridge Dan needs: a ratio of two
changes becomes a rate at an instant.

### 3.6 MCA General Engineering Science (restricted management-level certificates)
- **MCA General Engineering Science I (restricted management level): gradients and areas on graphs, no calculus named**
  - Source: General Engineering Science I Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses
  - Quote: "Determine the area of a figure using the mid-ordinate rule. ... Calculate and interpret the gradient of distance time graph as speed. ... Calculate and interpret the gradient of velocity time graph as acceleration. ... Draw graphs of force/distance and torque/angle from given data and interpret the area under the graph to Work Done."
- **MCA General Engineering Science II: mean effective pressure from the indicator card**
  - Source: General Engineering Science II Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-ii-written-examination-syllabuses
  - Quote: "Determine Mean Effective Pressure from indicator card data."
- **What the General Engineering Science papers are for**
  - Source: General Engineering Science Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses
  - Quote: "core engineering and mathematics knowledge required for restricted, management level Certificates of Competency"
My reading: this MCA set is written for restricted, management-level certificates (small vessels), and its mathematics
and mechanics are gradients and areas of graphs read from data, with no calculus named. It is the plainest statement of
the "graphs first" level. Calculus by name is in the Second Engineer mathematics syllabus (3.4) and in the HN unit (3.1).
Which of these papers Dan's route needs is UNCONFIRMED: the Warsash HND page (3.7) says the programme leads to an MCA
certificate and covers the underpinning knowledge for the IAMI written exams, and the college's own Engineering
Mathematics unit is where the calculus sits.

### 3.7 Warsash (Solent) engineer cadet programmes
- **Warsash engineer cadet HND: leads to the MCA officer-of-the-watch certificate; starts with Maritime Mathematics for Engineers**
  - Source: Engineer Cadet - Higher National Diploma Programme | Warsash Maritime. https://maritime.solent.ac.uk/courses/engineering-and-electro-technical/engineer-cadet-hnd
  - Quote: "leads to a HND Marine Engineering, as well as the award of a UK Maritime and Coastguard Agency (MCA) Certificate of Competency ... satisfy the underpinning knowledge (UPK) requirements for the IAMI written exams ... Maritime Mathematics for Engineers"
- **Warsash HND Level 4 units include Engineering Mathematics**
  - Source: Officer cadet training schemes. https://maritime.solent.ac.uk/documents/brochures/officer-cadet-training-brochure.pdf
  - Quote: "HND Level 4 units (20c each): Engineering Mathematics, Marine Electronics and Control Systems, Marine Engineering Systems, General Engineering Science, Marine Engineering Principles and Marine Engineering Operations."
- **Warsash on why marine engineers study mathematics**
  - Source: Engineer cadets maths refresher. https://maritime.solent.ac.uk/documents/training-at-warsash/engineer-cadets-maths-refresher.pdf
  - Quote: "Why do marine engineers need to study mathematics? ... In applied heat, electrics, and mechanics you will need to demonstrate your understanding of new ideas and concepts through answering descriptive questions and questions that require you to calculate numerical answers. ... The mathematics that you study during your first academic session as an engineering cadet will help you to develop the mathematical skills to enable you to tackle these numerical questions."
- **Seafarer Training group: engineer cadets' studies draw heavily on maths**
  - Source: Your Studies as a Deck, Engineer or ETO Cadet in the British.... https://www.sstg.org/your-studies
  - Quote: "Whether you have chosen to train as a Deck, Engineer, or ETO Officer, your studies are going to draw heavily on maths."
- **Solent University module Maritime Mathematics for Engineers**
  - Source: Marine Engineering | FdEng. https://www.solent.ac.uk/courses/undergraduate/marine-engineering-fdeng
  - Quote: "Maritime Mathematics for Engineers. Mathematical analytical skills are critical to your future career as an engineer."
- **Warsash refresher notes (mathCentre) on indices and the number e**
  - Source: Engineer cadets maths refresher. https://maritime.solent.ac.uk/documents/training-at-warsash/engineer-cadets-maths-refresher.pdf
  - Quote: "simplify expressions involving indices • use the rules of indices to simplify expressions involving indices • use negative and fractional indices. ... The second common base is e. The symbol e is called the exponential constant and has a value approximately equal to 2.718. This is a number like _π_ in the sense that it has an infinite decimal expansion. Base e is used because this constant occurs frequently in the mathematical modelling of many physical, biological and economic applications."
---

## 4. The prerequisites calculus leans on, and how courses handle them

What each course assumes (the quotes are in 1.1 to 1.4, 2.1, 2.2 and 3.1 to 3.4; the list here is the pattern):
- **Functions and f(x) notation.** Brilliant Derivatives needs "function notation like f(x)", Brilliant Calculus and Limits
  need "the basics of functions" (domain, range, graphs, intercepts); Khan says "Calculus is all about functions"; the
  MCA Second Engineer mathematics syllabus has "Writes derivatives in terms of functional notation".
- **Gradient of a straight line.** Brilliant Derivatives lists "finding the slope of a straight line"; HELM Workbook 2
  covers it before calculus. Dan has this.
- **Powers and indices.** Not in Dan's built courses (Exponents and Radicals is in the Algebra folder after Linear
  equations). The MCA syllabus teaches "fractional, negative and zero indices" before it reaches calculus; the HN unit's
  differentiation outcome opens with "Revise indices including negative and fractional indices"; Bird has powers at
  chapter 7; Warsash points cadets at mathCentre notes on indices (3.7).
- **Exponentials, e and logarithms.** Brilliant lists Exponential Functions and Logarithms as courses to do first; HN
  Engineering Mathematics 2 recommends them as entry knowledge, and Engineering Mathematics 1 teaches them; the MCA marks
  logarithms "not directly examinable but such knowledge will be assumed". Brilliant Derivatives nonetheless computes the
  derivative of 2 to the x from the definition without having asked for logarithms, and 3Blue1Brown makes "why is e to the x
  its own derivative" an early chapter.
- **Trigonometry and radians.** Khan, MIT, Brilliant (Trigonometric Functions "assumed throughout") and the HN route all
  put it first. Bitesize states the rule that makes it a hard dependency: "Note: This only works when x is measured in
  radians" (2.4).
- **Sequences.** Only Brilliant's Limits course builds the limit on sequences. The other routes (Khan, MIT, 3Blue1Brown,
  Bitesize, HN) use a shrinking step on a graph. Sequences are not needed.

My reading (the verdict for Dan):
1. **Teach inline, in the first lesson or two:** the function as a rule with f(x) notation (Dan has the coordinate plane
   and linear equations, so this is a short bridge); the gradient as a ratio of two changes (his; just reframe it as
   "change in y per change in x"); x squared, x cubed and x to a whole-number power, because the power rule is the working
   tool and Dan has not met indices. Negative and fractional powers (1/x, square root) are better left as a "see it, do not
   derive it" stretch, or left to the Algebra courses, since HN Mathematics 2 revises them as a separate step.
2. **Teach as a picture, not as algebra:** the idea of a limit as "make the step smaller and smaller and watch what
   the slope settles to" (the Brilliant Derivatives and 3Blue1Brown route); no epsilon-delta, no sequences.
3. **Leave out of the main course:** trigonometric derivatives (they need radians and sin/cos, which Dan has not done),
   the derivative of e to the x and of logarithms (they need exponentials), the product and quotient rules and implicit
   differentiation. The chain rule is on the HN list (outcome 2) but not on the MCA Second Engineer list; the safest
   place is an optional stretch lesson.
4. **Exponentials appear only as a curve with controls** (capacitor charging, cooling): the rate of change is shown to fall
   as the curve flattens, with the number controlled by a slider, not derived. The formula e to the minus t over tau is not
   needed to see that the slope is proportional to the gap.
5. If the brief wants waves (AC, SHM), a short "what sin and cos are" picture is needed first; I would defer AC
   examples to a later trigonometry course and use DC examples (a capacitor charging, a tank filling) in this one.

---

## 5. Learning science and misconceptions for calculus

### 5.1 The derivative has layers: a ratio, then a limit at a point, then a function
- **Zandieh's framework: derivative is a ratio, then a limit of the ratio at a point, then the function of those limits**
  - Source: CBMS - American Mathematical Society. https://www.ams.org/bookstore/pspdf/cbmath-8-prev.pdf
  - Quote: "The first layer concerns ratio, the second, the limit of that ratio (derivative at a point), and the third, the collection of those limits (the derivative function). ... Such a framework suggests just how complicated an adequate understanding of derivative might be."
- **A 2020 study of students' answers using Zandieh's layers (ratio, limit, function)**
  - Source: European Journal of Educational Research. https://files.eric.ed.gov/fulltext/EJ1272362.pdf
  - Quote: "Zandieh stated that the concept of the derivative can be seen as a function whose value at any point is the limit of the ratio of differences ... the derivative has three layers: ratio, limit, and function."
My reading: Zandieh's three layers (ratio of changes; the limit of that ratio at one point, which is a number; the
collection of those limits, which is a new function) are the standard account of why "the derivative" means three
different things to a learner. For Dan it says: show the number at a point (slope here) and the function (the slope
everywhere, drawn as a second graph) as two different objects, and let him move between them. The Khan comment below is a
small live example of the confusion (value of the derivative mistaken for a point the tangent passes through).

### 5.2 Instantaneous rate, average rate and the tangent line
- **Bressoud (MAA): do not build the derivative on the slope of the tangent**
  - Source: The Derivative is not the Slope of the Tangent Line – Mathematical Association of America. https://maa.org/math-values/2018-11-26-the-derivative-is-not-the-slope-of-the-tangent-line
  - Quote: "My point is that we cannot and should not expect students to base their understanding of the derivative on the slope of the tangent."
- **Bressoud (MAA): do not build the derivative on the slope of the tangent**
  - Source: The Derivative is not the Slope of the Tangent Line – Mathematical Association of America. https://maa.org/math-values/2018-11-26-the-derivative-is-not-the-slope-of-the-tangent-line
  - Quote: "Invariably, almost everyone, even at the start of Calculus I, can calculate the instantaneous rate of change. Almost no one gives me the correct average rate of change."
- **Bressoud (MAA): do not build the derivative on the slope of the tangent**
  - Source: The Derivative is not the Slope of the Tangent Line – Mathematical Association of America. https://maa.org/math-values/2018-11-26-the-derivative-is-not-the-slope-of-the-tangent-line
  - Quote: "The difficulty is that finding the instantaneous rate is formulaic."
- **Bressoud (MAA): do not build the derivative on the slope of the tangent**
  - Source: The Derivative is not the Slope of the Tangent Line – Mathematical Association of America. https://maa.org/math-values/2018-11-26-the-derivative-is-not-the-slope-of-the-tangent-line
  - Quote: "The problem is that _slope_ is a problematic concept for many students."
- **Bressoud (MAA): do not build the derivative on the slope of the tangent**
  - Source: The Derivative is not the Slope of the Tangent Line – Mathematical Association of America. https://maa.org/math-values/2018-11-26-the-derivative-is-not-the-slope-of-the-tangent-line
  - Quote: "the derivative must be introduced in terms of a multiplicative relationship between changes in the variables."
- **AP Calculus students' misconceptions about rate of change**
  - Source: Rate of Change: AP Calculus Students' Understandings .... https://onlinelibrary.wiley.com/doi/10.1111/j.1949-8594.2012.00150.x
  - Quote: "Results from this study indicate that students' misconceptions about rate of change are similar across the two curricula."
- **Thompson: a rate seen as a functional relationship is a foundation for the derivative**
  - Source: A calculus student’s understanding of graphical approach to the derivative through quantitative reasoning. https://files.eric.ed.gov/fulltext/EJ1327583.pdf
  - Quote: "Thompson (1990) has emphasized the idea that a rate is conceived of as constituting a functional relationship may be a foundation for the derivative in calculus"
- **A pre-calculus text's school definition of a tangent ("touches once, does not cross") and its own qualification**
  - Source: Derivatives | Precalculus. https://courses.lumenlearning.com/precalculus/chapter/derivatives
  - Quote: "A tangent line to a curve is a line that intersects the curve at only a single point but does not cross it there. (The tangent line may intersect the curve at another point away from the point of interest.)"
- **A learner's comment: confusing the derivative's value with a point the tangent passes through (anecdote)**
  - Source: Connecting the derivative and tangent line equations (video) | Khan Academy. https://www.khanacademy.org/math/ap-calculus-ab/ab-differentiation-1-new/ab-2-1/v/derivative-as-slope-of-tangent-line
  - Quote: "I was thinking, incorrectly, that "g'(-1) = -2" means that the tangent line must go through (-1, -2)"
My reading: Bressoud's point is the strongest single source I found for how to order the course. Learners compute the
instantaneous rate by a memorised rule ("formulaic") but cannot say what an average rate of change is, and "slope"
itself is a weak idea to build on. So start with average rate of change (distance per time, volts per second) before
the tangent, and say what the derivative means in the units ("amps per second"), before and after the rule.

### 5.3 dy/dx read as a fraction
I found no research paper that tests this misconception directly; what follows are a TI calculus course and a
teachers' forum, so treat it as **SECONDARY**. The MCA syllabus itself defines dy/dx as "the limiting value of
δy/δx" (3.4), which is the honest middle path: it is a ratio of small changes in the limit, written as one symbol.
- **dy/dx comes from the limit of the difference of y-values divided by the difference of x-values**
  - Source: Module 10 - The Derivative as a Function - Lesson 3. https://education.ti.com/html/t3_free_courses/calculus84_online/mod10/mod10_lesson3.html
  - Quote: "One commonly used notation is dy/dx, which is derived from the definition of the derivative as the limit of the difference of the y -values divided by the difference of the x -values."
- **Mathematics Educators Stack Exchange: the fraction reading and why teachers warn about it (forum, SECONDARY)**
  - Source: calculus - Why are we so careful in saying that dy/dx is not a fraction? - Mathematics Educators Stack Exchange. https://matheducators.stackexchange.com/questions/4284/why-are-we-so-careful-in-saying-that-dy-dx-is-not-a-fraction
  - Quote: "the danger of putting too much emphasis on the fraction notation is that it deludes students into thinking that FTC has no content, or is some kind of triviality. ... Students should of course be told that $dx$ and $dy$ are not real numbers."
### 5.4 Limits as "getting close but never reaching"
- **Williams 1991: informal models of limit resist change**
  - Source: ERIC - EJ429212 - Models of Limit Held by College Calculus Students., Journal for Research in Mathematics Education, 1991. https://eric.ed.gov/?id=EJ429212
  - Quote: "Encouragement by the researchers for the students to change their common informal models of limit to more formal conceptions were met with extreme resistance."
- **Williams 1991 survey: 70% of 341 students said a limit is a number the function never reaches (SECONDARY: a dissertation reporting it)**
  - Source: STUDENT'S MISCONCEPTIONS OF SEQUENCES AND SERIES IN SECOND SEMESTER CALCULUS. https://scholars.unh.edu/cgi/viewcontent.cgi?article=1155&context=dissertation
  - Quote: "A limit is a number or point the function gets close to but never reaches” (p. 221). Of the 341 students surveyed, 70% said that this statement was true."
- **The "unreachable" limit model listed among common limit misconceptions (SECONDARY)**
  - Source: Diagnosing Misconceptions in First-Year Calculus. https://papers.iafor.org/wp-content/uploads/papers/pce2023/PCE2023_71266.pdf
  - Quote: "Unreachable : A limit is a number or point the function gets closer to but never reaches"
- **Introductory calculus understanding is heavily procedural**
  - Source: Reinventing the formal definition of limit: The case of Amy and Mike - ScienceDirect. https://www.sciencedirect.com/science/article/abs/pii/S0732312311000022
  - Quote: "understanding during an introductory calculus course is heavily procedural, and lacks the type of conceptual depth for which educators hope"
My reading: Williams (1991) is the original study (the ERIC abstract above is the publisher-side record); the "70% of 341"
figure comes from a dissertation citing it, hence SECONDARY. The practical point for the brief is to avoid teaching the
limit as a thing "approached but never reached" (a curve can touch its limit, or oscillate around it). Brilliant's way
(a target band, then a smaller band) and the zoom-in picture avoid the word "never".

### 5.5 The integral: area versus accumulation, and area below the axis
- **Orton 1983: integration as the limit of a sum is hard even for good students**
  - Source: ERIC - EJ276956 - Students' Understanding of Integration., Educational Studies in Mathematics, 1983-Feb. https://eric.ed.gov/?id=EJ276956
  - Quote: "This study, based on individual interviews with 100 students (aged 16 to 22 years), was designed to investigate understanding of elementary calculus (particularly integration and differentiation). ... Results indicated that items related to understanding integration as the limit of a sum were difficult even for good students."
- **Students treat area under the axis as a spatial area, not a signed quantity (2023)**
  - Source: Student Understanding of the Sign of Negative Definite Integrals in Mathematics and Physics | International Journal of Research in Undergraduate Mathematics Education | Springer Nature Link. https://link.springer.com/article/10.1007/s40753-022-00202-y
  - Quote: "may limit students’ ability to apply the integral concept to quantities other than area ... Students often do not treat the area as a signed quantity, in this case as a negative quantity when the integrand is negative, i.e., below the x -axis, effectively treating it as a spatial area"
- **Students say "the integral is the area" but cannot link it to accumulation (physics education research)**
  - Source: Students' understanding and application of the area under the curve concept in physics problems | Phys. Rev. ST Phys. Educ. Res.. https://journals.aps.org/prper/abstract/10.1103/PhysRevSTPER.7.010112
  - Quote: "Even when students could invoke the area under the curve concept, they did not necessarily understand the relationship between the process of accumulation and the area under a curve, so they failed to apply it to novel situations. ... although all of them could state that ``the integral equaled the area under the curve."
My reading: three consistent findings. Integration as the limit of a sum is hard even for good students (Orton, 1983).
"The integral is the area under the curve" is the answer students give most, but it does not transfer to other quantities
unless they see the accumulation underneath (Physical Review PER). And area below the axis is read as a plain area, not a
signed one (IJRUME 2023). The engineering uses (work done, distance from a speed graph, charge from a current graph) are
all accumulation, so the course should teach "adding up thin slices of a rate" first and "area" second, and give a DO
screen where the graph dips below the axis.

### 5.6 The constant of integration
- **The constant of integration: SQA examiners' reports**
  - Source: Higher Mathematics 2023 course report. https://www.sqa.org.uk/files_ccc/2023-h-course-report-mathematics.pdf
  - Quote: "Only a few candidates were able to identify the area represented by the integral on the sketch provided. ... a few candidates did not include the ‘ + c ’ when they integrated."
- **Advanced Higher examiners: basic errors in dealing with the constant of integration**
  - Source: Advanced Higher Mathematics Course Report 2023. https://www.sqa.org.uk/sqa/files_ccc/2023-ah-course-report-mathematics.pdf
  - Quote: "Many candidates made basic errors in applying a formula approach, or in dealing with the constant of integration."
The Bitesize explanation of where "+ c" comes from is in 2.4 (the derivative of a constant is zero, so there may have been
one). My reading: the fix is to use the engineering meaning, a starting value (distance at t = 0, charge at t = 0). The MCA
syllabus asks for exactly this: "Determines the constant of integration from given conditions" (3.4).

---

## 6. Where calculus is used by an electrician going into marine engineering

### 6.1 Current is the rate of change of charge, i = dq/dt
- **Current is the time derivative of charge (OpenStax University Physics)**
  - Source: 9.2: Electrical Current - Physics LibreTexts. https://phys.libretexts.org/Bookshelves/University_Physics/University_Physics_(OpenStax)/University_Physics_II_-_Thermodynamics_Electricity_and_Magnetism_(OpenStax)/09:_Current_and_Resistance/9.02:_Electrical_Current
  - Quote: "The instantaneous electrical current, or simply the electrical current , is the time derivative of the charge that flows ... Notice from the figure that the charge increases to (Q_M) and the derivative decreases, approaching zero, as time increases"
- **Current is the rate at which charge accumulates on a capacitor**
  - Source: 20.5: Modeling circuits with capacitors - Physics LibreTexts. https://phys.libretexts.org/Courses/Berea_College/Introductory_Physics%3A_Berea_College/20%3A_Electric_Circuits/20.05%3A_Modeling_circuits_with_capacitors
  - Quote: "is the rate at which charges flow through the circuit, and is thus equal to rate at which charges accumulate on the capacitor"
### 6.2 Capacitor and inductor: i = C dv/dt and v = L di/dt
- **Capacitor: current is capacitance times the rate of change of voltage**
  - Source: 8.2: Capacitance and Capacitors - Engineering LibreTexts. https://eng.libretexts.org/Bookshelves/Electrical_Engineering/Electronics/DC_Electrical_Circuit_Analysis_-_A_Practical_Approach_(Fiore)/08%3A_Capacitors/8.2%3A_Capacitance_and_Capacitors
  - Quote: "The current through a capacitor is equal to the capacitance times the rate of change of the capacitor voltage with respect to time (i.e., its slope). That is, the value of the voltage is not important, but rather how quickly the voltage is changing. ... if a capacitor is fed by a constant current source, the voltage will rise at a constant rate"
- **Khan Academy: the capacitor current goes with the rate of change of voltage, not the voltage**
  - Source: Capacitor i-v equations (video) | Khan Academy. https://www.khanacademy.org/science/electrical-engineering/ee-circuit-analysis-topic/ee-natural-and-forced-response/v/ee-capacitor-i-v-equations
  - Quote: "Not the voltage itself, but to the rate of change of voltage."
- **Stanford: i = C dv/dt, v = L di/dt, and the slope reading for people who have not studied calculus**
  - Source: Capacitors and inductors. https://web.stanford.edu/class/archive/engr/engr40m.1178/slides/reactives.pdf
  - Quote: "where dv dt is the rate of change of voltage with respect to time. ... studied calculus, think of this as the slope of the curve at a given time t , if you draw a graph of voltage against time. ... In a circuit that is in steady state, dv dt = 0 and di dt = 0 for all voltages and currents in the circuit—including those of capacitors and inductors."
- **Inductor: the voltage is the derivative of the current**
  - Source: 15.2: Inductors and Calculus. https://workforce.libretexts.org/@api/deki/pages/1124/pdf/15.2%253A%2bInductors%2band%2bCalculus.pdf
  - Quote: "In calculus terms, we would say that the induced voltage across the inductor is the derivative of the current through the inductor"
### 6.3 RMS value as the root of the mean of the squares
- **RMS: square it, take the mean, take the square root (Notre Dame notes)**
  - Source: Basic Signal Analysis. https://academicweb.nd.edu/~pdunn/www.text/ECbasiganal.pdf
  - Quote: "is to square of the signal and then calculate the mean, that way all the values to be integrated will be positive. The only problem is that the mean we calculate will be related to the square of the amplitude. This can be easily fixed by taking the square root of the mean of the squares. ... For example, the RMS value of a sine wave of amplitude _A_ over one period (or over a long period of time) is given by"
- **Khan Academy: RMS defined, and the mean of sin squared found without calculus**
  - Source: Sine wave RMS value - derivation (without calculus) (video) | Khan Academy. https://www.khanacademy.org/science/in-in-class-12th-physics-india/x51bd77206da864f3%3Aalternating-current/x51bd77206da864f3%3Arms-values-of-current-voltage/v/sine-wave-rms-value-derivation-without-calculus
  - Quote: "To calculate the RMS value of any function, we first square it, then find the mean value over some time period, and finally take the square root of it. ... we can calculate their mean value without using calculus"
- **ScienceDirect: the electrical definition of rms**
  - Source: Root Mean Square Value - an overview | ScienceDirect Topics. https://www.sciencedirect.com/topics/engineering/root-mean-square-value
  - Quote: "value of any alternating quantity is found by taking the square root of the mean of the squares of the values of the quantity."
### 6.4 Mean value of a function
- **The mean value of a signal as an integral over a period (Notre Dame)**
  - Source: Basic Signal Analysis. https://academicweb.nd.edu/~pdunn/www.text/ECbasiganal.pdf
  - Quote: "The mean of a signal over a period of time from t 1 to t 2 is given by ... its mean over half a period is equal to A/π"
Also in 2.2 (MIT chapter 19 "Surface Area. Average Value"), 2.5 (HELM 14.2 "The Mean Value and the Root-Mean-Square
Value"; Bird "Mean and root mean square values") and 3.1 (SQA "mean values, root mean square values").

### 6.5 Velocity and acceleration as derivatives
- **Distance is a function of time, its derivative is instantaneous velocity**
  - Source: Derivatives | Precalculus. https://courses.lumenlearning.com/precalculus/chapter/derivatives
  - Quote: "If a function measures distance as a function of time, then the derivative measures the instantaneous velocity at time"
- **Bitesize worked example: speed is found by differentiating distance**
  - Source: Rate of change - Applying differential calculus - Higher Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zwy334j/revision/3
  - Quote: "The speed is the rate of change between the distance and the time. Remember to calculate a rate of change, we differentiate."
Also 3.4 (MCA: "Determines velocity from displacement-time functions and acceleration from velocity-time functions") and
1.1 (Brilliant "Apply: From Distance To Jerk").

### 6.6 Work as the integral of pressure over volume (the indicator diagram)
- **Work by an expanding gas: dW = p dV, the integral is the area under the pV curve (Physics LibreTexts)**
  - Source: 12.10: Work, Heat, and Internal Energy - Physics LibreTexts. https://phys.libretexts.org/Courses/Georgia_State_University/GSU-TM-Physics_I_(2211)/12%3A_Temperature_and_Heat/12.10%3A_Work_Heat_and_Internal_Energy
  - Quote: "The integral is interpreted graphically as the area under the pV curve ... Work done by the gas is positive for expansion and negative for compression."
Also 3.1 (SQA: "work done by an expanding gas"), 3.4 (MCA: "Derives expressions for the area under the curve, given by
pV n = C"), 3.5 (MCA: "Shows that the area of the pV diagram represents W.D.") and 3.6 (GES: "interpret the area under
the graph to Work Done").

### 6.7 Newton's law of cooling and exponential charging as processes defined by a derivative
- **Newton's law of cooling: the rate of change of temperature is proportional to the temperature difference**
  - Source: Newton's Law of Cooling. https://www.math.wpi.edu/Course_Materials/MA1022A96/lab2/node5.html
  - Quote: "What this law says is that the rate of change of temperature is proportional to the difference between the temperature of the object and that of the surrounding environment."
- **Newton's law of cooling gives exponential decay of the difference (University of Waterloo notes)**
  - Source: Newton's Law of Cooling. https://www.math.uwaterloo.ca/~baforres/UCM138/Lectures/Chapter4/SLIDESNewtonsLaw.pdf
  - Quote: "so D satisfies the equation of exponential growth (or decay)."
My reading: the capacitor charging curve is in 6.1 (the OpenStax passage shows charge rising to a maximum while the
current, the derivative, falls towards zero). Newton's law of cooling is a standard physics example; I found no MCA or HN
syllabus line that names it, so its place in the marine route is **UNCONFIRMED**. It is a good "rate proportional to the
gap" example for a slider, but the Applied Heat syllabus I found treats heat transfer as steady rates through walls, not
cooling curves. Dan's shelf also has a later Differential equations course in the Advanced maths folder, which is where "rate proportional to the amount" is solved. Also in 3.1: "the condition under which the maximum electrical power will be transferred" (an
optimisation, the same kind as the MCA's "max and/or min volumes").

---

## 7. Size: how many lessons, and which core

What the benchmarks spend (all counts from the findings above):
- Brilliant Derivatives: 23 lessons for the idea and the definition alone (4 of 11 levels written, no rules yet).
- Brilliant Calculus: 42 lessons for the whole subject; derivative and rules in levels 1 to 3 (15 lessons incl. applied
  ones), integrals in level 4 (5 lessons).
- Brilliant's old Calculus Fundamentals (UNCONFIRMED, 1.5): 19 lessons, derivatives only.
- Khan: 6 units for differential calculus, a whole second course for integration; MIT: 3 chapters for rates, limits and
  formulas, then chapters 11 to 14 for the integral.
- Bitesize: 7 differentiation pages, with integration in its own separate guide; HELM: 7 sections of differentiation, 6 of
  applications, 6 of integration; Bird Basic: 1 chapter on differentiation, 1 on integration, 1 on areas and mean values.
- SQA HN Engineering Mathematics 2: 10 hours of differentiation and 8 of integration (3.1).

My reading: eight to ten lessons is supported, and is about what Dan's marine route spends on calculus in the HN unit (18
of 40 hours). The core that the evidence supports, in the order every benchmark except MIT 2023 uses (rate of change
before limits before rules before integration), with Bressoud's advice that average rate comes first:
1. Average rate of change, in units (distance per time, volts per second, litres per minute): reading it off a graph or table. (Brilliant
   Derivatives levels 1 to 2; Bressoud; SQA "rates of change".)
2. Rate at an instant: zoom in, a secant becomes a tangent; the derivative at a point as a number; the Delta to d bridge
   (Brilliant level 3; MCA 7.1.1 to 7.1.3).
3. The derivative as a function, from first principles on x squared (Brilliant Derivatives level 4; HN "not assessable"
   but taught).
4. The power rule, sum and constant multiple (HN, MCA, Bitesize, Bird).
5. Reading derivatives: velocity and acceleration, the second derivative, turning points, maximum and minimum (MCA
   7.1.12 to 7.1.16; SQA outcome 2).
6. Integration as the reverse, with the constant as a starting value (MCA 8.1.1 to 8.1.5).
7. Accumulation and the definite integral: area under a rate graph, adding up slices, the Fundamental Theorem as the link;
   area below the axis (Brilliant level 4; Khan unit 6; MCA 8.1.10 to 8.1.11).
8. Using integration: distance from speed, work from pressure and volume (the pV diagram), charge from current; the mean and RMS
   value of a function (SQA outcome 3; MCA).
Optional, to reach ten: the chain rule (SQA outcome 2), and the exponential curve with controls (cooling, capacitor).
Not recommended for this course: trigonometric, exponential and logarithmic derivatives, product and quotient rules,
implicit differentiation, integration by substitution or parts.

---

## 8. Gaps and things I could not confirm
- Brilliant Calculus Fundamentals: whether retired or folded in is **UNCONFIRMED** (section 1.0). The only copy of its
  lesson list is a 2019 Wayback Machine page, which the checker refuses, so 1.5 is UNCONFIRMED.
- The inside of any Brilliant lesson (the pictures, the interactives): **UNCONFIRMED**; I read titles and descriptions only.
- Which awarding body (SQA or Pearson) Dan's college uses, and whether the SQA codes H7K0 33 and H7K1 34 (dated Aug 2014)
  are still the current ones: **UNCONFIRMED**. The Pearson Unit 4002 descriptor is Issue 6, October 2025.
- Whether the Newton's law of cooling example appears on any marine syllabus: **UNCONFIRMED** (no line found).
- dy/dx as a fraction: only SECONDARY sources (5.3). The "70% of 341 students" limit survey is SECONDARY (5.4).
- The Khan Academy page "What to know before taking calculus" is cited at its long address (with a query string),
  because that is the address the connector returned; the same article is at
  `khanacademy.org/math/ap-calculus-ab/ab-limits-new/ap-ab-about/a/ap-calc-prerequisites`.
- I did not find the MCA's General Engineering Science papers' pass marks or the weight of the calculus questions in the
  Second Engineer mathematics paper.
