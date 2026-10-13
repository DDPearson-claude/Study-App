# Linear equations: the course brief

Written 13 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
the first course in the Maths shelf's Algebra folder, and it picks up where Solving equations
stopped: that course left brackets, inequalities and simultaneous equations for later. Sources and
quotes are in `research-notes.md` beside this file (124 quotes, every one checked against the saved
search results; section numbers below point there).

## The short version
**Six lessons**
1. Like terms (the pilot)
2. Expanding brackets
3. Factorising
4. Equations with brackets
5. Inequalities
6. From words to formulas

**The main pictures:**
- **Bars** for like terms. A bar is x long, and a slider tries x at different values.
- **An area model** for brackets. Three bars of (x + 5) stack into a rectangle 3 by (x + 5), which
  splits into 3x and 15. Lesson 3 runs it backwards.
- **"Try a number"**, the check on every screen. Put a number in for x and see whether both sides
  still match.
- **The flow diagram from Solving equations**, for equations and formulas with a bracket.
- **A number line** for inequalities, with points that mirror across zero for the flip.

**Decisions taken for you** (say if you want any changed):
- **Six lessons.** Brilliant's course is 68 lessons in 13 levels (notes 1.1), but you already have
  its solving levels from Solving equations and its negatives from Negative numbers.
- **Lesson 1 is the pilot.** You try Like terms on your phone before the other five are built.
- **Steps lessons throughout.** Lesson 6's SHOW screens carry a little more explanation, because a
  formula's letters need saying in words.
- **Bars, not fruit.** NCETM warns against teaching 3a + 2a = 5a as "three apples plus two apples",
  yet Bitesize's own video uses apples (notes 4.1). The course uses bars, because a letter stands
  for a number. One screen names both views, so the point is taught as contested.
- **The area model for brackets, and numbers where it breaks.** The rectangle shows why each term
  gets multiplied, but it has no negative area. A minus in front is taught with "try a number"
  instead, the way a Nipissing University algebra page refutes x − (a − b) = x − a − b (notes 4.3).
- **Fractions go inside lesson 4, not a lesson of their own.** The fraction bar acts as a bracket,
  so (x + 4) ÷ 3 = 5 is the same move as 3(x − 2) = 27.
- **Inequalities get one lesson.** Every benchmark teaches them, but no MCA Second Engineer line
  for them was found (UNCONFIRMED, notes 5.1). So it is one lesson, single inequalities only.
  Compound inequalities wait.
- **Words and formulas come last.** They are the payoff for college. MCA line 2.1.27 reads "Develops linear
  equations consistent with data provided in a question" (notes 5.1).
- **Example numbers are labelled.** Copper's α of 3.9 × 10⁻³ per °C is cited (notes 5.5). So is
  the caution that the rule holds for changes of "about 100ºC or less". Invoices and cable runs use
  labelled example figures.
- **Your intake answers** (`intake.json`): to understand linear equations and how to work with them;
  on the job and in everyday life (the question takes one answer, so "For further study" is not
  also ticked); hands-on, with the why explained in full.
- **Left out:** graphs, simultaneous equations, compound inequalities, percentage discounts, and
  "no solution" as a lesson. It gets one screen in lesson 4.

## 1. The overall topic
An expression is a number written with a letter in it. This course is about the moves that keep an
expression the same value while changing how it looks:
- collecting like terms
- expanding a bracket
- factorising

It then uses those moves to solve equations with brackets and fractions, and inequalities. It ends
by writing equations from words and rearranging formulas with a bracket, such as R = R₀(1 + αΔT).

**It builds on:**
- **Solving equations:** the balance, undoing in reverse, unknowns on both sides, putting numbers
  into formulas and rearranging them. Lesson 4 there started writing an equation from a job, and
  lesson 6 here grows it.
- **Negative numbers:** signs in all four operations (lessons 3 to 7). Lesson 8 put a sign in front
  of a bracket of numbers. Here the bracket has letters in it.
