# Electronics and power electronics: the course brief

Written 26 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
the second course in the Electrical shelf's Electrical principles folder: "Diodes, transistors and
the converters built from them: rectifiers, inverters and what is inside a drive or a UPS." AC
circuits comes before it (built) and Transformers after it (planned). You chose this course on 25 Oct
and approved the build, so I have taken the decisions for you and listed them below. Change any you
like. Sources and quotes are in `research-notes.md` beside this file (195 quotes, cut by script from
the 54 saved tool results and checked with `tools/eval/sources.mjs`, `failed: 0`). Section numbers
below point there.

## The short version
**Eight lessons**
1. The diode: a one-way valve (built first)
2. Rectifiers: AC in, DC out
3. Smoothing and the DC link
4. The transistor as a switch
5. The thyristor and phase control
6. Chopping DC: buck and boost
7. Inverting: building AC from DC
8. Living with power electronics

**The main pictures** (one per lesson, each moved with your finger, each showing the cause):
- **The junction and the meter (lesson 1).** A diode drawn as its P side full of holes and its N
  side full of free electrons, with the thin empty zone between them. Drag the voltage across it.
  Forward, the zone squeezes thin and carriers pour across once you pass about 0.7 V. Reverse, the
  zone widens and nothing flows, until breakdown in red. A dot rides the diode's current-voltage
  curve as you drag. Swap to a multimeter on its diode range, red lead on either end.
- **The rectifier bench (lesson 2).** One supply, three rectifiers on a switch: half-wave, bridge,
  three-phase six-pulse. Drag a time cursor through the cycle. The diodes that conduct carry a bold
  ink path, and the current through the load always points the same way. The output builds under
  the cursor with its average line drawn from area ÷ length. A probe on one blocked diode reads its
  reverse voltage, which peaks at the PIV.
- **The reservoir (lesson 3).** Lesson 2's bridge feeding a capacitor and a load. Drag the
  capacitance and the load. The capacitor tops up in short gulps near each peak and drains in
  between, and the ripple readout follows I ÷ (f × C). A "switch on" button charges it from flat:
  straight on, the first current spikes off the scale in red; through a precharge resistor, the bus
  climbs the RC curve and the contactor closes after five time constants.
- **The switch and its heat (lesson 4).** A transistor switching a load, with a gate slider from off
  through half to fully on. A heat bar shows the watts in the switch and a thermometer the junction
  rise through the heat sink. Half on, the heat peaks. A switching mode adds a burst of heat at every
  edge, so the heat climbs with frequency. A load switch makes it a coil: open the switch and a red
  spike of hundreds of volts, unless you tick the freewheeling diode.
- **The firing angle (lesson 5).** A sine supply, a thyristor and a heater. Drag the firing angle.
  The gate pulse fires it, it stays on with the gate gone, and it drops out at the zero. The part of
  each half cycle that conducts is shaded and the average is computed from it. Switch to a triac and
  both halves are chopped; switch to a controlled bridge on a battery and the charger's output
  falls as you fire later, while the supply current slides behind the voltage.
- **The balancing inductor (lesson 6).** A buck converter: switch, diode, inductor, capacitor, load.
  Drag the duty cycle. The inductor's voltage is drawn above and below the line, the switch-on area
  and the switch-off area shaded. They must balance, so the output moves until they do, and settles
  at D × Vin. The inductor current ramps up and down beneath. A switch rearranges the same parts
  into a boost.
- **Sine from pulses (lesson 7).** An H-bridge with a sine reference and a triangle carrier. Where
  the sine is above the triangle a leg's top switch is on. The output is pulses, the motor current
  through its inductance is a near-sine, and its local average follows the reference. Drag the
  reference's height and frequency, then the carrier's frequency. A dead-time slider: zero, and the
  leg shorts the bus in red; too long, and the sine flattens at its zeros. A switch adds the third leg.
- **The six-pulse current taken apart (lesson 8).** The current one line of a six-pulse rectifier
  draws, as blocks. Tick on the fundamental, then the 5th, 7th, 11th and 13th, and watch the sum of
  sines build the blocks, with THD computed live. A second card shows the leakage paths: a drive's
  filter capacitors to earth on an earthed supply, where an RCD sees them, and on an insulated one,
  where the insulation monitor does.

### Decisions taken for you (say if you want any changed)
- **Eight lessons, one per part of the scope, in your order.** Every course the research reached
  puts the diode and rectifier first and the transistor second (All About Circuits, Hughes, Bird,
  Electronics Tutorials, notes 2). Only the MCA syllabus takes it into choppers, inverters and PWM,
  and its two power electronics templates map onto the eight parts one or two outcomes each (notes
  3.2, 8). Lesson 8 is the fullest. If you want nine, it splits into harmonics, and earth and safety.
  If you want seven, lesson 5 is the one to trim, since the triac and the thyristor bridge are the
  least used afloat in what was found (notes 8, a guess).
- **Lesson 1 is built first, then the rest without a pause.** You approved the build, so the others
  follow without waiting. Try lesson 1 on your phone as soon as it lands; if something is wrong, the
  rest will be changed before they are built.
- **Steps lessons, with a little more explaining ("Partly", RUNBOOK section 0, item 3).** About 12
  screens each, SHOW then DO, ending on two or three mixed puzzles. SHOW screens may carry a short
  paragraph, at most about 90 words (your 21 Oct note on Motors lesson 1). Every lesson has one
  picture you move, and it asks you to predict before you play (section 3).
- **A recall opener only where an earlier course carries the lesson:** lesson 2 (AC circuits lesson
  2, the 325 V peak), lesson 3 (Exponentials lesson 3, five time constants), lesson 5 (Motors lesson
  2, the DOL's starting current), lesson 7 (Motors lesson 3, 200 V at 25 Hz) and lesson 8 (AC circuits
  lesson 10, the neutral current). A right answer says "Still there" and carries on.
- **Inside the drive's blocks, never the blocks again.** Motors lesson 3 taught the drive's three
  blocks, V/f, the 540 V bus, the trip list, the discharge drill and disconnecting the drive before
  an insulation test. None of that is taught again. This course opens each block: the rectifier
  (lesson 2), the DC bus (3), the switches (4), the inverter (7). Lesson 7's recall question is
  Motors' own 200 V at 25 Hz, and the lesson shows how the inverter makes it.
- **The 540 V and the 566 V are both right.** Motors lesson 3 used 400 × 1.35 = 540 V. Lesson 2
  derives the 1.35 from the waveform, 3√2 ÷ π (notes 4.2). Lesson 3 shows that with a capacitor and
  little load the bus rises towards the peak, 400 × 1.414 = 566 V, the figure a maker's fault guide
  says to measure at no load (SECONDARY, notes 4.2). Each figure is taught with its condition.
- **Holes and electrons in four pictures, no band theory** (notes 4.1). A freed electron leaves a
  hole; holes move because electrons move the other way; the two sides pair off at the junction;
  pushing one way thins the empty zone and the other way widens it. That is enough for forward drop,
  reverse blocking and breakdown.
- **The diode's 0.7 V is never idealised away** (notes 4.1). You will meet it on the bench and as a
  loss in every converter. Lesson 2 shows why it matters on a low-voltage charger and not on 230 V.
