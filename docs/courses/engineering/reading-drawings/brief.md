# Reading drawings and schematics: the course brief

Written 13 Nov 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
the third course in the Engineering science shelf's Engineering science folder: "How to read any
system diagram: electrical schematics, hydraulic and pneumatic circuits, piping diagrams and
engineering drawings." Mechanics and materials and Heat and fluids come before it (both built). Two
later courses take ground next to this one. Fault-finding: from symptom to cause (Electrical shelf,
planned) uses these diagrams to find a fault. Hydraulics and pneumatics (this folder, not yet
planned) teaches how the parts work and are sized; this course only reads their diagrams. You chose
this course on 13 Nov and approved the build, so I have taken the decisions for you and listed them
below. Change any you like. Sources and quotes are in `research-notes.md` beside this file (232
quotes, cut by script from the 62 saved tool results and checked with `tools/eval/sources.mjs`,
`failed: 0`). Section numbers below point there.

**What you asked for (13 Nov):** "A schematics and drawings interpretation course would actually be
really useful", and of the four kinds, "they all matter and not in any order". You have to learn
system diagrams for your submarine qualification. This course never uses, shows or describes those
diagrams or any Navy drawing, and never says how the Navy or any boat draws or lays anything out. It
teaches the public conventions, so that any diagram drawn in those styles can be read: what each
symbol means, what the lines mean, what state the drawing shows, and how to trace a path through it.

## The short version
**Nine lessons**
1. How any diagram talks (built first)
2. Single-line diagrams: from each source to each load
3. Control schematics: coils, contacts and cross-references
4. Fluid power symbols
5. Valves in fluid power
6. Tracing a hydraulic circuit, then a pneumatic one
7. Piping and system diagrams
8. Engineering drawings
9. Reading one you have never seen

**The main pictures** (one per lesson, each moved with your finger, each showing the cause):
- **Drag it anywhere (lesson 1).** A small pump set drawn twice: as a picture of the parts where they
  sit, and as its diagram. Drag any part round the picture and the diagram does not change. Drag a
  part across the diagram and it still means the same. Tap any point and everything joined to it
  lights. Two lines that cross without a dot stay dark. A state switch shows one contact and one
  valve as drawn, then as they are when the plant runs.
- **The switchboard you open and close (lesson 2).** A single-line diagram of a small
  generator-fed switchboard: two generator sets, a shore supply, two bus sections with a normally
  open bus-tie, a transformer to a lower-voltage board, and a charger to a DC board with a battery.
  Tap any breaker or isolator to open or close it. Live lines go bold, dead lines go pale, and each
  load shows whether it has supply. In "isolate" mode you pick a load and tap what you would open;
  the board says if the load is dead and which other loads you took off with it.
- **The live control schematic (lesson 3).** A pump starter drawn the IEC way, in numbered current
  paths, with a second pump interlocked against it. Press Start, Stop, trip the overload, open the
  low-level switch. Each contact redraws to what it is doing now, beside a faint copy of how it is
  drawn. Tap a contact and its coil lights, wherever it is on the sheet, through the cross-reference.
- **The symbol kit (lesson 4).** A circle, a triangle, a spring, an arrow and a few lines. Put them
  together and the part's name appears: flip the triangle and a pump becomes a motor, empty it and
  hydraulic becomes pneumatic, add the slanted arrow and the part becomes variable. A cutaway switch
  shows a gear pump and a piston pump side by side, and both get the same symbol.
- **The sliding valve (lesson 5).** A 4/3 valve drawn as three boxes against four fixed ports, P, T,
  A and B, with a cylinder on A and B. Drag the boxes sideways, or tap a solenoid. Only the box
  standing against the ports joins them, and the cylinder moves to match. Let go and the springs push
  it back to the centre. Swap the centre box (closed, P to T, float) and watch what the pump and the
  cylinder do in the middle.
- **The press (lesson 6).** A workshop press: a power unit with its relief valve, a 4/3 solenoid
  valve, a check valve, a flow control and a double-acting cylinder, about eight parts. Tap each
  solenoid. The oil's path lights from the pump to one side of the cylinder, and from the other side
  back to the tank. The ram moves, stalls on the work, and the relief valve opens. A second card is
  its pneumatic twin, a 5/2 valve on a compressed air supply, where the air leaves through an exhaust.
- **The cooling loop (lesson 7).** A piping diagram of a cooling water loop with two pumps in
  parallel, a strainer, a heat exchanger and a three-way valve, and a second sheet of a fuel transfer
  system with a cross-connection. Tap valves open or shut. The flow lights only where an open path
  runs from a running pump. In "isolate" mode you pick a part and shut what you would shut; the sheet
  says whether the part is cut off on every side.
- **The glass box (lesson 8).** An object inside a glass box. Turn it with your finger. Tap
  "unfold" and the box opens flat, carrying each face's view to where first angle puts it, with
  hidden edges dashed. A switch shows third angle beside it. Drag a cutting plane through the object
  and the section appears, cut faces hatched.
- **What if (lesson 9).** Any of the course's systems, one at a time. Tap a part to change it: a
  valve shut, a contact open, a breaker tripped. Say what stops and what still runs, then watch it.

### Decisions taken for you (say if you want any changed)
- **Nine lessons, in the order you gave.** You said the four kinds are in no order, so the order is
  the one in which they build. Electrical gets two lessons, fluid power three, piping one and
  drawings one. Lessons 1 and 9 are drawn evenly from all four. Fluid power gets three because its
  valve symbol is the hardest to read and hydraulic and pneumatic are named separately in STCW (notes
  3.2, 4 lesson 5). Piping comes straight after fluid power because it reuses the valve-state reading.
  Engineering drawings stand alone, so they sit last before the mixed lesson. The notes' own advice
  on size is to merge, not cut: lesson 1 carries the rules and lesson 9 the practice, and lessons 2
  and 3 are short lessons of conventions, not of electrical theory (notes 8).
- **Lesson 1 is built first, then the rest without a pause.** You approved the build, so the others
  follow without waiting. Try lesson 1 on your phone as soon as it lands. If something is wrong, the
  rest will be changed before they are built.
- **Steps lessons, taught visually ("Yes", RUNBOOK section 0, item 3).** About 12 screens each, short
  SHOW screens and a DO screen after each, short whole sentences, ending on two or three mixed puzzles.
  Lesson 9 runs to about 14. Every lesson carries `format: 'steps'`, with `read` and `still` entries
  for the read-through and your Book.
- **Each lesson runs puzzle, rule, then puzzles.** It opens with a puzzle you can feel your way
  through on the picture. Then the rule, in one screen. Then puzzles you answer by tapping the
  drawing or typing. Brilliant "starts with concrete diagrams ... then connects those experiences to
  formal notation" (notes 1.1), and a symbol chart first is the opposite (notes 1.1). Each lesson's
  first DO screen after the opener asks "what state is this drawn in?" (notes 4, lesson 1).
- **Four kinds of interactive.** Trace a path by tapping parts in order. Switch a valve, a contact or
  a breaker and watch what moves or lights. Match a symbol to what it does. Pick the view that
  matches an object. Many short traces, not a few long ones, because "The ability to read and
  understand prints is achieved through the repetitive reading of prints" (DOE, SECONDARY, notes 6.5).
- **Every diagram is the course's own.** It is a drawing of a generic system: a workshop press, a
  cooling water loop, a compressed air system, a fuel transfer system, a pump's starter and a small
  generator-fed switchboard. Each is drawn to the public symbol conventions, and none copies any real
  installation's drawing. The figures in the US training texts (NAVEDTRA 14105A, DOE-HDBK-1016) are
  read as general training text and never redrawn (notes, preamble; 2.2).
- **The ISO, IEC and BS form first, the other to recognise.** Electrical symbols are IEC 60617 (BS EN
  60617), fluid power ISO 1219-1, piping ISO 10628-2, drawings ISO 128 and BS 8888 (notes 2.1). Each
  lesson then shows the other form in common use, as one to recognise: the US electrical set (IEEE/ANSI
  315) and US ladder layout, the older US fluid power and valve symbols (DOE, NAVEDTRA), and third
  angle beside first. "There are several symbol systems and conventions in use around the world ...
  Commonly used is ISO1219-1" (SMC, notes 2.1).
