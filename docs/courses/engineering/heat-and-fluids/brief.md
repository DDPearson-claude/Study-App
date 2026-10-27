# Heat and fluids: the course brief

Written 26 Oct 2026 for Dan, answering the course brief in tools/course/RUNBOOK.md section 0. It is
the second course in the Engineering science shelf's Engineering science folder, "Temperature, heat
and how it moves; gases and pressure; flow, pumps and the engines that turn heat into work." The
folder runs Mechanics and materials, then this one. No course follows it in the folder. You chose
it on 26 Oct ("Start with engineering science") and approved the build, so I have taken the
decisions for you and listed them below. Change any you like. Sources and quotes are in
`research-notes.md` beside this file (238 quotes, cut by script from the 57 saved tool results and
checked with `tools/eval/sources.mjs`, `failed: 0`). Section numbers below point there.

Mechanics and materials is being built alongside. Its brief is not written yet, so this one names
its ground (forces, moments, stress, motion, work, energy, power, efficiency, rotation, vibration)
and never its lesson numbers. Those are checked against its brief before lesson 4 is written.

## The short version
**Eight lessons**
1. Temperature and heat (built first)
2. How heat moves
3. Gases, pressure and the air receiver
4. Heat into work: the first law and engines
5. Pressure in liquids, and floating
6. Fluids in motion
7. Pipes, head and pump power
8. Where the pump settles, and its limits

**The main pictures** (one per lesson, each moved with your finger, each showing the cause):
- **The heating curve (lesson 1).** A heater of set power warms a mass of water from melting ice.
  Drag the energy put in. The temperature climbs on a slope set by mass and specific heat, then
  sits flat at 0 °C and at 100 °C while the energy goes into changing phase.
- **Heat in, heat out (lesson 2).** A cable in cross-section, losses made in the copper, flowing
  out through the insulation into the air. Drag the current, wrap it in insulation, warm the room.
  The copper settles where heat out equals heat in, and a time trace rises to it along the curve
  you know from Differential equations.
- **The sealed cylinder (lesson 3).** A gas under a piston, with a gauge that reads both gauge and
  absolute. Drag the piston and the heat. Its pressure against temperature runs in a straight line
  that, extended, hits zero pressure at absolute zero. A ratio check stays steady in absolute units
  and drifts in red in gauge and °C.
- **The engine's energy split (lesson 4).** Fuel energy in, split into work out, cooling water and
  exhaust, drawn as flows whose widths you drag. Two temperature sliders set a Carnot ceiling the
  work can never cross.
- **The tank and the probe (lesson 5).** Tanks of different shapes, a pressure probe you drag down,
  and a block you lower in. The probe's reading depends on depth alone. On the block, the push on
  its bottom beats the push on its top, and that difference is the upthrust.
- **The venturi (lesson 6).** A pipe with a throat you drag narrower. Dots speed up through the
  throat, and standing columns of liquid on the pipe drop there and recover after. The pressure
  difference reads out as a flow.
- **The system curve builder (lesson 7).** A pump lifting water to a higher tank through a pipe.
  Drag the flow. The head needed is the lift plus the friction, and the friction grows with the
  square of the flow, tracing the system curve. A chain of bars turns that head and flow into the
  power the motor draws.
- **Where the curves meet (lesson 8).** A centrifugal pump's curve over lesson 7's system curve.
  Drag the valve, the pump speed and the suction tank's level. The operating point slides along,
  its efficiency shows, and when the suction margin runs out, the pump cavitates in red.

**Decisions taken for you** (say if you want any changed):
- **Eight lessons, with the scope reshaped once.** You approved eight and gave eight parts. The
  research suggests merging pressure in liquids with buoyancy and splitting pumps and pipes in two
  (notes 8.3). I took that. Buoyancy is upthrust from pressure growing with depth, so it belongs
  inside lesson 5, and your BTEC Unit 8 already covered Archimedes, if you met it (notes 3.5). Pumps
  and pipes holds head, friction loss, pump power, the operating point, cavitation and pump types.
  That is two lessons' worth, and it is where a marine course asks you to calculate (HN Unit 11,
  "Calculate the input power requirements of centrifugal pumps", notes 3.3).
- **The order: heat, gases, engines, then liquids, flow and pumps.** It follows OpenStax's split,
  heat and gases first, then fluids (notes 2, 2.5), and Pearson's HN pairing of Unit 13 before Unit
  11 (notes 2). The engine comes straight after the gas laws, because it is gas doing work. Pumps
  come last, because they need pressure, flow and head.
- **Lesson 1 is built first, without a pause.** You approved the build, so lesson 1 is built and
  checked first and the others follow without waiting. You can try it on your phone as soon as it
  lands.
- **Steps lessons, partly visual ("Partly", RUNBOOK section 0, item 3).** Every lesson carries
  `format: 'steps'`, about 12 screens, SHOW then DO, ending on two or three mixed puzzles. SHOW
  screens may carry a short paragraph, at most about 90 words, because a physical cause needs saying
  in words. Most screens will be shorter.
- **Fast through your BTEC ground, deeper beyond it.** Your Diploma's Unit 8 lists sensible and
  latent heat sums, the gas laws, Archimedes and continuity in a tapering pipe (notes 3.5). Whether
  your Diploma included Units 8, 11, 66 or 70 is UNCONFIRMED (notes 3.5). So lessons 1, 3, 5 and 6
  open with one "Do you still have it?" sum on that ground. A right answer says "Still there" and the
  lesson moves quickly through it. A wrong one gets a hint and one extra screen. The deep screens go
  to what Unit 8 does not give (notes 3.5): why heat moves as it does, thermal resistance behind a
  time constant, absolute pressure as a trap, the first law with work, the Carnot ceiling and where a
  diesel's heat goes, Bernoulli and flow measurement, pipe friction, and pumps.
- **Taught inline, because no course you have holds them** (notes 5): specific heat capacity and
  latent heat as ideas, not only sums; thermal resistance and heat capacity as the physical parts of
  a time constant; absolute against gauge pressure and kelvin; continuity and Bernoulli; head as
  energy per unit weight; pipe friction loss; reading a pump curve against a system curve.
- **Not re-taught, used by name in one line each.** Newton's law of cooling, the time constant, 63%
  and 5τ (Exponentials and logarithms lesson 3; Differential equations lessons 1 to 3). Inverse
  proportion and Boyle's law as its context (Proportional reasoning lesson 6). Work as the area
  under a pV curve and pVⁿ = C (Calculus fundamentals lesson 9), and the isothermal case
  (Exponentials lesson 8). "Change this by a factor" with squares and cubes, and pump power with
  speed cubed (Powers and roots lesson 7). Where two graphs cross (Linear systems). Work, energy,
  power and efficiency (Mechanics and materials). I²R, three-phase power and power factor (AC
  circuits). Ca, Ci and the cable rating method (Design and verification). Pumps, fans and
  compressors as motor loads, starting current and the fan cube law (Motors lessons 1 to 3).
