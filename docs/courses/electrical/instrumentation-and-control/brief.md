# Instrumentation and control: the course brief

Written 3 Nov 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
the third course in the Electrical shelf's Power and machines at sea folder: "How a plant measures
itself and keeps itself in line: sensors and the 4-20 mA loop, control loops and PID, PLC logic,
alarms and fail-safe trips." Motors and Generators come before it (built) and Subsea cable testing
after it (built). Two planned courses on the same shelf take ground next to this one: Fault-finding:
from symptom to cause, and Maintenance and condition monitoring. Section 4 says what each takes. You
chose this course on 3 Nov and approved the build, so I have taken the decisions for you and listed
them below. Change any you like. Sources and quotes are in `research-notes.md` beside this file (191
quotes, cut by script from the 46 saved tool results and checked with `tools/eval/sources.mjs`,
`failed: 0`). Section numbers below point there.

You asked (3 Nov) for the whole path, not only January. So the course is planned against your whole
route: the Level 3 marine engineering qualification, the leading rate engineering qualifications and
electrical work at sea. Every plant system you will meet on that route is measured, controlled,
alarmed and tripped by what this course teaches. It never teaches submarine or nuclear propulsion,
and it never touches reactor instrumentation or protection.

## The short version
**Eight lessons**
1. The measurement chain: from the plant to a number (built first)
2. Temperature: the PT100 and the thermocouple
3. Pressure, level and flow
4. The 4-20 mA loop
5. Control loops: measure, compare, act
6. PID: tuning a loop by feel
7. Logic and PLCs: from relays to ladder
8. Alarms, trips and fail-safe design

**The main pictures** (one per lesson, each moved with your finger, each showing the cause):
- **The calibration bench (lesson 1).** A transmitter's line: pressure in along the bottom, mA out up
  the side, the ideal line dashed behind it. Drag the zero screw and the whole line slides up or
  down. Drag the span screw and it tilts. A five-point check at 0, 25, 50, 75 and 100% lists each
  error in per cent of span. A noise slider scatters repeat readings and a display-step switch rounds
  them, so the three kinds of trouble look different.
- **The long cable (lesson 2).** A cooling water pipe with a probe in it, a cable run you drag longer,
  and the meter at the far end. A switch picks 2, 3 or 4 wires. Two-wire, the reading climbs as the
  cable grows. Three-wire, it holds until you mismatch the leads. Four-wire, it never moves. A second
  switch swaps in a thermocouple: drag the terminal box warmer, turn cold-junction compensation on
  and off, and swap the extension cable for copper.
- **The tank and its outlet (lesson 3).** A tank with a pressure transmitter at its foot and an
  orifice plate in its outlet with a differential pressure cell across it. Drag the level, pick the
  liquid, and close the lid and pressurise the gas above. Open the outlet valve and the flow bar and
  the DP bar move together, the DP growing as the square. A switch reads the flow with and without
  the square root taken.
- **The live loop (lesson 4).** A 24 V supply, a two-wire transmitter, a cable and a 250 Ω input in
  one series ring. Drag the process value. The current moves from 4 to 20 mA, the voltage across the
  250 Ω from 1 to 5 V, and the display follows. Cut the wire: the current drops to 0 and the display
  says broken wire, in red. Drag the cable longer: the headroom bar shrinks and the top of the range
  clips. Place the meter in series or across the resistor, and see what the wrong jack does.
- **The thermostat trace (lesson 5).** A hot water tank with a heater, a thermostat with a set-point
  dial and a differential slider, and a temperature trace with the heater's on and off strip under
  it. Turn the dial up and watch whether it heats faster. Move the sensor further from the heater and
  the dead time grows, so it overshoots past both switch points. A switch takes the sensor away and
  runs the heater open loop.
- **The loop to tune (lesson 6).** An engine's jacket water loop: the engine's heat in, a three-way
  valve sending water to the cooler, a temperature sensor, and the controller. Three sliders, P, I
  and D. Tap a load step or a set-point step and the trace shows the temperature, the set point and
  the valve. P alone settles off the set point. Add I and the gap closes; too much and it swings.
  Add D and the swings die, until a noise slider makes the valve chatter.
- **The compressor's ladder (lesson 7).** The panel on the left (Start, Stop, the pressure switch and
  the overload contact), the ladder in the middle, the motor and the air receiver on the right. A
  scan cursor sweeps the rungs top to bottom while the input and output tables fill. Press Start and
  the seal-in contact lights. Cut a wire to the Stop button and see what stops. Slow the scan and
  give Start a press shorter than one scan.
- **The trip bench (lesson 8).** A diesel generator's lube oil pressure with an alarm line and a
  trip line on its trend. A picker gives one, two or three sensors and the vote: 1oo1, 1oo2, 2oo2,
  2oo3. Fail any sensor safe, fail it stuck, or make it noisy. A switch makes the trip circuit
  energise-to-trip or de-energise-to-trip, and a fuse you can blow. A bypass key greys out the trip,
  and a "run a year" button counts missed and false trips for each vote.

### Decisions taken for you (say if you want any changed)
- **Eight lessons, in the order you gave.** Every benchmark puts measurement first, then the loop,
  with PID last of the control lessons. SQA says "We suggest you deliver outcome 7 last, as it builds
  on knowledge from earlier outcomes" (notes 1.4). Pearson's Unit 16 runs instruments, signals,
  process control, then tuning (notes 1.3), and Edinburgh and MIT go the same way (notes 2.1).
  Logic and PLCs come after the loop, because every route keeps PLCs as a separate unit (notes 1.2,
  1.3, 1.5). Alarms and trips come last, because they lean on all of it. Lesson 3 is the densest. If
  you want nine lessons, it splits into "pressure and level" and "flow" (the notes' own suggestion,
  notes 8). If you want seven, lessons 7 and 8 merge, and the voting arithmetic goes (notes 8).
- **The scope is your whole path, not one course.** Planned against STCW Table A-III/1's lines on
  "Proportional-Integral-Derivative (PID) control characteristics", "sequential control circuits"
  and "Function and performance tests of ... monitoring systems ... automatic control devices ...
  protective devices" (notes 3.1); the Level 2 maritime standard for the Royal Navy and Merchant
  Navy, which names "programmable logic controllers" among the auxiliary systems (notes 3.2); and the
  Level 3 control and instrumentation technician's "calibration" and "fault diagnosis" (notes 3.2).
  The public lines agree on one core: sensors and signals, the loop, PID, logic and sequence, alarms
  and protective devices (notes 3.3). That core is the course. The weighting is my judgement and is
  said so (notes 3.3).
- **Lesson 1 is built first, then the rest without a pause.** You approved the build, so the others
  follow without waiting. Try lesson 1 on your phone as soon as it lands; if something is wrong, the
  rest will be changed before they are built.
- **Steps lessons, taught visually ("Yes", RUNBOOK section 0, item 3).** About 12 screens each, SHOW
  then DO, ending on two or three mixed puzzles. SHOW screens carry one to three plain sentences and a
  picture. Where an idea needs more words (why a loop uses current, why a trip circuit is kept
  energised), it becomes two screens, never a longer one. Every lesson carries `format: 'steps'` and
  a `still` or `read` on every step.
- **Every lesson has the same shape: feel it, then the rule, then work it on paper.** It opens with a
  puzzle on its main picture that you can feel your way through before any rule is given (predict,
  then play). Then the rule, shown and then named. Then typed-answer puzzles you work on paper:
  scaling a reading, a lead error, a level from a pressure, a flow from a DP, an offset, a vote. A
  one-tap "still there" recall comes only where an earlier course carries the rule, just before the
  rule that uses it (listed under "Starting point").
- **An electrician's view of instruments.** You know circuits better than most learners of this
  subject. So each instrument is taught as a circuit you could test: the PT100 as a resistance with
  leads in series, the 4-20 mA loop as one series ring, the trip as a relay coil kept energised.
  That is where your trade gives you a head start, and where the jobs at sea come to you.
- **One idea runs through lessons 5 to 8: measure, compare, act.** Generators taught it once, for the
  AVR and the governor (Generators lessons 2 and 4). Lesson 5 shows the same loop in a thermostat,
  lesson 6 shapes the "act" with P, I and D, lesson 7 makes "compare" a rung of logic, and lesson 8
  makes "act" a trip. The governor and AVR are drawn once, in lesson 5, as the loop you already know.
- **Droop is shown as proportional control.** Generators taught droop as the design that lets sets
  share (Generators lesson 4). Lesson 6 shows that P alone leaves an offset (Eurotherm, Astrom and
  Murray, notes 4.2) and points back: a droop governor settles lower on load for the same reason. That
  link is my reading and is labelled as such (gaps).
