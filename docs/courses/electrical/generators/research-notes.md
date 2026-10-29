# Generators and paralleling: research notes

Researched 29 Oct 2026 for the Generators and paralleling course brief (the second course in the Electrical shelf's Power and machines
folder: Motors, Generators and paralleling, HV Subsea Cable Testing; blurb "How an alternator makes its voltage, the AVR and the
governor, synchronising, load sharing and reverse power."; benchmark any Brilliant electricity or electromagnetism course still
reachable, and failing that the nearest public course on synchronous machines). The brief itself is not written here; these notes are
its evidence. Dan is an electrician and a Royal Navy submariner on the electrical engineering path; next year he does a Level 3 marine
engineering course (general engineering first, then submarine and nuclear propulsion). He asked for foundations that see him through
any new topic, not a remake of that course. Everything below is general marine and industrial diesel generator sets: nothing here is
about how the Royal Navy or a particular boat does it, nothing is from a submarine's own systems beyond the public outline in
CLAUDE.md, and none of Dan's SMQ books was opened.

Every finding has its source title, URL and the exact words, copied from a saved tool result by script (the quotes were not retyped
into this file). All of them are listed in `quotes.json` beside this file and were checked with
`node tools/eval/sources.mjs --quotes ... --tools ...` (`failed: 0`). The tool files are in `tools/`. Findings I could not confirm are
marked **UNCONFIRMED**; where only a non-original site said it, **SECONDARY** (lecture notes, trade blogs, hosts that republish an
original text). My own readings are marked "My reading" and are not quotes. Numbers I computed are marked "computed".

Note on the search tool: the checker shortens every saved result, so a page is quoted only where its shortened text keeps the words.
That is why many sources were fetched one at a time after the first searches.

---

## 1. Benchmark: Brilliant, and the nearest course on synchronous machines
Brilliant has no course on machines or generators. The two electricity courses still reachable on brilliant.org are Electricity and
Magnetism and Circuits; neither reaches a rotating machine. The nearest public courses that do are a Wisconsin online course
(syllabus skills only) and a free online Electrical Machines textbook whose Synchronous Machines part is a lesson list.

### 1.1 Brilliant: Electricity and Magnetism
The page is `brilliant.org/courses/electromagnetism`. The saved copy is dated 17 Feb 2025 (an older copy than the Circuits page).
It lists **9 lessons and no levels**, in this order: Unlocking Electricity, The Sand Grain Analogy, A Sticky Situation, Net Charge,
Coulomb's Law, What are Fields?, Charges on a String, Ions in Solution, Parallel Charged Plates. The topics-covered list names
Faraday's Law, the Lorentz Force Law and Maxwell's Equations, but the lesson titles stop at electrostatics, so what the course teaches
about induction is **UNCONFIRMED** (I did not see a lesson). Brilliant's course index, `brilliant.org/courses/`, and the guessed
addresses `/courses/electricity-and-magnetism/` and `/courses/electric-circuits/` returned only a cookie panel when fetched, so the
whole path around it is **UNCONFIRMED**; what the page itself says of its place is below. My reading: it is electrostatics and fields first,
so it sits well before machines, which fits the app putting Transformers and magnetism (built) before this course.

- **Brilliant Electricity and Magnetism is 9 lessons; the list**
  - Source: Practice Electricity and Magnetism | Brilliant. https://brilliant.org/courses/electromagnetism
  - Quote: "9 Lessons Unlocking Electricity The Sand Grain Analogy A Sticky Situation Net Charge Coulomb's Law What are Fields? Charges on a String Ions in Solution Parallel Charged Plates"
- **Its description: the physical laws, demos**
  - Source: Practice Electricity and Magnetism | Brilliant. https://brilliant.org/courses/electromagnetism
  - Quote: "In this course, you will discover the physical laws of electricity and magnetism that let these devices perform their designed functions. Throughout this course, you will have opportunities to observe the principles of electricity and magnetism in action via demos that we handpicked and filmed. The focus, here, is on the physical observations that inspired Maxwell's famous field equations, which tell us how electric and magnetic fields operate across the universe."
- **Its topics covered, with Faraday's law but no machines**
  - Source: Practice Electricity and Magnetism | Brilliant. https://brilliant.org/courses/electromagnetism
  - Quote: "Topics covered * Charge * Coulomb’s Law * Electric Fields * Conductors * Capacitance * Current * Hands-on Experiments * Kirchoff’s Circuit Rules * Ampere’s Law * Faraday’s Law * Lorentz Force Law * Magnetic Fields * Gauss’ Law * Maxwell’s Equations"
- **Its prerequisites**
  - Source: Practice Electricity and Magnetism | Brilliant. https://brilliant.org/courses/electromagnetism
  - Quote: "This course assumes that you're familiar with forces and energy from Newtonian mechanics. While vectors and their geometric interpretation will be used, they will be developed in context. The course will not require you to evaluate any integrals, though familiarity with integral calculus concepts is helpful."

### 1.2 Brilliant: Circuits
The page is `brilliant.org/courses/circuits` (saved 22 Oct 2026). It gives **31 lessons and 394 exercises in 7 levels**, in order:
1 Circuits, 2 Current, 3 Voltage, 4 Power and Resistance, 5 Circuit Analysis, 6 Comparing Power, 7 Analyzing Voltage. It is
direct-current bulb circuits and has no alternating current, no machines and no generators. My reading: Brilliant's electricity ends where
Dan's AC circuits course begins, so it gives no lesson order for this course.

- **Brilliant Circuits is 31 lessons in 7 levels**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits
  - Quote: "31 Lessons 394 Exercises ### Level 1 Circuits Current Loops Short Circuits Choosing Bulbs Splitting Current Level Review ### Level 2 Current The Path of Least Resistance Bulb Brightness Changing Current Different Bulbs Conserving Current Level Review ### Level 3 Voltage Voltage Measuring Voltage Voltage Around Paths Branched Voltage Level Review ### Level 4 Power and Resistance Power and Brightness Deducing Power Resistance Solving for Resistance Level Review ### Level 5 Circuit Analysis Predicting Current Controlling Current Combining Resistance Dividing Resistance Total Resistance Voltage and Resistance ### Level 6 Comparing Power Resistance and Brightness Relative Resistance Sharing Amps and Volts Parallel Volt Shares Power and Bulb Pairs ### Level 7 Analyzing Voltage Subtracting Volts Comparing Points Bulbs with Voltage"
- **Circuits: description**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits
  - Quote: "Build an intuitive understanding of how electric circuits work, and the underlying concepts of current, voltage, resistance and power."
- **Circuits: topics and prerequisite**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits
  - Quote: "This course assumes no prior knowledge and teaches the key ideas needed to understand electricity and electric circuits, with some fun puzzles to solve along the way."

### 1.3 The nearest public course on synchronous machines
Two reachable benchmarks, neither a Brilliant course. (a) The University of Wisconsin-Madison's online course "Theory and Control of
Synchronous Machines" (a course in an online master's programme; I saw its marketing page, not its syllabus, so its lesson list is **UNCONFIRMED**).
(b) Engineering Devotion's free online Electrical Machines textbook (92 chapters in 6 parts), whose Part 5 Synchronous Machines is a
lesson list in order. In that list the alternator lessons are numbers 71 to 77 (**seven lessons**: fundamentals and classification,
construction, EMF equation and winding factors, armature reaction, voltage regulation, salient-pole machines and two-reaction theory,
synchronising and parallel operation), then the synchronous motor lessons 78 to 81 (principle, V-curves and the synchronous condenser,
hunting, damper windings and short-circuit ratio; lesson 79's title was not in the text I fetched). The page's one-line summary of the part is quoted below. Hughes' own order is in 2.1.
Dan's brief wants the governor, the AVR, droop and protection as well, which neither benchmark teaches as lessons; the manufacturer
guides in 4 do.

Where it sits: Engineering Devotion puts Synchronous Machines (Part 5) after Principles of Energy Conversion, DC Machines,
Transformers and Induction Machines (its six-part list is quoted below). That matches the app's order: Motors and Transformers are already built when this course starts.

- **Nearest public course on synchronous machines: Wisconsin's online course and its skills**
  - Source: Course Spotlight: Theory and Control of Synchronous Machines | Interdisciplinary Professional Programs. https://interpro.wisc.edu/course-spotlight-theory-and-control-of-synchronous-machines
  - Quote: "Predict machine performance using equivalent circuit models and phasor diagrams. * Analyze transient events such as terminal short circuits and sudden load changes."
- **Engineering Devotion free textbook: the Synchronous Machines part, in order**
  - Source: Electrical Machines — Free Online Textbook | Engineering Devotion. https://www.engineeringdevotion.com/electrical-machines-lectures.html
  - Quote: "Alternators — Fundamentals and Classification 72 Constructional Features of Alternators 73 EMF Equation and Winding Factors 74 Armature Reaction in Alternators 75 Voltage Regulation — EMF, MMF and ZPF Methods 76 Salient-Pole Machines and Two-Reaction Theory 77 Synchronising and Parallel Operation"
- **Hughes (Pearson page) is a single three-section textbook: power engineering comes third**
  - Source: Hughes Electrical and Electronic Technology. https://www.pearson.com/en-gb/subject-catalog/p/hughes-electrical-and-electronic-technology/P200000004514?view=educator
  - Quote: "Section 3 Power Engineering"
- **Engineering Devotion: topics the part covers**
  - Source: Electrical Machines — Free Online Textbook | Engineering Devotion. https://www.engineeringdevotion.com/electrical-machines-lectures.html
  - Quote: "Alternator EMF · Armature Reaction · Voltage Regulation · Two-Reaction Theory · Synchronising · V-Curves · Hunting"
- **Engineering Devotion: the six parts, in order**
  - Source: Electrical Machines — Free Online Textbook | Engineering Devotion. https://www.engineeringdevotion.com/electrical-machines-lectures.html
  - Quote: "Principles of Energy Conversion 2. DC Machines 3. Transformers 4. Induction Machines 5. Synchronous Machines 6. Single-Phase and Special Machines"

## 2. Other courses' order for the same ground
Textbooks and manufacturers agree on the order: build the machine (rotating field, three windings, frequency from speed), then
its terminal behaviour on load (armature reaction, synchronous reactance, phasors), then putting machines side by side (synchronising,
load sharing). The controls (AVR, governor) are taught by the manufacturers, not by the textbooks. The lists below are in the sources'
own words.

### 2.1 Hughes, Electrical and Electronic Technology, and the Cambridge Electrical Machines contents
Hughes (Hiley, Brown, McKenzie Smith, Pearson, 12th edition) puts power engineering third: Multiphase Systems, Transformers,
Introduction to Machine Theory, AC Synchronous Machine Windings, Characteristics of AC Synchronous Machines, Induction Motors,
Electrical Energy Systems, Power Systems. The Library of Congress copy is the contents of an older edition (its synchronous chapters are numbered 36 and 37 against 31 and 32
in the 12th, and its page numbers differ), so its section titles are the best look inside and are **SECONDARY** for the 12th edition.
In it, parallel operation is the fourth of four short sections (armature reaction, voltage regulation, synchronous impedance, parallel
operation) before the synchronous motor.

- **Hughes 12th edition, Section 3 Power Engineering: where synchronous machines sit**
  - Source: Hughes Electrical and Electronic Technology. https://www.pearson.com/en-gb/subject-catalog/p/hughes-electrical-and-electronic-technology/P200000004514?view=educator
  - Quote: "28 Multiphase Systems * 29 Transformers * 30 Introduction to Machine Theory * 31 AC Synchronous Machine Windings * 32 Characteristics of AC Synchronous Machines * 33 Induction Motors * 34 Electrical Energy Systems * 35 Power Systems"
- **Hughes (Library of Congress contents): chapter 37 sections**
  - Source: Table of contents for Hughes electrical and electronic technology. https://catdir.loc.gov/catdir/toc/ecip0816/2008017741.html
  - Quote: "37.1 Armature reaction in a three-phase synchronous generator 750 37.2 Voltage regulation of a synchronous generator 751 37.3 Synchronous impedance 752 37.4 Parallel operation of synchronous generators 755 37.5 Three-phase synchronous motor: principle of action 757 37.6 Advantages and disadvantages of the synchronous motor"
- **Cambridge Electrical Machines: chapter 6 on alternators, in order**
  - Source: Electrical Machines. https://assets.cambridge.org/97811084/31064/frontmatter/9781108431064_frontmatter.pdf
  - Quote: "6.1 General Aspects of Synchronous Machines 501 6.2 Basic Principles 502 6.3 Generator and Motor Action 503 6.4 Production of Sinusoidal Alternating emf 503 6.5 Relation between Frequency, Speed and Number of Poles 504 6.6 Advantages of Rotating Field System over Stationary Field System 504 6.7 Constructional Features of Synchronous Machines"

### 2.2 Bird, Electrical Circuit Theory and Technology
Bird's 7th edition (Routledge, 2021) has, in Section 3, Three-phase systems, Transformers, d.c. machines and Three-phase induction
motors, and nothing on alternators in the part of the list I saw (chapters 15 to 36). Chapters 37 to 46 were not in what I fetched
(**UNCONFIRMED**), and the earlier search result listed 47 Transmission lines and 48 Transients and Laplace transforms. My reading: Bird
is the weaker benchmark for this course; the synchronous machine is not one of its machine chapters.

- **Bird's 7th edition: three-phase, transformers, DC machines and induction motors, no alternator chapter in the list**
  - Source: Bird's Electrical Circuit Theory and Technology - 7th Edition - John B. https://www.routledge.com/Birds-Electrical-Circuit-Theory-and-Technology/Bird/p/book/9780367672225
  - Quote: "22. Three-phase systems 23. Transformers 24. d.c. machines 25. Three-phase induction motors"
- **Bird's: chapter 21 on generating electricity sits just before**
  - Source: Bird's Electrical Circuit Theory and Technology - 7th Edition - John B. https://www.routledge.com/Birds-Electrical-Circuit-Theory-and-Technology/Bird/p/book/9780367672225
  - Quote: "21. Global climate change and the future of electricity generation"

### 2.3 Other textbooks and course lists
Wildi puts Synchronous Generators straight after the induction motor chapters. The Cambridge Electrical Machines contents (an undergraduate text) has a whole chapter 7 on parallel operation of alternators, sixteen sections, from the necessity of
parallel operation, through lamps and the synchroscope and load sharing, to the effect of excitation, governors and hunting. The EEP
Academy course lists its synchronous generator lessons in order. These show the standard sequence.

- **Wildi, Electrical Machines, Drives and Power Systems: synchronous generators after induction motors**
  - Source: Electrical Machines, Drives and Power Systems - Pearson. https://www.pearson.com/en-gb/subject-catalog/p/electrical-machines-drives-and-power-systems-pearson-new-international-edition/P200000005743/9781292037325
  - Quote: "14. Selection and Application of Three-Phase Induction Machines. 15. Equivalent Circuit of the Induction Motor. 16. Synchronous Generators. 17. Synchronous Motors."
- **Cambridge Electrical Machines: the parallel operation chapter**
  - Source: Electrical Machines. https://assets.cambridge.org/97811084/31064/frontmatter/9781108431064_frontmatter.pdf
  - Quote: "7.1 Necessity of Parallel Operation of Alternators 626 7.2 Requirements for Parallel Operation of Alternators 627 7.3 Synchronising Alternators 627 7.4 Conditions for Proper Synchronising 627 7.5 Synchronising Single-phase Alternators 629 7.5.1 Dark Lamp Method 629 7.5.2 Bright Lamp Method 631 7.6 Synchronising Three-phase Alternators 631 7.6.1 Three Dark Lamps Method 632 7.6.2 Two Bright and One Dark Lamp Method 633 7.7 Synchronising Three-phase Alternators using Synchroscope 635 7.8 Shifting of Load 636 7.9 Load Sharing between Two Alternators 637"
- **EEP Academy course: synchronous generator lessons in order**
  - Source: Electrical Machines Course: DC, Synchronous and Induction Machines and Transformers - EEP Academy Courses. https://electrical-engineering-portal.com/academy/courses/electrical-machines-dc-synchronous-induction-transformers
  - Quote: "Construction and principle of operation of synchronous generator * Equivalent circuit and phasor diagram of salient synchronous machine * Equivalent circuit and phasor diagram of non-salient synchronous machine * Parallel operation of two generators * Synchronization of the machine with the grid"
- **Cambridge: the second half of the parallel operation chapter (effects of power input, excitation, governors, hunting)**
  - Source: Electrical Machines. https://assets.cambridge.org/97811084/31064/frontmatter/9781108431064_frontmatter.pdf
  - Quote: "7.10 Two Alternators Operating in Parallel 647 7.11 Synchronising Current, Power and Torque 647 ... 7.12 Effect of Change in Input Power of One of the Alternators 649 7.13 Effect of Change in Excitation of One of the Alternators 650 7.14 Effect of Reactance 651 7.15 Effect of Governors’ Characteristics on Load Sharing 652 7.16 Hunting"
- **Cambridge: the first half of the parallel operation chapter**
  - Source: Electrical Machines. https://assets.cambridge.org/97811084/31064/frontmatter/9781108431064_frontmatter.pdf
  - Quote: "7.1 Necessity of Parallel Operation of Alternators 626 7.2 Requirements for Parallel Operation of Alternators 627 7.3 Synchronising Alternators 627 7.4 Conditions for Proper Synchronising 627 7.5 Synchronising Single-phase Alternators 629 7.5.1 Dark Lamp Method 629 7.5.2 Bright Lamp Method 631 7.6 Synchronising Three-phase Alternators 631 7.6.1 Three Dark Lamps Method 632 7.6.2 Two Bright and One Dark Lamp Method 633 7.7 Synchronising Three-phase Alternators using Synchroscope 635 7.8 Shifting of Load 636 7.9 Load Sharing between Two Alternators 637"

### 2.4 Manufacturers' application guides
Reached: Cummins (paralleling seminar, Power Topics 9015, 9017, 5410679, 6000), Stamford and AvK (Cummins Generator Technologies:
owner manuals, application guidance notes AGN 005, 024, 034, 124 and white paper WP105), Leroy-Somer (R438 AVR manual), Mecc Alte
(short-circuit bulletin), Woodward (Governing Fundamentals and Power Management, manual 26260), Deep Sea Electronics (DSE8610 MKII
manual), Generac, Kohler and Benshaw (motor starting). **UNCONFIRMED:** I did not reach a Caterpillar or ComAp application guide
(a ComAp InteliGen datasheet appeared in a search but was not fetched). The manufacturers' own sequence: two control loops (the AVR and
the governor), then synchronising, then separate kW and kVAr sharing, then protection, then sizing for motor starting. Their detail is
quoted under 4.