- **Numbers are cited, computed on screen, or labelled as examples.** The rectifier averages are
  computed as area ÷ length, as Calculus fundamentals lesson 10 taught. Four results have no clean
  quote, because the pages print them as images: the ripple rule, the boost rule, the three-phase
  bridge's PIV and the phase-control averages (UNCONFIRMED, notes 9). Each is derived on screen from
  a rule you already have (i = C dv/dt, the inductor's zero average, the waveform, the integral).
- **One source error is not copied.** Electronics Tutorials gives a fully controlled bridge's range
  as Vmax ÷ π to −Vmax ÷ π. That is half the right size: at zero firing angle it must equal the
  diode bridge's 2Vmax ÷ π (notes 4.5). The interactive computes it; the page is not quoted for it.
- **The firing-angle picture uses a resistive load.** Then half and fully controlled bridges give
  the same average, (Vmax ÷ π)(1 + cos α), and the shaded area shows why. The inductive load, the
  2Vmax cos α ÷ π rule and power flowing back past 90° are one SHOW screen (ET, MCA 3.6, notes 3.2,
  4.5), named so you know them, not played.
- **Harmonics are taught here, inline.** The AC circuits brief deferred "Harmonics, filters and mixed
  frequencies" to Instrumentation and control. That course is now sensors, op-amps, 4-20 mA loops
  and PLCs, and the notes flag that lesson 8 must teach the 5th and 7th itself (notes 5). So lesson 8
  teaches harmonics as a sum of sines, the six-pulse set and THD. Filter design and power quality on
  a switchboard go to Three-phase power systems at sea, where SQA's power and drives unit puts
  "harmonic filtering" (notes 3.3). Where it goes is my guess.
- **An insulated system gets one line, inline.** Insulated and earthed neutrals and earth fault
  detection are Three-phase power systems at sea (its blurb). Lesson 8 says only what you need to
  see what a drive does on one: no deliberate path to earth, so a first fault draws little current,
  and an insulation monitor watches the whole connected circuit (notes 4.8).
- **RCD types are linked to BS 7671, never reproduced.** You hold the 18th Edition, so lesson 8 names
  Regulation 531.3.3 and Amendment 2's limit on Type AC (notes 4.8) and gives no tables. That BS 7671
  itself names drives for Type B is UNCONFIRMED (notes 4.8, 9). So Type B is taught as the makers'
  requirement, Schneider's and Yaskawa's, and said so.
- **AC to DC and battery charging carry the examples** (CLAUDE.md). Lesson 2's diode drops on a
  charger, lesson 3's ripple heating a battery, lesson 5's thyristor charger with constant current,
  then constant voltage, then float, and lesson 6's buck from a battery. Hydrogen is taught from a
  general safety source (CCOHS, notes 4.5). Nothing about any boat's battery, ventilation or limits.
  A public case study mentioning a submarine's hydrogen limit came up and is not used (notes 4.5).
- **Examples are public, general equipment.** Drives, a UPS, battery chargers, soft starters, a
  shore supply converter. The 440 V examples use the 440 V of the public outline in CLAUDE.md. Where a
  frequency is needed they use 50 Hz, and 60 Hz as AC circuits did for ships, as an example, never a
  claim about any boat.
- **No single discharge wait is taught as the number to trust.** Makers say 5 minutes (ABB,
  Rockwell), 15 minutes (Vacon) and "the listed discharge time" (Danfoss), all with "wait, then
  measure" (notes 4.3). Lesson 8 shows why the time is the drive's own: its R and C set the curve.
- **Named, not taught** (the MCA lines beyond a foundations course, notes 3): the GTO thyristor, the
  diac, smart power devices, cycloconverters, current-source inverters, four-quadrant operation,
  and the phase-shifting transformers behind 12 and 18-pulse rectifiers (Transformers). Lesson 6
  names the brake chopper from Motors lesson 3 in one line, as a chopper into a resistor.
- **Colour as before.** Ink for circuits, waves and controls; a conducting path is bold ink and a
  blocked one pale ink, never a new colour. Amber for key terms, teal for small labels (V, I, D, α,
  units, "line", "phase"). Red only for warnings and mistakes: breakdown, the inrush spike, the
  kickback spike, shoot-through, a charged bus, the wrong RCD. Green only for finished.
- **Your intake answers** (`intake.json`): to understand electronics and power electronics and how
  to work with them; on the job and in everyday life; hands-on, with the why explained in full.
- **What the Statistics brief left for this course goes on.** It left "noise and tolerance in
  electronic circuits, and the decibel and signal-to-noise ideas" here. They belong with signals and
  sensors, so they move on to Instrumentation and control.

## 1. The overall topic
Power electronics turns electrical energy from one form into another with switches that are fully
on or fully off. The first switch is the diode, a one-way valve for current. Silicon doped two ways
meets at a junction that lets current through one way, for a small drop of about 0.7 V, and blocks
it the other way up to a rated reverse voltage. Diodes in a bridge turn AC into DC that pulses; a
capacitor stores it and smooths it, which is the DC bus inside every drive and UPS. Switches you can
turn on and off at will, the MOSFET and the IGBT, chop that DC. Fully on or fully off they waste
little; half on they cook, so they switch hard and fast, and every switching costs a little heat
that a heat sink carries away. A thyristor is a diode with a gate: fire it late in each half cycle
and a rectifier gives less DC, which is how battery chargers, soft starters and dimmers work. Chop
DC and smooth it with an inductor and a capacitor, and you get a lower or a higher DC: the buck and
the boost. Chop it with a bridge whose duty cycle follows a sine, and you get AC at any voltage and
frequency: the inverter inside a drive, a UPS and a shore supply converter. Last, living with it.
Rectifiers draw current in blocks, which is the 5th and 7th harmonics. DC-link capacitors stay
charged after isolation. Drive filters leak current to earth, which decides the RCD on an earthed
supply and what the insulation monitor sees on an insulated one.

**It builds on:**
- **Your trade:** semiconductors as parts you fit and test, the multimeter's diode range, DC
  relays and contactor coils, RCD types and BS 7671's selection rules (18th Edition, Design and
  verification), and safe isolation.
- **AC circuits:** rms and the 325 V peak of 230 V, and the half-cycle average 0.637 (lesson 2); a
  coil keeps its current going and pushes back (lesson 4); a capacitor's X_C falls as frequency rises
  (lesson 5); power factor and a current shifted from its voltage (lesson 8); three-phase line
  voltages, √3, and the neutral current that cancels for sine waves, with triplen harmonics as the
  exception (lesson 10).
- **Motors:** the DOL's 6 to 8 times starting current (lesson 2); the drive's blocks, V/f, the
  540 V bus, its trips and its discharge drill (lesson 3).
- **Calculus fundamentals:** i = C dv/dt and v = L di/dt (lesson 5); half on as a maximum (lesson 6);
  the definite integral (lesson 8); mean value as area ÷ length and rms as the root of the mean
  square (lesson 10).
- **Exponentials and logarithms:** the capacitor's charging curve, the time constant and five time
  constants (lesson 3); reading a time back off a decay (lesson 6). **Differential equations:** RC
  discharge (lesson 2) and a coil's current with τ = L ÷ R (lesson 3).
- **Trigonometry:** the circle and its wave, three-phase √3 (lessons 6 and 7); cos of the firing
  angle. **Proportional reasoning and Percentages:** duty cycle as a ratio.

**Not taught again:** rms, peak and the 0.637 average; reactance; power factor; three-phase √3;
capacitor charging and the time constant; the drive's blocks and V/f; Ohm's law and power; RCD
testing and BS 7671's tables. Each is used with a one-line reminder, and only what is new is taught.

**Taught inline, because you have not met them** (notes 5): holes and electrons; the diode's drop
as a constant and as a loss; the inductor as a store that keeps current going when a switch opens
(you have the equation, not the behaviour); duty cycle; heat as watts times degrees per watt through
a heat sink (no built course covers it, UNCONFIRMED, notes 5); harmonics as multiples of 50 or 60 Hz
and THD as a ratio of rms values; an insulated system in one line.

**Edges.** In: the power diode, BJT, MOSFET, IGBT, thyristor and triac as switches; single-phase
and three-phase diode rectifiers; smoothing, the DC link and precharge; phase control and the
controlled rectifier; buck and boost; the H-bridge and three-phase inverter with sine-triangle PWM
and dead time; the online UPS, the drive and the shore converter as block chains; harmonics from
rectifiers; stored charge; earth leakage on earthed and insulated systems; EMC basics. Out:
amplifiers, small-signal transistors and biasing, op-amps (Instrumentation and control); logic
(Digital circuits); transformers, including a rectifier's input transformer (Transformers); motor
control methods beyond V/f; device physics beyond four pictures.

