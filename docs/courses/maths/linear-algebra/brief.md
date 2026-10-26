# Linear algebra: the course brief

Written 25 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
the fourth course in the Maths shelf's Advanced maths folder, "Vector spaces, determinants,
eigenvalues and what they reveal." The folder runs Calculus fundamentals, Vectors, Matrices, Linear
algebra, Vector calculus, Differential equations and Group theory. You have Calculus fundamentals,
Vectors, Matrices and Differential equations already, and each of the last three sent work here.
This course picks all of it up. Vector calculus and Group theory come after it, so their ground is
left for them, and each deferral below says where it goes. You chose this course next on 24 Oct and
approved the build, so I have taken the decisions for you and listed them below. Change any you
like. Sources and quotes are in `research-notes.md` beside this file (197 quotes, cut by script from
the 49 saved tool results and checked with `tools/eval/sources.mjs`, `failed: 0`). Section numbers
below point there.

## The short version
**Seven lessons**
1. Which points two arrows reach: span and independence (built first)
2. One arrow, two grids: change of basis
3. Lines and planes in space
4. What a matrix reaches and what it flattens: rank and null space
5. Directions that only stretch: eigenvalues and eigenvectors
6. Diagonalising: the same step, again and again
7. Coupled change: two tanks and two masses

**The main pictures** (one per lesson, each moved with your finger, each showing the cause):
- **The reach of two arrows (lesson 1).** Two arrows from the origin, with their own slanted grid
  drawn through the plane. Two sliders set how many of each you take, and a dot sits at the mix.
  "Paint" shades every point the mix can reach. Drag one arrow onto the other's line. The grid's
  cells thin to nothing, their area reads 0, and the paint collapses onto one line. A 3-D switch
  adds a third arrow. Drag its tip into the flat sheet of the first two and the box they make goes
  flat.
- **Two grids, one arrow (lesson 2).** Your square grid and a second, slanted grid drawn over it, set
  by two arrows you drag. One arrow sits on top of both. Its numbers read out twice, once in each
  grid. Drag the slanted grid and its numbers change, but the arrow never moves.
- **Point, direction, normal (lesson 3).** A 3-D view you turn by dragging the background. A line is
  a start point and a direction, with a slider that runs a dot along it. A plane is a start point
  and a normal arrow standing up from it. Drag the normal and the plane tilts to stay square to it.
  Drag a test point. A readout of "normal dot (point − start)" is zero exactly when the point sits
  on the plane, and its sign says which side.
- **What goes in, what comes out (lesson 4).** Two panels: the input on the left, the output on the
  right. Drag an input point and its output moves. Everything the matrix can reach is shaded on the
  right. A dashed line on the left marks the inputs it crushes to zero. Slide the input along that
  line and the output does not move at all.
- **The stretch finder (lesson 5).** A probe arrow v that you sweep round the origin, and the arrow
  Av drawn from the same point. Most of the time Av points off somewhere else. When it lands on v's
  own line, the line lights and the stretch factor reads out. Buttons load a stretch, a mirror, a
  shear and a turn. The turn never lights.
- **Step it again (lesson 6).** A shape on the plane and a step button that applies the matrix once
  more each tap. A switch swaps the square grid for the grid of the matrix's own eigenvectors. On
  that grid every tap just stretches each direction by its own number. After a few taps the shape
  lines up along the direction with the biggest number.
- **The state plane (lesson 7).** On the left, the real thing: two tanks with their salt, or two
  masses on three springs. On the right, one dot whose two numbers are the two tanks' salt (or the
  two masses' positions), with the eigenvector lines drawn. Drag the dot to set the start and let go.
  Start it on an eigenvector line and it moves straight along that line. Start it anywhere else and
  its path is the two straight motions added together.

**Decisions taken for you** (say if you want any changed):
- **Seven lessons.** You approved seven, and the research supports a seven-lesson core (notes 8).
  SQA's Linear Algebra 2 unit is 40 hours, with 20 for lines and planes and 10 for eigenvalues
  (notes 3.1, 8). HELM gives eigenvalues one 53-page workbook (notes 2.2, 8). Brilliant spends 41
  lessons, most of them abstract, with eigenvalues and diagonalising 2 of them (notes 1.1, 8). Six
  would drop either lines and planes, which Vectors promised you, or the systems that Differential
  equations and Matrices both promised you (notes 8).
- **Your nine topics fold into seven lessons like this.**
  - Span, independence and basis share lesson 1. A basis is just a set of arrows that are
    independent and reach everything: "a set of linearly independent vectors that span that space"
    (3Blue1Brown, notes 4.1).
  - Coordinates and change of basis share lesson 2. The coordinates of an arrow are the amounts of
    each basis arrow, and changing basis is reading the same arrow on another grid (Khan, notes 4.2).
  - Subspaces, column space, null space and rank share lesson 4. Each is a line or plane through
    the origin, and rank and nullity are how many directions each one has (MIT 18.06, notes 4.4).
  - Systems of differential equations and the engineering use share lesson 7. The tanks come first
    and the vibration modes second. Both are the same picture, a dot in the state plane.
- **The engineering use is two masses on springs.** It is the best-supported choice (notes 4.8).
  HELM 22 sets it as an exercise, and MIT 8.03, MIT RES.8-009, Caltech and SFU all work it. They agree
  on the picture. For equal masses and springs, one mode moves both masses together, with the middle
  spring "not stretched or compressed at all" (Caltech). The other moves them opposite ways (notes
  4.8). It needs only Differential equations lesson 5's spring and lesson 5 here. It leads straight
  to propulsion shafting, whose natural frequencies "are square roots of the eigenvalues" (Aalto,
  notes 7.1).
- **Three-phase gets two one-screen uses instead.** The Clarke transform appears in lesson 2 as a
  change of basis. It "converts the time domain components of a three-phase system (in abc frame)
  to two components in an orthogonal stationary frame" (MathWorks, notes 4.8). Symmetrical
  components appear in lesson 6. They work because the Fortescue transformation diagonalises "a
  matrix with circular symmetry" (MDPI, notes 4.8). Working either through needs the operator
  1∠120° and √3/2 entries throughout (notes 4.8, "My reading"). That is a course of its own, so
  each is named and shown, not worked.
- **Lesson 1 is built first, without a pause.** You approved the build, so lesson 1 is built and
  checked first, and the others follow without waiting. You can try it on your phone as soon as it
  lands.
- **Steps lessons, partly visual ("Partly", RUNBOOK section 0, item 3), as you chose.** Every lesson
  carries `format: 'steps'`, about 12 screens, SHOW then DO, ending on two or three mixed puzzles.
  SHOW screens may carry a short paragraph, at most about 90 words, where an idea needs words: why
  det(A − λI) = 0, setting up x′ = Ax from a tank's flows, and the springs' forces. The pictures
  still carry the idea. Most screens stay at one to three sentences.
- **The picture first, the algebra second.** Stewart and Thomas found a coursebook section on
  eigenvectors that "does not contain a single diagram". Its students "could not reason on the
  relationship between a diagram and eigenvectors, to their detriment" (notes 6.4). Wawro's
  sequence has students find "stretch factors and stretch directions" before eigenvalue or
  characteristic equation is named (notes 6.4). Dorier puts the trouble with vector spaces in
  their link to "geometry and systems of linear equations" (notes 4.9). So each idea is met first
  as something the picture does, then given its algebra. No study here compares the two orders, so
  that choice rests on how the best courses are built, not on proof (notes 6.6).
