# The coordinate plane: the course brief

Written 12 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. Dan
asked me to finish the last two courses, so this brief takes the research's suggested core and my
answers to its questions (below). Sources and quotes are in `research-notes.md` beside this file
(118 quotes, every one checked against the saved search results; section numbers point there).

## The short version
**Six lessons**
1. Along, then up
2. All four quadrants
3. Scales
4. From a table to a graph
5. Reading a graph
6. Straight lines through zero

**The main picture:** a grid with points you drag, each with a live (x, y) readout. A cursor
you slide along an axis reads values off a line or curve.

**Decisions taken for you** (say if you want any changed)
- **Six lessons.**
- **Steepness gets a first, informal look in lesson 6.** It is kept to one picture: on a V-I
  graph with voltage up the side, a steeper line means more resistance. RMIT calls R "the slope of
  the V-I graph" (notes 2.4). Gradient as a number waits for Linear relationships.
- **V-I axes are taught as varying.** Bitesize's GCSE page puts voltage on the y-axis, while another
  Bitesize guide and OpenStax put current on the vertical axis (notes 2.4). The course uses voltage
  up the side, shows the swap once, and says to read the axis labels every time.
- **Fuse time-current curves wait.** They are drawn on a logarithmic plot (Littelfuse, notes 2.6),
  so they come in once logarithms are taught. Lesson 5 reads a pump curve instead.
- **Curves are drawn from labelled example numbers.** No maker's chart is copied.

## 1. The overall topic
Points on a grid named by two numbers, then graphs: plotting a table, reading values back off a
line or curve, and the straight line through zero that means two things are in proportion. That
straight line is the picture of what Proportional reasoning taught with tables.

**It builds on:**
- Negative numbers: the four quadrants.
- Proportional reasoning: direct proportion, which it left to this course as a graph.
- Solving equations: V = IR as the rule behind the line.

**Left for later:**
- Diagonal distance and Pythagoras (Geometry fundamentals).
- Gradient as a number, and y = mx + c (Linear relationships, Coordinate geometry).
- Inequality regions (dropped, as the roadmap proposed).
- Logarithmic scales.

## 2. The lessons, in the order they build
| # | Lesson | The skill Dan leaves with |
|---|---|---|
| 1 | Along, then up | Read and plot points with positive coordinates, x before y. Bitesize's "you go along the hallway before you go up the stairs" (notes 3.1). |
| 2 | All four quadrants | Negative coordinates. The signs of (x, y) give the quadrant, and a zero puts a point on an axis. The lines x = 3 and y = −2. The distance along a gridline found by subtracting. |
| 3 | Scales | Read an axis where a square is not 1, and a value between two marks. Choose a scale (each large square 1, 2 or 5 times a power of ten), with equal steps. Know when the axis should start at zero. |
| 4 | From a table to a graph | Plot a table of values. Fit a best straight line or a smooth curve through measured points, rather than joining them dot to dot. SQA's "best-fit straight line graph from supplied experimental data". |
| 5 | Reading a graph | Read a value in both directions, across then down and up then across. Use a pump's head-flow curve, where low flow gives high head. Know reading inside the data (interpolation) from reading beyond it (extrapolation). |
| 6 | Straight lines through zero | Proportion as a straight line through (0, 0). A resistor's V-I graph from V = IR. A line that bends or misses zero means not proportional. Steepness informally: a steeper line, more ohms. |

**Folded in:** horizontal and vertical lines and gridline distance go into lesson 2.

## 3. Can it be taught mostly visually, through interaction?
Yes, throughout.
- **A grid with draggable points:** drag a point and watch (x, y) change. Its signs flip as it
  crosses an axis, and the quadrant is named.
- **A scale you set:** pick 1, 2, 5 or 10 a square and watch the same data fit, squash or
  overflow. An uneven axis visibly bends a straight line, which shows that mistake.
- **A reading cursor:** slide a marker along one axis, and a dashed line runs to the curve and
  across to the other axis with the value.
- **Points and a line:** plot measured points, then lay a best-fit line through them. Joining dot
  to dot is shown as the zigzag it makes.
- **Colour as before:** ink for points and lines, red only for a slip (a swapped point, a broken
  scale), and teal for the axis labels.

## 4. What else
- **Benchmark (notes 1).** Brilliant's Coordinate Plane has 30 lessons in five levels: points,
  four quadrants, lines (horizontal and vertical), inequalities, then gridline distance ending in
  Pythagoras. Khan, Bitesize, Oak, NCETM and AQA all build in the same order and leave gradient
  until later.
- **His aim (notes 2.1 to 2.3).**
  - SQA's unit asks him to "Interpret graphical information and construct appropriate graphs from
    given numerical data".
  - MCA General Engineering Science I asks him to "Plot ordered pairs on graph paper, either given
    or calculated and join the points with an appropriate curve". It also asks for the intercept
    and gradient of a straight line, which come in a later course.
- **Where it is used (each cited before a lesson uses it).**
  - The V-I graph of a resistor: a straight line through the origin, so current and voltage are
    proportional (Bitesize, OpenStax, RMIT).
  - A pump's head-flow (QH) curve: low flow, high head (Grundfos). It is read by "choosing a flow
    rate ... on the horizontal axis, proceeding vertically to the pump curve" (LSU AgCenter).
- **The mistakes to catch, each with a puzzle and its own hint.**
  - **Lesson 1, axes swapped:** Oak says pupils "might confuse the x-axis and y-axis, leading them
    to count along the wrong axis" (notes 3.1). This is the main slip, with (−3, 1) set against
    (1, −3).
  - **Lesson 2, signs:** signs misused, and points put on the wrong axis or in the wrong quadrant
    (notes 3.2). A zero means "do not move along that axis".
  - **Lesson 3, scales:** taking every square as 1; scales "unevenly spaced" or not starting at 0;
    and "Pupils find it hard to choose appropriate scales" (notes 3.3).
  - **Lesson 4, joining the dots:** "Never connect even linearized data point-to-point with straight
    lines" (notes 3.5).
  - **Lesson 5, reading past the data:** extrapolating beyond the data as if it were measured (notes 2.8).
  - **Not stated as named mistakes (UNCONFIRMED):** counting gridlines instead of spaces, and taking
    the origin as (1, 1). They can appear as puzzles, but never as "a common mistake".
- **Sources to treat with care.** The scale advice comes from a guide hosted by the Royal
  Geographical Society. The build's research should prefer an original publisher for it where
  one is in the saved results.
- **Size and cost.** 6 lessons of about 12 screens on the agreed settings, at about 1M tokens a lesson,
  so about 6M. Add about 0.3M for the plan and research, which start from this brief's 27 saved
  search results.
