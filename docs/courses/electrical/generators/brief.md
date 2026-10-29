# Generators and paralleling: the course brief

Written 29 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
the second course in the Electrical shelf's Power and machines folder: "How an alternator makes its
voltage, the AVR and the governor, synchronising, load sharing and reverse power." Motors comes
before it (built) and HV Subsea Cable Testing after it (built). No course after it takes any of its
ground, so what is not taught here is either one line here or left out, and the list at the end says
which. You chose this course on 28 Oct and approved the build, so I have taken the decisions for you
and listed them below. Change any you like. Sources and quotes are in `research-notes.md` beside this
file (246 quotes, cut by script from the 73 saved tool results and checked with
`tools/eval/sources.mjs`, `failed: 0`). Section numbers below point there.

## The short version
**Eight lessons**
1. The alternator: a turning field makes three phases (built first)
2. Excitation and the AVR: field current sets the voltage
3. The loaded generator: synchronous reactance and the phasor
4. The governor: fuel, speed and droop
5. Synchronising: closing onto a live board
6. Load sharing: kW by fuel, kVAr by field
7. Protection: reverse power, a lost field and the short circuit
8. The generator set in a power system

**The main pictures** (one per lesson, each moved with your finger, each showing the cause):
- **The turning field (lesson 1).** A rotor with its poles, inside three stator coils set 120°
  apart. Drag the rotor round or set it spinning. Each coil's wave is traced as a pole sweeps past
  it, so three waves build 120° apart. A pole switch gives 2, 4 or 6 poles. Drag the speed and the
  frequency and voltage move together. Drag the field current and only the voltage moves.
- **The AVR loop (lesson 2).** The brushless chain drawn along one shaft: PMG, AVR, exciter,
  rotating diodes, main field, output. Beside it, the open-circuit curve with a dot on it, and the
  output voltage against time. Drag the load. With the AVR off, the voltage sags and stays down.
  With it on, the field current climbs, the dot rides up the curve and the voltage comes back.
- **The phasor drop (lesson 3).** The terminal voltage V held by the AVR, the current at the power
  factor you drag, and the drop across the synchronous reactance drawn from V's tip. The arrow that
  closes the triangle is E, the voltage the field must make, and a field-current bar follows its
  length. Lagging, E is longest. Leading, E shrinks until the bar hits the floor, in red.
- **The droop line (lesson 4).** A frequency-against-kW graph with the set's operating dot, beside
  a flywheel and a frequency trace against time. Tap a load step. The flywheel gives up speed, the
  trace dips, the governor adds fuel and the dot settles. In droop it settles lower on its line. In
  isochronous it climbs back to the set frequency. Drag the droop and the set point.
- **The synchroscope bench (lesson 5).** A live board and an incoming set, their waves overlaid,
  three lamps, a synchroscope dial and a voltmeter across the open breaker. Trim the incoming speed
  and voltage, and swap two phases. Press close. The breaker takes its closing time, then shuts at
  whatever angle it has reached. Outside the window, a current and shaft-torque shock bar goes red.
- **The house diagram (lesson 6).** Two sets' droop lines back to back across the shared load, one
  frequency line through both. Drag one set's governor setting. Its share grows, the other's
  shrinks, and the frequency barely moves. A switch turns it into voltage-against-kVAr: drag one
  set's excitation, its kVAr grows, its kW does not, and a circulating-current arrow appears.
- **The fault timeline (lesson 7).** Two sets in parallel with their kW and kVAr arrows. Pick a
  fault: engine stops, field lost, short circuit, overload. Drag a time cursor through the event.
  The meters follow, the relay timers fill, and the breaker trips or the non-essential loads shed.
  On a short circuit, a switch picks how the AVR is fed, and the fault current holds or dies away.
- **Starting the big motor (lesson 8).** One set and a motor whose size you drag, with a start
  method switch: direct on line, star-delta, soft starter. Press start. The voltage drops at once,
  the frequency sags as the engine slows, and the AVR pulls the voltage back. A 90% line and a
  motor-torque readout show whether it gets away. Add a second set and try again.

### Decisions taken for you (say if you want any changed)
- **Eight lessons, one per part of your scope, in your order.** The IMO's model course for
  electro-technical officers gives the best spine and names the same parts in the same order: the
  machine, synchronising, voltage and frequency control, active and reactive sharing, excitation,
  protections and power management (notes 3.1, 8). The textbooks agree on the front half: build
  the machine, load it, then put machines side by side (Engineering Devotion, Cambridge, Hughes,
  notes 1.3, 2.1, 2.3). The governor, the AVR as a control, protection and the system view come from
  the makers' guides and the IMO course (notes 2.4, 8). Lesson 8 is the fullest. If you want nine, it
  splits into "starting big motors" and "blackout and the set as a whole". If you want seven, lessons
  7 and 8 merge and blackout drops to one screen, the notes' own suggestion (notes 8).
- **Lesson 1 is built first, then the rest without a pause.** You approved the build, so the others
  follow without waiting. Try lesson 1 on your phone as soon as it lands; if something is wrong, the
  rest will be changed before they are built.
- **Steps lessons, with a little more explaining ("Partly", RUNBOOK section 0, item 3).** About 12
  screens each, SHOW then DO, ending on two or three mixed puzzles. SHOW screens may carry a short
  paragraph, at most about 90 words (your 21 Oct note on Motors lesson 1). Every lesson has one
  picture you move, and it asks you to predict before you play (section 3).
- **A recall opener in every lesson, because an earlier course carries each one:** lesson 1 (AC
  circuits lesson 1, the coil spun twice as fast), lesson 2 (Transformers lesson 2, current past the
  knee), lesson 3 (Transformers lesson 6, regulation at 0.8 lagging and leading), lesson 4 (Mechanics
  and materials lesson 6, net torque on an inertia), lesson 5 (Transformers lesson 7, the gap across
  a paralleling switch at 30°), lesson 6 (AC circuits lesson 8, 100 kVA at 0.8), lesson 7 (Motors
  lesson 6, the back-emf a turning armature makes) and lesson 8 (Motors lesson 2, the DOL's starting
  current). A right answer says "Still there" and carries on.
- **One idea runs through the whole course: two loops, two knobs.** Every set has a governor on the
  fuel and an AVR on the field, "always in operation" (Cummins, notes 4.6), and "the synchronizer,
  load share and load govern simply adjust the reference point to them" (Cummins seminar, notes 4.2).
  Alone, fuel sets the frequency and field sets the voltage, while the load sets the power (Cukurova,
  notes 6.1). In parallel, fuel sets a set's share of the kW and field its share of the kVAr
  (DieselShip, notes 4.6). That switch is the mistake the notes find most likely (notes 6.1), so the
  two knobs sit in every picture from lesson 2 on.
- **The frequency rule says which p it means, every time.** Sources write it as f = Pn ÷ 60 with P
  pole pairs and as f = PN ÷ 120 with P poles (notes 4.1). Motors taught synchronous speed as ns =
  120 f ÷ p with p in poles. So lesson 1 starts from the cause, one cycle per pole pair sweeping past
  a coil, and writes f = pole pairs × rev/min ÷ 60. Then it shows both printed forms with their
  letter named, and Motors' rule as the same thing turned round. A DO screen catches the swap.