- **Abstract vector spaces are left out.** Brilliant opens with "Waves as Abstract Vectors" and
  "Why Vector Spaces?" (notes 4.9). Dorier found the formal theory hardest when cut off from the
  geometry it came from (notes 4.9). So "vector space" here means the plane and space you can see,
  and "subspace" means a line or plane through the origin. No axioms, no function spaces.
- **Determinants are a tool here, not a topic.** You have them from Matrices lessons 4 and 6, as
  area and volume scale factors. This course uses them three times. A zero determinant means the
  arrows are dependent (lesson 1). It means the matrix crushes something to zero (lesson 4). Setting
  det(A − λI) = 0 finds the eigenvalues (lesson 5; HELM, notes 4.5).
- **Eigenvalues by looking, then by the characteristic equation.** Lesson 5 finds stretch
  directions on the picture first. Then Av = λv becomes (A − λI)v = 0. That step "is not perceived
  as straightforward by many students" (Stewart and Thomas, notes 6.4), so it gets a screen of its
  own. A nonzero v can be crushed to zero only if A − λI flattens the plane, so its determinant is
  0. You know that from Matrices lesson 4. A 2 by 2 matrix gives a quadratic and a 3 by 3 a cubic
  (HELM, notes 4.5). Your Quadratics course solves the first.
- **One 3 by 3 example, not a drill.** The 3 by 3 case is one worked example, chosen so its cubic has
  no plain number term. Then λ = 0 is a root, and the rest is a quadratic. Its zero eigenvalue
  links back to lesson 4's null space. SQA's 4 by 4 case (notes 3.1) is left out.
- **Complex eigenvalues get one screen.** A turn leaves no arrow on its own line. Its characteristic
  equation is λ² + 1 = 0, "giving eigenvalues ± i" (HELM, notes 4.5). You write them ±j, from
  Complex numbers, where times j was a quarter turn. In lesson 7 complex eigenvalues come back as
  Differential equations lesson 6's ringing (Lamar, notes 4.7).
- **Check every answer two ways.** The eigenvalues add up to the diagonal's sum (the trace) and
  multiply to the determinant (HELM, notes 4.5). Then Av is checked against λv by multiplying out.
  An eigenvector of zeros means a slip: "go back, find the error and fix it" (UNSW, notes 6.4).
- **Repeated steps before continuous change.** Lesson 6 runs a matrix step by step, Strang's
  difference equation u(k+1) = A u(k) (notes 4.6). Lesson 7 does the same with time flowing. The two
  tanks appear in both, first swapping water by the hour and then flowing all the time. So the
  matching is plain: λⁿ for steps, e^(λt) for flow.
- **The matrix exponential and the phase plane.** Differential equations sent both here. The phase
  plane is lesson 7's main picture, called the state plane, with "phase plane" named once. The
  matrix exponential is named in one line, not taught (notes 5). Decoupling does the same job with
  tools you have.
- **Coupled circuits and the dive model are named, not worked.** No source in the notes gives a
  worked pair of coupled circuits as x′ = Ax (UNCONFIRMED, notes 4.7). The two-equation submarine
  dive model came via Matrices from Differential equations (its notes 7). It is named in lesson 7 as
  a system this method solves, with no figures, because these notes hold nothing on it.
- **Lines from Vectors, and the point part-way.** Vectors and Matrices both sent the line and the
  point part-way between two points here. Lesson 3 does them as one idea. The point a fraction t of
  the way from A to B is a + t(b − a), and t = ½ is the midpoint. That is linear interpolation.
- **Orthogonal matrices and the 3 by 3 inverse stay out.** Matrices sent both here "if your syllabus
  asks". The notes have no source that teaches either for this course's uses. HELM 22.3 has
  symmetric matrices only as a title (notes 2.2). The Pearson unit's inverse method is not tied to
  3 by 3 (notes 3.2). One remark in lesson 7 says that the springs' two modes are at right angles,
  checked by the dot product. Say if your syllabus asks for either.
- **Naval and plant examples are labelled for what they are.** The shaft papers model "submarine
  propulsion system shafting" (PMC, notes 7.1), and MIT's problem set recalls "an epidemic of shaft
  failures due to torsional vibration" in ships (notes 7.1). The reactor's "effective multiplication
  factor" is a dominant eigenvalue (ScienceDirect Topics, notes 7.3). The shipboard sequence-component
  study is a naval academy student poster (notes 7.2). None is a Royal Navy document, and none is
  presented as one. No Royal Navy, MCA or Level 3 line naming eigenvalues, span or planes was found
  (UNCONFIRMED, notes 3.3, 7.4).
- **Colour as before.** Ink for arrows, grids, planes, working and controls. Amber for key terms.
  Teal for small labels: i, j and k, λ, t, axis names, units. Red only for a slip. Green only for
  finished. An eigenvector line lights in ink, made bolder, not in a new colour.
- **Example numbers are labelled.** Tank sizes, flows, masses, stiffnesses and matrices are example
  figures, said so on screen, or computed from a rule the screen shows. Every worked number below
  was computed by script for this brief, and the fact-check recomputes them. No figure is presented
  as a real ship's, reactor's or shaft's.
- **Your intake answers** (`intake.json`): to understand linear algebra and how to work with it; on
  the job and in everyday life; hands-on, with the why explained in full.

## 1. The overall topic
A set of arrows can reach some points by mixing them, and that set has a shape: a line, a plane or
all of space. A basis is a set of arrows that reaches everything with no spare. The numbers you
write for an arrow are amounts of the basis arrows, so a different basis gives the same arrow
different numbers. Lines and planes in space are written the same way, a point plus a mix of
directions. A matrix moves every point at once. What it can reach and what it crushes to nothing
are two such shapes, and their sizes say how many answers a system has. Then the main idea of the
course. Most matrices have a few special directions they only stretch. Use those directions as your
basis and the matrix becomes a plain stretch along each one. That turns a hundred steps into one
power. It also splits two linked things that change together, such as two tanks or two masses on
springs, into two simple motions, each with its own rate. In your work that is a shaft's vibration
modes, a reactor's multiplication factor and the sequence components of a three-phase fault.

**It builds on:**
- **Vectors:** arrows with components, i, j and k (lessons 1 and 2). Scaling and adding nose to tail
  (lessons 1 and 3). The position vector and displacement b − a (lesson 4). The dot product and "at
  right angles means zero" (lesson 5). The cross product as an arrow square to two others (lesson 6).
  Its brief sent span, independence, bases other than i, j, k, and lines and planes here.
- **Matrices:** a matrix times a column as a mix of its columns (lesson 1). The columns as where i
  and j land, and the squash flat (lesson 2). The product as one move after another, read right to
  left (lesson 3). The determinant as an area scale factor, with 0 meaning flattened (lesson 4). The
  inverse as the move played back (lesson 5). The 3 by 3 determinant as a volume (lesson 6).
  Elimination and its three endings (lesson 7). Its brief sent rank, null space, row reduction as a
  theory, eigenvalues, diagonalising and systems of differential equations here.