- **Every symbol is checked by eye before it ships.** The checker holds words, and a symbol is a
  picture. The standards are paid for and were not read (notes 2.1). So each symbol is drawn from the
  makers' public sheets (SMC's symbol sheet, Bosch Rexroth's Hydraulics Basic Principles, Festo's
  textbook) and checked against at least two of them at build. Each build log lists the symbols it
  drew and the sheets it checked them against. A symbol two sheets do not agree on is left out.
- **The drawn state is one rule with four faces.** Lesson 1 teaches it once. Electrical contacts are
  drawn de-energised (Galco, notes 2.1). A fluid power valve is drawn de-activated (e4training, notes
  2.2). Fluid power symbols show the "normal or neutral condition" (NAVEDTRA, notes 2.2). A P&ID shows
  valves in their "normal" position, with safety systems in standby (DOE, notes 4). Every later lesson
  comes back to it.
- **The electrical lessons start above your trade.** You read installation circuit diagrams and
  wiring diagrams already (EAL, CLAUDE.md), and Design and verification lesson 8 had a one-line of the
  showroom. So lesson 2 starts at several sources, bus sections and a bus-tie, and lesson 3 starts at
  coils and contacts drawn apart. Lesson 3 never re-teaches the DOL starter: Motors lesson 2 taught it
  as a live circuit, so this lesson teaches only how the drawing says it (notes 4, lesson 3).
- **The IEC control layout is taught first.** "US control drawings run ladder rungs horizontally and
  tag devices CR, M and OL, while IEC drawings run current paths vertically and use IEC 81346 codes
  such as -K1 and -Q1" (electrician.wiki, SECONDARY, notes 2.1). The IEC form is taught, and the US
  ladder is shown once as one to recognise. Most published teaching text on ladder logic is US (All
  About Circuits, notes 2.2), so its rules are taught on the IEC drawing.
- **No sums beyond a recall.** Reading a diagram needs no arithmetic. Typed answers are names, tags,
  port letters, valve labels, counts, scaled lengths and tolerance limits. Cylinder force, speed and
  relief settings belong to Hydraulics and pneumatics.
- **What-ifs run from cause to effect.** "This valve is shut: what stops?" is reading. "This stopped:
  what is wrong?" is fault-finding, which runs the other way, and belongs to Fault-finding: from
  symptom to cause. That course's first bench is a DOL starter's control circuit (its brief), so
  lesson 3 here gives you the drawing and that course gives you the hunt.
