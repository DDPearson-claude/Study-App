# Geometry fundamentals: the course brief

Written 12 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. Dan
asked me to finish the last two courses one at a time, so this brief takes the research's suggested
core and my answers to its questions. It is built after The coordinate plane, whose lesson 2 teaches
distance along a gridline. Sources and quotes are in `research-notes.md` beside this file (92 quotes,
every one checked against the saved search results; section numbers point there).

## The short version
**Six lessons**
1. Area from unit squares
2. Circles
3. Square units and scaling
4. Pythagoras
5. Pythagoras at work
6. Volume and litres

**The main pictures:**
- unit squares and unit cubes you can count
- a triangle shown as half a rectangle
- a circle cut into wedges that open into a rough rectangle
- squares drawn on a right-angled triangle's sides

**Decisions taken for you** (say if you want any changed):
- **Six lessons.**
- **Angles are not a lesson of their own.** The right angle comes inside Pythagoras, and the rest
  waits for Trigonometry, which will need angles properly. SQA's HN maths unit assumes National 5
  maths on entry (notes 2.4).
- **Pyramids, cones and spheres wait.** The MCA's GES I lists them (notes 2.4), but your route is
  not settled yet. Lesson 6 covers prisms and cylinders.
- **Labelled example numbers for tanks and diagonal runs.** No original publisher gave a real
  ship's sounding table, and none described a conduit offset (the only page was an individual
  author's, so it is not used). The course says that each tank has its own sounding table, which
  is sourced, and works a made-up box tank. A diagonal run is worked as a diagonal, with no claim
  about bending practice.
- **Your shelf is unchanged.** Everyday maths' "Geometry and measurement" comes from the same
  Brilliant course as this one (notes 1.1). Keeping, merging or dropping it is your call.

## 1. The overall topic
How much flat space a shape covers, and how much a solid holds:
- area by counting unit squares, then by rule
- circles, for a conductor's cross-section and a pipe
- why area units scale by 100 and 10,000, not 10 and 100
- Pythagoras for a diagonal
- volume in m³ and litres, for a tank

**It builds on:**
- Fractions: a triangle is half a rectangle.
- Proportional reasoning: scaling and π as a ratio.
- Solving equations: rearranging for a radius or a side, and the square root as the undo of a
  square (lesson 6).
- The coordinate plane: distance along a gridline. Lesson 5 adds the diagonal.

**Left for later:**
- angles in shapes, and trigonometry (the Trigonometry course)
- pyramids, cones and spheres
- arc length
- surface area beyond a box and a cylinder

## 2. The lessons, in the order they build
| # | Lesson | The skill Dan leaves with |
|---|---|---|
| 1 | Area from unit squares | Count unit squares, then length × width. A triangle is half a rectangle, using the height at right angles to the base. Perimeter against area on the same shape: "add for perimeter", "multiply for area" (NCETM, notes 3.2). |
| 2 | Circles | Circumference and area from the radius, halving a diameter first. A ring's area (an annulus, an MCA GES I line). A round wire's cross-section from πr². A wire's cross-section grows with the square of its diameter (NIST, notes 2.1). |
| 3 | Square units and scaling | 1 cm² is 100 mm² and 1 m² is 10,000 cm², seen by drawing the unit square (Bitesize, notes 2.1 and 3.1). Cable sizes come in mm² (Nexans, IEC 60228). Doubling a side makes four times the area. |
| 4 | Pythagoras | Squares on the sides of a right-angled triangle. Find the hypotenuse, which is always opposite the right angle, or a shorter side. Use the square root to undo the square. It holds only for right-angled triangles (Bitesize, notes 3.5). |
| 5 | Pythagoras at work | A rectangle's diagonal, a diagonal run across a room, the distance between two grid points (from The coordinate plane), and a 3D diagonal (Bitesize: "can be applied to solve 3-dimensional problems"). |
| 6 | Volume and litres | Volume of a box or cylinder is base area × length. 1 m³ = 1000 L from unit cubes (NIST), with a litre as a 10 cm cube. A tank's sounding table (sourced as an idea, worked with an example box tank). Mass from volume and density (MCA GES I). The surface area of a box from its net. |

## 3. Can it be taught mostly visually, through interaction?
Yes, throughout.
- **Unit squares:** drag a rectangle's corner and the squares fill, so length × width counts them.
  Cut a triangle from its rectangle and watch the two halves match.
- **The circle:** cut it into wedges and open them into a rough rectangle, πr long and r tall
  (NCTM, notes 3.6). Drag the radius and watch the area grow by its square.
- **The unit square:** a 1 cm square splits into 10 × 10 one-millimetre squares, 100 of them. The
  1 m square does the same with 100 × 100 squares, 10,000 of them. That shows the "only 100" slip.
- **Squares on the sides:** pieces of the two small squares move into the big one, as on NASA's page
  (notes 3.6). If the angle is not a right angle, they visibly do not fit.
- **Unit cubes:** a 10 cm cube is a litre, and a thousand of them make a cubic metre.
- **Colour as before:** ink for shapes, a light tint for the area being counted, red only for a
  slip, and green only for finished.

## 4. What else
- **Benchmark (notes 1).**
  - Brilliant's Geometry and Measurement (25 lessons, 8 levels) runs angles, perimeter, scaling,
    area, Pythagoras, surface area, then volume, and asks for Solving Equations first.
  - Khan, Bitesize and NCETM build area from unit squares and volume from unit cubes, and put
    Pythagoras after area.
- **His aim (notes 2.4).**
  - MCA GES I has a geometry and mensuration section: "Solve problems on the area of an annulus of
    a circle", "Determine the mass of an object from its volume and density", and surface area and
    volume of solids.
  - Pearson's HN maths unit and SQA's HN unit assume these basics on entry.
- **Where it is used (each cited before a lesson uses it).**
  - Conductor sizes in mm² (Nexans; IEC 60228 sets the nominal areas). A stranded conductor's
    nominal area is not πr² of its outside diameter, so πr² is worked on a round solid wire only.
  - The litre and the cubic metre (NIST, BIPM).
  - Sounding tables and ullage (Tokyo University of Marine Science and Technology course notes; US
    Naval Institute Proceedings).
- **The mistakes to catch, each with a puzzle and its own hint.**
  - **Lesson 3, area units:** "A common misconception would be that 100 cm² are needed because 1
    metre is 100 centimetres" (Bitesize, notes 3.1). The same slip happens with volume.
  - **Lesson 1, perimeter and area:** muddling the two (NCETM, ERIC, notes 3.2).
  - **Lesson 2, radius and diameter:** using the diameter where the radius is needed (NCTM names
    "Difficulty using the variables C, d, and r", notes 3.3).
  - **Lesson 1, the triangle's height:** using a sloping side instead of the height at right
    angles. Bitesize works one, where "The longest side of 41 mm is not used" (notes 3.4). This is
    taught as the rule, not as a named common mistake.
  - **Lesson 4, the wrong sides:** adding the wrong sides in Pythagoras. It is UNCONFIRMED as a
    named mistake, so it is a puzzle with a hint, not a cited one.
- **Size and cost.** Six lessons of about 12 screens on the agreed settings, at about 1M tokens a
  lesson, so about 6M. Add about 0.3M for the plan and research, which start from this brief's 24
  saved search results.
