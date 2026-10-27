# Insulated systems and earth faults: the course brief

Written 27 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
the first course in the Electrical shelf's Supply systems folder: "Why the first earth fault on an
unearthed supply trips nothing, what an insulation monitor reads, and how to find the fault."
Batteries is the folder's second course and is being built alongside this one. You chose this
course on 27 Oct and approved the build, so I have taken the decisions for you and listed them
below. Change any you like. Sources and quotes are in `research-notes.md` beside this file (346
quotes, cut by script from the 76 saved tool results and checked with `tools/eval/sources.mjs`,
`ok: 346, failed: 0`). Section numbers below point there.

## The short version
**Eight lessons**
1. Where the star point goes: TN, TT and IT (built first)
2. The first earth fault: the triangle shifts
3. Earthed through capacitance
4. The second fault
5. Watching the insulation live
6. Insulated DC: reading the two poles
7. Finding the fault
8. Arcing faults, drives and safe working

**The main pictures** (one per lesson, each moved with your finger, each showing the cause):
- **The star point switch (lesson 1).** A three-phase source drawn as a star, a cable, a motor
  frame and the hull or earth beneath. A switch sets what the star point does: tied to earth (TN),
  tied to its own earth with the load on another (TT), or left floating (IT). Tap to put a fault
  from one phase onto the frame. The current path lights up, and its size decides the ending: TN
  and TT trip, IT carries on and raises an alarm.
- **The shifting triangle (lesson 2).** The three phase voltages drawn as AC circuits' star, with
  the earth as a dot. Healthy, the dot sits at the star point and each phase is 254 V from it on
  440 V. Drag a fault resistance on one phase from open to solid. The dot slides along a curve to
  that phase's tip, the line-to-line triangle stays the same size, and three voltmeters to earth
  read the healthy phases climbing to 440 V.
- **The cable that is a capacitor (lesson 3).** A feeder drawn with small capacitors from each
  phase to the hull along its length. Drag the length and switch filters in. Healthy, three charging
  currents cancel. Put a solid fault on one phase and two arrows, the healthy phases' currents at
  line voltage, add head to tail into the fault current, with the readout 3 × ω × C × V_phase. A
  second mode puts a person on a live phase instead of a fault.
- **Two faults through the hull (lesson 4).** A switchboard with two feeders and the hull below.
  Lesson 2's first fault sits on one feeder. Drop a second fault on the other feeder and pick its
  phase. Same phase, nothing happens. Different phase, a loop lights through both circuits and the
  hull, driven by line voltage, and its current is set against each breaker's trip.
- **Lamps and the monitor (lesson 5).** One board carrying three earth lamps and an insulation
  monitor. Drag a fault onto any phase: the lamps follow lesson 2's shifted voltages, one dimming
  and two brightening. Switch to "all phases damp": the lamps stay equal while the monitor's
  reading falls. The monitor's dial reads the total of all feeders in parallel, against an alarm
  line set in ohms per volt from three published sources.
- **The two poles (lesson 6).** A DC board, positive and negative, with two equal detector
  resistors to earth and a voltmeter switched pole to pole. Drag each pole's insulation down. The
  two pole-to-earth voltages share the bus as a potential divider, and the pole with the fault
  falls towards zero. A symmetrical leak leaves them equal.
- **The hunt (lesson 7).** A board of feeders, one hiding an earth fault, with the monitor in alarm.
  Choose a method. Open feeders one at a time and watch the reading recover, or lose the fault
  when its load goes off. Inject a slow test pulse and clamp each feeder: only the faulty one
  carries the pulse. Then isolate that circuit and test it dead.
- **The restrike ladder (lesson 8).** One phase's voltage to earth, an arcing fault and the
  system's capacitance. Each time you strike the arc it goes out at the next current zero, the
  capacitance keeps its charge, and the next strike starts higher. A damping slider shows the
  contested point: with heavy losses the ladder never climbs. A second card shows a drive's filter
  on an insulated supply.

### Decisions taken for you (say if you want any changed)
- **Eight lessons, one per part of the scope, in your order.** Each part has at least two
  independent sources (notes 8.2). Lesson 8 is the fullest. If you want nine, it splits into
  arcing faults, and drives and safe working, as the notes suggest, but only if arcing gets its own
  interactive (notes 8.2). If you want seven, lessons 4 and 5 could merge, since the second fault
  is short (my reading).
- **The second fault comes before the monitor.** Every benchmark teaches monitoring first and the
  second fault after (Cahier 178, the Electrical Installation Guide, Bender, notes 1.3, 2.1). Your
  order is kept, because the second fault is the reason the monitor exists (notes 0.2). Lesson 5
  opens on that reason.
- **Lesson 1 is built first, then the rest without a pause.** You approved the build, so the others
  follow without waiting. Try lesson 1 on your phone as soon as it lands; if something is wrong, the
  rest will be changed before they are built.
- **Steps lessons, with a little more explaining ("Partly", RUNBOOK section 0, item 3).** About 12
  screens each, SHOW then DO, ending on two or three mixed puzzles. SHOW screens may carry a short
  paragraph, at most about 90 words (your 21 Oct note on Motors lesson 1). Every lesson has one
  picture you move, and it asks you to predict before you play (notes 6.5).
- **A recall opener only where an earlier course carries the lesson:** lesson 2 (AC circuits lesson
  10, line voltage is √3 times phase voltage), lesson 3 (AC circuits lesson 5, X_C), lesson 4
  (Design and verification lesson 6, a fault current from Zs), lesson 5 (HV Subsea Cable Testing
  lesson 5, the charging current at 0.1 Hz against 50 Hz), lesson 7 (HV Subsea Cable Testing lesson
  3, insulation resistance over ten minutes) and lesson 8 (AC circuits lesson 5, a capacitor's current
  leads its voltage by 90°). A right answer says "Still there" and carries on.
- **Pitched above your BS 7671.** Your Level 3 covers "TN-S, TNC-S, and TT" with "Awareness only of
  other earthing systems in BS 7671 (such as IT in an operating theatre)" (EAL, notes 3.5). So TN and
  TT get one screen each in lesson 1, as the contrast, and everything after is IT. Automatic
  disconnection, Zs and RCDs are used, never taught (Design and verification lesson 6).
