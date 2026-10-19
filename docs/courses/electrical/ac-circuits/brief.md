# AC circuits: the course brief

Written 19 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
the first course on the new Electrical engineering shelf: "How alternating current behaves, from the
sine wave to three-phase power: rms, reactance, impedance, power factor and its correction, star and
delta. General principles that hold on any installation, ashore or afloat." No course comes before
it on the shelf. Transformers, Three-phase power systems at sea, Machines and drives, Instrumentation
and control, and Maintenance and fault-finding come after it. You asked for it on 19 Oct ("general
electrical AC, principles that are the same no matter where you go") and said to build it, so I
have taken the decisions for you and listed them below. Change any you like. Sources and quotes are
in `research-notes.md` beside this file (186 quotes, cut by script from the 44 saved tool results
and checked with `tools/eval/sources.mjs`, `ok: 186, failed: 0`). Section numbers below point there.

## The short version
**Ten lessons**
1. AC from a turning coil (built first)
2. Rms: the number on the label
3. Resistance in AC: power, moment by moment
4. Inductance: the coil that pushes back
5. Capacitance: the store that fills and empties
6. Series RL and RC: impedance you can measure
7. Series RLC and resonance
8. Real, reactive and apparent power
9. Power factor correction
10. Three-phase: star and delta

**The main pictures** (one per lesson, each moved with your finger, each showing the cause):
- **The turning coil (lesson 1).** A coil between two magnet poles, with the field lines drawn
  across. Drag the coil round or set it spinning. Beside it, the flux through the coil and the emf
  are traced against time. The emf peaks where the flux is changing fastest, not where it is
  largest. Spin it faster and the wave gets taller and shorter in time together.
- **The heater test (lesson 2).** Two identical heaters, one on an AC wave, one on a DC level you
  drag. Under each, the power wave and its average. Drag the DC level until the two heat bars
  match. It lands at 0.707 of the AC peak. Switch the wave to a triangle or a square and the match
  point moves.
- **The power scrubber (lesson 3).** A resistor's voltage wave and current wave, and their product
  drawn as the power wave. Drag a time cursor along. At each instant the two heights multiply into
  the power's height. The power wave never dips below zero and beats twice as fast.
- **The back-emf coil (lesson 4).** A coil on a supply whose frequency you drag. The current wave
  and the coil's voltage wave are drawn together, with a slope marker riding the current wave. The
  coil's voltage follows the steepness of the current, so it peaks a quarter cycle early. Raise the
  frequency and the current shrinks.
- **The filling tank (lesson 5).** A capacitor drawn as two plates filling with charge, beside its
  voltage wave and current wave. Current flows hardest while the voltage is changing fastest, at the
  zero crossing, and stops at the peak. Raise the frequency and more current flows.
- **Three meters, one triangle (lesson 6).** A resistor and a coil in series, three voltmeter
  readouts on them and on the supply. Below, the two part voltages are drawn as arrows at right
  angles. Their tips close a triangle whose long side is the supply reading. Swap the coil for a
  capacitor and the triangle flips below the line.
- **The frequency sweep (lesson 7).** R, L and C in series on a supply whose frequency you drag.
  The X_L and X_C arrows grow and shrink in opposite directions. A dot traces current against
  frequency. Bars for the coil's and capacitor's voltages rise past the supply bar near resonance,
  with a red warning.
- **The power slosh (lesson 8).** Voltage and current waves with an angle φ between them that you
  drag. Their product, the power wave, is shaded above the line (energy to the load) and below it
  (energy back to the supply). Its average is the real power. Beside it, the power triangle builds
  from those numbers.
- **The corrector (lesson 9).** A motor's power triangle with its reactive side pointing up. A
  slider adds capacitor kvar, drawn as an arrow pointing down. The supply's apparent power and its
  current bar shrink while the real power stays put. Push too far and the triangle swings below the
  line, leading, and the current grows again.
- **Star and delta (lesson 10).** Three windings and three loads, switchable between star and
  delta, with live phasor arrows for the phase and line voltages and currents. In star the voltage
  picks up the √3. In delta the current does. A neutral current arrow is the sum of the three phase
  currents. It is zero when they are balanced, and it grows when you unbalance one load.

**Decisions taken for you** (say if you want any changed):
- **Ten lessons, one per part of the scope.** The benchmarks spend six or seven chapters, or about
  90 pages, on exactly this ground (Kuphaldt, Hughes, Bird, notes 7). Ten lessons is about one a
  chapter, which leaves room to teach the cause and not just the formula. Resonance (lesson 7) is
  the least "trade" lesson (notes 7). Hughes, Bird, the HN units and Kuphaldt all keep it (notes
  1.2, 1.3, 2.1, 7), so it stays as a full lesson. If you want nine, it is the one to fold into
  lesson 6 as two screens.
- **No board's units. The common core instead.** You have no syllabus yet. Every general
  qualification the research reached puts the same core in the same order: single-phase quantities,
  the power triangle and power factor, correction with a parallel capacitor, then balanced
  three-phase in star and delta (BTEC, SQA, the MCA's ETO modules and City & Guilds, notes 2). The
  course is that core. When you get a syllabus, send it and I will check the course against it.
- **Lesson 1 is built first, then the rest without a pause.** The runbook asks for a pilot you try
  before the rest. You asked for the course to be built, so lesson 1 is built and checked first and
  the others follow without waiting. Try it on your phone as soon as it lands. If something is
  wrong, say so and the rest will be changed before they are built.
- **Steps lessons, with a little more explaining ("Partly", RUNBOOK section 0, item 3).** About 12
  screens each, SHOW then DO, ending on two or three mixed puzzles. SHOW screens may carry a short
  paragraph where an idea needs words: why a coil pushes back, why rms is about heat, why the power
  wave goes negative, why √3. Every lesson has one picture you move, and the words stay short where
  the picture carries it.
- **The maths you have is used, never taught again. The new part of each lesson is the cause and
  the circuit.** Four of your maths courses already touched this ground as maths: Calculus
  fundamentals lesson 10 (rms = peak ÷ √2), Trigonometry lessons 6 to 8 (circle to wave, three-phase
  √3, the power triangle), and Complex numbers lessons 7 and 8 (X_L, X_C, Z = R + jX, V = IZ). Here
  each of those gets a one-line reminder, and the lesson spends its screens on what made it true
  and what it does in a circuit. The lessons table says what each lesson reuses and what is new.
  Lessons 2, 6, 8 and 10 reuse the most, so their puzzles sit above the maths courses' puzzles (heat,
  meters, measuring a coil, generator ratings, line currents), never the same sums again.
- **The order follows Hughes and Bird: power after impedance.** The notes say the brief might move
  power factor and kVA to the front as a hook, because you know the words already (notes 7). I kept
  power after impedance (Hughes ch 12 after chs 9 to 11; Bird, notes 1.2, 1.3), because the power
  wave going negative in lesson 8 needs the quarter-cycle shifts of lessons 4 and 5 as its cause.
  Lesson 1's last screen names where the course is going, so the payoff is in sight from the start.
- **Cause first, formula second.** The notes find that the thing to teach inline is inductance and
  capacitance as "opposition to change", not any maths (notes 4). Inductors "oppose changes in
  current" and capacitors "oppose changes in voltage" (Kuphaldt, notes 3.4, 3.5). So lessons 4 and
  5 start from the coil pushing back and the plates filling, and X_L = 2πfL and X_C = 1/(2πfC) come
  after as the measure of it. Your trade gave you the words (C&G 2365 lists inductance, reactance and
  impedance, notes 2.2). It did not give you the phase picture (notes 4, 5.3).
- **"ELI the ICE man" is earned, not first.** OpenStax gives it as "a mnemonic device" (notes 3.5).
  The notes' reading is that it "should be earned, not first" (notes 5.3), so it comes on the last
  SHOW screen of lesson 5, after you have seen both causes.
- **Waves drawn at peak, phasor arrows at rms, said on every screen.** Complex numbers drew every
  arrow at rms, and Trigonometry named the two habits as contested (their briefs). This course keeps
  Complex numbers' choice for arrows. Waves are drawn at their real height, because lesson 2's point
  is that 230 V mains reaches about 325 V.
- **The phase angle is the angle by which voltage leads current.** "It is customary to use the
  angle by which the voltage leads the current", which makes it positive for a coil (HyperPhysics,
  notes 3.4, 5.3). Said once in lesson 4 and used throughout, so a capacitor's angle is negative, as
  in Kuphaldt's 50∠−36.87° (notes 3.6).
