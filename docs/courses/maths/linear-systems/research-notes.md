# Linear systems: research notes

Researched 17 Oct 2026 for the Linear systems course brief (the third course in the Maths shelf's Algebra folder; blurb
"Two straight lines, two equations, and where they meet: simultaneous equations, as Kirchhoff’s laws need them", from
"Brilliant: Linear Systems"). The brief itself is not written here; these notes are its evidence. Dan is an electrician preparing
for marine engineering college (HNC/HND route). He has Fractions, Negative numbers, Percentages, Proportional reasoning, Solving
equations, The coordinate plane, Geometry fundamentals, Linear equations and Calculus fundamentals built, and Straight-line graphs
is being built in the same push (its brief is `build/maths/straight-line-graphs/brief.md`), so it is assumed.

Every finding has its source title, URL and the exact words, cut out of a saved tool result by script (the quotes were not
retyped into this file). All of them are listed in `quotes.json` beside this file and were checked with
`node tools/eval/sources.mjs --quotes ... --tools ...` (`failed: 0`). The tool files are in `tools/`.
Findings I could not confirm are marked **UNCONFIRMED**; where only a non-original site said it, **SECONDARY**.
My own readings are marked "My reading" and are not quotes. Mirror and copy sites were avoided; hosts that republish an original
text (physicsandmathstutor, the Sheffield copy of HELM) are marked SECONDARY where used.

---

## 1. Benchmark: Brilliant's Linear Systems

### 1.1 The course itself
Brilliant's page is `brilliant.org/courses/linear-systems/` and it is reachable (fetched 17 Oct 2026). It is a short, new
course: **31 lessons in 6 levels**, and the lessons are listed here in Brilliant's own order (the "Level Check" rows
are quizzes, not lessons). Counting the rows: Level 1 has 5 lessons, Level 2 has 6, Level 3 has 5, Level 4 has 4,
Level 5 has 4 and Level 6 has 7, which makes 31 and matches the page. 23 of the 31 are about systems of equations
(levels 1, 2, 3 and 6) and 8 are about systems of inequalities (levels 4 and 5). The page gives only titles, so what each
lesson shows on screen is **UNCONFIRMED** (I did not open a lesson).

- **Brilliant's Linear Systems is 31 lessons and 563 exercises**
  - Source: Practice Linear Systems | Brilliant. https://brilliant.org/courses/linear-systems/
  - Quote: "Solve systems of equations and inequalities using graphs and algebra. 31 Lessons 563 Exercises"
- **Levels 1 to 3: the idea of a system, solving by graphing, solving with algebra**
  - Source: Practice Linear Systems | Brilliant. https://brilliant.org/courses/linear-systems/
  - Quote: "Level 1 Systems of Equations Two Constraints Graph of a System Solution to a System Graphing Constraints Building a System Level Check ## Level 2 Solving Systems by Graphing Graphing Systems of Equations Slope-Intercept and Systems Point-Slope and Systems Approximate Solutions Systems with No Solution Systems with Infinitely Many Solutions Level Check ## Level 3 Solving Systems with Algebra Solve by Substituting Isolating to Substitute Adding Equations Scaling an Equation Scaling Both Equations"
- **Levels 4 to 6: systems of inequalities, then setting up systems (givens, graphs, algebra, motion)**
  - Source: Practice Linear Systems | Brilliant. https://brilliant.org/courses/linear-systems/
  - Quote: "Level 4 Systems of Inequalities Two Inequality Constraints Graphing a System of Inequalities Building a System of Inequalities Interpreting Solutions ## Level 5 Solving Systems of Inequalities Reading Graphs Representing Solutions Graphing Systems Special Systems of Inequalities ## Level 6 Setting up Systems Givens and Constraints Solving Graphically Solving Algebraically The Shortest Connector Graphing Constraints Interpreting Motion Graphs Solving Motion Equations"
- **Brilliant's description: two constraints at once, graph first, then substitution and elimination**
  - Source: Practice Linear Systems | Brilliant. https://brilliant.org/courses/linear-systems/
  - Quote: "In this course, you'll learn to solve systems of two linear equations by exploring situations where two constraints must be satisfied at the same time. You'll start by interpreting real-world scenarios with two unknowns, then move to graphing lines and finding their intersection. You'll solve systems algebraically using substitution and elimination, and learn to recognize when a system has no solution or infinitely many solutions. Finally, you'll extend these ideas to systems of inequalities, identifying and graphing the regions where multiple constraints overlap."
- **Brilliant's topics covered**
  - Source: Practice Linear Systems | Brilliant. https://brilliant.org/courses/linear-systems/
  - Quote: "Writing equations for constraints * Graphing systems of equations * Finding solutions as intersection points * Graphing lines using slope-intercept form * Graphing lines using point-slope form * Estimating approximate solutions * Identifying systems with no solution * Identifying systems with infinitely many solutions * Solving systems by substitution * Solving systems by elimination * Scaling equations to eliminate variables * Writing systems of inequalities * Graphing systems of inequalities * Interpreting solution regions"

My reading of the order: the idea first ("Two Constraints": a situation with two things that must both be true),
then the graph of a system and what the crossing point means, then the same system solved by drawing (including the
two special cases, "No Solution" and "Infinitely Many Solutions", inside the graphing level), then algebra by
substitution and by adding equations ("Adding Equations", "Scaling an Equation", "Scaling Both Equations"), and last
word-problem setting-up with a motion example. Elimination is Brilliant's level 3 and the special cases come before it, in
the graph level. There is no lesson on three unknowns anywhere in the list.

### 1.2 Where it sits in Brilliant's path
- **Brilliant's Algebra Fundamentals band: Linear Equations, Coordinate Geometry, Linear Relationships, Exponents and Radicals, Visual Algebra**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "GR 7–8 Linear Equations GR 7–8 Coordinate Geometry GR 8–9 Linear Relationships GR 8 Exponents and Radicals GR 8–9 Visual Algebra"
- **Brilliant's Intermediate Algebra band: Introduction to Functions, Linear Systems, then Quadratics, Coordinate Transformations, Exponential Functions**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "GRADES 8–11 ### Intermediate Algebra New Understand core ideas to crush early high school courses like Algebra 1 or Integrated Math 1 and 2 Understand core ideas to crush early high school courses like Algebra 1 or Integrated Math 1 and 2 GR 8–9 Introduction to Functions GR 8–9 Linear Systems New GR 9 Quadratics GR 8–9 Coordinate Transformations GR 9–10 Exponential Functions"
- **Brilliant's Matrices course is where systems of equations meet matrices and inverses (Level 9)**
  - Source: Practice Matrices | Brilliant. https://brilliant.org/courses/matrices/
  - Quote: "Level 9 Systems of Equations Systems of Equations Matrices as Systems of Equations Solving Systems of Equations Solving with Inverses"
- **Brilliant's Matrices course: its size and its starting idea**
  - Source: Practice Matrices | Brilliant. https://brilliant.org/courses/matrices/
  - Quote: "Take your vector skills further by using matrices to transform the plane. 43 Lessons 750 Exercises"
- **Brilliant lesson length: about 5 to 10 minutes each**
  - Source: How Brilliant fits into a math lesson | Brilliant. https://brilliant.org/help/schools-and-educators/how-brilliant-fits-into-a-math-lesson/
  - Quote: "Lesson: usually 5–10 minutes each. A typical lesson includes a short sequence of interactive problems and a Skills Check (practice problems) at the end."

Before it: Brilliant's Algebra Fundamentals (Linear Equations, Coordinate Geometry, Linear Relationships). In Dan's app those
are Linear equations and Straight-line graphs, so Brilliant's order matches the Algebra folder in `docs/shelves-maths.json`
(Linear equations, Straight-line graphs, Linear systems, ...). After it: Quadratics, then further functions. Brilliant also
puts Introduction to Functions just before Linear Systems; in Dan's folder "Functions and their graphs" comes after
Linear systems, so that is a difference to note (My reading). Matrices are a separate Brilliant course in the Advanced Math band
(it ends with a Systems of Equations level); that is the place for matrix methods, which agrees with the brief's instruction.


## 2. Other courses' order for the same ground

