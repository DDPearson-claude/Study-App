# Batteries: research notes

Researched 27 Oct 2026 for the Batteries course brief (the second course in the Electrical shelf's Supply systems folder, after Insulated systems and earth faults, which is built alongside this one; blurb "How a lead-acid cell works, capacity and discharge rate, charging stages, specific gravity, gassing and hydrogen, and cell faults."). The brief itself is not written here; these notes are its evidence. Dan is an electrician and a Royal Navy submariner on the electrical engineering path. He asked for foundations that see him through any new topic, not a remake of his Level 3 marine engineering course (CLAUDE.md). This is general large stationary and marine battery ground from public sources only: nothing about how the Royal Navy or any boat does it, nothing about submarine battery design, layout or operation beyond the one-line public outline in CLAUDE.md (a large main battery exists), and nothing from Dan's SMQ books.

Every finding has its source title, URL and the exact words, copied from a saved tool result by script (the quotes were not retyped into this file; this file and `quotes.json` are generated from the same list). All of them are listed in `quotes.json` beside this file and were checked with `node tools/eval/sources.mjs --quotes ... --tools ...`. The tool files are in `tools/`. Findings I could not confirm are marked **UNCONFIRMED**; where only a non-original site said it, **SECONDARY**. My own readings are marked "My reading" and are not quotes. Quotes are whitespace-collapsed copies of the tool text, so hyphenation breaks and symbols that came through the page-to-text step (for example "follow- ing", "H ₂ SO ₄") are as the tool returned them.

Built-course ground this must not teach again: all of Foundational maths, all of Algebra (including Exponentials and logarithms), Calculus fundamentals, Vectors, Differential equations, Matrices, Linear algebra, Statistics for engineers, AC circuits, Electronics and power electronics (the charger), Design and verification, Motors, HV Subsea Cable Testing, Mechanics and materials, and Heat and fluids (gases, flow). The sibling course Insulated systems and earth faults owns insulated DC systems and earth detection; this course points at it and stops.

**Core sources (read these first; the rest back them up):** Battery University BU-201, BU-403, BU-404, BU-903, BU-803a, BU-804 to 804c, BU-905; EnerSys vented-cell manual (OPzS/OGi); GNB/Exide flooded manual 93.10; Hoppecke vented and VRLA manual; HSE INDG139; the Megger battery testing guide (summarising IEEE 450 and 1188); the Vertiv/Battcon short-circuit paper; MSN 1860, MIN 654 and the MCA Marine Electro-Technology syllabus; the Skills England Marine electrician standard (ST0808); Victron's Peukert page; OpenStax Chemistry 2e 17.5; Englehardt and Beichner (2004) and the RSC electrochemistry misconceptions article. About 90 pages were quoted in all, for cross-checks and contrasts.

---


## 1. Benchmark: Brilliant (if any course on cells is reachable), and Battery University (Cadex)

Searched for a Brilliant chemistry or electricity course that covers cells. None of the reachable Brilliant pages covers cells, electrolytes or battery chemistry. Brilliant's own science listing names four topics, the one nearest to this course is **Circuits** (31 lessons, 7 levels), and its lesson list has no cell, battery or state-of-charge lesson. The `brilliant.org/courses/chemistry/`, `/courses/electricity-and-magnetism/` and `/courses/scientific-thinking/` addresses all return the generic Topics page, not a course (fetched 27 Oct 2026). So Battery University (Cadex) is the public benchmark for the ground, with Brilliant Circuits as the benchmark for what Dan already has before it (current, voltage, resistance, power).


### 1.1 Brilliant

- **Brilliant lists four science topics: Scientific Thinking, Circuits, Digital Circuits, Quantum Computing (no chemistry, no batteries)**
  - Source: Brilliant | The Smartest Way to Learn Science. https://brilliant.org/science
  - Quote: "Science: Covered topics * Scientific Thinking * Circuits * Digital Circuits * Quantum Computing"
- **Brilliant's educator guide says its science courses cover physics, scientific thinking and real-world applications**
  - Source: What courses are available in Brilliant for Educators? | Brilliant. https://brilliant.org/help/for-educators/what-courses-are-available-in-brilliant-for-educators
  - Quote: "Science courses cover physics, scientific thinking, and real-world applications of scientific principles."
- **Brilliant Circuits is 31 lessons and 334 exercises**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits/
  - Quote: "Explore the physics behind electricity. 31 Lessons 334 Exercises"
- **Brilliant Circuits levels and lessons in order (no cell or battery lesson)**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits/
  - Quote: "Level 1 Circuits Current Loops Short Circuits Choosing Bulbs Splitting Current Level Review ## Level 2 Current The Path of Least Resistance Bulb Brightness Changing Current Different Bulbs Conserving Current Level Review ## Level 3 Voltage Voltage Measuring Voltage Voltage Around Paths Branched Voltage Level Review ## Level 4 Power and Resistance Power and Brightness Deducing Power Resistance Solving for Resistance Level Review ## Level 5 Circuit Analysis Predicting Current Controlling Current Combining Resistance Dividing Resistance Total Resistance Voltage and Resistance ## Level 6 Comparing Power Resistance and Brightness Relative Resistance Sharing Amps and Volts Parallel Volt Shares Power and Bulb Pairs ## Level 7 Analyzing Voltage Subtracting Volts Comparing Points Bulbs with Voltage"
- **Brilliant Circuits description and topics covered**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits/
  - Quote: "Build an intuitive understanding of how electric circuits work, and the underlying concepts of current, voltage, resistance and power. ## Topics covered * Current * Voltage * Resistance * Power * Series and Parallel Circuits"
My reading of where it sits: Brilliant has no cell lesson, so it is not a path for this course. Its Circuits course ends at voltage and resistance with bulbs, which is below what Dan already has (AC circuits, Electronics, Design and verification), so it only confirms what not to re-teach. The first four levels (current loops, current, voltage, power and resistance) are Dan's existing ground.


### 1.2 Battery University (Cadex): the public benchmark

- **Battery University is written as a handbook for non-engineers (so it needs a first-principles and engineering lift for Dan)**
  - Source: BU-107: Comparison Table of Secondary Batteries - Battery University. https://batteryuniversity.com/article/bu-107-comparison-table-of-secondary-batteries
  - Quote: "The material on Battery University is based on the indispensable new 4th edition of " _Batteries in a Portable World - A Handbook on Rechargeable Batteries for Non-Engineers"
- **Battery University "learn" page: the Basics You Should Know group, in order (BU-101 to BU-107)**
  - Source: Learn About Batteries | Battery University. https://batteryuniversity.com/learn
  - Quote: "Basics You Should Know ### Crash Course on Batteries BU-101: When Was the Battery Invented? BU-102: Early Innovators BU-103: Global Battery Markets BU-103a: Battery Breakthroughs: Myth or Fact? BU-104: Getting to Know the Battery BU-104a: Comparing the Battery with Other Power Sources BU-104b: Battery Building Blocks BU-104c: The Octagon Battery – What makes a Battery a Battery BU-105: Battery Definitions and what they mean BU-106: Advantages of Primary Batteries BU-106a: Choices of Primary Batteries BU-107: Comparison Table of Secondary Batteries"
- **Battery University order: basics (107) then battery types (201 to 204), as the sidebar lists them**
  - Source: Battery University | BU-804b: Sulfation and How to Prevent it. https://batteryuniversity.com/article/bu-804b-sulfation-and-how-to-prevent-it
  - Quote: "BU-107: Comparison Table of Secondary Batteries * Battery Types * BU-201: How does the Lead Acid Battery Work? * BU-201a: Absorbent Glass Mat (AGM) * BU-201b: Gel Lead Acid Battery * BU-202: New Lead Acid Systems * BU-203: Nickel-based Batteries * BU-204: How do Lithium Batteries Work?"
- **Battery University order: series, parallel and voltages come before the chemistries are charged (BU-302 to BU-304)**
  - Source: Battery University | BU-803a: Cell Matching and Balancing. https://batteryuniversity.com/article/bu-803a-cell-mismatch-balancing
  - Quote: "BU-302: Series and Parallel Battery Configurations * BU-303: Confusion with Voltages * BU-304: Why are Protection Circuits Needed?"
- **Battery University order: chargers, C-rate, charging lead acid (BU-401 to BU-403)**
  - Source: Battery University | BU-804b: Sulfation and How to Prevent it. https://batteryuniversity.com/article/bu-804b-sulfation-and-how-to-prevent-it
  - Quote: "BU-401: How do Battery Chargers Work? * BU-401a: Fast and Ultra-fast Chargers * BU-402: What Is C-rate? * BU-403: Charging Lead Acid"
- **Battery University charge methods group, with equalising**
  - Source: Learn About Batteries | Battery University. https://batteryuniversity.com/learn
  - Quote: "Charge Methods BU-404: What is Equalizing Charge? BU-405: Charging with a Power Supply"
- **Battery University order: life, capacity loss, cell matching, shorts, electrolyte loss, then the lead acid articles (BU-802 to BU-806)**
  - Source: Battery University | BU-804b: Sulfation and How to Prevent it. https://batteryuniversity.com/article/bu-804b-sulfation-and-how-to-prevent-it
  - Quote: "BU-803a: Cell Matching and Balancing * BU-803b: What causes Cells to Short? * BU-803c: Loss of Electrolyte * Lead Acid * BU-804: How to Prolong Lead-acid Batteries * BU-804a: Corrosion, Shedding and Internal Short * BU-804b: Sulfation and How to Prevent it * BU-804c: Acid Stratification and Surface Charge * BU-805: Additives to Boost Flooded Lead Acid * BU-806: Tracking Battery Capacity and Resistance as part of Aging"
- **Battery University order: state-of-charge, capacity, testing lead acid (BU-903 to BU-905)**
  - Source: Battery University | BU-804b: Sulfation and How to Prevent it. https://batteryuniversity.com/article/bu-804b-sulfation-and-how-to-prevent-it
  - Quote: "BU-903: How to Measure State-of-charge * BU-904: How to Measure Capacity * BU-905: Testing Lead Acid Batteries"
- **Battery University battery testing and monitoring group**
  - Source: Learn About Batteries | Battery University. https://batteryuniversity.com/learn
  - Quote: "Battery Testing and Monitoring BU-907c: Cloud Analytics in Batteries BU-908: Battery Management System (BMS) BU-909: Battery Test Equipment"
- **Battery University how-to-prolong-life group (general)**
  - Source: Learn About Batteries | Battery University. https://batteryuniversity.com/learn
  - Quote: "How To Prolong Battery Life #### General BU-801: Setting Battery Performance Standards BU-801a: How to Rate Battery Runtime BU-801b: How to Define Battery Life BU-802: What Causes Capacity Loss?"
My count: Battery University's lead-acid ground alone is BU-201 (how it works), 201a (AGM), 201b (gel), 202 (new lead acid), 302 and 303 (series, parallel, voltages), 402 and 403 (C-rate, charging), 404 (equalising), 502 (cold), 803a (cell balancing), 804 to 804c (prolonging, corrosion, sulfation, stratification), 902, 903, 905 (resistance, state of charge, testing). That is about 18 articles, each short, for a reader who has no electrical background. It has no ventilation sizing, no short-circuit current, and no trending, which are the parts Dan needs beyond it.


## 2. Other courses' order for the same ground


### 2.1 OpenStax Chemistry 2e, chapter 17 Electrochemistry

- **OpenStax Chemistry 2e chapter 17 outline, in order (batteries are section 17.5, after galvanic cells and cell potentials)**
  - Source: Ch. 17 Introduction - Chemistry 2e | OpenStax. https://openstax.org/books/chemistry-2e/pages/17-introduction
  - Quote: "17.1 Review of Redox Chemistry * 17.2 Galvanic Cells * 17.3 Electrode and Cell Potentials * 17.4 Potential, Free Energy, and Equilibrium * 17.5 Batteries and Fuel Cells * 17.6 Corrosion * 17.7 Electrolysis"
- **OpenStax: each lead acid cell makes 2 V, six in series make a 12 V battery**
  - Source: 17.5 Batteries and Fuel Cells - Chemistry 2e | OpenStax. https://openstax.org/books/chemistry-2e/pages/17-5-batteries-and-fuel-cells
  - Quote: "Each cell produces 2 V, so six cells are connected in series to produce a 12-V car battery."
- **OpenStax: lead acid is heavy, holds a caustic liquid electrolyte, and is still chosen for current**
  - Source: 17.5 Batteries and Fuel Cells - Chemistry 2e | OpenStax. https://openstax.org/books/chemistry-2e/pages/17-5-batteries-and-fuel-cells
  - Quote: "Lead acid batteries are heavy and contain a caustic liquid electrolyte"
- **OpenStax: NiCd construction and potassium hydroxide**
  - Source: 17.5 Batteries and Fuel Cells - Chemistry 2e | OpenStax. https://openstax.org/books/chemistry-2e/pages/17-5-batteries-and-fuel-cells
  - Quote: "consist of a nickel-plated cathode, cadmium-plated anode, and a potassium hydroxide electrode."
- **OpenStax: why lithium ion batteries are popular (about 3.7 V, near-constant voltage)**
  - Source: 17.5 Batteries and Fuel Cells - Chemistry 2e | OpenStax. https://openstax.org/books/chemistry-2e/pages/17-5-batteries-and-fuel-cells
  - Quote: "Lithium batteries are popular because they can provide a large amount current, are lighter than comparable batteries of other types, produce a nearly constant voltage as they discharge, and only slowly lose their charge when stored."
My reading: OpenStax gives the redox model (oxidation, reduction, cell potential) and a paragraph per battery. It has no state of charge, no charging method, no rate effect and no faults, which is why it works as the "why 2 V" source for lesson 1 only.


### 2.2 Manufacturers' handbooks and installation manuals for stationary lead-acid batteries

Four makers' public manuals were read: EnerSys (vented OPzS/OGi and the VRLA SBS XL sheet), GNB/Exide (flooded classic, section 93.10), GS Yuasa (CS/HS vented) and Hoppecke (vented and VRLA manual). Their contents run in one order, which is a ready-made course order: safety, storage and installation (ventilation, connecting cells), commissioning charge, float operation, boost and equalising, discharge limits, specific gravity, maintenance checks and records, troubleshooting.

- **GNB/Exide flooded manual, contents order: installation (location, temperature, ventilation, placing and connecting cells)**
  - Source: 93.10. https://www.exidegroup.com/eu/sites/default/files/2017-01/Section%2093_10%202014-08%20GNB%20Flooded%20Classic%20Installation%20and%20Operation%20Manual%20Section_4.pdf
  - Quote: "7.0 Installation . . . . . . . . . . . . . . . . . . . . . . . . . . .3 7.1 Battery location . . . . . . . . . . . . . . . . . . . . . . .3 7.2 Temperature . . . . . . . . . . . . . . . . . . . . . . . . . .3 7.3 Temperature variation . . . . . . . . . . . . . . . . . .3 7.4 ventilation . . . . . . . . . . . . . . . . . . . . . . . . . . .3 7.5 Placement of Cells . . . . . . . . . . . . . . . . . . . . .3 7.6 Connecting Cells"
- **GNB/Exide flooded manual, contents order: operation (float method, float voltages, voltmeter calibration, cycle method, recharge)**
  - Source: 93.10. https://www.exidegroup.com/eu/sites/default/files/2017-01/Section%2093_10%202014-08%20GNB%20Flooded%20Classic%20Installation%20and%20Operation%20Manual%20Section_4.pdf
  - Quote: "9.0 operation . . . . . . . . . . . . . . . . . . . . . . . . . . . .7 9.1 Floating Charge Method . . . . . . . . . . . . . . . .7 9.2 Float Charge-Float voltages . . . . . . . . . . . . .7 9.3 voltmeter Calibration . . . . . . . . . . . . . . . . . . .8 9.4 Cycle Method of operation . . . . . . . . . . . . . .8 9.5 recharge"
- **GNB/Exide flooded manual, contents order: specific gravity (hydrometer, temperature correction, level correction, range)**
  - Source: 93.10. https://www.exidegroup.com/eu/sites/default/files/2017-01/Section%2093_10%202014-08%20GNB%20Flooded%20Classic%20Installation%20and%20Operation%20Manual%20Section_4.pdf
  - Quote: "11.0 Specific Gravity . . . . . . . . . . . . . . . . . . . . . . .9 11.1 hydrometer readings . . . . . . . . . . . . . . . . .10 11.2 Correction for Temperature . . . . . . . . . . . . .10 11.3 Correction for Electrolyte level . . . . . . . . . .10 11.4 Specific Gravity range"
- **GNB/Exide: hydrogen and oxygen are made in every charging mode, by electrolysis of the water**
  - Source: 93.10. https://www.exidegroup.com/eu/sites/default/files/2017-01/Section%2093_10%202014-08%20GNB%20Flooded%20Classic%20Installation%20and%20Operation%20Manual%20Section_4.pdf
  - Quote: "In the operation of lead-acid battery whether it be on initial charge, float charge, equalizing charge or recharge follow- ing a discharge, hydrogen and oxygen gases are produced. This results from electrolysis of the water portion of the elec- trolyte by the charging current."
- **EnerSys vented manual: float voltage per cell and how the charger voltage is set**
  - Source: Flooded Stationary Lead Acid Batteries IOM. https://www.enersys.com/492013/globalassets/documents/product-documentation/powersafe/opzs/amer/amer-en-iom-ps-flooded-0223.pdf
  - Quote: "The recommended float / charge voltage is 2.23 V/cell remove per cell at 20°C (68°F) depending on the specific type (see table 5). The charger voltage amounts to Uflo per cell x no. of cells (tolerance ± 1 %)."
- **EnerSys vented manual: float voltage is corrected for temperature (single values)**
  - Source: Flooded Stationary Lead Acid Batteries IOM. https://www.enersys.com/492013/globalassets/documents/product-documentation/powersafe/opzs/amer/amer-en-iom-ps-flooded-0223.pdf
  - Quote: "If the average battery temperature exceeds the recommended operating temperature range of +10°C (50°F) to +30°C (86°F), the float charge voltage shall be reduced by (Tcell - 30) x 0.003V/ cell when the temperature exceeds +30°C (86°F) (but not less than 2.18V/c) and shall be increased by (10 – Tcell) x 0.003V/cell when the temperature is less +10°C (50°F)."
- **EnerSys vented manual: individual cell voltages are allowed to differ from the average**
  - Source: Flooded Stationary Lead Acid Batteries IOM. https://www.enersys.com/492013/globalassets/documents/product-documentation/powersafe/opzs/amer/amer-en-iom-ps-flooded-0223.pdf
  - Quote: "Deviations of individual cell voltages of –0.05 to +0.10 V/c may be observed. However the total voltage of the battery shall be within the limits stated above."
- **EnerSys vented manual: gassing voltage and the charging current limit above it**
  - Source: Flooded Stationary Lead Acid Batteries IOM. https://www.enersys.com/492013/globalassets/documents/product-documentation/powersafe/opzs/amer/amer-en-iom-ps-flooded-0223.pdf
  - Quote: "After reaching the gassing voltage of 2.40 V/c a current limit of 2.5 to 5 A/100 Ah is recommended"
- **EnerSys vented manual: boost charge is a raised voltage with a current limit, and must be switched back to float**
  - Source: Flooded Stationary Lead Acid Batteries IOM. https://www.enersys.com/492013/globalassets/documents/product-documentation/powersafe/opzs/amer/amer-en-iom-ps-flooded-0223.pdf
  - Quote: "To reduce the recharge time the battery may be recharged at 2.33 – 2.40 V/cell with a current limited to 4 x I10. Boost charging must be switched to float charging when the fully charged state is reached."
- **EnerSys vented manual: an equalising charge is needed after a deep discharge or inadequate recharging**
  - Source: Flooded Stationary Lead Acid Batteries IOM. https://www.enersys.com/492013/globalassets/documents/product-documentation/powersafe/opzs/amer/amer-en-iom-ps-flooded-0223.pdf
  - Quote: "After a deep discharge or after inadequate recharging, an equalizing charge is necessary."
- **EnerSys vented manual: the end of an equalising charge**
  - Source: Flooded Stationary Lead Acid Batteries IOM. https://www.enersys.com/492013/globalassets/documents/product-documentation/powersafe/opzs/amer/amer-en-iom-ps-flooded-0223.pdf
  - Quote: "The end of equalizing charge is reached when the S.G. of the electrolyte and the cell voltages have not risen for a period of 2 hours."
- **EnerSys vented manual: heat shortens life, cold cuts capacity**
  - Source: Flooded Stationary Lead Acid Batteries IOM. https://www.enersys.com/492013/globalassets/documents/product-documentation/powersafe/opzs/amer/amer-en-iom-ps-flooded-0223.pdf
  - Quote: "Higher temperatures reduce the operational life. Lower temperatures reduce the available capacity."
- **EnerSys vented manual: a worked capacity-and-temperature example (200 Ah at 20 C gives 182 Ah at 10 C)**
  - Source: Flooded Stationary Lead Acid Batteries IOM. https://www.enersys.com/492013/globalassets/documents/product-documentation/powersafe/opzs/amer/amer-en-iom-ps-flooded-0223.pdf
  - Quote: "Example: A battery with a capacity of 200 Ah at 20°C (68°F) for a 5 hour discharge will have a capacity of 182 Ah when discharged at 10°C (50°F) (200 x 0.91)."
- **EnerSys vented manual: specific gravity must be corrected for temperature (per degree C)**
  - Source: Flooded Stationary Lead Acid Batteries IOM. https://www.enersys.com/492013/globalassets/documents/product-documentation/powersafe/opzs/amer/amer-en-iom-ps-flooded-0223.pdf
  - Quote: "Electrolyte S.G. varies with temperature. If temperature is above or below 20°C (68°F), specific gravity readings must be corrected. The temperature correction factor for S.G. is –0.0007 per °C."
- **EnerSys vented manual: parallel strings need equal cable resistance and a limit of four strings**
  - Source: Flooded Stationary Lead Acid Batteries IOM. https://www.enersys.com/492013/globalassets/documents/product-documentation/powersafe/opzs/amer/amer-en-iom-ps-flooded-0223.pdf
  - Quote: "Vented cells may be connected in parallel to give higher current capability. In the case of parallel connected strings use batteries of the same capacity, design and age only with a maximum of 4 parallel strings. The resistance of the cables in each string must be the same"
- **EnerSys vented manual: readings and the logbook (6 monthly pilot cell, yearly all cells)**
  - Source: Flooded Stationary Lead Acid Batteries IOM. https://www.enersys.com/492013/globalassets/documents/product-documentation/powersafe/opzs/amer/amer-en-iom-ps-flooded-0223.pdf
  - Quote: "Every 6 months, check the total voltage at the battery terminals. Also check the voltage, S.G., and the temperature of pilot cells and record the room temperature. Once a year, in addition to the above, take readings of individual voltages and S.G. of the electrolyte. Measure the S.G. either before topping up water or after boost charge. Keep a logbook in which the measured values can be noted"
- **EnerSys VRLA sheet: refresh charge when open circuit voltage nears 2.10 V per cell**
  - Source: Instruction Sheet. https://www.enersys.com/493bb4/globalassets/documents/product-documentation/powersafe/sbs-xl/amer/am-sbsxl-is-aa_0619.pdf
  - Quote: "Batteries must be given a refresh charge when the OCV approaches the equivalent of 2.10 Volts per cell (Vpc)"
- **GS Yuasa vented CS/HS: constant voltage charge, equalising at least every six months**
  - Source: CS HS SS PS SERIES. https://www.gs-yuasa.com/en/products/pdf/CS_HS_Vented.pdf
  - Quote: "Please do the equalizing charge once every six months at least. Charge Type Constant voltage charge"
- **Hoppecke manual: the maker's ventilation method dilutes hydrogen to 4 per cent in air from the gassing current**
  - Source: Table of contents. https://www.hoppecke.com/fileadmin/Redakteur/Hoppecke-Main/Products-Import/vl_manual_en.pdf
  - Quote: "Air volume flow required to dilute the produced hydrogen H2 to max. 4% in the air:"
- **Hoppecke manual: electrolysis splits the water of the electrolyte into hydrogen and oxygen on charge**
  - Source: Table of contents. https://www.hoppecke.com/fileadmin/Redakteur/Hoppecke-Main/Products-Import/vl_manual_en.pdf
  - Quote: "During the charging process, electrolysis decomposes the water of the electrolyte into the gases 2H2 + O2."
- **Hoppecke manual: the indicative gassing-current values are an extract of IEC 62485-2**
  - Source: Table of contents. https://www.hoppecke.com/fileadmin/Redakteur/Hoppecke-Main/Products-Import/vl_manual_en.pdf
  - Quote: "Table 6.1-2 - Indicative values for current (extract from IEC 62485-2)"
- **Hoppecke manual: limit values of charging current above the gassing voltage of 2.40 V per cell**
  - Source: Table of contents. https://www.hoppecke.com/fileadmin/Redakteur/Hoppecke-Main/Products-Import/vl_manual_en.pdf
  - Quote: "Limit values of the charging currents above the gassing voltage of 2.40 V/cell per 100 Ah."
**Not found as readable text:** the gassing-current factor tables (Hoppecke's Table 6.1-2, which it says is an extract of IEC 62485-2) came back garbled, so only the method is quoted here, on purpose, and no table value is used.


### 2.3 BS EN IEC 62485-2 and IEEE 450, as titled public descriptions

- **IEC 62485-2 scope: stationary batteries to 1 500 V DC, hazards from electricity, gas emission and electrolyte**
  - Source: IEC 62485-2:2010 | IEC. https://webstore.iec.ch/en/publication/7091
  - Quote: "IEC 62485-2:2010 applies to stationary secondary batteries and battery installations with a maximum voltage of DC 1 500 V (nominal) and describes the principal measures for protections against hazards generated from: \- electricity, \- gas emission, \- electrolyte."
- **IEC 62485-2 covers lead-acid and NiCd/NiMH batteries**
  - Source: IEC 62485-2:2010 | IEC. https://webstore.iec.ch/en/publication/7091
  - Quote: "It covers lead-acid and NiCd/NiMH batteries."
- **BS EN IEC 62485-2:2018 supersedes EN 50272-2:2001 (the standard HSE's ventilation guidance names)**
  - Source: BSI Standards Publication. https://webstore.ansi.org/preview-pages/BSI/preview_30369837.pdf
  - Quote: "Supersedes EN 50272-2:2001"
- **BS EN IEC 62485-2 title: Safety requirements for secondary batteries and battery installations, Part 2 Stationary batteries**
  - Source: BSI Standards Publication. https://webstore.ansi.org/preview-pages/BSI/preview_30369837.pdf
  - Quote: "Safety requirements for secondary batteries and battery installations ### Part 2: Stationary batteries (IEC 62485-2:2010)"
- **HSE names the earlier edition of the standard (BS EN 50272-2) for the hazardous-zone calculation**
  - Source: Using electric storage batteries safely INDG139. https://www.hse.gov.uk/PUBNS/indg139.pdf
  - Quote: "Guidance on how to calculate the extent of the hazardous zone is available in BS EN 50272-2: 2001"
- **IEEE 450 title and what it recommends**
  - Source: IEEE SA - IEEE 450-2020. https://standards.ieee.org/ieee/450/6772
  - Quote: "This document provides recommended maintenance, test schedules, testing procedures, and analysis that can be used to optimize the life and performance of permanently installed, vented lead-acid batteries in stationary applications."
- **IEEE 450 applies to full-float stationary applications**
  - Source: IEEE SA - IEEE 450-2020. https://standards.ieee.org/ieee/450/6772
  - Quote: "This recommended practice is applicable to full-float stationary applications where a charger maintains the battery fully charged and supplies the dc loads."
- **IEEE 450-2020 full title**
  - Source: IEEE SA - IEEE 450-2020. https://standards.ieee.org/ieee/450/6772
  - Quote: "IEEE Recommended Practice for Maintenance, Testing, and Replacement of Vented Lead-Acid Batteries for Stationary Applications"
- **IEEE 1188 is the valve-regulated companion practice**
  - Source: Battery Testing Guide. https://res.cloudinary.com/iwh/image/upload/q_auto,g_center/assets/1/7/Megger_Battery_Testing_Guide.pdf
  - Quote: "IEEE 1188, “IEEE Recommended Practice for Maintenance, Testing and Replacement of Valve-Regulated Lead- Acid Batteries for Stationary Applications” defines the recommended tests and frequency."
- **IEEE 450 inspections include unintentional battery grounds (the hand-off to Insulated systems and earth faults)**
  - Source: Battery Testing Guide. https://res.cloudinary.com/iwh/image/upload/q_auto,g_center/assets/1/7/Megger_Battery_Testing_Guide.pdf
  - Quote: "unintentional battery grounds etc."
Single values only are used from the standards. IEC 62485-2 and IEEE 450 are paywalled; only their public titles and scope statements are quoted, and the working values come from the manufacturers' manuals and HSE, which apply them.


### 2.4 HSE guidance on battery charging and hydrogen

- **HSE INDG139: two kinds of rechargeable battery, valve-regulated and vented**
  - Source: Using electric storage batteries safely INDG139. https://www.hse.gov.uk/PUBNS/indg139.pdf
  - Quote: "There are two different types of lead/acid and alkaline rechargeable batteries: valve-regulated (‘maintenance-free’) and vented."
- **HSE INDG139: gas is made faster near full charge, and over-charging makes a lot**
  - Source: Using electric storage batteries safely INDG139. https://www.hse.gov.uk/PUBNS/indg139.pdf
  - Quote: "Hydrogen and oxygen are produced more quickly as the battery gets close to being fully charged. If you continue charging after the battery is fully charged, a lot of gas will be produced, greatly increasing the risk from explosion."
- **HSE INDG139: the 2:1 mixture of hydrogen and oxygen**
  - Source: Using electric storage batteries safely INDG139. https://www.hse.gov.uk/PUBNS/indg139.pdf
  - Quote: "The mixture of two parts hydrogen to one part oxygen produced is perfect for an explosion."
- **HSE INDG139: flammable range of hydrogen in air, 4 per cent to 75 per cent**
  - Source: Using electric storage batteries safely INDG139. https://www.hse.gov.uk/PUBNS/indg139.pdf
  - Quote: "Mixtures with air containing from 4% hydrogen (lower explosion limit – LEL) to 75% hydrogen (upper explosion limit – UEL) will readily ignite and explode."
- **HSE INDG139: design limits, 0.4 per cent in workrooms and 1 per cent in enclosures people do not enter**
  - Source: Using electric storage batteries safely INDG139. https://www.hse.gov.uk/PUBNS/indg139.pdf
  - Quote: "In charging areas that people enter (workrooms) the concentration of hydrogen should not exceed 0.4% vol/vol (10% of the LEL). When charging takes place in an enclosure that people do not enter, the concentration of hydrogen should not exceed 1% vol/vol (25% of the LEL)."
- **HSE INDG139: the natural-ventilation opening area from cell count and overcharging current**
  - Source: Using electric storage batteries safely INDG139. https://www.hse.gov.uk/PUBNS/indg139.pdf
  - Quote: "Minimum area of inlet/outlet needed = 0.3 x N x I x S cm2 Where N = number of cells in the battery(ies) I = the overcharging current (amps) S = the appropriate dilution factor; 10 for workrooms, 4 for enclosures"
- **HSE INDG139: the worked example (four batteries of six cells, 20 A, workshop) gives 1440 cm2**
  - Source: Using electric storage batteries safely INDG139. https://www.hse.gov.uk/PUBNS/indg139.pdf
  - Quote: "Four batteries, each containing six cells, are located in a charging area (workshop) that people can enter. The batteries could receive an overcharging current of 20 amps. What is the minimum size of the ventilation openings needed to prevent a dangerous concentration of hydrogen forming in the charging area? Calculation: Minimum area of inlet/outlet needed = 0.3 x N x I x S cm ² In this example: N = number of cells in the battery(ies) = 4 x 6 = 24 I = the overcharging current (amps) = 20 S = the dilution factor for workrooms = 10 Substituting the values for the example into the equation: Minimum area of inlet/outlet needed = 0.3 x 24 x 20 x 10 cm ² 2 = 1440 cm"
- **HSE INDG139: use the maximum current the charger could supply in a fault**
  - Source: Using electric storage batteries safely INDG139. https://www.hse.gov.uk/PUBNS/indg139.pdf
  - Quote: "the maximum current likely to be supplied by the charger during malfunction should be used so as to include a suitable safety margin."
- **HSE INDG139: leave the battery to stand 20 minutes after charging**
  - Source: Using electric storage batteries safely INDG139. https://www.hse.gov.uk/PUBNS/indg139.pdf
  - Quote: "Leave the battery to stand for at least 20 minutes after charging to allow any flammable gases to disperse."
- **HSE COSHH sheet SR18: general ventilation of 5 to 10 air changes an hour for charging areas**
  - Source: COSHH SR18. https://www.hse.gov.uk/pubns/guidance/sr18.pdf
  - Quote: "Keep the workplace well ventilated; 5­10 air changes per hour, with a through draught."
- **HSE INDG139: electrolyte is corrosive and gas mist carries sulphuric acid**
  - Source: Using electric storage batteries safely INDG139. https://www.hse.gov.uk/PUBNS/indg139.pdf
  - Quote: "These very corrosive chemicals can permanently damage the eyes and produce serious chemical burns to the skin."

## 3. What a marine electrical engineer actually uses of this topic


### 3.1 STCW Code, Table A-III/6 (electro-technical officer) and Table A-III/1 (officer in charge of an engineering watch)

The Table A-III/6 text that came back (the edumaritime copy of the IMO table, SECONDARY because it is a re-host of the IMO text) never names batteries in column 2. The battery lines come from the UK MCA guidance that maps onto the table (3.2). What the table does require is the knowledge headings and the "DC electrical systems" line under Maintenance and repair, which batteries sit inside.

- **A-III/6 column 2 knowledge headings under Monitor the operation of electrical, electronic and control systems (SECONDARY: re-host of the IMO table)**
  - Source: STCW Code - Table A-III/6. https://www.edumaritime.net/images/docs/stcw-table-a-iii-6.pdf
  - Quote: "Electro-technology and electrical machines theory Fundamentals of electronics and power electronics Electrical power distribution boards and electrical equipment"
- **A-III/6 Maintenance and repair of electrical and electronic equipment: safe isolation, and DC electrical systems (text as the MCA reproduces it in MIN 654)**
  - Source: M Notice Template - MSF 5011. https://s3.amazonaws.com/thegovernmentsays-files/attachments/180/1801863-1-MIN_654_Engineering_and_Electro-technical_Officer_Oral_Exam_Syllabus_-_Amendment_1.pdf
  - Quote: "Safety requirements for working on shipboard electrical systems, including the safe isolation of electrical equipment required before personnel are permitted to work on such equipment Maintenance and repair of electrical system equipment, switchboards, electric motors, generator and DC electrical systems and equipment"
- **A-III/6 criteria for evaluating competence: safety measures, tool and test-equipment selection, interpreting results**
  - Source: M Notice Template - MSF 5011. https://s3.amazonaws.com/thegovernmentsays-files/attachments/180/1801863-1-MIN_654_Engineering_and_Electro-technical_Officer_Oral_Exam_Syllabus_-_Amendment_1.pdf
  - Quote: "Safety measures for working are appropriate Selection and use of hand tools, measuring instruments, and testing equipment are appropriate and interpretation of results is accurate"
- **A-III/1 (officer in charge of an engineering watch): operate electrical, electronic and control systems lists generators, distribution, motors, HV; no battery line was found (UNCONFIRMED that A-III/1 names batteries)**
  - Source: imorules.com. https://www.imorules.com/Chunk2062946929.html
  - Quote: "Basic configuration and operation principles of the following electrical, electronic and control equipment: * .1 electrical equipment: * .a generator and distribution systems * .b preparing, starting, paralleling and changing over generators * .c electrical motors including starting methodologies * .d high-voltage installations"

### 3.2 MCA (UK) electro-technical officer and engineer officer syllabus lines

- **MSN 1860 (ETO requirements): battery room safety, safe maintenance and working procedures on batteries, PPE and tools**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "The Battery room safety, safe maintenance and working procedures on batteries, appropriate PPE and tools."
- **MSN 1860, Topic 13 Emergency power supply: emergency switchboard and supply to essential and lighting circuits**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "Emergency switchboard, emergency power supply to the essential equipment and lighting circuits and pertaining regulations"
- **MSN 1860, Topic 13: battery bank and UPS maintenance and testing procedures**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "Battery bank and UPS – maintenance and testing procedures."
- **MSN 1860 also lists DC electrical systems under maintenance and repair, and safe isolation**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "Maintenance and repair of electrical system equipment, switchboards, electric motors, generators and DC electrical systems and equipment"
- **MIN 654 (oral exam syllabus for engineers and ETOs): emergency battery room and its hazards**
  - Source: M Notice Template - MSF 5011. https://s3.amazonaws.com/thegovernmentsays-files/attachments/180/1801863-1-MIN_654_Engineering_and_Electro-technical_Officer_Oral_Exam_Syllabus_-_Amendment_1.pdf
  - Quote: "Emergency battery room and associated hazards"
- **MIN 654: battery maintenance, dangers and precautions**
  - Source: M Notice Template - MSF 5011. https://s3.amazonaws.com/thegovernmentsays-files/attachments/180/1801863-1-MIN_654_Engineering_and_Electro-technical_Officer_Oral_Exam_Syllabus_-_Amendment_1.pdf
  - Quote: "Battery maintenance and dangers and precautions"
- **MIN 654: communication battery and back-up checks and records**
  - Source: M Notice Template - MSF 5011. https://s3.amazonaws.com/thegovernmentsays-files/attachments/180/1801863-1-MIN_654_Engineering_and_Electro-technical_Officer_Oral_Exam_Syllabus_-_Amendment_1.pdf
  - Quote: "Emergency networks ones Communication battery and back up checks, records"
- **MIN 654: earth faults, Megger readings and arc flash sit beside the battery lines (hand-off to Insulated systems and earth faults)**
  - Source: M Notice Template - MSF 5011. https://s3.amazonaws.com/thegovernmentsays-files/attachments/180/1801863-1-MIN_654_Engineering_and_Electro-technical_Officer_Oral_Exam_Syllabus_-_Amendment_1.pdf
  - Quote: "Understanding of Earth faults, MEGGER readings, Dangers of Electric arc flash"

#### Marine Electro-Technology written syllabus (Second Engineer, Electrotechnology): the lines on cells

- **MCA Second Engineer Marine Electro-Technology: draw and label the principal parts of a lead acid cell**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Draws and labels the principal parts of a lead acid cell."
- **MCA syllabus: describe charge and discharge on the components of the cell (without chemical formulae)**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Describes (without using chemical formulae) the action of charge and discharge on the components of the cell."
- **MCA syllabus: state of charge of a lead acid cell by hydrometer**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Explains how the state of charge of a lead acid cell may be measured using a hydrometer."
- **MCA syllabus: alkaline cell, nickel iron or nickel cadmium**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Draws and labels the principal parts of an alkaline cell, Nickel iron or nickel cadmium."
- **MCA syllabus: compare lead acid and alkaline cells on voltage, poor conditions, retention, temperature, strength, weight, cost**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Compares lead acid and alkaline cells on the basis of: 1. voltage per cell; 2. performance under poor conditions of charge/discharge; 3. retention of charge; 4. effect of temperature; 5. mechanical strength; 6. weight; 7. cost."
- **MCA syllabus: capacity is measured in ampere hours at a given rate**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "States that the capacity of a battery is measured in ampere hours at a given rate."
- **MCA syllabus: efficiency of batteries in ampere-hours and watt-hours**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Solves problems on efficiency of batteries in terms of ampere-hours and watt-hours."
- **MCA syllabus: batteries in series and parallel with internal resistance and load current**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Solves problems involving batteries in series and in parallel combinations including internal resistance and current in a connected load."
- **MCA syllabus: draw a simple charging circuit from a DC supply**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Draws a simple charging circuit from a dc supply."
- **MCA syllabus: measure state of charge before and after a charging procedure**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Measures the state of charge of a battery before and after carrying out the charging procedure."
- **MCA General Engineering Science II, 2.4 Secondary cells: chemical changes on charge and discharge, emf in series and parallel, capacity**
  - Source: General Engineering Science II Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-ii-written-examination-syllabuses
  - Quote: "Describe the chemical changes during the charging and discharging of a lead acid cell, explaining how the emf is measured in single, series and parallel configurations, state how the capacity is measured."
- **MCA General Engineering Science II, 2.4: primary versus secondary cells**
  - Source: General Engineering Science II Written Examination Syllabuses - GOV.UK. https://www.gov.uk/government/publications/general-engineering-science-written-examination-syllabuses/general-engineering-science-ii-written-examination-syllabuses
  - Quote: "Explain the difference between primary and secondary cells."
- **MCA cadet syllabus review keeps the DC circuits outcome (series and parallel resistive DC circuits) that cell problems build on**
  - Source: 07a. Marine Engineering - Electro-Technology - GOV.UK. https://www.gov.uk/government/consultations/cadet-training-modernisation-programmesyllabus-review-fourth-group-of-consultation-templates/07a-marine-engineering-electro-technology
  - Quote: "Outcome 2: Solve problems on DC circuits with resistances in parallel and series"

#### SOLAS (as the MCA enforces it): the emergency source of power

- **SOLAS II-1 reg 43: an emergency accumulator battery must carry the emergency load without recharging, within 12 per cent of nominal voltage**
  - Source: imorules.com. https://imorules.com/GUID-C048F800-5412-40B3-ACCD-C562D4E4F719.html
  - Quote: "carrying the emergency electrical load without recharging while maintaining the voltage of the battery throughout the discharge period within 12% above or below its nominal voltage"
- **SOLAS II-1: the transitional source of emergency power is an accumulator battery**
  - Source: imorules.com. https://imorules.com/GUID-C048F800-5412-40B3-ACCD-C562D4E4F719.html
  - Quote: "power required by paragraph 3.1.3 shall consist of an accumulator battery suitably located for use in an emergency"

### 3.3 Public apprenticeship standards (Institute for Apprenticeships / Skills England)

- **Marine electrician (ST0808) duty 12: monitor marine batteries, charging and ancillary ac or dc charging systems**
  - Source: Marine electrician / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0808-v1-1
  - Quote: "Duty 12 Monitor marine batteries, charging and ancillary alternating current (ac) or direct current (dc) supply charging systems."
- **Marine electrician skill S22: check, test and diagnose battery condition and record results**
  - Source: Marine electrician / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0808-v1-1
  - Quote: "S22 : Check, test, and diagnose battery condition and alternating current (ac) power systems and record results."
- **Marine electrician knowledge K10: the mathematics and formulae that underpin marine electrical work**
  - Source: Marine electrician / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0808-v1-1
  - Quote: "The mathematical techniques, formulae, and calculations that underpin marine electrical and electronic work."
- **Maritime mechanical and electrical mechanic (ST0276): ships and submarines, Royal Navy and Merchant Navy (no battery line found: UNCONFIRMED)**
  - Source: Maritime mechanical and electrical mechanic / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0276-v1-1
  - Quote: "Undertaking the testing, fault diagnosis and maintenance of electrical, mechanical and fluid power equipment on ships and submarines."
- **Maritime mechanical and electrical mechanic: employed in the Royal Navy and Merchant Navy**
  - Source: Maritime mechanical and electrical mechanic / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0276-v1-1
  - Quote: "Maritime mechanical and electrical mechanic are employed in the Royal Navy and Merchant Navy."
- **Maritime mechanical and electrical mechanic: confined spaces entry skill**
  - Source: Maritime mechanical and electrical mechanic / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0276-v1-1
  - Quote: "Comply with correct entry procedures and precautions for confined spaces."
- **Maritime electrical fitter (ST1403) was written with the Royal Navy among its employers**
  - Source: Maritime electrical fitter / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st1403-v1-1
  - Quote: "Employers involved in creating the standard: Babcock International Group, BAE Systems, Capita, Ministry of Defence (MOD), Royal Navy, Cammell Laird"
- **Engineering technician (ST0457) option 5, Maritime electrical fitter: electrical and data systems on maritime vessels, including power generation and distribution (no battery line)**
  - Source: Engineering technician / Skills England. https://www.instituteforapprenticeships.org/apprenticeship-standards/engineering-technician-v1-4
  - Quote: "The Electrical Fitter utilises engineering drawings, data and documentation in order to undertake the manufacture, installation, testing, commissioning, fault diagnosis, maintenance, overhaul and removal of electrical and data systems on maritime vessels."
- **Engineering technician option 5: knowledge of maritime electrical and electronic principles and test equipment**
  - Source: Engineering technician / Skills England. https://www.instituteforapprenticeships.org/apprenticeship-standards/engineering-technician-v1-4
  - Quote: "understand maritime electrical/electronic engineering technology and principles in the design, equipment build, operation and maintenance of maritime vessels."
- **Marine electrician occupation summary: ac and dc distribution and loadings, and power generation**
  - Source: Marine electrician / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0808-v1-1
  - Quote: "including alternating current (ac) and direct currents (dc) distribution and loadings and power generation"
My reading: only one public standard (Marine electrician, ST0808) names batteries, and it names them as a duty (monitor batteries and charging) with a skill (check, test and diagnose battery condition and record results). That is exactly the action list the course should end on: see, test, record, trend. The Royal Navy-linked standards (ST0276, ST1403, ST0457 option 5) name power generation and distribution, DC systems and test equipment but no battery line (UNCONFIRMED whether their full knowledge lists name batteries; only the summary and the profile were returned).


### 3.4 Pearson BTEC Higher National units that touch it

- **HN Unit 19 Electrical and Electronic Principles (2017 spec): energy into a circuit through a battery, and electromotive force**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "Transfer into the circuit through, for example, battery, solar panel or generator, and out of the circuit as heat or mechanical."
- **HN Unit 19 essential content names electromotive force and voltage sources**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "Charge, current, electric field, energy in an electrical context, potential, potential difference, resistance, electromotive force, conductors and insulators"
- **HN Unit 53 Utilisation of Electrical Power: battery as one storage technique, and battery management**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "The need for energy storage techniques as part of an energy management programme, characteristics of short-term and long-term energy storage techniques and their connection to the power grid, including, hydro, battery, super capacitor, flywheel and thermal Emerging battery technologies and battery management techniques"
- **HN Unit 44 Industrial Power, Electronics and Storage: energy storage systems named, but no cell-level content**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "Power electronic converters are an essential component of renewable and distributed energy sources"
- **HN Unit 4005 Renewable Energy (2024 suite) merit criterion: analyse storage technologies**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "Analyse storage technologies and their advantages and disadvantages in relation to at least three different forms of renewable energy."
- **HN Unit 4042 Aircraft Electrical Power (aerospace pathway, not marine): characteristics of lead-acid, NiCd, NiMH and lithium batteries**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "Discuss the characteristics of lead-acid, nickel-cadmium, nickel-metal hydride, and lithium batteries for use in aircraft."
- **HN Unit 4111 Powertrain and Hybrid Vehicles (automotive pathway): CC-CV charging named**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "Intuition to BMS and battery charging (CC-CV charging)"
My reading: the HN Engineering units that Dan could take (Electrical and Electronic Principles, Utilisation of Electrical Power, Industrial Power, Electronics and Storage) touch batteries only as an energy source (emf, internal resistance) or as one storage technology. Cell-level content (lead-acid, NiCd, Li-ion characteristics, CC-CV charging) appears only in the aerospace and automotive units. So a public HN route does not cover this ground, and the MCA syllabus (3.2) is the nearest the maritime route gets.


### 3.5 Dan's own electrical qualifications on batteries

- **BS 7671:2018+A4:2026 (published 15 April 2026) has a new chapter on stationary secondary batteries (Dan's 18th Edition course was on BS 7671:2018; the chapter is new)**
  - Source: IET & BSI officially publish Amendment 4 (2026) to BS 7671:2018 (IET Wiring Regulations). https://www.theiet.org/media/press-releases/press-releases-2026/press-releases-2026-april-june/15-april-2026-iet-bsi-officially-publish-amendment-4-2026-to-bs-76712018-iet-wiring-regulations
  - Quote: "One of the most significant developments is the introduction of a new chapter covering stationary secondary batteries"
- **BS 7671 A4: the new chapter has more than 18 new regulations on electrical energy storage systems**
  - Source: So what’s new?. https://select.org.uk/common/uploaded%20files/Technical/FreeDownloads/2026_Amendment_4_Whats_New.pdf
  - Quote: "This is a new chapter containing in excess of 18 new regulations which will ensure the safety and proper functioning of electrical energy storage systems (EESS) and other battery-powered installations."
- **BS 7671 A4: Chapter 57 covers selection, earthing, shock protection, protection against fault current on the DC side, isolation and identification**
  - Source: So what’s new?. https://select.org.uk/common/uploaded%20files/Technical/FreeDownloads/2026_Amendment_4_Whats_New.pdf
  - Quote: "earthing requirements, measures for protection against electric shock and ADS provided by RCD and protection against fault current on the DC side, isolation and protection against hazards and also for identification and notices"
- **BS 7671 A4: stationary batteries are treated as a generating set, not a load, in Regulation 551.7.2.1**
  - Source: So what’s new?. https://select.org.uk/common/uploaded%20files/Technical/FreeDownloads/2026_Amendment_4_Whats_New.pdf
  - Quote: "stationary batteries to be considered a generating set and not a load for the purposes of these regulations"
- **BS 7671 A4: Chapter 57 excludes central battery systems, fire alarm batteries and emergency lighting batteries (so it does not govern a ship's emergency battery or a central battery system)**
  - Source: So what’s new?. https://select.org.uk/common/uploaded%20files/Technical/FreeDownloads/2026_Amendment_4_Whats_New.pdf
  - Quote: "specific exclusions listed include batteries incorporated into products covered by product safety standards or within central battery systems"
- **BS 7671 A4: the chapter stresses battery location, ventilation and fire-risk mitigation**
  - Source: IET & BSI officially publish Amendment 4 (2026) to BS 7671:2018 (IET Wiring Regulations). https://www.theiet.org/media/press-releases/press-releases-2026/press-releases-2026-april-june/15-april-2026-iet-bsi-officially-publish-amendment-4-2026-to-bs-76712018-iet-wiring-regulations
  - Quote: "The chapter also places strong emphasis on safety‑critical matters such as appropriate battery location, ventilation, and fire‑risk mitigation."
- **BS 7671 scope is installations to 1000 V AC and 1500 V DC (the same 1 500 V DC ceiling as IEC 62485-2)**
  - Source: Requirements For Electrical Installations Iet Wiring Regulations 3. https://knowledge.bsigroup.com/products/requirements-for-electrical-installations-iet-wiring-regulations-3
  - Quote: "Installations at voltages up to 1000V AC and 1500V DC."
- **BS 7671 SELV/PELV limits: 120 V DC ripple-free in general (60 V and 15 V in some special locations)**
  - Source: IET & BSI officially publish Amendment 4 (2026) to BS 7671:2018 (IET Wiring Regulations). https://www.theiet.org/media/press-releases/press-releases-2026/press-releases-2026-april-june/15-april-2026-iet-bsi-officially-publish-amendment-4-2026-to-bs-76712018-iet-wiring-regulations
  - Quote: "Conventionally, SELV and PELV require a voltage limitation of 50 V AC and 120 V DC"
Dan's other qualifications (L3 Initial Verification, Periodic Inspection, In-Service Inspection and Testing, L4 Design and Verification, C&G Assured Subsea Cable Testing and Fault Location) are about AC installations and cable testing. Nothing in the EAL, C&G or BTEC titles lists cells or batteries (UNCONFIRMED: I did not see the unit content of any of them). His 18th Edition course was on BS 7671:2018 (Feb 2025), which predates the first battery chapter (Chapter 57, Amendment 4, 15 Apr 2026). So the course starts from first principles with no assumed knowledge, and can say where BS 7671's new chapter sits without teaching it (it is for stationary storage on installations, and excludes central battery systems).


## 4. The scope to cover, and what research says about each part

Large lead-acid batteries from first principles, in the order given in the request. Each part lists the sources that support it, and my reading of how it could be taught. The brief may merge or split.


### 4.1 The cell: what happens at each plate, and why about 2 V

- **Lead metal at the negative plate reacts with sulfuric acid to make lead sulfate and frees electrons**
  - Source: Lead-Acid Batteries and Advanced Lead-Carbon Batteries. https://www.osti.gov/servlets/purl/1502636
  - Quote: "at the anode (negative plate), lead metal reacts with sulfuric acid to form lead sulfate (i.e., Pb is oxidized from Pb to Pb 2+ ), liberating electrons."
- **Lead oxide at the positive plate reacts with sulfuric acid, again making lead sulfate**
  - Source: Lead-Acid Batteries and Advanced Lead-Carbon Batteries. https://www.osti.gov/servlets/purl/1502636
  - Quote: "While at the cathode (positive plate), lead oxide reacts with sulfuric acid, again forming lead sulfate"
- **On discharge both plates become lead sulfate and the acid is used up, leaving water (SECONDARY: ScienceDirect overview)**
  - Source: Lead Acid Battery - an overview | ScienceDirect Topics. https://www.sciencedirect.com/topics/materials-science/lead-acid-battery
  - Quote: "During discharge, both electrodes become lead sulfate (PbSO ₄ ), and sulfuric acid is highly consumed, leaving behind water"
- **RSC: during charging the sulfuric acid concentration rises, and during discharge it falls**
  - Source: Rechargeable cells: the lead–acid accumulator | Class experiment | RSC Education. https://edu.rsc.org/experiments/rechargeable-cells-the-lead-acid-accumulator/391.article
  - Quote: "Thus during charging the sulfuric acid concentration rises, and during discharge it falls."
- **Battery University: nominal 2 V per cell, but a charged and rested lead acid cell reads about 2.1 V open circuit**
  - Source: Battery University | BU-303: Confusion with Voltages. http://www.batteryuniversity.com/article/bu-303-confusion-with-voltages
  - Quote: "The nominal voltage of lead acid is 2 volts per cell, however when measuring the open circuit voltage, the OCV of a charged and rested battery should be 2.1V/cell."
- **Standard reduction potentials: lead dioxide plate +1.685 V and lead sulfate to lead -0.356 V (a university lab reference table: SECONDARY)**
  - Source: Standard Reduction Potentials at 25C. https://chem21labs.com/reference/StandardReductionPotentials.pdf
  - Quote: "PbO2 (s) + HSO4 \- (aq) \+ 3H+ (aq) \+ 2e- → PbSO 4 (s) \+ 2H 2 O (l) ### \+1.685 PbSO4 (s) + H \+ (aq) \+ 2e- → Pb (s) \+ HSO 4 \- (aq) ### \-0.356"
- **The sum of the two standard potentials is 2.042 V at 298 K (SECONDARY: ScienceDirect overview)**
  - Source: Lead Acid Battery - an overview | ScienceDirect Topics. https://www.sciencedirect.com/topics/engineering/lead-acid-battery
  - Quote: "The OCV is given by _E_ rev = _E_ ₀ − (R _T_ / _n_ F) , where _E_ ₀ is the algebraic sum of the two standard potentials of −0355 and +1.68 V is equal to 2.042 V at 298 K."
- **LibreTexts: the standard potential of a lead-acid cell is about 2 V (SECONDARY: hosted textbook)**
  - Source: 2.6: Batteries- Producing Electricity Through Chemical Reactions - Chemistry LibreTexts. https://chem.libretexts.org/Courses/University_of_California_Davis/UCD_Chem_002C/UCD_Chem_2C_(Larsen)/Textbook/02:_Electrochemistry/2.06:_Batteries-_Producing_Electricity_Through_Chemical_Reactions
  - Quote: "The value of E° for such a cell is about 2 V."
- **Charging reverses it: an external voltage above about 2.04 V per cell (SECONDARY: hosted textbook)**
  - Source: 2.6: Batteries- Producing Electricity Through Chemical Reactions - Chemistry LibreTexts. https://chem.libretexts.org/Courses/University_of_California_Davis/UCD_Chem_002C/UCD_Chem_2C_(Larsen)/Textbook/02:_Electrochemistry/2.06:_Batteries-_Producing_Electricity_Through_Chemical_Reactions
  - Quote: "When an external voltage in excess of 2.04 V per cell is applied to a lead–acid battery, the electrode reactions reverse"
- **A real cell reads about 1.8 V loaded and 2.10 V open circuit at full charge (SECONDARY: Wikipedia)**
  - Source: Lead–acid battery - Wikipedia. https://en.wikipedia.org/wiki/Lead%E2%80%93acid_battery
  - Quote: "For a single cell, the voltage can range from 1.8 V loaded at full discharge, to 2.10 V in an open circuit at full charge."
- **Lead acid is the oldest rechargeable system, rugged and low cost, with low specific energy (Battery University)**
  - Source: BU-107: Comparison Table of Secondary Batteries - Battery University. https://batteryuniversity.com/article/bu-107-comparison-table-of-secondary-batteries
  - Quote: "Lead Acid – This is the oldest rechargeable battery system."
My reading: the cell can be taught in four moves: (1) two different metals-in-acid plates have a fixed potential gap, set by chemistry not by size (about 2 V per cell, whether a torch-size cell or a tonne of lead); (2) on discharge both plates turn to lead sulfate and the acid thins to water, so the acid is a reactant, not just a bath; (3) on charge an outside voltage above the cell's own pushes it back; (4) six cells in series make 12 V, 24 cells make 48 V, and so on. The MCA syllabus wants this "without chemical formulae", so the lesson can name lead, lead dioxide, sulfuric acid, lead sulfate and water and avoid half-equations. The RSC electrochemistry misconceptions piece (6) is the warning that electrons do not travel through the electrolyte (ions do).


### 4.2 State of charge: open-circuit voltage and specific gravity, and the hydrometer

- **Battery University: voltage-based state of charge works reasonably well for a rested lead acid battery but needs a rest of hours (24 h recommended for lead acid)**
  - Source: Bu 903 How To Measure State Of Charge. https://batteryuniversity.com/article/bu-903-how-to-measure-state-of-charge
  - Quote: "To get accurate readings, the battery needs to rest in the open circuit state for at least four hours; battery manufacturers recommend 24 hours for lead acid."
- **Surface charge shows a raised voltage straight after charge; a brief discharge before measuring removes the error**
  - Source: Bu 903 How To Measure State Of Charge. https://batteryuniversity.com/article/bu-903-how-to-measure-state-of-charge
  - Quote: "Surface charge further fools SoC estimations by showing an elevated voltage immediately after charge; a brief discharge before measurement counteracts the error."
- **A hydrometer reads state of charge because charging makes the acid denser and discharging makes it lighter**
  - Source: Bu 903 How To Measure State Of Charge. https://batteryuniversity.com/article/bu-903-how-to-measure-state-of-charge
  - Quote: "When the lead acid battery accepts charge, the sulfuric acid gets heavier, causing the specific gravity (SG) to increase. As the SoC decreases through discharge, the sulfuric acid removes itself from the electrolyte and binds to the plate, forming lead sulfate. The density of the electrolyte becomes lighter and more water-like, and the specific gravity gets lower."
- **The look-up values were taken at 26 C after a 24 h rest (BCI starter battery)**
  - Source: Bu 903 How To Measure State Of Charge. https://batteryuniversity.com/article/bu-903-how-to-measure-state-of-charge
  - Quote: "Readings are taken at 26°C (78°F) after a 24h rest."
- **Full-charge specific gravity depends on the application: traction 1.280, starter 1.265, stationary 1.225 (Battery University)**
  - Source: Bu 903 How To Measure State Of Charge. https://batteryuniversity.com/article/bu-903-how-to-measure-state-of-charge
  - Quote: "traction batteries for forklifts are typically at 1.280; starter batteries come in at 1.265; and stationary batteries have a low specific gravity of 1.225."
- **Colder electrolyte reads a denser (higher) specific gravity: so the reading must be corrected**
  - Source: Bu 903 How To Measure State Of Charge. https://batteryuniversity.com/article/bu-903-how-to-measure-state-of-charge
  - Quote: "The colder the temperature drops, the higher (more dense) the SG value becomes."
- **Low electrolyte level raises the specific gravity reading and overfilling lowers it**
  - Source: Bu 903 How To Measure State Of Charge. https://batteryuniversity.com/article/bu-903-how-to-measure-state-of-charge
  - Quote: "When water evaporates, the SG reading rises because of higher concentration. The battery can also be overfilled, which lowers the number."
- **GNB/Exide: specific gravity falls on discharge and rises on charge, reaching its original value at full charge**
  - Source: 93.10. https://www.exidegroup.com/eu/sites/default/files/2017-01/Section%2093_10%202014-08%20GNB%20Flooded%20Classic%20Installation%20and%20Operation%20Manual%20Section_4.pdf
  - Quote: "Specific gravity is used in determining a cell’s state of charge. It decreases as the cell discharges and increases as the cell is charged; reaching its original value when the cell is fully charged."
- **GNB/Exide: correct each reading by one point (0.001) per 3 F above or below 77 F**
  - Source: 93.10. https://www.exidegroup.com/eu/sites/default/files/2017-01/Section%2093_10%202014-08%20GNB%20Flooded%20Classic%20Installation%20and%20Operation%20Manual%20Section_4.pdf
  - Quote: "For each 3°F (1.67°C) in temperature of the electrolyte above 77°F (25°C) add one point (.001) in specific gravity to the observed hydrometer readings"
- **GNB/Exide: worked correction (1.213 at 68 F is 1.210 at 77 F)**
  - Source: 93.10. https://www.exidegroup.com/eu/sites/default/files/2017-01/Section%2093_10%202014-08%20GNB%20Flooded%20Classic%20Installation%20and%20Operation%20Manual%20Section_4.pdf
  - Quote: "1.213 sp. gr 68°F (20°C) -.003 points= 1.210 sp. gr."
- **GNB/Exide: loss of water by evaporation and by gassing also changes the specific gravity reading**
  - Source: 93.10. https://www.exidegroup.com/eu/sites/default/files/2017-01/Section%2093_10%202014-08%20GNB%20Flooded%20Classic%20Installation%20and%20Operation%20Manual%20Section_4.pdf
  - Quote: "The loss of water from the electrolyte due to evaporation as well as conversion of the water to hydrogen and oxygen by charging current also effects the specific gravity value."
- **GNB/Exide: specific gravity lags the ampere-hour input after recharge, mixing is slow**
  - Source: 93.10. https://www.exidegroup.com/eu/sites/default/files/2017-01/Section%2093_10%202014-08%20GNB%20Flooded%20Classic%20Installation%20and%20Operation%20Manual%20Section_4.pdf
  - Quote: "When recharging a lead-calcium cell, the specific gravity reading lags behind the ampere hour input due mainly to the very low end of charge currents."
- **GNB/Exide: specific gravity defined as weight compared with water**
  - Source: 93.10. https://www.exidegroup.com/eu/sites/default/files/2017-01/Section%2093_10%202014-08%20GNB%20Flooded%20Classic%20Installation%20and%20Operation%20Manual%20Section_4.pdf
  - Quote: "Specific gravity is a measure of the weight of acid in the electrolyte as compared to an equal volume of water."
- **GNB/Exide: correct cell voltage for temperature too (0.003 V per degree F)**
  - Source: 93.10. https://www.exidegroup.com/eu/sites/default/files/2017-01/Section%2093_10%202014-08%20GNB%20Flooded%20Classic%20Installation%20and%20Operation%20Manual%20Section_4.pdf
  - Quote: "The temperature correction factor for cell voltage equals 0.003 volts for each degree fahrenheit (0.0055v/C°)"
- **Stratification fools both voltage and specific gravity: high acid at the bottom raises open-circuit voltage and the reading**
  - Source: Battery University | BU-804c: Acid Stratification and Surface Charge. https://batteryuniversity.com/article/bu-804c-acid-stratification-and-surface-charge
  - Quote: "while the high acid concentration on the bottom makes the battery appear more charged than it is and artificially raises the open circuit voltage."
- **A healthy rested lead acid cell reads about 2.10 V; 2.10 V per cell means about 90 per cent charge in storage**
  - Source: Bu 403 Charging Lead Acid. https://batteryuniversity.com/article/bu-403-charging-lead-acid
  - Quote: "A cell voltage of 2.10V at room temperature reveals a charge of about 90 percent."
- **Battery University: temperature and use patterns affect the voltage reading (cool lowers, warm raises)**
  - Source: Bu 403 Charging Lead Acid. https://batteryuniversity.com/article/bu-403-charging-lead-acid
  - Quote: "Observe the storage temperature when measuring the open circuit voltage. A cool battery lowers the voltage slightly and a warm one increases it."
- **Voltage tells state of charge but not state of health**
  - Source: Battery University | Battery Test Methods. https://www.batteryuniversity.com/article/battery-test-methods/
  - Quote: "Voltage alone cannot estimate battery state-of-health (SoH)."
My reading: the voltage and the specific gravity agree only when the cell is rested, at a known temperature, with the electrolyte mixed and at the right level. The lesson is a decision, not a table: "Is this reading trustworthy yet?" Checks to run: rested long enough? corrected for temperature? level right? surface charge? stratified? On the temperature rule: the electrolyte gets lighter as it warms, by about 0.0007 per degree C (EnerSys; GNB gives one point, 0.001, per 3 F, about 0.0006 per degree C; Battery University's table runs 1.280 at 20 C to 1.266 at 40 C, also about 0.0007). So a warm reading is corrected upward and a cold reading downward, to the 20 C or 25 C reference. EnerSys's own example: 1.230 at 35 C corresponds to 1.240 at 20 C. Dan can check any worked case with the rule "warm electrolyte reads low". The reference temperature differs by maker (20 C EnerSys and Hoppecke, 25 C GNB), a point the lesson should state once and then use.


### 4.3 Capacity and rate: ampere-hours, C-rate, Peukert, cold, and voltage under load

- **C-rate: 1C is the one-hour rate; 0.5C two hours; 0.2C five hours**
  - Source: Battery University | BU-402: What Is C-rate?. https://batteryuniversity.com/article/bu-402-what-is-c-rate
  - Quote: "The capacity of a battery is commonly rated at 1C, meaning that a fully charged battery rated at 1Ah should provide 1A for one hour. The same battery discharging at 0.5C should provide 500mA for two hours, and at 2C it delivers 2A for 30 minutes."
- **A higher C-rate gives a lower capacity reading because of internal losses**
  - Source: Battery University | BU-402: What Is C-rate?. https://batteryuniversity.com/article/bu-402-what-is-c-rate
  - Quote: "When discharging a battery with a battery analyzer capable of applying different C rates, a higher C rate will produce a lower capacity reading and vice versa."
- **Lead acid is rated at the 20-hour rate (0.05C) because that gives a good capacity reading**
  - Source: Battery University | BU-402: What Is C-rate?. https://batteryuniversity.com/article/bu-402-what-is-c-rate
  - Quote: "To obtain a reasonably good capacity reading, manufacturers commonly rate alkaline and lead acid batteries at a very low 0.05C, or a 20-hour discharge."
- **Lead acid ratings are the 5-hour (0.2C) and 20-hour (0.05C) rates; slow discharge gives higher capacity**
  - Source: Bu 201 How Does The Lead Acid Battery Work. https://batteryuniversity.com/article/bu-201-how-does-the-lead-acid-battery-work
  - Quote: "Lead acid batteries are rated at a 5-hour (0.2C) and 20-hour (0.05C) discharge rate. The battery performs best when discharged slowly; the capacity readings are substantially higher at a slower discharge than at the 1C-rate"
- **Victron: the same 100 Ah battery rated at C20 may give only about 56 Ah when emptied in two hours**
  - Source: 8. Battery capacity and Peukert exponent. https://www.victronenergy.com/media/pg/BMV-700/en/battery-capacity-and-peukert-exponent.html
  - Quote: "When the same 100Ah battery is discharged completely in two hours, its capacity is greatly reduced. Because of the higher rate of discharge, it may only give C2 = 56Ah."
- **Victron: Peukert's formula with exponent n; default 1.25 for lead acid; ideal battery is 1.00**
  - Source: 8. Battery capacity and Peukert exponent. https://www.victronenergy.com/media/pg/BMV-700/en/battery-capacity-and-peukert-exponent.html
  - Quote: "An ideal (theoretical) battery has a Peukert exponent of 1.00 and has a fixed capacity regardless of the size of the discharge current. The default setting in the battery monitor for the Peukert exponent is 1.25."
- **Victron: the formula is Cp = I^n x t and two rated capacities give the exponent**
  - Source: 8. Battery capacity and Peukert exponent. https://www.victronenergy.com/media/pg/BMV-700/en/battery-capacity-and-peukert-exponent.html
  - Quote: "To calculate the Peukert exponent you will need two rated battery capacities."
- **Victron: Peukert is only a rough approximation; at very high current the battery gives even less**
  - Source: 8. Battery capacity and Peukert exponent. https://www.victronenergy.com/media/pg/BMV-700/en/battery-capacity-and-peukert-exponent.html
  - Quote: "Please note that the Peukert exponent is no more than a rough approximation of reality. In case of very high currents, the battery will give even less capacity than predicted by a fixed exponent."
- **Peukert exponent for lead acid is typically between 1.1 and 1.3 (SECONDARY: Wikipedia)**
  - Source: Peukert's law - Wikipedia. https://en.wikipedia.org/wiki/Peukert%27s_law
  - Quote: "For a lead–acid battery {\displaystyle k} is typically between 1.1 and 1.3."
- **A research paper: capacity does not follow a single Peukert power law; the log-log plot is not a straight line**
  - Source: Faster Lead-Acid Battery Simulations from Porous-Electrode Theory: Part I. Physical Model. https://iopscience.iop.org/article/10.1149/2.0301910jes/pdf
  - Quote: "The dependence of discharge capacity on C-rate deviates substantially from Peukert’s simple power law"
- **Same paper: by Peukert's law one would expect a straight line on the log-log axes (the Exponentials and logarithms link)**
  - Source: Faster Lead-Acid Battery Simulations from Porous-Electrode Theory: Part I. Physical Model ValentinSulzer, S.JonChapman, ColinP.Please, DavidA.Howey, andCharlesW.Monroe Mathematical Institute, University of. https://ora.ox.ac.uk/objects/uuid:3b546aa6-414f-4bc3-8188-10a75a8d8113/files/m37a7ad0092fd7cd0d12c64f14dc03068
  - Quote: "By Peukert’s Law, one would expect the graph to be linear on this log-log axis."
- **Cold: a battery that gives 100 per cent at 27 C typically gives about 50 per cent at -18 C; cold raises internal resistance**
  - Source: Bu 502 Discharging At High And Low Temperatures. https://batteryuniversity.com/article/bu-502-discharging-at-high-and-low-temperatures
  - Quote: "Cold temperature increases the internal resistance and lowers the capacity. A battery that provides 100 percent capacity at 27°C (80°F) will typically deliver only 50 percent at –18°C (0°F)."
- **EnerSys: a temperature correction to capacity depends on the discharge time (correction factors for 5-59 minute and 1-24 hour discharges)**
  - Source: Flooded Stationary Lead Acid Batteries IOM. https://www.enersys.com/492013/globalassets/documents/product-documentation/powersafe/opzs/amer/amer-en-iom-ps-flooded-0223.pdf
  - Quote: "If the battery operating temperature is different from 20°C (68°F), a correcting factor is to be applied to capacity value taking into account discharge time."
- **EnerSys: end-of-discharge voltage depends on how long the discharge lasts (1.60 V per cell for 5-59 minutes up to 1.80 V for 8-24 hours)**
  - Source: Flooded Stationary Lead Acid Batteries IOM. https://www.enersys.com/492013/globalassets/documents/product-documentation/powersafe/opzs/amer/amer-en-iom-ps-flooded-0223.pdf
  - Quote: "5 min < t < 59 min 1.60 V/c 1h < t < 5h 1.70 V/c 5h < t < 8h 1.75 V/c 8h < t < 24h 1.80 V/c"
- **Internal resistance from two readings: open-circuit voltage, then voltage under load; Ohm's law gives the resistance**
  - Source: BU-902: How to Measure Internal Resistance - Battery University. https://batteryuniversity.com/article/bu-902-how-to-measure-internal-resistance
  - Quote: "A voltmeter measures the open circuit voltage (OCV) with no load, followed by the second reading with a load; Ohm’s law calculates the resistance value (voltage difference divided by current equals resistance)."
- **Cell resistance is what makes the loaded voltage fall below the open-circuit voltage (terminal pd = emf minus Ir): the A-level formula (SECONDARY: revision site)**
  - Source: Circuits, potential dividers, e.m.f. and internal resistance | AQA A Level Physics Revision | PhysicsUK. https://www.physicsuk.co.uk/aqa-a-level-physics/3-5-electricity/circuits-potential-dividers-emf-aqa
  - Quote: "ε = I(R + r) = V + Ir"
- **Battery University: DC load method: a good partly-charged battery and a marginal full one can read alike, so capacity cannot be got from resistance**
  - Source: BU-902: How to Measure Internal Resistance - Battery University. https://batteryuniversity.com/article/bu-902-how-to-measure-internal-resistance
  - Quote: "In addition, the DC load method gets similar readings from a good battery that is partially charged and a marginal battery that is fully charged."
- **Battery University: capacity governs runtime, internal resistance governs power**
  - Source: BU-905: Testing Lead Acid Batteries - Battery University. https://batteryuniversity.com/article/bu-905-testing-lead-acid-batteries
  - Quote: "Capacity oversees the energy storage, governs the runtime and predicts the end-of-life. Internal resistance, on the other hand, is responsible for the power to crank the engine and deliver high current under load on demand."
- **Battery University definitions: internal resistance is the capability to deliver current (one of the three state-of-health indicators)**
  - Source: Battery University | BU-105: Battery Definitions and what they mean. http://www.batteryuniversity.com/article/bu-105-battery-definitions-and-what-they-mean
  - Quote: "Internal resistance, the capability to deliver current, and"
- **Vertiv: acid is only about 15 per cent of a typical VRLA cell's resistance at 25 C; cold slows the chemistry and the acid, so short-circuit current falls**
  - Source: CALCULATED VS. ACTUAL SHORT CIRCUIT CURRENTS FOR VRLA BATTERIES. https://www.vertiv.com/48dfcf/globalassets/documents/battcon-static-assets/2003/calculated-vs.-actual-short-circuit-currents-for-vrla-batteries.pdf
  - Quote: "Estimates of the contribution of each component indicate the acid may account for ~15% of the total resistance of a typical VRLA battery at 25 o C."
My reading: Peukert is the course's natural use of Exponentials and logarithms (a power law, a straight line on log-log paper, an exponent from two points by dividing logs) and of Statistics (fit a line, residuals). Dan can use the Victron worked example (100 Ah at C20, about 56 Ah at C2) to find n himself and then see why a fixed n is only a rough guide (Sulzer et al. show two slopes). That is also a built-in misconception catcher: Peukert is a fit, not a law of nature.


### 4.4 Charging: constant current then constant voltage, boost, equalise and float; voltage per cell

- **Lead acid uses constant-current constant-voltage (CCCV) charge; the current falls as the cell saturates**
  - Source: Bu 403 Charging Lead Acid. https://batteryuniversity.com/article/bu-403-charging-lead-acid
  - Quote: "The lead acid battery uses the constant current constant voltage (CCCV) charge method. A regulated current raises the terminal voltage until the upper charge voltage limit is reached, at which point the current drops due to saturation."
- **Large stationary batteries take 36-48 hours to charge fully (Battery University)**
  - Source: Bu 403 Charging Lead Acid. https://batteryuniversity.com/article/bu-403-charging-lead-acid
  - Quote: "The charge time is 12–16 hours and up to 36–48 hours for large stationary batteries."
- **Three stages: constant current, topping charge, float**
  - Source: Bu 403 Charging Lead Acid. https://batteryuniversity.com/article/bu-403-charging-lead-acid
  - Quote: "With the CCCV method, lead acid batteries are charged in three stages, which are [1] constant-current charge, [2] topping charge and [3] float charge. The constant-current charge applies the bulk of the charge and takes up roughly half of the required charge time; the topping charge continues at a lower charge current and provides saturation, and the float charge compensates for the loss caused by self-discharge."
- **Full charge is reached when the current falls to 3-5 per cent of the Ah rating**
  - Source: Bu 403 Charging Lead Acid. https://batteryuniversity.com/article/bu-403-charging-lead-acid
  - Quote: "full charge is reached when the current decreases to 3–5 percent of the Ah rating."
- **The charge voltage limit is critical, 2.30 to 2.45 V per cell, a compromise between sulfation and grid corrosion**
  - Source: Bu 403 Charging Lead Acid. https://batteryuniversity.com/article/bu-403-charging-lead-acid
  - Quote: "The correct setting of the charge voltage limit is critical and ranges from 2.30V to 2.45V per cell. Setting the voltage threshold is a compromise and battery experts refer to this as “dancing on the head of a pin.” On one hand, the battery wants to be fully charged to get maximum capacity and avoid sulfation on the negative plate; on the other hand, over-saturation by not switching to float charge causes grid corrosion on the positive plate."
- **Temperature compensation of charge voltage: -3 mV per cell per degree C about 25 C**
  - Source: Bu 403 Charging Lead Acid. https://batteryuniversity.com/article/bu-403-charging-lead-acid
  - Quote: "The charge temperature coefficient of a lead acid cell is –3mV/°C. Establishing 25°C (77°F) as the midpoint, the charge voltage should be reduced by 3mV per cell for every degree above 25°C and increased by 3mV per cell for every degree below 25°C."
- **Float voltage of most flooded lead acid is 2.25 to 2.27 V per cell; large stationary cells typically float at 2.25 V**
  - Source: Bu 403 Charging Lead Acid. https://batteryuniversity.com/article/bu-403-charging-lead-acid
  - Quote: "The recommended float voltage of most flooded lead acid batteries is 2.25V to 2.27V/cell. Large stationary batteries at 25°C (77°F) typically float at 2.25V/cell."
- **In a string, all cells get the same current, so a weak cell can be overcharged while a strong one is starved**
  - Source: Bu 403 Charging Lead Acid. https://batteryuniversity.com/article/bu-403-charging-lead-acid
  - Quote: "Connected in a string, all cells receive the same charge current and controlling individual cell voltages as each reaches full capacity is almost impossible."
- **Ripple on the charge voltage causes hydrogen at the peaks and electrolyte depletion at the valleys; makers limit it to 5 per cent**
  - Source: Bu 403 Charging Lead Acid. https://batteryuniversity.com/article/bu-403-charging-lead-acid
  - Quote: "Ripple voltage also causes a problem with large stationary batteries. A voltage peak constitutes an overcharge, causing hydrogen evolution, while the valley induces a brief discharge that creates a starved state resulting in electrolyte depletion. Manufacturers limit the ripple on the charge voltage to 5 percent."
- **Equalising: a periodic charge at 2.50 V per cell; a deliberate overcharge to remove sulfate, and it reverses stratification**
  - Source: BU-404: What is Equalizing Charge? - Battery University. https://batteryuniversity.com/article/bu-404-what-is-equalizing-charge
  - Quote: "Applying a periodic equalizing charge brings all cells to similar levels by increasing the voltage to 2.50V/cell, or 10 percent higher than the recommended charge voltage."
- **Equalising is a deliberate overcharge, and it also reverses acid stratification**
  - Source: BU-404: What is Equalizing Charge? - Battery University. https://batteryuniversity.com/article/bu-404-what-is-equalizing-charge
  - Quote: "An equalizing charge is nothing more than a deliberate overcharge to remove sulfate crystals that build up on the plates over time."
- **GNB/Exide: equalising is for non-uniformity between cells in voltage or specific gravity**
  - Source: 93.10. https://www.exidegroup.com/eu/sites/default/files/2017-01/Section%2093_10%202014-08%20GNB%20Flooded%20Classic%20Installation%20and%20Operation%20Manual%20Section_4.pdf
  - Quote: "An equalizing charge is a special charge given a battery when non-uniformity in voltage or specific gravity has devel- oped between cells."
- **GNB/Exide: equalise when the temperature-corrected specific gravity of the pilot cell is more than 10 points below full charge**
  - Source: 93.10. https://www.exidegroup.com/eu/sites/default/files/2017-01/Section%2093_10%202014-08%20GNB%20Flooded%20Classic%20Installation%20and%20Operation%20Manual%20Section_4.pdf
  - Quote: "Equalize when the temperature corrected specific grav- ity of the pilot cell (or any cell for the quarterly reading) is more than 10 points below its full charge value."
- **GNB/Exide: low floating voltage from a mis-set charger, or temperature differences across the string, cause low cells**
  - Source: 93.10. https://www.exidegroup.com/eu/sites/default/files/2017-01/Section%2093_10%202014-08%20GNB%20Flooded%20Classic%20Installation%20and%20Operation%20Manual%20Section_4.pdf
  - Quote: "Non-uniformity of cells may result from low floating voltage due to improper adjustment of the charger or a panel volt- meter which reads incorrect (higher) output voltage."
- **EnerSys commissioning: a boost charge at 2.33 to 2.40 V per cell, current limited to four times I10**
  - Source: Flooded Stationary Lead Acid Batteries IOM. https://www.enersys.com/492013/globalassets/documents/product-documentation/powersafe/opzs/amer/amer-en-iom-ps-flooded-0223.pdf
  - Quote: "At a raised voltage of 2.33 – 2.40V/cell. The charging time will be 12 to 36 hours depending on the initial charge conditions. The current must be limited to 4 x I10."
- **EnerSys: recharge 1.2 times the discharged capacity**
  - Source: Flooded Stationary Lead Acid Batteries IOM. https://www.enersys.com/492013/globalassets/documents/product-documentation/powersafe/opzs/amer/amer-en-iom-ps-flooded-0223.pdf
  - Quote: "Recharge 1.2 times the discharged capacity."
- **EnerSys: ripple current limit on standby, 5 A per 100 Ah C10**
  - Source: Flooded Stationary Lead Acid Batteries IOM. https://www.enersys.com/492013/globalassets/documents/product-documentation/powersafe/opzs/amer/amer-en-iom-ps-flooded-0223.pdf
  - Quote: "In the standby operation mode the effective value of the A.C. ripple current must not exceed 5 A per 100 Ah C10"
- **Fully charged on a commissioning float: voltages and current stop changing for two hours**
  - Source: Flooded Stationary Lead Acid Batteries IOM. https://www.enersys.com/492013/globalassets/documents/product-documentation/powersafe/opzs/amer/amer-en-iom-ps-flooded-0223.pdf
  - Quote: "The fully charged condition has been achieved when, for a period of 2 hours, the cell voltages do not continue to increase and the charging current does not continue to decrease."
- **HN unit descriptor 4111 names CC-CV charging (the Electronics course built the converter that does it)**
  - Source: Unit Descriptors for the Pearson BTEC Higher Nationals Engineering Suite (2024). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/engineering-for-england/2024/unitdescriptors/btec-hncd-unit-descriptor-engineering-suite-2024.pdf
  - Quote: "Intuition to BMS and battery charging (CC-CV charging)"
- **Yuasa: a constant voltage charge for floating, equalising, recovering and refreshing**
  - Source: CS HS SS PS SERIES. https://www.gs-yuasa.com/en/products/pdf/CS_HS_Vented.pdf
  - Quote: "Floating charge Equalizing charge Recovering charge Refreshing charge"
My reading: "voltage per cell is the controlled quantity" is the thread: the charger is set to N cells times a per-cell figure (EnerSys: "Uflo per cell x no. of cells"), and the per-cell figures (float about 2.25, boost 2.33 to 2.40, equalise about 2.50) all lie above the 2.1 V open-circuit figure by the amount needed to push current in. The built Electronics course already taught how a charger holds voltage and limits current; this course uses it and moves to the cell side: why those numbers, and what each stage does to the plates (stage 1 bulk, stage 2 saturation, stage 3 self-discharge makeup).


### 4.5 Gassing and hydrogen: gassing voltage, the gases, flammable range, and sizing ventilation from the charging current

- **Gas is made by electrolysis of the water part of the electrolyte, by the charging current, in every charging mode (GNB/Exide)**
  - Source: 93.10. https://www.exidegroup.com/eu/sites/default/files/2017-01/Section%2093_10%202014-08%20GNB%20Flooded%20Classic%20Installation%20and%20Operation%20Manual%20Section_4.pdf
  - Quote: "This results from electrolysis of the water portion of the elec- trolyte by the charging current."
- **Hydrogen comes off the negative plate and oxygen off the positive plate (Battery University)**
  - Source: Bu 403 Charging Lead Acid. https://batteryuniversity.com/article/bu-403-charging-lead-acid
  - Quote: "(Hydrogen appears on negative plate and oxygen on positive plate)."
- **Oxygen is only generated when the battery is overcharged; a 3-stage charger stays below the gassing stage**
  - Source: Bu 403 Charging Lead Acid. https://batteryuniversity.com/article/bu-403-charging-lead-acid
  - Quote: "Oxygen is only generated when the battery is overcharged."
- **Gassing voltage is about 2.40 V per cell, above which the charge current must be limited (EnerSys)**
  - Source: Flooded Stationary Lead Acid Batteries IOM. https://www.enersys.com/492013/globalassets/documents/product-documentation/powersafe/opzs/amer/amer-en-iom-ps-flooded-0223.pdf
  - Quote: "After reaching the gassing voltage of 2.40 V/c a current limit of 2.5 to 5 A/100 Ah is recommended"
- **Hoppecke: charging current above the gassing voltage of 2.40 V per cell sets the limit values**
  - Source: Table of contents. https://www.hoppecke.com/fileadmin/Redakteur/Hoppecke-Main/Products-Import/vl_manual_en.pdf
  - Quote: "Limit values of the charging currents above the gassing voltage of 2.40 V/cell per 100 Ah."
- **HSE: hydrogen and oxygen come off faster near full charge**
  - Source: Using electric storage batteries safely INDG139. https://www.hse.gov.uk/PUBNS/indg139.pdf
  - Quote: "Hydrogen and oxygen are produced more quickly as the battery gets close to being fully charged."
- **HSE: 4 per cent to 75 per cent flammable range for hydrogen in air**
  - Source: Using electric storage batteries safely INDG139. https://www.hse.gov.uk/PUBNS/indg139.pdf
  - Quote: "Mixtures with air containing from 4% hydrogen (lower explosion limit – LEL) to 75% hydrogen (upper explosion limit – UEL) will readily ignite and explode."
- **HSE: DSEAR requires ventilation to keep the average below that which could form an explosive atmosphere**
  - Source: Using electric storage batteries safely INDG139. https://www.hse.gov.uk/PUBNS/indg139.pdf
  - Quote: "adequate ventilation should maintain the average concentration of dangerous substances during normal operation to below that which could form an explosive atmosphere"
- **HSE: dilution depends on production rate, location, room shape and anything impeding air circulation**
  - Source: Using electric storage batteries safely INDG139. https://www.hse.gov.uk/PUBNS/indg139.pdf
  - Quote: "Effective dilution depends on several factors. These include the rate of hydrogen production; the location of the battery within the area; the shape and size of the area; and anything that would impede the natural circulation of air."
- **HSE: natural-ventilation opening needs airflow of at least 0.1 m/s; area = 0.3 N I S in square centimetres**
  - Source: Using electric storage batteries safely INDG139. https://www.hse.gov.uk/PUBNS/indg139.pdf
  - Quote: "So long as the velocity of the airflow through these ventilation openings is at least 0.1 m/s"
- **HSE: mechanical ventilation must take air from and discharge to a safe place, with an alarm for gas build-up or fan failure**
  - Source: Using electric storage batteries safely INDG139. https://www.hse.gov.uk/PUBNS/indg139.pdf
  - Quote: "If natural ventilation is insufficient to achieve the required level of ventilation, suitable mechanical means should be used. The ventilation air must be drawn from and discharged to a safe place. An alarm system should be installed to detect build-up of hydrogen or failure of mechanical ventilation and to isolate electrical equipment in the area."
- **Hoppecke: the opening for inlet and outlet is at least 28 x Q (area in cm2, Q in m3/h)**
  - Source: Table of contents. https://www.hoppecke.com/fileadmin/Redakteur/Hoppecke-Main/Products-Import/vl_manual_en.pdf
  - Quote: "Minimum cross-section each (Air inlet / outlet): 𝐴 ≥ 28 × 𝑄 (𝐴 𝑖𝑛 𝑐𝑚 ² , Q in"
- **Hoppecke: the 28 x Q opening assumes an air speed of 0.1 m/s**
  - Source: Table of contents. https://www.hoppecke.com/fileadmin/Redakteur/Hoppecke-Main/Products-Import/vl_manual_en.pdf
  - Quote: "Assumption: 𝑣𝐿𝑢𝑓𝑡 = 0,1"
- **GNB/Exide: keep hydrogen below 1 per cent in the battery room and exhaust to the outside atmosphere**
  - Source: 93.10. https://www.exidegroup.com/eu/sites/default/files/2017-01/Section%2093_10%202014-08%20GNB%20Flooded%20Classic%20Installation%20and%20Operation%20Manual%20Section_4.pdf
  - Quote: "ventilation should be provided in the battery room or area to prevent hydrogen, liberated from the cells in service, from exceeding a 1% concentration."
- **GNB/Exide: ventilation air must be exhausted outside and never recirculated**
  - Source: 93.10. https://www.exidegroup.com/eu/sites/default/files/2017-01/Section%2093_10%202014-08%20GNB%20Flooded%20Classic%20Installation%20and%20Operation%20Manual%20Section_4.pdf
  - Quote: "All air moved by ventilation in the battery room or area should be exhausted into the outside atmosphere and should not be allowed to recirculate into other confined areas."
- **NRC guidance for vented lead-acid battery rooms: keep hydrogen well below 2 per cent by volume (US regulator, for contrast)**
  - Source: RG 1.128 Rev 3 Installation Design and Installation of Vented Lead-Acid Storage Batteries for Production and Utilization Facilities. https://www.nrc.gov/docs/ML2405/ML24052A077.pdf
  - Quote: "Battery room ventilation systems should be capable of maintaining the hydrogen concentration well below 2 percent, by volume"
- **CCOHS: hydrogen is explosive between about 4.1 and 72 per cent in air (a second range figure, for contrast)**
  - Source: Why is it important to follow safety procedures when charging batteries?. https://www.ccohs.ca/oshanswers/safety_haz/forklift/batteries.pdf
  - Quote: "the flammability or explosive limits are 4.1% to 72% hydrogen in air"
- **Valve-regulated cells recombine the gas to water unless the valve opens (HSE)**
  - Source: Using electric storage batteries safely INDG139. https://www.hse.gov.uk/PUBNS/indg139.pdf
  - Quote: "In valve-regulated batteries, any hydrogen and oxygen produced during charging does not escape but is converted back into water."
- **Valve-regulated batteries are much less likely to release hydrogen, but can vent if charged too hard or too long**
  - Source: Using electric storage batteries safely INDG139. https://www.hse.gov.uk/PUBNS/indg139.pdf
  - Quote: "Valve-regulated (‘maintenance-free’) batteries are much less likely to release hydrogen than vented batteries."
- **Battery University: sealed cells recombine oxygen and hydrogen at about 0.14 bar; repeated venting leads to dry-out**
  - Source: Bu 201 How Does The Lead Acid Battery Work. https://batteryuniversity.com/article/bu-201-how-does-the-lead-acid-battery-work
  - Quote: "The recombination occurs at a moderate pressure of 0.14 bar (2psi)."
- **The gas carries a mist of sulphuric acid (HSE) and vent plugs may throw out droplets**
  - Source: Using electric storage batteries safely INDG139. https://www.hse.gov.uk/PUBNS/indg139.pdf
  - Quote: "The gases that come out of a vented lead/acid battery during charging often contain a fine mist of sulphuric acid."
- **EnerSys VRLA sheet: the room needs ventilation to limit hydrogen accumulation**
  - Source: Installation, Operation and Maintenance Manual www.enersys.com Visit us at. https://www.enersys.com.cn/493bb4/globalassets/documents/product-documentation/supersafe/sbs-xl-2v/apac-en-iom-ss-sbsxl-0421.pdf
  - Quote: "The battery compartment/room must have adequate ventilation to limit hydrogen accumulation."
- **Contested: a full-scale test found hydrogen disperses uniformly through a battery room, not just under the ceiling (conference paper)**
  - Source: Hydrogen explosion hazards mitigation in industrial lead-acid battery rooms under different ventilation conditions Dorota Brzezińska Lodz University of Technology, Faculty. https://publications.ibpsa.org/proceedings/bs/2021/papers/bs2021_30678.pdf
  - Quote: "hydrogen dispersion in battery rooms is uniform in the entire room instead of its previously expected cumulation below the ceiling"
- **Contested: a safety site says hydrogen may accumulate near the ceiling of a poorly ventilated room (SECONDARY)**
  - Source: Batteries safety , LEAD-ACID,LITHIUM-ION and LITHIUM HSSE WORLD. https://hsseworld.com/lead-acid-lithium-ion-and-lithium-batteries-safety/
  - Quote: "hydrogen gas may accumulate near the ceiling and present a fire or explosion hazard"
- **HSE: gas trapped in the battery is released when a vented battery is moved; a violent explosion is likely in a confined or poorly ventilated battery room**
  - Source: Using electric storage batteries safely INDG139. https://www.hse.gov.uk/PUBNS/indg139.pdf
  - Quote: "If this happens in a confined space (eg inside the battery, or in an enclosure or a poorly ventilated battery room), a violent explosion is likely."
My reading: the standard's method (HSE cites BS EN 50272-2, now IEC 62485-2) is two steps. Step 1: gassing current, from the charging current in the worst case (the charger's fault current, HSE) and a gas-emission factor. Step 2: the air flow needed to keep hydrogen at a fraction of the 4 per cent LEL (the 0.4 per cent or 1 per cent HSE design limits), then the opening area for 0.1 m/s through it. HSE gives the compact form A = 0.3 N I S for natural ventilation (cm2), with S = 10 for workrooms and 4 for enclosures; Hoppecke gives A >= 28 x Q (cm2, Q in m3/h at 0.1 m/s). Heat and fluids built gases and flow, so both are an application of volume flow rate and velocity x area; Dan can check 28 against 1/(3600 x 0.1 m/s) = 0.00278 m2 per m3/h = 27.8 cm2 per m3/h. (My check; not a quote.) The course should not reproduce either standard's table; it needs only one worked case with the current stated.


### 4.6 Strings of cells: series and parallel, imbalance, and why one weak cell limits the string

- **Battery University: a weak cell in series goes empty first and can be pushed into reverse by the strong cells under load**
  - Source: Battery University | BU-803a: Cell Matching and Balancing. https://batteryuniversity.com/article/bu-803a-cell-mismatch-balancing
  - Quote: "The weak cell holds less capacity and is discharged more quickly than their strong brothers. Going empty first causes their strong brothers to overrun their feeble sibling to the point where a high load can push the weak cell into reverse polarity."
- **Battery University: on charge the weak cell reaches full first and goes into overcharge while the others still take charge**
  - Source: Battery University | BU-803a: Cell Matching and Balancing. https://batteryuniversity.com/article/bu-803a-cell-mismatch-balancing
  - Quote: "On charge, the weak cell reaches full charge first, and then goes into heat-generating overcharge, while the strong brothers still accept charge and stay cool."
- **Cell mismatch is a common cause of failure in industrial batteries**
  - Source: Battery University | BU-803a: Cell Matching and Balancing. https://batteryuniversity.com/article/bu-803a-cell-mismatch-balancing
  - Quote: "Cell mismatch is a common cause of failure in industrial batteries."
- **Lead acid cells also become mismatched; makers recommend equalising when cells differ by more than 0.10 V or 10 points of specific gravity**
  - Source: Battery University | BU-803a: Cell Matching and Balancing. https://batteryuniversity.com/article/bu-803a-cell-mismatch-balancing
  - Quote: "Manufacturers of golf cars, aerial work platforms, floor scrubbers and other battery-powered vehicles recommend an equalizing charge if the voltage difference between the cells is greater than +/– 0.10V, or if the specific gravity varies more than 10 points"
- **A 40-point specific gravity difference means the cell is considered defective**
  - Source: Battery University | BU-803a: Cell Matching and Balancing. https://batteryuniversity.com/article/bu-803a-cell-mismatch-balancing
  - Quote: "A difference in specific gravity of 40 points poses a performance problem and the cell is considered defective."
- **In a string with aging cells each cell has its own condition: a float current too high for a faded cell may sulfate its strong neighbour**
  - Source: Bu 403 Charging Lead Acid. https://batteryuniversity.com/article/bu-403-charging-lead-acid
  - Quote: "Weak cells may go into overcharge while strong cells remain in a starved state. A float current that is too high for the faded cell might sulfate the strong neighbor due to undercharge."
- **EnerSys: individual cell voltages may deviate from -0.05 to +0.10 V per cell in float, but the total must be within limits**
  - Source: Flooded Stationary Lead Acid Batteries IOM. https://www.enersys.com/492013/globalassets/documents/product-documentation/powersafe/opzs/amer/amer-en-iom-ps-flooded-0223.pdf
  - Quote: "Deviations of individual cell voltages of –0.05 to +0.10 V/c may be observed."
- **EnerSys: parallel strings need cables of equal resistance, same capacity, design and age, at most four strings**
  - Source: Flooded Stationary Lead Acid Batteries IOM. https://www.enersys.com/492013/globalassets/documents/product-documentation/powersafe/opzs/amer/amer-en-iom-ps-flooded-0223.pdf
  - Quote: "In the case of parallel connected strings use batteries of the same capacity, design and age only with a maximum of 4 parallel strings."
- **In series, the cell internal resistances add (LibreTexts, SECONDARY)**
  - Source: 6.6: Multi-loop Circuits - Physics LibreTexts. https://phys.libretexts.org/Courses/Kettering_University/Electricity_and_Magnetism_with_Applications_to_Amateur_Radio_and_Wireless_Technology/06%3A_Direct-Current_(DC)_Resistor_Circuits/6.06%3A_Multi-loop_Circuits
  - Quote: "The disadvantage of series connections of cells is that their internal resistances are additive."
- **MCA Second Engineer syllabus: series and parallel battery problems including internal resistance (the target skill)**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Solves problems involving batteries in series and in parallel combinations including internal resistance and current in a connected load."
- **Physics education research: students who think two batteries in series provide more energy tend to think they provide more voltage (and parallel the same)**
  - Source: PHYSICS EDUCATION RESEARCH SECTION Students’ understanding of direct current resistive electrical circuits. https://web.phys.ksu.edu/papers/2004/englehardt-beichner-ajp-1-04.pdf
  - Quote: "Students who believe that two batteries in series provide more energy (46%) also believe that they provide more voltage (51%)"
- **Cell reversal under load in a weak cell of a pack can make a permanent short (Battery University BU-502)**
  - Source: Bu 502 Discharging At High And Low Temperatures. https://batteryuniversity.com/article/bu-502-discharging-at-high-and-low-temperatures
  - Quote: "Known as cell reversal, the weak cell gets stressed to the point of developing a permanent electrical short."
My reading: "one weak cell limits the string" is a series-circuit statement (same current through all cells; the string is empty when the first cell is empty), and a charging statement (same charge current, so the weak cell overcharges first). Both are testable on a few lines of arithmetic, e.g. five 100 Ah cells and one 80 Ah cell, and fit lesson 6. The parallel-strings rule (equal cable resistance) is the same current-sharing arithmetic Dan already has from Design and verification (cable resistance, voltage drop).


### 4.7 Ageing and faults: sulfation, stratification, grid corrosion, dry-out, and how tests find them

- **Sulfation occurs when a lead acid battery is deprived of a full charge**
  - Source: Battery University | BU-804b: Sulfation and How to Prevent it. https://batteryuniversity.com/article/bu-804b-sulfation-and-how-to-prevent-it
  - Quote: "Sulfation occurs when a lead acid battery is deprived of a full charge."
- **Battery University: sulfate crystals large and stable on the negative plate reduce the active material**
  - Source: Battery University | BU-804b: Sulfation and How to Prevent it. https://batteryuniversity.com/article/bu-804b-sulfation-and-how-to-prevent-it
  - Quote: "During prolonged charge deprivation, however, the amorphous lead sulfate converts to a stable crystalline and deposits on the negative plates."
- **Reversible (soft) versus permanent (hard) sulfation**
  - Source: Battery University | BU-804b: Sulfation and How to Prevent it. https://batteryuniversity.com/article/bu-804b-sulfation-and-how-to-prevent-it
  - Quote: "There are two types of sulfation: reversible (or soft sulfation), and permanent (or hard sulfation)."
- **There is no simple way to measure sulfation; blind overcharge harms by promoting grid corrosion**
  - Source: Battery University | BU-804b: Sulfation and How to Prevent it. https://batteryuniversity.com/article/bu-804b-sulfation-and-how-to-prevent-it
  - Quote: "There are no simple methods to measure sulfation, nor are commercial chargers available that apply a calculated overcharge to dissolve the crystals."
- **Stratification: acid concentrates at the bottom and starves the upper half of the cell**
  - Source: Battery University | BU-804c: Acid Stratification and Surface Charge. https://batteryuniversity.com/article/bu-804c-acid-stratification-and-surface-charge
  - Quote: "The electrolyte of a stratified battery concentrates at the bottom, starving the upper half of the cell."
- **Stratification arises when the battery dwells at low charge, never gets a full charge, and has shallow discharges**
  - Source: Battery University | BU-804c: Acid Stratification and Surface Charge. https://batteryuniversity.com/article/bu-804c-acid-stratification-and-surface-charge
  - Quote: "Acid stratification occurs if the battery dwells at low charge (below 80 percent), never receives a full charge and has shallow discharges."
- **An equalising charge mixes the electrolyte by electrolysis and reverses stratification**
  - Source: Battery University | BU-804c: Acid Stratification and Surface Charge. https://batteryuniversity.com/article/bu-804c-acid-stratification-and-surface-charge
  - Quote: "Applying an equalizing charge by raising the voltage of a 12-volt battery to 16 volts for 1–2 hours also helps by mixing the electrolyte through electrolysis."
- **Battery University: grid corrosion is a "softening and shedding" of lead off the plates**
  - Source: BU-804a: Corrosion, Shedding and Internal Short - Battery University. https://batteryuniversity.com/article/bu-804a-corrosion-shedding-and-internal-short
  - Quote: "Corrosion occurs primarily on the grid, and it is known as a “softening and shedding” of the lead off the plates."
- **Overcharge feeds grid corrosion, especially in sealed cells**
  - Source: BU-804a: Corrosion, Shedding and Internal Short - Battery University. https://batteryuniversity.com/article/bu-804a-corrosion-shedding-and-internal-short
  - Quote: "Applying prolonged overcharge is another contributor to grid corrosion."
- **Sulfation can be reversed if serviced in time but corrosion is permanent**
  - Source: Battery University | BU-201: How does the Lead Acid Battery Work?. https://www.batteryuniversity.com/article/bu-201-how-does-the-lead-acid-battery-work/
  - Quote: "While sulfation can be reversed if serviced in time, corrosion is permanent."
- **Valve-regulated lead acid: excess charging causes gassing, venting and then dry-out**
  - Source: Bu 201 How Does The Lead Acid Battery Work. https://batteryuniversity.com/article/bu-201-how-does-the-lead-acid-battery-work
  - Quote: "Excess charging causes gassing, venting and subsequent water depletion and dry-out."
- **Valve-regulated cells: repeated venting should be avoided or dry-out follows**
  - Source: Bu 201 How Does The Lead Acid Battery Work. https://batteryuniversity.com/article/bu-201-how-does-the-lead-acid-battery-work
  - Quote: "Repeated venting should be avoided as this will lead to an eventual dry-out."
- **Heat: each 8 C above 25 C cuts VRLA life in half (Battery University)**
  - Source: Bu 201 How Does The Lead Acid Battery Work. https://batteryuniversity.com/article/bu-201-how-does-the-lead-acid-battery-work
  - Quote: "every 8°C (15°F) rise above this temperature threshold cuts battery life in half."
- **The main lead acid failure modes: depletion of active material, with plate/grid breakdown rising to 39 per cent in the BCI study**
  - Source: BU-804: How to Prolong Lead-acid Batteries - Battery University. https://batteryuniversity.com/article/bu-804-how-to-prolong-lead-acid-batteries
  - Quote: "According to the 2010 BCI Failure Modes Study, plate/grid-related breakdown has increased from 30 percent 5 years ago to 39 percent today."
- **Shorts accounted for 18 per cent of failures in the same study**
  - Source: BU-804a: Corrosion, Shedding and Internal Short - Battery University. https://batteryuniversity.com/article/bu-804a-corrosion-shedding-and-internal-short
  - Quote: "According to the 2010 BCI Failure Mode Study, shorted batteries accounted for 18 percent of battery failures"
- **Capacity is the leading health indicator and is hard to get on the fly**
  - Source: BU-905: Testing Lead Acid Batteries - Battery University. https://batteryuniversity.com/article/bu-905-testing-lead-acid-batteries
  - Quote: "Capacity, the leading health indicator of a battery, is difficult to obtain on the fly."
- **A resistance-only tester claiming to give capacity is misleading**
  - Source: BU-905: Testing Lead Acid Batteries - Battery University. https://batteryuniversity.com/article/bu-905-testing-lead-acid-batteries
  - Quote: "Stating that a battery tester measuring internal resistance will also provide capacity estimation is misleading."
- **Voltage and resistance do not correlate with capacity enough to predict end of life**
  - Source: Battery University | Battery Test Methods. https://www.batteryuniversity.com/article/battery-test-methods/
  - Quote: "Voltage and internal resistance do not correlate with capacity and fail to predict the end of battery life effectively, especially with Li-ion and lead acid systems."
- **IEEE 450 and 1188 both recommend replacing at below 80 per cent of rated capacity (via Megger guide)**
  - Source: Battery Testing Guide. https://res.cloudinary.com/iwh/image/upload/q_auto,g_center/assets/1/7/Megger_Battery_Testing_Guide.pdf
  - Quote: "Both IEEE 450 and IEEE 1188 recommend replacing the battery if its capacity is below 80% of manufacturer’s"
- **Megger: a 20 per cent rise in impedance in flooded lead-acid generally correlates with 80 per cent capacity; about 50 per cent in VRLA**
  - Source: Battery Testing Guide. https://res.cloudinary.com/iwh/image/upload/q_auto,g_center/assets/1/7/Megger_Battery_Testing_Guide.pdf
  - Quote: "Megger has found that a 20 percent increase in impedance for flooded lead-acid generally correlates to 80% battery capacity."
- **EPRI study: most cells had less than 80 per cent capacity once impedance rose to 150 per cent of nominal (via Vertiv/Battcon paper)**
  - Source: INTERNAL OHMIC MEASUREMENTS AND THEIR RELATIONSHIP TO BATTERY CAPACITY – EPRI’S ONGOING TECHNOLOGY EVALUATION. https://www.vertiv.com/48de51/globalassets/documents/battcon-static-assets/2002/internal-ohmic-measurements-and-their-relationship-to-battery-capacity---epris-ongoing-technology-evaluation.pdf
  - Quote: "Most cells had less than 80 percent capacity once impedance increased to 150 percent of the nominal impedance"
- **EPRI: all cells effectively dead once impedance tripled**
  - Source: INTERNAL OHMIC MEASUREMENTS AND THEIR RELATIONSHIP TO BATTERY CAPACITY – EPRI’S ONGOING TECHNOLOGY EVALUATION. https://www.vertiv.com/48de51/globalassets/documents/battcon-static-assets/2002/internal-ohmic-measurements-and-their-relationship-to-battery-capacity---epris-ongoing-technology-evaluation.pdf
  - Quote: "All cells were effectively dead once impedance increased to 300 percent of the nominal impedance (tripled)."
- **Megger: take a baseline at commissioning, test impedance yearly (flooded) and capacity at set intervals**
  - Source: Battery Testing Guide. https://res.cloudinary.com/iwh/image/upload/q_auto,g_center/assets/1/7/Megger_Battery_Testing_Guide.pdf
  - Quote: "Perform a capacity test when the battery is new as part of the acceptance test."
- **Megger: capacity test is the only way to get actual capacity**
  - Source: Battery Testing Guide. https://res.cloudinary.com/iwh/image/upload/q_auto,g_center/assets/1/7/Megger_Battery_Testing_Guide.pdf
  - Quote: "Capacity test is the only way to get an accurate value on the actual capacity of the battery."
- **Megger: trending of impedance and capacity watches batteries degrade and cuts emergency replacements**
  - Source: Battery Testing Guide. https://res.cloudinary.com/iwh/image/upload/q_auto,g_center/assets/1/7/Megger_Battery_Testing_Guide.pdf
  - Quote: "Trending of battery data, especially impedance and capacity, is an excellent tool for budgetary planning."
- **Megger: an example trend, the first ten or eleven measurements fine then a steady upward trend (the Statistics link)**
  - Source: Battery Testing Guide. https://res.cloudinary.com/iwh/image/upload/q_auto,g_center/assets/1/7/Megger_Battery_Testing_Guide.pdf
  - Quote: "The first ten or eleven measurements seemed to be fine and then a steady upward trend is very noticeable."
- **Vertiv/Battcon tips: deviations of 30-50 per cent from baseline in ohmic readings are cause for concern**
  - Source: TIPS AND TRICKS FOR BATTERY SERVICE TECHNICIANS. https://www.vertiv.com/48dfb9/globalassets/documents/battcon-static-assets/2010/the-inspection-is-complete.-what-are-you-doing-with-the-data.pdf
  - Quote: "Significant deviations in ohmic readings, 30%-50% for example from baseline should be considered cause for concern."
- **Impedance includes DC resistance and reactance (the AC circuits link)**
  - Source: Battery Testing Guide. https://res.cloudinary.com/iwh/image/upload/q_auto,g_center/assets/1/7/Megger_Battery_Testing_Guide.pdf
  - Quote: "Impedance measures both the DC resistance (the real component in impedance) and the reactance (the imaginary components in impedance)."
- **Impedance test is a four-wire (Kelvin) measurement across each cell or connector**
  - Source: Battery Testing Guide. https://res.cloudinary.com/iwh/image/upload/q_auto,g_center/assets/1/7/Megger_Battery_Testing_Guide.pdf
  - Quote: "The impedance test is a true four-wire, Kelvin-type measurement"
- **IEEE 450 inspection items: float voltage, ripple, pilot-cell temperature and specific gravity, unintentional grounds**
  - Source: Battery Testing Guide. https://res.cloudinary.com/iwh/image/upload/q_auto,g_center/assets/1/7/Megger_Battery_Testing_Guide.pdf
  - Quote: "voltage, ripple voltage, ripple current, charger output current and voltage, ambient temperature, voltage and electrolyte temperature at pilot cells, battery float charging current or specific gravity at pilot cells, unintentional battery grounds etc."
- **EnerSys VRLA sheet: keep a logbook of values, power outages and discharge tests**
  - Source: Instruction Sheet. https://www.enersys.com/493bb4/globalassets/documents/product-documentation/powersafe/sbs-xl/amer/am-sbsxl-is-aa_0619.pdf
  - Quote: "Keep a logbook to record values, power outages, discharge tests, etc."
- **NRC technical report: replace VRLA cells below 80 per cent; if internal resistance rises over 50 per cent from initial the cell is likely beyond end of life**
  - Source: TLR-RES/DE-2025-010 Valve-Regulated Lead-Acid (VRLA) Battery Technology for Backup Power Supplies in Nuclear Installations. https://www.nrc.gov/docs/ML2604/ML26041A257.pdf
  - Quote: "If the internal resistance increases by >50% from the initial value, the battery is highly likely to have lost 20% or more of the original capacity"
My reading: this is where Statistics for engineers is used: fit a trend to quarterly impedance on one cell, compare with the string average (a z-score or a simple "more than X per cent from baseline"), decide when to schedule a capacity test. All the public sources agree on three tests and one rule: cell voltage and specific gravity (cheap, frequent), impedance trending (a baseline then a percentage rise), and a discharge capacity test (the only true capacity), with 80 per cent of rated capacity as the replacement line. They disagree on the percentage rise that matches 80 per cent: about 20 per cent (flooded, Megger), 30-40 per cent (sealed, IEEE 1188 as Megger reads it), 50 per cent (VRLA, Megger), 50 per cent of initial (NRC technical review), and 150 per cent of nominal impedance (EPRI), so the course should teach a baseline-and-trend habit and say the threshold is the maker's or the plant's, not a law.


### 4.8 Safety and other chemistries: short-circuit current, acid, isolation, DC; nickel-cadmium and lithium-ion in outline

- **Vertiv: a shorted lead acid battery can deliver 100 to 1000 times its normal discharge current**
  - Source: CALCULATED VS. ACTUAL SHORT CIRCUIT CURRENTS FOR VRLA BATTERIES. https://www.vertiv.com/48dfcf/globalassets/documents/battcon-static-assets/2003/calculated-vs.-actual-short-circuit-currents-for-vrla-batteries.pdf
  - Quote: "A “shorted” lead acid battery has the capability of delivering an extremely high current, 100 to 1000 times the typical discharge current used in most applications."
- **Vertiv: short-circuit current is open-circuit voltage divided by internal resistance**
  - Source: CALCULATED VS. ACTUAL SHORT CIRCUIT CURRENTS FOR VRLA BATTERIES. https://www.vertiv.com/48dfcf/globalassets/documents/battcon-static-assets/2003/calculated-vs.-actual-short-circuit-currents-for-vrla-batteries.pdf
  - Quote: "A battery’s short circuit current is typically estimated by dividing its open circuit voltage by its internal resistance."
- **Vertiv: Isc = Vbatt / (Rbatt + Rexternal), with 2.0 V per cell**
  - Source: CALCULATED VS. ACTUAL SHORT CIRCUIT CURRENTS FOR VRLA BATTERIES. https://www.vertiv.com/48dfcf/globalassets/documents/battcon-static-assets/2003/calculated-vs.-actual-short-circuit-currents-for-vrla-batteries.pdf
  - Quote: "The short circuit current (ISC ) for a battery system can be predicted using Ohm’s law, as follows ISC = VBATT / RTOTAL"
- **Vertiv: the current reaches its steady value within 5-10 ms (battery circuits have little inductance)**
  - Source: CALCULATED VS. ACTUAL SHORT CIRCUIT CURRENTS FOR VRLA BATTERIES. https://www.vertiv.com/48dfcf/globalassets/documents/battcon-static-assets/2003/calculated-vs.-actual-short-circuit-currents-for-vrla-batteries.pdf
  - Quote: "Note that steady state minimum voltage and maximum current conditions were attained within 5 to 10 milliseconds."
- **Vertiv: a worked case, 480 V string, 0.160 + 0.028 ohm gives a predicted 2550 A against a measured 2530 A**
  - Source: CALCULATED VS. ACTUAL SHORT CIRCUIT CURRENTS FOR VRLA BATTERIES. https://www.vertiv.com/48dfcf/globalassets/documents/battcon-static-assets/2003/calculated-vs.-actual-short-circuit-currents-for-vrla-batteries.pdf
  - Quote: "Using the equation above, we predicted a short circuit current of 2550 amps [480V / (0.160 + 0.028)], which compares reasonably with the actual measured average steady state test result of 2530 amps"
- **Vertiv: battery short circuit current falls only slowly with state of charge (over 90 per cent of nominal at about 60 per cent charge)**
  - Source: CALCULATED VS. ACTUAL SHORT CIRCUIT CURRENTS FOR VRLA BATTERIES. https://www.vertiv.com/48dfcf/globalassets/documents/battcon-static-assets/2003/calculated-vs.-actual-short-circuit-currents-for-vrla-batteries.pdf
  - Quote: "The short circuit current stays relatively high even for low states of charge; for example, currents exceeded 90% of nominal even at ~60% state of charge."
- **Vertiv: accurate short-circuit values are needed to size the protective device**
  - Source: CALCULATED VS. ACTUAL SHORT CIRCUIT CURRENTS FOR VRLA BATTERIES. https://www.vertiv.com/48dfcf/globalassets/documents/battcon-static-assets/2003/calculated-vs.-actual-short-circuit-currents-for-vrla-batteries.pdf
  - Quote: "Accurate battery system short circuit current and resistance values are required to properly size and select the proper circuit protection device."
- **NRC/BNL review: the peak short-circuit current of a battery is limited by its internal resistance including the intercell connectors**
  - Source: NUREG/CR-XXXX. https://www.osti.gov/servlets/purl/1188216
  - Quote: "The peak short-circuit current that a battery can deliver is limited by its internal resistance including the intercell connectors."
- **NRC/BNL review citing a guide: large batteries can discharge up to 40,000 A for several seconds**
  - Source: NUREG/CR-XXXX. https://www.osti.gov/servlets/purl/1188216
  - Quote: "states that large batteries can discharge up to 40,000 A for several seconds."
- **NRC/BNL review: a shorted battery behaves like a fault through a resistor (little inductance)**
  - Source: NUREG/CR-XXXX. https://www.osti.gov/servlets/purl/1188216
  - Quote: "Batteries contain little inductance and, as stated by one large UPS manufacturer, a shorted battery is similar to a fault through a resistor."
- **NRC/BNL: total DC fault current is the sum of battery, charger and motor contributions**
  - Source: NUREG/CR-XXXX. https://www.osti.gov/servlets/purl/1188216
  - Quote: "Total short-circuit current is the sum of that delivered by the battery, the charger, and motors."
- **EnerSys 12 V 70 Ah block: 6.95 milliohm internal resistance and 1814 A short-circuit current (a data row; my check 12.6 V / 0.00695 ohm = 1813 A)**
  - Source: Battery Range Summary. https://www.enersys.com/493bb4/globalassets/documents/product-documentation/powersafe/v-tt/emea/en-v-rs-013.pdf
  - Quote: "12V70 12 68 70 314 164 204 224 24.9 1814 6.95 M6 F V1"
- **EnerSys vented manual: exposed metal parts of a battery are always live; avoid short circuits; unpack carefully**
  - Source: Flooded Stationary Lead Acid Batteries IOM. https://www.enersys.com/492013/globalassets/documents/product-documentation/powersafe/opzs/amer/amer-en-iom-ps-flooded-0223.pdf
  - Quote: "Exposed metal parts of the battery always carry a voltage and are electrically live (risk of short circuits)."
- **EnerSys vented manual: electrolyte is highly corrosive; wash acid splash with plenty of clean water**
  - Source: Flooded Stationary Lead Acid Batteries IOM. https://www.enersys.com/492013/globalassets/documents/product-documentation/powersafe/opzs/amer/amer-en-iom-ps-flooded-0223.pdf
  - Quote: "Electrolyte is highly corrosive. Wash all acid splash in eyes or on skin with plenty of clean water and seek immediate medical assistance."
- **HSE SR18: do not rest tools on a battery; switch off circuits before connecting or disconnecting**
  - Source: COSHH SR18. https://www.hse.gov.uk/pubns/guidance/sr18.pdf
  - Quote: "Raise the battery cover to help disperse hydrogen and switch off all electrical circuits before connecting or disconnecting batteries."
- **HSE SR18: never rest metal objects such as tools on top of a battery**
  - Source: COSHH SR18. https://www.hse.gov.uk/pubns/guidance/sr18.pdf
  - Quote: "Don’t rest metal objects (eg tools) on top of a battery."
- **HSE: sulphuric acid and potassium hydroxide are the two electrolytes; both corrosive and poisonous**
  - Source: Using electric storage batteries safely INDG139. https://www.hse.gov.uk/PUBNS/indg139.pdf
  - Quote: "Batteries are usually filled with solutions (electrolytes) containing either sulphuric acid or potassium hydroxide."
- **MCA MSN 1860: safe isolation of equipment before personnel work on it**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "Safe isolation of equipment and associated system before personnel are permitted to work on the plant or equipment"
- **EnerSys: the standards' protective measures (IEC 62485-2) must be observed**
  - Source: Flooded Stationary Lead Acid Batteries IOM. https://www.enersys.com/492013/globalassets/documents/product-documentation/powersafe/opzs/amer/amer-en-iom-ps-flooded-0223.pdf
  - Quote: "The protective measures according to IEC 62485-2 must be observed."
- **NiCd: low cell voltage of 1.20 V, so many cells are needed for a high voltage (Battery University)**
  - Source: Bu 203 Nickel Based Batteries. https://batteryuniversity.com/article/bu-203-nickel-based-batteries
  - Quote: "Low cell voltage of 1.20V requires many cells to achieve high voltage"
- **NiCd: one of the most rugged and forgiving batteries; good low-temperature performance**
  - Source: Bu 203 Nickel Based Batteries. https://batteryuniversity.com/article/bu-203-nickel-based-batteries
  - Quote: "The standard NiCd remains one of the most rugged and forgiving batteries"
- **NiCd/NiFe use potassium hydroxide, which is not consumed in the reaction, so specific gravity is not a state-of-charge indicator (Megger)**
  - Source: Battery Testing Guide. https://res.cloudinary.com/iwh/image/upload/q_auto,g_center/assets/1/7/Megger_Battery_Testing_Guide.pdf
  - Quote: "since the potassium hydroxide electrolyte isn’t used in the chemical reaction, it is not necessary to measure it periodically."
- **Nickel-iron: 1.20 V per cell, resilient to overcharge, over 20 years in standby (Battery University)**
  - Source: Bu 203 Nickel Based Batteries. https://batteryuniversity.com/article/bu-203-nickel-based-batteries
  - Quote: "NiFe is resilient to overcharge and over-discharge and can last for more than 20 years in standby applications."
- **Battery University: NiCd is used where long service life, high discharge current and extreme temperatures are required**
  - Source: BU-107: Comparison Table of Secondary Batteries - Battery University. https://batteryuniversity.com/article/bu-107-comparison-table-of-secondary-batteries
  - Quote: "NiCd is used where long service life, high discharge current and extreme temperatures are required."
- **Li-ion: nominal cell voltage of about 3.60 V, flat discharge curve, low maintenance**
  - Source: Bu 204 How Do Lithium Batteries Work. https://batteryuniversity.com/article/bu-204-how-do-lithium-batteries-work
  - Quote: "The nominal cell voltage of 3.60V can directly power mobile phones, tablets and digital cameras"
- **Li-ion needs a protection circuit against thermal runaway when stressed**
  - Source: Bu 204 How Do Lithium Batteries Work. https://batteryuniversity.com/article/bu-204-how-do-lithium-batteries-work
  - Quote: "Requires protection circuit to prevent thermal runaway if stressed"
- **Li-ion: metal-lithium dendrites short the cell; Li-ion is safe provided voltage and current limits are respected**
  - Source: Bu 204 How Do Lithium Batteries Work. https://batteryuniversity.com/article/bu-204-how-do-lithium-batteries-work
  - Quote: "Although lower in specific energy than lithium-metal, Li ion is safe, provided the voltage and currents limits are being respected."
- **Li-ion needs a protection circuit that stops the weakest cell being over-discharged and the string over-charged per cell**
  - Source: Battery University | BU-803a: Cell Matching and Balancing. https://batteryuniversity.com/article/bu-803a-cell-mismatch-balancing
  - Quote: "All Li-ion cells require a protection circuit that assures that serially connected cells do not exceed 4.25V/cell (most Li-ion) on charge"
- **Battery University BU-107: Li-ion replaces many applications once served by lead and nickel, but needs a protection circuit**
  - Source: BU-107: Comparison Table of Secondary Batteries - Battery University. https://batteryuniversity.com/article/bu-107-comparison-table-of-secondary-batteries
  - Quote: "Li-ion is replacing many applications that were previously served by lead and nickel-based batteries."
- **Lithium-ion batteries on boats carry safety concerns of thermal runaway and off-gassing (a marine maker's page, SECONDARY)**
  - Source: Marine Battery Design and Installation - ODYSSEY Battery. https://www.odysseybattery.com/blog/2024/11/11/marine-battery-design-and-installation
  - Quote: "Lithium-ion batteries are also an option for boat owners, but they come with some inherent safety concerns due to thermal runaway and off-gas generation."
- **Valve-regulated batteries are not accepted as gas-free for emergency battery rooms in a Netherlands shipping circular (SECONDARY, one flag state)**
  - Source: Nr. 34 Rev.1 Only valid for existing ships Guidance for review of electr. installations in ships to which the Neth. Shipping Act is applicable - Netherlands Regulatory Framework (NeRF) – Maritime. https://puc.overheid.nl/nsi/doc/PUC_1234_14/1
  - Quote: "”Valve regulated batteries” are not accepted or recognized as gas free batteries."
My reading for what the course should and should not do: it can teach the outline (cell voltage 2.0, 1.2, 3.6 or 3.7 V; electrolyte acid, alkali or organic; what is checked to know state of charge; main hazard) in one lesson after the lead-acid detail. It should not teach a Li-ion or NiCd charger. The short-circuit lesson is the one genuinely new calculation and fits Dan's Design and verification ground (prospective fault current, I = V / R, breaking capacity): the novelty is that the source is a battery whose internal resistance is milliohms, and that "turn it off" is not possible at the cells.


## 5. Prerequisites: what this topic leans on, and what Dan has

My mapping, from the scope in section 4 against the courses Dan has built. None of it is a quote.

| Skill in this course | What it leans on | Where Dan has it | Teach inline? |
|---|---|---|---|
| 1 The cell | Redox in outline (oxidation = losing electrons); the idea of a potential difference | Not in the built courses; Electronics gave diodes (a junction potential) | Yes: one screen on "two plates, a fixed voltage gap, set by chemistry not size". Avoid half-equations (MCA asks "without chemical formulae") |
| 2 State of charge | Ratios, a graph read, a percentage; density as a ratio to water | Foundational maths (ratios, percentages), Proportional reasoning; Heat and fluids (density, pressure) | Hydrometer reading and the temperature correction sign, inline |
| 3 Capacity and rate | Ohm's law, V = E - Ir, powers and logarithms, a straight line on log-log axes | Algebra (Powers and roots, Exponentials and logarithms, Straight-line graphs), Design and verification (voltage drop) | Peukert as a power-law fit: uses logs directly; inline: C-rate and ampere-hours (a unit, a rate) |
| 4 Charging | Constant current vs constant voltage; a regulated converter | Electronics and power electronics (the charger and the converter): use, do not re-teach | Only the cell-side meaning of each stage |
| 5 Gassing and hydrogen | Volume flow rate = area x velocity; gas mixture percentages; flammable range | Heat and fluids (gases, flow, pressure); Mechanics (units); Percentages | Inline: the HSE form A = 0.3 N I S and why 0.1 m/s; the idea of a dilution factor |
| 6 Strings | Series and parallel circuits; current sharing; resistance of cables | Linear systems; Design and verification; AC circuits | Weakest-cell arithmetic only |
| 7 Ageing and tests | Trending, baselines, percentage change, a line fit, an outlier | Statistics for engineers (trending), Exponentials and logarithms | Inline: impedance as a four-wire test (the AC circuits phasor idea of impedance helps) |
| 8 Safety, chemistries | Prospective fault current I = V/R; breaking capacity; insulation resistance | Design and verification (fault current, protective devices), HV Subsea Cable Testing (insulation, earth) | Inline: the milliohm internal resistance and why isolation of cells is not possible |

**Hand-offs.** The sibling course Insulated systems and earth faults (same folder, built alongside this one) owns insulated DC systems and earth detection. The IEEE 450 inspection list names "unintentional battery grounds" (quote at 2.3), and the MIN 654 syllabus names earth faults and Megger readings next to battery lines (quote at 3.2). This course points at that ground and stops there. Batteries is the last course in the Supply systems folder (the shelf file lists Insulated systems and earth faults, then Batteries); the next folder is Installation design. The Navy's marine engineering course (next year) owns marine and submarine plant.

**Not taught here (Dan has it):** how a charger works (Electronics), unit conversions, Ohm's law, series and parallel, logarithms, trending (Statistics), volume flow and gases (Heat and fluids), fault current and protective device selection (Design and verification).


## 6. Misconceptions and learning science, for each skill, with sources


### 6.1 Circuit-level ideas about a battery (physics education research)

- **Interviews: the idea that the battery is a constant source of current was used most often**
  - Source: PHYSICS EDUCATION RESEARCH SECTION Students’ understanding of direct current resistive electrical circuits. https://web.phys.ksu.edu/papers/2004/englehardt-beichner-ajp-1-04.pdf
  - Quote: "During interviews, the idea that the battery is a constant source of current was used most often in answering the questions."
- **Students hold multiple misconceptions even after instruction**
  - Source: PHYSICS EDUCATION RESEARCH SECTION Students’ understanding of direct current resistive electrical circuits. https://web.phys.ksu.edu/papers/2004/englehardt-beichner-ajp-1-04.pdf
  - Quote: "The analysis indicates that students, especially females, tend to hold multiple misconceptions, even after instruction."
- **"Battery supplies same amount of current to each circuit regardless of the circuit's arrangement"**
  - Source: PHYSICS EDUCATION RESEARCH SECTION Students’ understanding of direct current resistive electrical circuits. https://web.phys.ksu.edu/papers/2004/englehardt-beichner-ajp-1-04.pdf
  - Quote: "Battery supplies same amount of current to each circuit regardless of the circuit’s arrangement"
- **"Current consumed": current decreases as it passes elements until none is left at the battery**
  - Source: PHYSICS EDUCATION RESEARCH SECTION Students’ understanding of direct current resistive electrical circuits. https://web.phys.ksu.edu/papers/2004/englehardt-beichner-ajp-1-04.pdf
  - Quote: "Current consumed Current value decreases as you move through circuit elements until you return to the battery where there is no more current left"
- **Students assign the properties of energy to current, then to voltage and resistance**
  - Source: PHYSICS EDUCATION RESEARCH SECTION Students’ understanding of direct current resistive electrical circuits. https://web.phys.ksu.edu/papers/2004/englehardt-beichner-ajp-1-04.pdf
  - Quote: "Students assign the properties of energy to current, and then assign these properties to voltage and resistance."
- **Persistence: current-consumed misconception holds despite several years of teaching (Dupin and Johsua 1987, IOP Spark summary)**
  - Source: Dupin and Johsua (1987) | IOPSpark. https://spark.iop.org/dupin-and-johsua-1987
  - Quote: "Students maintain the misconception that current is consumed by components despite several years of teaching to address the issue."
- **Battery as constant voltage, not constant current (POE-A study, 2020)**
  - Source: The Effectiveness of Predict-Observe-Explain-Animation (POE-A) Strategy to Overcome Students’ Misconceptions about Electric Circuits Concepts. http://recsam.edu.my/sub_lsmjournal/images/docs/2020/2020_1_NFMN_0115.pdf
  - Quote: "They tend to think of the battery as a constant current source instead of constant voltage source."
- **A predict-observe-explain strategy aimed at conceptual change in circuits (learning-science approach)**
  - Source: The Effectiveness of Predict-Observe-Explain-Animation (POE-A) Strategy to Overcome Students’ Misconceptions about Electric Circuits Concepts. http://recsam.edu.my/sub_lsmjournal/images/docs/2020/2020_1_NFMN_0115.pdf
  - Quote: "In this study, the POE-A teaching strategy which focuses on students’ conceptual change is used to address student misconceptions in electrical circuits."
- **McDermott: persistent difficulty: belief that the battery is a constant current source**
  - Source: 1306 NFW 1_PreWorkshop.pptx. https://www.aapt.org/Conferences/newfaculty/upload/McDermott_1306_NFW.pdf
  - Quote: "belief that the battery is a constant current source"
- **McDermott: the basic underlying difficulty is the lack of a conceptual model**
  - Source: 1306 NFW 1_PreWorkshop.pptx. https://www.aapt.org/Conferences/newfaculty/upload/McDermott_1306_NFW.pdf
  - Quote: "lack of a conceptual model for an electric circuit"
- **McDermott: the word misconception may trivialize the problem**
  - Source: 1306 NFW 1_PreWorkshop.pptx. https://www.aapt.org/Conferences/newfaculty/upload/McDermott_1306_NFW.pdf
  - Quote: "Use of term ‘ _misconception_ ’ may # trivialize the problem"
- **Physics Classroom: circuits are about energy, not charge; a dead cell is out of energy**
  - Source: Physics Tutorial - Electric Circuits - Electric Current - Common Misconceptions Regarding Electric Circuits. https://www.physicsclassroom.com/tutorial/electric-circuits/electric-current/common-misconceptions-regarding-electric-circuits
  - Quote: "Electric circuits are all about energy, not charge. When a battery no longer works, it is out of energy."
- **Physics Classroom: the energy-producing reaction in a cell is reversible, and the recharger supplies the energy**
  - Source: Physics Tutorial - Electric Circuits - Electric Current - Common Misconceptions Regarding Electric Circuits. https://www.physicsclassroom.com/tutorial/electric-circuits/electric-current/common-misconceptions-regarding-electric-circuits
  - Quote: "The reaction can be run in the reverse direction, turning the chemical products back into chemical reactants within the cell."
Skill 3 and 6 link: a cell is better treated as a voltage source with a small internal resistance (so loaded voltage falls with current) than as a constant-current source. This is the recurring fix in every source in 6.1.


### 6.2 Electrochemistry (the cell, skill 1)

- **RSC: many studies show students hold misconceptions about electrochemistry; instructional and experiential origins**
  - Source: Overcoming electrochemistry misconceptions | News | RSC Education. https://edu.rsc.org/education-research/overcoming-electrochemistry-misconceptions/4018187.article
  - Quote: "Many studies have shown that students hold misconceptions about electrochemistry."
- **RSC: a common misconception is that electrons flow through the solution from one electrode to the other**
  - Source: Overcoming electrochemistry misconceptions | News | RSC Education. https://edu.rsc.org/education-research/overcoming-electrochemistry-misconceptions/4018187.article
  - Quote: "Another common misconception exposed was that electrons flow through the solution from one electrode to another."
- **RSC: also that ions carry electrons between electrodes**
  - Source: Overcoming electrochemistry misconceptions | News | RSC Education. https://edu.rsc.org/education-research/overcoming-electrochemistry-misconceptions/4018187.article
  - Quote: "Some students also thought ions accept electrons at one electrode and carry them to the other"
- **RSC: students assume reduction and oxidation can occur independently (cell reactions)**
  - Source: Overcoming electrochemistry misconceptions | News | RSC Education. https://edu.rsc.org/education-research/overcoming-electrochemistry-misconceptions/4018187.article
  - Quote: "They sometimes assume that reduction and oxidation can occur independently."
- **RSC teaching tip: link macroscopic phenomena, sub-microscopic explanation and symbols explicitly**
  - Source: Overcoming electrochemistry misconceptions | News | RSC Education. https://edu.rsc.org/education-research/overcoming-electrochemistry-misconceptions/4018187.article
  - Quote: "Explicitly link these to the symbolic domain; this is key to addressing electrochemical problems."
- **RSC teaching tip: use animations and simulations for the sub-microscopic level**
  - Source: Overcoming electrochemistry misconceptions | News | RSC Education. https://edu.rsc.org/education-research/overcoming-electrochemistry-misconceptions/4018187.article
  - Quote: "help students understand chemical procedures and concepts in electrochemistry"
- **Study of two cohorts: average scores below 40 per cent on an electrochemistry concept test**
  - Source: Overcoming electrochemistry misconceptions | News | RSC Education. https://edu.rsc.org/education-research/overcoming-electrochemistry-misconceptions/4018187.article
  - Quote: "The average scores of both student sets were below 40%"
- **A pedagogical-agent study: students display misconceptions about electrochemistry because the concepts are abstract**
  - Source: Misconceptions in Electrochemistry: How Do Pedagogical Agents Help? | Springer Nature Link. https://link.springer.com/chapter/10.1007/978-981-10-3437-4_6
  - Quote: "Previous research has shown that students display misconceptions about electrochemistry due to the abstract concepts in this topic."

### 6.3 EMF, terminal voltage and internal resistance (skill 3), from examiner reports

- **AQA A-level Physics Paper 1, June 2023: common errors included using the emf as the terminal pd**
  - Source: Examiner report (A-level) : Paper 1 - June 2023. https://www.aqa.org.uk/files/sample-papers-and-mark-schemes.2023.june.AQA-74081-WRE-JUN23_PDF/04069094b48e7fe0278255ddff275d6fd98824e0.pdf
  - Quote: "Common errors included using the emf as the terminal pd or rounding early."
- **AQA June 2023: many students missed out any reference to the internal resistance of the cell**
  - Source: Examiner report (A-level) : Paper 1 - June 2023. https://www.aqa.org.uk/files/sample-papers-and-mark-schemes.2023.june.AQA-74081-WRE-JUN23_PDF/04069094b48e7fe0278255ddff275d6fd98824e0.pdf
  - Quote: "Many students also missed out any reference to the internal resistance of the cell."
- **AQA AS Physics Paper 2, June 2017: significant gaps in understanding emf, terminal pd and resistance**
  - Source: AS Physics Examiner report Paper 2 June 2017. https://www.a-levelpastpapers.co.uk/uploads/9/6/0/2/96027112/aqa_as-level_physics_paper_2_examiner_report_2017.pdf
  - Quote: "Students had difficulty with this question, suggesting significant gaps in their understanding of emf, terminal pd and resistance."
- **AQA June 2017: with an ideal voltmeter and no current, terminal pd equals emf; the voltmeter cannot read the lost volts directly**
  - Source: AS Physics Examiner report Paper 2 June 2017. https://www.a-levelpastpapers.co.uk/uploads/9/6/0/2/96027112/aqa_as-level_physics_paper_2_examiner_report_2017.pdf
  - Quote: "students should recognise that the current is zero and therefore the terminal pd equals the emf."
- **Cambridge International AS/A Physics, June 2024: confusion about the effect of internal resistance on terminal pd**
  - Source: PHYSICS. https://www.cambridgeinternational.org/Images/567861-june-2024-examiner-report.pdf
  - Quote: "Some candidates selected the incorrect option D , suggesting a confusion about the effect of internal resistance on terminal"
- **OCR A-level Physics A, June 2024: candidates could find the emf but were less certain on the internal resistance**
  - Source: A Level Physics A - H556/02 - Summer 2024. https://www.ocr.org.uk/Images/726281-examiners-report-exploring-physics.pdf
  - Quote: "They were able to identify how to obtain the emf correctly but less certain on the internal resistance"
- **Pearson Edexcel IAL Physics WPH12, Jan 2024: most common answer was that with nothing connected to the battery there would be no emf**
  - Source: Examiners’ Report Principal Examiner Feedback January 2024. https://qualifications.pearson.com/content/dam/pdf/International-Advanced-Level/Physics/2018/Exam-materials/wph12-01-pef-20240307.pdf
  - Quote: "The most common answer was a statement that as there were no other components connected to the battery there would be no emf."
- **Revision-site summary of the AQA reports (SECONDARY): never use emf as terminal pd**
  - Source: 7408/3A — June 2022 AQA A Level Physics Examiner Report. https://www.papersdaddy.com/aqa/a-level/physics-7407/2022-june/AQA-74083A-WRE-JUN22.PDF
  - Quote: "Never use emf as terminal pd."

### 6.4 State of charge, capacity and testing (skills 2, 3, 7)

- **Most state-of-charge readings rely on voltage because it is simple, despite the inaccuracy**
  - Source: Bu 903 How To Measure State Of Charge. https://batteryuniversity.com/article/bu-903-how-to-measure-state-of-charge
  - Quote: "In spite of inaccuracies, most SoC measurements rely in part or completely on voltage because of simplicity."
- **A stratified battery looks more charged than it is**
  - Source: Battery University | BU-804c: Acid Stratification and Surface Charge. https://batteryuniversity.com/article/bu-804c-acid-stratification-and-surface-charge
  - Quote: "while the high acid concentration on the bottom makes the battery appear more charged than it is"
- **A surface charge gives a false state of charge but is not a defect**
  - Source: Battery University | BU-804c: Acid Stratification and Surface Charge. https://batteryuniversity.com/article/bu-804c-acid-stratification-and-surface-charge
  - Quote: "Surface charge is not a battery defect but a reversible condition."
- **Never add acid to top up: it raises the specific gravity too high and causes corrosion**
  - Source: Battery University | BU-804c: Acid Stratification and Surface Charge. https://batteryuniversity.com/article/bu-804c-acid-stratification-and-surface-charge
  - Quote: "Never add acid. This would raise the specific gravity too high and cause excessive corrosion."
- **Resistance-based testers predict state of health little better than a coin toss**
  - Source: BU-905: Testing Lead Acid Batteries - Battery University. https://batteryuniversity.com/article/bu-905-testing-lead-acid-batteries
  - Quote: "Most resistance-based testers deliver state-of-health predictions that are not much better than 5 correct in 10, results that can be compared with tossing a coin."
- **Equalising one cell may cover a defective cell only briefly; the flaw resurfaces**
  - Source: Battery University | BU-803a: Cell Matching and Balancing. https://batteryuniversity.com/article/bu-803a-cell-mismatch-balancing
  - Quote: "A charge may temporarily cover the deficiency, but the flaw will likely resurface again after a few hours due to the high self-discharge of the faulty cell."
- **Peukert's exponent is a rough fit: a fixed exponent over-predicts capacity at very high current**
  - Source: 8. Battery capacity and Peukert exponent. https://www.victronenergy.com/media/pg/BMV-700/en/battery-capacity-and-peukert-exponent.html
  - Quote: "In case of very high currents, the battery will give even less capacity than predicted by a fixed exponent."
- **Peukert vs real discharge: two different capacity-limiting mechanisms, so the log-log plot is not straight (research paper)**
  - Source: Faster Lead-Acid Battery Simulations from Porous-Electrode Theory: Part I. Physical Model ValentinSulzer, S.JonChapman, ColinP.Please, DavidA.Howey, andCharlesW.Monroe Mathematical Institute, University of. https://ora.ox.ac.uk/objects/uuid:3b546aa6-414f-4bc3-8188-10a75a8d8113/files/m37a7ad0092fd7cd0d12c64f14dc03068
  - Quote: "deviations from linearity occur because there are two distinct capacity-limiting mechanisms."

### 6.5 Charging, gassing and safety (skills 4, 5, 8)

- **Overcharging beyond limits turns the energy into heat and gas**
  - Source: Bu 403 Charging Lead Acid. https://batteryuniversity.com/article/bu-403-charging-lead-acid
  - Quote: "Charging beyond the specified limits turns redundant energy into heat and the battery begins to gas."
- **Blind overcharge or pulse "desulfators" can promote grid corrosion**
  - Source: Battery University | BU-804b: Sulfation and How to Prevent it. https://batteryuniversity.com/article/bu-804b-sulfation-and-how-to-prevent-it
  - Quote: "Applying random pulses or blindly inducing an overcharge can harm the battery by promoting grid corrosion."
- **Some makers do not recommend anti-sulfation devices as they tend to create soft shorts**
  - Source: Battery University | BU-804b: Sulfation and How to Prevent it. https://batteryuniversity.com/article/bu-804b-sulfation-and-how-to-prevent-it
  - Quote: "some battery manufacturers do not recommend the treatment as it tends to create soft shorts that may increase"
- **Valve-regulated cells are less tolerant to overcharge than flooded cells**
  - Source: Bu 403 Charging Lead Acid. https://batteryuniversity.com/article/bu-403-charging-lead-acid
  - Quote: "This is especially critical for sealed systems because they are less tolerant to overcharge than the flooded type."
- **HSE: valve-regulated is not "no hydrogen risk": pressure valves open if charged too fast or too long**
  - Source: Using electric storage batteries safely INDG139. https://www.hse.gov.uk/PUBNS/indg139.pdf
  - Quote: "Gas pressure may build up inside the battery if it is charged too quickly or for too long."
- **A cell's low voltage is not low hazard: exposed metal parts are live at the cell**
  - Source: Flooded Stationary Lead Acid Batteries IOM. https://www.enersys.com/492013/globalassets/documents/product-documentation/powersafe/opzs/amer/amer-en-iom-ps-flooded-0223.pdf
  - Quote: "Exposed metal parts of the battery always carry a voltage and are electrically live (risk of short circuits)."
**Learning science (my reading from the sources above).** (1) Predict, observe, explain: ask the learner to predict the loaded voltage, the reading after rest, or the capacity at C2 before showing it; the POE-A study and the McDermott summary both found conceptual change needs a model, not facts. (2) A model before numbers: a cell as "a fixed voltage behind a small resistance" (EMF E and r), reused from Ohm's law, answers constant-current, voltage-drop, short-circuit and cold-weather questions with one picture. (3) Link the three levels (what you see: bubbling and a reading; what is happening in the cell: lead sulfate and acid; the symbol or number: 2.40 V per cell) explicitly (RSC tip). (4) Do not call them "misconceptions" to Dan; McDermott warns the label trivialises a missing model.


## 7. Where it is used, for an electrician going into marine engineering

- **Ship's emergency source of power: an accumulator battery that carries the emergency load without recharging (SOLAS II-1, via IMO rules text)**
  - Source: imorules.com. https://imorules.com/GUID-C048F800-5412-40B3-ACCD-C562D4E4F719.html
  - Quote: "carrying the emergency electrical load without recharging while maintaining the voltage of the battery throughout the discharge period within 12% above or below its nominal voltage"
- **Transitional source of emergency power on a ship is a battery (SOLAS II-1)**
  - Source: imorules.com. https://imorules.com/GUID-C048F800-5412-40B3-ACCD-C562D4E4F719.html
  - Quote: "power required by paragraph 3.1.3 shall consist of an accumulator battery suitably located for use in an emergency"
- **The MCA ETO syllabus lists battery bank and UPS maintenance and testing under Emergency power supply (MSN 1860)**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "Battery bank and UPS – maintenance and testing procedures."
- **The MCA oral syllabus: emergency battery room and associated hazards (MIN 654)**
  - Source: M Notice Template - MSF 5011. https://s3.amazonaws.com/thegovernmentsays-files/attachments/180/1801863-1-MIN_654_Engineering_and_Electro-technical_Officer_Oral_Exam_Syllabus_-_Amendment_1.pdf
  - Quote: "Emergency battery room and associated hazards"
- **Marine electrician standard: the duty is to monitor marine batteries, charging and ancillary charging systems**
  - Source: Marine electrician / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0808-v1-1
  - Quote: "Duty 12 Monitor marine batteries, charging and ancillary alternating current (ac) or direct current (dc) supply charging systems."
- **Lead acid delivers the high pulse currents that make it a starter battery (Battery University)**
  - Source: Bu 201 How Does The Lead Acid Battery Work. https://batteryuniversity.com/article/bu-201-how-does-the-lead-acid-battery-work
  - Quote: "Lead acid can, however, deliver high pulse currents of several C if done for only a few seconds. This makes the lead acid well suited as a starter battery"
- **Lead acid is used for emergency lighting and UPS (Battery University)**
  - Source: BU-107: Comparison Table of Secondary Batteries - Battery University. https://batteryuniversity.com/article/bu-107-comparison-table-of-secondary-batteries
  - Quote: "Lead acid is used for wheelchairs, golf cars, personnel carriers, emergency lighting and uninterruptible power supply (UPS)."
- **HSE: large lead/acid batteries run UPS for computer, communication, process and machinery control systems**
  - Source: Using electric storage batteries safely INDG139. https://www.hse.gov.uk/PUBNS/indg139.pdf
  - Quote: "Lead/acid batteries are the most common large-capacity rechargeable batteries. There is one in almost every car, motorcycle and wagon on the road. They are often used in electric vehicles, such as fork-lift trucks, and in the UPS of computer/communication, process and machinery control systems."
- **AGM batteries are used for marine applications (Battery University)**
  - Source: Battery University | BU-201a: Absorbent Glass Mat (AGM). https://batteryuniversity.com/article/bu-201a-absorbent-glass-mat-agm
  - Quote: "Because of good performance at cold temperatures, AGM batteries are also used for marine, motor home and robotic applications."
- **MIN 654 lists communication battery and back-up checks on the oral syllabus**
  - Source: M Notice Template - MSF 5011. https://s3.amazonaws.com/thegovernmentsays-files/attachments/180/1801863-1-MIN_654_Engineering_and_Electro-technical_Officer_Oral_Exam_Syllabus_-_Amendment_1.pdf
  - Quote: "Emergency networks ones Communication battery and back up checks, records"
- **Confined spaces: standards for ships and submarines require entry procedures and precautions (ST0276)**
  - Source: Maritime mechanical and electrical mechanic / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0276-v1-1
  - Quote: "Comply with correct entry procedures and precautions for confined spaces."
- **A poorly ventilated battery room is where a violent explosion is likely (HSE)**
  - Source: Using electric storage batteries safely INDG139. https://www.hse.gov.uk/PUBNS/indg139.pdf
  - Quote: "If this happens in a confined space (eg inside the battery, or in an enclosure or a poorly ventilated battery room), a violent explosion is likely."
- **Station battery maintenance includes unintentional grounds, ripple and float current: the hand-off to earth fault detection (IEEE 450 via Megger)**
  - Source: Battery Testing Guide. https://res.cloudinary.com/iwh/image/upload/q_auto,g_center/assets/1/7/Megger_Battery_Testing_Guide.pdf
  - Quote: "unintentional battery grounds etc."
- **Capacity test: the only way to know actual capacity; used at acceptance and periodically**
  - Source: Battery Testing Guide. https://res.cloudinary.com/iwh/image/upload/q_auto,g_center/assets/1/7/Megger_Battery_Testing_Guide.pdf
  - Quote: "Capacity test is the only way to get an accurate value on the actual capacity of the battery."
- **Lithium-ion on boats brings thermal runaway and off-gas concerns (maker blog, SECONDARY)**
  - Source: Marine Battery Design and Installation - ODYSSEY Battery. https://www.odysseybattery.com/blog/2024/11/11/marine-battery-design-and-installation
  - Quote: "Lithium-ion batteries are also an option for boat owners, but they come with some inherent safety concerns due to thermal runaway and off-gas generation."
- **BS 7671 Chapter 57 and the rest of the land installation world: battery location, ventilation and fire risk**
  - Source: IET & BSI officially publish Amendment 4 (2026) to BS 7671:2018 (IET Wiring Regulations). https://www.theiet.org/media/press-releases/press-releases-2026/press-releases-2026-april-june/15-april-2026-iet-bsi-officially-publish-amendment-4-2026-to-bs-76712018-iet-wiring-regulations
  - Quote: "The chapter also places strong emphasis on safety‑critical matters such as appropriate battery location, ventilation, and fire‑risk mitigation."
Public-source uses only. The shelf's own outline (a large main battery exists on a submarine) is not expanded; no source here describes it, and nothing from the SMQ books was used. The trade uses above are general marine and industrial: emergency source and transitional source, UPS and emergency lighting, communication back-up, engine starting, battery room hazards, test and trend.


## 8. Size: how many lessons the benchmarks spend, and which core supports 8 lessons

My counts from the lists above (not quotes), and the quotes that give each list:

- **Brilliant Circuits:** 31 lessons in 7 levels (quote 1.1), none on cells or batteries. It covers circuits, current, voltage, power and resistance, which Dan already has.
- **Battery University:** about 18 lead-acid-relevant articles (section 1.2 list), each short, over the eight themes of this course; no ventilation sizing and no short-circuit current.
- **OpenStax Chemistry 2e:** 1 chapter, 7 sections, one of which (17.5) covers all battery types in a few paragraphs.
- **Manufacturers' manuals (GNB/Exide 93.10, EnerSys IOM, Hoppecke):** each runs 9 to 18 numbered sections, of which about 6 are the operating ones (installation, ventilation, commissioning charge, float, equalise, specific gravity, records).
- **MCA Second Engineer Marine Electro-Technology:** 9 learning outcomes on cells (draw and label; charge and discharge; hydrometer; alkaline cell; compare lead acid and alkaline; capacity in Ah; efficiency; series and parallel with internal resistance; charging circuit and measure state of charge before and after). One page, not a course; it is what the maritime route examines.
- **BS 7671 Amendment 4 Chapter 57:** more than 18 regulations; land-based storage; not the ship.
- **IEEE 450 / 1188 (via Megger):** capacity test at acceptance, within 2 years, then at no more than 25 per cent of service life; impedance yearly (flooded) or quarterly (VRLA); replace at 80 per cent.

**Which core supports 8 lessons for Dan.** The eight themes in the request are the core; the sources support one lesson for each, in this order, and the order is the order of the manufacturers' manuals and the MCA syllabus:
1. The cell (plates, acid, 2 V per cell, why six make 12 V). Supports: OpenStax 17.5, MCA "describes without chemical formulae", RSC misconceptions.
2. State of charge (rested voltage and specific gravity, hydrometer, temperature, surface charge and stratification as traps). Supports: Battery University BU-903, GNB 11.0, EnerSys, MCA hydrometer line.
3. Capacity and rate (Ah, C-rate, Peukert with logs, cold, V = E - Ir). Supports: BU-402, BU-502, Victron, EnerSys, MCA Ah and internal resistance lines, AQA reports.
4. Charging (CCCV, boost, equalise, float, per-cell voltage). Supports: BU-403, BU-404, EnerSys, GNB, Yuasa.
5. Gassing and hydrogen (gassing voltage, LEL, ventilation from the charging current). Supports: HSE INDG139, Hoppecke, GNB, IEC 62485-2 (title only).
6. Strings of cells (series, parallel, weakest cell, imbalance). Supports: BU-803a, BU-403, EnerSys.
7. Ageing and faults (sulfation, stratification, grid corrosion, dry-out; cell voltage, SG, impedance, capacity test; trending). Supports: BU-804 to 804c, BU-905, Megger guide, IEEE 450 and 1188 via Megger.
8. Safety and other chemistries (short-circuit current, acid, isolation, NiCd, Li-ion in outline). Supports: Vertiv/Battcon, NRC/BNL review, HSE SR18, BU-203, BU-204, OpenStax 17.5.

What to drop or merge if it needs to be smaller: gel and AGM construction (one screen in lesson 5 or 7), Li-ion and NiCd detail (lesson 8 only), battery sizing to a load profile (not found in a public source in this run: see section 9), and BS 7671 Chapter 57 (name it, do not teach it). If it needs to be larger: split lesson 7 into "what goes wrong" and "how to test and trend".


## 9. What I could not confirm

- **A Brilliant chemistry or electricity course covering cells:** none reachable. The chemistry, electricity-and-magnetism and scientific-thinking addresses all returned the generic Topics page. Brilliant Circuits (31 lessons) was reachable and has no cell lesson. I did not open a lesson.
- **STCW Table A-III/6 and A-III/1 column 2 naming batteries:** not seen in either table as returned; the battery lines come from the UK MCA guidance (MSN 1860, MIN 654) and the MCA written syllabus. The edumaritime copy of A-III/6 is a re-host of the IMO text (SECONDARY).
- **Whether the Royal Navy-linked apprenticeship standards (ST0276, ST1403, ST0457 option 5) name batteries:** only their profiles and employer lists were returned; the full knowledge, skill and behaviour lists were not. Only ST0808 (Marine electrician) names batteries.
- **Pearson BTEC HN units on lead-acid cells:** only the aerospace unit (4042) and automotive units (4097, 4111) were found; no marine or general-pathway HN unit covers cells in what was returned. HN unit content was read from the 2017 specification (Unit 19, 44, 53) and the 2024 unit descriptors.
- **IEC 62485-2, IEEE 450 and IEEE 1188 themselves:** paywalled. Only titles, scopes and what manufacturers, HSE and Megger say about them were read.
- **EAL, C&G and BTEC unit content for Dan\'s own qualifications:** not read; "little on batteries" is an inference from unit titles.
- **A public source for sizing a battery to a load profile (IEEE 485 or IEC 60896-22 method):** not found in this run.
- **A ship-specific or class-society rule on battery room ventilation:** the Netherlands circular and SOLAS were found; Lloyd\'s Register, DNV or MCA code text was not.
- **Peukert exponents for stationary cells:** the 1.1 to 1.3 range is from Wikipedia (SECONDARY) and Victron; I did not find a stationary manufacturer\'s own exponent.
- **Hydrogen volume per ampere-hour (Faraday):** not quoted; HSE\'s and Hoppecke\'s ventilation methods carry it inside their factors.
- **Brilliant-style steps lessons for any of this:** not applicable; this is a how-it-works course, so the brief (not this research) decides the lesson format.