- **Cummins paralleling seminar: kW shared by fuel, kVAr by excitation**
  - Source: Cummins Power Seminar, Paralleling Basics (IEEE PES New York archive). https://ewh.ieee.org/soc/pes/newyork/Archive%20Docs/CumminsPowerSeminar_Basics%20of%20Paralleling%20169.pdf
  - Quote: "The kW load sharing is achieved by increasing or decreasing fuel to the engines"
- **Cummins paralleling seminar: kVAr by field excitation**
  - Source: Cummins Power Seminar, Paralleling Basics (IEEE PES New York archive). https://ewh.ieee.org/soc/pes/newyork/Archive%20Docs/CumminsPowerSeminar_Basics%20of%20Paralleling%20169.pdf
  - Quote: "The kVAR load sharing is achieved by increasing or decreasing the field ## excitation to the alternators"
- **Cummins Power Topic 9017: the types of load-sharing control**
  - Source: Paralleling Dissimilar Generators: Part 3 – Load Sharing Compatibility. https://mart.cummins.com/imagelibrary/data/assetfiles/0056549.pdf
  - Quote: "Droop governing and voltage regulation (a.k.a. “reactive droop compensation”) Isochronous kW load sharing Isochronous voltage kVAR load sharing Cross current compensation for kVAR load sharing"
- **Cummins Power Topic 9017: what cross current is**
  - Source: Paralleling Dissimilar Generators: Part 3 – Load Sharing Compatibility. https://mart.cummins.com/imagelibrary/data/assetfiles/0056549.pdf
  - Quote: "Cross current is a flow of electrical current between generator sets that is caused by dissimilar excitation levels in those sets."
- **Woodward governing fundamentals: droop shares load in proportion**
  - Source: Governing Fundamentals and Power Management. https://www.woodward.com/products/wp-content/uploads/sites/3/2024/08/26260_NEW.pdf
  - Quote: "If all engines in a droop system have the same droop setting, they will each share load proportionally."
- **Woodward: isochronous units cannot share without a scheme**
  - Source: Governing Fundamentals and Power Management. https://www.woodward.com/products/wp-content/uploads/sites/3/2024/08/26260_NEW.pdf
  - Quote: "units running in isochronous cannot share loads without an isochronous load sharing scheme."
- **Woodward: recommended droop**
  - Source: Governing Fundamentals and Power Management. https://www.woodward.com/products/wp-content/uploads/sites/3/2024/08/26260_NEW.pdf
  - Quote: "It is best to have the same percent of droop set on each engine (3% to 5% is recommended)."

### 2.5 OpenLearn and university lecture notes
**UNCONFIRMED for OpenLearn:** no OpenLearn course on synchronous generators was returned by two searches. University and college lecture
notes were (UNLV, Benha, Cukurova, aast.edu, Kolaghat, MRCET: see the URLs below). They share one sequence: rotor and stator;
frequency from speed and poles; EMF; the per-phase equivalent circuit with the synchronous reactance; open-circuit and short-circuit
tests; the generator alone, then on an infinite bus, then with a second generator (the "house diagram"); paralleling. Their detail is
quoted under 4.1, 4.3, 4.4 and 4.6.

## 3. What a marine electrical engineer uses of this topic
Operating generators is a named competence at every level the sources reach: STCW Table A-III/6 (electro-technical officer), A-III/1
(officer in charge of an engineering watch), the MCA oral examinations, and the IMO model course that spells the syllabus out.

### 3.1 STCW Code, and the IMO model course that explains it
Table A-III/6 (electro-technical officer, function Electrical, electronic and control engineering at the operational level) has the
competence "Operate generators and distribution systems" with the knowledge line "Coupling, load sharing and changing over
generators". Table A-III/1 (2025 edition, as published on stcw.maritime.edu) lists "preparing, starting, paralleling and
changing over generators" under "Operate electrical, electronic and control systems". The IMO model course 7.08 for electro-technical
officers is the most useful single source for the brief: it gives the detailed teaching syllabus for that line (1.3.1), 6 hours,
with the protection and power-management items named. Section numbers 1.1.3 and 1.3.1 below are the model course's own.

- **STCW Table A-III/6 (electro-technical officer): operate generators and distribution systems**
  - Source: STCW Code - Table A-III/6. https://www.edumaritime.net/images/docs/stcw-table-a-iii-6.pdf
  - Quote: "Coupling, load sharing and Examination and Operations are planned and generators changing over generators"
- **STCW Table A-III/6: knowledge of electro-technology and machines theory**
  - Source: STCW Code - Table A-III/6. https://www.edumaritime.net/images/docs/stcw-table-a-iii-6.pdf
  - Quote: "Electro-technology and electrical machines theory"
- **STCW Table A-III/1 (2025 edition, officers in charge of an engineering watch): generators and paralleling**
  - Source: STCW Table A-III/1. https://stcw.maritime.edu/stcw/2025/tables/31.html
  - Quote: "Basic configuration and operation principles of the following electrical equipment: 1. generator and distribution systems 2. preparing, starting, paralleling and changing over generators 3. electrical motors including starting methodologies 4. high-voltage installations 5. sequential control circuits and associated system devices"
- **STCW Table A-III/6 assessment guidance: load sharing as a task**
  - Source: USCG Assessment Guidelines for STCW Code Table A-III/6 Electro-Technical Officer. https://downloads.regulations.gov/USCG-2012-0980-0003/attachment_1.pdf
  - Quote: "Coupling, load sharing and changing over generators"
- **US Coast Guard NVIC 23-14: synchronising and connecting offline generators**
  - Source: USCG NVIC 23-14, Guidelines for Qualifications for STCW Endorsements as Electro-Technical Officer. https://media.defense.gov/2017/Jul/14/2001777751/-1/-1/0/NVIC-23-14.PDF
  - Quote: "Synchronizing and connecting offline generators to the main bus, ensuring all operating parameters remain within manufacturer’s specifications"
- **NVIC 23-14: paralleling and equalising load**
  - Source: USCG NVIC 23-14, Guidelines for Qualifications for STCW Endorsements as Electro-Technical Officer. https://media.defense.gov/2017/Jul/14/2001777751/-1/-1/0/NVIC-23-14.PDF
  - Quote: "Paralleling and equalizing load distribution between on-line generators"
- **IMO model course 7.08: coupling, load sharing and changing over takes 6 hours**
  - Source: IMO Model Course 7.08, Electro-technical Officer (page title "7.0 8"). https://cmu-edu.eu/calitate/wp-content/uploads/sites/6/2022/11/Electro-technical-Officer-Model-Course-7.08.pdf
  - Quote: "Coupling, Load Sharing And Changing Over Generators (6 hours)"
- **IMO model course 7.08: required performance**
  - Source: IMO Model Course 7.08, Electro-technical Officer (page title "7.0 8"). https://cmu-edu.eu/calitate/wp-content/uploads/sites/6/2022/11/Electro-technical-Officer-Model-Course-7.08.pdf
  - Quote: "explains rules of parallel working of generators"
- **IMO model course 7.08: synchronous machines, armature reaction, phasor diagram in the syllabus**
  - Source: IMO Model Course 7.08, Electro-technical Officer (page title "7.0 8"). https://cmu-edu.eu/calitate/wp-content/uploads/sites/6/2022/11/Electro-technical-Officer-Model-Course-7.08.pdf
  - Quote: "describes structures and operating principles of synchronous machines"
- **IMO model course 7.08: synchronising methods, in its own words**
  - Source: IMO Model Course 7.08, Electro-technical Officer (page title "7.0 8"). https://cmu-edu.eu/calitate/wp-content/uploads/sites/6/2022/11/Electro-technical-Officer-Model-Course-7.08.pdf
  - Quote: "explains methods of synchronization of the generators to the busbar and describes the differences between the following methods : - automatic synchronization - semiautomatic synchronization - choking-coil synchronization - manual synchronization"
- **IMO model course 7.08: control systems for distribution of active and reactive power**
  - Source: IMO Model Course 7.08, Electro-technical Officer (page title "7.0 8"). https://cmu-edu.eu/calitate/wp-content/uploads/sites/6/2022/11/Electro-technical-Officer-Model-Course-7.08.pdf
  - Quote: "describes control systems for distribution of active and reactive power of the generators"
- **IMO model course 7.08: excitation systems and rotating rectifiers**
  - Source: IMO Model Course 7.08, Electro-technical Officer (page title "7.0 8"). https://cmu-edu.eu/calitate/wp-content/uploads/sites/6/2022/11/Electro-technical-Officer-Model-Course-7.08.pdf
  - Quote: "describes excitation systems of generators and explains why rotating rectifiers are essential"
- **IMO model course 7.08: the protections to list**
  - Source: IMO Model Course 7.08, Electro-technical Officer (page title "7.0 8"). https://cmu-edu.eu/calitate/wp-content/uploads/sites/6/2022/11/Electro-technical-Officer-Model-Course-7.08.pdf
  - Quote: "lists parameters and limits of the following generator and diesel engine protections : - short-circuit protection - overload protection - reverse power protection - under and overvoltage protection - under and overfrequency protection"
- **IMO model course 7.08: power management**
  - Source: IMO Model Course 7.08, Electro-technical Officer (page title "7.0 8"). https://cmu-edu.eu/calitate/wp-content/uploads/sites/6/2022/11/Electro-technical-Officer-Model-Course-7.08.pdf
  - Quote: "describes the principle of power management with specific reference to: - control of start release of big consumers directly supplied from main switchboard - automatic three-step disconnection of non-essential power consumers - load depending start and stop of generator and automatic load sharing"
- **IMO model course 7.08: instruments in the synchronising process and rules after a black-out**
  - Source: IMO Model Course 7.08, Electro-technical Officer (page title "7.0 8"). https://cmu-edu.eu/calitate/wp-content/uploads/sites/6/2022/11/Electro-technical-Officer-Model-Course-7.08.pdf
  - Quote: "instruments used in synchronization process"
- **IMO model course 7.08: emergency generator start conditions**
  - Source: IMO Model Course 7.08, Electro-technical Officer (page title "7.0 8"). https://cmu-edu.eu/calitate/wp-content/uploads/sites/6/2022/11/Electro-technical-Officer-Model-Course-7.08.pdf
  - Quote: "describes conditions for automatic start of emergency generator and starting methods"

### 3.2 MCA electro-technical officer and engineer officer syllabus lines
The MCA oral examination syllabus for ETO (MIN 654 Amendment 1, April 2026) repeats the STCW line and adds, as the assessed
knowledge, "Understanding of paralleling and load sharing of generators" and "Earth lamps". MSN 1860 gives the same topic 3 in the older
guidance. The MCA Second Engineer written syllabus (Electrotechnology) lists the generator items at skill level. **UNCONFIRMED:** the
MCA's modernised syllabus (MIN 720, 2026) and its Operational Level Electrical Knowledge Digital Assessment: I saw the notice but not
its syllabus lines.

- **MCA oral syllabus (MIN 654): operate generators and distribution systems**
  - Source: MCA Marine Information Note MIN 654 Amendment 1, Engineering and Electro-technical Officer Oral Exam Syllabus. https://assets.publishing.service.gov.uk/media/69e78cff606c20d4121631df/MIN_654_Engineering_and_Electro-technical_Officer_Oral_Exam_Syllabus_-_Amendment_1__April_2026_.pdf
  - Quote: "Operate generators and distribution systems Coupling, load sharing and changing over generators"