- **PID is tuned by feel, never by a recipe.** The tuning methods are named in one line (Ziegler-
  Nichols, continuous cycling, reaction curves, decay and overshoot tuning, Pearson Unit 16, notes 1.3).
  No table is given as the way any plant is tuned, and the ultimate-gain table one source prints is
  left out (notes 4.2). The one rule shown is a maker's guidance, labelled as such: "The ramp rate
  (Integral time constant) must be longer than the time constant of the process to avoid
  oscillations" (Eurotherm, notes 4.2).
- **The thermocouple is taught with a straight-line rule, labelled.** The IEC 60584 millivolt tables
  are paid and UNCONFIRMED (notes 2.3). So lesson 2 works a thermocouple in degrees: it reads the
  difference between its hot and cold ends, and cold-junction compensation adds back the terminal
  temperature (Fluke, notes 2.3). No millivolt figure is shown as a table value. The PT100 uses
  R = 100 × (1 + 0.00385 × T) as a straight-line screen, said so on screen, with R0 = 100 Ω from Texas
  Instruments and the 0.385 Ω a degree from an exercise page (SECONDARY, notes 2.3).
- **Energise or de-energise to trip is taught as a choice, with both sides.** De-energise to trip is
  the public default: HSE names it, Kenexis calls it typical, and "The majority of SIS are based on
  the "de-energize to trip" concept" (G.M. International, notes 4.4). An Institute of Marine
  Engineers paper on unattended machinery spaces put the other view: "a normally deenergized shutdown
  system (i.e. not "fail safe") backed up by a normally energized alarm system which was truly "fail
  safe"" (notes 4.4). Lesson 8 shows what each one does when a wire breaks and when a contact welds,
  and says the answer depends on which failure you fear more. It never says which one any boat uses.
- **The voting sums use your Statistics course, with example figures.** Kenexis gives the shape: 1oo2
  "improves safety, the spurious trip rate is twice as high"; 2oo2 has a dangerous failure chance
  "twice that of a single component" but "a nuisance trip rate that is an order of magnitude lower";
  and "2oo3 offers a compromise" (notes 4.4). Lesson 8 computes these from Statistics lesson 5's AND
  and OR rules, with an example 1 in 100 chance a sensor fails stuck and 1 in 10 that it trips
  falsely, labelled as examples (section 2, lesson 8).
- **Examples are public, general marine and industrial plant.** A diesel generator's lube oil
  pressure and jacket water temperature (both alarms a US rule requires on generator prime movers,
  notes 7.2), a hot water tank, a fresh water or lube oil tank, a compressor and its receiver, and a
  440 V generator's governor and AVR as loops. Every range, set point and limit is an example value,
  labelled, never a claim about any engine, ship or boat. Nothing is said about how the Royal Navy or
  any submarine measures, controls or trips anything. No naval source was used, and the SMQ books on
  your Drive were not read (notes 3.2).
- **Reactor instrumentation and protection is never touched.** The Level 2 maritime standard lists
  "reactors" among the plant its mechanics work on (notes 3.2). This course does not. The voting and
  fail-safe ideas in lesson 8 are taught on a diesel generator's lube oil trip only.
- **The shelf's entry needs a new blurb.** The shelf still says "Sensors, transducers and control
  loops on the plant." (docs/shelves-electrical.json). The folder's description of this course is
  the longer one at the top of this brief, which includes PLCs, alarms and trips. I suggest the shelf
  uses it. I have not changed the shelf.
- **Colour as before.** Ink for the plant, cables, lines, traces and controls; a second trace (the set
  point, a second sensor) is dashed ink, never a new colour. A running motor or an energised coil is
  bold ink, not green, even though real panels light green: green stays for finished only. Amber for
  key terms, teal for small labels (mA, V, Ω, °C, bar, SP, PV, OP). Red only for warnings and
  mistakes: a broken wire, a clipped loop, an alarm or trip state, wind-up, a missed trip, a bypass.
- **Your intake answers** (`intake.json`): to understand instrumentation and control and how to work
  with it; on the job and in everyday life; hands-on, with the why explained in full.

## 1. The overall topic
A plant keeps itself in line by measuring, comparing and acting. A sensor turns a temperature, a
pressure, a level or a flow into something electrical. A transmitter turns that into a standard
signal, most often a current between 4 and 20 mA, which carries the reading along a two-wire loop to
a display, a controller or a PLC. Every instrument has a range, a span, an accuracy and a resolution.
Every instrument drifts, so it is checked against a standard and its zero and span are set again.

Temperature is read by a platinum resistance (the PT100), whose leads add their own resistance, or by
a thermocouple, which reads the difference between its two ends. Pressure is read by a Bourdon tube or
a transducer, against the atmosphere, against a vacuum, or as a difference. Level comes from the
pressure at the foot of a tank, p = ρgh, or from a float, capacitance or radar. Flow comes from the
pressure drop across an orifice, which grows as the square of the flow, or from a magnetic meter.

A controller compares the measured value with the set point. On/off control, like a thermostat, needs
a gap between its switch points, and it still swings, more so when the plant lags or the reading
arrives late. A PID controller shapes its output from the error: proportional for now, integral for
the error that has lasted, derivative for where it is heading. Each one helps and each one has a cost.
Logic and sequence are done by relays or by a PLC, which reads its inputs, runs its ladder and writes
its outputs, over and over. Last, the plant protects itself. An alarm calls a person. A trip acts
without one. A trip circuit is kept energised so that a broken wire trips it, sensors vote so that one
bad sensor neither stops the plant nor lets it run on, and a bypass removes all of that at once.

**It builds on:**
- **Your trade:** series and parallel circuits, Ohm's law, and the multimeter in series and in
  parallel; cable resistance; control circuits with start, stop and overload contacts; inspection and
  testing as a method. You have wired and tested circuits like these; this course is the measuring
  and deciding the plant does with them.
- **Maths:** Percentages and Proportional reasoning (per cent of span); Linear equations and
  Straight-line graphs (scaling a reading and back; zero as a shift and span as a slope); Powers and
  roots (the square-root law); Exponentials and logarithms lesson 3 and Differential equations lesson
  3 (the time constant and 63%); Differential equations lesson 6 (overshoot and damping); Statistics
  for engineers lessons 2 and 5 (offset, scatter and resolution; AND and OR for reliability).
- **Engineering science:** Heat and fluids lessons 1, 3, 5, 6 and 7 (temperature; gauge and absolute
  pressure and the receiver's cut-in and cut-out; p = ρgh; the venturi and orifice; the Bourdon
  gauge and head); Mechanics and materials lesson 3 (strain).
- **Electrical:** AC circuits lesson 1 (a conductor moving through a field makes a voltage);
  Electronics lesson 4 (the transistor as a switch, a PLC's output); Motors lesson 2 (the DOL
  starter's latch, Stop normally closed, the overload in series); Generators lessons 2 and 4 (the AVR
  and governor as closed loops, droop); Insulated systems lesson 5 (an insulation monitor that alarms
  and does not trip); Batteries (the 24 V DC supply behind a loop).

**Not taught again:** temperature and heat; gauge, absolute and p = ρgh; Bernoulli and the venturi;
the Bourdon gauge; the time constant and the exponential; damping and overshoot as a sum; bias,
scatter and resolution; reliability in series and parallel; the DOL starter and its latch; closed
loop control as an idea; droop; the insulation monitor. Each is used with a one-line reminder, and
only what is new is taught.

**Taught inline, because you have not met them** (notes 5): what a transducer and a transmitter are;
range, span and calibration; Boolean logic as series and parallel contacts; the PLC scan as "read,
think, write"; dead time; the proportional, integral and derivative actions.

**Edges.** In: the measurement chain and its terms; zero and span calibration; the PT100 with two,
three and four wires; the thermocouple with extension cable and cold-junction compensation;
thermistors and temperature switches in one line; the Bourdon tube, strain-gauge and capacitive
transducers in outline; gauge, absolute and differential pressure; level by pressure, float,
capacitance and radar; flow by differential pressure and the square root, and by magnetic meter; the
4-20 mA loop, its scaling, live zero, loop power, headroom and checking it with a meter; 0-10 V and
HART in one line each; open and closed loop, on/off with hysteresis, the first-order lag and dead time;
P, I and D, offset, wind-up, noise and tuning by feel; relay logic to ladder, the scan, latches,
timers, counters, interlocks and permissives; alarms and trips, limits, deadband, priorities and
shelving, de-energise to trip, voting, first-up indication, bypasses and how a trip is tested. Out
(section 4 lists them): Laplace transforms, transfer functions and Bode plots; tuning tables; cascade,
ratio and feed-forward control beyond one line; control valve characteristics and actuators beyond
"the valve is the final element"; fieldbus and networks; pneumatic instruments; gas and fire detectors
and analysers; safety integrity levels and the safety standards' sums; faults on control circuits and
loops (Fault-finding); trending and calibration intervals (Maintenance and condition monitoring);
and anything about reactor instrumentation or protection.

