# Vectors: research notes

Researched 24 Oct 2026 for the Vectors course brief (the second course in the Maths shelf's Advanced maths folder,
after Calculus fundamentals and before Matrices; blurb "Quantities with a size and a direction, and how to combine
them."; benchmark "Brilliant: Vectors"). The brief itself is not written here; these notes are its evidence.
Dan is an electrician and a Royal Navy submariner on the electrical engineering path. Next year he does a Level 3
marine engineering course (general engineering first, then submarine and nuclear propulsion). He asked for
foundations that see him through any new topic, not a remake of Brilliant's course.

Every finding has its source title, URL and the exact words, copied out of a saved tool result by script (the quotes
were not retyped into this file). All of them are listed in `quotes.json` beside this file and were checked with
`node tools/eval/sources.mjs --quotes ... --tools ...` (`failed: 0`). The tool files are in `tools/`. Four of them
(`prev-trig-02`, `prev-trig-22`, `prev-trig-76`, `prev-cx-62`) are copied unchanged from the Trigonometry and Complex
numbers research; every other file is this run's own harvest. Findings I could not confirm are marked
**UNCONFIRMED**; where only a non-original site said it, **SECONDARY**. My own readings are marked "My reading" and
are not quotes. Quotes keep the page's own glyphs: an odd space or a markdown mark inside a quote is the page's, not
mine.

What Dan already has (from the repo, not quotes): all of Foundational maths (including The coordinate plane, which
is two-dimensional, and Geometry fundamentals), all of Algebra (including Trigonometry and Complex numbers) and
Calculus fundamentals; and the electrical courses AC circuits (phasors, reactance, three-phase, star and delta),
Design and verification, Motors and HV Subsea Cable Testing. So sin, cos, tan, Pythagoras, the sine and cosine
rules, j and polar form, and phasor diagrams are not to be taught again.

---

## 1. Benchmark: Brilliant's Vectors

### 1.1 The course itself
Brilliant's page is `brilliant.org/courses/vectors/`. The course is **39 lessons in 8 levels**. In one line, in
order: Vectors, Vector Addition, Drawing Vectors, Component-Wise Addition (1); Opposite Vectors, Vector Subtraction,
Drawing Differences, Vector Differences (2); Scalar Multiplication, Reversing Direction, Linear Combinations, Linear
Combination Grids, Solving Linear Combinations, Drawing Linear Combinations, Linear Interpolation (3); Magnitude and
Direction, Drawing from Polar Form, Polar Angles, Finding the Polar Angle, Computing from Components (4); Vector
Components, Non-Polar Angles, Combining Vectors (5); Adding Velocities, Velocity Magnitude and Direction, Velocity
from Bearing, Combining Velocity Bearings, Relative Velocity (6); Scaling and Magnitude, Unit Vectors, Comparing Unit
Vectors, The Dot Product, Unit Vector Dot Products (7); General Dot Products, Scaling Dot Products, Dot Product from
Magnitudes, Angle from Dot Product, Self Dot Products, Orthogonal Dot Products (8). Levels 1 and 2 also end with a
"Level Check"; the page's 39 does not seem to count them (my count of the titles above is 39).

- **Brilliant Vectors is 39 lessons (the page showed 674 exercises on one fetch, 714 on another)**
  - Source: Practice Vectors | Brilliant. https://brilliant.org/courses/vectors/
  - Quote: "Start your linear algebra journey here with vectors as shifts in space. 39 Lessons 674 Exercises"
- **The same course page, a second fetch, showed 714 exercises**
  - Source: Practice Vectors | Brilliant. https://brilliant.org/courses/vectors
  - Quote: "39 Lessons 714 Exercises"
- **Levels 1 to 4: vectors, subtraction, linear combinations, magnitude and direction**
  - Source: Practice Vectors | Brilliant. https://brilliant.org/courses/vectors/
  - Quote: "Level 1 Vectors Vectors Vector Addition Drawing Vectors Component-Wise Addition Level Check ### Level 2 Vector Subtraction Opposite Vectors Vector Subtraction Drawing Differences Vector Differences Level Check ### Level 3 Linear Combinations Scalar Multiplication Reversing Direction Linear Combinations Linear Combination Grids Solving Linear Combinations Drawing Linear Combinations Linear Interpolation ### Level 4 Magnitude and Direction Magnitude and Direction Drawing from Polar Form Polar Angles Finding the Polar Angle Computing from Components"
- **Levels 5 to 8: components from angles, combining velocities, unit vector and general dot products**
  - Source: Practice Vectors | Brilliant. https://brilliant.org/courses/vectors/
  - Quote: "Level 5 Components from Angles Vector Components Non-Polar Angles Combining Vectors ### Level 6 Combining Velocities Adding Velocities Velocity Magnitude and Direction Velocity from Bearing Combining Velocity Bearings Relative Velocity ### Level 7 Unit Vector Dot Products Scaling and Magnitude Unit Vectors Comparing Unit Vectors The Dot Product Unit Vector Dot Products ### Level 8 General Dot Products General Dot Products Scaling Dot Products Dot Product from Magnitudes Angle from Dot Product Self Dot Products Orthogonal Dot Products"
- **Brilliant describes the course as vectors as shifts in space, geometry before formulas**
  - Source: Practice Vectors | Brilliant. https://brilliant.org/courses/vectors/
  - Quote: "Explore vectors as shifts in space, using grids and arrows to build intuition before any formulas appear. By the end of the course, you'll be able to add, subtract, and scale vectors, describe them by magnitude and direction, combine velocities and bearings, and measure how much two vectors point the same way with the dot product. You'll see where each operation comes from geometrically rather than just applying a rule."
- **Brilliant lists twelve topics covered**
  - Source: Practice Vectors | Brilliant. https://brilliant.org/courses/vectors/
  - Quote: "Topics covered * Bearings * Dot Products * Inverse Tangent * Linear Combinations * Linear Interpolation * Magnitude and Direction * Relative Velocity * Scalar Multiplication * Unit Vectors * Vector Addition * Vector Components * Vector Subtraction"
- **Brilliant expects algebraic expressions and right-triangle trigonometry, and sends you to Matrices next**
  - Source: Practice Vectors | Brilliant. https://brilliant.org/courses/vectors/
  - Quote: "Before you get started, you should be comfortable with basic algebraic expressions and right-triangle trigonometry, since you'll use inverse tangent to find a vector's direction. You don't need any prior experience with vectors to begin. When you finish, the Matrices course picks up right where this one leaves off."

My reading of the order: shifts on a grid first (levels 1 to 2), scaling and combining (3), then the polar view with
inverse tangent (4), components from angles (5), velocities and bearings (6), and only then the dot product, built
from unit vectors (7) and generalised (8). The course is all two-dimensional, has no cross product, no work, torque or
power, and no phasors; about a fifth of it (the seven lessons of level 3, "Linear Interpolation" among them) is linear-algebra
ground that belongs to Dan's Matrices and Linear algebra courses. The pages give only titles, so what happens inside
each lesson is **UNCONFIRMED** (I did not see a lesson). The exercise count moved between two fetches within this
session, 674 then 714, so Brilliant's numbers should be treated as approximate.

### 1.2 Where it sits in Brilliant's path
- **Brilliant's suggested order from scratch: trigonometry, exponentials, logarithms, then Vectors and Matrices, then Complex Numbers**
  - Source: Does Brilliant cover Precalculus? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-precalculus
  - Quote: "Starting from scratch, a workable order is Trigonometric Functions , Exponential Functions , Logarithms , Vectors and Matrices , then Complex Numbers , which leans on polar angles from the first two."
- **On Brilliant's course page Advanced Math lists Limits, Derivatives, Calculus, Vectors, Matrices in that order**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "GR 11–UNIV Limits New GR 12–UNIV Derivatives New GR 12–UNIV Calculus GR 10–11 Vectors GR 11–UNIV Matrices"
- **Brilliant puts Trigonometric Functions in the Advanced Algebra band, ahead of Advanced Math**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "GR 11–12 Trigonometric Functions GR 11–12 Polynomials"
- **Brilliant calls vectors and matrices its strongest precalculus ground**
  - Source: Does Brilliant cover Precalculus? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-precalculus
  - Quote: "If your Precalculus class has a vectors and matrices unit, this is the best reason to use Brilliant."
- **Brilliant's velocity strand**
  - Source: Does Brilliant cover Precalculus? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-precalculus
  - Quote: "There is also an applied velocity strand, including Relative Velocity and Velocity from Bearing"
- **Brilliant's Vectors and Matrices are two-dimensional and stop short of linear algebra proper**
  - Source: Does Brilliant cover Precalculus? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-precalculus
  - Quote: "Are Vectors and Matrices linear algebra courses? Not quite. They work entirely in two dimensions with 2×2 matrices, the scope of a Precalculus matrix unit. Together they cover determinants, inverses, composition, and solving linear systems, but not eigenvalues, vector spaces, or higher dimensions."
- **Brilliant points Vectors at vector-valued functions, and has no multivariable course**
  - Source: Does Brilliant cover Calculus? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-calculus
  - Quote: "Vectors (39 lessons) |Vector components, magnitude, and velocity — the setup for vector-valued functions"
- **Brilliant has no multivariable calculus or differential equations course**
  - Source: Does Brilliant cover Calculus? | Brilliant. https://brilliant.org/help/courses-and-curriculum/does-brilliant-cover-calculus
  - Quote: "There is no multivariable calculus, linear algebra, or differential equations course."
- **Brilliant's Matrices course picks up the vector skills (43 lessons)**
  - Source: Practice Matrices | Brilliant. https://brilliant.org/courses/matrices
  - Quote: "Take your vector skills further by using matrices to transform the plane. 43 Lessons 750 Exercises"

My reading: Brilliant teaches Vectors straight after trigonometry, exponentials and logarithms and before Matrices,
which is the order of Dan's shelf (Calculus fundamentals, Vectors, Matrices, Linear algebra, Vector calculus,
Differential equations, Group theory). Brilliant tags Vectors "GR 10-11" and Trigonometric Functions "GR 11-12", so its
own labels disagree slightly with its suggested order; the suggested order is the one to trust. Brilliant stops at
two dimensions and says so; the three-dimensional vector, the cross product, and fields (div and curl) are not on its
path at all, which is where the brief's "defer" lines go: Matrices and Linear algebra take linear combinations,
span and transformations; Vector calculus takes fields.

---

## 2. Other courses' order for the same ground

### 2.1 Khan Academy
- **Khan Academy Precalculus, Unit 6: Vectors (the exact order)**
  - Source: Vectors | Precalculus | Math | Khan Academy. https://www.khanacademy.org/math/precalculus/x9e81a4f98389efdf:vectors
  - Quote: "1. Vectors intro 2. Components of vectors from endpoints 3. Magnitude of vectors 4. Vectors: Quiz 1 5. Scalar multiplication 6. Add vectors 7. Subtract vectors 8. Vectors: Quiz 2 9. Direction of vectors 10. Vector components from magnitude & direction 11. Add vectors: magnitude & direction 12. Vector word problems 13. Vectors: Quiz 3 14. Vectors: Unit test"