- **Differential equations:** the rate rule (lesson 1). Decay, e^(−t/τ) and the time constant (lesson
  2). Steady state plus a dying transient (lesson 3). The spring and the circuit as one equation
  (lesson 5). Overdamped, critical and ringing from the roots (lesson 6). Resonance (lesson 7). Its
  brief sent eigenvalues for systems, the matrix exponential and the phase plane here, with the two
  tanks, the two-loop circuit and the dive model.
- **Quadratics and polynomials:** the quadratic formula, the discriminant and factorising, for the
  characteristic equation.
- **Complex numbers:** j, conjugate pairs and times j as a quarter turn, for a turn's eigenvalues.
- **Linear systems:** two lines that meet, are parallel or are the same. Stack, scale and add.
- **Calculus fundamentals:** the derivative as a rate, and e^(kt) whose slope is k times its height.
- **Trigonometry and AC circuits:** the turn matrix from cos and sin, phasors, and three phases 120°
  apart, for the Clarke and sequence-component screens.
- **Motors:** the rotating field, where the Clarke transform is used.

**Not taught again:** components, i, j and k, adding and scaling arrows, the dot and cross products, a
matrix as a move, the product, the 2 by 2 and 3 by 3 determinant, the 2 by 2 inverse, elimination on
three equations, each equation in three unknowns as a plane, the quadratic formula, complex roots,
e^(kt) and the time constant, steady state plus transient, the spring equation, resonance. Each is
reminded in one line where it is used.

**Taught inline, because no course you have holds them** (notes 5):
- **Span, linear independence and basis** (lesson 1), as pictures first (3Blue1Brown, notes 4.1).
- **Coordinates with respect to a basis, and the change of basis matrix** with the basis arrows as
  its columns (lesson 2; 3Blue1Brown and Khan, notes 4.2).
- **The equation of a line and of a plane in space** (lesson 3): a point and a direction; a point
  and a normal (UConn, Lamar, SQA, notes 4.3).
- **Subspace, column space, null space, rank and nullity** (lesson 4; MIT 18.06, notes 4.4).
- **Eigenvalue, eigenvector, eigenspace, characteristic equation and trace** (lesson 5; HELM and
  3Blue1Brown, notes 4.5).
- **Diagonal matrix, eigenbasis, the matrix P of eigenvectors, P⁻¹AP = D and Aⁿ = PDⁿP⁻¹** (lesson 6;
  HELM, 3Blue1Brown and MIT, notes 4.6). HELM calls P the modal matrix, named once.
- **Writing linked rates as x′ = Ax, decoupling, and normal modes** (lesson 7; HELM, Herman, MIT and
  SFU, notes 4.7, 4.8).

**Left for later courses:**
- **Vector calculus:** fields, gradient, divergence and curl, and equations where the unknown depends
  on place as well as time (notes 4.9, 5). It will use lesson 3's planes and normals. That is my
  reading, and its own brief will cite what it needs.
- **Group theory:** abstract groups. The turns and mirrors of Matrices, and lesson 5's turn with no
  real eigenvector, come back there as symmetries. Nothing of its ground is taught here (notes 4.9).