- **Heating stops at the boiling point.** The cited constants are water's 4,200 J per kg per degree
  and its latent heats of 334 and 2,260 J per gram (notes 4.1). Ice below 0 °C and steam above
  100 °C would need constants the research did not cite, so the heating curve starts at melting ice
  and ends with all the water turned to steam. Steam tables, steam cycles and turbines are your
  marine course's ground and are left out (MCA Applied Heat sections 8 and 9, notes 3.4).
- **Cables and motors explain their ratings, never their method.** Lesson 2 ends on why a cable in
  insulation or a hot room carries less: heat has a harder way out (BS 7671 Appendix 4's Ca and Ci,
  notes 7.1). The numbers on that screen come from a simple heat-path model with labelled example
  figures, never from BS 7671's tables. The tables stay Design and verification's.
- **Heat exchangers by "heat carried = flow × specific heat × temperature rise", not by log mean
  temperature difference.** The MCA lists LMTD (notes 3.4), but the research found no worked source
  for the formula (UNCONFIRMED, notes 4.2). So the cooler is taught by what each side carries and by
  the temperature difference driving it, and LMTD is named as where the marine course goes next.
- **The Carnot limit is a ceiling, and its use for real engines is taught as contested.** A US DOE
  slide calls it "a common misconception" that engines are "limited by Carnot efficiency", while a
  2025 marine-engine paper says a two-stroke runs "close to the thermodynamic limits established by
  Carnot's theorem" (notes 4.4, 6.5). One screen puts both and says why they can both be read as
  true: it depends which hot and cold temperatures you choose.
- **The diesel cycle in outline only.** Only air is compressed, fuel goes in at the top, no spark,
  so a higher compression ratio (MIT, notes 4.4). No air-standard efficiency formula, and no
  indicated or brake power: those are the marine course's (MCA GES B, notes 3.4).
- **"Heat rejected", not "heat loss".** An engine energy-balance study calls "heat loss" misleading,
  "as heat is energy in transit" (notes 4.4, 6.5). The lessons say "heat rejected" or "heat carried
  away".
- **Entropy is left out.** Introductory students treat entropy like energy and expect it to be
  conserved (arXiv 2408.00944, notes 6.5). The course needs only the first law and the Carnot
  ceiling, so entropy waits for the marine course.
- **Buoyancy in general terms, with ships and tanks.** Archimedes, density, floating, and a floating
  box's draught (MCA GES B's "floating rectangular shaped vessels", notes 3.4). Never trim, ballast
  or stability, and nothing about submarines (CLAUDE.md). Ship stability sits in a separate Naval
  Architecture paper (notes 4.6).
- **Laminar and turbulent in outline, with the cut-off taught as contested.** ASHRAE gives a
  transition from 2000 to 10 000, the DOE handbook text laminar below 2100 and turbulent above
  4000, and a Portland State slide a single 2000 (notes 4.7). The lesson says "somewhere between
  about 2000 and 4000, depending on the source and the pipe", and no single cut-off is a control.
- **Pipe friction by Darcy's rule with a given friction factor.** The factor is an example figure on
  the screen. Moody diagrams and roughness are HN Unit 64's (notes 2.7) and wait for the marine
  course.
- **Pumps from the motor's side.** Hydraulic power, then shaft power after the pump's efficiency,
  then the electrical input after the motor's (notes 4.8, 7.5). You read the last one off an
  ammeter, so one puzzle works back from the motor to the flow.
- **Cavitation and NPSH in outline.** What cavitation is, and that the suction margin available
  must beat the margin the pump needs (Grundfos, DOE handbook text, notes 4.8). No NPSH sums with
  vapour pressures, which the research did not cite.
- **Examples from general marine and industrial plant only.** Diesel generators, coolers and heat
  exchangers, compressed air, pumps and pipework, ventilation. Never a submarine system, nuclear or
  steam propulsion plant, or anything beyond CLAUDE.md's public outline. Battery rooms and hydrogen
  stay out: the research found only a US rule and an industrial leaflet (notes 7.3), and a Batteries
  course is on your list of next courses (docs/plans/maths-queue.md).
- **Example numbers are labelled.** Masses, powers, temperatures, pipe sizes, efficiencies and pump
  curves are example figures, said so on screen, or computed from a rule the screen shows. Cited
  constants only: water 4,200 J/(kg °C), latent heats 334 and 2,260 J/g, seawater about 1025 kg/m³
  and about 3850 J/(kg °C), air 287 J/(kg K), 1.229 kg/m³ and 1.4, g = 9.81 m/s², and a 10 m column
  of seawater weighing as much as the atmosphere, about 10⁵ Pa (notes 4, 4.1, 4.3, 4.5). No figure
  is presented as a real ship's, engine's or plant's.
- **Colour as before.** Ink for curves, arrows and controls. Amber for key terms. Teal for small
  labels such as units, "gauge", "absolute" and K. Red only for a slip or a warning, such as a gas
  sum done in °C, a cable over its temperature, or a pump cavitating. Green only for finished.
  Heat flows are ink arrows from hot to cold, never paired red and blue arrows. My reading: a blue
  "cold" arrow would draw the idea that cold flows, which a four-tier study found (notes 6.1).
- **Your intake answers** (`intake.json`): to understand heat and fluids and how to work with
  them; on the job and in everyday life; hands-on, with the why explained in full.

## 1. The overall topic
Heat is energy on the move because one thing is hotter than another. Temperature is how hot a thing
is. This course is about the difference, and what follows from it: how much energy it takes to warm
or boil something, how fast heat leaks out of a cable or a motor, how a gas's pressure, volume and
temperature tie together, and why an engine can only turn part of its heat into work. Then the same
habits for liquids: pressure grows with depth, which is why things float; flowing liquid trades
pressure for speed; and a pump has to supply both the lift and the friction of the pipe. It ends
where a pump settles on its pipework, and what stops it working. It is the general thermal and fluid
engineering that makes any plant you meet readable, from first principles.

**It builds on:**

