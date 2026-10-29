# Transformers and magnetism: the course brief

Written 28 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
the third course in the Electrical shelf's Electrical principles folder: "Electromagnetism from first
principles, then the transformer: turns ratio, losses, regulation, vector groups and stepping 440 V
down to 115 V." AC circuits and Electronics and power electronics come before it (both built).
Generators and paralleling comes after it (built next). You chose this course on 28 Oct and approved
the build, so I have taken the decisions for you and listed them below. Change any you like. Sources
and quotes are in `research-notes.md` beside this file (172 quotes, cut by script from the 63 saved
tool results and checked with `tools/eval/sources.mjs`, `ok: 172, failed: 0`). Section numbers below
point there.

## The short version
**Eight lessons**
1. Current makes a field (built first)
2. The magnetic circuit: iron, saturation and loss
3. Changing flux makes a voltage
4. The ideal transformer: turns, volts and amps
5. The real transformer: losses, tests and efficiency
6. Regulation and percentage impedance
7. Three-phase transformers and vector groups
8. Transformers on the job

**The main pictures** (one per lesson, each moved with your finger, each showing the cause):
- **The grip and the hoop (lesson 1).** A wire seen end-on, with compass needles round it. Drag the
  current up, down and through zero. The field rings grow, shrink and turn round with it. A switch
  bends the wire into a loop, then a coil whose turns you add. Then drag a hoop through the field.
  It counts the lines through it: that count is the flux. Its density readout is lines per area.
- **The core and its curve (lesson 2).** A ring core with a coil on it. Drag the coil's current. The
  flux climbs, then flattens as the iron saturates. A dot rides the B-H curve beside it. Open an air
  gap and the curve leans over. Switch to AC and the dot runs round the hysteresis loop, its area
  shaded. A cross-section shows eddy currents shrinking as the core is cut into laminations.
- **Move the flux (lesson 3).** Two coils on one core, a voltmeter on the second. Drag the first
  coil's current by hand. The meter reads only while you move, and more the faster you move. Hold
  still and it reads zero, however strong the field. Arrows show the induced current pushing
  against the change, not against the field. Switch to AC and the emf wave is the flux wave's
  slope. Drag frequency and turns; the readout follows E = 4.44 f N Φ. Switch to DC and it goes flat.
- **The turns ratio (lesson 4).** One core, two windings. Drag the number of turns on each side and
  the load. Every turn carries the same little voltage tick, so the volts follow the turns. Current
  bars move the other way, and the power-in and power-out bars stay equal. A box shows the load as
  the 440 V side sees it, scaled by the turns ratio squared.
- **Where the watts go (lesson 5).** The equivalent circuit, with a load slider from nothing to
  125%. The iron-loss bar stays flat. The copper-loss bar grows with the square of the load. The
  efficiency curve peaks where the two bars are equal. The flux bar never moves. Two test switches
  rewire it: open circuit, and the wattmeter reads iron loss; short circuit, and it reads copper loss.
- **The phasor drop (lesson 6).** The secondary voltage, the I × R drop and the I × X drop, drawn
  tip to tail to reach the fixed supply voltage. Drag the load and its power factor. Lagging, the
  drop lines up with the voltage and the output falls most. Leading, the output can rise above no
  load. A percentage impedance slider moves a fault-current bar the other way.
- **The clock (lesson 7).** A delta winding and a star winding, with the HV line voltage at twelve
  o'clock. Pick the connections and the LV line voltage turns to its hour: 11 for Dyn11, 1 for Dyn1.
  A second card puts two transformers side by side with an open paralleling switch. The voltage
  across the switch is the gap between their LV arrows. It is red unless the arrows match.
- **The knee on the job (lesson 8).** Lesson 2's saturation knee, with the core flux as a moving
  bar. Mode one, switching on: drag the moment on the voltage wave and the flux left in the core.
  Switched at a zero with flux left in, the flux overshoots the knee and the current spikes red,
  dying away over a few cycles. Mode two, a CT: drag its burden from shorted to open. The primary
  current stays fixed. Open it and the flux runs into saturation and the secondary voltage spikes red.

### Decisions taken for you (say if you want any changed)
- **Eight lessons, one per part of your scope, in your order.** Hughes, the closest textbook to the
  electrical path, runs the same way: electromagnetism, simple magnetic circuits, then (AC known)
  the transformer chapter's 23 sections from principle of action to current transformers (notes
  2.3). Bird agrees (notes 2.4). The MCA's two syllabus units split along the same line: the Second
  Engineer's 3.1 is lessons 1 to 3 and the Chief Engineer's 4.2 is lessons 3 to 8 (notes 3.2, 8).
  Lesson 8 is the fullest. If you want nine, it splits into "switching on and instrument
  transformers" and "isolating, auto, and 440 V to 115 V". If you want seven, lessons 1 and 2 merge,
  since you have the field and the flux from your EAL Level 3 (notes 3.5).
- **Lesson 1 is built first, then the rest without a pause.** You approved the build, so the others
  follow without waiting. Try lesson 1 on your phone as soon as it lands; if something is wrong, the
  rest will be changed before they are built.
- **Steps lessons, with a little more explaining ("Partly", RUNBOOK section 0, item 3).** About 12
  screens each, SHOW then DO, ending on two or three mixed puzzles. SHOW screens may carry a short
  paragraph, at most about 90 words (your 21 Oct note on Motors lesson 1). Every lesson has one
  picture you move, and it asks you to predict before you play (section 3).
- **A recall opener only where an earlier course carries the lesson:** lesson 2 (AC circuits lesson
  4, a coil's reactance at 0 Hz), lesson 3 (AC circuits lesson 1, where the turning coil's emf
  peaks), lesson 4 (Complex numbers lesson 7, the size of 3 + j4 Ω), lesson 5 (Calculus fundamentals
  lesson 6, the slope at a top), lesson 6 (AC circuits lesson 6, 6 V at 0° plus 8 V at 90°), lesson 7
  (AC circuits lesson 10, the phase voltage of a 440 V star) and lesson 8 (Electronics lesson 3, the
  capacitor's switch-on spike). A right answer says "Still there" and carries on.
- **One idea runs through the whole course: the voltage sets the flux, not the load.** From E =
  4.44 f N Φ (lesson 3), the core flux is fixed by the supply voltage, its frequency and the primary
  turns. That one rule catches the two textbook errors the research found most likely to stick:
  "The higher the load current, the easier a transformer goes into saturation" and "The higher the
  number of turns at the primary coil, the larger the magnetic flux in the core" (Lenz and Schmidt,
  arXiv 1107.2684, notes 6.1). The flux bar sits in every picture from lesson 3 on, and it moves only
  when the voltage, the frequency or the turns do.
- **Inductance goes deeper, not over.** AC circuits lesson 4 gave you v = L di/dt, X_L = 2πfL and
  the coil that pushes back. Lesson 3 here shows where L comes from. Put the flux from the magnetic
  circuit, Φ = N I ÷ S, into the emf rule e = N dΦ/dt, and L = N² ÷ S (computed). So iron raises L,
  an air gap lowers it, and saturation collapses it. That is why an iron-cored coil's X_L is not a
  constant (MCA: "μ r is not a constant", notes 3.2). Nothing from AC circuits is taught again.
- **4.44 is computed, never memorised** (notes 4.3). The flux swings from −Φm to +Φm in half a
  cycle, so the average emf per turn is 2Φm ÷ (1 ÷ 2f) = 4 f Φm. Times the form factor 1.11, which
  is AC circuits lesson 2's 0.707 ÷ 0.637, it gives 4.44 (computed; the route is the SECONDARY
  electricaltechnology's "multiplying the average value by the form factor", notes 4.3). A check
  screen shows it is also 2π ÷ √2 = 4.443 (computed).
- **Loss formulas stay out.** No clean public statement of the Steinmetz law was found (notes 4.2).
  Hysteresis and eddy loss are taught by cause and by what makers do about them (laminations,
  silicon steel), and measured by the open-circuit test. Copper loss is I²R, which you know.