- **The resonant frequency is worked out, not handed over.** No saved page gives f0 = 1/(2π√(LC))
  as clean text (UNCONFIRMED as exact text, notes 3.7). The notes advise computing it "from that
  shown rule" (notes 3.7). So lesson 7 sets 2πfL = 1/(2πfC) and solves for f with the algebra you
  have, then checks it on Kuphaldt's 10 µF and 100 mH circuit: 159.15 Hz (computed; the same figure
  is on the saved page, tool 21).
- **Correction to a target, not always to 1.** Kuphaldt corrects to unity (notes 3.9) and warns
  against over-correcting (notes 3.9, 5.4). Lesson 9 also corrects the same load to 0.95 as an
  example target, with Q after = P tan φ from the triangle. The target is an example figure, not a
  claimed rule.
- **Sea facts are examples, labelled with their source.** The principles are the same everywhere.
  Where the course uses a ship figure it says where it comes from:
  - "The majority of ships have a 3 phase, 3 wire, 440V insulated neutral system" and 60 Hz is "the
    most common frequency adopted for use on board ship" (a marine college's notes, SECONDARY,
    notes 6.1).
  - The US Navy's 440 V 60 Hz system of the 1930s was run without a hull connection (IMarEST, notes
    6.1).
  - A US Navy destroyer study distributes at 6.9 kV with 450 V loads (MIT Sea Grant, notes 6.1).

  Royal Navy voltages and frequencies were not found (UNCONFIRMED, notes 6.3, 8), so no screen
  says what a Royal Navy ship uses.
- **Numbers are cited, computed on screen, or labelled as examples.** Cited worked figures are named
  with their source in the lessons table. Every value worked out from them is recomputed on screen
  from the rule shown. Every other voltage, coil, capacitor and load is an example figure, said so
  on screen.
- **Taught inline, because you have not met them** (notes 4): why a turning coil gives a sine;
  inductance and capacitance as opposition to change; lead and lag as cause and effect;
  instantaneous power; reactive power and the var; resonance; star and delta connections and the
  neutral.
- **Colour as before.** Ink for waves, arrows, circuits and controls. A second wave in a pair is
  dashed ink, not a new colour. Amber for key terms, teal for small labels (V, I, X_L, X_C, units,
  "line", "phase"). Red only for a mistake or a warning: lesson 7's voltages above the supply, and
  lesson 9's over-correction. Green only for finished. Lesson 8's shaded power areas are ink at two
  strengths, because energy going back is not a mistake.
- **Your intake answers** (`intake.json`): to understand ac circuits and how to work with them; on
  the job and in everyday life; hands-on, with the why explained in full.
- **Left for later courses, with a one-line look ahead where it fits** (notes 7):
  - **Transformers** (Transformers). Kuphaldt's chapter 9 and Bird's chapter 23 (notes 1.1, 1.3).
  - **Alternators: poles and speed, excitation, synchronising and load sharing** (Three-phase power
    systems at sea, and Machines and drives). Lesson 1 says a real alternator has more poles and
    turns slower, in one line. The pole arithmetic is the notes' own (notes 3.1), so it waits.
    Excitation moving the power factor (PEG-3722, notes 6.2) and "Synchronising using lamps,
    synchroscope and load sharing" (MCA, notes 6.2) go to Three-phase power systems at sea.
  - **Motors, and star-delta starting** (Machines and drives). Lesson 10 says star and delta are
    also how a motor's windings are connected, in one line.
  - **Insulated and earthed neutral systems, and earth fault detection** (Three-phase power systems
    at sea, and Maintenance and fault-finding). MCA ETO 3.13 and 3.15 (notes 2.4, 6.1). Lesson 10
    has one screen on a three-wire system with no neutral conductor (notes 6.1).
  - **Power factor capacitors on star and delta three-phase loads** (Three-phase power systems at
    sea). SQA's power systems unit sizes them separately (notes 2.3, 6.3).
  - **Unbalanced three-phase loads worked out** (Three-phase power systems at sea). MCA ETO 1.4
    (notes 2.4). Lesson 10 shows the neutral current grow when a load is unbalanced, with no sums.
  - **Harmonics, filters and mixed frequencies** (Instrumentation and control). Kuphaldt chapters 7
    and 8 (notes 1.1). Lesson 10 says in one line that balanced loads leave the neutral at zero only
    for sine-wave currents, because "triplen harmonic currents add within the neutral conductor"
    (Kuphaldt, notes 3.10).
  - **AC metering circuits** (Instrumentation and control). Kuphaldt chapter 12 (notes 1.1). Lesson
    2 keeps the one meter fact you need: an average-reading meter is right only on a sine (notes
    5.1).
- **Left out, not deferred:** parallel resonance and the tank circuit; Q and bandwidth as design
  numbers (Q appears only as "voltage across L or C is Q times" the supply, notes 3.7); AC bridges;
  network theorems in AC; susceptance and admittance; the R–L switch-on transient (MCA ETO 2.1,
  notes 2.4); the derivation of the coil's emf with calculus of sine. Parallel RL and RC circuits
  appear only as lesson 9's capacitor across a load, because Complex numbers lesson 8 did parallel
  branches.

## 1. The overall topic
Alternating current comes from a coil turning in a magnetic field. It pushes one way, then the
other, in a sine wave, fifty or sixty times a second. Its size is given as an rms value, the steady
DC that would heat the same resistor as much, which is why a 230 V supply peaks at about 325 V. A
resistor takes AC in step: current rises and falls with the voltage, and power always flows into it.
A coil and a capacitor do not. A coil pushes back against any change in its current, and a capacitor
fills and empties as its voltage changes. So their current runs a quarter cycle behind or ahead of
the voltage, and they oppose AC by a reactance that depends on frequency.

Put a resistor and a reactance in series and their voltages add as arrows, not as numbers: the
impedance triangle. Put a coil and a capacitor together and at one frequency their reactances
cancel: resonance, where the current peaks and the parts can carry more voltage than the supply.
Out of phase, the power wave goes negative for part of each cycle. Energy flows to the load and
back, so a supply must carry volt-amps it is not paid back in watts: real, reactive and apparent
power, and the power factor between them. A capacitor across an inductive load supplies that
sloshing energy locally and cuts the current in the cables. Last, three windings 120° apart give
three-phase. Connected in star or delta, they set which of voltage and current picks up the √3, and
balanced currents cancel in the neutral.

