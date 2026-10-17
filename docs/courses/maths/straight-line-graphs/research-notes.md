# Straight-line graphs: research notes

Researched 17 Oct 2026 for the Straight-line graphs course brief (the second course in the Maths shelf's Algebra
folder, after Linear equations; blurb "y = mx + c: slope and intercepts, the distance between points, and fitting a
line to data.", from "Brilliant: Coordinate Geometry and Linear Relationships"). The brief itself is not written
here; these notes are its evidence. Dan is an electrician preparing for marine engineering college (HNC/HND route:
engineering maths, applied mechanics, applied heat, electro-technology). He has Fractions, Negative numbers,
Percentages, Proportional reasoning, Solving equations, The coordinate plane (points, scales, reading graphs,
straight lines through zero), Geometry fundamentals (area, circles, Pythagoras, volume), Linear equations (like
terms, brackets, factorising, equations with brackets, inequalities, rearranging formulas) and Calculus
fundamentals (rates, the derivative, the power rule, integration) behind him.

Every finding has its source title, URL and the exact words, copied from a saved tool result by script (the quotes
were not retyped into this file). All of them are listed in `quotes.json` beside this file and were checked with
`node tools/eval/sources.mjs --quotes ... --tools ...` (`failed: 0`). The tool files are in `tools/`.
Findings I could not confirm are marked **UNCONFIRMED**; where only a non-original site said it, **SECONDARY**.
My own readings are marked "My reading" and are not quotes. Mirror and copy sites were avoided. Three hosts that
republish or summarise an original are used and marked SECONDARY: edumaritime.net (the MCA written syllabus), the
Imperial-hosted copy of the HELM guide, and a lecture PDF on uomus.edu.iq and testbook.com for electrical text. The
quotes sometimes show a PDF's broken symbols or markdown marks exactly as the tool returned them.

---

## 1. Benchmark: Brilliant's Coordinate Geometry and Linear Relationships

### 1.1 Linear Relationships (the line itself)
Brilliant's page is `brilliant.org/courses/linear-functions` (the address `/courses/linear-relationships/` returned
the course listing, not the course). It is **56 lessons in 10 levels**. The levels, in order:
1. Constant Change. 2. Making Predictions. 3. Slope of a Line. 4. Writing Linear Expressions. 5. Identifying Linear
Relationships. 6. Writing Equations of Lines. 7. Parallel and Perpendicular Lines. 8. Using Intercepts.
9. Graphing Relationships from Data. 10. Linear Inequalities.

- **Brilliant's Linear Relationships: 56 lessons, 999 exercises**
  - Source: Practice Linear Relationships | Brilliant. https://brilliant.org/courses/linear-functions
  - Quote: "Identify linear patterns, find rates of change, and write equations to describe lines. 56 Lessons 999 Exercises"
- **Levels 1 to 3: constant change, making predictions, slope of a line**
  - Source: Practice Linear Relationships | Brilliant. https://brilliant.org/courses/linear-functions
  - Quote: "Level 1 Constant Change Points on a Line Increasing by One Removing Objects Decreasing Rates Nonlinear Relationships Level Check Level 2 Making Predictions Finding Rates of Change Rates from Points Initial Conditions Using Two Points Level Check Level 3 Slope of a Line Change per One Identifying Slopes Graph a Line Computing Slopes Coordinates to Slope Putting it all together"
- **Levels 4 to 6: writing linear expressions, identifying linearity, writing equations of lines**
  - Source: Practice Linear Relationships | Brilliant. https://brilliant.org/courses/linear-functions
  - Quote: "Level 4 Writing Linear Expressions Proportional Relationships Base Fees Graphing Linear Functions Finding the Constant Term Finding the Linear Term Interpreting a Function Writing the Whole Expression Level 5 Identifying Linear Relationships Net Cost Setting Up Equations Drawing Conclusions Identifying Linearity Identifying Linear Relationships Level 6 Writing Equations of Lines Shifting a Line Slope of a Line Through a Point Through Two Points Point-Slope Form Using Point-Slope Form Equations in Point-Slope Form"
- **Levels 7 to 10: parallel and perpendicular, intercepts, data, inequalities**
  - Source: Practice Linear Relationships | Brilliant. https://brilliant.org/courses/linear-functions
  - Quote: "Level 7 Parallel and Perpendicular Lines Parallel Lines Equations of Parallel Lines Rewriting Equations Horizontal and Vertical Lines Perpendicular Lines Slopes of Perpendicular Lines Equations of Perpendicular Lines Level 8 Using Intercepts Standard Form of an Equation Intercepts Plotting Intercepts Writing an Equation in Standard Form Level 9 Graphing Relationships from Data Graphing Candle Height Converting Temperatures Fitting Data Locally Linear Graphing Motion Finding the Equation of Motion Level 10 Linear Inequalities Solutions to Inequalities The Boundary Line Writing Inequalities Graphing Inequalities Cost Inequalities"
- **Brilliant's description of Linear Relationships**
  - Source: Practice Linear Relationships | Brilliant. https://brilliant.org/courses/linear-functions
  - Quote: "In this course, you'll understand linear functions by exploring real-world patterns where quantities change at a constant rate. You'll find rates of change from graphs and coordinates, work backward to discover initial values, and calculate the slope of a line based on two points. You'll graph lines with any slope and confidently work with linear relationships in multiple representations"
- **Brilliant's topics covered**
  - Source: Practice Linear Relationships | Brilliant. https://brilliant.org/courses/linear-functions
  - Quote: "Recognizing linear vs. nonlinear relationships * Finding rates of change from graphs * Finding the initial value (y-intercept) of a linear function * Computing slope from two points * Graphing lines with given slopes"

My reading of the order: Brilliant starts from **change at a constant rate** (levels 1 and 2: rates, initial
conditions, "Using Two Points"), only then names **slope** (level 3: change per one, computing slopes, coordinates to
slope), then writes the **expression** from base fee and rate (4), checks for linearity (5), and only in level 6
writes **equations of lines** (through a point, through two points, point-slope form). Parallel and perpendicular
lines (7), standard form and intercepts (8) come late. Level 9 is **data**: "Fitting Data", "Locally Linear",
"Graphing Motion", "Finding the Equation of Motion". Inequalities close the course (10); Dan has them already from
Linear equations. The pictures inside each lesson are **UNCONFIRMED** (I read the course page, not a lesson).

### 1.2 Coordinate Geometry (distance, area, circles)
The blurb names this course too. It is **44 lessons in 10 levels**: Measuring Separation, Estimating Distance,
Measuring Area, Unknown Values, Selecting Shapes, Pythagoras, Using Pythagoras, Radial Distance, Circles, Shifted
Circles. Most of it is ground Dan already has (area, Pythagoras); what carries over is "Distance from Coordinates"
(level 7).

- **Brilliant's Coordinate Geometry: 44 lessons, Pythagoras from areas**
  - Source: Practice Coordinate Geometry | Brilliant. https://brilliant.org/courses/coordinate-geometry/
  - Quote: "Use coordinates and the areas of shapes to derive Pythagoras' Theorem. 44 Lessons 494 Exercises"
- **Coordinate Geometry levels 6 and 7: Pythagoras, distance from coordinates**
  - Source: Practice Coordinate Geometry | Brilliant. https://brilliant.org/courses/coordinate-geometry/
  - Quote: "Level 6 Pythagoras Pythagoras' Theorem Direct Distance Squares and Sides Demonstrating Pythagoras Proving Pythagoras Level 7 Using Pythagoras The Unknown Side Distance from the Origin Distance from the Grid Distance from Coordinates"
- **Coordinate Geometry description**
  - Source: Practice Coordinate Geometry | Brilliant. https://brilliant.org/courses/coordinate-geometry/
  - Quote: "We'll start by exploring methods to estimate the distance between two points on the coordinate plane. Next we'll use distances on the plane to calculate the area of shapes. Finally, we'll use the area of shapes to derive Pythagoras' Theorem and directly calculate straight-line distances on the plane"