- **Regulation uses the phasor diagram you already draw** (notes 4.6). The drop inside the
  transformer is I(R + jX), added tip to tail as in AC circuits lesson 6. The handy rule, regulation
  ≈ R% cos φ + X% sin φ, is read off that drawing (computed; UNCONFIRMED as a quote, gaps). The MCA
  asks for "lag pf only" (notes 3.2). Leading is added because SIU's "Negative regulation is
  possible" (SECONDARY, notes 4.6) is the clearest proof that the angle, not just the current, sets
  the drop.
- **Percentage impedance is taught as a trade, not a virtue.** It limits fault current and worsens
  regulation (Rex, SECONDARY; EC&M, notes 4.6). ABB names "a misconception that higher impedance
  values are always better" (notes 2.6), and lesson 6's slider shows both sides at once. Fault
  current is taken at the transformer's own terminals with a stiff supply, as EC&M's worked example
  does (notes 4.6), and the screen says so. No table of typical values is printed: Schneider's figure
  G33 was not read (notes 2.5, 4.6). Example impedances are labelled as examples.
- **Vector groups use Complex numbers' turn.** The clock number is the LV line voltage's angle from
  the HV one in twelfths of a turn (EEP, SECONDARY, notes 4.7). Turning by 30° is multiplying by
  1∠30°, Complex numbers lesson 6. The voltage across an open paralleling switch is the gap between
  two arrows, |1 − 1∠θ| = 2 sin(θ ÷ 2) of the phase voltage: 0.52 at 30°, 1.0 at 60°, 2.0 at 180°
  (computed). The 0.52 matches Keentel's "of the order of half the system voltage" (SECONDARY, notes
  4.7).
- **Transformer paralleling here, generator paralleling later.** Lesson 7 teaches when two
  transformers can share a board: same ratio, same impedance, same vector group, rating within two
  to one (Schneider, ABB, SGB-SMIT, notes 2.5, 2.6, 4.7). Synchronising, load sharing between
  machines, the AVR and the governor are Generators and paralleling, built next. Lesson 7 says so in
  one line.
- **Inrush and the open CT share one cause, so one picture.** Both are lesson 2's saturation met on
  the job: "Transformer inrush currents are predominantly due to saturation of the transformer core"
  (IDC, SECONDARY, notes 4.8), and an open CT secondary drives "the CT into saturation" (NRC, notes
  4.8). Lesson 8's picture is the knee with two modes. The CT rule is taught as a hard safety rule, in
  red, with Schneider's "never" and its measured 4000 V (notes 4.8).
- **The 440 V to 115 V example is general, and its 115 V is yours.** No public source found names
  115 V; the public marine pages say 440 V stepped down to 220 V or 110 V (SECONDARY, notes 4.8, 7).
  115 V comes from your own outline in CLAUDE.md. The worked example is a general 440 V to 115 V
  transformer with an example rating, labelled as such. It draws lessons 3 to 7 together: ratio,
  currents, losses, regulation, fault current, and why isolating rather than auto. Nothing is said
  about how any boat is supplied.
- **Examples are public, general equipment.** Ships' lighting and small power transformers, shore
  connection transformers, switchboard CTs and VTs, contactor coils and solenoids (notes 7, 3.5).
  Where a frequency is needed they use 60 Hz, as AC circuits did for ships, and 50 Hz ashore, both as
  examples, never a claim about any boat. No naval source was used and the SMQ books on your Drive
  were not read (notes 3.5).
- **The 12-pulse transformer gets one SHOW screen.** Electronics lesson 8 named 12 and 18-pulse
  rectifiers and left their phase-shifting transformers here. Lesson 7 shows why a Dy and a Yy
  secondary, 30° apart, give two six-pulse bridges whose ripples interleave (computed from the 30°
  shift; UNCONFIRMED as a quote, gaps). Named and shown, not played.
- **The insulated-system tie is one card, not a lesson.** Insulated systems lesson 1 used an
  isolating transformer as the way to make an IT supply and left its magnetics here. Lesson 4 shows
  why the secondary is not electrically connected (Bitesize, notes 4.3), and lesson 8 shows what that
  means: a separate system (IEEE 45, SECONDARY, notes 7), which an auto-transformer cannot give
  ("Auto transformer: no isolation", ASME on IEC 61558, notes 4.8).
- **Colour as before.** Ink for windings, cores, waves, field lines and controls. Amber for key
  terms, teal for small labels (Φ, B, H, N, units, "HV", "LV", clock hours). Red only for warnings
  and mistakes: saturation's current spike, the open CT, a shorted VT, a mismatched paralleling
  switch, a transformer on DC. Green only for finished.
- **Your intake answers** (`intake.json`): to understand transformers and magnetism and how to work
  with them; on the job and in everyday life; hands-on, with the why explained in full.

## 1. The overall topic
A current makes a magnetic field. Round a straight wire the field is rings; wind the wire into a
coil and the rings add into a field like a bar magnet's, with a north and a south end you find with
your right hand. How much field threads a loop is the flux, in webers; how crowded it is, the flux
density, in teslas. Iron carries flux far more easily than air, so a coil on an iron core makes a
magnetic circuit: ampere-turns push flux through the iron's reluctance, as volts push current
through resistance. But iron runs out. Past a knee in its B-H curve it saturates, and more current
buys almost no more flux. Each AC cycle drags the iron round a hysteresis loop, which costs energy,
and the changing flux drives eddy currents in the iron, which cost more. So cores are thin
laminations of silicon steel. A changing flux makes a voltage in every turn it threads (Faraday),
pushing a current that opposes the change (Lenz). With a sine flux the rms voltage is 4.44 f N Φ,
so the supply voltage fixes the flux. Steady DC makes no change, so a transformer needs AC. Two
windings on one core see the same flux, so the volts follow the turns, the amps go the other way,
and power in equals power out. A real transformer adds a small magnetising current, iron loss that
stays while it is energised, and copper loss that grows with the square of the load. Two tests
measure them, and they set the efficiency and its peak. The same series impedance makes the output
voltage sag under load, more at lagging power factor, and sets the fault current: the percentage
impedance. Three-phase windings in star and delta shift the output by multiples of 30°, named by
the clock (Dyn11), and only matching groups may run in parallel. On the job: the switch-on inrush,
instrument transformers (and why a CT secondary is never opened on load), isolating against auto,
and a 440 V to 115 V supply worked through.

**It builds on:**
- **Your trade:** the field and flux as EAL Level 3 diagrams; the transformer as a black box with
  turns ratio, kVA rating, iron and copper loss, and the step-up, step-down, isolating, current,
  potential and auto types (EAL, SECONDARY for your exact papers, notes 3.5). Prospective fault
  current at a supply and how protective devices use it (BS 7671, Design and verification).
- **AC circuits:** the turning coil's emf from changing flux (lesson 1); rms, 0.707 and the half-cycle
  average 0.637 (lesson 2); the coil that pushes back, v = L di/dt, X_L = 2πfL and Lenz's law by name
  (lesson 4); impedance from meter readings, the voltage triangle (lesson 6); power factor and
  apparent power (lesson 8); star and delta, √3, line and phase (lesson 10).
- **Complex numbers:** turning by multiplying (lessons 3 and 6); Z = R + jX (lesson 7); Ohm's law
  with j (lesson 8). **Vectors:** the cross product, the right-hand rule and the motor force (lesson
  6); phasors (lesson 7).
- **Calculus fundamentals:** rates, v = L di/dt (lesson 5); a top where the slope is zero (lesson 6);
  the definite integral as a running total (lesson 8); mean as area ÷ length (lesson 10).
  **Trigonometry:** the turning arm and its wave (lesson 6); phasors (lesson 7).
- **Electronics:** the rectifier, the 12 and 18-pulse names (lesson 8); the capacitor's switch-on
  spike (lesson 3). **Motors:** V/f and the flux kept level to base speed (lesson 3); saturation in
  the DC series motor (lesson 6). **Insulated systems:** the IT supply made by an isolating
  transformer (lesson 1). **HV Subsea Cable Testing:** IR and PI.