- **The EMF is Transformers' rule, not a new one.** Each stator coil sees its flux change as a pole
  sweeps past, so E = 4.44 f N Φ (Transformers lesson 3) holds per phase. The frequency comes from the
  speed and the flux from the field current. That is why speed moves frequency and voltage together
  and field current moves voltage alone (Klempner, aast, notes 4.1). The winding factor is named,
  not taught (Engineering Devotion's "EMF Equation and Winding Factors", notes 1.3).
- **The per-phase picture uses the transformer's drawing with a bigger reactance.** Armature reaction
  and leakage are lumped into "a single reactance, called the synchronous reactance" (aast, notes 4.3).
  E = V + jXs I is drawn tip to tail exactly as Transformers lesson 6 drew its drop, with resistance
  left out as small. Xs is given as a fraction of the machine's own base, "per unit", which is
  Transformers' percentage impedance divided by 100 (computed). Its size, 1.5 per unit in the worked
  example, is an example value and said so: no public typical value was quoted (gaps).
- **The load angle is taught, as the cause behind three lessons.** The angle δ between E and V is
  lesson 6's reason a set takes more kW when given more fuel, lesson 7's reason a set with a lost
  field slips a pole, and the reason a bad closure shakes the shaft. From the lesson 3 drawing, per
  phase P = E V sin δ ÷ Xs (computed; the notes' saved Cukurova page says "EA sin δ ... is
  proportional to the power supplied", tool 44, to be quoted before the lesson says so, gaps).
- **Manual synchronising is taught to be understood; automatic is how it is done.** Stamford says
  "The use of manual synchronizing is not recommended" (notes 4.5); the MCA still asks for lamps and
  a synchroscope (notes 3.2). So lesson 5 lets you close by hand to see why each condition matters,
  then hands the close to a check-synchronising relay that refuses outside the window (notes 4.5).
- **Where to close and how tight is taught as contested.** One source closes at "approximately "11
  o'clock", while traveling slowly in the fast direction" and another at "about 5 minutes to 12"
  (notes 4.5). The windows differ by maker: Stamford's ±0.5% volts, 0.1 Hz, ±10° and 50 ms breaker;
  Woodward's 0.2% and ±10°; a trade site's 5%, 0.1 to 0.5 Hz and 10 to 15° (SECONDARY) (notes 4.5).
  Lesson 5 shows each as a maker's setting, never a constant. The one thing they share is the cause
  of closing early: the breaker's closing time (PSRC, notes 4.5).
- **Droop is taught as the design, not a fault.** The notes' reading is that learners treat droop as
  an error to remove (notes 6.1). Lesson 4 shows droop on one set and lesson 6 shows it is what lets
  sets share: "If all engines in a droop system have the same droop setting, they will each share load
  proportionally" (Woodward, notes 2.4). The 3 to 5% figure is a maker's recommendation (Woodward,
  Cummins, notes 2.4, 4.6), shown as such.
- **The infinite bus is one SHOW screen, inline.** It is the one new idea in load sharing (notes 5):
  "a power system so large that its voltage and frequency do not vary" (Cukurova, notes 4.4). Lesson
  6 uses it to show what fuel and field do against a stiff board, then drops it for two equal sets,
  which is what a ship's board is (my reading). Running against the mains gets one line: "reactive
  droop is not effective for utility paralleling" (Cummins, notes 4.6).
- **Generator neutrals get one SHOW screen in lesson 6, not a lesson.** Insulated systems handed this
  course the generator's star point and coupling switchboards (its brief). Lesson 6 shows the third
  current path between paralleled sets: third harmonics "directly add in the neutral" (Cummins), and
  2/3 pitch windings stop it (Stamford WP105, Cummins, notes 4.9), AC circuits lesson 10's triplens
  with a new cause. On an earthed medium-voltage scheme, "one (and only one ...)" neutral is earthed
  (Cressall, notes 4.9). One line: coupling two boards couples their insulation monitors, and only
  one may stay on (Insulated systems lesson 5). Neutral earthing resistor sizing is left out: the
  notes have only its purpose (Cressall, notes 4.9), and no later course takes it.
- **The short-circuit current is taught with its decay, and the 300% myth by name.** Makers call it
  "a misconception that all alternators ... will generate at least 300% short circuit current" (Stamford
  AGN005, notes 6.1), and Mecc Alte says 300% "is not an industry standard, with the exception of
  marine alternators" (notes 6.1, 7.1). So lesson 7 shows the three periods of the decrement curve
  and lets you switch the AVR's supply, because how the AVR is fed decides whether the current holds
  long enough to trip a breaker (AGN124, AGN024, notes 4.2, 4.7).
- **Preferential tripping stays in lesson 7, power management in lesson 8.** Your scope puts load
  shedding with protection. It stays there, as what happens on overload before the main breaker has
  to trip (DieselShip, IMO, notes 4.7, 3.1). Lesson 8 then shows the power management system that
  runs it, with blackout prevention and recovery (Lerus, DEIF, notes 4.7, 7.1).
- **Motor-start dips use a shown, simplified rule.** At the instant of starting, the set's
  sub-transient reactance and the motor's starting impedance share the voltage like a divider
  (computed from lesson 3's per-phase picture; EC&M and Cummins name X"d as what sets the first dip,
  notes 4.8). The X"d of 0.15 per unit is an example value, said so on screen. The 90% recovery and
  its 81% torque are Cummins' (notes 4.8), and 0.9² = 0.81 is shown.
- **Ashore, the default is the opposite.** You know BS 7671's generating sets section. A standby set
  ashore normally must not parallel the mains: "interlocks and switching must be provided to ensure
  that parallel operation is not possible" (TLC's guide to Section 551, an old edition, SECONDARY,
  notes 3.5). Lesson 5 says so in one line, so paralleling is never mistaken for an ordinary changeover.
  Which Section 551 regulations your 18th Edition unit covered is UNCONFIRMED (notes 3.5).
- **Examples are public, general marine and industrial equipment.** Diesel sets with Stamford,
  Leroy-Somer and Mecc Alte alternators, Woodward and Cummins controls, DEIF and Deep Sea power
  management. The worked set is AC circuits lesson 8's 630 kVA, 504 kW data-sheet set, at 440 V as
  in the public outline in CLAUDE.md. Frequencies are 60 Hz as AC circuits used for ships and 50 Hz
  ashore, both as examples, never a claim about any boat. Nothing is said about how the Royal Navy or
  any submarine runs its sets. No naval source was used and the SMQ books on your Drive were not
  read (notes 9).
- **The shelf has an overlap to tidy.** "Three-phase power systems at sea" still says "Generators,
  their speed and excitation, running in parallel" and the insulated neutrals Insulated systems took
  (the shelf, docs/shelves-electrical.json). This course now owns the generator half. That entry
  should drop it, or be retired; I have not changed the shelf.
- **Colour as before.** Ink for machines, waves, arrows, lines and controls; a second set or a
  second wave is dashed ink, never a new colour. Amber for key terms, teal for small labels (E, V,
  Xs, δ, kW, kVAr, Hz, "per unit"). Red only for warnings and mistakes: a bad closure, a set being
  motored, a slipped pole, the field at its floor on a leading load, a stalled motor, a short circuit
  that dies before the breaker trips. Green only for finished.
- **Your intake answers** (`intake.json`): to understand generators and paralleling and how to work
  with them; on the job and in everyday life; hands-on, with the why explained in full.

## 1. The overall topic
A generator set is an engine turning an alternator. Direct current in the rotor makes a field, and
the engine turns it inside three fixed windings, so each winding sees the flux change as a pole
sweeps past and makes a voltage. Three windings 120° apart give three phases. The frequency is
locked to the speed: one cycle per pair of poles passing a coil. The voltage rises with the speed
and with the field current, which sets the flux. A brushless machine gets that field current onto
the turning rotor through a small exciter and a diode bridge on the shaft, and the AVR steers the
exciter to hold the output voltage as the load changes. Loaded, the machine drops voltage inside
itself across its synchronous reactance. The drop adds as an arrow, so a lagging load needs a much
bigger internal voltage, and more field, than a leading one. A leading load can take the voltage out
of the AVR's hands.

The engine's governor holds the speed by changing the fuel. Alone, a set's power is whatever the
load takes; a sudden step slows the engine before the governor catches it. Isochronous control
brings the speed back exactly. Droop lets it fall a set few per cent from no load to full load,
which is what lets sets share. To put a second set on a live board, its voltage, frequency, phase
sequence and phase angle must match, judged with lamps or a synchroscope, and the breaker must be
told to close a little early for its own closing time. Close badly and the current can exceed a
short circuit and the shock can break a coupling. Once in parallel, the two knobs change jobs. Fuel
no longer sets the frequency; it sets that set's share of the kW. Field no longer sets the voltage;
it sets its share of the kVAr. Unequal field drives a current round between the sets.

Protection watches for what goes wrong: reverse power when an engine stops and its set is motored,
a lost field that makes a set draw vars and slip poles, overcurrent and the short circuit whose
current dies away in three stages, and overload, answered by shedding non-essential loads in steps.
Last, the set in a system: a big motor's starting current dips the voltage before any AVR can act,
the engine slows and makes it worse, and the cure is to start it softly, in sequence, or with more
sets on. A power management system prevents blackouts and restores the board after one, and the
diesel set as a whole turns fuel into kW, with most of the fuel's energy leaving as heat.

**It builds on:**
- **Your trade:** generating sets and Section 551 in outline (SECONDARY, notes 3.5); prospective
  fault current, protective devices and discrimination (BS 7671, Design and verification); the
  three-phase supply and its instruments. You have installed and tested; this course is how the
  machine behind the board behaves.
- **AC circuits:** the turning coil (lesson 1); three phases, star and √3, the neutral and triplens
  (lesson 10); real, reactive and apparent power and the 0.8 power factor rating, with the 630 kVA,
  504 kW set (lesson 8); over-correction to leading (lesson 9); phasors tip to tail (lesson 6).
- **Transformers and magnetism:** the B-H curve and its knee (lesson 2); E = 4.44 f N Φ, and the
  change not the field (lesson 3); regulation and percentage impedance (lesson 6); the clock gap and
  paralleling transformers (lesson 7).
- **Electronics and power electronics:** the bridge rectifier (lesson 2); thyristor soft starters
  (lesson 5). **Motors:** synchronous speed (lesson 1); the DOL's starting current and star-delta
  (lesson 2); back-emf (lessons 6 and 7). **Insulated systems:** the insulated star point and the
  monitor (lessons 1 and 5).
- **Mechanics and materials:** torque, inertia and run-up, P = Tω (lesson 6); couplings and alignment
  (lesson 7); resonance (lesson 8). **Heat and fluids:** the engine's energy split (lesson 4).
- **Complex numbers:** Z = R + jX and Ohm's law with j (lessons 7 and 8). **Straight-line graphs,
  Percentages, Trigonometry:** the droop line, per cent of rated values, sin δ.

