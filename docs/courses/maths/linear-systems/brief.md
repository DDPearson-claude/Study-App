# Linear systems: the course brief

Written 17 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
the third course in the Maths shelf's Algebra folder, "Two straight lines, two equations, and where
they meet: simultaneous equations, as Kirchhoff's laws need them." You asked for the whole Algebra
folder in one push (17 Oct), so I have taken the decisions for you and listed them below; change any
you like. Sources and quotes are in `research-notes.md` beside this file (138 quotes, every one
checked against the 36 saved search results; section numbers below point there).

## The short version
**Six lessons**
1. Where two lines meet (built first)
2. Substitution
3. Elimination
4. From words to two equations
5. Kirchhoff's laws: two loops
6. Three unknowns (a stretch lesson)

**The main pictures** (one per lesson, each moved with your finger):
- **Two lines and a test point (lesson 1).** Drag a point around a grid with two lines on it. Each
  rule shows whether the point fits it. Only the crossing fits both. Then turn the second line:
  as it nears the first line's tilt, the crossing runs away, and when they are parallel there is none.
- **Ride along one line (lesson 2).** A point that can only move along the first line. The second
  equation is shown with the first line's y swapped in, as two bars that match only at the crossing.
- **Stack, scale and add (lesson 3).** The two equations stacked like rows of a sum, with a "×"
  stepper on each and an add or take-away switch. Below, a small graph shows the new line the sum
  makes. It always swings through the same crossing, and it stands upright when y is gone.
- **Two receipts and a grid of guesses (lesson 4).** Drag a guess for the two unknowns around a
  grid. Each fact in the story checks the guess like a receipt. Every guess one fact accepts lies on
  a line, and only the crossing passes both.
- **Walk the loop (lesson 5).** Two batteries feeding one load: a two-loop circuit. Set the two
  currents with dials, and the junction works out the third. Drag a tracer round a loop, adding
  each rise and drop. The total comes back to zero only for the right currents.
- **Step down (lesson 6).** Three equations stacked. Remove one letter twice, and three equations in
  three unknowns step down to two in two, which is lesson 3's picture.

**Decisions taken for you** (say if you want any changed):
- **Six lessons: five core and one stretch.** Brilliant spends 23 lessons on systems of equations,
  Khan 15 content items, Bitesize National 5 four pages and Bird about 14 pages (notes 8). The
  research suggests six core lessons (notes 8). I made five, because the special cases sit
  naturally inside lessons 1 and 2. That leaves room for the three-unknowns lesson inside six.
- **Three unknowns is a stretch lesson, last, and nothing depends on it.** The MCA Second Engineer
  maths syllabus asks for it: "29. Solves linear simultaneous equations of three unknowns" (notes
  3.1). Bird ends his chapter with it (13.6, notes 2.4). But Brilliant's course has none, and no HN
  criterion I could read asks for it outside the matrix units (notes 3.2, 3.3, 4.6). The
  Electro-Technology line says "two unknowns only" (notes 3.1).
- **Matrices and determinants wait for the Matrices course** (Advanced maths folder). Cramer's rule,
  the inverse matrix and Gaussian elimination as a matrix method are where Brilliant (Matrices level
  9), Bird (chapters 58 and 59), HELM (workbooks 7 and 8) and Pearson's HND unit 5006 put them
  (notes 1.2, 2.3, 2.4, 3.3, 4.6). Lesson 6's last screen says so.
- **No answer and endless answers are taught inside lessons 1 and 2, not as a lesson of their
  own.** HELM's advice to tutors is to "Start with the four graphical cases of single intersection
  (at almost right-angles), parallel lines, coincident lines, and almost-coincident lines" (notes
  2.3), and Brilliant puts both cases in its graph level (notes 1.1). So lesson 1 shows all four on
  the graph. Lesson 2 shows what they look like in the algebra, when the letters vanish and leave
  1 = 4 or 1 = 1 (HELM workbook 8, notes 4.3). You met that shape in Linear equations lesson 4, with
  4x + 6 = 4x. If you would rather have them as their own lesson, the course becomes seven.