| Idea | Where you have it | Used here |
|---|---|---|
| Rearranging formulas, units | Solving equations; Linear equations; Powers and roots | Q = mcΔT for ΔT or m; p = ρgh for h; head from pressure |
| Inverse proportion; Boyle's law as its context | Proportional reasoning lesson 6 | Lesson 3: Boyle is recalled, then the combined gas law is new |
| Squares and cubes as factors; pump power with speed cubed | Powers and roots lesson 7 | Lessons 6 to 8: v² in Bernoulli and Darcy; friction head with flow squared |
| Where two graphs cross | Linear systems; Straight-line graphs | Lesson 8: the operating point is where two curves cross |
| Work as the area under pV; pVⁿ = C | Calculus fundamentals lesson 9; Exponentials lesson 8 | Lesson 4: the work a gas does, in the first law |
| Newton's cooling, τ, 63%, 5τ | Exponentials lesson 3; Differential equations lessons 1 to 3 | Lesson 2: now with the thermal resistance and heat capacity behind τ |
| Work, energy, power, efficiency, force over area | Mechanics and materials (built alongside) | Lessons 4, 5, 7: efficiency chains, hydraulic force, pump power |
| I²R; three-phase power and power factor | AC circuits | Lesson 2: losses in a cable; lesson 7: motor input from the ammeter |
| Ca, Ci and cable ratings; the 70 °C conductor | Design and verification | Lesson 2: the reason, in heat-flow terms |
| Pumps, fans, compressors as loads; starting current; fan cube law | Motors lessons 1 to 3 | Lessons 3, 7, 8: the fluid side of the same machines |
| Transistor and heat-sink heating | Electronics and power electronics | Lesson 2: one line, the same heat path |

**Not taught again:** Newton's cooling as a formula or an equation, the time constant and its
percentages, inverse proportion, work as the area under a pV curve, pVⁿ = C, squares and cubes as
factors, intersections, work, energy, power and efficiency, I²R, three-phase power, BS 7671's rating
method. Each is reminded in one line where it is used.

**Left for later, and where it goes.** No course follows this one in the folder. Each of these is
named once where it would come, as "where this goes next":
- **Your Level 3 marine engineering course and the HN units it leads to** (notes 2.7, 3.4): steam
  properties, steam cycles, nozzles and turbines; refrigeration; combustion; reciprocating
  compressors with clearance and interstage cooling; the steady flow energy equation; the Otto,
  Diesel, dual and Joule cycles worked as air-standard sums; indicated and brake power; heat
  exchangers by log mean temperature difference; composite walls and lagged pipes; Moody diagrams
  and fitting losses; hydrostatic thrust on a plane surface and its centre of pressure; and
  turbines and pump theory. Ship stability belongs to naval architecture.
- **Vector calculus** (paused on the Maths shelf): heat flowing along a cable, where temperature
  changes with place as well as time, as Differential equations left it.
- **Not on any shelf:** entropy and the second law beyond the Carnot ceiling. Say if you want them.

**Edges.** One-dimensional heat paths and lumped bodies. Ideal gases. Incompressible liquids with
constant density. Steady flow in a single pipe. Scientific calculator only.

## 2. The lessons, in the order they build
The order follows the research core (notes 8.3): OpenStax's heat and gases before fluids (notes
2.5), the HN pairing of thermodynamics before fluid mechanics (notes 2.7), and Bird and the HN units
for pumps last (notes 2.2, 2.7). Brilliant puts pressure after forces (notes 1.2), which is why
Mechanics and materials comes first on the shelf.