- **Khan Academy puts Vectors (Unit 6) before Matrices (Unit 7) and after Trigonometry (Unit 2) and Complex numbers (Unit 3)**
  - Source: Vectors | Precalculus | Math | Khan Academy. https://www.khanacademy.org/math/precalculus/x9e81a4f98389efdf:vectors
  - Quote: "Unit 1 Composite and inverse functions Unit 2 Trigonometry Unit 3 Complex numbers Unit 4 Rational functions Unit 5 Conic sections Unit 6 Vectors Unit 7 Matrices Unit 8 Probability and combinatorics Unit 9 Series Unit 10 Limits and continuity"
- **Khan Academy Linear algebra Unit 1, the Vectors lessons**
  - Source: Vectors and spaces | Linear algebra | Math | Khan Academy. https://www.khanacademy.org/math/linear-algebra/vectors-and-spaces
  - Quote: "Vector intro for linear algebra (Opens a modal) * Real coordinate spaces (Opens a modal) * Adding vectors algebraically & graphically (Opens a modal) * Multiplying a vector by a scalar (Opens a modal) * Vector examples (Opens a modal) * Unit vectors intro (Opens a modal) * Parametric representations of lines"
- **Khan Academy Linear algebra Unit 1, dot and cross products**
  - Source: Vectors and spaces | Linear algebra | Math | Khan Academy. https://www.khanacademy.org/math/linear-algebra/vectors-and-spaces
  - Quote: "Vector dot product and vector length (Opens a modal) * Proving vector dot product properties (Opens a modal) * Proof of the Cauchy-Schwarz inequality (Opens a modal) * Vector triangle inequality (Opens a modal) * Defining the angle between vectors (Opens a modal) * Defining a plane in R3 with a point and normal vector (Opens a modal) * Cross product introduction (Opens a modal) * Proof: Relationship between cross product and sin of angle (Opens a modal) * Dot and cross product comparison/intuition (Opens a modal) * Vector triple product expansion (very optional) (Opens a modal) * Normal vector from plane equation (Opens a modal) * Point distance to plane (Opens a modal) * Distance between planes"
- **Khan Academy on why vectors matter**
  - Source: Vectors and spaces | Linear algebra | Math | Khan Academy. https://www.khanacademy.org/math/linear-algebra/vectors-and-spaces
  - Quote: "Vectors are used to represent many things around us: from forces like gravity, acceleration, friction, stress and strain on structures, to computer graphics used in almost all modern-day movies and video games. Vectors are an important concept, not just in math, but in physics, engineering, and computer graphics, so you're likely to see them again in other subjects."

My reading: Khan's Precalculus unit is the same spine as Brilliant's (intro, components from endpoints, magnitude,
scaling, add, subtract, direction, components from magnitude and direction, add in magnitude and direction form, word
problems) with no dot product. Its Linear algebra course carries vectors on to linear combinations, span, then the
dot and cross products (with the angle, planes and distances), then matrices.

### 2.2 BBC Bitesize
- **Bitesize Higher Maths, Geometric vectors: three pages**
  - Source: Geometric vectors - Geometric vectors - Higher Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zqvbb9q/revision/1
  - Quote: "1. Geometric vectors 2. Determining the resultant in three dimensions 3. Working with collinearity"
- **Bitesize Higher Maths summary of vectors**
  - Source: Geometric vectors - Geometric vectors - Higher Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zqvbb9q/revision/1
  - Quote: "Vectors describe movement with both direction and magnitude. They can be added or subtracted to produce resultant vectors. The scalar product can be used to find the angle between vectors."
- **Bitesize on notation: bold in print, underlined by hand**
  - Source: Geometric vectors - Geometric vectors - Higher Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zqvbb9q/revision/1
  - Quote: "In print, a is written in bold type. In handwriting, the vector is indicated by underlining the letter."
- **Bitesize: equal vectors regardless of position**
  - Source: Geometric vectors - Geometric vectors - Higher Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zqvbb9q/revision/1
  - Quote: "If two vectors have the same magnitude and direction , then they are equal regardless of their position."
- **Bitesize: moving backwards along a vector makes it negative**
  - Source: Geometric vectors - Geometric vectors - Higher Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zqvbb9q/revision/1
  - Quote: "If we move 'backwards' along a vector, it becomes negative"
- **Bitesize: what a resultant is**
  - Source: Geometric vectors - Geometric vectors - Higher Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zqvbb9q/revision/1
  - Quote: "A resultant vector is a vector that 'results' from adding two or more vectors together."
- **Bitesize Higher Maths, Working with vectors: the scalar product is mainly for angles**
  - Source: Scalar product - Working with vectors - Higher Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z78scqt/revision/1
  - Quote: "The main use of the scalar product is to calculate the angle"
- **Bitesize Higher Maths, Working with vectors: its two pages**
  - Source: Scalar product - Working with vectors - Higher Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z78scqt/revision/1
  - Quote: "1. Scalar product 2. Using and finding unit vectors"
- **Bitesize National 5, Using vector components: three pages**
  - Source: Subtracting vectors - Using vector components - National 5 Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zwncsrd/revision/2
  - Quote: "1. Adding vectors 2. Subtracting vectors 3. Position vectors"
- **Bitesize National 5: components add and subtract separately**
  - Source: Subtracting vectors - Using vector components - National 5 Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zwncsrd/revision/2
  - Quote: "Vector components describe the separate x, y and z values of a vector. When working with vectors, components can be added or subtracted separately."
- **Bitesize National 5: subtracting is adding the reverse**
  - Source: Subtracting vectors - Using vector components - National 5 Maths Revision - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/zwncsrd/revision/2
  - Quote: "Subtracting a vector is the same as adding a negative version of the vector (remember that making a vector negative means reversing its direction)."
- **Bitesize GCSE Physics: scalars measure size, vectors size and direction**
  - Source: BBC Bitesize – Physics Episode 1 - Scalar and vector quantities, contact and non-contact forces. https://bam.files.bbci.co.uk/bam/live/content/z7xhg2p/transcript
  - Quote: "scalar quantities just measure magnitude, whereas vector quantities measure magnitude and direction."

### 2.3 SQA National 5 and Higher Maths (what a Scottish school leaver has met)
- **SQA National 5: vector components in two or three dimensions**
  - Source: National 5 Mathematics Course Specification. https://www.sqa.org.uk/files_ccc/n5-course-spec-mathematics.pdf
  - Quote: "Adding or subtracting two- or three-dimensional vectors using components"
- **SQA National 5: magnitude of a vector**
  - Source: National 5 Mathematics Course Specification. https://www.sqa.org.uk/files_ccc/n5-course-spec-mathematics.pdf
  - Quote: "Magnitude of a two- or three-dimensional vector"
- **SQA Higher Mathematics, geometric skills: vector connections, collinearity, division point, scalar product and angle**
  - Source: Higher Mathematics Course Specification. https://www.sqa.org.uk/files_ccc/h-course-spec-mathematics.pdf
  - Quote: "Determining vector connections  determining the resultant of vector pathways in three dimensions  working with collinearity  determining the coordinates of an internal division point of a line Working with vectors  evaluating a scalar product given suitable information and determining the angle between two vectors"
- **SQA Higher Mathematics: unit vectors i, j, k**
  - Source: Higher Mathematics Course Specification. https://www.sqa.org.uk/files_ccc/h-course-spec-mathematics.pdf
  - Quote: "using and finding unit vectors including i , j , k as a basis"

My reading: Bitesize and SQA give the school order: components and column vectors, add and subtract, position
vectors (National 5, two and three dimensions); then resultants and pathways in three dimensions, collinearity,
the scalar product and the angle, unit vectors with i, j, k (Higher). They never reach the vector product.

### 2.4 HELM (Loughborough)
- **HELM Workbook 9 Vectors, sections 9.1 to 9.4**
  - Source: 99. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%209%20Vectors.pdf
  - Quote: "Basic Concepts of Vectors 2 ## 9\.2 Cartesian Components of Vectors 17 ## 9\.3 The Scalar Product 30 ## 9\.4 The Vector Product 45"
- **HELM Workbook 9, section 9.5**
  - Source: 99. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%209%20Vectors.pdf
  - Quote: "Lines and Planes 54"
- **HELM Workbook 9 opens with the triangle law**
  - Source: 99. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%209%20Vectors.pdf
  - Quote: "In this Workbook you will learn what a vector is and how to combine vectors together using the triangle law."
- **HELM puts Matrices (7, 8) before Vectors (9) and Complex Numbers (10)**
  - Source: sheffield.ac.uk. https://www.sheffield.ac.uk/media/32130/download?attachment
  - Quote: "Workbook 8 - Matrix Solution of Equations (32 pages) 8\.1 Solution by Cramer’s Rule 8\.2 Solution by Inverse Matrix Method 8\.3 Solution by Gauss Elimination Workbook 9 - Vectors (66 pages) 9\.1 Basic Concepts of Vectors 9\.2 Cartesian Components of Vectors 9\.3 The Scalar Product 9\.4 The Vector Product 9\.5 Lines and Planes Workbook 10 - Complex Numbers (34 pages)"
- **HELM: the two products of vectors**
  - Source: 9.3. https://sheffield.ac.uk/media/31970/download?attachment
  - Quote: "The first is known as the scalar product or dot product . This is so-called because when the scalar product of two vectors is calculated the result is a scalar. The second product is known as the vector product . When this is calculated the result is a vector."
- **HELM 9.3: the scalar product resolves one vector along another**
  - Source: 9.3. https://sheffield.ac.uk/media/31970/download?attachment
  - Quote: "The scalar product can be used to find the component of a vector in the direction of another vector."
- **HELM underlines vectors instead of bold**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2049%20Student's%20Guide.pdf
  - Quote: "HELM uses underlining of vectors rather than using bold"

My reading: HELM is the engineer's order: concepts and the triangle law, then Cartesian components, then the scalar
product (with "resolving one vector along another"), then the vector product, then lines and planes. It comes after
Matrices (workbooks 7 and 8) and just before Complex Numbers (workbook 10). HELM underlines vectors rather
than using bold, where Bitesize uses bold in print and underlining by hand.

### 2.5 Bird's Engineering Mathematics (the Royal Navy's marine engineering textbook)
- **Bird's Higher Engineering Mathematics (9th ed.), Section F Vector geometry**
  - Source: Bird’s Higher Engineering Mathematics; Ninth Edition. https://api.pageplace.de/preview/DT0400.9781000353037_A40491166/preview-9781000353037_A40491166.pdf
  - Quote: "Section F Vector geometry 283 22 Vectors 285 22.1 Introduction 285 22.2 Scalars and vectors 285 22.3 Drawing a vector 286 22.4 Addition of vectors by drawing 287 22.5 Resolving vectors into horizontal and vertical components 289 22.6 Addition of vectors by calculation 290 22.7 Vector subtraction 295 22.8 Relative velocity 297 22.9 _i_ , _j_ and _k_ notation 298 23 Methods of adding alternating waveforms 301 23.1 Combination of two periodic functions 301 23.2 Plotting periodic functions 302 23.3 Determining resultant phasors by drawing 303 23.4 Determining resultant phasors by the sine and cosine rules 305 23.5 Determining resultant phasors by horizontal and vertical components 306 23.6 Determining resultant phasors by using complex numbers 308 24 Scalar and vector products 312 24.1 The unit triad 312 24.2 The scalar product of two vectors 313 24.3 Vector products 317 24.4 Vector equation of a line 321"
