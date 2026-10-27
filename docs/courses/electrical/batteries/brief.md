# Batteries: the course brief

Written 27 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
the second course in the Electrical shelf's Supply systems folder: "How a lead-acid cell works,
capacity and discharge rate, charging stages, specific gravity, gassing and hydrogen, and cell
faults." Insulated systems and earth faults is the folder's first course and is being built
alongside this one; it owns insulated DC systems and earth detection, so this course points at that
ground and stops. You chose this course on 27 Oct and approved the build, so I have taken the
decisions for you and listed them below. Change any you like. Sources and quotes are in
`research-notes.md` beside this file (343 quotes, cut by script from the 58 saved tool results and
checked with `tools/eval/sources.mjs`, `failed: 0`). Section numbers below point there.

## The short version
**Eight lessons**
1. The lead-acid cell: two plates and an acid (built first)
2. State of charge: two gauges, and when to trust them
3. Capacity and rate: what an ampere-hour is worth
4. Charging: the charger holds volts per cell
5. Gassing, hydrogen and the air that clears it
6. Strings: the weakest cell sets the pace
7. Ageing, faults and the trend that finds them
8. Short circuits, safety and other chemistries

**The main pictures** (one per lesson, each moved with your finger, each showing the cause):
- **The cell, plate by plate (lesson 1).** A cut-away cell: a lead dioxide plate, a lead plate and
  the acid between them. Drag the state of charge down. White lead sulphate grows on both plates,
  the acid's dots move into the plates and the liquid thins towards water. Electrons run round the
  outside wire; inside, only ions move. A plate-size slider grows the ampere-hours and leaves the
  voltmeter at about 2 V. A stepper puts 6, 12 or 24 cells in series.
- **Two gauges on one cell (lesson 2).** Lesson 1's cell with a hydrometer and a voltmeter on it.
  Drag the charge and the float rides higher in stronger acid. Then the traps: electrolyte
  temperature, rest time after a charge, electrolyte level and a "stratified" switch. Each moves a
  reading, and a "trust this reading?" light shows which check is still missing.
- **The cell behind its resistance (lesson 3).** The cell drawn as a fixed voltage behind a small
  resistance, with a load you drag. The lost volts appear across the resistance and the terminal
  reading falls. Run a discharge at that current and the ampere-hours it delivers land as a point
  on log-log axes, against a Peukert line through two rated capacities. A temperature slider raises
  the resistance and cuts the capacity.
- **The set-point pin (lesson 4).** A charger feeding a string, and a time scrubber through bulk,
  topping and float, with volts per cell and current traced. Drag the set point in volts per cell.
  Too low, and sulphate builds on the negative plate. Too high, and the positive grid corrodes and
  gas bubbles off. The cell count turns the per-cell figure into the charger's volts.
- **The battery room (lesson 5).** A battery on charge in a room. Drag the charging current up to
  the charger's fault current and the bubbles and the hydrogen readout climb, against bands at 0.4,
  1 and 4 per cent. Switch between a room people enter and a closed enclosure. The vent area
  0.3 × N × I × S is drawn to scale with air crossing it at 0.1 m/s. A switch makes the cells
  valve-regulated, and they hold their gas until charged too hard.
- **The string as tanks (lesson 6).** Six cells drawn as tanks in series, one smaller than the
  rest, with one current arrow through them all. Discharge it and the small tank empties first,
  then is driven into reverse in red. Charge it and the small one fills first and bubbles. A
  second card has two parallel strings, with cable resistances you drag and the current share
  computed.
- **The trend that finds the cell (lesson 7).** A string's impedance readings, quarter by quarter,
  as example data. Tap a cell to see its trend line against its own baseline and its distance from
  the string's mean. Drag the years on and one cell turns upward. Pick whose threshold to draw, then
  run a capacity test against the 80 per cent line. The flagged cell opens to show the fault its
  charging history made.
- **The milliohm fault (lesson 8).** A battery, its connectors and a cable, with a fault you drag
  from across the terminals to far down the cable. The current is V ÷ (R battery + R external),
  against a protective device's breaking capacity, and it barely falls as the battery runs down. A
  chemistry switch shows lead-acid, nickel-cadmium and lithium-ion side by side.

### Decisions taken for you (say if you want any changed)
- **Eight lessons, one per part of the scope, in your order.** The makers' manuals run in the same
  order: installation, ventilation, commissioning charge, float, equalise, specific gravity, records
  (GNB/Exide, EnerSys, Hoppecke, notes 2.2). The notes find one lesson's worth of support for each
  part (notes 8). Lesson 7 is the fullest. If you want nine, it splits into "what goes wrong" and
  "how to test and trend" (notes 8). If you want seven, lessons 1 and 2 could merge, at the cost of
  a rushed hydrometer.
- **Lesson 1 is built first, then the rest without a pause.** You approved the build, so the others
  follow without waiting. Try lesson 1 on your phone as soon as it lands; if something is wrong, the
  rest will be changed before they are built.
- **Steps lessons, with a little more explaining ("Partly", RUNBOOK section 0, item 3).** About 12
  screens each, SHOW then DO, ending on two or three mixed puzzles. SHOW screens may carry a short
  paragraph, at most about 90 words (your 21 Oct note on Motors lesson 1). Every lesson has one
  picture you move, and it asks you to predict before you play (section 3).
- **Large lead-acid batteries, general stationary and marine.** Ship's emergency and transitional
  batteries, UPS banks, engine starting, communication back-up and industrial standby carry the
  examples (notes 3.2, 7). Nothing about any submarine's battery, its layout, its operation or how
  the Royal Navy or any boat runs one. The course does not mention the main battery of CLAUDE.md's
  outline at all; the principles are the same for any large lead-acid battery. Nothing from your
  SMQ books was read or used (notes, header).
- **A recall opener only where an earlier course carries the lesson:** lesson 2 (Heat and fluids
  lesson 5, why a float rides higher in denser liquid), lesson 3 (Exponentials lesson 7, the
  gradient of a log-log line), lesson 4 (Electronics lesson 5, 12 cells at 2.25 V float at 27 V),
  lesson 5 (Heat and fluids lesson 6, flow = area × speed), lesson 7 (Statistics lesson 4, drift or
  noise) and lesson 8 (Design and verification lesson 7, breaking capacity). A right answer says
  "Still there" and carries on.
- **The charger is a box here.** Electronics lesson 5 built the thyristor charger, its constant
  current then constant voltage, the 2.25 V float and the 4.1 to 72 per cent hydrogen range.
  Electronics lesson 3 taught why ripple heats a battery. None of that is taught again. This course
  stays on the cell side: why each stage's voltage is what it is, and what it does to the plates.
- **The 2.25 V float is now confirmed.** Electronics used it as a SECONDARY figure (its notes 4.5).
  Battery University gives "2.25V to 2.27V/cell" and EnerSys "2.23 V/cell ... at 20°C" for its
  vented range (notes 4.4, 2.2). Lesson 4 says so in one line and uses the maker's figure.
- **No chemical formulae on screen.** The MCA asks you to describe charge and discharge "without
  using chemical formulae" (notes 3.2). The lessons name lead, lead dioxide, sulphuric acid, lead
  sulphate and water, and draw them. Lesson 1 shows the 2 V as the gap between two plate potentials,
  two numbers on a ladder, with no half-equations.
- **Two flammable ranges, one working figure.** HSE gives hydrogen as flammable "from 4% ... to
  75%" (notes 2.4); CCOHS, which Electronics used, gives "4.1% to 72%" (notes 4.5). Lesson 5 shows
  both and says the sources differ a little. The lower limit near 4 per cent is the one ventilation
  is designed from.
- **Ventilation is sized by HSE's method, and the standard is named, not reproduced.** HSE's
  "0.3 x N x I x S" (notes 2.4) is the worked method, with HSE's own example and one changed case.
  Hoppecke's A ≥ 28 × Q is the cross-check through area × speed (notes 4.5). BS EN IEC 62485-2 is
  named as the standard behind both (notes 2.3). Its gas-emission tables came back garbled and are
  not used (notes 2.2).
- **Peukert is a fit, not a law.** You find the exponent yourself from two ratings by logs, then see
  where a fixed exponent goes wrong (Victron, Sulzer et al., notes 4.3, 6.4). The 1.1 to 1.3 range
  for lead-acid is SECONDARY (Wikipedia, notes 4.3) and no stationary maker's exponent was found
  (UNCONFIRMED, notes 9), so every exponent on screen is computed or labelled as an example.
