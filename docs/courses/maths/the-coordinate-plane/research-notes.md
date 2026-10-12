# The coordinate plane: research notes

Written 12 Oct 2026 for the course brief. Every quote below is word for word from a search or fetch result
saved in `tools/` beside this file and checked by `tools/eval/sources.mjs` (118 quotes, all checked). The same quotes,
with section numbers, are in `quotes.json`. Anything without a checked source is marked **UNCONFIRMED**.

Sources were limited to original publishers (Brilliant, Khan Academy, BBC Bitesize, Oak National Academy, NCETM,
AQA, SQA, Pearson, the MCA on gov.uk, Grundfos, Mersen, Littelfuse, OpenStax, RMIT, university and journal pages).
Two are repository or guide copies and are flagged where used: the ERIC-hosted article in 3.2, and the Royal
Geographical Society's copy of an ASE guide in 3.3 and 3.4.

## 1. Benchmark: what the coordinate-plane courses teach, in what order

**Brilliant** (roadmap reference [12]) has 30 lessons in five levels: Points and Coordinates, The 4 Quadrants,
Lines (horizontal and vertical only), Inequalities, and Gridline Distance (ending in direct distance and Pythagoras).
Gradient work is not in it: Brilliant keeps that in separate courses (Linear Relationships, Coordinate Geometry).
Negative coordinates are taught through a temperature context (City Temperatures). What Brilliant's widgets actually
do is behind its sign-in, so how it uses draggable points is **UNCONFIRMED**.

### 1.1 Brilliant, Coordinate Plane
- Brilliant's Coordinate Plane course size: 30 lessons.
  - Source: Practice Coordinate Plane | Brilliant, https://brilliant.org/courses/coordinate-plane
  - Quote: "30 Lessons 615 Exercises"
- Brilliant starts with coordinate notation and placing points (Level 1).
  - Source: Practice Coordinate Plane | Brilliant, https://brilliant.org/courses/coordinate-plane
  - Quote: "We'll first learn coordinate notation to place points in the coordinate plane."
- Brilliant then goes to lines and regions, then distance.
  - Source: Practice Coordinate Plane | Brilliant, https://brilliant.org/courses/coordinate-plane
  - Quote: "We'll then move on to describing lines and regions with equality and inequality expressions, before moving on to finding the distance between points in the plane."
- Brilliant Level 2 is the four quadrants.
  - Source: Practice Coordinate Plane | Brilliant, https://brilliant.org/courses/coordinate-plane
  - Quote: "Level 2 The 4 Quadrants"
- Brilliant uses a temperature context for negative coordinates (a lesson called City Temperatures).
  - Source: Practice Coordinate Plane | Brilliant, https://brilliant.org/courses/coordinate-plane
  - Quote: "City Temperatures"
- Brilliant's lines level covers horizontal and vertical lines only, and interpreting them.
  - Source: Practice Coordinate Plane | Brilliant, https://brilliant.org/courses/coordinate-plane
  - Quote: "Horizontal and Vertical Lines"
- Brilliant's lines level ends on interpreting lines.
  - Source: Practice Coordinate Plane | Brilliant, https://brilliant.org/courses/coordinate-plane
  - Quote: "Interpreting Lines"
- Brilliant Level 4 is inequality regions (the roadmap proposes dropping it).
  - Source: Practice Coordinate Plane | Brilliant, https://brilliant.org/courses/coordinate-plane
  - Quote: "Level 4 Inequalities"
- Brilliant Level 5 is distance, ending in Pythagoras.
  - Source: Practice Coordinate Plane | Brilliant, https://brilliant.org/courses/coordinate-plane
  - Quote: "Level 5 Gridline Distance"
- Brilliant's topic list distinguishes gridline distance from direct (diagonal) distance.
  - Source: Practice Coordinate Plane | Brilliant, https://brilliant.org/courses/coordinate-plane
  - Quote: "Direct distance."
- Brilliant's topic list ends with Pythagoras.
  - Source: Practice Coordinate Plane | Brilliant, https://brilliant.org/courses/coordinate-plane
  - Quote: "Pythagoras' Theorem."

**Khan Academy** (6th grade): four quadrants first, with negatives tied to the number line, then distance along a
horizontal or vertical line, then shapes. It states the x-then-y order as a convention.

### 1.2 Khan Academy
- Khan's unit says the plane shows negative values just as the number line does (builds on Negative numbers).
  - Source: Coordinate plane | 6th grade math | Khan Academy, https://www.khanacademy.org/math/cc-sixth-grade-math/x0267d782:coordinate-plane
  - Quote: "Just like on the number line, the coordinate plane can show positive and negative values."
- Khan's unit includes distance between points that lie on a horizontal or vertical line.
  - Source: Coordinate plane | 6th grade math | Khan Academy, https://www.khanacademy.org/math/cc-sixth-grade-math/x0267d782:coordinate-plane
  - Quote: "Distance between points: vertical or horizontal"
- Khan's unit includes problems in all four quadrants.
  - Source: Coordinate plane | 6th grade math | Khan Academy, https://www.khanacademy.org/math/cc-sixth-grade-math/x0267d782:coordinate-plane
  - Quote: "Coordinate plane problems in all four quadrants"
- Khan states the x-then-y order as a convention.
  - Source: Plotting a point (ordered pair) (video) | Khan Academy, https://www.khanacademy.org/math/cc-sixth-grade-math/x0267d782:coordinate-plane/cc-6th-coordinate-plane/v/plot-ordered-pairs
  - Quote: "And the convention, when we get an ordered pair like this, is that the first coordinate is the x-coordinate, and the second coordinate is the y-coordinate."
- Khan frames plotting as a treasure hunt of steps.
  - Source: Plotting a point (ordered pair) (video) | Khan Academy, https://www.khanacademy.org/math/cc-sixth-grade-math/x0267d782:coordinate-plane/cc-6th-coordinate-plane/v/plot-ordered-pairs
  - Quote: "Plotting ordered pairs on a coordinate plane is like a treasure hunt!"

**BBC Bitesize** teaches in this order: axes and coordinates in the first quadrant, then four quadrants, then
horizontal and vertical lines, then linear graphs, then gradient. Its scale advice is the most direct we found:
equal steps, labels on the gridlines, count in ones if you can, avoid steps of 3, 6 or 7.