- **One running example: 440 V, 60 Hz, three wires.** "The typical low-voltage distribution on a
  merchant ship, for example 440 V at 60 Hz, is an insulated (IT) system" (Marine Insight, SECONDARY,
  notes 4.1), "3 phase, 3 wire insulated" is one of the MCA's three AC arrangements (MSIS 27, notes
  2.3), and 440 V is your plant's public nominal supply (CLAUDE.md). So 440 V line, 254 V phase
  (computed), at 60 Hz. It is an example, never a claim about any boat. The sources' own figures
  (Eaton's 480 V, Schneider's 230/400 V at 50 Hz, the IMarEST paper's 450 V) are worked as they give
  them, so you see the rule hold on each.
- **The first-fault current is taught as one rule, computed, and checked against four sources.**
  I_fault = 3 × ω × C × V_phase, with C the capacitance per phase (computed, notes 4.3). It matches
  the IMarEST paper's 0.3 to 1.5 A, Schneider's table, Eaton's 1.04 A and Cahier 178's 12.7 kΩ a
  kilometre (all recomputed in notes 4.3). No source prints the rule itself, so it is derived on
  screen from AC circuits lesson 5's X_C and lesson 6's phasor sum, never said to be quoted.
- **Schneider's "factor of 4" is explained, not copied.** The Guide says the capacitive current
  "increases by a factor of 4 during phase-to-earth fault" (notes 4.3). On three wires the factor is
  3. The 4 counts a distributed neutral's own capacitance, which a three-wire system has none of
  (computed, my reading). Lesson 3 shows both and says which is yours.
- **The partly resistive fault is drawn as it really moves.** With a fault resistance R and
  capacitance C per phase, the earth point sits at V_A ÷ (1 + j3ωCR) from the star point (computed
  from lesson 3's rule). As R falls it slides along a semicircle to the faulted phase's tip, and one
  healthy phase passes line voltage on the way, by up to about 5% (computed, 463 V on 440 V). No
  source in the notes states this, so it is shown as the picture's own sum and flagged in the gaps.
- **Alarm levels in ohms per volt are taught as disagreeing, each with its source.** A class rule
  (GL) says 50 Ω/V, Bender's booklet about 100, a trade article calls 100 "typical", a Bender white
  paper 500, and IEC 61557-8 leaves the value to the maker (notes 4.5, 2.2). On 440 V that is 22 kΩ,
  44 kΩ and 220 kΩ (computed). Lesson 5 shows why: the levels guard different things, power, fire
  and control circuits (notes 4.5). No single figure is taught as the rule.
- **Arcing overvoltages are taught as contested.** Eaton describes the restrike ladder and measured
  "1200 V or higher" on 480 V plants (notes 4.8). The IMarEST paper says marine systems are so
  heavily damped that such overvoltages "just cannot occur", and Bender's brochure says arcing
  faults "do not occur" (notes 4.8). No marine low-voltage measurement was found (notes 9). Lesson 8
  shows the mechanism, puts the damping on a slider, and says the question is open.
- **One Bender sentence reads backwards and is not used for its claim.** Bender UK's insulation
  monitoring page says symmetrical faults on DC are common, then that monitors "ope-rating on the
  basis of the principle of superimposed voltage measurement will not be able to detect" them (notes
  4.6). The same page says IEC 61557-8 requires monitors to see "both symmetrical and asymmetrical
  deteriorations", and that unbalance monitors are "not insulation monitoring devices" (notes 4.5). It
  is the unbalance method that is blind to a symmetrical fault, as Bender's own US page says of the
  "three lightbulb" method (notes 4.5). Lesson 6 quotes only the page's first sentence.
- **Vertiv's "equal readings mean a false alarm" is taught with its trap.** Vertiv's rule for
  checking a bridge alarm is quoted (notes 4.6). Equal halves also hide a symmetrical leak (notes
  4.6, Bender, and the notes' own reading), so lesson 6 teaches "equal means balanced, not
  necessarily healthy" and sends you to the injecting monitor's reading.
- **BS 7671 is named, never reproduced.** Regulation 411.6.4 sets the second-fault rule "similar to
  TN systems" (IET Wiring Matters, notes 3.5). Its formula is not in the notes, so lesson 4 teaches
  the second fault from the Schneider Guide's "double the loop impedance" (notes 4.4) with example
  numbers, and points to the regulation by number.
- **Insulation resistance testing is used, never re-taught.** You have it from your trade (EAL lists
  it, notes 3.5) and in depth from HV Subsea Cable Testing lessons 1 and 3. Lesson 7 adds only what
  is new: an in-service monitor reads the same quantity live, so the dead test must take the monitor
  and the electronics off first (notes 4.7).
- **Electronics lesson 8 goes deeper, not over.** It said a drive's filter must be disconnected on
  an insulated supply and that a monitor can alarm at start-up (notes 5). Lesson 8 here shows why with
  lesson 3's picture, a filter as a partial earth through capacitance, and adds what Electronics did
  not: the monitor that must suit non-linear loads, DC components that distort an AC monitor, the
  slower reading, and the EMC cost of taking the filter out (ABB, Schneider, Bender, Cahier, notes 4.8).
- **This course takes over ground another shelf entry still names.** "Three-phase power systems at
  sea" (Power and machines at sea) lists "insulated and earthed neutrals, and earth fault detection",
  and the Electronics brief deferred them there. They are now taught here. That course should point
  here and keep generators, excitation and paralleling. "Fault-finding: from symptom to cause" keeps
  its worked case of "an earth on a ship's board", using this course's method. "Maintenance and
  condition monitoring" keeps insulation resistance trends.
- **Examples are public, general marine and industrial equipment.** Merchant-ship distribution,
  reefer containers, operating theatres, rail signalling, a stationary battery plant, an electric
  vehicle's high-voltage system, drives and UPSs. Nothing about how the Royal Navy or any boat does
  it, nothing beyond CLAUDE.md's public outline, and nothing from your SMQ books (notes, preamble).
  Where a source mentioned warships or the navy in passing, it was not used (notes, preamble; 4.3).
- **Colour as before.** Ink for circuits, phasors and controls; a conducting path is bold ink and an
  idle one pale ink. Amber for key terms, teal for small labels (V, I, C, R_F, "phase", "line",
  "earth"). Red only for warnings and mistakes: a fault current that trips, the second fault's loop,
  a person on a live conductor, an overvoltage past the insulation's rating, an alarm. Green only for
  finished.
- **Your intake answers** (`intake.json`): to understand insulated systems and earth faults and how
  to work with them; on the job and in everyday life; hands-on, with the why explained in full.

## 1. The overall topic
Every supply has a star point, and what it does decides what an earth fault does. Tie it to earth
and the first fault is a short circuit that trips: that is TN and TT, your BS 7671 world. Leave it
floating and the first fault has no deliberate way home. Nothing trips, the loads keep running, and
the voltage triangle shifts so the faulted phase sits at earth and the two healthy phases rise to
line voltage to earth. That is the insulated, or IT, system, chosen at sea for continuity of supply.
It is never truly floating. Every cable, winding and filter is a capacitor to the hull, so a first
fault passes a charging current that grows with the size of the system, from milliamps to amps. The
danger is the second fault, on a different phase: a phase-to-phase short through the hull. So the
first fault must be seen at once and found fast. Earth lamps show it crudely. An insulation monitor
injects its own small DC or slow signal and reads the whole system's resistance to earth, against an
alarm level in ohms per volt that published guidance does not agree on. A DC board with no earthed
pole is the same idea with two conductors, read by the two pole-to-earth voltages. The fault is found
by opening circuits, or by injecting a slow pulse and clamping each feeder, then testing the circuit
dead. Last, the dangers peculiar to it: an arcing fault that can pump the voltage up, drive filters
that earth the system through capacitors and fool the monitor, and a floating system that will
still kill you.

**It builds on:**
- **Your trade:** TN-S, TN-C-S and TT, automatic disconnection, Zs, RCDs and how they sum the
  currents through them, insulation resistance testing and safe isolation (EAL, notes 3.5).
- **AC circuits:** the capacitor's current leading its voltage by 90°, X_C = 1/(2πfC) (lesson 5);
  phasors added head to tail (lesson 6); three-phase star, line voltage √3 times phase voltage, and
  balanced currents cancelling in a neutral (lesson 10).
- **Design and verification:** shock protection, Zs and the fault current that makes a device trip
  (lesson 6).
- **HV Subsea Cable Testing:** the isolated core as a charged capacitor (lesson 1); insulation
  resistance over ten minutes, DAR and PI (lesson 3); a cable's charging current at 0.1 Hz against
  50 Hz (lesson 5); finding a fault on a cable (lesson 6, TDR, a different method from this one).
- **Electronics and power electronics:** a drive's EMC filter capacitors to earth, and the one-line
  insulated supply of lesson 8.
- **Foundations:** Trigonometry and Complex numbers and Vectors (the phasors, cos 30°); Exponentials
  and logarithms lesson 3 (five time constants, for the monitor's response time); Proportional
  reasoning (the potential divider, ohms per volt).

**Not taught again:** TN and TT in detail, ADS and Zs tables, RCD types, X_C, phasor addition,
three-phase √3, the time constant, insulation resistance testing, DAR and PI, the drive's blocks.
Each is used with a one-line reminder, and only what is new is taught.

**Taught inline, because you have not met them** (notes 5): earth and the hull as a conductor and a
reference, and why a system can float; leakage resistances to earth in parallel, so a monitor reads
the total; ohms per volt as a unit; the potential divider formed by two poles' leakage to earth; the
capacitive current formula applied to leakage; an arc going out at current zero, when a capacitor's
voltage is at its peak.

**Edges.** In: TN, TT and IT by the star point; high-impedance earthing named as IT's variant; the
first fault on three-phase AC; capacitance to earth and the charging current; the second fault;
earth lamps, unbalance monitors and injecting insulation monitors; alarm levels; insulated DC buses
and the bridge method; finding a fault live and dead; arcing faults and overvoltage limiters; drives
and filters on IT; safe working on a floating system. Out: cells, charging and hydrogen (Batteries);
generator neutrals, neutral earthing resistor sizing, and coupling switchboards with their monitors
(Generators and paralleling); an isolating transformer's magnetics (Transformers and magnetism); HV
earthing in depth, polarisation index and IR trending (HV Subsea Cable Testing, Maintenance and
condition monitoring); medical IT systems beyond a named use.

## 2. The lessons, in the order they build
The order is your scope's. The benchmarks' order is the same with the second fault after the
monitor (Cahier 178, the Electrical Installation Guide, Bender, notes 1.3, 2.1, 0.2).

| # | Lesson | What it teaches |
|---|---|---|
| 1 | Where the star point goes: TN, TT and IT | "BS 7671 lists five types of earthing system, TN-S, TN-C-S, TT, TN-C and IT" (IET Wiring Matters, notes 3.5). Taught inline: earth and the hull as a conductor and a reference (notes 5). The letters are what the star point does. TN-S has "the neutral of the source of energy connected with earth at one point only" (IET, notes 3.5); TT, "the consumer must provide his or her own connection to earth" (IET, notes 3.5); IT, "the source transformer is isolated from earth, whilst all exposed conductive parts of the installation are connected to earth electrodes" (IET railways, notes 3.5), or "connected to earth through a high impedance (commonly 1500 Ω or more)" (EIG, notes 4.1). The first fault decides it. TN: "Interruption for the first fault using overcurrent protection" (EIG, notes 2.1), your ADS. IT: "the system can continue to operate without interruption. Such a fault is referred to as a “first fault”" (EIG, notes 2.1). Current returns to its source: "the current leaves the source and returns back to the source" (nVent, notes 6.1), and on IT there is no deliberate way back. On a first fault "contact voltage on a first insulation fault is always less than safety voltage" (Cahier 178, notes 4.4). Why ships: "Insulated neutral systems are primarily adopted to avoid the risk of loss of essential services, such as steering gear and vital engine room auxiliaries" (marine course note, SECONDARY, notes 4.1); "two-wire unearthed distribution systems were introduced to prevent the immediate loss of an essential service resulting from an earth fault" (IMarEST, notes 4.1); "Shutdown can lead to dangerous situations at sea" (Bender, notes 4.1). "The majority of ships have a 3 phase, 3 wire, 440V insulated neutral system" (SECONDARY, notes 2.4). The price: "Requires maintenance personnel for monitoring and operation" and "a high level of insulation in the network" (EIG, notes 2.1). The exception that shows the rule: HV ship systems "usually have their neutral points earthed through a resistor to the ship's hull" (SECONDARY, notes 4.1). Ashore, IT "is not permitted for a low voltage public supply in the UK" (IET, notes 3.5), but it is "compulsory in hospital operating theatres" in France (Cahier, notes 7.1), used for rail signalling (ARTC, notes 7.1) and EV drive systems (Bender, notes 7.1). |
| 2 | The first earth fault: the triangle shifts | Recall: the line voltage of a 254 V-a-phase star (AC circuits lesson 10). "In IT system, the first fault to earth should not cause any disconnection. The earth-fault current which flows under a first-fault condition is measured in mA" (EIG, notes 4.2); lesson 3 shows when it is amps. What does change is the voltage to earth. Faults "essentially shift the normal balanced voltage triangle" (EEP, notes 4.2): "the system voltage triangle does not collapse during the fault; rather, it shifts" (SEL, notes 4.2). "When the first insulation fault occurs, the phase-to-earth voltage of the sound phases is permanently brought to the phase-to-phase voltage of the network" (Cahier 178, notes 4.2), "√3 times the normal phase voltage" (EIG, notes 4.2), and "the neutral point to rise to a value equal to VL-N" (Eaton, notes 4.2). The phasor picture is AC circuits lesson 10's star used backwards: with phase A at earth, the arrows from earth to B and C are line voltages, 60° apart (computed, notes 4.2). On 440 V: faulted phase 0 V, healthy phases 254 V → 440 V, star point 254 V from earth (computed). The loads see only line-to-line voltages, which do not change, so they keep running (computed). A partly resistive fault: with an example 1 µF a phase at 60 Hz and 1 kΩ, the star point sits 168 V from earth and the phases read 190, 256 and 420 V (computed by the picture's rule, example values). The cost: "the insulation is overstressed by 73 percent" (Eaton, notes 4.2), so "All insulation (of cables, consumers, transformers, generators, etc.) shall be designed for the phase-to-phase voltage, if earth-faults will not be isolated immediately" (GL, SECONDARY, notes 2.3), and "The equipment rating has to be rated at 173% of their line-to-neutral voltages" (Eaton, notes 4.2). |
| 3 | Earthed through capacitance | Recall: X_C of 1 µF at 60 Hz (AC circuits lesson 5; 2.65 kΩ, computed). Of the insulated system: "although called ungrounded, this type of system is in reality coupled to ground through the distributed capacitance of its phase windings and conductors" (Eaton, notes 4.3), and "the system is naturally earthed by the stray capacitances of the cables" (IET, notes 3.5). It comes from "the proximity of cables and conductors to the hull structure and also of machine windings to earthed stator cores" (IMarEST, notes 4.3), and "The biggest source of leakage capacitances nowadays is not the cable network but the filter capacity of poorly chosen vari- able frequency drives and switched- mode power supplies" (Bender, notes 4.3), at "10…100 nF" each (Bender, notes 4.3). They are in parallel, so "their values add up" (Bender, notes 4.3). A new cable has "approximately 0.25 µF, i.e. 12.7 kΩ at 50 Hz" a kilometre (Cahier 178, notes 4.3; recomputed). Healthy: three equal charging currents 120° apart cancel, AC circuits lesson 10's neutral, and "we can measure this charging current as the current flowing out of the transformer even with all loads switched off" (Eaton, notes 4.3). Faulted: "the current must return through the distributed capacitance (insulation system) of the two unfaulted phases" (Eaton, notes 4.3): each at line voltage, 60° apart, summing to three times one phase's charging current. Eaton's own sum: "Ioa =Iob =(480 V)/–j800Ω = 0.6 A (0.6) COS 30º + (0.6) COS 30º =1.04 A" (notes 4.3). So I_fault = 3ωC V_phase (computed, notes 4.3). On 440 V at 60 Hz: 1 µF a phase gives 0.29 A, 5 µF gives 1.44 A (computed), the IMarEST paper's "0.3 to 1.5 A, increasing to perhaps 15 A where large numbers of RFI capacitors are installed" (notes 4.3). Big systems: "7-10 A/phase" (IMarEST discussion, notes 4.3). "The 1 to 2 amp “charging current” is typical for 480 V systems" (Eaton, notes 4.3). Schneider's table, 1 µF to 0.07 A, is the total over three phases at 230 V, 50 Hz (EIG, notes 4.3; computed). A person on a live phase: no fault needed, the capacitance closes the loop. With an example 1,000 Ω body, 1 µF a phase passes about 190 mA and 10 nF a phase about 3 mA (computed, example values). "Personnel who assume that the floating DC bus is not connected to ground can be electrocuted" (Vertiv, notes 4.6) says the same of DC. Size is the limit: "The larger the system, the smaller the impedance between active conductors and earth" (Bender, notes 4.3); "Use of the IT system is thus advised against for very long networks" (Cahier, notes 4.3). Verification: IEC 60364-6 checks an IT system "by calculation or measurement of the current _I_ d in case of a first fault" (notes 3.5). |
| 4 | The second fault | Recall: a fault current from Zs (Design and verification lesson 6). "The second fault (by definition) is an earth fault affecting a different live conductor than that of the first fault" (EIG, notes 4.4). It "results in a short-circuit between active conductors (phases or neutral) through the earth and/or through PE bonding conductors (unless occurring on the same conductor as the first fault)" (EIG, notes 4.4): at sea, "a phase-to-phase short circuit through the hull, with heavy current and tripping" (Marine Insight, SECONDARY, notes 4.4). "Although nothing happens after a single ground fault, the second ground fault acts like a phase-to-phase fault" (Eaton, notes 4.4). Protection is your overcurrent device: "Interruption for the second fault using overcurrent protection" (EIG, notes 2.1), and "it is conventional to double the loop impedance of a circuit" (EIG, notes 4.4), because the loop runs out through one circuit and back through the other. Example: two circuits each with a 0.4 Ω phase-and-protective loop give 440 ÷ 0.8 = 550 A (computed, example values). BS 7671 covers it in "Regulation 411.6.4" (IET, notes 3.5); named only. Why a first fault cannot wait: the healthy phases' insulation is at line voltage, so "the longer the ground is allowed to remain the greater the likelihood of a second ground occurring on another phase" (Eaton, notes 4.2). A second fault "can trip essential services, damage equipment and start a fire" (Marine Insight, SECONDARY, notes 4.4) and "will introduce the risk of electric shock" (Bender, notes 4.4). So "It is recommended that a first fault be eliminated with the shortest practicable delay" (IEC 60364-4-41, notes 2.2), and a ship guideline says "fault shall be location detected and de- coupled in the shortest possible time period" (IRS, notes 2.3). The payoff, as a model: with a day to find and fix each fault, "the average time between two double faults is 8,190 days" and availability "91 times better in IT than in TN or TT" (Cahier 178, notes 4.4). |
| 5 | Watching the insulation live | Recall: why a VLF test set runs at 0.1 Hz (HV Subsea Cable Testing lesson 5). The rule: a device on every insulated system "to monitor continuously the insulation level to earth and to operate an alarm" (Lloyd's Register, SECONDARY, notes 2.3); IEC 60092-201 says the same (via Bender, notes 2.3); its signal "shall continue as long as the fault persists" (IEC 60364-4-41, notes 2.2). Earth lamps: "3 lamps connected between the phases and the earth ... On a sound network, the three lamps form a balanced three-phase load, all lit and with the same brilliance" (Cahier 178, notes 4.5); at a fault "one of the three lamps is short-circuited by the fault impedance" (Cahier, notes 4.5) and "the other lamps will glow brighter" (marine course note, SECONDARY, notes 4.5). Each lamp reads its phase's voltage to earth, so it shows lesson 2's shift (computed): 254 V each healthy, 0 and 440 V at a solid fault, about three times the power for a fixed resistance (computed; a filament is not fixed). Small vessels: lamps "of the metal filament type not exceeding 30 watts ... should not be powered except for “testing” or in the event of an earth fault" (MGN 628, notes 2.3). The blind spot: such methods "cannot detect symmetrical failures" (Bender, notes 4.5), and unbalance devices "are not insulation monitoring devices" under IEC 61557-8 (Bender, notes 4.5). The monitor: it "superimposes a measuring voltage U m", and a fault closes the circuit, "generating a measuring current I m that is proportional to the insulation fault" (Bender, notes 4.5), "Much like an ohmmeter" (Bender, notes 4.5). It uses "very low frequency a.c. current, or of d.c. current, (to reduce the effects of cable capacitance to negligible levels)" (EIG, notes 4.5), the VLF reason again. Taught inline: leakage paths in parallel, so it reads "the resistive leakage of all outgoing lines connected in parallel to earth" (Bender, notes 4.5), "the entire electrically-connected circuit" (Siemens, notes 4.5). One per system: "Do not connect insulation monitoring devices in parallel" (Bender, notes 4.5). Its response slows with capacitance, "5 τ = _R_ I x _C_ e" (Bender, notes 4.5; Exponentials lesson 3). Taught inline: ohms per volt. "50 ohms per volt" (GL, SECONDARY), "approx. 100 Ω/V" (Bender), "typical ... 100 ohms/volt" (Power Systems Design), "500 ohms/volt" (Bender white paper), and "the value declared by the manufacturer" (IEC 61557-8, notes 4.5, 2.2): on 440 V, 22, 44 and 220 kΩ (computed). Example: ten feeders at 2 MΩ and one at 30 kΩ read 26.1 kΩ together, an alarm at 100 Ω/V and not at 50 (computed, example values). What the levels guard: "an acute fire risk even at powers of ≥ 60 W" (Bender), at most 1.5 W through 44 kΩ but 64.5 W through 1 kΩ on 440 V (computed, an upper bound); and control circuits, "an insulation fault of 24 kΩ at 24 V means a leakage current of 1 mA" (Bender, notes 4.5). Settings: "a first setting at 20% below the insulation level of the new installation" (EIG), and "humidity can reduce the general level of insulation resistance" (EIG, notes 4.5). |
| 6 | Insulated DC: reading the two poles | A DC board is "normally ungrounded, i.e. the positive and negative buses thereof are insulated from the ground" (patent background, notes 4.6), as are a ship's "DC 24 V" control systems (Bender, notes 7.2) and "Battery networks" (ABB, notes 4.6). Batteries owns the cells; this is the earth side only. The lamp version: "the lamps both glow with half voltage when no other ground connection is made. When the negative is shorted to the ground terminal, the opposite lamp glows to full brightness" (Vertiv, notes 4.6). The voltmeter version: "switched to either the battery positive and building ground or the battery negative and building ground" (Vertiv, notes 4.6). The bridge: "a balanced bridge with equal resistor elements", which alarms "Once the bridge becomes imbalanced" (Vertiv, notes 4.6). Taught inline: the potential divider. "The bus with lower ground resistance has a lower voltage to ground" (patent, notes 4.6), and its worked case, "(100/(500+51)×51=9.26 V)" (notes 4.6). Example: a 220 V board, 100 kΩ detector each side, negative leaking to 20 kΩ, reads 31.4 V and 188.6 V (computed, example values). Reading it: "full voltage with one measurement and zero volts with the other" is "a direct short to the bus on the side that measures zero"; "a slight difference" is "a partial short"; equal halves and "the alarm is false" (Vertiv, notes 4.6). The trap: "Symmetrical insulation faults are common in DC voltage systems and control circuits" (Bender, notes 4.6), and a symmetrical leak leaves the halves equal (computed), so equal means balanced, not healthy; the injecting monitor of lesson 5 still sees it. The detector is a path too: "we end up adding the fault that we are trying to detect" (Vertiv), and several detectors "add in parallel" (Vertiv, notes 4.6). A single fault in theory "does not produce a leakage current", but stray capacitors give "some paths" until they charge (patent, notes 4.6), lesson 3 on DC. The second fault: "this sets the stage for a short if the other pole gets shorted to ground as well" (Vertiv, notes 4.6). Touch: safe only below "120 V (DC)" (Bender, notes 4.8). |
| 7 | Finding the fault | Recall: what a falling insulation resistance over ten minutes tells you (HV Subsea Cable Testing lesson 3). The duty: "Detection of electric malfunction, location of faults and measures to prevent damage" (STCW A-III/1, SECONDARY, notes 3.1); "knowledge of earthing systems and earth fault finding procedures" (MSN 1860, notes 3.2). Sectionalising: "isolate circuits one at a time, with permission and with essential services covered, until the reading recovers" (Marine Insight, SECONDARY, notes 4.7), "usually done by trial and error" (Eaton, notes 4.4). Its limits at sea: "not all systems can be switched off on sea and the fault could disappear because the faulty load is already switched off" (Bender, notes 4.7). On DC, "shed the loads one at a time" (Vertiv, notes 4.6). Injection: a locating system "injects a locating current between the electrical system and earth and locates the insulation fault" (IEC 61557-9, notes 4.7). "The test current pulse flows from the insulation fault test device via the live conductors, the insulation fault Rf and the earth wire (PE conductor) and back" (Bender), it is "limited to a maximum value" (Bender), and it "is detected by all measuring current transformers on the circuit" (Bender, notes 4.7). Each CT is "a toroidal CT embracing the conductors of the circuit concerned" (EIG, notes 4.7), so load currents cancel through it, your RCD's principle. Portable sets inject "1…25 mA" with "Measuring clamps 20/52 mm" (Bender, notes 4.7). Why slow: "Choice of low frequency for fault tracking ensures no disturbance by network leakage capacities, but this frequency cannot be less than 2.5 Hz" (Cahier 178, notes 4.7). A plain clamp at supply frequency "is not reliable for networks with a large number of feeders some of which are highly capacitive" (Cahier, notes 4.7): lesson 3's charging current reads on every feeder. On DC: "Place the CT around the return line as well as the line you are measuring" and "Only supply test current on one side" (IEEE symposium, notes 4.6). Then dead: "Insulation measurement and insulation monitoring are terms that are easily mixed up" (Bender, notes 4.7). Isolate, then test "between ... All current carrying parts connected together and earth" and "All current carrying parts of different polarity or phase" (MSIS 27, notes 2.3), at "at least 500 V" DC for a switchboard (GL, SECONDARY, notes 4.7), with "approximately one megohm for each 1,000 volts of operating voltage, with a minimum value of one megohm" as a rule of thumb (Megger, notes 4.7). First, "disconnect the monitoring device" (ABB, notes 4.5) and disconnect equipment that "may influence or be damaged by the insulation test" (IEC 60364-6, notes 3.5); MSN 1860 lists the precautions "on equipment incorporated with electronic circuit and devices" (notes 3.2). A dead load is invisible to the live monitor: "Insulation faults in deenergised loads cannot be measured with the insu- lation monitoring device of the feeding system" (Bender, notes 4.7). Common causes: "water in junction boxes and deck lights, damaged cables, and insulation breaking down in motors and heaters" (Marine Insight, SECONDARY, notes 4.7). |
| 8 | Arcing faults, drives and safe working | Recall: where a capacitor's current is when its voltage peaks (AC circuits lesson 5). Taught inline: the arc out at current zero. "The arc, by definition, must extinguish at the next current zero ... since this current leads the voltage by 90 degrees, the voltage across the phase-to-ground capacitor is at a maximum when the arc extinguishes" (Eaton, notes 4.8). It "remains at whatever value it was prior to the arc interruption" (Eaton), so half a cycle later the phase is "_twice_ the first line to ground voltage", then the neutral is at "3 times the initial VL-N" and the phase reaches "4 times the initial phase-to-ground voltage" (Eaton, notes 4.8), "until some device fails, typically a lower BIL (Basic Impulse Level) device" (Eaton, notes 4.8). Measured: "line-to- ground voltages of 1200 V or higher" on 480 V (Eaton, notes 4.8), 4.3 times the 277 V line-to-earth voltage (computed); "a potential maximum of +5 pu" (EEP, notes 4.8). Contested: the IMarEST paper gives "7.5 times the normal rated values" in theory, then "Such overvoltages are not a problem on marine systems, however, because of their higher losses and consequent heavy damping" (notes 4.8); Bender says arcing faults "do not occur" (a maker's brochure, notes 4.8). The arc itself: "a prospective earth fault current of 1 A would therefore have an earth fault arc power dissipation of only a few watts" (IMarEST, notes 4.8). The remedies, named: "A device for limiting the voltage which the neutral point ... can reach" (EIG, notes 2.1), whose "short-circuiting is reported by the PIM just as an insulation fault" (Cahier 178, notes 4.8); and resistance earthing on HV, "avoiding the dangerous overvoltages that can build up in a fully insulated HV system" (Marine Insight, SECONDARY, notes 4.1). Drives: "The supply network becomes connected to ground potential through the internal EMC filter capacitors" (ABB, notes 4.8), lesson 3's capacitance on purpose; so "disconnect EMC filter and ground-to-phase varistor" (ABB, notes 4.8), at the cost that the drive "does not meet the EMC requirements according to the standard IEC 61800-3" (Schneider, notes 4.8). False readings: "High “capacitive leakages” disturb insulation monitoring using PIMs with AC current injection" (Cahier, notes 4.8); "galvanically connected DC components ... will distort the measurement result" (Bender, notes 4.8); "The larger the system in terms of leakage capacitance, the longer the measuring time" (Bender, notes 4.8). So "Use a permanent insulation monitoring device compatible with nonlinear loads" (Schneider, notes 4.8). Safe working: "Wherever possible, all work on electrical systems should be carried out with the system dead" (HSE GS38, notes 4.8); "an IT (i.e., not grounded to earth) system with a latent first fault behaves exactly like a grounded system" (MOTOR, notes 4.8); the touch limits "< 50 V (AC) or < 120 V (DC)" (Bender, notes 4.8); safe isolation "before personnel are permitted to work" (STCW A-III/1, SECONDARY, notes 3.1). The last screens are a mixed set from the whole course. |

## 3. Can it be taught mostly visually, through interaction?
**Partly** (RUNBOOK section 0, item 3). Every lesson is a steps lesson of about 12 screens, SHOW then
DO, ending on two or three mixed puzzles. SHOW screens can carry a short paragraph where the idea
needs words, at most about 90 words: why a floating system still has a way home, why the healthy
phases rise, why the second fault is a short, why a monitor injects DC. Each lesson has one main
picture you move with your finger, chosen because it shows the cause, not just the answer. The
research supports predict-observe-explain for ideas people hold with confidence and get wrong (APA,
TU Delft, notes 6.5): here, "what trips at the first fault?" and "can a floating system shock you?".
Retrieval and spaced review are the app's own tools (Karpicke and Blunt, notes 6.5). Every step has a
`still` or `read` for the read-through and your Book.

- **Lesson 1, the star point switch.** A three-phase star source, a feeder, a motor frame bonded to
  the hull or earth, and a person beside it. A three-way switch for the star point: to earth with a
  protective conductor back (TN), to its own electrode with the installation on another (TT), or
  floating (IT), with a fourth position, "through a high impedance", labelled with EIG's 1500 Ω. Tap
  "fault to frame" on one phase. TN: a bold loop, a current in hundreds of amps, the breaker trips
  in red. TT: a smaller loop through two electrodes, the RCD trips. IT: the loop has no deliberate
  way home, the current reads in milliamps, the motor keeps running, an alarm lamp lights. A touch
  voltage readout on the frame stays low on IT. *Why:* the notes' central reading is that the
  letters are what the star point does (notes 4.1), and the first fault's ending is the whole
  difference (EIG, notes 2.1). The examiners' finding that the earth wire's job "was not known by most
  candidates" (WJEC, notes 6.2) and the nVent myth that earthed means safe (notes 6.1) are both met
  by watching one current path change. Lesson 1 shows only the deliberate path; lesson 3 adds the
  hidden one, so the milliamps are a promise kept later.
- **Lesson 2, the shifting triangle.** AC circuits lesson 10's star of three phasors, 254 V each on
  440 V, with the line-to-line triangle drawn faint around them. The earth is a dot, at the star
  point while healthy. Three voltmeters read each phase to earth. A fault picker (phase A, B or C)
  and a fault resistance slider from open to solid. As the resistance falls the earth dot slides
  along a semicircle to the faulted tip; the triangle never changes size. A "loads" card shows a
  motor across two lines, its voltage unchanged. An "insulation rating" bar for the healthy phases
  turns red past its phase-voltage rating. *Why:* "the system voltage triangle does not collapse
  during the fault; rather, it shifts" (SEL, notes 4.2) is a sentence you can watch. The notes find
  that people reason about circuits in current, not potential difference (IOPSpark, notes 6.3), and
  that voltage is the hardest idea (Phys. Rev. PER, notes 6.3). This picture is all potential
  difference: nothing flows that matters, yet everything moves. The semicircle is computed from
  lesson 3's rule (decisions), so the partly resistive fault is drawn truthfully.
- **Lesson 3, the cable that is a capacitor.** A feeder from a board to a load, with three rows of
  small capacitors from each phase to the hull along it. Sliders: cable length, and switches for
  "add 10 drives' filters" (example values within Bender's 10 to 100 nF, notes 4.3). Below, a
  phasor panel. Healthy: three charging currents 120° apart that cancel. Fault on phase A: its
  capacitors short out, the two healthy phases' currents grow by √3 and swing 60° apart, and they
  add head to tail into the fault current, with the readout 3ωC V_phase. A frequency switch, 50 or
  60 Hz. A "Check a source" button loads Eaton's 480 V case (1.04 A), the IMarEST range and
  Schneider's table. A mode switch removes the fault and puts a person on phase A: the same
  capacitors close the loop through them, and the body current is shown against small and large
  systems. *Why:* the misconception that charge cannot cross a capacitor "barrier" (Wainwright
  review, SECONDARY, notes 6.3) and the question "how would current be able to flow ... if there was
  no ”other end of the circuit”?" (Q&A, SECONDARY, notes 6.3) are both answered by the capacitors
  drawn as the other end. AC circuits lessons 5, 6 and 10 carry every step, so nothing new is
  taught about phasors. The person mode is the mirror of nVent's "grounded means safe" (notes 6.1):
  floating does not mean safe either.
- **Lesson 4, two faults through the hull.** A switchboard on 440 V, two feeders to two motors, the
  hull as a thick bar beneath. A first fault on feeder 1's phase A is already there, from lesson 2,
  with its alarm lit. Drop a second fault onto feeder 2 and choose its phase. Same phase: nothing
  changes. Different phase: a red loop runs out on one feeder, through the hull and back on the
  other, driven by line voltage. Sliders for each feeder's loop impedance; the current readout is
  440 ÷ (Z1 + Z2) against each breaker's instantaneous trip, so a long feeder may not trip fast. A
  "time with the first fault" card shows the healthy phases' insulation held at 173%. *Why:* the
  EIG's "(unless occurring on the same conductor as the first fault)" (notes 4.4) is the first
  thing to try, and the doubled loop impedance (EIG, notes 4.4) is visible as two Zs end to end,
  which you know from Design and verification lesson 6. The "can wait" misconception (EEP, notes
  6.4) is met by the picture's red loop, not by a warning.
- **Lesson 5, lamps and the monitor.** One board, three earth lamps in star to the hull, and an
  insulation monitor between the system and the hull, with an outgoing feeder list. Drag a fault
  resistance onto any phase: each lamp's brightness follows its phase's voltage to earth from lesson
  2's picture. A "damp everywhere" switch lowers all three phases equally: the lamps stay equal and
  bright, while the monitor's dial falls. The monitor injects a small DC voltage; its current
  through the parallel leakages is drawn as a thin arrow, and the dial reads the total resistance.
  An alarm line in Ω/V with a source picker (GL 50, Bender 100, Bender white paper 500), turned into
  kΩ on 440 V. A capacitance slider slows the dial's settling, with five time constants marked.
  *Why:* lamps showing only unbalance is the source's own point, "cannot detect symmetrical failures"
  (Bender, notes 4.5), and one switch shows it. The parallel feeders make "adding together the
  resistive leakage of all outgoing lines" (Bender, notes 4.5) the reading itself. The source picker
  teaches the disagreement as a choice with consequences, not a fact to learn (notes 4.5).
- **Lesson 6, the two poles.** A DC board, positive bar above and negative below, a battery symbol
  as the source, two equal detector resistors from each pole to the hull and a voltmeter with a
  +/− switch. Sliders for each pole's insulation resistance; the two pole-to-earth voltages are
  drawn as two bars that always add to the bus voltage. A lamp mode replaces the resistors with
  Vertiv's two lamps. A "symmetrical" switch lowers both poles together: the bars stay equal and
  the bridge stays quiet, while lesson 5's injecting monitor (a tick box) alarms. A "your meter"
  slider adds the voltmeter's own resistance as a third path. *Why:* the patent's rule, "The bus
  with lower ground resistance has a lower voltage to ground" (notes 4.6), is the potential divider
  you know, drawn. The review's finding that learners treat voltage like current (Wainwright,
  SECONDARY, notes 6.3) is met by two voltages that must add up while no current flows to speak of.
  Vertiv's "adding the fault that we are trying to detect" (notes 4.6) is the meter slider.
- **Lesson 7, the hunt.** A board with eight feeders, some long and capacitive, one hiding an
  earth fault of a resistance chosen at random, the monitor in alarm. Three tools. "Open a
  feeder": the dial recovers when the faulty one opens, unless the fault was in a load that has
  already stopped, when it vanishes and returns. "Clamp at supply frequency": every capacitive
  feeder reads a charging current, so the long healthy feeders read higher than a short faulty one.
  "Inject and clamp": a slow pulse goes out, and only the faulty feeder's clamp shows it, then the
  sub-board's, then the circuit's. Last, "isolate and test": the monitor and a drive must be taken
  off first, then the insulation tester reads the circuit dead. *Why:* Cahier's warning that the
  plain clamp "is not reliable" with "highly capacitive" feeders (notes 4.7) is something you find,
  not take on trust. Bender's "the fault could disappear because the faulty load is already
  switched off" (notes 4.7) is the trap in sectionalising, played. The order (live first, then dead)
  is the order the sources give (EIG, Bender, notes 2.1, 4.7).
- **Lesson 8, the restrike ladder.** Phase A's voltage to earth against time, with the system's
  capacitance as a capacitor to the hull and an arc gap. Tap "strike" to let the arc conduct: the
  capacitor discharges. The arc goes out at the next current zero, which is at the capacitor's
  voltage peak, and the voltage stays there. Tap again half a cycle later and the swing starts from
  the held voltage: 2, 3, then 4 times. A damping slider, from "lightly damped (Eaton)" to "heavy
  marine losses (IMarEST)", shrinks each step until the ladder stops climbing. An insulation level
  line turns red when crossed. A second card, "the drive on IT": lesson 3's feeder with a drive's
  filter capacitors switched in or out, the monitor's reading and its settling time, and an EMC
  marker that turns red when the filter is out. *Why:* the mechanism is Eaton's own chain (notes
  4.8), and every link is AC circuits lesson 5: the current zero at the voltage peak, the capacitor
  that holds. The contest is a slider, so you see both sides make sense (notes 4.8, 9). The second
  card goes deeper than Electronics lesson 8 by showing the filter as lesson 3's capacitance, and
  its price on both sides (ABB, Schneider, notes 4.8).

## 4. What else
- **Benchmark (notes 1, 2).**
  - **Brilliant:** its only electricity course is Circuits, "31 Lessons 334 Exercises" on current,
    voltage, resistance and power with bulbs (notes 1.1). It has no earthing, AC or capacitor lesson
    (notes 1.1). So Brilliant sets no order here, only a manner: puzzles and a review per level.
  - **Schneider, Cahier technique 178** (about 26 pages): the 1st insulation fault (currents and
    contact voltage, permanent insulation monitors, tracking the fault), the 2nd fault, special
    features (overvoltages, surge limiters, why an impedance), and the IT system's value and
    restrictions (notes 1.3). It is the core of lessons 2, 4, 5 and 7 (notes 8.2).
  - **Schneider Electrical Installation Guide:** earthing schemes, then the IT system's principle,
    fault protection (first fault, second fault) and practical aspects (monitoring, equipment,
    implementation) (notes 2.1). It gives the BS 7671-style order: the system, then each fault.
  - **Bender UK's IT-system know-how** (nine pages: comparison of system types, advantages,
    insulation monitoring, fault locator, coupled systems, examples, control circuits, insulation
    resistance, standards) and **Bender's Technical aspects booklet** (availability, the first fault,
    monitors, examples, fault location) (notes 1.3). They lean to the IT system because Bender sells
    monitors; the Guide and the standards check them (notes 1.3).
  - **Reeds Vol 16** puts "6 EARTH NEUTRAL RELATIONSHIP" after plant, system analysis and motors
    (SECONDARY, notes 2.4), as your courses do: AC circuits, Motors, then this.

  What they lack that you need: none teaches the phasor picture or the capacitance sum step by step,
  which AC circuits lets this course do, and none has a DC bus lesson beyond a paragraph (notes 1.3).
  Lessons 3 and 6 fill those from Eaton, the IMarEST paper, Vertiv and the patent background (notes
  4.3, 4.6).
