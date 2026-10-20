# Design and verification, refreshed: the course design

Written 20 Oct 2026 for Dan. This is the course design to build. It replaces the tool-first design
in `design.md` beside it (kept, with `mockups/`, as the alternative Dan turned down). The course
brief in `../brief.md` still stands for its sources, its research list, its traps and its figures.
Nothing here is built. The new mockups are in `refresher-mockups/`.

**What Dan asked for (20 Oct):** "I don't want it as a job card, I want it taught back to me but in
a refresher way. Combining elements of the EAL course work and the C&G exams." Before that (19 Oct):
he has no more exams on this; it is for real design and installation work. So the City & Guilds
question shapes are used because they are the best test of understanding, not as exam preparation:
no timers, no marks, no grades.

---

## The short version: what a lesson is like for Dan

Each lesson takes one step of his design process, about eleven screens, ten to fifteen minutes.

1. **Do you still have it?** A question from memory before any teaching. Right, and he can skip
   straight to the practice. Wrong, and the refresh starts from the slip he made.
2. **What it is for, and what goes wrong if it is skipped.** One screen.
3. **The why**, with an interactive he moves. For the four Level 4 parts (1.45 and Cf, harmonics in
   the neutral, Ct and the power-factor drop, Cmin against Cmax) this is a full "why" piece.
4. **A worked example** from his own slides, line by line.
5. **Section A practice** on his own assignment: the showroom. One C&G-style question, "Determine,
   for the final circuit, the (a) design current, (b) …", is built up part by part across the
   lessons, on the assignment's own motor (question 4).
6. **Section B practice**: a short written answer ("Explain why…", "State…") in his own words,
   marked by Claude against points taken from his sources, the way a mark scheme works.
7. **Keep this**: a one-card summary he can come back to on a real job. It goes into his Book as
   the first page of that chapter.

The course page shows the running case (the showroom) and the Section A question filling in as he
goes. The capstone lesson designs the showroom's submain to DBL2 and its longest circuit end to end,
checked against his project guide's key points, and the last lesson verifies it as built.

---

## 1. The lessons, in order

Five units, eleven lessons. "EAL" means his own course: the slides (`slides p.N`), the formula
sheet, the flowchart, the learner pack (`pack p.N`), the project guide (`guide p.N`) and the
drawings. "C&G" means the shape of a City & Guilds 2396 question (P1 to P3 in `../brief.md`),
always with the scenario and numbers changed. Every number below is printed in his materials or
worked from the rule shown; "to source" marks what research must quote first.

### Unit 1: The load

**1. Design current: what the circuit really draws**
- Sources: EAL slides p.10 to 19, formula sheet step 1, pack question 4a. C&G: Section A part (a)
  of every paper.
- Recalls: Ib for a 20 kW three-phase heater at 400 V: 20 000 ÷ (√3 × 400) = 28.87 A (slides
  p.16). The wrong options are the two usual slips: 50.00 A (no √3) and 86.96 A (230 V).
- Re-teaches: the cable carries what the load draws, so Ib comes from the input, not the output;
  the voltage at the board when one is given; diversity as guidance.
- Practises: A, the showroom motor's Ib, 23.08 A, and its delta running current, 13.33 A;
  a changed-numbers item (a 15 kW heater at a board measured at 396 V: 21.87 A). B, why a final
  circuit's Ib is worked at the sub-board's voltage.
- Main picture: the same 20 kW output stretched by efficiency into input power, then by power factor
  into apparent power, with Ib read from it (28.87 A at 1 and 1, 41.48 A at 0.8 and 0.87, slides
  p.16 and 17). Mockup `reteach.html`.

**2. Maximum demand: what the whole building draws**
- Sources: EAL pack questions 1b and 10, guide p.3, slides p.10. C&G: none (the papers do not ask
  it; brief section 2), so the practice uses the C&G shapes ("Determine…", "State two…").
- Recalls: is diversity a rule? No: "it's guidance and doesn't have to be applied" (slides p.10).
- Re-teaches: what maximum demand is for (sizing the supply and each submain); diversity as common
  sense rather than every load at once (p.10); why the loads are balanced across the three phases
  (balanced currents cancel in the neutral: AC circuits, lesson 10).