- **No single impedance threshold.** The sources disagree: about 20 per cent for flooded cells
  (Megger), 30 to 50 per cent (Vertiv), 50 per cent of the initial value (NRC), 150 per cent of
  nominal (EPRI) (notes 4.7). Lesson 7 teaches the habit (baseline, trend, then a capacity test)
  and says the line is the maker's or the plant's. The 80 per cent capacity replacement line is
  common to IEEE 450 and IEEE 1188 (via Megger, notes 4.7), so that one is taught as a rule.
- **Makers' numbers win, and the reference temperature is stated once.** EnerSys and Hoppecke work
  at 20 °C, GNB and Battery University at 25 °C (notes 4.2, 4.4). Each screen says which maker a
  figure is from and uses its reference. Temperature compensation is taught the same way: Battery
  University's −3 mV per °C per cell about 25 °C, and EnerSys's correction only outside 10 to 30 °C
  (notes 4.4, 2.2). The rule is "follow the maker".
- **Earth faults get one line, then go to the sibling course.** IEEE 450's inspection list includes
  "unintentional battery grounds" (via Megger, notes 2.3), and MIN 654 puts earth faults beside the
  battery lines (notes 3.2). Lesson 8 names them and says finding one is Insulated systems and earth
  faults.
- **BS 7671 Chapter 57 is named, not taught.** Amendment 4 (15 Apr 2026) added a chapter on
  stationary secondary batteries, after your 18th Edition course (notes 3.5). It treats a stationary
  battery as "a generating set and not a load" and excludes central battery systems (notes 3.5).
  Lesson 8 names it in one line, because it is installation design, not how a cell works.
- **Nickel-cadmium and lithium-ion in outline only** (notes 4.8). Cell voltage, electrolyte, what
  tells the state of charge, and the main hazard, as the MCA's seven-point comparison asks (notes
  3.2). No charger, no battery management system, no lithium-ion design.
- **Gel and AGM get a screen each, not a lesson.** Lesson 5 shows how a valve-regulated cell
  recombines its gas, and lesson 7 shows its dry-out (notes 4.5, 4.7, 8).
- **Battery sizing to a load profile is left out.** No public source for the IEEE 485 or IEC
  60896-22 method was found (UNCONFIRMED, notes 9). Lesson 3 does the runtime arithmetic that sizing
  rests on, and says sizing itself is a separate method.
- **"Misconception" is not said to you.** McDermott warns the word may "trivialize the problem"
  (notes 6.1). In the lessons a mistake is "a common slip" or simply a check, and its fix is the
  model (the cell as a fixed voltage behind a small resistance), not a rule to remember.
- **Numbers are cited, computed on screen, or labelled as examples.** Every cell count, current and
  resistance not taken from a source says "example". Cell counts for a charger use whole cells at the
  cited volts per cell.
- **Colour as before.** Ink for cells, circuits and controls; a conducting path is bold ink. Amber
  for key terms, teal for small labels (V, I, r, Ah, °C, "per cell"). Red only for warnings and
  mistakes: reversal, overcharge, the 4 per cent line, the fault current, acid. Green only for
  finished. The plates use the substances' own greys, browns and whites, muted, never as meaning.
- **Your intake answers** (`intake.json`): to understand batteries and how to work with them; on the
  job and in everyday life; hands-on, with the why explained in full.

## 1. The overall topic
A lead-acid cell is two plates in sulphuric acid: lead dioxide on the positive, lead on the
negative. Each plate has its own fixed electrical potential, set by its chemistry, and the gap
between them is about 2 V whatever the cell's size. Discharging, both plates turn to lead sulphate
and the acid is used up, leaving water. That is why the acid's strength, read as specific gravity,
and the rested voltage both track the state of charge. A big plate holds more ampere-hours, but how
many you get depends on how fast you take them and how cold the cell is. Inside, the cell has a
small resistance, so its terminal voltage falls under load. Charging pushes the reactions back with
a voltage held per cell: a constant current first, then a constant voltage, then a float that only
makes up self-discharge. The set point is a narrow band. Too low and sulphate hardens on the plates;
too high and the positive grid corrodes. Near full charge, current the plates no longer take splits
water into hydrogen and oxygen, so the room is ventilated from the charging current. Cells in series
share one current, so the weakest cell sets the string's capacity and is the first to be overdriven.
Cells age by sulphation, stratification, grid corrosion and, in sealed cells, dry-out. Voltage,
specific gravity, impedance trends and a capacity test find them. Last, safety: a battery's
milliohm resistance lets it drive thousands of amps into a short, and its cells cannot be switched
off. Then nickel-cadmium and lithium-ion in outline.

**It builds on:**
- **Your trade:** Ohm's law and power, series and parallel, DC circuits, safe isolation and PPE,
  prospective fault current and breaking capacity (Design and verification lesson 7), BS 7671 to the
  18th Edition.
- **Electronics and power electronics:** the charger, CCCV, float at 2.25 V a cell and hydrogen's
  range (lesson 5); ripple heating a battery (lesson 3); the UPS with a battery on its DC link
  (lesson 7).
- **Heat and fluids:** density and floating (lesson 5); flow = area × speed (lesson 6); gases as
  volumes (lesson 3).
- **Exponentials and logarithms:** solving a power with logs (lesson 6); curved laws as straight
  lines on log-log axes, gradient n (lesson 7).
- **Statistics for engineers:** how far to trust a reading (lesson 2); the z-score (lesson 3); drift
  or noise, the fitted slope (lesson 4).
- **AC circuits:** impedance as resistance and reactance together (lesson 6). **HV Subsea Cable
  Testing:** the four-wire measurement (lesson 2). **Percentages and Proportional reasoning:** C-rates,
  per cent of capacity, points of specific gravity.

**Not taught again:** the charger's circuit and its stages as electronics; Ohm's law; series and
parallel rules; logarithms and log-log graphs; trend lines, means and z-scores; density, buoyancy
and volume flow; prospective fault current and device selection; impedance. Each is used with a
one-line reminder, and only what is new is taught.

**Taught inline, because you have not met them** (notes 5): what happens at each plate, in words and
pictures; the plate-potential gap; specific gravity, points and the hydrometer's temperature sign;
ampere-hours and the C-rate; an emf behind an internal resistance; why the set point is volts per
cell; the gassing voltage and a dilution factor; the four-wire impedance test on a cell.

**Edges.** In: vented (flooded) and valve-regulated lead-acid cells and blocks in stationary and
marine service; state of charge; capacity, rate and temperature; charging stages; gassing,
hydrogen and ventilation; strings; ageing, faults, tests and trending; short-circuit current, acid
and safe working on DC; nickel-cadmium, nickel-iron and lithium-ion in outline. Out: insulated DC
systems and earth fault detection (Insulated systems and earth faults); the charger's electronics
(Electronics, built); battery sizing to a duty cycle; BS 7671 Chapter 57's regulations; battery
management systems and lithium-ion design; any submarine battery.

## 2. The lessons, in the order they build
The order is the scope's and the makers' (notes 2.2, 8): the cell, reading it, what it gives, how it
is charged, what charging gives off, cells together, how they age, and safety. Battery University
runs the same way, how it works, then series and parallel, C-rate and charging, then ageing and
testing (notes 1.2).