- **His aim (notes 3).** You have no syllabus for the Navy courses ahead, so the course is planned
  against public standards and the marine syllabi, and where that is a guess it says so.
  - **STCW A-III/1** (engineer officer of the watch): "Detection of electric malfunction, location of
    faults and measures to prevent damage", and safe isolation (SECONDARY copy, notes 3.1).
    **A-III/6** (ETO): "Test, detect faults and maintain and restore electrical and electronic
    control equipment to operating condition" (SECONDARY, notes 3.1).
  - **MCA ETO oral syllabus (MSN 1860):** "knowledge of earthing systems and earth fault finding
    procedures", and the precautions for "insulation test on equipment incorporated with electronic
    circuit and devices" (notes 3.2).
  - **Marine electrician standard (ST0808):** "fault finding", "Check, test, and diagnose" and
    isolation (notes 3.3). **Engineering technician (ST0457), Maritime Electrical Fitter:** "fault
    diagnosis" on maritime vessels (notes 3.3). Neither names insulated systems (notes 3.3).
  - **Pearson HN Unit 31, Electrical Systems and Fault Finding:** "Earthing system connections" and
    "Meters, insulation testers" (notes 3.4). The match to your path is a guess (notes 3.4).
  - **An Indian marine syllabus** names "Insulated & Earthed neutral systems" (SECONDARY, notes 2.4).
  - **My guess:** your Level 3 marine engineering course will meet earth faults as an alarm to act
    on. This course gives you what the alarm means and how the fault is found, so any insulated
    system you meet, AC or DC, reads as the same few ideas.