## 2. The lessons, in the order they build
The order is the benchmarks' order: the measurement chain, then the quantities measured, then the
signal that carries them, then the loop, then PID last of the control lessons (SQA, Pearson Unit 16,
Edinburgh, MIT, notes 1.3, 1.4, 1.5, 2.1). Logic and PLCs follow the loop, as a separate unit in every
route (notes 1.2, 1.3), and alarms and trips close the course, from the HSE and IMO pages and the
STCW protective-device line (notes 3.1, 4.4, 7.1).

| # | Lesson | What it teaches |
|---|---|---|
| 1 | The measurement chain: from the plant to a number | Opening puzzle on the calibration bench: a transmitter reads every point a little high; slide the zero or the span screw until the line lies on the dashed one. Which screw fixed it? The chain, inline (notes 5): sensor, transducer, transmitter, signal, display and controller, one block each along the top of the picture. Pearson's Unit 16 starts here, with "Sensors and transducers used in instrumentation" (SECONDARY, notes 1.3). The numbers on an instrument, inline: range is "The region within which a value is measured, received or transmitted, expressed as lower and upper range values" (McMaster, notes 2.2); "Span is defined as the algebraic difference between the upper and lower range values" (ISA, notes 2.2). So 0 to 10 bar and −1 to 9 bar both have a 10 bar span (computed). ISA's worked case: "the engineer has determined the instrument will be calibrated for 0-to-300 psig = 4-to-20 mA" (notes 2.2); lesson 4 takes the mA. Still there: Statistics lesson 2's offset against scatter, and resolution as the display's step. Here they get the data sheet's words. Accuracy is "Degree of conformance of a value to a recognized, accepted standard value" (McMaster, notes 2.2), and a transmitter usually states it in per cent of span, not of reading. Example: ±0.5% of a 10 bar span is ±0.05 bar everywhere, which at 1 bar is 5% of the reading (computed, example values). Repeatability: "closeness of agreement among consecutive measurements", reported "in percent of span" and not including hysteresis (McMaster, notes 2.2). Hysteresis: "the output depends on the history of the input and current direction of change" (McMaster, notes 2.2), seen as up-going and down-going points that differ. Response time: "Time required for an output to reach a specified percentage of its final value" (McMaster, notes 2.2), which lesson 5 picks up. Calibration, the rule: "The zero adjustment is used to produce a parallel shift of the input-output curve. The span adjustment is used to change the slope" (ISA, notes 2.2): Straight-line graphs' intercept and slope. Typed puzzles: a 0 to 10 bar transmitter reads 4.32 mA at 0 bar and 20.32 mA at 10 bar: a zero error of 0.32 mA, 2% of span, span correct; one that reads 4.00 and 19.52 mA has a span error of −3% (computed). Do not quote a reading finer than the display allows: "the accuracy cited far exceeds the resolution of the instrument" (UNC, notes 6.1). Last screen: where the course goes. |
| 2 | Temperature: the PT100 and the thermocouple | Opening puzzle on the long cable: the probe sits in 85 °C water; drag the cable from 2 m to 50 m on two wires. Which way does the reading go, and why? The PT100: "For a PT100 RTD, R0 is 100 Ω" (Texas Instruments, notes 2.3), rising "about 0.385" Ω a degree (Atlas, SECONDARY, notes 2.3). The lesson's rule, R = 100 × (1 + 0.00385 × T), is a straight-line screen and says so; the real curve's coefficients "are defined by the IEC-60751 standard" (TI, notes 2.3), whose table values are UNCONFIRMED. At 85 °C, 132.7 Ω (computed). Two-wire: "the lead wire resistances cannot be separated from the RTD resistance, adding an error that cannot be separated from the RTD measurement" (TI, notes 2.3). Example leads of 0.5 Ω each add 1.0 Ω, and 1.0 ÷ 0.385 is 2.6 °C too hot (computed, example values). Three-wire: lead effects "can effectively be cancelled", but "Compensation for lead wire resistance assumes that the lead resistances match" (TI, notes 2.3); the picture's rule leaves the difference between the leads, labelled as simplified. Four-wire: "superior accuracy" (TI, notes 2.3). Self-heating named (Atlas, notes 2.3). The thermocouple: two different metals joined at the hot end make a voltage set by the difference between the hot end and the cold end, where it meets the instrument (my reading of Fluke's definition, notes 2.3). Cold-junction compensation is "adjusting the calculation ... to properly account for what the voltage would be if the cold junction was at the ice point, 0 °C" (Fluke, notes 2.3). So without it, 450 °C exhaust with the terminals at 35 °C reads about 415 °C (computed on the lesson's straight-line rule, labelled). Extension cable is "made of the same element material as the thermocouple" (Eltec, notes 2.3), and "Never use copper for the extension wire, since errors will result" (Fluke, notes 2.3): copper moves the cold end to the probe head, so a head at 70 °C and terminals at 25 °C read 405 °C, 45 °C low (computed, same rule). Which to use: "Thermocouples are robust and broad-range, but they depend on cold-junction compensation, polarity, extension wire and thermal-gradient control. RTDs are usually more accurate at moderate temperatures" (Atlas, SECONDARY, notes 2.3). Thermistors and temperature switches in one line each, UNCONFIRMED (notes 2.3). Where it is used: "High jacket-water temperature" is a required alarm (46 CFR, notes 7.2). Typed puzzles: a PT100 reads 134.65 Ω, what temperature (90 °C, computed); two-wire leads of 0.77 Ω each, what error (4.0 °C, computed). |
| 3 | Pressure, level and flow | Opening puzzle on the tank: a fresh water tank's transmitter reads 2.0 m. Pour in lube oil to the same height. Does the reading go up, down or stay? Pressure: "A bourbon tube is a curved, hollow tube with the process pressure applied to the fluid in the tube" (McMaster, notes 2.4), Heat and fluids lesson 7's gauge, now with its insides. Strain-gauge transducers in outline: a stretched wire is longer and thinner, so by R = ρL ÷ A its resistance rises (computed from your trade's rule and Mechanics lesson 3's strain; the source line is UNCONFIRMED, notes 2.4). Capacitive transducers in one line, UNCONFIRMED (notes 2.4). The three references: "The most common type of pressure measurement is gauge pressure , with reference to atmospheric pressure"; "Absolute pressure , with reference to a full vacuum" (WIKA, notes 2.4); differential, one side against the other. Still there: Heat and fluids lesson 5's p = ρgh. Level from pressure: "the hydrostatic pressure is the same at the bottom of a thin, deep tank as it is a very large tank with the same height" (control.com, notes 2.4). A 3 m fresh water tank is 0 to 29.43 kPa (computed with 1000 kg/m³). The same transmitter on seawater at 1025 kg/m³ reads 2.05 m for 2 m; on an example oil at 880 kg/m³, 1.76 m (computed). Sealed tank: "the only way to monitor that liquid level is to deduct the low-pressure side (gas or vapor) from the high-pressure side (liquid)" (WIKA, notes 2.4); 50 kPa of gas above water reads 5.1 m too high on a gauge transmitter (computed). Other ways, one screen: "Floats can be used to indicate or control the level of a liquid" (Michigan); capacitance, where "an empty tank has a lower capacitance, whilst a filled tank a higher capacitance"; and "Radar level measurement is based on the Time- of-Flight principle" (Endress+Hauser, notes 2.4). Flow: Heat and fluids lesson 6 turned a pressure drop into a flow. Its consequence: "The pressure difference between the upstream and downstream sides of the constriction is proportional to the square of the flow rate" (Processing, notes 2.4). Double the flow and a DP gauge "will go from reading 20% to reading 80%" (control.com, notes 2.4), so "Square root extraction ... is necessary" (Processing, notes 2.4). 25% of DP span is 50% of flow (computed). At the bottom of the range, "a fixed absolute differential-pressure error becomes a large relative flow error" (Atlas, notes 2.4): a 0.5% of span DP error reads 10% flow as 12.2%, and 80% flow as 80.3% (computed). The magnetic meter: "a voltage is induced in an electrical conductor moving through a magnetic field" (USBR, notes 2.4), AC circuits lesson 1's moving conductor, so its reading is straight, not squared (my reading). Turbine meters in one line, UNCONFIRMED. Where it is used: "Low lube-oil pressure for each main propulsion engine and each prime mover of a generator" (46 CFR, notes 7.2); flow meters in the control and instrumentation technician's work (Skills England, notes 3.2). |
| 4 | The 4-20 mA loop | Opening puzzle on the live loop: double the cable length. Does the display change? Then cut the wire. What does the display say? Why current, my reading from your trade: a loop is one series ring, so the same current flows in every part of it, and the cable's resistance cannot change the reading as long as the supply can still push it round (gaps). Live zero: "A "Live Zero" of 4mA also permits the two-wire current loop to power the transmitter" and "The 4mA "Zero-Offset", "Live Zero", or "Positive-Zero" is Failsafe" (Acromag, notes 2.5); "Two-wire loop-powered transmitters draw their operating power from the 4-20 mA loop itself" (Unitest, SECONDARY, notes 2.5). Scaling, a straight line (Linear equations): the transmitter "is ranged with a lower range value (LRV, at 4 mA) and upper range value (URV, at 20 mA)" (Sparky Tools, SECONDARY), and "% of span = (I − 4 mA) ÷ 16 mA × 100" (Dreiym, SECONDARY, notes 2.5). Example 0 to 10 bar: 9.6 mA is 35%, 3.5 bar; forgetting the 4 gives 4.8 bar (computed). A 20 to 120 °C transmitter at 12 mA reads 70 °C, not 60 (computed). The 250 Ω input: "At 4 mA, a 250Ω resistor drops 1 volt; at 12 mA ... 3 volts and at 20 mA ... 5 volts" (BAPI, notes 2.5). Headroom: "24 V − 10.5 V − 20 mA × 270 Ω = 8.1 V of headroom" (EpiSensor, SECONDARY, notes 2.5); the most loop resistance that supply allows is 13.5 V ÷ 20 mA = 675 Ω (computed). Faults: "Treat 3.6 mA or below and 21 mA or above as faults (NAMUR NE 43)" (EpiSensor, SECONDARY, notes 2.5). Checking it: "A reading of 3.00 VDC across a 250-ohm resistor means 12.0 mA" (Toolgrit, SECONDARY), no break needed; to break in, "use the mA function on your multimeter" (Toolgrit, notes 2.5). Told, not discovered: "Opening a running loop sends the control system 0 mA, and that can move a valve or trip an interlock" (Dreiym, SECONDARY, notes 2.5), so you warn the people running the plant first (Sparky Tools, notes 6.4). Two supplies in one loop, a four-wire transmitter into a powered input (Sparky Tools, notes 6.4). One line each: "Plain 0-10 V cannot tell a broken wire from a zero reading" (EpiSensor), and HART is "A digital signal superimposed on the 4–20 mA as a small tone" (Sparky Tools, SECONDARY, notes 2.5). Typed puzzles: 3.00 V across 250 Ω on a 0 to 6 m level loop (12 mA, 3 m); a 24 V supply, 12 V transmitter minimum, 250 Ω input and 2 × 80 Ω of cable (headroom 3.8 V, computed). |
| 5 | Control loops: measure, compare, act | Opening puzzle on the thermostat trace, the valve theory: the tank is cold; turn the dial from 60 °C to 80 °C. Does it heat faster? (It does not; the heater is on full either way.) "The valve theory is inconsistent with engineering knowledge, but is estimated to be held by 25% to 50% of Americans" (Kempton, notes 6.2), the idea that "the thermostat controls the rate at which the furnace generates heat" (Kempton, SECONDARY, notes 6.2). The turn is "it's not a valve, it's an automatic switch" (Kempton, SECONDARY, notes 6.2). Open loop: "Because there is no feedback on the controlled variable (space temperature), the control is an open loop" (ASHRAE, notes 4.1); the picture's no-sensor switch runs the heater on a timer and drifts when hot water is drawn. Closed loop, the words: "The desired value of the process variable is called the set point (SP)" and "The control error e is the difference between the set point and the process variable" (Astrom and Hagglund, notes 2.1), with the controller's output (OP). Still there: the AVR's measure, compare, correct (Generators lesson 2). On/off: it "often succeeds in keeping the process variable close to the set point, but it will typically result in a system where the variables oscillate", so it is common to add "hysteresis or a dead zone" (Astrom and Hagglund, notes 4.1). Example: set 60 °C with a 4 °C differential, on at 58 °C and off at 62 °C (example values). The air receiver's cut-in and cut-out (Heat and fluids lesson 3) is the same thing. Still there: Exponentials lesson 3's 63%. The lag: "the time it takes for the controlled variable of a first-order, linear system to reach 63.2% of its final value when a step change in the input occurs" (ASHRAE, notes 4.1). Dead time, new and different: "the time from when a change in the controller output is made to when the controlled variable exhibits a measurable response" (ASHRAE, notes 4.1). With dead time the switch acts on an old reading, so the swing goes past both switch points: "The operating differential may be greater because of thermostat lag or hysteresis" (ASHRAE, notes 4.1). The loops you know, one screen: the governor (speed in, fuel out) and the AVR (volts in, field out) drawn as the same block diagram (Generators lessons 2 and 4). Where it is used: "various automatic control methodologies and characteristics" (STCW A-III/1, notes 3.1); "open and closed loop" in Pearson Unit 16 (SECONDARY, notes 1.3). Typed puzzles: a tank warming from 20 °C towards 88 °C, where is it after one time constant (20 °C plus 63.2% of 68 °C, about 63 °C, computed); a 2 minute dead time and a temperature rising 1.5 °C a minute, how far past the off point (3 °C, computed). |
| 6 | PID: tuning a loop by feel | Opening puzzle on the loop to tune: P only. Turn the gain up to close the gap to the set point. Can you close it all the way? Why not? Proportional: "Proportional only controllers will not, in general, control precisely at setpoint, but with an offset corresponding to the point at which the output power equals the heat loss from the system" (Eurotherm, notes 4.2); "the output never reaches the reference" (Astrom and Murray, notes 4.2). The rule, output = gain × error: if the loop needs 30% valve to hold temperature, a gain of 3 sits 10% of span below the set point and a gain of 6 sits 5% below (computed, example values). Raise the gain far enough and it swings. A droop governor's lower speed on load is the same offset (my reading, Generators lesson 4). Integral: "removes steady state control offsets by ramping the output up or down in proportion to the amplitude and duration of the error signal" (Eurotherm, notes 4.2); "The steady-state error is eliminated when integral gain action is used" (Astrom and Murray, notes 4.2). Its cost: "increasing the integral term too much can lead to an oscillating output" (Zurich Instruments, notes 4.2), and Eurotherm's guidance that the integral time be "longer than the time constant of the process" (notes 4.2). Wind-up: when the valve is full open and the error lasts, the integral keeps growing; "The control signal will then remain saturated even when the error changes ... This situation is referred to as integrator windup" (Astrom and Murray, notes 4.2); "any controller with integral action may give large transients when the actuator saturates" (Astrom, notes 4.2). Derivative: "proportional to the rate of change", "used to prevent overshoot and undershoot of the setpoint" (Eurotherm, notes 4.2), and the system "becomes more damped as the derivative gain is increased" (Astrom and Murray, notes 4.2). Its cost: "high-frequency measurement noise will generate large variations in the control signal" (Astrom and Murray), so "the derivative action is sometimes omitted" and PI is "common in applications that prioritize steady-state error elimination and stability" (Zurich Instruments, notes 4.2). Still there: Differential equations lesson 6's ringing and critical damping, now read off a loop's trace as overshoot and settling. The controller's own words: "gain, integral action time (IAT) and derivative action time (DAT)" (SQA, notes 1.4), the "three-term controllers" (Astrom and Murray, notes 4.2). Tuning by feel on the picture; the named methods in one line (decision above). Feed forward named in one line (Pearson, notes 1.3). Where it is used: STCW A-III/1's PID line (notes 3.1). Typed puzzles: the offset at a given gain and load; what the integral does to the output in a minute of a steady error, with an example integral time (computed). |
| 7 | Logic and PLCs: from relays to ladder | Opening puzzle on the compressor's ladder: press Start, let go. Why does it keep running? Now find the one contact whose removal makes it stop when you let go. Still there: Motors lesson 2's latch across Start. Logic, inline (notes 5): contacts in series are AND, in parallel are OR, a normally closed contact is NOT. Latching is "the circuit that able to hold the output energized even though the input which energizing it ceases" (lecture notes, SECONDARY, notes 4.3). "Seal-in = output's own contact in parallel with START (provides memory)" and "Output = (START OR Output) AND STOP" (PLC Practice, SECONDARY, notes 4.3). Stop: "the physical STOP button is usually wired normally closed" (PLC Practice), because otherwise "the human operator loses control of the motor in the event of an "open" wiring failure" (Instrumentation Tools, SECONDARY, notes 4.3). The overload: "bring the auxiliary contact off the motor overload into the PLC. Use that to create a Fault, use the Fault to break the Run rung, and also report the Fault as an alarm" (Contact and Coil, SECONDARY, notes 4.3). The PLC: "A ladder diagram is read from left to right and from top to bottom", and "all the outputs are updated simultaneously at the end of the program scan" (Bolton, SECONDARY, notes 4.3). The scan, inline as read, think, write: "Input scan - read physical inputs ... Program execution - execute user logic top to bottom" (IMD, SECONDARY, notes 4.3). "Relay logic is event-driven and operates in true parallel; PLC logic is scan-based" (IMD, notes 4.3). So "The most common mistake is converting the wiring one-to-one without considering the scan-based execution" (IMD, notes 4.3). A press shorter than one scan can be missed (my reading of IMD's "bounded by the scan period"; the picture's scan is slowed and says so). Timers, counters and latches, the "Associated elements" of a first program (Pearson HN Unit 15, SECONDARY, notes 4.3): an on-delay timer that waits before the compressor loads, and a counter of starts (example uses). Interlocks and permissives: a start that is refused unless a condition is true, such as the receiver below cut-out; "permissive" in the PLC sense is UNCONFIRMED and written plainly (notes 4.4). The languages in one line: "ladder diagrams (LAD), instruction list (IL), sequential function charts (SFC), structured text (ST), and function block diagrams (FBD)" (Bolton, SECONDARY, notes 4.3). Where it is used: "programmable logic controllers" in the auxiliary systems of the Level 2 maritime standard (Skills England, notes 3.2); "sequential control circuits" (STCW A-III/1, notes 3.1); Pearson Level 3 Unit 36 (notes 1.2). Typed puzzles: write the Boolean for a two-station start and stop; which output a given input pattern sets after one scan. |
| 8 | Alarms, trips and fail-safe design | Opening puzzle on the trip bench: one sensor, de-energise to trip. Blow the fuse. Does the engine stop? Now switch to energise to trip and blow it again. Alarm and trip: an alarm system alerts "operators to plant conditions ... which require timely action or assessment" (HSE, notes 4.4); a trip acts without them (SIS pages, notes 4.4). Still there: Insulated systems lesson 5's monitor, which alarms on a first fault and leaves the supply on. Limits: an alarm line above a trip line on falling lube oil pressure, as example values (46 CFR names the alarm, notes 7.2). Deadband: "Change set points, hysteresis or dead bands to make the system less sensitive to short duration unimportant fluctuations" (HSE, notes 4.4), lesson 5's differential again. Floods: "There were too many alarms and they were poorly prioritised", and "Prioritise proportionately, eg 5% high priority, 15% medium, and 80% low" (HSE, notes 4.4). Shelving: "controls exist to ensure that alarms are returned to an active state" (HSE, notes 4.4). Fail-safe: "an open detection circuit should cause an audible and visual alarm" (IMO A.686, notes 7.1); alarms "of the self-monitoring type" (46 CFR, notes 7.2). De-energise to trip: "Removal of the source of power (e.g., electricity, air) causes a trip" (Kenexis, notes 4.4), so "a blown fuse or by cable open circuit damage will also lead to a low signal and fail safe trip" (Measurement and Control paper, notes 4.4). Its weak spot: "contacts welded closed" is "a dangerous failure" (Kenexis, notes 6.4). The other view, taught as contested (decision above). Voting: two sensors and one vote "improves safety, the spurious trip rate is twice as high" (Kenexis); 2oo3 "has both lower PFDavg and lower spurious trip rate than a single device" (Kenexis, notes 4.4). With Statistics lesson 5's rules and example chances 0.01 of a stuck sensor and 0.1 of a false trip: 1oo1 misses 0.01 and false-trips 0.1; 1oo2, 0.0001 and 0.19; 2oo2, 0.0199 and 0.01; 2oo3, about 0.0003 and 0.028 (computed, example values, independent failures). First-up indication in one short screen, which alarm came first when many follow; UNCONFIRMED, written plainly (notes 4.4). Bypasses: "There is recognized value in being able to temporarily place a sensing element in bypass", but "in most major accidents accidental or intentional bypassing are cited as key contributing factors" and "If an output is bypassed, it is effectively bypassing ALL of this critical interlocks simultaneously" (Kenexis, notes 4.4). Testing a trip: "An unacceptable test for a pressure sensor is reducing the sensor's alarm set point until the ambient pressure in the system causes an alarm state" (US Coast Guard, notes 7.1). Where it is used: the unattended machinery space, "to inform the engineer officer on watch of any alarm situation" (IMO A.686, notes 7.1); STCW's "protective devices" tests (notes 3.1). The last screens are a mixed set from the whole course. |

## 3. Can it be taught mostly visually, through interaction?
**Yes** (RUNBOOK section 0, item 3). Every lesson is a steps lesson of about 12 screens, SHOW then DO,
ending on two or three mixed puzzles. SHOW screens carry one to three plain sentences and a picture.
Almost everything here is a line, a ring, a trace or a rung, and each can be moved. Where an idea needs
words, it becomes two short screens. Each lesson has one main picture you move with your finger,
chosen because it shows the cause, not just the answer. Each lesson opens with a puzzle on that
picture, before the rule: the valve theory "requires a conversion" (Kempton, notes 6.2), which a
prediction that fails in front of you does better than a sentence (notes 6.2, my reading). Learners
"conflate measurement uncertainty, systematic effects, and measurement mistakes" (PRPER, notes 6.1),
so lesson 1 gives each its own look in one picture. Control is learned in steps and tested on concepts
(Bristow et al, notes 6.3), so the DO screens ask what a trace will do, not only for a sum. Every step
has a `still` or `read` for the read-through and your Book.

- **Lesson 1, the calibration bench.** Above, the chain as five blocks: sensor, transducer,
  transmitter, signal, display. Below, the transmitter's line, pressure along the bottom (0 to 10 bar)
  and mA up the side (4 to 20), the ideal line dashed. A zero screw slides the line; a span screw tilts
  it about the bottom end. Tap "check" and a reference pressure steps through 0, 25, 50, 75 and 100%;
  each point drops a bead and a table lists its error in per cent of span. A noise slider scatters
  repeat beads round each point, a display-step switch rounds them to bricks, and an up-and-down
  switch shows hysteresis as two sets of beads. *Why:* the ISA rule is a picture already, "a parallel
  shift" and "the slope" (notes 2.2), and it is Straight-line graphs' intercept and slope. The beads
  are Statistics' own language for offset and scatter, so the three troubles PRPER says learners mix
  up (notes 6.1) look different at a glance.
- **Lesson 2, the long cable.** A pipe of cooling water with a probe, a temperature slider, a cable
  you drag from 2 m to 100 m, and the meter at the far end. A 2, 3, 4-wire switch redraws the leads,
  each with its resistance marked. The meter shows the temperature it works out and the error in red
  when it is off. In three-wire, a slider mismatches one lead. A sensor switch swaps in a thermocouple:
  the hot end in an exhaust, a probe head, the cable and the terminals, each with its temperature.
  Drag the terminal temperature with compensation off and the reading slides; turn it on and the
  reading holds. Swap the extension cable for copper, then warm the head. *Why:* the error is in the
  cable and at the cold end, which is where an electrician's choices decide the reading. TI's three
  sentences (notes 2.3) are the three positions of the switch, and Fluke's "Never use copper" (notes
  2.3) becomes something you watch go wrong.