- **Not on the shelf, left out:** abstract vector spaces, inner product spaces, Gram-Schmidt, least
  squares, the singular value decomposition, Jordan form, tensors and wedge products (Brilliant's
  levels 5 to 7, Khan's later units, notes 1.1, 2.1, 5). The matrix exponential is named only. Laplace
  transforms are left out, as Differential equations said. 4 by 4 eigenvalues are left out.

**Edges.** Two and three dimensions only, real matrices, with complex eigenvalues shown for 2 by 2
only. Done by hand with a calculator for the arithmetic. Pictures of every idea, and no proofs.

## 2. The lessons, in the order they build
The order is Khan's and 3Blue1Brown's: span and basis, then change of basis, then eigenvectors
(notes 2.1, 2.5). SQA's Linear Algebra 2 puts lines and planes before eigenvalues (notes 3.1), and
HELM 22.2 runs diagonalising then systems of differential equations (notes 2.2). Rank sits before
eigenvalues as in Khan's Unit 1 and Brilliant's level 3 "Matrix Subspaces" (notes 1.1, 2.1), because
the eigenvector step needs "crushed to zero" (notes 4.4, 4.5).

| # | Lesson | What it teaches |
|---|---|---|
| 1 | Which points two arrows reach: span and independence | A linear combination is a mix of arrows, as in Matrices lesson 1. Its span is every point the mix can reach: "The set of all possible vectors you can reach with linear combinations of a given pair of vectors is called the "span" of those two vectors" (3Blue1Brown, notes 4.1). Two arrows that do not line up reach the whole plane. When they line up, "their span is all vectors whose tip sit on a certain line" (notes 4.1). The span is a set of points, the tips of arrows drawn from the origin (Wawro, notes 6.1). (2, 1) and (1, 3) reach the plane, and their cell area, the determinant, is 5. (2, 1) and (−4, −2) reach only a line, and 2 lots of the first plus 1 of the second give the zero arrow (computed). In space, a third arrow lying in the sheet of the first two "doesn't give you access to any new vectors" (3Blue1Brown, notes 4.1). (1, 0, −1), (0, 2, −1) and their sum (1, 2, −2) make a flat box of volume 0 (computed; Matrices lesson 6). Dependent means one arrow is a mix of the others, so some mix that is not all zeros gives the zero arrow. Independent means only all zeros does. The test by elimination: solve a u + b v + c w = 0. A free letter means dependent. This system always has the all-zeros answer, so it can never be "inconsistent" (ERIC EJ1366218, notes 6.1). A basis is "a set of linearly independent vectors that span that space" (3Blue1Brown, notes 4.1). i and j are one basis. Any two arrows that do not line up are another. Where it is used: the words every later lesson needs. An eigenbasis in lesson 6 is a basis made of eigenvectors (notes 4.6). Brilliant's level 3 and Khan's Unit 1 open the same way (notes 1.1, 2.1). Singapore's syllabus lists "linear spaces and subspaces" (notes 2.4). |
| 2 | One arrow, two grids: change of basis | The numbers you write for an arrow are the amounts of each basis arrow: "when you think about coordinates as scalars, the basis vectors are what those scalars actually scale" (3Blue1Brown, notes 4.1). So "any way to describe vectors numerically depends on your choice of basis vectors" (notes 4.1), and "Different coordinate systems are just different ways of representing the same vector" (Khan, notes 4.2). Jennifer uses another basis (3Blue1Brown, notes 4.2). Hers here is b₁ = (2, 1) and b₂ = (−1, 1). The arrow (3, 3) on your grid is (2, 1) on hers, because 2(2, 1) + 1(−1, 1) = (3, 3) (computed). From hers to yours is "matrix-vector multiplication, with a matrix whose columns represent Jennifer's basis vectors" (notes 4.2). So P = [2 −1; 1 1] and P(2, 1) = (3, 3). From yours to hers is the inverse, Matrices lesson 5. P⁻¹ = ⅓[1 1; −1 2] takes (3, 3) to (2, 1) (computed). A move written in her numbers: translate to yours with P, do the move, translate back with P⁻¹. So P⁻¹MP is "that same transformation as someone else sees it" (3Blue1Brown, notes 4.2). Read right to left, as Matrices lesson 3 taught. The last screen previews lesson 6: for M = [3 1; 0 2] on the grid of (1, 0) and (−1, 1), P⁻¹MP = [3 0; 0 2], a plain stretch (computed). Khan: changing basis can turn "overly-complicated transformations into much easier tasks" (notes 2.1). Where it is used: the Clarke transform turns three phase quantities into "two components in an orthogonal stationary frame" (MathWorks, notes 4.8), "commonly used in field-oriented control of three-phase AC machines" (notes 7.2). Whether your course covers field-oriented control is UNCONFIRMED. SQA introduces "the diagonalisation of a matrix as a translation" (notes 3.1). Khan's Unit 3 "Change of basis" (notes 2.1). |
| 3 | Lines and planes in space | A line needs "a vector ... from the origin to a point of the line and a vector ... parallel to the line" (UConn, notes 4.3). So r = a + t d, and t is the slider. Read it as motion: "describing motion with constant velocity" (UT Austin, notes 4.3). Here a is a point and d is a free-floating direction, two of the three ways students picture a vector (Wawro, notes 6.1). The line through A and B has d = b − a (Vectors lesson 4). The point a fraction t of the way along is a + t(b − a), and t = ½ is the midpoint. That is linear interpolation, sent here by Vectors and Matrices. A plane is a point and "a vector orthogonal (perpendicular) to it, called a normal vector" (UConn, notes 4.3). Every step from a to a point r on the plane is square to n, so n · (r − a) = 0 (Vectors lesson 5). Multiply it out and it is ax + by + cz = d, with the normal (a, b, c) read off the front (Lamar, notes 4.3). Example: the plane through (1, 1, 3) with normal (2, 1, 2) is 2x + y + 2z = 9 (computed). A plane from two directions on it is a span from lesson 1, a + s u + t v. Its normal is u × v (Vectors lesson 6). u = (1, 0, −1) and v = (0, 2, −1) give (2, 1, 2) again (computed). SQA asks for planes "using a given normal ... using two vectors on the plane, and using three points" (notes 4.3). Where a line meets a plane: put the line into the plane's equation and solve for t. The line (0, 1, 0) + t(1, 2, 0) meets the plane at t = 2, the point (2, 5, 0) (computed). "If two planes are not parallel then they intersect at a line" (CMU, notes 4.3). Its direction is square to both normals, so it is their cross product. 2x + y + 2z = 9 and x − y = 0 meet along (1, 1, 3) + t(2, 2, −3) (computed). Matrices lesson 7 drew three planes meeting. Here each plane has its equation. One screen on the distance from a point to a plane, along the normal: the origin is 9 ÷ 3 = 3 from 2x + y + 2z = 9 (computed; Khan lists "Point distance to plane", notes 2.1). Where it is used: SQA Linear Algebra 2 Outcome 1, "Solve problems involving lines and planes in 3-dimensions using vector geometry" (notes 3.1). HELM 9's "vector equation of a line and the vector equation of a plane" (notes 2.2). Khan's planes in R3 (notes 2.1). No trade line was found (UNCONFIRMED, notes 3.3). |
| 4 | What a matrix reaches and what it flattens: rank and null space | A subspace here is a line or plane through the origin, or all of space. A plane not through the origin is not one, because its mixes leave it. The column space "consists of all combinations of the columns of A" (MIT 18.06, notes 4.4), the span of the columns from lesson 1. Everything the matrix can reach. The null space "consists of all solutions x of the equation A x = 0" (notes 4.4). Everything it crushes to nothing. Rank is the number of independent columns: "Number of independent columns = r = Number of independent rows = Rank of A" (MIT, notes 4.4). Nullity is the size of the null space (Khan, notes 4.4). Each free letter in the finished staircase gives one direction of it: "The special solutions to A x = 0 correspond to free variables" (MIT, notes 4.4). So rank plus nullity is the number of columns. 2 by 2 first: [1 2; 2 4] squashes the plane onto the line through (1, 2), rank 1. It crushes the line through (2, −1), nullity 1 (computed). Then 3 by 3: A = [1 1 1; 1 2 3; 2 3 4]. Its third row is the sum of the first two. Rank 2: its columns reach the plane z = x + y, whose normal (−1, −1, 1) is lesson 3's cross product of two columns. Nullity 1: A(1, −2, 1) = 0 (computed). What it says about Ax = b: there is an answer only when b is in the column space. Then every answer is one answer plus anything from the null space. b = (6, 14, 20) lies on the plane, and x = (1, 2, 3) + t(1, −2, 1) all land on it. b = (6, 14, 21) is off the plane, and elimination ends in 0 = 1 (computed). So Matrices lesson 7's three endings get their cause. Where it is used: Edinburgh's first-year engineering maths puts "Rank, eigenvalues, eigenvectors" right after elimination (notes 2.4). Khan's Unit 1 and MIT 18.06 (notes 2.1, 4.4). Lesson 5 needs it: an eigenvector is a nonzero answer to (A − λI)v = 0. |
| 5 | Directions that only stretch: eigenvalues and eigenvectors | Most arrows are knocked off their line by a matrix. A few stay on it. "These special vectors are called the "eigenvectors" of the transformation, and each eigenvector has associated with it what's called an "eigenvalue", which is the factor by which it's stretched or squished" (3Blue1Brown, notes 4.5). For [3 1; 0 2], arrows along the x-axis stretch by 3 and those along the diagonal (−1, 1) by 2 (notes 4.5; computed). A negative eigenvalue flips the arrow, "but the important part is that it stays on the line that it spans out" (notes 4.5). "Eigenvectors are by definition nonzero. Eigenvalues may be equal to zero" (LibreTexts, notes 4.5). Every multiple of an eigenvector is one too, so the whole line is its eigenspace (Cambridge report, notes 6.4). The algebra: Av = λv, so (A − λI)v = 0. A nonzero v is crushed, so A − λI flattens, and "non-trivial solutions for X will exist if det ( A − λI ) = 0" (HELM, notes 4.5). For 2 by 2 that is a quadratic (HELM, notes 4.5): λ² − (trace)λ + det = 0. [3 1; 0 2] gives λ² − 5λ + 6 = 0, so 2 and 3. [2 −1; −1 2] gives 1 with (1, 1) and 3 with (1, −1), the spring matrix of lesson 7 (computed). Check: the eigenvalues add to the trace and multiply to the determinant (HELM, notes 4.5). Then each λ goes back into (A − λI)v = 0, and the eigenvector is read off. Match each eigenvector to its own λ (Pearson examiners, notes 6.4). A turn has no real eigenvector: λ² + 1 = 0, eigenvalues ±j (HELM, notes 4.5; Complex numbers). A shear has only one line. A mirror has 1 along it and −1 across it. One 3 by 3: [1 1 0; 1 2 1; 0 1 1] gives a cubic with λ = 0 as a root, then a quadratic. Its eigenvalues are 0, 1 and 3 with (1, −1, 1), (1, 0, −1) and (1, 2, 1). The eigenvector for 0 is its null space, lesson 4 again (computed). HELM finds "eigenvalues and eigenvectors of 2 × 2 and 3 × 3 matrices" (notes 2.2). The eigenvectors show what a move does "less dependent on your particular coordinate system" (3Blue1Brown, notes 4.5). Where it is used: "Control theory, vibration analysis, electric circuits, advanced dynamics and quantum mechanics" (HELM 22.2, notes 2.2). AQA C10, Edexcel 3.1 and SQA Linear Algebra 2 Outcome 2 (notes 2.4, 3.1). Bird puts eigenvalues straight after the stiffness matrix (notes 2.3). |
| 6 | Diagonalising: the same step, again and again | Use the eigenvectors as a basis, an "eigenbasis" (3Blue1Brown, notes 4.6). In it the matrix only stretches, so it is "guaranteed to be diagonal, with the corresponding eigenvalues down the diagonal" (notes 4.6). That is lesson 2's change of basis: P has the eigenvectors as columns, and P⁻¹AP is a diagonal matrix D with the eigenvalues down its diagonal (HELM, notes 4.6). Diagonalising means "transforming a non-diagonal matrix into an equivalent matrix which is diagonal and hence is simpler to deal with" (HELM, notes 4.6). What it buys: "applying that matrix, say, 100 times will just correspond to scaling each basis vector by the 100th power of the corresponding eigenvalue" (3Blue1Brown, notes 4.6). So Aⁿ = PDⁿP⁻¹, and every λ in D is raised to the power n (Cambridge report, notes 6.4). Worked use: two tanks swapping water by pump every hour, 20% of tank 1's into tank 2 and 30% of tank 2's into tank 1. That is Strang's matrix [0.8 0.3; 0.2 0.7] (example figures; notes 4.6). Its eigenvalues are 1, with (3, 2), and 0.5, with (1, −1). The share that never changes is 60 : 40, Strang's "steady state", and the difference is a "decaying mode" that halves each hour (notes 4.6). From all the water in tank 1, tank 1 holds 0.8, 0.7, 0.65 and then 0.6125 after five hours. The rule is 0.6 + 0.4 × 0.5ⁿ. A³ = [0.65 0.525; 0.35 0.475] by PD³P⁻¹ (computed). In the long run the biggest eigenvalue wins. Aⁿ shrinks to zero only when every eigenvalue is smaller than 1 in size (MIT 18.06, notes 4.6). Not every matrix can be done. A shear "doesn't have enough eigenvectors to span all of space" (3Blue1Brown, notes 4.6). It has one eigenvalue counted twice, but one line only, so P cannot be formed: "The crucial question is whether we can form a non-singular modal matrix P" (HELM, notes 4.6). SQA's "Algebraic and geometric multiplicities" are named here (notes 3.1). n different eigenvalues always work (HELM, notes 4.6). Where it is used: SQA's "Form A n using diagonalisation transforms", that is Aⁿ (notes 3.1). AQA C11 and Singapore, for powers (notes 2.4). Difference equations u(k+1) = Au(k) (MIT, notes 4.6). A reactor core: "The dominant eigenvalue is called the effective multiplication factor", the ratio of neutron production "(by fission) and loss from one generation to another" (ScienceDirect Topics, notes 7.3). Its link to "the biggest eigenvalue wins" is my reading. Symmetrical components, which diagonalise "a matrix with circular symmetry" and are used to find the currents in unbalanced short circuits (MDPI, MIT 6.061, notes 4.8, 7.2), are named on one screen. |
| 7 | Coupled change: two tanks and two masses | Two things that change together. Each one's rate depends on both, so the rates are a matrix times the amounts: x′ = Ax (HELM 22.2, notes 4.7). Two 100 L tanks: fresh water runs into tank 1 at 15 L/min, 20 L/min is pumped from 1 to 2, 5 L/min back from 2 to 1, and 15 L/min leaves tank 2 (example figures). Each flow carries salt at its tank's strength, so A = [−0.2 0.05; 0.2 −0.2] per minute. The eigenvalues are −0.1 with (1, 2) and −0.3 with (1, −2) (computed). In the eigenvector grid the two equations come apart: "These equations are decoupled" (HELM, notes 4.7). Each is Differential equations lesson 2's decay with its own rate, so each part is Ce^(λt) (HELM, notes 4.7). Start with 30 g of salt in tank 1. That is 15 of each mode, so x₁ = 15e^(−0.1t) + 15e^(−0.3t) and x₂ = 30e^(−0.1t) − 30e^(−0.3t) grams. Tank 2 peaks at about 11.5 g after about 5.5 minutes, the moment the two tanks match (computed). The fast mode dies first and the path bends onto the slow eigenvector line, lesson 6's "biggest wins" in continuous time. A closed pair of tanks has eigenvalue 0. Its eigenvector is the share that never changes, Differential equations lesson 3's steady state. "Since the eigenvalues are real and distinct, the general solution is easily written down" (Herman, notes 4.7). Complex eigenvalues give ringing, "the same problem that we had back when we were looking at second order differential equations" (Lamar, notes 4.7). Then the worked engineering use: two equal masses on three equal springs. Each mass feels its own spring and the middle one, so x″ = −(k/m)[2 −1; −1 2]x, lesson 5's matrix (computed). Its eigenvectors are (1, 1) with k/m and (−1, 1) with 3k/m (SFU, notes 4.8). These are the "normal modes" (MIT 8.03, notes 4.8). In mode 1 the masses move together with "the same frequency, the same amplitude, and the same phase" (Caltech, notes 4.8), and the middle spring is "not stretched or compressed at all" (notes 4.8). In mode 2 they move opposite ways. Each decoupled equation is "simple harmonic motion" (HELM, notes 4.8). Its frequency is the square root of the eigenvalue (Aalto, Dyrobes, notes 7.1). With k/m = 100 per second squared that is 10 and about 17.3 radians a second (example figures, computed). Any other start is a sum of the two: "The displacements for the most general motion can be written as sums of the simple solutions" (MIT 8.03, notes 4.8). The two modes are at right angles, (1, 1) · (−1, 1) = 0 (computed). Where it is used: torsional vibration of shafting "is always a most important problem for engineers", including "submarine propulsion system shafting" (PMC, notes 7.1). "The natural frequencies are square roots of the eigenvalues, and the vibration mode shapes are the eigenvectors" (Aalto, notes 7.1). A drive frequency near a natural frequency gives "resonant vibration" (MDPI, notes 7.1), Differential equations lesson 7. Ship structures (COBEM, notes 7.1). Control and circuits (HELM, notes 4.7). Coupled circuits, the dive model and the matrix exponential are named (see the decisions). |

## 3. Can it be taught mostly visually, through interaction?
Partly, as you chose. Every lesson is a steps lesson of about 12 screens. SHOW screens may carry a
short paragraph, at most about 90 words, where an idea needs words (see the decisions). Each lesson
has one main picture you move with your finger, and each shows the cause, not just the answer:
- **The reach of two arrows (lesson 1).** Two arrows u and v from the origin, tips draggable, with
  their slanted grid drawn as faint lines at whole amounts. Two sliders set the amounts a and b, and
  a dot sits at a u + b v, its path drawn nose to tail. "Paint" shades every point reached with
  amounts from −5 to 5, which covers the screen. The cell area of the slanted grid reads out, the
  determinant from Matrices lesson 4. Drag v towards u's line. The cells thin, the area falls to 0,
  and the paint collapses onto one line. At 0 a readout shows the mix that gives the zero arrow.
  The 3-D switch draws u and v's flat sheet and a third arrow w, turned by dragging the background.
  Drag w's tip into the sheet and the box of all three flattens, its volume reading 0 (Matrices
  lesson 6). *Why:* 3Blue1Brown's span lesson is this picture, the pair whose span is "all vectors
  in 2D space" until "they line up", and the third arrow "trapped on that same flat sheet" (notes
  4.1). The Magic Carpet Ride sequence builds span from a travel story, which is what the sliders
  are: how far you can get with two kinds of trip (notes 6.1). Wawro found students picture vectors
  as arrows, points or floating segments (notes 6.1), so the dot marks the tip, and the span is
  painted as points. The cause shown: two arrows reach a plane only while their grid has cells of
  real area, and lining them up crushes the cells.
