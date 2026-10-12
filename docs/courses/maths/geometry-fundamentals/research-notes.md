# Geometry fundamentals: research notes

Written 12 Oct 2026 for the course brief (RUNBOOK section 0). Every quote below is word for word from a tool result and was checked by `node tools/eval/sources.mjs` (92 quotes, 0 failed). The tool results are saved in `tools/`. Entries are generated from `quotes.json`, so the two files agree. Anything marked UNCONFIRMED could not be sourced from an original publisher in this run. Lines marked "Inference" are my reading of the sources or plain arithmetic, not a statement by them.

Run size: 15 searches and 10 fetches (one fetch returned a 404, one was a wrong guess at an SQA unit and is not used). That is more than the 10-12 asked, because the qualification lines and the mistakes needed a second pass.

## 1. Benchmark: how others order angles, perimeter, area, unit conversion, Pythagoras, volume and surface area

### 1.1 Brilliant, Geometry and Measurement (the same course as "Geometry Fundamentals")

Roadmap reference [16] is the page `brilliant.org/courses/geometry-fundamentals`. Its title is "Geometry and Measurement". So "Brilliant's Geometry Fundamentals" and "Brilliant's Geometry and Measurement" are one course, with 25 lessons in 8 levels. The Everyday maths shelf entry (roadmap ref [25]) is built from the same course.