| # | Lesson | What it teaches |
|---|---|---|
| 1 | Temperature and heat | Opens with a "still there" sum on Q = mcΔT (Unit 8, notes 3.5; BTEC Unit 1 booklet, notes 2.1). Temperature is how hot; heat is "a type of energy transfer that is caused by a temperature difference" (OpenStax, notes 4.1). They are not the same thing (Bitesize, notes 4.1). A cup at 80 °C and a 100 kg tank at 30 °C, both cooled to 20 °C: the cup gives 63 kJ, the tank 4.2 MJ (computed with 4,200 J/(kg °C), Bitesize, notes 4.1). The energy needed depends on mass, substance and temperature change (Bitesize, notes 4.1). The kelvin: a kelvin step equals a Celsius step, but zero is absolute zero (SECONDARY, notes 4.1); 0 °C is not "no thermal energy" (SECONDARY, notes 4.1). Adding energy "does not necessarily increase its temperature" (OpenStax, notes 4.1): latent heat changes the phase "without causing a temperature change" (OpenStax, notes 4.1). Water's latent heats, 334 and 2,260 J/g (Texas, notes 4.1). Heating 1 kg from 0 °C to 100 °C takes 420 kJ; turning it to steam takes 2,260 kJ more, over five times as much (computed). An example 3 kW heater takes 112 s to warm 1 kg from 20 °C to 100 °C, and about 12.6 minutes more to boil it away (computed). Making steam in general terms: energy goes in at a steady temperature. Seawater carries about 3850 J/(kg °C) (Scripps, notes 4.1), so an example 2 kg/s of seawater warming 10 °C carries away 77 kW (computed): what a cooler's seawater side does. |
| 2 | How heat moves | Heat moves from hotter to colder, never "cold" the other way (notes 6.1). Three ways: conduction through a solid, convection "by the movement of a fluid" (OpenStax, notes 4.2), and radiation. The rate is not the amount: area, temperature difference, material and thickness set how fast; mass, specific heat and temperature change set how much (ASEE, notes 6.1). Why a metal rail feels colder than wood at the same temperature (ASEE, Prince and Vigeant, notes 6.1). Thermal resistance, "a material's ability to resist the transfer of heat" (Knauf, SECONDARY, notes 4.2), and Fourier's law named (MCA Applied Heat, notes 3.4). Resistances add along a path: copper to insulation to air. The convective resistance runs from air cooling to water cooling (MDPI, notes 4.2). The steady rise is where heat out equals heat in: rise = losses × thermal resistance. A cable makes I²R per metre (US government study, notes 7.1); example 20 W/m through 2 K·m/W gives a 40 °C rise (computed, a model). Wrap it in insulation that doubles the resistance and the rise doubles; to hold 40 °C the losses must halve, so the current falls to 0.707 of what it was (computed, Powers and roots). A 40 °C room leaves 30 °C of headroom, so 0.866 of the current (computed). That is why BS 7671 has Ca and Ci (IET, notes 7.1), tabulated at 30 °C ambient and a 70 °C conductor (Eland, SECONDARY, notes 7.1). The time to get there: the losses heat a heat capacity through a thermal resistance, so τ is their product, and the curve is Newton's (Electrical4U, SECONDARY; CDC, notes 4.2). Motors take 0.5 to 5 hours (fan maker, SECONDARY, notes 7.2); "Well ventilated machines have smaller time constants" (SECONDARY, notes 4.2); a stopped self-cooled motor cools more slowly, its fan still (Electrical4U, notes 4.2). A protection relay's thermal model comes from the same equation (SEL, notes 4.2). A shell-and-tube cooler: seawater in the tubes, engine coolant on the shell (Caterpillar, notes 4.2), each side carrying flow × c × ΔT. |
| 3 | Gases, pressure and the air receiver | Opens with a "still there" Boyle's law sum (Proportional reasoning lesson 6; Unit 8, notes 3.5). Pressure is force over area, in pascals, the same unit as stress (Mechanics and materials). Absolute = gauge + atmospheric (BTEC Unit 11, notes 3.5, 4.3); the atmosphere is about 10⁵ Pa (WHOI, notes 4.5). Gas sums need "absolute temperature and absolute pressure" (OpenStax, notes 4.3). Charles's law, then the combined law p₁V₁/T₁ = p₂V₂/T₂ (MCA Applied Heat, notes 3.4; Isaac, notes 2.6). A receiver at 7 bar gauge and 20 °C warmed to 50 °C reads about 7.8 bar gauge; done in gauge and °C it gives 17.5, which is nonsense (computed; bar to kPa cited at research). pV = mRT with air's 287 J/(kg K) (FAO, notes 4.3): an example 1 m³ receiver at 800 kPa absolute and 20 °C holds about 9.5 kg of air (computed). The same rule at about 100 kPa and 15 °C gives about 1.21 kg/m³, near NASA's 1.229 (notes 4.3), a check that the rule fits. The receiver: it "only stores air the compressor has already made" (SECONDARY, notes 4.3), and only the band between cut-out and the lowest usable pressure is usable (SECONDARY, notes 4.3). It collects condensate (SECONDARY, notes 4.3). CAGI asks for at least 2 minutes between cut-in and cut-out (notes 4.3). A bigger receiver means fewer motor starts (Atlas Copco, notes 7.6), Motors' starting current again. "Higher pressure does not equal more flow" (Atlas Copco, notes 4.3, 6.6). Compression heats a gas: named only, as where interstage cooling comes from (MCA, notes 3.4). |
| 4 | Heat into work: the first law and engines | The first law: the change in internal energy is the heat put in minus the work the gas does (NASA, notes 4.4; MCA Applied Heat, notes 3.4). Signs: heat in is plus, work out is plus. Example: 500 J in, 200 J of work out, internal energy up 300 J (computed). Work at constant pressure is p × ΔV, the area under the pV line: 200 kPa through 0.001 m³ is 200 J (computed; Calculus fundamentals lesson 9 for the curved case). An engine runs a loop, and the loop's area is the net work (HN Unit 13's "pressure/volume diagrams and the concept of work done", notes 2.7). Efficiency = work out ÷ heat in (Mechanics and materials). The rest is rejected, to cooling water and exhaust. No engine between two temperatures beats a Carnot engine (Brilliant wiki, SECONDARY; Isaac, notes 4.4, 2.6): example 800 K and 300 K give a ceiling of 62.5% (computed; formula cited at research). Contested: whether real engines are bound by it (DOE slide against a 2025 marine paper, notes 4.4). The diesel in outline: compression ignition, only air compressed, so a higher compression ratio (MIT, notes 4.4); among "the most efficient simple-cycle" power options (EPA, notes 4.4); four strokes or two named (ST0364, notes 3.1). Where the fuel energy goes: exhaust and cooling carry 60 to 70 per cent (EPA, notes 4.4); exhaust is about 25%, the largest single share, in one marine engine study (SECONDARY, notes 4.4). A generator set is sold by its electrical output, but its cooler "is sized on what the engine rejects" (SECONDARY, notes 7.4), and its room's air flow on the allowed temperature rise (Cummins, notes 7.4). The heat balance is an MCA line (GES B, Applied Heat 4.1.4, notes 3.4). |
| 5 | Pressure in liquids, and floating | Opens with a "still there" Archimedes question (Unit 8, notes 3.5). Pressure at depth is the atmosphere plus the weight of the liquid above (OpenStax, notes 4.5): p = ρgh, for constant density only (OpenStax, notes 4.5; MCA GES B, notes 3.4). Depth sets it, not the container's shape, and it pushes in every direction (Bessas, notes 6.3). 10 m of seawater adds about 100 kPa, as much as the whole atmosphere (WHOI, notes 4.5; 100.6 kPa computed). The gauges move to lesson 7, where pressure reads as head. Pascal's principle and the hydraulic jack: force = pressure × area (BTEC Unit 11, notes 3.5, 4.5): an example 100 N on 10 cm² lifts 2000 N on 200 cm², and the small piston moves 20 times as far, so work in still equals work out (computed; Mechanics and materials). Upthrust: a 0.1 m cube in seawater feels 1005.5 Pa more on its bottom than its top, which on 0.01 m² is 10.06 N, the weight of the seawater it displaces (computed). That is Archimedes (MCA Applied Mechanics, notes 4.6). Floating: it sinks until the liquid it displaces weighs as much as it does. An example 4 m by 2 m box of 4000 kg draws 0.49 m in seawater and 0.50 m in fresh water (computed; fresh water's density cited at research). Relative density (BTEC Unit 1, notes 4.6). Stops before trim, ballast and stability. |
| 6 | Fluids in motion | Opens with a "still there" continuity sum (Unit 8, BTEC Unit 1, notes 3.5, 2.1). What goes in each second comes out: A₁v₁ = A₂v₂ (BTEC booklet, notes 2.1; OpenStax, notes 4.7). A 50 mm bore narrowing to 25 mm has a quarter of the area, so four times the speed: 2 m/s becomes 8 m/s (computed). Bernoulli as energy kept: pressure plus ½ρv² is constant along a frictionless flow (NASA, OpenStax, notes 4.7). So the pressure "will drop in a rapidly-moving fluid" (OpenStax, notes 4.7): in seawater that throat drops it by about 30.8 kPa (computed). Flow measurement: a venturi or an orifice plate turns a measured pressure difference into a flow (BTEC Unit 66, Curtin, notes 3.5, 4.7), with a discharge coefficient for a sharp-edged orifice named (MCA Applied Mechanics, notes 3.4). A Pitot tube named (BTEC Unit 66, notes 3.5). An ideal fluid has negligible viscosity (OpenStax, notes 4.7). Laminar flow is "smooth, parallel streamlines" (OpenStax, notes 4.7); faster, wider and thinner flows go turbulent, and the Reynolds number marks where, taught as contested (notes 4.7). |
| 7 | Pipes, head and pump power | Head is energy per unit weight, so a pressure reads as a height of liquid: h = p ÷ ρg (lesson 5 backwards). Gauges, moved here from lesson 5: the U-tube manometer and the barometer read a pressure as a height of liquid (MCA Applied Mechanics, notes 3.4), and a Bourdon gauge reads gauge pressure. A real pipe loses head to friction, by Darcy's rule h = f (L/D) v²/2g (UTA, notes 4.8; HN Unit 64, notes 2.7). Example f = 0.02, 50 m of 50 mm pipe at 2 m/s loses about 4.1 m; at 4 m/s about 16.3 m, four times (computed). For laminar flow f depends only on the Reynolds number (UTA, notes 4.8): named only. The head a system needs is its static lift plus friction, and friction grows with flow squared, so the system curve rises as a parabola (notes 4.8, my reading made a shown rule). Pump power: hydraulic power is ρgQH; seawater at 10 L/s through 20 m is about 2.01 kW (computed). Shaft power is that ÷ the pump's efficiency (Neutrium, SECONDARY, notes 4.8): at an example 70%, about 2.87 kW. The motor draws more again, ÷ its own efficiency (ElectroMechCalc, SECONDARY, notes 4.8, 7.5), typically 0.90 to 0.97 (SECONDARY, notes 7.5): at 0.90, about 3.19 kW (computed). Work back from the ammeter with AC circuits' three-phase power. The Purdue worked example has the same chain (notes 4.8). |
| 8 | Where the pump settles, and its limits | A centrifugal pump's curve: head falling as flow rises. Its operating point is where that curve meets the system curve (KSB, FIU, notes 4.8), Linear systems' crossing point with curves. Example pump H = 30 − 40 000Q² and system H = 10 + 60 000Q² meet at about 14.1 L/s and 22 m; throttling the valve to double the friction moves it to about 11.2 L/s and 25 m (computed, Q in m³/s). It should sit near the best efficiency point (FIU, notes 4.8). Pump speed and the fan and pump laws in one line (Powers and roots lesson 7; Motors lesson 3). Cavitation: where the liquid's pressure falls to its vapour pressure, it boils at a cool temperature (FIU, notes 4.8), the other end of lesson 1's boiling. NPSH is "the minimum absolute pressure" needed at the suction (Grundfos, notes 4.8), and what the suction offers "must be greater" than what the pump needs (DOE handbook text, SECONDARY, notes 4.8). Shown with bars and example figures. Centrifugal against positive displacement: a centrifugal pump gives continuous flow that depends on speed and discharge resistance; a positive displacement pump traps a quantity of liquid and pushes it on (DOE handbook text, SECONDARY, notes 4.8). Fire pumps and pumping systems as a marine example (MCA Engineering Knowledge, notes 3.4). Mixed puzzles over the whole course. |

**Each lesson's screens.** About 12, SHOW then DO, as in Differential equations. In lessons 1, 3, 5
and 6 the first screen is the "still there" sum. In every lesson one DO screen is a prediction made
before the main picture is played with, and the last two or three screens are mixed puzzles that
reach back into earlier lessons.

## 3. Can it be taught mostly visually, through interaction?
Partly. Every lesson is a steps lesson of about 12 screens, and SHOW screens may carry up to about
90 words. Each lesson has one main picture you move with your finger, and each shows the cause, not
just the answer. Every misconception study in the research finds the wrong ideas stubborn, and
inquiry work helped only modestly (ASEE, notes 6.1). So each picture first asks you to predict, then
lets you test it (notes 6). Other screens use still drawings.

- **The heating curve (lesson 1).** A beaker of melting ice on a heater. Controls: mass (0.5 to 2
  kg) and heater power (1 to 3 kW, example figures). Drag "energy in" along the bottom axis, or
  let the clock run it at the heater's power. A temperature against energy graph draws itself:
  flat at 0 °C until 334 kJ per kg have gone in, a straight slope of 1 ÷ (mc) to 100 °C, then flat
  again for 2,260 kJ per kg while the water turns to steam. A thermometer beside it carries both
  °C and K. A small bar shows where the energy has gone: into warming, or into changing phase.
  *Why:* students equate heat with temperature (Polish study of 470 students, notes 6.1), and
  think a higher temperature always means more energy (Prince and Vigeant, notes 6.1). The flats
  show energy going in with no temperature change (OpenStax, notes 4.1), which breaks both. The
  slope shows mass and substance setting how far the temperature moves (Bitesize, notes 4.1). The
  cause shown is that heat is energy in, and temperature only one of the places it can go.
- **Heat in, heat out (lesson 2).** A cable's cross-section: copper, insulation, then the air.
  Losses I²R are made in the copper and leave as ink arrows through each layer. Controls: current,
  an "extra insulation" wrap, room temperature and "fan on" (a smaller convective resistance). A
  temperature profile across the layers shows the drop across each one, larger across the harder
  layer. Beside it, the copper's temperature against time rises to its steady value along Newton's
  curve, its τ marked; a 70 °C line is the limit, and red marks a run that crosses it. Switch the
  current off and it cools; switch the fan off when stopped and it cools more slowly. A skin swaps
  the cable for a motor, and another for a heat sink on a transistor. *Why:* rate and amount are
  confused (ASEE, notes 6.1), so the drag on resistance changes how fast and where it settles, and
  the heat capacity only changes how long it takes. The arrows run hot to cold only, against the
  idea that cold flows (four-tier study, notes 6.1). Your trade's correction factors are heat-flow
  results (notes 7.1), and this shows why. The cause shown is that the steady temperature is where
  heat out, set by the temperature difference and the resistance, equals heat in.
- **The sealed cylinder (lesson 3).** A gas under a piston, a heater, and one gauge with two
  readings: gauge and absolute. Drag the piston or the heater, or lock either. The dot moves on a
  pV chart and on a pressure against temperature chart. With the piston locked, the p–T points lie
  on a straight line; "extend" draws it back to zero pressure at absolute zero on the °C axis. A
  ratio box shows pV ÷ T. In absolute units it holds; switch to gauge or °C and it drifts, in red.
  A receiver skin shows the cut-in and cut-out band as the usable part. *Why:* using Celsius instead
  of kelvin is "the single most common mistake" (SECONDARY, notes 6.2), and using gauge pressure is
  a named one (SECONDARY, notes 6.2). Students give gas variables fixed relationships regardless of
  what is held constant (Murray State, notes 6.2), so the locks make the held quantity explicit.
  The cause shown is that the gas laws are proportional only from true zero.
- **The engine's energy split (lesson 4).** A block of fuel energy flowing into an engine, leaving
  as three flows whose widths you drag: work out, cooling water, exhaust. They always add back to
  the fuel, which is the first law. Two sliders set the hot and cold temperatures in kelvin, and a
  Carnot ceiling line sits across the work flow; drag the work past it and it stops, in red. The
  EPA's 60 to 70% band for exhaust plus cooling (notes 4.4) is marked as a shaded range. A
  generator skin labels the work as electrical output and the cooling water flow as what the cooler
  is sized for. The first-law cylinder (heat in, work out, internal energy up) is a still drawing on
  the screen before. *Why:* the first law is often "not understood from students' previous studies"
  (Phys. Rev. ST PER, notes 6.1). Flows that must add up make it hard to lose energy or make it. The
  ceiling moves with the temperatures, not with effort, which is the Carnot point; the real engine's
  limit is labelled contested (notes 4.4). The cause shown is that heat can only be turned partly
  into work, and the rest has to go somewhere colder.
- **The tank and the probe (lesson 5).** Three tanks joined at the bottom, one narrow, one wide,
  one flaring, filled to one level. Drag a probe into any of them. Its gauge reads ρgh, and an
  "absolute" switch adds the atmosphere. Level readings at equal depth in every shape. Then lower a
  block into the wide tank. Pressure arrows on each face grow with depth; the side arrows cancel;
  the bottom's beat the top's, and their difference shows as the upthrust, beside the weight of the
  water the block has pushed aside, always equal. A density slider makes the block float, hover or
  sink, and when it floats it settles at the draught where those two match. A liquid switch swaps
  fresh water and seawater. *Why:* students think pressure depends on container shape and area,
  and on direction (Bessas, notes 6.3), and that it only exists when water moves (EJ1507396, notes
  6.3). For floating, people focus "on only one dimension" (dergipark, notes 6.3), think "big/heavy
  things sink" (notes 6.3), and that upthrust depends on the object's shape (notes 6.3). The block
  shows upthrust as a pressure difference, so depth, not size or shape, sets it. The cause shown is
  that pressure grows with depth, and everything else in the lesson follows from that.
- **The venturi (lesson 6).** A horizontal pipe with a throat. Drag the throat's width and the flow.
  Dots stream through, spaced evenly in the wide part and stretched out in the throat; their speed
  reads at each section, A × v shown equal. Three standing columns on the pipe show the pressure:
  lower at the throat, back up after it. A readout turns the column difference into the flow, and
  "measure" hides the flow slider so you find it from the columns. A viscosity and speed switch
  shows streamlines smooth, then eddying, with "somewhere between about 2000 and 4000" written on
  the change. *Why:* students say pressure goes up with flow rate (EJ1256065, notes 6.4), and only
  30% of engineers who named Bernoulli used it correctly (Oregon State, notes 6.4). Both point to
  starting with continuity and asking the pressure question as a prediction (notes 6.4). The cause
  shown is that the same flow through less area must go faster, and the energy for that speed comes
  out of the pressure.
- **The system curve builder (lesson 7).** A pump lifting seawater from a low tank to a high one
  through a pipe. Controls: the lift, the pipe's length and bore, and the flow. Two stacked bars
  show the head needed: the lift, which never changes with flow, and the friction, which grows with
  flow squared. Each flow you drag drops a dot on a head against flow graph, and the dots trace the
  system curve. A chain below turns flow and head into hydraulic power, then shaft power through the
  pump's efficiency, then the motor's input through its efficiency, ending on an ammeter. *Why:*
  the HN unit asks you to calculate input power (notes 3.3), and you meet a pump as an electrical
  load (notes 7.5). The bars show why a pump that only lifts behaves differently from one that only
  pushes through a long pipe. The cause shown is that the friction head grows with the square of the
  flow, and the power the motor draws is set by flow times head.
- **Where the curves meet (lesson 8).** Lesson 7's system curve with a centrifugal pump's curve over
  it, and an efficiency hump below. Drag the valve: the system curve steepens and the operating
  point climbs up the pump curve to less flow and more head. Drag the pump speed: the pump curve
  moves. A suction panel has the tank's level and the suction pipe's friction; two bars show the
  margin available and the margin needed, and when the first falls below the second, bubbles form
  and collapse in red at the impeller eye. A switch swaps in a positive displacement pump, whose
  curve stands almost upright, so its flow barely changes as the valve closes. *Why:* "the
  operating point ... is the intersection" (KSB, notes 4.8), and selection needs both curves (FIU,
  notes 4.8). You know crossings from Linear systems. Cavitation is the liquid's pressure reaching its
  vapour pressure (FIU, notes 4.8), and NPSH available must beat NPSH required (notes 4.8). The cause
  shown is that the pump settles where what it gives equals what the pipe needs, and nothing it does
  can lift the suction pressure.