- **Two grids, one arrow (lesson 2).** Your square grid in faint ink, and Jennifer's slanted grid,
  set by b₁ and b₂, over it. One arrow, tip draggable, sits on both. Its numbers read out twice,
  (3, 3) on yours and (2, 1) on hers. A "how" button lays her amounts nose to tail along her grid.
  Drag b₁ or b₂: her numbers change and the arrow stays put. Below, P's columns are b₁ and b₂, and
  P times her numbers gives yours. The last screens add a move M. A three-stage strip translates
  her arrow to yours, moves it, and translates back, so P⁻¹MP builds up right to left. *Why:*
  3Blue1Brown's Jennifer (notes 4.2), and Khan's "Different coordinate systems are just different
  ways of representing the same vector" (notes 4.2). No study names a change-of-basis error
  (UNCONFIRMED, notes 6.2). The likely slips are P where P⁻¹ is needed, and reading P's columns as
  the new numbers rather than her arrows (notes 6.2, "My reading"). The "how" button and the
  multiply-back check catch both. The cause shown: numbers belong to a grid, and the arrow belongs
  to no grid.
- **Point, direction, normal (lesson 3).** A 3-D box of axes that you turn by dragging. Line mode:
  drag the start point and the direction arrow, and a t slider runs a dot along the line, with t =
  0 and t = 1 marked. Plane mode: a start point and a normal arrow, tip draggable. The plane is drawn
  as a tile square to the normal and tilts as you drag it. A test point is dragged in 3-D, or
  typed. The readout n · (r − a) is 0 on the plane, positive on the normal's side and negative on
  the other. Span mode paints the same plane from two directions with s and t sliders, with u × v
  standing up as its normal. Meet mode puts a line through a plane and slides t until the dot
  touches it. *Why:* UConn's point plus direction and point plus normal (notes 4.3), UT Austin's
  "motion with constant velocity" (notes 4.3), and SQA's three ways to make a plane (notes 4.3).
  Vectors lesson 6 turned a 3-D view against cross-product direction errors, and this reuses that
  view. The research's reading is that a plane is where Vectors' dot product and lesson 1's span
  meet (notes 4.3, "My reading"). The two modes show that. The cause shown: a plane is every point
  whose step from the start is square to the normal.