| # | Lesson | What it teaches |
|---|---|---|
| 1 | The lead-acid cell: two plates and an acid | A secondary cell's reaction "can be run in the reverse direction" (Physics Classroom, notes 6.1); the MCA asks the difference from a primary cell (notes 3.2). The parts, as the MCA asks you to "Draws and labels" them (notes 3.2): a positive plate of lead dioxide, a negative plate of lead, sulphuric acid between, the container and terminals. Discharge: at the negative plate "lead metal reacts with sulfuric acid to form lead sulfate ..., liberating electrons"; at the positive "lead oxide reacts with sulfuric acid, again forming lead sulfate" (OSTI, notes 4.1). So "both electrodes become lead sulfate ..., and sulfuric acid is highly consumed, leaving behind water" (ScienceDirect, SECONDARY, notes 4.1): the acid is a reactant, not a bath, and its strength "during discharge it falls" (RSC, notes 4.1). The current: electrons round the outside wire, ions in the acid; electrons do not "flow through the solution" (RSC, notes 6.2). Why about 2 V: each plate has a fixed potential, +1.685 V and −0.356 V (a lab reference table, SECONDARY, notes 4.1), and the gap is 2.04 V (computed), the "2.042 V at 298 K" of ScienceDirect (SECONDARY, notes 4.1). Size does not change it: a bigger plate gives more ampere-hours, not more volts (the notes' reading, notes 4.1). "The nominal voltage of lead acid is 2 volts per cell, however ... the OCV of a charged and rested battery should be 2.1V/cell" (Battery University BU-303, notes 4.1); loaded at full discharge a cell reads about "1.8 V" (Wikipedia, SECONDARY, notes 4.1). Charging: "an external voltage in excess of 2.04 V per cell" reverses the reactions (LibreTexts, SECONDARY, notes 4.1), and the acid strengthens again (RSC, notes 4.1). In series, "six cells are connected in series to produce a 12-V car battery" (OpenStax, notes 2.1); 12 cells make 24 V and 24 make 48 V (computed). A cell holds energy, and a flat one is "out of energy" (Physics Classroom, notes 6.1). |
| 2 | State of charge: two gauges, and when to trust them | Recall: why a float rides higher in seawater (Heat and fluids lesson 5). Specific gravity "is a measure of the weight of acid in the electrolyte as compared to an equal volume of water" (GNB, notes 4.2). It "decreases as the cell discharges and increases as the cell is charged" (GNB, notes 4.2), because on discharge the acid "binds to the plate, forming lead sulfate" (BU-903, notes 4.2): lesson 1's cell, read from outside. Full-charge values differ by use: "traction ... 1.280; starter ... 1.265; and stationary batteries have a low specific gravity of 1.225" (BU-903, notes 4.2). One point is 0.001 (GNB, notes 4.2). Temperature: "The colder the temperature drops, the higher (more dense) the SG value becomes" (BU-903, notes 4.2), so warm acid reads low and is corrected up. EnerSys: "–0.0007 per °C" about 20 °C (notes 2.2); 1.230 read at 35 °C is 1.240 at 20 °C (computed). GNB: one point "for each 3°F (1.67°C) ... above 77°F (25°C)", with its worked "1.213 sp. gr 68°F (20°C) -.003 points= 1.210" (notes 4.2). Level: evaporation makes "the SG reading rises", and overfilling "lowers the number" (BU-903, notes 4.2). Top up with water: "Never add acid" (BU-804c, notes 6.4). The voltmeter: "A cell voltage of 2.10V at room temperature reveals a charge of about 90 percent" (BU-403, notes 4.2), but only rested, "at least four hours; battery manufacturers recommend 24 hours for lead acid" (BU-903). Surface charge shows "an elevated voltage immediately after charge" (BU-903) and is "not a battery defect" (BU-804c, notes 6.4). "A cool battery lowers the voltage slightly" (BU-403, notes 4.2). After a recharge the specific gravity "lags behind the ampere hour input" (GNB, notes 4.2). Stratification fools the voltmeter: high acid at the bottom "artificially raises the open circuit voltage" (BU-804c, notes 4.2). So each reading gets four checks: rested, corrected, level right, mixed (the notes' reading, notes 4.2). Last, "Voltage alone cannot estimate battery state-of-health" (Battery University, notes 4.2): charge is not health, which is lesson 7. |
| 3 | Capacity and rate: what an ampere-hour is worth | Recall: the gradient of log y against log x (Exponentials lesson 7). Capacity "is measured in ampere hours at a given rate" (MCA, notes 3.2). The C-rate: "1C, meaning that a fully charged battery rated at 1Ah should provide 1A for one hour", and "0.5C ... for two hours" (BU-402, notes 4.3). Lead acid is "rated at a 5-hour (0.2C) and 20-hour (0.05C) discharge rate" (BU-201, notes 4.3); stationary makers also use the 10-hour rate, EnerSys's I10 (notes 4.4). Faster gives less: "a higher C rate will produce a lower capacity reading" (BU-402); a 100 Ah battery at C20 "may only give C2 = 56Ah" (Victron, notes 4.3). Peukert: an ideal battery has "a Peukert exponent of 1.00", a monitor's default is "1.25", and "you will need two rated battery capacities" to find it (Victron, notes 4.3). Its line is straight on log-log axes: "By Peukert’s Law, one would expect the graph to be linear on this log-log axis" (Sulzer et al., notes 4.3). From Victron's two ratings, 5 A for 20 h and 28 A for 2 h, n = log 10 ÷ log 5.6 = 1.34 (computed, Exponentials lesson 6). At 25 A that predicts 58 Ah; the default 1.25 predicts 67 Ah (computed). A fit, not a law: "no more than a rough approximation", and "In case of very high currents, the battery will give even less capacity" (Victron, notes 4.3); the measured curve "deviates substantially" (Sulzer et al., notes 4.3, 6.4). Cold: "Lower temperatures reduce the available capacity" (EnerSys), whose 200 Ah at 20 °C gives "182 Ah when discharged at 10°C" (notes 2.2); a battery giving 100 per cent at 27 °C "will typically deliver only 50 percent at –18°C", because cold "increases the internal resistance" (BU-502, notes 4.3). Where empty is depends on the rate: "1.60 V/c" for 5 to 59 minutes up to "1.80 V/c" for 8 to 24 hours (EnerSys, notes 4.3). Under load, the cell is an emf behind a small resistance: "ε = I(R + r) = V + Ir" (a revision site, SECONDARY, notes 4.3), and r is measured as "voltage difference divided by current" (BU-902, notes 4.3). Example: an EnerSys 12 V 70 Ah block at 6.95 mΩ (data row, notes 4.8) loaded at 100 A loses 0.70 V, so 12.6 V reads 11.9 V (computed; 12.6 V from lesson 1's 2.1 V a cell). With nothing connected the emf is still there, read as the open-circuit voltage (the Edexcel report's slip, notes 6.3). A ship's emergency battery must hold "within 12% above or below its nominal voltage" through its discharge (SOLAS, notes 3.2): a 24 V battery of 12 cells must stay above 21.1 V, 1.76 V a cell (computed). Capacity "governs the runtime"; internal resistance is "responsible for the power ... to ... deliver high current" (BU-905, notes 4.3). |
| 4 | Charging: the charger holds volts per cell | Recall: what does a 12-cell bank float at? (Electronics lesson 5, 27 V). "The lead acid battery uses the constant current constant voltage (CCCV) charge method", in "three stages ... [1] constant-current charge, [2] topping charge and [3] float charge": the bulk, then saturation, then the float that "compensates for the loss caused by self-discharge" (BU-403, notes 4.4). The charger is set per cell: "The charger voltage amounts to Uflo per cell x no. of cells" (EnerSys, notes 2.2), so 2.23 V × 55 cells is 122.65 V (computed, example cell count). Float is "2.25V to 2.27V/cell", and "Large stationary batteries at 25°C ... typically float at 2.25V/cell" (BU-403); EnerSys vented cells float at "2.23 V/cell ... at 20°C" (notes 2.2). Each figure sits above lesson 1's 2.1 V by what it takes to push current in (the notes' reading, notes 4.4). Why voltage and not current: in a string "all cells receive the same charge current" (BU-403, notes 4.4), and the cell needs its voltage held in a narrow band, "2.30V to 2.45V per cell", "dancing on the head of a pin": too low leaves "sulfation on the negative plate", too long high "causes grid corrosion on the positive plate" (BU-403, notes 4.4). Full is when "the current decreases to 3–5 percent of the Ah rating" (BU-403), or when for 2 hours "the cell voltages do not continue to increase and the charging current does not continue to decrease" (EnerSys, notes 4.4). Boost: "2.33 – 2.40 V/cell with a current limited to 4 x I10", and it "must be switched to float charging when the fully charged state is reached" (EnerSys, notes 2.2). Equalise: "a deliberate overcharge" at "2.50V/cell" (BU-404, notes 4.4), needed "After a deep discharge or after inadequate recharging" (EnerSys, notes 2.2) or when "non-uniformity in voltage or specific gravity" has developed between cells (GNB, notes 4.4), and when the pilot cell's corrected specific gravity is "more than 10 points below its full charge value" (GNB, notes 4.4). One vented range asks for it "once every six months at least" (GS Yuasa, notes 2.2). It ends when specific gravity and voltages "have not risen for a period of 2 hours" (EnerSys, notes 2.2). Sealed cells "are less tolerant to overcharge than the flooded type" (BU-403, notes 6.5). Temperature: "–3mV/°C" per cell about 25 °C (BU-403, notes 4.4), so at 35 °C a 2.25 V float becomes 2.22 V (computed); EnerSys corrects only outside 10 to 30 °C (notes 2.2). Follow the maker. Efficiency, as the MCA asks (notes 3.2): "Recharge 1.2 times the discharged capacity" (EnerSys, notes 4.4), so about 83 per cent of the ampere-hours come back (computed); watt-hours come back less, because the charge goes in at a higher voltage than it comes out (computed, example voltages). A large stationary charge takes "up to 36–48 hours" (BU-403, notes 4.4). Ripple is limited to "5 percent" (BU-403, notes 4.4); why it heats is Electronics lesson 3. Last screen: the simple charging circuit from a DC supply the MCA asks you to draw (notes 3.2). |
| 5 | Gassing, hydrogen and the air that clears it | Recall: air at 2 m/s through a 0.5 m² opening (Heat and fluids lesson 6, flow = area × speed). Whatever the charge, "hydrogen and oxygen gases are produced", from "electrolysis of the water portion" of the electrolyte "by the charging current" (GNB, notes 2.2, 4.5). "Hydrogen appears on negative plate and oxygen on positive plate" (BU-403, notes 4.5). They come "more quickly as the battery gets close to being fully charged", and after full charge "a lot of gas" (HSE, notes 2.4). Above "the gassing voltage of 2.40 V/c a current limit of 2.5 to 5 A/100 Ah is recommended" (EnerSys, notes 4.5). So the gas follows the current the plates no longer take (the notes' reading, notes 4.5), and the water it splits is why vented cells are topped up. The mixture of "two parts hydrogen to one part oxygen ... is perfect for an explosion" (HSE, notes 2.4). Flammable "from 4% hydrogen (lower explosion limit – LEL) to 75%" (HSE, notes 2.4); CCOHS gives "4.1% to 72%" (notes 4.5). Design limits: "0.4% vol/vol (10% of the LEL)" where people enter and "1% vol/vol (25% of the LEL)" in an enclosure (HSE, notes 2.4); GNB keeps the room under "a 1% concentration" (notes 4.5); a US regulator says "well below 2 percent" (NRC, notes 4.5), for contrast. The opening: "Minimum area of inlet/outlet needed = 0.3 x N x I x S cm2", S "10 for workrooms, 4 for enclosures" (HSE, notes 2.4), with air through it "at least 0.1 m/s" (HSE, notes 4.5). HSE's own worked case, 24 cells, 20 A, a workshop, gives 1440 cm² (notes 2.4); in an enclosure it is 576 cm² (computed). I is "the maximum current likely to be supplied by the charger during malfunction" (HSE, notes 2.4), not the float current. Cross-check by flow: Hoppecke's "𝐴 ≥ 28 × 𝑄" at 0.1 m/s (notes 4.5) is area = flow ÷ speed, 1 m³/h ÷ 3600 ÷ 0.1 m/s = 27.8 cm² (the notes' check, notes 4.5); 1440 cm² at 0.1 m/s carries about 52 m³/h (computed). The standard behind both, BS EN IEC 62485-2, "Supersedes EN 50272-2:2001", the one HSE names (notes 2.3). Exhaust goes "into the outside atmosphere and should not be allowed to recirculate" (GNB, notes 4.5); fans need an alarm for "failure of mechanical ventilation" (HSE, notes 4.5). Valve-regulated cells: gas "is converted back into water" (HSE), at "0.14 bar" (BU-201, notes 4.5), so they are "much less likely to release hydrogen", but pressure "may build up inside the battery if it is charged too quickly or for too long" (HSE, notes 4.5, 6.5); one flag state does not accept them "as gas free batteries" (NeRF, SECONDARY, notes 4.8). Where hydrogen gathers is contested: a full-scale test found it "uniform in the entire room" (Brzezińska, notes 4.5); a safety site says "near the ceiling" (SECONDARY, notes 4.5). Leave the battery "for at least 20 minutes after charging" (HSE, notes 2.4); moving a vented battery releases gas trapped inside it (HSE, notes 4.5). The gas carries "a fine mist of sulphuric acid" (HSE, notes 4.5). |
| 6 | Strings: the weakest cell sets the pace | One current runs through every cell in series, so the string is empty when its first cell is. "The weak cell holds less capacity and is discharged more quickly", and "a high load can push the weak cell into reverse polarity" (BU-803a, notes 4.6), until it develops "a permanent electrical short" (BU-502, notes 4.6). Example: five 100 Ah cells and one 80 Ah cell at 10 A last 8 hours and give 80 Ah, not 100 (computed). On charge, "the weak cell reaches full charge first, and then goes into heat-generating overcharge, while the strong brothers still accept charge" (BU-803a), and "A float current that is too high for the faded cell might sulfate the strong neighbor" (BU-403, notes 4.6). "Cell mismatch is a common cause of failure in industrial batteries" (BU-803a, notes 4.6). In series the internal resistances "are additive" (LibreTexts, SECONDARY, notes 4.6): two of lesson 3's 6.95 mΩ blocks make 13.9 mΩ (computed). In parallel the ampere-hours add and the voltage stays; the current shares by resistance, so makers say "use batteries of the same capacity, design and age only with a maximum of 4 parallel strings. The resistance of the cables in each string must be the same" (EnerSys, notes 4.6). Example: two strings of 10 mΩ on cables of 2 and 6 mΩ share 100 A as 57 A and 43 A (computed, example values). On float, cells may differ "–0.05 to +0.10 V/c" while "the total voltage of the battery shall be within the limits" (EnerSys, notes 2.2): a good total can hide a bad cell. Equalise when cells differ by more than "+/– 0.10V" or "10 points" of specific gravity; at "40 points ... the cell is considered defective" (BU-803a, notes 4.6). A charge can hide a bad cell: "the flaw will likely resurface again after a few hours" (BU-803a, notes 6.4). Two cells in series give twice the voltage over the same time, not "more energy" from nowhere, and each cell's own ampere-hours are unchanged (Englehardt and Beichner, notes 4.6). The MCA's target skill, problems "in series and in parallel combinations including internal resistance and current in a connected load" (notes 3.2), is the lesson's mixed set. |
| 7 | Ageing, faults and the trend that finds them | Recall: drift or noise? (Statistics lesson 4). What wears out. Sulphation "occurs when a lead acid battery is deprived of a full charge"; with "prolonged charge deprivation" the soft sulphate "converts to a stable crystalline and deposits on the negative plates"; it comes as "reversible (or soft sulfation), and permanent (or hard sulfation)" (BU-804b, notes 4.7). Stratification: the acid "concentrates at the bottom, starving the upper half", when the battery "dwells at low charge (below 80 percent), never receives a full charge and has shallow discharges"; an equalising charge mixes it "through electrolysis" (BU-804c, notes 4.7). Grid corrosion, "a “softening and shedding” of the lead off the plates", is fed by "prolonged overcharge" (BU-804a, notes 4.7); "While sulfation can be reversed if serviced in time, corrosion is permanent" (BU-201, notes 4.7). Valve-regulated dry-out: "Excess charging causes gassing, venting and subsequent water depletion and dry-out" (BU-201, notes 4.7). Heat: "every 8°C (15°F) rise above this temperature threshold cuts battery life in half" (BU-201, notes 4.7). So lesson 4's pin again: under-charge sulphates and stratifies, over-charge corrodes and dries. In one study, "plate/grid-related breakdown" was "39 percent" of failures and shorts "18 percent" (BCI via Battery University, notes 4.7). The tests. Voltage and specific gravity are cheap and frequent: EnerSys checks pilot cells "Every 6 months" and every cell "Once a year", and says "Keep a logbook" (notes 2.2). Impedance is "a true four-wire, Kelvin-type measurement" (Megger, notes 4.7), HV Subsea lesson 2's method; it "measures both the DC resistance ... and the reactance" (Megger, notes 4.7), AC circuits lesson 6's impedance. A capacity test "is the only way to get an accurate value on the actual capacity" (Megger), done "when the battery is new as part of the acceptance test" (Megger, notes 4.7); "Both IEEE 450 and IEEE 1188 recommend replacing the battery if its capacity is below 80%" (via Megger, notes 4.7). One reading misleads: resistance testers do "not much better than 5 correct in 10" (BU-905, notes 6.4), and "Voltage and internal resistance do not correlate with capacity" (Battery University, notes 4.7). So trend: "Trending of battery data, especially impedance and capacity, is an excellent tool" (Megger), and in Megger's example "The first ten or eleven measurements seemed to be fine and then a steady upward trend is very noticeable" (notes 4.7). Fit the cell's slope (Statistics lesson 4) and measure its distance from the string in SDs (Statistics lesson 3). How big a rise matters is the maker's: "a 20 percent increase in impedance for flooded lead-acid generally correlates to 80% battery capacity" (Megger); "30%-50% ... from baseline" (Vertiv); ">50% from the initial value" (NRC); "150 percent of the nominal" and dead at "300 percent" (EPRI, notes 4.7). Example: a cell with a 0.50 mΩ baseline reading 0.60 mΩ has risen 20 per cent (computed, example values). There is "no simple method" to measure sulphation, and "blindly inducing an overcharge can harm the battery by promoting grid corrosion" (BU-804b, notes 4.7, 6.5). |
| 8 | Short circuits, safety and other chemistries | Recall: what must a device's breaking capacity exceed? (Design and verification lesson 7). "A “shorted” lead acid battery has the capability of delivering an extremely high current, 100 to 1000 times the typical discharge current" (Vertiv, notes 4.8). It is Ohm's law: "dividing its open circuit voltage by its internal resistance" (Vertiv, notes 4.8). The EnerSys 12 V 70 Ah block lists 6.95 mΩ and 1814 A (data row, notes 4.8): 12.6 ÷ 0.00695 = 1813 A (computed). The connectors and cables count: "480V / (0.160 + 0.028)" predicted 2550 A against "2530 amps" measured (Vertiv, notes 4.8), and the limit is "internal resistance including the intercell connectors" (NRC/BNL, notes 4.8). It arrives in "5 to 10 milliseconds" (Vertiv), because "Batteries contain little inductance ... a shorted battery is similar to a fault through a resistor" (NRC/BNL, notes 4.8). It stays high as the battery runs down: "currents exceeded 90% of nominal even at ~60% state of charge" (Vertiv, notes 4.8). Large batteries "can discharge up to 40,000 A for several seconds" (NRC/BNL citing a guide, notes 4.8). The DC total is "the sum of that delivered by the battery, the charger, and motors" (NRC/BNL, notes 4.8), and these values "are required to properly size and select the proper circuit protection device" (Vertiv, notes 4.8). The cells are always live: "Exposed metal parts of the battery always carry a voltage and are electrically live" (EnerSys, notes 4.8). So: "Don’t rest metal objects (eg tools) on top of a battery", and "switch off all electrical circuits before connecting or disconnecting batteries" (HSE SR18, notes 4.8); safe isolation of "equipment and associated system" before work (MSN 1860, notes 4.8); arc flash is named on the syllabus (MIN 654, notes 3.2). Acid: "very corrosive chemicals can permanently damage the eyes" (HSE, notes 2.4); "Wash all acid splash in eyes or on skin with plenty of clean water and seek immediate medical assistance" (EnerSys, notes 4.8). The other electrolyte is potassium hydroxide (HSE, notes 4.8). One line each, then gone: earth faults on the battery, "unintentional battery grounds" on IEEE 450's list (via Megger, notes 2.3), are Insulated systems and earth faults; BS 7671's new Chapter 57 (notes 3.5) is installation design. Other chemistries, as the MCA's comparison asks (notes 3.2). Nickel-cadmium: "Low cell voltage of 1.20V requires many cells" (BU-203), "one of the most rugged and forgiving batteries" (BU-203), used "where long service life, high discharge current and extreme temperatures are required" (BU-107, notes 4.8). Its potassium hydroxide "isn’t used in the chemical reaction" (Megger, notes 4.8), so specific gravity tells you nothing about charge. Nickel-iron "can last for more than 20 years in standby applications" (BU-203, notes 4.8). Lithium-ion: "The nominal cell voltage of 3.60V" (BU-204), "a nearly constant voltage as they discharge" (OpenStax, notes 2.1), safe "provided the voltage and currents limits are being respected" (BU-204), with a protection circuit so cells "do not exceed 4.25V/cell" (BU-803a, notes 4.8); "thermal runaway and off-gas generation" are its concerns on boats (Odyssey, SECONDARY, notes 4.8). For 24 V: 12 lead-acid cells, 20 nickel-cadmium, about 7 lithium-ion (computed). The last screens are a mixed set from the whole course. |

