# Linear equations: research notes

Researched 13 Oct 2026 for the Linear equations course brief (the first course in the Maths shelf's Algebra
folder; blurb "Expressions with an unknown, and the moves that solve them", from "Brilliant: Linear Equations").
The brief itself is not written here; these notes are its evidence. Dan is an electrician preparing for marine
engineering college (HNC/HND route), and he already has Solving equations (six lessons, no brackets) behind him.

Every finding has its source title, URL and the exact words, copied from a saved tool result by script (the
quotes were not retyped into this file). All of them are listed in `quotes.json` beside this file and were
checked with `node tools/eval/sources.mjs --quotes ... --tools ...` (`failed: 0`). The tool files are in `tools/`.
Findings I could not confirm are marked **UNCONFIRMED**; where only a non-original site said it, **SECONDARY**.
My own readings are marked "My reading" and are not quotes. Mirror and copy sites were avoided; hosts that republish an original text (LibreTexts, Lumen, academia.edu) are marked SECONDARY where used.

---

## 1. Benchmark: Brilliant's Linear Equations

### 1.1 The course itself
Brilliant's page for the course is `brilliant.org/courses/linear-expressions-and-equations/` (the shorter
`/courses/linear-equations/` address does not show the course; `/courses/` links to the long one).
The course is **68 lessons in 13 levels**, so it is far bigger than the six lessons planned for Dan. The levels,
in order:
1. Linear Expressions. 2. Solving Equations. 3. Solving Inequalities. 4. Combining Terms. 5. Negative Values.
6. Solving with Negatives. 7. Solving Inequalities with Negatives. 8. Distributing. 9. Factoring.
10. Equations with No or Many Solutions. 11. Working with Fractions. 12. Working with Decimals (it is percentages
and discounts). 13. Compound Inequalities.

- **Brilliant's Linear Equations is 68 lessons and 1201 exercises**
  - Source: Practice Linear Equations | Brilliant. https://brilliant.org/courses/linear-expressions-and-equations/
  - Quote: "Build a solid foundation in algebra through hands-on exploration of expressions and equations. 68 Lessons 1201 Exercises"
- **Levels 1 to 4: expressions, solving, inequalities, combining terms**
  - Source: Practice Linear Equations | Brilliant. https://brilliant.org/courses/linear-expressions-and-equations/
  - Quote: "Level 1 Linear Expressions Variables Finding Unknown Values Combining and Coefficients Writing Expressions Real World Expressions Level Check Level 2 Solving Equations Dividing to Solve Solving in Two Steps Equation Solving Moves Dividing First Multiple Steps Setting up Equations Level Check Level 3 Solving Inequalities Solutions to Inequalities Graphing Solutions Reading Inequalities Finding the Boundary Solving Inequalities Solving and Interpreting Level 4 Combining Terms Combining Terms Combining to Solve Variables on Both Sides Solving Equations Comparing Expressions"
- **Levels 5 to 7: negatives, and inequalities with negatives (dividing by a negative)**
  - Source: Practice Linear Equations | Brilliant. https://brilliant.org/courses/linear-expressions-and-equations/
  - Quote: "Level 5 Negative Values Negative Values Missing Values and Negatives Negative Constants Negative Coefficients More Missing Values Level 6 Solving with Negatives Negative Solutions Subtraction and Negative Coefficients Rewriting -x Combining Negatives Negatives in Context Level 7 Solving Inequalities with Negatives Testing Values in Inequalities Dividing by a Negative Value Graphing Solutions Solving Inequalities Inequalities in Context"
- **Levels 8 and 9: distributing and factoring**
  - Source: Practice Linear Equations | Brilliant. https://brilliant.org/courses/linear-expressions-and-equations/
  - Quote: "Level 8 Distributing Multiples Distributing Distributing with Negatives Distributing to Solve Distribute or Divide More Distributing to Solve Combining Groups Applied Distributing Level 9 Factoring Factoring Constants Factoring and Distributing Greatest Common Factor Factoring to Solve"
- **Levels 10 to 13: no or many solutions, fractions, percentages, compound inequalities**
  - Source: Practice Linear Equations | Brilliant. https://brilliant.org/courses/linear-expressions-and-equations/
  - Quote: "Level 10 Equations with No or Many Solutions No Solutions Many Solutions Identifying Solutions Counting Solutions Level 11 Working with Fractions Reciprocals Same Denominator Different Denominators Eliminating Denominators Fractions Outside and Inside Level 12 Working with Decimals Adding Percentages Subtracting Percentages Two Discounts Comparing Deals Level 13 Compound Inequalities Multiple Inequalities Writing Compound Inequalities Either Inequality Combining Graphs Solving Compound Inequalities Applied Compound Inequalities"
- **Brilliant's description: algebra tiles and invoices, like terms, then steps**
  - Source: Practice Linear Equations | Brilliant. https://brilliant.org/courses/linear-expressions-and-equations/
  - Quote: "Continue your algebra journey with a visual, intuitive approach to expressions and equations. Using interactive diagrams like algebra tiles and invoices, you'll represent situations with variables and equations. This course starts with the basics: understanding what a variable represents, evaluating expressions, and combining like terms."
- **Brilliant's outcome line**
  - Source: Practice Linear Equations | Brilliant. https://brilliant.org/courses/linear-expressions-and-equations/
  - Quote: "By the end of this course, you'll be able to translate real-world situations into algebraic expressions, solve linear equations confidently, and understand the reasoning behind each step—setting you up for success in more advanced algebra."
- **Brilliant's topics covered**
  - Source: Practice Linear Equations | Brilliant. https://brilliant.org/courses/linear-expressions-and-equations/
  - Quote: "Topics covered * Variables * Evaluating Expressions * Combining Like Terms * Writing Expressions * Solving Linear Equations * Inverse Operations * Negative Constants and Coefficients"

My reading of the order: expressions and like terms first (levels 1, 4), then one-step and multi-step
solving (2), inequalities straight after the basic solving moves (3), then negatives as a theme of their own
(5, 6, 7, including the inequality flip), brackets late (8: distributing, 9: factoring), then the special
cases (10), fractions (11), percentages (12) and compound inequalities (13). It starts with algebra tiles and
invoices and ends on "the reasoning behind each step". The page gives only titles, so the pictures inside each
lesson are **UNCONFIRMED** (I did not see a lesson).

### 1.2 Where it sits in Brilliant's path
- **Brilliant's path: Math Foundations ends with Proportional Reasoning, then Algebra Fundamentals starts with Linear Equations, then Coordinate Geometry and Linear Relationships**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "GR 6–7 Percents Percents GR 6–7 Proportional Reasoning Proportional Reasoning GRADES 7–9 Algebra Fundamentals Build algebra tools for success in middle grades and beyond Build algebra tools for success in middle grades and beyond GR 7–8 Linear Equations Linear Equations GR 7–8 Coordinate Geometry Coordinate Geometry GR 8–9 Linear Relationships Linear Relationships GR 8 Exponents and Radicals Exponents and Radicals GR 8–9 Visual Algebra"
- **Brilliant's Intermediate Algebra band, where Linear Systems (simultaneous equations) sits after Introduction to Functions**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "GRADES 8–11 Intermediate Algebra Understand core ideas to crush early high school courses like Algebra 1 or Integrated Math 1 and 2 Understand core ideas to crush early high school courses like Algebra 1 or Integrated Math 1 and 2 GR 8–9 Introduction to Functions Introduction to Functions New GR 8–9 Linear Systems"
- **Brilliant's Linear Systems course (the simultaneous equations course) is a separate course**
  - Source: Practice Linear Systems | Brilliant. https://brilliant.org/courses/linear-systems/
  - Quote: "Systems Solve systems of equations and inequalities using graphs and algebra. 31 Lessons 563 Exercises Level 1 Systems of Equations Two Constraints Graph of a System"

