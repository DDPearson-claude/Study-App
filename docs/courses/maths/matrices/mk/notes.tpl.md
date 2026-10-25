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

{{b-size}}
{{b-l1-3}}
{{b-l4-6}}
{{b-l7-9}}
{{b-desc}}
{{b-prereq}}
{{b-topics}}

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
{{b-vec-size}}
{{b-vec-l3}}
{{b-vec-next}}
{{b-band}}
{{b-order}}

- Brilliant's Vectors course (39 lessons) has a whole level of **Linear Combinations**; Dan's Vectors course dropped it on
  purpose and sent it to Matrices (Vectors brief, "Left for later courses"). Brilliant's Matrices level 1 is where
  those combinations come back ("Vectors from Combinations", "Possible Combinations", "Standard Basis Vectors").
- Brilliant's own help page explains the design:

{{b-prec-trans}}
{{b-prec-comp}}
{{b-prec-2d}}

- The sequel is a different course. Brilliant's Linear Algebra is 41 lessons and starts abstract:

{{b-linalg}}
{{b-linalg-gj}}
{{b-linalg-l4}}
{{b-linalg-eig}}
{{b-linalg-pre}}

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

{{k-order}}
{{k-u7}}
{{k-about}}
{{k-trans}}

**Algebra (all content), Unit 20: Matrices:**

{{k-alg20}}

**Linear algebra** is a separate course of three units (Vectors and spaces; Matrix transformations; Alternate coordinate systems,
i.e. bases). Its Unit 2 has the inverse and determinant lessons including the 3 by 3 and the rule of Sarrus, and row reduction is in
Unit 1:

{{k-la-u}}
{{k-la-inv}}
{{k-la-rref}}

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

{{s-ah-topics}}
{{s-ah-singular}}
{{s-ah-trans}}

(the page also lists "Properties of matrix addition and multiplication (commutativity, associativity, distributivity)",
"Finding the determinant and inverse of 2 by 2 and 3 by 3 matrices" and the rule that the product `det(AB) = det A det B`, but
those lines carry TeX that the saved text does not hold cleanly, so I do not quote them).

The older Advanced Higher unit shows how recently and how narrowly matrices entered the Scottish ladder: matrices were only for
solving 3 by 3 systems.

{{s-ah-unit}}
{{s-ah-unit-pc}}

(that unit specification is the original SQA file, dated 1999; the current AH course specification is named by maths.scot but I
did not read it, so whether Gaussian elimination is still examined there is **UNCONFIRMED**.)

### 2.3 HELM (Helping Engineers Learn Mathematics, Loughborough)
Two workbooks, 82 pages in all, written for first- and second-year engineers:

{{h-list}}

Workbook 7's four sections and their outcomes, in order:

{{h-wb7-lo1}}
{{h-wb7-lo2}}
{{h-wb7-lo3}}
{{h-wb7-lo4}}

Workbook 8 (solving):

{{h-wb8-lo1}}
{{h-wb8-lo3}}

My reading: HELM is the nearest to the engineering syllabi. Its order is *notation and the system in matrix form* (7.1), *multiplication,
and AB is not BA* (7.2), *determinants first*, with the 2 by 2 and then Laplace expansion for 3 by 3 (7.3), *the inverse* (7.4: the
2 by 2 formula, then two methods for 3 by 3), then three ways to solve (Cramer, inverse, Gauss elimination) with the cases of no
unique solution named along the way. HELM puts matrices **before** vectors (workbooks 7 and 8, then Workbook 9 Vectors); that is why
its vector product (9.4) uses 3 by 3 determinants as a prerequisite. Dan has the order the other way round.

### 2.4 Bird's Engineering Mathematics (the Royal Navy's own author)
John Bird's books are widely used UK engineering mathematics texts, and his author line in the fifth edition of *Basic Engineering Mathematics* reads "Royal Naval School of Marine Engineering HMS Sultan" (quoted below, SECONDARY copy).
The contents of the ninth edition of *Bird's Engineering Mathematics*:

{{bird-58}}
{{bird-vec}}
{{bird-sultan}}

Bird's order is vectors (section 6, chapter 34) long before matrices (chapters 58 and 59, near the back), and chapter 59 ends on
Gaussian elimination. Chapter 58 is 11 pages (p.592 to 602); chapter 59 starts on p.603. The pageplace.de preview and the nibmehub.com copy are not the publisher's own sites, so both are SECONDARY.