- **Lesson 1 is built first, without a pause.** You asked for the folder in one push, so lesson 1 is
  built and checked first and the rest follow without waiting. Try it on your phone as soon as it
  lands.
- **Steps lessons throughout ("Yes", RUNBOOK section 0, item 3).** About 12 screens each, SHOW then
  DO, with short sentences. Lesson 5 carries the circuit in the picture's labels, not in extra words.
- **The graph first, then the algebra.** Brilliant, Khan, Bitesize National 5 and HELM all start
  from the crossing point (notes 1.1, 2.1, 2.2, 2.3). The MCA lists it as its own line, 4.1.12
  (notes 3.1).
- **Substitution before elimination, one at a time.** The MCA names them in that order, "1. by the
  method of substitution; 2. by the method of elimination" (notes 3.1), and so do Khan's Algebra 1
  and Brilliant (notes 1.1, 2.1). Bitesize National 5 leads with elimination (notes 2.2), so a
  Scottish college may too. Both are taught, so it does no harm. The IES guide says "introduce one or
  two different solution strategies at a time" (notes 4.2), so each method gets its own lesson.
- **From lesson 3 on, the mixed puzzles make you choose the method.** Rohrer's trial arranges practice
  so "no 2 consecutive problems require the same strategy", and a classroom study found 72% against
  38% on a delayed test (notes 6.4). Picking substitution or elimination is just that kind of choice.
- **Every answer is checked by putting it back into both equations.** Third Space names "Not
  checking the answer using substitution" as a common mistake, and Edexcel's examiners were pleased to
  see "some candidates properly checking their solution" (both SECONDARY, notes 6.1). On the graph,
  the check is the point sitting on both lines.
- **A guess is shown to fail on purpose.** Examiners found most students guessed instead of forming
  equations (Edexcel via PMT, SECONDARY; Eduqas) (notes 6.2). A 2026 study points out that guessing
  is not suitable "particularly where the solutions could be non-integer" (notes 6.2). So lesson 1
  ends on a crossing at a point you cannot read exactly, and lesson 2 gets it exactly.
- **The unknowns are not always x and y.** In lesson 4 they are prices, or the a and b in the law of
  a machine. In lesson 5 they are currents, I₁ and I₂.
- **Kirchhoff's two laws are taught here, one screen each, in OpenStax's words** (notes 4.5). You
  may well use them already in the trade, but no earlier course stated them. Ohm's law (V = IR, from
  Solving equations) is used, not taught again. A negative current meaning "the other way" is a
  one-line reminder from Negative numbers.
- **Lesson 5's circuit is two batteries in parallel feeding one load.** Each battery's own resistance
  is in its branch, and the load is the shared branch. That is the MCA's line 1.1.16, "batteries in
  series and in parallel combinations including internal resistance and current in a connected
  load", and its Kirchhoff line 2.1.9 at once (notes 3.1).
- **Plain words for the special cases.** "No answer" and "endless answers" first. The college words
  "inconsistent" (HELM, notes 2.3) and "redundancy" (SQA, notes 4.3) are named once, in lesson 2,
  after the idea is earned (notes 4.3).
- **The two lines are told apart by labels and line style, not colour.** Colour carries meaning
  only, so line 1 is solid, line 2 dashed and the line a sum makes dotted, all in ink.
- **Systems of inequalities are dropped.** Brilliant gives them 8 lessons (levels 4 and 5), but no
  syllabus line in the research asks for them (notes 4.6, 8).
- **Example numbers are labelled.** Prices, readings, voltages and resistances in the puzzles are
  example figures, said so on screen, or computed from a rule the screen shows. No figure is
  presented as a real ship's or a regulation's.
