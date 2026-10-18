# Complex numbers: research notes

Researched 18 Oct 2026 for the Complex numbers course brief (the last course in the Maths shelf's Algebra
folder, after Trigonometry; blurb "The square root of minus one and the plane it opens up: j-notation phasors
in polar form, as AC circuits are written.", from "Brilliant: Complex Numbers and Polar Coordinate Plane").
The brief itself is not written here; these notes are its evidence. Dan is an electrician preparing for marine
engineering college (HNC/HND route). He is assumed to have the courses before this one in the folder (Straight-line
graphs, Linear systems, Powers and roots, Functions and their graphs, Quadratics and polynomials, Exponentials and
logarithms, Trigonometry); no course follows it.

Every finding has its source title, URL and the exact words, copied from a saved tool result by script (the
quotes were not retyped into this file). All of them are listed in `quotes.json` beside this file and were
checked with `node tools/eval/sources.mjs --quotes ... --tools ...` (`failed: 0`). The tool files are in `tools/`.
Findings I could not confirm are marked **UNCONFIRMED**; where only a non-original site said it, **SECONDARY**.
My own readings are marked "My reading" and are not quotes. Mirror and copy sites were avoided; hosts that
republish an original text (LibreTexts, Wikipedia, a college or lab server holding a copy) are marked SECONDARY where used.

How the check sees a page: the app's source checker sees each tool result cut to a fixed size (12 KB for a
search, 20 KB for a fetch, lower-ranked results cut first). A quote is only kept if it is inside that view, so for
the pages that mattered most I fetched them one at a time, or searched again until they came back near the top.
Where a sentence I read in a full PDF fell outside the checker's view, it is listed as UNCONFIRMED and is not in `quotes.json`.

---

## 1. Benchmark: Brilliant's Complex Numbers and Polar Coordinate Plane

The shelf entry names one benchmark, but on Brilliant it is **two courses** that both exist and open on 18 Oct 2026:
**Complex Numbers** (`brilliant.org/courses/complex-plane/`; the address `/courses/complex-numbers/` does not show a course, it
returns the Courses list, which links to `/complex-plane/`) and **Polar Coordinate Plane**
(`brilliant.org/courses/polar-coordinate-plane/`). Together they are 85 lessons, so they are far bigger than the six to eight lessons planned for Dan.

### 1.1 Complex Numbers (50 lessons, 11 levels)


- **Brilliant Complex Numbers is 50 lessons and 877 exercises**
  - Source: Practice Complex Numbers | Brilliant. https://brilliant.org/courses/complex-plane/
  - Quote: "Work with imaginary and complex numbers and the complex plane. 50 Lessons 877 Exercises"

- **Levels 1 to 4: the square root of -1, plotting, adding, distance and scaling, multiplication as rotation**
  - Source: Practice Complex Numbers | Brilliant. https://brilliant.org/courses/complex-plane/
  - Quote: "Level 1 Introducing Complex Numbers The Square Root of -1 Imaginary Numbers Complex Numbers Plotting Complex Numbers Identifying Complex Points Level Check Level 2 Addition and Subtraction Combining Complex Numbers Adding Complex Numbers Subtracting Complex Numbers Level Check Level 3 Distance and Scaling Absolute Value Complex Separation Scalar Multiplication Scaling Magnitudes Level 4 Complex Multiplication Simplifying Expressions Multiplying by i Rotation by Multiplication Multiple Rotations Scaling and Rotating General Multiplication"

- **Levels 5 to 7: conjugates, division, polar form**
  - Source: Practice Complex Numbers | Brilliant. https://brilliant.org/courses/complex-plane/
  - Quote: "Level 5 Complex Conjugates Complex Pairs Finding the Complex Conjugate Adding Conjugates Multiplying Conjugates Functions Re and Im Sum of Two Conjugates Level 6 Complex Division Dividing by i Complex Fractions General Division Level 7 Polar Form Transforming Points Magnitude and Argument Principal Arguments Computing Arguments Using Polar Form"

- **Levels 8 to 11: adding arguments, polar multiplication and division, powers and roots**
  - Source: Practice Complex Numbers | Brilliant. https://brilliant.org/courses/complex-plane/
  - Quote: "Level 8 Adding the Arguments Adding to Multiply Sine of a Sum Cosine of a Sum Comparing Expressions Applying Argument Addition Level 9 Polar Multiplication and Division Multiplying in Polar Form Transforming to Multiply Division in Polar Form Transforming to Divide Polar Conjugates The Product of Conjugates Level 10 Powers and Roots Raising to any Power Powers of Conjugates The Principal Root The Square Root of i Level 11 Multiple Roots Both Square Roots Multiple Roots Roots of 1"

- **Brilliant's description: complex numbers arise as solutions to equations, then the complex plane**
  - Source: Practice Complex Numbers | Brilliant. https://brilliant.org/courses/complex-plane/
  - Quote: "In this course you'll understand how complex numbers arise naturally as solutions to equations. You'll learn to manipulate them according to the usual rules of algebra and derive geometric insights from the complex plane."

- **Brilliant's topics covered**
  - Source: Practice Complex Numbers | Brilliant. https://brilliant.org/courses/complex-plane/
  - Quote: "Topics covered * Complex numbers as solutions to quadratic equations. * Addition and subtraction of complex numbers. * Absolute value and scaling of complex numbers. * Multiplying complex numbers algebraically. * The geometric interpretation of complex multiplication. * Complex conjugates. * Dividing complex numbers. * Complex numbers in polar form. * Powers and roots."

- **Brilliant's prerequisite: cartesian and polar plane, quadratics, basic trigonometry**
  - Source: Practice Complex Numbers | Brilliant. https://brilliant.org/courses/complex-plane/
  - Quote: "Assumes comfort with the cartesian and polar coordinate plane, quadratic equations and basic trigonometry."

My reading of the order: the number first (the square root of −1, then plotting), adding and subtracting, then
absolute value and scaling, then **multiplication as rotation and scaling before conjugates and division** (levels 3 and 4),
then conjugates (5), division (6), and only then polar form (7). Polar multiplication is justified by the sine and cosine of a
sum (8) before it is used (9); powers and roots come last (10, 11). The description says complex numbers "arise naturally as
solutions to equations", which matches the Quadratics course's pointer to this one. It uses i, not j, and the level titles mention no circuits
(the page gives titles only, so what is inside each lesson is **UNCONFIRMED**; I did not see a lesson).

### 1.2 Polar Coordinate Plane (35 lessons, 7 levels)


- **Brilliant Polar Coordinate Plane is 35 lessons and 603 exercises**
  - Source: Practice Polar Coordinate Plane | Brilliant. https://brilliant.org/courses/polar-coordinate-plane
  - Quote: "Learn to describe the world using the language of distance and angle. 35 Lessons 603 Exercises"

- **Polar levels 1 to 4: polar coordinates, gridlines, arc lengths, radians**
  - Source: Practice Polar Coordinate Plane | Brilliant. https://brilliant.org/courses/polar-coordinate-plane
  - Quote: "Level 1 Polar Coordinates Angle and Radius Plotting in Polar Identifying Points Negative Angles Beyond 360° Level Check Level 2 Polar Gridlines Radial Rays Circular Gridlines Annuli and Disks Describing Sectors Selecting Points Identifying Features Level Check Level 3 Arc Lengths Arcs and Arc Length Arc Lengths and Angles Angles from Arc Lengths Level 4 Radians Angles in Radians Plotting with Radians Radian Coordinates Regions with Radians Radian Lines and Sectors"

- **Polar levels 5 to 7: transformations, polar to rectangular, rectangular to polar**
  - Source: Practice Polar Coordinate Plane | Brilliant. https://brilliant.org/courses/polar-coordinate-plane
  - Quote: "Level 5 Transformations Rotating Points Coordinate-Wise Rotation Dilating Points Coordinate-Wise Dilation Combining Transformations Choosing Transformations Level 6 Polar to Rectangular Estimating x and y Plotting on a Cartesian Grid Using Sine and Cosine Plotting with Sine and Cosine Level 7 Rectangular to Polar Estimating Angle Polar From Rectangular Computing Radius and Slope Computing Polar Angle Angles from x and y Computing Polar Coordinates"

- **Polar course description: degrees first, then radians**
  - Source: Practice Polar Coordinate Plane | Brilliant. https://brilliant.org/courses/polar-coordinate-plane
  - Quote: "We'll first learn how the polar coordinate system works using angles in degrees. Next we'll describe features in the coordinate plane in polar terms, before progressing to arclengths and radians as a measurement of angle."

- **Polar course prerequisite**
  - Source: Practice Polar Coordinate Plane | Brilliant. https://brilliant.org/courses/polar-coordinate-plane
  - Quote: "This course assumes familiarity with the coordinate plane, angles and basic algebra."

My reading: this is a separate course about describing a point by distance and angle, in degrees first and radians later, and it ends by
converting polar to rectangular (level 6, using sine and cosine) and rectangular to polar (level 7, estimating the angle, then radius and angle). Dan has the
triangle trigonometry for both conversions from the Trigonometry course; what the Complex course must add is the quadrant care (section 6.3), and the idea of naming a point by length and angle, which Trigonometry uses (the arm round the circle, splitting a force) but does not name as polar coordinates.

### 1.3 Where it sits in Brilliant's path


- **Brilliant's Advanced Algebra band ends Polar Coordinate Plane then Complex Numbers**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "GR 11–12 Trigonometric Functions GR 11–12 Polynomials New GR 11–12 Equations and Curves New GR 11–12 Logarithms GR 12 Polar Coordinate Plane GR 11–12 Complex Numbers"

- **Brilliant's Intermediate Algebra band before it**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "GR 8–9 Introduction to Functions GR 8–9 Linear Systems New GR 9 Quadratics GR 8–9 Coordinate Transformations GR 9–10 Exponential Functions"

- **Brilliant's description of the Advanced Algebra band**
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "Study the functions and graphs of later high school courses like Algebra 2, Integrated Math 2 and 3, and Precalculus"

- **Brilliant help page places Complex Numbers with Algebra II and precalculus**
  - Source: What math does Brilliant cover? | Brilliant. https://brilliant.org/help/courses-and-curriculum/what-math-does-brilliant-cover/
  - Quote: "Algebra II and precalculus | Quadratics , Exponential Functions , Logarithms , Trigonometric Functions , Polar Coordinate Plane , Complex Numbers , Polynomials , Equations and Curves , Vectors , and Matrices | Grades 9–12"

My reading: Polar Coordinate Plane and Complex Numbers are the last two courses of Brilliant's Advanced Algebra band (grades 11 to 12),
after Trigonometric Functions, Polynomials, Equations and Curves and Logarithms. Brilliant's own order puts polar coordinates first and complex numbers last, and the Complex course
assumes both the polar plane and basic trigonometry. Dan's folder runs Trigonometry then Complex numbers, so the order matches; the polar-plane ground is covered
inside Trigonometry in part (the unit circle, radians, resolving a force); polar coordinates as a named idea are not there, so the polar-form lesson teaches "length and angle" afresh using that trigonometry.

## 2. Other courses' order for the same ground

All the other routes teach the same four things in the same order: **a number whose square is minus one, the plane, arithmetic in Cartesian form with the conjugate for division, then polar form and its multiplication and division**.
They differ in what they put before and after.

### 2.1 Khan Academy: Precalculus, Unit 3 Complex numbers


- **Khan Academy Precalculus Unit 3 skills list in order**
  - Source: Complex numbers | Precalculus | Math | Khan Academy. https://www.khanacademy.org/math/precalculus/x9e81a4f98389efdf:complex
  - Quote: "1. Plot numbers on the complex plane 2. Graphically add & subtract complex numbers 3. Distance of complex numbers 4. Midpoint of complex numbers 5. Complex numbers: Quiz 1 6. Complex number conjugates 7. Divide complex numbers 8. Factor polynomials: complex numbers 9. Complex numbers: Quiz 2 10. Modulus (absolute value) of complex numbers 11. Angle of complex numbers 12. Complex numbers from absolute value & angle 13. Complex numbers: Quiz 3 14. Complex plane and polar form 15. Polar & rectangular forms of complex numbers 16. Graphically multiply complex numbers 17. Multiply & divide complex numbers in polar form 18. Powers of complex numbers 19. Complex numbers: Quiz 4 20. Complex numbers: Unit test"

- **Khan Academy Precalculus unit blurb**
  - Source: Complex numbers | Precalculus | Math | Khan Academy. https://www.khanacademy.org/math/precalculus/x9e81a4f98389efdf:complex
  - Quote: "Let's build off of our previous work with complex numbers and perform more sophisticated operations, like division. We'll also learn about a different and more visual way to represent complex numbers—polar form."

- **Khan Precalculus course units: complex numbers is Unit 3 after trigonometry**
  - Source: Precalculus | Math | Khan Academy. https://www.khanacademy.org/math/precalculus
  - Quote: "Precalculus 10 units Unit 1 Composite and inverse functions Unit 2 Trigonometry Unit 3 Complex numbers Unit 4 Rational functions Unit 5 Conic sections Unit 6 Vectors Unit 7 Matrices Unit 8 Probability and combinatorics Unit 9 Series Unit 10 Limits and continuity"

- **Khan Precalculus Unit 3 groups: plane, distance, conjugates and dividing, modulus and argument, polar form**
  - Source: Precalculus | Math | Khan Academy. https://www.khanacademy.org/math/precalculus
  - Quote: "The complex plane 1. Plotting numbers on the complex plane 2. The complex plane 3. Plot numbers on the complex plane 4. Graphically add & subtract complex numbers Distance and midpoint of complex numbers Unit 3: Complex numbers 1. Distance & midpoint of complex numbers 2. Distance of complex numbers 3. Midpoint of complex numbers Complex conjugates and dividing complex numbers Unit 3: Complex numbers 1. Intro to complex number conjugates 2. Complex number conjugates 3. Complex number conjugates 4. Dividing complex numbers 5. Divide complex numbers 6. Dividing complex numbers review Identities with complex numbers Unit 3: Complex numbers 1. Complex numbers & sum of squares factorization 2. Factoring sum of squares 3. Factoring polynomials using complex numbers 4. Factor polynomials: complex numbers Modulus (absolute value) and argument (angle) of complex numbers Unit 3: Complex numbers 1. Absolute value of complex numbers 2. Complex numbers with the same modulus (absolute value) 3. Modulus (absolute value) of complex numbers 4. Absolute value & angle of complex numbers 5. Angle of complex numbers 6. Complex numbers from absolute value & angle 7. Complex number absolute value & angle review Unit 3: Complex numbers Polar form of complex numbers 1. Polar & rectangular forms of complex numbers 2. Converting a complex number from polar to rectangular form 3. Complex plane and polar form 4. Polar & rectangular forms of complex numbers 5. Complex number forms review"

My reading: Khan splits the ground across two courses. Algebra 2 (2.2) does the number, the plane, adding and subtracting, multiplying and quadratics with complex answers;
Precalculus Unit 3 then does the plane again, distance, **conjugates and division**, modulus and argument, polar form, multiplying graphically and in polar form, and powers.
Its "graphically multiply" lesson sits between polar form and the polar rules, as the rotation picture does in Brilliant.

