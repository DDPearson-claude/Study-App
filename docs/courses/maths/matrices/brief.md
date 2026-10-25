# Matrices: the course brief

Written 25 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
the third course in the Maths shelf's Advanced maths folder, "Grids of numbers that move, stretch
and turn whole shapes at once." The folder runs Calculus fundamentals, Vectors, Matrices, Linear
algebra, Vector calculus, Differential equations and Group theory. You have Vectors and Differential
equations already. Linear algebra, Vector calculus and Group theory come after this one, so their
ground is left for them, and each deferral below says where it goes. You chose this course next on
24 Oct and approved the build, so I have taken the decisions for you and listed them below. Change
any you like. Sources and quotes are in `research-notes.md` beside this file (159 quotes, cut by
script from the 40 saved tool results and checked with `tools/eval/sources.mjs`, `failed: 0`).
Section numbers below point there.

## The short version
**Seven lessons**
1. What a matrix is (built first)
2. Moving the whole plane
3. One move after another
4. How areas change: the determinant
5. Undoing a move: the inverse
6. Three by three: the determinant and the cross product
7. Elimination: three unknowns, three loops

**The main pictures** (one per lesson, each moved with your finger, each showing the cause):
- **Mix two arrows (lesson 1).** Two arrows on a grid, the two columns of a matrix. Drag their tips
  to set them. Two sliders set how many of each you take. The mix is drawn nose to tail, as in
  Vectors lesson 3, and the grid times the column of amounts reads out beside it. A target dot asks
  you to hit it with a mix, which is a pair of simultaneous equations solved by hand.
- **Drag where i and j land (lesson 2).** A square grid carrying an F-shaped flag. Drag the tips of
  the two arrows that started as i and j. The whole grid follows, lines staying straight and evenly
  spaced, and the flag stretches, turns, flips or leans with it. The matrix reads out as the two
  landing spots in its two columns. Buttons load a stretch, a turn, a mirror, a shear and a squash.
- **Two moves in a row (lesson 3).** Two matrix cards, A and B, and the flag. Play runs the flag
  through the right-hand card first, with a ghost left at the halfway stage, then through the left.
  Swap the cards and run it again. A turn then a shear does not land where a shear then a turn
  does. The product's columns read out as where i and j end up after both moves.
- **The stretched unit square (lesson 4).** Drag where i and j land, as in lesson 2. The unit square
  becomes a shaded parallelogram and its area reads out, with a shape inside whose area scales by
  the same number. Push one arrow across the other's line. The parallelogram thins to a line, the
  area reads 0, then it opens again with the flag mirrored and the area hatched with a minus sign.
- **Move it and bring it back (lesson 5).** Drag the two columns of a matrix, as before. A dot sits
  where you want to land. The page finds the point that lands on it, and "Play back" runs the whole
  move in reverse, carrying the grid home. Lean the two columns towards one line: the point you
  need races away. At a determinant of 0 the plane lies on a line. Then either no point lands on the
  dot, or a whole line of points does, and nothing can say which one you started from.
- **The unit cube and its box (lesson 6).** A unit cube in 3-D, turned by dragging the background.
  Drag the tip of the third arrow, where k lands, while i and j stay put. The cube leans into a
  slanted box. Its volume reads out as the determinant, with the top-row working written beside it
  and updating. Slide the tip down into the floor and the box goes flat and reads 0.
- **Clear the columns (lesson 7).** Three equations as a grid with a column of constants. Pick a
  row, set a multiplier, and add it to another row: Linear systems lesson 3's stack, scale and add,
  done on a grid. Beside it, three planes in 3-D. Every move swings the planes, but they still meet
  at the same point, until the grid is a staircase and the answer drops out from the bottom up. A
  switch loads two other systems. One ends in a row reading 0 = 5 and its planes share no point.
  The other ends in 0 = 0 and its planes share a whole line.

**Decisions taken for you** (say if you want any changed):
- **Seven lessons.** You approved seven, and the research supports a seven-lesson core (notes 8).
  SQA's HN Engineering Mathematics 4 gives matrices 10 of its 40 hours (notes 3.1). HELM spends 82
  pages, and Khan's Precalculus unit has 12 skills (notes 8). Brilliant spends 43 lessons, but all
  2 by 2, with no row reduction and no circuits (notes 1.1, 1.2). Six would drop either the
  cross product's formula, which Vectors left here, or elimination, which every engineering source
  examines (notes 8).
- **Your nine topics fold into seven lessons like this.**
  - Linear combinations join lesson 1, because a matrix times a column is exactly "x lots of the
    first column plus y lots of the second" (LibreTexts, 3Blue1Brown, notes 4.2).
  - Lesson 1 also writes a pair of equations as a grid, row by row (HELM, notes 4.1). That is your
    Linear systems course seen a new way.
  - The two-loop circuit is the worked use at the end of lesson 5. It is written as a matrix
    equation and solved by the inverse.
  - The three-loop circuit is the worked use in lesson 7, solved by elimination. So "the circuit"
    runs through both solving lessons rather than taking a lesson of its own.
- **The determinant comes before the inverse.** Your list had the inverse first. But the 2 by 2
  inverse divides by the determinant, and "is there an inverse?" is answered by it (HELM, notes
  4.5). Every source puts the determinant first: Brilliant levels 7 then 8, HELM 7.3 then 7.4, and
  Bird 58.4 then 58.5 (notes 1.1, 2.3, 2.4, 2.6).
- **Lesson 1 is built first, without a pause.** You approved the build, so lesson 1 is built and
  checked first, and the others follow without waiting. You can try it on your phone as soon as it
  lands.
- **Steps lessons, taught visually ("Yes", RUNBOOK section 0, item 3), as you chose.** Every lesson
  carries `format: 'steps'`, about 12 screens, SHOW then DO, ending on two or three mixed puzzles.
  SHOW screens carry one to three plain sentences. Two places may need a short paragraph, at most
  about 90 words: the mesh-current set-up in lessons 5 and 7, because a circuit's rule needs
  saying in words.
- **The picture first, then the rule.** Brilliant "introduces matrices as transformations of the
  plane ... and derives the arithmetic from that" (notes 1.2). Dorier and colleagues found that
  "the application of recipes without understanding their origin leads to the worst
  misconceptions" (notes 6.2). Students are "just confident with matrix procedures" and slow to
  reason any other way (Thomas and Stewart, notes 6.2). So each rule is met first as something the
  picture does: the product as two moves, ad − bc as an area, the inverse as playing the move
  backwards. No study shows this order works better, though. It is chosen from how the best courses
  are built, and that is UNCONFIRMED as evidence (notes 6.8).
- **One equation, three readings, each named.** Larson and Zandieh show that Ax = b is read three
  ways: as a combination, as a system and as a move. They highlight "the very different ways that
  the vector x is conceived across interpretations" (notes 6.2). Lesson 1 gives the combination and
  the system readings on one grid. Lesson 2 gives the move. Lesson 5 joins them: the unknowns of a
  system are the point the move carried onto the answer.