- Practises: A, the showroom's DBL2 lighting load from the drawing key's wattages, split across L1
  to L3 (the course's own split, said on screen), then the whole installation's maximum demand with
  the motor's 23.08 A (question 10). B, "State two reasons a designer applies diversity" (p.10:
  common sense, and smaller cables at lower cost).
- Main picture: three phase bars and the neutral; drag circuits between phases and watch the
  neutral current fall as they balance.
- To source: the On-Site Guide's Appendix A allowances (one value per load type used); the
  luminaire counts, recounted by hand from the lighting drawing; which book "The Electrical
  Installation Guide" is (guide p.3).

### Unit 2: The cable

**3. Device and cable: Ib ≤ In ≤ Iz, and the factors**
- Sources: EAL slides p.20 to 28, flowchart steps 2 to 6, pack question 4b. C&G: Section A parts
  (b) to (f) (P1, P2, P3 question 1); Section B on lightly loaded cables in a group (P1 Q10b) and
  on choosing a wiring system (P3 Q3c).
- Recalls: three factors that do not all act together (0.94, 0.8, 0.88; In 16 A): It = 21.28 A,
  the worse of 16 ÷ (0.94 × 0.8) and 16 ÷ (0.94 × 0.88) = 19.34 A. Multiplying all three, 24.18 A,
  is the slip (slides p.25 to 27).
- Re-teaches: each factor is heat the table did not allow for; factors only where they act
  together; Cg always counts the circuit itself; the worst section and the worst reference method
  set the cable (p.25, 28); device types and starting current (p.20).
- Practises: A, the motor question's parts (c) the device and its rating, (d) the factors (20 °C
  ambient, pack p.3; six cores in one conduit), (e) the table and column, (f) the CSA. B, when
  lightly loaded cables can be left out of Cg; what decides a wiring system. Two recall screens
  only (his Level 3 awards cover them): containment sizing by cable factors, and the showroom's
  external influences (cars driven over the floor, pack p.3; external column luminaires).
- Main picture: the cable run in sections (clipped, in trunking with another circuit, through
  insulation), each section's factors and It, the worst one outlined.
- To source: Ca at 20 °C for 90 °C cable; Cg for a star-delta motor's six cores; the Table 4C1 note
  on lightly loaded cables; the B, C, D trip multiples; the reference-method question on slides p.28.

**4. Overload: why 1.45** (why piece A)
- Sources: EAL slides p.25, 29 to 32. C&G: Section B, a hazard of overload (P3 Q3b).
- Recalls: a 10 A breaker "will not operate until it has 14.5A" (p.30).
- Re-teaches: why piece A: the device's I2 and the cable's 1.45 Iz on one current line; a
  rewireable fuse's mark passes the cable's; Cf = 0.725 = 1.45 ÷ 2 pulls it back
  (`mockups/why-145.html` in the earlier set shows it).
- Practises: A, an old board with a BS 3036 fuse (a changed scenario: a new showroom has none):
  It = In ÷ 0.725 (10 A gives 13.79 A). B, "State one hazard of overloading a cable", "Explain why a
  BS 3036 fuse needs Cf".
- To source: the BS 3036 fusing factor (2 is derived from Cf here); the conventional time (the
  "10,000s" of p.30 and 32).

**5. A neutral that carries more than the line** (why piece B)
- Sources: EAL slides p.33 to 37. C&G: none.
- Recalls: the neutral current of a balanced three-phase load: none (p.33).
- Re-teaches: why piece B: fundamentals cancel in the neutral, third harmonics line up and add;
  Table 4Aa's bands; Ibn = 3 × h × IL.