- **Colour as in the decisions.** Ink for curves, arrows and controls, amber for key terms, teal for
  small labels, red only for a slip or a warning, green only for finished.

## 4. What else
- **Benchmark (notes 1 and 2).**
  - **Brilliant** has no heat, thermodynamics or fluids course (notes 1.4). Its Physics of the
    Everyday (33 lessons) opens on real things, "Toilets Water Towers Refrigerators" (notes 1.1), and
    its Classical Mechanics gives the whole ground three lessons, Pressure, Buoyancy and Ideal Gas Law
    (notes 1.2). Its Science Puzzles has "Which Feels Colder?" and Pascal's paradox as single puzzles
    (titles only, UNCONFIRMED, notes 1.3). What to borrow is the way in: a real thing first, then the
    idea, and a predict-then-find-out puzzle. Lesson 2 opens on the cold rail, and lesson 5's first
    prediction is the tanks of different shapes.
  - **OpenStax University Physics** is the most complete free order: temperature, scales,
    expansion, specific heat, phase change and heat transfer; then kinetic theory, the first law and
    the second; then fluids from density to Bernoulli and turbulence (notes 2.5). It has no pump and
    no heat exchanger (notes 2.5).
  - **Khan** runs gases, then thermal energy, then the first law and PV diagrams, with no fluids unit
    in its current physics (notes 2.4).
  - **Bird,** who lectures at the Defence School of Marine Engineering at HMS Sultan (notes 2.2):
    pressure in fluids, heat energy and transfer, thermal expansion, ideal gas laws, temperature
    measurement, with no heat engines or pumps (notes 2.2).
  - **Pearson's HN units** set where a marine course goes: Unit 11 Fluid Mechanics (Pascal,
    manometers, Bernoulli, Reynolds, head loss, flow meters, pumps), Unit 13 Thermodynamics and Heat
    Engines (first law, gas laws, pV work, lagging, heat exchangers, IC engines) and Unit 64
    Thermofluids (Darcy, Moody) (SECONDARY college copy, notes 2.7).

  The course follows OpenStax's and the HN units' order and adds what Brilliant and OpenStax lack and
  you need: heat exchangers, cable and motor heating, the receiver, the engine's heat balance, pipe
  friction and pumps. It leaves out thermal expansion (it is a BTEC sum you have, notes 3.5, and no
  scope line asks for it) and kinetic theory.