## 3. Can it be taught mostly visually, through interaction?
**Partly** (RUNBOOK section 0, item 3). Every lesson is a steps lesson of about 12 screens, SHOW then
DO, ending on two or three mixed puzzles. SHOW screens can carry a short paragraph where the idea
needs words, at most about 90 words: why the acid is used up, why a warm hydrometer reads low, why a
fast discharge gives less, why the set point is a narrow band. Each lesson has one main picture you
move with your finger, chosen because it shows the cause, not just the answer. The research supports
three choices for all eight. Predict before you play: a predict-observe-explain strategy aimed at
"conceptual change" in circuits (POE-A study, notes 6.1). Give a model, not facts: McDermott names
the basic difficulty as "lack of a conceptual model for an electric circuit" (notes 6.1), so every
lesson returns to one model, the cell as a fixed voltage behind a small resistance (notes 6.5).
Join what you see, what happens inside and the number: "Explicitly link these to the symbolic
domain", and use animations for the inside (RSC, notes 6.2). Every step has a `still` or `read` for
the read-through and your Book.

- **Lesson 1, the cell, plate by plate.** A cut-away cell: the positive plate in lead dioxide brown,
  the negative in lead grey, the acid drawn as dots among water. A state-of-charge slider runs from
  full to flat. As it falls, white lead sulphate spreads over both plates, acid dots leave the
  liquid for the plates, and a strength gauge on the liquid drops towards water. A load switch closes
  the outside wire: electron dots run round the wire, ion dots drift in the acid, and no electron
  ever crosses the liquid. A charge switch puts a supply above 2.04 V across it and runs everything
  back. Beside it, a ladder of the two plate potentials, +1.685 V and −0.356 V, with the 2.04 V gap
  drawn (SECONDARY figures, labelled). A plate-size slider grows an ampere-hour bar and leaves the
  voltmeter where it was. A series stepper shows 1, 6, 12 or 24 cells and their voltage. *Why:* the
  research's named slips are electrons flowing "through the solution" and ions that "carry them to
  the other" (RSC, notes 6.2); watching only ions in the acid answers both. RSC's tip is to link
  the visible, the inside and the symbol with animations (notes 6.2): here the white plates, the
  dots and the 2 V move together. The size slider shows the notes' "set by chemistry not by size"
  (notes 4.1) as a voltmeter that will not move. The MCA's "Draws and labels" and "without using chemical
  formulae" (notes 3.2) are met by the picture itself.
