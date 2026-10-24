# What is left to build: an inventory and a ranked list

Written 24 Oct 2026 for Dan's question: "analyse what's left to build and tell me what we should
build next. I also want a new innovative build style and learning style for the next one as a test."
This is analysis only. Nothing was built, changed or published. Design and verification lesson 10 is
building while this was written, so it is counted as live-in-progress, not as a candidate.

Read for it: the five shelves (`docs/shelves-*.json`), every built course's files in
`docs/courses/*/*`, the unbuilt plans in `build/electrical/*/` (Inspection and testing, Amendments
3 and 4, the Design and verification extras plan), the Drive inventory (`build/drive-inventory.md`,
175 files), `docs/NEXT.md`, `tools/course/RUNBOOK.md`, the teaching research
(`docs/research/how-to-teach-pre-built-courses.md`) and CLAUDE.md.

---

## 0. The short version

**Build next, as the test: "Fault-finding: from symptom to cause", 4 lessons, about 5M tokens.**
It is on the shelf already (Maintenance and fault-finding), it is the work Dan does every day and
the work a leading hand supervises, he holds his own materials for it, and it is the one subject
where a genuinely different learning style is the natural one: start from the fault, not the
theory. One caution: several of its best cases sit in his inspection and testing handouts, and
Inspection and testing is on hold. Fault-finding is a separate course on the shelf and does not
teach test procedures, but Dan should say whether it is all right to use those handouts.

**Close second, also a good test: "Generators and the ship's switchboard", 4 lessons, about 4.6M.**
The most Navy-specific course on the list, but it rests on public sources only.

| Rank | Candidate | Lessons | Tokens (about) | His own materials | Good TEST? |
|---|---|---|---|---|---|
| 1 | Fault-finding: from symptom to cause (Maintenance and fault-finding, part 1) | 4 (5 with "at sea") | 5.0M | Yes: NVQ fault-finding slides, S and Y plan sheets, eight or so group handouts, HSG85 | **Yes, the best** |
| 2 | Generators and the ship's switchboard (Three-phase power systems at sea, part 1) | 4 | 4.6M | Almost none (one C&G paper question) | **Yes** |
| 3 | Transformers | 4 | 4.4M | None dedicated | **Yes** (lowest risk) |
| 4 | Earthing at sea: insulated neutrals and earth faults (Three-phase power at sea, part 2) | 3 | 3.4M | None | Yes |
| 5 | Instrumentation and control | 6-7 | 7.0M | None | No (too big; a 4-lesson cut could be) |
| 6 | Leading a team (for the Level 4 management and leadership) | 4 | 4.3M | None; needs his syllabus | Yes, for a role-play style |
| 7 | Batteries and stored energy | 3 | 3.4M | One IET introduction (PDF) | Yes |
| 8 | Mechanical and heat science for marine engineering | 6-8 | 7-9M | None; needs his syllabus | No |
| 9 | Maths: Vectors, then Differential equations | 6 + 6 | 6.5M each | None | No |
| 10 | Design and verification lesson 11: other supplies (TT and a standby generator) | 1 | 1.2M | Greenhouse handout, C&G paper 4 | No (one lesson) |
| 11 | EV charging | 3-4 | 4M | Two webinar videos (about 1.6 GB, untranscribed) | No |
| Held | Inspection and testing: 3 courses, 17 lessons (incl. Emergency lighting) | 17 | 19M | Yes, the most of any topic | **On hold** (Dan: "Don't build inspection and testing until I give green light") |
| Held | PAT (in-service inspection and testing) | about 4 | 4M | Only one mock paper | Waits for his slides, and sits under the I&T hold |
| Dropped | BS 7671 Amendments 3 and 4 | 5 | 3.7M | Five summary files | **Dropped** (Dan, 24 Oct: "pointless") |
| Dropped | Building Regulations | - | - | Slides and three mocks | **Dropped** (Dan: "not bothered") |