- **Proportional reasoning and Percentages:** ratios, and per cent of rated values.

**Not taught again:** phasors, reactance, impedance, power factor, star and delta and √3, rms and the
form factor's parts, Lenz's law's name, the motor force and its right-hand rule, the IT supply and
the insulation monitor, PI testing, and the EAL turns-ratio sum. Each is used with a one-line
reminder, and only what is new is taught.

**Taught inline, because you have not met them** (notes 3.5, 5): flux and flux density as
quantities you measure; mmf and reluctance; the B-H curve, saturation and hysteresis; the EMF
equation; percentage impedance; the clock notation.

**Edges.** In: the field of a wire, a loop and a coil; flux and flux density; the magnetic circuit
with an air gap; B-H, saturation, hysteresis, eddy currents and laminations; Faraday, Lenz, e = N
dΦ/dt and E = 4.44 f N Φ; inductance from reluctance; mutual inductance by name; the ideal and the
real transformer; the equivalent circuit; open- and short-circuit tests; efficiency and its maximum;
regulation; percentage impedance and fault current at the terminals; three-phase connections, vector
groups and paralleling transformers; inrush; CTs and VTs; isolating and auto-transformers; 440 V to
115 V. Out: the force on a conductor and motors (Vectors lesson 6, Motors, taught); generators,
synchronising and load sharing (Generators and paralleling); transformer protection schemes and the
grounding transformer in full (Three-phase power systems at sea, my guess); oil, temperature and
condition checks (Maintenance and condition monitoring); PI testing (HV Subsea Cable Testing,
taught); tap changers beyond one line; zigzag windings beyond a name; transformer design and
cooling; Biot-Savart, Ampère's law and Maxwell.

## 2. The lessons, in the order they build
The order is your scope's, and Hughes's: field, magnetic circuit, induction, then the transformer
from its principle to current transformers (notes 2.3, 8). The MCA's Second Engineer's 3.1 covers
lessons 1 to 3 and its Chief Engineer's 4.2 lessons 3 to 8 (notes 3.2).