- **Fractions:** multiplying and dividing, for equations with fractions.

**Not taught again:** one- and two-step equations, unknowns on both sides, V = IR, P = VI and P = I²R,
and rearranging formulas without a bracket (Solving equations). Order of operations (Negative numbers
lesson 8). Straight lines through zero (The coordinate plane lesson 6).

**Left for later courses:**
- graphs of lines, gradient and y = mx + c (Coordinate geometry, Linear relationships; notes 3.3)
- simultaneous equations (Linear systems; MCA line 2.1.28, notes 3.4 and 5.1)

## 2. The lessons, in the order they build
All five benchmarks put expressions before equations (notes 2.6), so the course does too.

| # | Lesson | The skill Dan leaves with |
|---|---|---|
| 1 | Like terms | A letter stands for a number. 3x + 2x = 5x because three of a number and two more of the same number make five of it (NCETM's "unitising", notes 4.1). 3x + 4 stays as it is: it is already finished. A sign belongs to the term after it, so 7x − 2x + 3 − x = 4x + 3. Check any tidy-up by trying a number. |
| 2 | Expanding brackets | Multiply every term inside: 3(x + 5) = 3x + 15, and with a letter in front, R₀(1 + αΔT) = R₀ + R₀αΔT. A minus in front changes every sign inside: −(6x − 5) = −6x + 5. Expanding "does not change the value" (Bitesize, notes 2.3). |
| 3 | Factorising | The reverse of expanding (NCETM, notes 2.5): take out the common factor. 6x + 15 = 3(2x + 5). R₀ + R₀αΔT back to R₀(1 + αΔT). V = IR₁ + IR₂ + IR₃ = I(R₁ + R₂ + R₃) (notes 5.5). Check by expanding back. |
| 4 | Equations with brackets | Solve 3(x − 2) = 27 two ways, dividing first or expanding first (Oak, NCETM, notes 2.4, 2.5). Collect like terms on each side first. A minus before a bracket, as in 8x − (6x − 5) = 21. The fraction bar as a bracket: (x + 4) ÷ 3 = 5, and x ÷ 2 + x ÷ 3 = 10. One screen on 4x + 6 = 4x, which has no solution (NCETM, notes 4.5). |
| 5 | Inequalities | <, >, ≤ and ≥, and an answer that is a stretch of the number line, not one number (Bitesize, notes 2.3). Solve with the same undo moves. Multiplying or dividing by a negative flips the sign, seen by trying 10 < 15 (OpenStax, notes 4.4). A minus sign that only appears does not flip it (Big Ideas, notes 4.4). |
| 6 | From words to formulas | Write a two-part situation as an equation with a bracket: two cable runs, each x m plus a 3 m tail, total 40 m, so 2(x + 3) = 40. Then rearrange R = R₀(1 + αΔT) for ΔT and for R₀, keeping (1 + αΔT) as one thing. The same shape turns up in thermal expansion, L₁ = L₀ + L₀α(t₁ − t₀) (notes 5.5). |

## 3. Can it be taught mostly visually, through interaction?
Yes for all six. Lesson 6 needs a little more explanation on its SHOW screens.
- **Bars (lesson 1):** an x-bar has a length you do not know yet. Drag the slider and every x-bar
  changes together, so 3x + 2x always lines up with 5x. Brilliant uses "algebra tiles and invoices"
  (notes 1.1), which are quantity pictures. Numbers are small unit squares. A term taken away is a
  dashed bar.
- **Try a number (every lesson):** slide x and both sides show their values. 3x + 2x and 5x match
  at every value. 3x + 4 and 7x match only when x = 1, so they are not the same expression. This
  keeps "=" meaning "the same value", which the equals-sign research says matters most (notes 4.5).
- **The area model (lessons 2 and 3):** three bars of (x + 5) stack into a rectangle. Its two parts
  are 3x and 15, so you cannot multiply the x and forget the 5. With R₀ along one side, the rule's
  two parts are R₀ and the small strip R₀αΔT, the extra resistance from the temperature rise. In
  lesson 3 you are given the parts and find the shared side.
- **The flow diagram (lessons 4 and 6):** carried over from Solving equations. For 3(x − 2) = 27 it
  reads x, then − 2, then × 3. Undo it from the right. For R = R₀(1 + αΔT) the undo for ΔT is ÷ R₀,
  then − 1, then ÷ α.
- **The number line (lesson 5):** the answer to x > 3 is a shaded ray with an open circle at 3; ≥ gets
  a filled circle (Bitesize, notes 2.3). Multiply 10 < 15 by −5 and the two points jump across zero
  to −50 and −75. Their order swaps, so the sign flips.
- **The invoice (lesson 6):** a call-out charge plus hours at a rate, with labelled example figures,
  following Brilliant's invoices.
- **Colour as before:** ink for working and controls, amber for key terms, red only for a slip
  (a check that fails, a sign that should have flipped), green only for finished.

## 4. What else
- **Benchmark (notes 1 and 2).** Brilliant's Linear Equations is 68 lessons in 13 levels (notes 1.1).
  Its levels 1, 3, 4, 7, 8 and 9 map onto these six lessons (notes 6). Its level 2 repeats Solving
  equations, and levels 5 and 6 mostly repeat Negative numbers. Khan, Oak, Bitesize and NCETM all
  run like terms, then expanding, then factorising, then equations with brackets (notes 2.6). The
  six lessons follow the researcher's suggested grouping (notes 6). I kept it because it matches
  that order and ends on the formulas your college work needs.
- **His aim (notes 5.1 and 5.3).** The MCA Second Engineer maths syllabus has the course almost line
  for line:
  - 2.1.4: "States the effect of plus or minus signs in front of a bracketed quantity or quantities"
  - 2.1.10: "States the 'Law of Distribution'"
  - 2.1.16: "Factorises expressions which have one factor consisting of one term only"
  - 2.1.24: "Simplifies and solves linear equations"
  - 2.1.26: transposition
  - 2.1.27: "Develops linear equations consistent with data provided in a question"

  SQA's HN Engineering Mathematics 1 assumes National 5 maths, whose algebra includes "expansion of
  brackets" (notes 5.3). City & Guilds' Level 2 electrical diploma lists algebra and transposition
  among its maths (notes 5.4).
- **Where it is used (each cited before a lesson uses it).**
  - **Like terms:** MCA 2.1.2 and 2.1.3, adding and subtracting "algebraic quantities, both positive
    and negative" (notes 5.1). Series resistances add, R = R₁ + R₂ + R₃ (OpenStax, notes 5.5), so
    three equal ones are 3R.
  - **Expanding:** MCA 2.1.4 and 2.1.10 (notes 5.1). R = R₀(1 + αΔT), the resistance after a
    temperature change ΔT (OpenStax via Lumen, a SECONDARY host, notes 5.5).
  - **Factorising:** MCA 2.1.16 (notes 5.1). V = IR₁ + IR₂ + IR₃ = I(R₁ + R₂ + R₃) (OpenStax via
    LibreTexts, notes 5.5). L₁ = L₀ + L₀α(t₁ − t₀) (Engineering ToolBox, notes 5.5).
  - **Equations with brackets:** MCA 2.1.24 (notes 5.1). Bitesize's GCSE guide covers "brackets, 𝑥
    terms on both sides, and fractions" (notes 2.3).
  - **Inequalities:** no trade or MCA line was found (notes 5.1, UNCONFIRMED). Bitesize's National 5
    revision teaches them (notes 4.4), and National 5 is the entry level for SQA's HN maths (notes
    5.3). The lesson says so plainly and uses labelled example limits, never a claimed regulation.
  - **Words to equations:** MCA 2.1.27 (notes 5.1) and GES I 1.3, "Form linear equations
    consistent with data provided" (notes 5.2).
  - **Formulas with a bracket:** R = R₀(1 + αΔT), copper's α = 3.9 × 10⁻³ per °C, and its "about
    100ºC or less" caution (notes 5.5). R₀ is the resistance at the starting temperature; one
    lecture source takes it at 0 °C (notes 5.5), so the lesson names the reference every time. Making
    x the subject of y = 3(x + 7) is a worked case from a UK university's maths support (notes 5.5).
    HELM calls transposition "basic skills required in all aspects of engineering" (notes 5.5).
