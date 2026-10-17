# Quadratics and polynomials: research notes

Researched 17 Oct 2026 for the Quadratics and polynomials course brief (the sixth course in the Maths shelf's Algebra
folder; blurb "Parabolas, factorising and the quadratic formula, then curves built from higher powers.", from
"Brilliant: Quadratics and Polynomials"). The brief itself is not written here; these notes are its evidence. Dan is an
electrician preparing for marine engineering college (HNC/HND route). He has Fractions, Negative numbers, Percentages,
Proportional reasoning, Solving equations, The coordinate plane, Geometry fundamentals, Linear equations (like terms,
brackets, factorising out a common factor, equations with brackets, inequalities, rearranging formulas) and Calculus
fundamentals behind him, and the earlier Algebra courses being built in the same push are assumed done: Straight-line
graphs, Linear systems, Powers and roots, Functions and their graphs. Exponentials and logarithms, Trigonometry and
Complex numbers come after this one.

Every finding has its source title, URL and the exact words, copied from a saved tool result by script (the quotes
were not retyped into this file). All of them are listed in `quotes.json` beside this file and were checked with
`node tools/eval/sources.mjs --quotes ... --tools ...` (`failed: 0`). The tool files are in `tools/`; files 01 and 02 are
the MCA syllabus fetches from the Calculus fundamentals research, copied unchanged. Findings I could not confirm are
marked **UNCONFIRMED**; where only a non-original site said it, **SECONDARY**. My own readings are marked "My reading"
and are not quotes. Where a saved search excerpt shows maths as plain text or leaves gaps where the page had formula
images, the quote is shown as the tool returned it.

---

## 1. Benchmark: Brilliant's Quadratics and Polynomials

There is no single Brilliant course called "Quadratics and Polynomials". Brilliant's course list has two: **Quadratics**
and **Polynomials**. The shelf's benchmark label joins them. Both pages were reachable on 17 Oct 2026.

### 1.1 Quadratics (80 lessons)
- **Brilliant's Quadratics is 80 lessons and 1468 exercises**
  - Source: Practice Quadratics | Brilliant. https://brilliant.org/courses/quadratics/
  - Quote: "Learn to work fluently with quadratic expressions and equations. 80 Lessons 1468 Exercises"
- **Quadratics levels 1 to 5: multiplying, distributing, factoring (with signs)**
  - Source: Practice Quadratics | Brilliant. https://brilliant.org/courses/quadratics/
  - Quote: "Level 1 Multiplying Expressions Multiplying Expressions Multiplying Binomials Finding the Units Finding Linear Terms Level Check Level 2 Distributing and Combining Finding Combined Linear Terms Variables with a Multiple Linear and Constant Terms Finding All the Terms Level Check Level 3 Factoring Expressions Undistributing Finding One Factor Finding Both Sides Factoring Quadratics Level 4 Expressions with Signed Numbers Multiplying Signed Constants Multiplying Signed Linear Linear with Coefficients Finding Signs Linear and Constant Terms Level 5 Factoring with Signed Numbers Factoring with Negatives Finding Numbers and Signs Leading Coefficients Finding Entire Factors"
- **Quadratics levels 6 to 8: graphing factored form, solving by factoring, applications**
  - Source: Practice Quadratics | Brilliant. https://brilliant.org/courses/quadratics/
  - Quote: "Level 6 Graphing Factored Form Solutions to Quadratic Equations Plotting Solutions Plotting x-Intercepts Factors from Intercepts Factored Form Level 7 Solving by Factoring Solutions on a Graph Solutions to Quadratics Solving by Factoring The Importance of Zero Hard-to-factor Expressions Level 8 Applications of Quadratics Applied Quadratics Combinations Graphing Quadratic Data"
- **Quadratics levels 9 to 12: vertex form, solving by undoing, complex solutions, motion**
  - Source: Practice Quadratics | Brilliant. https://brilliant.org/courses/quadratics/
  - Quote: "Level 9 Graphing Vertex Form Shifting Up and Down Graphing a Vertical Shift Shifting Right and Left Graphing a Horizontal Shift Finding the New Vertex Stretching and Reflecting Graphing a Vertical Stretch Using All the Parameters Graphing from Vertex Form Level 10 Solving by Undoing Finding Solutions How Many Solutions Splitting Equations Equations with More Steps Level 11 Complex Solutions Irrational Solutions No Real Solutions The Imaginary Unit Complex Solutions Level 12 Motion Linear Motion Motion Under Gravity Solving Motion Equations Negative Motion Terms Viable Solutions"
- **Quadratics levels 13 to 17: completing the square, the formula, discriminant, symmetry, applying the formula**
  - Source: Practice Quadratics | Brilliant. https://brilliant.org/courses/quadratics/
  - Quote: "Level 13 Completing the Square Squaring Binomials Perfect Square Trinomials Solving by Factoring Perfect Squares Completing the Square Solving by Completing the Square Level 14 Graphing by Completing the Square Rewriting in Vertex Form Using Complete the Square Vertex Form with Leading Coefficients Maximum or Minimum Value Completing the Square with Leading Coefficients Level 15 The Quadratic Formula Completing Any Square Building a Formula The Quadratic Formula Using the Formula Rearranging First The Discriminant Level 16 Symmetry The Axis of Symmetry Axis of Symmetry to Vertex Reading Different Forms Equations from Symmetry Choosing the Right Form Level 17 Applying the Quadratic Formula Using the Discriminant Applied Maximums and Minimums Maximizing Height"
- **Brilliant's description and topics for Quadratics**
  - Source: Practice Quadratics | Brilliant. https://brilliant.org/courses/quadratics/
  - Quote: "In this course, you'll build visual intuition for multiplying linear terms as well as factoring quadratic expressions. You'll also graph quadratic functions and learn techniques for solving quadratic equations. Topics covered * Multiplying linear expressions * Factoring quadratic expressions * Graphing the zeroes of a quadratic function * Solving quadratic equations by factoring * Graphing a quadratic function from vertex form"

My reading of the order: expanding comes first (levels 1 and 2), then factoring (3 to 5), then the parabola's roots on a
graph before any solving (level 6, "Graphing Factored Form"), then "Solving by Factoring" (7) with a lesson called
"The Importance of Zero" and one called "Hard-to-factor Expressions" that leads to what comes later. Vertex form (9) is
taught before completing the square (13 and 14), and the quadratic formula (15) comes after completing the square, with
the discriminant as the last lesson of that level. "Motion Under Gravity" and "Viable Solutions" (12) sit between the
undoing methods and completing the square, so the projectile is met early and its negative root is thrown away
explicitly. The page gives only titles, so what happens inside each lesson is **UNCONFIRMED** (I did not see a lesson).

### 1.2 Polynomials (52 lessons)
- **Brilliant's Polynomials is a separate course of 52 lessons and 921 exercises**
  - Source: Practice Polynomials | Brilliant. https://brilliant.org/courses/polynomials/
  - Quote: "Master the fundamentals of polynomials, one of the most important families of functions in all of algebra. 52 Lessons 921 Exercises"
- **Polynomials levels 1 to 5: power functions, even and odd, transforming, polynomial functions, graphs**
  - Source: Practice Polynomials | Brilliant. https://brilliant.org/courses/polynomials/
  - Quote: "Level 1 Power Functions A First Look At Polynomials Power Functions Comparing Powers The Dominance of Powers Between -1 and 1 Level Check Level 2 Even and Odd Powers Even and Odd Powers Symmetry of Even Powers Symmetry of Odd Powers Level Check Level 3 Transforming Power Functions Vertical Shifts Stretches Negative Stretches Horizontal Shifts Identifying Transformations Transforming Power Functions The Shape of Power Functions Level 4 Polynomial Functions Evaluating Polynomials Coefficients Graphing Polynomials The Constant Term Level 5 Graphs of Polynomials Even Degree Polynomials Odd Degree Polynomials Parity of Polynomial Graphs Small and Large Terms Polynomial graphs far from 0 Polynomial Graphs near to 0 Leading Coefficients other than 1"
- **Polynomials levels 6 to 10: roots, sums, products, factors and roots, finding factors**
  - Source: Practice Polynomials | Brilliant. https://brilliant.org/courses/polynomials/
  - Quote: "Level 6 Roots Introduction to Roots Degree and Roots Roots of Even Polynomials Roots of Odd Polynomials Root Finding Level 7 Sums of Polynomials Adding Polynomials Subtracting Polynomials Subtracting with Negatives Meet Multivariable Polynomials Add Multivariable Polynomials Level 8 Products of Polynomials Multiplying Monomials Scaling Polynomials Monomial Times Polynomial Multiplying Polynomials Powers of Polynomials Factoring Out Monomials Level 9 Factors and Roots Roots from Factored Form Factored Form from Roots Graphical Factoring Roots with Multiplicity Sign Changes at Roots Level 10 Finding Factors Solving By Factoring Quadratic Factors Factoring with Power Sums Differences of Nᵗʰ Powers Factoring Biquadratic Polynomials"
- **Brilliant's description of Polynomials: graphs, roots and factors**
  - Source: Practice Polynomials | Brilliant. https://brilliant.org/courses/polynomials/
  - Quote: "In this course, learners will study the graphs of polynomials and how they relate to their algebraic properties. Beginning with a deep study of the power functions, the course builds up through transformations of power functions into an intuitive study of the graphs of polynomials. Next, learn about the roots of polynomials and how they connect to factors of the polynomials. Finally, dive into special polynomial factorization problems. Topics covered * Power functions * Transformations of power functions * Evaluating Polynomials * Graphing Polynomials * Roots * Adding Polynomials * Multiplying Polynomials * Factors and Roots * Factoring Polynomials"
- **Brilliant's own page says what to supplement: polynomial long and synthetic division**
  - Source: Does Brilliant cover Algebra 2? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-algebra-2/
  - Quote: "Polynomial division. Long division and synthetic division. Brilliant handles the related idea of moving between a polynomial’s roots and its factored form, in Graphical Factoring"

My reading: Brilliant's Polynomials starts from power functions (y = x², y = x³ and so on) and their shifts and stretches,
which Dan's Functions course already covers as families, shifts and stretches. Its polynomial arithmetic, factors and
roots come after that, and it has no long division of its own: Brilliant says that is what to "supplement".

### 1.3 Where they sit in Brilliant's path
- **Brilliant's path: Quadratics sits in Intermediate Algebra between Linear Systems and Coordinate Transformations**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "Understand core ideas to crush early high school courses like Algebra 1 or Integrated Math 1 and 2 Understand core ideas to crush early high school courses like Algebra 1 or Integrated Math 1 and 2 GR 8–9 Introduction to Functions GR 8–9 Linear Systems New GR 9 Quadratics GR 8–9 Coordinate Transformations GR 9–10 Exponential Functions"
- **Brilliant's Advanced Algebra band holds Polynomials, Logarithms and Complex Numbers**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "Study the functions and graphs of later high school courses like Algebra 2, Integrated Math 2 and 3, and Precalculus Study the functions and graphs of later high school courses like Algebra 2, Integrated Math 2 and 3, and Precalculus GR 11–12 Trigonometric Functions GR 11–12 Polynomials New GR 11–12 Equations and Curves New GR 11–12 Logarithms GR 12 Polar Coordinate Plane GR 11–12 Complex Numbers"
- **Brilliant says its Polynomials course matches the Algebra 2 polynomial unit**
  - Source: Does Brilliant cover Algebra 2? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-algebra-2/
  - Quote: "Polynomials is the single best match for the Algebra 2 polynomial unit, with 52 lessons and 16 mapped skills. It covers the arithmetic — Adding Polynomials , Subtracting Polynomials , and Multiplying Polynomials"
- **Brilliant splits complex numbers: Quadratics handles the quadratic with no real solution**
  - Source: Does Brilliant cover Algebra 2? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-algebra-2/
  - Quote: "Quadratics handles the first. Complex Solutions covers N.CN.7, solving quadratic equations with complex solutions."
- **Brilliant's Quadratics and Exponents and Radicals are its review-level courses for Algebra 2**
  - Source: Does Brilliant cover Algebra 2? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-algebra-2/
  - Quote: "Quadratics and Exponents and Radicals are the two review-level courses in this list — grade bands 9 and 8 respectively. The Axis of Symmetry and Rewriting in Vertex Form are good checks on whether your Algebra 1 quadratics are solid before polynomials get harder."

My reading: in Brilliant's own order Quadratics comes after Introduction to Functions and Linear Systems and before
Exponential Functions, which is the order of Dan's Algebra folder (Functions and their graphs, then this course, then
Exponentials and logarithms). The Polynomials course, by contrast, sits in Brilliant's later "Advanced Algebra" band
with Trigonometric Functions, Logarithms and Complex Numbers. So in Dan's folder the polynomial half is early, and Brilliant
itself treats it as the harder, later half. That supports keeping the higher-degree part light and forward-looking.
Brilliant also splits complex numbers in two (the negative discriminant in Quadratics, the number system in Complex Numbers),
which matches this folder: a negative discriminant is "no real roots" here, and the root of a negative number belongs to
Complex numbers.

---

## 2. Other courses' order for the same ground

### 2.1 Khan Academy
- **Khan Academy Algebra 1 puts Quadratics: Multiplying and factoring before Quadratic functions and equations**
  - Source: Quadratic functions & equations | Algebra 1 | Math | Khan Academy. https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations
  - Quote: "Unit 13 Quadratics: Multiplying & factoring Unit 14 Quadratic functions & equations Unit 15"
- **Khan Algebra 1 Unit 14: the order of its 31 skills**
  - Source: Quadratic functions & equations | Algebra 1 | Math | Khan Academy. https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations
  - Quote: "1. Parabolas intro 2. Interpret parabolas in context 3. Interpret a quadratic graph 4. Zero product property 5. Graph quadratics in factored form 6. Quadratic word problems (factored form) 7. Quadratic functions & equations: Quiz 1 8. Quadratics by taking square roots (intro) 9. Quadratics by taking square roots 10. Quadratics by taking square roots: strategy 11. Quadratics by taking square roots: with steps 12. Graph quadratics in vertex form 13. Quadratic word problems (vertex form) 14. Quadratic functions & equations: Quiz 2 15. Quadratics by factoring (intro) 16. Quadratics by factoring 17. Solve equations using structure 18. Quadratic formula 19. Number of solutions of quadratic equations 20. Quadratic functions & equations: Quiz 3 21. Completing the square (intro) 22. Completing the square (intermediate) 23. Solve equations by completing the square 24. Complete the square 25. Strategy in solving quadratics 26. Quadratic functions & equations: Quiz 4 27. Graph quadratics in standard form 28. Quadratic word problems (standard form) 29. Features of quadratic functions: strategy 30. Features of quadratic functions 31. Graph parabolas in all forms 32. Interpret quadratic models 33. Quadratic functions & equations: Quiz 5 34. Compare quadratic functions 35. Shift parabolas 36. Scale & reflect parabolas 37. Quadratic functions & equations: Quiz 6 38. Quadratic functions & equations: Unit test"
- **Khan Algebra 1 (IM-aligned) unit 8 begins with a quadratic from a geometric context**
  - Source: Quadratic equations | Algebra 1 (IM® v.360 aligned) | Math | Khan Academy. https://www.khanacademy.org/math/algebra-1-illustrative-math/x6418b49dfbc9d0c9:quadratic-equations-part1
  - Quote: "1. Quadratic equation from geometric context 2. Quadratics by taking square roots (intro) 3. Quadratics by taking square roots: strategy 4. Quadratics by taking square roots: with steps 5. Zero product property"
- **Khan's Eureka-aligned Algebra 1 quadratic unit begins from real contexts such as projectile motion**
  - Source: Quadratic functions | Khan Academy. https://www.khanacademy.org/math/algebra-1-eureka-squared-aligned/x15446f63b23e2a07:untitled-8
  - Quote: "Explore quadratic functions and their graphs through real-world contexts like projectile motion, identifying key features and comparing them to linear functions. Solve quadratic equations using factoring and completing the square, and connect algebraic methods to graphical representations."
- **Khan's Algebra basics unit 7 (multiplying, factoring, solving by factoring) in order**
  - Source: Quadratics and polynomials | Algebra basics | Math | Khan Academy. https://www.khanacademy.org/math/algebra-basics/quadratics-polynomials-topic
  - Quote: "1. Add polynomials (intro) 2. Subtract polynomials (intro) 3. Multiply monomials by polynomials 4. Multiply binomials intro 5. Multiply binomials 6. Multiply difference of squares 7. Quadratics and polynomials: Quiz 1 8. Factor polynomials: common factor"
- **Khan's Algebra basics unit 7 says what the unit is for**
  - Source: Quadratics and polynomials | Algebra basics | Math | Khan Academy. https://www.khanacademy.org/math/algebra-basics/quadratics-polynomials-topic
  - Quote: "We'll now progress beyond the world of purely linear expressions and equations and enter the world of quadratics (and more generally polynomials). Learn to factor expressions that have powers of 2 in them and solve quadratic equations. We'll also learn to manipulate more general polynomial expressions."
- **Khan Algebra 2 has polynomial arithmetic, factorization, division and graphs as four separate units**
  - Source: Algebra 2 | Math | Khan Academy. https://www.khanacademy.org/math/algebra2
  - Quote: "Algebra 2 12 units Unit 1 Polynomial arithmetic Unit 2 Complex numbers Unit 3 Polynomial factorization Unit 4 Polynomial division Unit 5 Polynomial graphs"