| # | Lesson | What it teaches |
|---|---|---|
| 1 | Current makes a field | "Explore how an electric current produces a magnetic field. Learn how to describe the direction of this field using the right hand rule" (Khan, notes 2.2). The MCA asks you to draw "the magnetic field pattern for a straight conductor, loop and a solenoid carrying current" and find its polarity by "right-hand gripping rule, end rule as appropriate" (MCA Second Engineer 3.1, notes 3.2). Straight wire: rings, closer near the wire, turning round when the current does. Loop: the rings from each side add through the middle. Coil: "coiling a current-carrying wire around into a loop or solenoid results in a magnetic field that resembles a bar magnet's field" (Khan, notes 4.1). More current or more turns, more field. The grip: fingers along the current, thumb points to north. Flux, taught inline (notes 5): how much field threads a loop, in webers, Φ. Flux density: how crowded it is, flux per square metre, in teslas, B = Φ ÷ A. EAL asked for "The difference between magnetic flux and flux density" (notes 3.5); here you measure both with the hoop. Tilt the hoop and less threads it; widen it and more does, at the same density. "Magnetic flux seems to be a difficult concept that students tend to confuse with the magnetic field" (PRPER 2017, notes 6.1), so the field is what is there and the flux is what your hoop catches. Where it is used: contactors, relays and solenoids (EAL, notes 5; Pearson HN 4003, SECONDARY, notes 3.4). One line: the force on a wire in a field is Vectors lesson 6's, not taught again. Last screen: put iron in the coil, and lesson 2 asks why the flux jumps. |
| 2 | The magnetic circuit: iron, saturation and loss | Recall: a coil's X_L at 0 Hz (AC circuits lesson 4). Ampere-turns push flux round a core as volts push current: magnetomotive force F = N I, "reluctance", and "'Ohm's law for a magnetic circuit'" (Hughes 7.2, 7.5, 7.6, notes 2.3); the MCA's "S = F/Φ" (notes 3.2). The analogy is Hughes's own (notes 4.2). Iron's reluctance is far lower than air's, so the same coil drives far more flux. The B-H curve: H is the push per metre of core, N I ÷ l; B is the flux density it buys. The MCA's "B = μ ο μ r H" and "explains that μ r is not a constant" (notes 3.2): the curve rises steeply, bends at a knee and flattens. Past the knee the iron is saturated and more current buys little more flux. An air gap: the MCA asks "the advantages and disadvantages of leaving air gaps" (notes 3.2). The gap adds reluctance, so it takes more current, and it straightens the curve (my reading, notes 4.2). Hysteresis: on AC "the flux density (B) of a transformer in operation follows the hysteresis loop" (Eaton, notes 4.2). Where the loop crosses zero current, flux is left in the iron, the residual flux lesson 8 needs. Going round the loop costs energy every cycle. Eddy currents: the changing flux drives currents round inside the iron itself, and "for almost all applications involving “soft” iron, eddy currents are the dominant source of loss". So cores are "laminated, or made up of relatively thin sheets of steel" and "alloyed with elements (often silicon) which poison the electrical conductivity" (MIT, notes 4.2); silicon "up to 3.2 mass %, which increases the electrical resistivity and reduces eddy current losses" (NETL, notes 4.2). Both are no-load losses: "Losses that occur in the core due to hysteresis and eddy current are examples of no-load losses" (MPS, SECONDARY, notes 4.2). Lesson 5 measures them. Last screen: an iron core is never a straight line, which is why Motors lesson 3 kept the flux level. |
| 3 | Changing flux makes a voltage | Recall: where does the turning coil's emf peak (AC circuits lesson 1)? At the flux's fastest change, not its largest. Now nothing turns. Two coils on one core: "The coils are not electrically connected. Instead, they are wound around an iron core" that carries the field from one to the other (Bitesize, notes 4.3). Change the first coil's current and the second sees a voltage. Faraday's law: "the magnitude of the emf induced in a coil is determined by: 1. the number of turns; 2. the rate of change of flux cutting the coil and e = NΔΦ/Δtvolts" (MCA Second Engineer 3.1, notes 3.2). The change, not the field: hold the current still and the meter reads zero. The induced emf is there even with no circuit to carry current (PRPER 2017, notes 6.1). Lenz: the induced current opposes the change. "If the induced current strengthened the change in magnetic flux instead of opposing it, the system could generate increasing amounts of electrical energy without any external work" (MSU, notes 4.3), and "the primary coil opposes the change in flux caused by the input voltage" (LibreTexts, SECONDARY, notes 4.3). The EMF equation, the MCA's "E = 4⋅44.fΦz" (Chief Engineer 4.2, notes 3.2), computed on screen: average 4 f Φm per turn, times AC circuits lesson 2's form factor 1.11, gives 4.44 (decision above; notes 4.3). Example: 440 V, 60 Hz on 300 turns gives a peak flux of 5.5 mWb (computed, example values). Turn it round: the voltage sets the flux. Add 10% more turns and the flux falls to 5.0 mWb (computed), which is the opposite of the textbook error (notes 6.1). Run the same winding at 50 Hz and the flux rises 20%, to 6.6 mWb, towards the knee (computed): Motors lesson 3's V/f, from the inside. That a 60 Hz design runs hot on 50 Hz is an inference (UNCONFIRMED, notes 4.3). Why AC: "The fact that transformers are based on Faraday’s law of induction makes it clear why we cannot use transformers to change DC voltages" (LibreTexts, SECONDARY, notes 4.3); "Transformers can only work with alternating current" (Bitesize, notes 4.3). And on DC the coil's X_L is zero (AC circuits lesson 4), so only the winding's resistance limits the current (computed from the rule). Inductance deeper: with Φ = N I ÷ S (lesson 2), L = N² ÷ S (computed), so iron raises L, a gap lowers it and saturation collapses it. Mutual inductance by name: "changing magnetic flux emanating from one circuit can induce an emf in another", with "transformer, engine ignition coil" as examples (MCA Second Engineer 3.1, notes 3.2). |
| 4 | The ideal transformer: turns, volts and amps | Recall: the size of 3 + j4 Ω (Complex numbers lesson 7). The ideal case: "all magnetic field lines are confined to the core so that the same magnetic flux permeates each turn of both the primary and the secondary windings" (OpenStax 15.6, notes 2.1). The same flux in every turn gives the same volts in every turn (lesson 3), so "The ratio of potential differences on the transformer coils matches the ratio of the numbers of turns on the coils" (Bitesize, notes 4.4). "A step-up transformer, which steps-up voltage, has more turns in the secondary than in the primary" (Bitesize, notes 4.4). Power: "Input power = output power V s I s = V p I p" (Bitesize, notes 4.4), so the current goes the other way. So N1 I1 = N2 I2: the ampere-turns balance (computed from the two rules). Worked: 440 V to 115 V is a ratio of 3.83 (computed). An example 10 kVA single-phase unit draws 22.7 A at 440 V and gives 87.0 A at 115 V (computed). A step-down raises the current (OCR, notes 6.2). You did these sums for EAL (notes 3.5), so they move fast; what is new is why. Referred impedance: "the impedance seen by the source is the secondary impedance times the square of the turns ratio" (LibreTexts, SECONDARY, notes 4.4); "When we move an impedance from the secondary to the primary side of the transformer we multiply by the turns ratio squared" (MTU, SECONDARY, notes 4.4). The 115 V side's 1.32 Ω load looks like 19.4 Ω from 440 V, which is 440² ÷ 10 kVA, a check that it matches (computed). A complex Z moves by a real factor, so its angle stays (Complex numbers lesson 7). That is what lets lesson 5's equivalent circuit be one circuit. kVA, not kW, on the plate (EAL, notes 3.5): its losses follow the volts and the amps, whatever the power factor (computed from lesson 5's rules, a look ahead). Where it is used: transformers "change the voltage level of an alternating current" (Pearson HN, SECONDARY, notes 3.4); ships step 440 V down "to 220V or 110V for lighting and low-power signal equipment" (marineinspection, SECONDARY, notes 7). |
| 5 | The real transformer: losses, tests and efficiency | Recall: the slope at the top of a curve (Calculus fundamentals lesson 6). What the ideal case left out (OpenStax 15.6, notes 2.1). Leakage: some flux misses the other winding, and that is "responsible for the inductive reactance of a transformer" (Hughes 34.8, notes 2.3). Winding resistance. A magnetising current, "very small (2 to 5 percent of full-load current)" (electricaltechnology, SECONDARY, notes 4.5), and lesson 2's core loss. Together they make the equivalent circuit (Hughes 34.10 to 34.13, notes 2.3): a series branch (R and X) and a shunt branch (core loss and magnetising), moved to one side with lesson 4's rule. Pearson HN asks you to "Illustrate the operation of the transformer, considering the equivalent circuit" (M1, SECONDARY, notes 3.4). Losses: "The losses are divided into two categories, the load losses at rated load current and the no- load losses at rated voltage" (ABB, notes 2.6). "a no-load loss, that is present whenever the transformer is energized and is independent of the load level, and a load loss that is related to the transformer loading squared" (DOE, notes 4.5); "The load losses increase as a function of the square of the load" (Siemens, notes 2.6); "If load drops to half, copper losses drop by a factor of four" (Firgelli, SECONDARY, notes 4.5). The tests: "The open circuit test is used to determine the values of the shunt branch" and "The short circuit test is used to determine the values R s and X s of the series branch" (NJIT, SECONDARY, notes 4.5). Open circuit at rated voltage: the wattmeter reads iron loss. Short circuit at rated current: it reads copper loss, and the small voltage it takes is lesson 6's impedance voltage. Efficiency is output ÷ (output + losses). "A good transformer can have losses as low as 1% of the transmitted power" (OpenStax, notes 2.1). The peak: "The maximum efficiency of a transformer at a given power factor occurs when the copper losses are equal to the core losses" (Electrical Academia, SECONDARY, notes 4.5), so at a load fraction of √(iron ÷ full-load copper) (computed). Example 10 kVA, 100 W iron, 400 W copper at full load: 95.2% at full load, unity power factor; 96.2% at half load, the peak (computed, example values). Sizing: oversizing gives "Un necessarily high no-load losses" and undersizing "A reduced efficiency when fully loaded" (Schneider, notes 2.5). A transformer also draws reactive power, "(about) 5% of the transformer rating when supplying its full load" (Schneider, notes 2.5). |
| 6 | Regulation and percentage impedance | Recall: 6 V at 0° plus 8 V at 90° (AC circuits lesson 6). On load the output falls: the current through lesson 5's series R and X drops a voltage. Hughes gives regulation from the short-circuit test (34.14, 34.19, notes 2.3); the MCA asks for "phasor diagrams on and off load lag pf only" (Chief Engineer 4.2, notes 3.2). The drop is I(R + jX), added tip to tail to the output to reach the fixed supply (Complex numbers lesson 8). Lagging, the drop lines up with the voltage and the output falls most; leading, it can rise: "Negative regulation is possible" (SIU, SECONDARY, notes 4.6). "Lower values of regulation are better" (SIU, notes 4.6). Example, R 1.5% and X 3%: 1.5% at unity, 3.0% at 0.8 lagging, −0.6% at 0.8 leading (computed from R% cos φ + X% sin φ, read off the drawing). Percentage impedance, taught inline: "the percentage of normal rated primary voltage that must be applied to the transformer to cause full-load rated current to flow in the short-circuited secondary" (EC&M, notes 4.6), which is lesson 5's short-circuit test; Schneider's "Usc" on the plate (notes 2.5). Fault current: "if a 480V/120V transformer has an impedance of 5%, this means that 5% of 480V, or 24V, applied to its primary will cause rated load current", so a solid short gives "20 times (100 divided by 5) full-load-rated secondary current" (EC&M, notes 4.6). So I_fault = I_rated × 100 ÷ Z% (computed rule), taken at the terminals with a stiff supply. Example: the 10 kVA, 115 V unit at 4% gives about 2.2 kA (computed, example value). It feeds the prospective fault current you check under BS 7671 (Design and verification). The trade: "A transformer with lower impedance may provide better voltage regulation. It may also deliver substantially more current into a downstream fault" (Rex, SECONDARY, notes 4.6); ABB's "misconception that higher impedance values are always better" (notes 2.6). |
| 7 | Three-phase transformers and vector groups | Recall: the phase voltage of a 440 V star (AC circuits lesson 10; 254 V, computed). Three single-phase transformers, or one three-limbed core (Hughes 34.20, notes 2.3). The MCA asks you to sketch "three phase connections e.g. star/delta, star/star etc. using correct terminal markings" and solve problems "using turns and voltage ratios" (Chief Engineer 4.2, notes 3.2); Pearson HN to "Discuss the different methods of connections available for three-phase transformers" (P3, SECONDARY, notes 3.4). Each winding's ratio is lesson 4's, and star or delta adds AC circuits' √3: a Dyn 440 V to 115 V unit has a turns ratio of 440 ÷ 66.4 = 6.63 per phase (computed). The name: capital letter for HV, small for LV, n for a brought-out neutral, and a clock number. "The vector for the high voltage winding is taken as the reference vector" and the others are shown "by the use of clock hour figure" (EEP, SECONDARY, notes 4.7). Star-delta and delta-star give "a 30-degree phase shift" (Metapower, SECONDARY, notes 4.7), and groups shift "in multiples of 30°" (ABB, notes 2.6). The four groups: "Zero phase displacement (Yy0, Dd0, Dz0)", "180°", "-30° phase displacement (Yd1, Dy1, Yz1)", "+30° phase displacement (Yd11, Dy11, Yz11)" (EEP, SECONDARY, notes 4.7). So Dyn11 puts the LV 30° ahead: multiply by 1∠30° (Complex numbers lesson 6). Paralleling: Schneider's list, "Same voltage ratio * Same rated power * Same short circuit impedance. * Same coupling symbol of windings as for example D yn 11" (notes 2.5). EEP splits them into convenient and mandatory: "Same Phase Angle Shift, Same Polarity, Same Phase Sequence and Same Frequency" are mandatory (SECONDARY, notes 4.7). "The coefficient of vector groups must be equal so that phasing of the output voltages corresponds and no short-circuit occurs" (SGB-SMIT, notes 2.6). A mismatch gives "a voltage difference across the paralleling point of the order of half the system voltage, and the result is a fault" (Keentel, SECONDARY, notes 4.7); "Dyn11 and Dyn5 cannot operate together because they differ by 180°" (Taishan, SECONDARY, notes 4.7). The gap is 2 sin(θ ÷ 2) of the phase voltage (computed). Sharing: "Transformers of unequal power ratings will share the load in proportion to their ratings, providing that their voltage ratios and their short circuit impedances are identical", and a ratio of two or more "is not recommended" (Schneider, notes 2.5). With unequal impedance the lower one takes more (computed from lesson 6). One SHOW screen: a 30° shift feeding two six-pulse bridges (computed). One line each: "The primary Delta winding isolates the secondary Wye from the source" (Maddox, notes 7); "A grounding transformer is required if the source is a delta winding" (doerry, notes 7), taught later. Generators in parallel: Generators and paralleling. |
| 8 | Transformers on the job | Recall: the capacitor's switch-on spike (Electronics lesson 3), a different cause from what follows. Inrush: switch on and the flux must start from where it was. Flux is the running total of volts over time (Calculus fundamentals lesson 8, computed). Switched at a voltage zero, it heads for twice its normal peak, plus any residual flux (computed), past the knee. "Transformer inrush currents are predominantly due to saturation of the transformer core" (IDC, SECONDARY, notes 4.8). The size depends on "the phase angle of the applied voltage, winding resistance, the saturation in- ductance ... and the residual flux in the core" (NYU, notes 4.8). It "may reach instantaneous peaks of 8 to 30 times the full load current" and "appears as an internal fault to the differential relays" (ABB, notes 4.8), and "typically dissipates within a few cycles" (Eaton, notes 4.8). Instrument transformers: the MCA's "Explains the need for instrument transformers" (Chief Engineer 4.2, notes 3.2). A CT's primary current is set by the circuit it measures; its secondary pushes that current, scaled, round the meter (notes 4.8). "Current Transformers must never be open-circuited when current may pass through their window" (Schneider, notes 4.8). Open it and nothing stops the flux: "producing sufficient flux to drive the CT into saturation" (NRC, notes 4.8), and "As much as 4000V on the secondary has been measured on large core CTs" (Schneider, notes 4.8); "the resulting high voltages can be lethal" (TasNetworks, notes 4.8). So "Current transformer (CT) secondary windings shall not be fused" and go through "shorting terminal blocks" (IEEE 45, SECONDARY, notes 7). A VT is the reverse: "Never short-circuit the secondary terminal of a voltage transformer" (ABB, notes 4.8). VTs keep "a maximum voltage of 240 V on hinged instrument panels" (IEEE 45, SECONDARY, notes 7). Isolating and auto: "Any two winding transformer where the primary and secondary are not electrically connected is an isolation transformer. In contrast, an autotransformer has a physical, electrical connection" (Schneider, notes 2.6); "Auto transformer: no isolation" (ASME on IEC 61558, notes 4.8); autotransformers "become more economical as the ratio of secondary voltage to primary voltage approaches unity" (AESO, notes 4.8). At 440 V to 115 V, 74% of the power must still be transformed, so it saves only about a quarter; at 440 V to 400 V, only 9% (computed). The worked example: 440 V to 115 V, example rating, through ratio, currents, losses, regulation at 0.8 lagging and fault current, and why isolating. Uses: isolated distribution "by transformers" (IEEE 45, SECONDARY, notes 7); "at least two installed, independent power transformers" (46 CFR, a US rule, notes 7); a transformer in the ship side of shore power (IMO, Wärtsilä, notes 7); "Ungrounded systems require a fully insulated winding" (Maddox, notes 7). Named only: protection for transformers and their PI test (MSN 1860, notes 3.2). The last screens are a mixed set from the whole course. |

## 3. Can it be taught mostly visually, through interaction?
**Partly** (RUNBOOK section 0, item 3). Every lesson is a steps lesson of about 12 screens, SHOW then
DO, ending on two or three mixed puzzles. SHOW screens can carry a short paragraph where the idea
needs words, at most about 90 words: why the change and not the field, why the voltage sets the
flux, why the drop depends on the angle, why an open CT is dangerous. Each lesson has one main
picture you move with your finger, chosen because it shows the cause, not just the answer. The
research supports two choices for all eight. Teach induction interactively, because "the
fundamental concepts of the electromagnetic induction theory are barely understood by students"
when taught by rote (Zuza et al, notes 6.1), and they propose "an interactive teaching sequence"
(notes 6.1). And predict before you play, as PhET's Faraday lab does: "Predict how the induced
current will change when the experimental conditions are varied" (notes 6.3). Retrieval beats
re-reading on delayed tests (PubMed, notes 6.3), which is the app's quick checks and review. Every
step has a `still` or `read` for the read-through and your Book.

- **Lesson 1, the grip and the hoop.** A wire seen end-on, the current drawn as a dot or a cross,
  with a ring of compass needles. A current slider runs from full one way through zero to full the
  other. The field rings thicken near the wire and thin with distance, and turn round with the
  current; the needles swing to follow. A hand icon shows the grip, thumb along the current. A switch
  bends the wire into a loop, then a coil, with a turns slider; the rings join through the middle
  and the coil gets a north and a south end. Last, a hoop you drag and tilt in the coil's field. It
  counts the lines through it (the flux) and divides by its area (the density). *Why:* flux is
  confused with field (PRPER 2017, notes 6.1), and a hoop you hold makes flux something you catch,
  not something that is there: tilt it and the flux falls while the field has not changed. The notes
  read the research as students knowing a current makes a field but not its shape (notes 4.1), so
  the whole field is drawn before any formula. The coil turning into a bar magnet is Khan's order
  (notes 2.2, 4.1).
- **Lesson 2, the core and its curve.** A ring core with a coil, and beside it the B-H curve. A
  current slider sets N I; a dot rides the curve and a flux bar fills the core. The curve is steep,
  then bends, then flat: the dot crawls once it passes the knee, which is drawn and labelled. A
  material switch, air or iron, shows the same coil buying hugely different flux. An air-gap slider
  leans the curve over. An AC switch makes the dot run round a loop; the loop's area is shaded, and
  where it crosses zero current the flux left behind is marked. A second card is the core's
  cross-section with eddy currents as loops: one solid block, then cut into laminations, the loops
  shrinking and the loss bar falling. *Why:* saturation is the idea you lack, and inrush, the open CT
  and V/f all need it (notes 4.2). "μ r is not a constant" (MCA, notes 3.2) is the curve's flattening
  slope, seen. The eddy card shows MIT's reason for laminating (notes 4.2) as a cause, not a rule.
- **Lesson 3, move the flux.** Two coils on one core, a voltmeter and a lamp on the second. You drag
  the first coil's current up and down by hand. A flux trace and an emf trace run beside it. Move
  fast, the meter swings far; slow, a little; stop, zero, however high the current. Arrows show the
  direction of the change and the induced current's own field, pointing against the change. Then an
  AC switch: the flux is a sine and the emf wave is its slope, a quarter cycle ahead. Frequency and
  turns sliders, with E = 4.44 f N Φ computed live. A "fix the voltage" switch flips it round: hold
  440 V, then the flux follows f and N instead. A DC switch: the flux stops changing, the
  secondary goes flat, and the primary current bar runs into the red. *Why:* "more than 20% of the
  first-year university students explained induced current or emf as being due to the presence of
  the (unchanging) magnetic field" (PRPER 2017, notes 6.1), and holding still with a strong field and
  a zero meter answers that. Students read "opposes the change" as "being in the opposite direction"
  (PRPER 2017, notes 6.1), so the arrows oppose the change, which you can make point either way. The
  "fix the voltage" switch catches the error that more primary turns give more flux (arXiv 1107.2684, notes 6.1).
- **Lesson 4, the turns ratio.** A core with two windings. Turns sliders on each side and a load
  slider. Each turn carries the same small voltage tick, so the total on each side is ticks × turns.
  A voltage bar and a current bar on each side, a power-in and a power-out bar between them, always
  equal. An ampere-turns readout on each side shows N1 I1 = N2 I2. A box "as the 440 V side sees it"
  shows the load scaled by the ratio squared. A flux bar on the core stays put as you load it.
  *Why:* the same flux through every turn is the ideal case's cause (OpenStax, notes 2.1), and the
  ticks make the ratio follow from it rather than be handed over. OCR's examiners found candidates
  "often thinking that step-down transformers decreased the current" (notes 6.2): the current bar
  rising as the voltage bar falls answers it. The still flux bar sets up lesson 5's check against
  "The higher the load current, the easier a transformer goes into saturation" (notes 6.1).
- **Lesson 5, where the watts go.** The approximate equivalent circuit: shunt branch, series R and
  X, load. A load slider from 0 to 125% and a power factor switch. Bars: iron loss, flat; copper
  loss, growing as the square; output. Below, the efficiency curve with a dot, its peak marked where
  the two loss bars are equal. A flux bar on the core never moves with load. Test switches: open
  circuit (secondary open, rated voltage, wattmeter on the primary) lights only the shunt branch;
  short circuit (secondary shorted, voltage raised until rated current) lights only the series
  branch and shows the small voltage it needed. *Why:* the DOE's two kinds of loss (notes 4.5) are
  two bars with two different shapes. Equal bars at the peak make Electrical Academia's rule (notes
  4.5) visible, and you can confirm it with Calculus lesson 6's zero slope. The tests are what make
  the circuit useful: each lights one branch (NJIT, notes 4.5). The fixed flux bar catches the
  load-saturation error (notes 6.1).
