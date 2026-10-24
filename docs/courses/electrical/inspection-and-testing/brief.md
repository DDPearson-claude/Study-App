> **Not to be built (Dan, 24 Oct 2026):** "Let's just leave them, don't really need them built. I have GN3." Inspection and testing and a short Earthing systems course are both dropped; GN3 is his reference. The plan below is kept for the record only.

# Inspection and testing: the section brief

Written 20 Oct 2026 for Dan, answering the course brief in `tools/course/RUNBOOK.md` section 0 for a
whole section of the Electrical engineering shelf. It is a plan only. Nothing is researched in full,
written or built. I took the decisions for you and listed them in section 11. Change any you like.

**It is a refresher of your own courses, for use at work.** You hold the EAL Level 3 Initial
Verification and Certification, Level 3 Periodic Inspection, Testing and Certification, Level 3
In-Service Inspection and Testing (PAT) and Level 2 Fundamental Inspection, Testing and Initial
Verification, all from October 2025. The lessons follow the format you approved for Design and
verification (`docs/courses/electrical/design-and-verification/format/refresher.md`): recall first,
the why where you need it, a worked example, practice in your exam's shapes, and a Keep this card for
your Book. Each lesson also reads through as stills with its words, and its worked examples and
written questions become puzzles in your review box. No timers, marks or grades.

**How the lessons read.** In your own-words style (Dan, 20 Oct). No lesson says where something comes
from in the sentence. The sources are fact-checked behind the scenes. Footnotes go only on a figure you
would look up on a job, such as a maximum Zs or a test voltage.

The courses and their lessons, field by field, are in `sections.json`. The shelf proposal is in
`shelf-proposal.md`. All three files are copied to `docs/courses/electrical/inspection-and-testing/`.

---

## The short version

**Three courses, seventeen lessons, and one course that waits.**

| Course | Lessons | Running case |
|---|---|---|
| **Initial verification and certification** (refresher) | 8: isolation and inspection; continuity and polarity; the ring final; insulation resistance; Ze and the earth electrode; Zs and the 0.8 rule; fault current, RCDs and functional tests; the certificate | Unit 3, a new small commercial unit on TN-C-S, tested and certified |
| **Periodic inspection and the EICR** (refresher) | 6: what it is for; extent, limitations and sampling; testing in service; the codes; coding the readings; the report | A 1975 house on TN-S with its original rewireable-fuse board, coded and reported |
| **Emergency lighting** (new ground, refresher shape) | 3: types, modes and duration; where the lights go; testing, the logbook and the certificate | Unit 3 again: its corridor, workshop and exit signs, tested for a year |
| In-service inspection and testing (PAT) | waits | none of its materials are in the build folder yet |

**Every lesson has the refresher shape,** about eleven screens: Do you still have it? (Skip to the
practice if you have); what it is for and what goes wrong without it; the why, with an interactive
that shows the cause; a check; the worked example from your slides; Section A on the running case;
one changed-numbers item; Section B, a short written answer marked by Claude against points; Keep
this.

**The pictures show causes, not results:** the ring as a figure of eight whose readings stay flat
only when the ends are crossed; test-lead nulling and the parallel path that hides a broken bonding
conductor; insulation resistance falling as circuits and devices join the test; the earth
electrode's resistance areas; the Zs build-up warming from 10 °C to 70 °C past the 0.8 line; an RCD's
trip on each half-cycle; a coding decision tree you click through; the report's outcome flipping on
the first C1 or C2.

**Your exam's shapes:** your EAL and the City & Guilds 2391 papers are scenario-led multiple choice
with calculations, plus a practical that ends in a completed EIC or EICR. So Section A is a scenario
with linked parts, picked where the point is a named slip and typed where you would work a figure,
and each course ends by completing its certificate or report. Section B keeps the written answer from
Design and verification. No question, scenario or number is taken from the 2391 papers.

**What research must settle first:** BS 7671:2018+A4:2026 (published 15 April 2026; the A2 and A3
versions your course taught were withdrawn on 15 October 2026), its model forms and the changed
meaning of FI on the EICR; Best Practice Guide 4 for the coding; the current emergency lighting
standards (BS 5266-1:2025, BS EN 50172:2024, BS EN 1838:2024), which replace those your maker's guide
quotes. Section 9 lists each item and what GN3 would settle.

**Cost:** about 19M tokens for research and seventeen lessons at about 1.0M a lesson. No new app work
(section 12).

---

## 1. The overall topic