### 1.3 BBC Bitesize
- Bitesize KS3: the four quadrants exist so that negative and positive values can be plotted.
  - Source: Plotting coordinates in the four quadrants - KS3 Maths, https://www.bbc.co.uk/bitesize/articles/zbq7xbk
  - Quote: "The four quadrants allow coordinates with negative and positive values to be plotted."
- Bitesize: axis labels sit on the gridlines, in equal steps.
  - Source: Axes and coordinates - KS3 Maths  - BBC Bitesize, https://www.bbc.co.uk/bitesize/articles/zvvmtv4
  - Quote: "Axes are labelled with numbers, in equal steps, which are placed in line with the gridlines."
- Bitesize scale advice: count in ones if possible.
  - Source: Axes and coordinates - KS3 Maths  - BBC Bitesize, https://www.bbc.co.uk/bitesize/articles/zvvmtv4
  - Quote: "If possible, use a scale counting in ones."
- Bitesize scale advice: avoid awkward step sizes.
  - Source: Axes and coordinates - KS3 Maths  - BBC Bitesize, https://www.bbc.co.uk/bitesize/articles/zvvmtv4
  - Quote: "Avoid steps counting in numbers which are difficult to subdivide, such as 3, 6 or 7"
- Bitesize: the two axes may use different scales.
  - Source: Axes and coordinates - KS3 Maths  - BBC Bitesize, https://www.bbc.co.uk/bitesize/articles/zvvmtv4
  - Quote: "Remember that the scales on each axis do not have to be the same."
- Bitesize teaches horizontal lines as a constant y, y = c.
  - Source: Horizontal and vertical lines - KS3 Maths - BBC Bitesize, https://www.bbc.co.uk/bitesize/articles/zp76nk7
  - Quote: "This is generalised by the equation (y = c), where (c) is the constant (y)-coordinate."
- Bitesize (GCSE module) ties the axes themselves to x = 0 and y = 0.
  - Source: Module 1 (M1) – Algebra – Coordinates and graphs - BBC Bitesize, https://www.bbc.co.uk/bitesize/articles/z6jtb7h
  - Quote: "The equation of the y axis is (x = 0)"
- Bitesize plots a table of values and joins the points with a straight line.
  - Source: Module 1 (M1) – Algebra – Coordinates and graphs - BBC Bitesize, https://www.bbc.co.uk/bitesize/articles/z6jtb7h
  - Quote: "Join the plotted points with a straight line across the grid."

**Oak National Academy** treats four-quadrant plotting as the prior knowledge for its Y7 plotting unit, which then
plots from a rule. Gradient and y = mx + c sit in a KS4 unit.

### 1.4 Oak National Academy
- Oak Y7 'Plotting coordinates' lists, as prior knowledge, axes in all four quadrants.
  - Source: Plotting coordinates KS3 | Y7 Maths | Lesson Resources | Oak National Academy, https://www.thenational.academy/teachers/programmes/maths-secondary-ks3/units/plotting-coordinates/lessons
  - Quote: "Understand and use axes in all four quadrants"
- Oak Y7 prior knowledge also includes plotting and reading accurately.
  - Source: Plotting coordinates KS3 | Y7 Maths | Lesson Resources | Oak National Academy, https://www.thenational.academy/teachers/programmes/maths-secondary-ks3/units/plotting-coordinates/lessons
  - Quote: "Plot and read coordinates accurately"
- Oak's Y7 unit then plots a rule: coordinates from a rule, algebraically and graphically.
  - Source: Plotting coordinates KS3 | Y7 Maths | Lesson Resources | Oak National Academy, https://www.thenational.academy/teachers/programmes/maths-secondary-ks3/units/plotting-coordinates/lessons
  - Quote: "I can represent a set of coordinates, constructed according to a mathematical rule, both algebraically and graphically."
- Oak KS2 order of a coordinate pair: horizontal then vertical.
  - Source: Write coordinates for already marked points in the first quadrant of a coordinate grid KS2 | Y4 Maths | Lesson Resources | Oak National Academy, https://www.thenational.academy/teachers/programmes/maths-primary-ks2/units/coordinates/lessons/write-coordinates-for-already-marked-points-in-the-first-quadrant-of-a-coordinate-grid
  - Quote: "Coordinates are recorded with the horizontal distance along the x-axis, then the vertical distance along the y-axis."
- Oak builds first-quadrant plotting first, then any quadrant.
  - Source: Plotting coordinates KS3 | Y7 Maths | Lesson Resources | Oak National Academy, https://www.thenational.academy/teachers/programmes/maths-secondary-ks3/units/plotting-coordinates/lessons
  - Quote: "I can plot coordinates in the first quadrant."

**NCETM and AQA.** NCETM wants fluency in reading and plotting with negatives in all four quadrants, then moves to
rules and straight lines. AQA's teacher guide names the two foundations of graph work as four-quadrant coordinates
and reading scales, and calls gradient the gatekeeper to what follows.

### 1.5 NCETM and AQA Stride
- NCETM: fluency in reading and plotting in all four quadrants is the aim.
  - Source: Mastery materials writing frame, https://www.ncetm.org.uk/media/s05nyur0/ncetm_ks3_cc_4_2.pdf
  - Quote: "Students should be fluent at both reading and plotting coordinates involving negative and non- integer x - and y -values in all four quadrants."
- NCETM: plotting from a rule leads to linear functions, and students choose scaled axes.
  - Source: Mastery materials writing frame, https://www.ncetm.org.uk/media/s05nyur0/ncetm_ks3_cc_4_2.pdf
  - Quote: "To achieve this, students should be given equations presented in a range of forms and opportunities to think about how many points are required to plot a straight line and to choose appropriately scaled axes."
- NCETM: coordinates are the base for linear functions, which come later.
  - Source: Mastery materials writing frame, https://www.ncetm.org.uk/media/s05nyur0/ncetm_ks3_cc_4_2.pdf
  - Quote: "A sound understanding of the relationships between the x - and y -values of pairs of coordinates provides the basis for more sophisticated analysis of the features of linear functions and their graphs"
- AQA Stride names the two foundations of graph work: four-quadrant coordinates and reading scales.
  - Source: Stride Teacher Companion Guide - AQA - Graphs, https://www.aqa.org.uk/files/resources.maths.stride.AQA-KC4_pdf/05610de731ee9ed9fd37381102dfac1e59fd0b07.pdf
  - Quote: "the ability to read and plot coordinates in all four quadrants of the Cartesian plane, as well the ability to interpret scales in a variety of graduations"