- **Khan Algebra 2 polynomial division unit: skills in order, ending in the remainder theorem**
  - Source: Polynomial division | Algebra 2 | Math | Khan Academy. https://en.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:poly-div
  - Quote: "1. Divide polynomials by x (no remainders) 2. Divide polynomials by x (with remainders) 3. Divide quadratics by linear expressions (no remainders) 4. Divide quadratics by linear expressions (with remainders) 5. Polynomial division: Quiz 1 6. Divide polynomials by linear expressions 7. Factor using polynomial division 8. Remainder theorem 9. Remainder theorem and factors"
- **Khan Algebra 2 polynomial division unit: why a remainder**
  - Source: Polynomial division | Algebra 2 | Math | Khan Academy. https://en.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:poly-div
  - Quote: "After we have added, subtracted, and multiplied polynomials, it's time to divide them! This will prove to be a little bit more sophisticated. It turns out that not every polynomial division results in a polynomial. When it doesn't, we end up with a remainder (just like with integer division!)."
- **Khan Algebra 2 polynomial graphs unit: zeros, multiplicity, end behaviour**
  - Source: Algebra 2 | Math | Khan Academy. https://www.khanacademy.org/math/algebra2
  - Quote: "Zeros of polynomials (factored form) 60. Zeros of polynomials (with factoring) 61. Positive & negative intervals of polynomials 62. Zeros of polynomials (multiplicity) 63. End behavior of polynomials"

My reading: Khan's Algebra 1 splits the ground into "multiplying and factoring" (Unit 13) and "functions and equations"
(Unit 14). Unit 14 goes parabola first, then the zero product property, factored-form graphs, square roots, vertex form,
factoring, the formula and the number of solutions, then completing the square, then standard-form graphs and models. The
Illustrative Mathematics version starts from a quadratic equation in a geometric context. In Algebra 2, polynomial
arithmetic, factorisation, division and graphs are four separate units, and the division unit ends with the remainder
theorem and "Remainder theorem and factors". The Unit 13 skill list was not readable (the page did not render the skills),
so its exact order is **UNCONFIRMED**; the Algebra basics Unit 7 list above shows the same ground in order.

### 2.2 BBC Bitesize and SQA
- **Bitesize (Edexcel GCSE) solving quadratic equations: seven pages in order**
  - Source: Quadratic equations - Solving quadratic equations - Edexcel - GCSE Maths Revision - Edexcel - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z3hb97h/revision/1
  - Quote: "1. Quadratic equations 2. Solving by quadratic formula - Higher 3. Solving by completing the square - Higher 4. Graphs of quadratic functions 5. Finding roots by factorising 6. The turning point and line of symmetry - Higher 7. Solving equations using iteration"
- **Bitesize says each method also gives information about the graph**
  - Source: Quadratic equations - Solving quadratic equations - Edexcel - GCSE Maths Revision - Edexcel - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z3hb97h/revision/1
  - Quote: "Solve quadratic equations by factorising, using formulae and completing the square. Each method also provides information about the corresponding quadratic graph."
- **Bitesize: factorising is the reverse of expanding; quadratics factorise into two brackets**
  - Source: How to factorise an expression - GCSE Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zdtdh4j
  - Quote: "Factorising is the reverse process of expanding brackets. * Quadratic expressions contain 𝑥² and can be factorised into two brackets."
- **Bitesize points back to expanding double brackets and negative numbers before factorising quadratics**
  - Source: How to factorise an expression - GCSE Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zdtdh4j
  - Quote: "Support your understanding of factorising quadratics by looking at these guides on simplifying expressions and expanding double brackets and calculating with negative numbers."
- **SQA National 5 course: factorising skills named (common factor, difference of squares, trinomials)**
  - Source: National 5 Mathematics Course Specification. https://www.sqa.org.uk/sqa/files_ccc/n5-course-spec-mathematics.pdf
  - Quote: "Factorising an algebraic expression Common factor Difference of squares p x − a 2 2 2 Trinomials with unitary and non-unitary 2 x coefficient Combinations of the above"
- **SQA National 5 course: features of a quadratic and solving from factorised form**
  - Source: National 5 Mathematics Course Specification. https://www.sqa.org.uk/sqa/files_ccc/n5-course-spec-mathematics.pdf
  - Quote: "Identifying features of a quadratic function Identify: the nature and coordinates of the turning point the equation of the axis of symmetry of a quadratic of the form ( ) y k x p q = + 2 + where , , k p q Solving a quadratic equation Solving from factorised form Solving having factorised first Graphical treatment"
- **SQA National 5 course: formula and discriminant**
  - Source: National 5 Mathematics Course Specification. https://www.sqa.org.uk/sqa/files_ccc/n5-course-spec-mathematics.pdf
  - Quote: "Solving a quadratic equation using the quadratic formula Solving using the quadratic formula Using the discriminant to determine the number of roots Know and use the discriminant Determine the number and describe the nature of"
- **SQA National 5 course: connect the algebra and the graph of a quadratic**
  - Source: National 5 Mathematics Course Specification. https://www.sqa.org.uk/sqa/files_ccc/n5-course-spec-mathematics.pdf
  - Quote: "Emphasis of the connection between the algebraic and graphical aspects of quadratic equations"
- **SQA N5 course notes: make connections with geometrical representations when expanding brackets**
  - Source: National 5 Mathematics Course Specification. https://www.sqa.org.uk/sqa/files_ccc/n5-course-spec-mathematics.pdf
  - Quote: "Make connections with geometrical representations. Emphasise a systematic approach to expansion of brackets."
- **SQA N5 course notes: use areas; factorising is the inverse of expanding**
  - Source: National 5 Mathematics Course Specification. https://www.sqa.org.uk/sqa/files_ccc/n5-course-spec-mathematics.pdf
  - Quote: "Use practical examples including calculation of areas. Emphasise that factorising is the inverse process to expanding brackets."
- **SQA N5 course notes: connect graph features to the equations**
  - Source: National 5 Mathematics Course Specification. https://www.sqa.org.uk/sqa/files_ccc/n5-course-spec-mathematics.pdf
  - Quote: "Connect features of graphs to the equations of quadratic functions."
- **SQA N5 course notes: completing the square can be combined with sketching**
  - Source: National 5 Mathematics Course Specification. https://www.sqa.org.uk/sqa/files_ccc/n5-course-spec-mathematics.pdf
  - Quote: "completing the square could be combined with sketching a quadratic function"
- **SQA N5 course notes: a quadratic equation and graph in a context-based problem**
  - Source: National 5 Mathematics Course Specification. https://www.sqa.org.uk/sqa/files_ccc/n5-course-spec-mathematics.pdf
  - Quote: "a quadratic equation and graph could be used in a context-based problem"
- **SQA N5 question paper 1 is set without a calculator**
  - Source: National 5 Mathematics Course Specification. https://www.sqa.org.uk/sqa/files_ccc/n5-course-spec-mathematics.pdf
  - Quote: "without the aid of a calculator"

My reading: Bitesize (Edexcel GCSE) runs equations, then formula (Higher), then completing the square (Higher), then
graphs, roots by factorising, and the turning point and line of symmetry (Higher). SQA National 5 names the whole of this
ground at one level: factorising (common factor, difference of squares, trinomials), completing the square, the turning
point and axis of symmetry, solving from factorised form and by formula, and the discriminant. National 5 (or Intermediate 2, or the NQ unit Mathematics: Technician 1) is the level
SQA's HN Engineering Mathematics 1 asks for on entry (3.1), so for a student in the SQA route this course teaches ground
that the college treats as known. The course notes also say how to teach it: link expanding to geometry and areas, link
algebra to the graph, and use contexts.

### 2.3 HELM (Loughborough)
- **HELM Workbook 3 sections: linear, quadratic, polynomial, simultaneous, inequalities, partial fractions**
  - Source: HELM Workbook 49 Student's Guide - Loughborough University. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2049%20Student's%20Guide.pdf
  - Quote: "3.1 Solving Linear Equations 3.2 Solving Quadratic Equations 3.3 Solving Polynomial Equations 3.4 Solving Simultaneous Linear Equations 3.5 Solving Inequalities 3.6 Partial Fractions"
- **HELM 3.2 learning outcomes** **SECONDARY** (Imperial mirror of the Loughborough workbook)
  - Source: About the HELM Project. https://nucinkis-lab.cc.ic.ac.uk/HELM/HELM_Workbooks_1-5/WB3-all.pdf
  - Quote: "recognise a quadratic equation • solve a quadratic equation by factorisation • solve a quadratic equation using the standard formula • solve a quadratic equation by completing the square • interpret the solution of a quadratic equation graphically"
- **HELM's three techniques for quadratics** **SECONDARY** (Imperial mirror)
  - Source: About the HELM Project. https://nucinkis-lab.cc.ic.ac.uk/HELM/HELM_Workbooks_1-5/WB3-all.pdf
  - Quote: "We shall now describe three techniques for solving quadratic equations: • factorisation • completing the square • using the quadratic formula"
- **HELM Workbook 3 commentary: what the workbook deals with**
  - Source: Introduction, HELM consortium, institutions, contributors, .... https://nucinkis-lab.cc.ic.ac.uk/HELM/HELM_Workbooks_46-50/WB50-all.pdf
  - Quote: "The areas that this Workbook deals with are: the solution of linear equations, the ‘solution’ of quadratic equations and polynomial equations in general, simultaneous equations, simple inequalities and their solution, determination of partial fractions."
- **HELM Workbook 1 (Basic Algebra) sections: simplification and factorisation come before**
  - Source: HELM workbook 1 - Basic Algebra. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Algebra.pdf
  - Quote: "1.1 Mathematical Notation and Symbols 2 1.2 Indices 21 1.3 Simplification and Factorisation 40 1.4 Arithmetic of Algebraic Fractions 62 1.5 Formulae and Transposition"
- **HELM Workbook 5 (Functions and Modelling) has a Quadratic Functions and Modelling section**
  - Source: Help Engineers Learn Mathematics (HELM) workbooks | MASH | The University of Sheffield. https://sheffield.ac.uk/mash/maths-resources/helm
  - Quote: "Quadratic Functions and Modelling"
- **HELM Workbook 5 models only linear, quadratic and trigonometric functions**
  - Source: Introduction, HELM consortium, institutions, contributors, .... https://nucinkis-lab.cc.ic.ac.uk/HELM/HELM_Workbooks_46-50/WB50-all.pdf
  - Quote: "Since Workbook 5 is early in the HELM series, it deals only with models that involve linear, quadratic and trigonometric functions."
- **HELM was written with engineers in mind and workbooks 1 to 3 are the foundations**
  - Source: Introduction, HELM consortium, institutions, contributors, .... https://nucinkis-lab.cc.ic.ac.uk/HELM/HELM_Workbooks_46-50/WB50-all.pdf
  - Quote: "They tended to use the most fundamental Workbooks (1: Basic Algebra, 2: Basic Functions, 3: Equations, Inequalities & Partial Fractions) as they wanted to establish the foundations with what would be regarded as fairly weak mathematicians."
- **HELM Workbook 10 (Complex Numbers) already uses polynomials: complex roots of real-coefficient polynomials come in pairs**
  - Source: Complex Numbers. - Mathematics Materials. https://nucinkis-lab.cc.ic.ac.uk/HELM/HELM_Workbooks_6-10/WB10-all.pdf
  - Quote: "Complex roots to polynomial equations having real coefficients always occur in complex conjugate pairs"

The workbook quotes marked SECONDARY come from an Imperial College mirror of the Loughborough PDF (the Loughborough
download links returned a 404), so they are the right text on a copy host.

My reading: HELM Workbook 3 is the one for this course, in this order: linear equations, quadratic equations, polynomial
equations, simultaneous equations, inequalities, partial fractions. Workbook 1 (Basic Algebra) comes before it with
simplification and factorisation. HELM treats quadratics and polynomial equations as two sections of one workbook, which
is the shape of the course here, and its quadratic section names three techniques (factorisation, completing the square,
the formula) and asks for a graphical reading of the solution. Its tutor's guide describes the same move as the discriminant
lesson: look at graphs for two solutions, one or none, then let algebra confirm. Workbook 10 returns to the same ground once
the roots go complex (that part belongs to Complex numbers).

### 2.4 Bird's Engineering Mathematics
- **Bird's Basic Engineering Mathematics: quadratics follow simultaneous equations**
  - Source: Basic Engineering Mathematics | John Bird | Taylor & Francis eBooks, R. https://www.taylorfrancis.com/books/mono/10.4324/9781315561776/basic-engineering-mathematics-john-bird
  - Quote: "chapter 13 | 12 pages Solving simultaneous equations Title Abstract ... chapter 14 | 10 pages Solving quadratic equations"
- **Bird's Engineering Mathematics (9th ed): algebra, further algebra, partial fractions, then quadratics**
  - Source: Bird's Engineering Mathematics - 9th Edition - John Bird - Routledge B. https://www.routledge.com/Birds-Engineering-Mathematics/Bird/p/book/9780367643782
  - Quote: "5. Algebra 6. Further algebra 7. Partial fractions 8. Solving simple equations 9. Transposition of formulae 10. Solving simultaneous equations 11. Solving quadratic equations 12. Inequalities"
- **Bird's Higher Engineering Mathematics opens with Algebra then Partial fractions**
  - Source: Bird's Higher Engineering Mathematics - 9th Edition - John Bird - Rout. https://www.routledge.com/Birds-Higher-Engineering-Mathematics/Bird/p/book/9780367643737
  - Quote: "Section A Number and algebra 1 Algebra 2 Partial fractions 3 Logarithms"
- **Bird: polynomial division and the factor and remainder theorems are in one short chapter**
  - Source: Engineering Mathematics with John Bird FreeBook - Routledge. https://www.routledge.com/rsc/downloads/Engineering_Mathematics_with_John_Bird_FreeBook.pdf
  - Quote: "In this chapter, polynomial division and the factor and remainder theorems are explained (in Sections 1.4 to 1.6)."
- **Bird says polynomial division is needed for partial fractions**
  - Source: Engineering Mathematics with John Bird FreeBook - Routledge. https://www.routledge.com/rsc/downloads/Engineering_Mathematics_with_John_Bird_FreeBook.pdf
  - Quote: "and polynomial division is sometimes required when resolving into partial fractions – see Chapter 2"
- **Bird states the factor theorem**
  - Source: Engineering Mathematics with John Bird FreeBook - Routledge. https://www.routledge.com/rsc/downloads/Engineering_Mathematics_with_John_Bird_FreeBook.pdf
  - Quote: "There is a simple relationship between the factors of a quadratic expression and the roots of the equation obtained by equating the expression to zero. This is just a generalised version of what we established above for the quadratic expression. The factor theorem provides a method of factorising any polynomial, f (x) , which has simple factors. A statement of the factor theorem says: ‘if x = a is a root of the equation f ( x ) = 0 , then ( x − a ) is a factor of f ( x )’"
- **Bird on the remainder theorem: of itself not useful unless the remainder is zero**
  - Source: Engineering Mathematics with John Bird FreeBook - Routledge. https://www.routledge.com/rsc/downloads/Engineering_Mathematics_with_John_Bird_FreeBook.pdf
  - Quote: "It is not particularly useful, on its own, to know the remainder of an algebraic division. However, if the remainder should be zero then (x − p) is a factor."
- **Bird's Engineering Mathematics (4th ed): Further algebra holds polynomial division, factor theorem, remainder theorem**
  - Source: Engineering Mathematics. https://uodiyala.edu.iq/uploads/PDF%20ELIBRARY%20UODIYALA/EL24/Engineering_Mathematics_4E.pdf
  - Quote: "6 Further algebra 44 6.1 Polynomial division 44 6.2 The factor theorem 46 6.3 The remainder theorem 48"