**Not taught again:** the turning coil and the sine; Faraday, flux and the EMF equation; the B-H
curve; phasors, j and impedance; the power triangle and power factor; star, delta and √3; the
transformer's regulation, percentage impedance and clock; the rectifier bridge; torque, inertia and
P = Tω; the engine's energy split; BS 7671 design and verification. Each is used with a one-line
reminder, and only what is new is taught.

**Taught inline, because you have not met them** (notes 5): frequency from speed and pole pairs;
closed-loop control, once, for both the AVR and the governor, with hunting named; droop as a
percentage and the line it draws; the infinite bus; the per-phase circuit with a synchronous
reactance; the breaker's closing time and the advance angle; per unit.

**Edges.** In: the synchronous generator's construction in outline, frequency and EMF; excitation,
brushless exciters and AVR supplies; the open-circuit curve; synchronous reactance, the per-phase
phasor diagram and the load angle; lagging and leading loads; the governor, isochronous and droop,
the load step; the four synchronising conditions, lamps, synchroscope, advance angle, check and
automatic synchronising; kW and kVAr sharing, the house diagram, cross current, voltage droop and
cross-current compensation; generator neutrals in one screen; reverse power, loss of excitation,
overcurrent and the short-circuit decrement, under and over voltage and frequency by name,
preferential tripping; motor starting, power management, blackout and restoration in outline, and
the diesel set as a whole. Out (section 4 lists them): salient-pole two-reaction theory, the
synchronous motor and its V-curves, the synchronous condenser, the EMF, MMF and ZPF regulation
methods, turbo-generators and grid stability, neutral earthing resistor sizing, generator
differential protection, HV generators, the engine's own controls and the shore connection.

## 2. The lessons, in the order they build
The order is the one every source shares for the machine (build it, load it, then side by side:
Engineering Devotion, Cambridge, Hughes, EEP Academy, notes 1.3, 2.1, 2.3), with the controls placed
as the makers and the IMO place them: the two loops, then synchronising, then separate kW and kVAr
sharing, then protection, then motor starting and power management (notes 2.4, 3.1, 8).

