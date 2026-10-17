# Powers and roots: the course brief

Written 17 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
the fourth course in the Maths shelf's Algebra folder, "Fractional and negative powers, roots and
the rules that tie them together, with powers of ten and units." You asked for the whole Algebra
folder in one push (17 Oct), so I have taken the decisions for you and listed them below; change any
you like. Sources and quotes are in `research-notes.md` beside this file (139 quotes, every one
checked against the 53 saved tool results; section numbers below point there).

## The short version
**Seven lessons**
1. Powers and the three laws (built first)
2. Zero and negative powers
3. Roots and surds
4. Fractional powers
5. Powers of ten and prefixes
6. Units with powers
7. Powers in formulas

**The main pictures** (one per lesson, each moved with your finger):
- **Factor tiles (lesson 1).** A power drawn as a row of tiles, one tile for each time the base is
  used. Set the powers with steppers. Join two rows to multiply, set one row over another to
  divide and cross out pairs, or repeat a row to raise a power to a power. The count of tiles is the
  new power.
- **The staircase of powers (lesson 2).** 4³, 4², 4¹ drawn as 64, 16 and 4 unit squares. Step down
  and the picture divides by 4 each time: one square, then a square cut into 4 with one part
  shaded, then cut into 16. The amount shrinks but never goes below nothing.
- **A square and its side (lesson 3).** Drag the area of a square and its side reads the square
  root. Area 48 splits into a 4 by 4 grid of small squares of area 3, so the side is 4√3. Squares
  of 9 and 16 sit beside a square of 25: sides 3 + 4 against 5.
- **Equal steps on a power ladder (lesson 4).** Rungs 1, 8, 64, 512, each one "× 8" from the last.
  Split each step into equal smaller steps. Three equal steps make × 8, so each is × 2, and that
  is why 8^⅓ = 2.
- **Slide the digits (lesson 5).** A number on a place-value strip with a fixed decimal point.
  Change the power of ten and the digits slide past the point. A switch snaps it to standard form
  or to engineering notation, where the prefix (µ, m, k, M) appears.
- **Zoom into the unit (lesson 6).** One metre, one square metre or one cubic metre, with a prefix
  dial. Zoom in and the small units fill it. The readout writes (10⁻³ m)² = 10⁻⁶ m² as you go.
- **The factor dial (lesson 7).** Pick a law, such as P = I²R or the inverse square law. Drag the
  factor one quantity changes by, and a shape shows what happens to the other: a square for a
  power of 2, a cube for 3, light spreading over a patch for the inverse square.

**Decisions taken for you** (say if you want any changed):
- **Seven lessons.** Brilliant's Exponents and Radicals is 83 lessons (notes 1.1). The engineers'
  books are small: Bird gives powers 7 pages and units and prefixes 19, and HELM gives indices 19
  pages (notes 2.4, 8). The research suggests six, with a seventh if the roots lesson is too full
  (notes 8). It is: square roots, cube roots, surds and fractional powers will not fit 12 screens.
  So roots and surds are lesson 3 and fractional powers lesson 4. Six is possible by joining them.
  It would save about 1.1M tokens, but surds would get two or three screens.
- **Lesson 1 is built first, without a pause.** The runbook asks for a pilot you try before the
  rest. You asked for the folder in one push, so lesson 1 is built and checked first, and the
  others follow without waiting. You can try it on your phone as soon as it lands.
- **Steps lessons throughout ("Yes", RUNBOOK section 0, item 3).** About 12 screens each, SHOW then
  DO, with short sentences, ending on two or three mixed puzzles. Lesson 7's units sit in the
  picture's labels, not in extra words.
- **The laws come before zero and negative powers.** Bitesize, HELM and Bird do it this way (notes
  2.2, 2.3, 2.4). Brilliant does roots first, at levels 4 and 5, before any law (notes 1.1). Here,
  roots come after negative powers, because lesson 4 needs the multiplying law to show what a
  fractional power is (mathcentre, notes 4.5).
- **Zero and negative powers from the pattern, then checked by the law.** Both routes are in the
  sources. Run the pattern down, dividing by the base each step (mathcentre, notes 4.3), and
  divide a power by itself (Bitesize, OpenStax, notes 4.3). The pattern comes first, because it is
  the repair the research names for the "negative power gives a negative number" mistake (Sevgi
  and Kabalcı 2026, notes 6.1).
- **"Power" is the main word, with "index" named once.** Bitesize says "The power or index" (notes
  4.1), and the MCA syllabus says "Defines the term index (power)" (notes 3.3). Lesson 1 says both
  words mean the same thing, and that your college will say "indices" for more than one.
