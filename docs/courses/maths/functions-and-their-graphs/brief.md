# Functions and their graphs: the course brief

Written 17 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
the fifth course in the Maths shelf's Algebra folder, "A function as a machine: inputs, outputs and
their graphs, and how shifting or stretching a graph changes its rule." You asked for the whole
Algebra folder in one push (17 Oct), so I have taken the decisions for you and listed them below;
change any you like. Sources and quotes are in `research-notes.md` beside this file (200 quotes,
every one checked against the 57 saved tool results; section numbers below point there).

## The short version
**Eight lessons**
1. The function machine (built first)
2. Reading a graph as a function
3. Five families of graphs
4. Domain and range
5. Shifting a graph
6. Stretching and flipping
7. One machine feeding another
8. Undoing a machine

**The main pictures** (one per lesson, each moved with your finger):
- **The machine and its trail (lesson 1).** Drag a number into the machine. The rule's steps light
  up in order, the output drops out, and the pair lands as a row in a table and a dot on a graph
  underneath. Feed it more inputs and the dots draw the function's graph.
- **The input pointer (lesson 2).** Drag a pointer along the x-axis. A beam rises from it, meets the
  graph and carries the reading across to the y-axis. Where the beam meets a curve twice, both
  readings show, and that curve is not a function.
- **The family gallery (lesson 3).** Pick a family: line, square, cube, reciprocal or square root.
  Drag x and watch where the output goes. Then drag a level line up and down: it crosses the square
  twice and the cube once.
- **Shadows on the axes (lesson 4).** A graph casts a shadow down onto the x-axis (the inputs it
  takes) and across onto the y-axis (the outputs it gives). Drag the input towards a gap or an edge
  and the machine refuses it.
- **Drag the graph (lesson 5).** Grab a graph and slide it. A faint copy of where it started stays
  behind, the rule rewrites as you go, and one marked point shows its old and new coordinates
  side by side. For a sideways slide you predict first, then drag.
- **Pull the graph (lesson 6).** A handle above the curve stretches it up and down, and pulling it
  through the axis flips it. A handle at the side squeezes it in or out. Arrows from the axis to
  each marked point all grow by the same factor.
- **Two machines in a chain (lesson 7).** Drag an input into the first machine and watch the middle
  value pass into the second. A switch swaps the order. The worked chain is a flow meter's:
  pressure difference, then a 4 to 20 mA signal, then a square root, then the flow.
- **The machine and its mirror (lesson 8).** A machine faces its undoing machine. Drag an input
  through the first. Its output goes into the second, which runs the steps backwards in reverse
  order and hands back the number you started with.

**Decisions taken for you** (say if you want any changed):
- **Eight lessons.** Brilliant spends 68 lessons on Introduction to Functions and 60 on Coordinate
  Transformations, because it also does piecewise, floor and ceiling, periodic functions,
  operations on functions and the moving of shapes (notes 1.1, 1.2, 8.1). Khan's Algebra 1 unit has
  22 skills, and HELM gives functions about four sections (notes 8.1). The research suggests seven
  lessons with an optional eighth (notes 8.1). I made eight by giving domain and range a lesson of
  their own, after the five families, because the research says to teach them on the 1/x gap and
  the square-root edge, and the range is the harder half (notes 6.8). The research's optional
  eighth, "which family is this law?", is spread through lessons 3 and 4 instead. Seven is possible
  by joining lessons 2 and 4 into one "Reading a graph" lesson. It would save about 1.15M tokens,
  but domain and range would get four screens.
- **Lesson 1 is built first, without a pause.** The runbook asks for a pilot you try before the
  rest. You asked for the folder in one push, so lesson 1 is built and checked first, and the
  others follow without waiting. You can try it on your phone as soon as it lands.
- **Steps lessons throughout ("Yes", RUNBOOK section 0, item 3).** About 12 screens each, SHOW then
  DO, with short sentences, ending on two or three mixed puzzles. Every graph is a live picture you
  move, so the words stay short.
- **The order.** Every benchmark starts with the rule, input, output and notation, then domain and
  range, and does shifts before stretches (notes 2.8). This course follows that, with the graph
  shapes pulled earlier than Brilliant has them (it puts domain and range at its levels 8 and 9,
  notes 1.1). Composite comes before inverse, as in Brilliant, Khan and OpenStax (notes 2.1, 2.7,
  2.8), because undoing a two-step machine means undoing a chain, and HELM's f⁻¹(f(x)) = x is
  itself a chain (notes 4.7).
- **The machine first, but never alone.** Every source starts with the machine (notes 4.1). The
  research warns that it is "very useful for the initial stages" but "incomplete", and that the
  function box can lead to "all functions can be expressed with a formula" (notes 6.2). So lesson 1
  shows the same function as a machine, a table and a graph at once (Thompson, notes 6.11), and
  includes a machine with no formula at all: a table of readings.