| # | Lesson | What it teaches |
|---|---|---|
| 1 | The alternator: a turning field makes three phases | Recall: spin AC circuits lesson 1's coil twice as fast; what happens to the wave? (Taller and shorter together.) Now turn the machine inside out. "In a synchronous generator, a DC current is applied to the rotor winding producing a rotor magnetic field" and "The rotor is then turned by external means producing a rotating magnetic field, which induces a 3-phase voltage within the stator winding" (UNLV, notes 4.1); "A dc current, creating a magnetic field that must be rotated at synchronous speed, energizes the rotating field-winding" (Klempner, notes 4.1). The field turns and the windings stay still, so the big currents leave through fixed connections (my reading; Cambridge's 6.6 is only a title, "Advantages of Rotating Field System over Stationary Field System", notes 2.1; gaps). Three coils 120° apart give three waves 120° apart: AC circuits lesson 10's three phases with their cause. Each coil sees its flux change as a pole sweeps past, so Transformers lesson 3's E = 4.44 f N Φ holds per phase (computed reuse; winding factor named only, notes 1.3). Transformers lesson 3 promised this link in one line; here it is the lesson. Frequency, taught inline (notes 5): one cycle per pole pair passing a coil, and the rotor turns rev/min ÷ 60 times a second, so f = pole pairs × rev/min ÷ 60. "to generate 60-Hz power in a two-pole machine, the rotor must turn at 3600 rpm" (aast, notes 4.1). Both printed forms, "f=Pn/60" with P pole pairs (Benha) and "f = PN/120" with P poles (electricaltechnology, notes 4.1), and Motors lesson 1's ns = 120 f ÷ p (poles) is the second turned round. 4 poles: 1500 rev/min for 50 Hz, 1800 for 60 Hz; 6 poles: 1000 and 1200 rev/min (computed, notes 4.1). So no knob on the alternator changes the frequency; only the engine's speed does. The voltage is "a function of the magnetic field intensity, the rotating speed of the rotor, and the number of turns in the stator winding" (Klempner, notes 4.1) and "can be controlled by changing the field current" (aast, notes 4.1). So speed moves frequency and voltage together; field current moves voltage alone (computed from E = 4.44 f N Φ): the two knobs that lesson 2 (field) and lesson 4 (speed) take over. Example: a 4-pole set at 1800 rev/min making 440 V at 60 Hz, slowed 5%, makes 57 Hz and about 418 V with the field unchanged (computed, example values). Last screen: where the course goes. |
| 2 | Excitation and the AVR: field current sets the voltage | Recall: past the knee of the B-H curve, what does more current buy? (Transformers lesson 2: almost no more flux.) Field current against voltage at no load: "This plot is called open-circuit characteristic (OCC) of a generator" (Cukurova, notes 4.1). It is the machine's magnetic circuit, so it is straight and then bends at the knee (my reading of Transformers lesson 2; gaps). Getting DC onto a turning rotor without brushes, the brushless chain: "The PMG provides power via the AVR to the main exciter, giving a source of constant excitation power independent of generator output", and "The main exciter output is then fed to the main rotor, through a full wave bridge, protected by a surge suppressor" (Stamford UCI274F, notes 4.2). That bridge is Electronics lesson 2's, riding on the shaft; the IMO asks you to explain "why rotating rectifiers are essential" (notes 3.1). The AVR steers the small exciter field and the exciter multiplies it into the main field (my reading of the chain, notes 4.2). Closed-loop control, taught inline once (notes 5): measure, compare with the set point, correct. "Output voltage is sensed at the AVR for closed loop control of the excitation" and "The AVR controls the alternator output voltage by automatic adjustment of the exciter stator field strength" (Stamford S9 HV, notes 4.2); "The AVR monitors and corrects the alternator output voltage by adjusting the excitation current" (Leroy-Somer, notes 4.2). Load it: with the AVR off the voltage sags and stays down (lesson 3 shows why); with it on, the field current climbs up the OCC and the voltage comes back. Where the AVR's own power comes from: from the output (shunt, self-excited), or from a PMG or an auxiliary winding. "Self-excited alternators will not maintain a short-circuit current" (Stamford AGN124, notes 4.2), and "Marine Classifying Societies stipulate the need for the alternator to be able to support a condition of sustained short circuit current" (AGN124, notes 4.2): the seed of lesson 7. The PMG gives "a short-circuit current capacity and good immunity to distortions generated by the load" (Leroy-Somer, notes 4.2). Two AVR extras named: "Excitation Isolation" to "soft start" large motors and transformers (AGN024, notes 4.2), and "Voltage Matching" before paralleling (AGN024, notes 7.1). The spine of the course: "Governor and AVR are the basic functions on every genset and the synchronizer, load share and load govern simply adjust the reference point to them" (Cummins seminar, notes 4.2). |
| 3 | The loaded generator: synchronous reactance and the phasor | Recall: a transformer at 0.8 lagging drops 3.0% and at 0.8 leading −0.6%; why? (Transformers lesson 6: the angle sets the drop.) Load a generator and its output falls for the same kind of reason, only more. The armature's own current makes a field that pushes against the rotor's, and the winding has leakage; "it is customary to combine them into a single reactance, called the synchronous reactance of the machine" (aast, notes 4.3). The per-phase model, taught inline (notes 5): E, set by field and speed; Xs in series; V at the terminals. E = V + jXs I, tip to tail as in Transformers lesson 6, with Complex numbers lesson 8's Ohm's law with j; resistance left out as small (computed). Per unit, inline: Xs as a fraction of the machine's own base, Transformers' percentage impedance ÷ 100 (computed). Worked, V 1.0, I 1.0 per unit, Xs an example 1.5: at 0.8 lagging, E = 2.25 at 32° ahead of V; at unity, 1.80 at 56°; at 0.8 leading, 1.20 at 85° (computed, example values). "For a given phase voltage and armature current, a larger internal voltage EA is needed for lagging loads than for leading loads", so "a larger field current is needed to get the same terminal voltage" (Cukurova, notes 4.3). With the AVR off and the field fixed, "the terminal voltage is lower for lagging loads and higher for leading loads" (Cukurova, notes 4.3): lesson 2's sag, explained. Ratings: "Three-phase generator sets are rated for 0.8 PF loads" (Cummins, notes 4.3), so AC circuits lesson 8's 630 kVA set gives 504 kW, and 826.7 A a line at 440 V (computed). The field and the winding are sized for that lagging current; the engine for the kW (lesson 8). Leading: "Only slightly leading power factor can cause generator sets to lose voltage control" (Cummins, notes 4.3). Its sources: "a lightly loaded UPS, high intensity discharge lighting, and power factor correction capacitors" (Generac, notes 4.3), and it "can cause voltage instability and/or over-voltage trips" (Generac, notes 4.8). Why, my reading: a leading current does part of the field's job, so the AVR must cut its field towards zero and runs out of room to cut (gaps). AC circuits lesson 9's over-correction, now on a generator. The angle δ between E and V is named here and becomes the kW in lesson 6. MCA's "Obtains the load characteristics of a 3 phase ac generator under various power factor conditions" (4.21, notes 3.2) is this lesson. |
| 4 | The governor: fuel, speed and droop | Recall: 50 N m of net torque on 2 kg m²; what happens to the speed? (Mechanics and materials lesson 6: it rises at 25 rad/s² and keeps rising.) Alone, a set's power is the load's: "When a single generator operated alone, the real and reactive powers supplied by the generators are fixed, constrained to be equal to the power demanded by the load" (Cukurova, notes 6.1). The engine's torque must equal the alternator's; any gap goes into or out of the spinning mass (Mechanics lesson 6). A load step: "Frequency dip is when the engine cannot supply enough power (kW) to support the load demand, causing a reduction in engine RPM" (Generac, notes 4.4), and the governor "has a finite response time, yet most motor starting systems subject the system to instantaneous load changes" (Benshaw, notes 4.4). Example: 125 kW added to a set at 1500 rev/min (157.1 rad/s) with 20 kg m² on the shaft is a 796 N m shortfall, 39.8 rad/s², and 2.5% slower in 0.1 s, so 48.7 Hz before the governor acts (computed, example values). And the voltage follows the speed (lesson 1): "When the engine slows under load-frequency dips, this in turn, increases the alternator voltage dip" (Kohler, notes 4.4). The governor is lesson 2's loop with fuel in place of field. Isochronous: "the generator maintains a constant speed regardless of the load" (Petrotech, notes 4.4). Droop, taught inline (notes 5): "the percentage change in (design) speed required for 100% governor action", so "with 5% droop the full-load speed is 100% and the no-load speed is 105%" (Wikipedia, notes 4.4); Cummins writes it "Frequency (Hz) droop: (100)[(HzNL-HzFL) / HzFL]" (notes 4.4). 5% on 50 Hz: no load 52.5 Hz; 4% on 60 Hz: 62.4 Hz (computed). A straight line on frequency against kW (Straight-line graphs). The set point moves the whole line: "if the governor set points is increased, the no load frequency will also increase (the droop graph will shift up)" (Cukurova, notes 4.4). Droop's cost: "If the load is tripped, the frequency will reach a value above its nominal value when it settles" (Petrotech, notes 4.4). Its point waits for lesson 6. "It is best to have the same percent of droop set on each engine (3% to 5% is recommended)" (Woodward, notes 2.4). Hunting named: a loop that overshoots swings, as Mechanics lesson 8's resonance did (Cambridge's 7.16 "Hunting", a title, notes 2.3; cause to quote, gaps). |
| 5 | Synchronising: closing onto a live board | Recall: two transformers 30° apart on an open paralleling switch; what is across it? (Transformers lesson 7: 0.52 of the phase voltage.) "For two systems to be synchronized, five conditions must be matched" (Woodward, notes 4.5): number of phases and rotation, settled when the plant is installed and wired, then the four you match each time, voltage, frequency, phase sequence and phase angle (EEP, forumelectrical, Woodward, notes 4.5). The gap across the open breaker is Transformers lesson 7's 2 sin(θ ÷ 2) of the phase voltage: at 10° on 440 V, 44 V; at 180°, twice the phase voltage (computed), Woodward's "the voltages between the two systems can be twice the peak operating voltage" (notes 4.5). Slip: a small frequency difference makes θ creep round, one turn every 1 ÷ Δf seconds, so 0.2 Hz takes 5 s (computed). Speed and angle are matched with the engine: "phase matching, like frequency matching, is accomplished by controlling the speed of the oncoming generator's prime mover" (Woodward, notes 4.5); voltage with the AVR. Lamps: "when the lamps stay dark, the voltage and frequency of the two systems are the same" (Wikipedia, notes 4.5), a "composite indication of all three synchronizing variables" (PSRC, notes 4.5); "If pairs of lamps alternate light and dark ... the phase sequence is not the same" (Woodward, notes 4.5). The synchroscope: "If the generator is running faster than the grid, the pointer rotates continually in the opposite direction, marked "fast""; "When the pointer is at zero and is not moving, the two systems are synchronized"; and it "cannot assure that the phase sequence is correct" (Wikipedia, notes 4.5). Closing time, inline (notes 5): the close is sent "early at the advance angle to compensate for breaker closing time" (PSRC, notes 4.5). Stamford's 50 ms at 0.1 Hz slip is 1.8°; at 0.5 Hz, 9° (computed). Where to close, contested: "approximately "11 o'clock", while traveling slowly in the fast direction" (Wikipedia) against "about 5 minutes to 12" (PSRC, notes 4.5). Why fast: the set then takes a little load instead of being driven, which reverse power protection would see (CED, notes 4.7; lesson 7). The windows, as makers' settings (decision above, notes 4.5). A bad closure: "The synchronization current can exceed that of a three-phase fault at the generator" (PSRC); "bent drive shafts, broken couplings" (Woodward); and "Voltage phase angle difference is the most sensitive variable for torque stress" (PSRC, notes 4.5), Mechanics lesson 7's coupling. Operators "may be tempted to close their contact at angles far from the correct angle and hold the contact closed as the synchroscope rotates" (PSRC, notes 4.5). The way it is done: "The method of synchronizing should be either automatic, or by check synchronizing" (Stamford, notes 4.5); "A modern synchronizer compares the frequency and phase of the two voltages, and sends a correction signal to the summing point of the governor", and if the voltage is out "the synchronizer will not allow a circuit breaker closure" (Woodward, notes 4.5). "Do not synchronize parallel alternators outside the specified parameters" (Stamford, notes 7.1). Ashore, one line: Section 551's interlock (SECONDARY, notes 3.5). |
| 6 | Load sharing: kW by fuel, kVAr by field | Recall: 100 kVA at 0.8; how many kW and kvar? (AC circuits lesson 8: 80 and 60.) In parallel, each set keeps "two active control systems always in operation" (Cummins, notes 4.6), and "These two types of load sharing rely on separate systems: speed control for kW and voltage control for kVAR" (bengibb, notes 4.6): "The kW load sharing is achieved by increasing or decreasing fuel to the engines" and "The kVAR load sharing is achieved by increasing or decreasing the field excitation" (Cummins seminar, notes 2.4). The infinite bus, inline (notes 5): "so large that its voltage and frequency do not vary" (Cukurova, notes 4.4). Why fuel moves kW: the rotor is locked in step with the board, so more fuel pushes it a little further ahead; δ grows, and per phase P = E V sin δ ÷ Xs (computed from lesson 3's drawing; Cukurova quote to add, gaps). Lesson 3's lagging example gives 2.25 × sin 32.3° ÷ 1.5 = 0.80 per unit, its own kW (computed). The single-set rule does not carry over: "if the engine is running alone, then increasing fuel shall increase the frequency", but in a group "it will not lead to an increase in speed and hence frequency" (DieselShip, notes 6.1, 4.6). The house diagram (lecture notes, notes 2.5): two droop lines back to back over the shared load. "If all engines in a droop system have the same droop setting, they will each share load proportionally" (Woodward, notes 2.4), and "Each generator must be set to drop frequency at the same rate from no load to full load" (Cummins, notes 4.4). Example: two 504 kW sets at 4% on 60 Hz (no load 62.4 Hz) sharing 600 kW carry 300 kW each at 60.97 Hz; raise one set's no-load setting by 0.3 Hz and it carries 331.5 kW, the other 268.5 kW, at 61.12 Hz (computed). "if a generator set is regulated to a different speed than the others, it will not share kW load properly" (Cummins, notes 6.1). Flat lines: sharing "can vary widely with only the tiniest changes in no-load speed" (Cukurova, notes 4.4). Two isochronous sets: "the engine with the higher speed setting will continue to take all of the load until it reaches its power limit, and the other engine will shed all of its load and become motored" (Woodward, notes 4.4), unless an "isochronous load sharing scheme" ties them (Woodward, notes 2.4), which actively calculates each set's share (Cummins, notes 4.6). kVAr: raising one set's field "will not lead to an increase in voltage ... but it will lead to an increase in the proportion of the total kVAR load it will deliver and a decrease in its power factor" (DieselShip, notes 4.6), "with active power sharing remaining unchanged" (eeeguide, notes 4.6). "An undesirable circulating reactive current (cross current) will flow in the system if the excitation of the alternators is not matched" (DieselShip, notes 4.6). Two fixes. Voltage droop: "A factory-fitted droop CT is pre-set for 5% voltage drop at full-load zero power factor" (Stamford), which Leroy-Somer checks as "The voltage should drop by 2 to 3%" at rated load and 0.8 (notes 4.6); running alone, "a shorting switch should be fitted across the parallel droop transformer" (Stamford, notes 4.6). Cross-current compensation: "no intentional droop in voltage from no load to full load" (Cummins, notes 4.6). To move kVAr without moving the voltage, "simultaneously increase the field current on one generator and decrease the field current on the other" (Cukurova, notes 4.6). Commissioning order (Leroy-Somer, notes 4.6): no-load voltages "identical"; speed until "0 KW power exchange"; then voltage to "cancel (or minimise) the current circulating". Against the mains, one line (Cummins, notes 4.6). One SHOW screen on neutrals (decision above, notes 4.9). |
| 7 | Protection: reverse power, a lost field and the short circuit | Recall: what does a DC motor's armature make as it turns? (Motors lesson 6: a back-emf; a motor is a generator too.) Here the other way round: a generator that loses its engine becomes a motor. The IMO's list: "short-circuit protection - overload protection - reverse power protection - under and overvoltage protection - under and overfrequency protection" (notes 3.1). Reverse power "detects real power flow into the generator, which will happen if the generator loses its prime-mover input" (CED, notes 4.7): lesson 6's δ turned negative. For a diesel, "anti-motoring protection ... to preclude the danger of explosion and fire from unburned fuel" (NRC, notes 4.7), and a motored diesel set may "draw a considerable amount of power ... to avoid damage due to possible mechanical seizure" (Principles of Power System, notes 4.7). Delay, not desensitise: reverse power relays need "time-delay ... to prevent inadvertent tripping during system disturbances caused by faulty synchronising and phase swinging" (notes 4.7), "around 5-30 seconds, giving sufficient time for the controls to pick up load upon synchronizing" (CED, notes 4.7); "Do not address the issue by increasing the “Reverse Power” limit" (Cummins, notes 4.7), whose sets can see "nuisance reverse power faults on load rejection" (notes 4.7). The pickup is shown as an example percentage, labelled (gaps). The engine trips first, the breaker after: "only after a reverse power relay checks the prime mover has stopped" (CED, notes 4.7). Loss of excitation: "it seems to the system as an inductive load, and the machine starts to absorb a considerable amount of VARs" (CED), with "circulating currents, pole-slipping, torque/current surges and oscillation" (AGN024, notes 4.7). Lesson 3's drawing shows why: E shrinks, δ is pushed past 90° to carry the same kW, and the rotor slips a pole (computed reading of P = E V sin δ ÷ Xs; gaps). "Under-Exc. Protection" guards it (AGN024, notes 4.7). The short circuit: "The Short Circuit Decrement Curves represent the alternator’s fault current during Sub Transient, Transient and Sustained periods" (AGN005, notes 4.7). Shunt-fed, "the short-circuit current will quickly decay to 0" (AGN124, notes 4.2; Mecc Alte, "the current is not sustained", notes 4.7). PMG or auxiliary winding: a "current ‘forcing’ capability to ensure accurate circuit breaker activation" (AGN024), so "the load’s protection devices have time to clear the fault" (AGN124, notes 4.7); modern alternators "typically sustain 2 to 4 x rated current" (AGN034, notes 4.7); for marine, 300% "regularly requested for up to 10 seconds" (Mecc Alte, notes 6.1). On the 630 kVA set: 3 × 826.7 A = 2480 A sustained; a first peak at an example X"d of 0.15 is about 6.7 times rated (computed, example value). Your Design and verification discrimination, now fed by a source whose current falls with time (my reading). Overload: "Preferential tripping ... designed to disconnect non-essential circuits (e.g. breakers controlling air conditioning, galley power, blowers, refrigeration etc.) in the event of partial overload" (DieselShip, notes 4.7), by "automatic three-step disconnection of non-essential power consumers" (IMO, notes 3.1); DEIF's "Trip of non essential load groups (preferential trip)" (notes 7.1). Under and over voltage and frequency named on one screen (IMO, notes 3.1). |
| 8 | The generator set in a power system | Recall: how many times full-load current does a DOL start draw? (Motors lesson 2: 6 to 8.) "Starting current is typically six times a motor’s rated full-load current, and this inrush current stays high until the motor reaches about 75 percent of rated speed" (Cummins, notes 4.8); "levels above 9 x FLC are not uncommon" (Benshaw, notes 4.8). The first dip is the set's: "as a function of the subtransient reactance" (EC&M), "both sub-transient (X”d) and transient (X’d)" (Cummins, notes 4.8). Simplified, X"d and the motor's starting impedance share the voltage (decision above). Example: 600 kVA of starting load on the 630 kVA set with an example X"d of 0.15 leaves 87.5% voltage and 77% torque (computed, example values). The AVR cannot beat a step: "the voltage drop will be equal to that which would result if no AVR were present" (Benshaw, notes 4.8). Then the engine slows (lesson 4), and "under frequency protection incorporated in the excitation system" cuts the voltage further (Cummins, notes 4.8). "a large voltage dip ... can inhibit the motor from reaching its operating speed" (Kohler, notes 4.8). The target: "the generator must recover to a minimum of 90% of rated voltage", so "the motor will develop 81% of rated torque" (Cummins, notes 4.8), 0.9² (computed). Cures: soft starters, "frequently selected for control of ship bow thrusters due to the large size of the motors relative to the generator" (Benshaw, notes 4.8), Electronics lesson 5's thyristors; with the soft starter holding the start to an example 300 kVA, 93% voltage (computed, example values). Sequencing: three 100 hp motors "started individually in sequence would reduce the starting kW required by 40 percent" (Generac, notes 4.8); "Start larger loads first (after critical loads)" and "Allow recovery between steps (5-10 Sec)" (Cummins, notes 4.8). More sets first: "Heavy Consumer Blocking" (Lerus, notes 4.7), the IMO's "control of start release of big consumers" (notes 3.1). Open-transition star-delta: the motor's voltage at reclose "may be equal to the supply voltage but exactly out of phase" (Benshaw, notes 4.8), lesson 5's bad closure inside a starter. Blackout in outline: the power management system's "Blackout Prevention", preferential tripping, load sharing, "Heavy Consumer Blocking" and "Blackout Recovery" (Lerus, notes 4.7); an "autoloading sharing system and auto standby system" (Marine Insight, notes 4.8). "An uncontrolled electrical load sharing imbalance will lead to a blackout in half of the cases" (MDPI cruise-ship study, notes 4.8), which is why lesson 6 matters. Restoring: "Using Dead Bus Synchronising, any number of generators are able to be online and in parallel potentially within 15 seconds" (DSE, notes 4.5), then loads in steps. One line each: the IMO's "rules of procedure after the black-out" and the emergency generator's automatic start (notes 7.1, 3.1). The set as a whole: Heat and fluids lesson 4's split, 60 to 70% of the fuel's energy to exhaust and cooling; "Real power (kW) ... is a direct function of engine real power output" (Cummins, notes 4.4), kVA the alternator's (lesson 3); and "Cummins Power Generation does not recommend running generator sets at less than 30 percent of rated load" (notes 4.8). The last screens are a mixed set from the whole course. |

## 3. Can it be taught mostly visually, through interaction?
**Partly** (RUNBOOK section 0, item 3). Every lesson is a steps lesson of about 12 screens, SHOW then
DO, ending on two or three mixed puzzles. SHOW screens can carry a short paragraph where the idea
needs words, at most about 90 words: why the frequency is locked to the speed, why a lagging load
needs more field, why fuel moves kW but not frequency in parallel, why the breaker must close early.
Each lesson has one main picture you move with your finger, chosen because it shows the cause, not
just the answer. The research supports two choices for all eight. Predict before you play:
"Unless students are asked to predict first what will happen, they may not observe carefully" (POE,
notes 6.2), and it "works best with demonstrations that allow immediate observations" (notes 6.2),
which an interactive gives; predict-observe-explain with simulations beat plain predict-observe-
explain in one 2025 study (ERIC, notes 6.2), which supports the pair, not simulations alone. And not
every play should surprise, "otherwise students start looking for the trick" (notes 6.2), so some
pictures confirm the prediction. Worked examples come before puzzles, because "novices learn better
from worked examples" (notes 6.2). Retrieval with feedback beats re-reading (notes 6.2), which is
the app's quick checks and review. Every step has a `still` or `read` for the read-through and your
Book.

- **Lesson 1, the turning field.** A cross-section: a rotor with its poles marked N and S, three
  stator coils at 120° marked A, B and C. Drag the rotor round by hand, or tap play and set the
  speed in rev/min. Each coil lights its trace as a pole sweeps past, and three waves build 120°
  apart on the right. A pole switch gives 2, 4 or 6 poles; at the same speed the waves come two or
  three times as often, and a readout counts pole pairs, rev/min and Hz. A field-current slider
  scales the flux and the wave height only. A caliper reads frequency and peak. *Why:* the cause is
  a pole sweeping past a coil, and "a rotating magnetic field ... induces a 3-phase voltage within
  the stator winding" (UNLV, notes 4.1). Dragging by hand shows one cycle per pole pair, which is
  the rule, so the pole/pole-pair trap (notes 4.1) is answered by counting, not by memory. The two
  sliders separate what speed does (frequency and voltage) from what field does (voltage only),
  Klempner's three dials (notes 4.1). It is AC circuits lesson 1's coil turned inside out, so no sine
  is taught again.
- **Lesson 2, the AVR loop.** The brushless chain along one shaft, left to right: PMG, AVR box,
  exciter stator, exciter rotor, diode bridge, main field, stator output. Small current bars show
  the AVR's output and the main field current. Below, the OCC with a dot, and a voltage-against-time
  trace. Drag the load. AVR off: the voltage falls and stays. AVR on: the AVR box compares the
  measured voltage with its set point, the exciter bar rises, the field bar rises, the dot climbs
  the OCC and the voltage recovers. Push the field past the knee and each step buys less voltage. A
  supply switch (PMG, shunt) shows where the AVR's power comes from, with one line that lesson 7
  shows why it matters. *Why:* the AVR adjusts "the exciter stator field strength" from the sensed
  output (Stamford, notes 4.2), so the picture is that loop, closed. The chain is Stamford's own
  description (notes 4.2), and the IMO asks why the rectifiers rotate (notes 3.1). The OCC's knee is
  Transformers lesson 2's, so its bend is recognised, not taught.
- **Lesson 3, the phasor drop.** V lies flat, its length held by the AVR. A current arrow I at the
  angle you drag, from 0.8 leading through unity to 0.8 lagging, and a load slider for its length.
  The jXs I arrow stands at right angles to I from V's tip. E closes the triangle from the origin,
  with δ marked between E and V and a field-current bar beside it. Drag lagging and E grows; leading
  and E shrinks; push leading far and the field bar hits its floor in red. An AVR switch: off, the
  field and E are fixed, and V is what moves, down on lagging and up on leading. An Xs slider shows
  why a generator is so much more sensitive than a transformer. *Why:* "a larger internal voltage EA
  is needed for lagging loads than for leading loads" (Cukurova, notes 4.3), and the drawing is that
  sentence. It is Transformers lesson 6's tip-to-tail drop, so the only new parts are E and the size
  of Xs. The red floor is Cummins' "Only slightly leading power factor can cause generator sets to
  lose voltage control" (notes 4.3), shown with the my-reading cause labelled (gaps).
- **Lesson 4, the droop line.** Left, an engine and alternator with a flywheel, a fuel rack bar and
  a speed readout. Right, the frequency-against-kW graph with the droop line and the operating dot,
  and under it a frequency trace against time. Tap a load step (sizes as a per cent of rating). The
  flywheel slows first, the trace dips, then the fuel bar rises and the trace recovers. In droop the
  dot settles further down its line; in isochronous the trace climbs back to the set frequency. A
  droop slider tilts the line; a set-point slider lifts it. A load-trip button sends the dot up the
  line, above nominal. *Why:* the dip is the gap between engine and load torque going into the
  spinning mass (Mechanics lesson 6; Generac, Benshaw, notes 4.4), so the flywheel slows before the
  governor acts. Droop is a line, "the percentage change in (design) speed required for 100%
  governor action" (notes 4.4), and moving it is the set point (Cukurova, notes 4.4). Seeing the
  line on one set first makes lesson 6's two lines a small step.
- **Lesson 5, the synchroscope bench.** A live board and an incoming set. The two phase-A waves
  overlaid; the gap between them drawn as a third, voltmeter-across-the-breaker wave. Three lamps,
  dark-lamp connected. A synchroscope dial that turns at the slip, marked fast and slow. Trims: speed
  (frequency), voltage, and a swap of two incoming phases. Press close: the breaker takes an example
  50 ms, then shuts at the angle reached by then. Inside the window the set joins quietly. Outside
  it, a current bar and a coupling-torque bar jump into red, with the angle as the main driver. A
  check-sync switch puts a relay in charge that will not close outside its window. *Why:* the lamps
  give "a composite indication of all three" (PSRC, notes 4.5), and the dial shows fast and slow but
  not sequence (Wikipedia, notes 4.5), so seeing both at once shows what each instrument cannot tell
  you. The closing delay makes the advance angle a thing you feel, "to compensate for breaker closing
  time" (PSRC, notes 4.5). The torque bar driven mostly by angle is PSRC's "most sensitive variable"
  (notes 4.5). The swap shows Woodward's pairs of lamps alternating (notes 4.5).
- **Lesson 6, the house diagram.** Two sets, A solid ink and B dashed ink. kW mode: A's droop line
  rises from the left, B's from the right, over a floor whose width is the total load; where they
  cross is the shared frequency, and A's and B's shares are read off. Drag A's set point and the
  crossing slides: A's share grows, B's shrinks, the frequency barely lifts. Drag the total load and
  both shares move along their lines. Tilt one line flatter and the shares drift apart as load
  changes. An isochronous switch flattens both lines: one set takes everything, the other's share
  goes negative in red, motored. kVAr mode: the same drawing with voltage-against-kVAr lines from
  the droop CT. Drag A's excitation: A's kVAr grows, its power factor falls, the kW split does not
  move, and a circulating-current arrow runs between the sets until the settings match. A
  cross-current switch levels the lines and the arrow goes. *Why:* the two systems are separate,
  "speed control for kW and voltage control for kVAR" (bengibb, notes 4.6), and the mode switch is
  that separation made visible. The house diagram is the lecture notes' own picture (notes 2.5), and
  the numbers on it are the rules from lesson 4. The isochronous fight is Woodward's (notes 4.4).
- **Lesson 7, the fault timeline.** Two sets in parallel feeding a board with its non-essential
  groups. Arrows show each set's kW and kVAr. A fault picker: engine stops, field lost, short
  circuit, overload. A time cursor you drag through the event, with a small trace of the key
  quantity above it. Engine stops: the set's kW arrow turns round in red and the reverse power timer
  fills to its delay, then the breaker opens. Field lost: its kVAr arrow turns round and δ swings
  past 90° to a slipped pole. Short circuit: the current trace shows sub-transient, transient and
  sustained; a supply switch (shunt, PMG) makes the sustained part die to zero or hold, and the
  breaker's trip line is reached or missed. Overload: the preference-trip groups drop in steps.
  *Why:* each protection is defined by its cause, real power "into the generator" (CED), "absorb ...
  VARs" (CED), "Sub Transient, Transient and Sustained" (AGN005) (notes 4.7), and a timeline shows
  the cause arriving before the relay acts, which is why the delays exist. The supply switch is the
  300% misconception answered by seeing it (AGN005, Mecc Alte, notes 6.1).
- **Lesson 8, starting the big motor.** One set, a board, and a motor with a size slider (as kVA of
  starting load against the set's rating) and a start switch: DOL, star-delta, soft starter. Press
  start. The voltage trace drops at once by the X"d share, then sags further as the frequency trace
  dips with the engine, then climbs as the AVR acts. A 90% line and a motor torque readout (V²) say
  whether the motor gets away; too low for too long and it stalls in red. A switch adds a second set
  on the board first, and the same start dips half as far. *Why:* the dip is "a function of the
  subtransient reactance" (EC&M, notes 4.8), and the AVR cannot beat it (Benshaw, notes 4.8), so the
  picture has to show the instant before the AVR moves. The 90% line and its 81% torque are Cummins'
  rule (notes 4.8). The second set is "Heavy Consumer Blocking" (Lerus, notes 4.7), the reason a
  power management system starts a set before it lets a big consumer go.

## 4. What else
- **Benchmark (notes 1, 2, 8).**
  - **Brilliant:** no machines or generators course. Electricity and Magnetism is nine lessons that
    stop at electrostatics (what it teaches on induction is UNCONFIRMED), and Circuits is 31 DC
    lessons (notes 1.1, 1.2). So Brilliant sets no order here.
  - **Engineering Devotion's free Electrical Machines text:** seven alternator lessons, 71 to 77,
    "Alternators — Fundamentals and Classification" to "Synchronising and Parallel Operation", with
    the synchronous motor after (notes 1.3). Lessons 1, 3 and 5 here cover its 71 to 75 and 77.
  - **Cambridge, Electrical Machines:** chapter 6 on alternators, then a whole chapter 7 on parallel
    operation, from "Necessity of Parallel Operation" through lamps and the synchroscope to "Load
    Sharing", "Effect of Governors’ Characteristics on Load Sharing" and "Hunting" (notes 2.1, 2.3).
    Lessons 4 to 6 follow its chapter 7 order.
  - **Hughes:** parallel operation is section 37.4, a few pages after armature reaction, regulation
    and synchronous impedance (an older edition's contents, SECONDARY for the 12th, notes 2.1, 8).
    **Wildi** puts synchronous generators straight after induction motors (notes 2.3), as the app
    does. **Bird** has no alternator chapter in the list reached (chapters 37 to 46 UNCONFIRMED, notes
    2.2). **EEP Academy:** construction, the two phasor diagrams, parallel operation, synchronisation
    (notes 2.3). **Wisconsin's** online course: its syllabus is UNCONFIRMED; its marketing names
    "phasor diagrams" and "sudden load changes" (notes 1.3). No OpenLearn course was found
    (UNCONFIRMED, notes 2.5).
  - **The makers** (Cummins, Stamford, Leroy-Somer, Mecc Alte, Woodward, Deep Sea, Generac, Kohler,
    Benshaw): two loops, then synchronising, then separate kW and kVAr sharing, then protection, then
    motor starting (notes 2.4). No Caterpillar or ComAp guide was reached (UNCONFIRMED, notes 2.4).

  What they lack that you need: the textbooks teach the machine and stop at the infinite bus. They
  lack the governor and AVR as controls, droop for two equal sets, protection, motor starting and
  the power management view. Lessons 2, 4 and 6 to 8 take those from the makers' guides and the IMO
  course (notes 2.4, 3.1, 8).
- **His aim (notes 3).** You have no syllabus for the Navy courses ahead, so the course is planned
  against public standards and the marine syllabi, and where that is a guess it says so.
  - **STCW Table A-III/1** (officer in charge of an engineering watch, 2025 edition): "preparing,
    starting, paralleling and changing over generators" (notes 3.1). **Table A-III/6**
    (electro-technical officer): "Coupling, load sharing and changing over generators" and
    "Electro-technology and electrical machines theory" (notes 3.1).
  - **IMO model course 7.08:** 6 hours on "Coupling, Load Sharing And Changing Over Generators", with
    synchronous machines, the synchronising methods, excitation and rotating rectifiers, active and
    reactive power control, the protection list and power management (notes 3.1). It is the spine
    (decision above).
  - **MCA:** the ETO oral asks for "Understanding of paralleling and load sharing of generators"
    (MIN 654, notes 3.2); the Second Engineer written paper asks you to explain "the basic operation
    of an ac generator" (4.18), "how to safely synchronise an incoming 3 phase ac generator to live
    busbars using lamps and/or synchroscope and voltmeters" (4.20), and the load characteristics at
    various power factors (4.21) (notes 3.2). The MCA's modernised syllabus lines are UNCONFIRMED
    (notes 3.2).
  - **Pearson HN Unit 21 / 4021 Electrical Machines:** "synchronous machines ... and generators", and
    "Investigate the types of generators available in the industry" (notes 3.4); the 2024 content
    list is UNCONFIRMED (notes 3.4).
  - **Apprenticeship standards:** none reached names paralleling (UNCONFIRMED, notes 3.3). The
    engineering technician standard names "power generation and distribution" and maritime
    electrical principles (notes 3.3).
  - **My guess:** your Level 3 marine engineering course will have you start, parallel and change
    over sets as a task. This course gives you why each step is there, at the depth of the STCW and
    MCA lines, so any set, controller or switchboard you meet reads as the same two loops.
- **Starting point (notes 3.5, 5).** Nothing below is taught again; each is used with a one-line
  reminder.

  | Idea | Earlier lesson | Used here |
  |---|---|---|
  | The turning coil; faster spins make taller, shorter waves | AC circuits 1 | Lesson 1's recall and the alternator |
  | E = 4.44 f N Φ; the change, not the field | Transformers 3 | Lesson 1's EMF per phase |
  | The B-H curve and its knee | Transformers 2 | Lesson 2's recall and the OCC |
  | Three phases 120° apart; star; √3; triplens add in the neutral | AC circuits 10 | Lesson 1's windings; lesson 6's neutral screen |
  | The bridge rectifier | Electronics 2 | Lesson 2's rotating diodes |
  | Phasors tip to tail; Z = R + jX; Ohm's law with j | AC circuits 6; Complex numbers 7, 8 | Lesson 3's E = V + jXs I |
  | Regulation at lagging and leading; percentage impedance | Transformers 6 | Lesson 3's recall and per unit; lesson 7's fault current |
  | Real, reactive and apparent power; rated at 0.8; the 630 kVA, 504 kW set | AC circuits 8 | Lesson 3's rating; lesson 6's recall and kW and kVAr |
  | Over-correction to leading | AC circuits 9 | Lesson 3's leading load |
  | Net torque = I × angular acceleration; run-up; P = Tω | Mechanics and materials 6 | Lesson 4's recall and load step |
  | Couplings and alignment | Mechanics and materials 7 | Lesson 5's bad closure |
  | Resonance | Mechanics and materials 8 | Lesson 4's hunting |
  | A straight line's slope and intercept; per cent of a rated value | Straight-line graphs; Percentages | Lessons 4 and 6's droop lines |
  | The gap across a paralleling switch, 2 sin(θ ÷ 2); paralleling transformers | Transformers 7 | Lesson 5's recall and the breaker gap |
  | Synchronous speed ns = 120 f ÷ p (poles) | Motors 1 | Lesson 1's frequency rule, turned round |
  | The DOL's starting current; star-delta | Motors 2 | Lesson 8's recall and the dip |
  | Back-emf; a turning armature is a generator | Motors 6, 7 | Lesson 7's recall |
  | Thyristor soft starters | Electronics 5 | Lesson 8's cure |
  | The insulated star point; one monitor on a connected system | Insulated systems 1, 5 | Lesson 6's neutral screen |
  | The engine's energy split | Heat and fluids 4 | Lesson 8's set as a whole |
  | Prospective fault current, protective devices, discrimination | Design and verification; your trade | Lesson 7's short circuit |
  | Sine, phase angle, sin δ | Trigonometry | Lessons 3, 5 and 6 |

  From your trade: you have wired and tested changeover to standby sets and know they must not
  parallel the mains ashore (SECONDARY, notes 3.5). This course is the case where they must.
- **Where it is used (each cited before a lesson uses it).** Public, general marine and industrial
  equipment only; nothing about any naval vessel (notes 3, 7).
  - **The alternator (1):** "Explains the basic operation of an ac generator" (MCA Second Engineer
    4.18, notes 3.2); "describes structures and operating principles of synchronous machines" (IMO
    7.08, notes 3.1); STCW A-III/1's "generator and distribution systems" (notes 3.1); Pearson HN
    Unit 21 (notes 3.4).
  - **Excitation and the AVR (2):** the PMG-fed AVR on a Stamford set (notes 4.2); the Leroy-Somer
    R438 AVR (notes 4.2); "describes excitation systems of generators and explains why rotating
    rectifiers are essential" (IMO, notes 3.1); marine class's sustained short circuit (AGN124,
    notes 4.2).
  - **The loaded generator (3):** sets rated at 0.8 (Cummins, notes 4.3); leading loads from a UPS,
    discharge lighting and correction capacitors (Generac, notes 4.3); MCA 4.21's load
    characteristics (notes 3.2).
  - **The governor (4):** Woodward's 3 to 5% droop (notes 2.4); kW as "a direct function of engine
    real power output" (Cummins, notes 4.4); motor starts as instant load steps (Benshaw, notes 4.4).
  - **Synchronising (5):** MCA 4.20 with lamps and synchroscope (notes 3.2); "Synchronizing and
    connecting offline generators to the main bus" (USCG NVIC 23-14, notes 3.1); the IMO's automatic,
    semi-automatic and manual methods (notes 3.1); Stamford's "Do not synchronize ... outside the
    specified parameters" (notes 7.1); DEIF's "Automatic synchronisation" (notes 7.1).
  - **Load sharing (6):** STCW A-III/6 and MCA MIN 654 (notes 3.1, 3.2); "Paralleling and equalizing
    load distribution between on-line generators" (NVIC 23-14, notes 3.1); Leroy-Somer's
    commissioning steps (notes 4.6); the UK STCW review, where every respondent kept "Coupling, load
    sharing and changing over of generators" (notes 7.1).
  - **Protection (7):** the IMO's protection list (notes 3.1); anti-motoring on a diesel set (NRC,
    notes 4.7); 300% for marine alternators (Mecc Alte, notes 7.1); preferential trip on a marine
    power management system (DEIF, notes 7.1; DieselShip, notes 4.7).
  - **The set in a system (8):** soft starters on bow thrusters (Benshaw, notes 4.8); sizing for
    motor starting (Cummins, Kohler, Generac, notes 4.8); the IMO's power management and blackout
    lines (notes 3.1, 7.1); a power management system's blackout prevention and recovery (Lerus,
    notes 4.7; DEIF, notes 7.1); the cruise-ship blackout study (MDPI, notes 4.8).
