# Design and verification of electrical installations: the course brief

Written 19 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
a planned course for the new Electrical engineering shelf, built from your own Level 4 Design and
Verification course materials, in their order. You asked (19 Oct): "use the resources for my level 4
D&V course as another course on the electrical shelf. Don't build it yet". So this is a plan only:
nothing is researched in full, written or built. The decisions are taken for you and listed below.
Change any you like.

**It is a refresher, not new teaching.** You hold this qualification already, with the L3 18th
Edition and the three inspection and testing awards. So the course never re-teaches what those cover.
It walks your course's own calculation process step by step and spends its screens on *why* each step
is there, more deeply than a three-hour exam course has time for.

**Sources used here.** Five files are in `source/` beside this brief (the last two came on 19 Oct,
second batch):
- **Slides**: `eal-l4-design-and-verification-spec.pdf`, 70 pages. It is not the EAL qualification
  specification, despite the file name. It is your course's teaching slide deck: one slide a page,
  with no units or learning outcomes in it. It is cited below as "slides p.N", the PDF page.
- **Flowchart**: `circuit-design-calculation-process.pdf`, 1 page, "Electrical Circuit Design
  Calculation Process - BS7671:2018 + Amd2:2022", 20 numbered steps with two loops. Its note says
  "Created by Tony Maus" and calls it "representative only". Cited as "flowchart step N".
- **Formula sheet**: `circuit-design-formula.pdf`, 1 page, the formulas keyed to the flowchart's
  steps. Cited as "formula sheet step N".
- **Learner pack**: `eal-ed4-assign-01a-learner-pack.pdf`, 9 pages, EAL's assignment ED4-01A, Issue
  1.3 (footer "EAL-ED4-01A-LP-ISSUE 1.3-1122"): the design project set on a new car showroom, and the
  Appendix 1 checklist. Cited as "pack p.N", the PDF page (its own footers jump from "1 of 9" to "2
  of 7").
- **Project guide**: `eal-l4-project-presentation.pptx`, 12 slides, "Project Guide", your course's
  key points for each assignment question. Converted to PDF in `../pptx-pdf/` to read. Cited as
  "guide p.N".

The real qualification document was found on the web for this brief (one search and one fetch, 19
Oct). It is the **EAL Qualification Manual, Issue 1.3** (EAL-ED4-QM-Issue 1.3-1122), cited as "EAL
QM p.N". Its unit list and assignment checklist are below. The research stage must re-fetch and
quote it (see "Research the build must still do").

## Changes from the materials of 19 Oct (second batch)
The learner pack and the project guide changed four things:
- **The criteria now come from your own papers.** The pack's Appendix 1 (pack p.8) prints the same
  ED4-01 checklist as the QM, D1 and 1.1 to 5.0. `specRefs` now cite the pack. The full learning
  outcomes are still not in anything you have sent.
- **Lesson 10 is now the showroom.** It was "the whole process end to end" on an invented circuit.
  Now it is the assignment's own job: a three-phase TN-C-S supply with Ze 0.1 Ω and a prospective
  fault current of 4.6 kA, 20 °C ambient (pack p.3). The design runs from the MDB through the submain
  to DBL2 and on to DBL2's longest circuit (questions 3a and 3b, pack p.4). The verification screens
  stay at the end of it. The guide's key points become its checks: "include all lengths of the cable
  run", "Include calculations for thermal constraints", "Compare your calculated Zs value to the
  maximum permitted" (guide p.5), and "the sum of all voltage drops from the intake equipment" (guide
  p.6).
- **New puzzles with real figures.** The question 4 motor (400 V, 11 kW, power factor 0.8, 86%
  efficiency, star-delta, pack p.4) goes into lessons 1 and 3. The 20 °C ambient goes into lesson 3,
  and the 4.6 kA into lesson 9. See "Puzzles from the assignment" in section 3.
- **A second course is now possible, not recommended yet.** Most of the assignment is not circuit
  calculation: containment sizes, load balancing and maximum demand, switchgear choice, lighting
  control, EV charging, emergency lighting by the lumen method, IP codes, the inspection interval and
  handover documents (questions 1, 2 and 5 to 10, pack p.4 to 5). Your slides teach none of it. It
  would make a second course built to the assignment, sketched in section 8. It needs the
  assignment's two drawings first, which are not in the pack.

**Still missing after the second batch:**
- the Ct and power-factor voltage-drop formulas (nothing new on them);
- verification as a method. The assignment asks only for the first inspection interval and the
  handover documents (question 9, pack p.5). So lesson 10's measured-against-design screens are still
  sourced by research;
- the full learning outcomes;
- the two drawings: "The two attached drawings show the proposed electrical installation" (pack p.3).
  Without them there are no circuit lengths or loads, so lesson 10's lengths and loads are labelled
  example figures.

The order of lessons 1 to 9 and the one-course decision do not change.

## The short version
**One course, ten lessons**, in your course's order (slides p.6, the flowchart):
1. Design current: what the circuit really draws
2. Choosing the device: Ib ≤ In and the time-current curve
3. Rating factors: what makes a cable run hot
4. Overload: why 1.45
5. Harmonics: when the neutral carries more than the line
6. Voltage drop: the volts left at the load
7. Voltage drop, refined: hot conductors and power factor
8. Shock protection: will it disconnect in time?
9. Surviving the fault: the adiabatic check and breaking capacity
10. The showroom: one design end to end, then verified

**The main pictures** (one a lesson, each moved with your finger, each showing the cause):
- **The nameplate and its triangle (1).** A motor's rating plate beside the power triangle. Drag the
  power factor and the efficiency down from 1. The current bar for the same output grows, from the
  slides' 28.87 A to 41.48 A.
- **The device's curve (2).** A time-current curve on log axes, with B, C and D bands. Drag a
  starting current along it and see which breaker would trip on start-up.
- **The cable run in sections (3).** One circuit drawn as its real route: clipped, in trunking with
  another circuit, through a wall with insulation. Each section shows its own factors and the It it
  needs. The worst section lights up as the one that sets the cable.
- **Two marks on one current line (4).** The device's I2 and the cable's 1.45 Iz on one axis. Drag In,
  Iz and the fusing factor. The device mark passes the cable's mark when a semi-enclosed fuse goes in,
  and Cf = 0.725 pulls it back.
- **Three phases and the neutral (5).** Three line currents and their sum in the neutral. Drag a third
  harmonic up. The fundamentals cancel, the third harmonics stack, and the neutral bar overtakes the
  line bar near 33%.
- **The voltage along the run (6).** Origin, sub-board, load, with the voltage drawn falling along the
  cable. Drag length, CSA and Ib. A band marks 3% or 5% of the voltage you were given, not 400 V.
- **Hot conductor, angled current (7).** A conductor-temperature gauge driven by Ib ÷ It, which sets
  Ct. Beside it the current arrow at angle φ, with the cable's r and x drops as arrows. The drop that
  counts is shorter than z times I.
- **The fault loop (8).** The earth fault path drawn as a loop, Ze plus R1 plus R2. Drag the length and
  CSA. The fault current falls, and on the device's curve the operating point slides from 0.1 s
  towards the 0.4 s line, then past it, in red.