- **What goes in, what comes out (lesson 4).** Left panel, the input; right panel, the output; a
  matrix card between them whose entries you can step. Drag the input dot and the output dot
  follows. The column space is shaded on the right: a line for rank 1, a plane for rank 2, drawn in
  3-D for the 3 by 3 case. The null space is a dashed line on the left. "Slide along" moves the
  input along a line parallel to the dashed one, and the output dot stays perfectly still. Put a
  target b on the right. If it is in the shaded set, every input landing on it lights up as a
  dashed line through one answer. If it is off, nothing lights, and the staircase below shows 0 = 1.
  *Why:* MIT's definitions are the two panels (notes 4.4). Larson and Zandieh found Ax = b read as a
  combination, a system or a move, with x "conceived" differently in each (notes 6.3). This picture
  is the move reading, and the staircase below it is the system reading. Students were "unable to
  coordinate the results that they obtained with the original vector equation" (ERIC EJ1366218,
  notes 6.3), so the answers are always shown landing on b in the output. The cause shown: what
  the matrix crushes is exactly why answers come in whole lines, and why it reaches less.
- **The stretch finder (lesson 5).** A probe arrow v, length 1, that you drag round the origin, and
  Av drawn from the same point in a second ink weight. A ring traces where Av's tip goes as v goes
  round. When Av lies on v's line, the line lights, and the stretch factor λ reads out with its
  sign. The matrix is set by dragging where i and j land, as in Matrices lesson 2, or by preset
  buttons: stretch, mirror, shear and turn. The turn never lights, the shear lights once, and the
  mirror lights at 1 and −1. Then a λ slider draws A − λI's squashed grid. At an eigenvalue the grid
  goes flat and its determinant reads 0, which is the characteristic equation found by hand. *Why:*
  Stewart and Thomas: no diagram meant students "could not reason on the relationship between a
  diagram and eigenvectors" (notes 6.4). LibreTexts says to "draw a picture, then find the
  eigenvectors and eigenvalues geometrically" (notes 4.5). Wawro's sequence finds "stretch factors"
  first (notes 6.4). The λ slider shows why det(A − λI) = 0, the step "not perceived as
  straightforward by many students" (notes 6.4). The cause shown: an eigenvector is an arrow the
  matrix leaves on its own line, and at its eigenvalue A − λI crushes it to zero.
- **Step it again (lesson 6).** A shape, the F-flag from Matrices, on the plane, and a "step" button
  that applies A once more each tap, with a counter n. The grid switch swaps the square grid for
  the eigenvector grid. On the square grid the flag shears and drifts. On the eigenvector grid each
  tap simply stretches it by λ₁ one way and λ₂ the other, and Dⁿ reads out as the powers. A reskin
  shows the pumped tanks, two bars whose levels step towards 60 : 40, with the gap halving each tap.
  The shear preset shows only one eigen-line, and the grid switch is greyed out with the reason.
  *Why:* 3Blue1Brown's "change to an eigenbasis, compute the 100th power in that system, then
  convert back" (notes 4.6). Strang's steady state and decaying mode (notes 4.6). Cambridge's
  examiners saw candidates forget "to raise the values of λ to the power of n in the matrix D"
  (SECONDARY mirror, notes 6.4), and here the powers are on screen beside the flag. The cause shown:
  in the eigenvector grid each step only multiplies each amount by its own λ, so the biggest one
  takes over.
- **The state plane (lesson 7).** On the left, the physical system: two tanks with their flows
  drawn and salt shaded, or two masses on three springs. On the right, the state plane: one dot
  whose two numbers are x₁ and x₂, with the eigenvector lines drawn and labelled with their λ. Drag
  the dot to set the start and press go. The dot leaves a trail and the system on the left moves to
  match. Start on an eigenvector line and the dot moves straight along it, to zero for the tanks and
  back and forth for the masses. Start anywhere else and two faint dots ride the two lines, and the
  real dot is their sum. For the masses, a mode-1 start keeps the middle spring the same length the
  whole time. The tanks show how fast each mode dies, and the masses show how fast each swings.
  *Why:* HELM's decoupling turns Ẋ = AX into Ẏ = DY, "where D is a diagonal matrix" (notes 4.7). The research found
  no study of mistakes here (UNCONFIRMED, notes 6.5). Its reading is that the likely slip is not
  seeing each decoupled equation as Differential equations lesson 1's rate rule with its own λ
  (notes 6.5). The two faint dots show that. Caltech's two modes, with mode 1's middle spring "not
  stretched or compressed at all" (notes 4.8), and MIT 8.03's "sums of the simple solutions" (notes
  4.8). This is the phase plane Differential equations sent here. The cause shown: the linked
  system is two independent simple motions in disguise, and the eigenvectors take the disguise off.