- **The mistakes to catch, each with a puzzle and its own hint.**
  - **Lesson 1, letter as object ("fruit salad algebra"):** reading 4a + 3b as "4 apples plus 3
    bananas" (Küchemann, in the Springer 2025 paper, notes 4.1). It is widespread, "omnipresent" in
    one German study. NCETM warns against the apples teaching, which Bitesize's video uses (notes
    4.1).
  - **Lesson 1, joining unlike terms:** 3x + 4 = 7x, 3x + 2x = 5x² (ERIC EJ1412238), and 4 + 3n as 7
    or 7n (dialnet) (notes 4.2). The reason given is that the plus sign seems to want a single answer.
  - **Lessons 1 and 4, the equals sign:** reading "=" as "the answer comes next" (Knuth and others,
    2006 and 2008, notes 4.5). Expressions sit on both sides early, which McNeil and others found
    works best (notes 4.5). Students who read "=" as "the same value" are also more likely to read
    letters correctly (Springer, notes 4.1).
  - **Lesson 1, the minus at the start:** in one study half the students thought a minus at the
    start of an expression "had no meaning" (ERIC EJ1294052, notes 4.3).
  - **Lesson 2, half-expanding:** 2(3a + 4) = 6a + 4 (African Journal, 2024) and 4(n + 5) = 20n
    (dialnet) (notes 4.2).
  - **Lessons 2 and 4, a minus in front of a bracket:** −p(q − 3) written −pq − 3p (ERIC EJ1428049).
    8x − (6x − 5) written 2x + 5, which NCETM names (notes 4.3).
  - **Lesson 5, forgetting to flip:** found in 5.7% of answers in a 188-student study (ERIC EJ1099654,
    notes 4.4). That study's conceptual errors were larger, at 22.5%.
  - **Lesson 5, treating an inequality as an equation:** using the balance method where it does not
    fit, and flipping when a negative number moves across instead of when dividing by it (both from
    a paper on learners' inequality errors, ejournal.umm.ac.id, notes 4.4).
  - **Lesson 6, splitting the bracket:** a process like 3e has to be handled as "one object" (NCETM,
    notes 4.3). Here that means dividing by the whole of (1 + αΔT).
  - **Not stated as common:** factorising without the 1, as in R₀ + R₀αΔT written R₀(αΔT), and
    multiplying only one term by a fraction's bottom number. No source counts these, so they are
    taught as checks (expand it back, try a number), not as cited mistakes.
- **Size and cost.** 6 lessons of about 12 screens on the agreed settings. The last three courses
  measured about 1.03M to 1.14M tokens a lesson on these settings (docs/plans/foundational-maths-roadmap.md),
  so about 6.2M to 6.9M for the course, plus about 0.3M for the plan and research. The research can
  start from the 40 saved search results. That compares with about 1.65M a lesson on the full process
  measured on Fractions lessons 4 to 8 (about 9.9M for six). Each build's real cost is reported to you.
- **Pilot first.** Lesson 1 is built first (about 1.1M, plus the plan and research). You try it on
  your phone, and the other five wait for your say.
- **Gaps to close at build time.** None blocks the build.
  - Brilliant's lesson pictures were not seen, only its contents list (notes 7).
  - Whether the MCA syllabus has inequalities anywhere is UNCONFIRMED.
  - No ship-specific worked example of a bracket formula was found (notes 7).
  - The 5(p + q) − 3(p + q) slip is UNCONFIRMED and is not cited.