### 2.2 Khan Academy: Algebra 2, Algebra (all content) and Get ready for Precalculus


- **Khan Academy Algebra 2 Unit 2 skills list**
  - Source: Complex numbers | Algebra 2 | Math | Khan Academy. https://www.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:complex
  - Quote: "1. Simplify roots of negative numbers 2. Powers of the imaginary unit 3. Parts of complex numbers 4. Classify complex numbers 5. Plot numbers on the complex plane 6. Complex numbers: Quiz 1 7. Add & subtract complex numbers 8. Multiply complex numbers (basic) 9. Multiply complex numbers 10. Solve quadratic equations: complex solutions 11. Complex numbers: Quiz 2 12. Complex numbers: Unit test"

- **Khan Algebra 2 unit blurb**
  - Source: Complex numbers | Algebra 2 | Math | Khan Academy. https://www.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:complex
  - Quote: "Welcome to the world of imaginary and complex numbers. We'll learn what imaginary and complex numbers are, how to perform arithmetic operations with them, represent them graphically on the complex plane, and apply these concepts to solve quadratic equations in new ways."

- **Khan Algebra (all content) unit 16 topic list**
  - Source: Complex numbers | Algebra (all content) | Math | Khan Academy. https://www.khanacademy.org/math/algebra-home/alg-complex-numbers
  - Quote: "This topic covers: * Adding, subtracting, multiplying, & dividing complex numbers * Complex plane * Absolute value & angle of complex numbers * Polar coordinates of complex numbers"

- **Khan Get ready for Precalculus lists the prerequisite complex-number lessons**
  - Source: Get ready for Precalculus | Math. https://www.khanacademy.org/math/get-ready-for-precalculus
  - Quote: "Unit 1: Get ready for complex numbers · The imaginary unit i · Complex numbers introduction · The complex plane · Adding and subtracting complex numbers."

My reading: Khan's Algebra 2 unit starts with the **roots of negative numbers and the powers of the imaginary unit** (nine skills), then the plane, then adding, multiplying and quadratics.
The "Algebra (all content)" unit 16 is the same ground in one unit and ends on polar coordinates of complex numbers.

### 2.3 BBC Bitesize and SQA Higher / Advanced Higher Maths


- **BBC Bitesize Higher Maths topic list (algebraic and trigonometric skills) has no complex-number guide**
  - Source: Higher Maths - BBC Bitesize. https://www.bbc.co.uk/bitesize/subjects/z6nygk7
  - Quote: "Dividing and factorising polynomial expressions A polynomial is an algebraic expression involving many terms and can be factorised using long division or synthetic division. * Laws of logarithms and exponents Revise what logarithms are and how to use the 'log' buttons on a scientific calculator * Solving polynomial equations The nature and co-ordinates of roots can be determined using the discriminant and solving polynomials. * Solving logarithmic and exponential equations Revise the laws of logarithms in order to solve logarithmic and exponential equations * Trigonometric expressions The addition formulae and trigonometric identities are used to simplify or evaluate trigonometric expressions. Trigonometric equations are solved using a double angle formulae and the wave function. * Solving trigonometric equations Trigonometric equations can be solved in degrees or radians using CAST and its period to find other solutions within the range, including multiple or compound angles and the wave function. * Identifying and sketching related functions The rules from graph translations are used to sketch the derived, inverse or other related functions. Complete the square to find turning points and find expression for composite functions. * Determining composite and inverse functions"

- **SQA Advanced Higher: algebraic operations on complex numbers**
  - Source: Advanced Higher Mathematics. https://www.sqa.org.uk/files_ccc/AHCourseSpecMathematics.pdf
  - Quote: "Performing algebraic operations on complex numbers  performing the operations of addition, subtraction, multiplication, and division  finding the square root  finding the roots of a cubic or quartic equation with real coefficients when one complex root is given  solving equations involving complex numbers"

- **SQA Advanced Higher: geometric operations (Argand diagram, polar form, de Moivre, loci)**
  - Source: Advanced Higher Mathematics. https://www.sqa.org.uk/files_ccc/AHCourseSpecMathematics.pdf
  - Quote: "Performing geometric operations on complex numbers  plotting complex numbers in the complex plane (an Argand diagram)  knowing the definition of modulus and argument of a complex number  converting a given complex number from Cartesian to polar form and vice-versa  using de Moivre’s theorem with integer and fractional indices  applying de Moivre’s theorem to multiple angle trigonometric formulae  applying de Moivre’s theorem to find the n th roots of a complex number  interpreting geometrically certain equations or inequalities in the complex plane by sketching or describing a straight line or circle that represents the locus of points that satisfy a given equation or inequality"

