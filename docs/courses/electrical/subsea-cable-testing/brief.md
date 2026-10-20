# HV Subsea Cable Testing: the course brief

Written 20 Oct 2026 for Dan, answering the course brief in `tools/course/RUNBOOK.md` section 0. You
asked for a refresher of the City & Guilds Assured Subsea Cable Testing and Fault Location course you
did in September 2026 at a wind academy, and you named it "HV Subsea Cable Testing". This is a plan
only. Nothing is researched in full, written or built. I took the decisions for you and listed them in
section 10. Change any you like.

**It is a refresher, not new teaching.** It follows the format you approved and worked through for
Design and verification (`docs/courses/electrical/design-and-verification/format/refresher.md`):
recall first, the why where you need it, practice on one running job, a short written answer, and a
Keep this card for your Book. No timers, marks or grades.

**One source: your own notes.** "For subsea cable testing all I have is my own course notes." They
are `source/subsea-cable-testing-notes.pdf`, 10 pages, cited here as "notes p.N", the PDF page. The
academy handed out nothing else. The notes mark some items with ➕: background added afterwards, not
from your course. This brief treats every ➕ item as a claim to check, never as a source (section 8).

**How the lessons read.** In your own-words style (Dan, 20 Oct): the sources are for getting it
right, not for showing. No lesson says where something comes from in the sentence. Footnotes go only
on figures you would look up on a job, such as a test voltage or a velocity factor.

---

## The short version

**One course, seven lessons, in your notes' order** with two changes (section 2):

| # | Lesson | Notes | Main picture |
|---|---|---|---|
| 1 | The cable, and making it safe to test | Parts 1 and 2, p.1-2 | The core in cross-section, each test lighting the layer it stresses; the isolated core as a charged capacitor |
| 2 | Phases and conductors: the four-wire measurement | Part 3, p.2-3 | The four-wire bridge: drag the P probes outside the C clamps and the leads join the reading |
| 3 | Insulation resistance over ten minutes: IR, DAR and PI | Part 4, p.3-4 | IR against time over 10 minutes, dry and wet, with PI and DAR read off the curve |
| 4 | The sheath test: 4 kV per millimetre | Part 5, p.4 | The sheath's thickness against its test voltage and the stress per mm, with the 10 kV cap |
| 5 | VLF withstand: why 0.1 Hz | Part 7, p.6-7 | One core's charging current: a 0.1 Hz sine against 50 Hz, the same voltage, 500 times the current |
| 6 | TDR: reading the reflections | Part 8, p.7-8 | A TDR trace with an open, a short and a joint, and the velocity setting that moves them |
| 7 | LIRA: the cable's impedance spectrum | Part 6, p.5-6 | The impedance spectrum, its resonances, and a local change appearing as a spot along the cable |

**Every lesson has the refresher shape,** about eleven screens: Do you still have it? (Skip to the
practice if you have); what the test is for and what goes wrong without it; the why, with an
interactive; a check; a worked example from your notes; Section A practice on the running job;
Section B, a short written answer marked by Claude against points from your notes or a quoted source;
one changed-numbers item; and Keep this.

**The running job, String B** (`case.json`). A made-up commissioning job on a newly laid 66 kV
inter-array cable, 2.40 km from turbine B01 to the offshore substation, with a full set of readings
from phase ID to LIRA. One fault waits in core L2: it shows as a flat PI, a sheath that will not
hold, a VLF breakdown, and then a downward peak on the TDR at 960.1 m, which LIRA confirms from both
ends.

**What research must settle first:** the VLF voltage range (your notes' 1.5-2.5 U0 against IEEE
400.2's own wording), the PI and DAR bands (makers' tables differ from your notes), the discharge rule,
the temperature correction, and every ➕ claim the lessons would use. Section 8 lists each with
where to look.

**Cost:** about 8M tokens for research and seven lessons. No new app work: Design and verification
already built the pieces (section 11).

---

## 1. The overall topic

Commissioning and fault-finding tests on HV subsea power cables: the inter-array cables that link
offshore wind turbines to the offshore substation, and the export cables that bring the power ashore
(notes p.1). The course covers what each test checks, why it works, how to read its result, and how
to stay safe doing it. Every test checks one layer of the cable or the boundary between two of them
(notes p.1). Core resistance checks the conductor. The IR test and the VLF withstand check the
insulation between conductor and screen. The sheath test checks the oversheath between screen and
earth. TDR and LIRA treat the cable as a transmission line and find where its impedance changes.

**Where it stops.** Testing a cable that is disconnected, discharged and earthed, from its two ends.
Not covered: cable design and rating, jointing and termination, repair, partial discharge testing,
tan delta, surge and acoustic pinpointing, sheath fault pinpointing with an A-frame, and online
monitoring systems beyond one line. Your notes' Part 9 (other fault location methods, ➕) is left to
Maintenance and fault-finding, apart from one screen in lesson 6 (section 13).

---

## 2. What is useful, in an order that builds

Your notes run: the system; safety; conductor tests; IR; sheath; LIRA; VLF; TDR. The lessons keep that
order with two changes.

- **Parts 1 and 2 are joined into lesson 1.** The safety part is short and practical, and you work to
  HV safety rules already, so it does not need a lesson of its own. The cable's layers explain why it
  is dangerous when dead: conductor and screen are two plates with XLPE between them, so the cable is a
  capacitor that holds charge and picks up charge from a live neighbour (notes p.2). Taught together,
  the safety rule has its cause beside it.
- **LIRA moves from sixth to last.** TDR shows the reflection idea in its plainest form: a pulse goes
  out, and a change of impedance sends some of it back. LIRA reads the same reflections as a spectrum
  instead of a trace. Taught after TDR, LIRA becomes "the same physics, read another way, sensitive to
  smaller changes". Taught before it, LIRA has nothing to stand on. LIRA last also matches your notes'
  test sequence, where the LIRA baseline is the final record of the cable as it goes into service
  (notes p.9, ➕). Say if you would rather keep your notes' exact order.