- Before it: Math Foundations, which ends Percents, then Proportional Reasoning. In Dan's app those map to
  Percentages and Proportional reasoning, and Solving equations (Brilliant's "Solving Equations", grades 5 to 6)
  and Negative Numbers sit earlier in the same band (the Percentages notes quote that listing).
- After it: Coordinate Geometry, Linear Relationships, Exponents and Radicals, Visual Algebra; then Introduction
  to Functions and Linear Systems in the next band. This matches the order of the Algebra folder in
  `docs/shelves-maths.json` (Linear equations, Coordinate geometry, Linear relationships, ..., Linear systems).
- Brilliant's own earlier **Solving Equations** course already teaches Distributing, Factoring and
  Combining Like Terms (levels 3 to 5):
- **Brilliant's own earlier course, Solving Equations, already has Distributing, Factoring and Combining Like Terms levels (68 lessons)**
  - Source: Practice Solving Equations | Brilliant. https://brilliant.org/courses/pre-algebra/variables?lesson=using-variables-2-ss-exp
  - Quote: "68 Lessons 1159 Exercises Level 1 Introduction Finding Unknowns Equations with Unknowns Building Expressions Working with Unknowns Level Check Level 2 Solving by Substitution Finding Solutions Solving Multiple Equations Rewriting Equations Isolating Unknowns Solving an Equation Substitution Level Check Level 3 Distributing Groups in Equations Working with Groups Solving with Groups Unpacking Boxes Distributing Level 4 Factoring Packing Boxes Factoring Strategic Moves Level 5 Combining and Rearranging Combining Like Terms Combining in Equations Rearranging Terms Rearranging Terms in Equations Combining and Solving Grouping to Solve"
  My reading: Brilliant's Solving Equations is bigger than Dan's. Dan's has no brackets, factoring or like
  terms (brackets were left on purpose), so Linear equations has to carry that ground.

---

## 2. Other courses' order for the same ground

### 2.1 Khan Academy, Algebra basics
- **Khan's unit order: Foundations, Algebraic expressions, Linear equations and inequalities, then Graphing lines and slope, then Systems of equations**
  - Source: Algebra Basics | Khan Academy. https://www.khanacademy.org/math/algebra-basics
  - Quote: "Algebra basics 8 units Unit 1 Foundations Unit 2 Algebraic expressions Unit 3 Linear equations and inequalities Unit 4 Graphing lines and slope Unit 5 Systems of equations"
- **Khan Algebra basics: unit 2 algebraic expressions in order (evaluate, write, like terms, distributive property, factor)**
  - Source: Algebra Basics | Khan Academy. https://www.khanacademy.org/math/algebra-basics
  - Quote: "Unit 2 Unit 2: Algebraic expressions 42. Evaluating expressions with one variable 43. Evaluating expressions with multiple variables 44. Writing basic expressions with variables 45. Writing expressions with variables 46. Algebraic expressions: Quiz 1 47. Combining like terms with negative coefficients 48. Combining like terms with negative coefficients & distribution 49. Combining like terms with rational coefficients 50. Distributive property with variables 51. Factor with distributive property (variables) 52. Equivalent expressions"
- **Khan Algebra basics: unit 3 linear equations and inequalities in order (one-step, two-step, both sides, parentheses, then inequalities)**
  - Source: Algebra Basics | Khan Academy. https://www.khanacademy.org/math/algebra-basics
  - Quote: "Unit 3 Unit 3: Linear equations and inequalities 57. One-step addition & subtraction equations 58. One-step multiplication & division equations 59. Two-step equations 60. Two-step equations word problems 61. Equations with variables on both sides 62. Equations with parentheses 63. Linear equations and inequalities: Quiz 1 64. One-step inequalities 65. Two-step inequalities 66. Two-step inequality word problems 67. Multi-step linear inequalities"
- **Order, in short:** evaluate and write expressions -> combine like terms (negative, then rational
  coefficients) -> distributive property -> factor with it -> equivalent expressions -> then equations:
  one-step, two-step, word problems, variables on both sides, parentheses -> then inequalities (one-step,
  two-step, word problems, multi-step) -> proportions. Graphs are the next unit, not part of this one.

### 2.2 Khan Academy, Algebra 1
- **Khan Algebra 1 unit 2: variables on both sides, parentheses, number of solutions, inequalities**
  - Source: Solving equations & inequalities | Algebra 1 | Math | Khan Academy. https://en.khanacademy.org/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities
  - Quote: "Unit 2: Solving equations & inequalities 11 skills Mastered Proficient Familiar Attempted Not started Quiz Unit test 1. Equations with variables on both sides 2. Equations with variables on both sides: decimals & fractions 3. Equations with parentheses 4. Equations with parentheses: decimals & fractions 5. Reasoning with linear equations 6. Solving equations & inequalities: Quiz 1 7. Number of solutions to equations"
- **Khan Algebra 1 unit 2 continues with literal equations and inequalities (multi-step, problems, compound)**
  - Source: Solving equations & inequalities | Algebra 1 | Math | Khan Academy. https://en.khanacademy.org/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities
  - Quote: "9. Linear equations with unknown coefficients 10. Solving equations & inequalities: Quiz 2 11. Multi-step linear inequalities 12. Using inequalities to solve problems 13. Compound inequalities"
- **Order, in short:** both sides, then parentheses, then number of solutions, then unknown coefficients (a
  literal-equation step), then inequalities and compound inequalities. The Algebra 1 unit starts at variables on
  both sides, so it assumes one- and two-step equations are done.

### 2.3 BBC Bitesize
- **Bitesize KS3 Expressions and formulae, first half: introduction, functions, collecting like terms, simplifying terms, multiplying brackets**
  - Source: Expressions and formulae - KS3 Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/topics/z9yb4wx
  - Quote: "Expressions and formulae + Introduction to algebra Learn how to recognise and interpret algebraic notation with this BBC Bitesize Maths article. For students between the ages of 11 and 14. + Functions Learn how to find both the inputs and outputs of function machines with this BBC Bitesize Maths article. For students between the ages of 11 and 14. + Collecting like terms Learn what like and unlike terms are and simplify algebraic expressions by collecting like terms with this BBC Bitesize Maths article. For students between the ages or 11 and 14. + Simplifying terms by multiplying and dividing Learn how to simplify terms involving multiplication and division with this BBC Bitesize Maths article. For students between the ages of 11 and 14. + Multiplying brackets Learn how to simplify and expand brackets with this BBC Bitesize Maths article."
- **Bitesize KS3 Expressions and formulae, continued: taking out common factors, writing formulae, changing the subject**
  - Source: Expressions and formulae - KS3 Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/topics/z9yb4wx
  - Quote: "+ Rewrite expressions by taking out common factors Learn how to rewrite expressions by taking out common factors with this BBC Bitesize Maths article. For students between the ages of 11 and 14. + Write and construct formulae Learn how to write and construct formulae with this BBC Bitesize Maths article. For students between the ages of 11 and 14. + Changing the subject of a formula"
- **Bitesize GCSE Algebra opens with collecting like terms and a single term over a bracket**
  - Source: Algebra - GCSE Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/topics/zq4j39q
  - Quote: "NEW: How to simplify expressions and expand brackets Revise collecting like terms, using algebraic notation correctly, simplifying expressions, and multiplying a single term over a bracket. With video, quizzes and a game."
- **Bitesize GCSE Algebra has two linear-equation guides: one- and two-step first, then 'more complex' with brackets, x terms on both sides and fractions**
  - Source: Algebra - GCSE Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/topics/zq4j39q
  - Quote: "NEW: Solving one- and two-step linear equations Learn how to use inverse operations to find the value of an unknown variable in an equation, so that the value is true. This guide contains practice questions, a quiz and a game. + NEW: Solving more complex linear equations Learn how to solve equations with brackets, 𝑥 terms on both sides, and fractions using inverse operations in this GCSE maths study guide. This guide contains videos and quizzes. + Quiz: Solving linear equations"
- **Bitesize GCSE Inequalities guide: the five symbols (graphs of inequalities are a separate Higher guide)**
  - Source: Algebra - GCSE Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/topics/zq4j39q
  - Quote: "NEW: Inequalities Inequalities are the relationships between two expressions not equal to one another. The symbols used for inequalities are <, >, ≤, ≥ and ≠. This guide contains video and quizzes."
- **Bitesize KS3: with brackets, the first step is to expand; the negative case needs care**
  - Source: Solve equations with brackets - KS3 Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z7wkjfr
  - Quote: "Some equations include a set of brackets. When solving equations with brackets the first step is to expand the brackets."
- **Bitesize KS3: negative coefficient case, expand taking care with negatives, make the x coefficient positive**
  - Source: Solve equations with brackets - KS3 Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z7wkjfr
  - Quote: "Solving equations where the coefficient of 𝒙 is negative 1. The first step is to expand the brackets, taking care where negatives are involved. 2. Manipulate the equation so that the coefficient of the unknown term is positive."
- **Bitesize KS3: expanding does not change the value**
  - Source: Solve equations with brackets - KS3 Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z7wkjfr
  - Quote: "Expanding brackets does not change the value of an expression . It is two ways of writing the same expression."
- **Bitesize KS3: check the answer by substituting**
  - Source: Solve equations with brackets - KS3 Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z7wkjfr
  - Quote: "It is important to check the answer. The original equation stated that 3(𝒙 + 5) = 18. Substitute the value of 1 in place of the 𝒙 term."
- **Bitesize KS3 inequalities: solve by inverse operations, last operation first, same on both sides**
  - Source: Inequalities - KS3 Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zbn8qyc
  - Quote: "Solving simple linear inequalities 1. Undo each process in the inequality by using the inverse operation. Inverse operations include addition and subtraction, and multiplication and division. 2. Start with the last operation and work back to the first. 3. For each step make sure that the inverse is applied to both sides of the inequality."
- **Bitesize KS3 inequalities: open and closed circles on a number line**
  - Source: Inequalities - KS3 Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zbn8qyc
  - Quote: "The circle is unshaded for < and > The circle is shaded for ≤ and ≥"
- **Bitesize KS3 inequalities: an inequality can have many solutions, unlike an equation**
  - Source: Inequalities - KS3 Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zbn8qyc
  - Quote: "The two sides in an equation are equal. This is not the case in an inequality, as one side may be greater than (or less than) the other."
- **Order, in short:** like terms -> brackets (expand, then factorise) -> formulae -> one- and two-step
  equations -> complex equations (brackets, x on both sides, fractions) -> inequalities, with graphs of
  inequalities only at Higher tier.
- The step-by-step page for the page-by-page order inside the GCSE equations guides was not read in full:
  **UNCONFIRMED** beyond the topic listing above.

### 2.4 Oak National Academy
- **Oak Y7 Expressions and equations: like terms, collecting, multiplying an expression by a constant and by a term**
  - Source: Expressions and equations KS3 | Y7 Maths | Lesson Resources | Oak National Academy. https://www.thenational.academy/teachers/programmes/maths-secondary-ks3/units/expressions-and-equations/lessons
  - Quote: "9 #### Like terms I can identify like terms in an expression, generalising an understanding of unitising (equality). 10. 10 #### Simplifying by collecting like terms I can simplify expressions by collecting like terms. 11. 11 #### Multiplying an expression by a constant I can use the distributive law to multiply an expression by a constant. 12. 12 #### Multiplying an expression by a term I can use the distributive law to multiply an expression by a term."
- **Oak Y7 lesson 15: highest common factor of algebraic terms**
  - Source: Expressions and equations KS3 | Y7 Maths | Lesson Resources | Oak National Academy. https://www.thenational.academy/teachers/programmes/maths-secondary-ks3/units/expressions-and-equations/lessons
  - Quote: "15 #### Highest common factor with algebraic terms I can identify the highest common factor of two (or more) algebraic terms."
- **Oak Y7 lesson 16: factorising with a common factor, by the distributive law**
  - Source: Expressions and equations KS3 | Y7 Maths | Lesson Resources | Oak National Academy. https://www.thenational.academy/teachers/programmes/maths-secondary-ks3/units/expressions-and-equations/lessons
  - Quote: "Factorising expressions I can use the distributive law to factorise expressions where there is a common factor"
- **Oak Y7 lesson 6: a letter as a specific unknown or as a variable, and knowing the difference**
  - Source: Expressions and equations KS3 | Y7 Maths | Lesson Resources | Oak National Academy. https://www.thenational.academy/teachers/programmes/maths-secondary-ks3/units/expressions-and-equations/lessons
  - Quote: "I can recognise that a letter can be used to represent a specific unknown or a variable and know the difference."
- **Oak Y7: the unit 'why this why now' names factorisation and multiplication of brackets as algebraic manipulation**
  - Source: Expressions and equations KS3 | Y7 Maths | Lesson Resources | Oak National Academy. https://www.thenational.academy/teachers/programmes/maths-secondary-ks3/units/expressions-and-equations/lessons
  - Quote: "pulling in key skills such as factorisation and multiplication of brackets as part of algebraic manipulation"
- **Oak Y8 Solving linear equations (17 lessons): prior knowledge is simplifying expressions and one- and two-step equations**
  - Source: Solving linear equations KS3 | Y8 Maths | Lesson Resources | Oak National Academy. https://www.thenational.academy/teachers/programmes/maths-secondary-ks3/units/solving-linear-equations/lessons
  - Quote: "Prior knowledge requirements * Understand and apply inverse operations * Simplify algebraic expressions * Solve one-step and two-step equations Unit 4 of10 Solving linear equations Learn how you can make the best use of Oak resources A step-by-step guide to getting started Get more out of Oak 17 lessons in unit"
- **Oak Y8 lesson 9: collecting like terms on each side before solving**
  - Source: Solving linear equations KS3 | Y8 Maths | Lesson Resources | Oak National Academy. https://www.thenational.academy/teachers/programmes/maths-secondary-ks3/units/solving-linear-equations/lessons
  - Quote: "9 #### Preparing to solve two step linear equations I can understand that an equation needs to be in a format to be ready to be solved, through collecting like terms on each side of the equation."
- **Oak Y8: lesson 11, unknowns on both sides**
  - Source: Solving linear equations KS3 | Y8 Maths | Lesson Resources | Oak National Academy. https://www.thenational.academy/teachers/programmes/maths-secondary-ks3/units/solving-linear-equations/lessons
  - Quote: "11 #### Rearranging to solve linear equations I can recognise that equations with unknowns on both sides of the equation can be manipulated so that the unknowns are on one side and then solve this equation."
- **Oak Y8 Solving linear equations lesson 12 names reciprocals and 'complex' equations**
  - Source: Solving linear equations KS3 | Y8 Maths | Lesson Resources | Oak National Academy. https://www.thenational.academy/teachers/programmes/maths-secondary-ks3/units/solving-linear-equations/lessons
  - Quote: "12 #### Solving complex linear equations I can solve complex linear equations, including those involving reciprocals."
- **Oak Y8 lesson 13: brackets in equations**
  - Source: Solving linear equations KS3 | Y8 Maths | Lesson Resources | Oak National Academy. https://www.thenational.academy/teachers/programmes/maths-secondary-ks3/units/solving-linear-equations/lessons
  - Quote: "Brackets in equations I can appreciate the significance of the bracket in an equation."
- **Oak Y8 lesson 14: more than one way to remove a bracket**
  - Source: Solving linear equations KS3 | Y8 Maths | Lesson Resources | Oak National Academy. https://www.thenational.academy/teachers/programmes/maths-secondary-ks3/units/solving-linear-equations/lessons
  - Quote: "Solving linear equations where brackets are used I can recognise that there is more than one way to remove a bracket when solving an equation."
- **Oak Y8 lesson 15: brackets where simplification is needed first**
  - Source: Solving linear equations KS3 | Y8 Maths | Lesson Resources | Oak National Academy. https://www.thenational.academy/teachers/programmes/maths-secondary-ks3/units/solving-linear-equations/lessons
  - Quote: "Solving complex linear equations involving brackets I can solve equations involving brackets where simplification is necessary first."
- **Oak Y8 lesson 16: solving linear equations graphically with technology**
  - Source: Solving linear equations KS3 | Y8 Maths | Lesson Resources | Oak National Academy. https://www.thenational.academy/teachers/programmes/maths-secondary-ks3/units/solving-linear-equations/lessons
  - Quote: "Solving linear equations graphically using technology I can explore how to solve linear equations graphically via dynamic software."
- **Oak Y8 lesson 17: problem solving**
  - Source: Solving linear equations KS3 | Y8 Maths | Lesson Resources | Oak National Academy. https://www.thenational.academy/teachers/programmes/maths-secondary-ks3/units/solving-linear-equations/lessons
  - Quote: "Problem solving with linear equations I can use my knowledge of solving linear equations to solve problems."
- **Oak Y8: the graphs-of-linear-equations unit comes just before Solving linear equations**
  - Source: Solving linear equations KS3 | Y8 Maths | Lesson Resources | Oak National Academy. https://www.thenational.academy/teachers/programmes/maths-secondary-ks3/units/solving-linear-equations/lessons
  - Quote: "3 Graphical representations of linear equations Previousunit"
- **Oak Y11 Higher: Inequalities is a 14-lesson unit of its own, late in KS4**
  - Source: Free GCSE KS4 Maths Higher Lesson & Curriculum Resources | Oak National Academy. https://www.thenational.academy/teachers/programmes/maths-secondary/units?keystages=ks4&tiers=higher
  - Quote: "12. 12 #### Inequalities 14 lessons"
- **Order, in short:** Year 7 expressions (notation, terms, like terms, collecting, distributive law with a
  constant then a term, highest common factor, factorising; 17 lessons) -> Year 8 graphs of linear equations
  (15 lessons) -> Year 8 solving (17 lessons: balance, one-step, collect like terms, two-step, both sides,
  complex, then three lessons on brackets, a graphical check, problem solving) -> Year 11 Higher inequalities
  (14 lessons). In Oak's Higher units list inequalities come last of all.

### 2.5 NCETM (fifth benchmark; I could not reach Math Academy or CIMT course lists, see section 7)
- **NCETM KS3 key idea 2.2.3: two or more steps (no brackets), ready to solve after collecting like terms**
  - Source: Mastery materials writing frame (NCETM 2.2 Solving linear equations). https://www.ncetm.org.uk/media/wbylane0/ncetm_ks3_cc_2_2.pdf
  - Quote: "2.2.3 Solve a linear equation with a single unknown where obtaining the solution requires two or more steps (no brackets) 2.2.3.1 Understand that an equation needs to be in a format to be 'ready' to be solved, through collecting like terms on each side of the equation"
- **NCETM key ideas 2.2.4.2 and 2.2.4.3: more than one way to remove a bracket; simplification first**
  - Source: Mastery materials writing frame (NCETM 2.2 Solving linear equations). https://www.ncetm.org.uk/media/wbylane0/ncetm_ks3_cc_2_2.pdf
  - Quote: "2.2.4.2 Recognise that there is more than one way to remove a bracket when solving an equation 2.2.4.3 Solve equations involving brackets where simplification is necessary first"
- **NCETM: with brackets, notice the structure; 3(x - 2) = 27 can go straight to x - 2 = 9**
  - Source: 2.2 Solving linear equations (NCETM mastery PD). https://www.ncetm.org.uk/media/wbylane0/ncetm_ks3_cc_2_2.pdf
  - Quote: "By considering a range of linear equations involving brackets, students should explore the importance of noticing the structure of an equation in order to decide on the most efficient method for solving it."
- **NCETM key ideas 1.4.2 and 1.4.3: collect like terms, then the distributive law, to keep equivalence**
  - Source: Mastery materials writing frame (NCETM 2.2 Solving linear equations). https://www.ncetm.org.uk/media/wbylane0/ncetm_ks3_cc_2_2.pdf
  - Quote: "1.4.2 Simplify algebraic expressions by collecting like terms to maintain equivalence 1.4.3 Manipulate algebraic expressions using the distributive law to maintain equivalence"
- **NCETM 1.4.3: factorising is the reverse of expanding brackets**
  - Source: Core concept 1.4: Simplifying and manipulating expressions, equations and formulae. https://www.ncetm.org.uk/media/bdddodxr/secmm-cc-audit-1-4-simplifying-and-manipulating-expressions-equations-and-formulae.pdf
  - Quote: "Factorising is the reverse process to expanding brackets."
- **NCETM: an equation is a statement that two expressions have equal value**
  - Source: Core concept 1.4: Simplifying and manipulating expressions, equations and formulae. https://www.ncetm.org.uk/media/bdddodxr/secmm-cc-audit-1-4-simplifying-and-manipulating-expressions-equations-and-formulae.pdf
  - Quote: "An equation is a mathematical statement showing that two expressions have equal value."
- **NCETM KS4 core concept 9.1 is where inequalities and simultaneous equations are explored with graphs**
  - Source: 9.1 Exploring linear equations and inequalities | NCETM. https://www.ncetm.org.uk/classroom-resources/secmm-91-exploring-linear-equations-and-inequalities
  - Quote: "Core concept 9.1 uses both graphical and algebraic representations to deepen students' understanding of linear functions, including inequalities and simultaneous equations"
- **Order, in short:** NCETM splits it the same way as Oak: expressions first (1.4), equations later (2.2:
  one step, two or more steps without brackets, brackets, unknowns on both sides). Inequalities and
  simultaneous equations are a KS4 block (9.1).

### 2.6 What is common (consensus across the five)
My reading, not a quote:
1. Like terms, then the distributive law (expand), then factorise: all five put expressions before equations
   (Brilliant puts levels 1 and 4 before and around the early solving).
2. Equations: one step, two steps, unknown on both sides, then brackets (Khan, Oak, NCETM, Bitesize agree).
   Brilliant interleaves brackets late, after negatives.
3. Inequalities come right after the solving moves in Brilliant and Khan, but last in Oak (Year 11) and late in
   Bitesize GCSE. All of them teach the flip when multiplying by a negative.
4. Fractions inside equations appear in Brilliant (level 11), Khan ("decimals & fractions"), Bitesize, and Oak
   (reciprocals).
5. Graphs and simultaneous equations belong to other courses or units in every benchmark.

---

## 3. The edge with what Dan already has

### 3.1 What Dan has (from the repo, not quotes)
- **Solving equations (`docs/courses/maths/solving-equations/brief.md`), six lessons:** the balance, undo in
  reverse, unknowns on both sides, using formulas, rearranging formulas, rearranging harder formulas. The brief
  says brackets were left for Linear equations, along with inequalities and simultaneous equations. Lesson 4
  already includes writing an equation from a situation (the MCA's "Form linear equations consistent with data
  provided").
- **Negative numbers (`docs/courses/maths/negative-numbers/brief.md`), nine lessons:** lesson 8 is order of
  operations, including "the effect of plus or minus signs in front of a bracketed quantity" (brackets on
  numbers, not letters); lessons 3 to 7 cover signs in all four operations.
- **The coordinate plane (`docs/courses/maths/the-coordinate-plane/brief.md`), six lessons:** points, four
  quadrants, scales, table to graph, reading a graph, and straight lines through zero (informal steepness only).
  Gradient as a number, y = mx + c and equations of lines are left for Linear relationships and Coordinate geometry.
- **Percentages:** covers adding and subtracting a percentage, which is Brilliant's level 12 ground.

### 3.2 What Linear equations adds beyond Solving equations
My reading, matched to the benchmarks above (the evidence lines are in sections 1 and 2):
1. **Expressions and like terms** (Brilliant L1 and L4; Khan unit 2; Oak Y7 9 and 10; Bitesize; NCETM 1.4.2):
   collect 3x + 2x, spot what is and is not "like", and see that collecting is unitising, not fruit salad.
   Dan's course never collects like terms on one side; it only moves an unknown across.
2. **Brackets, both ways:** expand with a number, with a term, and with a negative (Brilliant L8; Oak Y7 11 to
   14; Khan unit 2; NCETM 1.4.3; MCA 2.1.4 and 2.1.10), factorise by taking out a common factor (Brilliant L9;
   Oak Y7 15 and 16; Bitesize; MCA 2.1.16), then **equations with brackets** (Khan unit 3; Oak Y8 13 to 15;
   NCETM 2.2.4), including the choice between expanding first and dividing first.
3. **Inequalities**, solved with the same undo moves, graphed on a number line, with the flip when multiplying
   or dividing by a negative (Brilliant L3, L7; Khan; Bitesize; Oak). Only the single-variable case; compound
   inequalities (Brilliant L13) look like a stretch.
4. **Forming expressions and equations from words** (Brilliant "Writing Expressions", "Real World Expressions",
   "Setting up Equations"; Khan word problems; Oak Y8 17; MCA 2.1.27; GES I 1.3). Dan's Solving equations lesson
   4 starts this, so here it should grow to two-part situations with brackets, not repeat it.
5. **Equations with fractions** (Brilliant L11; Khan "decimals & fractions"; Bitesize; Oak lesson 12) and **no
   solution or infinitely many** (Brilliant L10; Khan; NCETM's 4x + 6 = 4x). Both are optional in six lessons.
6. **Negative coefficients inside expressions** (Brilliant L5 and L6: negative constants and coefficients,
   subtraction and negative coefficients, rewriting -x). Dan has signs from Negative numbers, but not -x as
   (-1) times x, or a bracket with a minus in front of it that has letters in it.
7. **Rearranging a formula that has a bracket** (e.g. make x the subject of y = 3(x + 7), or R = R0(1 + alpha dT)
   for dT). Dan's lessons 5 and 6 rearrange formulas without brackets, so this joins the two skills.

Not new, so left out: the balance and undo-in-reverse (Dan's lessons 1 and 2), unknowns on both sides (3),
formulas (4 to 6), signs and order of operations (Negative numbers), percentage changes (Percentages).

### 3.3 Graphs of linear equations
Brilliant's Linear Equations has no graph levels: its "Graphing Solutions" levels draw the solution of an
inequality on a number line. The graphs and slope work lives in Brilliant's Coordinate Geometry and Linear
Relationships courses.
- **Brilliant keeps the graph-based material in other courses: Coordinate Geometry and Linear Relationships have the graphs and point-slope work**
  - Source: Practice Linear Relationships | Brilliant. https://brilliant.org/courses/linear-functions
  - Quote: "Level 6 Writing Equations of Lines Shifting a Line Slope of a Line Through a Point Through Two Points Point-Slope Form Using Point-Slope Form Equations in Point-Slope Form"
- **Khan Algebra basics puts graphs after the equations unit**
  - Source: Algebra Basics | Khan Academy. https://www.khanacademy.org/math/algebra-basics
  - Quote: "Unit 4 Unit 4: Graphing lines and slope 76. Quadrants on the coordinate plane 77. Solutions to 2-variable equations"
- **Oak Y8 lesson 16: solving linear equations graphically with technology**
  - Source: Solving linear equations KS3 | Y8 Maths | Lesson Resources | Oak National Academy. https://www.thenational.academy/teachers/programmes/maths-secondary-ks3/units/solving-linear-equations/lessons
  - Quote: "Solving linear equations graphically using technology I can explore how to solve linear equations graphically via dynamic software."
My reading: nothing here needs the coordinate plane. Dan's Coordinate plane lesson 6 already shows a straight
line through zero, and gradient waits for Linear relationships. An optional "check an equation's answer where
two lines cross" idea (Oak Y8 lesson 16) belongs there, not here.

### 3.4 Simultaneous equations
Separate course in Brilliant (Linear Systems), a separate Khan unit, and an MCA line (2.1.28) that Dan will
need. Left to the Linear systems course.

---

## 4. Learning science and misconceptions specific to this ground

### 4.1 Letter as object ("a = apple")
- **Letter-as-object defined: a variable read as an object, or an abbreviation for one (4a + 3b as 4 apples plus 3 bananas), from Küchemann**
  - Source: The omnipresence of the Letter-as-Object misconception (Educational Studies in Mathematics, 2025). https://link.springer.com/article/10.1007/s10649-025-10428-7
  - Quote: "The Letter-as-Object (LO) misconception occurs when students interpret a variable not as a reference to a quantity but either as an object in its own right"
- **Letter-as-object: the 4a + 3b - 2a and apples-plus-bananas examples**
  - Source: The omnipresence of the Letter-as-Object misconception (Educational Studies in Mathematics, 2025). https://link.springer.com/article/10.1007/s10649-025-10428-7
  - Quote: "or as an abbreviation for an object (e.g., (4a+3b) as 4 apples plus 3 bananas) (Küchemann, 1981 )."
- **A relational reading of the equals sign makes the correct reading of letters and expressions more likely (letter-as-object)**
  - Source: The omnipresence of the Letter-as-Object misconception (Educational Studies in Mathematics, 2025). https://link.springer.com/article/10.1007/s10649-025-10428-7
  - Quote: "a relational interpretation––in which the equal sign is seen as expressing an equality between both sides––makes a correct interpretation of variables and algebraic expressions significantly more likely"
- **Letter-as-object is widespread: 'omnipresent' in German Year 7 and 8 students (aged 12-14) after a 4-week algebra unit**
  - Source: The omnipresence of the letter-as-object misconception: a multilevel Latent Transition Analysis. https://link.springer.com/content/pdf/10.1007/s10649-025-10428-7.pdf
  - Quote: "we identified five distinct latent classes concerning the Letter-as-Object (LO) misconception and its subtypes and the transition probabilities after a 4-week algebra teaching unit among German Year 7 and 8 students (aged 12–14)."
- **Academic note: letter as object was found in over 1,400 Australian secondary students (prevalence study)**
  - Source: The Prevalence of the Letter as Object Misconception in Junior Secondary Students. https://www.academia.edu/66889249/The_Prevalence_of_the_Letter_as_Object_Misconception_in_Junior_Secondary_Students
  - Quote: "Responses from over 1,400 Australian secondary school students to a set of three algebra items were analysed to determine the prevalence of the “letter as object” misconception."
- **NCETM warns against 'fruit salad algebra': 3a + 2a = 5a is not 'three apples plus two apples'**
  - Source: Core concept 1.4: Simplifying and manipulating expressions, equations and formulae. https://www.ncetm.org.uk/media/bdddodxr/secmm-cc-audit-1-4-simplifying-and-manipulating-expressions-equations-and-formulae.pdf
  - Quote: "Teaching approaches that are solely procedural and do not help students understand the idea of unitising and the important principle that letters stand for numbers and not objects, should be avoided. For example, it is incorrect to teach that 3 a + 2 a = 5 a because 'three apples plus two apples equals five apples' and this approach (often termed 'fruit salad algebra') should be avoided."
- **NCETM: collecting like terms is unitising, a generalisation of 3 sevens + 2 sevens**
  - Source: Core concept 1.4: Simplifying and manipulating expressions, equations and formulae. https://www.ncetm.org.uk/media/bdddodxr/secmm-cc-audit-1-4-simplifying-and-manipulating-expressions-equations-and-formulae.pdf
  - Quote: "Students should fully appreciate that 'collecting like terms' is not a new idea but a generalisation of something they have previously experienced when unitising in number."
- **Contested: Bitesize's own KS3 video teaches like terms 'using apples', which NCETM warns against**
  - Source: Algebraic terms and expressions - KS3 Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/topics/zxjpn9q
  - Quote: "WATCH: How to collect like terms in algebra See how to collect like terms in algebra, using apples to demonstrate in this Bitesize KS3 maths video."
- **Contested point, to be taught as contested:** NCETM says do not teach 3a + 2a = 5a as "three apples plus
  two apples", yet Bitesize's KS3 video does exactly that ("using apples"). Brilliant's description uses
  "algebra tiles and invoices", which are quantity pictures (area and money), not objects. My reading: show
  letters as stand-ins for numbers (unitising: 3 sevens and 2 sevens), and use a unit picture, not a fruit.
- The "Academic note" source is on academia.edu (a repository host), so treat it as **SECONDARY**. The
  Springer paper is the publisher's own page (Educational Studies in Mathematics, 2025).

### 4.2 Like terms, and joining unlike things (3x + 2 = 5x)
- **Like-terms error: 3x + 4 = 7x and 3x + 2x = 5x squared**
  - Source: Cognitive Map: Diagnosing and Exploring Students' Misconceptions in Algebra (ERIC EJ1412238). https://files.eric.ed.gov/fulltext/EJ1412238.pdf
  - Quote: "Students experience confusion in operations involving algebraic forms, for example, 3𝑥 + 4 = 7𝑥 or 3𝑥 + 2𝑥 = 5𝑥 ² ."
- **Like-terms error (conjoining): 3x + 2y taken to be 5xy**
  - Source: Cognitive conflict strategy to minimize students' misconception on the topic (J. Phys. Conf. Ser. 1088). https://iopscience.iop.org/article/10.1088/1742-6596/1088/1/012084/pdf
  - Quote: "The students often merge the algebraic addition (conjoining) incorrectly. For example, the students simplify the algebra of 4 + 3x 2 become 7x 2 ."
- **Like-terms error: 4 + 3n answered as 7 or 7n**
  - Source: Students' perception of letters as specific unknown and .... https://dialnet.unirioja.es/descarga/articulo/8584078.pdf
  - Quote: "For example most common erroneous answer of algebraic expression like “4+3n” was 7 o 7n."
- **Distribution error: 4(n+5) answered 20n**
  - Source: Students' perception of letters as specific unknown and .... https://dialnet.unirioja.es/descarga/articulo/8584078.pdf
  - Quote: "For example common erroneous a nswers of expression like “4(n+5)” were 20n."
- **Invalid distribution of brackets: 2(3a + 4) written as 6a + 4**
  - Source: Exploring Learner Errors and Misconceptions in Algebraic ... (African Journal of Research in Mathematics, Science and Technology Education, 2024). https://www.tandfonline.com/doi/pdf/10.1080/18117295.2024.2334989
  - Quote: "Invalid distribution of brackets Incomplete expansion of brackets and overgeneralised the distributive law. (1) 2(3a + 4) = 6a + 4"
- **Distributive law over-applied: (a + b) to the fifth power taken as a^5 + b^5**
  - Source: Cognitive Map: Diagnosing and Exploring Students' Misconceptions in Algebra (ERIC EJ1412238). https://files.eric.ed.gov/fulltext/EJ1412238.pdf
  - Quote: "Students work on (𝑎 + 𝑏) ⁵ as 𝑎 ⁵ + 𝑏 ⁵ , and 3(𝑎 + 𝑏) ² as 3𝑎 ² + 3𝑏 ² ."
- **Why 'conjoining' happens: students believe the operator sign should not be in the final answer (6 + y written 6y)**
  - Source: Cognitive Map: Diagnosing and Exploring Students' Misconceptions in Algebra (ERIC EJ1412238). https://files.eric.ed.gov/fulltext/EJ1412238.pdf
  - Quote: "this misconception occurs because students believe the operator sign should not be in the final answer."
- My reading: the shortest form of the error is "conjoining", joining unlike terms because the plus sign
  seems to ask for a single answer. It looks like the equals-sign problem in 4.5 (the sign "wants" an answer).

### 4.3 Sign errors with brackets and a negative
- **Sign error when expanding a bracket with a negative multiplier: -p(q - 3) written -pq - 3p**
  - Source: Error analysis in algebra learning: Exploring misconceptions ... (ERIC EJ1428049). https://files.eric.ed.gov/fulltext/EJ1428049.pdf
  - Quote: "For example, it has been revealed that in some cases, learners cannot expand −𝑝(𝑞 − 3) and instead revealed the solution as −𝑝𝑞 − 3𝑝."
- **Eighth-grade study: half the students thought the minus at the start of an expression had no meaning**
  - Source: errors and misconceptions of eighth-grade students (ERIC EJ1294052). https://files.eric.ed.gov/fulltext/EJ1294052.pdf
  - Quote: "Results indicated that the most common misconception was that the minus at the beginning of the algebraic expression had no meaning and that half of the students had this misconception."
- **A check-by-numbers refutation of x - (a - b) = x - a - b, useful as a model for a check screen**
  - Source: MATH 1046 Common Mistakes - algebra.nipissingu.ca. http://algebra.nipissingu.ca/mistakes.html
  - Quote: "As can be seen -5 is not equal to 3 so the formula is incorrect. The error was that the negative sign must be multiplied into both terms in the bracket leaving x-(a-b) = x-a+b."
- **NCETM names the same slip in an equation task: 8x - (6x - 5) written as 2x + 5**
  - Source: 2.2 Solving linear equations (NCETM mastery PD). https://www.ncetm.org.uk/media/wbylane0/ncetm_ks3_cc_2_2.pdf
  - Quote: "Consider possible outcomes that are likely to be given by students, including 8 x − 6 x − 5 = 2 x + 5 or 8 x − (6 x − 5) = 2 x + 5, and raise the use of brackets to support the understanding of 6 x − 5 as an object."
- **NCETM: a process like 3e must be handled as one object when moving it across (5 + 3e = 7e - 1)**
  - Source: 2.2 Solving linear equations (NCETM mastery PD). https://www.ncetm.org.uk/media/wbylane0/ncetm_ks3_cc_2_2.pdf
  - Quote: "Some students may find challenging the shift in awareness needed to understand that a process (e.g. 3 e means multiply whatever e is by three) is now being manipulated as one object"
- My reading: the evidence says the failure is the same each time: a minus sign is read as a separate
  instruction instead of belonging to the thing after it. Checking by putting a number in (the nipissingu
  example) is the cheap test, and Bitesize also ends every worked example with "check the answer".
- A further finding (5(p+q) - 3(p+q) done as 5p + 5q - 3p + 3q because the bracket is not seen as one thing,
  in the Cognitive Map paper, ERIC EJ1412238) was in a saved search result but beyond the 12 KB the checker
  reads, so it is **UNCONFIRMED** and not in `quotes.json`.

### 4.4 Inequality sign reversal
- **Inequalities: students forget to reverse the sign when multiplying by a negative number (error analysis of 188 students)**
  - Source: Errors Analysis of Solving Linear Inequalities among the ... (ERIC EJ1099654). https://files.eric.ed.gov/fulltext/EJ1099654.pdf
  - Quote: "There are some mistakes occurred by some students when they solve different types of equations and inequalities: linear, quadratic and fractional. Where it is noted that when the students' when multiply the inequality by a negative number don't change direction of the inequality."
- **Inequalities: Vaiyavutjamai and Clements (2006) found numerous 'fossilised' misconceptions about linear inequalities**
  - Source: Learners' Misconceptions and Errors when Solving Inequalities. https://ejournal.umm.ac.id/index.php/MEJ/article/download/27675/12866/97551
  - Quote: "Vaiyavutjamai and Clements (2006) identify numerous fossilised misconceptions that guide learners’ thinking with respect to linear inequalities."
- **Inequalities: the balance method misapplied from equations**
  - Source: Learners' Misconceptions and Errors when Solving Inequalities. https://ejournal.umm.ac.id/index.php/MEJ/article/download/27675/12866/97551
  - Quote: "Furthermore, Balomenou, Komis and Zacharos (2017) report that learners’ solutions to inequalities are incorrect due to misapplications of the ‘balance method’ that is used when solving equations."
- **Inequalities: some learners reverse the sign when moving a negative number across instead of when dividing by it**
  - Source: Learners' Misconceptions and Errors when Solving Inequalities. https://ejournal.umm.ac.id/index.php/MEJ/article/download/27675/12866/97551
  - Quote: "Learners mistakenly construe that moving a negative number to the other side of the inequality reverses the inequality instead of dividing by a negative number."
- **The rule for inequalities: positive keeps the sign, negative reverses it (OpenStax shows it by trying 10 < 15)**
  - Source: 2.5 Solve Linear Inequalities - Intermediate Algebra 2e | OpenStax. https://openstax.org/books/intermediate-algebra-2e/pages/2-5-solve-linear-inequalities
  - Quote: "When we divide or multiply an inequality by a positive number, the inequality sign stays the same. When we divide or multiply an inequality by a negative number, the inequality sign reverses."
- **The rule shown by testing with a true inequality (-2 < 5)**
  - Source: 1.4: Linear Inequalities - Mathematics LibreTexts. https://math.libretexts.org/Courses/Clackamas_Community_College/MTH_95%3A_Algebra_3/01%3A_Linear_Relationships_Equations_and_Inequalities/1.04%3A_Linear_Inequalities
  - Quote: "Start again with (−2 < 5), but this time multiply both sides by (−2), (−3), and (−4)."
- **Bitesize National 5: the one exception to the equation rules**
  - Source: Inequations - Working with linear equations and inequations - National 5 Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zwgdb82/revision/3
  - Quote: "When multiplying (or dividing) an inequation by a negative number, switch the inequality symbol round."
- **Big Ideas: only reverse when you multiply or divide by a negative, not when a negative sign merely appears**
  - Source: Solving Inequalities 2.6b. https://www.bigideasmath.com/protected/content/ipe_cc/grade%207/02/g7_02_6b.pdf
  - Quote: "A negative sign in an inequality does not necessarily mean you must reverse the inequality symbol. Only reverse the inequality symbol when you multiply or divide each side by a negative number."
- **Inequalities: the flip slip is small against conceptual errors in the 188-student study (5.7 percent against 22.5 percent)**
  - Source: Errors Analysis of Solving Linear Inequalities among the ... (ERIC EJ1099654). https://files.eric.ed.gov/fulltext/EJ1099654.pdf
  - Quote: "The common errors ranged between 5.7% for changing the direction of inequality when multiplying by a negative number, and 22.5% for conceptual errors."
- My reading: "forgetting to flip" is real but small next to conceptual errors, and the larger problem is
  treating an inequality as an equation (the Mutodi and Balomenou findings above). A number-line test (try 10 < 15 times -5)
  teaches why, rather than a rule to memorise.

### 4.5 The equals sign read as "the answer comes next"
- **Equals sign: students read it as 'add the numbers' or 'the answer' (operational view), widely in grades 6-8**
  - Source: The Importance of Equal Sign Understanding in the Middle Grades (Knuth, Alibali, Hattikudur, McNeil, Stephens, 2008). https://psych.wisc.edu/alibali/home/Publications_files/Knuth_etal_MTMS_2008.pdf
  - Quote: "A response was categorized as operational if the student expressed the general idea that the equal sign means “add the numbers” or “the answer.”"
- **Equals sign: why 'operations equal answer' sums breed the operational view**
  - Source: The Importance of Equal Sign Understanding in the Middle Grades (Knuth, Alibali, Hattikudur, McNeil, Stephens, 2008). https://psych.wisc.edu/alibali/home/Publications_files/Knuth_etal_MTMS_2008.pdf
  - Quote: "In solving such “operations equal answer” equations correctly, it is not really necessary for students to think about the equal sign as a symbol of equivalence; rather, students need only perform the calculations on the left side of the equal sign to get an answer."
- **Equals sign: 'a limited conception ... is one of the major stumbling blocks in learning algebra' (Carpenter, Franke and Levi)**
  - Source: The Importance of Equal Sign Understanding in the Middle Grades (Knuth, Alibali, Hattikudur, McNeil, Stephens, 2008). https://alibali.psych.wisc.edu/wp-content/uploads/sites/371/2018/02/KnuthAlibaliHattikudurMcNeilStephens2008.pdf
  - Quote: "limited conception of what the equal sign means is one of the major stumbling blocks in learning algebra."
- **Equals sign test case 8 + 4 = _ + 5: answers 12 and 17 show the operational view**
  - Source: Does Understanding the Equal Sign Matter? Evidence from Solving Equations (Knuth, Stephens, McNeil, Alibali, JRME 2006). https://psych.wisc.edu/alibali/home/Publications_files/Knuth_Stephens_McNeil_Alibali_JRME_2006.pdf
  - Quote: "found that many students provided answers of 12, 17, or 12 and 17-answers that are consis- tent with an understanding of the equal sign as announcing a result."
- **Equals sign: many students see = as 'an announcement of the result' rather than equivalence**
  - Source: Does Understanding the Equal Sign Matter? Evidence from Solving Equations (Knuth, Stephens, McNeil, Alibali, JRME 2006). https://psych.wisc.edu/alibali/home/Publications_files/Knuth_Stephens_McNeil_Alibali_JRME_2006.pdf
  - Quote: "frequently viewing the symbol as an announcement of the result of an arithmetic operation rather than as a symbol of mathematical equivalence"
- **Equals sign: students must see = as a relation to make sense of transformations such as subtracting 32 from both sides of 5x + 32 = 97**
  - Source: Does Understanding the Equal Sign Matter? Evidence from Solving Equations (Knuth, Stephens, McNeil, Alibali, JRME 2006). https://psych.wisc.edu/alibali/home/Publications_files/Knuth_Stephens_McNeil_Alibali_JRME_2006.pdf
  - Quote: "Students must understand the equal sign as expressing a rela- tion in order to make sense of the transformations performed on such an equation."
- **Equals sign: how many Grade 6, 7 and 8 students gave an operational versus relational definition (percent)**
  - Source: Does Understanding the Equal Sign Matter? Evidence from Solving Equations (Knuth, Stephens, McNeil, Alibali, JRME 2006). https://psych.wisc.edu/alibali/home/Publications_files/Knuth_Stephens_McNeil_Alibali_JRME_2006.pdf
  - Quote: "Best Definition Grade 6 Grade 7 Grade 8 Operational 53 36 52 Relational 32 43 31"
- **Equals sign: students with a relational view solved the linear equations more often, even in Grades 6 and 7 with no formal algebra**
  - Source: The Importance of Equal Sign Understanding in the Middle Grades (Knuth, Alibali, Hattikudur, McNeil, Stephens, 2008). https://psych.wisc.edu/alibali/home/Publications_files/Knuth_etal_MTMS_2008.pdf
  - Quote: "Figure 4 shows that students who exhibited a relational view of the equal sign were more likely than students who did not to solve the linear equa- tion items ( fig. 2 ) correctly."
- **Equals sign: teaching move, give equations with operations on both sides**
  - Source: The Importance of Equal Sign Understanding in the Middle Grades (Knuth, Alibali, Hattikudur, McNeil, Stephens, 2008). https://psych.wisc.edu/alibali/home/Publications_files/Knuth_etal_MTMS_2008.pdf
  - Quote: "teachers might provide students with arithme- tic (or algebraic) equations to solve in which numbers and operations (or symbolic expressions and operations) appear on both sides of the equal sign."
- **Equals sign: the fix is to meet it in non-standard places; 'operations on both sides' was best at drawing out a relational view**
  - Source: Middle-School Students' Understanding of the Equal Sign: The Books They Read Can't Help (McNeil et al., 2006). https://alibali.psych.wisc.edu/wp-content/uploads/sites/371/2018/02/McNeilGrandauKnuthAlibaliStephensHattikudurKrill2006.pdf
  - Quote: "The other nonstandard contexts were better than the operations equals answer context at eliciting a relational understanding of the equal sign, but the operations on both sides context was best."
- **Equals sign: those with an operational view answer 12 or 17 to 8 + 4 = _ + 5**
  - Source: Is a substitute the same? Learning from lessons centering different relational conceptions of the equal sign - PMC. https://pmc.ncbi.nlm.nih.gov/articles/PMC9330929
  - Quote: "Students who hold an operational view tend to solve missing value equations by performing the given operations to the left of the equal sign or by performing all the given operations (e.g., for 8 + 4 = __ + 5, writing 12 or 17 in the blank; Carpenter et al., 2003 )."
- **NCETM: the solution is the fixed point where two expressions are equal; 4x + 6 = 4x has no solution**
  - Source: 2.2 Solving linear equations (NCETM mastery PD). https://www.ncetm.org.uk/media/wbylane0/ncetm_ks3_cc_2_2.pdf
  - Quote: "What happens when you try to solve 4x + 6 = 4x? What does this mean? Why is there no solution?"
- My reading: Dan's Solving equations lesson 1 already works on "=" meaning both sides the same. In Linear
  equations the new risk is that a bracket or a sum on the left looks like "work this out now". Put
  expressions on both sides early and reuse the check step (substitute and compare).

### 4.6 Two strongest sources
1. **Equals sign:** Knuth, Stephens, McNeil and Alibali, "Does Understanding the Equal Sign Matter?" (JRME
   2006) and the teacher-facing Knuth et al. (2008) article. Original publisher PDFs on the authors' university
   site; large middle-school samples; link to equation-solving success.
2. **Letter as object:** the NCETM subject-knowledge audit for core concept 1.4 (official English guidance;
   "fruit salad algebra") together with the Springer 2025 paper on the misconception.

---

## 5. Where it is used, for an electrician going into marine engineering

### 5.1 MCA Second Engineer, Mathematics syllabus (GOV.UK): the best match
- **MCA Second Engineer maths syllabus, 2.1.1 to 2.1.5: letters and symbols, adding and subtracting algebraic quantities, the effect of signs before a bracket**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "2. Algebra ### 2.1 Uses the rules of Algebra and solves associated problems 1. Represents quantities by numbers, letters and symbols. 2. Adds algebraic quantities, both positive and negative. 3. Subtracts algebraic quantities, both positive and negative. 4. States the effect of plus or minus signs in front of a bracketed quantity or quantities. 5. States the effect of the plus or minus signs in the multiplication and division of quantities."
- **MCA Second Engineer maths syllabus 2.1.10: the Law of Distribution**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "10. States the ‘Law of Distribution’."
- **MCA Second Engineer maths syllabus 2.1.16: factorises expressions with a one-term factor**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "16. Factorises expressions which have one factor consisting of one term only."
- **MCA Second Engineer maths syllabus 2.1.23 to 2.1.27: equation defined, solve linear equations, the three axioms, transposition, develop linear equations from data**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "23. Defines an equation as a statement of equality. 24. Simplifies and solves linear equations. 25. Understands the axioms: 1. if equal quantities be added to two quantities that are already equal, the results will be equal; 2. if equal quantities be subtracted from two quantities that are already equal, the remainders will be equal; 3. equal quantities when multiplied or divided by the same quantity will give results that are equal. 26. Solves problems on the transposition of algebraic expressions. 27. Develops linear equations consistent with data provided in a question, and finds the solution to these equations."
- **MCA Second Engineer maths syllabus 2.1.28: simultaneous equations of two unknowns by substitution and elimination**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "28. Solves linear simultaneous equations of two unknowns: 1. by the method of substitution; 2. by the method of elimination."
- **Best syllabus line found:** 2.1.4, "States the effect of plus or minus signs in front of a bracketed
  quantity or quantities", together with 2.1.24 "Simplifies and solves linear equations" and 2.1.27 "Develops
  linear equations consistent with data provided in a question". These three are the course in one syllabus.
- No inequality line appears in the parts of the syllabus the tool returned (sections 1, 2, 4 and 6 were shown,
  some elided). **UNCONFIRMED** whether inequalities appear elsewhere in the syllabus; I did not see one.
  My reading: inequalities are a lower priority for Dan's route than brackets and like terms.

### 5.2 MCA General Engineering Science I (GOV.UK)
- **MCA General Engineering Science I 1.3: form linear equations from data; interpret the equation of a straight-line graph (intercept and gradient)**
  - Source: General Engineering Science I Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses
  - Quote: "1.3 Graphs 1. Form linear equations consistent with data provided. 2. Plot ordered pairs on graph paper, either given or calculated and join the points with an appropriate curve. 3. Interpret the equation for a straight-line graph, identifying the intercept and gradient."
- **MCA General Engineering Science I: the rules of algebra section is thin, signed numbers and indices**
  - Source: General Engineering Science I Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses
  - Quote: "1.2 The rules of algebra 1. Solve problems related to addition, subtraction and product of positive and negative numbers."
- My reading: GES I is thin on algebra (signed numbers, indices, a quadratic divided by a linear factor); the
  Second Engineer syllabus above is the heavier one.

### 5.3 SQA
- **SQA HN Engineering Mathematics 1 (H7K033): advantageous to have good algebraic skills and to transpose engineering formulae**
  - Source: national unit specification: general information (SQA H7K033, Engineering Mathematics 1). https://www.sqa.org.uk/files/hn/H7K033.pdf
  - Quote: "it would be advantageous if learners had good algebraic skills together with an ability to transpose engineering formulae and solve simple trigonometric equations."
- **SQA H7K033 (Engineering Mathematics 1) outcomes: functions and trigonometric equations, exponential and logarithmic equations, vectors and complex numbers**
  - Source: national unit specification: general information (SQA H7K033, Engineering Mathematics 1). https://www.sqa.org.uk/files/hn/H7K033.pdf
  - Quote: "On successful completion of the Unit the learner will be able to: 1 Solve problems involving functions and trigonometric equations. 2 Solve problems involving exponential and logarithmic equations. 3 Apply mathematical techniques involving vectors and complex numbers."
- **SQA H7K033: entry evidenced by NQ Mathematics: Technician 1, Intermediate 2 or National 5**
  - Source: national unit specification: general information (SQA H7K033, Engineering Mathematics 1). https://www.sqa.org.uk/files/hn/H7K033.pdf
  - Quote: "This knowledge and understanding may be evidenced by possession of the NQ Unit Mathematics: Technician 1 or a pass at Intermediate 2 or National 5 in Mathematics."
- **SQA National 5 Mathematics: algebraic skills include expansion of brackets**
  - Source: National 5 Mathematics Course Specification. https://www.sqa.org.uk/files_ccc/n5-course-spec-mathematics.pdf
  - Quote: "Working with algebraic expressions involving expansion of brackets"
- **SQA National 5: simultaneous equations (constructed from text) and changing the subject of a linear formula**
  - Source: National 5 Mathematics Course Specification. https://www.sqa.org.uk/files_ccc/n5-course-spec-mathematics.pdf
  - Quote: "Working with simultaneous equations Construct from text Graphical solution Algebraic solution Changing the subject of a formula Linear formula"
- **Status: PARTLY CONFIRMED.** SQA's HN Engineering Mathematics 1 names algebra only as an entry advantage
  ("good algebraic skills together with an ability to transpose engineering formulae"); its three outcomes
  (functions and trigonometric equations; exponential and logarithmic equations; vectors and complex numbers)
  do not name brackets, simplifying or inequalities. The assumed level is National 5, whose algebra includes
  expansion of brackets. So Dan must have this ground before Engineering Mathematics 1 starts. The unit's
  `H7K033` PDF is the original SQA file (dated 2014); whether a newer HN unit replaces it is **UNCONFIRMED**.

### 5.4 City & Guilds 2365 (electrical installation)
- **City & Guilds 2365-02 Level 2: mathematical principles listed for electrical work are fractions and percentages, algebra, indices, transposition, trigonometry, statistics**
  - Source: City & Guilds Level 2 Diploma in Electrical Installations (Buildings and Structures) (2365-02). https://www.cityandguilds.com/-/media/productdocuments/building_services_engineering/electrical_installation/2365/2365_level_2/centre_documents/2365-02_l2_electrical_installation_qualification_handbook_v1-12-pdf.pdf
  - Quote: "Mathematical principles: • Fractions and percentages • Algebra • Indices • Transposition • Triangles and trigonometry • Statistics."
- **City & Guilds Unit 202 handout: transposition = 'whatever you do to one side, do the same to the other'**
  - Source: Unit 202: Principles of Electrical Science (City & Guilds 2365 handout). https://ntcstudents.co.uk/download/PAWs/2365-202.pdf
  - Quote: "Whatever you do to one side of the formula, you must do the same to the other side."
- Algebra and transposition are in the Level 2 maths list; the handout's rule is the same balance rule as
  Solving equations. The handout itself is a training-centre copy of City & Guilds material: **SECONDARY**.

### 5.5 Real formulas with brackets or like terms
- **R = R0(1 + alpha dT):** the temperature rule for a conductor, a bracket with 1 plus a small term inside.
  Dan can expand it (R = R0 + R0 alpha dT), factorise it back, and rearrange it for R0 or dT.
- **Resistance and temperature, R = R0(1 + alpha dT), where R0 is the original resistance**
  - Source: Module 6 Resistance | Science 111. https://courses.lumenlearning.com/ivytech-sci111/chapter/resistance-and-resistivity
  - Quote: "R = R ₀ ( 1 + α Δ T ) is the temperature dependence of the resistance of an object, where R ₀ is the original resistance and R is the resistance after a temperature change Δ T ."
- **Worked temperature example with a bracket: R = R0(1 + alpha dT) for a tungsten filament**
  - Source: Module 6 Resistance | Science 111. https://courses.lumenlearning.com/ivytech-sci111/chapter/resistance-and-resistivity
  - Quote: "This is a straightforward application of R = R ₀ ( 1 + α Δ T ), since the original resistance of the filament was given to be R ₀ = 0.350 Ω, and the temperature change is Δ T = 2830ºC."
- **Caution on R = R0(1 + alpha dT): fine for changes under about 100 deg C, a linear model**
  - Source: Module 6 Resistance | Science 111. https://courses.lumenlearning.com/ivytech-sci111/chapter/resistance-and-resistivity
  - Quote: "Over relatively small temperature changes (about 100ºC or less), resistivity ρ varies with temperature change Δ T as expressed in the following equation"
- **Resistance and temperature: alpha for copper is 3.9 x 10^-3 per degree C**
  - Source: Module 6 Resistance | Science 111. https://courses.lumenlearning.com/ivytech-sci111/chapter/resistance-and-resistivity
  - Quote: "Copper | 3.9 × 10 −3"
- **Resistance and temperature in a conductor, Rt = R0(1 + alpha t), with R0 at 0 deg C**
  - Source: Conductance, Variations of Resistivity with Temperature (lecture notes). https://wwww.uomus.edu.iq/img/lectures21/MUCLecture_2024_5134456.pdf
  - Quote: "From Eq. ( i ) , we find that Rt = R 0 (1 + α t ) ... ( ii )"
  The Lumen page reproduces OpenStax College Physics; the lecture PDF is a university's course notes:
  **SECONDARY** for both. Note the reference temperature: R0 is the resistance at the starting temperature, and the lecture PDF takes it at 0 deg C.
- **Series resistances and total load (adding like quantities):**
- **Series resistances: the total is the sum, R = R1 + R2 + R3 (adding like quantities)**
  - Source: 21.1 Resistors in Series and Parallel - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/21-1-resistors-in-series-and-parallel
  - Quote: "It seems reasonable that the total resistance is the sum of the individual resistances, considering that the current has to pass through each resistor in sequence."
- **Series resistances: V = IR1 + IR2 + IR3 = I(R1 + R2 + R3), a factorise-and-collect step engineers do**
  - Source: 21.1: Resistors in Series and Parallel - Physics LibreTexts. https://phys.libretexts.org/Bookshelves/College_Physics/College_Physics_1e_(OpenStax)/21%3A_Circuits_Bioelectricity_and_DC_Instruments/21.01%3A_Resistors_in_Series_and_Parallel
  - Quote: "[V=IR_{1}+IR_{2}+IR_{3}=I(R_{1}+R_{2}+R_{3}).]"
- **Series circuit worked example: 120 V across 30, 15 and 15 ohms gives 60 ohms and 2.0 A**
  - Source: 4.5.3: Series Circuits - Physics LibreTexts. https://phys.libretexts.org/Courses/Coalinga_College/Physical_Science_for_Educators_Volume_2/04%3A_Electricity/4.05%3A_Electric_Circuits/4.5.03%3A_Series_Circuits
  - Quote: "R T =R 1 +R 2 +R 3 =30 Ω+15 Ω+15 Ω=60 Ω"
  OpenStax is the original text; LibreTexts hosts the same text (**SECONDARY** host). A "total load" formula
  for a ship's switchboard was not found: **UNCONFIRMED**.
- **Voltage drop:**
- **Voltage drop formula VD = (mV/A/m x Ib x L) / 1000 with BS 7671 limits of 3% and 5%**
  - Source: Volt Drop Calculation: Formula, 3% & 5% Limits (BS 7671) | Total Skills UK. https://www.totalskills.co.uk/guides/volt-drop-calculations
  - Quote: "Voltage drop formula: VD = (mV/A/m × Ib × L) / 1000. BS 7671 limits: 3% (6.9V) for lighting, 5% (11.5V) for power."
  The 3 and 5 percent limits are from a training provider, not BS 7671 itself, which is paywalled:
  **SECONDARY**. (Solving equations already covers the voltage-drop rule from its unit; this line is for the
  like-quantity reading: mV per amp per metre times amps times metres, divided by 1000.)
- **Heat, Q = mc dT:**
- **Heat formula Q = mc dT, with mass, specific heat capacity and temperature change**
  - Source: Specific Heat Capacity Formula: Q = mcΔT Explained with Examples | Physics Fundamentals. https://physicsfundamentals.uk/learn/specific-heat
  - Quote: "The specific heat capacity equation Q = mcΔT tells you exactly how much energy is needed to heat any material."
- **Heat formula in an engine: water as coolant absorbs engine heat with a modest temperature rise**
  - Source: Specific Heat Capacity Formula: Q = mcΔT Explained with Examples | Physics Fundamentals. https://physicsfundamentals.uk/learn/specific-heat
  - Quote: "Water's high specific heat makes it ideal as an engine coolant. It absorbs large amounts of heat from the engine block with only modest temperature increases, transferring it to the radiator."
- **Rearranging Q = mc dT for m, c or dT**
  - Source: Specific Heat Capacity Formula: Q = mcΔT Explained with Examples | Physics Fundamentals. https://physicsfundamentals.uk/learn/specific-heat
  - Quote: "Solve for Q Q = m c Δ T Solve for m"
  The page is a general physics site, not a marine one. A ship-specific worked example (jacket-water cooler,
  fuel heating) was **not found**: **UNCONFIRMED**.
- **Thermal expansion, L1 = L0 + L0 alpha (t1 - t0):** a formula with L0 repeated, which factorises to
  L0(1 + alpha dt), the same shape as the resistance rule.
- **Thermal expansion of a pipe or rod: L1 = L0 + L0 alpha (t1 - t0), which factorises to L0(1 + alpha dt)**
  - Source: Linear Thermal Expansion: Formula, Coefficients & Calculator (Engineering ToolBox). https://www.engineeringtoolbox.com/amp/linear-thermal-expansion-d_1379.html
  - Quote: "L 1 = L 0 + dl = L 0 + L 0 α (t 1 - t 0 ) (2)"
- **Transposing with a bracket:** y = 3(x + 7) made x the subject, from a UK university maths-support
  archive, and HELM's engineering workbook.
- **Transposing a formula with a bracket: make x the subject of y = 3(x + 7)**
  - Source: 'JUST THE MATHS' SLIDES NUMBER 1.6 ALGEBRA 6 (Formulae and algebraic equations) by A.J.Hobson. https://archive.uea.ac.uk/jtm/slides/1/sld1p6.pdf
  - Quote: "1. Make x the subject of the formula y = 3( x + 7) ."
- **Engineering formulae and transposition: 'basic skills required in all aspects of engineering' (HELM)**
  - Source: Formulae and Transposition (HELM Workbook 1: Basic Algebra, University of Sheffield). https://sheffield.ac.uk/media/30742/download?attachment
  - Quote: "These are basic skills required in all aspects of engineering."

---

## 6. Size: how many lessons the benchmarks spend

My counts from the lists above (not quotes):
- **Brilliant Linear Equations:** 68 lessons in 13 levels. Levels that map to Dan's six: 1 (expressions), 3 (inequalities),
  4 (combining), 7 (flip with negatives), 8 (distributing), 9 (factoring). Level 2 repeats Dan's Solving
  equations, and levels 5 and 6 repeat much of Negative numbers except negatives inside expressions.
- **Khan Algebra basics:** unit 2 (algebraic expressions) lists 11 skills (evaluate 2, write 2, like terms 3,
  distributive property 1, factor 1, equivalent expressions 1, nested fractions 1) plus two quizzes; unit 3
  lists 14 skills, of which 6 are equations (one with parentheses), 4 are inequalities and 4 are proportions.
- **Oak:** Year 7 spends 8 lessons on like terms, brackets and factorising (lessons 9 to 16); Year 8 spends 3 on
  brackets in equations (13 to 15); Year 11 spends 14 on inequalities.
- **NCETM:** key ideas 1.4.2 and 1.4.3 for expressions, 2.2.4 for brackets in equations, 9.1 for inequalities.

**What this supports (my reading):** about six lessons is a sensible cut for Dan, because every benchmark spends
more time than that and Dan already has the first half of Oak's Year 8 unit. A candidate grouping, to be
settled in the brief, not here:
1. Like terms (expressions as unitised quantities, negatives as part of a term).
2. Expanding a bracket (number, term, negative multiplier, check by numbers).
3. Factorising: the reverse, taking out a common factor (R0 + R0 alpha dT back to R0(1 + alpha dT)).
4. Equations with brackets and like terms (expand first or divide first; fractions only where needed).
5. Inequalities (solve, flip with a negative, number line).
6. Building an expression or equation from a situation, using trade formulas with a bracket.
Dropped for six: compound inequalities, no or many solutions as a lesson (a screen inside lesson 4), percentage
discounts (Percentages covers them), graphs, simultaneous equations.

---

## 7. What I could not confirm
- **Math Academy and CIMT** course lists: searched, only a pre-algebra product page and Khan pages came back.
  NCETM was used as the fifth benchmark instead.
- **Brilliant's lesson content:** only the contents list was visible, not a lesson.
- **Bitesize GCSE** page order inside the equations and inequalities guides (only the topic listing was read).
- **A ship-specific worked example** of Q = mc dT, and a **total-load formula**: not found.
- **Whether inequalities appear anywhere in the MCA Second Engineer syllabus:** not seen in the parts returned.
- **A newer SQA HN Engineering Mathematics 1 unit** than H7K033 (dated 2014): not checked.
- **The 5(p+q) - 3(p+q) bracket slip** (ERIC EJ1412238): visible in a search result, outside the 12 KB window the
  checker reads, so not in `quotes.json`.
- **BS 7671 itself** (paywalled); only a training provider's statement of the formula and limits.