The order is: angles, then perimeter and circumference, then scaling lengths, then area (circle included, and scaling areas), then Pythagoras, then surface area, then volume. There is no lesson called unit conversion in the list (Inference, from the list; the nearest are "Scaling Areas" and "Scaling Lengths"). Pythagoras sits before surface area and volume, because its surface-area level has pyramids and cones (Inference: a cone's slant needs Pythagoras).

- Brilliant's Geometry and Measurement is 25 lessons and 215 exercises (the page at the geometry-fundamentals address)
  - Source: Practice Geometry and Measurement | Brilliant, <https://brilliant.org/courses/geometry-fundamentals>
  - Quote: "Start exploring geometry with an intuitive introduction to the essentials. 25 Lessons 215 Exercises"
- Levels 1-2 are angles: in polygons first, then made by lines, parallel lines, triangle sides and angles
  - Source: Practice Geometry and Measurement | Brilliant, <https://brilliant.org/courses/geometry-fundamentals>
  - Quote: "Level 1 Polygons Angles in Polygons Exterior and Interior Angles Polygon Angle Relationships Level 2 Angles Angles Made by Lines Parallel Lines Triangle Sides and Angles"
- Levels 3-4 are perimeter and circumference, then scaling lengths, before any area
  - Source: Practice Geometry and Measurement | Brilliant, <https://brilliant.org/courses/geometry-fundamentals>
  - Quote: "Level 3 Lengths Perimeters Circumference Arc Length Level 4 Scaling Scaling Shapes Scaling Lengths"
- Level 5 is area, including circle areas and scaling areas
  - Source: Practice Geometry and Measurement | Brilliant, <https://brilliant.org/courses/geometry-fundamentals>
  - Quote: "Level 5 Areas Reasoning About Area Polygon Areas Circle Areas Scaling Areas"
- Level 6 is Pythagoras, after area; level 7 surface area and level 8 volume come last
  - Source: Practice Geometry and Measurement | Brilliant, <https://brilliant.org/courses/geometry-fundamentals>
  - Quote: "Level 6 Pythagoras' Geometry The Pythagorean Theorem Pythagorean Triples Squares and Roots Special Right Triangles Applications"
- Surface area (level 7) comes before volume (level 8) in Brilliant
  - Source: Practice Geometry and Measurement | Brilliant, <https://brilliant.org/courses/geometry-fundamentals>
  - Quote: "Level 7 Surface Area Surface Area Surface Area Shortcut Pyramids and Cones Level 8 Volume Volume Pyramids and Cones"
- The course description names its topic areas
  - Source: Practice Geometry and Measurement | Brilliant, <https://brilliant.org/courses/geometry-fundamentals>
  - Quote: "This fundamentals course will introduce you to angle axioms, perimeter and area calculation strategies, coordinate geometry, 3D geometry, and more."
- Brilliant lists Solving Equations as the prerequisite
  - Source: Practice Geometry and Measurement | Brilliant, <https://brilliant.org/courses/geometry-fundamentals>
  - Quote: "You should have a basic understanding of algebra concepts covered in Solving Equations."
- A second page of the same course says what algebra is assumed (a variable for a square's side and area)
  - Source: Practice Geometry and Measurement | Brilliant, <https://brilliant.org/courses/geometry-fundamentals/areas/?lesson=calculating-area-6>
  - Quote: "use a variable to describe the relationship between the side length of a square and its area"
- Brilliant's own help page lists Geometry and Measurement as one of its four geometry courses (so it is the only Brilliant course on these skills)
  - Source: What math does Brilliant cover? | Brilliant, <https://brilliant.org/help/courses-and-curriculum/what-math-does-brilliant-cover/>
  - Quote: "Brilliant covers measurement, angles, area, circles, similarity, the Pythagorean theorem, surface area, volume, coordinate geometry, transformations, symmetry, and more advanced geometric reasoning across four courses."
- Brilliant's other geometry course, Geometric Thinking, assumes the area skills
  - Source: Practice Geometric Thinking | Brilliant, <https://brilliant.org/courses/basic-2d-geometry>
  - Quote: "This course is the perfect place to start (or continue) your exploration of geometry if you know how to measure angles and calculate the areas of rectangles, circles, and triangles"
- Geometric Thinking lists Geometry and Measurement as its prerequisite, so Geometry and Measurement is Brilliant's one course on these skills
  - Source: Practice Geometric Thinking | Brilliant, <https://brilliant.org/courses/basic-2d-geometry>
  - Quote: "Prerequisites * Geometry and Measurement"

### 1.2 Khan Academy

Khan builds area from counting unit squares, then rectangles, then triangles and circles. Volume starts from unit cubes. Metric unit conversion sits inside the volume unit. Khan's full Geometry course puts angles early (unit 2), area and perimeter at unit 7, volume and surface area at unit 8 and Pythagoras at unit 9, so Pythagoras comes after area and volume there. Its Basic geometry and measurement course puts area and perimeter first, angles third and volume sixth. Khan does volume before surface area; Brilliant does the reverse.

- Khan Academy's Geometry course orders units: angles, shapes, area and perimeter, volume and surface area, then Pythagoras
  - Source: Geometry (all content) | Khan Academy, <https://www.khanacademy.org/math/geometry-home>
  - Quote: "Unit 1 Lines Unit 2 Angles Unit 3 Shapes Unit 4 Triangles Unit 5 Quadrilaterals Unit 6 Coordinate plane Unit 7 Area and perimeter Unit 8 Volume and surface area Unit 9 Pythagorean theorem"
- Khan's Basic geometry and measurement course puts area and perimeter first, angles third, volume sixth
  - Source: Intro to area and perimeter | Basic geometry and measurement | Khan Academy, <https://www.khanacademy.org/math/basic-geo/basic-geo-area-and-perimeter>
  - Quote: "Unit 1 Intro to area and perimeter Unit 2 Intro to mass and volume Unit 3 Measuring angles Unit 4 Plane figures Unit 5 Units of measurement Unit 6 Volume"
- Khan's area unit starts with rectangles, then triangles and circles
  - Source: Area and perimeter | Geometry (all content) | Math, <https://www.khanacademy.org/math/geometry-home/geometry-area-perimeter>
  - Quote: "We’ll start with the area and perimeter of rectangles. From there, we’ll tackle trickier shapes, such as triangles and circles."
- Khan's area unit starts from counting unit squares
  - Source: Area and perimeter | Geometry (all content) | Math, <https://www.khanacademy.org/math/geometry-home/geometry-area-perimeter>
  - Quote: "Intro to area and unit squares (Opens a modal)"
- Khan's volume unit starts from rectangular prisms, built on unit cubes
  - Source: Volume and surface area | Geometry (all content) | Math | Khan Academy, <https://www.khanacademy.org/math/geometry-home/geometry-volume-surface-area>
  - Quote: "Measuring volume with unit cubes (Opens a modal)"
- Khan's volume unit includes unit conversion between metric units
  - Source: Volume and surface area | Geometry (all content) | Math | Khan Academy, <https://www.khanacademy.org/math/geometry-home/geometry-volume-surface-area>
  - Quote: "Conversion between metric units (Opens a modal)"
- Khan teaches Pythagoras with squares on the sides
  - Source: Pythagorean theorem | Geometry (all content) | Math, <https://www.khanacademy.org/math/geometry-home/geometry-pythagorean-theorem>
  - Quote: "Use area of squares to visualize Pythagorean theorem"

### 1.3 BBC Bitesize (KS3 and GCSE)

Bitesize has a KS3 article of its own on converting metric units for area and volume. It names the 100-versus-10,000 slip itself (see 3.1) and teaches the factor from a 1 m by 1 m square drawn in cm. Its GCSE Geometry and measure list runs perimeter, area, volume, surface area, then Pythagoras. For Pythagoras it draws a square on each side.

- Bitesize KS3 area-of-circles article: the formula uses the radius, which is half the diameter
  - Source: Area of circles - KS3 Maths - BBC Bitesize, <https://www.bbc.co.uk/bitesize/articles/zsp37p3>
  - Quote: "The formula for the area of a circle uses the radius. The radius of the circle is half of the diameter."
- Bitesize KS3 triangles: a triangle is half a rectangle, shown with paper and scissors
  - Source: Area of triangles - KS3 Maths - BBC Bitesize, <https://www.bbc.co.uk/bitesize/articles/zc4pk2p>
  - Quote: "This can be shown in diagrams and practically using paper and scissors."
- Bitesize KS3 triangles: base times perpendicular height, halved
  - Source: Area of triangles - KS3 Maths - BBC Bitesize, <https://www.bbc.co.uk/bitesize/articles/zc4pk2p>
  - Quote: "The area of a triangle is calculated by finding the length of the base, halving it, and then multiplying it by the perpendicular height."
- Bitesize KS3: converting units of area and volume is its own article, with the same-units rule
  - Source: Converting metric units for area and volume - KS3 Maths - BBC Bitesize, <https://www.bbc.co.uk/bitesize/articles/zncb9ty>
  - Quote: "When converting between units for an area calculation convert both dimensions (the length and width) to the required unit before finding the area."
- Bitesize: 1 m squared is 10,000 cm squared, worked from a 1 m by 1 m square
  - Source: Converting metric units for area and volume - KS3 Maths - BBC Bitesize, <https://www.bbc.co.uk/bitesize/articles/zncb9ty>
  - Quote: "One metre squared equals ten thousand centimetres squared."
- Bitesize: 1 m cubed is one million cm cubed
  - Source: Converting metric units for area and volume - KS3 Maths - BBC Bitesize, <https://www.bbc.co.uk/bitesize/articles/zncb9ty>
  - Quote: "One metre cubed equals one million centimetres cubed."
- Bitesize Scotland: the conversion numbers are squared for area and cubed for volume
  - Source: Units of area and volume - Converting units of area and volume - 3rd level Maths Revision - BBC Bitesize, <https://www.bbc.co.uk/bitesize/guides/z6qp2v4/revision/1>
  - Quote: "When converting between metric units of area and volume, the numbers you have to multiply or divide by need to be squared for area and cubed for volume."
- Bitesize: volume of a prism is cross-section area times length
  - Source: Surface area and volume of prisms - KS3 Maths - BBC Bitesize, <https://www.bbc.co.uk/bitesize/articles/zmkn3qt>
  - Quote: "The volume of a prism is the area of its cross-section multiplied by the length."
- Bitesize: surface area is in square units, built from nets and the areas of faces
  - Source: Surface area and volume of prisms - KS3 Maths - BBC Bitesize, <https://www.bbc.co.uk/bitesize/articles/zmkn3qt>
  - Quote: "Surface area is measured in square units, such as cm² and mm²."
- Bitesize GCSE Geometry and measure starts the list with perimeter of 2D and compound shapes
  - Source: Geometry and measure - GCSE Maths - BBC Bitesize, <https://www.bbc.co.uk/bitesize/topics/z8bksg8>
  - Quote: "Revise how to find the perimeter of 2D shapes and compound shapes."
- Then area of 2D and compound shapes
  - Source: Geometry and measure - GCSE Maths - BBC Bitesize, <https://www.bbc.co.uk/bitesize/topics/z8bksg8>
  - Quote: "Revise how to calculate the area of 2D shapes and compound shapes."
- Then volume of cylinders, cuboids and prisms, before surface area
  - Source: Geometry and measure - GCSE Maths - BBC Bitesize, <https://www.bbc.co.uk/bitesize/topics/z8bksg8>
  - Quote: "Revise how to find the volume of cylinders, cuboids and prisms, with interactive activities and a quiz."
- Bitesize GCSE Geometry and measure lists Pythagoras separately after area, volume and surface area
  - Source: Geometry and measure - GCSE Maths - BBC Bitesize, <https://www.bbc.co.uk/bitesize/topics/z8bksg8>
  - Quote: "Revise calculating the hypotenuse and a shorter side in a right-angled triangle, and how to prove a triangle is right-angled."
- Bitesize GCSE Pythagoras: draw a square on each side
  - Source: Pythagoras' theorem - Pythagoras' theorem - Eduqas - GCSE Maths Revision - Eduqas - BBC Bitesize, <https://www.bbc.co.uk/bitesize/guides/zpykmsg/revision/1>
  - Quote: "Draw a square on each side of a right-angled triangle. Calculate the area of each square."
- Bitesize KS3 Pythagoras: the two squares are added, then the square root is taken
  - Source: Pythagoras' theorem - Part 1 - KS3 Maths - BBC Bitesize, <https://www.bbc.co.uk/bitesize/articles/zf8mp9q>
  - Quote: "This will involve adding the two squares and finding the square root of the answer."

### 1.4 NCETM, Oak National Academy and NIST

NCETM's KS3 framework has perimeter, area and volume as one block, and Pythagoras in Year 9. Oak's Year 8 unit builds circles, prisms and volume on Year 7 perimeter and area. NIST's Office of Weights and Measures says to teach length, then area, then volume, in that order. I did not find a source in this run for where Oak or NCETM place angles relative to area (not established).

- NCETM's KS3 framework puts Pythagoras in Year 9, after perimeter, area and volume
  - Source: Place Cursor Here To Add Recipient' Name, <https://www.ncetm.org.uk/media/oagj2ka2/curriculum-framework-for-ks3-april-2021.pdf>
  - Quote: "6.1.3 Understand and use Pythagoras' theorem (p9)"
- NCETM's KS3 framework has volume with perimeter and area in one block
  - Source: Place Cursor Here To Add Recipient' Name, <https://www.ncetm.org.uk/media/oagj2ka2/curriculum-framework-for-ks3-april-2021.pdf>
  - Quote: "6.2.3 Understand the concept of volume and use it in a range of problem-solving situations (p12)"
- Oak's Year 8 unit builds on Year 7 perimeter and area, then circles, prisms and volume
  - Source: Perimeter, area and volume KS3 | Y8 Maths | Lesson Resources | Oak National Academy, <https://www.thenational.academy/teachers/programmes/maths-secondary-ks3/units/perimeter-area-and-volume/lessons>
  - Quote: "extends this knowledge to focus on circles and circle based composite shapes then extending to look at the concept of prisms and volume"
- Oak's unit includes surface area of cuboids
  - Source: Perimeter, area and volume KS3 | Y8 Maths | Lesson Resources | Oak National Academy, <https://www.thenational.academy/teachers/programmes/maths-secondary-ks3/units/perimeter-area-and-volume/lessons>
  - Quote: "Surface area of cuboids I can appreciate the concept of surface area and find the surface area of cuboids."
- NCETM Year 6 order: parallelogram, then triangle
  - Source: Area, perimeter, position and direction | NCETM, <https://www.ncetm.org.uk/classroom-resources/cp-year-6-unit-6-area-perimeter-position-and-direction>
  - Quote: "Pupils explain how to calculate the area of a parallelogram"
- NIST's metric teaching guide: teach length, area and volume in that order
  - Source: Table of Contents, <https://www.nist.gov/system/files/documents/2017/05/09/commercialindustrialresidentialelectricity.pdf>
  - Quote: "Exercises should be followed in the order given to best show the relationship between length, area, and volume."

### 1.5 What the benchmark says is core

The sources agree on this chain: unit squares, then area of a rectangle, then triangle and circle, then volume from unit cubes, with Pythagoras as its own late topic. They differ on two things.

- **Pythagoras before or after volume.** Brilliant puts it before surface area and volume (level 6 of 8). Khan, Bitesize GCSE and NCETM put it after area and volume. Either order works; Brilliant's is needed if cones and pyramids come in.
- **Surface area before or after volume.** Brilliant: surface area first. Khan: volume first.

Unit conversion for area and volume is not a lesson in Brilliant's list, but is a named topic in Bitesize and Khan, and is the mistake the roadmap singles out (3.1). Angles are a full unit or two in Brilliant and Khan, but are assumed in the Higher National entry (SQA: National 5 maths) and are not an area or volume skill. Circles, area and unit scaling are the skills every source teaches and the qualification lines name.

## 2. Usefulness for Dan

### 2.1 A conductor's cross-section in mm2, and why 1 mm2 is 10^-6 m2

**Sourced.** Cable makers (Nexans, Prysmian) give a conductor's size as a nominal cross-section in mm², from 1.5 mm² up. IEC 60228 is the standard that sets those nominal sizes. The Bureau of Standards copper wire tables (NIST's predecessor, now on nvlpubs.nist.gov) say cross section varies with the square of the diameter, and define d in mm and s in square mm for a round wire. Bitesize gives A = πr² (with the radius, not the diameter). Prysmian's datasheet marks the small sizes as "Class 1 = solid" (stranded wire is the other class).

**Inference, not a maker's statement.** For a solid round conductor, area = π × (d ÷ 2)², so a 1.5 mm² conductor has d = 2 × √(1.5 ÷ π), about 1.38 mm. No manufacturer page in this run states that diameter, so the lesson would show it as computed from the rule, never as a cited figure. For stranded cable the nominal area is the total copper area of the strands, so πr² of the outside diameter would overstate it. This is UNCONFIRMED from a maker; the course should use solid conductors.

**Why 1 mm² is 10⁻⁶ m².** No original publisher in this run states "1 mm² = 10⁻⁶ m²" in those words, so that exact sentence is UNCONFIRMED. The method is sourced: Bitesize draws the square, uses 1 cm = 10 mm so 1 cm² = 100 mm², and gives the rule that the factor is squared for area. Applying the same method to 1 m = 1000 mm gives 1 m² = 1 000 000 mm², so 1 mm² = 10⁻⁶ m² (Inference, arithmetic). NIST's "litre as 1 m² area 1 mm deep" picture links the two ideas.

- Cable makers specify conductor size as a cross-section in mm2 (Nexans range 1.5 to 300 mm2)
  - Source: Nexans - 2-CORE XLPE,SWA,PVC SHEATHED CABLES AS PER IEC60502-1, <https://www.nexans.qa/en/Products/EnergyCables/Infrastructure/LowVoltageCablesIECStandards/2COREXLP34533.html>
  - Quote: "Conductor cross-section 1.5 mm² 2.5 mm² 4 mm² 6 mm² 10 mm² 16 mm² 25 mm² 35 mm²"
- IEC 60228 is the standard that sets those nominal cross-sectional areas
  - Source: IEC 60228:2023 | IEC, <https://webstore.iec.ch/en/publication/71891>
  - Quote: "IEC 60228:2023 specifies the nominal cross-sectional areas, in the range 0,5 mm2 to 3 500 mm2, for conductors in electric power cables and cords of a wide range of types."
- Prysmian datasheet lists nominal cross sections 1.5, 2.5, 4 mm2 with conductor resistance per km
  - Source: DataSheet - Prysmian Corporate, <https://datasheet.prysmian.com/pdf/datasheet/en-GB/312422>
  - Quote: "2 1.5 Class 1 = solid 1 4.7 8.6 73 12.1 171"
- The Bureau of Standards (NIST's predecessor): resistance, mass and cross section vary with the square of the diameter
  - Source: Circular of the Bureau of Standards no. 31 4th edition: copper wire tables, <https://nvlpubs.nist.gov/nistpubs/Legacy/circ/nbscircular31e4.pdf>
  - Quote: "The resistance, mass, and cross section vary with the square of the diameter"
- The same publication defines d in mm and s as cross section in square mm for a round wire
  - Source: Circular of the Bureau of Standards no. 31 4th edition: copper wire tables, <https://nvlpubs.nist.gov/nistpubs/Legacy/circ/nbscircular31e4.pdf>
  - Quote: "d=diameter in mm, at 20° C, for a round wire."
- Bitesize: circle area is pi times the radius squared
  - Source: Area of circles - KS3 Maths - BBC Bitesize, <https://www.bbc.co.uk/bitesize/articles/zsp37p3>
  - Quote: "The formula for the area of a circle is used by multiplying π by the square of the radius."
- DfE GCSE Engineering lists area of a circle, cuboid volume, and stress and pressure as force over area among formulae students must recall
  - Source: [PDF] Engineering - GCSE subject content - GOV.UK, <https://assets.publishing.service.gov.uk/media/5a801b1740f0b623026918c9/Engineering_GCSE_formatted.pdf>
  - Quote: "students should be able to recall correctly and apply the following formulae using standard SI units"
- DfE GCSE Engineering names stress as force over cross-sectional area
  - Source: [PDF] Engineering - GCSE subject content - GOV.UK, <https://assets.publishing.service.gov.uk/media/5a801b1740f0b623026918c9/Engineering_GCSE_formatted.pdf>
  - Quote: "Stress = force/cross-sectional area"
- Why 1 mm2 is 10^-6 m2: Bitesize shows the unit-square method for 1 cm = 10 mm (1 cm2 = 100 mm2); the same method with 1 m = 1000 mm gives 1 000 000 mm2 (inference)
  - Source: Converting metric units for area and volume - KS3 Maths - BBC Bitesize, <https://www.bbc.co.uk/bitesize/articles/zncb9ty>
  - Quote: "1 cm = 10 mm. 1 cm² = 10 mm x 10 mm = 100 mm². Conversion factor is 100"

### 2.2 Tank capacity in m3 and litres; sounding tables

**Sourced.** The cubic metre is the SI unit of volume; the litre is a special name for the cubic decimetre (NIST, BIPM). NIST's Office of Weights and Measures table lists 1000 L = 1 m³ and shows the litre as a 10 cm cube. A ship's tank has its own sounding table that gives the volume for each sounding and ullage (Tokyo University of Marine Science and Technology course notes; US Naval Institute Proceedings defines sounding and ullage).

**UNCONFIRMED.** Roadmap reference [13] is Marine Insight, a trade-news site, not an original publisher, so I did not use it. I found no ship's real sounding table from an original publisher (the tables in the results were on Scribd, a terminal's PDF or a blog). So no real tank figures can be cited. The lesson can use a made-up rectangular tank, labelled as an example, with V = L × B × depth from the cuboid volume rule (which Bitesize and the DfE formulae list both cover). A real tank is not a box, which is why ships use tables (Inference).

- NIST: the litre is a special name for the cubic decimetre
  - Source: NIST Guide to the SI, Chapter 8 | NIST, <https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-8>
  - Quote: "The liter (L) is a special name for the cubic decimeter (dm 3 )"
- BIPM: the litre is 1 dm3
  - Source: A concise summary of the International System of Units, SI, <https://www.bipm.org/documents/20126/41483022/SI-Brochure-9-concise-EN.pdf/2fda4656-e236-0fcb-3867-36ca74eea4e3>
  - Quote: "volume litre L or l 1 L = 1 dm 3"
- NIST OWM table: 1000 dm3 is a cubic metre and 1000 L is 1 m3
  - Source: SI Units - Volume | NIST, <https://www.nist.gov/pml/owm/si-units-volume>
  - Quote: "1000 L | = 1 m ³"
- NIST OWM: a 10 cm cube is 1 L (unit cube model)
  - Source: SI Units - Volume | NIST, <https://www.nist.gov/pml/owm/si-units-volume>
  - Quote: "a 10 cm × 10 cm × 10 cm cube has a volume of 1 000 cm or 1 L"
- NIST OWM: a litre is a layer 1 mm deep over 1 m2
  - Source: SI Units - Volume | NIST, <https://www.nist.gov/pml/owm/si-units-volume>
  - Quote: "1 m ² area that 1 mm deep"
- A ship's tank has its own sounding table giving volume against sounding and ullage (university course notes)
  - Source: Tank Sounding Tanks usually have automatic level gauges ..., <https://www2.kaiyodai.ac.jp/~takagi/ime/0503_tank_sounding.pdf>
  - Quote: "Each tank comes with its own sounding table, which indicates the volume of liquid inside the tank for the whole range of sounding and ullage"
- US Naval Institute Proceedings: what a sounding and an ullage are
  - Source: Notes on the Measurement of Fuel Oil | Proceedings - November 1926 Vol 52/11/285, <https://www.usni.org/magazines/proceedings/1926/november/notes-measurement-fuel-oil>
  - Quote: "In measuring oil, a sounding is the distance that the surface of the oil is above the bottom of the tank, and an ullage is the distance that the surface is below the top of the tank."

### 2.3 Pythagoras for an offset or a diagonal run

**UNCONFIRMED from an original publisher.** Roadmap reference [14] is Open Exam Prep, a training provider, so it is excluded. I found no code body, standard or maker manual in this run that uses Pythagoras for a conduit offset. What I did find, from an individual author's page (electrician2.com, Gerald Newton), says the distance between bends comes from the cosecant of the bend angle and gives the multiplier table. That is trigonometry, which waits for its own course.

**Inference.** The 45° multiplier of about 1.4 is the diagonal of a square, √2 = 1.414, which Pythagoras gives directly. The 30° multiplier of 2.0 is not Pythagoras (it needs sine). So "Pythagoras at work" can honestly use the diagonal of a rectangle, a 3D diagonal (Bitesize says the theorem applies in 3D), a straight run across a floor and a 45° offset, but should not claim it is how conduit tables are made. The coordinate-plane course will have taught the grid-distance form. DfE's GCSE Engineering content lists square roots among the required skills.

- Offset distance between bends is the offset height times a multiplier that comes from the cosecant of the angle (trigonometry, not Pythagoras)
  - Source: offset, <http://electrician2.com/electa1/offset.html>
  - Quote: "The distance between bends found by multiplying the height of the offset by the cosecant of the angle is a method given in many popular handbooks, manuals, and references."
- The multipliers by angle
  - Source: offset, <http://electrician2.com/electa1/offset.html>
  - Quote: "This is where the multipliers of 6 for 10 degrees, 2.6 for 22.5 degrees, 2.0 for 30 degrees, 1.4 for 45 degrees, and 1.2 for 60 degrees come from."
- Bitesize says Pythagoras extends to 3D problems (the diagonal of a box)
  - Source: Pythagoras' theorem - Pythagoras' theorem - Eduqas - GCSE Maths Revision - Eduqas - BBC Bitesize, <https://www.bbc.co.uk/bitesize/guides/zpykmsg/revision/1>
  - Quote: "Pythagoras’ theorem can be applied to solve 3-dimensional problems."
- DfE GCSE Engineering lists Pythagoras among required maths skills
  - Source: [PDF] Engineering - GCSE subject content - GOV.UK, <https://assets.publishing.service.gov.uk/media/5a801b1740f0b623026918c9/Engineering_GCSE_formatted.pdf>
  - Quote: "calculate squares and square roots"

### 2.4 The qualification lines

**MCA General Engineering Science I (gov.uk).** Section 1.5 "Geometry and mensuration" has four lines: annulus area, mid-ordinate area, surface area and volume of cylinder, pyramid, cone and sphere, and mass from volume and density. A mechanics line adds force, area and pressure. There is no Pythagoras line in the text I fetched (a fetch returned only part of the page, so a missing line is not proof). The curved solids go beyond a cuboid and a basic cylinder: that is the surface-area-and-volume core.

**Pearson HN Unit 4002 (2024 descriptors).** Its criteria start with dimensional analysis and move to progressions, trigonometric and hyperbolic functions, statistics, sinusoids, vectors and calculus. No area, volume or Pythagoras line appears, so Pearson assumes them. Volume appears later in other units (4024 pneumatics, 5003 volumetric strain).

**SQA HN Engineering Mathematics 1.** Recommended entry is National 5 maths, so shapes and Pythagoras are assumed. The unit teaches vector magnitude by an equation (the distance formula, which is Pythagoras).

**Not found:** a Pythagoras line in the MCA syllabus I fetched, and a Pearson line on area or volume. Both UNCONFIRMED.

- MCA GES I has a Geometry and mensuration section: annulus area
  - Source: General Engineering Science I Written Examination Syllabuses - GOV.UK, <https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses>
  - Quote: "Solve problems on the area of an annulus of a circle."
- MCA GES I: surface area and volume of cylinder, pyramid, cone and sphere
  - Source: General Engineering Science I Written Examination Syllabuses - GOV.UK, <https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses>
  - Quote: "Solve problems relating to the surface area and volume of cylinder, pyramid, cone and sphere."
- MCA GES I: mass from volume and density
  - Source: General Engineering Science I Written Examination Syllabuses - GOV.UK, <https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses>
  - Quote: "Determine the mass of an object from its volume and density."
- MCA GES I: force, area and pressure
  - Source: General Engineering Science I Written Examination Syllabuses - GOV.UK, <https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-i-written-examination-syllabuses>
  - Quote: "Solve problems involving force, area and pressure."
- Pearson HN Unit 4002 first pass criterion is dimensional analysis (units), with no area or volume line
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024), <https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf>
  - Quote: "P1 Apply dimensional analysis techniques to solve complex engineering/manufacturing problems."