- **Every entry is named by row, then column.** Edexcel's examiners found that "A common error was
  to confuse rows with columns" (notes 6.1). So every screen says "row 2, column 1", never just
  "the 2, 1 entry". HELM's habit is kept: each row is one equation and each column one unknown
  (notes 4.1).
- **Adding matrices and multiplying by a number get one screen, in lesson 3.** SQA and Pearson ask
  for them (notes 3.1, 3.2), but they are light (notes 4.10). They sit next to the product so the
  difference shows.
- **Building a matrix from a picture.** Column 1 is where (1, 0) lands and column 2 is where (0, 1)
  lands (3Blue1Brown, MIT, notes 4.3). The SQA Advanced Higher page recommends the same habit, but
  its words were not saved cleanly, so it is not quoted (notes 4.3). The turn matrix is built this
  way from Trigonometry lesson 3's point (cos θ, sin θ). It is not given as a formula to learn.
- **A slide is not a matrix move here.** A matrix move always keeps the origin where it is. Khan's
  Linear algebra says matrices "translate images" too (notes 2.1). That uses a bigger matrix, a
  trick this course leaves out.
- **The determinant's sign is a flip, and its size is the scale factor.** "The absolute value of the
  determinant still tells you the factor by which areas have been scaled" (3Blue1Brown, notes 4.6).
  A negative area is drawn hatched with a minus sign, never in red, as Calculus fundamentals did
  for area below the axis.
- **The 2 by 2 inverse is shown before it is used.** HELM's recipe is "interchange the diagonal
  elements, change the sign of the other two elements, and then divide by the determinant" (notes
  4.5). Lesson 5 first multiplies the swapped matrix by the original on screen. The answer is the
  determinant times the do-nothing matrix, which is why you divide by it. Then the recipe gets its
  name.
- **"Minus one" gets one line.** Students use one symbol, a little −1, for three different things
  (Bagley, Rasmussen and Zandieh, via DCU, notes 6.4). You know two of them: x⁻¹ is 1 ÷ x (Powers
  and roots), and f⁻¹ is the undo machine (Functions and their graphs lesson 8). A⁻¹ is the third,
  and it means "undo", like f⁻¹.
- **The 3 by 3 determinant by the top row and cofactors.** HELM: "multiplying each element of the
  first row by its corresponding cofactor and then adding the three together" (notes 4.7). This is
  the method that grows to bigger grids, and it is the one HELM's 3 by 3 inverse needs (notes 4.7,
  5). Sarrus's diagonal rule, which Khan lists (notes 2.1), is left out because it works only for
  3 by 3.
- **The cross product's formula closes the Vectors loop.** HELM: a × b "can be found by evaluating
  the determinant" with i, j and k "(temporarily) treated as if they were scalars" (notes 4.7).
  Lamar: "the cross product is really the determinant of a 3x3 matrix" (notes 4.7). Lesson 6 checks
  it against Vectors lesson 6: i × j = k, swapping the order flips the sign, and the 0.3 m spanner
  with a 150 N push square on gives 45 N m along the bolt (computed).
- **Elimination as a method, not a theory.** Lesson 7 runs HELM's three stages: write the equations
  as a grid, step it down to a staircase, then solve from the bottom up (notes 4.8). What
  row reduction means (rank, pivots, the reduced form of any grid) is Linear algebra's (notes 1.2,
  4.10).
- **Reading the finished grid is its own step.** This is the best-evidenced difficulty. In one
  study, 12 students "were able to carry out the correct row operations but did not provide the
  correct deduction" (ERIC EJ1366218, notes 6.6). So lesson 7 shows the three endings side by side
  and asks you to predict before you finish.
- **Cramer's rule is named once, not taught.** HELM and Bird teach it (notes 2.3, 2.4). But it needs
  3 by 3 determinants for every unknown, and "gives no indication" when the determinant is zero
  (OpenStax via LibreTexts, SECONDARY, notes 4.8). The inverse and elimination cover the syllabus
  lines between them (notes 4.8).
- **The 3 by 3 inverse is named, not worked by hand.** SQA's Engineering Mathematics 4 asks you to
  "Find the inverse of a 3 × 3 matrix" (notes 3.1). That unit is optional in the HND, and whether
  your route takes it is UNCONFIRMED (notes 3.1). HELM finds it "using row operations and using the
  determinant method" (notes 2.3). Lesson 7's last SHOW screen says the same row moves give it, and
  that a calculator does it. If your syllabus asks for it by hand, Linear algebra builds it.
- **Two- and three-loop circuits by mesh currents.** A loop current is given to each loop, then
  Kirchhoff's voltage law and Ohm's law are written round each one (All About Circuits, Khan, notes
  4.9). The result is "[V] = [R] x [I]" (Electronics Tutorials, notes 4.9). A resistor shared by two
  loops carries the difference of their currents (University of Washington, notes 6.7). Your Linear
  systems lesson 5 used branch currents with a junction rule instead, so lesson 5 here says how the
  two methods meet: the shared branch's current is I₁ − I₂.
- **The resistance grid's mirror pattern is a check you can use.** Down the diagonal is each loop's
  total resistance. Off the diagonal is minus the resistance two loops share, so the grid is the
  same either side of its diagonal. That pattern is my reading (notes 4.9). Its support is a source
  saying a current source "lost all symmetry in the matrix equation" (pmcl.net.au, notes 6.7). The
  research stage cites it plainly, and the word "symmetric" is named once.
- **Circuit numbers are example figures, computed by script.** No worked set in the notes was safe
  to copy (notes 4.9). So the course uses its own, checked for this brief:
  - **Two loops (lesson 5):** 4 Ω in loop 1 only, 2 Ω shared, 4 Ω in loop 2 only, 12 V in loop 1
    and 4 V in loop 2. So 6I₁ − 2I₂ = 12 and −2I₁ + 6I₂ = 4. The determinant is 32, and the loop
    currents are 2.5 A and 1.5 A. The shared resistor carries 1 A.
  - **Three loops (lesson 7):** 3 Ω in loop 1, 3 Ω shared by loops 1 and 2, 6 Ω in loop 2, 3 Ω shared
    by loops 2 and 3, and 3 Ω in loop 3. 12 V drives loop 1 and 6 V drives loop 3. The grid is
    [6 −3 0; −3 12 −3; 0 −3 6] with constants 12, 0 and 6, and its determinant is 324. Elimination
    stays in whole numbers: 2 × row 2 + row 1, then 7 × row 3 + the new row 2. The loop currents are
    2.5 A, 1 A and 1.5 A. The middle shared resistor carries −0.5 A, so 0.5 A flows the other way.