- **MCA oral syllabus: paralleling and load sharing, earth lamps**
  - Source: MCA Marine Information Note MIN 654 Amendment 1, Engineering and Electro-technical Officer Oral Exam Syllabus. https://assets.publishing.service.gov.uk/media/69e78cff606c20d4121631df/MIN_654_Engineering_and_Electro-technical_Officer_Oral_Exam_Syllabus_-_Amendment_1__April_2026_.pdf
  - Quote: "Understanding of paralleling and load sharing of generators Earth lamps"
- **MCA MSN 1860: topic 3 of the ETO oral**
  - Source: MCA Merchant Shipping Notice MSN 1860 (M), UK Requirements for Electro-technical Officers. https://assets.publishing.service.gov.uk/media/5df75bcce5274a08dacf0fe2/MSN1860.pdf
  - Quote: "Knowledge, understanding and proficiency in coupling, load sharing, changing over generators"
- **MCA Second Engineer written syllabus: explain the basic operation of an ac generator**
  - Source: UK MCA Second Engineer STCW Reg. III/2 Written Examination Syllabus. https://www.edumaritime.net/images/docs/mca-second-engineer-written-exams.pdf
  - Quote: "4.18 Explains the basic operation of an ac generator."
- **MCA Second Engineer written syllabus: safely synchronise**
  - Source: UK MCA Second Engineer STCW Reg. III/2 Written Examination Syllabus. https://www.edumaritime.net/images/docs/mca-second-engineer-written-exams.pdf
  - Quote: "4.20 Explains how to safely synchronise an incoming 3 phase ac generator to live busbars using lamps and/or synchroscope and voltmeters."
- **MCA Second Engineer written syllabus: load characteristics at power factors**
  - Source: UK MCA Second Engineer STCW Reg. III/2 Written Examination Syllabus. https://www.edumaritime.net/images/docs/mca-second-engineer-written-exams.pdf
  - Quote: "4.21 Obtains the load characteristics of a 3 phase ac generator under various power factor conditions."

### 3.3 Institute for Apprenticeships standards
I saw no IfATE line that names paralleling (**UNCONFIRMED**: I read excerpts, not whole standards). The relevant ones: Engineering
technician (ST0457, which had a Maritime electrical fitter option, now ST1403), Maritime electrical fitter (ST1402 and ST1403), and, for generation and protection, Electrical power protection and
plant commissioning engineer (ST0157, level 4). My reading: the apprenticeship standards assume the machine principles and name
generation and distribution only in passing; the paralleling detail lives in the STCW and MCA lines in 3.1 and 3.2.

- **IfATE Engineering technician (ST0457): maritime electrical engineering principles**
  - Source: Engineering technician / Skills England. https://www.instituteforapprenticeships.org/apprenticeship-standards/engineering-technician-v1-4
  - Quote: "understand maritime electrical/electronic engineering technology and principles in the design, equipment build, operation and maintenance of maritime vessels."
- **IfATE Engineering technician: wording on power generation and distribution**
  - Source: Engineering technician / Skills England. https://www.instituteforapprenticeships.org/apprenticeship-standards/engineering-technician-v1-4
  - Quote: "including programmable logic controllers, power generation and distribution)."
- **IfATE Maritime electrical fitter (ST1402/ST1403)**
  - Source: Apprenticeship search / Skills England. https://www.instituteforapprenticeships.org/apprenticeship-standards
  - Quote: "Manufacture, install, test, fault diagnose, maintain, overhaul and remove electrical systems on maritime vessels."
- **IfATE Electrical power protection and plant commissioning engineer (ST0157)**
  - Source: Electrical power protection and plant commissioning engineer / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0157-v1-0
  - Quote: "apply sound engineering and analytical processes to both normal and abnormal conditions on high voltage power generation, transmission & distribution plant & equipment"

### 3.4 Pearson BTEC HN units
Unit 21 Electrical Machines (the 2020 specification; level 4, 15 credits) names synchronous machines and generators, and a whole
learning outcome on generators. The 2023 and 2024 England specifications carry it as Unit 4021 Electrical Machines, a mandatory
specialist unit. **UNCONFIRMED:** the 2024 unit descriptor's essential content for generators (I saw the unit title and credit, not its
content list). My reading: the HN asks for types, construction and application of generators, not the paralleling procedure.

- **Pearson HN Unit 21 Electrical Machines: what it covers**
  - Source: Pearson BTEC Higher Nationals in Engineering, Unit 21 Electrical Machines (page title "HN-ENG-spec Issue 7.pdf"). https://unicourse.org/wp-content/uploads/2020/10/U21-Electrical-Machines.pdf
  - Quote: "principles underlying the operation and construction of transformers, induction motors, synchronous machines, electromagnetic transducers, actuators, and generators"
- **Pearson HN Unit 21: learning outcome 3 on generators**
  - Source: Pearson BTEC Higher Nationals in Engineering, Unit 21 Electrical Machines (page title "HN-ENG-spec Issue 7.pdf"). https://unicourse.org/wp-content/uploads/2020/10/U21-Electrical-Machines.pdf
  - Quote: "Investigate the types of generators available in the industry by assessing their practical application"
- **Pearson HN Electrical and Electronic Engineering for England: Electrical Machines is a mandatory specialist unit**
  - Source: Pearson BTEC Higher National in Electrical and Electronic Engineering for England specification (level 4 units). https://cdn.craft.cloud/d10b9526-496f-4cd6-a8ff-319f00317266/assets/images/HE-Course-Specs/9781292448480-btec-hn-l4-l5-electric-electron-engin-engl-2.pdf
  - Quote: "Specialist Mandatory Unit 4021: Electrical Machines 15 4"

### 3.5 Dan's qualifications, and what his built courses already cover
**His qualifications.** The EAL Level 3 Electrotechnical qualification covers "electrical scientific principles, BS 7671; electrical
design; and electrical maintenance". BS 7671 has a section on low voltage generating sets (Section 551). The TLC text quoted below
describes the regulations as amended in 1997 (an old edition), so it is **SECONDARY** and shows the idea, not the 18th Edition's
wording; I could not confirm which of Section 551's regulations Dan's 18th Edition unit assesses (**UNCONFIRMED**).

**His built courses** (my reading of the briefs in /home/user/Study-App/docs/courses/, not quotes):
- AC circuits (electrical/ac-circuits/brief.md): lesson 1 the turning coil and AC from a generator, lesson 8 real, reactive and
  apparent power, lesson 9 power factor correction, lesson 10 star and delta and the root-three. Its brief leaves "Alternators: poles and
  speed, excitation, synchronising and load sharing" to a later course (lines 155 to 159): this course.
- Transformers and magnetism (electrical/transformers/brief.md): lessons 1 to 3 the field from a current, the magnetic circuit, changing
  flux making a voltage; lesson 6 regulation and percentage impedance; lesson 7 paralleling transformers. Its brief says "Synchronising,
  load sharing between machines, the AVR and the governor are Generators and paralleling" (lines 122 to 123) and promises a one-line
  link in lesson 3, that a generator is lesson 3 with the flux moved by turning.
- Motors (electrical/motors/brief.md): lesson 1 the rotating field and the induction motor, lesson 2 the DOL starter (starting
  current), lessons 6 to 8 DC machines with back-emf. Its edges say "Out: generators and alternators ..., synchronous and
  permanent-magnet motors, soft starters (one line at most)" (line 63): this course owns the synchronous machine as a generator.
- Insulated systems and earth faults (electrical/insulated-systems/brief.md, lines 212 to 214): "generator neutrals, neutral earthing
  resistor sizing, and coupling switchboards with their monitors (Generators and paralleling)" are handed to this course.
