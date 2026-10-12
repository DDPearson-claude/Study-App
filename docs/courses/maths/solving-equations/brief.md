# Solving equations: the course brief

Written 12 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. Dan said
"get building" after the research, so this brief takes the research's suggested core and my
recommended answers to its questions:
- **Six lessons.**
- **Brackets are left to Linear equations.**
- **The voltage-drop rule is worked out on screen from its sourced unit.**

Sources and quotes are in `research-notes.md` beside this file (98 quotes, every one checked against
the saved search results; section numbers below point there).

## The short version
**Six lessons**
1. The balance
2. Undo in reverse
3. Unknowns on both sides
4. Using formulas
5. Rearranging formulas
6. Rearranging harder formulas

**The main pictures:**
- **A balance**, for whole positive numbers only, where it works.
- **An "undo" flow diagram**, from lesson 2 onwards. It shows the formula's steps in order, then the
  same steps reversed. It takes over wherever the balance breaks: negatives, and every formula.

**Decisions taken for you** (say if you want any changed):
- **Six lessons, not five.** Unknowns on both sides keeps a short lesson of its own.
- **Brackets wait for Linear equations.** None of your formulas needs them.
- **Voltage drop is built from its unit.** The table's unit, millivolts per amp per metre, is sourced
  from a cable maker's reproduction of the BS 7671 tables. The rule follows from the unit itself.
  The lesson uses example table values, labelled as examples, and quotes no limits.
- **The MCA question is still open.** GES I has no rearranging line, so the course leans on SQA's
  entry line instead.

## 1. The overall topic
An equation is a balance. Whatever you do to one side, you do to the other, and you undo the
steps in reverse to find the unknown.

Changing the subject of a formula is "exactly the same" process (Bitesize, notes 1.3), so the
course ends on the formulas Dan will rearrange at college:
- V = IR
- P = VI
- P = I²R
- p1V1 = p2V2 (Boyle's law)
- the voltage-drop rule

**It builds on:**
- Negative numbers lesson 8: order of operations. The undo order is the build order reversed.
- Negative numbers lessons 3 to 7: signs, for negatives in lesson 2 onwards.
- Negative numbers lesson 3: absolute = gauge + atmospheric, for lesson 6.
- Fractions: dividing.
- Proportional reasoning: inverse proportion. p1V1 = p2V2 is its rule written as an equation.

**Left for later courses:**
- brackets, inequalities and simultaneous equations (Linear equations, Linear systems)
- graphs (The coordinate plane)

## 2. The lessons, in the order they build
| # | Lesson | The skill Dan leaves with |
|---|---|---|
| 1 | The balance | "=" means both sides are the same amount, not "the answer comes next". Solve a one-step equation by doing the same to both sides (x + 7 = 12, 4x = 36), with whole positive numbers on a balance. |
| 2 | Undo in reverse | Solve a two-step equation (3x + 5 = 26) by undoing the last step first, on a flow diagram drawn from the equation. Negatives come in here, carried by the flow diagram and the number line, not the balance. |
| 3 | Unknowns on both sides | Take the same unknown off both sides (5x + 2 = 3x + 10), then finish as in lesson 2. Short. |
| 4 | Using formulas | Put numbers into V = IR, P = VI and P = I²R and solve for the one unknown number. Then write an equation from a situation, the MCA's "Form linear equations consistent with data provided". This is the bridge from numbers to letters. |
| 5 | Rearranging formulas | Make a different letter the subject by undoing the formula's flow diagram: V = IR to I = V ÷ R and R = V ÷ I, P = VI to I = P ÷ V, and one with a sum in it (v = u + at for t, mathcentre's worked case). Spot the "change side, change sign" slip. |
| 6 | Rearranging harder formulas | P = I²R to I = √(P ÷ R), where the undo for a square is a square root. p1V1 = p2V2 to V2 = p1V1 ÷ p2, at absolute pressure. The voltage-drop rule, built from its unit, solved for the longest run a cable can have for a given drop. |

## 3. Can it be taught mostly visually, through interaction?
Yes for lessons 1 to 3. Lessons 4 to 6 too, with a little more explanation on their SHOW screens.
- **The balance (lessons 1 and 3):** drag the same weight off both pans and it stays level. Take
  it off one pan only and it tips, so that slip shows itself. In lesson 3, matching unknown boxes come off
  both pans.
- **The flow diagram (lessons 2 and 4 to 6):** the build order runs left to right (× 3, then + 5).
  The undo runs right to left (− 5, then ÷ 3), and each box lights up as Dan reverses it. A wrong
  undo, such as dividing first or using + 5 instead of − 5, gives a number that fails the check
  when it is fed back through.
- **The check:** every answer is put back into the equation to show both sides match. This is how
  "=" keeps its meaning.
- **Formula cards (lessons 4 to 6):** the letters wear their units (V, A, Ω, W, bar, L, m), so a
  rearranged formula can be checked by its units too.
- **Colour as before:** ink for working, red only for a slip (the tipped balance, a failed check),
  green only for finished.

## 4. What else
- **Benchmark (notes 1).** Khan, Oak, NCETM and Bitesize all build the same chain: what "=" means,
  then one step, then two steps, then unknowns on both sides. Brilliant's Solving Equations course
  puts its balance level late (level 10 of 13) and keeps the basic solving in its separate Linear
  Equations course. Bitesize teaches changing the subject with a function machine, undoing from the
  last operation back.
- **His aim (notes 2.1).** SQA's HN Engineering Mathematics 1 says, in its recommended entry, that
  "it would be advantageous if learners had good algebraic skills together with an ability to
  transpose engineering formulae". So the unit assumes rearranging rather than teaching it. Neither the
  Pearson HN unit nor MCA GES I has a rearranging line (notes 2.2, 2.3).
- **The formulas (notes 2.4 and 2.5).**
  - Ohm's law and power are sourced (OpenStax, UMass, RMIT, US Naval Academy, an electrician's
    formula sheet). OpenStax says they "are combinations of just two equations, Ohm's law and power".
  - Boyle's law at absolute pressure and constant temperature is sourced (Cambridge University Press,
    Utah Education Network, OpenStax).
- **The voltage-drop rule (notes 2.6).** Only the unit is sourced. Each screen shows the rule
  as computed from that unit (mV/A/m × A × m ÷ 1000 = V). Table values are example values, and no
  3% or 5% limit appears.
- **The mistakes to catch, each with a puzzle and its own hint.**
  - **Lesson 1, the equals sign:** reading "=" as "the answer comes next" (notes 3.1).
  - **Lesson 2, sign slips with negatives:** "the most frequent" error in one study (notes 3.2).
  - **Lessons 2 and 5, undoing wrongly:** the "other inverse" error, for example dividing where you
    should multiply (notes 3.3).
  - **Lesson 5, the shortcut:** "change side, change sign" fails with × and ÷ (notes 3.3).
  - **Lesson 6, the square root:** square roots and squares, with the warning that squaring both
    sides can add a false answer (notes 2.7).
  - **Not stated as common:** doing a step to one side only, and dividing only one term. No source
    counts these as common, so they are taught as the balance tipping, not as a cited mistake.
- **Size and cost.** 6 lessons of about 12 screens on the agreed settings, at about 1M tokens a lesson
  (measured on Proportional reasoning), so about 6M. Add about 0.3M for the plan and research, which
  can start from this brief's 21 saved search results.
- **Gaps to close at build time.** None blocks the build. An original BS 7671 / IET page for the
  voltage-drop formula would let lesson 6 cite it rather than derive it.