- **Systems of differential equations wait for Linear algebra, as you asked.** Your Differential
  equations brief left "systems of equations written as one matrix equation" here: two tanks
  feeding each other, a circuit with two loops, and the submarine dive model. The steady two-loop
  circuit is taught here. The tanks and the dive model change with time, and solving them needs
  eigenvalues, so they go to Linear algebra with them.
- **Naval and plant examples are labelled for what they are.** The rotation-matrix uses are an IEEE
  paper with MIT's author copy and MathWorks pages (notes 7.2). The ship-attitude uses are research
  papers and a patent (notes 7.4). The reactor-core uses are reactor physics texts (notes 7.6). None
  is a Royal Navy document. No naval or Level 3 syllabus line naming matrices was found (UNCONFIRMED,
  notes 7.7). They appear as one-screen uses, never as lessons.
- **Colour as before.** Ink for the grid, arrows, working and controls. Amber for key terms. Teal
  for small labels: i, j and k, row and column labels, units. Red only for a slip. Green only for
  finished. A flip is shown by the mirrored flag and hatching, not by a colour.
- **Example numbers are labelled.** Resistances, voltages, areas, forces and angles in the puzzles
  are example figures, said so on screen, or computed from a rule the screen shows. No figure is
  presented as a real ship's, plant's or regulation's.
- **Your intake answers** (`intake.json`): to understand matrices and how to work with them; on the
  job and in everyday life; hands-on, with the why explained in full.

## 1. The overall topic
A matrix is a grid of numbers, read rows by columns. Engineers use one in two ways. As a table, it
holds the numbers of a set of equations, one row for each equation and one column for each unknown.
As a move, it carries every point of the plane, or of space, somewhere new at once. It can stretch,
turn, mirror, lean or flatten whole shapes. The two readings are the same grid. Its columns say where
the arrows i and j land. Multiplying two matrices does one move after another. The determinant says
how much the move scales areas, and whether it flips them or flattens them. The inverse undoes the
move, when anything can. The course ends where your trade uses all of it: Kirchhoff's laws for a
circuit of two or three loops, written as one matrix equation and solved by the inverse and by
elimination.

**It builds on:**
- **Vectors:** arrows with components, i, j and k (lessons 1 and 2). Scaling (lesson 1), adding
  nose to tail and by parts (lesson 3). The dot product, for checking that two arrows are at right
  angles (lesson 5). The cross product's size and direction, i × j = k, and the 45 N m spanner
  (lesson 6). Its brief left linear combinations, determinants and the cross product's formula for
  this course.
- **Linear systems:** two lines meeting, parallel or the same, and the four graph cases (lesson 1).
  1 = 4 and 1 = 1 in the algebra (lesson 2). Stack, scale and add (lesson 3). Kirchhoff's two
  laws on two loops (lesson 5). Three unknowns stepped down to two (lesson 6), whose last screen
  sends bigger systems here.
- **Trigonometry:** the arm's tip at (cos θ, sin θ), and angles measured anticlockwise from the
  x-axis (lesson 3). It builds the turn matrix.
- **Complex numbers:** times j as a quarter turn, and multiplying as a stretch and a turn (lesson
  3). The quarter-turn matrix sends (x, y) to (−y, x), as times j does (computed).
- **Functions and their graphs:** one machine feeding another, f(g(x)), read right to left (lesson
  7), and undoing a machine (lesson 8). Matrix products read the same way, and A⁻¹ undoes like f⁻¹.
- **Powers and roots:** x⁻¹ as 1 ÷ x, one of the three "minus ones".
- **Geometry fundamentals:** area by unit squares, rectangles and triangles (lesson 1), doubling a
  side gives four times the area (lesson 3), and the volume of a box (lesson 6).
- **The coordinate plane:** points and the grid.
- **AC circuits and Motors:** three phases 120° apart and the rotating field, as places a turn
  matrix shows up.
- **Differential equations:** its brief deferred two-loop systems here (see the decisions).

**Not taught again:** components, i, j and k, scaling and adding vectors, the dot product, the cross
product's size and direction, solving two equations by substitution or elimination, the four graph
cases, Kirchhoff's laws, stepping three unknowns down to two, sin and cos round the circle, times j,
f(g(x)) and inverse functions, the area of a rectangle and a triangle. Each is reminded in one line
where it is used.

**Taught inline, because no course you have holds them:**
- **Rows, columns and sizes** (lesson 1): "2 by 3" means 2 rows and 3 columns (Maths is Fun, notes
  4.1). The entry in row 2, column 3 (HELM, notes 4.1). A square matrix, and the transpose named as
  rows becoming columns, because SQA's definition outcome lists them (notes 3.1).
- **The area of a parallelogram** (lesson 4): base times height. Geometry fundamentals had the
  rectangle and triangle only (its brief). It is shown by cutting a triangle off one end and
  sliding it to the other, which makes a rectangle.
- **Minors and cofactors** (lesson 6): cover a row and a column, and the 2 by 2 left over is the
  minor. The + − + sign pattern makes it a cofactor. HELM lists "know what a cofactor is" before its
  3 by 3 inverse (notes 5).
- **The augmented grid and row moves** (lesson 7): the constants in a last column (HELM, notes 4.1),
  and your Linear systems moves written on rows.
- **The words "invertible" and "singular"** (lesson 5). SQA Advanced Higher asks for "determining
  whether a matrix is singular" (notes 2.2).
- **Each equation in three unknowns is a flat plane in space** (lesson 7). Linear systems lesson 6
  did three unknowns in algebra only.

**Left for later courses:**
- **Linear algebra:** span and "which mixes are possible" (Brilliant's "Possible Combinations",
  glanced at once in lesson 1), linear independence, bases, rank and null space, row reduction as a
  theory, eigenvalues and eigenvectors, diagonalising, orthogonal matrices, and systems of
  differential equations (notes 1.2, 4.10). The two tanks and the dive model from Differential
  equations go there. So does the reactor core: its steady state "is an eigenvalue problem"
  (ScienceDirect Topics, notes 7.6). Linear interpolation, which Vectors also sent here, goes
  there with lines and planes, since Vectors already sent lines there. The 3 by 3 inverse by hand
  goes there if your syllabus asks for it.
- **Vector calculus:** none of this course's ground is left for it. It will use lesson 6's cross
  product formula and the idea of an area scale factor. That is my reading, and its own brief will
  cite what it needs.
- **Group theory:** the turns and mirrors of lesson 2, and the way lesson 3 combines and undoes them,
  come back there as symmetries. Nothing of its ground is taught here. That is my reading.
- **Not on the shelf:** symmetrical components for unbalanced three-phase use a 3 by 3 matrix with
  complex numbers in it (MathWorks, notes 7.3). It is named in lesson 6, not taught. The bus
  admittance matrix for a ship's power network is named in lesson 7 (SECONDARY, notes 7.5).

**Edges.** 2 by 2 and 3 by 3 only, with real numbers. Done by hand, with a calculator for the
arithmetic. No translations, no transpose rules beyond the name, no eigenvalues.