- **Heat in against heat it can take (9).** Two bars: the fault's I²t and the conductor's k²S². Drag the
  fault current, the time and S. Switch Cmin and Cmax and watch which check each one drives.
- **The showroom's design card (10).** The assignment's showroom supply (pack p.3) feeds the MDB, the
  submain to DBL2 and DBL2's longest circuit, with the twenty flowchart steps beside each. Change one
  input and every step recomputes. A failing check sends you round its loop, and the voltage drop is
  summed from the intake. Then switch to "as built": put in measured readings and compare them with the
  design's values.

**Decisions taken for you** (say if you want any changed):
- **One course, not two.** Your materials are all design calculation. Nothing in them covers
  verification, inspection, testing or certification. A second course on verification would teach
  what your three L3 inspection and testing awards already cover, and there are no course materials
  to build it to. So "verification" is the last lesson: checking the built circuit against its design
  (EAL QM p.13, "initial verification" in the unit title). It is sourced by research, because your
  materials say nothing about it. If your course had verification slides, send them and I will look
  again. The second batch does not change this: the assignment's only verification question is the
  first inspection interval and the handover documents (question 9, pack p.5). See "One course or
  two?" below.
- **Ten lessons, about 12 screens each, in the slides' order.** The slides' list (p.6) has nine design
  stages. Overload (p.29 to 32) and harmonics (p.33 to 36) sit inside the cable-selection part of the
  slides, and each needs its own picture, so they are lessons 4 and 5. Voltage drop is split in two,
  because Ct and the power-factor correction (p.43 to 45) are the L4 part and need their own screens.
  The adiabatic check, the short-circuit check and breaking capacity (p.57 to 70) share one equation
  in two forms, so they share lesson 9. Lesson 10 is the assignment's showroom, designed end to end
  and then verified. Nine is possible by joining
  lessons 6 and 7. Lesson 7 would then get three screens, and Ct and the power-factor method are the
  two things an L3 electrician has not met.
- **Steps lessons, with a little more explaining ("Partly", RUNBOOK section 0, item 3).** Each lesson
  is SHOW then DO, ending on two or three mixed puzzles. A SHOW screen may carry a short paragraph
  where the why needs words: why the factors divide In, why 1.45, why Cmin for disconnection and Cmax
  for the cable. Every DO screen is a step of a real calculation.
- **Method and why, never whole tables.** BS 7671 tables are copyright. Lessons teach how to read a
  table and why its numbers are what they are. They use only the values your slides print, each with
  its page, plus a small set the research stage must quote (listed below). No screen reproduces a
  table. The puzzles say "from Table 4D5" and give the one value needed.
- **Numbers are computed on screen, so the slides' rounding is shown.** Several slide answers are cut
  short rather than rounded: 28.86 A for 28.87 A (p.16), 21.2 A for 21.3 A (p.27), R1+R2 0.43 Ω for
  0.4356 Ω (p.54), 0.93 mm² for 0.94 mm² (p.58). The lessons work each from the rule and say where the
  slide's figure differs. None of the differences changes a pass or fail.
- **Examples from your trade first; ships only where sourced, and never as BS 7671.** BS 7671 is for
  installations ashore. Ships are built to other rules. This brief has found no source yet for which
  rules a Royal Navy ship follows (UNCONFIRMED). A lesson may add one "at sea it differs" screen only
  where research has quoted the difference, such as a hotter ambient in a machinery space, or an
  insulated neutral that changes how a first earth fault behaves (the AC circuits notes have the
  second, SECONDARY, AC circuits research-notes 6.1). Each such screen says the ship rule is a
  different standard, not BS 7671.
- **The AC theory is borrowed, not taught again.** Power factor, the power triangle, √3 and
  impedance are AC circuits lessons 6, 8 and 10. Here each gets one line and is used. See
  `shelf-proposal.md`.
- **Edition.** Your materials are to BS 7671:2018+A2:2022 (flowchart title). Amendment 3 (2024) is now
  published: EAL's 2025 L3 specification names "BS 7671:2018 (2024) Amendment 3" (web search, 19 Oct).
  The lessons teach your course as it was taught, and the research stage must check every cited table
  value against the current amendment and say where one has changed.
- **The capstone is your assignment's job, not a new one.** Lesson 10 uses the showroom's stated
  supply (pack p.3) and the guide's key points (guide p.5 to 6). The showroom's lengths and loads come
  from drawings that are not in the pack, so they are labelled example figures until you send the
  drawings. It is a refresher on a job you have done, not a model answer to the assignment.
- **Not built yet.** You asked for a plan. When you say build, lesson 1 is built first for you to try.

## 1. The overall topic
Designing a final circuit to BS 7671 is a chain of checks, and each one answers a different danger.
First, what will the circuit draw in normal use (Ib)? Then which device protects it (In, at least
Ib)? Which cable carries that device's rating without overheating where it actually runs, once
everything that warms it is allowed for (It, then Iz)? Will that device stop an overload before the
cable is harmed (I2 ≤ 1.45 Iz)? Will enough voltage reach the load (voltage drop)? On an earth fault,
will enough current flow to open the device in time (Zs, Ia, disconnection time)? Will the conductors
survive the fault energy until it opens (the adiabatic check)? And can the device break the biggest
fault it could see (breaking capacity)? Each check can fail, and each failure sends you back to an
earlier step: a bigger cable for voltage drop, a bigger cpc for thermal withstand (flowchart steps 8
and 20). Verification is the last link: the readings taken on the finished circuit must agree with
what the design said they would be.

**It builds on:**
- **Your qualifications** (CLAUDE.md): BS 7671 design and verification already (the L4 itself), the
  18th Edition, initial verification, periodic inspection and in-service testing, and cable fault
  location. You know every term here. The course assumes them all and goes to the why.
- **AC circuits** (this shelf, being built now): real, reactive and apparent power and power factor
  (lesson 8), the impedance triangle R, X, Z (lesson 6), three-phase √3 and √3 V_L I_L cos φ, and why a
  balanced neutral carries nothing (lesson 10).