- Pearson 4002 builds sinusoidal and vector work on top (so right triangles are assumed)
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024), <https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf>
  - Quote: "P7 Use appropriate methodology to determine engineering parameters of data represented in vector form."
- Pearson Unit 4024 uses volume change in pneumatic systems
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024), <https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf>
  - Quote: "P1 Calculate the change in volume and pressure in pneumatic systems."
- Pearson Unit 5003 uses volumetric strain
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024), <https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf>
  - Quote: "P3 Determine the volumetric strain and change in volume due to three-dimensional loading."
- SQA HN Engineering Mathematics 1 assumes National 5 maths as the entry (so shapes and Pythagoras are assumed, not taught)
  - Source: national unit specification: general information, <https://www.sqa.org.uk/files/hn/H7K033.pdf>
  - Quote: "a pass at Intermediate 2 or National 5 in Mathematics"
- SQA HN Engineering Mathematics 1 teaches the magnitude of 2-D vectors by an equation (the Pythagoras / distance formula)
  - Source: national unit specification: general information, <https://www.sqa.org.uk/files/hn/H7K033.pdf>
  - Quote: "Calculate the magnitude of 2-dimensional vectors using the equation"

## 3. Teaching: the common mistakes and the visual models

### 3.1 Mistake: area and volume units scale by the length factor squared or cubed

