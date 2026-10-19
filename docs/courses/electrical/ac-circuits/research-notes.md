# AC circuits: research notes

Researched 19 Oct 2026 for the AC circuits course brief (the first course on the new Electrical engineering shelf; blurb "How alternating
current behaves, from the sine wave to three-phase power: rms, reactance, impedance, power factor and its correction, star and delta.
General principles that hold on any installation, ashore or afloat."). The brief itself is not written here; these notes are its evidence.
Dan is a qualified electrician (EAL NVQ L3 Electrical Installation, BS 7671:2018, inspection and test, L4 Design and Verification, cable
fault location) now on the Royal Navy electrical engineering path. He has no syllabus yet, so the course teaches general AC principles that
hold wherever he goes. He has the built maths courses Trigonometry (circle to wave, adding waves with phasors, power factor as a cosine)
and Complex numbers (j, Argand diagram, polar form, phasors, impedance). Courses after this one on the shelf: Transformers, Three-phase
power systems at sea, Machines and drives, Instrumentation and control, Maintenance and fault-finding.

Every finding has its source title, URL and the exact words, cut from a saved tool result by script (the quotes were not retyped into this
file; line breaks inside a quote are shown as spaces here and kept in quotes.json). All are listed in `quotes.json` beside this file and were
checked with `node tools/eval/sources.mjs --quotes ... --tools ...`. The tool files are in `tools/`. Findings I could not confirm are marked
**UNCONFIRMED**; where only a non-original site said it, **SECONDARY**. My own readings are marked "My reading" and are not quotes.
Where a page is a mirror of an original text, the original host is named (the Kuphaldt text is quoted from its ibiblio host, because
allaboutcircuits.com refused the fetch tool with HTTP 403 on every page; its table of contents came from a search result instead).

Two honest limits up front. (1) Several sources are student notes or lecture slides whose maths came through the tool as garbled text; I
quoted only their words, and for formulas I used the text sources that state them in words or plain text. (2) The research tool hit a
free-tier rate limit twice (two fetches failed and were redone later), so some pages I wanted were not re-fetched; they are listed under
UNCONFIRMED where they matter.

---

## 1. Benchmarks for general AC principles

### 1.1 All About Circuits: Lessons in Electric Circuits, Volume II (AC)
The book has 14 chapters in the contents (the 13th, AC motors, is marked pending). Chapters 1 to 6, 10 and 11 are the ground of this course; chapters 7 (mixed frequency), 8 (filters), 9 (transformers), 12 (metering), 13 (motors) and 14 (transmission lines) are not.
- **Volume II (AC) has 14 chapters; the last two before the appendices are metering and transmission lines, and AC motors is pending**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Table of Contents. http://www.faqs.org/docs/electric/AC/index.html
  - Quote: "Chapter 1: BASIC AC THEORY * Chapter 2: COMPLEX NUMBERS * Chapter 3: REACTANCE AND IMPEDANCE -- INDUCTIVE * Chapter 4: REACTANCE AND IMPEDANCE -- CAPACITIVE * Chapter 5: REACTANCE AND IMPEDANCE -- R, L, AND C * Chapter 6: RESONANCE * Chapter 7: MIXED-FREQUENCY AC SIGNALS * Chapter 8: FILTERS * Chapter 9: TRANSFORMERS * Chapter 10: POLYPHASE AC CIRCUITS * Chapter 11: POWER FACTOR * Chapter 12: AC METERING CIRCUITS * Chapter 13: AC MOTORS *PENDING* * Chapter 14: TRANSMISSION LINES"
- **Chapter 1 pages: waveforms, magnitude (peak, rms), simple calculations, phase**
  - Source: Textbook for Electrical Engineering & Electronics - All About Circuits. https://www.allaboutcircuits.com/textbook/
  - Quote: "1 Basic AC Theory Pages * What is Alternating Current (AC)? * AC Waveforms * Measurements of AC Magnitude * Simple AC Circuit Calculations * AC Phase * Principles of Radio"
- **Chapters 3 to 6: reactance and impedance (inductive, capacitive, R L and C together), then resonance**
  - Source: Textbook for Electrical Engineering & Electronics - All About Circuits. https://www.allaboutcircuits.com/textbook/
  - Quote: "3 Reactance and Impedance—Inductive Pages * AC Resistor Circuits (Inductive) * AC Inductor Circuits * Series Resistor-Inductor Circuits * Parallel Resistor-Inductor Circuits * Inductor Quirks * What Is the Skin Effect? * 4 Reactance and Impedance—Capacitive Pages * AC Resistor Circuits (Capacitive) * AC Capacitor Circuits * Series Resistor-Capacitor Circuits * Parallel Resistor-Capacitor Circuits * Capacitor Quirks * 5 Reactance and Impedance—R, L, And C Pages * Review of R, X, and Z (Resistance, Reactance and Impedance) * Series R, L, and C * Parallel R, L, and C * Series-parallel R, L, and C * Susceptance and Admittance * R, L and C Summary * 6 Resonance Pages * An Electric Pendulum * Simple Parallel (Tank Circuit) Resonance * Simple Series Resonance * Applications of Resonance * Resonance in Series-Parallel Circuits * Q Factor and Bandwidth of a Resonant Circuit"
- **Chapter 11 sections: power in resistive and reactive circuits, true/reactive/apparent power, power factor, correction**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 11. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_11.html
  - Quote: "Power in resistive and reactive AC circuits * True, Reactive, and Apparent power * Calculating power factor * Practical power factor correction"
Chapter 10 (Polyphase AC circuits) is where three-phase sits. Its sections, read from the fetched page, are single-phase power systems (split phase), three-phase power systems, three-phase Y and Delta configurations, and harmonics in polyphase systems (see 3.10). Chapter 2 (Complex numbers) is what Dan already has from the maths shelf.
My reading: the benchmark teaches in this order: waveforms and rms; complex numbers; inductive reactance and impedance; capacitive reactance and impedance; R, L and C together; resonance; then (after filters and transformers) three-phase and power factor. It puts power factor late. For Dan the order should change (see 7), because power factor and kVA are what an electrician meets first and his complex numbers are already built.

### 1.2 Hughes Electrical and Electronic Technology
- **Hughes (revised Hiley, Brown, McKenzie Smith) spends chapters 9 to 15 of Section 1 on AC: voltage and current, series, parallel, power, complex notation, resonance, network theorems**
  - Source: Table of contents for Hughes electrical and electronic technology. https://catdir.loc.gov/catdir/toc/ecip0816/2008017741.html
  - Quote: "9 Alternating Voltage and Current	197 10 Single-phase Series Circuits	222 11 Single-phase Parallel Networks	243 12 Power in AC Circuits	259 13 Complex Notation	273 14 Resonance in AC Circuits	298 15	Network Theorems Applied to AC Networks	321"
- **Hughes chapter 12 (Power in AC Circuits) has a section on the practical importance of power factor**
  - Source: Table of contents for Hughes electrical and electronic technology. https://catdir.loc.gov/catdir/toc/ecip0816/2008017741.html
  - Quote: "12.1	The impossible power	260 12.2	Power in a resistive circuit	260 12.3	Power in a purely inductive circuit	261 12.4	Power in a purely capacitive circuit	263 12.5	Power in a circuit with resistance and reactance	264 12.6	Power factor	266 12.7	Active and reactive currents	268 12.8	The practical importance of power factor	270 12.9	Measurement of power in a single-phase circuit	271"
- **Hughes chapter 14 covers series resonance: resonant frequency, current, voltages in the circuit, Q**
  - Source: Table of contents for Hughes electrical and electronic technology. https://catdir.loc.gov/catdir/toc/ecip0816/2008017741.html
  - Quote: "14.3	The resonant frequency of a series RLC circuit 	302 14.4	The current in a series RLC circuit	302 14.5	Voltages in a series RLC circuit	302 14.6	Quality factor Q"
My reading: Hughes puts complex notation (ch 13) after power (ch 12) and before resonance (ch 14), so it teaches power factor with phasor diagrams and trigonometry first. That order fits Dan, who has trigonometry for the triangle and complex numbers for impedance. The three-phase chapter is not in this table of contents (the excerpt shows chapters 9 to 15 only); the book's three-phase material is **UNCONFIRMED** here.

### 1.3 Bird's Electrical Circuit Theory and Technology
- **Bird 7th edition Section 3: d.c. theory, alternating voltages and currents, single-phase series and parallel a.c., transients, three-phase systems**
  - Source: Bird's Electrical Circuit Theory and Technology - 7th Edition - John B. https://www.routledge.com/Birds-Electrical-Circuit-Theory-and-Technology/Bird/p/book/9780367672225
  - Quote: "Section 3 Electrical Principles and Technology 15. d.c. circuit theory 16. Alternating voltages and currents 17. Single-phase series a.c. circuits 18. Single-phase parallel a.c. circuits 19. d.c. transients 20. Operational amplifiers 21. Global climate change and the future of electricity generation 22. Three-phase systems 23. Transformers 24. d.c. machines 25. Three-phase induction motors"
- **Bird 7th edition Section 4 (advanced): complex numbers applied to series and parallel a.c., power in a.c., a.c. bridges, series and parallel resonance and Q-factor**
  - Source: Bird's Electrical Circuit Theory and Technology - 7th Edition - John B. https://www.routledge.com/Birds-Electrical-Circuit-Theory-and-Technology/Bird/p/book/9780367672225
  - Quote: "Section 4 Advanced circuit theory and technology 26. Revision of complex numbers 27. Application of complex numbers to series a.c. circuits 28. Application of complex numbers to parallel a.c. circuits 29. Power in a.c. circuits 30. a.c. bridges 31. Series resonance and Q-factor 32. Parallel resonance and Q-factor"
- **Bird 5th edition page counts: alternating voltages and currents 16 pages, series a.c. 18, parallel a.c. 17**
  - Source: Electrical Circuit Theory and Technology, 5th ed | John Bird | Taylor. https://www.taylorfrancis.com/books/mono/10.4324/9781315883342/electrical-circuit-theory-technology-5th-ed-john-bird
  - Quote: "chapter 14 | 16 pages #### Alternating voltages and currents Title Abstract ### chapter 15 | 18 pages #### Single-phase series a.c. circuits Title Abstract ### chapter 16 | 17 pages #### Single-phase parallel a.c. circuits"
- **Bird 5th edition: Three-phase systems is a 13-page chapter**
  - Source: Electrical Circuit Theory and Technology, 5th ed | John Bird | Taylor. https://www.taylorfrancis.com/books/mono/10.4324/9781315883342/electrical-circuit-theory-technology-5th-ed-john-bird
  - Quote: "chapter 19 | 13 pages #### Three-phase systems"
- **Bird 5th edition: Power in a.c. circuits 14 pages**
  - Source: Electrical Circuit Theory and Technology, 5th ed | John Bird | Taylor. https://www.taylorfrancis.com/books/mono/10.4324/9781315883342/electrical-circuit-theory-technology-5th-ed-john-bird
  - Quote: "chapter 26 | 14 pages #### Power in a.c. circuits"
- **Bird 5th edition: Series resonance and Q-factor 15 pages**
  - Source: Electrical Circuit Theory and Technology, 5th ed | John Bird | Taylor. https://www.taylorfrancis.com/books/mono/10.4324/9781315883342/electrical-circuit-theory-technology-5th-ed-john-bird
  - Quote: "chapter 28 | 15 pages #### Series resonance and Q-factor"
- **Bird is aimed at BTEC National and City & Guilds technician courses (the ground Dan has crossed), higher courses use it as revision**
  - Source: Bird's Electrical Circuit Theory and Technology - 7th Edition - John B. https://www.routledge.com/Birds-Electrical-Circuit-Theory-and-Technology/Bird/p/book/9780367672225
  - Quote: "The text includes some essential mathematics revision, together with all the essential electrical and electronic principles for BTEC National and Diploma syllabuses and City & Guilds Technician Certificate and Diploma syllabuses in engineering. This material will be a great revision for those on higher courses."
### 1.4 Khan Academy and MIT OpenCourseWare
- **Khan Academy "AC circuit analysis" lesson (Electrical engineering, Unit 2, Lesson 5) video list**
  - Source: Impedance (video) | AC circuit analysis | Khan Academy. https://www.khanacademy.org/science/electrical-engineering/ee-circuit-analysis-topic/ee-ac-analysis/v/ee-impedance
  - Quote: "Lesson 5: AC circuit analysis * Euler's cosine wave * Negative frequency * AC analysis superposition * Impedance * Impedance vs frequency * ELI the ICE man * Impedance of simple networks * KVL in the frequency domain"
- **Khan Academy defines impedance as the ratio of sinusoidal voltage to sinusoidal current**
  - Source: Impedance (video) | AC circuit analysis | Khan Academy. https://www.khanacademy.org/science/electrical-engineering/ee-circuit-analysis-topic/ee-ac-analysis/v/ee-impedance
  - Quote: "The ratio of a sinusoidal voltage to a sinusoidal current is called "impedance". This is a generalization of Ohm's Law for resistors. We derive the impedance of a resistor, inductor, and capacitor."
- **MIT OCW 8.02T (Electricity and Magnetism) AC circuits notes: sources, simple circuits, RLC series, power, parallel RLC**
  - Source: cha12ac_circuits.pdf | Electricity and Magnetism | Physics | MIT OpenCourseWare. https://ocw.mit.edu/courses/8-02t-electricity-and-magnetism-spring-2005/resources/cha12ac_circuits
  - Quote: "This resource includes the following topics: AC Sources, Simple AC circuits, The RLC Series Circuit, Power in an AC circuit, Transformer, Parallel RLC Circuit"
- **OpenStax University Physics Volume 2 chapter 15 (Alternating-Current Circuits): simple AC circuits objective**
  - Source: 15.2 Simple AC Circuits - University Physics Volume 2 | OpenStax. https://openstax.org/books/university-physics-volume-2/pages/15-2-simple-ac-circuits
  - Quote: "Interpret phasor diagrams and apply them to ac circuits with resistors, capacitors, and inductors"
- **OpenStax College Physics 2e RLC series AC circuits: objective lists impedance, phase angle, resonant frequency, power, power factor in one section**
  - Source: 23.12 RLC Series AC Circuits - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/23-12-rlc-series-ac-circuits
  - Quote: "Calculate the impedance, phase angle, resonant frequency, power, power factor, voltage, and/or current in a RLC series circuit."
My reading: Khan and MIT are physics or circuit-analysis courses built on phasors and complex impedance from the first lesson (Khan: Euler, negative frequency, superposition, then impedance). Dan has complex numbers and phasors built, so this is the right pitch for impedance, but both skip star and delta and the kVA view of power, which a trade and ship setting needs. MIT 8.02T is a first-year physics course: its AC notes stop at parallel RLC and a transformer.

### 1.5 The Open University
- **The Open University's OpenLearn "An introduction to electronics" is DC-first: basic theory (Ohm, Kirchhoff, series/parallel), fundamental circuits, then signals**
  - Source: An introduction to electronics: 2.1 Basic electrical quantities | OpenLearn - Open University. https://www.open.edu/openlearn/science-maths-technology/an-introduction-electronics/content-section-2.1
  - Quote: "2 Basic theory of electrical circuits * Current section: 2.1 Basic electrical quantities * 2.2 Relationships between quantities * 2.3 Ohm’s law and Kirchhoff ’s laws * Ohm’s law * Kirchhoff ’s laws * Series and parallel networks (combining the laws) * 2.4 Colour coding and standard resistor values * 3 Some fundamental circuits * 3.1 Voltage dividers * 3.2 The Wheatstone bridge * 3.3 Operational amplifier circuits * 3.4 Designing a sensor circuit * 4 Signals and signal processing"
- **OpenLearn defines AC as the mains supply and DC as battery power, in one sentence**
  - Source: An introduction to electronics: 2 Basic theory of electrical circuits | OpenLearn - Open University. https://www.open.edu/openlearn/science-maths-technology/an-introduction-electronics/content-section-2
  - Quote: "Note that the term DC means direct current such as that in a circuit powered by a battery. In contrast, the term AC means alternating current as provided by electrical mains suppliers."
- **OpenLearn section 4.4 on sine waves: period T, frequency f = 1/T**
  - Source: An introduction to electronics: 4.4 Signals and sine waves | OpenLearn - Open University. https://www.open.edu/openlearn/science-maths-technology/an-introduction-electronics/content-section-4.4
  - Quote: "The period of the wave, T , is the time between successive peaks"
**UNCONFIRMED:** I did not find an Open University module or OpenLearn course on alternating current, reactance, impedance or power. The OU material reachable is the electronics introduction above (sine wave, frequency, amplitude, phase only). Physclips from the University of New South Wales (not the OU) is reachable and is a useful stand-in for animated AC lessons:
- **UNSW Physclips: animated AC lesson covering impedance, phase relations, resonance and rms**
  - Source: AC circuits, alternating current electricity. https://www.animations.physics.unsw.edu.au/jw/AC.html
  - Quote: "Time and phasor animations are used to explain alternating current (AC) circuits. Impedance, phase relations, resonance and RMS quantities are shown on this resource page"

---

## 2. Where AC principles sit in general qualifications

No single board. These are the lines I could see; each says what AC content a general electrical or engineering qualification carries.

### 2.1 Pearson BTEC
- **BTEC Level 3 Unit 56 (Electrical and Electronic Principles in Engineering) outcome 4: single-phase AC theory**
  - Source: Unit 4 E&E Principles. https://qualifications.pearson.com/content/dam/pdf/new-apprenticeships/sales-at-events/Engineering%20and%20Manufacturing/Unit%204%20E&E%20Principles.pdf
  - Quote: "Be able to use single-phase alternating current (AC) theory Single phase AC circuit theory: waveform characteristics e.g. sinusoidal and non-sinusoidal waveforms, amplitude, period time, frequency, instantaneous, peak/peak-to-peak, root mean square (rms), average values, form factor; determination of values using phasor and algebraic representation of alternating quantities e.g. graphical and phasor addition of two sinusoidal voltages, reactance and impedance of pure R, L and C components"
- **BTEC International Level 3: Three-Phase Electrical Systems is a separate optional unit beside Electrical Machines**
  - Source: Pearson BTEC International Level 3 in Engineering. https://qualifications.pearson.com/content/dam/pdf/btec-international-level-3/engineering/specification-and-sample-assessments/btecint-eng-specification.pdf
  - Quote: "15 Electrical Machines* 60 Optional Internal 16 Three-Phase Electrical Systems 60 Optional Internal"
- **BTEC International Level 3 Unit 16 content: phase power and total power in three-phase loads**
  - Source: Pearson BTEC International Level 3 in Engineering. https://qualifications.pearson.com/content/dam/pdf/btec-international-level-3/engineering/specification-and-sample-assessments/btecint-eng-specification.pdf
  - Quote: "calculation of phase power and total power in three-phase loads."
- **BTEC Level 3 National Unit 1 sample paper formula sheet: single-phase AC theory (period, reactances, Ohm's law for AC, rms)**
  - Source: Sample Assessment Materials - BTEC National in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/sample-assessment-material-unit-1-engineering-principles.pdf
  - Quote: "Single Phase Alternating Current Theory Time Period T = Capacitive reactance Xc = Inductive reactance XL = 2π fL Ohm’s Law AC circuits V Z I = (when voltage and current are in phase) Root mean square voltage"
- **BTEC Higher National Unit 4019 (Level 4): sinusoidal circuits, reactance, impedance, resonance, mains single-phase power, power factor, intro to three-phase**
  - Source: Unit 4019: Electrical and Electronic Principles. https://unicourse.org/wp-content/uploads/2020/04/Electrical-and-Electronic-Principles.pdf
  - Quote: "Reactance, impedance, resonance, bandwidth, quality factor Time and frequency response of filters Mains voltage single-phase systems. Active power, reactive power, complex Power, root-mean-square power quantities, power factor Introduction to DC and AC generators/motors, introduction to three phase power systems."
- **BTEC Higher National Unit 5019 (Level 5) learning outcome 2: three-phase network problems**
  - Source: Unit 5019: Further Electrical, Electronic and Digital Principles. https://unicourse.org/wp-content/uploads/2020/04/Further-Electrical-Electronic-and-Digital-Principles.pdf
  - Quote: "LO2 Apply appropriate methods to analyse and solve three- phase network problems"
- **Unit 5019 merit criterion: three-phase systems in terms of electrical power, efficiency and performance**
  - Source: Unit 5019: Further Electrical, Electronic and Digital Principles. https://unicourse.org/wp-content/uploads/2020/04/Further-Electrical-Electronic-and-Digital-Principles.pdf
  - Quote: "M2 Analyse how to synthesise three-phase systems in terms of electrical power, efficiency, and performance."
### 2.2 City & Guilds and EAL (Dan's own ground, for what he has already seen)
- **C&G 2365-03 Unit 302 aim: electrical science related to AC theory, machines, devices and systems**
  - Source: City & Guilds Level X Award/Certificate/Diploma in Xxxxxxx (XXXX-XX). https://www.cityandguilds.com/-/media/productdocuments/building_services_engineering/electrical_installation/2365/2365_level_3/centre_documents/2365-03_l3_diploma_qualification_handbook_v1-13-pdf.pdf
  - Quote: "Aim: The aim of this unit is to enable the candidate to understand the principles of electrical science related to AC theory, machines, devices and systems. This understanding is applied when designing wiring systems for clients and fault diagnosis."
- **C&G 2365-03 Unit 302: outcome 2 (electrical properties in circuits) carries 8 of 26 test questions**
  - Source: City & Guilds Level X Award/Certificate/Diploma in Xxxxxxx (XXXX-XX). https://www.cityandguilds.com/-/media/productdocuments/building_services_engineering/electrical_installation/2365/2365_level_3/centre_documents/2365-03_l3_diploma_qualification_handbook_v1-13-pdf.pdf
  - Quote: "02 Understand how different electrical properties can affect electrical circuits, systems and equipment 8 31"
- **C&G 2365-03 Unit 302 range: resistance, inductance, inductive reactance, capacitance, capacitive reactance, impedance**
  - Source: City & Guilds Level X Award/Certificate/Diploma in Xxxxxxx (XXXX-XX). https://www.cityandguilds.com/-/media/productdocuments/building_services_engineering/electrical_installation/2365/2365_level_3/centre_documents/2365-03_l3_diploma_qualification_handbook_v1-13-pdf.pdf
  - Quote: "Electrical quantities: • Resistance • Inductance • Inductive reactance • Capacitance • Capacitive reactance • Impedance"
- **C&G 2365-03 Unit 302: voltage and current in star and delta connected systems**
  - Source: City & Guilds Level X Award/Certificate/Diploma in Xxxxxxx (XXXX-XX). https://www.cityandguilds.com/-/media/productdocuments/building_services_engineering/electrical_installation/2365/2365_level_3/centre_documents/2365-03_l3_diploma_qualification_handbook_v1-13-pdf.pdf
  - Quote: "calculate values of voltage and current in star and delta connected systems"
- **C&G 2366-03 sample paper: inductive reactance of 20 mH at 50 Hz**
  - Source: https://www.cityandguilds.com/-/media/productdocuments/building_services_engineering/electrical_installation/2366/assessment-documents/sample-assessments/2366-350_mcq_exam_sample_v1-1-090326-pdf.pdf. https://www.cityandguilds.com/-/media/productdocuments/building_services_engineering/electrical_installation/2366/assessment-documents/sample-assessments/2366-350_mcq_exam_sample_v1-1-090326-pdf.pdf
  - Quote: "What is the inductive reactance (X L ) of an inductor of 20 milli-Henrys connected to a 50 Hz supply?"
- **C&G 2366-03 sample paper: impedance of R, L and C in series on 230 V 50 Hz**
  - Source: https://www.cityandguilds.com/-/media/productdocuments/building_services_engineering/electrical_installation/2366/assessment-documents/sample-assessments/2366-350_mcq_exam_sample_v1-1-090326-pdf.pdf. https://www.cityandguilds.com/-/media/productdocuments/building_services_engineering/electrical_installation/2366/assessment-documents/sample-assessments/2366-350_mcq_exam_sample_v1-1-090326-pdf.pdf
  - Quote: "A 230 V, 50 Hz, AC circuit contains a 40 Ω resistor in series with a 50 mH inductor and a 60 µF capacitor. What is the resulting circuit impedance?"
- **C&G 2366-03 sample paper: correcting power factor of an inductive load**
  - Source: https://www.cityandguilds.com/-/media/productdocuments/building_services_engineering/electrical_installation/2366/assessment-documents/sample-assessments/2366-350_mcq_exam_sample_v1-1-090326-pdf.pdf. https://www.cityandguilds.com/-/media/productdocuments/building_services_engineering/electrical_installation/2366/assessment-documents/sample-assessments/2366-350_mcq_exam_sample_v1-1-090326-pdf.pdf
  - Quote: "How could the power factor of an inductive load be corrected? (1 mark) Mark Scheme Answers a) Install a capacitor in parallel with the load."
- **A UK electrotechnical qualification specification (unit NETK3-08, awarding body not named in the excerpt) has "how different electrical properties can affect electrical circuits" as a learning outcome**
  - Source: Qualification Specification. https://assets-us-01.kc-usercontent.com/da3e2b8a-f498-0050-c097-1c7a05f428b8/3504df23-f1b7-4c5d-8593-36134ca148ae/QM.pdf
  - Quote: "Understand how different electrical properties can affect electrical circuits, systems and equipment. 9. Understand the operating principles and applications of DC machines and AC motors."
My reading: at Level 3 the electrician's qualification is calculation of X_L, X_C, Z, power factor and star/delta values, with parallel-capacitor correction as a recall question. That is what Dan has. It does not (in the lines I saw) ask for resonance, the power triangle with kvar sizing, or a derivation of the sqrt 3 in three-phase power. The EAL unit codes in Dan's brief were not reachable as a specification; the EAL NVQ L3 / L3 Electrical Installation unit lines are **UNCONFIRMED** (the document above is an electrotechnical specification that mentions EAL but does not name its own awarding body).

### 2.3 SQA Higher National
- **SQA Single Phase and Three Phase Principles (SCQF 6): single and three phase AC with power factor improvement by a parallel capacitor**
  - Source: national unit specification: general information. http://www.sqa.org.uk/files/nu/F5JV12.pdf
  - Quote: "This Unit has been designed to introduce candidates to single phase and three phase alternating current (ac) circuits. Candidates will be provided opportunities to develop their knowledge and understanding of single phase ac quantities and the principles of power factor improvement using capacitance in parallel with an inductive load."
- **The four outcomes of that unit**
  - Source: national unit specification: general information. http://www.sqa.org.uk/files/nu/F5JV12.pdf
  - Quote: "1 Solve problems involving single phase ac circuits. 2 Investigate the effects of connecting a capacitor in parallel across a R-L series circuit. 3 Explain the principles of three phase generation and determine line and phase relationships. 4 Solve problems involving three phase balanced loads."
- **SQA HN DC and AC Principles (SCQF 7): RLC in complex notation, phasor diagram, apparent/active/reactive power and power factor**
  - Source: national unit specification: general information. https://www.sqa.org.uk/files/hn/FY9E34.pdf
  - Quote: "Calculation of impedance, current and voltages in a R - L - C series circuit using complex notation Phasor (Argand) diagram representation of current and voltage quantities associated with an R - L - C series circuit"
- **SQA HN Three Phase Systems: derivation of sqrt 3 V_L I_L cos phi from 3 V_PH I_PH cos phi; power in balanced and unbalanced loads**
  - Source: national unit specification: general information. https://www.sqa.org.uk/files/hn/DDN4734.pdf
  - Quote: "Derivation of √3VLILcosφ from 3VPHIPHcosφ Calculation of total active, reactive and apparent power, and overall power factor in balanced and unbalanced three phase loads"
- **SQA Three Phase Systems content: phase and line voltage and current relationships for balanced star and delta loads**
  - Source: national unit specification: general information. https://www.sqa.org.uk/files/hn/DDN4734.pdf
  - Quote: "Phase and line voltage and current relationships for balanced star connected loads Phase and line voltage and current relationships for balanced delta connected loads"
- **SQA recommends three-phase after complex numbers and single-phase AC**
  - Source: national unit specification: general information. https://www.sqa.org.uk/files/hn/DDN4734.pdf
  - Quote: "It is recommended that this Unit be delivered after the candidate has gained experience in the use of complex numbers and single phase a.c. circuit theory."
- **SQA HN Electricity Power Systems outcome 4: sizing power factor capacitors for star and delta loads**
  - Source: national unit specification: general information. https://www.sqa.org.uk/files/hn/DDN3W34.pdf
  - Quote: "Determine the size and rating of power factor improvement capacitors for a star connected three phase inductive load. Determine the size and rating of power factor improvement capacitors for a delta connected three phase inductive load."
### 2.4 Marine engineering, ETO and the Royal Navy
- **MCA (UK) syllabus review, Electro-Technical Officer module "DC and AC Principles": single-phase AC with complex notation, RLC, power and power factor**
  - Source: 05a. ETO - DC and AC Principles - GOV.UK. https://www.gov.uk/government/consultations/cadet-training-modernisation-programmesyllabus-review-third-group-of-consultation-templates/05a-eto-dc-and-ac-principles
  - Quote: "Outcome 2: Solve single-phase ac circuit problems using complex notation | Keep | Relevant | None * 2.1 Circuit responses to the sudden application or removal of a dc voltage to an R – L series circuit | Keep | Relevant | None * 2.2 Calculation of impedance, current and voltages in a R - L - C series circuit using complex notation | Keep | Relevant | None * 2.3 Phasor (Argand) diagram representation of current and voltage quantities associated with an R - L - C series circuit | Keep | Relevant | None * 2.4 Calculation of apparent, active and reactive powers and power factor associated with an R - L - C series circuit"
- **MCA ETO module "Electrical Motors and Generators": three-phase circuits, star and delta, power factor, phasor diagrams, marine three-phase systems**
  - Source: 11. ETO - Electrical Motors and Generators - GOV.UK. https://www.gov.uk/government/consultations/cadet-training-modernisation-programmesyllabus-review-sixth-group-of-consultation-templates/outcome/11-eto-electrical-motors-and-generators
  - Quote: "Outcome1: Explain and solve problems on three-phase circuits | Keep | Relevant | None * 1.1Balanced star and delta connected loads | Keep | Relevant | None * 1.2 Power factor | Keep | Relevant | None * 1.3 Phasor diagrams | Keep | Relevant | None * 1.4 Unbalanced loads | Keep | Relevant | None * 1.5 Marine three phase systems"
- **Same MCA module: insulated and earthed neutral systems**
  - Source: 11. ETO - Electrical Motors and Generators - GOV.UK. https://www.gov.uk/government/consultations/cadet-training-modernisation-programmesyllabus-review-sixth-group-of-consultation-templates/outcome/11-eto-electrical-motors-and-generators
  - Quote: "3.13 Insulated and earthed neutral systems | Keep | Relevant | None * 3.14 Operation of reverse power relays | Keep | Relevant | None * 3.15 Earth fault detection"
- **A seagoing engineer officer Class 1 certificate paper (Hong Kong Marine Department sample, not MCA): alternators sharing a load at a lagging power factor**
  - Source: SEAGOING ENGINEER CLASS 1 ELECTROTECHNOLOGY. https://www.mardep.gov.hk/filemanager/en/share/pub-services/pdf/sample_c1_et.pdf
  - Quote: "8. Two 3 phase star-connected alternators share a load of 210 kW at power factor 0.75 lagging, in the ratio 2:3. The line voltage is 2.2 kV. If the current load on the first machine (i.e. the machine supplying the lesser power) is 28 A. Determine : (a) the current loading on the second machine; and (b) the power factors at which each of the machines are operating."
- **Royal Navy Marine Engineering SEMC course content names "ship electrical systems" and "AC generation & distribution"**
  - Source: Systems Engineering & Management Course | Royal Navy Defence Training. https://www.royalnavy.mod.uk/international-defence-training/onsite-courses/marine-engineering-trade/systems-engineering-and-management-course
  - Quote: "Gas turbines, diesels, transmissions, electrical propulsion systems, ship electrical systems, steering & stabilisers, AC generation & distribution"
- **Royal Navy Engineering Technician Qualifying Course (Weapon Engineering) lists "Basic electrical principles"**
  - Source: Engineering Technician Qualifying Course | Royal Navy Defence Training. https://www.royalnavy.mod.uk/international-defence-training/onsite-courses/weapon-engineering/engineering-technician-qualifying
  - Quote: "Basic electrical principles * Weapons systems introduction"
- **Royal Navy POET(ME) Generation Common course: alternator maintenance, AVRs and watchkeeping panels**
  - Source: POET Generation Common Course | Royal Navy Defence Training. https://www.royalnavy.mod.uk/international-defence-training/onsite-courses/marine-engineering-trade/poet-generation-common
  - Quote: "Alternator maintenance"
**UNCONFIRMED:** the MCA Engineer Officer (Chief/Second Engineer, Y-series) electrotechnology syllabus itself. The MCA pages reachable are the 2023 Cadet Training Modernisation syllabus-review templates for the Electro-Technical Officer (ETO, STCW III/6) route above; the Hong Kong paper is the nearest engineer-officer exam paper I could see. No Royal Navy page I saw lists AC topics at the level of reactance or power factor; the only AC line is "AC generation & distribution" in the officer SEMC (ME) course. The RN pages name courses, not syllabi.

My reading: every general qualification above puts the same core in the same order: single-phase quantities (rms, reactance, impedance), power triangle and power factor, power factor improvement by a parallel capacitor, then three-phase balanced loads in star and delta with power = sqrt 3 V_L I_L cos phi. Resonance appears in the higher (HN) units and in the Hughes and Bird books. The MCA ETO module puts "Marine three phase systems", insulated neutral and load sharing next to the same maths, which is where Dan's next course goes.

---

## 3. The scope: what research says about each part

### 3.1 AC from a turning coil: sine wave, period, frequency, peak and peak-to-peak (builds on Trigonometry: circle to wave)
- **A single coil turned at constant speed in a uniform field gives an emf that varies sinusoidally**
  - Source: 23.5 Electric Generators - College Physics 2e | OpenStax. https://openstax.org/books/college-physics-2e/pages/23-5-electric-generators
  - Quote: "A generator with a single rectangular coil rotated at constant angular velocity in a uniform magnetic field produces an emf that varies sinusoidally in time."
- **Peak emf rises with turns, area, field and rotation frequency (the dials a generator has)**
  - Source: The Alternating Current Generator. https://farside.ph.utexas.edu/teaching/316/lectures/node90.html
  - Quote: "Thus, the peak emf is directly proportional to the area of the coil, the number of turns in the coil, the rotation frequency of the coil, and the magnetic field-strength."
- **Faster rotation raises the voltage because flux changes faster**
  - Source: EMF from rotating coil. https://web.pa.msu.edu/courses/2000fall/phy232/lectures/induction/rotatingcoil.html
  - Quote: "The magnitude of the voltage increases with higher rotation frequency, since that leads to a higher rate of change in the flux."
- **Peak (crest) value and amplitude**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 1. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_1.html
  - Quote: "One way to express the intensity, or magnitude (also called the amplitude ), of an AC quantity is to measure its peak height on a waveform graph. This is known as the peak or crest value of an AC waveform"
- **Period T = 1/f, with a worked 200 Hz = 5 ms example (OpenLearn)**
  - Source: An introduction to electronics: 4.4 Signals and sine waves | OpenLearn - Open University. https://www.open.edu/openlearn/science-maths-technology/an-introduction-electronics/content-section-4.4
  - Quote: "T = 1/ f = 1/200 = 0.005 s. Similarly, f = 1/ T = 1/0.005 = 200 Hz."
- **Peak-to-peak is twice the peak** **SECONDARY**
  - Source: Alternating currents — WJEC A-Level Physics Revision. https://masterymind.co.uk/subjects/physics-a-level/wjec/a-level/alternating-currents
  - Quote: "Peak and peak-to-peak values: The peak voltage V₀ is the maximum amplitude; peak-to-peak is twice the peak."
- **Power-station coils turn sixty times a second at 60 Hz (North America); Europe and much of the world generates at 50 Hz**
  - Source: The Alternating Current Generator. https://farside.ph.utexas.edu/teaching/316/lectures/node90.html
  - Quote: "the alternating emf generated by power stations oscillates at $f=60$ Hz, which means that the generator coils in power stations rotate exactly sixty times a second. In Europe, and much of the rest of the world, the oscillation frequency of commercially generated electricity is $f=50$ Hz."
My reading: the circle-to-wave picture is already built in Trigonometry; the new idea is that the "angle" is a turning coil, so for a two-pole machine frequency is shaft turns per second. Real alternators have more poles and turn slower (my arithmetic, not a sourced figure: at 60 Hz a four-pole machine turns at 1800 rpm, 30 turns a second, because each turn gives two cycles). A ship at 60 Hz and a house at 50 Hz are the same principle (see 6).

### 3.2 Rms and average (why 230 V is rms; heating equivalence; peak = rms x sqrt 2 for a sine)
- **The DC-equivalent idea: the DC that gives the same heating in the same resistance**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 1. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_1.html
  - Quote: "This is the general idea used to assign a “DC equivalent” measurement to any AC voltage or current: whatever magnitude of DC voltage or current would produce the same amount of heat energy dissipation through an equal resistance"
- **10 V AC rms heats a resistor like 10 V DC**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 1. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_1.html
  - Quote: "For example, 10 volts AC RMS is the amount of voltage that would produce the same amount of heat dissipation across a resistor of given value as a 10 volt DC power supply."
- **How the rms is computed: square, average, root**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 1. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_1.html
  - Quote: "essentially, the procedure consists of squaring all the positive and negative points on a waveform graph, averaging those squared values, then taking the square root of that average to obtain the final answer)"
- **For a sine wave, rms is about 0.707 of peak**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 1. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_1.html
  - Quote: "For a sine wave, the RMS value is approximately 0.707 of its peak value."
- **Sine rms 0.707 is the reciprocal of the square root of 2; triangle waves are 0.577**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 1. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_1.html
  - Quote: "Sinusoidal waveforms have an RMS value of 0.707 (the reciprocal of the square root of 2)"
- **The true average of a sine wave is zero (so average cannot be the heating measure)**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 1. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_1.html
  - Quote: "The average value of a sinewave is zero."
- **Appliances and devices are quoted in rms values, not peak values**
  - Source: 15.2 Simple AC Circuits - University Physics Volume 2 | OpenStax. https://openstax.org/books/university-physics-volume-2/pages/15-2-simple-ac-circuits
  - Quote: "Appliances and devices are commonly quoted with rms values for their operations, rather than peak values."
- **UK mains is 230 V rms, so its peak is about 325 V (one school revision site)** **SECONDARY**
  - Source: Alternating currents — WJEC A-Level Physics Revision. https://masterymind.co.uk/subjects/physics-a-level/wjec/a-level/alternating-currents
  - Quote: "Misconception: Peak voltage is the same as mains voltage. Correction: UK mains voltage is 230 V RMS, so the peak voltage is about 325 V (230 × √2)."
My reading: Dan knows 230 V as a number. The new ideas are that it is an equivalent heating value, that the wave reaches about 325 V, and that a cable or insulation carries the peak while a heater feels the rms. "Peak = rms x sqrt 2" is a computed rule from the shown 0.707 (a control, not a cited constant to memorise).

### 3.3 Resistance in AC: in phase; instantaneous and average power
- **Current and voltage reach maxima and minima together in a resistor**
  - Source: 15.2 Simple AC Circuits - University Physics Volume 2 | OpenStax. https://openstax.org/books/university-physics-volume-2/pages/15-2-simple-ac-circuits
  - Quote: "Both curves reach their maxima and minima at the same times, that is, the current through and the voltage across the resistor are in phase."
- **Power in a resistor never goes negative**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 11. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_11.html
  - Quote: "Note that the waveform for power is always positive, never negative for this resistive circuit. This means that power is always being dissipated by the resistive load, and never returned to the source as it is with reactive loads."
- **The power waveform is at twice the frequency of voltage and current**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 11. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_11.html
  - Quote: "Also note that the waveform for power is not at the same frequency as the voltage or current! Rather, its frequency is double that of either the voltage or current waveforms."
- **Heating by an AC current at its maximum is not the same as the same DC value**
  - Source: Slide 1. https://condor.depaul.edu/~jmilton/152/ACCircuits.pdf
  - Quote: "The heating effect produced by an AC current with a maximum value of I max is not the same as that of a DC current of the same value."
### 3.4 Inductance: back-emf, X_L = 2 pi f L, current lags by 90 degrees
- **Inductors oppose changes in current; the induced voltage (Lenz) tries to hold current at its present value**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 3. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_3.html
  - Quote: "Whereas resistors simply oppose the flow of electrons through them (by dropping a voltage directly proportional to the current), inductors oppose changes in current through them, by dropping a voltage directly proportional to the rate of change of current. In accordance with Lenz's Law , this induced voltage is always of such a polarity as to try to maintain current at its present value."
- **The current is held back by the back-emf of the inductor**
  - Source: Slide 1. https://condor.depaul.edu/~jmilton/152/ACCircuits.pdf
  - Quote: "The current in the circuit is impeded by the back emf of the inductor."
- **In a pure inductor the voltage leads and the current lags (90 degrees)**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 3. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_3.html
  - Quote: "Looking at the graph, the voltage wave seems to have a “head start” on the current wave; the voltage “leads” the current, and the current “lags” behind the voltage."
- **Reactance of an inductor is directly proportional to frequency**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 3. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_3.html
  - Quote: "What this means is that reactance in ohms for any inductor is directly proportional to the frequency of the alternating current."
- **Inductive reactance X_L = 2 pi f L and it increases with frequency**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 3. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_3.html
  - Quote: "Inductive reactance can be calculated using this formula: X L = 2πfL * The angular velocity of an AC circuit is another way of expressing its frequency, in units of electrical radians per second instead of cycles per second. It is symbolized by the lower-case Greek letter “omega,” or ω. * Inductive reactance increases with increasing frequency. In other words, the higher the frequency, the more it opposes the AC flow of electrons."
- **Worked numbers: a 10 mH inductor at 60, 120 and 2500 Hz**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 3. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_3.html
  - Quote: "Reactance of a 10 mH inductor: | Frequency (Hertz) | Reactance (Ohms) | | 60 | 3.7699 | | 120 | 7.5398 | | 2500 | 157.0796 |"
- **2 pi f is radians per second: one cycle as one turn of a circle**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 3. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_3.html
  - Quote: "It is the number of radians per second that the alternating current is “rotating” at, if you imagine one cycle of AC to represent a full circle's rotation."
- **Sign convention: phase is positive for inductive circuits (the angle by which voltage leads current)**
  - Source: Phase Relationships in AC Circuits - HyperPhysics. http://www.hyperphysics.phy-astr.gsu.edu/hbase/electric/phase.html
  - Quote: "It is customary to use the angle by which the voltage leads the current. This leads to a positive phase for inductive circuits since current lags the voltage"
### 3.5 Capacitance: charging current, X_C = 1 / (2 pi f C), current leads by 90 degrees
- **A capacitor draws or supplies current as it charges or discharges to a new voltage**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 4. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_4.html
  - Quote: "capacitors oppose changes in voltage by drawing or supplying current as they charge or discharge to the new voltage level."
- **Current is zero at the voltage peak and greatest where the voltage crosses zero**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 4. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_4.html
  - Quote: "Therefore, the instantaneous current is zero whenever the instantaneous voltage is at a peak (zero change, or level slope, on the voltage sine wave), and the instantaneous current is at a peak wherever the instantaneous voltage is at maximum change (the points of steepest slope on the voltage wave, where it crosses the zero line)."
- **In a capacitor the current leads (a "head start") and the voltage lags**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 4. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_4.html
  - Quote: "Looking at the graph, the current wave seems to have a “head start” on the voltage wave; the current “leads” the voltage, and the voltage “lags” behind the current."
- **X_C = 1/(2 pi f C) and falls with frequency**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 4. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_4.html
  - Quote: "Capacitive reactance can be calculated using this formula: X C = 1/(2πfC) * Capacitive reactance decreases with increasing frequency. In other words, the higher the frequency, the less it opposes (the more it “conducts”) the AC flow of electrons."
- **Capacitive reactance falls and inductive reactance rises with frequency: exact opposites**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 4. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_4.html
  - Quote: "Please note that the relationship of capacitive reactance to frequency is exactly opposite from that of inductive reactance. Capacitive reactance (in ohms) decreases with increasing AC frequency. Conversely, inductive reactance (in ohms) increases with increasing AC frequency. Inductors oppose faster changing currents by producing greater voltage drops; capacitors oppose faster changing voltage drops by allowing greater currents."
- **Worked numbers: a 100 uF capacitor at 60, 120 and 2500 Hz**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 4. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_4.html
  - Quote: "Reactance of a 100 uF capacitor: | Frequency (Hertz) | Reactance (Ohms) | | 60 | 26.5258 | | 120 | 13.2629 | | 2500 | 0.6366 |"
- **At zero frequency (DC) the capacitor current is zero once charged; at very high frequency it acts like a wire**
  - Source: 15.2 Simple AC Circuits - University Physics Volume 2 | OpenStax. https://openstax.org/books/university-physics-volume-2/pages/15-2-simple-ac-circuits
  - Quote: "The rms current appears because the voltage is continually reversing, charging, and discharging the capacitor. If the frequency goes to zero, which would be a dc voltage, tends to infinity, and the current is zero once the capacitor is charged. At very high frequencies, the capacitor’s reactance tends to zero—it has a negligible reactance and does not impede the current (it acts like a simple wire)."
- **A memory hook: charge does not build up until current has flowed for a while**
  - Source: AC circuits, alternating current electricity. https://www.animations.physics.unsw.edu.au/jw/AC.html
  - Quote: "It is easy to remember that the voltage on the capacitor is behind the current, because the charge doesn't build up until after the current has been flowing for a while."
- **The mnemonic "ELI the ICE man"**
  - Source: 15.3 RLC Series Circuits with AC - University Physics Volume 2 | OpenStax. https://openstax.org/books/university-physics-volume-2/pages/15-3-rlc-series-circuits-with-ac
  - Quote: "A mnemonic device of “ELI the ICE man” is sometimes used to remember that the emf (E) leads the current (I) in an inductor (L) and the current (I) leads the emf (E) in a capacitor (C)."
### 3.6 Series RL and RC: Z = R + jX, impedance triangle, phase angle (builds on Complex numbers)
- **R is a real number, X an imaginary number, and Z their complex sum**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 3. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_3.html
  - Quote: "Because the resistor's resistance is a real number (5 Ω ∠ 0 o , or 5 + j0 Ω), and the inductor's reactance is an imaginary number (3.7699 Ω ∠ 90 o , or 0 + j3.7699 Ω), the combined effect of the two components will be an opposition to current equal to the complex sum of the two numbers."
- **In series RL the current lags by less than 90 degrees (37 degrees in the example)**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 3. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_3.html
  - Quote: "As with the purely inductive circuit, the current wave lags behind the voltage wave (of the source), although this time the lag is not as great: only 37.016 o as opposed to a full 90 o"
- **The voltage phasor diagram becomes an impedance diagram (R, X, Z in proportion to the voltages)**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 3. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_3.html
  - Quote: "Impedance (Z) of a series R-L circuit may be calculated, given the resistance (R) and the inductive reactance (X L ). Since E=IR, E=IX L , and E=IZ, resistance, reactance, and impedance are proportional to voltage, respectively. Thus, the voltage phasor diagram can be replaced by a similar impedance diagram."
- **Worked RC series: Z = 40 - j30 = 50 at -36.87 degrees**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 4. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_4.html
  - Quote: "X C = 1/(2π·60·88.42×10 -6 ) X C = 30 Ω Z = R - jX C Z = 40 - j30 |Z| = sqrt(40 ² +  (-30) ² ) = 50 Ω ∠Z = arctangent(-30/40) = -36.87 o Z = 40 - j30 = 50∠-36.87 o"
- **Mixed R and C: the phase angle lies between 0 and -90 degrees**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 4. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_4.html
  - Quote: "When resistors and capacitors are mixed together in circuits, the total impedance will have a phase angle somewhere between 0 o and -90 o"
- **R and C impedance angles are always 0 and -90, whatever the source angle**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 4. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_4.html
  - Quote: "The phase angles of resistive and capacitive impedance are always 0 o and -90 o , respectively, regardless of the given phase angles for voltage or current)"
- **Phasors of R and X are 90 degrees apart, so Z comes from Pythagoras (UNSW Physclips)**
  - Source: AC circuits, alternating current electricity. https://www.animations.physics.unsw.edu.au/jw/AC.html
  - Quote: "Because the phasors for reactances are 90° out of phase with the current, the series impedance of a resistor R and a reactance X are given by Pythagoras' law:"
- **Impedance is the comprehensive expression of all opposition to current, resistance and reactance together**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 5. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_5.html
  - Quote: "Impedance is a comprehensive expression of any and all forms of opposition to electron flow, including both resistance and reactance."
- **Voltages 90 degrees apart do not add arithmetically: 6 V and 8 V give 10 V at 53.13 degrees**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 2. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_2.html
  - Quote: "a 6 volt source at 0 o added to an 8 volt source at 90 o results in 10 volts at a phase angle of 53.13 o"
- **Impedances in AC behave like resistances in DC: they add in series and diminish in parallel**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 5. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_5.html
  - Quote: "Impedances in AC behave analogously to resistances in DC circuits: they add in series, and they diminish in parallel."
My reading: the impedance triangle is Pythagoras plus the tangent already built (Trigonometry) and Z = R + jX in rectangular and polar form (Complex numbers). The new work is the physical reading: R is a real axis because it dissipates, X an imaginary axis because it stores and returns. Voltage drops do not add arithmetically in series (a common wrong move; see 5).

### 3.7 Series RLC and resonance (f0 = 1 / (2 pi sqrt LC); current peak; voltages across L and C can exceed the supply)
- **At resonance the reactances are equal and the series impedance drops to its minimum (zero for ideal L and C)**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 6. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_6.html
  - Quote: "When a state of resonance is reached (capacitive and inductive reactances equal), the two impedances cancel each other out and the total impedance drops to zero!"
- **Resonance when X_L = X_C; the maximum current is where impedance is minimum**
  - Source: Slide 1. https://condor.depaul.edu/~jmilton/152/ACCircuits.pdf
  - Quote: "Resonance occurs at the frequency, ƒ o, where the current has its maximum value. # To achieve maximum current, the impedance must have a minimum value. This occurs when XL = XC"
- **At resonance the series RLC circuit is purely resistive, emf and current in phase**
  - Source: 15.5 Resonance in an AC Circuit - University Physics Volume 2 | OpenStax. https://openstax.org/books/university-physics-volume-2/pages/15-5-resonance-in-an-ac-circuit
  - Quote: "Therefore, at resonance, an RLC circuit is purely resistive, with the applied emf and current in phase."
- **The resonant frequency of a series RLC circuit is unaffected by the series resistance (the page adds that only the sharpness of the curve changes)**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 6. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_6.html
  - Quote: "So long as all components are connected in series with each other, the resonant frequency of the circuit will be unaffected by the resistance."
- **Series resonance can put dangerous voltages across L and C**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 6. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_6.html
  - Quote: "A word of caution is in order with series LC resonant circuits: because of the high currents which may be present in a series LC circuit at resonance, it is possible to produce dangerously high voltage drops across the capacitor and the inductor, as each component possesses significant impedance."
- **Worked example: 1 V in gives 100 V across each of L and C, which cancel; the ratio is Q**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 6. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_6.html
  - Quote: "The expected values for capacitor and inductor voltage are 100 V. This voltage will stress these components to that level and they must be rated accordingly. However, these voltages are out of phase and cancel yielding a total voltage across all three components of only 1 V, the applied voltage. The ratio of the capacitor (or inductor) voltage to the applied voltage is the “Q” factor."
- **Series resonant voltage across L or C is Q times the applied voltage**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 6. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_6.html
  - Quote: "A practical application of “Q” is that voltage across L or C in a series resonant circuit is Q times total applied voltage."
- **Below resonance the series circuit looks capacitive, above it inductive**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 6. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_6.html
  - Quote: "Below the resonant frequency, the series resonant circuit looks capacitive since the impedance of the capacitor increases to a value greater than the decreasing inducitve reactance, leaving a net capacitive value. Above resonance, the inductive reactance increases, capacitive reactance decreases, leaving a net inductive component."
**UNCONFIRMED as exact text:** the formula f0 = 1/(2 pi sqrt LC) itself. The Kuphaldt page shows it as an image, so the saved text does not contain it; the DePaul slide text and MIT PDF give only garbled forms. The formula follows from setting 2 pi f L = 1/(2 pi f C), which the Kuphaldt text describes in words and with the worked 10 uF and 100 mH example (159.155 Hz). The course should compute f0 from that shown rule, not ask Dan to take a formula on trust.

### 3.8 Power in AC: real (W), reactive (var), apparent (VA), the power triangle, power factor; why kVA matters
- **Reactive power is "phantom power" in volt-amps-reactive (VAR), symbol Q**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 11. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_11.html
  - Quote: "This “phantom power” is called reactive power , and it is measured in a unit called Volt-Amps-Reactive (VAR), rather than watts. The mathematical symbol for reactive power is (unfortunately) the capital letter Q."
- **True power in watts (P) and apparent power in volt-amps (S): the product of voltage and current without reference to phase angle**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 11. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_11.html
  - Quote: "The actual amount of power being used, or dissipated, in a circuit is called true power , and it is measured in watts (symbolized by the capital letter P, as always). The combination of reactive power and true power is called apparent power , and it is the product of a circuit's voltage and current, without reference to phase angle. Apparent power is measured in the unit of Volt-Amps (VA) and is symbolized by the capital letter S."
- **The three powers form a right triangle (P adjacent, Q opposite, S hypotenuse)**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 11. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_11.html
  - Quote: "In a right triangle, P = adjacent length, Q = opposite length, and S = hypotenuse length."
- **Power factor is true power divided by apparent power, equal to the cosine of the impedance angle**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 11. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_11.html
  - Quote: "When expressed as a fraction, this ratio between true power and apparent power is called the power factor for this circuit."
- **The ratio is also the cosine of the phase angle**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 11. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_11.html
  - Quote: "Because true power and apparent power form the adjacent and hypotenuse sides of a right triangle, respectively, the power factor ratio is also equal to the cosine of that phase angle."
- **Power factor below 1 means the wiring must carry more current for the same true power**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 11. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_11.html
  - Quote: "Power factor can be an important aspect to consider in an AC circuit, because any power factor less than 1 means that the circuit's wiring has to carry more current than what would be necessary with zero reactance in the circuit to deliver the same amount of (true) power to the resistive load."
- **Lagging = inductive, leading = capacitive**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 11. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_11.html
  - Quote: "If a circuit is predominantly inductive, we say that its power factor is lagging (because the current wave for the circuit lags behind the applied voltage wave). Conversely, if a circuit is predominantly capacitive, we say that its power factor is leading"
- **"Apparent" is what a voltmeter times an ammeter would show, ignoring phase** **SECONDARY**
  - Source: 11.5: Summary. https://eng.libretexts.org/@api/deki/pages/98521/pdf/11.5%253A%2bSummary.pdf
  - Quote: "It is called apparent power because that is what the power appears to be if it is naively measured with a voltmeter and an ammeter, ignoring the phase difference between them."
- **The source and the distribution system must be sized for reactive power though it does no work** **SECONDARY**
  - Source: CHAPTER 2. https://pages.mtu.edu/~avsergue/EET2233/Lectures/CHAPTER2.pdf
  - Quote: "Although reactive power does no useful work, the source must have sufficient capacity to provide the reactive power, and the distribution system must be large enough to distribute reactive power."
- **Alternators are rated in kVA at a specified frequency and power factor, not in kW alone** **SECONDARY**
  - Source: maritime electrical installations - notes on design .... http://www.iqytechnicalcollege.com/JEE129-MarineElectricalSystems.pdf
  - Quote: "lagging power factor loads tend to demagnetize the field and terminal voltage is maintained only by increasing the d.c. field current. Therefore, a.c. generators are rated in terms of load current and voltage output, or kilovolt-ampere (kVA) output, at a specified frequency and power factor."
- **Worked: a 100 kVA alternator at 0.8 delivers 80 kW** **SECONDARY**
  - Source: maritime electrical installations - notes on design .... http://www.iqytechnicalcollege.com/JEE129-MarineElectricalSystems.pdf
  - Quote: "The specified power factor is often 80 percent lagging. For example, a single phase a.c. generator designed to deliver 100 amperes at 1,000 volts is rated at 100 kVA. This machine would supply a 100 kW load at unity power factor or a 80 kW load at 80 percent power factor."
- **A real 60 Hz set's data sheet: 630 kVA, 504 kW at power factor 0.8 (630 x 0.8 = 504; a manufacturer sheet for 440 V 60 Hz sets)**
  - Source: AD630-6 DIESEL GENERATING SET 480/277V,440/254V,380/220V- 60 Hz. https://bnhgenerators.com/wp-content/uploads/2026/04/AD630-6.pdf
  - Quote: "MODEL AD630-6 Power Pf. 0.8 Standby kVA 630 kW 504"
### 3.9 Power factor correction: capacitors across an inductive load; sizing the kvar; reduced current
- **Add a capacitor in parallel to draw equal and opposite reactive power**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 11. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_11.html
  - Quote: "Poor power factor can be corrected, paradoxically, by adding another load to the circuit drawing an equal and opposite amount of reactive power, to cancel out the effects of the load's inductive reactance. Inductive reactance can only be canceled by capacitive reactance, so we have to add a capacitor in parallel to our example circuit as the additional load."
- **Result in the first example: line current falls from 1.41 A to 0.9947 A, load power unchanged**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 11. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_11.html
  - Quote: "The main current has been decreased from 1.41 amps to 994.7 milliamps, while the power dissipated at the load resistor remains unchanged at 119.365 watts."
- **Sizing from the load's reactive power in kVAR**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 11. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_11.html
  - Quote: "Now that we know the amount of reactive power (1.754 kVAR), we can calculate the size of capacitor needed to counteract its effects:"
- **Correction does not change true power but cuts apparent power and the current drawn**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 11. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_11.html
  - Quote: "This correction, of course, will not change the amount of true power consumed by the load, but it will result in a substantial reduction of apparent power, and of the total current drawn from the 240 Volt source"
- **Result in the practical example: 9.615 A falls to 6.25 A with less heat in the wiring**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 11. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_11.html
  - Quote: "This gives a corrected power factor of (1.5kW / 1.5009 kVA), or 0.99994, and a new total current of (1.50009 kVA / 240 Volts), or 6.25 amps, a substantial improvement over the uncorrected value of 9.615 amps! This lower total current will translate to less heat losses in the circuit wiring, meaning greater system efficiency (less power wasted)."
- **Too much capacitance lowers the power factor as surely as too much inductance (do not over-correct)**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 11. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_11.html
  - Quote: "It should be noted that too much capacitance in an AC circuit will result in a low power factor just as well as too much inductance. You must be careful not to over-correct when adding capacitance to an AC circuit."
- **Apply the correction close to the offending load; the loop between capacitor and motor still circulates current**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 11. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_11.html
  - Quote: "Note that reduction of line losses applies to the lines from the generator to the point where the power factor correction capacitor is applied. In other words, there is still circulating current between the capacitor and the inductive load. This is not normally a problem because the power factor correction is applied close to the offending load, like an induction motor."
- **Rule: connect the capacitor in parallel and keep the real power constant**
  - Source: Microsoft Word - Summary of Single-phase and Three-phase Power.doc. https://www.rose-hulman.edu/class/ee/HTML/ECE370/PDFs/Summary%20of%20Single-phase%20and%20Three-phase%20Power.pdf
  - Quote: "when correcting pf, connect a capacitor in parallel with the load and keep the real power constant."
- **Large inductive loads such as motors use added capacitors for correction**
  - Source: Teacher Guide. https://matrixtsl.com/wp-content/uploads/2025/05/CP0295T-Electrical-installation-circuit-principles-level-3-Teacher-Guide.pdf
  - Quote: "Inductive loads, such as high power electric motors, use added capacitors for power factor correction."
My reading: the sizing path is the shown rule from the power triangle (Q before minus Q after = Q_C, then X_C = V squared / Q_C, then C from X_C), not a memorised formula. A numerical check on the Kuphaldt practical example: 1.5 kW / 2.308 kVA = 0.65, and the square root of (2.308 squared minus 1.5 squared) is 1.754 kvar, which matches the page. Dan will know the "capacitor in parallel" answer; the new work is the amount and what happens to the current.

### 3.10 Three-phase: 120 degrees apart; star and delta; sqrt 3; P = sqrt 3 V_L I_L cos phi; the neutral carries nothing when balanced
- **Line and phase voltage defined (and line and phase current follow the same logic)**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 10. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_10.html
  - Quote: "Line voltage refers to the amount of voltage measured between any two line conductors in a balanced three-phase system. With the above circuit, the line voltage is roughly 208 volts. Phase voltage refers to the voltage measured across any one component (source winding or load impedance) in a balanced three-phase source or load."
- **Balanced star: V_L = sqrt 3 x V_ph, I_L = I_ph. Balanced delta: V_L = V_ph, I_L = sqrt 3 x I_ph**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 10. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_10.html
  - Quote: "In balanced “Y” circuits, line voltage is equal to phase voltage times the square root of 3, while line current is equal to phase current. * In balanced Δ circuits, line voltage is equal to phase voltage, while line current is equal to phase current times the square root of 3."
- **Worked: 120 V per phase gives about 208 V between lines, 83.33 A and 10 kW per load**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 10. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_10.html
  - Quote: "Sure enough, we get 120 volts across each load resistor, with (approximately) 208 volts between any two “hot” conductors and conductor currents equal to 83.33 amps. (Figure below ) At that current and voltage, each load will be dissipating 10 kW of power."
- **Delta sources are more reliable if a winding fails; star gives the same power with less line current**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 10. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_10.html
  - Quote: "Δ-connected three-phase voltage sources give greater reliability in the event of winding failure than Y-connected sources. However, Y-connected sources can deliver the same amount of power with less line current than Δ-connected sources."
- **Power in three-phase loads: derive sqrt 3 V_L I_L cos phi from 3 V_ph I_ph cos phi (SQA unit support notes)**
  - Source: national unit specification: general information. https://www.sqa.org.uk/files/hn/DDN4734.pdf
  - Quote: "Derivation of √3VLILcosφ from 3VPHIPHcosφ Calculation of total active, reactive and apparent power, and overall power factor in balanced and unbalanced three phase loads"
- **SQA suggests deriving the star and delta voltage and current relationships with phasors**
  - Source: national unit specification: general information. https://www.sqa.org.uk/files/hn/DDN4734.pdf
  - Quote: "Derivation of voltage and current relationships (magnitude and phase) associated with balanced three phase star and delta loads. Graphical methods using phasors could be used"
- **In a balanced star load the neutral current is zero, because three equal currents 120 degrees apart cancel**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 10. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_10.html
  - Quote: "In a balanced 3-phase Y load, we would expect the neutral current to be zero. Each phase current -- which by itself would go through the neutral wire back to the supplying phase on the source Y -- should cancel each other in regard to the neutral conductor because they're all the same magnitude and all shifted 120 o apart. In a system with no harmonic currents, this is what happens, leaving zero current through the neutral conductor."
- **Caution: triplen harmonic currents add in the neutral, so "balanced = no neutral current" holds for sinusoidal currents only**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 10. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_10.html
  - Quote: "In a 4-wire Y-Y system, triplen harmonic currents add within the neutral conductor."
- **Even in single-phase split supplies, balanced loads leave the neutral at zero**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 10. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_10.html
  - Quote: "The astute observer will note that the neutral wire only has to carry the difference of current between the two loads back to the source. In the above case, with perfectly “balanced” loads consuming equal amounts of power, the neutral wire carries zero current."
My reading: Dan meets 400 V / 230 V as "line / phase" in installation work; the new ideas are why the factor is sqrt 3 (the phasor sum of two phase voltages 120 degrees apart, from Trigonometry and Complex numbers), why star and delta give different line and phase currents, why a balanced load makes the neutral redundant, and that the three-phase power formula uses line quantities. The harmonic caveat ("triplen" currents) belongs to the later three-phase and machines courses, but one line saying the neutral is balanced only for sine-wave loads is honest.

---

## 4. Prerequisites

- **Resistance, reactance and impedance are similar quantities, all in ohms, all limiting current (Matrix electrical installation Level 3 guide)** **SECONDARY**
  - Source: Teacher Guide. https://matrixtsl.com/wp-content/uploads/2025/05/CP0295T-Electrical-installation-circuit-principles-level-3-Teacher-Guide.pdf
  - Quote: "The student should know that resistance, reactance and impedance are similar quantities. They control current."
- **AC quantities need amplitude and phase; scalars are not enough**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 2. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_2.html
  - Quote: "AC quantities in a single-frequency circuit have both amplitude (analogy: distance) and phase shift (analogy: direction)."
- **Resistance becomes impedance, no longer a one-dimensional quantity**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 2. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_2.html
  - Quote: "However, when we begin to analyze alternating current circuits, we find that quantities of voltage, current, and even resistance (called impedance in AC) are not the familiar one-dimensional quantities we're used to measuring in DC circuits."
- **Phasors: valuable to those who understand them (the second half of the sentence, that they confuse those who do not, was cut off in the tool view)** **SECONDARY**
  - Source: 3.1: Introduction to Phasors - Engineering LibreTexts. https://eng.libretexts.org/Bookshelves/Electrical_Engineering/Introductory_Electrical_Engineering/A_First_Course_in_Electrical_and_Computer_Engineering_(Scharf)/03%3A_Phasors/3.01%3A_Introduction_to_Phasors
  - Quote: "Phasors! For those who understand them, they are of incomparable value for the study of elementary and advanced"
- **SQA Three Phase Systems expects single-phase AC with network theorems and complex numbers first**
  - Source: national unit specification: general information. https://www.sqa.org.uk/files/hn/DDN4734.pdf
  - Quote: "Candidates should possess a broad knowledge and understanding of single phase ac circuit theory. They should be able to solve single phase problems using network theorems and complex numbers."
- **The only real difference between DC and AC circuit calculations is power**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 5. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_5.html
  - Quote: "The only real difference between DC and AC circuit calculations is in regard to power"
What AC leans on, and who has it:

| Needed | Dan has it from | Taught inline? |
|---|---|---|
| Ohm's law, DC power, series and parallel | Electrician quals (EAL L3, BS 7671 work) | No |
| Mains as 230 V 50 Hz; three-phase 400/230 V as a trade fact | Electrician quals | No (but "why" is new) |
| Power factor as a word; capacitor across an inductive load as an answer | C&G / EAL L3 (see 2.2) | Only the quantitative why |
| Sine, cosine, tan; angle as turning; radians; circle to wave | Trigonometry (built) | No, link to it |
| Adding waves with phasors; power factor as a cosine | Trigonometry (built) | No, reuse |
| j, Argand diagram, polar/rectangular, multiply/divide, impedance as a complex number | Complex numbers (built) | No, reuse |
| Powers and roots (sqrt 2, sqrt 3), Pythagoras | Powers and roots, Trigonometry (built) | No |
| Exponentials and logarithms (for decibels and Q, if used) | Exponentials and logarithms (built) | Only if the brief uses them; avoid |
| Calculus (the rate of change behind back-emf, "current follows the slope") | Calculus fundamentals (built) | Use as a picture; no derivative arithmetic needed |
| Inductance, capacitance, electromagnetic induction as physical ideas | Electrician quals give the words (C&G 302 lists them) | Yes, inline: back-emf as "opposes change", capacitor as charge reservoir |
| Why a rotating coil gives a sine | Not shown in his quals; Trigonometry gives the sine | Yes, one lesson part |

My reading: the thing to teach inline is not any maths; it is inductance and capacitance as "opposition to change", because that is what makes reactance different from resistance and is the root of lead and lag. His electrician qualifications cover the words; research shows (5) that the words alone do not give the phase picture.

---

## 5. Misconceptions and learning science for each skill

Honest note up front: the AC-specific physics education research I could reach is thin. It is one Indonesian classroom study, one literature review that names AC circuits as two of its misconceptions, and examiner reports. Most circuit misconception research (Engelhardt and Beichner, McDermott and Shaffer) is DC and I label it as such. I found nothing reachable on star and delta or on power factor misconceptions as research: a ShanghaiTech slide titled "Reactive power: conceptions" appeared in a search, but its text did not come through, so it is **UNCONFIRMED**.

### 5.1 Rms against peak
- **Examiner report (NZ Level 3 Physics 2025): candidates put the whole 2 V rms under the square root when finding peak voltage**
  - Source: NCEA Level 3 Physics 2025. https://www.nzqa.govt.nz/nqfdocs/ncea-resource/reports/2025/91524-report-2025.pdf
  - Quote: "Many candidates made the error of putting the entire 2 V RMS under the square root sign when calculating the peak voltage."
- **Revision site: the common error is multiplying by sqrt 2 when dividing is needed** **SECONDARY**
  - Source: Alternating currents — WJEC A-Level Physics Revision. https://masterymind.co.uk/subjects/physics-a-level/wjec/a-level/alternating-currents
  - Quote: "A common error is to multiply by √2 instead of dividing."
- **Revision site: "the RMS is the average" is a misconception; the average over a cycle is zero** **SECONDARY**
  - Source: Alternating currents — WJEC A-Level Physics Revision. https://masterymind.co.uk/subjects/physics-a-level/wjec/a-level/alternating-currents
  - Quote: "Misconception: The RMS voltage is the average voltage over a cycle. Correction: The average voltage over a complete cycle is zero; RMS is the square root of the mean of the squared voltage, representing the heating effect."
- **Revision site: confusing peak with rms in power calculations** **SECONDARY**
  - Source: Alternating currents — WJEC A-Level Physics Revision. https://masterymind.co.uk/subjects/physics-a-level/wjec/a-level/alternating-currents
  - Quote: "Confusing peak values with rms values in power calculations"
- **Meter caveat: analogue meters read average, are calibrated for rms, and are accurate only on pure sine waves**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 1. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_1.html
  - Quote: "Because the mechanical inertia and dampening effects of an electromechanical meter movement makes the deflection of the needle naturally proportional to the average value of the AC, not the true RMS value, analog meters must be specifically calibrated (or mis-calibrated, depending on how you look at it) to indicate voltage or current in RMS units. The accuracy of this calibration depends on an assumed waveshape, usually a sine wave."
My reading, rms against peak: the failure is working the conversion the wrong way round. A control that shows both numbers at once, with the wave, and a prediction ("is 230 V the top of the wave?") fits. Dan's instruments (multimeter, insulation tester) show rms; the meter caveat is where his trade meets it.

### 5.2 Reactance against resistance; the substitution mistake
- **OCR Level 3 Cambridge Technical examiners' report: candidates substituted C into the equation rather than X_C**
  - Source: 670694 Examiners Report Principles Of Electrical And Electronic Engineering. https://www.ocr.org.uk/Images/670694-examiners-report-principles-of-electrical-and-electronic-engineering.pdf
  - Quote: "most common error being using the RL or RC formula instead of RLC) a significant number of candidates substituted the value for C into the equation rather than X C"
- **Matrix (electrical installation Level 3 teacher guide): the challenge is that students know the difference between resistance, inductive reactance, capacitive reactance and impedance** **SECONDARY**
  - Source: Teacher Guide. https://matrixtsl.com/wp-content/uploads/2025/05/CP0295T-Electrical-installation-circuit-principles-level-3-Teacher-Guide.pdf
  - Quote: "One of the challenges of this subject is to ensure that students know the difference between resistance, inductive reactance, capacitive reactance and impedance."
- **Matrix teacher guide: develop the bucket analogy for how a capacitor impedes current** **SECONDARY**
  - Source: Teacher Guide. https://matrixtsl.com/wp-content/uploads/2025/05/CP0295T-Electrical-installation-circuit-principles-level-3-Teacher-Guide.pdf
  - Quote: "The analogy with a bucket should be developed."
- **Matrix teacher guide: capacitance and inductance should be seen as mirror images of each other** **SECONDARY**
  - Source: Teacher Guide. https://matrixtsl.com/wp-content/uploads/2025/05/CP0295T-Electrical-installation-circuit-principles-level-3-Teacher-Guide.pdf
  - Quote: "They should be seen as mirror-images of each other, in that , in a capacitor, the current leads the applied voltage"
- **Reactance is an opposition that depends on frequency: inductive and capacitive reactance are exact opposites**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 4. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_4.html
  - Quote: "Please note that the relationship of capacitive reactance to frequency is exactly opposite from that of inductive reactance. Capacitive reactance (in ohms) decreases with increasing AC frequency. Conversely, inductive reactance (in ohms) increases with increasing AC frequency. Inductors oppose faster changing currents by producing greater voltage drops; capacitors oppose faster changing voltage drops by allowing greater currents."
### 5.3 Lead and lag
- **Indonesian secondary-school study: 192 students, 13 conceptual items on AC circuits (the finding is in the next quote)**
  - Source: .. http://files.eric.ed.gov/fulltext/EJ1247834.pdf
  - Quote: "Four experiments were conducted, and 13 conceptual understanding questions were used to explore the concept of the AC circuit among 192 secondary school students in Indonesia."
- **The commonest alternative concept in that study, and the authors' reading of it**
  - Source: .. http://files.eric.ed.gov/fulltext/EJ1247834.pdf
  - Quote: "The most frequent answer that came as an alternative concept (i.e., misconception) was “Because the picture shows that voltage precedes current with phase difference π.” Hence, these students misinterpreted the graph in the question"
- **Systematic literature review of circuit misconceptions: AC circuits misconceptions are "identifying what is alternating" and "interpreting characteristic phase behavior"**
  - Source: A Systematic Literature Review of Misconceptions in Linear Circuit Analysis. https://peer.asee.org/a-systematic-literature-review-of-misconceptions-in-linear-circuit-analysis.pdf
  - Quote: "Identifying what is alternating ​ [9][17] * Interpreting characteristic phase behavior"
- **The same review: Biswas interviewed 18 students about AC circuits; "interpreting characteristic phase behavior" is named**
  - Source: A Systematic Literature Review of Misconceptions in Linear Circuit Analysis. https://peer.asee.org/a-systematic-literature-review-of-misconceptions-in-linear-circuit-analysis.pdf
  - Quote: "Biswas identified specific misconceptions students had about AC circuits through a series of interviews with a total of 18 students"
- **Revision site: wrongly identifying lag against lead for inductors and capacitors** **SECONDARY**
  - Source: Alternating currents — WJEC A-Level Physics Revision. https://masterymind.co.uk/subjects/physics-a-level/wjec/a-level/alternating-currents
  - Quote: "Incorrectly identifying the phase relationship (lag vs lead) for inductors and capacitors"
- **The sign convention itself flips: phase is taken as the angle by which voltage leads current**
  - Source: Phase Relationships in AC Circuits - HyperPhysics. http://www.hyperphysics.phy-astr.gsu.edu/hbase/electric/phase.html
  - Quote: "It is customary to use the angle by which the voltage leads the current. This leads to a positive phase for inductive circuits since current lags the voltage"
- **In a capacitor the current is the reaction to the change in voltage, so it peaks at the zero crossing**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 4. https://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_4.html
  - Quote: "Therefore, the instantaneous current is zero whenever the instantaneous voltage is at a peak (zero change, or level slope, on the voltage sine wave), and the instantaneous current is at a peak wherever the instantaneous voltage is at maximum change (the points of steepest slope on the voltage wave, where it crosses the zero line)."
My reading, lead and lag: "voltage precedes current" is read straight off the graph and is true for the inductor; it is wrong when the student applies it to the capacitor, or confuses "which wave is ahead" with "which wave is the cause". The cause-first explanation (inductor: voltage has to appear first to build the current; capacitor: current has to flow first to build the voltage) and a play control that animates the two waves with the coil and the capacitor next to them is the research-backed route (5.7). A mnemonic (ELI the ICE man) is given by OpenStax and HyperPhysics but should be earned, not first.

### 5.4 Reactive power and power factor
- **"Phantom power" is the textbook name for reactive power: a draw of current with no dissipation**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 11. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_11.html
  - Quote: "We know that reactive loads such as inductors and capacitors dissipate zero power, yet the fact that they drop voltage and draw current gives the deceptive impression that they actually do dissipate power."
- **Both over- and under-correcting give a poor power factor**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 11. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_11.html
  - Quote: "It should be noted that too much capacitance in an AC circuit will result in a low power factor just as well as too much inductance. You must be careful not to over-correct when adding capacitance to an AC circuit."
- **Power-triangle quantities are scalars: magnitudes only, not the real or imaginary parts of current**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 11. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_11.html
  - Quote: "Since we're dealing with scalar quantities for power calculation, any complex starting quantities such as voltage, current, and impedance must be represented by their polar magnitudes , not by real or imaginary rectangular components. For instance, if I'm calculating true power from current and resistance, I must use the polar magnitude for current, and not merely the “real” or “imaginary” portion of the current."
- **The correction does not change true power, only apparent power and current**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 11. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_11.html
  - Quote: "This correction, of course, will not change the amount of true power consumed by the load, but it will result in a substantial reduction of apparent power, and of the total current drawn from the 240 Volt source"
My reading, power factor: the student errors are (a) treating the power factor as an efficiency (it is a ratio of watts to volt-amps, not a loss), (b) adding VA like watts, (c) series capacitors for correction (the C&G sample question tests exactly this), (d) correcting above 1 and landing leading. I did not find a source that studies (a) to (d); they are my reading from the textbook cautions above, not from research.

### 5.5 Star and delta
- **Textbook warning: in three-phase, say where you are measuring (line or phase)**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 10. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_10.html
  - Quote: "When we measure voltage and current in three-phase systems, we need to be specific as to where we're measuring."
- **Star: line voltage greater than phase voltage, line current equal to phase current. Delta: the reverse**
  - Source: Lessons In Electric Circuits -- Volume II (AC) - Chapter 10. http://www.ibiblio.org/kuphaldt/electricCircuits/AC/AC_10.html
  - Quote: "In balanced “Y” circuits, line voltage is equal to phase voltage times the square root of 3, while line current is equal to phase current. * In balanced Δ circuits, line voltage is equal to phase voltage, while line current is equal to phase current times the square root of 3."
- **US Navy practice problems ask for phase voltage in a wye and in a delta generator of 450 V line (line-versus-phase is a standard test item)**
  - Source: A balanced three phase 60Hz system is driven by a generator with a line voltage of 450V. https://www.navsea.navy.mil/Portals/103/Documents/NNPTC/Electrical%20Eng/ee_quest.pdf
  - Quote: "a. If the generator is wye-connected, what is the voltage across each of its phases? b. If the generator is delta-connected, what is the voltage across each of its phases?"
My reading, star and delta: the clean way to avoid mixing them is to attach the factor to a picture (what two phasors, 120 degrees apart, give when subtracted). I found no research source on this misconception; I rely on the textbook warning. **UNCONFIRMED** as a researched misconception.

### 5.6 The DC base underneath
- **DC circuits research: the most documented difficulty is the concept of current (2024 review)**
  - Source: Student conceptual resources for understanding electric circuits | Phys. Rev. Phys. Educ. Res.. https://journals.aps.org/prper/abstract/10.1103/PhysRevPhysEducRes.20.020128
  - Quote: "One of the most frequently documented findings in this literature is students’ difficulty in conceptualizing and applying the concept of current."
This is DC research, not AC. Dan is an electrician and the DC ground is firm, but "reactance" and "impedance" are new terms for something that looks like resistance and is not, so term confusion is the expected failure to design against.

### 5.7 Learning science for the course design
- **Simulations replacing equipment in a circuits course gave better or equal conceptual learning (PhET circuit construction kit; DC circuits)**
  - Source: Using PhET simulations to replace real equipment in lab – Circuit Construction Kit. https://serc.carleton.edu/sp/library/phet/examples/example2.html
  - Quote: "Research shows that substituting the PhET Circuit Construction Kit simulation for real equipment in a variety of contexts leads to improved conceptual learning in the best cases, and the same conceptual learning in the worst cases."
- **Predict-observe-explain with simulations outperformed traditional POE (107 Turkish 9th graders, physics achievement; not AC)**
  - Source: An experimental study exploring the effects of predict–observe–explain method supported with simulations: Research in Science & Technological Education: Vol 43, No 2. https://www.tandfonline.com/doi/abs/10.1080/02635143.2023.2296458
  - Quote: "The results showed that the experimental group outperformed the control group regarding physics achievement."
- **Time and phasor animations side by side as the tool for AC**
  - Source: AC circuits, alternating current electricity. https://www.animations.physics.unsw.edu.au/jw/AC.html
  - Quote: "Time and phasor animations are used to explain alternating current (AC) circuits. Impedance, phase relations, resonance and RMS quantities are shown on this resource page"
My reading: the sources support the course's own method (play, predict, explain) but none tests it on AC. The PhET and POE studies are DC or other topics and school-age. The strongest AC-specific evidence is only that students misread phase from a graph (5.3) and that simulation helps in related circuits topics. The design should therefore: show time-wave and phasor together (UNSW); make Dan predict lead and lag before seeing it; keep one idea per play control; and let the phasor be a picture of the wave, never the starting point. These are design choices, not research results.

---

## 6. Where it is used: electrician to naval and marine electrical engineering

Where a fact differs at sea it is said as an example only. The principle is the same.

### 6.1 Ship systems: voltage, frequency, neutral
- **Most ships: 3-phase, 3-wire, 440 V with an insulated neutral (the generator star point not earthed to the hull); a continental alternative is 380 V** **SECONDARY**
  - Source: maritime electrical installations - notes on design .... http://www.iqytechnicalcollege.com/JEE129-MarineElectricalSystems.pdf
  - Quote: "The majority of ships have a 3 phase, 3 wire, 440V insulated neutral system. This means that the neutral point of star connected generators is not earthed to the ship's hull. For Continental European vessels, a 380V, 3 phase system is common."
- **60 Hz is the usual ship frequency because motors and generators run faster and so are smaller for the same power** **SECONDARY**
  - Source: maritime electrical installations - notes on design .... http://www.iqytechnicalcollege.com/JEE129-MarineElectricalSystems.pdf
  - Quote: "60 Hz is the most common frequency adopted for use on board ship; the higher frequency enabling motors and generators to run at higher speeds with a consequent reduction in size for a given power rating."
- **Warships: the US Navy chose 440 V 60 Hz in the 1930s and ran it without a connection to the hull (IMarEST paper on neutral earthing)**
  - Source: NEUTRAL EORTHMG OF mnRIIIE ELECTRICAL POUIER .... https://library.imarest.org/record/2202/files/2229.pdf
  - Quote: "in the 1930s and a three-phase 440 V/60 Hz system was selected in line with US practice. As with the 220 V d.c. systems, and particularly because of the need for high-integrity supplies generally in warships, these systems were operated without any connection to the ship's hull."
- **US Navy destroyer study (MIT Sea Grant): power generated at 60 Hz and distributed at 6.9 kV, with 450 V 60 Hz loads in each zone**
  - Source: Dual Ring Bus Electrical Distribution System for US Navy .... https://repository.library.noaa.gov/view/noaa/46051/noaa_46051_DS1.pdf
  - Quote: "Power is generated at 60 Hz ac using conventional generators and is distributed throughout the ship at 6.9 kV."
- **MCA ETO syllabus keeps "Insulated and earthed neutral systems" and "Marine three phase systems"**
  - Source: 11. ETO - Electrical Motors and Generators - GOV.UK. https://www.gov.uk/government/consultations/cadet-training-modernisation-programmesyllabus-review-sixth-group-of-consultation-templates/outcome/11-eto-electrical-motors-and-generators
  - Quote: "3.13 Insulated and earthed neutral systems | Keep | Relevant | None * 3.14 Operation of reverse power relays | Keep | Relevant | None * 3.15 Earth fault detection"
Note the link to 3.10: on an insulated-neutral, three-wire system there is no neutral conductor at all, so the line-to-line voltage is the only voltage a load sees and nothing returns through the hull. That is a direct use of the star and delta idea, and a reason the brief should keep the line/phase work honest.

### 6.2 Generators, kVA and power factor
- **Alternators are rated in kVA at a stated power factor because reactive loads limit field heating** **SECONDARY**
  - Source: maritime electrical installations - notes on design .... http://www.iqytechnicalcollege.com/JEE129-MarineElectricalSystems.pdf
  - Quote: "lagging power factor loads tend to demagnetize the field and terminal voltage is maintained only by increasing the d.c. field current. Therefore, a.c. generators are rated in terms of load current and voltage output, or kilovolt-ampere (kVA) output, at a specified frequency and power factor."
- **A 60 Hz set: 630 kVA = 504 kW at power factor 0.8**
  - Source: AD630-6 DIESEL GENERATING SET 480/277V,440/254V,380/220V- 60 Hz. https://bnhgenerators.com/wp-content/uploads/2026/04/AD630-6.pdf
  - Quote: "MODEL AD630-6 Power Pf. 0.8 Standby kVA 630 kW 504"
- **Parallel alternators: under-excitation makes the power factor leading and raises current with no change in kW**
  - Source: Part 7 – Parallel Operation of Generators – PEG-3722 Electrotechnology. https://ecampusontario.pressbooks.pub/electrotechnology/chapter/part-7-parallel-operation-of-generators
  - Quote: "If the generator is under-excited , the power factor becomes leading. The current output increases without any change in the kW output."
- **Over-excitation moves the power factor lagging; current rises with no appreciable change in kW**
  - Source: Part 7 – Parallel Operation of Generators – PEG-3722 Electrotechnology. https://ecampusontario.pressbooks.pub/electrotechnology/chapter/part-7-parallel-operation-of-generators
  - Quote: "If a generator operating in parallel is overexcited: * The power factor will change in the lagging direction. * Current output increases without appreciable change in kW load output."
- **A marine engineer certificate paper sets two star-connected alternators sharing a lagging load**
  - Source: SEAGOING ENGINEER CLASS 1 ELECTROTECHNOLOGY. https://www.mardep.gov.hk/filemanager/en/share/pub-services/pdf/sample_c1_et.pdf
  - Quote: "8. Two 3 phase star-connected alternators share a load of 210 kW at power factor 0.75 lagging, in the ratio 2:3. The line voltage is 2.2 kV. If the current load on the first machine (i.e. the machine supplying the lesser power) is 28 A. Determine : (a) the current loading on the second machine; and (b) the power factors at which each of the machines are operating."
- **MCA ETO module: synchronising with lamps or synchroscope, and load sharing**
  - Source: 11. ETO - Electrical Motors and Generators - GOV.UK. https://www.gov.uk/government/consultations/cadet-training-modernisation-programmesyllabus-review-sixth-group-of-consultation-templates/outcome/11-eto-electrical-motors-and-generators
  - Quote: "Synchronising using lamps, synchroscope and load sharing"
### 6.3 Motors, three-phase distribution, power factor
- **US Navy nuclear-power training problem: a 450 V three-phase delta load of 100 hp at 0.92 lagging, asking for real power, apparent power, line and phase current**
  - Source: A balanced three phase 60Hz system is driven by a generator with a line voltage of 450V. https://www.navsea.navy.mil/Portals/103/Documents/NNPTC/Electrical%20Eng/ee_quest.pdf
  - Quote: "A three-phase 450V system is supplying a delta-connected 100hp load (746W = 1hp) at a power factor of 0.92 lagging."
- **The same problem set asks for "the advantages of three-phase systems over single-phase systems"**
  - Source: A balanced three phase 60Hz system is driven by a generator with a line voltage of 450V. https://www.navsea.navy.mil/Portals/103/Documents/NNPTC/Electrical%20Eng/ee_quest.pdf
  - Quote: "State the advantages of three-phase systems over single-phase systems."
- **Royal Navy marine engineering officer course: ship electrical systems; AC generation and distribution**
  - Source: Systems Engineering & Management Course | Royal Navy Defence Training. https://www.royalnavy.mod.uk/international-defence-training/onsite-courses/marine-engineering-trade/systems-engineering-and-management-course
  - Quote: "Gas turbines, diesels, transmissions, electrical propulsion systems, ship electrical systems, steering & stabilisers, AC generation & distribution"
- **Royal Navy POET(ME) generation course: alternator maintenance; AVRs and watchkeeping panels**
  - Source: POET Generation Common Course | Royal Navy Defence Training. https://www.royalnavy.mod.uk/international-defence-training/onsite-courses/marine-engineering-trade/poet-generation-common
  - Quote: "Alternator maintenance"
- **A power systems unit sizes correction capacitors separately for star and delta loads**
  - Source: national unit specification: general information. https://www.sqa.org.uk/files/hn/DDN3W34.pdf
  - Quote: "Determine the size and rating of power factor improvement capacitors for a star connected three phase inductive load. Determine the size and rating of power factor improvement capacitors for a delta connected three phase inductive load."
Uses I could not source: (a) Royal Navy-specific ship voltage and frequency (the UK warship figures are not on a page I could reach; the US Navy and training-ship pages are the examples, and RN SEMC names "AC generation & distribution" without numbers); (b) resonance in ship systems (harmonic filters, ringing in long cables). Both are **UNCONFIRMED**. In Dan's own trade the cable-fault-location link to resonance (a long cable is a capacitor) is my reading, not sourced.

---

## 7. Size: chapters spent by the benchmarks, and a core for 10 lessons

Counts from the table of contents quoted above (my reading, from the quotes):

| Benchmark | AC chapters (ground of this course) | What it spends them on |
|---|---|---|
| Kuphaldt Vol II | 1, 3, 4, 5, 6, 10, 11 = 7 chapters (plus ch 2 complex numbers) | Basic AC, L, C, RLC, resonance, polyphase, power factor |
| Hughes | 9, 10, 11, 12, 13, 14 = 6 chapters (plus ch 15 network theorems; three-phase not shown) | Voltage and current, series, parallel, power, complex notation, resonance |
| Bird 7th ed. | 16, 17, 18, 22 (three-phase), 26-29, 31-32 = 10 chapters | Same, with complex numbers and Q later |
| Bird 5th ed. page counts | 14, 15, 16 = 51 pages; 19 (three-phase) 13 pages; 26 power 14 pages; 28 resonance 15 pages | 93 pages in the chapters quoted (the complex-number chapters 23 to 25 are not in the quoted excerpt) |
| BTEC HN 4019 + 5019 | Two units (Level 4 and Level 5) | Single-phase to three-phase, balanced circuits, power factor correction |
| SQA HN | Four units: Single Phase AC, Three Phase Systems, Electricity Power Systems (PF improvement), DC and AC Principles | Same |

The benchmarks spend 6 to 7 chapters (or about 90 pages) on exactly these ten parts. A 10-lesson course gives one lesson per chapter or less; it must leave out mixed frequencies and filters (Kuphaldt 7, 8), transformers (9), AC bridges and network theorems (Hughes 15, Bird 27 onward), parallel resonance and Q as a design number, and complex three-phase unbalanced loads.

Core that supports ten lessons for Dan (my reading from the order in 2 and 3; the brief decides the final list):
1. AC from a turning coil: the sine, period, frequency, peak and peak-to-peak (3.1).
2. Rms and why 230 V is rms (3.2).
3. Resistance in AC: in phase, instantaneous and average power (3.3).
4. Inductance: back-emf, X_L, current lags (3.4).
5. Capacitance: charging current, X_C, current leads (3.5).
6. Impedance Z = R + jX: series RL and RC, the impedance triangle, phase angle (3.6).
7. Series RLC and resonance (3.7).
8. Real, reactive and apparent power; power factor; kVA ratings (3.8).
9. Power factor correction: sizing the kvar and the current saved (3.9).
10. Three-phase: 120 degrees, star and delta, sqrt 3, P = sqrt 3 V_L I_L cos phi, the neutral (3.10).

Order note: the benchmarks place power factor late; Hughes and Bird place power after impedance. The 10-lesson order above keeps that, but the brief might move power factor and kVA earlier as the hook, since an electrician knows the word and the kVA label already. Hughes puts complex notation after power; Dan has it already, so lessons 6 to 10 can use it from the start. Resonance (7) is the least "trade" part; Hughes, Bird, HN units and Kuphaldt all keep it, so it stays in, but it is the lesson that could shrink to a half-lesson if the build needs room.

Outside this course (where it goes): transformers (Transformers), three-phase generation and distribution at sea (Three-phase power systems at sea), motors and alternators (Machines and drives), harmonics and filters (Instrumentation and control), insulation and fault-finding at the neutral (Maintenance and fault-finding).

---

## 8. What I could not confirm (one list)

- The Open University has no reachable module on AC; I used OpenLearn's electronics introduction and UNSW Physclips.
- The exact text of f0 = 1/(2 pi sqrt LC) on a page (only the garbled MIT and slide forms came through).
- EAL unit lines for Dan's qualifications; the MCA Engineer Officer electrotechnology syllabus; any Royal Navy page naming AC topics below "AC generation & distribution".
- Hughes's three-phase chapter (the table of contents excerpt showed chapters 9 to 15 only).
- Any research paper on star and delta or power factor misconceptions.
- Royal Navy warship voltage and frequency (examples given are US Navy, a training ship and a marine installation course).
- The allaboutcircuits.com pages themselves (HTTP 403 to the fetch tool); the Kuphaldt text was read on ibiblio.org and the contents on a search result.