Khan Academy, BBC Bitesize (England KS3 and Scotland's National 5), the HELM workbooks and Bird's textbooks all teach this
topic. They agree on four things: the graph meaning (the crossing point), substitution and elimination, the special
cases (no answer, endless answers), and word problems. They differ on order (Khan has substitution before elimination in
Algebra 1, but elimination before substitution in the older Algebra basics unit).

### 2.1 Khan Academy

- **Khan Algebra 1, Unit 6 "Systems of equations": the lesson list in order (19 items, three of them quizzes and one a unit test)**
  - Source: Systems of equations | Algebra 1 | Math. https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:systems-of-equations
  - Quote: "1. Solutions of systems of equations 2. Systems of equations with graphing 3. Creating systems in context 4. Interpret points relative to a system 5. Systems of equations: Quiz 1 6. Systems of equations with substitution 7. Combining equations 8. Elimination strategies 9. Systems of equations with elimination 10. Systems of equations with elimination challenge 11. Reasoning with systems of equations 12. Systems of equations: Quiz 2 13. Number of solutions to a system of equations graphically 14. Number of solutions to a system of equations algebraically 15. Age word problems 16. Systems of equations word problems 17. Systems of equations word problems (with zero and infinite solutions) 18. Systems of equations: Quiz 3 19. Systems of equations: Unit test"
- **Khan "Algebra basics" unit puts graphing, then elimination, then substitution**
  - Source: Systems of equations | Algebra basics | Math | Khan Academy. https://www.khanacademy.org/math/algebra-basics/alg-basics-systems-of-equations
  - Quote: "1. Systems of equations with graphing 2. Systems of equations with elimination 3. Systems of equations with elimination challenge 4. Systems of equations with substitution 5. Systems of equations: Quiz 1 6. Number of solutions to a system of equations graphically 7. Number of solutions to a system of equations algebraically"
- **Khan's unit blurb: clues from two expressions**
  - Source: Systems of equations | Algebra basics | Math | Khan Academy. https://www.khanacademy.org/math/algebra-basics/alg-basics-systems-of-equations
  - Quote: "How can you use clues from two algebraic expressions to figure out the value of a variable? In this unit, you'll learn how to solve a system of equations or inequalities in two variables by elimination, substitution, and graphing."
- **Khan "Algebra (all content)" Unit 5: what the topic covers**
  - Source: System of equations | Algebra (all content) | Math | Khan Academy. https://www.khanacademy.org/math/algebra-home/alg-system-of-equations
  - Quote: "This topic covers: * Solutions of linear systems * Graphing linear systems * Solving linear systems algebraically * Analyzing the number of solutions to systems * Linear systems word problems"

My reading: Khan spends 15 content items, 3 quizzes and a unit test on it. It starts from the idea of a solution ("Solutions
of systems of equations", "trolls, tolls"), then graphs, then creating systems in context before any algebra, then
substitution, "Combining equations", "Elimination strategies", elimination, and only then the number of solutions and the
word problems (including "with zero and infinite solutions"). So Khan keeps the special cases for after both algebra methods;
Brilliant puts them in the graph level.

### 2.2 BBC Bitesize and SQA National 5 (the Scottish route Dan's college is likely to assume)
- **Bitesize National 5 guide "Working with simultaneous equations": four pages in order**
  - Source: Solving simultaneous equations graphically - Working with simultaneous equations - National 5 Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z8gdb82/revision/1
  - Quote: "1. Solving simultaneous equations graphically 2. Solving simultaneous equations algebraically 3. Simultaneous equations - non-matching coefficients 4. Forming pairs of equations"
- **Bitesize N5: the graph method, in one line**
  - Source: Solving simultaneous equations graphically - Working with simultaneous equations - National 5 Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z8gdb82/revision/1
  - Quote: "To find solutions from graphs, look for the point where the two graphs cross one another. This is the solution point."
- **Bitesize N5 on the graph needing straight-line plotting first**
  - Source: Solving simultaneous equations graphically - Working with simultaneous equations - National 5 Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z8gdb82/revision/1
  - Quote: "Knowledge of plotting linear equations is needed to solve equations graphically."
- **Bitesize N5: why the same x and y can be used in either equation (the bridge from the graph to the algebra)**
  - Source: Solving simultaneous equations algebraically - Working with simultaneous equations - National 5 Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z8gdb82/revision/2
  - Quote: "At the point of intersection the x-coordinates are the same and the y-coordinates are the same."
- **Bitesize N5: word problems form pairs of equations**
  - Source: Forming pairs of equations - Working with simultaneous equations - National 5 Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z8gdb82/revision/4
  - Quote: "Some word problems can be solved by using the information given to form equations. If there are two sets of information these can form pairs of simultaneous equations."
- **SQA National 5 course specification: three skills for simultaneous equations (construct, graph, algebra)**
  - Source: National 5 Mathematics Course Specification. https://www.sqa.org.uk/files_ccc/n5-course-spec-mathematics.pdf
  - Quote: "Working with simultaneous equations  Construct from text  Graphical solution  Algebraic solution"
- **SQA National 5: simultaneous equations could come from a problem**
  - Source: National 5 Mathematics Course Specification. https://www.sqa.org.uk/files_ccc/n5-course-spec-mathematics.pdf
  - Quote: "simultaneous equations could be derived from a problem before solving"
- **maths.scot on National 5: a pair of linear equations only, and the solution is the crossing point**
  - Source: Simultaneous Equations – National 5 Maths – Free Resources. https://maths.scot/nat5/simultaneous-equations
  - Quote: "A pair of simultaneous equations is formed when we have two unknowns such as (x) and (y). * At Nat 5, we only have to solve a system of two "linear" equations. * The solution is the point ((x,y)) of intersection of the two straight lines"
- **Bitesize KS3 (England): crossing lines are the solution; parallel lines give none**
  - Source: Solving simultaneous equations graphically - KS3 Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zhbnvj6
  - Quote: "If the two lines cross, then the coordinates of this intersection are the solutions to the simultaneous equations. If the lines are parallel (and therefore do not intersect), there is no solution."
- **Bitesize GCSE (Edexcel): one equation with two unknowns has endless solutions, so a second equation is needed**
  - Source: Simultaneous equations - Solving simultaneous equations - Edexcel - GCSE Maths Revision - Edexcel - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z9y9jty/revision/1
  - Quote: "Equations that have more than one unknown can have an infinite number of solutions. ... To be able to solve an equation like this, another equation needs to be used alongside it."
- **Bitesize KS3: elimination by adding or subtracting**
  - Source: How to solve simultaneous equations (KS3 Maths | BBC Bitesize) - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zmpyn9q
  - Quote: "You can solve simultaneous equations by adding or subtracting the two equations in order to end up with an equation with only one unknown value."
- **SQA Higher keeps the next step for later: a straight line meeting a curve**
  - Source: Higher Mathematics Course Specification. https://www.sqa.org.uk/sqa/files_ccc/h-course-spec-mathematics.pdf
  - Quote: "finding the coordinates of the point(s) of intersection of a straight line and a curve or of two curves"

My reading: the Scottish order is graph first, then elimination (adding equations), then non-matching coefficients
(scaling), then word problems. That is the order a Scottish college will have in mind, and it is close to Brilliant's
(graph, then algebra, then setting up). The line meeting a curve (Higher) is a Quadratics matter and is deferred.

### 2.3 The HELM workbooks (Loughborough)
- **HELM Workbook 3 contents: simultaneous linear equations are section 3.4, between polynomials and inequalities**
  - Source: About the HELM Project. https://nucinkis-lab.cc.ic.ac.uk/HELM/HELM_Workbooks_46-50/WB50-all.pdf
  - Quote: "Workbook 3 - Equations, Inequalities and Partial Fractions (71 pages) 3.1 Solving Linear Equations 3.2 Solving Quadratic Equations 3.3 Solving Polynomial Equations 3.4 Solving Simultaneous Linear Equations 3.5 Solving Inequalities"
- **HELM tutors' guide: start from the four graph cases, then show how the graphs relate to the algebra**
  - Source: About the HELM Project. https://nucinkis-lab.cc.ic.ac.uk/HELM/HELM_Workbooks_46-50/WB50-all.pdf
  - Quote: "The solution of simultaneous equations allows the opportunity to show the interaction between graph- ical indication and algebraic determination. Start with the four graphical cases of single intersection (at almost right-angles), parallel lines, coincident lines, and almost-coincident lines."
- **HELM tutors' guide: link linear equations to a straight line crossing an axis, and ask about no solution**
  - Source: About the HELM Project. https://nucinkis-lab.cc.ic.ac.uk/HELM/HELM_Workbooks_46-50/WB50-all.pdf
  - Quote: "Linking the solution to the graph of a straight line crossing an axis is recommended. Are there any cases therefore where no solution exists? Is the solution unique and why is it important to know this?"
- **HELM Workbook 8 (matrix solution): the three methods it teaches**
  - Source: HELM Workbook 8 Matrix solution of Equations.pdf. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%208%20Matrix%20solution%20of%20Equations.pdf
  - Quote: "In this Workbook you will learn to apply your knowledge of matrices to solve systems of linear equations. Such systems of equations arise very often in mathematics, science and engineering. Three basic techniques are outlined, Cramer's method, the inverse matrix approach and the Gauss elimination method."
- **HELM Workbook 8 outcomes: Cramer's rule for two and three equations, and spotting no unique solution**
  - Source: HELM Workbook 8 Matrix solution of Equations.pdf. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%208%20Matrix%20solution%20of%20Equations.pdf
  - Quote: "state and apply Cramer’s rule to find the solution of two simultaneous linear equations • state and apply Cramer’s rule to find the solution of three simultaneous linear equations • recognise cases where the solution is not unique or a solution does not exist"
- **HELM Workbook 8: a worked pair with endless solutions (2x − 3y = 6 and 4x − 6y = 12)**
  - Source: HELM Workbook 8 Matrix solution of Equations.pdf. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%208%20Matrix%20solution%20of%20Equations.pdf
  - Quote: "So for each value of t there are values for x and y which simultaneously satisfy both equations. There is an infinite number of possible solutions)."
- **HELM Workbook 8: a worked pair with none (the second says 2x − 3y = 5 where the first says 6)**
  - Source: HELM Workbook 8 Matrix solution of Equations.pdf. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%208%20Matrix%20solution%20of%20Equations.pdf
  - Quote: "In (b) the equations are inconsistent (since the first is 2 x − 3 y = 6 and the second is 2 x − 3 y = 5 which is not possible). Hence there are no solutions."

My reading: HELM puts the topic (3.4) in the same workbook as linear equations and inequalities, and the matrix methods
two workbooks later (7 and 8). Its own advice to tutors is the best order I found for the special cases: show the
graph cases first (one crossing, parallel, the same line, nearly the same line), then show how each looks in the algebra.
The HELM 3.4 text itself was not retrievable in a page I could read whole, so its section length is **UNCONFIRMED**.

### 2.4 Bird's Engineering Mathematics (the college textbook series)
- **Bird's Basic Engineering Mathematics (8th ed.), chapter 13 "Solving simultaneous equations": six sections, from two unknowns to three**
  - Source: Bird’s Basic Engineering Mathematics; Eighth Edition. https://api.pageplace.de/preview/DT0400.9781000299328_A40251821/preview-9781000299328_A40251821.pdf
  - Quote: "13 Solving simultaneous equations 118 13.1 Introduction 118 13.2 Solving simultaneous equations in two unknowns 118 13.3 Further solving of simultaneous equations 120 13.4 Solving more difficult simultaneous equations 122 13.5 Practical problems involving simultaneous equations 124 13.6 Solving simultaneous equations in three unknowns 128"
- **Bird's Engineering Mathematics (9th ed.): simultaneous equations (chapter 10) and then matrices (chapters 58 and 59)**
  - Source: Bird's Engineering Mathematics - 9th Edition - John Bird - Routledge B. https://www.routledge.com/Birds-Engineering-Mathematics/Bird/p/book/9780367643782
  - Quote: "10. Solving simultaneous equations 11. Solving quadratic equations"
- **Bird's Engineering Mathematics (9th ed.): matrices and determinants solve simultaneous equations, in a later section**
  - Source: Bird's Engineering Mathematics - 9th Edition - John Bird - Routledge B. https://www.routledge.com/Birds-Engineering-Mathematics/Bird/p/book/9780367643782
  - Quote: "58. The theory of matrices and determinants 59. The solution of simultaneous equations by matrices and determinants"
- **Bird's Science and Mathematics for Engineering: simultaneous equations (chapter 8) follow simple equations and transposing formulae**
  - Source: Science and Mathematics for Engineering - 6th Edition - John Bird - Ro. https://www.routledge.com/Science-and-Mathematics-for-Engineering/Bird/p/book/9780367204747
  - Quote: "6. Solving simple equations Revision Test 3: Algebra and simple equations 7. Transposing formulae 8. Solving simultaneous"
- **Bird's free sample: a worked elimination with scaling (7x − 2y = 26, 6x + 5y = 29), as far as x**
  - Source: Engineering Mathematics with John Bird FreeBook - Routledge. https://www.routledge.com/rsc/downloads/Engineering_Mathematics_with_John_Bird_FreeBook.pdf
  - Quote: "Problem 18. Solve the simultaneous equations: 7 x − 2 y = 26 (1) 6 x + 5 y = 29 (2) 5×equation (1) gives: 35 x − 10 y = 130 (3) 2×equation (2) gives: 12 x + 10 y = 58 (4) Equation (3)+equation (4) gives: 47 x + 0 = 188 from which, x = 188 47 = 4"

My reading: Bird teaches this at about 14 pages in the basic book (chapter 13 runs from page 118 to the start of chapter
14 at page 132), with its own section on practical problems (13.5) and one on three unknowns (13.6). It puts the topic
after transposing formulae and before quadratics (Basic book, chapters 12 to 14). The 8th-edition preview showed me only
the contents of chapter 13 onward, so where Bird's graphical solution chapter sits is **UNCONFIRMED** here.


## 3. What a marine engineering HNC actually uses of this topic

The strongest syllabus line is not from the HN units themselves. It is in the MCA's own written-examination syllabus for
the Second Engineer certificate, which lists exactly this topic, and in the Marine Electro-Technology syllabus, which
lists exactly the Kirchhoff use. The HN units I could read name the topic only in an older (2001) unit, or
not at all, because they assume it as algebra already known.

### 3.1 MCA / SQA engineer officer syllabus (Mathematics, Applied Mechanics, Electro-Technology)

- **MCA Second Engineer Mathematics syllabus 2.1.28 to 2.1.30: two unknowns by substitution and by elimination, three unknowns, and setting equations up from data**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "28. Solves linear simultaneous equations of two unknowns: 1. by the method of substitution; 2. by the method of elimination. 29. Solves linear simultaneous equations of three unknowns. 30. Develops linear simultaneous equations of two unknowns consistent with data provided in a question, and finds the solution to those equations."
- **MCA Mathematics syllabus 2.1.27: developing linear equations from data in a question**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "27. Develops linear equations consistent with data provided in a question, and finds the solution to these equations."
- **MCA Mathematics syllabus 4.1.12: the graph meaning of simultaneous equations**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "States that two simultaneous equations plotted as graphs on the same axis have solutions where the graphs intersect."
- **MCA Mathematics syllabus 4.1.9: a straight-line graph's law is y = ax + b**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "States that the law of a straight line graph is of the form: y = ax + b, and defines a and b."
- **MCA Mathematics syllabus 2.1.23 to 2.1.25: the equation rules that elimination rests on**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "23. Defines an equation as a statement of equality. 24. Simplifies and solves linear equations. 25. Understands the axioms: 1. if equal quantities be added to two quantities that are already equal, the results will be equal; 2. if equal quantities be subtracted from two quantities that are already equal, the remainders will be equal; 3. equal quantities when multiplied or divided by the same quantity will give results that are equal."
- **MCA Mathematics syllabus 2.1.4: the sign in front of a bracket**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "4. States the effect of plus or minus signs in front of a bracketed quantity or quantities."
- **MCA Marine Electro-Technology syllabus 2.1.3 to 2.1.9: both Kirchhoff laws, and problems by simultaneous equations with two unknowns only**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "3. States Kirchhoffs Current Law. 4. States Kirchhoffs Voltage Law. 5. Describes a series circuit configuration using a variety of components and finds the equivalent resistance. 6. Describes a parallel circuit configuration using a variety of components and finds the equivalent resistance. 7. Solves problems on series/parallel circuits. 8. Solves problems on power and energy in dc resistive circuits. 9. Solves problems using Kirchhoffs laws by application of simultaneous equations (two unknowns only)."
- **MCA Marine Electro-Technology syllabus 1.1.16: batteries in series and parallel with internal resistance and a connected load**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Solves problems involving batteries in series and in parallel combinations including internal resistance and current in a connected load."
- **MCA Applied Mechanics syllabus 5.1.13 to 5.1.14: the law of a machine by graph and by analysis**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "13. Explains the law of a machine. 14. Determines the law of a machine by both graphical and analytical methods."
- **MSN 1857: an HNC or HND route needs four of six subjects, Mathematics first**
  - Source: M Notice Template - MSF 5011. https://assets.publishing.service.gov.uk/media/5a80116fe5274a2e8ab4dfe4/MSN_1857.pdf
  - Quote: "Certificate (HNC) holders (preferably in Mechanical or Marine Engineering or in an engineering subject that at least covers four of the following 6 subjects: Mathematics, Engineering Drawing, Applied Mechanics, Applied Heat, Electrotechnology and Naval Architecture);"
- **MSN 1857: the SQA Second Engineer academic examinations include Mathematics and Electro Technology**
  - Source: M Notice Template - MSF 5011. https://assets.publishing.service.gov.uk/media/5a80116fe5274a2e8ab4dfe4/MSN_1857.pdf
  - Quote: "Second Engineer: Mathematics, Applied Mechanics, Applied Heat, Engineering Drawing, Electro Technology and Naval Architecture."
- **MIN 565: General Engineering Science I is Applied Mechanics and Mathematics; II is Applied Heat and Electrotechnology and Naval Architecture**
  - Source: M Notice Template - MSF 5011. https://assets.publishing.service.gov.uk/media/5ad08bf440f0b617dca71274/MIN_565.pdf
  - Quote: "General Engineering Science I examination will be constituted of the following sections:  Applied Mechanics  Mathematics General Engineering Science II examination will be constituted of the following sections:  Applied Heat  Electrotechnology and Naval Architecture"

My reading: the MCA lines say three useful things. Firstly, the topic is examined in Mathematics (2.1.28 to 2.1.30)
by both substitution and elimination, with equations set up from data. Secondly, it is examined in Electro-Technology
(2.1.9) as "Kirchhoffs laws by application of simultaneous equations (two unknowns only)". Thirdly, three unknowns
are listed in the Second Engineer Mathematics syllabus (2.1.29), which is a reason for a stretch lesson but not for core
time. (The "General Engineering Science" papers named in MIN 565 are the small-vessel route, made of the same sections.)
The syllabus pages say "Published 6 May 2014" on GOV.UK. I did not find a newer version, so whether the current papers still
follow it exactly is **UNCONFIRMED** (MSN 1857 is the notice that lists the examinations; the MSN 1857 text I read is the 2015 issue).

### 3.2 SQA Higher National units
- **SQA HN unit "Introductory Mathematics for Engineering" (an older unit, 2001): the range statement names simultaneous linear equations in two unknowns**
  - Source: SCOTTISH VOCATIONAL EDUCATION COUNCIL. https://www.sqa.org.uk/files/hn/D7481997.pdf
  - Quote: "Expressions: exponential; logarithmic. Equations: simultaneous linear equations in two unknowns; quadratic equations. Algebraic expressions: brackets; fractions; indices."
- **SQA HN Engineering Mathematics 1 (H7K0 33): its outcomes are functions, exponentials and logarithms, vectors and complex numbers**
  - Source: Engineering Mathematics 1 (SCQF level 6) Unit code: H7K0 33. https://www.sqa.org.uk/files/hn/H7K033.pdf
  - Quote: "On successful completion of the Unit the learner will be able to: 1 Solve problems involving functions and trigonometric equations. 2 Solve problems involving exponential and logarithmic equations. 3 Apply mathematical techniques involving vectors and complex numbers."
- **SQA HN Engineering Mathematics 1: the unit assumes good algebraic skills on entry**
  - Source: Engineering Mathematics 1 (SCQF level 6) Unit code: H7K0 33. https://www.sqa.org.uk/files/hn/H7K033.pdf
  - Quote: "it would be advantageous if learners had good algebraic skills together with an ability to transpose engineering formulae and solve simple trigonometric equations."
- **SQA HN Engineering Mathematics 2 (H7K1 34): trigonometry and hyperbolic functions, differentiation, integration**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K134.pdf
  - Quote: "On successful completion of the Unit the learner will be able to: 1 Solve trigonometric and hyperbolic function problems. 2 Use differentiation techniques to solve Engineering problems. 3 Use integration techniques to solve Engineering problems."
- **SQA Advanced Higher (SCQF 7): matrices solve a 3 × 3 system by Gaussian elimination, including no solution and endless solutions**
  - Source: Advanced Higher Mathematics. https://www.sqa.org.uk/files_ccc/AHCourseSpecMathematics.pdf
  - Quote: "showing that a system of equations has no solutions (inconsistency)  showing that a system of equations has an infinite number of solutions (redundancy)"

My reading: neither current SQA HN Engineering Mathematics unit (1 at SCQF 6, 2 at SCQF 7) names simultaneous equations in
its outcomes, so the HNC takes the topic as already known, an entry skill. The older 2001 unit does name it. I did not find
a current SQA HN unit whose text names it, so which SQA unit assesses it for a given college is **UNCONFIRMED** and
Dan's college's own unit descriptor should be checked. Matrix methods for three unknowns appear in Advanced Higher and in
the Pearson HND unit below, not in the HNC units I could read.

### 3.3 Pearson BTEC HN (Unit 4002 and Unit 5006)
- **Pearson BTEC HN Engineering (England): Unit 4002 Engineering Maths is core and mandatory at Level 4**
  - Source: Higher Nationals - Pearson qualifications. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/specification/9781292448473-btec-hn-l4-l5-engin-engl-iss1.pdf
  - Quote: "Core Mandatory Unit 4001: Engineering Design 15 4 Core Mandatory Unit 4002: Engineering Maths 15 4"
- **Pearson Unit 4002 pass criteria P1 to P3: dimensional analysis, progressions, exponential, logarithmic, trigonometric and hyperbolic equations**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "P1 Apply dimensional analysis techniques to solve complex engineering/manufacturing problems. P2 Generate answers from engineering arithmetic and geometric progressions. P3 Determine solutions of engineering equations using exponential, logarithmic, trigonometric, and hyperbolic functions."
- **Pearson Unit 4002 LO4: calculus (rates of change and integration)**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "LO4 Examine how differential and integral calculus can be used to solve engineering and manufacturing sector problems P8 Examine rates of change for a range of mathematical functions. P9 Use integral calculus to determine a range of mathematical functions."
- **Pearson Unit 5006 (Level 5, HND): systems of linear equations by matrix methods, up to Gaussian elimination for three equations**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "LO2 Solve systems of linear equations relevant to engineering/ manufacturing applications using matrix methods P4 Calculate the determinant of a set of given linear equations using a 3x3 matrix. P5 Solve a system of three linear equations using Gaussian elimination."

My reading: Unit 4002 (Level 4, the HNC) has no pass criterion naming simultaneous equations either. Its criteria start
at dimensional analysis, progressions and functions. So the topic is, again, an assumed entry skill for the HNC. The
first place it appears as an assessed item is Unit 5006 Further Engineering Mathematics at the HND, and there it is the
matrix route: a determinant, Gaussian elimination, an inverse matrix. That is the reason to say that matrices and
determinants wait for the Matrices course. I saw only the criteria in the descriptor; the 4002 "essential content" list was
**UNCONFIRMED** (the page excerpt did not include it).


## 4. The scope to cover, and what research says about each part

The scope is two equations in two unknowns, and the sources below agree on the pieces. Each is given with the source that
supports it.

### 4.1 Where two straight lines meet

- **The crossing point is the solution (Bitesize KS3, with the parallel case in the same line)**
  - Source: Solving simultaneous equations graphically - KS3 Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zhbnvj6
  - Quote: "If the two lines cross, then the coordinates of this intersection are the solutions to the simultaneous equations. If the lines are parallel (and therefore do not intersect), there is no solution."
- **Khan's unit opens with what a solution is, then graphing, then creating systems in context, before any algebra**
  - Source: Systems of equations | Algebra 1 | Math. https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:systems-of-equations
  - Quote: "1. Solutions of systems of equations 2. Systems of equations with graphing 3. Creating systems in context 4. Interpret points relative to a system"
- **A teacher's activity: the algebraic answer is the intersection point when the lines are drawn**
  - Source: Intersecting the Solution - TI Education. https://education.ti.com/-/media/E2935DEDB88C4B68B99CB62420F346C9
  - Quote: "They should discover from solving the system algebraically that the values of x and y are the point of intersection ( x , y ) when the two lines in the system are graphed."

My reading: Dan already has the straight line (Straight-line graphs), so the crossing point can be taught as the point that
is on both lines, i.e. a pair (x, y) that makes both rules true. A system "has" a solution because both rules are true
at one point. The picture for lesson 1 is two lines on the same grid with a point you can drag along one line until it
sits on the other.

### 4.2 Substitution and elimination
- **Bitesize KS3: scaling an equation before eliminating**
  - Source: How to solve simultaneous equations (KS3 Maths | BBC Bitesize) - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zmpyn9q
  - Quote: "Sometimes equations need to be altered, by multiplying throughout, before being able to eliminate one of the variables (letters)."
- **Bitesize N5: the first step of elimination is matching coefficients**
  - Source: Solving simultaneous equations algebraically - Working with simultaneous equations - National 5 Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z8gdb82/revision/2
  - Quote: "When solving simultaneous equations algebraically, the first step is to try to eliminate one of the unknowns."
- **MCA syllabus: both methods are named, substitution first**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "28. Solves linear simultaneous equations of two unknowns: 1. by the method of substitution; 2. by the method of elimination."
- **IES practice guide: teach students to choose between strategies, introducing one or two at a time**
  - Source: Teaching Strategies for Improving Algebra Knowledge in Middle and High School Students. https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/WWC_Algebra_PG_Revised_02022018.pdf
  - Quote: "To avoid overwhelming students, introduce one or two different solution strategies at a time."

My reading: the two methods are the same idea (use one equation to get rid of one unknown) done two ways. Substitution
says "x is the same thing as this, so put this in". Elimination says "equal things added to equal things stay equal, so add
the equations". Dan has the second one already as the balance rule from Solving equations, which is the MCA's axioms line.

### 4.3 No answer (parallel lines) and endless answers (the same line)
- **HELM tutors: show the four cases (one crossing, parallel, coincident, almost coincident), then the algebra**
  - Source: About the HELM Project. https://nucinkis-lab.cc.ic.ac.uk/HELM/HELM_Workbooks_46-50/WB50-all.pdf
  - Quote: "Start with the four graphical cases of single intersection (at almost right-angles), parallel lines, coincident lines, and almost-coincident lines."
- **HELM Workbook 8: the same two cases in algebra, an infinite number of solutions or none**
  - Source: HELM Workbook 8 Matrix solution of Equations.pdf. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%208%20Matrix%20solution%20of%20Equations.pdf
  - Quote: "In (b) the equations are inconsistent (since the first is 2 x − 3 y = 6 and the second is 2 x − 3 y = 5 which is not possible). Hence there are no solutions."
- **Khan includes word problems "with zero and infinite solutions" as a named lesson**
  - Source: Systems of equations | Algebra 1 | Math. https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:systems-of-equations
  - Quote: "Systems of equations word problems (with zero and infinite solutions)"
- **Brilliant puts both special cases in the graphing level**
  - Source: Practice Linear Systems | Brilliant. https://brilliant.org/courses/linear-systems/
  - Quote: "Systems with No Solution Systems with Infinitely Many Solutions"
- **Higher-level SQA text names the same two cases as "inconsistency" and "redundancy"**
  - Source: Advanced Higher Mathematics. https://www.sqa.org.uk/files_ccc/AHCourseSpecMathematics.pdf
  - Quote: "showing that a system of equations has no solutions (inconsistency)  showing that a system of equations has an infinite number of solutions (redundancy)"

My reading: the algebra shows them as 0 = 5 (no answer) and 0 = 0 (endless answers) at the end of elimination, and the
graph shows them as lines that never meet and lines that lie on top of each other. HELM's own pair (2x − 3y = 6 with
4x − 6y = 12, then 4x − 6y = 10) is a worked pair and could be rebuilt as a controlled example with a computed rule.
I would not use the words "consistent" and "inconsistent" until earned.

### 4.4 Setting up equations from a word problem
- **OpenStax Intermediate Algebra: the steps for an application, from reading the problem to solving the system**
  - Source: 4.2 Solve Applications with Systems of Equations - Intermediate Algebra 2e | OpenStax. https://openstax.org/books/intermediate-algebra-2e/pages/4-2-solve-applications-with-systems-of-equations
  - Quote: "Step 1. Read the problem. Make sure all the words and ideas are understood. 2. Step 2. Identify what we are looking for. 3. Step 3. Name what we are looking for. Choose variables to represent those quantities. 4. Step 4. Translate into a system of equations. 5. Step 5. Solve the system of equations using good algebra techniques."
- **OpenStax: the last step is to check in the problem**
  - Source: 4.2 Solve Applications with Systems of Equations - Intermediate Algebra 2e | OpenStax. https://openstax.org/books/intermediate-algebra-2e/pages/4-2-solve-applications-with-systems-of-equations
  - Quote: "Step 6. Check the answer in the problem."
- **OpenStax: two variables can be easier than one**
  - Source: 4.2 Solve Applications with Systems of Equations - Intermediate Algebra 2e | OpenStax. https://openstax.org/books/intermediate-algebra-2e/pages/4-2-solve-applications-with-systems-of-equations
  - Quote: "Some people find setting up word problems with two variables easier than setting them up with just one variable."
- **Bitesize N5: a cinema problem with drinks and popcorn forms two equations**
  - Source: Forming pairs of equations - Working with simultaneous equations - National 5 Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z8gdb82/revision/4
  - Quote: "At the cinema, one family bought 2 drinks and 4 bags of popcorn and the total cost was £15.00. Another family bought 3 drinks and 2 bags of popcorn and the total cost was £10.50. What is the cost of one drink (d) and one bag of popcorn (p)?"
- **MCA: the syllabus line asks for exactly this set-up skill**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "30. Develops linear simultaneous equations of two unknowns consistent with data provided in a question, and finds the solution to those equations."

My reading: the set-up is where most of the difficulty is (see section 6). A good picture is a table or labelled bars that
show "two facts about the same two unknowns" before any letters appear, as Brilliant's "Two Constraints" does.

### 4.5 Kirchhoff's current and voltage laws as two simultaneous equations (the HNC's use)
- **OpenStax College Physics: the junction rule and the loop rule**
  - Source: 21.3 Kirchhoff’s Rules - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/21-3-kirchhoffs-rules
  - Quote: "Kirchhoff’s first rule—the junction rule. The sum of all currents entering a junction must equal the sum of all currents leaving the junction. * Kirchhoff’s second rule—the loop rule. The algebraic sum of changes in potential around any closed circuit path (loop) must be zero."
- **OpenStax: each rule gives an equation, and the problem is solvable when equations equal unknowns**
  - Source: 21.3 Kirchhoff’s Rules - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/21-3-kirchhoffs-rules
  - Quote: "By applying Kirchhoff’s rules, we generate equations that allow us to find the unknowns in circuits. The unknowns may be currents, emfs, or resistances. Each time a rule is applied, an equation is produced. If there are as many independent equations as unknowns, then the problem can be solved."
- **OpenStax: a wrongly guessed current direction just gives a negative answer**
  - Source: 21.3 Kirchhoff’s Rules - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/21-3-kirchhoffs-rules
  - Quote: "If you assign the direction incorrectly, the current will be found to have a negative value—no harm done."
- **OpenStax: the last step is the simultaneous equations**
  - Source: 21.3 Kirchhoff’s Rules - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/21-3-kirchhoffs-rules
  - Quote: "Solve the simultaneous equations for the unknowns. This may involve many algebraic steps, requiring careful checking and rechecking."
- **HyperPhysics: two-loop circuit needs two simultaneous equations from the voltage law**
  - Source: DC Circuit Examples. http://hyperphysics.phy-astr.gsu.edu/hbase/electric/dcex4.html
  - Quote: "This approach requires two simultaneous equations formed by applying the voltage law to both loops."
- **Boston University: for two inner loops and two junctions, one current equation is enough**
  - Source: Multi-loop Circuits and Kirchoff's Rules. http://physics.bu.edu/~duffy/py106/Kirchoff.html
  - Quote: "For a circuit with two inner loops and two junctions, one current equation is enough because both junctions give you the same equation."
- **Boston University: a negative answer means the current runs the other way**
  - Source: Multi-loop Circuits and Kirchoff's Rules. http://physics.bu.edu/~duffy/py106/Kirchoff.html
  - Quote: "The negative sign means that the current is 0.5 A in the direction opposite to that shown on the diagram."
- **OpenStax: when Ohm's law with series and parallel rules is not enough, Kirchhoff's rules are needed**
  - Source: 21.3 Kirchhoff’s Rules - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/21-3-kirchhoffs-rules
  - Quote: "This circuit is sufficiently complex that the currents cannot be found using Ohm’s law and the series-parallel techniques—it is necessary to use Kirchhoff’s rules."
- **Michigan State: a circuit that reduces by series and parallel rules needs no Kirchhoff equations**
  - Source: When to use Kirchhoff's laws. https://web.pa.msu.edu/courses/2000fall/phy232/lectures/kirchhoff/whentouse.html
  - Quote: "The figure on the left can be solved easily using the rules for adding resistances in parallel and series."
- **Michigan State: a third loop equation is not needed because it is a combination of the other two**
  - Source: When to use Kirchhoff's laws. https://web.pa.msu.edu/courses/2000fall/phy232/lectures/kirchhoff/whentouse.html
  - Quote: "You could also write an equation for a third loop that is defined by traveling around the outside of the circuit. That equation would be slightly more complicated because it would involve both batteries; but it is unnecessary since it would be merely a linear combination of Eq. 2 and Eq. 3 above."

My reading: for a two-loop circuit with three branch currents there are three unknowns (I1, I2, I3), but the junction
equation lets one be written in terms of the others, so two voltage-law equations in two unknowns remain. That is the
MCA line "two unknowns only". The Michigan State note about the third loop is also a nice picture of an equation that
adds nothing (a dependent one), which is the "same line" case from 4.3 seen in a circuit. The sign of a current is
chosen, not known, so a negative answer is a result, not a mistake. This needs Ohm's law (V = IR) as an input; Dan has
that from his trade, so each circuit screen need only state V = IR in one line and move on (the lessons should
not teach Ohm's law again).

### 4.6 Three unknowns, and where matrices wait
- **Bird's Basic Engineering Mathematics ends the chapter with three unknowns (section 13.6)**
  - Source: Bird’s Basic Engineering Mathematics; Eighth Edition. https://api.pageplace.de/preview/DT0400.9781000299328_A40251821/preview-9781000299328_A40251821.pdf
  - Quote: "13.6 Solving simultaneous equations in three unknowns 128"
- **SQA Advanced Higher: a 3 × 3 system is solved by Gaussian elimination in the matrix topic**
  - Source: National Unit Specification: general information. https://www.sqa.org.uk/files/nq/D32113.pdf
  - Quote: "Performance criteria (a) Use Gaussian elimination to solve a 3 × 3 system of linear equations"
- **Brilliant's Matrices course ends its course with a Systems of Equations level**
  - Source: Practice Matrices | Brilliant. https://brilliant.org/courses/matrices/
  - Quote: "Level 9 Systems of Equations Systems of Equations Matrices as Systems of Equations Solving Systems of Equations Solving with Inverses"
- **Pearson Unit 5006 (HND) names the determinant, Gaussian elimination and the inverse matrix**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "P4 Calculate the determinant of a set of given linear equations using a 3x3 matrix. P5 Solve a system of three linear equations using Gaussian elimination. M2 Determine the solution to a set of given engineering linear equations using the Inverse Matrix Method for a 3x3 matrix."
- **HELM: large systems come from circuits and frameworks, which is why matrices are used**
  - Source: HELM Workbook 7 Matrices.pdf. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%207%20Matrices.pdf
  - Quote: "When we wish to solve large systems of simultaneous linear equations, which arise for example in the problem of finding the forces on members of a large framed structure, we can isolate the coefficients of the variables as a block of numbers called a matrix."

My reading: three unknowns are in the MCA Second Engineer syllabus (2.1.29) and in Bird, but not in the HN criteria I could
read for the HNC or in Brilliant's Linear Systems. A single optional stretch lesson is justified by the MCA line alone;
the matrix and determinant methods belong to the Matrices course, where Brilliant, Bird (chapters 58 and 59), HELM (7
and 8) and Pearson 5006 all put them. I would mention in the last lesson that the same steps carry on to three unknowns and
point to Matrices. Inequalities systems (Brilliant levels 4 and 5) have no syllabus line anywhere in this research and are
left out.


## 5. Prerequisites: what this topic leans on

The course leans on five skills. Dan has all five from the built courses (Straight-line graphs assumed), so only the new use
needs teaching.

- **Needs the straight-line graph (Straight-line graphs): both lines are drawn first**
  - Source: Solving simultaneous equations graphically - KS3 Maths. https://www.bbc.co.uk/bitesize/articles/zbvxh39
  - Quote: "both equations need to be in the form y = m x + c If the equations are not in the form y = m x + c ,"
- **Needs the plotting skill**
  - Source: Solving simultaneous equations graphically - Working with simultaneous equations - National 5 Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z8gdb82/revision/1
  - Quote: "Knowledge of plotting linear equations is needed to solve equations graphically."
- **Needs the balance rule from Solving equations: equal things added to equal things stay equal**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "if equal quantities be added to two quantities that are already equal, the results will be equal; 2. if equal quantities be subtracted from two quantities that are already equal, the remainders will be equal; 3. equal quantities when multiplied or divided by the same quantity will give results that are equal."
- **Needs the sign of a bracket (Linear equations, brackets) because subtracting an equation subtracts all of it**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "4. States the effect of plus or minus signs in front of a bracketed quantity or quantities."
- **Needs rearranging a formula (Linear equations): isolating a letter in one equation to substitute**
  - Source: Practice Linear Systems | Brilliant. https://brilliant.org/courses/linear-systems/
  - Quote: "Isolating to Substitute Adding Equations"

My reading, against the built courses: **Dan has** solving a one-unknown equation with brackets and negatives (Solving
equations, Linear equations), rearranging a formula to make y the subject (Linear equations), the plotting of a line and the
gradient and intercept with y = mx + c (Straight-line graphs, assumed done as the brief says), and negatives
(Negative numbers). **Must be taught inline:** (1) a point is a pair that makes a rule true (a quick check by putting the
numbers in, which is the "test a solution" step Khan and Bitesize both use); (2) adding or subtracting a whole equation, as
a new use of the balance rule (one screen); (3) scaling an equation, every term (one screen, the common slip below); and
(4) Ohm's law and the two Kirchhoff laws, in one line each. **Deferred:** a line crossing a curve (Quadratics and
polynomials), the matrix method (Matrices), and parallel and perpendicular lines for their own sake (Straight-line graphs
already took parallel lines).


## 6. Misconceptions and learning science for each skill

Sources below are research papers, exam-board examiner reports and teaching-site lists. Hosts that republish an original
report (physicsandmathstutor, third-party lists) and tutoring sites are marked SECONDARY. The strongest are the Booth
papers (published journal articles) and the IES practice guides (federal review work); the small-journal study of student
errors and the student-teacher site are indicative only, so they carry the SECONDARY mark too.

### 6.1 Elimination: add or subtract, and signs

- **In a study of students, 76% chose the wrong operation (add instead of subtract, or the reverse) when eliminating** (SECONDARY)
  - Source: Some-Common-Misconstructions-and-Misinterpretations-in .... https://eajournals.org/wp-content/uploads/Some-Common-Misconstructions-and-Misinterpretations-in-Basic-Algebra-.pdf
  - Quote: "When eliminating a variable from a system of linear equations in problem 13, 76% of students misjudged the operations to be performed. Some of them chose the reverse operation, for example, adding when it had to be subtracted or vice versa."
- **The same study: the difficulty grew when the variables had opposite signs** (SECONDARY)
  - Source: Some-Common-Misconstructions-and-Misinterpretations-in .... https://eajournals.org/wp-content/uploads/Some-Common-Misconstructions-and-Misinterpretations-in-Basic-Algebra-.pdf
  - Quote: "Their difficulties were aggravated when the variables in the two equations had opposite signs ( – b , + b )."
- **The same study: students "concentrated on one equation of the system"** (SECONDARY)
  - Source: Some Common Misconstructions And Misinterpretations In Basic Algebra. https://eajournals.org/wp-content/uploads/Some-Common-Misconstructions-and-Misinterpretations-in-Basic-Algebra-.pdf
  - Quote: "Other misunderstandings of simultaneous equations were that students concentrated on one equation of the system."
- **The same study: a system with no unique solution (half could not say so; some used the coefficients as the answer)** (SECONDARY)
  - Source: Some Common Misconstructions And Misinterpretations In Basic Algebra. https://eajournals.org/wp-content/uploads/Some-Common-Misconstructions-and-Misinterpretations-in-Basic-Algebra-.pdf
  - Quote: "Problem 14 could not be solved simultaneously. 50% of the students could not indicate this statement as their answers due to lack of understanding whiles 12% of the students used the coefficients of _x_ and _y_ as the solution of _x_ and _y_ respectively."
- **Booth et al. 2014: in systems of equations, negative-sign errors were the most common**
  - Source: Persistent and Pernicious Errors in Algebraic Problem Solving. https://files.eric.ed.gov/fulltext/EJ1059995.pdf
  - Quote: "For Systems of equations, negative sign errors were most common, fol- lowed by variable and arithmetic errors"
- **Edexcel examiners (via PMT): those who subtracted when they should have added got no marks** (SECONDARY)
  - Source: Quadratics, Inequalities and Simultaneous Equations (H). https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Topic-Qs/Edexcel/Set-3/Algebra/Higher/Quadratics%2C%20Inequalities%20and%20Simultaneous%20Equations%20%28H%29.pdf
  - Quote: "Most candidates who had an idea of what to do multiplied the first equation by 3 and added. Those that subtracted were not awarded any marks."
- **Edexcel examiners (via PMT): elimination slipped on the arithmetic** (SECONDARY)
  - Source: Quadratics, Inequalities and Simultaneous Equations (H). https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Topic-Qs/Edexcel/Set-3/Algebra/Higher/Quadratics%2C%20Inequalities%20and%20Simultaneous%20Equations%20%28H%29.pdf
  - Quote: "Often, the elimination was carried out incorrectly with the difference between 12 x and – x being found as 11 x , for example. Once again, arithmetical weakness meant that candidates were losing marks."
- **Edexcel examiners (via PMT): good candidates checked their solution** (SECONDARY)
  - Source: Quadratics, Inequalities and Simultaneous Equations (H). https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Topic-Qs/Edexcel/Set-3/Algebra/Higher/Quadratics%2C%20Inequalities%20and%20Simultaneous%20Equations%20%28H%29.pdf
  - Quote: "was a pleasure to see some candidates properly checking their solution."
- **Third Space Learning: the first named mistake is choosing the wrong operation** (SECONDARY)
  - Source: Simultaneous Equations Worksheet, GCSE PDFs & Exam Questions. https://thirdspacelearning.com/gcse-maths/algebra/simultaneous-equations
  - Quote: "Incorrectly eliminating a variable. Using addition to eliminate one variable when you should subtract (and vice-versa)."
- **Third Space Learning: not multiplying every term, and not checking the answer** (SECONDARY)
  - Source: Simultaneous Equations Worksheet, GCSE PDFs & Exam Questions. https://thirdspacelearning.com/gcse-maths/algebra/simultaneous-equations
  - Quote: "Not multiplying every term in the equation. Mistakes when multiplying an equation. For example, forgetting to multiply every term by the same number. * Not checking the answer using substitution. Errors can quickly be spotted by substituting your solutions in the original first or second equations to check they work."
- **Bitesize KS3: "multiply the right-hand side too" is a named reminder**
  - Source: How to solve simultaneous equations (KS3 Maths | BBC Bitesize) - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zmpyn9q
  - Quote: "Don’t forget to multiply the right hand side by \(3\) as well."

My reading: the two biggest slips are the add-or-subtract choice and the signs, which confirms using a picture where the
two equations are shown stacked and the sign of the matching terms is made visible (the same signs subtract, opposite
signs add). Third Space names checking by substitution as the remedy, Edexcel examiners were pleased to see it, and
Bitesize's worked examples all end with a check. The check is cheap in this topic because the answer is a point on two lines.

### 6.2 The graph and the algebra are one idea
- **Teacher-training list: the typical slips (solving each equation alone, checking in only one, believing every system has a solution)** (SECONDARY)
  - Source: Misconceptions - Systems of Equations. https://lefevercd-examining-mathematics.weebly.com/misconceptions.html
  - Quote: "Student tries to solve each equation individually. + Combines terms on opposite sides of the equal sign when adding equations together. + Combines like terms incorrectly. + Substitute the value of “y” into either equation and solve for “x”. + Forget to check solutions"
- **Same list: treating approximate graph readings as exact, and a limited window hiding a solution** (SECONDARY)
  - Source: Misconceptions - Systems of Equations. https://lefevercd-examining-mathematics.weebly.com/misconceptions.html
  - Quote: "Assume approximations are exact answers + Believe every system has a solution + Assume all solutions can be seen within a limited viewing window of a graph"
- **Same list: being unable to interpret the answer in context** (SECONDARY)
  - Source: Misconceptions - Systems of Equations. https://lefevercd-examining-mathematics.weebly.com/misconceptions.html
  - Quote: "Unable to interpret solutions in context despite being able to solve the equations"
- **Preservice-teacher study (2026): a lack of firm understanding of simultaneous equations, and gaps in graphical methods**
  - Source: Frontiers | Nuances on algebra teaching knowledge: preservice mathematics teachers’ understandings of simultaneous equations. https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2026.1870360/full
  - Quote: "Limitations in KAT included, first, a lack of firm understanding of simultaneous equations and algebraic generalisation; and second, gaps in the use of graphical methods, in recognising the strengths and weaknesses of relevant solution methods (e.g., algebraic, numerical), and in articulating the mathematical content of the problems."
- **Same study: guess-and-check is not suitable for systems in general**
  - Source: Frontiers | Nuances on algebra teaching knowledge: preservice mathematics teachers’ understandings of simultaneous equations. https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2026.1870360/full
  - Quote: "While complete enumeration of the solution space and/or guided trial-and-error methods can be used in cases where the solutions are known to be integers, they are not suitable in the context of simultaneous equations in general, particularly where the solutions could be non-integer."
- **Eduqas examiners: very few had a method; they solved each equation alone or guessed**
  - Source: gcse examiners' reports - Eduqas. https://www.eduqas.co.uk/media/3belbcn2/eduqas-gcse-maths-report-n23-e.pdf
  - Quote: "Very few candidates had a method for solving simultaneous equations. Candidates often attempted to solve each equation individually by incorrectly attempting to take x’s and y’s from each side of the equation. Some candidates just attempted to solve the equations through trials of substituting numbers."
- **Edexcel examiners (via PMT): most used trial and improvement instead of forming equations** (SECONDARY)
  - Source: Quadratics, Inequalities and Simultaneous Equations (H). https://pmt.physicsandmathstutor.com/download/Maths/GCSE/Topic-Qs/Edexcel/Set-3/Algebra/Higher/Quadratics%2C%20Inequalities%20and%20Simultaneous%20Equations%20%28H%29.pdf
  - Quote: "Only a minority of students chose to derive a set of simultaneous equations to solve. The majority of students used a trial and improvement approach to the solution, which could only be credited on giving the correct answers."

My reading: the guess-and-check route is a real default (Eduqas, Edexcel), and the 2026 paper makes the useful point that
it only works when the answers are whole numbers. A lesson that opens with a puzzle that guessing can solve, then one it
cannot (non-integer answers), earns the need for the method. Showing the answer is a crossing point also answers
"solve each equation alone": each equation alone is a whole line of answers (Bitesize GCSE says an equation with more than one unknown "can have an infinite number of solutions").

### 6.3 The equals sign and signs in general (the base misconceptions)
- **Booth and Koedinger (via Booth et al. 2013): students read the equals sign as where the answer goes, not as balance** (SECONDARY)
  - Source: Example problems that improve student learning in algebra: Differentiating between correct and incorrect examples. https://files.eric.ed.gov/fulltext/ED543090.pdf
  - Quote: "students tend to think that the equals sign is an indicator of where the answer belongs, rather than of balance between the two sides"
- **SERP brief: misconceptions about equation features lead to fewer correct solutions** (SECONDARY)
  - Source: Microsoft Word - Misconceptions-WorkedExamplesRBrief_v2.docx. https://msan.wcer.wisc.edu/wp-content/uploads/2025/08/SERP-Misconceptions-Worked-Examples-Research-Brief.pdf
  - Quote: "students who hold misconceptions about critical features in algebraic equations solve fewer problems correctly (Booth & Koedinger, 2008)."
- **SERP brief: students who miss the sign or the balance idea delete or move signs and terms** (SECONDARY)
  - Source: Microsoft Word - Misconceptions-WorkedExamplesRBrief_v2.docx. https://msan.wcer.wisc.edu/wp-content/uploads/2025/08/SERP-Misconceptions-Worked-Examples-Research-Brief.pdf
  - Quote: "students who do not think of negative signs as connected in any way to the subsequent numerical term often delete or move negatives within equations or subtract a term from both sides of the equation to eliminate the term even when the value in question is already negative; similarly, students who do not think of the equals sign as an indicator of balance between the terms on either side"

My reading: adding or subtracting a whole equation is "do the same to both sides", so the equals-sign idea matters here:
the sum of the two left sides equals the sum of the two right sides. Dan has met balance in Solving equations, so one screen
on "adding two true statements gives a true statement" is enough.

### 6.4 Learning science for the lesson design
- **IES algebra guide: solved problems cut the load of abstract reasoning by showing the steps at once**
  - Source: Teaching Strategies for Improving Algebra Knowledge in Middle and High School Students. https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/WWC_Algebra_PG_Revised_02022018.pdf
  - Quote: "Solved problems can minimize the burden of_ _abstract reasoning_ _by allowing students to see the problem and many_ _solution steps_ _at once—without executing each step—helping students learn more efficiently."
- **IES algebra guide: the evidence rating for solved problems is minimal**
  - Source: Teaching Strategies for Improving Algebra Knowledge in Middle and High School Students. https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/WWC_Algebra_PG_Revised_02022018.pdf
  - Quote: "Summary of evidence: Minimal Evidence"
- **IES algebra guide: incorrect solved problems help students see why the errors are errors**
  - Source: Teaching Strategies for Improving Algebra Knowledge in Middle and High School Students. https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/WWC_Algebra_PG_Revised_02022018.pdf
  - Quote: "Exposing students to incorrect solved problems can help stu- dents understand the difference between correct and incorrect solution strategies and can highlight the reasoning behind common errors."
- **IES algebra guide: different representations (equations, graphs, word problems) show different things**
  - Source: Teaching Strategies for Improving Algebra Knowledge in Middle and High School Students. https://ies.ed.gov/ncee/wwc/Docs/PracticeGuide/WWC_Algebra_PG_Revised_02022018.pdf
  - Quote: "Teach students that different algebraic representations can convey different informa- tion about an algebra problem."
- **IES 2007 practice guide: alternate worked examples with problems to solve (rated moderate)**
  - Source: Organizing Instruction and Study to Improve Student Learning. https://ies.ed.gov/ncee/wwc/Docs/practiceguide/20072004.pdf
  - Quote: "Interleave worked example solutions with problem-solving exercises. Have students alternate between reading already worked solutions and trying to solve problems on their own. Moderate"
- **Rohrer et al. 2020: an interleaved assignment never has two neighbouring problems that need the same strategy**
  - Source: A randomized controlled trial of interleaved mathematics practice.. https://psycnet.apa.org/record/2019-26066-001
  - Quote: "an interleaved assignment is arranged so that no 2 consecutive problems require the same strategy."
- **A grade 7 classroom experiment on interleaved practice: 72% against 38% on a delayed test**
  - Source: The benefit of interleaved mathematics practice is not limited to superficially similar kinds of problems - PubMed. https://pubmed.ncbi.nlm.nih.gov/24578089/
  - Quote: "The mean test scores were greater for material learned by interleaved practice rather than by blocked practice (72 % vs. 38 %, d = 1.05)."

My reading: the choice between substitution and elimination is a "which strategy" decision, which is what interleaving
trains: mixing the two kinds in one set means Dan has to look at the equations to pick, as in a college exam. The IES
ratings are honest about the strength: solved problems "minimal", alternating them with practice "moderate". The
quick check by substitution is the app's "say it back" step in action.


## 7. Where it is used for an electrician going into marine engineering

Each use below has a quote from a page I could read. The strongest is the syllabus itself (section 3), because Dan will
be examined on it.

- **Kirchhoff problems by simultaneous equations are an examined line in Marine Electro-Technology**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "3. States Kirchhoffs Current Law. 4. States Kirchhoffs Voltage Law. 5. Describes a series circuit configuration using a variety of components and finds the equivalent resistance. 6. Describes a parallel circuit configuration using a variety of components and finds the equivalent resistance. 7. Solves problems on series/parallel circuits. 8. Solves problems on power and energy in dc resistive circuits. 9. Solves problems using Kirchhoffs laws by application of simultaneous equations (two unknowns only)."
- **Batteries in series and parallel with internal resistance feeding a load**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Solves problems involving batteries in series and in parallel combinations including internal resistance and current in a connected load."
- **HELM: circuit analysis is the "ready example" of simultaneous equations in electrical engineering**
  - Source: HELM Workbook 7 Matrices.pdf. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%207%20Matrices.pdf
  - Quote: "The solution of simultaneous linear equations is a task frequently occurring in engineering. In electrical engineering the analysis of circuits provides a ready example."
- **HELM Workbook 8: Kirchhoff on loops gives linear equations in the currents** (SECONDARY)
  - Source: Solution by Gauss Elimination. https://sheffield.ac.uk/media/31966/download?attachment
  - Quote: "Systems of linear equations arise in the modelling of electrical circuits or networks. By breaking down a complicated system into simple loops, Kirchhoff’s law can be applied. This leads to a set of linear equations in the unknown quantities (usually currents) which can easily be solved by one of the methods described in this Workbook."
- **Reeds Marine Engineer's electrotechnology volume teaches Kirchhoff's voltage law (the sum of the drops equals the applied P.D.)** (SECONDARY)
  - Source: Reeds Vol 6: Basic Electrotechnology for Marine Engineers. https://api.pageplace.de/preview/DT0400.9781472963840_A39142196/preview-9781472963840_A39142196.pdf
  - Quote: "VOLTAGE LAW. The sum of the potential or voltage drops taken round a circuit must equal to the applied P.D."
- **MCA Applied Mechanics syllabus 5.1.13 to 5.1.14: the law of a machine by graph and by analysis**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "13. Explains the law of a machine. 14. Determines the law of a machine by both graphical and analytical methods."
- **Bitesize Higher Physics: a cell's internal resistance is the gradient of the line through its readings (a straight-line law with two constants, emf and r)**
  - Source: Finding the EMF and internal resistance of a cell - Revise: Electrical sources and internal resistance - Higher Physics Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zxx66sg/revision/2
  - Quote: "To find the internal resistance of the cell the gradient of the line is calculated. This has a negative value. The internal resistance of the cell is the same value but without the negative sign."
- **HELM: frameworks too (forces on members) lead to large systems**
  - Source: HELM Workbook 7 Matrices.pdf. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%207%20Matrices.pdf
  - Quote: "When we wish to solve large systems of simultaneous linear equations, which arise for example in the problem of finding the forces on members of a large framed structure"
- **Bird's Basic Engineering Mathematics has a section on practical problems with simultaneous equations**
  - Source: Bird’s Basic Engineering Mathematics; Eighth Edition. https://api.pageplace.de/preview/DT0400.9781000299328_A40251821/preview-9781000299328_A40251821.pdf
  - Quote: "13.5 Practical problems involving simultaneous equations 124"

My reading: the trade uses are (1) Kirchhoff's laws for two loops, with the currents as unknowns (the HNC use and the
examined one); (2) two meter readings giving two equations in two constants, for example a battery's emf and internal
resistance from two load readings (E = V + Ir twice) or the constants a and b in the law of a machine, which links
to the straight-line law from Straight-line graphs; (3) sharing: two sources feeding one load or two unknown quantities
in one total. For (2) I found the syllabus lines and the straight-line version (Bitesize), but I did not find a
page that works the two-reading simultaneous-equation version in exact words, so the two-readings example is **UNCONFIRMED** as
a sourced worked example: the equations would be a computed rule shown on screen, not a cited number. Any numbers
in a lesson must be labelled as example figures.