## 2. The lessons, in the order they build
The order is the scope's and the benchmarks': devices first, the diode and rectifier together, then
the switch, the thyristor, and the converters last (All About Circuits, Hughes, Electronics Tutorials,
notes 1.1, 2). Lessons 6 and 7 follow the MCA's choppers then inverters (notes 3.2).

| # | Lesson | What it teaches |
|---|---|---|
| 1 | The diode: a one-way valve | A diode "is an electrical component acting as a one-way valve for current" (AAC, notes 4.1), and like a check valve it is "essentially "pressure" operated (voltage-operated)" (AAC, notes 6). Why, in four pictures (notes 4.1). Heat frees an electron and it leaves "an empty spot with a positive charge", a hole (AAC, notes 4.1). "To move the hole in a given direction, the valence electrons move in the opposite direction" (AAC, notes 4.1). P-type carries holes, N-type electrons, and at the junction "the carriers from each side diffuse across the center area ... and pair off" (Renesas, notes 4.1), leaving a thin zone with no free carriers. Push forward and the zone thins until carriers pour across: "Silicon diodes have a forward voltage of approximately 0.7 volts" (AAC, notes 4.1). Push backwards and it widens, and nothing flows until the reverse voltage passes the diode's Peak Inverse Voltage, PIV, where it breaks down (AAC, notes 4.1). The drop stays: 0.7 V at an example 20 A is 14 W of heat (computed), the seed of lesson 4. Current in equals current out; nothing is used up (notes 6). The meter test: the diode range works "by forcing a small current through the diode and measuring the voltage dropped" (AAC), so its reading is "typically ... less than the "normal" drop of 0.7 volts" because the current is small (AAC, notes 4.1). Reversed, it reads over range. Use "diode check" for semiconductors and "resistance" for anything else (AAC, notes 4.1). |
| 2 | Rectifiers: AC in, DC out | Recall: the peak of 230 V (AC circuits lesson 2). Half-wave "only allows one half of an AC waveform to pass", so "half of its capacity is unused" (AAC, notes 4.2). The bridge: "regardless of the polarity of the input, the current flows in the same direction through the load" (AAC), for "two diode drops ... (0.7·2=1.4 V for Si)" (AAC, notes 4.2). Averages as area ÷ length (Calculus lesson 10): half-wave Vmax ÷ π, ET's "V AVE = 0.318*V MAX"; bridge 0.637 Vmax, ET's "2 x 0.318V max", which is "V AVE = 0.9*V RMS" (ET, notes 4.2) and AC circuits lesson 2's half-cycle average. On 230 V: peak 325 V, half-wave 103.5 V, bridge 207 V, less 1.4 V (computed). That 1.4 V is 0.7% of 207 V but 12% of a 12 V charger's output (computed), which is why low-voltage chargers care. Ripple at "twice the supply frequency (e.g. 100Hz for a 50Hz supply or 120Hz for a 60Hz supply.)" (ET, notes 4.2). PIV from the waveform: half-wave, the peak of the AC (Purdue, notes 4.2); bridge, "the peak secondary voltage" (SECONDARY, notes 4.2): 325 V on 230 V (computed). Three-phase: "A three-phase full-wave rectifier would be called a 6-pulse" (AAC); "each pair of diodes will conduct for only 60° (one-sixth) of a cycle" (ET), so the output rides the tops of the six line-to-line voltages with ripple at "six times the input" (ET, notes 4.2). Its average from one 60° cap is 3√2 ÷ π × V_LL = 1.35 V_LL (computed on screen), ScienceDirect's "slightly lower than the peak line voltage, or 2.34 times the rms phase voltage" (notes 4.2) and the SECONDARY 1.35 (notes 4.2). 400 V gives 540 V, Motors lesson 3's figure with its cause; 440 V gives 594 V; ET's worked 127 V gives 171.5 V (computed). The six-pulse PIV is the peak line-to-line voltage, 566 V on 400 V and 622 V on 440 V (computed from the waveform; UNCONFIRMED as a quote, notes 4.2). |
| 3 | Smoothing and the DC link | Recall: how many time constants to charge (Exponentials lesson 3). "The smoothing capacitor converts the full-wave rippled output ... into a more smooth DC output voltage" (ET, notes 4.3). It charges to the peak, and "when the input waveform falls below the DC "peak" stored on the capacitor, the diode is reverse biased, blocking current flow from capacitor back to the source" (AAC, notes 4.3). Between peaks the capacitor alone feeds the load, so it sags. i = C dv/dt (Calculus lesson 5) gives the dip as about I ÷ (f × C), with f the ripple frequency (computed rule; UNCONFIRMED as a quote, notes 4.3, 9). So ripple "is not only determined by the value of the smoothing capacitor but by the frequency and load current" (ET, notes 4.3); ET's ten-fold capacitor raised the minimum "from the previous 3.6 volts to 7.9 volts" (notes 4.3). Example: 1 A from a 100 Hz bridge into 4700 µF dips about 2.1 V; double the load and it dips 4.3 V (computed, example values). The diodes now conduct only in short gulps near each peak, the seed of lesson 8. The DC link is "the energy reservoir and filter between rectifier and inverter" (SECONDARY, notes 4.3), rippling at "6× mains frequency for three-phase diode bridge" (SECONDARY, notes 4.3). With little load the bus sits near the peak, "Vrms × 1.414" (SECONDARY, notes 4.2): 566 V on 400 V, 622 V on 440 V (computed); load pulls it towards lesson 2's average. Switch-on: "An uncharged capacitive circuit is seen as a short circuit when line voltage is first applied" and gives "extremely high inrush current" (Eaton, notes 4.3). Precharge is "a pre-charge contactor (PCC) and current-limiting resistor" (TI, notes 4.3). The bus climbs "uC = VBAT 1 − e − t τ , τ = RC" (TI), Exponentials lesson 3's curve, "Five time constants (5T) are needed" (Sensata), and "When the precharge relay turns ON, the capacitor voltage rises gradually" (Omron, notes 4.3). Example: 2200 µF through 47 Ω, τ = 0.10 s, about 0.5 s to charge, and a first current of 566 ÷ 47 = 12 A, not a short (computed, example values). For a battery, ripple matters: "An excessive AC ripple voltage induces an AC ripple current which results in additional heating of the battery" (VRLA guide, notes 4.5). |
| 4 | The transistor as a switch | Fully on or fully off: "either fully conducting or fully nonconducting at any given time, it dissipates little heat energy" (AAC, notes 4.4). Half on is the worst: "The IGBT should not be operated in linear mode, as this causes excessive conduction losses" (Infineon, notes 4.4). Example: 600 V into a 30 Ω load. Fully on with a 2 V drop the switch makes 40 W; halfway it makes 600² ÷ (4 × 30) = 3 kW (computed, example values; the halfway maximum is Calculus lesson 6's). Three devices, one job. The BJT "can be used as a switch if biased in the saturation and cut-off regions" (AAC), but a power BJT with a β of 20 needs "at least 5 Amps of base current" for 100 A (AAC, notes 4.4). A MOSFET's gate takes only "whatever transient (brief surge) may be required to charge the gate-channel capacitance" (AAC). The IGBT joins the two: "the IGFET controls the base current of a BJT, which handles the main load current" (AAC), at the cost of a "slower turn-off time" (AAC, notes 4.4). Gate drive in one picture: a pulse fills the gate, another empties it. Losses: "Conduction losses" and "Switching losses" (ST, notes 4.4); switching losses are "the product of switching energies and the switching frequency (fsw)" (Infineon, notes 4.4). Heat, inline: the rise is watts × degrees per watt through junction, case and heat sink, from "The power dissipation is related to ∆T between junction and case and the thermal resistance RthJC" (Infineon, notes 4.4). Example: 48 W through 0.5 °C/W is a 24 °C rise (computed, example values). The freewheeling diode: a coil keeps its current going (AC circuits lesson 4; Differential equations lesson 3), so opening its switch throws "pulses of high voltage" (AAC). A diode across the coil gives the current a path, and the voltage is "merely the forward voltage drop of the diode, rather than hundreds of volts as before" (AAC, notes 4.4). Many devices already carry one, so an extra diode is not always needed (EE World, notes 6). |
| 5 | The thyristor and phase control | Recall: the DOL's starting current (Motors lesson 2). A thyristor is a diode with a gate. A pulse fires it, "triggering or firing" (AAC), and it stays on with the gate gone. It turns off only by "anode current falling below the holding current value" (AAC, notes 4.5). On AC that comes "just prior to the zero-crossover point", "natural commutation", so it "must be fired again during the next cycle" (AAC, notes 4.5). The gate sets when it starts, never when it stops. Firing angle α: "chop the sine wave at any point" (AAC, notes 4.5). Replace a bridge's diodes and "you have the makings of a controlled rectifier circuit" (AAC; ET, notes 2.3, 4.5). With a resistive load, integrating the chopped half-sine from α (Calculus lesson 8) gives (Vmax ÷ π)(1 + cos α): on 230 V, 207 V at 0°, 155 V at 60°, 104 V at 90° (computed; UNCONFIRMED as a quote, notes 4.5). "If the firing angle is zero ... the controlled rectifier performs similar to the previous ... uncontrolled diode rectifier" (ET, notes 4.5). One SHOW screen: with a large inductive load a fully controlled bridge gives 2Vmax cos α ÷ π (computed), and "when α > 90° the average DC voltage is negative. That is power flows from the DC load to the AC supply" (ET, notes 4.5). The cost: "The trigger angle causes a phase shift of the input currents which reduces the power factor" (ECPE, notes 4.5), AC circuits lesson 8 with a new cause. Battery charging: "a thyristor-controlled rectifier suitable for charging nickel-cadmium or lead-acid batteries while supplying DC loads" (AEG, notes 4.5); "the constant current constant voltage (CCCV) charge method" (Battery University); float "approximately 2.25 volts per cell, or 13.5 volts for a 12V battery" (SECONDARY, notes 4.5); a 24 V bank of 12 cells floats at 27 V (computed). Charging "generate[s] hydrogen gas", explosive at "4.1 to 72 percent hydrogen in air", and ventilation keeps it below "25% of its lower explosive limit" (CCOHS, notes 4.5). The triac "behaves just like two conventional thyristors connected together in inverse parallel" (ET), so it chops both halves: at 90° a 230 V heater gets 163 V rms, half power (computed by Calculus lesson 10's mean of squares). Triac lamp dimmers "should not be used as a motor speed controller" (ET, notes 4.5). Soft starter: thyristors "connected back-to-back" (IOP), giving a "voltage ramp (linear variation of voltage from 0 to rated voltage)" with "starting current limit" (ABB, notes 4.5), the answer to Motors lesson 2's inrush. |
| 6 | Chopping DC: buck and boost | "The buck converter is a form of DC to DC converter that can take an input directly from a DC source, such as a battery" (Learnabout, notes 4.6): a switch, then "the flywheel circuit (Dl, L1 and C1)" (Learnabout, notes 4.6). Switch closed: the inductor sees Vin − Vout and its current ramps up (v = L di/dt, Calculus lesson 5). Switch open: the coil keeps its current going, lesson 4's idea, as "the inductor current continues to flow into the rectification diode to charge the output" (Analog Devices, notes 4.6). Taught inline: the inductor as a store that keeps current going (notes 5). In steady state "the average voltage across the inductor is zero" (allpcb), so "(Vin - Vo) * Ton = Vo * Toff" (allpcb, notes 4.6), and Vout = D × Vin, Monolithic Power's "E ⋅ d" (notes 4.6; its formula arrived garbled, so the lesson derives it). Duty cycle as a ratio and a percentage (Proportional reasoning, Percentages). Example: 48 V at D = 0.5 gives 24 V; at 0.25, 12 V (computed). Little is lost because the switch is fully on or off (lesson 4), so switching supplies "offer higher efficiency than traditional linear power supplies" (Analog Devices, notes 4.6), unlike a resistor burning off the difference. "Many loads, such as resistors, integrate the power into a number matching the percentage" (AAC, notes 4.6). The capacitor holds the output while the inductor current ramps: "A good estimation for the inductor ripple current is 20% to 40% of the output current" (TI, notes 4.6). Example: 48 V to 24 V at 50 kHz in 100 µH ripples 2.4 A, 24% of 10 A (computed, example values). Boost: the same parts rearranged, and the same zero-average rule gives Vout = Vin ÷ (1 − D): 24 V at D = 0.5 gives 48 V (computed; UNCONFIRMED as a quote, notes 4.6, 9). Switching supplies "can step-up, step-down, and invert" (Analog Devices, notes 4.6). One line: Motors lesson 3's brake chopper is a chopper into a resistor (quote at build, gaps). Last screen: an inverter leg is a buck whose D follows a sine. |
| 7 | Inverting: building AC from DC | Recall: what does a drive give a 400 V, 50 Hz motor at 25 Hz? (Motors lesson 3, 200 V). "PWM is often used in conjunction with an H-Bridge. This configuration is so named because it resembles the letter H" (AAC, notes 4.7). Two legs of two switches: one diagonal gives the load +Vdc, the other −Vdc. Each leg is lesson 6's switch, so its local average is D × Vdc, and if D follows a sine the average follows a sine (computed from lesson 6's rule). Sine-triangle PWM does it, and it "will work for three sine waves that are 120° out of phase" (Microchip, notes 4.7). The motor "filters this supplied current to produce a three-phase sine wave with negligible harmonics", and "the amplitude of phase voltage is determined by the duty cycle of the PWM signals" (TI, notes 4.7). So the frequency is the reference's, and the voltage is how deep the modulation goes: Motors' 200 V at 25 Hz from one fixed bus. IGBTs "are mostly used in three-phase inverters that have numerous applications like variable-frequency drives ... uninterruptible" (TI, notes 4.7). Dead time: "both the low-side and high-side switches are turned off before one of the switches turns on" (IET, notes 4.7), because turn-off is slower than turn-on (lesson 4), "preventing a bridge shoot-through" (Infineon, notes 4.7). It "causes distortion in the output voltage and current, and therefore the smaller is the dead time the better" (University of Malta, notes 4.7). Inside a UPS: "a rectifier, an inverter, a static bypass and a battery" (Eaton); "the incoming alternating current (AC) is continuously converted by rectifier to direct current (DC) and then back to AC via an inverter" (ABB), with the battery on the DC link (APC's IEC 62040-3 drawing, notes 4.7), so double conversion "provides zero transfer time to battery" (Eaton, notes 4.7). Inside a drive: lessons 2, 3 and 7 in a row, the blocks Motors named. Shore supply: "Static conversion of the 50/60 Hz three-phase port grid power to match the 60/50 Hz vessel network" (ABB, notes 7), the same chain at another frequency. |
| 8 | Living with power electronics | Recall: three balanced sine currents in a neutral (AC circuits lesson 10). Harmonics, inline (notes 5): a rectifier draws its current in blocks, or in gulps near the peak with a capacitor (lessons 2 and 3). A repeating wave is a sum of sines at whole multiples of 50 or 60 Hz. For a six-pulse bridge "h = 5, 7, 11, 13, 17, 19…" (ABS), "h = n ⋅ 6 ± 1" (Siemens), and "The two largest harmonic currents for the six-pulse drive are the fifth and seventh" (IDC, notes 4.8): 250 and 350 Hz at 50 Hz, 300 and 420 Hz at 60 Hz (computed). None is a multiple of 3, so none adds in a neutral the way AC lesson 10's triplens do (computed from the rule). THD "describes the ratio between the root mean square (RMS) of the harmonics' magnitudes ... and the RMS magnitude of the fundamental" (Gamry), quoted as "THDI" or "THDV" (Rose-Hulman, notes 4.8). Ideal blocks carry 1/h of each, the SECONDARY rule of thumb (notes 4.8), and 31% THDI (both computed); real drives run "25% - 40% Current THD", 12-pulse 9 to 11% and 18-pulse 3 to 4% (IEEE, notes 4.8). A reactor is "valuable for limiting the harmonic currents" (Siemens, notes 4.8). Ships: THD "is not to exceed 8%" (IACS UR E24, notes 4.8); LR asks for "regular harmonic distortion measurements, to detect an incipient failure" of filters (notes 7). Stored charge (Motors gave the drill; here the why): the link falls on Exponentials lesson 3's curve, so its own R and C set the time: 5 minutes (ABB, Rockwell), 15 (Vacon), and "High voltage may be present even if the LED ... is not lit" (Danfoss, notes 4.3). Earthed supply: an EMC filter's capacitors to earth leak a steady current (Doepke, notes 4.8); by AC lesson 5's X_C, an example 100 nF at 230 V, 50 Hz passes 7.2 mA (computed); three balanced phases cancel, as lesson 10's neutral did, and a lost phase lets it through (computed). Touch current over "3.5 mA AC or 10 mA DC" sets the protective conductor (ABB, notes 4.8). A drive's fault current can carry DC, "fault currents with DC offset", so Type B is "particularly suitable" (Schneider) and "only a type B RCD is allowed" for shock protection on three-phase drives (Yaskawa, notes 4.8). "Type A only detects sinusoidal AC and pulsating DC" (SECONDARY); Regulation 531.3.3 sets the types (Doepke) and Type AC "shall only be used to serve fixed equipment, where it is known that the load current contains no DC components" (CIBSE on A2, notes 4.8). Insulated supply, one line inline: no deliberate earth path, so a first fault gives "no notable return current paths ... and thus no dangerous contact voltage" (TDK, notes 4.8). "All drive EMC filters and ground-to-phase varistors are not suitable for use in IT (ungrounded)" systems: "Disconnect these filters" (ABB, notes 4.8). The insulation monitor "monitors the entire electrically-connected circuit" (Siemens), including "rectifiers, inverters, variable-speed drives" (Bender) and "UPS systems" and "Battery networks" (ABB, notes 4.8); a start-up alarm can come from filter capacitors charging through it (SECONDARY, notes 4.8). EMC: line filters work "in the 150 kHz to 30 MHz" band and, with "shielded motor connection cables", "limit the high-frequency interference" (Siemens); "ground the motor cable shield 360 degrees" (ABB); IEC 61800-3's "C1, C2, C3 and C4" (EIT, notes 4.8). The last screens are a mixed set from the whole course. |

## 3. Can it be taught mostly visually, through interaction?
**Partly** (RUNBOOK section 0, item 3). Every lesson is a steps lesson of about 12 screens, SHOW then
DO, ending on two or three mixed puzzles. SHOW screens can carry a short paragraph where the idea
needs words, at most about 90 words: why a junction blocks, why half on cooks, why a coil keeps its
current, why blocks are a sum of sines. Each lesson has one main picture you move with your finger,
chosen because it shows the cause, not just the answer. The research supports two choices for all
eight. Predict before you play: a predict-observe-explain simulation corrected diode misconceptions
"in more than 80% of cases" by "constructing scenarios that conflict with existing knowledge" (ERIC
2013, notes 6). And use the current-voltage curve as a reality check, which half the students in a
think-aloud study did not do (TUHH, notes 6). Practice testing and spaced review are the app's own
tools (Dunlosky, notes 6). Every step has a `still` or `read` for the read-through and your Book.

- **Lesson 1, the junction and the meter.** A block of P-type with hole circles and N-type with
  electron dots, the thin empty zone between, and a series resistor and supply. A voltage slider
  runs from reverse through zero to forward. Forward, the zone thins and carriers cross in a stream
  whose rate is the current; reverse, the zone widens and the stream stops. Past the PIV the zone
  gives way in red. Beside it a current-voltage curve, drawn from an example diode labelled as such,
  with a dot riding it; the knee sits near the cited 0.7 V. A second view is a multimeter on its
  diode range across the diode: the reading under 0.7 V forward (AAC, notes 4.1), over range
  reversed. Faulted diodes (shorted, open) are switches to try, once their readings are quoted
  (gaps). *Why:* the cause is the junction, and the research says learners struggle with "both the
  macro-level behavior ... and the underlying micro-level phenomena" (TUHH, notes 6). Seeing the
  zone and the curve move together joins the two. The curve beside it is the reality check the same
  study found missing (notes 6). The meter view is the bench test you will use, with the low
  reading explained rather than mistaken for a fault (AAC, notes 4.1).
- **Lesson 2, the rectifier bench.** A supply, the rectifier (a switch: half-wave, bridge, six-pulse)
  and a resistor load. Drag the time cursor along one supply cycle or play it. The diodes conducting
  at that instant are drawn bold, the current path is traced in ink and its arrow through the load
  never turns round. The output wave builds under the cursor; its average line is the area ÷ length,
  with the readout 0.318, 0.637 or 1.35 of the peak or line voltage. A probe clips across one diode;
  while it blocks, its reverse voltage traces out and peaks at the PIV. For six-pulse, the six
  line-to-line waves are drawn pale and the output rides their tops, 60° a pair. A supply switch:
  230 V single-phase, 400 V or 440 V three-phase. *Why:* the notes' bridge misconception is the
  current "runs backwards" through the load, or the second pair "does nothing" (notes 6), and AAC's
  "regardless of the polarity of the input, the current flows in the same direction through the
  load" (notes 4.2) is something you watch, not take on trust. The probe answers the notes' check,
  that a blocking diode in a bridge sees the full peak, not zero (notes 6). The six-pulse tops make
  the 1.35 visible: it is the average of a cap that never falls far (notes 4.2).
- **Lesson 3, the reservoir.** Lesson 2's bridge (single-phase or six-pulse) into a capacitor and a
  load. Sliders: capacitance and load current; the frequency is the supply's. The capacitor voltage
  rides up each peak and slopes down between them at I ÷ C volts per second (i = C dv/dt), and the
  diode current shows as a short gulp at each top. The ripple readout follows I ÷ (f × C) and the
  bus readout moves from near the peak at light load towards the average at heavy load. A "switch
  on" button starts from zero: with precharge off, the first current spikes off the scale in red;
  with it on, the bus climbs the RC curve with τ marked, a five-τ tick, then the contactor closes.
  *Why:* the notes' misconceptions here are that the capacitor "adds" voltage and that ripple depends
  "only on capacitance" (notes 6). Its check, "double the load; what happens to the ripple?" (notes
  6), is a drag of one slider. The gulps show the cause of lesson 8's harmonics. The switch-on spike
  is Eaton's "seen as a short circuit" (notes 4.3), and the precharge curve is Exponentials lesson 3's
  curve, so nothing new is taught about the curve itself.
- **Lesson 4, the switch and its heat.** A switch (BJT, MOSFET or IGBT on a picker, drawn with its
  gate or base) in series with a load on a DC supply. A gate slider runs from off through half to
  fully on. Two bars: the voltage across the switch and the current through it. Their product is a
  heat bar, and beside it a thermometer for the junction, the rise computed as watts × °C/W through
  a heat sink you can make bigger or smaller. Half on, the heat peaks; fully on or off, it nearly
  vanishes. A "switching" mode toggles it at a frequency you drag, each edge passing through the hot
  middle, so the switching-loss bar grows with frequency while conduction loss stays. The BJT shows
  a fat base current arrow; the MOSFET and IGBT a brief gate pulse. A load switch makes it a coil: open
  the switch and the voltage spikes red off the scale; tick the freewheeling diode and the current
  loops through it, dying away, with the voltage at the diode's drop. *Why:* the misconception is
  that half on is a safe middle state when it is the worst case for heat (Infineon, notes 6). The
  heat bar shows it as V × I, which you know, at its maximum in the middle. Switching loss as
  "switching energies and the switching frequency" (Infineon, notes 4.4) is the burst per edge times
  the edges per second. The coil and diode are AAC's "rather than hundreds of volts" (notes 4.4).
- **Lesson 5, the firing angle.** A 230 V sine, a thyristor and a heater, with the gate drawn. Drag
  the firing angle α. At α the gate pulse fires, the thyristor goes bold and stays bold after the
  pulse ends, and it drops out at the zero. The conducting slice of each half cycle is shaded and the
  average readout is the shaded area ÷ length, (Vmax ÷ π)(1 + cos α) for a bridge. A tap on the gate
  later in the half cycle does nothing to turn it off. Mode switch: single thyristor; triac on AC
  (both halves, rms and power readouts for the heater); controlled bridge feeding a battery, with
  the input current block sliding behind the voltage as α grows and a power factor readout. *Why:* the
  misconception is that the gate can turn it off (notes 6; AAC's holding current, notes 4.5), and
  tapping a gate that does nothing catches it. The shaded slice is the integral from α (Calculus
  lesson 8), so the rule is seen, not handed over, which also keeps clear of the source's halved
  range (notes 4.5). The sliding current block is ECPE's "phase shift of the input currents which
  reduces the power factor" (notes 4.5).
- **Lesson 6, the balancing inductor.** A buck converter on a DC input (an example battery voltage,
  labelled). Duty-cycle and switching-frequency sliders. Above, the inductor voltage against time:
  Vin − Vout while on, −Vout while off, with the two areas shaded. Below, the inductor current ramping
  up and down around the load current. Drag D and the output voltage moves until the two areas are
  equal, landing on D × Vin; the ripple current readout shows its share of the load current against
  TI's 20 to 40%. A switch rearranges the parts into a boost and the balance lands on Vin ÷ (1 − D).
  *Why:* "In a steady state, the average voltage across the inductor is zero" (allpcb, notes 4.6) is
  the cause of Vout = D × Vin, and two shaded areas balancing is that sentence drawn. It derives the
  boost rule, which has no clean quote (notes 4.6, 9), from the same picture, so nothing rests on an
  unquoted formula.
- **Lesson 7, sine from pulses.** One inverter leg, then the H-bridge, then three legs (a switch).
  A sine reference and a triangle carrier share an axis; where the sine is higher the top switch is on.
  Below, the leg's output pulses, a dashed line for their local average (the sine coming back), and
  the motor current, smoothed by its inductance into a near-sine. Sliders: reference height (the
  output voltage), reference frequency (the output frequency) and carrier frequency (the current
  gets smoother). A dead-time slider: at zero, the two switches in a leg overlap at each edge and the
  bus shorts in red; longer, the output flattens at each zero. *Why:* "The amplitude of phase voltage
  is determined by the duty cycle of the PWM signals" and the motor "filters this supplied current"
  (TI, notes 4.7): the picture shows both, so a drive making 200 V at 25 Hz from a fixed bus has a
  visible cause. Dead time is a trade between two red outcomes, shoot-through (Infineon) and
  distortion (University of Malta, notes 4.7), which a slider shows better than a sentence.
- **Lesson 8, the six-pulse current taken apart.** The current one line draws from a six-pulse
  bridge, drawn as ideal blocks, 120° positive and 120° negative (from lesson 2's six 60° pairs,
  computed). Tick boxes add sines: the fundamental, then the 5th, 7th, 11th, 13th, 17th and 19th, at
  1/h of the fundamental. The sum builds the blocks as you add them. A spectrum bar chart sits beside
  it, a THD readout rises towards 31%, and IEEE's cited bars for real 6, 12 and 18-pulse drives sit for
  comparison. A frequency switch, 50 or 60 Hz, relabels the bars. A second card, "where the leakage
  goes": a drive with its filter capacitors to earth, a supply switch (earthed, insulated) and a
  "lose a phase" switch. Earthed: the leakage returns through earth, past an RCD; balanced it cancels,
  with a phase lost it flows. Insulated: there is no return path, and the insulation monitor reads
  the whole connected circuit, with the filter marked "disconnect on an IT system". *Why:* harmonics
  have to be taught inline (notes 5), and adding sines until the blocks appear is the cause made
  visible: the blocks are what the rectifier draws, the sines are what the supply sees. The h = 6n ± 1
  rule (ABS, Siemens, notes 4.8) shows as the gaps in the spectrum, and the missing multiples of 3 tie
  back to AC lesson 10's neutral. The leakage card uses AC lessons 5 and 10 (X_C and cancelling
  phases), so the reason a drive trips the wrong RCD, or worries an insulation monitor, comes from
  what you already know (notes 4.8).

## 4. What else
- **Benchmark (notes 1, 2).**
  - **All About Circuits, Lessons in Electric Circuits Volume III:** 12 chapters; solid-state theory,
    then diodes and rectifiers, BJT, JFET, IGFET, thyristors, op-amps, DC motor drives (notes 1.1).
    It gives the front half of this course (diode, rectifier, switch, thyristor) and almost none of
    the back half: PWM and the H-bridge are one page in DC Motor Drives (notes 1.1). Most of lessons 1
    to 5's quotes come from it.
  - **Brilliant:** no electronics, semiconductor or power electronics course is reachable. Its
    Circuits (31 lessons) is DC, and Digital Circuits (32 lessons) is gates and adders (notes 1.2).
    So Brilliant sets no order here.
  - **Electronics Tutorials:** power diodes, single and three-phase rectification uncontrolled and
    controlled, thyristor, triac, IGBT (notes 2.3). It has the best worked rectifier averages, and one
    error (notes 4.5).
  - **Hughes** puts Power Electronics as chapter 40, the last of Power Engineering, after motors
    (notes 2.1); **Bird** has diodes and transistors and no converter chapter (notes 2.1). Their
    inner headings are UNCONFIRMED (notes 2.1).
  - **Khan Academy** has one diode lesson (notes 2.2); **OpenLearn's** introduction to electronics
    has no devices at all and is Instrumentation and control's ground (notes 2.4).

  What they lack that you need: the converters (buck, boost, inverter, PWM, dead time), the drive
  and UPS as chains, and living with them (harmonics, stored charge, leakage, insulation monitoring).
  Lessons 6 to 8 take that from the MCA syllabus, makers' application notes and class rules (notes 3,
  4.6 to 4.8, 7).
- **His aim (notes 3, 7).** You have no syllabus for the Navy courses ahead, so the course is
  planned against public standards and the marine syllabi, and where that is a guess it says so.
  - **STCW Table A-III/6** lists "Fundamentals of electronics and power electronics" for the
    electro-technical officer (SECONDARY, the US Coast Guard's copy, notes 3.1).
  - **MCA ETO oral syllabus (MSN 1860):** "Fundamentals of electronics and power electronics" and
    drives with "converters (ac to dc, ac regulators, choppers or dc-dc converters, inverters,
    cycloconverters)" (notes 3.2).
  - **MCA modernised syllabus, Principles of Power Electronics:** the devices (diode, diac,
    thyristor, GTO, triac, power MOSFET, IGBT, smart power); "the protection of and the dissipation of
    heat"; "Use of heatsinks"; half-wave and full-wave, "no control, half control and full control",
    the flywheel diode with an inductive load (notes 3.2). **Applications of Power Electronics:**
    single-phase converters and choppers, three-phase converters, AC regulators "(phase control,
    burst firing)", "Inverters (voltage source, current source, PWM, D.C. link)", and a drive's block
    diagram (notes 3.2). It applies to new ETO cadets "From August 2025" (MIN 720, notes 3.2).
    Lesson by lesson: 1 is device 1.1; 2 is 3.1 and Applications 2.1; 3 is the DC link of 2.4; 4 is
    1.6, 1.7 and 2.5; 5 is 1.3, 1.5, 3.2 and Applications 1.1 and 2.2; 6 is the choppers; 7 is 2.4 and
    3.1; 8 is the protection lines (notes 8).
  - **SQA NextGen HNC Electrical Power and Drive Systems:** "State three harmonic sources", "Describe
    one method of harmonic filtering", "Explain the need for isolation and earthing" (notes 3.3). The
    Pearson HN unit lines are UNCONFIRMED (notes 3.3).
  - **Public apprenticeship standards:** the engineering technician standard names "maritime
    electrical, electronic ... equipment and systems used on board vessels", and the degree-level
    electrical and electronic engineer lists "transformers, AC/DC, power electronics, motors" (notes
    7). An ETO sponsorship test names "Power Electronics and Drives" (notes 7).
  - **My guess:** your Level 3 marine engineering course will treat drives and chargers as equipment.
    This course gives you what is inside them, at the depth of the MCA lines, so any new converter you
    meet reads as the same few parts.