- **Lesson 6, the phasor drop.** The secondary voltage arrow, then the I × R arrow along the
  current and the I × X arrow at right angles to it, tip to tail, closing on a circle of fixed
  supply voltage. Drag the load current and the power factor angle from lagging through unity to
  leading. The output arrow shortens most when lagging and grows past its no-load length when
  leading. The regulation readout follows; the approximate rule sits beside it. A percentage
  impedance slider stretches the R and X arrows; a fault-current bar on the right falls as they
  grow. *Why:* the MCA's phasor diagrams on load (notes 3.2) are what this is, and AC circuits lesson
  6's triangle is the same drawing. Negative regulation (SIU, notes 4.6) needs the angle to be a
  control. The slider puts ABB's misconception (notes 2.6) on one screen: you cannot have low drop
  and low fault current at once.
- **Lesson 7, the clock.** Left, the HV and LV windings drawn as a triangle (delta) and a star, with
  terminal letters and connection pickers. Right, a clock face: the HV line voltage is the twelve
  o'clock hand, the LV line voltage the hour hand. Change a connection and the hour hand jumps 30°
  at a time; the name builds below it (Yy0, Dyn11, Dyn1, Dyn5). A second card: two transformers on
  one board, each with its own group, feeding an open paralleling switch. Their LV arrows are drawn
  together and the gap between their tips is the voltage across the switch, red unless it is zero.
  Close it in red and a circulating-current bar spikes. *Why:* the clock is EEP's own (notes 4.7) and
  Complex numbers' turn (decision above). The gap arrow shows Keentel's "half the system voltage"
  (notes 4.7) as the difference of two arrows, and Dyn11 against Dyn5 as two arrows end to end
  (Taishan, notes 4.7).