- **Lesson 3, the tank and its outlet.** A tank with a pressure transmitter at its foot, a gauge on
  its lid, and an outlet pipe with an orifice plate and a DP cell. Drag the level; pick the liquid
  (fresh water, seawater, an example oil); close the lid and drag the gas pressure. The transmitter's
  level reading and the true level sit side by side, red when they part. A second transmitter, a DP
  cell with its low side on the gas, can be switched in. Open the outlet valve: the flow bar and the
  DP bar move, the DP bar growing as the square. A switch shows the flow display with and without the
  square root. *Why:* the transmitter does not see a level, it sees a pressure, so density and gas
  pressure fool it, and a tank's width does not (control.com, WIKA, notes 2.4). The two bars side by
  side are control.com's 20% to 80% (notes 2.4), so the square root is felt before it is named.
- **Lesson 4, the live loop.** The loop drawn as one ring: 24 V supply, cable out, two-wire
  transmitter, cable back, 250 Ω input. Arrows of current, all the same size, run round it. Drag the
  process value and the mA readout, the volts across 250 Ω and the scaled display move together. Drag
  the cable resistance: the arrows do not change until the headroom bar runs out, then the top of the
  range clips in red. Cut the wire anywhere: 0 mA and "broken wire". A 0-10 V switch shows the same
  cut reading as zero, with no warning. A meter you place: across the 250 Ω on volts, in series on mA,
  or, with the leads still in the mA jacks, across the supply, where it shorts the loop in red.
  *Why:* the reason a loop uses current is that the same current flows everywhere in a series ring,
  which the equal arrows show; the live zero is Acromag's "Failsafe" (notes 2.5), seen when the wire
  is cut; headroom is EpiSensor's sum (notes 2.5) as a bar; the meter mistakes are Sparky Tools' and
  Toolgrit's (notes 2.5, 6.4).