- **The mistakes to catch, each with a DO screen and its own hint.** The notes say plainly that no
  examiner report or Bitesize named mistake exists at this level (UNCONFIRMED, notes 6). What exists
  is makers naming their customers' mistakes, two lecture-note statements of the alone-against-
  parallel rules, and the circuits misconception literature (notes 6.1). Each is marked with how
  strong its source is.
  - **Lesson 1, poles for pole pairs:** two printed forms, "f=Pn/60" and "f = PN/120", with P
    meaning different things (notes 4.1). A trap the notes name, not a counted mistake. A DO screen:
    a 4-pole set at 1800 rev/min, offering 120 Hz and 30 Hz beside 60 Hz.
  - **Lesson 1, the alternator sets its own frequency:** the notes' check, that the frequency is
    locked to the speed ("the rotor must turn at 3600 rpm", aast, notes 4.1). A DO screen: the set
    reads 58 Hz; which do you change, the field or the speed?
  - **Lesson 2, the generator holds its output whatever the load:** the notes' generator version of
    the circuits literature's "constant source" idea (PRPER, notes 6.1, my reading). A prediction
    screen: AVR off, load doubled; what does the voltage do?
  - **Lesson 2, the AVR drives the main field directly:** the notes' reading of the chain (notes
    4.2). A check, not a cited mistake: a DO screen asks which winding the AVR feeds.
  - **Lesson 3, lagging and leading the wrong way round:** "a larger internal voltage EA is needed
    for lagging loads" (Cukurova, notes 4.3). Textbook statement. A DO screen: two loads of the same
    kVA at 0.8 lagging and 0.8 leading; which needs more field?
  - **Lesson 3, leading is harmless:** "Only slightly leading power factor can cause generator sets
    to lose voltage control" (Cummins, notes 4.3). A maker's caution. A DO screen: a lightly loaded
    UPS and correction capacitors on one set.
  - **Lesson 4, droop is a fault to remove:** the notes' reading (notes 6.1), answered by Woodward's
    proportional sharing (notes 2.4). A DO screen: a set settles at 59 Hz on load; fault or design?
  - **Lesson 4, the governor stops the dip:** "finite response time" (Benshaw, notes 4.4). A
    prediction screen before the load step.
  - **Lesson 5, the synchroscope checks phase sequence:** "they cannot assure that the phase sequence
    is correct" (Wikipedia, notes 4.5). A DO screen: the dial turns slowly through 12 and two lamps
    are bright while one is dark; can you close?
  - **Lesson 5, close exactly at 12:** the breaker's closing time and the advance angle (PSRC, notes
    4.5). A DO screen: with 50 ms and 0.5 Hz slip, where does the breaker really shut?
  - **Lesson 5, holding the close button:** "plant operators may be tempted to close their contact at
    angles far from the correct angle and hold the contact closed" (PSRC, notes 4.5). A practitioners'
    report. A DO screen offers it as a method.
  - **Lesson 6, fuel raises the frequency in parallel:** "As the fuel to the engine of one generator
    set in a group is increased it will not lead to an increase in speed" against "if the engine is
    running alone, then increasing fuel shall increase the frequency" (DieselShip, notes 4.6, 6.1).
    A marine training site. A prediction screen before you drag A's set point.
  - **Lesson 6, field raises the voltage in parallel:** "it will not lead to an increase in voltage"
    (DieselShip, notes 4.6). A DO screen: raise one set's field; which meter moves?
  - **Lesson 6, two isochronous sets share:** they do not; one takes all (Woodward, Petrotech, notes
    4.4). A DO screen with both on isochronous.
  - **Lesson 6, mismatched settings:** "if a generator set is regulated to a different speed than the
    others, it will not share kW load properly" (Cummins, notes 6.1). A DO screen on the house
    diagram.
  - **Lesson 7, raise the reverse power pickup to stop nuisance trips:** "Do not address the issue by
    increasing the “Reverse Power” limit" (Cummins, notes 4.7). A maker's caution. A DO screen
    offers it beside lengthening the delay and fixing the load sharing.
  - **Lesson 7, every alternator gives 300% for as long as needed:** "There is a misconception that
    all alternators ... will generate at least 300% short circuit current" (AGN005, notes 6.1). A
    maker naming it. A DO screen: a shunt-fed set and a breaker set to trip after 2 s.
  - **Lesson 8, the AVR prevents the dip:** "the voltage drop will be equal to that which would
    result if no AVR were present" (Benshaw, notes 4.8). A maker's caution. A prediction screen
    before the start.
  - **Lesson 8, a change at one machine stays there:** "local reasoning", "a difficulty in recognizing
    that a change in one part of a circuit affects global variables" (PRPER, notes 6.1), carried to
    the board by the notes (my reading). A DO screen: one set's governor fails high; what happens to
    the other and to the board?
  - **Not stated as common:** no source counts these, so they are taught as checks, not cited
    mistakes.
    - kW and kVA swapped on a rating plate.
    - Synchronising on voltage alone because the meters agree.
    - Taking per unit Xs for ohms.
    - Thinking the droop CT matters on a single running set.
    - Reading a reverse power trip as an electrical fault in the alternator.
    - Running a set at light load for long because it is "easy on it".
