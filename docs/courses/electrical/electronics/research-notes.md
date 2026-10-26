# Electronics and power electronics: research notes

Researched 26 Oct 2026 for the Electronics and power electronics course brief (the second course in the Electrical shelf's
Electrical principles folder, after AC circuits and before Transformers; blurb "Diodes, transistors and the converters built
from them: rectifiers, inverters and what is inside a drive or a UPS."). The brief itself is not written here; these notes are
its evidence. Dan is an electrician and a Royal Navy submariner on the electrical engineering path. He asked for foundations
that see him through any new topic, not a remake of his Level 3 marine engineering course (CLAUDE.md).

Every finding has its source title, URL and the exact words, copied from a saved tool result by script (the quotes were not
retyped into this file; this file is generated from `quotes.json`). All of them are listed in `quotes.json` beside this file
and were checked with `node tools/eval/sources.mjs --quotes ... --tools ...` (`failed: 0`). The tool files are in `tools/`.
Findings I could not confirm are marked **UNCONFIRMED**; where only a non-original site said it, **SECONDARY**. My own readings
are marked "My reading" and are not quotes. Quotes are whitespace-collapsed; link markup on the page is removed by the checker.
Page text that arrived garbled (maths set as images) is quoted as it arrived and flagged. Mirror and copy sites were avoided.

Two pages could not be quoted whole. The first fetch of All About Circuits' Volume III contents page came back too large for the
tool to return, so it was not saved; the chapter lists below come from chapter pages that carry the same list. Brilliant lesson
pages were not fetched, so only course pages (lesson titles, not lesson content) were seen.

---

## 1. Benchmark: All About Circuits Volume III, and Brilliant

### 1.1 All About Circuits: Lessons in Electric Circuits, Volume III (Semiconductors)
The volume is 12 chapters. In order: 1 Amplifiers and Active Devices, 2 Solid-state Device Theory, 3 Diodes and Rectifiers,
4 Bipolar Junction Transistors, 5 Junction Field-effect Transistors, 6 Insulated-gate Field-effect Transistors, 7 Thyristors,
8 Operational Amplifiers, 9 Practical Analog Semiconductor Circuits, 10 DC Motor Drives, 11 Electron Tubes, 12 Contributor List.

My reading of the order: device physics first (holes and electrons), then the diode and the rectifier together, then the
transistor as switch and amplifier, then the thyristor, then op-amps. The converter ideas Dan needs (buck, inverter, PWM,
dead time) are almost absent: the only converter content is one page on PWM in the DC Motor Drives chapter, with an H-bridge
paragraph. The switching-loss and heat-sink material is not in the page lists either (the lists were checked, not the pages). So the benchmark gives the front half of this
course (diode, rectifier, switch, thyristor) and leaves the back half to the MCA syllabus and manufacturers' notes (sections 3 and 4).
Chapters 1, 5, 8 and 9 (amplifiers, JFET, op-amps, analog circuits) are outside this course.

- **AAC Volume III chapter list: amplifiers, solid-state theory, diodes and rectifiers, BJT, JFET, IGFET, thyristors, op-amps, practical circuits, DC motor drives**
  - Source: Meter Check of a Diode | Diodes and Rectifiers | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-3/meter-check-of-a-diode/
  - Quote: "1 Amplifiers and Active Devices + 2 Solid-state Device Theory + 3 Diodes and Rectifiers Pages - Introduction to Diodes And Rectifiers - Meter Check of a Diode - Diode Ratings - Rectifier Circuits - Peak Detector - Clipper Circuits - Clamper Circuits - Voltage Multipliers (Doublers, Triplers, Quadruplers, and More) - Inductor Commutating Circuits - Diode Switching Circuits - What Are Zener Diodes? - Special-purpose Diodes - Other Diode Technologies - SPICE Models + 4 Bipolar Junction Transistors + 5 Junction Field-effect Transistors + 6 Insulated-gate Field-effect Transistors + 7 Thyristors + 8 Operational Amplifiers + 9 Practical Analog Semiconductor Circuits + 10 DC Motor Drives + 11 Electron Tubes + 12 Contributor List"

- **AAC Diodes and Rectifiers chapter pages in order (meter check, ratings, rectifier circuits, peak detector, inductor commutating circuits)**
  - Source: Meter Check of a Diode | Diodes and Rectifiers | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-3/meter-check-of-a-diode/
  - Quote: "Introduction to Diodes And Rectifiers * Meter Check of a Diode * Diode Ratings * Rectifier Circuits * Peak Detector * Clipper Circuits * Clamper Circuits * Voltage Multipliers (Doublers, Triplers, Quadruplers, and More) * Inductor Commutating Circuits * Diode Switching Circuits * What Are Zener Diodes? * Special-purpose Diodes * Other Diode Technologies * SPICE Models"

- **AAC Thyristors chapter pages in order**
  - Source: Semiconductors - Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-7/
  - Quote: "7 Thyristors Pages - Hysteresis - Gas Discharge Tubes - The Shockley Diode - The DIAC - The Silicon-Controlled Rectifier (SCR) - The TRIAC - Optothyristors - The Unijunction Transistor (UJT) - The Silicon-Controlled Switch (SCS) - Field-effect-controlled Thyristors"

### 1.2 Brilliant
Brilliant's courses page is now organised as "Topics". Its Science group shows two electrical courses: Circuits (31 lessons,
334 exercises, 7 levels, current to voltage to power to analysis) and Digital Circuits (32 lessons). The Circuits course
starts at current loops and ends at comparing voltages; it assumes no prior knowledge and has no semiconductor lessons. Digital
Circuits is gates, truth tables and adders. I tried `/courses/electronics/` and `/courses/electricity-and-magnetism/`: both returned
only the generic topics page, so **no Brilliant electronics, semiconductor or power-electronics course is reachable** (my reading;
the pages returned no course). The page counts for Digital Circuits changed between two fetches on the same day (336 then 375
exercises); both are quoted.

Where it sits: Brilliant's science topics list runs Scientific Thinking, Circuits, Digital Circuits, Quantum Computing, so Circuits
is the first electrical course and Digital Circuits follows it. In Dan's app the Circuits ground is his DC and AC courses; the
Digital Circuits ground is the later Digital circuits course. Nothing at Brilliant covers diodes, transistors or converters.

- **Brilliant Circuits: 31 lessons, 7 levels from current loops to analysing voltage**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits/
  - Quote: "Circuits Explore the physics behind electricity. 31 Lessons 334 Exercises ## Level 1 Circuits Current Loops Short Circuits Choosing Bulbs Splitting Current Level Review ## Level 2 Current The Path of Least Resistance Bulb Brightness Changing Current Different Bulbs Conserving Current Level Review ## Level 3 Voltage Voltage Measuring Voltage Voltage Around Paths Branched Voltage Level Review ## Level 4 Power and Resistance Power and Brightness Deducing Power Resistance Solving for Resistance Level Review ## Level 5 Circuit Analysis Predicting Current Controlling Current Combining Resistance Dividing Resistance Total Resistance Voltage and Resistance ## Level 6 Comparing Power Resistance and Brightness Relative Resistance Sharing Amps and Volts Parallel Volt Shares Power and Bulb Pairs ## Level 7 Analyzing Voltage Subtracting Volts Comparing Points Bulbs with Voltage"

- **Brilliant Circuits description: current, voltage, resistance and power**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits/
  - Quote: "Build an intuitive understanding of how electric circuits work, and the underlying concepts of current, voltage, resistance and power."

- **Brilliant Circuits assumes no prior knowledge**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits/
  - Quote: "This course assumes no prior knowledge and teaches the key ideas needed to understand electricity and electric circuits, with some fun puzzles to solve along the way."

- **Brilliant science topics: Circuits sits between Scientific Thinking and Digital Circuits, then Quantum Computing**
  - Source: Brilliant | The Smartest Way to Learn Science. https://brilliant.org/science
  - Quote: "Science: Covered topics * Scientific Thinking * Circuits * Digital Circuits * Quantum Computing"

- **Brilliant Digital Circuits (32 lessons) is the next course after Circuits**
  - Source: Practice Digital Circuits | Brilliant. https://brilliant.org/courses/digital-circuits/?from_llp=science
  - Quote: "Digital Circuits Build simple computers out of logic gates. 32 Lessons 336 Exercises ### Level 1 Logic Gates AND Gates OR Gates Combining Gates NOT Gates"

- **Brilliant Digital Circuits topics: gates, binary, truth tables, adders**
  - Source: Practice Digital Circuits | Brilliant. https://brilliant.org/courses/digital-circuits/
  - Quote: "Topics covered * AND, OR, NOT and XOR gates * Binary Arithmetic * Truth Tables * Half and Full Adder Circuits"

- **Brilliant topics page lists Science as one group; the /courses/electronics/ and /courses/electricity-and-magnetism/ addresses returned only this generic topics page (my reading)**
  - Source: Topics | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "See the science in the world around you"

- **Brilliant Digital Circuits at the later fetch: 32 lessons, 375 exercises (the earlier fetch showed 336)**
  - Source: Practice Digital Circuits | Brilliant. https://brilliant.org/courses/digital-circuits/
  - Quote: "32 Lessons 375 Exercises"

---

## 2. Other courses' order for the same ground

My reading across all five: **every course puts the diode and rectifier first, the transistor second, and power electronics last or not
at all.** Only Hughes (chapter 40) and the MCA syllabus (section 3) take it into converters, and only the MCA syllabus names inverters,
PWM and choppers. Hughes and Bird do rectification before anything else in electronics; Khan Academy and OpenLearn do not reach
rectifiers at all.

### 2.1 Hughes, Electrical and Electronic Technology (12th edition) and Bird, Electrical Circuit Theory and Technology (7th edition)
Hughes: electrical principles first (chapters 1 to 15, including capacitors, inductance and AC power), then Electronic Engineering
(chapters 16 to 27, with 19 Semiconductor Materials and 20 Rectifiers and Amplifier Circuits), then Power Engineering (28 to 40),
which ends with 40 Power Electronics. Bird: chapter 13 Semiconductor diodes and 14 Transistors sit in the basic section (before
AC); no power-electronics chapter appears in the contents list; op-amps are 20. The chapter texts themselves were not reachable
(the contents pages only), so the section headings inside Hughes chapter 40 are **UNCONFIRMED**.

- **Hughes 12th edition: Electronic Engineering section runs semiconductor materials, rectifiers and amplifier circuits, then digital**
  - Source: Hughes Electrical and Electronic Engineering. https://www.pearson.com/en-gb/subject-catalog/p/hughes-electrical-and-electronic-technology/P200000004514/9781292134598
  - Quote: "Section 2 Electronic Engineering * 16 Electronic Systems * 17 Passive Filters * 18 Amplifier Equivalent Networks * 19 Semiconductor Materials * 20 Rectifiers and Amplifier Circuits * 21 Interfacing Digital and Analogue Systems * 22 Digital Numbers * 23 Digital Systems * 24 Signals * 25 Data Transmission and Signals * 26 Communications * 27 Fibreoptics"

- **Hughes 12th edition puts Power Electronics as chapter 40, the last chapter of the Power Engineering section, after motors and motor selection**
  - Source: Hughes Electrical and Electronic Engineering. https://www.pearson.com/en-gb/subject-catalog/p/hughes-electrical-and-electronic-technology/P200000004514/9781292134598
  - Quote: "Section 3 Power Engineering * 28 Multiphase Systems * 29 Transformers * 30 Introduction to Machine Theory * 31 AC Synchronous Machine Windings * 32 Characteristics of AC Synchronous Machines * 33 Induction Motors * 34 Electrical Energy Systems * 35 Power Systems * 36 Direct-current Machines * 37 Direct-current Motors * 38 Control System Motors * 39 Motor Selection and Efficiency * 40 Power Electronics"

- **Bird 7th edition: Semiconductor diodes (13) and Transistors (14) end the basic electronics section; op-amps are chapter 20; no power-electronics chapter in the list**
  - Source: Bird's Electrical Circuit Theory and Technology - 7th Edition - John B. https://www.routledge.com/Birds-Electrical-Circuit-Theory-and-Technology/Bird/p/book/9780367672225
  - Quote: "13. Semiconductor diodes 14. Transistors Section 3 Electrical Principles and Technology"