- Mechanics and materials lesson 6 (rotation: torque, inertia and run-up), lesson 5 (work, energy and power), lesson 7 (shafts,
  couplings); Heat and fluids lesson 4 (heat into work: the engine; the generator set's energy split).

- **EAL Level 3 Electrotechnical qualification: scientific principles, BS 7671, design, maintenance**
  - Source: Level 3 Electrotechnical Qualification | EAL. https://eal.org.uk/qualifications/eal-level-3-electrotechnical-qualification
  - Quote: "electrical scientific principles, BS 7671; electrical design; and electrical maintenance."
- **BS 7671 Section 551: standby sets must not be able to run in parallel with the mains**
  - Source: TLC Electrical Supplies, 2.5 Low voltage generating sets (a guide to the IEE Wiring Regulations). https://www.tlc-direct.co.uk/Book/2.5.htm
  - Quote: "interlocks and switching must be provided to ensure that parallel operation is not possible."
- **BS 7671 Section 551: voltage and frequency vary more with generators**
  - Source: TLC Electrical Supplies, 2.5 Low voltage generating sets (a guide to the IEE Wiring Regulations). https://www.tlc-direct.co.uk/Book/2.5.htm
  - Quote: "Voltage and frequency variations are much more likely with generators than with a mains supply"

## 4. The scope, and what research says about each part
The eight parts below follow the scope given for the brief. Each lists the findings in the sources' words; "My reading" paragraphs say
what they mean for a lesson. Where a number is a maker's setting rather than a constant, it is marked so, because the sources disagree
(Stamford's synchronising window, Woodward's, the PSRC's and a trade blog's are four different windows).

### 4.1 The alternator: rotating field, three windings, frequency from speed and poles, EMF from field and speed
The standard account is the same in every source: direct current in the rotor winding makes the field; a prime mover turns it; the
turning field induces a three-phase set of voltages in the stator; the frequency is locked to the speed; the voltage rises with field
current and speed. Dan has the turning coil (AC circuits lesson 1) and Faraday's law (Transformers lesson 3); this is that, with the
field turning instead of the coil.

**The one real trap.** The frequency formula appears two ways: f = pn/60 where p is the number of pole pairs (the line in the brief),
and f = PN/120 where P is the number of poles. Both are in the sources below. A lesson must say which p it means. Computed: 2 pole
pairs (4 poles) at 1500 rev/min gives 50 Hz either way; at 1800 rev/min it gives 60 Hz.

- **Rotating field: the rotor carries the field**
  - Source: Synchronous generators lecture notes, UNLV (page title "Lecture 6: Synchronous machines"). http://www.egr.unlv.edu/~eebag/SYNCHRONOUS%20GENERATORS.pdf
  - Quote: "In a synchronous generator, a DC current is applied to the rotor winding producing a rotor magnetic field."
- **Rotating field: it induces a three-phase voltage in the stator**
  - Source: Synchronous generators lecture notes, UNLV (page title "Lecture 6: Synchronous machines"). http://www.egr.unlv.edu/~eebag/SYNCHRONOUS%20GENERATORS.pdf
  - Quote: "The rotor is then turned by external means producing a rotating magnetic field, which induces a 3-phase voltage within the stator winding."
- **Voltage depends on field strength, speed and turns**
  - Source: Klempner and Kerszenbaum, Operation and Maintenance of Large Turbo-Generators, Chapter 1 (page title "THEORY, CONSTRUCTION, AND OPERATION"). https://geosci.uchicago.edu/~moyer/GEOS24705/Readings/Klempner_Ch1.pdf
  - Quote: "The magnitude of the voltage induced in the stator winding is, as shown above, a function of the magnetic field intensity, the rotating speed of the rotor, and the number of turns in the stator winding."
- **Frequency is locked to rotor speed: 3600 rev/min for 60 Hz on two poles**
  - Source: EE328 Lecture 7, Synchronous Generator (page title "Lecture 4"). https://www.aast.edu/pheed/staffadminview/pdf_retreive.php?stafftype=staffcourses&url=45_24985_EE328_2016_1__2_1_lecture7.pdf
  - Quote: "to generate 60-Hz power in a two-pole machine, the rotor _must_ turn at 3600 rpm."
- **Frequency formula with pole pairs: f = Pn/60**
  - Source: Electric Machines II, Chapter 1 Introduction (Benha University; page title "1"). https://feng.stafpu.bu.edu.eg/Electrical%20Engineering/3106/crs-15062/Files/Chapter1%20Introduction.pdf
  - Quote: "three balanced _emf's_ of frequency _f=Pn/60_ Hz are induced in the three phase windings"
- **Frequency formula with poles: f = PN/120**
  - Source: EMF Equation of Alternator and AC Synchronous Generator. https://www.electricaltechnology.org/2012/11/emf-equation-of-alternator-or-ac.html
  - Quote: "f = PN/120 or N = 120f/P"
- **Induced voltage is controlled by field current**
  - Source: EE328 Lecture 7, Synchronous Generator (page title "Lecture 4"). https://www.aast.edu/pheed/staffadminview/pdf_retreive.php?stafftype=staffcourses&url=45_24985_EE328_2016_1__2_1_lecture7.pdf
  - Quote: "The synchronous generator induced voltage and in turn its terminal voltage can be controlled by changing the field current"
- **Open-circuit characteristic: voltage against field current**
  - Source: EEEB344 Electromechanical Devices, Chapter 5 Synchronous Generator. https://abs.cu.edu.tr/Dokumanlar/2017/EEE318/271877548_2_synchronous_machines.pdf
  - Quote: "This plot is called open-circuit characteristic (OCC) of a generator."
- **The rotating field is excited by direct current**
  - Source: Klempner and Kerszenbaum, Operation and Maintenance of Large Turbo-Generators, Chapter 1 (page title "THEORY, CONSTRUCTION, AND OPERATION"). https://geosci.uchicago.edu/~moyer/GEOS24705/Readings/Klempner_Ch1.pdf
  - Quote: "A dc current, creating a magnetic field that must be rotated at synchronous speed, energizes the rotating field-winding."

### 4.2 Excitation and the AVR: field current sets the voltage; brushless exciters; holding voltage as load changes
A brushless alternator is three machines on one shaft: a permanent magnet generator (PMG, optional), an exciter whose rotor output is
rectified on the shaft into the main field, and the main machine. The AVR senses the output voltage and changes the exciter's field
current. Self-excited machines take the AVR's power from the main output, so they collapse under a short circuit; a PMG or auxiliary
winding supply keeps the excitation up (4.7). That is where "the AVR holds voltage" and "protection must see fault current" meet.

- **A PMG-fed AVR: constant excitation power independent of generator output**
  - Source: Stamford UCI274F alternator technical data sheet (page title "UCI274F-17-TD-EN.XLS"). https://www.stamford-avk.com/sites/stamfordavk/files/UCI274F-17-TD-EN_Rev_A.pdf
  - Quote: "The PMG provides power via the AVR to the main exciter, giving a source of constant excitation power independent of generator output."
- **Brushless exciter output goes to the main rotor through a rectifier**
  - Source: Stamford UCI274F alternator technical data sheet (page title "UCI274F-17-TD-EN.XLS"). https://www.stamford-avk.com/sites/stamfordavk/files/UCI274F-17-TD-EN_Rev_A.pdf
  - Quote: "The main exciter output is then fed to the main rotor, through a full wave bridge, protected by a surge suppressor."
- **The AVR adjusts exciter field strength to hold voltage**
  - Source: STAMFORD S9 HV alternators installation, service and maintenance manual (page title "A062L877 (Issue 6)"). https://www.stamford-avk.com/sites/stamfordavk/files/2026-05/S9-HV-Alternators-Installation-Service-and-Maintenance-Manual-English.pdf
  - Quote: "The AVR controls the alternator output voltage by automatic adjustment of the exciter stator field strength."
- **The AVR senses output voltage for closed loop control**
  - Source: STAMFORD S9 HV alternators installation, service and maintenance manual (page title "A062L877 (Issue 6)"). https://www.stamford-avk.com/sites/stamfordavk/files/2026-05/S9-HV-Alternators-Installation-Service-and-Maintenance-Manual-English.pdf
  - Quote: "Output voltage is sensed at the AVR for closed loop control of the excitation"
- **Leroy-Somer: AVR monitors and corrects voltage by adjusting excitation current**
  - Source: Leroy-Somer R438 AVR installation and maintenance (page title "R438 R438"). https://www.leroy-somer.com/documentation_pdf/3971_en.pdf
  - Quote: "The AVR monitors and corrects the alternator output voltage by adjusting the excitation current."
- **Self-excited alternators do not hold a short circuit**
  - Source: AGN 124 – AVR Power Supplies. https://www.stamford-avk.com/sites/stamfordavk/files/AGN124_C.pdf
  - Quote: "Self-excited alternators will not maintain a short-circuit current - the short-circuit current will quickly decay to 0 if the short- circuit condition is not immediately cleared."
- **Marine classification societies require sustained short-circuit current**
  - Source: AGN 124 – AVR Power Supplies. https://www.stamford-avk.com/sites/stamfordavk/files/AGN124_C.pdf
  - Quote: "Marine Classifying Societies stipulate the need for the alternator to be able to support a condition of sustained short circuit current."
- **The AVR holds voltage by changing excitation (Cummins seminar)**
  - Source: Cummins Power Seminar, Paralleling Basics (IEEE PES New York archive). https://ewh.ieee.org/soc/pes/newyork/Archive%20Docs/CumminsPowerSeminar_Basics%20of%20Paralleling%20169.pdf
  - Quote: "Governor and AVR are the basic functions on every genset and the synchronizer, load share and load govern simply adjust the reference point to them"
- **Leroy-Somer: parallel set-up, the setting voltage is 2 to 4 percent above rated**
  - Source: Leroy-Somer R438 AVR installation and maintenance (page title "R438 R438"). https://www.leroy-somer.com/documentation_pdf/3971_en.pdf
  - Quote: "Or UN + 2 to 4% for parallel operation with C.T. (eg. 410 V)"
- **Leroy-Somer: the PMG gives a short-circuit capacity**
  - Source: Leroy-Somer R438 AVR installation and maintenance (page title "R438 R438"). https://www.leroy-somer.com/documentation_pdf/3971_en.pdf
  - Quote: "As a result the machine has a short-circuit current capacity and good immunity to distortions generated by the load."
- **Excitation isolation lets large motors soft-start without high inrush**
  - Source: AGN024 – AVR Selection. https://www.stamford-avk.com/sites/stamfordavk/files/AGNs/AGN024_E.pdf
  - Quote: "Excitation Isolation: By switching the excitation off it is possible to “soft start” loads such as large motors and transformers without high levels of inrush current."

### 4.3 The loaded generator: armature reaction and synchronous reactance; E = V + jXI; lagging load needs more excitation
The sources give the per-phase model: an internal voltage E set by the field, a series synchronous reactance that lumps armature reaction
and leakage, and the terminal voltage V. E is the phasor sum of V and the drop across the reactance (and the small resistance). A
lagging current needs a larger E than a leading one for the same V, so more field current. Dan has phasors and power factor (AC
circuits), complex numbers, and regulation from the transformer course (lesson 6); the generator is the same picture with a much bigger
reactance. Leading power factor is the generator-specific trap (a lightly loaded UPS or power factor capacitors can make a set lose
voltage control).

- **Armature reaction and self-inductance combine into synchronous reactance**
  - Source: EE328 Lecture 7, Synchronous Generator (page title "Lecture 4"). https://www.aast.edu/pheed/staffadminview/pdf_retreive.php?stafftype=staffcourses&url=45_24985_EE328_2016_1__2_1_lecture7.pdf
  - Quote: "it is customary to combine them into a single reactance, called the _synchronous reactance_ of the machine"
- **Lagging loads need a larger internal voltage than leading loads**
  - Source: EEEB344 Electromechanical Devices, Chapter 5 Synchronous Generator. https://abs.cu.edu.tr/Dokumanlar/2017/EEE318/271877548_2_synchronous_machines.pdf
  - Quote: "For a given phase voltage and armature current, a larger internal voltage EA is needed for lagging loads than for leading loads."
- **More field current for lagging loads, because E must be bigger**
  - Source: EEEB344 Electromechanical Devices, Chapter 5 Synchronous Generator. https://abs.cu.edu.tr/Dokumanlar/2017/EEE318/271877548_2_synchronous_machines.pdf
  - Quote: "Thus, a larger field current is needed to get the same terminal voltage"
- **For a given field current, terminal voltage is lower for lagging loads**
  - Source: EEEB344 Electromechanical Devices, Chapter 5 Synchronous Generator. https://abs.cu.edu.tr/Dokumanlar/2017/EEE318/271877548_2_synchronous_machines.pdf
  - Quote: "for a given field current and magnitude of load current, the terminal voltage is lower for lagging loads and higher for leading loads."
- **Leading power factor can make a generator lose voltage control**
  - Source: How to size a genset: Proper generator set sizing requires analysis of parameters and loads. https://mart.cummins.com/imagelibrary/data/assetfiles/0056648.pdf
  - Quote: "Only slightly leading power factor can cause generator sets to lose voltage control."
- **Generator sets are rated at 0.8 lagging power factor**
  - Source: How to size a genset: Proper generator set sizing requires analysis of parameters and loads. https://mart.cummins.com/imagelibrary/data/assetfiles/0056648.pdf
  - Quote: "Three-phase generator sets are rated for 0.8 PF loads"
- **Sources of leading power factor: lightly loaded UPS, discharge lighting, power factor capacitors**
  - Source: Generac white paper, Sizing Considerations for Commercial and Industrial Generators (page title "WHITE PAPER"). https://www.generac.com/globalassets/pdfs/industrial/whitepapers/sizing-considerations-for-comm-and-ind-gens.pdf
  - Quote: "Some sources of a leading power factor can be a lightly loaded UPS, high intensity discharge lighting, and power factor correction capacitors."

### 4.4 The governor: prime mover sets real power and frequency; droop and isochronous; load step
The governor controls fuel to hold speed. Droop lets the speed fall as load rises (by a set percentage), which is what lets machines in
parallel share load; isochronous holds speed, and two isochronous machines on one bus fight. A sudden load step slows the engine (a
frequency dip) before the governor can respond, and the slower speed makes the voltage dip worse. Dan has torque, inertia and run-up
(Mechanics lesson 6); the governor is that run-up equation closed by a feedback loop. Computed: with 5% droop and a 50 Hz full-load
frequency, the no-load frequency is 52.5 Hz; with 4% it is 52 Hz.

- **Droop is the percentage speed change for full governor action**
  - Source: Droop speed control - Wikipedia. https://en.wikipedia.org/wiki/Droop_speed_control
  - Quote: "Droop is therefore expressed as the percentage change in (design) speed required for 100% governor action."
- **5% droop: full-load speed 100%, no-load speed 105%**
  - Source: Droop speed control - Wikipedia. https://en.wikipedia.org/wiki/Droop_speed_control
  - Quote: "By definition, with 5% droop the full-load speed is 100% and the no-load speed is 105%."
- **Droop formula**
  - Source: Paralleling Dissimilar Generators: Part 3 – Load Sharing Compatibility. https://mart.cummins.com/imagelibrary/data/assetfiles/0056549.pdf
  - Quote: "Frequency (Hz) droop: (100)[(HzNL-HzFL) / HzFL]"
- **Two isochronous units compete: one takes all the load**
  - Source: Isochronous vs Droop: The Difference Between Control Modes - Petrotech | Control Systems Solutions. https://petrotechinc.com/the-difference-between-isochronous-and-droop-control-modes
  - Quote: "In the case of parallel generators, one will assume the entire load, while the other will receive none of it."
- **Isochronous holds constant speed regardless of load**
  - Source: Isochronous vs Droop: The Difference Between Control Modes - Petrotech | Control Systems Solutions. https://petrotechinc.com/the-difference-between-isochronous-and-droop-control-modes
  - Quote: "In isochronous mode, the generator maintains a constant speed regardless of the load."
- **A load step slows the engine: frequency dip**
  - Source: Generac white paper, Sizing Considerations for Commercial and Industrial Generators (page title "WHITE PAPER"). https://www.generac.com/globalassets/pdfs/industrial/whitepapers/sizing-considerations-for-comm-and-ind-gens.pdf
  - Quote: "Frequency dip is when the engine cannot supply enough power (kW) to support the load demand, causing a reduction in engine RPM."
- **The engine slowing makes the voltage dip worse**
  - Source: Sizing Generators for Motor Starting: A Practical Guide to Understanding How Motor-Starting Loads Affect Generator Performance. https://resources.kohler.com/power/kohler/industrial/pdf/Sizing_Generators_for_Motor_Starting_WP.pdf
  - Quote: "When the engine slows under load-frequency dips, this in turn, increases the alternator voltage dip."
- **Flat characteristics: sharing varies widely with tiny no-load speed changes**
  - Source: EEEB344 Electromechanical Devices, Chapter 5 Synchronous Generator. https://abs.cu.edu.tr/Dokumanlar/2017/EEE318/271877548_2_synchronous_machines.pdf
  - Quote: "If two generators have flat or nearly flat characteristics, then the power sharing between them can vary widely with only the tiniest changes in no-load speed."
- **Infinite bus defined**
  - Source: EEEB344 Electromechanical Devices, Chapter 5 Synchronous Generator. https://abs.cu.edu.tr/Dokumanlar/2017/EEE318/271877548_2_synchronous_machines.pdf
  - Quote: "An infinite bus is a power system so large that its voltage and frequency do not vary regardless of how much real and reactive power is drawn from or supplied to it."
- **Governor set point moves the droop line up and the power with it (infinite bus)**
  - Source: EEEB344 Electromechanical Devices, Chapter 5 Synchronous Generator. https://abs.cu.edu.tr/Dokumanlar/2017/EEE318/271877548_2_synchronous_machines.pdf
  - Quote: "In theory, if the governor set points is increased, the no load frequency will also increase (the droop graph will shift up)."
- **Droop conditions: same no-load frequency and voltage, same rate of fall**
  - Source: Paralleling Dissimilar Generators: Part 3 – Load Sharing Compatibility. https://mart.cummins.com/imagelibrary/data/assetfiles/0056549.pdf
  - Quote: "Each generator must be set to drop frequency at the same rate from no load to full load."
- **Droop with different no-load voltage: one machine always carries more**
  - Source: Paralleling Dissimilar Generators: Part 3 – Load Sharing Compatibility. https://mart.cummins.com/imagelibrary/data/assetfiles/0056549.pdf
  - Quote: "Figure 2 illustrates the impact of incorrect no load voltage settings."
- **Isochronous units fight: the one with the higher setting takes all the load, the other is motored**
  - Source: Governing Fundamentals and Power Management. https://www.woodward.com/products/wp-content/uploads/sites/3/2024/08/26260_NEW.pdf
  - Quote: "The result will be that the engine with the higher speed setting will continue to take all of the load until it reaches its power limit, and the other engine will shed all of its load and become motored (driven by the other engine)."
- **Droop trade-off: frequency varies; large load trips cause a settled frequency above nominal**
  - Source: Isochronous vs Droop: The Difference Between Control Modes - Petrotech | Control Systems Solutions. https://petrotechinc.com/the-difference-between-isochronous-and-droop-control-modes
  - Quote: "If the load is tripped, the frequency will reach a value above its nominal value when it settles."
- **A governor has a finite response time but motor starts are instant steps**
  - Source: Starting Motors on Generator Sets. https://benshaw.com/hubfs/Benshaw%20Website/Downloads/White-Papers/Benshaw-White-Paper-Starting-Motors-on-GenSets_EN.pdf
  - Quote: "This governing system has a finite response time, yet most motor starting systems subject the system to instantaneous load changes."
- **Cummins: engine kW is what a generator set shares**
  - Source: Considerations when Paralleling Generating Sets. https://mart.cummins.com/imagelibrary/data/assetfiles/0056622.pdf
  - Quote: "Real power (kW) provided by a generator set operating in parallel with others is a direct function of engine real power output."

### 4.5 Synchronising: the four conditions; synchroscope and lamps; check synchronising; what a bad closure does
The four conditions are voltage, frequency, phase sequence and phase angle. Woodward lists five (number of phases, rotation of phases,
voltage, frequency, phase angle) and says the first two are settled when the plant is specified, installed and wired. The instruments: lamps (dark when in phase), the synchroscope (one
phase only, so it cannot show phase sequence), and a synchronism-check relay (25) as the last permissive. A bad closure puts a
current that can exceed a three-phase fault through the machine and a torque shock through the shaft and coupling.

**Contested points, taught as contested.** (1) Where to close: one source closes slowly in the fast direction at about 11 o'clock,
another at about "5 minutes to 12", and the PSRC says an autosynchroniser closes early by an advance angle for the breaker's closing
time. The reason for the advance is the breaker's closing time. (2) The windows: Stamford's table (0.5% voltage, 0.1 Hz per second, 10 degrees, 50 ms breaker closing time), Woodward
(frequency usually within 0.2%, angle usually within 10 degrees), a trade site (5% voltage, 0.1 to 0.5 Hz, 10 to 15 degrees,
SECONDARY). They are makers' settings, not constants. (3) Stamford says manual synchronising is not recommended; the MCA still asks for
it with lamps and a synchroscope. A lesson can teach the manual way as the way to understand it and the automatic way as the way it is
done.

- **Four conditions to fulfil before synchronising**
  - Source: Preparing to synchronize a generator to the grid. https://electrical-engineering-portal.com/preparing-to-synchronize-a-generator-to-the-grid
  - Quote: "In order to synchronize a generator with the grid, it is necessary to fulfill the following four conditions"
- **The four quantities matched: voltage, frequency, phase sequence, phase angle (the first lines)**
  - Source: DG Synchronization with Step-by-Step Procedure. https://forumelectrical.com/dg-synchronization-with-step-by-step-procedure
  - Quote: "Before a generator breaker is allowed to close, four electrical quantities of the incoming machine must be matched, within tolerance, to the running bus:"
- **Typical tolerances: voltage 5 percent, frequency 0.1 to 0.5 Hz**
  - Source: DG Synchronization with Step-by-Step Procedure. https://forumelectrical.com/dg-synchronization-with-step-by-step-procedure
  - Quote: "typically within about 5 percent"
- **Lamps: dark means same voltage and frequency**
  - Source: Synchroscope - Wikipedia. https://en.wikipedia.org/wiki/Synchroscope
  - Quote: "when the lamps stay dark, the voltage and frequency of the two systems are the same and the generator may be connected."
- **The synchroscope checks one phase only, so not phase sequence**
  - Source: Synchroscope - Wikipedia. https://en.wikipedia.org/wiki/Synchroscope
  - Quote: "Since most synchroscopes are connected only to a single phase of the two systems, they cannot assure that the phase sequence is correct."
- **Pointer at zero and not moving means synchronised**
  - Source: Synchroscope - Wikipedia. https://en.wikipedia.org/wiki/Synchroscope
  - Quote: "When the pointer is at zero and is not moving, the two systems are synchronized."
- **Close slightly before 12 o'clock, travelling slowly in the fast direction (one practice)**
  - Source: Synchroscope - Wikipedia. https://en.wikipedia.org/wiki/Synchroscope
  - Quote: "the operator closes the breaker when the synchroscope pointer is passing through approximately "11 o'clock", while traveling slowly in the fast direction."
- **Close about five minutes to 12 (another practice)**
  - Source: PSRC WG J20 Report - Practices for Generator Synchronizing Systems. https://www.pes-psrc.org/kb/report/119.pdf
  - Quote: "When the synchroscope is about 5 minutes to 12 o’clock, the generator breaker is closed."
- **A bad closure: synchronising current can exceed a three-phase fault**
  - Source: PSRC WG J20 Report - Practices for Generator Synchronizing Systems. https://www.pes-psrc.org/kb/report/119.pdf
  - Quote: "The synchronization current can exceed that of a three-phase fault at the generator"
- **A bad closure: bent shafts, broken couplings**
  - Source: Governing Fundamentals and Power Management. https://www.woodward.com/products/wp-content/uploads/sites/3/2024/08/26260_NEW.pdf
  - Quote: "These stresses can result in bent drive shafts, broken couplings, or broken turbine quill shafts."
- **Automatic synchronisers nudge the engine fuel rate**
  - Source: Paralleling Dissimilar Generators: Part 3 – Load Sharing Compatibility. https://mart.cummins.com/imagelibrary/data/assetfiles/0056549.pdf
  - Quote: "load sharing"
- **Woodward: five conditions to match for two systems to be synchronised**
  - Source: Governing Fundamentals and Power Management. https://www.woodward.com/products/wp-content/uploads/sites/3/2024/08/26260_NEW.pdf
  - Quote: "For two systems to be synchronized, five conditions must be matched:"
- **Woodward: frequency within about 0.2 percent**
  - Source: Governing Fundamentals and Power Management. https://www.woodward.com/products/wp-content/uploads/sites/3/2024/08/26260_NEW.pdf
  - Quote: "The frequency of the oncoming generator must be very nearly the same as that of the system it is being paralleled with, usually within 0.2%"
- **Woodward: phase angle within plus or minus 10 degrees**
  - Source: Governing Fundamentals and Power Management. https://www.woodward.com/products/wp-content/uploads/sites/3/2024/08/26260_NEW.pdf
  - Quote: "This match usually is within plus or minus 10 degrees."
- **Woodward: worst case, twice the peak voltage across the breaker**
  - Source: Governing Fundamentals and Power Management. https://www.woodward.com/products/wp-content/uploads/sites/3/2024/08/26260_NEW.pdf
  - Quote: "Under the worst conditions, the voltages between the two systems can be twice the peak operating voltage of one of the systems, or one system can place a dead short on the other."
- **Woodward: lamps in pairs alternating means wrong phase sequence**
  - Source: Governing Fundamentals and Power Management. https://www.woodward.com/products/wp-content/uploads/sites/3/2024/08/26260_NEW.pdf
  - Quote: "If pairs of lamps alternate light and dark (with two lamps dark while the other two are light) the phase sequence is not the same."
- **Woodward: the speed of the oncoming prime mover is how frequency and phase are matched**
  - Source: Governing Fundamentals and Power Management. https://www.woodward.com/products/wp-content/uploads/sites/3/2024/08/26260_NEW.pdf
  - Quote: "If the oncoming generator is a synchronous type, phase matching, like frequency matching, is accomplished by controlling the speed of the oncoming generator's prime mover."
- **Stamford: manual synchronising is not recommended; use automatic or check sync**
  - Source: STAMFORD S9 alternators owner manual (page title "A062L875 (Issue 5)"). https://www.stamford-avk.com/sites/stamfordavk/files/2025-03/S9-Owners-Manual-English.pdf
  - Quote: "The method of synchronizing should be either automatic, or by check synchronizing. The use of manual synchronizing is not recommended."
- **Stamford: the synchronising equipment parameters table**
  - Source: STAMFORD S9 alternators owner manual (page title "A062L875 (Issue 5)"). https://www.stamford-avk.com/sites/stamfordavk/files/2025-03/S9-Owners-Manual-English.pdf
  - Quote: "Voltage Difference +/- 0.5% Frequency Difference 0.1 Hz/sec Phase Angle +/- 10 o C/B Closing Time 50 ms"
- **Stamford: the breaker must survive an out-of-synchronism close**
  - Source: STAMFORD S9 alternators owner manual (page title "A062L875 (Issue 5)"). https://www.stamford-avk.com/sites/stamfordavk/files/2025-03/S9-Owners-Manual-English.pdf
  - Quote: "The switch/breaker must be able to withstand the rigorous closing cycles during synchronizing and the currents produced if the alternator is paralleled out of synchronization."
- **Wikipedia: pointer direction fast and slow**
  - Source: Synchroscope - Wikipedia. https://en.wikipedia.org/wiki/Synchroscope
  - Quote: "If the generator is running faster than the grid, the pointer rotates continually in the opposite direction, marked "fast" or "lead"."
- **Wikipedia: operator trims speed so the needle stops at zero**
  - Source: Synchroscope - Wikipedia. https://en.wikipedia.org/wiki/Synchroscope
  - Quote: "Slightly before the pointer reaches the zero mark, the plant operator returns the generator to the grid frequency in order to stop the needle when it reaches the zero mark."
- **PSRC: autosynchroniser closes early to allow for breaker closing time**
  - Source: PSRC WG J20 Report - Practices for Generator Synchronizing Systems. https://www.pes-psrc.org/kb/report/119.pdf
  - Quote: "This allows the synchronizing breaker close command to be initiated early at the advance angle to compensate for breaker closing time."
- **PSRC: phase angle is the most sensitive variable**
  - Source: PSRC WG J20 Report - Practices for Generator Synchronizing Systems. https://www.pes-psrc.org/kb/report/119.pdf
  - Quote: "Voltage phase angle difference is the most sensitive variable for torque stress from a faulty synchronization."
- **PSRC: operators tempted to hold the close contact while the scope rotates**
  - Source: PSRC WG J20 Report - Practices for Generator Synchronizing Systems. https://www.pes-psrc.org/kb/report/119.pdf
  - Quote: "plant operators may be tempted to close their contact at angles far from the correct angle and hold the contact closed as the synchroscope rotates, eventually reaching the correct angle"
- **PSRC: lamps give a composite indication of voltage, frequency and angle**
  - Source: PSRC WG J20 Report - Practices for Generator Synchronizing Systems. https://www.pes-psrc.org/kb/report/119.pdf
  - Quote: "This visual indication gives a composite indication of all three synchronizing variables—voltage magnitude difference, frequency difference, and phase angle difference."
- **DSE: dead bus synchronising puts any number of sets online within about 15 seconds**
  - Source: DSE8610 MKII Operator Manual. https://technogamma.nl/wp-content/uploads/DSE8610-MKII-Operator-Manual.pdf
  - Quote: "Using _Dead Bus Synchronising_ , any number of generators are able to be online and in parallel potentially within 15 seconds"
- **Woodward: a modern synchroniser compares frequency and phase and trims the governor**
  - Source: Governing Fundamentals and Power Management. https://www.woodward.com/products/wp-content/uploads/sites/3/2024/08/26260_NEW.pdf
  - Quote: "A modern synchronizer compares the frequency and phase of the two voltages, and sends a correction signal to the summing point of the governor controlling the prime mover of the oncoming generator."
- **Woodward: a synchroniser will not close if the voltage is out of limits**
  - Source: Governing Fundamentals and Power Management. https://www.woodward.com/products/wp-content/uploads/sites/3/2024/08/26260_NEW.pdf
  - Quote: "If the voltage of the oncoming generator does not match the bus within set limits, the synchronizer will not allow a circuit breaker closure."
- **Typical frequency tolerance, 0.1 to 0.5 Hz (SECONDARY, a trade site)**
  - Source: DG Synchronization with Step-by-Step Procedure. https://forumelectrical.com/dg-synchronization-with-step-by-step-procedure
  - Quote: "generally within 0.1 to 0.5 Hz"
- **Typical phase-angle tolerance, 10 to 15 electrical degrees (SECONDARY)**
  - Source: DG Synchronization with Step-by-Step Procedure. https://forumelectrical.com/dg-synchronization-with-step-by-step-procedure
  - Quote: "ideally within about 10 to 15 electrical degrees"

### 4.6 Load sharing: kW by governor droop; kVAr by AVR droop or cross-current compensation; why they are separate
Real power follows fuel (the governor); reactive power follows excitation (the AVR). Raising one machine's fuel in parallel does not
raise the frequency; it raises that machine's share. Raising one machine's excitation does not raise the voltage; it raises that
machine's kVAr share and lowers its power factor. Unmatched excitation drives a circulating current. kVAr is shared by voltage droop
(the quadrature droop CT) or by cross-current compensation (no intentional droop). Against a very large system (an "infinite bus") the
rules change again: the governor set point sets power and the field current sets reactive power, and reactive droop does not work against
a utility. Leroy-Somer's commissioning order is a good lesson spine: set speed for zero kW exchange, then voltage for no circulating
current, then load for sharing.

- **kW sharing is set by the governors, kVAr by the excitation: two separate controls**
  - Source: Load Sharing: Balancing kW and kVAR Between Generators. https://www.bengibb.ca/blog/kw-and-kvar-control
  - Quote: "These two types of load sharing rely on separate systems: speed control for kW and voltage control for kVAR."
- **Fuel up on one machine of a paralleled group: share rises, speed does not**
  - Source: ACTIVE & REACTIVE POWER SHARING IN PARALLELED GENERATORS (KW & KVAR) - DieselShip. https://dieselship.com/marine-technical-articles/marine-electro-technology/active-reactive-power-sharing-in-a-paralleled-generator-set-kw-kvar
  - Quote: "As the fuel to the engine of one generator set in a group is increased it will not lead to an increase in speed and hence frequency"
- **Excitation up on one paralleled machine: kVAr share rises, power factor falls**
  - Source: ACTIVE & REACTIVE POWER SHARING IN PARALLELED GENERATORS (KW & KVAR) - DieselShip. https://dieselship.com/marine-technical-articles/marine-electro-technology/active-reactive-power-sharing-in-a-paralleled-generator-set-kw-kvar
  - Quote: "it will not lead to an increase in voltage (as it would if it were operating alone) but it will lead to an increase in the proportion of the total kVAR load it will deliver and a decrease in its power factor."
- **Unmatched excitation drives a circulating reactive current**
  - Source: ACTIVE & REACTIVE POWER SHARING IN PARALLELED GENERATORS (KW & KVAR) - DieselShip. https://dieselship.com/marine-technical-articles/marine-electro-technology/active-reactive-power-sharing-in-a-paralleled-generator-set-kw-kvar
  - Quote: "An undesirable circulating reactive current (cross current) will flow in the system if the excitation of the alternators is not matched."
- **Changing excitation moves kVAr, not kW**
  - Source: Parallel Operation of Synchronous Generator | KVAR Control. https://www.eeeguide.com/parallel-operation-of-synchronous-generator
  - Quote: "Changes in excitation of Parallel Operation of Synchronous Generator affect the terminal voltage and reactive-power loading with active power sharing remaining unchanged"
- **On an infinite bus, field current sets reactive power**
  - Source: EEEB344 Electromechanical Devices, Chapter 5 Synchronous Generator. https://abs.cu.edu.tr/Dokumanlar/2017/EEE318/271877548_2_synchronous_machines.pdf
  - Quote: "In other words, increasing the field current in a synchronous generator operating in parallel with an infinite bus increases the reactive power output of the generator."
- **Droop CT preset: 5% voltage drop at full load zero power factor**
  - Source: STAMFORD S9 alternators owner manual (page title "A062L875 (Issue 5)"). https://www.stamford-avk.com/sites/stamfordavk/files/2025-03/S9-Owners-Manual-English.pdf
  - Quote: "A factory-fitted droop CT is pre-set for 5% voltage drop at full-load zero power factor."
- **Reactive droop is not effective against a utility; use var or power factor control**
  - Source: Paralleling Dissimilar Generators: Part 3 – Load Sharing Compatibility. https://mart.cummins.com/imagelibrary/data/assetfiles/0056549.pdf
  - Quote: "However, reactive droop is not effective for utility paralleling due to the greatly varying voltage level at any point in a utility distribution system as the load on the system changes."
- **A droop transformer needs a shorting switch for a single running machine**
  - Source: STAMFORD S9 HV alternators installation, service and maintenance manual (page title "A062L877 (Issue 6)"). https://www.stamford-avk.com/sites/stamfordavk/files/2026-05/S9-HV-Alternators-Installation-Service-and-Maintenance-Manual-English.pdf
  - Quote: "For normal voltage regulation as a single running machine, a shorting switch should be fitted across the parallel droop transformer."
- **Cummins: both control systems always in operation**
  - Source: Paralleling Dissimilar Generators: Part 3 – Load Sharing Compatibility. https://mart.cummins.com/imagelibrary/data/assetfiles/0056549.pdf
  - Quote: "Each generator set in the system has two active control systems always in operation: the excitation control system regulating voltage, and the fuel control system regulating engine speed."
- **Cummins: one set at higher excitation means unequal reactive load**
  - Source: Paralleling Dissimilar Generators: Part 3 – Load Sharing Compatibility. https://mart.cummins.com/imagelibrary/data/assetfiles/0056549.pdf
  - Quote: "If, for example, one set operates at a higher excitation level than the other sets, the reactive load will not be shared equally."
- **Cummins: cross current compensation gives no intentional voltage droop**
  - Source: Paralleling Dissimilar Generators: Part 3 – Load Sharing Compatibility. https://mart.cummins.com/imagelibrary/data/assetfiles/0056549.pdf
  - Quote: "Using cross current compensation results in no intentional droop in voltage from no load to full load on the system"
- **Cummins: isochronous load sharing compares the share on the set with the share on the system**
  - Source: Paralleling Dissimilar Generators: Part 3 – Load Sharing Compatibility. https://mart.cummins.com/imagelibrary/data/assetfiles/0056549.pdf
  - Quote: "Isochronous load sharing control systems are active control systems that actively calculate the percentage of real and reactive load on a specific generator set"
- **Cummins: droop typically 3 to 5 percent**
  - Source: Paralleling Dissimilar Generators: Part 3 – Load Sharing Compatibility. https://mart.cummins.com/imagelibrary/data/assetfiles/0056549.pdf
  - Quote: "Common droop selections for frequency and voltage can be different and are typically in the range of 3–5% from no load to full load."
- **Cummins: droop allows dissimilar machines to parallel**
  - Source: Paralleling Dissimilar Generators: Part 3 – Load Sharing Compatibility. https://mart.cummins.com/imagelibrary/data/assetfiles/0056549.pdf
  - Quote: "The major advantage of using droop in paralleling is that it allows dissimilar machines to be paralleled without concern for their load sharing interface."
- **abs.cu.edu.tr: shift reactive sharing by raising one field and lowering the other**
  - Source: EEEB344 Electromechanical Devices, Chapter 5 Synchronous Generator. https://abs.cu.edu.tr/Dokumanlar/2017/EEE318/271877548_2_synchronous_machines.pdf
  - Quote: "To shift the reactive power sharing without changing VT, simultaneously increase the field current on one generator and decrease the field current on the other."
- **Leroy-Somer commissioning: speed to 0 kW exchange, then voltage to cancel circulating current**
  - Source: Leroy-Somer R438 AVR installation and maintenance (page title "R438 R438"). https://www.leroy-somer.com/documentation_pdf/3971_en.pdf
  - Quote: "By altering the voltage setting P2 on one of the machines, try to cancel (or minimise) the current circulating between the machines."
- **Leroy-Somer commissioning: no-load voltages identical for sets to run in parallel**
  - Source: Leroy-Somer R438 AVR installation and maintenance (page title "R438 R438"). https://www.leroy-somer.com/documentation_pdf/3971_en.pdf
  - Quote: "The no-load voltages should be identical for all the alternators intended to run in parallel."
- **Leroy-Somer: with the droop CT at rated load 0.8 inductive, voltage should drop 2 to 3 percent**
  - Source: Leroy-Somer R438 AVR installation and maintenance (page title "R438 R438"). https://www.leroy-somer.com/documentation_pdf/3971_en.pdf
  - Quote: "Apply the rated load (P.F. = 0.8 inductive). The voltage should drop by 2 to 3%."
- **Leroy-Somer commissioning: speed to 0 kW exchange**
  - Source: Leroy-Somer R438 AVR installation and maintenance (page title "R438 R438"). https://www.leroy-somer.com/documentation_pdf/3971_en.pdf
  - Quote: "try to obtain 0 KW power exchange."

### 4.7 Protection and faults: reverse power, loss of excitation, short-circuit decrement, preference tripping and load shedding
Reverse power (device 32) detects real power flowing into the generator after it loses its prime mover; for a diesel, motoring is a
mechanical-seizure and unburned-fuel hazard. Its delay stops nuisance trips on load rejection; do not desensitise it instead. Loss of
excitation in parallel brings circulating currents and pole-slipping, and the machine absorbs VArs. Short-circuit current has three
periods (sub-transient, transient, sustained); a self-excited machine does not sustain it, a PMG or auxiliary winding machine does, and
marine classification asks for that. Preferential tripping and load shedding are the power management system's answer to overload:
non-essential feeders go first, in timed steps (the IMO model course says three steps), so the main breaker and the essential services stay.

- **Reverse power relay: real power flowing into a generator that loses its prime mover**
  - Source: Generator Protection. https://www.cedengineering.com/userfiles/E04-047%20-%20Generator%20Protection%20-%20US.pdf
  - Quote: "detects real power flow ### into the generator, which will happen if the generator loses its prime-mover input."
- **Anti-motoring protection for a diesel, to avoid explosion from unburned fuel**
  - Source: US NRC document ML21104A365 (diesel generator protective relays, a nuclear plant description; page title "nrc.gov"). https://www.nrc.gov/docs/ML2110/ML21104A365.pdf
  - Quote: "provides anti-motoring protection for the diesel to preclude the danger of explosion and fire from unburned fuel."
- **Diesel alternators motoring draw power and risk seizure; use a time delay**
  - Source: Principles of Power System, Protection of Alternators and Transformers (page title "(cid:1)(cid:1)"). https://aliah.ac.in/upload/media/01-04-20_1585714290.pdf
  - Quote: "Diesel engine driven alternators, when running inverted, draw a considerable amount of power from the supply system and it is a usual practice to provide protection against motoring in order to avoid damage due to possible mechanical seizure."
- **The time delay stops nuisance trips during faulty synchronising and swinging**
  - Source: Principles of Power System, Protection of Alternators and Transformers (page title "(cid:1)(cid:1)"). https://aliah.ac.in/upload/media/01-04-20_1585714290.pdf
  - Quote: "It is essential that the reverse power relays have time-delay in opera- tion in order to prevent inadvertent tripping during system disturbances caused by faulty synchronising and phase swinging."
- **Do not desensitise reverse power to fix nuisance trips**
  - Source: Paralleling Dissimilar Generators: Part 1 – An Overview. https://mart.cummins.com/imagelibrary/data/assetfiles/0056597.pdf
  - Quote: "Do not address the issue by increasing the “Reverse Power” limit on the generator set."
- **Loss of excitation in parallel: circulating currents, pole-slipping, surges**
  - Source: AGN024 – AVR Selection. https://www.stamford-avk.com/sites/stamfordavk/files/AGNs/AGN024_E.pdf
  - Quote: "A loss of excitation during parallel operation results in circulating currents, pole-slipping, torque/current surges and oscillation."
- **Under-excitation protection guards against pole-slipping**
  - Source: AGN024 – AVR Selection. https://www.stamford-avk.com/sites/stamfordavk/files/AGNs/AGN024_E.pdf
  - Quote: "Under-Exc. Protection: Prevents alternator damage, caused by possible pole-slipping, if pre-set minimum excitation levels of current are exceeded."
- **Decrement curves: sub-transient, transient and sustained fault current**
  - Source: AGN 005 – Fault Currents and Short Circuit Decrement Curves. https://www.stamford-avk.com/sites/stamfordavk/files/AGN005_D.pdf
  - Quote: "The Short Circuit Decrement Curves represent the alternator’s fault current during Sub Transient, Transient and Sustained periods of the fault condition."
- **A PMG or aux winding gives a current forcing capability in a fault**
  - Source: AGN024 – AVR Selection. https://www.stamford-avk.com/sites/stamfordavk/files/AGNs/AGN024_E.pdf
  - Quote: "Sustained Short Circuit: With PMG or Auxiliary Winding Excitation; gives the alternator a current ‘forcing’ capability to ensure accurate circuit breaker activation in a fault situation."
- **Modern alternators sustain 2 to 4 times rated current in a steady short circuit**
  - Source: STAMFORD application guidance note AGN 034, Alternator Reactance. https://www.stamford-avk.com/sites/stamfordavk/files/AGN034_C.pdf
  - Quote: "will typically sustain 2 to 4 x rated current under a steady state three phase short circuit condition."
- **Preferential tripping defined**
  - Source: Preferential tripping in a marine electrical distribution system. https://dieselship.com/marine-technical-articles/marine-electro-technology/preferential-tripping-in-a-marine-electrical-distribution-system
  - Quote: "Preferential tripping in a marine electrical distribution system are designed to disconnect non-essential circuits (e.g. breakers controlling air conditioning, galley power, blowers, refrigeration etc.) in the event of partial overload or partial failure of the supply"
- **Power management functions: blackout prevention, preferential tripping, share load, blackout recovery**
  - Source: Lerus Training blog - Components of the dynamic positioning (DP) system - Power. https://www.lerus.com/blog/components-of-the-dynamic-positioning-system-power
  - Quote: "Starting generators and thrusters automatically after a full or partial loss of power on board (Blackout Recovery function)."
- **CED: reverse power relay delay of 5 to 30 seconds to allow pick-up on synchronising**
  - Source: Generator Protection. https://www.cedengineering.com/userfiles/E04-047%20-%20Generator%20Protection%20-%20US.pdf
  - Quote: "Time delay needs to be set around 5-30 seconds, giving sufficient time for the controls to pick up load upon synchronizing when the generator is initially slower than the system."
- **CED: losing excitation makes the machine absorb a lot of VArs**
  - Source: Generator Protection. https://www.cedengineering.com/userfiles/E04-047%20-%20Generator%20Protection%20-%20US.pdf
  - Quote: "When a generator loses excitation power, it seems to the system as an inductive load, and the machine starts to absorb a considerable amount of VARs."
- **CED: the prime mover is tripped first, then the breaker, after reverse power confirms**
  - Source: Generator Protection. https://www.cedengineering.com/userfiles/E04-047%20-%20Generator%20Protection%20-%20US.pdf
  - Quote: "This is done only after a reverse power relay checks the prime mover has stopped"
- **Cummins: load-step rule of thumb for paralleled unequal sets**
  - Source: Paralleling Dissimilar Generators: Part 1 – An Overview. https://mart.cummins.com/imagelibrary/data/assetfiles/0056597.pdf
  - Quote: "As a general rule, there will be no negative impacts due to difference in engine performance if the transient load steps are less than 25% of the rating of the smallest generator set in the system."
- **Cummins: different sets accept and reject load differently, risk of nuisance reverse power**
  - Source: Paralleling Dissimilar Generators: Part 1 – An Overview. https://mart.cummins.com/imagelibrary/data/assetfiles/0056597.pdf
  - Quote: "It is possible to have the system exposed to potential overcurrent conditions on the faster machine or nuisance reverse power faults on load rejection."
- **Stamford: AGN124 dedicated AVR supply keeps excitation under a short circuit**
  - Source: AGN 124 – AVR Power Supplies. https://www.stamford-avk.com/sites/stamfordavk/files/AGN124_C.pdf
  - Quote: "The provision of a dedicated power supply to an AVR will allow the alternator’s excitation to be maintained and if required, forced"
- **Stamford AGN124: aux winding keeps output so protection can clear the fault**
  - Source: AGN 124 – AVR Power Supplies. https://www.stamford-avk.com/sites/stamfordavk/files/AGN124_C.pdf
  - Quote: "This allows the alternator to sustain its output during a short-circuit condition so the load’s protection devices have time to clear the fault."
- **Mecc Alte: sub-transient peak and the area sustained by excitation**
  - Source: Mecc Alte Short Circuit Bulletin (page title "Bulletin"). https://www.meccalte.com/downloads/Short_Circuit_Bulletin.pdf
  - Quote: "For the instantaneous sub-transient 3ph short circuit current we then have:"
- **Mecc Alte: shunt-excited machines do not sustain current; amps decay**
  - Source: Mecc Alte Short Circuit Bulletin (page title "Bulletin"). https://www.meccalte.com/downloads/Short_Circuit_Bulletin.pdf
  - Quote: "Some manufacturers offer self-excited (shunt) machines as a standard up to ~600kVA, where the current is not sustained."
- **Mecc Alte: a sustained current opens the breaker if the fast trip has not**
  - Source: Mecc Alte Short Circuit Bulletin (page title "Bulletin"). https://www.meccalte.com/downloads/Short_Circuit_Bulletin.pdf
  - Quote: "will open the breaker if not already done so earlier"
- **Lerus: PMS objectives (blackout prevention, preferential tripping, share load, heavy consumer blocking, recovery)**
  - Source: Lerus Training blog - Components of the dynamic positioning (DP) system - Power. https://www.lerus.com/blog/components-of-the-dynamic-positioning-system-power
  - Quote: "Controlling the load and preventing overload (Blackout Prevention function);"
- **Lerus: preferential tripping example, air conditioner off to give thrusters power**
  - Source: Lerus Training blog - Components of the dynamic positioning (DP) system - Power. https://www.lerus.com/blog/components-of-the-dynamic-positioning-system-power
  - Quote: "Reducing the load and disconnecting some particular consumers, when it is necessary"
- **Lerus: heavy consumer blocking, spinning reserve**
  - Source: Lerus Training blog - Components of the dynamic positioning (DP) system - Power. https://www.lerus.com/blog/components-of-the-dynamic-positioning-system-power
  - Quote: "Monitoring available power at present (spinning reserve) and, whether it is necessary, to connect more generators for starting a heavy consumer (Heavy Consumer Blocking function);"

### 4.8 The generator in a power system: motor starting and the voltage dip; blackout and restoration; the diesel generator as a whole
Starting a motor across the line draws about six times full-load current (six to nine in some sources) until about 75 percent speed; the
first dip is set by the generator's sub-transient reactance, then the engine slows, the AVR recovers the voltage, and maker practice
asks for recovery to at least 90% of rated voltage (computed: torque goes with voltage squared, 0.9 squared is 0.81, which is the
Cummins statement of 81% of rated torque). Soft starters, sequencing and starting the largest motor first (after critical loads) are the remedies. Blackout
prevention, preferential tripping and blackout recovery are the power management system's functions. A generator set should not run
lightly loaded for long (engine damage). Dan has the engine's energy split (Heat and fluids lesson 4) and starting current (Motors
lesson 2).