- **Bird taught at the Royal Navy's marine engineering college**
  - Source: Bird’s Higher Engineering Mathematics; Ninth Edition. https://api.pageplace.de/preview/DT0400.9781000353037_A40491166/preview-9781000353037_A40491166.pdf
  - Quote: "He has recently retired from lecturing at the Royal Navy’s Defence College of Marine Engineering in the Defence College of Technical Training at H.M.S. Sultan"
- **Bird's Engineering Mathematics (5th ed.), Section 5 Vectors (SECONDARY: a slide-sharing copy of the contents page)**
  - Source: john bird 3 | PDF. https://www.slideshare.net/slideshow/john-bird-3/69628329
  - Quote: "Section 5 Vectors 299 33 Vectors 301 33.1 Introduction 301 33.2 Vector addition 301 33.3 Resolution of vectors 302 33.4 Vector subtraction 305"
- **Bird's Engineering Mathematics (5th ed.), the next chapter is waveforms (SECONDARY)**
  - Source: john bird 3 | PDF. https://www.slideshare.net/slideshow/john-bird-3/69628329
  - Quote: "34 Combination of waveforms 307 34.1 Combination of two periodic functions 307 34.2 Plotting periodic functions 307 34.3 Determining resultant phasors by calculation 308"

My reading: Bird gives vectors three chapters, in this order: vectors (scalars and vectors, drawing, adding by
drawing, resolving, adding by calculation, subtracting, relative velocity, i j k), then adding alternating waveforms
(the phasor bridge: by drawing, by the sine and cosine rules, by horizontal and vertical components, by complex
numbers), then scalar and vector products (the unit triad, scalar product, vector product, vector equation of a
line). The author's biography says he lectured at the Royal Navy's marine engineering college, so this is the order
Dan's instructors are likely to know. The 9th edition contents page was the original publisher's preview; the 5th
edition page is a slide-sharing copy (**SECONDARY**).

### 2.6 What is common (consensus across the five)
My reading:
1. What a vector is: size and direction, scalar against vector, arrows, notation (all five).
2. Adding and subtracting, by drawing then by components (all five); subtracting as adding the reverse (Bitesize, Khan).
3. Scaling by a number and the negative (all five).
4. Magnitude, direction and components with trigonometry (Brilliant, Khan, Bird, HELM, MCA).
5. Unit vectors and i, j, k, then three dimensions (Bitesize Higher, SQA, HELM, Bird, Khan LA).
6. Position and displacement vectors (Bitesize N5, Bird "relative velocity", Brilliant velocities).
7. The scalar product and the angle between vectors (Bitesize Higher, SQA, HELM, Bird, Khan LA, Brilliant levels 7-8).
8. The vector product (HELM, Bird, Khan LA only, so it is an engineering and university topic).
9. Lines and planes (HELM 9.5, Bird 24.4, Khan LA): not needed for Dan's trade; defer to Linear algebra.
Where the sources differ: Brilliant puts relative velocity before the dot product; Bird puts waveform addition
(phasors) right after the basic chapter and before the products; HELM puts Complex Numbers right after Vectors.

---

## 3. What a marine engineering course actually uses of this topic

Dan's next course is a Level 3 marine engineering qualification; the published maths syllabi nearest to it that I
could reach are the SQA and Pearson Higher National units and the MCA engineer officer syllabi. A Level 3 syllabus
that names vectors is **UNCONFIRMED** (I found none).

### 3.1 SQA HN Engineering Mathematics 1 (HP48 46)
- **SQA Engineering Mathematics 1 (HP48 46): purpose**
  - Source: Electronic Engineering Units. https://china.qualifications.gov.scot/files/SQA-Advanced/Electronic_Engineering/Electronic_Engineering_Units/HP4846.pdf
  - Quote: "This Unit is designed to develop or consolidate a basic level of mathematical skills required of learners across a range of Engineering disciplines. The Unit provides learners with opportunities to develop knowledge, understanding and skills to solve mathematical problems including polynomial, trigonometrical, exponential and logarithmic functions. Learners will also be introduced to 3-dimensional vectors and complex numbers."
- **SQA Engineering Mathematics 1, Outcome 3: the vector lines**
  - Source: Electronic Engineering Units. https://china.qualifications.gov.scot/files/SQA-Advanced/Electronic_Engineering/Electronic_Engineering_Units/HP4846.pdf
  - Quote: "Outcome 3 Apply mathematical techniques involving vectors and complex numbers. Knowledge and/or Skills  Collinearity  Addition, subtraction and scalar multiplication of vectors  Scalar product"
- **SQA Engineering Mathematics 1: evidence of two vector problems**
  - Source: SQA Advanced Unit Specification General information for centres Unit title: Engineering Mathematics 1 (SCQF level 6) Unit code: HP48 46. https://china.qualifications.gov.scot/files/SQA-Advanced/Electronic_Engineering/Electronic_Engineering_Units/HP4846.pdf
  - Quote: "Solve two vector problems involving a combination of at least two of the following: addition of vectors; subtraction of vectors and multiplication of a vector by a scalar"
- **SQA Engineering Mathematics 1: the angle between two 3-dimensional vectors**
  - Source: Electronic Engineering Units. https://china.qualifications.gov.scot/files/SQA-Advanced/Electronic_Engineering/Electronic_Engineering_Units/HP4846.pdf
  - Quote: "Calculate the angle between two 3-dimensional vectors using the scalar product"
- **SQA Engineering Mathematics 1: a 2-dimensional vector from Cartesian to polar form and back**
  - Source: SQA Advanced Unit Specification General information for centres Unit title: Engineering Mathematics 1 (SCQF level 6) Unit code: HP48 46. https://china.qualifications.gov.scot/files/SQA-Advanced/Electronic_Engineering/Electronic_Engineering_Units/HP4846.pdf
  - Quote: "Convert one vector (2-dimensional cases) or complex number in Cartesian form to polar form and one vector or complex number in polar form to Cartesian form showing clearly all working"
- **SQA Engineering Mathematics 1 support notes: scalars and vectors from engineering, notation**
  - Source: Electronic Engineering Units. https://china.qualifications.gov.scot/files/SQA-Advanced/Electronic_Engineering/Electronic_Engineering_Units/HP4846.pdf
  - Quote: "Introduce the concept of a vector and scalar and give examples of each form from Engineering  Outline notation commonly used with vectors"
- **SQA Engineering Mathematics 1 support notes: 3-D coordinates and component form**
  - Source: Electronic Engineering Units. https://china.qualifications.gov.scot/files/SQA-Advanced/Electronic_Engineering/Electronic_Engineering_Units/HP4846.pdf
  - Quote: "Introduce 3-dimension coordinates and the representation of 3-dimensional vectors in component form"
- **SQA Engineering Mathematics 1 support notes: the scalar product gives the angle**
  - Source: Electronic Engineering Units. https://china.qualifications.gov.scot/files/SQA-Advanced/Electronic_Engineering/Electronic_Engineering_Units/HP4846.pdf
  - Quote: "Introduce the scalar product for 2-d and 3-d vectors"
- **SQA Engineering Mathematics 1: Outcome 3 is 14 of 40 hours, shared with complex numbers**
  - Source: SQA Advanced Unit Specification General information for centres Unit title: Engineering Mathematics 1 (SCQF level 6) Unit code: HP48 46. https://china.qualifications.gov.scot/files/SQA-Advanced/Electronic_Engineering/Electronic_Engineering_Units/HP4846.pdf
  - Quote: "Outcome 3 (14 hours) Apply mathematical techniques to vectors and complex numbers"
- **SQA Engineering Mathematics 1: 40 notional hours**
  - Source: SQA Advanced Unit Specification General information for centres Unit title: Engineering Mathematics 1 (SCQF level 6) Unit code: HP48 46. https://china.qualifications.gov.scot/files/SQA-Advanced/Electronic_Engineering/Electronic_Engineering_Units/HP4846.pdf
  - Quote: "the notional design length is 40 hours."
- **SQA tells candidates vectors and complex numbers are widely used in mechanical and electrical engineering**
  - Source: SQA Advanced Unit Specification General information for centres Unit title: Engineering Mathematics 1 (SCQF level 6) Unit code: HP48 46. https://china.qualifications.gov.scot/files/SQA-Advanced/Electronic_Engineering/Electronic_Engineering_Units/HP4846.pdf
  - Quote: "You will also study 2 and 3- dimensional vectors and complex numbers which are widely used in mechanical and electrical Engineering."
- **SQA Engineering Mathematics 1: advantageous entry skills**
  - Source: SQA Advanced Unit Specification General information for centres Unit title: Engineering Mathematics 1 (SCQF level 6) Unit code: HP48 46. https://china.qualifications.gov.scot/files/SQA-Advanced/Electronic_Engineering/Electronic_Engineering_Units/HP4846.pdf
  - Quote: "it would be advantageous if learners had good algebraic skills together with an ability to transpose engineering formulae and solve simple trigonometric equations."

My reading: this is the clearest syllabus for the course. The examined skills are: add, subtract and scale vectors;
3-D coordinates and components; collinearity; the angle between two 3-D vectors by the scalar product; and a 2-D
vector from Cartesian to polar form and back. The vector product is not named. Vectors share 14 hours with complex
numbers in a 40-hour unit. The unit's file is an SQA-hosted copy on a Qualifications Scotland address; whether a
newer version replaces it is **UNCONFIRMED**.

### 3.2 Pearson BTEC HN, Unit 4002 Engineering Mathematics
- **Pearson HN Unit 4002 Engineering Mathematics, LO3 (2024 descriptor)**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "LO3 Use analytical and computational methods for solving engineering and manufacturing sector problems by relating sinusoidal wave and vector functions to their respective applications"
- **Pearson 4002 pass criterion P7**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "P7 Use appropriate methodology to determine engineering parameters of data represented in vector form."
- **Pearson 4002 distinction D2**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "D2 Apply engineering mathematical software to confirm the analytical solutions for at least three engineering/ manufacturing problems involving sinusoidal and vector functions."
- **The 2020 Pearson specification's Unit 2 Engineering Maths lists vector content**
  - Source: BTEC HNCD Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/General-Engineering/2017/specification-and-sample-assessments/hncd-l45-engineering-rqf.pdf
  - Quote: "Vector notation and properties ### Representing quantities in vector form ### Vectors in three dimensions"