- **Starting point (notes 3.5, 5).** Nothing below is taught again; each is used with a one-line
  reminder.

  | Idea | Earlier lesson | Used here |
  |---|---|---|
  | TN-S, TN-C-S, TT; ADS; Zs; RCDs | Your trade; Design and verification 6 | Lesson 1's contrast; lesson 4's loop |
  | A capacitor's current leads by 90°; X_C = 1/(2πfC) | AC circuits 5 | Lesson 3's charging current; lesson 8's arc |
  | Phasors added head to tail | AC circuits 6; Complex numbers; Vectors | Lesson 2's triangle; lesson 3's sum |
  | Line voltage √3 times phase; balanced currents cancel | AC circuits 10; Trigonometry 7 | Lessons 2, 3 and 5 |
  | Fault current from loop impedance | Design and verification 6 | Lesson 4's second fault |
  | The time constant; five time constants | Exponentials 3 | Lesson 5's monitor response |
  | The isolated core as a charged capacitor | HV Subsea Cable Testing 1 | Lessons 3 and 8 |
  | IR, DAR and PI over ten minutes | HV Subsea Cable Testing 3; your trade | Lesson 7's dead test |
  | Charging current at 0.1 Hz against 50 Hz | HV Subsea Cable Testing 5 | Lesson 5's DC injection; lesson 7's slow pulse |
  | Fault location on a cable (TDR) | HV Subsea Cable Testing 6 | Lesson 7, as the different job it is |
  | A drive's filter capacitors to earth | Electronics 8 | Lessons 3 and 8 |
  | Ratios; the potential divider | Proportional reasoning; Solving equations | Lessons 5 and 6 |