Token figures use about 1.0M a lesson (Design and verification's measured rate), plus research. A
new style adds a one-off cost for the new screens and kit pieces it needs: allow about 0.5M to 1.0M
on top for the test course, reported separately so the style itself can be judged on cost. At the
full process rate (about 1.65M a lesson) every figure would be about 60% higher.

---

## 1. What is live

| Shelf | Course | Lessons | Built from |
|---|---|---|---|
| Electrical | AC circuits | 10 | Public sources (Kuphaldt, Bird, OpenStax, MCA ETO syllabus lines) |
| Electrical | Design and verification, a Level 4 refresher | 9 live, lesson 10 building | His EAL L4 pack, drawings, slides, C&G 2396 papers, OSG and BS 7671 pages |
| Electrical | HV Subsea Cable Testing | 7 | His own 10-page course notes |
| Electrical | Motors | 8 | His NVQ motor sheets and DOL/star-delta handouts |
| Maths | 17 courses with a tid: Fractions, Negative numbers, Percentages, Proportional reasoning, Solving equations, The coordinate plane, Geometry fundamentals, Linear equations, Straight-line graphs, Linear systems, Powers and roots, Functions and their graphs, Quadratics and polynomials, Exponentials and logarithms, Trigonometry, Complex numbers, Calculus fundamentals | about 5-10 each | Public sources |

(The relayed brief says 16 maths courses; `docs/shelves-maths.json` carries a tid on 17.)

**Every course built so far uses one family of lesson: a linear run of steps screens** (SHOW a
picture, DO a puzzle) in one of three weights: the maths steps lesson; the refresher shape (recall
opener with "Skip to the practice", the why, worked example, Section A on a running case, Section B
written answer, Keep this; Design and verification and Subsea); and the light reference shape (one
picture, characteristics, faults, Keep this; Motors). Every lesson can be quizzed through or read
through, and worked examples become puzzles in the review box. So any style that is not "screens in
a fixed order, theory first" would be new.

**What the teaching research already says that the app has not tried** (from
`docs/research/how-to-teach-pre-built-courses.md`): the expertise reversal effect. For someone who
already knows a field, worked examples first become redundant and problem-first works better
(Kalyuga et al. 2001, with trade apprentices; Reisslein et al. 2006, with circuit analysis). Dan is
expert in most of the electrical shelf. 4C/ID's whole tasks, in easy-to-hard classes with fading
support, are also unused. Both point at the same kind of test: start each lesson from a whole real
job or fault, and pull the theory in only when he needs it.

---

## 2. Standing instructions from Dan that shape the list

- **Inspection and testing: on hold.** "Don't build inspection and testing until I give green
  light." Covers the three planned courses (Initial verification 8, Periodic inspection and the EICR
  6, Emergency lighting 3) and PAT.
- **Amendments 3 and 4: dropped** (24 Oct): "I don't want a course on what changed in amendment 3
  and 4, that's pointless." The audit work stays useful: `dv-audit.md` keeps Design and
  verification on A4, and `a4-for-inspection-and-testing.md` is ready for when I&T is green-lit.
- **Building Regulations: dropped** ("not bothered").
- **Writing:** own words, no narrating sources (20 Oct); text screens at most about 90 words (21 Oct);
  not a job card, a refresher he can use as a reference at work (Design and verification).
- **Format is open:** "it doesn't have to follow the same flow as all the other courses... If you
  think there's another style that teaches or refreshes that course better I'm happy to hear your
  opinion" (said of Design and verification; the 24 Oct request asks for exactly that, as a test).
- **Two ways through every lesson:** "quiz me through" or "just a read through". A new style must
  keep both, or say plainly why it cannot.
- **Cost matters:** a weekly usage limit was hit on 21 Oct mid-build. Small courses, reported costs.
- **Build rules (11-12 Oct):** models and effort per stage (CLAUDE.md table); at most three build
  attempts per interactive.
- **Maths (7 Oct):** "Generate absolutely every single one of these as an entire course" for the
  Maths shelf. 33 maths courses still have no tid. Since then every build has been electrical, and
  33 courses at about 7 lessons each is about 230M tokens, so this is read as a long-run wish, not
  the next job. Only the maths that serves the Navy path is ranked below.
- **Never re-teach** what his qualifications cover (CLAUDE.md): BS 7671 design and verification,
  inspection and test, cable fault location. Pitch above them.

---

## 3. The candidates, in rank order

### 1. Fault-finding: from symptom to cause (recommended next, and the test)