- **Pearson Unit 4008 Mechanical Principles uses vector diagrams of velocities and accelerations**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "M2 Analyse dynamic aspects of given mechanical system(s) using vector diagrams of velocities and accelerations within planar mechanisms."
- **Pearson Unit 4049 Principles of Overhead Power adds two sinusoids with different phases**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "LO4 Determine the sum and difference of two sinusoidal signals with mathematical expressions with different phases."
- **A college's 4002 assignment (SECONDARY: posted on a homework-help site) adds series voltages by vector addition**
  - Source: Unit 4002 Engineering Mathematics (A/651/0708) Assignment. https://www.diplomaassignmenthelp.co.uk/questions/unit-4002-engineering-mathematics-assignment-brief-docx/
  - Quote: "Using addition of vectors, find the total voltage and its phase angle, measured in degrees, with regards to the current."
- **Pearson recommends a diagnostic maths check and GCSE grade 4**
  - Source: Higher Nationals. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/General-Engineering/2024/specification-and-sample-assessments/btec-hncd-engineering-2024.pdf
  - Quote: "strongly recommend that all students complete diagnostic mathematics assessments before beginning a Higher National course, as well as having a grade 9 to 4 or A* to C in GCSE Mathematics."

My reading: Pearson pairs vectors with sinusoidal waves in one learning outcome, so the examined use is "represent
engineering quantities in vector form" and adding sinusoids. The 2020 content list (vector notation and
properties, representing quantities in vector form, vectors in three dimensions) is quoted; the 2024 descriptor's own
essential-content list for LO3 was not returned, so whether it still reads the same is **UNCONFIRMED**. The 4002
assignment brief is on a homework-help site (**SECONDARY**); it shows a college setting series voltages and asking
for the total by vector addition.

### 3.3 MCA engineer officer syllabi (GOV.UK)
- **MCA Chief Engineer Applied Mechanics 1.1: Vector Representation**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Understands the use of vectors for graphical solutions. 1. Recalls the procedures for the addition and subtraction of parallel and non-parallel vectors by both graphical and analytical methods. 2. Recalls the terms: Resultant and Equilibrant. 3. Explains that three non-parallel vectors must be concurrent for equilibrium. 4. Resolves vectors into mutually perpendicular components. 5. Solves problems involving coplanar-concurrent and coplanar non-concurrent vector quantities. 6. Solves problems involving non-coplanar concurrent vector quantities."
- **MCA Applied Mechanics 2.1 Statics: moments and oblique forces**
  - Source: Applied Mechanics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/applied-mechanics-written-examination-syllabus
  - Quote: "Recalls a moment of force. 2. Resolves forces applied obliquely into perpendicular components. 3. States the Principle of Moments."
- **MCA General Engineering Science I, 2.3 Statics: scalar and vector, resolving, triangle of forces**
  - Source: General Engineering Science I Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses
  - Quote: "Differentiate between scalar and vector quantities. 4. Resolve forces in horizontal and vertical components restricted to the first quadrant. 5. Solve problems involving two forces meeting at a point. 6. Solve problems involving the triangle of forces with the aid of Bow’s notation."
- **MCA Second Engineer Mathematics syllabus has no vector section; its eight sections**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "Arithmetic 2. 2. Algebra 3. 3. Logarithms 4. 4. Graphs 5. 5. Trigonometry 6. 6. Mensuration 7. 7. Calculus - differentiation 8. 8. Calculus - integration"
- **MCA Second Engineer Mathematics 5.1: sine, cosine, right-angled triangles and the sine and cosine rules**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "Determines Sin, Cos and Tan from given right angled triangle. 6. Reads values of Sin, Cos, Tan, Sec, Cosec and Cot for any angle between 0’ and 90’. 7. Determines an angle from tables knowing its sin, cos, tan, sec, cosec or cot. 8. Determines values of sin, etc, for angles 90’ - 360’ and also is able to obtain an angle (00 - 360’) knowing its sin, etc. 9. States the theorem of Pythagoras. 10. Solves right angled triangles for any side or angle. 11. States the Sine Rule. 12. States the Cosine Rule. 13. Solves any triangle for any side or angle using the above rules."
- **MCA Second Engineer Marine Electro-Technology 2.1: phasors, graphical addition and subtraction of ac quantities**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Explains the term phasor quantity. 20. Explains how phasors may be used to represent sinusoidal quantities. 21. Solves graphical problems involving addition and subtraction of ac voltages and currents using phasor method."
- **MCA Second Engineer Marine Electro-Technology 2.1: phasor diagrams for series circuits and power factor**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Constructs and uses phasor diagrams for R-L, R-C and R-L-C series circuits."
- **MCA Second Engineer Applied Heat 8.1: velocity vector diagrams over a turbine blade**
  - Source: Applied Heat Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/applied-heat-written-examination-syllabus
  - Quote: "Draws the vector diagrams for inlet and outlet steam velocities over a turbine blade for shockless flow. 6. Combines the inlet and outlet diagrams to form a single diagram. 7. Shows velocity of whirl on a combined diagram."
- **MCA's cadet-training review keeps vectors and the scalar product in the ETO (STCW III/6) Mathematics for Engineering**
  - Source: 01. ETO - Mathematics for Engineering - GOV.UK. https://www.gov.uk/government/consultations/cadet-training-modernisation-programmesyllabus-review-first-group-of-consultation-templates/01-eto-mathematics-for-engineering
  - Quote: "Outcome 3: Evaluate the strength of materials in a range of engineering environments | Keep | Remains relevant | See sub-outcomes | | 3.1 Collinearity | Keep | The mathematical theory needs to be understood in a maritime context. | Contextualise application in respect of other engineering units. | | 3.2 Addition, subtraction and scalar multiplication of vectors | Keep | The mathematical theory needs to be understood in a maritime context. | Contextualise application in respect of other engineering units. | | 3.3 Scalar product"
- **MCA General Engineering Science I: the principle of moments**
  - Source: General Engineering Science I Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses
  - Quote: "Define equilibrium and the principle of moments"

My reading: the best match is Chief Engineer Applied Mechanics section 1, "Vector Representation": addition and
subtraction by drawing and by calculation, the words **resultant** and **equilibrant**, resolving into perpendicular
components, coplanar and non-coplanar problems. General Engineering Science I wants
scalar against vector, resolving into horizontal and vertical components, two forces meeting at a point and the
triangle of forces. Second Engineer Marine Electro-Technology wants phasors and adding ac quantities by the phasor
method. The Second Engineer **Mathematics** syllabus has no vector section at all: its eight sections are listed
above, and trigonometry 5.1 (right-angled triangles, the sine and cosine rules) is the tool vectors lean on. The
Electro-Technical Officer maths unit keeps collinearity, vector addition and subtraction, and the scalar product.
I did not find a document called "Applied Mathematics"; the syllabus lines above are the ones I could reach.

### 3.4 Best syllabus lines
- MCA Applied Mechanics 1.1, items 2 and 4 (3.3): the terms resultant and equilibrant, and resolving vectors into
  mutually perpendicular components.
- SQA Engineering Mathematics 1, Outcome 3 evidence (3.1): the angle between two 3-dimensional vectors by the scalar
  product.
- Pearson 4002 P7 (3.2): determine engineering parameters of data represented in vector form.

---

## 4. The scope to cover, and what research says about each part

### 4.1 What a vector is; scalars against vectors; notation
- **Khan Academy: a vector is a magnitude and a direction**
  - Source: Vectors: FAQ (article) | Vectors | Khan Academy. https://www.khanacademy.org/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vec-models/a/vectors-faq
  - Quote: "A vector is a mathematical object that has both a magnitude (length) and a direction. Vectors can be used to represent physical quantities such as velocity, force, and acceleration."
- **Engineering mechanics text: vectors cannot be added by adding their sizes**
  - Source: 16.1: Vectors - Engineering LibreTexts. https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Mechanics_Map_(Moore_et_al.)/16%3A_Appendix_1_-_Vector_and_Matrix_Math/16.1%3A_Vectors
  - Quote: "In contrast with scalar quantities, we cannot add, subtract, multiply or divide them by simply adding, subtracting, multiplying or dividing the magnitudes."
- **Engineering mechanics text: the engineering quantities that are vectors**
  - Source: 16.1: Vectors - Engineering LibreTexts. https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Mechanics_Map_(Moore_et_al.)/16%3A_Appendix_1_-_Vector_and_Matrix_Math/16.1%3A_Vectors
  - Quote: "Many engineering quantities, such as forces, displacements, velocities, and accelerations, will need to be represented as vectors for analysis."
- **OCR examiners: where vector marks are lost**
  - Source: A Level Maths: examiner insight on vectors. https://www.ocr.org.uk/blog/a-level-maths-examiner-insight-on-vectors
  - Quote: "Examiners’ reports show that while many students earn partial marks, full marks are often lost due to: * Confusion over notation * Misinterpreting direction and magnitude * Poor presentation of working."
- **OCR examiners: scalar and vector get confused, and direction is not stated clearly**
  - Source: A Level Maths: examiner insight on vectors. https://www.ocr.org.uk/blog/a-level-maths-examiner-insight-on-vectors
  - Quote: "Examiners report that candidates often do not specify direction clearly, especially when answers require angles or bearings. Issues also arise with confusion between scalar and vector quantities."
- **Pearson Edexcel IAL Physics 2024 report: arrows go in the middle of a vector line**
  - Source: Examiners’ Report Principal Examiner Feedback October 2024. https://qualifications.pearson.com/content/dam/pdf/International-Advanced-Level/Physics/2018/Exam-materials/wph11-01-pef-20250116.pdf
  - Quote: "It is conventional to draw arrows in the middle of vector lines."