## 8. Size: how many lessons the benchmarks spend

The counts below are lesson or page counts read off the contents lists above.

- **Brilliant: 31 lessons in all, 23 of them on systems of equations**
  - Source: Practice Linear Systems | Brilliant. https://brilliant.org/courses/linear-systems/
  - Quote: "Solve systems of equations and inequalities using graphs and algebra. 31 Lessons 563 Exercises"
- **Khan: 19 items in Algebra 1 Unit 6 (three quizzes and a unit test among them)**
  - Source: Systems of equations | Algebra 1 | Math. https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:systems-of-equations
  - Quote: "1. Solutions of systems of equations 2. Systems of equations with graphing 3. Creating systems in context 4. Interpret points relative to a system 5. Systems of equations: Quiz 1 6. Systems of equations with substitution 7. Combining equations 8. Elimination strategies 9. Systems of equations with elimination 10. Systems of equations with elimination challenge 11. Reasoning with systems of equations 12. Systems of equations: Quiz 2 13. Number of solutions to a system of equations graphically 14. Number of solutions to a system of equations algebraically 15. Age word problems 16. Systems of equations word problems 17. Systems of equations word problems (with zero and infinite solutions) 18. Systems of equations: Quiz 3 19. Systems of equations: Unit test"
- **Bitesize National 5: four pages**
  - Source: Solving simultaneous equations graphically - Working with simultaneous equations - National 5 Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z8gdb82/revision/1
  - Quote: "1. Solving simultaneous equations graphically 2. Solving simultaneous equations algebraically 3. Simultaneous equations - non-matching coefficients 4. Forming pairs of equations"