- **Another listing of Coordinate Geometry gives 699 exercises (Brilliant's counts move)**
  - Source: Practice Coordinate Geometry | Brilliant (lesson page). https://brilliant.org/courses/coordinate-geometry/selecting-shapes?lesson=compound-shape-expressions
  - Quote: "Use coordinates and the areas of shapes to derive Pythagoras' Theorem. 44 Lessons 699 Exercises"

My reading: Brilliant reaches distance by building Pythagoras from areas; Dan has Pythagoras from Geometry
fundamentals, so distance and midpoint can be a single short lesson. Circles (levels 8 to 10) are not in this
course's blurb; they belong to a later course (Functions and their graphs or Quadratics). The exercise count on
Brilliant's own pages moved between two fetches (494 and 699 exercises, same 44 lessons), so quote lesson counts,
not exercise counts.

### 1.3 Where it sits in Brilliant's path
- **Where it sits in Brilliant's Algebra Fundamentals band**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/linear-relationships/
  - Quote: "GR 6–7 Coordinate Plane GR 6–7 Percents GR 6–7 Proportional Reasoning GRADES 7–9 Algebra Fundamentals Build algebra tools for success in middle grades and beyond Build algebra tools for success in middle grades and beyond GR 7–8 Linear Equations GR 7–8 Coordinate Geometry GR 8–9 Linear Relationships GR 8 Exponents and Radicals GR 8–9 Visual Algebra"
- **Brilliant's Intermediate Algebra band: Introduction to Functions then Linear Systems**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/linear-relationships/
  - Quote: "GR 8–9 Introduction to Functions GR 8–9 Linear Systems"
- **Brilliant courses page: Quadratics, Coordinate Transformations, Exponential Functions after Linear Systems**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "GR 8–9 Linear Systems New GR 9 Quadratics GR 8–9 Coordinate Transformations GR 9–10 Exponential Functions"
- **Brilliant courses page: Trigonometric Functions to Complex Numbers**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "GR 11–12 Trigonometric Functions GR 11–12 Polynomials New GR 11–12 Equations and Curves New GR 11–12 Logarithms GR 12 Polar Coordinate Plane GR 11–12 Complex Numbers"
- **Introduction to Functions assumes y = mx + c**
  - Source: Practice Introduction to Functions. https://brilliant.org/courses/introduction-to-functions
  - Quote: "Before starting this course you should have familiarity with the coordinate plane, basic algebra and linear relationships of the form y=mx + c"
- **Brilliant's SAT page: what Linear Relationships covers**
  - Source: How to prepare for the digital SAT math section | Brilliant. https://brilliant.org/resources/test-prep/how-to-prepare-for-the-digital-sat-math-section/
  - Quote: "Linear Relationships covers slope from graphs and from two points, Finding Rates of Change in context, and Perpendicular Lines"
- **Brilliant Linear Systems course starts with graph of a system**
  - Source: Practice Linear Systems | Brilliant. https://brilliant.org/courses/linear-systems
  - Quote: "Level 2 Solving Systems by Graphing Graphing Systems of Equations Slope-Intercept and Systems Point-Slope and Systems Approximate Solutions Systems with No Solution Systems with Infinitely Many Solutions"

- Before it, Brilliant's Math Foundations ends with Coordinate Plane, Percents and Proportional Reasoning; Dan has
  all three (The coordinate plane, Percentages, Proportional reasoning), and Linear equations before this course.
- After it in Brilliant: Exponents and Radicals, Visual Algebra; then Introduction to Functions, Linear Systems,
  Quadratics, Exponential Functions; then Trigonometric Functions, Polynomials, Equations and Curves, Logarithms,
  Complex Numbers (the courses page, quoted above). That matches Dan's folder order: Linear
  equations, Straight-line graphs, Linear systems, Powers and roots, Functions and their graphs, Quadratics and
  polynomials, Exponentials and logarithms, Trigonometry, Complex numbers.
- My reading: Brilliant's own Introduction to Functions says it assumes "linear relationships of the form
  y=mx + c", so y = mx + c has to be finished here, before Functions and their graphs.
- Brilliant's Linear Systems (Dan's next course) begins on graphs ("Graph of a System") and its level 2 uses
  slope-intercept and point-slope forms, so this course must leave Dan able to draw and write lines fluently.

---

## 2. Other courses' order for the same ground

### 2.1 Khan Academy, Algebra basics (Unit 4: Graphing lines and slope)
- **Khan Algebra basics unit order**
  - Source: Algebra Basics | Khan Academy. https://www.khanacademy.org/mission/algebra-basics
  - Quote: "Unit 4 Graphing lines and slope Unit 5 Systems of equations"
- **Khan Algebra basics unit 4: slope, then slope-intercept**
  - Source: Graphing lines and slope | Algebra basics | Math | Khan Academy. https://www.khanacademy.org/math/core-algebra/core-algebra-graphing-lines-slope
  - Quote: "1. Quadrants on the coordinate plane 2. Solutions to 2-variable equations 3. Complete solutions to 2-variable equations 4. Intercepts from a graph 5. Intercepts from an equation 6. Graphing lines and slope: Quiz 1 7. Slope from graph 8. Slope from two points 9. Horizontal & vertical lines 10. Graphing lines and slope: Quiz 2 11. Slope-intercept intro 12. Graph from slope-intercept form 13. Slope-intercept equation from graph 14. Slope-intercept from two points 15. Graphs of inequalities 16. Graphing lines and slope: Quiz 3 17. Graphing lines and slope: Unit test"

My reading: Khan goes coordinates, then solutions of 2-variable equations, then **intercepts**, then **slope** (from
a graph, then two points), then horizontal and vertical lines, and only then slope-intercept form (reading,
graphing, writing from a graph, then from two points). Intercepts come before slope.

### 2.2 Khan Academy, Algebra 1 (Units 4 and 5)
- **Khan Algebra 1 Unit 4: slope first, then intercepts, then context**
  - Source: Linear equations & graphs | Algebra 1 | Math | Khan Academy. https://en.khanacademy.org/math/algebra/x2f8bb11595b61c86:linear-equations-graphs
  - Quote: "Slope from graph 4. Graphing from slope 5. Slope in a table 6. Slope from two points 7. Linear equations & graphs: Quiz 1 8. Horizontal & vertical lines 9. Intercepts from a graph 10. Intercepts from an equation 11. Intercepts from a table 12. Linear equations & graphs: Quiz 2 13. Relating linear contexts to graph features 14. Using slope and intercepts in context 15. Linear equations word problems: tables 16. Linear equations word problems: graphs 17. Graphing linear relationships word problems"
- **Khan Algebra 1 Unit 5 forms of linear equations**
  - Source: Forms of linear equations | Algebra 1 | Math | Khan Academy. https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:forms-of-linear-equations
  - Quote: "1. Slope-intercept intro 2. Linear equations word problems 3. Graph from slope-intercept form 4. Forms of linear equations: Quiz 1 5. Slope-intercept equation from graph 6. Slope-intercept from two points 7. Writing linear equations word problems 8. Forms of linear equations: Quiz 2 9. Point-slope form 10. Graph from linear standard form 11. Convert linear equations to standard form 12. Slope from equation 13. Linear equations in any form"

My reading: Algebra 1 puts **slope first** (from a graph, from a table, from two points), then horizontal and
vertical lines, then intercepts, then context (what slope and intercept mean in a situation). Writing the equation
(slope-intercept, point-slope, standard form) is a separate unit after that. Both Khan orders end on "meaning in
context" before forms.

### 2.3 BBC Bitesize
- **Bitesize CCEA M3 order: general form, gradient, two points, intercept, find the equation, parallel**
  - Source: Module 3 (M3) - Algebra - Coordinates and graphs - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zjbf9ty
  - Quote: "1. General form of the equation of a line 2. Gradient and intercept 1. Gradient 3. Gradient from a graph 4. Gradient of a line joining two points 5. Intercept 6. Finding the equation of a line 7. Parallel lines"
- **Bitesize CCEA M2 coordinates: midpoint then length**
  - Source: Module 2 (M2) – Algebra - Coordinates and graphs - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z4863qt
  - Quote: "1. Midpoint of a line 2. Length of a line"
- **Bitesize Higher Maths straight line pages**
  - Source: Basics of straight lines - Rectilinear shapes - Higher Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zctppv4/revision/1
  - Quote: "1. Basics of straight lines 2. Equation of a straight line 3. Parallel lines 4. Perpendicular lines 5. Collinearity 6. Equation of medians and parallel lines 7. Point of intersection 8. Medians, altitudes and perpendicular bisectors 9. Equation of altitudes and perpendicular bisectors 10. Worked example"

My reading: Bitesize's GCSE-level order is **equation first** (y = mx + c as a rule connecting x and y), then
gradient, gradient from a graph, gradient from two points, intercept, finding the equation, parallel lines. Its
coordinates page treats midpoint and length of a line as a separate short unit. The Higher order is basics
(gradient, angle), equation, parallel, perpendicular, collinearity, then medians, altitudes and intersection.
Bitesize's pages I reached do not carry a separate "common mistakes" list; for named mistakes see section 6
(examiner reports). Bitesize's named mistakes: **UNCONFIRMED**.

### 2.4 SQA National 5 and Higher (Scotland)
- **SQA National 5: the equation of a straight line (skills)**
  - Source: Straight Line – National 5 Maths – Free Resources. https://maths.scot/nat5/straight-line
  - Quote: "Determine the gradient of a straight line, given two points * Use the formula (y!-!b!=!m(x!-!a)) or equivalent to find the equation of a straight line, given two points or one point and the gradient of the line. * Identify gradient and (y)-intercept from various forms of the equation of a straight line"
- **SQA Higher unit Mathematics 1 outcome 1: straight line**
  - Source: SQA Mathematics 1 (Higher) unit specification, D321 12. https://www.sqa.org.uk/files/nu/D32112.pdf
  - Quote: "Use the properties of the straight line. Performance criteria a) Determine the equation of a straight line given two points on the line or one point and the gradient. b) Find the gradient of a straight line using m = tan θ. c) Find the equation of a line parallel to and a line perpendicular to a given line"
- **SQA Higher course content (1996 draft): gradient from two points and the distance between them**
  - Source: SQA Higher Mathematics course and unit specifications (1996 draft edition). https://www.sqa.org.uk/files/nq/Mathematics_Higher_ed4.pdf
  - Quote: "know that the gradient of the line determined by the points ( x 1, y 1) and ( x 2, y 2) is , x 2 ≠ x 1 and that the distance between the points is"

My reading: in Scotland the straight line is two stages. National 5: gradient from two points, equation from two
points or a point and a gradient, gradient and y-intercept from the various forms. Higher adds parallel and
perpendicular lines, the angle a line makes (m = tan theta), distance, and then medians and altitudes (section 2.3).

### 2.5 HELM workbooks (Loughborough)
- **HELM Workbook 2 contents: The Straight Line section**
  - Source: HELM Workbook 2: Basic Functions, Loughborough University (2015). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "1. Basic Concepts of Functions 2 2. Graphs of Functions and Parametric Form 11 3. One-to-One and Inverse Functions 20 4. Characterising Functions 26 5. The Straight Line 36 6. The Circle 46 7. Some Common Functions"
