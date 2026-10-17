# Straight-line graphs: the course brief

Written 17 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
the second course in the Maths shelf's Algebra folder, "y = mx + c: slope and intercepts, the
distance between points, and fitting a line to data." You asked for the whole Algebra folder in one
push (17 Oct), so I have taken the decisions for you and listed them below; change any you like.
Sources and quotes are in `research-notes.md` beside this file (143 quotes, every one checked
against the 39 saved search results; section numbers below point there).

## The short version
**Six lessons**
1. Gradient from two points (built first)
2. Distance and midpoint
3. y = mx + c
4. Finding the equation of a line
5. Laws from readings
6. Fitting a line to readings

**The main pictures** (one per lesson, each moved with your finger):
- **Two points and a step triangle (lesson 1).** Drag either point. The run and the rise are drawn
  as arrows with their signed sizes, and the gradient sum fills in with the coordinates. Stand
  one point straight above the other and the run becomes 0, so the gradient is undefined.
- **The same triangle, read two more ways (lesson 2).** The slope of the triangle becomes its
  long side, √(run² + rise²), and a midpoint marker sits halfway across and halfway up.
- **An m handle and a c handle (lesson 3).** Slide the crossing point up the y-axis and turn the
  line. The equation rewrites itself, and a test point checks whether a point fits the rule.
- **A pin and a turn (lesson 4).** Pin the line to one point and it can swing to any gradient.
  Set the gradient, or pin a second point, and only one line is left.
- **A measuring triangle on readings (lesson 5).** Readings with real units on both axes. Drag
  and stretch a step triangle along the line, and its rise and run are read in those units.
- **Lay the line (lesson 6).** Scattered readings, and a line you lay with two handles. Each
  reading shows a thin stick to the line, with a count of how many sit above and below it.

**Decisions taken for you** (say if you want any changed):
- **Six lessons.** Brilliant spends 56 lessons on Linear Relationships and 44 on Coordinate Geometry
  (notes 1.1, 1.2, 8). HELM covers the engineering line in 11 pages and Bird in a 20-page chapter
  (notes 8). You already have a lot of this ground, so six lessons is enough. A seventh "putting
  it together" lesson (notes 8) is left out. Each lesson ends on mixed puzzles anyway, and spaced
  review mixes the skills, which beat blocked practice in Rohrer's trial (notes 6.5).
- **Lesson 1 is built first, without a pause.** The runbook asks for a pilot you try before the
  rest. You asked for the folder in one push, so lesson 1 is built and checked first, and the
  others follow without waiting. You can try it on your phone as soon as it lands.
- **Steps lessons throughout ("Yes", RUNBOOK section 0, item 3).** About 12 screens each, SHOW then
  DO, with short sentences. Lessons 5 and 6 carry units in the picture's labels, not in extra words.
- **Gradient as a rate first, steepness second.** Students understood slope better "as a measure
  of rate of change than as a measure of steepness" (Stump 2001, notes 6.1). So the gradient is
  first "how much y changes for each 1 along", in units, and "how steep" comes after.
- **Not taught again.** Δy ÷ Δx between two points, with units and a falling graph's minus sign
  (Calculus fundamentals lesson 1). The equations of horizontal and vertical lines, x = 3 and
  y = −2 (The coordinate plane lesson 2). The distance between two grid points by Pythagoras
  (Geometry fundamentals lesson 5). A best-fit line by eye instead of dot to dot (The coordinate
  plane lesson 4). Interpolation and extrapolation (The coordinate plane lesson 5). Each is used
  with a one-line reminder, and only what is new is taught.
- **Distance and midpoint come second, not fourth.** The research suggests them fourth (notes 8).
  But they use the same two-point triangle as lesson 1, so lesson 2 reads it two more ways. Then
  lessons 3 to 6 run without a break from the rule of a line to laws from readings. Bitesize puts
  midpoint and length before gradient (notes 2.3), and HELM puts distance after (notes 2.5), so
  there is no single standard order.
- **m and c, with a and b shown too.** The course writes y = mx + c, as Bitesize and Pearson's
  Level 3 do (notes 2.3, 3.4). The MCA syllabus writes "y = ax + b, and defines a and b" (notes
  3.1) and HELM writes f(x) = ax + b (notes 2.5), so one screen in lesson 3 shows that they are
  the same rule with different letters.
