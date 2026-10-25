# Matrices: research notes

Researched 25 Oct 2026 for the Matrices course brief (the third course in the Maths shelf's Advanced maths folder, after
Calculus fundamentals and Vectors; blurb "Grids of numbers that move, stretch and turn whole shapes at once", from
"Brilliant: Matrices"). The brief itself is not written here; these notes are its evidence. Dan is an electrician and a
Royal Navy submariner on the electrical engineering path; next year he does a Level 3 marine engineering course. He asked
for foundations that see him through any new topic, not a remake of Brilliant's course. The folder now runs: Calculus
fundamentals, Vectors, Matrices, Linear algebra, Vector calculus, Differential equations, Group theory.

Every finding has its source title, URL and the exact words. The quotes were cut from the saved tool results by script
(`mk/make.mjs`, anchors chosen by me, text copied by the script), never retyped into this file, and all of them are listed
in `quotes.json` beside it and checked with `node tools/eval/sources.mjs --quotes ... --tools ...` (`failed: 0`). The tool
files are in `tools/`. Findings I could not confirm are marked **UNCONFIRMED**; where only a copy or a general site said
it, **SECONDARY**. My own readings are marked "My reading" and are not quotes. Page markup that survived in a quote
(`_A_` for italics, `7\.1` for escaped dots, `` `\hat{\imath}` `` for TeX) is the page's own, kept so the quote still matches.

**Short version for the brief writer**
- Brilliant's Matrices course is 43 lessons in 9 levels, all 2 by 2, built on "where the basis vectors land". It has no
  row reduction, no 3 by 3 determinant and no circuits (1.1, 1.2). Those come from the engineering sources.
- Every engineering source (SQA HN Engineering Mathematics 4, Pearson Unit 4002 LO2, HELM workbooks 7 and 8, Bird chapters
  58 and 59) ends on **3 by 3 determinants, the inverse, and Gaussian elimination for three unknowns** (3.1, 3.2, 2.3, 2.4).
  The MCA Second Engineer syllabus asks for "three unknowns" (3.3). That is the part Dan's route actually examines.
- The geometry (columns are where i and j land, multiplication is one move after another, the determinant is an area
  scale factor, no inverse means squashed flat) is what the best sources use to make the rules make sense (1, 4).
- The sharpest misconception evidence is about **reading what a solved system means** (none, one or infinitely many) and
  about **order in multiplication**; the solid sources are Larson and Zandieh, Dorier and colleagues, and the
  examiner reports (6).
- Size: Brilliant 43 lessons; SQA gives matrices 10 of 40 hours; HELM 82 pages. Seven lessons is a defensible core (8).

---

## 1. Benchmark: Brilliant's Matrices

### 1.1 The course itself
Brilliant's page is `brilliant.org/courses/matrices/` and it is reachable today. **43 lessons and 750 exercises in 9 levels.**
Counting the lesson titles (not the Level Checks) the levels are: 1 Basis Vectors (3 lessons), 2 Transforming Vectors (6),
3 Matrices (7), 4 Matrix Operations (4), 5 Matrix Multiplication (4), 6 Matrix Composition (4), 7 Determinants (6),
8 Inverse Matrices (5), 9 Systems of Equations (4); 3+6+7+4+4+4+6+5+4 = 43, which matches the page.

- **Brilliant's Matrices course is 43 lessons and 750 exercises, to transform the plane**
  - Source: Practice Matrices | Brilliant. https://brilliant.org/courses/matrices/
  - Quote: "Take your vector skills further by using matrices to transform the plane. 43 Lessons 750 Exercises"
- **Levels 1 to 3: basis vectors, transforming vectors, matrices as transformations (stretch, rotate, reflect, shear, squash)**
  - Source: Practice Matrices | Brilliant. https://brilliant.org/courses/matrices/
  - Quote: "Level 1 Basis Vectors Vectors from Combinations Possible Combinations Standard Basis Vectors Level Check ## Level 2 Transforming Vectors Transforming Vectors Transforming Basis Vectors Linear Transformations Transforming Combinations Plotting Transformed Vectors Non-Integer Combinations Level Check ## Level 3 Matrices Matrices as Transformations Transforming via Matrices Transforming Shapes Diagonal Matrices Rotations and Reflections Shear Transformations Degenerate Transformations"
- **Levels 4 to 6: matrix operations, matrix multiplication with the identity, composition**
  - Source: Practice Matrices | Brilliant. https://brilliant.org/courses/matrices/
  - Quote: "Level 4 Matrix Operations Matrix-Vector Multiplication Matrix as Multiple Vectors Matrix Addition and Subtraction Scalar Matrix Multiplication ## Level 5 Matrix Multiplication Matrix Multiplication Matrix Dimensions Sizing and Multiplying The Identity Matrix ## Level 6 Matrix Composition Multiple Transformations Composing Transformations Composing by Multiplying Squaring and Cubing"
- **Levels 7 to 9: determinants, inverse matrices, systems of equations**
  - Source: Practice Matrices | Brilliant. https://brilliant.org/courses/matrices/
  - Quote: "Level 7 Determinants Transformed Areas Determinant of a Triangular Matrix Determinant of any 2 by 2 Matrix Computing Determinants Determinant 0 Negative Determinants ## Level 8 Inverse Matrices The Inverse Matrix Producing the Identity Inverting a Matrix Computing the Inverse Matrix Non-invertible Matrices ## Level 9 Systems of Equations Systems of Equations Matrices as Systems of Equations Solving Systems of Equations Solving with Inverses"
- **Brilliant's description: watch matrices transform the plane; multiplication understood, not memorised**
  - Source: Practice Matrices | Brilliant. https://brilliant.org/courses/matrices/
  - Quote: "Discover what matrices really are by watching them transform the plane, with grids and basis vectors making every operation visual. By the end of the course, you'll be able to build a matrix for any linear transformation, multiply and compose them, compute determinants and inverses, and solve systems of equations. You'll see why matrix multiplication works the way it does instead of just memorizing the procedure."
- **Brilliant's prerequisite: vectors, components and linear combinations; no prior matrices**
  - Source: Practice Matrices | Brilliant. https://brilliant.org/courses/matrices/
  - Quote: "Before you get started, you should be comfortable working with vectors, including their components and how to write one vector as a linear combination of others, which you can pick up in the Vectors course. You don't need any prior experience with matrices to begin."
- **Brilliant's topics covered**
  - Source: Practice Matrices | Brilliant. https://brilliant.org/courses/matrices/
  - Quote: "Topics covered * Composing Transformations * Determinants * Identity Matrix * Inverse Matrices * Linear Transformations * Matrix Addition * Matrix Dimensions * Matrix Multiplication * Scalar Multiplication * Shears and Rotations * Standard Basis Vectors * Systems of Equations"