- **HELM learning outcomes for the straight line**
  - Source: HELM Workbook 2: Basic Functions, Loughborough University (2015). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "recognise the equation of a straight line _•_ explain the significance of _a_ and _b_ in the equation of a line _f_ ( _x_ ) = _ax_ + _b_ _•_ find the gradient of a straight line given two points on the line _•_ find the equation of a straight line through two points _•_ find the distance between two points"
- **HELM: why the straight line matters in engineering**
  - Source: HELM Workbook 2: Basic Functions, Loughborough University (2015). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "Probably the most important function and graph that you will use are those associated with the straight line. A large number of relationships between engineering variables can be described using a straight line or linear graph. Even when this is not strictly the case it is often possible to approximate a relationship by a straight line"
- **HELM project note to lecturers: introduce straight lines through an engineering example** (SECONDARY)
  - Source: HELM Workbooks 46-50 guide (WB50-all), copy hosted by Imperial College London. https://nucinkis-lab.cc.ic.ac.uk/HELM/HELM_Workbooks_46-50/WB50-all.pdf
  - Quote: "When students met the topic of straight lines at school it was almost certainly not as the graphical representation of a linear function. There are examples a-plenty of linear equations in engineering and the opportunity should be taken to introduce the topic via one from the students’ discipline. Linking the solution to the graph of a straight line crossing an axis is recommended"

My reading: HELM (written for engineering students) puts the straight line inside Basic Functions: recognise the
equation, say what a and b do, gradient from two points, equation through two points, **distance between two
points**, in that order, in 11 pages. It does not list midpoint or perpendicular lines as outcomes. It says to
start from an engineering example and link the line to where it crosses an axis, which is how this course should
open.

### 2.6 Bird's engineering mathematics
- **Bird's Basic Engineering Mathematics contents: straight line graphs then reducing non-linear laws**
  - Source: Bird Basic Engineering Mathematics, 8th edition, Routledge. https://www.routledge.com/Birds-Basic-Engineering-Mathematics/Bird/p/book/9780367643676
  - Quote: "9. Basic algebra 10. Further algebra 11. Solving simple equations 12. Transposing formulae 13. Solving simultaneous equations 14. Solving quadratic equations 15. Logarithms 16. Exponential functions 17. Straight line graphs 18. Graphs reducing non-linear laws to linear form 19. Graphical solution of equations"
- **Bird's Basic Engineering Mathematics: the straight line chapter is 20 pages**
  - Source: Bird Basic Engineering Mathematics, 8th edition, Taylor & Francis chapter list. https://www.taylorfrancis.com/books/mono/10.1201/9781003124214/bird-basic-engineering-mathematics-john-bird
  - Quote: "chapter Chapter 17 | 20 pages Straight line graphs"
- **Modern Engineering Mathematics (Glyn James) contents: straight lines and least squares fit**
  - Source: Modern Engineering Mathematics (Glyn James), table of contents, Pearson. https://www.pearson.com/en-au/media/vmth4gvc/9781292335360-toc.pdf
  - Quote: "1.4.1 Coordinates 36 1.4.2 Straight lines 36 1.4.3 Circles 38"
- **Modern Engineering Mathematics: least squares fit of a linear function to experimental data**
  - Source: Modern Engineering Mathematics (Glyn James), table of contents, Pearson. https://www.pearson.com/en-au/media/vmth4gvc/9781292335360-toc.pdf
  - Quote: "2.3.2 Least squares fit of a linear function to experimental data 89"

My reading: Bird (the textbook usually set for HNC) puts Straight line graphs (chapter 17) **after** logarithms and
exponentials and right before "Graphs reducing non-linear laws to linear form" (chapter 18) and graphical solution
of equations (19). The line is, for Bird, the tool for finding laws from experimental readings. The Bird companion
solutions to this chapter are quoted in section 4.7 and 7. Modern Engineering Mathematics lists straight lines under
coordinates and geometry, and a least squares fit of a linear function to experimental data under functions.

---

## 3. What a marine engineering HNC actually uses of this topic

### 3.1 MCA Second Engineer written syllabus, Mathematics section D "Graphs" (SECONDARY host)
The syllabus is the MCA Second Engineer (STCW Reg. III/2) written mathematics list: Arithmetic, Algebra,
Logarithms, Graphs, Trigonometry, Mensuration, Differentiation, Integration. I could reach it only on
edumaritime.net, a college that republishes it, so every line below is SECONDARY; the MCA's own copy is
**UNCONFIRMED**.
- **MCA Second Engineer maths syllabus, algebra: develop linear equations from data** (SECONDARY)
  - Source: UK MCA Second Engineer STCW Reg. III/2 Written Examination Syllabus (republished by edumaritime.net). https://www.edumaritime.net/images/docs/mca-second-engineer-written-exams.pdf
  - Quote: "2.27 Develops linear equations consistent with data provided in a question, and finds the solution to these equations"
- **MCA Second Engineer maths syllabus, graphs: plotting, two points** (SECONDARY)
  - Source: UK MCA Second Engineer STCW Reg. III/2 Written Examination Syllabus (republished by edumaritime.net). https://www.edumaritime.net/images/docs/mca-second-engineer-written-exams.pdf
  - Quote: "4.6 Plots linear and non-linear graphs (scales to be given in examination). 4.7 States that for a linear graph, only two plotting points are required"
- **MCA Second Engineer maths syllabus, graphs: the law of a straight line graph** (SECONDARY)
  - Source: UK MCA Second Engineer STCW Reg. III/2 Written Examination Syllabus (republished by edumaritime.net). https://www.edumaritime.net/images/docs/mca-second-engineer-written-exams.pdf
  - Quote: "4.8 States that plotting points may be given in the form: x = 1, y = 2, or (1,2). 4.9 States that the law of a straight line graph is of the form: y = ax + b, and defines a and b"
- **MCA Second Engineer maths syllabus, graphs: y = aX^2 + b as a straight line, pV^n = C** (SECONDARY)
  - Source: UK MCA Second Engineer STCW Reg. III/2 Written Examination Syllabus (republished by edumaritime.net). https://www.edumaritime.net/images/docs/mca-second-engineer-written-exams.pdf
  - Quote: "4.10 Writes the equation y = aX ² + b in the form of a straight line. 4.11 Solves graphically problems of the form pV n = C, where n is unknown"
- **MCA Second Engineer maths syllabus, graphs: axes and variables** (SECONDARY)
  - Source: UK MCA Second Engineer STCW Reg. III/2 Written Examination Syllabus (republished by edumaritime.net). https://www.edumaritime.net/images/docs/mca-second-engineer-written-exams.pdf
  - Quote: "4.1 States that graph axis are abscissa and ordinate, and indicates their positions. 4.2 Defines the dependent and independent variables"

My reading: the examinable idea is "the **law of a straight line**", y = ax + b with a and b defined, plus plotting
from two points, plus changing y = aX^2 + b into a straight line by plotting against X = x^2, and pV^n = C. The
last two are reductions to linear form; they need powers and logs and belong to Exponentials and logarithms (and
Powers and roots). This course should end by naming them and handing on.

### 3.2 The same lines as they show up in the other MCA subjects (SECONDARY host, as above)
- **MCA Second Engineer applied mechanics: law of a machine by graphical and analytical methods** (SECONDARY)
  - Source: UK MCA Second Engineer STCW Reg. III/2 Written Examination Syllabus (republished by edumaritime.net). https://www.edumaritime.net/images/docs/mca-second-engineer-written-exams.pdf
  - Quote: "10.13 Explains the law of a machine. 10.14 Determines the law of a machine by both graphical and analytical methods"
- **MCA Second Engineer applied mechanics: load/extension graph from experimental data** (SECONDARY)
  - Source: UK MCA Second Engineer STCW Reg. III/2 Written Examination Syllabus (republished by edumaritime.net). https://www.edumaritime.net/images/docs/mca-second-engineer-written-exams.pdf
  - Quote: "11.9 Draws a load/extension graph from experimental data and from it obtain: E, UTS yield stress, limit of proportionality, % area reduction, % elongation"
- **MCA Second Engineer applied mechanics: limit of proportionality on the load/extension graph** (SECONDARY)
  - Source: UK MCA Second Engineer STCW Reg. III/2 Written Examination Syllabus (republished by edumaritime.net). https://www.edumaritime.net/images/docs/mca-second-engineer-written-exams.pdf
  - Quote: "11.6 Sketches the load/extension graph for mild steel loaded in tension to destruction and indicates: limit of proportionality, elastic limit, yield point, ultimate load and breaking load"
- **MCA Second Engineer electro-technology: how temperature affects conductors** (SECONDARY)
  - Source: UK MCA Second Engineer STCW Reg. III/2 Written Examination Syllabus (republished by edumaritime.net). https://www.edumaritime.net/images/docs/mca-second-engineer-written-exams.pdf
  - Quote: "1.5 Appreciates how temperature affects conductors, semi-conductors and insulators"
- **MCA Second Engineer electro-technology: change in conductor resistance from the temperature coefficient** (SECONDARY)
  - Source: UK MCA Second Engineer STCW Reg. III/2 Written Examination Syllabus (republished by edumaritime.net). https://www.edumaritime.net/images/docs/mca-second-engineer-written-exams.pdf
  - Quote: "1.7 Calculates change in conductor resistance using the temperature coefficients"
- **MCA Second Engineer electro-technology: Ohm's law** (SECONDARY)
  - Source: UK MCA Second Engineer STCW Reg. III/2 Written Examination Syllabus (republished by edumaritime.net). https://www.edumaritime.net/images/docs/mca-second-engineer-written-exams.pdf
  - Quote: "2.1 States Ohms Law. 2.2 Solves problems on 2.1"