- **Size and cost.** 8 lessons of about 12 screens on the agreed settings (CLAUDE.md).
  - AC circuits measured about 1.09M a lesson all in, and Electronics and Transformers were
    estimated at 1.1M to 1.3M. The pictures here are of the same kind (a machine linked to phasors,
    lines and traces against time), and lessons 6 and 7 have two modes each, so I estimate about
    1.1M to 1.3M a lesson.
  - That is about 9M to 10.5M for the course, plus about 0.3M for the plan. The research is done
    (246 quotes from 73 saved tool results).
  - The full process measured on Fractions lessons 4 to 8 was about 1.65M a lesson, about 13.2M for
    eight.
  - Each build's real cost is reported to you.
- **Lesson 1 first.** Lesson 1 is built and checked before the others (about 1.2M, plus the plan).
  Because you approved the build, the rest follow without waiting for you to try it.
- **Where the edges go.** No course after this one takes its ground (the folder ends with HV Subsea
  Cable Testing, built), so each item is either one line here or left out.
  - **One line here:** the winding factor (lesson 1); utility paralleling and var or power factor
    control (lesson 6); under and over voltage and frequency (lesson 7); the emergency generator's
    automatic start and the emergency switchboard (lesson 8); hunting and damper windings (lesson 4,
    once a quote is in).
  - **Left out:** salient-pole machines and two-reaction theory; the synchronous motor, V-curves and
    the synchronous condenser (Engineering Devotion 78 to 81, notes 1.3); the EMF, MMF and ZPF
    regulation methods (notes 1.3) and the open- and short-circuit tests beyond the OCC; turbo-
    generators and grid stability; neutral earthing resistor sizing; generator differential
    protection (not in the notes); HV generator sets; the engine's own governor hardware, fuel system
    and shutdowns; the shore connection itself.
  - **The shelf entry "Three-phase power systems at sea"** still names this course's ground (decision
    above).