Bitesize (an original publisher) names this exactly: 1 m is 100 cm but 1 m² is not 100 cm², it is 10,000 cm²; 1 m³ is 1,000,000 cm³. Roadmap reference [15] (Clegg and Collins, STEM Learning) could not be fetched in this run (the address returned 404), so its quote is UNCONFIRMED here; Bitesize covers the same point and is used instead. The same page gives the fix: draw the 1 m square labelled in cm, 100 by 100.

- Bitesize names the area-unit slip: treating m to cm and m2 to cm2 as the same conversion
  - Source: Converting metric units for area and volume - KS3 Maths - BBC Bitesize, <https://www.bbc.co.uk/bitesize/articles/zncb9ty>
  - Quote: "A common misconception could be when someone thinks that the conversion between two different lengths would be the same conversion between two different areas."
- Bitesize: the specific wrong answer for 1 m2 in cm2
  - Source: Converting metric units for area and volume - KS3 Maths - BBC Bitesize, <https://www.bbc.co.uk/bitesize/articles/zncb9ty>
  - Quote: "A common misconception would be that 100 cm² are needed because 1 metre is 100 centimetres."
- Bitesize names the same slip for volume
  - Source: Converting metric units for area and volume - KS3 Maths - BBC Bitesize, <https://www.bbc.co.uk/bitesize/articles/zncb9ty>
  - Quote: "A common misconception would be that there would be 100 because 1 metre is 100 centimetres."