- **Lesson 8, the knee on the job.** Lesson 2's B-H knee on the right; on the left, a core with its
  flux as a moving bar and the primary current below. Mode one, switching on: a voltage wave with a
  draggable switch-on point and a residual-flux slider. Press "switch on". The flux climbs as the
  running total of the voltage; started at a zero with flux left in, it overshoots the knee and the
  current spikes red, then dies away over a few cycles. Started at a peak, with no flux left in,
  nothing happens. Mode two, a CT: a fixed primary current and a burden slider from shorted to open.
  Shorted, the flux is tiny; as the burden grows the flux climbs; open, it slams into saturation each
  half cycle and the secondary voltage spikes red with "4000 V measured" cited. A small card for the
  worked example: 440 V in, 115 V out, isolating or auto, with the auto's shared winding and its
  missing isolation shown. *Why:* both hazards are one cause, saturation (IDC; NRC, notes 4.8), and
  one picture shows it twice. NYU's "phase angle of the applied voltage ... and the residual flux"
  (notes 4.8) are the two controls. The CT mode makes the rule a consequence you see, not only a rule
  (Schneider, TasNetworks, notes 4.8).

## 4. What else
- **Benchmark (notes 1, 2).**
  - **Brilliant's Electricity and Magnetism:** 9 lessons, no levels, all on charge and electric
    fields: "Unlocking Electricity ... Parallel Charged Plates" (notes 1.1). Its topics list
    promises Ampère's and Faraday's laws, but no lesson title does; whether magnetism lessons exist
    is UNCONFIRMED (notes 1.1). It has been reshuffled at least twice and no longer appears on the
    Science list (notes 1.2). Its Circuits course is 31 lessons of DC with no magnetism (notes 1.3).
    So Brilliant gives no lesson order or count to match here; it is thin, moving, and not a
    transformer course.
  - **OpenStax University Physics 2:** magnetic fields, sources of fields, induction, inductance,
    AC, then transformers as the last section, ideal only (notes 2.1). No core, no losses, no tests,
    no vector groups.
  - **Khan Academy:** field from current, coils, motors, induction, then stops; no transformer
    lesson (notes 2.2). Its high-school order is lesson 1's model.
  - **Hughes:** electromagnetism, simple magnetic circuits, inductance, the AC chapters, multiphase,
    then 23 transformer sections from principle of action to current transformers (notes 2.3). The
    best single guide to lessons 4 to 8. **Bird** runs the same way; its section lists are
    UNCONFIRMED (notes 2.4).
  - **Schneider's Electrical Installation Guide and the makers (ABB, Siemens, SGB-SMIT):** what an
    installer needs: paralleling, Usc and fault current, sizing and losses, reactive power, vector
    groups, inrush (notes 2.5, 2.6). A Siemens paralleling guide is UNCONFIRMED (notes 2.6).

  What they lack that you need: the physics texts stop at the ideal transformer, and the
  engineering texts take the field for granted. This course joins them, and adds what the
  installer's guides and the makers say an electrician meets: percentage impedance as a trade,
  vector groups and paralleling, inrush, and the CT rule (notes 2.5, 2.6, 4.6 to 4.8).