- Practises: worked, the slides' 150 A at 35%: 157.5 A in the neutral, In 160 A, It = 160 ÷ (0.94 ×
  0.65 × 0.86) = 304.50 A, 240 mm² (p.35, 36; the slide's 304.4 A is cut short). A, the showroom's
  fluorescent lighting (the drawing key's 4 × 36 W modular and twin 58 W fittings), only with a
  maker's stated harmonic figure (p.37: "only to be considered if the manufacturers data explains
  that there will be one present"). B, "Explain why third harmonic currents add in the neutral".
- To source: Table 4Aa's wording; a maker's harmonic figure for one of the drawing's fittings.

### Unit 3: The volts

**6. Voltage drop from the intake**
- Sources: EAL slides p.37 to 42, formula sheet step 7 and its note, guide p.6. C&G: Section A
  parts (f) and (g).
- Recalls: a supply given as 395 V and a total drop of 19.8 V: it fails, because 5% of 395 V is
  19.75 V (p.41).
- Re-teaches: the limit covers the whole path from the origin; a percentage of the voltage you were
  given; a three-phase submain's drop ÷ √3 before adding a single-phase circuit's; chasing the drop
  (p.42).
- Practises: worked, the slides' heater at 85 m: 29 × 13.04 × 85 ÷ 1000 = 32.14 V fails 11.50 V;
  at 6.0 mm² 8.09 V passes (p.42). A, part (g) of the motor question, and the submain's share when a
  circuit is fed from a sub-board. B, "Explain why the submain's voltage drop must be included".
- Main picture: the voltage falling along the run from the origin through the board to the load,
  with the limit as a band.

**7. Voltage drop, refined: Ct and power factor** (why piece C)
- Sources: EAL slides p.43 to 45. C&G: none.
- Recalls: the 6.0 mm² cable carries 13.04 A of its 41 A: does it run at its full 70 °C? No, it runs
  cooler (p.43).
- Re-teaches: why piece C: a lightly loaded conductor is cooler, so its resistance and drop are
  lower; with a known power factor only the parts of the r and x drops along the voltage count.
- Practises: A, the showroom's DBL2 submain drop refined with r, x and the power factor, if its
  size is 25 mm² or more (p.45). B, "Explain why a lightly loaded cable drops less than the table
  says".
- To source: both formulas (BS 7671 Appendix 4) and one r, x row. The slides give neither ("Let's go
  to the drawing board", p.43, 45). The lesson is built only once they are quoted.

### Unit 4: The fault

**8. Shock protection, and when Zs is too high**
- Sources: EAL slides p.46 to 56, formula sheet steps 12 to 15, pack question 6 and guide p.9 (EV
  charging). C&G: question 2 parts (a), (b) and (d); Section B on an RCD when Zs is too high (P1 Q5,
  P3 Q5), on supplementary bonding when disconnection cannot be met (P2 Q4), and on which circuits
  have 0.4 s and 5 s (P1 Q4d, P3 Q4d).
- Recalls: a 6 A type B breaker's maximum Zs of 7.28 Ω guarantees how much fault current?
  230 × 0.95 ÷ 7.28 = 30.01 A, its Ia of 30 A (p.47). The slips: 31.59 A (no Cmin) and 34.75 A
  (Cmax).
- Re-teaches: the fault loop (Ze + R1 + R2); the multiplier works it out hot (p.53); Cmin gives the
  least current (p.48); the times are maximums, not actual times (p.50).
- Practises: worked, the slides' immersion heater: R1+R2 24.2 × 1.2 × 15 ÷ 1000 = 0.436 Ω, Zs
  0.646 Ω, If 338.24 A (slides: 0.43 Ω, 0.64 Ω, 341.4 A, cut short; the pass stands). A, question 2
  (a) Zs of the motor circuit on the showroom's TN-C-S supply, Ze 0.1 Ω, and (b) is it acceptable?
  B, "Explain why Cmin is applied" (P2 Q2d's shape; points from slides p.47 and 48), and "What must a
  designer consider for the EV charge points on a TN-C-S supply?" (pack question 6; guide p.9: RCD
  protection, PEN fault protection, optional load management).
- Main picture: the earth fault loop as a ring beside the device's curve; lengthen the run and the
  fault current's point slides towards the time limit, then past it in red.
- To source: R1+R2 per metre for the motor circuit's sizes; the RCD condition and its current
  regulation number; Section 722's text on TN-C-S for the EV question.

**9. Surviving the fault: heat, short circuits, breaking capacity** (why piece D)
- Sources: EAL slides p.57 to 70, flowchart steps 17 to 20 and note 2, guide p.5 (thermal
  constraints, SWA armour as cpc), pack p.3 (4.6 kA). C&G: question 2 part (c); Section B on the
  short circuit at a low fault level (P2 Q5) and the armour as cpc (P3 Q2).
- Recalls: in S = √(I²t) ÷ k, which factor gives I? Cmax (p.62).
- Re-teaches: why piece D: one Zs, two fault currents (Cmin for whether the device opens in time,
  Cmax for the heat the cpc must take); the same equation turned round for the live conductors
  (t = k²S² ÷ I², p.66); breaking capacity (IPF ≤ Icn, p.70).
- Practises: worked, the slides' heater (0.94 and 1.09 mm² from the slides' 341.4 A and 395.3 A;
  the slides print 0.93 and 1.08, cut short) and their short circuit (Ze(l/n) 230 ÷ 300 = 0.767 Ω,
  R1+Rn 0.474 Ω, Zs(l/n) 1.241 Ω, 203.87 A at Cmax, t = 143² × 2.5² ÷ 203.87² = 3.08 s; slides
  3.02 s). A, part (c) of question 2 for the motor circuit's cpc; the MDB's devices against 4.6 kA;
  the DBL2 submain's SWA armour as its cpc, "justified by calculation" (guide p.5). B, "Explain the
  difference between a suitable and a minimum cpc" (flowchart note 2).
- To source: armour resistance and k for SWA; why the stated 4.6 kA is about twice 230 ÷ 0.1 = 2.3
  kA.

### Unit 5: The whole job

**10. The showroom, end to end**
- Sources: EAL pack questions 3a and 3b, guide p.5 and 6, the two drawings. C&G: a whole Section A,
  questions 1 and 2, in one sitting.
- Recalls: the supply and the five boards (pack p.3, 4).
- Re-teaches: nothing new. The project guide's key points become the checklist (section 4).
- Practises: A, the submain from the MDB in the plant room to DBL2 in the tools and warranty store
  (about 17 m on plan plus the drops into the ceiling voids, scaled from the power drawing and said
  to be approximate), then DBL2's longest circuit, one part a screen, every result carried forward:
  Ib, In, factors, CSA, voltage drop from the intake, Zs at DBL2 then at the end, the thermal
  checks, breaking capacity. B, "Why must every length of the run be included?" (guide p.5).
- Main picture: the app's own simplified plan of the showroom (rooms as rectangles, the boards where
  the power drawing puts them, the route), and a one-line diagram whose figures fill in as he works.

**11. Verification and handover**
- Sources: EAL pack questions 9a and 9b. C&G: why the installed Zs is usually below the design value
  (P1 Q2b), comparing measured with maximum Zs (P1 Q10c, P3 Q9a), what a designer gives the inspector
  (P2 Q8a), what sets the first inspection interval (P2 Q8b).
- Recalls: a reading of R1+R2 taken cold: is it compared with the design's hot figure as it stands?
  No.
- Re-teaches: the design predicts the readings; correcting a cold reading to running temperature;
  why installed values usually come in lower.
- Practises: worked, the immersion heater's expected cold R1+R2, 24.2 × 15 ÷ 1000 = 0.363 Ω (the
  design's figure before the ×1.2). A, the showroom's as-built readings (labelled example readings)
  against its design. B, "List three items of information a designer should give the inspector";
  "State what decides the showroom's first periodic inspection interval".
- Main picture: the design's value and the measured value as bars, corrected to the same temperature.
- To source: everything in this lesson beyond the arithmetic (his materials have no verification
  method): BS 7671 Part 6 and GN3 on comparing readings, the correction rule, the basis temperature
  of the OSG's mΩ/m values, the inspection interval guidance, the handover documents.

---

## 2. Lesson 1, screen by screen (the pattern)

Every lesson follows this shape; the counts change a little. Mockups are named.

| Step | Screen | What happens |
|---|---|---|
| 1 | **Do you still have it?** (`recall.html`) | "A 20 kW three-phase heater on a 400 V supply, power factor 1, efficiency 100%. What is its design current, Ib?" 28.87 A / 50.00 A / 86.96 A. Right: "Still there", with the working and what the two slips were, then **Refresh the why** or **Skip to the practice** (to step 7). Wrong: the feedback names the slip and the lesson carries on. |
| 2 | **What it is for** | "Ib is the current the circuit carries in normal service (slides p.11). The device, the cable and every check after them are sized from it." Then **if it is skipped or wrong**: every later step is wrong in the same direction. |
| 3 | **The why** (`reteach.html`) | The interactive: same 20 kW output; drag efficiency and power factor down from 1; input = output ÷ efficiency, apparent = input ÷ power factor, Ib = apparent × 1000 ÷ (√3 × 400). 28.87 A at 1 and 1; 41.48 A at 0.8 and 0.87; 58.90 A at 0.70 and 0.70. Under it, in red, what happens if it is skipped (p.17). |
| 4 | Check | "At power factor 0.8 and 87%, what is Ib?" 41.48 A / 36.08 A (power factor only) / 33.18 A (efficiency only), each slip with its own hint. |
| 5 | The voltage at the board | A sub-board at 393 V: 20 000 ÷ (√3 × 393) = 29.38 A (p.19), and why its own voltage is used (p.18). Diversity in one line: guidance from the OSG, 10 × 100 W at 66% is designed at 660 W (p.10). |
| 6 | **Worked example** | The slides' three cases (p.16, 17, 19) revealed line by line, noting where the slide's 28.86 A and 41.47 A are cut short. |
| 7 | **Section A**, question 1 (a) | The showroom's motor (scenario from pack p.3 and 4): "Determine the design current." Typed: 11 000 ÷ (√3 × 400 × 0.86 × 0.8) = 23.08 A. |
| 8 | **Section A**, question 1 (b) (`section-a.html`) | (a) carried forward. "(b) Determine the current each cable from the starter to the motor carries when the motor runs in delta." 23.08 ÷ √3 = 13.33 A (13.32 A from the unrounded Ib is accepted too). Next in lesson 3: (c) to (e). |
| 9 | **Section B** (`section-b.html`) | "Explain why Ib for a final circuit fed from a sub-board is worked at the voltage at that board, not at 400 V." Written, then marked against four points (section 3). |
| 10 | Section A, changed numbers | A C&G shape with new numbers: a three-phase 15 kW water heater at a board measured at 396 V: 15 000 ÷ (√3 × 396) = 21.87 A. |
| 11 | **Keep this** (`summary.html`) | The card: what it is for, the rule (single- and three-phase, U at the board), the traps, where it lives, the showroom figures so far. Saved as the first page of the Book's chapter. **Finish the lesson.** |

Numbers are typed where the C&G papers would have him write a figure (Section A), and picked where
the aim is to catch a named slip (recall, checks). A typed answer is accepted within the rounding the
course uses: each line is worked from the figures shown before it, rounded as shown, and the answer
from unrounded figures is accepted too.

---

## 3. How written answers are marked

- **The points come from his sources.** Each Section B question has three to five model points,
  each a short statement taken from his slides, formula sheet, pack or guide, or a quote research
  has found (BS 7671, GN3, the OSG), with its citation shown under it. A question may say how many
  make a full answer ("a full answer makes any three"), as a mark scheme does. That is a target,
  not a score. Points are written at build time and checked by a fresh reader, like every lesson.
- **Claude marks his words against the points.** The app sends his answer and the points to Claude
  through the existing `grade` prompt (the say-it-back grader, its rubric widened to five points
  here). Claude returns which points he made, in any wording that makes the point (an examiner's
  "accept equivalent"), one line on what he did well, and one nudge towards a missing point that
  does not give it away.
- **What he sees** (`section-b.html`): each point with an ink tick (made) or a dashed ring (not yet),
  never a number of marks and never a grade. A statement that is wrong, not just missing, is named
  in red ("This part isn't right: …"), since red is for mistakes.
- **Another go, then the model answer.** One more try, marked the same way, then the model answer,
  written from the points.
- **If Claude cannot be reached** (no signal, a failed call), the points appear as a checklist and he
  ticks the ones he made, as he would with a printed mark scheme.
- His answers are kept with his progress, like his say-it-back answers, and can come back in review
  if he turns it on (section 7).

Example (lesson 1, step 9). Points: the submain drops voltage, so the board is below 400 V (slides
p.18); for the same power a lower voltage needs more current, Ib = P ÷ (√3 × U) (p.13, 19); the
device and cable are chosen from Ib, so both would be picked on too small a current (p.22); for
example 28.87 A at 400 V against 29.38 A at 393 V (p.16, 19). His answer in the mockup makes the
first two; Claude's nudge: "Say what 'undersize it' does: Ib is what the device and the cable are
chosen from."

---

## 4. How the showroom threads through

- **The case file.** One set of figures for the whole course, built and checked once: the givens
  (pack p.3 and 4: 400 V three-phase four-wire, TN-C-S, Ze 0.1 Ω, 4.6 kA, 20 °C, the five boards,
  the motor; the drawings: board positions, the lighting key's wattages, scaled lengths), the
  course's own assumptions said as such (where the motor's starter is, which luminaires DBL2 feeds,
  the routes), and every figure the lessons work out, each tied to the lesson that works it. The
  course page shows it (`course.html`), with the figures worked so far.
- **One Section A question built across lessons**, as C&G Section A sets two linked questions on one
  scenario. Question 1 is the motor circuit: (a) design current and (b) delta running current in
  lesson 1; (c) device, (d) factors, (e) table and column, (f) CSA in lesson 3; (g) actual voltage
  drop in lesson 6. Question 2: (a) Zs and (b) is it acceptable in lesson 8; (c) thermal
  constraints in lesson 9; and "why Cmin" as lesson 8's Section B. Each lesson's part opens with the
  scenario and the parts done so far.
- **The right figure is carried forward.** If he gets a part wrong, the next part starts from the
  course's figure and says so, so one slip never spoils the rest (as an examiner carries an error
  forward).
