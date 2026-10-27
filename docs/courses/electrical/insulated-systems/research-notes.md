# Insulated systems and earth faults: research notes

Researched 27 Oct 2026 for the Insulated systems and earth faults course brief (the first course in the Electrical
shelf's Supply systems folder; blurb "Why the first earth fault on an unearthed supply trips nothing, what an
insulation monitor reads, and how to find the fault."). Batteries follows it in the same folder and owns cells,
charging and hydrogen. The brief itself is not written here; these notes are its evidence. Dan is an electrician and a
Royal Navy submariner on the electrical engineering path; next year he does a Level 3 marine engineering course. He
asked for foundations that see him through any new topic, not a remake of that course.

Every finding has its source title, URL and the exact words, cut by script from a saved tool result (the quotes were
not retyped into this file). All of them are listed in quotes.json beside this file and were checked with
node tools/eval/sources.mjs --quotes ... --tools ... (failed: 0). The tool files are in tools/.
Findings I could not confirm are marked **UNCONFIRMED**; where only a copy, a reseller, a blog or an exam-prep site
showed the words, the line says **SECONDARY** and names the kind of host. My own readings and sums are marked "My reading"
or "computed" and are not quotes. A quote with " ... " is never joined across a gap: each is one run of the page's text.
A few lines carry stray marks from the page's own markdown or from OCR (for example the IMarEST paper's "p.F" is the
micro-farad sign); I left them as the page has them.

Kept out on purpose: nothing here is about how the Royal Navy or any particular boat does it, nothing goes beyond
CLAUDE.md's public outline of a submarine's plant, and nothing comes from Dan's SMQ books. Every example below is from
public, general marine or industrial equipment. Where a source says "warships" or "navy" in passing I did not use it.

## 0. The short answer

1. **No Brilliant course covers this ground.** Brilliant's only electricity course left is Circuits (31 lessons, 7 levels,
   bulbs and series and parallel). It stops at voltage and power. The nearest public "course" on earthing systems is a
   manufacturer's technical guide, and four of them are good enough to follow as a syllabus: Schneider's Cahier technique
   no. 178 "The IT earthing system (unearthed neutral) in LV", Schneider's Electrical Installation Guide pages on the IT
   system, Bender's IT-system know-how pages, and Bender's "Technical aspects IT systems" booklet (section 1).
2. **They all run in nearly the same order**: what an IT system is, the first fault (a small current, the healthy phases
   at line voltage to earth), watching the insulation, finding the fault, the second fault, then the special features
   (overvoltages, drives and filters, limits of size). Dan's scope puts the second fault before the monitoring, which
   is a defensible change, because the second fault is the reason the monitoring exists (sections 1.3, 2.1, 8).
3. **The key physics is one line**: an "insulated" system is earthed through the capacitance of its own cables and
   filters, and the first-fault current is about 3 x omega x C x (phase voltage) (my computed rule, section 4.3). The published values agree with it
   (section 4.3: marine LV 1 to 5 micro-farad per phase gives 0.3 to 1.5 A; Schneider's table; Eaton's 480 V example).
4. **The rules are plain**: class and flag rules require a device on every insulated distribution system that monitors
   insulation continuously and alarms (section 2.3); IEC 60364-4-41 says the first fault must be indicated and should be
   cleared with the shortest practicable delay (section 2.2).
5. **Alarm levels in ohms per volt do not agree**, and that is itself worth teaching: a class rule (GL) says 50 ohms per
   volt, Bender's booklet says about 100, a Bender white paper calls 500 typical, and IEC 61557-8 leaves the response value
   to the manufacturer (section 4.5).
6. **Trade lines exist but are short**: STCW A-III/6 and A-III/1 "Detection of electric malfunction, location of faults and
   measures to prevent damage"; the MCA's ETO oral syllabus "knowledge of earthing systems and earth fault finding
   procedures"; the marine electrician standard (ST0808); Pearson HN Unit 31 (section 3).
7. **Dan's BS 7671 qualifications start below this**: the public EAL spec says "Cover: TN-S, TNC-S, and TT" and "Awareness
   only of other earthing systems in BS 7671 (such as IT in an operating theatre)" (section 3.5).
8. **Two points are contested and should be taught as contested**: how large the overvoltages from an arcing earth fault
   get on a real low-voltage system (Eaton says a few times to over 1,200 V measured on 480 V plants; the IMarEST paper
   says marine systems are heavily damped), and Bender's claim that arcing faults "do not occur" on an IT system with
   monitoring (section 4.8).
9. **Misconceptions are well documented for the basics and thinly for IT systems themselves**: the sources are
   examiner reports (WJEC, Edexcel), IOPSpark's research reviews, and engineering white papers that name the myths
   (section 6). AQA and OCR examiner reports on earthing were not found.
10. **Eight lessons are supported** by the sources, each of the eight scope parts by at least two independent ones
    (section 8).

**Best sources, in the order I would give them to the brief writer** (about sixteen of the roughly hundred pages used):
1. Schneider Cahier technique 178 (download.se.com, ECT178). 2. Schneider Electrical Installation Guide, IT system pages
(electrical-installation.org). 3. Bender, Technical aspects IT systems (fournais-bender.dk). 4. Bender UK, IT-system
know-how pages (bender-uk.com). 5. Eaton, Characteristics of different power systems neutral grounding techniques:
fact and fiction. 6. Eaton, Transient overvoltages on ungrounded systems from intermittent ground faults.
7. IMarEST, Neutral earthing of marine electrical power systems (1982, Ball and Stephens). 8. IEC 60364-4-41 text (sample
pages), IEC 61557-8 and -9 titles and scopes. 9. Lloyd's Register rule summary, GL rules, Indian Register guidelines (2024).
10. MCA MSIS 27 chapter 6 and MGN 628. 11. STCW Table A-III/6 and A-III/1. 12. MCA MSN 1860 (ETO oral syllabus).
13. IfATE ST0808 Marine electrician and ST0457 Engineering technician. 14. Pearson HN Engineering Unit 31 Electrical Systems
and Fault Finding. 15. IET Wiring Matters (earthing; IT systems in railways) and the EAL Level 3 specification.
16. Vertiv (Battcon) ground-detection circuits for DC buses, the US patent background on the balanced bridge, and the IEEE
battery-committee symposium slides.


## 1. Benchmark

### 1.1 Brilliant: Circuits, the only electricity course left on brilliant.org

Brilliant's course page is brilliant.org/courses/circuits/ (the course is **31 lessons and 334 exercises in 7 levels**, so a
small course). The levels, in order: Level 1 Circuits (Current Loops, Short Circuits, Choosing Bulbs, Splitting Current),
Level 2 Current, Level 3 Voltage, Level 4 Power and Resistance, Level 5 Circuit Analysis, Level 6 Comparing Power,
Level 7 Analyzing Voltage; levels 1 to 4 end in a Level Review. The exact lesson titles are in the two level quotes below.
Brilliant has no earthing, no AC, no capacitor and no insulation lesson in this listing. The page gives titles only; I did
not open a lesson, so what is inside each one is **UNCONFIRMED**. The search showed no other Brilliant electricity or
circuits course (Digital Circuits is logic gates).

- **Brilliant's Circuits is 31 lessons and 334 exercises**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits/
  - Quote: "Explore the physics behind electricity. 31 Lessons 334 Exercises"

- **Levels 1 to 4: circuits, current, voltage, power and resistance**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits/
  - Quote: "Level 1 Circuits Current Loops Short Circuits Choosing Bulbs Splitting Current Level Review ### Level 2 Current The Path of Least Resistance Bulb Brightness Changing Current Different Bulbs Conserving Current Level Review ### Level 3 Voltage Voltage Measuring Voltage Voltage Around Paths Branched Voltage Level Review ### Level 4 Power and Resistance Power and Brightness Deducing Power Resistance Solving for Resistance Level Review"

- **Levels 5 to 7: circuit analysis, comparing power, analysing voltage**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits/
  - Quote: "Level 5 Circuit Analysis Predicting Current Controlling Current Combining Resistance Dividing Resistance Total Resistance Voltage and Resistance ### Level 6 Comparing Power Resistance and Brightness Relative Resistance Sharing Amps and Volts Parallel Volt Shares Power and Bulb Pairs ### Level 7 Analyzing Voltage Subtracting Volts Comparing Points Bulbs with Voltage"

- **Brilliant's description**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits/
  - Quote: "Build an intuitive understanding of how electric circuits work, and the underlying concepts of current, voltage, resistance and power."

- **Brilliant's topics covered**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits/
  - Quote: "Topics covered * Current * Voltage * Resistance * Power * Series and Parallel Circuits"

- **It assumes no prior knowledge**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits/
  - Quote: "This course assumes no prior knowledge and teaches the key ideas needed to understand electricity and electric circuits, with some fun puzzles to solve along the way."

My reading: Brilliant is useful here only for its manner (puzzles with bulbs, a review at the end of a level) and as proof
that nothing at that level reaches IT systems. Dan is far past it: his built courses already cover current, voltage, power,
three-phase and capacitance, so Brilliant gives no content to follow.


### 1.2 Where Circuits sits in Brilliant

Circuits is in the Science band, which Brilliant's Science page lists as Scientific Thinking, Circuits, Digital Circuits and
Quantum Computing. It assumes no prior knowledge. Brilliant's help page says courses, levels and lessons are being renamed
topics, units and concepts, so the page address and wording may change ("Pages move").

- **Circuits sits in Brilliant's Science band, between Scientific Thinking and Digital Circuits**
  - Source: Brilliant | The Smartest Way to Learn Science. https://brilliant.org/science
  - Quote: "Science: Covered topics * Scientific Thinking * Circuits * Digital Circuits * Quantum Computing"

- **Brilliant's next circuits course is Digital Circuits (logic gates)**
  - Source: Practice Digital Circuits | Brilliant. https://brilliant.org/courses/digital-circuits/?from_llp=science
  - Quote: "Build simple computers out of logic gates. 32 Lessons 336 Exercises"

- **Brilliant has renamed courses, levels and lessons (pages move)**
  - Source: What are Learning Paths? | Brilliant. https://brilliant.org/help/features/what-are-learning-paths/
  - Quote: "courses are now topics, levels are units, and lessons are concepts."


### 1.3 The nearest public courses on earthing systems and IT systems

No manufacturer course with a numbered lesson list on insulated systems was reachable. The nearest are four documents that read
as courses, and they are what the brief should benchmark. **Bender UK's IT-system know-how section** has nine pages, in this
order: Comparison of system types, Advantages of the IT system, Insulation monitoring, Insulation fault locator, Insulation
fault location in coupled systems, Examples of application, Control circuits, Insulation resistance - testing, measuring,
monitoring, IT systems as reflected in the standards (the first quote below). **Schneider's Cahier technique 178** is a
paper of about 26 pages with six numbered chapters: 1 Introduction (1.2 the standardised earthing systems, 1.4 type of insulation),
2 The 1st insulation fault (2.1 fault currents and contact voltage, 2.2 permanent insulation monitors, 2.3 tracking the
first fault), 3 The 2nd insulation fault (3.2 elimination), 4 Special features (4.1 overvoltages, 4.2 surge limiters, 4.3 why use
an impedance), 5 the IT system's value (5.1 availability, 5.2 fire, 5.3 control circuits, 5.4 restrictions) and 6 Conclusion.
**Bender's Technical aspects IT systems** booklet runs: availability of electrical energy, behaviour at a first fault,
insulation monitoring devices, application examples, insulation fault location.
Both vendors sell insulation monitors, so they lean to the IT system; the Electrical Installation Guide pages (section 2.1)
and the standards (2.2) check them. Bender and the IET both run talks and seminars; their outlines are **UNCONFIRMED**.

- **Bender UK's IT-System know-how pages, in the site's order**
  - Source: IT-System. https://www.bender-uk.com/know-how/technology/it-system/
  - Quote: "* Comparison of system types * Advantages of the IT system * Insulation monitoring * Insulation fault locator * Insulation fault location in coupled systems * Examples of application * Control circuits * Insulation resistance - testing, measuring, monitoring * IT systems as reflected in the standards"

- **The Bender section is titled as a course on availability**
  - Source: IT-System. https://www.bender-uk.com/know-how/technology/it-system/
  - Quote: "IT system: Unearthed systems for maximum availability"

- **Bender: the key feature of an unearthed system**
  - Source: IT-System. https://www.bender-uk.com/know-how/technology/it-system/
  - Quote: "The result is a low fault current the size of which depends on the insulation resistances and the capacitance of the conductors and system components to earth."

- **Bender: why the IT system has been rarely used**
  - Source: IT-System. https://www.bender-uk.com/know-how/technology/it-system/
  - Quote: "To date, the unearthed system is mainly used in safety-critical applications, such as intensive care units or railway signalling technology, where a failure of the power supply would have disastrous consequences. Outside these special areas, this system type is not very common in practice, even though the IT system offers numerous advantages not only in terms of safety but also availability."

- **Schneider Cahier technique 178, chapters 2.1 to 2.3**
  - Source: The IT earthing system (unearthed neutral) in LV. https://download.se.com/files?amp&p_Doc_Ref=ECT178
  - Quote: "Contents 2 The 1 st insulation fault with the 2.1 Calculating fault currents and contact voltage p. 9 IT earthing system on the first fault 2.2 Permanent insulation monitors, history and principles p. 11 2.3 Tracking the 1 st insulation fault p. 13"

- **Cahier 178, chapter 3**
  - Source: The IT earthing system (unearthed neutral) in LV. https://download.se.com/files?amp&p_Doc_Ref=ECT178
  - Quote: "## 3 The 2 nd insulation fault with the IT earthing system"

- **Cahier 178, chapter 4.1**
  - Source: The IT earthing system (unearthed neutral) in LV. https://download.se.com/files?amp&p_Doc_Ref=ECT178
  - Quote: "4.1 Overvoltages in the IT system"

- **Cahier 178, chapter 4.2**
  - Source: The IT earthing system (unearthed neutral) in LV. https://download.se.com/files?amp&p_Doc_Ref=ECT178
  - Quote: "4.2 Surge limiters"

- **Cahier 178, chapter 4.3**
  - Source: The IT earthing system (unearthed neutral) in LV. https://download.se.com/files?amp&p_Doc_Ref=ECT178
  - Quote: "4.3 Why use an impedance?"

- **Cahier 178, chapter 5.1**
  - Source: The IT earthing system (unearthed neutral) in LV. https://download.se.com/files?amp&p_Doc_Ref=ECT178
  - Quote: "5.1 Increased availability"

- **Cahier 178, chapter 5.4**
  - Source: The IT earthing system (unearthed neutral) in LV. https://download.se.com/files?amp&p_Doc_Ref=ECT178
  - Quote: "5.4 Restrictions and precautions for using the IT earthing system"

- **Bender's technical-aspects booklet opens on availability**
  - Source: Technical aspects IT systems. https://fournais-bender.dk/storage/TechnAspects-IT-systems.pdf
  - Quote: "Technical aspects IT systems ## Availability of electrical energy"

- **Booklet heading: behaviour at a first fault**
  - Source: Technical aspects IT systems. https://fournais-bender.dk/storage/TechnAspects-IT-systems.pdf
  - Quote: "Behaviour of the system forms in the event of a first fault"

- **Booklet heading: insulation monitoring devices**
  - Source: Technical aspects IT systems. https://fournais-bender.dk/storage/TechnAspects-IT-systems.pdf
  - Quote: "Insulation monitoring devices (ISOMETER®)"

- **Booklet heading: application examples**
  - Source: Technical aspects IT systems. https://fournais-bender.dk/storage/TechnAspects-IT-systems.pdf
  - Quote: "Application examples Insulation monitoring"

- **Booklet heading: fault location systems**
  - Source: Technical aspects IT systems. https://fournais-bender.dk/storage/TechnAspects-IT-systems.pdf
  - Quote: "Use of insulation fault location systems"

- **Bender runs training courses and seminars on its test equipment (the outline is not public: UNCONFIRMED)**
  - Source: ISOMETER® iso685-D-P iso685W-D-P iso685-S-P iso685W-S-P. https://www.benderinc.com/fileadmin/content/Products/m/e/iso685-D-P_D00170_M_XXEN.pdf
  - Quote: "Bender is happy to provide training regarding the use of test equipment. The dates of training courses and workshops can be found on the Internet at www.bender-de.com -> Know-how -> Seminars."

- **IET talk (34 min, 2007) on insulation monitors in floating IT signalling power systems**
  - Source: Application and operation of insulation monitors in unearthed…. https://tv.theiet.org/video/application-and-operation-of-insulation-monitors-in-unearthed-floating-it-rail-signal-power-systems/d7cd744f-545d-4c5b-8f2f-844f99ca937d
  - Quote: "This talk explains the principles of operation of IMD and EDS systems and how their installation enables compliance with BS7671."

My reading, the order the benchmarks share: what an IT system is and why; the first fault (current, contact voltage, the
healthy phases at line voltage); the monitor (injection, thresholds); finding the fault (clamps and injected signals); the
second fault; special features and limits. None of the ones I read teaches the phasor picture or the capacitance sum step by step for a learner, which is
what Dan's AC circuits course lets this one do. None of them has a DC bus lesson beyond a paragraph or a slide set, which Dan's submarine
and shipboard work needs more of.


## 2. Other courses' order for the same ground

### 2.1 Schneider Electrical Installation Guide (electrical-installation.org)