- **Lesson 5, the thermostat trace.** A hot water tank with an electric heater, a thermostat with a
  set-point dial and a differential slider, a sensor you can slide away from the heater along the
  pipe, and a draw-off tap. Under it, the temperature against time with the two switch points drawn,
  and a strip showing the heater on or off. Turn the dial up: the heating slope does not change, only
  where it stops. Widen the differential: fewer, longer swings. Move the sensor away: the dead time
  grows and the trace sails past both lines. Open the tap: a load. A switch removes the sensor and
  runs the heater on a timer. *Why:* the slope that does not change is the answer to the valve theory
  (Kempton, notes 6.2). The trace shows ASHRAE's lag and dead time (notes 4.1) as two different shapes,
  a curve that bends and a flat start. On/off swings, as Astrom and Hagglund say (notes 4.1), and the
  differential is the hysteresis they add.
- **Lesson 6, the loop to tune.** An engine's jacket water loop: an engine block heating the water, a
  three-way valve splitting it between the cooler and the bypass, a temperature sensor after the
  valve, and the controller. Three sliders, P, I and D, with an example process inside (a lag and a
  dead time, labelled as an example). Buttons: load step (the engine's load goes up), set-point step,
  and a noise slider on the sensor. The trace shows the set point, the temperature, and the valve
  position with its 0 and 100% limits. P alone settles off the set point, and the offset is marked.
  Add I and the gap closes; push it and the trace rings. Tap a big step and the valve pins at 100%
  while an integral bar keeps filling in red, wind-up. Add D and the ringing dies; add noise and the
  valve chatters. *Why:* each action is defined by what it does to the trace (Eurotherm, Astrom and
  Murray, Zurich, notes 4.2), so the trace is the lesson. The valve's limits make wind-up visible,
  which no sum does. The jacket water loop is the alarm 46 CFR names (notes 7.2), so lesson 8 reuses
  the plant.
- **Lesson 7, the compressor's ladder.** Left, the panel: Start (normally open), Stop (normally
  closed), the receiver's pressure switch and the overload's auxiliary contact, each wired to an
  input. Middle, the ladder: a run rung with its seal-in, an auto rung for the pressure switch, an
  on-delay timer and a start counter. Right, the motor and the receiver gauge. A scan cursor sweeps
  the rungs, the input table fills before it and the output table changes only at the end. Press
  Start and the seal-in contact lights in bold ink. Cut a wire to Stop and the motor stops; rewire
  Stop as normally open and cut it again, and the motor runs on in red. A slow-scan switch, labelled
  as slowed, lets a quick press fall between two input reads. *Why:* the seal-in is the Boolean
  "(START OR Output) AND STOP" (PLC Practice, notes 4.3) and Motors lesson 2's latch, so you watch the
  same thing in two forms. The scan cursor makes "outputs are updated simultaneously at the end" (Bolton,
  notes 4.3) something you see, which is the cause of IMD's "most common mistake" (notes 4.3).