## 2. The lessons, in the order they build
The order is the engineering consensus (notes 2.6): what a matrix is, the rules, the determinant,
the inverse, then solving, with 3 by 3 and elimination last. It takes Brilliant's geometry-first way
into each idea (notes 1.2).

| # | Lesson | What it teaches |
|---|---|---|
| 1 | What a matrix is | "A Matrix is an array of numbers", named rows then columns: "This one has 2 Rows and 3 Columns" (Maths is Fun, notes 4.1). The entry in row 2, column 1. Square matrices and the transpose named (SQA HN EM4's definition outcome, notes 3.1). Where engineers use one: equations in matrix form (HELM 7.1, notes 2.3), "the analysis of electric circuits and the control of systems" (HELM 8.1, notes 7.1), counting routes in a network (HELM, notes 4.1), and turning images in computer graphics (Khan, notes 2.1). A pair of equations as a grid: "all the entries in the second row relate to the second equation, the entries in column 1 are the coefficients of the unknown x1" (HELM, notes 4.1), the "matrix of coefficients", "matrix of unknowns" and "matrix of constants" (notes 4.1). A linear combination: x lots of one arrow plus y lots of another, nose to tail as in Vectors lesson 3 (Brilliant level 1, "Vectors from Combinations", notes 1.1). Matrix times column is that mix of its columns: "take the coordinates of that vector, multiply them by the corresponding column of the matrix, then add" (3Blue1Brown, notes 4.2; LibreTexts, notes 4.2). Hitting (7, 4) with 3 of (2, 1) and 1 of (1, 1) is the system 2x + y = 7, x + y = 4 (computed). One grid, read across its rows as equations and down its columns as arrows (Larson and Zandieh, notes 6.2). Which targets a mix can reach is glanced at and left for Linear algebra. |
| 2 | Moving the whole plane | Times (1, 0) gives column 1, and times (0, 1) gives column 2. So the columns are "where î and ĵ land" (3Blue1Brown, notes 4.3), and the matrix "takes the column basis vectors into the vectors that are the corresponding columns" (MIT OCW, notes 4.3). Every other point follows, x lots of column 1 plus y lots of column 2, so a 2-D move "is completely described by just four numbers" (3Blue1Brown, notes 4.3). The gallery: stretch (a diagonal matrix), turn, mirror, shear and squash flat (Brilliant level 3, notes 1.1; LibreTexts' "reflection, dilation, rotation, shear, projection", notes 4.3). Squash flat when the columns lie on one line: the move "squishes all of 2d space onto the line where those vectors sit" (3Blue1Brown, notes 4.3). Build a matrix from a picture: follow (1, 0), then (0, 1) (notes 4.3). The turn through θ from Trigonometry lesson 3's arm: column 1 is (cos θ, sin θ), and column 2 is the same arm a quarter turn further on, (−sin θ, cos θ). The quarter turn is (x, y) to (−y, x), which is times j (computed). Uses: a drive's Park transform, where "Park's matrix can be subsequently found from a rotation matrix", read as "a rotation in the plane of the cross-section of a machine" (MIT DSpace, notes 7.2). A ship's attitude, where navigation sensors' output "is transformed ... by a direction cosine matrix" (PMC, notes 7.4). SQA Advanced Higher's "rotation, reflection, dilation" (notes 2.2). |
| 3 | One move after another | Doing one move then another is one move: "another linear transformation, distinct from the rotation and the shear" (3Blue1Brown, notes 4.4). The product reads right to left: "You first apply the transformation represented by the matrix on the right" (3Blue1Brown, notes 4.4), as f(g(x)) does in Functions lesson 7. "Both matrices and transformations are written in the order opposite from the order in which they act" (LibreTexts, notes 4.4). Order matters: a quarter turn then a shear gives [1 −1; 1 0], and a shear then a quarter turn gives [0 −1; 1 1] (computed). AB ≠ BA "in most cases" (HELM 7.2, notes 2.3). The product's columns are where i and j end up after both moves. The row-times-column rule is the bookkeeping that finds them. When a product exists: HELM's "decide when the product AB exists" (notes 2.3) and Brilliant's "Matrix Dimensions" (notes 1.1). The identity is the do-nothing move, which "plays the same role in matrix multiplication as the number 1" (HELM, notes 4.4). Counting routes from a or b, through c, d or e, to f or g is a product of two route grids (HELM, notes 4.1). One screen on adding matrices and multiplying by a number, entry by entry, beside the product, which is not entry by entry (SQA EM4 evidence, Pearson LO2, notes 3.1, 3.2). |
| 4 | How areas change: the determinant | The unit square lands on the parallelogram the two columns make. Its area is the scale factor for every shape: "if you know how much the area of that one unit square changes, it tells you how the area of any region in space changes" (3Blue1Brown, notes 4.6). That number is the determinant: "The determinant is 6, same as the area expansion factor!" (Michigan, notes 4.6). Parallelogram area taught inline. For a stretch it is a × d. For a shear the base and height stay 1, so it stays 1. In general it is ad − bc, seen by cutting the parallelogram from its surrounding rectangle. New area = determinant × old area. A shape of 2 squares under a determinant of 3 becomes 6. An image of 24 under a determinant of 4 came from 6 (example figures, computed). A negative value means the plane "has been flipped": the sign is orientation, and the size is still the scale factor (3Blue1Brown, notes 4.6). "The sign of the determinant depends on the orientation of the column vectors" (JHU, notes 4.6). Zero means the plane is squashed "onto a line, or even onto a single point" (3Blue1Brown, notes 4.6). Determinants "allow us to determine whether a system of linear equations has a unique solution or not" (HELM 7.3, notes 4.6). Pearson LO2 asks for the 2 by 2 determinant (notes 3.2). Two moves in a row multiply their area factors, said once if the research stage cites it (see the gaps). |
| 5 | Undoing a move: the inverse | "Whatever A does, A⁻¹ undoes" (Strang, notes 4.5). It is "playing the transformation in reverse" (3Blue1Brown, notes 4.5). A turn through θ then −θ "is equivalent to zero rotation" (HELM, notes 4.5), and a stretch by 2 is undone by a stretch by ½. AA⁻¹ = A⁻¹A = I (HELM, notes 4.5). The −1 is a third meaning, after 1 ÷ x and f⁻¹ (Bagley and others, notes 6.4). The recipe, earned: [d −b; −c a] times A gives (ad − bc) times I, so divide by the determinant (HELM Key Point 8, notes 4.5). A = [3 1; 4 2] has determinant 2 and inverse [1 −0.5; −2 1.5]. Multiply back to check you get I (computed). "Not all matrices have inverses" is "the first question we ask" (Strang, notes 6.4). A zero determinant means none: "You cannot unsquish a line to turn it into a plane" (3Blue1Brown, notes 4.5). Non-square matrices have none (HELM, notes 4.5). Invertible and singular named (notes 2.2). Then a system as AX = B, solved "by pre-multiplying both sides by A⁻¹" (HELM 7.4, notes 4.8). The unknowns are the point the move carried onto the answer. A⁻¹ goes on the left, as lesson 3 showed order matters. With a zero determinant the two lines are parallel or the same, as in Linear systems lesson 1. The worked use is a two-loop circuit by mesh currents: "[V] = [R] x [I]" with "[R⁻¹] ... the inverse of the [R] matrix" (Electronics Tutorials, notes 4.9). A shared resistor's voltage is "(I1 – I2) x R2" (University of Washington, notes 6.7). The circuit gives 6I₁ − 2I₂ = 12 and −2I₁ + 6I₂ = 4, so I₁ = 2.5 A and I₂ = 1.5 A, and 1 A flows in the shared resistor (example figures, computed). The resistance grid is the same either side of its diagonal (see the decisions). MCA Electro-Technology asks for Kirchhoff "by application of simultaneous equations (two unknowns only)" (notes 3.3). |
| 6 | Three by three: the determinant and the cross product | A 3 by 3 matrix moves space, and its columns are where i, j and k land, as lesson 2 showed for the plane. Its determinant is the volume scale factor of the unit cube. That is my reading, backed by Duke's "A is invertible if and only if the volume of A is nonzero" (notes 4.6, 4.7). Cover a row and a column to leave a minor, a 2 by 2 determinant you can already find. Give it its + − + sign to make a cofactor. Then "multiplying each element of the first row by its corresponding cofactor and then adding the three together" (HELM 7.3, notes 4.7). The three-loop circuit's grid [6 −3 0; −3 12 −3; 0 −3 6] gives 324 (computed). A zero determinant means space is flattened onto a plane or a line, and there is no unique answer (HELM, notes 4.6). SQA asks "Find the determinant of a 3 × 3 matrix" (notes 3.1), and Pearson asks for one "of a set of given linear equations" (SECONDARY copy, notes 3.2). The cross product: a × b is the determinant with i, j and k in the top row, "treated as if they were scalars" (HELM 9.4, SECONDARY copy, notes 4.7). The component formula alone "is very cumbersome", and the determinant is "easily remembered" (HELM, notes 4.7). Check it against Vectors lesson 6: i × j = k, swapping the two rows flips the sign, and r = (0.3, 0, 0) m with F = (0, 150, 0) N gives 45 N m along k (computed). The answer is at right angles to both arrows, and the dot product checks it with zeros (Vectors lesson 5). Symmetrical components are named as a 3 by 3 matrix your trade uses (notes 7.3). |
| 7 | Elimination: three unknowns, three loops | Three equations as one grid, with the constants in the last column (HELM, notes 4.1). Each equation is a plane, and the answer is where all three meet. A row move scales one row and adds it to another. It is Linear systems lesson 3's move, and it keeps the same answer. Gauss elimination "has three stages": matrix form, "triangular form", then "back-substitution" (HELM 8.3, notes 4.8). A system has "a unique solution, an infinity of solutions or no solution at all" (HELM 8.1, notes 4.8). A last row of 0 = 5 means the equations conflict: "the equations are inconsistent" (HELM, notes 4.8). A last row of 0 = 0 means one equation is made from the others, and the answer carries a free letter t, as in "x1 = t, x2 = 11 − 10t, x3 = 7t − 7" (HELM 8.3, notes 4.8). A zero determinant says there is no single answer, but "it is not obvious whether" it is none or many (HELM 8.2, notes 4.8). Elimination tells you which. Predict from the determinant first, then check. Put the answer back into the first equations, not the stepped ones. The three-loop circuit: "breaking down a complicated system into simple loops" leads to "a set of linear equations in the unknown quantities (usually currents)" (HELM 8.3, notes 7.1). The same diagonal and off-diagonal pattern as lesson 5, now 3 by 3. Elimination gives 2.5 A, 1 A and 1.5 A, with 0.5 A flowing backwards in the middle shared resistor (example figures, computed). Mesh analysis "can only be applied to planar circuits" (pmcl.net.au, notes 4.9). Last screen: bigger systems are the same method run by computer. "Engineers often need to solve large systems of linear equations", such as "finding currents in a complicated electrical circuit" (HELM, notes 7.1). A ship's bus admittance matrix (SECONDARY, notes 7.5) and a reactor core code's "linear system solver" (KOMODO, notes 7.6) are named. Cramer's rule and the 3 by 3 inverse are named (see the decisions). The skill is on SQA EM4 ("Apply Gaussian Elimination to solve a system of linear equations containing three variables"), Pearson P5, and MCA 2.1.29 "three unknowns" (notes 3.1, 3.2, 3.3). |

## 3. Can it be taught mostly visually, through interaction?
Yes, as you chose. Every lesson is a steps lesson of about 12 screens, with short SHOW screens (see
the decisions). Each lesson has one main picture you move with your finger, and each shows the
cause, not just the answer:
- **Mix two arrows (lesson 1).** Two arrows from the origin, labelled with their numbers and
  written as the grid's two columns. Drag their tips to change the grid. Two sliders set x and y,
  and the mix is drawn nose to tail with its numbers. Tap a row of the grid and it lights as one
  equation, the across sum. Tap a column and it lights as one arrow. A target asks for a mix that
  hits it, and the matching pair of equations sits beside it. *Why:* Brilliant opens Matrices with
  "Vectors from Combinations" and "Linear Combination Grids" (notes 1.1, 1.2). 3Blue1Brown's rule is
  to multiply each coordinate by its column and add (notes 4.2). Larson and Zandieh say the
  combination and system readings conceive x "very differently" (notes 6.2), and this picture
  holds both on one grid. The cause shown: a matrix times a column is built from its columns,
  scaled and laid nose to tail.
- **Drag where i and j land (lesson 2).** A square grid with an F-shaped flag on it. The F has no
  mirror symmetry, so a flip shows at once. Drag the tips of the two arrows that began as i and j.
  The whole grid follows, its lines staying straight, parallel and evenly spaced, with the origin
  fixed. The matrix reads out with the landing spots as its columns. Buttons load a stretch, a turn
  by any angle (with its cos and sin), a mirror, a shear and a squash. A "track a point" mode
  follows one point and writes it as x lots of column 1 plus y lots of column 2. *Why:* "the columns
  [are] the two special vectors where î and ĵ land" (3Blue1Brown, notes 4.3). Brilliant's levels 2 and
  3 run "Transforming Basis Vectors", then the gallery, then "Degenerate Transformations" (notes
  1.1). Sierpinska found students struggle to move between the picture and the arithmetic (notes
  6.2), so every DO screen goes both ways: picture to matrix, and matrix to picture. The cause
  shown: four numbers are just two landing spots, and everything else follows.
- **Two moves in a row (lesson 3).** Two cards, A on the left and B on the right, and the flag. Play
  runs the flag through B, leaves a faint ghost, then runs it through A. The product AB reads out
  with its columns, which are i and j followed through both. Swap the cards and run it again: the
  flag ends somewhere else. Set either card to the do-nothing matrix and the order stops mattering.
  *Why:* 3Blue1Brown builds the product from exactly this, a turn then a shear, read right to left
  (notes 4.4). Brilliant "makes multiplication mean composition" (notes 1.2). The order slip is in
  every teaching source (notes 6.3), and a swap you watch fail is the counterexample (notes 6.3,
  "My reading"). The cause shown: the product is two moves, and moves done in a different order
  end in a different place.
- **The stretched unit square (lesson 4).** As in lesson 2, drag where i and j land. The unit square
  is shaded and becomes the parallelogram of the two columns, with its area read out as ad − bc. A
  "cut and slide" button shows its area as base times height. A shape inside has its area counted
  before and after, and the ratio always equals the determinant. Push j's arrow across i's line.
  The parallelogram thins to a line at 0, then opens hatched, with the flag mirrored and the
  readout negative. *Why:* Brilliant's determinant level starts with "Transformed Areas",
  "Determinant 0" and "Negative Determinants" (notes 1.1). Khan pairs the formula with
  "Interpreting determinants in terms of area" (notes 2.1). A geometric approach lets students "see
  or conjecture properties of the determinant" (Hannah, notes 6.5). Edexcel's most common error was
  multiplying an area by the determinant when they should have divided (notes 6.5). Here the
  before and after areas sit side by side, so the direction is seen. The cause shown: the
  determinant is how much area each square of the grid gets, and its sign is whether the sheet
  turned over.
- **Move it and bring it back (lesson 5).** Drag the two columns of A. A target dot sits where you
  want to land. The page shows the point that lands on it, joined by a faint path. "Play back" runs
  the move in reverse, grid and all, and A⁻¹ reads out. Lean the columns towards one line. The
  determinant shrinks, A⁻¹'s numbers grow, and the starting point races away, as the crossing did
  in Linear systems lesson 1. At 0 the plane lies flat on a line. If the target is off the line,
  nothing lands on it. If it is on the line, a dashed line of points all land on it. Then the same
  picture is relabelled for the circuit: the input is the pair of loop currents and the output is
  the pair of loop voltages. *Why:* "playing the transformation in reverse", and "You cannot
  unsquish a line" (3Blue1Brown, notes 4.5). Brilliant's level 8 runs "Producing the Identity" to
  "Non-invertible Matrices" (notes 1.1). The relabelling is Larson and Zandieh's seam: the unknowns
  of a system are the input of a move (notes 6.2). The cause shown: undoing means knowing where
  each point came from, and squashing flat throws that away.
- **The unit cube and its box (lesson 6).** A unit cube in 3-D, which you turn by dragging the
  background. i and j stay on the floor, and you drag the tip of the arrow where k lands. The cube
  leans into a slanted box, and its volume reads out as the determinant. Beside it, the top-row
  working updates, with each entry's covered row and column greyed out. Slide the tip down to the
  floor and the box goes flat and reads 0. The cross-product screens reuse the floor: the
  parallelogram of a and b, with a × b standing up from it, its length equal to the floor's area.
  *Why:* Duke ties invertible to a "nonzero" volume (notes 4.6). HELM says a zero determinant means
  no unique solution (notes 4.6). Dragging only the third arrow keeps the floor's area fixed, so the
  volume changes only with the height. That is lesson 4's shear again, one size up. Vectors lesson
  6 turned a 3-D view the same way, against cross-product direction errors (Vectors notes 4.7).
  The cause shown: the 3 by 3 determinant is a volume scale factor, and zero is a box with no
  height.
- **Clear the columns (lesson 7).** The augmented grid on top. Pick a row, set its multiplier with
  a stepper, and add it to another. Beside it, three planes in 3-D, turned by dragging. Each move
  swings one plane, but the three still meet at the same point, marked by a dot. When the grid is a
  staircase, back-substitution fills in from the bottom row, one unknown at a time. A switch loads
  a system whose last row becomes 0 0 0 | 5: the planes are shown pairwise crossing in three
  parallel lines, with no common point. Another becomes 0 0 0 | 0: the planes share one line, and
  a slider for t runs a dot along it. Then the three-loop circuit, with its loops drawn above the
  grid. *Why:* HELM's three stages (notes 4.8). The RUME paper found students reached for "parallel
  planes" for both none and infinitely many (notes 6.6), so neither ending is drawn as parallel
  planes alone. Students "experience a disconnect in reinterpreting solutions in relation to the
  original system" (RUME, notes 6.6), so the planes are the original equations' planes throughout.
  Linear systems lesson 3's picture showed the new line swinging through the same crossing, and
  this is that, one size up. The cause shown: a row move never changes the answer, and the finished
  grid says how many answers there were all along.
- **Colour as before:** ink for grids, arrows, planes, working and controls; amber for key terms;
  teal for small labels (i, j, k, row and column labels, units, t); red only for a slip; green only
  for finished. Hatching, not colour, marks a negative area or volume.

## 4. What else
- **Benchmark (notes 1 and 2).**
  - **Brilliant Matrices:** 43 lessons in 9 levels, all 2 by 2: basis vectors, transforming
    vectors, matrices as moves, operations, multiplication, composition, determinants, inverses,
    and systems (notes 1.1). It needs vectors and linear combinations first (notes 1.1). It has no
    row reduction, no 3 by 3 and no eigenvalues (notes 1.2). Its order is followed through lessons 1
    to 5: levels 1, 2 and the start of 4 in lesson 1, level 3 in lesson 2, levels 4 to 6 in lesson
    3, level 7 in lesson 4, levels 8 and 9 in lesson 5 (notes 8). What happens inside its lessons is
    UNCONFIRMED (titles only, notes 1.1).
  - **Khan Precalculus unit 7:** data and arithmetic first, then the plane moves with the
    determinant as area, then products, systems and the inverse (notes 2.1). Khan's Linear algebra
    has the 3 by 3 determinant, Sarrus and row reduction (notes 2.1).
  - **HELM workbooks 7 and 8:** notation and systems in matrix form, products, determinants (2 by 2
    then 3 by 3), the inverse, then Cramer, the inverse method and Gauss elimination, with the cases
    of no unique solution named along the way (notes 2.3).
  - **Bird** chapters 58 and 59 end on Gaussian elimination (SECONDARY host, notes 2.4). Bird
    lectured at the Royal Naval School of Marine Engineering, HMS Sultan (SECONDARY copy, notes 2.4).
  - **Edinburgh's first-year engineering maths:** vectors, then "Matrices, inverses and
    determinants, linear equations and elimination", then "Rank, eigenvalues, eigenvectors" (notes
    2.5). That is the line drawn between this course and Linear algebra.

  What Brilliant lacks and you need: the 3 by 3 determinant, the cross product's formula,
  elimination for three unknowns, and the circuit. Lessons 6 and 7 come from HELM, SQA, Pearson,
  Bird and the MCA (notes 2.6, 3.4).
- **Starting point.** All of Algebra, so equations, lines, trig and j are yours. Vectors gave the
  arrows and both products. Linear systems gave two-equation solving, the four graph cases,
  Kirchhoff on two loops and a first go at three unknowns. Your trade gives you real circuits and
  the rotating field. What is new is the grid as an object, the plane moving as a whole, the
  determinant, the inverse, and the systematic row moves. SQA's old Advanced Higher unit called
  matrices "the only outcome which does not build upon Higher content" (notes 5). That is how it is
  for you too: new ground, built on courses you have done.
- **His aim (notes 3).** Your Level 3 marine engineering course comes next year. No Level 3,
  Royal Navy or submarine syllabus line naming matrices was found (UNCONFIRMED, notes 7.7). Matrices
  first appear at HN level, so this course builds to the nearest published lines, and you can send
  your syllabus when you have it:
  - **SQA HN Engineering Mathematics 4 (H7K3 35), Outcome 2, 10 hours:** define a matrix, add,
    subtract and multiply, "Find the determinant of a 3 × 3 matrix", "Find the inverse of a 3 × 3
    matrix", "Apply Gaussian Elimination to solve a system of linear equations containing three
    variables" (notes 3.1). It is optional in the HND, and whether your route takes it is
    UNCONFIRMED (notes 3.1).
  - **Pearson BTEC HN, Engineering Mathematics LO2 (2017):** notation, add, subtract, multiply, the
    2 by 2 and 3 by 3 determinant, the inverse to solve equations, and Gaussian elimination (notes
    3.2). Unit 4002 is core in the 2024 HNC, but whether it keeps this outcome is UNCONFIRMED. The
    P4 and P5 criteria come from a SECONDARY copy (notes 3.2).
  - **MCA Second Engineer Mathematics 2.1.29:** "Solves linear simultaneous equations of three
    unknowns" (notes 3.3). No MCA line naming matrices was found (UNCONFIRMED, notes 3.3).
  - **MCA Marine Electro-Technology 2.1.9:** Kirchhoff by simultaneous equations, "two unknowns
    only" (notes 3.3). Lesson 5 meets it, and lesson 7 goes past it.
- **Where it is used (each cited before a lesson uses it).**
  - **A matrix and a mix (1):** HELM 7.1 "express a system of linear equations in matrix form"
    (notes 2.3). HELM 8.1 circuits and control (notes 7.1). Route counting (HELM, notes 4.1).
    Computer graphics "rotate, scale, and translate" (Khan, notes 2.1). SQA EM4's definition
    outcome and Pearson's "Introduction to matrices and matrix notation" (notes 3.1, 3.2).
  - **Moves (2):** the Park transform as a rotation, and abc, αβ0 and dq0 transformations "used
    extensively in the analysis and control of three-phase technologies such as machines" (IEEE,
    MIT DSpace, notes 7.2). The Clarke transform (MathWorks, notes 7.2). A ship's attitude from
    "a pitch angle θ, a roll angle γ and a yaw angle φ" (US patent, notes 7.4) and the direction
    cosine matrix of a strapdown system "widely used in submarines and surface ships" (PMC, notes
    7.4). Whether your course covers field-oriented control is UNCONFIRMED (notes 7.2).
  - **Products (3):** a body-to-navigation matrix built "through successive rotations" (MIT 2.017
    via LibreTexts, notes 7.4). Route counting as a product (HELM, notes 4.1). SQA EM4's "one problem
    involving the multiplication of two matrices" (notes 3.1).
  - **The determinant (4):** whether a system "has a unique solution or not" (HELM, notes 4.6).
    "determining whether a matrix is singular" (SQA Advanced Higher, notes 2.2). Pearson's 2 by 2
    determinant (notes 3.2). Areas of images in Edexcel's further maths papers (notes 6.5).
  - **The inverse (5):** HELM 7.4's AX = B (notes 4.8). Pearson's "Using the inverse of a square
    matrix to solve linear equations" (notes 3.2). Mesh currents by the inverse of the resistance
    matrix (Electronics Tutorials, notes 4.9). Mesh equations as "Ax = b" (dummies, University of
    Washington, notes 4.9). MCA Electro-Technology 2.1.9 (notes 3.3).
  - **3 by 3 and the cross product (6):** SQA EM4 and Pearson P4 (notes 3.1, 3.2). HELM 9.4's vector
    product by determinant (notes 4.7). Your Vectors lesson 6 moments and motor force.
    Symmetrical components (MathWorks, notes 7.3).
  - **Elimination (7):** SQA EM4, Pearson P5, MCA 2.1.29 (notes 3.1, 3.2, 3.3). The older SQA
    Advanced Higher unit's "Gaussian elimination to solve a 3 × 3 system" (notes 2.2). Circuits and
    frameworks (HELM 8.3, notes 7.1). A ship's power network (SECONDARY, notes 7.5). Reactor core
    codes (notes 7.6). These are reactor physics texts, not navy documents.