- **Lesson 2, two gauges on one cell.** Lesson 1's cell with a syringe hydrometer and a voltmeter.
  Drag the charge and the float rises in the barrel as the acid strengthens; the scale reads in
  points, with the stationary full-charge mark at 1.225 (BU-903, notes 4.2). The traps are sliders
  and switches: electrolyte temperature (the raw reading moves, the corrected reading holds, with
  the maker's rule shown), hours since charging (the voltmeter's surface charge decays), electrolyte
  level (low reads high) and "stratified" (the acid layers, dense at the bottom, and the voltmeter
  reads high). A "trust this reading?" light stays amber until rested, corrected, level and mixed
  are all ticked. *Why:* the notes' reading is that this is "a decision, not a table" (notes 4.2).
  The slips it catches are all cited: reading straight after charge (BU-903), an uncorrected cold
  reading (BU-903, GNB), a stratified cell that looks "more charged than it is" (BU-804c, notes
  6.4). The float rising in denser acid is Heat and fluids lesson 5's floating, so the hydrometer
  needs no new physics. Where the hydrometer draws its sample in a stratified cell is not in the
  notes, so the picture does not claim what it reads there (gaps).
- **Lesson 3, the cell behind its resistance.** The cell drawn as an emf E inside a dashed box with
  a small r, and a load whose current you drag. The lost volts I × r show as a drop across r, and
  the terminal reading is E − Ir; at zero current it reads E. A "discharge" button runs at that
  current until the end voltage for that rate (EnerSys's per-cell figures, notes 4.3) and drops the
  ampere-hours delivered as a point on log-log axes of capacity against current. A Peukert line runs
  through two rated points (Victron's, notes 4.3), its gradient shown; beyond the highest rating
  the region is shaded "a fixed n over-predicts here" (Victron, Sulzer et al., notes 4.3). A
  temperature slider raises r and cuts capacity, with EnerSys's 0.91 at 10 °C and BU's 50 per cent
  at −18 °C as cited marks (notes 2.2, 4.3). The curve between those marks is an example, labelled.
  *Why:* the slips here are using "the emf as the terminal pd" and missing "any reference to the
  internal resistance" (AQA 2023, notes 6.3), and treating the battery as "a constant source of
  current" (Englehardt and Beichner, notes 6.1). Dragging the load and watching the terminal
  voltage fall while the emf stays is the model that answers all three. The log-log axes are
  Exponentials lesson 7's, so Peukert arrives as a straight-line fit you already know how to read,
  and the shaded region shows it is only a fit.
- **Lesson 4, the set-point pin.** A charger, drawn as a box that holds volts and limits amps
  (Electronics lesson 5 has its inside), feeding a string. A time scrubber runs a charge from flat:
  constant current with the voltage climbing, then constant voltage with the current tailing off to
  3 to 5 per cent of the Ah rating, then float (BU-403, notes 4.4). Volts per cell and current are
  traced together. A set-point slider in volts per cell has the cited bands marked: float 2.23 to
  2.27, boost 2.33 to 2.40, gassing 2.40, equalise 2.50 (EnerSys, BU-403, BU-404, notes 2.2, 4.4).
  Held too low, a sulphate layer grows on the negative plate; held too high, the positive grid
  thins, bubbles start past 2.40 and a water gauge falls. The two meters show direction only, never
  a rate. A cell stepper multiplies the per-cell setting into the charger's volts, and a
  temperature slider applies −3 mV per °C per cell. *Why:* BU's "dancing on the head of a pin",
  sulphation one side and grid corrosion the other (notes 4.4), is the cause of every figure in the
  lesson, and the slider puts you on the pin. The cell stepper shows EnerSys's "Uflo per cell x no.
  of cells" (notes 2.2): the charger's number is per cell multiplied up. It catches "higher is
  better" (BU-403's "heat and the battery begins to gas", notes 6.5) and boost left on (EnerSys,
  notes 2.2).
- **Lesson 5, the battery room.** A side view of a room: a battery on charge, a charger, an inlet low
  and an outlet high. A charging-current slider runs from float current up to the charger's fault
  current; past the gassing voltage, bubbles rise from the plates in proportion. A cell-count
  stepper and a switch, "room people enter" (S = 10) or "closed enclosure" (S = 4). The hydrogen
  readout is computed from HSE's own formula (a model, labelled) against bands at 0.4, 1 and 4 per
  cent, the last in red. The required opening 0.3 × N × I × S is drawn to scale beside the real
  one, with air crossing it at 0.1 m/s and the flow readout area × speed. A "fan fails" switch on a
  mechanical version sends the readout climbing to the alarm. A "valve-regulated" switch keeps the
  bubbles inside until the current is pushed too high and the valve lifts. *Why:* the cause is the
  current: gas comes from "electrolysis ... by the charging current" (GNB, notes 4.5), which is why
  HSE sizes from current and from the charger's fault current (notes 2.4). Area × speed is Heat and
  fluids lesson 6, so Hoppecke's 28 × Q falls out of the picture (notes 4.5). The VRLA switch
  catches "sealed means no gas" (HSE, NeRF, notes 4.5, 4.8). The picture spreads hydrogen evenly
  and says the ceiling question is contested (notes 4.5).
- **Lesson 6, the string as tanks.** Six cells drawn as tanks side by side in series, five of
  100 Ah and one of 80 Ah (example values), each with its voltage bar, and one current arrow through
  them all. Drag the load current and run a discharge: all six fall at the same rate, the small one
  hits empty first, and if you keep going its bar crosses zero into reverse, in red. Run a charge:
  the small one fills first and bubbles while the others are still filling. A float view shows the
  six cell voltages against EnerSys's −0.05 to +0.10 V band, with the total inside its limits even
  when one cell is out. A second card: two parallel strings with cable resistances you drag and the
  current share computed. *Why:* BU-803a's weak cell that is "discharged more quickly" and pushed
  "into reverse polarity", and that "reaches full charge first" (notes 4.6), are both one series
  current through unequal tanks: the cause in a single picture. The float view shows a good total
  hiding a bad cell (EnerSys, notes 2.2). The parallel card is EnerSys's equal-cable rule (notes
  4.6) as arithmetic you can feel.