- **Maths shelf:** rearranging formulas (Solving equations, Linear equations), square roots and powers
  of ten (Powers and roots), log scales (Exponentials and logarithms, for the time-current curve),
  and the cosine and sine of an angle (Trigonometry, for lesson 7's r cos φ + x sin φ).

**Not taught again:** Ohm's law, what a breaker or fuse is, the earthing arrangements, what Ze, Zs,
R1+R2 and PFC mean, how they are measured, the test sequence, and how to fill in a certificate. Each
is used with a one-line reminder at most.

**Edges.** Single- and three-phase final and distribution circuits at low voltage, to BS 7671, by
hand, as the EAL assignment requires: "without the use of software for carrying out calculations"
(EAL QM p.10). Not covered: maximum demand of a whole installation beyond diversity (one screen),
discrimination between devices, RCD selection, protective bonding sizing, earth electrode design,
and the "associated systems" of EAL criterion 5.0 (lightning protection, fire detection, emergency
lighting, generators, UPS). Your slides do not teach them; see "Left out".

## 2. What the qualification covers, unit by unit
**The qualification** (EAL QM p.1 to 14, fetched 19 Oct): "EAL Level 4 Award in the Design and
Verification of Electrical Installations", code 601/8231/3. It "comprises of a single knowledge unit"
of 30 guided learning hours (EAL QM p.3). That unit is **ED4-01, "Design, construction management and
initial verification of electrical installations"**, Ofqual code J/507/9710 (EAL QM p.5). It is
assessed two ways (EAL QM p.9 to 10): an open-book written paper of 180 minutes, and a design
assignment, "at least a three-phase supply" (EAL QM p.12). Your slides say the same: "A three hour,
open book written exam" and "A design project", at least 40 hours (slides p.2, p.4).

**The unit's assessment criteria.** The QM does not print the full learning outcomes (they are in a
password-protected delivery pack, EAL QM p.4). Its Appendix 1 checklist (EAL QM p.13) lists what a
learner's own project must evidence. Your learner pack prints the same checklist (pack p.8), with
"D1 Project reflects learner's current knowledge and is sufficient in scope and complexity as the EAL
set project. (Including a three-phase supply)" before it. In order:
- **1.1** interprets the requirements of relevant sources of information for design;
- **2.2** designs final circuits; **2.3** designs distribution circuits; **2.4** establishes maximum
  demand, including diversity;
- **3.0** interprets the BS 7671 requirements for the installation being designed;
- **4.1** "Manually applies electrical installation design formula and carries out calculations", for
  "single and three phase circuits", naming "design current, cable size, volt drop, fault currents,
  earth fault loop impedance, thermal withstand"; **4.2** selects components across wiring systems;
  **4.3** provides design information (drawings, O&M manual);
- **5.0** interprets the design principles of associated systems.

These criterion numbers are what `specRefs` in `lessons.json` point to. The full list of learning
outcomes 1 to 5 and their wording is UNCONFIRMED until the research stage finds it. City & Guilds'
version of the same award (2396) prints its outcomes, and one reads "6 Be able to apply design and
verification procedures for single and poly phase electrical installations", worth 50% of its
assignment (C&G 2396 handbook, web search, 19 Oct). It is a different awarding body's unit, used only
as a guide to what EAL's hidden outcomes probably hold.

**The design assignment, ED4-01A** (pack p.2 to 5). You "must successfully answer ALL the
questions" for a pass, and "show all your workings out" (pack p.2). The job is a new car showroom
(pack p.3): block walls with a mineral-wool panel facade, suspended ceilings at 4.3 m in the showroom
and 2.2 m elsewhere, cars driven over the showroom floor, ambient 20 °C, and a "Three phase four
wire 400 V, with a TN-C-S earthing arrangement", Ze 0.1 Ω, prospective fault current 4.6 kA. Five
boards: MDB, DBL1, DBL2, DBP1, DBP2 (pack p.4). The questions and where the course meets them:

| Q (pack p.) | What it asks | Guide key points | In this course |
|---|---|---|---|
| 1a (p.4) | Wiring system routes, selection and justification | Sizes of tray, conduit and trunking with calculations (guide p.2) | Lesson 3 (reference method only); containment sizing left out |
| 1b (p.4) | Divide the installation into circuits, balancing loads | Maximum demand and diversity from "Section 3 of The Electrical Installation Guide"; a schedule of circuits (guide p.3) | Lesson 1 (diversity), lesson 10 (balancing, one screen) |
| 2 (p.4) | Choose the origin switchgear and sub-boards from manufacturers' literature | Installation outline as in its 3.2 (guide p.4) | Left out |
| 3a to 3c (p.4) | Fully design the DBL2 submain and the longest circuits from DBL2 and DBP2, with protective devices | All lengths of run, thermal constraints, SWA armour as cpc "justified by calculation", Zs against the device's maximum (guide p.5); all voltage drops from the intake, three-phase to single-phase per its 5.3.3, manual calculations (guide p.6) | Lessons 1 to 9; lesson 10 is 3a and 3b end to end |
| 4 (p.4) | 11 kW 400 V motor, pf 0.8 lagging, 86% efficiency, star-delta: (a) Ib, (b) minimum csa of 90 °C singles in conduit from starter to motor on "delta running conditions" | Its 4.7 (guide p.7) | Lessons 1 and 3 (puzzles) |
| 5 (p.4) | Showroom lighting control 7.30 am to 9 pm; external lights on when dark, off midnight to 6 am | Manufacturers' data (guide p.8) | Left out |
| 6 (p.5) | EV charging circuits, two outlets a point | RCD protection, TN-C-S and "PEN Fault protection", optional load management (guide p.9) | Left out (one line in lesson 8) |
| 7 (p.5) | Emergency luminaires for 15 lux in the plant room, 0.5 m working plane | "Use the lumen method", no utilisation factor, maintenance factor 0.8 (guide p.10) | Left out |
| 8 (p.5) | Where the IP code needs more protection | (none) | Left out |
| 9a, 9b (p.5) | First periodic inspection interval; handover documents | (none) | Lesson 10 (two screens, research-sourced) |
| 10 (p.5) | Maximum demand of the installation, using 4a | Linked to 1b (guide p.3) | Lesson 10 (one screen) |

The guide cites "The Electrical Installation Guide" by section (3, 3.2, 4.7, 5.3.3). The QM's
essential book is the "IET Electrical Installation Design Guide" (EAL QM p.9). Whether they are the
same book is UNCONFIRMED.