- **The mistakes to catch, each with a puzzle and its own hint.** Most of the research is on
  university linear algebra students, not electricians (notes 6). That you would slip the same way
  is UNCONFIRMED, though the slips are about the maths, so likely.
  - **Lesson 1, rows against columns:** "A common error was to confuse rows with columns" (Edexcel
    Core Pure 1, November 2021, notes 6.1). A puzzle asks for the entry in row 2, column 1 of a 2
    by 3 grid, where row 1, column 2 is a different number.
  - **Lesson 1, procedure without picture:** students are "just confident with matrix procedures"
    (Thomas and Stewart via ERIC EJ1366218, notes 6.2). Each DO screen asks you to predict the mix
    on the grid before the numbers are shown.
  - **Lesson 1, x read one way only:** Larson and Zandieh's three readings (notes 6.2). A puzzle
    gives a grid and asks for both its equations and its arrows.
  - **Lesson 2, picture and numbers kept apart:** students' "inability to move flexibly between the
    three modes", visual and arithmetic among them (Sierpinska, in Dorier's book, notes 6.2). One DO
    builds a matrix from a picture, and the next draws the picture from a matrix.
  - **Lesson 3, order:** assuming "that matrix multiplication is commutative" (Study Rocket,
    SECONDARY, notes 6.3). HELM's outcome "recognise that AB ≠ BA in most cases" (notes 2.3). A
    puzzle asks which flag a turn then a shear gives, with the swapped order as the trap.
  - **Lesson 3, reading left to right:** matrices are "written in the order opposite from the order
    in which they act" (LibreTexts, notes 4.4). A puzzle writes "first B, then A" and asks for AB or
    BA.
  - **Lesson 3, multiplying matching entries:** "to simply multiply corresponding elements in the
    two matrices without adding up the results" (Study Rocket, SECONDARY, notes 6.3). The adding
    screen sits beside the product, and a puzzle offers the entry-by-entry answer.
  - **Lesson 3, two kinds of order:** "The two senses are commutativity and associativity" (Maths
    Stack Exchange, SECONDARY, notes 6.3). Taught as one remark: the order of the moves matters,
    and how you group them does not. The second half is said only if the research stage cites it.
  - **Lesson 4, the scale factor the wrong way round:** "The most common error was to go on to
    multiply the given area by 320 instead of dividing it" (Edexcel IAL F1, Summer 2024, notes
    6.5). A puzzle gives the image's area and asks for the original's.
  - **Lesson 4, the formula without the area:** "recipes without understanding" (Dorier, notes
    6.2). The formula appears only after the parallelogram, and one puzzle asks for a determinant
    off the picture with no numbers.
  - **Lesson 5, three minus ones:** one symbol for three objects (Bagley, Rasmussen and Zandieh via
    DCU, notes 6.4). A puzzle asks what A⁻¹ means, offering "1 ÷ each entry" as the trap.
  - **Lesson 5, an inverse for every matrix:** "Not all matrices have inverses" is "the first
    question we ask" (Strang, notes 6.4). This is a teaching statement, not a counted mistake. A
    puzzle gives three matrices and asks which cannot be undone.
  - **Lesson 5, the shared resistor:** "the voltage across R2 would be (I1 – I2) x R2" (University
    of Washington, notes 6.7). No research on mesh set-up errors was found (notes 6.7). So this and
    the off-diagonal signs are taught as checks, not cited mistakes: the mirror pattern, and putting
    the currents back into each loop.
  - **Lesson 7, right moves and wrong reading:** 12 students "were able to carry out the correct
    row operations but did not provide the correct deduction", and "One common area where students
    displayed persistent misconceptions was that of interpreting the results after carrying out
    Gaussian elimination" (ERIC EJ1366218, notes 6.6). A DO screen gives a finished grid and asks
    only what it says.
  - **Lesson 7, parallel planes for both:** "both students favored the notion of parallel planes
    ... in the case of a system having no solution or infinitely many solutions" (RUME paper,
    title and authors UNCONFIRMED, notes 6.6). The two endings are drawn with planes that are not
    parallel.
  - **Lesson 7, 0 = 0 read as "no answer":** "interpreting the result 'x=x' was not intuitive for
    students" (Oktaç 2018, via the RUME paper, notes 6.6). A puzzle ends on 0 = 0 and asks how many
    answers there are.
  - **Lesson 7, only multiples make infinitely many:** one student thought multiplying an equation
    by a number "is the only way they understand creating a system of lines with infinitely many
    solutions" (RUME, notes 6.6). The infinitely-many example has its third row as the sum of the
    other two, not a multiple.
  - **Lesson 7, losing the original system:** "a disconnect in reinterpreting solutions in relation
    to the original system" (RUME, notes 6.6). Every answer is put back into the first three
    equations.
  - **Lesson 7, the determinant says which:** a zero determinant "gives no indication as to whether
    the system has no solution or an infinite number of solutions" (OpenStax via LibreTexts,
    SECONDARY, notes 4.8; HELM 8.2, notes 4.8). A puzzle with a zero determinant offers "no
    solution" as the trap until the grid is finished.
  - **Not stated as common:** no source counts these, so they are taught as checks (draw it,
    multiply back, put it back), not as cited mistakes.
    - Writing a landing spot as a row instead of a column (lesson 2).
    - Putting the minus in the turn matrix in the wrong corner. Check: a quarter turn sends (1, 0)
      to (0, 1) (lesson 2).
    - Reading a negative determinant as a negative area that cannot be (lesson 4).
    - Writing B A⁻¹ for A⁻¹ B (lesson 5).
    - Forgetting the minus on the middle cofactor (lesson 6).
    - Cross product rows in the wrong order. Check against i × j = k (lesson 6).