- **The √ sign means the positive root; x² = 36 has two answers.** This is taught as a convention.
  HELM writes 16^½ = ±4, while Bitesize gives √36 = 6, and calculators give one root (notes 4.4).
  Lesson 3 shows both and says which is which.
- **Surds only as far as you need them.** Three things: a surd is an exact value (√3 m), pull out
  a square factor (√48 = 4√3), and the root of a sum is not the sum of the roots (notes 4.6). No
  HN, MCA or Bird line asking for surds was found (UNCONFIRMED, notes 3.4). Rationalising the
  denominator is left out: it is on Pearson's A level list (notes 4.6), not an HN one.
- **Four prefixes in the puzzles: mega, kilo, milli, micro.** The full list (giga, nano, pico) is
  shown once, as Fiore's and BIPM's tables give it (notes 4.7). Centi is used in units such as cm³
  but is not engineering notation (MathWorld, SECONDARY, notes 4.7). One screen says so.
- **pV^n = C with n given.** Finding n from readings needs logarithms, which wait for Exponentials
  and logarithms (MCA 4.11 in the Straight-line graphs notes 3.1; notes 4.9). Here n is given.
  n = 1 is isothermal (WPI, notes 7.4) and other values are labelled example values.
- **Plotting y against x² is in lesson 7.** The Straight-line graphs brief hands this job here
  (its "Left for later courses"). The MCA asks to write "y = aX² + b in the form of a straight
  line" (MCA 4.10, Straight-line graphs notes 3.1, a SECONDARY host). It gets two screens.
- **Pump and fan laws are in, labelled with their source.** The US Department of Energy gives
  "power requirements vary with the cube of the pump speed" (notes 7.5). No marine syllabus line
  for them was found (UNCONFIRMED, notes 7.5), so the screen names its source and makes no ship claim.
- **0 to the power 0 is left alone.** How Brilliant treats it is UNCONFIRMED, and nothing you need
  depends on it (notes 1.1).
- **Example numbers are labelled.** Real constants are cited: standard atmospheric pressure is
  1.01325 × 10⁵ N/m² = 1.01325 bar (MCA Applied Heat, notes 3.3), so 1 bar is 10⁵ N/m². Currents,
  resistances, distances, speeds and values of n in the puzzles are example figures, said so on
  screen, or computed from a rule the screen shows.
- **Negative powers are ink, not red.** Red is kept for mistakes, so 10⁻³ and a shaded part below
  one are ink like anything else.
- **Your intake answers** (`intake.json`): to understand powers and roots and how to work with
  them; on the job and in everyday life; hands-on, with the why explained in full.

## 1. The overall topic
A power is a short way to write a number multiplied by itself: 2⁵ means five 2s multiplied. A root
undoes a power. This course builds the three laws that let you multiply, divide and stack powers
without writing them out. It then follows the laws to their answers for powers of zero, below zero
and between whole numbers, and shows that a fractional power is a root. It ends where an engineer
uses powers every day: powers of ten and the prefixes (mA, kV, MΩ), units with powers (mm², m³,
m s⁻², Ω m) and how to convert them, and the formulas where a power decides what happens, such as
P = I²R, the inverse square law and pV^n = C.

**It builds on:**
- **Negative numbers:** −3² = −9 but (−3)² = 9 (lesson 8), and brackets round a negative on the
  calculator (lesson 9).
- **Fractions:** reciprocals and "one over" for negative powers; fractions as powers in lesson 4.
- **Solving equations:** the square root as the undo of a square, and P = I²R to I = √(P ÷ R)
  (lesson 6).
- **Geometry fundamentals:** square and cube units, 1 cm² = 100 mm² by drawing (lesson 3), a wire's
  area growing with its diameter squared (lesson 2), Pythagoras (lesson 4), litres and cubic
  metres (lesson 6), and cable sizes in mm².
- **Proportional reasoning:** inverse proportion and Boyle's law (lesson 6), which is pV^n = C with
  n = 1.
- **Calculus fundamentals:** x² as the area of a square and x³ as the volume of a cube, xⁿ as n of
  the same number multiplied, and V⁻ⁿ as 1 ÷ Vⁿ, all taught inline there (its brief says "Indices
  properly wait" for this course). √2 and √3 in RMS values.
- **Straight-line graphs:** y = mx + c and laws from readings, for plotting y against x².

**Not taught again:** −a² against (−a)² and keying a negative into the calculator (Negative numbers
lessons 8 and 9). The square root as the undo of a square and rearranging P = I²R for I (Solving
equations lesson 6). 1 cm² = 100 mm² and 1 m³ = 1000 L by drawing (Geometry fundamentals lessons 3
and 6). Pythagoras (Geometry lesson 4). Inverse proportion and Boyle's law (Proportional reasoning
lesson 6). Each is used with a one-line reminder, and only what is new is taught.