- **Your intake answers** (`intake.json`): to understand linear systems and how to work with them;
  on the job and in everyday life; hands-on, with the why explained in full.

## 1. The overall topic
A rule like y = 2x + 1 has endless answers: every point on its line. A second rule about the same
two unknowns has its own line. The one pair of numbers that makes both rules true at once is where
the two lines cross. That pair is the solution of the **simultaneous equations**, "simultaneous"
meaning "true at the same time". This course finds it three ways: by reading the graph, by
**substitution** and by **elimination**. It shows the two cases where there is no single answer:
parallel lines (none) and the same line twice (endless). Then it uses the methods where you will
need them. Lesson 4 turns two facts in a story into two equations. Lesson 5 turns Kirchhoff's
current and voltage laws for a two-loop circuit into two equations in two currents, which is the
MCA's Electro-Technology line 2.1.9 (notes 3.1).

**It builds on:**
- **Straight-line graphs:** y = mx + c, drawing a line from its rule, testing whether a point is on
  a line (lesson 3 there), and parallel lines having the same gradient. Lesson 5 there found the law
  of a machine, P = aW + b, by graph. Lesson 4 here finds it from two readings with algebra.
- **Linear equations:** like terms, a minus in front of a bracket, rearranging to make y the
  subject, and lesson 4's 4x + 6 = 4x with no solution.
- **Solving equations:** the balance, doing the same to both sides, and V = IR.
- **Negative numbers:** signs in all four operations, and a negative current meaning it flows the
  other way (its Kirchhoff chains).
- **Fractions:** answers like x = 4/3.

**Not taught again:** plotting a line from y = mx + c, gradient and intercept, testing a point,
parallel lines, solving a one-unknown equation, expanding a bracket with a minus in front,
rearranging a formula, Ohm's law.

**Edges.** Two straight lines and two unknowns, with one stretch to three. No curves, no matrices, no
inequalities.

**Left for later courses:**
- **Powers and roots:** nothing here leads into it.
- **Functions and their graphs:** Brilliant puts Introduction to Functions just before Linear
  Systems (notes 1.2), but nothing in this course needs function notation.
- **Quadratics and polynomials:** a straight line meeting a curve, "finding the coordinates of the
  point(s) of intersection of a straight line and a curve or of two curves" (SQA Higher, notes 2.2).
- **Exponentials and logarithms** and **Trigonometry:** nothing here leads into them.
- **Complex numbers:** the same Kirchhoff equations for AC circuits, written in j-notation, would
  sit there (my reading; not researched here).
- **Matrices** (Advanced maths folder): determinants, Cramer's rule, the inverse matrix and Gaussian
  elimination for larger systems (notes 2.3, 3.3, 4.6).
- **Dropped, not deferred:** systems of inequalities (notes 4.6, 8).

## 2. The lessons, in the order they build
The order follows Brilliant's (the idea, the graph, the algebra, then setting up) and the Scottish
order (graph, algebra, forming equations) (notes 1.1, 2.2). It ends on the circuit, which is the use
the course is for.