- **Lesson 8, the trip bench.** A diesel generator's lube oil pressure, with a trend, an alarm line and
  a trip line (example values) and a deadband you drag. Pick one, two or three sensors and the vote.
  Each sensor has three fault buttons: fail safe (reads zero), fail stuck (reads healthy whatever
  happens) and noisy. A trip relay drawn as a coil and its contacts, with a switch for de-energise or
  energise to trip and a fuse you can blow. A bypass key greys out the trip and lights a red banner. A
  first-up lamp shows which sensor went first. "Run a year" plays many years of example failures and
  counts missed trips and false trips for each vote. *Why:* fail-safe design is defined by what a
  failure does (HSE, Kenexis, notes 4.4; IMO, notes 7.1), so the picture is built from failures you
  cause. The counter turns Kenexis' "twice as high" and "order of magnitude" (notes 4.4) into counts
  you watch build, from Statistics lesson 5's rules. The bypass key shows "bypassing ALL" (notes 4.4).

## 4. What else
- **Benchmark (notes 1, 2, 8).**
  - **Brilliant:** no course on sensors, feedback or control. Its Circuits (31 lessons) teaches
    current, voltage, resistance and power, and its Digital Circuits (32 lessons) teaches gates,
    truth tables and adders; neither has a sensor, a loop or a latch that remembers (notes 1.1). So
    Brilliant sets no order here.
  - **Pearson BTEC Level 3 National:** Unit 36, Programmable Logic Controllers, 60 hours, "to develop
    an industrial Programmable Logic Controller (PLC) system to solve an engineering problem" (notes
    1.2). The 2010 suite had "Principles and Applications of Engineering Measurement Systems",
    "Industrial Plant and Process Control" and "Industrial Process Measurement" (notes 1.2).
  - **Pearson Higher Nationals Unit 16, Instrumentation and Control Systems** (15 credits, Level 4):
    four outcomes, instruments, process control, control concepts and tuning, then stability (notes
    1.3, quoted from a training provider's workbooks, SECONDARY). It names sensors from "resistive" to
    "thermocouple and optical", the signal terms from "accuracy" to "hysteresis", "open and closed
    loop, feed forward control", and the tuning methods (notes 1.3). The PLC unit sits beside it,
    not inside it (notes 1.3).
  - **SQA HN unit J6D0 47:** pressure, level, temperature and flow, then analysers and detectors,
    actuators, and "complex control systems" last, about 17 hours each, 120 in all (notes 1.4).
  - **Hartlepool's HNC in Instrumentation & Control Engineering:** PLCs and Control System
    Principles as separate modules (notes 1.3). **Edinburgh** and **MIT:** instruments first, then
    the dynamic model, then feedback (notes 2.1).

  What they lack that you need: alarms, trips and fail-safe design are spread across HSE pages and
  the IMO's alarm code rather than taught as a unit (notes 8), so lesson 8 gathers them. And none
  teaches an instrument as a circuit an electrician tests, which is lessons 2 and 4. What they have
  that you do not need: Laplace transforms, transfer functions and Bode plots (notes 2.1, 5), and a
  whole unit's depth on any one part. Eight lessons is smaller than any one benchmark unit, on
  purpose: foundations, not a remake (notes 8).
- **His aim (notes 3).** You have no syllabus for the Navy courses ahead, so the course is planned
  against public standards, and where that is a guess it says so.
  - **STCW Table A-III/1** (officer in charge of an engineering watch): PID "control characteristics
    and associated system devices for process control"; "various automatic control methodologies and
    characteristics"; "sequential control circuits and associated system devices"; and "Function and
    performance tests of ... 1. monitoring systems 2. automatic control devices 3. protective devices"
    (a maritime academy's copy, SECONDARY, notes 3.1).
  - **STCW Table A-III/6** (electro-technical officer): "Fundamentals of automation, automatic control
    systems and technology" and "Instrumentation, alarm and monitoring systems" (a national mapping,
    SECONDARY, notes 3.1).
  - **Skills England, Level 2 Maritime mechanical and electrical mechanic:** "employed in the Royal
    Navy and Merchant Navy", testing and fault diagnosis "on ships and submarines", on systems that
    include "programmable logic controllers" (notes 3.2).
  - **Skills England, Level 3 Control and instrumentation engineering maintenance technician:**
    "programmable logic controllers, flow meters, heat exchangers and safety controls"; maintenance
    "including calibration"; and "fault diagnosis" (notes 3.2). Its knowledge and skill lines are
    UNCONFIRMED (notes 3.2).
  - **Not reached:** the Royal Navy's naval engineering technician standard and the engineering
    technician (electrical or control and instrumentation) standard, both UNCONFIRMED (notes 3.2).
  - **My guess:** your Level 3 marine engineering course and the leading rate qualifications will
    have you read plant readings, check a transmitter, follow a control sequence and test alarms and
    trips. This course gives you why each one behaves as it does, at the depth of the STCW lines and
    the Level 3 technician's duties, so any instrument, controller or panel you meet reads as the same
    chain and the same loop.
- **Starting point (notes 5).** Nothing below is taught again; each is used with a one-line reminder.

  | Idea | Earlier lesson | Used here |
  |---|---|---|
  | Per cent of a value; proportion | Percentages; Proportional reasoning | Per cent of span, every lesson |
  | A straight line's slope and intercept; a line through two points | Straight-line graphs; Linear equations | Lesson 1's zero and span; lesson 4's scaling |
  | Offset against scatter; resolution; accuracy as ±(% + counts) | Statistics for engineers 2 | Lesson 1's recall and the data sheet's words |
  | Reliability in series and parallel; AND and OR | Statistics for engineers 5 | Lesson 8's recall and voting |
  | Square roots | Powers and roots | Lesson 3's square-root law |
  | The time constant and 63% | Exponentials and logarithms 3; Differential equations 3 | Lesson 5's recall and the lag |
  | Overshoot, ringing and critical damping | Differential equations 6 | Lesson 6's recall and the trace |
  | Temperature and heat | Heat and fluids 1 | Lesson 2's plant |
  | Gauge and absolute; the receiver's cut-in and cut-out | Heat and fluids 3 | Lesson 3's references; lessons 5 and 7's compressor |
  | p = ρgh; depth not shape | Heat and fluids 5 | Lesson 3's recall and level |
  | The venturi and orifice; Bernoulli | Heat and fluids 6 | Lesson 3's flow |
  | The Bourdon gauge; head | Heat and fluids 7 | Lesson 3's pressure |
  | Strain | Mechanics and materials 3 | Lesson 3's strain gauge |
  | A conductor moving in a field makes a voltage | AC circuits 1 | Lesson 3's magnetic flowmeter |
  | The transistor as a switch | Electronics 4 | Lesson 7's PLC outputs, in one line |
  | The DOL's latch, Stop normally closed, the overload in series | Motors 2 | Lesson 7's recall and seal-in |
  | The AVR and governor as closed loops; droop | Generators 2, 4 | Lesson 5's recall; lesson 6's offset |
  | An insulation monitor alarms and does not trip | Insulated systems 5 | Lesson 8's recall |
  | The 24 V DC supply | Batteries; your trade | Lesson 4's loop supply |
  | Series current is the same everywhere; meters in series and across | Your trade | Lesson 4's why current |

- **Where it is used (each cited before a lesson uses it).** Public, general marine and industrial
  plant only; nothing about any naval vessel (notes 3, 7).
  - **The measurement chain (1):** maintenance "including calibration" (Skills England, notes 3.2);
    "Function and performance tests of ... monitoring systems" (STCW A-III/1, notes 3.1); the signal
    terms in Pearson Unit 16 (notes 1.3).
  - **Temperature (2):** "High jacket-water temperature" (46 CFR, notes 7.2); thermocouples named in
    Pearson Unit 16 (notes 1.3); SQA's "temperature measurement systems" (notes 1.4).
  - **Pressure, level and flow (3):** "Low lube-oil pressure for each main propulsion engine and each
    prime mover of a generator" (46 CFR, notes 7.2); "flow meters" (Skills England, notes 3.2); SQA's
    pressure, level and flow outcomes (notes 1.4).
  - **The 4-20 mA loop (4):** ISA's "0-to-300 psig = 4-to-20 mA" (notes 2.2); an electrician
    apprentice's fourth-year lesson on it (Sparky Tools, SECONDARY, notes 2.5, 5); "Instrumentation,
    alarm and monitoring systems" (STCW A-III/6, SECONDARY, notes 3.1).
  - **Control loops (5):** "various automatic control methodologies and characteristics" (STCW
    A-III/1, notes 3.1); Pearson Unit 16's "open and closed loop" (notes 1.3); the unattended machinery
    space, "a first step to Automation" (SAFETY4SEA, notes 7.1).
  - **PID (6):** STCW A-III/1's PID line (notes 3.1); SQA's "gain, integral action time (IAT) and
    derivative action time (DAT)" (notes 1.4); Pearson Unit 16's tuning (notes 1.3).
  - **Logic and PLCs (7):** "programmable logic controllers" (Level 2 maritime standard, notes 3.2);
    "sequential control circuits" (STCW A-III/1, notes 3.1); Pearson Level 3 Unit 36 (notes 1.2);
    the Level 3 technician's "programmable logic controllers" (notes 3.2).
  - **Alarms and trips (8):** the IMO's Code on Alarms and Indicators and its fail-to-safety line
    (notes 7.1); "self-monitoring" alarms (46 CFR, notes 7.2); "all automatic control, remote control
    safety control, instrumentation, and alarm systems must be of a failsafe design with two sources
    of power" (US Coast Guard, notes 7.1); STCW's protective device tests (notes 3.1); "safety
    controls" (Skills England, notes 3.2).
- **The mistakes to catch, each with a DO screen and its own hint.** The notes found one well-studied
  misconception (the valve theory), one concept inventory for control, and the measurement literature
  (notes 6.1 to 6.3). For the 4-20 mA loop, PLCs and alarms, the named mistakes come from trade and
  training sites and makers, not studies (notes 6.3, 6.4). Each is marked with how strong its source
  is.
  - **Lesson 1, accuracy, scatter and resolution mixed up:** "students conflate measurement
    uncertainty, systematic effects, and measurement mistakes" (PRPER, notes 6.1). A study. A DO
    screen shows three bead pictures and asks which is a zero error, which is noise and which is
    the display.
  - **Lesson 1, a reading quoted finer than the instrument:** "the accuracy cited far exceeds the
    resolution of the instrument" (UNC, notes 6.1). A lab guide. A DO screen: a gauge marked every
    0.5 bar; is 6.25 bar a fair reading?
  - **Lesson 1, per cent of span read as per cent of reading:** a check, not a cited mistake (the
    ISA and McMaster definitions, notes 2.2). A DO screen: ±0.5% of span at 1 bar on a 10 bar
    transmitter.
  - **Lesson 2, two-wire leads ignored:** "an error that cannot be separated from the RTD
    measurement" (TI, notes 2.3). A maker's note. The opening puzzle, then a typed lead-error sum.
  - **Lesson 2, three-wire cancels whatever the leads:** "assumes that the lead resistances match"
    (TI, notes 2.3). A DO screen with one lead joint corroded.
  - **Lesson 2, copper extension cable:** "Never use copper for the extension wire, since errors will
    result" (Fluke, notes 2.3). A maker's caution. A DO screen offers copper "because it is only a
    signal".
  - **Lesson 2, a thermocouple reads its tip:** it reads the difference to its cold end (Fluke's
    compensation definition, notes 2.3; my reading). A prediction screen before the terminal box warms.
  - **Lesson 3, a DP flow reading is straight:** "it will go from reading 20% to reading 80%" (control.com,
    notes 2.4). A textbook. A prediction screen: double the flow, what does the DP do?
  - **Lesson 3, low flow is as good as high flow:** "a fixed absolute differential-pressure error
    becomes a large relative flow error near the bottom of range" (Atlas, notes 2.4). A DO screen at
    10% and 80% flow.
  - **Lesson 3, a level transmitter sees level:** it sees pressure, so density and gas pressure
    change it (WIKA, notes 2.4); width does not (control.com, notes 2.4). The opening puzzle and a
    sealed-tank DO screen.
  - **Lesson 4, 0 mA taken for zero:** "Common mistake. Taking 0 mA for a zero reading" (Dreiym,
    SECONDARY, notes 6.4). A trade site naming it. A DO screen: the display reads 0 mA.
  - **Lesson 4, forgetting the 4 mA:** "Forgetting to subtract the 4 mA before scaling" (Sparky Tools,
    SECONDARY, notes 6.4). A typed puzzle whose wrong answer is the one you get without it, with its
    own hint.
  - **Lesson 4, leads left in the mA jacks:** "Leaving the meter leads in the mA jacks and then
    measuring voltage — that is a short" (Sparky Tools, SECONDARY, notes 6.4). A DO screen on the meter.
  - **Lesson 4, opening a live loop:** "Opening a loop that is controlling a live process without
    warning anyone" (Sparky Tools, notes 6.4). Told as safety first, then a DO screen that asks what
    to do before breaking in.
  - **Lesson 4, two supplies in one loop and scaling that does not match:** "Two loop supplies in one
    loop" and "Scaling in the PLC not matching the range set in the transmitter" (Sparky Tools, notes
    6.4). One DO screen each.
  - **Lesson 5, the valve theory:** "estimated to be held by 25% to 50% of Americans" (Kempton, notes
    6.2), and found again in UK homes (Revell and Stanton, notes 6.2). A study. The opening puzzle.
  - **Lesson 5, lag and dead time as one thing:** two different definitions (ASHRAE, notes 4.1). A
    check, not a cited mistake. A DO screen: which trace has a dead time?
  - **Lesson 6, proportional reaches the set point:** "the output never reaches the reference" (Astrom
    and Murray, notes 4.2). A textbook. The opening puzzle.
  - **Lesson 6, more integral is always better:** "increasing the integral term too much can lead to
    an oscillating output" (Zurich Instruments, notes 4.2), and wind-up (Astrom and Murray, notes 4.2).
    A maker and a textbook. A prediction screen before the big step.
  - **Lesson 6, derivative fixes everything:** "high-frequency measurement noise will generate large
    variations in the control signal" (Astrom and Murray, notes 4.2). A DO screen with the noise on.
  - **Lesson 7, converting relays one for one:** "The most common mistake is converting the wiring
    one-to-one without considering the scan-based execution" (IMD, SECONDARY, notes 4.3). A trade
    site. A DO screen: two rungs that write the same output; which one wins at the end of the scan?
  - **Lesson 7, the seal-in in the wrong place:** "output's own contact in parallel with START"
    (PLC Practice, notes 4.3). The opening puzzle.
  - **Lesson 7, a Stop button wired normally open:** "the human operator loses control of the motor
    in the event of an "open" wiring failure" (Instrumentation Tools, SECONDARY, notes 4.3). A DO screen
    on the picture's cut wire.
  - **Lesson 8, testing a trip by moving its set point:** "An unacceptable test" (US Coast Guard, notes
    7.1). A regulator's guideline. A DO screen offers it beside creating the condition.
  - **Lesson 8, more sensors are always safer:** 1oo2 trips falsely "twice as high" (Kenexis, notes
    4.4). A maker's paper. A DO screen: which vote keeps the engine running through one false sensor?
  - **Lesson 8, a bypass is harmless for a short job:** "in most major accidents accidental or
    intentional bypassing are cited as key contributing factors" (Kenexis, notes 4.4). Told, then a DO
    screen on the picture with the bypass key in.
  - **Lesson 8, de-energise to trip covers every failure:** "contacts welded closed" is "a dangerous
    failure" (Kenexis, notes 6.4). A DO screen with a welded contact.
  - **Lesson 8, alarms are better the more there are:** "There were too many alarms and they were
    poorly prioritised" (HSE, notes 4.4). A regulator's finding. A DO screen on a flood.
  - **Not stated as common:** no source counts these, so they are taught as checks, not cited
    mistakes.
    - Treating range and span as the same thing when the range does not start at zero.
    - Reading 12 mA as half of the upper range value when the range starts above zero.
    - A physical normally closed Stop drawn in the ladder as a normally closed contact.
    - Thinking a thermostat's differential is a fault.
    - Thinking a trip and an alarm on the same reading are the same signal.