**Taught inline, because you have not met them:** the words base and power (index); the
calculator's power key (^ or xʸ), cube root key, ×10ˣ (EXP) key, and putting a fractional power in
brackets; finding the biggest square factor of a number by trying 4, 9, 16, 25 and so on.

**Edges.** Real numbers only, whole-number bases mostly, and the formulas you will meet. No
logarithms, no graphs of power functions, no solving equations with a power in them beyond taking a
root.

**Left for later courses:**
- **Functions and their graphs:** the graphs of y = x², y = √x and y = 1/x, and domain and range
  (notes 5).
- **Quadratics and polynomials:** solving x² = c in general, factorising and the quadratic formula
  (notes 5). Lesson 3 only says x² = 36 has two answers.
- **Exponentials and logarithms:** logarithms and their laws (the MCA's "not directly examinable
  but such knowledge will be assumed", notes 3.3), finding n in pV^n = C from readings (MCA 4.11),
  log graphs, aˣ, e and growth and decay (SQA H7K0 33 Outcome 2, Pearson P3, notes 3.1, 3.2, 5).
  Brilliant's "Exponentials at Half-Steps" belongs there too (notes 1.2).
- **Trigonometry:** nothing here leads into it (notes 5).
- **Complex numbers:** the square root of a negative number (notes 5). This course uses real roots
  only.
- **Left out, not deferred:** rationalising denominators (above), 0⁰, and the power rule for
  negative and fractional powers. That rule is the one you have from Calculus fundamentals lesson
  4, and the notes advise against teaching it here (notes 5).

## 2. The lessons, in the order they build
The order follows the research's core (notes 8): Bird chapters 7 and 8, HELM 1.2 and the Bitesize
order, tested against the MCA and Applied Heat lines. Powers and the laws come first, then zero and
negative, then roots and fractional powers, then powers of ten, units and the formulas (notes 2.2
to 2.4).

| # | Lesson | What it teaches |
|---|---|---|
| 1 | Powers and the three laws | A power says how many times the base is used in a multiplication (Bitesize, notes 4.1). 2⁵ = 2 × 2 × 2 × 2 × 2 = 32, not 2 × 5, and 2³ is not 3² (Sevgi and Kabalcı, notes 6.1). Base and power (index) named (MCA 2.1.6, notes 3.3). Multiplying: write the factors out and count, 9³ × 9⁵ = 9⁸ (Bitesize, notes 4.2). Dividing: cross out matching factors, 8⁵ ÷ 8³ = 8² (Bitesize, notes 4.2). A power of a power: (a⁴)³ is three groups of four, a¹² (mathcentre, notes 4.2). The laws need the same base: 2³ × 3² is 72, not 6⁵ (Bitesize, notes 4.2). A bracket powers every factor inside it, (3x)² = 9x² (HELM, notes 4.2). The calculator's power key. |
| 2 | Zero and negative powers | Run the pattern down: 4³, 4², 4¹ are 64, 16, 4, and each step down divides by 4. So 4⁰ = 1, 4⁻¹ = ¼ and 4⁻² = 1/16 (mathcentre, notes 4.3). The dividing law agrees: n⁴ ÷ n⁴ = 1 and is n⁰ (Bitesize, OpenStax, notes 4.3). A negative power is "one over", a reciprocal, never a negative number (Bitesize, mathcentre, notes 4.3). The lesson 1 laws still hold: 10³ × 10⁻⁵ = 10⁻², and 1 ÷ x⁻² = x². Write an answer with positive powers, as an older SQA HN unit asks (notes 3.1). |
| 3 | Roots and surds | A square root is the side of a square of that area (Bitesize, notes 4.4, 4.6). A cube root is the edge of a cube of that volume, the opposite of cubing (Bitesize, notes 4.4). √ means the positive root, but x² = 36 has two answers, 6 and −6 (HELM, Bitesize, notes 4.4). A surd is an exact value: a 3 m² square has side √3 m, while 1.73 m is rounded (Bitesize, notes 4.6). Keeping surds avoids rounding errors (Bitesize, notes 4.6). Simplify by splitting out a square factor, √48 = √16 × √3 = 4√3 (HELM, notes 4.6). The root of a product splits, but the root of a sum does not: √(9 + 16) = 5, not 3 + 4 (HELM, notes 4.6). |
| 4 | Fractional powers | 4^½ × 4^½ = 4¹, so 4^½ is the number that times itself makes 4, which is √4 = 2 (mathcentre, notes 4.5). (8^⅓)³ = 8, so 8^⅓ is the cube root of 8 (HELM, notes 4.5). The bottom of the fraction is the root and the top is the power: 27^(5/3) = 3⁵ = 243 (Bitesize, mathcentre, notes 4.5). Root first keeps the numbers small, and power first gives the same answer (mathcentre, HELM, notes 4.5). A minus as well means "one over": 8^(−2/3) = ¼. The laws work with fractions: x^½ × x^(3/2) = x², adding the powers, not multiplying (For Dummies, SECONDARY, notes 6.5). A power such as 2^1.3 sits between 2¹ and 2², and is a calculator job, with the power in brackets. |
| 5 | Powers of ten and prefixes | Multiplying by 10ⁿ moves the digits n places, left when n is positive and right when it is negative (Bitesize, notes 4.7). Standard form is A × 10ⁿ with A from 1 up to (not including) 10 (Bitesize, notes 4.7). Engineering notation makes n a multiple of 3, and each multiple has a prefix: M is 10⁶, k 10³, m 10⁻³, µ 10⁻⁶ (Fiore, SECONDARY; BIPM; notes 4.7). 23,000 V is 23 kV (Fiore, notes 4.7). Multiply by adding the powers, so kilo times micro is milli (Fiore, notes 4.7), and divide by taking them away. Add only with the same power of ten (Bitesize, notes 4.7). Pick the prefix that puts the number between 0.1 and 1000 (NIST, notes 4.7). Megohm, not megaohm (NIST, notes 4.7). The ×10ˣ (EXP) key keeps the number together (Bitesize, notes 4.7). 1.01325 × 10⁵ N/m² is 1.01325 bar (MCA Applied Heat, notes 3.3). |
| 6 | Units with powers | A prefix and its unit are one symbol, and the power takes both: 1 mm² = (10⁻³ m)² = 10⁻⁶ m², and 2.3 cm³ = 2.3 × 10⁻⁶ m³ (NIST, Warsash refresher, notes 4.8). So an area conversion squares the length factor and a volume conversion cubes it (Bitesize, notes 4.8). Divided units take a minus power: m/s² is m s⁻² (NIST, notes 4.8). Derived units are products of powers: N = kg m s⁻², Pa = N/m² (BIPM, Warsash, notes 4.8). Resistivity is in Ω m, and R = ρL/A with a cable's area in mm² needs it in m² first (OpenStax, notes 4.8). The unit check: work the units through a formula, and kg/m² where kg/m³ was wanted shows a slip (Isaac Science, notes 4.8). |
| 7 | Powers in formulas | One question, "if this changes by a factor, what happens to that?", is answered by raising the factor to the power (notes 4.9). P = I²R: twice the current gives four times the heat (OpenStax, notes 7.1). A wire's area and resistance go with its diameter squared (NBS, notes 7.2). The inverse square law: twice as far gives a quarter, four times as far a sixteenth (OpenStax, Physics Classroom, notes 7.3). Pumps and fans: power goes with speed cubed, so 0.8³ ≈ 0.51, about half (US DoE, notes 7.5). pV^n = C: halve the volume and the pressure rises by 2ⁿ, with n given (WPI, Purdue, notes 7.4). Undo a power with a root to find the input. Plot y against x² and y = aX² + b is a straight line (MCA 4.10, Straight-line graphs notes 3.1). |

## 3. Can it be taught mostly visually, through interaction?
**Yes**, for all seven (RUNBOOK section 0, item 3). Every lesson is a steps lesson of about 12
screens, SHOW then DO, ending on two or three mixed puzzles. Each lesson has one main picture you
move with your finger, chosen because it shows the cause, not just the answer:
- **Lesson 1, factor tiles.** A power is a row of tiles, each tile one copy of the base, with the
  value written under the row. Steppers set each power. "Multiply" joins two rows end to end, and
  the tile count is the new power. "Divide" sets one row above the other and crosses out matching
  pairs. "Power of a power" repeats a row, making a grid of 4 columns by 3 rows. A base switch
  gives the second row a different base, hatched: the rows no longer merge into one base, so the
  law cannot be used. *Why this picture:* every source shows the laws by writing the factors out
  (Bitesize, mathcentre, notes 4.2). Students who make errors treat powers as plain multiplying
  and mix up adding and multiplying (Ulusoy 2019, notes 6.2). The tiles keep the two apart: the
  tiles are multiplied together, while their count is added. Weber found most students compute
  powers but few reason about the process (notes 6.3), and the tiles are that process.
- **Lesson 2, the staircase of powers.** A stepper runs the power from 3 down to −3, base 2, 3, 4
  or 10. At 4³ the picture is 64 unit squares, then 16, then 4, then one. Below that the single
  square is cut into 4 with one part shaded, then into 16 with one shaded, as the Fractions course
  draws a fraction. The sum beside it shows ÷ 4 at every step. *Why:* the repair the research
  names is to run the powers down "to the zero exponent and ... when a negative exponent is
  reached", which "shows that the sign ... remains unaffected" (Sevgi and Kabalcı 2026, notes
  6.1). The picture never goes below nothing, so a negative power cannot give a negative number.
  Base 10 leads straight to milli (10⁻³) in lesson 5.