### 2.2 Khan Academy, Electrical engineering
Nine units; Unit 4 Semiconductor devices, which at the time of fetching listed one lesson, Diode (a video, a worked "circuit
element" article and a graphical-solution video). Amplifiers is Unit 3, before it. There is no rectifier, transistor-as-switch or
power-electronics lesson in the unit.

- **Khan Academy Electrical engineering has 9 units; Unit 4 is Semiconductor devices**
  - Source: Semiconductor devices | Electrical engineering | Science | Khan Academy. https://en.khanacademy.org/science/electrical-engineering/ee-semiconductor-devices
  - Quote: "9 units Unit 1 Introduction to electrical engineering Unit 2 Circuit analysis Unit 3 Amplifiers Unit 4 Semiconductor devices Unit 5 Electrostatics Unit 6 Signals and systems Unit 7 Home-made robots Unit 8 Lego robotics Unit 9 Reverse engineering"

- **Khan Academy Unit 4 Semiconductor devices lists only the Diode lesson (three items)**
  - Source: Semiconductor devices | Electrical engineering | Science | Khan Academy. https://www.khanacademy.org/science/electrical-engineering/ee-semiconductor-devices
  - Quote: "Unit 4: Semiconductor devices ## Diode ### Learn * Diode (Opens a modal)"

### 2.3 Electronics Tutorials (electronics-tutorials.ws)
Its Power Electronics category covers, in the pages reached: power diodes, single-phase rectification (half-wave, full-wave,
half-controlled and fully controlled), three-phase rectification (half-wave, full-wave, controlled by firing angle), thyristor,
thyristor circuits, diac, triac, IGBT, DC fast chargers and transient suppression. The order from the Triac page is thyristor,
thyristor circuit, triac, then IGBT. It has the best worked examples for rectifier averages (section 4.2). No buck converter page turned up in the searches; the buck material comes from Learnabout Electronics, Analog Devices, TI and a university lecture (4.6).

- **Electronics Tutorials three-phase rectification: six diodes in a bridge for motor drives**
  - Source: Three Phase Rectification of a 3-phase Supply Using Diodes. https://www.electronics-tutorials.ws/power/three-phase-rectification.html
  - Quote: "Three-phase rectification is the process of converting a balanced 3-phase AC power supply into a smooth and stable DC supply"

- **Electronics Tutorials replacing bridge diodes with thyristors gives a phase-controlled rectifier**
  - Source: Single Phase Rectification of a Sinusoidal AC Power Supply. https://www.electronics-tutorials.ws/power/single-phase-rectification.html
  - Quote: "By replacing the diodes within a single phase bridge rectifier with thyristors, we can create a phase-controlled AC-to-DC rectifier for converting the constant AC supply voltage into a controlled DC"

- **Electronics Tutorials power pages run thyristor, thyristor circuit, triac, then IGBT**
  - Source: Triac Tutorial and How Triac Switching Circuits Work. https://www.electronics-tutorials.ws/power/triac.html
  - Quote: "previous Previous Thyristor Circuit Next Insulated Gate Bipolar Transistor"

### 2.4 Open University, OpenLearn
"An introduction to electronics" (10 hours, level 2): electronics everywhere, basic theory, fundamental circuits (dividers,
Wheatstone bridge, op-amps, a sensor circuit), signals and filtering. No semiconductor devices, rectifiers or converters:
it is the Instrumentation and control course's ground, not this one's. I found no OpenLearn course on power electronics
(**UNCONFIRMED**: searches returned only the electronics and "Electronic applications" courses).

- **OpenLearn An introduction to electronics: 10 hours, Level 2**
  - Source: An introduction to electronics: Introduction | OpenLearn - Open University. https://www.open.edu/openlearn/science-maths-technology/an-introduction-electronics/content-section-0?intro=1
  - Quote: "10 hours study #### Level 2: Intermediate"

- **OpenLearn An introduction to electronics sections run electronics everywhere, circuit theory, fundamental circuits, signals**
  - Source: An introduction to electronics | OpenLearn - Open University. https://www.open.edu/openlearn/science-maths-technology/an-introduction-electronics/content-section-0?active-tab=description-tab
  - Quote: "1 Electronics everywhere + 1.1 Autonomous systems - Sensing - Logic - Actuation + 1.2 The sensing–logic–actuation cycle in practice * 2 Basic theory of electrical circuits + 2.1 Basic electrical quantities + 2.2 Relationships between quantities + 2.3 Ohm’s law and Kirchhoff ’s laws - Ohm’s law - Kirchhoff ’s laws - Series and parallel networks (combining the laws) + 2.4 Colour coding and standard resistor values * 3 Some fundamental circuits + 3.1 Voltage dividers + 3.2 The Wheatstone bridge + 3.3 Operational amplifier circuits + 3.4 Designing a sensor circuit * 4 Signals and signal processing + 4.1 High-fidelity sound reproduction and electronics + 4.2 Recording sounds + 4.3 Recording and analysing speech + 4.4 Signals and sine waves + 4.5 Making signals from combinations of sine waves - The square wave challenge + 4.6 From the time domain to the frequency domain + 4.7 Signals and noise + 4.8 Filtering + 4.9 Amplifying signals"

- **OpenLearn learning outcomes: components, simple circuits, signals and filtering (no power electronics)**
  - Source: An introduction to electronics: Learning outcomes | OpenLearn - Open University. https://www.open.edu/openlearn/science-maths-technology/an-introduction-electronics/content-section---learningoutcomes
  - Quote: "After studying this course, you should be able to: * recognise a variety of exciting high-tech products and systems enabled by electronics * manipulate voltages, currents and resistances in electronic circuits * demonstrate familiarity with basic electronic components and use them to design simple electronic circuits * see how signals can be represented in the time and frequency domains for Fourier analysis * record, analyse and filter audio signals to improve their fidelity."

---

## 3. What a marine electrical engineer actually uses of this topic

The three layers agree. STCW names "fundamentals of electronics and power electronics" as knowledge for the electro-technical officer.
The MCA oral syllabus repeats it and spells out the converters. The MCA's modernised syllabus then lists the outcomes: the devices, heat,
converters and drive applications. The HN units (Pearson and SQA) are the college version. My reading of what is in common, and so
what the course must cover to be useful to a Level 3 or later marine course: **the devices (diode, thyristor, triac, IGBT, MOSFET),
heat and heatsinks, half-wave and full-wave rectifiers, no/half/full control, flywheel diode on an inductive load, three-phase
bridges, choppers, inverters with PWM and a DC link, and a motor-speed-control block diagram with starting, braking and protection.**
Cycloconverters, GTO thyristors, current-source inverters and four-quadrant operation appear in the syllabus lines but are beyond a
foundations course (my reading; mark them as "named, not taught").

### 3.1 STCW Code, Table A-III/6 (electro-technical officer, operational level)
The table is quoted from the US Coast Guard guidance (NVIC 23-14), which reproduces the IMO text; the IMO page itself was not
reachable, so these are **SECONDARY**. The competence is "Monitor the operation of electrical, electronic and control systems"
with "Fundamentals of electronics and power electronics" among the knowledge lines.

- **STCW Table A-III/6 knowledge list includes fundamentals of electronics and power electronics**
  - Source: Guidelines for Qualifications for STCW Endorsements As Electro-Technical Officer on Vessels Powered by Main Propulsion Machinery of 750 kW/1000 HP or More. https://media.defense.gov/2017/Jul/14/2001777751/-1/-1/0/NVIC-23-14.PDF **SECONDARY** (the US Coast Guard guidance reproduces the IMO table; the IMO page itself was not reachable).
  - Quote: "Electro-technology and electrical machines theory Fundamentals of electronics and power electronics Electrical power"

- **STCW Table A-III/6 function is electrical, electronic and control engineering at the operational level**
  - Source: Guidelines for Qualifications for STCW Endorsements As Electro-Technical Officer on Vessels Powered by Main Propulsion Machinery of 750 kW/1000 HP or More. https://media.defense.gov/2017/Jul/14/2001777751/-1/-1/0/NVIC-23-14.PDF **SECONDARY** (the US Coast Guard guidance reproduces the IMO table; the IMO page itself was not reachable).
  - Quote: "Function: Electrical, electronic and control engineering at the operational level Column 1 Column 2 Column 3 Column 4 Competence Knowledge, understanding and proficiency Methods for demonstrating competence Criteria for evaluating competence"

- **STCW Table A-III/6 maintenance competence: test, detect faults and restore electrical and electronic control equipment**
  - Source: Guidelines for Qualifications for STCW Endorsements As Electro-Technical Officer on Vessels Powered by Main Propulsion Machinery of 750 kW/1000 HP or More. https://media.defense.gov/2017/Jul/14/2001777751/-1/-1/0/NVIC-23-14.PDF **SECONDARY** (the US Coast Guard guidance reproduces the IMO table; the IMO page itself was not reachable).
  - Quote: "Practical knowledge for the testing, maintenance, fault finding and repair Test, detect faults and maintain and restore electrical and electronic control equipment to operating condition"

- **STCW Table A-III/6 high-voltage and electrical propulsion knowledge**
  - Source: Guidelines for Qualifications for STCW Endorsements As Electro-Technical Officer on Vessels Powered by Main Propulsion Machinery of 750 kW/1000 HP or More. https://media.defense.gov/2017/Jul/14/2001777751/-1/-1/0/NVIC-23-14.PDF **SECONDARY** (the US Coast Guard guidance reproduces the IMO table; the IMO page itself was not reachable).
  - Quote: "High-voltage technology Safety precautions and procedures Electrical propulsion of the ships, electrical motors and control systems _Practical knowledge_ Safe operation and maintenance of high-voltage systems, including knowledge of the special technical type of high- voltage systems and the danger resulting from operational voltage of more than 1,000 volts"

### 3.2 MCA (UK) electro-technical officer
MSN 1860 (M), Annex C: the oral examination syllabus. The search tool dates the notice 2015 (a newer Amendment 1 exists; its text was not read). The
MCA's Cadet Training and Modernisation consultation (2023) put the revised syllabus in templates; the two relevant ones are
"Principles of Power Electronics" and "Applications of Power Electronics in Electrical Motor Drive Systems". Each line is marked "Keep /
Relevant / None" by the working group, which means the group recommended keeping every line unchanged. MIN 720 says the revised
ETO syllabus applies to new cadets from August 2025. My reading: these two templates are the single best public list of what the
trade expects, and each outcome maps onto one or two of the eight lessons.

- **MCA ETO oral syllabus (MSN 1860 Annex C) lists fundamentals of electronics and power electronics**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "Fundamentals of electronics and power electronics; o Electrical power distribution boards and electrical equipment; o Fundamentals of automation, automatic control systems; o Instrumentation , alarm and monitoring systems; o Electrical drives (including control unit and power modulator - converters (ac to dc, ac regulators, choppers or dc-dc converters, inverters, cycloconverters), variable impedance and switching circuits);"

- **MCA ETO oral syllabus: hazards and precautions above 1000 volts**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "Appreciation of the hazards and precautions required for the operation of power systems above 1000 volts."

- **MCA modernised ETO syllabus, Principles of Power Electronics, outcome 1: the devices (diode, diac, thyristor, GTO, triac, power MOSFET, IGBT, smart power)**
  - Source: Proposal to modernise the Methodology of Teaching, Assessment/ Examination: Principles of Power Electronics. https://assets.publishing.service.gov.uk/media/646c91eaa726f6000ccebc1d/08a._ETO_-_Principles_of_Power_Electronics_.pdf
  - Quote: "Outcome 1: Principles and characteristics of power electronic devices Keep Relevant None 1.1 Diode Keep Relevant None 1.2 Diac Keep Relevant None 1.3 Thyirstor Keep Relevant None 1.4 Gate Turn-Off Thyristor 4 Keep Relevant None 1.5 Triac Keep Relevant None 1.6 Power MOSFET Keep Relevant None 1.7 Insulated Gate Bipolar Transistor Keep Relevant None 1.8 Smart Power Devices"

- **MCA Principles of Power Electronics, outcome 2: protection and heat dissipation, use of heatsinks**
  - Source: Proposal to modernise the Methodology of Teaching, Assessment/ Examination: Principles of Power Electronics. https://assets.publishing.service.gov.uk/media/646c91eaa726f6000ccebc1d/08a._ETO_-_Principles_of_Power_Electronics_.pdf
  - Quote: "Outcome 2: Outline arrangements for the protection of and the dissipation of heat from power electronic devices"

- **MCA Principles of Power Electronics: use of heatsinks**
  - Source: Proposal to modernise the Methodology of Teaching, Assessment/ Examination: Principles of Power Electronics. https://assets.publishing.service.gov.uk/media/646c91eaa726f6000ccebc1d/08a._ETO_-_Principles_of_Power_Electronics_.pdf
  - Quote: "2.5 Use of heatsinks"

- **MCA Principles of Power Electronics, outcome 3: half-wave and full-wave, no/half/full control, flywheel diode, inductive load**
  - Source: Proposal to modernise the Methodology of Teaching, Assessment/ Examination: Principles of Power Electronics. https://assets.publishing.service.gov.uk/media/646c91eaa726f6000ccebc1d/08a._ETO_-_Principles_of_Power_Electronics_.pdf
  - Quote: "Outcome 3: Analyse the operation and applications of single phase and three phase converters Keep Relevant None 3.1 Difference between half- wave and full-wave rectifier circuits Keep Relevant None 3.2 Difference between no control, half control and full control converters Keep Relevant None 3.3 One to Four Quadrant Operation Keep Relevant None 3.4 Full-wave, half-controlled bridge circuit with resistive load Keep Relevant None 3.5 Full-wave, half-controlled bridge circuit with inductive load and flywheel diode Keep Relevant None 3.6 Full-wave, fully controlled bridge circuit with inductive load Keep Relevant None 3.7 Typical applications of single phase converters"

- **MCA Applications of Power Electronics in Electrical Motor Drive Systems, outcome 1: single-phase converters and DC choppers**
  - Source: Proposal to modernise the Methodology of Teaching, Assessment/ Examination: Applications of Power Electronics. https://assets.publishing.service.gov.uk/media/646c91f8a726f6000ccebc1e/08b._ETO_-_Applications_of_Power_Electronics.pdf
  - Quote: "Outcome1: Explain the operation of single-phase converters and D.C. choppers Keep Relevant None 1.1Single phase converters (half-wave controlled and full wave-controlled rectifier circuits) Keep Relevant None 1.2 Application of single-phase converters in the speed control of D.C. motors"

- **MCA Applications outcome 2: three-phase converters, AC regulators and inverters**
  - Source: Proposal to modernise the Methodology of Teaching, Assessment/ Examination: Applications of Power Electronics. https://assets.publishing.service.gov.uk/media/646c91f8a726f6000ccebc1e/08b._ETO_-_Applications_of_Power_Electronics.pdf
  - Quote: "Outcome 2: Explain the operation of three-phase converters, A.C. to A.C. regulators and inverters Keep Relevant None 2.1 Three-phase convertors (three-phase diode bridge, half controlled three-phase bridge converter, full controlled three-phase bridge converter)"

- **MCA Applications: AC regulators (phase control, burst firing) and inverters (voltage source, current source, PWM, DC link)**
  - Source: Proposal to modernise the Methodology of Teaching, Assessment/ Examination: Applications of Power Electronics. https://assets.publishing.service.gov.uk/media/646c91f8a726f6000ccebc1e/08b._ETO_-_Applications_of_Power_Electronics.pdf
  - Quote: "2.2 A.C. to A.C. regulators (phase control, burst firing) Keep Relevant None 2.3 Application of A.C. to A.C. converters in the speed control of a universal motor Keep Relevant None 2.4 Inverters (voltage source, current source, PWM, D.C. link)"

- **MCA Applications outcome 3: electronically controlled motor speed control system**
  - Source: Proposal to modernise the Methodology of Teaching, Assessment/ Examination: Applications of Power Electronics. https://assets.publishing.service.gov.uk/media/646c91f8a726f6000ccebc1e/08b._ETO_-_Applications_of_Power_Electronics.pdf
  - Quote: "Outcome 3: Investigate and analyse the operation and performance of an electronically controlled motor speed control system Keep Relevant None 3.1 Block diagram of the system"

- **MCA modernised syllabus applies from August 2025 for new ETO cadets**
  - Source: MIN 720 (M) Amendment 1 - Transforming seafarer training: the UK’s modernised officer qualifications syllabus. https://assets.publishing.service.gov.uk/media/6ac636e0b016250bca01396d/min-720-amendment-1-transforming-seafarer-training-the-uks-modernised-officer-qualifications-syllabus.pdf
  - Quote: "From August 2025, all new ETO Cadet course starters will follow a revised syllabus."

### 3.3 Pearson BTEC HN and SQA HN
The Pearson HN unit specification (Electrical and Electronic Engineering) was not reachable, only provider pages that mention power
electronics units, so **the exact Pearson unit lines are UNCONFIRMED**. SQA: the older HNC/HND Electrical Engineering award
(lapsing from 1 Aug 2026) had a Power Electronics specialisation; the NextGen HNC unit "Electrical Power and Drive Systems" lists
harmonic sources and filtering, isolation and earthing, and circuit protection among its evidence items. SQA's Power Electronics
unit specification (FY9R 34) appears in an SQA update list but was not read (**UNCONFIRMED**).

- **SQA NextGen HNC Electrical Power and Drive Systems: harmonic sources and filtering, isolation and earthing, circuit protection**
  - Source: J6D2 47 Electrical Power and Drive Systems. https://www.sqa.org.uk/sqa/files_ccc/j6d2-47-electrical-power-and-drive-systems.pdf
  - Quote: "State three harmonic sources. • Describe one method of harmonic filtering."

- **SQA Electrical Power and Drive Systems: need for isolation and earthing**
  - Source: J6D2 47 Electrical Power and Drive Systems. https://www.sqa.org.uk/sqa/files_ccc/j6d2-47-electrical-power-and-drive-systems.pdf
  - Quote: "Explain the need for isolation and earthing."

- **SQA HNC/HND Electrical Engineering awards include a Power Electronics specialisation**
  - Source: HNC/HND Electrical Engineering - Qualifications Scotland. https://www.sqa.org.uk/sqa/25479.html
  - Quote: "The awards allow the candidate to achieve a degree of specialisation within the following areas: * Electrical Principles * Information Technology * Three Phase Induction Motors * Power Electronics"

- **Pearson HNC provider page: units now cover power electronics**
  - Source: Level 4 – HNC in Electrical and Electronic Engineering. https://tecol.co.uk/l4-hnc-in-engineering-business-and-digital-technologies/electrical-and-electronic
  - Quote: "we now offer a range of units that cover renewable energy, sustainability, power electronics and energy conservation"

- **Pearson HND (Teesside): power electronic converters in renewable and distributed energy sources**
  - Source: Electrical and Electronic Engineering by Flexible Open Learning, HND, Online learning course | Teesside University. https://www.tees.ac.uk/undergraduate_courses/engineering_&_construction/hnd_electrical_and_electronic_engineering_by_flexible_open_learning.cfm
  - Quote: "Explore the role of power electronic converters as essential components of renewable and distributed energy sources, including wind turbines, photovoltaics, marine energy systems and energy storage systems."

---

## 4. The scope to cover, and what research says about each part

The order is the brief's: diode, rectifiers, smoothing, switch, thyristor, chopper, inverter, living with it. The research supports
every part of that order from at least two kinds of source (a textbook or tutorial, and a manufacturer or standard), except
where a gap is flagged. Out of scope here (per the task): op-amps, small-signal amplifiers, digital logic (they belong to Instrumentation
and control and Digital circuits). The input transformer of a rectifier belongs to the Transformers course.


### 4.1 The diode as a one-way valve
The hydraulic check-valve picture is the standard route (AAC). The holes-and-electrons account is told in AAC chapter
2 in several pages; the short version Dan needs is: a free electron leaves a hole behind, holes appear to move the other way, and
at the P-N junction carriers from each side cross and pair off. Forward drop and reverse blocking follow from that picture, and the
meter test is a practical line (AAC "Meter Check of a Diode"). My reading: teach it in four pictures, no band theory. **Do not
teach the diode as an ideal switch with no drop**: Dan will meet the 0.7 V drop on the bench and as a loss in the converter.

- **A diode is a one-way valve for current**
  - Source: Introduction to Diodes And Rectifiers | Diodes and Rectifiers | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-3/introduction-to-diodes-and-rectifiers/
  - Quote: "is an electrical component acting as a one-way valve for current."

- **Silicon forward voltage about 0.7 V**
  - Source: Introduction to Diodes And Rectifiers | Diodes and Rectifiers | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-3/introduction-to-diodes-and-rectifiers/
  - Quote: "Silicon diodes have a forward voltage of approximately 0.7 volts."

- **Diode check meters force a small current and read the forward drop**
  - Source: Meter Check of a Diode | Diodes and Rectifiers | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-3/meter-check-of-a-diode/
  - Quote: "These meters work by forcing a small current through the diode and measuring the voltage dropped between the two test leads."

- **Meter reading is lower than the normal 0.7 V because the current is small**
  - Source: Meter Check of a Diode | Diodes and Rectifiers | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-3/meter-check-of-a-diode/
  - Quote: "The forward voltage reading obtained with such a meter will typically be less than the “normal” drop of 0.7 volts for silicon and 0.3 volts for germanium because the current provided by the meter is of trivial proportions."

- **Use diode check for semiconductors and resistance for anything else**
  - Source: Meter Check of a Diode | Diodes and Rectifiers | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-3/meter-check-of-a-diode/
  - Quote: "The philosophy here is that the “diode check” function is to be used for testing semiconductor devices, and the “resistance” function for anything else."

- **A free electron leaves a hole**
  - Source: Electrons and “holes’’ | Solid-state Device Theory | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-2/electrons-and-holes/
  - Quote: "Thermal energy may occasionally free an electron from the crystal lattice as in Figure above (b). This electron is free for conduction about the crystal lattice. When the electron was freed, it left an empty spot with a positive charge in the crystal lattice known as a"

- **P-type holes move because electrons move the other way**
  - Source: Electrons and “holes’’ | Solid-state Device Theory | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-2/electrons-and-holes/
  - Quote: "To move the hole in a given direction, the valence electrons move in the opposite direction."

- **P-N junction: carriers diffuse across the centre and pair off**
  - Source: Diodes, Transistors and FETs. https://www.renesas.com/en/support/engineer-school/electronic-circuits-02-diodes-transistors-fets
  - Quote: "A semiconductor diode consists of a P-type semiconductor on one side and an N-type on the other. The carriers from each side diffuse across the center area (the P-N junction) and pair off, creating a"

- **PIV: the largest reverse voltage a diode can take**
  - Source: Introduction to Diodes And Rectifiers | Diodes and Rectifiers | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-3/introduction-to-diodes-and-rectifiers/
  - Quote: "The maximum reverse-bias voltage that a diode can withstand without “breaking down” is called the _Peak Inverse Voltage_ , or _PIV"


### 4.2 Rectifiers: half-wave, full-wave bridge, three-phase six-pulse
All the numbers are computed from the waveform: average of a half sine is Vmax/pi (0.318 Vmax), a full-wave bridge is 2Vmax/pi
(0.637 Vmax, which is 0.9 Vrms), less two diode drops. Three-phase: Electronics Tutorials gives the method and a worked example
(127 V line voltage), but the formula for the six-diode bridge arrived as an image, so the **1.35 x line voltage** result is quoted from
two secondary pages and ScienceDirect's "2.34 times the rms phase voltage" (these agree: 2.34 x line/1.732 = 1.35 x line, my arithmetic).
With a capacitor, the no-load DC bus is the **peak** line voltage, about 1.414 x line, which is what a drive's DC bus meter reads
(SECONDARY). Peak inverse voltage for the bridge is the peak secondary voltage (single phase); for the three-phase bridge it is the peak
line-to-line voltage (my reading from the waveform, no clean quote: **UNCONFIRMED** as a quote).

- **Half-wave rectifier only passes one half of the AC waveform**
  - Source: Rectifier Circuits | Diodes and Rectifiers | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-3/rectifier-circuits/
  - Quote: "The simplest kind of rectifier circuit is the _half-wave_ rectifier. It only allows one half of an AC waveform to pass through to the load. (Figure below)"

- **Half-wave: half the source capacity is unused**
  - Source: Rectifier Circuits | Diodes and Rectifiers | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-3/rectifier-circuits/
  - Quote: "the AC power source only supplies power to the load one half every full cycle, meaning that half of its capacity is unused."

- **Bridge: current flows the same way through the load for either polarity**
  - Source: Rectifier Circuits | Diodes and Rectifiers | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-3/rectifier-circuits/
  - Quote: "Note that regardless of the polarity of the input, the current flows in the same direction through the load."

- **Bridge: two diode drops lost**
  - Source: Rectifier Circuits | Diodes and Rectifiers | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-3/rectifier-circuits/
  - Quote: "Thus, two diode drops of the source voltage are lost (0.7·2=1.4 V for Si)"

- **Pulse numbers: 1-pulse, 2-pulse, 6-pulse**
  - Source: Rectifier Circuits | Diodes and Rectifiers | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-3/rectifier-circuits/
  - Quote: "A three-phase full-wave rectifier would be called a _6-pulse"

- **Half-wave average value 0.318 Vmax**
  - Source: Single Phase Rectification of a Sinusoidal AC Power Supply. https://www.electronics-tutorials.ws/power/single-phase-rectification.html
  - Quote: "V AVE = 0.318*V MAX"

- **Full-wave average 0.637 Vmax, twice half-wave**
  - Source: Full Wave Rectifier and Bridge Rectifier Theory. https://www.electronics-tutorials.ws/diode/diode_6.html
  - Quote: "the average output voltage for the full-wave circuit will be: 2 x 0.318V max = 0.637V max of the peak voltage. Assuming no diode losses."

- **Full-wave average in terms of rms: 0.9 Vrms**
  - Source: Single Phase Rectification of a Sinusoidal AC Power Supply. https://www.electronics-tutorials.ws/power/single-phase-rectification.html
  - Quote: "V AVE = 0.9*V RMS I AVE = 0.9*I RMS"

- **Bridge ripple frequency twice the supply (100 Hz from 50 Hz)**
  - Source: Full Wave Rectifier and Bridge Rectifier Theory. https://www.electronics-tutorials.ws/diode/diode_6.html
  - Quote: "The ripple frequency is now twice the supply frequency (e.g. 100Hz for a 50Hz supply or 120Hz for a 60Hz supply.)"

- **Three-phase bridge ripple frequency six times the input**
  - Source: Three Phase Rectification of a 3-phase Supply Using Diodes. https://www.electronics-tutorials.ws/power/three-phase-rectification.html
  - Quote: "The advantage here is that the circuit produces a lower ripple output than the previous half-wave 3-phase rectifier as it has a frequency of six times the input AC waveform."

- **Three-phase bridge: two diodes conduct at a time, each pair for 60 degrees**
  - Source: Three Phase Rectification of a 3-phase Supply Using Diodes. https://www.electronics-tutorials.ws/power/three-phase-rectification.html
  - Quote: "each pair of diodes will conduct for only 60 o (one-sixth) of a cycle"

- **Three-phase bridge DC output computed from line-to-line RMS (worked example, 127 V)**
  - Source: Three Phase Rectification of a 3-phase Supply Using Diodes. https://www.electronics-tutorials.ws/power/three-phase-rectification.html
  - Quote: "Again, we can reduce the maths a bit by correctly saying that for a given line-to-line RMS voltage value, in our example 127 volts, the average DC output voltage is:"

- **DC output is slightly below the peak line voltage, 2.34 times the rms phase voltage**
  - Source: Three Phase Bridge Rectifier - an overview | ScienceDirect Topics. https://www.sciencedirect.com/topics/engineering/three-phase-bridge-rectifier
  - Quote: "The dc output voltage is slightly lower than the peak line voltage, or 2.34 times the rms phase voltage."

- **Bridge PIV equals the peak secondary voltage**
  - Source: Full Wave Bridge Rectifier Peak Inverse Voltage. https://instrumentationtools.com/full-wave-bridge-rectifier-peak-inverse-voltage **SECONDARY** (not the original publisher of the claim).
  - Quote: "D3 and D4 have a peak inverse voltage equal to the peak secondary voltage."

- **Half-wave PIV and centre-tap PIV from the waveform (Purdue lecture)**
  - Source: ECE 255. https://engineering.purdue.edu/wcchew/ece255f17/ECE%20255%20f17%20latex%20pdf%20files/ece255LectureSep5.pdf
  - Quote: "The PIV (peak inverse voltage) is the peak of the AC signal to be inverted. This is important to ensure that the PIV is not larger than the breakdown voltage of the diode, so that the diode can be"

- **A drive's no-load DC bus is about 1.414 times the line voltage (peak), versus the 1.35 average of the bridge (SECONDARY)**
  - Source: Fix ABB ACS600 Supply Phase Fault - DC Bus Fluctuation – Industrial Monitor Direct. https://industrialmonitordirect.com/blogs/knowledgebase/abb-acs600-supply-phase-fault-troubleshooting-guide **SECONDARY** (not the original publisher of the claim).
  - Quote: "Measure no-load DC bus voltage - should equal Vrms × 1.414"

- **DC bus ramps to about 1.35 times line-to-line voltage after rectification (SECONDARY)**
  - Source: VFD Input Transformer Grounding: HRG & IT Design Guide – Industrial Monitor Direct. https://industrialmonitordirect.com/blogs/knowledgebase/vfd-input-transformer-grounding-ungrounded-secondary-design **SECONDARY** (not the original publisher of the claim).
  - Quote: "The DC bus voltage should ramp to approximately 1.35 × V LL (rectified DC)"


### 4.3 Smoothing, the reservoir capacitor, the DC link, and precharge
Ripple: Electronics Tutorials gives the rule that ripple depends on capacitance, ripple frequency and load current, and a worked
case where ten times the capacitance moves the minimum voltage from 3.6 V to 7.9 V. The exact ripple formula arrived as an image
and is **not quoted** (the standard form is Vripple = I / (f C); **UNCONFIRMED** as a quote). Precharge is plain: an uncharged
capacitor looks like a short, so a resistor path charges it first. The RC charging law is Dan's from Exponentials and logarithms.
The discharge wait is in every drive manual (5 minutes ABB and Rockwell, 15 minutes Vacon, 10 minutes Danfoss servo); the shared
rule is "wait, then measure". **Never teach a single universal wait time**: the manual for the unit decides.

- **Smoothing capacitor turns the rippled output into smoother DC**
  - Source: Full Wave Rectifier and Bridge Rectifier Theory. https://www.electronics-tutorials.ws/diode/diode_6.html
  - Quote: "The smoothing capacitor converts the full-wave rippled output of the rectifier into a more smooth DC output voltage."

- **Ripple set by capacitance, frequency and load current**
  - Source: Full Wave Rectifier and Bridge Rectifier Theory. https://www.electronics-tutorials.ws/diode/diode_6.html
  - Quote: "The maximum ripple voltage present for a Full Wave Rectifier circuit is not only determined by the value of the smoothing capacitor but by the frequency and load current"

- **Ten times the capacitance raised the minimum voltage from 3.6 V to 7.9 V**
  - Source: Full Wave Rectifier and Bridge Rectifier Theory. https://www.electronics-tutorials.ws/diode/diode_6.html
  - Quote: "Here we have increased the value of the smoothing capacitor ten-fold from 5μF to 50μF which has reduced the ripple increasing the minimum discharge voltage from the previous 3.6 volts to 7.9 volts."

- **Capacitor charges to the peak; diode blocks it from discharging back**
  - Source: Peak Detector | Diodes and Rectifiers | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-3/peak-detector/
  - Quote: "When the input waveform falls below the DC “peak” stored on the capacitor, the diode is reverse biased, blocking current flow from capacitor back to the source."

- **DC-link capacitor: energy reservoir and filter between rectifier and inverter**
  - Source: DC-Link Capacitor Selection & Ripple Current. https://schematicshub.com/articles/dc-link-capacitor-selection **SECONDARY** (not the original publisher of the claim).
  - Quote: "The DC-link capacitor is the energy reservoir and filter between rectifier and inverter"

- **DC-link capacitor sees ripple at 6 times mains frequency from a three-phase diode bridge**
  - Source: DC Link Capacitors: Inverter & VFD Applications — Selection, Sizing & Design Guide - PCBSync. https://pcbsync.com/dc-link-capacitor **SECONDARY** (not the original publisher of the claim).
  - Quote: "In a variable frequency drive, the DC link capacitor must handle ripple current contributions from both the rectifier input stage (at 6× mains frequency for three-phase diode bridge) and the inverter"

- **Uncharged DC bus: extremely high inrush through the rectifier**
  - Source: Eaton SC9000 EP pre-charge system application paper. https://www.eaton.com/content/dam/eaton/products/medium-voltage-power-distribution-control-systems/motor-control/literature/applications/eaton-sc9000-soft-mag-pre-charge-system-application-paper-ap02004en.pdf
  - Quote: "Applying line voltage to the AFD diode rectifier (converter) with an uncharged DC bus results in extremely high inrush current."

- **An uncharged capacitor looks like a short circuit**
  - Source: Eaton SC9000 EP pre-charge system application paper. https://www.eaton.com/content/dam/eaton/products/medium-voltage-power-distribution-control-systems/motor-control/literature/applications/eaton-sc9000-soft-mag-pre-charge-system-application-paper-ap02004en.pdf
  - Quote: "An uncharged capacitive circuit is seen as a short circuit when line voltage is first applied."

- **Precharge: contactor plus current-limiting resistor**
  - Source: DC-Link Capacitor Pre-charge Designs in Automotive Systems (Rev. A). https://www.ti.com/lit/pdf/sdaa145
  - Quote: "A conventional pre-charge circuit comprises a pre-charge contactor (PCC) and current-limiting resistor."

- **Precharge charge law uC = V(1 - e^(-t/tau)), tau = RC**
  - Source: DC-Link Capacitor Pre-charge Designs in Automotive Systems (Rev. A). https://www.ti.com/lit/pdf/sdaa145
  - Quote: "The voltage across the DC-link capacitor is expressed as: uC = VBAT 1 − e − t τ , τ = RC"

- **Five time constants to charge fully**
  - Source: Sensata Precharge Circuit for Hybrid and Electric Vehicules. https://www.sensata.com/sites/default/files/a/sensata-how-to-design-precharge-circuits-evs-whitepaper.pdf
  - Quote: "Five time constants (5T) are needed for a capacitor to fully charge."

- **Precharge: the resistor path charges the capacitor first, voltage rises gradually, then the main relay closes**
  - Source: How to choose high-capacity relays for inrush current prevention circuits | ARATAS Korea,formerly Omron Components. https://components.omron.com/kr-en/solutions/relays/high-capacity-relays/inrush-prevention-circuits
  - Quote: "When the precharge relay turns ON, the capacitor voltage rises gradually."

- **Large capacitor safety: a drive's capacitors hold charge after supply removed (ABB wait 5 minutes)**
  - Source: EN / ACS880-11 hardware manual. https://library.e.abb.com/public/426332acfaff4cb98425edeecedd0831/EN_ACS880-11_HW_H.pdf
  - Quote: "After you disconnect power from the drive, always wait 5 minutes to let the intermediate circuit capacitors discharge before you continue."

- **Danfoss Vacon: wait 15 minutes, then measure to prove no voltage**
  - Source: VACON® 1000. https://files.danfoss.com/download/Drives/172F3117C-VACON-1000-Operating-Guide-EN.pdf
  - Quote: "Wait at least 15 minutes for the DC-link capacitors to discharge fully before opening the cabinet door or the cover of the AC drive. Use a measuring device to make sure that there is no voltage."

- **Rockwell: wait 5 minutes, measure DC bus at test points, must be zero**
  - Source: untitled. https://literature.rockwellautomation.com/idc/groups/literature/documents/pc/750-pc113_-en-p.pdf
  - Quote: "After removing power to the drive, wait 5 minutes for the bus capacitors to discharge. Measure the DC bus voltage at the DC+ and DC- TESTPOINT sockets on the front of the power module. The voltage must be zero."

- **Danfoss servo drive: wait at least the listed discharge time; voltage may be present even if the LED is off**
  - Source: VLT® Integrated Servo Drive ISD 410. https://assets.danfoss.com/documents/latest/271518/AQ361181478313en-000101.pdf
  - Quote: "Note: High voltage may be present even if the LED on the ISD connection box is not lit!"


### 4.4 The transistor as a switch: BJT, MOSFET, IGBT; losses; the freewheeling diode
Teach the switch as fully on or fully off: a half-on switch dissipates the most heat (AAC and Infineon say the same in different words).
Losses split into conduction loss (voltage drop x current while on) and switching loss (energy per switching x frequency). The thermal
chain from junction to case to heat sink is the Infineon "thermal resistance" idea; Energy and heat are not in Dan's built courses (Engineering science is not yet built), so
teach the junction temperature rise as watts times degrees per watt, in one picture. Gate drive in one picture: an IGBT or MOSFET gate draws current only to
charge the gate, unlike a power BJT that needs base current (AAC IGBT page). The freewheeling (commutating) diode gives the
inductor's current a path when the switch opens, which is the same idea as the chopper's diode in 4.6.

- **BJT works as a switch in saturation and cut-off**
  - Source: The Bipolar Junction Transistor (BJT) as a Switch | Bipolar Junction Transistors | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-4/transistor-switch-bjt/
  - Quote: "The transistor can be used as a switch if biased in the saturation and cut-off regions."

- **Power BJT needs large base current; IGBT combines insulated gate with bipolar output**
  - Source: IGBTs | Insulated-gate Field-effect Transistors | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-6/igbts/
  - Quote: "for a power BJT with a β of 20 to conduct a collector current of 100 Amps, there must be at least 5 Amps of base current, a substantial amount of current in itself for miniature discrete or integrated control circuitry to handle:"

- **IGBT: the gate drives a bipolar transistor which carries the load**
  - Source: IGBTs | Insulated-gate Field-effect Transistors | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-6/igbts/
  - Quote: "In essence, the IGFET controls the base current of a BJT, which handles the main load current between collector and emitter."

- **IGBT disadvantage: slower turn-off**
  - Source: IGBTs | Insulated-gate Field-effect Transistors | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-6/igbts/
  - Quote: "One disadvantage of the IGBT over a standard BJT is its slower turn-off time."

- **IGFET gate current only the transient to charge the gate capacitance**
  - Source: IGBTs | Insulated-gate Field-effect Transistors | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-6/igbts/
  - Quote: "The only current we see through the gate terminal of an IGFET, then, is whatever transient (brief surge) may be required to charge the gate-channel capacitance and displace the depletion region as the transistor switches from an “on” state to an “off” state, or vice versa."

- **A switch that is fully on or fully off dissipates little heat**
  - Source: Rectifier Circuits | Diodes and Rectifiers | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-3/rectifier-circuits/
  - Quote: "Since the controlling device (the diode, in this case) is either fully conducting or fully nonconducting at any given time, it dissipates little heat energy while controlling load power, making this method of power control very energy-efficient."

- **IGBT must not run in linear mode: excessive conduction losses**
  - Source: Industrial IGBT Modules:Explanation of Technical Information. https://www.infineon.com/assets/row/public/documents/24/42/infineon-an2011-05-igbt-modules-explanation-applicationnotes-en.pdf
  - Quote: "The IGBT should not be operated in linear mode, as this causes excessive conduction losses."

- **Losses are conduction losses plus switching losses (ST)**
  - Source: Thermal effects and junction temperature evaluation of Power MOSFETs. https://www.st.com/resource/en/application_note/dm00241971-thermal-effects-and-junction-temperature-evaluation-of-power-mosfets-stmicroelectronics.pdf
  - Quote: "Conduction losses (related to the ohmic characteristics of the device)  Switching losses divided into:"

- **Switching loss = switching energy times switching frequency**
  - Source: IGBT_Power_Losses_Calculation_using_the_Data_Sheet_Parameters. https://www.infineon.com/assets/row/public/documents/faq/igbt-power-losses-calculation-using-the-data-sheet-parameters.pdf
  - Quote: "The switching losses in the IGBT and the diode are the product of switching energies and the switching frequency (fsw)"

- **Heat sink thermal chain: power dissipation relates to the temperature difference and thermal resistance junction to case**
  - Source: Industrial IGBT Modules:Explanation of Technical Information. https://www.infineon.com/assets/row/public/documents/24/42/infineon-an2011-05-igbt-modules-explanation-applicationnotes-en.pdf
  - Quote: "The power dissipation is related to ∆T between junction and case and the thermal resistance RthJC between junction and case"

- **Commutating (freewheeling) diode removes inductive kickback**
  - Source: Inductor Commutating Circuits | Diodes and Rectifiers | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-3/inductor-commutating-circuits/
  - Quote: "A popular use of diodes is for the mitigation of inductive “kickback:” the pulses of high voltage produced when direct current through an inductor is interrupted."

- **With the diode across the coil the voltage is only the diode's forward drop**
  - Source: Inductor Commutating Circuits | Diodes and Rectifiers | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-3/inductor-commutating-circuits/
  - Quote: "As a result, the voltage induced in the coil by its collapsing magnetic field is quite low: merely the forward voltage drop of the diode, rather than hundreds of volts as before."


### 4.5 The thyristor, phase control, the triac, soft starters, battery chargers
Latching, holding current and natural commutation are in the AAC SCR page. Phase control: the firing angle chops the sine; the
average of a chopped half-sine is computed by integrating from alpha, which Dan has from Calculus fundamentals, giving Vmax/pi x
(1 + cos alpha) for a half-controlled bridge and Vmax/pi x cos alpha for a fully controlled bridge (from a reader's comment on the Electronics Tutorials page; the page's own formulas are images: **UNCONFIRMED** as a quote, my arithmetic).
**Source error to avoid:** the same page gives the fully controlled range as Vmax/pi down to minus Vmax/pi (quoted below), which is half
the usual result for continuous current, 2 Vmax cos(alpha)/pi (my working: at alpha = 0 it must equal the
uncontrolled bridge's 0.637 Vmax = 2 Vmax/pi). The build must compute this in the interactive, not copy the page. A larger delay lowers the
DC voltage and the input power factor (ECPE). Triac: two thyristors back to back, used for lamps and heaters, not motors. Soft starters
are back-to-back thyristor pairs ramping the voltage. The battery charger material (thyristor rectifier; constant current then
constant voltage; float about 2.25 V per cell for lead-acid; ripple heats the battery) weights the examples to what Dan said matters.
**Hydrogen from charging**: general (CCOHS) sources are quoted; anything about a particular boat's ventilation is not taught
(CLAUDE.md). A public CIBSE ventilation case study mentions a submarine's hydrogen limit; it is not quoted and should not be used.

- **SCR: small gate voltage latches it on**
  - Source: The Silicon-Controlled Rectifier (SCR) | Thyristors | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-7/silicon-controlled-rectifier-scr/
  - Quote: "This method of securing SCR conduction is called triggering or firing, and it is by far the most common way that SCRs are latched in actual practice."

- **SCR turns off when anode current falls below holding current**
  - Source: The Silicon-Controlled Rectifier (SCR) | Thyristors | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-7/silicon-controlled-rectifier-scr/
  - Quote: "SCRs may be turned off by anode current falling below the holding current value (low-current dropout)"

- **SCR chops the sine wave at any point for time-proportioned power control**
  - Source: The Silicon-Controlled Rectifier (SCR) | Thyristors | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-7/silicon-controlled-rectifier-scr/
  - Quote: "By connecting a suitable control circuit to the gate of an SCR, we can “chop” the sine wave at any point to allow for time-proportioned power control to a load."

- **Natural commutation: thyristor turns off near the zero crossing and must be fired again**
  - Source: The Silicon-Controlled Rectifier (SCR) | Thyristors | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-7/silicon-controlled-rectifier-scr/
  - Quote: "Just prior to the zero-crossover point of the current waveform, the thyristor will turn off due to insufficient current (this behavior is also known as natural commutation) and must be fired again during the next cycle."

- **SCRs replacing diodes in a rectifier make a controlled rectifier**
  - Source: The Silicon-Controlled Rectifier (SCR) | Thyristors | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-7/silicon-controlled-rectifier-scr/
  - Quote: "If the diodes in a rectifier circuit are replaced by SCRs, you have the makings of a controlled rectifier circuit, whereby DC power to a load may be time-proportioned by triggering the SCRs at different points along the AC power waveform."

- **Controlled three-phase rectifier: output a function of the firing angle alpha**
  - Source: Three Phase Rectification of a 3-phase Supply Using Diodes. https://www.electronics-tutorials.ws/power/three-phase-rectification.html
  - Quote: "So if the firing angle is zero, (cos(0) = 1), the controlled rectifier performs similar to the previous 3-phase uncontrolled diode rectifier with the average output voltages being the same."

- **Single-phase fully controlled: alpha below 90 degrees positive DC, above 90 negative (power back to the AC)**
  - Source: Single Phase Rectification of a Sinusoidal AC Power Supply. https://www.electronics-tutorials.ws/power/single-phase-rectification.html
  - Quote: "So when α < 90 o the average DC voltage is positive and when α > 90 o the average DC voltage is negative. That is power flows from the DC load to the AC supply."

- **Larger delay of the trigger pulse gives lower DC voltage but a worse input power factor**
  - Source: Three-Phase Full-Bridge. https://www.ecpe.org/infocentre/ecpe-online-course/dcac/three-phase-full-bridge
  - Quote: "For a smaller DC voltage it is necessary to increase the delay of the trigger pulse. The trigger angle causes a phase shift of the input currents which reduces the power factor of the converter."

- **Triac behaves like two thyristors in inverse parallel**
  - Source: Triac Tutorial and How Triac Switching Circuits Work. https://www.electronics-tutorials.ws/power/triac.html
  - Quote: "A Triac behaves just like two conventional thyristors connected together in inverse parallel (back-to-back) with respect to each other"

- **Triac dimmers are for resistive loads only, not motors**
  - Source: Triac Tutorial and How Triac Switching Circuits Work. https://www.electronics-tutorials.ws/power/triac.html
  - Quote: "commercially available triac lamp dimmers should not be used as a motor speed controller since triac light dimmers are intended to be used with resistive loads only"

- **Soft starter: thyristors fire later and the voltage ramps from 0 to rated, limiting starting current**
  - Source: Motor starting with Soft starters – Reduced stresses. https://library.e.abb.com/public/151fdb9b43c49ee648257cc4003bc11b/Motor+starting+with+soft+starters+-+Reduced+stresses.pdf
  - Quote: "With methodology of firing of thyristors, voltage ramp (linear variation of voltage from 0 to rated voltage). This ramp ensures smooth starting of motor with starting current limit."

- **Soft starter thyristors are connected back-to-back**
  - Source: Determination of soft starter firing angle performance to mitigate motor high inrush current using current limitation method - IOPscience. https://iopscience.iop.org/article/10.1088/1757-899X/767/1/012025/meta
  - Quote: "The switches is in form of thyristor and are connected back-to-back because the system conduct in AC system."

- **Thyristor-controlled rectifier battery charger for lead-acid and NiCd**
  - Source: LEA_Protect RCS SPRe TPRe_EN. https://www.aegps.com/en/wp-content/uploads/2023/07/LEA_Protect-RCS-SPRe-TPRe_EN_V4.pdf
  - Quote: "The Protect RCS DC system is a thyristor-controlled rectifier suitable for charging nickel-cadmium or lead-acid batteries while supplying DC loads."

- **Battery charging: constant current, then constant voltage (CCCV) in three stages**
  - Source: Battery University | BU-403: Charging Lead Acid. http://www.batteryuniversity.com/article/bu-403-charging-lead-acid
  - Quote: "The lead acid battery uses the constant current constant voltage (CCCV) charge method."

- **Battery charger float voltage about 2.25 V per cell**
  - Source: Battery charger basics | Chargetek.com. https://chargetek.com/basic-information.html **SECONDARY** (not the original publisher of the claim).
  - Quote: "Float mode is where the battery voltage is maintained at approximately 2.25 volts per cell, or 13.5 volts for a 12V battery."

- **Charger ripple matters: AC ripple voltage causes ripple current and heating in the battery**
  - Source: Layout 1. https://assets.ctfassets.net/3inf9wk05c1h/42pCwtNYBNWiazMcKLlfGR/2ec889e3a4cd5db991a876cd48609cf8/41-2128-Charging-VRLA-WEB_comp.pdf
  - Quote: "An excessive AC ripple voltage induces an AC ripple current which results in additional heating of the battery and a resulting decrease in the expected life"

- **Lead-acid charging gives off hydrogen, explosive in air at 4.1 to 72 percent**
  - Source: CCOHS: Battery Charging - Industrial Lead-Acid Batteries. https://www.ccohs.ca/oshanswers/safety_haz/battery-charging.html
  - Quote: "When leac-acid batteries are being recharged, they generate hydrogen gas that is explosive in certain concentrations in air (explosive limits are 4.1 to 72 percent hydrogen in air)."

- **Battery rooms need ventilation that keeps hydrogen well under the lower explosive limit**
  - Source: CCOHS: Battery Charging - Industrial Lead-Acid Batteries. https://www.ccohs.ca/oshanswers/safety_haz/battery-charging.html
  - Quote: "Many standards and codes recommend a ventilation system that prevents the accumulation of hydrogen to above 25% of its lower explosive limit (LEL)"

- **Electronics Tutorials' own range for a fully controlled single-phase bridge, Vmax/pi to -Vmax/pi (looks half the usual 2Vmax/pi; flagged as a likely source error)**
  - Source: Single Phase Rectification of a Sinusoidal AC Power Supply. https://www.electronics-tutorials.ws/power/single-phase-rectification.html
  - Quote: "With the average output voltage varying from V MAX /π to -V MAX /π by varying the firing angle, α from π to 0 respectively."


### 4.6 Chopping DC: buck and boost, duty cycle, the inductor and capacitor as energy buffers
Vout = D x Vin for the buck in continuous conduction follows from volt-second balance on the inductor: (Vin - Vo) Ton = Vo Toff, so
Vo = Vin Ton / T. The Monolithic Power page gives it as E x d but its formula text arrived garbled (flagged). The **boost** result
(Vout = Vin / (1 - D)) has **no clean quote** in this run (**UNCONFIRMED**; the same balance gives it: Vin D = (Vout - Vin)(1 - D)... my
working, to be verified by computation in the build, not asserted from a source). Inductor and capacitor as buffers: the inductor
keeps the current going through the diode when the switch opens; the capacitor holds the output. A useful design number is a 20 to
40 per cent inductor ripple current (TI).

- **Buck converter: DC to DC from a battery or rectified supply**
  - Source: Buck Converters. https://learnabout-electronics.org/PSU/psu31.php
  - Quote: "The buck converter is a form of DC to DC converter that can take an input directly from a DC source, such as a battery."

- **Switching supplies are more efficient than linear and can step up, step down and invert**
  - Source: DC to DC Buck Converter Tutorial & Diagram | Analog Devices. https://www.analog.com/en/resources/technical-articles/dc-to-dc-buck-converter-tutorial.html
  - Quote: "Switching power supplies offer higher efficiency than traditional linear power supplies. They can step-up, step-down, and invert."

- **Buck volt-second balance: (Vin - Vo) Ton = Vo Toff**
  - Source: How to Calculate Buck Converter Duty Cycle. https://www.allpcb.com/allelectrohub/how-to-calculate-buck-converter-duty-cycle
  - Quote: "The volt-second balance equation is: (Vin - Vo) \* Ton = Vo \* Toff"

- **In steady state the average inductor voltage is zero**
  - Source: How to Calculate Buck Converter Duty Cycle. https://www.allpcb.com/allelectrohub/how-to-calculate-buck-converter-duty-cycle
  - Quote: "In a steady state, the average voltage across the inductor is zero. According to the principle of volt-second balance:"

- **Buck output equals duty cycle times input (E times d)**
  - Source: Buck Converters (Step-Down Converter). https://www.monolithicpower.com/en/learning/mpscholar/power-electronics/dc-dc-converters/buck-converters
  - Quote: "The average load voltage (the voltage across the resistor R) value is equal to: U = E ⋅ t O N t O N \+ t O F F = E ⋅ t O N T = E ⋅ d where d represents the duty cycle of the switch S."

- **Buck: switch, then the flywheel circuit of diode, inductor and capacitor**
  - Source: Buck Converters. https://learnabout-electronics.org/PSU/psu31.php
  - Quote: "3.1.1 the buck Converter circuit consists of the switching transistor, together with the flywheel circuit (Dl, L1 and C1)."

- **Analog Devices: when the switch opens, inductor current continues into the diode to charge the output**
  - Source: DC to DC Buck Converter Tutorial & Diagram | Analog Devices. https://www.analog.com/en/resources/technical-articles/dc-to-dc-buck-converter-tutorial.html
  - Quote: "When the switch opens again, the inductor current continues to flow into the rectification diode to charge the output."

- **PWM duty cycle: loads integrate the power to a number matching the percentage**
  - Source: Pulse Width Modulation | DC Motor Drives | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-11/pulse-width-modulation/
  - Quote: "Many loads, such as resistors , integrate the power into a number matching the percentage."

- **TI: a buck converter's ripple current estimate 20 to 40 percent of output current**
  - Source: Basic Calculation of a Buck Converter's Power Stage (Rev. B). https://www.ti.com/lit/an/slva477b/slva477b.pdf?ts=1786269682384
  - Quote: "A good estimation for the inductor ripple current is 20% to 40% of the output current."


### 4.7 Inverting: H-bridge, three-phase bridge, PWM, dead time; where it sits in a UPS and a drive
H-bridge first, then three legs for three-phase (TI describes the six-switch bridge and the PWM duty-cycle idea in one paragraph).
Sine-triangle PWM for three sine waves 120 degrees apart; the motor's inductance smooths the current. Dead time: both switches off
briefly so the two in a leg are never on together (shoot-through); it distorts the output a little, so keep it short. Online double
conversion: rectifier to DC link to inverter, with the battery on the DC link and a static bypass; zero transfer time. Motors lesson i3
already taught the VSD's blocks and V/f; this course goes **inside** those blocks. The "UPS" and "drive" share the same bridge, which
is the one idea to lead with.

- **H-bridge used with PWM; diodes suppress inductive spikes**
  - Source: Pulse Width Modulation | DC Motor Drives | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-11/pulse-width-modulation/
  - Quote: "PWM is often used in conjunction with an H-Bridge. This configuration is so named because it resembles the letter H"

- **Inverter: six switches under PWM; phase voltage set by duty cycle**
  - Source: 産業用ドライブ向けの基本的な絶縁三相、小型電力段のリファレン ス・デザイン. https://www.ti.com/jp/lit/ug/jaju378/jaju378.pdf?ts=1792734350380
  - Quote: "PWM signals generated from the microcontroller (MCU) control these six switches through an isolated gate driver. The amplitude of phase voltage is determined by the duty cycle of the PWM signals."

- **The motor's inductance filters the PWM current into a near-sine**
  - Source: 産業用ドライブ向けの基本的な絶縁三相、小型電力段のリファレン ス・デザイン. https://www.ti.com/jp/lit/ug/jaju378/jaju378.pdf?ts=1792734350380
  - Quote: "filters this supplied current to produce a three-phase sine wave with negligible harmonics."

- **Sine-triangle PWM works for three sine waves 120 degrees apart**
  - Source: What is Pulse-Width Modulation (PWM), anyway? - Developer Help. https://developerhelp.microchip.com/xwiki/bin/view/applications/motors/control-algorithms/zsm/pwm
  - Quote: "Sine-triangle PWM will work for three sine waves that are 120° out of phase"

- **Dead time: both switches off before one turns on, to prevent shoot-through**
  - Source: PWM Dead Times in Automotive Traction Inverters using IGBT, SiC MOSFET, or Si/SiC Fusion Switch Power Modules - Reiter - 2026 - IET Power Electronics - Wiley Online Library. https://ietresearch.onlinelibrary.wiley.com/doi/10.1049/pel2.70185
  - Quote: "A crucial aspect of this topology is the insertion of PWM dead times, where both the low-side and high-side switches are turned off before one of the switches turns on."

- **Dead time prevents shoot-through caused by unequal turn-on and turn-off times**
  - Source: Calculate and minimize the dead time for IGBTs. https://www.newweb-qa2.infineon.com/assets/row/public/documents/60/42/Infineon-Deadtime_calculation_for_IGBT_modules-ApplicationNotes-v01_10-EN.pdf
  - Quote: "With this additional time, one of the two IGBTs is always turned off first, and the other one will be turned on after the dead time has expired, thus preventing a bridge shoot-through caused by the asymmetrical turn-on and turn-off times of the IGBTs."

- **Dead time distorts output voltage, so the smaller the better**
  - Source: Compensation techniques for non-linearities in H-bridge inverters. https://www.um.edu.mt/library/oar/bitstream/123456789/27427/1/Compensation_techniques_for_non-linearities_in_H-bridge_inverters_2016.pdf
  - Quote: "The dead time introduces a non-linearity which causes distortion in the output voltage and current, and therefore the smaller is the dead time the better."

- **UPS double conversion has four elements: rectifier, inverter, static bypass, battery**
  - Source: Eaton Energy Saver System:. https://www.eaton.com/content/dam/eaton/markets/data-center/documents/Eaton_Energy_Saver_System_facts_and_principles_White_Paper.pdf
  - Quote: "In essence, the power sections of double-conversion UPSs comprise four main functional elements: a rectifier, an inverter, a static bypass and a battery."

- **Double conversion: rectifier supplies inverter, loads fed from the inverter**
  - Source: Eaton Energy Saver System:. https://www.eaton.com/content/dam/eaton/markets/data-center/documents/Eaton_Energy_Saver_System_facts_and_principles_White_Paper.pdf
  - Quote: "It can operate in double-conversion mode, when the rectifier supplies power to the inverter and the loads are powered from the output of the inverter."

- **Double conversion: zero transfer time to battery**
  - Source: Eaton UPS fundamentals handbook. https://www.eaton.com/content/dam/eaton/products/backup-power-ups-surge-it-power-distribution/backup-power-ups/eaton-ups-fundamentals-handbook-en-us-2025.pdf
  - Quote: "Double conversion A UPS design in which the primary power path consists of a rectifier and inverter. Unlike other topologies, double conversion provides zero transfer time to battery for sensitive equipment."

- **ABB: incoming AC continuously rectified then inverted back to AC**
  - Source: ABB review 4|13 28. https://library.e.abb.com/public/6c5534f5c0603cbcc1257c5a0040d46b/28-33%204m335_EN_72dpi.pdf
  - Quote: "the incoming alternating current (AC) is continuously converted by rectifi- er to direct current (DC) and then back to AC via an inverter."

- **IEC 62040-3 UPS has a rectifier, battery charger, inverter and bypass**
  - Source: Technical Comparison of On-line vs. Line-interactive UPS designs. http://media.zones.com/images/pdf/White_paper_APC_Technical_Comparison.pdf
  - Quote: "Bypass Switch AC Output Inverter DC Link Battery to DC Converter Rectifier Battery Charger (optional)"

- **Drive inverters use IGBTs; same device in UPS**
  - Source: 3-Phase Inverter Ref Design Using Gate Driver With Built-in Dead Time Insertion. https://www.ti.com/lit/ug/tidudj9/tidudj9.pdf?ts=1789030621221
  - Quote: "Insulated gate bipolar transistors (IGBTs) are mostly used in three-phase inverters that have numerous applications like variable-frequency drives that control the speed of AC motors, uninterruptible"


### 4.8 Living with power electronics: harmonics, stored charge, earth leakage, insulated systems, EMC
Harmonics: a six-pulse rectifier gives 5th, 7th, 11th, 13th and so on (h = 6n plus or minus 1); the 5th and 7th are the largest; a
6-pulse drive typically runs 25 to 40 per cent current THD; a line reactor reduces it; the class limit for a ship's voltage THD
is 8 per cent (IACS UR E24). The 1/h rule of thumb for the size of each harmonic is a rule, not a law (SECONDARY). Stored charge: 4.3.
Earth leakage on an earthed system: the EMC filter's capacitors to earth cause a steady leakage; the drive can put DC into the
earth path, so a Type AC or Type A RCD may not trip or may be blinded; manufacturers and the standards behind them name Type B for
three-phase drives. BS 7671 Regulation 531.3.3 sets the RCD types; Amendment 2 limits Type AC to fixed equipment with no DC component.
**Whether BS 7671 itself names drives for Type B is UNCONFIRMED** (the book is Dan's; the sources are manufacturers). Do not reproduce
the regulation's tables. On an insulated (IT) system: drive EMC filters and varistors are not suitable and must be disconnected as
the maker says; the first earth fault does not produce a dangerous contact voltage; an insulation monitoring device is designed to
work with rectifiers, inverters and drives on the system. EMC basics: a line filter plus screened motor cable with 360 degree
screen termination; IEC 61800-3 has categories C1 to C4. Everything in 4.8 comes from industrial manufacturers or guidance; nothing
here describes any naval installation.

- **Six-pulse bridge characteristic harmonics: h = 6n plus or minus 1 (5, 7, 11, 13, 17, 19)**
  - Source: Guidance Notes on Control of Harmonics in Electrical Power Systems 2006. https://ww2.eagle.org/content/dam/eagle/rules-and-guides/current/conventional_ocean_service/150_ctrlofharmonicsinelecpowersystems/electrical-harmonics-gn.pdf
  - Quote: "the characteristic harmonic currents will therefore be: _h_ = _np_ ± 1 _h_ = _n_ ⋅ 6 ± 1 _h_ = 5, 7, 11, 13, 17, 19…"

- **Siemens: three-phase bridge p = 6, dominant harmonics 5, 7**
  - Source: Whitepaper — Harmonics in power systems. https://assets.new.siemens.com/siemens/assets/api/uuid:8ab2a02e-ad94-41cb-a362-438f016aa704/drive-harmonics-in-power-systems-whitepaper.pdf
  - Quote: "For a three-phase bridge rectifier, since the number of pulses _p_ = 6 per line frequency cycle, the characteristic or dominant harmonics are: _h = n_ ⋅ 6 ± 1 = 5, 7,"

- **The two largest harmonic currents for a six-pulse drive are the 5th and 7th**
  - Source: Harmonic Sources From Industrial Loads I. https://www.idc-online.com/technical_references/pdfs/electrical_engineering/Harmonic_Sources_from_Industrial_Loads_I.pdf
  - Quote: "The two largest harmonic currents for the six-pulse drive are the fifth and seventh"

- **IEEE: 6-pulse drives 25 to 40 percent current THD, 12-pulse 9 to 11 percent, 18-pulse 3 to 4 percent**
  - Source: Microsoft PowerPoint - Harmonics - MCPQG IEEE 2005.ppt. https://ewh.ieee.org/r3/nashville/events/2005/Harmonics_MCPQG_IEEE_2005.pdf
  - Quote: "25% - 40% Current THD ## 9% - 11% Current THD ## 3% - 4% Current THD"

- **THD is quoted with I or V, e.g. 35% THDI and 4% THDV**
  - Source: 22.0 Harmonics in Industrial Power Systems. https://www.rose-hulman.edu/class/ee/HTML/ECE471/PDFs/Lect15.pdf
  - Quote: "These are usually quoted in terms of Total Harmonic Distortion (THD) with the appropriate “I” or “V”, e.g. 35% THDI and 4% THDV."

- **THD factor: rms of the harmonics over rms of the fundamental**
  - Source: Total Harmonic Distortion: Theory and Practice Gamry Instruments. https://www.gamry.com/application-notes/EIS/total-harmonic-distortion
  - Quote: "The THD factor describes the ratio between the root mean square (RMS) of the harmonics’ magnitudes (Y n ) and the RMS magnitude of the fundamental frequency (Y ₁ )."

- **Line reactors limit drive harmonic currents**
  - Source: Whitepaper — Harmonics in power systems. https://assets.new.siemens.com/siemens/assets/api/uuid:8ab2a02e-ad94-41cb-a362-438f016aa704/drive-harmonics-in-power-systems-whitepaper.pdf
  - Quote: "of a reactor is valuable for limiting the harmonic currents produced by electrical variable speed drives and other non-linear loads."

- **ABS: variable speed drives of all types use power semiconductors to rectify the AC input**
  - Source: Guidance Notes on Control of Harmonics in Electrical Power Systems 2006. https://ww2.eagle.org/content/dam/eagle/rules-and-guides/current/conventional_ocean_service/150_ctrlofharmonicsinelecpowersystems/electrical-harmonics-gn.pdf
  - Quote: "Electrical variable speed drives of all types (i.e., AC or DC) use power semiconductors to rectify the AC input voltage"

- **IACS UR E24: THD of ship distribution not to exceed 8 percent**
  - Source: Hull Classification Surveys. https://turkloydu.org/pdf-files/iacs-karar-ve-csr-degisimleri/iacs-es-gereklilikleri/UR_E24_New_TR_EN.PDF
  - Quote: "The total harmonic distortion (THD) of electrical distribution systems is not to exceed 8%."

- **Schneider: Type B or B-Si suits three-phase drives (DC offset fault currents)**
  - Source: Why choose Type B RCD for 3 Phase Variable Speed Drives? | Schneider Electric Australia. https://www.se.com/au/en/faqs/FAQ000184975
  - Quote: "For the 3 Phase Variable Speed Drives, the RCD type B or type B-Si is particularly suitable. It protects against fault currents with DC offset, which is true for three-phase power converters."

- **Yaskawa: for shock protection only a Type B RCD is allowed for three-phase drives**
  - Source: james_piotrowski_20260218032458_EZZ024333_4.xps. https://www.yaskawa.com/delegate/getAttachment?cmd=documents&documentId=CE.GA500.01&documentName=CE.GA500.01.pdf
  - Quote: "If an RCD is used for protection against electric shock, only a type B RCD is allowed for 3-phase VSD applications."

- **Doepke: EMC filter makes fixed leakage; low-cost filters may be incompatible with the installation**
  - Source: RCD Protection and Selection for VSD / VFD / Inverter controlled Pumps - Doepke (UK) Ltd. https://doepke.co.uk/technical-publications/rcd-protection-and-selection-for-vsd-vfd-inverter-controlled-pumps
  - Quote: "Low cost filters can create high levels of leakage current that may not be compatible with the safety requirements of the installation."

- **Type A detects only sinusoidal AC and pulsating DC**
  - Source: RCD Type A, F or B Guide | A1-ESD. https://esd.equipment/en/ratgeber/rcd-type-a-b-f-guide **SECONDARY** (not the original publisher of the claim).
  - Quote: "Type A only detects sinusoidal AC and pulsating DC residual currents."

- **BS 7671 amendment 2: Type AC only for fixed equipment with no DC components**
  - Source: BS 7671:2018 + A2:2022. https://www.cibse.org/media/esqlg20r/bs_7671_18th-ed-amd-2-cibse-iet-lecture-april-2022-with-additional-notes.pdf
  - Quote: "RCD Type AC shall only be used to serve fixed equipment, where it is known that the load current contains no DC components."

- **BS 7671 Regulation 531.3.3 covers AC, A, F and B RCD types**
  - Source: Selecting the correct Type of RCD – 18 Edition BS7671. https://doepke.co.uk/wp-content/uploads/2026/03/Techpub-08.pdf
  - Quote: "Regulation 531.3.3 refers to the use of AC, A, F and B Type RCDs, along with the details of the associated residual current limits."

- **Drive touch current above 3.5 mA AC or 10 mA DC: protective earth conductor sizing**
  - Source: EN / Grounding and cabling of drive systems reference manual. https://library.e.abb.com/public/9fbb4caf4e7b4bf7970839b083ba5396/EN_Drive_systems_grounding_and_cabling_REF_D_A4.pdf
  - Quote: "Because the normal touch current of the drive is more than 3.5 mA AC or 10 mA DC: • the minimum size of the protective earth conductor must comply with the local safety regulations for high"

- **ABB: all drive EMC filters and ground-to-phase varistors unsuitable for IT systems; disconnect them**
  - Source: EN / Grounding and cabling of drive systems reference manual. https://library.e.abb.com/public/9fbb4caf4e7b4bf7970839b083ba5396/EN_Drive_systems_grounding_and_cabling_REF_D_A4.pdf?x-sign=3SuYnT4patNrek9eD4F4v49jpMcUC0PsAumf%2Bd3ip%2Bf30Y78wR1WZlqqtMyHTOtx
  - Quote: "All drive EMC filters and ground-to-phase varistors are not suitable for use in IT (ungrounded) or corner-grounded and mid-point grounded delta systems. Disconnect these filters"

- **ABB ACS800: an EMC filter is not suitable for use in an IT system**
  - Source: EN / ACS800-07 (+V992) drives (500-2800 kW) hardware manual, Rev C. https://library.e.abb.com/public/f1c6e66c2b713db5c1257b110048f390/EN_ACS800-07_V992__HW_C_screen.pdf
  - Quote: "An EMC filter (option +E202) is not suitable for use in an IT (ungrounded) system."

- **IT system first fault: no notable return current, no dangerous contact voltage**
  - Source: EMC filters - Technical information. https://www.tdk-electronics.tdk.com/download/3107180/7f30b0110a521bb506ace36f0c56af5c/pdf-technical-information.pdf
  - Quote: "During the so-called first fault (earth fault or ground short circuit), no notable return current paths are produced and thus no dangerous contact voltage."

- **Bender insulation monitor watches unearthed AC/DC main circuits**
  - Source: Insulation Monitoring Device for IT AC systems with galvanically connected rectifiers and inverters and for IT DC systems. https://www.bender.de/fileadmin/content/Products/d/e/iso685-x_D00022_D_XXEN.pdf
  - Quote: "The ISOMETER® monitors the insulation resistance of unearthed AC/DC main circuits (IT systems)."

- **Bender: AC IT systems may include DC-supplied loads such as rectifiers, inverters, variable-speed drives**
  - Source: Insulation Monitoring Device for IT AC systems with galvanically connected rectifiers and inverters and for IT DC systems. https://www.bender.de/fileadmin/content/Products/d/e/iso685-x_D00022_D_XXEN.pdf
  - Quote: "AC systems may include extensive DC-supplied loads (such as rectifiers, inverters, variable-speed drives)."

- **ABB insulation relay covers networks with frequency inverters, UPS, battery networks**
  - Source: Insulation monitoring relay CM-IWM.10. https://library.e.abb.com/public/4ae6abdae2ed49ea8df9e28255272da3/2CDC112243D0201_D_CM-IWM.11_data_sheet.pdf
  - Quote: "Insulation monitoring of: • Non-earthed DC / AC and mixed IT networks • UPS systems • Networks with frequency inverters • Battery networks"

- **Siemens: insulation monitor on an IT supply sees all insulation faults from line infeed to motor**
  - Source: L87, insulation monitoring - SINAMICS S120 Cabinet Modules liquid cooled - ID: 109975301 - Industry Support Siemens. https://support.industry.siemens.com/cs/mdm/109975301?c=179939062923&dl=en
  - Quote: "On non-grounded line supplies (IT supply systems), the insulation monitoring device monitors the entire electrically-connected circuit for insulation faults."

- **Siemens EMC: line filters cut conducted interference 150 kHz to 30 MHz**
  - Source: EMC - electromagnetic compatibility. https://cache.industry.siemens.com/dl/files/658/60612658/att_1292420/v2/EMV_config_man_202407_en-US.pdf
  - Quote: "Line filters reduce the conducted interference from the drive to the supplying network in the 150 kHz to 30 MHz"

- **Line filters plus shielded motor cables limit high-frequency interference**
  - Source: EMC - electromagnetic compatibility. https://cache.industry.siemens.com/dl/files/658/60612658/att_1292420/v2/EMV_config_man_202407_en-US.pdf
  - Quote: "Line filters combined with shielded motor connection cables limit the high-frequency interference."

- **ABB: ground the motor cable shield 360 degrees at the motor terminal box**
  - Source: Template info: Rev C Vault Id: 00346062 MRP Code: 68347459. https://library.e.abb.com/public/3fe249b4f19a4f47aabb17aeb1ae3f4f/EN_Grounding_and_cabling_rev_C.pdf?x-sign=N%20QPDeCdpU%2F7pb7RvAiTddO65FbO9a9XjRapDNQkh9FMKoDB%20BSSz0qBs4HTJ%20%2FP
  - Quote: "For minimum radio frequency interference, ground the motor cable shield 360 degrees at the lead-through of the motor terminal box"

- **Nidec: shielded cable from drive to motor needed to meet emission standards**
  - Source: Microsoft Word - Commander C200 C300 frame size 7 EMC data sheet.docx. https://cdn-static.nidec-netherlands.nl/media/4472-emc-datasheets-c200-c300-frame-7-iss0001.pdf
  - Quote: "To comply with emission standards, a shielded (screened) cable must be used to connect the variable speed drive to the motor."

- **EMC product categories C1 to C4 in IEC 61800-3**
  - Source: Microsoft Word - PAPER Best Installation Practice for VSD EG 03. https://iceweb.eit.edu.au/ElectricalWeb/Earthing/Earthing%20Bonding%20Variable%20Speed%20Drives%20.pdf
  - Quote: "four different product categories (C1, C2, C3 and C4) which defines different limits for conducted RFI noise into the mains terminal"

- **Common IMD behaviour: alarm at start-up from filter capacitors charging through the monitor (SECONDARY)**
  - Source: VFD Input Transformer Grounding: HRG & IT Design Guide – Industrial Monitor Direct. https://industrialmonitordirect.com/blogs/knowledgebase/vfd-input-transformer-grounding-ungrounded-secondary-design **SECONDARY** (not the original publisher of the claim).
  - Quote: "Insulation monitor alarm at startup only |Common-mode filter capacitors charging through the IMD"

- **Rule of thumb: harmonic current is about the fundamental divided by the harmonic number (SECONDARY)**
  - Source: Harmonics in Power System | Electrical India Magazine. https://www.electricalindia.in/harmonics-in-power-system-2 **SECONDARY** (not the original publisher of the claim).
  - Quote: "As a rough rule of thumb, the magnitudes of the harmonic currents will be the fundamental current divided by the harmonic number"


---

## 5. Prerequisites: what this topic leans on, and what Dan has

**Has (built):**
- AC circuits: rms, the sine wave, reactance, capacitance and inductance in AC, power factor, three-phase star and delta
  (brief: `/home/user/Study-App/build/electrical/ac-circuits/brief.md`; lessons 1 to 10, from a turning coil to star and delta).
- Motors: the three-phase motor, DOL and the VSD at block level (rectifier, DC bus, inverter, V/f), DC motors (brief:
  `/home/user/Study-App/build/electrical/motors/brief.md`). Motors lesson i3 is the one to build on and not repeat.
- Calculus fundamentals: integrals (average of a half-sine and of a chopped sine) and the capacitor/inductor laws i = C dv/dt.
- Exponentials and logarithms: capacitor charging and discharging (the precharge time, the discharge wait).
- Trigonometry and Complex numbers: sin and cos of the firing angle; the root-three between line and phase.
- Design and verification: RCD, protective devices, earth fault loop impedance, inspection and test (so the RCD point in 4.8 is
  "which type, and why" not "how to test").
- Statistics for engineers (brief `/home/user/Study-App/build/maths/statistics-for-engineers/brief.md`): not needed here.

**Order the benchmark books teach it in** (Hughes and Bird both put capacitors, magnetism, inductance and AC before semiconductors, which
is exactly what Dan has from AC circuits and Motors):

- **Hughes order: capacitance and capacitors (5), electromagnetism (6), inductance in a DC circuit (8), AC (9 to 15)**
  - Source: Hughes Electrical and Electronic Engineering. https://www.pearson.com/en-gb/subject-catalog/p/hughes-electrical-and-electronic-technology/P200000004514/9781292134598
  - Quote: "5 Capacitance and Capacitors * 6 Electromagnetism * 7 Simple Magnetic Circuits * 8 Inductance in a DC Circuit * 9 Alternating Voltage and Current * 10 Single-phase Series Circuits * 11 Single-phase Parallel Networks * 12 Complex Notation * 13 Power in AC Circuits * 14 Resonance in AC Circuits * 15 Network Theorems Applied to AC Networks"

- **Bird order: batteries (6), capacitors (8), electromagnetism, then semiconductor diodes (13) and transistors (14)**
  - Source: Bird's Electrical Circuit Theory and Technology - 7th Edition - John B. https://www.routledge.com/Birds-Electrical-Circuit-Theory-and-Technology/Bird/p/book/9780367672225
  - Quote: "Batteries and alternative sources of energy 7\. Series and parallel networks 8\. Capacitors and capacitance 9\. Magnetic circuits 10\. Electromagnetism 11\. Electromagnetic induction 12\. Electrical measuring instruments and measurements 13\. Semiconductor diodes 14\. Transistors"

**Must be taught inline (short):**
1. The diode's drop as a constant (0.7 V) and its failure picture: a one-line reminder, not a lesson.
2. The inductor as a current-keeping store (Dan has the equation, v = L di/dt, from Calculus; the behaviour on a switch opening is new).
3. Duty cycle as a ratio (Proportional reasoning, Percentages): one line.
4. Heat from a loss: P = V x I as dissipation, and a thermal resistance as degrees per watt (Engineering science foundations if built;
   otherwise teach as a ratio in one picture). **UNCONFIRMED** that a thermal-resistance lesson exists in his courses: none of the listed
   built courses covers it.
5. "Harmonics as multiples of 50 Hz" in one picture; THD as a ratio of rms values. **The AC circuits brief defers harmonics
   ("Harmonics, filters and mixed frequencies") to Instrumentation and control** and its ten lessons stop at star and delta, so the
   5th and 7th harmonics of a six-pulse rectifier must be taught inline in lesson 8; flag this for the brief.

---

## 6. Misconceptions and learning science

Research on diode and rectifier misconceptions is thin and mostly about undergraduates. The best findings are below. **I found no
AQA or OCR examiner report and no Bitesize named-mistake entry for rectifiers, smoothing or the diode** that could be read in this run
(**UNCONFIRMED**: searches returned revision notes and a lecture demonstration, not examiner commentary), so the examiner-report layer of
sources is missing here. The list below mixes research (think-aloud study of third-year students, held in the TU Hamburg repository; the 2013 Educational Technology & Society
study of a predict-observe-explain simulation), a teaching guide, and trade safety sources.

By skill (my reading, each tied to the sources below):

1. **Diode and rectifier.** *Misconception:* the diode is a switch that opens and closes by itself with a fixed resistance; the current
   "stops" at the diode. *What the research shows:* students struggle with both the macro behaviour and the micro phenomena of the
   P-N junction and often fail to use the I-V curve as a reality check. *What to do:* predict first, then the I-V curve, then explain
   (POE). *Check:* ask for the diode voltage on a reverse-biased diode in a bridge (it is the full peak, not zero).
2. **Bridge rectifier.** *Misconception:* in the negative half-cycle the current "runs backwards" through the load; or the second pair
   of diodes does nothing. The AAC sentence is the correction: the current flows the same way through the load for either polarity.
3. **Smoothing.** *Misconception:* the capacitor "adds" voltage, or ripple depends only on capacitance. It depends on load current and
   ripple frequency as well (ET). *Check:* double the load; what happens to the ripple?
4. **Switch and heat.** *Misconception:* a switch that is half on is a safe middle state. It is the worst case for heat (Infineon).
5. **Freewheeling diode.** *Misconception:* extra diodes are needed everywhere. The body-diode article shows engineers still draw
   anti-parallel diodes where the device already has a path. For Dan: a freewheeling diode is needed for an inductive load, and a
   device may already include one.
6. **Phase control.** *Misconception:* a thyristor can be turned off by its gate. It turns off when the current falls below holding
   (AAC); a GTO is the exception.
7. **Stored charge.** *Misconception:* a circuit that is switched off is dead. The capacitors on the DC link stay charged.
8. **Learning science:** practice testing and spaced practice (high utility, Dunlosky), self-explanation and interleaving (moderate),
   worked examples for novices at the start of learning. These are the same tools the app already uses (predict, play, explain, say it
   back, spaced review); this research layer adds nothing new for the build but supports using prediction before every simulation.

- **Students struggle with both macro behaviour and micro phenomena of a P-N diode**
  - Source: Conceptual understanding of the P-N diode among undergraduate electrical engineering students. https://tore.tuhh.de/entities/publication/7bae64c4-5bd4-4d58-8a55-47de2b07612d
  - Quote: "The students struggled with both the macro-level behavior of a P-N junction diode and the underlying micro-level phenomena."

- **Half the students did not use I-V curves to reality-check**
  - Source: Conceptual understanding of the P-N diode among undergraduate electrical engineering students. https://tore.tuhh.de/entities/publication/7bae64c4-5bd4-4d58-8a55-47de2b07612d
  - Quote: "Half of the students in this study did not use their previous knowledge including current-voltage (I-V) curves to perform reality"

- **Predict-observe-explain with simulation corrected diode misconceptions**
  - Source: ERIC - EJ1016569 - Correcting Misconceptions on Electronics: Effects of a Simulation-Based Learning Environment Backed by a Conceptual Change Model, Educational Technology & Society, 2013. https://eric.ed.gov/?id=EJ1016569
  - Quote: "This study elucidates misconceptions in learning on diodes and constructs a conceptual-change learning system that incorporates prediction-observation-explanation (POE) and simulation-based learning"

- **Diode model misconceptions corrected in more than 80 percent of cases**
  - Source: ERIC - EJ1016569 - Correcting Misconceptions on Electronics: Effects of a Simulation-Based Learning Environment Backed by a Conceptual Change Model, Educational Technology & Society, 2013. https://eric.ed.gov/?id=EJ1016569
  - Quote: "The results also show that misconceptions on diode models and semiconductor characteristics could be corrected in more than 80% of cases."

- **Conceptual change works by building scenarios that conflict with existing knowledge**
  - Source: ERIC - EJ1016569 - Correcting Misconceptions on Electronics: Effects of a Simulation-Based Learning Environment Backed by a Conceptual Change Model, Educational Technology & Society, 2013. https://eric.ed.gov/?id=EJ1016569
  - Quote: "This study shows that conceptual change instructions could correct misconceptions effectively by constructing scenarios that conflict with existing knowledge structures."

- **Common circuit misconception: current gets used up**
  - Source: Teacher’s Guide to Common Physics Misconceptions. https://physics.help/teachers-guide-to-common-physics-misconceptions-by-topic **SECONDARY** (not the original publisher of the claim).
  - Quote: "Current gets used up as it passes through components."

- **Predict and justify brightness changes as a check**
  - Source: Teacher’s Guide to Common Physics Misconceptions. https://physics.help/teachers-guide-to-common-physics-misconceptions-by-topic **SECONDARY** (not the original publisher of the claim).
  - Quote: "Useful checks: have students predict and justify brightness changes in simple circuit variations."

- **Body diode misconception: engineers draw added anti-parallel freewheeling diodes on parts that already have a path**
  - Source: Common misconceptions about the MOSFET body diode - Electrical Engineering News and Products. https://www.eeworldonline.com/common-misconceptions-about-the-mosfet-body-diode
  - Quote: "To this day, GaN Systems’ field application engineers see customer design schematics that show our devices with added anti-parallel diodes to provide a freewheeling current path."

- **Misconception: once switched off a circuit poses no risk, not true of capacitors**
  - Source: Capacitor Stored Energy Hazards - Why "dead" circuits can still kill electricians. https://safelyio.com/wp-content/uploads/2025/12/Capacitor-Stored-Energy-Hazards-Why-_dead_-circuits-can-still-kill-electricians.pdf **SECONDARY** (not the original publisher of the claim).
  - Quote: "A common misconception is that once a circuit is switched off, it poses no risk. This isn’t the case with capacitors."

- **Practice testing and distributed practice: high utility (Dunlosky)**
  - Source: Improving Students' Learning With Effective Learning Techniques: Promising Directions From Cognitive and Educational Psychology - PubMed. https://pubmed.ncbi.nlm.nih.gov/26173288
  - Quote: "Practice testing and distributed practice received high utility assessments because they benefit learners of different ages and abilities and have been shown to boost students' performance across many criterion tasks and even in educational contexts."

- **Self-explanation and interleaving: moderate utility (Dunlosky)**
  - Source: Improving Students' Learning With Effective Learning Techniques: Promising Directions From Cognitive and Educational Psychology - PubMed. https://pubmed.ncbi.nlm.nih.gov/26173288
  - Quote: "Elaborative interrogation, self-explanation, and interleaved practice received moderate utility assessments."

- **Worked examples effective for novices at the initial stages**
  - Source: Full article: The effect of worked examples on learning solution steps and knowledge transfer. https://www.tandfonline.com/doi/full/10.1080/01443410.2023.2273762
  - Quote: "The results consistently demonstrated the effectiveness of using worked examples with novices at the initial learning stages."

- **Hydraulic analogy: voltage like pressure, current like flow, resistance like narrowing**
  - Source: The Hydraulic Analogy for Electric Current. https://www.researchgate.net/publication/252746019_The_Hydraulic_Analogy_for_Electric_Current **SECONDARY** (not the original publisher of the claim).
  - Quote: "For students of physics, electricity and electronics are often motivated by hydraulics"

- **AAC check-valve analogy: diodes are voltage-operated like pressure-operated check valves**
  - Source: Introduction to Diodes And Rectifiers | Diodes and Rectifiers | Electronics Textbook. https://www.allaboutcircuits.com/textbook/semiconductors/chpt-3/introduction-to-diodes-and-rectifiers/
  - Quote: "Like check valves, diodes are essentially “pressure” operated (voltage-operated) devices."

---

## 7. Where it is used for an electrician going into marine engineering

Public sources only; nothing about any naval vessel. The uses, with a quote each from a reachable page:
- **UPS and battery charger on a ship**: class rules require a UPS battery to carry its loads for the stated time and describe
  converters that charge a battery from the AC system.
- **DC distribution and shore supply**: class rules describe DC power distribution fed from AC/DC rectifiers and DC/DC converters;
  shore power uses static frequency converters (100 kVA to 27 MVA).
- **Drives and harmonics**: ship power quality (VSDs and harmonic filters, the 8 per cent THD limit, regular measurement) is a
  maintenance task for the electro-technical officer.
- **The job**: ETO recruitment tests name "Power Electronics and Drives" as an area; the public apprenticeship standards list AC/DC
  and power electronics (degree level) and "maritime electrical, electronic ... equipment on board vessels" (engineering technician).

- **Trade recruitment test for ETO sponsorship lists Power Electronics and Drives as a testing area**
  - Source: SYNERGY RECRUITMENT EXAMINATION. https://www.synergymarinegroup.com/wp-content/uploads/2024/11/ETO-and-Trainee-ETO-General-Instructions.pdf
  - Quote: "Testing Areas for knowledge: (100 MCQ) - ( Electrical/Electronic Engineering subjects) o Power Electronics and Drives o Electrical Machines o Electronics and Control Systems"

- **Class rules: DC power distribution fed through AC/DC rectifiers and DC/DC converters**
  - Source: Requirements for Direct Current (DC) Power Distribution Systems for Marine and Offshore Applications. https://ww2.eagle.org/content/dam/eagle/rules-and-guides/current/other/293-requirements-for-direct-current-(dc)-power-distribution-systems-for-marine-and-offshore-applications/293-dc-power-reqts-july22.pdf
  - Quote: "The electric power sources are to be connected to the DC bus directly or through power electronic converters (such as AC/DC rectifiers, DC/DC converters)."

- **Shore supply: static conversion of port grid frequency to the vessel's**
  - Source: ACS6080 SFC - Shore-to-ship converters (Converters for grid interconnections) | Shore-to-ship converters | ABB. https://new.abb.com/power-converters-inverters/grid-interconnections/shore-to-ship-converters/acs6080sfc
  - Quote: "Static conversion of the 50/60 Hz three-phase port grid power to match the 60/50 Hz vessel network."

- **Shore power converters rated 100 kVA up to 27 MVA**
  - Source: Shore-to-ship converters - Converters for grid interconnections | Converters for grid interconnections | ABB. https://new.abb.com/power-converters-inverters/grid-interconnections/shore-to-ship-converters
  - Quote: "frequency converter solutions ranging from 100 kVA up to 27 MVA"

- **Ship battery system: converters charge the battery from the AC system and supply AC loads from the battery**
  - Source: 2022. https://decarbonization.krs.co.kr/download/eng/d206/Guidance%20for%20Battery%20Ststems%20on%20Board%20of%20Ships.pdf
  - Quote: "function to charge the battery by converting AC power from the power system to DC."

- **Ship UPS battery must carry its loads for the required time**
  - Source: Rules for the Classification of Steel Ships Part 6 Electrical Equipment and Control Systems 2020. 9.. http://homedev.krs.co.kr/download/TechnicalRules/%EC%84%A0%EA%B8%89%20%EB%B0%8F%20%EA%B0%95%EC%84%A0%20%EA%B7%9C%EC%B9%99%20%EC%A0%81%EC%9A%A9%EC%A7%80%EC%B9%A8/6%ED%8E%B8/Pt%206%20Electrical%20Equipment%20and%20Control%20Systems.pdf
  - Quote: "The UPS battery capacity is, at all times, to be capable of supplying the designated loads for the time specified in the regulations."

- **Lloyd's Register: regular harmonic measurements to detect incipient failure of filters**
  - Source: 34/2017 - Classification alert: Harmonic distortion for ship electrical distribution systems, including harmonic filters | LR. https://www.lr.org/en/knowledge/class-news/34-17
  - Quote: "it is essential to carry out regular harmonic distortion measurements, to detect an incipient failure"

- **All-electric ships demand power quality knowledge, VSDs and harmonic filters, staff competency**
  - Source: Review of Legal Aspects of Electrical Power Quality in Ship Systems in the Wake of the Novelisation and Implementation of IACS Rules and Requirement. https://www.mdpi.com/1996-1073/14/11/3151
  - Quote: "All-electric ships are demanding in terms of power quality, technological solutions (e.g., electrical variable speed drives and harmonic filters), and staff competency"

- **Skills England Engineering technician: understand maritime electrical and electronic equipment on board vessels**
  - Source: Engineering technician / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0457-v1-1
  - Quote: "understand the practical and theoretical requirements of maritime electrical, electronic, mechanical, electromechanical and fluid power equipment and systems used on board vessels."

- **Public apprenticeship standard (Electrical and electronic engineer, degree) lists AC/DC and power electronics**
  - Source: Electrical and electronic engineer (degree) (level 6) - apprenticeship training course. https://findapprenticeshiptraining.apprenticeships.education.gov.uk/courses/10
  - Quote: "transformers, AC/DC, power electronics, motors"

---

## 8. Size: how many lessons the benchmarks spend, and which core supports 8 lessons

**What the benchmarks spend on this ground** (counts from the pages quoted above; my arithmetic where marked):
- All About Circuits Volume III: Diodes and Rectifiers 14 pages (counting the list), Thyristors 10 pages, IGBT 1 page, PWM/DC
  motor drives 1 page (about 26 pages for the relevant ground, my count from the lists).
- Brilliant: 0 lessons (Circuits is 31 lessons of DC; Digital Circuits 32 lessons of logic).
- Khan Academy: 1 lesson of 3 items (the diode).
- OpenLearn: 0 (introductory electronics, 10 hours, no devices).
- Hughes: 2 chapters (19 and 20) plus chapter 40; Bird: 2 chapters (13 and 14), no converter chapter.
- MCA syllabus: 3 outcomes with 8, up to 5 (2.5 was the last seen) and 7 lines (Principles of Power Electronics) and 3 outcomes with 4, 4 and 6 lines (Applications), my count.

**My reading: eight lessons fit.** Each one is the scope's eight parts, which also match the MCA outcomes:
1. The diode as a one-way valve (devices 1.1; AAC chapter 3 first four pages).
2. Rectifiers: half-wave, bridge, three-phase six-pulse; average and PIV from the waveform (MCA 3.1, 3.2).
3. Smoothing, the DC link and precharge (MCA 2.x protection; drive manuals).
4. The transistor as a switch; losses and heat; the freewheeling diode (MCA 1.6 to 1.7, 2.5).
5. The thyristor and phase control; the triac; soft starters and battery chargers (MCA 3.2 to 3.7; 08b 1.1).
6. Chopping DC: buck and boost; duty cycle (08b 1.3, 1.4).
7. Inverting: H-bridge, three-phase bridge, PWM, dead time; the UPS (08b 2.4, 3.1).
8. Living with power electronics: harmonics, stored charge, earth leakage, insulation monitoring, EMC (08b 3.6 protection; STCW
   hazards).
If one lesson has to give, lesson 5 is the one to trim (the triac and the three-phase thyristor bridge are named in the MCA list but are
the least used afloat in the sources found; my reading, a guess). The ground that does not fit eight lessons and is deferred: op-amps,
small-signal amplifiers, JFET and BJT amplifier biasing (Instrumentation and control), logic gates (Digital circuits), transformers
(Transformers), cycloconverters, GTO, current-source inverters and four-quadrant operation (named in the syllabus, not taught).

- **Brilliant Circuits is 31 lessons with 334 exercises**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits/
  - Quote: "31 Lessons 334 Exercises"

- **Brilliant Digital Circuits is 32 lessons**
  - Source: Practice Digital Circuits | Brilliant. https://brilliant.org/courses/digital-circuits/
  - Quote: "32 Lessons 375 Exercises"

---

## 9. Gaps and what is unconfirmed

- **UNCONFIRMED:** the exact Pearson HN unit lines on semiconductors and power electronics (only provider pages seen).
- **UNCONFIRMED:** SQA's Power Electronics unit specification text (named in an update list only).
- **UNCONFIRMED:** an examiner report or Bitesize "named mistake" on rectifiers, smoothing or diodes.
- **UNCONFIRMED:** a clean quote for the boost converter result Vout = Vin / (1 - D), for the ripple formula Vripple = I / (f C), for
  the three-phase bridge PIV, and for the average of a firing-angle-controlled bridge (the pages print them as images). The build must
  compute these in the interactive and state the rule shown, per CLAUDE.md ("numbers are computed from a shown rule").
- **UNCONFIRMED:** that BS 7671 itself names variable speed drives for Type B RCDs (manufacturers say it; the book was not read).
- **UNCONFIRMED:** the section headings inside Hughes chapter 40 and Bird chapters 13 and 14 (contents pages only).
- **SECONDARY:** the 1.35 and 1.414 DC-bus figures (industrial knowledge-base pages), the STCW table (US Coast Guard copy), the 1/h
  harmonic rule of thumb, and the bridge PIV (a tutorial site).
- Brilliant: no electronics or semiconductor course is reachable; only Circuits and Digital Circuits. Lesson-level content was not
  seen (titles only).
- Not used: any naval or submarine-specific source (the SMQ books on Dan's Drive were not read, per CLAUDE.md).
- The first All About Circuits contents fetch was too large to save; the chapter lists were taken from chapter pages instead.