- **Lesson 7, the trend that finds the cell.** A 24-cell string's impedance, as example data: each
  quarter a column of dots, one per cell. Tap a cell and its readings line up in time with a fitted
  slope (Statistics lesson 4) and its distance from the string's mean in SDs (Statistics lesson 3).
  Drag the years on: one cell's readings sit flat for ten or so quarters, then climb (Megger's
  pattern, notes 4.7). A picker draws one source's threshold at a time: Megger's 20 per cent for
  flooded cells, Vertiv's 30 to 50 per cent, EPRI's 150 per cent of nominal (notes 4.7). Past it, a
  "capacity test" button runs a discharge and draws the result against the 80 per cent line. The
  flagged cell opens to show the fault its history made: held under-charged, sulphate on the
  negative; left at partial charge, layered acid; held over-charged, a thinned grid or, for a sealed
  cell, a dried mat (BU-804a to c, BU-201, notes 4.7). *Why:* "Trending of battery data ... is an
  excellent tool" (Megger, notes 4.7), and a single reading is "not much better than 5 correct in
  10" (BU-905, notes 6.4); dots that only mean something in a line show that. Statistics built
  trending, so this is its first job on real equipment. The threshold picker teaches that the line
  is the maker's, because the sources disagree (notes 4.7). The cut-away ties each fault back to
  lesson 4's pin, which is the cause. Which test shows which fault is taught only where quoted
  (gaps).