- **MCA Second Engineer applied heat: linear expansion** (SECONDARY)
  - Source: UK MCA Second Engineer STCW Reg. III/2 Written Examination Syllabus (republished by edumaritime.net). https://www.edumaritime.net/images/docs/mca-second-engineer-written-exams.pdf
  - Quote: "4.1 Defines the coefficient of linear expansion. 4.2 States the equation of linear expansion/contraction"

My reading: Applied Mechanics asks Dan to **draw a graph from experimental readings and read quantities off it**
(E, yield stress, limit of proportionality) and to **find the law of a machine graphically**; Electro-technology asks
for temperature effects on resistance and Ohm's law; Applied Heat the coefficient of linear expansion. Each is a
straight line with a gradient that means something. Extension against load, effort against load, resistance against
temperature and voltage against current are the four natural contexts.

### 3.3 Route and the oral syllabus
- **MSN 1857: HND/HNC route lists Mathematics, Applied Mechanics, Applied Heat, Electrotechnology**
  - Source: MSN 1857 (M), Maritime and Coastguard Agency, certificates of competency for engineer officers (GOV.UK PDF). https://assets.publishing.service.gov.uk/media/5a80116fe5274a2e8ab4dfe4/MSN_1857.pdf
  - Quote: "University Graduates or Higher National Diploma (HND)/Higher National Certificate (HNC) holders (preferably in Mechanical or Marine Engineering or in an engineering subject that at least covers four of the following 6 subjects: Mathematics, Engineering Drawing, Applied Mechanics, Applied Heat, Electrotechnology and Naval"
- **SQA Second Engineer academic exams include Mathematics**
  - Source: MSN 1857 (M), Maritime and Coastguard Agency, certificates of competency for engineer officers (GOV.UK PDF). https://assets.publishing.service.gov.uk/media/5a80116fe5274a2e8ab4dfe4/MSN_1857.pdf
  - Quote: "Second Engineer: Mathematics, Applied Mechanics, Applied Heat, Engineering Drawing, Electro Technology and Naval Architecture"
- **MGN 69 withdrawn, replaced by MIN 653 and MIN 654**
  - Source: [Withdrawn] MGN 69 Oral examination syllabuses, GOV.UK. https://www.gov.uk/government/publications/mgn-69-oral-examination-syllabi
  - Quote: "MGN 69 has been replaced by MIN 653 (M) Deck Oral Exam Syllabus and MIN 654 (M) Engineering and Electro-technical Officer Oral Exam Syllabus"
- **MIN 654: the engineering knowledge listed for engineer officers (electro-technology)**
  - Source: MIN 654 (M) Amendment 1: Engineering and Electro-technical Officer Oral Exam Syllabus (April 2026), Maritime and Coastguard Agency. https://assets.publishing.service.gov.uk/media/69e78cff606c20d4121631df/MIN_654_Engineering_and_Electro-technical_Officer_Oral_Exam_Syllabus_-_Amendment_1__April_2026_.pdf
  - Quote: "Knowledge of:_ Electro-technology and electrical machines theory Fundamentals of electronics and power electronics"

- My reading: the HNC/HND route to a Second Engineer certificate is read by the MCA by subject (Mathematics,
  Engineering Drawing, Applied Mechanics, Applied Heat, Electrotechnology, Naval Architecture), which fits Dan's
  list of HNC units.
- The oral syllabus is now MIN 654 (it replaced MGN 69). The excerpts I could reach list electro-technology and
  machinery knowledge, with no mathematics line. A maths or "Applied Mathematics" line in MIN 654 is
  **UNCONFIRMED**. The "General Engineering Science" syllabus lines are **UNCONFIRMED** (I did not reach a page that
  lists them).

### 3.4 Pearson BTEC HN (Unit 4002 Engineering Mathematics)
- **Pearson 2024 Unit 4002: P1 to P3 criteria**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "P1 Apply dimensional analysis techniques to solve complex engineering/manufacturing problems. P2 Generate answers from engineering arithmetic and geometric progressions. P3 Determine solutions of engineering equations using exponential, logarithmic, trigonometric, and hyperbolic functions"
- **Pearson 2024 Unit 4002: sinusoidal and vector criteria**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "P6 Solve engineering/ manufacturing problems relating to sinusoidal functions. P7 Use appropriate methodology to determine engineering parameters of data represented in vector form"
- **Pearson 2024 Unit 4002: LO4 calculus and rates of change**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "LO4 Examine how differential and integral calculus can be used to solve engineering and manufacturing sector problems"
- **Pearson 2024 Unit 4002: P8 rates of change**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "P8 Examine rates of change for a range of mathematical functions"
- **Pearson earlier HN Analytical Methods unit: linear regression for engineering**
  - Source: Pearson BTEC Higher Nationals units, Unit 1 Analytical Methods for Engineers (2010 specification). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/Operations-Engineering/2010/Specification/9781446955215-HNCD-L45-in-Engineering-units-Iss3.pdf
  - Quote: "Regression, linear correlation: determine linear correlation coefficients and regression lines and apply linear regression and product moment correlation to a variety of engineering situations"
- **Pearson BTEC Level 3 Engineering: y = mx + c and straight-line graph**
  - Source: Specification - Pearson BTEC Level 3 National Extended Diploma in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/spec-btec-nat-eng-extdip.pdf
  - Quote: "Linear equations and straight line graphs: o linear equations of the form y = mx + c o straight-line graph (coordinates on a pair of labelled Cartesian axes, positive or negative gradient, intercept, plot of a straight line"
- **Pearson Level 3: line of regression y = mx + c from scatter diagrams**
  - Source: Specification - Pearson BTEC Level 3 National Extended Diploma in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/spec-btec-nat-eng-extdip.pdf
  - Quote: "linear relationship between independent and dependent variables, scatter diagrams, approximate equation of line of regression y = mx + c represented graphically"
- **Pearson HN Manufacturing spec: GCSE grade 4 and diagnostic maths**
  - Source: BTEC Higher Nationals in Manufacturing Engineering for England: Specification (Pearson). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/manufacturing-engineering-for-england/2024/specification/9781292448497-btec-hn-l4-l5-man-engin-england.pdf
  - Quote: "Some aspects of engineering require mathematics skills and we strongly recommend that all students complete diagnostic mathematics assessments, preferably before beginning a Higher National course, as well as having an A* to C grade GCSE Maths or 9 to 4 in GCSE Maths"

- Unit 4002's pass criteria (2024 descriptor, quoted above) cover dimensional analysis, progressions, engineering
  equations with exponential, logarithmic, trigonometric and hyperbolic functions, sinusoidal and vector problems,
  and rates of change and integration. Its LO2 content is said to list "Linear regression" and "Coordinate systems and reference frames"; the
  page returned that paragraph only inside a very large read that is not stored in `tools/`, so those two phrases
  are **UNCONFIRMED** here. The straight line is not an explicit item in 4002; it is assumed (Level 3 BTEC Engineering
  lists y = mx + c, gradient and intercept; GCSE grade 4 is the entry).
- My reading: for HN students the line is **prior knowledge that regression and calculus build on**: P8 "rates of
  change" is a gradient, and the 2010 Pearson unit applies "linear regression" to engineering situations. So
  confidence with gradient, intercept and fitting is the point, not new theory.

### 3.5 SQA HN Engineering Mathematics (Scotland)
- **SQA HN Engineering Mathematics 1 (SCQF 6): outcomes**
  - Source: Engineering Mathematics 1 (SCQF level 6) Unit code: H7K0 33. https://www.sqa.org.uk/files/hn/H7K033.pdf
  - Quote: "1 Solve problems involving functions and trigonometric equations. 2 Solve problems involving exponential and logarithmic equations. 3 Apply mathematical techniques involving vectors and complex numbers"
- **SQA HN Engineering Mathematics 1 (SCQF 6): entry skills include transposing engineering formulae**
  - Source: Engineering Mathematics 1 (SCQF level 6) Unit code: H7K0 33. https://www.sqa.org.uk/files/hn/H7K033.pdf
  - Quote: "Entry requirements are at the discretion of the centre. However, it would be advantageous if learners had good algebraic skills together with an ability to transpose engineering formulae and solve simple trigonometric equations"
- **SQA HN Mechanical/Manufacturing framework: recommends a maths unit for candidates with little maths**
  - Source: SQA arrangements document: HNC/HND Mechanical Engineering and Manufacturing Engineering. https://www.sqa.org.uk/files_ccc/HN_Mech_and_ManEng_Arrangements.pdf
  - Quote: "Qualification Development Team would strongly recommend that candidates with little Mathematical skills do the Mathematics for Engineering 1: Mechanical and Manufacture Unit as part of their optional studies"
- **SQA Introductory Mathematics for Engineering: algebraic techniques and an exemplar about a law in a circuit**
  - Source: SQA Higher National unit specification: Introductory Mathematics for Engineering (unit 7481997). http://www.sqa.org.uk/files/hn/D7481997.pdf
  - Quote: "apply standard algebraic techniques to solve equations and to manipulate expressions occurring in engineering theory"

- My reading: SQA's Engineering Mathematics 1 (SCQF 6, H7K0 33) is functions, trigonometric equations,
  exponentials and logarithms, vectors and complex numbers. The straight line is not an outcome; the entry advice
  names "good algebraic skills" and transposing formulae, which Dan's Linear equations covers. The SCQF 7 unit
  (H7K0 34) was not reached: **UNCONFIRMED**.
- The older Higher Mathematics 1 specification in section 2.4 is the SQA wording for gradient, equation, parallel,
  perpendicular and distance. SQA also states a Higher course objective of "using a straight-line graph to confirm
  relationships" (section 4.8).

---

## 4. Scope, and what research says about each part

