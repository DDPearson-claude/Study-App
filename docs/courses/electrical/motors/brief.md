# Motors: the course brief

Written 20 Oct 2026 for Dan, answering the course brief in `tools/course/RUNBOOK.md` section 0. A plan
only: nothing is researched in full, written or built. I took the decisions for you and listed them
in section 9. Change any you like.

**What you asked for (20 Oct):** "Here are some motor documents. We need to have a Motors course
which just gives me what I need to know on each motor." So this is a short, practical reference
course: one lesson per machine, about eight screens each, ending on a Keep this card you would use
at work. It is lighter than the Design and verification refresher
(`docs/courses/electrical/design-and-verification/format/refresher.md`): no running case, no
Section A or B, no typed calculations, no written answers.

**How the lessons read.** In your own-words style (Dan, 20 Oct): the sources are for getting it
right, not for showing. No lesson says where something comes from. Footnotes only on a figure you
would look up on a job, such as a starting current multiple.

---

## The short version

**Eight lessons in three units, grouped by the supply the machine runs on** (section 2 says why
this order differs slightly from the one you suggested):

| # | Unit | Lesson | The one interactive picture |
|---|---|---|---|
| 1 | Three-phase | The three-phase induction motor | The rotating field and the rotor chasing it: load it and watch slip, rotor current and torque grow |
| 2 | Three-phase | The DOL starter | Your own DOL sheet, live: isolator, start, stop, overload trip, supply loss, watching coil, latch and contacts |
| 3 | Three-phase | The variable speed drive | V/f: drag the frequency, the volts follow, the field speed changes and the flux stays level up to base speed |
| 4 | Single-phase | The split-phase motor | Two winding currents about 30° apart, the field they make, and the centrifugal switch dropping out |
| 5 | Single-phase | The capacitor-start motor | The same picture with a capacitor: drag it and the angle opens towards 90°, the starting torque bar climbs |
| 6 | DC | The DC series motor | Speed and torque against load: torque rises with current squared, speed climbs into the red as load falls |
| 7 | DC | The DC shunt motor | Back-emf at work: load it, speed dips, back-emf falls, current rises; weaken the field and it speeds up |
| 8 | DC | The DC compound motor | Series, shunt and compound torque-speed curves side by side, with a slider between them and a "differential" switch |

**Every lesson has the same light shape,** about eight screens: (a recall question only in lessons
1, 3, 5 and 7); how it works in a few plain sentences; the picture; a check on the cause;
characteristics (speed, starting torque, speed regulation); where it is used and its limits; faults
and tests; a fault-finding check; Keep this.

**What your sheets give and lack.** One sheet is truly yours: the DOL study sheet (numbered drawing,
component list, your answers, uses and limits). I have saved it as `source/dol-study-sheet.jpg`. The
eight PDFs are a different kind of document: tidy summaries in a web-article style, each with a
diagram taken from a website (GeeksforGeeks, Electrical4U, Elprocus marks are on them). They give
the how-it-works and the uses well. They give almost no numbers, no torque-speed curves, no faults
or tests, no formulas, and a few small slips (section 7). So research carries more of this course
than usual. Section 6 lists it.

**Cost:** about 6.3M tokens for research and eight lessons (section 8), roughly 0.7M a lesson,
against about 1.0M a lesson for Design and verification at eleven screens.

---

## 1. The overall topic

The motors a marine electrical technician meets and what each one is for: how it works, how it
behaves under load and at start, where it is used, what limits it, and how it fails and is tested.
Two pieces of control gear are in it because the motors make no sense without them: the DOL starter
and the variable speed drive. Star-delta starting is one screen inside the DOL lesson.

**Edges.** In: three-phase cage induction motors (wound rotor in one line), split-phase and
capacitor-start single-phase motors, DC series, shunt and compound motors, the DOL starter, the VSD.
Out: generators and alternators (Three-phase power systems at sea), synchronous and permanent-magnet
motors, soft starters (one line at most), motor design, cable sizing for motors (Design and
verification), and teaching inspection and testing itself (your Level 3 awards cover it; the lessons
name the test and say what a bad result means).

**Starting point.** You have done AC circuits, so nothing there is re-taught:

| Idea | AC circuits lesson | Used here |
|---|---|---|
| Three-phase currents 120° apart; star and delta; √3 | 10 | Lesson 1 builds the rotating field from it; lesson 2's star-delta screen |
| A coil's current lags | 4 | Lessons 4 and 5: why the main winding's current lags more |
| A capacitor's current leads | 5 | Lesson 5's recall and its whole picture |
| The impedance triangle and its angle | 6 | Lesson 4: a high-resistance winding has a smaller angle |
| Power factor; kVA versus kW | 8 | Lesson 1: why a lightly loaded induction motor has a poor power factor |
| Power factor correction; motors as the usual inductive load | 9 | Lesson 1, one line |
| The turning coil makes an emf | 1 | Lesson 6: a turning armature is a generator too, so it makes a back-emf |

And from your trade: contactors, isolators, overloads, insulation resistance, continuity and
polarity tests, Ib for a motor (Design and verification lesson 1 worked the showroom's 11 kW
star-delta motor at 23.08 A). Each is used by name, never taught.

**Your aim.** Royal Navy electrical engineering: leading rate qualifications, then a Level 3 marine
engineering qualification. Section 4 lists the marine links I could source. When you have the
syllabi, send them and I will map each lesson to them; until then each lesson's `specRefs` says
"no syllabus yet".

---

## 2. The lessons, in the order they build

**The order.** You suggested three-phase, split-phase, capacitor-start, DOL, VSD, then the DC
three. I propose one change: put DOL and VSD straight after the three-phase motor, so the course goes
by supply: three-phase (the motor, its starter, its drive), then single-phase, then DC. Why:
- Lesson 1 ends on the two weaknesses your sheet names, high starting current and hard speed
  control. The DOL starter lives with the first and the VSD solves the second, so they answer
  lesson 1 while it is fresh. The VSD needs lesson 1's field speed formula directly.
- These three are the ones you will meet most at sea, so the most useful comes first.
- Split-phase and capacitor-start still reuse lesson 1's rotating field. They ask "what if there is
  only one phase?", which reads well after the three-phase unit closes.
- The DC unit stays last and in your order. Series, then shunt, then compound builds one idea at a
  time: compound is the other two combined.

If you prefer your order, it costs nothing before the build: only the `builds_on` lines change.

**Each lesson's screens.** About eight. The recall question appears only where an earlier idea is the
foundation. A right answer says "Still there" and carries on; there is no "skip" because there is no
practice section to skip to.

| Step | Screen | Kind |
|---|---|---|
| 0 | Do you still have it? (lessons 1, 3, 5, 7) | DO, choice, wrong options are named slips |
| 1 | How it works: three to five plain sentences and a still drawing | SHOW |
| 2 | The picture: play with the cause | SHOW, interactive |
| 3 | Check on the cause: predict what the picture will do | DO |
| 4 | Characteristics: speed, starting torque, speed regulation | SHOW |
| 5 | Where it is used, and its limits; at sea, where sourced | SHOW |
| 6 | Faults and tests: what goes wrong, how it shows, what you test | SHOW |
| 7 | Fault-finding check: a symptom, pick the cause | DO |
| 8 | Keep this | the summary card |

### Unit 1: Three-phase

**1. The three-phase induction motor**
- Recall (AC circuits lesson 10): three currents 120° apart in three coils: what does their combined
  field do? Turns at a steady speed / stays still and pulses / turns at the rotor's speed.
- How it works (sheet p.1): three windings 120 electrical degrees apart make one field that turns at
  synchronous speed; it cuts the shorted rotor bars, induces current; that current's field pulls the
  rotor round; the rotor must lag, because at the field's speed nothing is cut and there is no torque.
- Picture: the stator field as an arrow turning at ns; the rotor following. Controls: load, and
  supply 50/60 Hz and poles 2/4. Slip, rotor current and torque grow with load. At zero slip the
  rotor current and torque are zero. Numbers: ns = 120f ÷ p (to source); your sheet's 5.5 kW
  2950 rpm motor only fits two poles at 50 Hz, ns 3000 rpm, slip (3000 − 2950) ÷ 3000 = 1.67%
  (computed). ABB's 0.75 kW four-pole data sheet, 1437 rpm: slip 4.2% (computed). At 60 Hz the same
  poles give 3600 and 1800 rpm (computed).
- Check: "The load comes off. What happens to the speed?" It rises towards ns but never reaches it.
  Slips: "it reaches ns" (no cut, no torque), "it stays the same".