**It builds on:**
- **Your trade:** Ohm's law, DC power, series and parallel, mains as 230 V 50 Hz, three-phase as
  400/230 V, and the words inductance, capacitance, reactance, impedance and power factor. At L3
  you calculated X_L, X_C, Z, power factor and star and delta values, and you know a capacitor goes
  in parallel to correct power factor (C&G 2365 and 2366, the nearest published lines to your EAL
  units, notes 2.2). The EAL unit lines themselves are UNCONFIRMED (notes 2.2).
- **Trigonometry:** the arm and its wave, amplitude, period, frequency and ω = 2πf (lesson 6);
  adding waves as phasors, and three-phase √3 as the difference of two arrows (lesson 7); power
  factor as a cosine and the power triangle (lesson 8).
- **Complex numbers:** j as a quarter turn, the Argand diagram, polar form, Z = R + jX with +jX_L
  and −jX_C, V = IZ, and a capacitor across a coil cutting the supply current (lessons 1 to 8).
- **Calculus fundamentals:** a capacitor's i = C dv/dt and a coil's v = L di/dt (lesson 5); the
  mid-ordinate rule for an average (lesson 8); rms as the root of the mean of the squares, a ramp's
  rms as peak ÷ √3 and a sine's as peak ÷ √2, and form factor (lesson 10).
- **Powers and roots, Solving equations, Linear equations:** √2 and √3, and rearranging a formula
  for f, L or C.

**Not taught again:** Ohm's law and DC power; the sine wave's amplitude, period, frequency and ω;
how rms is calculated; j and complex arithmetic; adding arrows by parts; the cosine as adjacent ÷
hypotenuse; BS 7671 design and verification (cable sizing, voltage drop, earth fault loop
impedance, protective devices, inspection and test). Each is used with a one-line reminder, and
only what is new is taught.

**Edges.** Single-frequency sine-wave AC. Single-phase circuits of R, L and C in series, plus one
capacitor in parallel for correction. Balanced three-phase in star and delta. No transformers, no
machines, no harmonics, no unbalanced three-phase sums, no parallel resonance.

## 2. The lessons, in the order they build
The order is the benchmarks' shared order: waveforms and rms, then L, then C, then R, L and C
together, then resonance, then power and power factor, then three-phase (Kuphaldt, Hughes, Bird,
notes 1, 7). Three-phase comes last, after single-phase and complex numbers, as SQA recommends
(notes 2.3).

