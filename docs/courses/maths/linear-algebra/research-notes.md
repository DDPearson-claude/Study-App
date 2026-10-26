# Linear algebra: research notes

Researched 25 Oct 2026 for the Linear algebra course brief (the fourth course in the Maths shelf's Advanced maths
folder, which now runs Calculus fundamentals, Vectors, Matrices, Linear algebra, Vector calculus, Differential
equations, Group theory; blurb "Vector spaces, determinants, eigenvalues and what they reveal.", benchmark Brilliant's
Linear Algebra course). The brief itself is not written here; these notes are its evidence. Dan is an electrician and
a Royal Navy submariner on the electrical engineering path; next year he does a Level 3 marine engineering course.
He has Vectors, Differential equations and Matrices behind him (their briefs are in `build/maths/`), so this course
takes up what those three deferred to it.

Every finding has its source title, URL and the exact words, cut out of a saved tool result by script between two
anchor phrases (no quote was retyped into this file). All of them are listed in `quotes.json` beside this file and
were checked with `node tools/eval/sources.mjs --quotes ... --tools ...`. The tool files are in `tools/`: the ones
this run made (`harvest.mjs`, plus three oversize fetch results copied from the connector's saved payloads), and
three syllabus pages already fetched for the Matrices brief (SQA Engineering Mathematics 4 and two MCA syllabus
pages), copied unchanged. Findings I could not confirm are marked **UNCONFIRMED**; where only a non-original site said
it, **SECONDARY**. My own readings are marked "My reading" and are not quotes. Mirror and copy sites were avoided.
Hosts that republish an original text (LibreTexts, MIT OpenCourseWare, university lecture notes) are used for
mathematics only, and the SECONDARY label marks blogs and tutoring sites.

---

## 1. Benchmark: Brilliant's Linear Algebra

### 1.1 The course itself
Brilliant's page is `brilliant.org/courses/lin-alg`. It is **41 lessons in 7 levels**, and it is the abstract course: Level 1 opens with "What is a Vector?" and "Why Vector Spaces?", and Levels 5 and 7 go on to bivectors, tensors and singular values. Eigenvalues come in Level 6 (lesson 2 of 8), with diagonalisability the lesson after.

- **Brilliant's Linear Algebra is 41 lessons and 355 exercises, and starts in the abstract**
  - Source: Practice Linear Algebra | Brilliant. https://brilliant.org/courses/lin-alg
  - Quote: "Delve into the abstract depths of linear algebra: vector spaces, determinants, eigenvalues, wedge products, and more. 41 Lessons 355 Exercises"

- **Levels 1 to 4: vector spaces, Gauss-Jordan, span and subspaces, coordinates and bases, matrix subspaces, then matrices**
  - Source: Practice Linear Algebra | Brilliant. https://brilliant.org/courses/lin-alg
  - Quote: "Level 1 What is a Vector? Waves as Abstract Vectors Why Vector Spaces? ## Level 2 The Gauss-Jordan Process I The Gauss-Jordan Process II Application: Markov Chains I ## Level 3 Real Euclidean Space I Real Euclidean Space II Span & Subspaces Coordinates & Bases Matrix Subspaces Application: Coding Theory Application: Graph Theory I ## Level 4 What Is a Matrix? Linear Transformations Matrix Products Matrix Inverses Application: Image Compression I Application: Cryptography"

- **Levels 5 to 7: bivectors and tensors, then eigenvalues and diagonalisability (Level 6), then inner products and SVD**
  - Source: Practice Linear Algebra | Brilliant. https://brilliant.org/courses/lin-alg
  - Quote: "Level 5 Bivectors Trivectors & Determinants Determinant Properties Multivector Geometry Dual Space Tensors & Forms Tensor Products Wedges & Determinants ## Level 6 Application: Markov Chains II Eigenvalues & Eigenvectors Diagonalizability Normal Matrices Jordan Normal Form Application: Graph Theory II Application: Discrete Cat Map Application: Arnold's Cat Map ## Level 7 Inner Product Spaces Gram-Schmidt Process Least Squares Regression Singular Values & Vectors Singular Value Decompositions SVD Applications"

- **Brilliant's description: geometric intuition first, then the abstract**
  - Source: Practice Linear Algebra | Brilliant. https://brilliant.org/courses/lin-alg
  - Quote: "Linear algebra plays a crucial role in many branches of applied science and pure mathematics. This course covers the core ideas of linear algebra and provides a solid foundation for future learning. Using geometric intuition as a starting point, the course journeys into the abstract aspects of linear algebra that make it so widely applicable"

- **Brilliant's outcome line, with its applications quizzes**
  - Source: Practice Linear Algebra | Brilliant. https://brilliant.org/courses/lin-alg
  - Quote: "By the end you'll know about vector spaces, linear transformations, determinants, eigenvalues & eigenvectors, tensor & wedge products, and much more. The course also includes applications quizzes with topics drawn from such diverse areas as image compression, cryptography, error coding, chaos theory, and probability"

- **Brilliant's topics covered**
  - Source: Practice Linear Algebra | Brilliant. https://brilliant.org/courses/lin-alg
  - Quote: "Topics covered * Bases * Determinants * Diagonalizable Matrices * Eigenvalues and Eigenvectors * Gaussian Elimination * Gram-Schmidt Process * Inner Products * Inverses * Linear Independence * Linear Transformations * Matrices * Subspaces * Tensors & Tensor Products * Vector Spaces"

- **Its prerequisite is calculus and linear equations, not the Matrices course**
  - Source: Practice Linear Algebra | Brilliant. https://brilliant.org/courses/lin-alg
  - Quote: "A basic understanding of calculus and linear equations is necessary"

My reading of the order: abstract vectors and vector spaces (L1), Gauss-Jordan elimination (L2), span, subspaces, coordinates and bases and matrix subspaces (L3), matrices as linear maps with products and inverses (L4), determinants through wedges (L5), then eigenvalues, diagonalisability, normal matrices and Jordan form (L6), then inner products and SVD (L7). Span, bases and "matrix subspaces" (the column and null space) come before eigenvalues, as in Dan's planned scope. Brilliant puts matrices (L4) after span and bases (L3), the reverse of the Matrices course, which comes first in Dan's shelf. The page gives only titles, so the pictures inside each lesson are **UNCONFIRMED** (I did not see a lesson). Brilliant has no lesson title on lines and planes in 3-D, on systems of differential equations or on an engineering use (titles only, so this is **UNCONFIRMED** for what is inside a lesson); its applications are Markov chains, coding theory, graph theory, image compression, cryptography and the cat map.

### 1.2 Where it sits in Brilliant's path

- **Brilliant's Matrices course (43 lessons) is 2 by 2 and is "not quite" a linear algebra course**
  - Source: Does Brilliant cover Precalculus? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-precalculus/
  - Quote: "Not quite. They work entirely in two dimensions with 2×2 matrices, the scope of a Precalculus matrix unit"

- **Brilliant's own list of its advanced math courses leaves Linear Algebra out; it ends at Matrices**
  - Source: What math does Brilliant cover? | Brilliant. https://brilliant.org/help/courses-and-curriculum/what-math-does-brilliant-cover
  - Quote: "Advanced math |Advanced |Limits; Derivatives; Calculus; Vectors; Matrices"

- **Vectors ends where Matrices picks up**
  - Source: Practice Vectors | Brilliant. https://brilliant.org/courses/vectors
  - Quote: "When you finish, the Matrices course picks up right where this one leaves off"

- **Matrices: 43 lessons, basis vectors first, ends on systems and inverses**
  - Source: Practice Matrices | Brilliant. https://brilliant.org/courses/matrices/
  - Quote: "Take your vector skills further by using matrices to transform the plane. 43 Lessons 750 Exercises"

- **The Matrices course describes its prerequisites as vectors and linear combinations (Dan has these)**
  - Source: Practice Matrices | Brilliant. https://brilliant.org/courses/matrices/
  - Quote: "Before you get started, you should be comfortable working with vectors, including their components and how to write one vector as a linear combination of others, which you can pick up in the Vectors course"

My reading: the reachable pages put Brilliant's Linear Algebra as a separate, later course for people with calculus, not as the next step in the Vectors then Matrices path. The /courses/ page that I fetched lists only the band names, not a sequence, so Linear Algebra's exact slot in the path is **UNCONFIRMED**. Brilliant's Matrices already held Possible Combinations and Standard Basis Vectors (Level 1), which Dan's Matrices brief glanced at once and sent here.

---

## 2. Other courses' order for the same ground

### 2.1 Khan Academy: Linear algebra (3 units)
Khan's course is three units: Vectors and spaces, Matrix transformations, Alternate coordinate systems (bases). Its eigenvalue lessons are the last section in the last unit's list, after change of basis.

- **Khan's three units, in order**
  - Source: Vectors and spaces | Linear algebra | Math | Khan Academy. https://www.khanacademy.org/math/linear-algebra/vectors-and-spaces
  - Quote: "Linear algebra 3 units Unit 1 Vectors and spaces Unit 2 Matrix transformations Unit 3 Alternate coordinate systems (bases"

- **Unit 1 opens with vectors, including parametric representations of lines**
  - Source: Vectors and spaces | Linear algebra | Math | Khan Academy. https://www.khanacademy.org/math/linear-algebra/vectors-and-spaces
  - Quote: "Vector intro for linear algebra (Opens a modal) * Real coordinate spaces (Opens a modal) * Adding vectors algebraically & graphically (Opens a modal) * Multiplying a vector by a scalar (Opens a modal) * Vector examples (Opens a modal) * Unit vectors intro (Opens a modal) * Parametric representations of lines (Opens a modal"

- **Then linear combinations and spans, independence, subspaces and basis**
  - Source: Vectors and spaces | Linear algebra | Math | Khan Academy. https://www.khanacademy.org/math/linear-algebra/vectors-and-spaces
  - Quote: "Linear combinations and spans ### Learn * Linear combinations and span (Opens a modal) ## Linear dependence and independence ### Learn * Introduction to linear independence (Opens a modal) * More on linear independence (Opens a modal) * Span and linear independence example (Opens a modal) ## Subspaces and the basis for a subspace ### Learn * Linear subspaces (Opens a modal) * Basis of a subspace (Opens a modal"

- **Unit 1 then does dot and cross products and planes in R3 (point and normal vector; distance to a plane)**
  - Source: Vectors and spaces | Linear algebra | Math | Khan Academy. https://www.khanacademy.org/math/linear-algebra/vectors-and-spaces
  - Quote: "Vector dot and cross products ### Learn * Defining the angle between vectors (Opens a modal) * Defining a plane in R3 with a point and normal vector (Opens a modal) * Cross product introduction (Opens a modal) * Proof: Relationship between cross product and sin of angle (Opens a modal) * Dot and cross product comparison/intuition (Opens a modal) * Vector triple product expansion (very optional) (Opens a modal) * Normal vector from plane equation (Opens a modal) * Point distance to plane (Opens a modal) * Distance between planes (Opens a modal"

- **Unit 1 ends with elimination, null space, column space, nullity and rank**
  - Source: Vectors and spaces | Linear algebra | Math | Khan Academy. https://www.khanacademy.org/math/linear-algebra/vectors-and-spaces
  - Quote: "Matrices for solving systems by elimination ### Learn * Solving a system of 3 equations and 4 variables using matrix row-echelon form (Opens a modal) * Solving linear systems with matrices (Opens a modal) * Using matrix row-echelon form in order to show a linear system has no solutions (Opens a modal) ## Null space and column space ### Learn * Matrix vector products (Opens a modal) * Introduction to the null space of a matrix (Opens a modal) ... * Column space of a matrix (Opens a modal) * Null space and column space basis (Opens a modal) * Visualizing a column space as a plane in R3 (Opens a modal) * Proof: Any subspace basis has same number of elements (Opens a modal) * Dimension of the null space or nullity (Opens a modal) * Dimension of the column space or rank (Opens a modal"

- **Unit 3 opens: change of basis lets you turn complicated transformations into easier ones**
  - Source: Alternate coordinate systems (bases) | Linear algebra | Math | Khan Academy. https://www.khanacademy.org/math/linear-algebra/alternate-bases
  - Quote: "What happens when we have multiple transformations that cannot be easily perfomed on a coordinate system? We get creative! By changing the coordinate systems to different bases we can turn overly-complicated transformations into much easier tasks"

- **Unit 3 change of basis lessons: coordinates with respect to a basis, the change of basis matrix, the transformation matrix**
  - Source: Alternate coordinate systems (bases) | Linear algebra | Math | Khan Academy. https://www.khanacademy.org/math/linear-algebra/alternate-bases
  - Quote: "Change of basis ### Learn * Coordinates with respect to a basis (Opens a modal) * Change of basis matrix (Opens a modal) * Invertible change of basis matrix (Opens a modal) * Transformation matrix with respect to a basis (Opens a modal"

- **Unit 3 ends with Eigen-everything: 2 by 2 and 3 by 3 eigenvalues, eigenvectors and eigenspaces**
  - Source: Alternate coordinate systems (bases) | Linear algebra | Math | Khan Academy. https://www.khanacademy.org/math/linear-algebra/alternate-bases
  - Quote: "Eigen-everything ### Learn * Introduction to eigenvalues and eigenvectors (Opens a modal) * Proof of formula for determining eigenvalues (Opens a modal) * Example solving for the eigenvalues of a 2x2 matrix (Opens a modal) * Finding eigenvectors and eigenspaces example (Opens a modal) * Eigenvalues of a 3x3 matrix (Opens a modal) * Eigenvectors and eigenspaces for a 3x3 matrix (Opens a modal"

My reading: Khan's order is span, independence, subspaces, then planes, then rank, then (in Unit 3) change of basis, and eigenvalues last. Dan's scope runs in this same order. Khan's course goes much further (orthogonal complements, projections, Gram-Schmidt, least squares), which this course leaves out.

### 2.2 HELM (Loughborough)
HELM has no single linear algebra workbook. Matrices (7), Matrix solution of equations (8), Vectors (9) and Eigenvalues and Eigenvectors (22) are four separate workbooks.

- **HELM Workbook 22 is 53 pages in four sections: basic concepts, applications, repeated eigenvalues and symmetric matrices, numerical methods**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2049%20Student's%20Guide.pdf
  - Quote: "Workbook 22 - Eigenvalues and Eigenvectors (53 pages) 22\.1 Basic Concepts 22\.2 Applicatio 17 Conics and Polar Coordinates 43 18 Functions of Several Variables 40 19 Differential Equations 70 20 Laplace Transforms 73 21 z \-Transforms 96 22 Eigenvalues and Eigenvectors 53 ns of Eigenvalues and Eigenvectors 22\.3 Repeated Eigenvalues and Symmetric Matrices 22\.4 Numerical Determination of Eigenvalues and Eigenvectors"

- **HELM 22 learning outcomes: eigenvalues and eigenvectors of 2 by 2 and 3 by 3 matrices**
  - Source: 22 22. https://www.mub.eps.manchester.ac.uk/helm/wp-content/uploads/sites/81/2020/09/22_1.pdf
  - Quote: "You will learn how to determine the eigenvalues (k) and corresponding eigenvectors (X) for a given matrix A. You will learn of some of the applications of eigenvalues and eigenvectors. ### In this Workbook you will learn about the matrix eigenvalue problem AX = kX where A is a square matrix and k is a scalar (number). " ! ## Learning Outcomes On completion you should be able to . . . • obtain eigenvalues and eigenvectors of 2 × 2 and 3 × 3 matrices"

- **HELM 22 assumes basic matrix algebra and an outline of determinants, and uses the characteristic equation**
  - Source: About the HELM Project. https://nucinkis-lab.cc.ic.ac.uk/HELM/HELM_Workbooks_46-50/WB50-all.pdf
  - Quote: "This Workbook assumes a knowledge of basic matrix algebra and an outline knowledge of determi- nants"

- **HELM 22.2 says where eigenvalues turn up: control, vibration analysis, electric circuits**
  - Source: 22 22. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2022%20Eigenvalues%20and%20Eigenvectors.pdf
  - Quote: "Many applications of matrices in both engineering and science utilize eigenvalues and, sometimes, eigenvectors. Control theory, vibration analysis, electric circuits, advanced dynamics and quantum mechanics are just a few of the application areas"

- **HELM 22.2 learning outcomes: diagonalise, and solve systems of linear differential equations by decoupling**
  - Source: 22 22. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2022%20Eigenvalues%20and%20Eigenvectors.pdf
  - Quote: "diagonalize a matrix with distinct eigenvalues using the modal matrix • solve systems of linear differential equations by the ‘decoupling’ method"

- **HELM 9 section on lines and planes: direction ratios, then the vector equation of a line and of a plane**
  - Source: 99. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%209%20Vectors.pdf
  - Quote: "In this Section you will learn about direction ratios and direction cosines and then how to formulate the vector equation of a line and the vector equation of a plane"

### 2.3 Bird's Higher Engineering Mathematics (9th edition, by a Royal Navy lecturer)
Bird's book is the one used on UK HNC and HND courses and it is written by a lecturer from the Royal Navy's own college. Eigenvalues are the last section of its matrices chapter, and the lines and planes of vector geometry come in a later section.

- **Bird 9th edition contents: matrices and determinants (20), applications (21) ending with stiffness matrix and eigenvalues, then vector geometry (22 onwards)**
  - Source: Bird’s Higher Engineering Mathematics; Ninth Edition. https://api.pageplace.de/preview/DT0400.9781000353037_A40491166/preview-9781000353037_A40491166.pdf
  - Quote: "Section E Matrices and determinants 251 20 The theory of matrices and determinants 253 20.1 Matrix notation 253 20.2 Addition, subtraction and multiplication of matrices 254 20.3 The unit matrix 257 20.4 The determinant of a 2 by 2 matrix 257 20.5 The inverse or reciprocal of a 2 by 2 matrix 258 20.6 The determinant of a 3 by 3 matrix 259 20.7 The inverse or reciprocal of a 3 by 3 matrix 261 21 Applications of matrices and determinants 265 21.1 Solution of simultaneous equations by matrices 266 21.2 Solution of simultaneous equations by determinants 268 21.3 Solution of simultaneous equations using Cramer’s rule 271 21.4 Solution of simultaneous equations using the Gaussian elimination method 272 21.5 Stiffness matrix 274 21.6 Eigenvalues and eigenvectors 275"

- **Bird: a stiffness matrix section sits just before eigenvalues, and Gaussian elimination before that**
  - Source: Bird’s Higher Engineering Mathematics; Ninth Edition. https://api.pageplace.de/preview/DT0400.9781000353037_A40491166/preview-9781000353037_A40491166.pdf
  - Quote: "21.4 Solution of simultaneous equations using the Gaussian elimination method 272 21.5 Stiffness matrix 274 21.6 Eigenvalues and eigenvectors 275"

- **Bird's author lectured at the Royal Navy's Defence College of Marine Engineering, HMS Sultan**
  - Source: Bird’s Higher Engineering Mathematics; Ninth Edition. https://api.pageplace.de/preview/DT0400.9781000353037_A40491166/preview-9781000353037_A40491166.pdf
  - Quote: "He has recently retired from lecturing at the Royal Navy’s Defence College of Marine Engineering in the Defence College of Technical Training at H.M.S. Sultan, Gosport, Hampshire, UK, one of the largest engineering training establishments in Europe"

- **Bird says the book is aimed at degree and HNC/HND courses**
  - Source: Bird’s Higher Engineering Mathematics; Ninth Edition. https://api.pageplace.de/preview/DT0400.9781000353037_A40491166/preview-9781000353037_A40491166.pdf
  - Quote: "The extensive and thorough topic coverage makes this an ideal text for undergraduate degree courses, founda- tion degrees, and for higher-level vocational courses such as Higher National Certificate and Diploma courses in engineering disciplines"

### 2.4 SQA, A level, and universities
I found no eigenvalue line in SQA Higher or Advanced Higher Maths (the Matrices brief quotes Advanced Higher's matrices, which are algebra, transformations and elimination); that absence is **UNCONFIRMED**. Eigenvalues appear in the SQA Higher National linear algebra units (section 3), in the UK A level Further Maths specifications, and in first-year engineering maths at Edinburgh.

- **AQA A level Further Maths C10: eigenvalues and eigenvectors of 2 by 2 and 3 by 3 matrices, and the characteristic equation**
  - Source: A-level Further Mathematics Specification Specification for first teaching in 2017. https://filestore.aqa.org.uk/resources/mathematics/specifications/AQA-7367-SP-2017.PDF
  - Quote: "C10 Find eigenvalues and eigenvectors of 2 × 2 and 3 × 3 matrices. Find and use the characteristic equation"

- **AQA: understand the geometrical significance of eigenvalues and eigenvectors**
  - Source: A-level Mathematics 7367 | Specification | Subject Content | Compulsory Content | AQA. https://www.aqa.org.uk/subjects/mathematics/a-level/mathematics-7367/specification/subject-content/compulsory-content
  - Quote: "Understand the geometrical significance of eigenvalues and eigenvectors"

- **AQA C11: diagonalisation of matrices, and powers, when eigenvalues are real**
  - Source: A-level Mathematics 7367 | Specification | Subject Content | Compulsory Content | AQA. https://www.aqa.org.uk/subjects/mathematics/a-level/mathematics-7367/specification/subject-content/compulsory-content
  - Quote: "Diagonalisat ion of matrices; M = UDU \-1 ; M = UD U \-1 ; when eigenvalues are real"

- **Pearson Edexcel Further Maths: eigenvalues of 2 by 2 and 3 by 3, repeated and complex eigenvalues, and reduction to diagonal form**
  - Source: A level Further Mathematics specification. https://qualifications.pearson.com/content/dam/pdf/A%20Level/Mathematics/2017/specification-and-sample-assesment/a-level-l3-further-mathematics-specification.pdf
  - Quote: "3\.1 Eigenvalues and eigenvectors of 2 × 2 and 3 × 3 matrices. Understand the term characteristic equation for a 2 × 2 matrix. Repeated eigenvalues and complex eigenvalues. Normalised vectors may be required"

- **Edinburgh first-year Engineering Mathematics 1a: vectors, matrices, then "Rank, eigenvalues, eigenvectors"**
  - Source: Course Catalogue - Engineering Mathematics 1a (MATH08074). https://www.drps.ed.ac.uk/23-24/dpt/cxmath08074.htm
  - Quote: "Basic vector algebra; scalar product, vector product, triple product and geometry. Matrices, inverses and determinants, linear equations and elimination. Rank, eigenvalues, eigenvectors"

- **Singapore further maths syllabus: real eigenvalues only, diagonalisation M = QDQ^-1 for powers of M, then linear spaces and subspaces**
  - Source: F M. https://www.moe.gov.sg/media/files/post-secondary/syllabuses/maths/df441fe7-287f-4006-8fc1-40b49ab9c78c.pdf
  - Quote: "eigenvalues and eigenvectors of square matrices (2 × 2 and 3 × 3 matrices, restricted to cases where the eigenvalues are real) • diagonalisation of a square matrix M by expressing the matrix in the form QDQ \-1 , where D is a diagonal matrix of eigenvalues and Q is a matrix whose • use of matrices to represent a set of linear equations • operations on 3 × 3 matrices • determinant of a square matrix and inverse of a non- singular matrix (2 × 2 and 3 × 3 matrices only) columns are eigenvectors, and use of this expression such as to find the powers of M • linear spaces and subspaces"

- **BBC Bitesize Higher Maths vectors guide: vectors, resultant, scalar product (not eigenvalues)**
  - Source: Geometric vectors - Geometric vectors - Higher Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zqvbb9q/revision/1
  - Quote: "Vectors describe movement with both direction and magnitude. They can be added or subtracted to produce resultant vectors. The scalar product can be used to find the angle between vectors"

BBC Bitesize: I found Higher Maths revision for geometric vectors (above) but no Bitesize page on eigenvalues, span or planes in 3-D; that absence is **UNCONFIRMED** (a search not returning a page is not proof).

### 2.5 3Blue1Brown, the widely used visual order
Span and basis first, then (after matrices, products, determinants and inverses) change of basis, then eigenvectors, which the change of basis chapter says it is for.

- **3Blue1Brown on change of basis: "the next chapter on eigenvectors" is why we use other coordinate systems**
  - Source: Change of basis | 3Blue1Brown. https://www.3blue1brown.com/lessons/change-of-basis
  - Quote: "For those of you wondering why we care about using alternate coordinate systems, the next chapter on eigenvectors and eigenvalues will give a really important example of this. See you then"

---

## 3. What a marine engineering HNC actually uses of this topic

### 3.1 SQA Higher National linear algebra units
SQA built a three-unit linear algebra suite (Linear Algebra 1, 2 and 3) "for advanced courses in the physical sciences". Linear Algebra 2 (SCQF level 8, the HND level) is almost exactly the second half of Dan's scope: lines and planes in 3-D, then eigenvalues, eigenvectors, eigenspaces and diagonalisation to form A to the n.

- **SQA Linear Algebra 2: purpose and the two outcomes**
  - Source: Higher National Unit Specification General information Linear Algebra 2 (SCQF level 8) Unit title: J5WF 35 Unit code: Unit purpose. https://www.sqa.org.uk/files/hn/J5WF35.pdf
  - Quote: "This unit, along with Linear Algebra 1 and Linear Algebra 3 , were designed to enable learners to develop the linear algebra skills required for advanced courses in the physical sciences. The unit will provide learners with opportunities to develop the knowledge, understanding and skills required to solve problems involving the use of vector geometry, eigenvalues, eigenvectors, eigenspaces and diagonalisation"

- **Linear Algebra 2 outcome 1: lines and planes in 3-D, the items**
  - Source: Higher National Unit Specification General information Linear Algebra 2 (SCQF level 8) Unit title: J5WF 35 Unit code: Unit purpose. https://www.sqa.org.uk/files/hn/J5WF35.pdf
  - Quote: "Vector, parametric and symmetric equations of lines. ♦ Parametric and non-parametric equations of planes. ♦ Angle between two lines and between two planes. ♦ Angle between a plane and a line. ♦ Point of intersection of two lines which are specified in different forms. ♦ Point of intersection of a line and a plane. ♦ Equation of the line of intersection of two planes. ♦ Shortest distance between a point and a line, and between two parallel planes"

- **Linear Algebra 2 outcome 2: eigenvalues, eigenvectors, eigenspaces, multiplicities, and A to the n by diagonalisation**
  - Source: Higher National Unit Specification General information Linear Algebra 2 (SCQF level 8) Unit title: J5WF 35 Unit code: Unit purpose. https://www.sqa.org.uk/files/hn/J5WF35.pdf
  - Quote: "Eigenvalues for a 2 x 2 matrix and a 3 x 3 matrix. ♦ Eigenvectors and eigenspaces for a 2 x 2 matrix and a 3 x 3 matrix. ♦ Algebraic and geometric multiplicities of eigenvalues for a 2 x 2 matrix and a 3 x 3 matrix. ♦ Form A n using diagonalisation transforms"

- **Linear Algebra 2 recommended entry: matrices, complex numbers and linear systems (Dan has all three)**
  - Source: Higher National Unit Specification General information Linear Algebra 2 (SCQF level 8) Unit title: J5WF 35 Unit code: Unit purpose. https://www.sqa.org.uk/files/hn/J5WF35.pdf
  - Quote: "it would be advantageous if learners had a good knowledge and understanding of matrices, complex numbers and linear systems, together with sound calculus skills"

- **Linear Algebra 2 gives 40 hours: 20 for lines and planes, 10 for eigenvalues (the rest is not split in the page I saw)**
  - Source: Higher National Unit Specification General information Linear Algebra 2 (SCQF level 8) Unit title: J5WF 35 Unit code: Unit purpose. https://www.sqa.org.uk/files/hn/J5WF35.pdf
  - Quote: "Outcome 1 — Solve problems involving lines and planes in 3-dimensions using vector geometry. (20 hours"

- **The eigenvalue outcome: 10 hours, up to 4 by 4, with double and triple roots**
  - Source: Higher National Unit Specification General information Linear Algebra 2 (SCQF level 8) Unit title: J5WF 35 Unit code: Unit purpose. https://www.sqa.org.uk/files/hn/J5WF35.pdf
  - Quote: "Outcome 2 — Solve problems involving eigenvalues, eigenvectors, eigenspaces and diagonalisation. (10 hours) ♦ Calculate the eigenvalues for 2 x 2, 3 x 3 and 4 x 4 matrices, include characteristic equations with double and triple roots"

- **SQA's own note: diagonalisation is "introduced as a translation"**
  - Source: Higher National Unit Specification General information Linear Algebra 2 (SCQF level 8) Unit title: J5WF 35 Unit code: Unit purpose. https://www.sqa.org.uk/files/hn/J5WF35.pdf
  - Quote: "Introduce the diagonalisation of a matrix as a translation"

- **SQA Linear Algebra 1 (SCQF level 7): vectors and complex numbers, then matrices to solve equations, inverse by cofactors, Gaussian elimination, Cramer**
  - Source: Higher National Unit Specification General information Unit title: Linear Algebra 1 (SCQF level 7) Unit code: J81W 34 Unit purpose. https://www.sqa.org.uk/files/hn/J81W34.pdf
  - Quote: "This unit will give learners a grounding in vectors, complex numbers, linear equations and the basic matrix techniques required for further studies in linear algebra"

- **SQA HN Engineering Mathematics 4 (the engineering route): matrices are Outcome 2 (definitions, operations, determinants, inverse, Gaussian elimination); no eigenvalues**
  - Source: Microsoft Word - H7K335. https://www.sqa.org.uk/sqa/files/hn/H7K335.pdf
  - Quote: "Outcome 2 Solve problems involving the manipulation of matrices. # Knowledge and/or Skills  Definitions  Matrix’s operations  Determinants  Inverse Matrices  Gaussian Elimination"

- **Engineering Mathematics 4 gives matrices 10 hours of its 40**
  - Source: Microsoft Word - H7K335. https://www.sqa.org.uk/sqa/files/hn/H7K335.pdf
  - Quote: "Outcome 2 (10 hours) Solve problems involving the manipulation of matrices"

- **Engineering Mathematics 4 is designed for HND learners who want to go on to a degree**
  - Source: Microsoft Word - H7K335. https://www.sqa.org.uk/sqa/files/hn/H7K335.pdf
  - Quote: "This Unit is designed to develop the mathematical skills required by learners who wish to use their Higher National Diploma in Engineering to articulate to university degree study"

My reading: SQA's Engineering Mathematics 4 (the engineering route) stops at matrices, and eigenvalues sit in the separate Linear Algebra units written "for advanced courses in the physical sciences". I saw Engineering Mathematics 4 only; the Differential equations brief says EM5 holds Laplace transforms. So eigenvalues are in the SQA HND-level linear algebra suite but not in the engineering unit I read. Whether a Royal Navy marine engineering qualification uses any SQA HN unit is **UNCONFIRMED**; I found no document that says so.

### 3.2 Pearson BTEC Higher National Engineering (Unit 2 Engineering Maths, now 4002; Unit 39 Further Mathematics, now 5006)
Pearson's 2010 Marine Engineering HNC makes Analytical Methods for Engineers a mandatory core unit, but I could not read that unit's content (**UNCONFIRMED**). The content I could read is the later Engineering spec: Unit 2 Engineering Maths (code M/615/1476, numbered 4002 in the 2024 specs) and Unit 39 Further Mathematics (numbered 5006 in 2024). Further Mathematics takes matrix methods only up to 3 by 3 determinant, inverse and Gaussian elimination.

- **Pearson Marine Engineering HNC (2010 spec): Unit 1 Analytical Methods for Engineers is a mandatory core unit**
  - Source: BTEC Higher Nationals Specification. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/Marine-Engineering/2010/Specification/9781446925461_BTEC_HNs_L45_MarEng_Issue_4.pdf
  - Quote: "Mandatory core units — all three units must be taken Unit level Unit credit 1 Analytical Methods for Engineers 4 15 2 Engineering Science 4 15"

- **The HND adds Unit 35 Further Analytical Methods for Engineers (Level 5)**
  - Source: BTEC Higher Nationals Specification. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/Marine-Engineering/2010/Specification/9781446925461_BTEC_HNs_L45_MarEng_Issue_4.pdf
  - Quote: "35 Further Analytical Methods for Engineers 5 15"

- **And an optional Unit 59 Advanced Mathematics for Engineering (Level 5)**
  - Source: BTEC Higher Nationals Specification. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/Marine-Engineering/2010/Specification/9781446925461_BTEC_HNs_L45_MarEng_Issue_4.pdf
  - Quote: "59 Advanced Mathematics for Engineering 5 15"

- **The marine spec's own mathematics aim: "routine mathematical methods essential to marine engineering"**
  - Source: BTEC Higher Nationals Specification. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/Marine-Engineering/2010/Specification/9781446925461_BTEC_HNs_L45_MarEng_Issue_4.pdf
  - Quote: "a knowledge of routine mathematical methods essential to marine engineering including an awareness of the functionality of standard methods"

- **Pearson Unit 39 Further Mathematics (Level 5): topics include matrix theory and linear equations**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "Among the topics included in this unit are: number theory, complex numbers, matrix theory, linear equations, numerical integration, numerical differentiation, and graphical representations of curves for estimation within an engineering context"

- **Unit 39 matrix methods: determinant of a 2 by 2, the inverse, Gaussian elimination up to 3 by 3**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "Introduction to matrices and matrix notation The process for addition, subtraction and multiplication of matrices Introducing the determinant of a matrix and calculating the determinant for a 2x2 matrix Using the inverse of a square matrix to solve linear equations Gaussian elimination to solve systems of linear equations (up to 3x3"

- **Unit 39 outcomes: P4 determinant of 3 by 3, P5 three equations by Gaussian elimination, M2 the inverse matrix method**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "P4 Ascertain the determinant of a given 3x3 matrix P5 Solve a system of three linear equations using Gaussian elimination M2 Determine solutions to a set of linear equations using the Inverse Matrix Method"

- **Unit 39 LO4 (differential equations): applications are single second-order equations such as mass-spring-damper systems and RLC circuits, not systems**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "Applications of second-order differential equations e.g. mass-spring-damper systems, information and energy control systems, heat transfer, automatic control systems and beam theory and RLC circuits"

- **Unit 2 (now 4002) Engineering Maths: a core, 15-credit Level 4 unit with sinusoidal waves and vector functions**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "Use analytical and computational methods for solving problems by relating sinusoidal wave and vector functions to their respective engineering application"

- **Pearson 2024 England specs name the same units Unit 4002 Engineering Maths and Unit 5006 Further Mathematics**
  - Source: BTEC Higher Nationals in Manufacturing Engineering for England: Specification. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/manufacturing-engineering-for-england/2024/specification/9781292448497-btec-hn-l4-l5-man-engin-england.pdf
  - Status: unit content under the 2024 numbers was not in the pages I could read; the 2017 text above is the content I saw
  - Quote: "Unit 5006: Further Mathematics 15 5"

My reading: Pearson's published unit content (2017) names matrices, determinants, inverse and Gaussian elimination, and the differential equations are single equations. It does not name eigenvalues, span, basis or planes. So for the Pearson route this whole course is beyond the syllabus, and is background for Further Mathematics-style thinking and for university-level engineering texts.

### 3.3 MCA engineer officer syllabuses
I read the MCA Second Engineer Mathematics and General Engineering Science II syllabuses in full, and only part of the Marine Electro-Technology syllabus (copied from the Matrices run). In what I read, none names matrices, vectors, eigenvalues or lines and planes.

- **MCA Second Engineer Mathematics 2.1: linear simultaneous equations of three unknowns (the only linear-algebra line)**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "Solves linear simultaneous equations of three unknowns"

- **The same syllabus: graphs of two simultaneous equations intersect (the picture of lines meeting)**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "States that two simultaneous equations plotted as graphs on the same axis have solutions where the graphs intersect"

- **MCA Marine Electro-Technology 2.1: Kirchhoff's laws by simultaneous equations, two unknowns only**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Solves problems using Kirchhoffs laws by application of simultaneous equations (two unknowns only"

- **MCA General Engineering Science II: electro-technology and naval architecture (centre of gravity, buoyancy, metacentre)**
  - Source: General Engineering Science II Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-ii-written-examination-syllabuses
  - Quote: "Define Centre of Gravity, Centre of Buoyancy and Metacentre"

- **MCA says the General Engineering Science syllabuses outline core engineering and mathematics knowledge for management-level certificates**
  - Source: General Engineering Science Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses
  - Quote: "outlines the core engineering and mathematics knowledge required for restricted, management level Certificates of Competency (STCW III/2 and III/3"

My reading: nothing in the MCA lines I read uses matrices or eigenvalues, so the course is not for an exam. I did not search for a Royal Navy qualification document in this run, and the Matrices run's search found none naming matrices, so a Navy or Level 3 line naming eigenvalues, span or planes is **UNCONFIRMED** (the sources here are the civil MCA and the HN syllabuses). The honest framing for Dan: foundations that see him through new topics (vibration, three-phase analysis, control) rather than something his next exam asks for.

---

## 4. The scope to cover, and what research says about each part

### 4.1 Span, linear independence, basis and coordinates (deferred from Matrices and Vectors)

- **3Blue1Brown: basis vectors are what the coordinates scale; another pair gives another coordinate system**
  - Source: Linear combinations, span, and basis vectors | 3Blue1Brown. https://www.3blue1brown.com/lessons/span
  - Quote: "Together they are called the "basis" of the coordinate system. What this means is that when you think about coordinates as scalars, the basis vectors are what those scalars actually scale"

- **3Blue1Brown: span is all the vectors you can reach with scaled sums; lined-up pairs span only a line**
  - Source: Linear combinations, span, and basis vectors | 3Blue1Brown. https://www.3blue1brown.com/lessons/span
  - Quote: "The set of all possible vectors you can reach with linear combinations of a given pair of vectors is called the "span" of those two vectors. Restating what we just saw in this lingo, the span of most pairs of 2D vectors is all vectors in 2D space, but when they line up, their span is all vectors whose tip sit on a certain line"

- **3Blue1Brown: in 3-D, a third vector inside the span of the first two adds nothing**
  - Source: Linear combinations, span, and basis vectors | 3Blue1Brown. https://www.3blue1brown.com/lessons/span
  - Quote: "If your third vector happens to be sitting on the span of the first two, then the span doesn't change, you're sort of trapped on that same flat sheet. In other words, adding a scaled version of the third vector to linear combinations of the first two doesn't give you access to any new vectors"

- **3Blue1Brown: any way to describe a vector numerically depends on the basis**
  - Source: Linear combinations, span, and basis vectors | 3Blue1Brown. https://www.3blue1brown.com/lessons/span
  - Quote: "any way to describe vectors numerically depends on your choice of basis vectors"

- **3Blue1Brown: the technical definition of a basis (linearly independent vectors that span)**
  - Source: Linear combinations, span, and basis vectors | 3Blue1Brown. https://www.3blue1brown.com/lessons/span
  - Quote: "The technical definition for the "basis" of a space is a set of linearly independent vectors that span that space"

- **Khan: independence is its own short lesson sequence, with a span-and-independence example**
  - Source: Vectors and spaces | Linear algebra | Math | Khan Academy. https://www.khanacademy.org/math/linear-algebra/vectors-and-spaces
  - Quote: "Linear dependence and independence ### Learn * Introduction to linear independence (Opens a modal) * More on linear independence (Opens a modal) * Span and linear independence example (Opens a modal"

- **Brilliant's Matrices Level 1 already asks "Possible Combinations" and "Standard Basis Vectors"**
  - Source: Practice Matrices | Brilliant. https://brilliant.org/courses/matrices/
  - Quote: "Level 1 Basis Vectors Vectors from Combinations Possible Combinations Standard Basis Vectors Level Check"

### 4.2 Change of basis (the same arrow in two coordinate systems)

- **3Blue1Brown: Jennifer uses a different set of basis vectors**
  - Source: Change of basis | 3Blue1Brown. https://www.3blue1brown.com/lessons/change-of-basis
  - Quote: "What we'd like to talk about here is the idea of using a different set of basis vectors. For example, let's say you have a friend, Jennifer, who uses a different set of basis vectors"

- **3Blue1Brown: scaling and adding her basis vectors is matrix-vector multiplication, with her basis as the columns**
  - Source: Change of basis | 3Blue1Brown. https://www.3blue1brown.com/lessons/change-of-basis
  - Quote: "It's matrix-vector multiplication, with a matrix whose columns represent Jennifer's basis vectors"

- **3Blue1Brown: translate a transformation as (change of basis) inverse, then the matrix, then the change of basis**
  - Source: Change of basis | 3Blue1Brown. https://www.3blue1brown.com/lessons/change-of-basis
  - Quote: "Start with any vector, written in Jennifer's language. Rather than trying to follow what happens to it in terms of her language, first translate it into our language using the change of basis matrix, the one whose columns represent her basis vectors in our language"

- **3Blue1Brown: A inverse M A is a shift in perspective ("mathematical empathy")**
  - Source: Change of basis | 3Blue1Brown. https://www.3blue1brown.com/lessons/change-of-basis
  - Quote: "the full matrix product represents that same transformation as someone else sees it"

- **Khan: different coordinate systems are different ways of representing the same vector**
  - Source: Alternate basis transformation matrix example (video) | Khan Academy. https://www.khanacademy.org/math/linear-algebra/alternate-bases/change-of-basis/v/lin-alg-alternate-basis-tranformation-matrix-example
  - Quote: "Different coordinate systems are just different ways of representing the same vector"

### 4.3 Lines and planes in three dimensions through vectors (deferred from Vectors)

- **A line needs a point and a direction vector; a plane a point and a normal vector (UConn notes)**
  - Source: Lines and Planes. https://www2.math.uconn.edu/~stein/virtual/Notes/Calculus/vectors.pdf
  - Quote: "The key idea related to equations of lines is you always need to have a vector, say x 0 , from the origin to a point of the line and a vector, say v , parallel to the line"

- **The same notes: every plane has a normal vector**
  - Source: Lines and Planes. https://www2.math.uconn.edu/~stein/virtual/Notes/Calculus/vectors.pdf
  - Quote: "Every plane has a vector orthogonal (perpendicular) to it, called a normal vector and usually denoted by the letter n"

- **The vector form of a line is like motion at constant velocity (UT Austin)**
  - Source: Equations of a line. https://web.ma.utexas.edu/users/m408m/Display12-5-2.shtml
  - Quote: "You can also think of the vector form as describing motion with constant velocity"

- **Two planes not parallel meet in a line (CMU notes)**
  - Source: 21-256: Lines and planes. https://www.math.cmu.edu/~cnewstea/teaching/old/teaching/21-256/lines-planes.pdf
  - Quote: "If two planes are not parallel then they intersect at a line"

- **Lamar: the vector equation of a plane, and a normal vector read off a x + b y + c z = d**
  - Source: Calculus III - Equations of Planes. https://tutorial.math.lamar.edu/classes/calciii/eqnsofplanes.aspx
  - Quote: "This is called the vector equation of the plane"

- **SQA Linear Algebra 2 outcome 1 support: planes from a normal, from two vectors on the plane, from three points**
  - Source: Higher National Unit Specification General information Linear Algebra 2 (SCQF level 8) Unit title: J5WF 35 Unit code: Unit purpose. https://www.sqa.org.uk/files/hn/J5WF35.pdf
  - Quote: "Determine the parametric and non-parametric equations of a plane using a given normal to the plane, using two vectors on the plane, and using three points on the plane"

My reading: Dan has i, j, k, the dot product (angle between two arrows, and "square on" = zero) and the cross product (a vector square to two others). A plane through a point square to a normal is the dot product equal to zero, and a plane from two directions is a span, so planes are where Vectors and span meet. The Matrices brief already showed each equation in three unknowns as a plane and the three-equation answer as the point where planes meet; this course gives those planes their own equations.

### 4.4 Subspaces, column space, null space, rank and what they say about solutions

- **MIT 18.06: the column space is all combinations of the columns; the nullspace is all solutions of Ax = 0**
  - Source: Lecture 10: The four fundamental subspaces. https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/62a9db9eeab190694d40afe4734068ca_MIT18_06SCF11_Ses1.10sum.pdf
  - Quote: "consists of all combinations of the columns of A and is a vector space in R m . Nullspace, N ( A ) This consists of all solutions x of the equation A x = 0 and lies in R n"

- **MIT 18.06: special solutions to Ax = 0 correspond to free variables; n - r of them**
  - Source: Lecture 10: The four fundamental subspaces. https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/62a9db9eeab190694d40afe4734068ca_MIT18_06SCF11_Ses1.10sum.pdf
  - Quote: "The special solutions to A x = 0 correspond to free variables"

- **MIT RES.18-010 (Strang): column rank = row rank = the number of independent columns = r**
  - Source: The Four Fundamental Subspaces and Least Squares. https://ocw.mit.edu/courses/res-18-010-a-2020-vision-of-linear-algebra-spring-2020/mitres_18_010_f24_slides01.pdf
  - Quote: "Column Rank = Row Rank = “Dimension” of C ( A ) and C ( A T ) Number of independent columns = r = Number of independent rows = Rank of A"

- **MIT RES.18-010: the nullspace holds all solutions of Ax = 0, with dimension n - r**
  - Source: The Four Fundamental Subspaces and Least Squares. https://ocw.mit.edu/courses/res-18-010-a-2020-vision-of-linear-algebra-spring-2020/mitres_18_010_f24_slides01.pdf
  - Quote: "The nullspace N ( A ) contains all solution vectors x to the m equations Ax = 0"

- **Khan lists nullity and rank as their own lessons**
  - Source: Vectors and spaces | Linear algebra | Math | Khan Academy. https://www.khanacademy.org/math/linear-algebra/vectors-and-spaces
  - Quote: "Dimension of the null space or nullity (Opens a modal) * Dimension of the column space or rank (Opens a modal"

### 4.5 Eigenvalues and eigenvectors: directions a matrix only stretches, from the characteristic equation

- **3Blue1Brown: eigenvectors stay on their own span, stretched by the eigenvalue**
  - Source: Eigenvectors and eigenvalues | 3Blue1Brown. https://www.3blue1brown.com/lessons/eigenvalues
  - Quote: "These special vectors are called the "eigenvectors" of the transformation, and each eigenvector has associated with it what's called an "eigenvalue", which is the factor by which it's stretched or squished during the transformation. In this example, vectors on the x \-axis are eigenvectors with eigenvalue 3 , while those on the diagonal line are eigenvectors with eigenvalue 2"

- **3Blue1Brown: a negative eigenvalue flips the vector but it stays on its line**
  - Source: Eigenvectors and eigenvalues | 3Blue1Brown. https://www.3blue1brown.com/lessons/eigenvalues
  - Quote: "but the important part is that it stays on the line that it spans out, without being rotated off of it"

- **3Blue1Brown: reading the columns shows where i and j land; eigenvectors show what the transformation does without the coordinate system**
  - Source: Eigenvectors and eigenvalues | 3Blue1Brown. https://www.3blue1brown.com/lessons/eigenvalues
  - Quote: "you could understand what it's doing by reading off the columns of this matrix as the landing spots for the basis vectors. But often a better way to get at the heart of what that transformation actually does, less dependent on your particular coordinate system, is to find the eigenvectors and eigenvalues"

- **HELM 22: for small n (2 or 3), eigenvalues need only a low-order polynomial equation**
  - Source: 22 22. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2022%20Eigenvalues%20and%20Eigenvectors.pdf
  - Quote: "If n is small (2 or 3), determining eigenvalues is a fairly straightforward process (requiring the solutiuon of a low order polynomial equation"

- **HELM 22: the characteristic equation is a quadratic for 2 by 2 and a cubic for 3 by 3**
  - Source: 22 22. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2022%20Eigenvalues%20and%20Eigenvectors.pdf
  - Quote: "The characteristic equation is generally a polynomial in λ , with degree being the same as the order of A (so if A is 2 × 2 the characteristic equation is a quadratic, if A is a 3 × 3 it is a cubic equation, and so on"

- **HELM 22: non-trivial eigenvectors exist when det(A - λI) = 0**
  - Source: 22 22. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2022%20Eigenvalues%20and%20Eigenvectors.pdf
  - Quote: "non-trivial solutions for X will exist if det ( A − λI ) = 0"

- **HELM 22: the zero vector is the trivial solution and is not wanted**
  - Source: 22 22. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2022%20Eigenvalues%20and%20Eigenvectors.pdf
  - Quote: "We will not be interested in these trivial solutions of the eigenvalue problem. Our main interest will be in the occurrence of non-trivial solutions for X"

- **HELM 22: sum of the eigenvalues = trace and product = determinant (a check)**
  - Source: 22 22. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2022%20Eigenvalues%20and%20Eigenvectors.pdf
  - Quote: "sum of eigenvalues = sum of diagonal terms of A (called the trace of A ) Formally, for an n × n matrix A : n ∑ i =1 λ i = trace( A ) (Repeated eigenvalues must be counted according to their multiplicity.) Thus if λ 1 = 4 , λ 2 = 4 , λ 3 = 1 then 3 ∑ i =1 λ i = 9). Property 2: Product of eigenvalues For any square matrix A : product of eigenvalues = determinant of A"

- **HELM 22: a matrix can have complex conjugate eigenvalues (example: λ² + 1 = 0 gives ± i)**
  - Source: 22 22. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2022%20Eigenvalues%20and%20Eigenvectors.pdf
  - Quote: "leading to λ ² + 1 = 0 giving eigenvalues ± i which are of course complex conjugates"

- **HELM 22: the eigenvalues of a diagonal matrix are its diagonal entries**
  - Source: 22 22. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2022%20Eigenvalues%20and%20Eigenvectors.pdf
  - Quote: "So the eigenvalues are simply the diagonal elements a and d"

- **LibreTexts (Margalit and Rabinoff): for standard matrices, draw a picture and find eigenvectors geometrically**
  - Source: 3.2: Eigenvalues and Eigenvectors Definitions - Mathematics LibreTexts. https://math.libretexts.org/Courses/Irvine_Valley_College/Math_26%3A_Introduction_to_Linear_Algebra/03%3A_Vector_Geometry/3.02%3A_Eigenvalues_and_Eigenvectors/3.2.01%3A_Eigenvalues_and_Eigenvectors_Definitions
  - Quote: "For matrices that arise as the standard matrix of a linear transformation, it is often best to draw a picture, then find the eigenvectors and eigenvalues geometrically by studying which vectors are"

- **LibreTexts: eigenvectors are nonzero by definition; eigenvalues may be zero**
  - Source: 3.2: Eigenvalues and Eigenvectors Definitions - Mathematics LibreTexts. https://math.libretexts.org/Courses/Irvine_Valley_College/Math_26%3A_Introduction_to_Linear_Algebra/03%3A_Vector_Geometry/3.02%3A_Eigenvalues_and_Eigenvectors/3.2.01%3A_Eigenvalues_and_Eigenvectors_Definitions
  - Quote: "Eigenvectors are by definition nonzero . Eigenvalues may be equal to zero"

My reading: Dan's Quadratics and Complex numbers courses give the roots of the characteristic equation: a 2 by 2 matrix gives a quadratic, so real and distinct roots, a repeated root, or a conjugate pair. A 3 by 3 gives a cubic, which is usually shown with one root found by testing a value. A stretch matrix has real eigenvalues. A quarter turn leaves no direction on its line, so it has no real eigenvector and its eigenvalues are the pair ± j (HELM's λ² + 1 = 0 above is a matrix of that kind). That connects the Matrices turn matrix to complex numbers.

### 4.6 Diagonalising and what it buys (powers of a matrix, repeated steps)

- **3Blue1Brown: with a diagonal matrix, applying it 100 times is the 100th power of each eigenvalue**
  - Source: Eigenvectors and eigenvalues | 3Blue1Brown. https://www.3blue1brown.com/lessons/eigenvalues
  - Quote: "Since all one of these matrices does is scale each basis vector by some eigenvalue, applying that matrix, say, 100 times will just correspond to scaling each basis vector by the 100th power of the corresponding eigenvalue"

- **3Blue1Brown: change to an eigenbasis, compute the power, convert back; a shear does not have enough eigenvectors**
  - Source: Eigenvectors and eigenvalues | 3Blue1Brown. https://www.3blue1brown.com/lessons/eigenvalues
  - Quote: "A set of basis vectors which are all also eigenvectors is called an "eigenbasis". For example, if you needed to compute the 100th power of this matrix, it would be much easier to change to an eigenbasis, compute the 100th power in that system, then convert back to the standard system. You can't do this with all transformations. A shear, for example, doesn't have enough eigenvectors to span all of space"

- **3Blue1Brown: the change of basis matrix (eigenvectors as columns) makes the matrix diagonal**
  - Source: Eigenvectors and eigenvalues | 3Blue1Brown. https://www.3blue1brown.com/lessons/eigenvalues
  - Quote: "The whole point of doing this with eigenvectors is that this new matrix is guaranteed to be diagonal, with the corresponding eigenvalues down the diagonal, since this represents working in a coordinate system where basis vectors just get scaled during the transformation"

- **HELM 22.2: diagonalisation means turning a matrix into an equivalent diagonal one, simpler to deal with**
  - Source: 22 22. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2022%20Eigenvalues%20and%20Eigenvectors.pdf
  - Quote: "Diagonalization means transforming a non-diagonal matrix into an equivalent matrix which is diagonal and hence is simpler to deal with"

- **HELM 22.2: P⁻¹AP = D, a similarity transformation**
  - Source: 22 22. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2022%20Eigenvalues%20and%20Eigenvectors.pdf
  - Quote: "The product P − ¹ AP is then a diagonal matrix D whose diagonal elements are the eigenval- ues of A . Thus if λ 1 , λ 2 , . . . λ n are the distinct eigenvalues of A with associated eigenvectors X (1) , X (2) , . . . , X ( n ) respectively, then ... (b) Since D is a diagonal matrix with eigenvalues λ 1 , λ 2 , . . . , λ n which are the same as those of A , then the matrices D and A are said to be similar"

- **HELM 22.3: you can always diagonalise a matrix with n distinct eigenvalues; repeated ones only if there are n independent eigenvectors**
  - Source: 22 22. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2022%20Eigenvalues%20and%20Eigenvectors.pdf
  - Quote: "An n × n matrix with repeated eigenvalues can be diagonalized provided we can obtain n linearly independent eigenvectors"

- **HELM 22.3: a sheared-looking matrix [1 0; -4 1] has one eigenvalue repeated and cannot be diagonalised (the crucial question)**
  - Source: 22 22. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2022%20Eigenvalues%20and%20Eigenvectors.pdf
  - Quote: "The crucial question is whether we can form a non-singular modal matrix P with the eigenvectors of A as its columns"

- **MIT 18.06: A to the k tends to 0 only if every |λ| < 1 (repeated steps)**
  - Source: ocw.mit.edu. https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/d05795355f5cbe35356a4a1b39658336_MIT18_06SCF11_Ses2.9sum.pdf
  - Quote: "A k → 0 as k → ∞ if and only if all | λ i | < 1"

- **MIT 18.06 (Strang): Λ is the diagonal matrix of eigenvalues; A^k = SΛ^kS⁻¹ for difference equations**
  - Source: Diagonalization and Powers of A | Linear Algebra | Mathematics | MIT OpenCourseWare. https://ocw.mit.edu/courses/18-06sc-linear-algebra-fall-2011/pages/least-squares-determinants-and-eigenvalues/diagonalization-and-powers-of-a/
  - Quote: "This allows us to easily compute powers of A which in turn allows us to solve difference equations u k+1 = Au k"

- **Strang: a Markov matrix has a steady state with eigenvalue 1 and a decaying mode with eigenvalue 0.5**
  - Source: D:/Work_Projects/_Strang/ila6/_ila6.dvi. https://math.mit.edu/~gs/linearalgebra/ila6/ila6_6_1.pdf
  - Quote: "is a “steady state” that doesn’t change (because it has λ1 = 1). The eigenvector x2 is a “decaying mode” that virtually disappears"

- **SQA Linear Algebra 2 support notes: use the diagonalised system to solve problems of A^n, where A is 3 by 3**
  - Source: Higher National Unit Specification General information Linear Algebra 2 (SCQF level 8) Unit title: J5WF 35 Unit code: Unit purpose. https://www.sqa.org.uk/files/hn/J5WF35.pdf
  - Quote: "Use the diagonalised system to solve problems of A n , where A is a 3 x 3 matrix"

### 4.7 Systems x' = A x with eigenvalues (two tanks, two coupled circuits), linking to Differential equations

- **HELM 22.2: systems of first order ODEs arise in control theory and analysis of circuits; recast as X-dot = AX**
  - Source: 22 22. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2022%20Eigenvalues%20and%20Eigenvectors.pdf
  - Quote: "Systems of first order ordinary differential equations arise in many areas of mathematics and engi- neering, for example in control theory and in the analysis of electrical circuits"

- **HELM 22.2: diagonalising turns X-dot = AX into Y-dot = DY, which is easily solved**
  - Source: 22 22. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2022%20Eigenvalues%20and%20Eigenvectors.pdf
  - Quote: "The main step will be to use the modal matrix of A to diagonalise the system of differential equations. This process will transform ˙ X = AX into the form ˙ Y = DY where D is a diagonal matrix . We shall find that this new diagonal system of differential equations can be easily solved"

- **HELM 22.2: the decoupled equations each involve one unknown, with solutions Ce^(λt)**
  - Source: 22 22. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2022%20Eigenvalues%20and%20Eigenvectors.pdf
  - Quote: "These equations are decoupled . The first equation only involves the unknown function r ( t ) and has solution r ( t ) = Ce λ ¹ t . The second equation only involves the unknown function s ( t ) and has solution s ( t ) = Ke"

- **Lamar: it is time to solve systems of differential equations (real eigenvalues first)**
  - Source: Differential Equations - Real Eigenvalues. https://tutorial.math.lamar.edu/classes/de/realeigenvalues.aspx
  - Quote: "It’s now time to start solving systems of differential equations"

- **Lamar: for real, simple eigenvalues the eigenvectors are linearly independent**
  - Source: Differential Equations - Real Eigenvalues. https://tutorial.math.lamar.edu/classes/de/realeigenvalues.aspx
  - Quote: "In other words, they will be real, simple eigenvalues. Recall as well that the eigenvectors for simple eigenvalues are linearly independent"

- **MIT ES.1803: two tanks exchanging salt solution, a matrix method with real or complex eigenvalues**
  - Source: ES.1803 S24: Reading: Topic 17: Matrix Methods for Solving Systems of DEs. https://ocw.mit.edu/courses/es-1803-differential-equations-spring-2024/mites_1803_s24_topic17.pdf
  - Quote: "Suppose we have two tanks containing a salt solution. Initially the volume of water in the tanks is 𝑉1 and 𝑉2 respectively. Pure water flows into Tank 1 from the outside at"

- **MIT ES.1803 goals: solve constant coefficient systems using eigenvalues and eigenvectors, real or complex**
  - Source: ES.1803 S24: Reading: Topic 17: Matrix Methods for Solving Systems of DEs. https://ocw.mit.edu/courses/es-1803-differential-equations-spring-2024/mites_1803_s24_topic17.pdf
  - Quote: "Be able to solve constant coefficient linear systems using eigenvalues and eigenvectors. Do this when there are real or complex eigenvalues"

- **Herman (LibreTexts): the two-tank mixing problem is a linear, homogeneous, constant coefficient system of two first-order equations**
  - Source: 6.2.3: Mixture Problems - Mathematics LibreTexts. https://math.libretexts.org/Bookshelves/Differential_Equations/A_First_Course_in_Differential_Equations_for_Scientists_and_Engineers_(Herman)/06%3A_Linear_Systems/6.02%3A_Applications/6.2.03%3A_Mixture_Problems
  - Quote: "This is a linear, homogenous constant coefficient system of two first order equations, which we know how to solve"

- **Herman: because the eigenvalues are real and distinct, the general solution is easily written down**
  - Source: 6.2.3: Mixture Problems - Mathematics LibreTexts. https://math.libretexts.org/Bookshelves/Differential_Equations/A_First_Course_in_Differential_Equations_for_Scientists_and_Engineers_(Herman)/06%3A_Linear_Systems/6.02%3A_Applications/6.2.03%3A_Mixture_Problems
  - Quote: "Since the eigenvalues are real and distinct, the general solution is easily written down"

- **Slavik: brine tanks joined by pipes give x' = Ax solved by the eigenvalues and eigenvectors of A**
  - Source: Mixing Problems with Many Tanks. https://www.karlin.mff.cuni.cz/~slavik/papers/mixing-problems.pdf
  - Quote: "The problem then leads to a linear system of differential equations for the unknown concentrations, which is solved by calculating the eigenvalues and eigen- vectors of the corresponding matrix"

- **Lamar: with complex eigenvalues we have the same problem as second-order equations (the DE brief's ringing case)**
  - Source: Differential Equations - Complex Eigenvalues. https://tutorial.math.lamar.edu/classes/de/complexeigenvalues.aspx
  - Quote: "With complex eigenvalues we are going to have the same problem that we had back when we were looking at second order differential equations"

My reading, coupled circuits: I found no clean source for two coupled circuits solved as x' = Ax in a page that would give the numbers. The search returned patents and research papers on coupled resonators (patents and an accelerator-cavity paper), none of which gives a worked circuit that a reader could follow. So the "two coupled circuits" example is **UNCONFIRMED** as a sourced worked example; the two-tank examples above (Herman, MIT ES.1803, Slavik) are sourced.

### 4.8 One engineering use worked through: vibration modes of two masses on springs, or the three-phase transforms

- **HELM 22 exercise: two masses vibrating on coupled springs, written as a matrix equation and decoupled**
  - Source: 22 22. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2022%20Eigenvalues%20and%20Eigenvectors.pdf
  - Quote: "Matrix methods can be used to solve systems of second order differential equations such as might arise with coupled electrical or mechanical systems. For example the motion of two masses m 1 and m 2 vibrating on coupled springs, neglecting damping and spring masses"

- **HELM 22: the decoupled second-order equations are simple harmonic motion, with cosine and sine terms**
  - Source: 22 22. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2022%20Eigenvalues%20and%20Eigenvectors.pdf
  - Quote: "The two decoupled equations are of the form of the differential equation governing simple harmonic motion"

- **MIT 8.03: the simple solutions are called normal modes, found by putting the frequencies back into the eigenvalue equation**
  - Source: MIT 8.03SC Fall 2016 Textbook Chapter 3. https://ocw.mit.edu/courses/8-03sc-physics-iii-vibrations-and-waves-fall-2016/eaf7cfc65a8415677214ecea99c10457_MIT8_03SCF16_Text_Ch3.pdf
  - Quote: "These simple solutions are called “normal modes.” The displacements for the most general motion can be written as sums of the simple solutions. To find the corresponding normal modes, we substitute these frequencies back into the eigenvalue equation"

- **MIT RES.8-009: for two equal masses on three equal springs, the normal modes are the eigenvectors of the matrix**
  - Source: RES.8-009 (Summer 2017), Lecture 6: Coupled Oscillations. https://ocw.mit.edu/courses/res-8-009-introduction-to-oscillations-and-waves-summer-2017/mitres_8_009su17_lec6.pdf
  - Quote: "Normal Modes and Eigenvectors: We should note that the normal modes we previously found (Eq.(11)) are the eigenvectors of the matrix"

- **MIT RES.8-009: eigenvalues and eigenvectors of the interaction matrix are related to normal mode frequencies and modes**
  - Source: RES.8-009 (Summer 2017), Lecture 6: Coupled Oscillations. https://ocw.mit.edu/courses/res-8-009-introduction-to-oscillations-and-waves-summer-2017/mitres_8_009su17_lec6.pdf
  - Quote: "The eigenvalues and eigenvectors of the interaction matrix (i.e., whatever matrix that takes the place of ˆ Ω in this problem) are related to the normal mode frequencies and normal modes"

- **Caltech Ph12: two blocks, three springs; the equation of motion reduces to an eigen equation; modes (1,1) and (1,-1)**
  - Source: 3 Coupled Harmonic Oscillators, Normal Modes. http://www.xiechen.caltech.edu/documents/30656/Ph12-lecture1014.pdf
  - Quote: "In the last lecture, we established the equation of motion for this system of two mass blocks coupled by three springs. The EOM reduced to an eigen equation of the form"

- **Caltech: in mode 1 the masses oscillate together with the same phase**
  - Source: 3 Coupled Harmonic Oscillators, Normal Modes. http://www.xiechen.caltech.edu/documents/30656/Ph12-lecture1014.pdf
  - Quote: "That is, the two masses oscillate in the same way: the same frequency, the same amplitude, and the same phase"

- **Caltech: in mode 2 the masses move in opposite ways (phase difference of π), and in mode 1 the middle spring is not stretched at all**
  - Source: 3 Coupled Harmonic Oscillators, Normal Modes. http://www.xiechen.caltech.edu/documents/30656/Ph12-lecture1014.pdf
  - Quote: "That is, the two masses oscillate in the opposite way: the same frequency, the same amplitude, and with a phase difference of π . Their motion is the same and the middle spring is not stretched or compressed at all"

- **SFU: for two equal masses on three identical springs, a1 = (1,1) has eigenvalue k/m and a2 = (-1,1) has eigenvalue 3k/m**
  - Source: 15 Matrix approach to normal modes.. https://www.sfu.ca/phys/255/063/lec/P255OutlineL15.pdf
  - Quote: "We say here that a 1 = 1 1 is an eigenvector associated with eigenvalue k/m , and a 2 = − 1 1 is an eigenvector associated with eigenvalue 3 k/m"

- **Symmetrical components: a transformation of three voltages and currents into a second set (MIT 6.061)**
  - Source: 6.061 Class Notes, Chapter 4: Introduction To Symmetrical Components. https://ocw.mit.edu/courses/6-061-introduction-to-electric-power-systems-spring-2011/7603169f5d8514b769a46fa900b79a57_MIT6_061S11_ch4.pdf
  - Quote: "The basis for this analytical technique is a transformation of the three voltages and three currents into a second set of voltages and currents"

- **MIT 6.061: the three component variables are positive, negative and zero sequence**
  - Source: 6.061 Class Notes, Chapter 4: Introduction To Symmetrical Components. https://ocw.mit.edu/courses/6-061-introduction-to-electric-power-systems-spring-2011/7603169f5d8514b769a46fa900b79a57_MIT6_061S11_ch4.pdf
  - Quote: "The three component variables V 1, V 2, V 0 are called, respectively, positive sequence, negative sequence and zero sequence"

- **MDPI "100 Years of Symmetrical Components": the Fortescue transformation diagonalises a matrix with circular symmetry**
  - Source: 100 Years of Symmetrical Components | MDPI. https://www.mdpi.com/1996-1073/12/3/450
  - Quote: "The fundamental property that has ensured the great success of the Fortescue transformation in electrical engineering studies is the diagonalisation of a matrix with circular symmetry"

- **MathWorks: the symmetrical-components transform separates an unbalanced three-phase signal into three balanced sets of phasors**
  - Source: Symmetrical-Components Transform - Implement abc to +-0 transform - Simulink. https://se.mathworks.com/help/sps/ref/symmetricalcomponentstransform.html
  - Quote: "The symmetrical-components transform separates an unbalanced three-phase signal given in phasor quantities into three balanced sets of phasors"

- **MIT geometric interpretation: Clarke's matrix, Park's matrix from a rotation matrix; Clarke's 0 component is the zero sequence**
  - Source: dspace.mit.edu. https://dspace.mit.edu/server/api/core/bitstreams/aa51674e-7d26-40c2-a942-9b1d6297146c/content
  - Quote: "Clarke’s 0 component is equivalent to the zero sequence as defined by symmetrical components"

- **MathWorks Clarke: converts the three components to two orthogonal ones in a stationary frame, plus a zero**
  - Source: Clarke And Park Transforms. https://www.mathworks.com/discovery/clarke-and-park-transforms.html
  - Quote: "The Clarke transform converts the time domain components of a three-phase system (in abc frame) to two components in an orthogonal stationary frame"

My reading, which engineering use: the **two masses on springs** is the best supported, with four university pages and HELM 22's own exercise (MIT 8.03, MIT RES.8-009, Caltech, SFU) agreeing on the picture: for equal masses and springs the eigenvectors are (1,1), where the middle spring is not stretched, and (1,-1), with eigenvalues k/m and 3k/m (SFU), so the frequencies are √(k/m) and √(3k/m) (my arithmetic from SFU's eigenvalues). It needs only Differential equations lesson 5 (a spring) and the eigenvalue idea. The three-phase transforms are sourced as well (MIT 6.061, MDPI, MathWorks), but the clean "diagonalise a circulant matrix" fact needs complex phasors and the operator a = 1∠120°, and the Clarke form involves unequal-looking √3/2 entries; I would use them as a one-screen "same trick in your trade" use, not the worked one. The MDPI page and the MIT paper do state that the Fortescue transformation diagonalises a matrix with circular symmetry and that Clarke's 0 term is the zero sequence, and both are in the quotes above.

### 4.9 Deferred, and left out

- **Brilliant's first Linear Algebra lesson set is abstract (waves as vectors, vector spaces); that is the part to leave out**
  - Source: Practice Linear Algebra | Brilliant. https://brilliant.org/courses/lin-alg
  - Quote: "Level 1 What is a Vector? Waves as Abstract Vectors Why Vector Spaces"

- **Dorier: students' trouble with vector spaces is understanding what formalising is for, in the geometry and equations it came from**
  - Source: Misconceptions and resulting errors displayed by in service teachers in the learning of linear independence. https://files.eric.ed.gov/fulltext/EJ1366218.pdf
  - Quote: "Students’ difficulty with the formal aspect of the theory of vectors spaces are not just a general problem with formalism, but mostly a difficulty of understanding the specific use of formalization in the theory of vector and the interpretation of the formal concepts in relation with more intuitive contexts like geometry and systems of linear equations in on which they historically emerged"

My reading: abstract vector spaces (axioms, function spaces, waves as vectors) are left out on Dorier's evidence that the formal theory is the hard part and works best tied to the geometry and the equations; only subspaces through the origin (planes and lines, column space, null space) are kept. Fields, gradient, divergence and curl go to Vector calculus; abstract groups go to Group theory; neither course's ground is needed here.

---

## 5. Prerequisites: what this topic leans on

- **SQA Linear Algebra 2 expects matrices, complex numbers and linear systems**
  - Source: Higher National Unit Specification General information Linear Algebra 2 (SCQF level 8) Unit title: J5WF 35 Unit code: Unit purpose. https://www.sqa.org.uk/files/hn/J5WF35.pdf
  - Quote: "it would be advantageous if learners had a good knowledge and understanding of matrices, complex numbers and linear systems, together with sound calculus skills"

- **HELM 22 assumes basic matrix algebra and an outline of determinants**
  - Source: About the HELM Project. https://nucinkis-lab.cc.ic.ac.uk/HELM/HELM_Workbooks_46-50/WB50-all.pdf
  - Quote: "This Workbook assumes a knowledge of basic matrix algebra and an outline knowledge of determi- nants"

- **Brilliant's Linear Algebra assumes calculus and linear equations**
  - Source: Practice Linear Algebra | Brilliant. https://brilliant.org/courses/lin-alg
  - Quote: "A basic understanding of calculus and linear equations is necessary"

**What Dan has, from the built briefs** (my reading of `build/maths/*/brief.md`):
- **Vectors:** arrows with components and i, j, k; scaling; adding nose to tail; the dot product (angle, and "square on"); the cross product (size and direction; the 45 N m spanner); vectors and phasors (lesson 7). Its brief sent span, independence, bases other than i, j, k and lines and planes to this course.
- **Matrices:** a matrix as a grid and as a move (columns are where i and j land); the product as one move after another; the determinant as an area scale factor, and 0 as flattening; the inverse as playing the move back; the 3 by 3 determinant and cross product formula; elimination on three equations as three planes meeting. Its brief sent rank and null space, row reduction as a theory, eigenvalues, diagonalising, orthogonal matrices and systems of differential equations to this course. It also sent the 3 by 3 inverse by hand, "if your syllabus asks for it".
- **Differential equations:** the rate rule and slope field, decay, steady state plus a dying transient, Euler steps, the spring and the circuit as one equation, overdamped/critical/ringing from the roots, resonance. Its brief sent "eigenvalues and eigenvectors for those systems, the matrix exponential and the phase plane" here, with the two tanks, the two-loop circuit and the submarine dive model.
- **Quadratics and polynomials / Complex numbers:** the quadratic formula and discriminant, factorising; j and complex roots, conjugates, times j as a quarter turn. These solve the characteristic equation of a 2 by 2 matrix; a cubic from a 3 by 3 needs a trial root and then the quadratic.
- **Linear systems, Functions, Trigonometry, Straight-line graphs:** two lines meeting, parallel or the same; stack, scale and add; f(g(x)) and undoing; the turn matrix from cos and sin; the line y = mx + c.
- **Calculus fundamentals:** the derivative as a rate, e^(kt) and its derivative, which is why e^(λt) solves x' = λx.
- **AC circuits and Motors:** three phases 120° apart, phasors, the rotating field, as the places the three-phase transforms show up.
- **Geometry fundamentals / The coordinate plane:** area, volume of a box, the grid.

**Not taught again:** components, i/j/k, adding and scaling vectors, dot and cross products, a matrix as a move, products, the 2 by 2 and 3 by 3 determinant, the 2 by 2 inverse, elimination on three equations, the quadratic formula, complex roots, e^(kt), a spring and a circuit as one equation, Kirchhoff's laws. Each is reminded in one line where used.

**Taught inline, because no built course holds them:**
- **Span and independence as pictures:** a pair of arrows reaches the whole plane or only a line; a third arrow in a plane's span adds nothing. (3Blue1Brown, section 4.1.)
- **A basis other than i, j:** coordinates "with respect to" a basis, and the change of basis matrix with the basis arrows as columns. (3Blue1Brown, Khan, section 4.2.)
- **The equation of a line and of a plane** in 3-D: point plus direction; point plus normal. (SQA LA2, UConn, section 4.3.) The plane's normal uses the cross product Dan has.
- **The word "subspace"** only as "a line or plane through the origin", and **the column space and null space** as two such sets for a matrix, with rank and nullity as their sizes. (MIT 18.06, section 4.4.)
- **Eigenvalue, eigenvector, characteristic equation, eigenspace** (section 4.5); **diagonal matrix, modal matrix P, P⁻¹AP = D, and A^n** (section 4.6).
- **Writing coupled equations as x' = A x** (HELM 22.2, section 4.7); **normal mode** as the word for an eigenvector of a vibrating system (section 4.8).

**Left for later courses (Dan's shelf):** Vector calculus (fields, gradient, divergence, curl, and Laplace-type equations); Group theory. Also left out here: orthogonal complements, projections, Gram-Schmidt, least squares, SVD, Jordan form, tensors, the matrix exponential (named at most), Laplace transforms.

---

## 6. Misconceptions and learning science for each skill

**Coverage of the sources the brief asked for.** Research papers: found for linear independence, eigenvectors and the Ax = b readings (below). Examiner reports: Pearson Edexcel and Cambridge International Further Maths reports on eigenvalues were reachable; AQA and OCR examiner reports on eigenvalues were not (**UNCONFIRMED**), and no NCTM source was reached. Bitesize's "named mistakes": Bitesize has no eigenvalue or span page that I found, so there are none to quote (**UNCONFIRMED**).

### 6.1 Span and linear independence

- **In-service teachers: the study found procedural, conceptual and foundational errors; most were misreadings of solutions to the system of equations**
  - Source: Misconceptions and resulting errors displayed by in service teachers in the learning of linear independence. https://files.eric.ed.gov/fulltext/EJ1366218.pdf
  - Quote: "12 students were able to carry out the correct row operations but did not provide the correct deduction"

- **Some wrote "the system is inconsistent therefore it is linearly independent"**
  - Source: Misconceptions and resulting errors displayed by in service teachers in the learning of linear independence. https://files.eric.ed.gov/fulltext/EJ1366218.pdf
  - Quote: "the system is inconsistent therefore it is linearly independent"

- **Many failed to interpret the solution of the system as linear dependence or independence**
  - Source: Misconceptions and resulting errors displayed by in service teachers in the learning of linear independence. https://files.eric.ed.gov/fulltext/EJ1366218.pdf
  - Quote: "This is a result of a failure to interpret the solution of systems of equations and their relationship to linear independence/dependence"

- **The same study: most technical or foundational errors came from misreading solutions**
  - Source: Misconceptions and resulting errors displayed by in service teachers in the learning of linear independence. https://files.eric.ed.gov/fulltext/EJ1366218.pdf
  - Quote: "Many of the technical or foundational errors were because of misinterpretations of solutions to systems of linear equations"

- **Magic Carpet Ride: an inquiry-oriented sequence that has students reinvent span and independence from an imaginary travel scenario**
  - Source: ERIC - EJ988264 - An Inquiry-Oriented Approach to Span and Linear Independence: The Case of the Magic Carpet Ride Sequence, PRIMUS, 2012. https://eric.ed.gov/?id=EJ988264
  - Quote: "Referred to as the Magic Carpet Ride sequence, the problems begin with an imaginary scenario that allows students to build rich imagery and formal definitions"

- **Wawro, Sweeney and Rabin: students think of vectors as arrows at the origin, points, or floating segments**
  - Source: ’ Subspace in linear algebra: investigating students concept images and interactions with the formal definition. https://sci.sdsu.edu/crmse/msed/papers/wawro_sweeney_rabin_2011.pdf
  - Quote: "students may think of vectors as arrows anchored at the origin, as points in a coordinate system, or as floating directed line segments"

My reading, design: show span and independence as pictures first (the Magic Carpet Ride sequence starts from a travel story), then name the algebra; when a row of 0 = 0 or a free variable appears, ask the student to say what it means for the arrows. The best-evidenced slip is doing the row work correctly and then misreading it, the same slip the Matrices brief found for elimination.

### 6.2 Basis and change of basis

- **Inquiry-Oriented Linear Algebra (IOLA) has a unit on change of basis, diagonalisation and eigentheory built from the earlier ones**
  - Source: Inquiry Oriented Linear Algebra - IOLA. https://iola.math.vt.edu/
  - Quote: "Unit 6: Change of Basis, Diagonalization, and Eigentheory"

Change of basis misconceptions: I found no examiner report or paper that names a specific change-of-basis error in the pages I could read (the IOLA unit title above is the only change-of-basis item, and it states no finding). That is **UNCONFIRMED**. My reading: the likely slip is multiplying by P when P⁻¹ is needed, or reading the columns of P as the new coordinates rather than the old basis written in the standard one; 3Blue1Brown's Jennifer example (the matrix with her basis as columns takes her coordinates to ours) is the cleanest way to prevent it.

### 6.3 Rank, null space and what they say about solutions

- **Students experience a disconnect reinterpreting solutions in relation to the original system (the evidence for pairing rank with the planes picture)**
  - Source: Misconceptions and resulting errors displayed by in service teachers in the learning of linear independence. https://files.eric.ed.gov/fulltext/EJ1366218.pdf
  - Quote: "Many were unable to coordinate the results that they obtained with the original vector equation"

- **Dorier: the "obstacle of formalism" applies to vector-space learning**
  - Source: Misconceptions and resulting errors displayed by in service teachers in the learning of linear independence. https://files.eric.ed.gov/fulltext/EJ1366218.pdf
  - Status: quoted from the 2022 paper; Dorier's own text was not reached
  - Quote: "Dorier (2000) and Dorier et al. (2000) outlined that linear algebra is grounded in the theory of vector spaces, in which this study is centered on, and acknowledged that students encounter difficulties which are a result of what they called “obstacle of formalism"

- **Linear Algebra Education: An International Perspective (2025): research shows conceptual understanding is essential**
  - Source: Full article: Linear Algebra Education: An International Perspective. https://www.tandfonline.com/doi/full/10.1080/10511970.2025.2603935
  - Quote: "Much of the research shows that prioritizing conceptual understanding in linear algebra instruction is essential"

- **Larson and Zandieh: Ax = b has three readings (combination, system, transformation) and x is conceived differently in each**
  - Source: ERIC - EJ1018729 - Three Interpretations of the Matrix Equation Ax = b, For the Learning of Mathematics, 2013. https://eric.ed.gov/?id=EJ1018729
  - Quote: "linear combination interpretations, systems interpretations, and transformation interpretations"

- **The same paper: the framework makes sense of student thinking from interviews**
  - Source: ERIC - EJ1018729 - Three Interpretations of the Matrix Equation Ax = b, For the Learning of Mathematics, 2013. https://eric.ed.gov/?id=EJ1018729
  - Quote: "highlighting the very different ways that the vector x is conceived across interpretations"

### 6.4 Eigenvalues and eigenvectors

- **Stewart and Thomas: the course book had no diagram, so the embodied side was ignored**
  - Source: Student Thinking about Eigenvalues and Eigenvectors: Formal, Symbolic and Embodied Notions. https://www2.merga.net.au/publications/counter.php?id=336&pub=pub_conf
  - Quote: "The section on eigenvectors and eigenvalues in the Maths 208 coursebook does not contain a single diagram, and thus totally ignores the embodied aspects of learning this topic"

- **Students "could not reason on the relationship between a diagram and eigenvectors, to their detriment"**
  - Source: Student Thinking about Eigenvalues and Eigenvectors: Formal, Symbolic and Embodied Notions. https://www2.merga.net.au/publications/counter.php?id=336&pub=pub_conf
  - Quote: "no geometric view of eigenvectors or eigenvalues, and could not reason on the relationship between a diagram and eigenvectors, to their detriment"

- **Some said eigenvectors of a matrix must be linearly independent ("there is a linear relationship between them")**
  - Source: Student Thinking about Eigenvalues and Eigenvectors: Formal, Symbolic and Embodied Notions. https://www2.merga.net.au/publications/counter.php?id=336&pub=pub_conf
  - Quote: "confusion again showed through with 7 students commenting on eigenvectors having to be independent “No, because there is a linear relationship between them.” (K) and “No, eigenvectors of a matrix should be linearly independent"

- **Moving from Ax = λx to (A - λI)x = 0 is not straightforward for many students**
  - Source: Student Thinking about Eigenvalues and Eigenvectors: Formal, Symbolic and Embodied Notions. https://www2.merga.net.au/publications/counter.php?id=336&pub=pub_conf
  - Quote: "Secondly, the progression, working within the algebraic symbolic world, from Ax = x to ( A I ) x = 0 is not perceived as straightforward by many students"

- **Once the algebra starts, the picture is hidden by the strength of the matrix procedures**
  - Source: Student Thinking about Eigenvalues and Eigenvectors: Formal, Symbolic and Embodied Notions. https://www2.merga.net.au/publications/counter.php?id=336&pub=pub_conf
  - Quote: "In this way the strong visual, or embodied metaphorical, image of eigenvectors is obscured by the strength of matrix procedures"

- **Thomas and Stewart 2011 (journal version): fundamental problems with students' understanding of the definition of eigenvectors**
  - Source: Eigenvalues and eigenvectors: embodied, symbolic and formal thinking | Mathematics Education Research Journal | Springer Nature Link. https://link.springer.com/article/10.1007/s13394-011-0016-1
  - Quote: "We also identify some fundamental problems with student understanding of the definition of eigenvectors that lead to implementation problems, and some of the concepts underlying such difficulties"

- **Salgado and Trigueros: little research on how eigenvalues can be learned; modelling helps**
  - Source: Teaching eigenvalues and eigenvectors using models and APOS Theory - ScienceDirect. https://www.sciencedirect.com/science/article/abs/pii/S0732312315000462
  - Quote: "There is little research in how the concepts of eigenvalues, eigenvectors, and eigenspaces can be learned and what are the main difficulties encountered by students"

- **Wawro/IOLA: students reinvent eigenvalues from stretch factors and stretch directions**
  - Source: An Inquiry-Oriented Task Sequencefor Eigentheory and Diagonalization in Linear Algebra. https://indrum2016.sciencesconf.org/84416/INDRUM2016_Wawro.pdf
  - Quote: "stretch factors and stretch directions. This is leveraged towards defining eigenvalues and eigenvectors"

- **Same poster: students find the stretch factors before the term eigenvalue or characteristic equation is defined**
  - Source: An Inquiry-Oriented Task Sequencefor Eigentheory and Diagonalization in Linear Algebra. https://indrum2016.sciencesconf.org/84416/INDRUM2016_Wawro.pdf
  - Quote: "prior to defining eigenvector, eigenvalue, or characteristic equation, students find the “stretch factors"

- **Examiner report (Pearson Edexcel IAL M3, Jan 2024): failure to match up eigenvalues with their eigenvectors lost marks**
  - Source: Examiners’ Report Principal Examiner Feedback January 2024. https://qualifications.pearson.com/content/dam/pdf/International-Advanced-Level/Mathematics/2018/Exam-materials/wfm03-01-pef-20240307.pdf
  - Quote: "failure to match up these eigenvalues with their corresponding eigenvectors often resulted in a loss of marks"

- **Examiner report (Pearson IAL, Jan 2025): surprising how many did not see they already had one eigenvalue from part (a)**
  - Source: Examiners’ Report Principal Examiner Feedback January 2025. https://qualifications.pearson.com/content/dam/pdf/International-Advanced-Level/Mathematics/2018/Exam-materials/wfm03-01-pef-20250306.pdf
  - Quote: "it was surprising how many ### did not make the connection that they already had one eigenvalue from part (a"

- **Examiner report (Cambridge 9231, June 2018): few realised a multiple of an eigenvector is also an eigenvector; some forgot to raise λ to the power n in D**
  - Source: FURTHER MATHEMATICS. https://xtrapapers.co/papers/caie/as-and-a-level/mathematics-9231/2018-may-june/9231_s18_er.pdf/download
  - Status: SECONDARY: a past-paper mirror (xtrapapers.co) of a Cambridge International examiner report
  - Quote: "Few candidates realised that a multiple of e is also an eigenvector, rather more remembered that λ n is the eigenvalue of A n and that e was an eigenvector. Some errors were made with finding eigenvectors, and some candidates forgot to raise the values of λ to the power of n in the matrix D"

- **Examiner report (Pearson IAL Jan 2022): substituting into the characteristic equation in λ and k together was error-prone**
  - Source: Examiners’ Report Principal Examiner Feedback January 2022. https://qualifications.pearson.com/content/dam/pdf/International%20Advanced%20Level/Mathematics/2018/Exam-materials/WFM03_01_pef_20220303.pdf
  - Quote: "Substituting into the characteristic equation in terms of 𝜆𝜆 and k was more prone to error"

- **UNSW lecture notes: if you ever get v = 0 as an eigenvector you are wrong, go back (a teaching note for self-checking)**
  - Source: 8.dvi. https://web.maths.unsw.edu.au/~angell/1231alg/8.pdf
  - Quote: "When finding eigenvectors, there must always be an infinite number of solutions. In particular, if you ever find that you get the unique solution v = 0 for an eigenvector, then you know for sure that you are wrong – go back, find the error and fix it"

- **Dr Nicky Grant's A level guide (SECONDARY): candidates find a valid eigenvector but forget any non-zero multiple is also valid**
  - Source: Edexcel A-Level Further Maths (9FM0) Exam Guide | Core Pure. https://www.drnickygrant.com/blog/further-maths-edexcel-exam-guide.html
  - Status: SECONDARY
  - Quote: "For eigenvectors, candidates find a valid vector but forget that any non-zero scalar multiple is also valid"

- **ResearchForge (SECONDARY): having n eigenvalues is necessary but not sufficient for diagonalising**
  - Source: Linear Algebra: Common Mistakes and Misconceptions — ResearchForge. https://www.researchforge.app/articles/linear-algebra-mistakes-misconceptions
  - Status: SECONDARY
  - Quote: "A matrix is diagonalizable if and only if it has n linearly independent eigenvectors. Having n eigenvalues (with multiplicity) is necessary but not sufficient"

My reading, design: show the picture first (which arrows stay on their line, 3Blue1Brown, Wawro's stretch-directions sequence), find stretch factors by looking and testing before the characteristic equation is named, then show that "det = 0" is the algebra of "this matrix flattens something", which Dan has from the Matrices determinant lesson. Check an answer with trace = sum and det = product (HELM). Ask the student to predict whether a turn or a shear has any eigenvector before computing.

### 6.5 Systems x' = A x, and engineering uses

I found no research paper that names a student misconception for solving x' = Ax with eigenvalues in the pages I could read: **UNCONFIRMED**. The Thomas and Stewart / Salgado and Trigueros lines on eigenvector definitions cover the entry point. The step "X = PY gives X-dot = A P Y, so Y-dot = P⁻¹AP Y" is the one HELM spells out, and the decoupled equations are the single-equation work Dan has from Differential equations lessons 2 and 6. My reading: the likely slip is not seeing that each decoupled equation is the same "rate rule" as lesson 1 with its own λ.

### 6.6 Whole-course learning science

- **The same editorial: procedural proficiency is still needed, but making sense of core concepts gives deeper understanding of the subject's foundations**
  - Source: Full article: Linear Algebra Education: An International Perspective. https://www.tandfonline.com/doi/full/10.1080/10511970.2025.2603935
  - Quote: "Although procedural proficiency is still needed, focusing on making sense of core concepts equips students with a deeper understanding of the subject's foundational structures"

---

## 7. Where it is used for an electrician going into marine engineering

### 7.1 Vibration: propulsion shafting and ship structures

- **Torsional vibration of shafting is a most important problem for engineers; shafting is used in ships and naval vessels**
  - Source: Torsional vibration analysis of shaft with multi inertias. https://pmc.ncbi.nlm.nih.gov/articles/PMC9072706
  - Quote: "Shafting is widely used in ships, naval vessels, rail coaches, aircraft, spacecraft, and other machinery. Torsional vibration of shafting is always a most important problem for engineers"

- **Submarine propulsion system shafting is among the systems this model is meant to simulate**
  - Source: Torsional vibration analysis of shaft with multi inertias. https://pmc.ncbi.nlm.nih.gov/articles/PMC9072706
  - Quote: "The free torsional vibration of shafts, such as ship shafting, rail car shafting, submarine propulsion system shafting"

- **The primary problem is to obtain the natural frequencies and mode shapes**
  - Source: Torsional vibration analysis of shaft with multi inertias. https://pmc.ncbi.nlm.nih.gov/articles/PMC9072706
  - Quote: "the primary problem is to obtain the natural frequencies"

- **Marine propulsion MDPI 2025: a natural frequency near an excitation causes resonance, stress and cracking of shafts, couplings and gearboxes**
  - Source: Integration of Theoretical and Experimental Torsional Vibration Analysis in a Marine Propulsion System with Component Degradation | MDPI. https://www.mdpi.com/2076-3417/15/21/11423
  - Quote: "an excitation source may coincide with a natural frequency of the propulsion system, resulting in resonant vibration"

- **The same paper: the method gives natural frequencies, mode shapes and forced response directly**
  - Source: Integration of Theoretical and Experimental Torsional Vibration Analysis in a Marine Propulsion System with Component Degradation | MDPI. https://www.mdpi.com/2076-3417/15/21/11423
  - Quote: "allows direct calculation of natural frequencies, mode shapes, and forced vibration response under periodic excitations common in marine environments"

- **Practical Design Against Torsional Vibration: natural frequencies are the square roots of eigenvalues; each has a mode shape (eigenvector)**
  - Source: Practical Design Against Torsional Vibration. https://dyrobes.com/wp-content/uploads/2016/04/Practical-Design-Against-Torsional-Vibration_linked.pdf
  - Quote: "The natural frequencies are then obtained by merely taking the square roots of the eigenvalues"

- **Associated with each eigenvalue is an eigenvector which gives the mode shape of the shaft**
  - Source: Practical Design Against Torsional Vibration. https://dyrobes.com/wp-content/uploads/2016/04/Practical-Design-Against-Torsional-Vibration_linked.pdf
  - Quote: "Associated with each eigenvalue is an eigenvector, [9]. These vectors provide the mode shape corresponding to each natural frequency"

- **Aalto 2026: the natural frequencies are the square roots of the eigenvalues; the vibration mode shapes are the eigenvectors**
  - Source: Method for Adjusting Torsional Natural Frequencies of Powertrains with Novel Coupling Design. https://acris.aalto.fi/ws/portalfiles/portal/80624972/machines_10_00162.pdf
  - Quote: "The natural frequencies are square roots of the eigenvalues, and the vibration mode shapes are the eigenvectors"

- **MIT 2.004 problem set: ships had an "epidemic of shaft failures due to torsional vibration"; construct the eigenvalue problem for natural modes**
  - Source: 2.004 MODELING DYNAMICS AND CONTROL II Spring 2003. https://mitocw.ups.edu.ec/courses/mechanical-engineering/2-004-modeling-dynamics-and-control-ii-spring-2003/assignments/ps8_spring03.pdf
  - Quote: "ships, and there was an epidemic of shaft failures due to torsional vibration"

- **Bulk carrier ship structure: the eigenvalue problem gives natural frequencies and vibration modes of superstructure, engine room and rudder (COBEM 2007)**
  - Source: Microsoft Word - COBEM 1850.doc. https://abcm.org.br/app/webroot/anais/cobem/2007/pdf/COBEM2007-1850.pdf
  - Quote: "The solution of the eigenvalue problem allows the natural frequencies and respective vibration modes of those structures to be found"

### 7.2 Three-phase electrical systems: sequence components and Clarke/Park

- **MIT 6.061: a very common use of symmetrical components is calculating currents from unbalanced short circuits**
  - Source: 6.061 Class Notes, Chapter 4: Introduction To Symmetrical Components. https://ocw.mit.edu/courses/6-061-introduction-to-electric-power-systems-spring-2011/7603169f5d8514b769a46fa900b79a57_MIT6_061S11_ch4.pdf
  - Quote: "A very common application of symmetrical components is in calculating currents arising from unblanced short circuits"

- **MDPI: sequence components make fault calculations in unbalanced systems simpler (most system faults are unbalanced)**
  - Source: 100 Years of Symmetrical Components | MDPI. https://www.mdpi.com/1996-1073/12/3/450
  - Quote: "circuit calculations in unbalanced systems (most of the system faults are unbalanced), up to the analysis of system transient stability and the operation of protection systems"

- **Naval academy poster (Bulgaria): load unbalance and generator synchronisation measured with sequence components in a shipboard power system**
  - Source: eeae-conf.uni-ruse.bg. https://eeae-conf.uni-ruse.bg/images/files/2025_VirtualPosters/VP78.pdf
  - Status: a student/naval-academy conference poster; not a Royal Navy document
  - Quote: "The study investigates how load unbalance affects the synchronization of shipboard generators"

- **Marine electric propulsion: AC motors drive modern ships and underwater vehicles (MDPI 2024)**
  - Source: Enhanced Model Predictive Control for Induction Motor Drives in Marine Electric Power Propulsion System. https://www.mdpi.com/2077-1312/12/3/378
  - Quote: "The marine electric propulsion system mainly employs AC motors to provide power drives, such as induction motors (IMs"

- **MathWorks: Clarke and Park transforms are used in field-oriented control of three-phase AC machines**
  - Source: Clarke And Park Transforms. https://www.mathworks.com/discovery/clarke-and-park-transforms.html
  - Quote: "Coordinate transformations like the Clarke transform and the Park transform are commonly used in field-oriented control of three-phase AC machines"

- **MIT paper: Park's matrix can be found from a rotation matrix**
  - Source: A Geometric Interpretation of Reference Frames and Transformations: dq0, Clarke, and Park. https://dspace.mit.edu/entities/publication/0101952f-1e79-4c01-8c2e-3a74c07d10b3
  - Quote: "Park's matrix can be subsequently found from a rotation matrix"

- **And Clarke's matrix is Park's with a reference angle of zero**
  - Source: A Geometric Interpretation of Reference Frames and Transformations: dq0, Clarke, and Park. https://dspace.mit.edu/entities/publication/0101952f-1e79-4c01-8c2e-3a74c07d10b3
  - Quote: "Then, Clarke's matrix can be found trivially using a reference angle of zero in Park's matrix"

### 7.3 Reactor, stability and control

- **The steady-state neutron diffusion equation is an eigenvalue problem (ScienceDirect Topics)**
  - Source: Neutron Diffusion Equation - an overview | ScienceDirect Topics. https://www.sciencedirect.com/topics/engineering/neutron-diffusion-equation
  - Quote: "The steady state neutron diffusion equation is an eigenvalue problem, where only the dominant eigenvalue and its respective eigenfunction have physical meaning for the problems of interest"

- **The dominant eigenvalue is the effective multiplication factor, the ratio of neutron production to loss from one generation to the next**
  - Source: Neutron Diffusion Equation - an overview | ScienceDirect Topics. https://www.sciencedirect.com/topics/engineering/neutron-diffusion-equation
  - Quote: "The dominant eigenvalue is called the effective multiplication factor"

- **That ratio is between neutron production (by fission) and loss**
  - Source: Neutron Diffusion Equation - an overview | ScienceDirect Topics. https://www.sciencedirect.com/topics/engineering/neutron-diffusion-equation
  - Quote: "between neutron production (by fission) and loss from one generation to another"

### 7.4 What I could not find

No Royal Navy or MCA document names eigenvalues, span or planes: **UNCONFIRMED**. The reactor uses are physics and engineering texts, not a Royal Navy or submarine document. A ship sway-yaw stability use (eigenvalues of a linearised manoeuvring model) turned up only on an exam-answer site, so it is not used (**UNCONFIRMED** from a reliable page). The shaft-vibration sources cover ships and "submarine propulsion system shafting" in a published model (the PMC paper), not a Navy plant. The Bulgarian naval academy poster is a student conference poster. In the course these appear as one-screen uses, labelled for what they are, as in the Matrices brief.

---

## 8. Size: how many lessons the benchmarks spend, and which core supports 7

- **Brilliant Linear Algebra: 41 lessons and 355 exercises (eigenvalues and diagonalisability are 2 of them)**
  - Source: Practice Linear Algebra | Brilliant. https://brilliant.org/courses/lin-alg
  - Quote: "Delve into the abstract depths of linear algebra: vector spaces, determinants, eigenvalues, wedge products, and more. 41 Lessons 355 Exercises"

- **Brilliant Matrices: 43 lessons (Dan's Matrices course)**
  - Source: Practice Matrices | Brilliant. https://brilliant.org/courses/matrices/
  - Quote: "Take your vector skills further by using matrices to transform the plane. 43 Lessons 750 Exercises"

- **HELM Workbook 22 is 53 pages (Eigenvalues and Eigenvectors)**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2049%20Student's%20Guide.pdf
  - Quote: "Workbook 22 - Eigenvalues and Eigenvectors (53 pages"

- **SQA Linear Algebra 2: a 40-hour unit, 20 hours for lines and planes and 10 for eigenvalues**
  - Source: Higher National Unit Specification General information Linear Algebra 2 (SCQF level 8) Unit title: J5WF 35 Unit code: Unit purpose. https://www.sqa.org.uk/files/hn/J5WF35.pdf
  - Quote: "While the exact time allocated to this unit is at the discretion of the centre, the notional design length is 40 hours"

- **Bird 9th edition: eigenvalues and eigenvectors is the last section of Chapter 21, starting at page 275 before Revision Test 6 at page 281**
  - Source: Bird’s Higher Engineering Mathematics; Ninth Edition. https://api.pageplace.de/preview/DT0400.9781000353037_A40491166/preview-9781000353037_A40491166.pdf
  - Quote: "21.6 Eigenvalues and eigenvectors 275 Revision Test 6 281"

- **AQA A level Further Maths: two content lines, C10 and C11, for eigenvalues and diagonalisation**
  - Source: A-level Further Mathematics Specification Specification for first teaching in 2017. https://filestore.aqa.org.uk/resources/mathematics/specifications/AQA-7367-SP-2017.PDF
  - Quote: "C10 Find eigenvalues and eigenvectors of 2 × 2 and 3 × 3 matrices. Find and use the characteristic equation"

- **Khan Linear algebra: 3 units; Unit 3 holds change of basis and eigen-everything**
  - Source: Vectors and spaces | Linear algebra | Math | Khan Academy. https://www.khanacademy.org/math/linear-algebra/vectors-and-spaces
  - Quote: "Linear algebra 3 units Unit 1 Vectors and spaces Unit 2 Matrix transformations Unit 3 Alternate coordinate systems (bases"

**My reading: which core supports 7 lessons.** The benchmarks spend 41 lessons (Brilliant), three Khan units, a 53-page HELM workbook, and an SQA 40-hour unit that spends 20 hours on lines and planes and 10 on eigenvalues. A 7-lesson core that covers what the brief asked, in the order Khan and SQA use, would be:
1. **Which arrows can you reach: span, independence, basis.** (3Blue1Brown 4.1; Khan Unit 1; Matrices Level 1 glance.)
2. **The same arrow in two coordinate systems: change of basis.** (3Blue1Brown, Khan Unit 3.)
3. **Lines and planes in three dimensions.** (SQA LA2 outcome 1; HELM 9; Vectors left it here.) Point plus direction; point plus normal; where they meet.
4. **What a matrix can reach and what it kills: column space, null space, rank.** (MIT 18.06, LibreTexts.) It builds on Matrices lesson 7 elimination and ties to "no answer / a line of answers".
5. **Directions a matrix only stretches: eigenvalues and eigenvectors**, 2 by 2 by the characteristic quadratic, 3 by 3 by the cubic. (HELM 22.1, 3Blue1Brown, SQA LA2.) Uses Quadratics and Complex numbers; includes a turn with no real eigenvector.
6. **Diagonalising: powers and repeated steps.** (3Blue1Brown, HELM 22.2, SQA "A to the n", MIT 18.06.) Change of basis (lesson 2) meets eigenvectors.
7. **Systems x' = A x, and one engineering use: two masses on springs (normal modes).** (HELM 22.2, Herman, MIT ES.1803, MIT 8.03.) Two tanks first; the vibration modes second; the three-phase transforms as a one-screen use.

This fits the pattern of the earlier maths briefs (Vectors, Matrices and Differential equations each took seven lessons). Six lessons would drop either the systems and engineering use (which the Differential equations and Matrices briefs both promised Dan) or the lines and planes (which Vectors promised); eight would split span from independence or add a matrix-powers lesson of its own. Lesson 5 is the heaviest and may take two screens-worth of working; the 3 by 3 case should be one worked example, not a method drill, as in SQA's support notes ("Calculate the eigenvalues for 2 x 2, 3 x 3 and 4 x 4 matrices" is for HND learners; the 4 by 4 case is left out).