### 4.1 Gradient as rise over run, from any two points
- **Gradient from two points (Bitesize CCEA)**
  - Source: Module 3 (M3) - Algebra - Coordinates and graphs - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zjbf9ty
  - Quote: "To find the gradient of a line joining two points, divide the difference in the y-coordinates by the difference in the x-coordinates"
- **Gradient formula (HELM key point)**
  - Source: HELM Workbook 2: Basic Functions, Loughborough University (2015). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "A common requirement is to find the gradient of a line when we know the coordinates of two points on it"
- **HELM: the coefficient of x gives the gradient or slope**
  - Source: HELM Workbook 2: Basic Functions, Loughborough University (2015). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "The coefficient of _x_ gives the gradient or slope of the line"
- **Bitesize: gradient measures steepness; larger m is steeper**
  - Source: Module 3 (M3) - Algebra - Coordinates and graphs - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zjbf9ty
  - Quote: "In the equation (y = mx + c), (m) is the gradient of the line. The gradient is a measure of how steep the line is"

My reading: Dan has straight lines through zero from The coordinate plane, so gradient is "y per x" for lines that
start at the origin. The new parts are (a) any two points, not just the origin, (b) signs of the differences, and
(c) the meaning as a rate with units. Section 6.1 explains why "per one" and "rise over run" both need teaching.

### 4.2 Positive, negative, zero and undefined gradients
- **Bitesize: positive and negative gradients**
  - Source: Module 3 (M3) - Algebra - Coordinates and graphs - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zjbf9ty
  - Quote: "A line which slopes from bottom left to top right has a positive gradient. A line which slopes from top left to bottom right has a negative gradient"
- **HELM: a positive, negative or zero**
  - Source: HELM Workbook 2: Basic Functions, Loughborough University (2015). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "a positive value of _a_ produces a graph which slopes upwards from left to right. A negative value of _a_ produces a graph which slopes downwards from left to right. If _a_ is zero the line is horizontal, that is its gradient is zero"
- **Bitesize N5: vertical lines have an undefined gradient**
  - Source: Determine the gradient of a straight line. https://www.bbc.co.uk/bitesize/guides/z8383k7/revision/3
  - Quote: "Vertical lines have a gradient which is undefined; equation x = a"
- **Bitesize Higher: lines parallel to the y-axis, write the equation down**
  - Source: Parallel lines - Rectilinear shapes - Higher Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zctppv4/revision/3
  - Quote: "The gradient of a line which is parallel to the \(y\)-axis cannot be determined from the above formulae. Just write the equation down"

My reading: horizontal lines have gradient zero and equation y = c; vertical lines have no gradient (undefined) and
equation x = a. Both are known sticking points (section 6.1).

### 4.3 y = mx + c and the intercept
- **Bitesize: y = mx + c is a rule connecting x and y, true for all points**
  - Source: Module 3 (M3) - Algebra - Coordinates and graphs - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zjbf9ty
  - Quote: "The equation is a rule connecting the (x) and (y) coordinates - the rule is true for all points on the line"
- **Bitesize: the intercept**
  - Source: Module 3 (M3) - Algebra - Coordinates and graphs - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zjbf9ty
  - Quote: "The y coordinate at the point where it crosses the y axis is called the intercept . In the equation y = mx + c , c is the intercept"
- **HELM: the coefficient of x gives the gradient; a and b in f(x) = ax + b**
  - Source: HELM Workbook 2: Basic Functions, Loughborough University (2015). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "In the linear function _f_ ( _x_ ) = _ax_ + _b_ , _a_ is the gradient and _b_ is the vertical intercept"

My reading: the BBC wording "a rule connecting the x and y coordinates, true for all points on the line" is the
right idea to teach: a point is on the line if and only if the rule holds, which Dan can test by substituting
(he has Solving equations and Linear equations). The intercept is the value of y when x is zero; units of m are
"units of y per unit of x", units of c are the units of y.

### 4.4 The equation from two points, or a point and a gradient
- **HELM: a straight line is fixed by two points**
  - Source: HELM Workbook 2: Basic Functions, Loughborough University (2015). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "The graph of a linear function is always a straight line. Such a graph can be plotted by finding just two distinct points and joining these with a straight line"
- **Bitesize National 5: line from a gradient and a point**
  - Source: Equation of a straight line - Determining the equation of a straight line - National 5 Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z24qcj6/revision/1
  - Quote: "We can find the equation of a straight line when given the gradient and a point on the line by using the formula : (y - b = m(x - a)) where (m) is the gradient and ((a,b)) is on the line"
- **Bitesize CCEA: find the equation from gradient and a point**
  - Source: Module 3 (M3) - Algebra - Coordinates and graphs - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zjbf9ty
  - Quote: "A straight line has a gradient of -2 and goes through the point P with coordinates (-3, 2). What is the equation of the line"

My reading: two routes exist. y = mx + c with substitution to find c (Bitesize CCEA, HELM; uses only Linear equations),
and y - b = m(x - a) (Scottish National 5 and Higher; uses brackets, which Dan has). The first is easier to
explain from "m per x, then where does it start"; the second avoids the y-intercept confusion in section 6.3.

### 4.5 Parallel lines (perpendicular lines only if the HNC lines ask)
- **Bitesize Higher: parallel lines have equal gradients**
  - Source: Parallel lines - Rectilinear shapes - Higher Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zctppv4/revision/3
  - Quote: "Key fact Parallel lines have equal gradients"
- **Bitesize CCEA: parallel lines have the same gradient**
  - Source: Module 3 (M3) - Algebra - Coordinates and graphs - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zjbf9ty
  - Quote: "As mentioned in the introduction, parallel lines have the same gradient"
- **SQA Higher unit: perpendicular gradients m1 m2 = -1**
  - Source: SQA Mathematics (Higher) course and unit specifications, 6th edition. http://www.sqa.org.uk/files/nq/Mathematics_Higher_6th%20Edition.pdf
  - Quote: "know that the gradients of parallel lines are equal know that the lines with non-zero gradients m 1 and m 2 are perpendicular if and only if m 1 m 2 = –1"

My reading: parallel lines are in every course and in the exam reports (section 6.3). Perpendicular lines are in
Brilliant (level 7) and the SQA Higher unit, but they are not in the MCA mathematics lines, the HELM outcomes, or
Pearson 4002 (all quoted above). I would give them one worked aside at most, or leave them to Trigonometry.

### 4.6 Distance between two points and the midpoint
- **HELM: distance between two points by Pythagoras**
  - Source: HELM Workbook 2: Basic Functions, Loughborough University (2015). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "the distance between the points _A_ ( _x_ 1 _, y_ 1) and _B_ ( _x_ 2 _, y_ 2) is given using Pythagoras’ theorem by the following formula"
- **Bitesize CCEA: midpoint is the average of the coordinates**
  - Source: Module 2 (M2) – Algebra - Coordinates and graphs - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z4863qt
  - Quote: "To find the midpoint of a line between two sets of coordinates, find the average of the (x)-axis coordinates and the average of the (y)-axis coordinates"
- **Bitesize CCEA: length of a line from subtracting coordinates and Pythagoras**
  - Source: Module 2 (M2) – Algebra - Coordinates and graphs - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z4863qt
  - Quote: "To find the length of a line between points * Subtract the (x)-coordinates * Subtract the (y)-coordinates * Apply Pythagoras' theorem to these values"
- **Bitesize CCEA: read the coordinates and Pythagoras guides first**
  - Source: Module 2 (M2) – Algebra - Coordinates and graphs - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z4863qt
  - Quote: "Before you start, it may be helpful to read the guide on coordinates and graphs from M1 and the guide on Pythagoras' theorem from M2"

My reading: Dan has Pythagoras, so the distance formula is only "subtract, square, add, square root" on a grid. The
midpoint is the average of each coordinate; it is in Bitesize and SQA Higher but not HELM or the MCA list, so keep
it short.

### 4.7 Fitting a line to experimental readings to find a law
- **Bird's solutions: experimental values, plot W against P and find P = aW + b**
  - Source: Bird, Engineering Mathematics: worked solutions to exercises, Chapter 31 Straight line graphs (Routledge companion). https://s3-eu-west-1.amazonaws.com/s3-euw1-ap-pe-ws4-cws-documents.ri-prod/9780415662840/answers/UEM_Sol_to_Exerc_Chap_031.pdf
  - Quote: "Plot W horizontally against P vertically and show that the values lie approximately on a straight line. Determine the probable relationship connecting P and W in the form P = aW + b"
- **Bird's solutions: voltage against speed from readings**
  - Source: Bird, Engineering Mathematics: worked solutions to exercises, Chapter 31 Straight line graphs (Routledge companion). https://s3-eu-west-1.amazonaws.com/s3-euw1-ap-pe-ws4-cws-documents.ri-prod/9780415662840/answers/UEM_Sol_to_Exerc_Chap_031.pdf
  - Quote: "speed (horizontally) against voltage (vertically) and find this value. Find also (a) the speed at a voltage of 132 V and (b) the voltage at a speed of 1300 rev/min"
- **SERC: a best-fit line mimics the trend and may not pass through many points**
  - Source: How Do I Construct a Straight Line through Data Points? Best-Fit Lines. https://serc.carleton.edu/mathyouneed/graphing/bestfit.html
  - Quote: "A best-fit line is meant to mimic the trend of the data. In many cases, the line may not pass through very many of the plotted points. Instead, the idea is to get a line that has equal numbers of points on either side. Most people start by eyeballing the data"
- **Brilliant lessons: Fitting Data, Locally Linear**
  - Source: Practice Linear Relationships | Brilliant. https://brilliant.org/courses/linear-functions
  - Quote: "Level 9 Graphing Relationships from Data Graphing Candle Height Converting Temperatures Fitting Data Locally Linear Graphing Motion Finding the Equation of Motion"