- **Lesson 8, the milliohm fault.** A battery string, its intercell connectors, a cable and a fault
  you drag from across the terminals to far down the cable. The current readout is V ÷ (R battery +
  R external), with a bar for a protective device's breaking capacity (an example rating, labelled).
  A state-of-charge slider barely moves the current (Vertiv's 90 per cent at about 60 per cent
  charge, notes 4.8). A time trace shows it reaching its full value in milliseconds, "a fault through
  a resistor" (NRC/BNL, notes 4.8). Vertiv's 480 V string is a preset (notes 4.8). A second card, a
  chemistry switch: lead-acid, nickel-cadmium, lithium-ion. Each shows its cell voltage, the cells
  for 24 V, its electrolyte, whether specific gravity tells the charge, and its main hazard, all
  cited. *Why:* the cause of the danger is the milliohms, and dragging the fault away is the only
  thing that brings the current down; the battery cannot be switched off (EnerSys's "always carry a
  voltage", notes 4.8). It catches "low voltage, low hazard" (EnerSys, notes 6.5) and "a flat
  battery can't hurt you" (Vertiv, notes 4.8). It is Design and verification's fault current with a
  new source, so only the source is new. The chemistry card is the MCA's comparison (notes 3.2) laid
  side by side.

## 4. What else
- **Benchmark (notes 1, 2).**
  - **Brilliant:** no reachable course covers cells. Its Circuits course (31 lessons, 7 levels) has
    no cell or battery lesson and stops at bulbs, voltage and resistance, which you already have
    (notes 1.1). So Brilliant sets no order here.
  - **Battery University (Cadex):** the public benchmark. About 18 short lead-acid articles: how it
    works, AGM and gel, series and parallel, C-rate, charging, equalising, cold, cell balancing,
    corrosion, sulphation, stratification, resistance, state of charge, testing (notes 1.2). It is
    written for "Non-Engineers" (notes 1.2), and it has no ventilation sizing, no short-circuit
    current and no trending. Lessons 1 to 4, 6 and 7 lean on it; lessons 5 and 8 come from HSE,
    makers and Vertiv.
  - **OpenStax Chemistry 2e:** batteries are one section, 17.5, after galvanic cells; it gives the
    redox model and a paragraph per battery, and nothing on state of charge, charging, rate or faults
    (notes 2.1). It is lesson 1's "why 2 V" and lesson 8's outline.
  - **The makers' manuals** (GNB/Exide 93.10, EnerSys, GS Yuasa, Hoppecke): about six operating
    sections each, in the course's order (notes 2.2, 8). Most working figures come from them.

  What they lack that you need: an engineer's model (the emf behind a resistance) carried through
  every lesson, Peukert as a log-log fit, ventilation sized from current with the flow behind it,
  short-circuit current, and trending as statistics. The course adds those.
- **His aim (notes 3).** You have no syllabus for the Navy courses ahead, so the course is planned
  against public standards and the marine syllabi, and where that is a guess it says so.
  - **MCA Marine Electro-Technology (Second Engineer), the lines on cells** (notes 3.2): draw and
    label a lead-acid cell (lesson 1); describe charge and discharge without formulae (1); state of
    charge by hydrometer (2); capacity in ampere-hours at a given rate (3); efficiency in
    ampere-hours and watt-hours (4); a charging circuit from a DC supply and state of charge before
    and after (4, 2); series and parallel with internal resistance (3, 6); the alkaline cell and the
    seven-point comparison (8). **General Engineering Science II:** chemical changes, emf in series
    and parallel, capacity, primary and secondary (1, 3, 6).
  - **MCA ETO and oral syllabi:** "The Battery room safety, safe maintenance and working procedures
    on batteries, appropriate PPE and tools" and "Battery bank and UPS – maintenance and testing
    procedures" (MSN 1860); "Emergency battery room and associated hazards" and "Battery maintenance
    and dangers and precautions" (MIN 654, notes 3.2). Lessons 5, 7 and 8.
  - **STCW Table A-III/6** does not name batteries in what came back; it has "DC electrical systems"
    under maintenance and repair (SECONDARY re-host, notes 3.1). Whether A-III/1 names batteries is
    UNCONFIRMED (notes 3.1).
  - **Public apprenticeship standards:** only Marine electrician (ST0808) names batteries: "Monitor
    marine batteries, charging and ancillary ... charging systems" and "Check, test, and diagnose
    battery condition ... and record results" (notes 3.3). That is lesson 7's habit. Whether the
    Royal Navy-linked standards (ST0276, ST1403, ST0457 option 5) name batteries is UNCONFIRMED
    (notes 3.3).
  - **Pearson HN units** touch batteries only as an emf and as one storage technology; cell-level
    content appears only in aerospace and automotive units (notes 3.4). So the MCA syllabus is the
    nearest public target.
  - **My guess:** your Level 3 marine engineering course will meet batteries as plant to operate and
    maintain. This course gives you what happens inside the cell and why each number is what it is,
    so any battery, of any size or chemistry, reads as the same few ideas.
- **Starting point (notes 5).** Nothing below is taught again; each is used with a one-line reminder.

  | Idea | Earlier lesson | Used here |
  |---|---|---|
  | The charger: CCCV, float 2.25 V a cell, a 12-cell bank at 27 V, hydrogen's range | Electronics 5 | Lesson 4's recall and stages; lesson 5's range |
  | Ripple heats a battery | Electronics 3 | Lesson 4's 5 per cent limit |
  | The UPS with a battery on its DC link | Electronics 7 | Lessons 3 and 7's examples |
  | Density; why a float rides higher in denser liquid | Heat and fluids 5 | Lesson 2's hydrometer |
  | Flow = area × speed | Heat and fluids 6 | Lesson 5's opening and Hoppecke's 28 × Q |
  | Gases as volumes and percentages | Heat and fluids 3; Percentages | Lesson 5's 0.4, 1 and 4 per cent |
  | Solving a power with logs | Exponentials 6 | Lesson 3's Peukert exponent |
  | Power laws as straight lines on log-log axes | Exponentials 7 | Lesson 3's Peukert line |
  | Trusting a reading; the z-score; drift or noise and the fitted slope | Statistics 2, 3, 4 | Lesson 7's trend |
  | Impedance: resistance and reactance together | AC circuits 6 | Lesson 7's impedance test |
  | The four-wire measurement | HV Subsea Cable Testing 2 | Lesson 7's Kelvin test |
  | Prospective fault current; breaking capacity | Design and verification 7 | Lesson 8's short circuit |
  | Ohm's law, series and parallel, safe isolation | Your trade | Lessons 3, 6 and 8 |
  | Ratios and percentages | Proportional reasoning; Percentages | C-rates, points, per cent rise |

  From your trade: DC circuits, PPE, safe isolation and BS 7671 to the 18th Edition. Your
  qualifications' unit content on batteries was not read (UNCONFIRMED, notes 3.5), and the 18th
  Edition predates Chapter 57, so the course starts the cell from first principles.
- **Where it is used (each cited before a lesson uses it).** Public, general equipment only; nothing
  about any naval vessel (notes 7).
  - **The cell (1):** the ship's emergency source, "an accumulator battery suitably located for use
    in an emergency" (SOLAS, notes 3.2); "Lead/acid batteries are the most common large-capacity
    rechargeable batteries", used in "the UPS of computer/communication, process and machinery
    control systems" (HSE, notes 7).
  - **State of charge (2):** the MCA's hydrometer and "before and after" lines (notes 3.2); EnerSys's
    six-monthly pilot cell readings and logbook (notes 2.2); GNB's equalise on a low pilot cell
    (notes 4.4).
  - **Capacity and rate (3):** SOLAS's emergency battery "carrying the emergency electrical load
    without recharging" within 12 per cent of nominal (notes 7); lead acid's "high pulse currents"
    for starting (BU-201, notes 7); battery monitors that apply Peukert (Victron, notes 4.3).
  - **Charging (4):** ST0808's "Monitor marine batteries, charging" (notes 3.3); EnerSys's float,
    boost and equalise (notes 2.2); GS Yuasa's six-monthly equalise (notes 2.2).
  - **Gassing (5):** "Emergency battery room and associated hazards" (MIN 654, notes 7); MSN 1860's
    battery room safety (notes 3.2); HSE's "violent explosion is likely" in "a poorly ventilated
    battery room" (notes 7); BS 7671 A4's stress on "ventilation" (notes 7).
  - **Strings (6):** "Cell mismatch is a common cause of failure in industrial batteries" (BU-803a,
    notes 4.6); EnerSys's parallel-string rule (notes 4.6); the MCA's series and parallel line
    (notes 3.2).
  - **Ageing and tests (7):** ST0808's "Check, test, and diagnose battery condition ... and record
    results" (notes 3.3); "Battery bank and UPS – maintenance and testing procedures" (MSN 1860,
    notes 7); "Communication battery and back up checks, records" (MIN 654, notes 7); IEEE 450 and
    1188 via Megger (notes 4.7).
  - **Safety and chemistries (8):** "safe maintenance and working procedures on batteries,
    appropriate PPE and tools" (MSN 1860, notes 3.2); sizing protection from short-circuit current
    (Vertiv, notes 4.8); the MCA's lead acid and alkaline comparison (notes 3.2); NiCd "where long
    service life, high discharge current and extreme temperatures are required" (BU-107, notes 4.8);
    lithium-ion on boats (Odyssey, SECONDARY, notes 7).