- **One main route to the equation, with the other shown once.** Lesson 4 finds c by putting a
  known point into y = mx + c (Bitesize CCEA, HELM, notes 4.4). That uses only Linear equations.
  The Scottish form y − b = m(x − a) (National 5, notes 2.4, 4.4) is shown once as the same line
  written with a bracket, in case your college uses it.
- **Parallel lines are in, perpendicular lines are out.** Parallel lines are in every benchmark,
  and Edexcel's examiners found that "some students did not know that parallel lines have the same
  gradient" (notes 4.5, 6.3). Lesson 3's picture shows them (slide c and the line stays parallel)
  and lesson 4 uses them. Perpendicular lines are in Brilliant and SQA Higher, but not in the MCA
  maths lines, the HELM outcomes or Pearson 4002 (notes 4.5). So they are left out. If you need
  them, they sit best in Trigonometry, beside the angle of a line, m = tan θ, which SQA's Higher
  unit pairs with them (notes 2.4).
- **ax + by = c is a rearranging job, not a lesson.** Brilliant gives standard form a level and
  Khan a lesson (notes 1.1, 2.2). Here, one DO screen in lesson 3 rearranges 2y = 3x − 8 into
  y = mx + c with Linear equations' moves (notes 5).
- **The fitted line is by eye, not least squares.** The eye fit is the school and Bird method
  (SERC, Bird, notes 4.7). Least squares and regression are the HN follow-up (Pearson's 2010
  Analytical Methods unit, Modern Engineering Mathematics 2.3.2, notes 3.4, 4.7). The last screen
  of lesson 6 names it and says it comes at college.
- **Example numbers are labelled.** Readings in the puzzles are example figures, said so on screen,
  or computed from a rule the screen shows. Real constants are cited. Copper's temperature
  coefficient is 0.004041 per °C in All About Circuits' table, which the notes take at 20 °C (notes 7.2). Linear
  equations used 3.9 × 10⁻³ per °C from OpenStax, so the lesson names the source and its reference
  temperature each time. The −234.5 °C where copper's line meets the temperature axis is from a
  lecture PDF, so it is SECONDARY (notes 7.2) and is labelled that way.
- **Negative gradients are ink, not red.** Red is kept for mistakes, so a falling line is ink like
  any other, and its minus sign is part of the readout.
- **Your intake answers** (`intake.json`): to understand straight-line graphs and how to work with
  them; on the job and in everyday life; hands-on, with the why explained in full.

## 1. The overall topic
A straight line on a graph has a rule, and the rule has two numbers in it. The **gradient**, m, is
how much y changes for each 1 along x. The **intercept**, c, is the value of y where x is 0. This
course teaches how to read both off any line, write the rule from two points or from a point and a
gradient, and find the distance and midpoint between two points. It ends where engineers use it:
plotting meter readings and finding the law behind them, with the gradient and intercept as real
quantities with units. A resistor's gradient is in ohms, a spring's in newtons per millimetre, and
a copper winding's in ohms per degree.

**It builds on:**
- **The coordinate plane:** points in four quadrants, scales, reading graphs, best-fit lines by
  eye, and straight lines through zero. Lesson 6 there already had lines that miss zero, such as a
  £40 call-out plus £30 an hour. Lesson 3 here writes that bill as y = 30x + 40.
- **Calculus fundamentals:** Δy ÷ Δx as a rate with units (lesson 1), and the fact that a straight
  line's slope is the same everywhere (lesson 3). Lesson 1 here gives that rate its name, m.
- **Geometry fundamentals:** Pythagoras, and the distance between two grid points (lesson 5).
- **Linear equations:** rearranging, brackets, and solving for one letter. These are used to find
  c, to tidy 2y = 3x − 8, and to read a law backwards.
- **Negative numbers and Fractions:** signs in x₂ − x₁, and gradients like −2/5.
- **Proportional reasoning:** y = kx, which is the line through zero, where c is 0.