My reading: this is the point of the course for an engineering student: from meter readings, find the law
(P = aW + b for a lifting machine, voltage against speed for a generator, V = IR for a resistor) and say what the
gradient and intercept are as physical quantities with units (section 7). The line of best fit by eye is the
method used in school (SERC) and in Bird; least squares (Pearson 2010 unit, Modern Engineering Mathematics) is the
HN follow-up, which belongs with the statistics in Pearson 4002 rather than here.

### 4.8 Reducing a curved law to a straight line with logs belongs to Exponentials and logarithms
- **Pearson A level: plot log y against log x to get a straight line**
  - Source: A level Mathematics Specification - Pearson qualifications. https://qualifications.pearson.com/content/dam/pdf/A%20Level/Mathematics/2017/specification-and-sample-assesment/a-level-l3-mathematics-specification-issue4.pdf
  - Quote: "Plot log y against log x and obtain a straight line where the intercept is log a and the gradient is n"
- **Bird: Graphs reducing non-linear laws to linear form is its own chapter**
  - Source: Bird Basic Engineering Mathematics, 8th edition, Routledge. https://www.routledge.com/Birds-Basic-Engineering-Mathematics/Bird/p/book/9780367643676
  - Quote: "17. Straight line graphs 18. Graphs reducing non-linear laws to linear form 19. Graphical solution of equations"
- **1996 SQA Higher draft: use a straight line graph to confirm a power or exponential law**
  - Source: SQA Higher Mathematics course and unit specifications (1996 draft edition). https://www.sqa.org.uk/files/nq/Mathematics_Higher_ed4.pdf
  - Quote: "use a straight line graph to confirm a relationship of the form y = ax b , also y = ab x"
- **1996 SQA Higher draft: from experimental data draw log y against log x**
  - Source: SQA Higher Mathematics course and unit specifications (1996 draft edition). https://www.sqa.org.uk/files/nq/Mathematics_Higher_ed4.pdf
  - Quote: "From experimental data draw a graph of log y against log x and deduce values of a and b such that y = ax b"

Say so in the course: "y = ax^n and y = ab^x become straight lines on log paper" is taught in Exponentials and
logarithms. In this course the straight line is the end of the road; the hand-off is one sentence and a promise
(Bird makes it a separate chapter, 18). Likewise y = aX^2 + b (plot y against x^2) needs only substitution, not
logs, and could be shown as a two-minute extension, but it can wait for Powers and roots.

---

## 5. Prerequisites

- **Khan Algebra basics unit 4 begins with quadrants on the coordinate plane**
  - Source: Graphing lines and slope | Algebra basics | Math | Khan Academy. https://www.khanacademy.org/math/core-algebra/core-algebra-graphing-lines-slope
  - Quote: "Use the power of algebra to understand and interpret points and lines (something we typically do in geometry). Topics you'll explore include the slope and the equation of a line"
- **Brilliant Coordinate Plane then Percents then Proportional Reasoning precede Algebra Fundamentals**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/linear-relationships/
  - Quote: "GR 6–7 Negative Numbers GR 6–7 Coordinate Plane GR 6–7 Percents GR 6–7 Proportional Reasoning"
- **Brilliant Linear Relationships level 1: constant change, points on a line**
  - Source: Practice Linear Relationships | Brilliant. https://brilliant.org/courses/linear-functions
  - Quote: "Level 1 Constant Change Points on a Line Increasing by One Removing Objects Decreasing Rates Nonlinear Relationships Level Check"
- **HELM: engineering variables change with time or place**
  - Source: HELM Workbook 2: Basic Functions, Loughborough University (2015). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "In engineering there are many quantities that change their value as time changes. For example, the temperature of a furnace may change with time as it is heated. Similarly, there are many quantities that change their value as the location of a point of interest changes. For example, the shear stress in a bridge girder will vary from point to point across the bridge. A quantity whose value can change is known as a variable"

What this topic leans on, with what Dan already has from the built courses (my reading, from the course list in the
task and section 1 to 4):
- **Points, scales and reading graphs, straight lines through zero**: The coordinate plane. Not taught again.
- **Pythagoras**: Geometry fundamentals. Used for distance.
- **Rearranging formulas, equations with brackets, like terms**: Linear equations. Used to find c, to put 2y = 3x - 8 into
  y = mx + c, and for y - b = m(x - a).
- **Negative numbers and fractions**: Negative numbers and Fractions, for signs in x2 - x1 and gradients like -2/5.
- **Constant ratio (y = kx)**: Proportional reasoning. This is the gradient's meaning for a line through zero.
- **Rates and the idea that a gradient is a rate of change**: Calculus fundamentals. My reading: this course can use it
  as a callback (the derivative of a straight line is its gradient, constant everywhere) without re-teaching it.
- Must be taught inline: the two-point gradient formula (consistent order, signs); undefined gradient for vertical
  lines; "where it crosses the y-axis" as the value at x = 0; the midpoint as an average; units on m and c;
  fitting by eye and the idea that a fitted line need not pass through any of the points; extrapolation and the
  limit of proportionality.

---

## 6. Misconceptions and learning science, by skill

### 6.1 Slope and intercept (research)
- **Slope as a ratio is hard; x over y vs y over x (Stump, Barr, via Isiksal-Askar summary)** (SECONDARY)
  - Source: Investigation of Eighth-Grade Students Understanding of the Slope of the Linear Function (ERIC ED561782). https://files.eric.ed.gov/fulltext/ED561782.pdf
  - Quote: "It may be difficult for students to consider the slope as ratio if m is an integer and whether slope is computed as “ x over y ” or “ y over x"
- **x-intercept used in place of m or b (Moschkovich 1996)** (SECONDARY)
  - Source: Investigation of Eighth-Grade Students Understanding of the Slope of the Linear Function (ERIC ED561782). https://files.eric.ed.gov/fulltext/ED561782.pdf
  - Quote: "Moschkovich (1996) determined that one of the students’ conceptions in this domain is that the x -intercept is relevant for equations of form y = mx + b , either in place of m or in place of b"
- **Slope better understood as rate of change than as steepness (Stump 2001)** (SECONDARY)
  - Source: Investigation of Eighth-Grade Students Understanding of the Slope of the Linear Function (ERIC ED561782). https://files.eric.ed.gov/fulltext/ED561782.pdf
  - Quote: "Stump (2001) found that the students demonstrated a better understanding of slope as a measure of rate of change than as a measure of steepness"
- **Slope of horizontal and vertical lines (Turkish 8th graders)** (SECONDARY)
  - Source: Investigation of Eighth-Grade Students Understanding of the Slope of the Linear Function (ERIC ED561782). https://files.eric.ed.gov/fulltext/ED561782.pdf
  - Quote: "Thus, it can be said that some students have misconceptions and mistakes about the slope of a line that is parallel to the _y-_ axis and _x_ -axis in a Cartesian coordinate plane"
- **Graph to equation is harder than equation to graph** (SECONDARY)
  - Source: Investigation of Eighth-Grade Students Understanding of the Slope of the Linear Function (ERIC ED561782). https://files.eric.ed.gov/fulltext/ED561782.pdf
  - Quote: "Markovits et al. (1983) also found translation from graph to equations to be more difficult than the reverse when the functions were familiar"
- **Only 5% of 17-year-olds could write the equation from a graph with intercepts marked** (SECONDARY)
  - Source: Investigation of Eighth-Grade Students Understanding of the Slope of the Linear Function (ERIC ED561782). https://files.eric.ed.gov/fulltext/ED561782.pdf
  - Quote: "only 18% of 17-year-olds produced a correct graph corresponding to a linear equation. However, the reverse translation was even more difficult. Given a graph of a straight line with two intercept points indicated, only 5% of 17-year-olds could generate the equation"
- **Recommendation: many graphs with their equations; relate graph to parameters** (SECONDARY)
  - Source: Investigation of Eighth-Grade Students Understanding of the Slope of the Linear Function (ERIC ED561782). https://files.eric.ed.gov/fulltext/ED561782.pdf
  - Quote: "students should be provided with the opportunity to view many graphs and their corresponding equations and to examine the relationship between graphical representations and algebraic parameters"
- **Slope misconceptions can lead to later difficulties in functions, limits, derivatives and integrals** (SECONDARY)
  - Source: Investigation of Eighth-Grade Students Understanding of the Slope of the Linear Function (ERIC ED561782). https://files.eric.ed.gov/fulltext/ED561782.pdf
  - Quote: "The misconceptions and deficiencies of the students in linear functions also may lead to severe learning difficulties in the subjects of functions, limit, derivation, and integral through high school and the university years"

Note: these lines come from a paper in the ERIC archive (ED561782) that summarises older studies (Barr 1980, Stump 1996 and 2001, Moschkovich
1996, Kerslake 1981 and others); the older studies themselves were **not** opened, so the paper is the SECONDARY
route to them. Section 4.4 and 6.3 are the same errors seen in exams.

### 6.2 Reading graphs (research)
- **Graph-as-picture, slope/height confusion and four others (Clement, McDermott et al.)**
  - Source: Students graphing misconceptions: graph as picture, slope/height confusion (ERIC ED264127). https://files.eric.ed.gov/fulltext/ED264127.pdf
  - Quote: "The following types of misconceptions were identified: graph as picture, slope/height confusion, centering on one variable only, linearity of scale, initial positioning at the zero point on the axis, and a static (rather than dynamic) conception of graphs"
- **Slope/height confusion in a temperature graph: only 3 of 14 correct**
  - Source: Students graphing misconceptions: graph as picture, slope/height confusion (ERIC ED264127). https://files.eric.ed.gov/fulltext/ED264127.pdf
  - Quote: "Only three of fourteen subjects correctly answered the questions of this problem. Of the other eleven, five confused greatest rise or fall with highest or lowest point on the graph"