- **Bird: chapter 13, six sections from page 118**
  - Source: Bird’s Basic Engineering Mathematics; Eighth Edition. https://api.pageplace.de/preview/DT0400.9781000299328_A40251821/preview-9781000299328_A40251821.pdf
  - Quote: "13 Solving simultaneous equations 118 13.1 Introduction 118 13.2 Solving simultaneous equations in two unknowns 118 13.3 Further solving of simultaneous equations 120 13.4 Solving more difficult simultaneous equations 122 13.5 Practical problems involving simultaneous equations 124 13.6 Solving simultaneous equations in three unknowns 128"
- **Brilliant lessons run about 5 to 10 minutes**
  - Source: How Brilliant fits into a math lesson | Brilliant. https://brilliant.org/help/schools-and-educators/how-brilliant-fits-into-a-math-lesson/
  - Quote: "Lesson: usually 5–10 minutes each. A typical lesson includes a short sequence of interactive problems and a Skills Check (practice problems) at the end."

My reading of the size: Brilliant spends 23 lessons on the equation side, Khan 15 content items (and 4 tests), Bitesize 4 pages,
Bird about 14 pages. Straight-line graphs is planned at six lessons and Linear equations at six, so six is the scale
Dan's earlier algebra courses have used; the MCA and HNC lines need only the "two unknowns" level.

**Which core supports four to six lessons for Dan** (My reading, a suggestion for the brief, not the brief):
1. Two lines, two rules: the crossing point (graph, test a point, approximate answers).
2. Substitution (replace a letter by its equal).
3. Elimination (add or subtract equations, scale an equation).
4. No answer and endless answers (parallel lines, the same line, what the algebra shows).
5. From words to equations (two facts about two unknowns, check in the story).
6. Kirchhoff's laws for a two-loop circuit (the HNC use).
That is six, which is the top of the range; merging 2 and 3 into one lesson with two pictures would make five and
dropping 5 into the others would make four. An optional seventh stretch lesson on three unknowns is supported only by
the MCA Second Engineer line (2.1.29) and Bird 13.6, not by the HN criteria or by Brilliant, so it is a choice for the brief.
Systems of inequalities (Brilliant levels 4 and 5, 8 lessons) are left out: no syllabus line asks for them.