| # | Lesson | What it teaches |
|---|---|---|
| 1 | Where two lines meet | One equation in two unknowns has endless answers, a whole line of them (Bitesize GCSE, notes 2.2). A second fact about the same two unknowns is a second line. The crossing point is the only pair on both, so it is the solution (Bitesize KS3, MCA 4.1.12, notes 2.2, 3.1), because there "the x-coordinates are the same and the y-coordinates are the same" (Bitesize N5, notes 2.2). Put each equation in y = mx + c form to draw it (Bitesize KS3, notes 5). Check a crossing by putting it into both rules. HELM's four cases (notes 2.3): one crossing; nearly parallel, with the crossing far off the grid; parallel, with no answer; the same line, with endless answers. Tell which case from m and c before drawing. Last: a crossing that cannot be read exactly from the grid, so a reading is an estimate (notes 6.2). |
| 2 | Substitution | Along line 1, y is 2x + 1, so at the crossing the y in equation 2 is 2x + 1 too. Write it in, and one unknown is left (MCA 2.1.28, notes 3.1). Solve, then put x back to get y, then check in both. Rearrange first when neither equation starts "y =" (Brilliant's "Isolating to Substitute", notes 5). Put a bracket round what goes in, and mind the minus in front of it (MCA 2.1.4, notes 3.1, 5). The lesson 1 crossing comes out exactly, x = 4/3. When the letters vanish: 1 = 4 means no answer (parallel), and 1 = 1 means endless answers (the same line) (HELM workbook 8, notes 4.3). The college words "inconsistent" and "redundancy" are named once (notes 2.3, 4.3). |
| 3 | Elimination | Two true equations added give a true equation, the MCA's "if equal quantities be added to two quantities that are already equal, the results will be equal" (2.1.25, notes 3.1, 5). Add or take away the two equations to leave one unknown (Bitesize KS3, notes 2.2). Opposite signs on the matching terms mean add, the same sign means take away, and the picture shows why (my reading, notes 6.1). Taking away an equation takes away all of it, signs included (notes 5). Scale one equation, every term and the right-hand side (Bitesize KS3, notes 4.2, 6.1). Scale both, as in Bird's 7x − 2y = 26 and 6x + 5y = 29 (notes 2.4). The new line still passes through the crossing, which is why it works. Mixed puzzles choose between substitution and elimination (notes 6.4). |
| 4 | From words to two equations | Two facts about the same two unknowns make two equations (Bitesize N5, notes 2.2). OpenStax's steps: read, say what you are looking for, name it with letters, write the system, solve, and check the answer in the story (notes 4.4). "Some people find setting up word problems with two variables easier" than with one (OpenStax, notes 4.4). Bitesize's drinks and popcorn, then a cable order with example prices. The law of a machine, P = aW + b, from two readings: here a and b are the unknowns (MCA Applied Mechanics 5.1.14, "by both graphical and analytical methods", notes 3.1). Say what the answer means, with its unit. One story where the facts say the same thing twice, so there is no single answer (Khan, notes 4.3). |
| 5 | Kirchhoff's laws: two loops | The current law: "The sum of all currents entering a junction must equal the sum of all currents leaving the junction". The voltage law: "The algebraic sum of changes in potential around any closed circuit path (loop) must be zero" (OpenStax, notes 4.5). Reeds puts it as the drops adding up to the applied p.d. (SECONDARY, notes 7). In two batteries feeding a load, the junction gives I₃ = I₁ + I₂, and one current equation is enough (Boston University, notes 4.5). Each loop gives one equation, so two loops give two equations in I₁ and I₂ (HyperPhysics, notes 4.5). A third loop round the outside adds nothing new (Michigan State, notes 4.5), the "same line" from lesson 2. Guess each current's direction. A wrong guess just gives a minus answer, "no harm done" (OpenStax, BU, notes 4.5). Circuits that reduce by series and parallel rules need none of this (Michigan State, OpenStax, notes 4.5). |
| 6 | Three unknowns (stretch) | Three equations in three unknowns (MCA 2.1.29, Bird 13.6, notes 3.1, 2.4). Remove the same letter from two different pairs, which leaves two equations in two unknowns, and finish with lesson 3. Then put the two back into one of the three to get the third, and check in all three. Equations must match unknowns, "as many independent equations as unknowns" (OpenStax, notes 4.5). Lesson 5's circuit again, with I₁, I₂ and I₃ all kept as unknowns. Last screen: bigger systems, from circuits and frameworks (HELM, notes 4.6, 7), are solved with matrices, in the Matrices course (notes 3.3, 4.6). |

## 3. Can it be taught mostly visually, through interaction?
**Yes**, for all six (RUNBOOK section 0, item 3). Every lesson is a steps lesson of about 12
screens, SHOW then DO, ending on two or three mixed puzzles. HELM's tutors' guide calls this topic
"the opportunity to show the interaction between graph- ical indication and algebraic
determination" (notes 2.3), and the IES guide says equations, graphs and word problems each show something different
(notes 6.4). So each picture puts the algebra and the graph side by side, and each is
chosen because it shows the cause, not just the answer:
- **Lesson 1, two lines and a test point.** Two lines on one grid, line 1 solid and line 2 dashed,
  each labelled with its rule. Drag the test point anywhere. Under each rule the readout puts the
  point's numbers in, as "2 × 3 + 1 = 7 ✓" or "≠". Turn line 2 by its gradient handle from
  Straight-line graphs lesson 3. *Why this picture:* the cause of the solution is visible. A point
  fits a rule only if it is on that line, so only the crossing fits both. That answers "solve each
  equation alone" (Eduqas, notes 6.2) and "concentrated on one equation of the system" (notes 6.1).
  Turning line 2 shows HELM's four cases in one movement (notes 2.3). As the tilts get close, the
  crossing runs off the grid, which answers "Assume all solutions can be seen within a limited
  viewing window" (notes 6.2). Parallel, and there is none, which answers "Believe every system has
  a solution" (notes 6.2). The point snaps to tenths, so a crossing at 4/3 can be got close to but
  never fits both exactly. That answers "Assume approximations are exact answers" (notes 6.2).
- **Lesson 2, ride along one line.** The same two lines, but the point is locked to line 1, and you
  slide it along. Equation 2 is shown with line 1's y swapped in, x + (2x + 1) = 5, as two bars:
  the left side's value and the right side's 5. The bars match only at the crossing. *Why:* it shows
  why you may swap y for 2x + 1. On line 1 they are the same number, and at the crossing the y's
  are the same in both equations (Bitesize N5, notes 2.2). Slide line 2 parallel and the bars never
  match, whatever x is, which is the 1 = 4 of the algebra. Lay it on line 1 and they match
  everywhere, which is 1 = 1.
- **Lesson 3, stack, scale and add.** The two equations stacked as rows, with a "×" stepper on each
  row and an add or take-away switch. The sum row fills in below, term by term, and a term that
  cancels shows 0. Under it, a small graph shows both lines and the dotted line the sum row makes.
  *Why:* the stepper multiplies every term in the row, the right-hand side too, which is the slip
  Bitesize and Third Space name (notes 6.1). The graph shows why elimination is safe. Any sum of
  two true equations is true at the crossing, so its line always swings through the same point. When
  a letter is gone it stands upright (x = 4) or lies flat (y = 3) through that point. Michigan State
  calls such a sum "a linear combination" (notes 4.5). The add or take-away choice is where 76% went
  wrong in one study (notes 6.1). The switch shows the matching term doubling instead of vanishing
  when the wrong one is picked.
- **Lesson 4, two receipts and a grid of guesses.** A grid whose axes are the two unknowns, such as
  the price of a drink and of a bag of popcorn. Drag a guess. Each fact in the story is a receipt that
  works out its total for that guess and compares it with the real one. Every guess a receipt has
  accepted leaves a mark, and the marks line up. *Why:* it shows that a fact about two unknowns is a
  line of possibilities, and two facts pin one pair, which is Brilliant's "Two Constraints" (notes
  1.1, 4.4). Guessing the pair is slow, which is why examiners want equations instead (notes 6.2).
  The same grid with a and b on its axes finds the law of a machine from two readings.