Inspecting and testing low-voltage installations to BS 7671 Part 6: verifying a new installation
before it goes into service and certifying it; inspecting an installation in use, coding what is
found and reporting its condition; and, as a separate short course, the emergency lighting that the
same inspections meet on almost every commercial job.

**Edges.** Design is Design and verification's (the expected readings it predicts are its lesson 9).
Fault finding and repair are not inspection: a periodic inspection reports condition, and the slides
say plainly that it has no remit for fault finding. Ships follow other rules (insulated and earthed
neutrals, insulation monitoring): Three-phase power systems at sea and Maintenance and fault-finding
take that up. A screen here says "at sea it differs" only where research has a source for it, and no
screen implies BS 7671 governs a ship. Portable equipment (PAT) is its own course and waits.

---

## 2. What each source covers and lacks

| Source | Covers | Lacks or doubts |
|---|---|---|
| **Fundamental Inspection and Testing slides** (88 slides, OCR in `tools/material-fit-slides-p*.json`, A2) | Exam outline (p.5-6), legislation, competence, certificates, required information, initial inspection, the test sequence (p.23-25), safe isolation (p.28), continuity and nulling with a worked reading (p.31-35), polarity (p.36-37, p.62-63), the ring final in full with worked figures and its faults (p.38-49), insulation resistance with Table 64 and three parallel examples (p.50-61), electrode methods E1-E3 with spike distances (p.64-67), Ze (p.68-70), PFC with a worked example (p.72-77), Zs and the 0.8 rule with three examples (p.78-81), RCD times (p.82), separation and barrier tests (p.84-86), forms (p.87) | No RCD half-current or S-type detail; no temperature correction; no phase sequence or functional detail; one example that looks wrong (section 10). Slides are terse, so the why comes from the OSG and research. |
| **Condition report slides** (82 slides, OCR in `tools/material-eicr-slides-p*.json`, A2) | Purpose and who requires it (p.6-10), inspection items, senses and SADCOWES (p.12-19), periodic against initial (p.21-22), extent, limitations and sampling (p.23-28), safety and HSR25 (p.29-35), observations, the codes and FI (p.36-42), C1, C2 and C3 examples (p.43-61), eight code tests (p.62-69), Section D (p.70), defects and scope (p.71-72), voltage drop (p.73-76), the EICR (p.77-81) | Predates A4's change to FI. Sampling's "minimum of 20%" has no source on the slide. No worked EICR, no interval guidance, no outcome rule beyond C1. |
| **Emergency lighting pocket guide** (21 pages, text in `tools/material-el-guide-p*.json`) | Types and modes (p.3, p.9), legislation (p.4), sign viewing distances with a worked example (p.8), luminance (p.9), points of emphasis and levels (p.10, p.12), toilets and inner rooms (p.11), escape routes and open areas (p.13-14), duration (p.15), testing and schedule (p.17-18), checklist (p.20) | A maker's guide: products, statistics, fines and training are advertising and are not used. Written to BS 5266-1:2016 and BS EN 50172:2004, both now replaced. Its legislation list is dated (Building Regulations 2000, fire certificates). Escape route levels conflict inside it (2 lux and 1 lux, p.13 and p.20). Spacing tables are one maker's products. |
| **Initial Verification course text, Parts 1 and 2** (`source/lesson-powerpoint-part1-inspection.txt`, `part2-testing.txt`) | Course outcomes and the 50-question exam (Part 1), legislation, safe isolation steps with 3 and 10 tests, the schedule of inspections item by item with IP codes, obstacles and placing out of reach, bonding sizes, notices; the GN3 test sequence, instruments, accuracy logs, GS 38 leads, continuity procedures and temperature factors, the ring's three steps, insulation resistance precautions and SPDs at 250 V, polarity, electrode methods with the deviation rule, supply polarity, ADS, Ze and declared values (Part 2) | Cut off near the end (Part 2 stops at Ze; nothing on Zs, RCD or certification). Transcribed by an agent, so used for structure and coverage only, never quoted. Its title line names an EV charging award, a template slip. |
| **C&G 2391-050, -051, -052 samples** (hand transcribed) | The question shapes: scenario blocks of four to eight linked questions; calculations of conductor resistance, ring values, parallel insulation resistance, Zs, length from R1+R2, voltage drop from R1+Rn and Ib, maximum Zs, electrode value; "why" and "which document" questions; coding from a reading | No answers, no figures. Copyright: shapes only. |
| **On-Site Guide, A2:2022** (Design and verification's `material-osg-*.json`; pages below are PDF pages, which match the book's) | Section 9 inspection checklist and testing checklist (p.107-109); Section 10 test procedures in full (p.111-125), including the ring's three steps and the wrong-ends pattern (p.115-117), Table 10.3.3 and the 20 MΩ latent-defect advice (p.118-119), the electrode test with 10 times the length and about 6 m moves (p.122-123), Zs and parallel paths (p.124), three-phase PFC about twice single-phase (p.125), voltage drop (p.125); Section 11 RCD times and the test button's limits (p.127-129); Appendix B measured maximum Zs at 10 °C with divisor 1.25 and Table B8 (p.139-146); Appendix G coding examples, outcomes, dangerous situations, remedial work, consumer units, and the model EIC, MEIWC and EICR (p.179-206); Appendix I resistances per metre and temperature factors (p.217-220) | A2 forms, not A4. Table B6 prints 5.87 Ω for a 6 A type B, where 0.8 × 7.28 = 5.82 Ω (section 10). |
| **BS 7671 Appendix 4 pages** (`material-bs7671-*.json`) | Voltage drop limits and mV/A/m tables for course 2 lesson 5 | Not Part 6, Chapter 41 or Appendix 3 (the 0.8 rule's own wording). |
| **GN3** (in your Drive, too large to reach) | Would settle the items in section 9.2 | Unread. |

---

## 3. What is useful, in an order that builds, and how it splits

**Three courses, on the evidence.** Your materials fall cleanly into three bodies. The Fundamental
slides, the Initial Verification text and OSG Sections 9 to 11 are one job: verifying and certifying
new work. The condition report slides and OSG Appendix G are a second job with a different question
(still safe to use?) and a different product (a coded report, not a certificate). The emergency
lighting guide is a third subject: a different standard, a different duty holder and a different
certificate. Folding periodic inspection into initial verification would bury its two hardest
skills, sampling and coding, under the tests it shares; folding emergency lighting into either would
hide that it is new to you.

**The order inside each course follows the work.** Initial verification follows the test sequence,
because the sequence is the safety logic: dead tests prove the installation safe to energise, live
tests prove protection works. Periodic inspection follows the job: agree it, test it in use, code it,
report it. Emergency lighting follows design, then maintenance.

**What is useful at work, beyond the exam.** Predicting a reading before taking it (Table I1 times a
length), so a wrong one stands out; reading a fault from a pattern of readings (the ring's hump, the
open circuit at one socket in step 3); knowing which limit a reading is compared with, at what
temperature; coding consistently and defending the code; writing extent and limitations that protect
you; and the emergency lighting checks that turn up on every commercial EICR.

**PAT waits.** You hold the award, but none of its slides are in the build folder. Without them a PAT
course would be new teaching from public sources (the IET Code of Practice is paywalled; HSE's
INDG236 and HSG107 are free), which is not what this section is for. When you share the course
material it becomes a short course of about four lessons in the same shape (equipment classes and the
user check; formal visual inspection; earth continuity, insulation and protective conductor current;
records and intervals).

---

## 4. Can it be taught visually, through interaction?

**Partly.** The tests are physical and numerical, so every test lesson has a picture that shows its
cause and figures computed from a rule on the screen. Inspection, sampling and coding are judgement:
their pictures are decision pieces (a tree, a sample that grows, a report that flips) whose words
carry more. So these are steps lessons whose SHOW screens may carry a short paragraph, as Design and
verification's do. Every step gets its read-through sentence and its still, so the Book and the
read-through make sense without his moves.

---

## 5. The lessons

Full fields (recall, why, picture, practice A, changed numbers, B with its points, Keep this, sources)
are in `sections.json`. In one line each:

**Initial verification and certification**

| # | Unit | Lesson | Picture |
|---|---|---|---|
| 1 | Before the tests | Isolation and inspection: prove-test-prove, n(n-1)/2 tests, why inspection comes first | Every pair of terminals drawn as a test line; the test finger and wire at a board's gaps |
| 2 | Dead tests | Continuity and polarity: nulling, R = L × mΩ/m, methods 1 and 2, parallel paths | Nulled and un-nulled leads; a parallel pipe path hiding a broken bonding conductor |
| 3 | Dead tests | The ring final: three steps, (r1+rn)/4, the hump, the faults | The ring as a figure of eight; drag the test point round; flat when crossed, a hump when not |
| 4 | Dead tests | Insulation resistance: Table 64, parallel paths, devices out, SPDs, 20 MΩ, SELV and separation | A board of resistors; the total falls as circuits and a lamp join the test |
| 5 | Live tests | Ze and the earth electrode: the lifted earthing conductor, E1-E3, RA × IΔn ≤ 50 V | The electrode's resistance areas; the potential spike's plateau |
| 6 | Live tests | Zs and the 0.8 rule: U0 × Cmin / Ia, × 0.8, temperature correction, parallel paths, no-trip | The Zs build-up warming from 10 °C to 70 °C past the 0.8 line |
| 7 | Live tests | Fault current, RCDs and functional tests: the larger PFC, × 2 for three-phase, 300 ms and S-type, half-cycles, the test button | The RCD trip trace on each half-cycle |
| 8 | The certificate | EIC, MEIWC or EICR; the schedules; Unit 3 certified | The schedule of test results filling column by column |

**Periodic inspection and the EICR**

| # | Unit | Lesson | Picture |
|---|---|---|---|
| 1 | The job | What it is for: continued service, the current edition, not fault finding, the senses | Condition falling over time, with events that call for an inspection |
| 2 | The job | Extent, limitations and sampling: agreed, recorded, only with records, widened by defects | A sample that locks without records and grows when it finds defects |
| 3 | Testing in service | Testing in use: order, disruption, what stands in for what, danger reported at once | The test sequence as tiles: what each needs and what it proves |
| 4 | Coding | The codes: C1 basic protection, C2 fault protection, C3 improvement, FI under A4; contested items | The coding decision tree you click through |
| 5 | Coding | Coding the readings: Zs, IR at the board, RCD time, ring, voltage drop from (R1+Rn) × Ib | Each reading against its limit band, with temperature correction |
| 6 | The report | The EICR: sections, outcome from codes, interval, the original and the duplicate | The report's outcome flipping on the first C1 or C2 |

**Emergency lighting**

| # | Unit | Lesson | Picture |
|---|---|---|---|
| 1 | The system | Types, modes and duration | Mains fails on Unit 3's plan; toggle maintained, non-maintained, combined |
| 2 | The system | Points of emphasis, lux levels, the open area's core, sign viewing distance | The core with its 0.5 m border cut away; a sign's reach down the corridor |
| 3 | Keeping it working | Daily, monthly and annual tests; the logbook; the certificate | Three batteries through a full-duration test; one fails early |

**The recall openers** (each with the usual slips as wrong answers) are in `sections.json`. Two
examples: lesson 3's "the step 2 readings rise to the middle and fall: why?" (the legs linked the
same way round); lesson 6's "a 32 A type B ring reads 1.20 Ω: acceptable?" (no; slips: "yes, under
1.37 Ω" and "cannot tell without Ze").