- **College students read graphs as pictures and superimpose physical knowledge**
  - Source: Students graphing misconceptions: graph as picture, slope/height confusion (ERIC ED264127). https://files.eric.ed.gov/fulltext/ED264127.pdf
  - Quote: "There is a strong tendency among students to view graphs as pictures rather than as symbolic representa- tions, and a tendency to incorrectly superimpose existing knowledge about a physical phenomenon upon the graphing problem"
- **Leinhardt, Zaslavsky and Stein review: intuitions, misconceptions, teaching by sequences and examples**
  - Source: Functions, Graphs, and Graphing: Tasks, Learning, and Teaching - Gaea Leinhardt, Orit Zaslavsky, Mary Kay Stein, 1990. https://journals.sagepub.com/doi/10.3102/00346543060001001
  - Quote: "The review also analyzes the nature of learning in terms of intuitions and misconceptions, and the plausible approaches to teaching through sequences, explanations, and examples"

My reading: "slope/height confusion" (the steepest part of the temperature graph is mistaken for the highest) is the
mistake to design against when Dan reads a V against I or load against extension graph: slope is how fast, height is
how much. NCTM and AQA sources on this were not reached: **UNCONFIRMED**.

### 6.3 Where exam candidates lose marks on gradients and equations (examiner reports)
- **Edexcel GCSE examiners: write the gradient formula first**
  - Source: Pearson Edexcel GCSE Mathematics (1MA1) Higher Paper 1H Examiners Report, June 2024. https://qualifications.pearson.com/content/dam/pdf/GCSE/Mathematics/2015/Exam-materials/1ma1-1h-pef-20240822.pdf
  - Quote: "Students should be encouraged to write down the formula for a gradient before applying it as this may minimise the use of incorrect values"
- **Edexcel GCSE examiners: x intercept used instead of y intercept**
  - Source: Pearson Edexcel GCSE Mathematics (1MA1) Higher Paper 1H Examiners Report, June 2024. https://qualifications.pearson.com/content/dam/pdf/GCSE/Mathematics/2015/Exam-materials/1ma1-1h-pef-20240822.pdf
  - Quote: "where the x intercept was used rather than the y intercept"
- **Edexcel GCSE examiners: some did not know parallel lines have the same gradient**
  - Source: Pearson Edexcel GCSE Mathematics (1MA1) Higher Paper 1H Examiners Report, June 2024. https://qualifications.pearson.com/content/dam/pdf/GCSE/Mathematics/2015/Exam-materials/1ma1-1h-pef-20240822.pdf
  - Quote: "It was clear that some students did not know that parallel lines have the same gradient"
- **Edexcel IGCSE examiners: gradient sign missed; x and y mixed up**
  - Source: Pearson Edexcel International GCSE Mathematics B (4MB1) Paper 01 Examiners Report, November 2024. https://qualifications.pearson.com/content/dam/pdf/International-GCSE/Mathematics-B/2016/Exam-materials/4mb1-01-pef-20250123.pdf
  - Quote: "a few students failed to realise that the gradient was negative so an incorrect gradient of 2 was seen"
- **OCR MEI examiners: ignoring the negative sign of a negative gradient**
  - Source: OCR A Level Mathematics B (MEI) H640/01 Examiners report, Summer 2022. https://www.ocr.org.uk/Images/687928-examiners-report-pure-mathematics-and-mechanics.pdf
  - Quote: "The most common error was to ignore the negative sign, despite seeing the negative gradient of that part of the graph"
- **OCR GCSE examiners: told the gradient but did not write y = -2x + c**
  - Source: OCR GCSE (9-1) Mathematics J560/04 Examiners report, November 2023. https://www.ocr.org.uk/Images/722462-examiners-report-paper-4.pdf
  - Quote: "Although candidates were told that the gradient was - 2, we did not see many responses with the equation y = - 2 x + c"
- **Cambridge International examiners: brackets round the difference of y-coordinates**
  - Source: Cambridge International AS and A Level 9709 Mathematics, June 2015 Principal Examiner Report for Teachers. https://www.cambridgeinternational.org/Images/348170-june-2015-examiner-report.pdf
  - Quote: "A common mistake, however, was the failure to put brackets round 3 p + 1 when finding the difference of the y -coordinates"
- **Cambridge International examiners: a sketch would have helped**
  - Source: Cambridge International AS and A Level 9709 Mathematics, June 2015 Principal Examiner Report for Teachers. https://www.cambridgeinternational.org/Images/348170-june-2015-examiner-report.pdf
  - Quote: "Students would in many cases have benefitted from drawing a sketch"

My reading by skill: **gradient** (wrong order of subtraction, lost negative sign, upside-down ratio; brackets
around negative differences), **equation** (using the x-intercept in place of the y-intercept; knowing m but not what
to do with it), **parallel lines** (not knowing the gradients are equal). Cambridge advises a sketch and Edexcel advises writing the gradient formula down first. AQA reports
were not reached; Edexcel, OCR and Cambridge reports were.

### 6.4 Scales, best-fit lines and fitting data
- **Cambridge Mathematics: inconsistent axes are evidence of a weak number line model**
  - Source: The trouble with graphs | Cambridge Mathematics. https://www.cambridgemaths.org/blogs/the-trouble-with-graphs
  - Quote: "Evidence that students either have a weak model of the number line, or do not associate the axis of a graph with the (linear, non-logarithmic) number line can be seen when the spacing between consecutive values are of inconsistent size"
- **Line of best fit: 8 of 33 students forced the line through the origin**
  - Source: Examining Student Conceptions of Covariation: A Focus on the Line of Best Fit, Journal of Statistics Education 23(1), 2015. https://jse.amstat.org/v23n1/casey.pdf
  - Quote: "Lastly, it is noted that 8 of the 33 students forced their line to go through the origin on this task"
- **Line of best fit: some students wanted to bend a wire to connect the points**
  - Source: Examining Student Conceptions of Covariation: A Focus on the Line of Best Fit, Journal of Statistics Education 23(1), 2015. https://jse.amstat.org/v23n1/casey.pdf
  - Quote: "a sizeable number of students (nine), when asked to find the line of best fit, wanted to bend the wire to connect the points on the scatterplot"
- **Best-fit lines understood procedurally, not in terms of the physics**
  - Source: Undergraduate student construction and interpretation of graphs in physics lab activities, Physical Review PER 12, 010104 (2016). https://journals.aps.org/prper/pdf/10.1103/PhysRevPhysEducRes.12.010104
  - Quote: "These data indicate that this sample of undergraduate students understood best-fit lines primarily in terms of their procedural value. Students spoke of best-fit lines with respect to what they do—mitigate error, show the con- nection between variables, and calculate a value—rather than the physics concepts they represent"
- **Undergraduates struggled to find the slope of lines that did not pass through the origin**
  - Source: Undergraduate student construction and interpretation of graphs in physics lab activities, Physical Review PER 12, 010104 (2016). https://journals.aps.org/prper/pdf/10.1103/PhysRevPhysEducRes.12.010104
  - Quote: "Students also struggled to find the slope of lines that did not pass through the origin and confused area"
- **One student read the y intercept of the best-fit line as work done against friction**
  - Source: Undergraduate student construction and interpretation of graphs in physics lab activities, Physical Review PER 12, 010104 (2016). https://journals.aps.org/prper/pdf/10.1103/PhysRevPhysEducRes.12.010104
  - Quote: "she stated that the best- fit line enabled her to calculate the moment of inertia and the work done against friction, which is represented graphically as the y intercept"

My reading: three fitting errors to design against: joining the dots instead of fitting a trend, forcing the line
through the origin, and treating the fit as a procedure with no physical meaning (the intercept as friction is the
good case, and the rarest). Inconsistent axis spacing is a symptom of a weak number-line picture, so use the scales
Dan met in The coordinate plane.

### 6.5 Learning science for this course
- **Interleaved practice raised scores on delayed tests (Rohrer et al., 2015)**
  - Source: ERIC - EJ1071568 - Interleaved Practice Improves Mathematics Learning, Journal of Educational Psychology, 2015-Aug. https://eric.ed.gov/?id=EJ1071568
  - Quote: "Compared with blocked practice, interleaved practice produced higher scores on both the immediate and delayed tests (Cohen's d = 0.42 and 0.79, respectively"
- **Self-explanation: reliable classroom and delayed benefit is much more limited**
  - Source: Promoting Self-Explanation to Improve Mathematics Learning: A Meta .... https://eric.ed.gov/?id=EJ1149060
  - Quote: "However, evidence that self-explanation reliably promotes learning within a classroom context or retention of knowledge over a delay is much more limited"
- **Self-explanation prompts less effective when students cannot respond accurately** (SECONDARY)
  - Source: (PDF) Promoting self-explanation to improve mathematics learning. https://www.researchgate.net/publication/313794629_Promoting_self-explanation_to_improve_mathematics_learning_A_meta-analysis_and_instructional_design_principles
  - Quote: "self-explanation prompts are less effective when students cannot respond accurately"

My reading, applied to the app's pattern (predict, play, explain, say it back, quick checks, spaced review):
- Interleaving: mixing "find m", "find c", "write the equation" and "is it parallel" in review should beat blocked
  review. A What Works Clearinghouse summary of the Rohrer trial says its assignments held graphing and slope problems,
  but that sentence fell outside the part of the search result the app can quote, so it is **UNCONFIRMED** here.
- Self-explanation helps most when the learner can respond accurately; its classroom and delayed benefit is "much
  more limited" in this meta-analysis's words, so ask for explanation after a worked prediction, not before any
  understanding. Pair it with checks.

---

## 7. Where it is used for an electrician going into marine engineering