| # | Lesson | What it teaches |
|---|---|---|
| 1 | AC from a turning coil | "A generator with a single rectangular coil rotated at constant angular velocity in a uniform magnetic field produces an emf that varies sinusoidally in time" (OpenStax, notes 3.1). The emf comes from the flux through the coil changing: "a higher rate of change in the flux" gives a higher voltage (MSU, notes 3.1), so the emf peaks as the coil's sides cut straight across the field, where the flux through it is zero and changing fastest (my reading of MSU and Trigonometry lesson 6's arm; see the gaps). Trigonometry's turning arm is now a real shaft. The peak rises with "the area of the coil, the number of turns in the coil, the rotation frequency of the coil, and the magnetic field-strength" (farside, notes 3.1). So in a simple generator a faster turn raises the frequency and the voltage together. Peak, "also called the amplitude" (Kuphaldt, notes 3.1); peak-to-peak "is twice the peak" (WJEC revision, SECONDARY, notes 3.1). Period and frequency reused from Trigonometry, T = 1/f with OpenLearn's 200 Hz = 5 ms (notes 3.1): 50 Hz is 20 ms and 60 Hz is 16.7 ms (computed). Power stations' coils "rotate exactly sixty times a second" at 60 Hz, and Europe "and much of the rest of the world" uses 50 Hz (farside, notes 3.1). Ships commonly use 60 Hz (SECONDARY, notes 6.1). What alternates is the direction of the push and of the current, not a flow that travels round (the "identifying what is alternating" misconception, notes 5.3). One line: real alternators have more poles and turn slower (Machines and drives). Last screen: where the course goes. |
| 2 | Rms: the number on the label | Rms as "a 'DC equivalent'": "whatever magnitude of DC voltage or current would produce the same amount of heat energy dissipation through an equal resistance" (Kuphaldt, notes 3.2), so "10 volts AC RMS" heats a resistor like "a 10 volt DC power supply" (notes 3.2). The calculation is Calculus fundamentals lesson 10's, reminded in one line: "squaring ... averaging ... then taking the square root" (Kuphaldt, notes 3.2). For a sine it is "approximately 0.707 of its peak value", "the reciprocal of the square root of 2" (Kuphaldt, notes 3.2), and a triangle wave's is 0.577 (Kuphaldt, notes 3.2), Calculus's ramp at peak ÷ √3. So rms depends on the shape. "The average value of a sinewave is zero" (Kuphaldt, notes 3.2), so the plain average cannot measure heat. The average over a half cycle, 0.637 of peak, by the mid-ordinate rule from Calculus lesson 8, and form factor = rms ÷ mean = 1.11 (computed; BTEC lists "average values, form factor", notes 2.1). "Appliances and devices are commonly quoted with rms values" (OpenStax, notes 3.2): 230 V is rms, so the wave peaks at 230 × √2 = 325 V and the insulation sees that (WJEC revision, SECONDARY, notes 3.2; computed). A ship's 440 V peaks at 622 V (computed from the SECONDARY 440 V, notes 6.1). Meters: an analogue meter reads the average and is calibrated to show rms, and that calibration assumes "a sine wave" (Kuphaldt, notes 5.1). |
| 3 | Resistance in AC: power, moment by moment | In a resistor "the current through and the voltage across the resistor are in phase" (OpenStax, notes 3.3). Power at each instant is v × i, the power you know from DC worked moment by moment. "The waveform for power is always positive, never negative for this resistive circuit" (Kuphaldt, notes 3.3), and "its frequency is double that of either the voltage or current waveforms" (Kuphaldt, notes 3.3). Its average is half the peak power, which is V_rms × I_rms (computed from lesson 2's 0.707 × 0.707 = 0.5). "The heating effect produced by an AC current with a maximum value of I max is not the same as that of a DC current of the same value" (DePaul, notes 3.3). "The only real difference between DC and AC circuit calculations is in regard to power" (Kuphaldt, notes 4). Last screen: the power wave here never goes negative, and lessons 4 and 5 show what does. |
| 4 | Inductance: the coil that pushes back | Inductors "oppose changes in current through them, by dropping a voltage directly proportional to the rate of change of current", and by Lenz's law the induced voltage tries "to maintain current at its present value" (Kuphaldt, notes 3.4). "The current in the circuit is impeded by the back emf of the inductor" (DePaul, notes 3.4). This is Calculus lesson 5's v = L di/dt, now as a cause. A sine current changes fastest as it crosses zero, so the coil's voltage peaks a quarter cycle early: "the voltage 'leads' the current, and the current 'lags' behind the voltage" (Kuphaldt, notes 3.4). Faster AC means faster change and more back-emf, so reactance "is directly proportional to the frequency" (Kuphaldt, notes 3.4): X_L = 2πfL, reminded from Complex numbers lesson 7, with Kuphaldt's 10 mH table, 3.77 Ω at 60 Hz, 7.54 Ω at 120 Hz, 157 Ω at 2500 Hz (notes 3.4). C&G's 20 mH at 50 Hz is 6.28 Ω (C&G 2366 sample, notes 2.2; computed). At DC, f = 0, so X_L = 0 and an ohmmeter sees only the wire's resistance (computed from the rule). The power wave goes positive and negative in turn, and its average is zero: reactive loads "dissipate zero power" (Kuphaldt, notes 5.4; Hughes 12.3, "Power in a purely inductive circuit", notes 1.2). The phase angle is taken as the angle by which voltage leads current, positive for a coil (HyperPhysics, notes 3.4). |
| 5 | Capacitance: the store that fills and empties | "Capacitors oppose changes in voltage by drawing or supplying current as they charge or discharge to the new voltage level" (Kuphaldt, notes 3.5). Calculus lesson 5's i = C dv/dt as a cause: "the instantaneous current is zero whenever the instantaneous voltage is at a peak" and peaks where the voltage "crosses the zero line" (Kuphaldt, notes 3.5). So "the current 'leads' the voltage" (Kuphaldt, notes 3.5), and "the charge doesn't build up until after the current has been flowing for a while" (UNSW, notes 3.5). X_C = 1/(2πfC), reminded from Complex numbers lesson 7, "decreases with increasing frequency" (Kuphaldt, notes 3.5): 100 µF is 26.5 Ω at 60 Hz, 13.3 Ω at 120 Hz, 0.637 Ω at 2500 Hz (Kuphaldt, notes 3.5), and 31.8 Ω at 50 Hz (computed). At DC the current "is zero once the capacitor is charged", and at very high frequency "it acts like a simple wire" (OpenStax, notes 3.5). A capacitor is the coil's mirror image: "exactly opposite from that of inductive reactance" (Kuphaldt, notes 3.5; Matrix, SECONDARY, notes 5.2). Its power wave also averages zero. Last SHOW screen: "ELI the ICE man" as a memory aid, once both causes are seen (OpenStax, notes 3.5). |
| 6 | Series RL and RC: impedance you can measure | Voltmeters across a resistor and a coil in series read numbers that do not add up to the supply, because the two voltages are a quarter cycle apart. "A 6 volt source at 0° added to an 8 volt source at 90° results in 10 volts at a phase angle of 53.13°" (Kuphaldt, notes 3.6). Each part voltage is I times its R or X, so "the voltage phasor diagram can be replaced by a similar impedance diagram" (Kuphaldt, notes 3.6): the impedance triangle, Z = R + jX from Complex numbers lesson 7, now drawn from meter readings. "Impedance is a comprehensive expression of any and all forms of opposition", in ohms (Kuphaldt, notes 3.6), "a generalization of Ohm's Law" (Khan, notes 1.4). Kuphaldt's 5 Ω with 10 mH at 60 Hz: the current lags "only 37.016°" (notes 3.6), Z = 6.26∠37.02° (computed). His RC example, 40 − j30 = 50∠−36.87° (notes 3.6); with R and C the angle lies "between 0° and −90°" (Kuphaldt, notes 3.6). Measure an unknown coil: an ohmmeter gives R (lesson 4), a voltmeter and ammeter on AC give |Z|, Pythagoras gives X_L and then L (example figures: 6 Ω, 20 V and 2 A at 50 Hz gives 8 Ω and 25.5 mH, computed; the method is my reading, from the rules shown). Change the frequency and the triangle reshapes. Impedances "add in series, and they diminish in parallel" (Kuphaldt, notes 3.6). |
| 7 | Series RLC and resonance | Put R, L and C in series: X_L points up, X_C down, and the net reactance is their difference. C&G's 230 V 50 Hz circuit, 40 Ω, 50 mH and 60 µF (C&G 2366 sample, notes 2.2): X_L = 15.71 Ω, X_C = 53.05 Ω, Z = 54.72 Ω at −43.0°, I = 4.20 A (computed). Using the RL or RC formula on an RLC circuit, or C in place of X_C, are the examiners' slips (OCR, notes 5.2). Sweep the frequency: at one frequency "capacitive and inductive reactances equal" and "the total impedance drops to zero" for ideal parts (Kuphaldt, notes 3.7), so the current is greatest (DePaul, notes 3.7) and the circuit "is purely resistive, with the applied emf and current in phase" (OpenStax, notes 3.7). Find that frequency by setting 2πfL = 1/(2πfC) and solving for f (computed rule, notes 3.7): 10 µF and 100 mH give 159.15 Hz, and C&G's 50 mH and 60 µF give 91.9 Hz (computed). The resistance does not move it (Kuphaldt, notes 3.7). Below resonance the circuit "looks capacitive", above it inductive (Kuphaldt, notes 3.7). The warning: "it is possible to produce dangerously high voltage drops across the capacitor and the inductor" (Kuphaldt, notes 3.7). Kuphaldt's 1 V supply puts 100 V across each, which cancel, and that ratio is "the 'Q' factor" (notes 3.7). |
| 8 | Real, reactive and apparent power | Multiply lessons 4 and 5's out-of-step waves and the power wave dips below zero: energy goes to the load and comes back. The part that comes back "is called reactive power", in "Volt-Amps-Reactive (VAR)", symbol Q (Kuphaldt, notes 3.8). Reactive loads give "the deceptive impression that they actually do dissipate power" (Kuphaldt, notes 5.4). True power P in watts is what is used; apparent power S in VA is "the product of a circuit's voltage and current, without reference to phase angle" (Kuphaldt, notes 3.8), what a voltmeter and an ammeter would show "ignoring the phase difference" (LibreTexts, SECONDARY, notes 3.8). They form Trigonometry lesson 8's right triangle, "P = adjacent length, Q = opposite length, and S = hypotenuse length" (Kuphaldt, notes 3.8). Here it is built from a circuit: P = I²R, Q = I²X and S = I²|Z| for lesson 6's circuit, with magnitudes only, not "the 'real' or 'imaginary' portion of the current" (Kuphaldt, notes 5.4). Power factor = P ÷ S = cos φ (Kuphaldt, notes 3.8), lagging for inductive and leading for capacitive (Kuphaldt, notes 3.8). Why kVA: "the source must have sufficient capacity to provide the reactive power, and the distribution system must be large enough to distribute reactive power" (MTU, SECONDARY, notes 3.8). Alternators are rated "in terms of load current and voltage output, or kilovolt-ampere (kVA) output, at a specified frequency and power factor", so 100 kVA gives "a 80 kW load at 80 percent power factor" (marine college notes, SECONDARY, notes 3.8). A 60 Hz diesel set's data sheet: 630 kVA and 504 kW at power factor 0.8 (manufacturer, notes 3.8). Cables carry current, which follows S, not P (Kuphaldt, notes 3.8). |
| 9 | Power factor correction | You know the answer, "Install a capacitor in parallel with the load" (C&G 2366 mark scheme, notes 2.2). This lesson is the amount and the result. The capacitor draws "an equal and opposite amount of reactive power" (Kuphaldt, notes 3.9), so the triangle's reactive side shrinks while "the true power consumed by the load" does not change (Kuphaldt, notes 3.9). Keep P constant and connect in parallel (Rose-Hulman, notes 3.9). Size it from the triangle: Q_C = Q before − Q after, then X_C = V² ÷ Q_C, then C from lesson 5 (the notes' path, notes 3.9). Kuphaldt's practical load on 240 V: 1.5 kW drawing 9.615 A, so 2.308 kVA, power factor 0.65 and 1.754 kvar (notes 3.9; checked in notes 3.9). Correct it fully and the current falls to 6.25 A (Kuphaldt, notes 3.9), with "less heat losses in the circuit wiring" (notes 3.9). The capacitor is about 81 µF at 60 Hz (computed; the saved page rounds to 80 µF, tool 25, see the gaps). Correct to an example target of 0.95 instead: Q after = P tan φ = 0.49 kvar, so 1.26 kvar, about 58 µF, and 6.58 A (computed). "Too much capacitance ... will result in a low power factor just as well" (Kuphaldt, notes 3.9). Put it near the load, because "there is still circulating current between the capacitor and the inductive load" (Kuphaldt, notes 3.9). Motors are the usual inductive load (Matrix, SECONDARY, notes 3.9). |
| 10 | Three-phase: star and delta | Three windings 120° apart, and the √3 between line and phase voltage, reminded from Trigonometry lesson 7. "When we measure voltage and current in three-phase systems, we need to be specific as to where we're measuring" (Kuphaldt, notes 5.5). Line and phase defined (Kuphaldt, notes 3.10). Star: "line voltage is equal to phase voltage times the square root of 3, while line current is equal to phase current". Delta: "line voltage is equal to phase voltage, while line current is equal to phase current times the square root of 3" (Kuphaldt, notes 3.10). The delta √3 is the same arrow subtraction, now on currents (SQA, "Graphical methods using phasors", notes 3.10). Kuphaldt's 120 V a phase gives about 208 V between lines, 83.33 A and 10 kW a load (notes 3.10). Power: three phases' worth, 3 V_ph I_ph cos φ, becomes √3 V_L I_L cos φ in both star and delta (SQA's "Derivation of √3VLILcosφ from 3VPHIPHcosφ", notes 3.10); Kuphaldt's three loads give 30 kW by both (computed). The US Navy's 450 V delta load of 100 hp at 0.92 lagging (NAVSEA, notes 6.3): 74.6 kW, 81.1 kVA, 104 A a line and 60.1 A a phase (computed). In a balanced star load the neutral current is zero, because the three currents are "all the same magnitude and all shifted 120° apart" (Kuphaldt, notes 3.10), true for sine-wave currents only (notes 3.10). So a balanced load needs no neutral, and many ships run three wires with no neutral conductor (SECONDARY, notes 6.1). Star gives "the same amount of power with less line current" and delta "greater reliability in the event of winding failure" (Kuphaldt, notes 3.10). The last screens are a mixed set from the whole course, where you choose the tool first. |

## 3. Can it be taught mostly visually, through interaction?
**Partly** (RUNBOOK section 0, item 3). Every lesson is a steps lesson of about 12 screens, SHOW then
DO, ending on two or three mixed puzzles. SHOW screens can carry a short paragraph where the idea
needs words. Each lesson has one main picture you move with your finger, chosen because it shows the
cause, not just the answer. The research supports two design choices for all ten. Show the wave
against time and the arrow side by side: UNSW's AC pages use "Time and phasor animations" for
"Impedance, phase relations, resonance and RMS quantities" (notes 5.7). And have you predict before
you see: predict-observe-explain with simulations beat plain predict-observe-explain in one study,
and simulated circuits taught at least as well as real kit in another (notes 5.7). Neither study
was on AC, so these are design choices, not AC results (notes 5.7).

- **Lesson 1, the turning coil.** A rectangular coil between two poles, seen end-on, with the field
  lines drawn straight across. Drag the coil round by its edge, or tap play and set its speed. A
  shaded band shows the flux through the coil (most when it faces the field, none when edge-on).
  Two traces run against time on the right: the flux, and the emf. A marker on the flux trace shows
  its slope, and the emf's height follows that slope. Sliders for turns and field strength scale the
  emf's peak; the speed slider changes the height and the period together. A caliper on the emf
  trace reads peak, peak-to-peak and period. *Why:* the cause is the coil turning: "A generator with
  a single rectangular coil rotated at constant angular velocity in a uniform magnetic field
  produces an emf that varies sinusoidally" (OpenStax, notes 3.1), and the voltage grows with "a
  higher rate of change in the flux" (MSU, notes 3.1). Dragging the coil yourself shows that the
  peak comes edge-on, where the flux is zero, which a still drawing hides. The turns and field
  sliders are farside's four dials (notes 3.1). It is Trigonometry lesson 6's arm made into a real
  machine, so nothing about the sine is taught again. The direction arrows on the coil flip each
  half turn, for "identifying what is alternating" (notes 5.3).
- **Lesson 2, the heater test.** Two identical heater elements side by side. The left one is on an
  AC wave of a set peak. The right one is on a DC level you drag up and down. Under each is its
  power, drawn as a wave or a flat line, with its average as a dashed level, and a heat bar that
  fills by the average. Drag the DC level until the heat bars match; a readout gives DC ÷ AC peak,
  which settles at 0.707. A shape switch changes the AC to a triangle (0.577) or a square (1.0). A
  second card puts 230 V rms on the screen with the real wave reaching 325 V, and an analogue meter
  needle that reads right on the sine and wrong on the triangle. *Why:* rms is defined by heat,
  "whatever magnitude of DC voltage or current would produce the same amount of heat energy
  dissipation through an equal resistance" (Kuphaldt, notes 3.2), so matching the heat is the
  definition, done with your finger. The shape switch shows that 0.707 belongs to the sine (notes
  3.2), and the meter card shows why an average-reading meter "depends on an assumed waveshape"
  (Kuphaldt, notes 5.1). The maths of squaring and averaging stays in Calculus lesson 10.
- **Lesson 3, the power scrubber.** A resistor with its voltage wave and current wave drawn in
  step, and their product drawn underneath as the power wave. Drag a time cursor along. At the
  cursor, the voltage height and current height are read out and multiplied, and a dot lands on the
  power wave at their product. Both negative gives a positive power, so the dot never drops below
  the line. A flat dashed line marks the average, half the peak power, labelled V_rms × I_rms.
  *Why:* the two facts that matter are that the power wave is "always positive, never negative" and
  "double" the frequency (Kuphaldt, notes 3.3). Multiplying two heights by hand, one instant at a
  time, shows both causes (minus times minus, and two humps for every cycle). The same scrubber
  returns in lessons 4, 5 and 8, where the dot does go negative.
- **Lesson 4, the back-emf coil.** A coil on a supply, with a frequency slider and an inductance
  slider. The current wave and the coil's voltage wave share one axis, voltage dashed. A small
  tangent line rides the current wave as it plays, and the coil's voltage height is that tangent's
  steepness. Pause where the current crosses zero: the tangent is steepest and the voltage is at its
  peak. Raise the frequency with the supply voltage held fixed: the current wave shrinks, and the
  readout X_L = V ÷ I climbs in a straight line on a small graph of X_L against f. The scrubber from
  lesson 3 runs underneath, with the power dot going below the line half the time. *Why:* inductors
  "oppose changes in current through them, by dropping a voltage directly proportional to the rate
  of change of current" (Kuphaldt, notes 3.4), and the tangent line is that rate of change. The
  Indonesian study found students reading "voltage precedes current" off a graph without knowing
  why (notes 5.3), and the review names "interpreting characteristic phase behavior" (notes 5.3).
  So you see the cause make the lag, rather than reading the lag off a still picture. The straight
  X_L line is "directly proportional to the frequency" (Kuphaldt, notes 3.4).
- **Lesson 5, the filling tank.** A capacitor drawn as two plates with charge dots that pile up and
  drain away, on a supply with frequency and capacitance sliders. The voltage wave and current wave
  share one axis. The current is drawn as the flow arrow between the plates, and its size follows
  how fast the pile is changing. At the voltage peak the pile stops changing and the arrow vanishes.
  At the zero crossing it is largest. Raise the frequency and the arrow grows; the X_C readout falls
  on a small curve against f, beside lesson 4's straight line for comparison. *Why:* "capacitors
  oppose changes in voltage by drawing or supplying current as they charge or discharge" (Kuphaldt,
  notes 3.5), and the instantaneous current "is zero whenever the instantaneous voltage is at a
  peak" (notes 3.5). The plates are Matrix's bucket analogy, which it says "should be developed"
  (SECONDARY, notes 5.2), and UNSW's "the charge doesn't build up until after the current has been
  flowing for a while" (notes 3.5). Seeing it beside lesson 4's line shows the two as "mirror-images"
  (Matrix, SECONDARY, notes 5.2).