- **f(x) gets its full treatment here.** Calculus fundamentals lesson 1 met it in one line, "the
  rule applied to 3". Here it is read "f of x" aloud every time, never "f times x" (Lumen,
  SECONDARY, notes 4.1, 6.1). Letters other than f and x come in early, such as P(I) = I²R, because
  "Function notation gives you more flexibility" (Lumen, notes 4.1). And f is fed expressions as
  well as numbers, because the research names "the confusion between function notation and
  variable inputs" (Ayeh 2025, notes 6.1).
- **Five families, chosen for the trade.** Line, square, cube, reciprocal and square root. Each one
  is an electrician's or marine engineer's law (notes 7.1 to 7.6). The absolute value |x|, which
  Brilliant and Khan use as a parent shape (notes 1.1, 2.2), is left out: no trade or college line
  for it was found.
- **"One input, one output" first, the vertical line second.** The research warns against
  "overreliance on the vertical line test" (Ayeh 2025, notes 6.4). So lesson 2 asks what the machine
  gives for each input, and only then names the vertical line as a way of seeing it.
- **The circle is the example of a graph that is not a function.** The Straight-line graphs brief
  sent circles here. A circle gives two outputs for most inputs, so lesson 2 uses it as the curve
  that fails. Its equation, x² + y² = r², is shown once, and finding a circle's centre and radius
  is left out. HELM has a circle section and Bird lists the circle among standard curves (notes
  2.5, 2.6), but no marine line asks for circle equations. The research stage for lesson 2 must
  cite x² + y² = r² before the lesson states it (see the gaps below).
- **Shifts are taught on several shapes, never only the parabola.** Khan calls them "parent
  functions" and says the idea extends to "any function whatsoever" (notes 2.2). The shifted
  parabola in vertex form belongs to Quadratics and polynomials (Brilliant puts it in Quadratics,
  notes 1.5).
- **No "do the opposite" rule for sideways shifts.** The direction is "counterintuitive" even to
  teachers, and learners who memorise it show "no desire ... to understand" (Zazkis et al., notes
  6.6). So lesson 5 has you predict first, then work out a couple of points and drag. The reason is
  shown in a table: for f(x − 3), the input must be 3 bigger to give the same output, so every point
  sits 3 further right. A delayed signal, which happens later and so sits to the right, makes it
  feel right.
- **Stretches are in, though GCSE leaves them out.** Bitesize GCSE has only translations and
  reflections (notes 2.3). SQA Higher has k f(x) and f(kx) (notes 2.4), Khan and Brilliant both
  teach them (notes 1.1, 2.2), and "gain" on an instrument is a stretch (TI, notes 7.1). The sideways
  squeeze gets two screens, checked by points, because g(2x) is "a horizontal compression"
  (K12 LibreTexts, SECONDARY, notes 4.5).
- **At most two moves at once.** Bitesize says that with more than one transformation "the order
  matters" and to "work out some coordinates" when unsure (notes 6.7). The course stops at two.
- **Inverse as undoing, with the graph mirror as one screen.** The inverse is taught as a pair of
  machines facing each other, built from the flow diagram you used in Solving equations. Graphing
  f and f⁻¹ on the same axes "created confusion" (AMS blog, notes 6.10), so the mirror in y = x is
  the last SHOW screen of lesson 8, not its picture. SQA's HN unit asks you to "Graph functions and
  their inverse functions" (notes 3.1), which is why it is there at all.
- **"Inverse", never "f to the minus one" as a power.** HELM: "Do not confuse the ‘−1’ with an
  index" (notes 6.10). The symbol is read "f inverse".
- **Later courses get a one-screen look ahead, no more.** Lesson 6 ends on an AC wave with a DC
  offset, a peak and a phase shift, the same moves in one formula (notes 4.8, 7.8). Its trigonometry
  waits for Trigonometry. Lesson 8 ends by naming the exponential and the logarithm as the next
  inverse pair, for Exponentials and logarithms.
- **Left out, not deferred:** piecewise, floor and ceiling, and periodic functions as a topic; adding
  and multiplying functions; even and odd functions; rotating and reflecting shapes (notes 8.1).
  None has a marine line in the notes, and none is in your folder.
- **Example numbers are labelled.** The 4 to 20 mA scale is cited (control.com, notes 7.1), and
  12 mA is "50% DP, but 71% flow" (Control Engineering, notes 7.6). Pressures, flows, speeds,
  currents and temperatures in the puzzles are example figures, said so on screen, or computed from
  a rule the screen shows. The propeller law is taught as a model that "works well" at steady
  running and "breaks down" at partial load (SSRN, notes 7.4).
- **Colour as before.** Ink for graphs and controls. The faint copy of a moved graph is ink at low
  strength, not a colour. A missing input (the hole at x = 0 on 1/x) is a hollow ink circle, not red.
  Amber for key terms, teal for small labels, red only for a slip, green only for finished.
- **Your intake answers** (`intake.json`): to understand functions and their graphs and how to work
  with them; on the job and in everyday life; hands-on, with the why explained in full.