- **The mistakes to catch, each with a DO screen and its own hint.** Each is marked with how strong
  its source is.
  - **Lesson 1, electrons through the acid:** another "common misconception exposed was that electrons
    flow through the solution" (RSC, notes 6.2). A DO screen asks what carries the current in the
    acid.
  - **Lesson 1, ions as electron carriers:** students "thought ions accept electrons at one electrode
    and carry them to the other" (RSC, notes 6.2). A DO screen offers it as an option.
  - **Lesson 1, a bigger cell gives more volts:** the notes' reading, "set by chemistry not by size"
    (notes 4.1). A DO screen: a torch-size cell and a tonne of lead; which reads more?
  - **Lesson 1, the acid as a bath:** the notes' reading (notes 4.1), against "sulfuric acid is highly
    consumed" (SECONDARY, notes 4.1). A DO screen asks what happens to the acid's strength on
    discharge.
  - **Lesson 2, reading straight after charge:** surface charge "fools SoC estimations" (BU-903,
    notes 4.2). A DO screen gives a reading taken ten minutes after charging.
  - **Lesson 2, the wrong sign on temperature:** "The colder the temperature drops, the higher" the
    reading (BU-903, notes 4.2). A DO screen gives a warm reading to correct, with the subtraction as
    a wrong option.
  - **Lesson 2, topping up with acid:** "Never add acid" (BU-804c, notes 6.4). A DO screen: a cell
    reads low and its level is low; what goes in?
  - **Lesson 2, a stratified cell trusted:** it "appear[s] more charged than it is" (BU-804c, notes
    6.4). A DO screen: a high rested voltage on a cell left on shallow cycles.
  - **Lesson 3, emf used as terminal voltage:** "Common errors included using the emf as the terminal
    pd" (AQA 2023, notes 6.3); "Never use emf as terminal pd" (SECONDARY summary, notes 6.3). A DO
    screen asks for the terminal voltage at 100 A.
  - **Lesson 3, no emf with nothing connected:** "The most common answer was ... there would be no
    emf" (Edexcel 2024, notes 6.3). A DO screen: a voltmeter on an unloaded cell.
  - **Lesson 3, the battery as a constant-current source:** "the idea that the battery is a constant
    source of current was used most often" (Englehardt and Beichner; McDermott; POE-A, notes 6.1).
    A DO screen: halve the load resistance; what does the current do, and the voltage?
  - **Lesson 3, a fixed tank of ampere-hours:** "a higher C rate will produce a lower capacity
    reading" (BU-402, notes 4.3). A DO screen: a 100 Ah battery at 50 A; how long?
  - **Lesson 3, Peukert as exact:** "no more than a rough approximation of reality" (Victron, notes
    6.4). A DO screen asks what a fixed exponent predicts at a very high current, and whether to
    trust it.
  - **Lesson 4, higher voltage is better:** charging beyond limits "turns redundant energy into heat
    and the battery begins to gas" (BU-403, notes 6.5). A prediction screen on the set-point slider.
  - **Lesson 4, boost left on:** it "must be switched to float charging" (EnerSys, notes 2.2). A DO
    screen: a battery boosted all weekend.
  - **Lesson 4, the temperature sign:** "reduced by 3mV per cell for every degree above 25°C"
    (BU-403, notes 4.4). A DO screen in a hot room.
  - **Lesson 5, sealed means gas-free:** "Gas pressure may build up ... if it is charged too quickly"
    (HSE, notes 6.5); not "gas free" (NeRF, SECONDARY, notes 4.8). A DO screen: a VRLA bank in a
    cupboard.
  - **Lesson 5, ventilating for the float current:** use "the maximum current likely to be supplied
    by the charger during malfunction" (HSE, notes 2.4). A DO screen offers the float current.
  - **Lesson 5, safe as soon as the charger stops:** "Leave the battery to stand for at least 20
    minutes" (HSE, notes 2.4). A DO screen: the charger is off; can the work start now?
  - **Lesson 6, series as "more energy":** "Students who believe that two batteries in series provide
    more energy (46%) also believe that they provide more voltage (51%)" (Englehardt and Beichner,
    notes 4.6). A DO screen asks what doubles and what stays the same.
  - **Lesson 6, the same current whatever the arrangement:** "Battery supplies same amount of current
    to each circuit regardless of the circuit’s arrangement" (Englehardt and Beichner, notes 6.1). A
    DO screen on the parallel card.
  - **Lesson 6, a good total means good cells:** the notes' reading of EnerSys's band (notes 2.2,
    4.6). A DO screen: the total is right and one cell reads 0.15 V low.
  - **Lesson 6, a charge cured the bad cell:** "the flaw will likely resurface" (BU-803a, notes 6.4).
    A DO screen after an equalise.
  - **Lesson 7, one reading tells health:** "not much better than 5 correct in 10" (BU-905, notes
    6.4); "Stating that a battery tester measuring internal resistance will also provide capacity
    estimation is misleading" (BU-905, notes 4.7). A DO screen: one high impedance reading, no
    history.
  - **Lesson 7, voltage tells health:** "Voltage alone cannot estimate battery state-of-health"
    (Battery University, notes 4.2). A DO screen: a cell floats at the right voltage.
  - **Lesson 7, overcharge fixes sulphation:** "blindly inducing an overcharge can harm the battery"
    (BU-804b, notes 6.5). A DO screen offers a long high charge as the fix.
  - **Lesson 8, low voltage means low hazard:** "Exposed metal parts of the battery always carry a
    voltage" (EnerSys, notes 6.5). A DO screen: a 12 V block and a spanner.
  - **Lesson 8, a flat battery cannot fault hard:** "currents exceeded 90% of nominal even at ~60%
    state of charge" (Vertiv, notes 4.8). A DO screen.
  - **Lesson 8, a hydrometer on nickel-cadmium:** the electrolyte "isn’t used in the chemical
    reaction" (Megger, notes 4.8). A DO screen.
  - **Not stated as common:** no source counts these, so they are taught as checks, not as cited
    mistakes.
    - Adding cells in parallel to raise the voltage.
    - Volts per cell confused with the charger's total.
    - Points of specific gravity read as a per cent.
    - The vent opening sized for one battery when several share a room (HSE's N counts all cells).
    - Short-circuit current taken from the nominal 2.0 V when the cell is charged at 2.1 V.
- **Size and cost.** 8 lessons of about 12 screens on the agreed settings (CLAUDE.md).
  - Electronics was estimated at about 1.1M to 1.3M a lesson. The pictures here are animated cells
    and circuits with linked readouts, nearer Electronics' than Motors', so I estimate the same.
  - That is about 9M to 10.5M for the course, plus about 0.3M for the plan. The research is done
    (343 quotes from 58 saved tool results).
  - The full process measured on Fractions lessons 4 to 8 was about 1.65M a lesson, about 13.2M for
    eight.
  - Each build's real cost is reported to you.
- **Lesson 1 first.** Lesson 1 is built and checked before the others (about 1.2M, plus the plan).
  Because you approved the build, the rest follow without waiting for you to try it.
- **Left for other courses, with a one-line look ahead where it fits:**
  - **Insulated systems and earth faults** (this folder, built alongside): insulated DC systems,
    insulation monitors on a battery's DC network, finding an earth on a battery, MIN 654's "Earth
    faults, MEGGER readings" (notes 3.2). Lesson 8 names "unintentional battery grounds" (notes 2.3)
    and stops.
  - **Electronics and power electronics** (built): the charger's circuit, its control and ripple.
    Used, never re-taught.
  - **Transformers and magnetism** (Electrical principles, planned): the charger's step-down
    transformer. Not mentioned beyond a label.
  - **Installation design (BS 7671):** Chapter 57's regulations on battery installations. Where they
    would be taught is my guess; lesson 8 names the chapter only.
  - **Maintenance and condition monitoring** (hidden for now): trending across the plant. Lesson 7
    teaches battery trending fully, so that course can point back to it.
  - **Not deferred, left out:** battery sizing to a load profile (no public method found, notes 9);
    battery management systems and lithium-ion design; flow batteries and supercapacitors; any
    submarine battery.
- **Gaps to close at build time.** None blocks the build.
  - **Lesson 1:** the separator and the plate construction (pasted or tubular) are not quoted; the
    picture draws plates and acid only, or the build quotes a maker's parts list first. The plate
    potentials and the 2.042 V are SECONDARY (notes 4.1); the 2.1 V rested figure is Battery
    University's.
  - **Lesson 2:** a cited line tying rested voltage to specific gravity was not found; the two gauges
    are shown rising together from their own cited points, with no conversion rule. A flat cell's
    specific gravity is not quoted; the bottom of the scale is an example, labelled. Where a
    hydrometer samples in a stratified cell is not quoted.
  - **Lesson 3:** no stationary maker's Peukert exponent (UNCONFIRMED, notes 9); every exponent is
    computed from Victron's two ratings or labelled. The curve between EnerSys's and BU's cold
    figures is an example. The emf-and-r formula is from a revision site (SECONDARY, notes 4.3).
  - **Lesson 4:** the watt-hour efficiency uses example charge and discharge voltages, labelled. The
    sulphate and corrosion meters show direction only.
  - **Lesson 5:** hydrogen per ampere-hour (Faraday) is not quoted (notes 9); the readout uses HSE's
    own formula, labelled as a model. The gas-emission factor tables of IEC 62485-2 were garbled and
    are not used (notes 2.2). No class-society or MCA rule on battery room ventilation was found
    (UNCONFIRMED, notes 9). Where hydrogen gathers is contested (notes 4.5).
  - **Lesson 6:** cell capacities, resistances and cable values are examples, labelled.
  - **Lesson 7:** which reading each fault moves is quoted only for stratification (raised voltage,
    BU-804c) and for impedance against capacity (Megger, EPRI, notes 4.7). The cut-away shows each
    fault's cause from its quote and claims no reading it cannot cite. The impedance data are an
    example string.
  - **Lesson 8:** no DC arc-flash method was found; arc flash is named only (MIN 654, notes 3.2).
    The protective device's rating is an example. Nickel-cadmium's and lithium-ion's short-circuit
    behaviour is not quoted, so the fault card is lead-acid only.
  - **Nothing naval.** No naval or submarine source was used, and the SMQ books on your Drive were not
    read (notes, header and 9).