- **Lesson 6, three meters, one triangle.** A resistor and a coil in series on a supply, with three
  voltmeter readouts: across R, across L, across the supply. Under the circuit the two part voltages
  are drawn as arrows, V_R flat and V_L straight up, tip to tail. The arrow that closes the triangle
  is the supply voltage, and its length matches the third meter. A bar shows V_R + V_L added as
  plain numbers, longer than the supply, and crossed through. Drag R, L or the frequency and the
  triangle reshapes, with the angle φ read out. A switch divides every side by the current, and the
  same triangle relabels itself R, X_L and Z. A second switch swaps the coil for a capacitor and the
  triangle drops below the line. *Why:* Kuphaldt's 6 V and 8 V making 10 V (notes 3.6) is the
  surprise a meter gives, and "the voltage phasor diagram can be replaced by a similar impedance
  diagram" (Kuphaldt, notes 3.6) is the step from what you read to what Z is. It starts from what
  you would measure on the job, which Complex numbers did not. Matrix names knowing "the difference
  between resistance, inductive reactance, capacitive reactance and impedance" as the challenge
  (SECONDARY, notes 5.2), and the relabelled triangle shows all four on one drawing.
- **Lesson 7, the frequency sweep.** R, L and C in series on a supply whose frequency you drag along
  a log scale. The R arrow lies flat; X_L points up and X_C down, and their difference is the net
  reactance, so Z's arrow swings from below the line, through flat, to above. A dot traces current
  against frequency, building the resonance peak as you sweep. Three bars show the voltages across
  R, L and C beside the supply bar. Near resonance the L and C bars pass the supply bar and turn red
  with the warning. An R slider makes the peak sharper or flatter but does not move it. *Why:*
  resonance is X_L and X_C cancelling: "the two impedances cancel each other out" (Kuphaldt, notes
  3.7). Sweeping shows both reactances move at once, opposite ways, which a formula hides. The
  voltage bars are the hazard Kuphaldt warns of, "dangerously high voltage drops across the capacitor
  and the inductor" (notes 3.7), and the R slider shows "the resonant frequency of the circuit will
  be unaffected by the resistance" (Kuphaldt, notes 3.7). Hughes lists the same three readings: the
  resonant frequency, the current and the voltages (notes 1.2).