- **Starting point (notes 5).** Nothing below is taught again; each is used with a one-line reminder.

  | Idea | Earlier lesson | Used here |
  |---|---|---|
  | 230 V peaks at 325 V; half-cycle average 0.637 | AC circuits 2 | Lesson 2's averages and PIV |
  | Mean value as area ÷ length; rms as root mean square | Calculus fundamentals 10 | Lesson 2's averages; lesson 5's triac rms |
  | The definite integral | Calculus fundamentals 8 | Lesson 5's average from α |
  | i = C dv/dt; v = L di/dt | Calculus fundamentals 5 | Lesson 3's ripple; lesson 6's ramps |
  | A maximum where the slope is zero | Calculus fundamentals 6 | Lesson 4's halfway heat |
  | A coil keeps its current and pushes back | AC circuits 4; Differential equations 3 | Lesson 4's kickback and freewheeling diode; lesson 6 |
  | X_C falls as frequency rises | AC circuits 5 | Lesson 8's filter leakage |
  | Power factor; a current shifted from its voltage | AC circuits 8 | Lesson 5's firing angle cost |
  | Line voltages 120° apart; √3; the neutral cancels; triplens | AC circuits 10; Trigonometry 7 | Lesson 2's six-pulse; lesson 8's harmonics and leakage |
  | The charging curve; τ = RC; five time constants | Exponentials 3 | Lesson 3's precharge; lesson 8's discharge |
  | Reading a time back off a decay; RC discharge | Exponentials 6; Differential equations 2 | Lesson 8's discharge time |
  | DOL starting current 6 to 8 times | Motors 2 | Lesson 5's soft starter |
  | Drive blocks, V/f, 540 V bus, trips, discharge drill | Motors 3 | Lessons 2, 3, 7 and 8 go inside them |
  | RCD types and selection; safe isolation | Your trade; Design and verification | Lesson 8's Type B |
  | Ratios and percentages | Proportional reasoning; Percentages | Lesson 6's duty cycle |

  From your trade: the multimeter's diode range, DC relay and contactor coils, BS 7671's RCD rules.
  You know the parts by name and fit them; this course gives you what happens inside them.