### 3.2 Mistake: confusing perimeter and area

NCETM and a peer-reviewed study both name it. Two tasks fix it in the NCETM material: same perimeter with different areas, and same area with different perimeters (the second is in the same NCETM Year 6 unit, not quoted).

- NCETM Year 7: students over-simplify to add for perimeter and multiply for area
  - Source: Teaching perimeter and area in Year 7 using NCETM Checkpoints | NCETM, <https://www.ncetm.org.uk/features/teaching-perimeter-and-area-in-year-7-using-ncetm-checkpoints>
  - Quote: "Working with area and perimeter simultaneously will allow you to assess whether students are still confusing the two concepts."
- NCETM Year 7 checkpoint 9 names the over-simplified ideas
  - Source: Teaching perimeter and area in Year 7 using NCETM Checkpoints | NCETM, <https://www.ncetm.org.uk/features/teaching-perimeter-and-area-in-year-7-using-ncetm-checkpoints>
  - Quote: "‘add for perimeter’ and ‘multiply for area’"
- Research article: area and perimeter confusion in Grade 10 learners (Pythagoras journal, 2016)
  - Source: ERIC - EJ1209134 - The Concepts of Area and Perimeter: Insights and Misconceptions of Grade 10 Learners, Pythagoras, 2016, <https://eric.ed.gov/?id=EJ1209134>
  - Quote: "Learners also hold misconceptions about the relationship between area and perimeter."