- **His aim (notes 3).** You have no syllabus for the Navy courses ahead, so the course is planned
  against public standards and the marine syllabi, and where that is a guess it says so.
  - **STCW Table A-III/6** lists "Electro-technology and electrical machines theory" for the
    electro-technical officer; A-III/1 lists generators, paralleling, motors and HV, and names no
    transformer (notes 3.1). The A-III/2 management column is UNCONFIRMED (notes 3.1).
  - **MCA ETO oral syllabus (MSN 1860):** machines theory for "Generator, Motor ... and
    Transformer", "Protection for HV feeder, motors and transformers", and "Polarisation Index test
    for HV transformers" (notes 3.2). MIN 654 (April 2026): "Transformers are evaluated" (notes 3.2).
  - **MCA Chief Engineer, Marine Electro-Technology 4.2:** induced emf and flux linkage, turns
    ratios, "E = 4⋅44.fΦz", phasors "on and off load lag pf only", three-phase connections and
    ratios, the auto-transformer, losses, efficiency, and "the need for instrument transformers"
    (notes 3.2). Lessons 3 to 8 cover every line.
  - **MCA Second Engineer, Marine Electro-Technology 3.1:** field patterns and the grip rule,
    reluctance, air gaps, "S = F/Φ", "B = μ ο μ r H", B-H curves, composite circuits with an air gap,
    Faraday, Lenz, "e = NΔΦ/Δt", and mutual inductance with the transformer as its example (notes
    3.2). Lessons 1 to 3. Composite-circuit sums with fringing are named, not drilled (a choice).
  - **Pearson BTEC Higher Nationals:** Engineering Science 4003's "electromagnetic induction, self
    and mutual induction, solenoid, relay, transformer" (notes 3.4); Electrical Machines unit 21's
    construction, types, three-phase connections (P3), the equivalent circuit (M1) and assessing
    efficiency (D1) (SECONDARY, notes 3.4). The merit and distinction lines set lessons 5 and 6's
    depth.
  - **Public apprenticeship standards:** the engineering technician standard's "maritime
    electrical/electronic engineering technology and principles" (notes 3.3); the marine
    electrician's "Operation principles of different electrical and electronic systems" and AC
    power system testing (notes 3.3); the power protection and commissioning standard names
    "transformers, switchgear, conductors, battery systems" (notes 3.3). None names a transformer in
    its knowledge lines.
  - **My guess:** your Level 3 marine engineering course will treat transformers as plant with a
    nameplate. This course gives you what every line on that plate means (ratio, kVA, impedance,
    vector group, losses) and why, at the depth of the MCA lines, so any transformer you meet reads
    as the same few ideas. That the topic matters for the Level 3 and Level 4 route is a guess,
    supported by the MCA lines and the standards' general wording (notes 3.3).
- **Starting point (notes 3.5, 5).** Nothing below is taught again; each is used with a one-line
  reminder.

  | Idea | Earlier lesson | Used here |
  |---|---|---|
  | Field and flux as diagrams; turns ratio, kVA, iron and copper loss, transformer types | Your EAL Level 3 | Lessons 1, 4, 5 and 8 move fast over them |
  | The turning coil's emf peaks at the flux's fastest change | AC circuits 1 | Lesson 3's recall and Faraday |
  | Rms 0.707, half-cycle average 0.637 | AC circuits 2 | Lesson 3's form factor 1.11 and 4.44 |
  | v = L di/dt, X_L = 2πfL, Lenz by name; X_L = 0 at DC | AC circuits 4; Calculus fundamentals 5 | Lesson 2's recall; lesson 3's inductance and the DC case |
  | Phasors added tip to tail; the voltage triangle | AC circuits 6; Trigonometry 7 | Lesson 6's drop |
  | Power factor; apparent power in VA | AC circuits 8 | Lessons 4 and 5's kVA; lesson 6's angle |
  | Star and delta, √3, line and phase | AC circuits 10 | Lesson 7's ratios and windings |
  | Turning by multiplying; polar multiply | Complex numbers 3, 6 | Lesson 7's clock |
  | Z = R + jX; Ohm's law with j | Complex numbers 7, 8 | Lesson 4's referred Z; lesson 6's drop |
  | The cross product, the right-hand rule, the motor force | Vectors 6 | Lesson 1 leaves the force out |
  | A top where the slope is zero | Calculus fundamentals 6 | Lesson 5's peak efficiency |
  | The definite integral as a running total | Calculus fundamentals 8 | Lesson 8's inrush flux |
  | The capacitor's switch-on spike | Electronics 3 | Lesson 8's recall, a different cause |
  | 12 and 18-pulse rectifiers by name | Electronics 8 | Lesson 7's phase-shift screen |
  | V/f and level flux to base speed | Motors 3 | Lesson 2's last screen; lesson 3's 50 Hz example |
  | The IT supply from an isolating transformer; the insulation monitor | Insulated systems 1, 5 | Lessons 4 and 8's isolation |
  | Prospective fault current at the origin | Design and verification | Lesson 6's fault current |
  | Ratios and per cent of a rated value | Proportional reasoning; Percentages | Lessons 4 and 6 |

- **Where it is used (each cited before a lesson uses it).** Public, general equipment only; nothing
  about any naval vessel (notes 7).
  - **The field (1):** "contactors, relays, and solenoids" (EAL, SECONDARY, notes 5); "solenoid,
    relay, transformer, motors, and generators" (Pearson HN 4003, SECONDARY, notes 3.4).
  - **The magnetic circuit (2):** "magnetic circuits of transformers and electric machines are
    almost invariably laminated" (MIT, notes 4.2); silicon steel cores (NETL, notes 4.2); "the flux
    density (B) of a transformer in operation follows the hysteresis loop" (Eaton, notes 4.2).
  - **Induction (3):** Faraday's law describes "how electric current is generated and how modern
    electronic devices and components function" (Brilliant wiki, notes 1.3); "transformer, engine
    ignition coil" (MCA Second Engineer 3.1, notes 3.2).
  - **The ideal transformer (4):** 440 V stepped down "to 220V or 110V for lighting and low-power
    signal equipment" (marineinspection, SECONDARY, notes 7); "Step-down transformers reduce 440V to
    220V for bridge equipment, navigation lights, and radio communications" (amnautical, SECONDARY,
    notes 7).
  - **The real transformer (5):** load and no-load losses on makers' data (ABB, Siemens, notes 2.6);
    sizing and losses (Schneider, notes 2.5); "Calculates efficiency of a transformer given load
    conditions and losses" (MCA, notes 3.2).
  - **Regulation and impedance (6):** Usc on the plate and the short-circuit current at the
    secondary terminals (Schneider, notes 2.5); the short-circuit calculation (EC&M, notes 4.6).
  - **Three-phase and vector groups (7):** paralleling at an LV switchboard (Schneider, notes 2.5);
    vector groups in transformer protection (ABB, notes 2.6); delta primaries and grounding
    transformers (Maddox, doerry, notes 7).
  - **On the job (8):** CT shorting blocks and VTs on instrument panels (IEEE 45, SECONDARY, notes
    7); inrush and differential relays (ABB, notes 4.8); isolated distribution "by transformers"
    (IEEE 45, SECONDARY, notes 7); two independent ship's service transformers (46 CFR, a US rule,
    notes 7); the shore power transformer (IMO, Wärtsilä, notes 7); an isolation transformer between
    a vessel and shore power (ASEA, notes 7).