- **Lesson 3, a square and its side.** Drag the corner of a square. Its area is the input and its
  side is read out as the root. Whole sides snap at 1, 4, 9, 16 and 25. Area 2 sits on the
  diagonal of a unit square, so √2 is a real length that no decimal ends. A "split" button tiles
  the area-48 square into 16 small squares of area 3, 4 to a side, so its side is 4√3. Squares of
  area 9 and 16 sit beside one of area 25: sides 3 + 4 = 7 against 5. A cube mode does cube roots.
  *Why:* Bitesize's own example is the side of a 3 m² square (notes 4.6), and Brilliant has
  "Areas and Roots of Squares" (notes 1.1). The split shows why only a square factor comes out.
  The 9, 16, 25 squares are Pythagoras from Geometry lesson 4, so the "root of a sum" warning
  (HELM, notes 4.6) uses a picture you know.
- **Lesson 4, equal steps on a power ladder.** Rungs 1, 8, 64, 512, equally spaced, each one
  "× 8" from the last. A slider cuts every step into 2, 3 or 4 equal smaller steps, and the
  power's slider moves one small step at a time. Each small step multiplies by the same number.
  Three of them make × 8, so each is × 2, and 8^⅓ = 2. Climb two small steps and you have 8^⅔ = 4.
  A "root first" and "power first" switch climbs the same height two ways and lands on the same
  rung. *Why:* the argument for a fractional power in the sources is that equal parts must
  multiply back to the whole, 4^½ × 4^½ = 4 (mathcentre, notes 4.5). Students read a fractional
  power as adding or multiplying (Şenay 2024, notes 6.4), and the ladder shows it is a repeated
  multiplier instead. The bottom number counts the steps and the top number counts the ones you
  climb, which is the "root on the bottom" rule (Bitesize, notes 4.5).