- AQA Stride includes plotting where the two axes have different spacing.
  - Source: Stride Teacher Companion Guide - AQA - Graphs, https://www.aqa.org.uk/files/resources.maths.stride.AQA-KC4_pdf/05610de731ee9ed9fd37381102dfac1e59fd0b07.pdf
  - Quote: "G4.5 Plot coordinates when axes are spaced differently"
- AQA Stride puts plotting from a data table straight after four-quadrant coordinates.
  - Source: Stride Teacher Companion Guide - AQA - Graphs, https://www.aqa.org.uk/files/resources.maths.stride.AQA-KC4_pdf/05610de731ee9ed9fd37381102dfac1e59fd0b07.pdf
  - Quote: "G8 Plot from a data table"

### 1.6 What every one of them leaves for later
Brilliant, Bitesize, Oak, NCETM and AQA all put gradient, y = mx + c and parallel lines after four-quadrant plotting. That agrees with the roadmap:
gradient and y = mx + c belong to a later Linear relationships course.
- Brilliant keeps gradient-type work in a separate Linear Relationships course.
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding, https://brilliant.org/courses/
  - Quote: "GR 8–9 Linear Relationships"
- Brilliant keeps distance formulas and shapes on the plane in a separate Coordinate Geometry course.
  - Source: Courses | Brilliant | Your Personal Tutor for Math & Coding, https://brilliant.org/courses/
  - Quote: "GR 7–8 Coordinate Geometry"
- AQA Stride: finding the gradient comes after four-quadrant plotting.
  - Source: Stride Teacher Companion Guide - AQA - Graphs, https://www.aqa.org.uk/files/resources.maths.stride.AQA-KC4_pdf/05610de731ee9ed9fd37381102dfac1e59fd0b07.pdf
  - Quote: "G19 Interpreting y=mx+c"
- Oak puts gradient and y = mx + c in a KS4 Linear graphs unit, with four-quadrant plotting as a prerequisite.
  - Source: Linear graphs GCSE | KS4 | Y10 Maths Higher | Lesson Resources | Oak National Academy, https://www.thenational.academy/teachers/programmes/maths-secondary-ks4-higher/units/linear-graphs/lessons
  - Quote: "Understand gradient and y-intercept in y = mx + c"
- Bitesize lists gradient as its own later article after axes, quadrants, horizontal/vertical and linear graphs.
  - Source: Axes and coordinates - KS3 Maths  - BBC Bitesize, https://www.bbc.co.uk/bitesize/articles/zvvmtv4
  - Quote: "How to work out the gradient of a straight line graph"
- AQA Stride calls gradient the gatekeeper to later graph work (so it belongs to the next course, not this).
  - Source: Stride Teacher Companion Guide - AQA - Graphs, https://www.aqa.org.uk/files/resources.maths.stride.AQA-KC4_pdf/05610de731ee9ed9fd37381102dfac1e59fd0b07.pdf
  - Quote: "the gatekeeper to greater success is G17 Find the Gradient"

### 1.7 Distance on a grid
Khan keeps distance at this level to points on the same gridline (a subtraction, which uses the negative-number
work). Brilliant adds direct (diagonal) distance and Pythagoras last. So "distance on the grid" has two parts,
and only the gridline part is a coordinate-plane skill.
- Khan's coordinate-plane unit has distance along a gridline (vertical or horizontal) at this level.
  - Source: Coordinate plane | 6th grade math | Khan Academy, https://www.khanacademy.org/math/cc-sixth-grade-math/x0267d782:coordinate-plane
  - Quote: "Distance between points: vertical or horizontal"
- Brilliant covers distance from the axes and between points on a gridline, with absolute value.
  - Source: Practice Coordinate Plane | Brilliant, https://brilliant.org/courses/coordinate-plane
  - Quote: "Distance Between Points"

### 1.8 Which skills are core (my reading of 1.1 to 1.7)
- **Core, in all of them:** the (x, y) order; plotting and reading points; the four quadrants and the signs;
  reading and choosing a scale; plotting from a table of values; reading a value off a graph.
- **In most:** horizontal and vertical lines (x = c, y = c); distance along a gridline; a straight line from a rule.
- **Later:** gradient, y = mx + c, parallel lines, inequality regions (the roadmap already drops these), midpoint,
  diagonal distance and Pythagoras.

## 2. Usefulness for Dan

### 2.1 SQA: the roadmap's reference [11]
This is the NQ Technician 1 unit F3HX 12 (it develops core skills at SCQF level 6), not an HN unit. The line the roadmap
quotes is Outcome 4, and its first performance criterion asks for a straight-line graph from experimental data.
The unit also asks for engineering examples. I did not read an SQA HN Marine unit for its graph lines:
**UNCONFIRMED** for the HNC/HND itself.
- SQA NQ Technician 1 maths, Outcome 4 (the roadmap's reference [11]).
  - Source: national unit specification: general information, https://www.sqa.org.uk/files/nu/F3HX12.pdf
  - Quote: "Interpret graphical information and construct appropriate graphs from given numerical data."
- SQA performance criterion: a best-fit straight line graph from experimental data.
  - Source: national unit specification: general information, https://www.sqa.org.uk/files/nu/F3HX12.pdf
  - Quote: "Construct a best-fit straight line graph from supplied experimental data correctly"
- SQA lists Using Graphical Information as a core skill the unit develops.
  - Source: national unit specification: general information, https://www.sqa.org.uk/files/nu/F3HX12.pdf
  - Quote: "The Unit allows the candidate to develop the Core Skill components Using Number and Using Graphical Information at SCQF level 6."
- SQA asks for engineering examples and contexts for graphical information.
  - Source: national unit specification: general information, https://www.sqa.org.uk/files/nu/F3HX12.pdf
  - Quote: "Candidates should be provided with formative opportunities to enhance skills in recognising and processing significant numerical and graphical information using engineering examples and contexts."

### 2.2 Pearson HN (Unit 4002 Engineering Mathematics, and related units)
In the 2024 unit descriptors, the Unit 4002 criteria I could see (P1 to P9, M1 to M4, D1 to D3) have no line that
says "plot" or "straight-line graph". Graphs appear only as a tool: presenting data (D1) and illustrating waves (M3).
So Pearson assumes plotting and reading graphs rather than teaching them. Other Pearson HN units do ask for
reading graphs, which shows the habit he needs. Pearson is a proxy: Dan's route is SQA's HNC/HND Marine
Engineering (roadmap, section on his college route).
- Pearson HN Unit 4002 Engineering Mathematics, Distinction criterion D1: presenting data.
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024), https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "Present data as meaningful information using appropriate methods that can be understood by a non- technical audience."
- Pearson HN Unit 4002, Merit criterion M3, uses graphical illustration of waves (graphs assumed as a tool).
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024), https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "Use compound angle identities to combine individual sine waves into a single wave, and illustrate graphically."
- Pearson HN Unit 5006 (Level 5) asks for solving from sketched functions by graphical estimation.
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024), https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "Approximate solutions of sketched functions using a graphical estimation method."
- Pearson HN Unit 4079 (Manufacturing Operations Mathematics) aim: interpret data from graphs.
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024), https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "interpret data from a variety of sources, such as tables, graphs and diagrams"

