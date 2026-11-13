# Reading drawings and schematics: research notes

Researched 13 Nov 2026 for the Reading drawings and schematics course brief (the third course in the Engineering science
shelf's Engineering science folder, after Mechanics and materials and Heat and fluids; blurb "How to read any system
diagram: electrical schematics, hydraulic and pneumatic circuits, piping diagrams and engineering drawings."). The brief
itself is not written here; these notes are its evidence. Dan is an electrician and a Royal Navy submariner on the
electrical engineering path. Next year he does a Level 3 marine engineering course (general engineering first, then submarine
and nuclear propulsion). He asked for foundations, not a remake of that course. He asked on 13 Nov: "A schematics and drawings
interpretation course would actually be really useful", and of the four kinds of diagram, "they all matter and not in any order".

Every finding has its source title, URL and the exact words, copied from a saved tool result by script (the quotes were not
retyped into this file). All of them are listed in `quotes.json` beside this file and were checked with
`node tools/eval/sources.mjs --quotes ... --tools ...` (`failed: 0`). The tool files are in `tools/`. Findings I could not
confirm are marked **UNCONFIRMED**; where only a copy of an original, or a vendor or blog page, said it, **SECONDARY**.
My own readings are marked "My reading" and are not quotes. Where the source's text carries a hyphen or a typo from the PDF
(for example "diffi- culty", "shoud"), the quote keeps it, because it is copied word for word.

Two limits of how the pages were read. The app's checker holds only the first 12 KB of a search result and 20 KB of a fetch,
cut from the lowest-ranked result first, so a long PDF held whole could not be quoted from its far pages; what I saw but could
not make the checker hold is marked UNCONFIRMED below and is not in `quotes.json`. And nothing here comes from any Navy
drawing, qualification book or syllabus of Dan's: every source is public, and the US Navy and US Department of Energy
training texts are used only as general training text, never as how any navy does things.

---

## 1. Benchmark

### 1.1 Brilliant: no course teaches reading diagrams
Brilliant's course list (`brilliant.org/courses/`) has Science courses named Scientific Thinking, Circuits, Digital Circuits,
Kurzgesagt, Science Puzzles and Quantum Computing, plus Technology and Math groups. None of them is about reading diagrams or
drawings as a skill (My reading, from the listings; no course on engineering drawing, fluid power or schematics is listed).
The nearest are the three below, so the benchmark falls back to the Level 3 engineering units in 1.2.

- **Brilliant has no course on reading diagrams; the nearest is Circuits, 31 lessons on current, voltage, resistance and power**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits/
  - Quote: "Explore the physics behind electricity. 31 Lessons 394 Exercises"
- **Circuits, the lesson list by level (seven levels, 31 lessons)**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits/
  - Quote: "Level 1 Circuits Current Loops Short Circuits Choosing Bulbs Splitting Current Level Review Level 2 Current The Path of Least Resistance Bulb Brightness Changing Current Different Bulbs Conserving Current Level Review Level 3 Voltage Voltage Measuring Voltage Voltage Around Paths Branched Voltage Level Review Level 4 Power and Resistance Power and Brightness Deducing Power Resistance Solving for Resistance Level Review Level 5 Circuit Analysis Predicting Current Controlling Current Combining Resistance Dividing Resistance Total Resistance Voltage and Resistance Level 6 Comparing Power Resistance and Brightness Relative Resistance Sharing Amps and Volts Parallel Volt Shares Power and Bulb Pairs Level 7 Analyzing Voltage Subtracting Volts Comparing Points Bulbs with Voltage"
My reading of the order: loops and short circuits first, then current, voltage, power and resistance, then circuit analysis,
power, and voltage again. It teaches what a circuit does, drawn with bulbs. It never teaches the standard symbols or the
conventions of a drawing.

- **Circuits course description: the ideas, not the drawing conventions**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits/
  - Quote: "Build an intuitive understanding of how electric circuits work, and the underlying concepts of current, voltage, resistance and power."
- **Digital Circuits level 2 touches symbols and drawing (crossing and connecting) inside a logic course**
  - Source: Practice Digital Circuits | Brilliant. https://brilliant.org/courses/digital-circuits/
  - Quote: "Level 2 Circuit Design Choosing Components Reversing Outputs Building Circuits Crossing and Connecting"
- **Scientific Thinking: 40 lessons, with electric circuits as one topic among many**
  - Source: Practice Scientific Thinking | Brilliant. https://brilliant.org/courses/puzzle-science/gears
  - Quote: "Open your eyes to the world around you by solving puzzles with science. 40 Lessons 557 Exercises"
- **How Brilliant teaches: concrete diagrams first, then the formal notation**
  - Source: How Brilliant teaches math and helps understanding stick | Brilliant. https://brilliant.org/resources/choosing-brilliant/how-brilliant-teaches-math
  - Quote: "Brilliant starts with concrete diagrams, animations, computation, and objects learners can manipulate, then connects those experiences to formal notation."
My reading: that last line is the one worth keeping. Brilliant starts with something concrete the learner can manipulate and
only then puts the formal notation on it. That is the opposite of a symbol chart first.

### 1.2 The public benchmark: Pearson BTEC Level 3 National Engineering
Pages move, and the BTEC National in Engineering (2016) specification is on its tenth issue (June 2026); a newer BTEC National
(AAQ) in Engineering has four units and its Unit 3, Engineering Design, is the CAD unit. The 2016 specification is the one with
units on drawing and on fluid power circuits, so it is the benchmark.

**Engineering drawing: Unit 2 (Delivery of Engineering Processes Safely as a Team), learning aim B.**
- **BTEC Unit 2 pairs engineering drawing principles with circuit diagrams**
  - Source: Specification - Pearson BTEC Level 3 National Extended Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/spec-btec-nat-eng-extcert.pdf
  - Quote: "You will learn the principles of another important process, engineering drawing, and develop two-dimensional (2D) computer-aided drawing skills while producing orthographic projections and circuit diagrams."
- **BTEC Unit 2 B1: what an orthographic projection must carry**
  - Source: Specification - Pearson BTEC Level 3 National Extended Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/spec-btec-nat-eng-extcert.pdf
  - Quote: "Attributes of orthographic projections, including: o geometry – shape of the component represented as different views, how the component is viewed from various angles, visibility of component features o dimensions – size of the component in defined units o tolerances – allowable variations for defined dimensions o material – what the component is to be made from o surface texture – surface quality required, e.g. roughness, flatness o scale – relative to actual dimensions."
- **BTEC Unit 2 B1: standards, title block, views, line types, circuit symbols**
  - Source: Specification - Pearson BTEC Level 3 National Extended Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/spec-btec-nat-eng-extcert.pdf
  - Quote: "standards including BS 8888 and BS 60617 or other relevant international equivalents o title block/layout – drawing number(s), projection symbols, scale, units, general tolerances, name of author, date, border, parts referencing o views – elevation, plan, end, section, hatching style, auxiliary o line types – centre, construction, outline, hidden, leader, dimension o common features, e.g. screw threads, springs, splines, repeated items, holes, chamfers, radii o circuit diagram symbols and components, e.g. cell/battery, switch, resistor, diode, capacitor, transistor, integrated circuit, light-emitting diode (LED), motor, buzzer"
- **BTEC Unit 19: gate symbols in BS, IEC and ANSI forms**
  - Source: Specification - Pearson BTEC Level 3 National Extended Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/spec-btec-nat-eng-extcert.pdf
  - Quote: "Gate symbols, British Standard (BS), International Electrotechnical Commission (IEC), American National Standards Institute (ANSI) or other relevant international equivalents."
My reading: the unit teaches drawing as a language with a standard (BS 8888 for the drawing, BS 60617 for the symbols), a title
block, views, line types and a short list of circuit symbols. In the order of the content: attributes of an orthographic
projection, then standards and title block, views and line types, common features, circuit symbols, then lettering and
abbreviations. The unit sits inside the mandatory core of the qualification (the qualification purpose lists interpreting and creating computer-aided engineering drawings under mandatory content; UNCONFIRMED here, seen in a search result the checker did
not hold).

**Reading, not only making: the other units that mention it.**
- **BTEC Unit 1 grade descriptor: interpret diagrams and systems**
  - Source: Specification - Pearson BTEC Level 3 National Extended Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/spec-btec-nat-eng-extcert.pdf
  - Quote: "They can interpret and analyse diagrams, graphical information and systems, using their knowledge and understanding to solve basic and familiar problems."
- **BTEC Unit 1 distinction descriptor: interpret and evaluate diagrams, graphical information and systems**
  - Source: Specification - Pearson BTEC Level 3 National Extended Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/spec-btec-nat-eng-extcert.pdf
  - Quote: "They can interpret and evaluate diagrams, graphical information and systems, using their knowledge and understanding to solve complex familiar and unfamiliar problems."
- **BTEC Unit 3 lists circuit and block diagrams among design documentation**
  - Source: Specification - Pearson BTEC Level 3 National Extended Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/spec-btec-nat-eng-extcert.pdf
  - Quote: "documentation (detail and assembly orthographic projections, specifications, parts list, materials list, production plan, circuit/block diagrams, flowchart, design log)."
- **BTEC Unit 19 schematic capture to BS 8888 and BS 3939**
  - Source: Specification - Pearson BTEC Level 3 National Extended Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/spec-btec-nat-eng-extcert.pdf
  - Quote: "Schematic capture of analogue circuits to include electrical circuit drawing standards BS 8888, BS 3939 or other relevant international equivalents."
- **BTEC Unit 19: schematics laid out clearly with standard conventions**
  - Source: Specification - Pearson BTEC Level 3 National Extended Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/spec-btec-nat-eng-extcert.pdf
  - Quote: "the schematics will be laid out clearly and logically using standard conventions, with all components appropriately labelled and virtual instruments connected correctly."
- **BTEC Unit 44: interpreting component, sub-assembly and general assembly drawings to BS 8888**
  - Source: Specification - Pearson BTEC Level 3 National Extended Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/spec-btec-nat-eng-extcert.pdf
  - Quote: "Interpreting engineering drawings, including reading and understanding individual component, sub-assembly and general assembly drawings to BS8888 or other international equivalents."

**Fluid power circuit diagrams: Unit 12 (Pneumatic and Hydraulic Systems).**
- **BTEC Unit 12 in brief**
  - Source: Specification - Pearson BTEC Level 3 National Extended Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/spec-btec-nat-eng-extcert.pdf
  - Quote: "Learners explore the safe operation of pneumatic and hydraulic systems, including simulation of circuits using software and practical system assembly and testing."
- **BTEC Unit 12 B1: circuit diagrams to BS ISO 1219-1:2012**
  - Source: Specification - Pearson BTEC Level 3 National Extended Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/spec-btec-nat-eng-extcert.pdf
  - Quote: "Symbols and circuit diagrams for hydraulic and pneumatic power systems and components to BS ISO 1219-1:2012 or other relevant international equivalents."
- **BTEC Unit 12 is a 60 GLH unit**
  - Source: Specification - Pearson BTEC Level 3 National Extended Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/spec-btec-nat-eng-extcert.pdf
  - Quote: "12 Pneumatic and Hydraulic Systems 60 Optional Internal"
Unit 12's content areas in order, as seen on the page (UNCONFIRMED: the checker holds only part of this page): A1 power supply
components, A2 actuator components, A3 system control components (directional control valves including 4- or 3-way valve and
closed or neutral position, flow control, pressure control and relief, non-return valves, actuation by pressure, manual,
mechanical, solenoid and pilot), A4 general system safety and maintenance, A5 common applications; B1 creating circuit diagrams
to BS ISO 1219-1:2012, B2 simulating the circuits; C1 health and safety, C2 system assembly, C3 testing and fault finding. The
pass criterion asks for a hydraulic and a pneumatic circuit that each contain at least eight components; the C3 content names
circuit diagrams, flow charts and isolation methods as fault finding aids; and the Unit 12 introduction says the unit helps to
prepare learners for an engineering apprenticeship, for higher education and for technician-level roles, such as plant maintenance
or hydraulic and pneumatic technician. My reading: the unit is about making and simulating diagrams on a computer, and its
own list starts with the parts, not the drawing. Dan's course reads diagrams, so it takes the standard (ISO 1219-1), the valve
and actuator vocabulary of A2 and A3, and the eight-component size of circuit as a sensible size for a tracing puzzle, and it
leaves A1, A4, A5 and all of C to the Hydraulics and pneumatics course.

**The older unit, still online: Unit 16, Engineering Drawing for Technicians (Level 3 National, 2010).** It is the clearest
statement of what interpreting a drawing covers.
- **Older BTEC Unit 16 Engineering Drawing for Technicians: aim and purpose**
  - Source: Unit 16: Engineering Drawing for Technicians. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Electrical/Electronic-Engineering/2010/Specification/Unit_16_Engineering_Drawing_for_Technicians.pdf
  - Quote: "This unit will enable learners to produce engineering drawings of different components, assemblies and circuits using a variety of sketching, drawing and computer-aided drafting techniques."
- **Unit 16: why drawing standards matter**
  - Source: Unit 16: Engineering Drawing for Technicians. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Electrical/Electronic-Engineering/2010/Specification/Unit_16_Engineering_Drawing_for_Technicians.pdf
  - Quote: "This avoids errors of interpretation which can lead to the scrapping of expensive parts."
- **Unit 16 learning outcomes**
  - Source: Unit 16: Engineering Drawing for Technicians. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Electrical/Electronic-Engineering/2010/Specification/Unit_16_Engineering_Drawing_for_Technicians.pdf
  - Quote: "1 Be able to sketch engineering components 2 Be able to interpret engineering drawings that comply with drawing standards 3 Be able to produce engineering drawings 4 Be able to produce engineering drawings using a computer aided drafting (CAD) system."
- **Unit 16 outcome 2: British Standards, line types, first and third angle, symbols**
  - Source: Unit 16: Engineering Drawing for Technicians. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Electrical/Electronic-Engineering/2010/Specification/Unit_16_Engineering_Drawing_for_Technicians.pdf
  - Quote: "British Standards eg BS8888, BS3939, BS2917, PP7307; company-standardised layouts eg drawing number, title and issue number, projection symbols (first angle, third angle), scale, units, general tolerances, name of person responsible for producing drawing; line types eg centre, construction, outline, hidden, leader, dimension; lettering eg titles, notes; orthographic projection eg first angle, third angle; views eg elevation, plan, end, section, auxiliary; representation of common features eg screw threads, springs, splines, repeated items; section views eg hatching style, webs, nuts, bolts and pins, solid shafts; symbols and abbreviations eg A/F, CHAM, Ф, R, PCD, M; circuit symbols eg electrical, electronic, hydraulic, pneumatic"
- **Unit 16 guidance: a structure to work to when interpreting drawings**
  - Source: Unit 16: Engineering Drawing for Technicians. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Electrical/Electronic-Engineering/2010/Specification/Unit_16_Engineering_Drawing_for_Technicians.pdf
  - Quote: "Care should be taken when delivering learning outcome 2 because there is a huge amount of information relating to drawing standards and learners will need to be given a structure to work to when being asked to interpret drawings."
- **Unit 16 guidance: first or third angle, understand both**
  - Source: Unit 16: Engineering Drawing for Technicians. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Electrical/Electronic-Engineering/2010/Specification/Unit_16_Engineering_Drawing_for_Technicians.pdf
  - Quote: "When deciding on a method of projection to use, either first or third angle can be chosen but there should be an understanding of the principles of both."
- **Unit 16 assignment: read a drawing and report its key features to a colleague**
  - Source: Unit 16: Engineering Drawing for Technicians. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Electrical/Electronic-Engineering/2010/Specification/Unit_16_Engineering_Drawing_for_Technicians.pdf
  - Quote: "Learners have to read and interpret an engineering drawing in order to report the key features of the component, circuit or assembly to a colleague."
- **Unit 16 is 60 guided learning hours**
  - Source: Unit 16: Engineering Drawing for Technicians. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Electrical/Electronic-Engineering/2010/Specification/Unit_16_Engineering_Drawing_for_Technicians.pdf
  - Quote: "Guided learning hours: 60"
My reading: its order is sketching, then interpreting a drawing to the standards, then producing drawings, then CAD. Its
delivery note admits there is a huge amount of information in the standards and that learners will need to be given a structure to work to. That
is the argument for lesson 9's method.

### 1.3 Where it sits in its path
The Brilliant courses sit in the Science group, and none leads to drawing. In the BTEC suite, Unit 12 is an optional internal
unit of 60 guided learning hours, in the electrical and mechanical pathways alike. My reading: reading drawings is a skill the
qualifications assume and assess inside other units, not a course by itself. The place for Dan's course is therefore between
the two units' halves: the symbols and conventions of Unit 2 and Unit 12 B1, taught for reading.

---

## 2. Other courses' order for the same ground

### 2.1 The standards, as titled descriptions only
These standards are paid for and copyrighted, so the brief teaches from the public pages that describe and reproduce them, never
from the standard text. What each one is, in the publishers' own words:

- **ISO 1219-1: fluid power symbols**
  - Source: ISO 1219-1:2012 Fluid power systems and components, Graphical symbols and circuit diagrams, Part 1. https://www.iso.org/standard/60184.html
  - Quote: "ISO 1219-1:2012 establishes basic elements for symbols. It specifies rules for devising fluid power symbols for use on components and in circuit diagrams."
- **ISO 1219-2: circuit diagram rules**
  - Source: ISO 1219-2:2012 Fluid power systems and components, Graphical symbols and circuit diagrams, Part 2: Circuit diagrams. https://www.iso.org/standard/51200.html
  - Quote: "ISO 1219-2:2011 establishes the main rules for drawing hydraulic and pneumatic circuit diagrams using graphical symbols drawn in accordance with ISO 1219-1. ISO 1219-2:2011 also applies to circuit diagrams relating to cooling systems, lubrication systems, cooling lubricant systems and systems of technical gases used in conjunction with fluid power applications."
- **SMC: more than one symbol system in use, ISO 1219-1 commonly**
  - Source: Pneumatics Symbols (SMC). https://www.smc.nu/drawings/2-D/pn_symbols_EU.pdf
  - Quote: "There are several symbol systems and conventions in use around the world, most officially recognised by standards bodies. Commonly used is ISO1219-1."
- **Festo: connections marked on the circuit diagram per ISO 1219-2**
  - Source: Fluid power Learning systems and services for basic and further training (Festo). https://www.festo.com/media/catalog/156205_documentation.pdf
  - Quote: "Connections must be marked on the circuit diagram using the identification marked on the component, sub-base or block (ISO 1219-2)."
- **IEC 60617: the electrotechnical symbol database**
  - Source: IEC 60617 - Graphical Symbols for Diagrams. https://library.iec.ch/iec60617
  - Quote: "IEC 60617 contains graphical symbols for use in electrotechnical diagrams. All the parts (Ed. 2 or 3) of the previously published IEC 60617 have been incorporated into this database that currently includes some 1900 symbols."
- **IEC 61082-1: preparing documents used in electrotechnology**
  - Source: IEC 61082-1:2014 | IEC. https://webstore.iec.ch/en/publication/4469
  - Quote: "IEC 61082-1:2014 establishes general rules and guidelines for the presentation of information in documents, and specific rules for diagrams, drawings and tables used in electrotechnology."
- **IEC 81346-1: reference designations**
  - Source: IEC 81346-1:2022 | IEC. https://webstore.iec.ch/en/publication/64021
  - Quote: "IEC 81346-1:2022 establishes general principles for the structuring of systems including structuring of information about systems. Based on these principles, rules and guidance are given for the formulation of unambiguous reference designations for objects in any system."
- **IEC 81346-1: what a reference designation is for**
  - Source: IEC 81346-1:2022 | IEC. https://webstore.iec.ch/en/publication/64021
  - Quote: "The reference designation identifies objects for the purpose of creation and retrieval of information about an object and, where realized, about its corresponding component."
- **ISO 14617-1: general rules for diagram symbols**
  - Source: ISO 14617-1:2025 Graphical symbols for diagrams, Part 1: General rules. https://www.iso.org/standard/85641.html
  - Quote: "This document specifies general rules for and gives guidance on the preparation and presentation of graphical symbols for diagrams, which are related to physical industrial components, products and processing."
- **ISO 14617-2: symbol library, with fluid power and electrotechnical symbols left to ISO 1219-1 and IEC 60617**
  - Source: ISO 14617-2:2025 Graphical symbols for diagrams, Part 2: Graphical symbols. https://www.iso.org/standard/83364.html
  - Quote: "This document does not apply to: — graphical symbols for fluid power objects, see ISO 1219 - 1 ( the collective application standard of the ISO 14617 series); — symbols of measurement and control functions such as mathematical functions and process functions; — graphical symbols for electrotechnical objects, see the IEC 60617 database."
- **ISO 10628-1: flow diagrams for process plants**
  - Source: ISO 10628-1:2014 Diagrams for the chemical and petrochemical industry, Part 1: Specification of diagrams. https://www.iso.org/standard/51840.html
  - Quote: "ISO 10628-1:2014 specifies the classification, content, and representation of flow diagrams. In addition, it lays down drafting rules for flow diagrams for chemical and petrochemical industry."
- **ISO 10628-2: process diagram symbols; electrical symbols are IEC 60617**
  - Source: ISO 10628-2:2012 Diagrams for the chemical and petrochemical industry, Part 2: Graphical symbols. https://www.iso.org/cms/live/live/en/sites/isoorg/contents/data/standard/05/18/51841.html
  - Quote: "ISO 10628-2:2012 defines graphical symbols for the preparation of diagrams for the chemical and petrochemical industry. It is a collective application standard of the ISO 14617 series. ISO 10628-2:2012 does not apply to graphical symbols for electrotechnical diagrams; for these, see IEC 60617."
- **ISA 5.1: instrument symbols and tags**
  - Source: ISA5.1, Instrumentation Symbols and Identification. https://www.isa.org/standards-and-publications/isa-standards/isa-standards-committees/isa5-1
  - Quote: "The standard is intended to provide sufficient information to enable anyone reading a flow diagram and having a reasonable amount of plant knowledge to understand the means of measurement and control of the process without having to go into the details of the instrumentation that require the knowledge of an instrument specialist."
- **ISO 128-1: technical drawings, general rules**
  - Source: ISO 128-1:2020 Technical product documentation (TPD), General principles of representation, Part 1. https://www.iso.org/standard/65296.html
  - Quote: "This document gives general rules for the execution of technical drawings (2D and 3D), as well as presenting the structure of the other parts of the ISO 128 series. This document is applicable to technical drawing in the fields of mechanical engineering, construction, architecture and shipbuilding."
- **ISO 128-3: views, sections and cuts follow ISO 5456-2 projection methods**
  - Source: ISO 128-3:2022 Technical product documentation (TPD), General principles of representation, Part 3: Views, sections and cuts. https://www.iso.org/cms/live/live/en/sites/isoorg/contents/data/standard/08/33/83356.html
  - Quote: "This document specifies the general principles for presenting views, sections and cuts applicable to various kinds of technical drawings (e.g. mechanical, electrical, architectural, civil engineering), following the orthographic projection methods specified in ISO 5456-2."
- **IEEE/ANSI 315 is an inactive-reserved standard**
  - Source: IEEE SA - IEEE/ANSI 315-1975. https://standards.ieee.org/ieee/315/515
  - Quote: "Inactive-Reserved Standard IEEE/ANSI 315-1975 IEEE Standard for Graphic Symbols for Electrical and Electronics Diagrams (Including Reference Designation Letters)"
- **Unit 16 outcome 2: British Standards, line types, first and third angle, symbols**
  - Source: Unit 16: Engineering Drawing for Technicians. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Electrical/Electronic-Engineering/2010/Specification/Unit_16_Engineering_Drawing_for_Technicians.pdf
  - Quote: "British Standards eg BS8888, BS3939, BS2917, PP7307; company-standardised layouts eg drawing number, title and issue number, projection symbols (first angle, third angle), scale, units, general tolerances, name of person responsible for producing drawing; line types eg centre, construction, outline, hidden, leader, dimension; lettering eg titles, notes; orthographic projection eg first angle, third angle; views eg elevation, plan, end, section, auxiliary; representation of common features eg screw threads, springs, splines, repeated items; section views eg hatching style, webs, nuts, bolts and pins, solid shafts; symbols and abbreviations eg A/F, CHAM, Ф, R, PCD, M; circuit symbols eg electrical, electronic, hydraulic, pneumatic"

My reading, as a map for lesson 1 and the later ones. Electrical symbols come from IEC 60617 (in the UK, the BS EN 60617
family, which Pearson still calls BS 60617); fluid power symbols and circuit rules from ISO 1219-1 and -2; process and piping
symbols from ISO 10628-2 (with ISO 14617 as the library behind them, and ISO 14617-2 expressly sending fluid power to ISO 1219
and electrotechnical objects to IEC 60617); instrument tags from ISA 5.1 (the standard's own scope is that anyone reading a
flow diagram can understand the measurement and control of the process); drawings from BS 8888 and ISO 128, with the projection
method from ISO 5456-2 (named in ISO 128-3); reference designations from IEC 81346. ISO 1219-3:2016 (symbol modules and
connected symbols in circuit diagrams) also exists; I saw its title but the checker did not hold it: UNCONFIRMED. The ISO page
for first-angle and third-angle projection symbols, ISO 5456-2, is not read here: UNCONFIRMED. BS 8888 itself is behind a paywall
and was read only through Pearson's and City & Guilds's lines about it: UNCONFIRMED as a text.

The other convention to recognise. IEEE/ANSI 315 is the US electrical set, now an inactive-reserved standard (quoted below); the US fluid power set is ANSI Y32.10 (a distributor's copy seen in a search result; UNCONFIRMED), and the older ISO 1219 editions differ from the 2012 one (ISO's ICS list shows ISO 1219-1:1991 and :2006 withdrawn; UNCONFIRMED, not held by the check). US industrial control drawings are in the NEMA/JIC style (Galco's chart; UNCONFIRMED beyond the line quoted below).

- **Galco: a normally open contact is drawn in its shelf state**
  - Source: Electrical & Control Symbols Chart – ANSI vs IEC 60617. https://www.galco.com/electrical-symbols-chart (SECONDARY)
  - Quote: "Shown in the shelf state: open when the relay coil is de-energized."
- **Which electrical symbols differ between US and IEC drawings**
  - Source: Electrical Symbols: US (ANSI/IEEE) vs IEC Chart. https://electrician.wiki/reference/electrical-symbols (SECONDARY)
  - Quote: "The ones that differ are the resistor (zigzag in US practice, rectangle in IEC), the lamp (a filament loop against a circle with a cross), the fuse, switch and relay contacts, coils, circuit breakers, logic gates and the op-amp."
- **US ladder rungs run horizontally; IEC current paths run vertically with 81346 codes**
  - Source: Electrical Symbols: US (ANSI/IEEE) vs IEC Chart. https://electrician.wiki/reference/electrical-symbols (SECONDARY)
  - Quote: "Layout differs too: US control drawings run ladder rungs horizontally and tag devices CR, M and OL, while IEC drawings run current paths vertically and use IEC 81346 codes such as -K1 and -Q1."

### 2.2 The symbols themselves: the public material that reproduces them
**Fluid power makers' guides.** What each says about reading a symbol.
- **Bosch: what graphical symbols are for**
  - Source: Hydraulics Basic Principles - Bosch. https://dc-mkt-prod.cloud.bosch.tech/xrm/media/global/training_1/digital_media/reference_books/knowledge-in-detail-hydraulics-basic-principles.pdf
  - Quote: "In hydraulics, graphical symbols (also referred to as switching symbols) are used for the abstract illustration of fluid power components and their functions, as well as to explain hydraulic circuit systems."
- **Bosch: symbols give no information about construction**
  - Source: Hydraulics Basic Principles - Bosch. https://dc-mkt-prod.cloud.bosch.tech/xrm/media/global/training_1/digital_media/reference_books/knowledge-in-detail-hydraulics-basic-principles.pdf
  - Quote: "Graphic symbols of hydraulics do not provide information about the design structure of the components."
- **Bosch: centre position with P and T joined**
  - Source: Hydraulics Basic Principles - Bosch. https://dc-mkt-prod.cloud.bosch.tech/xrm/media/global/training_1/digital_media/reference_books/knowledge-in-detail-hydraulics-basic-principles.pdf
  - Quote: "In the symbol of a directional control valve shown in the circuit diagram, ports P and T are connected to each other in center position (zero position). This is also called neutral circulation, and such a directional control valve is called an unloading valve."
- **Festo: symbols indicate the function of the element**
  - Source: Pneumatics, Basic Level (Textbook), Festo Didactic TP101. https://repositori.mypolycc.edu.my/bitstream/123456789/5320/1/Pneumatics%20basic%20level%20by%20Festo%20Didactic%20%28z-lib.org%29.pdf (SECONDARY)
  - Quote: "The elements in the system are represented by symbols which indicate the function of the element."
- **Festo: construction is not in the symbol**
  - Source: Pneumatics, Basic Level (Textbook), Festo Didactic TP101. https://repositori.mypolycc.edu.my/bitstream/123456789/5320/1/Pneumatics%20basic%20level%20by%20Festo%20Didactic%20%28z-lib.org%29.pdf (SECONDARY)
  - Quote: "The technical construction of the component is not taken into account in the abstract symbol form."
- **Festo: initial and return actuation are two methods, shown either side of the position boxes**
  - Source: Pneumatics, Basic Level (Textbook), Festo Didactic TP101. https://repositori.mypolycc.edu.my/bitstream/123456789/5320/1/Pneumatics%20basic%20level%20by%20Festo%20Didactic%20%28z-lib.org%29.pdf (SECONDARY)
  - Quote: "Normally these are two separate methods. They are both shown on the symbol either side of the position boxes."
- **Festo: port letters and numbers**
  - Source: Pneumatics, Basic Level (Textbook), Festo Didactic TP101. https://repositori.mypolycc.edu.my/bitstream/123456789/5320/1/Pneumatics%20basic%20level%20by%20Festo%20Didactic%20%28z-lib.org%29.pdf (SECONDARY)
  - Quote: "2, 4 A, B Working lines 3, 5 R, S Exhaust ports"
- **Festo: signal flow bottom to top**
  - Source: Pneumatics, Basic Level (Textbook), Festo Didactic TP101. https://repositori.mypolycc.edu.my/bitstream/123456789/5320/1/Pneumatics%20basic%20level%20by%20Festo%20Didactic%20%28z-lib.org%29.pdf (SECONDARY)
  - Quote: "The structure of the circuit diagram should correspond to the control chain, whereby the signal flow is represented from the bottom to the top."
- **Festo: the initial position is the rest position of the system**
  - Source: Pneumatics, Basic Level (Textbook), Festo Didactic TP101. https://repositori.mypolycc.edu.my/bitstream/123456789/5320/1/Pneumatics%20basic%20level%20by%20Festo%20Didactic%20%28z-lib.org%29.pdf (SECONDARY)
  - Quote: "The initial position (left-hand circuit) is defined as the 'rest' position of the system."
- **Festo: before the push button, the cylinder is exhausted through the valve**
  - Source: Pneumatics, Basic Level (Textbook), Festo Didactic TP101. https://repositori.mypolycc.edu.my/bitstream/123456789/5320/1/Pneumatics%20basic%20level%20by%20Festo%20Didactic%20%28z-lib.org%29.pdf (SECONDARY)
  - Quote: "In this unactuated posi- tion, air is applied at the cylinder piston rod side, while the pressure on the piston side of the cylinder is exhausted."
- **Festo: tracing a 5/2 valve operated**
  - Source: Pneumatics, Basic Level (Textbook), Festo Didactic TP101. https://repositori.mypolycc.edu.my/bitstream/123456789/5320/1/Pneumatics%20basic%20level%20by%20Festo%20Didactic%20%28z-lib.org%29.pdf (SECONDARY)
  - Quote: "Pressing the push button operates the 5/2-way valve against the valve return spring. The diagram (right-hand circuit) shows the valve in the operated or actuated position. In this position, the supply pressure is connected to the piston side of the cylinder, while the piston rod side is exhausted. The pressure on the piston side advances the piston rod."
- **Festo: tracing a 5/2 valve released**
  - Source: Pneumatics, Basic Level (Textbook), Festo Didactic TP101. https://repositori.mypolycc.edu.my/bitstream/123456789/5320/1/Pneumatics%20basic%20level%20by%20Festo%20Didactic%20%28z-lib.org%29.pdf (SECONDARY)
  - Quote: "Once the push button is released, the valve return spring pushes the valve into the initial position. The supply pressure is now connected to the piston rod side, while the piston side is exhausted via the exhaust port of the valve. The piston rod retracts."
- **SMC: the valve types by ways and neutral position**
  - Source: Pneumatics Symbols (SMC). https://www.smc.nu/drawings/2-D/pn_symbols_EU.pdf
  - Quote: "Directional control valve 4/3-way valve, closed neutral position Directional control valve 4/3-way valve, exhaust neutral position Directional control valve 5/2-way valve Directional control valve 5/3-way valve, closed neutral position"
- **Hidraoil: how to read a 4/3 label**
  - Source: Hydraulic symbols: guide, chart and PDF | Hidraoil Fluid Power. https://www.hidraoil.com/technical-resources/hydraulic-symbols (SECONDARY)
  - Quote: "The first number indicates the number of main ports and the second the number of positions. A 4/3 valve has four ports and three positions."
- **Hidraoil: detent, spring and proportional actuation must not be confused**
  - Source: Hydraulic symbols: guide, chart and PDF | Hidraoil Fluid Power. https://www.hidraoil.com/technical-resources/hydraulic-symbols (SECONDARY)
  - Quote: "Actuation symbols are added to the main element. A detent holds a position, while a spring may return the valve to another position. Proportional control differs from electrical on/off actuation; the functions must not be confused when reading a diagram."
Parker, Eaton/Vickers: their symbol guides were not retrieved in readable form (Hidraoil, a distributor, lists the brands only):
UNCONFIRMED. Festo Didactic's textbook, TP101 Pneumatics Basic Level, is a college repository copy of the publisher's book:
SECONDARY. Bosch Rexroth's Hydraulics Basic Principles is the maker's own file; SMC's symbol sheet is the maker's own.
My reading of the order those guides use: first what a symbol is for (function, not construction), then lines and basic
elements, then pumps, motors, cylinders and accessories, then valves with the number-of-ways label, then circuits. Bosch's
contents list (seen in a search result; UNCONFIRMED) runs graphic symbols (purpose, DIN ISO 1219, pumps, motors, cylinders, accessories, hydraulic valves), then physics,
then components in detail, which is the same order.

**e4training, a teaching site that says it follows ISO 1219-1 and -2 (SECONDARY).**
- **e4training: draw the valve in the de-activated position**
  - Source: Directional Valve Symbols | e4training. https://www.e4training.com/hyd_princip/symbol_directional1.php (SECONDARY)
  - Quote: "Valves should always be drawn in the de-activated position e.g. pushed over by the spring, not the solenoid."
- **e4training: what 4 way 2 position means**
  - Source: Directional Valve Symbols | e4training. https://www.e4training.com/hyd_princip/symbol_directional1.php (SECONDARY)
  - Quote: "The '4 way' means it has 4 pipe connections, generally Pressure, Return, Port A and Port B. The 'two position' means that it has two switched positions i.e. it can sit in the A or B position."
- **e4training: hydraulic pilot solid triangle, pneumatic pilot clear triangle**
  - Source: Directional Valve Symbols | e4training. https://www.e4training.com/hyd_princip/symbol_directional1.php (SECONDARY)
  - Quote: "Note how the hydraulic pilot is shown as a solid triangle although if this was a pneumatic pilot it would be shown as a clear triangle."
- **e4training: 4/3 valves drawn in their centre position with two springs**
  - Source: Directional Valve Symbols | e4training. https://www.e4training.com/hyd_princip/symbol_directional1.php (SECONDARY)
  - Quote: "All symbols show four-way three position valves. They are all shown at standby in their centre positions."
- **e4training: open P to T centre unloads a fixed pump**
  - Source: Directional Valve Symbols | e4training. https://www.e4training.com/hyd_princip/symbol_directional1.php (SECONDARY)
  - Quote: "The middle symbol shows a hydraulically operated valve with an open P to T line. This format is commonly used with fixed displacement pumps so that there is no pressure on the pump when it is not required."
- **e4training: a blocked centre still leaks, so a load can creep**
  - Source: Directional Valve Symbols | e4training. https://www.e4training.com/hyd_princip/symbol_directional1.php (SECONDARY)
  - Quote: "However, because this is a spool valve there will be some leakage between ports so the A and B lines may still be subject to experiencing different pressures and facilitating cylinder creep."
- **e4training: the extra boxes show what happens while the valve switches**
  - Source: Directional Valve Symbols | e4training. https://www.e4training.com/hyd_princip/symbol_directional1.php (SECONDARY)
  - Quote: "The additional sections show the crossover conditions e.g. the connection type as the valve switches."

**Public US training text, as general training text only (never as how any navy does things).** The US Navy fluid power course,
NAVEDTRA 14105A, is republished chapter by chapter on Engineering Library (SECONDARY); its chapter 12 is the diagrams chapter.
- **NAVEDTRA 14105A chapter order: components first, then diagrams, then the symbol appendix**
  - Source: Basic Diagrams and Systems | Engineering Library (US Navy NAVEDTRA 14105A, Fluid Power, chapter 12). https://engineeringlibrary.org/reference/hydraulics-basic-diagrams-and-systems-navy (SECONDARY)
  - Quote: "Navy Fluid Power Training Course 1. Introduction to Fluid Power 2. Forces in Liquids 3. Hydraulic Fluids 4. Pumps 5. Fluid Lines & Fittings 6. Valves 7. Sealing Devices & Materials 8. Measurement & Pressure Control Devices 9. Reservoirs, Strainers, Filters, & Accumulators 10. Actuators 11. Pneumatics 12. Basic Diagrams & Systems 13. Graphic Symbols for Fluid Power Diagrams"
- **NAVEDTRA 14105A: reading diagrams is basic to fluid power**
  - Source: Basic Diagrams and Systems | Engineering Library (US Navy NAVEDTRA 14105A, Fluid Power, chapter 12). https://engineeringlibrary.org/reference/hydraulics-basic-diagrams-and-systems-navy (SECONDARY)
  - Quote: "The ability to read diagrams is a basic requirement for understanding the operation of fluid power systems. Understanding the diagrams of a system requires having knowledge of the symbols used in the schematic diagrams."
- **NAVEDTRA 14105A rule: symbols show connections, flow paths and function only**
  - Source: Basic Diagrams and Systems | Engineering Library (US Navy NAVEDTRA 14105A, Fluid Power, chapter 12). https://engineeringlibrary.org/reference/hydraulics-basic-diagrams-and-systems-navy (SECONDARY)
  - Quote: "Symbols show connections, flow paths, and the function of the component represented only. They do not indicate conditions occurring during transition from one flow path to another, nor do they indicate component construction or values, such as pressure or flow rate"
- **NAVEDTRA 14105A rule: symbols do not show port locations or spool movement**
  - Source: Basic Diagrams and Systems | Engineering Library (US Navy NAVEDTRA 14105A, Fluid Power, chapter 12). https://engineeringlibrary.org/reference/hydraulics-basic-diagrams-and-systems-navy (SECONDARY)
  - Quote: "Symbols do not indicate the location of ports, direction of shifting of spools, or position of control elements on actual components"
- **NAVEDTRA 14105A rule: each symbol shows the normal or neutral condition**
  - Source: Basic Diagrams and Systems | Engineering Library (US Navy NAVEDTRA 14105A, Fluid Power, chapter 12). https://engineeringlibrary.org/reference/hydraulics-basic-diagrams-and-systems-navy (SECONDARY)
  - Quote: "Each symbol is drawn to show the normal or neutral condition of each component unless multiple circuit diagrams are furnished showing various phases of circuit operation"
- **NAVEDTRA 14105A rule: symbols may be rotated, drawn at any size**
  - Source: Basic Diagrams and Systems | Engineering Library (US Navy NAVEDTRA 14105A, Fluid Power, chapter 12). https://engineeringlibrary.org/reference/hydraulics-basic-diagrams-and-systems-navy (SECONDARY)
  - Quote: "Symbols may be rotated or reversed without altering their meaning except in cases of lines to reservoirs and vented manifolds"
- **NAVEDTRA 14105A: pictorial diagrams show appearance and location**
  - Source: Basic Diagrams and Systems | Engineering Library (US Navy NAVEDTRA 14105A, Fluid Power, chapter 12). https://engineeringlibrary.org/reference/hydraulics-basic-diagrams-and-systems-navy (SECONDARY)
  - Quote: "Pictorial diagrams (Figure 12-2) show the general location and actual appearance of each component, all interconnecting piping, and the general piping arrangement."
- **NAVEDTRA 14105A: cutaway diagrams show internals and do not normally use symbols**
  - Source: Basic Diagrams and Systems | Engineering Library (US Navy NAVEDTRA 14105A, Fluid Power, chapter 12). https://engineeringlibrary.org/reference/hydraulics-basic-diagrams-and-systems-navy (SECONDARY)
  - Quote: "Cutaway diagrams (Figure 12-3) show the internal working parts of all fluid power components in a system. The diagrams include controls and actuating mechanisms and all interconnecting piping. Cutaway diagrams do not normally use symbols."
- **NAVEDTRA 14105A: a graphic diagram is for tracing fluid component to component**
  - Source: Basic Diagrams and Systems | Engineering Library (US Navy NAVEDTRA 14105A, Fluid Power, chapter 12). https://engineeringlibrary.org/reference/hydraulics-basic-diagrams-and-systems-navy (SECONDARY)
  - Quote: "The primary purpose of a graphic (schematic) diagram is to enable the maintenance person to trace the flow of fluid from component to component within the system."
- **NAVEDTRA 14105A: the graphic diagram does not show where components are**
  - Source: Basic Diagrams and Systems | Engineering Library (US Navy NAVEDTRA 14105A, Fluid Power, chapter 12). https://engineeringlibrary.org/reference/hydraulics-basic-diagrams-and-systems-navy (SECONDARY)
  - Quote: "does not indicate the physical location of the various components, but it does show the relationship of each component to the other components within the system."
- **NAVEDTRA 14105A: open-centre system**
  - Source: Basic Diagrams and Systems | Engineering Library (US Navy NAVEDTRA 14105A, Fluid Power, chapter 12). https://engineeringlibrary.org/reference/hydraulics-basic-diagrams-and-systems-navy (SECONDARY)
  - Quote: "In an open-center system, the pump circulates the fluid from the reservoir, through the selector valves, and back to the reservoir"
- **NAVEDTRA 14105A: closed-centre system**
  - Source: Basic Diagrams and Systems | Engineering Library (US Navy NAVEDTRA 14105A, Fluid Power, chapter 12). https://engineeringlibrary.org/reference/hydraulics-basic-diagrams-and-systems-navy (SECONDARY)
  - Quote: "In a closed-center system, the fluid in the system remains pressurized from the pump (or regulator) to the directional control valve while the pump is operating."
- **NAVEDTRA 14105A: letters tell piping systems of the same kind apart**
  - Source: Basic Diagrams and Systems | Engineering Library (US Navy NAVEDTRA 14105A, Fluid Power, chapter 12). https://engineeringlibrary.org/reference/hydraulics-basic-diagrams-and-systems-navy (SECONDARY)
  - Quote: "When a print shows more than one piping system of the same kind, additional letters are added to the symbols to differentiate between the systems."
NEETS (the Navy electricity and electronics training series) was not retrieved: UNCONFIRMED. The US Department of Energy handbook
DOE-HDBK-1016/1-93, Engineering Symbology, Prints and Drawings, Module 2, is a US government public document; the copy I read
is hosted on a training site (SECONDARY). It is a good public text for piping diagrams and fluid power diagrams, though its
symbols are the older US ones, so the brief shows the ISO form first. Its order: valve symbols, valve actuators, control valve
designations, piping, instrumentation, miscellaneous symbols; then reading P&IDs (valve conditions, then a print-reading
example); then fluid power diagrams (pumps, reservoirs, actuators, valves, lines, then reading a diagram).
- **DOE-HDBK-1016: learn the symbols and most P&IDs can be read**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "To read and interpret piping and instrument drawings (P&IDs), the reader must learn the meaning of the symbols. This chapter discusses the common symbols that are used to depict fluid system components. When the symbology is mastered, the reader will be able to interpret most P&IDs."
- **DOE-HDBK-1016: fluid power drawings use their own symbols and conventions**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "Fluid power diagrams and schematics require an independent review because they use a unique set of symbols and conventions"
- **DOE-HDBK-1016: pump and motor symbols differ by where the arrow touches the circle**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "The difference between them is that the point of the arrow touches the circle in a pump and the tail of the arrow touches the circle in a motor."
- **DOE-HDBK-1016: fluid power valves route flow, with three to eight pipes**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "In fluid power systems it is common for a valve to have three to eight pipes attached to the valve body, with the valve being capable of routing the fluid, or several separate fluids, in any number of combinations of input and output flowpaths."
- **DOE-HDBK-1016: a double-acting cylinder drains one chamber while the other is pressurised**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "The cylinder is designed to receive fluid in either the upper or lower chambers. The system is designed so that when pressure is applied to the top chamber, the bottom chamber is aligned to drain back to the reservoir."
- **DOE-HDBK-1016: a schematic gives function, not location**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "A schematic diagram uses symbols to show the elements in a system. Schematics are designed to supply the functional information of the system. They do not accurately represent the relative location of the components. Schematics are useful in maintenance work, and understanding them is an important part of troubleshooting."

**All About Circuits (Kuphaldt's textbook, open licence).** The Ladder Logic chapter's pages, in order:
- **All About Circuits, Ladder Logic chapter: the page order**
  - Source: Permissive and Interlock Circuits | Ladder Logic | Electronics Textbook. https://www.allaboutcircuits.com/textbook/digital/chpt-6/permissive-interlock-circuits
  - Quote: "“Ladder” Diagrams * Digital Logic Functions * Permissive and Interlock Circuits * Motor Control Circuits * Fail-safe Design * Programmable Logic Controllers (PLC)"
- **All About Circuits: ladder diagrams are specialised schematics for control logic**
  - Source: “Ladder” Diagrams | Ladder Logic | Electronics Textbook. https://www.allaboutcircuits.com/textbook/digital/chpt-6/ladder-diagrams
  - Quote: "Ladder diagrams are specialized schematics commonly used to document industrial control logic systems."
- **All About Circuits: ladder coil as a circle, contact as two parallel lines**
  - Source: Electromechanical Relay Logic Worksheet - Digital Circuits. https://www.allaboutcircuits.com/worksheets/electromechanical-relay-logic
  - Quote: "In ladder logic symbolism, an electromechanical relay coil is shown as a circle, and the contact(s) actuated by the coil as two parallel lines, almost like a capacitor symbol."
Engineering ToolBox's P&ID symbol pages were not retrieved: UNCONFIRMED.

**HSE guidance that shows isolation and schematic conventions.**
- **HSG253: accurate reference diagrams are needed to plan isolations**
  - Source: The safe isolation of plant and equipment (HSG253). https://files.engineering.com/files/a01e329a-ec1b-42f7-a8fb-7a3bb8ea235c/hsg253_safe_isolation.pdf (SECONDARY)
  - Quote: "Accurate reference information, kept updated to all plant modifications, is necessary for planning and implementing isolations."
- **HSG85: isolation without disconnecting circuits that must keep running**
  - Source: Electricity at work: Safe working practices HSG85. https://www.hse.gov.uk/PUBNS/priced/hsg85.pdf
  - Quote: "switch disconnectors should be suitably located and arranged so that circuits and equipment can be isolated without disconnecting other circuits that are required to continue in service"
HSG253 (the safe isolation of plant and equipment) lists the P&IDs, process schematics, cause and effect diagrams and loop
diagrams as the reference set for planning an isolation, and, in a conference summary of it (SECONDARY; UNCONFIRMED, not in the check), says isolation drawings are not P&IDs but a P&ID may be modified to show the isolation points clearly.

**University open courseware on engineering drawing.**
- **MIT 2.007: a hole on the back is not visible in a single isometric view**
  - Source: Design Handbook: Engineering Drawing and Sketching | MIT OpenCourseWare. https://ocw.mit.edu/courses/2-007-design-and-manufacturing-i-spring-2009/pages/related-resources/drawing_and_sketching
  - Quote: "However, if the object in figure 2 had a hole on the back side, it would not be visible using a single isometric drawing. In order to get a more complete view of the object, an orthographic projection may be used."
- **MIT 2.007: hidden lines are dotted by convention**
  - Source: Design Handbook: Engineering Drawing and Sketching | MIT OpenCourseWare. https://ocw.mit.edu/courses/2-007-design-and-manufacturing-i-spring-2009/pages/related-resources/drawing_and_sketching
  - Quote: "hidden lines are, by convention, dotted"
- **MIT 2.007: section lining is cross-hatching for the cut area**
  - Source: Design Handbook: Engineering Drawing and Sketching | MIT OpenCourseWare. https://ocw.mit.edu/courses/2-007-design-and-manufacturing-i-spring-2009/pages/related-resources/drawing_and_sketching
  - Quote: "The diagonal lines on the section drawing are used to indicate the area that has been theoretically cut. These lines are called section lining or cross-hatching"
- **UW Pressbooks: 3D parts, 2D documents**
  - Source: Orthographic Projection – Engineering Graphics and Design. https://uw.pressbooks.pub/enggraphics/chapter/orthographic-projection
  - Quote: "Engineering components are 3-dimensional, but the tools that we use to communicate about them—documents and computer screens—are 2-dimensional."
- **UW Pressbooks: visible edges solid, centre lines long-short-long**
  - Source: Orthographic Projection – Engineering Graphics and Design. https://uw.pressbooks.pub/enggraphics/chapter/orthographic-projection
  - Quote: "Visible edges or boundaries (including the extent of curved surfaces) are shown as solid lines."
- **UW Pressbooks: the centre-line convention**
  - Source: Orthographic Projection – Engineering Graphics and Design. https://uw.pressbooks.pub/enggraphics/chapter/orthographic-projection
  - Quote: "The center lines of holes or solid cylindrical features are indicated with a special “long-short-long” line which extends slightly beyond the ends of the feature."
- **UW Pressbooks: line precedence when edges overlap**
  - Source: Orthographic Projection – Engineering Graphics and Design. https://uw.pressbooks.pub/enggraphics/chapter/orthographic-projection
  - Quote: "When multiple edges project to the same line on the drawing, the line type is determined by the following precedence: (1) visible lines, (2) hidden lines, (3) center lines."
- **LibreTexts: section lines are thin continuous diagonal hatching**
  - Source: 3.2: Section Views - Engineering LibreTexts. https://eng.libretexts.org/Courses/Illinois_Institute_of_Technology/Introduction_to_Engineering_Drawing_and_Design/03%3A_Module_C_-__Auxiliary_views_section_views_isometric_and_oblique_projections/3.02%3A_Section_Views
  - Quote: "Section lines are thin, continuous diagonal hatch lines used to indicate surfaces that lie directly on the cutting plane."
- **LibreTexts: the cutting-plane line shows where the object is imagined cut and the direction of sight**
  - Source: 3.2: Section Views - Engineering LibreTexts. https://eng.libretexts.org/Courses/Illinois_Institute_of_Technology/Introduction_to_Engineering_Drawing_and_Design/03%3A_Module_C_-__Auxiliary_views_section_views_isometric_and_oblique_projections/3.02%3A_Section_Views
  - Quote: "The cutting plane line indicates the location where the object is imagined to be cut, while the arrowheads specify the direction of sight for viewing the resulting section."
- **LibreTexts: webs, ribs and spokes are not hatched even when cut**
  - Source: 3.2: Section Views - Engineering LibreTexts. https://eng.libretexts.org/Courses/Illinois_Institute_of_Technology/Introduction_to_Engineering_Drawing_and_Design/03%3A_Module_C_-__Auxiliary_views_section_views_isometric_and_oblique_projections/3.02%3A_Section_Views
  - Quote: "Webs, ribs, and spokes are not hatched in section views, even if they are cut by the cutting plane"
My reading of the order: MIT's handbook goes isometric, then orthographic views, then dimensioning, then sectioning, then
assembly drawings; UW Pressbooks starts with orthographic projection; LibreTexts puts section views in module C after
orthographic projection (module B). OpenStax was not needed: no physical idea in this course has to be built from scratch.

**Single-line diagrams, the sources for lesson 2.**
- **US Coast Guard: what a one-line diagram is for**
  - Source: us coast guard marine safety center plan review guideline. https://www.dco.uscg.mil/Portals/9/MSC/PRG/PRG.E2-07.2021.10.13.Electrical%20One-Line%20Diagram.pdf
  - Quote: "The purpose of an electrical one-line diagram is to provide an elementary schematic outlining connections from power sources (generators, shore power, battery banks) through a distribution system (switchboard, busbars, cables, feeders, and panels) to supply various power consuming loads."
- **Doerry: each load connection is understood to have its own breaker**
  - Source: One-Line Diagrams - doerry.org. http://doerry.org/norbert/MarineElectricalPowerSystems/documents/D_000032/20260406%20One%20Line%20Diagrams.pdf
  - Quote: "each load connection is understood to have its own circuit breaker."
- **Doerry: bus-tie and generator breakers carry unique identifiers**
  - Source: One-Line Diagrams - doerry.org. http://doerry.org/norbert/MarineElectricalPowerSystems/documents/D_000032/20260406%20One%20Line%20Diagrams.pdf
  - Quote: "All bus-tie circuit breakers, generator circuit breakers, circuit breakers associated with energy storage, circuit breakers supplying large transformers / power conversion equipment, circuit breakers supplying switchboards and circuit breakers supplying load centers should have a unique identifier."
- **Doerry: a one-line diagram is used with a description of how the plant is operated**
  - Source: One-Line Diagrams - doerry.org. http://doerry.org/norbert/MarineElectricalPowerSystems/documents/D_000032/20260406%20One%20Line%20Diagrams.pdf
  - Quote: "The one-line diagram and the electrical power system concept of operations (EPS-CONOPS) are used together to define the ship’s electrical power system architecture and how the electrical power system is intended to be operated."
- **Cobler: a single line diagram is the whole system on one page, no cable routes**
  - Source: Single Line Diagram (SLD) Explained: How to Read One | Cobler. https://cobler.io/blog/how-to-read-single-line-diagram (SECONDARY)
  - Quote: "It shows how power gets from the incoming supply to any board or circuit, but not where the cables are installed."
- **Cobler: the thick line is a busbar**
  - Source: Single Line Diagram (SLD) Explained: How to Read One | Cobler. https://cobler.io/blog/how-to-read-single-line-diagram (SECONDARY)
  - Quote: "But it's the busbar of the main switchboard (MSB), a set of heavy copper bars that every outgoing circuit connects to."
- **Cobler: a bus coupler is a normally open breaker**
  - Source: Single Line Diagram (SLD) Explained: How to Read One | Cobler. https://cobler.io/blog/how-to-read-single-line-diagram (SECONDARY)
  - Quote: "Between them is a bus coupler , a breaker that's normally open, so each transformer feeds its own half."
- **EECO: one line stands for all three phases**
  - Source: How to Read a Single Line Diagram | EECO. https://eecoonline.com/inspire/how-to-read-a-single-line-diagram (SECONDARY)
  - Quote: "It will have one single line shown for bus (or cable) to represent all three phases."
- **EECO: read a one-line from the incoming supply down to the loads**
  - Source: How to Read a Single Line Diagram | EECO. https://eecoonline.com/inspire/how-to-read-a-single-line-diagram (SECONDARY)
  - Quote: "A one line typically starts at the top of the page and works its way down. It will start with the utility or other means of incoming power and its disconnecting device."
- **EECO: a one-line ends at the loads**
  - Source: How to Read a Single Line Diagram | EECO. https://eecoonline.com/inspire/how-to-read-a-single-line-diagram (SECONDARY)
  - Quote: "It will then flow down to the distribution equipment like a switchboard or MCC and then finally it will end with the loads, like a motor or panelboard."
- **EECO: transformers show where the voltage changes**
  - Source: How to Read a Single Line Diagram | EECO. https://eecoonline.com/inspire/how-to-read-a-single-line-diagram (SECONDARY)
  - Quote: "A one line may have different voltages present on the page and should have transformers shown to help you identify when you are changing from one voltage to another."
- **EECO: the legend is like a map legend**
  - Source: How to Read a Single Line Diagram | EECO. https://eecoonline.com/inspire/how-to-read-a-single-line-diagram (SECONDARY)
  - Quote: "just like a map legend. It will tell you what each symbol means by using universally accepted symbols."
- **EEP: the single line diagram is the start of planning a switchgear installation**
  - Source: Circuit configurations (single line diagrams) for HV and MV switchgear installations | EEP. https://electrical-engineering-portal.com/circuit-configurations-hv-mv-switchgear-installations (SECONDARY)
  - Quote: "The starting point for planning a switchgear installation is its single line diagram. This indicates the extent of the installation, such as the number of busbars and branches, and also their associated apparatus."
- **Marine electrical notes: the single line diagram gives the overview of the installation**
  - Source: maritime electrical installations - notes on design. http://www.iqytechnicalcollege.com/JEE129-MarineElectricalSystems.pdf (SECONDARY)
  - Quote: "One of the documents required for approval of the system design is the single line diagram which provides an overview of major sub-systems or even the entire electrical installation."
Note: USCG PRG E2-07 is US Coast Guard plan-review guidance for merchant ships; Doerry's note is a CC BY paper on one-line
diagrams in ship design. Cobler, EECO and EEP are vendor or training sites (SECONDARY). None is used as how any navy draws.

**Control schematics, the sources for lesson 3.**
- **All About Circuits: coils and contacts are matched by name, not nearness**
  - Source: Electromechanical Relay Logic Worksheet - Digital Circuits. https://www.allaboutcircuits.com/worksheets/electromechanical-relay-logic
  - Quote: "In ladder logic diagrams, relay coils are associated with their respective contacts by _name_ rather than by proximity."
- **All About Circuits: a seal-in contact keeps the contactor latched on**
  - Source: Motor Control Circuits | Ladder Logic | Electronics Textbook. https://www.allaboutcircuits.com/textbook/digital/chpt-6/motor-control-circuits
  - Quote: "Continuous motor operation with a momentary “start” switch is possible if a normally-open “seal-in” contact from the contactor is connected in parallel with the start switch so that once the contactor is energized it maintains power to itself and keeps itself “latched” on."
- **All About Circuits: a normally-closed stop switch conducts when released**
  - Source: Motor Control Circuits | Ladder Logic | Electronics Textbook. https://www.allaboutcircuits.com/textbook/digital/chpt-6/motor-control-circuits
  - Quote: "switch, having normally-closed contacts, will conduct power to either forward or reverse circuits when released."
- **All About Circuits: permissive contacts in series**
  - Source: Permissive and Interlock Circuits | Ladder Logic | Electronics Textbook. https://www.allaboutcircuits.com/textbook/digital/chpt-6/permissive-interlock-circuits
  - Quote: "each permissive switch contact is wired in series, so that if any one of them detects an unsafe condition, the circuit will be opened"
- **All About Circuits: interlocks stop two incompatible actions at once**
  - Source: Permissive and Interlock Circuits | Ladder Logic | Electronics Textbook. https://www.allaboutcircuits.com/textbook/digital/chpt-6/permissive-interlock-circuits
  - Quote: "Switch contacts designed to prevent a control system from taking two incompatible actions at once (such as powering an electric motor forward and backward simultaneously) are called _interlocks_"
- **All About Circuits: one contactor prevents the other**
  - Source: Permissive and Interlock Circuits | Ladder Logic | Electronics Textbook. https://www.allaboutcircuits.com/textbook/digital/chpt-6/permissive-interlock-circuits
  - Quote: "The energization of one contactor prevents the energization of the other."
- **All About Circuits: a mechanical interlock joins two contactors**
  - Source: Permissive and Interlock Circuits | Ladder Logic | Electronics Textbook. https://www.allaboutcircuits.com/textbook/digital/chpt-6/permissive-interlock-circuits
  - Quote: "Some contactors come equipped with the option of a _mechanical_ interlock: a lever joining the armatures of two contactors together so that they are physically prevented from simultaneous closure."
- **All About Circuits: normally-closed overload contact opens when the heaters get hot**
  - Source: Permissive and Interlock Circuits | Ladder Logic | Electronics Textbook. https://www.allaboutcircuits.com/textbook/digital/chpt-6/permissive-interlock-circuits
  - Quote: "Take note of the normally-closed “OL” contact, which is the thermal overload contact activated by the “heater” elements wired in series with each phase of the AC motor."
- **All About Circuits: if the heaters get too hot the contact opens and neither contactor can energise**
  - Source: Permissive and Interlock Circuits | Ladder Logic | Electronics Textbook. https://www.allaboutcircuits.com/textbook/digital/chpt-6/permissive-interlock-circuits
  - Quote: "If the heaters get too hot, the contact will change from its normal (closed) state to being open, which will prevent either contactor from energizing."
- **All About Circuits: choose a normally-closed contact so that a high reading opens it**
  - Source: Permissive and Interlock Circuits | Ladder Logic | Electronics Textbook. https://www.allaboutcircuits.com/textbook/digital/chpt-6/permissive-interlock-circuits
  - Quote: "Note that the high fuel pressure contact is normally-closed. This is because we want the switch contact to open if the fuel pressure gets too high."
- **All About Circuits: design so the de-energised state is the safe one**
  - Source: Fail-safe Design | Ladder Logic | Electronics Textbook. https://www.allaboutcircuits.com/textbook/digital/chpt-6/fail-safe-design
  - Quote: "We already know that an open failure in the wiring or solenoid coil is more likely than a short or any other type of failure, so we should design this system to be in its safest mode with the solenoid de-energized."
- **Match a coil to its contacts by reference designation and cross-reference**
  - Source: Electrical Symbols Chart: ANSI vs IEC Industrial Control Symbols. https://viox.com/electrical-symbols-chart (SECONDARY)
  - Quote: "The coil and its contacts may appear on different pages or in different ladder-diagram rungs. Match them using the reference designation and cross-reference information. Do not assume two similarly shaped coils belong to the same device."
Reference designations in use (vendor pages, SECONDARY): K stands for relays and other signal-processing devices, so K1 is
relay 1 and its coil and contacts all carry K1 (Deskely's IEC 60617 page; UNCONFIRMED, not held by the check). Aux contact
terminals 13-14 are normally open and 21-22 normally closed (ElectricalFlux; UNCONFIRMED, not held by the check).

---

## 3. What a marine or naval engineering technician on the electrical path must be able to read

Dan has no syllabi for the Navy courses ahead. The brief plans against the public apprenticeship standards and the STCW tables
and says where a choice is a guess. The guesses, up front:
1. There is no public standard titled "Naval engineering technician". The nearest for Dan's path is ST1403 Maritime electrical
   fitter (Level 3, approved, written with the Royal Navy among the employers) and, until April 2025, the Maritime Electrical
   Fitter option of ST0457 Engineering technician. This is a guess about which standard his Navy course follows.
2. ST0364 Marine engineer is about boats, yachts and commercial craft, not naval vessels. It is a comparison, not a target.
3. STCW Tables A-III/1 and A-III/6 are the merchant seafarers' standard (watchkeeping engineers and electro-technical
   officers). The Royal Navy is not bound by it. It is the best public statement of what a ship's electrical person reads, so
   it is used as evidence, not as Dan's syllabus.

### 3.1 The apprenticeship standards (Institute for Apprenticeships, now on Skills England)
**ST0457 Engineering technician, version 1.4** (core, then options 5 to 8 for Maritime Defence):
- **ST0457 core knowledge includes graphical expressions and symbols**
  - Source: Engineering technician / Skills England (ST0457). https://skillsengland.education.gov.uk/apprenticeship-standards/st0457-v1-4
  - Quote: "understanding of general engineering/manufacturing mathematical and scientific principles, methods, techniques, graphical expressions, symbols formulae and calculations used by engineering technicians"
- **ST0457 core skill: obtain and use drawings and documentation**
  - Source: Engineering technician / Skills England (ST0457). https://skillsengland.education.gov.uk/apprenticeship-standards/st0457-v1-4
  - Quote: "obtaining, checking and using the appropriate documentation (such as job instructions, drawings, quality control documentation)"
- **ST0457: systems involve mechanical, electrical, electronic and fluid power components**
  - Source: Engineering technician / Skills England (ST0457). https://skillsengland.education.gov.uk/apprenticeship-standards/st0457-v1-4
  - Quote: "Engineered and manufactured products and systems that Engineering Technicians work on could involve mechanical, electrical, electronic, electromechanical and fluid power components/systems."
- **ST0457 Maritime Electrical Fitter role works from drawings**
  - Source: Engineering technician / Skills England (ST0457). https://skillsengland.education.gov.uk/apprenticeship-standards/st0457-v1-4
  - Quote: "The Electrical Fitter utilises engineering drawings, data and documentation in order to undertake the manufacture, installation, testing, commissioning, fault diagnosis, maintenance, overhaul and removal of electrical and data systems on maritime vessels."
- **ST0457 maritime specialist skill: read, analyse and interpret drawings**
  - Source: Engineering technician / Skills England (ST0457). https://skillsengland.education.gov.uk/apprenticeship-standards/st0457-v1-4
  - Quote: "read, analyse and interpret engineering data, drawings and documentation used in the design, build, operation and repair of maritime vessels"
- **ST0457 maritime electrical knowledge includes fluid power systems on board**
  - Source: Engineering technician / Skills England (ST0457). https://skillsengland.education.gov.uk/apprenticeship-standards/st0457-v1-4
  - Quote: "understand the practical and theoretical requirements of maritime electrical, electronic, mechanical, electromechanical, fibre-optics, fluid power equipment and systems used on board vessels."
- **ST0457 Maritime Mechanical Fitter role: mechanical and fluid power equipment from drawings**
  - Source: Engineering technician / Skills England (ST0457). https://skillsengland.education.gov.uk/apprenticeship-standards/st0457-v1-4
  - Quote: "The Mechanical Fitter role involves working from engineering drawings, data and documentation in order to undertake the manufacture, installation, testing, commissioning, fault diagnosis, maintenance, overhaul and removal of mechanical and fluid power equipment on ships and submarines"
- **ST0457 Maritime Pipeworker role: fluid power and pipe systems from drawings, ships and submarines**
  - Source: Engineering technician / Skills England (ST0457). https://skillsengland.education.gov.uk/apprenticeship-standards/st0457-v1-4
  - Quote: "The Pipeworker role involves working from engineering drawings, data and documentation in order to undertake the fabrication, installation, testing, commissioning and removal of fluid power and domestic pipe systems on ships and submarines in defence and commercial shipping."
The Maritime Electrical Fitter role profile goes on to mention propulsion, weapons, sensors, reactor and auxiliary systems.
Dan's course does not touch any of those systems: it names no plant, only teaches the conventions (see section 4).

**ST1403 Maritime electrical fitter (Level 3), the replacement for option 5.**
- **ST1403 Maritime electrical fitter: read engineering drawings, blueprints and schematic drawings**
  - Source: Maritime electrical fitter (OCC1403) | Skills England occupational maps. https://occupational-maps.skillsengland.education.gov.uk/maps/occupation/OCC1403
  - Quote: "Receive, read and interpret engineering data and documentation such as engineering drawings, technical data, blueprints, schematic drawings, and technical documentation."
- **ST1403 was written with the Royal Navy among the employers**
  - Source: Maritime electrical fitter (OCC1403) | Skills England occupational maps. https://occupational-maps.skillsengland.education.gov.uk/maps/occupation/OCC1403
  - Quote: "Employers involved in creating the standard: group Babcock International Group, BAE Systems, Capita, Ministry of Defence (MOD), Royal Navy, Cammell Laird"
- **ST1403 keywords include ships and submarines**
  - Source: Maritime electrical fitter (OCC1403) | Skills England occupational maps. https://occupational-maps.skillsengland.education.gov.uk/maps/occupation/OCC1403
  - Quote: "Electrical Maintenance Maritime Ships Submarines"
**ST0276 Maritime mechanical and electrical mechanic (Level 2, Royal Navy and Merchant Navy).**
- **ST0276 Maritime mechanical and electrical mechanic is a Royal Navy and Merchant Navy role at Level 2**
  - Source: Maritime mechanical and electrical mechanic / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0276-v1-1
  - Quote: "Maritime mechanical and electrical mechanic are employed in the Royal Navy and Merchant Navy."
- **ST0276 role: work from drawings to test and diagnose electrical, mechanical and fluid power equipment on ships and submarines**
  - Source: Maritime mechanical and electrical mechanic / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0276-v1-1
  - Quote: "Maritime mechanical and electrical mechanics work from engineering drawings, data and documentation in order to undertake the testing, fault diagnosis and maintenance of electrical, mechanical and fluid power equipment on ships and submarines."
- **ST0276 job titles in the Royal Navy include Marine Engineer**
  - Source: Maritime mechanical and electrical mechanic / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0276-v1-1
  - Quote: "Maritime mechanical and electrical mechanic will typically work in either the Royal Navy as a Marine Engineer or Weapons Engineer"
**ST0364 Marine engineer (Level 3, boats):**
- **ST0364 Marine engineers work on boats such as yachts and commercial craft (not naval vessels)**
  - Source: Marine engineer / Skills England. https://www.instituteforapprenticeships.org/apprenticeship-standards/marine-engineer-v1-0
  - Quote: "Marine engineers work on boats such as yachts, commercial craft and superyachts."
- **ST0364 Marine engineer: interpret drawings and scaled engineering drawings**
  - Source: Marine engineer / Skills England. https://www.instituteforapprenticeships.org/apprenticeship-standards/marine-engineer-v1-0
  - Quote: "How to produce and interpret scaled engineering drawings plus any certification requirements"
- **ST0364 Marine engineer skill: interpret plans, data, drawings and documentation**
  - Source: Marine engineer / Skills England. https://www.instituteforapprenticeships.org/apprenticeship-standards/marine-engineer-v1-0
  - Quote: "Interpret designer’s plans and engineering data, drawings and documentation"
**ST0154 Maintenance and operations engineering technician, and ST1426 Engineering maintenance technician (single discipline,
Level 3):** plant-side standards with the clearest diagram lines.
- **ST0154 Maintenance and operations engineering technician: interpret specifications and supporting documentation**
  - Source: Maintenance and operations engineering technician / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0154-v1-3
  - Quote: "read, understand and interpret information and work in compliance with technical specifications and supporting documentation"
- **ST1426: engineering representations, sketches, drawings and graphical conventions**
  - Source: Engineering Maintenance Technician, Single Discipline (ST1426) Specification. https://siasuk.com/wp-content/uploads/2025/09/L3-Engineering-Maintenance-Technician-Single-Discipline-AP-V1.0-Specification-V1.0-1.pdf
  - Quote: "Engineering representations, sketches, drawings, and graphical information conventions."
- **ST1426 Engineering maintenance technician: types of diagrams and electrical schematic symbols**
  - Source: Engineering Maintenance Technician, Single Discipline (ST1426) Specification. https://siasuk.com/wp-content/uploads/2025/09/L3-Engineering-Maintenance-Technician-Single-Discipline-AP-V1.0-Specification-V1.0-1.pdf
  - Quote: "Types of diagrams used to represent circuits; symbols and abbreviations used to represent components in electrical schematics."
- **ST1426: types of control and instrumentation diagrams**
  - Source: Engineering Maintenance Technician, Single Discipline (ST1426) Specification. https://siasuk.com/wp-content/uploads/2025/09/L3-Engineering-Maintenance-Technician-Single-Discipline-AP-V1.0-Specification-V1.0-1.pdf
  - Quote: "Types of control and instrumentation diagrams."
- **ST1426: diagrams for mechanical installations, symbols and abbreviations**
  - Source: Engineering Maintenance Technician, Single Discipline (ST1426) Specification. https://siasuk.com/wp-content/uploads/2025/09/L3-Engineering-Maintenance-Technician-Single-Discipline-AP-V1.0-Specification-V1.0-1.pdf
  - Quote: "Types of diagrams used to represent mechanical installations and assemblies; symbols and abbreviations used to represent parts in diagrams."
- **ST1426 skill: highlight issues with technical drawings**
  - Source: Engineering Maintenance Technician, Single Discipline (ST1426) Specification. https://siasuk.com/wp-content/uploads/2025/09/L3-Engineering-Maintenance-Technician-Single-Discipline-AP-V1.0-Specification-V1.0-1.pdf
  - Quote: "Identify and highlight issues (red pen) with technical drawings."
**City & Guilds Level 3 Diploma in Marine Engineering (Advanced), the qualification of the Marine engineer standard:**
- **City & Guilds Level 3 marine engineering: identify diagrams, schematics and symbology**
  - Source: Level 3 Diploma in Marine Engineering (Advanced) (2473-13). https://www.cityandguilds.com/-/media/productdocuments/transport_maintenance/marine/2473/level_3/centre_documents/2473-13-l3-diploma-in-marine-engineering-qualification-handbook-pdf.pdf
  - Quote: "2.5 identify diagrams, schematics and symbology used in performing marine engineering activities"
- **City & Guilds Level 3 marine engineering: drawing scales and general arrangement drawings**
  - Source: Level 3 Diploma in Marine Engineering (Advanced) (2473-13). https://www.cityandguilds.com/-/media/productdocuments/transport_maintenance/marine/2473/level_3/centre_documents/2473-13-l3-diploma-in-marine-engineering-qualification-handbook-pdf.pdf
  - Quote: "2.2 explain how to use drawing scales 2.3 identify boat terms from drawings and specifications 2.4 explain how to extract information from lines plans, construction and general arrangement drawings 2.5 identify diagrams, schematics and symbology used in performing marine engineering activities"
- **City & Guilds Level 3 marine engineering: schematic and hydraulic drawings as information sources**
  - Source: Level 3 Diploma in Marine Engineering (Advanced) (2473-13). https://www.cityandguilds.com/-/media/productdocuments/transport_maintenance/marine/2473/level_3/centre_documents/2473-13-l3-diploma-in-marine-engineering-qualification-handbook-pdf.pdf
  - Quote: "general arrangement drawings, schematic drawings, hydraulic drawings"

### 3.2 STCW Code, Tables A-III/1 and A-III/6
- **STCW Table A-III/1: interpret electrical and simple electronic diagrams**
  - Source: STCW Table A-III/1. https://stcw.maritime.edu/stcw/2025/tables/31.html
  - Quote: "The interpretation of electrical and simple electronic diagrams"
- **STCW Table A-III/1: interpret piping, hydraulic and pneumatic diagrams**
  - Source: STCW Table A-III/1. https://stcw.maritime.edu/stcw/2025/tables/31.html
  - Quote: "The interpretation of piping, hydraulic and pneumatic diagrams"
- **STCW Table A-III/1: interpret machinery drawings and handbooks**
  - Source: STCW Table A-III/1. https://stcw.maritime.edu/stcw/2025/tables/31.html
  - Quote: "Interpretation of machinery drawings and handbooks"
- **STCW A-III/6 (UK MSN 1860): the interpretation of electrical and electronic diagrams**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "The interpretation of electrical and electronic diagrams"
- **MSN 1860: electro-hydraulic and electro-pneumatic control systems are in the A-III/6 knowledge list**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "Electro-hydraulic and electro-pneumatic control systems"
- **MSN 1860: safe isolation before personnel work on shipboard electrical systems**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "Safety requirements for working on shipboard electrical systems, including safe isolation of electrical equipment before personnel are permitted to work on such equipment;"
- **MSN 1860: explain the electrical distribution system with drawing**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "ability to explain electrical distribution system with drawing/instructions"
- **MSN 1860: interpreting technical drawing in the ETO oral syllabus**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "Interpretation of ships technical drawing;"
- **MSN 1860: detection of electrical malfunction and fault location**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "Detection of electric mal function, location of faults and measures to prevent damage;"
- **MSN 1860: compiling a switching plan to isolate a distribution fault**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "Compiling and implementing switching plan to isolate a HV distribution fault;"
- **USCG NVIC 23-14: the candidate interprets shipboard schematics, control diagrams and logic diagrams**
  - Source: Guidelines for Qualifications for STCW Endorsements As Electro-Technical Officer (NVIC 23-14). https://media.defense.gov/2017/Jul/14/2001777751/-1/-1/0/NVIC-23-14.PDF
  - Quote: "The candidate correctly interprets and uses shipboard electrical schematics, shipboard electronic controls diagrams, and shipboard controls logic diagrams."
- **NVIC 23-14 (A-III/6 column 4): distribution systems understood and explained with drawings**
  - Source: Guidelines for Qualifications for STCW Endorsements As Electro-Technical Officer (NVIC 23-14). https://media.defense.gov/2017/Jul/14/2001777751/-1/-1/0/NVIC-23-14.PDF
  - Quote: "Electrical distribution systems can be understood and explained with drawings/instructions"
- **STCW A-III/6 column 4: ship technical drawings correctly interpreted**
  - Source: Guidelines for Qualifications for STCW Endorsements As Electro-Technical Officer (NVIC 23-14). https://media.defense.gov/2017/Jul/14/2001777751/-1/-1/0/NVIC-23-14.PDF
  - Quote: "ship’s technical drawings are correctly interpreted"
- **NVIC assessment: use manufacturer drawings and schematics to couple and disconnect switchboards**
  - Source: Guidelines for Qualifications for STCW Endorsements As Electro-Technical Officer (NVIC 23-14). https://media.defense.gov/2017/Jul/14/2001777751/-1/-1/0/NVIC-23-14.PDF
  - Quote: "using manufacturer’s drawings, schematics and instructions for coupling and disconnecting switchboards and distribution panels"
- **USCG assessment guideline for A-III/6: one-line diagram and control system diagram**
  - Source: Assessment Guidelines for STCW Code TABLE A-III/6 Electro-Technical Officer. https://downloads.regulations.gov/USCG-2012-0980-0003/attachment_1.pdf
  - Quote: "Correctly interpret a ship’s One Line diagram."
My reading: A-III/1 (officer in charge of an engineering watch) names exactly two diagram skills, the interpretation of electrical and simple
electronic diagrams and of piping, hydraulic and pneumatic diagrams, under the functions Electrical, electronic and control
engineering and Maintenance and repair. A-III/6 (electro-technical officer) names the interpretation of electrical and
electronic diagrams, pairs it with safe isolation, and its criteria say that the ship's technical drawings are correctly interpreted
(column 4). The US Coast Guard's assessment guideline for A-III/6 gives the same competence a practical form: a one-line
diagram and a control system diagram. UK MSN 1860 and the USCG NVIC 23-14 are national guidance on the same Code. Two of the
four kinds in Dan's list (electrical, and piping, hydraulic and pneumatic) are named in STCW; engineering drawings are named
as machinery drawings and handbooks, and as technical drawings.

### 3.3 The Pearson BTEC Level 3 lines
See 1.2. The lines that matter for the choice of content: Unit 2's list of what a drawing carries; Unit 12's B1 (symbols and
circuit diagrams to BS ISO 1219-1:2012); Unit 16's "circuit symbols eg electrical, electronic, hydraulic, pneumatic" and its
first-or-third-angle line; Unit 19's gate symbols in BS, IEC and ANSI forms.

---

## 4. The scope to cover, and what research says about each part

Dan's rule for the course (13 Nov): he must learn system diagrams for his submarine qualification, so this course never uses,
shows or describes those diagrams or any Navy drawing, and never claims how the Navy or any boat draws or lays out anything. It
teaches the public conventions so that any diagram in those styles can be read: what each symbol means, what the lines mean,
what state the diagram shows, and how to trace a path through it. Every diagram is the course's own, of a generic system. No
reactor, weapons or propulsion plant content.

### Lesson 1. How any diagram talks
A diagram shows function, not shape or position; symbols, lines and junctions; the legend and title block; the state it is
drawn in; reference designations and tags; reading from source to load.
- **NAVEDTRA 14105A rule: symbols show connections, flow paths and function only**
  - Source: Basic Diagrams and Systems | Engineering Library (US Navy NAVEDTRA 14105A, Fluid Power, chapter 12). https://engineeringlibrary.org/reference/hydraulics-basic-diagrams-and-systems-navy (SECONDARY)
  - Quote: "Symbols show connections, flow paths, and the function of the component represented only. They do not indicate conditions occurring during transition from one flow path to another, nor do they indicate component construction or values, such as pressure or flow rate"
- **Bitesize: a circuit diagram does not show what the circuit looks like**
  - Source: Circuit symbols - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/znm6nk7
  - Quote: "It doesn't show what the circuit actually looks like, or how long all the connections are."
- **Bitesize: a picture of the parts is not a circuit diagram**
  - Source: Circuit symbols - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/znm6nk7
  - Quote: "This shows what the previous circuit diagram describes: a battery connected to two bulbs and a switch. This is not a circuit diagram."
- **DOE-HDBK-1016: a schematic gives function, not location**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "A schematic diagram uses symbols to show the elements in a system. Schematics are designed to supply the functional information of the system. They do not accurately represent the relative location of the components. Schematics are useful in maintenance work, and understanding them is an important part of troubleshooting."
- **DOE-HDBK-1016: P&IDs show valves in their normal position**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "Unless otherwise stated, P&IDs indicate valves in their "normal" position. This is usually interpreted as the normal or primary flowpath for the system. An exception is safety systems, which are normally shown in their standby or non-accident condition."
- **Galco: a normally open contact is drawn in its shelf state**
  - Source: Electrical & Control Symbols Chart – ANSI vs IEC 60617. https://www.galco.com/electrical-symbols-chart (SECONDARY)
  - Quote: "Shown in the shelf state: open when the relay coil is de-energized."
- **Contacts are drawn de-energised, and an NC contact stays drawn closed**
  - Source: Electrical Symbols: US (ANSI/IEEE) vs IEC Chart. https://electrician.wiki/reference/electrical-symbols (SECONDARY)
  - Quote: "A normally closed contact is drawn closed even if, in normal running, its coil is energized and the contact is open."
- **All About Circuits: design so the de-energised state is the safe one**
  - Source: Fail-safe Design | Ladder Logic | Electronics Textbook. https://www.allaboutcircuits.com/textbook/digital/chpt-6/fail-safe-design
  - Quote: "We already know that an open failure in the wiring or solenoid coil is more likely than a short or any other type of failure, so we should design this system to be in its safest mode with the solenoid de-energized."
- **EECO: the legend is like a map legend**
  - Source: How to Read a Single Line Diagram | EECO. https://eecoonline.com/inspire/how-to-read-a-single-line-diagram (SECONDARY)
  - Quote: "just like a map legend. It will tell you what each symbol means by using universally accepted symbols."
- **IEC 81346-1: reference designations**
  - Source: IEC 81346-1:2022 | IEC. https://webstore.iec.ch/en/publication/64021
  - Quote: "IEC 81346-1:2022 establishes general principles for the structuring of systems including structuring of information about systems. Based on these principles, rules and guidance are given for the formulation of unambiguous reference designations for objects in any system."
- **IEC 81346-1: what a reference designation is for**
  - Source: IEC 81346-1:2022 | IEC. https://webstore.iec.ch/en/publication/64021
  - Quote: "The reference designation identifies objects for the purpose of creation and retrieval of information about an object and, where realized, about its corresponding component."
- **BTEC Unit 2 B1: standards, title block, views, line types, circuit symbols**
  - Source: Specification - Pearson BTEC Level 3 National Extended Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/spec-btec-nat-eng-extcert.pdf
  - Quote: "standards including BS 8888 and BS 60617 or other relevant international equivalents o title block/layout – drawing number(s), projection symbols, scale, units, general tolerances, name of author, date, border, parts referencing o views – elevation, plan, end, section, hatching style, auxiliary o line types – centre, construction, outline, hidden, leader, dimension o common features, e.g. screw threads, springs, splines, repeated items, holes, chamfers, radii o circuit diagram symbols and components, e.g. cell/battery, switch, resistor, diode, capacitor, transistor, integrated circuit, light-emitting diode (LED), motor, buzzer"
- **Marshall: crossing lines with no dot are not connected**
  - Source: Students’ Creation and Interpretation of Circuit Diagrams. https://ejrsme.icrsme.com/article/download/7775/5542
  - Quote: "Students must also realize that lines that simply cross (as in the center of the diagram on the left) do not indicate an electrical connection unless they are marked with a small circle."
- **Marshall: a circuit diagram shows that connections exist but not how they are made physically**
  - Source: Students’ Creation and Interpretation of Circuit Diagrams. https://ejrsme.icrsme.com/article/download/7775/5542
  - Quote: "Indeed, a fundamental characteristic of circuit diagrams is that they show _that_ electrical connections exist but not _how_ they are made physically"
Research says the first idea to fix is that a diagram is a map of connection, not a picture (section 6). My reading: the
"normal state" convention is the one idea that differs in every family: de-energised and unoperated for electrical contacts
(Galco's chart: a normally open contact is drawn in the shelf state), the de-activated position for a fluid power valve (e4training),
"normal" for a P&ID with safety systems in standby (DOE), and the "normal or neutral condition" for fluid power symbols
(NAVEDTRA). Lesson 1 should teach it once, as a single rule with four faces, and then every later lesson asks "what state is this
drawn in?" as its first question. Reference designations and tags are taught in outline only: a letter for the kind of thing and a
number, K1 for relay 1, so that the same name ties the coil to its contacts and a tag on the plant to a tag on the drawing.

### Lesson 2. Single-line diagrams
- **US Coast Guard: what a one-line diagram is for**
  - Source: us coast guard marine safety center plan review guideline. https://www.dco.uscg.mil/Portals/9/MSC/PRG/PRG.E2-07.2021.10.13.Electrical%20One-Line%20Diagram.pdf
  - Quote: "The purpose of an electrical one-line diagram is to provide an elementary schematic outlining connections from power sources (generators, shore power, battery banks) through a distribution system (switchboard, busbars, cables, feeders, and panels) to supply various power consuming loads."
- **Cobler: a single line diagram is the whole system on one page, no cable routes**
  - Source: Single Line Diagram (SLD) Explained: How to Read One | Cobler. https://cobler.io/blog/how-to-read-single-line-diagram (SECONDARY)
  - Quote: "It shows how power gets from the incoming supply to any board or circuit, but not where the cables are installed."
- **EECO: one line stands for all three phases**
  - Source: How to Read a Single Line Diagram | EECO. https://eecoonline.com/inspire/how-to-read-a-single-line-diagram (SECONDARY)
  - Quote: "It will have one single line shown for bus (or cable) to represent all three phases."
- **EECO: read a one-line from the incoming supply down to the loads**
  - Source: How to Read a Single Line Diagram | EECO. https://eecoonline.com/inspire/how-to-read-a-single-line-diagram (SECONDARY)
  - Quote: "A one line typically starts at the top of the page and works its way down. It will start with the utility or other means of incoming power and its disconnecting device."
- **Cobler: the thick line is a busbar**
  - Source: Single Line Diagram (SLD) Explained: How to Read One | Cobler. https://cobler.io/blog/how-to-read-single-line-diagram (SECONDARY)
  - Quote: "But it's the busbar of the main switchboard (MSB), a set of heavy copper bars that every outgoing circuit connects to."
- **Cobler: a bus coupler is a normally open breaker**
  - Source: Single Line Diagram (SLD) Explained: How to Read One | Cobler. https://cobler.io/blog/how-to-read-single-line-diagram (SECONDARY)
  - Quote: "Between them is a bus coupler , a breaker that's normally open, so each transformer feeds its own half."
- **Doerry: bus-tie and generator breakers carry unique identifiers**
  - Source: One-Line Diagrams - doerry.org. http://doerry.org/norbert/MarineElectricalPowerSystems/documents/D_000032/20260406%20One%20Line%20Diagrams.pdf
  - Quote: "All bus-tie circuit breakers, generator circuit breakers, circuit breakers associated with energy storage, circuit breakers supplying large transformers / power conversion equipment, circuit breakers supplying switchboards and circuit breakers supplying load centers should have a unique identifier."
- **Doerry: each load connection is understood to have its own breaker**
  - Source: One-Line Diagrams - doerry.org. http://doerry.org/norbert/MarineElectricalPowerSystems/documents/D_000032/20260406%20One%20Line%20Diagrams.pdf
  - Quote: "each load connection is understood to have its own circuit breaker."
- **Doerry: a one-line diagram is used with a description of how the plant is operated**
  - Source: One-Line Diagrams - doerry.org. http://doerry.org/norbert/MarineElectricalPowerSystems/documents/D_000032/20260406%20One%20Line%20Diagrams.pdf
  - Quote: "The one-line diagram and the electrical power system concept of operations (EPS-CONOPS) are used together to define the ship’s electrical power system architecture and how the electrical power system is intended to be operated."
- **HSG85: isolation without disconnecting circuits that must keep running**
  - Source: Electricity at work: Safe working practices HSG85. https://www.hse.gov.uk/PUBNS/priced/hsg85.pdf
  - Quote: "switch disconnectors should be suitably located and arranged so that circuits and equipment can be isolated without disconnecting other circuits that are required to continue in service"
- **MSN 1860: safe isolation before personnel work on shipboard electrical systems**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "Safety requirements for working on shipboard electrical systems, including safe isolation of electrical equipment before personnel are permitted to work on such equipment;"
My reading: the sources agree on four things to read in order: the legend, the sources (generators, shore or incoming
supply, battery banks), the busbars (a thick line that every outgoing circuit connects to), then each outgoing breaker to its load;
transformers show where the voltage changes; a normally open breaker between two bus sections (a bus coupler or bus-tie) is
what keeps each half on its own source. HSG85's isolation line gives the isolating question: what opens to take this load
dead without taking dead the loads that must keep running. A single-line diagram does not show state, so a one-line is read
together with a statement of how the plant is run (Doerry on the concept of operations). The course supplies that statement as a
caption on each drawing. Dan already reads three-phase from AC circuits and generator paralleling, so a single line standing for
three phases is a one-sentence reminder, not a lesson.

### Lesson 3. Control schematics
- **All About Circuits: ladder diagrams are specialised schematics for control logic**
  - Source: “Ladder” Diagrams | Ladder Logic | Electronics Textbook. https://www.allaboutcircuits.com/textbook/digital/chpt-6/ladder-diagrams
  - Quote: "Ladder diagrams are specialized schematics commonly used to document industrial control logic systems."
- **All About Circuits: coils and contacts are matched by name, not nearness**
  - Source: Electromechanical Relay Logic Worksheet - Digital Circuits. https://www.allaboutcircuits.com/worksheets/electromechanical-relay-logic
  - Quote: "In ladder logic diagrams, relay coils are associated with their respective contacts by _name_ rather than by proximity."
- **All About Circuits: ladder coil as a circle, contact as two parallel lines**
  - Source: Electromechanical Relay Logic Worksheet - Digital Circuits. https://www.allaboutcircuits.com/worksheets/electromechanical-relay-logic
  - Quote: "In ladder logic symbolism, an electromechanical relay coil is shown as a circle, and the contact(s) actuated by the coil as two parallel lines, almost like a capacitor symbol."
- **Match a coil to its contacts by reference designation and cross-reference**
  - Source: Electrical Symbols Chart: ANSI vs IEC Industrial Control Symbols. https://viox.com/electrical-symbols-chart (SECONDARY)
  - Quote: "The coil and its contacts may appear on different pages or in different ladder-diagram rungs. Match them using the reference designation and cross-reference information. Do not assume two similarly shaped coils belong to the same device."
- **All About Circuits: a normally-closed stop switch conducts when released**
  - Source: Motor Control Circuits | Ladder Logic | Electronics Textbook. https://www.allaboutcircuits.com/textbook/digital/chpt-6/motor-control-circuits
  - Quote: "switch, having normally-closed contacts, will conduct power to either forward or reverse circuits when released."
- **All About Circuits: a seal-in contact keeps the contactor latched on**
  - Source: Motor Control Circuits | Ladder Logic | Electronics Textbook. https://www.allaboutcircuits.com/textbook/digital/chpt-6/motor-control-circuits
  - Quote: "Continuous motor operation with a momentary “start” switch is possible if a normally-open “seal-in” contact from the contactor is connected in parallel with the start switch so that once the contactor is energized it maintains power to itself and keeps itself “latched” on."
- **All About Circuits: permissive contacts in series**
  - Source: Permissive and Interlock Circuits | Ladder Logic | Electronics Textbook. https://www.allaboutcircuits.com/textbook/digital/chpt-6/permissive-interlock-circuits
  - Quote: "each permissive switch contact is wired in series, so that if any one of them detects an unsafe condition, the circuit will be opened"
- **All About Circuits: interlocks stop two incompatible actions at once**
  - Source: Permissive and Interlock Circuits | Ladder Logic | Electronics Textbook. https://www.allaboutcircuits.com/textbook/digital/chpt-6/permissive-interlock-circuits
  - Quote: "Switch contacts designed to prevent a control system from taking two incompatible actions at once (such as powering an electric motor forward and backward simultaneously) are called _interlocks_"
- **All About Circuits: one contactor prevents the other**
  - Source: Permissive and Interlock Circuits | Ladder Logic | Electronics Textbook. https://www.allaboutcircuits.com/textbook/digital/chpt-6/permissive-interlock-circuits
  - Quote: "The energization of one contactor prevents the energization of the other."
- **All About Circuits: a mechanical interlock joins two contactors**
  - Source: Permissive and Interlock Circuits | Ladder Logic | Electronics Textbook. https://www.allaboutcircuits.com/textbook/digital/chpt-6/permissive-interlock-circuits
  - Quote: "Some contactors come equipped with the option of a _mechanical_ interlock: a lever joining the armatures of two contactors together so that they are physically prevented from simultaneous closure."
- **All About Circuits: normally-closed overload contact opens when the heaters get hot**
  - Source: Permissive and Interlock Circuits | Ladder Logic | Electronics Textbook. https://www.allaboutcircuits.com/textbook/digital/chpt-6/permissive-interlock-circuits
  - Quote: "Take note of the normally-closed “OL” contact, which is the thermal overload contact activated by the “heater” elements wired in series with each phase of the AC motor."
- **All About Circuits: if the heaters get too hot the contact opens and neither contactor can energise**
  - Source: Permissive and Interlock Circuits | Ladder Logic | Electronics Textbook. https://www.allaboutcircuits.com/textbook/digital/chpt-6/permissive-interlock-circuits
  - Quote: "If the heaters get too hot, the contact will change from its normal (closed) state to being open, which will prevent either contactor from energizing."
- **All About Circuits: choose a normally-closed contact so that a high reading opens it**
  - Source: Permissive and Interlock Circuits | Ladder Logic | Electronics Textbook. https://www.allaboutcircuits.com/textbook/digital/chpt-6/permissive-interlock-circuits
  - Quote: "Note that the high fuel pressure contact is normally-closed. This is because we want the switch contact to open if the fuel pressure gets too high."
- **US ladder rungs run horizontally; IEC current paths run vertically with 81346 codes**
  - Source: Electrical Symbols: US (ANSI/IEEE) vs IEC Chart. https://electrician.wiki/reference/electrical-symbols (SECONDARY)
  - Quote: "Layout differs too: US control drawings run ladder rungs horizontally and tag devices CR, M and OL, while IEC drawings run current paths vertically and use IEC 81346 codes such as -K1 and -Q1."
- **BTEC Unit 19: gate symbols in BS, IEC and ANSI forms**
  - Source: Specification - Pearson BTEC Level 3 National Extended Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/spec-btec-nat-eng-extcert.pdf
  - Quote: "Gate symbols, British Standard (BS), International Electrotechnical Commission (IEC), American National Standards Institute (ANSI) or other relevant international equivalents."
My reading. The Motors course has already taught the start-stop circuit as a live drawing (the sealing contact across Start,
the normally closed Stop, the overload contact, no-volt protection). This lesson must not teach it again; it teaches how the
drawing says it: the coil in one place and its contacts in others, matched by name and by a cross-reference; contacts drawn in
the shelf state, so a normally closed stop contact is drawn closed even while the motor runs; rungs read in order; an
interlock as an auxiliary normally closed contact of the other contactor. Two ways of drawing (US ladder, horizontal rungs and
CR, M, OL tags; IEC, vertical current paths and -K1, -Q1 codes) are named, with the IEC form taught first. Schematic against
wiring diagram against block diagram: the ladder diagram defines the flow of control logic while the panel's wiring is another
drawing (a forum answer, SECONDARY, not quoted); a block diagram shows parts as boxes joined by flow lines (ISO 10628-1 uses the
same idea for a process).

### Lesson 4. Fluid power symbols
- **Bosch: what graphical symbols are for**
  - Source: Hydraulics Basic Principles - Bosch. https://dc-mkt-prod.cloud.bosch.tech/xrm/media/global/training_1/digital_media/reference_books/knowledge-in-detail-hydraulics-basic-principles.pdf
  - Quote: "In hydraulics, graphical symbols (also referred to as switching symbols) are used for the abstract illustration of fluid power components and their functions, as well as to explain hydraulic circuit systems."
- **Bosch: symbols give no information about construction**
  - Source: Hydraulics Basic Principles - Bosch. https://dc-mkt-prod.cloud.bosch.tech/xrm/media/global/training_1/digital_media/reference_books/knowledge-in-detail-hydraulics-basic-principles.pdf
  - Quote: "Graphic symbols of hydraulics do not provide information about the design structure of the components."
- **Festo: symbols indicate the function of the element**
  - Source: Pneumatics, Basic Level (Textbook), Festo Didactic TP101. https://repositori.mypolycc.edu.my/bitstream/123456789/5320/1/Pneumatics%20basic%20level%20by%20Festo%20Didactic%20%28z-lib.org%29.pdf (SECONDARY)
  - Quote: "The elements in the system are represented by symbols which indicate the function of the element."
- **Festo: construction is not in the symbol**
  - Source: Pneumatics, Basic Level (Textbook), Festo Didactic TP101. https://repositori.mypolycc.edu.my/bitstream/123456789/5320/1/Pneumatics%20basic%20level%20by%20Festo%20Didactic%20%28z-lib.org%29.pdf (SECONDARY)
  - Quote: "The technical construction of the component is not taken into account in the abstract symbol form."
- **NAVEDTRA 14105A rule: symbols do not show port locations or spool movement**
  - Source: Basic Diagrams and Systems | Engineering Library (US Navy NAVEDTRA 14105A, Fluid Power, chapter 12). https://engineeringlibrary.org/reference/hydraulics-basic-diagrams-and-systems-navy (SECONDARY)
  - Quote: "Symbols do not indicate the location of ports, direction of shifting of spools, or position of control elements on actual components"
- **NAVEDTRA 14105A rule: symbols may be rotated, drawn at any size**
  - Source: Basic Diagrams and Systems | Engineering Library (US Navy NAVEDTRA 14105A, Fluid Power, chapter 12). https://engineeringlibrary.org/reference/hydraulics-basic-diagrams-and-systems-navy (SECONDARY)
  - Quote: "Symbols may be rotated or reversed without altering their meaning except in cases of lines to reservoirs and vented manifolds"
- **DOE-HDBK-1016: pump and motor symbols differ by where the arrow touches the circle**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "The difference between them is that the point of the arrow touches the circle in a pump and the tail of the arrow touches the circle in a motor."
- **e4training: hydraulic pilot solid triangle, pneumatic pilot clear triangle**
  - Source: Directional Valve Symbols | e4training. https://www.e4training.com/hyd_princip/symbol_directional1.php (SECONDARY)
  - Quote: "Note how the hydraulic pilot is shown as a solid triangle although if this was a pneumatic pilot it would be shown as a clear triangle."
- **DOE-HDBK-1016: fluid power drawings use their own symbols and conventions**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "Fluid power diagrams and schematics require an independent review because they use a unique set of symbols and conventions"
- **SMC: more than one symbol system in use, ISO 1219-1 commonly**
  - Source: Pneumatics Symbols (SMC). https://www.smc.nu/drawings/2-D/pn_symbols_EU.pdf
  - Quote: "There are several symbol systems and conventions in use around the world, most officially recognised by standards bodies. Commonly used is ISO1219-1."
- **A regulator: clarify symbols with written descriptions where misreading could cause a hazard**
  - Source: TRG 41 Fluid power safety systems. https://www.resources.nsw.gov.au/sites/default/files/2025-03/trg-41-fluid-power-safety-systems.pdf
  - Quote: "The design should clarify the meaning of symbols with written descriptions where misinterpretation could create a hazard."
- **A regulator: component labels must cross-reference the circuit diagram**
  - Source: TRG 41 Fluid power safety systems. https://www.resources.nsw.gov.au/sites/default/files/2025-03/trg-41-fluid-power-safety-systems.pdf
  - Quote: "Systems component labels should enable clear cross referencing with the circuit diagram"
- **NAVEDTRA 14105A: letters tell piping systems of the same kind apart**
  - Source: Basic Diagrams and Systems | Engineering Library (US Navy NAVEDTRA 14105A, Fluid Power, chapter 12). https://engineeringlibrary.org/reference/hydraulics-basic-diagrams-and-systems-navy (SECONDARY)
  - Quote: "When a print shows more than one piping system of the same kind, additional letters are added to the symbols to differentiate between the systems."
- **Digital Circuits level 2 touches symbols and drawing (crossing and connecting) inside a logic course**
  - Source: Practice Digital Circuits | Brilliant. https://brilliant.org/courses/digital-circuits/
  - Quote: "Level 2 Circuit Design Choosing Components Reversing Outputs Building Circuits Crossing and Connecting"
- **Marshall: crossing lines with no dot are not connected**
  - Source: Students’ Creation and Interpretation of Circuit Diagrams. https://ejrsme.icrsme.com/article/download/7775/5542
  - Quote: "Students must also realize that lines that simply cross (as in the center of the diagram on the left) do not indicate an electrical connection unless they are marked with a small circle."
My reading: the sources say the same thing three ways, and each is a rule to teach once: a symbol shows what a part does, not
how it is built or where its ports are; lines have kinds (working, pilot, drain, with crossing and joining shown differently);
a pump symbol and a motor symbol differ by where the arrow touches the circle (DOE; in ISO 1219 the triangle's direction does
the same job, so the brief draws the ISO form and states the check); hydraulic and pneumatic are told apart by a solid or an
open triangle. The Navy and DOE texts show the older US set; the brief shows ISO 1219 and offers the other as one to recognise
(SMC: several symbol systems are in use, the most common being ISO 1219-1). Brilliant's Digital Circuits has a level called
"Crossing and Connecting"; electrical-diagram research (Marshall) found students must be told that lines that cross do not
connect unless marked; the same idea needs teaching for fluid power lines.

### Lesson 5. Valves in fluid power
- **Hidraoil: how to read a 4/3 label**
  - Source: Hydraulic symbols: guide, chart and PDF | Hidraoil Fluid Power. https://www.hidraoil.com/technical-resources/hydraulic-symbols (SECONDARY)
  - Quote: "The first number indicates the number of main ports and the second the number of positions. A 4/3 valve has four ports and three positions."
- **e4training: what 4 way 2 position means**
  - Source: Directional Valve Symbols | e4training. https://www.e4training.com/hyd_princip/symbol_directional1.php (SECONDARY)
  - Quote: "The '4 way' means it has 4 pipe connections, generally Pressure, Return, Port A and Port B. The 'two position' means that it has two switched positions i.e. it can sit in the A or B position."
- **DOE-HDBK-1016: fluid power valves route flow, with three to eight pipes**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "In fluid power systems it is common for a valve to have three to eight pipes attached to the valve body, with the valve being capable of routing the fluid, or several separate fluids, in any number of combinations of input and output flowpaths."
- **Festo: initial and return actuation are two methods, shown either side of the position boxes**
  - Source: Pneumatics, Basic Level (Textbook), Festo Didactic TP101. https://repositori.mypolycc.edu.my/bitstream/123456789/5320/1/Pneumatics%20basic%20level%20by%20Festo%20Didactic%20%28z-lib.org%29.pdf (SECONDARY)
  - Quote: "Normally these are two separate methods. They are both shown on the symbol either side of the position boxes."
- **Hidraoil: detent, spring and proportional actuation must not be confused**
  - Source: Hydraulic symbols: guide, chart and PDF | Hidraoil Fluid Power. https://www.hidraoil.com/technical-resources/hydraulic-symbols (SECONDARY)
  - Quote: "Actuation symbols are added to the main element. A detent holds a position, while a spring may return the valve to another position. Proportional control differs from electrical on/off actuation; the functions must not be confused when reading a diagram."
- **e4training: draw the valve in the de-activated position**
  - Source: Directional Valve Symbols | e4training. https://www.e4training.com/hyd_princip/symbol_directional1.php (SECONDARY)
  - Quote: "Valves should always be drawn in the de-activated position e.g. pushed over by the spring, not the solenoid."
- **e4training: 4/3 valves drawn in their centre position with two springs**
  - Source: Directional Valve Symbols | e4training. https://www.e4training.com/hyd_princip/symbol_directional1.php (SECONDARY)
  - Quote: "All symbols show four-way three position valves. They are all shown at standby in their centre positions."
- **Bosch: centre position with P and T joined**
  - Source: Hydraulics Basic Principles - Bosch. https://dc-mkt-prod.cloud.bosch.tech/xrm/media/global/training_1/digital_media/reference_books/knowledge-in-detail-hydraulics-basic-principles.pdf
  - Quote: "In the symbol of a directional control valve shown in the circuit diagram, ports P and T are connected to each other in center position (zero position). This is also called neutral circulation, and such a directional control valve is called an unloading valve."
- **e4training: open P to T centre unloads a fixed pump**
  - Source: Directional Valve Symbols | e4training. https://www.e4training.com/hyd_princip/symbol_directional1.php (SECONDARY)
  - Quote: "The middle symbol shows a hydraulically operated valve with an open P to T line. This format is commonly used with fixed displacement pumps so that there is no pressure on the pump when it is not required."
- **e4training: a blocked centre still leaks, so a load can creep**
  - Source: Directional Valve Symbols | e4training. https://www.e4training.com/hyd_princip/symbol_directional1.php (SECONDARY)
  - Quote: "However, because this is a spool valve there will be some leakage between ports so the A and B lines may still be subject to experiencing different pressures and facilitating cylinder creep."
- **e4training: the extra boxes show what happens while the valve switches**
  - Source: Directional Valve Symbols | e4training. https://www.e4training.com/hyd_princip/symbol_directional1.php (SECONDARY)
  - Quote: "The additional sections show the crossover conditions e.g. the connection type as the valve switches."
- **SMC: the valve types by ways and neutral position**
  - Source: Pneumatics Symbols (SMC). https://www.smc.nu/drawings/2-D/pn_symbols_EU.pdf
  - Quote: "Directional control valve 4/3-way valve, closed neutral position Directional control valve 4/3-way valve, exhaust neutral position Directional control valve 5/2-way valve Directional control valve 5/3-way valve, closed neutral position"
- **DOE-HDBK-1016: a three-way valve may be drawn in the position it fails to, not its normal position**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "3-way valves are sometimes drawn in the position that they will fail to instead of always being drawn in their "normal" position. This will either be defined as the standard by the system of drawings or noted in some manner on the individual drawings."
- **BTEC Unit 12 in brief**
  - Source: Specification - Pearson BTEC Level 3 National Extended Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/spec-btec-nat-eng-extcert.pdf
  - Quote: "Learners explore the safe operation of pneumatic and hydraulic systems, including simulation of circuits using software and practical system assembly and testing."
My reading: the part that does the work is the box: one box per position, the label (4/3 means four ports and three
positions) and the operating symbols either side, with the spring and the solenoid; the drawn position is the one with the
actuators off. Centre conditions are the best "what does the symbol mean" puzzle in the course: closed centre holds a load,
open centre unloads the pump, and e4training's own caution is that a spool valve still leaks, so a closed centre does not
hold a load for ever (a drawn symbol is an idealisation). Pressure relief, reducing, check valves and flow controls are one
symbol each, with the spring and arrow conventions; how a relief valve is set and sized belongs to the Hydraulics and
pneumatics course. Unit 12's A3 names the same list of valves (UNCONFIRMED, see 1.2), so the course's valve list is a defensible
level 3 list.

### Lesson 6. Tracing a hydraulic circuit, then a pneumatic one
- **DOE-HDBK-1016: the first step in reading a fluid power diagram is the overall purpose**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "The first step is to get an overall view of what is happening."
- **DOE-HDBK-1016: hydraulic presses hold the work piece in place**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "Hydraulic systems are often used in press work or other applications where the work piece must be held in place."
- **DOE-HDBK-1016: worked reading of a 4-way 2-position valve shown de-energised**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "Pushbutton PB-1 is used to activate the valve by energizing the S-1 solenoid (note the valve is shown in the de-energized position)."
- **DOE-HDBK-1016: worked reading, oil from port 1 to port 3 to the bottom chamber**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "As shown, the high pressure hydraulic fluid is being routed from Port 1 to Port 3 and then to the bottom chamber of the piston."
- **DOE-HDBK-1016: a double-acting cylinder drains one chamber while the other is pressurised**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "The cylinder is designed to receive fluid in either the upper or lower chambers. The system is designed so that when pressure is applied to the top chamber, the bottom chamber is aligned to drain back to the reservoir."
- **DOE-HDBK-1016: worked reading, relief valve returns oil to the reservoir above its setpoint**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "When system pressure exceeds its setpoint, the valve opens and returns the hydraulic fluid back to the reservoir."
- **Festo: tracing a 5/2 valve operated**
  - Source: Pneumatics, Basic Level (Textbook), Festo Didactic TP101. https://repositori.mypolycc.edu.my/bitstream/123456789/5320/1/Pneumatics%20basic%20level%20by%20Festo%20Didactic%20%28z-lib.org%29.pdf (SECONDARY)
  - Quote: "Pressing the push button operates the 5/2-way valve against the valve return spring. The diagram (right-hand circuit) shows the valve in the operated or actuated position. In this position, the supply pressure is connected to the piston side of the cylinder, while the piston rod side is exhausted. The pressure on the piston side advances the piston rod."
- **Festo: tracing a 5/2 valve released**
  - Source: Pneumatics, Basic Level (Textbook), Festo Didactic TP101. https://repositori.mypolycc.edu.my/bitstream/123456789/5320/1/Pneumatics%20basic%20level%20by%20Festo%20Didactic%20%28z-lib.org%29.pdf (SECONDARY)
  - Quote: "Once the push button is released, the valve return spring pushes the valve into the initial position. The supply pressure is now connected to the piston rod side, while the piston side is exhausted via the exhaust port of the valve. The piston rod retracts."
- **Festo: before the push button, the cylinder is exhausted through the valve**
  - Source: Pneumatics, Basic Level (Textbook), Festo Didactic TP101. https://repositori.mypolycc.edu.my/bitstream/123456789/5320/1/Pneumatics%20basic%20level%20by%20Festo%20Didactic%20%28z-lib.org%29.pdf (SECONDARY)
  - Quote: "In this unactuated posi- tion, air is applied at the cylinder piston rod side, while the pressure on the piston side of the cylinder is exhausted."
- **NAVEDTRA 14105A: a graphic diagram is for tracing fluid component to component**
  - Source: Basic Diagrams and Systems | Engineering Library (US Navy NAVEDTRA 14105A, Fluid Power, chapter 12). https://engineeringlibrary.org/reference/hydraulics-basic-diagrams-and-systems-navy (SECONDARY)
  - Quote: "The primary purpose of a graphic (schematic) diagram is to enable the maintenance person to trace the flow of fluid from component to component within the system."
- **NAVEDTRA 14105A: open-centre system**
  - Source: Basic Diagrams and Systems | Engineering Library (US Navy NAVEDTRA 14105A, Fluid Power, chapter 12). https://engineeringlibrary.org/reference/hydraulics-basic-diagrams-and-systems-navy (SECONDARY)
  - Quote: "In an open-center system, the pump circulates the fluid from the reservoir, through the selector valves, and back to the reservoir"
- **NAVEDTRA 14105A: closed-centre system**
  - Source: Basic Diagrams and Systems | Engineering Library (US Navy NAVEDTRA 14105A, Fluid Power, chapter 12). https://engineeringlibrary.org/reference/hydraulics-basic-diagrams-and-systems-navy (SECONDARY)
  - Quote: "In a closed-center system, the fluid in the system remains pressurized from the pump (or regulator) to the directional control valve while the pump is operating."
- **HSE: release stored air or hydraulic pressure**
  - Source: Maintenance of work equipment - HSE. https://www.hse.gov.uk/work-equipment-machinery/maintenance.htm
  - Quote: "release any stored energy, such as compressed air or hydraulic pressure that could cause the machine to move or cycle"
- **HSG253: hydraulic accumulators and pipework are depressurised**
  - Source: The safe isolation of plant and equipment (HSG253). https://files.engineering.com/files/a01e329a-ec1b-42f7-a8fb-7a3bb8ea235c/hsg253_safe_isolation.pdf (SECONDARY)
  - Quote: "hydraulic – accumulators and pressurised pipework should be depressurised;"
My reading: DOE's worked example is the shape of the lesson: first the job of the whole system (here, clamp a part in a press),
then each part in order, then each valve position with the oil's path stated, the oil from the pump to the actuator and back to the
tank. Festo's five-by-two example is the pneumatic twin (supply to one side, the other side exhausted, then spring return). What
differs in air: the air is not returned to a tank but exhausted through a port to atmosphere; the supply comes through a service
unit, drawn on a separate sheet in larger diagrams; and air is compressible. Festo's own text on the closed-centre pneumatic
valve (air is compressible, so another position will be assumed if the load on the piston rod changes) is the teaching line for that last point, seen
in the book but not held by the checker: UNCONFIRMED. The unit that sizes the actuator (pressure times area) is the next
course's, and the pump's curve is Heat and fluids'. Before work on any such system, the stored pressure has to be released:
HSE and HSG253 say so, and the lesson ends on it.

### Lesson 7. Piping and system diagrams
- **DOE-HDBK-1016: learn the symbols and most P&IDs can be read**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "To read and interpret piping and instrument drawings (P&IDs), the reader must learn the meaning of the symbols. This chapter discusses the common symbols that are used to depict fluid system components. When the symbology is mastered, the reader will be able to interpret most P&IDs."
- **DOE-HDBK-1016: globe and gate valves are often drawn with the same symbol**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "It shoud be noted that globe and gate valves will often be depicted by the same valve symbol. In such cases, information concerning the valve type may be conveyed by the component identification number or by the notes and legend section of the drawing; however, in many instances even that may not hold true."
- **DOE-HDBK-1016: the symbols alone do not say whether a signal opens or closes a valve**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "Note that the symbols alone in Figure 3 do not provide the reader with enough information to determine whether applying air pressure to the diaphragm opens or closes the process control valve, or whether energizing the solenoid pressurizes or vents the diaphragm."
- **DOE-HDBK-1016: P&IDs show valves in their normal position**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "Unless otherwise stated, P&IDs indicate valves in their "normal" position. This is usually interpreted as the normal or primary flowpath for the system. An exception is safety systems, which are normally shown in their standby or non-accident condition."
- **DOE-HDBK-1016: a three-way valve may be drawn in the position it fails to, not its normal position**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "3-way valves are sometimes drawn in the position that they will fail to instead of always being drawn in their "normal" position. This will either be defined as the standard by the system of drawings or noted in some manner on the individual drawings."
- **NAVEDTRA 14105A: letters tell piping systems of the same kind apart**
  - Source: Basic Diagrams and Systems | Engineering Library (US Navy NAVEDTRA 14105A, Fluid Power, chapter 12). https://engineeringlibrary.org/reference/hydraulics-basic-diagrams-and-systems-navy (SECONDARY)
  - Quote: "When a print shows more than one piping system of the same kind, additional letters are added to the symbols to differentiate between the systems."
- **ISO 10628-1: flow diagrams for process plants**
  - Source: ISO 10628-1:2014 Diagrams for the chemical and petrochemical industry, Part 1: Specification of diagrams. https://www.iso.org/standard/51840.html
  - Quote: "ISO 10628-1:2014 specifies the classification, content, and representation of flow diagrams. In addition, it lays down drafting rules for flow diagrams for chemical and petrochemical industry."
- **ISO 10628-2: process diagram symbols; electrical symbols are IEC 60617**
  - Source: ISO 10628-2:2012 Diagrams for the chemical and petrochemical industry, Part 2: Graphical symbols. https://www.iso.org/cms/live/live/en/sites/isoorg/contents/data/standard/05/18/51841.html
  - Quote: "ISO 10628-2:2012 defines graphical symbols for the preparation of diagrams for the chemical and petrochemical industry. It is a collective application standard of the ISO 14617 series. ISO 10628-2:2012 does not apply to graphical symbols for electrotechnical diagrams; for these, see IEC 60617."
- **ISA 5.1: instrument symbols and tags**
  - Source: ISA5.1, Instrumentation Symbols and Identification. https://www.isa.org/standards-and-publications/isa-standards/isa-standards-committees/isa5-1
  - Quote: "The standard is intended to provide sufficient information to enable anyone reading a flow diagram and having a reasonable amount of plant knowledge to understand the means of measurement and control of the process without having to go into the details of the instrumentation that require the knowledge of an instrument specialist."
- **HSG253: accurate reference diagrams are needed to plan isolations**
  - Source: The safe isolation of plant and equipment (HSG253). https://files.engineering.com/files/a01e329a-ec1b-42f7-a8fb-7a3bb8ea235c/hsg253_safe_isolation.pdf (SECONDARY)
  - Quote: "Accurate reference information, kept updated to all plant modifications, is necessary for planning and implementing isolations."
- **HSG253 checklist: isolation points match the line diagram**
  - Source: The safe isolation of plant and equipment (HSG253). https://files.engineering.com/files/a01e329a-ec1b-42f7-a8fb-7a3bb8ea235c/hsg253_safe_isolation.pdf (SECONDARY)
  - Quote: "Are all isolation points identified on the plant and do they match the line diagram and isolation certificate?"
- **HSG253: tag numbers match the line diagrams**
  - Source: The safe isolation of plant and equipment (HSG253). https://files.engineering.com/files/a01e329a-ec1b-42f7-a8fb-7a3bb8ea235c/hsg253_safe_isolation.pdf (SECONDARY)
  - Quote: "Tag numbers should match the line diagrams in the isolation documentation."
- **HSE: isolate pressurised pipelines and lock off the isolating valves; release stored energy**
  - Source: Maintenance of work equipment - HSE. https://www.hse.gov.uk/work-equipment-machinery/maintenance.htm
  - Quote: "isolate plant and pipelines containing pressured fluid, gas, steam or hazardous material. Lock off isolating valves"
My reading: the lesson reads a pipe diagram as a set of lines to follow and valves to count. Three honest limits go in the
lesson, because the sources say them: a drawing may give globe and gate valves the same symbol, so the tag or the legend says
which; a valve with an operator does not say whether a signal opens it or closes it; and a three-way valve is sometimes drawn in the
position it fails to, not its normal one. Instrument bubbles and tag letters are taught in outline: a first letter for what is
measured (F flow, T temperature, P pressure, L level), then letters for what the instrument does (I indicator, C controller,
T transmitter), so FIC reads as a flow indicating controller; DOE's table is the source (UNCONFIRMED, seen but not held by
the check). The course draws its own cooling water loop and fuel transfer system with its own tags.

### Lesson 8. Engineering drawings
- **UW Pressbooks: 3D parts, 2D documents**
  - Source: Orthographic Projection – Engineering Graphics and Design. https://uw.pressbooks.pub/enggraphics/chapter/orthographic-projection
  - Quote: "Engineering components are 3-dimensional, but the tools that we use to communicate about them—documents and computer screens—are 2-dimensional."
- **MIT 2.007: a hole on the back is not visible in a single isometric view**
  - Source: Design Handbook: Engineering Drawing and Sketching | MIT OpenCourseWare. https://ocw.mit.edu/courses/2-007-design-and-manufacturing-i-spring-2009/pages/related-resources/drawing_and_sketching
  - Quote: "However, if the object in figure 2 had a hole on the back side, it would not be visible using a single isometric drawing. In order to get a more complete view of the object, an orthographic projection may be used."
- **UW Pressbooks: visible edges solid, centre lines long-short-long**
  - Source: Orthographic Projection – Engineering Graphics and Design. https://uw.pressbooks.pub/enggraphics/chapter/orthographic-projection
  - Quote: "Visible edges or boundaries (including the extent of curved surfaces) are shown as solid lines."
- **UW Pressbooks: the centre-line convention**
  - Source: Orthographic Projection – Engineering Graphics and Design. https://uw.pressbooks.pub/enggraphics/chapter/orthographic-projection
  - Quote: "The center lines of holes or solid cylindrical features are indicated with a special “long-short-long” line which extends slightly beyond the ends of the feature."
- **UW Pressbooks: line precedence when edges overlap**
  - Source: Orthographic Projection – Engineering Graphics and Design. https://uw.pressbooks.pub/enggraphics/chapter/orthographic-projection
  - Quote: "When multiple edges project to the same line on the drawing, the line type is determined by the following precedence: (1) visible lines, (2) hidden lines, (3) center lines."
- **MIT 2.007: hidden lines are dotted by convention**
  - Source: Design Handbook: Engineering Drawing and Sketching | MIT OpenCourseWare. https://ocw.mit.edu/courses/2-007-design-and-manufacturing-i-spring-2009/pages/related-resources/drawing_and_sketching
  - Quote: "hidden lines are, by convention, dotted"
- **MIT 2.007: section lining is cross-hatching for the cut area**
  - Source: Design Handbook: Engineering Drawing and Sketching | MIT OpenCourseWare. https://ocw.mit.edu/courses/2-007-design-and-manufacturing-i-spring-2009/pages/related-resources/drawing_and_sketching
  - Quote: "The diagonal lines on the section drawing are used to indicate the area that has been theoretically cut. These lines are called section lining or cross-hatching"
- **LibreTexts: section lines are thin continuous diagonal hatching**
  - Source: 3.2: Section Views - Engineering LibreTexts. https://eng.libretexts.org/Courses/Illinois_Institute_of_Technology/Introduction_to_Engineering_Drawing_and_Design/03%3A_Module_C_-__Auxiliary_views_section_views_isometric_and_oblique_projections/3.02%3A_Section_Views
  - Quote: "Section lines are thin, continuous diagonal hatch lines used to indicate surfaces that lie directly on the cutting plane."
- **LibreTexts: the cutting-plane line shows where the object is imagined cut and the direction of sight**
  - Source: 3.2: Section Views - Engineering LibreTexts. https://eng.libretexts.org/Courses/Illinois_Institute_of_Technology/Introduction_to_Engineering_Drawing_and_Design/03%3A_Module_C_-__Auxiliary_views_section_views_isometric_and_oblique_projections/3.02%3A_Section_Views
  - Quote: "The cutting plane line indicates the location where the object is imagined to be cut, while the arrowheads specify the direction of sight for viewing the resulting section."
- **LibreTexts: webs, ribs and spokes are not hatched even when cut**
  - Source: 3.2: Section Views - Engineering LibreTexts. https://eng.libretexts.org/Courses/Illinois_Institute_of_Technology/Introduction_to_Engineering_Drawing_and_Design/03%3A_Module_C_-__Auxiliary_views_section_views_isometric_and_oblique_projections/3.02%3A_Section_Views
  - Quote: "Webs, ribs, and spokes are not hatched in section views, even if they are cut by the cutting plane"
- **BTEC Unit 2 B1: what an orthographic projection must carry**
  - Source: Specification - Pearson BTEC Level 3 National Extended Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/spec-btec-nat-eng-extcert.pdf
  - Quote: "Attributes of orthographic projections, including: o geometry – shape of the component represented as different views, how the component is viewed from various angles, visibility of component features o dimensions – size of the component in defined units o tolerances – allowable variations for defined dimensions o material – what the component is to be made from o surface texture – surface quality required, e.g. roughness, flatness o scale – relative to actual dimensions."
- **Unit 16 guidance: first or third angle, understand both**
  - Source: Unit 16: Engineering Drawing for Technicians. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Electrical/Electronic-Engineering/2010/Specification/Unit_16_Engineering_Drawing_for_Technicians.pdf
  - Quote: "When deciding on a method of projection to use, either first or third angle can be chosen but there should be an understanding of the principles of both."
- **ISO 128-3: views, sections and cuts follow ISO 5456-2 projection methods**
  - Source: ISO 128-3:2022 Technical product documentation (TPD), General principles of representation, Part 3: Views, sections and cuts. https://www.iso.org/cms/live/live/en/sites/isoorg/contents/data/standard/08/33/83356.html
  - Quote: "This document specifies the general principles for presenting views, sections and cuts applicable to various kinds of technical drawings (e.g. mechanical, electrical, architectural, civil engineering), following the orthographic projection methods specified in ISO 5456-2."
- **City & Guilds Level 3 marine engineering: drawing scales and general arrangement drawings**
  - Source: Level 3 Diploma in Marine Engineering (Advanced) (2473-13). https://www.cityandguilds.com/-/media/productdocuments/transport_maintenance/marine/2473/level_3/centre_documents/2473-13-l3-diploma-in-marine-engineering-qualification-handbook-pdf.pdf
  - Quote: "2.2 explain how to use drawing scales 2.3 identify boat terms from drawings and specifications 2.4 explain how to extract information from lines plans, construction and general arrangement drawings 2.5 identify diagrams, schematics and symbology used in performing marine engineering activities"
My reading: the six things to read on a drawing are the views and how they are laid out (first angle, with third angle named),
the line types (visible solid, hidden dashed, centre long-short-long, with precedence when they overlap), sections and hatching
(a thin diagonal hatch for the cut area, with webs and ribs left unhatched even when cut), dimensions and tolerances, scale, and the
title block with its revisions. Pearson's Unit 2 B1 list is the checklist. The projection symbol tells you which angle: the first
and third angle methods were once called methods E and A (ISO 128-3 introduction; UNCONFIRMED, not held by the check), and the
symbol must be read before any view is, because a view in the wrong place is the commonest slip (section 6).

### Lesson 9. Reading one you have never seen, then mixed puzzles
- **DOE-HDBK-1016: reading prints is learned by repetition**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "The ability to read and understand prints is achieved through the repetitive reading of prints."
- **DOE-HDBK-1016: the objective is components and flowpaths for a valve lineup**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "IDENTIFY components and DETERMINE the flowpath(s) for a given valve lineup."
- **DOE-HDBK-1016 exercise: which valves must change position for a pump to supply only some points**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "Which valves would need to change position in order for Pump B to supply flow to only points G and H?"
- **Unit 16 guidance: a structure to work to when interpreting drawings**
  - Source: Unit 16: Engineering Drawing for Technicians. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Electrical/Electronic-Engineering/2010/Specification/Unit_16_Engineering_Drawing_for_Technicians.pdf
  - Quote: "Care should be taken when delivering learning outcome 2 because there is a huge amount of information relating to drawing standards and learners will need to be given a structure to work to when being asked to interpret drawings."
- **Unit 16 assignment: read a drawing and report its key features to a colleague**
  - Source: Unit 16: Engineering Drawing for Technicians. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Electrical/Electronic-Engineering/2010/Specification/Unit_16_Engineering_Drawing_for_Technicians.pdf
  - Quote: "Learners have to read and interpret an engineering drawing in order to report the key features of the component, circuit or assembly to a colleague."
- **USCG assessment guideline for A-III/6: one-line diagram and control system diagram**
  - Source: Assessment Guidelines for STCW Code TABLE A-III/6 Electro-Technical Officer. https://downloads.regulations.gov/USCG-2012-0980-0003/attachment_1.pdf
  - Quote: "Correctly interpret a ship’s One Line diagram."
- **NVIC assessment: use manufacturer drawings and schematics to couple and disconnect switchboards**
  - Source: Guidelines for Qualifications for STCW Endorsements As Electro-Technical Officer (NVIC 23-14). https://media.defense.gov/2017/Jul/14/2001777751/-1/-1/0/NVIC-23-14.PDF
  - Quote: "using manufacturer’s drawings, schematics and instructions for coupling and disconnecting switchboards and distribution panels"
- **HSG253: failing to check the diagram against the plant is a named human failure**
  - Source: The safe isolation of plant and equipment (HSG253). https://www.hse.gov.uk/PUBNS/priced/hsg253.pdf
  - Quote: "failure to check P&IDs/schematic diagrams against the actual installed plant"
My reading: DOE's own objective is the method: identify the components and determine the flowpath(s) for a given valve lineup, and its exercise asks the
what-if question the lesson wants, which valves would need to change position for one pump to supply flow to only some of the points. Unit 16's note says learners will need to be given a structure to work to when interpreting a drawing; the structure for
lesson 9 is: find the legend; find the sources and the sinks; find the normal state; trace one path at a time; say what is
changed in the what-if and what stops and what still runs. HSG253 names failing to check the diagram against the actual plant as
a human failure, so the last puzzle in the course asks Dan to spot a place where the drawing and the plant could differ.

---

## 5. Prerequisites: what this topic leans on, what Dan has, what is taught inline

My reading, from the course list and the briefs of the built courses. Dan has: the maths in the course list, and all of them are
used lightly; Scientific thinking (predict, play, explain); Heat and fluids (pressure in liquids, pipes and head, pump power, and
where a pump settles on its curve with the system curve); Mechanics and materials (forces, moments, hydraulic force as force over
area); Motors (the DOL starter as a live circuit, with its latching contact, no-volt protection and the overload contact);
Generators and paralleling (generators, synchronising, load sharing); Insulated systems and earth faults (IT systems, the
first and second fault, insulation monitoring, insulated DC); AC circuits (three-phase, star and delta); Batteries; Design and
verification (BS 7671 design and verification and the installation circuit diagrams he already reads); Electronics and power
electronics (AC/DC conversion).

| This course needs | Where Dan has it | Taught inline here |
|---|---|---|
| Three-phase as one line, voltage levels, transformers | AC circuits, Generators and paralleling | One sentence on what the single line stands for |
| Isolating and what opens to make a load safe | Design and verification, Insulated systems (an IT system is isolated at all poles: the Electrical Safety First guide says so; UNCONFIRMED here, not held by the check) | The isolation question on a single-line, and what a bus-tie changes |
| A contactor, auxiliary contacts, a latched start and a stop | Motors (the DOL starter) | Only how the drawing says it: coil and contact apart, shelf state, cross-references, rungs |
| Pressure, force over area, head, pump duty | Heat and fluids, Mechanics and materials | Not taught; used qualitatively when tracing oil and air |
| A valve, a cylinder, a pump as parts | Heat and fluids (pumps); no course for valves or cylinders | The function of each, from its symbol only; how they work and are sized is the later Hydraulics and pneumatics course |
| Views of a solid, a grid, a scale | Geometry fundamentals, The coordinate plane, Proportional reasoning | First and third angle, line types, sections, dimensions and title blocks |
| The habit of predicting before checking | Scientific thinking | Used in every opening puzzle |

Taught inline because nothing has built it: the symbols and their families (IEC, ISO), the normal-state rule in all four forms,
reference designations and tags in outline, the ladder-diagram way of drawing, the box-per-position valve symbol, instrument
bubbles and tag letters in outline, first-angle projection, and the method of lesson 9. Deferred, with where it goes: finding a
fault from a symptom (Fault-finding: from symptom to cause, Electrical shelf, planned: it uses these diagrams); how the parts
work and are sized (Hydraulics and pneumatics, same folder, not yet planned); Moody diagrams, loss calculations and valve sizing
(heat and fluids and the Level 3 course); making drawings and CAD (not Dan's need).

---

## 6. Misconceptions and learning science, for each skill

### 6.1 A diagram is a map of connection, not a picture
- **Bitesize: a circuit diagram does not show what the circuit looks like**
  - Source: Circuit symbols - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/znm6nk7
  - Quote: "It doesn't show what the circuit actually looks like, or how long all the connections are."
- **Bitesize: a picture of the parts is not a circuit diagram**
  - Source: Circuit symbols - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/znm6nk7
  - Quote: "This shows what the previous circuit diagram describes: a battery connected to two bulbs and a switch. This is not a circuit diagram."
- **Bitesize: straight wires so you can see what is connected to what**
  - Source: Circuit symbols - Series and parallel circuits - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z64dwty/revision/2
  - Quote: "Do not be tempted to make them wiggly because the whole point is to make it easier to see what is connected to what."
- **Engelhardt and Beichner: students read circuit diagrams as pipes carrying a fluid**
  - Source: Students understanding of direct current resistive electrical circuits. https://web.phys.ksu.edu/papers/2004/englehardt-beichner-ajp-1-04.pdf
  - Quote: "Research reveals that students view these diagrams as a system of pipes within which flows a fluid that they refer to as electricity."
- **Engelhardt and Beichner: topological errors, looking at surface features (hyphens as in the PDF text)**
  - Source: Students understanding of direct current resistive electrical circuits. https://web.phys.ksu.edu/papers/2004/englehardt-beichner-ajp-1-04.pdf
  - Quote: "The topological errors indi- cated that students looked at the surface features of the cir- cuit."
- **Corter et al.: learn to suppress inferences from how far apart nodes are drawn**
  - Source: Using Diagrams to Design Information Systems (Corter et al., Cognitive Science Society 2008). https://web.stevens.edu/jnickerson/corterCogSci2008.pdf
  - Quote: "In order to successfully create and interpret systems diagrams, students and practitioners must learn to suppress conscious or unconscious inferences based on Euclidean properties of diagrams, such as the planar distances among nodes, and learn to rely instead on properties of graphs: diagrams composed of nodes and edges."
- **Corter et al.: two biases in reading diagrams, sequential and reading order**
  - Source: Using Diagrams to Design Information Systems (Corter et al., Cognitive Science Society 2008). https://web.stevens.edu/jnickerson/corterCogSci2008.pdf
  - Quote: "We found that students of systems design have difficulties interpreting diagrams, revealing two biases: a sequential bias and a reading order bias."
- **Corter et al.: diagrams are read in sequence, in reading order when there is no natural start**
  - Source: Using Diagrams to Design Information Systems (Corter et al., Cognitive Science Society 2008). https://web.stevens.edu/jnickerson/corterCogSci2008.pdf
  - Quote: "When there is a natural beginning, diagrams are “read” from there, but when there is not a natural beginning, diagrams tend to be scanned in reading order, in Western languages from left to right and top to bottom"
- **Marshall: even after teaching, students read circuit diagrams as literal layout**
  - Source: Students’ Creation and Interpretation of Circuit Diagrams. https://ejrsme.icrsme.com/article/download/7775/5542
  - Quote: "Even after traditional instruction at the college level, students often have difficulty in interpreting standard circuit diagrams as abstract representations of the electrical connections between elements in a circuit as opposed to literal representations of the physical layout of an actual circuit"
- **Marshall: a circuit diagram shows that connections exist but not how they are made physically**
  - Source: Students’ Creation and Interpretation of Circuit Diagrams. https://ejrsme.icrsme.com/article/download/7775/5542
  - Quote: "Indeed, a fundamental characteristic of circuit diagrams is that they show _that_ electrical connections exist but not _how_ they are made physically"
- **Marshall: with the high voltage rail on top, moving down the page is moving down in voltage**
  - Source: Students’ Creation and Interpretation of Circuit Diagrams. https://ejrsme.icrsme.com/article/download/7775/5542
  - Quote: "With the high voltage line oriented at the top of the diagram, moving down the page corresponds to moving down in voltage."
- **Marshall: an experienced electronics technician expected diagrams to put high voltage at the top**
  - Source: Students’ Creation and Interpretation of Circuit Diagrams. https://ejrsme.icrsme.com/article/download/7775/5542
  - Quote: "He is used to diagrams that are organized based on voltage."
- **DesPortes et al.: sequential reasoning shows up more with physical circuits than diagrams**
  - Source: Circuit diagrams vs. physical circuits: The effect of representational forms during assessment. https://www.computer.org/csdl/proceedings-article/fie/2016/07757381/12OmNAXxXkp
  - Quote: "students exhibited the misconception of sequential reasoning more prevalently in the physical circuit assessment than the diagram assessment."
- **Fredette and Clement: students leave shorting wires off a circuit diagram**
  - Source: Toward a Scientific Practice of Science Education (Herron, citing Fredette and Clement 1981). https://ipa-pasca.unpak.ac.id/pdf/bahan_ajar/2024/Toward%20a%20Scientific%20Practice%20of%20Science%20Education.pdf (SECONDARY)
  - Quote: "The students seemed to think that shorting wires do not merit inclusion in a circuit diagram because they "don't really do anything."
- **Engelhardt and Beichner: the topology error, parts lined up are taken to be in series**
  - Source: Students understanding of direct current resistive electrical circuits. https://web.phys.ksu.edu/papers/2004/englehardt-beichner-ajp-1-04.pdf
  - Quote: "Topology All resistors lined up in series are in series whether there is a junction or not. All resistors lined up geometrically in parallel are in parallel even if a battery is contained within a branch"
- **Engelhardt and Beichner: series and parallel are hard to identify in a diagram (hyphen as in the PDF text)**
  - Source: Students understanding of direct current resistive electrical circuits. https://web.phys.ksu.edu/papers/2004/englehardt-beichner-ajp-1-04.pdf
  - Quote: "Students have diffi- culty identifying series and parallel connections in diagrams."
- **Engelhardt and Beichner: translating from picture to schematic was easier than the other way round**
  - Source: Students understanding of direct current resistive electrical circuits. https://web.phys.ksu.edu/papers/2004/englehardt-beichner-ajp-1-04.pdf
  - Quote: "On both versions of DIRECT, students were able to trans- late from a realistic representation of a circuit to the sche- matic, but had more difficulty in identifying the correct sche- matic from a written description of the circuit or in identifying the correct realistic representation of a circuit from a schematic."
My reading: the literature says four distinct slips. (1) Reading the drawing as a picture, so distance and position are taken for
meaning (Marshall; Corter: planar distances; Engelhardt and Beichner: topology errors, parts lined up are taken to be in
series). (2) Reading the wires as pipes with a fluid in them (Engelhardt and Beichner). (3) Reading in one order only: students
follow the lines as paths and list the intervening nodes, and miss paths that run against reading order (Corter's sequential and
reading-order biases). (4) Leaving out a part because it does not seem to do anything, such as a shorting wire (Fredette and
Clement, via Herron; SECONDARY): for Dan, a bypass, a link or a normally open bus-tie that is not drawn "does something" the
moment it closes. The fixes the sources suggest: match unusual layouts to conventional ones (Marshall's curriculum), teach more
than one diagram type for the same system (Corter), and ask students to translate in both directions, because translating from a
picture to a schematic was easier than from a schematic to a picture (Engelhardt and Beichner).

### 6.2 Symbols, orientation and basic placement
- **Edexcel examiner report: not knowing the symbols cost marks, especially the variable resistor**
  - Source: Examiners’ Report Principal Examiner Feedback November 2020 (Pearson Edexcel International GCSE Physics). https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Physics/2017/exam-materials/4PH1_1P_pef_20210211.pdf
  - Quote: "Many students struggled with Q5(a) due to not knowing the correct circuit symbols for the given components. This was especially true for the variable resistor."
- **Edexcel examiner report: voltmeter put in series, or across the wrong component**
  - Source: Examiners’ Report Principal Examiner Feedback January 2021 (Pearson Edexcel International GCSE Physics). https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Physics/2017/exam-materials/4PH1_1PR_pef_20210304.pdf
  - Quote: "Common errors were to put the voltmeter in series with the variable resistor or across the fixed resistor."
- **Edexcel examiner report: all components drawn in one series loop**
  - Source: Examiners’ Report Principal Examiner Feedback November 2020 (Pearson Edexcel International GCSE Physics). https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Physics/2017/exam-materials/4PH1_1P_pef_20210211.pdf
  - Quote: "A number of other students also lost marks by drawing all the components on the same series loop, rather than the voltmeter being connected in parallel with component X."
- **Edexcel examiner report: component orientation (diode direction) rarely right**
  - Source: Examiners’ Report Paper 1PR January 2022 (Pearson Edexcel International GCSE Physics). https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Physics/2017/exam-materials/4ph1-1pr-pef-20220303.pdf
  - Quote: "A tiny proportion drew the LED in the correct orientation i.e. that allowed conventional current to pass through R1."
- **Bitesize: cell and battery symbols are confused**
  - Source: Circuit symbols - Series and parallel circuits - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z64dwty/revision/2
  - Quote: "In physics, each of these is actually called a cell."
- **Marshall: crossing lines with no dot are not connected**
  - Source: Students’ Creation and Interpretation of Circuit Diagrams. https://ejrsme.icrsme.com/article/download/7775/5542
  - Quote: "Students must also realize that lines that simply cross (as in the center of the diagram on the left) do not indicate an electrical connection unless they are marked with a small circle."
Edexcel (International GCSE Physics) examiners' reports name the common mistakes: not knowing the symbols (especially the variable
resistor), putting the voltmeter in series, or across the wrong component, drawing everything in one series loop, and drawing
a diode the wrong way round. The first two reports are for a younger level than Dan's, so the brief uses them only as the
list of named slips to design wrong answers from. Bitesize names a cell against a battery.

### 6.3 What the drawn state means, and what a symbol alone does not say
- **All About Circuits: the hardest part for people used to schematics is how relays are drawn**
  - Source: AC Motor Control Circuits Worksheet - AC Electric Circuits. https://www.allaboutcircuits.com/worksheets/ac-motor-control-circuits
  - Quote: "Perhaps the most challenging aspect of interpreting ladder diagrams, for people more familiar with electronic schematic diagrams, is how electromechanical relays are represented."
- **All About Circuits: students find coil and contact drawn apart confusing**
  - Source: Electromechanical Relay Logic Worksheet - Digital Circuits. https://www.allaboutcircuits.com/worksheets/electromechanical-relay-logic
  - Quote: "Many students find it confusing that relay contacts and coils need not be drawn next to one another in a ladder logic diagram, because it is so different from the schematic diagrams they are accustomed to."
- **DOE-HDBK-1016: globe and gate valves are often drawn with the same symbol**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "It shoud be noted that globe and gate valves will often be depicted by the same valve symbol. In such cases, information concerning the valve type may be conveyed by the component identification number or by the notes and legend section of the drawing; however, in many instances even that may not hold true."
- **DOE-HDBK-1016: the symbols alone do not say whether a signal opens or closes a valve**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "Note that the symbols alone in Figure 3 do not provide the reader with enough information to determine whether applying air pressure to the diaphragm opens or closes the process control valve, or whether energizing the solenoid pressurizes or vents the diaphragm."
- **DOE-HDBK-1016: a three-way valve may be drawn in the position it fails to, not its normal position**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "3-way valves are sometimes drawn in the position that they will fail to instead of always being drawn in their "normal" position. This will either be defined as the standard by the system of drawings or noted in some manner on the individual drawings."
- **e4training: a blocked centre still leaks, so a load can creep**
  - Source: Directional Valve Symbols | e4training. https://www.e4training.com/hyd_princip/symbol_directional1.php (SECONDARY)
  - Quote: "However, because this is a spool valve there will be some leakage between ports so the A and B lines may still be subject to experiencing different pressures and facilitating cylinder creep."
- **Hidraoil: detent, spring and proportional actuation must not be confused**
  - Source: Hydraulic symbols: guide, chart and PDF | Hidraoil Fluid Power. https://www.hidraoil.com/technical-resources/hydraulic-symbols (SECONDARY)
  - Quote: "Actuation symbols are added to the main element. A detent holds a position, while a spring may return the valve to another position. Proportional control differs from electrical on/off actuation; the functions must not be confused when reading a diagram."
My reading: the traps are all places where the symbol is true to its convention and still not the whole story: the coil and its
contacts are far apart (the instructor's own note, "Many students find it confusing"; the hardest part for people used to
electronic schematics); a normally closed contact is drawn closed while the plant runs; a globe and a gate valve can look the
same; a valve with an actuator does not say which way the signal moves it; a three-way valve may be drawn in its failed
position; a closed-centre spool valve still leaks. Each is a named wrong option in a puzzle.

### 6.4 Views of an object
- **Students struggle to imagine a 3D object from 2D orthographic views**
  - Source: Mixed Reality Tools in Engineering Drawing Course (ASEE). https://peer.asee.org/mixed-reality-tools-in-engineering-drawing-course.pdf
  - Quote: "some students have difficulty imagining objects as a three dimensional mental image from two dimensional orthographic views."
- **Students struggle to place views correctly in an orthographic layout**
  - Source: Investigating Use of Glass Box & Rotating Bowl to Teach Orthographic Views (IJERT). https://www.ijert.org/research/investigating-use-of-glass-box-rotating-bowl-to-teach-orthographic-views-IJERTV2IS4005.pdf
  - Quote: "students often struggle in correctly placing the individual views of the object within the orthographic layout so that the drawing can convey its full meaning."
- **Sorby et al.: spatial skill predicts success in engineering graphics**
  - Source: The role of spatial training in improving spatial and calculus performance in engineering students. https://www.sciencedirect.com/science/article/abs/pii/S1041608013000460
  - Quote: "Spatial skills have been found to be particularly important to success in engineering graphics."
- **Sorby: working with 3-D software alone did not improve spatial ability as much as sketching and projection**
  - Source: Spatial Abilities And Their Relationship To Computer Aided Design Instruction. https://peer.asee.org/spatial-abilities-and-their-relationship-to-computer-aided-design-instruction.pdf
  - Quote: "does not improve the spatial abilities of students by a significant amount when compared to the gains achieved by activities associated with traditional graphics instruction (i.e., sketching, orthographic projection, isometric drawing, etc.)."
My reading: the research is about first-year engineering students and the effect is on mental rotation, but the two practical
points carry over. Spatial skill is a significant predictor of success in engineering graphics, and training in sketching and
orthographic projection, not working with 3D software alone, is what moved the scores. The brief therefore has Dan pick the
view that matches an object (tapping) before he is asked to produce one, and teaches the layout of the views through the
unfolded glass box (MIT, UW) rather than by a rule to learn.

### 6.5 How to teach reading
- **Larkin and Simon: a diagram shows what a text leaves to be worked out**
  - Source: Why a Diagram is (Sometimes) Worth Ten Thousand Words. https://onlinelibrary.wiley.com/doi/10.1111/j.1551-6708.1987.tb00863.x
  - Quote: "Diagrammatic representations also typically display information that is only implicit in sentential representations and that therefore has to be computed, sometimes at great cost, to make it explicit for use."
- **Egan and Schwartz: skilled technicians chunk circuit drawings by function**
  - Source: Chunking in recall of symbolic drawings | Memory & Cognition. https://link.springer.com/article/10.3758/BF03197595
  - Quote: "Recall showed marked “chunking”, or grouping, by functional units similar to Chess Masters’ recall of chess positions."
- **Egan and Schwartz: the technicians' advantage vanished for randomly arranged symbols**
  - Source: Chunking in recall of symbolic drawings | Memory & Cognition. https://link.springer.com/article/10.3758/BF03197595
  - Quote: "In the second experiment skilled technicians were able to recall more than were novice subjects following a brief exposure of the drawings. This advantage did not hold for randomly arranged symbols."
- **Chandler and Sweller: put the text inside the diagram**
  - Source: The split-attention effect as a factor in the design of instruction. https://bpspsychub.onlinelibrary.wiley.com/doi/abs/10.1111/j.2044-8279.1992.tb01017.x
  - Quote: "Learners are often forced to split their attention between and mentally integrate disparate sources of information (e.g., text and diagrams) before the instructional material can be rendered intelligible."
- **Chandler and Sweller: physical integration of text and diagram can reduce load**
  - Source: The split-attention effect as a factor in the design of instruction. https://bpspsychub.onlinelibrary.wiley.com/doi/abs/10.1111/j.2044-8279.1992.tb01017.x
  - Quote: "Physical integration (e.g., combining text and diagrams) may reduce cognitive load and so facilitate learning."
- **DOE-HDBK-1016: reading prints is learned by repetition**
  - Source: Engineering Symbology, Prints, and Drawings, Module 2: Engineering Fluid Diagrams and Prints (DOE-HDBK-1016/1-93). https://www.online-pdh.com/file.php/221/CFD_SG.pdf (SECONDARY)
  - Quote: "The ability to read and understand prints is achieved through the repetitive reading of prints."
- **How Brilliant teaches: concrete diagrams first, then the formal notation**
  - Source: How Brilliant teaches math and helps understanding stick | Brilliant. https://brilliant.org/resources/choosing-brilliant/how-brilliant-teaches-math
  - Quote: "Brilliant starts with concrete diagrams, animations, computation, and objects learners can manipulate, then connects those experiences to formal notation."
My reading: four design rules, each from a source. (1) A diagram makes information explicit that text leaves implicit, so teach
the diagram's own inference rules ("if the valve is here, the oil goes there") and not only the symbols (Larkin and Simon; their
full text adds that learners who lack those rules find a diagram largely useless: SECONDARY, UNCONFIRMED here). (2) Skilled
technicians recall circuit drawings in functional chunks and the advantage vanishes for randomly arranged symbols (Egan and
Schwartz), so teach the chunks (a pump with its relief valve, a start-stop rung) as units, and show them in context. (3) Put
the explanation inside the diagram, next to the part it refers to, not in a separate caption (Chandler and Sweller). (4) Reading
is learnt by repeated reading (DOE), so the course gives many short traces, not a few long ones, and Brilliant's order, concrete
first and notation after, fits: each lesson opens with a puzzle he can feel his way through, then the rule.

---

## 7. Where it is used by an electrician going into marine engineering

**Isolating, and the drawing that says what to isolate.** Isolation is where a wrong diagram hurts most, and where an electrician
meets fluid power and pipework for the first time.
- **HSG85: isolating devices marked to show what they control**
  - Source: Electricity at work: Safe working practices HSG85. https://www.hse.gov.uk/PUBNS/priced/hsg85.pdf
  - Quote: "devices used for isolating circuits must be clearly marked to show their relationship to the equipment they control"
- **HSG85: isolation without disconnecting circuits that must keep running**
  - Source: Electricity at work: Safe working practices HSG85. https://www.hse.gov.uk/PUBNS/priced/hsg85.pdf
  - Quote: "switch disconnectors should be suitably located and arranged so that circuits and equipment can be isolated without disconnecting other circuits that are required to continue in service"
- **EECO: consult the one-line before shutting off the upstream breaker**
  - Source: How to Read a Single Line Diagram | EECO. https://eecoonline.com/inspire/how-to-read-a-single-line-diagram (SECONDARY)
  - Quote: "you need to consult the one-line diagram to be able to ensure you are shutting off the correct upstream breaker."
- **EECO: lock out the breaker that feeds the board**
  - Source: How to Read a Single Line Diagram | EECO. https://eecoonline.com/inspire/how-to-read-a-single-line-diagram (SECONDARY)
  - Quote: "we need to lock out tag out the breaker in SWGR 1 that feeds MSB 2."
- **EECO: keep one-lines up to date**
  - Source: How to Read a Single Line Diagram | EECO. https://eecoonline.com/inspire/how-to-read-a-single-line-diagram (SECONDARY)
  - Quote: "It is important to keep these one lines up to date as new gear is added, gear is removed, or changes are made."
- **Cobler: an out-of-date drawing makes someone isolate the wrong breaker**
  - Source: Single Line Diagram (SLD) Explained: How to Read One | Cobler. https://cobler.io/blog/how-to-read-single-line-diagram (SECONDARY)
  - Quote: "So someone isolates the breaker the drawing names, and the circuit is still live."
- **HSG253: accurate reference diagrams are needed to plan isolations**
  - Source: The safe isolation of plant and equipment (HSG253). https://files.engineering.com/files/a01e329a-ec1b-42f7-a8fb-7a3bb8ea235c/hsg253_safe_isolation.pdf (SECONDARY)
  - Quote: "Accurate reference information, kept updated to all plant modifications, is necessary for planning and implementing isolations."
- **HSG253: failing to check the diagram against the plant is a named human failure**
  - Source: The safe isolation of plant and equipment (HSG253). https://www.hse.gov.uk/PUBNS/priced/hsg253.pdf
  - Quote: "failure to check P&IDs/schematic diagrams against the actual installed plant"
- **HSG253 checklist: isolation points match the line diagram**
  - Source: The safe isolation of plant and equipment (HSG253). https://files.engineering.com/files/a01e329a-ec1b-42f7-a8fb-7a3bb8ea235c/hsg253_safe_isolation.pdf (SECONDARY)
  - Quote: "Are all isolation points identified on the plant and do they match the line diagram and isolation certificate?"
- **HSG253: tag numbers match the line diagrams**
  - Source: The safe isolation of plant and equipment (HSG253). https://files.engineering.com/files/a01e329a-ec1b-42f7-a8fb-7a3bb8ea235c/hsg253_safe_isolation.pdf (SECONDARY)
  - Quote: "Tag numbers should match the line diagrams in the isolation documentation."
- **HSE: isolate pressurised pipelines and lock off the isolating valves; release stored energy**
  - Source: Maintenance of work equipment - HSE. https://www.hse.gov.uk/work-equipment-machinery/maintenance.htm
  - Quote: "isolate plant and pipelines containing pressured fluid, gas, steam or hazardous material. Lock off isolating valves"
- **HSE: release stored air or hydraulic pressure**
  - Source: Maintenance of work equipment - HSE. https://www.hse.gov.uk/work-equipment-machinery/maintenance.htm
  - Quote: "release any stored energy, such as compressed air or hydraulic pressure that could cause the machine to move or cycle"
- **HSG253: hydraulic accumulators and pipework are depressurised**
  - Source: The safe isolation of plant and equipment (HSG253). https://files.engineering.com/files/a01e329a-ec1b-42f7-a8fb-7a3bb8ea235c/hsg253_safe_isolation.pdf (SECONDARY)
  - Quote: "hydraulic – accumulators and pressurised pipework should be depressurised;"
- **MSN 1860: safe isolation before personnel work on shipboard electrical systems**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "Safety requirements for working on shipboard electrical systems, including safe isolation of electrical equipment before personnel are permitted to work on such equipment;"
- **MSN 1860: compiling a switching plan to isolate a distribution fault**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "Compiling and implementing switching plan to isolate a HV distribution fault;"

**At sea, in merchant practice.**
- **MAIB: a closed isolation valve was not on the drawings, and the crew did not know its significance**
  - Source: Marine Accident Investigation Branch (MAIB) - Safety Digest 1/2002. https://assets.publishing.service.gov.uk/media/5e7df42be90e0706ead5f59a/2002-SD1-MAIBSafetyDigest.pdf
  - Quote: "the valve was not marked on the system's drawings, and those on board were unaware of its significance in isolating the expansion tank."
- **MAIB: plan the isolation and tag out**
  - Source: MAIB Safety Digest 2/2019. https://iims-media-library.s3.eu-west-2.amazonaws.com/wp-content/uploads/2019/10/20080812/2019-SD2-MAIBSafetyDigest.pdf (SECONDARY)
  - Quote: "the plan for isolating that part of the system requiring maintenance should be subject to a detailed plan and appropriate ‘tag out’ isolations."
Another case, seen but not held by the check (UNCONFIRMED, reported by IIMS from a US NTSB report): after a fatal engine room fire
during bunkering, investigators found the valve fitted in a diesel oil tank line was an angle stop check valve, not the angle
stop valve the vessel's fuel oil system drawing specified, and the report notes that vessel drawings carry piping symbols for valve types, sizes and functions. It is the best example of why the valve symbol and the tag must be read exactly.
- **A regulator expects fluid power schematics to ISO 1219**
  - Source: TRG 41 Fluid power safety systems. https://www.resources.nsw.gov.au/sites/default/files/2025-03/trg-41-fluid-power-safety-systems.pdf
  - Quote: "Designers should provide schematic diagrams that align with ISO 1219-2 (see also AS 2671 as appropriate). All hydraulic and pneumatic symbols should align with ISO 1219-1."
- **A regulator: clarify symbols with written descriptions where misreading could cause a hazard**
  - Source: TRG 41 Fluid power safety systems. https://www.resources.nsw.gov.au/sites/default/files/2025-03/trg-41-fluid-power-safety-systems.pdf
  - Quote: "The design should clarify the meaning of symbols with written descriptions where misinterpretation could create a hazard."
- **A regulator: component labels must cross-reference the circuit diagram**
  - Source: TRG 41 Fluid power safety systems. https://www.resources.nsw.gov.au/sites/default/files/2025-03/trg-41-fluid-power-safety-systems.pdf
  - Quote: "Systems component labels should enable clear cross referencing with the circuit diagram"

**In fault finding, which this course feeds.** The fault-finding course is planned, and uses these diagrams to find a fault from
a symptom. The sources for it: BTEC Unit 12 C3 names circuit diagrams, flow charts and isolation methods as fault finding aids
(UNCONFIRMED here, see 1.2); MSN 1860 lists detection of electrical malfunction, location of faults and measures to prevent damage.
- **MSN 1860: detection of electrical malfunction and fault location**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "Detection of electric mal function, location of faults and measures to prevent damage;"
- **MSN 1860: explain the electrical distribution system with drawing**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "ability to explain electrical distribution system with drawing/instructions"

---

## 8. Size: how many lessons the benchmarks spend, and which core supports nine

- Brilliant: Circuits is 31 lessons across seven levels; Digital Circuits 32; Scientific Thinking 40 (one of its six topics is
  electric circuits). None teaches reading diagrams as such.
- BTEC: Unit 12 is 60 guided learning hours and Unit 16 (the older drawing unit) 60. Unit 2 is a unit of the same size
  inside the mandatory core, of which drawing is one of three learning aims (My reading). Sixty guided hours is, at about
  one hour a lesson, more than nine lessons, but 60 GLH includes practical work, assignments and CAD time that this course
  does not have.
- My reading: nine lessons, one per idea, fits. The core that supports the nine is: ST0457 core (graphical expressions and
  symbols; drawings and documentation) with its Maritime Defence options (read, analyse and interpret engineering data, drawings
  and documentation); STCW A-III/1 and A-III/6 (electrical and electronic diagrams; piping, hydraulic and pneumatic diagrams;
  machinery drawings); and the BTEC Unit 2, 12 and 16 lines. In the order of the lessons: lesson 1 is ST0457's core and
  STCW's "interpretation"; lesson 2 and 3 are A-III/1 B2.6 and A-III/6; lessons 4 to 6 are A-III/1 C2.7 and Unit 12 B1;
  lesson 7 is ST0457 option 8 and the P&ID texts; lesson 8 is Unit 2 B1, Unit 16 and A-III/1 C2.6; lesson 9 is HSG253's
  checking of the diagram against the plant.
- The sizing hazard: nine lessons across four kinds leaves about two each. The sources suggest a merge, not a cut: lesson 1 and
  the first half of lesson 9 are one method taught twice, so lesson 1 can carry the rules and lesson 9 the practice; and
  lesson 2's and 3's electrical content is above what Dan already reads, so each is a short lesson of conventions, not of
  electrical theory.

---

## 9. Not found, or not confirmed

- A Brilliant course on reading diagrams, or on engineering drawing or fluid power: none exists in the course list (My reading).
- A public standard titled "Naval engineering technician": none found. ST1403 Maritime electrical fitter is the nearest.
- UNCONFIRMED (seen on a page, not held by the checker): BTEC Unit 12's content areas A1 to C3 as a list, its at-least-eight-components criterion, its fault finding aids line and its introduction's technician line; BTEC Unit 2's mandatory-core status; ISO 1219-3's title; the ISO 128-3 line on methods E and A; the Deskely and ElectricalFlux reference-designation and
  terminal-number lines; the DOE instrument identifier table and its valve-with-no-actuator and balloon-letters lines;
  Festo's lines on the closed-centre pneumatic valve and on the circuit diagram having no mechanical layout representation;
  the Larkin and Simon largely-useless line; the IIMS-reported NTSB valve case; HSG253's not-P&IDs line (a summary of it).
- Not retrieved: Parker and Eaton/Vickers symbol guides, NEETS, Engineering ToolBox P&ID pages, ISO 5456-2 and BS 8888 as texts.
- Mirrors and copy sites were avoided. Copies of originals are marked SECONDARY (Engineering Library's NAVEDTRA, the training-site copy
  of DOE-HDBK-1016, the college copy of Festo's textbook, the book copy of Herron on Fredette and Clement, the HSG253 copy).
  Vendor and blog pages (Galco, Viox, Electrician.wiki, Cobler, EECO, EEP, Hidraoil, e4training) are SECONDARY.