### 2.5 A university engineering course (for the order of ideas)
{{edin}}

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

{{q-h7k3-knowl}}
{{q-h7k3-evid}}
{{q-h7k3-hours}}
{{q-h7k3-40}}

So the matrix skills SQA lists are: define a matrix (square, identity, transpose), scalar multiple, add and subtract, multiply two
matrices, **the determinant of a 3 by 3, the inverse of a 3 by 3, and Gaussian elimination for three variables**. Matrices get 10 hours of
the unit's 40. SQA's support notes add that elimination should be used on engineering-related problems (read in the fetched page; trimmed in the saved copy). Nothing in the unit names
transformations, rotations or area; the geometry is Dan's way in, not the syllabus's. (The fetched page also says assessment is unseen and closed-book with no computer algebra; the saved copy trims that sentence, so I do not quote it.)
Which HN Dan's Level 3 course leads to, and whether it includes this unit, is **UNCONFIRMED**; it is optional in the HND.

### 3.2 Pearson BTEC Higher Nationals in Engineering, Unit 4002 (Engineering Mathematics)
Unit 4002 is a core, mandatory unit in the HNC. Its second learning outcome is matrix methods:

{{q-p4002-core}}
{{q-p4002-lo2}}
{{q-p4002-p}}

The 2017 specification's matrix content closely matches SQA's (determinants of 2 by 2 and 3 by 3, the inverse to solve equations, Gaussian elimination
up to 3 by 3). Whether the 2024 "for England" specification keeps this learning outcome is **UNCONFIRMED**: the pages the tools returned for the 2024
version list the unit title but not its content. The criteria lines P4 and P5 come from a copy of the 2019 specification on `htu.edu.jo`, SECONDARY.

### 3.3 MCA engineer officer syllabus lines (GOV.UK)
{{q-mca-29}}
{{q-mca-28}}
{{q-mca-kirch}}
{{q-mca-kcl}}
{{q-eto-vec}}

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
{{s4-grid}}
{{s4-order}}
{{s4-names}}
{{s4-routes}}

My reading: two uses should open the course. (a) A matrix as a table that keeps track (HELM's routes between sites; a system of equations written as a
grid, where each row is one equation and each column is one unknown). (b) A matrix as a move of the plane (Brilliant, Khan, Strang). The
first is what the engineering syllabi use; the second is what makes the rules sensible. Notation to teach: rows then columns, "2 by 3", the entry in
row 2 column 3, the names A, I, A⁻¹. HELM and Bird both teach the "matrix of coefficients, unknowns and constants" naming, which links directly to Dan's
Linear systems course.

### 4.2 Linear combinations (deferred here from Vectors)
Dan's Vectors brief sent linear combinations to Matrices ("linear combinations as a system to solve, linear interpolation").
{{b-vec-l3}}
{{s4-lc-lib}}
{{s4-3b-mult}}

My reading: do linear combinations inside the matrix-times-vector lesson, not as a separate lesson. "x times one arrow plus y times another" is exactly
what a matrix times a column vector computes, and it is the same sum Dan did for resultants in Vectors lesson 3. Span and "which combinations are
possible" are Linear algebra's (Brilliant's "Possible Combinations" is the doorway to span, so it should be glanced at, not taught).

### 4.3 A matrix times a vector as a transformation: stretch, rotate, reflect, shear; the columns are where i and j land
{{s4-3b-four}}
{{s4-3b-cols}}
{{s4-mit}}
{{s4-lt-gal}}
{{s4-3b-dep}}

Brilliant's level 3 gives the gallery: "Diagonal Matrices", "Rotations and Reflections", "Shear Transformations", "Degenerate Transformations" (1.1). For
rotation, the matrix is built from cosine and sine of the angle, which Dan has from Trigonometry (the point (cos θ, sin θ) on the unit circle) and Complex numbers
(multiplying by j turns by 90°). HELM uses the rotation matrices to show an inverse (4.5). The SQA Advanced Higher page (maths.scot) recommends the same two-step habit: find the image of (1, 0) and write it as the first column, then the image of (0, 1) as the second
column. I read that in the fetched page; the saved copy does not hold it cleanly, so it is not quoted.