### 2.3 MCA General Engineering Science I
This is the clearest line for Dan. Section 1.3 Graphs asks for plotting ordered pairs, joining them "with an
appropriate curve", forming linear equations from data, and the intercept and gradient of a straight line. Section 2
asks for distance-time graphs and the gradient as speed. So the MCA needs gradient (the later course's job) but also
needs plotting and reading first. The earlier roadmap note said GES I has no rearranging line; this check found its
graphs lines.
- MCA GES I, 1.3 Graphs: forming linear equations from data.
  - Source: General Engineering Science I Written Examination Syllabuses - GOV.UK, https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses
  - Quote: "Form linear equations consistent with data provided."
- MCA GES I, 1.3 Graphs: plotting ordered pairs.
  - Source: General Engineering Science I Written Examination Syllabuses - GOV.UK, https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses
  - Quote: "Plot ordered pairs on graph paper, either given or calculated and join the points with an appropriate curve."
- MCA GES I, 1.3 Graphs: intercept and gradient of a straight line (the part that belongs to the later course).
  - Source: General Engineering Science I Written Examination Syllabuses - GOV.UK, https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses
  - Quote: "Interpret the equation for a straight-line graph, identifying the intercept and gradient."
- MCA GES I, 2.1 Kinematics: plotting a distance-time graph from data.
  - Source: General Engineering Science I Written Examination Syllabuses - GOV.UK, https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses
  - Quote: "Plot straight line distance time graphs from given data."
- MCA GES I, 2.1 Kinematics: gradient read as speed.
  - Source: General Engineering Science I Written Examination Syllabuses - GOV.UK, https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses
  - Quote: "Calculate and interpret the gradient of distance time graph as speed."
- MCA GES I, 2.2 Dynamics: force-distance and torque-angle graphs from data (area under a graph is for a later course).
  - Source: General Engineering Science I Written Examination Syllabuses - GOV.UK, https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses
  - Quote: "Draw graphs of force/distance and torque/angle from given data and interpret the area under the graph to Work Done."

### 2.4 Ohm's law: the V-I graph
A resistor's graph is a straight line through the origin, and that is the proportion Dan has already met in
tables. The source books disagree on which axis holds which variable (BBC: voltage on y; OCR and OpenStax: current
on y), so the lesson should label axes every time and never rely on a fixed side.
- BBC Bitesize: the V-I graph of an ohmic conductor is a straight line through the origin, showing proportion.
  - Source: What is Ohm's Law? - BBC Bitesize, https://www.bbc.co.uk/bitesize/articles/zncrmbk
  - Quote: "the V-I graph is a straight line that passes through the origin, this shows that the current and voltage are proportional"
- BBC Bitesize puts voltage on the y-axis and current on the x-axis for its V-I graph.
  - Source: What is Ohm's Law? - BBC Bitesize, https://www.bbc.co.uk/bitesize/articles/zncrmbk
  - Quote: "with voltage on the y-axis and current on the x-axis"
- OpenStax reads resistance from a current-voltage graph, with current on the y-axis (the opposite axis choice).
  - Source: 19.1 Ohm's law - Physics | OpenStax, https://openstax.org/books/physics/pages/19-1-ohms-law
  - Quote: "The plot shows that current is proportional to voltage, which is Ohm’s law."
- OpenStax: a line that is not straight means the material is not ohmic.
  - Source: 19.1 Ohm's law - Physics | OpenStax, https://openstax.org/books/physics/pages/19-1-ohms-law
  - Quote: "Note that if the line in Figure 19.7 were not straight, then the material would not be ohmic and we would not be able to use Ohm’s law."
- RMIT: the V against I graph of an ohmic conductor goes through the origin.
  - Source: PE1.2: OHM'S LAW, https://learninglab.rmit.edu.au/sites/default/files/Electricity_Ohms%20Law.pdf
  - Quote: "The graph of V versus I is a straight line that must go through the origin."
- RMIT: the slope of the V-I graph is the resistance (the steepness idea, kept informal here).
  - Source: PE1.2: OHM'S LAW, https://learninglab.rmit.edu.au/sites/default/files/Electricity_Ohms%20Law.pdf
  - Quote: "Ohmic Conductors R (the slope of the V-I graph above) is a constant for a given conductor under these conditions and is called the resistance."
- OCR GCSE physics (Bitesize) puts current on the vertical axis for I-V graphs.
  - Source: Current-voltage graphs - How to affect electric current - OCR 21st Century - GCSE Physics (Single Science) Revision - OCR 21st Century - BBC Bitesize, https://www.bbc.co.uk/bitesize/guides/ztrbjty/revision/5
  - Quote: "current on the vertical axis"
- OCR GCSE physics: curved I-V graphs belong to non-linear components.
  - Source: Current-voltage graphs - How to affect electric current - OCR 21st Century - GCSE Physics (Single Science) Revision - OCR 21st Century - BBC Bitesize, https://www.bbc.co.uk/bitesize/guides/ztrbjty/revision/5
  - Quote: "Components which show I–V graphs that are not straight lines are non-linear circuit elements."

### 2.5 A characteristic curve: the pump curve
Head against flow, from a pump maker. It falls as flow rises, so it is the first curve in the course that is not a
straight line through the origin, and it is read in both directions. No standards-body page (for example ISO 9906) was
fetched: **UNCONFIRMED** as a standard. No marine pump curve was fetched: **UNCONFIRMED** for a ship's pump.
- Grundfos (pump maker): a pump curve plots head against flow, and head falls as flow rises.
  - Source: How to read a pump curve? | Grundfos, https://www.grundfos.com/uk/learn/ecademy/all-courses/the-basic-pump-curve-course/how-to-read-a-pump-curve-
  - Quote: "In a QH-curve, which measures the flow and head, you can see that a low flow results in a high head and a high flow results in a low head."
- Grundfos teaches pump curves as a coordinate system with head on the vertical axis.
  - Source: Reading a pump curve, https://www.grundfos.com/content/dam/global/page-assets/learn/ecademy/pdfs/master-15-module-3-Reading-a-pump-curve-rs.pdf
  - Quote: "In this system of coordinates, the head is measured on the vertical coordinate in meter liquid column (mLc) or just meters (m)."
- Grundfos: the duty point is where two curves cross (reading a point off two graphs).
  - Source: Duty point | Grundfos, https://www.grundfos.com/solutions/learn/research-and-insights/duty-point
  - Quote: "The duty point is the intersection between the pump performance curve and the system’s characteristics."
- LSU AgCenter: reading a pump curve both ways, from flow to head.
  - Source: Pump Curves, https://www.lsuagcenter.com/~/media/system/9/2/3/5/923525275a3ff99d781ff0eec797e7a8/pub3241hpumpcurves.pdf
  - Quote: "Choosing a flow rate (for example, 2,000 gallons per minute) on the horizontal axis, proceeding vertically to the pump curve and then proceeding left to the vertical axis, thus reading the head (80 feet)."
- LSU AgCenter: the shape of the pump curve (highest head at lowest flow).
  - Source: Pump Curves, https://www.lsuagcenter.com/~/media/system/9/2/3/5/923525275a3ff99d781ff0eec797e7a8/pub3241hpumpcurves.pdf
  - Quote: "The highest head occurs at the lowest flow rate, and the highest flow rate occurs at the lowest head."

### 2.6 A fuse's time-current curve
From fuse makers. It is read by going up from a current to the curve, then across to a time. It is drawn on a
logarithmic plot, which is a scale the course should show but not teach (a later course, Powers of ten and logs).
No BS 7671 or IEC 60269 page was fetched: **UNCONFIRMED** from a standards body.
- Mersen (fuse maker): reading a time-current curve, from current up to the curve and across to time.
  - Source: TIME-CURRENT CURVE, https://www.mersen.com/sites/default/files/files_imported_ep/DS-Mersen-Application-Information-How-To-Read-A-Time-Current-Curve.pdf
  - Quote: "At the bottom of the sheet (Current in Amperes) find 160 amperes (Pt. A) and follow that line straight up to the point where it intersects the 30A curve (Pt. B)."
- Mersen: the reading finishes by going left to the time axis.
  - Source: TIME-CURRENT CURVE, https://www.mersen.com/sites/default/files/files_imported_ep/DS-Mersen-Application-Information-How-To-Read-A-Time-Current-Curve.pdf
  - Quote: "Then follow that line to the left edge (Time in Seconds) and read 10 seconds."
- Littelfuse (fuse maker): which way the axes run on a time-current curve.
  - Source: FUSEOLOGY - Littelfuse, https://www.littelfuse.com/assetdocs/littelfuse-fuseology?assetguid=c81c1a21-b903-44b6-b46d-180c48f7c3c5
  - Quote: "Current values increase from left to right, and time increases from bottom to top."
- Littelfuse: time-current curves are drawn on a logarithmic plot (a scale Dan will meet; a later course).
  - Source: FUSE FUNDAMENTALS, https://www.littelfuse.com/assetdocs/fuse-fundamentals-at-the-heart-of-electrical-systems-fuses-keep-operations-live?assetguid=55d2e833-b53b-467f-a0c2-f15ff2316db3
  - Quote: "the performance information is presented on a logarithmic plot"
- Littelfuse: fuse opening times fall as current rises (a curve, not a straight line).
  - Source: FUSE FUNDAMENTALS, https://www.littelfuse.com/assetdocs/fuse-fundamentals-at-the-heart-of-electrical-systems-fuses-keep-operations-live?assetguid=55d2e833-b53b-467f-a0c2-f15ff2316db3
  - Quote: "The fuse opening time will decrease as the magnitude of overcurrent increases"

### 2.7 An engine performance graph
A Pearson HN unit expects students to explain engine performance graphs. No engine or propeller curve from a marine
maker was fetched: **UNCONFIRMED**.
- Pearson HN Unit 4095 (Automotive Combustion) expects explaining engine performance graphs, an analogue of the marine engine curves Dan will meet.
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024), https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "Explain characteristics of engine performance graphs, including power, torque, specific fuel consumption, and mean effective pressure, with recommendations of how to improve results."