- **Motor starting current about six times full load until about 75 percent speed**
  - Source: Cummins Power Hour, Generator Set Sizing Software: Transient Performance and Motor Load Capabilities (page title "TITLE"). https://www.cummins.com/sites/default/files/2020-03/PowerHour_Generator%20Set%20Sizing%20Software_Transient%20Performance%20and%20Motor%20Load%20Capabilities%20%281PDH%29.pdf
  - Quote: "Starting current is typically six times a motor’s rated full-load current, and this inrush current stays high until the motor reaches about 75 percent of rated speed"
- **A large motor start can cause a voltage dip that stalls the start**
  - Source: Sizing Generators for Motor Starting: A Practical Guide to Understanding How Motor-Starting Loads Affect Generator Performance. https://resources.kohler.com/power/kohler/industrial/pdf/Sizing_Generators_for_Motor_Starting_WP.pdf
  - Quote: "the high inrush currents (measured in kilovolt-amperes or KVAs) can result in a large voltage dip that can inhibit the motor from reaching its operating speed."
- **The dip is set at first by subtransient reactance**
  - Source: Sizing Gen-Sets For Large Motor Starting | EC&M. https://www.ecmweb.com/basics/article/20885994/sizing-gen-sets-for-large-motor-starting
  - Quote: "The generator terminal voltage drops instantaneously when the motor starter contacts close at time t40, as a function of the subtransient reactance"