See also 2.2 (bold in print, underlined by hand), 2.4 (HELM underlines), 3.1 (SQA wants "notation commonly used with
vectors").

My reading: teach a vector as a movement or a push with a size and a direction, then the scalar contrast with
quantities Dan knows (speed against velocity, mass against weight, energy against force). Choose one hand notation
and say it once; show the others as what he will meet in Bird, HELM and the instructors' slides.

### 4.2 Components and resolving with sin and cos
- **Isaac Science: resolving is a projection, u cos theta along v**
  - Source: Vectors – Resolving Vectors – Isaac Science. https://isaacscience.org/concepts/cm_vectors2
  - Quote: "The projection (or resolution) of u ​ onto the direction of v ​ is u cos θ , which means u ​ has a magnitude u cos θ in the"
- **HELM 9.1 aims: resolve a vector into two perpendicular components**
  - Source: 99. https://sheffield.ac.uk/media/31967/download?attachment
  - Quote: "resolve a vector into two perpendicular components"
- **Components: the lingering errors after three physics courses**
  - Source: Slide 1. https://www.per-central.org/perc/2010/files/componentsposterperc.pdf
  - Quote: "Even after three introductory physics courses, students still have difficulties with vector components, choosing answers with incorrect magnitudes. Some of the students think that the magnitude of a component is equal to the magnitude of the vector, and others know the “rule” that components are shorter than the vector, but have problems to identify the magnitude of the components graphically."
- **Components: sin and cos swapped when the angle is measured from the other axis**
  - Source: Slide 1. https://www.per-central.org/perc/2010/files/componentsposterperc.pdf
  - Quote: "Some students who select this option relate the component chosen with the “opposite side” in the sine of the angle, which is usually used to calculate the magnitude of the _y_ \-component when the angle related to the _x_ \-axis is given."
- **Over half of algebra-based students could not resolve vectors in two dimensions (reported second-hand)**
  - Source: "I think I know it, but I'm not sure": How pre-service teachers blend conceptual physics problems into solution frameworks. https://scielo.org.za/scielo.php?pid=S0256-01002025000200007&script=sci_arttext
  - Quote: "They found that over half of students in an algebra-based course and over a quarter in a calculus-based course were unable to resolve vectors in two dimensions."
- **AQA AS Physics 2018 report (SECONDARY: a copy on a tutoring site): many struggled to resolve vectors**
  - Source: Examiner report (AS) : Paper 2 - June 2018. https://examsolutions.s3.eu-west-2.amazonaws.com/exam+papers/physics/AQA-74072-WRE-JUN18.PDF
  - Quote: "A considerable number of students had difficulty in resolving vectors, with many choosing distractor B as their"
- **AQA AS Physics 2018 report (SECONDARY copy): drawing the vector triangle helped**
  - Source: Examiner report (AS) : Paper 2 - June 2018. https://examsolutions.s3.eu-west-2.amazonaws.com/exam+papers/physics/AQA-74072-WRE-JUN18.PDF
  - Quote: "Students who selected the correct answer (42.6%) had quite often drawn a vector triangle around the wind’s velocity and this helped them to identify the correct component."
See also 3.3 (MCA "Resolves vectors into mutually perpendicular components").

My reading: resolving is Dan's Trigonometry course used in a new setting, so the lesson should spend its time on
which angle, which side, which sign and the picture of the two components forming a right triangle with the vector.

### 4.3 Adding and subtracting; the resultant and the equilibrant
- **Nguyen and Meltzer (2003) abstract: what they tested**
  - Source: Initial understanding of vector concepts among students in introductory physics courses | American Journal of Physics | AIP Publishing. https://pubs.aip.org/aapt/ajp/article/71/6/630/1055956/Initial-understanding-of-vector-concepts-among
  - Quote: "We report the results of an investigation into physics students’ understanding of vector addition, magnitude, and direction for problems presented in graphical form."
- **Heckler and Scaife quote Nguyen and Meltzer on how few can draw a sum**
  - Source: Adding and subtracting vectors: The problem with the arrow representation | Phys. Rev. ST Phys. Educ. Res.. https://link.aps.org/doi/10.1103/PhysRevSTPER.11.010101
  - Quote: "Nguyen and Meltzer [1] found that only about 60%–70% of calculus-based students and 20%–40% of algebra-based students can correctly draw the sum of two vectors represented as arrows on a two-dimensional grid, and only 60%–80% of all students could correctly answer basic magnitude and direction comparison questions about arrows on a grid."
- **Nguyen and Meltzer: confusion over tip-to-tail and parallelogram rules**
  - Source: Table of Contents. https://physicseducation.net/docs/ISU_PERG_Collected_Papers.pdf
  - Quote: "Many students are confused about the tip- to-tail and parallelogram addition rules."
- **Nguyen and Meltzer: the idea that a vector may be moved without changing it**
  - Source: Table of Contents. https://physicseducation.net/docs/ISU_PERG_Collected_Papers.pdf
  - Quote: "It seemed to us that many of the students’ errors could perhaps be traced to a single general misunderstanding, that is, of the concept that vectors may be moved in space in order to combine them as long as their magnitudes and di- rections are exactly preserved."
- **Nguyen and Meltzer: students' feel for adding comes from forces**
  - Source: Table of Contents. https://physicseducation.net/docs/ISU_PERG_Collected_Papers.pdf
  - Quote: "Many students had an intuitive feel for how vectors should add which, it was clear, was based on their experience with forces."
- **Heckler and Scaife: 33% added the magnitudes in the arrow format**
  - Source: Adding and subtracting vectors: The problem with the arrow representation | Phys. Rev. ST Phys. Educ. Res.. https://link.aps.org/doi/10.1103/PhysRevSTPER.11.010101
  - Quote: "for the two-dimensional net force comparison question (Fig. 6 ), 33% of students in the arrow condition simply added the magnitudes of all of the vectors regardless of direction, 10% incorrectly argued that the net force is zero in both cases because the “forces cancel,” and about 20% had miscellaneous incorrect reasoning, such as an incorrect application of the Pythagorean theorem to find a net force."
- **Pearson Edexcel A level Physics 2021 report: velocities added instead of subtracted**
  - Source: GCE. https://qualifications.pearson.com/content/dam/pdf/A-Level/Physics/2015/Exam-materials/9PH0_01_pef_20211216.pdf
  - Quote: "A number of answers showed the addition of the two velocity vectors rather than the difference."
- **Electronics Tutorials: out-of-phase quantities add by the parallelogram law**
  - Source: Phasor Diagrams and Phasor Algebra used in AC Circuits. https://www.electronics-tutorials.ws/accircuits/phasors.html
  - Quote: "Thus they must be added together using phasor diagrams to determine their Resultant Phasor or Vector Sum by using the _parallelogram law"
- **A Khan Academy learner (SECONDARY: a comment under the FAQ) asks if adding magnitudes works only for parallel vectors**
  - Source: Vectors: FAQ (article) | Vectors | Khan Academy. https://www.khanacademy.org/math/precalculus/x9e81a4f98389efdf:vectors/x9e81a4f98389efdf:vec-models/a/vectors-faq
  - Quote: "In the section that discusses adding and subtracting vectors, it says that you can add or subtract the magnitudes to find the magnitude of the sum or difference. Doesn't this only work when the vectors move in the same direction (i.e. they are parallel)?"
See also 3.3 (MCA resultant and equilibrant, three non-parallel vectors concurrent for equilibrium), 2.2 (Bitesize
resultant, subtracting as adding the reverse).

My reading: the equilibrant is the vector that cancels the resultant (equal and opposite), and "forces in balance"
means the vectors close into a polygon with no gap. The MCA wording "three non-parallel vectors must be concurrent
for equilibrium" is the triangle of forces; I found no page that explains it for beginners in words I could quote.

### 4.4 Scaling and unit vectors; i and j; three dimensions with k
- **Isaac Science: a unit vector is a vector divided by its own length**
  - Source: Vectors – Resolving Vectors – Isaac Science. https://isaacscience.org/concepts/cm_vectors2
  - Quote: "Unit vectors have a modulus = 1 and are useful for indicating a direction."
- **Isaac Science: dividing by length**
  - Source: Vectors – Resolving Vectors – Isaac Science. https://isaacscience.org/concepts/cm_vectors2
  - Quote: "Any finite vector can be made a unit vector by dividing it by its own length, for instance v ​ / v is the unit vector in the direction of v ​ and it has no units."
- **Isaac Science: i, j, k as coordinate axes**
  - Source: Vectors – Resolving Vectors – Isaac Science. https://isaacscience.org/concepts/cm_vectors2
  - Quote: "The coordinate axes are in effect (unit) vectors themselves, conventionally called i ​ ^ ​ , j ​ ^ ​ , . . . (the hat indicating a vector of length 1"
See also 2.3 (SQA Higher: i, j, k as a basis), 3.1 (3-D coordinates, magnitude of a 3-D vector), 2.5 (Bird 22.9).

My reading: the unit vector is the vector with its size taken out, leaving only direction; i, j, k are the unit
vectors along the axes; the 3-D magnitude is Pythagoras twice. Dan's coordinate plane course is two-dimensional, so
the third axis and how to draw it must be taught inline.

### 4.5 Position and displacement vectors; relative velocity
- **Displacement is final position vector minus initial (SECONDARY: a revision site)**
  - Source: Vectors | Year 1 Pure | A Level Maths Revision. https://alevelmathsrevision.com/topic-summary/vectors
  - Quote: "Position vectors locate points relative to the origin, and the displacement from A to B is the position vector of B minus the position vector of A"
- **Physics Classroom: the boat's resultant is the vector sum of boat and river velocity**
  - Source: Physics Tutorial - Vectors and Projectiles - Vectors and their Operations - Relative Velocity and Riverboat Problems. https://www.physicsclassroom.com/tutorial/vectors-and-projectiles/vectors-and-their-operations/relative-velocity-and-riverboat-problems
  - Quote: "The resultant velocity of the boat is the vector sum of the boat velocity and the river velocity."
- **K12 LibreTexts: perpendicular vectors have no effect on each other**
  - Source: 1.6: Vector Addition - K12 LibreTexts. https://k12.libretexts.org/Bookshelves/Science_and_Technology/Physics/01%3A_Introduction_To_Physics/1.06%3A_Vector_Addition
  - Quote: "Perpendicular vectors have NO effect on each other."
- **OpenStax: a boat crossing a river**
  - Source: 3.5 Addition of Velocities - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/3-5-addition-of-velocities
  - Quote: "A boat is trying to cross a river. Due to the velocity of the river the path traveled by the boat is diagonal."
See also 7.5 (tidal triangle, manoeuvring board, target motion analysis), 2.2 (Bitesize Position vectors), 2.5 (Bird
22.8 "Relative velocity"), 1.1 (Brilliant level 6).

My reading: displacement is "where you ended up minus where you started", which is why AB = b - a; relative velocity
is the same subtraction done to velocities. The boat across a current is the standard case and the two components
(across the water, along the current) do not interfere with each other.

### 4.6 The dot product: projection, angle, work, true power
- **Isaac Science: work is force along the displacement, the dot product, a scalar**
  - Source: Vectors – Resolving Vectors – Isaac Science. https://isaacscience.org/concepts/cm_vectors2
  - Quote: "This is the _scalar_ or _dot_ product of the force, F ​ and displacement, r ​ . The name gives us the clue that the result of this product is a scalar quantity"
- **Isaac Science: only the part of the force along the motion does work**
  - Source: Vectors – Resolving Vectors – Isaac Science. https://isaacscience.org/concepts/cm_vectors2
  - Quote: "Work is done only in the direction of the displacement; it is the _magnitude_ of the force in the direction r ​ that has caused the object to move."
- **Isaac Science: perpendicular vectors have a zero dot product**
  - Source: Vectors – Resolving Vectors – Isaac Science. https://isaacscience.org/concepts/cm_vectors2
  - Quote: "The dot product of perpendicular vectors is zero (consider the projection of x ​ on to"
- **Zavala and Barniol: how students read the dot product**
  - Source: Slide 1. https://www.per-central.org/perc/2010/files/componentsposterperc.pdf
  - Quote: "23% interpret the dot product as a vector. One third of these students relate the dot product with the sum vector, another third with a bisector vector"
- **Zavala and Barniol: very few give the projection reading**
  - Source: Slide 1. https://www.per-central.org/perc/2010/files/componentsposterperc.pdf
  - Quote: "only 4% mention explicitly in their rationale that the dot product is the projection of one vector onto a second vector multiplied by the magnitude of the second vector, giving a completely adequate interpretation."
- **Zavala and Barniol: sine used for the dot product**
  - Source: Slide 1. https://www.per-central.org/perc/2010/files/componentsposterperc.pdf
  - Quote: "The most common error (10%) was to use | A || B |Sinθ instead."
- **AC Electrical 101: real power cannot be got by multiplying phasors**
  - Source: AC Electrical 101+ Part I. https://cdn11.bigcommerce.com/s-die3xeedyr/content/Correspondence_Courses/AC_Electrical_101_Part_I/538-AC-Electrical-101-Part-I.pdf
  - Quote: "It is important to realize that the real power cannot be obtained by multiplying phasors. Doing so results in the addition of the voltage and current angles when the difference is required."
See also 2.2 (Bitesize: the scalar product's main use is the angle) and 7.3 (power factor and V I cos phi).

My reading: the dot product is "how much of one vector lies along the other, times the other's length", which is why
it is zero at 90 degrees, a maximum at 0 degrees, and why only the part of a force along the movement does work. The
link to true power: P = V I cos(phi) is the product of the two sizes and the cosine of the angle between the voltage
and current phasors. I did not find a page that says "this is the dot product of the phasors" in so many words, so
that wording is **UNCONFIRMED**; the Tennessee lab sheet in 4.8 says the dot product is one of the vector operations
you cannot apply to phasors to get other phasors, which fits (the dot product gives a plain number, and power is a
plain number).

### 4.7 The cross product: moments, torque, the right-hand rule, force on a conductor
- **Kustusch: cross-product direction is particularly poor, misapplied right-hand rules**
  - Source: Assessing the impact of representational and contextual problem features on student use of right-hand rules. https://journals.aps.org/prper/abstract/10.1103/PhysRevPhysEducRes.12.010102
  - Quote: "Performance on problems about cross product direction is particularly poor and some research suggests that this may be primarily due to misapplied right-hand rules."
- **Kustusch: turning the paper helps**
  - Source: Assessing the impact of representational and contextual problem features on student use of right-hand rules. https://journals.aps.org/prper/abstract/10.1103/PhysRevPhysEducRes.12.010102
  - Quote: "revealing that the use of supplemental methods, such as physically rotating the paper, can mitigate errors associated with certain features."
- **Zavala and Barniol: cross product size right, direction missing**
  - Source: Slide 1. https://www.per-central.org/perc/2010/files/componentsposterperc.pdf
  - Quote: "69% of students (the three first responses of Table 4) follow the correct procedure to calculate the magnitude of the cross product. However, 32% of them do not identify the direction of the resultant vector. It seems that these students have problems with distinguishing the difference between the cross product and its magnitude."
- **Zavala and Barniol: cos used for the cross product**
  - Source: Slide 1. https://www.per-central.org/perc/2010/files/componentsposterperc.pdf
  - Quote: "14% incorrectly use | A || B |cosθ instead of the correct equation."
- **Zavala and Barniol: the scalar nature of one product and the vector nature of the other**
  - Source: Slide 1. https://www.per-central.org/perc/2010/files/componentsposterperc.pdf
  - Quote: "Also, they have serious difficulties in interpreting the scalar nature of the dot product and the vector nature of the cross product."
See also 7.1 and 7.2 (moments, motor force), 2.1 (Khan LA dot and cross products), 2.4 (HELM 9.4), 2.5 (Bird 24.3).

My reading: of the benchmarks only the engineering and university ones (HELM, Bird, Khan LA) teach it; SQA HN
Engineering Mathematics 1 does not name it. It earns its place for Dan because moments (MCA Applied Mechanics 2.1)
and the motor force (Dan's Motors course) are cross products: a size equal to the two sizes times the sine of the
angle between them, and a direction at right angles to both.

### 4.8 Vectors and phasors: what they share, where they differ; three-phase quantities
- **University of Tennessee lab sheet: what a phasor shares with a vector and what it does not**
  - Source: 4 AC Circuits Phasors, Impedance and Transformers. https://web.eecs.utk.edu/~mjr/ECE202/Labs/Lab%204.pdf
  - Quote: "Phasors have magnitude and angle. Therefore one might think that a phasor is a vector. Phasors and vectors share some qualities but not others. We cannot apply curl, divergence, and dot product to phasore and get other phasors. A phasor is a complex number that represents the magnitude and phase of a voltage or a current. We can add phasor voltages and phasor currents graphically. We do this exactly the same as if we were adding vectors."
- **Swarthmore (Cheever): a phasor is a vector in the complex plane, and frequency is left out**
  - Source: Linear Physical Systems - Erik Cheever. https://lpsa.swarthmore.edu/BackGround/phasor/phasor.html
  - Quote: "A sinusoidal signal f(t)=A·cos(ωt+θ) can be represented by a phasor F =Ae jθ , which is a vector in the complex plane with length A, and an angle θ measured in the counterclockwise"
- **Swarthmore (Cheever): frequency is implicit**
  - Source: Linear Physical Systems - Erik Cheever. https://lpsa.swarthmore.edu/BackGround/phasor/phasor.html
  - Quote: "Note that frequency (ω) is not included, but is implicit in the concept of a phasor."
- **MIT 6.200 notes: a phasor is a complex coordinate, named in analogy to a vector**
  - Source: 6.200 Supplementary Notes: Math of Complex Numbers and Sinusoidal Functions. https://circuits.mit.edu/_static/S23/handouts/lec08b/complex_and_sinusoidal_math.pdf
  - Quote: "The complex coordinate is called a “phasor” in analogy to a vector."
- **Electrical Engineering Stack Exchange (SECONDARY: community answer): a phasor is a static complex constant**
  - Source: pwm - Phasor vs Vector vs Space Vector - Electrical Engineering Stack Exchange. https://electronics.stackexchange.com/questions/420569/phasor-vs-vector-vs-space-vector
  - Quote: "A phasor, \\$V e^{j \\theta}\\$, is not a rotating thing. It is static, a complex constant (number)."
- **Electrical Engineering Stack Exchange (SECONDARY): you can divide phasors but not vectors**
  - Source: pwm - Phasor vs Vector vs Space Vector - Electrical Engineering Stack Exchange. https://electronics.stackexchange.com/questions/420569/phasor-vs-vector-vs-space-vector
  - Quote: "you can divide phasors but can't divide vectors, for example."
- **Physics Stack Exchange (SECONDARY): rotating vectors, but not vectors themselves**
  - Source: electric circuits - What exactly is a phasor? - Physics Stack Exchange. https://physics.stackexchange.com/questions/281085/what-exactly-is-a-phasor
  - Quote: "Though voltage and current in an AC circuit are represented by phasors-rotating vectors, they are not vectors themselves."
- **Electronics Tutorials: phasors and rotating vectors, same frequency only**
  - Source: Phasor Diagrams and Phasor Algebra used in AC Circuits. https://www.electronics-tutorials.ws/accircuits/phasors.html
  - Quote: "Sinusoids of different frequencies cannot be represented on the same phasor diagram due to the different speed of the vectors. At any instant in time the phase angle between them will be different."
- **Electronics Tutorials: balanced three-phase phasors sum to zero**
  - Source: Phasor Diagrams and Phasor Algebra used in AC Circuits. https://www.electronics-tutorials.ws/accircuits/phasors.html
  - Quote: "in a set of balanced three phase voltages their phasor sum will always be zero as: V a + V b + V c = 0."
- **Electronics Tutorials: phasor subtraction is the other diagonal of the parallelogram**
  - Source: Phasor Diagrams and Phasor Algebra used in AC Circuits. https://www.electronics-tutorials.ws/accircuits/phasors.html
  - Quote: "Phasor subtraction is very similar to the above rectangular method of addition, except this time the vector difference is the other diagonal of the parallelogram between the two voltages of V1 and V2"
- **Electronics Tutorials: it says a phasor's size is the rms value where a vector's is the peak**
  - Source: Phasor Diagrams and Phasor Algebra used in AC Circuits. https://www.electronics-tutorials.ws/accircuits/phasors.html
  - Quote: "a vectors magnitude is the “peak value” of the sinusoid, while a phasors complex magnitude is the “rms value” of the sinusoid. In both cases the phase angle, direction and angular velocity remains the same."
- **Rose-Hulman power notes: phasors can be written in peak or in rms**
  - Source: lecture 4 outline - power.PDF. https://www.rose-hulman.edu/class/ee/HTML/NSF/CCLI_EMD_DUE_0088904/PDFS/lecture_notes_04.pdf
  - Quote: "Phasors with magnitude in peak value _V_ p = Vp∠ θv _I_ p = Ip∠ θi ### Phasors in rms"
- **Bird 9th ed.: adding alternating waveforms by drawing, rules, components and complex numbers**
  - Source: Bird’s Higher Engineering Mathematics; Ninth Edition. https://api.pageplace.de/preview/DT0400.9781000353037_A40491166/preview-9781000353037_A40491166.pdf
  - Quote: "23 Methods of adding alternating waveforms 301 23.1 Combination of two periodic functions 301 23.2 Plotting periodic functions 302 23.3 Determining resultant phasors by drawing 303 23.4 Determining resultant phasors by the sine and cosine rules 305 23.5 Determining resultant phasors by horizontal and vertical components 306 23.6 Determining resultant phasors by using complex numbers 308"
See also 7.4 (three-phase line voltage as a phasor difference), 3.3 (MCA Marine Electro-Technology phasor lines),
3.2 (Pearson 4049, 4002 assignment).

My reading:
- Shared with a vector: a size and an angle; the arrow picture; adding and subtracting by the parallelogram or by
  components; resolving into two parts at right angles (real and imaginary, or active and reactive).
- Where a phasor differs: it stands for a quantity that changes in time, not a push in space; the picture is
  "frozen" at one moment and the angle is a time shift (phase); it is a complex number, so it can also be multiplied
  and divided (j turns it a quarter turn) where a vector cannot; every phasor on one diagram must have the same
  frequency; and the dot product of two phasors is not another phasor.
- Contested point, to be taught as contested: whether a phasor's length is the peak value or the rms value. One
  tutorial says a vector's size is the peak and a phasor's the rms; a power-systems lecture sheet writes phasors in
  either peak or rms. The brief should pick the convention Dan's AC circuits course used and say so.
- The community answers (Stack Exchange) are **SECONDARY** and are used only for the wording of the distinction.

---

## 5. Prerequisites

- Brilliant: basic algebraic expressions and right-triangle trigonometry (1.1).
- SQA HN: good algebraic skills, transposing engineering formulae and solving simple trigonometric equations (3.1).
- Pearson: a diagnostic maths check and GCSE grade 4 (quoted in 3.2).
- MCA Second Engineer Mathematics 5.1 lists the sine and cosine rules (3.3).

My reading, with what Dan has (from the repo):
- Has: right-triangle trig, inverse trig, the unit circle, quadrants and signs (Trigonometry); Pythagoras and
  distances (Geometry fundamentals, The coordinate plane); transposing formulae (Solving equations); j, polar and
  rectangular form, the Argand diagram (Complex numbers); phasors, impedance, three-phase line and phase (AC
  circuits); torque and the motor force as ideas (Motors); the derivative of a position as velocity (Calculus).
- Must be taught inline: what a vector is as an object (scalar against vector), arrows and notation, a free vector
  that can slide; the polygon of vectors and the resultant; the third axis and 3-D magnitude; the dot product as a
  projection; the cross product, handedness and the right-hand rule; and the phasor-versus-vector distinction.
- Deferred, with where it goes: linear combinations, span, linear independence, lines and planes, and vectors as
  transformations to Matrices and Linear algebra; fields, gradient, divergence and curl to Vector calculus; vector
  derivatives (velocity and acceleration as derivatives of position) to Vector calculus or Differential equations.

---

## 6. Misconceptions and learning science for each skill

Two strongest sources: Heckler and Scaife (2015, Phys. Rev. ST Phys. Educ. Res.) for adding and subtracting and for
how representations change what students do; Zavala and Barniol (2010) for components and for the dot and cross
products. Nguyen and Meltzer (2003, Am. J. Phys.) is the classic base. All three are physics-education research on
university students; none is on electricians. That Dan will behave the same way is **UNCONFIRMED** (my reading: the
errors are about the mathematics, so likely).
- **Heckler and Scaife: the size of the study**
  - Source: ERIC - EJ1057093 - Adding and Subtracting Vectors: The Problem with the Arrow Representation, Physical Review Special Topics - Physics Education Research, 2015. https://eric.ed.gov/?id=EJ1057093
  - Quote: "In a series of experiments involving over 1000 students and several semesters"
- **Zavala and Barniol: the size of the study**
  - Source: Slide 1. https://www.per-central.org/perc/2010/files/componentsposterperc.pdf
  - Quote: "We administered a test to 409 students completing introductory physics courses at a private Mexican university."

### 6.1 Adding: the size of a sum is not the sum of the sizes
See 4.3 for the Nguyen and Meltzer, Heckler and Scaife, and Edexcel findings. The tip-to-tail and parallelogram
confusion, the idea that a vector can be moved without changing it, and a feel for adding that comes from forces are
all in 4.3.

### 6.2 Subtracting
- **Heckler and Scaife: subtraction errors were adding**
  - Source: Adding and subtracting vectors: The problem with the arrow representation | Phys. Rev. ST Phys. Educ. Res.. https://link.aps.org/doi/10.1103/PhysRevSTPER.11.010101
  - Quote: "A closer examination of the subtraction responses revealed that most errors were the result of effectively adding the two vectors instead of subtracting them."
- **Heckler and Scaife: the two commonest subtraction errors (a sign slip, and adding instead)**
  - Source: Adding and subtracting vectors: The problem with the arrow representation | Phys. Rev. ST Phys. Educ. Res.. https://link.aps.org/doi/10.1103/PhysRevSTPER.11.010101
  - Quote: "(a) Overall sign error. About 10%–20% of students responded with an overall sign error. Responses and follow-up interviews indicated that this appeared to result from either a confusion about or lack of attention to which sense the arrow should point. * (b) Add instead of subtract. About 10%–15% of students added the vectors (in both dimensions), even in a task in which they are asked to subtract."

### 6.3 Components (see 4.2), the dot product (4.6), the cross product (4.7), phasors (4.8)
Quoted where they belong. Compressed: the component is shorter than the vector (and some think it is the same
length); sine and cosine are swapped when the angle is measured from the other axis; the dot product is read as a
vector; sine is used for the dot product and cosine for the cross product; the cross product's direction is left
out; real power is "got" by multiplying phasors.

### 6.4 Forces, components and balance
- **Aviani and others: components taught as separate forces**
  - Source: Drawing and using free body diagrams: Why it may be better not to decompose forces | Phys. Rev. ST Phys. Educ. Res.. https://journals.aps.org/prper/abstract/10.1103/PhysRevSTPER.11.020137
  - Quote: "Students from the control group (SG) more often exhibited the misconception that forces and their components act on a body independently and simultaneously."
- **Aviani and others: resolving into components may not build the idea of force**
  - Source: Drawing and using free body diagrams: Why it may be better not to decompose forces | Phys. Rev. ST Phys. Educ. Res.. https://journals.aps.org/prper/abstract/10.1103/PhysRevSTPER.11.020137
  - Quote: "Our results support the idea that the practice of resolving forces into the components may not be the most effective way to develop understanding of Newton’s laws and the concept of force."
- **Heckler and Scaife: opposing arrows seen as competing forces**
  - Source: Adding and subtracting vectors: The problem with the arrow representation | Phys. Rev. ST Phys. Educ. Res.. https://link.aps.org/doi/10.1103/PhysRevSTPER.11.010101
  - Quote: "students often picture opposing arrows as “competing” and, regardless of the assigned task, will simply tally the result of two opposing"
My reading: teach the resolved parts as a calculating device, one vector drawn two ways, never as two extra pushes.

### 6.5 How to teach it: representations, practice and context
- **Heckler and Scaife: the ijk format beat the arrow format**
  - Source: ERIC - EJ1057093 - Adding and Subtracting Vectors: The Problem with the Arrow Representation, Physical Review Special Topics - Physics Education Research, 2015. https://eric.ed.gov/?id=EJ1057093
  - Quote: "Most importantly, we found that average performance in the "ijk" format was typically excellent and often much better than performance in the arrow format"
- **Heckler and Scaife: arrows cue spatial reasoning, numbers cue calculation**
  - Source: Adding and subtracting vectors: The problem with the arrow representation | Phys. Rev. ST Phys. Educ. Res.. https://link.aps.org/doi/10.1103/PhysRevSTPER.11.010101
  - Quote: "Perhaps as expected, the arrow format tends to prompt more spatial-intuitive reasoning and the format prompts more numeric-algebraic calculations."
- **Heckler and Scaife: a formal route through components may need to be learned**
  - Source: Adding and subtracting vectors: The problem with the arrow representation | Phys. Rev. ST Phys. Educ. Res.. https://link.aps.org/doi/10.1103/PhysRevSTPER.11.010101
  - Quote: "many students do not spontaneously compute in the arrow format correctly, and familiarity with _some_ formal, nonobvious solution path may be necessary, such as the explicit decomposition of the vector into components and subsequent familiar math operations such as subtraction of numbers, which the"
- **Heckler and Scaife: different arrow layouts cue different mistakes, so vary them**
  - Source: Adding and subtracting vectors: The problem with the arrow representation | Phys. Rev. ST Phys. Educ. Res.. https://link.aps.org/doi/10.1103/PhysRevSTPER.11.010101
  - Quote: "which suggests that students need to practice with a variety of relative orientations."
- **Heckler and Scaife: one-dimensional practice is not enough**
  - Source: Adding and subtracting vectors: The problem with the arrow representation | Phys. Rev. ST Phys. Educ. Res.. https://link.aps.org/doi/10.1103/PhysRevSTPER.11.010101
  - Quote: "This is a clear indication that if instruction and practice only include one-dimensional tasks, students will not be able to practice and overcome important difficulties found in two-dimensional tasks that are not simple extensions of multiple one-dimensional tasks, especially in the arrow format."
- **Heckler and Scaife on Van Deventer and Wittmann: context can help with signs**
  - Source: untitled. https://journals.aps.org/prper/pdf/10.1103/PhysRevSTPER.11.010101
  - Quote: "In contrast, Van Deventer and Wittmann [4] found that students did better in the physics (50% correct) compared to the math context (20% correct) for one- dimensional subtraction, because students One could compare the arrow representation and its attendant advantages and disadvan- tages with, for example, the algebraic representation using unit vectors ( ˆ i, ˆ j, ˆk), which is sometimes used better (65% correct) in the generic math context compared to the physics context of acceleration (45% correct). student understanding of critical aspects of vectors and vector addition and subtraction in a generic math format as well as in simple physics contexts by investigating student responses to questions tended to use the physical context to obtain the correct signs."
- **Van Deventer and Wittmann: worse in a physical context than a mathematical one in earlier work**
  - Source: Comparing Student Use of Mathematical and Physical Vector Representations. https://psrc.aapt.org/items/detail.cfm?ID=9110&Attached=1
  - Quote: "students have been shown to perform worse on a vector task with a physical context when compared to the same task in a mathematical context."
My reading: pair the arrow with the numbers on the same screen and let Dan move one and see the other; vary the
layouts (aligned, opposed, tail to tail, separated) and use two-dimensional cases from the start; use contexts he
knows (a boat on a tide, a force on a bar, phase voltages) because context sometimes supplies the signs (Van Deventer
and Wittmann, as reported by Heckler and Scaife) but can also hurt (the earlier work their abstract builds on); the
evidence on context is mixed; and ask him to predict before
he computes. The last is my reading of the diagrams and "draw it first" findings; I found no vector-specific source
that tests prediction, so that is **UNCONFIRMED**.

### 6.6 Examiners and exam-board advice
- **SQA National 5 2025 course report: few drew the resultant**
  - Source: National 5 Mathematics 2025 course report. https://www.sqa.org.uk/sqa/files_ccc/2025-n5-course-report-mathematics.pdf
  - Quote: "Many candidates found the resultant vector in component form and achieved 1 mark. ### However, few candidates correctly drew the resultant vector."
- **SQA Higher 2025 course report (SECONDARY: a past-paper site's copy)**
  - Source: Higher Mathematics 2025 course report. https://higher.scotpapers.com/maths/reports/H_Maths_2025_Course_Report.pdf
  - Quote: "A few candidates attempted to find a ‘gradient of a vector’."
- **OCR: mastery is visualising and presenting, not formulas**
  - Source: A Level Maths: examiner insight on vectors. https://www.ocr.org.uk/blog/a-level-maths-examiner-insight-on-vectors
  - Quote: "Mastering vectors isn’t about memorising formulas – it’s about visualising problems and presenting your work clearly."
- **OCR: students who drew diagrams made fewer mistakes**
  - Source: A Level Maths: examiner insight on vectors. https://www.ocr.org.uk/blog/a-level-maths-examiner-insight-on-vectors
  - Quote: "Examiners often note that students who draw clear diagrams make fewer mistakes and generally score higher."
- **A tutoring site (SECONDARY): pitfalls to avoid**
  - Source: Vectors – IGCSE Maths Guide with Examples. https://igcsemathstutor.com/vectors-igcse-maths
  - Quote: "Mixing up the order of components (accidentally writing \\( (y, x) \\)). * Adding magnitudes instead of adding components. * Forgetting that a negative scalar reverses direction."
- **A revision site (SECONDARY): AB and BA have opposite signs; magnitude by Pythagoras not by adding**
  - Source: Vectors | Year 1 Pure | A Level Maths Revision. https://alevelmathsrevision.com/topic-summary/vectors
  - Quote: "vectors A B and B A have opposite signs — direction matters; for parallel vectors, one is a scalar multiple of the other (so a = k b for some k ), but the vectors do NOT need to be unit length; the magnitude is found using Pythagoras on the components, not by adding them"
The tutoring and revision sites in this list are **SECONDARY**; the Higher report is a past-paper site's copy of
SQA's report (**SECONDARY**). I did not find an NCTM or AQA examiner report for the vector pieces; the AQA AS Physics
report in 4.2 is a copy on a tutoring site, and the Pearson Edexcel reports in 4.1 and 4.3 are Pearson's own.
Bitesize's pages have no "common mistakes" box that I saw (**UNCONFIRMED**).

---

## 7. Where it is used, for an electrician going into marine engineering

### 7.1 Statics and moments (marine engineering)
See 3.3 (MCA Applied Mechanics 2.1: recalls a moment of force, states the principle of moments, resolves oblique
forces; General Engineering Science I: define equilibrium and the principle of moments).
- **Engineering statics text: a moment is a vector, with dot and cross products**
  - Source: Statics: Moment of Force. https://engineeringstatics.org/moment-of-force.html
  - Quote: "Moments are vector quantities, so they have magnitude and direction and obey all the rules of vector arithmetic, even dot and cross products"
- **Engineering statics text: r cross F gives the moment, with a hand rule**
  - Source: Statics: Moment of Force. https://engineeringstatics.org/moment-of-force.html
  - Quote: "Taking the cross product r x F results in M"
- **Engineering Statics text: what a moment is**
  - Source: 1.6: Torque/Moment - Engineering LibreTexts. https://eng.libretexts.org/Bookshelves/Mechanical_Engineering/Engineering_Mechanics_-_Statics_(Osgood_Cameron_and_Christensen)/01%3A_Fundamental_Concepts/1.06%3A_Torque_Moment
  - Quote: "A moment (sometimes called a torque) is defined as the “tendency of a force to rotate a body”."

### 7.2 Motors and the force on a conductor
- **BBC Bitesize: the motor-effect force is perpendicular to both current and field**
  - Source: How do magnetic fields interact to produce the motor effect? - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zgr73qt
  - Quote: "A current-carrying conductor (e.g. a wire) in a magnetic field will experience a force . * The force is perpendicular to the direction of both the current and the magnetic field."
- **BBC Bitesize: no force when current and field are parallel**
  - Source: Fleming's left-hand rule - Electromagnets (Higher) - Edexcel - GCSE Physics (Single Science) Revision - Edexcel - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z3638mn/revision/2
  - Quote: "There is no motor effect force if the current and magnetic field are parallel to each other."
- **OpenStax College Physics: force on a wire, F = IlB sin theta, direction by hand rule**
  - Source: Magnetic Force on a Current-Carrying Conductor | Physics. https://courses.lumenlearning.com/suny-physics/chapter/22-7-magnetic-force-on-a-current-carrying-conductor
  - Quote: "The force on a current-carrying wire in a magnetic field is _F_ = _IlB_ sin _θ_ . Its direction is given by RHR-1."
- **Nidec (motor maker): the left-hand rule gives direction, the BLI law the size**
  - Source: Fleming’s law | NIDEC CORPORATION. https://www.nidec.com/en/technology/motor/glossary/item/fleming_law
  - Quote: "The left-hand rule gives the direction of the force generated on the conductor when it passes an electric current, the quantity of the force is given by the BLI law."

### 7.3 Power and power factor
- **University of Louisville: real power is not just V times I, it carries cos of the angle**
  - Source: ECE220 Lesson 12. https://engineering.louisville.edu/raise/EE220/L12.html
  - Quote: "it should not be surprising that the power P is not just the product of V (the rms voltage) and I (the rms current). In fact, this is the relationship: P = EIcosθ watts"
- **ABB: power factor is the cosine of the angle between voltage and current**
  - Source: Introduction to power factor What is it and why should we care?. https://library.e.abb.com/public/aad7906d69854d018d2790e84a8aa9b5/Technical_Note_174_+IntroductionToPowerFactor.pdf?x-sign=JFVS3Ur%2FWEyJewcen4Ml%2F9dVXzsc2T4DbXyqtHPc3cfkctUU0WEF49gzDcrEb4Wr
  - Quote: "Power factor (PF) is defined as the cosine of the phase angle between voltage and current in an AC circuit."
- **Moffat (MIT-style power notes): real power comes from the part of the current in step with the voltage**
  - Source: Introduction to Electric Power Systems Review Lecture. https://www.keithmoffat.com/IntrEPS/IntrEPS_ReviewLecture.pdf
  - Quote: "Any current wave can be decomposed into a current wave that is in phase with the corresponding voltage wave, and a current wave that is orthogonal (ninety degrees out of phase) with the voltage wave."

### 7.4 Three-phase systems
- **eeeguide: star line voltage is the phasor difference of two phase voltages**
  - Source: Voltage, Current and Power in 3 Phase Star Connection. https://www.eeeguide.com/3-phase-star-connection
  - Quote: "From Fig. 9.22, considering the lines R, Y and R, the line voltage V RY is equal to the phasor sum of V RN and V NY which is also equal to the phasor difference"
- **eeeguide: line voltage is root 3 times phase voltage and 30 degrees ahead**
  - Source: Voltage, Current and Power in 3 Phase Star Connection. https://www.eeeguide.com/3-phase-star-connection
  - Quote: "Line voltage = √3 V Ph * All line voltages are equal in magnitude and are displaced by 120°, and * All line voltages are 30° ahead of their respective phase voltages"
- **Texas Instruments power engineering book: line-to-line voltage as the phasor difference**
  - Source: Power Engineering. https://education.ti.com/-/media/45712866D0DE4F1E8D8F7818CACC3307
  - Quote: "Each line-to-line voltage is expressed as the phasor difference of the two adjacent phase"

### 7.5 Steam turbines, mechanisms, and navigation
See 3.3 (Applied Heat 8.1: velocity vector diagrams over a turbine blade) and 3.2 (Pearson 4008: vector diagrams of
velocities and accelerations in planar mechanisms).
- **Practical Boat Owner (RYA exam advice): tidal triangles need the tidal vector**
  - Source: Understanding tidal streams and heights - Practical Boat Owner. https://www.pbo.co.uk/seamanship/understanding-tidal-streams-and-heights-95506
  - Quote: "The exam will nearly always include an estimated position or course to steer. Without an accurate tidal stream, these triangles don’t work at all."
- **Practical Boat Owner: the common course-to-steer mistake**
  - Source: Understanding tidal streams and heights - Practical Boat Owner. https://www.pbo.co.uk/seamanship/understanding-tidal-streams-and-heights-95506
  - Quote: "Revise the course to steer: a surprising number of candidates ‘join the dots’ – connecting the end of the tidal vector to the destination."
- **US Naval Institute: the speed triangle on a manoeuvring board**
  - Source: Chapter 11 - The Maneuvering Board | U.S. Naval Institute. https://www.usni.org/press/books/online/naval-science-3-3rd-edition-2022/naval-skills-unit-4-rules-road-and-0
  - Quote: "The speed triangle consists of your own vessel’s actual course and speed vector (er), the target (maneuveri ng) vessel's relative course and speed vector (rm), and the target vessel’s actual course and speed vector (em)."
- **Nautical Institute: true and relative motion**
  - Source: Collision course. https://www.nautinst.org/resources-page/collision-course.html
  - Quote: "Radar and AIS data can only be used safely if there is a good understanding of both true and relative motion. Poor understanding can result in a major collision!"
- **Naval Submarine League: target motion analysis**
  - Source: TARGET MOTION ANALYSIS INNOVATIONS BY NAVAL OFFICERS - NSL Archive. https://archive.navalsubleague.org/1991/target-motion-analysis-innovations-by-naval-officers
  - Quote: "TMA is estimation of a target’s position, course, and speed."

My reading: the uses that matter most to Dan, in order: MCA statics and resultant/equilibrant (the exam he will
meet), the force on a conductor and moments (motors, shafts), true power and the three-phase line voltage (his
electrical trade), then the tidal triangle and relative-motion plot (a submariner's vocabulary). Submarine and nuclear
propulsion syllabi that name vectors were not found (**UNCONFIRMED**); the target-motion-analysis page is a naval
history article, not a syllabus. The naval-science pages are American and the tidal advice is for yachtsmen: they
show the method, not Royal Navy practice.

---

## 8. Size: how many lessons the benchmarks spend, and which core supports 7 lessons

- Brilliant Vectors: 39 lessons in 8 levels, two-dimensional only (1.1). Brilliant Matrices: 43.
- Khan Precalculus Unit 6: 10 skills plus 3 quizzes and a unit test (2.1); Khan Linear algebra Unit 1 spends 7
  vector lessons, then linear combinations, independence, subspaces, then 13 on dot and cross products and planes.
- Bitesize Higher: 2 guides, 5 pages in all; Bitesize National 5: 1 guide, 3 pages (2.2).
- HELM Workbook 9: 66 pages, 5 sections (2.4).
- Bird: 3 chapters (2.5).
- SQA HN Engineering Mathematics 1: 14 of 40 hours, shared with complex numbers (3.1).
- Pearson 4002: LO3 shares vectors with sine waves (3.2).

My reading of a 7-lesson core, using the sources that match Dan's exams and trade rather than Brilliant's linear
algebra path:
1. What a vector is: size and direction, scalar against vector, arrows and notation, equal and opposite, scaling by a
   number (Brilliant 1, 3; Bitesize; SQA; HELM 9.1).
2. Components and resolving with sin and cos, both ways (Brilliant 4, 5; Khan; HELM 9.2; MCA).
3. Adding and subtracting: nose to tail, parallelogram, by components; the resultant and the equilibrant; forces in
   balance (Brilliant 1, 2; MCA; Bird 22).
4. Position and displacement, relative velocity: a boat across a current (Brilliant 6; Bird 22.8; tidal triangle).
5. i, j and k and three dimensions: unit vectors, magnitude in 3-D (Bitesize Higher; SQA; Bird 22.9).
6. The dot product: projection, the angle, work, and true power as V I cos phi (Brilliant 7, 8; SQA; HELM 9.3; Bird 24).
7. The cross product, then vectors and phasors: moments, torque, the motor force, then what a phasor shares with a
   vector, and the three-phase line voltage (HELM 9.4; Bird 23, 24; MCA).
Left out: linear combinations, interpolation, span (Matrices, Linear algebra); lines and planes (Linear algebra);
fields, div, curl (Vector calculus). If the cross product and phasors need a lesson each, lessons 4 and 5 could be
joined.

---

## 9. What I could not confirm

- What happens inside each Brilliant lesson (titles only).
- A Level 3 marine engineering syllabus that names vectors; a Royal Navy (HMS Collingwood or HMS Sultan) maths
  syllabus; any submarine or nuclear-propulsion syllabus that names vectors.
- A document called MCA "Applied Mathematics"; the 2024 Pearson 4002 essential-content list for LO3.
- A page that says "true power is the dot product of voltage and current phasors" in those words.
- An NCTM or AQA examiner report that names a vector mistake; Bitesize "common mistakes" for vectors.
- Any vector-specific study that tests predict-then-compute teaching.
- Whether the SQA and Pearson units quoted are the ones Dan's college uses.