- **Lesson 2** does the whole building's maximum demand and balancing (questions 1b and 10).
  **Lesson 10** designs the DBL2 submain and its longest circuit end to end (questions 3a and 3b).
  **Lesson 11** verifies it as built and covers the handover (questions 9a and 9b).
- **His project guide's key points become the checks** at the parts they apply to, quoted:
  "Remember to include all lengths of the cable run in your calculations not just the main cable
  routes" (guide p.5); "Include calculations for thermal constraints" (p.5); "If using SWA it is
  acceptable to use the SWA as the CPC as long as it is justified by calculation" (p.5); compare the
  calculated Zs "to the maximum permitted for the device" (p.5); "Include the sum of all voltage drops
  from the intake equipment to the end of the circuit in your calculations" (p.6); "If going from 3
  phase to single phase make sure voltage drops are calculated correctly" (p.6). In lesson 10 they
  are the checklist he ticks off before the design is called done.

---

## 5. What I kept and dropped from the EAL questions, and why

His Level 3 awards (18th Edition, Building Regulations, Initial Verification, Periodic Inspection,
PAT, Fundamental Inspection) already cover a lot of the assignment's non-calculation questions. A
question earns a place where it teaches design judgement his Level 3 work did not.

| Pack question | Decision | Why |
|---|---|---|
| 1a wiring systems and containment | **One recall screen** in lesson 3 | Choosing and sizing containment by cable factors is NVQ Level 3 work he holds; the OSG factors are not in his course materials. |
| 1b dividing and balancing circuits; 10 maximum demand | **Kept: lesson 2** | Level 4 criterion 2.4 and real design judgement: it sizes the supply and every submain. Diversity is on slides p.10. |
| 2 switchgear from makers' literature | **Dropped**, except breaking capacity | Choosing products dates quickly and is not teachable by interaction. The design part, each device's Icn against 4.6 kA, is in lesson 9. |
| 3a, 3b submain and longest circuit | **Kept: lesson 10**, the capstone | The core of the assignment. |
| 3c longest power circuit from DBP2 | **Folded** into lesson 10 as an optional second run | The same method again on another circuit. |
| 4 the motor | **Kept**, as Section A's running question | Fully specified in the pack, so every figure is real. |
| 5 lighting control | **Dropped** | Controls and products, not a design calculation; not in his course. |
| 6 EV charging | **Kept as a Section B question** in lesson 8 | The design judgement (RCD protection, PEN fault protection on TN-C-S, guide p.9) is real and current, but Section 722 is 18th Edition ground he holds, and its text changed in recent amendments, so it is built only when research quotes the current text. |
| 7 emergency lighting by the lumen method | **Dropped** | It needs BS 5266 and a maker's emergency lumen output, neither in his materials; it is a separate discipline; at sea it follows other rules. |
| 8 IP codes | **One recall screen** in lesson 3 | 18th Edition ground he holds; the showroom's external influences make a good quick recall. |
| 9a first inspection interval; 9b handover documents | **Kept: lesson 11** | Where design meets verification, which is the Level 4 step beyond his inspection and testing awards. |