- **Recovery to 90 percent of rated voltage is also required**
  - Source: Understanding Cummins Power Generation’s suggested specifications for motor starting. https://mart.cummins.com/imagelibrary/data/assetfiles/0056583.pdf
  - Quote: "the generator must recover to a minimum of 90% of rated voltage."
- **Soft starters on ship bow thrusters**
  - Source: Starting Motors on Generator Sets. https://benshaw.com/hubfs/Benshaw%20Website/Downloads/White-Papers/Benshaw-White-Paper-Starting-Motors-on-GenSets_EN.pdf
  - Quote: "Soft starters are frequently selected for control of ship bow thrusters due to the large size of the motors relative to the generator."
- **Light running of a generator set harms the engine; a 30 percent guide**
  - Source: How to size a genset: Proper generator set sizing requires analysis of parameters and loads. https://mart.cummins.com/imagelibrary/data/assetfiles/0056648.pdf
  - Quote: "Cummins Power Generation does not recommend running generator sets at less than 30 percent of rated load."
- **Blackout: standby set comes on load automatically**
  - Source: Blackout Situation on a Ship: What are the First Steps that Should be Taken?. https://www.marineinsight.com/blackout-situation-on-a-ship-what-are-the-first-steps-that-should-be-taken
  - Quote: "measures are provided to avoid such blackout situations by means of autoloading sharing system and auto standby system"