- **Gaps to close at build time.** None blocks the build.
  - **Lesson 1:** why the field turns rather than the windings is my reading; Cambridge's 6.6 is a
    title only (notes 2.1). Quote a reason from a saved page (tools 44 or 50 may have one) or keep it
    as one plain line marked as reasoning. The 418 V at 57 Hz is computed from E ∝ f with the field
    fixed.
  - **Lesson 2:** the OCC bending at the knee as saturation is my reading of Transformers lesson 2;
    the saved Cukurova page (tool 44) draws the OCC and should be quoted for its shape. "The exciter
    multiplies the AVR's current" is my reading of Stamford's chain (notes 4.2).
  - **Lesson 3:** E = V + jXs I has no clean quote; it is drawn from the per-phase model and the
    quotes that E must be larger for lagging loads (notes 4.3). Per unit is not quoted; it is
    computed from Transformers' percentage impedance. Xs = 1.5 is an example value. Why a leading
    load loses voltage control is my reading; Cummins and Generac say that it does (notes 4.3, 4.8),
    not why.
  - **Lesson 4:** the 20 kg m² inertia and the 0.1 s response are example values. Hunting's cause:
    a saved page says dampers "are useful in preventing the hunting (momentary speed fluctuations) in
    generators" (tool 50, not in `quotes.json`), and a trade blog's search excerpt links frequency
    hunting to droop "too low (< 4%)" (tool 06, SECONDARY). Quote one before the lesson says more
    than the name.
  - **Lesson 6:** P = E V sin δ ÷ Xs is computed from lesson 3's drawing. The saved Cukurova page
    says "EA sin δ (which is proportional to the power supplied as long as VT is constant)" (tool 44,
    not in `quotes.json`); add it. "House diagram" is the notes' name for the lecture notes' picture
    (notes 2.5), not a quote; quote it from a saved page or call it "two droop lines back to back".
  - **Lesson 7:** the reverse power pickup is not in the notes; it is an example percentage,
    labelled. The pole-slip explanation is computed from P = E V sin δ ÷ Xs. X"d = 0.15 is an
    example value.
  - **Lesson 8:** the divider rule for the first dip is a simplification of lesson 3's model, not a
    maker's method; it is labelled. X"d and the 300 kVA soft-start figure are example values. The
    NRC's anti-motoring line (lesson 7) is from a plant's diesel generator description; it is used
    only for the general hazard.
  - **Hughes** 12th edition section lists (SECONDARY from the older contents), **Bird** chapters 37
    to 46, **Wisconsin's** syllabus, **Caterpillar** and **ComAp** guides, an **OpenLearn** course,
    the **MCA's** modernised syllabus, the **Pearson 2024** content list, and which **Section 551**
    regulations your 18th Edition unit covered are all UNCONFIRMED (notes 9). None is needed for a
    lesson.
  - **No examiner reports** exist at this level (UNCONFIRMED, notes 6). The mistakes above are
    makers' cautions, lecture-note statements and one circuits study, each marked.
  - **Nothing naval.** No naval or submarine source was used, nothing is said about any boat beyond
    the public 440 V in CLAUDE.md, and the SMQ books on your Drive were not read (notes 9).