- Characteristics: nearly constant speed, a few percent slip; starting current about 6 to 8 times
  full load (ABB), starting torque about 1.5 to 2.5 times rated (ABB handbook; the data sheet's
  small motor shows 3.5): read the data sheet. Power factor poor at light load: the ABB motor's 0.70
  at full load, 0.49 at half load (AC circuits lesson 8). Cage versus wound rotor in one line (sheet
  p.2).
- Used for (sheet p.3-4): pumps, fans, compressors, conveyors. At sea: pumps, fans and compressors,
  totally enclosed, up to 700 kW or more (Boldea); the Type 45 destroyer's propulsion motor is an
  induction motor (DTIC thesis). Limits (sheet p.3): starting current, speed control, light-load
  power factor.
- Faults and tests: single phasing (runs hot, will not start from rest; Bussmann puts single-phasing
  at 14% of failures, overloads 30%, bearings 13%); reversed rotation (swap any two lines, to
  source); insulation resistance and winding resistance balance by name.
- Fault check: "A pump motor hums and will not start; it was running fine an hour ago." Single
  phasing (a blown fuse or a burnt contact on one line) / wrong rotation / low power factor.
- Keep this: rule `ns = 120 f ÷ p`, `slip = (ns − n) ÷ ns`; traps: "no slip, no torque", "reverse by
  swapping two lines", "single phasing: will not start, runs hot"; where: pumps, fans, compressors;
  most of a ship's motors.

**2. The DOL starter** (from your own sheet)
- How it works (your sheet; PDF p.1): isolator closed; Start (N/O) makes the coil circuit; the coil
  pulls in the contactor, main contacts and auxiliary together; the auxiliary contact across Start
  keeps the coil fed when Start is released; Stop (N/C) or the overload's release contact breaks the
  coil circuit and everything drops out.
- Picture: your sheet redrawn with your numbers 1 to 10, as a live circuit. Controls: isolator, Start
  (press and release), Stop, load (heat the bimetal until it trips), supply off and back on. The
  energised path lights in ink, the coil glows when fed, contacts move; a current meter shows the
  start surge of 6 to 8 times full load falling as the motor runs up. Fault switches: latch contact
  worn, overload tripped.
- Check: "Power fails for a second and comes back. Does the motor restart?" No: the coil dropped
  out, the latch opened, and only Start makes it again. This is no-volt protection (the contactor
  "is responsible for the switching function and low voltage protection", Siemens; to quote).
- Characteristics: full voltage at once, so full starting current (6 to 8 times, can be over 10:
  ABB) and full starting torque (about 1.5 to 2.5 times rated: ABB, not "100%").
- Used for and limits: your list (compressors, pumps, fans, small machinery). The size limit is the
  supply's, not the starter's: "some utilities restrict DOL starting for motors rated at 5.5 kW",
  while independent supplies start "250 kW … or more" DOL (ABB solution guide). Your 5 kW and the
  PDF's 4 kW are both rules of thumb. At sea the generators are the supply (my reasoning; to source).
  **Star-delta, one screen:** the windings start in star at 400 ÷ √3 = 231 V (computed, AC circuits
  lesson 10), so the line current is about a third and the torque a quarter to a third (ABB: about
  30% and about 25%). The showroom motor: DOL would draw 6 to 8 × 23.08 A = 138 to 185 A, star-delta
  about 46 to 62 A (computed). The motor must be built to run in delta (ABB).
- Faults and tests: motor stops when Start is released (latch contact); overload trips after frequent
  starts (your sheet); coil voltage must match its supply: your coil is 230 V, phase to neutral; the
  PDF's coil sits across two lines (Siemens: check the coil voltage "corresponds to actual supply
  voltage"); worn main contacts cause single phasing (Bussmann); the overload does not clear a
  short circuit: the fuses or breaker do (PDF p.2; to quote).
- Fault check: "You press Start, the motor runs, you let go and it stops." Latch contact (7) /
  overload (9, 10) / stop button (8).
- Keep this: Start N/O, Stop N/C, latch across Start, overload release in series with the coil;
  traps: "the coil pulls the contacts in; the latch only keeps the coil fed", "no-volt: no restart by
  itself", "overload is not short-circuit protection", "coil voltage must match"; where: small pumps,
  fans, compressors; the supply sets the size.