---

## 6. The running cases

Every figure below is a given (a practice value, said to be one), a cited constant, or computed from
the rule shown, worked from the rounded figures before it to two places. The case files
(`case.json`, RUNBOOK section 8) are written at the start of each course's build from these.

### 6.1 Unit 3: a small commercial unit (Initial verification; Emergency lighting)

A new unit, built and wired by your team: a trade counter with reception, an office and a workshop.
A made-up job, said to be one.

**Givens (practice values unless cited).** 400/230 V three-phase four-wire, TN-C-S. Ze measured
0.18 Ω (within the declared 0.35 Ω). PSCC line to neutral measured 1.45 kA. A TPN board with RCBOs
and MCBs of 6 kA breaking capacity. Main bonding 10 mm² to water (4 m) and gas (7 m). Test leads
0.35 Ω before nulling. Ambient during tests about 10 °C, so OSG Appendix B applies directly.

| Circuit | Wiring | Device | Rule and working | Figures |
|---|---|---|---|---|
| C1 office ring | 60 m loop, 2.5/1.5 mm² | 32 A type B RCBO, 30 mA | r1 = rn = 60 × 7.41 / 1000; r2 = 60 × 12.10 / 1000; step 2 (r1+rn)/4; R1+R2 = (r1+r2)/4; Zs = Ze + R1+R2 | r1 0.44 Ω, r2 0.73 Ω, step 2 0.22 Ω, R1+R2 0.29 Ω, Zs 0.47 Ω |
| C2 office lighting | 28 m, 1.5/1.0 mm² | 6 A type B RCBO, 30 mA | 28 × 30.20 / 1000 | R1+R2 0.85 Ω, Zs 1.03 Ω |
| C3 compressor | 22 m, 6/6 mm² singles in PVC trunking, three-phase | 32 A type C MCB | 22 × 6.16 / 1000 | R1+R2 0.14 Ω, Zs 0.32 Ω |
| C4 emergency lighting supply | 35 m, 1.5/1.0 mm² | 6 A type B | 35 × 30.20 / 1000 | R1+R2 1.06 Ω, Zs 1.24 Ω |