- **Lesson 8, the power slosh.** Lesson 3's scrubber with the current wave now draggable left and
  right, setting φ from 90° lagging to 90° leading. The power wave is shaded solid above the line
  (energy into the load) and pale below (energy back to the supply), and its average is drawn as a
  dashed level. At φ = 0 nothing goes back. At 90° the two shaded areas are equal and the average is
  zero. Beside it, the power triangle draws itself from three numbers: P from the average, S from
  V_rms × I_rms, and Q from the size of the slosh. A switch fixes P instead, and the current bar and
  S grow as φ opens. *Why:* a resistor's power is "never returned to the source as it is with reactive
  loads" (Kuphaldt, notes 3.3), and the "deceptive impression" is that reactive loads use power
  (notes 5.4). Seeing the shaded areas cancel answers that. Trigonometry lesson 8
  gave the triangle as geometry; here it comes out of the wave, so its sides have a cause. Hughes
  orders the chapter the same way, power in R, in L, in C, then power factor (notes 1.2).
- **Lesson 9, the corrector.** A motor drawn as a load with its power triangle: P along the floor,
  Q_L up, S the long side, and a current bar for the supply cable. A capacitor slider adds Q_C as an
  arrow pointing down from the tip of Q_L. The supply's triangle is what is left: S shortens, the
  angle closes, the power factor climbs, and the current bar falls, while P never moves. Push past
  the full Q_L and the triangle swings below the line, the readout says leading, and the current
  bar grows again, in red. A small circuit view shows the current going round the loop between the
  capacitor and the motor, while the supply cable carries less. *Why:* correction is "an equal and
  opposite amount of reactive power" (Kuphaldt, notes 3.9), which is an arrow pointing the other
  way. P staying put is the rule, "keep the real power constant" (Rose-Hulman, notes 3.9), and the
  overshoot is Kuphaldt's warning against over-correcting (notes 3.9). The loop view is "there is
  still circulating current between the capacitor and the inductive load" (Kuphaldt, notes 3.9),
  which is why the capacitor goes near the motor.
- **Lesson 10, star and delta.** Three windings drawn as a star or a triangle (a switch), feeding
  three equal loads, with readouts for line and phase voltage and current. Beside it, the phasor
  arrows: three phase arrows 120° apart, and the arrow you get by subtracting two of them, which is
  √3 as long. In star that subtraction is the line voltage. In delta the same subtraction is done on
  the currents and gives the line current. A neutral wire in star carries an arrow that is the sum of
  the three phase currents, nothing when balanced. Drag one load's size and the neutral arrow grows.
  A power readout shows 3 × V_ph × I_ph × cos φ and √3 × V_L × I_L × cos φ side by side, always
  equal. *Why:* SQA suggests deriving the star and delta relationships with phasors, "Graphical
  methods using phasors could be used" (notes 3.10), and Trigonometry lesson 7 already gave you the
  voltage subtraction, so the new part is the same move on currents. The neutral arrow shows the
  cause of "zero current through the neutral conductor": three currents "all the same magnitude and
  all shifted 120° apart" (Kuphaldt, notes 3.10). The equal power readouts are SQA's derivation
  (notes 3.10). The textbook's warning, "we need to be specific as to where we're measuring" (notes
  5.5), is why every readout is labelled line or phase.