### 2.8 Reading values off a graph
The skills are: find a value that is not printed on the scale, read in both directions, and know the limit of
reading between points (interpolation) versus beyond them (extrapolation).
- Oak (KS4 statistics unit) teaches interpolation versus extrapolation and the limits of each.
  - Source: Graphical representations of data: scatter graphs and time series KS4 | Y10 Maths Higher | Lesson Resources | Oak National Academy, https://www.thenational.academy/teachers/programmes/maths-secondary-ks4-higher/units/graphical-representations-of-data-scatter-graphs-and-time-series/lessons
  - Quote: "I can state the difference between interpolation and extrapolation and the limitations of each."
- AQA Stride: a foundation skill is finding values that are not printed on the scale.
  - Source: Stride Teacher Companion Guide - AQA - Graphs, https://www.aqa.org.uk/files/resources.maths.stride.AQA-KC4_pdf/05610de731ee9ed9fd37381102dfac1e59fd0b07.pdf
  - Quote: "finding values which aren’t provided on the scales"
- LSU AgCenter: the pump curve is read from a flow to a head, or from a head to a flow, in both directions.
  - Source: Pump Curves, https://www.lsuagcenter.com/~/media/system/9/2/3/5/923525275a3ff99d781ff0eec797e7a8/pub3241hpumpcurves.pdf
  - Quote: "Head usually is plotted on the vertical axis of the graph and flow rate on the horizontal axis."

## 3. Teaching: mistakes and visual models