- **Where it is used (each cited before a lesson uses it).** Public, general equipment only.
  - **Earthing systems (1):** ships' LV distribution as "3 phase, 3 wire insulated" (MSIS 27, notes
    2.3); "Most marine low-voltage distribution systems (400-690V) utilize ungrounded (IT - Isolated
    Terra) configurations" (SECONDARY, notes 7.2); operating theatres (Cahier, Bender), rail signalling
    (ARTC), EV drives (Bender) (notes 7.1); HV ship systems resistance earthed (SECONDARY, notes 4.1).
  - **The first fault (2):** cables rated line to hull at the line voltage in insulated systems (GL,
    SECONDARY, notes 4.2); equipment rated at 173% (Eaton, notes 4.2).
  - **Capacitance (3):** IEC 60364-6's first-fault current check (notes 3.5); the IMarEST paper's
    marine values (notes 4.3); the isolating transformer that "limits the leakage capacitance" in an
    operating theatre (Bender, notes 7.1).
  - **The second fault (4):** overcurrent devices set for it (EIG, notes 2.1; BS 7671 Regulation
    411.6.4, IET, notes 3.5).
  - **Monitoring (5):** class rules on every insulated system (LR, GL, IRS, IEC 60092-201, notes 2.3);
    "the classification societies require for each isolated system (unearthed IT system) an
    insulation monitoring device" (Bender, notes 4.5); earth lamps on fishing vessels over 10 m (MGN
    628, notes 2.3); reefer distributions "usually unearthed" (Bender, notes 7.2).
  - **DC (6):** 24 V DC ship automation (Bender, notes 7.2); battery networks and UPSs (ABB, notes
    4.6); stationary battery plants (Vertiv, IEEE, notes 4.6); EV high-voltage systems (Bender, notes
    7.1).
  - **Finding the fault (7):** the STCW and MSN 1860 lines (notes 3.1, 3.2); "the ETO can also work
    on-site to further narrow down insulation faults" (Bender, notes 7.2); shore power cables checked
    "before switching on" (Bender, notes 7.2); the MCA's IR test rule (MSIS 27, notes 2.3).
  - **Dangers (8):** drives on IT supplies (ABB, Schneider, notes 4.8); HV resistance earthing
    against overvoltages (SECONDARY, notes 4.1); GS38 (notes 4.8).