- **The mistakes to catch, each with a DO screen and its own hint.** Each is marked with how strong
  its source is.
  - **Lesson 1, flux is the field:** "Magnetic flux seems to be a difficult concept that students
    tend to confuse with the magnetic field" (PRPER 2017, notes 6.1). A DO screen: the field is
    unchanged and the hoop is tilted; has the flux changed?
  - **Lesson 1, the field's shape:** the notes' reading of the same research, that students know a
    current makes a field but not its shape (notes 4.1; not in quotes.json, see gaps). A DO screen:
    which way does a needle point above the wire?
  - **Lesson 2, more current always means more flux:** the notes' reading (notes 4.2), with the
    MCA's "μ r is not a constant" (notes 3.2). A prediction screen: double the current past the knee.
  - **Lesson 3, the unchanging field induces:** "more than 20% of the first-year university
    students explained induced current or emf as being due to the presence of the (unchanging)
    magnetic field" (PRPER 2017, notes 6.1). A DO screen: a strong, steady field; what does the
    meter read?
  - **Lesson 3, no current, no emf:** "difficulties recognizing the induced emf when there was no
    induced current" (PRPER 2017, notes 6.1). A DO screen with the secondary open.
  - **Lesson 3, "opposes the change" as "opposite direction":** (PRPER 2017, notes 6.1). A DO screen
    where the flux is falling, so the induced field points the same way as the main field.
  - **Lesson 3, more primary turns, more flux:** (Lenz and Schmidt, arXiv 1107.2684, notes 6.1). A DO
    screen: 10% more turns on a fixed 440 V supply.
  - **Lesson 3, a transformer on DC:** Bitesize's key fact (notes 4.3), with the reason. A textbook
    point, not a counted mistake. A DO screen: a transformer connected to a battery charger's DC.
  - **Lesson 4, a step-down reduces the current:** "often thinking that step-down transformers
    decreased the current" (OCR examiners' report 2024, notes 6.2). A DO screen on the 440 V to 115 V
    unit.
  - **Lesson 4, the core stores and carries the energy:** listed as a textbook error by Lenz and
    Schmidt (arXiv 1107.2684, notes 6.1). The paper's correction was not seen (UNCONFIRMED, notes
    6.1), so the screen only shows what the sources do say: power in equals power out (Bitesize) and
    the flux is the same at no load and full load (lesson 3, computed). Taught as a check, not a
    cited answer.
  - **Lesson 5, a bigger load saturates the core:** "The higher the load current, the easier a
    transformer goes into saturation" (arXiv 1107.2684, notes 6.1). A DO screen: what happens to the
    flux as the load doubles?
  - **Lesson 5, efficiency effects confused:** "if they were the effects were often confused"
    (Edexcel examiners' report, notes 6.2). A DO screen: which loss falls when the load halves, and
    by how much?
  - **Lesson 5, oversizing costs nothing:** Schneider's "Un necessarily high no-load losses" (notes
    2.5). A maker's caution. A DO screen: a 100 kVA unit on a steady 20 kVA load.
  - **Lesson 6, higher impedance is always better:** "there is a misconception that higher impedance
    values are always better" (ABB, notes 2.6). A DO screen: pick the impedance for a board where
    both the fault current and the volt drop matter.
  - **Lesson 7, same voltage ratio is enough to parallel:** "The coefficient of vector groups must be
    equal" (SGB-SMIT, notes 2.6); "the result is a fault" (Keentel, SECONDARY, notes 4.7). A maker's
    rule. A DO screen: a Dyn11 and a Dyn1, both 440 V to 115 V.
  - **Lesson 8, opening a CT secondary to fit a meter:** "must never be open-circuited" (Schneider,
    notes 4.8). A safety rule. A DO screen: you need to change an ammeter on a live CT circuit; what
    first?
  - **Lesson 8, shorting a VT:** "Never short-circuit the secondary terminal of a voltage
    transformer" (ABB, notes 4.8). A DO screen pairs it with the CT so the two rules are told apart.
  - **Lesson 8, inrush is a fault:** it "appears as an internal fault to the differential relays"
    (ABB, notes 4.8). A DO screen: a breaker trips once on energising and holds the second time.
  - **Lesson 8, an auto-transformer isolates:** "Auto transformer: no isolation" (ASME, notes 4.8). A
    DO screen: feed an insulated 115 V system from 440 V.
  - **Not stated as common:** no source counts these, so they are taught as checks (look at the
    picture, put the answer back), not as cited mistakes.
    - Peak efficiency at full load.
    - Regulation that can never be negative.
    - A Dyn11 unit's LV behind its HV (it is ahead).
    - Losses and fault current worked from kW instead of kVA.
    - 4.44 as a constant of nature rather than 4 × 1.11.
- **Size and cost.** 8 lessons of about 12 screens on the agreed settings (CLAUDE.md).
  - AC circuits measured about 1.09M a lesson all in (docs/plans/work/design-conversation.md), and
    Electronics was estimated at 1.1M to 1.3M. The pictures here are of the same kind (linked
    pictures and curves, phasors), so I estimate about 1.1M to 1.3M a lesson.
  - That is about 9M to 10.5M for the course, plus about 0.3M for the plan. The research is done
    (172 quotes from 63 saved tool results).
  - The full process measured on Fractions lessons 4 to 8 was about 1.65M a lesson, about 13.2M for
    eight.
  - Each build's real cost is reported to you.
- **Lesson 1 first.** Lesson 1 is built and checked before the others (about 1.2M, plus the plan).
  Because you approved the build, the rest follow without waiting for you to try it.
- **Left for later courses, with a one-line look ahead where it fits:**
  - **Generators and paralleling** (Power and machines at sea, built next): the alternator, the AVR,
    the governor, synchronising and load sharing between machines, reverse power. Lesson 3 says in
    one line that a generator is lesson 3 with the flux moved by turning, as AC circuits lesson 1
    showed. Lesson 7 says that paralleling generators is taught there.
  - **Three-phase power systems at sea:** the grounding transformer in full, earthing a delta source,
    transformer protection schemes (MSN 1860's "Protection for HV feeder, motors and transformers",
    notes 3.2), and the shore connection itself. Lessons 7 and 8 give each one line. Where it goes is
    my guess.
  - **Maintenance and condition monitoring:** IR trending and PI on transformers (MSN 1860, notes
    3.2), with HV Subsea Cable Testing's PI already taught. Lesson 8 names it.
  - **Instrumentation and control:** metering and transducers behind the CTs and VTs. Lesson 8
    teaches the instrument transformers themselves.
  - **Not deferred, left out:** tap changers beyond EEP's "Same Position of Tap changer" (notes 4.7);
    zigzag windings beyond the group names; transformer design, cooling classes and oil; harmonics
    in transformers; Biot-Savart, Ampère's law and Maxwell's equations.
- **Gaps to close at build time.** None blocks the build.
  - **Formulas without a clean quote:** the regulation rule R% cos φ + X% sin φ; the load fraction
    for peak efficiency √(iron ÷ copper); L = N² ÷ S; I_fault = I_rated × 100 ÷ Z%; the gap 2 sin(θ ÷
    2); the auto-transformer's share 1 − V2 ÷ V1; the inrush flux reaching twice its peak. Each is
    computed on screen from a shown rule; no screen says a source gives it. EC&M's 5% and 20 times
    does give the fault rule in words (notes 4.6).
  - **4.44** is computed from the form factor and checked as 2π ÷ √2; its source is SECONDARY
    (notes 4.3).
  - **Lesson 1:** the "field shape" difficulty is the notes' reading of PRPER 2017 (notes 4.1); quote
    it from the saved paper before a screen cites it, or keep it as a check.
  - **Lesson 2:** μ0 and a silicon steel saturation level are not quoted. Quote μ0 from a standards
    body and a knee figure from the NETL datasheet already saved, or keep the curve as an example
    steel, labelled, with no absolute numbers. That the loop's area is the energy lost per cycle is
    not quoted: quote it (Hughes or MIT) or say only "each trip round the loop costs energy". The
    air gap's advantage is the notes' reading (notes 4.2).
  - **Lesson 3:** that a 60 Hz design runs hot on 50 Hz is an inference (UNCONFIRMED, notes 4.3); the
    lesson shows the 20% more flux (computed) and makes no claim about heat.
  - **Lesson 4:** the Lenz and Schmidt correction for the core-energy error is UNCONFIRMED (notes
    6.1). Referred impedance is SECONDARY (notes 4.4).
  - **Lesson 5:** most test and efficiency quotes are SECONDARY (notes 4.5); the DOE, ABB and Siemens
    lines are primary and carry the loss rules.
  - **Lesson 6:** the definition of regulation as a fraction of the no-load voltage is not quoted;
    take it from the SIU notes already saved. Schneider's sentence on the 0.8 lagging drop is cut off
    before its figure (SECONDARY, notes 2.5), so no figure is used from it. Typical Usc values (figure
    G33) were not read; every impedance is an example, labelled.
  - **Lesson 7:** the vector-group sources are SECONDARY except ABB and SGB-SMIT (notes 2.6, 4.7). The
    12-pulse phase-shift screen has no quote (computed). Siemens's paralleling guide is UNCONFIRMED
    (notes 2.6).
  - **Lesson 8:** 115 V has no public source (UNCONFIRMED, notes 4.8); it is your outline's figure. The
    insulation monitor's "entire electrically-connected circuit" line is in the Insulated systems
    notes, not these; copy it in or drop the line. Hall's Practical Marine Electrical Knowledge was
    reachable only on a copy site (UNCONFIRMED, notes 7).
  - **Elsewhere:** Brilliant's magnetism lessons (notes 1.1), Bird's section lists (notes 2.4), STCW
    A-III/2 (notes 3.1) and which BTEC optional units you took (notes 3.5) are UNCONFIRMED. None
    changes a lesson.
  - **Nothing naval.** No naval or submarine source was used, and the SMQ books on your Drive were not
    read (notes 3.5).