- **Where it is used (each cited before a lesson uses it).** Public, general equipment only;
  nothing about any naval vessel (notes 4.8, 7).
  - **The diode (1):** the rectifier (AAC, notes 4.2); suppressing a coil's kickback (AAC, notes
    4.4); MCA device 1.1 (notes 3.2).
  - **Rectifiers (2):** "Electrical variable speed drives of all types ... use power semiconductors to
    rectify the AC input voltage" (ABS, notes 4.8). Class rules feed DC distribution "through power
    electronic converters (such as AC/DC rectifiers, DC/DC converters)" (ABS, notes 7). A ship's
    battery system charges "by converting AC power from the power system to DC" (KRS, notes 7).
  - **Smoothing (3):** the drive's DC link (SECONDARY, notes 4.3); precharge on drives (Eaton) and
    DC links generally (TI, Omron, notes 4.3); ripple and battery heating (VRLA guide, notes 4.5).
  - **The switch (4):** IGBTs in drives and UPS inverters (TI, notes 4.7); heat sinks (MCA 2.5, notes
    3.2); the flywheel diode on an inductive load (MCA 3.5, notes 3.2).
  - **The thyristor (5):** thyristor-controlled battery chargers for lead-acid and NiCd (AEG, notes
    4.5); soft starters (ABB, IOP, notes 4.5); lamp dimmers (ET, notes 4.5); controlled rectifiers for
    DC motor speed and AC regulators (MCA Applications 1.2 and 2.2, notes 3.2).
  - **Choppers (6):** DC/DC converters on DC distribution (ABS, notes 7); the buck from a battery
    (Learnabout, notes 4.6); MSN 1860's "choppers or dc-dc converters" (notes 3.2).
  - **Inverters (7):** drives and UPSs (TI, notes 4.7); the double-conversion UPS (Eaton, ABB, notes
    4.7); a ship's UPS battery "capable of supplying the designated loads for the time specified" (KRS,
    notes 7); shore-to-ship converters "from 100 kVA up to 27 MVA" (ABB, notes 7).
  - **Living with it (8):** the 8% THD limit (IACS UR E24, notes 4.8); regular harmonic measurement
    (LR, notes 7); "All-electric ships are demanding in terms of power quality" (MDPI, notes 7);
    Type B on drives (Schneider, Yaskawa, notes 4.8); insulation monitors on drives, UPSs and battery
    networks (Bender, ABB, Siemens, notes 4.8); the makers' discharge waits (notes 4.3).