My reading: **Bitesize has no complex-numbers guide in its Higher Maths list** (the list above is the algebraic and trigonometric group; the other groups are geometric skills such as vectors, calculus skills, and algebraic and geometric skills such as circles and sequences).
In the Scottish school route, complex numbers are an Advanced Higher topic, so Bitesize is not a source here. The Advanced Higher specification is the nearest school-level order:
algebraic operations first (including finding the square root, and roots of cubics and quartics from one given complex root), then the geometry (Argand diagram, modulus and argument,
Cartesian and polar both ways, de Moivre's theorem, loci). That is a stretch beyond Dan's need; the HN units (section 3) ask for much less.

### 2.4 HELM, Workbook 10 (Loughborough)


- **HELM Workbook 10 contents in order**
  - Source: HELM 10: Complex Numbers. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2010%20Complex%20Numbers.pdf
  - Quote: "10.1 Complex Arithmetic 2 10.2 Argand Diagrams and the Polar Form 12 10.3 The Exponential Form of a Complex Number 20 10.4 De Moivre’s Theorem"

- **HELM Workbook 10 aim: operations then the Argand diagram**
  - Source: HELM 10: Complex Numbers. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2010%20Complex%20Numbers.pdf
  - Quote: "In this Workbook you will learn what a complex number is and how to combine complex numbers together using the familiar operations of addition, subtraction, multiplication and division. You will also learn how to describe a complex number graphically using the Argand diagram."

- **HELM: apart from i squared, complex numbers follow the usual rules of number algebra**
  - Source: HELM 10: Complex Numbers. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2010%20Complex%20Numbers.pdf
  - Quote: "Fundamental to the study of complex numbers is the symbol i with the strange looking property i 2 = − 1. Apart from this property complex numbers follow the usual rules of number algebra."

- **HELM: complex numbers are added and multiplied like real numbers**
  - Source: HELM 10: Complex Numbers. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2010%20Complex%20Numbers.pdf
  - Quote: "Complex numbers are added, subtracted, multiplied and divided in much the same way as these operations are carried out for real numbers."

- **HELM: the product of a complex number with its conjugate is a non-negative real number**
  - Source: HELM 10: Complex Numbers. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2010%20Complex%20Numbers.pdf
  - Quote: "However, the product of a complex number with its conjugate is always a non-negative real number."

- **HELM: why rationalise the denominator**
  - Source: HELM 10: Complex Numbers. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2010%20Complex%20Numbers.pdf
  - Quote: "The reason for rationalising is to get a real number in the denominator since a complex number divided by a real number is easy to evaluate."

- **HELM 10.2 prerequisites: complex numbers, trig, polynomials, vectors** **SECONDARY**
  - Source: Argand Diagrams and the Polar Form. https://sheffield.ac.uk/media/31975/download?attachment
  - Quote: "Prerequisites Before starting this Section you should . . . • know what a complex number is • be able to use trigonometric functions sin, cos and tan • understand what a polynomial is • possess a knowledge of vectors"

- **HELM 10.2: polar form is advantageous for multiplying and dividing** **SECONDARY**
  - Source: Argand Diagrams and the Polar Form. https://sheffield.ac.uk/media/31975/download?attachment
  - Quote: "In the second part of this Section we introduce an alternative form, called the polar form, for representing complex numbers. We shall see that the polar form is particularly advantageous when multiplying and dividing complex numbers."

- **HELM 10.2: complex numbers add like vectors and are slidable** **SECONDARY**
  - Source: 10.2. https://sheffield.ac.uk/media/31975/download?attachment
  - Quote: "complex numbers (when represented on an Argand diagram) are slidable — as long as you keep their length and direction the same, you can position them anywhere on an Argand diagram."

- **HELM 10.2: Cartesian form suits addition, polar form suits multiplication and division** **SECONDARY**
  - Source: 10.2. https://sheffield.ac.uk/media/31975/download?attachment
  - Quote: "We see that the Cartesian form of a complex number: _z_ = _a_ + i _b_ is a particularly suitable form for addition (or subtraction) of complex numbers. However, when we come to consider multiplication and division of complex numbers, the Cartesian description is not the most convenient form that is available to us."

- **HELM Workbook 10 is 34 pages with four sections**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2049%20Student's%20Guide.pdf
  - Quote: "Workbook 10 - Complex Numbers (34 pages) 10.1 Complex Arithmetic 10.2 Argand Diagrams and the Polar Form 10.3 The Exponential Form of a Complex Number 10.4 De Moivre’s Theorem"

- **HELM uses i rather than j**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2049%20Student's%20Guide.pdf
  - Quote: "HELM uses i rather than j to represent ( _−_ 1) so i ² = _−_ 1, although there are one or two exceptions to this (in Workbook 48: Engineering Case Studies)"

- **HELM tutor's guide: a gentle introduction, non-rigorous, polar and exponential forms** **SECONDARY**
  - Source: About the HELM Project. https://nucinkis-lab.cc.ic.ac.uk/HELM/HELM_Workbooks_46-50/WB50-all.pdf
  - Quote: "Complex numbers are a basic tool in engineering and science and this Workbook gives a gentle introduction to their properties and uses. A non-rigorous approach is adopted with a complex number being denoted by _z_ = _a_ +i _b_ in Cartesian coordinates and by _z_ = _r_ (cos _θ_ +i sin _θ_ ) in polar coordinates. The complex exponential form is also covered."

- **HELM formulae sheet: Cartesian form with j, polar form with the angle sign**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2049%20Student's%20Guide.pdf
  - Quote: "Cartesian form: _z_ = _a_ + _bj_ where _j_ = _√_ _−_ 1 Polar form: _z_ = _r_ (cos _θ_ + _j_ sin _θ_ ) = _r_ ∠ _θ"

My reading: HELM is the closest match to the HN route. It is 34 pages in four sections: arithmetic (with conjugate and division by rationalising), the Argand diagram and polar form, the exponential form,
and de Moivre. Its own advice is to add and subtract in Cartesian form and multiply and divide in polar form (Key Point 7), and its tutor's guide says to take the algebra slowly.
HELM writes i, though its student's guide says i may be replaced by j, and its formulae sheet gives the polar form with j; the course should say plainly that the same number is i in maths texts and j on a circuit.

### 2.5 Bird's Engineering Mathematics (the text HN lecturers use)


- **Bird's Higher Engineering Mathematics (9th ed.) has two complex-number chapters**
  - Source: Bird's Higher Engineering Mathematics - 9th Edition - John Bird - Rout. https://www.routledge.com/Birds-Higher-Engineering-Mathematics/Bird/p/book/9780367643737
  - Quote: "Section D Complex numbers 18 Complex numbers 19 De Moivre’s theorem"

- **Bird's Higher Engineering Mathematics puts alternating waveforms next to vectors**
  - Source: Bird's Higher Engineering Mathematics - 9th Edition - John Bird - Rout. https://www.routledge.com/Birds-Higher-Engineering-Mathematics/Bird/p/book/9780367643737
  - Quote: "22 Vectors 23 Methods of adding alternating waveforms"

- **Bird's Engineering Mathematics (9th ed.) Section 5 complex numbers, then vectors and alternating waveforms**
  - Source: Bird's Engineering Mathematics - 9th Edition - John Bird - Routledge B. https://www.routledge.com/Birds-Engineering-Mathematics/Bird/p/book/9780367643782
  - Quote: "Section 5: Complex numbers 32. Complex numbers 33. De Moivre’s theorem Section 6: Vectors 34. Vectors 35. Methods of adding alternating waveforms"

- **Bird (5th ed.) chapter 23 sections: Cartesian, Argand, arithmetic, polar, applications** **SECONDARY**
  - Source: HIGHER ENGINEERING MATHEMATICS. https://ndl.ethernet.edu.et/server/api/core/bitstreams/95c3b47e-ec1a-47d9-997e-96f202d2a949/content
  - Quote: "23.1 Cartesian complex numbers 249 23.2 The Argand diagram 250 23.3 Addition and subtraction of complex numbers 250 23.4 Multiplication and division of complex numbers 251 23.5 Complex equations 253 23.6 The polar form of a complex number 254 23.7 Multiplication and division in polar form 256 23.8 Applications of complex numbers 257"

- **Bird (5th ed.) chapter 24 De Moivre sections** **SECONDARY**
  - Source: HIGHER ENGINEERING MATHEMATICS. https://ndl.ethernet.edu.et/server/api/core/bitstreams/95c3b47e-ec1a-47d9-997e-96f202d2a949/content
  - Quote: "24.1 Introduction 261 24.2 Powers of complex numbers 261 24.3 Roots of complex numbers 262 24.4 The exponential form of a complex number 264"

- **Bird's author is at the Royal Naval School of Marine Engineering** **SECONDARY**
  - Source: HIGHER ENGINEERING MATHEMATICS. https://ndl.ethernet.edu.et/server/api/core/bitstreams/95c3b47e-ec1a-47d9-997e-96f202d2a949/content
  - Quote: "JOHN BIRD Royal Naval School of Marine Engineering, HMS Sultan"

My reading: Bird has two chapters, **Complex numbers** and **De Moivre's theorem**, and Bird himself taught at the Royal Naval School of Marine Engineering. In the older 5th edition the complex-numbers chapter runs in the order
Cartesian, Argand diagram, adding and subtracting, multiplying and dividing (with the conjugate), complex equations, polar form, multiplication and division in polar form, **applications (a.c. circuits)**. De Moivre is its own chapter after that.
In the 9th editions, the vectors chapter and "Methods of adding alternating waveforms" come after complex numbers.
The shorter *Basic Engineering Mathematics* (8th edition) has Cartesian and polar co-ordinates and adding alternating waveforms but no complex-numbers chapter in its 38-chapter contents (my reading of the list; no quote).

### 2.6 mathcentre's Engineering Maths First Aid Kit and OpenStax


- **mathcentre/STEM: seven leaflets on complex numbers for engineers**
  - Source: Complex Numbers | Resources. https://www.stem.org.uk/resources/library/resource/30354/complex-numbers
  - Quote: "Mathcentre provide these resources which cover aspects of complex numbers, often used in the field of engineering. They include the definition of a complex number and their associated arithmetic, the Argand diagram and polar form of a complex number, as well as the exponential form."

- **OpenStax Precalculus 8.5 learning objectives**
  - Source: 8.5 Polar Form of Complex Numbers - Precalculus 2e | OpenStax. https://openstax.org/books/precalculus-2e/pages/8-5-polar-form-of-complex-numbers
  - Quote: "In this section, you will: * Plot complex numbers in the complex plane. * Find the absolute value of a complex number. * Write complex numbers in polar form. * Convert a complex number from polar to rectangular form. * Find products of complex numbers in polar form. * Find quotients of complex numbers in polar form. * Find powers of complex numbers in polar form."

My reading: mathcentre's seven leaflets (written by engineers for engineering students, and using **j**) follow the same order: what a complex number is, arithmetic, the Argand diagram, polar form, the r(cos + j sin) form, multiplying and dividing in polar form, then the exponential form. Six of the seven are the Dan core; the exponential form is the stretch.
OpenStax's section 8.5 is the polar half of the same sequence.

## 3. What a marine engineering HNC actually uses of this topic

Short answer from the documents below: **the HN units ask for exactly the Dan core** (plane, Cartesian arithmetic with the conjugate, polar form, converting both ways, polar multiplication and division, and AC circuits written with j), at SCQF level 6 and 7. De Moivre appears only in the England HND further-mathematics unit.
The MCA's own written syllabuses do not name complex numbers (as far as I could see); they ask for phasors, impedance triangles and power factor, which the same ideas explain.

### 3.1 SQA HN Engineering Mathematics 1 (the complex-numbers unit)

SQA's NextGen unit J7GK 46 (valid from August 2026) replaces H7K0 33; both have a third outcome of vectors and complex numbers.


- **SQA EM1 evidence: convert Cartesian and polar both ways**
  - Source: J7GK Engineering Mathematics 1. https://www.sqa.org.uk/sqa/files_ccc/j7gk-46-engineering-mathematics-1.pdf
  - Quote: "Convert one vector (2-dimensional cases) or complex number in Cartesian form"

- **SQA EM1 evidence: add and subtract in rectangular form**
  - Source: J7GK Engineering Mathematics 1. https://www.sqa.org.uk/sqa/files_ccc/j7gk-46-engineering-mathematics-1.pdf
  - Quote: "Solve one problem involving the addition and subtraction of complex numbers (in"

- **SQA EM1 knowledge and skills: vectors and complex numbers**
  - Source: J7GK 46 Engineering Mathematics 1. https://www.sqa.org.uk/sqa/files_ccc/j7gk-46-engineering-mathematics-1.pdf
  - Quote: "Learners should understand: • vectors and complex numbers"

- **SQA EM1 guidance: notation, engineers tend to use j**
  - Source: J7GK Engineering Mathematics 1. https://www.sqa.org.uk/sqa/files_ccc/j7gk-46-engineering-mathematics-1.pdf
  - Quote: "Identify normal notation used with complex numbers (engineers tend to use _j_"

- **SQA EM1 guidance: the sequence of complex-number topics**
  - Source: J7GK Engineering Mathematics 1. https://www.sqa.org.uk/sqa/files_ccc/j7gk-46-engineering-mathematics-1.pdf
  - Quote: "Add and subtract complex numbers. • Multiply complex numbers in both Cartesian and polar form. • Introduce the complex conjugate. • Divide complex numbers in both Cartesian and polar form. • Represent complex numbers in all four quadrants of an Argand diagram."

- **SQA EM1 guidance: Argand diagram and principal argument**
  - Source: J7GK Engineering Mathematics 1. https://www.sqa.org.uk/sqa/files_ccc/j7gk-46-engineering-mathematics-1.pdf
  - Quote: "Demonstrate the representation of complex numbers in Cartesian and polar form (noting the domain of principal argument, arg( ) _z_ )."

- **SQA EM1: calculators in the assessment must not do complex number manipulation**
  - Source: J7GK 46 Engineering Mathematics 1. https://www.sqa.org.uk/sqa/files_ccc/j7gk-46-engineering-mathematics-1.pdf
  - Quote: "designed or adapted to offer any of the following facilities: • language translators • symbolic algebra manipulation • complex number manipulation"

- **SQA EM1: unit purpose lists electrical engineering among target careers**
  - Source: J7GK 46 Engineering Mathematics 1. https://www.sqa.org.uk/sqa/files_ccc/j7gk-46-engineering-mathematics-1.pdf
  - Quote: "of mathematics to support a career in engineering fields such as: • electrical engineering"

- **SQA H7K0 33 (the unit NextGen EM1 replaces): complex numbers are introduced**
  - Source: Engineering Mathematics 1 (SCQF level 6) Unit code: H7K0 33. https://www.sqa.org.uk/files/hn/H7K033.pdf
  - Quote: "Learners will also be introduced to 3-dimensional vectors and complex numbers."

- **SQA H7K0 33: three outcomes, the third vectors and complex numbers**
  - Source: Engineering Mathematics 1 (SCQF level 6) Unit code: H7K0 33. https://www.sqa.org.uk/files/hn/H7K033.pdf
  - Quote: "3 Apply mathematical techniques involving vectors and complex numbers."

- **SQA H7K0 33: recommended entry is Technician 1, Intermediate 2 or National 5 Mathematics**
  - Source: Engineering Mathematics 1 (SCQF level 6) Unit code: H7K0 33. https://www.sqa.org.uk/files/hn/H7K033.pdf
  - Quote: "This knowledge and understanding may be evidenced by possession of the NQ Unit Mathematics: Technician 1 or a pass at Intermediate 2 or National 5 in Mathematics."

- **SQA H7K0 33: knowledge and skills list for complex numbers**
  - Source: Engineering Mathematics 1 (SCQF level 6) Unit code: H7K0 33. https://www.sqa.org.uk/files/hn/H7K033.pdf
  - Quote: "Conversion of complex numbers between rectangular and polar form  Addition and subtraction of complex numbers  Multiplication and division of complex numbers  Representation of complex numbers on an Argand Diagram"

- **SQA H7K0 33: computer algebra must not be used**
  - Source: Engineering Mathematics 1 (SCQF level 6) Unit code: H7K0 33. https://www.sqa.org.uk/files/hn/H7K033.pdf
  - Quote: "Computer algebra must not be used in the assessment of this Unit."

- **SQA H7K0 33 support notes: vectors and complex numbers get 14 hours**
  - Source: Engineering Mathematics 1 (SCQF level 6) Unit code: H7K0 33. https://www.sqa.org.uk/files/hn/H7K033.pdf
  - Quote: "Outcome 3 (14 hours) Apply mathematical techniques to vectors and complex numbers"

**UNCONFIRMED by script** (read in the full text of the 2026 PDF, outside the checker's view): the evidence-requirements sentence "Convert one vector (2-dimensional cases) or complex number in Cartesian form to polar form, and one vector or complex number in polar form to Cartesian form"; the item for multiplication of two numbers "in rectangular form" and division "in polar form"; the whole-unit notional design length of 40 hours; and that learners "already have good algebraic skills, and can transpose engineering formulae and solve simple trigonometric equations". The fourth item, "all four quadrants of an Argand diagram", is confirmed in the guidance list above.

My reading: the assessed items are conversion both ways, adding and subtracting in rectangular form, multiplying in rectangular form, dividing in polar form, and plotting in all four quadrants. Division in rectangular form (by the conjugate) is taught ("Introduce the complex conjugate. Divide complex numbers in both Cartesian and polar form") but the sampled item is division in polar form. Vectors and complex numbers together get 14 hours in the old unit's support notes. Calculators with complex-number keys are not allowed in the assessment, so every skill has to be doable by hand with a scientific calculator's sin, cos, tan and their inverses.

### 3.2 Where Engineering Mathematics 1 and 2 sit in the HNC and HND


- **HNC Engineering: Engineering Mathematics 1 is a mandatory unit**
  - Source: NextGen: HN course documents - Qualifications Scotland. https://www.sqa.org.uk/sqa/110487.html
  - Quote: "HNC Engineering Mandatory Units * Engineering Mathematics 1 (J7GK 46 SCQF level 6)"

- **HND Engineering: Engineering Mathematics 2 is a mandatory unit**
  - Source: NextGen: HN course documents - Qualifications Scotland. https://www.sqa.org.uk/sqa/110487.html
  - Quote: "HND Engineering Mandatory Units * Engineering Project Management (J7BS 48 SCQF level 8) (410 KB) * Professional Practice in Engineering (J7BR 48 SCQF level 8) (467 KB) * Engineering Mathematics 2 (J7GL 47 SCQF level 7)"

- **SQA EM2 evidence includes definite and indefinite integrals (no complex numbers in the evidence I saw)**
  - Source: J7GL 47 Engineering Mathematics 2. https://www.sqa.org.uk/sqa/files_ccc/j7gl-47-engineering-mathematics-2.pdf
  - Quote: "Solve one indefinite and one definite integral."

My reading: Engineering Mathematics 1 (with the complex numbers) is a mandatory HNC unit; Engineering Mathematics 2 is mandatory in the HND, and its evidence items are trigonometric functions, derivatives and integrals, with no complex numbers in what I saw.
So the complex numbers have to be right by the end of the HNC year.

### 3.3 SQA Electrical Engineering Principles (the AC use)


- **SQA Electrical Engineering Principles: analyse RL, RC and RLC circuits using complex notation**
  - Source: J6CW 47 Electrical Engineering Principles. https://www.sqa.org.uk/sqa/files_ccc/j6cw-47-electrical-engineering-principles.pdf
  - Quote: "Analyse RL, RC and RLC electrical circuits using complex notation."

- **SQA Electrical Engineering Principles skills: complex notation and phasor diagrams**
  - Source: J6CW 47 Electrical Engineering Principles. https://www.sqa.org.uk/sqa/files_ccc/j6cw-47-electrical-engineering-principles.pdf
  - Quote: "involving RL, RC and RLC using complex notation and drawing phasor diagrams"

- **SQA Electrical Engineering Principles: AC power and power factor improvement**
  - Source: J6CW 47 Electrical Engineering Principles. https://www.sqa.org.uk/sqa/files_ccc/j6cw-47-electrical-engineering-principles.pdf
  - Quote: "RL, RC and RLC circuits • AC power • power factor improvement • resonating passive circuits"

- **SQA Electrical Engineering Principles: three-phase phasor diagrams**
  - Source: J6CW 47 Electrical Engineering Principles. https://www.sqa.org.uk/sqa/files_ccc/j6cw-47-electrical-engineering-principles.pdf
  - Quote: "Draw phasor diagrams for balanced three-phase loads."

**UNCONFIRMED by script** (read in the PDF, outside the checker's view): the delivery guidance says to cover inductive reactance, capacitive reactance and impedance and then "support learners with complex notation so they can analyse RL, RC and RLC circuits before you introduce apparent, active and reactive power", and to continue with power factor correction; the unit's notional length is 120 hours with about 30 for the single-phase AC outcome.

My reading: this unit (a mandatory-optional HNC unit, level 7) is where complex notation becomes circuit analysis, so a Dan who can write Z = R + jX, multiply and divide in polar form and read the angle as the phase will arrive ready.

### 3.4 Pearson BTEC Higher Nationals (England)


- **Pearson 4002 essential content lists Complex Numbers**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "Mathematical concepts: Dimensional analysis Arithmetic and geometric progressions Complex Numbers."

- **Pearson 4002 learning outcome 3: sinusoidal wave and vector functions**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "Use analytical and computational methods for solving engineering and manufacturing sector problems by relating sinusoidal wave and vector functions to their respective applications"

- **Pearson 4002 content: complex numbers and resultants, leading and lagging LRC circuits**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "Complex numbers and resultants using mathematics Adding two sine waves using oscilloscope for practical method Adding two sine waves using graphical method Adding two sine waves using vector method Subtracting the sine waves that are out of phase Leading and lagging circuit examples using LRC circuits"

- **Pearson 4002 M5: resultant of two out of phase AC circuits**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "Create the resultant of two out of phase AC circuits using a spreadsheet and define the characteristics."

- **Pearson 5006 (HND): complex number theory, polar and exponential forms, de Moivre**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "Solve engineering/manufacturing problems using complex number theory. P3 Perform arithmetic operations using the polar and exponential forms of complex numbers. M1 Solve problems using de Moivre’s Theorem."

- **Pearson Unit 4002 sits in the HNC core**
  - Source: Higher Nationals - Pearson qualifications. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/specification/9781292448473-btec-hn-l4-l5-engin-engl-iss1.pdf
  - Quote: "Core Mandatory Unit 4002: Engineering Maths 15 4"

- **Pearson 2017 spec Unit 39 Further Mathematics: complex numbers** **SECONDARY**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "Among the topics included in this unit are: number theory, complex numbers, matrix theory, linear equations, numerical integration, numerical differentiation, and graphical representations of curves for estimation within an engineering context."

- **Pearson 2017 spec Unit 39: modulus, argument, conjugate, polar and exponential forms** **SECONDARY**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "The modulus, argument and conjugate of complex numbers Polar and exponential forms of complex numbers"

My reading: Unit 4002 Engineering Mathematics (level 4, 15 credits, core in the HNC) lists "Complex Numbers" as a mathematical concept and teaches them alongside sinusoidal waves and vectors: the resultant of out-of-phase sine waves and leading and lagging in LRC circuits.
At HND (Unit 5006 Further Engineering Mathematics) it adds polar and exponential forms and de Moivre's theorem, so de Moivre belongs after the HNC, as at most **one stretch screen** here. The 2017 specification's Unit 39 and Unit 52 list electric circuit analysis and AC quantities as the applications.

### 3.5 The MCA engineer officer syllabuses

I found no MCA paper called "Applied Mathematics" (the name is **UNCONFIRMED**): the written papers found are **Mathematics**, Applied Mechanics, Applied Heat, Engineering Drawing, Electro Technology and Naval Architecture (Second Engineer), and General Engineering Science A and B for the experienced route.


- **MCA Marine Electro-Technology: phasor quantity and phasor addition of ac quantities**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Explains the term phasor quantity. 20. Explains how phasors may be used to represent sinusoidal quantities. 21. Solves graphical problems involving addition and subtraction of ac voltages and currents using phasor method."

- **MCA Marine Electro-Technology: phasor diagrams for R, L, C; lagging and leading**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Draws phasor diagrams for pure resistive, inductive and capacitive circuits and distinguishes between in phase, lagging and leading currents."

- **MCA Marine Electro-Technology: reactance, phasor diagrams and impedance triangles for series circuits**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Defines and calculates inductive reactance and capacitive reactance. 25. Constructs and uses phasor diagrams for R-L, R-C and R-L-C series circuits. 26. Sketches and uses impedance triangles for the series circuits in 2.1.25."

- **MCA Marine Electro-Technology: phase angle, active and reactive components**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Defines phase angle and active and reactive components. 28. Resolves phasor quantities into active, and reactive components eg I cos 0 and I sin 0."

- **MCA Marine Electro-Technology: power triangle and power factor**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Constructs a diagram in terms of active power, apparent power and reactive power. 31. Defines power factor as the ratio of active power to apparent power."

- **MCA Marine Electro-Technology: synchronising a 3 phase ac generator**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Explains how to safely synchronise an incoming 3 phase ac generator to live busbars using lamps and/or synchroscope and voltmeters."

- **MCA General Engineering Science B: AC circuits with R, C and L, power factor**
  - Source: MCA General Engineering Science B Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/mca-general-engineering-science-b-written-examination-syllabuses
  - Quote: "3. AC circuits comprising resistance capacitance and inductance, voltage and current magnification factor. 4. True power, apparent power and power factor."

- **MCA Second Engineer Mathematics: eight topic headings (no complex numbers)**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "1. Arithmetic 2. 2. Algebra 3. 3. Logarithms 4. 4. Graphs 5. 5. Trigonometry 6. 6. Mensuration 7. 7. Calculus - differentiation 8. 8. Calculus - integration"

- **MCA Second Engineer Mathematics: right-angled triangles and Pythagoras**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "Determines Sin, Cos and Tan from given right angled triangle. 6. Reads values of Sin, Cos, Tan, Sec, Cosec and Cot for any angle between 0’ and 90’. 7. Determines an angle from tables knowing its sin, cos, tan, sec, cosec or cot. 8. Determines values of sin, etc, for angles 90’ - 360’ and also is able to obtain an angle (00 - 360’) knowing its sin, etc. 9. States the theorem of Pythagoras. 10. Solves right angled triangles for any side or angle."

- **MCA Second Engineer Mathematics: angles in degrees or radians**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "States that angles are measured in degrees or radians and relates the two."

- **MCA Second Engineer Mathematics: graphs of sin and cos sums**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "Solves graphic problems of trigometric form no more complex than y = a sin mx + b cos nx, and finds the solution of simultaneous equations involving such graphs."

- **MSN 1857: Second Engineer academic subjects**
  - Source: MSN 1857 (M+F) - Amendment 1 - GOV.UK. https://assets.publishing.service.gov.uk/media/63a04831d3bf7f375c7d82e1/Merchant_Shipping_Notice_1857__Amendment_1_.pdf
  - Quote: "Second Engineer: Mathematics, Applied Mechanics, Applied Heat, Engineering Drawing, Electro Technology and Naval Architecture."

- **MSN 1857: HND/HNC holders need four of six subjects**
  - Source: Merchant Shipping Notice 1857 (M+F) Amendment 1 — Maritime and Coastguard Agency. https://assets.publishing.service.gov.uk/media/63a04831d3bf7f375c7d82e1/Merchant_Shipping_Notice_1857__Amendment_1_.pdf
  - Quote: "University Graduates or Higher National Diploma (HND)/Advanced Diploma/ Higher National Certificate (HNC)/Advanced Certificate holders (preferably in Mechanical or Marine Engineering or in an engineering subject that at least covers four of the following 6 subjects: Mathematics, Engineering Drawing, Applied Mechanics, Applied Heat,"

- **MSN 1857: 70 percent match and 50 percent pass for exemption**
  - Source: Merchant Shipping Notice 1857 (M+F) Amendment 1 — Maritime and Coastguard Agency. https://assets.publishing.service.gov.uk/media/63a04831d3bf7f375c7d82e1/Merchant_Shipping_Notice_1857__Amendment_1_.pdf
  - Quote: "The modules of your engineering programme must show a match of at least 70% with the MCA academic examinations syllabus and you must secure at least 50% pass marks in the respective modules."

- **MCA guidance on exemptions for HND holders names Electro-technology and Mathematics**
  - Source: Engineering Officers and Ratings - GOV.UK. https://www.gov.uk/guidance/engineering-officers-and-ratings
  - Quote: "Holders of UK/EU qualifications (HND and higher) should contact IAMI for course and exam exemptions from Naval Architecture, Applied Mechanics, Applied Heat, Electro-technology, Mathematics and Engineering, Systems & Ship’s Drawings."

- **MIN 524: exemption from General Engineering Science needs mathematics and electro-technology modules**
  - Source: Engineer Officer Small Vessel Certificate of Competency. https://assets.publishing.service.gov.uk/media/63a2d98ee90e075870e2cef7/MIN524_Extended_January_2023.pdf
  - Quote: "7.6 Exemption from General Engineering Science I & II. To gain an exemption from these subjects candidates need to hold UK degree/HND/HNC in mechanical, marine, Aeronautical or electro-mechanical engineering. The programme must have included the modules of applied mechanics, applied heat, mathematics and electro- technology."

- **MIN 720: modernised syllabus for engineering and electro-technical from 2025**
  - Source: MIN 720 (M) Amendment 1 - Transforming seafarer training: the UK’s modernised officer qualifications syllabus - GOV.UK. https://www.gov.uk/government/publications/min-720-m-amendment-1-transforming-seafarer-training-the-uks-modernised-officer-qualifications-syllabus/min-720-m-amendment-1-transforming-seafarer-training-the-uks-modernised-officer-qualifications-syllabus
  - Quote: "This collaborative effort has resulted in a modernised syllabus for Nautical, Engineering, and Electro-Technical disciplines, implemented by UK/MCA Approved Nautical Colleges/Universities from August/September 2025."

- **MIN 720: current-format written exams cease from April 2028**
  - Source: MIN 720 (M) Amendment 1 - Transforming seafarer training: the UK’s modernised officer qualifications syllabus - GOV.UK. https://www.gov.uk/government/publications/min-720-m-amendment-1-transforming-seafarer-training-the-uks-modernised-officer-qualifications-syllabus/min-720-m-amendment-1-transforming-seafarer-training-the-uks-modernised-officer-qualifications-syllabus
  - Quote: "All MCA written exams administered by Qualifications Scotland in their current format will cease from April 2028."

- **IAMI Science B: AC circuits with resistance, capacitance and inductance** **SECONDARY**
  - Source: UK MCA EOOW Written Exams - IAMI Science A&B and Engineering Knowledge (EK). https://www.edumaritime.net/uk-mca-exams/engineering-oow-iami-exams
  - Quote: "AC circuits comprising resistance capacitance and inductance, voltage and current magnification factor. * True power, apparent power and power factor"

- **MSN 1857: an HND with 50 percent in each academic subject means no MCA Second and Chief Engineer academic exams**
  - Source: Merchant Shipping Notice 1857 (M+F) Amendment 1 — Maritime and Coastguard Agency. https://assets.publishing.service.gov.uk/media/63a04831d3bf7f375c7d82e1/Merchant_Shipping_Notice_1857__Amendment_1_.pdf
  - Quote: "Providing you obtain a pass of at least 50% in each academic subject in your HND/Advanced Diploma, you have demonstrated the management standard required for the underpinning knowledge for a management level CoC. Therefore, you will not need to complete the MCA Second and Chief Engineer academic examinations."

- **MSN 1857: an HNC alone means passing all the MCA Second and Chief Engineer academic exams**
  - Source: Merchant Shipping Notice 1857 (M+F) Amendment 1 — Maritime and Coastguard Agency. https://assets.publishing.service.gov.uk/media/63a04831d3bf7f375c7d82e1/Merchant_Shipping_Notice_1857__Amendment_1_.pdf
  - Quote: "If you only obtained an HNC/Advanced Certificate you will need to pass all MCA Second Engineer and Chief Engineer Officer academic examinations."

My reading: **the MCA Mathematics syllabus has eight headings and none is complex numbers**. Its trigonometry lines (right-angled triangles, Pythagoras, degrees and radians, sums of sine and cosine graphs) are what the polar conversions need. The Marine Electro-Technology syllabus asks for phasors, phase angle, impedance triangles, active and reactive components and power factor, all of which a complex impedance carries. A college programme that matches at least 70 percent of the MCA academic syllabus, with the modules passed at 50 percent, can exempt the MCA academic papers; an HND passed at 50 percent in each subject exempts the Second and Chief Engineer papers, while an HNC alone does not. So what the college teaches (sections 3.1 to 3.4) is what counts.
**UNCONFIRMED:** what the MCA's modernised syllabus (from August 2025; current-format written exams stop in April 2028) says about mathematics and electro-technology. I saw its announcement, not its contents.

## 4. The scope to cover, and what research says about each part

Each part below is a skill in the order the sources teach it. "My reading" says what it means for the brief.

### 4.1 Why j (the engineer's i), and j squared is minus one


- **mathcentre: complex numbers are useful in alternating current circuit analysis**
  - Source: 7_1.dvi. https://www.mathcentre.ac.uk/resources/Engineering%20maths%20first%20aid%20kit/latexsource%20and%20diagrams/7_1.pdf
  - Quote: "This leaflet explains how the set of real numbers with which you are already familiar is enlarged to include further numbers called imaginary numbers. This leads to a study of complex numbers which are useful in a variety of engineering applications, especially alternating current circuit analysis."

- **mathcentre: conventionally the symbol is j, j squared is minus one**
  - Source: 7_1.dvi. https://www.mathcentre.ac.uk/resources/Engineering%20maths%20first%20aid%20kit/latexsource%20and%20diagrams/7_1.pdf
  - Quote: "We start by introducing a symbol to stand for the square root of −1. Conventionally this symbol is j. That is j = √ −1. It follows that j ² = −1"

- **mathcentre: j is not real, we say it is imaginary; square roots of negative numbers**
  - Source: 7_1.dvi. https://www.mathcentre.ac.uk/resources/Engineering%20maths%20first%20aid%20kit/latexsource%20and%20diagrams/7_1.pdf
  - Quote: "Using real numbers we cannot find the square root of a negative number, and so the quantity j is not real. We say it is imaginary."

- **mathcentre: powers of j**
  - Source: 7_1.dvi. https://www.mathcentre.ac.uk/resources/Engineering%20maths%20first%20aid%20kit/latexsource%20and%20diagrams/7_1.pdf
  - Quote: "Use the fact that j ² = −1 to simplify a) j ³ , b) j ⁴ . Solution a) j ³ = j ² × j. But j ² = −1 and so j ³ = −1 × j = −j. b) j ⁴ = j ² × j ² = (−1) × (−1) = 1."

- **mathcentre: z = a + bj, real and imaginary parts**
  - Source: 7_1.dvi. https://www.mathcentre.ac.uk/resources/Engineering%20maths%20first%20aid%20kit/latexsource%20and%20diagrams/7_1.pdf
  - Quote: "We often use the letter z to stand for a complex number and write z = a + bj, where a is the real part and b is the imaginary part. z = a + bj where a is the real part and b is the imaginary part of the complex number."

- **MathWorld: j is preferred because i is used for current**
  - Source: j -- from Wolfram MathWorld. https://mathworld.wolfram.com/j.html
  - Quote: "The symbol used by engineers and some physicists to denote i , the imaginary number sqrt(-1) . j is probably preferred over i because the symbol i (or I ) is commonly used to denote current."

- **Waterloo ECE: engineers adopted j because i is current**
  - Source: PowerPoint Presentation. https://ece.uwaterloo.ca/~ne112/Lecture_materials/pdfs/1.6.2a%20i%20versus%20j.pdf
  - Quote: "In electrical engineering, i generally represents current – Complex numbers are critical to understanding alternating current – Consequently, engineers adopted j"

- **MIT 18.03 notes: engineers write j to reserve i for current**
  - Source: 18.03 LECTURE NOTES, SPRING 2014 Complex numbers 7. Complex numbers are expressions of the form x+yi, where x and y. https://math.mit.edu/~hrm/18.031/complexnumbers.pdf
  - Quote: "(Electrical engineers sometimes write j instead of i , because they want to reserve i for current, but everybody else thinks that’s weird.)"

- **DSPRelated: engineers use j because i means current** **SECONDARY**
  - Source: Complex Numbers for Engineers: Magnitude, Phase, and the Complex Plane | DSP Foundations | DSPRelated.com. https://www.dsprelated.com/foundations/complex-numbers.php
  - Quote: "Engineers use j instead of i because i already means electric current."

- **Electronics Tutorials: the j-operator is a 90 degree anticlockwise rotation**
  - Source: Complex Numbers & Phasors in Polar and Rectangular Form. https://www.electronics-tutorials.ws/accircuits/complex-numbers.html
  - Quote: "The j-operator is used in electrical engineering for analysing frequency dependant AC circuits. It has a value exactly equal to √ -1 represents a 90 o anticlockwise rotation."

- **UC Davis handout: j in EE, i in maths, same thing**
  - Source: complex addition, multiplication, rotation, and rect polar .... https://www.ece.ucdavis.edu/~bbaas/281/notes/Handout.complex.arith.pdf
  - Quote: "real + j imag (common in EE) real + i imag (common in math) i = j = sqrt(–1)."

_Also relevant here, quoted in full in the section named:_

- **SQA EM1 guidance: notation, engineers tend to use j**
  - Source: J7GK Engineering Mathematics 1. https://www.sqa.org.uk/sqa/files_ccc/j7gk-46-engineering-mathematics-1.pdf
  - Quote: "Identify normal notation used with complex numbers (engineers tend to use _j_"
  - (listed under 3.1)

- **HELM uses i rather than j**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2049%20Student's%20Guide.pdf
  - Quote: "HELM uses i rather than j to represent ( _−_ 1) so i ² = _−_ 1, although there are one or two exceptions to this (in Workbook 48: Engineering Case Studies)"
  - (listed under 2.4)

My reading: the sources agree on the fact (j² = −1) and on why engineers write j (i already means current). They differ on how to introduce it: the HN guidance says there are different approaches, for example a negative b² − 4ac, or i = √−1, mathcentre says "j = √−1. It follows that j² = −1", and one education paper argues that i = √−1 is not a definition and should be replaced by i² = −1 (section 6.1).
That is a point to **teach as contested**: lead with the rule j × j = −1 (which is all the arithmetic uses), show the negative-discriminant route Dan already met in Quadratics, and give "√−1" as a spoken shorthand, not as a thing to calculate with. Use j from the start; say once that maths books, Brilliant and Khan write i.

### 4.2 Multiplying by j is a quarter turn


- **Bird: multiplying a phasor by j rotates it 90 degrees without changing its length** **SECONDARY**
  - Source: HIGHER ENGINEERING MATHEMATICS. https://ndl.ethernet.edu.et/server/api/core/bitstreams/95c3b47e-ec1a-47d9-997e-96f202d2a949/content
  - Quote: "The effect of multiplying a phasor by _j_ is to rotate it in a positive direction (i.e. anticlockwise) on an Argand diagram through 90 ◦ without altering its length."

- **HELM: multiplying by z rotates the line anticlockwise by arg z and keeps the length** **SECONDARY**
  - Source: 10.2. https://sheffield.ac.uk/media/31975/download?attachment
  - Quote: "We see that the effect of multiplying _w_ by _z_ is to _rotate_ the line representing the complex number _w_ anti-clockwise through an angle _θ_ which is arg( _z_ ), and preserving the length."

- **HELM exercise answer: each multiplication by i is a 90 degree rotation, four returns to the start** **SECONDARY**
  - Source: 10.2. https://sheffield.ac.uk/media/31975/download?attachment
  - Quote: "Each time you multiply through by i you effect a rotation through 90 _◦_ of the line representing the complex number 1 + 2i. After four such products you are back to where you started, at 1 + 2i."

- **Khan Academy circuit analysis: multiplying by j is a rotation of +90 degrees**
  - Source: Complex rotation (video) | Circuit analysis. https://www.khanacademy.org/science/electrical-engineering/ee-circuit-analysis-topic/ee-ac-analysis/v/ee-complex-rotation
  - Quote: "Multiplying a real or complex number by the imaginary unit j corresponds to a rotation by +90 degrees."

- **MIT ES.1803 impedance reading: multiplication by i is rotation by pi over 2**
  - Source: ES.1803 S24: Reading: Topic Enrichment: Complex Impedance. https://ocw.mit.edu/courses/es-1803-differential-equations-spring-2024/mites_1803_s24_complex_impedance.pdf
  - Quote: "You should be clear that in the complex plane multiplication by 𝑖 is the same as rotation by 𝜋/2. Likewise, division by 𝑖 is the same as rotation by −𝜋/2."

- **MIT ES.1803 topic 4: multiplying by 2i multiplies lengths by 2 and adds pi over 2 to the argument**
  - Source: ES.1803 S24: Reading: Topic 4: Complex Numbers and Exponentials. https://ocw.mit.edu/courses/es-1803-differential-equations-spring-2024/mites_1803_s24_topic4.pdf
  - Quote: "multiplication by 2𝑖 multiplies lengths by 2 and adds 𝜋/2 to arguments, i.e., rotates by 90 ∘"

- **Yoshiwara (LibreTexts host, multiplication by i rotates the vector 90 degrees counterclockwise** **SECONDARY**
  - Source: 10.3: Polar Form for Complex Numbers - Mathematics LibreTexts. https://math.libretexts.org/Bookshelves/Precalculus/Trigonometry_(Yoshiwara)/10:_Polar_Coordinates_and_Complex_Numbers/10.03:_Polar_Form_for_Complex_Numbers
  - Quote: "We see that multiplication by (i) corresponds to rotating the vector around the origin by (90^{\circ}) in the counterclockwise direction."

My reading: this is the single most useful picture for Dan. Multiplying by j turns an arrow a quarter turn anticlockwise without changing its length; multiplying by j twice is j² = −1, a half turn; four times is back to the start.
It explains why j appears in the impedance of a coil (+90°) and a capacitor (−90°), and it links to the phasor arrow he met in Trigonometry lesson 7. The Yoshiwara line is SECONDARY (a LibreTexts copy).

### 4.3 The complex plane (the Argand diagram)


- **Bird: Argand diagram, real axis horizontal and imaginary axis vertical** **SECONDARY**
  - Source: HIGHER ENGINEERING MATHEMATICS. https://ndl.ethernet.edu.et/server/api/core/bitstreams/95c3b47e-ec1a-47d9-997e-96f202d2a949/content
  - Quote: "A complex number may be represented pictorially on rectangular or cartesian axes. The horizontal (or _x_ ) axis is used to represent the real axis and the −3 −2 −1 0 1 2 3 Real axis _A j_ 2 _j_ − _j_ − _j_ 2 _j_ 3 _j_ 4 − _j_ 3 − _j_ 4 _D_ _B_ Imaginary axis − _j_ 5 _C_ Figure 23.1 vertical (or _y_ ) axis is used to represent the imaginary axis. Such a diagram is called an Argand diagram"

- **HELM tutor's guide: a point represents a complex number, it is not the number itself** **SECONDARY**
  - Source: About the HELM Project. https://nucinkis-lab.cc.ic.ac.uk/HELM/HELM_Workbooks_46-50/WB50-all.pdf
  - Quote: "The Argand diagram provides a useful means of visualisation of complex numbers but care must be taken to stress that a point on the diagram _represents_ a complex number and is not the number itself."

- **Electronics Tutorials: pure resistance and pure reactance sit on the axes**
  - Source: Complex Numbers & Phasors in Polar and Rectangular Form. https://www.electronics-tutorials.ws/accircuits/complex-numbers.html
  - Quote: "Such as: Z = 6 + j0 (for a pure Resistance) or Z = 0 + j4 (for a pure Reactance) on the complex plane."

_Also relevant here, quoted in full in the section named:_

- **Brilliant's prerequisite: cartesian and polar plane, quadratics, basic trigonometry**
  - Source: Practice Complex Numbers | Brilliant. https://brilliant.org/courses/complex-plane/
  - Quote: "Assumes comfort with the cartesian and polar coordinate plane, quadratic equations and basic trigonometry."
  - (listed under 1.1)

My reading: the plane is the coordinate plane Dan already has, with the horizontal axis renamed the real axis and the vertical axis the j axis. For him the real axis is **resistance** and the j axis is **reactance**.
One distinction the HELM tutor stresses: the point stands for the number, it is not the number.

### 4.4 Adding, subtracting, multiplying and dividing in Cartesian form


- **HELM: addition of complex numbers is equivalent to addition of 2-D vectors** **SECONDARY**
  - Source: 10.2. https://sheffield.ac.uk/media/31975/download?attachment
  - Quote: "We conclude from this that addition (and hence subtraction) of complex numbers is essentially equivalent to addition (subtraction) of two-dimensional vectors."

- **HELM Key Point 7: add and subtract in Cartesian, multiply and divide in polar** **SECONDARY**
  - Source: 10.2. https://sheffield.ac.uk/media/31975/download?attachment
  - Quote: "We conclude that addition and subtraction are most easily carried out in Cartesian form whereas multiplication and division are most easily carried out in polar form."

- **Bird: division by multiplying by the conjugate of the denominator** **SECONDARY**
  - Source: HIGHER ENGINEERING MATHEMATICS. https://ndl.ethernet.edu.et/server/api/core/bitstreams/95c3b47e-ec1a-47d9-997e-96f202d2a949/content
  - Quote: "(iii) Division of complex numbers is achieved by multiplying both numerator and denominator by the complex conjugate of the denominator."

- **Electronics Tutorials: multiplying in rectangular form uses ordinary algebra plus j squared**
  - Source: Complex Numbers & Phasors in Polar and Rectangular Form. https://www.electronics-tutorials.ws/accircuits/complex-numbers.html
  - Quote: "The multiplication of complex numbers in the rectangular form follows more or less the same rules as for normal algebra along with some additional rules for the successive multiplication of the j-operator where: j ² = –1."

- **Electronics Tutorials: division in rectangular form needs the conjugate (rationalising)**
  - Source: Complex Numbers & Phasors in Polar and Rectangular Form. https://www.electronics-tutorials.ws/accircuits/complex-numbers.html
  - Quote: "Mathematically, the division of complex numbers in rectangular form is a little more difficult to perform as it requires the use of the denominators conjugate function to convert the denominator of the equation into a real number. This is called “rationalising”."

_Also relevant here, quoted in full in the section named:_

- **HELM: the product of a complex number with its conjugate is a non-negative real number**
  - Source: HELM 10: Complex Numbers. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2010%20Complex%20Numbers.pdf
  - Quote: "However, the product of a complex number with its conjugate is always a non-negative real number."
  - (listed under 2.4)

- **HELM: why rationalise the denominator**
  - Source: HELM 10: Complex Numbers. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2010%20Complex%20Numbers.pdf
  - Quote: "The reason for rationalising is to get a real number in the denominator since a complex number divided by a real number is easy to evaluate."
  - (listed under 2.4)

My reading: add and subtract the real parts and the j parts separately, which is adding two arrows end to end (HELM). Multiply by expanding two brackets and putting j² = −1 (he has the brackets from Quadratics lesson 1).
Divide by multiplying top and bottom by the **conjugate** of the bottom, because (a + jb)(a − jb) = a² + b² has no j in it (HELM and Bird). Rationalising was left out of Powers and roots, so the brief must teach it here, as one move, not as a new topic.

### 4.5 Polar form: magnitude and angle, and converting both ways


- **mathcentre: modulus and argument**
  - Source: 7.4 The polar form. https://www.mathcentre.ac.uk/resources/Engineering%20maths%20first%20aid%20kit/latexsource%20and%20diagrams/7_4.pdf
  - Quote: "The distance of the point (a, b) from the origin is called the modulus, or magnitude of the complex number and has the symbol r. Alternatively, r is written as |z|. The modulus is never negative."

- **mathcentre: take care the calculator angle is in the correct quadrant**
  - Source: 7.4 The polar form. https://www.mathcentre.ac.uk/resources/Engineering%20maths%20first%20aid%20kit/latexsource%20and%20diagrams/7_4.pdf
  - Quote: "but care must be taken when using a calculator to find an inverse tangent that the solution obtained is in the correct quadrant. Drawing an Argand diagram will always help to identify the correct quadrant."

- **mathcentre: polar form r angle theta**
  - Source: 7.4 The polar form. https://www.mathcentre.ac.uk/resources/Engineering%20maths%20first%20aid%20kit/latexsource%20and%20diagrams/7_4.pdf
  - Quote: "The position of a complex number is uniquely determined by giving its modulus and argument. This description is known as the polar form. When the modulus and argument of a complex number, z, are known we write the complex number as z = r∠θ."

- **mathcentre: second-quadrant worked example, refer to the figure**
  - Source: 7_4.dvi. https://www.mathcentre.ac.uk/resources/Engineering%20maths%20first%20aid%20kit/latexsource%20and%20diagrams/7_4.pdf
  - Quote: "b) z2 = −2 + j is in the second quadrant. To find its argument we seek an angle, θ, in the second quadrant such that tan θ = 1 −2 . To calculate this correctly it may help to refer to the figure below in which α is an acute angle with tan α = ¹ 2 . From a calculator α = 0 . 464 and so θ = π − 0.464 = 2.678 radians. In degrees, α = 26.57 ◦ so that θ = 180 ◦ − 26.57 ◦ = 153.43 ◦ ."

- **HELM: draw your complex number on an Argand diagram to get the correct angle** **SECONDARY**
  - Source: 10.2. https://sheffield.ac.uk/media/31975/download?attachment
  - Quote: "Remember, to get the correct angle, draw your complex number on an Argand diagram."

- **HELM: the argument is in radians in (-pi, pi], or degrees** **SECONDARY**
  - Source: 10.2. https://sheffield.ac.uk/media/31975/download?attachment
  - Quote: "We normally consider _θ_ measured in radians to lie in the interval _−_ _π < θ_ _≤_ _π_ although any value _θ_ + 2 _kπ_ for integer _k_ will be equivalent to _θ_ . The angle _θ_ may be expressed in radians or degrees."

- **OpenStax: convert polar to rectangular**
  - Source: 8.5 Polar Form of Complex Numbers - Precalculus 2e | OpenStax. https://openstax.org/books/precalculus-2e/pages/8-5-polar-form-of-complex-numbers
  - Quote: "Converting a complex number from polar form to rectangular form is a matter of evaluating what is given and using the distributive property. In other words, given first evaluate the trigonometric functions and Then, multiply through by"

_Also relevant here, quoted in full in the section named:_

- **SQA EM1 guidance: Argand diagram and principal argument**
  - Source: J7GK Engineering Mathematics 1. https://www.sqa.org.uk/sqa/files_ccc/j7gk-46-engineering-mathematics-1.pdf
  - Quote: "Demonstrate the representation of complex numbers in Cartesian and polar form (noting the domain of principal argument, arg( ) _z_ )."
  - (listed under 3.1)

My reading: the magnitude is Pythagoras and the angle is an inverse tangent, both from courses he has; the new thing is **which quadrant**. All the sources say draw the Argand diagram first.
The HN unit says to note "the domain of principal argument" (HELM and mathcentre use an angle between −180° and 180°), so the brief must pick one range and say that adding 360° names the same arrow.
Polar to Cartesian is a cos θ and a sin θ, which is exactly "splitting a force" from Trigonometry lesson 2.

### 4.6 Multiplying and dividing in polar form: multiply lengths, add angles


- **mathcentre: multiply moduli and add arguments, divide moduli and subtract arguments**
  - Source: 7_6.dvi. https://www.mathcentre.ac.uk/resources/Engineering%20maths%20first%20aid%20kit/latexsource%20and%20diagrams/7_6.pdf
  - Quote: "Note that to multiply the two numbers we multiply their moduli and add their arguments. To divide, we divide their moduli and subtract their arguments."

- **HELM: the moduli multiply together while the arguments add together** **SECONDARY**
  - Source: 10.2. https://sheffield.ac.uk/media/31975/download?attachment
  - Quote: "We see that in calculating the product that the moduli _r_ and _t_ _multiply_ together whilst the arguments arg( _z_ ) = _θ_ and arg( _w_ ) = _φ_ _add_ together."

- **Electronics Tutorials: rectangular for adding, polar for multiplying**
  - Source: Complex Numbers & Phasors in Polar and Rectangular Form. https://www.electronics-tutorials.ws/accircuits/complex-numbers.html
  - Quote: "Rectangular form is best for adding and subtracting complex numbers as we saw above, but polar form is often better for multiplying and dividing."

- **OpenStax: product multiplies the moduli and adds the angles**
  - Source: 8.5 Polar Form of Complex Numbers - Precalculus 2e | OpenStax. https://openstax.org/books/precalculus-2e/pages/8-5-polar-form-of-complex-numbers
  - Quote: "Notice that the product calls for multiplying the moduli and adding the angles."

- **mathcentre 7.6: polar form makes multiplying and dividing particularly simple**
  - Source: 7.6 Multiplication and division in polar form. https://www.mathcentre.ac.uk/resources/Engineering%20maths%20first%20aid%20kit/latexsource%20and%20diagrams/7_6.pdf
  - Quote: "When two complex numbers are given in polar form it is particularly simple to multiply and divide them. This is an advantage of using the polar form."

- **Kirtley: multiplying and dividing complex numbers multiplies magnitudes and adds angles** **SECONDARY**
  - Source: 2.6: Phasors - Engineering LibreTexts. https://eng.libretexts.org/Bookshelves/Electrical_Engineering/Electro-Optics/Introduction_to_Electric_Power_Systems_(Kirtley)/02%3A_AC_power_flow_in_linear_networks/2.06%3A_Phasors
  - Quote: "The key here is that multiplication and division of complex numbers is the same as multiplication or division of magnitudes and addition or subtraction of angles."

- **Kuphaldt (LibreTexts host, rectangular form for addition and subtraction, polar for multiplication and division, conversion needs simple trigonometry** **SECONDARY**
  - Source: 2.5: Polar Form and Rectangular Form Notation for Complex Numbers - Workforce LibreTexts. https://workforce.libretexts.org/Bookshelves/Electronics_Technology/Electric_Circuits_II_-_Alternating_Current_(Kuphaldt)/02%3A_Complex_Numbers/2.05%3A_Polar_Form_and_Rectangular_Form_Notation_for_Complex_Numbers
  - Quote: "Either method of notation is valid for complex numbers. The primary reason for having two methods of notation is for ease of longhand calculation, rectangular form lending itself to addition and subtraction, and polar form lending itself to multiplication and division. Conversion between the two notational forms involves simple trigonometry."

My reading: this is the payoff of the quarter-turn picture. Multiplying by a number of length 1 turns an arrow; multiplying by a number of length r also stretches it; so lengths multiply and angles add (HELM shows the rotation; MIT shows it for 2j: lengths ×2, angle + 90°).
Dividing is the reverse, lengths divide and angles subtract. The Kuphaldt LibreTexts line is SECONDARY (a LibreTexts copy of an ibiblio text).

### 4.7 AC circuits: impedance Z = R + jX, phasors in polar form, V = IZ, series and parallel


- **Rose-Hulman: impedances of R, L and C**
  - Source: 3-1 Sinusoidal steady-state analysis Phasor .... https://www.rose-hulman.edu/class/ee/HTML/ECE204/PDFs/phasors.pdf
  - Quote: "Resistance Inductance Capacitance impedance Z r = R Z L = jωL Z c = -j/ωC"

- **Rose-Hulman: impedance is the generalisation of resistance, unit ohm**
  - Source: 3-1 Sinusoidal steady-state analysis Phasor .... https://www.rose-hulman.edu/class/ee/HTML/ECE204/PDFs/phasors.pdf
  - Quote: "The algebraic relationship between a phasor voltage and a phasor current is a generalization of resistance and is termed an element's impedance. The unit of impedance is the ohm."

- **HMC: real part of impedance is resistance, imaginary part is reactance**
  - Source: Impedance and Generalized Ohm's Law. https://pages.hmc.edu/ruye/e84/lectures/ch3/node4.html
  - Quote: "The real part of impedance $Re[Z]=R$ is called resistance . * The imaginary part of impedance $Im[Z]=X$ is called reactance"

- **Bird: V = IZ and Z = R + jXL from the phasor diagram** **SECONDARY**
  - Source: HIGHER ENGINEERING MATHEMATICS. https://ndl.ethernet.edu.et/server/api/core/bitstreams/95c3b47e-ec1a-47d9-997e-96f202d2a949/content
  - Quote: "Thus _VR_ + _jVL_ = _V_ and since _VR_ = _IR_ , _V_ = _IXL_ (where _XL_ is the induc- tive reactance, 2 _π_ _f L_ ohms) and _V_ = _IZ_ (where _Z_ is the impedance) then _R_ + _jXL_ = _Z_ ."

- **Oregon State: V = IZ, Z a complex impedance, not a phasor**
  - Source: SECTION 2: THREE-PHASE POWER FUNDAMENTALS. https://web.engr.oregonstate.edu/~webbky/ESE470_files/Section%202%20Three%20Phase%20Power%20Fundamentals.pdf
  - Quote: "𝑍𝑍 is a complex impedance  Not a phasor, but also expressed in exponential, polar, or Cartesian form"

- **MIT ES.1803: series and parallel impedances combine like resistances**
  - Source: ES.1803 S24: Reading: Topic Enrichment: Complex Impedance. https://ocw.mit.edu/courses/es-1803-differential-equations-spring-2024/mites_1803_s24_complex_impedance.pdf
  - Quote: "We will see that the rules for combining impedances in series or parallel are exactly the same as those for resistance."

- **Utah ECE: DC analysis techniques work with AC once the complex arithmetic is done**
  - Source: Lecture 12 Introduction to AC Phasors. https://my.ece.utah.edu/~ece2210/Lect12_AC_PhasorIntro.pdf
  - Quote: "You can use impedances just like resistances as long as you deal with the complex arithmetic. ALL the DC circuit analysis techniques will work with AC."

- **HyperPhysics: parallel impedances need rationalising and are lengthy**
  - Source: Impedance. http://hyperphysics.phy-astr.gsu.edu/hbase/electric/imped.html
  - Quote: "Combining parallel impedances is more difficult and shows the power of the complex impedance approach. The expressions must be rationalized and are lengthy algebraic forms."

- **ModEL: resistance as impedance at 0 degrees, inductor +90, capacitor -90**
  - Source: "Modular Electronics Learning (ModEL) project". https://ibiblio.org/kuphaldt/socratic/model/mod_rxz.pdf
  - Quote: "Resistance is impedance with a phase angle of 0 o because with a resistor there is zero phase shift between voltage and current."

- **Kuphaldt: AC resistance is called impedance and is not one-dimensional**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 2. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_2.html
  - Quote: "However, when we begin to analyze alternating current circuits, we find that quantities of voltage, current, and even resistance (called impedance in AC) are not the familiar one-dimensional quantities we're used to measuring in DC circuits."

- **Phasor definition: a complex number representing a sinusoid** **SECONDARY**
  - Source: Phasor - Wikipedia. https://en.wikipedia.org/wiki/Phasor
  - Quote: "a complex number representing a sinusoidal function whose amplitude A and initial phase θ are time-invariant and whose angular frequency ω is fixed."

- **MIT 18.03SC: impedances of R, L and C and the complex version of Ohm's law**
  - Source: 18.03SCF11 text: Impedance. https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/f94e3d44e68bbf402604a41386d7713b_MIT18_03SCF11_s20_2text.pdf
  - Quote: "We can now write the complex version of Ohm’s law"

- **HMC: generalised Ohm's law V = Z I for AC**
  - Source: Impedance and Generalized Ohm's Law. https://pages.hmc.edu/ruye/e84/lectures/ch3/node4.html
  - Quote: "This is the generalized version of the Ohm's law for AC circuits."

- **Kirtley: the phase angle between voltage and current is the phase angle of the impedance** **SECONDARY**
  - Source: 2.6: Phasors - Engineering LibreTexts. https://eng.libretexts.org/Bookshelves/Electrical_Engineering/Electro-Optics/Introduction_to_Electric_Power_Systems_(Kirtley)/02%3A_AC_power_flow_in_linear_networks/2.06%3A_Phasors
  - Quote: "Note that the phase angle between voltage and current is the same as the phase angle of the impedance."

_Also relevant here, quoted in full in the section named:_

- **Pearson 4002 content: complex numbers and resultants, leading and lagging LRC circuits**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "Complex numbers and resultants using mathematics Adding two sine waves using oscilloscope for practical method Adding two sine waves using graphical method Adding two sine waves using vector method Subtracting the sine waves that are out of phase Leading and lagging circuit examples using LRC circuits"
  - (listed under 3.4)

My reading: write resistance R, an inductor's reactance +jωL (equal to +jX_L) and a capacitor's reactance 1/(jωC) = −j/(ωC) = −jX_C, and impedance Z = R + jX is the sum for a series circuit. The reason 1/j = −j is the quarter turn back (MIT: division by i is rotation by −π/2).
Ohm's law V = IZ then has the same shape as the DC law, and the **angle of Z is the angle between voltage and current** (Kirtley), which ties to the power-factor angle from Trigonometry lesson 8. Series impedances add; parallel impedances combine "like resistors" (1/Z = 1/Z₁ + 1/Z₂), but HyperPhysics warns that the parallel algebra is "lengthy", which is a reason to keep parallel to two branches and to use product over sum for two.
In the brief, the electrician's DC knowledge (Ohm, series, parallel) should be the starting point and the complex number the new notation.

### 4.8 De Moivre's theorem (only if the HNC lines ask)


- **Bird: De Moivre's theorem for powers and roots** **SECONDARY**
  - Source: HIGHER ENGINEERING MATHEMATICS. https://ndl.ethernet.edu.et/server/api/core/bitstreams/95c3b47e-ec1a-47d9-997e-96f202d2a949/content
  - Quote: "The theorem is true for all positive, negative and frac- tional values of _n_ . The theorem is used to determine powers and roots of complex numbers."

My reading: the HNC lines do not ask for it (SQA Engineering Mathematics 1 lists none; Pearson 4002 lists none; it appears in the Advanced Higher spec, HELM 10.4, Bird's second chapter and Pearson's HND unit 5006). So at most **one stretch screen**: repeating the polar multiplication n times gives rⁿ∠nθ. Roots, loci and the exponential form stay out.

## 5. Prerequisites: what this topic leans on

The sources say the same thing. HELM 10.2 lists a complex number, sin, cos and tan, polynomials and "a knowledge of vectors"; Brilliant assumes the Cartesian and polar plane, quadratics and basic trigonometry; the HN unit assumes good algebra, transposing formulae and simple trigonometric equations.


- **HELM tutor's guide: do not assume algebraic fluency, take it slowly** **SECONDARY**
  - Source: About the HELM Project. https://nucinkis-lab.cc.ic.ac.uk/HELM/HELM_Workbooks_46-50/WB50-all.pdf
  - Quote: "Given the poor grasp of real number algebra among many students, it is wise not too assume too much algebraic fluency, so take it slowly."

- **Bird: a quadratic with a negative discriminant leads to the first complex numbers** **SECONDARY**
  - Source: HIGHER ENGINEERING MATHEMATICS. https://ndl.ethernet.edu.et/server/api/core/bitstreams/95c3b47e-ec1a-47d9-997e-96f202d2a949/content
  - Quote: "(i) If the quadratic equation _x_ ² + 2 _x_ + 5 = 0 is solved using the quadratic formula then,"

- **Bird: the two answers are called complex numbers** **SECONDARY**
  - Source: HIGHER ENGINEERING MATHEMATICS. https://ndl.ethernet.edu.et/server/api/core/bitstreams/95c3b47e-ec1a-47d9-997e-96f202d2a949/content
  - Quote: "(ii) −1 + _j_ 2 and −1 − _j_ 2 are known as complex numbers"

_Also relevant here, quoted in full in the section named:_

- **Brilliant's prerequisite: cartesian and polar plane, quadratics, basic trigonometry**
  - Source: Practice Complex Numbers | Brilliant. https://brilliant.org/courses/complex-plane/
  - Quote: "Assumes comfort with the cartesian and polar coordinate plane, quadratic equations and basic trigonometry."
  - (listed under 1.1)

- **Polar course prerequisite**
  - Source: Practice Polar Coordinate Plane | Brilliant. https://brilliant.org/courses/polar-coordinate-plane
  - Quote: "This course assumes familiarity with the coordinate plane, angles and basic algebra."
  - (listed under 1.2)

- **HELM 10.2 prerequisites: complex numbers, trig, polynomials, vectors** **SECONDARY**
  - Source: Argand Diagrams and the Polar Form. https://sheffield.ac.uk/media/31975/download?attachment
  - Quote: "Prerequisites Before starting this Section you should . . . • know what a complex number is • be able to use trigonometric functions sin, cos and tan • understand what a polynomial is • possess a knowledge of vectors"
  - (listed under 2.4)

- **MCA Second Engineer Mathematics: right-angled triangles and Pythagoras**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "Determines Sin, Cos and Tan from given right angled triangle. 6. Reads values of Sin, Cos, Tan, Sec, Cosec and Cot for any angle between 0’ and 90’. 7. Determines an angle from tables knowing its sin, cos, tan, sec, cosec or cot. 8. Determines values of sin, etc, for angles 90’ - 360’ and also is able to obtain an angle (00 - 360’) knowing its sin, etc. 9. States the theorem of Pythagoras. 10. Solves right angled triangles for any side or angle."
  - (listed under 3.5)

- **MCA Second Engineer Mathematics: angles in degrees or radians**
  - Source: Mathematics Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/mathematics-written-examination-syllabus
  - Quote: "States that angles are measured in degrees or radians and relates the two."
  - (listed under 3.5)

- **SQA H7K0 33: recommended entry is Technician 1, Intermediate 2 or National 5 Mathematics**
  - Source: Engineering Mathematics 1 (SCQF level 6) Unit code: H7K0 33. https://www.sqa.org.uk/files/hn/H7K033.pdf
  - Quote: "This knowledge and understanding may be evidenced by possession of the NQ Unit Mathematics: Technician 1 or a pass at Intermediate 2 or National 5 in Mathematics."
  - (listed under 3.1)

**What Dan has (from the built or briefed courses, my reading of their briefs) and what must be taught inline:**

| Need | Where Dan has it | Inline? |
|---|---|---|
| Right-angled triangle trigonometry, inverse sin, cos and tan | Trigonometry lessons 1 and 2 | No |
| Pythagoras | Geometry fundamentals | No |
| Any angle, quadrants, a negative cosine | Trigonometry lesson 3 (the arm round the circle) | No; re-use it for the argument |
| Splitting an arrow into floor and wall parts; adding arrows by parts | Trigonometry lessons 2 and 7 (phasors) | No; this is "vectors" in HELM's list |
| Degrees and radians | Trigonometry lesson 5 | No (degrees for the main flow) |
| Plotting points | The coordinate plane | No |
| Naming a point by length and angle (polar coordinates) | Not named in any brief; Trigonometry has the arm round the circle | **Yes**: one short step in the polar-form lesson |
| Expanding two brackets | Quadratics lesson 1 | No |
| A negative discriminant ("no real roots") | Quadratics lesson 5, which stops there and points to this course | **Yes**: this is the way in |
| Rationalising a denominator | Left out of Powers and roots | **Yes**: as the conjugate move |
| Power factor as a cosine | Trigonometry lesson 8 | No; this is where it comes back |
| Ohm's law, series and parallel resistance | Dan's trade, not an app course | No; assume it |
| Rearranging V = IZ | Linear equations | No |
| Negative numbers and signs | Negative numbers | No; but signs of j powers need care (section 6.1) |

There is no vectors course in the folder. Trigonometry lesson 7 covers adding arrows, which is all HELM's "vectors" is used for here.
**UNCONFIRMED by script:** the entry line "good algebraic skills together with an ability to transpose engineering formulae and solve simple trigonometric equations" is in both SQA texts I read (the 2026 J7GK PDF, and the 2014 H7K0 33 PDF in an earlier search result) but outside the checker's view; the 2014 file's checked line gives the recommended entry as Technician 1, Intermediate 2 or National 5 Mathematics.

## 6. Misconceptions and learning science for each skill

Sources are research papers (a PME-NA paper, a Zimbabwean case study, a journal paper on the complex unit, a conference paper on rotations), examiner reports (Pearson International Advanced Level 2022, NZQA 2024), university help pages, and an electronics-teaching module on why impedance confuses students.

### 6.1 What j means and j squared


- **Research: complex numbers bring difficulties linked to their nature and terminology**
  - Source: Cognitive obstacles in the learning of complex number concepts: A case study of in-service undergraduate physics student-teachers in Zimbabwe. https://files.eric.ed.gov/fulltext/EJ1359582.pdf
  - Quote: "Nordlander (2012) noted that the study of complex numbers is associated with a variety of difficulties and misconceptions that are linked to its nature and terminology."

- **Research: new terms such as imaginary, conjugate, Argand diagram and complex plane are hard to comprehend**
  - Source: Cognitive obstacles in the learning of complex number concepts: A case study of in-service undergraduate physics student-teachers in Zimbabwe. https://files.eric.ed.gov/fulltext/EJ1359582.pdf
  - Quote: "students will encounter new terms such as imaginary, conjugate, argand diagram, and complex plane, which are difficult to comprehend."

- **Research: 60 percent could not see the need for the definition of the root of a negative number as i times the root**
  - Source: Cognitive obstacles in the learning of complex number concepts: A case study of in-service undergraduate physics student-teachers in Zimbabwe. https://files.eric.ed.gov/fulltext/EJ1359582.pdf
  - Quote: "Sixty percent of the participants could not figure out the need to use the definition √−𝑎 = 𝑖√𝑎."

- **Research: students make errors failing to replace root of -1 by j and in powers of j**
  - Source: Cognitive obstacles in the learning of complex number concepts: A case study of in-service undergraduate physics student-teachers in Zimbabwe. https://files.eric.ed.gov/fulltext/EJ1359582.pdf
  - Quote: "Ahmad and Shahrill (2014) also revealed that students make errors in failing to replace √−1 by j as well ignoring the sign of the negative numbers and powers of j."

- **Research: Egan advocated introducing the root of -1 as i squared first**
  - Source: Cognitive obstacles in the learning of complex number ... - ed. https://files.eric.ed.gov/fulltext/EJ1359582.pdf
  - Quote: "hence he advocated that students must be introduced to the square root of −1 as 2 before embarking on any other concepts involving complex numbers."

- **Scimath paper: defining i as the square root of -1 leads to fundamental misconceptions**
  - Source: Two Challenging Concepts in Mathematics Education: Subject-Specific Thoughts on the Complex Unit and Angles. https://www.scimath.net/download/two-challenging-concepts-in-mathematics-education-subject-specific-thoughts-on-the-complex-unit-and-11251.pdf
  - Quote: "we consider this approach unjustifiable, as it leads to fundamental misconceptions concerning complex numbers and real numbers."

- **Scimath paper: an empirical study suggests the root-of-minus-one notion can hinder understanding**
  - Source: Two Challenging Concepts in Mathematics Education: Subject-Specific Thoughts on the Complex Unit and Angles. https://www.scimath.net/download/two-challenging-concepts-in-mathematics-education-subject-specific-thoughts-on-the-complex-unit-and-11251.pdf
  - Quote: "an empirical study on this specific topic suggests that the notion of 𝑖𝑖 being the square root of -1 can hinder students’ understanding of complex numbers and the square root function in general (Chin & Jiew, 2018)."

- **Scimath paper: write i squared equals minus one instead**
  - Source: Two Challenging Concepts in Mathematics Education: Subject-Specific Thoughts on the Complex Unit and Angles. https://www.scimath.net/download/two-challenging-concepts-in-mathematics-education-subject-specific-thoughts-on-the-complex-unit-and-11251.pdf
  - Quote: "it seems best to simply banish the commonly used equation 𝑖𝑖 = √−1 for the above-mentioned reasons and instead write 𝑖𝑖 ² = −1."

- **Scimath paper: the term imaginary unit is unfortunate**
  - Source: Two Challenging Concepts in Mathematics Education: Subject-Specific Thoughts on the Complex Unit and Angles. https://www.scimath.net/download/two-challenging-concepts-in-mathematics-education-subject-specific-thoughts-on-the-complex-unit-and-11251.pdf
  - Quote: "On a last note, we state that the term _imaginary unit_ often used for 𝑖𝑖 is most unfortunate for teaching and learning about complex numbers."

My reading: three findings for the brief. (1) The words "imaginary" and "square root of minus one" carry confusion, so lead with the rule j² = −1 and the quarter-turn picture, and say "imaginary" once. (2) Sign errors on powers of j (j³ = −j, j⁴ = 1) are a documented error, so give a quick quarter-turn check: four turns come back. (3) The Scimath paper's point is that the rules for the root of a positive number do not carry over to "√−1", which is why a learner should not be handed a "√−1" to calculate with.

### 6.2 The conjugate and dividing


- **Research: students confused the conjugate of a root with the root of the negative**
  - Source: Cognitive obstacles in the learning of complex number concepts: A case study of in-service undergraduate physics student-teachers in Zimbabwe. https://files.eric.ed.gov/fulltext/EJ1359582.pdf
  - Quote: "He confused the term complex conjugate and thought that the complex conjugate of √2 is √−2."

- **Research: students believed a conjugate must have a positive and a negative number**
  - Source: Cognitive obstacles in the learning of complex number concepts: A case study of in-service undergraduate physics student-teachers in Zimbabwe. https://files.eric.ed.gov/fulltext/EJ1359582.pdf
  - Quote: "They thought that a complex conjugate of a complex number must have a positive and negative number."

- **Research: students were confident in applying algorithms wrongly**
  - Source: Cognitive obstacles in the learning of complex number concepts: A case study of in-service undergraduate physics student-teachers in Zimbabwe. https://files.eric.ed.gov/fulltext/EJ1359582.pdf
  - Quote: "Here, we can see that the participants were confident in applying algorithms wrongly."

- **Research: students used rationalising from surds out of its domain**
  - Source: Cognitive obstacles in the learning of complex number concepts: A case study of in-service undergraduate physics student-teachers in Zimbabwe. https://files.eric.ed.gov/fulltext/EJ1359582.pdf
  - Quote: "This idea of rationalizing the denominator was used out of its domain."

My reading: the error in the research is a surd reflex. Dan's Powers and roots course left rationalising out, so he may have no surd habit to misapply, but the course should still show the conjugate as "change the sign of the j part, nothing else", and show that z × conjugate is a real number.
Because the confident wrong algorithm is the documented risk, give a check by multiplying back.

### 6.3 Modulus, argument and the quadrant


- **Research: students squared bi instead of b when finding the modulus**
  - Source: Cognitive obstacles in the learning of complex number concepts: A case study of in-service undergraduate physics student-teachers in Zimbabwe. https://files.eric.ed.gov/fulltext/EJ1359582.pdf
  - Quote: "Students failed to apply the formular 𝑎 + 𝑏𝑖 = √𝑎 ² + 𝑏 ² whereby they were squaring 𝑏𝑖 instead of 𝑏 such that they end up getting a negative result."

- **Research: students did not distinguish the argument from the principal argument or draw the number**
  - Source: Cognitive obstacles in the learning of complex number concepts: A case study of in-service undergraduate physics student-teachers in Zimbabwe. https://files.eric.ed.gov/fulltext/EJ1359582.pdf
  - Quote: "many of the participants failed to distinguish the argument in polar form of a complex number and the principal argument. In addition, they failed to visually represent the complex number in coordinate form."

- **Research: dwell on the Argand diagram so students do not struggle to find the principal value**
  - Source: Cognitive obstacles in the learning of complex number concepts: A case study of in-service undergraduate physics student-teachers in Zimbabwe. https://files.eric.ed.gov/fulltext/EJ1359582.pdf
  - Quote: "It is also important to dwell much on the use of an argand diagram so that the students will not struggle to find the principal value."

- **Newcastle: arctan gives the same number for 1+i and -1-i**
  - Source: Numeracy, Maths and Statistics - Academic Skills Kit. https://www.mas.ncl.ac.uk/ask/numeracy-maths-statistics/core-mathematics/pure-maths/algebra/modulus-and-argument.html
  - Quote: "However, the same calculation for $z_2=-1-i$ gives $\arctan \left(\frac{-1}{-1}\right) = \arctan (1) = \dfrac{\pi}{4}$, the same number!"

- **Newcastle: draw the Argand diagram to decide which formula to use**
  - Source: Numeracy, Maths and Statistics - Academic Skills Kit. https://www.mas.ncl.ac.uk/ask/numeracy-maths-statistics/core-mathematics/pure-maths/algebra/modulus-and-argument.html
  - Quote: "It's a good idea to draw an Argand diagram of the complex number when making the decision about which formula to use."

- **Pearson IAL examiners: obtaining an angle in the correct quadrant was much more troublesome**
  - Source: Examiners’ Report Principal Examiner Feedback January 2022. https://qualifications.pearson.com/content/dam/pdf/International%20Advanced%20Level/Mathematics/2018/Exam-materials/WFM02_01_pef_20220303.pdf
  - Quote: "Much more troublesome was obtaining an angle in the correct quadrant"

- **NZQA 2024 report: a diagram is encouraged to identify the correct argument**
  - Source: NCEA Level 3 Calculus 2024. https://www.nzqa.govt.nz/nqfdocs/ncea-resource/reports/2024/91579-report-2024.pdf
  - Quote: "The use of a diagram is encouraged to help identify the correct argument value that will then lead into setting up a general solution with this correct initial angle."

- **NZQA 2024 report: trouble representing the modulus correctly wasted later marks**
  - Source: NCEA Level 3 Calculus 2024. https://www.nzqa.govt.nz/nqfdocs/ncea-resource/reports/2024/91579-report-2024.pdf
  - Quote: "Candidates had trouble representing the modulus correctly, so all consequent evidence in the question was wasted."

- **MIT ES.1803 topic 4: the norm does not include the i**
  - Source: ES.1803 S24: Reading: Topic 4: Complex Numbers and Exponentials. https://ocw.mit.edu/courses/es-1803-differential-equations-spring-2024/mites_1803_s24_topic4.pdf
  - Quote: "Note this really well: The norm is the sum of 𝑥 2 and 𝑦 2 it does not include the 𝑖 ! Therefore, it is always positive"

My reading: three predictable mistakes. (a) Squaring the j part with its j (|3 + 4j| = √(3² + (4j)²) gives a negative); the length uses b, not jb. (b) The inverse tangent returns the same angle for 1 + j and −1 − j; the number's quadrant decides, so **draw it first** (every source says so; the NZQA report says the same of examiners). (c) A wrong modulus wastes all the marks after it.
These are the pieces to build as interactives where Dan places the point and sees the angle before the calculator answers.

### 6.4 Geometry versus algebra


- **RUME paper: students see multiplying by -1 as a reflection not a rotation by 180 degrees**
  - Source: Microsoft Word - Soto-Johnson & Oehrtman_Proceedings.pdf. http://sigmaa.maa.org/rume/crume2011/RUME2011_FinalSchedule_files/PreliminaryReportsShortPapers/Soto-Johnson%20&%20Oehrtman_Proceedings.pdf
  - Quote: "but empirical evidence suggests students do not view multiplying a number by – 1 as a rotation of 180°, rather they perceive it as a reflection"

- **RUME paper: multiplying by i as a 90 degree rotation lets complex numbers be seen as vectors**
  - Source: Microsoft Word - Soto-Johnson & Oehrtman_Proceedings.pdf. http://sigmaa.maa.org/rume/crume2011/RUME2011_FinalSchedule_files/PreliminaryReportsShortPapers/Soto-Johnson%20&%20Oehrtman_Proceedings.pdf
  - Quote: "multiplying by i geometrically represents a rotation of 90º counterclockwise. This representation allowed mathematicians to begin to think about complex numbers as vectors"

- **PME-NA paper: teaching emphasises the algebraic register and loses essential characteristics**
  - Source: Proceedings of the Forty-Fourth Annual Meeting of the North American Chapter of the International Group for the Psychology of Mathematics Education. https://files.eric.ed.gov/fulltext/ED630443.pdf
  - Quote: "In teaching, they have identified an emphasis on the algebraic register, which results in a loss of essential characteristics of complex numbers"

- **PME-NA paper: a geometric-first sequence helped students coordinate algebra and geometry**
  - Source: Proceedings of the Forty-Fourth Annual Meeting of the North American Chapter of the International Group for the Psychology of Mathematics Education. https://files.eric.ed.gov/fulltext/ED630443.pdf
  - Quote: "The results show how the activity sequence allowed students to coordinate algebraic and geometric processes on complex numbers to improve their conceptions."

- **ERIC EJ753911: pupils used the geometric approach more but the algebraic approach more consistently**
  - Source: ERIC - EJ753911 - Geometric and Algebraic Approaches in the .... https://eric.ed.gov/?id=EJ753911
  - Quote: "The geometric approach was used more frequently, while the pupils used the algebraic approach more consistently and in a more persistent way."

- **HELM tutor's guide: a point represents a complex number and is not the number itself** **SECONDARY**
  - Source: About the HELM Project. https://nucinkis-lab.cc.ic.ac.uk/HELM/HELM_Workbooks_46-50/WB50-all.pdf
  - Quote: "care must be taken to stress that a point on the diagram _represents_ a complex number and is not the number itself."

My reading: the research favours teaching the plane and the rotation first and the algebra second, because teaching that stays in the algebra "loses essential characteristics", and a sequence that coordinated the two improved students' conceptions. One caution: students may see "× −1" as a mirror, not a half turn; the brief should show the half turn with j × j.

### 6.5 AC circuits, phasors and impedance


- **ModEL: reactance and impedance strike students as vague and confusing**
  - Source: "Modular Electronics Learning (ModEL) project". https://ibiblio.org/kuphaldt/socratic/model/mod_rxz.pdf
  - Quote: "Reactance (X) and impedance (Z), which are the closest equivalent to resistance for components such as capacitors and inductors in AC circuit, often strike students as being vague and confusing."

- **ModEL: students treat AC analysis as wholly different from DC analysis**
  - Source: "Modular Electronics Learning (ModEL) project". https://ibiblio.org/kuphaldt/socratic/model/mod_rxz.pdf
  - Quote: "students have a tendency to view AC circuit analysis as wholly different from DC circuit analysis, with its own unique formulae and strategies."

- **ModEL: phase shift is a relative quantity and can be written in several ways**
  - Source: "Modular Electronics Learning (ModEL) project". https://ibiblio.org/kuphaldt/socratic/model/mod_rxz.pdf
  - Quote: "Phase shift – like voltage, phase shift is a relative quantity. A single AC waveform, without another waveform to compare to, cannot have a phase value at all. Only when two waves of the same frequency are compared against one another may we intelligently state a phase shift, or time displacement, between the two. Properly reading phase shifts from an oscillograph can also be challenging for students, and requires reminding that time goes from left to right on an oscillograph: i.e. the wave reaching its peak first (left) compared to the other is leading, while the other is lagging. Another confusing aspect of phase shift is that it may be expressed in multiple ways: e.g. +90 o phase shift is equivalent to −270 o phase shift"

- **ModEL: the calculator gives reactance only, you must attach the phase angle**
  - Source: "Modular Electronics Learning (ModEL) project". https://ibiblio.org/kuphaldt/socratic/model/mod_rxz.pdf
  - Quote: "the result provided by your calculator is a scalar quantity and not a complex (phasor) quantity."

- **UTK lab: a phasor is a complex number, not a vector**
  - Source: 4 AC Circuits Phasors, Impedance and Transformers. https://web.eecs.utk.edu/~mjr/ECE202/Labs/Lab%204.pdf
  - Quote: "Therefore one might think that a phasor is a vector. Phasors and vectors share some qualities but not others. We cannot apply curl, divergence, and dot product to phasore and get other phasors."

- **UTK lab: a phasor is a complex number representing magnitude and phase**
  - Source: 4 AC Circuits Phasors, Impedance and Transformers. https://web.eecs.utk.edu/~mjr/ECE202/Labs/Lab%204.pdf
  - Quote: "A phasor is a complex number that represents the magnitude and phase of a voltage or a current."

- **MIT 6.061: phasors are a handy geometric trick**
  - Source: 6.061 Class Notes, Chapter 2: AC Power Flow in Linear Networks. https://ocw.mit.edu/courses/6-061-introduction-to-electric-power-systems-spring-2011/9cf8de165233601f547b284cee5c2131_MIT6_061S11_ch2.pdf
  - Quote: "Phasors are not weapons. They are a handy geometric trick which help us understand the nature of sinusoidal steady state"

- **OpenStax: the ELI the ICE man mnemonic**
  - Source: 15.3 RLC Series Circuits with AC - University Physics Volume 2 | OpenStax. https://openstax.org/books/university-physics-volume-2/pages/15-3-rlc-series-circuits-with-ac
  - Quote: "A mnemonic device of “ELI the ICE man” is sometimes used to remember that the emf (E) leads the current (I) in an inductor (L) and the current (I) leads the emf (E) in a capacitor (C)."

- **Kirtley: the phase angle by itself is of little use, the differences matter** **SECONDARY**
  - Source: 2.6: Phasors - Engineering LibreTexts. https://eng.libretexts.org/Bookshelves/Electrical_Engineering/Electro-Optics/Introduction_to_Electric_Power_Systems_(Kirtley)/02%3A_AC_power_flow_in_linear_networks/2.06%3A_Phasors
  - Quote: "Usually the phase angle by itself is of little use, and must be related to some time reference. That is, as we will see, it is the difference between phase angles that is important in most cases."

My reading: reactance and impedance confuse students, who treat AC analysis as a separate subject; the cure in the sources is to show that impedance is resistance with an angle, and that DC methods still work. Phase is relative: only the difference between two angles means anything. A phasor is a complex number: you cannot apply curl, divergence or the dot product to phasors and get other phasors, and a phasor by itself is not the signal. Remember the calculator gives the size of a reactance only; the course should attach the angle (−j for a capacitor, +j for a coil) as a visible step. ELI the ICE man is a recall aid, labelled as a mnemonic.

## 7. Where it is used for an electrician going into marine engineering

Each use below has a quote from a reachable page. All of it is AC work that a marine engineer or electro-technical officer does.

### 7.1 Uses and the sources that name them


- **Bird 23.8: applications of complex numbers in AC theory and mechanical vector analysis** **SECONDARY**
  - Source: HIGHER ENGINEERING MATHEMATICS. https://ndl.ethernet.edu.et/server/api/core/bitstreams/95c3b47e-ec1a-47d9-997e-96f202d2a949/content
  - Quote: "There are several applications of complex numbers in science and engineering, in particular in electrical alternating current theory and in mechanical vector analysis."

- **MIT 6.061: most ships at sea run at 60 Hz**
  - Source: 6.061 Class Notes, Chapter 2: AC Power Flow in Linear Networks. https://ocw.mit.edu/courses/6-061-introduction-to-electric-power-systems-spring-2011/9cf8de165233601f547b284cee5c2131_MIT6_061S11_ch2.pdf
  - Quote: "In North America, most ships at sea and eastern Japan that frequency is 60 Hz."

- **MIT 6.061: impedances are complex numbers so phasors show voltage and current relationships**
  - Source: 6.061 Class Notes, Chapter 2: AC Power Flow in Linear Networks. https://ocw.mit.edu/courses/6-061-introduction-to-electric-power-systems-spring-2011/9cf8de165233601f547b284cee5c2131_MIT6_061S11_ch2.pdf
  - Quote: "Impedances and admittances are also complex numbers, so that phasors can be used to visualize the relationship between voltages and currents in a network."

- **ETO certificate question: two alternators in parallel, load and power factor** **SECONDARY**
  - Source: ETO COC NUMERICAL QUESTIONS AND ANSWERS - SOLVED II. https://www.electrotechnicalofficer.com/2020/04/eto-coc-numerical-questions-and-answers_23.html
  - Quote: "Two alternators are working in parallel supply a lighting load of 3000 KW and motor load aggregating to 5000 KW at 0.72 pf. One machine loaded up to 5000 KW at 0.8 pf lagging. What is the load and power factor of the other machine?"

- **Wikipedia Phasor: phasor representation gives amplitude and phase as one complex number** **SECONDARY**
  - Source: Phasor - Wikipedia. https://en.wikipedia.org/wiki/Phasor
  - Quote: "Phasor representation allows the analyst to represent the amplitude and phase of the signal using a single complex number."

- **Kuphaldt: AC resistance is called impedance**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 2. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_2.html
  - Quote: "quantities of voltage, current, and even resistance (called impedance in AC) are not the familiar one-dimensional quantities we're used to measuring in DC circuits."

- **Unit 52 (Pearson 2017 spec): complex numbers to represent quantities in AC circuits** **SECONDARY**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "Application of complex numbers to represent quantities in AC circuits"

- **Pearson 2017 spec Unit 39: complex number applications such as electric circuit analysis** **SECONDARY**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "Complex number applications e.g. electric circuit analysis, information and energy control systems"

_Also relevant here, quoted in full in the section named:_

- **MCA Marine Electro-Technology: phasor quantity and phasor addition of ac quantities**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Explains the term phasor quantity. 20. Explains how phasors may be used to represent sinusoidal quantities. 21. Solves graphical problems involving addition and subtraction of ac voltages and currents using phasor method."
  - (listed under 3.5)

- **MCA Marine Electro-Technology: reactance, phasor diagrams and impedance triangles for series circuits**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Defines and calculates inductive reactance and capacitive reactance. 25. Constructs and uses phasor diagrams for R-L, R-C and R-L-C series circuits. 26. Sketches and uses impedance triangles for the series circuits in 2.1.25."
  - (listed under 3.5)

- **MCA Marine Electro-Technology: synchronising a 3 phase ac generator**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Explains how to safely synchronise an incoming 3 phase ac generator to live busbars using lamps and/or synchroscope and voltmeters."
  - (listed under 3.5)

- **SQA Electrical Engineering Principles: analyse RL, RC and RLC circuits using complex notation**
  - Source: J6CW 47 Electrical Engineering Principles. https://www.sqa.org.uk/sqa/files_ccc/j6cw-47-electrical-engineering-principles.pdf
  - Quote: "Analyse RL, RC and RLC electrical circuits using complex notation."
  - (listed under 3.3)

- **SQA Electrical Engineering Principles: three-phase phasor diagrams**
  - Source: J6CW 47 Electrical Engineering Principles. https://www.sqa.org.uk/sqa/files_ccc/j6cw-47-electrical-engineering-principles.pdf
  - Quote: "Draw phasor diagrams for balanced three-phase loads."
  - (listed under 3.3)

- **Pearson 4002 content: complex numbers and resultants, leading and lagging LRC circuits**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "Complex numbers and resultants using mathematics Adding two sine waves using oscilloscope for practical method Adding two sine waves using graphical method Adding two sine waves using vector method Subtracting the sine waves that are out of phase Leading and lagging circuit examples using LRC circuits"
  - (listed under 3.4)

- **Kirtley: the phase angle between voltage and current is the phase angle of the impedance** **SECONDARY**
  - Source: 2.6: Phasors - Engineering LibreTexts. https://eng.libretexts.org/Bookshelves/Electrical_Engineering/Electro-Optics/Introduction_to_Electric_Power_Systems_(Kirtley)/02%3A_AC_power_flow_in_linear_networks/2.06%3A_Phasors
  - Quote: "Note that the phase angle between voltage and current is the same as the phase angle of the impedance."
  - (listed under 4.7)

- **Bird's author is at the Royal Naval School of Marine Engineering** **SECONDARY**
  - Source: HIGHER ENGINEERING MATHEMATICS. https://ndl.ethernet.edu.et/server/api/core/bitstreams/95c3b47e-ec1a-47d9-997e-96f202d2a949/content
  - Quote: "JOHN BIRD Royal Naval School of Marine Engineering, HMS Sultan"
  - (listed under 2.5)

My reading, in order of how close they are to Dan's job: (1) the **impedance of a winding or a cable** as R + jX, and the current as V ÷ Z in polar form; (2) **power factor** as the cosine of the impedance angle, the number behind alternator loading; (3) **sharing load between alternators in parallel**, where real power and the reactive part are both tracked (the ETO question is a worked example; it is SECONDARY, a blog of past questions); (4) **synchronising** an incoming generator by comparing its phase with the busbars' (MCA syllabus lines in section 3.5); (5) **three-phase phasors 120° apart** (SQA Electrical Engineering Principles in section 3.3).
The MIT note says most ships at sea run at 60 Hz, which sets ω = 2π × 60 for a lesson on a ship's supply (that is a cited constant, not an invented number).

## 8. Size: how many lessons, and which core supports six to eight

Sizes the sources give are below. The benchmarks spend far more than six to eight lessons because they go further (powers and roots, loci, the exponential form). The sources that aim at an engineer spend little: mathcentre has seven short leaflets, Bird has eight sections in his complex-numbers chapter, HELM has four sections in 34 pages of which two are the Dan core, and SQA's old unit gave vectors and complex numbers together 14 hours.


_Also relevant here, quoted in full in the section named:_

- **Brilliant Complex Numbers is 50 lessons and 877 exercises**
  - Source: Practice Complex Numbers | Brilliant. https://brilliant.org/courses/complex-plane/
  - Quote: "Work with imaginary and complex numbers and the complex plane. 50 Lessons 877 Exercises"
  - (listed under 1.1)

- **Brilliant Polar Coordinate Plane is 35 lessons and 603 exercises**
  - Source: Practice Polar Coordinate Plane | Brilliant. https://brilliant.org/courses/polar-coordinate-plane
  - Quote: "Learn to describe the world using the language of distance and angle. 35 Lessons 603 Exercises"
  - (listed under 1.2)

- **Khan Academy Precalculus Unit 3 skills list in order**
  - Source: Complex numbers | Precalculus | Math | Khan Academy. https://www.khanacademy.org/math/precalculus/x9e81a4f98389efdf:complex
  - Quote: "1. Plot numbers on the complex plane 2. Graphically add & subtract complex numbers 3. Distance of complex numbers 4. Midpoint of complex numbers 5. Complex numbers: Quiz 1 6. Complex number conjugates 7. Divide complex numbers 8. Factor polynomials: complex numbers 9. Complex numbers: Quiz 2 10. Modulus (absolute value) of complex numbers 11. Angle of complex numbers 12. Complex numbers from absolute value & angle 13. Complex numbers: Quiz 3 14. Complex plane and polar form 15. Polar & rectangular forms of complex numbers 16. Graphically multiply complex numbers 17. Multiply & divide complex numbers in polar form 18. Powers of complex numbers 19. Complex numbers: Quiz 4 20. Complex numbers: Unit test"
  - (listed under 2.1)

- **Khan Academy Algebra 2 Unit 2 skills list**
  - Source: Complex numbers | Algebra 2 | Math | Khan Academy. https://www.khanacademy.org/math/algebra2/x2ec2f6f830c9fb89:complex
  - Quote: "1. Simplify roots of negative numbers 2. Powers of the imaginary unit 3. Parts of complex numbers 4. Classify complex numbers 5. Plot numbers on the complex plane 6. Complex numbers: Quiz 1 7. Add & subtract complex numbers 8. Multiply complex numbers (basic) 9. Multiply complex numbers 10. Solve quadratic equations: complex solutions 11. Complex numbers: Quiz 2 12. Complex numbers: Unit test"
  - (listed under 2.2)

- **HELM Workbook 10 is 34 pages with four sections**
  - Source: About the HELM Project. https://www.lboro.ac.uk/media/media/schoolanddepartments/mlsc/downloads/HELM%20Workbook%2049%20Student's%20Guide.pdf
  - Quote: "Workbook 10 - Complex Numbers (34 pages) 10.1 Complex Arithmetic 10.2 Argand Diagrams and the Polar Form 10.3 The Exponential Form of a Complex Number 10.4 De Moivre’s Theorem"
  - (listed under 2.4)

- **mathcentre/STEM: seven leaflets on complex numbers for engineers**
  - Source: Complex Numbers | Resources. https://www.stem.org.uk/resources/library/resource/30354/complex-numbers
  - Quote: "Mathcentre provide these resources which cover aspects of complex numbers, often used in the field of engineering. They include the definition of a complex number and their associated arithmetic, the Argand diagram and polar form of a complex number, as well as the exponential form."
  - (listed under 2.6)

- **Bird (5th ed.) chapter 23 sections: Cartesian, Argand, arithmetic, polar, applications** **SECONDARY**
  - Source: HIGHER ENGINEERING MATHEMATICS. https://ndl.ethernet.edu.et/server/api/core/bitstreams/95c3b47e-ec1a-47d9-997e-96f202d2a949/content
  - Quote: "23.1 Cartesian complex numbers 249 23.2 The Argand diagram 250 23.3 Addition and subtraction of complex numbers 250 23.4 Multiplication and division of complex numbers 251 23.5 Complex equations 253 23.6 The polar form of a complex number 254 23.7 Multiplication and division in polar form 256 23.8 Applications of complex numbers 257"
  - (listed under 2.5)

- **SQA H7K0 33 support notes: vectors and complex numbers get 14 hours**
  - Source: Engineering Mathematics 1 (SCQF level 6) Unit code: H7K0 33. https://www.sqa.org.uk/files/hn/H7K033.pdf
  - Quote: "Outcome 3 (14 hours) Apply mathematical techniques to vectors and complex numbers"
  - (listed under 3.1)

- **SQA Electrical Engineering Principles: AC power and power factor improvement**
  - Source: J6CW 47 Electrical Engineering Principles. https://www.sqa.org.uk/sqa/files_ccc/j6cw-47-electrical-engineering-principles.pdf
  - Quote: "RL, RC and RLC circuits • AC power • power factor improvement • resonating passive circuits"
  - (listed under 3.3)

**My reading, a core of seven lessons plus one worked circuit (eight), with de Moivre as a stretch screen:**

1. **A number for the square root of minus one**: the negative discriminant from Quadratics, j² = −1, powers of j, the square roots of −9 as ±3j (mathcentre; SQA; Khan Algebra 2).
2. **The complex plane and adding**: real axis and j axis, plotting in all four quadrants, resistance and reactance on the axes, adding as arrows (Brilliant levels 1 and 2; HELM; SQA).
3. **Multiplying by j is a quarter turn, and multiplying out brackets** (Brilliant level 4; HELM; Bird).
4. **The conjugate and dividing** (Brilliant levels 5 and 6; HELM; Bird).
5. **Polar form: length and angle, and converting both ways with trigonometry**, quadrant care first (mathcentre 7.4; SQA; Bird 23.6; the Polar Coordinate Plane course).
6. **Multiplying and dividing in polar form: multiply lengths, add angles** (mathcentre 7.6; HELM; Brilliant level 9; the choice of form for the job).
7. **Impedance: Z = R + jX, V = IZ, series** (Pearson 4002; SQA Electrical Engineering Principles; Bird 23.8).
8. **Parallel impedance, the angle of Z as the power-factor angle, and one worked ship's-supply circuit** (MCA Marine Electro-Technology; SQA Electrical Engineering Principles).

De Moivre's theorem, the exponential form, roots, loci and complex equations are left out; one stretch screen at the end of lesson 6 can state rⁿ∠nθ.
If the brief needs six lessons, merge 1 with 2 and 7 with 8; if seven, merge 7 with 8. The core is the same: the HN assessed items (conversion, adding, multiplying, dividing, the Argand diagram in four quadrants) are covered by lessons 2 to 6.

**Everything I could not confirm:**
- Brilliant's lesson contents (titles only).
- Any MCA modernised-syllabus content on mathematics or electro-technology (announcement only); the name "Applied Mathematics" for an MCA paper.
- The exact evidence sentences, 40-hour length and entry line in the 2026 SQA PDFs and the 120-hour and delivery guidance of Electrical Engineering Principles, which I read in the PDFs but which fall outside the checker's view (sections 3.1, 3.3, 5).
- Whether Bird's Basic Engineering Mathematics has any complex-number content outside its chapter titles.
- A rate limit stopped the last fetches (the Electrical Engineering Principles delivery guidance, one LibreTexts phasor page and the LibreTexts reactance page); other sources give the same facts.