- NCETM Year 6 has pupils explain same perimeter with different area, the cure for the confusion
  - Source: Area, perimeter, position and direction | NCETM, <https://www.ncetm.org.uk/classroom-resources/cp-year-6-unit-6-area-perimeter-position-and-direction>
  - Quote: "Pupils explain why shapes can have the same perimeters but different areas"

### 3.3 Mistake: radius against diameter in the circle formulas

NCTM lists difficulty with C, d and r. Bitesize's worked example gives the diameter and halves it first. That using the diameter in πr² makes the area 4 times too big is arithmetic ((2r)² = 4r², Inference); a source that names it as the common error was only on a content-farm page (geometryformulas.study), so the "most common error" claim itself is UNCONFIRMED.

- NCTM lists difficulty with C, d and r, and the parallelogram base being half the circumference, as circle-area misconceptions
  - Source: Circles Lesson 2 - National Council of Teachers of Mathematics, <https://www.nctm.org/Classroom-Resources/ARCs/Measures-of-Circles/Circles-Lesson-2>
  - Quote: "Difficulty using the variables C , d , and r"
- Bitesize worked example: the diameter is given, so halve it first
  - Source: Area of circles - KS3 Maths - BBC Bitesize, <https://www.bbc.co.uk/bitesize/articles/zsp37p3>
  - Quote: "The diameter of the circle is 12 m."