- **Starting point (notes 5).** You have the maths: inverse proportion, squares and cubes,
  exponentials, the pV area, crossings. You have the electrical side: I²R, ratings, motors as loads.
  What you have not met is the physical ideas: heat capacity and thermal resistance, absolute
  pressure as a trap, continuity and Bernoulli, pipe head loss and the pump curve (notes 5). Your
  BTEC Unit 8 may have given you some of the formulas without the reasons (notes 3.5, UNCONFIRMED).
- **His aim (notes 3).** No syllabus for your Navy courses was read; choosing HN Units 11 and 13 and
  the MCA's Applied Heat and Applied Mechanics hydrostatics as the target is a guess (notes 3.1). The
  nearest published lines:
  - **Skills England ST0457 Engineering technician:** "general engineering/manufacturing
    mathematical and scientific principles" and "fluid power components/systems" (notes 3.1).
    ST0364 Marine engineer (retired) adds materials' reaction to "temperature, humidity, pressure"
    and diesel engine principles (notes 3.1). ST0276 Maritime mechanical and electrical mechanic:
    "fluid power equipment" (notes 3.1), quoted for that line only.
  - **MCA General Engineering Science B** (the watchkeeping paper, the closest match): "Differentiate
    between heat and temperature", heat transfer "and methods of improving and/or reducing" it, gas
    law problems, the engine energy balance with "Cooling Water losses; Exhaust losses", pressure by
    ρgh and Archimedes for "floating rectangular shaped vessels" (notes 3.4). Lessons 1 to 5.
  - **MCA Applied Heat:** the first law, Boyle, Charles and the combination law, the Carnot cycle,
    the Diesel cycle, the heat balance, Fourier's law and heat exchangers (notes 3.4). Lessons 1 to 4,
    with the worked cycle sums and LMTD left for the marine course.
  - **MCA Applied Mechanics:** ρgh, manometers, the barometer, Archimedes, continuity and the
    sharp-edged orifice (notes 3.4). Lessons 5 and 6.
  - **Pearson HN Units 11, 13, 64** (notes 2.7, 3.3). Lessons 4 and 6 to 8 lead into them.
  - **Pearson BTEC National Unit 1** says it gives "a foundation to support you in any engineering
    technician role" (notes 3.2), which is the pitch you asked for.
  - The MCA's written exams are being replaced from 2025 to 2028 (MIN 720, notes 3.4), so these lines
    will move.