**What your slides cover, in their order** (this is the course's spine):

| Slides | Section | Course lesson |
|---|---|---|
| p.1 to 5 | The qualification: exam, permitted books (BS 7671, IET Design Guide, GN1 essential; OSG, Site Guide, GNs optional, p.3), project, how to pass | Brief only |
| p.6 | "Design Fundamentals": the nine stages, from general characteristics to thermal risks | Course order |
| p.7 to 9 | Regulation 132.1; Part 3's six headings for general characteristics; wiring systems from Tables 4A1 to 4A3 | 1 (one screen) |
| p.10 | Diversity: OSG Appendix A, 66% on a domestic lighting circuit, "guidance and doesn't have to be applied" | 1 |
| p.11 to 19 | Design current: single- and three-phase, power factor and efficiency, the Grundfos nameplate, the 20 kW heater worked three ways, the sub-board voltage trap | 1 |
| p.20 to 22 | Protective devices: types B, C, D; fuse systems C, E, G; gG and gM; Ib ≤ In ≤ Iz (Reg 433.1.1); In from Tables 41.2 to 41.4 | 2 |
| p.23 to 28 | Conductor size: reference method (Table 4A2), Table 4A1, rating factors Ca, Cg, Ci, Cf; the 3 kW heater with factors not together | 3 |
| p.29 to 32 | Overload: I2, "Most devices have an I2 of 1.45 times their In", I2 ≤ 1.45 Iz | 4 |
| p.33 to 36 | Harmonic currents: Table 4Aa's four bands, Ibn = 3 × h × IL, the 150 A example to 240 mm² | 5 |
| p.37 to 42 | Voltage drop: mV/A/m, 3% and 5% (Table 4Ab), total drop including the submain, 395 V not 400 V, "chasing the volt drop" | 6 |
| p.43 to 45 | Voltage drop refined: Ct; r, x and z columns and power factor | 7 |
| p.46 to 56 | Shock risk: ADS, max Zs, Ia, Cmin, disconnection times (Reg 411.3.2.2, Table 41.1), R1+R2 with the 1.2 multiplier, Zs, PEFC | 8 |
| p.57 to 62 | Thermal check on the cpc: S = √(I²t) ÷ k, k = 115, Cmax, when to use Cmin and Cmax | 9 |
| p.63 to 68 | Short circuit on the live conductors: Ze(l/n), R1+Rn with 1.28, t = k²S² ÷ I², k = 143 | 9 |
| p.69 to 70 | IPF and Icn: IPF ≤ Icn | 9 |
| (none) | Initial verification: measured values against the design | 10 (research) |
| Pack p.3 to 5; guide p.2 to 12 | The showroom assignment and the guide's key points | 10, and puzzles in 1, 3, 6, 8, 9 |

The flowchart runs the same chain as twenty steps: Ib (1), In (2), factors (3, 4), reference method
(5), conductor (6), voltage drop and its loop (7, 8), cpc (9), R1+R2 (10 to 12), Zs and its check (13,
14), PEFC (15), disconnection time (16), k (17), the adiabatic minimum cpc and its loop (18 to 20).
Its note 2 adds that "Suitable protective conductor size and minimum protective conductor size are
not the same thing" and gives a loop for the minimum.

**Where each criterion is met:** 2.2, 3.0 and 4.1 run through every lesson. 2.3 (distribution
circuits) is lessons 1 and 6 (sub-board voltage, submain drop) and 9 (fault level at a board). 2.4
(maximum demand, diversity) is lesson 1, with the showroom's maximum demand in lesson 10. 4.2
(components) is lessons 2 and 3. 4.3 (design information) gets lesson 10's handover screen. 1.1 and
5.0 are not calculation and are left out (see "Left out").

## 3. What is truly useful to brush up, in an order that builds
The order is your course's (slides p.6, flowchart), because each check needs the one before it: Ib
sets In, In sets It, the cable chosen sets voltage drop and R1+R2, R1+R2 sets Zs, Zs sets the fault
current, and the fault current sets the thermal check. What is worth your time, as a qualified
designer, is the why behind each step, the traps your slides name, and the L4 refinements most
electricians skip (Ct, the power-factor drop, harmonics, Cmin against Cmax, minimum cpc).

| # | Lesson | The skill | Spec (pack p.8; EAL QM p.13) | Materials |
|---|---|---|---|---|
| 1 | Design current: what the circuit really draws | Find Ib for single- and three-phase loads from the nameplate, with power factor, efficiency, diversity and the voltage actually at the board. Why: a cable sized on watts alone is sized on the wrong current. One screen on Reg 132.1 and Part 3's six headings as the "before the sums" checklist. | 2.2, 2.3, 2.4, 4.1 | Slides p.7 to 19; flowchart step 1; formula sheet step 1 |
| 2 | Choosing the device: Ib ≤ In and the time-current curve | Choose In and the device type. Read a time-current curve: why B, C and D exist (starting current, slides p.20), what Ia is and where it is read (Appendix 3), fuses by system and by gG or gM (p.21). The curve is drawn here once and reused in lessons 4, 8 and 9. | 2.2, 3.0, 4.2 | Slides p.20 to 22; flowchart step 2 |
| 3 | Rating factors: what makes a cable run hot | Find It ≥ In ÷ (Ca Cg Ci Cf) and pick the cable. Why the factors divide: each one is heat that the cable's tabulated rating did not allow for. Factors multiply only where they happen together, and Cg always counts the circuit itself (p.25). Design to the worst section and the worst reference method (p.28). | 2.2, 3.0, 4.1, 4.2 | Slides p.23 to 28; flowchart steps 3 to 6; formula sheet step 4 |
| 4 | Overload: why 1.45 | I2, the current that operates the device within its conventional time, is about 1.45 In for most devices (p.30). I2 ≤ 1.45 Iz says the cable can take that overload for that long (p.32). With Ib ≤ In ≤ Iz this is why Cf = 0.725 for a semi-enclosed fuse, which is 1.45 ÷ 2 (computed). | 3.0, 4.1 | Slides p.22, 25, 29 to 32 |
| 5 | Harmonics: when the neutral carries more than the line | Read Table 4Aa's bands (p.34). Work Ibn = 3 × h × IL (p.35) and decide whether line or neutral current sets Ib. Why: balanced fundamentals cancel in the neutral, but third harmonics are in step on all three lines and add (AC circuits lesson 10 has the cancellation). | 2.3, 3.0, 4.1 | Slides p.33 to 36 |
| 6 | Voltage drop: the volts left at the load | VD = mV/A/m × Ib × L ÷ 1000. Limits as a percentage of the voltage you were given (p.40 to 41). Add the submain's drop to the final circuit's. Turn a three-phase submain drop into a single-phase one by ÷ √3 (formula sheet). Chase the drop to the next size (p.42). | 2.2, 2.3, 3.0, 4.1 | Slides p.37 to 42; flowchart steps 7, 8; formula sheet step 7 |
| 7 | Voltage drop, refined: hot conductors and power factor | Ct: a cable carrying well under its rating runs cooler, so its resistance and drop are lower (p.43). The r, x and z columns from 25 mm² (p.45), and using r and x with a known power factor. Why: the tabulated mV/A/m assumes a fully loaded, hot conductor and a current in the worst phase. | 3.0, 4.1 | Slides p.43 to 45 (method only; formulas from research) |
| 8 | Shock protection: will it disconnect in time? | Zs = Ze + R1+R2, with R1+R2 from mΩ/m × multiplier × length ÷ 1000. Max Zs from Uo × Cmin ÷ Ia. Disconnection times by circuit (Reg 411.3.2.2, Table 41.1). PEFC and where it lands on the curve. Why the multiplier (operating temperature) and why Cmin (the lowest voltage gives the least fault current). | 2.2, 3.0, 4.1 | Slides p.46 to 56; flowchart steps 9 to 16; formula sheet steps 12, 13, 15 |
| 9 | Surviving the fault: the adiabatic check and breaking capacity | S = √(I²t) ÷ k for the cpc, and t = k²S² ÷ I² for the live conductors on a short circuit. Cmin for disconnection, Cmax for the conductor (p.62). Ze(l/n) and R1+Rn (p.64 to 65). Minimum against suitable cpc (flowchart note 2). IPF ≤ Icn (p.69 to 70). | 2.2, 2.3, 3.0, 4.1 | Slides p.57 to 70; flowchart steps 17 to 20; formula sheet steps 18/19 |
| 10 | The showroom: one design end to end, then verified | The assignment's questions 3a and 3b as one chain: the showroom supply (Ze 0.1 Ω, 4.6 kA, 20 °C, pack p.3), the three-phase submain from the MDB to DBL2 with its armour as cpc if justified (guide p.5), then DBL2's longest lighting circuit, voltage drop summed from the intake and turned single-phase (guide p.6), Zs at the board and at the end (formula sheet step 13), and the thermal checks. One screen balances loads across the phases and adds the motor of 4a to a maximum demand (questions 1b, 10). Then verification: measured R1+R2, Zs and fault current against the design's values, allowing for a cold conductor at test, and the first inspection interval and handover documents (question 9). The last screens are a mixed set from the whole course. | D1, 2.2, 2.3, 2.4, 4.1, 4.3; unit title ("initial verification") | Pack p.3 to 5; guide p.3, 5, 6; flowchart (all steps); formula sheet step 13; verification from research only |

**Puzzles from the assignment** (figures from the pack, results computed from the rules shown):
- **Lesson 1, the question 4 motor:** Ib = 11 000 ÷ (√3 × 400 × 0.8 × 0.86) = 23.08 A (computed; pack
  p.4). Then the "delta running conditions": in delta each winding, and each cable from the starter to
  the motor, carries the line current ÷ √3, 13.32 A (computed; AC circuits lesson 10 has the delta
  √3). The guide sends you to its 4.7 for this (guide p.7); research must quote the rule before the
  lesson states it.
- **Lesson 3, a cool room:** the showroom's 20 °C ambient (pack p.3) is below the 30 °C the tables
  assume (the 30 °C is on slides p.24), so Ca is above 1 and It falls. Ca at 20 °C for 90 °C
  thermosetting must be sourced. And six singles in one conduit to a star-delta motor: how many
  circuits count for Cg (research).
- **Lesson 6:** the guide's two voltage-drop rules: sum every drop "from the intake equipment to the
  end of the circuit", and turn three-phase to single-phase correctly (guide p.6). The formula sheet's
  ÷ √3 (step 7 note) is that second rule.
- **Lesson 8:** Zs on a TN-C-S supply with Ze 0.1 Ω (pack p.3). The prospective earth fault current at
  the origin is 230 ÷ 0.1 = 2.3 kA (computed, without Cmin), half the stated 4.6 kA.
- **Lesson 9, breaking capacity:** IPF 4.6 kA at the origin (pack p.3) against each device's Icn. One
  DO screen asks why the stated PFC is twice the 2.3 kA from Ze. The usual guidance takes a
  three-phase fault as about twice the single-phase one (UNCONFIRMED; research must quote it). Also
  the SWA armour as cpc, "justified by calculation" (guide p.5), with the adiabatic equation (armour
  resistance and k to be sourced).

## 4. Can it be taught visually, through interaction?
**Partly** (RUNBOOK section 0, item 3). Every lesson is a steps lesson of about 12 screens, SHOW then
DO, ending on two or three mixed puzzles. SHOW screens can carry a short paragraph where the why needs
words. The calculations are numbers, but every one of them has a physical cause you can see: heat in
a cable, a current arrow at an angle, a loop of resistance, a curve a current lands on. That cause is
what each picture shows.

- **Lesson 1, the nameplate and its triangle.** A rating plate drawn from the slides' Grundfos example
  (p.14), with output, cos φ and efficiency picked out. Beside it, AC circuits' power triangle, and a
  current bar. Two sliders: power factor and efficiency, each from 1 down. The input power and the
  apparent power grow while the output stays put, and the Ib bar grows with them: the slides' 20 kW
  load reads 28.87 A at 1 and 1, and 41.48 A at 0.8 and 87% (p.16 to 17, computed). A third slider sets
  the voltage at the board, for the 393 V sub-board case (p.19, 29.38 A computed). A diversity card
  shows ten 100 W lamps designed at 660 W (p.10). *Why:* the slides' point is that a designer who
  leaves out efficiency and power factor sizes the cable on 28.86 A "rather than 41.47A" (p.17). That
  is the cause made visible: the cable carries the current, and the current follows the apparent input
  power, not the output. The triangle is AC circuits lesson 8's, so nothing is taught again.
- **Lesson 2, the device's curve.** A log-log time-current plot. Three breaker bands, B, C and D, and a
  gG fuse curve. A draggable current marker, read as a multiple of In. A "start-up" card shows a motor's
  starting current as a short spike: drag it and see which type would trip on start. Tap a curve and
  Ia for 0.4 s and for 5 s is read off where the vertical line meets it. *Why:* the slides say the
  types differ "in relation to the start up current of a circuit" and send you to Appendix 3 to "see
  how each type works" (p.20). The curve is the cause of every later number (I2 in lesson 4, Ia in 8,
  the operating time in 9). So it is built once here, and the log axes are named once.
