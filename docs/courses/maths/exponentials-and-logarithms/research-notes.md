# Exponentials and logarithms: research notes

Researched 18 Oct 2026 for the Exponentials and logarithms course brief (the seventh course in the Maths shelf's
Algebra folder; blurb "Growth that multiplies, the number e, and the logarithm that undoes it: capacitor charging,
decibels and pVⁿ = C when n = 1."; benchmark "Brilliant: Exponentials and Logarithms, and Logarithms"). The brief
itself is not written here; these notes are its evidence. Dan is an electrician preparing for marine engineering
college (HNC/HND route: engineering maths, applied mechanics, applied heat, electro-technology). His built courses
are Fractions, Negative numbers, Percentages, Proportional reasoning, Solving equations, The coordinate plane,
Geometry fundamentals, Linear equations and Calculus fundamentals. Before this course in the folder, and assumed
done: Straight-line graphs, Linear systems, Powers and roots, Functions and their graphs, Quadratics and
polynomials (briefs in `build/maths/<course>/brief.md`). After it: Trigonometry, Complex numbers.

Every finding has its source title, URL and the exact words. The quotes were not retyped: they were cut by script
from the saved tool results in `tools/` (67 files, saved from this run's own Parallel Search calls with
`tools/course/harvest.mjs`), and every one is listed in `quotes.json` beside this file and was checked with
`node tools/eval/sources.mjs --quotes ... --tools ...` (`failed: 0`). Where a fragment looks odd (a space before a
full stop, a missing formula, "◦C") that is how the page's text came back from the tool, not a typing slip.
Findings I could not confirm are marked **UNCONFIRMED**; where only a copy, a notes site or a trade page said it,
**SECONDARY**. My own readings are marked "My reading" and are not quotes. Statements about the other briefs are
from the files in `build/maths/` and are not web quotes.

---

## 1. Benchmark: Brilliant's Exponentials and Logarithms, and Logarithms

### 1.1 The first course, 42 lessons in 10 levels
Brilliant no longer has a course with the name "Exponentials and Logarithms". The page that carried that title in
the search listing is `brilliant.org/courses/exponential-functions` (its listed title is "Practice Exponentials and
Logarithms | Brilliant"; the page fetched later calls itself "Practice Exponential Functions | Brilliant"). The guessed
address `/courses/exponentials-logarithms/` does not show a course: it returns the Courses list (see 1.3).
The second half of the benchmark is a separate course, Logarithms (1.2).

- **Brilliant's Exponential Functions course (page title 'Practice Exponentials and Logarithms') is 42 lessons and 696 exercises**
  - Source: Practice Exponentials and Logarithms | Brilliant. https://brilliant.org/courses/exponential-functions
  - Quote: "Build, combine, and simplify exponential functions. 42 Lessons 696 Exercises"
- **Levels 1 to 5: growth, functions, decay, comparisons, general bases**
  - Source: Practice Exponentials and Logarithms | Brilliant. https://brilliant.org/courses/exponential-functions
  - Quote: "Level 1 Exponential Growth Growing Doubling Tripling Powers of 10 Level Check Level 2 Exponential Functions Bases Initial Values Finding the Base and Coefficient Deducing Exponential Functions Level Check Level 3 Exponential Decay Decay Fractional Bases Building Decay Functions Negative Exponents Level 4 Exponential Comparisons Linear Comparisons Quadratic Comparisons Comparing Growth Comparing Decay Level 5 General Bases Building Exponentials Finding Initial Values Fractional Bases Building Decay Functions Comparing Decimal Bases"
- **Levels 6 to 10: compound interest, applications, shifted exponentials, number line, non-integers**
  - Source: Practice Exponentials and Logarithms | Brilliant. https://brilliant.org/courses/exponential-functions
  - Quote: "Level 6 Compound Interest Percent Increase Modeling Compound Interest Modeling Depreciation Interest Comparisons Level 7 Applications of Exponentials Modeling from Data Identifying Growth Identifying Decay Exponentials in Non-Time Domains Level 8 Shifted Exponentials Shifting Exponentials Building Shifted Exponentials Decaying to a Value Rising to a Value Level 9 Exponentials on the Number Line Stepping Along Exponentials Skipping Along Exponentials Exponentials Over Negatives Reflection Over Vertical Axis Building Exponentials Level 10 Exponentials at Non-Integers Exponentials at Half-Steps Exponentials Between Integers Signed Stepping Building Exponentials"
- **Brilliant's description: patterns from viral spread to cooling coffee, then the why behind the rules**
  - Source: Practice Exponentials and Logarithms | Brilliant. https://brilliant.org/courses/exponential-functions
  - Quote: "This interactive course unveils the mathematics behind some of nature's most compelling patterns—from viral spread and population growth to radioactive decay and cooling coffee."

My reading of the order: doubling and tripling first (levels 1 and 2), then decay with fractional bases and
negative exponents (3), then growth set against linear and quadratic growth (4), then percent change and compound
interest (5, 6), then fitting to data (7), then curves that settle to a value ("Decaying to a Value", "Rising to a
Value", level 8: the shape of a capacitor discharging and charging, though the page gives only titles), then
exponentials on the number line and between the integers (9, 10). **The number e does not appear anywhere in the
lesson or topic lists**, and neither do a time constant or a half-life. Brilliant
reaches "non-integer exponents" last; Dan has fractional powers from Powers and roots lesson 4. What the pictures
inside each lesson are is **UNCONFIRMED** (I saw titles only, not a lesson).

### 1.2 The second course, Logarithms, 29 lessons in 5 levels
- **Brilliant's Logarithms course is 29 lessons and 511 exercises, for solving an unknown exponent**
  - Source: Practice Logarithms | Brilliant. https://brilliant.org/courses/logarithms
  - Quote: "Take your work with exponential functions further by learning to solve equations with an unknown exponent. 29 Lessons 511 Exercises"
- **Logarithms levels 1 to 3: the logarithm, graphing, identities**
  - Source: Practice Logarithms | Brilliant. https://brilliant.org/courses/logarithms
  - Quote: "Level 1 The Logarithm Counting Days Log-Exponent Pairs Inverse of Base 2 Inverse of Exponentiation Negative Exponents Fractional Exponents Evaluating Logarithms Level Check Level 2 Graphing Log Functions Estimating Logs Graphing Log Functions Domain of the Logarithm Fractional Bases Graphing Fractional Bases Level Check Level 3 Logarithm Identities The Product Rule Proving the Product Rule The Quotient Rule The Power Rule Proving the Power Rule Transforming with Identities"
- **Logarithms levels 4 and 5: changing bases and solving using logarithms**
  - Source: Practice Logarithms | Brilliant. https://brilliant.org/courses/logarithms
  - Quote: "Level 4 Changing Bases Bases 2, 4 and 8 Bases 2 and 10 Converting Bases Converting Bases Graphically Level 5 Solving Using Logarithms Taking Logs of Both Sides The Unknown Inside a Log Logs on Both Sides Solutions and Domains Using Log Identities Graphing Solutions Checking Solutions"
- **Brilliant's Logarithms description, including checking which answers are valid**
  - Source: Practice Logarithms | Brilliant. https://brilliant.org/courses/logarithms
  - Quote: "Use graphs and powers you already know to turn exponential questions inside out, building each logarithm rule. By the end of the course, you'll be able to evaluate logarithms in any base, graph them and find their domains, apply the product, quotient, and power rules, convert between bases, and solve equations with an unknown in the exponent or inside a log. You'll also learn to check which answers are valid, since the algebra that solves a log equation can introduce solutions the original equation never had."
- **Brilliant's Logarithms leans on exponent rules and no calculator**
  - Source: Practice Logarithms | Brilliant. https://brilliant.org/courses/logarithms
  - Quote: "Before you get started, you should be comfortable with exponential functions and the rules of exponents, since every logarithm rule is proved from an exponent rule. You don't need any prior experience with logarithms to begin, and you won't need a calculator: the course works with bases you can reason about mentally."

My reading: Brilliant builds each log law from the matching exponent rule ("every logarithm rule is proved from an
exponent rule"), has a proof lesson for the product and power rules, and ends on equations with a check for
invalid answers. It has **no natural logarithm level, no log-scale or straight-line (linearising) level, no
decibels and no applications**; those are exactly the parts an engineer needs and the benchmark lacks. It also avoids
a calculator, which Dan will use.

### 1.3 Where it sits in Brilliant's path
- **Brilliant puts Exponential Functions in Intermediate Algebra (grades 8 to 11) after Introduction to Functions, Linear Systems, Quadratics and Transformations**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "GR 8–9 Introduction to Functions GR 8–9 Linear Systems New GR 9 Quadratics GR 8–9 Coordinate Transformations GR 9–10 Exponential Functions"
- **Brilliant puts Logarithms in Advanced Algebra after Trigonometric Functions, Polynomials and Equations and Curves, and before Polar Coordinates and Complex Numbers**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "GR 11–12 Trigonometric Functions GR 11–12 Polynomials New GR 11–12 Equations and Curves New GR 11–12 Logarithms GR 12 Polar Coordinate Plane GR 11–12 Complex Numbers"
- **Brilliant's Exponents and Radicals (grade 8) is the course before, with prerequisites Negative Numbers and Fractions**
  - Source: Practice Exponents and Radicals | Brilliant. https://brilliant.org/courses/exponents-and-radicals
  - Quote: "Prerequisites: Negative Numbers, Fractions"
- **The address brilliant.org/courses/exponentials-logarithms/ returns the Courses list, not a course**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/exponentials-logarithms/
  - Quote: "Courses Math Basic Algebra Algebra Adv Algebra Adv Math Logic Everyday Math Math Fun CS Python Technology Data Science"

My reading: in Brilliant the exponential course is the last of the Intermediate Algebra band (after Quadratics) and
Logarithms is a late Advanced Algebra course (after Trigonometric Functions and Polynomials). The shelf's order (Dan,
10 Oct) puts both before Trigonometry, so this course is the exponential course and the logarithms course joined,
about 71 Brilliant lessons squeezed into six to eight.

---

## 2. Other courses' order for the same ground

### 2.1 Khan Academy
- **Khan Academy Algebra 2: Unit 7 Exponential models and Unit 8 Logarithms sit after rational exponents and before transformations**
  - Source: Algebra 2 | Math | Khan Academy. https://www.khanacademy.org/math/algebra2
  - Quote: "Algebra 2 12 units Unit 1 Polynomial arithmetic Unit 2 Complex numbers Unit 3 Polynomial factorization Unit 4 Polynomial division Unit 5 Polynomial graphs Unit 6 Rational exponents and radicals Unit 7 Exponential models Unit 8 Logarithms Unit 9 Transformations of functions Unit 10 Equations Unit 11 Trigonometry Unit 12 Modeling"
- **Khan Academy Unit 7 skills, in order**
  - Source: Algebra 2 | Math | Khan Academy. https://www.khanacademy.org/math/algebra2
  - Quote: "Interpret change in exponential models 81. Interpret time in exponential models 82. Construct exponential models 83. Interpret change in exponential models: with manipulation 84. Interpret change in exponential models: changing units 85. Exponential models: Unit test"
- **Khan Academy Unit 8 skills, in order, ending with exponential model word problems**
  - Source: Algebra 2 | Math | Khan Academy. https://www.khanacademy.org/math/algebra2
  - Quote: "Evaluate logarithms 88. Evaluate logarithms (advanced) 89. Relationship between exponentials & logarithms 90. Use the properties of logarithms 91. Logarithms: Quiz 1 92. Evaluate logarithms: change of base rule 93. Use the logarithm change of base rule 94. Solve exponential equations using logarithms: base-10 and base-e 95. Solve exponential equations using logarithms: base-2 and other bases 96. Exponential model word problems 97. Logarithms: Quiz 2 98. Logarithms: Unit test"
- **Khan Academy's Logarithms unit: logarithms are the inverse of exponents and solve exponential equations**
  - Source: Logarithms | Algebra 2 | Math | Khan Academy. https://www.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:exp-models
  - Quote: "Logarithms are the inverses of exponents. They allow us to solve challenging exponential equations, and they are a good excuse to dive deeper into the relationship between a function and its inverse."
- **Khan Academy Algebra 1 Unit 12 Exponential growth and decay: linear versus exponential first**
  - Source: Exponential growth & decay | Algebra 1 | Math. https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:exponential-growth-decay
  - Quote: "Exponential vs. linear growth 2. Exponential vs. linear models 3. Exponential expressions word problems (numerical) 4. Exponential expressions word problems (algebraic) 5. Interpret exponential expressions word problems 6. Exponential growth & decay: Quiz 1 7. Graphs of exponential growth 8. Exponential vs. linear growth over time 9. Exponential growth vs. decay 10. Graphing exponential growth & decay 11. Writing functions with exponential decay 12. Exponential growth & decay: Quiz 2 13. Exponential functions from tables & graphs 14. Connecting exponential graphs with contexts 15. [Linear vs. exponential growth: from data](https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:exponential-growth-decay/x2f8bb11595b61c86:exponential-vs-linear-models/e/distinguish-between-linear-and-exponential-growth-from-tables) 16. Exponential growth & decay: Quiz 3 17. Exponential growth & decay: Unit test"

My reading: Khan splits the ground across years. Algebra 1 starts with linear against exponential growth, then
graphs and writing functions from tables and graphs; Algebra 2 unit 7 builds models, unit 8 defines logarithms,
gives the properties, then the change of base rule, then uses logs to solve exponential equations (base 10 and e
first, then other bases), and ends on model word problems.

### 2.2 BBC Bitesize (Higher Maths)
- **Bitesize Higher Maths lists laws of logarithms and exponents before solving logarithmic and exponential equations**
  - Source: Algebraic and trigonometric skills - Higher Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/topics/zyjhfg8
  - Quote: "Laws of logarithms and exponents Revise what logarithms are and how to use the 'log' buttons on a scientific calculator * Solving polynomial equations The nature and co-ordinates of roots can be determined using the discriminant and solving polynomials. * Solving logarithmic and exponential equations Revise the laws of logarithms in order to solve logarithmic and exponential equations"
- **Bitesize: what logarithms are and the log buttons on a calculator come first**
  - Source: What is a logarithm / What are logarithms - Laws of logarithms and exponents - Higher Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zn3ty9q/revision/1
  - Quote: "1. What is a logarithm / What are logarithms 2. Laws of logarithms 3. Using a calculator"
- **Bitesize: the equations guide goes equations, questions, natural logarithms, graphs**
  - Source: Solving logarithmic and exponential equations. https://www.bbc.co.uk/bitesize/guides/zmj9qp3/revision/1
  - Quote: "1. Solving logarithmic and exponential equations 2. Questions 3. Natural logarithms 4. Graphs of logarithmic and exponential functions"
- **Bitesize: the calculator has log and ln keys; ln is the natural logarithm**
  - Source: Using a calculator - Laws of logarithms and exponents - Higher Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zn3ty9q/revision/3
  - Quote: "A scientific calculator has two 'log' buttons on it. These are marked log and ln . The log key is used for calculations of the form \({\log _{10}}x\). For example, to work out that \(\log 10000 = 4\) you would press \(\log 10000 =\) Using this method you should be able to find that \(\log 45 = 1.653\) The ln key is used for calculations of the form \({\log _e}x\). This is called the natural logarithm"
- **Bitesize: the base and the number must both be positive**
  - Source: What is a logarithm / What are logarithms - Laws of logarithms and exponents - Higher Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zn3ty9q/revision/1
  - Quote: "Note that both (a) and (x) must be positive."

My reading: Bitesize has a short run: what a logarithm is, the laws, the calculator keys, then solving equations,
natural logarithms and graphs. Natural logs come late and e is only "a mathematical constant"; Dan's course can bring
e in earlier because capacitors and cooling need it. Bitesize shows no named mistakes on these pages (**UNCONFIRMED**
for the rest of Bitesize).

### 2.3 SQA Higher Maths
- **Historical note: logarithms made the slide rule possible, an engineers' tool until the 1970s**
  - Source: Logarithms and Exponentials – Higher Maths. https://www.maths.scot/higher/logarithms (**SECONDARY**: revision site)
  - Quote: "The discovery of logarithms made possible the later development of the _slide rule_ , an essential engineers' calculating tool until electronic calculators took over in the 1970s."
- **SQA Higher Maths topic content: use the laws of logarithms and exponents to simplify and to solve equations**
  - Source: Logarithms and Exponentials – Higher Maths. https://www.maths.scot/higher/logarithms (**SECONDARY**: revision site)
  - Quote: "Use the laws of logarithms and exponents to: * simplify a numerical expression * solve logarithmic and exponential equations"
- **SQA Higher Maths: use a straight-line graph to confirm y = ax^b or y = ab^x, and model with logarithmic or exponential functions**
  - Source: Logarithms and Exponentials – Higher Maths. https://www.maths.scot/higher/logarithms (**SECONDARY**: revision site)
  - Quote: "Use a straight-line graph to confirm relationships of the form (y=ax^b) or (y=ab^x) * Mathematically model situations involving the logarithmic or exponential function."
- **SQA Higher Maths course specification: solving logarithmic and exponential equations using the laws**
  - Source: Higher Mathematics Course Specification. https://www.sqa.org.uk/files_ccc/h-course-spec-mathematics.pdf
  - Quote: "solving logarithmic and exponential equations  using the laws of logarithms and exponents"
- **SQA Higher Maths course specification: modelling situations with logarithmic or exponential functions**
  - Source: Higher Mathematics Course Specification. https://www.sqa.org.uk/files_ccc/h-course-spec-mathematics.pdf
  - Quote: "mathematically modelling situations involving the logarithmic or exponential function"
- **SQA Higher Maths course specification: sketching the inverse of a logarithmic or exponential function**
  - Source: Higher Mathematics Course Specification. https://www.sqa.org.uk/files_ccc/h-course-spec-mathematics.pdf
  - Quote: "sketching the inverse of a logarithmic or an exponential function"

My reading: SQA's Higher is the nearest thing to a Scottish core: the laws, solving log and exponential equations,
the two straight-line forms (log y = b log x + log a and log y = x log b + log a, found from two pairs of readings),
confirming a law with a straight-line graph, and modelling. Dan's college could use SQA HN units or Pearson's; both are in section 3.

### 2.4 HELM workbooks (Loughborough)
- **HELM Workbook 6 is Exponential and Logarithmic Functions, placed after Functions and Modelling and before Matrices**
  - Source: Helping Engineers Learn Mathematics Workbooks (HELM) | Mathematics Learning Support Centre | Loughborough University. https://www.lboro.ac.uk/departments/mlsc/student-resources/helm-workbooks/
  - Quote: "HELM 5: Functions and Modelling ‌ HELM 6: Exponential and Logarithmic Functions HELM 7: Matrices"
- **HELM Workbook 6 sections, 73 pages**
  - Source: HELM Workbook 49 Student's Guide - Loughborough University. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2049%20Student's%20Guide.pdf
  - Quote: "Workbook 6 - Exponential and Logarithmic Functions (73 pages) 6.1 The Exponential Function 6.2 The Hyperbolic Functions 6.3 Logarithms 6.4 The Logarithmic Function 6.5 Modelling Exercises 6.6 Log-linear Graphs"
- **HELM 6.3 Logarithms outcomes**
  - Source: HELM Workbook 6 Exponential and Logarithmic Functions. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%206%20Exponential%20and%20Logarithmic%20Functions.pdf
  - Quote: "invert b = a n using logarithms • simplify expressions involving logarithms • change bases in logarithms"
- **HELM 6.3: taking a logarithm reverses raising a number to a power; every law of indices has a law of logarithms**
  - Source: HELM Workbook 6 Exponential and Logarithmic Functions. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%206%20Exponential%20and%20Logarithmic%20Functions.pdf
  - Quote: "The operation of taking a logarithm essentially reverses the operation of raising a number to a power. We will formulate the basic laws satisfied by all logarithms and learn how to manipulate expressions involving logarithms. We shall see that to every law of indices there is an equivalent law of logarithms."
- **HELM: exponential growth is very rapid (contrast with the claim that exponential growth is not always fast)**
  - Source: 66. https://www.mas.ncl.ac.uk/ask/numeracy-maths-statistics/images/Exponential_function.pdf (**SECONDARY**: university copy of HELM Workbook 6)
  - Quote: "Exponential growth is very rapid and similarly exponential decay is also very rapid."

My reading: HELM 6 is 73 pages in six sections: the exponential function (e, growth, decay), the hyperbolic
functions (not on the shelf; cosh and sinh are in Pearson's function list but are not part of this course),
logarithms, the logarithmic function, modelling (growth and decay, linearising, decay to a limit, inverse square
law) and log-linear graphs. The modelling section is the closest match for the engineering use here. HELM says
"Exponential growth is very rapid", while a PLOS ONE paper lists "exponential growth is always very fast" among three
popular misconceptions (6.3). The brief should teach that as a contested point: show e^x beating any power of x, and also
a slow exponential (9 percent a day) that looks harmless at first.

### 2.5 Bird's Engineering Mathematics
- **Bird's Engineering Mathematics (9th ed): Logarithms and Exponential functions sit in Number and algebra, with reduction of non-linear laws and log-scale graphs in the Graphs section**
  - Source: Bird's Engineering Mathematics - 9th Edition - John Bird - Routledge B. https://www.routledge.com/Birds-Engineering-Mathematics/Bird/p/book/9780367643782
  - Quote: "13. Logarithms 14. Exponential functions 15. Number sequences"
- **Bird's Engineering Mathematics: Graphs section**
  - Source: Bird's Engineering Mathematics - 9th Edition - John Bird - Routledge B. https://www.routledge.com/Birds-Engineering-Mathematics/Bird/p/book/9780367643782
  - Quote: "27. Straight line graphs 28. Reduction of non-linear laws to linear form 29. Graphs with logarithmic scales"
- **Bird's Higher Engineering Mathematics: logarithms and exponentials chapters, section by section**
  - Source: Bird’s Higher Engineering Mathematics; Ninth Edition. https://api.pageplace.de/preview/DT0400.9781000353037_A40491166/preview-9781000353037_A40491166.pdf (**SECONDARY**: publisher preview of the book)
  - Quote: "3 Logarithms 24 3.1 Introduction to logarithms 24 3.2 Laws of logarithms 26 3.3 Indicial equations 28 3.4 Graphs of logarithmic functions 30 4 Exponential functions 32 4.1 Introduction to exponential functions 32 4.2 The power series for _e_ _x_ 33 4.3 Graphs of exponential functions 35 4.4 Napierian logarithms 36 4.5 Laws of growth and decay 40 4.6 Reduction of exponential laws to linear form 43"
- **Bird's Basic Engineering Mathematics: chapter page counts for Logarithms (8) and Exponential functions (14)**
  - Source: Bird's Basic Engineering Mathematics | John Bird | Taylor & Francis eB. https://www.taylorfrancis.com/books/mono/10.1201/9781003124214/bird-basic-engineering-mathematics-john-bird
  - Quote: "Chapter 15 | 8 pages Logarithms Title Abstract Get Access chapter Chapter 16 | 14 pages Exponential functions"
- **Bird's Basic Engineering Mathematics: Graphs reducing non-linear laws to linear form is chapter 18, nine pages**
  - Source: Bird's Basic Engineering Mathematics | John Bird | Taylor & Francis eB. https://www.taylorfrancis.com/books/mono/10.1201/9781003124214/bird-basic-engineering-mathematics-john-bird
  - Quote: "Chapter 18 | 9 pages Graphs reducing non-linear laws to linear form Title Abstract Get Access chapter Chapter 19 | 9 pages Graphical solution of"
- **Bird's Basic Engineering Mathematics: Graphs with logarithmic scales is chapter 20, ten pages**
  - Source: Bird's Basic Engineering Mathematics | John Bird | Taylor & Francis eB. https://www.taylorfrancis.com/books/mono/10.1201/9781003124214/bird-basic-engineering-mathematics-john-bird
  - Quote: "Chapter 20 | 10 pages #### Graphs with logarithmic scales"

My reading: Bird puts logarithms (8 pages in the Basic book) then exponential functions (14) in the algebra part,
and non-linear laws (9) and log scales (10) in the graphs part after straight-line graphs (20). That fits Dan's order:
straight-line graphs are already behind him, so linearising a curve can come late and reuse them. Bird's exponential
chapter has e's power series, Napierian logarithms, laws of growth and decay, and reduction to linear form.

---

## 3. What a marine engineering HNC actually uses of this topic

### 3.1 SQA HN Engineering Mathematics 1 (H7K0 33, SCQF level 6)
- **SQA Engineering Mathematics 1 (HN, SCQF 6) aim names exponential and logarithmic functions**
  - Source: Engineering Mathematics 1 (SCQF level 6) Unit code: H7K0 33. https://www.sqa.org.uk/files/hn/H7K033.pdf
  - Quote: "The Unit provides learners with opportunities to develop knowledge, understanding and skills to solve mathematical problems including polynomial, trigonometrical, exponential and logarithmic functions."
- **SQA HN Outcome 2: exponential and logarithmic equations, knowledge and skills**
  - Source: Engineering Mathematics 1 (SCQF level 6) Unit code: H7K0 33. https://www.sqa.org.uk/files/hn/H7K033.pdf
  - Quote: "Solve problems involving exponential and logarithmic equations. Knowledge and/or Skills  Evaluation of logarithmic and exponential expressions  Transposition from logarithmic to exponential form and vice versa  Laws of logarithms  Graphics of logarithmic and exponential functions"
- **SQA HN support notes: Outcome 2 is 8 hours and covers the three laws**
  - Source: Engineering Mathematics 1 (SCQF level 6) Unit code: H7K0 33. https://www.sqa.org.uk/files/hn/H7K033.pdf
  - Quote: "Outcome 2 (8 hours) Transpose and solve exponential and logarithmic equations"
- **SQA HN support notes: introduce and solve with the three laws of logarithms**
  - Source: Engineering Mathematics 1 (SCQF level 6) Unit code: H7K0 33. https://www.sqa.org.uk/files/hn/H7K033.pdf
  - Quote: "Introduce the three laws of logarithms  Solve problems involving the three laws of logarithms"
- **SQA HN evidence: transpose between exponential and logarithmic form**
  - Source: Engineering Mathematics 1 (SCQF level 6) Unit code: H7K0 33. https://www.sqa.org.uk/files/hn/H7K033.pdf
  - Quote: "Transpose expressions from exponential form to logarithmic form and vice versa"
- **SQA HN support notes: transpose and evaluate expressions from Engineering that include the term Ae^kt (formula garbled in the tool text)**
  - Source: Engineering Mathematics 1 (SCQF level 6) Unit code: H7K0 33. https://www.sqa.org.uk/files/hn/H7K033.pdf
  - Quote: "Transpose and evaluate expressions from Engineering which include the term kt Ae"

My reading: a whole Outcome of the unit, 8 hours, is exponential and logarithmic equations. The skills list is short:
evaluate, move between log and exponential form, the three laws, the graphs. Engineering enters in the support note
"Transpose and evaluate expressions from Engineering which include the term ..." (the tool returned the formula garbled
as "kt Ae"; the sense is Ae^kt or Ae^−kt). **UNCONFIRMED:** the exact form of that formula.

### 3.2 Pearson BTEC HN Unit 4002 Engineering Maths
- **Pearson HN (2017 spec) Unit 2 Engineering Maths essential content names the function families**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf (**SECONDARY**: college copy of Pearson spec, Issue 5, 2017)
  - Quote: "Exponential, logarithmic, circular and hyperbolic functions"
- **Pearson HN (2017 spec) pass criterion P3**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf (**SECONDARY**: college copy of Pearson spec, Issue 5, 2017)
  - Quote: "P3 Determine solutions of equations using exponential, trigonometric and hyperbolic functions"
- **Pearson HN (2017 spec) lists exponential growth and decay under integral calculus and a merit criterion on it**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf (**SECONDARY**: college copy of Pearson spec, Issue 5, 2017)
  - Quote: "M4 Formulate predictions of exponential growth and decay models using integration methods"
- **Pearson HN Unit 4002 Engineering Mathematics (2024 descriptor) pass criterion P3 names logarithmic functions**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "P3 Determine solutions of engineering equations using exponential, logarithmic, trigonometric, and hyperbolic functions."
- **Pearson 4002 is a core mandatory 15-credit Level 4 unit**
  - Source: Higher Nationals - Pearson qualifications. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/specification/9781292448473-btec-hn-l4-l5-engin-engl-iss1.pdf
  - Quote: "Core Mandatory Unit 4002: Engineering Maths 15 4"

My reading: the 2017 issue (Issue 5, hosted by University Centre Weston, so **SECONDARY** for that copy) lists
"Exponential, logarithmic, circular and hyperbolic functions" and the pass criterion about solving engineering
equations with them; the 2024 descriptor (Issue 6, Pearson's own PDF) keeps the criterion and adds "logarithmic" to it.
I did not see the 2024 Essential Content lines for the unit (**UNCONFIRMED**). A merit criterion also asks for
predictions from exponential growth and decay models using integration, so the college meets the topic twice: once as
functions and once as a calculus model.

### 3.3 MCA engineer officer syllabuses (Mathematics, General Engineering Science, Applied Heat, Electro-Technology)
The MCA does not publish a page called "Applied Mathematics". The maths paper is the "Mathematics Written Examination
Syllabus" (Second Engineer), and the restricted certificates use General Engineering Science (GES) I and II. The 2015
regulations name the six HN subjects as Mathematics, Engineering Drawing, Applied Mechanics, Applied Heat,
Electrotechnology and Naval architecture.

- **MCA Second Engineer Mathematics 3.1: logarithms, laws, base of natural logarithms, assumed knowledge**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "3.1 Uses logarithms to under take simple calculations (not directly examinable but such knowledge will be assumed) 1. Defines logarithms. 2. States laws of logarithms. 3. Uses laws of logarithms to evaluate powers etc. 4. States base of natural logarithms. 5. Evaluates expressions involving natural logarithms."
- **MCA Mathematics 4.1.11: solves graphically problems of the form pV^n = C where n is unknown**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "Solves graphically problems of the form pV n = C, where n is unknown."
- **MCA Mathematics 4.1: writes y = aX^2 + b in straight-line form**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "Writes the equation y = aX ² + b in the form of a straight line."
- **MCA Mathematics 7.1.9: states the derivatives for sin x, cos x and ln x**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "States the derivatives for sinx, cosx and lnx."
- **MCA Mathematics 8.1.12: derives the area under the curve given by pV^n = C**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "Derives expressions for the area under the curve, given by pV n = C."
- **MCA Applied Heat 4.2: defines isothermal, adiabatic and polytropic operations and states the work done for each**
  - Source: Applied Heat Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-heat-written-examination-syllabus
  - Quote: "Defines: 1. an Isothermal operation; 2. an Adiabatic operation; 3. a Polytropic operation."
- **MCA Applied Heat 4.2.7: expressions for the work done in isothermal, adiabatic and polytropic non-flow processes**
  - Source: Applied Heat Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-heat-written-examination-syllabus
  - Quote: "States expressions for the work done during isothermal, adiabatic and polytropic non-flow processes."
- **MCA Applied Heat 4.2.6: the area of the pV diagram represents work done**
  - Source: Applied Heat Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-heat-written-examination-syllabus
  - Quote: "Shows that the area of the pV diagram represents W.D. during the operation."
- **MCA Marine Electro-Technology 1.1.3: describes resistance, inductance and capacitance (no time-constant line was seen)**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Describes resistance, inductance and capacitance in terms of physical dimensions and materials."
- **SQA and MCA second engineer academic exams include Mathematics, Applied Mechanics, Applied Heat and Electro Technology**
  - Source: The Merchant Shipping (Standards of Training, Certification and Watchkeeping) Regulations 2015. https://www.legislation.gov.uk/uksi/2015/782/pdfs/uksiod_20150782_en.pdf
  - Quote: "Second Engineer: Mathematics, Applied Mechanics, Applied Heat, Engineering Drawing, Electro Technology and Naval Architecture."
- **MCA GES I mathematics stops at indices (no logarithms line in its algebra rules)**
  - Source: General Engineering Science I Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses
  - Quote: "1.2 The rules of algebra 1. Solve problems related to addition, subtraction and product of positive and negative numbers. 2. Solve problems related to addition, subtraction and product of indices, including fractional indices. 3. Solve problems involving quadratic function divided by linear factor."
- **MCA Applied Heat has a Gas laws and displacement work section and an Air compressors section**
  - Source: Applied Heat Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-heat-written-examination-syllabus
  - Quote: "4. 4. Gas laws, displacement work 5. 5. Ideal Cycles and I.C. engines 6. 6. Air compressors"
- **MCA route: HNC/HND holders with Mathematics, Applied Mechanics, Applied Heat, Electrotechnology among the six subjects**
  - Source: The Merchant Shipping (Standards of Training, Certification and Watchkeeping) Regulations 2015. https://www.legislation.gov.uk/uksi/2015/782/pdfs/uksiod_20150782_en.pdf
  - Quote: "covers four of the following 6 subjects: Mathematics, Engineering Drawing, Applied Mechanics, Applied Heat, Electrotechnology and Naval"

My reading, the strongest lines for this course: (1) MCA Mathematics 3.1 treats logarithms as **assumed knowledge**,
"not directly examinable", with the laws and the base of natural logarithms; (2) 4.1.11, "Solves graphically
problems of the form pV n = C, where n is unknown", which needs a log graph; (3) 8.1.12, the area under pV^n = C,
whose n = 1 case is the integral of 1/V, a natural logarithm (Calculus fundamentals lesson 9 stops at n not equal
to 1); (4) Applied Heat 4.2, which asks for the work done in isothermal, adiabatic and polytropic operations.
GES I's mathematics list stops at indices (no logarithms line in what I saw). **UNCONFIRMED:** I found no MCA or HN line for Newton's law of cooling
or for the RC time constant; the Marine Electro-Technology excerpts I could see list capacitance "in terms of physical
dimensions and materials" and sinusoidal supplies, not charging curves. The capacitor and cooling examples are
therefore taught as applications (section 7), not as syllabus lines.

---

## 4. The scope to cover, and what research says about each part

### 4.1 Growth by multiplying rather than adding
- **Growth by multiplying: splitting is a multiplicative operation that is not repeated addition (Confrey and Smith)**
  - Source: Splitting, Covariation, and Their Role in the Development of Exponential Functions in: Journal for Research in Mathematics Education Volume 26 Issue 1 (1995). https://pubs.nctm.org/downloadpdf/journals/jrme/26/1/article-p66.pdf
  - Quote: "This approach is based on a primitive multiplicative operation labeled “splitting” that is not repeated addition."
- **Confrey and Smith: exponentials are usually taught as formulas and routine algorithms**
  - Source: Splitting, Covariation, and Their Role in the Development of Exponential Functions in: Journal for Research in Mathematics Education Volume 26 Issue 1 (1995). https://pubs.nctm.org/downloadpdf/journals/jrme/26/1/article-p66.pdf
  - Quote: "Exponential and logarithmic functions are typically presented as formulas with which students learn to associate the rules for exponents/logarithms, a particular algebraic form, and routine algorithms."
- **Ellis et al.: coordinating multiplicative growth in the output with additive steps in the input, tables with a ratio per step**
  - Source: CORRESPONDENCE AND COVARIATION: QUANTITIES CHANGING TOGETHER Amy B. Ellis Zekiye Ozgur Torrey Kulow U. of Wisconsin-Madison zekiyeozgur@gmail.com U. of Wisconsin-Madison. https://files.eric.ed.gov/fulltext/ED584480.pdf
  - Quote: "Eventually Uditi began to formally coordinate the multiplicative growth in inches with the additive growth in weeks."

My reading: Confrey and Smith's "splitting" (replace one thing with a fixed number of copies) and Ellis et al.'s
tables (a fixed ratio in the output for each equal step in the input) are the research basis for starting with a
doubling table, not with a formula.

### 4.2 Exponential functions and their graphs
- **Exponential function to base a, a > 0; graphs pass through (0, 1) and (1, a)**
  - Source: Exponentials & Logs - Higher Mathematics. https://www.highermathematics.co.uk/exponentials-logs (**SECONDARY**: revision site)
  - Quote: "The graphs always passes through (0, 1) and (1, a)"
- **HELM 6.1 outcomes: exponential growth and decay**
  - Source: HELM Workbook 6 Exponential and Logarithmic Functions. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%206%20Exponential%20and%20Logarithmic%20Functions.pdf
  - Quote: "understand the terms exponential growth and exponential decay"
- **HELM: the growth of a^x as x increases is called exponential growth**
  - Source: 66. https://www.mas.ncl.ac.uk/ask/numeracy-maths-statistics/images/Exponential_function.pdf (**SECONDARY**: university copy of HELM Workbook 6)
  - Quote: "The growth of a x as x increases is called exponential growth ."

My reading: the graph of a^x passes through (0, 1) and (1, a); a > 1 is growth, 0 < a < 1 decay. Dan has shifting and
flipping from Functions lesson 5 and 6, which turns e^(−t) into V(1 − e^(−t/RC)) (flip, then lift).

### 4.3 The number e and why it appears
- **OpenStax: in exponential growth the rate of growth is proportional to the current value**
  - Source: 6.8 Exponential Growth and Decay - Calculus Volume 1 | OpenStax. https://openstax.org/books/calculus-volume-1/pages/6-8-exponential-growth-and-decay
  - Quote: "That is, the rate of growth is proportional to the current function value."
- **OpenStax: continuous compounding, and the number written as a limit, gives an exponential growth function**
  - Source: 6.8 Exponential Growth and Decay - Calculus Volume 1 | OpenStax. https://openstax.org/books/calculus-volume-1/pages/6-8-exponential-growth-and-decay
  - Quote: "If we extend this concept, so that the interest is compounded continuously, after years we have Now let’s manipulate this expression so that we have an exponential growth function. Recall that the number can be expressed as a limit:"
- **In an exponential function the rate of change is proportional to the value; for e^x the constant of proportionality is 1**
  - Source: Exponential Growth: Surprisingly Flexible – The Math Doctors. https://www.themathdoctors.org/exponential-growth-surprisingly-flexible (**SECONDARY**: forum answer)
  - Quote: "In an exponential function, the rate of change is proportional to the value of the function itself; in the case of f(x) = e x , the constant of proportionality is 1 . That’s the sense in which e can be compared to the number 1."
- **Euler's number is the base of the natural logarithm and part of continuous growth and decay**
  - Source: Euler’s Number Explained: Its Significance and Applications. https://www.datacamp.com/tutorial/eulers-number (**SECONDARY**: tutorial site)
  - Quote: "Euler’s number is a mathematical constant approximately equal to 2.71828. It is the base of the natural logarithm and a critical part of continuous growth and decay calculations."
- **HELM: the most important exponential has base e, and why it matters becomes clear later**
  - Source: 66. https://www.mas.ncl.ac.uk/ask/numeracy-maths-statistics/images/Exponential_function.pdf (**SECONDARY**: university copy of HELM Workbook 6)
  - Quote: "The most important and widely used exponential function has the particular base e = 2 _._ 7182818 _. . ._ . It will not be clear to the reader why this particular value is so important."
- **HELM: e is as important as pi and is also irrational**
  - Source: 66. https://www.mas.ncl.ac.uk/ask/numeracy-maths-statistics/images/Exponential_function.pdf (**SECONDARY**: university copy of HELM Workbook 6)
  - Quote: "The number e is as important as the number π and, like π , is also irrational."

My reading: two honest routes to e. (1) Compounding more and more often, the limit that OpenStax and HELM state
(the limit (1 + 1/n)^n as n grows; the formula came back missing or garbled in the tool text, so it is not quoted). (2) The rate of change is
proportional to the amount, and e^x is the one whose proportionality constant is 1 (the Math Doctors answer, **SECONDARY**,
and the Colorado text in 4.13). HELM's own words, "It will not be clear to the reader why this particular value is so
important", are a good reason to show the first route with numbers and leave the second as a preview.

### 4.4 Exponential decay, the time constant, a capacitor charging and discharging
- **V = emf(1 − e^(−t/RC)) for charging, with e the base of the natural logarithm**
  - Source: DC Circuits Containing Resistors and Capacitors | Physics II. https://courses.lumenlearning.com/atd-austincc-physics2/chapter/21-6-dc-circuits-containing-resistors-and-capacitors/ (**SECONDARY**: republishes OpenStax)
  - Quote: "V = emf(1 − e − t/RC ) (charging), where V is the voltage across the capacitor, emf is equal to the emf of the DC voltage source, and the exponential e = 2.718 … is the base of the natural logarithm."
- **RC is the time for the charge to drop to 1/e; RC has dimensions of time**
  - Source: 5. Charging and discharging of a capacitor. https://physics.iitd.ac.in/uploads/manual_leiBQt035s.pdf
  - Quote: "RC is the time during which the charge on the capacitor drops to 1/e of the initial value. Further, since RC has dimensions of time, it is called the time constant of the circuit."
- **Plot log(V0 − V) against t: a straight line whose slope gives −1/RC**
  - Source: 5. Charging and discharging of a capacitor. https://physics.iitd.ac.in/uploads/manual_leiBQt035s.pdf
  - Quote: "you may plot log( V o − V ) against t to verify the Eq. 5.5 and the exponential nature of charging of the capacitor. You ought to get a straight line whose slope would give you the value of -1/RC"
- **Time constant: the time to change by a factor of e in charging and discharging**
  - Source: Lesson 17: Ch. 27 (4) – RC Circuits. https://www.usna.edu/Users/physics/sgregory/Documents/SP212/lesson17.pdf
  - Quote: "It is the time it takes for the system to change by a factor of e in both charging and discharging functions."
- **One full time constant is when the charge reaches 63 percent of its maximum (0.63Vs)**
  - Source: RC Charging Circuit Tutorial & RC Time Constant. https://www.electronics-tutorials.ws/rc/rc_1.html (**SECONDARY**: trade tutorial site)
  - Quote: "The actual time taken for the charge on the plates of the capacitor to reach 63% of its maximum possible fully charged voltage, in our curve 0.63Vs, being known as one full Time Constant, (T)."
- **The charging curve is exponential and not linear; the capacitor never reaches 100 percent; after 5T it reaches 99.3 percent and is treated as full**
  - Source: RC Charging Circuit Tutorial & RC Time Constant. https://www.electronics-tutorials.ws/rc/rc_1.html (**SECONDARY**: trade tutorial site)
  - Quote: "Notice that the charging curve for a RC charging circuit is exponential and not linear. This means that in reality the capacitor never reaches 100% fully charged. So for all practical purposes, after five time constants (5T) it reaches 99.3% charge, so at this point the capacitor is considered to be fully charged."
- **Worked example: Vc = V(1 - e^(-t/RC)) gives 4.4 volts after 100 s when RC = 47 s**
  - Source: RC Charging Circuit Tutorial & RC Time Constant. https://www.electronics-tutorials.ws/rc/rc_1.html (**SECONDARY**: trade tutorial site)
  - Quote: "The voltage formula is given as Vc = V(1 – e (-t/RC) ) so this becomes: Vc = 5(1 – e (-100/47) ) Where: V = 5 volts, t = 100 seconds, and RC = 47 seconds from above. Therefore, Vc = 5(1 – e (-100/47) ) = 5(1 – e -2.1277 ) = 5(1 – 0.1191) = 4.4 volts"
- **About 5 time constants for a capacitor to charge, a convention**
  - Source: RC Charging Circuit Tutorial & RC Time Constant. https://www.electronics-tutorials.ws/rc/rc_1.html (**SECONDARY**: trade tutorial site)
  - Quote: "The time required for the capacitor to be fully charge is equivalent to about 5 time constants or 5T."
- **Discharging: in the first time constant the voltage falls to 0.368 of its initial value, V = V0 e^-1**
  - Source: DC Circuits Containing Resistors and Capacitors | Physics II. https://courses.lumenlearning.com/atd-austincc-physics2/chapter/21-6-dc-circuits-containing-resistors-and-capacitors/ (**SECONDARY**: republishes OpenStax)
  - Quote: "In the first time interval τ = RC after the switch is closed, the voltage falls to 0.368 of its initial value, since V = V ₀ ⋅ e −1 = 0.368 V ₀ ."
- **The final value is never reached, but 0.632 of the remainder is achieved in every time constant**
  - Source: DC Circuits Containing Resistors and Capacitors | Physics II. https://courses.lumenlearning.com/atd-austincc-physics2/chapter/21-6-dc-circuits-containing-resistors-and-capacitors/ (**SECONDARY**: republishes OpenStax)
  - Quote: "It is a characteristic of the exponential function that the final value is never reached, but 0.632 of the remainder to that value is achieved in every time, τ ."
- **OpenStax: charging through a resistor, the exponential is e = 2.718... and every time constant brings 0.632 of what remains**
  - Source: 21.6 DC Circuits Containing Resistors and Capacitors - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/21-6-dc-circuits-containing-resistors-and-capacitors
  - Quote: "It is a characteristic of the exponential function that the final value is never reached, but 0.632 of the remainder to that value is achieved in every time"
- **After 4 time constants the capacitor is virtually fully charged (98 percent); 5T is the steady state boundary by convention**
  - Source: RC Charging Circuit Tutorial & RC Time Constant. https://www.electronics-tutorials.ws/rc/rc_1.html (**SECONDARY**: trade tutorial site)
  - Quote: "After a period equivalent to 4 time constants, ( 4T ) the capacitor in this RC charging circuit is said to be virtually fully charged as the voltage developed across the capacitors plates has now reached 98% of its maximum value, 0.98Vs."

My reading: three numbers carry the whole picture. After 1 time constant a charging capacitor is at 63.2 percent, after
5 at 99.3 percent (the tutorial, **SECONDARY** trade site; the values follow from 1 − e^(−n), so I computed the in-between ones myself). "Five time constants is full" is a **convention**, not a law: the same page calls 4T "virtually fully
charged" at 98 percent, then 5T "fully charged", and notes the capacitor never reaches 100 percent. Teach it as a convention: a number shown with its
rule, the pictured curve, and a "never exactly" line. The straight-line check (plot log(V0 − V) against t, slope −1/RC)
is a clean tie to log graphs.

### 4.5 Newton's law of cooling
- **Newton's law of cooling: rate proportional to the temperature difference with the surroundings**
  - Source: Newton's Law of Cooling. https://www.math.uwaterloo.ca/~baforres/UCM138/Lectures/Chapter4/SLIDESNewtonsLaw.pdf
  - Quote: "Newton’s law of cooling states that an object will cool (or warm) at a rate that is proportional to the difference between the temperature of the object and the ambient temperature T a of its surroundings."
- **The solution is an exponential decrease of temperature difference over time**
  - Source: Newton's law of cooling - Wikipedia. https://en.wikipedia.org/wiki/Newton's_law_of_cooling (**SECONDARY**: encyclopedia)
  - Quote: "The solution to that equation describes an exponential decrease of temperature-difference over time."
- **Limit of the law: thermal radiation follows it only for very small temperature differences**
  - Source: Newton's law of cooling - Wikipedia. https://en.wikipedia.org/wiki/Newton's_law_of_cooling (**SECONDARY**: encyclopedia)
  - Quote: "Newton's law of cooling holds only for very small temperature differences."

My reading: the law is exponential decay of the **difference** from the surroundings, T = T_env + (T0 − T_env)e^(−t/τ),
which is the discharging curve lifted by a constant. Wikipedia's limit (radiation needs only small differences)
should be said on the screen. No marine syllabus line for it was found (**UNCONFIRMED**); Bird's Higher book has a
cooling steel bar as a worked example (7.4), which is the best engineering-text source I could reach.

### 4.6 Logarithms as the power you need (the inverse of the exponential)
- **Logarithm as the power: log of 2 and 8 gives 3**
  - Source: Working with Exponents and Logarithms. https://www.mathsisfun.com/algebra/exponents-logarithms.html (**SECONDARY**: maths site)
  - Quote: "The Exponent takes 2 and 3 and gives 8 (2, used 3 times in a multiplication, makes 8)"
- **A logarithm is the inverse of the exponential function, the power to which the base must be raised**
  - Source: Logarithms | Brilliant Math & Science Wiki. https://brilliant.org/wiki/logarithms
  - Quote: "A logarithm is the inverse of the exponential function . Specifically, a logarithm is the power to which a number (the base) must be raised to produce a given number."
- **Khan Academy: the product rule says the log of a product is the sum of the logs of its factors**
  - Source: Intro to logarithm properties (article) | Khan Academy. https://www.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:log-prop/a/properties-of-logarithms
  - Quote: "This property says that the logarithm of a product is the sum of the logs of its factors."
- **Khan Academy: combining logs needs the same base**
  - Source: Intro to logarithm properties (article) | Khan Academy. https://www.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:log-prop/a/properties-of-logarithms
  - Quote: "the bases of all the logarithms in the expression must be the same"

My reading: say it as a question ("what power of 2 makes 8?"), then name it. Brilliant starts with "Counting Days";
Khan and Bitesize start with the definition. The log of a product as a sum of logs is the whole point of tables and the
slide rule (2.3 historical note), which is the best way to earn the laws before stating them.

### 4.7 The log laws
- **HELM table of rules for base e: ln(xy) = ln x + ln y, ln(x/y), ln(x^y) = y ln x, ln(e^x) = x, ln e = 1, ln 1 = 0**
  - Source: Modelling Exercises. https://sheffield.ac.uk/media/31957/download?attachment (**SECONDARY**: university copy of HELM Workbook 6 sections)
  - Quote: "ln( xy ) = ln( x ) + ln( y ) 1b e x × e y = e x + y 2a ln( x/y ) = ln( x ) − ln( y ) 2b e x / e y = e x − y 3a ln( x y ) = y ln( x ) 3b ( e x ) y = e xy 4a ln( e x ) = x 4b e ln( x ) = x 5a ln( e ) = 1 5b e ¹ = e 6a ln(1) = 0"

My reading: three laws plus log 1 = 0 and log a = 1 (Bitesize, SQA, HELM, OCR all agree on the same list). The HELM rule
table pairs each law with the index law it comes from (1a with 1b, and so on). Chua and Wood warn against the memory phrases
"times means add" (6.2).

### 4.8 Solving exponential equations with logs
- **HELM: the natural logarithm undoes the exponential, so ln(e^0.1t) = 0.1t**
  - Source: Modelling Exercises. https://sheffield.ac.uk/media/31957/download?attachment (**SECONDARY**: university copy of HELM Workbook 6 sections)
  - Quote: "The natural logarithmic functions ‘undoes’ the exponential function"
- **HELM: to undo an exponential, take the natural logarithm of both sides**
  - Source: Modelling Exercises. https://sheffield.ac.uk/media/31957/download?attachment (**SECONDARY**: university copy of HELM Workbook 6 sections)
  - Quote: "We take the natural logarithm ( ln ) of both sides, which means logarithm to the base e"

My reading: the steps are rearrange so the power is alone, take logs of both sides (same base both sides), use the power law
to bring the exponent down, divide. The common errors are in 6.5.

### 4.9 Natural logs
- **Bitesize: ln is the natural logarithm log base e**
  - Source: Using a calculator - Laws of logarithms and exponents - Higher Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zn3ty9q/revision/3
  - Quote: "This is called the natural logarithm . In mathematics the natural logarithm \({\log _e}x\) is usually written as \(\ln x\). Like \(\pi\), \(e\) is a mathematical constant and has many applications in mathematics, particularly with logs."

### 4.10 Decibels
- **Decibel: one tenth of a bel, the decimal logarithm of a power ratio**
  - Source: Use of the decibel and the neper in telecommunications - ITU. https://www.itu.int/dms_pubrec/itu-r/rec/v/R-REC-V.574-5-201508-I!!PDF-E.pdf
  - Quote: "The bel (symbol B) expresses the ratio of two powers by the decimal logarithm of this ratio. This unit is not often used, having been replaced by the decibel (symbol dB) which is one-tenth of a bel."
- **Decibel for a squared quantity uses 20 times the common logarithm**
  - Source: Decibel (dB) | Definition, Formula, & Facts | Britannica. https://www.britannica.com/science/decibel
  - Quote: "In cases where the ratio is of a squared quantity, 1 dB equals 20 times the common logarithm of the ratio."
- **Decibels as a logarithmic unit for very big ratios (10 log P2/P1: 2x is 3 dB, 10x is 10 dB, a million times is 60 dB)**
  - Source: What is a decibel?. https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7BA5ECFCAC-A2A4-4865-B2B9-6D837AE42ADB%7D (**SECONDARY**: copy of a UNSW page on a state agency site)
  - Quote: "If the second produces twice as much power than the first, the difference in dB is 10 log (P2/P1) = 10 log 2 = 3 dB. If the second had 10 times the power of the first, the difference in dB would be 10 log (P2/P1)= 10 log 10 = 10 dB."
- **Decibel: 10 times the common log of the power ratio; doubling is a little more than 3 dB**
  - Source: Decibel (dB) | Definition, Formula, & Facts | Britannica. https://www.britannica.com/science/decibel
  - Quote: "One decibel (0.1 bel) equals 10 times the common logarithm of the power ratio. Expressed as a formula, the intensity of a sound in decibels is 10 log 10 ( S 1 / S 2 ), where S 1 and S 2 are the intensity of the two sounds; i.e., doubling the intensity of a sound means an increase of a little more than 3 dB"
- **UNSW text: a 10 dB rise is approximately a perceived doubling of loudness (a copy on a state agency site)**
  - Source: What is a decibel?. https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7BA5ECFCAC-A2A4-4865-B2B9-6D837AE42ADB%7D (**SECONDARY**: copy of a UNSW page on a state agency site)
  - Quote: "Experimentally it was found that a 10 dB increase in sound level corresponds approximately to a perceived doubling of loudness"

My reading: the decibel is 10 log of a **power** ratio; for voltage or pressure the factor is 20. Doubling the power is
3 dB, ten times is 10 dB. "A 10 dB rise is a doubling of loudness" is a perception rule: the UNSW text (copy on a New
York state agency site, **SECONDARY**) says "approximately a perceived doubling". Teach it as perception, not as a law of physics. Brilliant's Logarithms has no decibel lesson.

### 4.11 Reducing a curved law to a straight line with log graphs
- **HELM: plot ln of population against time; points should lie on or near a straight line if exponential**
  - Source: Modelling Exercises. https://sheffield.ac.uk/media/31957/download?attachment (**SECONDARY**: university copy of HELM Workbook 6 sections)
  - Quote: "plot the natural logarithm of population against time. If the exponential function is appropriate, the resulting data points should lie on or near a straight line."
- **HELM: log-linear paper, each cycle a factor of 10; the axis values are the logarithms**
  - Source: Log-linear Graphs. https://sheffield.ac.uk/media/31958/download?attachment (**SECONDARY**: university copy of HELM Workbook 6 sections)
  - Quote: "On completion you should be able to . . . • decide when to use log-linear graph paper • use log-linear graph paper to analyse functions of the form y = ka px"
- **HELM: plot log P against log r to test an inverse square law; check the slope is near 2**
  - Source: Modelling Exercises. https://sheffield.ac.uk/media/31957/download?attachment (**SECONDARY**: university copy of HELM Workbook 6 sections)
  - Quote: "plot log( P ) against log( r ) (or plot the ‘raw’ data on log-log axes) and check (a) how close the resulting graph is to that of a straight line (b) how close the slope is to 2."
- **HELM: taking logs of P = A / r^n gives log P = log A - n log r, so the slope is -n**
  - Source: Modelling Exercises. https://sheffield.ac.uk/media/31957/download?attachment (**SECONDARY**: university copy of HELM Workbook 6 sections)
  - Quote: "Taking logarithms of the equation P = A r n gives log( P ) = log( A )"
- **OCR spec 1.06h: use logarithmic graphs to estimate parameters in y = ax^n and y = kb^x**
  - Source: Cambridge OCR Level 3 Advanced GCE in Mathematics A H240 Specification. https://www.ocr.org.uk/Images/308723-specification-accredited-a-level-gce-mathematics-a-h240.pdf
  - Quote: "Be able to use logarithmic graphs to estimate parameters in relationships of the form y = ax n and y = kb x , given data for x and y"
- **OCR spec 1.06h: reduce to linear form and estimate a and n, or k and b**
  - Source: Cambridge OCR Level 3 Advanced GCE in Mathematics A H240 Specification. https://www.ocr.org.uk/Images/308723-specification-accredited-a-level-gce-mathematics-a-h240.pdf
  - Quote: "Learners should be able to reduce equations of these forms to a linear form and hence estimate values of_ _a_ _and_ _n_ _, or_ _k_ _and_ _b_ _by drawing graphs using given experimental data and using appropriate calculator functions."
- **Bird: log-log graph paper has scale markings proportional to the logarithms of the numbers**
  - Source: Bird’s Higher Engineering Mathematics; Ninth Edition. https://api.pageplace.de/preview/DT0400.9781000353037_A40491166/preview-9781000353037_A40491166.pdf (**SECONDARY**: publisher preview of the book)
  - Quote: "Graph paper is available where the scale markings along the horizontal and vertical axes are proportional to the logarithms of the numbers. Such graph paper is called log-log graph paper"

My reading: two forms only. y = a bˣ (or a e^(kx)): plot log y against x, the gradient is log b and the intercept log a.
y = a xⁿ: plot log y against log x, the gradient is n. The MCA version is pVⁿ = C with n unknown: log p = log C − n log V,
slope −n. This continues Straight-line graphs lessons 5 and 6 (laws from readings, fitting a line), which left it here.

### 4.12 The isothermal case n = 1 of pVⁿ = C, W = pV ln(V₂/V₁)
- **A polytropic process is pV^n = constant; n = 1 for an ideal gas is isothermal**
  - Source: Polytropic Processes - Purdue Engineering. https://engineering.purdue.edu/~wassgren/teaching/ME20000/NotesAndReading/Lec12_LectureNotes.pdf
  - Quote: "A polytropic process is one in which pV n = constant, where n is a constant. • if n = 0, then the process is isobaric • if n = ±∞, then the process is isometric • if n = 1 and the gas is ideal, then the process is isothermal"
- **Work for polytropic processes from p = C/V^n; n = 1 is the isothermal special case**
  - Source: Energy Analysis_Closed System - Simon Fraser University. https://www.sfu.ca/~mbahrami/Mech%20240/Lectures/Energy%20Analysis_Closed%20System.pdf
  - Quote: "The special case n =1 is the isothermal expansion P1V1 = P2V2 = mRT0= C"
- **Isothermal expansion work is the integral of R T dV/V from V1 to V2 (LibreTexts)**
  - Source: 8.3: Isothermal Expansion of an Ideal Gas - Physics LibreTexts. https://phys.libretexts.org/Bookshelves/Thermodynamics_and_Statistical_Mechanics/Heat_and_Thermodynamics_(Tatum)/08:_Heat_Capacity_and_the_Expansion_of_Gases/8.03:_Isothermal_Expansion_of_an_Ideal_Gas (**SECONDARY**: LibreTexts host)
  - Quote: "We can calculate the work done by a mole of an ideal gas in a reversible isothermal expansion from volume V 1 to volume V 2 as follows."
- **For an air compressor, isothermal compression takes the least work (a lecture note, SECONDARY)**
  - Source: 8.Compressor. https://uomus.edu.iq/img/lectures21/MUCLecture_2024_9272260.pdf (**SECONDARY**: lecture note)
  - Quote: "From the figure it can be concluded that the isothermal compression consumed the minimum work."
- **Isothermal reversible expansion work: nRT ln(V2/V1)**
  - Source: School of Physics and Astronomy Junior Honours Thermodynamics GJA 2019-2020. https://www2.ph.ed.ac.uk/~gja/thermo/course_notes/topic03.pdf
  - Quote: "The work done on the surroundings by a system comprising n moles of ideal gas expanding reversibly and isothermally is equal to nRT ln( V 2 /V 1)."
- **Isothermal: p = nRT/V = constant/V, a family of hyperbolae**
  - Source: School of Physics and Astronomy Junior Honours Thermodynamics GJA 2019-2020. https://www2.ph.ed.ac.uk/~gja/thermo/course_notes/topic03.pdf
  - Quote: "The equation of state PV = nRT gives P = nRT/V = constant /V with different values of the constant for different temperatures (ie a family of hyperbolae)."

My reading: for n not equal to 1 the area is (p₁V₁ − p₂V₂)/(n − 1) (Calculus fundamentals lesson 9); for n = 1 that
formula divides by zero and the area is p₁V₁ ln(V₂/V₁), which equals nRT ln(V₂/V₁) because p₁V₁ = nRT, because p = C/V and the reverse rule
"for any power except −1" (Calculus fundamentals lesson 7) fails exactly at V⁻¹. The cited text gives the final form;
the brief should show the step from p = C/V with a bar count first. The Purdue note puts the whole family on one page.
The compressor line is a lecture note (**SECONDARY**); the MCA Applied Heat line 4.2.7 is the primary requirement.

### 4.13 Derivatives of eˣ, a preview only
- **A level spec: the gradient of e^(kx) is k e^(kx), so the exponential model suits many applications**
  - Source: Cambridge OCR Level 3 Advanced GCE in Mathematics A H240 Specification. https://www.ocr.org.uk/Images/308723-specification-accredited-a-level-gce-mathematics-a-h240.pdf
  - Quote: "Know that the gradient of e kx is equal to k e kx and hence understand why the exponential model is suitable in many applications."
- **SQA Advanced Higher: differentiating functions involving e^x and ln x**
  - Source: Advanced Higher Mathematics. https://www.sqa.org.uk/files_ccc/AHCourseSpecMathematics.pdf
  - Quote: "Differentiating exponential and natural logarithmic functions"
- **The natural exponential is its own derivative (University of Colorado text)**
  - Source: Chapter 3 Differential Equations. https://math.colorado.edu/~stade/CLS/Section_3_1.pdf
  - Quote: "In other words, the natural exponential function y = e t is equal to its own derivative"

My reading: Calculus fundamentals stopped at powers of x and said e and logs wait for this course. A single screen can show
that the slope of eˣ equals eˣ, linking to the time constant (rate proportional to the amount) and pointing back to Calculus
fundamentals. The MCA wants the derivative of ln x, which stays a one-line preview here (Differentiation of e^(kx) and
ln x is Advanced Higher in SQA's list).

### 4.14 Notation
- **HELM: the subscript 10 is usually not written for base 10 logs**
  - Source: Modelling Exercises. https://sheffield.ac.uk/media/31957/download?attachment (**SECONDARY**: university copy of HELM Workbook 6 sections)
  - Quote: "It is not usually necessary to declare the subscript 10 when indicating logarithms to base 10."
- **OCR examiners' hint: state the base if it is not 10**
  - Source: A Level Maths: examiner feedback on modelling with exponentials and logarithms. https://www.ocr.org.uk/blog/a-level-maths-examiner-feedback-on-modelling-with-exponentials-and-logarithms
  - Quote: "Remember to state the base if not 10."
- **Kenney and Kastberg: special notation log(x) for base 10 and ln(x) for base e**
  - Source: Australian Senior Mathematics Journal vol. 27 no. 1. https://files.eric.ed.gov/fulltext/EJ1093384.pdf
  - Quote: "Additional complications come into play with logarithmic functions because we have special unique notation for certain bases, namely log( x ) for log10( x ) and ln( x ) for log e ( x )."

My reading: with no base written, log means base 10 and ln means base e (Kenney and Kastberg; HELM drops the subscript
10). Kenney and Kastberg found 35 of 59 students said ln(x) equals log(x). Show the base on every log, as OCR's hint says.
Whether Dan's college texts use "log" for ln anywhere is **UNCONFIRMED** (not seen).

---

## 5. Prerequisites: what this topic leans on

- **HELM 6.3: the base should be a positive number**
  - Source: HELM Workbook 6 Exponential and Logarithmic Functions. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%206%20Exponential%20and%20Logarithmic%20Functions.pdf
  - Quote: "As with all exponentials, the base should be a positive number."
- **HELM 6.5 prerequisites: laws of logs, base 10 logs, solving equations with logs and exponentials**
  - Source: Modelling Exercises. https://sheffield.ac.uk/media/31957/download?attachment (**SECONDARY**: university copy of HELM Workbook 6 sections)
  - Quote: "be familiar with the laws of logarithms _•_ have knowledge of logarithms to base 10 _•_ be able to solve equations involving logarithms and exponentials"
- **Khan: a logarithm needs a positive argument and a positive base**
  - Source: Intro to logarithm properties (article) | Khan Academy. https://www.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:logs/x2ec2f6f830c9fb89:log-prop/a/properties-of-logarithms
  - Quote: "in order for a logarithm to be defined, the argument of the logarithm must be positive"
- **APOS study: prerequisite exponent knowledge assumed had to be constructed or reviewed first**
  - Source: High school student understanding of exponential and logarithmic functions - ScienceDirect. https://www.sciencedirect.com/science/article/pii/S0732312322000219
  - Quote: "We also found that all the prerequisite knowledge we list below and originally assumed students had, needed to be constructed or reviewed before working with exponential functions and logarithms."
- **Ganesan and Dindyal: students must have a good grasp of exponents and the laws of indices; use symbolic and graphical forms**
  - Source: An Investigation of Students' Errors in Logarithms - ERIC. https://files.eric.ed.gov/fulltext/ED572604.pdf
  - Quote: "Students must have a good grasp of exponents and the laws of indices. Introducing logarithms in two different representations namely symbolic and graphical will also allow students to have a better understanding of logarithms."

What Dan has from the built courses (from the briefs, not web quotes):
- **Powers and roots** (7 lessons): the three laws of powers, zero and negative powers, fractional powers, powers of ten and
  prefixes, units with powers, scaling in formulas. Its brief defers logs, "finding n in pV^n = C", log graphs, aˣ, e and
  growth and decay to this course (`powers-and-roots/brief.md`, "Left for later courses"). Whole-number exponents are done.
  A power with an unknown (a variable exponent) and the base-positive rule are not; teach both inline.
- **Functions and their graphs**: the function machine, domain and range, shifting (lesson 5), stretching and flipping (6),
  composition, and the inverse as a machine undone (8). Lesson 8 names "the exponential and the logarithm as the next inverse
  pair". So an inverse function is known; the log graph as the mirror of the exponential in y = x is also set up.
- **Straight-line graphs**: gradient, y = mx + c, laws from readings and a fitted line (lessons 5 and 6). It defers
  "reducing y = axⁿ and y = abˣ to straight lines, and pVⁿ = C with n unknown" to this course.
- **Quadratics and polynomials**: not needed here (no part of this course uses a quadratic).
- **Calculus fundamentals**: the derivative, the power rule (lesson 4), the reverse rule "for any power except −1" (lesson 7),
  work from a pV diagram for n not equal to 1 (lesson 9), the capacitor curve as a picture, not a formula, and "Newton's law
  of cooling is left out" (`calculus-fundamentals/brief.md`).
- **Percentages and Proportional reasoning**: percent change, which is the growth factor (1.05 for 5 percent).
- **Linear equations**: rearranging formulas, which every log equation needs.

Must be taught inline: growth factor against growth rate (1.05 against 5 percent), a variable exponent, the base must be
positive and not 1, a log of zero or a negative number does not exist, the calculator's log and ln keys and what they
mean, and what e is.

---

## 6. Misconceptions and learning science for each skill

### 6.1 Exponentiation as a process (the base under the log)
- **Weber (ERIC): exponential and logarithmic functions give students serious difficulty**
  - Source: ERIC - ED477690 - Students' Understanding of Exponential and Logarithmic Functions., 2002-Jul. https://eric.ed.gov/?id=ED477690
  - Quote: "Unfortunately, these are also concepts that give students serious difficulty."
- **Weber: students compute exponents in simple cases but few reason about the process of exponentiation**
  - Source: ERIC - ED477690 - Students' Understanding of Exponential and Logarithmic Functions., 2002-Jul. https://eric.ed.gov/?id=ED477690
  - Quote: "Our main result was that while all of the students in the study could compute exponents in simple cases, few students could reason about the process of exponentiation."
- **Weber (reported by Ganesan and Dindyal): most students understood exponentiation only as an action, not a process**
  - Source: An Investigation of Students' Errors in Logarithms - ERIC. https://files.eric.ed.gov/fulltext/ED572604.pdf
  - Quote: "most of the students involved in the study could only understand exponentiation as an action but could not do so as a process."

### 6.2 Logarithms: the notation, the laws, and "cancelling log"
- **Kenney and Kastberg: log(M+N) = log M + log N seems reasonable from the distributive property**
  - Source: Australian Senior Mathematics Journal vol. 27 no. 1. https://files.eric.ed.gov/fulltext/EJ1093384.pdf
  - Quote: "a relationship such as log b ( M + N ) = log b ( M ) + log b ( N ) can appear reasonable when one’s thinking about numbers and polynomials has been based on the distributive property."
- **Kenney and Kastberg: many students see logarithms as something you do or convert**
  - Source: Australian Senior Mathematics Journal vol. 27 no. 1. https://files.eric.ed.gov/fulltext/EJ1093384.pdf
  - Quote: "Many students understand logarithms as something you primarily do or convert"
- **Kenney and Kastberg: a task to convince a friend that log(M+N) is not log M + log N**
  - Source: Australian Senior Mathematics Journal vol. 27 no. 1. https://files.eric.ed.gov/fulltext/EJ1093384.pdf
  - Quote: "Produce an argument that could convince a friend that log b ( M + N ) ≠ log bM + log bN ."
- **Chua and Wood: capable of routine calculations but less capable on higher-level thinking**
  - Source: Working with Logarithms: Students’ Misconceptions and Errors. https://math.nie.edu.sg/ame/matheduc/tme/tmeV8_2/Final%20Chua%20Wood.pdf
  - Quote: "Students appear capable of doing routine calculations but less capable when answering questions which require higher levels of cognitive thinking"
- **Ganesan and Dindyal: even when students can do textbook questions, understanding of the nature of logarithms is in doubt (quoting Chua)**
  - Source: An Investigation of Students' Errors in Logarithms - ERIC. https://files.eric.ed.gov/fulltext/ED572604.pdf
  - Quote: "claimed that even when students can do the questions that are in the text and on the examinations, “their understanding of the fundamental nature of logarithms remains in doubt”"
- **Ganesan and Dindyal: a student wrote that dividing logs means subtracting (divide means minus)**
  - Source: An Investigation of Students' Errors in Logarithms - ERIC. https://files.eric.ed.gov/fulltext/ED572604.pdf
  - Quote: "Response: Yes, because divide means minus."
- **Chua and Wood: some students treat log as an object, not an operation, and divide both sides by it**
  - Source: Working with Logarithms: Students’ Misconceptions and Errors. https://math.nie.edu.sg/ame/matheduc/tme/tmeV8_2/Final%20Chua%20Wood.pdf
  - Quote: "students often see the notation for logarithm “log” as an object rather than as an operation."
- **Chua and Wood: a student's rule that you can always change subtraction to division with logs**
  - Source: Working with Logarithms: Students’ Misconceptions and Errors. https://math.nie.edu.sg/ame/matheduc/tme/tmeV8_2/Final%20Chua%20Wood.pdf
  - Quote: "had established the rule that “you can always change subtraction to division when doing logarithms”, which she had used successfully in many cases."
- **Chua and Wood: the main finding is failure to see the logarithm as a number**
  - Source: Working with Logarithms: Students’ Misconceptions and Errors. https://math.nie.edu.sg/ame/matheduc/tme/tmeV8_2/Final%20Chua%20Wood.pdf
  - Quote: "notably those where students fail to see the logarithm as a number. It is this failure that then leads them to pull expressions with logarithms apart and do things such as cancel the word “log”."
- **Chua and Wood: over-generalisation errors are not carelessness and cannot be fixed by more standard drill**
  - Source: Working with Logarithms: Students’ Misconceptions and Errors. https://math.nie.edu.sg/ame/matheduc/tme/tmeV8_2/Final%20Chua%20Wood.pdf
  - Quote: "these misconceptions are grounded in faulty understanding and consequently cannot be addressed by more drill and practice of the standard type."
- **Chua and Wood: the kind of practice matters as much as the amount**
  - Source: Working with Logarithms: Students’ Misconceptions and Errors. https://math.nie.edu.sg/ame/matheduc/tme/tmeV8_2/Final%20Chua%20Wood.pdf
  - Quote: "the kind of practice is just as significant as the quantity."
- **Chua and Wood: 'times means add' and 'divide means subtract' are misleading memory phrases**
  - Source: Working with Logarithms: Students’ Misconceptions and Errors. https://math.nie.edu.sg/ame/matheduc/tme/tmeV8_2/Final%20Chua%20Wood.pdf
  - Quote: "the use of phrases such as “times means add” and “divide means subtract” when helping students to remember the product rule and quotient rule of logarithms can be both misleading and unhelpful, and contribute to the development of quick, but faulty, rules by the student."
- **Chua and Wood: let students check a wrong rule with a calculator**
  - Source: Working with Logarithms: Students’ Misconceptions and Errors. https://math.nie.edu.sg/ame/matheduc/tme/tmeV8_2/Final%20Chua%20Wood.pdf
  - Quote: "Teachers can highlight why the answer is wrong by getting students to verify the values of and by using calculators."
- **Kenney and Kastberg: 16 of 59 college algebra students said two log expressions were equal because the log could be cancelled out**
  - Source: Australian Senior Mathematics Journal vol. 27 no. 1. https://files.eric.ed.gov/fulltext/EJ1093384.pdf
  - Quote: "16 students claimed that the expressions were equal, reasoning that log was irrelevant because it could be “cancelled out”"
- **Kenney and Kastberg: asked for log4(-16), both students guessed and checked for a negative number or a fraction**
  - Source: Australian Senior Mathematics Journal vol. 27 no. 1. https://files.eric.ed.gov/fulltext/EJ1093384.pdf
  - Quote: "However, when given log4(–16), both students tried to complete the same type of conversion by using guess and check to find a value to which 4 could be raised to produce -16, believing that the answer should either be a negative number or a fraction"
- **Kenney and Kastberg: 'cancel' becomes a reason to remove the log term from a log equation**
  - Source: Australian Senior Mathematics Journal vol. 27 no. 1. https://files.eric.ed.gov/fulltext/EJ1093384.pdf
  - Quote: "For students, the term cancel becomes a reason to incorrectly remove the log term from a log equation."
- **Kenney and Kastberg: 35 of 59 students said ln(x) equals log(x)**
  - Source: Australian Senior Mathematics Journal vol. 27 no. 1. https://files.eric.ed.gov/fulltext/EJ1093384.pdf
  - Quote: "35 out of 59 students answered that ln( x ) was equal to log( x )"
- **Kenney and Kastberg: x + x + x versus log2(x) + log2(x) + log2(x) as an exercise in treating log as an object**
  - Source: Australian Senior Mathematics Journal vol. 27 no. 1. https://files.eric.ed.gov/fulltext/EJ1093384.pdf
  - Quote: "Consider asking students to simplify _x_ + _x_ + _x_ , and then log2( _x_ ) + log2( _x_ ) + log2( _x_ ). This is a simple exercise, but it builds on students’ existing understanding of how to notate three objects and develops an understanding of log2( _x_ ) as an object itself. Asking students to evaluate both answers for _x_ = 2 can also build an understanding of the role played by log2 and that it cannot be ‘cancelled’ away."
- **Kenney and Kastberg: log is an object and a process in the notation**
  - Source: Australian Senior Mathematics Journal vol. 27 no. 1. https://files.eric.ed.gov/fulltext/EJ1093384.pdf
  - Quote: "Trying to make sense of this dual role played by the notation can cause great confusion for many students"
- **Chua and Wood: students treat the log as a common factor, the linear extrapolation error**
  - Source: Working with Logarithms: Students’ Misconceptions and Errors. https://math.nie.edu.sg/ame/matheduc/tme/tmeV8_2/Final%20Chua%20Wood.pdf
  - Quote: "misconception is the mistaken notion that the “log” in the expression, , is a common factor. This error is actually quite common and is often called the linear extrapolation error (Matz, 1980)."
- **Chua and Wood: cancelling lg top and bottom after a change of base gave the answer 10**
  - Source: Working with Logarithms: Students’ Misconceptions and Errors. https://math.nie.edu.sg/ame/matheduc/tme/tmeV8_2/Final%20Chua%20Wood.pdf
  - Quote: "simplify it by cancelling lg from both the numerator and the denominator, resulting in the response of 10."

My reading: the corpus agrees on four mistakes to catch with at least one DO screen each: (1) log(a + b) split as log a + log b
(Kenney and Kastberg, Chua and Wood: from the distributive property); (2) "cancelling the log" or treating it as a common factor,
a variable or a number to divide by (Kenney, Chua and Wood); (3) subtraction turned into division and the other way
("divide means minus", "you can always change subtraction to division"); (4) the log of a negative number
(log₄(−16): both students guessed for a negative answer). The cure Chua and Wood suggest is to check the wrong rule with the calculator, and
Kenney and Kastberg suggest x + x + x against log₂x + log₂x + log₂x to make the log an object.

### 6.3 Exponential growth: underestimating it, and mixing up rate and factor
- **Exponential growth bias: the pervasive tendency to linearize exponential functions**
  - Source: Exponential Growth Bias and Household Finance - STANGO - 2009 - The Journal of Finance - Wiley Online Library. https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1540-6261.2009.01518.x
  - Quote: "Exponential growth bias is the pervasive tendency to linearize exponential functions when assessing them intuitively."
- **Wagenaar and Sagaria: exponential growth grossly underestimated in an intuitive extrapolation**
  - Source: Misperception of exponential growth - Springer Nature. https://link.springer.com/content/pdf/10.3758/BF03204114.pdf
  - Quote: "Exponential growth in numerical series and graphs is grossly underestimated"
- **Ciccione et al.: underestimation of noisy exponential growth in graphs; bias only slightly reduced by a short lecture**
  - Source: Analyzing the misperception of exponential growth in graphs. https://www.sciencedirect.com/science/article/abs/pii/S0010027722001007
  - Quote: "The magnitude of this bias was slightly reduced after a short lecture on it"
- **Three misconceptions that hinder recognising exponential growth: linear-or-exponential, unboundedness, always very fast**
  - Source: Intuition and exponential growth: bias and the roles of parameterization and complexity - PMC. https://pmc.ncbi.nlm.nih.gov/articles/PMC8386158/
  - Quote: "Recognition of exponential growth is hindered by three popular misconceptions: The first misconception sees growth as either linear or exponential, the second one views unboundedness as defining exponential growth, and the third one alleges that exponential growth is always very fast."
- **Doubling times framing reduced the underestimate compared with growth rates**
  - Source: Intuition and exponential growth: bias and the roles of parameterization and complexity - PMC. https://pmc.ncbi.nlm.nih.gov/articles/PMC8386158/
  - Quote: "Exponential growth is communicated to one group in terms of growth rates, and in terms of doubling times to the other."
- **Mathwords: confusing the growth rate k with the growth factor b**
  - Source: Continuous Exponential Growth Formula: A = A₀eᵏᵗ Examples. https://www.mathwords.com/e/exponential_growth.htm (**SECONDARY**: reference site)
  - Quote: "Mistake: Confusing the growth rate k with the growth factor b."
- **Doubling-time framing: exponential growth bias is much smaller when doubling times are used (PMC abstract)**
  - Source: Intuition and exponential growth: bias and the roles of parameterization and complexity - PMC. https://pmc.ncbi.nlm.nih.gov/articles/PMC8386158/
  - Quote: "Exponential growth bias is much smaller when doubling times are employed."
- **Rule of 72 suggested by the authors as an educator heuristic**
  - Source: Intuition and exponential growth: bias and the roles of parameterization and complexity - PMC. https://pmc.ncbi.nlm.nih.gov/articles/PMC8386158/
  - Quote: "They might want to apply the rule of 72 to convert growth rates into doubling times (divide 72 by the growth rate in percent to obtain the approximate doubling time). Educators could teach this heuristic."
- **PMC: unboundedness is not what defines exponential growth; linear, quadratic and log functions also grow without bound**
  - Source: Intuition and exponential growth: bias and the roles of parameterization and complexity - PMC. https://pmc.ncbi.nlm.nih.gov/articles/PMC8386158/
  - Quote: "To counteract the second misconception of unboundedness defining exponential functions, it may be helpful to point out to students that (increasing) linear functions, quadratic or logarithmic functions all grow beyond any bound."
- **PMC: the belief that exponential growth is very fast is dangerous because early stages are missed**
  - Source: Intuition and exponential growth: bias and the roles of parameterization and complexity - PMC. https://pmc.ncbi.nlm.nih.gov/articles/PMC8386158/
  - Quote: "The third misconception, the belief that exponential growth is per se very fast, is potentially dangerous. People operating under this misconception may fail to identify exponential growth in its early stages."
- **PMC study: 65 percent underestimated with growth rates against 41 percent with doubling times**
  - Source: Intuition and exponential growth: bias and the roles of parameterization and complexity - PMC. https://pmc.ncbi.nlm.nih.gov/articles/PMC8386158/
  - Quote: "we find that 65% of subjects underestimate exponential growth when the growth rate is used (Group R), compared to only 41% of subjects who underestimate it when doubling time is used (Group D)."

My reading: "predict first" is well supported: ask Dan to guess, then show the true value, because the bias is seen in intuitive
extrapolation and was only slightly reduced by a short lecture (Ciccione et al.). Doubling times help more than growth rates (65 percent
against 41 percent underestimating in the low-growth question), so lead with doubling time and the rule of 72 as a
check (the paper's own suggestion). The Mathwords page (**SECONDARY**) names the k against b confusion.

### 6.4 Reading log scales and log graphs
- **Heckler et al.: engineering students read a log scale as linear**
  - Source: Student accuracy in reading logarithmic plots: The problem and how to fix it. https://www.computer.org/csdl/proceedings-article/fie/2013/06684990/12OmNwdbV5v
  - Quote: "students often unknowingly interpreted the log scale as linear and were confused about the order of magnitude of a value in the negative exponent region."
- **Heckler et al.: short online practice improved log-plot reading against a control group, retained a month later**
  - Source: Student accuracy in reading logarithmic plots: The problem and how to fix it. https://www.computer.org/csdl/proceedings-article/fie/2013/06684990/12OmNwdbV5v
  - Quote: "Results of post-tests indicate that with this minimal practice, students were able to dramatically improve their accuracy in reading log plots compared to a control group with no log plot practice. Furthermore, testing one month after training demonstrated that student continued to retain the learned skill."
- **Heckler et al. (spaced practice paper): log-plot training worked where most other basic skills saw little improvement**
  - Source: The effectiveness of brief, spaced practice on student difficulties with basic and essential engineering skills. https://www.computer.org/csdl/proceedings-article/fie/2013/06684989/12OmNxcdFXi
  - Quote: "Unlike the success achieved by the log plots training, most of the topics saw little and insufficient improvement as a result of training, despite the basic nature of the skills."
- **People process the minor tick marks on a log scale as if linear**
  - Source: Is my visualization better than yours? Analyzing factors modulating exponential growth bias in graphs. https://pmc.ncbi.nlm.nih.gov/articles/PMC9977824
  - Quote: "people misunderstand the minor tick marks on the log scale, and instead process them in terms of a linear scale"
- **Linear scale misleads predictions, log scale misleads description: no scale is overall better; short intervention helps**
  - Source: Is my visualization better than yours? Analyzing factors modulating exponential growth bias in graphs. https://pmc.ncbi.nlm.nih.gov/articles/PMC9977824
  - Quote: "it is not the case that one scale is overall better than the other. Rather, each of the scales can induce errors in a particular context."
- **Log scale steps are multiplicative, not additive**
  - Source: Is my visualization better than yours? Analyzing factors modulating exponential growth bias in graphs. https://pmc.ncbi.nlm.nih.gov/articles/PMC9977824
  - Quote: "steps on a logarithmic scale are not additive but multiplicative"
- **In the log condition a striking 52 percent read the log scale as linear**
  - Source: Is my visualization better than yours? Analyzing factors modulating exponential growth bias in graphs. https://pmc.ncbi.nlm.nih.gov/articles/PMC9977824
  - Quote: "in the log condition a striking 52% of the participants clearly misunderstood the log scale in terms of a linear scale."
- **Intervention: explain that each major label is 10 times the previous one, show the minor ticks**
  - Source: Is my visualization better than yours? Analyzing factors modulating exponential growth bias in graphs. https://pmc.ncbi.nlm.nih.gov/articles/PMC9977824
  - Quote: "We first explicitly drew their attention to the major tick marks and explained that each label is 10 times as large as the previous one (i.e.,1 > 10 > 100 > 1,000)."
- **Heckler et al.: the practice was online tasks of 10 to 20 minutes, set several times in a semester**
  - Source: Student accuracy in reading logarithmic plots: The problem and how to fix it. https://www.computer.org/csdl/proceedings-article/fie/2013/06684990/12OmNwdbV5v
  - Quote: "The online tasks were administered as for-credit homework assigned several times throughout the semester, and students spent 10-20 minutes on each assignment."

My reading: the evidence says engineers read log axes as if linear, minor ticks included, and that online tasks of 10 to 20
minutes, set several times, fixed it (Heckler et al.). A log-scale ruler Dan drags along, with "x10" on each major mark, is the
interactive this evidence asks for.

### 6.5 Solving equations and linearising: examiner evidence
- **OCR examiners: taking logs before rearranging (log y = log(a + x^b))**
  - Source: A Level Maths - Logarithms, the original mathematical calculator. https://www.ocr.org.uk/blog/alevel-maths-logarithms-the-original-mathematical-calculator
  - Quote: "Examiners noted that a common mistake was to immediately take logarithms to give Log y = Log ( a + x b ), rather than to correctly rearrange into the form y – a = x b before taking logarithms."
- **OCR examiners: not doing the same to both sides, different bases, logs on one side only**
  - Source: A Level Maths - Logarithms, the original mathematical calculator. https://www.ocr.org.uk/blog/alevel-maths-logarithms-the-original-mathematical-calculator
  - Quote: "Common errors were students not doing the same to both sides of the equation, using different bases on each side, or only taking logarithms on one side."
- **OCR examiners: trial and improvement tempts students when logarithms are efficient**
  - Source: A Level Maths - Logarithms, the original mathematical calculator. https://www.ocr.org.uk/blog/alevel-maths-logarithms-the-original-mathematical-calculator
  - Quote: "Students may be tempted to use numerical methods to find a solution through trial and improvement, but this should be discouraged where an efficient analytical technique such as logarithms is available."
- **OCR examiners: misuse of laws (add versus multiply) and mishandled negative exponents**
  - Source: A Level Maths: examiner feedback on modelling with exponentials and logarithms. https://www.ocr.org.uk/blog/a-level-maths-examiner-feedback-on-modelling-with-exponentials-and-logarithms
  - Quote: "Examiners regularly see misuse of laws, mixing up addition/subtraction with multiplication/division. Another common source of errors come from mishandling negative exponents."
- **OCR examiners: writing Q = ... or n log aP when linearising Q = aP^n**
  - Source: A Level Maths: examiner feedback on modelling with exponentials and logarithms. https://www.ocr.org.uk/blog/a-level-maths-examiner-feedback-on-modelling-with-exponentials-and-logarithms
  - Quote: "Unfortunately, examiners often saw equations with ‘ Q = …’ or terms such as ‘ n log aP ’ or ‘ n log a + P ’."
- **OCR examiners: forgetting to convert log values back into a normal number; premature rounding**
  - Source: A Level Maths: examiner feedback on modelling with exponentials and logarithms. https://www.ocr.org.uk/blog/a-level-maths-examiner-feedback-on-modelling-with-exponentials-and-logarithms
  - Quote: "The main source of errors in these types of questions is forgetting to convert log values back into a normal number."
- **OCR examiners: intercept of the ln graph is ln A, not A**
  - Source: A Level Maths: examiner feedback on modelling with exponentials and logarithms. https://www.ocr.org.uk/blog/a-level-maths-examiner-feedback-on-modelling-with-exponentials-and-logarithms
  - Quote: "gave A = 1.9 rather than using the intercept to find ln A = 1.9."
- **Pearson examiners (Oct 2020): log 5 / log 4 wrongly changed to log(5/4)**
  - Source: 9MA0-01 A Level Pure Mathematics 1 - October 2020 - examiner .... https://qualifications.pearson.com/content/dam/pdf/A-Level/Mathematics/2017/Exam-materials/9MA0_01_pef_20201217.pdf
  - Quote: "after applying the power rule correctly changing log5/log 4 to log(5/4)."
- **Pearson examiners (2019): not recognising the log rule for subtraction or addition left candidates stuck**
  - Source: Examiners’ Report Principal Examiner Feedback. https://qualifications.pearson.com/content/dam/pdf/A-Level/Mathematics/2017/Exam-materials/9MA0_01_pef_20190815.pdf
  - Quote: "Students who failed to recognise the logarithmic rule for subtraction or addition often made no progress with the question."
- **SQA Higher 2023 report: some candidates could not convert from logarithmic form to exponential form**
  - Source: Higher Mathematics 2023 course report. https://www.sqa.org.uk/files_ccc/2023-h-course-report-mathematics.pdf
  - Quote: "Question 3 — solving a logarithmic equation Many candidates gained full marks for this question; however, some were unable to convert from logarithmic form into exponential form."
- **SQA Advanced Higher 2023 report: lack of familiarity with the laws of logarithms and indices**
  - Source: Advanced Higher Mathematics Course Report 2023. https://www.sqa.org.uk/files_ccc/2023-ah-course-report-mathematics.pdf
  - Quote: "Centres should be aware of the continuing need to reinforce prior knowledge like basic algebra, trigonometric exact values, and the laws of logarithms and indices."
- **Pearson examiners (2019): exponential-model constants sometimes got the wrong sign**
  - Source: Examiners’ Report Principal Examiner Feedback. https://qualifications.pearson.com/content/dam/pdf/A-Level/Mathematics/2017/Exam-materials/9MA0_01_pef_20190815.pdf
  - Quote: "frequently gave the constant k as a log and errors sometimes occurred with the sign of this constant."
- **Pearson examiners (2019): some candidates thought a model was only acceptable if it gave the exact real value**
  - Source: Examiners’ Report Principal Examiner Feedback. https://qualifications.pearson.com/content/dam/pdf/A-Level/Mathematics/2017/Exam-materials/9MA0_01_pef_20190815.pdf
  - Quote: "Some candidates appeared to think that a model was only acceptable if it gave the exact real value."
- **OCR examiners: an answer of N = 17.19 does not fit a context needing a whole number of experiments**
  - Source: A Level Maths - Logarithms, the original mathematical calculator. https://www.ocr.org.uk/blog/alevel-maths-logarithms-the-original-mathematical-calculator
  - Quote: "Candidates must also take into consideration the context of the question. In this case, the result N = 17.19 would not score full marks since the greatest number of experiments that can be performed is the rounded down value of N = 17."
- **Bird's Higher Engineering Maths: a root that makes a log's argument negative is not a valid solution**
  - Source: Bird’s Higher Engineering Mathematics; Ninth Edition. https://api.pageplace.de/preview/DT0400.9781000353037_A40491166/preview-9781000353037_A40491166.pdf (**SECONDARY**: publisher preview of the book)
  - Quote: "x = − 1 is not a valid solution since the logarithm of a negative number has no real root."
- **OpenStax: a continuous function models behaviour that is really discrete (whole bacteria), so read values in context**
  - Source: 6.8 Exponential Growth and Decay - Calculus Volume 1 | OpenStax. https://openstax.org/books/calculus-volume-1/pages/6-8-exponential-growth-and-decay
  - Quote: "Note that we are using a continuous function to model what is inherently discrete behavior. At any given time, the real-world population contains a whole number of bacteria, although the model takes on noninteger values. When using exponential growth models, we must always be careful to interpret the function values in the context of the phenomenon we are modeling."

My reading: AQA reports were not reached (none found by the search); OCR, Edexcel (Pearson) and SQA were. Their shared
list: take logs of both sides (same base), rearrange first (isolate the power before the log), write the base,
keep the exponent as a factor of the log, convert back to a normal number at the end, do not round early, check the answer
against the context, and watch the sign of k in a decay.

### 6.6 How to teach it (research on learning)
- **Confrey and Smith: splitting, not repeated addition, as the base of exponential thinking; covariation**
  - Source: ERIC - EJ496905 - Splitting, Covariation, and Their Role in the Development of Exponential Functions., Journal for Research in Mathematics Education, 1995. https://eric.ed.gov/?id=EJ496905
  - Quote: "Presents a covariation approach to learning exponential and logarithmic functions based on a primitive multiplicative operation labeled splitting that is not repeated addition."
- **Kuper and Carlson: teaching the idea of logarithm has not been broadly effective**
  - Source: Foundational ways of thinking for understanding the idea .... https://www.sciencedirect.com/science/article/abs/pii/S073231231930001X
  - Quote: "Instruction focused on teaching the idea of logarithm has not been broadly effective"
- **Ellis et al.: three stages from prefunctional reasoning to covariation to correspondence**
  - Source: ERIC - EJ1104995 - An Exponential Growth Learning Trajectory: Students' Emerging Understanding of Exponential Growth through Covariation, Mathematical Thinking and Learning: An International Journal, 2016. https://eric.ed.gov/?id=EJ1104995
  - Quote: "the EGLT identifies three major stages of students' conceptual development: prefunctional reasoning, the covariation view, and the correspondence view."
- **Card activity (Ferrari-Escola et al., reported by Sevgi and Kabalci): multiply the tops, add the bottoms, to build the log laws**
  - Source: Students’ Misconceptions About Exponents - Sevim Sevgi, Semanur Akdemir Kabalcı, 2026. https://journals.sagepub.com/doi/10.1177/21582440261449038
  - Quote: "Inspired by the historical development of logarithms, he suggested that students multiply the two numbers on the top of the cards (e.g., (n|y)), relate the values on the bottom of the cards to addition, and associate dividing the two values on the top of the cards with subtracting the values on the bottom."
- **Kenney and Kastberg: misconceptions built on prior knowledge are part of developing understanding**
  - Source: Australian Senior Mathematics Journal vol. 27 no. 1. https://files.eric.ed.gov/fulltext/EJ1093384.pdf
  - Quote: "Misconceptions based on prior knowledge are a part of developing understanding."
- **Kenney and Kastberg: logarithms are useful where adding is easier and more accurate than multiplying**
  - Source: Australian Senior Mathematics Journal vol. 27 no. 1. https://files.eric.ed.gov/fulltext/EJ1093384.pdf
  - Quote: "in situations where adding two numbers might be far easier and more accurate than multiplying them"

My reading: the supported route is (a) splitting and tables with a constant ratio, (b) the exponent as the additive record
of a multiplicative sequence (the card activity: multiply the tops, add the bottoms, which is the log laws), (c) logs as
numbers and as an inverse function, not only a conversion to do, (d) errors as springboards, and (e) short, spaced
practice on reading log plots. Kuper and Carlson (citing Kenney 2005 and Weber 2002) report that instruction on the idea of logarithm "has not been broadly
effective", so the brief should not assume the definition alone is enough.

---

## 7. Where it is used for an electrician going into marine engineering

### 7.1 Sound levels in the engine room
- **IMO Code on noise levels: readings in decibels with A and C weighting**
  - Source: RESOLUTION MSC.337(91) (adopted on 30 November .... https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MSCResolutions/MSC.337(91).pdf
  - Quote: "3.6.2 Sound pressure level readings shall be taken in decibels using an A-weighting (dB(A)) and C-weighting (dB(C)) filter and if necessary also in octave bands between 31.5 and 8,000 Hz."
- **IMO Code on noise levels: engine-room example reading in dB(A)**
  - Source: RESOLUTION MSC.337(91) (adopted on 30 November .... https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/MSCResolutions/MSC.337(91).pdf
  - Quote: "Noise level in engine-room: LAeq = 108.7 dB(A) LCeq = 109.0 dB(C)"
- **Engine room limit 85 dB(A), reduced from 90 (SECONDARY trade news)**
  - Source: What'S All The Noise At IMO?. https://www.marinetechnologynews.com/news/noise-506402 (**SECONDARY**: trade news)
  - Quote: "The limit used to be 90 dB(A) and it was reduced to 85 dB(A)."

### 7.2 Capacitors: power factor correction banks and discharge
- **IEC 60831: PFC capacitors must discharge to below 75 V within 3 minutes (SECONDARY trade page)**
  - Source: Capacitor bank discharge methods – Voltage Disturbance. https://voltage-disturbance.com/power-quality/capacitor-bank-discharge-methods (**SECONDARY**: trade page)
  - Quote: "IEC 60831 standard requires discharge to <75V within 3 minutes to prevent accidental injury by residual voltage."
- **Capacitor discharge: 37 percent after one time constant, 5 percent after three (SECONDARY trade page)**
  - Source: Capacitor bank discharge methods – Voltage Disturbance. https://voltage-disturbance.com/power-quality/capacitor-bank-discharge-methods (**SECONDARY**: trade page)
  - Quote: "the capacitor terminal voltage will decay to 37% of its initial value in one time constant and to 5% in three time constant (3τ) etc."
- **Stored energy: 0.25 J through the body can give a heavy shock, 10 J can be fatal (Northumbria)**
  - Source: Cap-discharge resistors stabilize PFC operation - Northumbria University Research Portal. https://researchportal.northumbria.ac.uk/en/publications/cap-discharge-resistors-stabilize-pfc-operation/
  - Quote: "The discharge of 0.25 J of stored energy to the human body can provide a heavy shock, and 10 J can be fatal."

My reading: a PFC bank must discharge to a safe voltage in a set time, and a bleed resistor does it by exponential decay; the
time to reach 75 V from a given start is a log calculation. The numbers (75 V, 3 minutes) come from the IEC standard
as reported by a trade page (**SECONDARY**). That PFC banks of this kind are fitted aboard ship is **UNCONFIRMED** (not looked up).

### 7.3 Insulation resistance testing (Megger)
- **Megger: in a polarisation index test the resistance is measured for 10 minutes and the ratio of 10 min to 1 min is the PI**
  - Source: Q and A: Insulation resistance testing | Megger. https://www.megger.com/en-gb/et-online/june-2019/q-a-insulation-resistance-testing
  - Quote: "In a polarisation index test, the insulation resistance of the test object is measured continuously for a period of 10 minutes. The test set then automatically displays the ratio of the resistance measured after 10 minutes to the resistance measured after one minute. This ratio is the polarisation index."
- **Megger: the capacitive charging current quickly falls to zero while the absorption current falls more slowly**
  - Source: Insulation testing diagnostic techniques | Megger. https://www.megger.com/en/et-online/october-2008-(1)/insulation-testing-diagnostic-techniques
  - Quote: "The capacitive charging current quickly falls to zero, whereas the absorption current falls more slowly as the molecules in the insulation become polarised."

My reading: the insulation test reading rises as the charging current dies away, and the polarisation index is the ratio of
the 10 minute reading to the 1 minute reading. The link to e is only that the charging current decays like a capacitor
(Megger says it "quickly falls to zero"); it is **not** quoted as an exponential, so teach the time-constant picture and
leave the maths of PI out.

### 7.4 Engines and compressors; a cooling bar
- **MCA GES B thermodynamics: indicator diagrams to determine the power of an engine; gas laws**
  - Source: MCA General Engineering Science B Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/mca-general-engineering-science-b-written-examination-syllabuses
  - Quote: "The use of indicator diagrams to determine the power of an engine."
- **Bird's Higher Engineering Maths: taking logs of both sides to solve an indicial equation for a volume**
  - Source: Bird’s Higher Engineering Mathematics; Ninth Edition. https://api.pageplace.de/preview/DT0400.9781000353037_A40491166/preview-9781000353037_A40491166.pdf (**SECONDARY**: publisher preview of the book)
  - Quote: "Taking logarithms of both sides of the equation gives: log10 _V_ 1.25 2 = log10 0.02304 i.e. 1.25log10 _V_ 2 = log10 0.02304 from the third law of logarithms"
- **Bird's Higher Engineering Maths: a cooling steel bar, 35 = 17 + 1250 e^(-0.17 t), solved by taking natural logarithms**
  - Source: Bird’s Higher Engineering Mathematics; Ninth Edition. https://api.pageplace.de/preview/DT0400.9781000353037_A40491166/preview-9781000353037_A40491166.pdf (**SECONDARY**: publisher preview of the book)
  - Quote: "35 = 17 + 1250 e − 0.17 t from which, 35 − 17 = 1250 e − 0.17 t"
- **MCA Engineering Knowledge syllabus: air compressors, and assessment of engine power with running adjustments**
  - Source: Engineering Knowledge Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/engineering-knowledge-written-examination-syllabus
  - Quote: "Assessment of engine power, the running adjustments to maintain performance;"
- **MCA Applied Heat 6.1: solves problems involving work input to a reciprocating air compressor**
  - Source: Applied Heat Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-heat-written-examination-syllabus
  - Quote: "Solves problems involving work input and mechanic efficiency."

### 7.5 Engineering modelling from HELM
- **HELM engineering example: sound intensity that fits exponential decay, found with a log-linear plot**
  - Source: Modelling Exercises. https://sheffield.ac.uk/media/31957/download?attachment (**SECONDARY**: university copy of HELM Workbook 6 sections)
  - Quote: "The data recorded for the sound intensity fit exponential decaying with time."

My reading on trade uses not found: Newton's law of cooling in an MCA or HN line (**UNCONFIRMED**), RC time constant in
the MCA Electro-Technology syllabus (**UNCONFIRMED**), battery discharge curves (not looked for; ampere-hour capacity
appears in the MCA syllabus but not an exponential).

---

## 8. Size: how many lessons the benchmarks spend

- **NSW Education: a 7-lesson Year 11 unit on exponential and logarithmic functions**
  - Source: Exponential and logarithmic functions – Year 11 – Mathematics .... https://education.nsw.gov.au/teaching-and-learning/curriculum/mathematics/mathematics-curriculum-resources-k-12/Mathematics-11-12-resources/exponential-logarithmic-functions-year-11-ma
  - Quote: "A 7-lesson unit for Year 11 with resources. This unit focuses on exponential and logarithmic functions, exploring their properties, behaviours"

The numbers, from the quotes above:
- Brilliant: Exponential Functions 42 lessons (696 exercises) plus Logarithms 29 lessons (511 exercises), 71 lessons in all, which
  is too big for a six to eight lesson course.
- Khan: Algebra 1 unit 12 (17 listed items, quizzes and test included) plus Algebra 2 unit 7 (five skills and a test) and unit 8 (nine skills, two quizzes and a test).
- Bird (Basic): logarithms 8 pages, exponential functions 14, non-linear laws 9, log scales 10; HELM 6: 73 pages with the
  hyperbolic section.
- SQA HN Engineering Mathematics 1: Outcome 2 is 8 hours.
- NSW: a 7-lesson Year 11 unit on the same ground.

**The core that supports six to eight lessons:** SQA H7K0 33 Outcome 2 (laws, forms, graphs, solving, Ae^kt in engineering),
MCA Mathematics 3.1, 4.1.11 and 8.1.12 (logs as assumed knowledge, the pVⁿ graph, the area under pVⁿ = C), Applied Heat 4.2
(isothermal work), and Pearson 4002's exponential-and-logarithmic pass criterion. Seven lessons fit:
1. Growth by multiplying: doubling and the exponential graph (Brilliant levels 1 to 3, Khan Algebra 1, Confrey and Smith splitting).
2. Decay, the time constant and e: the capacitor charging and discharging, and Newton's law of cooling as the same shape.
3. Logarithms as the power you need, and the inverse graph.
4. The log laws, with decibels.
5. Solving exponential equations with logs and natural logs (including checking answers).
6. Log graphs: straight lines from y = abˣ, y = axⁿ and pVⁿ = C with n unknown.
7. The isothermal case: W = pV ln(V₂/V₁), with the derivative of eˣ as a one-screen preview.

This is my reading of the evidence, not the brief.
