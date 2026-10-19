# Where Design and verification sits on the Electrical engineering shelf

Written 19 Oct 2026 with `brief.md`. A proposal only: no shelf file exists yet for this shelf
(`docs/shelves-*.json` has Maths, Science, Computer science and Data analysis), and nothing here
touches app code or the AC circuits build.

## The proposal
- **Shelf:** Electrical engineering.
- **Folder:** `installation-design`, titled "Installation design (BS 7671)", blurb: "Designing and
  verifying installations ashore to BS 7671, built to your Level 4 course." It is a folder of its own
  because it is a different kind of course from the rest of the shelf. The others teach how electrical
  plant behaves anywhere; this one teaches one standard's design method, which applies to
  installations ashore and not to ships.
- **Course:** id `design-and-verification`, title "Design and verification of electrical
  installations", blurb: "Your Level 4 design process, step by step, and why each step is there: Ib to
  the adiabatic check, then verifying the circuit you built."
- **Place:** the second folder, after the folder holding AC circuits. The AC circuits brief lists the
  shelf's courses after it as Transformers, Three-phase power systems at sea, Machines and drives,
  Instrumentation and control, and Maintenance and fault-finding. The folder those sit in is not named
  yet, so I have not named it here.
- **Order:** best taken after AC circuits, because lessons 1, 5 and 7 borrow from it. It does not
  have to wait: you used power factor and √3 in design for years, so each borrowed idea gets a
  one-line reminder that stands on its own if AC circuits is not finished.

## How it relates to AC circuits (build/electrical/ac-circuits/brief.md)
Nothing is taught twice. AC circuits teaches the cause. Design and verification uses the result in a
design calculation. Each borrowed idea gets one line and a pointer.

| Idea | Taught in AC circuits | Used in Design and verification |
|---|---|---|
| Real, reactive and apparent power; power factor = P ÷ S = cos φ | Lesson 8 | Lesson 1: Ib from output ÷ (efficiency × power factor). The power triangle is the picture's second half and is not explained again. |
| Three-phase √3, line and phase; √3 V_L I_L cos φ | Lesson 10 | Lesson 1: the three-phase Ib formula is that one rearranged. Lesson 6: ÷ √3 to turn a three-phase submain's drop into a single-phase one. |
| Balanced currents cancel in the neutral | Lesson 10 | Lesson 5 starts from it, then shows why third harmonics do not cancel. |
| The impedance triangle R, X, Z; current lagging by φ | Lessons 4 and 6 | Lesson 7: the cable's r, x and z mV/A/m columns, and only the parts of the r and x drops along the voltage count. |
| Rms values | Lesson 2 | Every current and voltage here is rms; said once, in lesson 1. |
| Power factor correction | Lesson 9 | Not used. |
| Resonance | Lesson 7 | Not used. |

**One overlap to settle: harmonics.** AC circuits leaves harmonics to Instrumentation and control,
with one line in lesson 10 that triplen harmonic currents add in the neutral. Design and verification
lesson 5 needs that idea as a design rule (Table 4Aa, Ibn = 3 × h × IL, slides p.33 to 36). The
proposal: lesson 5 shows the third harmonic adding in the neutral as a picture and teaches the design
rule, and no more of the theory (no spectra, no causes in rectifiers or drives beyond the slides'
list, no filters). Instrumentation and control, when it is planned, treats the neutral current as
already seen and teaches the rest.

**AC circuits already says it will not teach this course.** Its brief lists "BS 7671 design and
verification (cable sizing, voltage drop, earth fault loop impedance, protective devices, inspection
and test)" under "Not taught again". So the two briefs agree on the line between them.

## How it relates to the ship courses
Three-phase power systems at sea will cover insulated and earthed neutral systems and earth fault
detection (AC circuits brief, "Left for later courses"). Design and verification teaches BS 7671's
earthed systems and automatic disconnection. Where a lesson has a sourced "at sea it differs"
screen, it says the ship follows a different standard and points to that course, and does not teach
the ship system itself. No screen implies BS 7671 governs a ship.

## How it relates to the Maths shelf
It uses, never re-teaches: rearranging formulas (Solving equations, Linear equations), square roots
and squares (Powers and roots, for the adiabatic equation), log scales (Exponentials and logarithms,
for the time-current curve), and cos and sin of an angle (Trigonometry, for lesson 7).