## 1. The overall topic
A function is a rule that takes an input and gives exactly one output. HELM: "A function is a rule
which operates on an input and produces a single output from that input" (notes 4.1). This course
builds that idea as a machine, then shows the same thing as a table and a graph. It meets the five
graph shapes you will see in engineering laws, and reads off which inputs a function takes and
which outputs it gives (domain and range). Then it moves graphs: slide, stretch and flip them, and
see exactly how each move changes the rule. It ends with two machines in a chain (a composite
function) and a machine run backwards (an inverse function). Rearranging a formula, which you have
done since Solving equations, turns out to be finding an inverse.

**It builds on:**
- **Solving equations:** putting numbers into a formula, the flow diagram that undoes steps in
  reverse order (lesson 2), and rearranging formulas such as P = I²R to I = √(P ÷ R) (lessons 5 and
  6). Lesson 8 here grows the flow diagram into the inverse function.
- **Linear equations:** rearranging R = R₀(1 + αΔT) for ΔT (lesson 6). Lesson 8 calls that an inverse.
- **The coordinate plane:** reading and plotting points, scales, a smooth curve through readings,
  reading a graph in both directions (lesson 5, the pump's head-flow curve).
- **Straight-line graphs:** gradient, y = mx + c, and the c handle that slides a line up and down
  (lesson 3). That slide is a vertical shift, so lesson 5 here starts from it.
- **Powers and roots:** squares, cubes and roots, √ meaning the positive root, x² = 36 having two
  answers (lesson 3), "one over" (lesson 2), and the factor dial for P = I²R and pump power going
  with speed cubed (lesson 7). Here those laws are seen as graphs.
- **Proportional reasoning:** inverse proportion and Boyle's law (lesson 6), which is the
  reciprocal family.
- **Calculus fundamentals:** f(x) in one line (lesson 1), and "shifting a graph up does not change
  its slopes" (lesson 4).
- **Fractions and Negative numbers:** reciprocals, and negative inputs.

**Not taught again:** substitution, rearranging formulas, the flow diagram, gradient and
y = mx + c, the c handle, reading a graph both ways, squares, cubes and roots and what they do to a
factor, inverse proportion. Each is used with a one-line reminder, and only what is new is taught.

**Taught inline, because you have not met them:** f(x) read "f of x", and other letters as names
(g, P(I)); the words input, output, rule, domain, range, one-to-one and many-to-one; asymptote and
pole, in one screen each, because SQA's HN unit asks for them (notes 3.1); the words composite and
inverse.

**Edges.** Real numbers only. Functions of one input. Five families, and at most two moves at once.
No piecewise or periodic functions, no adding of functions, no even and odd.

**Left for later courses:**
- **Quadratics and polynomials:** the shifted parabola written in vertex form, completing the
  square, and cubics with more than one bend (Bitesize: they "can have more than one change of
  direction", notes 4.3). Here the square and cube are the plain y = x² and y = x³, moved.
- **Exponentials and logarithms:** the exponential and the logarithm as an inverse pair, sketching
  the inverse of an exponential (SQA Higher, notes 2.4), and finding n in pVⁿ = C (notes 5.1).
  Lesson 8 names them on its last screen.
- **Trigonometry:** sine waves, amplitude, phase and DC offset as transformations (notes 4.8, 7.8),
  and trigonometric equations, which SQA's HN Outcome 1 pairs with functions (notes 3.1). Lesson 6
  previews the wave on one screen.
- **Complex numbers:** the square root of a negative number. Here √ of a negative is simply outside
  the domain.

## 2. The lessons, in the order they build
The order follows the research's core (notes 2.8, 8.1): machine and notation, the graph as a
function, the five shapes, domain and range, shifts, stretches and flips, the chain, the undoing.

| # | Lesson | What it teaches |
|---|---|---|
| 1 | The function machine | A function takes an input, applies a rule and gives one output (HELM, Bitesize, notes 4.1). Bitesize's machine "multiply by 3 and then subtract 1": 5 in, 14 out (notes 2.3). f(x) = 3x − 1 is read "f of x", and f(5) = 14; the bracket does not mean multiply (Lumen, SECONDARY, notes 4.1, 6.1). Evaluate at negatives, fractions and an expression, f(a + 1). Other letters as names: P(I) = I²R. The same function as a machine, a table and a graph (Thompson, notes 6.11; literature review, notes 6.2). A 4 to 20 mA scale as a machine, percent in and mA out, from the rule y = mx + b (control.com, notes 7.1). A machine with no formula: a table of readings (notes 6.2). A machine that gives 3 whatever you put in is still a function (notes 6.3). Input and output are the independent and dependent variables (MCA, notes 3.3). |
| 2 | Reading a graph as a function | Each input on a function's graph has exactly one output (Lumen, notes 4.4). Read f(4) from a graph, and read backwards to find which inputs give an output. A graph is "this quantity against that one", not a picture of a path: a tank's level against time is not the tank's shape (graph-as-picture, notes 6.5). A curve with a gap is still a function (notes 6.3). A circle gives two outputs for most inputs, so it is not a function. Then the vertical line as a quick way to see it, not a rule to apply blind (Ayeh, notes 6.4). A rule that gives the same output for two inputs is still a function (HELM, notes 6.4). |
| 3 | Five families of graphs | The line (known), the square y = x², the cube y = x³, the reciprocal y = 1/x and the square root y = √x, each built from a table (HELM, notes 4.4) and each with its law: P = I²R (HyperPhysics, notes 7.3), engine load with propeller speed cubed (SSRN, notes 7.4) and fan power with speed cubed (ScienceDirect, notes 7.4), current against resistance and Boyle's p against V (LibreTexts, OpenStax, notes 7.5), flow from the square root of the pressure difference (Control Engineering, notes 7.6). A level line cuts the square twice (many-to-one) and the cube once (one-to-one) (HELM, notes 4.3). Not every function is a line or a parabola (notes 6.3). Each family's tell-tale feature: the square's symmetry, the reciprocal's gap, the root's starting edge (Bitesize, Kop et al., notes 4.3). |
| 4 | Domain and range | The domain is the inputs a function will take, the range is the outputs it gives (Khan, HELM, notes 4.2). On a graph, the domain is its spread along the x-axis and the range its spread up the y-axis (OpenStax, notes 4.2). Two inputs are refused: dividing by zero and the square root of a negative (OpenStax, notes 4.2). 1/x has "No value" at 0 (Bitesize, notes 4.2): that input is a pole, and the axis the curve hugs is an asymptote (SQA H7K0 33, notes 3.1). The range of y = x² is 0 and up. Real limits on the domain: a speed or a pressure that cannot be negative, a 4 to 20 mA signal that runs from 4 to 20 (notes 7.1). Domain first, range second, because the range is harder (notes 6.8). |
| 5 | Shifting a graph | You slid a line with c; now slide any graph. Add to the output and the graph moves up: f(x) + 3 (Bitesize, OpenStax, notes 4.5). The inputs stay put and only the outputs change (OpenStax, notes 4.5). A 4 to 20 mA line is the 0 to 16 mA line lifted by its 4 mA live zero (offset, TI, notes 7.1). Change the input and it moves sideways: f(x − 3) moves 3 to the right, f(x + 3) to the left (Bitesize, notes 4.5; the quoted lines stop before the direction, so it is shown by points and backed by Zazkis et al. and K12 LibreTexts, notes 6.6). Predict, then check a point: the input must be 3 bigger to give the old output (Zazkis et al., notes 6.6). A delayed signal sits to the right (Engineering LibreTexts, SECONDARY, notes 7.8). Outside the bracket moves it up and down, inside moves it sideways (OpenStax, notes 4.5). Two shifts at once. |
| 6 | Stretching and flipping | Multiply the output by 2 and every height doubles: a stretch up and down, 2f(x) (SQA Higher, notes 2.4). Gain on an instrument is that stretch (TI, notes 7.1). A minus flips it in the x-axis, −f(x): (x, y) becomes (x, −y) (Bitesize, notes 4.5). Multiply the input by 2 and the graph squeezes in sideways by half, f(2x) (K12 LibreTexts, SECONDARY, notes 4.5); a minus inside flips it in the y-axis, checked by points (Bitesize names g(−x), but its quoted line covers only the x-axis flip, notes 4.5). Two moves: outside the bracket, the order of operations applies, so −f(x) + 2 flips first, then lifts (Bitesize, notes 6.7). When unsure, work out some coordinates (Bitesize, notes 6.7). Last screen: an AC wave, where peak is a stretch, DC offset a shift and phase a sideways slide, as a look ahead to Trigonometry (notes 4.8, 7.8). |
| 7 | One machine feeding another | The output of one function is the input of the next (Bitesize, OpenStax, notes 4.7). fg(x), also written f(g(x)), means do g first, then f (Bitesize, notes 4.7). The order matters: "add 4 then double" is not "double then add 4" (Bitesize SQA, notes 6.9). The flow meter's chain: pressure difference, then a 4 to 20 mA signal, then a square root, then the flow (ICS Schneider, notes 7.6). Take the root in the transmitter or the controller, "but not both" (Control Engineering, notes 7.6): a chain with two roots gives the wrong flow. The first machine's outputs must be inputs the second will take (OpenStax, notes 4.7). Lesson 5's shifts were chains all along: f(x) + 3 is "f, then add 3", f(x − 3) is "take 3, then f". |
| 8 | Undoing a machine | An inverse function links the output back to the input, "the original function in reverse" (Bitesize, notes 4.6). Undo the steps in reverse order: the inverse of "multiply by 3 and subtract 1" is "add 1 and then divide by 3" (Bitesize, notes 4.6). That is the flow diagram from Solving equations, now with a name. Finding it is rearranging: "change the subject and use inverse processes" (Bitesize, notes 4.6). Celsius to Fahrenheit and back, because "evaluation is easier than solving" (OpenStax, notes 4.6, 7.7). mA back to percent on the 4 to 20 mA scale. Only a one-to-one function has an inverse (HELM, notes 4.6), so squaring needs its inputs kept to 0 and up before √ undoes it: flow and pressure difference (notes 7.6). f⁻¹ is read "f inverse", not a power (HELM, Emory, notes 6.10). f⁻¹(f(x)) = x (HELM, notes 4.7). Last screens: the graph of an inverse is the mirror in y = x (SQA, notes 3.1), and the exponential and logarithm are the next pair. |

## 3. Can it be taught mostly visually, through interaction?
**Yes**, for all eight (RUNBOOK section 0, item 3). Every lesson is a steps lesson of about 12
screens, SHOW then DO, ending on two or three mixed puzzles. The research backs live graphs for
this topic: "dynamic representations support ... reasoning about covariation", and learners "test
their conjectures ... by dragging the input and observing the resulting change in the output"
(PME-NA 2021, notes 6.11). Teachers have leaned on algebra over graphs, which "impedes students'
mental development of functions" (Eisenberg and Dreyfus, notes 6.11). Each lesson has one main
picture you move with your finger, chosen because it shows the cause, not just the answer:
- **Lesson 1, the machine and its trail.** A box with the rule written inside it, as HELM draws it
  ("a box showing the input, the output and the rule", notes 2.5). Drag a number token into the
  box. Each step of the rule lights in turn (× 3, then − 1), the output drops out, and the pair is
  written as a table row and a dot on a graph below. Feed in five inputs and the dots line up into
  the graph. *Why:* it makes the machine, the table and the graph one object, which is the repair
  the research names for the machine picture's weakness (literature review, Thompson, notes 6.2,
  6.11). The machine is first because every source starts there (notes 2.8). A DO screen drops in
  the token "a + 1" instead of a number, for the notation mistake (notes 6.1). A second machine has
  no rule written in it, only a table of readings, so "has a formula" is never the definition
  (notes 6.2).
- **Lesson 2, the input pointer.** A graph with labelled axes and units. Drag a pointer along the
  x-axis. A beam rises from it to the graph and turns across to the y-axis, where the output is
  read. On a circle the beam hits twice and both readings show. On a graph with a gap the beam
  still finds one reading on either side. A second pointer on the y-axis sends a beam across to
  find the inputs for a given output. *Why:* the pointer asks the real question, "what does this
  input give?", before any test is named, which is the order the research wants (Ayeh, notes 6.4).
  The axes always name two quantities with units, so the graph is read as one against the other,
  never as a picture of a path (notes 6.5).
- **Lesson 3, the family gallery.** Five tabs, one per family, with the law for each written under
  it. Drag x along the axis and the point rides the curve, with its x and y read out and a small
  table filling in. Then drag a level line up and down: on the square it cuts twice and two inputs
  light up, on the cube once. On 1/x the point runs off towards the axis near 0; on √x it stops at
  0. *Why:* a "repertoire of basic functions" is what Eisenberg and Dreyfus asked for, and experts
  sort graphs by family and feature (Kop et al., notes 4.3, 6.11). The level line is HELM's own test
  for one-to-one (notes 4.3). Having the cube, reciprocal and root on screen beside the line and
  parabola answers "only lines and parabolas are functions" (notes 6.3).
- **Lesson 4, shadows on the axes.** A graph casts a thick shadow down onto the x-axis (its domain)
  and across onto the y-axis (its range), drawn as bands. Drag the ends of a graph, or switch
  family, and the shadows change. Drag an input towards 0 on 1/x and the machine refuses it, "no
  value"; drag it below 0 on √x and the same. *Why:* OpenStax defines the two exactly this way, the
  inputs "shown on the x-axis" and the outputs "shown on the y-axis" (notes 4.2). The shadow makes
  the range a thing you can see, which matters because it is the harder of the two (notes 6.8). A DO
  screen puts a turning point on the y-axis, where learners reach for that point's y-value when
  asked for the domain (notes 6.8).
- **Lesson 5, drag the graph.** A graph you grab and slide anywhere, with its starting place left
  as a faint copy. The rule above rewrites as you drag: f(x) + 2, f(x − 3). One marked point shows
  its old and new coordinates side by side, and a three-row table shows the inputs that now give
  the old outputs. Before any sideways slide, a DO screen asks you to predict left or right. *Why:*
  the sideways direction is the one stable obstacle in this course, and Zazkis et al. resolve it by
  predicting, then checking with points and a graph, setting function moves "in the context of
  transformations" of points (notes 6.6). Some teachers found working out points "more convincing"
  than the graph alone (notes 6.6), so the table is always on screen. Up and down shifts come
  first because they behave as expected (notes 6.6).
- **Lesson 6, pull the graph.** A curve with a handle above it and a handle at its side. Pull the
  top handle up and every height grows by the same factor; arrows from the x-axis to four marked
  points all lengthen together, and the rule reads 2f(x). Pull it through the axis and it flips to
  −f(x). Pull the side handle in and the curve squeezes towards the y-axis, f(2x). A switch shows
  the 4 to 20 mA line, where the top handle is gain and lesson 5's slide is offset. *Why:* the
  arrows show the cause, every output multiplied by one number (OpenStax's "outside" change, notes
  4.5). Gain and offset are the moves an electrician already calibrates (TI, notes 7.1).
- **Lesson 7, two machines in a chain.** Two boxes in a row, with the middle value shown on the
  join. Drag an input in and watch it pass through both. A switch swaps the boxes, and the output
  changes. The worked chain is the flow meter: pressure difference into the transmitter, mA into
  the square root, flow out. A third box adds a second square root, and the reading goes wrong.
  *Why:* the definition is "the output from one function is used as the input for another"
  (Bitesize, notes 4.7), and the swap switch shows that order matters without algebra (notes 6.9).
  The flow chain is the research's strongest trade example (notes 7.6).
- **Lesson 8, the machine and its mirror.** A machine on the left and its undoing machine on the
  right, each showing its steps. Drag an input through the first. Its output passes into the second,
  whose steps run backwards in reverse order, and the starting number comes out. On the square
  machine, two inputs (3 and −3) give 9, the undoing machine can hand back only one, and a lock
  keeps the inputs at 0 and up. *Why:* the AMS blog found graphs of f and f⁻¹ on one set of axes
  "created confusion", and the research suggests a pair of machines instead (notes 6.10). Undoing
  in reverse order is Bitesize's rule ("BIDMAS in reverse", notes 4.6), and the lock shows why only
  one-to-one functions have an inverse (HELM, notes 4.6).

## 4. What else
- **Benchmark (notes 1 and 2).** The shelf's benchmark is two Brilliant courses (notes 1).
  - **Brilliant Introduction to Functions** (68 lessons, 14 levels). It runs finding the rule,
    graphing (linear, squared, absolute value), non-functions and the vertical line test, then
    real-world, piecewise and floor and ceiling, then domain and range on the reciprocal, square and
    square root, then operations, composition, shifts and stretches, reflections and the inverse
    (notes 1.1). Lessons 1 to 8 here cover its levels 1 to 4, 8 and 9, and 11 to 14.
  - **Brilliant Coordinate Transformations** (60 lessons). It is mostly geometry: moving points and
    shapes (notes 1.2). Its one idea used here is that a transformation moves every point, which is
    lesson 5's marked point and table.
  - **Khan** runs evaluate, domain and range, recognise a function, then the inverse of a linear
    function; its Algebra 2 unit runs shift, reflect, scale (notes 2.1, 2.2).
  - **Bitesize** has machine, notation, inverse and composite in one GCSE article, and
    transformations in another, without stretches (notes 2.3). SQA Higher has the full list,
    stretches included (notes 2.4).
  - **HELM** (Loughborough) is the engineering order: concept, graphs and domain and range,
    one-to-one and inverse, then a catalogue of common functions (notes 2.5).
  - **Bird's Engineering Mathematics** gives one chapter, "Functions and their curves", inside its
    Graphs section (notes 2.6). Its section titles are UNCONFIRMED (notes 2.6, 9).

  What they lack that you need: Brilliant and Khan have no engineering laws, and Brilliant spends
  its length on piecewise and shape topics you do not need. HELM has the laws but only exercises on
  transformations (notes 2.5). This course takes the common order (notes 2.8), drops the levels
  with no marine line (notes 8.1), and ties every family to a law you will use.
- **His aim (notes 3).** Honestly: no college syllabus I could read names "shifting a graph" (notes
  3). What the colleges do name:
  - **SQA HN Engineering Mathematics 1 (H7K0 33, SCQF 6),** "mandatory in a number of Higher National
    Certificates in Engineering". Outcome 1: "Properties of functions, Inverse functions, Composite
    Functions". Evidence: "Identify the domain, range and asymptotes of a given function", one
    inverse-function problem and one composite-function problem (notes 3.1). Its guidance adds
    poles and graphing a function with its inverse. Its entry wish is "an ability to transpose
    engineering formulae", the inverse idea again (notes 3.1).
  - **Pearson BTEC HN Unit 4002** names the kinds of function (exponential, logarithmic,
    trigonometric, hyperbolic) and "rates of change for a range of mathematical functions" (notes
    3.2). Whether it teaches domain, range, composites, inverses or transformations is UNCONFIRMED
    (notes 3.2, 9).
  - **MCA Second Engineer Mathematics:** "Defines the dependent and independent variables", plots
    "linear and non-linear graphs", inverse variation, and "Writes derivatives in terms of
    functional notation" (notes 3.3). An MCA syllabus called "Applied Mathematics" was not found
    (UNCONFIRMED, notes 9).
  - **MCA General Engineering Science I:** plot readings and "join the points with an appropriate
    curve", and graphs of force against distance and torque against angle (notes 3.4).
  - **Warsash** expects calculated answers in applied heat, electrics and mechanics (notes 3.5), so
    every graph carries a quantity and its unit.
  - Transformations are justified by SQA Higher, Khan and Brilliant (notes 2.2, 2.4), by being
    needed for the sine wave in Trigonometry (notes 4.8), and by offset and gain on instruments
    (notes 7.1). Lessons 5 and 6 say so plainly and make no claim that your college examines them.
- **Where it is used (each cited before a lesson uses it).**
  - **The machine (1):** SQA's "rule which relates each element in one set to one and only one
    element in another set" (notes 3.1). MCA dependent and independent variables, and functional
    notation for derivatives (notes 3.3). 4 to 20 mA scaling "with the linear equation: y=mx+b"
    (control.com, notes 7.1).
  - **Reading a graph (2):** MCA GES I, readings joined "with an appropriate curve", and force
    against distance and torque against angle graphs (notes 3.4). MCA "Plots linear and non-linear
    graphs" (notes 3.3).
  - **The families (3):** the square, P = I²R, "depends upon the square of the current"
    (HyperPhysics, notes 7.3). The cube, "ship engine load is proportional to the cube of the
    rotational speed of the propeller" (SSRN, notes 7.4), and fans at 50% speed using 12.5% of the
    power (ScienceDirect, notes 7.4). The reciprocal, "current is cut in half if resistance doubles"
    (LibreTexts, SECONDARY, notes 7.5), and Boyle's p against V, "we obtain a hyperbola" (OpenStax,
    notes 7.5). The root, "the system must scale flow from the square root of the DP" (Control
    Engineering, notes 7.6). MCA inverse variation and y = aX² + b (notes 3.3).
  - **Domain and range (4):** SQA H7K0 33, "domain, range and asymptotes" and poles (notes 3.1).
    The 4 to 20 mA signal as "a 0 to 100 percent scale" (control.com, notes 7.1).
  - **Shifting (5):** "offset and gain calibration" in an RTD transmitter (TI, notes 7.1). A DC level
    "shifts the wave up vertically", and a delayed wave is shifted right (Engineering LibreTexts,
    SECONDARY, notes 7.8). SQA Higher f(x) + k and f(x + k) (notes 2.4).
  - **Stretching and flipping (6):** gain (TI, notes 7.1). SQA Higher k f(x) and f(kx) (notes
    2.4). The AC wave's peak, offset and phase as a preview (notes 7.8).
  - **The chain (7):** "differential pressure → linear 4...20 mA signal → square root extraction in
    PLC → flow" (ICS Schneider, notes 7.6), and "but not both" (Control Engineering, notes 7.6).
    SQA H7K0 33, "Solve one problem involving a composite function" (notes 3.1).
  - **The inverse (8):** SQA H7K0 33, "Solve one problem involving an inverse function" and
    "transpose engineering formulae" (notes 3.1). Celsius and Fahrenheit (OpenStax, notes 7.7). The
    square-root extraction formula and its reverse on the 4 to 20 mA scale (controlandinstrumentation,
    notes 7.6). An Australian marine engineering unit, MARL009, asks for formulae "manipulated to
    change subjects" (notes 7.7); it is not an MCA line and is not presented as one.