**3. The variable speed drive**
- Recall (lesson 1): a four-pole motor on 50 Hz: field speed? 1500 / 3000 / 750 rpm.
- How it works (sheet p.1): rectifier to DC, the DC bus smooths it, the inverter's IGBTs switch it
  back to AC by PWM at the frequency and voltage asked for. Lower the frequency and the field turns
  slower, so the motor does.
- Picture: frequency slider 0 to 60 Hz on a 400 V, 50 Hz motor. The voltage follows 8 V per Hz
  (400 ÷ 50, computed) up to 50 Hz, then stays at 400 V. The field speed follows 120f ÷ p. A flux
  bar stays level to 50 Hz and falls above it (Hughes: constant V/f to base speed, then "the flux
  reduces inversely with frequency"). A fan-load switch shows power by the cube law: 75% speed needs
  about 42% power, 50% about 12.5% (ABB Review).
- Check: "At 25 Hz, what voltage does the drive give this motor?" 200 V (computed) / 400 V / 100 V.
- Characteristics: speed set by frequency; full torque from low speed with soft start, no inrush
  (sheet p.2); above base speed, less torque ("constant power" region, Hughes).
- Used for (sheet p.2): pumps and fans for energy, process control, marine propulsion. At sea:
  cranes, winches, bow thrusters, ventilation, pumps, compressors (Invertek marine page, a maker).
  Limits: cost, complexity (ABB solution guide's table); harmonics and bearing currents (ABB
  technical guides 5 and 6, to quote).
- Faults and tests: to research (the sheet has none): overcurrent, DC bus overvoltage when stopping
  a big load quickly, earth fault, overheating. Never insulation test through a drive (to source).
- Fault check (once research quotes the trip list): "The drive trips every time a big fan is
  stopped quickly." The motor is pushing energy back and the DC bus voltage rises / the fan is
  overloaded / the supply is single phasing.
- Keep this: `ns = 120 f ÷ p`, `V/f constant to base speed`, `fan power ∝ speed³`; traps: "above
  base speed the volts stop rising, so torque falls", "savings are real only on variable-torque
  loads like fans and pumps" (ABB: treat as "theoretical"), and the researched fault list.

### Unit 2: Single-phase

**4. The split-phase motor**
- How it works (sheet p.1): one phase alone gives a field that pulses, not one that turns, so it
  cannot start. A second winding at 90° with thin wire (more resistance, less inductance) carries a
  current that lags less, so the two currents are out of step (about 30°: Kuphaldt) and the field
  turns. At about 75% speed (sheet; 80% MSU) the centrifugal switch drops the start winding out.
- Picture: the two winding currents as waves (and phasors), the field's tip tracing an ellipse while
  both are in, a line once the switch opens. Speed rises; the switch opens at 75%; the torque steps
  down as it does (MSU). Example winding values, labelled as such, give the angle from AC circuits
  lesson 6's triangle. Fault switches: switch stuck open, switch stuck closed.
- Check: "Why does the start winding have thin wire?" More resistance, so its current lags less and
  the two currents are out of step / to save copper / to run cooler.
- Characteristics: low starting torque (sheet p.1); constant speed once running like lesson 1.
- Used for (sheet p.2): fans and easy-starting loads, up to about a third of a horsepower, 250 W
  (Kuphaldt). Limits: low starting torque; the start winding is not rated for continuous use, so
  frequent starts overheat it (MSU).
- Faults and tests: switch stuck open: hums, will not start, but runs if spun (to quote); switch stuck
  closed or frequent starting: start winding burns out (MSU); reverse by swapping the start winding's
  leads (MSU).
- Fault check: "A bench grinder hums and will not start; a flick of the wheel and it runs." The start
  circuit is open (switch or winding) / the main winding is open / the supply is low.
- Keep this: "two windings 90° apart, currents about 30° apart"; traps: "start winding is short-time
  rated", "hums but runs if spun: start circuit"; where: small fans and easy loads.

**5. The capacitor-start motor**
- Recall (AC circuits lesson 5): a capacitor's current, relative to its voltage: leads / lags / in
  step.
- How it works (sheet p.1): a capacitor in series with the start winding makes that current lead,
  so the angle between the two currents opens towards 90° (USNRC; about 80°, IDC). Starting torque
  goes with the sine of that angle (Utah notes), so it roughly doubles over split-phase: sin 30° = 0.50,
  sin 80° = 0.98 (computed; "nearly twice", IDC). The switch still drops it out at 75 to 80% (sheet).
- Picture: lesson 4's picture with a capacitor slider. Drag it and the angle and the starting torque
  bar move, best at one value and falling beyond it (computed from labelled example values;
  Utah: 90° is only possible at one speed).
- Check: "Why is it switched out once running?" It is a short-time-rated starting capacitor and
  winding / it would stop the motor / it wastes power factor.
- Characteristics: high starting torque, lower starting current than split-phase (USNRC); runs like
  split-phase once the switch opens.
- Used for (sheet table): compressors, pumps, conveyors; capacitor-start capacitor-run for frequent
  starts and better running efficiency (sheet table), one screen with the permanent split capacitor
  type in one line (MSU). Available in multi-kilowatt sizes (Kuphaldt).
- Faults and tests: failed start capacitor: will not self-start (DigiKey, a secondary source, to
  confirm); capacitor checked against its marked value (to source); switch faults as lesson 4.
- Fault check: "A compressor motor trips its overload trying to start, and the start capacitor is
  bulging." The capacitor / the main winding / the overload setting.
- Keep this: "capacitor in the start winding: angle towards 90°, starting torque up"; traps: "it is
  not momentum that keeps it running", "a failed capacitor stops it starting, not running"; where:
  compressors and pumps.

### Unit 3: DC

**6. The DC series motor**
- How it works (sheet p.1): field and armature in series, one current through both. A turning
  armature is a generator too (AC circuits lesson 1), so it makes a back-emf that opposes the supply
  (OpenStax). At standstill there is none, so the current is large: OpenStax's 120 V motor draws
  10.0 A at start (12 Ω) and 1.67 A at 100 V back-emf (computed). More current means more field and
  more armature current, so torque goes with current squared, below saturation (Rose-Hulman).
- Picture: per-unit speed and torque against load current from the shown rule (torque ∝ I², speed
  ∝ 1 ÷ I, unsaturated, resistance ignored, said on screen). Drag the load down: at half current the
  torque is a quarter and the speed doubles; at a quarter current the speed is four times and red
  (computed).
- Check: "The coupling shears and the load comes off. What happens?" The speed rises dangerously:
  runaway / it stops / it holds speed.
- Characteristics: very high starting torque, poor speed regulation (sheet p.1).
- Used for (sheet p.1): cranes, hoists, traction. Only with the load "permanently coupled" (IDC),
  so no belt drives; overspeed protection (Rose-Hulman). No marine claim: none sourced.
- Faults and tests: runaway on loss of load; brushes and commutator wear (as shunt sheet p.2);
  starting current limited by a starter (Rose-Hulman).
- Fault check: "A belt-driven fan on a series motor races when the belt snaps." Little load, so
  little current, so a weak field: the speed rises / the field winding opened / the supply rose.
- Keep this: `E = V − I R`, `torque ∝ I²` (below saturation); traps: "never run it unloaded or on a
  belt", "at standstill there is no back-emf"; where: hoists and traction.

**7. The DC shunt motor**
- Recall (lesson 6): at standstill, what limits a DC motor's current? Only its resistance: there is
  no back-emf yet / the field / the brushes.
- How it works (sheet p.1): the field across the supply, so its current and flux are steady. Load it:
  the speed dips, the back-emf falls, more armature current flows and the torque rises to match, at a
  slightly lower speed. It does not speed back up (sheet p.1 says it does; section 7).
- Picture: armature with the supply split into back-emf and the I R drop as two bars. Load slider:
  speed dips a little, back-emf bar shrinks, current rises. Field rheostat: less field, more speed
  (sheet p.2). Fault switch: field open: speed runs into the red (sheet p.3; Rose-Hulman).
- Check: "You add resistance in the field circuit. The speed…" rises / falls / stays.
- Characteristics: near-constant speed, lower starting torque than series (sheet p.2). The sheet's
  "10–20%" speed change and IDC's "7 to 10%" disagree: taught as "a few percent to about a tenth",
  marked contested until research settles it.
- Used for (sheet p.3): machine tools, conveyors, printing presses. Speed control: field above base
  speed, armature below (sheet p.2). DC drives gave way to AC drives partly for maintenance (ABB
  technical guide 1), a link back to lesson 3.
- Faults and tests: field open: runaway, so loss-of-field protection (Rose-Hulman); start with the
  field rheostat at full field (IDC); the faceplate starter's no-volt coil, like the DOL's latch
  (IDC); brushes and commutator (sheet p.2).
- Keep this: `E = V − Ia Ra`, `speed ∝ E ÷ flux`, `torque ∝ flux × Ia`; traps: "less field, more
  speed", "lose the field and it runs away", "start at full field".

**8. The DC compound motor**
- How it works (sheet p.1): both windings. Cumulative: the fields add, giving the series motor's
  starting torque and a speed that falls with load but stays safe unloaded (to quote). Differential:
  they oppose, and it is unstable (sheet). Long or short shunt in one line: your sheet's drawing is
  long shunt (shunt across the supply).
- Picture: per-unit torque-speed curves of series, shunt and cumulative compound side by side, from
  `flux = shunt part ± series part × I` and lesson 7's rules. A slider moves the series share; a
  "differential" switch flips the series field and the speed rises with load, in red.
- Check: "After a repair the motor's speed rises as load goes on." The series field is connected the
  wrong way round (differential) / the shunt field is open / the brushes are worn.
- Characteristics: high starting torque, speed regulation between series and shunt (sheet p.1).
- Used for (sheet p.1-2): presses, shears, crushers, reciprocating compressors.
- Faults and tests: series field reversed; as lessons 6 and 7.
- Keep this: one table comparing all three DC motors (starting torque, regulation, no-load
  behaviour, use); traps: "differential is unstable", "check the series field's polarity after
  repair".

**Quick checks in every lesson.** Two or three choice questions (step 0 where present, steps 3 and
7), each wrong option a named slip with its own one-line hint. No typed numbers, no timers, no marks.

---

## 3. Can it be taught mostly visually, through interaction?

**Partly.** Each machine has one cause that a picture shows better than words (the turning field,
the latch, V/f, the phase angle, back-emf, the curves). Around it there is reference text:
characteristics, uses, faults. So these are **steps lessons** (`format: 'steps'`, read mode) whose
SHOW screens carry up to a short paragraph, one interactive picture each, still drawings elsewhere.
Every step needs a `still` or `read` for the read-through and your Book (RUNBOOK section 0).

All drawings are redrawn in the app's style. The sheets' diagrams carry other sites' marks and are
not reused.

---

## 4. What else

- **Benchmark.** Not checked (I kept to five web searches). Brilliant has no motors course that I
  know of. The research stage should name one strong public course (an ETO or marine college unit)
  and note anything it adds.
- **At sea, sourced so far:** induction motors drive pumps, fans and compressors up to 700 kW or more,
  totally enclosed (Boldea and Nasar, The Induction Machine Handbook); the UK chose an induction motor
  for the Type 45 destroyer's propulsion (DTIC/NPS thesis ADA417341); VSDs on cranes, winches, bow
  thrusters, ventilation, pumps and compressors (Invertek, a maker); ships commonly use 60 Hz (AC
  circuits notes 6.1, a secondary source); single phasing as a known shipboard motor fault (Marine
  Insight, secondary). Star-delta at sea and DC motors at sea: not sourced; no screen claims them.
- **The mistakes to catch** (each one has a check): the rotor reaches synchronous speed; reversing
  needs a rewire; the latch holds the main contacts; a DOL restarts after a power cut; the overload
  protects against short circuits; DOL gives "100%" torque; savings at any load; a split-phase
  motor keeps running on momentum; the start winding can stay in; series motor on a belt; weakening
  a shunt field slows it; differential compound is just "weaker".
- **Pilot first.** Lesson 1 (with the research stage), you try it on your phone, then the rest.

---

## 5. What your sheets cover

| Sheet | Pages | Gives | Lacks |
|---|---|---|---|
| dol-study-sheet.jpg (yours) | 1 | Numbered drawing 1-10, component list, four answered questions, uses and limits | Short-circuit protection, no-volt protection, star-delta |
| 3-phase-induction-motor.pdf | 5 (p.5 blank) | How it works in four steps, cage and wound rotor, pros and cons, uses, a 5.5 kW 2950 rpm example, two diagrams | ns and slip formulas, torque-speed curve, starting figures, faults, reversing |
| dol-starter.pdf | 4 | Sequence, components, pros and cons, 6-8 times inrush, uses, diagram | Overload contact in its drawing, no-volt protection |
| variable-speed-drive.pdf | 3 | Rectifier, DC bus, inverter, PWM, benefits, uses including marine, diagram | V/f, field weakening, the cube law, faults |
| split-phase-induction-motor.pdf | 2 | Windings, phase shift cause, 75% switch, uses, diagram | The angle, torque figures, faults |
| capacitor-start-motor.pdf | 2 | Capacitor's role, 75-80% switch, CSIR versus CSCR table, diagram | Angle, faults, capacitor tests |
| dc-series-motor.pdf | 2 | Series connection, torque and current squared, runaway, uses, diagram | Back-emf, saturation, starting, faults |
| dc-shunt-motor.pdf | 4 | Constant flux, self-regulation, speed control by field and armature, pros and cons, uses, diagram | Back-emf formula, starters, loss-of-field protection |
| dc-compound-motor.pdf | 2 | Cumulative and differential, traits, uses, diagram | Long and short shunt, curves, faults |

Cited as "sheet p.N" by PDF page. Only the DOL sheet is in your format (diagram, numbered parts,
questions and your answers). **Do you have sheets like it for the other seven?** If so, send them:
they would replace the PDFs as the main source and the lessons would follow your numbering.

---

## 6. What research must add (public sources only)

Found in my five searches, to quote word for word at the research stage:
- ABB, Softstarter Handbook 1SFC132060M0201: DOL current "usually between 6-8 times the rated
  current, but it can be more than 10"; DOL torque "approx. 1.5 to 2.5 times rated torque";
  star-delta current "about 30 %" and torque "about 25 %"; the motor must be delta-connected to run.
- ABB, Solution Guide: Motor Starting Solutions 1SFC100125C0346: DOL size depends on the supply
  ("5.5 kW", "250 kW … or more").
- ABB data sheet M3AA 80ME 4 (0.75 kW, 1437 r/min, Is/IN 5.9, TS/TN 3.5, power factor 0.7 and 0.49).
- ABB Technical guide No. 4 (rotor follows the flux "with a certain slip"; pump and fan power and
  flow cubed), Technical guide No. 1 (scalar control: "Flux provided with constant V/f ratio"), ABB
  Review 4/2004 (cube law, 42% and 12.5%), ABB energy plan (savings "theoretical").
- Hughes and Drury, Electric Motors and Drives, ch. 7: constant V/f to base speed, then constant
  voltage and falling flux, "constant power" region.
- Boldea and Nasar, The Induction Machine Handbook, ch. 1 (marine use); DTIC ADA417341 (Type 45);
  Invertek marine page.
- MSU Tech Notes 313 and 314; Kuphaldt (Lessons in Electric Circuits II, ch. 13); USNRC Power Plant
  Engineering manual, ch. 8; Utah ECE 3600 notes; IDC capacitor-start note.
- Rose-Hulman lecture 25 (DC motors); IDC "Classes, speed control and starting of DC motors";
  PEG-3722 Electrotechnology part 7 (already a source in AC circuits); OpenStax College Physics 23.6.
- Siemens pocket guide to motor starters and DOL/ASD instructions; Cooper Bussmann (Eaton) motor
  protection pages; ABB contactor slides (AC-3, making about 6 times).

Still to find: ns = 120f ÷ p quoted; reversing a three-phase motor; why the drive lowers the
voltage at low frequency (too much flux otherwise); VSD trip list, bearing currents and harmonics
(ABB technical guides 5 and 6); not insulation testing through a drive; overload reset and its
role against short circuits; no-volt release quoted for a contactor; star-delta and DOL limits on a
ship's supply; hand-started single-phase motor; capacitor checks; universal motors (your grinders);
long and short shunt; a compound motor's safe no-load speed; shunt speed regulation from a maker;
hazardous-area motors (for the "explosion-proof" point). Run on Sonnet at high, quote-checked.

---

## 7. Errors and gaps in the sheets (said kindly)

Your DOL sheet is accurate and clear. Four small things:
1. **Item 7.** It says the latching contacts "pull and hold the main contacts in place". The coil
   does the pulling and holding, of the main contacts and the latch alike. The latch's job is to
   keep the coil fed once Start is released. Your answer to "What happens when 2 and 3 are operated"
   has it right.
2. **"A high in-rush of current can be tolerated, unlike a traditional switch."** True that a
   contactor is rated to make a motor's starting current (ABB: about 6 times in AC-3 duty). But the
   DOL does nothing to reduce it, which is its main limit. The lesson keeps both halves.
3. **"Up to 5 kW"** and the PDF's "under 4 kW" are both rules of thumb. What the supply can stand
   sets the real limit (ABB).
4. **Not on the sheet:** the fuses or breaker that clear a short circuit, and the no-volt protection
   the latch gives you for free.

The PDFs:
- **3-phase, p.3 "Explosion-proof".** Having no brushes removes one spark source. It does not make a
  motor fit for a hazardous area; that needs a motor certified for it (to source).
- **Capacitor-start, p.1 "the momentum from the startup keeping it going".** It is not momentum.
  Once turning, the main winding alone keeps making torque in that direction; "once started the
  auxiliary winding is optional" (Kuphaldt).
- **DOL, p.2 "100% of the motor's rated torque".** A DOL start gives the motor's full locked-rotor
  torque, about 1.5 to 2.5 times rated (ABB). Its drawing has no overload contact in the coil
  circuit, and its coil sits across two lines (400 V), unlike your 230 V coil.
- **DC series, p.1.** Torque goes with current squared only below saturation (Rose-Hulman). "Model
  trains" is doubtful and is left out. Grinders are usually universal motors (series motors on AC),
  to check.
- **DC shunt, p.1 "causing it to speed back up to compensate".** It settles a little slower, which is
  its speed regulation. Its "10–20%" sits above IDC's "7 to 10%", so it is taught as contested. The
  first paragraph stops mid-sentence. In its drawing the armature's "+" is on the side wired to the
  supply's negative. "Longer lifespan" has no source and is left out.
- **DC compound.** It does not say long or short shunt; its drawing is long shunt. Its "Vf" label is
  the supply voltage.
- **VSD, p.2 "as short as 6 to 12 months" payback.** No source; left out. The saving's real cause, the
  cube law, is not on the sheet and is added.

---

## 8. Size and cost

Eight lessons of about eight screens, one interactive each, no case file, no Section A or B.
Design and verification lessons cost about 1.0M each at eleven screens.

| Item | Estimate |
|---|---|
| Research, once (more than usual: the sheets are thin) | about 0.6M |
| Lessons 1 and 2 (animated field; a live circuit with many states) | about 0.9M each, 1.8M |
| Lessons 3 to 8 | about 0.65M each, 3.9M |
| **Total** | **about 6.3M** (0.7M a lesson with research) |
| Against the measured full process (1.65M a lesson, Fractions 4-8) | 13.2M for eight; this is about half |

The pilot: research and lesson 1, about 1.5M. Stages and models as in `CLAUDE.md` (research on
Sonnet at high, build on Opus at xhigh, at most three attempts per interactive). No new app work is
expected: the Keep this card is the refresher's `lesson.summary`, drawn with no case file (the
pilot must confirm `K.summary()` draws cleanly with no figures).