- **Colour as before:** ink for arrows, grids, planes, working and controls; amber for key terms;
  teal for small labels (i, j, k, λ, t, axis names, units); red only for a slip; green only for
  finished.

## 4. What else
- **Benchmark (notes 1 and 2).**
  - **Brilliant Linear Algebra:** 41 lessons in 7 levels, "the abstract depths of linear algebra"
    (notes 1.1). Its order is vector spaces, Gauss-Jordan, span and subspaces with "Coordinates &
    Bases" and "Matrix Subspaces", then matrices, then determinants through wedges, then
    "Eigenvalues & Eigenvectors" and "Diagonalizability" in level 6, then inner products and SVD
    (notes 1.1). It needs "calculus and linear equations" (notes 1.1). Its level 3 maps onto lessons
    1, 2 and 4, and its level 6 onto lessons 5 and 6. Its levels 1, 5 and 7 are left out (see the
    decisions). What happens inside its lessons is UNCONFIRMED (titles only, notes 1.1). Brilliant's
    own list of its advanced courses stops at Matrices (notes 1.2).
  - **Khan's Linear algebra:** three units. Unit 1 runs span, independence, subspaces and basis,
    then planes in R3, then null space, column space, nullity and rank. Unit 3 runs change of basis,
    then "Eigen-everything" for 2 by 2 and 3 by 3 (notes 2.1). This course follows that order, with
    planes moved after change of basis so lesson 3's planes can be spans.
  - **3Blue1Brown:** span and basis, then change of basis, then eigenvectors, which the change of
    basis chapter says is what it is for (notes 2.5).
  - **HELM:** workbook 9 for lines and planes, and workbook 22 for eigenvalues: basic concepts, then
    applications with diagonalising and decoupling, then repeated eigenvalues (notes 2.2).
  - **Bird's Higher Engineering Mathematics:** eigenvalues close its matrices chapter, after
    Gaussian elimination and the stiffness matrix (notes 2.3). Its author lectured at the Royal
    Navy's Defence College of Marine Engineering at HMS Sultan (notes 2.3).

  What they lack that you need: Brilliant has no lines and planes, no systems of differential
  equations and no engineering use (titles only, UNCONFIRMED, notes 1.1). Khan stops at
  eigenvectors. Lessons 3 and 7 come from SQA, HELM and the vibration sources.
- **Starting point.** All of Algebra, Calculus fundamentals, Vectors, Matrices and Differential
  equations. So the arrows, the moves, the determinant, elimination, the quadratic, j and the decay
  and spring equations are all yours. What is new is the reach of a set of arrows, reading one arrow
  on two grids, a plane's equation, what a matrix crushes, the directions it only stretches, and
  using those directions to split a problem. Your trade gives you three-phase, the rotating field
  and phasors.
- **His aim (notes 3).** Your Level 3 marine engineering course comes next year, general engineering
  first, then submarine and nuclear propulsion. You asked for foundations that see you through any
  new topic. That is what this course is. No Level 3, Royal Navy or MCA syllabus line naming
  eigenvalues, span or planes was found (UNCONFIRMED, notes 3.3, 7.4). Its subjects sit at HND and
  first-year degree level:
  - **SQA Linear Algebra 2 (J5WF 35, SCQF level 8):** "vector geometry, eigenvalues, eigenvectors,
    eigenspaces and diagonalisation" (notes 3.1). Outcome 1 is lines and planes (20 hours) and
    Outcome 2 is eigenvalues to "Form A n using diagonalisation transforms" (10 hours) (notes 3.1).
    It asks for "matrices, complex numbers and linear systems" first (notes 3.1). You have all three.
  - **SQA HN Engineering Mathematics 4:** matrices only, with no eigenvalues (notes 3.1).
  - **Pearson BTEC HN:** the content seen runs to matrices, determinants, the inverse and Gaussian
    elimination, with single differential equations such as "mass-spring-damper systems" (notes
    3.2). The 2010 Marine Engineering HNC's Analytical Methods unit was not readable (UNCONFIRMED,
    notes 3.2). So for the Pearson route this course is beyond the syllabus.
  - **MCA Second Engineer:** "Solves linear simultaneous equations of three unknowns" is its only
    linear-algebra line (notes 3.3).
  - **A level Further Maths:** AQA C10 and C11, and Edexcel 3.1, cover lessons 5 and 6 (notes 2.4).
  - **Edinburgh first-year engineering maths:** "Rank, eigenvalues, eigenvectors" (notes 2.4).
- **Where it is used (each cited before a lesson uses it).**
  - **Span and basis (1):** the language of lessons 2 to 7, with an eigenbasis in lesson 6 (notes
    4.6). Brilliant level 3, Khan Unit 1 (notes 1.1, 2.1). No trade line names them (UNCONFIRMED,
    notes 3.3).
  - **Change of basis (2):** the Clarke transform (MathWorks, notes 4.8, 7.2). Park's matrix "from a
    rotation matrix" (MIT, notes 7.2), met in Matrices lesson 2. Diagonalising as "a translation"
    (SQA, notes 3.1).
  - **Lines and planes (3):** SQA Linear Algebra 2 Outcome 1 (notes 3.1). HELM 9 (notes 2.2). Khan
    (notes 2.1).
  - **Rank and null space (4):** MIT 18.06 (notes 4.4). Edinburgh (notes 2.4). Khan (notes 2.1).
  - **Eigenvalues (5):** HELM 22.2's "Control theory, vibration analysis, electric circuits" (notes
    2.2). AQA, Edexcel and SQA (notes 2.4, 3.1). Bird (notes 2.3).
  - **Diagonalising (6):** SQA's "Form A n" (notes 3.1). Difference equations (MIT, notes 4.6). The
    reactor's effective multiplication factor (notes 7.3). Symmetrical components for unbalanced
    faults (MIT 6.061, MDPI, notes 7.2, 4.8). A naval academy student poster used sequence
    components on a shipboard power system (notes 7.2).
  - **Coupled change (7):** HELM's control and circuits (notes 4.7). Two-tank mixing (Herman, MIT
    ES.1803, Slavik, notes 4.7). Normal modes (MIT 8.03, MIT RES.8-009, Caltech, SFU, notes 4.8).
    Shaft torsional vibration, natural frequencies and mode shapes (PMC, MDPI, Dyrobes, Aalto, MIT
    2.004, notes 7.1). Ship structures (COBEM, notes 7.1).