- **Where it is used (each cited before a lesson uses it).**
  - **Temperature and heat (1):** MCA GES B, "Differentiate between heat and temperature" (notes
    3.4). BTEC Unit 1's sensible and latent heat formulae (notes 2.1). Unit 8's "thermal efficiency of
    a heat transfer process from given values of flow rate, temperature change and input power"
    (notes 3.5). A cooler's seawater side, with seawater's specific heat (Scripps, notes 4.1).
  - **How heat moves (2):** BS 7671's Ca and Ci and Iz = It Ca Cg Ci Cc (IET, notes 7.1). The 30 °C
    and 70 °C reference (Eland, SECONDARY, notes 7.1). I²R per metre (notes 7.1). Motor heating
    constants (fan maker, SECONDARY, notes 7.2). Relay thermal models (SEL, notes 4.2). Marine
    coolers with seawater in the tubes (Caterpillar, notes 4.2); jacket water as the fresh closed
    loop the seawater cools (tpub, SECONDARY, a US Navy training manual republished, used as general
    engineering only, notes 4.2). MCA Applied Heat 7 (notes 3.4) and HN Unit 13's lagging (notes 2.7).
  - **Gases (3):** BTEC Unit 11's absolute = gauge + atmospheric and receiver volume (notes 3.5). MCA
    Applied Heat's gas laws and Equation of State (notes 3.4). Unit 5's "charge/discharge rate for an
    air receiver" (notes 3.5). Receivers: Engineering ToolBox, Mech Codex, Reuven (SECONDARY), CAGI
    and Atlas Copco (notes 4.3, 7.6).
  - **Heat into work (4):** MCA Applied Heat's first law, Carnot and Diesel lines and heat balance
    (notes 3.4). GES B's energy balance (notes 3.4). EPA and the marine energy-balance study (notes
    4.4). Generator sets: the marine heat-exchanger maker (SECONDARY) and Cummins (notes 7.4).
  - **Pressure and floating (5):** MCA GES B ρgh and floating vessels; Applied Mechanics manometers
    and Archimedes (notes 3.4). BTEC Unit 11's Pascal's law and clamping force (notes 4.5). HN Unit
    11's "Transmission of force in hydraulic devices" (notes 4.5). Tanks and ships in general terms.
  - **Fluids in motion (6):** BTEC Unit 1 and Unit 8 continuity (notes 2.1, 3.5). Unit 66's venturi,
    orifice and Pitot (notes 3.5). MCA Applied Mechanics' orifice coefficients (notes 3.4). HN Unit
    11's flow measuring devices (notes 2.7).
  - **Pipes and pump power (7):** HN Unit 64's head losses by Darcy (notes 2.7). HN Unit 11's pump
    input power (notes 3.3). The pump-power chain (Neutrium, ElectroMechCalc, SECONDARY, notes 7.5).
    Motors' pumps as loads.
  - **The pump curve (8):** KSB and FIU on the operating point (notes 4.8). Grundfos and the DOE
    handbook text on NPSH (notes 4.8). MCA Engineering Knowledge's fire pumps and pumping systems
    (notes 3.4). HN Unit 11's "Reciprocating and centrifugal pump theory" (notes 2.7).