Resistances per metre: OSG Table I1 (p.218, read from the page image: 7.41, 12.10, 30.20, 6.16,
1.83 mΩ/m).

**Limits.** 32 A type B: 230 × 0.95 / (5 × 32) = 1.37 Ω design, × 0.8 = 1.10 Ω measured (1.09 Ω from
the unrounded figure; the OSG prints 1.1). 6 A type B: 230 × 0.95 / (5 × 6) = 7.28 Ω, × 0.8 =
5.82 Ω. 32 A type C: 230 × 0.95 / (10 × 32) = 0.68 Ω, × 0.8 = 0.55 Ω (OSG Table B6, 0.55). The trip
multiples (5 × In for B, 10 × In for C) and Cmin 0.95 are Design and verification's cited constants.

**Other readings.** Bonding: 4 × 1.83 / 1000 = 0.01 Ω and 7 × 1.83 / 1000 = 0.01 Ω; un-nulled, the
gas reading would be 0.36 Ω. Insulation resistance line to earth at 500 V: 300, 75, 150 and over
999 MΩ (practice values); together 1 / (1/300 + 1/75 + 1/150) = 42.86 MΩ. PEFC = 230 / 0.18 =
1277.78 A; three-phase about 2 × 1.45 = 2.90 kA (OSG p.125), recorded as Ipf. RCBO on C1: 19 ms at
0°, 23 ms at 180° (practice values); 23 ms recorded. Phase sequence on C3 confirmed.