### 3.4 Mistake: using the slant side as a triangle's height

**UNCONFIRMED as a named mistake from an original publisher.** The only pages that named it (mathwords.com, geometryformulas.study) are not original publishers. Bitesize teaches the correct rule: the base and perpendicular height are at right angles, and it works through choosing which given sides are at right angles. The lesson can teach this as a puzzle without citing it as "common".

- Bitesize triangles: the longest side is not used because it is not at right angles to the others (base and perpendicular height are at right angles)
  - Source: Area of triangles - KS3 Maths - BBC Bitesize, <https://www.bbc.co.uk/bitesize/articles/zc4pk2p>
  - Quote: "The longest side of 41 mm is not used because it is not at right angles to either of the other two sides."
- Bitesize triangles: the base and perpendicular height are at right angles
  - Source: Area of triangles - KS3 Maths - BBC Bitesize, <https://www.bbc.co.uk/bitesize/articles/zc4pk2p>
  - Quote: "The base and the perpendicular height are at right angles to each other."

### 3.5 Mistake: Pythagoras with the wrong sides

Bitesize states the rules: the hypotenuse is opposite the right angle, the theorem only works for right-angled triangles, and the squares are added then the square root is taken. Lists of the mistakes themselves (calling the wrong side the hypotenuse; adding when a shorter side is missing; forgetting the square root) appeared only on teacher or tutoring sites (Mr Mathematics, Reko Study, Justin Math, a Stack Exchange forum, Eedi), none an original publisher. So "these are the common errors" is UNCONFIRMED. They follow from the rules above, so each can still be a puzzle that catches the slip, without a "commonly made" claim.

- Bitesize: the hypotenuse is always opposite the right angle
  - Source: Pythagoras' theorem - Pythagoras' theorem - Eduqas - GCSE Maths Revision - Eduqas - BBC Bitesize, <https://www.bbc.co.uk/bitesize/guides/zpykmsg/revision/1>
  - Quote: "The hypotenuse is always opposite the right angle."
- Bitesize: the theorem is only true for right-angled triangles
  - Source: Pythagoras' theorem - Part 1 - KS3 Maths - BBC Bitesize, <https://www.bbc.co.uk/bitesize/articles/zf8mp9q>
  - Quote: "Pythagoras’ theorem is only true for right-angled triangles."
- Bitesize: it does not matter which way round a and b are labelled (only the hypotenuse is fixed as c)
  - Source: Pythagoras' theorem - Part 1 - KS3 Maths - BBC Bitesize, <https://www.bbc.co.uk/bitesize/articles/zf8mp9q>
  - Quote: "It does not matter which way round 𝒂 and 𝒃 are labelled."

### 3.6 Visual models good teachers use