- **The mistakes to catch, each with a DO screen and its own hint.** The notes say plainly that the
  research on IT-specific misconceptions is thin: no study on them was found, and they come from
  engineering white papers and makers (notes 0.9, 9). The general circuit ones come from examiner
  reports and research reviews (notes 6.2, 6.3). Each is marked with how strong its source is.
  - **Lesson 1, earthed means safe, and its mirror:** "the most common misconception is that if the
    system is grounded it is safe from electric shock" (nVent, an engineering firm's paper, notes
    6.1). A DO screen asks which system trips on a first fault, and offers "IT, because it is safest".
  - **Lesson 1, the earth wire's job:** "The function of the earth wire was not known by most
    candidates", and "A common misconception was that ‘extra electricity’ flows through the earth
    wire" (WJEC examiner report, notes 6.2). A GCSE-level slip you will not make, so it is a check,
    not a screen of its own: a DO screen asks why TN trips (a large current through a low-resistance
    path, Bitesize, notes 6.2) and why IT does not.
  - **Lesson 1, earthing and double insulation confused:** "Students often confused the purpose of
    earthing and double insulation" (Edexcel examiners' report, notes 6.2). One option on the same DO.
  - **Lesson 2, the first fault trips something, or collapses the voltages:** "the first fault to
    earth should not cause any disconnection" (EIG) and "does not collapse ... it shifts" (SEL, notes
    4.2) are the corrections; the slip is the notes' reading. A prediction screen: before the fault,
    say what the voltmeters on B and C will read.
  - **Lesson 2, thinking in current, not voltage:** "Students often consider the behaviour of a
    circuit in terms of current and much less often in terms of potential difference" (IOPSpark
    research review, notes 6.3). A DO screen: almost no current flows; what is the danger?
  - **Lesson 3, no return path, so no current:** "how would current be able to flow into the person
    and cause an electric shock if there was no ”other end of the circuit”?" (a physics Q&A,
    SECONDARY, notes 6.3), against "current is therefore limited by the capacitances" (IET, notes
    4.3). A DO screen: a person touches one phase of an intact 440 V system with 1 µF a phase.
  - **Lesson 3, the capacitor as a barrier:** a remembered "very high resistance barrier so that
    charge cannot flow through it" (a review, SECONDARY, notes 6.3). A DO screen: what returns the
    first-fault current?
  - **Lesson 3, the first-fault current is always tiny:** "measured in mA" (EIG, notes 4.2) against
    "7-10 A/phase" on big vessels (IMarEST, notes 4.3). A DO screen doubles the system and asks for
    the new current.
  - **Lesson 4, a first fault can wait:** "As the fault current is very low, it is easy to ignore the
    fault and continue operation" (EEP, an engineering portal, notes 6.4). A DO screen: the alarm has
    been on for a week and nothing has tripped; what is the risk now?
  - **Lesson 4, a second fault on the same phase:** the EIG's "unless occurring on the same conductor"
    (notes 4.4). The slip is the notes' reading. A DO screen offers two second faults, same phase and
    other phase.
  - **Lesson 5, equal lamps mean healthy:** "cannot detect symmetrical failures" (Bender, notes 4.5).
    A maker's point. A DO screen: all three lamps glow equally after a wash-down; is the system
    healthy?
  - **Lesson 5, one ohms-per-volt rule:** the sources disagree (notes 4.5). A DO screen gives a reading
    of 30 kΩ on 440 V and asks which rule alarms.
  - **Lesson 5, two monitors are safer than one:** "Do not connect insulation monitoring devices in
    parallel" (Bender, notes 4.5). A maker's instruction. A DO screen: two boards are joined, each
    with its monitor running.
  - **Lesson 6, a floating DC bus is safe to touch:** "Personnel who assume that the floating DC bus
    is not connected to ground can be electrocuted" (Vertiv, a maker's conference paper, notes 4.6).
    A DO screen: the negative pole reads 0 V to earth; what does the positive read, and is it safe?
  - **Lesson 6, equal halves mean healthy:** Bender's symmetrical faults (notes 4.6) against Vertiv's
    "the alarm is false" (notes 4.6). A DO screen gives equal halves and a monitor reading of 15 kΩ.
  - **Lesson 6, voltage treated like current:** "students use the voltage concept as having
    approximately the same properties as the current concept" (review citing Duit, SECONDARY, notes
    6.3). A DO screen: no current flows to earth; can a pole still be at 188 V to earth?
  - **Lesson 7, monitoring and measurement are the same:** "terms that are easily mixed up" (Bender,
    notes 4.7). A DO screen: the monitor reads 2 MΩ, so is the switched-off fire pump healthy?
  - **Lesson 7, a clamp on each feeder will find it:** "not reliable for networks with a large number
    of feeders some of which are highly capacitive" (Cahier 178, notes 4.7). A DO screen: the long
    feeder reads the most current at 60 Hz; is it the faulty one?
  - **Lesson 7, testing with the electronics in:** IEC 60364-6's disconnection (notes 3.5) and ABB's
    "disconnect the monitoring device" (notes 4.5). A DO screen orders the steps before an IR test.
  - **Lesson 8, arcing faults cannot happen on IT:** Bender's "do not occur" against Eaton's measured
    overvoltages (notes 4.8). Taught as contested, so the DO screen asks what each side's case rests
    on, not who is right.
  - **Lesson 8, a floating system with an alarm is still floating:** "an IT ... system with a latent
    first fault behaves exactly like a grounded system" (MOTOR, a trade magazine's myth buster, notes
    4.8). A DO screen: the monitor is in alarm; you touch the healthy phase.
  - **Lesson 8, the monitor alarms when a new drive starts:** Electronics lesson 8 caught the filter
    left in. Here the DO screen goes deeper: the filter is out and it still alarms; which of
    Bender's and Cahier's causes fits (notes 4.8)?
  - **Not stated as common:** no source counts these, so they are taught as checks, not as cited
    mistakes.
    - The healthy phases at phase voltage, or at twice it, during a first fault.
    - The first-fault current at one phase's charging current, not three times it.
    - The second fault's loop through one circuit's impedance, not two.
    - Ohms per volt on the phase voltage instead of the system voltage the rule names.
    - The two pole-to-earth voltages expected to add to more or less than the bus.
    - An arc that goes out "anywhere" in the cycle, rather than at a current zero.