- **Lesson 5, slide the digits.** A place-value strip with the decimal point fixed in the middle.
  A stepper for n slides the digits left or right, and placeholder zeros fill the gaps. A switch
  snaps the number to standard form (one digit before the point) or to engineering notation (n a
  multiple of 3), where the prefix label appears: 0.0047 A, 4.7 × 10⁻³ A, 4.7 mA. *Why:* Bitesize
  says the digits move, not the point (notes 4.7). The strip shows A and n trading, 47 × 10⁻⁴ and
  4.7 × 10⁻³, while the number stays put. That answers "the exponent gets bigger as the
  coefficient gets bigger" (dergipark, notes 6.7) and "2 figures before the decimal point"
  (Cambridge, notes 6.5). The prefix snapping at every third place shows why there are prefixes
  only for multiples of 3 (Fiore, NIST, notes 4.7).
- **Lesson 6, zoom into the unit.** A 1 m length, square or cube, with a power dial (1, 2, 3) and a
  prefix dial (cm, mm). Zoom in and the small units fill it: 10 mm along each cm, so 100 mm² in a
  cm², then 10,000 cm² in a m². The readout multiplies the zooms as powers, (10⁻³ m)² = 10⁻⁶ m².
  *Why:* the most common error is "the misappropriation of length units in area and volume", by
  73% of calculus students (ERIC EJ1082070, notes 6.6). The zoom shows the factor working in two
  directions for area and three for volume. Geometry lesson 3 drew 1 cm² = 100 mm². This picture
  adds the rule that does any prefix and any power: the prefix is inside the power (NIST, notes
  4.8).