- **Lesson 3, the cable run in sections.** The slides' 3 kW heater circuit (p.26) drawn as its route:
  clipped direct, then in trunking beside another circuit, then through a cavity wall with 50 mm of
  insulation. Each section is shaded by how hot it would run at In. Each shows the product of the
  factors acting there, and the It it needs: 21.3 A for ambient with grouping, 19.3 A for ambient with
  insulation (computed from p.26 to 27). The worst section is outlined as the one that sets the cable.
  A slider moves the ambient; a toggle puts the insulation inside the trunking section, so all three
  factors act together. *Why:* the slides' warning is that factors "need only be applied when
  happening TOGETHER" (p.25), and "Cg and Ci do not happen together" here (p.27). Seeing the factors
  belong to places along the run shows why, and why you design for the worst place.
- **Lesson 4, two marks on one current line.** A horizontal current axis. Marks for Ib, In, Iz, the
  device's I2 = 1.45 In and the cable's 1.45 Iz. Drag In and Iz. Then switch the device to a
  semi-enclosed fuse, whose I2 is about twice In (to be sourced): the I2 mark jumps past 1.45 Iz, red.
  Apply Cf = 0.725 and Iz's required value rises until the mark is safe again. *Why:* the slides set
  the question as "Will the cable last with 14.5A for 10,000s?" (p.32). Laying the device's promise and
  the cable's limit on one line answers it, and it makes 0.725 a number you can derive (1.45 ÷ 2)
  rather than one you look up.
- **Lesson 5, three phases and the neutral.** Three line-current waves, and their sum drawn as the
  neutral current. A slider adds third harmonic to each line, from 0 to 60%. The fundamentals keep
  cancelling; the third harmonics line up and add. Bars for line current and neutral current, with
  Table 4Aa's four bands marked across the slider (p.34). The neutral bar passes the line bar at a
  third (computed from Ibn = 3 × h × IL, p.35). *Why:* the slides say a third harmonic "will cause
  more current to be present in the neutral than in the line" (p.33) but only point to a video for the
  reason. AC circuits lesson 10 shows balanced sine currents cancelling; this picture shows why the
  third harmonics do not.
- **Lesson 6, the voltage along the run.** A line from the origin to a sub-board to the load, and the
  voltage drawn falling along it, steeper where the current is larger or the cable thinner. Drag the
  length, the CSA and Ib. A band marks the allowed drop as a percentage of the stated supply. A toggle
  sets 395 V or 400 V, and the slides' 19.8 V total passes at 400 V and fails at 395 V (p.41). A "chase"
  button steps the CSA up until it passes, as the slides do from 1.5 mm² to 6 mm² (p.42). *Why:* the
  slides' "very common error" is failing "to take into account ALL of the voltage drop" (p.40). A
  falling line that runs through both the submain and the final circuit shows the drops add, and the
  395 V toggle shows the percentage belongs to the voltage you were given.