- **Blackout study: an uncontrolled load-sharing imbalance can cause a blackout**
  - Source: A Combinatorial Safety Analysis of Cruise Ship Diesel–Electric Propulsion Plant Blackout. https://www.mdpi.com/2313-576X/7/2/38
  - Quote: "An uncontrolled electrical load sharing imbalance will lead to a blackout in half of the cases"
- **Cummins power hour: the dip is a function of the sub-transient and transient reactance**
  - Source: Cummins Power Hour, Generator Set Sizing Software: Transient Performance and Motor Load Capabilities (page title "TITLE"). https://www.cummins.com/sites/default/files/2020-03/PowerHour_Generator%20Set%20Sizing%20Software_Transient%20Performance%20and%20Motor%20Load%20Capabilities%20%281PDH%29.pdf
  - Quote: "The voltage dip is a product of the alternator’s reactances, both sub-transient (X”d) and transient (X’d),"
- **Cummins power hour: load sequencing in steps with recovery**
  - Source: Cummins Power Hour, Generator Set Sizing Software: Transient Performance and Motor Load Capabilities (page title "TITLE"). https://www.cummins.com/sites/default/files/2020-03/PowerHour_Generator%20Set%20Sizing%20Software_Transient%20Performance%20and%20Motor%20Load%20Capabilities%20%281PDH%29.pdf
  - Quote: "Allow recovery between steps (5-10 Sec)"
- **Cummins 0056583: a 90 percent voltage gives 81 percent torque**
  - Source: Understanding Cummins Power Generation’s suggested specifications for motor starting. https://mart.cummins.com/imagelibrary/data/assetfiles/0056583.pdf
  - Quote: "If the generator can recover motor voltage to a minimum of 90% of rated voltage, the motor will develop 81% of rated torque, allowing adequate acceleration for most applications."
- **Cummins 0056583: the engine slowing makes under-frequency protection cut voltage further**
  - Source: Understanding Cummins Power Generation’s suggested specifications for motor starting. https://mart.cummins.com/imagelibrary/data/assetfiles/0056583.pdf
  - Quote: "engine speed response to the KW load can cause under frequency protection incorporated in the excitation system to further reduce the output voltage during a transient event"
- **Benshaw: the AVR cannot beat a fast step, so the dip is as if no AVR**
  - Source: Starting Motors on Generator Sets. https://benshaw.com/hubfs/Benshaw%20Website/Downloads/White-Papers/Benshaw-White-Paper-Starting-Motors-on-GenSets_EN.pdf
  - Quote: "In such situations, the voltage drop will be equal to that which would result if no AVR were present."
- **Benshaw: locked rotor current six to nine times full-load current**
  - Source: Starting Motors on Generator Sets. https://benshaw.com/hubfs/Benshaw%20Website/Downloads/White-Papers/Benshaw-White-Paper-Starting-Motors-on-GenSets_EN.pdf
  - Quote: "Typically, a motor’s locked rotor current (LRC) will be around 6 x Full Load Current (FLC), but levels above 9 x FLC are not uncommon."
- **Benshaw: open-transition star-delta reclosing out of phase**
  - Source: Starting Motors on Generator Sets. https://benshaw.com/hubfs/Benshaw%20Website/Downloads/White-Papers/Benshaw-White-Paper-Starting-Motors-on-GenSets_EN.pdf
  - Quote: "The voltage generated by the motor at the instant of reclose may be equal to the supply voltage but exactly out of phase."
- **Generac: three 100 hp motors started together compared with started in sequence**
  - Source: Generac white paper, Sizing Considerations for Commercial and Industrial Generators (page title "WHITE PAPER"). https://www.generac.com/globalassets/pdfs/industrial/whitepapers/sizing-considerations-for-comm-and-ind-gens.pdf
  - Quote: "Each unit started individually in sequence would reduce the starting kW required by 40 percent."
- **Generac: a leading power factor can cause voltage instability**
  - Source: Generac white paper, Sizing Considerations for Commercial and Industrial Generators (page title "WHITE PAPER"). https://www.generac.com/globalassets/pdfs/industrial/whitepapers/sizing-considerations-for-comm-and-ind-gens.pdf
  - Quote: "Leading power factor can cause voltage instability and/or over-voltage trips."
- **Cummins power hour: start larger loads first, after critical loads**
  - Source: Cummins Power Hour, Generator Set Sizing Software: Transient Performance and Motor Load Capabilities (page title "TITLE"). https://www.cummins.com/sites/default/files/2020-03/PowerHour_Generator%20Set%20Sizing%20Software_Transient%20Performance%20and%20Motor%20Load%20Capabilities%20%281PDH%29.pdf
  - Quote: "Start larger loads first (after critical loads)"
- **Cummins sizing: largest motor first rule**
  - Source: How to size a genset: Proper generator set sizing requires analysis of parameters and loads. https://mart.cummins.com/imagelibrary/data/assetfiles/0056648.pdf
  - Quote: "the “largest motor first” rule"

### 4.9 Generator neutrals and circulating current (handed over by Insulated systems and earth faults)
Paralleled sets can circulate third-harmonic current through their star points when their winding pitches differ. Fixes in the sources: 2/3 pitch
windings, or earthing one neutral only. Neutral earthing resistors limit the earth-fault current. This is outside
the eight-part scope in the task, so it is offered only as the hand-over Insulated systems made; the brief decides whether to keep it
as one screen.

- **Circulating neutral current when paralleled sets differ in winding pitch**
  - Source: Considerations when Paralleling Generating Sets. https://mart.cummins.com/imagelibrary/data/assetfiles/0056622.pdf
  - Quote: "Circulating Neutral Currents due to Alternator Pitch Differences"
- **One and only one neutral earthed among running sets (medium-voltage schemes)**
  - Source: Cressall catalogue 2024, neutral earthing and load banks (page title "Cressall"). https://www.cressall.com/wp-content/uploads/2024/06/cressallweb2024.pdf
  - Quote: "it is necessary to ensure that one (and only one, to avoid the possibility of circulating currents) of the neutrals of one of the running generating sets is earthed at all times."
- **2/3 pitch stops circulating currents through the star points**
  - Source: STAMFORD white paper WP105, AC generators with 2/3rd and 5/6th winding pitch. https://www.stamford-avk.com/sites/stamfordavk/files/2023-01/WP105-AC-Generators-with-2-3rd-and-5-6th-winding-pitch.pdf
  - Quote: "An additional benefit of 2/3rd pitched windings is the prevention of circulation currents through the star points of our generators when connected in parallel."
- **Cummins 0056622: third-order harmonics add in the neutral**
  - Source: Considerations when Paralleling Generating Sets. https://mart.cummins.com/imagelibrary/data/assetfiles/0056622.pdf
  - Quote: "Third-order harmonics (and their multiples) are problematical because they directly add in the neutral and can result in large neutral current flows between paralleled machines."
- **Cummins 0056622: line-current circulation is removed by voltage settings; neutral circulation is not**
  - Source: Considerations when Paralleling Generating Sets. https://mart.cummins.com/imagelibrary/data/assetfiles/0056622.pdf
  - Quote: "Current appearing in the neutral conductor is unlikely to be due to differences in voltage settings."
- **Cummins 0056622: 2/3 pitch gives no third-order harmonics**
  - Source: Considerations when Paralleling Generating Sets. https://mart.cummins.com/imagelibrary/data/assetfiles/0056622.pdf
  - Quote: "For paralleling applications, it is highly desirable to utilise 2/3 pitch designs because no third-order harmonics are created by the machine."
- **Cressall: the NER limits earth-fault current through the generator neutral**
  - Source: Cressall catalogue 2024, neutral earthing and load banks (page title "Cressall"). https://www.cressall.com/wp-content/uploads/2024/06/cressallweb2024.pdf
  - Quote: "Cressall neutral earthing resistors (NERs) are employed in AC distribution networks to limit the current that would flow through the neutral point of a transformer or generator in the event of an earth fault."

## 5. Prerequisites: what this topic leans on, what Dan has, what is taught inline
**Dan has (built courses, my reading):** the turning coil, rms, phasors, impedance, real, reactive and apparent power, power factor and its
correction, star and delta (AC circuits); the field from a current, the magnetic circuit, Faraday's law, regulation and percentage
impedance, paralleling transformers (Transformers and magnetism); the rotating field, the DOL starter and starting current, back-emf
(Motors); torque, power, inertia and run-up, couplings (Mechanics and materials); the diesel engine's energy split (Heat and fluids);
complex numbers for E = V + jXI, trigonometry, exponentials and straight lines for droop (the maths courses); the first earth fault
and insulated neutrals (Insulated systems and earth faults).

**Must be taught inline (not in a built course):** (1) frequency from speed and pole pairs, with the pole/pole-pair trap; (2) closed-loop
control in one picture, because the AVR and the governor are both a measured value held by changing an input, plus hunting; (3) droop as a
percentage and the line it draws, which is a straight-line graph plus a percentage; (4) the idea of an "infinite bus", the one new
concept in load sharing; (5) the per-phase equivalent circuit with a synchronous reactance, using Transformers lesson 6 as the bridge;
(6) the circuit-breaker closing-time idea behind the advance angle, in a sentence. The Brilliant pages give no help on level: Circuits
assumes nothing, and Electricity and Magnetism assumes mechanics and a taste for vectors.

- **Brilliant Circuits assumes no prior knowledge (the prerequisite Dan has passed)**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits
  - Quote: "This course assumes no prior knowledge and teaches the key ideas needed to understand electricity and electric circuits"
- **Brilliant Electricity and Magnetism prerequisites list Classical Mechanics**
  - Source: Practice Electricity and Magnetism | Brilliant. https://brilliant.org/courses/electromagnetism
  - Quote: "Prerequisites * Classical Mechanics * Scientific Thinking"

## 6. Misconceptions and learning science for each skill
I searched for school-level examiner reports and Bitesize's named mistakes (AQA, OCR, NCTM) and found none on synchronous machines:
the topic is above that level (**UNCONFIRMED** for any such source). What exists is below: manufacturers who name the mistakes their
customers make, the circuit-misconception literature, and learning-science papers.

### 6.1 The mistakes, by skill
**Frequency from speed (4.1):** pole or pole pair (the two formulas in 4.1). **The governor and the AVR (4.4, 4.6):** the mistake is
carrying the single-generator rule (fuel sets frequency, excitation sets voltage) into parallel running, where fuel sets the share and
excitation sets the kVAr share; the sources below state both rules side by side. **Droop (4.4):** that it is a fault to be removed; it is the
design that lets machines share. **Isochronous parallel (4.4):** two isochronous sets compete, one takes all the load. **Synchronising
(4.5):** trusting a synchroscope for phase sequence; closing a manual breaker without allowing for closing time; holding the close
contact while the pointer sweeps round. **Reverse power (4.7):** raising the pickup instead of the delay. **Short circuit (4.7):** that
every alternator gives 300% of rated current for as long as it is needed; the makers say this is a misconception and that 300% for a
set time is specified for marine. **Motor starting (4.8):** that the AVR prevents the dip (it cannot beat a step faster than its response).

**The wider literature.** In the circuits literature the best-documented error is the "constant current" idea (the battery is a constant
source of current); the generator version is "the generator holds constant output whatever the load", which the quotes in this section (alone against in parallel) contradict. My reading: "local" reasoning (a change at one machine affects the whole bus) is the circuits paper's idea carried
to power systems, and the synchronising, load-sharing and blackout lessons are all about it. The paper's own point is that students also
hold productive ideas ("resistance limits current", "voltage drives current") that a lesson can build on.

- **Students often think a 300 percent short-circuit current is a given**
  - Source: AGN 005 – Fault Currents and Short Circuit Decrement Curves. https://www.stamford-avk.com/sites/stamfordavk/files/AGN005_D.pdf
  - Quote: "There is a misconception that all alternators - fitted with an appropriate excitation system - will generate at least 300% short circuit current under the steady state"
- **300 percent is not an industry standard except for marine**
  - Source: Mecc Alte Short Circuit Bulletin (page title "Bulletin"). https://www.meccalte.com/downloads/Short_Circuit_Bulletin.pdf
  - Quote: "Although 300% is regularly requested for up to 10 seconds, it is not an industry standard, with the exception of marine alternators."
- **A single generator's P and Q are set by the load, not by its controls**
  - Source: EEEB344 Electromechanical Devices, Chapter 5 Synchronous Generator. https://abs.cu.edu.tr/Dokumanlar/2017/EEE318/271877548_2_synchronous_machines.pdf
  - Quote: "the P and Q supplied cannot be controlled by the generator’s controls."
- **Alone, more fuel raises frequency; in parallel it raises the share**
  - Source: ACTIVE & REACTIVE POWER SHARING IN PARALLELED GENERATORS (KW & KVAR) - DieselShip. https://dieselship.com/marine-technical-articles/marine-electro-technology/active-reactive-power-sharing-in-a-paralleled-generator-set-kw-kvar
  - Quote: "But, if the engine is running alone, then increasing fuel shall increase the frequency"
- **Mismatched speed settings stop machines sharing kW properly**
  - Source: Paralleling Dissimilar Generators: Part 3 – Load Sharing Compatibility. https://mart.cummins.com/imagelibrary/data/assetfiles/0056549.pdf
  - Quote: "if a generator set is regulated to a different speed than the others, it will not share kW load properly with other generator sets in the system."
- **A battery is a constant source of current (the circuits misconception)**
  - Source: Student conceptual resources for understanding electric circuits | Phys. Rev. Phys. Educ. Res.. https://link.aps.org/doi/10.1103/PhysRevPhysEducRes.20.020128
  - Quote: "An often-cited example of this difficulty is the notion that the battery is a constant source of current, where students do not appear to recognize the role of resistance in determining the current through a circuit"
- **Misconception research mostly lists difficulties**
  - Source: Student conceptual resources for understanding electric circuits | Phys. Rev. Phys. Educ. Res.. https://link.aps.org/doi/10.1103/PhysRevPhysEducRes.20.020128
  - Quote: "existing research on students’ ideas has primarily focused on misconceptions, misunderstandings, and difficulties."