- **The mistakes to catch, each with a puzzle and its own hint.**
  - **Lesson 1, f(x) as "f times x":** "The notation f(x) does not mean f multiplied by x" (Lumen,
    SECONDARY, notes 6.1). "Students have difficulties in understanding the meaning of the
    mathematical notation" (literature review, MDPI, notes 6.1). Ayeh's interviews found "the
    confusion between function notation and variable inputs" (ERIC, notes 6.1). A DO screen asks for
    f(a + 1).
  - **Lesson 1, "a function is a formula":** the function box "can lead to the misconception that
    all functions can be expressed with a formula" (ERIC EJ1327591, notes 6.2). A DO screen gives a
    table of readings and asks whether it is a function.
  - **Lesson 1, a constant is not a function:** "constant functions ... are not really functions"
    to students, and "f(x) = 8" is "seen as not a function but a location on a graph" (MDPI, Ayeh,
    notes 6.3). A DO screen offers the machine that always gives 3.
  - **Lesson 2, graph as picture:** students read a graph "like a photo of a physical situation"
    (MDPI, notes 6.5), "a picture or map of the physical situation" (arXiv 2025, notes 6.5). A DO
    screen shows a tank's level against time and offers the tank's shape as a wrong answer.
  - **Lesson 2, the vertical line as a recipe:** "the overreliance on the vertical line test" (Ayeh,
    notes 6.4). A DO screen gives a many-to-one curve that passes, and HELM's "it is still a
    function" (notes 6.4).
  - **Lesson 2, a graph with a gap is not a function:** "Discontinuous functions are also especially
    problematic" (MDPI, notes 6.3), and some students say a function's graph "must be continuous"
    (Vinner and Dreyfus, via EJ1327591, notes 6.3).
  - **Lesson 3, only lines and parabolas:** "only graphs that represent straight lines or parabolas
    correspond to a function's representation" (MDPI, notes 6.3). The gallery's DO screens use the
    cube, reciprocal and root.
  - **Lesson 4, the range is harder, and the y-axis trap:** "determining the range was more
    difficult than determining the domain", and with a turning point on the y-axis, "students often
    focused on the y-coordinate values of the point" (ERIC ED599786, notes 6.8).
  - **Lesson 5, the sideways shift the wrong way:** "Most people conjecture that graph (b) will
    appear three units to the left" for (x − 3)² (Zazkis et al., notes 6.6), and "A common
    misconception is to shift right because the three is positive" for (x + 3) (K12 LibreTexts,
    SECONDARY, notes 6.6). A horizontal shift is harder to see than a vertical one (Eisenberg and
    Dreyfus as reported, notes 6.6). Two DO screens, one each way, each predicted before the drag.
  - **Lesson 6, the order of two moves:** "When a function has more than one transformation, the
    order matters" (Bitesize, notes 6.7). Inside the bracket the order reads backwards (K12
    LibreTexts, SECONDARY, notes 6.7). A DO screen compares −f(x) + 2 with −(f(x) + 2).
  - **Lesson 7, the order of a chain:** "the order is important" (Bitesize SQA, notes 6.9). AQA's
    June 2023 A-level report says the most common error on one composite question was "to give the
    composite function fg(x)" (notes 6.9); that this was the order swapped is my inference and is
    UNCONFIRMED, so the lesson cites only Bitesize for the mistake. A DO screen gives fg(2) and
    gf(2) as the two choices.
  - **Lesson 8, f⁻¹ as a power:** "A common source of confusion for students stems from how similar
    this notation looks to exponentiation" (Emory, notes 6.10), and HELM's "Do not confuse the ‘−1’
    with an index" (notes 6.10). A DO screen offers 1 ÷ f(x) as a wrong answer.
  - **Lesson 8, the inverse is hard:** "The concept of an inverse function appears to be harder than
    most people realize" (Cooper, Penn, notes 6.10). That is a teacher's statement, not a counted
    mistake, and is why the lesson uses the paired machines.
  - **Not stated as common:** no source counts these, so they are taught as checks (run a number
    through, work out a point), not as cited mistakes.
    - Undoing the steps in the same order instead of reverse order (Bitesize and a wiki page state
      the rule, notes 4.6, but count no error).
    - Taking f(2x) as a stretch by 2 instead of a squeeze.
    - Giving a square an inverse without keeping its inputs to 0 and up.