## 4. What else
- **Benchmark (notes 1).**
  - **Kuphaldt, Lessons in Electric Circuits Volume II** (All About Circuits; read on ibiblio,
    because allaboutcircuits.com refused the fetch, notes 1.1). Chapters 1, 3, 4, 5, 6, 10 and 11 are
    this course's ground (notes 1.1). It puts power factor last, after polyphase (notes 1.1). Most of
    the course's quotes and worked figures come from it.
  - **Hughes, Electrical and Electronic Technology:** chapters 9 to 14, AC voltage and current,
    series, parallel, power, complex notation, resonance (notes 1.2). Its power chapter has "The
    practical importance of power factor" (notes 1.2). Its three-phase chapter is not in the excerpt
    (UNCONFIRMED, notes 1.2).
  - **Bird, Electrical Circuit Theory and Technology:** single-phase series and parallel AC,
    three-phase, then complex numbers applied, power, and series resonance (notes 1.3). Bird is
    written for BTEC National and City & Guilds technician courses, "a great revision for those on
    higher courses" (notes 1.3), which is your level now.
  - **Khan Academy and MIT OCW:** impedance from phasors and complex numbers from the start, but no
    star and delta and no kVA (notes 1.4).
  - **The Open University:** no AC module was found (UNCONFIRMED, notes 1.5). UNSW's Physclips stand
    in for animated AC (notes 1.5).
  - **Brilliant:** not in the research notes, so nothing is claimed for or against it (see the gaps).

  What they lack that you need: the kVA view of generators and cables, and three-phase power with
  the √3 derived. Kuphaldt and the physics courses do not rate machines; lessons 8 to 10 take that
  from the marine notes, the data sheet and the US Navy problems (notes 3.8, 6.2, 6.3).
- **His aim (notes 2).** You are on the Royal Navy's electrical engineering path, with no syllabus
  yet, so the course is weighted to what every qualification shares (notes 2, "My reading").
  - **Pearson BTEC Level 3 Unit 56:** "waveform characteristics ... peak/peak-to-peak, root mean
    square (rms), average values, form factor" and "reactance and impedance of pure R, L and C
    components" (notes 2.1). **BTEC HN 4019 (Level 4):** "Reactance, impedance, resonance ... Active
    power, reactive power ... power factor ... introduction to three phase power systems" (notes
    2.1).
  - **SQA Single Phase and Three Phase Principles:** single-phase problems, "a capacitor in parallel
    across a R-L series circuit", three-phase generation and line and phase, and balanced loads
    (notes 2.3). **SQA HN Three Phase Systems:** the √3 V_L I_L cos φ derivation and star and delta
    relationships (notes 2.3).
  - **MCA ETO "DC and AC Principles":** RLC by complex notation, phasor diagrams, "apparent, active
    and reactive powers and power factor" (notes 2.4). **MCA ETO "Electrical Motors and
    Generators":** "Balanced star and delta connected loads", "Power factor", "Phasor diagrams",
    "Marine three phase systems" (notes 2.4). These are ETO lines from a 2023 syllabus review; the
    engineer officer syllabus itself is UNCONFIRMED (notes 2.4).
  - **Royal Navy courses:** the officer course names "ship electrical systems" and "AC generation &
    distribution", the POET(ME) generation course "Alternator maintenance", and the weapon
    engineering technician course "Basic electrical principles" (notes 2.4). No RN page names AC
    topics at the level of reactance or power factor (UNCONFIRMED, notes 2.4).
- **Starting point (notes 2.2, 4).** At L3 you have calculated X_L, X_C, Z, power factor and star
  and delta values, with correction by a parallel capacitor as a recall answer (C&G 2365 and 2366,
  the nearest published lines, notes 2.2). The notes found no L3 line for resonance, for sizing kvar,
  or for deriving the √3 power formula (notes 2.2, "My reading"). So the course pitches its puzzles
  there: the cause behind each number you have used, then resonance, sizing, and the three-phase
  derivation. Examples come from the job where they fit: a heater and the 325 V peak (lesson 2),
  measuring a coil (lesson 6), a motor's power factor (lesson 9), a generator's kVA plate (lesson 8).
- **Where it is used (each cited before a lesson uses it).**
  - **The turning coil (1):** generators (OpenStax, farside, notes 3.1). Mains at 50 Hz and 60 Hz
    (farside, notes 3.1); ships commonly at 60 Hz (SECONDARY, notes 6.1). RN alternator maintenance
    (POET(ME), notes 2.4). BTEC Unit 56's waveform characteristics (notes 2.1).
  - **Rms (2):** appliances quoted in rms (OpenStax, notes 3.2). UK mains 230 V rms, about 325 V
    peak (SECONDARY, notes 3.2). Meters calibrated for a sine (Kuphaldt, notes 5.1). BTEC Unit 56's
    rms, average and form factor (notes 2.1).
  - **Resistance and power (3):** resistive loads always take power (Kuphaldt, notes 3.3). BTEC's
    "instantaneous" values (notes 2.1).
  - **Inductance (4):** C&G's 20 mH at 50 Hz (notes 2.2). C&G 2365's range, inductance and
    inductive reactance (notes 2.2). Motors as inductive loads (Matrix, SECONDARY, notes 3.9).
  - **Capacitance (5):** C&G 2365's capacitance and capacitive reactance (notes 2.2). Correction
    capacitors (Kuphaldt, notes 3.9; Matrix, SECONDARY, notes 3.9).
  - **Series RL and RC (6):** MCA ETO 2.2 and 2.3, impedance and phasor diagrams by complex notation
    (notes 2.4). SQA HN DC and AC Principles (notes 2.3).
  - **Resonance (7):** C&G's RLC circuit (notes 2.2). BTEC HN 4019's "resonance, bandwidth, quality
    factor" (notes 2.1). Hughes chapter 14 and Bird chapter 31 (notes 1.2, 1.3). Component voltage
    ratings at resonance (Kuphaldt, notes 3.7). A ship use of resonance was not found (UNCONFIRMED,
    notes 6.3), so no screen claims one.
  - **Power (8):** alternators rated in kVA at a power factor (marine college notes, SECONDARY,
    notes 3.8, 6.2). The 630 kVA, 504 kW set (manufacturer data sheet, notes 3.8). MCA ETO 2.4
    (notes 2.4). The Hong Kong Class 1 paper's alternators sharing 210 kW at 0.75 lagging (notes
    2.4), named as where this leads, not worked (load sharing waits for Three-phase power systems at
    sea).
  - **Correction (9):** SQA's capacitor across an R-L circuit (notes 2.3). C&G's mark scheme (notes
    2.2). Motors with added capacitors (Matrix, SECONDARY, notes 3.9).
  - **Three-phase (10):** C&G 2365's star and delta values (notes 2.2). SQA HN Three Phase Systems
    (notes 2.3). MCA ETO "Balanced star and delta connected loads" (notes 2.4). NAVSEA's 450 V
    generator and 100 hp delta load (notes 5.5, 6.3). Ships' 440 V three-wire insulated neutral
    (SECONDARY, notes 6.1).