- **Lesson 7, hot conductor, angled current.** Left: a conductor drawn with a temperature gauge. Drag Ib
  down from It and the conductor cools; the readout gives the correction for resistance at that
  temperature, Ct, and the drop shrinks with it. Right: the current arrow at angle φ behind the
  voltage, and the cable's resistive and reactive drops as two arrows. Only their parts along the
  voltage count, so the drop the load sees is r cos φ + x sin φ, shorter than z (to be sourced).
  *Why:* the slides say the 6 mm² chosen by chasing carries "so little current" that it runs cooler, so
  a "smaller CSA cable" might do (p.43), and that with a known power factor "both the R and X values"
  are used (p.45). Both are causes you can watch. The arrows are AC circuits lesson 6's triangle.
- **Lesson 8, the fault loop.** The earth fault loop drawn as a ring: the supply transformer, the line
  conductor out, the fault, the cpc back, and Ze closing the ring. Drag the circuit length and the CSA.
  R1+R2 is computed from mΩ/m × 1.2 × L ÷ 1000, Zs and the fault current Uo × Cmin ÷ Zs follow. Beside
  the ring, lesson 2's curve: the fault current lands as a point, and the time is read off. Lengthen the
  run and the point slides from the 0.1 s region towards the 0.4 s line, then past it, in red. A
  cold/hot toggle shows why the 1.2 multiplier is there. *Why:* the slides ask whether disconnection
  will "actually happen" under fault (p.46), and show max Zs is Ohm's law with Cmin (p.47). The ring
  shows the cause: every metre of cable adds to the loop, the loop limits the current, and the current
  decides the time.
- **Lesson 9, heat in against heat it can take.** Two bars. One is the fault's energy, I²t; the other is
  what the conductor can absorb, k²S². Drag the fault current, the operating time and S. A Cmin/Cmax
  switch shows the fault current both ways: Cmin decides whether the device opens fast enough (lesson
  8), Cmax gives the larger current for the conductor check (p.62). A second card turns the same
  equation round, t = k²S² ÷ I², for the live conductors on a short circuit (p.66), and a third puts
  the IPF beside the device's Icn (p.70). *Why:* "There will be 341.4A in the conductors for 0.1s. It
  may not seem long" (p.56). Showing the equation as energy in against energy the conductor can hold
  explains both of its forms at once, and why k changes with the insulation (115 and 143, p.58, 66).
- **Lesson 10, the showroom's design card.** A one-line diagram across the top: the showroom intake
  (400 V TN-C-S, Ze 0.1 Ω, 4.6 kA, pack p.3), the MDB, the three-phase submain to DBL2, and DBL2's
  longest lighting circuit. Under each cable is its column of flowchart steps, each with its value and
  a tick. The voltage drop is drawn as one falling line from the intake to the last luminaire, with
  the submain's part turned single-phase. Zs builds up as Ze, then Zs at DBL2, then Zs at the end.
  Change one input (a length, the submain's size, the armour as cpc, a device) and every step
  downstream recomputes. A failing check turns red and draws the flowchart's loop back to step 6 or
  step 9. Then an "as built" switch adds measured readings, R1+R2, Zs and PFC, beside the design
  values, with the allowance for a cold conductor at test. *Why:* your flowchart is the course (it is
  "Tony's version of the design process"), and the assignment's question 3 is that process run twice
  in series, submain then final circuit. Seeing one change at the MDB ripple to the last luminaire is
  the point of the guide's "all voltage drops from the intake" (guide p.6). Verification is the same
  card read the other way: the design predicts the readings.

## 5. Dan's starting point
- **He has passed this course.** The aim is to keep it sharp and to understand each step's reason,
  not to pass again. So the course moves fast through the arithmetic and stops on the why and the
  traps.
- **He knows the trade's words and tests** (CLAUDE.md): BS 7671 design and verification, cable sizing,
  voltage drop, earth fault loop impedance, protective devices, inspection and test, cable fault
  location. None of it is defined from scratch.
- **The AC behind it is on this shelf.** AC circuits gives power factor, the power triangle, impedance,
  √3 and the balanced neutral. Lessons 1, 5 and 7 lean on it with a one-line reminder each.
- **His new path is naval electrical engineering.** Shore installations are where BS 7671 applies.
  Examples stay with the slides' own (heaters, pump motors, sub-boards, industrial units) and with
  work an electrician does. A ship example appears only where research has quoted the difference, and
  it says so.
- **Your intake answers** are not taken yet. AC circuits used: "to understand ... and how to work with
  it; on the job and in everyday life; hands-on, with the why explained in full". I assumed the same
  but with "a refresher" in mind. The build will ask the intake first.

## 6. The mistakes to catch
Each is caught by at least one DO screen with its own hint. Most come from your slides, which name
them as the traps. Those marked RESEARCH must be sourced before a lesson states them as common.
- **Lesson 1, sizing on the output only.** "if the designer didn't include the efficiency or power
  factor, then their cable design is based on 28.86A rather than 41.47A" (p.17). A DO screen offers
  28.87 A as an answer.
- **Lesson 1, 230 V or 400 V by habit.** "If ... you are given a separate value for voltage (U), then
  this must be used" (p.18), for a final circuit from a sub-board (p.19).
- **Lesson 1, diversity as a rule.** The percentages "are only found in the OnSite Guide. This means,
  it's guidance and doesn't have to be applied" (p.10).
- **Lesson 2, the wrong breaker type for a motor.** The types relate to "the start up current" (p.20).
  RESEARCH: the instantaneous-trip multiples for B, C and D.
- **Lesson 3, every factor at once.** Factors "need only be applied when happening TOGETHER" (p.25),
  and here "Cg and Ci do not happen together" (p.27). A DO screen offers 16 ÷ (0.94 × 0.8 × 0.88).
- **Lesson 3, grouping without the circuit itself.** "the Cg factor ALWAYS includes the circuit being
  installed" (p.25).
- **Lesson 3, the easier reference method.** "We need to design to the reference method which has the
  biggest impact" (p.28).
- **Lesson 4, a 10 A device trips at 10 A.** "despite the device declaring it's rated at 10A, it will
  not operate until it has 14.5A" (p.30).
- **Lesson 5, sizing on line current with heavy harmonics.** At 35% "we calculate cable size based on
  neutral current" (p.35); 157.5 A beats the 150 A line current (p.36).
- **Lesson 6, leaving out the submain.** "A very common error is that designers fail to take into
  account ALL of the voltage drop in the circuit" (p.40).
- **Lesson 6, 5% of 400 V when 395 V was given.** The 19.8 V example fails at 395 V and passes at
  400 V (p.41).
- **Lesson 6, three-phase drop added straight to a single-phase drop.** The formula sheet divides the
  submain's three-phase drop "by root 3" first (formula sheet step 7 note).
- **Lesson 7, stopping at the chased size.** The 6 mm² cable carries only 13.04 A, so Ct "may" allow a
  smaller one (p.43).
- **Lesson 7, z when the power factor is known.** "Where one is known then a calculation using both
  the R and X values needs to be used" (p.45).
- **Lesson 8, maximum times taken as actual times.** "These are MAXIMUM disconnection times, not
  actual disconnection times" (p.50).
- **Lesson 8, R1+R2 at 20 °C.** The multiplier "corrects the answer to as if the circuit were
  operating" (p.53). A DO screen leaves it out.
- **Lesson 8, nominal voltage for the fault current.** Cmin, because the voltage "can drop below the
  nominal voltage of 230V to as low as 218.5V" (p.48).
- **Lesson 9, Cmin for everything.** "Cmin is best used when deciding on fault current in order to
  operate a protective device", Cmax "when deciding on conductor sizing" (p.62).
- **Lesson 9, the cpc only.** "will the live conductors handle short circuit current before the device
  disconnects?" (p.63).
- **Lesson 9, suitable cpc taken as minimum cpc.** "Suitable protective conductor size and minimum
  protective conductor size are not the same thing" (flowchart note 2).
- **Lesson 9, breaking capacity forgotten.** If "the IPF exceeds the Icn ... the device may destroy
  itself" (p.70).
- **Lesson 9, a smaller fault current is always gentler.** RESEARCH: a lower fault current can push a
  device into the slow part of its curve, so I²t can rise. It is not in your slides. Taught only if a
  source is quoted.
- **Lesson 1 or 3, the motor's cable on line current.** Question 4b says "Base your selection on the
  delta running conditions" (pack p.4): the cables from the starter to a delta winding carry line
  current ÷ √3. A DO screen offers the 23.08 A line current. The rule must be quoted by research.
- **Lesson 10, only the main route measured.** "Remember to include all lengths of the cable run in
  your calculations not just the main cable routes" (guide p.5).
- **Lesson 10, a voltage drop that starts at the sub-board.** "Include the sum of all voltage drops
  from the intake equipment to the end of the circuit" (guide p.6).
- **Lesson 10, Zs worked out but never compared.** "Compare your calculated Zs value to the maximum
  permitted for the device" (guide p.5).
- **Lesson 10, measured Zs compared straight with the table.** RESEARCH: a reading taken on a cold
  circuit must be compared with a maximum corrected for operating temperature (BS 7671 Appendix 3 note,
  or GN3). Not in your slides.

## 7. Research the build must still do
The research stage (Sonnet, high, CLAUDE.md) must quote each of these word for word, with its source,
before a lesson uses it. Everything else in a lesson is a value printed in your materials (with its
page) or computed on screen from a shown rule.

**The qualification:**
- Re-fetch and quote the EAL QM Issue 1.3 (601/8231/3, ED4-01, J/507/9710, Appendix 1 checklist).
  Find ED4-01's full learning outcomes if any public EAL page prints them (UNCONFIRMED); otherwise
  `specRefs` stay on the checklist numbers.

**BS 7671 and guidance values not printed in your materials** (a small cited set each, never a table):
- **Lesson 2:** the B, C, D instantaneous-trip ranges as multiples of In (BS 7671 Appendix 3 or BS EN
  60898); one or two Ia values (5 s, 0.4 s) for one device.
- **Lesson 3:** the text of Reg 433.1.1 for Ib ≤ In ≤ Iz; the table for 50 mm of thermal insulation (0.88; slides p.26 print the
  value and p.25 point to p.423; Table 52.2 is my reading, to confirm); confirm the slides' 27 A (Table 4D5, 2.5 mm², clipped direct,
  p.24). **Check p.28:** which column of Table 4D5 the 3 kW example reads ("column 7"), because the
  slides call it reference method B; I could not confirm 4D5 has a method B column (UNCONFIRMED).