- **Lesson 7, the factor dial.** Choose a law: P = I²R, the inverse square law, a pump's power
  against speed, or pV^n = C. Drag the factor the input changes by, from ×0.5 to ×3. The output's
  factor is the input's factor raised to the law's power, drawn as a shape. Twice the current is a
  2 by 2 square of four heat tiles, and twice the speed is a 2 by 2 by 2 cube. Twice the distance
  spreads a lamp's light over a patch four times the size. A "plot against x²" switch redraws
  readings of y = aX² + b and the curve straightens. *Why:* every formula here asks the same
  question (notes 4.9), and OpenStax warns the effect of a squared quantity "is perhaps greater
  than expected" (notes 7.1). The shape shows where the power comes from. The light patch follows
  OpenStax's reason, "the r² term in the denominator is 4 instead of 1" (notes 7.3). Why the patch
  grows with the square needs a source first (see Gaps).
- **Colour as before:** ink for tiles, squares, steps and controls; amber for key terms (power,
  index, base, root, surd, standard form, prefix); teal for small labels and units; red only for a
  slip; green only for finished.

## 4. What else
- **Benchmark (notes 1, 2).**
  - **Brilliant Exponents and Radicals** (83 lessons, at least 15 levels, notes 1.1). Its levels 1,
    4, 5, 9, 10, 11, 12, 14 and 15 are the ground of lessons 1 to 5 here. Level 2, negative bases,
    you have from Negative numbers. Levels 6 and 7, order of evaluation, you also have. Level 8,
    operations on radicals, is cut to lesson 3's three surd skills. Level 13, prime factorisation,
    is left out. Brilliant builds zero and negative powers on the laws, from its level titles (notes
    1.1). Its prerequisites are Negative Numbers and Fractions, which you have (notes 1.1, 5).
  - **Khan** splits it over two years. Algebra 1 does integer powers, then square and cube roots,
    then simplifying square roots. Algebra 2 does unit-fraction powers, then fractional powers
    (notes 2.1).
  - **Bitesize GCSE** runs index notation, the three laws, zero, negative, fractional (Higher),
    standard form, then surds (Higher) (notes 2.2). **HELM 1.2**, written for engineering students,
    runs notation, the laws, negative, fractional, then scientific notation (notes 2.3).
  - **Bird's engineering textbooks** put "Powers, roots and laws of indices" straight before "Units,
    prefixes and engineering notation" (notes 2.4).
  - **What they lack that you need:** only Bird and HELM make engineering notation and the SI
    prefixes part of the topic (notes 2.4). None of the school courses converts mm² to m² or works
    units through a formula, which Pearson's HN unit starts with (notes 3.2). Lessons 5 to 7 come
    from Bird, NIST, BIPM and the MCA.
- **His aim (notes 3).**
  - **MCA Second Engineer mathematics 2.1:** "6. Defines the term index (power). 7. States what is
    meant by fractional, negative and zero indices. 8. States the rules for addition, subtraction
    and product of indices." (notes 3.3).
  - **MCA General Engineering Science I:** "addition, subtraction and product of indices, including
    fractional indices", and converting pressure "between N/m², Pascals and bar" (notes 3.3).
  - **MCA Applied Heat:** standard atmospheric pressure "1.01325 x 10⁵ N/m", the units of the gas
    constant R, and "pV n = a constant" (notes 3.3).
  - **SQA HN Engineering Mathematics 1 (H7K0 33):** powers are assumed tools, not taught, and
    "Fractional and negative coefficients and indices should be included" in its exponential
    outcome (notes 3.1).
  - **Pearson BTEC HN Unit 4002:** its first listed method is "Dimensional analysis", which is
    lesson 6's unit check (notes 3.2). The Level 3 unit below it lists the three laws (notes 3.2).
    Which awarding body your college uses is UNCONFIRMED.
  - **Warsash's pre-HND refresher** for engineer cadets sends the mathcentre leaflets "Indices or
    Powers", "Surds, and other roots" and "Units and Prefixes" (notes 3.4).