- **Size and cost.** 8 lessons of about 12 screens on the agreed settings.
  - The last six measured courses ran about 0.99M to 1.14M tokens a lesson
    (docs/plans/foundational-maths-roadmap.md). Every picture here is a live graph or a pair of
    machines with a graph, closer to Calculus fundamentals than to tiles, so I estimate about 1.1M
    to 1.25M a lesson.
  - That is about 8.8M to 10M for the course, plus about 0.3M for the plan and research. The
    research can start from the 57 saved tool results.
  - The full process measured on Fractions lessons 4 to 8 was about 1.65M a lesson, about 13.2M for
    eight.
  - Each build's real cost is reported to you.
- **Lesson 1 first.** Lesson 1 is built and checked before the others (about 1.15M, plus the plan
  and research). Because you asked for the folder in one push, the rest follow without waiting for
  you to try it.
- **Gaps to close at build time.** None blocks the build.
  - Brilliant's lesson pictures were not seen, only its lesson titles (notes 1, 9).
  - **Lesson 2:** the circle's equation x² + y² = r² is not quoted in the notes. The research stage
    must cite it (HELM 2.6 or Bitesize's circle graphs, notes 2.3, 2.5) before the lesson shows it.
  - **Lesson 3:** the cube's marine law is a model. The SSRN abstract says it "breaks down" at
    partial load (notes 7.4), and the screen says so. The marine engineers' blog line is SECONDARY
    and is not the citation.
  - **Lesson 4:** "asymptote" and "pole" are named by SQA's guidance (notes 3.1) but defined there
    only as terms to teach. The research stage should cite a plain definition of each (HELM or
    OpenStax) before the lesson states one.
  - **Lesson 8:** the Celsius and Fahrenheit rule itself (F = 1.8C + 32) is not quoted in the notes,
    only OpenStax's use of the pair (notes 7.7). The research stage must cite the rule, or the
    lesson uses the 4 to 20 mA scale, which is cited, as its main inverse.
  - **Lessons 5 and 6:** Bitesize's quoted lines for f(x + n) and f(x − n) stop at "to the", and its
    reflection line covers only −g(x) (notes 4.5). The direction of a sideways shift and the flip
    g(−x) are shown by working out points from the rule on screen, and the research stage should
    fetch Bitesize's full wording (or OpenStax 3.5) so the fact-check has a complete line.
  - Pearson Unit 4002's content, Bird's section titles, HELM's page count and the AQA question are
    UNCONFIRMED (notes 9). Nothing in the lessons rests on them.