- **Lesson 4:** the fusing factor of a BS 3036 semi-enclosed fuse (about 2, to give 1.45 ÷ 2 = 0.725);
  the conventional operating time for a BS EN 60898 breaker. The slides say "10,000s" (p.30, 32);
  check it against the standard's conventional time. **Check p.31:** "Iz of 13A" for 1.0 mm² T&E in
  reference method B (UNCONFIRMED, as for p.28).
- **Lesson 5:** Table 4Aa's bands and 0.86 factor (slides p.34 print them; quote the table); Cg 0.65
  for four circuits (p.36); 240 mm² at 346 A in Table 4D1A column 5 (p.36).
- **Lesson 6:** Table 4Ab's 3% and 5%, and the conditions they apply under (the slides do not say
  whether the supply is public or private); 11 mV/A/m for 4 mm² T&E (p.39) and 29 and 7.3 mV/A/m for
  1.5 and 6 mm² singles (p.42; 7.3 is computed back from the slide's 8.09 V).
- **Lesson 7:** the Ct formula from BS 7671 Appendix 4 (slides p.43 say "Let's go to the drawing
  board" and give none); the power-factor voltage-drop expression with r, x, cos φ and sin φ (p.45
  likewise); one r, x, z row for one size from 25 mm² up.
- **Lesson 8:** Reg 411.3.2.2 and Table 41.1's 0.4 s (slides p.49, 52); Table 41.3's 7.28 Ω and 2.73 Ω
  (p.47, 55); 24.2 mΩ/m for 1.5/1.5 (p.52) and the 1.20 multiplier for 70 °C thermoplastic (p.53), from
  OSG Table I1 and I3 or GN3 Appendix B; where Cmin = 0.95 is stated in BS 7671 (p.48).
- **Lesson 9:** the regulation that gives the adiabatic equation (slides p.57 say "chapter 54"; 543.1.3 is my
  reading, to confirm); k = 115 (one of Tables 54.2 to 54.6, p.58) and k = 143 (Table 43.1) as the
  slides use (p.58, 66); 14.82 mΩ/m and 1.28 (p.65); Cmax = 1.1 (p.48); the meaning of Icn for a
  BS EN 60898 breaker and an RCBO. **Check p.64:** the slides give the 20 A RCBO an Ia of 100 A without
  stating its type (UNCONFIRMED: type B assumed).
- **Lesson 10 (verification from research, nothing in your materials):** what initial verification
  compares with the design (BS 7671 Part 6, GN3); the correction of a measured Zs or R1+R2 for test
  temperature (BS 7671 Appendix 3 note, GN3 or the OSG); whether the EIC's design section asks the
  designer to record these values; for question 9 (pack p.5), the guidance on the first periodic
  inspection interval for a shop or showroom (GN3 or the OSG) and the handover documents
  (City & Guilds 2396's criterion 2.6 lists "Verification documentation and certification", "As
  fitted drawings", "Operation and maintenance manuals", web search 19 Oct; EAL's own list is
  UNCONFIRMED).
- **Second batch, for lessons 1, 3, 8, 9 and 10:** the rule for sizing cables to a delta-connected
  motor from a star-delta starter (the guide points to its 4.7, guide p.7); Ca at 20 °C for 70 °C
  thermoplastic and 90 °C thermosetting cables (Table 4B1); how Cg counts the six cores of a
  star-delta motor in one conduit; the guidance that a three-phase prospective fault current is about
  twice the single-phase value (to explain the pack's 4.6 kA against 230 ÷ 0.1 = 2.3 kA); the armour
  resistance and k for SWA armour as a cpc (guide p.5); which book "The Electrical Installation Guide"
  is, and its sections 3, 3.2, 4.7 and 5.3.3 (guide p.3, 4, 6, 7).
- **All lessons:** check each cited value against BS 7671:2018+A3:2024 and say where it changed.

**Sea (optional, only if found):**
- Which standards govern a Royal Navy ship's electrical installation (UNCONFIRMED; candidates are the
  IEC 60092 series, classification society rules and Defence Standards; none is quoted yet).
- Whether BS 7671 Part 1 lists ships among its exclusions, to quote the reason it does not apply.
- One quoted difference worth a screen: the design ambient for cables in a machinery space, and the
  insulated-neutral system's first earth fault (AC circuits research-notes 6.1 has "The majority of
  ships have a 3 phase, 3 wire, 440V insulated neutral system", SECONDARY).

**Misconception sources** (for the three RESEARCH items in section 6).

## 8. One course or two?
I considered two courses: "Circuit design calculations" (lessons 1 to 9) and "Verification and
certification". I recommend **one**, for three reasons:
- Your materials are all design. Every page of the slides, the flowchart and the formula sheet is a
  design calculation. A verification course would have no materials of yours to build to.
- You hold the L3 Initial Verification, Periodic Inspection and PAT awards, all from Oct 2025. A full
  verification course would mostly re-teach those. What is new at L4 is the link between design and
  test: the design predicts the readings. That fits in one lesson.
- Ten lessons is inside the 6 to 10 a course should be, and the order builds without a break.

The second batch (19 Oct) keeps this decision. The assignment has one verification question, the
first inspection interval and the handover documents (question 9, pack p.5), which fit in lesson 10.

**What the second batch does open: a possible second course on the whole installation.** Most of the
assignment is design that is not circuit calculation, and your slides teach none of it. A second
course built to the assignment could be about six lessons: containment sizing (question 1a, guide
p.2); load balancing, maximum demand and the schedule of circuits (1b, 10, guide p.3); switchgear and
distribution boards (2); lighting control and time switching (5); EV charging on TN-C-S, RCDs and PEN
fault protection (6, guide p.9); and emergency lighting by the lumen method, with IP codes (7, 8,
guide p.10). I do **not** recommend planning it yet:
- it needs the assignment's two drawings, which are not in the pack (pack p.3);
- its subjects need sources your materials do not hold (BS 7671 Section 722 for EV charging, BS 5266
  for emergency lighting, manufacturers' data);
- several are mostly words, not interaction, so it would be closer to "No" (reading lessons) than
  this course.

If you want it, send the drawings and say so. Also still worth sending: the "webinars", "the
powerpoint" and "the mocks in the drive" (slides p.5). The mocks would make lesson 10's mixed set and
the DO screens exam-shaped.

## 9. Size and cost
- 10 lessons of about 12 screens, plus the research stage and the plan.
- The AC circuits brief estimates its lessons from the last measured courses, about 0.99M to 1.14M
  tokens a lesson (docs/plans/foundational-maths-roadmap.md, cited there). These pictures are live
  calculators with linked readouts, close to AC circuits' and Calculus fundamentals', so I estimate
  about 1.1M to 1.25M a lesson, about 11M to 12.5M for the course, plus about 0.5M for research,
  which has more to fetch than usual (BS 7671 values, the EAL QM, the verification sources).
- The full process measured on Fractions lessons 4 to 8 was about 1.65M a lesson, about 16.5M for ten.
- Lesson 1 is built first for you to try on your phone, when you say build.

## 10. Left out
- **Not taught, because your slides do not teach them** (a second course could, see section 8):
  maximum demand of a whole installation beyond lesson 10's one screen; discrimination and
  selectivity; RCD selection and types; protective bonding and earthing conductor sizing; TT and earth
  electrodes; the associated systems of criterion 5.0; the statutory and non-statutory framework of
  criterion 1.1. From the assignment (pack p.4 to 5): containment sizing (1a), switchgear choice (2),
  lighting control (5), EV charging (6; lesson 8 says in one line that it has its own rules), emergency
  lighting (7) and IP codes (8).
- **Mentioned in one screen and moved on:** Reg 132.1 and Part 3's six headings (slides p.7 to 8),
  fuse systems C, E and G (p.21), and fuse wire (p.20).
- **Not repeated from other courses:** AC theory (AC circuits), the test methods and certificates
  (your L3 awards).

## 11. Unclear or missing in the materials
- **The file named "spec" is the course's slide deck**, not EAL's qualification specification. It
  has no unit numbers or learning outcomes. The QM found on the web supplies the unit, and its full
  outcomes are not public (UNCONFIRMED).
- **Nothing on verification as a method**, though it is half the qualification's title. The
  assignment's only verification question is the inspection interval and handover documents
  (question 9, pack p.5).
- **The assignment's two drawings are missing.** The pack says "The two attached drawings show the
  proposed electrical installation" (pack p.3), and questions 1, 3, 7 and 10 depend on them. The PDF
  has none. Ask Dan for them.
- **"The Electrical Installation Guide"** is cited by section in the project guide (guide p.3, 4, 6,
  7), but no edition or publisher is given.
- **The pack's page footers** run "1 of 9" then "2 of 7" to "7 of 7"; this brief cites PDF pages.
- **No formulas for Ct or for the power-factor voltage drop.** The slides say "Let's go to the drawing
  board" (p.43, p.45), so they were given in a webinar that is not in `source/`. The second batch has
  nothing on them either.
- **Reference method B for twin and earth in trunking** (p.28, p.31) and "column 7" of Table 4D5 need
  checking.
- **"10,000s"** as the time to operate at I2 (p.30, 32) needs checking against the conventional time.
- **The 20 A RCBO's type** is not stated, though its Ia of 100 A assumes five times In (p.64).
- **Small slips:** p.17 calls the 20 kW heater "the same pump"; p.12's "Ib - P / V x Eff% x PF" means
  Ib = P ÷ (V × Eff × PF); p.34 prints "33=45%" for 33 to 45%; the formula sheet's single-phase Ib (step
  1) leaves out the power factor and efficiency that slide p.12 includes; the flowchart's "uour" is a
  typo.
- **Cut-short answers**, not rounded: 28.86 A (28.87), 41.47 A (41.48), 21.2 A (21.3), 304.4 A (304.5),
  0.43 Ω (0.44), 0.93 mm² (0.94), 1.08 mm² (1.09), 0.76 Ω (0.77), 205.6 A (205.7), all computed. With
  R1+R2 at 0.4356 Ω, the immersion heater's Zs is 0.6456 Ω and its PEFC 338.4 A, not 341.4 A (p.54 to
  55, computed). Every check still passes.
- **The edition** is A2:2022, and A3:2024 is now in force (see Decisions).