- **Lesson 5, walk the loop.** A two-loop circuit: two batteries, each with its own resistance,
  feeding one load in the shared branch, with labelled example values. Two dials set I₁ and I₂, and
  the junction shows I₃ = I₁ + I₂. Drag a tracer round a loop. Each part it passes adds its rise or
  drop (E, or I × R from V = IR) to a running total. *Why:* it shows the voltage law as a cause.
  The total comes back to 0 only when the currents are right for that loop. Each loop then gives one
  equation, and the two together give the currents. A small (I₁, I₂) grid on one screen shows the
  two loop equations as two lines crossing at the answer, which brings back lesson 1. Set a current
  dial below zero and its arrow turns round. It stays ink, because a minus current is not a mistake
  (OpenStax, BU, notes 4.5).
- **Lesson 6, step down.** Three equations stacked, with the same steppers and switch as lesson 3.
  Pick the letter to remove and a pair of rows, and the result row drops into a new stack. Two
  removals leave two rows in two unknowns, which slide into lesson 3's picture. A count above reads
  "unknowns 3, equations 3", then "2 and 2", then "1 and 1". *Why:* three planes in space would not
  read on a phone. The count shows why the method works. Each removal takes away one unknown and one
  equation, so you always have as many equations as unknowns (OpenStax, notes 4.5).