- **Size and cost.** 7 lessons of about 12 screens on the agreed settings (CLAUDE.md).
  - Vectors came to about 8.2M tokens for seven lessons, and Differential equations about 9.2M
    (docs/plans/maths-queue.md), so about 1.2M to 1.3M a lesson. Lessons 6 and 7 draw in 3-D with a
    view you turn, which is heavier, and lessons 2 to 5 share one grid-moving picture. So I estimate
    about 1.1M to 1.35M a lesson.
  - That is about 7.7M to 9.5M for the course, plus about 0.3M for the plan and research. The
    research can start from the 40 saved tool results.
  - The full process measured on Fractions lessons 4 to 8 was about 1.65M a lesson, about 11.6M for
    seven.
  - Each build's real cost is reported to you.
- **Lesson 1 first.** Lesson 1 is built and checked first (about 1.2M, plus the plan and research).
  The rest follow without waiting, since you approved the build.
- **Gaps to close at build time.** None blocks the build.
  - **Lesson 2:** "grid lines stay straight, parallel and evenly spaced, with the origin fixed"
    is not quoted in the notes. Nor are the turn matrix's entries, or the SQA habit of following
    (1, 0) then (0, 1) (read, not saved cleanly, notes 4.3). The research stage cites all three.
  - **Lesson 3:** the row-times-column rule's wording and the size rule for a product to exist
    (the first's columns match the second's rows) need quotes. HELM 7.2 and Brilliant's "Matrix
    Dimensions" point there (notes 2.3, 1.1). Associativity is said only if cited, because the
    SQA Advanced Higher line was saved with broken TeX (notes 2.2).
  - **Lesson 4:** ad − bc is in HELM as a formula image, not saved as text (notes 4.5). The
    parallelogram's base times height needs a quote. det(AB) = det A × det B is one remark only if
    cited (maths.scot, TeX not saved, notes 2.2, 4.10).
  - **Lesson 5:** the mirror pattern of the resistance grid is my reading (notes 4.9). The research
    stage cites a source that states it.
  - **Lesson 6:** the volume reading of a 3 by 3 determinant has no clean quote. Duke's "volume of A
    is nonzero" supports it (notes 4.6), and 3Blue1Brown's was saved with TeX (notes 4.7). The + − +
    sign pattern needs a quote. HELM 7.3 points there (notes 4.7).
  - **Lesson 7:** "each equation in three unknowns is a plane" needs a quote. The RUME paper's
    "parallel planes" supports it (notes 6.6). The RUME paper's title and authors are UNCONFIRMED
    (notes 6.6, 9).
  - **Throughout:** the circuit values and every worked number above were computed by script for
    this brief, and the fact-check recomputes them. What happens inside Brilliant's lessons is
    UNCONFIRMED (notes 9). So is any study showing the picture-first order works better (notes 6.8).