My reading of the order: the first 16 lessons (levels 1 to 3) are all about what a matrix *is*, as a move of the plane
(combinations of vectors, then "Transforming Basis Vectors", then rotations, reflections, shears and "Degenerate
Transformations", which are the squashed-flat cases). Arithmetic comes after that (levels 4 to 6), and is built from
the moves: addition and scalar multiplication first, then multiplication, then composition. Determinants (level 7) start from
"Transformed Areas" and "Determinant 0" and "Negative Determinants", so the sign and the zero are meant, not just computed.
The inverse (level 8) ends on "Non-invertible Matrices". Systems of equations are last (level 9) and use the inverse,
so Brilliant's course never does row reduction. About 35 per cent of the lessons (15 of 43) are determinants, inverses and
systems; 37 per cent (16 of 43) are the front end of vectors and transformations.
The page gives titles only, so what happens inside a lesson (the pictures, the exercises) is **UNCONFIRMED**; I did not see one.

### 1.2 Where it sits in Brilliant's path
- **Brilliant's Vectors course: 39 lessons, vectors as shifts in space, the start of the linear algebra journey**
  - Source: Practice Vectors | Brilliant. https://brilliant.org/courses/vectors
  - Quote: "Start your linear algebra journey here with vectors as shifts in space. 39 Lessons 714 Exercises"
- **Brilliant's Vectors course has a Linear Combinations level; Dan's Vectors dropped it for Matrices**
  - Source: Practice Vectors | Brilliant. https://brilliant.org/courses/vectors
  - Quote: "Level 3 Linear Combinations Scalar Multiplication Reversing Direction Linear Combinations Linear Combination Grids Solving Linear Combinations"
- **Brilliant's Matrices course picks up right where Vectors leaves off**
  - Source: Practice Vectors | Brilliant. https://brilliant.org/courses/vectors
  - Quote: "When you finish, the Matrices course picks up right where this one leaves off."
- **Brilliant puts Matrices in the Advanced Math band, with Vectors, Limits, Derivatives, Calculus**
  - Source: What math does Brilliant cover? | Brilliant. https://brilliant.org/help/courses-and-curriculum/what-math-does-brilliant-cover
  - Quote: "Advanced math | Advanced | Limits; Derivatives; Calculus; Vectors; Matrices"
- **Brilliant's suggested order: trig, exponentials, logs, then Vectors and Matrices, then Complex Numbers**
  - Source: Does Brilliant cover Precalculus? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-precalculus/
  - Quote: "Starting from scratch, a workable order is Trigonometric Functions , Exponential Functions , Logarithms , Vectors and Matrices , then Complex Numbers"

- Brilliant's Vectors course (39 lessons) has a whole level of **Linear Combinations**; Dan's Vectors course dropped it on
  purpose and sent it to Matrices (Vectors brief, "Left for later courses"). Brilliant's Matrices level 1 is where
  those combinations come back ("Vectors from Combinations", "Possible Combinations", "Standard Basis Vectors").
- Brilliant's own help page explains the design:

- **Brilliant's own account: matrices introduced as transformations of the plane, arithmetic derived from that**
  - Source: Does Brilliant cover Precalculus? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-precalculus/
  - Quote: "Matrices does something a textbook chapter usually does not. Rather than presenting matrix multiplication as a procedure, it introduces matrices as transformations of the plane — Matrices as Transformations , Transforming Basis Vectors , Rotations and Reflections — and derives the arithmetic from that."
- **Brilliant: multiplication means composition; the determinant is an area scale factor before the formula**
  - Source: Does Brilliant cover Precalculus? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-precalculus/
  - Quote: "makes multiplication mean composition, and Transformed Areas makes the determinant an area scale factor"
- **Brilliant's Matrices is 2 by 2 throughout, not linear algebra**
  - Source: Does Brilliant cover Precalculus? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-precalculus/
  - Quote: "Not quite. They work entirely in two dimensions with 2×2 matrices, the scope of a Precalculus matrix unit. Together they cover determinants, inverses, composition, and solving linear systems, but not eigenvalues, vector spaces, or higher dimensions."

- The sequel is a different course. Brilliant's Linear Algebra is 41 lessons and starts abstract:

- **Brilliant's Linear Algebra course (41 lessons) is the abstract sequel**
  - Source: Practice Linear Algebra | Brilliant. https://brilliant.org/courses/lin-alg
  - Quote: "Delve into the abstract depths of linear algebra: vector spaces, determinants, eigenvalues, wedge products, and more. 41 Lessons 355 Exercises"
- **Row reduction (Gauss-Jordan) is in Brilliant's Linear Algebra, not in Matrices**
  - Source: Practice Linear Algebra | Brilliant. https://brilliant.org/courses/lin-alg
  - Quote: "Level 2 The Gauss-Jordan Process I The Gauss-Jordan Process II"
- **Brilliant's Linear Algebra level 4 repeats matrix products and inverses abstractly**
  - Source: Practice Linear Algebra | Brilliant. https://brilliant.org/courses/lin-alg
  - Quote: "Level 4 What Is a Matrix? Linear Transformations Matrix Products Matrix Inverses Application: Image Compression I Application: Cryptography"
- **Eigenvalues sit in Brilliant's Linear Algebra level 6**
  - Source: Practice Linear Algebra | Brilliant. https://brilliant.org/courses/lin-alg
  - Quote: "Level 6 Application: Markov Chains II Eigenvalues & Eigenvectors"
- **Brilliant's Linear Algebra prerequisite**
  - Source: Practice Linear Algebra | Brilliant. https://brilliant.org/courses/lin-alg
  - Quote: "A basic understanding of calculus and linear equations is necessary."

My reading: this fixes the line between Dan's Matrices and Linear algebra. Matrices keeps the 2 by 2 geometry, the
inverse, the determinant and solving, and Linear algebra (later) takes row reduction as a theory, span, bases and
eigenvalues. But Dan's route examines Gaussian elimination for three unknowns (3.1 to 3.3), so a first, plain row
reduction has to be in Matrices; Brilliant's "Gauss-Jordan Process" sits in its Linear Algebra, and Khan's row-echelon
videos sit in Khan's Linear algebra unit 1 (2.1). The brief should say "elimination as a method for three unknowns" here
and leave "what row reduction means" (rank, span, null space) for Linear algebra.

---

## 2. Other courses' order for the same ground

### 2.1 Khan Academy
Khan teaches matrices in three places.

**Precalculus, Unit 7: Matrices** (after Unit 6 Vectors, as in Dan's folder). Twelve skills and three quizzes, in this order:

- **Khan Precalculus puts Vectors (unit 6) before Matrices (unit 7)**
  - Source: Matrices | Precalculus | Math | Khan Academy. https://www.khanacademy.org/math/precalculus/x9e81a4f98389efdf:matrices
  - Quote: "Unit 6 Vectors Unit 7 Matrices Unit 8 Probability and combinatorics"
- **Khan Academy Precalculus Unit 7 Matrices, skills in order**
  - Source: Matrices | Precalculus | Math | Khan Academy. https://www.khanacademy.org/math/precalculus/x9e81a4f98389efdf:matrices
  - Quote: "Use matrices to represent data 2. Multiply matrices by scalars 3. Add & subtract matrices 4. Use matrices to manipulate data 5. Matrices: Quiz 1 6. Understand matrices as transformations of the plane 7. Use matrices to transform the plane 8. Use matrices to transform 3D and 4D vectors 9. Multiply matrices 10. Matrices: Quiz 2 11. Use matrices to represent systems of equations 12. Determine invertible matrices 13. Find the inverse of a 2x2 matrix 14. Use matrices to solve systems of equations"
- **Khan Precalculus Unit 7 about**
  - Source: Matrices | Precalculus | Math | Khan Academy. https://www.khanacademy.org/math/precalculus/x9e81a4f98389efdf:matrices
  - Quote: "Learn what matrices are and about their various uses: solving systems of equations, transforming shapes and vectors, and representing real-world situations. Learn how to add, subtract, and multiply matrices, and find the inverses of matrices."
- **Khan's transformation lessons include determinant as area**
  - Source: Matrices | Precalculus | Math | Khan Academy. https://www.khanacademy.org/math/precalculus/x9e81a4f98389efdf:matrices
  - Quote: "Matrices as transformations of the plane (Opens a modal) * Working with matrices as transformations of the plane (Opens a modal) * Intro to determinant notation and computation (Opens a modal) * Interpreting determinants in terms of area (Opens a modal) * Finding area of figure after transformation using determinant (Opens a modal) * Proof: Matrix determinant gives area of image of unit square under mapping (Opens a modal)"

**Algebra (all content), Unit 20: Matrices:**

- **Khan Algebra (all content) Unit 20 Matrices covers**
  - Source: Matrices | Algebra (all content) | Math | Khan Academy. https://www.khanacademy.org/math/algebra-home/alg-matrices
  - Quote: "This topic covers: * Adding & subtracting matrices * Multiplying matrices by scalars * Multiplying matrices * Representing & solving linear systems with matrices * Matrix inverses * Matrix determinants * Matrices as transformations * Matrices applications"

**Linear algebra** is a separate course of three units (Vectors and spaces; Matrix transformations; Alternate coordinate systems,
i.e. bases). Its Unit 2 has the inverse and determinant lessons including the 3 by 3 and the rule of Sarrus, and row reduction is in
Unit 1:

- **Khan Linear algebra unit 2 (Matrix transformations): matrices rotate, scale and translate; solve many-unknown equations**
  - Source: Khan Academy | Khan Academy. https://www.khanacademy.org/math/linear-algebra/matrix-transformations
  - Quote: "Matrices can be used to perform a wide variety of transformations on data, which makes them powerful tools in many real-world applications. For example, matrices are often used in computer graphics to rotate, scale, and translate images and vectors. They can also be used to solve equations that have multiple unknown variables (x, y, z, and more) and they do it very efficiently!"
- **Khan Linear algebra unit 2: inverses and determinants lessons, including Sarrus**
  - Source: Khan Academy | Khan Academy. https://www.khanacademy.org/math/linear-algebra/matrix-transformations
  - Quote: "Deriving a method for determining inverses (Opens a modal) * Example of finding matrix inverse (Opens a modal) * Formula for 2x2 inverse (Opens a modal) * 3 x 3 determinant (Opens a modal) * n x n determinant (Opens a modal) * Determinants along other rows/cols (Opens a modal) * Rule of Sarrus of determinants"
- **Row reduction is in Khan's Linear algebra unit 1 (Vectors and spaces)**
  - Source: Linear Algebra | Khan Academy. https://www.khanacademy.org/math/linear-algebra
  - Quote: "Using matrix row-echelon form in order to show a linear system has no solutions"

My reading: Khan's order is data and arithmetic first (represent data, add, scalar multiply), then the plane transformation
(with the determinant as area folded in), then multiplication, then systems, the inverse, and solving. Brilliant reverses the
two halves: the transformation view comes first and the arithmetic is derived from it. Both end on the 2 by 2 inverse and
solving a system by it.

### 2.2 BBC Bitesize and SQA
**BBC Bitesize: UNCONFIRMED / likely none.** My Bitesize searches returned GCSE transformations (including "Combining
transformations") but no page on matrices, and Bitesize's Scottish Higher and National 5 guides do not appear to have one.
I found no Bitesize matrices page, so I have no Bitesize list of "named mistakes" for this topic (see 9).

**SQA Higher Maths: I found no matrices in it (UNCONFIRMED; I did not read its full content).** The matrices I could reach in Scotland begin at **Advanced Higher**. The maths.scot topic
page (which says the properties "are listed in the specification") gives the content:

- **SQA Advanced Higher matrices content: operations**
  - Source: Matrices: Advanced Higher Maths (maths.scot). https://www.maths.scot/advanced-higher/matrices
  - Quote: "Addition, subtraction, multiplication by a scalar, multiplication of matrices"
- **SQA Advanced Higher: determinant and inverse, singular**
  - Source: Matrices: Advanced Higher Maths (maths.scot). https://www.maths.scot/advanced-higher/matrices
  - Quote: "determining whether a matrix is singular"
- **SQA Advanced Higher: 2 by 2 transformation matrices and composition**
  - Source: Matrices: Advanced Higher Maths (maths.scot). https://www.maths.scot/advanced-higher/matrices
  - Quote: "rotation, reflection, dilation and composition of transformations"

(the page also lists "Properties of matrix addition and multiplication (commutativity, associativity, distributivity)",
"Finding the determinant and inverse of 2 by 2 and 3 by 3 matrices" and the rule that the product `det(AB) = det A det B`, but
those lines carry TeX that the saved text does not hold cleanly, so I do not quote them).

The older Advanced Higher unit shows how recently and how narrowly matrices entered the Scottish ladder: matrices were only for
solving 3 by 3 systems.

- **SQA Advanced Higher (older unit): matrices only for solving systems by Gaussian elimination**
  - Source: SQA National Unit Specification: Mathematics 1 (Advanced Higher), D321 13. https://www.sqa.org.uk/files/nq/D32113.pdf
  - Quote: "Outcome 5 is the only outcome which does not build upon Higher content. It provides an introduction to matrix techniques leading to the use of Gaussian elimination to solve a 3 × 3 system of linear equations."
- **SQA older AH unit performance criterion**
  - Source: SQA National Unit Specification: Mathematics 1 (Advanced Higher), D321 13. https://www.sqa.org.uk/files/nq/D32113.pdf
  - Quote: "Use matrix techniques to solve systems of linear equations. Performance criteria (a) Use Gaussian elimination to solve a 3 × 3 system of linear equations"

(that unit specification is the original SQA file, dated 1999; the current AH course specification is named by maths.scot but I
did not read it, so whether Gaussian elimination is still examined there is **UNCONFIRMED**.)

### 2.3 HELM (Helping Engineers Learn Mathematics, Loughborough)
Two workbooks, 82 pages in all, written for first- and second-year engineers:

- **HELM: Workbook 7 Matrices (50 pages) then Workbook 8 Matrix Solution of Equations (32 pages)**
  - Source: HELM Workbook 49: Student's Guide (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2049%20Student's%20Guide.pdf
  - Quote: "Workbook 7 - Matrices (50 pages) 7\.1 Introduction to Matrices 7\.2 Matrix Multiplication 7\.3 Determinants 7\.4 The Inverse of a Matrix Workbook 8 - Matrix Solution of Equations (32 pages) 8\.1 Solution by Cramer’s Rule 8\.2 Solution by Inverse Matrix Method 8\.3 Solution by Gauss Elimination"

Workbook 7's four sections and their outcomes, in order:

- **HELM 7.1 learning outcomes begin with a system of equations in matrix form**
  - Source: HELM Workbook 7: Matrices (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%207%20Matrices.pdf
  - Quote: "express a system of linear equations in matrix form _•_ recognise and use the basic terminology associated with matrices"
- **HELM 7.2 learning outcomes: when AB exists, AB is not BA, the identity**
  - Source: HELM Workbook 7: Matrices (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%207%20Matrices.pdf
  - Quote: "decide when the product _AB_ exists _•_ recognise that _AB_ _̸_ = _BA_ in most cases _•_ carry out the multiplication _AB_ _•_ explain what is meant by the identity matrix"
- **HELM 7.3 determinants: what they are for**
  - Source: HELM Workbook 7: Matrices (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%207%20Matrices.pdf
  - Quote: "Among other uses, determinants allow us to determine whether a system of linear equations has a unique solution or not."
- **HELM 7.4 inverse learning outcomes: condition, 2 by 2 formula, 3 by 3 two ways**
  - Source: HELM Workbook 7: Matrices (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%207%20Matrices.pdf
  - Quote: "state the condition for the existence of an inverse matrix _•_ use the formula for finding the inverse of a 2 _×_ 2 matrix _•_ find the inverse of a 3 _×_ 3 matrix using row operations and using the determinant method"

Workbook 8 (solving):

- **HELM 8.1 outcomes: Cramer's rule, recognise cases with no unique solution**
  - Source: HELM Workbook 8: Matrix Solution of Equations (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%208%20Matrix%20solution%20of%20Equations.pdf
  - Quote: "state and apply Cramer’s rule to find the solution of two simultaneous linear equations _•_ state and apply Cramer’s rule to find the solution of three simultaneous linear equations _•_ recognise cases where the solution is not unique or a solution does not exist"
- **HELM 8.3 outcomes: row operations, back-substitution, Gauss elimination for three equations**
  - Source: HELM Workbook 8: Matrix Solution of Equations (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%208%20Matrix%20solution%20of%20Equations.pdf
  - Quote: "identify the row operations which allow the reduction of a system of linear equations to upper triangular form _•_ use back-substitution to solve a system of equations in echelon form _•_ understand and use the method of Gauss elimination to solve a system of three simultaneous linear equations"

My reading: HELM is the nearest to the engineering syllabi. Its order is *notation and the system in matrix form* (7.1), *multiplication,
and AB is not BA* (7.2), *determinants first*, with the 2 by 2 and then Laplace expansion for 3 by 3 (7.3), *the inverse* (7.4: the
2 by 2 formula, then two methods for 3 by 3), then three ways to solve (Cramer, inverse, Gauss elimination) with the cases of no
unique solution named along the way. HELM puts matrices **before** vectors (workbooks 7 and 8, then Workbook 9 Vectors); that is why
its vector product (9.4) uses 3 by 3 determinants as a prerequisite. Dan has the order the other way round.

### 2.4 Bird's Engineering Mathematics (the Royal Navy's own author)
John Bird's books are widely used UK engineering mathematics texts, and his author line in the fifth edition of *Basic Engineering Mathematics* reads "Royal Naval School of Marine Engineering HMS Sultan" (quoted below, SECONDARY copy).
The contents of the ninth edition of *Bird's Engineering Mathematics*:

- **Bird's Engineering Mathematics ninth edition chapters 58 and 59 on matrices (SECONDARY host)**
  - Source: Bird's Engineering Mathematics, Ninth Edition: contents (preview hosted by pageplace.de, SECONDARY). https://api.pageplace.de/preview/DT0400.9781000351941_A40491292/preview-9781000351941_A40491292.pdf
  - Quote: "The theory of matrices and determinants 592 58\.1 Matrix notation 592 58.2 Addition, subtraction and multiplication of matrices 593 58.3 The unit matrix 596 58.4 The determinant of a 2 by 2 matrix 596 58.5 The inverse or reciprocal of a 2 by 2 matrix 597 58.6 The determinant of a 3 by 3 matrix 598 58.7 The inverse or reciprocal of a 3 by 3 matrix 600 tion of simultaneous equations by determinants 606 59.3 Solution of simultaneous equations using Cramers rule 609 59.4 Solution of simultaneous equations using the Gaussian elimination method 610"
- **Bird puts vectors (section 6) long before matrices**
  - Source: Bird's Engineering Mathematics, Ninth Edition: contents (preview hosted by pageplace.de, SECONDARY). https://api.pageplace.de/preview/DT0400.9781000351941_A40491292/preview-9781000351941_A40491292.pdf
  - Quote: "Section 6 Vectors 365 34 Vectors 367 34.1 Introduction 367 34.2 Scalars and vectors 367 34.3 Drawing a vector 368 34.4 Addition of vectors by drawing 368 34.5 Resolving vectors into horizontal and vertical components 371 34.6 Addition of vectors by calculation 372 34.7 Vector subtraction 377 34.8 Relative velocity 379 34.9 _i_ , _j_ , and _k_ notation 380"
- **John Bird taught at the Royal Naval School of Marine Engineering, HMS Sultan (SECONDARY host)**
  - Source: Basic Engineering Mathematics, Fifth Edition (Bird; copy hosted by nibmehub.com, SECONDARY). https://nibmehub.com/opac-service/pdf/read/Basic%20Engineering%20Mathematics.pdf
  - Quote: "JOHN BIRD Royal Naval School of Marine Engineering HMS Sultan, formerly University of Portsmouth and Highbury College, Portsmouth"

Bird's order is vectors (section 6, chapter 34) long before matrices (chapters 58 and 59, near the back), and chapter 59 ends on
Gaussian elimination. Chapter 58 is 11 pages (p.592 to 602); chapter 59 starts on p.603. The pageplace.de preview and the nibmehub.com copy are not the publisher's own sites, so both are SECONDARY.

### 2.5 A university engineering course (for the order of ideas)
- **Edinburgh's first-year engineering maths puts vectors, then matrices, then eigen ideas**
  - Source: Engineering Mathematics 1a (MATH08074), University of Edinburgh course catalogue 2024/25. https://www.drps.ed.ac.uk/24-25/dpt/cxmath08074.htm
  - Quote: "Basic vector algebra; scalar product, vector product, triple product and geometry. Matrices, inverses and determinants, linear equations and elimination. Rank, eigenvalues, eigenvectors."

My reading: a first-year university engineering course (Edinburgh, Engineering Mathematics 1a) puts **vectors, then matrices,
inverses, determinants, elimination, and only then rank and eigenvalues**. That is the line the folder draws between Matrices and
Linear algebra.

### 2.6 What is common (consensus across Brilliant, Khan, SQA, HELM, Bird, Edinburgh)
My reading, from the lists above:
1. Brilliant, Khan, Bird and Edinburgh put **vectors before matrices**; HELM's order is matrices, solving, then vectors.
2. The rules (add, scalar multiply, multiply, identity) come before the determinant; the determinant comes before the inverse
   (the inverse needs it for the 2 by 2 formula and for "does an inverse exist"). Brilliant and Khan reach the determinant through
   area, HELM and Bird through the formula.
3. **Solving a system is last** in all of them, and in the engineering ones it is the point. Three methods appear: the inverse,
   Cramer's rule (HELM, Bird 59.3) and Gaussian elimination (SQA, Pearson, HELM, Bird). Brilliant has only the inverse.
4. The 3 by 3 determinant and 3 by 3 elimination appear in every engineering source; Brilliant's page says its Matrices stays 2 by 2.
5. Eigenvalues are always later and apart (Brilliant's Linear Algebra, Khan's Linear algebra, Edinburgh's last line).

---

## 3. What a marine engineering HNC actually uses of this topic

### 3.1 SQA HN Engineering Mathematics 4 (SCQF level 8)
SQA has five Engineering Mathematics units (1 to 5). Matrices are one outcome of **Engineering Mathematics 4**, an optional unit in the
HND. The unit specification:

- **SQA Engineering Mathematics 4: outcome 2 content list**
  - Source: SQA Higher National Unit specification: Engineering Mathematics 4 (H7K3 35). https://www.sqa.org.uk/sqa/files/hn/H7K335.pdf
  - Quote: "Solve problems involving the manipulation of matrices. ### Knowledge and/or Skills  Definitions  Matrix’s operations  Determinants  Inverse Matrices  Gaussian Elimination"
- **SQA Engineering Mathematics 4: evidence requirements for the matrix outcome**
  - Source: SQA Higher National Unit specification: Engineering Mathematics 4 (H7K3 35). https://www.sqa.org.uk/sqa/files/hn/H7K335.pdf
  - Quote: "Define the meaning of the term matrix in the context of Mathematics (this may include specials cases: square, identity, transpose, etc)  Solve one problem involving the scalar multiplication, addition or subtraction of two matrices and one problem involving the multiplication of two matrices  Find the determinant of a 3 × 3 matrix  Find the inverse of a 3 × 3 matrix  Apply Gaussian Elimination to solve a system of linear equations containing three variables"
- **SQA Engineering Mathematics 4: the matrix outcome gets 10 of the unit's 40 hours**
  - Source: SQA Higher National Unit specification: Engineering Mathematics 4 (H7K3 35). https://www.sqa.org.uk/sqa/files/hn/H7K335.pdf
  - Quote: "Outcome 2 (10 hours) Solve problems involving the manipulation of matrices"
- **SQA Engineering Mathematics 4: notional design length 40 hours**
  - Source: SQA Higher National Unit specification: Engineering Mathematics 4 (H7K3 35). https://www.sqa.org.uk/sqa/files/hn/H7K335.pdf
  - Quote: "the notional design length is 40 hours"

So the matrix skills SQA lists are: define a matrix (square, identity, transpose), scalar multiple, add and subtract, multiply two
matrices, **the determinant of a 3 by 3, the inverse of a 3 by 3, and Gaussian elimination for three variables**. Matrices get 10 hours of
the unit's 40. SQA's support notes add that elimination should be used on engineering-related problems (read in the fetched page; trimmed in the saved copy). Nothing in the unit names
transformations, rotations or area; the geometry is Dan's way in, not the syllabus's. (The fetched page also says assessment is unseen and closed-book with no computer algebra; the saved copy trims that sentence, so I do not quote it.)
Which HN Dan's Level 3 course leads to, and whether it includes this unit, is **UNCONFIRMED**; it is optional in the HND.

### 3.2 Pearson BTEC Higher Nationals in Engineering, Unit 4002 (Engineering Mathematics)
Unit 4002 is a core, mandatory unit in the HNC. Its second learning outcome is matrix methods:

- **Pearson 2024 HNC/D Engineering: Unit 4002 Engineering Mathematics is a core mandatory unit**
  - Source: Pearson BTEC Higher Nationals in Engineering: specification (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/General-Engineering/2024/specification-and-sample-assessments/btec-hncd-engineering-2024.pdf
  - Quote: "Core _Mandatory_ 4002: Engineering Mathematics 15 4"
- **Pearson BTEC HNC/D Engineering Unit 2 Engineering Mathematics LO2: matrix methods**
  - Source: Pearson BTEC Levels 4 and 5 Higher Nationals in Engineering: specification (2017), Unit 2 Engineering Mathematics. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/General-Engineering/2017/specification-and-sample-assessments/hncd-l45-engineering-rqf.pdf
  - Quote: "Solve systems of linear equations relevant to engineering applications using matrix methods ### _Matrix methods:_ ### Introduction to matrices and matrix notation ### The process for addition, subtraction and multiplication of matrices ### Introducing the determinant of a matrix and calculating the determinant for a 2x2 and 3x3 matrix ### Using the inverse of a square matrix to solve linear equations ### Gaussian elimination to solve systems of linear equations"
- **Pearson unit pass criteria P4 and P5 (determinant of a 3 by 3, Gaussian elimination)**
  - Source: Pearson BTEC Levels 4 and 5 Higher Nationals in Engineering: specification (2017), Unit 2 Engineering Mathematics. https://www.htu.edu.jo/Pearson/engineering/hncd-l45-engineering-rqf%20update.pdf
  - Quote: "Calculate the determinant of a set of given linear equations using a 3x3 matrix P5 Solve a system of three linear equations using Gaussian elimination"

The 2017 specification's matrix content closely matches SQA's (determinants of 2 by 2 and 3 by 3, the inverse to solve equations, Gaussian elimination
up to 3 by 3). Whether the 2024 "for England" specification keeps this learning outcome is **UNCONFIRMED**: the pages the tools returned for the 2024
version list the unit title but not its content. The criteria lines P4 and P5 come from a copy of the 2019 specification on `htu.edu.jo`, SECONDARY.

### 3.3 MCA engineer officer syllabus lines (GOV.UK)
- **MCA Second Engineer Mathematics syllabus 2.1.29: three unknowns**
  - Source: Mathematics Written Examination Syllabus (MCA Second Engineer) - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "29. Solves linear simultaneous equations of three unknowns."
- **MCA Second Engineer Mathematics syllabus 2.1.28: two unknowns by substitution and elimination**
  - Source: Mathematics Written Examination Syllabus (MCA Second Engineer) - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "28. Solves linear simultaneous equations of two unknowns: 1. by the method of substitution; 2. by the method of elimination."
- **MCA Marine Electro-Technology 2.1.9: Kirchhoff's laws by simultaneous equations, two unknowns only**
  - Source: Marine Electro-Technology Written Examination Syllabus (MCA Second Engineer) - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "9. Solves problems using Kirchhoffs laws by application of simultaneous equations (two unknowns only)."
- **MCA Marine Electro-Technology 2.1.3 and 2.1.4 state Kirchhoff's laws**
  - Source: Marine Electro-Technology Written Examination Syllabus (MCA Second Engineer) - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "3. States Kirchhoffs Current Law. 4. States Kirchhoffs Voltage Law."
- **MCA cadet ETO Mathematics for Engineering (consultation) lists vectors, scalar product; no matrices line in the excerpt**
  - Source: 01. ETO - Mathematics for Engineering - GOV.UK. https://www.gov.uk/government/consultations/cadet-training-modernisation-programmesyllabus-review-first-group-of-consultation-templates/01-eto-mathematics-for-engineering
  - Quote: "3.2 Addition, subtraction and scalar multiplication of vectors"

My reading: the Second Engineer Mathematics syllabus (2.1.29) asks for **three unknowns**, but not by name for matrices or determinants in any
line the tools returned. The Marine Electro-Technology syllabus asks for Kirchhoff by simultaneous equations of **two unknowns only**. So the maths for a
three-loop circuit sits in 2.1.29, and the electrical use is a stretch beyond 2.1.9. I found no line on matrices or determinants in any MCA excerpt;
whether the full syllabus has one is **UNCONFIRMED** (the tools returned excerpts, not the whole page).

### 3.4 What this means for the course
My reading, from 3.1 to 3.3 and Brilliant (1): the examined core is **3 by 3 determinant, 3 by 3 inverse (or at least the 2 by 2), and elimination
for three unknowns**, with Kirchhoff on two or three loops as the engineering context. Brilliant's whole front end (basis vectors, shears, composition)
is not examined by any of these. It is in the course because Dan asked for foundations that make any new topic make sense, and because the
columns-are-where-i-and-j-land picture is what makes the determinant, the inverse and "no solution" explainable instead of memorised.

---

## 4. The scope to cover, and what research says about each part

### 4.1 What a matrix is: a grid; rows by columns; notation; when engineers use one
- **A matrix is an array of numbers; rows then columns**
  - Source: Matrices. https://www.mathsisfun.com/algebra/matrix-introduction.html
  - Quote: "A Matrix is an array of numbers: 6 4 24 1 −9 8 A Matrix (This one has 2 Rows and 3 Columns)"
- **HELM: the position of each entry is crucial; row = equation, column = unknown**
  - Source: HELM Workbook 7: Matrices (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%207%20Matrices.pdf
  - Quote: "The order of the entries, or elements, is crucial. For example, all the entries in the second row relate to the second equation, the entries in column 1 are the coefficients of the unknown _x_ 1, and those in the last column are the constants on the right-hand sides of the equations. In particular, the entry in row 2 column 3 is the coefficient of _x_ 3 in equation 2."
- **HELM: matrix of coefficients, matrix of unknowns, matrix of constants**
  - Source: HELM Workbook 7: Matrices (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%207%20Matrices.pdf
  - Quote: "Here _A_ is called the matrix of coefficients , _X_ is called the matrix of unknowns and _B_ is called the matrix of constants"
- **HELM: a matrix product counts routes in a communication network (a non-geometric use)**
  - Source: HELM Workbook 7: Matrices (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%207%20Matrices.pdf
  - Quote: "The nature of matrix multiplication means that the number of routes is obtained by multiplying the matrix representing the number of connections from _ab_ to _cde_ by the matrix representing the number of connections from _cde_ to _fg_ ."

My reading: two uses should open the course. (a) A matrix as a table that keeps track (HELM's routes between sites; a system of equations written as a
grid, where each row is one equation and each column is one unknown). (b) A matrix as a move of the plane (Brilliant, Khan, Strang). The
first is what the engineering syllabi use; the second is what makes the rules sensible. Notation to teach: rows then columns, "2 by 3", the entry in
row 2 column 3, the names A, I, A⁻¹. HELM and Bird both teach the "matrix of coefficients, unknowns and constants" naming, which links directly to Dan's
Linear systems course.

### 4.2 Linear combinations (deferred here from Vectors)
Dan's Vectors brief sent linear combinations to Matrices ("linear combinations as a system to solve, linear interpolation").
- **Brilliant's Vectors course has a Linear Combinations level; Dan's Vectors dropped it for Matrices**
  - Source: Practice Vectors | Brilliant. https://brilliant.org/courses/vectors
  - Quote: "Level 3 Linear Combinations Scalar Multiplication Reversing Direction Linear Combinations Linear Combination Grids Solving Linear Combinations"
- **A matrix times a column vector is a linear combination of the columns**
  - Source: 2.2: Matrix Multiplication - Mathematics LibreTexts. https://math.libretexts.org/Courses/Canada_College/Linear_Algebra_and_Its_Application/02%3A_Matrices/2.02%3A_Matrix_Multiplication
  - Quote: "column vector and interpret the result as a linear combination of the columns of the matrix."
- **To find where a vector lands: multiply its coordinates by the columns and add**
  - Source: Linear transformations and matrices | 3Blue1Brown. https://www.3blue1brown.com/lessons/linear-transformations
  - Quote: "you take the coordinates of that vector, multiply them by the corresponding column of the matrix, then add together what you get. This corresponds with the idea of adding scaled versions of our new basis vectors."

My reading: do linear combinations inside the matrix-times-vector lesson, not as a separate lesson. "x times one arrow plus y times another" is exactly
what a matrix times a column vector computes, and it is the same sum Dan did for resultants in Vectors lesson 3. Span and "which combinations are
possible" are Linear algebra's (Brilliant's "Possible Combinations" is the doorway to span, so it should be glanced at, not taught).

### 4.3 A matrix times a vector as a transformation: stretch, rotate, reflect, shear; the columns are where i and j land
- **A 2D linear transformation is completely described by four numbers**
  - Source: Linear transformations and matrices | 3Blue1Brown. https://www.3blue1brown.com/lessons/linear-transformations
  - Quote: "the two-dimensional linear transformation is completely described by just four numbers"
- **The columns of a 2 by 2 matrix are where the two basis vectors land**
  - Source: Linear transformations and matrices | 3Blue1Brown. https://www.3blue1brown.com/lessons/linear-transformations
  - Quote: "where you can interpret the columns as the two special vectors where `\hat{\imath}` and `\hat{\jmath}` land."
- **MIT OCW: a matrix represents the transformation that takes the column basis vectors into its columns**
  - Source: 4.2 Matrices and Transformations on Vectors; the Meaning of 0 Determinant. https://ocw.mit.edu/ans7870/18/18.013a/textbook/HTML/chapter04/section02.html
  - Quote: "a matrix represents the transformation that takes the column basis vectors into the vectors that are the corresponding columns of the matrix."
- **Matrix transformations: reflection, dilation, rotation, shear, projection**
  - Source: 3.1: Matrix Transformations - Mathematics LibreTexts. https://math.libretexts.org/Bookshelves/Linear_Algebra/Interactive_Linear_Algebra_(Margalit_and_Rabinoff)/03:_Linear_Transformations_and_Matrix_Algebra/3.01:_Matrix_Transformations
  - Quote: "Learn examples of matrix transformations: reflection, dilation, rotation, shear, projection."
- **Columns on one line mean the transformation squishes the plane onto a line**
  - Source: Linear transformations and matrices | 3Blue1Brown. https://www.3blue1brown.com/lessons/linear-transformations
  - Quote: "it means the linear transformation squishes all of 2d space onto the line where those vectors sit, also known as the one-dimensional span of these two linearly dependent vectors."

Brilliant's level 3 gives the gallery: "Diagonal Matrices", "Rotations and Reflections", "Shear Transformations", "Degenerate Transformations" (1.1). For
rotation, the matrix is built from cosine and sine of the angle, which Dan has from Trigonometry (the point (cos θ, sin θ) on the unit circle) and Complex numbers
(multiplying by j turns by 90°). HELM uses the rotation matrices to show an inverse (4.5). The SQA Advanced Higher page (maths.scot) recommends the same two-step habit: find the image of (1, 0) and write it as the first column, then the image of (0, 1) as the second
column. I read that in the fetched page; the saved copy does not hold it cleanly, so it is not quoted.

### 4.4 Multiplying matrices as one transformation after another; why the order matters
- **Doing one transformation then another is another linear transformation**
  - Source: Matrix multiplication as composition | 3Blue1Brown. https://www.3blue1brown.com/lessons/matrix-multiplication
  - Quote: "The overall effect here, from start to finish, is another linear transformation, distinct from the rotation and the shear."
- **Matrix products read right to left: the right matrix acts first**
  - Source: Matrix multiplication as composition | 3Blue1Brown. https://www.3blue1brown.com/lessons/matrix-multiplication
  - Quote: "this has us reading right to left. You first apply the transformation represented by the matrix on the right, then you apply the transformation represented by the matrix on the left."
- **Matrices and transformations are written in the opposite order from the order in which they act**
  - Source: 2.3: Transformation Composition and Matrix Multiplication - Mathematics LibreTexts. https://math.libretexts.org/Courses/Irvine_Valley_College/Math_26%3A_Introduction_to_Linear_Algebra/02%3A_Linear_Transformations_and_Matrix_Algebra/2.03%3A_Matrix_Algebra/2.3.02%3A_Transformation_Composition_and_Matrix_Multiplication
  - Quote: "matrix multiplication happens in the same order as composition of transformations. In other words, _both matrices and transformations are written in the order opposite from the order in which they act."
- **HELM: the identity plays the role of the number 1**
  - Source: HELM Workbook 7: Matrices (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%207%20Matrices.pdf
  - Quote: "plays the same role in matrix multiplication as the number 1 does in number multiplication."

My reading: this is the lesson where order is a *picture*, not a rule: rotate then shear is not shear then rotate (3Blue1Brown's example), and the product is read right to left, as
"f(g(x))" is. The row-times-column rule can come second, as the bookkeeping that finds the product's two columns by following i and j through both moves. The identity is the
"do nothing" move. HELM's 7.2 outcome (AB is not BA in most cases, quoted above) and the SQA properties (multiplication, in general, is not commutative; it is associative) are the
facts to be able to state.

### 4.5 The identity and the inverse as undoing a move; the 2 by 2 inverse
- **HELM: the inverse, defined by AB = BA = I; not all square matrices have one**
  - Source: HELM Workbook 7: Matrices (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%207%20Matrices.pdf
  - Quote: "Some, but not all, square matrices have inverses. If a square matrix _A_ has an inverse, _A_ _−_ ¹ , then _AA_ _−_ ¹ = _A_ _−_ ¹ _A_ = _I_ . We develop a rule for finding the inverse of a 2 _×_ 2 matrix (where it exists) and we look at two methods of finding the inverse of a 3 _×_ 3 matrix (where it exists). Non-square matrices do not possess inverses"
- **Strang: whatever A does, A inverse undoes**
  - Source: Introduction to Linear Algebra, 5th Edition, section 2.5 (Strang, MIT). https://math.mit.edu/~gs/linearalgebra/ila5/linearalgebra5_2-5.pdf
  - Quote: "We look for an “ _inverse matrix_ ” A − ¹ of the same size, such that A − ¹ _times_ A _equals_ I. Whatever A does, A − ¹ undoes."
- **The inverse is playing the transformation in reverse**
  - Source: Inverse matrices, column space, and null space | 3Blue1Brown. https://www.3blue1brown.com/lessons/inverse-matrices
  - Quote: "what that means geometrically is that you're playing the transformation in reverse"
- **HELM: a rotation through theta followed by a rotation through minus theta is zero rotation**
  - Source: HELM Workbook 7: Matrices (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%207%20Matrices.pdf
  - Quote: "Effectively: a rotation through an angle _θ_ followed by a rotation through angle _−_ _θ_ is equivalent to zero rotation."
- **HELM Key Point 8: swap the diagonal, change the signs of the others, divide by the determinant**
  - Source: HELM Workbook 7: Matrices (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%207%20Matrices.pdf
  - Quote: "To find the inverse of a 2 _×_ 2 matrix _A_ we interchange the diagonal elements, change the sign of the other two elements, and then divide by the determinant of _A_ ."
- **HELM: a zero determinant means no inverse; non-zero means a unique inverse**
  - Source: HELM Workbook 7: Matrices (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%207%20Matrices.pdf
  - Quote: "It is true, in general, that if the determinant of a matrix is zero then that matrix has no inverse. If the determinant is non-zero then the matrix has a (unique) inverse."
- **A squashing transformation has no inverse: you cannot unsquish a line into a plane**
  - Source: Inverse matrices, column space, and null space | 3Blue1Brown. https://www.3blue1brown.com/lessons/inverse-matrices
  - Quote: "there is no inverse. You cannot unsquish a line to turn it into a plane."

The 2 by 2 inverse formula is `A⁻¹ = (1 / (ad − bc)) × [d −b; −c a]` (HELM Key Point 8, in the saved text as a matrix I do not quote). My reading: teach the formula
*after* the picture. Swap the diagonal, change the other two signs, divide by the determinant: that is a recipe, and Dorier and colleagues (6.2) name "recipes without understanding" as the source of the worst
misconceptions. HELM's rotation example (a turn through θ then through −θ is no turn) is the cleanest bridge from "undo" to the formula. Brilliant's "Producing the Identity" and
"Non-invertible Matrices" lessons are the same two beats.

### 4.6 The determinant as the area scale factor; the sign as a flip; zero means squashed flat and no inverse
- **The determinant: the area scale factor of one unit square tells you how any region's area changes**
  - Source: The determinant | 3Blue1Brown. https://www.3blue1brown.com/lessons/determinant
  - Quote: "if you know how much the area of that one unit square changes, it tells you how the area of _any_ region in space changes."
- **A negative determinant means the plane has been flipped over; the size still scales area**
  - Source: The determinant | 3Blue1Brown. https://www.3blue1brown.com/lessons/determinant
  - Quote: "Any transformations that do this are said to "invert the orientation of space". Whenever this happens, the determinant will be negative. The absolute value of the determinant still tells you the factor by which areas have been scaled."
- **A zero determinant means the plane is squashed onto a line or a point**
  - Source: The determinant | 3Blue1Brown. https://www.3blue1brown.com/lessons/determinant
  - Quote: "The determinant of a 2D transformation is `0` if it squishes all of space onto a line, or even onto a single point, since the area of every region would then become 0."
- **Karen Smith (Michigan): the determinant is the same as the area expansion factor**
  - Source: Math 217: The Determinant of a linear transformation (Karen Smith, University of Michigan). https://sites.lsa.umich.edu/kesmith/wp-content/uploads/sites/1309/2024/06/217DeterminantArea2017.pdf
  - Quote: "The determinant is 6, same as the area expansion factor!"
- **The sign of the determinant depends on the orientation of the column vectors**
  - Source: 6.3 Geometric Interpretation of Determinants (Lindblad, Johns Hopkins, lecture 22). https://math.jhu.edu/~lindblad/201/l22.pdf
  - Quote: "The sign of the determinant depends on the orientation of the column vectors."
- **A is invertible if and only if the volume is nonzero**
  - Source: Determinants (Duke University, Math 1553 notes). https://sites.math.duke.edu/~jdr/1617f-1553/materials/determinants.pdf
  - Quote: "A is invertible if and only if the volume of A is nonzero"
- **HELM 7.3 determinants: what they are for**
  - Source: HELM Workbook 7: Matrices (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%207%20Matrices.pdf
  - Quote: "Among other uses, determinants allow us to determine whether a system of linear equations has a unique solution or not."

My reading: this is the idea with the best evidence for a picture-first order. Brilliant's level 7 begins with "Transformed Areas", Khan's lessons put "Interpreting determinants in terms of
area" beside "Intro to determinant notation and computation" (2.1), the university notes (Michigan, JHU, Duke) all use area or volume, and HELM's reason for the determinant is to decide "whether a system of linear equations has a unique solution or not". Teach: the unit square's image is a parallelogram; its area is ad − bc; a negative value means the sheet has been turned over;
zero means the parallelogram has collapsed onto a line, so nothing can undo it. The "where it matters to Dan" link is zero determinant = no unique solution (4.8).

### 4.7 The 3 by 3 determinant, including the cross product's component formula (deferred here from Vectors)
- **HELM 7.3: the 3 by 3 determinant by the first row and cofactors**
  - Source: HELM Workbook 7: Matrices (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%207%20Matrices.pdf
  - Quote: "In words “the determinant of a 3 _×_ 3 matrix is obtained by multiplying each element of the first row by its corresponding cofactor and then adding the three together"
- **HELM 9.4: the vector product found by evaluating a 3 by 3 determinant (deferred here from Vectors)**
  - Source: HELM Workbook 9: Vectors, section 9.4 The Vector Product (copy hosted by the University of Sheffield, SECONDARY). https://www.sheffield.ac.uk/media/31972/download?attachment
  - Quote: "The vector product of two vectors _a_ = _a_ 1 _i_ + _a_ 2 _j_ + _a_ 3 _k_ and _b_ = _b_ 1 _i_ + _b_ 2 _j_ + _b_ 3 _k_ can be found by evaluating the determinant: _a_ _×_ _b_ = _i_ _j_ _k_ _a_ 1 _a_ 2 _a_ 3 _b_ 1 _b_ 2 _b_ 3 in which _i_ , _j_ and _k_ are (temporarily) treated as if they were scalars."
- **HELM 9.4: the component formula is cumbersome; the determinant is easier to remember**
  - Source: HELM Workbook 9: Vectors, section 9.4 The Vector Product (copy hosted by the University of Sheffield, SECONDARY). https://www.sheffield.ac.uk/media/31972/download?attachment
  - Quote: "Evaluation of a vector product using the formula in Key Point 20 is very cumbersome. A more convenient and easily remembered method is to use determinants."
- **HELM 9.4 assumes 3 by 3 determinants are known (taught in Workbook 7)**
  - Source: HELM Workbook 9: Vectors, section 9.4 The Vector Product (copy hosted by the University of Sheffield, SECONDARY). https://www.sheffield.ac.uk/media/31972/download?attachment
  - Quote: "know how to evaluate 3 _×_ 3 determinants"
- **The cross product is the determinant of a 3 by 3 matrix**
  - Source: Calculus II - Cross Product. https://tutorial.math.lamar.edu/Classes/CalcII/CrossProduct.aspx
  - Quote: "the cross product is really the determinant of a 3x3 matrix."

The Vectors brief says "The component formula is usually written as a determinant ... and determinants belong to Matrices. So the formula waits for Matrices." This course must therefore give
the 3 by 3 determinant (HELM 7.3, expansion along the top row with cofactors) and then close the loop: a × b is that determinant with i, j, k treated, temporarily, as if they were scalars (HELM's words, quoted above).
HELM 9.4 also shows the area of a triangle as half the size of AB × AC, which links back to the determinant as an area. In three dimensions the determinant is the volume scale factor of the unit
cube (Brilliant's course is 2 by 2 only and says so in 1.2); I did not keep a clean 3Blue1Brown quote for it (the saved text has TeX), so that is a reading.
Khan's Linear algebra lessons include the rule of Sarrus as a second way to evaluate a 3 by 3 determinant (2.1); the HELM method (first row and cofactors) is the one that extends and that SQA names ("minor and the cofactor", 3.1).

### 4.8 Solving simultaneous equations with matrices (building on Linear systems)
Writing the system as a matrix equation, solving with the inverse, elimination for three unknowns, and what no solution or infinitely many look like:

- **HELM 7.4: AX = B is solved by multiplying both sides by the inverse of A**
  - Source: HELM Workbook 7: Matrices (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%207%20Matrices.pdf
  - Quote: "then the solution of the system of equations _AX_ = _B_ is found by pre-multiplying both sides by _A_ _−_ ¹ ."
- **HELM 8.1: a system has one solution, infinitely many, or none**
  - Source: HELM Workbook 8: Matrix Solution of Equations (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%208%20Matrix%20solution%20of%20Equations.pdf
  - Quote: "a system may have a unique solution, an infinity of solutions or no solution at all"
- **HELM 8.1: second equation twice the first gives infinitely many solutions**
  - Source: HELM Workbook 8: Matrix Solution of Equations (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%208%20Matrix%20solution%20of%20Equations.pdf
  - Quote: "In the system (a) the second equation is twice the first so there are infinitely many solutions."
- **HELM 8.1: inconsistent equations have no solution**
  - Source: HELM Workbook 8: Matrix Solution of Equations (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%208%20Matrix%20solution%20of%20Equations.pdf
  - Quote: "In (b) the equations are inconsistent (since the first is 2 _x_ _−_ 3 _y_ = 6 and the second is 2 _x_ _−_ 3 _y_ = 5 which is not possible). Hence there are no solutions."
- **HELM 8.2: determinant zero - it is not obvious whether none or infinitely many**
  - Source: HELM Workbook 8: Matrix Solution of Equations (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%208%20Matrix%20solution%20of%20Equations.pdf
  - Quote: "But it is not obvious whether this is because the equations are inconsistent and have no solution or whether they are consistent and have infinitely many solutions."
- **A zero determinant tells you nothing about none versus infinitely many (OpenStax, SECONDARY host)**
  - Source: 9.8: Solving Systems with Cramer's Rule - Mathematics LibreTexts. https://math.libretexts.org/Bookshelves/Precalculus/Precalculus_1e_(OpenStax)/09:_Systems_of_Equations_and_Inequalities/9.08:_Solving_Systems_with_Cramer's_Rule
  - Quote: "When we calculate the determinant to be zero, Cramer’s Rule gives no indication as to whether the system has no solution or an infinite number of solutions."
- **Nonzero determinant: two unknowns and two equations give one unique solution**
  - Source: Inverse matrices, column space, and null space | 3Blue1Brown. https://www.3blue1brown.com/lessons/inverse-matrices
  - Quote: "This nonzero determinant case corresponds with the idea that if you have two unknowns and two linear equations, it's almost certainly the case that there is a single unique solution."
- **HELM 8.3: the three stages of Gauss elimination**
  - Source: HELM Workbook 8: Matrix Solution of Equations (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%208%20Matrix%20solution%20of%20Equations.pdf
  - Quote: "We will use the solution method known as Gauss elimination , which has three stages. In the first stage the equations are written in matrix form. In the second stage the matrix equations are replaced by a system of equations having the same solution but which are in triangular form . In the final stage the new system is solved by back-substitution ."
- **HELM 8.2: combining two equations to show no solution**
  - Source: HELM Workbook 8: Matrix Solution of Equations (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%208%20Matrix%20solution%20of%20Equations.pdf
  - Quote: "In system (b) take the combination 5 times the first equation minus 2 times the second equation. What does this tell you about the system? Your solution Answer The combination is _x_ 1 _−_ 11 _x_ 2 + 9 _x_ 3 = 14 _,_ which conflicts with the third equation. There is thus no solution."
- **HELM 8.3 exercise answer: an infinite number of solutions written with a parameter t**
  - Source: HELM Workbook 8: Matrix Solution of Equations (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%208%20Matrix%20solution%20of%20Equations.pdf
  - Quote: "(4) infinite number of solutions: _x_ 1 = _t, x_ 2 = 11 _−_ 10 _t, x_ 3 = 7 _t_ _−_ 7"

My reading, on the course's job here:
1. **Write the system as `A x = b`** (matrix of coefficients, unknowns, constants), which Dan already has the pieces for from Linear systems lesson 6 ("Three unknowns").
2. **Solve with the inverse** when the determinant is not zero: "x = A⁻¹ b", which is "play the transformation in reverse" (4.5).
3. **Elimination** for three unknowns, as three stages (HELM 8.3): write it as a matrix, reduce to triangular form, back-substitute. Dan's Linear systems stretch lesson already removes one letter twice;
   row operations are the same moves written as a grid. The SQA outcome and the Pearson P5 criterion are this skill.
4. **The three cases.** One solution (determinant not zero). No solution (the equations conflict: HELM's "5 times the first minus 2 times the second" gives a left-hand side that
   would have to equal 14 and 13). Infinitely many (one equation is a combination of the others; the answer carries a parameter t). A zero determinant does not say which of the last two
   (HELM 8.2; OpenStax says the same of Cramer's rule). Elimination does tell you: a row of zeros with a zero on the right is infinitely many; with a non-zero on the right it is none.
   The geometry is three planes (parallel, or sharing a line), which Dan can picture after Linear systems' two lines.

Cramer's rule (HELM 8.1, Bird 59.3) is a third method that appears in both engineering books; it needs 3 by 3 determinants and gives no help in the singular case. My reading: leave it out, or
give it one sentence, since the inverse and elimination between them cover the syllabus lines (3.1, 3.2).

### 4.9 An electrical use worked through: Kirchhoff on a two- or three-loop circuit as `R I = V`
- **Khan: the mesh current method writes KVL for the currents in the loops**
  - Source: Khan Academy. https://www.khanacademy.org/a/ee-mesh-current-method
  - Quote: "The Mesh Current Method solves circuits by writing Kirchhoff's Voltage Law for currents flowing in the loops of a circuit."
- **The mesh current method assigns loop currents, then applies KVL and Ohm's law**
  - Source: Mesh Current Method (Loop Current Method) | DC Network Analysis | Electronics Textbook. https://www.allaboutcircuits.com/textbook/direct-current/chpt-10/mesh-current-method
  - Quote: "The mesh current method is a network analysis technique in which mesh (or loop) currents are assigned arbitrarily, and then Kirchhoff’s voltage law and Ohm’s law are applied systematically to solve"
- **Electronics Tutorials: write KVL the same way; the information is easily put into matrix form**
  - Source: Mesh Current Analysis - DC Circuit Theory. https://www.electronics-tutorials.ws/dccircuits/dcp_5.html
  - Quote: "We now write Kirchhoff’s voltage law equation in the same way as before to solve them but the advantage of this method is that it ensures that the information obtained from the circuit equations is the minimum required to solve the circuit as the information is more general and can easily be put into a matrix form."
- **Electronics Tutorials: mesh method - one column matrix [V] of loop voltages and one square matrix [R]**
  - Source: Mesh Current Analysis - DC Circuit Theory. https://www.electronics-tutorials.ws/dccircuits/dcp_5.html
  - Quote: "Write the [ L x 1 ] column matrix [ V ] giving the sum of all voltages in each loop."
- **Electronics Tutorials: the matrix equation is [V] = [R] x [I]**
  - Source: Mesh Current Analysis - DC Circuit Theory. https://www.electronics-tutorials.ws/dccircuits/dcp_5.html
  - Quote: "Write the matrix or vector equation [V] = [R] x [I]. Where [I] is the list of currents to be found."
- **Electronics Tutorials: the two mesh currents solved by the inverse of the resistance matrix**
  - Source: Mesh Current Analysis - DC Circuit Theory. https://www.electronics-tutorials.ws/dccircuits/dcp_5.html
  - Quote: "[ V ] gives the total battery voltage for loop 1 and then loop 2 * [ I ] states the names of the loop currents which we are trying to find * [ R ] is the resistance matrix * [ R \-1 ] is the inverse of the [ R ] matrix"
- **Mesh equations in matrix form are Ax = b: resistances, mesh currents, source voltages**
  - Source: Circuit Analysis and Mesh-Current Equations | dummies. https://www.dummies.com/article/technology/electronics/circuitry/circuit-analysis-and-mesh-current-equations-165795
  - Quote: "_A_ is the coefficients of resistors, _x_ is a vector of unknown mesh currents, and _b_ is a vector of independent voltage sources."
- **Each mesh equation can be written RI = V, like Ax = b**
  - Source: Electrical Networks (University of Washington Math 308 project). https://sites.math.washington.edu/~king/coursedir/m308a01/Projects/m308a01-pdf/young.pdf
  - Quote: "can be written in the form RI = V (similar to Ax = b)."
- **A three-mesh example written as equations (University of Washington project)**
  - Source: Electrical Networks (University of Washington Math 308 project). https://sites.math.washington.edu/~king/coursedir/m308a01/Projects/m308a01-pdf/young.pdf
  - Quote: "Mesh 1: 9 I1 – 5 I2 + 0 I3 = 120 Mesh 2: -5 I1 + 9 I2 - 4 I3 = 0 Mesh 3: 0 I1 – 4 I2 + 24 I3 = 0"
- **Mesh analysis can only be applied to planar circuits**
  - Source: Mesh Analysis. https://pmcl.net.au/ieee/Downloads/Topic%2004%20-%20Mesh%20Analysis.pdf
  - Quote: "Mesh analysis can only be applied to planar circuits."

Two worked examples exist in the reachable pages. Electronics Tutorials works a two-loop resistive circuit with the inverse of the resistance matrix and gets I1 = −0.143 A and
I2 = −0.429 A, with the middle branch the difference (I3 = I1 − I2 = 0.286 A, as in 6.7). The University of Washington project has a three-mesh example (the equations above; its source is a 120 V supply). I did not
see a full worked set of circuit values for either in a form I could safely re-derive here, so the numbers for the course must be **computed from a shown rule** (CLAUDE.md), never copied: the brief should
choose its own resistors and sources and check the solve by script. Mesh analysis needs a planar circuit (pmcl.net.au); a current source in a mesh breaks the symmetric matrix (6.7).

My reading: the matrix is symmetric for a purely resistive loop circuit with voltage sources: the diagonal entry is a mesh's total resistance and the off-diagonal is minus the resistance shared with a neighbour. That
symmetry is a check Dan can use, and it is the reason this is a better example than a generic system. It is also the natural stretch from MCA 2.1.9 (two unknowns only) to 2.1.29 (three unknowns).

### 4.10 Deferred (not in Matrices)
- **Vector spaces, span, basis, linear independence, eigenvalues and eigenvectors, rank and null space, diagonalising, systems of differential equations:** Linear algebra (Brilliant's Linear Algebra levels 3 to 6; Khan's Linear algebra units 1 and 3).
  Brilliant's own admission in 1.2 (its Vectors and Matrices cover determinants, inverses, composition and linear systems, but not eigenvalues, vector spaces or higher dimensions) is the line to copy.
- **Row reduction as a theory** (rank, pivots, reduced row echelon form of any matrix): Linear algebra. Matrices only does elimination as a method for a square system of three unknowns.
- **Matrix addition and scalar multiplication** are needed (HELM, SQA, Pearson, Khan list them) but are light: one screen each inside the notation lesson (Brilliant gives them one level, 4 lessons).
- **Transpose, symmetric matrices, orthogonal matrices, and `det(AB) = det A det B`:** SQA Advanced Higher and HELM have them; none is needed for the aims. The last one is a good "why" for composition (areas multiply) and could be a single remark.

---

## 5. Prerequisites: what this topic leans on, and what Dan already has

**From Dan's built courses** (my reading from the repo's briefs; not quotes):
| Need | Where Dan has it | Teach inline? |
|---|---|---|
| Vectors as arrows with components i, j, k; scaling; resultants; adding by components | Vectors (brief, lessons 1 to 3) | No. Remind in one line. |
| Dot product, the cross product's size and direction | Vectors lessons 5 and 6 | No. The cross product's *component formula* is taught here. |
| Simultaneous equations of two unknowns, elimination, Kirchhoff's two loops, three unknowns as a stretch | Linear systems (lessons 3, 5, 6) | No. Build on it. |
| Sine, cosine, the point (cos θ, sin θ), signs in the four quarters | Trigonometry | No. Remind for rotation matrices. |
| Multiplying by j as a quarter turn; rotation by multiplication | Complex numbers | No. A link, not a re-teach. |
| Straight lines, coordinates, reading a grid; area of a rectangle and a triangle | The coordinate plane; Geometry fundamentals; Straight-line graphs | Check that the parallelogram's area (base times height) is in Geometry fundamentals; if not, one line inline. |
| Three-phase currents 120 degrees apart; neutral current as an arrow sum | AC circuits lesson 10 | No. A use, not a prerequisite. |
| Function composition ("f of g of x") and inverse functions | Functions and their graphs | Maybe one line; matrices are the first time the composition order bites. |

**What must be taught inline** (the brief should check the Vectors and Linear systems briefs for each):
1. **Rows and columns and the "2 by 3" size words**, and reading an entry by row and column (Edexcel examiners name row/column confusion, 6.1).
2. **The determinant as a number**, from the area picture first, with `ad − bc` as the result; and the **3 by 3 determinant** (HELM 7.3: top row and cofactors), which Dan has not met.
3. **Cofactor signs** (the + − + pattern). HELM's inverse section lists "know what a cofactor is" as a prerequisite:

- **HELM 7.4 prerequisites: matrix algebra, a determinant, a cofactor**
  - Source: HELM Workbook 7: Matrices (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%207%20Matrices.pdf
  - Quote: "Before starting this Section you should _. . ._ _•_ be familiar with the algebra of matrices _•_ be able to calculate a determinant _•_ know what a cofactor is"

4. **Elimination written as a grid** (row operations), which Dan has done as equations.
5. **The word "invertible/singular"** (SQA Advanced Higher uses "singular").

Brilliant's stated prerequisites (1.1) are vectors, components and writing one vector as a linear combination of others; Dan's Vectors course covers the first two and, deliberately, not the third.
SQA's older Advanced Higher unit says matrices are the one outcome that does not build on Higher:

- **SQA older AH unit: matrices (outcome 5) are the only outcome not built on Higher**
  - Source: SQA National Unit Specification: Mathematics 1 (Advanced Higher), D321 13. https://www.sqa.org.uk/files/nq/D32113.pdf
  - Quote: "Outcome 5 is the only outcome which does not build upon Higher content."

My reading: that is the right model for Dan too. Matrices are new ground, not a revision of something he half-has; the only true prerequisites are vectors, two-equation systems and trigonometry, all done.

---

## 6. Misconceptions and learning science, for each skill

The research on this topic is mostly about undergraduates in linear algebra; where it is about matrices as such it is thinner. I flag the weight of each source.

### 6.1 Reading a grid: rows against columns
- **Edexcel examiners: a common error was to confuse rows with columns**
  - Source: Examiners Report: Pearson Edexcel GCE Further Mathematics, Paper 01 Core Pure Mathematics 1, November 2021. https://qualifications.pearson.com/content/dam/pdf/A-Level/Mathematics/2017/Exam-materials/9FM0_01_pef_20211216.pdf
  - Quote: "A common error was to confuse rows with columns in their first statement meaning slightly fewer scored this mark (55%)."

Edexcel's examiners (Further Maths, Core Pure 1, November 2021, question 4) report that confusing rows with columns was the common error. This is a small, specific, fixable point: it argues for always saying the entry's
position as "row 2, column 3" and for HELM's habit of tying each row to one equation and each column to one unknown (4.1).

### 6.2 Matrix times vector, and what a matrix "is": the three meanings of Ax = b
- **Larson and Zandieh: Ax = b has linear combination, systems and transformation interpretations**
  - Source: Three Interpretations of the Matrix Equation Ax = b (Larson and Zandieh, For the Learning of Mathematics 2013; ERIC EJ1018729). https://eric.ed.gov/?id=EJ1018729
  - Quote: "Many of the central ideas in an introductory undergraduate linear algebra course are closely tied to a set of interpretations of the matrix equation Ax = b (A is a matrix, x and b are vectors): linear combination interpretations, systems interpretations, and transformation interpretations."
- **Larson and Zandieh: the vector x is conceived very differently across the interpretations**
  - Source: Three Interpretations of the Matrix Equation Ax = b (Larson and Zandieh, For the Learning of Mathematics 2013; ERIC EJ1018729). https://eric.ed.gov/?id=EJ1018729
  - Quote: "highlighting the very different ways that the vector x is conceived across interpretations."
- **Physics students' use of matrix multiplication checked against the three interpretations (APS 2023)**
  - Source: A Study of Physics Students' Interpretation of Matrix Multiplication (APS April Meeting 2023 abstract). https://meetings-archive.aps.org/apr/2023/h17/4
  - Quote: "Zandieh (2013) to describe math students' interpretations of matrix multiplication: linear combination, system of equations, and transformation reasoning."
- **Thomas and Stewart: students are confident with matrix procedures but reluctant to use other reasoning**
  - Source: Misconceptions and resulting errors displayed by in service teachers in the learning of linear independence (ERIC EJ1366218). https://files.eric.ed.gov/fulltext/EJ1366218.pdf
  - Quote: "Thomas and Stewart (2011) asserted that students are reluctant in using other forms of intellectual reasoning but are just confident with matrix procedures."
- **Dorier and colleagues: applying recipes without knowing their origin leads to the worst misconceptions**
  - Source: On the Teaching of Linear Algebra (Dorier, ed.), Kluwer 2000, front matter and chapter summaries (Archive ouverte UNIGE). https://access.archive-ouverte.unige.ch/access/metadata/86b8c659-b413-4bbe-b496-7fef212a76f4/download
  - Quote: "the application of recipes without understanding their origin leads to the worst misconceptions (hundreds of examples abound"
- **Dorier and colleagues: linear algebra is simple in itself but hard to teach**
  - Source: On the Teaching of Linear Algebra (Dorier, ed.), Kluwer 2000, front matter and chapter summaries (Archive ouverte UNIGE). https://access.archive-ouverte.unige.ch/access/metadata/86b8c659-b413-4bbe-b496-7fef212a76f4/download
  - Quote: "of all mathematical theories, and I don't think that this is an illusion, the theory of linear algebra appears to be one of the simplest and the difficulties attendant on its instruction are out of proportion with its intrinsic difficulties."
- **Sierpinska: students think in practical rather than theoretical ways; hard to move between modes**
  - Source: On the Teaching of Linear Algebra (Dorier, ed.), Kluwer 2000, front matter and chapter summaries (Archive ouverte UNIGE). https://access.archive-ouverte.unige.ch/access/metadata/86b8c659-b413-4bbe-b496-7fef212a76f4/download
  - Quote: "Students think in practical rather than theoretical ways and Sierpinska points out several cases in which this is a source of difficulties in the learning of linear algebra. In the second stage of her work, Sierpinska distinguishes between three modes of reasoning in linear algebra, corresponding to its three interacting languages : the visual geometric language, the arithmetic language and the structural language. The author illustrates with examples students’ reluctance to enter into the structural mode of thinking and, in particular, their inability to move flexibly between the three modes."

Larson and Zandieh (2013, *For the Learning of Mathematics*) is the strongest single source for this course's design. It says the same equation Ax = b is read three ways and that the vector x is conceived very differently in each. (My gloss: an input to move, the weights in a combination, the unknowns of a system.) My reading: the course teaches all three, in order, on one object. The matrix as a move (4.3); the product as a
combination of columns (4.2); the equation Ax = b as the unknowns of a system (4.8). The seam between them (that the "x" in Ax = b is the input of the move, found by undoing it) is where the course earns its keep.
The Dorier group (France, the "obstacle of formalism") and Sierpinska (students' practical thinking, and difficulty moving between the geometric, arithmetic and structural modes) are the research behind "picture first,
then the rule". Thomas and Stewart (2011), as cited in a study of 73 in-service teachers (ERIC EJ1366218, *International Electronic Journal of Mathematics Education* 17(4)), say students are confident in matrix procedures and reluctant to reason in other ways. Weight: the
Dorier book is a respected synthesis of French and North American work; EJ1366218 is a single small study of in-service teachers; Larson and Zandieh is a short journal article.

### 6.3 Multiplication: commutativity, and the "multiply the matching entries" slip
- **Most common errors: multiplying corresponding elements, and assuming commutativity (SECONDARY)**
  - Source: Multiplication of Matrices – Level 2 Further Mathematics AQA Revision – Study Rocket. https://studyrocket.co.uk/revision/level-2-further-mathematics-aqa/matrix-transformations/multiplication-of-matrices
  - Quote: "One of the most common errors is to simply multiply corresponding elements in the two matrices without adding up the results or to assume that matrix multiplication is commutative. Always remember, matrix multiplication involves both multiplication and addition and it is not commutative"
- **Commutativity and associativity are two different senses of order (Mathematics Stack Exchange, SECONDARY)**
  - Source: matrices - matrix multiplication associative properties - Mathematics Stack Exchange. https://math.stackexchange.com/questions/3388789/matrix-multiplication-associative-properties
  - Quote: "The two senses are commutativity and associativity."
- **Matrices and transformations are written in the opposite order from the order in which they act**
  - Source: 2.3: Transformation Composition and Matrix Multiplication - Mathematics LibreTexts. https://math.libretexts.org/Courses/Irvine_Valley_College/Math_26%3A_Introduction_to_Linear_Algebra/02%3A_Linear_Transformations_and_Matrix_Algebra/2.03%3A_Matrix_Algebra/2.3.02%3A_Transformation_Composition_and_Matrix_Multiplication
  - Quote: "matrix multiplication happens in the same order as composition of transformations. In other words, _both matrices and transformations are written in the order opposite from the order in which they act."

Both slips are well documented in teaching materials, but I found **no peer-reviewed measurement of how common each is**; the two statements above are from a revision site and a Q&A page, so they are SECONDARY.
The sharper research point is the one in 4.4: the order of the matrices is the reverse of the order of the moves. My reading: a rotate-then-shear picture that fails when the order is swapped is the natural counterexample, and a
numeric check of AB against BA on the course's own 2 by 2s costs one screen.

### 6.4 The inverse: one symbol for three things
- **Students use one symbol, superscript -1, for three different objects (Bagley, Rasmussen and Zandieh via DCU)**
  - Source: A study of students concept images of inverse functions in Ireland and Sweden (Breen et al., DCU). https://doras.dcu.ie/29033/1/22_4_085102_breen.pdf
  - Quote: "students were interviewed about composing a function and its inverse, and also about composing a linear transformation and its inverse. The results demon- strated that the students discussed three distinct mathematical objects, all called inverse and all symbolised with a superscript -1"
- **Strang: not all matrices have inverses; the first question to ask of a square matrix**
  - Source: Introduction to Linear Algebra, 5th Edition, section 2.5 (Strang, MIT). https://math.mit.edu/~gs/linearalgebra/ila5/linearalgebra5_2-5.pdf
  - Quote: "Not all matrices have inverses_ . This is the first question we ask about a square matrix: Is A invertible?"

Bagley, Rasmussen and Zandieh (2015, reported in a Dublin City University study) found that students use the superscript −1 for three different objects: the reciprocal, the inverse function and the inverse matrix. My reading: because
Dan already uses `x⁻¹` for reciprocal and `f⁻¹` for inverse functions (Powers and roots; Functions and their graphs), the course should say in one line that A⁻¹ is the third use, and tie it to "undo".

### 6.5 The determinant: formula without meaning, and the direction of the scale factor
- **Edexcel examiners: the most common error was to multiply the given area by 320 instead of dividing**
  - Source: Examiners Report: Pearson Edexcel International Advanced Level Further Pure Mathematics F1 (WFM01), Summer 2024. https://qualifications.pearson.com/content/dam/pdf/International-Advanced-Level/Mathematics/2018/Exam-materials/wfm01-01-pef-20240815.pdf
  - Quote: "The most common error was to go on to multiply the given area by 320 instead of dividing it"
- **Edexcel examiners: most realised they needed the determinant; areas of images found by it**
  - Source: Examiners Report: Pearson Edexcel GCE Further Mathematics, Paper 01 Core Pure Mathematics 1, November 2021. https://qualifications.pearson.com/content/dam/pdf/A-Level/Mathematics/2017/Exam-materials/9FM0_01_pef_20211216.pdf
  - Quote: "Many of these used the determinant to do so and obtained full marks."
- **A geometric approach lets students see and conjecture properties of the determinant**
  - Source: A Geometric Approach to Determinants (Hannah, American Mathematical Monthly). https://sites.cos.unt.edu/~tushar/project%20ideas/monthly%2096%20hannah%20geometric%20determinant.pdf
  - Quote: "students can see or conjecture properties of the determinant, along with (geometric) explanations appropriate to their level of mathematical development."
- **3Blue1Brown: the determinant has a natural visual intuition although the formula looks complicated**
  - Source: The determinant | 3Blue1Brown. https://www.3blue1brown.com/lessons/determinant/
  - Quote: "The determinant has a very natural visual intuition, even though it's formula can make it seem more complicated than it really is."

The Edexcel IAL Further Pure 1 examiners (Summer 2024) report that "the most common error was to go on to multiply the given area by 320 instead of dividing it". As I read the fragment, the candidates had found det B (320) correctly but used it the wrong way round. This is the
cleanest examiner evidence for teaching the determinant as a scale factor with a direction (image area = determinant × original area). Everything else on this skill is expository (3Blue1Brown, Hannah's *Monthly* article), not a study. Weight: strong for the point, thin for how common.

### 6.6 Elimination and solving: reading what the answer means
- **Persistent misconceptions: interpreting the results after Gaussian elimination**
  - Source: Misconceptions and resulting errors displayed by in service teachers in the learning of linear independence (ERIC EJ1366218). https://files.eric.ed.gov/fulltext/EJ1366218.pdf
  - Quote: "One common area where students displayed persistent misconceptions was that of interpreting the results after carrying out Gaussian elimination (the method of solving systems of equations)."
- **Many errors were misinterpretations of solutions to systems of equations**
  - Source: Misconceptions and resulting errors displayed by in service teachers in the learning of linear independence (ERIC EJ1366218). https://files.eric.ed.gov/fulltext/EJ1366218.pdf
  - Quote: "Many of the technical or foundational errors were because of misinterpretations of solutions to systems of linear equations."
- **12 students did the row operations right but drew the wrong conclusion**
  - Source: Misconceptions and resulting errors displayed by in service teachers in the learning of linear independence (ERIC EJ1366218). https://files.eric.ed.gov/fulltext/EJ1366218.pdf
  - Quote: "12 students were able to carry out the correct row operations but did not provide the correct deduction."
- **A student's wrong conclusion: the system is inconsistent therefore it is linearly independent**
  - Source: Misconceptions and resulting errors displayed by in service teachers in the learning of linear independence (ERIC EJ1366218). https://files.eric.ed.gov/fulltext/EJ1366218.pdf
  - Quote: "the system is inconsistent therefore it is linearly independent"
- **RUME paper: solving systems with no or infinitely many solutions is less intuitive for students**
  - Source: RUME 24th Annual Conference paper on students reasoning about systems of linear equations with no or infinitely many solutions (par.nsf.gov; title and authors UNCONFIRMED). https://par.nsf.gov/servlets/purl/10359034
  - Quote: "Solving systems with no or_ _infinitely many solutions tends to be less intuitive for students."
- **RUME paper: students favoured parallel planes for both no solution and infinitely many**
  - Source: RUME 24th Annual Conference paper on students reasoning about systems of linear equations with no or infinitely many solutions (par.nsf.gov; title and authors UNCONFIRMED). https://par.nsf.gov/servlets/purl/10359034
  - Quote: "both students favored_ _the notion of parallel planes, geometrically and numerically, in the case of a system having no_ _solution or infinitely many solutions."
- **RUME paper: interpreting x = x was not intuitive (Oktac 2018)**
  - Source: RUME 24th Annual Conference paper on students reasoning about systems of linear equations with no or infinitely many solutions (par.nsf.gov; title and authors UNCONFIRMED). https://par.nsf.gov/servlets/purl/10359034
  - Quote: "found that interpreting the result “x=x” was not intuitive for students."
- **RUME paper: after row reducing, many students feel a disconnect from the original system**
  - Source: RUME 24th Annual Conference paper on students reasoning about systems of linear equations with no or infinitely many solutions (par.nsf.gov; title and authors UNCONFIRMED). https://par.nsf.gov/servlets/purl/10359034
  - Quote: "many students experience a disconnect in reinterpreting solutions in relation to the original system"
- **RUME paper: a student thought multiplying equations by a number was the only way to make infinitely many solutions**
  - Source: RUME 24th Annual Conference paper on students reasoning about systems of linear equations with no or infinitely many solutions (par.nsf.gov; title and authors UNCONFIRMED). https://par.nsf.gov/servlets/purl/10359034
  - Quote: "is the only way they understand creating a system of lines with infinitely many solutions."
- **RUME paper: constants matter; multiplying the constant too gives the same line**
  - Source: RUME 24th Annual Conference paper on students reasoning about systems of linear equations with no or infinitely many solutions (par.nsf.gov; title and authors UNCONFIRMED). https://par.nsf.gov/servlets/purl/10359034
  - Quote: "the constant cannot be multiplied by the same number as the coefficients, or else the second equation is actually the same line as the first."

This is the best-evidenced difficulty. An ERIC study of 73 in-service teachers (the "linear independence" paper) found that the row operations were often right and the *conclusion* wrong: 12 students carried out the correct row operations but "did not provide the correct deduction", and some wrote "the system is inconsistent therefore it is linearly independent". A RUME paper on two students building systems found that both reached for "parallel planes" for both no solution and
infinitely many, and one thought multiplying the second equation by a number was the only way to get infinitely many solutions. It cites Oktaç (2018) that reading the result x = x was not intuitive. My reading, for the design:
(a) make "what does the finished grid say?" its own step, with the three outcomes side by side (a unique answer, a conflict like 0 = 5, a free row 0 = 0); (b) show the geometry of three planes for each; (c) ask Dan to *predict*
the outcome from the determinant and from the grid before elimination, then check. Dan's Linear systems course already did "no solution / infinitely many" for two lines (parallel and the same), which is the foothold.
The RUME paper's title and authors are not in the saved text (the file header is just `par.nsf.gov`), so I cannot name them: **UNCONFIRMED**; it is the 24th RUME conference paper on students' reasoning about systems with no or infinitely many solutions.

### 6.7 Setting up the circuit equations
- **A shared resistor carries the difference of the two mesh currents (University of Washington)**
  - Source: Electrical Networks (University of Washington Math 308 project). https://sites.math.washington.edu/~king/coursedir/m308a01/Projects/m308a01-pdf/young.pdf
  - Quote: "the voltage across R2 would be (I1 – I2) x R2"
- **The middle branch current is the difference of the mesh currents**
  - Source: Mesh Current Analysis - DC Circuit Theory. https://www.electronics-tutorials.ws/dccircuits/dcp_5.html
  - Quote: "Since: I ₃ = I ₁ – I ₂ The total combined current of I ₃ is therefore given as: –0.143 – (–0.429) = 0.286 Amps"
- **With a current source in a mesh the matrix equation loses its symmetry (pmcl.net.au)**
  - Source: Mesh Analysis. https://pmcl.net.au/ieee/Downloads/Topic%2004%20-%20Mesh%20Analysis.pdf
  - Quote: "lost all symmetry in the matrix equation Ri  v , and we can no longer call R the resistance matrix."

I found **no research** on errors in writing mesh equations. The reachable tutorials show the points that need care: a resistor shared by two meshes carries the *difference* of the two mesh currents; the current in a middle
branch is I1 − I2; and the signs of the off-diagonal terms. My reading: these are where a circuit lesson will go wrong for a learner, so the course should give a drag-and-check on the shared resistor first.

### 6.8 The two strongest sources, and what they imply
1. **Larson and Zandieh (2013)**: one equation, three meanings. The course should name them and keep them apart.
2. **The examiners and the ERIC study on reading solutions**: the algorithm is usually right, the *interpretation* is wrong (a conflict, a free row, a negative determinant, a scale factor used the wrong way round).
Supporting: Dorier and colleagues on recipes without reasons; Bagley et al. on three "inverses".
What I could not find: a source on Brilliant's own approach working better, or on drag-the-columns interactives specifically. The geometry-first order is supported by the structure of the best courses (Brilliant, 3Blue1Brown, Khan Precalculus) and by Larson and Zandieh's transformation interpretation, not by a controlled study. That is **UNCONFIRMED** as evidence, and an honest "chosen because ..." in the brief.

---

## 7. Where it is used for an electrician going into marine engineering

### 7.1 Circuits: Kirchhoff to a matrix (the course's main worked use)
- **HELM 8.1: analysis of electric circuits and control of systems need systems of linear equations**
  - Source: HELM Workbook 8: Matrix Solution of Equations (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%208%20Matrix%20solution%20of%20Equations.pdf
  - Quote: "The need to solve systems of linear equations arises frequently in engineering. The analysis of electric circuits and the control of systems are two examples."
- **HELM 8.3: breaking a circuit into loops and applying Kirchhoff gives linear equations in currents**
  - Source: HELM Workbook 8: Matrix Solution of Equations (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%208%20Matrix%20solution%20of%20Equations.pdf
  - Quote: "Systems of linear equations arise in the modelling of electrical circuits or networks. By breaking down a complicated system into simple loops, Kirchhoff’s law can be applied. This leads to a set of linear equations in the unknown quantities (usually currents) which can easily be solved by one of the methods described in this Workbook."
- **HELM 8.3: forces in a framework or currents in a circuit**
  - Source: HELM Workbook 8: Matrix Solution of Equations (Loughborough University). https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%208%20Matrix%20solution%20of%20Equations.pdf
  - Quote: "Engineers often need to solve large systems of linear equations; for example in determining the forces in a large framework or finding currents in a complicated electrical circuit."

This is Dan's strongest link: it is what the HELM workbook says is the reason for the topic, and it is the same Kirchhoff he did in Linear systems and meets again in AC circuits. (Section 4.9 has the worked method.)

### 7.2 Motors and inverters: the Clarke and Park transforms are matrices, and the Park transform is a rotation
- **abc, alpha-beta and dq0 transformations are used extensively for machines**
  - Source: A Geometric Interpretation of Reference Frames and Transformations: dq0, Clarke, and Park (IEEE Xplore abstract). https://ieeexplore.ieee.org/document/8836094
  - Quote: "Transformations between abc, stationary dq0 (αβ0) and rotating dq0 reference-frames are used extensively in the analysis and control of three-phase technologies such as machines"
- **Park's matrix can be found from a rotation matrix**
  - Source: A Geometric Interpretation of Reference Frames and Transformations: dq0, Clarke, and Park (MIT DSpace, author manuscript). https://dspace.mit.edu/entities/publication/0101952f-1e79-4c01-8c2e-3a74c07d10b3
  - Quote: "Park's matrix can be subsequently found from a rotation matrix."
- **The Park transform viewed as a rotation in the plane of the machine's cross-section**
  - Source: A Geometric Interpretation of Reference Frames and Transformations: dq0, Clarke, and Park (MIT DSpace, author manuscript). https://dspace.mit.edu/entities/publication/0101952f-1e79-4c01-8c2e-3a74c07d10b3
  - Quote: "interpreting the transformation as a rotation in the plane of the cross-section of a machine."
- **Clarke transform: balanced three-phase components to two orthogonal components**
  - Source: Clarke Transform - Implement ab to αβ transformation - Simulink. https://www.mathworks.com/help/mcb/ref/clarketransform.html
  - Quote: "outputs the balanced two-phase orthogonal components in the stationary _αβ_ reference frame."

My reading: Dan's Motors course has the rotating field. A drive controller turns three currents 120° apart into two numbers that stand still in a frame that turns with the rotor, and each step is a matrix times a vector; the second step is the rotation matrix of 4.3.
The sources above are an IEEE paper (MIT's author manuscript) and MathWorks documentation; neither is a navy source. Whether Dan's marine engineering course covers field-oriented control is **UNCONFIRMED**; as an *example of a rotation matrix at work in a machine* it is secure.

### 7.3 Unbalanced three-phase: symmetrical components
- **Symmetrical components split an unbalanced set of three phasors into three balanced sets**
  - Source: Symmetrical-Components Transform - Implement abc to +-0 transform - Simulink. https://www.mathworks.com/help/sps/ref/symmetricalcomponentstransform.html
  - Quote: "The transform splits an unbalanced set of three phasors into three balanced sets of phasors."

My reading: Dan's AC circuits lesson 10 shows the neutral current growing when a load is unbalanced, "with no sums". The symmetrical-components transform is a 3 by 3 matrix equation that splits an unbalanced set of three phasors into three balanced sets,
so the matrix is the tool that puts numbers on that picture. It involves complex numbers (the transform uses the complex rotation operator a), so I would mention it as a pointer in the brief and not as a lesson.

### 7.4 Ships and submarines: attitude and navigation
- **Strapdown inertial navigation systems are widely used in submarines and surface ships**
  - Source: Angular Rate Optimal Design for the Rotary Strapdown Inertial Navigation System (PMC4029711). https://pmc.ncbi.nlm.nih.gov/articles/PMC4029711
  - Quote: "the rotary strapdown inertial navigation system (RSINS) has been widely used in submarines and surface ships."
- **Inertial sensor output is transformed to the navigation frame by a direction cosine matrix**
  - Source: Angular Rate Optimal Design for the Rotary Strapdown Inertial Navigation System (PMC4029711). https://pmc.ncbi.nlm.nih.gov/articles/PMC4029711
  - Quote: "The output of the inertial sensors is transformed from the s frame to the n frame by a direction cosine matrix."
- **A ship's pitch, roll and yaw give an attitude matrix (US patent)**
  - Source: US20220326019A1 - Strapdown Inertial Navigation Heave Measurement Method Using Multiple Low-Pass Filter Units. https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/20220326019
  - Quote: "step 2: measuring real-time attitude information of a ship, including a pitch angle θ, a roll angle γ and a yaw angle φ of the body coordinate system relative to a navigation coordinate system"
- **MIT 2.017 notes: the transformation between body and inertial frames is a 3 by 3 matrix built from rotations**
  - Source: 9.2: Rotation of Reference Frames - Engineering LibreTexts. https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/System_Design_for_Uncertainty_(Hover_and_Triantafyllou)/09:_Kinematics_of_Moving_Frames/9.02:_Rotation_of_Reference_Frames
  - Quote: "The transformation takes the form of a \\(3 \\times 3\\) matrix, which we now derive through successive rotations"

These are research and patent texts, not training syllabi. My reading: the clearest naval link for a *rotation matrix* is the attitude of a hull. A ship's pitch, roll and yaw are turned into a 3 by 3 matrix that carries the body's
axes into the navigation axes. Brilliant's 2 by 2 rotation (4.3) is the flat version. The mention is a context for a screen in the rotation lesson, not a syllabus line.

### 7.5 Power systems: the nodal admittance matrix
- **Bus admittance matrix: self and mutual admittance of a power-system network (lecture notes, SECONDARY)**
  - Source: Power system analysis lecture notes SEE1302 (Sathyabama, SECONDARY). https://sist.sathyabama.ac.in/sist_coursematerial/uploads/SEE1302.pdf
  - Quote: "The matrix consisting of the self and mutual admittance of the network of a power system is called Bus admittance matrix"
- **An admittance matrix represents the conductance and susceptance of a power network (ScienceDirect Topics, SECONDARY)**
  - Source: Admittance Matrix - an overview | ScienceDirect Topics. https://www.sciencedirect.com/topics/engineering/admittance-matrix
  - Quote: "Admittance matrix is defined as a relatively sparse matrix that represents the conductance and susceptance of a power network, with each non-zero off-diagonal element corresponding to a network branch connecting two buses."

SECONDARY (lecture notes and a general reference site). My reading: a ship's power system is a network of buses, and its study is the same loop-and-node method as the circuit example, only bigger; the matrix gets large and mostly empty. A brief pointer in the circuit lesson.

### 7.6 Nuclear propulsion: reactor core calculations
- **UNENE: the time-independent neutron-diffusion equation is used to solve for flux in full-core reactor models**
  - Source: Reactor Statics, Essential CANDU chapter 4 (UNENE). https://unene.ca/essentialcandu/pdf/4%20-%20Reactor%20Statics.pdf
  - Quote: "The time-independent neutron-diffusion equation is much simpler than the neutron-transport equation and can be used to solve for the flux in specially prepared full-core reactor models."
- **Reactor diffusion: energy groups and finite differences**
  - Source: Reactor Statics, Essential CANDU chapter 4 (UNENE). https://unene.ca/essentialcandu/pdf/4%20-%20Reactor%20Statics.pdf
  - Quote: "Energy discretization of the diffusion equation using neutron energy groups and spa- tial discretization using finite differences"
- **The steady-state neutron diffusion equation is an eigenvalue problem (deferred to Linear algebra)**
  - Source: Neutron Diffusion Equation - an overview | ScienceDirect Topics. https://www.sciencedirect.com/topics/engineering/neutron-diffusion-equation
  - Quote: "The steady state neutron diffusion equation is an eigenvalue problem, where only the dominant eigenvalue and its respective eigenfunction have physical meaning"
- **A reactor core code solves a CMFD matrix with a linear system solver (KOMODO)**
  - Source: GitHub - imronuke/KOMODO: Open Nodal Core Simulator · GitHub. https://github.com/imronuke/KOMODO
  - Quote: "CMFD matrix is solved with the latest linear system solver: BiCGSTAB"
- **A discretised core model: a matrix of absorption, diffusion and scattering terms and a flux vector**
  - Source: Solving the discretised neutron diffusion equations using neural networks (Phillips et al., Int. J. Numerical Methods in Engineering, 2023). https://onlinelibrary.wiley.com/doi/full/10.1002/nme.7321
  - Quote: "where the matrix contains the absorption, diffusion and scattering terms; matrix represents the fission terms; and the vector contains the values of the scalar flux for each cell"

The pages are reactor-physics texts (a course text on reactor statics, code documentation and a journal article), not Royal Navy documents. My reading: the reactor core codes divide the core into cells, write the flux balance for each cell and solve one big system
of linear equations; the steady-state problem is an eigenvalue problem, which is Linear algebra's. So nuclear is the best real reason to leave eigenvalues for the next course and to say so.

### 7.7 What I could not find
- A Royal Navy or marine engineering **syllabus** line that names matrices: none was returned (3.3).
- A source tying **submarine propulsion plant** to the matrix methods taught here directly. 7.4 and 7.6 are general engineering evidence, not naval syllabus evidence.

---

## 8. Size: how many lessons the benchmarks spend, and which core supports 7 lessons for Dan

| Source | How much it spends on matrices | Note |
|---|---|---|
| Brilliant Matrices | 43 lessons, 750 exercises, 9 levels | 2 by 2 only, no elimination (1.1, 1.2) |
| Brilliant Vectors | 39 lessons (of which a level on linear combinations) | the course before |
| Brilliant Linear Algebra | 41 lessons, 7 levels | the abstract sequel |
| Khan Precalculus unit 7 | 12 skills, 3 quizzes, a unit test | determinant inside the transformation lesson |
| HELM | 82 pages: Workbook 7 (50) and Workbook 8 (32) | the nearest to the engineering syllabi |
| SQA HN Engineering Mathematics 4 | 10 of the unit's 40 hours | 3 by 3 determinant, 3 by 3 inverse, elimination |
| Bird | chapter 58 (p.592 to 602) and chapter 59 (from p.603) | |
| Dan's Linear systems | 6 lessons (a stretch lesson for three unknowns) | what the brief builds on |

**Which core supports seven lessons.** My reading: the engineering core is about 10 SQA hours, i.e. roughly the length of two or three of Dan's lessons if only the rules were taught, but Dan wants the reason as well (4.3 to 4.6), and
Brilliant's reason-first version needs 43 lessons only because it does arithmetic in depth and stays 2 by 2. Seven lessons need these choices:

1. **A matrix and what it does to a vector** (grid, notation, matrix times vector as "x of the first column plus y of the second", linear combinations, the columns are where i and j land). Replaces Brilliant levels 1, 2 and the start of 4.
2. **The gallery of moves** (stretch, rotate, reflect, shear, and squash flat; building a matrix from a picture; the rotation matrix from cos and sin). Brilliant level 3.
3. **One move after another** (multiplication as composition, AB is not BA, the identity, matrix addition and scalar multiples as short asides). Brilliant levels 4 to 6.
4. **The determinant** (area scale factor, sign, zero; then the 3 by 3 determinant by cofactors and the cross product's component formula). Brilliant level 7, plus the deferred cross product.
5. **Undoing a move: the inverse** (identity, A⁻¹, the 2 by 2 formula, why a zero determinant has no inverse). Brilliant level 8.
6. **Equations as a matrix: circuits** (a system as `A x = b`; mesh currents on a two-loop circuit by the inverse; what a zero determinant says about the circuit). Brilliant level 9 plus 4.9.
7. **Elimination for three unknowns** (row operations as a grid, reading the finished grid: one answer, none, or infinitely many; a three-loop circuit). Beyond Brilliant; SQA, Pearson, HELM, MCA 2.1.29.

Why seven and not six or eight: Lessons 4 and 7 each carry something Brilliant does not (the 3 by 3 determinant and cross product; elimination), so six would drop either the cross product's formula (a Vectors deferral) or elimination (the examined skill).
Eight would split lesson 2 (one of the longest gallery lessons) and lesson 4; the 3 by 3 determinant is the heaviest single piece, and the brief may prefer to move it into a short stretch lesson. The SQA time (10 hours) and Khan (12 skills) both suggest the rules alone fit comfortably in five lessons, which leaves two for the geometry and the circuit.
Dan's Vectors course and Linear systems are 7 and 6 lessons. The brief should state seven as a decision for Dan to change.

---

## 9. What I could not confirm

- **Brilliant's lesson insides** (the pictures, how a level check works) and whether the page order of the Matrices lessons is the teaching order: titles only.
- **BBC Bitesize** and **named mistakes** from Bitesize: no matrices page found.
- **The current SQA Advanced Higher course specification** (read via maths.scot's summary, the older unit spec is the original SQA file); **Pearson 2024** unit content; **the full MCA syllabi** (excerpts only); whether any MCA line names matrices.
- **Which HN Dan's marine engineering route leads to**, and whether it includes SQA Engineering Mathematics 4 (optional) or Pearson 4002.
- **Authors and title of the RUME paper** quoted in 6.6 (the saved header is only `par.nsf.gov`); Wawro, Plaxco and Zandieh's own papers were not read (their ideas appear only through the ERIC abstract and the DCU/APS/DCU summaries).
- **A measurement of how common** row/column, commutativity and entrywise-product slips are; only the Edexcel reports give frequencies (55% for the row/column mark; the 320 example is "the most common error").
- **Research on mesh-equation setup errors**: none found.
- **Naval syllabus evidence** for the uses in 7.2 to 7.6 (these are engineering-wide).
- **Hosts I used as SECONDARY**: LibreTexts (OpenStax, Margalit and Rabinoff, Irvine Valley), Study Rocket, Mathematics Stack Exchange, MathForHumans, Wikipedia, ScienceDirect Topics, Sathyabama lecture notes, `pageplace.de`, `nibmehub.com`, `htu.edu.jo`, the University of Sheffield's copy of HELM Workbook 9.