- **Where it is used (each cited before a lesson uses it).**
  - **Powers and the laws (1):** MCA 2.1.6 and 2.1.8 (notes 3.3); General Engineering Science I
    (notes 3.3); Pearson Level 3's three laws (notes 3.2); Bird, "Powers and roots are used
    extensively in mathematics and engineering" (SECONDARY host, notes 2.4).
  - **Zero and negative (2):** MCA 2.1.7 (notes 3.3); SQA H7K0 33, "Fractional and negative ...
    indices" (notes 3.1); an older SQA unit, "leaving your answer with positive indices" (notes 3.1);
    units such as m · s⁻² (NIST, notes 4.8).
  - **Roots and surds (3):** the Warsash leaflet "Surds, and other roots" (notes 3.4); a square's
    side from its area in exact form (Bitesize, notes 4.6). No engineering use of a cube root is in
    the notes, so the screen uses a cube's edge from its volume as the picture and makes no claim.
  - **Fractional powers (4):** General Engineering Science I, "including fractional indices", and
    MCA 2.1.7 (notes 3.3); the Warsash leaflet, "use negative and fractional indices" (notes 3.4);
    SQA H7K0 33 (notes 3.1).
  - **Powers of ten (5):** MCA Applied Heat, 1.01325 × 10⁵ N/m², and General Engineering Science I
    pressure conversions (notes 3.3); "23,000 volts ... 23 kilovolts" (Fiore, SECONDARY, notes
    4.7); megohm and kilohm (NIST, notes 4.7); Bird's chapter 8 (notes 2.4).
  - **Units (6):** Pearson 4002 P1, "Apply dimensional analysis techniques" (notes 3.2); MCA
    Applied Heat, "Derives the units of the Characteristic Gas Constant R" (notes 3.3); MCA Marine
    Electro-Technology, R, L and C "in terms of physical dimensions" (notes 3.3); the ohm-metre and
    R = ρL/A (OpenStax, notes 4.8); force in kg m s⁻² (Warsash, notes 4.8); cable sizes in mm²
    (Nexans and IEC 60228, in the Geometry fundamentals brief).
  - **Formulas (7):** P = I²R = V²/R (OpenStax via LibreTexts, SECONDARY, notes 7.1) and "power
    and energy in dc resistive circuits" (MCA Marine Electro-Technology 2.1, notes 3.3); diameter
    squared in copper wire tables (NBS, notes 7.2); the inverse square law (OpenStax, Physics
    Classroom, HELM's index, notes 7.3); pV^n = C (Purdue, WPI, notes 7.4; MCA Applied Heat 4.2
    and 7.1, notes 3.3) and a diesel's compression stroke "nearly adiabatic" (Clarkson, notes 7.4);
    pump and fan laws (US DoE, Engineering ToolBox SECONDARY, notes 7.5, marine link UNCONFIRMED);
    y = aX² + b as a straight line (MCA 4.10, Straight-line graphs notes 3.1).
- **The mistakes to catch, each with a DO screen and its own hint.**
  - **Lesson 1, the power as a multiplier:** students could not work out a power's value, confused
    the power with the base, and could not tell aᵇ from bᵃ (Sevgi and Kabalcı 2026, notes 6.1).
    Puzzles ask for 2⁵ against 2 × 5, and 2³ against 3².
  - **Lesson 1, mixing adding and multiplying:** errors "originated from the definition of
    exponentiation as repeated multiplication" and from "confusion with additive and multiplicative
    structures" (Ulusoy 2019, notes 6.2).
  - **Lesson 1, multiplying the powers:** "Some candidates had misconceptions and were multiplying
    the indices" (Cambridge IGCSE examiner report, June 2024, notes 6.5). A puzzle offers 9¹⁵ for
    9³ × 9⁵.
  - **Lesson 1, different bases:** "exponent operations with different bases" is a named
    misconception in a 2026 four-tier test study (notes 6.4). The hatched row shows the law fail.
  - **Lesson 1, the bracket:** "It is common to forget to square the 4" in (4a)² (Third Space,
    SECONDARY, notes 6.5). The minus case, −3² against (−3)², is a mixed puzzle with a one-line
    reminder from Negative numbers, not a new teaching point (Sevgi and Kabalcı name it, notes 6.1).
  - **Lesson 2, the zero power:** students multiply base by power and get 0, or add and get the base
    (Sevgi and Kabalcı 2026, notes 6.1). Zero and negative powers were where achievement was lowest
    (Ulusoy 2019, notes 6.2).
  - **Lesson 2, a negative answer:** "A common misconception is that since the power is negative,
    the result must be negative" (mathcentre, notes 4.3), and "Some students ... thought that a
    negative exponent resulted in a negative number" (Sevgi and Kabalcı, notes 6.1).
  - **Lesson 3, one root or two:** taught as a convention, not a mistake (HELM, Bitesize, notes 4.4).
  - **Lesson 3, the root of a sum:** "it does not work for addition or subtraction" (HELM, notes 4.6,
    6.5). This is HELM's warning, not a counted mistake, so it is taught as a check with the 9, 16,
    25 squares.
  - **Lesson 4, a fraction power as adding or multiplying:** "thinking of rational exponent as
    addition or multiplication" (Şenay 2024, notes 6.4), and "converting fractional exponents to
    root forms" (four-tier test, notes 6.4). A puzzle offers 8 × ⅓ for 8^⅓.
  - **Lesson 4, the root on top:** "This places the root (fourth root) in the numerator" (For
    Dummies, SECONDARY, notes 6.5). Also "Confusing integer and fractional powers" (Third Space,
    SECONDARY, notes 6.5).
  - **Lesson 4, multiplying instead of adding:** "a common error is to multiply, rather than add" the
    fractional powers (For Dummies, SECONDARY, notes 6.5).
  - **Lesson 5, two figures before the point:** "A major misconception was to have 2 figures before
    the decimal point" (Cambridge, June 2024, notes 6.5).
  - **Lesson 5, the power following the front number:** "the exponent gets bigger as the coefficient
    gets bigger" (dergipark, notes 6.7), and the inability "to multiply and divide by powers of 10"
    (Victorian curriculum companion, notes 6.7).
  - **Lesson 5, adding the powers wrongly:** "A considerable number made an error of incorrectly
    adding the indices" in a standard form sum (Cambridge, notes 6.5).
  - **Lesson 5, keying it in:** standard form "presents a whole other challenge for students using
    calculators" (AIP, notes 6.7). The excerpt stops before saying what they do wrong, so the
    lesson teaches the ×10ˣ key (Bitesize, notes 4.7) and does not cite a particular slip.
  - **Lesson 6, length units in area:** 73% of calculus students gave wrong units at least once,
    most often length units in area and volume (ERIC EJ1082070, notes 6.6). "If there are three
    feet in a yard, then there are three square feet in a square yard" (Carle via Yale, SECONDARY,
    notes 6.6). A puzzle offers 1000 mm² in a m².
  - **Lesson 6, the prefix outside the power:** NIST's rule that the power takes the prefix too
    (notes 4.8). No source counts reading mm² as "milli-(m²)", so it is taught as the rule.
  - **Not stated as common:** no source counts these, so they are taught as checks (count the
    tiles, work the units, try the factor 2), not as cited mistakes.
    - Taking "twice the current" to mean twice the heat.
    - Doubling instead of quartering for the inverse square law.
    - Writing compound prefixes such as kµs, which NIST and the Warsash notes rule out (notes 4.8).