### 4.4 Multiplying matrices as one transformation after another; why the order matters
{{s4-3b-comp}}
{{s4-3b-rl}}
{{s4-lib-order}}
{{s4-helm-id}}

My reading: this is the lesson where order is a *picture*, not a rule: rotate then shear is not shear then rotate (3Blue1Brown's example), and the product is read right to left, as
"f(g(x))" is. The row-times-column rule can come second, as the bookkeeping that finds the product's two columns by following i and j through both moves. The identity is the
"do nothing" move. HELM's 7.2 outcome (AB is not BA in most cases, quoted above) and the SQA properties (multiplication, in general, is not commutative; it is associative) are the
facts to be able to state.

### 4.5 The identity and the inverse as undoing a move; the 2 by 2 inverse
{{s4-helm-inv}}
{{s4-strang}}
{{s4-3b-rev}}
{{s4-helm-rot}}
{{s4-helm-2x2}}
{{s4-helm-zero}}
{{s4-3b-unsq}}

The 2 by 2 inverse formula is `A⁻¹ = (1 / (ad − bc)) × [d −b; −c a]` (HELM Key Point 8, in the saved text as a matrix I do not quote). My reading: teach the formula
*after* the picture. Swap the diagonal, change the other two signs, divide by the determinant: that is a recipe, and Dorier and colleagues (6.2) name "recipes without understanding" as the source of the worst
misconceptions. HELM's rotation example (a turn through θ then through −θ is no turn) is the cleanest bridge from "undo" to the formula. Brilliant's "Producing the Identity" and
"Non-invertible Matrices" lessons are the same two beats.

### 4.6 The determinant as the area scale factor; the sign as a flip; zero means squashed flat and no inverse
{{s4-3b-area}}
{{s4-3b-neg}}
{{s4-3b-zero}}
{{s4-smith}}
{{s4-jhu}}
{{s4-duke}}
{{h-wb7-lo3}}

My reading: this is the idea with the best evidence for a picture-first order. Brilliant's level 7 begins with "Transformed Areas", Khan's lessons put "Interpreting determinants in terms of
area" beside "Intro to determinant notation and computation" (2.1), the university notes (Michigan, JHU, Duke) all use area or volume, and HELM's reason for the determinant is to decide "whether a system of linear equations has a unique solution or not". Teach: the unit square's image is a parallelogram; its area is ad − bc; a negative value means the sheet has been turned over;
zero means the parallelogram has collapsed onto a line, so nothing can undo it. The "where it matters to Dan" link is zero determinant = no unique solution (4.8).

### 4.7 The 3 by 3 determinant, including the cross product's component formula (deferred here from Vectors)
{{s4-helm-3x3}}
{{s4-helm-cross}}
{{s4-helm-cross2}}
{{s4-helm-cross-pre}}
{{s4-lamar}}

The Vectors brief says "The component formula is usually written as a determinant ... and determinants belong to Matrices. So the formula waits for Matrices." This course must therefore give
the 3 by 3 determinant (HELM 7.3, expansion along the top row with cofactors) and then close the loop: a × b is that determinant with i, j, k treated, temporarily, as if they were scalars (HELM's words, quoted above).
HELM 9.4 also shows the area of a triangle as half the size of AB × AC, which links back to the determinant as an area. In three dimensions the determinant is the volume scale factor of the unit
cube (Brilliant's course is 2 by 2 only and says so in 1.2); I did not keep a clean 3Blue1Brown quote for it (the saved text has TeX), so that is a reading.
Khan's Linear algebra lessons include the rule of Sarrus as a second way to evaluate a 3 by 3 determinant (2.1); the HELM method (first row and cofactors) is the one that extends and that SQA names ("minor and the cofactor", 3.1).

### 4.8 Solving simultaneous equations with matrices (building on Linear systems)
Writing the system as a matrix equation, solving with the inverse, elimination for three unknowns, and what no solution or infinitely many look like:

{{s4-helm-solve}}
{{s4-helm-sol}}
{{s4-helm-a}}
{{s4-helm-b}}
{{m-helm-nsol}}
{{s4-cramer}}
{{s4-3b-uniq}}
{{s4-helm-3unk}}
{{s4-helm-inc}}
{{s4-helm-ans}}

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
{{s4-khan-mesh}}
{{s4-aac}}
{{s4-et-eq}}
{{s4-et-steps}}
{{s4-et-steps2}}
{{s4-et-sol}}
{{s4-dum}}
{{s4-uw-form}}
{{s4-uw}}
{{s4-pmcl}}

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

{{p-helm-pre}}

4. **Elimination written as a grid** (row operations), which Dan has done as equations.
5. **The word "invertible/singular"** (SQA Advanced Higher uses "singular").

Brilliant's stated prerequisites (1.1) are vectors, components and writing one vector as a linear combination of others; Dan's Vectors course covers the first two and, deliberately, not the third.
SQA's older Advanced Higher unit says matrices are the one outcome that does not build on Higher:

{{p-ah-recomm}}

My reading: that is the right model for Dan too. Matrices are new ground, not a revision of something he half-has; the only true prerequisites are vectors, two-equation systems and trigonometry, all done.

---

## 6. Misconceptions and learning science, for each skill

The research on this topic is mostly about undergraduates in linear algebra; where it is about matrices as such it is thinner. I flag the weight of each source.

### 6.1 Reading a grid: rows against columns
{{m-ex-rows}}

Edexcel's examiners (Further Maths, Core Pure 1, November 2021, question 4) report that confusing rows with columns was the common error. This is a small, specific, fixable point: it argues for always saying the entry's
position as "row 2, column 3" and for HELM's habit of tying each row to one equation and each column to one unknown (4.1).

### 6.2 Matrix times vector, and what a matrix "is": the three meanings of Ax = b
{{m-lz}}
{{m-lz2}}
{{m-aps}}
{{m-ts}}
{{m-dorier}}
{{m-dorier2}}
{{m-sierp}}

Larson and Zandieh (2013, *For the Learning of Mathematics*) is the strongest single source for this course's design. It says the same equation Ax = b is read three ways and that the vector x is conceived very differently in each. (My gloss: an input to move, the weights in a combination, the unknowns of a system.) My reading: the course teaches all three, in order, on one object. The matrix as a move (4.3); the product as a
combination of columns (4.2); the equation Ax = b as the unknowns of a system (4.8). The seam between them (that the "x" in Ax = b is the input of the move, found by undoing it) is where the course earns its keep.
The Dorier group (France, the "obstacle of formalism") and Sierpinska (students' practical thinking, and difficulty moving between the geometric, arithmetic and structural modes) are the research behind "picture first,
then the rule". Thomas and Stewart (2011), as cited in a study of 73 in-service teachers (ERIC EJ1366218, *International Electronic Journal of Mathematics Education* 17(4)), say students are confident in matrix procedures and reluctant to reason in other ways. Weight: the
Dorier book is a respected synthesis of French and North American work; EJ1366218 is a single small study of in-service teachers; Larson and Zandieh is a short journal article.

### 6.3 Multiplication: commutativity, and the "multiply the matching entries" slip
{{m-comm}}
{{m-comm2}}
{{s4-lib-order}}

Both slips are well documented in teaching materials, but I found **no peer-reviewed measurement of how common each is**; the two statements above are from a revision site and a Q&A page, so they are SECONDARY.
The sharper research point is the one in 4.4: the order of the matrices is the reverse of the order of the moves. My reading: a rotate-then-shear picture that fails when the order is swapped is the natural counterexample, and a
numeric check of AB against BA on the course's own 2 by 2s costs one screen.

### 6.4 The inverse: one symbol for three things
{{m-inv3}}
{{m-strang-no}}

Bagley, Rasmussen and Zandieh (2015, reported in a Dublin City University study) found that students use the superscript −1 for three different objects: the reciprocal, the inverse function and the inverse matrix. My reading: because
Dan already uses `x⁻¹` for reciprocal and `f⁻¹` for inverse functions (Powers and roots; Functions and their graphs), the course should say in one line that A⁻¹ is the third use, and tie it to "undo".

### 6.5 The determinant: formula without meaning, and the direction of the scale factor
{{m-ex-area}}
{{m-ex-det}}
{{m-hannah}}
{{m-3b-vis}}

The Edexcel IAL Further Pure 1 examiners (Summer 2024) report that "the most common error was to go on to multiply the given area by 320 instead of dividing it". As I read the fragment, the candidates had found det B (320) correctly but used it the wrong way round. This is the
cleanest examiner evidence for teaching the determinant as a scale factor with a direction (image area = determinant × original area). Everything else on this skill is expository (3Blue1Brown, Hannah's *Monthly* article), not a study. Weight: strong for the point, thin for how common.

### 6.6 Elimination and solving: reading what the answer means
{{m-ge-1}}
{{m-ge-2}}
{{m-ge-3}}
{{m-ge-4}}
{{m-nsf-1}}
{{m-nsf-2}}
{{m-nsf-3}}
{{m-nsf-4}}
{{m-nsf-5}}
{{m-nsf-6}}

This is the best-evidenced difficulty. An ERIC study of 73 in-service teachers (the "linear independence" paper) found that the row operations were often right and the *conclusion* wrong: 12 students carried out the correct row operations but "did not provide the correct deduction", and some wrote "the system is inconsistent therefore it is linearly independent". A RUME paper on two students building systems found that both reached for "parallel planes" for both no solution and
infinitely many, and one thought multiplying the second equation by a number was the only way to get infinitely many solutions. It cites Oktaç (2018) that reading the result x = x was not intuitive. My reading, for the design:
(a) make "what does the finished grid say?" its own step, with the three outcomes side by side (a unique answer, a conflict like 0 = 5, a free row 0 = 0); (b) show the geometry of three planes for each; (c) ask Dan to *predict*
the outcome from the determinant and from the grid before elimination, then check. Dan's Linear systems course already did "no solution / infinitely many" for two lines (parallel and the same), which is the foothold.
The RUME paper's title and authors are not in the saved text (the file header is just `par.nsf.gov`), so I cannot name them: **UNCONFIRMED**; it is the 24th RUME conference paper on students' reasoning about systems with no or infinitely many solutions.

### 6.7 Setting up the circuit equations
{{m-uw-shared}}
{{m-et-i3}}
{{m-pmcl-sym}}

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
{{u-helm-circ}}
{{u-helm-kirch}}
{{u-helm-frame}}

This is Dan's strongest link: it is what the HELM workbook says is the reason for the topic, and it is the same Kirchhoff he did in Linear systems and meets again in AC circuits. (Section 4.9 has the worked method.)

### 7.2 Motors and inverters: the Clarke and Park transforms are matrices, and the Park transform is a rotation
{{u-clarke}}
{{u-park}}
{{u-park2}}
{{u-clarke-mw}}

My reading: Dan's Motors course has the rotating field. A drive controller turns three currents 120° apart into two numbers that stand still in a frame that turns with the rotor, and each step is a matrix times a vector; the second step is the rotation matrix of 4.3.
The sources above are an IEEE paper (MIT's author manuscript) and MathWorks documentation; neither is a navy source. Whether Dan's marine engineering course covers field-oriented control is **UNCONFIRMED**; as an *example of a rotation matrix at work in a machine* it is secure.

### 7.3 Unbalanced three-phase: symmetrical components
{{u-symm}}

My reading: Dan's AC circuits lesson 10 shows the neutral current growing when a load is unbalanced, "with no sums". The symmetrical-components transform is a 3 by 3 matrix equation that splits an unbalanced set of three phasors into three balanced sets,
so the matrix is the tool that puts numbers on that picture. It involves complex numbers (the transform uses the complex rotation operator a), so I would mention it as a pointer in the brief and not as a lesson.

### 7.4 Ships and submarines: attitude and navigation
{{u-ins1}}
{{u-ins2}}
{{u-ship}}
{{u-mit-frames}}

These are research and patent texts, not training syllabi. My reading: the clearest naval link for a *rotation matrix* is the attitude of a hull. A ship's pitch, roll and yaw are turned into a 3 by 3 matrix that carries the body's
axes into the navigation axes. Brilliant's 2 by 2 rotation (4.3) is the flat version. The mention is a context for a screen in the rotation lesson, not a syllabus line.

### 7.5 Power systems: the nodal admittance matrix
{{u-ybus3}}
{{u-ybus4}}

SECONDARY (lecture notes and a general reference site). My reading: a ship's power system is a network of buses, and its study is the same loop-and-node method as the circuit example, only bigger; the matrix gets large and mostly empty. A brief pointer in the circuit lesson.

### 7.6 Nuclear propulsion: reactor core calculations
{{u-nuc1}}
{{u-nuc2}}
{{u-nuc3}}
{{u-nuc4}}
{{u-nuc5}}

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