- **Local versus global reasoning in circuits**
  - Source: Student conceptual resources for understanding electric circuits | Phys. Rev. Phys. Educ. Res.. https://link.aps.org/doi/10.1103/PhysRevPhysEducRes.20.020128
  - Quote: "“Local reasoning” is characterized by a difficulty in recognizing that a change in one part of a circuit affects global variables."
- **Students' resources: resistance limits current, voltage drives current**
  - Source: Student conceptual resources for understanding electric circuits | Phys. Rev. Phys. Educ. Res.. https://link.aps.org/doi/10.1103/PhysRevPhysEducRes.20.020128
  - Quote: "We named these resources “current is responsive” (to changes in the circuit), “voltage drives current,” and “resistance limits current,”"
- **The single generator versus the paralleled generator constraint**
  - Source: EEEB344 Electromechanical Devices, Chapter 5 Synchronous Generator. https://abs.cu.edu.tr/Dokumanlar/2017/EEE318/271877548_2_synchronous_machines.pdf
  - Quote: "When a single generator operated alone, the real and reactive powers supplied by the generators are fixed, constrained to be equal to the power demanded by the load"
- **In a two-generator system, frequency is not fixed (the constraint changes again)**
  - Source: EEEB344 Electromechanical Devices, Chapter 5 Synchronous Generator. https://abs.cu.edu.tr/Dokumanlar/2017/EEE318/271877548_2_synchronous_machines.pdf
  - Quote: "The system frequency is not constrained to be constant, and neither is the power of a given generator constrained to be constant."
- **Cummins: 25 percent steps can be handled; larger steps expose differences**
  - Source: Paralleling Dissimilar Generators: Part 1 – An Overview. https://mart.cummins.com/imagelibrary/data/assetfiles/0056597.pdf
  - Quote: "Compatible engines can share load nearly equally, at all load levels, while operating at steady state load levels and during transient loading conditions."

### 6.2 Learning science
**Predict first.** Predict-observe-explain (POE) asks for a written prediction and reason before the demonstration; it works best with a
demonstration that gives an immediate observation (an interactive qualifies), and the notes warn against surprise every time and against
guesses. **Worked examples first for a novice (expertise reversal).** **Retrieve, then re-study.** Retrieval beats re-reading when there is
feedback; the effect is around half a standard deviation; four re-learnings give most of the benefit, so old principles can drop off the
spaced review. My reading: the app's predict, play, explain, say it back, quick check pattern is supported by these, and the review of
what Dan answered is the retrieval. The evidence for interactive simulations alone is thinner (a 2025 quasi-experiment with 107 pupils
compares simulation-enriched POE with traditional POE, so it supports the combination, not simulations on their own).

- **Prediction first: students may not observe carefully without it**
  - Source: Predict, Observe, Explain (POE) | Assessment Resource Banks. https://arbs.nzcer.org.nz/predict-observe-explain-poe
  - Quote: "Unless students are asked to predict first what will happen, they may not observe carefully."
- **Surprise opens the door to re-examining ideas**
  - Source: Predict, Observe, Explain (POE) | Assessment Resource Banks. https://arbs.nzcer.org.nz/predict-observe-explain-poe
  - Quote: "Events that surprise create conditions where students may be ready to start re-examining their personal theories."
- **Caution: learners learn more from observations that confirm their predictions**
  - Source: Predict, Observe, Explain (POE) | Assessment Resource Banks. https://arbs.nzcer.org.nz/predict-observe-explain-poe
  - Quote: "Some researchers say that students are more likely to learn from observations that confirm their predictions."
- **POE with simulations raised physics achievement**
  - Source: ERIC - EJ1496573 - An Experimental Study Exploring the Effects of Predict-Observe-Explain Method Supported with Simulations, Research in Science & Technological Education, 2025. https://eric.ed.gov/?id=EJ1496573
  - Quote: "The results showed that the experimental group outperformed the control group regarding physics achievement."
- **Retrieval of principles feeds worked-example self-explanation**
  - Source: Mandatory retrieval test to incentivize retrieval practice of physics principles. https://journals.aps.org/prper/pdf/10.1103/PhysRevPhysEducRes.21.010119
  - Quote: "Retrieval practice of physics principles transfers to self- explanation of worked examples by increasing principle- based explanations"
- **Novices learn better from worked examples**
  - Source: Comparing retrieval-based practice and peer instruction in physics learning. https://journals.aps.org/prper/pdf/10.1103/PhysRevPhysEducRes.15.010105
  - Quote: "experts learn better from problem solving, but novices learn better from worked examples."
- **Retrieval beats restudy given feedback**
  - Source: Mandatory retrieval test to incentivize retrieval practice of physics principles. https://journals.aps.org/prper/pdf/10.1103/PhysRevPhysEducRes.21.010119
  - Quote: "Retrieval, which involves actively recalling infor- mation, is more effective than restudy—where students review or reread materials—provided that some feedback is given when retrieval success rates are low [9]."
- **Retrieval effect about half a standard deviation**
  - Source: Mandatory retrieval test to incentivize retrieval practice of physics principles. https://journals.aps.org/prper/pdf/10.1103/PhysRevPhysEducRes.21.010119
  - Quote: "The effect of testing and retrieval is consistently found to be around half a standard deviation for facts, problem-solving, and concep- tual tests [9,10]."
- **Advice: gradually drop old principles, the first four re-learnings give most of the benefit**
  - Source: Mandatory retrieval test to incentivize retrieval practice of physics principles. https://journals.aps.org/prper/pdf/10.1103/PhysRevPhysEducRes.21.010119
  - Quote: "They were also advised to gradually drop old principles from their retrieval practice, as the first four re-learnings yield most of the benefits."
- **Peer-instruction restudy inflates confidence compared with retrieval**
  - Source: Comparing retrieval-based practice and peer instruction in physics learning. https://journals.aps.org/prper/pdf/10.1103/PhysRevPhysEducRes.15.010105
  - Quote: "This indicates that restudying using peer instruction inflates students’ confidence."
- **POE: asking for the reasoning gives insight into misconceptions**
  - Source: Predict, Observe, Explain (POE) | Assessment Resource Banks. https://arbs.nzcer.org.nz/predict-observe-explain-poe
  - Quote: "Asking students to explain the reasons for their predictions gives the teacher indications of their theories."
- **POE: some demonstrations should not surprise or learners hunt for the trick**
  - Source: Predict, Observe, Explain (POE) | Assessment Resource Banks. https://arbs.nzcer.org.nz/predict-observe-explain-poe
  - Quote: "If the POE strategy is used often, some demonstrations should be chosen to not give surprising results, otherwise students start looking for the trick."
- **POE works best with demonstrations that give immediate observations**
  - Source: Predict, Observe, Explain (POE) | Assessment Resource Banks. https://arbs.nzcer.org.nz/predict-observe-explain-poe
  - Quote: "It works best with demonstrations that allow immediate observations"

## 7. Where it is used for an electrician going into marine engineering
Every use below has a quote from a reachable page. All are general marine and industrial equipment.

### 7.1 Uses, with sources
The STCW competence "operate generators and distribution systems" is, in the UK review of the STCW electro-technical competences, one
that every respondent called important and relevant. The IMO model course ties it to blackout procedure, shore connection and
emergency generators. A maker's manual warns against synchronising outside the specified parameters; a marine power management system
does the synchronising, sharing, preferential tripping and blackout recovery automatically, and a marine electrician has to
understand and commission what it does. For an electrician ashore the same ideas return in standby and embedded generating sets
(Section 551, 3.5).

- **Stamford: do not synchronise outside the specified parameters**
  - Source: STAMFORD S9 alternators owner manual (page title "A062L875 (Issue 5)"). https://www.stamford-avk.com/sites/stamfordavk/files/2025-03/S9-Owners-Manual-English.pdf
  - Quote: "Do not synchronize parallel alternators outside the specified parameters."
- **UK review of STCW: coupling and load sharing is in the competence list**
  - Source: UK seafarers: standards of training, certification and watchkeeping review survey report - Electro-technical survey - Guidance - GOV.UK. https://www.gov.uk/guidance/uk-seafarers-stcw-review-survey-report/electro-technical-survey
  - Quote: "1. Coupling, load sharing and changing over of generators, breaking connection between switchboards and distribution panels"
- **DEIF marine PMS features: automatic synchronisation, load sharing, blackout prevention and recovery**
  - Source: Integrated Systems, DM-4 Marine. https://kduworld.com/uploads/delomatic-4-brochure.pdf
  - Quote: "Automatic synchronisation"
- **Marine PMS: trip non-essential load groups**
  - Source: Integrated Systems, DM-4 Marine. https://kduworld.com/uploads/delomatic-4-brochure.pdf
  - Quote: "Trip of non essential load groups (preferential trip)"
- **Stamford AGN024: voltage matching to restored mains before paralleling**
  - Source: AGN024 – AVR Selection. https://www.stamford-avk.com/sites/stamfordavk/files/AGNs/AGN024_E.pdf
  - Quote: "Voltage Matching: Equalises the alternator’s terminal voltage with other synchronised"
- **IMO model course 7.08: rules of procedure after the black-out**
  - Source: IMO Model Course 7.08, Electro-technical Officer (page title "7.0 8"). https://cmu-edu.eu/calitate/wp-content/uploads/sites/6/2022/11/Electro-technical-Officer-Model-Course-7.08.pdf
  - Quote: "rules of procedure after the black-out and connections between the main switchboard and emergency switchboard"
- **UK STCW review: operating generators judged important by respondents**
  - Source: UK seafarers: standards of training, certification and watchkeeping review survey report - Electro-technical survey - Guidance - GOV.UK. https://www.gov.uk/guidance/uk-seafarers-stcw-review-survey-report/electro-technical-survey
  - Quote: "All respondents agreed that this section is important and relevant for today’s competence requirement and can be kept as is."
- **Mecc Alte: marine alternators specified for 300 percent sustained short circuit**
  - Source: Mecc Alte Short Circuit Bulletin (page title "Bulletin"). https://www.meccalte.com/downloads/Short_Circuit_Bulletin.pdf
  - Quote: "with the exception of marine alternators."

## 8. Size: how many lessons the benchmarks spend, and which core supports 8 lessons for Dan
**What the benchmarks spend.** Brilliant: 9 lessons (Electricity and Magnetism) and 31 lessons (Circuits), none on machines. Engineering
Devotion: **seven** lessons on alternators including synchronising (71 to 77), four more on synchronous motors. Cambridge Electrical
Machines: chapter 6 on alternators runs 500 to 625 and chapter 7 on parallel operation 626 to 663 (about 126 and 38 pages, computed from
the contents page numbers). Hughes: parallel operation
is 37.4, a few pages inside a chapter of about eleven. The IMO model course: **6 hours** for coupling, load sharing and changing over,
plus the machine theory in 1.1.3.

**Which core supports 8 lessons (my reading, a guess where marked).** The IMO model course 7.08, competence 1.3.1, is the best spine:
it names, in order, the machine (structure, armature reaction, equivalent circuit and phasor diagram), the synchronising methods, voltage
and frequency control, active and reactive power distribution, excitation, protections (short-circuit, overload, reverse power,
under and over voltage and frequency) and power management. The scope's eight parts map onto it one to one: (1) the alternator, 1.1.3;
(2) excitation and the AVR, 1.3.1 excitation systems and voltage control; (3) the loaded generator, 1.1.3 armature reaction and phasor
diagram; (4) the governor, 1.3.1 frequency control and the step load; (5) synchronising, 1.3.1 methods and the instruments; (6) load
sharing, 1.3.1 active and reactive power distribution; (7) protection and faults, 1.3.1 protections; (8) the generator in a power
system, 1.3.1 power management and 1.3.2 black-out procedure. Engineering Devotion's seven alternator lessons cover the machine, the loaded generator, and synchronising
and parallel operation; they lack the governor, the AVR as a control, protection and the system view, which the manufacturers and the
IMO course supply. So eight lessons fit only if the machine-theory lessons are merged, which is my guess. The brief may merge 7 and 8
and split synchronising from load sharing; that is a choice, not a finding. If it keeps generator neutrals (4.9) that is a screen,
not a lesson.

- **IMO model course: six hours on coupling, load sharing and changing over**
  - Source: IMO Model Course 7.08, Electro-technical Officer (page title "7.0 8"). https://cmu-edu.eu/calitate/wp-content/uploads/sites/6/2022/11/Electro-technical-Officer-Model-Course-7.08.pdf
  - Quote: "1.3.1 COUPLING, LOAD SHARING AND CHANGING OVER GENERATORS"
- **Pearson HN Unit 21: one learning outcome of four is on generators (15-credit unit)**
  - Source: Pearson BTEC Higher Nationals in Engineering, Unit 21 Electrical Machines (page title "HN-ENG-spec Issue 7.pdf"). https://unicourse.org/wp-content/uploads/2020/10/U21-Electrical-Machines.pdf
  - Quote: "3. Investigate the types of generator available in industry by assessing their practical applications."
- **Hughes: parallel operation of synchronous generators is one section of 37 (pages 755 to 757)**
  - Source: Table of contents for Hughes electrical and electronic technology. https://catdir.loc.gov/catdir/toc/ecip0816/2008017741.html
  - Quote: "37.4 Parallel operation of synchronous generators 755"
- **Brilliant Circuits: 31 lessons in 7 levels, none on machines**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits
  - Quote: "Level 7 Analyzing Voltage"
- **Hughes: chapter 37 is a 12-page chapter of which 3 pages are parallel operation**
  - Source: Table of contents for Hughes electrical and electronic technology. https://catdir.loc.gov/catdir/toc/ecip0816/2008017741.html
  - Quote: "37.5 Three-phase synchronous motor: principle of action 757"

## 9. Not reached, or reached only in part (UNCONFIRMED)
- Brilliant's course index and the path around Electricity and Magnetism (1.1). Wisconsin's syllabus (1.3).
- A Caterpillar or ComAp application guide (2.4); an OpenLearn course (2.5).
- Hughes 12th edition section lists for chapters 31 and 32 (only the older edition's contents were quoted); Bird chapters 37 to 46 (2.2).
- MCA's modernised syllabus and its digital assessment lines (3.2); the 2024 Pearson unit descriptor's generator content (3.4); which
  of BS 7671's Section 551 regulations the 18th Edition unit assesses (3.5).
- School examiner reports or Bitesize named mistakes for synchronous machines (6).
- A Siemens or ABB paralleling guide for generators; pages that appeared in searches but whose words the checker could not see, so they are not quoted
  (an IET Wiring Matters piece on generator earthing, the Select 2026 Amendment 4 summary, an ABB generator protection relay
  datasheet, a Blackwell Automation page, a trade site's advice to close on the slow side of 12).
- Nothing in this file is from a Royal Navy source, a submarine's systems or Dan's SMQ books.
