# Powers and roots: research notes

Researched 17 Oct 2026 for the Powers and roots course brief (the fourth course in the Maths shelf's Algebra folder, after
Linear equations, Straight-line graphs and Linear systems; blurb "Fractional and negative powers, roots and the rules that
tie them together, with powers of ten and units", from "Brilliant: Exponents and Radicals"). The brief itself is not written
here; these notes are its evidence. Dan is an electrician preparing for marine engineering college (HNC/HND route: engineering
maths, applied mechanics, applied heat, electro-technology). He has Fractions, Negative numbers, Percentages, Proportional
reasoning, Solving equations, The coordinate plane, Geometry fundamentals, Linear equations and Calculus fundamentals built, and
Straight-line graphs and Linear systems are being built in the same push (their briefs are in `build/maths/`).

Every finding has its source title, URL and the exact words, copied from a saved tool result by script (the quotes were not
retyped into this file; this file is itself generated from `quotes.json` and a prose outline). All of them are listed in
`quotes.json` beside this file and were checked with `node tools/eval/sources.mjs --quotes ... --tools ...` (`failed: 0`).
The tool files are in `tools/`. Findings I could not confirm are marked **UNCONFIRMED**; where only a non-original site said
it, **SECONDARY**. My own readings are marked "My reading" and are not quotes. Mirror and copy sites were avoided; hosts that
republish an original text (LibreTexts, a book-chapter copy) are marked SECONDARY where used. Search results come back cut to
fit; where a page was cut short, the quote stops where the page does.

---

## 1. Benchmark: Brilliant's Exponents and Radicals

### 1.1 The course itself
Brilliant's page for the course is `brilliant.org/courses/exponents-and-radicals/` (reachable on 17 Oct 2026). The course is
**83 lessons in at least 15 levels**; the fetched page elides what lies between Level 15 and the course description, so whether
there are more levels is **UNCONFIRMED**. It is far bigger than the five to seven lessons planned for Dan.

- **Brilliant's Exponents and Radicals is 83 lessons and 1460 exercises**
  - Source: Practice Exponents and Radicals | Brilliant. https://brilliant.org/courses/exponents-and-radicals/
  - Quote: "Learn the core properties of exponents. Uncover their connection to radicals. Apply exponent rules alongside other fundamental operations. 83 Lessons 1460 Exercises"
- **Levels 1 to 5: exponent basics, negative bases, powers of 10 on number lines, squares and roots, higher powers and roots**
  - Source: Practice Exponents and Radicals | Brilliant. https://brilliant.org/courses/exponents-and-radicals/
  - Quote: "Level 1 Exponent Basics Multiplication Patterns Exponents Bases Special Bases and Exponents Base 10 Level Check ## Level 2 Negative Bases Powers of -1 Negative Bases Negatives and Exponents Level Check ## Level 3 Exponents and The Number Line Powers of 2 on the Number Line Reasoning with Powers of 2 Powers of 3 on the Number Line Powers of 10 on Number Lines Estimating with Powers of 10 Millionaires and Billionaires Power Problems on Number Lines ## Level 4 Squares and Roots Squaring Squares on the Number Line Square Roots Square Roots of Non-Squares The Inverse of Squaring Square Roots and Negatives ## Level 5 Higher Powers and Roots Cubes Reasoning with Cubes Cubes on The Number Line Cube Roots Cube Roots as Inverse Higher Order Roots"
- **Levels 6 to 9: order of evaluation, expressions, operations on radicals, power and product rules**
  - Source: Practice Exponents and Radicals | Brilliant. https://brilliant.org/courses/exponents-and-radicals/
  - Quote: "Level 6 Evaluating in Order Order and Evaluation Parentheses and Exponents Powers, Roots, Multiplication Powers, Roots and Sums Expressions in Radicals ## Level 7 Exponents and Radicals in Expressions All Operations Nested Grouping Symbols Nested Radicals and Powers Fraction Bar Grouping Complex Expressions ## Level 8 Operations on Radicals Scaling Square Roots Adding and Subtracting Square Roots Areas and Roots of Squares Squaring Square Roots Multiplying Square Roots Rewriting Square Roots Adding Unlike Square Roots ## Level 9 Power and Product Rules The Product Rule for Exponents Product Rule with Multiple Bases The Exponent Power Rule Powers of a Product Powers of a Fraction Powers of Products of Powers Combining Into a Single Base"
- **Levels 10 to 15: exponent zero, negative exponents, quotients, prime factorisation, fractions as exponents, scientific notation**
  - Source: Practice Exponents and Radicals | Brilliant. https://brilliant.org/courses/exponents-and-radicals/
  - Quote: "Level 10 Exponent Zero Exponent Zero Exponent 0 on the Number Line Exponent Zero and Products Zero to the Zero ## Level 11 Negative Exponents Negative Exponents Negative Powers on NumberLines Negative Powers and Products Negative Powers: Unit Fraction Negative Powers: Any Fraction Computing with Negative Powers ## Level 12 Quotients Quotients Quotients and Negative Powers Negative Powers in Denominator Simplifying Multiple Bases ## Level 13 Prime Factorization Prime Factors Repeated Prime Factors Primes and Powers of 10 Multiplying Prime Factorizations Dividing Prime Factorizations ## Level 14 Fractions as Exponents Exponent One Half Using the Power Rule Unit Fraction Exponents Roots and the Power Rule Any Fraction as an Exponent Root First or Power First ## Level 15 Scientific Notation Powers of 10 Shifting the Decimal Point Adding in Scientific Notation Multiplying in Scientific Notation Estimating Products in Scientific Notation Dividing in Scientific Notation Estimating Quotients in Scientific Notation"
- **Brilliant's description, topics covered and prerequisites (Negative Numbers, Fractions)**
  - Source: Practice Exponents and Radicals | Brilliant. https://brilliant.org/courses/exponents-and-radicals/
  - Quote: "Learn the fundamental laws of exponents and develop fluency in their algebraic manipulation. Discover how these laws naturally connect exponents and radicals. Explore how exponent rules interact with other fundamental operations. Apply exponent notation in contexts such as scientific notation and prime factorization. ## Topics covered * Squares and cubes; * powers as repeated multiplication; * Laws of exponents (product, quotient, power of a power, power of products and quotients); * Zero and negative exponents; * Prime factorization and scientific notation using exponents * nth roots as inverses of powers; * Rational exponents and radical–exponent equivalence; * Simplifying, estimating, and operating with radicals (products, quotients, rationalizing simple denominators) ## Prerequisites and next steps Prerequisites: Negative Numbers, Fractions"

My reading of the order: whole-number powers first (L1 "Multiplication Patterns"), negative bases (2), powers of 2, 3 and 10 on
number lines (3), then squares and roots (4) and cubes and higher roots (5) before any index law, then order of evaluation
(6, 7), operations on square roots (8), only then the product and power rules (9), then zero (10), negative exponents (11),
quotients (12), prime factors (13), fractions as exponents (14) and scientific notation last (15). So, from the level titles
alone ("Exponent Zero and Products", "Negative Powers and Products", "Quotients and Negative Powers"), Brilliant builds zero and
negative exponents on the laws; the pattern of dividing is the other route that mathcentre uses (section 4.3). Its prerequisites are Negative Numbers and Fractions,
which Dan has. The page gives only titles, so what happens inside each lesson (what the pictures are) is **UNCONFIRMED**; I did
not see a lesson. Brilliant has a lesson called "Zero to the Zero"; I found no reachable authoritative page on what is said
there, so how to treat 0 to the power 0 is **UNCONFIRMED** (the brief should avoid it).

### 1.2 Where it sits in Brilliant's path
- **Brilliant's Algebra Fundamentals band: Linear Equations, Coordinate Geometry, Linear Relationships, then Exponents and Radicals, then Visual Algebra; the next band has Functions, Linear Systems, Quadratics, Exponential Functions**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "GR 7–8 Linear Equations GR 7–8 Coordinate Geometry GR 8–9 Linear Relationships GR 8 Exponents and Radicals GR 8–9 Visual Algebra GRADES 8–11 Intermediate Algebra New Understand core ideas to crush early high school courses like Algebra 1 or Integrated Math 1 and 2 Understand core ideas to crush early high school courses like Algebra 1 or Integrated Math 1 and 2 GR 8–9 Introduction to Functions GR 8–9 Linear Systems New GR 9 Quadratics GR 8–9 Coordinate Transformations GR 9–10 Exponential Functions"
- **Brilliant's Advanced Algebra band: Trigonometric Functions, Polynomials, Logarithms, Complex Numbers**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "GR 11–12 Trigonometric Functions GR 11–12 Polynomials New GR 11–12 Equations and Curves New GR 11–12 Logarithms GR 12 Polar Coordinate Plane GR 11–12 Complex Numbers"
- **Brilliant's Exponential Functions course picks up negative exponents, fractional bases and exponents at half-steps**
  - Source: Practice Exponentials and Logarithms | Brilliant. https://brilliant.org/courses/exponential-functions
  - Quote: "Level 3 Exponential Decay Decay Fractional Bases Building Decay Functions Negative Exponents ... Level 10 Exponentials at Non-Integers Exponentials at Half-Steps Exponentials Between Integers"

My reading: Brilliant puts Exponents and Radicals in "Algebra Fundamentals" after Linear Equations, Coordinate Geometry and
Linear Relationships, and before Visual Algebra and the "Intermediate Algebra" band (Introduction to Functions, Linear Systems,
Quadratics, Coordinate Transformations, Exponential Functions). Dan's folder puts Linear systems before Powers and roots, which
differs from Brilliant, but nothing here needs Linear systems. What comes after in Brilliant is the same ground as Dan's later
courses: Exponential Functions (negative exponents on a growth curve, "half-steps", a fraction between whole exponents),
Polynomials, Logarithms, Trigonometric Functions, Complex Numbers. Those are deferred (section 5).

---

## 2. Other courses' order for the same ground

### 2.1 Khan Academy
- **Khan Academy Algebra 1: Unit 11 Exponents & radicals sits between Absolute value & piecewise functions and Exponential growth & decay**
  - Source: Exponents & radicals | Algebra 1 | Math | Khan Academy. https://en.khanacademy.org/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals
  - Quote: "Algebra 1 17 units Unit 1 Algebra foundations Unit 2 Solving equations & inequalities Unit 3 Working with units Unit 4 Linear equations & graphs Unit 5 Forms of linear equations Unit 6 Systems of equations Unit 7 Inequalities (systems & graphs) Unit 8 Functions Unit 9 Sequences Unit 10 Absolute value & piecewise functions Unit 11 Exponents & radicals Unit 12 Exponential growth & decay Unit 13 Quadratics: Multiplying & factoring Unit 14 Quadratic functions & equations Unit 15 Irrational numbers Unit 16 Creativity in algebra Unit 17 Teacher resources"
- **Khan Academy Algebra 1 Unit 11 lessons in order**
  - Source: Exponents & radicals | Algebra 1 | Math | Khan Academy. https://en.khanacademy.org/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals
  - Quote: "1. Multiply & divide powers (integer exponents) 2. Powers of products & quotients (integer exponents) 3. Properties of exponents challenge (integer exponents) 4. Exponents & radicals: Quiz 1 5. Square roots 6. Roots of decimals & fractions 7. Cube roots 8. Exponents & radicals: Quiz 2 9. Simplify square roots 10. Simplify square roots (variables) 11. Simplify square-root expressions 12. Exponents & radicals: Quiz 3 13. Exponents & radicals: Unit test"
- **Khan Academy Algebra 1 Unit 11 Exponents & radicals is 9 skills**
  - Source: Exponents & radicals | Algebra 1 | Math | Khan Academy. https://en.khanacademy.org/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals
  - Quote: "Unit 11: Exponents & radicals 9 skills"
- **Khan Academy Algebra 1 Unit 11 description**
  - Source: Exponents & radicals | Algebra 1 | Math | Khan Academy. https://en.khanacademy.org/math/algebra/x2f8bb11595b61c86:rational-exponents-radicals
  - Quote: "Let's review exponent rules and level up what we know about roots. The square root is nice, but let's learn about higher-order roots like the cube root (or 3rd root)."
- **Khan Academy Algebra 2 Unit 6, Rational exponents and radicals: lessons in order**
  - Source: Rational exponents and radicals | Algebra 2 | Math | Khan Academy. https://en.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:exp
  - Quote: "1. Unit-fraction exponents 2. Fractional exponents 3. Rational exponents challenge 4. Properties of exponents intro (rational exponents) 5. Properties of exponents (rational exponents) 6. Rational exponents and radicals: Quiz 1 7. Evaluate radical expressions challenge 8. Rewrite exponential expressions 9. Equivalent forms of exponential expressions 10. Solve exponential equations using exponent properties 11. Solve exponential equations using exponent properties (advanced) 12. Rational exponents and radicals: Quiz 2 13. Rational exponents and radicals: Unit test"
- **Khan Academy Algebra 2 Unit 6 Rational exponents and radicals is 10 skills**
  - Source: Rational exponents and radicals | Algebra 2 | Math | Khan Academy. https://www.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:exp
  - Quote: "Unit 6: Rational exponents and radicals 10 skills"
- **Khan Academy Algebra 2 Unit 6 description: integer powers first, then rational powers**
  - Source: Rational exponents and radicals | Algebra 2 | Math | Khan Academy. https://www.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:exp
  - Quote: "We previously learned about integer powers—first positive and then also negative. But what does it mean to raise a number to the 2.5 power? In Algebra 2, we extend previous concepts to include rational powers. We'll define how they work, and use them to rewrite exponential expressions"

My reading: Khan splits the ground in two years. Algebra 1 does integer exponents (multiply and divide powers, powers of
products and quotients), then square roots, roots of decimals and fractions, cube roots, and simplifying square roots. Algebra 2
does unit-fraction exponents, then fractional exponents, then the properties again with rational exponents. Khan's page for
"Roots, exponents, & scientific notation" in Pre-algebra loaded, but only its title came back, so the order inside it is
**UNCONFIRMED**.

### 2.2 BBC Bitesize (GCSE, UK)
- **BBC Bitesize GCSE Maths Number topic: laws of indices, negative and fractional indices, standard form, calculations using standard form, surds, in that order**
  - Source: Number - GCSE Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/topics/zx82rdm
  - Quote: "NEW: Laws of indices Index notation involves a base number (or variable) raised to a power. Practise multiplying and dividing indices, and raising a power to a power, with video and quizzes. + Quiz: Laws of indices This interactive quiz is suitable for GCSE maths students studying using an index or power, law of indices – multiplication and division, and raising a power to a power. + NEW: Negative and fractional indices Indices may be positive or negative integers, or fractional values. Revise working with negative and fractional indices, with video and interactive activities. + NEW: Standard form Standard form is a way to write very large and very small numbers so they're easier to work with. Practise working with standard form, with quizzes and interactive activities. + Quiz: Standard form This interactive quiz is suitable for GCSE maths students studying standard form, converting from standard form, ordering numbers in standard form, and calculating standard form. + NEW: Calculations using standard form Learn how to add, subtract, multiply and divide standard form with and without a calculator. Practise writing numbers in standard form with quizzes and interactive activities. + Surds - Higher - Cambridge OCR"
- **Bitesize AQA Laws of indices guide pages in order: index, multiplication, division, power of a power, power of zero, negative indices, fractional indices (Higher)**
  - Source: Using an index or power - Laws of indices - AQA - GCSE Maths Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z826y4j/revision/1
  - Quote: "Pages 1. Using an index or power 2. Law of indices – multiplication 3. Law of indices – division 4. Raising a power to a power 5. Letters or numbers to the power of zero 6. Negative indices"
- **Bitesize Higher surds guide pages in order**
  - Source: Surds - Higher - Surds - Higher - Edexcel - GCSE Maths Revision - Edexcel - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zg6vcj6/revision/1
  - Quote: "1. Surds - Higher 2. Simplifying surds 3. Adding and subtracting surds 4. Multiplying and dividing surds 5. Multiplying out brackets including surds 6. Rationalising denominators"

My reading: the UK order for a GCSE student is index notation, the three laws (multiply, divide, power of a power), zero,
negative indices, fractional indices (Higher), standard form, calculations in standard form, then surds (Higher). Bitesize
puts zero and negative indices after the three laws, as Brilliant does, and explains zero from a term divided by itself
(section 4.3). The AQA guide's seventh page, "Fractional indices - Higher", was cut off in the
tool result (seen only as "7. …"), so it is not in the quote above.

### 2.3 HELM (Loughborough, Helping Engineers Learn Mathematics)
- **HELM Workbook 1, Basic Algebra: Section 1.2 is Indices (pages 21 to 39), between notation and simplification**
  - Source: HELM workbook 1 - Basic Algebra. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Algebra.pdf
  - Quote: "1.1 Mathematical Notation and Symbols 2 1.2 Indices 21 1.3 Simplification and Factorisation 40 1.4 Arithmetic of Algebraic Fractions 62 1.5 Formulae and Transposition 78"
- **HELM 1.2 Indices: introduction and learning outcomes**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Algebra.pdf
  - Quote: "Indices, or powers, provide a convenient notation when we need to multiply a number by itself several times. In this Section we explain how indices are written, and state the rules which are used for manipulating them. ... perform calculations using indices _•_ state and use the laws of indices _•_ use scientific notation"
- **HELM Workbook 5 Functions and Modelling (49 pages) includes Inverse Square Law Modelling**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2049%20Student's%20Guide.pdf
  - Quote: "Workbook 5 - Functions and Modelling (49 pages) 5.1 The Modelling Cycle and Functions 5.2 Quadratic Functions and Modelling 5.3 Oscillating Functions and Modelling 5.4 Inverse Square Law Modelling"

My reading: HELM puts Indices as one 19-page section (pages 21 to 39 of Workbook 1) between notation and simplification, and
it covers, in this order, index notation, the three laws, polynomial expressions, negative indices, fractional indices and
scientific notation. Inverse square law modelling is in Workbook 5 (Functions and Modelling), not in the indices section.

### 2.4 Bird's Engineering Mathematics (Routledge, the engineers' textbook)
- **Bird's Basic Engineering Mathematics (8th ed.) contents: chapter 7 Powers, roots and laws of indices; chapter 8 Units, prefixes and engineering notation; then algebra**
  - Source: Bird's Basic Engineering Mathematics - 8th Edition - John Bird - Routl. https://www.routledge.com/Birds-Basic-Engineering-Mathematics/Bird/p/book/9780367643676
  - Quote: "1. Basic arithmetic 2. Fractions 3. Decimals 4. Using a calculator 5. Percentages 6. Ratio and proportion 7. Powers, roots and laws of indices 8. Units, prefixes and engineering notation 9. Basic algebra 10. Further algebra 11. Solving simple equations 12. Transposing formulae 13. Solving simultaneous equations 14. Solving quadratic equations"
- **Bird's Basic Engineering Mathematics: Powers, roots and laws of indices is 7 pages, Units, prefixes and engineering notation is 19 pages**
  - Source: Bird's Basic Engineering Mathematics | John Bird | Taylor & Francis eB. https://www.taylorfrancis.com/books/mono/10.1201/9781003124214/bird-basic-engineering-mathematics-john-bird
  - Quote: "Chapter 7 | 7 pages #### Powers, roots and laws of indices Title Abstract Get Access ### chapter Chapter 8 | 19 pages"
- **Bird's Engineering Mathematics (9th ed.) puts Indices, engineering notation and metric conversions in chapter 2 of Number and algebra**
  - Source: Bird's Engineering Mathematics - 9th Edition - John Bird - Routledge B. https://www.routledge.com/Birds-Engineering-Mathematics/Bird/p/book/9780367643782
  - Quote: "Section 1: Number and algebra 1. Revision of fractions, decimals and percentages 2. Indices, engineering notation and metric conversions 3. Binary, octal and hexadecimal numbers"
- **Bird, Science and Mathematics for Engineering, 6th ed.: Indices, units, prefixes and engineering notation is chapter 3 of Applied Mathematics**
  - Source: Science and Mathematics for Engineering - 6th Edition - John Bird - Ro. https://www.routledge.com/Science-and-Mathematics-for-Engineering/Bird/p/book/9780367204747
  - Quote: "3. Indices, units, prefixes and engineering notation 4. Calculations and evaluation of formulae Revision Test 2: Indices, units, calculator and evaluation of formulae"
- **Bird (Engineering Mathematics): 'Powers and roots are used extensively in mathematics and engineering' (the chapter's own reason to learn them) (SECONDARY)**
  - Source: Engineering Mathematics. https://ndl.ethernet.edu.et/server/api/core/bitstreams/25573b53-0874-44cd-bd90-5c76215d1e73/content
  - Quote: "Why it is important to understand: Indices, standard form and engineering notation Powers and roots are used extensively in mathematics and engineering, so it is important to get a good grasp of what they are and how, and why, they are used."

My reading: the engineers' order puts the indices and the units, prefixes and engineering notation straight after ratio and
proportion and before algebra. Bird gives units and prefixes a chapter of their own, nearly three times the pages of the
indices chapter (19 against 7 in the 8th edition), so the engineers' book treats units as the bigger job. None of the Bird
contents lists I saw has a chapter on surds (the 9th edition list came back cut short, so that one is incomplete).

**What the five orders agree on:** whole-number powers, then the laws, then zero and negative, then fractions as roots, with
standard form after (Brilliant puts roots earlier and standard form last; Khan puts roots before fractional exponents and
standard form in Pre-algebra). Only Bird and HELM make the engineering notation and the SI prefixes part of the topic.

---

## 3. What a marine engineering HNC actually uses of this topic

### 3.1 SQA Higher National: Engineering Mathematics 1 (H7K0 33) and an older unit
- **SQA H7K0 33 Engineering Mathematics 1 (SCQF level 6): unit purpose and outcomes**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K033.pdf
  - Quote: "This Unit is designed to develop or consolidate a basic level of mathematical skills required of learners across a range of Engineering disciplines. The Unit provides learners with opportunities to develop knowledge, understanding and skills to solve mathematical problems including polynomial, trigonometrical, exponential and logarithmic functions. Learners will also be introduced to 3-dimensional vectors and complex numbers. # Outcomes On successful completion of the Unit the learner will be able to: 1 Solve problems involving functions and trigonometric equations. 2 Solve problems involving exponential and logarithmic equations."
- **SQA H7K0 33: "Fractional and negative coefficients and indices should be included."**
  - Source: Engineering Mathematics 1 (SCQF level 6) Unit code: H7K0 33. https://www.sqa.org.uk/files/hn/H7K033.pdf
  - Quote: "Fractional and negative coefficients and indices should be included."
- **SQA H7K0 33 Outcome 2 delivery notes: transpose and evaluate expressions from Engineering that include an exponential term (A e^kt, garbled in the PDF text)**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K033.pdf
  - Quote: "Transpose and evaluate expressions from Engineering which include the term"
- **SQA H7K0 33 entry: National 5 Maths or equivalent expected**
  - Source: national unit specification: general information. https://www.sqa.org.uk/sqa/files/hn/H7K033.pdf
  - Quote: "Learners considering taking this Unit will normally be expected to have passed the NQ Unit _Mathematics: Technician 1_ , or Intermediate 2 in Mathematics or National 5 in Mathematics or equivalent."
- **SQA older HN unit Introductory Mathematics for Engineering: algebraic expressions include brackets, fractions and indices; a current law is described with an exponential**
  - Source: SCOTTISH VOCATIONAL EDUCATION COUNCIL. http://www.sqa.org.uk/files/hn/D7481997.pdf
  - Quote: "Algebraic expressions: brackets; fractions; indices. ... leaving your answer with positive indices."

My reading: powers and indices are assumed tools in the SQA HN unit, not a topic it teaches: the unit is about exponential and
logarithmic functions and says "Fractional and negative coefficients and indices should be included" in its Outcome 2
assessment. The entry level is National 5, which includes surds (4.6), so the HN unit does not teach them. The older
SQA unit names "indices" in its algebraic expressions and asks for answers "with positive indices".

### 3.2 Pearson BTEC Higher National, Unit 4002 Engineering Maths
- **Pearson BTEC HN Unit 4002 Engineering Mathematics LO1 essential content starts with dimensional analysis, and pass criterion P1**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "Mathematical concepts: Dimensional analysis ... P1 Apply dimensional analysis techniques to solve complex engineering/manufacturing problems."
- **Pearson BTEC HN Unit 4002 P3: engineering equations using exponential, logarithmic, trigonometric and hyperbolic functions**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "P3 Determine solutions of engineering equations using exponential, logarithmic, trigonometric, and hyperbolic functions."
- **Pearson BTEC Level 3 Mathematics for Engineering Technicians: laws of indices at the level below the HN**
  - Source: Unit 3: Mathematics for Engineering Technicians. https://qualifications.pearson.com/content/dam/pdf/new-apprenticeships/sales-at-events/Engineering%20and%20Manufacturing/Unit%202%20Mathematics%20for%20Engineering%20Technicians.pdf
  - Quote: "Indices and logarithms: laws of indices (𝑎 𝑚 𝑥 𝑎 𝑛 = 𝑎 𝑚+𝑛 , 𝑎 𝑚 𝑎 𝑛 = 𝑎𝑚−𝑛 , (𝑎𝑚) 𝑛 = 𝑎𝑚𝑛 ) laws of logarithms (log 𝐴 + log 𝐵 = log 𝐴𝐵 , log 𝐴 𝑛 = 𝑛 log 𝐴, log 𝐴 − log 𝐵 = log 𝐴 𝐵 ) e.g. common logarithms (base 10), natural logarithms (base e), exponential growth and decay."

My reading: Unit 4002's first listed method is **dimensional analysis**, which is working with units written as powers
(section 4.8). The unit is explicit about exponential functions and logarithms (P3), which depend on the laws of indices. The
Level 3 engineering technicians' unit shows the three laws at the level below the HN. The unit descriptor excerpt I saw does
not list indices as a separate heading, so how much the HN lecturer re-teaches them is **UNCONFIRMED**.

### 3.3 MCA engineer officer syllabuses (the exams a marine engineer sits)
- **MCA Second Engineer Mathematics syllabus 2.1: index (power), fractional, negative and zero indices, rules for indices**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "6. Defines the term index (power). 7. States what is meant by fractional, negative and zero indices. 8. States the rules for addition, subtraction and product of indices. 9. Solves problems related to 2.1.6, 2.1.7 and 2.1.8."
- **MCA Second Engineer Mathematics syllabus section 3 Logarithms: laws of logarithms to evaluate powers, "not directly examinable but such knowledge will be assumed"**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "3.1 Uses logarithms to under take simple calculations (not directly examinable but such knowledge will be assumed) 1. Defines logarithms. 2. States laws of logarithms. 3. Uses laws of logarithms to evaluate powers etc."
- **MCA General Engineering Science I: "addition, subtraction and product of indices, including fractional indices"**
  - Source: General Engineering Science I Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses
  - Quote: "2. Solve problems related to addition, subtraction and product of indices, including fractional indices."
- **MCA General Engineering Science I: convert units of pressure between N/m2, pascals and bar**
  - Source: General Engineering Science I Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses
  - Quote: "2. Convert units of pressure between N/m ² , Pascals and bar, gauge and absolute and vice versa."
- **MCA Applied Heat 1.1: standard atmospheric pressure written in standard form, 1.01325 x 10^5 N/m2**
  - Source: Applied Heat Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-heat-written-examination-syllabus
  - Quote: "3. States that standard atmospheric pressure is 1.01325 bar = 1.01325 x 10 ⁵ N/m"
- **MCA Applied Heat 4.1: derive the units of the characteristic gas constant R from the units of pressure, volume, temperature and mass**
  - Source: Applied Heat Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-heat-written-examination-syllabus
  - Quote: "7. Derives the units of the Characteristic Gas Constant R from the units of pressure, volume, temperature and mass."
- **MCA Applied Heat 4.2: isothermal, adiabatic and polytropic operations on a pV diagram; work done as the area**
  - Source: Applied Heat Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-heat-written-examination-syllabus
  - Quote: "4. Defines: 1. an Isothermal operation; 2. an Adiabatic operation; 3. a Polytropic operation. ... 6. Shows that the area of the pV diagram represents W.D. during the operation."
- **MCA Applied Heat 7.1: an operation following pV^n = a constant is a hyperbolic operation for a vapour**
  - Source: Applied Heat Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-heat-written-examination-syllabus
  - Quote: "States that an operation following the law pV n = a constant is a hyperbolic operation when the working fluid is a vapour."
- **MCA Marine Electro-Technology 1.1: resistance, inductance and capacitance in terms of physical dimensions; numerical problems from physical parameters**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Describes resistance, inductance and capacitance in terms of physical dimensions and materials. 4. Solves numerical problems relating R, L and C to their physical parameters."
- **MCA Marine Electro-Technology 2.1: power and energy in dc resistive circuits**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "8. Solves problems on power and energy in dc resistive circuits."
- **MCA Applied Mechanics 9.1: D'Arcy's formula for friction losses in pipelines**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "States D’Arcy’s formula for friction losses in pipelines."

My reading: the best syllabus lines for this course are MCA Mathematics 2.1.6 to 2.1.9 (index, fractional, negative and zero
indices, the rules) and General Engineering Science I ("including fractional indices"). The MCA line "States the rules for
addition, subtraction and product of indices" is the laws of indices in the loose wording of that syllabus (adding exponents
when multiplying, subtracting when dividing; the power of a power is not named in that line). The Applied Heat syllabus writes
standard atmospheric pressure in standard form itself, asks for the **units of R** to be derived from pressure, volume,
temperature and mass (powers of units), and has pV^n = a constant. The Marine Electro-Technology syllabus has resistance, L and
C "in terms of physical dimensions" (R = ρL/A, section 7). The MCA Mathematics syllabus lists logarithms as "not directly
examinable but such knowledge will be assumed", which belongs to Exponentials and logarithms.

### 3.4 Warsash (Solent University) engineer cadets
- **Warsash (Solent) engineer cadet maths refresher: why marine engineers study mathematics**
  - Source: Engineer cadets maths refresher. https://maritime.solent.ac.uk/documents/training-at-warsash/engineer-cadets-maths-refresher.pdf
  - Quote: "In applied heat, electrics, and mechanics you will need to demonstrate your understanding of new ideas and concepts through answering descriptive questions and questions that require you to calculate numerical answers. The mathematics that you study during your first academic session as an engineering cadet will help you to develop the mathematical skills to enable you to tackle these numerical questions. ... Below you will find also a collection of mathematical notes from www.mathcentre.ac.uk to help you in your preparation for your"
- **Warsash Engineer Cadet HND phase 1 includes Maritime Mathematics for Engineers**
  - Source: Engineer Cadet - Higher National Diploma Programme | Warsash Maritime. https://maritime.solent.ac.uk/courses/engineering-and-electro-technical/engineer-cadet-hnd
  - Quote: "Phase 1 * 27 weeks * Maritime Electrical Machines * Maritime Mathematics for Engineers"
- **Warsash refresher leaflet Indices or Powers: aims**
  - Source: Engineer cadets maths refresher. https://maritime.solent.ac.uk/documents/training-at-warsash/engineer-cadets-maths-refresher.pdf
  - Quote: "Indices or Powers ## After reading this text, and/or viewing the video tutorial on this topic, you should be able to: • simplify expressions involving indices • use the rules of indices to simplify expressions involving indices • use negative and fractional indices."
- **Warsash refresher leaflet Surds, and other roots: aims**
  - Source: Engineer cadets maths refresher. https://maritime.solent.ac.uk/documents/training-at-warsash/engineer-cadets-maths-refresher.pdf
  - Quote: "Surds, and other roots ## After reading this text, and/or viewing the video tutorial on this topic, you should be able to: • understand the relationship between negative powers and positive powers; • understand the relationship between fractional powers and whole-number powers;"

My reading: Warsash sends its cadets a refresher of mathcentre leaflets before the HND, and the list includes "Indices or
Powers", "Surds, and other roots" and "Units and Prefixes". So the college pre-reading puts surds in the same leaflet as
negative and fractional powers, and the Warsash HND's first phase has a module called Maritime Mathematics for Engineers.
The aims of the surds leaflet are the links between negative and positive powers and between fractional and whole-number
powers, not rationalising denominators. I could not see the HND module's content, so how far it goes into surds is **UNCONFIRMED**.

**Surds, only as far as the HNC needs.** I found no HN, MCA or Bird line that asks for surds as a topic (that is a statement
about the pages the tools returned, not proof that none exists: **UNCONFIRMED**). The only syllabus line that names them is
Pearson's A level (below, in 4.6), which is beyond the HNC. The brief should keep surds to what roots need: keeping √2 as an
exact value, √48 = 4√3 by splitting out a square, and that the root of a sum is not the sum of roots.

---

## 4. The scope to cover, and what research says about each part

### 4.1 Whole-number powers as repeated multiplying
- **A power says how many times a number is multiplied by itself (Bitesize AQA guide)**
  - Source: Using an index or power - Laws of indices - AQA - GCSE Maths Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z826y4j/revision/1
  - Quote: "The power or index shows how many times a number has been multiplied by itself."
- **Bitesize: for a positive integer index, the term shows how many times to use the base in a multiplication**
  - Source: Laws of indices - GCSE Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zf4s9ty
  - Quote: "For a positive integer index, the term represents how many times to use the base in a multiplication."

### 4.2 The index laws, shown with counting (multiply, divide, power of a power)
- **Bitesize: write the multiplication in full to see why indices add (9 cubed times 9 to the 5)**
  - Source: Laws of indices for multiplication and division - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z93nsk7
  - Quote: "Writing the calculation in full can help to understand how the law of multiplication works. 9 cubed is 9 x 9 x 9 and 9 to the power of 5 is 9 x 9 x 9 x 9 x 9. The base numbers are the same (9), so add the indices together (3 + 5 = 8). 9³ x 9⁵ = 9⁸"
- **Bitesize: the index law for multiplication only works if the base numbers are the same**
  - Source: Laws of indices for multiplication and division - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z93nsk7
  - Quote: "The index law for multiplication only works if the base numbers are the same. Eg, in the calculation 2² x 2³ the base numbers are the same (2)."
- **Bitesize: dividing powers, the common factors of 8 cross out**
  - Source: Laws of indices for multiplication and division - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z93nsk7
  - Quote: "When dividing indices, if the base values are the same , the expression can be simplified by subtracting the indices. ... Three of the eights from the top row and all of the eights on the bottom row have been crossed out – leaving eight multiplied by eight equals eight squared."
- **mathcentre (Warsash leaflet): the first and second rules from a³ x a² and (a⁴)³**
  - Source: Engineer cadets maths refresher. https://maritime.solent.ac.uk/documents/training-at-warsash/engineer-cadets-maths-refresher.pdf
  - Quote: "Suppose we have _a_ ³ and we want to multiply it by _a_ ² . That is ... But note also that 12 is 4 × 3. This suggests that if we have _a_ _m_ all raised to the power _n_ the result is obtained by multiplying the two powers"
- **HELM Key Point 5: the three laws of indices**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Algebra.pdf
  - Quote: "There is a set of rules which enable us to manipulate expressions involving indices. These rules are known as the laws of indices , and they occur so commonly that it is worthwhile to memorise them. ### Key Point 5 Laws of Indices The laws of indices state: First law : _a_ _m_ _×_ _a_ _n_ = _a_ _m_ + _n_ add indices when multiplying numbers with the same base ... Third law : ( _a_ _m_ ) _n_ = _a_ _mn_ multiply indices together when raising a number to a power"
- **HELM: (3x)² = 9x², and (−xy)² against (−xy)³**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Algebra.pdf
  - Quote: "Noting that 3 = 3 ¹ and _x_ = _x_ ¹ then (3 _x_ ) ² = (3 ¹ _x_ ¹ ) ² = 3 ² _x_ ² = 9 _x_ ²"
- **HELM formula sheet in the student guide: the laws of indices, zero, negative and fractional**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2049%20Student's%20Guide.pdf
  - Quote: "Laws of Indices _a_ _m_ _a_ _n_ = _a_ _m_ + _n_ _a_ _m_ _a_ _n_ = _a_ _m_ _−_ _n_ ( _a_ _m_ ) _n_ = _a_ _mn_ _a_ ⁰ = 1 _a_ _−_ _m_ = ¹ _a_ _m_ _a_ ¹ _/n_ = _n_ _√_ _a a_ _m n_ = ( _n_ _√_ _a_ ) _m_"

My reading: all four sources show the law by writing the factors out: 9³ × 9⁵ is three nines then five nines, so eight nines
(Bitesize); division crosses factors off the top and bottom (Bitesize); a power of a power stacks 4 groups three times, so
4 × 3 = 12 (mathcentre). That is a counting picture a learner can drag and watch. The laws only work with the same base
(Bitesize), and HELM adds the bracket form ((3x)² = 9x²) which is the most common slip (section 6.5).

### 4.3 Zero and negative powers from the pattern
- **Bitesize: a base to the power of zero is one, because a term divided by itself is one**
  - Source: Negative and fractional indices - GCSE Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zrqr7v4
  - Quote: "A base to the power of zero is equal to one: * 𝑎\(^0\) = 1 * 3\(^0\) = 1 A term divided by itself is equal to one: * 𝑛\(^4\) ÷ 𝑛\(^4\) = 1 * 5 ÷ 5 = 1"
- **OpenStax Algebra 1: the zero exponent property comes from simplifying a^m divided by a^m two ways**
  - Source: 5.1.3 Using Zero Exponent Property and Negative Exponents - Algebra 1 | OpenStax. https://openstax.org/books/algebra-1/pages/5-1-3-using-zero-exponent-property-and-negative-exponents
  - Quote: "simplify in two ways to lead us to the definition of the Zero Exponent Property . In general, for : Mathematical explanation showing a^m divided by a^m equals a^(m-m), which equals a^0, illustrated with m factors cancelling to 1."
- **Bitesize: a negative index is a reciprocal**
  - Source: Negative and fractional indices - GCSE Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zrqr7v4
  - Quote: "A negative index represents a reciprocal : a^-n=1/a^n. * A term and its reciprocal have a product of 1: bx1/b=1."
- **mathcentre (Warsash leaflet): extend the pattern 4³, 4², 4¹, 4⁰ downwards; a negative power gives the reciprocal; a negative power does not give a negative number**
  - Source: Engineer cadets maths refresher. https://maritime.solent.ac.uk/documents/training-at-warsash/engineer-cadets-maths-refresher.pdf
  - Quote: "But what if we have negative powers? What would be the value of 4 − ³ ? ### To find out, we shall look at what we know already: ... So a negative power gives the reciprocal of the number — that is, 1 over the number. Thus 4 − ² = 1 _/_ 4 ² = ¹ , and 4 − ¹ = 1 _/_ 4 ¹ = ¹ . Similarly, ... ### 3 9 5 − ³ = ¹ 5 ³ ### A common misconception is that since the power is negative, the result must be negative: as you can see, this is not so."
- **HELM Key Point 9: negative powers; Key Point 6: zero and one**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Algebra.pdf
  - Quote: "Any non-zero number raised to the power 0 has the value 1, that is _a_ ⁰ = 1 Any number raised to power 1 is itself ... Thus a negative index can be used to indicate a reciprocal."

My reading: two routes are in the sources, and both are worth putting in the lesson. (1) A term divided by itself is one, so
n⁴ ÷ n⁴ = n⁴⁻⁴ = n⁰ = 1 (Bitesize, OpenStax). (2) Run the pattern 4³, 4², 4¹ down by dividing by 4 each time (64, 16, 4, 1, ¼, 1/16)
(mathcentre). Research agrees the pattern route is the repair (section 6.1). The mathcentre leaflet also names the common
mistake: "since the power is negative, the result must be negative".

### 4.4 Roots
- **Bitesize: the symbol means square root, and the root of 36 is 6**
  - Source: Power and roots - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zpk62v4
  - Quote: "The symbol (\sqrt{}) means square root, so: (\sqrt{36}) means 'the square root of ({36})'. (\sqrt{36} = 6)"
- **Bitesize: the cube root is the opposite of cubing**
  - Source: Power and roots - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zpk62v4
  - Quote: "The opposite of cubing a number is called finding the cube root ."
- **HELM: there are always two square roots of a positive number, written ±**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Algebra.pdf
  - Quote: "There are always two square roots of a non-zero positive number, and we write 16 1 2 = _±_ 4 ### Key Point 10 In general _a_ 1 2 is a square root of _a a_ _≥_ 0"

**Convention, not fact (contested point):** HELM says "There are always two square roots of a non-zero positive number" and
writes 16^(1/2) = ±4, where Bitesize gives √36 = 6 (and calculators agree). The lesson should say the √ sign and the calculator's
power key give the positive root, and that the equation x² = 36 has two answers, 6 and −6. HELM's note that "calculators
normally give only one root when there may be others" is the same point.

### 4.5 Fractional powers as roots
- **mathcentre (Warsash leaflet): 4^(1/2) x 4^(1/2) = 4, so 4^(1/2) is the square root of 4; other fractions give other roots**
  - Source: Engineer cadets maths refresher. https://maritime.solent.ac.uk/documents/training-at-warsash/engineer-cadets-maths-refresher.pdf
  - Quote: "Using the rules of indices, we know that 4 ¹ _/_ ² × 4 ¹ _/_ ² = 4 ¹ = 4 because ¹ √+ ¹ = 1. So 4 ¹ _/_ ² equals 2 2, as 2 × 2 = 4. Therefore 4 ¹ _/_ ² is the square root of 4."
- **Bitesize: the denominator of a fractional index is the root and the numerator is the power; simplest to take the root first**
  - Source: Negative and fractional indices - GCSE Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zrqr7v4
  - Quote: "A fractional index has a denominator and a numerator : * The denominator represents a root. + 2 gives a square root. + 3 gives a cube root. + 4 gives the fourth root and so on. a^m/n=(^n√a^)^m * The numerator represents a power. + 2 gives a square. + 3 gives a cube. + 4 gives the fourth power and so on. Generally, it is simpler to evaluate the root and then the power."
- **HELM: (8^(1/3))³ = 8, so 8^(1/3) is the cube root of 8; calculators give only one root**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Algebra.pdf
  - Quote: "so that 8 1 3 is a number which when cubed equals 8. Thus 8 1 3 is the cube root of 8 ... but be aware that calculators normally give only one root when there may be others."
- **mathcentre (Warsash leaflet): take the cube root first, because it needs smaller numbers**
  - Source: Engineer cadets maths refresher. https://maritime.solent.ac.uk/documents/training-at-warsash/engineer-cadets-maths-refresher.pdf
  - Quote: "Doing this calculation the first way is usually easier as it requires recognising powers of smaller numbers. For example, it is straightforward to evaluate 27 ⁵ _/_ ³ as 5 3 1 3 5 52 = (2 = = 243 because, at least with practice, you will know that the cube root of 27 is 3. Whereas, evaluation in the following way 5 3 5 1 3 1 3 27 = (27 ) = 14348907 would require knowledge of the cube root of 14348907."
- **HELM student guide: powers and roots of positive numbers commute, (sqrt x)^3 = sqrt(x^3), so root first or power first gives the same answer**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2049%20Student's%20Guide.pdf
  - Quote: "true for some combinations of operations. Examples are: 1. Powers and roots of positive numbers: ( _√_ _x_ ) ³ ="

My reading: the argument that makes a^(1/2) a root needs only the first law (a^(1/2) × a^(1/2) = a^1), the same counting
idea as 4.2, so fractional powers can be reached with the laws Dan already has. The denominator is the root and the numerator
the power (Bitesize), and the root first makes the numbers smaller (Bitesize, mathcentre). HELM's student guide says powers and
roots of positive numbers commute, (√x)³ = √(x³), so "root first" is a choice of convenience and not a different answer.

### 4.6 Simplifying surds, only as far as the HNC needs
- **Bitesize: what a surd is, and why exact form matters**
  - Source: Surds - Higher - Surds - Higher - Edexcel - GCSE Maths Revision - Edexcel - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zg6vcj6/revision/1
  - Quote: "A surd is an expression that includes a square root, cube root or other root symbol. Surds are used to write irrational numbers precisely – because the decimals of irrational numbers do not terminate or recur, they cannot be written exactly in decimal form. Example This square has an area of 3 m 2 . Write down the exact length of the side of the square. The area of the square = 3m^2 The length of the side is √3 m. This answer is in surd form. It is irrational and it is said to be "in exact form". A decimal answer, such as 1.73 (2 decimal places), is not exact."
- **Bitesize: surds simplify when the number under the root has a square factor; the rules for roots of products**
  - Source: Simplifying surds - Surds - Higher - Eduqas - GCSE Maths Revision - Eduqas - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z938xfr/revision/2
  - Quote: "Surds can be simplified if the number in the root symbol has a square number as a factor"
- **Bitesize: keeping numbers in surd form avoids rounding errors**
  - Source: Simplifying surds - Surds - Higher - Eduqas - GCSE Maths Revision - Eduqas - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z938xfr/revision/2
  - Quote: "Keeping numbers in surd form avoids rounding errors, which may affect a calculation requiring precise results."
- **HELM Key Point 13: the root of a product splits, but the root of a sum does not**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Algebra.pdf
  - Quote: "we may write _√_ 48 as _√_ 3 _×_ 16 = _√_ 3 _√_ 16 = 4 _√_ 3. ... Although this rule works for multiplication we should be aware that it does not work for addition or subtraction"
- **Pearson A level Mathematics: "Use and manipulate surds, including rationalising the denominator" (an A level line, beyond the HN content found)**
  - Source: A level Mathematics Specification - Pearson qualifications. https://qualifications.pearson.com/content/dam/pdf/A%20Level/Mathematics/2017/specification-and-sample-assesment/a-level-l3-mathematics-specification-issue4.pdf
  - Quote: "2.2 Use and manipulate surds, including rationalising the denominator."
- **maths.scot (National 5, the entry level for the SQA HN unit): what a surd is, and that square roots are the main interest**
  - Source: Surds – National 5 Maths – Free Study Resources. https://www.maths.scot/nat5/surds
  - Quote: "A surd is a number that cannot be simplified to remove a root sign. Surds are examples of irrational numbers. An irrational number cannot be written as a fraction with integer numerator and denominator. At Nat 5, we are mainly interested in square roots, although surds also include cube roots, fourth roots, etc."

My reading: keep surds to "exact value" (√2 as the diagonal of a unit square), pulling out a square factor (√48 = 4√3) and
the root of a sum warning. Rationalising denominators is on the A level and GCSE Higher lists above but I found no HN or MCA
line that asks for it. Bitesize's "keeping numbers in surd form avoids rounding errors" is the engineer's reason to do any of
this at all.

### 4.7 Standard form, engineering notation and the SI prefixes (milli, micro, kilo, mega)
- **Bitesize: the definition of standard form**
  - Source: What is standard form? - GCSE Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zc7c239
  - Quote: "A number in standard form is written as 𝐴 × 10(^𝑛), where 𝐴 is a number that is greater or equal to one and less than 10 (1 ≤ 𝐴 <10) and 𝑛 is an integer."
- **Bitesize: positive n moves digits left; negative n moves them right**
  - Source: What is standard form? - GCSE Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zc7c239
  - Quote: "Where 𝑛 is positive, the number is larger than 𝐴. * Each digit in 𝐴 moves 𝑛 places to the left. * Gaps between the digits of 𝐴 and the decimal point are filled with placeholder zeros . * Where 𝑛 is negative, the number is smaller than 𝐴. * Each digit in 𝐴 moves 𝑛 places to the right."
- **Bitesize: standard form is also called standard index form or scientific notation**
  - Source: What is standard index form in maths? - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zh4ny4j
  - Quote: "In standard form, numbers are recorded as a number between 1 and 10 multiplied by a power of ten. This is also called standard index form or scientific notation"
- **Bitesize: adding in standard form uses the same power of ten; multiplying adds the indices; the calculator EXP button**
  - Source: Calculations using standard form - GCSE Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z424mbk
  - Quote: "Rewrite the values so that the numbers use the lower power of ten . For example, for a problem involving 10² and 10⁷, 10² is a lower power of ten than 10⁷. 5. Rewrite the calculation as an addition or subtraction multiplied by the power of ten. 6. Write the answer to the calculation multiplied by the power of ten. 7. Make sure the final answer is written correctly in standard form. To correct numbers written improperly in standard form: 8. Write the number in standard form multiplied by the power of ten. 9. Simplify the powers of ten by adding the indices . ... Using the ×10(^x), EXP or EE button will keep the whole number together, including the ‘times-ten-to-the-power’ part, so no brackets are needed when using that number in a calculation."
- **LibreTexts (Fiore): the only difference between scientific and engineering notation is that the exponent is a multiple of three; the prefix list (SECONDARY)**
  - Source: 1.3: Scientific and Engineering Notation - Engineering LibreTexts. https://eng.libretexts.org/Bookshelves/Electrical_Engineering/Electronics/Laboratory_Manual_-_DC_Electrical_Circuit_Analysis_(Fiore)/01:_The_Electrical_Laboratory/1.3:_Scientific_and_Engineering_Notation
  - Quote: "The only difference between scientific notation and engineering notation is that for engineering notation the exponent is always a multiple of three. Thus, 45E9 is proper engineering notation but 4.5E10 isn’t. ... Engineering notation goes one step further by using a set of prefixes to replace the multiples of three for the exponent. The prefixes are: * E12 = Tera (T) | E9 = Giga (G) | E6 = Mega (M) | E3 = kilo (k) * E−3 = milli (m) | E−6 = micro ((\mu)) | E−9 = nano (n) | E−12 = pico (p)"
- **LibreTexts (Fiore): kilo times micro gives milli; 23,000 volts is 23 kilovolts (SECONDARY)**
  - Source: 1.3: Scientific and Engineering Notation - Engineering LibreTexts. https://eng.libretexts.org/Bookshelves/Electrical_Engineering/Electronics/Laboratory_Manual_-_DC_Electrical_Circuit_Analysis_(Fiore)/01:_The_Electrical_Laboratory/1.3:_Scientific_and_Engineering_Notation
  - Quote: "Thus, 23,000 volts could be written as 23E3 volts or simply 23 kilovolts. ... Given enough practice it will become second nature that kilo (E3) times micro (E−6) yields milli (E−3)."
- **Wolfram MathWorld: engineering notation has an exponent divisible by 3; 16 of the 20 SI prefixes match (SECONDARY)**
  - Source: Engineering Notation -- from Wolfram MathWorld. https://mathworld.wolfram.com/EngineeringNotation.html
  - Quote: "Engineering notation is a version of scientific notation in which the exponent p in expressions of the form a×10^p is chosen to always be divisible by 3. ... 16 of the 20 SI prefixes (excluding centi-, deci-, deka-, and hecto-) correspond to engineering notation."
- **NIST Guide to the SI ch. 7: choose a prefix so the number is between 0.1 and 1000, and prefer powers of ten that are multiples of 3**
  - Source: NIST Guide to the SI, Chapter 7: Rules and Style Conventions for Expressing Values of Quantities | NIST. https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-7-rules-and-style-conventions-expressing-values
  - Quote: "It is often recommended that, for ease of understanding, prefix symbols should be chosen in such a way that numerical values are between 0.1 and 1000, and that only prefix symbols that represent the number 10 raised to a power that is a multiple of 3 should be used."
- **BIPM: the SI prefixes mega, kilo, milli, micro and their factors**
  - Source: SI prefixes - BIPM. https://www.bipm.org/en/measurement-units/si-prefixes
  - Quote: "giga | #### G | 10 9 * mega | #### M | 10 6 * kilo | #### k | 10 3 * hecto | #### h | 10 2 * deca | #### da | 10 1 * deci | #### d | 10 –1 * centi | #### c | 10 –2 * milli | #### m | 10 –3 * micro | #### µ | 10 –6"
- **NIST SP 811: the final vowel is dropped in megohm and kilohm**
  - Source: Guide for the Use of the International System of Units (SI). https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication811e2008.pdf
  - Quote: "Reference [6] points out that there are three cases in which the final vowel of an SI prefix is commonly omitted: megohm ( not megaohm), kilohm ( not kiloohm), and hectare ( not hectoare)"

My reading: Bitesize's standard form is A × 10ⁿ with 1 ≤ A < 10 and n a whole number; engineering notation is the same with
n a multiple of three, so A can be 1 to 999, and the multiple-of-three exponents are exactly the prefixes micro (10⁻⁶), milli
(10⁻³), kilo (10³), mega (10⁶). Multiplying adds the exponents, which is the first law again (LibreTexts: kilo (E3) times micro (E−6) yields milli (E−3)). The calculator's EXP key keeps the number together so no brackets are needed (Bitesize), which
is a real mistake on a scientific calculator (section 6.7). UK sources say "standard form" and US sources
say "scientific notation"; Bitesize says they are the same thing (quote above).

### 4.8 Units with powers, and converting them (mm² to m²)
- **NIST Guide to the SI 6.2.3: a prefixed unit symbol is inseparable, and a power applies to the whole symbol, with the cm³ example**
  - Source: NIST Guide to the SI, Chapter 6: Rules and Style Conventions for Printing and Using Units | NIST. https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-6-rules-and-style-conventions-printing-and-using
  - Quote: "The grouping formed by a prefix symbol attached to a unit symbol constitutes a new inseparable symbol (forming a multiple or submultiple of the unit concerned) which can be raised to a positive or negative power and which can be combined with other unit symbols to form compound unit symbols. _Examples:_ 2.3 cm ³ = 2.3 (cm) ³ = 2.3 (10 -2 m) ³ = 2.3 × 10 -6 m ³ 1 cm -1 = 1 (cm) -1 = 1 (10 -2 m) -1 = 10 ² m -1 5000 μs -1 = 5000 (μs) -1 = 5000 (10 -6 s) -1 = 5000 × 10 ⁶ s -1 = 5 × 10 ⁹ s -1 1 V/cm = (1 V)/(10 -2 m) = 10 ² V/m"
- **NIST Guide to the SI 6.1.6: units by division can use a solidus, a horizontal line or negative exponents, for example m/s² or m · s⁻²**
  - Source: NIST Guide to the SI, Chapter 6: Rules and Style Conventions for Printing and Using Units | NIST. https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-6-rules-and-style-conventions-printing-and-using
  - Quote: "Symbols for units formed from other units by division are indicated by means of a solidus (oblique stroke, / ) , a horizontal line, or negative exponents. ... _Example:_ m/s ² or m · s -2 _but not:_ m/s/s m · kg/(s ³ · A) or m · kg · s -3 · A -1 but not: m · kg/s ³ /A Negative exponents should be used in complicated cases."
- **Warsash refresher rule 4: the exponent of a prefixed unit refers to both the unit and its prefix; and force is kg m s⁻² (newtons)**
  - Source: Engineer cadets maths refresher. https://maritime.solent.ac.uk/documents/training-at-warsash/engineer-cadets-maths-refresher.pdf
  - Quote: "the units of force must be; acceleration is measured in units m s − ² and mass is measured in kg so force is measured in kg m s − ² which are called newtons (N) in mechanics. ... The exponent of a unit that has a prefix refers to both the unit and its prefix."
- **Warsash refresher rule: prefixes converted to powers of ten in calculations; compound prefixes such as kµs avoided**
  - Source: Engineer cadets maths refresher. https://maritime.solent.ac.uk/documents/training-at-warsash/engineer-cadets-maths-refresher.pdf
  - Quote: "Compound prefixes should be avoided. For example, k _µ_ s (kilo-micro-second) should be ex- pressed as ms (milli-second) since 1k _µ_ s = 1(10 ³ )(10 − ⁶ )s = 1(10 − ³ )s = 1ms."
- **NIST Guide to the SI 6.2.7: no compound prefixes, so milligrams not microkilograms**
  - Source: NIST Guide to the SI, Chapter 6: Rules and Style Conventions for Printing and Using Units | NIST. https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-6-rules-and-style-conventions-printing-and-using
  - Quote: "For historical reasons, the name "kilogram" for the SI base unit of mass contains the name "kilo," the SI prefix for 10 ³ . ... _Example:_ 10 -6 kg = 1 mg (1 milligram) but not: 10 -6 kg = 1 μkg (1 microkilogram)"
- **Bitesize (Scotland, 3rd level): converting units of area and volume needs the factor squared or cubed**
  - Source: Units of area and volume - Converting units of area and volume - 3rd level Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z6qp2v4/revision/1
  - Quote: "When converting between metric units of area and volume, the numbers you have to multiply or divide by need to be squared for area and cubed for volume."
- **BIPM concise SI: derived units are products of powers of base units; force, pressure, energy, power, resistance**
  - Source: A concise summary of the International System of Units, SI. https://www.bipm.org/documents/20126/41483022/SI-Brochure-9-concise-EN.pdf/2fda4656-e236-0fcb-3867-36ca74eea4e3
  - Quote: "All other quantities may be called “derived quantities” and are expressed using derived units, which can be written as products of powers of base units. Twenty-two derived units are given a special name, as listed in Table 2. Table 2 Derived units with special names in the SI Derived quantity Name of derived unit Symbol for unit Expression in terms of other units plane angle radian rad 1 solid angle steradian sr 1 frequency hertz Hz s −1 force newton N kg m s −2 pressure, stress pascal Pa N/m 2 = kg m −1 s −2 energy, work, amount of heat joule J N m = kg m 2 s −2 power, radiant flux watt W J/s = kg m 2 s −3 ... electric resistance ohm Ω V/A = kg m 2 s −3 A −2"
- **OpenStax University Physics: the unit of resistivity is the ohm-metre; resistance of a cylinder is resistivity x length / area**
  - Source: 9.3 Resistivity and Resistance - University Physics Volume 2 | OpenStax. https://openstax.org/books/university-physics-volume-2/pages/9-3-resistivity-and-resistance
  - Quote: "The unit of resistivity in SI units is the ohm-meter . ... The resistance of a cylindrical segment of a conductor is equal to the resistivity of the material times the length divided by the area"
- **Isaac Science: dimensional analysis catches a mistake in algebra (mass divided by area gives kg/m², not kg/m³)**
  - Source: Dimensional Analysis – Isaac Science. https://isaacscience.org/concepts/cp_dim_analysis
  - Quote: "Dimensional analysis can be used to check if a mistake in your algebra has occurred. For example, if you mistakenly divided a mass by an area to get density, the answer would be in kg/ m 2 . Given that we know density must be in kg/ m 3 we would spot the mistake."
- **OpenStax University Physics 1.4: dimensions obey the rules of algebra, like units**
  - Source: 1.4 Dimensional Analysis - University Physics Volume 1 | OpenStax. https://openstax.org/books/university-physics-volume-1/pages/1-4-dimensional-analysis
  - Quote: "The dimension of any physical quantity expresses its dependence on the base quantities as a product of symbols (or powers of symbols) representing the base quantities. Table 1.3 lists the base quantities and the symbols used for their dimension. For example, a measurement of length is said to have dimension L or L 1 , a measurement of mass has dimension M or M 1 , and a measurement of time has dimension T or T 1 . Like units, dimensions obey the rules of algebra."

My reading: the key fact is NIST's: a prefix and its unit form one inseparable symbol that is raised to the power. So
1 mm² = (10⁻³ m)² = 10⁻⁶ m², which turns "100 mm² in a cm²" and "1 000 000 mm² in a m²" from a table to remember into one
rule. Dan met 1 cm² = 100 mm² by drawing the unit square in Geometry fundamentals lesson 3 (from that brief), so this course
connects the picture to the powers of ten and does not start again from counting squares. NIST's own examples are 2.3 cm³ =
2.3 × 10⁻⁶ m³ and "m · s⁻²" for acceleration. Units such as m s⁻² and kg m⁻³ are products of powers of base units (BIPM), and
checking the powers of the units on both sides of a formula is the dimensional analysis in Pearson's Unit 4002 (3.2).

### 4.9 Powers in formulas he will meet
The formulas are in section 7 with their quotes: P = I²R, the inverse square law, pV^n = C, the pump and fan laws, R = ρL/A with
the cable's area in mm², and flow rate = area × speed. What the research adds is the *question* each formula answers, all of
the same shape: "if this changes by a factor, what happens to that?" (doubling the current quadruples the heat; doubling the
distance quarters the intensity; cutting a pump's speed by a fifth nearly halves its power). That is the same powers idea as
4.2.

**Logarithms wait.** Finding n in pV^n = C from two readings needs logarithms; the Straight-line graphs brief already hands
that to Exponentials and logarithms, so Powers and roots uses pV^n = C with n given (isothermal n = 1, adiabatic n = γ, and
the compressor stroke somewhere in between).

---

## 5. Prerequisites: what this topic leans on

- **Brilliant lists its prerequisites as Negative Numbers and Fractions**
  - Source: Practice Exponents and Radicals | Brilliant. https://brilliant.org/courses/exponents-and-radicals/
  - Quote: "Prerequisites: Negative Numbers, Fractions"
- **Bitesize: a term and its reciprocal have a product of 1 (the fractions link to negative powers)**
  - Source: Negative and fractional indices - GCSE Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zrqr7v4
  - Quote: "A term and its reciprocal have a product of 1: bx1/b=1."

My reading, from the briefs and notes of the built courses (not quotes):
- **Fractions and Negative numbers** (Brilliant's two prerequisites): reciprocals and "dividing by a fraction is multiplying by
  its reciprocal" for negative powers, and the sign rules for powers of a negative. Dan has both.
- **Solving equations and Linear equations:** inverse operations and rearranging a formula. A root is the inverse of a power
  (P = I²R gives I = √(P ÷ R)). He has the moves for linear formulas; the power-and-root version is new.
- **Geometry fundamentals:** the unit square and unit cube, square and cube units, "doubling a side makes four times the area",
  Pythagoras (a square root of a sum of squares) and cable sizes in mm². Powers and roots reuses all of these.
- **Straight-line graphs:** the brief for that course hands one job to this one: plotting y against x² so that y = aX² + b
  is a straight line (it says so under "Left for later courses").
- **Calculus fundamentals:** the power rule uses xⁿ and RMS uses √2 and √3, with whole-number n in the brief. Negative and
  fractional n in the power rule is the same idea as this course (d/dx of √x is x^(−1/2) ÷ 2), but I would not teach that here.
- **Taught inline:** decimal place value for powers of ten (moving the point), the calculator keys x^y, √, EXP and the
  fraction-power key, and the idea of a base and an index. Nothing else from outside the built courses.

**Deferred, with where it goes:**
- Logarithms, log-linear and log-log graphs, finding the exponent in y = axⁿ or pV^n = C, a^x, e^x, growth and decay (Ae^kt):
  **Exponentials and logarithms**.
- Graphs of y = x², y = √x, y = 1/x and other power functions, domain and range: **Functions and their graphs**.
- Solving x² = c in general, factorising, the quadratic formula, polynomials: **Quadratics and polynomials**.
- Angles, sine, cosine: **Trigonometry**; nothing in this topic leads into it.
- Square roots of negative numbers and fractional powers of complex numbers (HELM Workbook 10 uses de Moivre for these):
  **Complex numbers**. Powers and roots uses real roots only.

---

## 6. Misconceptions and learning science, skill by skill

### 6.1 Whole-number powers, and the sign of the base and the exponent
- **Sevgi and Kabalcı 2026 (SAGE Open): students' exponent misconceptions, including 2^ab against (2a)^b and zero exponents**
  - Source: Students’ Misconceptions About Exponents - SAGE Journals. https://journals.sagepub.com/doi/pdf/10.1177/21582440261449038
  - Quote: "Students exhibit several misconceptions regarding exponents, including an inability to calculate exponents, a misunderstanding of the condition of zero exponent, and a failure to distinguish between different exponent cases, such as 2abversus (2a)b."
- **Sevgi and Kabalcı 2026: summary list, including -a^b against (-a)^b, negative exponents, a^b against b^a**
  - Source: Students’ Misconceptions About Exponents - Sevim Sevgi, Semanur Akdemir Kabalcı, 2026. https://journals.sagepub.com/doi/10.1177/21582440261449038
  - Quote: "A misconception of being unable to calculate the value of an exponent has been observed. • The misconception of being unable to determine the zero exponent condition has been observed. • Students experience the misconception of not being able to distinguish between the -a b and (-a) b cases. • It has revealed the misconception of students’ inability to perceive negative exponents. • Students experience a misconception of not being able to distinguish between the situations of a b and b a (where a represents a real variable and b represents a natural number). • Regarding conceptual knowledge, students could not comprehend the exponents in their minds, meaning they confused the concepts of exponent and base."
- **Sevgi and Kabalcı 2026: students read the zero exponent as base times exponent and answer zero, or add and answer the base**
  - Source: Students’ Misconceptions About Exponents - Sevim Sevgi, Semanur Akdemir Kabalcı, 2026. https://journals.sagepub.com/doi/10.1177/21582440261449038
  - Quote: "When students encounter the zero exponent, they mistakenly think, as in the first question, that they will multiply the base by the exponent and misinterpret the zero as the absorbing element in multiplication, resulting in zero. ... They write the base number as the value of the zero exponent because they add the exponent and the base, and since zero is the identity element in addition"
- **Sevgi and Kabalcı 2026: students take the minus sign of a negative exponent as the sign of the answer**
  - Source: Students’ Misconceptions About Exponents - Sevim Sevgi, Semanur Akdemir Kabalcı, 2026. https://journals.sagepub.com/doi/10.1177/21582440261449038
  - Quote: "Another student with a misconception, for this reason, incorrectly answered by taking the exponent of a negative number, thinking that the negative sign of the exponent was like the sign of the base number. Some students, on the other hand, thought that a negative exponent resulted in a negative number."
- **Sevgi and Kabalcı 2026: the repair is to run the pattern of powers down to zero and past it, so the sign is seen to stay put**
  - Source: Students’ Misconceptions About Exponents - Sevim Sevgi, Semanur Akdemir Kabalcı, 2026. https://journals.sagepub.com/doi/10.1177/21582440261449038
  - Quote: "By recalling how the expansion of any integer raised to several integer powers progresses and revisiting how it unfolds—what happens at the zero exponent and what happens when a negative exponent is reached—the student is made aware. This process shows that the sign of the exponential expression remains unaffected by the negative exponent."
- **Sevgi and Kabalcı 2026: negative exponents solved as repeated multiplication of integers**
  - Source: Students’ Misconceptions About Exponents - Sevim Sevgi, Semanur Akdemir Kabalcı, 2026. https://journals.sagepub.com/doi/10.1177/21582440261449038
  - Quote: "Students who encounter the concept of negative exponents for the first time in the eighth-grade have been observed to mistakenly generalize by thinking of the negative exponent as the sign of the base number and solving it as if it were the repeated multiplication of integers."

### 6.2 The definition as repeated multiplication does not stretch
- **Ulusoy 2019: errors from exponentiation defined as repeated multiplication; rules overgeneralised; zero and negative exponents weakest**
  - Source: ERIC - EJ1198050 - Serious Obstacles Hindering Middle School Students' Understanding of Integer Exponents, International Journal of Research in Education and Science, 2019. https://eric.ed.gov/?id=EJ1198050
  - Quote: "The findings indicated that achievement of the participants was low, especially in the zero and negative exponents. Students made errors that generally originated from the definition of exponentiation as repeated multiplication with natural numbers and underdeveloped conceptions of additive and multiplicative structures. As a result, the students overgeneralized the rules that are true for positive integer exponents to the other exponent expressions. ... Furthermore, students made various errors when undertaking operations with exponent expressions due to the confusion with additive and multiplicative structures in the operations of exponential expressions."

### 6.3 Process and object
- **Weber 2002 (ERIC): students compute exponents in simple cases but few reason about the process of exponentiation**
  - Source: ERIC - ED477690 - Students' Understanding of Exponential and Logarithmic Functions., 2002-Jul. https://eric.ed.gov/?id=ED477690
  - Quote: "Our main result was that while all of the students in the study could compute exponents in simple cases, few students could reason about the process of exponentiation."
- **Sevgi and Kabalcı 2026 summarising Weber: seeing b^x as a process of x instances of b lets students treat it as an object**
  - Source: Students’ Misconceptions About Exponents - Sevim Sevgi, Semanur Akdemir Kabalcı, 2026. https://journals.sagepub.com/doi/10.1177/21582440261449038
  - Quote: "In this context, he used activities that allowed students to see b x as a process consisting of x instances of b. According to Weber (2002) , this approach enables students to perceive the exponential process as an object capable of performing operations."

### 6.4 Rational exponents
- **Şenay 2024: students think of a rational exponent as addition or multiplication**
  - Source: Analysis of Misconceptions and Errors Regarding Exponential and Radical Expressions Through the Theory of Reducing Abstraction. https://dergipark.org.tr/en/download/article-file/4089685
  - Quote: "researcher explained this situation as students having the misconception of thinking of rational exponent as addition or multiplication."
- **Four-tier test study 2026: misconceptions in zero and negative exponents, different bases, and converting fractional exponents to root form**
  - Source: Analysis of Students' Misconceptions in The Exponential Numbers Material in Terms of Concept Understanding Through Four-Tier Diagnostic Tests Based on. https://journal-gehu.com/index.php/gehu/article/download/1071/1489
  - Quote: "The main focus of this study is exponents because this topic often leads to misconceptions, such as errors in understanding the rules for zero exponents, negative exponents, exponent operations with different bases or exponents, and converting fractional exponents to root forms."

### 6.5 The laws, brackets and roots (examiner reports and named mistakes)
- **Cambridge IGCSE examiner report, June 2024: candidates multiplied the indices; others added indices wrongly in standard form**
  - Source: MATHEMATICS. https://www.cambridgeinternational.org/Images/569918-june-2024-examiner-report.pdf
  - Quote: "Some candidates had misconceptions and were multiplying the indices, for example some incorrectly wrote 16.8 x 10 10201 . ... A considerable number made an error of incorrectly adding the indices, giving 4.2"
- **Cambridge IGCSE examiner report, June 2024: a major misconception was two figures before the decimal point in standard form**
  - Source: MATHEMATICS. https://www.cambridgeinternational.org/Images/569918-june-2024-examiner-report.pdf
  - Quote: "A major misconception was to have 2 figures before the decimal point leading to 17.4"
- **Third Space Learning: confusing integer and fractional powers; forgetting the brackets in (4a)² (SECONDARY)**
  - Source: Laws of Indices Worksheet, GCSE PDFs & Exam Questions. https://thirdspacelearning.com/gcse-maths/algebra/laws-of-indices
  - Quote: "Common misconceptions It is common to forget to square the 4. [(4 a)^{2}=4 a \times 4 a=4^{2} a^{2}=16 a^{2}] The brackets mean the entire term is squared. ... Confusing integer and fractional powers Raising a term to the power of 2 means we square it E.g. [a^{2}=a \times a] Raising a term to the power of ½ means we find the square root of it"
- **For Dummies: root put in the numerator, and multiplying instead of adding exponents in a^2(a^(1/2) + a^(3/2)) (SECONDARY)**
  - Source: 10 Pitfalls to Avoid When Working with Exponents | dummies. https://www.dummies.com/article/academics-the-arts/math/algebra/10-pitfalls-to-avoid-when-working-with-exponents-153055
  - Quote: "A root is indicated with a fractional exponent. The root always goes in the denominator of the fraction. When a power of the root is involved, place it in the numerator of the fraction. A common error is the following: image7.png This places the root (fourth root) in the numerator, not the denominator. ... a common error is to multiply, rather than add: a 2 ( a 1/2 + a 3/2 ) ≠ a 2 + a 3 Yes, it's awfully tempting to eliminate those pesky fractional exponents by multiplying by 2, but the rule is to add the exponents."
- **HELM: the root of a sum is not the sum of the roots**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Algebra.pdf
  - Quote: "we should be aware that it does not work for addition or subtraction"

### 6.6 Units with powers
- **Calculus students' area and volume units (ERIC EJ1082070): 73% gave wrong units; the usual error is length units in area and volume**
  - Source: ERIC - EJ1082070 - Calculus Students' Understanding of Area and Volume Units, Investigations in Mathematics Learning, 2015. https://eric.ed.gov/?id=EJ1082070
  - Quote: "Seventy-three percent of students gave incorrect units for at least one task. The most common error was the misappropriation of length units in area and volume computations."
- **Yale National Initiative unit quoting Carle: two-dimensional conversions mistaken for linear ones (SECONDARY)**
  - Source: Area, Surface Area and Volume: From Misconceptions to Skyscrapers. https://teachers.yale.edu/download/units/19_05_07.pdf
  - Quote: "If there are three feet in a yard, then there are three square feet in a square yard. The mistaken conclusion is that two dimensional unit conversions are equivalent to linear unit conversions"

### 6.7 Standard form and the calculator
- **Scientific notation misconceptions: the exponent follows the coefficient, and a different power of ten with a coefficient outside 1 to 10**
  - Source: What Are the Misconceptions About Scientific Notation Of Very Large And Very Small Numbers?. https://dergipark.org.tr/en/download/article-file/3074200
  - Quote: "Misconceptions of limited perception type; In scientific notation, the exponent gets smaller as the coefficient gets smaller, or the exponent gets bigger as the coefficient gets bigger. ... One of the results of students' restricted perception misconception is that students write the given number correctly as a different power of 10, but they do not consider that the coefficient must be 1 or a real number greater than 1 and less than 10 in scientific notation."
- **Victorian curriculum companion: scientific notation difficulty shows as inability to multiply and divide by powers of ten**
  - Source: Scientific notation | Mathematics Curriculum Companion | Arc. https://arc.educationapps.vic.gov.au/learning/sites/mcc/VCMMG315
  - Quote: "Common misconceptions with scientific notation may be highlighted by a student’s inability to multiply and divide by powers of 10."
- **AIP physics-education monograph: scientific notation is a separate challenge for students using calculators (some key 4,000,000 as 4 x 10^6 without ...; the excerpt stops there)**
  - Source: Chapter 8: Student Difficulties in Problem-Solving. https://pubs.aip.org/books/monograph/65/chapter/20658580/Student-Difficulties-in-Problem-Solving
  - Quote: "Scientific notation presents a whole other challenge for students using calculators. Some students will attempt to enter 4,000,000 as “4 × 106” without"

### 6.8 What the learning science says to do (my reading from the sources above)
- **Powers of the Universe (Springer 2025): primary pupils learn powers of ten by counting zeros, then multiply a million by a billion by adding 6 + 9**
  - Source: Powers of the Universe: Empowering Primary School Students with the Powers of Ten Notation | International Journal of Science and Mathematics Education | Springer Nature Link. https://link.springer.com/article/10.1007/s10763-025-10609-z
  - Quote: "First, we explore the rules of powers-of-ten notation with examples like 10 × 10 = 100 = 10 2 , where the rule is addition of the numbers of zeros. This rule is extended to multiplying large numbers such as one million (10 6 ) times one billion (10 9 ) by just adding 6 + 9 to get 10"
- **Warsash/mathcentre (leaflet) on why: use of a power is only notation, so the rules say what it means**
  - Source: Engineer cadets maths refresher. https://maritime.solent.ac.uk/documents/training-at-warsash/engineer-cadets-maths-refresher.pdf
  - Quote: "Use of a power or index is simply a form of notation, that is, a way of writing something down. When mathematicians have a way of writing things down they like to use their notation in other ways. For example, what might we mean by −2 1 0 ... ### To proceed further we need rules to operate with so we can find out what these notations actually mean."

My reading, by skill, with the strongest source:
1. **Powers:** the exponent counts factors; it is not a multiplier (2³ is not 2 × 3), and −a^b is not (−a)^b (Sevgi and Kabalcı 2026;
   Ulusoy 2019). Predict-then-reveal: "what is (−2)², −2², (−2)³?" before the rule.
2. **Laws:** show the factors written out (Bitesize, mathcentre) and make the "same base" condition something he can break and
   see fail (2³ × 3² is not 6⁵). Errors to build checks for: multiplying the indices when multiplying powers, and adding them
   when multiplying 10-powers (Cambridge IGCSE examiner report, June 2024); not applying the power to every factor in a bracket
   ((4a)², Third Space, SECONDARY; HELM Key Point 7).
3. **Zero and negative:** the repair in the research is to run the pattern down to zero and past it so the sign is seen not to
   change (Sevgi and Kabalcı 2026), and to ask what the law needs the exponent to be (Bitesize, OpenStax). Weber (2002) says students can
   compute exponents but few reason about the *process*, so give a process to watch (powers shrinking one step at a time).
4. **Roots and fractional powers:** the main failure is reading a fractional exponent as addition or multiplication (Şenay 2024), and
   putting the root number on top (For Dummies, SECONDARY). The a^(1/2) × a^(1/2) = a argument gives the meaning, and root-first
   keeps the numbers small (Bitesize, mathcentre).
5. **Standard form:** two figures before the point (Cambridge IGCSE examiner report), and the exponent changed along with the
   coefficient (dergipark). Comparing: look at the power of ten first.
6. **Units:** converting area as if it were length (ERIC EJ1082070; Carle via Yale, SECONDARY). The cure is NIST's rule, the
   prefix is inside the power.
7. **Not found:** an AQA, OCR or Edexcel examiner report on negative and fractional indices specifically (the OCR 2023
   report fetched has only a prime-factor line on indices); NCTM-specific guidance on exponents; the Kakoma and Luneta paper
   on engineering students' exponent errors (the page would not load). All three are **UNCONFIRMED**.

---

## 7. Where it is used for an electrician going into marine engineering

Each use has a quote from a page the tools reached.

### 7.1 Heat in a conductor and a resistor: P = I²R and V²/R
- **OpenStax (via LibreTexts): the power dissipated by a resistor is P = I²R = V²/R (SECONDARY)**
  - Source: 5.8: Electric Power and Energy - Physics LibreTexts. https://phys.libretexts.org/Courses/Georgia_State_University/GSU-TM-Introductory_Physics_II_(1112)/05:_Electric_Current_Resistance_and_Ohm's_Law/5.08:_Electric_Power_and_Energy
  - Quote: "The power dissipated by a resistor has the form [P = I^2 R = \dfrac{V^2}{R}.] Different insights can be gained from the three different expressions for electric power."
- **OpenStax College Physics: because voltage is squared in P = V²/R, doubling the voltage nearly quadruples the power**
  - Source: 20.4 Electric Power and Energy - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/20-4-electric-power-and-energy
  - Quote: "Furthermore, since voltage is squared in , the effect of applying a higher voltage is perhaps greater than expected. Thus, when the voltage is doubled to a 25-W bulb, its power nearly quadruples to about 100 W, burning it out."
The MCA line on power and energy in dc resistive circuits is quoted in 3.3.

### 7.2 Resistance of a cable: R = ρL/A, ohm metres, mm² and diameter squared
The ohm-metre unit and R = ρL/A are quoted in 4.8.
- **OpenStax College Physics: the longer the cylinder the greater its resistance, the larger its cross-sectional area the smaller**
  - Source: 20.3 Resistance and Resistivity - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/20-3-resistance-and-resistivity
  - Quote: "The longer the cylinder, the greater its resistance. The larger its cross-sectional area , the smaller its resistance."
- **NBS Copper Wire Tables: resistance, mass and cross section vary with the square of the diameter**
  - Source: Copper wire tables. https://nvlpubs.nist.gov/nistpubs/Legacy/hb/nbshandbook100.pdf
  - Quote: "The resistance, mass, and cross section vary with the square of the diameter, hence by the use of the square of the ratio"
- **OpenStax University Physics: flow rate is directly proportional to speed and to the cross-sectional area of the pipe**
  - Source: 14.5 Fluid Dynamics - University Physics Volume 1 | OpenStax. https://openstax.org/books/university-physics-volume-1/pages/14-5-fluid-dynamics
  - Quote: "The relationship tells us that flow rate is directly proportional to both the average speed of the fluid and the cross-sectional area of a river, pipe, or other conduit."

### 7.3 The inverse square law: light, sound, radiation
- **HELM index of engineering contexts: inverse square law decay of electromagnetic power (Workbook 6, page 50); kinetic energy (Workbook 1, page 79)**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2049%20Student's%20Guide.pdf
  - Quote: "Inverse square law decay of electromagnetic power Wbk 6 50 Joukowski transformation Wbk 26 19 Kepler’s laws Wbk 47 12 Kinetic energy Wbk 1 79"
- **OpenStax Physics 15.2: moving twice as far from a light source gives one quarter, because the r² term is 4 instead of 1**
  - Source: 15.2 The Behavior of Electromagnetic Radiation - Physics | OpenStax. https://openstax.org/books/physics/pages/15-2-the-behavior-of-electromagnetic-radiation
  - Quote: "The illuminance is now only one-fourth as great, because the r 2 term in the denominator is 4 instead of 1."
- **OpenStax University Physics: in an inverse square relationship, doubling the distance cuts the intensity to one quarter**
  - Source: 17.3 Sound Intensity - University Physics Volume 1 | OpenStax. https://openstax.org/books/university-physics-volume-1/pages/17-3-sound-intensity
  - Quote: "In an inverse square relationship, such as the intensity, when you double the distance, the intensity decreases to one quarter,"
- **Physics Classroom: inverse square, double the distance and the intensity is quartered; quadruple and it is one sixteenth**
  - Source: Physics Tutorial - Sound Waves - Properties of Sound - Intensity and the Decibel Scale. https://www.physicsclassroom.com/tutorial/sound-waves/properties-of-sound/intensity-and-the-decibel-scale
  - Quote: "So if the distance from the source is doubled (increased by a factor of 2), then the intensity is quartered (decreased by a factor of 4). Similarly, if the distance from the source is quadrupled, then the intensity is decreased by a factor of 16."

### 7.4 pV^n = C: compressors, engine strokes, expansion
- **Purdue ME 200 notes: a polytropic process is one in which pV^n = constant, with n = 0 isobaric**
  - Source: Polytropic Processes - Purdue Engineering. https://engineering.purdue.edu/~wassgren/teaching/ME20000/NotesAndReading/Lec12_LectureNotes.pdf
  - Quote: "A polytropic process is one in which pVn = constant, where n is a constant. • if n = 0, then the process is isobaric"
- **WPI lecture: pV^n = constant; n = 1 for an ideal gas is isothermal**
  - Source: Polytropic Process - WPI. https://users.wpi.edu/~sullivan/ES3001/Lectures/Chapter_4/ch04b-jms2013.pdf
  - Quote: "A polytropic process is a quasiequilibrium process described by pV n = constant ► The exponent, n , may take on any value from –∞ to +∞ depending on the particular process. ► For any gas (or liquid), when n = 0 , the process is a constant-pressure (isobaric) process. ► For any gas (or liquid), when n = ± ∞ , the process is a constant-volume (isometric) process. ► For a gas modeled as an ideal gas, when n = 1, the process is a constant-temperature (isothermal) process."
- **Clarkson lecture: a quick compression such as the stroke of a diesel engine is nearly adiabatic**
  - Source: Microsoft PowerPoint - chap3-ext.ppt. https://webspace.clarkson.edu/projects/fluidflow/public_html/kam/courses/2005/es340/chap3-ext.pdf
  - Quote: "If a compression or expansion of a gas takes place in a short time, it would be nearly adiabatic, such as the compression stroke of a gasoline or a diesel engine."

### 7.5 Pumps and fans: power goes with speed cubed
- **US Department of Energy: with no static lift, pump power varies with the cube of speed; cutting speed 20% cuts power by about half**
  - Source: Adjustable Speed Pumping Applications: Industrial Technologies Program (ITP) Pumping Systems Tip Sheet #11. https://www.energy.gov/sites/prod/files/2014/05/f16/adjust_speed_pumping.pdf
  - Quote: "In centrifugal applications with no static lift, system power requirements vary with the cube of the pump speed. Small decreases in speed or flow can significantly reduce energy use. For example, reducing the speed (flow) by 20% can reduce input power requirements by approximately 50%."
- **US DoE: the affinity law equations Q2/Q1 = N2/N1, H2/H1 = (N2/N1)², P2/P1 = (N2/N1)³**
  - Source: Adjustable Speed Pumping Applications: Industrial Technologies Program (ITP) Pumping Systems Tip Sheet #11. https://www.energy.gov/sites/prod/files/2014/05/f16/adjust_speed_pumping.pdf
  - Quote: "Q2 / Q1 = N2 / N1 H2 / H1 = (N2 / N1) 2 P2 / P1 = (H2Q2) / (H1Q1) = (N2 / N1) 3"
- **Engineering ToolBox fan laws: speed up 10% means flow up 10%, head up 21%, power up 33% (SECONDARY)**
  - Source: Fan Affinity Laws - The Engineering ToolBox. https://www.engineeringtoolbox.com/fan-affinity-laws-d_196.html
  - Quote: "Note! - if the speed of a fan is increased with 10% * the volume flow is increased with 10% * the head is increased with 21% * the power is increased with 33"

**Marine link: UNCONFIRMED.** The MCA syllabus pages fetched do not name the pump or fan laws; the quotes are from the US
Department of Energy and an engineering reference site. Shipboard pumps and the engine room fans are centrifugal, which is my
reading, not a quote.

### 7.6 Where the syllabus uses powers directly
All the MCA lines are quoted in section 3.3. By use: standard atmospheric pressure in standard form and pressure conversions
between N/m², pascals and bar (Applied Heat 1.1, General Engineering Science I); the units of the gas constant R (Applied Heat 4.1);
isothermal, adiabatic and polytropic operations on a pV diagram (Applied Heat 4.2, 7.1); D'Arcy's friction formula for pipelines
(Applied Mechanics 9.1); R, L and C from physical dimensions (Marine Electro-Technology 1.1).

My reading of why each matters to Dan: his trade already uses P = I²R (conductor heating) and mm² (cable sizes); the new parts
are *why* doubling the current quadruples the heat (the exponent), what "mm² in a metre-sized formula" does to a number
(10⁻⁶), and what a root does when you need the current from the power. The marine side adds pressure in bar, kPa and N/m² with
powers of ten, pV^n for the compression stroke, and speed³ for pumps.

---

## 8. Size: how many lessons, and which core supports five to seven for Dan

- **HELM Workbook 1 pages: Indices 21 to 39 (then Simplification and Factorisation at 40)**
  - Source: HELM workbook 1 - Basic Algebra. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/Basic%20Algebra.pdf
  - Quote: "1.2 Indices 21 1.3 Simplification and Factorisation 40"
- **HELM Workbook 1 (89 pages) and Workbook 2 (75 pages) with their section lists**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2049%20Student's%20Guide.pdf
  - Quote: "Workbook 1 - Basic Algebra (89 pages) 1.1 Mathematical Notation and Symbols 1.2 Indices 1.3 Simplification and Factorisation 1.4 Arithmetic of Algebraic Fractions 1.5 Formulae and Transposition Workbook 2 - Basic Functions (75 pages) 2.1 Basic Concepts of Functions 2.2 Graphs of Functions and Parametric Form 2.3 One-to-one and Inverse Functions"

Counts from the benchmarks: Brilliant 83 lessons (at least 15 levels); Khan 9 skills in Algebra 1 and 10 in Algebra 2; Bird 7 pages
for powers and 19 for units and prefixes; HELM 19 pages for indices; Bitesize about five articles (laws of indices, negative
and fractional indices, standard form, calculations in standard form, surds). The two engineering sources (Bird, HELM) are the
small ones, and they are the ones Dan needs.

**The core I would build on: Bird chapters 7 and 8, HELM 1.2, and the Bitesize order, with the MCA and Applied Heat lines as the
test of what is needed.** That supports **six lessons** (five to seven):
1. Powers as repeated multiplying, squares and cubes, the three index laws seen by counting (4.1, 4.2).
2. Zero and negative powers by running the pattern down; the reciprocal (4.3).
3. Roots, fractional powers as roots, and surds only as far as 4.6 (4.4 to 4.6).
4. Powers of ten, standard form, engineering notation and the prefixes (4.7).
5. Units with powers: m², m³, m s⁻², Ω m, converting mm² to m², and the unit check (4.8).
6. Powers in the formulas he will meet: P = I²R, inverse square, pV^n = C with n given, speed³, and plotting y against x² as a
   straight line (the Straight-line graphs hand-off) (4.9, section 7).

A seventh lesson is possible if lesson 3 is too full (split roots from fractional powers); a fifth-lesson version merges 2 into 1
and 6 into 5. The deferred items in section 5 stay out.

## 9. Not confirmed (summary)
- What is inside Brilliant's lessons, and whether Exponents and Radicals has more than 15 levels.
- Khan's Pre-algebra "Roots, exponents, & scientific notation" lesson list.
- Whether the HND module Maritime Mathematics for Engineers teaches surds; whether any HN or MCA line asks for surds.
- How 0 to the power 0 is treated (Brilliant has a lesson).
- A marine-specific source for the pump and fan laws.
- Examiner reports on negative and fractional indices from AQA, OCR and Edexcel; NCTM guidance; the Kakoma and Luneta paper.