- **The mistakes to catch, each with a puzzle and its own hint.** The notes say plainly that the
  AC-specific research reached is thin: one classroom study, one review, examiner reports, and
  revision sites (notes 5). Each mistake below is marked with how strong its source is.
  - **Lesson 1, what alternates:** "Identifying what is alternating" is one of the two AC
    misconceptions in the systematic review (ASEE, notes 5.3). A DO screen asks what changes
    direction each half turn.
  - **Lesson 2, the conversion the wrong way round:** "Many candidates made the error of putting the
    entire 2 V RMS under the square root sign when calculating the peak voltage" (NZQA examiners,
    notes 5.1). "A common error is to multiply by √2 instead of dividing" (WJEC revision, SECONDARY,
    notes 5.1). The notes' reading: "the failure is working the conversion the wrong way round"
    (notes 5.1). A DO screen asks for the peak of 230 V and offers 163 V.
  - **Lesson 2, rms as the average:** "Misconception: The RMS voltage is the average voltage over a
    cycle" (WJEC revision, SECONDARY, notes 5.1). The heater test's average line answers it.
  - **Lesson 2, peak as the mains figure:** "Misconception: Peak voltage is the same as mains
    voltage" (WJEC revision, SECONDARY, notes 3.2). A prediction screen asks whether 230 V is the
    top of the wave.
  - **Lessons 3 and 8, peak in a power sum:** "Confusing peak values with rms values in power
    calculations" (WJEC revision, SECONDARY, notes 5.1). A DO screen offers V_peak × I_peak as the
    heater's power.
  - **Lessons 4 and 5, lead and lag:** the Indonesian study's commonest wrong answer was "voltage
    precedes current with phase difference π", from misreading the graph (192 students, notes 5.3).
    The review names "Interpreting characteristic phase behavior" (ASEE, notes 5.3). "Incorrectly
    identifying the phase relationship (lag vs lead) for inductors and capacitors" (WJEC revision,
    SECONDARY, notes 5.3). Each lesson has a DO screen where you say which wave leads and why, and
    lesson 5 has one where the coil's answer is the wrong one.
  - **Lessons 5 and 7, C in place of X_C:** "a significant number of candidates substituted the
    value for C into the equation rather than X C" (OCR examiners, notes 5.2). A DO screen offers
    the answer you get by putting 60 µF in as ohms.
  - **Lesson 6, four kinds of ohm:** the challenge is knowing "the difference between resistance,
    inductive reactance, capacitive reactance and impedance" (Matrix teacher guide, SECONDARY, notes
    5.2). A DO screen gives four readings and asks which is which.
  - **Lesson 7, the wrong formula:** "the most common error being using the RL or RC formula instead
    of RLC" (OCR examiners, notes 5.2). The C&G circuit is a DO screen whose wrong answer is that
    slip.
  - **Lesson 8, reactive power as used power:** reactive loads give "the deceptive impression that
    they actually do dissipate power" (Kuphaldt, notes 5.4). A textbook caution, not a study. A
    prediction screen asks how much heat a perfect coil gives off.
  - **Lesson 8, parts in place of sizes:** use "polar magnitudes, not ... real or imaginary
    rectangular components" (Kuphaldt, notes 5.4). A textbook caution. A DO screen offers the power
    worked from the real part of the current.
  - **Lesson 9, over-correcting:** "You must be careful not to over-correct" (Kuphaldt, notes 3.9,
    5.4). A textbook caution. The corrector's overshoot is the puzzle.
  - **Lesson 9, correction changes the real power:** the correction "will not change the amount of
    true power" (Kuphaldt, notes 5.4). A DO screen asks what the heater part of the motor now takes.
  - **Lesson 10, line or phase:** "we need to be specific as to where we're measuring" (Kuphaldt,
    notes 5.5). No research on star and delta mistakes was found (UNCONFIRMED, notes 5.5). NAVSEA
    sets exactly this as a test item, the phase voltage of a 450 V wye and a 450 V delta generator
    (notes 5.5). Both are DO screens. Trigonometry lesson 7 already caught "line = 2 × phase".
  - **Not stated as common:** no source counts these, so they are taught as checks (look at the
    picture, put the answer back, add as arrows), not as cited mistakes (notes 3.6, 5.4).
    - Adding series voltages as plain numbers.
    - Power factor read as an efficiency.
    - Adding VA and watts.
    - A capacitor in series to correct power factor.
    - Correcting past 1 and not noticing the leading power factor.
    - Mixing up period and frequency.
- **Size and cost.** 10 lessons of about 12 screens on the agreed settings (CLAUDE.md).
  - The last measured courses ran about 0.99M to 1.14M tokens a lesson
    (docs/plans/foundational-maths-roadmap.md). The pictures here are animated waves with a linked
    circuit, arrows and triangles, close to Trigonometry's and Complex numbers', so I estimate about
    1.1M to 1.25M a lesson.
  - That is about 11M to 12.5M for the course, plus about 0.3M for the plan. The research is done
    (186 quotes from 44 saved tool results).
  - The full process measured on Fractions lessons 4 to 8 was about 1.65M a lesson, about 16.5M for
    ten.
  - Each build's real cost is reported to you.
- **Lesson 1 first.** Lesson 1 is built and checked before the others (about 1.2M, plus the plan).
  Because you asked for the course to be built, the rest follow without waiting for you to try it.
- **Gaps to close at build time.** None blocks the build.
  - **Brilliant** is not in the notes. The research stage should look for a Brilliant AC course
    and note what it adds, or say there is none.
  - **Lesson 1:** that the emf peaks when the coil is edge-on to the field (flux zero) is the
    notes' reading of MSU's "rate of change in the flux", not a quote (notes 3.1). The research
    stage must cite a page that says it before the lesson states it. Peak-to-peak is only from a
    revision site (SECONDARY, notes 3.1). The pole and speed arithmetic is the notes' own (notes 3.1)
    and is left to Machines and drives.
  - **Lesson 2:** the half-cycle average 0.637 and form factor 1.11 are computed (mid-ordinate rule,
    rms ÷ mean), not quoted. BTEC names them (notes 2.1); cite a value before the lesson states it.
    230 V rms and its 325 V peak are from a revision site (SECONDARY, notes 3.2); the lesson computes
    325 V from 230 × √2 on screen.
  - **Lesson 3:** average power = V_rms × I_rms for a resistor is computed from lesson 2, not quoted.
  - **Lesson 7:** f0 = 1/(2π√(LC)) is UNCONFIRMED as exact text (notes 3.7, 8) and is derived on
    screen. Kuphaldt's 159.155 Hz is on the saved page (tool 21) but not in `quotes.json`; add the
    quote, or keep it as computed.
  - **Lesson 9:** Kuphaldt's practical example is at 60 Hz with an 80 µF capacitor (rounded) giving
    1.737 kvar, all on the saved page (tool 25) but not in `quotes.json`. Add those quotes before the
    lesson names the frequency or the 80 µF. The 0.95 target is an example figure.
  - **Lesson 10:** no research on star and delta mistakes (UNCONFIRMED, notes 5.5). Royal Navy ship
    voltage and frequency (UNCONFIRMED, notes 6.3, 8); the ship examples are US Navy, a marine college
    and a data sheet, each named on screen.
  - **Reactive power and power factor mistakes:** a ShanghaiTech slide on "Reactive power:
    conceptions" came up but its text did not (UNCONFIRMED, notes 5). The mistakes in lessons 8 and 9
    are therefore textbook cautions and checks, said so.
  - **Your EAL units and the MCA engineer officer syllabus** were not reachable (UNCONFIRMED, notes
    2.2, 2.4). When you have your syllabus, the course is checked against it.