**For emergency lighting (practice values).** A corridor of 18 m from the workshop to the final
exit; the workshop 14 m × 9 m = 126 m², an open area; its core (14 − 1) × (9 − 1) = 104 m²; a 150 mm
internally lit exit sign, viewing distance 150 × 200 = 30.00 m (guide p.8 rule); externally lit it
would be 15.00 m. Self-contained non-maintained luminaires, 3 h. In the first annual test, luminaire 4
drops out at 2 h 10 min.

**How it threads through.** Lessons 2 to 7 each add their figures to the same schedule; lesson 8
fills the schedule and the supply section in one sitting. A part missed earlier carries the course's
figure forward, as an examiner carries an error.

### 6.2 A 1975 house (Periodic inspection)

A three-bedroom semi, sold to a new owner, never rewired. Made up, and said to be.

**Givens (practice values).** TN-S, the lead-sheathed supply cable's sheath as the earth; Ze 0.45 Ω
(within the declared 0.8 Ω). The original board with BS 3036 rewireable fuses; a 1990s shower on its
own 30 mA RCD unit; no earlier certificates except a Minor Works certificate for the shower; a garage
sub-board with no records. Tested at about 20 °C.

| Circuit | Wiring | Fuse | Working | Figures |
|---|---|---|---|---|
| Ring | 70 m, 2.5/1.5 mm² | 30 A BS 3036 | 70 × 7.41 / 1000; 70 × 12.10 / 1000; (r1+r2)/4; Ze + R1+R2 | r1 0.52 Ω, r2 0.85 Ω, R1+R2 0.34 Ω, Zs 0.79 Ω |
| Upstairs lights | 25 m, 1.0/1.0 mm² | 5 A BS 3036 | 25 × 36.20 / 1000 | R1+R2 0.91 Ω, Zs 1.36 Ω |
| Immersion heater, 3 kW | 2.5/1.5 mm² | 15 A BS 3036 | Ib = 3000 / 230; VD = Ib × (R1+Rn), R1+Rn measured 0.62 Ω | Ib 13.04 A, VD 8.08 V, 3.51% |

**Limits.** OSG Table B1 at 10 °C (p.140, from the page image): 30 A with a cpc of 1.5 mm² or more,
0.83 Ω; 5 A, 7.3 Ω. At 20 °C, × (20 + 230) / (10 + 230) = 1.04 (Table B8's rule): 0.83 × 1.04 =
0.86 Ω, so the ring's 0.79 Ω passes. Voltage drop: 5% of 230 V = 11.50 V for other uses (BS 7671
Appendix 4, to quote).