- **Size and cost.** 7 lessons of about 12 screens on the agreed settings.
  - The last six measured courses ran about 0.99M to 1.14M tokens a lesson
    (docs/plans/foundational-maths-roadmap.md). These pictures are mostly tiles, squares and
    strips, with no live graphs except lesson 7's re-plot, so I estimate about 1.05M to 1.15M a
    lesson.
  - That is about 7.4M to 8.1M for the course, plus about 0.3M for the plan and research. The
    research can start from the 53 saved tool results.
  - The full process measured on Fractions lessons 4 to 8 was about 1.65M a lesson, about 11.6M for
    seven.
  - Each build's real cost is reported to you.
- **Lesson 1 first.** Lesson 1 is built and checked before the others (about 1.1M, plus the plan
  and research). Because you asked for the folder in one push, the rest follow without waiting for
  you to try it.
- **Gaps to close at build time.** None blocks the build.
  - Brilliant's lesson pictures were not seen, only its contents list, and whether it has more than
    15 levels is UNCONFIRMED (notes 1.1). Khan's Pre-algebra lesson list is UNCONFIRMED (notes 2.1).
  - Whether Warsash's HND maths module or any HN or MCA line asks for surds is UNCONFIRMED (notes
    3.4, 9). Lesson 3 keeps surds small for that reason.
  - How much the HN lecturer re-teaches indices is UNCONFIRMED (notes 3.2).
  - The MCA 4.10 line is from a SECONDARY host (Straight-line graphs notes 3.1).
  - **Lesson 6:** the MCA asks for the units of the gas constant R (notes 3.3), but the formula
    pV = mRT is not in these notes. The research stage must cite it before a screen uses it;
    otherwise the unit check uses R = ρL/A and N = kg m s⁻² only.
  - **Lesson 6:** a real resistivity for copper is not in the notes. Puzzles use a labelled example
    ρ unless the research stage cites one with its temperature.
  - **Lesson 7:** the reason for the inverse square law (the same light spread over an area that
    grows with the square of the distance) is not quoted in the notes, only the rule (notes 7.3).
    The research stage must cite it before the spreading patch is explained in words.
  - **Lesson 7:** real values of n for an engine's compression stroke, and γ for air, are not in the
    notes. Clarkson says the stroke is "nearly adiabatic" (notes 7.4). Puzzles use labelled
    example values of n.
  - **Lesson 7:** the marine use of the pump and fan laws is UNCONFIRMED (notes 7.5).
  - AQA, OCR and Edexcel examiner reports on negative and fractional powers, NCTM guidance and the
    Kakoma and Luneta paper were not found (UNCONFIRMED, notes 6.8, 9).