- **Size and cost.** 8 lessons of about 12 screens on the agreed settings (CLAUDE.md).
  - Generators and Electronics were estimated at 1.1M to 1.3M a lesson. The pictures here are of the
    same kind (a plant drawing linked to a trace, a table or a line), and lessons 6 and 8 run a small
    simulation each, so I estimate about 1.1M to 1.3M a lesson. The steps format with fewer words
    saves a little on the writing; the simulations take it back in the build.
  - That is about 9M to 10.5M for the course, plus about 0.3M for the plan. The research is done
    (191 quotes from 46 saved tool results).
  - The full process measured on Fractions lessons 4 to 8 was about 1.65M a lesson, about 13.2M for
    eight.
  - Each build's real cost is reported to you.
- **Lesson 1 first.** Lesson 1 is built and checked before the others (about 1.2M, plus the plan).
  Because you approved the build, the rest follow without waiting for you to try it.
- **Where the edges go.**
  - **Fault-finding: from symptom to cause** (same shelf, planned; its brief is in
    docs/courses/electrical/fault-finding). Its lesson 1 bench is a DOL starter's control circuit.
    This course gives the logic, the seal-in and the loop; Fault-finding finds the faults on them.
    Lesson 7 teaches no fault on a control circuit beyond the cut wire that shows why Stop is wired
    normally closed. Lesson 4 teaches the meter check on a healthy loop; a dead or noisy 4-20 mA loop,
    or an earth on a loop, would make a good Fault-finding bench, which I suggest it adds.
  - **Maintenance and condition monitoring** (same shelf, planned). This course stops at the alarm
    limit and the calibration check. Trends that catch a fault before the limit, calibration intervals
    and tracking drift between checks go there, building on Statistics lesson 4's drift or noise.
  - **One line here:** thermistors and temperature switches (lesson 2); capacitive transducers and
    turbine meters (lesson 3); 0-10 V and HART (lesson 4); the tuning methods and feed forward
    (lesson 6); the IEC 61131-3 languages and the PLC's transistor and relay outputs (lesson 7);
    alarm priorities (lesson 8).
  - **Left out:** Laplace transforms, transfer functions, Bode plots and stability margins (notes 2.1,
    5); tuning tables; cascade and ratio control; control valve characteristics and actuators beyond
    the valve as the final element (SQA's outcome 6, notes 1.4); process analysers and fire and gas
    detectors (SQA's outcome 5, notes 1.4, not in the notes' quotes); fieldbus and networks;
    pneumatic instruments; safety integrity levels and the safety standards' sums; and reactor
    instrumentation and protection, which this course never touches.
- **Gaps to close at build time.** None blocks the build.
  - **Lesson 1:** the definitions of transducer and transmitter are plain words, not quoted (notes 5);
    keep them as one screen of plain description. The 10 bar transmitter and its errors are example
    values.
  - **Lesson 2:** the 0.385 Ω a degree is from an exercise page (SECONDARY); the IEC 60751 and IEC
    60584 table values are UNCONFIRMED (notes 2.3). The straight-line rules for both sensors are the
    lesson's own and must say so on screen. The three-wire "difference between the leads" is a
    simplification of TI's statement, labelled. That a thermocouple reads the difference between its
    ends is my reading of Fluke's definition. Thermistors and switches are UNCONFIRMED.
  - **Lesson 3:** the strain-gauge and capacitive transducer lines and turbine meters are UNCONFIRMED
    (notes 2.4); the strain gauge is taught from R = ρL ÷ A, a rule you hold, and labelled. The oil's
    880 kg/m³ is an example value. Seawater's 1025 kg/m³ is Heat and fluids' figure. That a magnetic
    meter's reading is straight is my reading of the Faraday principle (notes 2.4).
  - **Lesson 4:** why a loop uses current (the same current everywhere in a series ring) is my
    reading, not quoted; keep it as the plain reason and let the picture show it. NAMUR NE 43 is
    quoted from a commissioning site (SECONDARY, notes 2.5). The typed puzzles' 12 V transmitter
    minimum and 80 Ω cable are example values.
  - **Lesson 5:** the 60 °C set point, 4 °C differential and 2 minute dead time are example values.
  - **Lesson 6:** the process inside the picture is an example model, labelled. Droop as proportional
    control is my reading, linking Generators lesson 4 to Eurotherm's offset; keep it to one line.
  - **Lesson 7:** a press shorter than one scan can be missed is my reading of IMD's "bounded by the
    scan period" (notes 4.3); the slowed scan says so. "Permissive" is UNCONFIRMED (notes 4.4). The
    on-delay timer and start counter are example uses, not a claim about any compressor.
  - **Lesson 8:** first-up (first-out) annunciation is UNCONFIRMED (notes 4.4); one short screen. The
    0.01 and 0.1 chances are example values, and the sums assume independent failures, which a shared
    supply or a shared tapping breaks (Statistics lesson 5's warning). The alarm and trip pressures
    are example values. An alarm versus a trip is drawn from the HSE briefing note and the SIS pages
    together (notes 4.4), not one quote.
  - **Apprenticeship lines:** the Level 3 standard's knowledge and skill lines, the Royal Navy naval
    engineering technician standard and the engineering technician (electrical or control and
    instrumentation) standard are UNCONFIRMED (notes 3.2). Makers' own handbooks (Rosemount, Yokogawa,
    ABB, Siemens, Rockwell) were not reached in a quotable form (notes, "Unconfirmed"). None is needed
    for a lesson.
  - **Nothing naval.** No naval or submarine source was used, nothing is said about any boat beyond
    the public outline in CLAUDE.md, reactor instrumentation and protection are never touched, and the
    SMQ books on your Drive were not read.