- **Instrument tags in outline only.** You shelved Instrumentation and control on 3 Nov ("I dont
  really think I want instrumentation and control", its STATUS.md). So lesson 7 teaches only how to
  read an instrument bubble's letters, enough to know what a tag on a pipe diagram measures. Nothing
  on loops, transmitters or control.
- **Recall openers only where an earlier course carries the lesson.** Lesson 2 (Generators lesson 5:
  why a bus-tie between two live sections waits for synchronising), lesson 3 (Motors lesson 2: what
  keeps the contactor in after Start is let go), lesson 4 (Heat and fluids lesson 5: a hydraulic
  jack's force), lesson 6 (Heat and fluids lesson 3: what happens to air when you squeeze it), lesson
  7 (Heat and fluids lesson 8: what a throttled valve does to a pump's flow) and lesson 8 (Proportional
  reasoning: a ratio as a scale). A right answer says "Still there" and carries on.
- **Examples are generic, the voltages labelled.** The switchboard uses 440 V, a 440/115 V transformer
  and a 24 V DC board, as example values. It is an example, never a claim about any boat. No reactor,
  weapons or propulsion plant, nothing beyond CLAUDE.md's public outline, and nothing from your SMQ
  books or your qualification's diagrams (notes, preamble; 4).
- **Colour, as before, with one choice.** Many fluid power trainers colour pressure lines red and
  return lines blue. Here red is only for warnings, so a line carrying flow is bold ink with arrows,
  and an idle one is pale ink. Amber for key terms, teal for small labels (port letters, tags, current
  path numbers). Red only for a load still live after an isolation, two actions an interlock should
  stop, stored pressure, and a mistake. Green only for finished.
- **Fit to 360 px.** Each diagram has at most about a dozen parts you can tap, so it fits a phone
  held upright without zooming. Bigger systems are split into sheets, the way real sets are.
- **Your intake answers** (`intake.json`): to understand reading drawings and schematics and how to
  work with them; on the job and in everyday life; hands-on, with the why explained in full.

## 1. The overall topic
Every system diagram is a map of what is joined to what. It does not show what the plant looks like,
where its parts are, or how long its pipes and cables run. Once you read it that way, the four kinds
are one skill with four vocabularies. You find the legend and the sources. You learn the state the
drawing is drawn in. Then you trace one path at a time, from a source to where it ends, through each
part in turn. An electrical single-line traces power from generators to loads. A control schematic
traces a rung from its supply through contacts to a coil, and the coil's name tells you which other
contacts it moves. A fluid power circuit traces oil or air from the pump through whichever valve box
is in line, to one side of an actuator, and back from the other. A piping diagram traces flow through
open valves, pumps and heat exchangers. An engineering drawing is the odd one out. It shows shape,
not connection: one object seen square-on from several sides, set out by a fixed rule, with lines,
sections, sizes and limits in a code of their own.

It covers the general conventions shared by all four kinds; single-line distribution diagrams;
control schematics with cross-references; fluid power symbols, valves and circuits, hydraulic and
pneumatic; piping and system diagrams with instrument tags in outline; and orthographic drawings with
sections, dimensions, tolerances, scale and the title block. Its edges: reading, never making or CAD;
the ISO, IEC and BS forms taught and the US forms shown to recognise; what the symbols say, never how
the parts work inside or how they are sized; and generic systems only.

**It builds on:**
- **Your trade:** installation circuit diagrams and wiring diagrams, isolation, BS 7671 design and
  verification (EAL, CLAUDE.md).
- **Design and verification:** the showroom's one-line diagram, one source and radial (lesson 8).
- **Motors:** the DOL starter as a live circuit: the sealing contact across Start, the normally
  closed Stop, the overload contact, no-volt protection (lesson 2).
- **Generators and paralleling:** sets on a board, synchronising before a breaker closes onto a live
  bus (lesson 5), preferential tripping (lesson 7).
- **Transformers and magnetism:** stepping 440 V down to 115 V. **Electronics and power
  electronics:** rectifiers, inverters, a charger. **Batteries:** a battery as a DC source.
  **Insulated systems and earth faults:** boards that are joined share one monitor (lesson 5).
- **Heat and fluids:** the air receiver and Boyle's law (lesson 3); pressure as force over area and the
  hydraulic jack (lesson 5); pipes and head (lesson 7); the pump curve, the throttled valve, and
  positive displacement against centrifugal (lesson 8).
- **Mechanics and materials:** forces and moments, for what a cylinder does to a load.
- **Geometry fundamentals, The coordinate plane, Proportional reasoning:** solids, views on a grid,
  scale as a ratio.
- **Scientific thinking:** predict, then play, then explain (notes 5).

**Not taught again:** three-phase and what one line stands for (a one-sentence reminder), how a
contactor and its sealing contact work, synchronising, how a transformer or a rectifier works,
pressure and force over area, the pump curve, isolation as a duty. Each is used with a one-line
reminder, and only how the drawing says it is new.

**Taught inline, because no course has built it** (notes 5): the symbol families and their standards;
the drawn-state rule in its four forms; reference designations and tags in outline; coils and
contacts drawn apart and the cross-reference; the box-per-position valve symbol and its centre
conditions; instrument bubbles and tag letters in outline; first-angle projection, line types,
sections, tolerances and the title block; the reading method of lesson 9.

**Left for later:**
- **Fault-finding: from symptom to cause** (Electrical shelf, planned): finding a fault from a
  symptom, on a starter, a motor and an insulated board (its brief). It uses lessons 2 and 3's
  drawings. This course's what-ifs run only from a change to its effect.
- **Hydraulics and pneumatics** (this folder, not yet planned): how pumps, valves, cylinders and
  accumulators are built and work; force, speed and flow sums; setting a relief valve; the service
  unit's parts; designing a circuit. Lessons 4 to 6 read their symbols only.
- **Heat and fluids and your Level 3 course:** pipe losses, valve sizing, Moody diagrams.
- **Not deferred, left out:** making drawings and CAD (not your need, notes 5); logic gate symbols
  (BTEC Unit 19, notes 1.2), which no built course uses; welding, surface texture and geometric
  tolerancing symbols beyond a name; architectural and wiring layout drawings, which your trade covers.

## 2. The lessons, in the order they build
Your scope's order. It matches the makers' order inside fluid power: what a symbol is for, then lines
and basic elements, then pumps, motors, cylinders and accessories, then valves with their ways label,
then circuits (notes 2.2). It matches the drawing texts' order: views, then line types, then sections
and sizes (MIT, UW, LibreTexts, notes 2.2).

| # | Lesson | What it teaches |
|---|---|---|
| 1 | How any diagram talks | Opening puzzle: three drawings of one pump set, laid out three ways; which are the same? A diagram shows function, not shape or place: "It doesn't show what the circuit actually looks like, or how long all the connections are" (Bitesize, notes 6.1); schematics "do not accurately represent the relative location of the components" (DOE, SECONDARY, notes 4); they "show _that_ electrical connections exist but not _how_ they are made physically" (Marshall, notes 6.1). Symbols "show connections, flow paths, and the function of the component represented only" (NAVEDTRA, SECONDARY, notes 2.2). Lines and junctions: crossing lines "do not indicate an electrical connection unless they are marked with a small circle" (Marshall, notes 6.2); the same rule for pipes and fluid lines (my reading, notes 4). The legend, "just like a map legend" (EECO, SECONDARY, notes 2.2). The title block in outline, "drawing number(s), projection symbols, scale, units, general tolerances, name of author, date" (BTEC Unit 2, notes 1.2); lesson 8 reads it in full. Which standard draws which kind: IEC 60617, ISO 1219-1, ISO 10628-2, ISO 128 (notes 2.1). The drawn state, one rule with four faces: a normally open contact "Shown in the shelf state: open when the relay coil is de-energized" (Galco, SECONDARY), and "A normally closed contact is drawn closed even if, in normal running, its coil is energized and the contact is open" (electrician.wiki, SECONDARY, notes 4); valves "drawn in the de-activated position e.g. pushed over by the spring, not the solenoid" (e4training, SECONDARY, notes 2.2); "the normal or neutral condition" (NAVEDTRA, notes 2.2); P&IDs show valves "in their "normal" position", safety systems "in their standby or non-accident condition" (DOE, notes 4). Why the off state is drawn: designers want the system "in its safest mode with the solenoid de-energized" (All About Circuits, notes 4). Reference designations in outline: a name "for the purpose of creation and retrieval of information about an object" (IEC 81346-1, notes 2.1), such as -K1 (electrician.wiki, notes 2.1); the same name on the plant: "Tag numbers should match the line diagrams" (HSG253, SECONDARY, notes 7), labels that "enable clear cross referencing with the circuit diagram" (TRG 41, notes 7). Reading from source to load: a one-line "starts at the top of the page and works its way down" (EECO, notes 2.2), but a pneumatic diagram's "signal flow is represented from the bottom to the top" (Festo, SECONDARY, notes 2.2). So find the source first; never trust the reading order (Corter, notes 6.1). |
| 2 | Single-line diagrams: from each source to each load | Recall: why a breaker between two live sections waits (Generators lesson 5). A one-line runs "from power sources (generators, shore power, battery banks) through a distribution system (switchboard, busbars, cables, feeders, and panels) to supply various power consuming loads" (USCG, notes 2.2). "one single line shown for bus (or cable) to represent all three phases" (EECO, notes 2.2), one sentence for you. The thick line is "the busbar ... that every outgoing circuit connects to" (Cobler, SECONDARY, notes 2.2). Transformers "help you identify when you are changing from one voltage to another" (EECO, notes 2.2): 440 V to 115 V (Transformers and magnetism), and a charger to a 24 V DC board with its battery (example values). "each load connection is understood to have its own circuit breaker" (Doerry, notes 2.2), and bus-tie and generator breakers "should have a unique identifier" (Doerry, notes 2.2). The symbols: generator, circuit breaker, isolator, switch-disconnector, fuse, transformer, rectifier and inverter, battery, motor load, in IEC form with the US form to recognise (the US forms differ for "the fuse, switch and relay contacts, coils, circuit breakers", electrician.wiki, notes 2.1). It shows "how power gets from the incoming supply to any board or circuit, but not where the cables are installed" (Cobler, notes 2.2). The bus-tie: "a breaker that's normally open, so each transformer feeds its own half" (Cobler, notes 2.2). Close it and one source can feed both halves; two running sets need synchronising first (Generators lesson 5, named only). A one-line does not say how the plant is run; it is read with a statement of "how the electrical power system is intended to be operated" (Doerry, notes 2.2), so each drawing here carries a one-line caption. The isolating question: isolate "without disconnecting other circuits that are required to continue in service" (HSG85, notes 2.2); "consult the one-line diagram to be able to ensure you are shutting off the correct upstream breaker" (EECO, notes 7). A load fed two ways needs both ways opened (computed from the drawing); "someone isolates the breaker the drawing names, and the circuit is still live" (Cobler, notes 7). |
| 3 | Control schematics: coils, contacts and cross-references | Recall: what keeps the contactor in after Start is let go (Motors lesson 2). "Ladder diagrams are specialized schematics commonly used to document industrial control logic systems" (All About Circuits, notes 2.2). The coil and its contacts are drawn apart: they "are associated with their respective contacts by _name_ rather than by proximity" (All About Circuits, notes 2.2); they "may appear on different pages or in different ladder-diagram rungs. Match them using the reference designation and cross-reference information. Do not assume two similarly shaped coils belong to the same device" (Viox, SECONDARY, notes 2.2). The IEC sheet: vertical current paths, numbered, with -K1 and -Q1 names; the US ladder: horizontal rungs and CR, M, OL (electrician.wiki, notes 2.1), where "an electromechanical relay coil is shown as a circle, and the contact(s) ... as two parallel lines" (All About Circuits, notes 2.2). Contacts drawn in the shelf state, so the normally closed Stop is drawn closed while the pump runs (electrician.wiki, notes 4). Reading Motors lesson 2's circuit on paper: the "normally-open “seal-in” contact ... connected in parallel with the start switch" (All About Circuits, notes 2.2). Permissives in series, "so that if any one of them detects an unsafe condition, the circuit will be opened" (All About Circuits, notes 2.2). Interlocks "prevent a control system from taking two incompatible actions at once", and "The energization of one contactor prevents the energization of the other" (All About Circuits, notes 2.2); a mechanical interlock is "a lever joining the armatures" (notes 2.2). The normally closed overload: "If the heaters get too hot, the contact will change from its normal (closed) state to being open" (All About Circuits, notes 2.2). Why a protective contact is normally closed: "we want the switch contact to open if the fuel pressure gets too high" (All About Circuits, notes 2.2). The skill: say what each contact is doing now, for each state of the plant. Three drawings of the same starter: the schematic (function), the wiring diagram (terminals as in the panel, your trade) and the block diagram (boxes and flow lines), because seeing more than one diagram type for one system helps (Corter, notes 6.1). |
| 4 | Fluid power symbols | Recall: a hydraulic jack's output force (Heat and fluids lesson 5). ISO 1219-1 "establishes basic elements for symbols. It specifies rules for devising fluid power symbols" (ISO, notes 2.1): a symbol is built from parts, each meaning one thing. Symbols "indicate the function of the element" (Festo, SECONDARY, notes 2.2); "Graphic symbols of hydraulics do not provide information about the design structure of the components" (Bosch, notes 2.2); "Symbols do not indicate the location of ports, direction of shifting of spools, or position of control elements on actual components" (NAVEDTRA, notes 2.2). Turn them freely: "Symbols may be rotated or reversed without altering their meaning except in cases of lines to reservoirs and vented manifolds" (NAVEDTRA, notes 2.2). Pump against motor: in the older US set "the point of the arrow touches the circle in a pump and the tail of the arrow touches the circle in a motor" (DOE, notes 2.2); in ISO 1219 the triangle points out of a pump and into a motor (my reading, notes 4; see gaps). Hydraulic or pneumatic: "the hydraulic pilot is shown as a solid triangle although if this was a pneumatic pilot it would be shown as a clear triangle" (e4training, notes 2.2). The parts: reservoir, pump (fixed and variable), motor, single and double-acting cylinder, filter, cooler, accumulator, gauge, and the electric motor that drives the pump. The lines: working, pilot and drain; crossing and joining. "Fluid power diagrams and schematics require an independent review because they use a unique set of symbols and conventions" (DOE, notes 2.2). Where a misreading could hurt: "clarify the meaning of symbols with written descriptions where misinterpretation could create a hazard" (TRG 41, notes 4). |
| 5 | Valves in fluid power | The label: "The first number indicates the number of main ports and the second the number of positions. A 4/3 valve has four ports and three positions" (Hidraoil, SECONDARY, notes 2.2); "4 pipe connections, generally Pressure, Return, Port A and Port B" (e4training, notes 2.2). One box per position, ports drawn on the box that is in use (my reading, notes 4). Operated and returned: "two separate methods. They are both shown on the symbol either side of the position boxes" (Festo, notes 2.2): lever, solenoid, pilot, spring, detent. "A detent holds a position, while a spring may return the valve to another position. Proportional control differs from electrical on/off actuation; the functions must not be confused" (Hidraoil, notes 2.2). Drawn at rest: "pushed over by the spring, not the solenoid" (e4training, notes 2.2), and 4/3 valves "are all shown at standby in their centre positions" (e4training, notes 2.2). Centre conditions: P and T joined is "neutral circulation ... an unloading valve" (Bosch, notes 2.2), "commonly used with fixed displacement pumps so that there is no pressure on the pump when it is not required" (e4training, notes 2.2); a closed centre keeps the line "pressurized from the pump ... to the directional control valve" (NAVEDTRA, notes 2.2) and holds the cylinder, but "there will be some leakage between ports ... facilitating cylinder creep" (e4training, notes 2.2). Crossover boxes "show the crossover conditions e.g. the connection type as the valve switches" (e4training, notes 2.2), named only. Pneumatic port numbers: "2, 4 A, B Working lines 3, 5 R, S Exhaust ports" (Festo, notes 2.2), and the common types, "4/3-way valve, closed neutral position ... 5/2-way valve ... 5/3-way valve, closed neutral position" (SMC, notes 2.2). Then one symbol each: pressure relief, pressure reducing, check valve, flow control. A relief valve: "When system pressure exceeds its setpoint, the valve opens and returns the hydraulic fluid back to the reservoir" (DOE, notes 4). How each is built and set: Hydraulics and pneumatics. |
| 6 | Tracing a hydraulic circuit, then a pneumatic one | Recall: what happens to air in a cylinder when you squeeze it (Heat and fluids lesson 3). "The first step is to get an overall view of what is happening" (DOE, notes 4): this one is a press, and "Hydraulic systems are often used in press work or other applications where the work piece must be held in place" (DOE, notes 4). Then the parts, then each valve position. Drawn at rest: "note the valve is shown in the de-energized position" (DOE, notes 4). Energise a solenoid and follow the oil, as DOE's worked reading does: "routed from Port 1 to Port 3 and then to the bottom chamber of the piston" (notes 4), while "when pressure is applied to the top chamber, the bottom chamber is aligned to drain back to the reservoir" (DOE, notes 2.2). For each position say what moves and which way, what holds the load (the closed centre and the check valve), what limits the pressure (the relief valve) and what limits the speed (the flow control). Open and closed-centre systems: "the pump circulates the fluid from the reservoir, through the selector valves, and back" against "the fluid in the system remains pressurized" (NAVEDTRA, notes 2.2). The solenoids are named on a control schematic like lesson 3's, so the press is electro-hydraulic (MSN 1860, notes 3.2). The pneumatic twin, Festo's 5/2: "the supply pressure is connected to the piston side of the cylinder, while the piston rod side is exhausted"; released, "the valve return spring pushes the valve into the initial position" and "The piston rod retracts" (Festo, notes 2.2). What differs in air: it leaves "via the exhaust port of the valve" (Festo, notes 2.2), not back to a tank; it comes from the compressor and receiver (Heat and fluids lesson 3) through a service unit (see gaps); and it squeezes, so a held cylinder can move when its load changes (Heat and fluids lesson 3; Festo's own line UNCONFIRMED, notes 4). Last screen: before work, "release any stored energy, such as compressed air or hydraulic pressure that could cause the machine to move or cycle" (HSE, notes 4), and "accumulators and pressurised pipework should be depressurised" (HSG253, notes 4). |
| 7 | Piping and system diagrams | Recall: what a throttled valve does to a pump's flow (Heat and fluids lesson 8). "To read and interpret piping and instrument drawings (P&IDs), the reader must learn the meaning of the symbols ... When the symbology is mastered, the reader will be able to interpret most P&IDs" (DOE, notes 4). Pipes and line types, valves (gate, globe, ball, butterfly, non-return, relief, three-way), pumps, tanks, strainers and heat exchangers, in ISO 10628-2 form (notes 2.1) with the older US forms to recognise. Three honest limits, from DOE (notes 4, 6.3): "globe and gate valves will often be depicted by the same valve symbol", so the tag or legend decides, and sometimes neither does; "the symbols alone ... do not provide the reader with enough information to determine whether applying air pressure to the diaphragm opens or closes the process control valve"; "3-way valves are sometimes drawn in the position that they will fail to instead of always being drawn in their "normal" position". The drawn state: "Unless otherwise stated, P&IDs indicate valves in their "normal" position" (DOE, notes 4). Two systems of one kind on one sheet: "additional letters are added to the symbols to differentiate between the systems" (NAVEDTRA, notes 4). Instrument bubbles and tag letters in outline: ISA 5.1 lets "anyone reading a flow diagram ... understand the means of measurement and control of the process" (notes 2.1); the letters themselves (first letter what is measured, then what the instrument does) are UNCONFIRMED (notes 4). Tracing: the flow path for a valve lineup (DOE, notes 4); what a cross-connection allows. Isolating: "isolate plant and pipelines containing pressured fluid ... Lock off isolating valves" (HSE, notes 4); "Are all isolation points identified on the plant and do they match the line diagram and isolation certificate?" (HSG253, notes 4). Why the drawing must be right: a closed isolation valve "was not marked on the system's drawings, and those on board were unaware of its significance in isolating the expansion tank" (MAIB, notes 7). |
| 8 | Engineering drawings | Recall: a 1 : 5 scale as a ratio (Proportional reasoning). "Engineering components are 3-dimensional, but the tools that we use to communicate about them ... are 2-dimensional" (UW, notes 2.2). One picture hides things: "if the object in figure 2 had a hole on the back side, it would not be visible using a single isometric drawing" (MIT, notes 2.2). So several views, laid out by a rule. First angle, with third angle named, because "there should be an understanding of the principles of both" (BTEC Unit 16, notes 1.2); the projection symbol on the title block says which (Unit 16, notes 1.2). Views follow "the orthographic projection methods specified in ISO 5456-2" (ISO 128-3, notes 2.1). Line types: visible edges "are shown as solid lines" (UW); "hidden lines are, by convention, dotted" (MIT), drawn as short dashes; centre lines "a special “long-short-long” line" (UW); and when lines fall on each other, "(1) visible lines, (2) hidden lines, (3) center lines" (UW, notes 2.2). Sections: the cut area is hatched, "section lining or cross-hatching" (MIT); "thin, continuous diagonal hatch lines" (LibreTexts); the cutting plane line shows "where the object is imagined to be cut, while the arrowheads specify the direction of sight" (LibreTexts); and "Webs, ribs, and spokes are not hatched in section views, even if they are cut" (LibreTexts, notes 2.2). What else a drawing carries: "dimensions – size of the component in defined units o tolerances – allowable variations for defined dimensions o material ... o surface texture ... o scale – relative to actual dimensions" (BTEC Unit 2, notes 1.2). Tolerance: 25 ± 0.1 mm means anything from 24.9 to 25.1 mm is right (example, computed). Scale: 40 mm on a 1 : 2 drawing is 80 mm on the part (example, computed). The title block: "drawing number, title and issue number, projection symbols ... scale, units, general tolerances, name of person responsible" (Unit 16, notes 1.2), and the issue tells you if yours is current: one-lines must be kept "up to date as new gear is added" (EECO, notes 7), and the same holds for any drawing. Why it matters: standards avoid "errors of interpretation which can lead to the scrapping of expensive parts" (Unit 16, notes 1.2). General arrangement and assembly drawings named (City & Guilds, BTEC Unit 44, notes 3.1, 1.2). |
| 9 | Reading one you have never seen | The standards hold "a huge amount of information", so learners "will need to be given a structure to work to when being asked to interpret drawings" (BTEC Unit 16, notes 4, lesson 9). The structure: find the legend; find the sources and the sinks; find the drawn state; trace one path at a time; then ask what the change does. It is DOE's objective, "IDENTIFY components and DETERMINE the flowpath(s) for a given valve lineup" (notes 4), and its question, "Which valves would need to change position in order for Pump B to supply flow to only points G and H?" (DOE, notes 4). Against the reading-order trap: diagrams with no natural start "tend to be scanned in reading order" (Corter, notes 6.1), so the method starts at the sources. Mixed puzzles, evenly from all four kinds, on systems you have not seen: a compressed air system, a second switchboard, a hoist's control schematic, a bracket's drawing. What-ifs: this valve shut, this contact open, this breaker tripped: what stops, and what still runs? Say it back, as Unit 16's task does: "read and interpret an engineering drawing in order to report the key features ... to a colleague" (notes 4). Last puzzle: a drawing and a photo of the plant it claims to show; find where they differ, because HSG253 names "failure to check P&IDs/schematic diagrams against the actual installed plant" as a human failure (notes 7). |

## 3. Can it be taught mostly visually, through interaction?
**Yes** (RUNBOOK section 0, item 3). Reading a diagram is a thing you do with your eyes and a finger:
follow a line, flip a switch, see what lights. So these are steps lessons of about 12 screens, short
SHOW screens and a DO screen after each, one main picture per lesson and still drawings elsewhere.
The research gives four design rules (notes 6.5). Teach the diagram's own rules of inference, "if the
valve is here, the oil goes there", not only the symbols (Larkin and Simon). Teach parts in the
working groups skilled readers see, a pump with its relief valve, a start-stop rung, because experts'
"Recall showed marked “chunking”, or grouping, by functional units", and "This advantage did not hold
for randomly arranged symbols" (Egan and Schwartz). Put each label on the part it names, not in a
caption, since "Physical integration (e.g., combining text and diagrams) may reduce cognitive load"
(Chandler and Sweller). And give many short traces (DOE). The pictures, and why each was chosen:

- **Lesson 1, drag it anywhere.** A small pump set: a supply, an isolator, a starter, a motor and a
  pump with its pipe to a tank. On the left it is drawn as a picture, each part where it sits in a
  room; on the right as its diagram. Tap a part in either and its twin lights. Drag parts round the
  picture: the diagram does not change. Drag a symbol across the diagram and stretch its lines: the
  meaning does not change. Tap any point and every point joined to it lights; a crossing without a
  dot stays dark, then add the dot and it joins. A state card shows one contact and one valve as
  drawn, then as they are with the plant running, and a tag on the picture lights its symbol on the
  diagram. *Why:* the research's first and strongest finding is that people read a diagram as a
  layout, even after teaching: students have difficulty "interpreting standard circuit diagrams as
  abstract representations of the electrical connections ... as opposed to literal representations
  of the physical layout" (Marshall, notes 6.1); readers "must learn to suppress ... inferences based
  on Euclidean properties of diagrams, such as the planar distances among nodes" (Corter, notes 6.1);
  and the topology error is "All resistors lined up in series are in series whether there is a
  junction or not" (Engelhardt and Beichner, notes 6.1). Dragging shows that position carries no
  meaning, and the lit set shows what does. Going both ways, picture to diagram and diagram to
  picture, matters because the second is harder (Engelhardt and Beichner, notes 6.1).
- **Lesson 2, the switchboard you open and close.** A single-line of two generator sets, a shore
  supply with its breaker, a main board in two sections with a normally open bus-tie, a 440/115 V
  transformer to a small board, and a charger to a 24 V DC board with its battery. About eight loads.
  Tap any breaker or isolator. Every line live from a running source goes bold ink, the rest pale,
  and each load's lamp shows if it has supply. Close the bus-tie with both sets on and a card says
  "synchronise first" (Generators lesson 5). In "isolate" mode, choose a load and tap what you would
  open; the board says whether the load is dead, and lists in red anything else you took off. One
  load is fed two ways. *Why:* the sources agree on the reading order, legend, sources, busbars, then
  each breaker to its load (USCG, EECO, Cobler, notes 2.2), and the isolating question is HSG85's
  (notes 2.2). The bold and pale lines make "live" a property of joined paths, not of where a load
  sits. The two-way load is the trap the notes find most dangerous: a part that is normally open,
  and so "does nothing", does something the moment it closes (Fredette and Clement, SECONDARY, and
  the notes' reading, notes 6.1), and "the circuit is still live" (Cobler, notes 7).
- **Lesson 3, the live control schematic.** Two pump starters on one IEC sheet, current paths
  numbered along the top. Each coil carries a small table of the paths where its contacts sit. Duty
  pump -Q1 and standby pump -Q2 are interlocked, each through a normally closed auxiliary contact of
  the other, with a normally closed overload and a low-level permissive in series. Buttons: Start 1,
  Start 2, Stop, trip overload, tank low. Every contact redraws to its present state in bold ink,
  with a faint copy of its drawn state behind it. Tap any contact: its coil lights and the table
  points to the path. A "US ladder" switch redraws the same circuit as horizontal rungs with CR, M and
  OL tags. *Why:* "Many students find it confusing that relay contacts and coils need not be drawn
  next to one another" (All About Circuits, notes 6.3), and this is "the most challenging aspect of
  interpreting ladder diagrams, for people more familiar with electronic schematic diagrams" (notes
  6.3). The cause shown is that a contact follows its coil by name, wherever the coil is drawn, and
  that the drawing shows the shelf state, not the running state. You know the circuit's behaviour
  from Motors lesson 2, so all your attention goes on the drawing.
- **Lesson 4, the symbol kit.** A tray of ISO 1219 elements: circle, solid and open triangles,
  spring, slanted arrow, square, lines. Drop them together and the part is named: circle and
  outward solid triangle, a hydraulic pump; flip it, a motor; empty it, pneumatic; add the arrow,
  variable. A shelf of finished symbols (reservoir, cylinder, filter, cooler, accumulator, gauge)
  matches by dragging each onto what it does. A cutaway switch shows a gear pump and a piston pump,
  built nothing alike, and both take the same symbol. Rotate any symbol and the name stays, except a
  reservoir line. *Why:* ISO 1219-1's own scope is "basic elements" and "rules for devising" symbols
  (notes 2.1), so a symbol is read by its parts. The cutaway is Bosch's and Festo's rule, symbols do
  "not provide information about the design structure" (notes 2.2), shown rather than told. Matching
  a symbol to its job is the drill the examiners' "not knowing the correct circuit symbols" calls for
  (Edexcel, notes 6.2).
- **Lesson 5, the sliding valve.** A 4/3 valve, three boxes against four fixed ports, with a
  cylinder on A and B and a pump and tank on P and T. Drag the boxes left or right, or tap solenoid
  -Y1 or -Y2. Only the box in line with the ports joins them, bold where flow can pass, and the
  cylinder moves to match. Let go and the springs centre it. A centre picker swaps the middle box:
  closed, P to T, float. With P to T the pump unloads; with closed the pump's line stays under
  pressure and the cylinder holds, then creeps slowly, as a leaking spool does. Smaller cards show
  a 3/2 and a 5/2 with port numbers, and one symbol each for relief, reducing, check and flow
  control. *Why:* the box against the ports is the part that does the work (notes 4, lesson 5), and
  sliding it is what the symbol stands for. The notes judge the centre conditions the best puzzle in the
  course on what a symbol means (notes 4, lesson 5), and the creep is e4training's own warning that the
  drawn symbol is an ideal (notes 2.2).
- **Lesson 6, the press.** A power unit (reservoir, electric motor, pump, filter, relief valve,
  gauge), a 4/3 solenoid valve with a P to T centre, a check valve, a flow control and a
  double-acting cylinder above a work piece. Tap -Y1: oil lights from the pump through the valve to
  the cap end, and from the rod end back to the tank; the ram comes down at the speed the flow
  control allows. It meets the work, stops, the gauge climbs and the relief valve opens, its path to
  the tank lit. Tap -Y2 and it rises. Let go and it holds. A pneumatic card does the same with a 5/2
  valve, a service unit and a cylinder whose air leaves through an exhaust, with a "load changes"
  slider that lets a held cylinder drift. A last card stops the pump with the accumulator charged: the
  gauge still reads, in red. *Why:* DOE's worked reading is the shape of the lesson: the job, then the
  parts, then each position with its path (notes 4, lesson 6). The cause shown is that each valve
  position sets one path from the pump to the tank, and the actuator moves because of which side is
  fed and which is drained (DOE, notes 2.2). Seeing the hydraulic and the pneumatic version of one
  job is Corter's advice to read more than one diagram type for one system (notes 6.1). The stored
  pressure card is HSE's and HSG253's rule, played (notes 4).
- **Lesson 7, the cooling loop.** Sheet 1: a cooling water loop with two pumps in parallel, each with
  a suction valve, a discharge valve and a non-return valve, a strainer, a heat exchanger with a
  three-way valve and a bypass, a header tank and a temperature tag. Sheet 2: a fuel transfer system,
  two tanks, a transfer pump, a strainer, and a cross-connection between two lines. Tap valves open or
  shut and start or stop the pumps. Flow lights only along open paths from a running pump. In
  "isolate" mode, choose a part and shut what you would shut; the sheet says whether it is cut off on
  every side, and lights in red any pipe still open to it. One valve on the plant photo is missing
  from the drawing. *Why:* DOE's objective is "the flowpath(s) for a given valve lineup" (notes 4),
  and that is what the lit lines are. The isolate mode is HSE's and HSG253's isolation, read off the
  drawing (notes 4). The missing valve is the MAIB case, where the valve "was not marked on the
  system's drawings" (notes 7).
- **Lesson 8, the glass box.** A bracket with a hole, a slot and a rib, inside a glass box. Turn it
  with your finger. Tap "unfold" and the faces swing out flat, each carrying its view: first angle,
  with the projection symbol in the corner; a switch lays third angle beside it. Hidden edges appear
  as short dashes, centre lines as long-short-long. Drag a cutting plane through the bracket; the
  section view appears with the cut faces hatched and the rib left plain. Puzzles: tap the view that
  matches, find the face that a line belongs to, read a dimension, a tolerance and the scale. *Why:*
  "some students have difficulty imagining objects as a three dimensional mental image from two
  dimensional orthographic views" (ASEE, notes 6.4), and "students often struggle in correctly placing
  the individual views of the object within the orthographic layout" (IJERT, notes 6.4), a study that
  used the glass box to teach it. Sketching and projection moved spatial skill more than 3D software
  alone (Sorby, notes 6.4), so one screen asks you to sketch a view on paper and then compare.
- **Lesson 9, what if.** The course's systems and four new ones, one sheet at a time, with the
  method as four small tabs along the top: legend, sources, state, trace. Tap any part to change it.
  Before it plays, choose what stops and what still runs; then the sheet plays it, and anything you
  missed is ringed. *Why:* the method is Unit 16's "structure to work to" and DOE's lineup question
  (notes 4, lesson 9). Predicting first is the habit of Scientific thinking (notes 5). The ringing of
  what you missed answers Corter's finding that readers follow paths in one order and miss the ones
  that run against it (notes 6.1).

## 4. What else
- **Benchmark (notes 1, 2).**
  - **Brilliant** has no course on reading diagrams (notes 1.1). Its Circuits teaches what a
    circuit does, with bulbs, and never teaches the standard symbols or a drawing's conventions
    (notes 1.1, the notes' reading); Digital Circuits has one level with "Crossing and Connecting"
    (notes 1.1). Brilliant sets the manner only: concrete first, notation after (notes 1.1).
  - **Pearson BTEC Level 3 National Engineering** is the benchmark (notes 1.2). Unit 2 B1 lists what a
    drawing carries: standards, title block, views, line types, common features and circuit symbols.
    Unit 12 B1 asks for "Symbols and circuit diagrams for hydraulic and pneumatic power systems ... to
    BS ISO 1219-1:2012". The older Unit 16, Engineering Drawing for Technicians, runs sketching, then
    interpreting to the standards, then producing, then CAD, and says learners need "a structure to
    work to" (notes 1.2). Unit 44 reads assembly drawings to BS 8888.
  - **The makers' fluid power guides** (Bosch Rexroth, Festo, SMC) run function, lines and basic
    elements, pumps and actuators, valves, circuits (notes 2.2). The US fluid power text NAVEDTRA
    14105A puts components first, then diagrams, then the symbol appendix (SECONDARY, notes 2.2).
  - **DOE-HDBK-1016** runs valve symbols, actuators, piping, instruments, reading P&IDs, then fluid
    power diagrams (SECONDARY, notes 2.2). Its symbols are the older US set, so the ISO form comes
    first here.
  - **All About Circuits' Ladder Logic chapter** runs ladder diagrams, logic functions, permissive and
    interlock circuits, motor control, fail-safe design, PLCs (notes 2.2).
  - **MIT, UW and LibreTexts** run isometric, orthographic views, dimensions, sections, assemblies
    (notes 2.2).

  What they lack that you need: each teaches one kind. None teaches the four together, and none
  teaches the drawn state as one rule across them (notes 4, lesson 1). Lessons 1 and 9 fill that.
  BTEC teaches making drawings; this course takes its content for reading only (notes 1.3).
- **His aim (notes 3).** You have no syllabus for the Navy courses ahead, so the course is planned
  against public standards, and each guess is said (notes 3, preamble).
  - **ST0457 Engineering technician**, core: "graphical expressions, symbols" and "obtaining,
    checking and using the appropriate documentation (such as ... drawings ...)"; its maritime
    options: "read, analyse and interpret engineering data, drawings and documentation used in the
    design, build, operation and repair of maritime vessels" (notes 3.1).
  - **ST1403 Maritime electrical fitter**, written with the Royal Navy among its employers: "Receive,
    read and interpret engineering data and documentation such as engineering drawings, technical
    data, blueprints, schematic drawings" (notes 3.1). Which standard your course follows is a guess
    (notes 3).
  - **ST0276 Maritime mechanical and electrical mechanic**: work "from engineering drawings ... on
    ships and submarines" across electrical, mechanical and fluid power equipment (notes 3.1).
  - **ST1426 Engineering maintenance technician**: "Types of diagrams used to represent circuits",
    "Types of control and instrumentation diagrams", diagrams of mechanical installations, and
    "Identify and highlight issues (red pen) with technical drawings" (notes 3.1).
  - **City & Guilds Level 3 Diploma in Marine Engineering**: "identify diagrams, schematics and
    symbology", drawing scales, general arrangement drawings, "schematic drawings, hydraulic drawings"
    (notes 3.1). It is the boats' qualification, a comparison only.
  - **STCW A-III/1**: "The interpretation of electrical and simple electronic diagrams", "The
    interpretation of piping, hydraulic and pneumatic diagrams" and "Interpretation of machinery
    drawings and handbooks" (notes 3.2). **A-III/6** and MSN 1860: electrical and electronic diagrams,
    the distribution system "with drawing/instructions", and ships' technical drawings (notes 3.2).
    The merchant standard, used as evidence of what a ship's electrical person reads, not as your
    syllabus (notes 3).
  - **My guess:** your Level 3 course will hand you system diagrams of every kind as it teaches each
    plant. This course gives you the grammar, so each new diagram is new parts, not a new language.
- **Starting point (notes 5).** Nothing below is taught again; each is used with a one-line reminder.

  | Idea | Earlier lesson | Used here |
  |---|---|---|
  | Installation circuit and wiring diagrams; isolation | Your trade | Lesson 1's start; lesson 3's wiring diagram |
  | A one-line of one board | Design and verification 8 | Lesson 2 starts above it |
  | The DOL starter: seal-in, Stop, overload, no-volt | Motors 2 | Lesson 3, read off the drawing |
  | Sets on a board; synchronising; preferential trips | Generators and paralleling 5, 7 | Lesson 2's bus-tie |
  | 440 V to 115 V | Transformers and magnetism | Lesson 2's transformer |
  | Rectifier, inverter, charger | Electronics and power electronics | Lesson 2's converter symbols |
  | A battery as a DC source | Batteries | Lesson 2's DC board |
  | Joined boards share one monitor | Insulated systems 5 | One line in lesson 2 |
  | Pressure as force over area; the hydraulic jack | Heat and fluids 5; Mechanics and materials | Lessons 4 and 6, qualitative |
  | The air receiver; air compresses | Heat and fluids 3 | Lesson 6's pneumatic card |
  | The pump curve; throttling; positive displacement | Heat and fluids 8 | Lesson 7's pumps |
  | Solids, views on a grid, ratio as scale | Geometry fundamentals; The coordinate plane; Proportional reasoning | Lesson 8 |
  | Predict, then play, then explain | Scientific thinking | Every opening puzzle; lesson 9 |

- **Where it is used (each cited before a lesson uses it).** Public, general sources only. Nothing
  here says how the Navy or any boat does it.
  - **Any diagram (1):** ST0457's core symbols and documentation and its maritime "read, analyse and
    interpret" (notes 3.1); tag numbers that "match the line diagrams in the isolation documentation"
    (HSG253, notes 7); labels that cross-reference the circuit diagram (TRG 41, notes 7).
  - **Single-line (2):** "Correctly interpret a ship’s One Line diagram" (USCG A-III/6 assessment,
    notes 3.2); "ability to explain electrical distribution system with drawing/instructions" and a
    "switching plan to isolate a HV distribution fault" (MSN 1860, notes 3.2); "drawings, schematics
    and instructions for coupling and disconnecting switchboards" (NVIC 23-14, notes 3.2); "lock out
    tag out the breaker ... that feeds" the board (EECO, notes 7).
  - **Control schematics (3):** "shipboard electrical schematics, shipboard electronic controls
    diagrams, and shipboard controls logic diagrams" (NVIC 23-14, notes 3.2); "Types of diagrams used
    to represent circuits" (ST1426, notes 3.1); Fault-finding's starter bench (its brief).
  - **Fluid power (4 to 6):** STCW A-III/1's "piping, hydraulic and pneumatic diagrams" (notes 3.2);
    "Electro-hydraulic and electro-pneumatic control systems" (MSN 1860, notes 3.2); "fluid power
    equipment and systems used on board vessels" (ST0457, notes 3.1); a regulator that wants "All
    hydraulic and pneumatic symbols ... with ISO 1219-1" (TRG 41, notes 7); presses that hold the work
    piece (DOE, notes 4); releasing stored pressure before work (HSE, HSG253, notes 4).
  - **Piping (7):** the same STCW line (notes 3.2); ST0457's pipeworker "working from engineering
    drawings" on "fluid power and domestic pipe systems on ships and submarines" (notes 3.1); HSE's
    and HSG253's isolation (notes 4); the MAIB valve case and "a detailed plan and appropriate ‘tag
    out’ isolations" (MAIB 2/2019, SECONDARY, notes 7).
  - **Engineering drawings (8):** "Interpretation of machinery drawings and handbooks" (STCW A-III/1,
    notes 3.2); "Interpretation of ships technical drawing" (MSN 1860, notes 3.2); "explain how to use
    drawing scales" (City & Guilds, notes 3.1); assembly drawings to BS 8888 (BTEC Unit 44, notes 1.2);
    scrapped parts from misread drawings (Unit 16, notes 1.2).
  - **Any new diagram (9):** DOE's valve lineup (notes 4); reporting a drawing to a colleague (Unit
    16, notes 4); checking the drawing against the plant (HSG253, notes 7).
- **The mistakes to catch, each with a puzzle and its own hint.** The research on reading diagrams is
  mostly about school and university students reading circuit diagrams (notes 6). That you would slip
  the same way is UNCONFIRMED, but most of these are slips about what a drawing means, not about
  electricity, so they are likely on the unfamiliar kinds. Each is marked with how strong its source is.
  - **Lesson 1, the diagram read as a layout:** Marshall's "literal representations of the physical
    layout" and Corter's "planar distances" (research papers, notes 6.1). A DO screen: two parts drawn
    side by side; are they joined?
  - **Lesson 1, lined up means in series:** "All resistors lined up in series are in series whether
    there is a junction or not" (Engelhardt and Beichner, research paper, notes 6.1). A DO screen with
    three drawings of one circuit.
  - **Lesson 1, crossing lines joined:** "do not indicate an electrical connection unless they are
    marked with a small circle" (Marshall, notes 6.2). A crossing and a junction side by side.
  - **Lesson 1, a part left out because it "does nothing":** "shorting wires do not merit inclusion
    in a circuit diagram because they "don't really do anything"" (Fredette and Clement, via Herron,
    SECONDARY, notes 6.1). A DO screen: a link drawn on the diagram but missing from the picture.
  - **Lesson 1, the drawn state taken for the running state:** "A normally closed contact is drawn
    closed even if, in normal running, its coil is energized and the contact is open" (electrician.wiki,
    SECONDARY, notes 4). The state card.
  - **Lesson 1, reading order:** "diagrams tend to be scanned in reading order, in Western languages
    from left to right and top to bottom" (Corter, notes 6.1). A pneumatic sheet whose source is at
    the bottom.
  - **Lesson 2, isolating the breaker the drawing names:** "the circuit is still live" (Cobler,
    a vendor blog, SECONDARY, notes 7); "consult the one-line ... the correct upstream breaker" (EECO,
    notes 7). The two-way load.
  - **Lesson 2, the normally open bus-tie forgotten:** the notes' reading of Fredette and Clement
    (notes 6.1). A DO screen: section B is dead; close the tie; what is live now?
  - **Lesson 2, one line as one wire:** no source counts it, so it is a check, not a cited mistake: a
    DO screen asks how many conductors a 440 V three-phase line stands for (EECO, notes 2.2).
  - **Lesson 3, the coil looked for next to its contact:** "Many students find it confusing" (All
    About Circuits, an instructor's note, notes 6.3). A DO screen: tap the coil that moves this contact.
  - **Lesson 3, two coils taken for one device:** "Do not assume two similarly shaped coils belong to
    the same device" (Viox, a vendor chart, SECONDARY, notes 2.2). Two coils, -K1 and -K2, side by side.
  - **Lesson 3, the Stop drawn closed while running:** the shelf state (Galco, electrician.wiki,
    notes 4). A DO screen: the pump runs; which drawn contacts are now in a different state?
  - **Lesson 3, the US coil read as a lamp or a motor:** the coil "shown as a circle" in US ladder (All
    About Circuits, notes 2.2), where the IEC coil is a rectangle (see gaps). A check on the US switch.
  - **Lesson 4, the symbol read as the part's shape or port layout:** "Symbols do not indicate the
    location of ports" (NAVEDTRA, SECONDARY, notes 2.2); Bosch and Festo on construction (notes 2.2).
    The cutaway.
  - **Lesson 4, pump and motor swapped:** DOE's arrow rule (notes 2.2) and the ISO triangle (see
    gaps). No source counts the slip, so it is a check with its hint.
  - **Lesson 4, a turned symbol read as a new part:** "may be rotated or reversed without altering
    their meaning" (NAVEDTRA, notes 2.2). A DO screen: two filters at different angles.
  - **Lesson 4, not knowing the symbols:** "Many students struggled ... due to not knowing the correct
    circuit symbols" (Edexcel examiners, a younger level, notes 6.2). The matching drill.
  - **Lesson 5, ports and positions swapped in the label:** the rule is Hidraoil's (notes 2.2); no
    source counts the slip, so it is a check: type the label for a drawn valve.
  - **Lesson 5, detent, spring and proportional confused:** "the functions must not be confused when
    reading a diagram" (Hidraoil, a distributor, SECONDARY, notes 2.2). A DO screen: let go of the
    lever; where does the valve go?
  - **Lesson 5, the box read in the wrong place:** the notes' reading (notes 4, lesson 5). A DO screen:
    the solenoid is energised; which box now joins the ports?
  - **Lesson 5, a closed centre holds for ever:** "there will be some leakage between ports ...
    facilitating cylinder creep" (e4training, SECONDARY, notes 2.2). The creep on the picture.
  - **Lesson 6, the drawn position read as the working one:** "note the valve is shown in the
    de-energized position" (DOE, notes 4). The opener asks what the ram does before any button.
  - **Lesson 6, only the fed side followed:** the drained chamber, "aligned to drain back to the
    reservoir" (DOE, notes 2.2). A DO screen: trace the rod end's oil.
  - **Lesson 6, air returned to a tank:** Festo's exhaust (notes 2.2). A DO screen on the 5/2.
  - **Lesson 6, a stopped pump means no pressure:** HSE's and HSG253's stored energy (notes 4). The
    last card.
  - **Lesson 7, a globe valve taken for a gate valve, or the reverse:** "will often be depicted by the
    same valve symbol" (DOE, notes 6.3). A DO screen: where does the drawing say which it is?
  - **Lesson 7, the actuator assumed to open the valve:** "the symbols alone ... do not provide the
    reader with enough information" (DOE, notes 6.3). A DO screen with a diaphragm valve and no note.
  - **Lesson 7, a three-way valve's drawn position taken as normal:** "sometimes drawn in the position
    that they will fail to" (DOE, notes 6.3). A DO screen that checks the note on the sheet.
  - **Lesson 7, the drawing trusted over the plant:** the MAIB valve (an accident report, notes 7).
    The missing valve.
  - **Lesson 8, the 3D object not seen from the views:** ASEE (a conference paper, notes 6.4). Tap
    the solid that matches three views.
  - **Lesson 8, views put in the wrong place:** IJERT (a teaching study, notes 6.4). A DO screen: the
    symbol says first angle; where does the left side view go?
  - **Lesson 8, a hidden edge or a centre line read as a visible edge:** UW's precedence (notes 2.2).
    No source counts the slip, so it is a check.
  - **Lesson 8, a cut rib hatched:** LibreTexts' rule (notes 2.2), a check.
  - **Lesson 9, reading-order and one-path-only bias:** "a sequential bias and a reading order bias"
    (Corter, notes 6.1). What you missed is ringed.
  - **Lesson 9, the drawing not checked against the plant:** HSG253's named human failure (HSE
    guidance, notes 7). The last puzzle.
  - **Not stated as common:** no source counts these, so they are checks with hints, not cited
    mistakes. A bus-tie closed without a second source; a permissive drawn in parallel instead of in
    series; a pilot line traced as a working line; the scale applied the wrong way round; a tolerance
    read as one limit, not two.