**Edges.** Straight lines only. The course stops where a law is curved. Changing a curved law into
a straight line with logs, such as plotting log y against log x, belongs to **Exponentials and
logarithms** (Pearson A level, SQA, Bird's chapter 18, notes 4.8). Lesson 6 ends by saying so.

**Left for later courses:**
- **Linear systems:** where two lines cross, and solving two equations by graph (Brilliant's Linear
  Systems level 2, notes 1.3). Parallel lines that never cross are where that course starts on "no
  solution".
- **Powers and roots:** plotting y against x² so that y = aX² + b becomes a straight line (MCA 4.10,
  notes 3.1, 4.8).
- **Functions and their graphs:** f(x) = ax + b as one function among many (HELM, notes 2.5), and
  circles on the coordinate plane (Brilliant's Coordinate Geometry levels 8 to 10, notes 1.2).
- **Quadratics and polynomials:** curved graphs.
- **Exponentials and logarithms:** reducing y = axⁿ and y = abˣ to straight lines, and pVⁿ = C
  with n unknown (MCA 4.11, notes 3.1, 4.8).
- **Trigonometry:** the angle a line makes, m = tan θ, and perpendicular lines if wanted (notes 2.4).
- **Complex numbers:** nothing here leads into it.
- **Dropped, not deferred:** graphs of inequality regions (Brilliant level 10, Khan, notes 1.1, 2.1).
  The coordinate plane dropped them, and you have inequalities on a number line from Linear equations.

## 2. The lessons, in the order they build
The core follows the research's suggested six (notes 8), with distance moved up to sit beside the
gradient. Khan and Bitesize both teach gradient and intercepts before writing equations, and
equations before context (notes 2.1 to 2.3). Bird and the MCA end on laws from readings (notes 2.6,
3.1), so this course does too.

| # | Lesson | What it teaches |
|---|---|---|
| 1 | Gradient from two points | The gradient m is the change in y divided by the change in x, between any two points on the line (Bitesize CCEA, HELM, notes 4.1). It is the same wherever you take the two points. Write the formula down first, as Edexcel's examiners advise (notes 6.3), and put brackets round a negative coordinate (Cambridge, notes 6.3). Take both differences in the same order. Bottom left to top right is positive, top left to bottom right is negative (Bitesize, notes 4.2). Horizontal lines have gradient 0. Vertical lines have an undefined gradient, because the run is 0 (HELM, Bitesize N5, notes 4.2). m with units, "y unit per x unit", and m as the rise for a run of 1 (Brilliant's "Change per One", notes 1.1). |
| 2 | Distance and midpoint | The two points' triangle again. Its long side is the distance, √((x₂ − x₁)² + (y₂ − y₁)²), which is Geometry lesson 5's Pythagoras written in coordinates (HELM, Bitesize CCEA, notes 4.6). Here, unlike the gradient, the order does not matter, because squaring removes the sign. The midpoint is the average of the two x's and the average of the two y's (Bitesize CCEA, notes 4.6). Work back from a midpoint and one end to the other end. |
| 3 | y = mx + c | The equation is a rule that holds for every point on the line (Bitesize, notes 4.3). m is the number in front of x, and c is where the line crosses the y-axis, the value of y at x = 0 (Bitesize, HELM, notes 4.3). Test a point by putting it in. Draw a line from its rule: start at c and step m up for each 1 along. Two points are enough to plot a line (MCA 4.7, notes 3.1). Rearrange 2y = 3x − 8 first, and read y = 3 − 2x as m = −2. Find the x-intercept by setting y = 0, and keep it apart from c. The same rule in the MCA's letters, y = ax + b (notes 3.1). Slide c and the line moves parallel. Celsius to Fahrenheit as a line with a gradient and an intercept (Pearson A level, notes 7.4). |
| 4 | Finding the equation of a line | From a point and a gradient: put m into y = mx + c, then the point, and solve for c (Bitesize CCEA, notes 4.4). From two points: gradient first, then c (HELM, notes 4.4). The same line written y − b = m(x − a) (SQA National 5, notes 2.4, 4.4). From a graph: read c and m off it, the harder direction (Markovits, notes 6.1). A line parallel to a given one through a given point: same m, new c (Bitesize, Edexcel, notes 4.5, 6.3). Check by putting the second point back in, and sketch first (Cambridge, notes 6.3). |
| 5 | Laws from readings | A straight-line law, y = ax + b, from readings that lie on a line, with a and b defined (MCA 4.9, notes 3.1). Read the gradient and intercept with their units and say what they mean. Ohm's law, where the V-I gradient is the resistance (OpenStax, NCERT, notes 7.1). A copper winding's resistance against temperature, R = R₀ + R₀αT, where the intercept R₀ is in ohms and the gradient in ohms per °C (All About Circuits, notes 7.2, MCA electro-technology 1.7, notes 3.2). Load against extension, where the gradient is the spring constant (Bitesize, notes 7.3). Effort against load for a lifting machine, P = aW + b (Bird, notes 4.7, MCA 10.14, notes 3.2). Use the law both ways, as Bird asks for "the speed at a voltage of 132 V" (notes 4.7). Swap the axes and the gradient's unit flips too. |
| 6 | Fitting a line to readings | Real readings scatter. Lay one line through the middle, with about as many readings above as below (SERC, notes 4.7). It need not pass through any reading. Find its gradient from two points on the line far apart, not from two readings. Write the law "in the form P = aW + b" (Bird, notes 4.7). Do not force it through zero unless the physics says so (Casey, notes 6.4). Fit only the straight part. A spring stops being straight past the limit of proportionality (Bitesize, MCA 11.6, notes 7.3, 3.2), and a lamp's V-I graph bends (OpenStax, notes 7.1). Extending copper's line back to −234.5 °C is a prediction, not a reading (lecture PDF, SECONDARY, notes 7.2). Last screen: laws that curve become straight lines with logs, in Exponentials and logarithms (notes 4.8). Least squares comes at college (notes 4.7). |

## 3. Can it be taught mostly visually, through interaction?
**Yes**, for all six (RUNBOOK section 0, item 3). Every lesson is a steps lesson of about 12
screens, SHOW then DO, ending on two or three mixed puzzles. Each lesson has one main picture you
move with your finger, chosen because it shows the cause, not just the answer:
- **Lesson 1, two points and a step triangle.** Two draggable points on a grid, the line through
  them, and the run and rise drawn as arrows labelled with their signed sizes. The readout writes
  the formula with the coordinates in brackets, (y₂ − y₁) ÷ (x₂ − x₁), as the examiners advise
  (notes 6.3). *Why this picture:* the cause of the gradient is visible. The arrows' directions
  give the sign, which is where students lose marks (Edexcel IGCSE, OCR MEI, notes 6.3). Sliding
  both points along the line changes the triangle but not the gradient. Dragging one point
  directly above the other shrinks the run to 0, and the readout says it cannot divide by 0. That
  answers the horizontal and vertical sticking point (notes 6.1). A small "run of 1" step shows m
  as a rate per one, which Stump found students grasp best (notes 6.1).
- **Lesson 2, the same triangle, read two more ways.** The same two draggable points. The long side
  is labelled √(run² + rise²), and a midpoint marker sits on the line with dashed lines halfway
  along the run and halfway up the rise, down to the axes. *Why:* both results come straight out
  of the triangle you know. The midpoint is visibly the average of each coordinate (Bitesize CCEA,
  notes 4.6). Drag a point across an axis and the difference goes negative, but its square, and so
  the distance, does not.
- **Lesson 3, an m handle and a c handle.** A line with a handle on the y-axis (c) and a handle to
  turn it (m). The equation above it rewrites as you drag, and a test point you place lights up
  "on the line" only when its numbers fit the rule. *Why:* the ERIC review recommends that
  students "view many graphs and their corresponding equations and ... examine the relationship
  between graphical representations and algebraic parameters" (notes 6.1). Brilliant's level 6
  starts with "Shifting a Line" (notes 1.1). The x-intercept is marked too, in a different shape
  from c, because the two get mixed up (notes 6.1, 6.3). Sliding c shows lines with the same m are
  parallel.
- **Lesson 4, a pin and a turn.** Pin the line to one point and it swings, leaving a faint fan of
  the lines it could be. Set m and one line is left, while c is worked out live by substitution.
  Pin a second point instead and the line locks, with m worked out first. For parallel lines, a
  ghost of the given line slides, keeping its tilt, until it passes through the new point. *Why:*
  it shows why a point and a gradient, or two points, fix exactly one line (HELM, SQA National 5,
  notes 4.4). Going from a graph to its equation is the hard direction (only 5% of 17-year-olds,
  notes 6.1), so the picture builds the equation from what you can see.
- **Lesson 5, a measuring triangle on readings.** Axes with units, such as resistance in ohms
  against temperature in °C. The readings lie on a line. Drag a step triangle along the line and
  stretch it, and its run and rise are read in those units, so the gradient shows as Ω per °C.
  The y-axis crossing is labelled with its meaning, "R at 0 °C". *Why:* students confuse "greatest
  rise" with "highest point" (only 3 of 14 right, Clement, notes 6.2). The triangle shows how fast
  and the crossing shows how much, side by side. Undergraduates struggled with the slope of lines
  that miss the origin (notes 6.4), and these lines miss it on purpose.
- **Lesson 6, lay the line.** Scattered example readings. You lay a line with two handles, and
  each reading shows a thin stick to the line, with a running count above and below. The m and c
  readout gives the law with units. A "through zero" pin forces the line through (0, 0) so you can
  see the sticks grow. On a spring's readings, the last few curve away past the limit of
  proportionality. *Why:* SERC's rule is "equal numbers of points on either side" (notes 4.7).
  8 of 33 students forced their line through the origin, and 9 wanted to bend a wire through the
  dots (Casey, notes 6.4). The sticks make both visible.
- **Colour as before:** ink for lines, points, triangles and controls; amber for key terms (gradient,
  intercept, midpoint, law); teal for axis labels and units; red only for a slip; green only for
  finished.

## 4. What else
- **Benchmark (notes 1, 2).**
  - **Brilliant Linear Relationships** (56 lessons, 10 levels): constant change, predictions, slope,
    expressions, linearity, equations of lines, parallel and perpendicular, intercepts, data, then
    inequalities (notes 1.1). Lessons 1 and 3 to 6 here cover its levels 3, 6, 7 (parallel only),
    8 and 9. Its levels 1, 2, 4 and 5 are rate and "base fee" ground you have from Calculus
    fundamentals and The coordinate plane. Level 10 is dropped.
  - **Brilliant Coordinate Geometry** (44 lessons): it builds Pythagoras from areas to reach
    "Distance from Coordinates" (notes 1.2). You have Pythagoras, so lesson 2 is enough.
  - **Khan** puts intercepts and slope first, then slope-intercept form, then context (notes 2.1,
    2.2). **Bitesize CCEA** runs gradient, two points, intercept, finding the equation, then
    parallel lines (notes 2.3). **HELM**, written for engineering students, runs the equation, a
    and b, gradient from two points, the equation through two points, then distance (notes 2.5).
  - **What they lack that you need:** none of the school courses ends on finding a law from
    readings with its units. Brilliant's level 9 has "Fitting Data" (notes 1.1), but Bird, the
    usual HNC textbook, makes the straight line the tool for laws from experiments (notes 2.6).
    HELM's note to lecturers says to start the topic "via one from the students' discipline"
    (SECONDARY, notes 2.5). Lessons 5 and 6 come from Bird and the MCA.
- **His aim (notes 3).**
  - **MCA Second Engineer mathematics (SECONDARY host):** 4.7 "only two plotting points are
    required", 4.9 "the law of a straight line graph is of the form: y = ax + b, and defines a and
    b", 2.27 "Develops linear equations consistent with data provided in a question" (notes 3.1).
  - **MCA applied mechanics:** 10.14 "Determines the law of a machine by both graphical and
    analytical methods", 11.9 "Draws a load/extension graph from experimental data" (notes 3.2).
  - **MCA electro-technology:** 1.7 "Calculates change in conductor resistance using the
    temperature coefficients", 2.1 "States Ohms Law" (notes 3.2). **Applied heat:** 4.1 "Defines the
    coefficient of linear expansion" (notes 3.2).
  - **Pearson BTEC:** the Level 3 Engineering spec lists "linear equations of the form y = mx + c"
    and an "approximate equation of line of regression y = mx + c" (notes 3.4). For HN students
    the line is assumed knowledge that regression and rates of change build on (notes 3.4).
  - **SQA HN Engineering Mathematics 1** has no straight-line outcome; its entry advice asks for
    "good algebraic skills" (notes 3.5). Which awarding body your college uses is UNCONFIRMED.
- **Where it is used (each cited before a lesson uses it).**
  - **Gradient (1):** the resistance as "the slope of the line" of Ohm's law (OpenStax, notes 7.1);
    the spring constant as the gradient of force against extension (Bitesize, notes 7.3); "rates of
    change" in Pearson 4002 P8 (notes 3.4).
  - **Distance (2):** HELM's outcome "find the distance between two points" (notes 2.5), and SQA's
    Higher content (notes 2.4). **Midpoint (2):** Bitesize CCEA and SQA Higher teach it (notes 2.3,
    4.6). No engineering or trade use was found, so the lesson keeps it short and says so.
  - **y = mx + c (3):** MCA 4.9 (notes 3.1), HELM "explain the significance of a and b" (notes
    2.5), Pearson Level 3 (notes 3.4), Celsius to Fahrenheit (Pearson A level, notes 7.4).
  - **Finding the equation (4):** MCA 2.27 and 4.7 (notes 3.1); SQA National 5 and the Higher unit
    (notes 2.4); HELM "find the equation of a straight line through two points" (notes 2.5).
    **Parallel lines:** Bitesize Higher, Bitesize CCEA, the SQA Higher unit (notes 4.5, 2.4).
  - **Laws from readings (5):** MCA 10.13 and 10.14, 11.9, electro-technology 1.5, 1.7 and 2.1
    (notes 3.2); Bird's P = aW + b and voltage against speed (notes 4.7); NCERT's resistance from a
    graph of potential difference against current (notes 7.1); copper's coefficient (notes 7.2).
  - **Fitting (6):** Bird's "show that the values lie approximately on a straight line" (notes 4.7);
    HELM "often possible to approximate a relationship by a straight line" (notes 2.5); Pearson
    Level 3 regression from scatter diagrams (notes 3.4); the limit of proportionality (MCA 11.6,
    Bitesize, notes 3.2, 7.3).
- **The mistakes to catch, each with a DO screen and its own hint.**
  - **Lesson 1, upside down:** working out x over y instead of y over x (Stump and Barr, through the
    ERIC ED561782 summary, SECONDARY, notes 6.1).
  - **Lesson 1, the lost minus:** "an incorrect gradient of 2 was seen" when it was negative
    (Edexcel IGCSE, Nov 2024), and "The most common error was to ignore the negative sign" (OCR
    MEI, 2022) (notes 6.3).
  - **Lesson 1, brackets:** "failure to put brackets round 3p + 1 when finding the difference of the
    y-coordinates" (Cambridge, 2015, notes 6.3). Here it is a negative coordinate, y₂ − (−3).
  - **Lessons 1 and 3, horizontal and vertical lines:** "misconceptions and mistakes about the slope
    of a line that is parallel to the y-axis and x-axis" (ED561782, SECONDARY, notes 6.1).
  - **Lesson 3, the x-intercept used for c:** Moschkovich (1996) found the x-intercept used "in place
    of m or in place of b" (SECONDARY, notes 6.1), and Edexcel's 2024 report saw answers "where the x
    intercept was used rather than the y intercept" (notes 6.3).
  - **Lesson 4, knowing m but not using it:** "Although candidates were told that the gradient was −2,
    we did not see many responses with the equation y = −2x + c" (OCR, Nov 2023, notes 6.3).
  - **Lesson 4, graph to equation:** "only 5% of 17-year-olds could generate the equation" from a
    graph with its intercepts marked (SECONDARY, notes 6.1).
  - **Lessons 3 and 4, parallel lines:** "some students did not know that parallel lines have the
    same gradient" (Edexcel, 2024, notes 6.3).
  - **Lesson 5, slope or height:** "five confused greatest rise or fall with highest or lowest point
    on the graph" (Clement and others, ERIC ED264127, notes 6.2). A DO screen asks which of two
    resistors' lines has more ohms when one sits higher but is less steep.
  - **Lesson 5, a gradient with no meaning:** undergraduates spoke of best-fit lines by "what they
    do ... rather than the physics concepts they represent", and struggled with lines not through
    the origin (Physical Review PER, 2016, notes 6.4). Every DO screen in lesson 5 asks what m or c
    means, with its unit.
  - **Lesson 6, forced through zero:** "8 of the 33 students forced their line to go through the
    origin" (Casey, 2015, notes 6.4). This matters for you, because The coordinate plane's last
    lesson was lines through zero. A machine's effort at no load is not zero.
  - **Lesson 6, bending the line:** nine students "wanted to bend the wire to connect the points"
    (Casey, 2015, notes 6.4). You have "not dot to dot" from The coordinate plane, so this is one
    reminder screen.
  - **Not stated as common:** no source counts these, so they are taught as checks (put a point back
    in, look at the sketch), not as cited mistakes.
    - Taking the two differences in opposite orders, top and bottom. Edexcel's advice to write the
      formula first (notes 6.3) is aimed at "incorrect values" in general.
    - Halving the difference instead of averaging for a midpoint.
    - Reading m from y = 3 − 2x as 3, or from 2y = 3x − 8 as 3.
    - Counting squares instead of reading the scale's values for a gradient.
    - Reading c where the line meets an axis that does not start at 0. ED264127 lists "initial
      positioning at the zero point on the axis" among its misconceptions, but the notes do not
      give its meaning, so it is not cited for this.
    - Taking the gradient from two readings instead of from the fitted line.
- **Size and cost.** 6 lessons of about 12 screens on the agreed settings.
  - The last six measured courses ran about 0.99M to 1.14M tokens a lesson
    (docs/plans/foundational-maths-roadmap.md). Live graph pictures with readouts are a little
    heavier, so I estimate about 1.05M to 1.15M a lesson.
  - That is about 6.3M to 6.9M for the course, plus about 0.3M for the plan and research. The
    research can start from the 39 saved tool results.
  - The full process measured on Fractions lessons 4 to 8 was about 1.65M a lesson, about 9.9M for
    six.
  - Each build's real cost is reported to you.
- **Lesson 1 first.** Lesson 1 is built and checked before the others (about 1.1M, plus the plan and
  research). Because you asked for the folder in one push, the rest follow without waiting for
  you to try it.
- **Gaps to close at build time.** None blocks the build.
  - Brilliant's lesson pictures were not seen, only its contents lists (UNCONFIRMED, notes 1.1).
  - The MCA syllabus was read on a college's copy (SECONDARY); the MCA's own copy is UNCONFIRMED
    (notes 3.1). A maths line in MIN 654 and the General Engineering Science lines are UNCONFIRMED
    (notes 3.3).
  - Pearson 4002's content naming "Linear regression" and "Coordinate systems" is UNCONFIRMED (notes
    3.4). SQA H7K0 34 (SCQF 7) is UNCONFIRMED (notes 3.5).
  - Bitesize's named mistakes, AQA examiner reports and NCTM statements are UNCONFIRMED (notes 2.3,
    6.2, 6.3). The older slope studies were read only through the ERIC summary (notes 6.1).
  - The What Works Clearinghouse line that Rohrer's trial used graphing and slope problems is
    UNCONFIRMED (notes 6.5), so lesson design does not lean on it.
  - **Lesson 5:** what a lifting machine's intercept b means physically (the effort with no load,
    often put down to friction) is not in the notes. The lesson says "the effort with no load on",
    read from the graph, and makes no claim about its cause unless the research stage cites one.
  - **Lesson 5:** R = R₀ + R₀αT needs α taken at the same reference temperature as R₀. All About
    Circuits' copper figure is at 20 °C (notes 7.2), so a lesson that puts R₀ at 0 °C uses labelled
    example readings and works out its own gradient, and quotes a real α only with its reference.
  - **Lesson 5:** MCA 11.9 asks for E from a load/extension graph. E needs stress and strain, which
    are not in the notes, so the lesson stops at the gradient as stiffness and says E comes at
    college.
  - **Lesson 5:** the V-I gradient is the resistance only with voltage up the side. Sources draw
    the axes both ways (The coordinate plane brief, its notes 2.4), so the lesson reads the axis
    labels every time and shows the swap once.