- **Phase identification stays inside lesson 2**, as the first screens. It is a continuity test you
  have done for years; what is new is the two-person, both-ends discipline (notes p.2).
- **Part 9 and the test sequence are not lessons.** Part 9 is all ➕ and says "go with whatever the
  instructor teaches". The test sequence (notes p.9, ➕) becomes the running job's order and lesson
  7's closing screen, once research has backed it.

So the order follows the test sequence on a real job: safe to touch; the conductors; the insulation at
low stress; the sheath; the insulation at full stress; then finding the fault and recording the
baseline.

---

## 3. Can it be taught visually, through interaction?

**Partly** (RUNBOOK section 0, item 3). Steps lessons (`format: 'steps'`, read mode) in the refresher
shape, with SHOW screens carrying up to a short paragraph where the why needs words. Every test here
has a physical cause you can draw: a current path, a curve over time, a voltage across a thickness, a
wave, a reflection. Each lesson's main picture shows that cause, not just the result. Numbers on the
pictures are controls you move, or are worked on screen from a shown rule.

---

## 4. The lessons

Each entry gives the notes pages, the recall opener, the why, the main picture, the practice, the
written question and the Keep this card. Section A parts are worked in `case.json` by id ("2a").
"To research" marks what must be quoted before the lesson uses it.

### Lesson 1. The cable, and making it safe to test
*Notes p.1-2. Unit: The cable and safety.*

- **Recalls first.** "An isolated cable runs beside a live string. You have proved it dead at your
  end. What must happen before anyone touches its cores?" Right: discharge it and apply earths, at
  both ends. The slips: "proved dead is enough" and "open the far isolator". Each gets its own
  feedback. A second quick recall: the confirm sequence in order (Identify, Isolated, Proved dead,
  Secured, Earthed, notes p.2).
- **What it is for.** Every later test assumes a cable that cannot hurt you. A test set charges the
  cable too, so the same discipline comes back at the end of every test.
- **The why it re-teaches.** The core's layers, middle out, and which test checks which (notes p.1,
  ➕, to check against a maker's data sheet). Conductor and screen are the plates of a long capacitor.
  So an isolated core can hold a charge after switching off, and a live neighbour can couple voltage
  onto it with no connection at all (notes p.2). Earthing both ends drains it and holds it at zero.
  The capacitance is AC circuits lesson 5's idea, used, not taught again.