- **Colour as before:** ink for lines, points, working and controls; amber for key terms (crossing
  point, simultaneous, substitution, elimination, junction, loop); teal for axis labels and units;
  red only for a slip in a puzzle; green only for finished. A rule a point does not fit shows "≠" in
  ink, because exploring is not a mistake.

## 4. What else
- **Benchmark (notes 1, 2).**
  - **Brilliant Linear Systems** (31 lessons, 6 levels, new): the idea of a system, solving by graph
    (with no solution and infinitely many inside it), solving with algebra (substitution, adding
    equations, scaling one and both), two levels of inequalities, then setting up systems with
    motion examples (notes 1.1). Lessons 1 to 4 here cover its levels 1, 2, 3 and 6. Levels 4 and 5
    are dropped. Its motion problems are swapped for prices and the law of a machine.
  - **Khan Algebra 1** (19 items): solutions, graphing, systems in context, substitution, combining
    equations, elimination, then the number of solutions and word problems "with zero and infinite
    solutions" (notes 2.1).
  - **Bitesize National 5** (4 pages): graph, algebra, non-matching coefficients, forming pairs of
    equations (notes 2.2). SQA's National 5 specification: "Construct from text, Graphical solution,
    Algebraic solution" (notes 2.2).
  - **HELM** puts simultaneous linear equations at 3.4, beside linear equations and inequalities, and
    the matrix methods in workbooks 7 and 8 (notes 2.3).
  - **Bird's Basic Engineering Mathematics** chapter 13: two unknowns, further and harder ones,
    practical problems, then three unknowns (notes 2.4).
  - **What they lack that you need:** none of the school courses has Kirchhoff's laws. HELM calls
    circuit analysis "a ready example" (notes 7), and the MCA examines it (notes 3.1). Lesson 5 comes
    from those, and lesson 6 from the MCA and Bird.
- **His aim (notes 3).**
  - **MCA Second Engineer mathematics:** 2.1.28 "Solves linear simultaneous equations of two
    unknowns: 1. by the method of substitution; 2. by the method of elimination", 2.1.29 three
    unknowns, 2.1.30 "Develops linear simultaneous equations of two unknowns consistent with data
    provided in a question", and 4.1.12, the solution "where the graphs intersect" (notes 3.1).
  - **MCA Marine Electro-Technology:** 2.1.3 and 2.1.4 state both Kirchhoff laws, and 2.1.9 "Solves
    problems using Kirchhoffs laws by application of simultaneous equations (two unknowns only)"
    (notes 3.1).
  - **MCA Applied Mechanics:** 5.1.14 "Determines the law of a machine by both graphical and
    analytical methods" (notes 3.1).
  - **MSN 1857:** an HNC route needs four of six subjects, Mathematics first, and the Second Engineer
    examinations include Mathematics and Electro Technology (notes 3.1).
  - **The HN units take it as known.** Neither current SQA HN Engineering Mathematics unit names
    simultaneous equations; unit 1 asks for "good algebraic skills" on entry (notes 3.2). Pearson
    4002 has no criterion for it either, and 5006 at HND level goes straight to matrices (notes
    3.3). So this course is an entry skill the HNC builds on.