- **The quadratic chapter solves by factorisation** **SECONDARY** (a university-hosted copy of Bird's 4th edition)
  - Source: Engineering Mathematics. https://uodiyala.edu.iq/uploads/PDF%20ELIBRARY%20UODIYALA/EL24/Engineering_Mathematics_4E.pdf
  - Quote: "11.2 Solution of quadratic equations by factorisation"
- **Then by completing the square** **SECONDARY** (same copy)
  - Source: Engineering Mathematics. https://uodiyala.edu.iq/uploads/PDF%20ELIBRARY%20UODIYALA/EL24/Engineering_Mathematics_4E.pdf
  - Quote: "11.3 Solution of quadratic equations by ‘completing the square"
- **And the quadratic and linear equations together** **SECONDARY** (same copy)
  - Source: Engineering Mathematics. https://uodiyala.edu.iq/uploads/PDF%20ELIBRARY%20UODIYALA/EL24/Engineering_Mathematics_4E.pdf
  - Quote: "11.6 The solution of linear and quadratic equations simultaneously"
- **Bird's graphs chapter has graphical solution of quadratic equations** **SECONDARY** (same copy)
  - Source: Engineering Mathematics. https://uodiyala.edu.iq/uploads/PDF%20ELIBRARY%20UODIYALA/EL24/Engineering_Mathematics_4E.pdf
  - Quote: "30.2 Graphical solution of quadratic equations"

The last four are **SECONDARY**: a university-hosted copy of the fourth edition, used only for the section titles of the
quadratic chapter. They were not available from the publisher's page.

My reading: Bird teaches "Further algebra" (polynomial division, the factor theorem, the remainder theorem) straight after
basic algebra, and quadratics later, after transposition and simultaneous equations. The quadratic chapter runs
factorisation, completing the square, the formula, practical problems, then a linear and a quadratic equation together.
Partial fractions come right after the factor and remainder theorems, and Bird says polynomial division is needed for
them. The Higher book puts Algebra and Partial fractions first in its list.

### 2.5 Orders compared
My reading: every source expands, then factorises, then solves by factoring, and puts the formula after something else.
Brilliant and Bird put completing the square before the formula, so the formula is derived. Khan Algebra 1 and Bitesize put
the formula before completing the square, so it is a recipe first. The HNC-facing sources (MCA, Bird, HELM) want the
formula and factorising for solving. Only Brilliant, Khan and Bitesize link completing the square to the turning point, and
Brilliant and Bitesize do it in the same breath as vertex form. Polynomial division and the factor theorem are in
Bird's early algebra, in Pearson's 2017 HN unit, and in Khan's Algebra 2, not in Bitesize's quadratics guide.

---

## 3. What a marine engineering HNC actually uses of this topic

Dan's college is not known to me. The two routes are SQA (Scotland: HN Engineering Mathematics units) and Pearson
BTEC HN (England: Unit 4002 Engineering Mathematics). Which one he takes is **UNCONFIRMED**, so both are read.
The MCA engineer officer written syllabuses are the third check, because the MCA matches HND courses against its own
syllabuses.

### 3.1 SQA Engineering Mathematics 1 (H7K0 33)
- **SQA Engineering Mathematics 1 (H7K0 33): the unit's purpose names polynomial functions**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K033.pdf
  - Quote: "This Unit is designed to develop or consolidate a basic level of mathematical skills required of learners across a range of Engineering disciplines. The Unit provides learners with opportunities to develop knowledge, understanding and skills to solve mathematical problems including polynomial, trigonometrical, exponential and logarithmic functions. Learners will also be introduced to 3-dimensional vectors and complex numbers."
- **SQA Engineering Mathematics 1: the three outcomes**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K033.pdf
  - Quote: "On successful completion of the Unit the learner will be able to: 1 Solve problems involving functions and trigonometric equations. 2 Solve problems involving exponential and logarithmic equations. 3 Apply mathematical techniques involving vectors and complex numbers."
- **SQA Engineering Mathematics 1: Outcome 1 knowledge and skills (functions and trig equations; no quadratics named)**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K033.pdf
  - Quote: "Properties of functions Inverse functions Composite Functions Trigonometric equations"
- **SQA Engineering Mathematics 1: entry advice is good algebra, transposing formulae, National 5 maths**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K033.pdf
  - Quote: "Entry requirements are at the discretion of the centre. However, it would be advantageous if learners had good algebraic skills together with an ability to transpose engineering formulae and solve simple trigonometric equations. This knowledge and understanding may be evidenced by possession of the NQ Unit Mathematics: Technician 1 or a pass at Intermediate 2 or National 5 in Mathematics."
- **SQA Engineering Mathematics 1 teaches complex numbers from what happens when b squared minus 4ac is negative**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K033.pdf
  - Quote: "Introduce complex numbers (different approaches may be taken to this, for example what happens when the determinant"
- **SQA Engineering Mathematics 1: no computer algebra in the assessment**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K033.pdf
  - Quote: "Computer algebra must not be used in the assessment of this Unit."
- **SQA Engineering Mathematics 1: marking looks at the technique, not simple numerical slips**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K033.pdf
  - Quote: "lecturers should concentrate principally on the candidate’s ability to apply the correct mathematical technique and processes when solving problems. Candidates should not be penalised for making simple numerical errors."
- **SQA Engineering Mathematics 1: notional length is 40 hours**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K033.pdf
  - Quote: "the notional design length is 40 hours"

My reading: quadratic equations are not a named outcome in Engineering Mathematics 1. The unit's outcomes are functions
and trigonometric equations, exponential and logarithmic equations, and vectors and complex numbers; "polynomial" appears
only in the purpose. The entry advice assumes good algebra, transposing formulae and National 5 maths, which is the level
where the quadratic skills are taught (2.2). Two things follow. First, quadratics are assumed on day one, so this course
is the foundation under the maths unit, not a copy of it. Second, complex numbers are introduced through "what happens when
the determinant" is negative, so the discriminant lesson should end with a clean "no real roots" and a pointer forward to
Complex numbers. Assessment has no computer algebra and marks technique above simple numerical slips. Other HN
units in the SQA suite (Engineering Mathematics 2 to 5) were not read: **UNCONFIRMED**.

### 3.2 An older SQA unit, and what SQA says about entrants
- **An earlier SQA HN unit, Introductory Mathematics for Engineering (2001), names quadratic equations in its range**
  - Source: SCOTTISH VOCATIONAL EDUCATION COUNCIL. http://www.sqa.org.uk/files/hn/D7481997.pdf
  - Quote: "Equations: simultaneous linear equations in two unknowns; quadratic equations."
- **The same earlier unit's evidence: linear and quadratic equations, factorisation**
  - Source: SCOTTISH VOCATIONAL EDUCATION COUNCIL. http://www.sqa.org.uk/files/hn/D7481997.pdf
  - Quote: "Linear and quadratic equations. Simultaneous linear equations in two unknowns. Factorisation, indices."
- **The same earlier unit's exemplar asks for the positive solution of a quadratic**
  - Source: SCOTTISH VOCATIONAL EDUCATION COUNCIL. http://www.sqa.org.uk/files/hn/D7481997.pdf
  - Quote: "Find the positive solution of the quadratic equation"
- **SQA says entrants struggle to manipulate and solve equations found in engineering**
  - Source: Arrangements for: - HNC Engineering Systems. https://www.sqa.org.uk/files_ccc/HNCDEngineeringSystems-G85G15-G85G16.pdf
  - Quote: "For example, experience has shown that many candidates entering engineering courses have difficulty in manipulating and solving equations commonly found in engineering, yet these skills are required in the three core engineering Units."

The first three are from a 2001 unit specification, Introductory Mathematics for Engineering, now superseded, so they show
what HN colleges asked for before, not the current requirement. My reading: the older range statement names quadratic
equations in an engineering unit and the exemplar sets one with decimal coefficients, which is a formula question, not a
factorising one. SQA's own arrangements note that entrants find it hard to manipulate and solve the equations of
engineering. The current Mathematics for Engineering 1 units (Mechanical and Manufacturing, DT5X 33; Electronics and
Electrical, DG4H 33) are named in SQA's HNC Engineering Systems arrangements but I could not read their outcome text, so
whether they name quadratics is **UNCONFIRMED**.

### 3.3 Pearson BTEC Higher Nationals
- **Pearson HN 2017 Unit 1 (Analytical Methods): algebraic methods named**
  - Source: BTEC Higher Nationals units - Pearson qualifications. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/Operations-Engineering/2010/Specification/9781446955215-HNCD-L45-in-Engineering-units-Iss3.pdf
  - Quote: "Algebraic methods: polynomial division; quotients and remainders; use of factor and remainder theorem; rules of order for partial fractions (including linear, repeated and quadratic factors); reduction of algebraic fractions to partial fractions"
- **Pearson HN 2017 Unit 1: learning outcome 1 looks at algebraic methods including polynomial division**
  - Source: BTEC Higher Nationals units - Pearson qualifications. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/Operations-Engineering/2010/Specification/9781446955215-HNCD-L45-in-Engineering-units-Iss3.pdf
  - Quote: "Learning outcome 1 looks at algebraic methods, including polynomial division, exponential, trigonometric and hyperbolic functions, arithmetic and geometric progressions in an engineering context and expressing variables as power series."
- **Pearson HN 2017 Unit 1: the learning outcome 1.1**
  - Source: BTEC Higher Nationals units - Pearson qualifications. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/Operations-Engineering/2010/Specification/9781446955215-HNCD-L45-in-Engineering-units-Iss3.pdf
  - Quote: "determine the quotient and remainder for algebraic fractions and reduce algebraic fractions to partial fractions"
- **Pearson HN 2017 Unit 1: aim of the unit**
  - Source: BTEC Higher Nationals units - Pearson qualifications. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/Operations-Engineering/2010/Specification/9781446955215-HNCD-L45-in-Engineering-units-Iss3.pdf
  - Quote: "This unit enables learners to develop previous mathematical knowledge obtained at school or college and use fundamental algebra, trigonometry, calculus, statistics and probability for the analysis, modelling and solution of realistic engineering problems."
- **Pearson HN 2024 Unit 4002: aim**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "The aim of this unit is to develop students’ skills in the mathematical principles and theories that underpin the engineering curriculum."
- **Pearson HN 2024 Unit 4002: types of function include algebraic with partial fractions**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "Types of function: algebraic including partial fractions and trigonometric (sine, cosine, and tangent) functions"
- **Pearson HN 2024 Unit 4002: pass criterion P3 names exponential, log, trig, hyperbolic equations**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "P3 Determine solutions of engineering equations using exponential, logarithmic, trigonometric, and hyperbolic functions."
- **Pearson HN 2024 Unit 4002: essential content list**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "Mathematical concepts: Dimensional analysis Arithmetic and geometric progressions Representing engineering quantities in vector form Vectors in three dimensions."
- **Pearson recommends a GCSE maths grade 4 and a diagnostic test before an HN course**
  - Source: Engineering High - Pearson qualifications. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/General-Engineering/2024/specification-and-sample-assessments/btec-hncd-engineering-2024.pdf
  - Quote: "we strongly recommend that all students complete diagnostic mathematics assessments before beginning a Higher National course, as well as having a grade 9 to 4 or A* to C in GCSE Mathematics."

My reading: the two Pearson texts differ. The 2017 specification's Unit 1 (Analytical Methods for Engineers) names
polynomial division, the factor and remainder theorems and partial fractions, with quadratic factors named under
partial fractions. The 2024 descriptor for Unit 4002 (Engineering Mathematics), as far as the saved search excerpt shows,
lists dimensional analysis, progressions, vectors, software and calculus, with "algebraic including partial fractions" as
a type of function, and its pass criterion names exponential, logarithmic, trigonometric and hyperbolic equations. I saw
no line there naming quadratic equations or polynomial division; the excerpt was partial, so whether the full descriptor
does is **UNCONFIRMED**. Pearson expects a GCSE grade 4 and recommends a diagnostic test, so quadratics are assumed.

### 3.4 MCA engineer officer syllabuses
- **MCA Second Engineer mathematics: binomial products, squares, sum and difference, cubes**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "States the product of two binomial expressions. 12. States the square of a binomial expression (a ± b)2. 13. States the product of the sum and difference of two algebraic quantities (a + b) (a - b). 14. Expands (a ± b)3 and factors of a3 + b3. 15. Solves problems involving the multiplication and division of polynomial expressions by binomial expressions. 16. Factorises expressions which have one factor consisting of one term only. 17. Factorises expressions of four terms which can be expressed as the product of two binomials. 18. Factorises expressions of the type ax2 + bx + c, where a, b and c have numerical values, including both: 1. cases when a is equal to 1; 2. cases when a is not equal to 1. 19. Factorises trinomials which form a perfect square. 20. Factorises the difference of two squares."
- **MCA Second Engineer: dividing polynomials by binomials**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "Solves problems involving the multiplication and division of polynomial expressions by binomial expressions."
- **MCA Second Engineer: factorising ax2+bx+c with a equal to 1 and not equal to 1**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "Factorises expressions of the type ax2 + bx + c, where a, b and c have numerical values, including both: 1. cases when a is equal to 1; 2. cases when a is not equal to 1."
- **MCA Second Engineer: roots, factorising, general formula, linear with quadratic**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "States what is meant by the roots of a quadratic equation. 32. Solves quadratic equations that factorise. 33. States the general formula for solution of a quadratic ax ² \+ bx + c = 0. 34. Solves quadratic equations using the general formula. 35. Solves simultaneous equations of two unknowns consisting of linear and quadratic equations."
- **MCA Second Engineer: the graph of a quadratic crosses the x-axis at the solutions**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "States that the solution to a quadratic equation is given by the points where the graph of the quadratic equation crosses the x-axis, i.e. where y = 0."
- **MCA Second Engineer: simultaneous quadratic graphs meet at the solutions**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "States that the solution to simultaneous quadratic equations is given by the points where the graphs of the equations intersect."
- **MCA Second Engineer: algebraic fractions limited to binomials**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "(both 2.1.21 and 2.1.22 to be limited to polynomials no greater than binomial expressions)"
- **MCA General Engineering Science I: a quadratic divided by a linear factor**
  - Source: General Engineering Science I Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses
  - Quote: "Solve problems involving quadratic function divided by linear factor."
- **MCA General Engineering Science I: plot points and join with a curve**
  - Source: General Engineering Science I Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses
  - Quote: "Plot ordered pairs on graph paper, either given or calculated and join the points with an appropriate curve."
- **MCA General Engineering Science A: beams with uniformly distributed loads**
  - Source: MCA General Engineering Science A Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/mca-general-engineering-science-a-written-examination-syllabuses
  - Quote: "Solve problems relating to simply supported beams involving vertical forces and uniformly distributed loads."
- **MCA Chief Engineer Applied Mechanics: projectile motion derived and solved**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Derives the equations for the horizontal and vertical components of the motion of a projectile. 8. Solves problems on individual and double projectiles."
- **MCA Second Engineer Applied Mechanics: s = ut + 1/2 at squared**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Derives the equations: ν = u + at, s = ut + 1/2(at ² ), v ² = u ² + 2as, s = ((u + v)/2)t"
- **MCA Chief Engineer Applied Mechanics lists a Mathematical Solutions of Control System Problems section**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "7. Strength of Materials 8. Hydrostatics 9. Hydrodynamics 10. Mathematical Solutions of Control System Problems"
- **MCA says the GES papers set the mathematics for management-level certificates**
  - Source: General Engineering Science Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses
  - Quote: "This guidance provides information and outlines the core engineering and mathematics knowledge required for restricted, management level Certificates of Competency (STCW III/2 and III/3)."
- **MCA gives HND holders exemption routes including Mathematics**
  - Source: Engineering Officers and Ratings - GOV.UK. https://www.gov.uk/guidance/engineering-officers-and-ratings
  - Quote: "Holders of UK/EU qualifications (HND and higher) should contact IAMI for course and exam exemptions from Naval Architecture, Applied Mechanics, Applied Heat, Electro-technology, Mathematics and Engineering, Systems & Ship’s Drawings."
- **MCA wants a 70 percent match between a qualification and its syllabuses**
  - Source: Engineering Officers and Ratings - GOV.UK. https://www.gov.uk/guidance/engineering-officers-and-ratings
  - Quote: "All applicants will need to supply sufficient ‘detailed evidence’ of their course content for a 70% match to be obtained between their qualification and the MCA’s syllabuses. In addition applicants will be required to have obtained a pass mark of at least 50% in each of the individual subjects, within their qualification, being presented for the audit."

The syllabus page lists these as numbered items in one run; the gov.uk text numbers them 1 to 38 inside the algebra section,
which the saved text shows as items 2.1.1 to 2.1.38 when other lines refer to them.

My reading: this is the most useful list of what to teach. The Second Engineer mathematics syllabus names, in order:
the product of two binomials, the square of a binomial, the sum times the difference, cubes, dividing polynomials by
binomials, factorising ax² + bx + c for both a = 1 and a ≠ 1, perfect squares, difference of two squares, roots of a
quadratic, solving those that factorise, the general formula, and a linear and a quadratic equation together; the graph
lines say a quadratic's solutions are where its graph crosses the x-axis. It caps algebraic fractions at binomials.
I read the algebra and graph lists in full and found no line naming completing the square, the discriminant or the
turning point, so those are not MCA requirements as written (the full set of MCA written papers was not read, so this is
for the Second Engineer mathematics syllabus and General Engineering Science I and II only). Polynomial division appears
only as "quadratic function divided by linear factor" (General Engineering Science I) and "polynomial expressions by
binomial expressions" (Second Engineer). The MCA's Applied Mechanics lists show where the ground is used: the equations
of motion, including s = ut + ½at², projectiles for the Chief Engineer, and beams with uniformly distributed loads in
General Engineering Science A. HND holders can claim exemption from the MCA Mathematics paper (3.4 last two quotes).

### 3.5 What HNC preparation sets
- **An HNC preparation activity (2026) sets completing the square questions**
  - Source: HNC @ HOME 2026. https://yourhncportal.org/wp-content/uploads/2026/06/maths-activity-1.pdf
  - Quote: "This is a set of algebra questions involving completing the square."

**SECONDARY / UNCONFIRMED provider:** the page is an "HNC @ HOME 2026" maths activity and does not name the college. It is
one more sign that completing the square is set in HNC preparation, which the MCA lines do not ask for.

### 3.6 The overall reading for the brief
My reading, from 3.1 to 3.5:
- Must be fluent by the first week of an HNC: expanding two brackets, factorising a quadratic (a = 1 and a ≠ 1), solving by
  factorising and by the formula, reading the number of roots, and quadratics in engineering formulae (MCA, Bird, HELM, SQA
  National 5, Pearson's GCSE entry).
- Asked in a named syllabus at HN level: polynomial division and the factor and remainder theorems (Pearson 2017 Unit 1, MCA
  as "quadratic divided by linear factor"), partial fractions (Pearson 2017 and 2024, Bird, HELM).
- Not named in the SQA or MCA lines I read: completing the square, the discriminant, the turning point. They are in National 5,
  HELM Workbook 3 (completing the square and the graph), Bitesize, Brilliant, Khan and the HNC preparation activity, and they are
  what makes the formula and the graph make sense.
- Partial fractions are named by Pearson, Bird and HELM only (not by SQA H7K0 33 or the MCA lines), and need the whole of
  algebraic fractions, so they are left out of this course and pointed to.

---

## 4. The scope, part by part

### 4.1 Expanding two brackets as an area
Dan has single brackets and taking out a common factor from Linear equations. The new step is every term times every term.
- **Bitesize: a grid method multiplies a two-term bracket by another**
  - Source: Expanding double brackets (KS3 Maths | BBC Bitesize). https://www.bbc.co.uk/bitesize/articles/z8vbf82
  - Quote: "We can also use a grid method in algebra to multiply a bracket with two terms by a second bracket with two terms."
- **Bitesize: every term in the first bracket times every term in the second**
  - Source: How to simplify expressions and expand brackets - GCSE Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/topics/zxk7g82/articles/zkxk6rd
  - Quote: "When expanding double brackets, every term in the first bracket has to be multiplied by every term in the second bracket."
- **Bitesize worked example: (x + 3)(x + 2) = x2 + 2x + 3x + 6 = x2 + 5x + 6**
  - Source: Expanding double brackets (KS3 Maths | BBC Bitesize). https://www.bbc.co.uk/bitesize/articles/z8vbf82
  - Quote: "Example ((x + 3)(x + 2)). ((x + 3)(x + 2)) (= x^2 + 2x + 3x + 6) (= x^2 + 5x + 6)"
- **Khan Academy: multiplying monomials by polynomials with an area model (Algebra 2, unit 1)**
  - Source: Algebra 2 | Math | Khan Academy. https://www.khanacademy.org/math/high-school-math/algebra2
  - Quote: "Multiply monomials by polynomials: area model"
- **NCETM: the array shows the distributive property; the area model carries to continuous measures**
  - Source: Mastery Professional Development Materials 2 Operating .... https://www.ncetm.org.uk/media/x2uj2qln/ncetm_ks3_theme_2.pdf
  - Quote: "The array is a useful image for revealing the commutative (i.e. 3 × 5 = 5 × 3) and distributive (i.e. 3 × (2 + 3) = 3 × 2 + 3 × 3) properties of multiplication"
- **Booth et al.: tables and area models are effective representations for algebraic expressions**
  - Source: Persistent and Pernicious Errors in Algebraic Problem Solving. https://files.eric.ed.gov/fulltext/EJ1059995.pdf
  - Quote: "Effective instructional techniques for this purpose include using representations such as tables and area models to represent algebraic expressions (Swan, 2000; Ross & Willson, 2012)."
- **A review reports that algebra tiles link factorising to the area model (Howden) and geometric models help the formula (Norton)** **SECONDARY**
  - Source: Opening Up Mathematics Education Research - ERIC. https://files.eric.ed.gov/fulltext/ED572345.pdf
  - Quote: "For example, factorisation with algebra tiles links quadratics with basic multiplication and division concepts via the area model of rectangles and squares (Howden 2001). Geometric models are useful in adding understanding in developing the quadratic formula via completing the square procedure (Norton, 2015)."
- **The picture of (X + Y) squared as four areas: X squared, Y squared and two XY rectangles**
  - Source: Freshman's dream - Wikipedia. https://en.wikipedia.org/wiki/Freshman%27s_dream
  - Quote: "The area of the square is the sum of the area of the yellow region (=X 2 ), the area of the green region (=Y 2 ), and the area of the two white regions (=2×X×Y)."

**SECONDARY:** the Howden and Norton claims reach me through a review (the Norton paper), not the originals.
My reading: the area picture is well supported as the way in. Bitesize uses a grid, the SQA notes say "make connections with
geometrical representations", NCETM uses the array for the distributive property, Khan has an area model, and the Wikipedia
picture of a square of side X + Y cut into X², Y² and two X·Y rectangles is the visual for (x + y)². Dan has area from
Geometry fundamentals, so the rectangle is known ground.

### 4.2 Factorising quadratics
- **Bitesize: for x2 + bx + c the two numbers add to b and multiply to c**
  - Source: How to factorise an expression - GCSE Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zdtdh4j
  - Quote: "To factorise the quadratic 𝑥² + 𝑏𝑥 + 𝑐, the sum of the two numbers in the brackets must be 𝑏, and the product must be 𝑐."
- **Bitesize: x2 + bx + c has no common factor, so it needs two brackets**
  - Source: How to factorise an expression - GCSE Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zdtdh4j
  - Quote: "Quadratic expressions in the form 𝑥² + 𝑏𝑥 + 𝑐 do not have a common factor that can be taken outside a bracket. This means they cannot be factorised using one bracket."
- **Bitesize: when a is greater than 1 a different method is needed (Higher)**
  - Source: How to factorise an expression - GCSE Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zdtdh4j
  - Quote: "Factorising quadratic expressions of the form 𝑎𝑥² + 𝑏𝑥 + 𝑐 where 𝑎 is greater than 1 requires a different method to those where 𝑎 = 1."
- **Bitesize Edexcel: factorising is the reverse of expanding; worked pair**
  - Source: Quadratic equations - Solving quadratic equations - Edexcel - GCSE Maths Revision - Edexcel - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z3hb97h/revision/1
  - Quote: "Expanding the brackets (x + 2)(x + 3) gives x^2 + 3x + 2x + 6, which simplifies to x^2 + 5x + 6. Factorising is the reverse process of expanding brackets, so factorising x^2 + 5x + 6 gives (x + 2)(x + 3)."
- **Bitesize (Higher tier only): a is always 1 in Foundation**
  - Source: How to factorise an expression - GCSE Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zdtdh4j
  - Quote: "In Foundation Tier, 𝑎 will always be 1, so quadratic expressions will be in the form 𝑥² + 𝑏𝑥 + 𝑐."

My reading: "the two numbers add to b and multiply to c" is Bitesize's rule for a = 1, and "a different method for a
greater than 1" is where Bitesize splits Higher from Foundation. The MCA asks for both (3.4). The step before it is the common
factor Dan already has, and the Norton review notes that students miss it (6.2).

### 4.3 Solving by factorising
- **Bitesize: if the product of two numbers is zero, one or both is zero**
  - Source: Quadratic equations - Solving quadratic equations - Edexcel - GCSE Maths Revision - Edexcel - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z3hb97h/revision/1
  - Quote: "If the product of two numbers is zero then one or both of the numbers must also be equal to zero. Therefore if ab = 0, then a = 0 and/or b = 0"
- **A quadratic generally has two solutions, a linear equation one** **SECONDARY** (Sheffield's copy of HELM 3.2)
  - Source: https://sheffield.ac.uk/media/31939/download?attachment. https://sheffield.ac.uk/media/31939/download?attachment
  - Quote: "A quadratic equation will generally have two values of x (solutions) which satisfy it whereas a linear equation only has one solution."
- **Bitesize: a repeated factor gives one solution, and the graph touches the axis**
  - Source: Finding roots by factorising - Solving quadratic equations - Edexcel - GCSE Maths Revision - Edexcel - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z3hb97h/revision/5
  - Quote: "so there is just one solution to the equation, ( x = 3). The graph of (y = x^2 - 6x + 9 ) touches the x-axis at ( x = 3)."
- **Bitesize: if a quadratic factorises, the factors give the roots, which are where the graph crosses the axis**
  - Source: Finding roots by factorising - Solving quadratic equations - Edexcel - GCSE Maths Revision - Edexcel - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z3hb97h/revision/5
  - Quote: "If a quadratic equation can be factorised, the factors can be used to find the roots of the equation."
- **LibreTexts (Mission College): the zero-product property**
  - Source: 2.5: Quadratic Equations - Mathematics LibreTexts. https://math.libretexts.org/Courses/Mission_College/Math_001%3A_College_Algebra_(Kravets)/02%3A_Equations_and_Inequalities/2.05%3A_Quadratic_Equations
  - Quote: "The zero-product property states If (a⋅b=0), then (a=0) or (b=0), where (a) and (b) are real numbers or algebraic expressions."
- **Bitesize: 3x2 = 48 is solved simply by square roots, giving plus and minus**
  - Source: Quadratic equations - Solving quadratic equations - Edexcel - GCSE Maths Revision - Edexcel - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z3hb97h/revision/1
  - Quote: "The positive and negative square roots of 16 are 4 and -4, as 4 × 4 = 16 and -4 × -4 = 16, so x = ± 4"

My reading: the zero-product idea ("if the product is zero, one of them is zero") is the whole of the step and the place
students go wrong when the right-hand side is not zero (6.3). Bitesize's repeated-root case (one solution, the graph touches
the axis) is also where the discriminant starts.

### 4.4 Completing the square and the parabola's turning point
- **Bitesize: complete the square when a quadratic cannot be factorised**
  - Source: Solving by completing the square - Higher - Solving quadratic equations - Edexcel - GCSE Maths Revision - Edexcel - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z3hb97h/revision/3
  - Quote: "Some quadratics cannot be factorised. An alternative method to solve a quadratic equation is to complete the square"
- **Bitesize: the extra (b/2) squared has to be taken off again**
  - Source: Solving by completing the square - Higher - Solving quadratic equations - Edexcel - GCSE Maths Revision - Edexcel - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z3hb97h/revision/3
  - Quote: "To get back to the correct original expression, this extra term has to be subtracted."
- **Bitesize: turning point and line of symmetry come from completed-square form**
  - Source: The turning point and line of symmetry - Higher - Solving quadratic equations - Edexcel - GCSE Maths Revision - Edexcel - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z3hb97h/revision/6
  - Quote: "The coordinates of the turning point and the equation of the line of symmetry can be found by writing the quadratic expression in completed square form."
- **Bitesize: a squared term is at least 0, so (x - 3)2 - 5 has minimum -5 at x = 3**
  - Source: The turning point and line of symmetry - Higher - Solving quadratic equations - Edexcel - GCSE Maths Revision - Edexcel - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z3hb97h/revision/6
  - Quote: "Squaring positive or negative numbers always gives a positive value. The lowest value given by a squared term is 0, which means that the minimum value of the term (x - 3)^2 - 5 is given when x = 3. This also gives the equation of the line of symmetry for the quadratic graph."
- **Bitesize: the y at the turning point is the constant in the completed form**
  - Source: The turning point and line of symmetry - Higher - Solving quadratic equations - Edexcel - GCSE Maths Revision - Edexcel - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z3hb97h/revision/6
  - Quote: "This value is always the same as the constant term in the completed square form of the equation."
- **Brilliant wiki: completing the square writes a quadratic as a perfect square plus a constant**
  - Source: Completing The Square | Brilliant Math & Science Wiki. https://brilliant.org/wiki/completing-the-square
  - Quote: "Completing the square is a technique for manipulating a quadratic into a perfect square plus a constant. The most common use of completing the square is solving quadratic equations"
- **Brilliant wiki: with a negative leading coefficient be careful with signs**
  - Source: Completing The Square | Brilliant Math & Science Wiki. https://brilliant.org/wiki/completing-the-square
  - Quote: "Note: When the leading coefficient is negative, be very careful with signs, expecially when adding the"
- **Brilliant wiki: a maximum value read off the completed square**
  - Source: Completing The Square | Brilliant Math & Science Wiki. https://brilliant.org/wiki/completing-the-square
  - Quote: "Thus, the maximum value of the quadratic is 14 , which is achieved at x = 2 ."
- **MathWorld: completing the square is a geometric as well as algebraic operation (al-Khwarizmi)**
  - Source: Completing the Square -- from Wolfram MathWorld. https://mathworld.wolfram.com/CompletingtheSquare.html
  - Quote: "Completing the square, also called completion of the square, is the geometric or algebraic operation that forms a square from a quadratic polynomial"
- **MathWorld: the added area 25 completes the square of side x + 5**
  - Source: Completing the Square -- from Wolfram MathWorld. https://mathworld.wolfram.com/CompletingtheSquare.html
  - Quote: "where only the positive root is admitted in the original geometrical setting. The added area 25 completes the square of side x+5"
- **SQA N5 2024 report: completing the square, many got the bracket right**
  - Source: National 5 Mathematics course report 2024. https://www.sqa.org.uk/files_ccc/2024-n5-course-report-mathematics.pdf
  - Quote: "Question 12(a): complete the square Many candidates got the correct bracket with the square, but a few candidates did not complete the process correctly."
- **SQA N5 2024 report: turning point; some did not use the completed square from part (a)**
  - Source: National 5 Mathematics course report 2024. https://www.sqa.org.uk/files_ccc/2024-n5-course-report-mathematics.pdf
  - Quote: "Question 12(b): find the turning point of a quadratic graph Although only some candidates gave the correct answer, responses were better than the last time a similar question appeared in a question paper. Some candidates did not use their answer to part (a) to get the answer to part (b)."
- **SQA N5 2024 report: the skills were not linked**
  - Source: National 5 Mathematics course report 2024. https://www.sqa.org.uk/files_ccc/2024-n5-course-report-mathematics.pdf
  - Quote: "Many candidates did not link these skills in questions 12(a) and 12(b) in paper 2."
- **Edexcel 2005 report: the technique of completing the square was often badly handled**
  - Source: Mathematics - Pearson qualifications. https://qualifications.pearson.com/content/dam/pdf/A%20Level/Mathematics/2013/Exam%20materials/ARCHIVED%20237368_Complete_examiners_report_June_05.pdf
  - Quote: "The technique of ‘completing the square’ was often badly handled."

My reading: this has two jobs, and they are separate in the sources. As an equation-solver it is the method for quadratics
that will not factorise; as a way of reading a graph it gives the turning point and the line of symmetry straight off
(Bitesize, Brilliant, SQA National 5). The al-Khwarizmi geometric version (a square plus strips, with the added area
"completing the square") is the oldest form of it and fits the area picture of 4.1. The SQA 2024 report says the
skills were not linked by candidates, so the lesson should make the link itself: the completed square is what makes
the lowest point visible. Dan's calculus course meets the same point as "slope zero"; one screen can show the two agreeing.
The Edexcel A-level 2005 report says the technique "was often badly handled".

### 4.5 The quadratic formula, derived by completing the square
- **OpenStax: the general quadratic is solved for x by completing the square**
  - Source: 9.3 Solve Quadratic Equations Using the Quadratic Formula - Intermediate Algebra 2e | OpenStax. https://openstax.org/books/intermediate-algebra-2e/pages/9-3-solve-quadratic-equations-using-the-quadratic-formula
  - Quote: "Now we will go through the steps of completing the square using the general form of a quadratic equation to solve a quadratic equation for x."
- **OpenStax: it starts from standard form and completes the square**
  - Source: 9.3 Solve Quadratic Equations Using the Quadratic Formula - Intermediate Algebra 2e | OpenStax. https://openstax.org/books/intermediate-algebra-2e/pages/9-3-solve-quadratic-equations-using-the-quadratic-formula
  - Quote: "We start with the standard form of a quadratic equation and solve it for x by completing the square."
- **Bitesize: the formula is for quadratics that will not factorise**
  - Source: Solving by quadratic formula - Higher - Solving quadratic equations - Edexcel - GCSE Maths Revision - Edexcel - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z3hb97h/revision/2
  - Quote: "Using the quadratic formula is another method of solving quadratic equations that will not factorise."
- **Bitesize: the formula as given**
  - Source: Solving by quadratic formula - Higher - Solving quadratic equations - Edexcel - GCSE Maths Revision - Edexcel - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z3hb97h/revision/2
  - Quote: "Key fact The quadratic formula for a quadratic equation in the form of ax^2 + bx + c = 0 is x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
- **Khan Academy (OD Class 10): the quadratic formula page includes a proof**
  - Source: Quadratic equations | OD Math Class 10 (Algebra) | Khan Academy. https://www.khanacademy.org/math/class-10-algebra-od/xdf6c731a6bbb91d2:quadratic-equations
  - Quote: "The quadratic formula (Opens a modal) * Proof of the quadratic formula (Opens a modal)"
- **Khan Academy (OD Class 10): completing the square comes before the formula**
  - Source: Quadratic equations | OD Math Class 10 (Algebra) | Khan Academy. https://www.khanacademy.org/math/class-10-algebra-od/xdf6c731a6bbb91d2:quadratic-equations
  - Quote: "1. Completing the square (intro) 2. Completing the square (intermediate) 3. Complete the square 4. Quadratic equations: Quiz 1 5. Quadratic formula"
- **Design research on reinventing the formula from equal areas of squares** **SECONDARY**
  - Source: Geometric Reasoning to Reinventing Quadratic Formula. https://files.eric.ed.gov/fulltext/EJ1442295.pdf
  - Quote: "Activity 1 focuses on solving quadratic equations using diagrams. The approach involves using the concept of equal areas of squares"

**SECONDARY:** the last is a design-research abstract (equal areas of squares); I did not see the study's results.
My reading: only OpenStax, Brilliant and Khan show the derivation, and they all do it by completing the square on the
general ax² + bx + c. The MCA only asks "states the general formula" and "solves quadratic equations using the formula", so
the derivation is for understanding, not for the syllabus, and is worth one screen of "the same steps with letters".

### 4.6 The discriminant and how many roots
- **OpenStax: positive, zero, negative discriminant**
  - Source: 9.3 Solve Quadratic Equations Using the Quadratic Formula - Intermediate Algebra 2e | OpenStax. https://openstax.org/books/intermediate-algebra-2e/pages/9-3-solve-quadratic-equations-using-the-quadratic-formula
  - Quote: "When the value under the radical in the Quadratic Formula, the discriminant, is positive, the equation has two real solutions. When the value under the radical in the Quadratic Formula, the discriminant, is zero, the equation has one real solution. When the value under the radical in the Quadratic Formula, the discriminant, is negative, the equation has two complex solutions."
- **The discriminant and distinct real roots** **SECONDARY** (Sheffield's copy of HELM 3.2)
  - Source: https://sheffield.ac.uk/media/31939/download?attachment. https://sheffield.ac.uk/media/31939/download?attachment
  - Quote: "Note that if the quantity b 2 − 4 ac (called the discriminant ) is a positive number we can take its square root and the formula will produce two values known as distinct real roots"
- **Zero discriminant gives a repeated or double root** **SECONDARY** (Sheffield's copy of HELM 3.2)
  - Source: https://sheffield.ac.uk/media/31939/download?attachment. https://sheffield.ac.uk/media/31939/download?attachment
  - Quote: "there will be one value only known as a repeated root or double root"
- **Key Point 6, a negative discriminant gives no real roots** **SECONDARY** (Sheffield's copy of HELM 3.2)
  - Source: https://sheffield.ac.uk/media/31939/download?attachment. https://sheffield.ac.uk/media/31939/download?attachment
  - Quote: "the quadratic has no real roots: there are two complex roots"
- **Brilliant wiki: the discriminant says whether the roots are two real, one repeated real, or non-real**
  - Source: Quadratic Discriminant | Brilliant Math & Science Wiki. https://brilliant.org/wiki/quadratic-discriminant
  - Quote: "By computing the discriminant, it is possible to distinguish whether the quadratic polynomial has two distinct real roots, one repeated real root, or non-real complex roots only."
- **SQA N5 2023 report: the expected answers for the nature of the roots**
  - Source: National 5 Mathematics Course Report 2023. https://www.sqa.org.uk/sqa//files_ccc/2023-n5-course-report-mathematics.pdf
  - Quote: "When practising questions about determining the nature of the roots of a quadratic function, teachers and lecturers should remind candidates that the expected responses are: — b − ac > 2 4 0 : ‘two real and distinct roots’ — b − ac = 2 4 0 : ‘one repeated real root’ or ‘two equal real roots’ — b − ac < 2 4 0 : ‘no real roots’"
- **Bitesize: a negative under the root means no solutions and a graph that misses the axis**
  - Source: Finding roots by factorising - Solving quadratic equations - Edexcel - GCSE Maths Revision - Edexcel - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z3hb97h/revision/5
  - Quote: "It is not possible to find the square root of a negative number, so the equation has no solutions. The graph of (y = x^2 + 2x + 5) does not cross or touch the x-axis so the equation (x^2 + 2x + 5 = 0) has no roots."
- **A review reports Barnes's graphing-calculator link of no, one or two roots to the discriminant** **SECONDARY**
  - Source: Opening Up Mathematics Education Research - ERIC. https://files.eric.ed.gov/fulltext/ED572345.pdf
  - Quote: "Barnes (1991) suggested using graphing calculators to plot quadratics with no roots, one root, or two roots and linking this to the discriminate values."
- **HELM tutor's guide: graphs suggest two solutions, one or none, and algebra can verify it**
  - Source: Introduction, HELM consortium, institutions, contributors, .... https://nucinkis-lab.cc.ic.ac.uk/HELM/HELM_Workbooks_46-50/WB50-all.pdf
  - Quote: "The solution of quadratic equations provides an opportunity to bring together several areas of math- ematics. Looking at graphs of various quadratics suggests the possibility of two distinct solutions, a unique solution or no solutions; algebra can verify the suggestion."

**SECONDARY:** Barnes via a review. My reading: the discriminant is the part of the formula under the root. The sources agree
on the three cases (two, one repeated, none), and SQA gives the exact words the examiners expect ("two real and distinct
roots", "one repeated real root" or "two equal real roots", "no real roots"). Bitesize's example gives the graph and the
algebra together (a graph that does not touch the axis, and a negative under the root). The HELM tutor's guide describes
the same teaching move: look at graphs, then let algebra check.

### 4.7 The parabola's shape from its rule: roots, vertex, y-intercept
- **Bitesize: a positive a gives a minimum turning point and a negative a a maximum**
  - Source: Graphs of quadratic functions - Solving quadratic equations. https://www.bbc.co.uk/bitesize/guides/z3hb97h/revision/4
  - Quote: "The graph of the quadratic function y = a x 2 + b x + c has a minimum turning point when a > 0 and a maximum turning point when a a < 0 ."
- **Bitesize: the graph crosses the y-axis at (0, c)**
  - Source: Finding roots by factorising - Solving quadratic equations - Edexcel - GCSE Maths Revision - Edexcel - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z3hb97h/revision/5
  - Quote: "The graph of the quadratic equation (y = ax^2 + bx + c) crosses the y-axis at the point ((0, c)). The x-coordinate of any point on the y-axis has the value of 0 and substituting (x = 0) into the equation (y = ax^2 + bx + c) gives (y = c)."
- **Bitesize KS3: a quadratic graph is a U-shaped parabola with no straight segments**
  - Source: Quadratic graphs - KS3 Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z7cny4j
  - Quote: "Quadratic graph lines are U- or Ո-shaped, which is called a parabola."
- **OpenStax: the vertex is the lowest or highest point; the graph is symmetric about the axis through it**
  - Source: 3.2 Quadratic Functions - Precalculus | OpenStax. https://openstax.org/books/precalculus/pages/3-2-quadratic-functions
  - Quote: "The graph of a quadratic function is a U-shaped curve called a parabola . One important feature of the graph is that it has an extreme point, called the vertex . If the parabola opens up, the vertex represents the lowest point on the graph, or the minimum value of the quadratic function. If the parabola opens down, the vertex represents the highest point on the graph, or the maximum value . In either case, the vertex is a turning point on the graph. The graph is also symmetric with a vertical line drawn through the vertex, called the axis of symmetry"
- **OpenStax: the x-intercepts are the zeros and the y-intercept is where it crosses the y-axis**
  - Source: 3.2: Quadratic Functions - Mathematics LibreTexts. https://math.libretexts.org/Bookshelves/Precalculus/Precalculus_1e_(OpenStax)/03:_Polynomial_and_Rational_Functions/3.02:_Quadratic_Functions
  - Quote: "If they exist, the x-intercepts represent the zeros , or roots , of the quadratic function, the values of x at which y=0."
- **OpenStax Precalculus: the vertex lies halfway between the roots (x = -b/2a)**
  - Source: 3.2: Quadratic Functions - Mathematics LibreTexts. https://math.libretexts.org/Bookshelves/Precalculus/Precalculus_1e_(OpenStax)/03%3A_Polynomial_and_Rational_Functions/3.02%3A_Quadratic_Functions
  - Quote: "The axis of symmetry is defined by x=−\frac{b}{2a}. If we use the quadratic formula, x=\frac{−b{\pm}\sqrt{b^2−4ac}}{2a}, to solve ax^2+bx+c=0 for the x-intercepts, or zeros, we find the value of x halfway between them is always x=−\frac{b}{2a}, the equation for the axis of symmetry."
- **MathBits: the x-intercepts are the zeros or roots; the vertex is the turning point**
  - Source: Quadratic Graph Information - MathBitsNotebook(A2). https://mathbitsnotebook.com/Algebra2/Quadratics/QDGraphInfo.html
  - Quote: "The bottom (or top) of the U is called the vertex, or the turning point. The vertex of a parabola opening upward is also called the minimum point . The vertex of a parabola opening downward is also called the maximum point. | | The x -intercepts are called the zeros, or roots."
- **MathBits: second differences of a quadratic's table are the constant 2a**
  - Source: Quadratic Graph Information - MathBitsNotebook(A2). https://mathbitsnotebook.com/Algebra2/Quadratics/QDGraphInfo.html
  - Quote: "What they all will yield is a constant that is ” 2 a ”"
- **Khan: graph quadratics in factored, vertex and standard forms**
  - Source: Quadratic functions & equations | Algebra 1 | Math | Khan Academy. https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations
  - Quote: "5. Graph quadratics in factored form 6. Quadratic word problems (factored form) 7. Quadratic functions & equations: Quiz 1 8. Quadratics by taking square roots (intro) 9. Quadratics by taking square roots 10. Quadratics by taking square roots: strategy 11. Quadratics by taking square roots: with steps 12. Graph quadratics in vertex form"

My reading: the pieces are all stated plainly. The sign of a gives the way up or down, c is where it crosses the y-axis,
the roots are the x-intercepts, the vertex lies on the axis of symmetry halfway between the roots, and a table of
y-values has constant second differences of 2a (MathBits). Khan's order is factored form, then vertex form, then standard form.
Dan's Functions course already has the parabola y = x² as one of five families, with shifts and stretches; vertex form is
that shifted parabola, and the Functions brief leaves the "shifted parabola in vertex form" to this course.

### 4.8 Engineering uses
The projectile's height, power in a load against current and a beam's bending moment have quotes in section 7
(7.1 to 7.3). My reading: these three are chosen by the sources themselves: OpenStax calls quadratic functions the model for
"area and projectile motion", the MCA names projectiles and beams, and P = I²R is the electrician's own.

### 4.9 Polynomials of higher degree: roots, the factor theorem, long division
- **MathWorld: the factor theorem**
  - Source: Polynomial Factor Theorem -- from Wolfram MathWorld. https://mathworld.wolfram.com/PolynomialFactorTheorem.html
  - Quote: "The polynomial factor theorem, also called the factor theorem, states that if a polynomial P(x) has a root x=a , i.e., if P(a)=0 , then x-a is a factor of P(x)"
- **Math is Fun: the remainder is f(c), so no division is needed to find it**
  - Source: Remainder Theorem and Factor Theorem - Math is Fun. https://www.mathsisfun.com/algebra/polynomials-remainder-factor.html
  - Quote: "When we divide a polynomial f (x) by x−c the remainder is f (c) So to find the remainder after dividing by x-c we don't need to do any division: Just calculate f (c)"
- **LibreTexts: if 2 is a zero, a factor (x - 2) must be lurking in the factorisation**
  - Source: 3.2: The Factor and Remainder Theorems - Mathematics LibreTexts. https://math.libretexts.org/Courses/Cosumnes_River_College/Math_372:_College_Algebra_for_Calculus/03:_Polynomial_Functions/3.02:_The_Factor_and_Remainder_Theorems
  - Quote: "That is, if (x = 2) is a zero, it seems that there should be a factor of ((x − 2)) lurking around in the factorization of (f(x))."
- **A polynomial equation of degree n has n roots, some repeated, some complex** **SECONDARY** (Sheffield's copy of HELM 3.3)
  - Source: Solving Polynomial Equations. https://sheffield.ac.uk/media/31940/download?attachment
  - Quote: "A polynomial equation of degree n has n roots. Some (possibly all) of the roots may be repeated. Some (possibly all) of the roots may be complex."
- **Knowing one root gives a factor** **SECONDARY** (Sheffield's copy of HELM 3.3)
  - Source: Solving Polynomial Equations. https://sheffield.ac.uk/media/31940/download?attachment
  - Quote: "Knowing that x = 4 is a root we can state that ( x − 4) must be a factor of P ( x )."
- **Then the cubic is a linear times a quadratic** **SECONDARY** (Sheffield's copy of HELM 3.3)
  - Source: Solving Polynomial Equations. https://sheffield.ac.uk/media/31940/download?attachment
  - Quote: "Therefore P ( x ) can be re-written as a product of a linear and a quadratic term"
- **Real roots are the x-axis intercepts of the graph** **SECONDARY** (Sheffield's copy of HELM 3.3)
  - Source: Solving Polynomial Equations. https://sheffield.ac.uk/media/31940/download?attachment
  - Quote: "The real roots of the polynomial equation P ( x ) = 0 are given by the values of the intercepts of the function y = P ( x ) with the x -axis"
- **OpenStax College Algebra: multiplicity**
  - Source: 5.3 Graphs of Polynomial Functions - College Algebra 2e | OpenStax. https://openstax.org/books/college-algebra-2e/pages/5-3-graphs-of-polynomial-functions
  - Quote: "The number of times a given factor appears in the factored form of the equation of a polynomial is called the multiplicity"
- **OpenStax College Algebra: even multiplicity touches the axis**
  - Source: 5.3 Graphs of Polynomial Functions - College Algebra 2e | OpenStax. https://openstax.org/books/college-algebra-2e/pages/5-3-graphs-of-polynomial-functions
  - Quote: "For zeros with even multiplicities, the graphs touch or are tangent to the x -axis."
- **Edexcel 2005 report: long division was generally well understood; the factor theorem used occasionally**
  - Source: Mathematics - Pearson qualifications. https://qualifications.pearson.com/content/dam/pdf/A%20Level/Mathematics/2013/Exam%20materials/ARCHIVED%20237368_Complete_examiners_report_June_05.pdf
  - Quote: "Candidates usually found the quadratic factor by long division (which was generally well understood) or by ‘inspection’ and went on to factorise this quadratic, obtaining the correct linear factors."
- **Edexcel 2011 report: long division used to find a remainder, with sign slips; the remainder theorem gave full marks**
  - Source: Microsoft Word - 6664_01_rep_20110804. https://qualifications.pearson.com/content/dam/pdf/A%20Level/Mathematics/2013/Exam%20materials/6664_01_pef_20110817.pdf
  - Quote: "In part (a), a significant number used long division in order to find the remainder, many successfully but others making sign errors. Those that used the remainder theorem and found f (1) almost always gained full marks."
- **Edexcel 2011 report: the quadratic factor found by long division, with sign errors**
  - Source: Microsoft Word - 6664_01_rep_20110804. https://qualifications.pearson.com/content/dam/pdf/A%20Level/Mathematics/2013/Exam%20materials/6664_01_pef_20110817.pdf
  - Quote: "The majority found the quadratic factor by long division rather than inspection of coefficients. Some of those candidates who used a method of long division on occasion arrived at the incorrect quadratic factor because of sign errors."
- **HELM Workbook 10: a quadratic factor of a cubic with real coefficients**
  - Source: Complex Numbers. - Mathematics Materials. https://nucinkis-lab.cc.ic.ac.uk/HELM/HELM_Workbooks_6-10/WB10-all.pdf
  - Quote: "So x ² − 6 x + 13 is a quadratic factor of the cubic equation."
- **Khan Algebra 2 factorisation unit: higher degree and polynomial identities**
  - Source: Algebra 2 | Math | Khan Academy. https://www.khanacademy.org/math/algebra2
  - Quote: "Factor higher degree polynomials 36. Polynomial factorization: Quiz 1 37. Identify quadratic patterns 38. Factorization with substitution 39. Factor polynomials using structure 40. Polynomial factorization: Quiz 2 41. Polynomial identities"

My reading: the HNC lines ask for little: "quadratic function divided by linear factor" (MCA), polynomial division with the
factor and remainder theorems (Pearson 2017). HELM goes a gentler way: it factorises a cubic when one factor is given, finding
the quadratic by equating coefficients, and uses that again for partial fractions. The factor theorem is the link between factorising and roots (Bird states it
for any polynomial), and long division is "generally well understood" by candidates (Edexcel 2005). Multiplicity (a double
root touches the axis) connects directly to the discriminant being zero. Partial fractions: Pearson (2017, 2024), Bird and
HELM name them; the SQA unit and the MCA lines I read do not. Brilliant's Polynomials page and Khan's Algebra 2 put
partial fractions nowhere (they are not in their lists), so I would leave them out of this course and say where they go
(after algebraic fractions, in the integration part of the maths unit, HELM 3.6 and Bird chapter 7).
Complex roots of polynomials come in pairs (HELM 10) and belong to Complex numbers.

---

## 5. Prerequisites: what this leans on

What Dan has, from the built and briefed courses (my reading of those briefs, not quotes):
- **Linear equations:** single brackets, factorising out a common factor (the brief's lesson 3), equations with brackets,
  rearranging. Factorising a quadratic starts from the common factor.
- **Geometry fundamentals:** areas of rectangles and squares (the area model for expanding and for completing the square).
- **Powers and roots:** squares, the square root as the undo of a square, and "x² = 36 has two answers, 6 and −6". Its brief
  says "solving x² = c in general, factorising and the quadratic formula" are left to this course
  (`build/maths/powers-and-roots/brief.md`, left-for-later list), and that surds are kept small.
- **Functions and their graphs:** the graph of y = x² as a family; shifting and stretching a graph. Its brief says "the
  shifted parabola in vertex form belongs to Quadratics and polynomials" and lists "completing the square, and cubics with
  more than one bend" for later (`build/maths/functions-and-their-graphs/brief.md`).
- **Linear systems:** its brief leaves "a straight line meeting a curve" to this course
  (`build/maths/linear-systems/brief.md`), which is the MCA line "simultaneous equations of two unknowns consisting of linear and
  quadratic equations" (3.4).
- **Straight-line graphs:** its brief lists "curved graphs" for this course (`build/maths/straight-line-graphs/brief.md`).
- **Calculus fundamentals:** its brief says "where an equation would need quadratics, read it off the picture" because
  Dan has not done quadratics; this course lets that equation be solved (`build/maths/calculus-fundamentals/brief.md`).
- **Negative numbers and Fractions:** signs in products, and fractions in the formula.

What the research says the topic leans on:
- **Study of Year 11 students: weak fractions, algebra process and conventions held quadratics back**
  - Source: Opening Up Mathematics Education Research - ERIC. https://files.eric.ed.gov/fulltext/ED572345.pdf
  - Quote: "The findings indicate that students’ success was inhibited by errors that arose from a lack of procedural understanding regarding fractions, algebraic processes, and conceptual understanding regarding algebraic conventions. Without this prerequisite knowledge, working with and understanding the nature of quadratics was hindered."
- **Same study: many students lacked fluency with integers, fractions and algebraic conventions**
  - Source: Opening Up Mathematics Education Research - ERIC. https://files.eric.ed.gov/fulltext/ED572345.pdf
  - Quote: "It was found that many students were lacking in fluency in dealing with integers, fractions, and algebraic conventions."
- **Booth et al.: the equals sign and negative sign misconceptions hurt equation solving**
  - Source: Persistent and Pernicious Errors in Algebraic Problem Solving. https://files.eric.ed.gov/fulltext/EJ1059995.pdf
  - Quote: "In another instance, middle school students’ misconceptions about the equals sign and negative sign were both found to be problematic for learning to solve algebraic equations"
- **Khan Algebra 1 order: functions, exponents and radicals, then quadratics**
  - Source: Quadratic functions & equations | Algebra 1 | Math | Khan Academy. https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations
  - Quote: "Unit 8 Functions Unit 9 Sequences Unit 10 Absolute value & piecewise functions Unit 11 Exponents & radicals Unit 12 Exponential growth & decay Unit 13 Quadratics: Multiplying & factoring Unit 14 Quadratic functions & equations Unit 15 Irrational numbers"

My reading: three things are worth teaching inline because the research ties quadratics errors to them: the sign rules in a
product of two brackets (negative times negative), the habit of keeping both sides equal when moving terms, and fractions
and surds in the formula. Bitesize points to expanding double brackets and negative numbers before factorising quadratics
(2.2). Imaginary or complex roots are deferred to Complex numbers.

---

## 6. Misconceptions and learning science, skill by skill

### 6.1 Expanding two brackets
- **Beginners expand (x+y)2 as x2 + y2** **SECONDARY**
  - Source: Freshman's dream - Wikipedia. https://en.wikipedia.org/wiki/Freshman%27s_dream
  - Quote: "Beginning students commonly make this error in computing the … falsely assuming powers … over sums."
- **The root is assuming any operation distributes over addition** **SECONDARY**
  - Source: Student Misconceptions & Error Analysis Acro | Free Guide 2026 | OpenExamPrep. https://open-exam-prep.com/study-guides/ftce-math-6-12/assessment-error-analysis-differentiation/diagnosing-student-misconceptions
  - Quote: "The cognitive root is the intuitive assumption that any mathematical operation distributes linearly across terms separated by addition."
- **Quadratics study: adding unlike terms and misusing index notation and roots**
  - Source: Opening Up Mathematics Education Research - ERIC. https://files.eric.ed.gov/fulltext/ED572345.pdf
  - Quote: "Observed errors included adding unlike terms, and incorrect applications of index notation and radical arithmetic."

My reading: the typical error is (x + y)² = x² + y². The area picture (4.1) shows the missing 2xy as two rectangles, and a
number check ((1 + 4)² = 25, not 17) shows the error is false.

### 6.2 Factorising quadratics
- **Factoring x2+5x+6 as (x+3)(x+3) instead of (x+2)(x+3)**
  - Source: Persistent Misconceptions in Algebra: A Critical Analysis of Errors with Implications for Teaching and Further Research. https://thescipub.com/pdf/jssp.2025.38.50.pdf
  - Quote: "For instance, they might fail to correctly factor quadratic expressions without guidance, leading to errors like factoring x 2 +5x +6 as (x +3) (x +3) instead of (x +2) (x +3)"
- **SQA N5 2024 report: missing the common factor and forcing two brackets**
  - Source: National 5 Mathematics course report 2024. https://www.sqa.org.uk/files_ccc/2024-n5-course-report-mathematics.pdf
  - Quote: "Many candidates achieved full marks, but some candidates did not identify the common factor and applied an inappropriate method for factorising the expression leading to two brackets."
- **Quadratics study: a student did not look for the factors that multiply to ac and add to b**
  - Source: Opening Up Mathematics Education Research - ERIC. https://files.eric.ed.gov/fulltext/ED572345.pdf
  - Quote: "This student does not seek the correct factors (multiply to ac=24 and add to b=11)."
- **Quadratics study: factorising is taught as a mechanical process at the cost of understanding**
  - Source: Opening Up Mathematics Education Research - ERIC. https://files.eric.ed.gov/fulltext/ED572345.pdf
  - Quote: "These findings suggest an overemphasis on mechanical processes of factorisation at the expense of conceptual understanding."
- **Students forget the common factor in x2 + 2x** **SECONDARY** (blog comment)
  - Source: Quadratics Misconceptions - fractionfanatic - WordPress.com. https://fractionfanatic.wordpress.com/2016/02/07/quadratics-misconceptions
  - Quote: "Students often don’t remember to use GCF when factoring x^2 + 2x"

### 6.3 Solving by factorising, and by square roots
- **Edexcel 2021 report: x = 0 forgotten when x is a factor**
  - Source: Examiners' Report Principal Examiner Feedback January 2021. https://qualifications.pearson.com/content/dam/pdf/Edexcel-Awards-in-mathematics/Algebra/2012/Exam-materials/AAL30_01_pef_20210304.pdf
  - Quote: "Students should be reminded that if x is a factor of a quadratic equation eg 2 x ( x -3) then x =0 is a solution of that quadratic equation, too many students ignored this solution and only gave one value for x ."
- **Edexcel 2021 report: remember y squared = f(x) gives plus or minus the root**
  - Source: Examiners' Report Principal Examiner Feedback January 2021. https://qualifications.pearson.com/content/dam/pdf/Edexcel-Awards-in-mathematics/Algebra/2012/Exam-materials/AAL30_01_pef_20210304.pdf
  - Quote: "Students should be reminded that if y ² = f ( x ) then"
- **Quadratics study: able to factorise but not apply the null factor law**
  - Source: Opening Up Mathematics Education Research - ERIC. https://files.eric.ed.gov/fulltext/ED572345.pdf
  - Quote: "A common error observed across Questions 5 to 8 was that students were able to factorise the equations but either did not know how to apply the null factor law or did so incorrectly."
- **Quadratics study: 24 percent did not see the equation was already factorised**
  - Source: Opening Up Mathematics Education Research - ERIC. https://files.eric.ed.gov/fulltext/ED572345.pdf
  - Quote: "24% of students did not recognise that the equation was already factorised and they simply needed to apply the null factor law. Most of the students set about attempting to apply linear processes"
- **Quadratics study: treating quadratics like linear equations**
  - Source: Opening Up Mathematics Education Research - ERIC. https://files.eric.ed.gov/fulltext/ED572345.pdf
  - Quote: "Large proportions of the sample attempted to rearrange quadratic equations as if they were linear equations."
- **Quadratics study: 92 percent knew the root of 9 is 3 and none saw -3**
  - Source: Opening Up Mathematics Education Research - ERIC. https://files.eric.ed.gov/fulltext/ED572345.pdf
  - Quote: "92% of students recognised the square root of 9 was 3, but none recognised it could have two solutions, -3 or 3."
- **Vaiyavutjamai and Clements: expected errors (dividing by x, single answer for x squared = 9)**
  - Source: https://files.eric.ed.gov/fulltext/EJ766062.pdf. https://files.eric.ed.gov/fulltext/EJ766062.pdf
  - Quote: "It was also expected that some students would divide both sides of 2 x 2 = 10 x by x . And, with the “ x 2 = 9” question it was expected that the most common error would be the single solution ( x = 3) answer."
- **Vaiyavutjamai and Clements: two x's might be thought to take different values**
  - Source: https://files.eric.ed.gov/fulltext/EJ766062.pdf. https://files.eric.ed.gov/fulltext/EJ766062.pdf
  - Quote: "In students’ minds this could mean that if two x ’s appear in an equation then they should take different values."
- **Vaiyavutjamai and Clements (231 students): confused about a variable and a solution**
  - Source: https://files.eric.ed.gov/fulltext/EJ766062.pdf. https://files.eric.ed.gov/fulltext/EJ766062.pdf
  - Quote: "However, many were still confused about the concepts of a variable and of a “solution” to a quadratic equation. After the lessons, most students had acquired neither an instrumental nor a relational understanding of the mathematics associated with solving elementary quadratic equations."
- **Vaiyavutjamai and Clements: after 11 lessons the mean was just over 6 of 18**
  - Source: https://files.eric.ed.gov/fulltext/EJ766062.pdf. https://files.eric.ed.gov/fulltext/EJ766062.pdf
  - Quote: "Although the lessons on quadratic equations helped most students to perform better on the Quadratic Equations Test at the post-teaching stage, the post-teaching test mean for the 231 students was only slightly more than 6 out of a possible 18."
- **Vaiyavutjamai and Clements: correct answers on traditional tests reinforced misconceptions**
  - Source: https://files.eric.ed.gov/fulltext/EJ766062.pdf. https://files.eric.ed.gov/fulltext/EJ766062.pdf
  - Quote: "Getting correct answers to quadratic equations on traditional pencil- and-paper tests merely served to reinforce their misconceptions"
- **Vaiyavutjamai and Clements: traditional teaching falls short of relational understanding**
  - Source: https://files.eric.ed.gov/fulltext/EJ766062.pdf. https://files.eric.ed.gov/fulltext/EJ766062.pdf
  - Quote: "most middle-secondary students who participate in lessons on quadratic equations taught in traditional ways fall well short of acquiring a relational understanding of what they are taught."
- **Forgetting x = 0 and only writing x = 4 for x squared = 16** **SECONDARY** (teacher blog)
  - Source: Quadratics Misconceptions - fractionfanatic - WordPress.com. https://fractionfanatic.wordpress.com/2016/02/07/quadratics-misconceptions
  - Quote: "The first is when taking the square root to solve a quadratic equation in order to find stationary points, such as x² = 16, many of my pupils only write x = 4."
- **Forgetting x = 0 in x squared + 2x = 0** **SECONDARY** (teacher blog)
  - Source: Quadratics Misconceptions - fractionfanatic - WordPress.com. https://fractionfanatic.wordpress.com/2016/02/07/quadratics-misconceptions
  - Quote: "but often forget a solution when solving x² + 2x = 0."
- **Dividing both sides by x loses the root x = 0** **SECONDARY** (exam-prep site)
  - Source: Student Misconceptions & Error Analysis Acro | Free Guide 2026 | OpenExamPrep. https://open-exam-prep.com/study-guides/ftce-math-6-12/assessment-error-analysis-differentiation/diagnosing-student-misconceptions
  - Quote: "Dividing by a Variable and Dividing by Zero: When solving polynomial equations such as x 2 = 6 x , students routinely divide both sides by x to yield x = 6 , losing the root x = 0 ."
- **X(x + 9) = -20 solved as x = -20 or x + 9 = -20** **SECONDARY** (class slides)
  - Source: Solve Quadratics by Factoring - ZPP Misconception. https://dmgz7s8mmr55y.cloudfront.net/admin/presentation/660722564223b274fec82a2c/solve-quadratics-by-factoring-zpp-misconception
  - Quote: "Angelica solved the quadratic equation x 2 + 9 x = − 20 as follows Step 1: x ( x + 9 ) = − 20 Step 2: x = − 20 or x + 9 = − 20"
- **Negative coefficient does not mean negative solutions** **SECONDARY** (teacher site)
  - Source: Solving quadratic equations by factorising probing questions - mr barton maths. https://mrbartonmaths.com/solving-quadratic-equations-by-factorising-probing-questions/
  - Quote: "This is the “negative coefficient means negative solutions” misconception: the sign of the ( x )-coefficient does not directly determine the sign of the solutions."
- **The factors contain +2 and +5 but the solutions are their negatives** **SECONDARY** (teacher site)
  - Source: Solving quadratic equations by factorising probing questions - mr barton maths. https://mrbartonmaths.com/solving-quadratic-equations-by-factorising-probing-questions/
  - Quote: "The “sign confusion” misconception strikes: the factors contain +2 and +5, but the solutions are their negatives."
- **Edexcel 2021 report: the plus-or-minus sign left off the final answer**
  - Source: Examiners' Report Principal Examiner Feedback January 2021. https://qualifications.pearson.com/content/dam/pdf/Edexcel-Awards-in-mathematics/Algebra/2012/Exam-materials/AAL30_01_pef_20210304.pdf
  - Quote: "Part (b) was accessible to most students although the most common error here was to omit the ± sign in front of the square root sign when writing the final answer."
- **Unable to tell factorising an expression from solving an equation** **SECONDARY** (Pearson report on a copy host)
  - Source: Examiners’ Report Principal Examiner Feedback Summer 2025. https://files.revisely.com/documents/papers/alevel/maths/edexcel/603468-june-2025-er-9ma0-02-a-level-pure-mathematics-2.pdf
  - Quote: "A significant number appeared unable to distinguish between factorising an expression and solving an equation, with many presenting “ x = 0, 2, 10” or similar as their final answer."
- **Cambridge International 2024 report: show the factorisation, formula or completing the square; a calculator answer alone earns no method marks**
  - Source: MATHEMATICS. https://www.cambridgeinternational.org/Images/567737-june-2024-examiner-report.pdf
  - Quote: "In the case of quadratic equations, for example, it would be necessary to show factorisation, use of the quadratic formula or completing the square as stated in the syllabus. Using calculators to solve equations and writing down only the solution is not sufficient for certain marks to be awarded."
- **Linear methods tried on quadratics, and the null factor law misunderstood** **SECONDARY** (a study of Irish undergraduates, reporting O'Connor and Norton)
  - Source: How Well Do High-Achieving Undergraduate Students Understand School Algebra?. https://pmc.ncbi.nlm.nih.gov/articles/PMC9922173
  - Quote: "O’Connor and Norton (2016) found that students sometimes attempt to use methods suited to solving linear equations in the context of quadratic equations. They also found that even when a quadratic equation was presented in factorised form, students had problems finding solutions because of misconceptions regarding the null factor law (that is, if ab=0, then either a=0 or b=0)."

My reading: the strongest sources here are the research papers and the examiner reports (Vaiyavutjamai and Clements, a study of
231 students; the Norton review; Edexcel). The blog and slide pages (SECONDARY) add concrete cases:
(a) x(x − 5) = 6 solved as x = 6 or x − 5 = 6, because the right-hand side is not zero; (b) x² + 2x = 0 with the root
x = 0 lost; (c) x² = 16 with only +4; (d) dividing by x; (e) the sign of the solution taken from the sign in the bracket.
Vaiyavutjamai and Clements add that students think the two x's in (x − 3)(x − 5) = 0 must be different, and that correct
answers on traditional tests did not mean understanding. The Pearson report also sees a gap between factorising an expression
and solving an equation (the answer "x = 0, 2, 10" for a factorising question). A check by substitution is a natural answer to each.

### 6.4 Completing the square
- **Grade 11 study: most learners find completing the square difficult and prefer factoring or the formula**
  - Source: Solving quadratic equations by completing the square: Applying Newman’s Error Analysis Model to analyse Grade 11 errors. https://files.eric.ed.gov/fulltext/EJ1412602.pdf
  - Quote: "This concurs with Foster’s (2020) study that the majority of learners find using CS to solve QE difficult and prefer to use factoring and the quadratic formula."
- **Review: teachers avoid completing the square and the formula because of process errors**
  - Source: Opening Up Mathematics Education Research - ERIC. https://files.eric.ed.gov/fulltext/ED572345.pdf
  - Quote: "Research suggests that teachers tend to avoid teaching alternative methods due to high instances of process skill errors with techniques such as the quadratic formula and completing the square (Zakaria et al., 2010)."
- **Zakaria et al.: completing the square errors are in transformation and process skill**
  - Source: Analysis of Students’ Error in Learning of Quadratic Equations. https://files.eric.ed.gov/fulltext/EJ1065893.pdf
  - Quote: "In completing the square, students have shown the tendency to make error in transformation and process skill."
- **Edexcel 2005 report: sign errors when completing the square**
  - Source: Mathematics - Pearson qualifications. https://qualifications.pearson.com/content/dam/pdf/A%20Level/Mathematics/2013/Exam%20materials/ARCHIVED%20237368_Complete_examiners_report_June_05.pdf
  - Quote: "In part (a) the most successful approach involved completing the square although sign errors such as"
- **Grade 11 study: learners added the square of half the coefficient on one side only**
  - Source: Solving quadratic equations by completing the square: Applying Newman’s Error Analysis Model to analyse Grade 11 errors. https://files.eric.ed.gov/fulltext/EJ1412602.pdf
  - Quote: "Most learners treated the equations the same when applying CS, adding the square of half the coefficient of x on one side of the equation."

### 6.5 The quadratic formula and the discriminant
- **Zakaria et al.: sign difficulties in the formula**
  - Source: Analysis of Students’ Error in Learning of Quadratic Equations. https://files.eric.ed.gov/fulltext/EJ1065893.pdf
  - Quote: "At the same time students also experienced difficulties in replacing the positive and negative sign, resulting in errors in using the formula."
- **Zakaria et al.: the error types**
  - Source: Analysis of Students’ Error in Learning of Quadratic Equations. https://files.eric.ed.gov/fulltext/EJ1065893.pdf
  - Quote: "The findings of this study conclude that the error made in learning quadratic equations consist of error in comprehension, transformation, process skill, encoding and carelessness. However, most of the errors made were transformation and the process skill errors."
- **Edexcel 2021 report: the plus-or-minus sign omitted (again) and surds not simplified**
  - Source: Examiners' Report Principal Examiner Feedback January 2021. https://qualifications.pearson.com/content/dam/pdf/Edexcel-Awards-in-mathematics/Algebra/2012/Exam-materials/AAL30_01_pef_20210304.pdf
  - Quote: "indicating the inability to extract the factor correct from within the square root sign correctly."
- **SQA N5 2023 report: errors working out the discriminant**
  - Source: National 5 Mathematics Course Report 2023. https://www.sqa.org.uk/sqa//files_ccc/2023-n5-course-report-mathematics.pdf
  - Quote: "Most candidates found the discriminant, but some candidates made errors when carrying out the calculations."
- **SQA N5 2023 report: incomplete statements about the nature of the roots**
  - Source: National 5 Mathematics Course Report 2023. https://www.sqa.org.uk/sqa//files_ccc/2023-n5-course-report-mathematics.pdf
  - Quote: "Some candidates gave an incomplete description of the nature of the roots, omitting a key part of the statement (two, real, or distinct)."
- **SQA N5 2023 report: finding roots from a negative discriminant**
  - Source: National 5 Mathematics Course Report 2023. https://www.sqa.org.uk/sqa//files_ccc/2023-n5-course-report-mathematics.pdf
  - Quote: "obtaining a negative discriminant and still finding roots"
- **SQA N5 2023 report: solving a quadratic as if it were linear**
  - Source: National 5 Mathematics Course Report 2023. https://www.sqa.org.uk/sqa//files_ccc/2023-n5-course-report-mathematics.pdf
  - Quote: "trying to solve the equation as if it were linear"

### 6.6 The parabola's shape and its rule
- **SQA N5 2023 report: features of a quadratic function marked poorly**
  - Source: National 5 Mathematics Course Report 2023. https://www.sqa.org.uk/sqa//files_ccc/2023-n5-course-report-mathematics.pdf
  - Quote: "Question 4(a)(i) and (b) — identifying features of a quadratic function Many candidates did not gain any marks in these parts of this question. In 4(a)(i), many candidates incorrectly gave 3 as their answer."
- **Ellis and Grinstead: two-thirds of interviewed students called a the slope of the parabola**
  - Source: ERIC - EJ837534 - Hidden Lessons: How a Focus on Slope-Like Properties of Quadratic Functions Encouraged Unexpected Generalizations, Journal of Mathematical Behavior, 2008. https://eric.ed.gov/?id=EJ837534
  - Quote: "Students' generalizations about these connections led to a surprising finding: two-thirds of the students interviewed identified the parameter a as the ”slope” of the parabola."
- **Ellis and Grinstead: what in teaching fed the slope idea**
  - Source: ERIC - EJ837534 - Hidden Lessons: How a Focus on Slope-Like Properties of Quadratic Functions Encouraged Unexpected Generalizations, Journal of Mathematical Behavior, 2008. https://eric.ed.gov/?id=EJ837534
  - Quote: "Analysis of qualitative data from interviews and classroom observations led to the development of three ”focusing phenomena” in the classroom environment that inadvertently supported a focus on slope-like properties of quadratic functions: (a) the use of linear analogies, (b) the rise over run method, and (c) viewing ”a” as dynamic rather than"
- **Zaslavsky 1997 (800 students): conceptual obstacles were fairly pervasive**
  - Source: ERIC - EJ548083 - Conceptual Obstacles in the Learning of Quadratic Functions., Focus on Learning Problems in Mathematics, 1997. https://eric.ed.gov/?id=EJ548083
  - Quote: "Attempts to reveal students' (N=800) misconceptions regarding quadratic functions, and identifies conceptual obstacles that may impede students' understanding. Findings indicate that the conceptual obstacles identified were fairly pervasive."
- **Childers: Zaslavsky's five obstacles**
  - Source: Students' Understanding of the Concept of Vertex of Quadratic .... https://www.cimt.org.uk/journal/childers.pdf
  - Quote: "identified five main obstacles in student understanding of a quadratic function: graphical interpretation, relation between a quadratic function and a quadratic equation, analogy between a quadratic function and a linear"
- **Childers: students preferred the standard form to vertex form**
  - Source: Students' Understanding of the Concept of Vertex of Quadratic .... https://www.cimt.org.uk/journal/childers.pdf
  - Quote: "it was also evident that students preferred translating from an algebraic equation to a graph rather than vice versa and that students preferred to work with the standard form of a quadratic function rather than other forms, such as vertex form."
- **Childers: some students solved the function set equal to 0 to find the vertex**
  - Source: Students' Understanding of the Concept of Vertex of Quadratic .... https://www.cimt.org.uk/journal/childers.pdf
  - Quote: "the vertex correctly, this led some students to solve the original quadratic function set equal to 0."
- **Turkish study: some students drew a quadratic graph like a linear one**
  - Source: Failures and Inabilities of High School Students about Quadratic Equations and Functions. https://files.eric.ed.gov/fulltext/EJ1078261.pdf
  - Quote: "Tekin, Konyalıoğlu and Işık (2009) reported that more than half of the science high school students could draw the quadratic function graph correctly, but the majority of the students from the other high schools had difficulty drawing the parabola graphs and some of the students drew the parabolic function graphs similar to the linear function"
- **Zimbabwe study: students confused when forms are shown in unfamiliar ways**
  - Source: Exploring the Conceptual Understanding of the Quadratic Function Concept in Teachers’ Colleges in Zimbabwe. https://files.eric.ed.gov/fulltext/EJ1265095.pdf
  - Quote: "Students get confused when quadratic function concepts are presented in different ways which they are not used to."
- **Learning obstacles: graph reading, function versus equation, and mistaking it for a linear function**
  - Source: Analysis Learning Obstacle on Quadratic Function Topic. https://www.ijiet.org/vol8/1122-SK022.pdf
  - Quote: "It can summarized that some common obstacles experienced by the students include: 1) students' difficulties in interpreting the information contained in the function graph; 2) the relationship between quadratic function and quadratic equations; 3) the similarities between quadratic function and linear function;"

My reading: the parabola work shows two separate risks. One is carrying linear ideas across (a taken as a slope, c as a gradient,
drawing a straight line); Ellis and Grinstead name the teaching moves that fed it (linear analogies, rise over run, treating a
as moving). The other is losing the link between the equation and the graph, including looking for the vertex by setting
the function to zero. The Functions course teaches shifts without a rule, which suits vertex form.

### 6.7 Higher-degree polynomials
- **Edexcel 2005 report: unsure of the difference between a factor and a root**
  - Source: Mathematics - Pearson qualifications. https://qualifications.pearson.com/content/dam/pdf/A%20Level/Mathematics/2013/Exam%20materials/ARCHIVED%20237368_Complete_examiners_report_June_05.pdf
  - Quote: "Some candidates seemed unsure of the difference between a factor and a root."
- **Edexcel 2005 report: confusion between the factor (x - 2) and the solution x = 2**
  - Source: Mathematics - Pearson qualifications. https://qualifications.pearson.com/content/dam/pdf/A%20Level/Mathematics/2013/Exam%20materials/ARCHIVED%20237368_Complete_examiners_report_June_05.pdf
  - Quote: "There seemed to be some confusion between the factor ( x – 2) and the solution x =2."
- **Edexcel 2005 report: the factor theorem was not understood by many candidates**
  - Source: Mathematics - Pearson qualifications. https://qualifications.pearson.com/content/dam/pdf/A%20Level/Mathematics/2013/Exam%20materials/ARCHIVED%20237368_Complete_examiners_report_June_05.pdf
  - Quote: "Part (a) did require the use of the factor theorem, which was not understood by many candidates, who just showed the factorisation of f( x )."
- **F(x + 3) is expected to shift right** **SECONDARY** (exam-prep site)
  - Source: Student Misconceptions & Error Analysis Acro | Free Guide 2026 | OpenExamPrep. https://open-exam-prep.com/study-guides/ftce-math-6-12/assessment-error-analysis-differentiation/diagnosing-student-misconceptions
  - Quote: "Horizontal Translation Inversion: Students universally grasp that f ( x ) + k shifts a graph vertically upward for k > 0 , but struggle with f ( x + h ) , frequently predicting that f ( x + 3 ) shifts the graph 3 units to the right."

### 6.8 What the learning science says
- **Worked examples help students solve similar problems**
  - Source: Worked Examples 1 Simple Practice Doesn’t Always Make Perfect: Evidence from the Worked Example Effect Julie L. Booth, Kelly M.. https://files.eric.ed.gov/fulltext/ED566953.pdf
  - Quote: "Laboratory research has demonstrated that studying worked examples improves students’ ability to solve problems that are very similar to those they studied"
- **Explaining incorrect worked examples helps encoding and reduces misconceptions**
  - Source: Worked Examples 1 Simple Practice Doesn’t Always Make Perfect: Evidence from the Worked Example Effect Julie L. Booth, Kelly M.. https://files.eric.ed.gov/fulltext/ED566953.pdf
  - Quote: "Studies testing effectiveness of explaining incorrect examples (with or without correct examples) have shown that studying incorrect worked examples benefits encoding of algebraic equations (Booth, Lange, Koedinger, & Newton, 2013), promotes learning of correct concepts and procedures (Adams, McLaren, Durkin, Mayer, Rittle-Johnson, Isotani, & van Velsen, 2014; Booth et al., 2015; Booth et al., in press; Durkin & Rittle-Johnson, 2012), and reduces student misconceptions about the instructional content"
- **Comparing alternative methods leads to procedural flexibility**
  - Source: Worked Examples 1 Simple Practice Doesn’t Always Make Perfect: Evidence from the Worked Example Effect Julie L. Booth, Kelly M.. https://files.eric.ed.gov/fulltext/ED566953.pdf
  - Quote: "Research studies on comparison of worked examples have shown that comparing alternative methods leads to greater procedural flexibility (i.e., knowing multiple methods for solving a problem and choosing the most efficient given the problem context"
- **Booth et al.: students bring misconceptions across from arithmetic**
  - Source: Persistent and Pernicious Errors in Algebraic Problem Solving. https://files.eric.ed.gov/fulltext/EJ1059995.pdf
  - Quote: "Students hold many misconceptions as they transition from arithmetic to algebraic think- ing, and these misconceptions can hinder their performance and learning in the subject."
- **Review: a lack of geometric models and graphs in context**
  - Source: Opening Up Mathematics Education Research - ERIC. https://files.eric.ed.gov/fulltext/ED572345.pdf
  - Quote: "The results suggest a lack of alternative pedagogies such as links to geometric models recommended by some authors (e.g., Howden, 2001; Norton, 2015) and the integrated use of graphs in contexual settings (e.g., Barnes, 1991)."
- **Review: failing quadratics shuts students out of science study**
  - Source: Opening Up Mathematics Education Research - ERIC. https://files.eric.ed.gov/fulltext/ED572345.pdf
  - Quote: "Failure at working with quadratic equations virtually precludes students from accessing the powerful mathematics that is necessary to enrol in courses involving the study of sciences at tertiary levels (Watt, 2005)."
- **Review: little research informs the teaching of quadratics**
  - Source: Opening Up Mathematics Education Research - ERIC. https://files.eric.ed.gov/fulltext/ED572345.pdf
  - Quote: "Despite the importance of this topic area there has been little research to inform the reform of pedagogy associated with quadratics."
- **Norton's review: many students lacked the tools to factorise, and many who could did not see what the factorised form means for the roots**
  - Source: Opening Up Mathematics Education Research - ERIC. https://files.eric.ed.gov/fulltext/ED572345.pdf
  - Quote: "Many students in this study did not have the tools to factorise, and many of those who could did not understand the implications of the factorised form for finding the roots."
- **Norton's review: cognitive load theory explains why prerequisite gaps block quadratics**
  - Source: Opening Up Mathematics Education Research - ERIC. https://files.eric.ed.gov/fulltext/ED572345.pdf
  - Quote: "Cognitive load theorists (e.g., Kirschner et al., 2006) provide an explanation as to why these deficits become a critical hindrance to engagement with quadratics."
- **Systematic review (Educational Studies in Mathematics, 2026): quadratic equations are a bridge or a gatekeeper**
  - Source: Empirical findings on the teaching and learning of quadratic equations: a systematic review | Educational Studies in Mathematics | Springer Nature Link. https://link.springer.com/article/10.1007/s10649-026-10493-6
  - Quote: "Quadratic equations in one variable (QE) are an important concept in mathematics and can be seen as either a bridge or a gatekeeper between secondary school and university level mathematics."
- **Systematic review: traditional, standard curriculum-aligned teaching is associated with problems learning quadratic equations**
  - Source: Empirical findings on the teaching and learning of quadratic equations: a systematic review | Educational Studies in Mathematics | Springer Nature Link. https://link.springer.com/article/10.1007/s10649-026-10493-6
  - Quote: "From this review’s findings, teaching approaches that are traditional or standard curriculum-aligned seem to be associated with issues in learning QE."
- **Systematic review: teaching completing the square through geometric representations is advocated but the empirical findings remain tentative**
  - Source: Empirical findings on the teaching and learning of quadratic equations: a systematic review | Educational Studies in Mathematics | Springer Nature Link. https://link.springer.com/article/10.1007/s10649-026-10493-6
  - Quote: "Although others have previously advocated teaching completing the square through historical geometric representations (e.g., Radford & Guérette, 2000 ), the empirical findings from the included studies remain tentative."

A 2026 systematic review of 38 studies says traditional, curriculum-aligned teaching goes with learning problems, and that
teaching completing the square through geometric pictures is advocated but its empirical support is tentative. I did not find a
source showing that an area or tile picture beats a symbolic route; the support is for the picture as one of several
representations, linked to graphs.

My reading, for the app's own method (predict, play, explain, say it back, quick checks, spaced review): (a) worked examples help
for procedures such as the formula; (b) explaining a worked wrong answer is the best-supported fix for misconceptions, and
section 6.3 gives ready-made wrong answers; (c) comparing methods on the same equation (factorise, complete the square,
formula) builds the choice of method; (d) geometric models and graphs-in-context are what the review says is missing. The
studies are mostly secondary-school students outside the UK, so how strongly they carry over to an adult electrician is
**UNCONFIRMED**; the examiner reports are for Scottish and English exams.

---

## 7. Where it is used, for an electrician going into marine engineering

### 7.1 Electrical power and heating: P = I²R
- **University Physics: a motor's heating is proportional to the square of the current**
  - Source: 9.5 Electrical Energy and Power – University Physics Volume 2. https://pressbooks.online.ucf.edu/osuniversityphysics2/chapter/electrical-energy-and-power
  - Quote: "The power dissipated by the motor can be significant since the thermal power dissipated by the motor is proportional to the square of the current"
- **University Physics: P = I2R for a resistor**
  - Source: 9.5 Electrical Energy and Power – University Physics Volume 2. https://pressbooks.online.ucf.edu/osuniversityphysics2/chapter/electrical-energy-and-power
  - Quote: "Power dissipated by a resistor depends on the square of the current through the resistor"
- **Doubling the current quadruples the heat loss** **SECONDARY** (calculator site)
  - Source: Watt Calculator – Electrical Power Formula P = VI, V²/R, I²R. https://calcmate.org/physics/watt-calculator
  - Quote: "which is why doubling the current quadruples the heat loss."
- **Maximum power transfer: the load resistance must equal the source resistance**
  - Source: Maximum power transfer theorem - Wikipedia. https://en.wikipedia.org/wiki/Maximum_power_transfer_theorem
  - Quote: "In electrical engineering , the maximum power transfer theorem states that, to obtain maximum external power from a power source with internal resistance , the resistance of the load must equal the resistance of the source as viewed from its output terminals."
- **Maximum power transfer is not maximum efficiency; efficiency is 50 percent at the match**
  - Source: Maximum power transfer theorem - Wikipedia. https://en.wikipedia.org/wiki/Maximum_power_transfer_theorem
  - Quote: "The theorem results in maximum power transfer from the power source to the load, but not maximum efficiency of useful power out of total power consumed."
- **Farside (UT Austin): at the match only half the power reaches the load**
  - Source: Power and Internal Resistance. https://farside.ph.utexas.edu/teaching/316/lectures/node62.html
  - Quote: "Note that in the optimum case, $R=r$ , only half of the power output of the voltage source is transmitted to the load. The other half is dissipated as heat inside the source."
- **PMC paper: load power is the source's total power minus the I2r loss**
  - Source: Finite-Time Thermodynamics of Battery Discharging: Power–Efficiency Trade-Off and Optimization. https://pmc.ncbi.nlm.nih.gov/articles/PMC13512147
  - Quote: "When supplying an external resistive load R_L, Kirchhoff’s voltage law and energy conservation dictate that the load power is given by where εI is the total chemical power of the battery and I^2r is the dissipative power due to circuit heating."
- **PMC paper: maximum power at load resistance r and current epsilon over 2r**
  - Source: Finite-Time Thermodynamics of Battery Discharging: Power–Efficiency Trade-Off and Optimization. https://pmc.ncbi.nlm.nih.gov/articles/PMC13512147
  - Quote: "It is attained when the load resistance is exactly the internal resistance r, with the corresponding optimal current being I^(★)=ε/(2r)."
- **Physics SE: power against load resistance is not a parabola**
  - Source: electric circuits - Resistance vs Power experiment - not linear relationship? - Physics Stack Exchange. https://physics.stackexchange.com/questions/242009/resistance-vs-power-experiment-not-linear-relationship
  - Quote: "This is a plot of power as a function of load resistance, and you don't expect that to look like a parabola at all."
- **Physics SE: P = I2R is linear in R only if the current is fixed, but the current falls as R rises**
  - Source: electric circuits - Resistance vs Power experiment - not linear relationship? - Physics Stack Exchange. https://physics.stackexchange.com/questions/242009/resistance-vs-power-experiment-not-linear-relationship
  - Quote: "I assume that you expect this to be linear because of the equation $P=I^2R$, which would be linear in $R$ for a fixed current. But your current in this case is not fixed, but decreases with increasing resistance."
- **MIT OCW: the maximum power transfer problem, P = I2R**
  - Source: Maximum Power Transfer in a Circuit. https://ocw.mit.edu/courses/6-101-introductory-analog-electronics-laboratory-spring-2007/7faf76f06ceb6721c2071a3e7ff9776e_max_power.pdf
  - Quote: "The power P dissipated in a resistor R is given by the formula P = I 2 R , where I is the current flowing through the resistor."

**SECONDARY:** the calculator site (heat loss) and the Stack Exchange answers. My reading: P = I²R is a parabola of power
against current at a fixed resistance, so doubling the current quadruples the heat. A battery or supply with internal
resistance r delivers P = EI − I²r to the load, a downward parabola in I whose peak is at I = E ÷ 2r, which is where the load
resistance equals r (the PMC paper gives the same current). So maximum power transfer can be found by completing the square
in I, without calculus. Power against the load resistance R is not a parabola, and the Stack Exchange answer says so; the
quadratic is in the current. At the peak only half the source's power reaches the load. The Wikipedia lines also separate
maximum power from maximum efficiency.

### 7.2 A projectile's height
- **OpenStax Physics: the fireworks time of flight is a quadratic in t**
  - Source: 5.3 Projectile Motion - Physics | OpenStax. https://openstax.org/books/physics/pages/5-3-projectile-motion
  - Quote: "Rearranging terms gives a quadratic equation in This expression is a quadratic equation of the form , where the constants are a = 4.90, b = –14.3, and c = –20.0. Its solutions are given by the quadratic formula"
- **OpenStax Physics: two solutions, and the negative time is discarded**
  - Source: 5.3 Projectile Motion - Physics | OpenStax. https://openstax.org/books/physics/pages/5-3-projectile-motion
  - Quote: "This equation yields two solutions t = 3.96 and t = –1.03. You may verify these solutions as an exercise. The time is t = 3.96 s or –1.03 s. The negative value of time implies an event before the start of motion, so we discard it."
- **OpenStax Precalculus: quadratic functions model area and projectile motion**
  - Source: 3.2 Quadratic Functions - Precalculus | OpenStax. https://openstax.org/books/precalculus/pages/3-2-quadratic-functions
  - Quote: "In this section, we will investigate quadratic functions, which frequently model problems involving area and projectile motion."
- **LibreTexts (OpenStax): the maximum is at the vertex of the parabola**
  - Source: 3.2: Quadratic Functions - Mathematics LibreTexts. https://math.libretexts.org/Bookshelves/Precalculus/Precalculus_1e_(OpenStax)/03%3A_Polynomial_and_Rational_Functions/3.02%3A_Quadratic_Functions
  - Quote: "The ball reaches the maximum height at the vertex of the parabola."
- **OpenStax Precalculus: the second answer is outside the reasonable domain of the model**
  - Source: 3.2: Quadratic Functions - Mathematics LibreTexts. https://math.libretexts.org/Bookshelves/Precalculus/Precalculus_1e_(OpenStax)/03%3A_Polynomial_and_Rational_Functions/3.02%3A_Quadratic_Functions
  - Quote: "The second answer is outside the reasonable domain of our model, so we conclude the ball will hit the ground after about 5.458 seconds."
- **The peak sits midway between the roots** **SECONDARY** (Wikipedia)
  - Source: Projectile motion - Wikipedia. https://en.wikipedia.org/wiki/Projectile_motion
  - Quote: "This matches the formula found above (the time of flight) as the maximum height (in a parabola) sits in the middle of its roots."
- **Metric form h(t) = -4.9t2 + v0 t + h0** **SECONDARY**
  - Source: Projectile Motion Formulas: h = ½gt², Range = v²sin(2θ)/g. https://www.mathwords.com/p/projectile_motion.htm
  - Quote: "When using metric units, the formula becomes h(t) = −4.9t² + v₀t + h₀, where height is in meters and time is in seconds."
- **Hits the ground means the roots, peak height means the vertex** **SECONDARY** (maths site)
  - Source: Projectile Motion Formulas: h = ½gt², Range = v²sin(2θ)/g. https://www.mathwords.com/p/projectile_motion.htm
  - Quote: "solving for when an object hits the ground means finding the roots of a quadratic, and finding the peak height means locating the vertex of a parabola."
- **HELM 34 Modelling Motion has a Projectiles section**
  - Source: Help Engineers Learn Mathematics (HELM) workbooks | MASH | The University of Sheffield. https://sheffield.ac.uk/mash/maths-resources/helm
  - Quote: "34. Modelling Motion [Projectiles"

**SECONDARY:** Wikipedia and the maths-word site. My reading: height against time is a downward parabola; when it lands is the
positive root, the negative root is thrown away and the reason is stated; the peak is at the vertex, halfway between the
roots. The MCA asks for projectiles at Chief Engineer level (3.4). The OpenStax physics text prints the maths as images, so
the excerpts show gaps where the formula should be; the numbers (a = 4.90, b = −14.3, c = −20.0) are shown.

### 7.3 A beam's bending moment
- **Beam with a uniform load: maximum bending moment wL2/8 at midspan; parabolic diagram**
  - Source: Calculator for Engineers - Bending Moment and Shear Force for simply supported beam with uniform load on full span. https://civilengineeronline.com/mech/bmcalcuf.php
  - Quote: "In this case the maximum value of bending moment will occur at the midspan and will be equal to wL 2 /8."
- **Beam with a uniform load: the bending moment diagram is parabolic**
  - Source: Calculator for Engineers - Bending Moment and Shear Force for simply supported beam with uniform load on full span. https://civilengineeronline.com/mech/bmcalcuf.php
  - Quote: "The bending moment diagram will be parabolic in nature and shear force diagram will be straingt line with zero shear force at the midspan which is the point of maximum bending moment also."
- **A cantilever's bending moment is a quadratic in x**
  - Source: Procedure for drawing shear force and bending moment diagram:. https://www.idc-online.com/technical_references/pdfs/mechanical_engineering/Procedure_for_Drawing_Shear_Force_and_Bending_Moment_Diagram.pdf
  - Quote: "The above equation is a quadratic in x, when B.M is plotted against x this will produces a parabolic variation."
- **MIT: the moment diagram is one order higher than the shear diagram**
  - Source: Statics of Bending: Shear and Bending Moment Diagrams. https://web.mit.edu/course/3/3.11/www/modules/statics.pdf
  - Quote: "The moment diagram is now parabolic, always being one order higher than the shear diagram."

My reading: for a simply supported beam with a uniform load w over a span L, the bending moment is M = wLx/2 − wx²/2, a downward
parabola in x with its peak wL²/8 at midspan, and zero at both ends (the roots 0 and L). The three beam sources agree it is
parabolic, and the MIT note ties it to the shear (the moment is "one order higher") which links to Calculus fundamentals.
The MCA's General Engineering Science A has "simply supported beams involving vertical forces and uniformly distributed loads".

### 7.4 Ship power, torque and pumps
- **USNA: doubling a destroyer's speed needs 2 cubed = 8 times the power**
  - Source: Chapter 7 Resistance and Powering of Ships. https://usna.edu/NAOE/_files/documents/Courses/EN400/02.07_Chapter_7.pdf
  - Quote: "a destroyer from 15 knots to 30 knots will require 2 3 = 8 times as much power!"
- **USNA: speed and power are not linearly related; doubling a YP from 7 to 14 knots raises power tenfold**
  - Source: Principles of Ship Performance Course Notes. https://www.usna.edu/NAOE/_files/documents/Courses/EN400/EN400_Course_Notes_Fall_AY2021_July2020.pdf
  - Quote: "doubling of speed of the Navy YP from 7 to 14 knots increases the power by a factor of 10! Speed and power are not linearly related."
- **USNA: often ship power is roughly proportional to the cube of the speed**
  - Source: Principles of Ship Performance Course Notes. https://www.usna.edu/NAOE/_files/documents/Courses/EN400/EN400_Course_Notes_Fall_AY2021_July2020.pdf
  - Quote: "Often, ship power is roughly proportional to the cube of the speed"
- **Propeller law, power as the cube and torque as the square of rpm** **SECONDARY** (blog)
  - Source: Propeller curve and its significance - Marine engineers knowledge. https://www.marineengineersknowledge.com/2025/06/propeller%20curve.html
  - Quote: "The power (P) required to turn the propeller is approximately proportional to the cube of the propeller speed (N - RPM). * The torque (Q) required is approximately proportional to the square of the propeller speed."
- **MDPI: a pump's pressure against flow is modelled by a second-degree polynomial**
  - Source: Model-Based Assessment of Energy Efficiency in Industrial Pump Systems: A Case Study Approach | MDPI. https://www.mdpi.com/2076-3417/14/22/10430
  - Quote: "the dependence of the pressure difference Δ p on the flow rate Q is modelled by a second-degree polynomial"
- **AFT: a quadratic pump curve is solved analytically; higher orders need Newton-Raphson**
  - Source: Standard Pump Curve Waterhammer Theory. https://docs.aft.com/impulse10/StandardPumpCurveWaterhammerTheory.html
  - Quote: "For quadratic curve fits (d and e are zero), this equation is solved analytically. For higher order curve fits, it is solved for with Newton-Raphson iteration."
- **AFT: the head/flow curve follows a polynomial relationship**
  - Source: Standard Pump Curve Waterhammer Theory. https://docs.aft.com/impulse10/StandardPumpCurveWaterhammerTheory.html
  - Quote: "Considering the case where the head/flow curve follows a polynomial relationship, and including a speed ratio term s"

**SECONDARY:** the propeller-law blog. The USNA text prints 2³ as "2 3" in the saved excerpt. My reading: ship power goes about
as the cube of speed and propeller torque about as the square of rpm (the real YP curve is steeper, so "roughly"). Pump head
against flow is fitted by a second-degree polynomial in a published case study, and the pump-simulation manual solves a
quadratic fit analytically but needs Newton-Raphson for higher orders, which is the honest reason why higher-degree
polynomials stop having a formula. These are the best marine examples of curves and polynomial fits I found; no source says
a student on a marine HNC will meet them in these words (**UNCONFIRMED**).

### 7.5 In the books and workbooks
- **Practical problems involving quadratic equations is a section of the quadratic chapter** **SECONDARY** (university-hosted copy of Bird, 4th ed.)
  - Source: Engineering Mathematics. https://uodiyala.edu.iq/uploads/PDF%20ELIBRARY%20UODIYALA/EL24/Engineering_Mathematics_4E.pdf
  - Quote: "11.5 Practical problems involving quadratic equations"

My reading: Bird has "practical problems involving quadratic equations" as its own section, and HELM has Quadratic Functions and
Modelling (2.3) and Projectiles (7.2). Both are the textbooks an HNC student is likely to be pointed to.

---

## 8. Size: how many lessons the benchmarks spend, and what Dan's six to eight lessons can carry

- **Khan Algebra 1 Unit 14 has 31 skills**
  - Source: Quadratic functions & equations | Algebra 1 | Math | Khan Academy. https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:quadratic-functions-equations
  - Quote: "Unit 14: Quadratic functions & equations 31 skills"
- **Khan Algebra basics Unit 7 has 14 skills**
  - Source: Quadratics and polynomials | Algebra basics | Math | Khan Academy. https://www.khanacademy.org/math/algebra-basics/quadratics-polynomials-topic
  - Quote: "Unit 7: Quadratics and polynomials 14 skills"
- **Khan Algebra 2 has 113 skills**
  - Source: Algebra 2 | Math | Khan Academy. https://www.khanacademy.org/math/algebra2
  - Quote: "113 skills Mastered Proficient Familiar Attempted Not started Quiz Unit test"
- **Khan Algebra 2 polynomial division unit has 8 skills**
  - Source: Polynomial division | Algebra 2 | Math | Khan Academy. https://en.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:poly-div
  - Quote: "Unit 4: Polynomial division 8 skills"
- **Khan Algebra 1 (IM-aligned) quadratic equations unit has 34 skills**
  - Source: Quadratic equations | Algebra 1 (IM® v.360 aligned) | Math | Khan Academy. https://www.khanacademy.org/math/algebra-1-illustrative-math/x6418b49dfbc9d0c9:quadratic-equations-part1
  - Quote: "Unit 8: Quadratic equations 34 skills"
- **Khan OD Class 10 quadratic equations unit has 14 skills**
  - Source: Quadratic equations | OD Math Class 10 (Algebra) | Khan Academy. https://www.khanacademy.org/math/class-10-algebra-od/xdf6c731a6bbb91d2:quadratic-equations
  - Quote: "Unit 2: Quadratic equations 14 skills"
- **HELM page counts: Workbooks 1 to 3**
  - Source: HELM Workbook 49 Student's Guide - Loughborough University. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2049%20Student's%20Guide.pdf
  - Quote: "No. Title Pages 1 Basic Algebra 89 2 Basic Functions 75 3 Equations, Inequalities & Partial Fractions 71"
- **Bird Basic Engineering Mathematics: Solving quadratic equations is 10 pages**
  - Source: Basic Engineering Mathematics | John Bird | Taylor & Francis eBooks, R. https://www.taylorfrancis.com/books/mono/10.4324/9781315561776/basic-engineering-mathematics-john-bird
  - Quote: "chapter 14 | 10 pages Solving quadratic equations"
- **Bird Basic Engineering Mathematics: Further algebra is 6 pages**
  - Source: Basic Engineering Mathematics | John Bird | Taylor & Francis eBooks, R. https://www.taylorfrancis.com/books/mono/10.4324/9781315561776/basic-engineering-mathematics-john-bird
  - Quote: "chapter 10 | 6 pages Further algebra"
- **Bird Higher Engineering Mathematics 7th ed: Partial fractions is 7 pages**
  - Source: Higher Engineering Mathematics, 7th ed | John Bird | Taylor & Francis. https://www.taylorfrancis.com/books/mono/10.4324/9781315858821/higher-engineering-mathematics-7th-ed-john-bird
  - Quote: "chapter 2 | 7 pages Partial fractions"

Brilliant spends 80 lessons on Quadratics and 52 on Polynomials (1.1, 1.2).

My reading: Brilliant spends 132 lessons (80 and 52); Khan's Algebra 1 quadratic units are 31, 34 or 14 skills depending on
which version, and Algebra 2 has four more units on polynomials; HELM spends part of a 71-page workbook; Bird spends 10 pages on
quadratics and 6 on polynomial division and the theorems (so the HNC-level books spend far less than Brilliant). The SQA
maths unit is 40 hours for functions, logs, vectors and complex numbers, with quadratics as entry knowledge.

The core that six to eight lessons can carry, from sections 3 and 4 (my proposal for the brief, in order):
1. **Two brackets as an area** (expanding, the squares and the difference of two squares).
2. **Factorising quadratics** (a = 1 first, then a ≠ 1 and the common factor).
3. **Solving by factorising**, and by square roots (the zero product and the two answers).
4. **Completing the square and the turning point.**
5. **The formula and the discriminant** (derived by completing the square; no, one or two roots).
6. **The parabola from its rule** (roots, vertex, y-intercept, sketch) and a line meeting a curve.
7. **Quadratics at work** (P = I²R and maximum power, projectile, beam).
8. **Polynomials of higher degree** (factor theorem, long division, roots and multiplicity), light, and pointing to partial
   fractions, exponentials and complex roots.

Six lessons would join 1 with 2 and 6 with 7, and drop 8 to a screen; eight is the full list. Eight matches the sizing of the
sibling courses in the folder (Functions and their graphs has eight lessons; Powers and roots seven).

---

## 9. What I could not confirm
- **Which college.** SQA and Pearson are both read; Dan's actual course is unknown.
- **Inside Brilliant's lessons.** The pages list titles only (1.1).
- **Khan Algebra 1 Unit 13's skill list** (the page did not render its skills) (2.1).
- **HELM Workbook 3's own section text.** The PDF links returned a 404 or an error (2.3).
- **Whether the current SQA Mathematics for Engineering 1 units, or Pearson's full Unit 4002 descriptor, name quadratic
  equations or polynomial division** (3.2, 3.3).
- **Whether the full set of MCA papers names completing the square or the discriminant.** I read the Second Engineer
  mathematics syllabus and General Engineering Science I (3.4).
- **Marine HNC classroom use** of the pump, propeller and beam examples (7.3, 7.4).
- **How far the misconception studies, mostly of school students abroad, carry over to an adult learner** (6.8).