### 7.1 Ohm's law as a straight line
- **Ohm's law as a line: slope is the resistance**
  - Source: 20.2 Ohm’s Law: Resistance and Simple Circuits - College Physics for AP® Courses | OpenStax. https://openstax.org/books/college-physics-ap-courses/pages/20-2-ohms-law-resistance-and-simple-circuits
  - Quote: "Ohm's law ( ) is a fundamental relationship that could be presented by a linear function with the slope of the line being the resistance"
- **Ohmic material: resistance from the slope; non-ohmic is not a straight line**
  - Source: 20.2 Ohm’s Law: Resistance and Simple Circuits - College Physics for AP® Courses | OpenStax. https://openstax.org/books/college-physics-ap-courses/pages/20-2-ohms-law-resistance-and-simple-circuits
  - Quote: "Clearly the resistance of an ohmic material (shown in (a)) remains constant and can be calculated by finding the slope of the graph but that is not true for a non-ohmic material (shown in (b"
- **A bulb filament's resistance rises with temperature, so the V-I line is not straight**
  - Source: 20.2 Ohm’s Law: Resistance and Simple Circuits - College Physics for AP® Courses | OpenStax. https://openstax.org/books/college-physics-ap-courses/pages/20-2-ohms-law-resistance-and-simple-circuits
  - Quote: "resistance usually increases with temperature, and so the bulb has a lower resistance when it is first switched on and will draw considerably more current during its brief warm-up period"
- **School practical: gradient of the V-I graph gives the resistance** (SECONDARY)
  - Source: Electrical Resistance: Definition, Unit, Formula, Measurement (Testbook). https://testbook.com/electrical-engineering/electrical-resistance
  - Quote: "This graph between V and I of a conductor at constant temperature shows that the gradient of change in the voltage (Δ V) is proportional to the change in current (Δ I). This makes the graph a straight line"
- **NCERT: plot potential difference against current for a wire**
  - Source: NCERT Class XII Physics laboratory manual: resistance per unit length by plotting potential difference against current. https://ncert.nic.in/pdf/publication/sciencelaboratorymanuals/classXII/physics/lelm302.pdf
  - Quote: "To determine resistance per unit length of a given wire by plotting a graph of potential difference versus current"

### 7.2 Resistance against temperature
- **Copper's temperature coefficient of resistance at 20 C (table row)**
  - Source: Temperature Coefficient of Resistance | Physics Of Conductors And Insulators | Electronics Textbook. https://www.allaboutcircuits.com/textbook/direct-current/chpt-12/temperature-coefficient-resistance
  - Quote: "Copper | Element | 0.004041"
- **Temperature coefficient of resistance: positive for pure metals**
  - Source: Temperature Coefficient of Resistance | Physics Of Conductors And Insulators | Electronics Textbook. https://www.allaboutcircuits.com/textbook/direct-current/chpt-12/temperature-coefficient-resistance
  - Quote: "For pure metals, this coefficient is a positive number, meaning that resistance _increases_ with increasing temperature"
- **Resistance-temperature graph of copper is practically a straight line (lecture text)** (SECONDARY)
  - Source: Conductance, Variations of Resistivity with Temperature (lecture PDF, uomus.edu.iq). https://wwww.uomus.edu.iq/img/lectures21/MUCLecture_2024_5134456.pdf
  - Quote: "The temperature/resistance graph is a straight line (Fig. 1.6"
- **Extending the copper line backwards cuts the temperature axis at -234.5 C (lecture text)** (SECONDARY)
  - Source: Conductance, Variations of Resistivity with Temperature (lecture PDF, uomus.edu.iq). https://wwww.uomus.edu.iq/img/lectures21/MUCLecture_2024_5134456.pdf
  - Quote: "If this line is extended backwards, it would cut the tempera- ture axis at a point where temperature is − 234.5°C (a number quite easy to remember"
- **All specific-resistance figures are quoted at a standard temperature**
  - Source: Temperature Coefficient of Resistance | Physics Of Conductors And Insulators | Electronics Textbook. https://www.allaboutcircuits.com/textbook/direct-current/chpt-12/temperature-coefficient-resistance
  - Quote: "Most conductive materials change specific resistance with changes in temperature. This is why figures of specific resistance are always specified at a standard temperature (usually 20° or 25° Celsius"

My reading: this is the cleanest case of "intercept and gradient as physical quantities with units": the line
R = R0 + (R0 alpha) T has an intercept R0 (ohms at 0 degrees C) and a gradient R0 alpha (ohms per degree C), and the
line extended backwards meets the temperature axis at a number (-234.5 degrees C for copper in the lecture text,
SECONDARY). The MCA syllabus line 1.7 (section 3.2) asks for
exactly this calculation.

### 7.3 Load and extension (Hooke's law)
- **Hooke's law: the gradient is the spring constant**
  - Source: What is described by Hooke's law in GCSE Physics? - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zqt6b7h
  - Quote: "The gradient of the graph of force (y-axis) and extension (x-axis) is numerically equal to the spring constant"
- **Hooke's law: find k from the straight-line portion of the graph**
  - Source: What is described by Hooke's law in GCSE Physics? - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zqt6b7h
  - Quote: "The spring constant k can be calculated by finding the gradient of the straight-line portion of the graph"
- **Hooke's law: the line is straight only up to the limit of proportionality**
  - Source: What is described by Hooke's law in GCSE Physics? - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zqt6b7h
  - Quote: "Beyond this point, stretching force and extension are no longer directly proportional and the graph begins to curve"
- **Hooke's law: unit of k, N/cm; stiffness**
  - Source: What is described by Hooke's law in GCSE Physics? - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zqt6b7h
  - Quote: "a spring with a spring constant, k = 4 N/cm means a force of 4N is required to stretch the spring by 1 cm"
- **Hooke's law: a straight line through the origin while the limit of proportionality holds**
  - Source: What is described by Hooke's law in GCSE Physics? - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zqt6b7h
  - Quote: "Provided that the limit of proportionality is not exceeded , a graph of stretching force against extension is a straight line through the origin"

### 7.4 Other straight-line laws
- **Pearson A level: straight line models such as Celsius to Fahrenheit**
  - Source: A level Mathematics Specification - Pearson qualifications. https://qualifications.pearson.com/content/dam/pdf/A%20Level/Mathematics/2017/specification-and-sample-assesment/a-level-l3-mathematics-specification-issue4.pdf
  - Quote: "Be able to use straight line models in a variety of contexts. For example, the line for converting degrees Celsius to degrees Fahrenheit, distance against time for constant speed, etc"

My reading: the voltage-against-speed exercise quoted in 4.7 (Bird) is also a marine electrical case (a machine's
voltage against shaft speed), and the Celsius to Fahrenheit line is a handy pure example of a line with a nonzero
intercept (32) and a gradient that is a unit conversion (9/5).

---

## 8. Size

- **HELM: the straight line section runs pages 36 to 46 of Workbook 2**
  - Source: HELM Workbook 2: Basic Functions, Loughborough University (2015). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Functions.pdf
  - Quote: "4. Characterising Functions 26 5. The Straight Line 36 6. The Circle 46"
- **Khan Algebra basics unit 4: 'Slope' lesson list**
  - Source: Slope from graph | Algebra (video) | Khan Academy. https://www.khanacademy.org/math/algebra/linear-equations-and-inequalitie/v/slope-and-rate-of-change
  - Quote: "Lesson 4: Slope * Intro to slope * Positive & negative slope * Worked example: slope from graph * Slope from graph * Worked example: slope from two points * Slope from two points * Slope (more examples) * Slope review"

- Brilliant spends **56 lessons** on Linear Relationships and **44** on Coordinate Geometry (about 100 lessons in
  its own pacing). Khan's Algebra basics Unit 4 has 17 numbered items (quizzes and a unit test included), with a slope
  lesson of eight short pieces; its Algebra 1 Unit 4 lists at least 17 items and Unit 5 at least 13. HELM covers the engineering line in 11
  pages; Bird in a chapter of 20 pages.
- Which core supports five to seven lessons for Dan: **gradient and the two-point formula, y = mx + c with intercepts,
  writing the equation, distance and midpoint, laws from readings, fitting a line to scattered readings**. Parallel
  lines fit in the equation lesson; perpendicular lines are an aside or are left to Trigonometry.
- Suggested ideas (my reading, six lessons, a seventh optional):
  1. Gradient: rise over run between any two points; positive, negative, zero, undefined; units.
  2. y = mx + c: reading and drawing a line, what m and c mean (Ohm's law and resistance against temperature).
  3. Writing the equation from a point and a gradient, or from two points; parallel lines.
  4. Distance and midpoint of two points (Pythagoras on the grid; averaging).
  5. Finding a law from readings: Hooke's law, voltage against speed, law of a machine; gradient and intercept with
     units; reading values by interpolation.
  6. Fitting a line to scattered readings by eye: best fit, outliers, extrapolation, where a straight line stops
     being the right model (limit of proportionality). Hand off reductions with logs to Exponentials and logarithms.
  7. (Optional) Putting it together, as Brilliant does at the end of level 3: mixed problems, spaced review.

## Unconfirmed items (summary)
- Brilliant lesson pictures (only titles were read).
- The MCA's own copy of the Second Engineer written syllabus (read on edumaritime.net, SECONDARY).
- A mathematics line in MIN 654; the "General Engineering Science" lines.
- Pearson 4002 essential content naming linear regression and coordinate systems (seen only in a read too large to store).
- SQA H7K0 34 (Engineering Mathematics 1, SCQF level 7).
- Bitesize's "named mistakes"; AQA reports; NCTM statements.
- The original 1980s and 1990s slope studies (read only through a 2012 summary).