- **The mistakes to catch, each with a puzzle and its own hint.** Most of the research is on school,
  university and trainee-teacher students, not tradesmen. That you would slip the same way is
  UNCONFIRMED (notes 6.1).
  - **Lesson 1, heat and temperature as the same thing:** "students often treat these concepts as
    synonyms" (Polish 2025 study, IOP, notes 6.1). The cup against the tank.
  - **Lesson 1, temperature as a measure of energy:** "something at a higher temperature always has
    more energy" (Prince and Vigeant's concept inventory, notes 6.1); "Heat is proportional to
    temperature" (Chu et al. via IOPSpark, SECONDARY, notes 6.1).
  - **Lesson 1, latent heat mistaken for specific heat:** a WAEC examiner's report (notes 6.1). A
    puzzle asks "does the temperature change?" first.
  - **Lesson 1 and 3, Celsius as an absolute scale:** "0°C is not 'no thermal energy'" (SECONDARY,
    notes 4.1).
  - **Lesson 2, heat as a substance, and cold that flows:** "heat to be a specific substance"
    (Polish study, notes 6.1); 8.3% held that "cold can flow" (four-tier study, notes 6.1).
  - **Lesson 2, rate against amount:** one of four "robust" misconceptions (ASEE, Prince and
    Vigeant, notes 6.1). A puzzle: thicker insulation, same losses: does it settle hotter, or only get
    there later?
  - **Lesson 2, temperature as how hot something feels:** "Many students think that temperature is a
    measure of how hot or cold things feel" (concept inventory, notes 6.1). The cold rail.
  - **Lesson 2, convection does not happen in air:** 12.8% in the four-tier study (notes 6.1). The
    "fan on" control.
  - **Lesson 2, surfaces and radiation:** the fourth ASEE misconception (notes 6.1). One check on a
    dark against a shiny surface, kept to what the research says it is.
  - **Lesson 3, Celsius in a gas sum:** "The single most common mistake" (ScienceInsights, SECONDARY;
    ChemTeam, SECONDARY, notes 6.2).
  - **Lesson 3, gauge pressure in a gas sum:** named by turn2engineering (SECONDARY, notes 6.2).
  - **Lesson 3, fixed relationships among gas variables:** "assigning absolute relationships among
    variables" (Murray State, notes 6.2). A puzzle where heating does not raise the pressure because
    the piston is free.
  - **Lesson 3, more pressure means more flow, and the receiver makes air:** Atlas Copco and Mech
    Codex say neither is so (notes 4.3, 6.6).
  - **Lesson 4, the first law not understood:** "demonstrably had not been understood from students'
    previous studies" (Phys. Rev. ST PER, notes 6.1). Signs of Q and W.
  - **Lesson 4, heat "lost" as if it vanished:** the energy-balance study calls the term misleading
    (notes 6.5). The flows must add up.
  - **Lesson 4, real engines bound by Carnot:** a "common misconception" to the DOE, but not to a
    2025 marine paper (notes 6.5), so taught as contested, not marked wrong.
  - **Lesson 5, container shape, area and direction:** "a high incidence of misconceptions" (Bessas,
    notes 6.3). Pascal's paradox tanks.
  - **Lesson 5, pressure only when water moves:** EJ1507396 (notes 6.3).
  - **Lesson 5, sinking by size or weight alone, and upthrust from shape:** "big/heavy things sink"
    and upthrust depends on "volume and shape" (dergipark, notes 6.3); 74 misconceptions in 377
    trainee teachers (EJ1096070, notes 6.3). A heavy steel box that floats and a small one that sinks.
  - **Lesson 6, pressure rising with flow:** "the opposite of the Bernoulli Principle" (EJ1256065,
    notes 6.4). Predict the throat's column before playing.
  - **Lesson 6, Bernoulli named but misapplied:** 60% named it, 30% of those correctly (Oregon State,
    notes 6.4). Every Bernoulli puzzle starts from continuity.
  - **Lessons 7 and 8, not stated as common:** the research found no counted mistakes for head loss,
    pump power or pump curves. These are taught as checks (units, which way an efficiency moves the
    number, does the answer fit the curve), not as cited mistakes:
    - multiplying by an efficiency where you should divide, so the motor draws less than the shaft;
    - treating friction head as growing in step with flow, not with its square;
    - reading head as pressure without ρg;
    - expecting a closed valve to stop a positive displacement pump's flow the way it does a
      centrifugal's.
- **Size and cost.** 8 lessons of about 12 screens on the agreed settings (CLAUDE.md).
  - The last four courses measured about 8.2M to 10.2M tokens for five to eight lessons
    (docs/plans/maths-queue.md); Differential equations was about 9.2M for seven, about 1.3M a
    lesson. These pictures are of that weight: linked charts, a live cable profile, flows that must
    add up, a moving fluid, two curves with a sliding crossing. So about 1.1M to 1.3M a lesson.
  - That is about 8.8M to 10.4M for the course. The research is done (238 quotes); the plan and
    the research stage's top-up quotes (the gaps below) add about 0.3M.
  - The full process measured on Fractions lessons 4 to 8 was about 1.65M a lesson, about 13.2M for
    eight.
  - Each build's real cost is reported to you.
- **Lesson 1 first.** Lesson 1 is built and checked first (about 1.2M, plus the plan). The rest
  follow without waiting, since you approved the build.
- **Gaps to close at build time.** None blocks the build. Each is cited at the research stage or the
  screen says less.
  - **Lessons 1 and 3:** K = °C + 273.15, absolute zero at −273.15 °C. The notes quote the kelvin's
    step and zero but not the number (notes 4.1).
  - **Lesson 1:** that boiling point rises with pressure is not cited. Without it, steam is "at
    atmospheric pressure" every time, and lesson 8's cavitation says only what FIU says.
  - **Lesson 2:** Fourier's law and thermal resistance as temperature difference ÷ heat flow are
    named but not quoted as formulas (notes 3.4, 4.2). τ as thermal resistance × heat capacity is my
    reading of the first-order model (notes 4.2, 7.2). Radiation's dependence on the surface is
    quoted only as a misconception area (notes 6.1). All to cite.
  - **Lesson 2:** heat exchanger "power rating" by flow × c × ΔT is from Unit 8's wording (notes 3.5),
    not a quoted formula. LMTD stays out (UNCONFIRMED, notes 4.2).
  - **Lesson 3:** the bar (100 kPa) and Charles's law in its own words. Boyle is quoted (Isaac, notes
    2.6); the combined law and Equation of State are named by the MCA (notes 3.4).
  - **Lesson 4:** the Carnot efficiency 1 − T_cold ÷ T_hot is not quoted (notes 4.4). The four- and
    two-stroke cycles are named by ST0364 only (notes 3.1).
  - **Lesson 5:** fresh water's density of about 1000 kg/m³; the Bourdon gauge; Pascal's principle in
    its own words (BTEC names it, notes 4.5). The UNCONFIRMED Brilliant puzzle "This Is Pascal's
    Paradox" is not cited for content.
  - **Lesson 6:** a discharge coefficient's typical value is not cited, so the orifice screen
    names Cd and uses no number for it. The Reynolds number's formula and water's viscosity are not
    cited, so Re appears as words and a contested range only.
  - **Lesson 7:** the friction factor is an example figure. Head as energy per unit weight is my
    reading, to cite (notes 4.8).
  - **Lesson 8:** water's vapour pressure is not cited, so NPSH bars carry example figures. Why a
    positive displacement pump needs a relief valve is not cited, so the screen says only that its
    flow stays nearly fixed by its speed. The best efficiency point's shape is drawn as an example.
  - **Throughout:** Mechanics and materials' brief is not written, so its lesson numbers are checked
    before lesson 4 is written. What happens inside Brilliant's lessons is UNCONFIRMED (notes 1.1 to
    1.3). Whether your Diploma included Units 8, 11, 66 or 70 is UNCONFIRMED (notes 3.5). No Navy
    syllabus was read, and nothing in this course is claimed as how the Navy or any boat does it.