**Insulation resistance** line to earth (practice values): ring 0.75 MΩ, two lighting circuits 50
and 30 MΩ, cooker 8 MΩ, immersion 20 MΩ. Together 1 / (1/0.75 + 1/50 + 1/30 + 1/8 + 1/20) = 0.64 MΩ:
under 1 MΩ at the board with all final circuits connected, so C2. **Shower RCD:** 26 ms and 34 ms; 34
ms recorded.

**Observations to code** (each code from your slides' examples or the OSG's, to be checked against
Best Practice Guide 4): a missing blank in the fuse board (C1); no main bonding to the gas pipe (C2);
a 30 A carrier with heavier fuse wire (C2); kitchen sockets used for the garden with no RCD (C2);
bedroom sockets with no RCD (C3); a sheath cut short of a switch box, cores out of reach (C3); no
circuit chart (C3); no "Safety electrical connection" label (C3); scorching at the immersion heater's
switched spur (C2); the whole-installation insulation resistance (C2); a cable into a floor void the
client would not have lifted, which cannot be traced (FI, as A4 now intends). **Outcome:**
unsatisfactory.

### 6.3 Unit 3's emergency lighting

See 6.1. It reuses the unit you certified, so the emergency lighting course begins with a building
you know.

---

## 7. Your starting point

You hold all four inspection and testing awards (Oct 2025), the 18th Edition, Building Regulations,
Design and verification at Level 4, and subsea cable testing. So nothing here is taught from scratch:
each lesson opens with recall and lets you skip to the practice. Design and verification already
covers Cmin, the trip multiples, the fault loop and the design's expected readings; these lessons use
them with a one-line reminder. Resistances in parallel are everyday trade arithmetic; lesson 4 uses
them without re-teaching. Your subsea work used insulation resistance at high
voltage and four-wire resistance measurement; lesson 2's nulling and lesson 4's parallel paths can
point back to them in one line each. The Navy's own rules for shipboard installations are not taught
here.

---

## 8. The mistakes to catch

Each is caught by at least one DO screen with its own hint.

- **Isolation:** trusting 0 V without re-proving the indicator; missing a pair in a three-phase
  board.
- **Continuity:** reading with leads not nulled; using method 1 where steel containment gives
  parallel paths; not lifting a bonding conductor's end.
- **Ring:** linking the legs the same way round; recording a step 2 reading as R1+R2; taking the
  lowest, not the highest, step 3 reading; expecting r2 exactly 1.67 × r1 (Table I1 gives 1.63).
- **Insulation resistance:** adding circuits as if in series; testing with lamps, dimmers or SPDs
  connected at 500 V; reading 1 MΩ as healthy when the whole installation is under 20 MΩ.
- **Ze and electrodes:** lifting the earthing conductor with the installation live; forgetting to
  reconnect it; spikes too close; RA × IΔn confused with 230 V ÷ IΔn.
- **Zs:** comparing a cold reading with BS 7671's hot maximum; forgetting temperature correction;
  surprise at Zs below Ze + R1+R2; tripping an RCD with a full-current loop test.
- **PFC and RCDs:** recording the smaller of PSCC and PEFC; using the single-phase value for a
  three-phase board; recording the faster half-cycle; trusting the test button.
- **Certificates:** an MEIWC for a new circuit; an EICR for new work; the tester issuing the EIC.
- **Periodic:** sampling tests with no earlier results; limitations agreed but not recorded; coding
  by preference; C2 for missing basic protection; treating every non-compliance as unsafe; FI by the
  old rule.
- **Emergency lighting:** testing by the lighting circuit's breaker; a monthly test standing in for
  the annual one; measuring an open area's border; using an externally lit sign's distance for an
  internally lit one.

---

## 9. What research must source, and what GN3 would settle

Your materials first; the web only for what they lack, quoted word for word with its source.

### 9.1 From public pages (each quote checked word for word)