- **Where it is used (each cited before a lesson uses it).**
  - **The crossing point (1):** MCA 4.1.12 (notes 3.1); SQA National 5 "Graphical solution" (notes
    2.2); the law of a machine "by graphical" methods (MCA 5.1.14, notes 3.1).
  - **Substitution (2):** MCA 2.1.28 (notes 3.1). The junction equation I₃ = I₁ + I₂ is put into the
    loop equations by substitution in lesson 5 (notes 4.5).
  - **Elimination (3):** MCA 2.1.28 and the axioms of 2.1.25 (notes 3.1); Bird's worked pair (notes
    2.4); Bitesize National 5 (notes 2.2).
  - **Words to equations (4):** MCA 2.1.30 (notes 3.1); SQA National 5 "Construct from text" (notes
    2.2); Bird 13.5 "Practical problems" (notes 7); the law of a machine by "analytical" methods (MCA
    5.1.14, notes 3.1).
  - **Kirchhoff (5):** MCA Electro-Technology 2.1.3, 2.1.4, 2.1.9 and 1.1.16 (notes 3.1); HELM's
    "ready example" and its "set of linear equations in the unknown quantities (usually currents)"
    (notes 7, the second SECONDARY); Reeds Vol 6 for marine engineers (SECONDARY, notes 7).
  - **Three unknowns (6):** MCA 2.1.29 (notes 3.1); Bird 13.6 (notes 2.4); larger systems from
    frameworks and circuits (HELM workbook 7, notes 4.6).
- **The mistakes to catch, each with a DO screen and its own hint.**
  - **Lesson 1, each equation alone:** "Candidates often attempted to solve each equation
    individually" (Eduqas, Nov 2023, notes 6.2); "Student tries to solve each equation individually"
    and students "concentrated on one equation of the system" (both SECONDARY, notes 6.1, 6.2).
  - **Lessons 1 and 4, guessing:** "The majority of students used a trial and improvement approach"
    (Edexcel via PMT, SECONDARY), "Some candidates just attempted to solve the equations through
    trials" (Eduqas) (notes 6.2). Guessing fails "where the solutions could be non-integer"
    (Frontiers, 2026, notes 6.2).
  - **Lesson 1, a reading taken as exact; a window that hides the answer; every system has one:**
    the teacher-training list (SECONDARY, notes 6.2).
  - **Lessons 1 and 2, no single answer:** "50% of the students could not indicate" that a system had
    none, "whiles 12% of the students used the coefficients of x and y as the solution" (SECONDARY,
    notes 6.1). A DO screen offers the coefficients as a choice.
  - **Lessons 2, 3 and 5, signs:** "For Systems of equations, negative sign errors were most common"
    (Booth and others, 2014, notes 6.1). Students who do not tie a minus to its term "delete or move
    negatives" (SERP brief, SECONDARY, notes 6.3). In lesson 2 it is the minus before the bracket you
    swap in.
  - **Lesson 3, add or take away:** "76% of students misjudged the operations", and it was worse
    "when the variables in the two equations had opposite signs" (SECONDARY, notes 6.1). Edexcel's
    examiners: "Those that subtracted were not awarded any marks" (via PMT, SECONDARY, notes 6.1).
    Third Space names it first (SECONDARY, notes 6.1).
  - **Lesson 3, the sum slips:** "the difference between 12 x and – x being found as 11 x" (Edexcel
    via PMT, SECONDARY, notes 6.1).
  - **Lessons 3 and 6, not scaling every term:** "forgetting to multiply every term by the same
    number" (Third Space, SECONDARY), and Bitesize's "Don't forget to multiply the right hand side"
    (notes 6.1).
  - **Lesson 3, mixing across the equals sign:** "Combines terms on opposite sides of the equal sign
    when adding equations together" (SECONDARY, notes 6.2). Behind it is reading "=" as where the
    answer goes rather than as balance (Booth and Koedinger, via ED543090, SECONDARY, notes 6.3).
  - **Every lesson, not checking:** "Forget to check solutions" (SECONDARY, notes 6.2) and Third
    Space's "Not checking the answer using substitution" (SECONDARY, notes 6.1).
  - **Lesson 4, the answer with no meaning:** "Unable to interpret solutions in context despite being
    able to solve the equations" (SECONDARY, notes 6.2). Every DO screen asks what the pair means,
    with its unit, which is OpenStax's step 6 (notes 4.4).
  - **Lesson 5, a minus current taken for a mistake:** OpenStax says "no harm done", and BU reads "The
    negative sign means that the current is 0.5 A in the direction opposite" (notes 4.5). These are
    teaching statements, not a counted mistake.
  - **Not stated as common:** no source counts these, so they are taught as checks (put the pair back
    into both, look at the graph), not as cited mistakes.
    - Reading 1 = 1 as "x = 1", or 0 = 0 as "x = 0".
    - Finding x and stopping, without y.
    - Checking in only one of the equations.
    - Swapping which letter stands for which thing in a story.
    - In a loop, giving a drop the wrong sign when walking against the current's arrow.
    - Writing the outside loop as a third equation and expecting it to help.