---

## 9. Decisions taken for you

1. **Order by supply:** three-phase motor, DOL, VSD; then split-phase, capacitor-start; then series,
   shunt, compound (section 2).
2. **Light format:** steps lessons of about eight screens, one interactive picture each.
3. **Recall opener only in lessons 1, 3, 5 and 7**, where an earlier idea carries the lesson; no
   "Skip to the practice".
4. **Section A and B dropped,** with the case file, typed answers and written answers: you want a
   reference, not exam practice. Two or three choice checks a lesson, one always a fault to find.
5. **Keep this** uses the existing summary card: what it is, the rule lines, the traps (faults,
   tests, limits, each cited behind the scenes), where it is used.
6. **Star-delta is one screen in the DOL lesson,** using the showroom motor's 23.08 A. Soft
   starters are left out. Wound rotor is one line. Capacitor-start capacitor-run and permanent split
   capacitor share one screen in lesson 5.
7. **Your DOL sheet is the lesson 2 picture,** with your numbers 1 to 10 kept.
8. **DC curves are per-unit** (shapes from the shown rules, no invented motor ratings); single-phase
   angles use labelled example winding values.
9. **Marine lines only where sourced** (section 4). None for DC motors or star-delta yet.
10. **Lesson 1 is the pilot.**

## 10. Questions for you

1. Do you have your own sheets, like the DOL one, for the other seven machines?
2. Is the order by supply all right, or do you want the single-phase pair before DOL?
3. Would you like one "say it back" written answer per lesson, marked by Claude? It adds a screen.
4. Your leading rate and Level 3 marine engineering syllabi, when you have them.
5. Examples at 50 Hz (your sheet's motor) with a 60 Hz line for ships: all right?