1. **BS 7671:2018+A4:2026:** the IET's model forms and their notes (free PDFs on electrical.theiet.org,
   dated 15 April 2026): the EIC, MEIWC and EICR; the schedule of test results' columns (column 12's
   note on the source of maximum Zs, column 31 remarks); Section D's standard limitations, including
   the new line on product recalls; the notes for the person producing the report; the outcome
   wording; the changed intent of FI and the observations section in two parts. Regulation 653.1's
   new wording, from a public summary (SELECT's "What's new", NICEIC's A4 page). The withdrawal date
   of A2+A3 (15 Oct 2026, IET press release).
2. **Electrical Safety First Best Practice Guide 4, issue 7.4** (free PDF): the codes' definitions,
   the examples for every observation in 6.2, "NC only" and uncoded observations, the outcome rule,
   and its treatment of a missing RCD on sockets. Best Practice Guide 2 for safe isolation, if a
   point needs it.
3. **HSE:** GS 38 (test leads and voltage indicators, free); HSR25 (EAWR regulations 4, 12, 13, 14
   and 29, free).
4. **Maximum Zs:** BS 7671's Table 41.3 values are computed here from U0 × Cmin / Ia (Design and
   verification's case file); research confirms the type B and C rows used and the 0.8 rule's
   wording in BS 7671 Appendix 3 from a public page that quotes it.
5. **Emergency lighting:** BS 5266-1:2025 (in effect 31 Oct 2025), BS EN 50172:2024 (BS 5266-8:2024)
   and BS EN 1838:2024 are paywalled. Use their public previews (contents, forewords: EN 50172:2024
   adds initial verification, handover, logbook requirements and daily, monthly and annual
   verification), the BSI summary (scope widened to local area and standby lighting), ICEL or LIA
   free guidance, and the government's free fire safety risk assessment guides. Settle: the escape
   route minimum (1 lux on the centre line; the guide also says 2 lux), uniformity, sign viewing
   distances under BS EN 1838:2024, durations for each premises type, recharge time before
   reoccupation, and what the logbook must hold.
6. **PAT** (only when the course is built): HSE INDG236 and HSG107.

### 9.2 What GN3 would settle (10th edition, updated to A4; ask whether you can photograph these pages)

- Expected step 3 minimum and maximum values for twin-and-earth rings (the OSG points to GN3).
- The temperature correction of measured R1+R2 and Zs, and whether GN3 still uses 10 °C or 20 °C.
- The electrode test's spike moves: your slides say 10% of the distance (3 m at 30 m), the OSG says
  about 6 m. Taught as two methods until GN3 settles it.
- The E1 deviation rule (Part 2's average, deviation, × 1.2 and the 5% ceiling) in GN3's words.
- Why the earthing conductor is lifted for Ze (the parallel-path reason) in GN3's words.
- RCD testing under A4: whether the half-current test is still recommended, test currents for
  type A and B, and S-type windows.
- Insulation resistance: any GN3 advice between 1 and 2 MΩ, and the 20 MΩ latent-defect wording.
- Sampling: GN3's suggested procedure and ranges (the slides' "minimum of 20%").
- The recommended initial and periodic intervals table, and Regulation 652.1's factors.
- Test order in a periodic inspection, and when continuity tests may be left out.
- Voltage drop verification: measured (R1+Rn) × Ib, temperature, and how a failure is coded.
- A PFC above a device's breaking capacity: how it is coded.

---

## 10. Doubts and errors found in the materials

Each is checked before a lesson uses it; where a slide's figure is cut short, the worked example
says so.

- **Zs example 3 (Fundamental slides p.79):** 0.15 Ω on a 63 A type D breaker for a sub-main is
  marked "Not acceptable". That holds only at 0.4 s; a distribution circuit may have 5 s, where the
  OSG's measured maximum is 0.28 Ω (Table B6), so it passes. Not used until research settles the
  slide's intent.
- **Cut short:** (0.37 + 0.37) / 4 = 0.185 Ω, printed 0.18 (p.43); 230 / 0.03 = 7666.67 A, printed
  7666 A (p.77); 2.5 / 1.5 = 1.67, printed 1.66 (p.40). OCR read r2 as 0.62 Ω on p.46; the page image
  says 0.6 Ω, giving 0.24 Ω.
- **OSG Table B6** prints 5.87 Ω for a 6 A type B; 0.8 × 7.28 = 5.82 Ω and the 3 A type C beside it
  prints 5.82. The lessons use 5.82 Ω and research checks the table.
- **Electrode spike moves:** 10% (slides p.65, Part 2) against about 6 m (OSG p.123). Taught as
  contested.
- **Coding:** a sheath short of an accessory is C2 on one slide (p.52) and C3 on others (p.59, p.68);
  the condition (cores reachable, near metalwork) decides, and the lesson teaches that. Slide p.48
  judges Zs against "BS 7671 current at time of installation", while p.36 says observations follow the
  current edition: Best Practice Guide 4 settles it.
- **FI:** the slides (p.41) and the OSG (A2) predate A4, which changed what FI means for the outcome.
  Taught to A4 once quoted.
- **Sampling:** "a minimum of 20%" (eicr slides p.26) has no source; GN3 settles it.
- **Emergency lighting guide:** quotes withdrawn standards; dated legislation; 2 lux against 1 lux;
  "10 mins" for the monthly test is a maker's practice, not a standard's figure until research says
  so; survey figures, fines and products are advertising and not used.
- **Part 1 text** says that under A2 many Chapter 51 labels are no longer required in domestic
  premises: checked against A4 before use.

---

## 11. Decisions taken for you

Change any you like.

- **Three courses, seventeen lessons:** Initial verification (8), Periodic inspection (6), Emergency
  lighting (3). Folder `inspection-and-testing`, after Installation design on the Electrical shelf.
- **PAT waits** for your course's slides.
- **Emergency lighting is new ground, in the refresher shape.** None of your awards covers it, so its
  recall openers ask what you have seen on site, and a wrong answer starts the teaching. It is built
  last, only after research has quoted the 2024 and 2025 standards. Your maker's guide gives the
  structure and the rules research confirms; its products and figures are never shown as fact.
- **Taught to BS 7671:2018+A4:2026.** Your courses taught A2. Where A4 differs (FI, the EICR notes,
  the forms), the lesson teaches A4 and says once what changed.
- **Your exam's shapes, not its questions.** Scenario-linked parts, picked or typed; a capstone that
  completes the certificate or report; Section B written answers marked by Claude against points.
  Nothing copied from the 2391 samples.
- **Two running cases,** both made up and said to be: Unit 3 (commercial, TN-C-S), shared by
  Initial verification and Emergency lighting; a 1975 house (TN-S, rewireable fuses) for the EICR.
  Readings are practice values; everything derived from them is worked from the rule shown.
- **Figures to two places,** each line worked from the rounded figures before it, the unrounded
  answer accepted too (Design and verification's rule).
- **Contested points taught as contested:** the electrode spike moves; FI's effect on the outcome;
  the sheath-short-of-a-box code; the escape route lux; sampling percentages.
- **No pilot.** You have worked through the format. Research for courses 1 and 2 together (they
  share A4, GN3 and Best Practice Guide 4), then Initial verification 1-4 as a batch for you to try,
  then 5-8, then Periodic inspection, then Emergency lighting's research and lessons.

---

## 12. Size and cost

- **Seventeen lessons**, about eleven screens each.
- **Lessons:** about 1.0M tokens a lesson through the workflow, as Design and verification ran:
  about 17M. Lessons with two pictures (Initial verification 1) or a long capstone (IV 8, PI 6)
  may run a little over; the decision-tree and report lessons a little under.
- **Research:** about 1.5M: about 0.5M for Initial verification (A4 forms, GS 38, the Zs rows), 0.4M
  for Periodic inspection (Best Practice Guide 4, A4 notes, HSR25), 0.6M for Emergency lighting
  (paywalled standards, so quotes must come from previews and free guidance).
- **Case files and lesson packs:** about 0.3M.
- **App work:** none. Typed answers, written answers, case files, summary cards, the read-through
  and review-box puzzles already exist.
- **Total: about 19M tokens.** At the measured full process (about 1.65M a lesson, Fractions lessons
  4 to 8), the same seventeen lessons would be about 28M plus research.
- Each batch's measured cost will be reported to you.

---

## 13. Open questions for you

1. **Three courses, PAT waiting:** agreed? Can you share the PAT course's slides or notes?
2. **Emergency lighting:** keep it as a short new course built last, or drop it?
3. **A4:2026 throughout,** saying once where your course's A2 differs: all right?
4. **The running cases:** Unit 3 shared by two courses, and a 1975 house: all right?
5. **GN3:** can you photograph the pages in section 9.2, or share a smaller file? Do you still have
   your EAL practical's completed EIC and EICR, or any mark scheme? They would give the capstones
   and the written points directly.
6. **Your Navy syllabi:** if the leading rate or level 3 marine engineering syllabus covers shipboard
   inspection and testing, share it and the "at sea it differs" screens can point to it.

---

## 14. Left out

- **Taught elsewhere:** design calculations (Design and verification); shipboard systems and
  insulation monitoring (Three-phase power systems at sea); fault finding (Maintenance and
  fault-finding).
- **Not in your materials and not needed for the work:** special locations' test details beyond a
  recall screen (Part 7), medical locations' new bonding schedule (A4, Section 710), solar PV and
  battery storage testing, EV charge point testing, fire alarm insulation testing (BS 5839-1).
- **Not taught again:** the regulations' legal framework beyond EAWR regulations 4 and 14, the
  definitions of exposed and extraneous-conductive-parts, cable selection and IP codes beyond recall.