- **The mistakes to catch, each with a DO screen and its own hint.** The notes say plainly that the
  research here is thin: no examiner report or Bitesize named mistake was found for diodes,
  rectifiers or smoothing (UNCONFIRMED, notes 6, 9). Each mistake is marked with how strong its
  source is.
  - **Lesson 1, the diode as an ideal switch with no drop, and macro without micro:** students
    "struggled with both the macro-level behavior of a P-N junction diode and the underlying
    micro-level phenomena" (TUHH think-aloud study, notes 6). The ideal-switch slip is the notes'
    reading (notes 4.1, 6). A DO screen asks for the drop across a conducting diode and offers 0 V.
  - **Lesson 1, no reality check:** "Half of the students ... did not use ... current-voltage (I-V)
    curves to perform reality" checks (TUHH, notes 6). A DO screen gives a reading that the curve
    rules out.
  - **Lesson 1, a low meter reading as a fault:** the meter reads "less than the "normal" drop of 0.7
    volts" (AAC, notes 4.1). A textbook point, not a counted mistake. A DO screen: the meter reads
    0.55 V forward and over range reversed; is the diode good?
  - **Lesson 1, current used up:** "Current gets used up as it passes through components" (teacher's
    guide, SECONDARY, notes 6). A DO screen compares the current either side of the diode.
  - **Lesson 2, current backwards through the load, or the second pair idle:** the notes' reading
    (notes 6), corrected by AAC's "regardless of the polarity" (notes 4.2). A DO screen asks which way
    the load current flows in the negative half.
  - **Lesson 2, a blocking diode sees nothing:** the notes' check, "it is the full peak, not zero"
    (notes 6). A DO screen asks for the reverse voltage on a blocked bridge diode on 230 V.
  - **Lesson 3, the capacitor adds voltage, or only capacitance sets ripple:** the notes' reading
    (notes 6), against ET's "frequency and load current" (notes 4.3). The notes' own check is the DO
    screen: "double the load; what happens to the ripple?"
  - **Lesson 4, half on as a safe middle:** the notes' reading of Infineon's "should not be operated in
    linear mode" (notes 4.4, 6). A prediction screen: which gate setting heats the switch most?
  - **Lesson 4, freewheeling diodes everywhere:** makers still see designs "with added anti-parallel
    diodes to provide a freewheeling current path" on parts that have one (EE World, a trade article,
    notes 6). A DO screen: a coil on a switch with no diode, and one on a device that already has one.
  - **Lesson 5, the gate turns it off:** the notes' reading (notes 6) against AAC's holding current
    (notes 4.5). A DO screen: you remove the gate signal mid half cycle; what happens?
  - **Lesson 5, a dimmer on a motor:** triac dimmers "should not be used as a motor speed controller"
    (ET, notes 4.5). A maker's-style caution. A DO screen offers a dimmer for a fan.
  - **Lesson 8, switched off is dead:** "A common misconception is that once a circuit is switched
    off, it poses no risk" (a safety paper, SECONDARY, notes 6). And the LED: "High voltage may be
    present even if the LED ... is not lit" (Danfoss, notes 4.3). A DO screen: the drive's display is
    dark and the isolator is off; what next?
  - **Lesson 8, one wait fits all:** the notes' reading, "Never teach a single universal wait time"
    (notes 4.3). A DO screen gives two drives and two manuals.
  - **Lesson 8, the wrong RCD:** Type B for three-phase drives (Schneider, Yaskawa, notes 4.8). A DO
    screen offers Type AC and Type A on a three-phase drive circuit.
  - **Lesson 8, the filter left in on an insulated system:** ABB's "Disconnect these filters" (notes
    4.8). A DO screen: an insulation monitor alarms whenever a new drive is powered.
  - **Not stated as common:** no source counts these, so they are taught as checks (look at the
    picture, put the answer back), not as cited mistakes.
    - Half-wave averaged as 0.637 instead of 0.318.
    - Ripple at the supply frequency for a bridge.
    - Thinking firing later costs nothing (ECPE's power factor, notes 4.5).
    - A buck burning off the difference like a resistor.
    - A boost making energy from nothing (the current falls as the voltage rises).
    - The inverter's output voltage as a sine (it is pulses; the current is near-sine).
    - Dead time as a fault to remove.
    - An online UPS "switching over" to battery (Eaton's zero transfer time, notes 4.7).
    - Harmonics as a fault in the supply, not a property of the load.
- **Size and cost.** 8 lessons of about 12 screens on the agreed settings (CLAUDE.md).
  - Motors was estimated at 0.7M a lesson and measured 1.05M (docs/plans/next-build.md). The pictures
    here are animated circuits with linked waveforms, nearer AC circuits' and Statistics' than Motors',
    so I estimate about 1.1M to 1.3M a lesson.
  - That is about 9M to 10.5M for the course, plus about 0.3M for the plan. The research is done
    (195 quotes from 54 saved tool results).
  - The full process measured on Fractions lessons 4 to 8 was about 1.65M a lesson, about 13.2M for
    eight.
  - Each build's real cost is reported to you.
- **Lesson 1 first.** Lesson 1 is built and checked before the others (about 1.2M, plus the plan).
  Because you approved the build, the rest follow without waiting for you to try it.
- **Left for later courses, with a one-line look ahead where it fits:**
  - **Transformers** (Electrical principles, next): the input transformer of a rectifier and a
    charger's step-down (notes 4); the phase-shifting transformers behind 12 and 18-pulse rectifiers
    (lesson 8 names the pulse numbers and IEEE's THD figures only). Lesson 2 says in one line that a
    low-voltage charger's lower AC comes from a transformer, taught there.
  - **Instrumentation and control** (sensors, op-amps, 4-20 mA loops, PLCs): op-amps, small-signal
    amplifiers, transistor biasing, the drive's control loop and feedback, noise and tolerance, the
    decibel and signal-to-noise (from the Statistics brief). Lesson 4 says in one line that a
    transistor half on is an amplifier, and that is where it is taught.
  - **Digital circuits** (Maths shelf): logic gates and the microcontroller logic that makes the PWM
    pattern ("PWM signals generated from the microcontroller (MCU)", TI, notes 4.7). Lesson 7 says in
    one line that a controller computes the switching, taught there.
  - **Three-phase power systems at sea** (Power and machines at sea): insulated and earthed neutrals
    and earth fault detection in full, how an insulation monitor measures, harmonic filters and power
    quality on a switchboard, and the shore connection itself. Lesson 8 gives each one line.
  - **Not deferred, left out:** GTO, diac, smart power devices, cycloconverters, current-source
    inverters and four-quadrant operation (named once, notes 3); motor bearing currents; vector
    control; resonant converters; wide-bandgap devices beyond a name.
- **Gaps to close at build time.** None blocks the build.
  - **Formulas without a clean quote** (UNCONFIRMED, notes 9): the ripple I ÷ (f × C), the boost
    Vin ÷ (1 − D), the six-pulse PIV, and the phase-control averages. Each is derived on screen from
    a shown rule and its numbers are computed; no screen says a source gives it.
  - **The 1.35 and 1.414 bus figures** are SECONDARY (notes 4.2, 9). Lesson 2 derives 1.35 and
    lesson 3 uses √2 from AC circuits, so each is computed on screen; ScienceDirect's 2.34 times the
    phase voltage agrees (notes 4.2).
  - **Lesson 1:** the readings of a shorted and an open diode on the diode range are on the AAC meter
    check page but not in `quotes.json`; quote them before the fault switches go in. "Depletion" as
    the zone's name: Renesas's sentence is cut off (notes 4.1); AAC's IGBT page uses "depletion
    region" (notes 4.4), so quote that or call it "the empty zone". The curve is an example diode,
    labelled.
  - **Lesson 2:** the bridge PIV is from a tutorial site (SECONDARY, notes 4.2); the waveform probe
    shows it either way.
  - **Lesson 4:** every switch figure (600 V, 30 Ω, 2 V drop, 0.5 °C/W, switching energy) is an
    example, labelled. A maker's typical IGBT drop and thermal resistance would be better; look for
    one in the Infineon notes already saved.
  - **Lesson 5:** the float voltage is SECONDARY (Chargetek, notes 4.5); look for a battery maker's
    figure, or keep it labelled. The triac rms and the controlled averages are computed.
  - **Lesson 6:** the brake chopper line needs Motors lesson 3's ABB ACS880-01 quote copied in, or
    the line is dropped.
  - **Lesson 7:** how high a sine-triangle output can go against the DC bus, and how real drives
    reach full voltage, are not in the notes. The picture shows output as a share of the bus and makes
    no claim about a drive's maximum.
  - **Lesson 8:** that BS 7671 itself names drives for Type B is UNCONFIRMED (notes 4.8, 9). What
    drains a drive's DC link after isolation (discharge resistors) is not quoted; the picture labels
    its R as an example until a maker's line is found. That a PWM output's fast edges push extra
    leakage through the motor cable's capacitance is not quoted; only the filter path is taught,
    with the frequency effect computed from X_C. The insulation monitor's start-up alarm is
    SECONDARY (notes 4.8).
  - **No examiner reports** for diodes, rectifiers or smoothing (UNCONFIRMED, notes 6, 9). The
    mistakes above are one study, one teaching study, makers' cautions and the notes' readings, each
    marked.
  - **Nothing naval.** No naval or submarine source was used, and the SMQ books on your Drive were not
    read (notes 9).