- **Size and cost.** 6 lessons of about 12 screens on the agreed settings.
  - The last six measured courses ran about 0.99M to 1.14M tokens a lesson
    (docs/plans/foundational-maths-roadmap.md). Linked pictures (rows with a graph, a circuit with a
    tracer) are a little heavier, so I estimate about 1.05M to 1.2M a lesson.
  - That is about 6.3M to 7.2M for the course, plus about 0.3M for the plan and research. The
    research can start from the 36 saved tool results.
  - The full process measured on Fractions lessons 4 to 8 was about 1.65M a lesson, about 9.9M for
    six.
  - Each build's real cost is reported to you.
- **Lesson 1 first.** Lesson 1 is built and checked before the others (about 1.1M, plus the plan and
  research). Because you asked for the folder in one push, the rest follow without waiting for you
  to try it.
- **Gaps to close at build time.** None blocks the build.
  - What Brilliant's lessons show on screen was not seen, only its contents list (UNCONFIRMED, notes
    1.1).
  - HELM 3.4's own length, and where Bird's graphical-solution chapter sits, are UNCONFIRMED (notes
    2.3, 2.4).
  - The MCA syllabus pages say "Published 6 May 2014"; whether the current papers still follow them
    exactly is UNCONFIRMED (notes 3.1).
  - Which SQA unit assesses this for your college is UNCONFIRMED, and Pearson 4002's essential
    content was not seen (UNCONFIRMED) (notes 3.2, 3.3). Check your college's own unit descriptor.
  - **Lesson 4:** no page in the research works the law of a machine, or a battery's e.m.f. and
    internal resistance, from two readings as simultaneous equations (UNCONFIRMED as a sourced worked
    example, notes 7). The lesson builds the two equations from a rule shown on screen with labelled
    example readings. A battery version needs E = V + Ir cited first, so it is left out unless the
    research stage cites it.
  - **Lesson 5:** if a puzzle's battery current comes out negative, saying that the battery is being
    charged needs its own source. None is in the notes, so the lesson says only that the current
    flows the other way (notes 4.5) unless the research stage cites one.
  - **Lesson 5:** the sign rule for walking a loop (a drop when walking with the current through a
    resistor, a rise through a battery from − to +) is standard but not quoted in the notes. The
    research stage cites it (OpenStax 21.3 states the rules) before the lesson uses it.
  - **Lesson 6:** Bird 13.6 was seen only as a contents line (notes 2.4). The worked method of removing
    one letter twice is built from lesson 3's steps and checked by putting the answers into all three
    equations, not cited as Bird's.