- **Size and cost.** 9 lessons of about 12 screens on the agreed settings (CLAUDE.md); lesson 9 about 14.
  - Recent courses of the same kind measured about 9 to 11M tokens for eight lessons, about 1.1M to
    1.4M a lesson (Heat and fluids, Insulated systems, Batteries, Generators, docs/plans/maths-queue.md).
    These pictures are path tracers and toggles on drawn diagrams, lighter to animate than a phasor
    panel but with many tappable parts and a symbol check each. So about 1.0M to 1.3M a lesson.
  - That is about 9.0M to 11.7M for the course, plus about 0.3M for the plan and the research top-up
    (the gaps below). The research is done (232 quotes from 62 saved tool results).
  - The full process measured on Fractions lessons 4 to 8 was about 1.65M a lesson, about 14.9M for
    nine.
  - Each build's real cost is reported to you.
- **Lesson 1 first.** Lesson 1 is built and checked before the others (about 1.2M, plus the plan).
  Because you approved the build, the rest follow without waiting for you to try it.
- **Gaps to close at build time.** None blocks lesson 1. Each is quoted at the research top-up, or
  the screen says less.
  - **Symbol forms (lessons 2, 3, 4, 5, 7).** The notes quote what symbols do, not what they look
    like, and no standard was read (notes 2.1, 9). Each symbol is checked by eye against two makers'
    sheets (decisions). Words to quote where a sheet has them: the IEC coil as a rectangle, the
    circuit breaker, isolator and switch-disconnector, the converter box; ISO 1219's pump and motor
    triangles, working, pilot and drain lines, the accumulator, filter, cooler and gauge; ISO 10628-2's
    gate, globe, ball, butterfly, non-return, relief and three-way valves, strainer and heat exchanger,
    and its line types.
  - **Lesson 1:** the "find the source first" contrast rests on EECO's top-down one-line and Festo's
    bottom-to-top pneumatic diagram (notes 2.2); no source states the general rule, which is the
    notes' reading of Corter.
  - **Lesson 3:** the letter meanings of reference designations (K for a relay, Q for a switching
    device) and the auxiliary terminal numbers 13-14 and 21-22 are UNCONFIRMED (Deskely, ElectricalFlux,
    notes 2.2, 9); until quoted, the lesson uses -K1 and -Q1 as names only. The cross-reference table
    under an IEC coil is in no quote; Viox's "cross-reference information" (notes 2.2) is the nearest.
    The schematic against wiring against block diagram distinction rests on a forum answer not quoted
    (notes 4, lesson 3) and on your trade.
  - **Lesson 5:** "one box per position, read the box in line with the ports" is the notes' reading
    (notes 4, lesson 5); quote it from Festo or Bosch. Pneumatic port 1 as the supply is not in
    Festo's quoted line (notes 2.2). BTEC Unit 12's valve list is UNCONFIRMED (notes 1.2).
  - **Lesson 6:** the service unit has no quote (notes 4, lesson 6). Festo's line on a closed-centre
    pneumatic valve and compressibility is UNCONFIRMED (notes 4, 9); the lesson leans on Heat and
    fluids lesson 3's Boyle's law until it is quoted. The eight-part size of the press follows BTEC
    Unit 12's eight-component criterion, which is UNCONFIRMED (notes 1.2, 9); it is my choice either way.
  - **Lesson 7:** the instrument tag letters are UNCONFIRMED (DOE's table, seen but not held, notes
    4, 9); quote them from DOE or ISA, or show the bubble without reading its letters. The NTSB valve
    case reported by IIMS, a check valve fitted where the drawing said a stop valve, is UNCONFIRMED
    (notes 7) and is not used until quoted. A summary of HSG253 saying isolation drawings are not P&IDs is UNCONFIRMED
    (notes 2.2) and is not used.
    *Where these went (fix round after the review, 13 Nov):* the bubble is drawn without letters and called the
    temperature sensor. DOE's three honest limits are two DO screens, not three: screen 7 ("If the air fails") asks
    where TV1 goes when its air fails, so it teaches both that the actuator symbol does not say and that a three-way
    valve may be drawn in its fail position (Note 1 on the sheet). Screen 15 ("Gate or globe?") asks where the drawing
    says which a valve is. The letters that tell two like systems apart are in the explain (NAVEDTRA, research 26).
    The ISO 10628-2 valve set (gate, globe, ball, butterfly, relief, with the older forms) is not drawn: no maker's
    sheet is held to check its forms against. It waits for that check, then goes into lesson 9's new sheets.
  - **Lesson 8:** ISO 5456-2 and BS 8888 were not read (notes 2.1, 9). That first angle is the BS and
    ISO default in Britain and third angle the US habit is in no quote; the lesson says only that both
    are in use and the symbol tells you which, until it is cited. The ISO 128-3 line on methods E and A
    is UNCONFIRMED (notes 4). MIT says hidden lines are "dotted" (notes 2.2); BS 8888's dashed form
    needs its own source. The meanings of Unit 16's abbreviations, "A/F, CHAM, Ф, R, PCD, M" (notes
    1.2), are not quoted; quote them before a screen uses them. The example tolerance and scale figures
    are labelled.
  - **Lesson 9:** none; every rule it uses is quoted.
  - **Throughout:** IEEE/ANSI 315 is quoted as "Inactive-Reserved" (notes 2.1). ANSI Y32.10 as the US
    fluid power set, the withdrawn ISO 1219 editions, ISO 1219-3, the NEMA/JIC style beyond Galco's
    line, Bosch's contents list, and BTEC Unit 2's mandatory-core status are UNCONFIRMED (notes 2.1,
    2.2, 1.2, 9). Larkin and Simon's "largely useless" line is UNCONFIRMED (notes 6.5) and is not
    used. Parker, Eaton Vickers and NEETS were not retrieved (notes 9). That an insulated system is
    isolated at all poles is UNCONFIRMED here (notes 5); lesson 2 does not rely on it.
  - **Misconceptions:** the studies are of school and university students reading circuit diagrams
    (notes 6). No study of mistakes in reading fluid power, piping or single-line diagrams was found;
    those slips are the sources' own cautions and the notes' readings, each marked above.
  - **Nothing naval.** The US Navy and US Department of Energy texts are general training text only.
    No Navy drawing, qualification book or syllabus was used, and your SMQ books and system diagrams
    were not read (notes, preamble).