The guide is a wiki, owned by Schneider Electric. Its chapter "Earthing schemes" runs Earthing connections; Definition of
standardised earthing schemes; Characteristics of TT, TN and IT systems; Selection criteria for the TT, TN and IT systems;
Choice of earthing method - implementation; Installation and measurements of earth electrodes (seen in the saved tool file as
a side menu; the menu's link markup stops it being quoted, so treat that exact list as **UNCONFIRMED** as a quote). Its
chapter F then has "Implementation of the IT system" in four pages: IT system - Principle; IT system - Fault protection;
IT system - Implementation of protections; IT system - Practical aspects. Two of those pages' contents are quoted first.

- **Schneider Electrical Installation Guide: the IT system page "Fault protection" contents**
  - Source: IT system - Fault protection - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/IT_system_-_Fault_protection
  - Quote: "# IT system - Fault protection ## Contents * 1 First fault situation * 2 Second fault situation * 3 Notes"

- **The IT system page "Practical aspects" contents**
  - Source: IT system - Practical aspects - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/IT_system_-_Practical_aspects
  - Quote: "# IT system - Practical aspects ## Contents * 1 Principle of earth-fault monitoring * 2 Examples of equipment * 3 Implementation of permanent insulation-monitoring (PIM) devices"

- **EIG: the basic feature of the IT system**
  - Source: IT system - Principle - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/IT_system_-_Principle
  - Quote: "The basic feature of IT earthing system is that, in the event of a fault between phases and earth, the system can continue to operate without interruption. Such a fault is referred to as a “first fault”."

- **EIG: what the IT system needs in practice**
  - Source: IT system - Principle - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/IT_system_-_Principle
  - Quote: "In practice, IT system requires certain specific measures for its satisfactory exploitation: * Permanent monitoring of the insulation with respect to earth, which must signal (audibly or visually) the occurrence of the first fault * A device for limiting the voltage which the neutral point of the supply transformer can reach with respect to earth * A “first-fault” location routine by an efficient maintenance staff. Fault location is greatly facilitated by automatic devices which are currently available. * Automatic high-speed tripping of appropriate circuit breakers must take place in the event of a “second fault” occurring before the first fault is repaired."

- **EIG: IT system, protection and operating technique**
  - Source: Characteristics of TT, TN and IT systems - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/Characteristics_of_TT,_TN_and_IT_systems
  - Quote: "## IT system * Protection technique: + Interconnection and earthing of exposed conductive parts + Interruption for the second fault using overcurrent protection (circuit-breakers or fuses) * Operating technique: + Monitoring of the first insulation fault + Mandatory location and clearing of the fault + Interruption for two simultaneous insulation faults"

- **EIG: IT system, main characteristics**
  - Source: Characteristics of TT, TN and IT systems - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/Characteristics_of_TT,_TN_and_IT_systems
  - Quote: "Solution offering the best continuity of service during operation * Indication of the first insulation fault, followed by mandatory location and clearing, ensures systematic prevention of supply outages * Generally used in installations supplied by a private MV/LV or LV/LV transformer * Requires maintenance personnel for monitoring and operation"

- **EIG: the IT system needs a high level of insulation**
  - Source: Characteristics of TT, TN and IT systems - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/Characteristics_of_TT,_TN_and_IT_systems
  - Quote: "Requires a high level of insulation in the network (implies breaking up the network if it is very large and the use of circuit-separation transformers to supply loads with high leakage currents)"

- **EIG: TN trips on the first fault**
  - Source: Characteristics of TT, TN and IT systems - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/Characteristics_of_TT,_TN_and_IT_systems
  - Quote: "## TN system * Technique for the protection of persons: + Interconnection and earthing of exposed conductive parts and the neutral are mandatory + Interruption for the first fault using overcurrent protection (circuit-breakers or fuses)"

My reading: this is the order a trained electrician expects, because it follows the BS 7671 pattern (describe the system, then
the protection for the first fault, then for the second). It is the best bridge from Dan's ADS knowledge: in TN the first fault
is a short circuit and the device trips; in IT the first fault is a few mA and nothing trips.


### 2.2 IEC 60364-4-41, IEC 61557-8 and IEC 61557-9 (titles and scopes only; no tables)

IEC 60364-4-41 (Low-voltage electrical installations, protection against electric shock) is the shock-protection part, with the IT
rules in 411.6. IEC 61557-8 is the product standard for insulation monitoring devices in IT systems up to 1 000 V a.c. and
1 500 V d.c.; IEC 61557-9 is the product standard for insulation fault location systems. IEC 60092-201 is the ship installation
standard (system design) quoted in section 2.3. The standard texts below come from sample pages and the IEC webstore.

- **IEC 60364-4-41 title**
  - Source: IEC 60364-4-41:2005 | IEC. https://webstore.iec.ch/en/publication/1867
  - Quote: "Low-voltage electrical installations - Part 4-41: Protection for safety - Protection against electric shock"

- **IEC 61557-8 full title (IEC webstore corrigendum page)**
  - Source: IEC 61557-8:2014/COR1:2016 | IEC. https://webstore.iec.ch/en/publication/24904
  - Quote: "Electrical safety in low voltage distribution systems up to 1 000 V a.c. and 1 500 V d.c. - Equipment for testing, measuring or monitoring of protective measures - Part 8: Insulation monitoring devices for IT systems"

- **IEC 61557-8 scope (catalogue listing of the IEC text, SECONDARY)**
  - Source: CEI - IEC 61557-8:2014. https://mycatalogo.ceinorme.it/iec/item/iec_50424?sso=y [SECONDARY: a catalogue listing of the IEC text]
  - Quote: "IEC 61557-8:2014 specifies the requirements for insulation monitoring devices (IMD) which permanently monitor the insulation resistance RF to earth of unearthed a.c. IT systems, of a.c. IT systems with galvanically connected d.c. circuits having nominal voltages up to 1 000 V a.c., as well as of unearthed d.c. IT systems with voltages up to 1 500 V d.c. independent from the method of measuring."

- **IEC 61557-9 title**
  - Source: IEC 61557-9:2023 - IEC 61557-9:2023 CMV. https://cdn.standards.iteh.ai/samples/105391/5afea5375f40470a8dea4df39d94e1a4/IEC-61557-9-2023.pdf [SECONDARY: sample pages on a standards reseller]
  - Quote: "Part 9: Equipment for insulation fault location in IT systems"

- **IEC 61557-9 scope (sample pages hosted by a standards reseller, SECONDARY)**
  - Source: IEC 61557-9:2023 - IEC 61557-9:2023 CMV. https://cdn.standards.iteh.ai/samples/105391/5afea5375f40470a8dea4df39d94e1a4/IEC-61557-9-2023.pdf [SECONDARY: sample pages on a standards reseller]
  - Quote: "This part of IEC 61557 specifies the requirements for the insulation fault location system (IFLS) that localizes insulation faults in any part of the system in unearthed IT AC systems and unearthed IT AC systems with galvanically connected DC circuits having nominal voltages up to 1 000 V AC,"

- **IEC 60364-4-41, first fault of an IT system**
  - Source: cdn.standards.iteh.ai. https://cdn.standards.iteh.ai/samples/22593/faab23b5c332418984d5b3c627cbd1b0/IEC-60364-4-41-2005-AMD1-2017.pdf [SECONDARY: sample pages on a standards reseller]
  - Quote: "Where an IT system is designed not to disconnect in the event of first fault, the occurrence of the first fault shall be indicated by either: – an insulation monitoring device (IMD), which may be combined with an insulation fault location system (IFLS), or – a residual current monitor (RCM), provided the residual current is sufficiently high to be detected."

- **IEC 60364-4-41, the signal continues as long as the fault persists**
  - Source: cdn.standards.iteh.ai. https://cdn.standards.iteh.ai/samples/22593/faab23b5c332418984d5b3c627cbd1b0/IEC-60364-4-41-2005-AMD1-2017.pdf [SECONDARY: sample pages on a standards reseller]
  - Quote: "The device shall initiate an audible and/or visual signal which shall continue as long as the fault persists."

- **IEC 60364-4-41, the first fault is eliminated with the shortest practicable delay**
  - Source: cdn.standards.iteh.ai. https://cdn.standards.iteh.ai/samples/22593/faab23b5c332418984d5b3c627cbd1b0/IEC-60364-4-41-2005-AMD1-2017.pdf [SECONDARY: sample pages on a standards reseller]
  - Quote: "It is recommended that a first fault be eliminated with the shortest practicable delay."

- **IEC 60364-4-41, fault location system**
  - Source: cdn.standards.iteh.ai. https://cdn.standards.iteh.ai/samples/22593/faab23b5c332418984d5b3c627cbd1b0/IEC-60364-4-41-2005-AMD1-2017.pdf [SECONDARY: sample pages on a standards reseller]
  - Quote: "In addition, an insulation fault location system (IFLS) according to IEC 61557-9 may be provided to indicate the location of a first fault from a live part to exposed-conductive-parts or earth or another reference point."

- **IEC 60364-4-41: IT systems do not necessarily disconnect on the first fault**
  - Source: cdn.standards.iteh.ai. https://cdn.standards.iteh.ai/samples/22593/faab23b5c332418984d5b3c627cbd1b0/IEC-60364-4-41-2005-AMD1-2017.pdf [SECONDARY: sample pages on a standards reseller]
  - Quote: "NOTE For IT systems, automatic disconnection is not necessarily required on the occurrence of a first fault (see 411.6.1). For the requirements for disconnection in the event of a second fault, occurring on a different live conductor, see 411.6.3.2 following the rules of this subclause."

- **IEC 61557-8: the response value is declared by the manufacturer (SECONDARY: sample pages on a standards reseller)**
  - Source: cdn.standards.iteh.ai. https://cdn.standards.iteh.ai/samples/20603/fcb995a31b904502a6d57915c26ebd77/IEC-61557-8-2014.pdf [SECONDARY: sample pages on a standards reseller]
  - Quote: "an is the value declared by the manufacturer."

My reading: the standards give the course its vocabulary: IMD (monitor), IFLS (location system), RCM (residual current monitor), R_F
(the insulation resistance of the whole monitored system), and "first fault" and "second fault". Note 1 to the IEC 61557-8 definitions
says the response value is the manufacturer's declared value, so the standard does not fix an ohms-per-volt figure (section 4.5).


### 2.3 Marine classification and flag-state rules on insulated distribution

Four rule sets were reachable: Lloyd's Register (as a rule summary on imorules.com), GL (now part of DNV; the 2015 edition, as a
copy on a college site), the Indian Register of Shipping guidelines on earthing systems (2024, the issuer's own site), and the
MCA's surveyor instructions MSIS 27 chapter 6 and MGN 628. DNV, ABS, Bureau Veritas and IACS rule text were **not** fetched, so
their figures are **UNCONFIRMED**. The IEC 60092-201 and IEEE lines are as Bender quotes them in a brochure.

- **Lloyd's Register rule summary: a monitoring device on every insulated distribution system**
  - Source: imorules.com. https://www.imorules.com/GUID-4B81398D-2D57-4D1C-886B-C698037ABACF.html [SECONDARY: a rules-republishing site]
  - Quote: "5.4.2 A device(s) is to be installed for every insulated distribution system, whether primary or secondary, for power, heating and lighting circuits, to monitor continuously the insulation level to earth and to operate an alarm in the engine control room, or equivalent attended position, in the event of an abnormally low level of insulation resistance and/or high level of leakage current"

- **GL rules: every non-earthed system monitors insulation to the hull**
  - Source: (I-1-3) Electrical Installations. http://www.iqytechnicalcollege.com/gl_i-1-3_e.pdf [SECONDARY: a college-hosted copy of the text]
  - Quote: "Each non-earthed primary or secondary system serving power, heating or lighting installations shall be fitted with an equipment which monitors the insulation resistance relative to the ship's hull and gives an optical and audible alarm if the insulation resistance value is abnormally low"

- **GL rules: the alarm level in ohms per volt**
  - Source: (I-1-3) Electrical Installations. http://www.iqytechnicalcollege.com/gl_i-1-3_e.pdf [SECONDARY: a college-hosted copy of the text]
  - Quote: "Devices for insulation monitoring of ships mains shall continuously monitor the insulation resistance of the network, and shall release an alarm should the insulation resistance of the system fall below 50 ohms per volt of the operating voltage."

- **GL rules: insulation sized for phase-to-phase voltage where earth faults are not isolated at once**
  - Source: (I-1-3) Electrical Installations. http://www.iqytechnicalcollege.com/gl_i-1-3_e.pdf [SECONDARY: a college-hosted copy of the text]
  - Quote: "All insulation (of cables, consumers, transformers, generators, etc.) shall be designed for the phase-to-phase voltage, if earth-faults will not be isolated immediately."

- **Indian Register guidelines: the unearthed philosophy**
  - Source: Microsoft Word - Guidelines on Earthing Systems for Ships and Offshore Structures_Sept 2024_New. https://www.irclass.org/media/7467/guidelines-on-earthing-systems-for-ships-and-offshore-structures_irs-g-saf-08_sept-2024_new.pdf
  - Quote: "Unearthed : All current-carrying conductors completely insulated from earth throughout the system. Unearthed systems should have provisions for continuous earth fault monitoring."

- **IRS: emergency power and continuous operation with an earth fault**
  - Source: Microsoft Word - Guidelines on Earthing Systems for Ships and Offshore Structures_Sept 2024_New. https://www.irclass.org/media/7467/guidelines-on-earthing-systems-for-ships-and-offshore-structures_irs-g-saf-08_sept-2024_new.pdf
  - Quote: "If continuous operation in the presence of an earth fault is required, the isolated or high impedance (IT) system should be used"

- **IRS: the earth-fault current of an unearthed system depends on capacitance**
  - Source: Microsoft Word - Guidelines on Earthing Systems for Ships and Offshore Structures_Sept 2024_New. https://www.irclass.org/media/7467/guidelines-on-earthing-systems-for-ships-and-offshore-structures_irs-g-saf-08_sept-2024_new.pdf
  - Quote: "Earth-fault current magnitude Depends on system capacitance but usually very low, e.g. 1 [A] in an LV system."

- **IRS: sustained operation with an earth fault**
  - Source: Microsoft Word - Guidelines on Earthing Systems for Ships and Offshore Structures_Sept 2024_New. https://www.irclass.org/media/7467/guidelines-on-earthing-systems-for-ships-and-offshore-structures_irs-g-saf-08_sept-2024_new.pdf
  - Quote: "Sustained operation with earth fault Possible, fault shall be location detected and de- coupled in the shortest possible time period."

- **IRS: insulation monitoring in hazardous areas**
  - Source: Microsoft Word - Guidelines on Earthing Systems for Ships and Offshore Structures_Sept 2024_New. https://www.irclass.org/media/7467/guidelines-on-earthing-systems-for-ships-and-offshore-structures_irs-g-saf-08_sept-2024_new.pdf
  - Quote: "a device, or devices, should be installed to continuously monitor the insulation to earth and to give an audible and visual alarm at a manned position in the event of an abnormally low level of insulation resistance and/or high level of leakage current."

- **MCA surveyor instructions: AC distribution 3 phase 3 wire insulated**
  - Source: Chapter 6: Electrical equipment and installations (MSIS 27). https://assets.publishing.service.gov.uk/media/63a1b221d3bf7f376474f832/MSIS27.6_R12.22.pdf
  - Quote: "AC distribution should be either: ### 3 phase, 3 wire insulated; ### 3 phase, 4 wire with neutral earthed at power source; or ### Single phase, 2 wire insulated."

- **MCA instructions quoting Lloyd's on insulation resistance testing**
  - Source: Chapter 6: Electrical equipment and installations (MSIS 27). https://assets.publishing.service.gov.uk/media/63a1b221d3bf7f376474f832/MSIS27.6_R12.22.pdf
  - Quote: "The Insulation resistance is to be measured off all circuits and electrical equipment, using a direct current insulation tester, between: (a) All current carrying parts connected together and earth and, so far as reasonably practical; (b) All current carrying parts of different polarity or phase."

- **MCA guidance for small fishing vessels: earth indicator lamps**
  - Source: Electrical Installations Construction and Outfit Standards Fishing Vessels of less than 15m Revision 0720. https://assets.publishing.service.gov.uk/media/5efa0b20e90e075c5492d58f/MGN628_Part_10_Electrical_Installations_R07.20.pdf
  - Quote: "It is recommended on vessels over 10m a system of earth indicator lamps is to be fitted. Such lamps are to be of the metal filament type not exceeding 30 watts, of clear glass, and sited not more than 150mm apart. The lamps should not be powered except for “testing” or in the event of an earth fault. To prevent corrosion damage, earth faults should be immediately located and cleared."

- **IEC 60092-201 on insulated distribution systems (as quoted by Bender)**
  - Source: Electrical safety for ships, mobile and fixed offshore platforms. https://www.bender.de/fileadmin/content/Products/b/e/Ships-Offshore_PROSP_en.pdf
  - Quote: "IEC 60092-201:1994-08 Electrical installations on ships – system design 7.2 Insulated distribution systems When a distribution system, whether primary or secondary, for power, lighting or heating, with no connection to earth is used, a device capable of continuously monitoring the insulation level to earth and of giving an acoustic and optical indication of low insulation values shall be provided."

- **IEEE shipboard practice: tank vessels under 1000 V should be unearthed (as quoted by Bender)**
  - Source: Electrical safety for ships, mobile and fixed offshore platforms. https://www.bender.de/fileadmin/content/Products/b/e/Ships-Offshore_PROSP_en.pdf
  - Quote: "Electrical distribution systems of less than 1000 V (line to line) should be unearthed"

My reading: every set requires a continuously monitoring device with an alarm on every insulated distribution system, and
three of them pair that with a rule that the equipment's insulation must stand the phase-to-phase voltage, because the healthy
phases run at that voltage to the hull during a first fault. Only GL gives a number for the alarm (50 ohms per volt).


### 2.4 Textbooks and syllabuses on marine electrical systems

Textbook contents were hard to reach in exact words. Reeds Vol 16, Electrical Power Systems for Marine Engineers, is the closest book
to this topic and its chapter list is below (from a bookseller's page, SECONDARY): the topic sits at chapter 6, "Earth neutral
relationship", after plant, system analysis and motors, and before high voltage, protection, power semiconductors, electric
propulsion, variable speed drives, and harmonics and EMC. Reeds Vol 6 (Basic Electrotechnology) is the foundation book; its
chapter list was **UNCONFIRMED** (only the publisher's description was quotable). D. T. Hall's "Practical Marine Electrical Knowledge"
appears on a college reading list (BCIT) but its contents were not reached (**UNCONFIRMED**).

- **Reeds Vol 16 Electrical Power Systems for Marine Engineers: chapter list (retail listing, SECONDARY)**
  - Source: Reeds Vol 16: Electrical Power Systems for Marine Engineers by Gordon Boyd | 9781472968463, 9781472968449. https://www.perlego.com/book/1812536/reeds-vol-16-electrical-power-systems-for-marine-engineers-pdf [SECONDARY: a bookseller listing]
  - Quote: "1 INTRODUCTION AND OVERVIEW 6. 2 REVIEW OF TERMINOLOGY AND RELATIONSHIPS 7. 3 ELECTRICAL PLANT AND SUPPLY EQUIPMENT 8. 4 SYSTEM ANALYSIS 9. 5 MOTORS 10. 6 EARTH NEUTRAL RELATIONSHIP 11. 7 HIGH VOLTAGE AND POWER 12. 8 PROTECTION 13. 9 POWER SEMICONDUCTORS 14. 10 ELECTRIC PROPULSION 15. 11 VARIABLE SPEED DRIVES (VSDS) 16. 12 HARMONICS AND ELECTROMAGNETIC COMPATIBILITY (EMC) 17. SOLUTIONS TO PRACTICE EXAMPLES"

- **Reeds Vol 6 Basic Electrotechnology for Marine Engineers: what it covers**
  - Source: Reeds Vol 6: Basic Electrotechnology for Marine Engineers: : Reeds Marine Engineering and Technology Series Christopher Lavers Reeds - Bloomsbury. https://www.bloomsbury.com/us/reeds-vol-6-basic-electrotechnology-for-marine-engineers-9781472963833/
  - Quote: "This book provides comprehensive coverage of the basic theoretical work required by Marine Engineering Officers and Electrotechnical Officers (ETOs), putting into place key fundamental building blocks and topics in electrotechnology before progressing to more complex topics and electromagnetic systems. _Volume 6_ covers essential basic electrotechnology principles for the 21st century, including the fundamentals of electron theory, AC and DC current, circuits, electromagnetism and electrochemistry."

- **Reeds Vol 16 description**
  - Source: Reeds Vol 16: Electrical Power Systems for Marine Engineers: : Reeds Marine Engineering and Technology Series Gordon Boyd Reeds - Bloomsbury. https://www.bloomsbury.com/us/reeds-vol-16-electrical-power-systems-for-marine-engineers-9781472968463/
  - Quote: "Large passenger ships now carry as many electrical officers as marine engineers, electrical propulsion is now in common use by LNG carriers, small parcel tankers, oil tankers, ferries, offshore support, the navy, fleet auxiliary, cable layers and cruise ships, and a number of shipping companies now award the Chief Electro Technical Officer the equivalent rank to the ship's master and Chief Engineer."

- **An Indian marine engineering syllabus (AMIIE) unit on insulated and earthed neutral systems**
  - Source: AMMV22 MARINE ELECTRICAL TECHNOLOGY. https://iieinstitution.com/wp-content/uploads/2025/05/MARINE-ELECTRICAL-TECHNOLOGY.pdf [SECONDARY: a college syllabus]
  - Quote: "Insulated & Earthed neutral systems- introduction- circuit faults- causes- prevention- earth"

- **A marine electrical systems course note: the majority of ships**
  - Source: Jee129 Marineelectricalsystems. http://www.iqytechnicalcollege.com/JEE129-MarineElectricalSystems.pdf [SECONDARY: a college-hosted copy of the text]
  - Quote: "The majority of ships have a 3 phase, 3 wire, 440V insulated neutral system."

My reading: in the marine textbooks this is a mid-book topic that assumes plant, three-phase and motors first. That matches the
order of Dan's courses: AC circuits, then Motors, then this.


## 3. What a marine electrical engineer actually uses of this topic

### 3.1 STCW Table A-III/6 (electro-technical officer) and Table A-III/1 (engineer officer of the watch)

The Code does not name insulated systems. The lines that touch the topic are the fault-finding and testing lines, the safe isolation line,
the knowledge lines on distribution, and the monitoring and protective device tests. Two caveats on source: the edumaritime copy of
Table A-III/6 prints its columns interleaved, so only the short clean lines could be quoted (SECONDARY); the A-III/6 lines marked as
from an exam-preparation page are that site's copy of the Code. The A-III/1 lines are from a college copy of the table and, for the
detection line, the IMO conference text.

- **STCW A-III/6 (electro-technical officer), as copied on an ETO exam-preparation page: testing, fault finding and repair**
  - Source: ETO COC Syllabus | Preparation for ETO COC Oral examination. https://www.electrotechnicalofficer.com/2016/07/questions-for-electro-technical-officer.html [SECONDARY: an exam-preparation site]
  - Quote: "Practical knowledge for the testing, maintenance, fault finding, and repair Test, detect faults and maintain and restore electrical and electronic control equipment to operating condition"

- **STCW A-III/6: testing and measuring equipment**
  - Source: STCW Code - Table A-III/6. https://www.edumaritime.net/images/docs/stcw-table-a-iii-6.pdf [SECONDARY: a copy of the IMO table]
  - Quote: "Construction and operation of electrical testing and measuring equipment"

- **STCW A-III/6: monitoring, control and protective device tests**
  - Source: STCW Code - Table A-III/6. https://www.edumaritime.net/images/docs/stcw-table-a-iii-6.pdf [SECONDARY: a copy of the IMO table]
  - Quote: "Function and performance tests of the following equipment and their configuration: .1 monitoring systems .2 automatic control devices .3 protective devices"

- **STCW A-III/6: knowledge lines for operating electrical systems**
  - Source: STCW Code - Table A-III/6. https://www.edumaritime.net/images/docs/stcw-table-a-iii-6.pdf [SECONDARY: a copy of the IMO table]
  - Quote: "Electro-technology and electrical machines theory Fundamentals of electronics and power electronics Electrical power distribution boards and electrical equipment"

- **STCW A-III/6 (exam-preparation page): instrumentation, alarm and monitoring systems**
  - Source: ETO COC Syllabus | Preparation for ETO COC Oral examination. https://www.electrotechnicalofficer.com/2016/07/questions-for-electro-technical-officer.html [SECONDARY: an exam-preparation site]
  - Quote: "Electrical power distribution boards and electrical equipment · Fundamentals of automation, automatic control systems, and technology · Instrumentation, alarm and monitoring systems"

- **STCW A-III/6: hazards above 1,000 volts**
  - Source: STCW Code - Table A-III/6. https://www.edumaritime.net/images/docs/stcw-table-a-iii-6.pdf [SECONDARY: a copy of the IMO table]
  - Quote: "Appreciation of the hazards and precautions required for the operation of power systems above 1,000 volts"

- **STCW A-III/1 (engineer officer of the watch): detection of electric malfunction**
  - Source: STCW Table A-III/1. https://stcw.maritime.edu/stcw/2025/tables/31.html [SECONDARY: a college copy of the STCW table]
  - Quote: "Detection of electric malfunction, location of faults and measures to prevent damage"

- **STCW A-III/1: safe isolation**
  - Source: STCW Table A-III/1. https://stcw.maritime.edu/stcw/2025/tables/31.html [SECONDARY: a college copy of the STCW table]
  - Quote: "Safety requirements for working on shipboard electrical systems, including the safe isolation of electrical equipment required before personnel are permitted to work on such equipment"

- **STCW A-III/1: generator and distribution systems**
  - Source: STCW Table A-III/1. https://stcw.maritime.edu/stcw/2025/tables/31.html [SECONDARY: a college copy of the STCW table]
  - Quote: "Basic configuration and operation principles of the following electrical equipment: 1. generator and distribution systems"

- **STCW A-III/1: repair of DC and distribution equipment**
  - Source: STCW Table A-III/1. https://stcw.maritime.edu/stcw/2025/tables/31.html [SECONDARY: a college copy of the STCW table]
  - Quote: "Maintenance and repair of electrical system equipment, switchboards, electric motors, generator and DC electrical systems and equipment"

- **ETO exam preparation site: A-III/6 competence list**
  - Source: ETO COC Syllabus | Preparation for ETO COC Oral examination. https://www.electrotechnicalofficer.com/2016/07/questions-for-electro-technical-officer.html [SECONDARY: an exam-preparation site]
  - Quote: "Test, detect faults and maintain and restore electrical and electronic control equipment to operating condition"


### 3.2 The MCA electro-technical officer and engineer officer syllabus lines (Electrotechnology)

MSN 1860 sets the UK route to the ETO certificate: the SQA Chief Engineer Electro-technology written exam, the AMERC Electronic
Principles exam, a record book, then the MCA oral exam, whose syllabus is Annex C. The lines that touch this topic are below. The
engineer-officer routes name Electro-Technology as an academic subject (GOV.UK; the 2022 regulations' MSN). The SQA Electro-technology
syllabus text itself was not found online, so whether it names insulated neutral systems or earth fault indicators is **UNCONFIRMED**.
(The Indian syllabus in section 2.4 and the course notes in 4.5 do name them.)

- **MCA ETO oral syllabus: earthing systems and earth fault finding**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "knowledge of earthing systems and earth fault finding procedures."

- **MCA ETO oral syllabus: distribution systems**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "Operate Generators and distribution systems Knowledge, understanding and proficiency in coupling, load sharing, changing over generators, coupling and breaking connection between switchboards and distribution panels – ability to establish rules and procedures for safe operation in accordance with the operating manuals (maker) – ability to explain electrical distribution system with drawing/instructions"

- **MCA ETO oral syllabus: insulation test on equipment with electronics**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "The precautions while carrying out insulation test on equipment incorporated with electronic circuit and devices;"

- **MCA ETO oral syllabus: HV IR trending and earthing procedures**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "Earthing procedures;  Checking Circuit Breaker for correct operation;  Pressure tests of Circuit Breaker;  Polarisation Index test for HV transformers;  Trending HV IR tests."

- **MCA route to the ETO certificate: Electro-technology written exam**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "(a) Pass the SQA Chief Engineer Electro-technology written exam; (b) Pass the AMERC Electronic Principles written exam;"

- **MCA ETO oral syllabus: safe isolation, testing and fault finding**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "Safe isolation of equipment and associated system before personnel are permitted to work on the plant or equipment;  Safety and emergency procedures;  Testing, maintenance, fault finding and repair;"

- **GOV.UK engineering CoC requirements: Electro Technology is a required academic subject**
  - Source: Engineering CoC Requirements - GOV.UK. https://www.gov.uk/government/publications/coc-requirements/engineering-coc-requirements
  - Quote: "SQA Management Level Electro Technology"

- **MCA MSN (2022 regulations): Chief Engineer academic subjects include Electro-Technology**
  - Source: Merchant Shipping (Standards of Training, Certification and Watchkeeping) Regulations 2022 — Maritime and Coastguard Agency Training & Certification Guidance. https://www.legislation.gov.uk/ukdsi/2022/9780348240368/pdfs/ukdsiod_9780348240368_en_001.pdf
  - Quote: "Chief Engineer: Applied Mechanics, Applied Heat, Electro-Technology and Naval Architecture."

- **MCA MSN (2022 regulations): Second Engineer academic subjects include Electro Technology**
  - Source: Merchant Shipping (Standards of Training, Certification and Watchkeeping) Regulations 2022 — Maritime and Coastguard Agency Training & Certification Guidance. https://www.legislation.gov.uk/ukdsi/2022/9780348240368/pdfs/ukdsiod_9780348240368_en_001.pdf
  - Quote: "Second Engineer: Mathematics, Applied Mechanics, Applied Heat, Engineering Drawing, Electro Technology and Naval Architecture."

- **SQA Level 2 Diploma in Maritime Studies, electro-technical route: diagnose electrical faults**
  - Source: Level 2 Diploma in Maritime Studies: Marine Vessel Maintenance - Qualifications Scotland. https://www.sqa.org.uk/sqa/82115.html
  - Quote: "problem solve, eg diagnose electrical and electronic faults and take action to prevent the problem from happening again"


### 3.3 Public apprenticeship standards (Institute for Apprenticeships and Technical Education, now Skills England)

Two standards fit Dan: **ST0808 Marine electrician** (Level 3, 42 months, boat-scale work) and **ST0457 Engineering technician**, whose Maritime Defence
option 5 is the Maritime Electrical Fitter (that option is being replaced by ST1403, which I did not read: **UNCONFIRMED**). As with the HN units, matching either to Dan's Navy path is a guess. The standards say "fault finding", "check, test and diagnose", "isolation" and "lock out", and
ST0808 names batteries and AC power systems; neither names insulated systems or earth faults. The Electrical power protection and plant commissioning engineer (ST0157) and Maintenance and
operations engineering technician (ST0154) also appeared and are not used.

- **IfATE listing: Marine electrician, Level 3, 42 months**
  - Source: Apprenticeship search / Skills England. https://www.instituteforapprenticeships.org/apprenticeship-standards
  - Quote: "Marine electrician Approved for delivery from 17 May 2021 Level 3 42 months Max funding: £23,000 Conduct a wide range of marine electrical work."

- **Marine electrician standard (ST0808): occupation summary**
  - Source: Marine electrician / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0808-v1-2
  - Quote: "They are responsible for installing, maintaining, monitoring, fault finding and repairing a wide range of marine electrical and electronic systems."

- **ST0808: water and electrical systems**
  - Source: Marine electrician / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0808-v1-2
  - Quote: "ensure the safety of themselves, the boat users and the vessel."

- **ST0808: duty 9**
  - Source: Marine electrician / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0808-v1-2
  - Quote: "Duty 9 Maintain, fault find, and diagnose issues with electrical and electronic systems and equipment on boats."

- **ST0808: K19 isolation**
  - Source: Marine electrician / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0808-v1-2
  - Quote: "K19 : Importance of isolation procedures for marine electrical and electronic operations."

- **ST0808: K23 diagnosing**
  - Source: Marine electrician / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0808-v1-2
  - Quote: "K23 : How to check, test, and diagnose the condition of different marine electrical and electronic systems."

- **ST0808: S15 check, test and diagnose**
  - Source: Marine electrician / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0808-v1-2
  - Quote: "S15 : Check, test, and diagnose marine electrical and electronic equipment and components in boats"

- **ST0808: S22 battery condition and AC power systems**
  - Source: Marine electrician / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0808-v1-2
  - Quote: "S22 : Check, test, and diagnose battery condition and alternating current (ac) power systems and record results."

- **ST0808: duty 12 batteries**
  - Source: Marine electrician / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0808-v1-2
  - Quote: "Duty 12 Monitor marine batteries, charging and ancillary alternating current (ac) or direct current (dc) supply charging systems."

- **ST0808: K22 lock out**
  - Source: Marine electrician / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0808-v1-2
  - Quote: "K22 : Means of powering down and correctly operating locking out systems."

- **ST0457: the Maritime Electrical Fitter option is being replaced by ST1403**
  - Source: Engineering technician / Skills England. https://www.instituteforapprenticeships.org/apprenticeship-standards/engineering-technician-v1-4
  - Quote: "Option 5. Maritime electrical fitter is being replaced by a new apprenticeship ST1403 Maritime electrical fitter"

- **Engineering technician (ST0457), Maritime Electrical Fitter: role**
  - Source: Engineering technician / Skills England. https://www.instituteforapprenticeships.org/apprenticeship-standards/engineering-technician-v1-4
  - Quote: "The Electrical Fitter utilises engineering drawings, data and documentation in order to undertake the manufacture, installation, testing, commissioning, fault diagnosis, maintenance, overhaul and removal of electrical and data systems on maritime vessels."

- **ST0457 Maritime Electrical Fitter: testing, inspection and diagnostic activities**
  - Source: Engineering technician / Skills England. https://www.instituteforapprenticeships.org/apprenticeship-standards/engineering-technician-v1-4
  - Quote: "undertake testing, inspection and diagnostic activities on components, equipment and systems on maritime vessels, making adjustments where applicable."

- **ST0457 Maritime Electrical Fitter: knowledge**
  - Source: Engineering technician / Skills England. https://www.instituteforapprenticeships.org/apprenticeship-standards/engineering-technician-v1-4
  - Quote: "understand maritime electrical/electronic engineering technology and principles in the design, equipment build, operation and maintenance of maritime vessels."

My reading: the standards want the habit (isolate, prove, test, diagnose) more than the theory. This course teaches the theory that makes
the habit make sense on a floating system.


### 3.4 Pearson BTEC Higher Nationals in Engineering

He has no syllabi for the Navy courses ahead (CLAUDE.md), so the public HN Engineering units are a stand-in and the match is **a guess**. The units that touch this topic are Electrical and Electronic Principles and,
as an option, Electrical Systems and Fault Finding (Unit 31 in the 2017 specification; unit 4026 in the 2024 specification). Unit 31's content names earthing system connections and insulation testers
but not IT systems.

- **Pearson HN Engineering (2017) Unit 31 Electrical Systems and Fault Finding: LO1**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "1. Investigate the constructional features and applications of electrical distribution systems."

- **Unit 31 essential content: earthing system connections**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "Earthing system connections"

- **Unit 31 essential content: fault finding techniques and test equipment**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "Input/output, half split Meters, insulation testers Typical faults found"

- **Unit 31 criterion M1**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "M1 Summarise the methods of safe fault finding on an electrical distribution system"

- **Unit 31 LO4 content: safety components including earth connections**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "Construction, application, characteristics and testing of: distribution boards, circuit breakers, residual current devices (RCDs), fuses, thermal devices, relays, contactors, switch gear, emergency stop buttons, interlocks, disconnectors, earth connections, Insulation Protection (IP) rating"

- **Pearson HN Engineering (2017): fault-finding objective**
  - Source: BTEC HN Engineering. https://www.ucw.ac.uk/wp-content/uploads/2020/03/HNC-HND-Engineering-Programme-Specification.pdf
  - Quote: "To develop the skills necessary to fault find and problem solve in a timely, professional manner"

- **Pearson HN Engineering (2024): optional unit 4026**
  - Source: Higher Nationals. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/General-Engineering/2024/specification-and-sample-assessments/btec-hncd-engineering-2024.pdf
  - Quote: "Optional unit 4026: Electrical Systems and Fault Finding 15 4"

- **Pearson HN (2024): hours at Level 4**
  - Source: Higher Nationals. https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/General-Engineering/2024/specification-and-sample-assessments/btec-hncd-engineering-2024.pdf
  - Quote: "Total qualification time = 2,400 hours ● Total guided learning hours = 960 hours ● Mix of core, specialist and optional units, totalling 240 credits."

Computed from the 2024 numbers (2,400 hours total qualification time and 960 guided learning hours for 240 credits; which qualification those totals head is **UNCONFIRMED**
in the saved text): one credit is 10 hours of qualification time and 4 guided learning hours, so a 15-credit unit is 150 hours and 60 guided learning hours.


### 3.5 What Dan's BS 7671 and inspection and testing qualifications already cover of earthing systems (TN, TT and IT)

The public texts I could reach are EAL's specifications (Dan's awards are EAL), IET Wiring Matters, and a commercial study guide for the City and Guilds 2391. The spec below is EAL's
Level 3 electrotechnical qualification specification (610/3907/X, the Installation Electrician and Maintenance Electrician standard), the
closest public text to his NVQ L3 Electrical Installation; which exact specification his certificate follows is **UNCONFIRMED**. The
specifications of his Level 3 Award in the Requirements for Electrical Installations (BS 7671:2018), Initial Verification and Periodic
Inspection awards were not read line by line (**UNCONFIRMED**), but EAL describes the BS 7671 award as "a single knowledge unit which has
35 guided learning hours" covering the full content of BS 7671 (section 8).

- **IET Wiring Matters: BS 7671 lists five types of earthing system**
  - Source: 2011 40 Autumn Wiring Matters. https://electrical.theiet.org/media/1549/earthing.pdf
  - Quote: "BS 7671 lists five types of earthing system, TN-S, TN-C-S, TT, TN-C and IT."

- **IET Wiring Matters: IT is very uncommon on a UK public supply**
  - Source: 2011 40 Autumn Wiring Matters. https://electrical.theiet.org/media/1549/earthing.pdf
  - Quote: "an IT system is not permitted for a low voltage public supply in the UK because the source is not directly earthed. Therefore TN-C and IT systems are both very uncommon in the UK."

- **IET Wiring Matters: TT and TN-S sources**
  - Source: 2011 40 Autumn Wiring Matters. https://electrical.theiet.org/media/1549/earthing.pdf
  - Quote: "With TT, the consumer must provide his or her own connection to earth, i.e. by installing a suitable earth electrode local to the installation."

- **IET Wiring Matters: TN-S source**
  - Source: 2011 40 Autumn Wiring Matters. https://electrical.theiet.org/media/1549/earthing.pdf
  - Quote: "A TN-S system has the neutral of the source of energy connected with earth at one point only, at or as near as is reasonably practicable to the source"

- **IET Wiring Matters (railways): TN is by far the most common**
  - Source: Wiring Matters - your insight into BS 7671. https://electrical.theiet.org/media/1469/railway-systems_tm-granger.pdf
  - Quote: "BS 7671 covers the three primary types of earthing arrangement: TN, TT and IT. The majority of electricians and electrical engineers will be very familiar with the TN type, including TN-C, TN-S, and TN-C-S variations, as these are by far the most common type of supply provided by Distribution Network Operators (DNOs)."

- **IET Wiring Matters (railways): the IT type**
  - Source: Wiring Matters - your insight into BS 7671. https://electrical.theiet.org/media/1469/railway-systems_tm-granger.pdf
  - Quote: "The third type of earthing arrangement, and the particular focus of this article, is the 'IT' type, in which the source transformer is isolated from earth, whilst all exposed conductive parts of the installation are connected to earth electrodes."

- **IET Wiring Matters (railways): BS 7671 and the first fault**
  - Source: Wiring Matters - your insight into BS 7671. https://electrical.theiet.org/media/1469/railway-systems_tm-granger.pdf
  - Quote: "BS 7671 gives no requirement to disconnect the supply under first earth fault conditions as long as one of the following is permanently installed and gives an audible and/or visual signal:  insulation monitoring device;  residual current monitoring device; or  insulation fault location system"

- **IET Wiring Matters (railways): the second fault and Regulation 411.6.4**
  - Source: Wiring Matters - your insight into BS 7671. https://electrical.theiet.org/media/1469/railway-systems_tm-granger.pdf
  - Quote: "should a second fault occur on the opposite phase to the first fault there is potential for significant current to flow and, consequently, BS 7671 has requirements for protection against electric shock similar to TN systems; these conditions are covered in Regulation 411.6.4 of BS 7671."

- **IET Wiring Matters (railways): naturally earthed by stray capacitance**
  - Source: Wiring Matters - your insight into BS 7671. https://electrical.theiet.org/media/1469/railway-systems_tm-granger.pdf
  - Quote: "the system is naturally earthed by the stray capacitances of the cables."

- **IET Wiring Matters: an IMD is a requirement on an IT system (Regulations 538.1.1, 411.6.3.1)**
  - Source: 2010 34 Spring Wiring Matters. https://electrical.theiet.org/media/1576/types-of-person-and-the-requirements-of-the-wiring-regulations-part-2.pdf
  - Quote: "It is a requirement in installa- tions supplied from an IT system that an Insulation monitoring"

- **EAL Level 3 electrical qualification specification: earthing arrangements covered**
  - Source: Qualification Specification. https://assets-us-01.kc-usercontent.com/b5487b04-0555-0014-d9f8-268f1a54c305/aa26696e-dea9-4aa4-9d39-1561d56b7666/EAL_610-3907-X_QS_1.pdf
  - Quote: "3.1 Explain the characteristics and applications of earthing arrangements Cover: TN-S, TNC-S, and TT. Cover neutral current diversion appearing on earthing systems. Awareness only of other earthing systems in BS 7671 (such as IT in an operating theatre)."

- **EAL Level 3 specification: fault diagnosis tests**
  - Source: Qualification Specification. https://assets-us-01.kc-usercontent.com/b5487b04-0555-0014-d9f8-268f1a54c305/aa26696e-dea9-4aa4-9d39-1561d56b7666/EAL_610-3907-X_QS_1.pdf
  - Quote: "3.5 Specify appropriate and logical procedures for carrying out fault diagnosis tests Cover: • Continuity • Insulation resistance • Polarity • Earth fault loop impedance"

- **EAL specification: the qualification reflects the Installation Electrician and Maintenance Electrician standard**
  - Source: Qualification Specification. https://assets-us-01.kc-usercontent.com/b5487b04-0555-0014-d9f8-268f1a54c305/aa26696e-dea9-4aa4-9d39-1561d56b7666/EAL_610-3907-X_QS_1.pdf
  - Quote: "This qualification comprises of units that reflect the knowledge, skills, and behaviours in the Installation Electrician and Maintenance Electrician apprenticeship standard."

- **EAL specification: test instruments for tests**
  - Source: Qualification Specification. https://assets-us-01.kc-usercontent.com/b5487b04-0555-0014-d9f8-268f1a54c305/aa26696e-dea9-4aa4-9d39-1561d56b7666/EAL_610-3907-X_QS_1.pdf
  - Quote: "10.1 Select the test instruments and their accessories for tests to include: • Continuity • Insulation resistance"

- **2391 study guide: the earthing arrangement recorded on a certificate**
  - Source: Certification and Reporting — City & Guilds 2391-52 Study Guide | 2391 Prep. https://www.2391prep.co.uk/topics/certification-and-reporting/ [SECONDARY: a commercial study guide]
  - Quote: "Earthing arrangement — TN-S, TN-C-S, TT or IT"

- **IEC 60364-6: verifying an IT system is by calculation or measurement of the first-fault current**
  - Source: cdn.standards.iteh.ai. https://cdn.standards.iteh.ai/samples/21340/5b6773dd9a0c417e97501490c483a487/IEC-60364-6-2016.pdf [SECONDARY: sample pages on a standards reseller]
  - Quote: "c) For an IT system Compliance with the rules of IEC 60364-4-41: 2005, 411.6.2 shall be verified by calculation or measurement of the current _I_ d in case of a first fault of a live conductor. The measurement is made only if the calculation is not possible, because all the parameters are not known."

- **IEC 60364-6: equipment that may influence or be damaged by the insulation test is disconnected**
  - Source: cdn.standards.iteh.ai. https://cdn.standards.iteh.ai/samples/21340/5b6773dd9a0c417e97501490c483a487/IEC-60364-6-2016.pdf [SECONDARY: sample pages on a standards reseller]
  - Quote: "such equipment shall be disconnected before carrying out the insulation resistance test."

My reading: he has the TN and TT toolkit (Ze, Zs, ADS, RCDs, electrode resistance) and has met the word IT only as "awareness". The
course therefore starts from the star point and the first fault, uses ADS only as the contrast, and need not re-teach insulation resistance
testing, which his specification lists and his Subsea Cable Testing course went deep on.


## 4. The scope to cover, and what research says about each part

### 4.1 Earthing systems compared (TN, TT, IT), and why ships often run insulated systems

The three letters come from what the supply's star point does. TN: the source neutral is earthed and the installation's exposed parts are
tied to it. TT: the source neutral is earthed and the installation has its own electrode. IT: no direct connection (or one through a high
impedance, "commonly 1500 ohms or more"); exposed parts are earthed to the installation's electrode or the hull. The reason ships choose IT is
continuity of supply for essential services, not shock protection.

- **EIG: the IT system, what the source does**
  - Source: IT system - Principle - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/IT_system_-_Principle
  - Quote: "The installation is isolated from earth, or the neutral point of its power-supply source is connected to earth through a high impedance (commonly 1500 Ω or more)"

- **Marine Insight: why most ships use an insulated system**
  - Source: Ship Earthing Systems: Insulated Networks, Bonding and Earth-Fault Monitoring. https://marineinsight360.com/blogs/ship-earthing-systems-protect-ships [SECONDARY: a trade blog]
  - Quote: "The typical low-voltage distribution on a merchant ship, for example 440 V at 60 Hz, is an insulated (IT) system : no conductor is deliberately connected to the hull. The reason is continuity of supply. If one phase develops an earth fault, no large current flows and no breaker trips, so the steering gear, pumps and lighting keep running."

- **A marine ETO site: the priority requirement on board ship**
  - Source: Isolated and Earthed neutral systems on ships | Neutral Earthing Resistor. https://www.electrotechnicalofficer.com/2016/07/insulated-neutral-system-types-of-fault.html [SECONDARY: an exam-preparation site]
  - Quote: "The priority requirement on board ship is to maintain continuity of the electrical supply to equipment in the event of a single earth fault occurring. On an insulated system, one earth fault does not interrupt the supply but raises a warning on the earth's detection system. This allows the operator to locate and clear the fault."

- **Marine electrical systems course note: why insulated neutral**
  - Source: Jee129 Marineelectricalsystems. http://www.iqytechnicalcollege.com/JEE129-MarineElectricalSystems.pdf [SECONDARY: a college-hosted copy of the text]
  - Quote: "Insulated neutral systems are primarily adopted to avoid the risk of loss of essential services, such as steering gear and vital engine room auxiliaries in the even of an earth fault. With solid neutral earthing a phase to earth fault constitutes a short circuit on the phase concerned and causes the operation of protection equipment which will trip the circuit breaker."

- **Bender: a shutdown at sea can be dangerous**
  - Source: Electrical Safety Solutions for Harbours and Vessels. https://www.benderinc.com/fileadmin/content/BenderGroup/Documents/Article/en/Harbours_and_Vessels_6.12.20_compressed.pdf
  - Quote: "Shutdown can lead to dangerous situations at sea, for example when redistributing the ballast water or fuel if the free surfaces cannot be reduced because the tanks cannot be emp- tied or filled completely."

- **IMarEST paper: the early reason for two-wire unearthed distribution**
  - Source: library.imarest.org. https://library.imarest.org/record/2202/files/2229.pdf
  - Quote: "two-wire unearthed distribution systems were introduced to prevent the immediate loss of an essential service resulting from an earth fault."

- **Marine Insight: high-voltage ship systems are usually resistance earthed**
  - Source: Ship Earthing Systems: Insulated Networks, Bonding and Earth-Fault Monitoring. https://marineinsight360.com/blogs/ship-earthing-systems-protect-ships [SECONDARY: a trade blog]
  - Quote: "These systems are usually earthed through a resistor at the generator neutral. A high-resistance earth limits the fault current to a few amperes, so a first earth fault can still be alarmed rather than tripped, while avoiding the dangerous overvoltages that can build up in a fully insulated HV system."

- **Marine electrical systems note: HV neutral points usually earthed through a resistor**
  - Source: Jee129 Marineelectricalsystems. http://www.iqytechnicalcollege.com/JEE129-MarineElectricalSystems.pdf [SECONDARY: a college-hosted copy of the text]
  - Quote: "Distribution systems at these high voltages usually have their neutral points earthed through a resistor to the ship's hull."

- **Wikipedia: IT arrangement and isolation transformers**
  - Source: Earthing system - Wikipedia. https://en.wikipedia.org/wiki/Earthing_system [SECONDARY: encyclopaedia]
  - Quote: "often use an IT earthing arrangement supplied from [isolation transformers"

My reading: high-voltage ship systems are the exception that shows the rule. Marine Insight and the marine course note both say they are usually earthed through a
resistor, so that a first fault can still be alarmed but the overvoltages of a fully insulated HV system are avoided. That ties to capacitance growing with the system
(section 4.3) and to the arcing-fault question (4.8). The IMarEST paper's conclusion is that no earthing method is best and that earth-fault current is the criterion to choose by: the
course should teach the trade-off in terms of first-fault current.


### 4.2 The first earth fault: no fault current to speak of, the healthy phases rise towards line voltage, the phasor picture

Three sources give the same numbers. Healthy phases to earth go from V_phase to V_line, which is root three, 1.73, or 173 percent. The phasor
picture is a shift of the whole triangle: before the fault the earth point sits at the star point; with a solid fault on phase A the earth point
moves to A, and B and C are then a line voltage away from earth, with the star point a phase voltage from earth. Eaton's 480 V table gives
both cases (grounded and ungrounded) side by side.

- **EIG: the first fault to earth should not cause any disconnection**
  - Source: IT system - Fault protection - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/IT_system_-_Fault_protection
  - Quote: "In IT system, the first fault to earth should not cause any disconnection. The earth-fault current which flows under a first-fault condition is measured in mA."

- **EIG: healthy phases rise to root three times the phase voltage**
  - Source: IT system - Fault protection - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/IT_system_-_Fault_protection
  - Quote: "The voltages of the healthy phases have (because of the fault) increased to √3 times the normal phase voltage"

- **EIG: the vector figure for a first fault**
  - Source: IT system - Fault protection - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/IT_system_-_Fault_protection
  - Quote: "Vector representation of voltages and currents in case of fault between phase 1 and earth"

- **Eaton: the line-to-ground insulation sees full line-to-line voltage**
  - Source: Characteristics of different power systems neutral grounding techniques: Fact and fiction. https://www.eaton.com/content/dam/eaton/products/medium-voltage-power-distribution-control-systems/vacclad-w-pages/characteristics-power%20systems-neutral-grounding-techniques-fact-fiction-ap083005en.pdf
  - Quote: "In an ungrounded system, the available ground fault current is very low, but the voltage on the normal line-to-ground insulation is increased from a line-to-ground value to a full line-to-line magnitude."

- **Eaton: the longer a ground stays, the likelier a second one, as the insulation is overstressed by 73 percent**
  - Source: Characteristics of different power systems neutral grounding techniques: Fact and fiction. https://www.eaton.com/content/dam/eaton/products/medium-voltage-power-distribution-control-systems/vacclad-w-pages/characteristics-power%20systems-neutral-grounding-techniques-fact-fiction-ap083005en.pdf
  - Quote: "the longer the ground is allowed to remain the greater the likelihood of a second ground occurring on another phase because the unfaulted phases have line-to-line voltage impressed on their line-to-ground insulation. In other words, the insulation is overstressed by 73 percent."

- **Eaton: the current returns through the distributed capacitance of the two unfaulted phases**
  - Source: Characteristics of different power systems neutral grounding techniques: Fact and fiction. https://www.eaton.com/content/dam/eaton/products/medium-voltage-power-distribution-control-systems/vacclad-w-pages/characteristics-power%20systems-neutral-grounding-techniques-fact-fiction-ap083005en.pdf
  - Quote: "there is no direct ground path back to the neutral point of the source in Figure 3b , the current must return through the distributed capacitance (insulation system) of the two unfaulted phases. As indicated, only 1.04 A will flow."

- **Eaton: the worked arithmetic for 480 V**
  - Source: Characteristics of different power systems neutral grounding techniques: Fact and fiction. https://www.eaton.com/content/dam/eaton/products/medium-voltage-power-distribution-control-systems/vacclad-w-pages/characteristics-power%20systems-neutral-grounding-techniques-fact-fiction-ap083005en.pdf
  - Quote: "Ioa =Iob =(480 V)/–j800Ω = 0.6 A (0.6) COS 30º + (0.6) COS 30º =1.04 A"

- **EEP: a first fault shifts the voltage triangle**
  - Source: Ground faults in ungrounded systems (risks & detection) | EEP. https://electrical-engineering-portal.com/ground-faults-ungrounded-systems
  - Quote: "Phase-to-ground faults on an ungrounded system essentially shift the normal balanced voltage triangle"

- **EEP: the other phases run at 1.73 times the line-to-ground voltage**
  - Source: Ground faults in ungrounded systems (risks & detection) | EEP. https://electrical-engineering-portal.com/ground-faults-ungrounded-systems
  - Quote: "with the fault the other phases are operating at basically 1.73 times the normal line-to-ground voltage."

- **SEL paper: unfaulted phases at 1.73 times rated**
  - Source: Comparing Fault Resistance Coverage of Different Distribution System Grounding Methods. https://cdn.selinc.com/assets/Literature/Publications/Technical%20Papers/6457_ComparingFault_DH_20101011_Web.pdf?v=20150812-152048
  - Quote: "The voltages to ground on the unfaulted B-phase and C-phase are 1.73 times their rated level"

- **SEL: the system voltage triangle does not collapse**
  - Source: Comparing Fault Resistance Coverage of Different Distribution System Grounding Methods. https://cdn.selinc.com/assets/Literature/Publications/Technical%20Papers/6457_ComparingFault_DH_20101011_Web.pdf?v=20150812-152048
  - Quote: "the system voltage triangle does not collapse during the fault; rather, it shifts"

- **Cahier 178: the sound phases go to the phase-to-phase voltage**
  - Source: The IT earthing system (unearthed neutral) in LV. https://download.se.com/files?amp&p_Doc_Ref=ECT178
  - Quote: "When the first insulation fault occurs, the phase-to-earth voltage of the sound phases is permanently brought to the phase-to-phase voltage of the network."

- **Cahier 178: vector charts without and with a fault**
  - Source: The IT earthing system (unearthed neutral) in LV. https://download.se.com/files?amp&p_Doc_Ref=ECT178
  - Quote: "vector charts of a network in the IT system, without fault"

- **Eaton: grounding phase A moves the neutral to VL-N**
  - Source: Transient overvoltages on ungrounded systems from intermittent ground faults. https://www.eaton.com/content/dam/eaton/markets/healthcare/knowledge-center/white-paper/transient-overvoltages-on-ungrounded-systems-from-intermittent-ground-faults.pdf
  - Quote: "This causes the neutral point to rise to a value equal to VL-N."

- **Eaton: the unfaulted phases are at line-to-line voltage to ground**
  - Source: Low-voltage high resistance grounding systems basics. https://www.eaton.com/content/dam/eaton/products/low-voltage-power-distribution-controls-systems/hrg/files/lv-hrg-systems-basics-ap019004en.pdf
  - Quote: "During ground fault conditions, the voltage to ground on the two unfaulted phases is equal to the line-to-line voltage."

- **Eaton: equipment rated at 173%**
  - Source: Low-voltage high resistance grounding systems basics. https://www.eaton.com/content/dam/eaton/products/low-voltage-power-distribution-controls-systems/hrg/files/lv-hrg-systems-basics-ap019004en.pdf
  - Quote: "The equipment rating has to be rated at 173% of their line-to-neutral voltages."

- **GL rules: cable voltage rating in insulated networks is the phase-to-phase voltage**
  - Source: (I-1-3) Electrical Installations. http://www.iqytechnicalcollege.com/gl_i-1-3_e.pdf [SECONDARY: a college-hosted copy of the text]
  - Quote: "In insulated distribution systems, the outer conductor voltage of the system shall be deemed to be the rated voltage of the cable between a conductor and the ship's hull."

Computed (not quotes): with A at earth, the phasors from earth to B and to C are the line-voltage phasors from A, so each has length root three
times V_phase and they are 60 degrees apart. That is AC circuits lesson 10's star and delta, used backwards. No new maths is needed.


### 4.3 Capacitance to earth: "insulated" really means earthed through capacitance, the charging current, and why a big system still passes current

Every cable, motor winding and filter has capacitance to earth or to the hull, so the "insulated" system is earthed through a large capacitive
reactance. That reactance is what returns the first-fault current to the source. Four independent figures agree.

- **Eaton: "ungrounded" is coupled to ground through distributed capacitance**
  - Source: Characteristics of different power systems neutral grounding techniques: Fact and fiction. https://www.eaton.com/content/dam/eaton/products/medium-voltage-power-distribution-control-systems/vacclad-w-pages/characteristics-power%20systems-neutral-grounding-techniques-fact-fiction-ap083005en.pdf
  - Quote: "although called ungrounded, this type of system is in reality coupled to ground through the distributed capacitance of its phase windings and conductors."

- **IMarEST: an unearthed system is effectively earthed by a large capacitive reactance**
  - Source: library.imarest.org. https://library.imarest.org/record/2202/files/2229.pdf
  - Quote: "An unearthed system is in fact effectively earthed at the neutral by a large capacitive reactance, due to the phase-to-earth capacitance of the phase conductors throughout the system."

- **IMarEST: typical LV marine phase-to-earth capacitance and the resulting fault current**
  - Source: library.imarest.org. https://library.imarest.org/record/2202/files/2229.pdf
  - Quote: "Typical values of phase-to-earth capacitance for low-voltage marine power systems lie in the range 1-5 _p.F_ per phase, although this can increase by a factor of ten as a result of RFI capacitors. Assuming a system voltage and frequency of 450 V/60 Hz, this gives earth fault currents in the range 0.3 to 1.5 A, increasing to perhaps 15 A where large numbers of RFI capacitors are installed."

- **IMarEST: where the capacitance comes from**
  - Source: library.imarest.org. https://library.imarest.org/record/2202/files/2229.pdf
  - Quote: "The phase-to-earth or phase-to-hull capacitance of a marine elec­ trical system arises unavoidably due to the proximity of cables and conductors to the hull structure and also of machine windings to earthed stator cores. Additional capacitance is added, particularly in warships, by radio frequency interference (RFI) suppression capaci"

- **IMarEST discussion: big vessels carry several amps per phase of capacitive leakage**
  - Source: library.imarest.org. https://library.imarest.org/record/2202/files/2229.pdf
  - Quote: "Present-day designs for support and drilling vessels can easily have capacitance leakage currents to earth in the region of 7-10 A/phase."

- **IMarEST: the fault current depends on the capacitance of the two healthy phases**
  - Source: library.imarest.org. https://library.imarest.org/record/2202/files/2229.pdf
  - Quote: "entirely on the phase-to-earth capacitance of the two healthy phases."

- **Cahier 178: capacitance and leakage of a new cable per kilometre**
  - Source: The IT earthing system (unearthed neutral) in LV. https://download.se.com/files?amp&p_Doc_Ref=ECT178
  - Quote: "In LV, the leakage resistance of a new cable is around 10 MΩ per kilometer and per phase, whereas its capacity evenly distributed with respect to earth is approximately 0.25 µF, i.e. 12.7 kΩ at 50 Hz."

**Leakage capacitance against first-fault current**

- **EIG: leakage capacitance against first-fault current**
  - Source: IT system - Fault protection - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/IT_system_-_Fault_protection
  - Quote: "| Leakage capacitance (µF) | First fault current (A) | | 1 | 0.07 | | 5 | 0.36 | | 30 | 2.17 | * Note: 1 µF is the 1 km typical leakage capacitance for 4-conductor cable."

- **EIG: the fault current through the electrode is the vector sum of the capacitive currents and the neutral-impedance current**
  - Source: IT system - Fault protection - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/IT_system_-_Fault_protection
  - Quote: "The fault current passing through the electrode resistance R A is the vector sum of the currents: * Capacitive currents in the two healthy phases I C2 and I C3 , * Capacitive current in the neutral I CN , * Current in the neutral impedance, I d1 ."

- **EIG: the capacitive current to earth increases by a factor of four**
  - Source: IT system - Fault protection - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/IT_system_-_Fault_protection
  - Quote: "the capacitive current to earth value increases by a factor of 4 during phase-to-earth fault"

**Charging current: Eaton**

- **Eaton: charging current is typically 1 to 2 A on 480 V**
  - Source: Transient overvoltages on ungrounded systems from intermittent ground faults. https://www.eaton.com/content/dam/eaton/markets/healthcare/knowledge-center/white-paper/transient-overvoltages-on-ungrounded-systems-from-intermittent-ground-faults.pdf
  - Quote: "The 1 to 2 amp “charging current” is typical for 480 V systems."

- **Eaton: charging current rises with cable length, spacing and voltage**
  - Source: Transient overvoltages on ungrounded systems from intermittent ground faults. https://www.eaton.com/content/dam/eaton/markets/healthcare/knowledge-center/white-paper/transient-overvoltages-on-ungrounded-systems-from-intermittent-ground-faults.pdf
  - Quote: "The magnitude of the charging current increases as you increase the capacitance, such as from longer cable distances between the source and the load or closer cable spacing, different cable insulation, and/or as you increase the system voltage."

- **Eaton: about 10 µF on a 277 V system gives about 1 A**
  - Source: Transient overvoltages on ungrounded systems from intermittent ground faults. https://www.eaton.com/content/dam/eaton/markets/healthcare/knowledge-center/white-paper/transient-overvoltages-on-ungrounded-systems-from-intermittent-ground-faults.pdf
  - Quote: "A capacitance of approximately 10µF on a 277 V system, then, will result in approximately 1 ampere of continuous (charging) current through that capacitance."

- **Eaton: the capacitor current leads its voltage by 90 degrees**
  - Source: Transient overvoltages on ungrounded systems from intermittent ground faults. https://www.eaton.com/content/dam/eaton/markets/healthcare/knowledge-center/white-paper/transient-overvoltages-on-ungrounded-systems-from-intermittent-ground-faults.pdf
  - Quote: "the current through that capacitor will lead the voltage across that capacitor (VC) by 90 degrees"

- **Eaton: charging current is measurable with all loads off**
  - Source: Transient overvoltages on ungrounded systems from intermittent ground faults. https://www.eaton.com/content/dam/eaton/markets/healthcare/knowledge-center/white-paper/transient-overvoltages-on-ungrounded-systems-from-intermittent-ground-faults.pdf
  - Quote: "we can measure this charging current as the current flowing out of the transformer even with all loads switched off"

**Leakage capacitance: Bender**

- **Bender: leakage capacitances are in parallel and add**
  - Source: Technical aspects IT systems. https://fournais-bender.dk/storage/TechnAspects-IT-systems.pdf
  - Quote: "Since the system leakage capacitances are all connected in parallel, their values add up to the total system leakage capacitance"

- **Bender: interference suppression capacitors in electronic devices**
  - Source: Technical aspects IT systems. https://fournais-bender.dk/storage/TechnAspects-IT-systems.pdf
  - Quote: "Typical interference suppression capacitors in electronic devices range from 10…100 nF."

- **Bender: the larger the system, the smaller the impedance to earth**
  - Source: Technical aspects IT systems. https://fournais-bender.dk/storage/TechnAspects-IT-systems.pdf
  - Quote: "The limits of an IT system are largely determined by its expansion. The larger the system, the smaller the impedance between active conductors and earth."

- **Bender: at about 70 µF the touch voltage can exceed 50 V**
  - Source: Technical aspects IT systems. https://fournais-bender.dk/storage/TechnAspects-IT-systems.pdf
  - Quote: "This means that in a three-phase IT system with a total system leakage capacitance of approx. 70 µF, the touch voltage _U_ T can exceed the value of 50 V, but only if the insulation fault is < 100 Ω. This means that early detection of an insulation fault (e.g. > 100 Ω/V) by an IMD and insulation fault location by an IFLS, can significantly reduce the risk of an excessively high touch voltage"

- **Bender: the biggest source of leakage capacitance today**
  - Source: Electrical Safety Solutions for Harbours and Vessels. https://www.benderinc.com/fileadmin/content/BenderGroup/Documents/Article/en/Harbours_and_Vessels_6.12.20_compressed.pdf
  - Quote: "The biggest source of leakage capacitances nowadays is not the cable network but the filter capacity of poorly chosen vari- able frequency drives and switched- mode power supplies."

- **Bender: first fault current set by leakage capacitance and insulation resistance**
  - Source: Technical aspects IT systems. https://fournais-bender.dk/storage/TechnAspects-IT-systems.pdf
  - Quote: "causes a fault current _I_ d, which is determined by the system leakage capacitance _C_ L-L1 and the insulation resistance"

**What it means for contact voltage**

- **IET Wiring Matters (railways): no return path at the source, so the current is limited by the cable capacitances**
  - Source: Wiring Matters - your insight into BS 7671. https://electrical.theiet.org/media/1469/railway-systems_tm-granger.pdf
  - Quote: "With no connection to earth at the source, there is no return path for the earth fault current, and current is therefore limited by the capacitances previously mentioned."

- **Bender: a person touching an enclosure in an intact unearthed system**
  - Source: IT-System. https://www.bender-uk.com/know-how/technology/it-system/
  - Quote: "he/she won't suffer an electric shock"

- **Cahier 178: networks with large capacitive leakage need care**
  - Source: The IT earthing system (unearthed neutral) in LV. https://download.se.com/files?amp&p_Doc_Ref=ECT178
  - Quote: "Use of the IT system is thus advised against for very long networks"

- **PEC: even an unearthed HV system passes capacitive current in a fault**
  - Source: Capacitive Currents in Unearthed HV Systems.. https://www.pecplc.com/index.php/articles/capacitive-currents-in-unearthed-hv-systems [SECONDARY: a company article]
  - Quote: "In the case of an unearthed HV system, during an earth fault, some current does flow in the capacitance of the generators, cables and transformers."

- **A patent background: an ungrounded system is a capacitive grounded system**
  - Source: US20090147415A1 - GROUND FAULT DETECTION AND LOCALIZATION IN AN UNGROUNDED OR FLOATING DC ELECTRICAL SYSTEM. https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/20090147415
  - Quote: "Consequently, an “ungrounded system” is, as a practical matter, a “capacitive grounded system” by virtue of the distributed stray capacitance."

Computed (my reading, not quotes). The rule is I_fault = 3 x omega x C_phase x V_phase (equal to omega x C_total x V_phase, with
C_total the sum over the three phases).
- Cahier: 0.25 micro-farad per km at 50 Hz is 1 / (2 x pi x 50 x 0.25e-6) = 12.7 kilohms, as the paper says.
- IMarEST: 1 to 5 micro-farad per phase at 450 V and 60 Hz (V_phase 260 V): 3 x 377 x 1e-6 x 260 = 0.29 A, and 5 times that is 1.47 A: the paper's "0.3 to 1.5 A".
- Schneider's table (230/400 V, 50 Hz): omega x C x 230 for 1, 5 and 30 micro-farad is 0.072, 0.36 and 2.17 A: its 0.07, 0.36, 2.17. So that table's "leakage capacitance" is the total over the three phases.
- Eaton, 480 V at 60 Hz with 800 ohms of capacitive reactance per phase: 3 x 277 / 800 = 1.04 A, the figure Eaton calculates from two 0.6 A currents 60 degrees apart.
Cahier's note that a cable's capacitance is a high impedance but "MUST be taken into account" at MV and HV, and the IMarEST discussion's 7 to 10 A per phase on
large vessels, show the first fault stops being a trickle as the system grows. Bender's touch-voltage curve is the safety consequence.


### 4.4 The second fault: two faults on different phases make a phase-to-phase fault through the hull or earth, so the first must be found fast

A second fault on the same conductor changes nothing; a second fault on a different live conductor is, by definition, the second fault, and the
path between the two faults is the hull, the earth, or the protective bonding. How much current flows depends on that path (a common bonded hull or PE gives a
large current; separate earths give less and need RCDs, per the Electrical Installation Guide's second case).

- **Marine Insight: the second fault is a phase-to-phase short through the hull**
  - Source: Ship Earthing Systems: Insulated Networks, Bonding and Earth-Fault Monitoring. https://marineinsight360.com/blogs/ship-earthing-systems-protect-ships [SECONDARY: a trade blog]
  - Quote: "The risk is the second fault. If a different phase goes to earth before the first fault is cleared, the result is a phase-to-phase short circuit through the hull, with heavy current and tripping."

- **Marine Insight: what happens if an earth fault is ignored**
  - Source: Ship Earthing Systems: Insulated Networks, Bonding and Earth-Fault Monitoring. https://marineinsight360.com/blogs/ship-earthing-systems-protect-ships [SECONDARY: a trade blog]
  - Quote: "A second fault on another phase becomes a short circuit through the hull, which can trip essential services, damage equipment and start a fire."

- **EIG: the second fault is a short-circuit between active conductors**
  - Source: IT system - Fault protection - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/IT_system_-_Fault_protection
  - Quote: "The second fault results in a short-circuit between active conductors (phases or neutral) through the earth and/or through PE bonding conductors (unless occurring on the same conductor as the first fault)."

- **EIG: double the loop impedance when setting the overcurrent protection**
  - Source: IT system - Fault protection - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/IT_system_-_Fault_protection
  - Quote: "it is conventional to double the loop impedance of a circuit"

- **EIG: the second fault is an earth fault on a different live conductor**
  - Source: IT system - Principle - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/IT_system_-_Principle
  - Quote: "The second fault (by definition) is an earth fault affecting a different live conductor than that of the first fault"

- **Eaton: the second ground fault acts like a phase-to-phase fault**
  - Source: Characteristics of different power systems neutral grounding techniques: Fact and fiction. https://www.eaton.com/content/dam/eaton/products/medium-voltage-power-distribution-control-systems/vacclad-w-pages/characteristics-power%20systems-neutral-grounding-techniques-fact-fiction-ap083005en.pdf
  - Quote: "Although nothing happens after a single ground fault, the second ground fault acts like a phase-to-phase fault"

- **Eaton: removing the first fault is often trial and error**
  - Source: Characteristics of different power systems neutral grounding techniques: Fact and fiction. https://www.eaton.com/content/dam/eaton/products/medium-voltage-power-distribution-control-systems/vacclad-w-pages/characteristics-power%20systems-neutral-grounding-techniques-fact-fiction-ap083005en.pdf
  - Quote: "This is often difficult and is usually done by trial and error."

- **Marine electrical systems note: a second earth fault on another line**
  - Source: Jee129 Marineelectricalsystems. http://www.iqytechnicalcollege.com/JEE129-MarineElectricalSystems.pdf [SECONDARY: a college-hosted copy of the text]
  - Quote: "If a second earth fault occurs on another line in the vessel, a short circuit current can occur from the first fault to the second via the ship’s hull."

- **A marine ETO site: two earth faults on two different lines**
  - Source: Isolated and Earthed neutral systems on ships | Neutral Earthing Resistor. https://www.electrotechnicalofficer.com/2016/07/insulated-neutral-system-types-of-fault.html [SECONDARY: an exam-preparation site]
  - Quote: "the insulated system requires two earth faults on two different lines to cause the tripping of the equipment."

- **Bender: a second fault introduces the risk of electric shock**
  - Source: Technical aspects IT systems. https://fournais-bender.dk/storage/TechnAspects-IT-systems.pdf
  - Quote: "The occurrence of a second fault will introduce the risk of electric shock"

- **Bender: eliminate the fault before a second one on another conductor**
  - Source: Technical aspects IT systems. https://fournais-bender.dk/storage/TechnAspects-IT-systems.pdf
  - Quote: "An insulation fault should be eliminated as quickly as possible before a second insulation fault occurs on another active conductor"

- **Eaton: transient overvoltages can cause a phase-to-phase fault**
  - Source: Low-voltage high resistance grounding systems basics. https://www.eaton.com/content/dam/eaton/products/low-voltage-power-distribution-controls-systems/hrg/files/lv-hrg-systems-basics-ap019004en.pdf
  - Quote: "This presents a high probability of a phase-to-phase fault and equipment damage"

- **Bender: ignoring faults at sea leaves a second-fault danger**
  - Source: Electrical Safety Solutions for Harbours and Vessels. https://www.benderinc.com/fileadmin/content/BenderGroup/Documents/Article/en/Harbours_and_Vessels_6.12.20_compressed.pdf
  - Quote: "if the insulation faults are ignored, critical and dangerous conditions may arise at sea due to a second fault."

- **Cahier 178: a Markov estimate of double faults (with the assumptions stated there: a day to track and put right a fault)**
  - Source: The IT earthing system (unearthed neutral) in LV. https://download.se.com/files?amp&p_Doc_Ref=ECT178
  - Quote: "and the time needed to track and put right the faulty part is one day, i.e. µ = 1 j. The Markof graph technique gives the representation shown in figure 22 and enables us to calculate that the average time between two double faults is 8,190 days! This corresponds to an average electrical power availability that is 91 times better in IT than in TN or TT."

- **Cahier 178 (fig. 6 caption): contact voltage on a first fault is below the safety voltage**
  - Source: The IT earthing system (unearthed neutral) in LV. https://download.se.com/files?amp&p_Doc_Ref=ECT178
  - Quote: "contact voltage on a first insulation fault is always less than safety voltage."

My reading: the sources agree that the second fault is the whole reason for the monitor. Cahier's Markov estimate (8,190 days between double
faults, 91 times better than TN or TT) rests on its stated assumption that a fault is tracked and put right in a day; it is a model, not a measurement, and the course
should show it as one.


### 4.5 Watching insulation live: earth lamps, insulation monitoring devices, alarm levels in ohms per volt

**Earth lamps.** Three lamps are connected between the three phases and earth (a star, with its star point at earth). On healthy insulation they are a balanced
three-phase load, each at phase voltage and glowing equally. With one phase earthed its lamp is short-circuited and goes dim or out, and the other two see the line voltage and glow
brighter. The lamps are cheap, and Bender notes that they, like any voltage-unbalance indicator, cannot see a symmetrical fault.

**The three-lamp indicator**

- **Marine electrical note: how the three earth lamps behave**
  - Source: Jee129 Marineelectricalsystems. http://www.iqytechnicalcollege.com/JEE129-MarineElectricalSystems.pdf [SECONDARY: a college-hosted copy of the text]
  - Quote: "In (a) the system is healthy, (ie. no earth faults). Thus the three lamps will glow with equal half brilliance. This is because there are two lamps in series across each set of lines. If an earth fault occurs on one line, Figure (b), the lamp connected to the line with the earth fault will dim, while the other lamps will glow brighter. This is since the voltage of the faulty line and the hull is now the same, (due to the earth fault). However, the others have a single lamp across the lines."

- **Cahier 178: the first permanent insulation monitors were three lamps**
  - Source: The IT earthing system (unearthed neutral) in LV. https://download.se.com/files?amp&p_Doc_Ref=ECT178
  - Quote: "These devices used 3 lamps connected between the phases and the earth (see fig. 9 ). On a sound network, the three lamps form a balanced three-phase load, all lit and with the same brilliance."

- **Cahier 178: the lamp across the fault is short-circuited**
  - Source: The IT earthing system (unearthed neutral) in LV. https://download.se.com/files?amp&p_Doc_Ref=ECT178
  - Quote: "When an insulation fault occurs, one of the three lamps is short-circuited by the fault impedance."

- **Marine Insight: earth lamps and monitors**
  - Source: Ship Earthing Systems: Insulated Networks, Bonding and Earth-Fault Monitoring. https://marineinsight360.com/blogs/ship-earthing-systems-protect-ships [SECONDARY: a trade blog]
  - Quote: "Earth lamps: one lamp per phase, each connected between its phase and earth. With healthy insulation they glow equally; a lamp that dims or goes out shows which phase is earthed."

- **Marinesite: the lamp on the earthed line goes dim and the other two brighter**
  - Source: Ship Earth Fault Indicators Working With simple Diagram. https://www.marinesite.info/2018/01/ship-earth-fault-indicators-working-simple-diagram.html [SECONDARY: a trade blog]
  - Quote: "If there is an earth fault occur in one of the line, suppose L3 the lamp connected in that line L3 off or dim and the other two lamps glow brighter."

- **Bender: the "three lightbulb" method cannot detect symmetrical failures**
  - Source: Ground-fault Monitoring. https://www.benderinc.com/know-how/technology/ungrounded-system/ground-fault-monitoring
  - Quote: "In the past, passive methods such as the “three lightbulb” method had been used, but these techniques cannot detect symmetrical failures"

**What an insulation monitor does**

- **Bender: how an insulation monitor works**
  - Source: Insulation monitoring: The concept. https://www.bender-uk.com/know-how/technology/it-system/insulation-monitoring
  - Quote: "The insulation monitoring device is connected between the live supply conductors and earth and superimposes a measuring voltage U m . In the event of an insulation fault, the insulation fault R F closes the measuring circuit between the system and earth, generating a measuring current I m that is proportional to the insulation fault."

- **Bender: IEC 61557-8 requires monitoring of symmetrical and asymmetrical deterioration**
  - Source: Insulation monitoring: The concept. https://www.bender-uk.com/know-how/technology/it-system/insulation-monitoring
  - Quote: "IEC 61557-8 specifies that insulation monitoring devices must support a prescribed measuring principle which enables them to monitor both symmetrical and asymmetrical deteriorations in insulation."

- **Bender: voltage-unbalance earth fault monitors are not insulation monitoring devices**
  - Source: Insulation monitoring: The concept. https://www.bender-uk.com/know-how/technology/it-system/insulation-monitoring
  - Quote: "Devices known as earth fault monitors, which use the voltage unbalance (voltage shift) occurring in the event of an earth fault as a sole measuring criterion, are not insulation monitoring devices under the terms of this standard."

- **Bender: symmetrical and asymmetrical, defined**
  - Source: Insulation monitoring: The concept. https://www.bender-uk.com/know-how/technology/it-system/insulation-monitoring
  - Quote: "A symmetrical deterioration in insulation can be said to occur when the insulation resistance of all conductors in the system to be monitored declines to (approximately) the same extent."

- **Bender: applied-DC measurement on AC, DC and mixed systems**
  - Source: Ground-fault Monitoring. https://www.benderinc.com/know-how/technology/ungrounded-system/ground-fault-monitoring
  - Quote: "Much like an ohmmeter, it applies a voltage between these points to measure resistance. In the event of a ground fault, the fault closes the measuring circuit between the monitored system and ground, resulting in a resistance measurement that may indicate a ground fault. This technique can be used on AC, DC, and mixed AC/DC systems."

**How the injection monitors work**

- **EIG: the injected-signal principle**
  - Source: IT system - Practical aspects - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/IT_system_-_Practical_aspects
  - Quote: "A generator of very low frequency a.c. current, or of d.c. current, (to reduce the effects of cable capacitance to negligible levels) applies a voltage between the neutral point of the supply transformer and earth. This voltage causes a small current to flow according to the insulation resistance to earth of the whole installation, plus that of any connected appliance."

- **EIG: some monitors separate resistive and capacitive leakage**
  - Source: IT system - Practical aspects - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/IT_system_-_Practical_aspects
  - Quote: "Certain versions can distinguish between resistive and capacitive components of the leakage current."

**Threshold levels**

- **EIG: preventive and alarm thresholds (worked example)**
  - Source: IT system - Practical aspects - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/IT_system_-_Practical_aspects
  - Quote: "New installation insulation level: 100 kΩ * Leakage current without danger: 300 mA (fire risk at I>300 mA) * Indication levels set by the consumer: + Threshold for preventive maintenance: 0.8 x 100 = 80 kΩ + Threshold for short-circuit alarm: 500 Ω"

- **EIG: first setting 20% below the insulation level of the new installation**
  - Source: IT system - Practical aspects - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/IT_system_-_Practical_aspects
  - Quote: "Certain national standards recommend a first setting at 20% below the insulation level of the new installation."

- **EIG: damp after a shutdown lowers insulation without a fault**
  - Source: IT system - Practical aspects - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/IT_system_-_Practical_aspects
  - Quote: "humidity can reduce the general level of insulation resistance."

- **EIG: where the monitor connects**
  - Source: IT system - Practical aspects - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/IT_system_-_Practical_aspects
  - Quote: "The PIM device is normally connected between the neutral (or artificial neutral) point of the power-supply transformer and its earth electrode."

- **A marine ETO site: a small DC voltage is injected, maximum monitoring current 250 µA**
  - Source: Isolated and Earthed neutral systems on ships | Neutral Earthing Resistor. https://www.electrotechnicalofficer.com/2016/07/insulated-neutral-system-types-of-fault.html [SECONDARY: an exam-preparation site]
  - Quote: "A small DC voltage is injected into the distribution system. Resulting current indicates the insulation resistance. The maximum earth fault monitoring current is 250 μ A."

- **A marine ETO site: earth fault indicators are lamps or a kΩ meter**
  - Source: Isolated and Earthed neutral systems on ships | Neutral Earthing Resistor. https://www.electrotechnicalofficer.com/2016/07/insulated-neutral-system-types-of-fault.html [SECONDARY: an exam-preparation site]
  - Quote: "Earth fault indicators can be a set of lamps or an ohm meter calibrated in k Ω to show the system insulation resistance value to earth."

**Alarm levels in ohms per volt, as published**

- **GL (Section 20 E): 50 ohms per volt**
  - Source: (I-1-3) Electrical Installations. http://www.iqytechnicalcollege.com/gl_i-1-3_e.pdf [SECONDARY: a college-hosted copy of the text]
  - Quote: "should the insulation resistance of the system fall below 50 ohms per volt of the operating voltage."

- **Bender: set the response value to about 100 ohms per volt**
  - Source: Technical aspects IT systems. https://fournais-bender.dk/storage/TechnAspects-IT-systems.pdf
  - Quote: "The response value of the insulation monitoring device should be set to approx. 100 Ω/V."

- **Bender: the monitor reads the total, all outgoing lines in parallel**
  - Source: Technical aspects IT systems. https://fournais-bender.dk/storage/TechnAspects-IT-systems.pdf
  - Quote: "This total resistance is calculated by adding together the resistive leakage of all outgoing lines connected in parallel to earth."

- **Power Systems Design: typical minimum isolation 100 ohms per volt**
  - Source: Detecting IT Power System Resistive and Capacitive Faults with Insulation Monitoring Technology. https://www.powersystemsdesign.com/articles/detecting-it-power-system-resistive-and-capacitive-faults-with-insulation-monitoring-technology/22/22720
  - Quote: "The typical industry standard for a minimum isolation resistance is 100 ohms/volt."

- **Bender white paper: a typical critical value is 500 ohms per volt**
  - Source: White Paper. https://info.bender-group.com/hubfs/Documents/US/White%20Papers/Insulation%20monitoring%20on%20common%20grounding%20methods.pdf?hsLang=en-us
  - Quote: "A typical critical insulation value is 500 ohms/volt."

- **A vehicle standard: 500 ohms per volt isolation (road-vehicle high-voltage systems)**
  - Source: Automotive High-Voltage and Isolation Leakage Measurements Reference Design (Rev. B). https://www.ti.com/lit/ug/tidudj6b/tidudj6b.pdf
  - Quote: "at least 500 Ω/V of isolation resistance must be maintained from high-voltage systems to chassis ground."

- **Cahier 178: alarm threshold between 500 and 1,000 ohms for a normal industrial installation**
  - Source: The IT earthing system (unearthed neutral) in LV. https://download.se.com/files?amp&p_Doc_Ref=ECT178
  - Quote: "it is thus reasonable, without taking risks, to set the lower alarm threshold at a value of between 500 Ω and 1,000 Ω"

**What the levels are for, and the cost of leakage capacitance**

- **Bender: orders of magnitude for locating (shock after a second fault, fire, control malfunction)**
  - Source: Technical aspects IT systems. https://fournais-bender.dk/storage/TechnAspects-IT-systems.pdf
  - Quote: "The order of magnitude for insulation fault location here ranges from 5…10 kΩ."

- **Bender: heat at a high-resistance fault, fire risk at 60 W**
  - Source: Technical aspects IT systems. https://fournais-bender.dk/storage/TechnAspects-IT-systems.pdf
  - Quote: "There is an acute fire risk even at powers of ≥ 60 W."

- **Bender: small fault currents can make PLCs or contactor controls respond incorrectly**
  - Source: Technical aspects IT systems. https://fournais-bender.dk/storage/TechnAspects-IT-systems.pdf
  - Quote: "the smallest fault currents can cause PLCs or contactor controls to respond incorrectly."

- **Bender: large leakage capacitance slows the monitor (5 tau = RI x Ce)**
  - Source: Technical aspects IT systems. https://fournais-bender.dk/storage/TechnAspects-IT-systems.pdf
  - Quote: "The response time can be estimated by the formula 5 τ = _R_ I x _C_ e where _R_ I is the internal resistance of the insulation monitoring device."

- **Bender: a 24 kΩ fault at 24 V is 1 mA, which matters to 4-20 mA sensors**
  - Source: Electrical Safety Solutions for Harbours and Vessels. https://www.benderinc.com/fileadmin/content/BenderGroup/Documents/Article/en/Harbours_and_Vessels_6.12.20_compressed.pdf
  - Quote: "an insulation fault of 24 kΩ at 24 V means a leakage current of 1 mA"

- **Bender: class societies require an IMD for each isolated system**
  - Source: Electrical Safety Solutions for Harbours and Vessels. https://www.benderinc.com/fileadmin/content/BenderGroup/Documents/Article/en/Harbours_and_Vessels_6.12.20_compressed.pdf
  - Quote: "the classification societies require for each isolated system (unearthed IT system) an insulation monitoring device (IMD) for continuous monitoring and alarming in the event of abnormally low levels."

- **Bender: short-time insulation faults are hard to interpret**
  - Source: Electrical Safety Solutions for Harbours and Vessels. https://www.benderinc.com/fileadmin/content/BenderGroup/Documents/Article/en/Harbours_and_Vessels_6.12.20_compressed.pdf
  - Quote: "Short-time insulation faults are difficult to interpret. If, for example, the insulation value falls below the alarm notification thres- hold value for only ten minutes and then rises again to a normal level, the electrician on board often does not stand a chance in finding the cause of the fault."

- **Bender: only one insulation monitor per connected system**
  - Source: Insulation monitoring device. https://www.benderinc.com/fileadmin/content/Products/m/e/iso415R_D00539_M_XXEN.pdf
  - Quote: "Do not connect insulation monitoring devices in parallel"

- **ABB: disconnect the monitoring device before checking insulation**
  - Source: Insulation monitoring relay CM-IWM.10. https://library.e.abb.com/public/4ae6abdae2ed49ea8df9e28255272da3/2CDC112243D0201_D_CM-IWM.11_data_sheet.pdf
  - Quote: "Before checking insulation and voltage, disconnect the monitoring device from the power source!"

- **Siemens: the monitor covers the whole electrically connected circuit**
  - Source: L87, insulation monitoring - SINAMICS S120 Cabinet Modules liquid cooled - ID: 109975301 - Industry Support Siemens. https://support.industry.siemens.com/cs/mdm/109975301?c=179939062923&dl=en
  - Quote: "the insulation monitoring device monitors the entire electrically-connected circuit for insulation faults."

Computed (my reading): the alarm levels in ohms per volt of the system's nominal voltage, for three systems. 50 ohms per volt: 440 V gives 22 kilohms;
100 ohms per volt: 44 kilohms; 500 ohms per volt: 220 kilohms; on a 24 V control system 100 ohms per volt is 2.4 kilohms. Bender's example of 24 kilohms at 24 V (1 mA, 1,000
ohms per volt) shows why a 4 to 20 mA sensor circuit needs a higher level than a power circuit. The class rule, the manufacturer's booklet and the white paper therefore
set different levels for different purposes (power, fire, control); the source of each figure must go with it.


### 4.6 Insulated DC systems: no earthed pole, the balance (bridge) method, and what a pole-to-earth voltage tells you

A battery or DC board with no earthed pole is the same idea as the AC case with two conductors. The detector has two equal resistors, one from each pole to earth,
so the poles sit at half the bus voltage each when there is no fault; a fault pulls one pole's voltage to earth down and the other up. Vertiv's rules for reading the two
voltages are the heart of this part. Batteries (the next course in the folder) owns cells, charging and hydrogen; this part is only the earth-fault side.

**Reading a floating DC bus**

- **Vertiv: a person who assumes a floating bus is safe can be electrocuted**
  - Source: GROUND DETECTION CIRCUITS FOR STATIONARY APPLICATIONS (IN PLAIN DOWN TO EARTH LANGUAGE). https://www.vertiv.com/48df2a/globalassets/documents/battcon-static-assets/2008/ground-detection-circuits-for-stationary-applications-in-plain-down-to-earth-language.pdf
  - Quote: "Personnel who assume that the floating DC bus is not connected to ground can be electrocuted while working on the DC bus"

- **Vertiv: one pole to ground sets the stage for a short if the other grounds**
  - Source: GROUND DETECTION CIRCUITS FOR STATIONARY APPLICATIONS (IN PLAIN DOWN TO EARTH LANGUAGE). https://www.vertiv.com/48df2a/globalassets/documents/battcon-static-assets/2008/ground-detection-circuits-for-stationary-applications-in-plain-down-to-earth-language.pdf
  - Quote: "If one of the DC bus connections gets connected to the building ground, this sets the stage for a short if the other pole gets shorted to ground as well."

- **Vertiv: the simplest lamp indicator**
  - Source: GROUND DETECTION CIRCUITS FOR STATIONARY APPLICATIONS (IN PLAIN DOWN TO EARTH LANGUAGE). https://www.vertiv.com/48df2a/globalassets/documents/battcon-static-assets/2008/ground-detection-circuits-for-stationary-applications-in-plain-down-to-earth-language.pdf
  - Quote: "The figure below shows the simplest visual indicator, where the lamps both glow with half voltage when no other ground connection is made. When the negative is shorted to the ground terminal, the opposite lamp glows to full brightness."

- **Vertiv: a voltmeter switched between positive and negative to ground**
  - Source: GROUND DETECTION CIRCUITS FOR STATIONARY APPLICATIONS (IN PLAIN DOWN TO EARTH LANGUAGE). https://www.vertiv.com/48df2a/globalassets/documents/battcon-static-assets/2008/ground-detection-circuits-for-stationary-applications-in-plain-down-to-earth-language.pdf
  - Quote: "One version is a voltmeter that can be switched to either the battery positive and building ground or the battery negative and building ground. This left zero voltmeter will show two voltages when switched back and forth. A difference in the amount of indication tells the user if there is an imbalance."

- **Vertiv: an electronic balanced bridge**
  - Source: GROUND DETECTION CIRCUITS FOR STATIONARY APPLICATIONS (IN PLAIN DOWN TO EARTH LANGUAGE). https://www.vertiv.com/48df2a/globalassets/documents/battcon-static-assets/2008/ground-detection-circuits-for-stationary-applications-in-plain-down-to-earth-language.pdf
  - Quote: "This design provides a balanced bridge with equal resistor elements, which is fed into an instrumentation amplifier or comparator circuit. Once the bridge becomes imbalanced, the detection can activate a relay driver or drive a lamp."

- **Vertiv: the detector itself adds a ground connection**
  - Source: GROUND DETECTION CIRCUITS FOR STATIONARY APPLICATIONS (IN PLAIN DOWN TO EARTH LANGUAGE). https://www.vertiv.com/48df2a/globalassets/documents/battcon-static-assets/2008/ground-detection-circuits-for-stationary-applications-in-plain-down-to-earth-language.pdf
  - Quote: "In fact, in order to provide an indication, we end up adding the fault that we are trying to detect."

- **Vertiv: equal readings mean a false alarm**
  - Source: GROUND DETECTION CIRCUITS FOR STATIONARY APPLICATIONS (IN PLAIN DOWN TO EARTH LANGUAGE). https://www.vertiv.com/48df2a/globalassets/documents/battcon-static-assets/2008/ground-detection-circuits-for-stationary-applications-in-plain-down-to-earth-language.pdf
  - Quote: "If the first two measurements are equal (half the bus voltage), then the alarm is false"

- **Vertiv: full voltage on one and zero on the other is a direct short**
  - Source: GROUND DETECTION CIRCUITS FOR STATIONARY APPLICATIONS (IN PLAIN DOWN TO EARTH LANGUAGE). https://www.vertiv.com/48df2a/globalassets/documents/battcon-static-assets/2008/ground-detection-circuits-for-stationary-applications-in-plain-down-to-earth-language.pdf
  - Quote: "If there is full voltage with one measurement and zero volts with the other, then there is a direct short to the bus on the side that measures zero."

- **Vertiv: a slight difference is a partial short**
  - Source: GROUND DETECTION CIRCUITS FOR STATIONARY APPLICATIONS (IN PLAIN DOWN TO EARTH LANGUAGE). https://www.vertiv.com/48df2a/globalassets/documents/battcon-static-assets/2008/ground-detection-circuits-for-stationary-applications-in-plain-down-to-earth-language.pdf
  - Quote: "If there is a slight difference between the first two measurements, then there is a partial short to building ground."

- **Vertiv: shed the loads one at a time**
  - Source: GROUND DETECTION CIRCUITS FOR STATIONARY APPLICATIONS (IN PLAIN DOWN TO EARTH LANGUAGE). https://www.vertiv.com/48df2a/globalassets/documents/battcon-static-assets/2008/ground-detection-circuits-for-stationary-applications-in-plain-down-to-earth-language.pdf
  - Quote: "Often it is easy to shed the loads one at a time to find the partial short through the distribution panel."

- **Vertiv: filter capacitors in DC:DC converters tie to ground**
  - Source: GROUND DETECTION CIRCUITS FOR STATIONARY APPLICATIONS (IN PLAIN DOWN TO EARTH LANGUAGE). https://www.vertiv.com/48df2a/globalassets/documents/battcon-static-assets/2008/ground-detection-circuits-for-stationary-applications-in-plain-down-to-earth-language.pdf
  - Quote: "Since the front end of these DC:DC converters have a filter stage with large capacitors tied to building ground for their input filtering, a fault in the DC:DC converter’s filter can cause a ground fault or at least an imbalance to the DC bus voltage to ground."

- **Vertiv: detectors add in parallel and interact**
  - Source: GROUND DETECTION CIRCUITS FOR STATIONARY APPLICATIONS (IN PLAIN DOWN TO EARTH LANGUAGE). https://www.vertiv.com/48df2a/globalassets/documents/battcon-static-assets/2008/ground-detection-circuits-for-stationary-applications-in-plain-down-to-earth-language.pdf
  - Quote: "As these pieces of equipment get connected in to the system their ground detection circuits add in parallel"

**The balanced bridge, its false alarms, and pole-to-earth voltage**

- **US patent background: DC power systems are ungrounded to promote quality of supply**
  - Source: US9753069B2 - Insulation resistance detection method and circuit for ungrounded DC power supply system - Google Patents. https://patents.google.com/patent/US9753069B2/en
  - Quote: "In order to promote the quality of DC power supply, the DC power supply system is normally ungrounded, i.e. the positive and negative buses thereof are insulated from the ground."

- **US patent background: the balanced bridge method and its false alarms**
  - Source: US9753069B2 - Insulation resistance detection method and circuit for ungrounded DC power supply system - Google Patents. https://patents.google.com/patent/US9753069B2/en
  - Quote: "The balanced bridge detection method is a conventional means of detecting the insulation fault of ungrounded DC power supply systems, in which the ratio of the insulation resistance to ground of the positive bus to that of the negative bus is generally set as 2:1˜10:1."

- **US patent background: balanced bridge false alarms and the unbalanced bridge**
  - Source: US9753069B2 - Insulation resistance detection method and circuit for ungrounded DC power supply system - Google Patents. https://patents.google.com/patent/US9753069B2/en
  - Quote: "the balanced bridge detection method may still create false alarms. The unbalanced bridge detection method is a modification of balanced bridge method. This method is applicable for the positive and negative bus when their insulation resistance falls are equal, and can also detect the insulation resistance value of the positive and negative bus to ground. However, this method cannot identify which branch circuit has a ground fault"

- **US patent background: the pole with lower ground resistance has the lower voltage to ground**
  - Source: US9753069B2 - Insulation resistance detection method and circuit for ungrounded DC power supply system - Google Patents. https://patents.google.com/patent/US9753069B2/en
  - Quote: "The bus with lower ground resistance has a lower voltage to ground; the bus with a higher ground resistance has a higher voltage to ground."

- **US patent background: a 100 V bus with the positive pole leaking to 51 kΩ reads 9.26 V to ground (worked in the text)**
  - Source: US9753069B2 - Insulation resistance detection method and circuit for ungrounded DC power supply system - Google Patents. https://patents.google.com/patent/US9753069B2/en
  - Quote: "When the insulation resistance of the bus to ground gradually decreases to 51 kΩ, its voltage to ground also decreases slowly to 9.26 V (100/(500+51)×51=9.26 V)."

- **US patent background: a single fault gives no leakage current in theory, but stray capacitors give paths**
  - Source: US9753069B2 - Insulation resistance detection method and circuit for ungrounded DC power supply system - Google Patents. https://patents.google.com/patent/US9753069B2/en
  - Quote: "Theoretically, a single point ground fault does not produce a leakage current in ungrounded DC power systems. However, DC power systems may have some grounded stray capacitors and external capacitors, thereby providing some paths for ground fault leakage current. Notably, the paths for leakage current are closed when the charges of the capacitors reach steady state."

- **Bender: symmetrical faults are common on DC systems and control circuits**
  - Source: Insulation monitoring: The concept. https://www.bender-uk.com/know-how/technology/it-system/insulation-monitoring
  - Quote: "Symmetrical insulation faults are common in DC voltage systems and control circuits. If the resistance of both insulation faults is approximately equal, insulation monitoring devices ope-rating on the basis of the principle of superimposed voltage measurement will not be able to detect these insulation faults."

**Other DC notes**

- **IEEE battery committee symposium: consequences of a DC ground fault**
  - Source: Energy Storage & Stationary Battery Committee Winter 2020 Meeting Orlando, FL Technical Symposium 1 Ground Fault Problems & Locating. https://cmte.ieee.org/pes-essb/wp-content/uploads/sites/43/2020/03/2020-WM-Ground-Fault-Problems-and-Locating-multiple-authors.pdf
  - Quote: "Consequences of DC ground fault • Equipment (Relays) fails to work • Failed Batteries • Breaker trip • Multiple ground can lead to high current flows • Damage of equipment • Safety Hazards"

- **IEEE symposium: only supply test current on one side**
  - Source: Energy Storage & Stationary Battery Committee Winter 2020 Meeting Orlando, FL Technical Symposium 1 Ground Fault Problems & Locating. https://cmte.ieee.org/pes-essb/wp-content/uploads/sites/43/2020/03/2020-WM-Ground-Fault-Problems-and-Locating-multiple-authors.pdf
  - Quote: "Only supply test current on one side."

- **IEEE symposium: place the clamp around the return line too to cancel noise**
  - Source: Energy Storage & Stationary Battery Committee Winter 2020 Meeting Orlando, FL Technical Symposium 1 Ground Fault Problems & Locating. https://cmte.ieee.org/pes-essb/wp-content/uploads/sites/43/2020/03/2020-WM-Ground-Fault-Problems-and-Locating-multiple-authors.pdf
  - Quote: "Place the CT around the return line as well as the line you are measuring."

- **Bender iso415R: located faults on DC are given as positive or negative conductor**
  - Source: Insulation monitoring device. https://www.benderinc.com/fileadmin/content/Products/m/e/iso415R_D00539_M_XXEN.pdf
  - Quote: "(positive or negative conductor) in DC systems."

- **ABB insulation relay: it monitors battery networks, UPS systems and networks with frequency inverters**
  - Source: Insulation monitoring relay CM-IWM.10. https://library.e.abb.com/public/4ae6abdae2ed49ea8df9e28255272da3/2CDC112243D0201_D_CM-IWM.11_data_sheet.pdf
  - Quote: "Insulation monitoring of: • Non-earthed DC / AC and mixed IT networks • UPS systems • Networks with frequency inverters • Battery networks"

Computed (my reading): the two pole-to-earth voltages are a potential divider across the bus, so V+ : V- follows R+ : R-, and V+ + V- equals the bus voltage. The
patent works a 100 V example: a positive pole leaking down to 51 kilohms against a 500 kilohm negative side reads 100 / (500 + 51) x 51 = 9.26 V. The trap is that a perfectly
symmetrical leak leaves the two voltages equal, so equal readings do not prove a healthy bus (Bender), and every detector adds its own earth path (Vertiv).


### 4.7 Finding the fault: sectionalising, injected test signals and clamp sensors, and insulation resistance testing once isolated

Three methods. Sectionalising: isolate circuits one at a time until the reading recovers (needs permission, and the essential services covered, at sea). Injected signal: a
locating current of a few mA is pushed between the live conductors and earth by an injector, and a clamp or toroid on each circuit finds where it flows. Dead test: once a
circuit is isolated, a megohmmeter measures it (Dan's IR knowledge), with the electronics disconnected.

**Sectionalising**

- **Marine Insight: finding a fault by isolating circuits one at a time**
  - Source: Ship Earthing Systems: Insulated Networks, Bonding and Earth-Fault Monitoring. https://marineinsight360.com/blogs/ship-earthing-systems-protect-ships [SECONDARY: a trade blog]
  - Quote: "To find a fault, engineers isolate circuits one at a time, with permission and with essential services covered, until the reading recovers. Common causes are water in junction boxes and deck lights, damaged cables, and insulation breaking down in motors and heaters."

**Injected test signals and clamps**

- **Bender: the test current pulse path**
  - Source: Insulation fault location: The concept. https://www.bender.de/en/know-how/technology/it-system/insulation-fault-location-the-concept
  - Quote: "The test current pulse flows from the insulation fault test device via the live conductors, the insulation fault Rf and the earth wire (PE conductor) and back to the insulation fault test device."

- **Bender: the test current is limited**
  - Source: Insulation fault location: The concept. https://www.bender.de/en/know-how/technology/it-system/insulation-fault-location-the-concept
  - Quote: "Electronic current limiting, this connection and the insulation fault create a closed circuit, in which a test current IT idetermined by the system voltage flows. The test current is limited to a maximum value."

- **Bender: the clamps or measuring transformers detect the pulse**
  - Source: Insulation fault location: The concept. https://www.bender.de/en/know-how/technology/it-system/insulation-fault-location-the-concept
  - Quote: "The test current signal is detected by all measuring current transformers on the circuit and evaluated by EDS insulation fault evaluators."

- **Bender portable EDS: clamp-on probes pick up the pulse**
  - Source: N. https://fournais-bender.dk/storage/EDS3065_TGH_en_20040512.pdf
  - Quote: "This current pulse is then detected by the clamp-on probes or measuring current transformers located in the insulation fault path"

- **Bender portable set: locating current 1 to 25 mA and clamp sizes**
  - Source: Portable equipment for insulation fault locationfor energised and deenergised AC and DC systems. https://www.bender.de/fileadmin/content/Products/d/e/EDS309x_D00012_D_XXEN.pdf
  - Quote: "Measuring clamps 20/52 mm (115 mm optional) • Robust aluminium case, convenient to carry • Locating current injectors PGH18… with variable locating current 1…25 mA"

- **EIG: manual fault location with a portable generator and a clamp pick-up**
  - Source: IT system - Practical aspects - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/IT_system_-_Practical_aspects
  - Quote: "The generator may be fixed (example: IM400) or portable (example: XGR permitting the checking of dead circuits) and the receiver, together with the magnetic clamp-type pick-up sensor, are portable."

- **EIG: fixed automatic location with a toroidal CT on each circuit**
  - Source: IT system - Practical aspects - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/IT_system_-_Practical_aspects
  - Quote: "each connected to a toroidal CT embracing the conductors of the circuit concerned) provide a system of automatic fault location on a live installation."

- **Cahier 178: a low-frequency pulse, not lower than 2.5 Hz**
  - Source: The IT earthing system (unearthed neutral) in LV. https://download.se.com/files?amp&p_Doc_Ref=ECT178
  - Quote: "Choice of low frequency for fault tracking ensures no disturbance by network leakage capacities, but this frequency cannot be less than 2.5 Hz"

- **Cahier 178: the older clamp method on each feeder and its two drawbacks**
  - Source: The IT earthing system (unearthed neutral) in LV. https://download.se.com/files?amp&p_Doc_Ref=ECT178
  - Quote: "An initial live tracking method (without interrupting distribution) consisted of using a clamp-on probe to measure the earth “leakage” current on each feeder."

- **Cahier 178: the clamp method fails with long capacitive feeders**
  - Source: The IT earthing system (unearthed neutral) in LV. https://download.se.com/files?amp&p_Doc_Ref=ECT178
  - Quote: "It is not reliable for networks with a large number of feeders some of which are highly capacitive"

- **IEC 61557-9: the system injects a locating current and locates the fault**
  - Source: IEC 61557-9:2023 - IEC 61557-9:2023 CMV. https://cdn.standards.iteh.ai/samples/105391/5afea5375f40470a8dea4df39d94e1a4/IEC-61557-9-2023.pdf [SECONDARY: sample pages on a standards reseller]
  - Quote: "It injects a locating current between the electrical system and earth and locates the insulation fault."

- **Bender: finding the first fault by taking distributors off one at a time (reefer containers)**
  - Source: Electrical Safety Solutions for Harbours and Vessels. https://www.benderinc.com/fileadmin/content/BenderGroup/Documents/Article/en/Harbours_and_Vessels_6.12.20_compressed.pdf
  - Quote: "of the more than 50 reefer containers have to be taken off the system individually to narrow down the fault."

- **Bender: the traditional way, and what is hard at sea**
  - Source: Electrical Safety Solutions for Harbours and Vessels. https://www.benderinc.com/fileadmin/content/BenderGroup/Documents/Article/en/Harbours_and_Vessels_6.12.20_compressed.pdf
  - Quote: "The traditional way to narrow down the fault was sistematic shutdown of feeding distributions. In practice, it is more difficult because not all systems can be switched off on sea and the fault could disappear because the faulty load is already switched off. In this case, the mobile EDS case is a practical help but it is still manual."

**Insulation resistance testing once isolated**

- **GL: switchboard insulation resistance measured at 500 V DC, at least 1 megohm**
  - Source: (I-1-3) Electrical Installations. http://www.iqytechnicalcollege.com/gl_i-1-3_e.pdf [SECONDARY: a college-hosted copy of the text]
  - Quote: "measurement is to be performed at a DC voltage of at least 500 V."

- **Bender: insulation measurement is the test in the de-energised system**
  - Source: Technical aspects IT systems. https://fournais-bender.dk/storage/TechnAspects-IT-systems.pdf
  - Quote: "Insulation measurement is the test in which the insulation resistance is measured between active conductors and the protective conductor in the switched-off or de-energised system"

- **Bender: measurement and monitoring are easily mixed up**
  - Source: Technical aspects IT systems. https://fournais-bender.dk/storage/TechnAspects-IT-systems.pdf
  - Quote: "Insulation measurement and insulation monitoring are terms that are easily mixed up"

- **Megger guide: one megohm per 1,000 volts, minimum one megohm**
  - Source: The Complete Guide to Electrical Insulation Testing. https://www.instrumart.com/assets/Megger-Guide-to-Insulation-Testing.pdf
  - Quote: "Insulation resistance should be approximately one megohm for each 1,000 volts of operating voltage, with a minimum value of one megohm."

- **Bender: offline monitoring of de-energised loads**
  - Source: Electrical Safety Solutions for Harbours and Vessels. https://www.benderinc.com/fileadmin/content/BenderGroup/Documents/Article/en/Harbours_and_Vessels_6.12.20_compressed.pdf
  - Quote: "Insulation faults in deenergised loads cannot be measured with the insu- lation monitoring device of the feeding system."

- **Bender: offline monitor for fire pumps, standby generators and deck machinery**
  - Source: Electrical safety for ships, mobile and fixed offshore platforms. https://www.bender.de/fileadmin/content/Products/b/e/Ships-Offshore_PROSP_en.pdf
  - Quote: "Monitors the insulation resistance of de-energised TN, TT and IT systems, e. g. fire extinguisher pumps, slide-valve drives, standby generators, deck machinery"

- **Bender: check insulation before voltage is switched on to a drive, motor and DC link**
  - Source: Electrical Safety Solutions for Harbours and Vessels. https://www.benderinc.com/fileadmin/content/BenderGroup/Documents/Article/en/Harbours_and_Vessels_6.12.20_compressed.pdf
  - Quote: "Especially at high power it is important to check the insulation resistance of the installation before switching on the voltage, otherwise serious and costly damage will occur. This applies not only to the windings of the drive motor but also to the DC link in the frequency converter."

My reading: Dan met the dead test in Design and verification and in Subsea Cable Testing (insulation resistance, DAR and PI over ten minutes, an isolated core as a charged
capacitor). What is new is that an in-service monitor reads the same quantity live, so the dead test must disconnect or disable the monitor, and that a clamp on a power-frequency
leakage current is unreliable on capacitive feeders (Cahier), which is why the injected signal is low frequency.


### 4.8 Dangers peculiar to insulated systems: arcing (intermittent) earth faults, transient overvoltages, filters and drives giving false readings, and safe working

Electronics lesson 8 named the drive-filter problem in one line; this part goes deeper, not over. The sources disagree on how bad the arcing overvoltage is (Eaton, measured on 480 V industrial plants, against the IMarEST paper on marine systems, and Bender's brochure line that arcing faults "do not occur"), so the brief should teach it as contested. Three families: the arcing earth fault (the capacitor voltage stays where the arc
leaves it, so each restrike starts from a higher voltage), the drive's own earth capacitors (filters and varistors) that turn an IT supply into a partly earthed one, and the working practice.

**Arcing (intermittent) earth faults and transient overvoltages**

- **Eaton: intermittent ground faults make a unique overvoltage problem**
  - Source: Transient overvoltages on ungrounded systems from intermittent ground faults. https://www.eaton.com/content/dam/eaton/markets/healthcare/knowledge-center/white-paper/transient-overvoltages-on-ungrounded-systems-from-intermittent-ground-faults.pdf
  - Quote: "it does provide enough current to create a unique overvoltage problem due to the particular way that intermittent ground faults operate on ungrounded systems."

- **Eaton: the arc goes out at current zero, when the capacitor voltage is at its peak**
  - Source: Transient overvoltages on ungrounded systems from intermittent ground faults. https://www.eaton.com/content/dam/eaton/markets/healthcare/knowledge-center/white-paper/transient-overvoltages-on-ungrounded-systems-from-intermittent-ground-faults.pdf
  - Quote: "The arc, by definition, must extinguish at the next current zero, since there will be zero current flowing at that point. Note that since this current leads the voltage by 90 degrees, the voltage across the phase-to-ground capacitor is at a maximum when the arc extinguishes."

- **Eaton: the capacitor voltage stays where it was**
  - Source: Transient overvoltages on ungrounded systems from intermittent ground faults. https://www.eaton.com/content/dam/eaton/markets/healthcare/knowledge-center/white-paper/transient-overvoltages-on-ungrounded-systems-from-intermittent-ground-faults.pdf
  - Quote: "Because the arc has extinguished, there is now no longer a current to charge or discharge this capacitor and as a result, the phase to ground (i.e. capacitor) voltage remains at whatever value it was prior to the arc interruption."

- **Eaton: half a cycle later the phase is at twice the first line-to-ground voltage**
  - Source: Transient overvoltages on ungrounded systems from intermittent ground faults. https://www.eaton.com/content/dam/eaton/markets/healthcare/knowledge-center/white-paper/transient-overvoltages-on-ungrounded-systems-from-intermittent-ground-faults.pdf
  - Quote: "At this point the A-phase voltage line-to-ground is now _twice_ the first line to ground voltage."

- **Eaton: and then 3 and 4 times the initial voltage**
  - Source: Transient overvoltages on ungrounded systems from intermittent ground faults. https://www.eaton.com/content/dam/eaton/markets/healthcare/knowledge-center/white-paper/transient-overvoltages-on-ungrounded-systems-from-intermittent-ground-faults.pdf
  - Quote: "Note that while the peak phase voltage simply changes sign, the resultant neutral point shifts to yet an even higher voltage relative to ground, in this case 3 times the initial VL-N. This is due to the relative phase position to ground prior to the arc, versus the inverted phasor position after the arc. From this new, higher neutral reference the phasor continues to spin. 180 degrees later at position the phase-to-ground voltage has now risen to a value 4 times the initial phase-to-ground voltage."

- **Eaton: it repeats until some device fails**
  - Source: Transient overvoltages on ungrounded systems from intermittent ground faults. https://www.eaton.com/content/dam/eaton/markets/healthcare/knowledge-center/white-paper/transient-overvoltages-on-ungrounded-systems-from-intermittent-ground-faults.pdf
  - Quote: "until some device fails, typically a lower BIL (Basic Impulse Level) device such as a control power transformer, a motor starter coil, a motor winding or a dry-type transformer. At that point, the failure is permanently shorting that phase to ground and the overvoltages cease."

- **Eaton: multiple simultaneous failures before the phase is shorted**
  - Source: Transient overvoltages on ungrounded systems from intermittent ground faults. https://www.eaton.com/content/dam/eaton/markets/healthcare/knowledge-center/white-paper/transient-overvoltages-on-ungrounded-systems-from-intermittent-ground-faults.pdf
  - Quote: "However, before this happens, there may be multiple, simultaneous failures of electrical and electronic devices"

- **Eaton: measured line-to-ground voltages of 1200 V or higher on a 480 V system**
  - Source: Characteristics of different power systems neutral grounding techniques: Fact and fiction. https://www.eaton.com/content/dam/eaton/products/medium-voltage-power-distribution-control-systems/vacclad-w-pages/characteristics-power%20systems-neutral-grounding-techniques-fact-fiction-ap083005en.pdf
  - Quote: "Measured line-to- ground voltages of 1200 V or higher in these instances are not that uncommon."

- **Eaton: 5.5 per unit on the unfaulted phases**
  - Source: Characteristics of different power systems neutral grounding techniques: Fact and fiction. https://www.eaton.com/content/dam/eaton/products/medium-voltage-power-distribution-control-systems/vacclad-w-pages/characteristics-power%20systems-neutral-grounding-techniques-fact-fiction-ap083005en.pdf
  - Quote: "the voltages to ground are shown at 5.5 per unit (550%) on the unfaulted phases."

- **Eaton: whole-system motor failures while trying to find a ground fault**
  - Source: Characteristics of different power systems neutral grounding techniques: Fact and fiction. https://www.eaton.com/content/dam/eaton/products/medium-voltage-power-distribution-control-systems/vacclad-w-pages/characteristics-power%20systems-neutral-grounding-techniques-fact-fiction-ap083005en.pdf
  - Quote: "There have been many documented cases within industry where multiple equipment failures (e.g., motors) over an entire 480 V system have occurred while trying to find and locate a ground fault."

- **EEP: restriking arcs give large destructive overvoltages in ungrounded systems**
  - Source: Ground faults in ungrounded systems (risks & detection) | EEP. https://electrical-engineering-portal.com/ground-faults-ungrounded-systems
  - Quote: "Restriking arcs after current interruption in the breaker or in the fault can result in large destructive overvoltages in ungrounded systems"

- **EEP: the voltage can overshoot to a potential maximum of +5 pu**
  - Source: Ground faults in ungrounded systems (risks & detection) | EEP. https://electrical-engineering-portal.com/ground-faults-ungrounded-systems
  - Quote: "yet another time overshoot, this time to a potential maximum of +5 pu"

- **Eaton: ungrounded systems can build overvoltages of several times normal**
  - Source: Low-voltage high resistance grounding systems basics. https://www.eaton.com/content/dam/eaton/products/low-voltage-power-distribution-controls-systems/hrg/files/lv-hrg-systems-basics-ap019004en.pdf
  - Quote: "Possible buildup of transient overvoltages that are several times the normal voltage"

**The marine view, and a contested point**

- **IMarEST: arcing earth fault overvoltages can reach 7.5 times in theory**
  - Source: library.imarest.org. https://library.imarest.org/record/2202/files/2229.pdf
  - Quote: "then these phase-to-earth overvoltages can reach 7.5 times the normal rated values."

- **IMarEST: arcing overvoltages are not a problem on marine systems because of damping (a contested point)**
  - Source: library.imarest.org. https://library.imarest.org/record/2202/files/2229.pdf
  - Quote: "Such overvoltages are not a problem on marine systems, however, because of their higher losses and consequent heavy damping."

- **IMarEST: damping so heavy that oscillatory overvoltages "just cannot occur"**
  - Source: library.imarest.org. https://library.imarest.org/record/2202/files/2229.pdf
  - Quote: "When marine systems are considered, dielectric losses are much higher, particularly at the typical natural frequencies of several kilohertz, and the peak overvoltages are further reduced. Indeed, consideration of cable los­ ses alone sometimes shows that damping is greater than critical and thus oscillatory overvoltages in the kilohertz range just cannot occur."

- **IMarEST discussion: arc power at 1 A and at 10 A**
  - Source: library.imarest.org. https://library.imarest.org/record/2202/files/2229.pdf
  - Quote: "An unearthed system with a prospective earth fault current of 1 A would therefore have an earth fault arc power dissipation of only a few watts. Even with a very large earth fault current of, say, 10 A, the power dissipated in the arc will still only be a few hundred watts."

- **Bender: arcing faults, a frequent cause of fire, do not occur (a manufacturer claim)**
  - Source: Electrical safety for ships, mobile and fixed offshore platforms. https://www.bender.de/fileadmin/content/Products/b/e/Ships-Offshore_PROSP_en.pdf
  - Quote: "Arcing faults, a frequent cause of fire, do not occur"

**Drives, filters and false readings**

- **ABB hardware manual: a drive's EMC filter ties the supply to ground through capacitors**
  - Source: EN / ACS380 hardware manual. https://library.e.abb.com/public/2a86caefc9a646d6ba6be02a51401d7c/EN_ACS380_HW_H.pdf?x-sign=uVI95WUGnnSLwIKdHN0mtCica4cmiO2sqwtZQFRUbE3KUcBDVJ7Anb9IZ0mfA4b6
  - Quote: "The supply network becomes connected to ground potential through the internal EMC filter capacitors"

- **ABB: check IT compatibility and disconnect the EMC filter and the ground-to-phase varistor**
  - Source: ACS880 frames R1 to R11 EMC filter and ground-to-phase varistor disconnecting instructions. https://library.e.abb.com/public/b698871f67f14bfe80fcd5da604b4d7b/EN_ACS880_frames%20R1-R11%20EMC%20disconn%20INSTR_L.pdf?x-sign=U9P%2FmBYvtRoLmjB%2BXG2j7bY6HQLq8R4UIFm7NB7Nvq9bwlHi0VfRWIwBS1h3fHIO
  - Quote: "check the compatibility of the drive with IT (ungrounded), corner-grounded delta, midpoint-grounded delta and TT systems • disconnect EMC filter and ground-to-phase varistor."

- **ABB: filter and varistor leakage will trip an RCD on a TT supply**
  - Source: ACS880 frames R1 to R11 EMC filter and ground-to-phase varistor disconnecting instructions. https://library.e.abb.com/public/b698871f67f14bfe80fcd5da604b4d7b/EN_ACS880_frames%20R1-R11%20EMC%20disconn%20INSTR_L.pdf?x-sign=U9P%2FmBYvtRoLmjB%2BXG2j7bY6HQLq8R4UIFm7NB7Nvq9bwlHi0VfRWIwBS1h3fHIO
  - Quote: "EMC filter and ground-to-phase varistor capacitor leakage current will cause the residual current device to trip."

- **Schneider FAQ: a drive on an IT system**
  - Source: How to operate an Altivar Process Drive with an IT or Corner Grounded System | Schneider Electric Australia. https://www.se.com/au/en/faqs/FA318569
  - Quote: "The drives have a built-in EMC filter. As a result they exhibit leakage current to ground."

- **Schneider FAQ: use a monitor compatible with non-linear loads**
  - Source: How to operate an Altivar Process Drive with an IT or Corner Grounded System | Schneider Electric Australia. https://www.se.com/au/en/faqs/FA318569
  - Quote: "Use a permanent insulation monitoring device compatible with nonlinear loads"

- **Schneider FAQ: with the filter disconnected the drive does not meet IEC 61800-3**
  - Source: How to operate an Altivar Process Drive with an IT or Corner Grounded System | Schneider Electric Australia. https://www.se.com/au/en/faqs/FA318569
  - Quote: "In this configuration the product does not meet the EMC requirements according to the standard IEC 61800-3"

- **TDK: leakage currents on variable frequency drives**
  - Source: EMC filters - Technical information. https://www.tdk-electronics.tdk.com/download/3107180/7f30b0110a521bb506ace36f0c56af5c/pdf-technical-information.pdf
  - Quote: "At variable frequency drives, leakage currents are to be expected from upstream EMC filters, from the converter itself"

- **Cahier 178: capacitive current can trip RCDs by sympathy**
  - Source: The IT earthing system (unearthed neutral) in LV. https://download.se.com/files?amp&p_Doc_Ref=ECT178
  - Quote: "capacitive current flow can cause nuisance tripping of the RCDs “by sympathy”."

- **Cahier 178: high capacitive leakage disturbs monitors and fault tracking**
  - Source: The IT earthing system (unearthed neutral) in LV. https://download.se.com/files?amp&p_Doc_Ref=ECT178
  - Quote: "High “capacitive leakages” disturb insulation monitoring using PIMs with AC current injection and tracking of the first fault"

- **Bender: DC components distort the measurement on AC**
  - Source: Insulation monitoring: The concept. https://www.bender-uk.com/know-how/technology/it-system/insulation-monitoring
  - Quote: "If it is used in AC, 3(N)AC systems containing galvanically connected DC components, these DC currents will distort the measurement result."

- **Bender: the larger the leakage capacitance, the longer the measuring time**
  - Source: Electrical Safety Solutions for Harbours and Vessels. https://www.benderinc.com/fileadmin/content/BenderGroup/Documents/Article/en/Harbours_and_Vessels_6.12.20_compressed.pdf
  - Quote: "The larger the system in terms of leakage capacitance, the longer the measuring time."

**Safe working**

- **HSE GS38: work dead wherever possible**
  - Source: Electrical test equipment for use on low voltage electrical systems - HSE. https://www.hse.gov.uk/pubns/books/gs38.htm
  - Quote: "Wherever possible, all work on electrical systems should be carried out with the system dead."

- **Bender: touch voltage is below 50 V AC, 120 V DC for safety**
  - Source: Technical aspects IT systems. https://fournais-bender.dk/storage/TechnAspects-IT-systems.pdf
  - Quote: "the electrical safety of persons is guaranteed if the touch voltage is < 50 V (AC) or < 120 V (DC)."

- **MOTOR myth buster: a floating system with a latent first fault behaves like a grounded one**
  - Source: EVPRO+ Myth Buster: One-Hand Rule and HV Safety Standards | MOTOR. https://www.motor.com/2026/05/evpro-myth-buster-one-hand-rule-and-hv-safety-standards/
  - Quote: "an IT (i.e., not grounded to earth) system with a latent first fault behaves exactly like a grounded system."

- **MOTOR myth buster: once one rail is referenced to chassis, chassis becomes a return path**
  - Source: EVPRO+ Myth Buster: One-Hand Rule and HV Safety Standards | MOTOR. https://www.motor.com/2026/05/evpro-myth-buster-one-hand-rule-and-hv-safety-standards/
  - Quote: "Once one rail is referenced to chassis—by coolant intrusion, a degraded Y-capacitor, a pinched cable jacket, or the technician’s own probe slip—chassis becomes a return path."

- **Bender: an insulation monitor is mandatory in an IT system**
  - Source: IT-System. https://www.bender-uk.com/know-how/technology/it-system/
  - Quote: "As required by the standards, an insulation monitoring device is mandatory in an IT system."

**Limiting the overvoltage**

- **Cahier 178: a surge limiter between the neutral and earth, its short-circuiting is reported by the monitor like a fault**
  - Source: The IT earthing system (unearthed neutral) in LV. https://download.se.com/files?amp&p_Doc_Ref=ECT178
  - Quote: "its short-circuiting is reported by the PIM just as an insulation fault."


## 5. Prerequisites: what this topic leans on, which Dan has, and what must be taught inline

What Dan has from the built courses (names from their briefs, in docs/courses/electrical/):
- **AC circuits** (ten lessons): lesson 5 Capacitance (the store that fills and empties; current leads voltage); lesson 10 Three-phase: star and delta (line voltage is root three times phase voltage). These two carry the phasor picture and the capacitance sum.
- **Electronics and power electronics** (eight lessons): lesson 8 Living with power electronics names an insulated supply in one line and the drive EMC filter that must be disconnected; this course goes deeper on exactly that.
- **Design and verification** (ten lessons): lesson 6 Shock protection and when Zs is too high (the ADS contrast); lesson 9 Verification and handover (whether insulation resistance testing is taught there is **UNCONFIRMED** from the brief; Dan's EAL specifications list it, section 3.5).
- **HV Subsea Cable Testing** (seven lessons): lesson 1 (the isolated core as a charged capacitor), lesson 3 insulation resistance over ten minutes (IR, DAR, PI), lesson 6 TDR (fault location on a cable, a different method from the one here).
- **Foundations**: Trigonometry and Complex numbers and Vectors (for the phasors), Calculus fundamentals lesson 5 (i = C dv/dt, which AC lesson 5 uses to say the current is zero when the voltage is at a peak), Exponentials and logarithms and Differential equations (RC behaviour of the monitor's response time, 5 tau), Linear systems and Solving equations (potential dividers).
Taught inline, in the lesson that needs it: (a) what "earth" and "the hull" mean as a conductor and a reference, and why a system can float; (b) the potential divider formed by leakage resistances to earth (DC lesson); (c) ohms per volt as a unit; (d) that leakage resistances to earth are in parallel, so the monitor reads the total; (e) the capacitive current formula applied to leakage (a one-line use of AC lesson 5); (f) the arc going out at current zero when a capacitor's voltage is at its peak (AC lesson 5's 90 degrees applied to a fault).
Deferred, with where the ground goes: Batteries (same folder, built alongside) owns cells, charging and hydrogen; Generators and paralleling owns paralleling and the rule that insulated neutral points are not tied together (GL's line is in 2.3 only as a pointer); Transformers and magnetics owns isolating transformers' magnetics (this course uses an isolating transformer only as the way to make an insulated supply, per the Electrical Installation Guide and Bender's operating-theatre example).


## 6. Misconceptions and learning science for each skill, with sources

### 6.1 Earthed means safe, and its mirror image

Skill: earthing systems compared. The misconception named by an engineering firm: "grounded means safe from shock". Its mirror in this topic is "unearthed means
no shock, no current". A DO screen should make Dan predict what a person touching a live conductor of an insulated system feels with (a) a small system and (b) a big, capacitive one.

- **nVent: the most common misconception is that a grounded system is safe from shock**
  - Source: Grounding Myths. https://go.nvent.com/rs/760-EGW-100/images/nVent%20ERICO%20Grounding%20Myths.pdf
  - Quote: "the most common misconception is that if the system is grounded it is safe from electric shock."

- **nVent: in an insulated system the fault uses earth as a return path, it does not dissipate to ground**
  - Source: Grounding Myths. https://go.nvent.com/rs/760-EGW-100/images/nVent%20ERICO%20Grounding%20Myths.pdf
  - Quote: "If the electrical system is insulated, like in the case of ungrounded delta configuration, the fault uses earth as a return path"

- **nVent: current leaves the source and returns to it**
  - Source: Grounding Myths: Part 1 – Low Earth Resistivity, Earthing vs Grounding, Electrical Currents | nVent ERICO. https://blog.nvent.com/grounding-myths-part-1
  - Quote: "In an electrical circuit, the current leaves the source and returns back to the source."


### 6.2 Examiner reports and Bitesize on the earth wire

Skill: what the earth connection does. (NCTM is a maths body, so nothing from it applies to this topic.) WJEC and Edexcel examiner reports (GCSE and IGCSE physics) record the common errors. AQA and OCR examiner reports on this were not
found (**UNCONFIRMED**), and Bitesize states the right explanation without naming a mistake; Oak National Academy's lesson names one. The earth wire's job is to give a low-resistance path so
a large fault current melts the fuse: that is exactly what an IT system does not do on the first fault.

- **WJEC examiner report: a common misconception that extra electricity flows through the earth wire**
  - Source: WELSH JOINT EDUCATION COMMITTEE. https://www.wjec.co.uk/media/2nnkansq/gcse-physics-examiners-report-summer-2017.pdf
  - Quote: "A common misconception was that ‘extra electricity’ flows through the earth wire."

- **WJEC examiner report: the function of the earth wire was not known by most candidates**
  - Source: WELSH JOINT EDUCATION COMMITTEE. https://www.wjec.co.uk/media/2nnkansq/gcse-physics-examiners-report-summer-2017.pdf
  - Quote: "The function of the earth wire was not known by most candidates"

- **Edexcel examiners' report: earthing and double insulation confused**
  - Source: Exam Materials. https://qualifications.pearson.com/content/dam/pdf/Edexcel%20Certificate/Physics/2011/Exam%20materials/4PH0_1P_pef_20170823.pdf
  - Quote: "Students often confused the purpose of earthing and double insulation in parts (aiii) and (aiv) and just under 40% failed to gain a mark."

- **Oak National Academy: a named misconception about short circuits**
  - Source: Short circuits and earth wires GCSE | KS4 | Y11 Physics Higher Edexcel | Lesson Resources | Oak National Academy. https://www.thenational.academy/teachers/programmes/physics-secondary-ks4-higher-edexcel/units/mains-electricity/lessons/short-circuits-and-earth-wires
  - Quote: "Common misconception A short circuit is a circuit that doesn’t work."

- **BBC Bitesize: the earth wire gives a low-resistance path and melts the fuse**
  - Source: Electrical safety - IGCSE Physics - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/zjm3jfr
  - Quote: "a large current will flow through the low-resistance earth wire."


### 6.3 Research on circuit misconceptions

Skills: first fault and capacitance (no loop, so no current), and the pole-to-earth voltage. IOPSpark's reviews and the physics-education papers show the common ideas: current used up,
reasoning in terms of current rather than potential difference, circuits as a sequence of causes, voltage the hardest concept, a capacitor as a barrier that charge cannot cross.

- **IOPSpark: students reason in terms of current and much less in terms of potential difference**
  - Source: Students often consider the behaviour of a circuit in terms of current and much less often in terms of potential difference | IOPSpark. https://spark.iop.org/students-often-consider-behaviour-circuit-terms-current-and-much-less-often-terms-potential
  - Quote: "Students often consider the behaviour of a circuit in terms of current and much less often in terms of potential difference"

- **IOPSpark: students see circuits as a sequence of causes and effects**
  - Source: Many students see circuit behaviour as a sequence of causes and effects, rather than seeing the whole circuit as an interacting system | IOPSpark. https://spark.iop.org/many-students-see-circuit-behaviour-sequence-causes-and-effects-rather-seeing-whole-circuit
  - Quote: "Many students see circuit behaviour as a sequence of causes and effects, rather than seeing the whole circuit as an interacting system"

- **IOPSpark: current being used up and clashing currents**
  - Source: Some students have differing ideas about what is happening in the wires of an electric circuit when it is working | IOPSpark. https://spark.iop.org/some-students-have-differing-ideas-about-what-happening-wires-electric-circuit-when-it-working
  - Quote: "being ‘used up’ as it passed through components or bulbs powered by ‘clashing currents’"

- **A Turkish secondary-school study on ERIC (probably Kucukozer and Kocakulah 2007, which IOPSpark cites): "current is consumed" is reported in almost all studies**
  - Source: Microsoft Word - 8 hüzeyining. https://files.eric.ed.gov/fulltext/ED564331.pdf
  - Quote: "The misconception of “current is consumed by circuit components” which is listed above is almost reported in all studies about electric circuits."

- **Physical Review PER (2021): voltage is the most difficult concept of the circuit basics**
  - Source: Development of a two-tier instrument on simple electric circuits | Phys. Rev. Phys. Educ. Res.. https://link.aps.org/doi/10.1103/PhysRevPhysEducRes.17.020123
  - Quote: "the concept of voltage is most difficult for students while distinguishing between open and closed circuits is the easiest."

- **A review hosted by Pacific University (the address names Wainwright): a remembered capacitor "barrier" that charge cannot flow through**
  - Source: Microsoft Word - MisconceptionsArticle.06.doc. https://fg.ed.pacificu.edu/wainwright/Publications/MisconceptionsArticle.06.pdf [SECONDARY: a university course paper]
  - Quote: "it contains a very high resistance barrier so that charge cannot flow through it"

- **The same review (citing Duit and others): voltage treated like current; battery thought of as a constant-current source**
  - Source: Microsoft Word - MisconceptionsArticle.06.doc. https://fg.ed.pacificu.edu/wainwright/Publications/MisconceptionsArticle.06.pdf [SECONDARY: a university course paper]
  - Quote: "Even after instruction students use the voltage concept as having approximately the same properties as the current concept. They tend to think of a battery as a source of constant current rather than a source of constant voltage."

- **A physics Q&A: if there is no other end of the circuit, how can current flow into a person?**
  - Source: electric circuits - Why do we need an earth wire? - Physics Stack Exchange. https://physics.stackexchange.com/questions/733553/why-do-we-need-an-earth-wire [SECONDARY: a Q&A site]
  - Quote: "how would current be able to flow into the person and cause an electric shock if there was no ”other end of the circuit”?"

My reading: each maps to a screen. "No return path, so no current" is the physics Q&A's own question; the capacitor "barrier" is the reason the first-fault current is surprising;
reasoning in current rather than potential difference is the trap in reading pole-to-earth voltages.


### 6.4 "A first fault can wait"

Skill: the second fault. Two sources say the same thing from two sides: the low current makes it easy to ignore, and the standard says clear it with the shortest practicable delay.

- **EEP: low fault current makes it easy to ignore the fault**
  - Source: Ground faults in ungrounded systems (risks & detection) | EEP. https://electrical-engineering-portal.com/ground-faults-ungrounded-systems
  - Quote: "As the fault current is very low, it is easy to ignore the fault and continue operation."

- **Bender: the standard says eliminate the first fault with the shortest practicable delay**
  - Source: Technical aspects IT systems. https://fournais-bender.dk/storage/TechnAspects-IT-systems.pdf
  - Quote: "a first fault must be eliminated with the shortest practicable delay"


### 6.5 Learning science for these skills

Predict-observe-explain is the standard way to meet a misconception that people hold with confidence; here the prediction is "what happens at the first fault". Retrieval practice beats
elaborative study for meaningful learning (Karpicke and Blunt, Science 2011), and the 2025 and 2026 papers compare it with worked examples, which is the app's own predict, play, explain, say it back,
spaced review pattern.

- **APA: predict-observe-explain**
  - Source: How do I get my students over their alternative conceptions (misconceptions) for learning. https://www.apa.org/education-career/k12/misconceptions
  - Quote: "In the ”predict-observe-explain” (P-O-E) strategy, the teacher plans/presents a demonstration or example"

- **APA: students explain why their observations conflicted with their predictions**
  - Source: How do I get my students over their alternative conceptions (misconceptions) for learning. https://www.apa.org/education-career/k12/misconceptions
  - Quote: "the students must explain why their observations conflicted with their predictions."

- **TU Delft ShowingPhysics: predictions held with confidence that turn out wrong**
  - Source: 12. Predict Explain Observe Explain — ShowingPhysics. https://interactivetextbooks.tudelft.nl/showthephysics/Pedagogy/PoE.html
  - Quote: "In many phenomena, students and laypeople come up with predictions in which they have a lot of confidence, that yet turn out to be wrong."

- **J. Phys. Conf. Ser. (2018): POE strategy is effective to remediate misconceptions (heat and temperature)**
  - Source: Open Access proceedings Journal of Physics: Conference series. https://iopscience.iop.org/article/10.1088/1742-6596/1171/1/012051/pdf
  - Quote: "It can be concluded that POE learning strategy is effective to remediate the eleventh-grade students' misconception"

- **Karpicke and Blunt (Science, 2011): retrieval practice beats elaborative studying**
  - Source: Retrieval practice produces more learning than elaborative studying with concept mapping - PubMed. https://pubmed.ncbi.nlm.nih.gov/21252317
  - Quote: "practicing retrieval produces greater gains in meaningful learning than elaborative studying with concept mapping."

- **Karpicke and Blunt: the advantage held for inference questions**
  - Source: Retrieval practice produces more learning than elaborative studying with concept mapping - PubMed. https://pubmed.ncbi.nlm.nih.gov/21252317
  - Quote: "The advantage of retrieval practice was observed with test questions that assessed comprehension and required students to make inferences."

- **Educational Psychology Review (2026): worked examples reduce cognitive load; retrieval stayed superior with varied items**
  - Source: Striking the Balance: How Variability Shapes Retrieval Practice and Worked Examples for Transfer Learning | Educational Psychology Review | Springer Nature Link. https://link.springer.com/article/10.1007/s10648-026-10169-w
  - Quote: "Worked examples reduce cognitive load by providing step-by-step guidance on solutions"

- **Educational Psychology Review (2026): retrieval outperformed worked examples when materials were repeated**
  - Source: Striking the Balance: How Variability Shapes Retrieval Practice and Worked Examples for Transfer Learning | Educational Psychology Review | Springer Nature Link. https://link.springer.com/article/10.1007/s10648-026-10169-w
  - Quote: "As predicted, retrieval practice outperformed worked examples when materials were repeated."

- **ScienceDirect paper (2025): retrieval practice inside stepwise worked examples**
  - Source: Retrieval Practice in Stepwise Worked Examples Improves Learning - ScienceDirect. https://www.sciencedirect.com/science/article/pii/S0959475225001203
  - Quote: "There is much empirical evidence that example-based learning is an effective strategy for learning"


## 7. Where it is used for an electrician going into marine engineering

### 7.1 Beyond ships: the same idea elsewhere

These show the idea is general, which suits foundations that see Dan through a new topic.

- **Bender: operating-theatre isolating transformers and a medical IT system**
  - Source: Electrical Safety Solutions for Harbours and Vessels. https://www.benderinc.com/fileadmin/content/BenderGroup/Documents/Article/en/Harbours_and_Vessels_6.12.20_compressed.pdf
  - Quote: "An isolating transformer, which is required for every operating theatre in a hospital, limits the leakage capacitance"

- **An Australian rail signalling standard: signalling power uses the IT system**
  - Source: ESS-09-02. https://extranet.artc.com.au/docs/eng/signal/procedures/design/ESS-09-02.pdf
  - Quote: "Signalling power supplies use the IT system of protection as defined in IEC 60364 Part 1."

- **Schneider Cahier: IT system compulsory in French hospital operating theatres**
  - Source: The IT earthing system (unearthed neutral) in LV. https://download.se.com/files?amp&p_Doc_Ref=ECT178
  - Quote: "in France the IT system is compulsory in hospital operating theatres"

- **Bender: EV high-voltage drive systems are unearthed (IT)**
  - Source: ISOMETER® iso165C + iso165C-1. https://www.bender.de/fileadmin/content/Products/m/e/iso165C_C1_D00154_M_XXEN.pdf
  - Quote: "unearthed DC drive system (IT system) in electric vehicles"

- **Bender isoPV425 (photovoltaic): monitoring of unearthed AC and DC systems with galvanically connected rectifiers or frequency converters**
  - Source: Insulation monitoring device for unearthed DC circuits (IT systems) for photovoltaic systems up to 3(N)AC, AC 690 V / DC 1000 V. https://www.bender.de/fileadmin/content/Products/m/e/isoPV425_D00028_M_XXEN.pdf
  - Quote: "Monitoring for unearthed AC and DC systems with galvanically connected rectifiers or frequency converters"


### 7.2 On ships (public, general marine equipment)

Each is a use with a quote from a reachable page.

- **A marine engineering resource: most marine LV distribution is ungrounded IT**
  - Source: Ground Fault Monitoring at Sea: Design, Testing, and Class Compliance | Marine Engineering Resources — SDCI Trust Group | SDCI Trust Group. https://www.sdcitrustgroup.com/resources/ground-fault-monitoring-guide [SECONDARY: a company resource page]
  - Quote: "Most marine low-voltage distribution systems (400-690V) utilize ungrounded (IT - Isolated Terra) configurations"

- **Bender: container-ship reefer distributions are usually unearthed**
  - Source: Electrical Safety Solutions for Harbours and Vessels. https://www.benderinc.com/fileadmin/content/BenderGroup/Documents/Article/en/Harbours_and_Vessels_6.12.20_compressed.pdf
  - Quote: "To ensure availabil- ity, these systems are usually unearthed."

- **Bender: ship automation runs on 24 V DC control, monitored as an isolated system**
  - Source: Electrical Safety Solutions for Harbours and Vessels. https://www.benderinc.com/fileadmin/content/BenderGroup/Documents/Article/en/Harbours_and_Vessels_6.12.20_compressed.pdf
  - Quote: "The ship automation system and most other systems on board have an internal control voltage of DC 24 V."

- **Bender: the ETO can work on site to narrow down insulation faults**
  - Source: Electrical Safety Solutions for Harbours and Vessels. https://www.benderinc.com/fileadmin/content/BenderGroup/Documents/Article/en/Harbours_and_Vessels_6.12.20_compressed.pdf
  - Quote: "the ETO can also work on-site to further narrow down insulation faults"

- **Bender: shore power cables are checked before switching on**
  - Source: Electrical Safety Solutions for Harbours and Vessels. https://www.benderinc.com/fileadmin/content/BenderGroup/Documents/Article/en/Harbours_and_Vessels_6.12.20_compressed.pdf
  - Quote: "the insulation resistance of the individual cables and the secondary side of the onshore power supply transformer must also be checked before switching on."


## 8. Size: how many lessons the benchmarks spend, and which core supports 8 lessons for Dan

### 8.1 The numbers

Brilliant's Circuits is 31 lessons in 7 levels (about 4.4 a level, about 11 exercises a lesson), Digital Circuits 32. Bender UK's IT section is 9 pages; Cahier technique 178 is 6
chapters over about 26 pages; the Electrical Installation Guide's IT group is 4 pages; Pearson's HN unit is 15 credits, 60 guided learning hours (section 3.4). EAL's whole BS 7671 award is one unit of 35 guided learning hours.

- **EAL BS 7671 award: one unit of 35 guided learning hours**
  - Source: EAL Level 3 Award in the Requirements for Electrical Installations BS 7671:2018. https://eal.org.uk/qualifications/eal-level-3-award-in-the-requirements-for-electrical-installations-bs-7671-2018
  - Quote: "The qualification comprises a single knowledge unit which has 35 guided learning hours."


### 8.2 Which core supports eight lessons

Each of Dan's eight scope parts has at least two independent sources in this file, so eight lessons can be built on public text:

| # | Scope part | Core sources (section) |
|---|---|---|
| 1 | TN, TT, IT by the star point; why ships run insulated | EIG Characteristics and Principle (2.1, 4.1); Wiring Matters (3.5); marine notes, Marine Insight, Bender at sea (4.1) |
| 2 | First fault: tiny current, healthy phases to line voltage; the phasor picture | EIG Fault protection; Eaton fact and fiction; EEP; SEL; Cahier chapter 2.1 (4.2) |
| 3 | Capacitance to earth and the charging current | IMarEST; Cahier 1.4; EIG table; Eaton; Bender booklet (4.3) |
| 4 | The second fault | EIG; Eaton; Marine Insight; Cahier chapter 3 (4.4) |
| 5 | Lamps, monitors, ohms per volt | Cahier 2.2; Bender; EIG; GL; IEC 61557-8 (4.5, 2.2, 2.3) |
| 6 | Insulated DC and the balance method | Vertiv; patent background; IEEE slides; Bender (4.6) |
| 7 | Finding the fault; IR testing once isolated | Bender fault location; Cahier 2.3; EIG; Vertiv; GL and LR test rules (4.7) |
| 8 | Arcing faults, drive filters, safe working | Eaton transient paper; IMarEST; ABB and Schneider drive notes; GS38; Vertiv (4.8) |

Cahier technique 178 (chapters 2, 3 and 4) plus the Electrical Installation Guide's IT pages is the core for lessons 2, 4, 5 and 7; Eaton and the IMarEST paper carry lessons 3 and 8; Vertiv and
the patent background carry lesson 6. A ninth lesson would split lesson 8 into arcing faults, and drives and safe working, as the Electronics brief did for its lesson 8.
My reading: nine is justified only if the arcing faults get their own interactive.


## 9. Unconfirmed and gaps

- Brilliant: what is inside each Circuits lesson (titles only).
- DNV, ABS, Bureau Veritas and IACS rule text on insulated distribution; the Lloyd's Register alarm level in ohms per volt.
- The SQA Electro-technology syllabus text; the MCA engineer officer oral syllabus text for insulated neutral systems.
- The exact EAL specification texts for Dan's own certificates (the L3 BS 7671, Initial Verification and Periodic Inspection awards); the EAL spec used is the electrotechnical Level 3 one.
- AQA and OCR examiner reports on earthing; a research paper on IT-system misconceptions (none found; the IT-specific misconceptions come from engineering white papers).
- Outlines of Bender seminars and the IET talk.
- Chapter lists of Reeds Vol 6 and Hall's Practical Marine Electrical Knowledge.
- Whether marine low-voltage systems really suffer 1,000 V-class arcing overvoltages (Eaton) or are damped (IMarEST): contested; no marine low-voltage measurement was found.