**What it is.** The first part of the shelf's planned "Maintenance and fault-finding" course
(blurb: "Systematic fault-finding, insulation resistance and condition monitoring"). Each lesson is a
set of faults: the symptom he would be told, the tests he would choose, the readings he would get,
the cause, and the fix. Proposed lessons:
1. The method: symptom, safe isolation, half-split, prove the fix (recall only for safe isolation).
2. Final circuit faults: the broken ring, reversed polarity, the PEN fault, the high-resistance
   joint, read from patterns of readings.
3. Nuisance tripping: RCD trips, earth leakage that adds up, insulation that falls, and the S and Y
   plan heating faults as a whole-system case.
4. Motor and starter faults: the DOL control circuit that will not latch, overloads, single-phasing,
   a motor that hums (drawing on Motors' "faults and tests" screens).
5. (Optional, public sources) Faults at sea: finding an earth fault on an insulated system. Better
   placed in candidate 4 if that is built first.

**His materials** (Drive, not yet copied into `build/`):
- QSQ and NVQ / PowerPoint presentations: "Fault finding and rectification.pdf" (0.22 MB), "Health &
  Safety (1).pdf".
- QSQ and NVQ / Heating controls S & Y plan: "Copy of S plan fault finding no heating", "Copy of Y
  plan fault finding no hotwater".
- 06 - Miscellaneous: "hsg85.pdf" (HSE, safe working practices), "rcd out of balance.jpg".
- Group handouts: "Boiler fault 13.10.2024", "PEN FAULT 11.5.25", "broken Ring Final", "Ring Final
  with polarity issues", "Incorrect supply polarity loads still live after isolation", "Incorrect
  supply polarity earth faults are not detected", "RCD Ramble 20.10.2024", "RCD's 29.9.24".
- Already in the repo: his motor sheets and DOL/star-delta handouts (`build/electrical/motors/source`),
  and `pen-fault.txt` and `rcd-ramble.txt` in `build/electrical/inspection-and-testing/source/handouts`.
- Public sources for the gaps (structured fault-finding method; any marine content).

**How it serves him.** Fault-finding is daily work for an electrician and is what a leading hand is
asked to direct and check. It is the course most likely to be used "as a reference in the real
world". It also exercises judgement, which no live course does: every other course teaches a rule
and then checks it.

**Builds on.** Motors (all eight lessons' faults and tests), AC circuits (impedance, power factor),
Design and verification lessons 6 and 9 (Zs, expected readings), Subsea (IR and PI over time).

**Overlap and instructions.** No instruction against it. But four of the handouts above are
inspection and testing teaching material, and I&T is on hold. The I&T brief already draws the line
("Fault finding and repair are not inspection... Maintenance and fault-finding take that up"), so
this course would use the handouts as fault cases, never as a test-procedure refresher. Ask Dan.

**Size and cost.** 4 lessons at about 1.0M = 4.0M; research about 0.4M (method, RCD leakage limits
if quoted, S/Y plan wiring confirmed); new-style screens about 0.5-1.0M. **About 5M.** The fifth
lesson adds about 1.2M.

**As a TEST: the best fit.** Small, self-contained, his own material, and judged quickly: after one
lesson Dan will know whether starting from the fault teaches him more than starting from the rule.
The style it suits: problem-first diagnosis (a fault arrives; he chooses tests, the app returns
readings computed from a shown fault model, he names the cause; the theory appears only when a
wrong choice shows he needs it). Every fault model is a rule, so the numbers stay honest.

### 2. Generators and the ship's switchboard (Three-phase power systems at sea, part 1)

**What it is.** The shelf's "Three-phase power systems at sea" (blurb: "Generators, their speed and
excitation, running in parallel, insulated and earthed neutrals, and earth fault detection") split in
two. Part 1, about 4 lessons: the alternator (poles, speed and frequency; excitation and voltage);
synchronising an incoming set (lamps, synchroscope, the conditions); load sharing (kW by the
governor, kVAr by the excitation); and protection (reverse power, preferential tripping).

**His materials.** Almost none. C&G 2396 practice paper 4's generator question (sources, switched
alternative supplies, kVA not kW; `build/electrical/design-and-verification/source/extras/`) and
"Generation, transmission and distribution voltages uk.pdf" (shore grid, QSQ and NVQ folder). The
research for AC circuits and Complex numbers already quotes the MCA ETO syllabus lines on
synchronising, alternators and marine three-phase systems (`docs/courses/electrical/ac-circuits/
research-notes.md`, `docs/courses/maths/complex-numbers/research-notes.md`). Otherwise public
sources only: no Navy material, so no screen may claim how the Royal Navy does it.

**How it serves him.** Closest of any candidate to the ship's electrical plant he will maintain on
the electrical path, and to a Level 3 marine engineering syllabus (assumed, not seen: we hold no Navy
syllabus). Also the "generator" topic the Design and verification extras plan flagged as "beyond his
awards; Navy-relevant".

**Builds on.** AC circuits lessons 1 (turning coil), 8-10 (real, reactive and apparent power; power
factor; three-phase); Complex numbers (phasors, load sharing as vectors); Motors lesson 1.

**Instructions.** None. AC circuits' brief deferred alternators, synchronising and load sharing to
this course by name.

**Size and cost.** 4 lessons, 4.0M; research about 0.6M (public, marine sources thin). **About
4.6M.**

**As a TEST: good.** Suits a simulator style: one live switchboard he runs across all four lessons
(bring a set on line, share load, ride a fault), each lesson unlocking a control. Weaker than rank 1
as a test because it is new ground (the research says new ground needs guidance first, so a
problem-first style is the riskier bet here) and because it has no materials of his to check
against.

### 3. Transformers

**What it is.** On the shelf (Electrical principles, `tid: null`; blurb: "Turns ratios, losses,
efficiency and regulation, and three-phase transformer connections"). About 4 lessons: how it works
and the turns ratio; losses, efficiency and regulation; three-phase connections and vector groups;
special transformers (isolating, auto, current and voltage transformers for metering).

**His materials.** None dedicated. Public: Kuphaldt chapter 9 and Bird chapter 23 (named in AC
circuits' brief as this course's sources); the turns-ratio quotes already in Proportional reasoning's
research notes.

**How it serves him.** Ships' supplies are transformed down for lighting and small power, shore
supply and isolating transformers are common, and CTs and VTs feed every switchboard meter. Partly
known ground for an electrician, so it can be pitched as a short refresher with the marine uses.

**Builds on.** AC circuits 4 (inductance), 8 (apparent power), 10 (star and delta); Proportional
reasoning; Complex numbers.

**Instructions.** None.

**Size and cost.** 4 lessons, 4.0M; research about 0.4M. **About 4.4M.**

**As a TEST: good and the lowest risk.** Clean physics with computed numbers, so any style can be
fact-checked easily. Less of a judgement subject, so it would test a style's presentation more than
a new way of learning.

### 4. Earthing at sea: insulated neutrals and earth faults (Three-phase power at sea, part 2)

**What it is.** About 3 lessons: insulated and earthed neutral systems and why ships use the first;
earth fault detection (earth lamps, insulation monitoring); finding the earth fault (sectionalising,
the ship's version of half-split).

**His materials.** None. AC circuits' research notes already quote MCA ETO 3.13 and 3.15 and the
"Ships' 440 V three-wire insulated neutral" line; otherwise public sources.

**How it serves him.** The single biggest difference between shore work under BS 7671 and a ship.
Every BS 7671 course he holds assumes an earthed system.

**Builds on.** AC circuits 10; Subsea (insulation resistance); Design and verification 6 (ADS, as
the contrast).

**Instructions.** None. The I&T brief says no screen there implies BS 7671 governs a ship and points
here for the shipboard view.

**Size and cost.** 3 lessons, 3.0M; research about 0.4M. **About 3.4M.** If rank 1 is built first,
its optional fifth lesson moves here.

**As a TEST: yes** (3 lessons), the same simulator style as rank 2; better built after rank 2 so the
switchboard carries over.

### 5. Instrumentation and control

**What it is.** On the shelf (blurb: "Sensors, transducers and control loops on the plant"). About
6-7 lessons: measurement and 4-20 mA loops; sensors for temperature, pressure, level and flow;
on-off and proportional control; PID; logic and PLC basics; alarms and shutdowns.

**His materials.** None. Public sources only.

**How it serves him.** Machinery control and surveillance is a large part of marine engineering
work, and AC circuits deferred harmonics and filters here. Value is high but the scope is wide.

**Builds on.** Motors 3 (the drive), AC circuits, Exponentials (sensor response), Functions and
graphs.

**Instructions.** None.

**Size and cost.** 6-7 lessons, about 6.5M plus 0.5M research. **About 7M.**

**As a TEST: not as a whole.** A 4-lesson cut ("Control loops: from on-off to PID", built around one
tank or cooler loop he tunes) would be a strong simulator test.

### 6. Leading a team (for the Level 4 management and leadership qualification)

**What it is.** A non-electrical course for the qualification CLAUDE.md names. About 4 lessons, for
example: leading a task and a team; giving direction and briefing a job; feedback and handling
problems; planning and checking work. The exact topics must come from his syllabus.

**His materials.** None. No leadership or management file is in his Drive, and the repo holds no Navy
syllabus. Public models of leadership exist, but which ones his course uses is unknown; building
before seeing the syllabus risks teaching the wrong model.

**How it serves him.** Directly, the Level 4 ahead, and the leading rate's job of running a section.

**Builds on.** Nothing live.

**Instructions.** None. It is non-electrical; it is listed because it clearly serves the L4.

**Size and cost.** 4 lessons, 4.0M; research about 0.3M. **About 4.3M**, once he shares the syllabus.

**As a TEST: yes, for a different style:** scenario role-play, where Claude plays a team member and
Dan's answer is marked against points (the app already marks written answers this way). Not a good
first test, because the content cannot be fixed until the syllabus arrives.

### 7. Batteries and stored energy

**What it is.** About 3 lessons: battery types and how they store and fail; charging, ventilation and
the safety of large banks; batteries on a board (UPS, emergency supplies, battery storage feeding
back).

**His materials.** "electrical-energy-storage-an-introduction (1) (1).pdf" (1.42 MB, an IET
introduction, in the L4 Design and Verification Drive folder). Public sources otherwise.

**How it serves him.** Emergency and UPS supplies on any ship; the amendments brief named battery
storage and two-way power as "the changes most like ship's systems". Moderate.

**Builds on.** AC circuits, Design and verification (supplies and protection).

**Instructions.** None. It must not become the dropped amendments course by another name: teach the
machine, not what A4 changed.

**Size and cost.** 3 lessons, 3.0M; research 0.4M. **About 3.4M.**

**As a TEST: possible** (small), but a weaker match to a judgement-based style.

### 8. Mechanical and heat science for marine engineering

**What it is.** The applied mechanics and heat that a Level 3 marine engineering qualification is
likely to include (forces and moments, work, energy and power, pressure and pumps, heat and engines).
RUNBOOK section 0 records his earlier aim as "engineering maths, applied mechanics, applied heat,
electro-technology". The science shelf's "Classical mechanics" is the nearest listed course.

**His materials.** None. His BTEC L3 Advanced Manufacturing Engineering probably covered some of
it, so the pitch must start above that.

**How it serves him.** Possibly a lot, but unknown until he shares the Level 3 marine engineering
syllabus. Build nothing here until then.

**Size and cost.** 6-8 lessons, about 7-9M.

**As a TEST: no.**

### 9. Maths: Vectors, then Differential equations

**What it is.** Two unbuilt courses on the Maths shelf (Advanced maths). Vectors: forces resolved and
added, phasors as vectors. Differential equations: RL and RC transients, cooling, the HNC-level step
after Calculus fundamentals.

**His materials.** None. Public sources.

**How it serves him.** Vectors serves mechanical science and three-phase work; differential
equations serves a later HNC route more than a Level 3. Other unbuilt maths (Limits, Derivatives,
Calculus in a nutshell, Matrices, Linear algebra, Vector calculus, Group theory, the probability,
logic, everyday and puzzle folders) does not clearly serve the Navy path; it stays under Dan's
7 Oct "build every one" wish, to be picked by him.

**Builds on.** Trigonometry, Complex numbers, Calculus fundamentals.

**Size and cost.** About 6 lessons each, about 6.5M each.

**As a TEST: no** (the maths format is settled and works).

### 10. Design and verification lesson 11: other supplies

**What it is.** The optional lesson in `extras-plan.md`: "Other supplies: a TT outbuilding and a
standby generator", from the greenhouse handout and paper 4's generator question. The plan does not
recommend it by default and leaves it to Dan.

**His materials.** `greenhouse-scenario.txt` and `cg2396-practice-paper-4.txt` in
`build/electrical/design-and-verification/source/extras/`.

**How it serves him.** The TT half is ground his 18th Edition and I&T awards cover. The generator
half is the Navy-relevant part, and fits rank 2 better.

**Size and cost.** 1 lesson, about 1.2M.

**Suggestion.** Fold the generator question into rank 2 and drop the lesson, unless Dan wants the
TT case for shore work.

### 11. EV charging

**What it is.** A short course on charge-point installation.

**His materials.** "EV webinar": Am.mp4 and Pm.mp4 (about 1.6 GB of video, never transcribed).

**How it serves him.** Shore work only; little for the Navy path. Listed because he holds material.

**Size and cost.** 3-4 lessons, about 4M, plus transcription of the videos.

---

## 4. On hold and dropped, for the record

| Item | Plan | Status | Note |
|---|---|---|---|
| Initial verification and certification | 8 lessons (`build/electrical/inspection-and-testing/sections.json`) | On hold | The richest material of any topic: Fundamental I&T slides, Condition Report slides, Initial Verification PowerPoints Parts 1-2, C&G 2391-050/051/052 samples, about 30 group handouts, GN3 errata |
| Periodic inspection and the EICR | 6 lessons | On hold | Condition Report slides, OSG Appendix G |
| Emergency lighting | 3 lessons | On hold (inside the I&T plan) | Pocket guide already in `build/.../inspection-and-testing/source/`. Its size would make a good test, if Dan lifts the hold for it alone |
| PAT | about 4 lessons | Waits for his slides, and the hold | Drive holds only "5th Edition Book Paper 1.pdf"; its teaching folder is empty |
| Amendments 3 and 4 | 5 lessons, 3.7M | Dropped 24 Oct | Audits kept for D&V and I&T |
| Building Regulations | not planned | Dropped | "Building regs.pdf" and three mock papers in Drive |
| Heating controls (S and Y plan) | not planned | - | Domestic; used as one case in rank 1 instead |

---

## 5. What we do not hold, and would change the ranking

- **His Navy syllabi.** The leading rate engineering qualifications, the Level 3 marine engineering
  qualification and the Level 4 management and leadership qualification. Every brief since 20 Oct has
  asked for them (Motors question 4, I&T question 6). Ranks 2, 4, 5, 6 and 8 would be mapped to them,
  and rank 8 cannot start without one.
- **PAT slides** (for the PAT course, once I&T is green-lit).
- **GN3 pages** (for I&T, once green-lit).
- **Any Navy-issued notes** on ship's electrical systems. Without them, ranks 2 and 4 teach general
  marine practice from public sources and say so.

---

## 6. Which candidates make a good TEST of a new style

A good test is small (3 to 5 lessons), self-contained, and quick to judge. Ranked for that purpose:

1. **Fault-finding (rank 1, 4 lessons).** Best. His own material, his real work, and a subject where
   starting from the problem is natural. Tests the one idea the research says suits an expert and the
   app has never tried: problem first, theory on demand.
2. **Generators and the switchboard (rank 2, 4 lessons).** Good for a persistent-simulator style
   (one switchboard across the course, each lesson adding a control). Riskier: new ground, public
   sources only.
3. **Transformers (rank 3, 4 lessons).** Lowest risk; tests presentation more than learning.
4. **Earthing at sea (rank 4, 3 lessons).** Good, best after rank 2.
5. **Leading a team (rank 6, 4 lessons).** The only fit for a conversation or role-play style, but
   waits for his syllabus.
6. **Emergency lighting (3 lessons).** The right size, but on hold.

Whatever the style, the test should keep the two ways through ("quiz me through" and "just a read
through"), the 90-word screen limit, his own-words writing, honest computed numbers, and puzzles for
the review box, and should report its token cost against the 1.0M a lesson baseline.

---

## 7. Not courses: app items still open

From `docs/NEXT.md` (it may be behind the live app; check before acting): the Library home and the
puzzles-as-review-cards phase were built on 18 and 20 Oct and marked "not yet published" there;
deleting the unhooked Learn code waits for Dan; eval round 3 is not run; a list of small known
issues (items 2-10). None of these blocks a course build. A new learning style may need new kit
pieces or a new screen type, which is app work and should be costed with the test.