- **The mistakes to catch, each with a puzzle and its own hint.** Most of the research is on
  university and A level students, not electricians (notes 6). That you would slip the same way is
  UNCONFIRMED, though the slips are about the maths, so likely.
  - **Lesson 1, right working, wrong reading:** "12 students were able to carry out the correct row
    operations but did not provide the correct deduction" (ERIC EJ1366218, notes 6.1). One wrote
    "the system is inconsistent therefore it is linearly independent" (notes 6.1). A DO gives a
    finished staircase for a u + b v + c w = 0 and asks only what it says about the arrows. A second
    offers "inconsistent, so independent" as the trap.
  - **Lesson 1, an arrow as a point or a segment:** students think of vectors "as arrows anchored at
    the origin, as points in a coordinate system, or as floating directed line segments" (Wawro,
    Sweeney and Rabin, notes 6.1). A DO asks for the span of two arrows as a set of points to tap.
  - **Lesson 2, numbers mistaken for the arrow:** no source names a change-of-basis error
    (UNCONFIRMED, notes 6.2). So these are taught as checks, not cited mistakes. Multiply back with
    P, and use the "how" button. One puzzle offers P where P⁻¹ is needed.
  - **Lesson 3, point and direction mixed up:** the same three pictures of a vector (Wawro, notes
    6.1). In r = a + t d, a is a point and d a free direction. A puzzle offers a line with the two
    swapped. No source counts plane-equation errors, so the normal's sign and "normal or direction?"
    are taught as checks: put a point back in and see it gives 0.
  - **Lesson 4, the answer cut off from the system:** "Many were unable to coordinate the results
    that they obtained with the original vector equation" (ERIC EJ1366218, notes 6.3). Every answer
    is shown landing on b.
  - **Lesson 4, x read one way only:** Larson and Zandieh's three readings (notes 6.3). A puzzle asks
    for one null-space answer as an input arrow and as a mix of columns that adds to zero.
  - **Lesson 4, formalism:** Dorier's "obstacle of formalism" (notes 6.3). The word "subspace" comes
    only after the shaded line and plane, and a puzzle asks whether a plane not through the origin
    counts.
  - **Lesson 5, no picture:** students "could not reason on the relationship between a diagram and
    eigenvectors" (Stewart and Thomas, notes 6.4). Every DO asks you to predict on the stretch
    finder before computing, and one asks whether a turn or a shear has any eigenvector.
  - **Lesson 5, Av = λv to (A − λI)v = 0:** "not perceived as straightforward by many students"
    (Stewart and Thomas, notes 6.4). A DO asks why it is λI and not λ.
  - **Lesson 5, one eigenvector only:** "Few candidates realised that a multiple of e is also an
    eigenvector" (Cambridge 9231 report, SECONDARY mirror, notes 6.4). Candidates "forget that any
    non-zero scalar multiple is also valid" (Dr Nicky Grant, SECONDARY, notes 6.4). A puzzle offers
    (2, 2) beside (1, 1) and asks which are eigenvectors.
  - **Lesson 5, the zero vector:** "Eigenvectors are by definition nonzero" (LibreTexts, notes 4.5),
    and getting v = 0 means "you know for sure that you are wrong" (UNSW, notes 6.4). A DO ends at
    v = 0 and asks what went wrong.
  - **Lesson 5, pairs mismatched:** "failure to match up these eigenvalues with their corresponding
    eigenvectors often resulted in a loss of marks" (Pearson IAL, January 2024, notes 6.4). A DO
    gives two eigenvalues and two arrows to pair up, checked on the picture.
  - **Lesson 5, an eigenvalue already known:** candidates did not see "they already had one
    eigenvalue from part (a" (Pearson IAL, January 2025, notes 6.4). A puzzle gives one eigenvalue
    and asks for the other from the trace.
  - **Lesson 6, the power left off:** "some candidates forgot to raise the values of λ to the power
    of n in the matrix D" (Cambridge report, SECONDARY mirror, notes 6.4). A puzzle offers PDP⁻¹ for
    A³.
  - **Lesson 6, enough eigenvalues, not enough eigenvectors:** "Having n eigenvalues (with
    multiplicity) is necessary but not sufficient" (ResearchForge, SECONDARY, notes 6.4). HELM's
    "crucial question" (notes 4.6). The shear puzzle asks whether it can be diagonalised.
  - **Lesson 6, independence confused:** students said eigenvectors "should be linearly
    independent" whatever the matrix (Stewart and Thomas, notes 6.4). The shear shows a matrix whose
    eigenvectors cannot fill a basis.
  - **Lesson 7, mode and rate mismatched:** no study of x′ = Ax errors was found (UNCONFIRMED, notes
    6.5). The Pearson pairing slip (notes 6.4) applies here too: each e^(λt) goes with its own
    eigenvector. A DO pairs them on the state plane.
  - **Not stated as common:** no source counts these, so they are taught as checks (multiply back,
    put the point in, trace and determinant), not as cited mistakes.
    - Writing P⁻¹AP as PAP⁻¹ (lessons 2 and 6).
    - Ordering D's eigenvalues differently from P's columns (lesson 6).
    - A sign slip in a tank's matrix: what leaves a tank is minus, what arrives is plus (lesson 7).
    - Taking ω as the eigenvalue itself, not its square root (lesson 7).
- **Size and cost.** 7 lessons of about 12 screens on the agreed settings (CLAUDE.md).
  - Vectors came to about 8.2M tokens, Differential equations about 9.2M and Matrices about 8.5M
    for seven lessons each (docs/plans/maths-queue.md), so about 1.2M to 1.3M a lesson. Lessons 3
    and 4 draw in 3-D with a view you turn, and lesson 7 animates two systems beside a state plane.
    The "Partly" screens carry more words. So I estimate about 1.2M to 1.4M a lesson.
  - That is about 8.4M to 9.8M for the course, plus about 0.3M for the plan and research. The
    research can start from the 49 saved tool results.
  - The full process measured on Fractions lessons 4 to 8 was about 1.65M a lesson, about 11.6M for
    seven.
  - Each build's real cost is reported to you.
- **Lesson 1 first.** Lesson 1 is built and checked first (about 1.3M, plus the plan and research).
  The rest follow without waiting, since you approved the build.
- **Gaps to close at build time.** None blocks the build.
  - **Lesson 1:** "a mix of not-all-zero amounts giving zero" as the meaning of dependent needs a
    quote. Khan's independence lessons point there (notes 4.1).
  - **Lesson 2:** P⁻¹ taking your numbers to hers is in 3Blue1Brown's lesson but not saved as a
    quote (notes 4.2). The research stage cites it.
  - **Lesson 3:** n · (r − a) = 0, ax + by + cz = d with normal (a, b, c), the line of two planes as
    n₁ × n₂, the distance to a plane, and linear interpolation are standard, but none is quoted word
    for word (notes 4.3). Lamar and Khan point there. The research stage cites each before the
    lesson states it.
  - **Lesson 4:** "rank plus nullity is the number of columns" and "every answer is one answer plus
    the null space" are not quoted word for word. MIT's "special solutions ... correspond to free
    variables" supports the first (notes 4.4). The research stage cites both.
  - **Lesson 5:** λ² − (trace)λ + det = 0 is my arrangement of HELM's quadratic and its trace and
    determinant rules (notes 4.5). The research stage cites it.
  - **Lesson 6:** the reactor link is my reading. The source names the dominant eigenvalue and the
    generation ratio only (notes 7.3), so the lesson says no more than that.
  - **Lesson 7:** the tank figures and the spring constant are example figures, computed for this
    brief. Coupled circuits as a worked x′ = Ax are UNCONFIRMED (notes 4.7). The square-root step is
    in Aalto and Dyrobes (notes 7.1), and the √3 ratio is my arithmetic from SFU's eigenvalues
    (notes 4.8).
  - **Throughout:** what happens inside Brilliant's lessons is UNCONFIRMED (notes 1.1). So is any
    study showing the picture-first order works better (notes 6.6). Whether your Level 3 course or
    any Royal Navy course uses this material is UNCONFIRMED (notes 3.3, 7.4). Send your syllabus
    when you have it.