- **Size and cost.** 8 lessons of about 12 screens on the agreed settings (CLAUDE.md).
  - The Electronics brief estimated 1.1M to 1.3M a lesson for pictures of animated circuits with
    linked waveforms. These are of the same kind (a phasor panel tied to a circuit), so I estimate the
    same.
  - That is about 9M to 10.5M for the course, plus about 0.3M for the plan. The research is done
    (346 quotes from 76 saved tool results).
  - The full process measured on Fractions lessons 4 to 8 was about 1.65M a lesson, about 13.2M for
    eight.
  - Each build's real cost is reported to you.
- **Lesson 1 first.** Lesson 1 is built and checked before the others (about 1.2M, plus the plan).
  Because you approved the build, the rest follow without waiting for you to try it.
- **Left for later courses, with a one-line look ahead where it fits:**
  - **Batteries** (this folder, built alongside): cells, capacity, charging, hydrogen and a battery's
    short-circuit current. Lesson 6 draws a battery only as a DC source. Its lesson 8 names
    "unintentional battery grounds" and points here (Batteries brief).
  - **Generators and paralleling** (Power and machines at sea): the generator's star point and
    neutral earthing resistor sizing; coupling switchboards and which monitor stays on, since only
    one may run on a connected system (Bender, notes 4.5); the rule that insulated neutral points are
    not tied together (GL, a pointer only, notes 5). Lesson 5 says in one line that coupling boards
    couples their monitors, and where it is taught. Where it goes is my guess.
  - **Transformers and magnetism** (Electrical principles): the isolating transformer's magnetics.
    Lesson 1 uses an isolating transformer only as the way to make an IT supply (EIG, Bender, notes
    5), with one line saying where it is taught.
  - **Three-phase power systems at sea**, **Fault-finding** and **Maintenance and condition
    monitoring**: see the decision above. HV IR trending and polarisation index stay with HV Subsea
    Cable Testing and Maintenance (MSN 1860's HV lines, notes 3.2).
  - **Not deferred, left out:** medical IT system rules, rail signalling detail, EV isolation
    standards beyond one example line, and residual current monitors beyond a name (IEC 60364-4-41
    allows one, notes 2.2).
- **Gaps to close at build time.** None blocks the build.
  - **The 3ωC V_phase rule and the semicircle** have no quote (computed, notes 4.3). Each is derived
    on screen and checked against the sources' own numbers. That one healthy phase can pass line
    voltage by up to about 5% with a partly resistive fault is computed only; look for a source, or
    keep it as the picture's sum, labelled.
  - **BS 7671 Regulation 411.6.4's formula** is not in the notes. Lesson 4 names the regulation and
    uses the EIG's doubled loop; no screen states the regulation's limit.
  - **Example values, labelled:** the 1 µF and 5 µF a phase, the 0.4 Ω loops, the 1,000 Ω body, the
    feeders' 2 MΩ and 30 kΩ, the 220 V DC board and its 100 kΩ detectors. A published body impedance
    would be better than 1,000 Ω; none is in the notes.
  - **Lesson 5:** Bender's response-time rule is printed as "5 τ = _R_ I x _C_ e" (notes 4.5); the
    picture uses it only to show the time growing with C, with no claim about a real monitor's
    seconds. That the earth lamps are themselves a path to earth, one reason MGN 628 keeps them off
    except for testing, is my reading (notes 4.5, 4.6); keep it labelled or drop it. The Lloyd's
    Register alarm level in Ω/V and the DNV, ABS, BV and IACS texts were not reached (UNCONFIRMED,
    notes 2.3, 9).
  - **Lesson 6:** Bender's sentence on superimposed-voltage monitors is not used (decisions). Vertiv's
    typical detector resistance is in a saved tool result but not in `quotes.json`; quote it before a
    picture uses it, or keep the 100 kΩ labelled.
  - **Lesson 7:** Marine Insight (a trade blog, SECONDARY) carries the plainest sectionalising and
    causes lines; Bender's and Vertiv's lines back the method (notes 4.6, 4.7). The CT cancelling load
    current is your RCD's principle, stated from your trade, not quoted.
  - **Lesson 8:** whether marine low-voltage systems suffer 1,000 V-class arcing overvoltages is
    contested, with no marine measurement found (UNCONFIRMED, notes 4.8, 9). The damping slider's
    values are illustrative, labelled.
  - **Misconceptions:** no research paper on IT-system misconceptions, and no AQA or OCR examiner
    report on earthing, was found (UNCONFIRMED, notes 6.2, 9). The IT-specific mistakes above are
    makers' and engineering papers' cautions and the notes' readings, each marked.
  - **What your own certificates cover** is from EAL's electrotechnical Level 3 specification, the
    closest public text; your BS 7671, Initial Verification and Periodic Inspection awards' texts were
    not read line by line (UNCONFIRMED, notes 3.5, 9).
  - **Nothing naval.** No naval or submarine source was used, and the SMQ books on your Drive were not
    read (notes, preamble).