### 3.1 Reading (x, y) the wrong way round
Sourced as a reason for teaching: Oak lists confusing the axes and counting along the wrong one as the common
misconception, and Big Ideas Math builds an error-analysis task around a swapped pair. Bitesize's memory aid is
"hallway then stairs" (not "corridor"; the wording is Bitesize's). How common the swap is, as a percentage, is
**UNCONFIRMED**: no counting study was found.
- Bitesize gives the 'hallway then stairs' memory aid for the x-then-y order.
  - Source: What are axes and coordinates when drawing graphs? (KS3 Maths | BBC Bitesize) - BBC Bitesize, https://www.bbc.co.uk/bitesize/articles/z73cbqt
  - Quote: "One way to remember is 'you go along the hallway before you go up the stairs'."
- Bitesize: x comes before y, written alphabetically.
  - Source: What are axes and coordinates when drawing graphs? (KS3 Maths | BBC Bitesize) - BBC Bitesize, https://www.bbc.co.uk/bitesize/articles/z73cbqt
  - Quote: "Coordinates are written alphabetically - so x comes before y (x, y)."
- Bitesize extends the same memory aid to negatives: along first, then up or down.
  - Source: What are axes and coordinates when drawing graphs? (KS3 Maths | BBC Bitesize) - BBC Bitesize, https://www.bbc.co.uk/bitesize/articles/z73cbqt
  - Quote: "you always go along the hallway before you go up or down the stairs"
- Big Ideas Math asks learners to compare a point with its swapped pair, which exposes the order.
  - Source: The Coordinate Plane B.6, https://www.bigideasmath.com/protected/content/ipe_cc/grade%206/10/g6_10_06.pdf
  - Quote: "How are the locations of the points (−3, 1) and (1, −3) different?"
- Big Ideas Math error-analysis item: a point plotted with its coordinates swapped is shown as the error to find.
  - Source: The Coordinate Plane B.6, https://www.bigideasmath.com/protected/content/ipe_cc/grade%206/10/g6_10_06.pdf
  - Quote: "To plot (3, 5), start at (0, 0) and move 5 units right and 3 units up."
- Oak lists the common misconception for reading coordinates: confusing the axes and counting along the wrong one.
  - Source: Write coordinates for already marked points in the first quadrant of a coordinate grid KS2 | Y4 Maths | Lesson Resources | Oak National Academy, https://www.thenational.academy/teachers/programmes/maths-primary-ks2/units/coordinates/lessons/write-coordinates-for-already-marked-points-in-the-first-quadrant-of-a-coordinate-grid
  - Quote: "Pupils might confuse the x-axis and y-axis, leading them to count along the wrong axis."
- Oak's fix: label the axes with arrows on the grid.
  - Source: Write coordinates for already marked points in the first quadrant of a coordinate grid KS2 | Y4 Maths | Lesson Resources | Oak National Academy, https://www.thenational.academy/teachers/programmes/maths-primary-ks2/units/coordinates/lessons/write-coordinates-for-already-marked-points-in-the-first-quadrant-of-a-coordinate-grid
  - Quote: "Use visual aids, like arrows or labels, to clearly mark the axes on the grid."

### 3.2 Negatives: points on the wrong side or on an axis
A research article lists misuse of signs and wrongly placing points on axes or in quadrants. Open Up shows points
with the same numbers and different signs landing in four quadrants. A zero coordinate means no move in that
direction.
- Research article on common conceptual errors: students fail to tell the axes apart and misuse signs of coordinates (ERIC-hosted PDF of a journal article; journal not identified in the excerpt).
  - Source: Research Article The Most Common Conceptual Errors in, https://files.eric.ed.gov/fulltext/EJ1486282.pdf
  - Quote: "fail to distinguish between the x-axi and the y-axis, and misuse the signs of coordinates"
- Same article: points wrongly assigned to the axes or quadrants.
  - Source: Research Article The Most Common Conceptual Errors in, https://files.eric.ed.gov/fulltext/EJ1486282.pdf
  - Quote: "incorrectly assigning points to the axes or quadrants on the coordinate plane"
- Open Up Resources: points with the same numbers but different signs sit in different quadrants.
  - Source: Grade 6 Math Unit 7 Section C Lesson 14 — Student Edition, https://access.openupresources.org/curricula/our6-8math-tn/en/tn/grade-6/unit-7/section-c/lesson-14/student.html
  - Quote: "Notice that they all have almost the same coordinates, except the signs are different."
- Open Up Resources: the signs tell you the quadrant.
  - Source: Grade 6 Math Unit 7 Section C Lesson 14 — Student Edition, https://access.openupresources.org/curricula/our6-8math-tn/en/tn/grade-6/unit-7/section-c/lesson-14/student.html
  - Quote: "We can always tell which quadrant a point is located in by the signs of its coordinates."
- Big Ideas Math plots a negative-y point as moves from the origin: right, then down.
  - Source: The Coordinate Plane B.6, https://www.bigideasmath.com/protected/content/ipe_cc/grade%206/10/g6_10_06.pdf
  - Quote: "Start at the origin. Move 3 units right and 2 units down. Then plot the point."
- Nelson MathLinks: a zero coordinate means no move in that direction (points on the axes).
  - Source: Coordinates and Design, https://learningcentre.nelson.com/student/9780070988590/Student_Text/Ch01_MathLinks7.pdf
  - Quote: "If the x -coordinate is 0, do not count left or right."

### 3.3 Scales: uneven, odd step sizes, "every square is 1"
Sourced: choosing a scale is hard; use steps of 1, 2 or 5 times a power of ten; unequal spacing signals a weak
number-line model; some students take every square as one unit; building a graph on a scale is harder than reading
one. **Counting gridlines instead of spaces, as a named mistake, is UNCONFIRMED**: nothing found says it in those
words. The nearest source is the "counting starts at 1" misconception in 3.4, and Bitesize's rule that labels sit on
gridlines.
- Royal Geographical Society / ASE guide: pupils find choosing scales hard.
  - Source: language-of-mathematics-in-science-guide-ase-2016-3-(1).pdf, https://www.rgs.org/media/a4ehk1zy/drawingchartsandgraphs.pdf
  - Quote: "Pupils find it hard to choose appropriate scales ."
- Same guide: a simple rule for a readable scale.
  - Source: language-of-mathematics-in-science-guide-ase-2016-3-(1).pdf, https://www.rgs.org/media/a4ehk1zy/drawingchartsandgraphs.pdf
  - Quote: "A simple rule is that each large square (main division) should have a value of 1, 2 or 5 multiplied by some power of ten."
- Inside Mathematics (task rubric): third graders find it hard to read halfway between marks on a scale of 10.
  - Source: Parking Cars, https://www.insidemathematics.org/sites/default/files/materials/parking%20cars.pdf
  - Quote: "Interpreting what number is half-way between when using a scale of 10"
- Inside Mathematics (task rubric): some students take every square to be one unit whatever the scale says.
  - Source: Parking Cars, https://www.insidemathematics.org/sites/default/files/materials/parking%20cars.pdf
  - Quote: "Student G only understands the square as representing one unit."
- Cambridge Mathematics: uneven spacing on an axis shows a weak number-line model.
  - Source: The trouble with graphs | Cambridge Mathematics, https://www.cambridgemaths.org/blogs/the-trouble-with-graphs
  - Quote: "do not associate the axis of a graph with the (linear, non-logarithmic) number line can be seen when the spacing between consecutive values are of inconsistent size"
- Illinois State University lab handbook: keep a consistent scale on an axis.
  - Source: Microsoft Word - graph_errors.doc, http://www.phy.ilstu.edu/ptefiles/302content/student_lab_hdbk/graph_errors.pdf
  - Quote: "Another problem to avoid is not sticking with a consistent scale on an axis."
- AAMT Top Drawer: unevenly spaced units are a warning sign of a misleading graph.
  - Source: Misleading graphs / Misunderstandings / Statistics / Topdrawer / Home - Topdrawer, https://topdrawer.aamt.edu.au/Statistics/Misunderstandings/Misleading-graphs
  - Quote: "The scale on the horizontal axis may have the units unevenly spaced or the vertical axis may not start at 0 when recording frequency."
- AAMT Top Drawer: inconsistent use of scale is one of the most common ways graphs mislead.
  - Source: Misleading graphs / Misunderstandings / Statistics / Topdrawer / Home - Topdrawer, https://topdrawer.aamt.edu.au/Statistics/Misunderstandings/Misleading-graphs
  - Quote: "One of the most common ways for graphs to be misleading is with the inconsistent use of scale."
- Inside Mathematics: instruction should include scales other than 1.
  - Source: Parking Cars, https://www.insidemathematics.org/sites/default/files/materials/parking%20cars.pdf
  - Quote: "Students need opportunities to think about scales other than 1."

### 3.4 Non-zero starts and the origin
Sourced: not starting an axis at zero can create or hide a relationship, and graphs should show the origin. This
matters here because a line through the origin is the test for proportion. Treating the origin as (1, 1) is only
reported on a tutoring-company page, which is outside the allowed sources: **UNCONFIRMED**.
- RGS / ASE guide: a common misconception is that counting starts at 1 (reading a scale from the wrong start).
  - Source: language-of-mathematics-in-science-guide-ase-2016-3-(1).pdf, https://www.rgs.org/media/a4ehk1zy/drawingchartsandgraphs.pdf
  - Quote: "a common misconception for pupils is that counting always starts at ‘1’."
- Illinois State University: show the origin so a relationship is read correctly.
  - Source: Microsoft Word - graph_errors.doc, http://www.phy.ilstu.edu/ptefiles/302content/student_lab_hdbk/graph_errors.pdf
  - Quote: "In physics it is often best to show the origin (0,0) in each graph."
- Illinois State University: auto-scaled axes that do not start at zero can suggest a relationship that is not there.
  - Source: Microsoft Word - graph_errors.doc, http://www.phy.ilstu.edu/ptefiles/302content/student_lab_hdbk/graph_errors.pdf
  - Quote: "This often happens with auto-scaling computer graphing programs where, for instance, the vertical axis runs from 0.05 to 0.06 and horizontal axis reads from 0 to 10."
- AAMT Top Drawer: a vertical axis that does not start at 0 is a warning sign of a misleading graph.
  - Source: Misleading graphs / Misunderstandings / Statistics / Topdrawer / Home - Topdrawer, https://topdrawer.aamt.edu.au/Statistics/Misunderstandings/Misleading-graphs
  - Quote: "the vertical axis may not start at 0 when recording frequency"
- Illinois State University: a horizontal line means no relationship, and a squashed axis can hide that.
  - Source: Microsoft Word - graph_errors.doc, http://www.phy.ilstu.edu/ptefiles/302content/student_lab_hdbk/graph_errors.pdf
  - Quote: "Failing to note that when the slope is zero (horizontal line), there is no relationship."

### 3.5 Joining points when a line is not meaningful
Sourced: for experimental data, do not join point to point (draw a best-fit line); a fuse curve is continuous because
current and time are continuous; MCA GES I says to join the points "with an appropriate curve". A source on
joining points for **discrete** counts (where a line means nothing) was not found: **UNCONFIRMED**.
- Illinois State University: never join experimental points point-to-point.
  - Source: Microsoft Word - graph_errors.doc, http://www.phy.ilstu.edu/ptefiles/302content/student_lab_hdbk/graph_errors.pdf
  - Quote: "Never connect even linearized data point-to-point with straight lines."
- Mersen: a fuse curve is a continuous line because the quantity is continuous (the case where joining is meaningful).
  - Source: TIME-CURRENT CURVE, https://www.mersen.com/sites/default/files/files_imported_ep/DS-Mersen-Application-Information-How-To-Read-A-Time-Current-Curve.pdf
  - Quote: "is displayed as a continuous line representing the average melting time in seconds for a range of overcurrent conditions"
- Springer (journal): graph-as-picture error, reading a graph as a picture of what happened.
  - Source: Exploring Causes of the Graph-as-picture Error in Students’ Graph Interpretation: Insights from an Eye-tracking Study with Ninth Graders | Journal für Mathematik-Didaktik | Springer Nature Link, https://link.springer.com/article/10.1007/s13138-025-00264-w
  - Quote: "slope/height confusion (confusing gradients with maximum or minimum values)"
- Illinois State University: points that are on a line through the origin should not be forced by repeated (0,0) points.
  - Source: Microsoft Word - graph_errors.doc, http://www.phy.ilstu.edu/ptefiles/302content/student_lab_hdbk/graph_errors.pdf
  - Quote: "Mother nature is not jerky."

### 3.6 Reading a graph at the wrong value
Sourced: teaching the mechanics without the meaning of each axis; losing sight that an equation is a relationship;
reading the same curve in both directions. A named mistake of reading at the wrong value (for example reading
the next gridline) is **UNCONFIRMED**.
- Cambridge Mathematics: teaching only the mechanics of graph construction leaves students not knowing what each feature means.
  - Source: The trouble with graphs | Cambridge Mathematics, https://www.cambridgemaths.org/blogs/the-trouble-with-graphs
  - Quote: "teaching the mechanics of graph construction encourages students to attend to the ‘how’ without considering the ‘what’, the ‘where’ or the ‘why’ of the different features"
- NCETM: students lose sight that an equation is a relationship between two values.
  - Source: Mastery materials writing frame, https://www.ncetm.org.uk/media/s05nyur0/ncetm_ks3_cc_4_2.pdf
  - Quote: "Students often lose sight of the fact that an equation represents a relationship between two values."
- Mersen: the same curve is read in both directions, current to time and time to current.
  - Source: TIME-CURRENT CURVE, https://www.mersen.com/sites/default/files/files_imported_ep/DS-Mersen-Application-Information-How-To-Read-A-Time-Current-Curve.pdf
  - Quote: "Likewise, for the same fuse we might want to know what current will open the fuse in 0.1 second."

### 3.7 Visual models good teachers use
Sourced: moving along then up or down from the origin (Bitesize, Khan, Big Ideas); labels or arrows on the axes (Oak);
count along the x-axis and then the y-axis (Oak). **Draggable points, and scale choices as a slider, are not sourced:
UNCONFIRMED**. They are a design view: a point you drag while a readout shows (x, y), with a ghost "along then up"
path, would address every mistake in 3.1 and 3.2.
- Khan frames plotting as hopping steps along then up or down, like a treasure hunt.
  - Source: Plotting a point (ordered pair) (video) | Khan Academy, https://www.khanacademy.org/math/cc-sixth-grade-math/x0267d782:coordinate-plane/cc-6th-coordinate-plane/v/plot-ordered-pairs
  - Quote: "Plotting ordered pairs on a coordinate plane is like a treasure hunt!"
- Bitesize: the hallway-then-stairs picture.
  - Source: What are axes and coordinates when drawing graphs? (KS3 Maths | BBC Bitesize) - BBC Bitesize, https://www.bbc.co.uk/bitesize/articles/z73cbqt
  - Quote: "you go along the hallway before you go up the stairs"
- Big Ideas Math: plot by moves from the origin (start at the origin, count along, then up or down).
  - Source: The Coordinate Plane B.6, https://www.bigideasmath.com/protected/content/ipe_cc/grade%206/10/g6_10_06.pdf
  - Quote: "Start at the origin. Move 4 units left. Then plot the point."
- Inside Mathematics: building a graph on a scale is harder than reading one on the same scale.
  - Source: Parking Cars, https://www.insidemathematics.org/sites/default/files/materials/parking%20cars.pdf
  - Quote: "Adding information to a graph, using a scale to make a graph seems to be different or more complicated than reading a graph with the same scale"
- Oak's visual aid: arrows or labels marking the axes on the grid.
  - Source: Write coordinates for already marked points in the first quadrant of a coordinate grid KS2 | Y4 Maths | Lesson Resources | Oak National Academy, https://www.thenational.academy/teachers/programmes/maths-primary-ks2/units/coordinates/lessons/write-coordinates-for-already-marked-points-in-the-first-quadrant-of-a-coordinate-grid
  - Quote: "Count along the x-axis and then the y-axis to find the coordinates for the marked point."

## 4. My view of the core lessons

Dan has cut every course to its core. The roadmap drafts 8 lessons; I would build **6**.

| # | Lesson | The skill Dan leaves with |
|---|---|---|
| 1 | Along, then up | Read and plot points in the first quadrant, x before y, with a scale of 1. |
| 2 | Below and to the left | Four quadrants; the signs of (x, y) tell the quadrant; a zero means "on an axis"; x = c and y = c lines; distance along a gridline by subtraction. |
| 3 | Scales | Read a scale where a square is not 1; choose a scale (1, 2 or 5 times a power of ten); equal steps; start at zero; read between marks. |
| 4 | From a table to a graph | Plot a table of values; fit the numbers to the axes; decide whether to join (continuous or not). |
| 5 | Reading a graph | Read a value in both directions, with a value between marks; the pump curve and the fuse curve as examples; interpolation versus extrapolation. |
| 6 | Straight lines through the origin | Proportion from Proportional reasoning drawn as a line through (0, 0); V = IR as a V-I graph; a bent line means not proportional. Steepness only informally. |

**Folded in or dropped from the roadmap's 8:**
- Horizontal and vertical lines: folded into 2.
- Distance on the grid: the gridline part is folded into 2. The diagonal part, leading into Pythagoras, is left to
  Geometry fundamentals or Coordinate geometry.
- Inequality regions: dropped (the roadmap already proposes this).
- A 5-lesson version: merge 3 and 4.

**Visual:** yes throughout. Points you drag, a live (x, y) readout, a scale you set, and curves you read by sliding
a cursor.

**Builds on:** Negative numbers (four quadrants and the signs); Proportional reasoning (lesson 6: tables to graphs);
Solving equations (V = IR as the rule behind the line).

## 5. Questions for Dan
1. **Steepness.** The MCA's GES I asks for the intercept and gradient of a straight line, and the V-I graph's slope is
   the resistance. Should lesson 6 give "steepness" a first, informal look (how much y for each 1 of x), or should
   all of it wait for the Linear relationships course? I recommend the first, kept to the one picture.
2. **Axes for V-I.** Sources put voltage on y (BBC) or current on y (OCR, OpenStax). Which does your college use?
   Until you say, the lesson will show both once and always label the axes.
3. **Logarithmic scales.** Fuse curves are on a logarithmic plot. The course would show one and say "this scale is
   not even steps; a later course explains it". Is that all right?
4. **Real curves or drawn ones.** The pump and fuse curves would be drawn in the course from labelled example numbers
   (the app's rule is that numbers are controls, computed or cited), not reproduced from a maker's chart. Is that all right?
5. **Five or six lessons.** Six as above, or five by merging scales and tables?