From the **C&G papers**, about 70% of the marks are protective measures, isolation and switching,
special locations, selection and erection, EMC and test methods: his Level 3 awards cover those,
so they stay out. Every calculation question shape is used, and the Section B questions that tie
design to verification are kept (lessons 3, 4, 8, 9, 11 list them).

---

## 6. What I changed from the brief Dan was given, and why

- **"Skip to the practice"** after a right recall answer. He has done this course; he should not sit
  through a re-teach of what he still has.
- **One Section A question built across the lessons**, not a new scenario each time, so the practice
  feels like the C&G paper's linked questions, and the capstone then does a whole design in one go.
- **Each lesson also has one changed-numbers item** from a C&G shape, so the practice is not only
  the showroom.
- **Eleven lessons, not ten.** Maximum demand and verification each get a lesson of their own,
  because the EAL assignment asks for them and they are design judgement, not arithmetic. Voltage
  drop keeps its two lessons (Ct and the power-factor drop are the Level 4 part).
- **The summary card becomes a page of the Book**, so the reference he wanted for real work lives
  in one place, chapter by chapter.

---

## 7. What the app needs

The lessons stay what the app already plays: **steps lessons** (`format: 'steps'`, read mode), one
kit page each, built and self-tested by `tools/course/RUNBOOK.md`. The look is the one Dan has seen:
the lesson bar, then the frame with its step dots, big question, answer buttons, Check and Why?
(the mockups draw it with the app's D4 tokens). New pieces:

1. **Typed numeric answers** in the kit: a `K.answer({id, unit, answer, tolerance, accept})` helper
   (a decimal keypad field, graded in the frame to the course's rounding), swept by the self-test.
2. **Written answers marked by Claude.** A kit page cannot reach Claude (no network in the sandbox),
   so the host does it: the frame posts `{type: 'written', id, text, go}`; the host reads
   `lesson.written[id] = {q, points: [{text, cite}], need, model}` from the lesson document (checked
   data; the page only names the id), runs the existing `grade` prompt through `U.ask` (rubric up to
   five points), saves the answer under the idea's progress, and replies `{type: 'marked', id, met,
   nailed, followUp, wrong?}`, or `{type: 'marked', id, error}`, which turns on the self-tick
   fallback. Only his own words and the lesson's points leave the page.
3. **The case file**: `topics/{tid}/case` (shared, written at build time): givens, assumptions and
   figures by lesson. The host passes it into each frame as `K_CASE`, as it passes `K_THEME`, so
   every lesson shows the same figures. The validator checks that each figure a page prints is in
   the case file or in the lesson's own worked numbers.
4. **Summary cards**: `lesson.summary = {title, for, rule, traps: [{text, cite}], where, figures}`,
   fact-checked like the rest of the lesson. The page draws it as its last screen;
   `tools/course/guide.mjs` writes it as the guide's first page (`{kind: 'summary', …}`); the
   dossier's chapter opens on it; the course page's "Your summaries" opens the Book's dossier.
5. **The course page**: unit headings in the path (an optional `unit` on each idea), the case card,
   source tags per lesson, and the Keep it fresh switch.
6. **Keep it fresh** (optional, off by default; it extends the pending "puzzles from steps lessons"
   work in `docs/NEXT.md`, which waits for Dan's yes): the recall openers come back as choice cards,
   the Section A parts as a `calc` card that draws fresh numbers each time from the same rule and
   rounding, and his Section B answers as the existing `recall` card, marked by Claude against the
   same points.
7. **Validators and the runbook**: written points and summaries must each carry a citation; the
   fact-check reads them like the rest of the lesson; `assemble.mjs` writes the case file.

The plan validator allows a ready-made course more than eight ideas (`maxIdeas`, as Calculus
fundamentals' ten), so eleven fit.

---

## 8. Build cost, against the ten-lesson plan

| | Ten-lesson plan (brief) | This design |
|---|---|---|
| Lessons | 10 steps lessons | 11 steps lessons |
| Research | about 0.5M | about 1.0M (the brief's list, plus the points for Section B answers: GN3 and BS 7671 on verification and handover, Section 722, the OSG's diversity allowances, the case file's table values) |
| Lessons at the measured full rate (1.65M each, Fractions lessons 4 to 8) | about 16.5M | about 18.2M |
| App work (typed answers, written marking, case file, summary pages, course page) | none | about 3M (a reasoned guess: there is no measured app-build cost in this repo) |
| Keep it fresh cards | none | about 1M, only if he wants them |
| **Total** | **about 17M** | **about 22M** (21M to 23M), about 1.3 times |

The extra is the eleventh lesson, marking written answers and the case file. **A cheaper course**,
about 19M: nine lessons, with Ct and the power-factor drop folded into lesson 6 and overload into
lesson 3 (the why pieces kept as screens inside them).

**Pilot first**, as the runbook asks: the typed answer, the written marking and the summary page
(about 2M), then lesson 1 (about 1.65M), about 3.5M to 4M, for Dan to try on his phone before the
rest is built.

---

## 9. Open questions for Dan

1. **Eleven lessons, or nine** (cheaper, with Ct and power factor inside voltage drop, and overload
   inside the cable lesson)?
2. **EV charging** as one written question in lesson 8 (proposed), or a lesson of its own?
   Emergency lighting and lighting control left out: agreed?
3. **Written answers marked by Claude** against points from your sources, with ticking the points
   yourself as the fallback: is that how you want them? Should a question say how many points make
   a full answer?
4. **Which edition?** Your course taught BS 7671:2018+A2:2022; A3 (2024) is out. The points, the
   summaries and any table value must follow one, and whether A3 changes any of them is unchecked.
5. **Keep it fresh**: off unless you turn it on (proposed)?
6. **The showroom's gaps**: the motor's position, which luminaires DBL2 feeds and the routes are not
   on the drawings, so the course states its own and says so. All right?
7. Do you still have the **course webinars** or the **C&G mark schemes**? They would give model
   points directly.

**Research the build must add to the brief's section 7** (each quoted word for word with its
source): the Section B points for lessons 8, 9 and 11 (GN3 and BS 7671 Part 6 on what a designer
gives the inspector, the first inspection interval, handover documents, why installed Zs comes in
lower, correcting readings for temperature); Section 722 on TN-C-S; the OSG's diversity allowances
for the showroom's loads; and the case file's table values, one cited value at a time.

---

## 10. The mockups

In `refresher-mockups/`, each one self-contained (no external files). They use the app's lesson bar
and the kit frame, themed as the app themes it (D4 tokens; the kit's own font inside the frame).
Every number is printed in his materials or worked from the rule on the screen.

| File | Shows | Figures |
|---|---|---|
| `course.html` | The course page: the running case with its sources, Section A filling in (lesson 1 done), eleven lessons in five units with their EAL and C&G sources and the four why pieces, Your summaries, Keep it fresh | pack p.3, 4 |
| `recall.html` | Lesson 1, step 1: Do you still have it?, answered right, with Refresh the why or Skip to the practice | 28.87, 50.00, 86.96 A (slides p.16) |
| `reteach.html` | Step 3: the why, live (efficiency and power factor stretch the draw), and what goes wrong if skipped | 20.00 kW, 22.99 kW, 28.74 kVA, 41.48 A; 58.90 A at 0.70 and 0.70 (slides p.15, 17) |
| `section-a.html` | Step 8: Section A question 1 on the showroom's motor, (a) carried forward, (b) answered and checked | 23.08 A, 13.33 A (pack p.4) |
| `section-b.html` | Step 9: a written answer marked by Claude against four points from his slides | slides p.13, 16, 18, 19, 22 |
| `summary.html` | Step 11: Keep this, the card kept in his Book | slides p.10 to 19; 23.08 A, 13.33 A |

The four why pieces keep the design in `mockups/why-145.html` (why piece A) from the earlier set.
Screenshots at 360 × 780 and two contact sheets were made with Playwright for review; they are not
kept in the repo.