Unit squares and unit cubes (Bitesize, NIST's liter cube, Khan). Cut and rearrange: triangle as half a rectangle with paper and scissors (Bitesize); parallelogram then triangle (NCETM Year 6, in that order); circle cut into wedges and laid out as a rectangle with length half the circumference and height r (NCTM). Squares drawn on the sides of a right triangle, then cut and moved (NASA Glenn, Bitesize, Khan). NCETM warns that not all children grasp that area stays the same when a shape is cut and rearranged, so each cut-and-move screen should show the total area staying put.

- NCETM: area is conserved when a shape is cut and rearranged, but not all children grasp it
  - Source: [DOC] Misconceptions with the Key Objectives - NCETM, <https://www.ncetm.org.uk/media/cocnx0it/misconceptions-with-the-key-objectives2.doc>
  - Quote: "The conservation of area means that if a 2D shape is cut up and rearranged, its area is unchanged. However, it has been shown that not all children grasp this."
- Unit squares: Bitesize Scotland defines the square centimetre as the area inside a 1 cm square
  - Source: Units of area and volume - Converting units of area and volume - 3rd level Maths Revision - BBC Bitesize, <https://www.bbc.co.uk/bitesize/guides/z6qp2v4/revision/1>
  - Quote: "A square centimetre is the area within a square with sides of length"
- Unit cubes: Bitesize Scotland defines the cubic centimetre as the volume inside a 1 cm cube
  - Source: Units of area and volume - Converting units of area and volume - 3rd level Maths Revision - BBC Bitesize, <https://www.bbc.co.uk/bitesize/guides/z6qp2v4/revision/1>
  - Quote: "A cubic centimetre is the volume within a cube that has sides of length"
- Circle cut into wedges and laid out as a rectangle of length half the circumference and height r
  - Source: Circles Lesson 2 - National Council of Teachers of Mathematics, <https://www.nctm.org/Classroom-Resources/ARCs/Measures-of-Circles/Circles-Lesson-2>
  - Quote: "Students should realize that the length of the rectangle is equal to half the circumference of the circle , or πr."
- NASA: squares drawn on the three sides of a right triangle, then cut and moved into the hypotenuse square
  - Source: Pythagorean Theorem, <https://www.grc.nasa.gov/www/k-12/rocket/pythag.html>
  - Quote: "On the figure at the top of this page, we show squares drawn on the three sides of the triangle."
- NASA: the area of the square on the hypotenuse equals the sum of the other two squares
  - Source: Pythagorean Theorem, <https://www.grc.nasa.gov/www/k-12/rocket/pythag.html>
  - Quote: "We are going to break up the pieces of these two squares and move them into the grey square area on the hypotenuse."
- NIST: a litre as a 10 cm cube, the unit-cube model for volume units
  - Source: SI Units - Volume | NIST, <https://www.nist.gov/pml/owm/si-units-volume>
  - Quote: "The Liter Cube Model illustrates SI volume units, increasing by powers of ten."
- Bitesize: area of the largest square equals the sum of the other two (3-4-5 example)
  - Source: Pythagoras' theorem - Pythagoras' theorem - Eduqas - GCSE Maths Revision - Eduqas - BBC Bitesize, <https://www.bbc.co.uk/bitesize/guides/zpykmsg/revision/1>
  - Quote: "The area of the largest square is the sum of the area of the other two squares."

## 4. My view of the core lessons

Dan's cut is 5-6 lessons. The qualification lines (MCA GES I: annulus, surface area and volume of cylinders, pyramids, cones and spheres, density, force and pressure on an area; SQA and Pearson assume the basics) and his own uses (cable mm², tanks in m³ and litres, diagonal runs) point to the same short list. I suggest **six lessons**:

| # | Lesson | The skill Dan leaves with | Builds on |
|---|---|---|---|
| 1 | Area from unit squares | Count unit squares, then length × width; a triangle as half a rectangle; perimeter against area on the same shape. | Fractions (half), Proportional reasoning |
| 2 | Circles | Circumference and area from the radius, with the diameter-to-radius step; the area of a ring (annulus, an MCA line); a conductor's cross-section from πr². | Solving equations (rearranging for r) |
| 3 | Square units and scaling | Convert mm², cm², m² by drawing the unit square (1 m² is 10,000 cm², 1 mm² is 10⁻⁶ m²); doubling a side makes the area 4 times. | Proportional reasoning (scaling), Percentages |
| 4 | Pythagoras | Squares on the sides; find the hypotenuse or a shorter side; check a right angle; the square root as the undo of a square. | Solving equations (undo a square) |
| 5 | Pythagoras at work | A rectangle's diagonal, a diagonal run, a 3D diagonal, grid distance, a 45° offset. | The coordinate plane (grid distance) |
| 6 | Volume, litres and surface area | Volume of a prism or cylinder = base area × length; 1 m³ = 1000 L from unit cubes; surface area from a net; mass from volume and density. | Lessons 1-3 |

Left out of the six: angles on lines and in shapes (assumed at entry; the right angle is introduced inside lesson 4, and the trigonometry course will need angles properly), arc length, pyramids, cones and spheres (an optional last screen of lesson 6, or a seventh lesson), composite shapes (can be a puzzle inside lesson 1).

**Overlap with Everyday maths (roadmap "Things to settle" item 3).** The Everyday maths Geometry and measurement entry and this course come from one and the same Brilliant course (1.1). So they would teach the same skills twice. My view: keep this course as the tailored one, and either drop the Everyday entry or keep it only for what this course leaves out (angles, polygons, parallel lines, pyramids and cones). That is Dan's call.

**Cost.** The Solving equations brief measured about 1M tokens a lesson, so about 6M for six lessons, plus about 0.3M for the plan.

### Questions for Dan
1. **Angles.** Should angles be a lesson here (the roadmap's lessons 1 and 2), or taught inside Pythagoras and left for the Trigonometry course? I suggest the second.
2. **Overlap.** Keep both Geometry fundamentals and Everyday maths' Geometry and measurement, merge them, or drop one?
3. **Curved solids.** MCA GES I asks for the surface area and volume of pyramids, cones and spheres. Should they have their own seventh lesson, or one optional screen in lesson 6? Dan's route is not yet known to be the MCA route (roadmap "Things to settle" item 1).
4. **Real numbers.** I found no original-publisher figures for a real ship's sounding table or for a conduit offset. Are you happy with labelled example numbers (a made-up box tank, and a 45° offset worked from a diagonal), or do you have a real table or a bender manual to use?