- **Main picture.** The core in cross-section. Tap a test (DLRO, IR, sheath, VLF, TDR) and its layer
  lights up, with the path its voltage or current takes. Then the same core drawn as a capacitor
  beside a live one: lengthen the run and the charge it holds grows; close the earth and the voltage
  falls to zero; open it and the warning shows. To research before it is built: how capacitive and
  inductive coupling each depend on the parallel length (the notes' "the longer the worse", ➕).
- **Shock, in one screen.** Voltage, resistance, path and duration (notes p.1). 55 V across about
  10 000 Ω drives 5.50 mA. The body's resistance is not fixed: it falls as the voltage rises, so the
  10 000 Ω only holds near 55 V (to research, IEC 60479-1 via HSE or a secondary source). 50 mA or
  more is the potentially fatal zone (notes p.1).
- **Worked example.** One core of String B: C = 0.22 µF/km × 2.40 km = 0.528 µF. The most it could
  hold, switched off at the peak of U0: C × U0² = 762.43 J.
- **Section A.** 1a: determine the capacitance of one core (0.528 µF). 1b: determine the most energy
  one core could hold if switched off at the peak of its phase voltage (762.43 J; the slip without the
  peak, ½CU0², is 381.22 J).
- **Changed numbers.** A 1.80 km core at the same 0.22 µF/km: 0.396 µF.
- **Section B.** "Explain why a disconnected cable is treated as live until it has been tested,
  discharged and earthed." Points: nearby energised circuits can induce voltage into an isolated cable
  (notes p.2); treat it as live until tested, discharged and earthed (p.2); the energy in the
  insulation can recharge the conductor after discharging (p.3); earths go on at both ends where
  required, and come off only under the documents (p.2). A full answer makes any three.
- **Keep this.** For: making a cable safe to test and safe to touch after. Rule: Identify, Isolated,
  Proved dead, Secured, Earthed. Q = CV; E = ½CV². Traps: proved dead is not discharged (p.2); a
  cable beside a live one picks up voltage (p.2); a discharged cable can recharge itself (p.3). Where:
  every test, at both ends. Figures: 1a, 1b.

### Lesson 2. Phases and conductors: the four-wire measurement
*Notes p.2-3. Unit: Conductors.*

- **Recalls first.** The notes' worked example: loops of 76.90, 80.49 and 81.16 mΩ. "What is L1?"
  38.785 mΩ. The slips: 38.115 mΩ (the L2 formula) and 38.45 mΩ (half the first loop).
- **What it is for.** Phase ID makes sure L1, L2 and L3 are terminated in the right order; a mistake
  gives a short when energised (notes p.2). Core resistance proves the conductors and joints are
  intact, within 2% of factory values (p.3).
- **Phase ID, briefly.** Two technicians, one at each end, talking before every change. Core to
  screen continuity proves each core end to end; a DLRO is preferred on long runs (p.2). Red L1,
  Yellow L2, Blue L3.
- **The why it re-teaches.** Under 1 Ω, lead and contact resistance swamp the reading (p.2). The
  four-wire answer: current goes in through the C leads; the P leads measure the voltage across only
  what lies between them; almost no current flows in the P leads, so their resistance drops out (➕,
  to research in Megger's low-resistance testing guide). That is why the P probes sit inside the C
  connections and face each other. Then why three loops: each reading is two cores in series, so
  three readings solve three unknowns, and A + B + C = 2 × (L1 + L2 + L3) (➕ p.3, checked here by
  arithmetic).
- **Main picture.** The four-wire bridge, drawn as the circuit: a current source on the C leads, a
  voltmeter on the P leads, the core between, and small resistors for each lead and contact. Drag a P
  probe outside its C clamp and the lead and contact resistance join the reading; slide it back and
  they vanish. A second state solves three loops for three cores as you type them.
- **Check.** "Your loops are A, B and C. Which gives L3?" (C + B − A) ÷ 2.
- **Worked example.** The notes' three loops, line by line (p.3). It notes that the notes label the
  three results A, B and C again, which is confusing, and that their L3 reads about 9-11% above L1
  and L2. Three cores of one cable should read close together, so that is the kind of deviation to
  explain before submitting (p.3).
- **Temperature.** Copper's resistance rises with temperature, so a cold cable reads low against a
  certificate at 20 °C. The notes say about 0.4% per °C (➕); the case uses 0.00393 per °C, to be
  quoted from IEC 60228 or a maker before the lesson is written.
- **Section A.** String B at 12 °C, loops 339.31, 339.21 and 338.32 mΩ. 2a: determine L2's
  resistance (170.10 mΩ). 2b: correct it to 20 °C (175.62 mΩ; 175.72 mΩ with the notes' 0.4% is
  accepted). 2c: compare it with the factory 174.90 mΩ (+0.41%, inside 2%: passes). The trap: without
  the correction it reads −2.74% and looks like a fail.
- **Changed numbers.** Loops of 120.40, 121.10 and 120.90 mΩ: L3 is 60.80 mΩ.
- **Section B.** "Explain why the P probes must sit inside the C connections, facing each other."
  Points: lead resistance and contact resistance affect a low-resistance reading (notes p.2); the
  current flows in the C leads and the voltage is measured on the P leads (research quote); almost no
  current flows in the P leads, so their resistance does not affect the reading (research quote); the
  reading is only what lies between the P probes (research quote). Any three.
- **Keep this.** For: proving conductors and joints. Rule: L1 = (A + C − B) ÷ 2; L2 = (B + A − C)
  ÷ 2; L3 = (C + B − A) ÷ 2; R20 = R_t ÷ (1 + α(t − 20)). Traps: P outside C (p.2); comparing a cold
  reading with a 20 °C certificate (p.3); submitting a deviation before finding why (p.3). Where: after
  phase ID, before IR. Figures: 2a, 2b, 2c.
- **To research.** The DLRO10HD's yellow, green and red indications (p.2) from Megger's user guide;
  the earthing order for phase ID (section 9).

### Lesson 3. Insulation resistance over ten minutes: IR, DAR and PI
*Notes p.3-4. Unit: Insulation and sheath.*

- **Recalls first.** "1 minute: 2.0 GΩ. 10 minutes: 6.0 GΩ. What is the PI, and how does it rate?"
  3.00, okay. The slip: 0.33 (the ratio upside down).
- **What it is for.** A DC voltage between conductor and screen, and the tiny current through the
  XLPE (➕ p.3, to check). It tells you whether the insulation is dry and clean at low stress, before
  anything stresses it hard.
- **The why it re-teaches.** The current the tester sees has three parts: a charging current that
  dies in seconds, an absorption current that dies over minutes as the insulation polarises, and a
  leakage current that stays. Resistance is voltage over that total, so it climbs while the first two
  die away. Healthy insulation climbs; wet or dirty insulation leaks steadily and the curve stays
  flat. A ratio taken minutes apart on the same cable cancels the temperature that swings a single
  reading (Megger: DAR "can be seen as independent of temperature"; poor insulation's "high leakage
  currents will hide the charging currents"; both to quote in full). So "near 1" is the bad end of
  both scales (notes p.4, ➕).
- **Main picture.** PI curves over ten minutes. IR against time, 0 to 10 minutes, for one core. A
  slider adds moisture (the leakage path); another sets how strongly the insulation polarises. The 30
  s, 1 min and 10 min readings are marked, with DAR and PI worked from them and placed on your notes'
  bands. Wet insulation flattens the curve and both ratios fall towards 1.
- **Discharge.** After the test the cable holds charge: at 5 kV one core of String B holds Q = CV =
  2.64 mC and E = ½CV² = 6.60 J. Discharge it, watch the display show discharged, then the discharge
  stick, the hook stick and the hand earth, on core and screen, at both ends (notes p.3, p.10). Allow at
  least 5 × the charging time (p.3).
- **Worked example.** The notes give no worked numbers here, so the lesson works String B's L1:
  R30s 18.0, R1 24.0, R10 62.0 GΩ; DAR 1.33, satisfactory; PI 2.58, okay.
- **Section A.** 3a: determine L1's PI (2.58). 3b: determine L2's PI and rate it (1.09,
  questionable; its DAR is 1.05, inadequate). L2 reads 2.20 GΩ at one minute, which passes the
  client's 1 GΩ, so the single reading alone would have let it through. 3c: determine the least
  discharge time after the 10-minute PI test (50 min, on the reading of "charging time" in section 9).
- **Changed numbers.** 8.0 GΩ at 1 min and 9.6 GΩ at 10 min: PI 1.20, questionable.
- **Section B.** "Explain why a PI or DAR tells you more than a single IR reading." Points: a single
  reading changes with temperature and humidity (research quote); a ratio on the same cable minutes
  apart cancels them (Megger, to quote); healthy insulation's reading climbs as the absorption current
  dies away (Megger, to quote); wet or dirty insulation leaks steadily, so the ratio sits near 1
  (Megger, to quote; notes p.4). Any three.
- **Keep this.** For: insulation at low stress. Rule: PI = R10 ÷ R1; DAR = R60s ÷ R30s; Q = CV.
  Bands: PI <1 poor, 1-2 questionable, 2-4 okay, >4 good; DAR <1.25 inadequate, 1.25-1.6
  satisfactory, >1.6 excellent (notes p.4). Traps: a reading that passes the client's figure can still
  have a flat curve; a ratio upside down; lifting the earth before the cable has finished
  discharging. Where: after core resistance, before the sheath. Figures: 3a, 3b, 3c.
- **To research.** Megger's Table I and how its bands and names differ from your notes' (section 8,
  finding 1); whether PI means the same on a long XLPE cable as on a motor (contested); the discharge
  rule; the red and black terminal polarity (notes p.4: red to screen, black to core).

### Lesson 4. The sheath test: 4 kV per millimetre
*Notes p.4. Unit: Insulation and sheath.*

- **Recalls first.** "A sheath 2.0 mm thick. What test voltage, for how long?" 8.0 kV for 1 minute.
  The slips: 10 kV (the cap used every time) and 4 kV (the thickness left out).
- **What it is for.** The oversheath keeps water out. A hole lets water in, and water can creep along
  the cable and degrade the XLPE for years before the insulation fails (➕ p.4, to check). A sheath
  repair now is far cheaper than a cable later (p.4).
- **The why it re-teaches.** The test puts a DC voltage across the sheath alone: screen on one side,
  earth on the other (p.4). It needs a conductor on both faces of the sheath. Inside, that is the
  screen, foil and conductor linked together so every metal layer sits at the same voltage (p.4; IEC
  60229 clause 5, "All metallic layers under the oversheath shall be connected together", to quote).
  Outside, a semi-conductive sheath brings its own outer electrode, reached through the roll spring;
  a non-semi-conductive sheath uses earth through an earth electrode (p.4). Volts per millimetre keep
  the stress on thin and thick sheaths alike, and the 10 kV cap holds a thick sheath below 4 kV/mm.
- **Main picture.** Sheath voltage per mm. A slice of sheath between screen and outer electrode.
  Drag the thickness: the test voltage rises at 4 kV per mm until it meets the 10 kV cap at 2.5 mm,
  then stays; a stress gauge shows kV per mm across the slice, steady at 4, then falling. A toggle
  swaps semi-conductive and non-semi-conductive and moves the positive lead between roll spring and
  earth rod. A pinhole option shows the current finding its way out through the hole.
- **Worked example.** None in your notes, so String B: 4 × 2.2 = 8.8 kV, held 1 minute.
- **Section A.** 4a: determine the test voltage for String B's 2.2 mm sheath (8.8 kV). L1 and L3
  hold. L2's test set trips at 3.2 kV after 20 seconds, which puts only 1.45 kV/mm across it.
- **Changed numbers.** A 3.0 mm sheath: 12.0 kV by the rule, so 10.0 kV at the cap (3.33 kV/mm).
- **Section B.** "Explain why a failed sheath test matters even when the main insulation passes."
  Points: sheath faults can cause full cable loss and be very expensive (notes p.4); the sheath's job
  is to keep water away from the insulation (IEC 60229 scope, to quote); water entering at a sheath
  fault can degrade the insulation over time (research quote); the sheath holds charge, which must be
  considered (p.4). Any three.
- **Keep this.** For: the oversheath, screen to earth. Rule: V = 4 kV/mm × thickness, at most 10 kV
  d.c., for 1 minute. Linked: conductor, foil and screen, both ends. Negative to the screen. Traps: the
  cap forgotten; the metal layers not linked; the wrong outer electrode for the sheath type. Where:
  after IR, before VLF. Figures: 4a.
- **To research.** IEC 60229:2007 clause 5 word for word (public preview); whether a three-core
  subsea cable's outer layer can be tested at all, or only each core's own sheath (section 9).

### Lesson 5. VLF withstand: why 0.1 Hz
*Notes p.6-7. Unit: Insulation and sheath.*

- **Recalls first.** "A 12/20 kV cable. What is the VLF test voltage range in your notes?" 18 to
  30 kV. The slip: 30 to 50 kV (20 kV taken as U0).
- **What it is for.** A pressure test: an overvoltage held for a set time (notes p.6). A defect bad
  enough at the test voltage grows an electrical tree and fails during the test, under control, not in
  service (p.6). Holding for the full time gives a high probability of good integrity (p.7).
- **The why it re-teaches.** A long cable is a big capacitor. At 50 Hz its reactance is small, so a
  withstand test needs a huge charging current. Xc = 1 ÷ 2πfC: drop f from 50 Hz to 0.1 Hz and Xc
  rises 500 times, so the current and the test set's power fall 500 times (p.6; the arithmetic is AC
  circuits lesson 5). Why not DC: DC on XLPE can leave space charge that adds to the stress when the
  cable goes back on AC (➕ p.7, to check against IEEE 400.2 or a maker's note).
- **Main picture.** One core of String B, its voltage and its charging current drawn against time.
  The 0.1 Hz sine takes ten seconds a cycle. Beside it, 50 Hz at the same voltage, and the current
  bar it needs: 25.21 mA at 0.1 Hz against 12.61 A at 50 Hz. Slide the frequency and the length and
  read the current and the test set's kVA. A marked limit shows why long cables need a lower frequency
  (p.7), once a maker's rating is quoted.
- **U0, in one line.** The rated phase-to-earth voltage (➕ p.7, to check). String B is 38/66 kV, so
  1.5-2.5 U0 is 57.0 to 95.0 kV.
- **Worked example.** The notes' 12/20 kV cable (p.7): 1.5 × 12 = 18 kV to 2.5 × 12 = 30 kV.
- **Section A.** The test spec asks 2 U0, 0.1 Hz, 60 minutes. 5a: determine the test voltage (76.0
  kV). 5b: determine one core's charging current at 0.1 Hz (25.21 mA). 5c: the same at 50 Hz (12.61 A,
  958.1 kVA). L1 and L3 hold 60 minutes; L2 breaks down at minute 12, and afterwards reads 35 Ω core to
  screen.
- **Changed numbers.** A 3.10 km core at 76 kV and 0.1 Hz: 32.57 mA.
- **Section B.** "Explain why VLF is used rather than a 50 Hz test on a long cable." Points: the
  power for an AC withstand test at mains frequency is very high because of the cable's capacitance
  (notes p.6); lowering the frequency raises the capacitive reactance (p.6); so the current and power
  the test set must give fall (p.6); a defect severe enough at the test voltage grows to failure during
  the test (p.6; IEEE 400.2, to quote). Any three. A DC point is added only if research quotes it.
- **Keep this.** For: insulation at full stress, before energising (p.6). Rule: Xc = 1 ÷ 2πfC; I = V
  ÷ Xc = 2πfCV; test voltage from the spec, 1.5-2.5 U0 in your notes (contested, section 8). 0.1 Hz;
  30 min simple withstand, 60 min installation or acceptance (p.7). Traps: U taken for U0; lowering the
  frequency needlessly (p.7); lifting the hand earth before the discharge stick and hook (p.6). Where:
  after the sheath, before LIRA. Figures: 5a, 5b, 5c.

### Lesson 6. TDR: reading the reflections
*Notes p.7-8. Unit: Fault location and condition.*

- **Recalls first.** "A reflection returns after 20.0 µs at 160 m/µs. How far?" 1600 m. The slip:
  3200 m (the ÷ 2 left out).
- **What it is for.** Total length, joints, and low-resistance faults, interruptions and water
  (notes p.7). A map of the cable, and a baseline (p.7).
- **The why it re-teaches.** A pulse travels along the pair at a speed set by the insulation. Where
  the impedance changes, part of it comes back (p.7). Up means the impedance rose, an open; down means
  it fell, a short; everything else is a partial version of one or the other (➕ p.8, to check). The
  time covers there and back, hence ÷ 2 (p.7). The velocity is the number to get right: a wrong
  setting moves every distance by the same fraction (p.7). TDR only sees faults under about 100 Ω (p.7):
  a high-resistance fault looks like healthy cable.
- **Main picture.** A TDR trace of String B's L2. A launch pulse; the field joint's small up-down at
  1620 m; the fault's downward peak; the end. Toggle the far end open and linked: the end's
  reflection flips from up to down, proving which blip is the end (p.7). A velocity slider stretches
  the distance scale; the fault's distance and the cable's length move together until the end sits at
  the known 2.40 km. A fault-resistance slider shrinks the fault's dip as it rises past about 100 Ω.
  The trace shapes in your notes (p.8) are a tap-through gallery beside it.
- **Worked example.** The notes' 2 km cable with a 5% velocity error: 100 m out (p.7).
- **Section A.** The open end returns at 28.57 µs; L2's downward peak at 11.43 µs. 6a: determine the
  velocity (168.0 m/µs, a velocity factor of 0.56, inside Megger's 0.54-0.62 for XLPE). 6b: determine
  the distance to the fault from the substation (960.1 m). 6c: from B01 (1439.9 m). The slips: 914.4 m
  (a default 160 m/µs left set) and 1920.2 m (no ÷ 2).
- **Changed numbers.** 15.00 µs at 172 m/µs: 1290.0 m.
- **One screen beyond TDR.** A high-resistance fault needs other methods; they are named, not taught
  (section 13), and only once research quotes a maker's guide.
- **Section B.** "Explain why the far end is tested open and then linked." Points: with the end
  linked the end reflection is a negative peak, a short (notes p.7); with no link it is a positive
  peak, an open (p.7); the two tests prove which reflection is the end of the cable (p.7); with the end
  proved, the velocity can be checked against the known length (Megger TDR_AN58, to quote). Any three.
- **Keep this.** For: length, joints and low-resistance faults. Rule: L = t × v ÷ 2; v = 2L ÷ t on a
  known length. Red to conductor, black to screen; 50 V pulse (p.7). Traps: velocity not set; ÷ 2 left
  out; a high-resistance fault read as healthy. Where: after a failure, from both ends where you can.
  Figures: 6a, 6b, 6c.

### Lesson 7. LIRA: the cable's impedance spectrum
*Notes p.5-6. Unit: Fault location and condition.*

- **Recalls first.** "A LIRA spot shows a negative DNORM in red. What could it be?" Water
  penetration, thermal or mechanical degradation, significant (notes p.6). The slips: a bend or a
  break in the shield (positive), and mild (green).
- **What it is for.** Impedance changes between any two metallic conductors, from one end only:
  length, joints, water and contaminants, and a baseline for later (p.5). Used at loadout,
  installation, commissioning and in service (p.5).
- **The why it re-teaches.** An unmatched line resonates: feed it a swept frequency and its input
  impedance peaks and dips at frequencies set by its length and velocity (p.5). A change in the
  insulation's permittivity changes the impedance where it happens (p.5), and that adds a ripple to
  the spectrum whose spacing encodes where it is. LIRA turns the spectrum into a picture along the
  cable, the spot signature, and grades each spot by DNORM (research: Wirescan's WP01 white paper and
  Fantoni's papers).
- **Main picture.** LIRA's impedance spectrum for String B's L2: |Z| against frequency, its
  resonances 35.0 kHz apart. Drag a local change along the cable and watch the ripple's spacing
  change and its spot move on the distance view below; change its sign and the DNORM bar flips colour
  and sign. A length slider shows the resonances crowd together as the cable gets longer.
- **Worked example.** None in your notes, so the resonance spacing for String B: Δf = v ÷ 2L =
  168.0 × 10⁶ ÷ 4800 = 35.0 kHz (the rule to quote first).
- **Section A.** 7a: determine the spacing of L2's resonances (35.0 kHz). 7b: LIRA from the B01 end
  puts the spot at 1441 m; determine where that is from the substation (959 m), against 961 m from the
  substation's own test and 960.1 m from TDR.
- **Changed numbers.** Resonances 25.0 kHz apart at 168 m/µs: a 3360 m cable.
- **The job, end to end.** The last screen lays out String B's tests in their order, what each found
  on L2, and why the order runs cheap and gentle first, the pressure test late and the LIRA baseline
  last (notes p.9, ➕, once research backs it).
- **Section B.** "Explain what LIRA measures and why it needs only one end." Points: impedance
  irregularities between any two metallic conductors (notes p.5); access to one end only (p.5);
  frequency-domain analysis of the resonance of unmatched lines (p.5); permittivity changes change the
  cable's impedance (p.5); normally tested bi-directionally, with a baseline kept for comparison (p.5).
  Any three.
- **Keep this.** For: condition and location, and the record for later years. Rule: Δf = v ÷ 2L.
  DNORM negative: thermal, water, mechanical; positive: bends, shield breaks; green, amber, red (p.6).
  No acceptance criteria; keep the raw trace (p.6). Online only up to 33 kV (p.5). Traps: one direction
  only; a trace with no raw data; reading a positive spot as water. Where: commissioning baseline,
  then at set intervals. Figures: 7a, 7b.
- **To research.** What "18 total tests" is made of (section 9); DNORM's sign convention and colour
  thresholds; whether the 33 kV online limit still stands (a CIGRE paper describes online LIRA on a
  wind farm, CSE N024).

---

## 5. The running job: String B

`case.json` holds every given and figure, each cited to your notes, marked as a practice value, or
marked as a typical value research must quote. A script works every figure from its inputs, and a
second script checks each one by evaluating its printed working (70 figures, none wrong).

- **The job.** Commissioning a newly laid 66 kV inter-array cable, 2.40 km from turbine B01 to the
  offshore substation (OSS), the last cable of string B. Three-core, 3 × 240 mm² copper, XLPE, 38/66
  (72.5) kV, copper wire screens, armoured. One field joint 1620 m from the OSS. String A runs live in
  the same corridor. Cable at 12 °C. All practice values.
- **Why 66 kV.** It is where arrays are going (Prysmian's 66 kV brochure), it sits inside IEEE
  400.2's range (up to 69 kV), and it is above LIRA's 33 kV online limit in your notes, which lesson
  7 uses.
- **Typical values, to quote.** 0.22 µF/km and 2.6 A/km at 50 Hz per core, from ABB's XLPE
  Submarine Cable Systems brochure (66 kV three-core table, 240 mm² row). The two agree: 2π × 50 ×
  0.528 µF × 38 kV = 6.30 A against 2.6 × 2.40 = 6.24 A.
- **The readings,** test by test, and the one fault in L2:

  | Lesson | Test | L1 and L3 | L2 | Section A |
  |---|---|---|---|---|
  | 1 | Make safe | | | 1a C = 0.528 µF; 1b 762.43 J |
  | 2 | Core resistance, 12 °C | 0.00% from factory, both | 170.10 mΩ; 175.62 mΩ at 20 °C; +0.41% | 2a, 2b, 2c |
  | 3 | IR at 5 kV | PI 2.58 and 2.61 | 2.20 GΩ at 1 min; PI 1.09; DAR 1.05 | 3a, 3b, 3c (50 min) |
  | 4 | Sheath, 2.2 mm | hold 8.8 kV for 1 min | trips at 3.2 kV | 4a |
  | 5 | VLF, 2 U0, 0.1 Hz, 60 min | hold | breaks down at minute 12; then 35 Ω | 5a 76.0 kV; 5b 25.21 mA; 5c 12.61 A |
  | 6 | TDR from the OSS | | down peak at 11.43 µs | 6a 168.0 m/µs; 6b 960.1 m; 6c 1439.9 m |
  | 7 | LIRA, both ends | | spot at 961 m and 1441 m, DNORM negative, red | 7a 35.0 kHz; 7b 959 m |

- **The right figure carries forward.** A part missed in one lesson starts the next from the case's
  figure and says so, as in Design and verification.
- **Its own assumptions, said as such.** The temperature coefficient, the meaning of "charging
  time", the semi-conductive sheaths, the test order, the trapped-charge worst case, the velocity
  calibration, and one story choice: the client asks for the VLF test despite L2's sheath result, so
  the fault shows in four tests. The lesson says that on a real job you stop and report first (notes
  p.10).

---

## 6. Your starting point

- **You did this course a month ago**, so the lessons move fast through procedure and stop on the
  why and on reading results.
- **You hold BS 7671 inspection and testing** (initial verification, periodic, PAT) and the Level 4
  Design and Verification. IR testing, continuity, R1+R2 and the idea of comparing a reading with an
  expected value are yours already. The new ground is the HV scale: GΩ readings, minutes-long curves,
  charge that can kill, and lines kilometres long.
- **AC circuits** gives capacitance and reactance (lesson 5), impedance (lesson 6) and three-phase
  phase and line voltage (lesson 10). Cable capacitance, charging current and impedance are built on,
  never taught again: one line and a pointer each.
- **You work to HV safety rules.** Lesson 1 keeps safety short: the cause of the danger, the
  sequence as recall, and the discharge order.
- **Ships.** Subsea cables are not shipboard plant, so no naval example is forced in. IR testing of
  ship's machinery belongs to Maintenance and fault-finding.

---

## 7. The mistakes to catch

Each is caught by at least one DO screen with its own hint.

- **1:** proved dead taken as safe to touch; one end earthed only; forgetting the peak (½CU0²).
- **2:** P probes outside the C connections; the wrong loop formula; half a loop taken as a core;
  comparing a 12 °C reading with a 20 °C certificate (−2.74%, a false fail).
- **3:** trusting one IR reading that passes the client's figure; the ratio upside down; lifting the
  earth too soon.
- **4:** the 10 kV cap forgotten (12 kV for a 3.0 mm sheath); the metal layers not linked; the positive
  lead on the wrong electrode for the sheath type.
- **5:** the phase-to-phase voltage taken as U0; thinking the test set must supply 50 Hz current;
  dropping the frequency when it is not needed.
- **6:** no ÷ 2; a default velocity left set (914.4 m instead of 960.1 m); a high-resistance fault
  read as healthy cable; a joint read as a fault.
- **7:** reading one direction only; a positive DNORM taken as water; expecting a pass or fail from
  LIRA, which has no acceptance criteria (notes p.6).

---

## 8. What the research must source

The research stage (Sonnet, high, CLAUDE.md) quotes each item word for word before a lesson uses it.
A light check for this brief (six web searches, 20 Oct) found where most of it lives; its findings
are below the table.

### The ➕ claims and what each must be checked against

| ➕ claim (notes page) | Check against |
|---|---|
| Arrays 33 or 66 kV; export about 132-275 kV AC (p.1) | Makers' brochures (Prysmian 66 kV; NKT; ABB) |
| The seven layers (p.1) | A maker's three-core submarine cable data sheet; it should also show the armour and any lead sheath, which the notes' list leaves out |
| EAWR Regs 4, 12, 13, 14, 16 (p.1) | EAWR 1989 on legislation.gov.uk; HSE's Memorandum of guidance (HSR25) |
| About 1 mA felt, 10 mA can't let go, 50 mA+ fibrillation (p.1) | IEC 60479-1 (paywalled), through HSE or a secondary source |
| Induced charging, capacitive and inductive; worse with length (p.2) | HSE HSG85; a utility's or the ENA's safety guidance; physics of coupling |
| Four-wire measurement (p.2) | Megger, "A guide to low resistance testing"; DLRO10HD user guide |
| Copper about 0.4% per °C (p.3) | IEC 60228 Annex B, or a cable maker's correction table |
| The loop algebra (p.3) | Arithmetic only; checked here |
| IR's leakage current; PI and DAR cancel conditions; near 1 is bad (p.3-4) | Megger, "A Stitch in Time" and its ET-online articles |
| Sheath faults lead to water treeing years later (p.4) | IEC 60229's scope; a CIGRE or maker's source on water treeing |
| SWA and why LIRA can use it (p.5) | A maker's data sheet |
| Xc = 1 ÷ 2πfC and the 500× (p.6) | Arithmetic; AC circuits lesson 5 |
| DC avoided on XLPE for space charge (p.7) | IEEE 400.2's introduction; a VLF maker's note (HV Inc, Megger, BAUR) |
| Electrical and water treeing (p.7) | IEEE 400.2; CIGRE; a maker's note |
| U0 is phase to earth; 12/20 kV gives U0 12 kV (p.7) | IEC 60183 or the cable standard's definition |
| Reflection polarity; ÷ 2; 5% of 2 km is 100 m (p.8, p.7) | Megger TDR_AN58; Worzyk, Submarine Power Cables (Springer, 2009), chapter 8 |
| Part 9's other methods (p.8) | Megger or BAUR fault location guides; only if a screen uses them |
| The test sequence and its logic (p.9) | IEC 60840 or IEC 63026 tests after installation; CIGRE TB 490; a commissioning specification if public |

### Also to source, from your course's own items

- **VLF:** IEEE 400.2-2024 (paywalled) or its 2013 Table 3, for the 69 kV row, the U0 multiples and
  the durations; a VLF set's load rating (capacitance at 0.1 Hz) to show why long cables need a lower
  frequency.
- **Instruments:** the DLRO10HD's colour indications; the IR tester's terminal polarity and discharge
  guidance; Teleflex's 200 Ω and the 50 V pulse (Megger data sheets).
- **LIRA:** Wirescan's WP01 white paper (Manet, Huseby and Fantoni), Fantoni's Halden report
  HWR-788, Korde and Sonerud's paper on DNORM, CIGRE CSE N024; the resonance spacing v ÷ 2L.
- **Which standard covers String B.** IEC 60502-2 stops at 30 kV (Um 36 kV), so it fits a 33 kV
  array but not 66 kV. A 66 kV cable falls under IEC 63026 (submarine, up to Um 72.5 kV) or IEC 60840.
  Their after-installation tests are paywalled; previews give scope and clause titles only.

### What the light check found

1. **PI and DAR bands differ between sources.** Megger's "A Stitch in Time", Table I: PI less than 1
   dangerous, 1 to 2 questionable, 2 to 4 good, above 4 excellent; DAR 1.0 to 1.25 questionable, 1.4 to
   1.6 good, above 1.6 excellent, with a gap between 1.25 and 1.4. Its footnote says 1 to 2 "would be
   satisfactory for equipment with very low capacitance such as short runs of house wiring". A Megger
   Q&A (2019) says PI 2.0 or higher and DAR 1.4 or higher for good insulation. Your notes keep the PI
   thresholds with different names, and set DAR's bands at 1.25 and 1.6 with no gap. The lessons teach
   your notes' bands, say makers' tables differ, and say the client's criteria set pass or fail.
2. **The VLF voltage range is contested.** IEEE 400.2-2013 (as reproduced by HV Inc) bases its
   installation and acceptance levels on "the most used, worldwide practices of from 2 U0 to 3U0",
   with maintenance tests at about 75% of acceptance. Its 69 kV row is 75, 84 and 63 kV rms for
   installation, acceptance and maintenance. At U0 = 69 ÷ √3 = 39.8 kV those are 1.88, 2.11 and 1.58
   U0. So your notes' 1.5-2.5 U0 roughly spans maintenance to acceptance at this rating, but it is not
   the guide's own wording. Taught as contested; String B's 2 U0 sits inside both. The durations match
   your notes: 30 min for a simple withstand on aged cable, 60 min for installation or acceptance on
   new cable. The guide also warns that terminations may need adding to avoid flashover above 35 kV.
3. **The sheath test matches IEC 60229 exactly.** Clause 5: "a d.c. voltage of 4 kV per millimetre of
   specified thickness of extruded oversheath shall be applied with a maximum of 10 kV d.c. ... for a
   period of 1 min. All metallic layers under the oversheath shall be connected together." The
   factory routine test is 8 kV/mm, up to 25 kV, which explains why the site test is gentler.
4. **Cable data is public.** ABB's brochure gives 0.22 µF/km and 2.6 A/km for a 66 kV three-core 240
   mm² cable, with 9.0 mm of insulation. Its charging current implies U0 of about 38 kV, so String B
   uses 38/66 kV.
5. **TDR velocity is public.** Megger TDR_AN58: power XLPE, velocity factor 0.54 to 0.62, 162 to 186
   m/µs; "test a known length and adjust the VF". String B's 168.0 m/µs (0.56) sits inside.
6. **LIRA is described publicly**, but the service details are not. Wirescan's white paper describes
   DNORM as a severity indicator whose sign helps tell the type of change; Korde and Sonerud describe
   a 100 kHz to 100 MHz sweep and DNORM normalised to the terminal peak.

### What cannot be sourced publicly (as far as the light check shows)

- The academy's own procedures: the link-and-earth sequence for core resistance (notes p.3), the
  sheath and IR connection sequences. Your notes are the only record; they are taught as your
  course's method.
- The client's acceptance criteria, and the 18-test LIRA regime with its colour thresholds: project
  and service-company documents.
- IEEE 400.2-2024's own tables, IEC 63026 and IEC 60840's after-installation values, and IEC 60228's
  full text: paywalled. The 2013 table survives through makers' reproductions.
- The City & Guilds Assured programme's syllabus, if it is not published (to try: City & Guilds and
  the academy's course page).

---

## 9. Unclear or missing in your notes

- **Phase ID's earthing order.** "Cable must be earthed at both ends", then "Conductor and screen
  disconnected at both ends" (p.2). Presumably earths on while setting up, lifted under control to
  test. The lesson needs the order.
- **The worked example's labels.** The three results are labelled A, B and C again (p.3), the letters
  of the loops.
- **The core resistance sequence** (p.3) says "Clamp L2" and "probe L3" without saying which lead is
  C and which P.
- **"Divides 1 min into 10 mins"** (p.4). PI is the 10-minute reading over the 1-minute one; the
  lesson says it that way.
- **"5× the charging time"** (p.3). Time to charge, or the test's duration? The case takes the test's
  duration (assumption a.chargeTime).
- **Construction.** The layer list (p.1) has no armour or lead sheath, but the LIRA pairs (p.5) use
  SWA and lead sheath. A three-core subsea cable is usually armoured overall; whether its outer layer
  can be sheath tested, or only each core's own sheath, is for research.
- **"18 total tests"** (p.5). Core to screen and core to core on three cores is six pairs; both
  directions makes twelve. Eighteen needs nine pairs, perhaps with screen or armour pairs.
- **"VLF ... massively critical for safety"** (p.6). The meaning is unclear; the lesson does not
  use the phrase.
- **"Only works on low resistance faults, typically under 100 Ω"** (p.7) is instrument-specific
  (Teleflex 200 Ω); research should quote the instruments.

---

## 10. Decisions taken for you

Change any you like.

- **The title is yours: "HV Subsea Cable Testing".** Folder slug `subsea-cable-testing`.
- **Seven lessons, your notes' order, two changes:** Parts 1 and 2 joined; LIRA moved after TDR
  (section 2).
- **The refresher format from Design and verification, unchanged.** Steps lessons, about eleven
  screens; Section A in the C&G "Determine…" shape with every number changed (there are no public
  papers for the Assured programme); Section B marked by Claude against points; Keep this cards into
  your Book.
- **Safety stays short** and shares lesson 1 with the cable it protects you from.
- **➕ items are claims, not sources.** A lesson uses one only after research quotes it. Where your
  notes and a source disagree (PI and DAR names, the VLF range), both are taught, as contested, and the
  test spec on the job decides.
- **Your notes' numbers are taught as your course taught them,** with each limit footnoted once
  research has quoted it.
- **A 66 kV running job,** made up and said to be, with typical maker values only once quoted.
- **One fault through four tests,** so the course ends with it located. The story choice to run VLF
  after a failed sheath test is said on screen to be a story choice.
- **Part 9 is left out** (one screen in lesson 6), and its methods go to Maintenance and
  fault-finding.
- **No pilot.** You have been through the format. I suggest research first, then lessons 1 to 3 as
  one batch for you to try, then 4 to 7.

---

## 11. Size and cost

- **Seven lessons**, about eleven screens each.
- **Lessons:** Design and verification ran about 1.0M tokens a lesson through the workflow. Lessons 1
  to 4 are close to that; 5 to 7 carry live wave, trace and spectrum pictures, so about 1.1M to 1.2M.
  About 7.5M for the seven.
- **Research:** about 0.6M to 0.8M. Fewer pages of yours than Design and verification, but many more
  outside checks (the ➕ table), and several standards are paywalled, so finding public quotes takes
  searching.
- **App work:** none. Typed answers, written answers, the case file and summary cards were built for
  Design and verification.
- **Total:** about 8M to 8.5M tokens. Against the measured full process (about 1.65M a lesson,
  Fractions lessons 4 to 8), the same seven lessons would be about 11.5M plus research.
- Each batch's measured cost will be reported to you.

---

## 12. Open questions for you

1. **LIRA last** instead of sixth: all right?
2. **The VLF range:** teach your notes' 1.5-2.5 U0 beside IEEE's wording, as contested (proposed)?
3. **The fault story:** one fault through four tests, said to be a story choice: all right?
4. **Anything from the course you remember** that the notes miss? Photos of the academy's procedure
   sheets, the client test specification you practised to, or the instrument models would make the
   lessons more yours.
5. **Part 9:** leave it to Maintenance and fault-finding (proposed), or an eighth lesson here?

---

## 13. Left out

- **Taught elsewhere or not in your course:** partial discharge and tan delta; surge, thump and
  acoustic pinpointing; Murray loop; A-frame sheath fault pinpointing (all ➕ Part 9 or beyond your
  notes; they suit Maintenance and fault-finding).
- **Mentioned in one line:** the PPE and rescue hook (p.1); the HV safety rules' four areas (p.2); IP67
  and the laptop control of the LIRA kit (p.5).
- **Not taught again:** HV safety rules, permits and the confirm sequence beyond recall; Ohm's law;
  capacitance and reactance (AC circuits).
