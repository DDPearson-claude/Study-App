# Transformers and magnetism: research notes

Researched 28 Oct 2026 for the Transformers and magnetism course brief (the third course in the Electrical shelf's Electrical
principles folder: AC circuits, Electronics and power electronics, Transformers and magnetism; blurb "Electromagnetism from first
principles, then the transformer: turns ratio, losses, regulation, vector groups and stepping 440 V down to 115 V."; benchmark
Brilliant's electricity and magnetism course). The brief itself is not written here; these notes are its evidence. Dan is an
electrician and a Royal Navy submariner on the electrical engineering path; he asked for foundations that see him through any new
topic, not a remake of his Navy course.

Every finding has its source title, URL and the exact words, copied from a saved tool result by script (the quotes were not
retyped into this file). All of them are listed in `quotes.json` beside this file and were checked with
`node tools/eval/sources.mjs --quotes ... --tools ...`. The tool files are in `tools/`. Findings I could not confirm are marked
**UNCONFIRMED**; where only a non-original site said it, **SECONDARY** (hosts that republish an original text, lecture notes,
trade blogs). My own readings are marked "My reading" and are not quotes. Pages the checker treats as copies (web.archive.org,
pdfcoffee) are described but not quoted. Numbers I computed are marked "computed".

Note on the search tool: its results are shortened by the checker, so some longer pages (the Pearson HN papers, an NRC test report)
are quoted only where the shortened text keeps the words.

---


## 1. Benchmark: Brilliant's electricity and magnetism

### 1.1 The course itself
Brilliant's course is called Electricity and Magnetism. Its page is `brilliant.org/courses/electromagnetism/` (the guessed
addresses `/courses/electricity-and-magnetism/`, `/electricity-magnetism/`, `/electric-fields/`, `/magnetic-fields/`,
`/electricity/` and `/science/` all return only the Topics list, with no course). The saved copy of the page is dated
17 February 2025. It gives **9 lessons and no levels**, in this order: Unlocking Electricity, The Sand Grain Analogy, A Sticky
Situation, Net Charge, Coulomb's Law, What are Fields?, Charges on a String, Ions in Solution, Parallel Charged Plates.
- **Brilliant's Electricity and Magnetism page lists 9 lessons, all on charge and electric fields**
  - Source: Practice Electricity and Magnetism | Brilliant. https://brilliant.org/courses/electromagnetism/
  - Quote: "Discover what powers the devices you use, from your toaster to your cell phone. 9 Lessons Unlocking Electricity The Sand Grain Analogy A Sticky Situation Net Charge Coulomb's Law What are Fields? Charges on a String Ions in Solution Parallel Charged Plates"
- **Its topics list takes in Ampere's, Faraday's and the Lorentz law, but the lesson list stops at electric fields**
  - Source: Practice Electricity and Magnetism | Brilliant. https://brilliant.org/courses/electromagnetism/
  - Quote: "Topics covered * Charge * Coulomb’s Law * Electric Fields * Conductors * Capacitance * Current * Hands-on Experiments * Kirchoff’s Circuit Rules * Ampere’s Law * Faraday’s Law * Lorentz Force Law * Magnetic Fields * Gauss’ Law * Maxwell’s Equations"
- **The course is about the observations behind Maxwell's field equations**
  - Source: Practice Electricity and Magnetism | Brilliant. https://brilliant.org/courses/electromagnetism/
  - Quote: "The focus, here, is on the physical observations that inspired Maxwell's famous field equations, which tell us how electric and magnetic fields operate across the universe."
- **Its prerequisites are mechanics (forces and energy) and vectors developed in context**
  - Source: Practice Electricity and Magnetism | Brilliant. https://brilliant.org/courses/electromagnetism/
  - Quote: "This course assumes that you're familiar with forces and energy from Newtonian mechanics. While vectors and their geometric interpretation will be used, they will be developed in context. The course will not require you to evaluate any integrals, though familiarity with integral calculus concepts is helpful."

My reading: the nine listed lessons are all charge and electric fields. The topics list promises Ampere's Law, Faraday's Law,
the Lorentz Force Law and Magnetic Fields, but no lesson title says so, and the page gives no levels. Whether magnetism lessons
exist beyond the nine is **UNCONFIRMED** (I did not see a lesson). Nothing on the page mentions a transformer, a core, or AC.
The course is demo-led ("handpicked and filmed" demonstrations, quoted in the description) and aims at the observations behind
Maxwell, which is more physics than Dan needs.

---

### 1.2 Where it sits in Brilliant's path
The page lists two prerequisites (Classical Mechanics, Scientific Thinking) and Quantum Mechanics with Sabine as the next
course (Science, level 4). Brilliant's current Science listing no longer features it.
- **It sits after Classical Mechanics and Scientific Thinking, before Quantum Mechanics (Science, level 4)**
  - Source: Practice Electricity and Magnetism | Brilliant. https://brilliant.org/courses/electromagnetism/
  - Quote: "Prerequisites * Classical Mechanics * Scientific Thinking Up next Science · Level 4"
- **Brilliant's current Science list no longer features Electricity and Magnetism**
  - Source: Brilliant | The Smartest Way to Learn Science. https://brilliant.org/science
  - Quote: "Science: Covered topics * Scientific Thinking * Circuits * Digital Circuits * Quantum Computing"

**UNCONFIRMED:** a 2019 snapshot of Brilliant's course list showed "Electricity and Magnetism ... Coming soon". It sits on
web.archive.org, which the quote checker rejects as a copy host, so it is not in quotes.json. Brilliant has therefore
reshuffled this course at least twice. My reading: it is the nearest named benchmark, but it is thin and moving, and it is not
a transformer course. The brief should say so and lean on the engineering texts in section 2 for order.

---

### 1.3 Brilliant's other relevant course: Circuits
Brilliant's Circuits course is the closest thing it has to a bridge: current, voltage, resistance, power, series and parallel.
It has no magnetism and no AC.
- **Brilliant's Circuits course is 31 lessons in 7 levels, ending at voltage comparisons, with no magnetism**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits/
  - Quote: "31 Lessons 334 Exercises ### Level 1 Circuits Current Loops Short Circuits Choosing Bulbs Splitting Current Level Review ### Level 2 Current The Path of Least Resistance Bulb Brightness Changing Current Different Bulbs Conserving Current Level Review ### Level 3 Voltage Voltage Measuring Voltage Voltage Around Paths Branched Voltage Level Review ### Level 4 Power and Resistance Power and Brightness Deducing Power Resistance Solving for Resistance Level Review ### Level 5 Circuit Analysis Predicting Current Controlling Current Combining Resistance Dividing Resistance Total Resistance Voltage and Resistance ... Bulbs with Voltage"
- **Circuits course description**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits/
  - Quote: "Build an intuitive understanding of how electric circuits work, and the underlying concepts of current, voltage, resistance and power."
- **Brilliant's wiki on Faraday's law**
  - Source: Magnetic Flux and Faraday's Law | Brilliant Math & Science Wiki. https://brilliant.org/wiki/magnetic-flux-and-faradays-law-quantitative
  - Quote: "Faraday's law forms the basis for describing how much of our modern world operates, including how electric current is generated and how modern electronic devices and components function."

My reading: between them Brilliant's two courses stop where Dan's AC circuits and Electronics courses start. There is no
reachable Brilliant lesson on induction, inductance or transformers, so Brilliant gives no lesson count to match. Its wiki
page on Faraday's law is a one-line pointer to the reason the topic matters.

---


## 2. Other courses' order for the same ground

### 2.1 OpenStax University Physics, volume 2
The order is: magnetic forces and fields (ch. 11), sources of magnetic fields (ch. 12), electromagnetic induction (ch. 13),
inductance (ch. 14), AC circuits (ch. 15) and, as the last section of that chapter, transformers (15.6). The transformer is
treated as ideal, and the text says why that is fair.
- **OpenStax University Physics 2, chapter 11: magnetic forces and fields**
  - Source: Ch. 11 Introduction - University Physics Volume 2 | OpenStax. https://openstax.org/books/university-physics-volume-2/pages/11-introduction
  - Quote: "11.1 Magnetism and Its Historical Discoveries * 11.2 Magnetic Fields and Lines * 11.3 Motion of a Charged Particle in a Magnetic Field * 11.4 Magnetic Force on a Current-Carrying Conductor * 11.5 Force and Torque on a Current Loop * 11.6 The Hall Effect * 11.7 Applications of Magnetic Forces and Fields"
- **Chapter 12: sources of magnetic fields (Biot-Savart to solenoids and magnetism in matter)**
  - Source: Ch. 12 Introduction - University Physics Volume 2 | OpenStax. https://openstax.org/books/university-physics-volume-2/pages/12-introduction
  - Quote: "12.1 The Biot-Savart Law * 12.2 Magnetic Field Due to a Thin Straight Wire * 12.3 Magnetic Force between Two Parallel Currents * 12.4 Magnetic Field of a Current Loop * 12.5 Ampère’s Law * 12.6 Solenoids and Toroids * 12.7 Magnetism in Matter"
- **Chapter 13: electromagnetic induction (Faraday, Lenz, eddy currents, generators)**
  - Source: Ch. 13 Introduction - University Physics Volume 2 | OpenStax. https://openstax.org/books/university-physics-volume-2/pages/13-introduction
  - Quote: "13.1 Faraday’s Law * 13.2 Lenz's Law * 13.3 Motional Emf * 13.4 Induced Electric Fields * 13.5 Eddy Currents * 13.6 Electric Generators and Back Emf * 13.7 Applications of Electromagnetic Induction"
- **Chapter 14: inductance (mutual inductance first)**
  - Source: Ch. 14 Introduction - University Physics Volume 2 | OpenStax. https://openstax.org/books/university-physics-volume-2/pages/14-introduction
  - Quote: "14.1 Mutual Inductance * 14.2 Self-Inductance and Inductors * 14.3 Energy in a Magnetic Field * 14.4 RL Circuits * 14.5 Oscillations in an LC Circuit * 14.6 RLC Series Circuits"
- **Chapter 15: AC circuits first, then the transformer as the last section**
  - Source: Ch. 15 Introduction - University Physics Volume 2 | OpenStax. https://openstax.org/books/university-physics-volume-2/pages/15-introduction
  - Quote: "15.1 AC Sources * 15.2 Simple AC Circuits * 15.3 RLC Series Circuits with AC * 15.4 Power in an AC Circuit * 15.5 Resonance in an AC Circuit * 15.6 Transformers"
- **OpenStax says constant potential differences are unaffected by transformers**
  - Source: Ch. 15 Introduction - University Physics Volume 2 | OpenStax. https://openstax.org/books/university-physics-volume-2/pages/15-introduction
  - Quote: "Because constant potential differences are unaffected by transformers, this capability is more difficult to achieve with direct-current transmission."
- **OpenStax treats the transformer as ideal and says a good one loses about 1%**
  - Source: 15.6 Transformers - University Physics Volume 2 | OpenStax. https://openstax.org/books/university-physics-volume-2/pages/15-6-transformers
  - Quote: "We assume the ideal case for which all magnetic field lines are confined to the core so that the same magnetic flux permeates each turn of both the primary and the secondary windings. We also neglect energy losses to magnetic hysteresis, to ohmic heating in the windings, and to ohmic heating of the induced eddy currents in the core. A good transformer can have losses as low as 1% of the transmitted power, so this is not a bad assumption."

My reading: a physics text puts the transformer after AC, as an application. It never opens a core, so it gives no B-H curve,
no iron loss, no tests and no vector groups. Those come from the engineering texts below.

---

### 2.2 Khan Academy physics
Khan has no transformer lesson in either unit I could reach. The AP Physics 2 unit runs fields, moving charges, current-carrying
wires, electromagnetic induction, then magnetic properties of materials. The high-school unit runs voltage and current, field
due to current (straight, coil, solenoid), motors, induction, generators.
- **Khan Academy AP Physics 2 unit 4, skills in order**
  - Source: Khan Academy | Khan Academy. https://www.khanacademy.org/science/ap-physics-2/x0e2f5a2c:magnetism-and-electromagnetism
  - Quote: "Unit 4: Magnetism and electromagnetism 8 skills Mastered Proficient Familiar Attempted Not started Quiz Unit test 1. Magnetic field lines: direction 2. Direction of cross product of two vectors (right-hand rule) 3. Magnetic force on moving charges 4. Properties of magnetic force on charged particle 5. ... Faraday's law - magnitude of induced emf (average) 9. Lenz's law - iii 10. Magnetism and electromagnetism: Quiz 2 11. Magnetism and electromagnetism: Unit test"
- **Khan's electromagnetic induction lesson: flux, induced emf, Lenz**
  - Source: Khan Academy | Khan Academy. https://www.khanacademy.org/science/ap-physics-2/x0e2f5a2c:magnetism-and-electromagnetism
  - Quote: "Learn how magnetic flux describes the amount of the component of a magnetic field that is perpendicular to a cross-sectional area. Describe the induced electric potential difference that results from a change in magnetic flux. Use Lenz’s law to determine the direction of an induced emf resulting from a changing magnetic flux."
- **Khan high-school physics unit 6 Electromagnetics, in order**
  - Source: Electromagnetics | High school physics | Science | Khan Academy. https://www.khanacademy.org/science/highschool-physics/x6679aa2c65c01e53:electromagnetics
  - Quote: "Unit 6: Electromagnetics 1. Apply: Voltage and current 2. Apply: Magnetic field due to straight current-carrying conductors 3. Apply: Magnetic field due to current-carrying coils 4. Electromagnetics: Quiz 1 5. Apply: Force on a current-carrying conductor in a magnetic field 6. Apply: Electric motors 7. Electromagnetics: Quiz 2 8. Apply: Electromagnetic induction"
- **Khan: current makes a field, right-hand rule, coil as a magnet**
  - Source: Electromagnetics | High school physics | Science | Khan Academy. https://www.khanacademy.org/science/highschool-physics/x6679aa2c65c01e53:electromagnetics
  - Quote: "Explore how an electric current produces a magnetic field. Learn how to describe the direction of this field using the right hand rule. Discover how coiling a current-carrying wire around into a loop or solenoid results in a magnetic field that resembles a bar magnet's field."

My reading: Khan's induction lesson teaches flux and Lenz's direction, and stops there. Its "field due to current" lesson is the
model for lesson 1: Oersted, the right-hand rule, then the coil as a bar magnet.

---

### 2.3 Hughes, Electrical and Electronic Technology
Hughes is the closest match to the electrical apprenticeship path. Its order is: Electromagnetism, Simple Magnetic Circuits,
Inductance in a DC Circuit (chapters 6 to 8 in the 10th and 12th editions), then the AC chapters (single-phase, power,
complex notation), then Section 3, Power Engineering: multiphase systems, then Transformers (chapter 34 in the 10th edition,
29 in the Pearson 12th-edition listing, with a different chapter count). The 23 sections of the transformer chapter, in order,
are the best single guide to the order of lessons 4 to 8.
- **Hughes: Electromagnetism, Simple Magnetic Circuits, Inductance come before the AC chapters**
  - Source: Hughes Electrical and Electronic Technology. https://www.pearson.com/en-gb/subject-catalog/p/hughes-electrical-and-electronic-technology/P200000004514?view=educator
  - Quote: "6 Electromagnetism * 7 Simple Magnetic Circuits * 8 Inductance in a DC Circuit"
- **Hughes puts Transformers in Section 3, Power Engineering, after Multiphase Systems**
  - Source: Hughes Electrical and Electronic Technology. https://www.pearson.com/en-gb/subject-catalog/p/hughes-electrical-and-electronic-technology/P200000004514?view=educator
  - Quote: "Section 3 Power Engineering * * 28 Multiphase Systems * 29 Transformers * 30 Introduction to Machine Theory"
- **Hughes 10th edition chapter 6 sections**
  - Source: Table of contents for Hughes electrical and electronic technology. https://catdir.loc.gov/catdir/toc/ecip0816/2008017741.html
  - Quote: "6 Electromagnetism 132 6.1 Magnetic field 133 6.2 Direction of magnetic field 133 6.3 Characteristics of lines of magnetic flux 133 6.4 Magnetic field due to an electric current 134 6.5 Magnetic field of a solenoid 135 6.6 Force on a current-carrying conductor 136 6.7 Force determination 138 6.8 Electromagnetic induction 140 6.9 Direction of induced e.m.f. 140 6.10 Magnitude of the generated or induced e.m.f. 141 6.11 Magnitude of e.m.f. induced in a coil 143"
- **Hughes chapter 7 sections: mmf, reluctance, Ohm's law for a magnetic circuit, B/H**
  - Source: Table of contents for Hughes electrical and electronic technology. https://catdir.loc.gov/catdir/toc/ecip0816/2008017741.html
  - Quote: "7 Simple Magnetic Circuits 147 7.1 Introduction to magnetic circuits 148 7.2 Magnetomotive force and magnetic field strength 148 7.3 Permeability of free space or magnetic constant 149 7.4 Relative permeability 151 7.5 Reluctance 153 7.6 'Ohm's law for a magnetic circuit' 153 7.7 Determination of the B/H characteristic 156 7.8 Comparison of electromagnetic and electrostatic terms 158"
- **Hughes AC chapters (including complex notation) come before the transformer chapter**
  - Source: Table of contents for Hughes electrical and electronic technology. https://catdir.loc.gov/catdir/toc/ecip0816/2008017741.html
  - Quote: "9 Alternating Voltage and Current 197 10 Single-phase Series Circuits 222 11 Single-phase Parallel Networks 243 12 Power in AC Circuits 259 13 Complex Notation 273 14 Resonance in AC Circuits 298 15 Network Theorems Applied to AC Networks 321"
- **Hughes Section 3 Power Engineering, multiphase then transformers**
  - Source: Table of contents for Hughes electrical and electronic technology. https://catdir.loc.gov/catdir/toc/ecip0816/2008017741.html
  - Quote: "Section 3 Power Engineering 657 33 Multiphase Systems 659 34 Transformers 680 35 Introduction to Machine Theory 714"
- **Hughes chapter 34 Transformers, 23 sections from principle of action to current transformers**
  - Source: Table of contents for Hughes electrical and electronic technology. https://catdir.loc.gov/catdir/toc/ecip0816/2008017741.html
  - Quote: "34 Transformers 680 34.1 Introduction 681 34.2 Core factors 681 34.3 Principle of action of a transformer 682 34.4 EMF equation of a transformer 683 34.5 Phasor diagram for a transformer on no load 685 34.6 Phasor diagram for an ideal loaded transformer 687 34.7 Useful and leakage fluxes in a transformer 689 34.8 Leakage flux responsible for the inductive reactance of a transformer 691 34.9 Methods of reducing leakage flux 691 34.10 Equivalent circuit of a transformer 692 34.11 Phasor diagram for a transformer on load 693 34.12 Approximate equivalent circuit of a transformer 694 34.13 Simplification of the approximate equivalent circuit of a transformer 695 34.14 Voltage regulation of a transformer 696 34.15 Efficiency of a transformer 700 34.16 Condition for maximum efficiency of a transformer 701 34.17 Open-circuit and short-circuit tests on a transformer 703 34.18 Calculation of efficiency from the open-circuit and short-circuit tests 704 34.19 Calculation of the voltage regulation from the short-circuit test 704 34.20 Three-phase core-type transformers 706 34.21 Auto-transformers 706 34.22 Current transformers 707 34.23 Waveform of the magnetizing current of a transformer 708"

My reading: Hughes agrees with the scope. Fields, then the magnetic circuit with its B-H characteristic, then induction, then
(AC already known) the transformer: principle, EMF equation, no-load phasors, leakage flux, the equivalent circuit, regulation,
efficiency, maximum efficiency, the two tests, three-phase, auto and current transformers, magnetising current.

---

### 2.4 Bird, Electrical Circuit Theory and Technology
Bird's contents give chapters only (the section lists are behind the publisher's page). The order is magnetic circuits,
electromagnetism, electromagnetic induction (chapters 7 to 9), three-phase systems (19), transformers (20). Bird's preliminary
pages put "three-phase systems, transformers, d.c. machines and three-phase induction motors" together in the power section.
- **Bird's section on power: three-phase systems, then transformers**
  - Source: 0750657847-prelims.pdf. https://www.gacbe.ac.in/images/E%20books/Bird%20-%20Electrical%20Circuit%20Theory%20and%20Technology%202nd%20Rev.pdf (SECONDARY)
  - Quote: "D.c. circuit theory, alternating voltages and currents, single-phase series and parallel circuits, d.c. transients, operational amplifiers, three-phase systems, transformers, d.c. machines and three- phase induction motors are all included in this section."
- **Bird (Electrical Circuit Theory and Technology) chapter 7 is Magnetic circuits**
  - Source: Electrical Circuit Theory and Technology | John Bird | Taylor & Franci. https://www.taylorfrancis.com/books/mono/10.4324/9780080549798/electrical-circuit-theory-technology-john-bird
  - Quote: "chapter 7 | 9 pages #### Magnetic circuits"
- **Bird (Electrical Circuit Theory and Technology) chapter 8 is Electromagnetism**
  - Source: Electrical Circuit Theory and Technology | John Bird | Taylor & Franci. https://www.taylorfrancis.com/books/mono/10.4324/9780080549798/electrical-circuit-theory-technology-john-bird
  - Quote: "chapter 8 | 8 pages #### Electromagnetism"
- **Bird (Electrical Circuit Theory and Technology) chapter 9 is Electromagnetic induction**
  - Source: Electrical Circuit Theory and Technology | John Bird | Taylor & Franci. https://www.taylorfrancis.com/books/mono/10.4324/9780080549798/electrical-circuit-theory-technology-john-bird
  - Quote: "chapter 9 | 10 pages #### Electromagnetic induction"
- **Bird (Electrical Circuit Theory and Technology) chapter 19 is Three-phase systems**
  - Source: Electrical Circuit Theory and Technology | John Bird | Taylor & Franci. https://www.taylorfrancis.com/books/mono/10.4324/9780080549798/electrical-circuit-theory-technology-john-bird
  - Quote: "chapter 19 | 12 pages #### Three-phase systems"
- **Bird (Electrical Circuit Theory and Technology) chapter 20 is Transformers**
  - Source: Electrical Circuit Theory and Technology | John Bird | Taylor & Franci. https://www.taylorfrancis.com/books/mono/10.4324/9780080549798/electrical-circuit-theory-technology-john-bird
  - Quote: "chapter 20 | 19 pages #### Transformers"

My reading: the same order as Hughes. Chapter numbers are those of the 6th edition (the AC circuits brief cited an earlier
edition's chapter 23). Section lists for Bird are **UNCONFIRMED**.

---

### 2.5 Schneider, Electrical Installation Guide
The Guide is written for an installer, so it asks what a transformer does to the installation: parallel operation, the
impedance voltage Usc and fault current, rating and loss when over or undersized, and the reactive power a transformer absorbs.
- **Electrical Installation Guide: the conditions for paralleling transformers**
  - Source: Substation including generators and parallel operation of transformers - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/Substation_including_generators_and_parallel_operation_of_transformers
  - Quote: "It is preferred to connect in parallel transformers having the same characteristics: * Same voltage ratio * Same rated power * Same short circuit impedance. * Same coupling symbol of windings as for example D yn 11 * Same impedances of the LV links between the transformers and the main LV switchboard where the paralleling is realized."
- **A power ratio of two or more is not recommended for paralleling**
  - Source: Substation including generators and parallel operation of transformers - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/Substation_including_generators_and_parallel_operation_of_transformers
  - Quote: "Connection in parallel of transformers having a power ratio equal or higher than two is not recommended."
- **Unequal ratings share in proportion if ratio and impedance match**
  - Source: Substation including generators and parallel operation of transformers - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/Substation_including_generators_and_parallel_operation_of_transformers
  - Quote: "Transformers of unequal power ratings will share the load in proportion to their ratings, providing that their voltage ratios and their short circuit impedances are identical."
- **Oversizing a transformer: high no-load loss, lower on-load loss**
  - Source: Choice of MV/LV transformer - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/Choice_of_MV/LV_transformer
  - Quote: "Excessive investment * Un necessarily high no-load losses * Lower on-load losses."
- **Undersizing reduces efficiency when fully loaded**
  - Source: Choice of MV/LV transformer - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/Choice_of_MV/LV_transformer
  - Quote: "Under sizing a transformer causes: * A reduced efficiency when fully loaded."
- **Usc is the short-circuit impedance voltage in per cent**
  - Source: Short-circuit current at the secondary terminals of a MV/LV distribution transformer - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/Short-circuit_current_at_the_secondary_terminals_of_a_MV/LV_distribution_transformer
  - Quote: "Usc = short-circuit impedance voltage of the transformer in %."
- **Typical Usc values are tabulated for distribution transformers**
  - Source: Short-circuit current at the secondary terminals of a MV/LV distribution transformer - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/Short-circuit_current_at_the_secondary_terminals_of_a_MV/LV_distribution_transformer
  - Quote: "Typical values of Usc for distribution transformers are given in Figure G33"
- **A transformer absorbs reactive power, about 5% of rating at full load**
  - Source: Compensation of reactive energy absorbed by the transformer - Electrical Installation Guide. https://www.electrical-installation.org/enwiki/Compensation_of_reactive_energy_absorbed_by_the_transformer
  - Quote: "The reactive power absorbed by a transformer cannot be neglected, and can amount to (about) 5% of the transformer rating when supplying its full load."
- **Voltage drop inside a transformer at full load, 0.8 power factor lagging**
  - Source: Electrical Installation Guide 2018. https://fenix.tecnico.ulisboa.pt/downloadFile/1126518382241064/Electrical-Installation-Guide-2018.pdf (SECONDARY)
  - Quote: "If it is assumed that its resistance voltage is one tenth of this value, then the voltage drop within the transformer when supplying full load at 0.8 power factor lagging, will be:"

My reading: this is the source for the "why does an electrician care" half of lessons 6 to 8. Typical Usc values are in the
Guide's figure G33 (a table I did not quote); the brief should pull the exact values from the page when it needs them.

---

### 2.6 Manufacturers: ABB, Siemens, SGB-SMIT, Schneider
ABB, Siemens and SGB-SMIT guides state the same rules in their own words: two kinds of loss, load loss rising with the
square of the load, the same vector group for paralleling, inrush many times rated current, and the percentage-impedance trap.
- **ABB: transformer losses are load losses and no-load losses**
  - Source: Style Guide. https://library.e.abb.com/public/7dca4ffad2206d36c1257be30048d4be/DAHandbook_Section_3_Power_distribution_systems_757959_ENa.pdf
  - Quote: "The losses are divided into two categories, the load losses at rated load current and the no- load losses at rated voltage."
- **ABB: conditions to be met for paralleling power transformers**
  - Source: Style Guide. https://library.e.abb.com/public/7dca4ffad2206d36c1257be30048d4be/DAHandbook_Section_3_Power_distribution_systems_757959_ENa.pdf
  - Quote: "When two power transformers are to be connected in parallel, there are some conditions that the power transformers have to fulfill. It is possible to realize the parallel connection even if not all of the conditions are met, but the situation should be carefully studied."
- **ABB: vector group gives a phase shift in multiples of 30 degrees**
  - Source: Click to add webinar title. https://library.e.abb.com/public/870998cf98bfae3385257bf0004e67dc/Transformer%20protection%20fudamentals.pdf
  - Quote: "i.e. Yd1, Yd5, etc (which introduces a phase shift between winding currents in multiples of 30°)"
- **ABB: percent impedance, a misconception that higher is always better**
  - Source: — Low Voltage Dry Type Transformers Transformer percent impedance. https://library.e.abb.com/public/eb4bfdafc6954a3387b2c2d6e6e6535f/LVDTT%20percent%20impedance%2020230725-1.pdf?x-sign=ZC3e5Vbrl5%20Iw9vsQ5T3AUezf9m%208MpOQUav%20xtezIt635WecjOwqjZ0Bm7ASZPx
  - Quote: "there is a misconception that higher impedance values are always better."
- **Siemens: load losses rise with the square of the load**
  - Source: TIP | GEAFOL planning guidelines. https://assets.new.siemens.com/siemens/assets/api/uuid:469af2a9-55a8-44ae-857c-dc3dcedc9993/geafol-cast-resin-transformers-planning-guidelines.pdf
  - Quote: "The load losses increase as a function of the square of the load."
- **SGB-SMIT: vector groups must be equal to parallel**
  - Source: Cast Resin TransformersMedium voltage - SGB-SMIT Group. https://www.sgb-smit.com/products/dry-type-transformers/cast-resin-transformers-medium-voltage
  - Quote: "The coefficient of vector groups must be equal so that phasing of the output voltages corresponds and no short-circuit occurs."
- **Schneider: isolation transformer versus autotransformer**
  - Source: What is the difference between a regular transformer and an isolation transformer? What is an autotransformer? | Schneider Electric USA. https://www.se.com/us/en/faqs/FA123708
  - Quote: "Any two winding transformer where the primary and secondary are not electrically connected is an isolation transformer. In contrast, an autotransformer has a physical, electrical connection between the primary and secondary."

My reading: a manufacturer is the right voice for numbers on a nameplate (no-load loss, load loss, impedance voltage, vector
group). The Siemens pieces I could reach are product brochures and planning guidelines, not a vector-group primer, so the
vector-group teaching rests on ABB, SGB-SMIT and the secondary sources in 4.7. A Siemens paralleling guide is **UNCONFIRMED**.

---


## 3. What a marine electrical engineer actually uses of this topic

### 3.1 STCW Code, Table A-III/6 and A-III/1
Table A-III/6 (electro-technical officer) lists "Electro-technology and electrical machines theory" in its knowledge column
and does not name the transformer. Table A-III/1 (officer in charge of an engineering watch) lists generator and distribution
systems, paralleling, motors and high-voltage installations, and does not name it either.
- **STCW A-III/6 column 2 knowledge: electro-technology and electrical machines theory**
  - Source: STCW Code - Table A-III/6. https://www.edumaritime.net/images/docs/stcw-table-a-iii-6.pdf
  - Quote: "Electro-technology and electrical machines theory Fundamentals of electronics and power electronics Electrical power distribution boards and electrical equipment Fundamentals of automation, automatic control systems and technology"
- **STCW A-III/1 (engineering watch) lists generators, paralleling, motors and high-voltage, not transformers by name**
  - Source: STCW Table A-III/1. https://weh.maritime.edu/stcw/2018/tables/31.html
  - Quote: "Basic configuration and operation principles of the following electrical equipment: 1. generator and distribution systems 2. preparing, starting, paralleling and changing over generators 3. electrical motors including starting methodologies 4. high-voltage installations"

My reading: the STCW text is a heading; the transformer comes in through "electrical machines theory". The MCA lines in 3.2 are
the ones that name it. I did not find the A-III/2 management-level column in a checkable form (the NVIC copy is partly garbled),
so that is **UNCONFIRMED**.

---

### 3.2 MCA syllabus lines
The MCA names the transformer in three places. The ETO oral syllabus (MSN 1860, Annex C) lists "Transformer" among the machines
and asks for protection of HV transformers and a polarisation index test. The Chief Engineer's Marine Electro-Technology
written syllabus has a whole unit, 4.2, on the transformer (13 lines), and the Second Engineer's has Section 3.1 on
magnetism and induction (42 lines) with the transformer as the worked example of mutual inductance.
- **MCA ETO oral syllabus: electrical machines theory includes the transformer**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "Electrical machines theory (construction, working principle and protection devices for Generator, Motor (including types and various starting methods) and Transformer);"
- **MCA ETO oral syllabus, HV: protection for transformers**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "Protection for HV feeder, motors and transformers;"
- **MCA ETO oral syllabus, HV: polarisation index test for transformers**
  - Source: MSN 1860 (M). https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/852367/MSN1860.pdf
  - Quote: "Polarisation Index test for HV transformers;"
- **MCA oral exam notice lists transformers among what is evaluated**
  - Source: M Notice Template - MSF 5011. https://assets.publishing.service.gov.uk/media/69e78cff606c20d4121631df/MIN_654_Engineering_and_Electro-technical_Officer_Oral_Exam_Syllabus_-_Amendment_1__April_2026_.pdf
  - Quote: "electrical motors and generators, Control systems and Transducers, Power Electronics, Pneumatics and Hydraulics, Transformers are evaluated"
- **MCA Chief Engineer electro-technology: function of the transformer in distribution**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Describes the function of the transformer in an ac distribution system."
- **MCA Chief Engineer 4.2 principles of a transformer, first half (flux linkage, turns ratio, E = 4.44 f N phi, phasors, three-phase connections)**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Understands the principles of operation of a transformer. 1. Relates induced emf to rate of change of flux linkages. 2. Derives voltages and currents from turns ratios of single phase transformer. 3. Derives emf equation E = 4⋅44.fΦz. 4. Sketches phasor diagrams on and off load lag pf only and solves related problems. 5. Sketches three phase connections e.g. star/delta, star/star etc. using correct terminal markings. 6. Solves problems involving three phase transformers using turns and voltage ratios."
- **MCA Chief Engineer 4.2, second half (auto-transformer, losses, efficiency, instrument transformers and their earthing)**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Sketches circuit diagram of auto-transformer. 8. Explains principles of operation of auto-transformer. 9. Solves problems on auto-transformers involving voltages, turns and tapping point. 10. Lists losses which occur in transformers. 11. Calculates efficiency of a transformer given load conditions and losses. 12. Explains the need for instrument transformers."
- **MCA Chief Engineer 1.3 assumes line and phase relationships in star and delta**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/chief-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Derives relationships V L = √3 Vph for star and I L = √3 Iph for delta balanced connections using phasor diagrams."
- **MCA Second Engineer 3.1: field patterns and the right-hand grip**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Explains the terms magnetic polarity, magnetic field, magnetic flux, magnetic flux density. 2. States that a current carrying conductor produces a magnetic field. 3. Draws the magnetic field pattern for a straight conductor, loop and a solenoid carrying current. 4. Determines the polarity of fields in 3.1.3 using corkscrew rule, right-hand gripping rule, end rule as appropriate."
- **MCA Second Engineer 3.1: reluctance, permeability, B-H curve**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Explains the term reluctance and states the advantages and disadvantages of leaving air gaps in magnetic circuits. 10. States that S = F/Φ. 11. Explains the terms: 1. absolute permeability; 2. permeability of free space; 3. relative permeability. 12. States that B = μ ο μ r H and explains that μ r is not a constant. 13. Draws the B-H curve for a non magnetic material. 14. Draws the B-H curve for a typical ferromagnetic material. 15. States that different ferromagnetic materials will give different B-H curves."
- **MCA Second Engineer 3.1: composite magnetic circuits with an air gap**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "Solves problems on composite magnetic circuits (to include air gap) and the effect of fringing and leakage."
- **MCA Second Engineer 3.1: Faraday and Lenz, e = N dPhi/dt**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "States Faraday’s law of electromagnetic induction. 24. States Lenz’s Law. 25. States that the magnitude of the emf induced in a coil is determined by: 1. the number of turns; 2. the rate of change of flux cutting the coil and e = NΔΦ/Δtvolts."
- **MCA Second Engineer 3.1: mutual inductance, transformer as the example**
  - Source: Marine Electro-Technology Written Examination Syllabus - GOV.UK. https://www.gov.uk/government/publications/second-engineer-written-examination-syllabuses/marine-electro-technology-written-examination-syllabus
  - Quote: "States that changing magnetic flux emanating from one circuit can induce an emf in another. 35. States that the effect in 3.1.34 is called mutual inductance. 36. Defines the unit of mutual inductance. 37. States that the emf of mutual inductance is given by e = M(Δ i /Δ t ) and M = k√L ₁ L ₂ . 38. States examples of mutual inductance effect eg transformer, engine ignition coil."

My reading: these are the best syllabus lines. The Chief Engineer's 4.2 is almost exactly the scope for lessons 3 to 8: flux
linkage, turns ratio, E = 4.44 f N phi, no-load and loaded phasors (lagging power factor only), three-phase connections,
auto-transformers, losses and efficiency, instrument transformers and why their secondaries are earthed. The Second Engineer's
3.1 is lessons 1 to 3 (field patterns, right-hand grip, reluctance, B-H curve, composite circuits with an air gap, Faraday, Lenz,
e = N dPhi/dt). Neither syllabus lists vector groups by name, inrush, percentage impedance or paralleling; the brief should
say those come from industry guides (section 2) and not from the exam.

---

### 3.3 Public apprenticeship standards (Institute for Apprenticeships / Skills England)
The standards are general. The Engineering technician standard (ST0457) asks for "maritime electrical/electronic engineering
technology and principles" and the mathematics for them, and says bespoke end-point assessment is approved for the Royal Navy
on the maritime electrical fitter option. The Marine electrician standard (ST0808) lists operating principles of electrical
systems and AC power system testing. The Electrical power protection and plant commissioning standard (ST0157) names
transformers in its plant skills.
- **Engineering technician standard: maritime electrical principles**
  - Source: Engineering technician / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0457-v1-2
  - Quote: "understand maritime electrical/electronic engineering technology and principles in the design, equipment build, operation and maintenance of maritime vessels."
- **Engineering technician standard: maritime electrical mathematics**
  - Source: Engineering technician / Skills England. https://skillsengland.education.gov.uk/apprenticeships/st0457-v1-2
  - Quote: "understand the specific mathematical techniques, formula and calculation in a maritime electrical/electronic environment"
- **The Royal Navy has bespoke end-point assessment for the maritime electrical fitter option**
  - Source: Engineering technician / Skills England. https://www.instituteforapprenticeships.org/apprenticeship-standards/engineering-technician-v1-4
  - Quote: "On options 5 - Maritime electrical fitter and 6 - Maritime mechanical fitter, bespoke EPA arrangements have been approved by IfATE for the Royal Navy."
- **Maritime mechanical and electrical mechanic standard covers ships and submarines**
  - Source: Maritime mechanical and electrical mechanic / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0276-v1-0
  - Quote: "Maritime mechanical and electrical mechanics work from engineering drawings, data and documentation in order to undertake the testing, fault diagnosis and maintenance of electrical, mechanical and fluid power equipment on ships and submarines."
- **Marine electrician standard (ST0808): operating principles of electrical systems**
  - Source: End-point assessment plan for Marine Electrician integrated apprenticeship standard. https://skillsengland.education.gov.uk/media/5813/st0808_marine-electrician_l3_ap-for-publication-180122.pdf
  - Quote: "K18: Operation principles of different electrical and electronic systems."
- **Marine electrician standard: mathematics underpinning the work**
  - Source: End-point assessment plan for Marine Electrician integrated apprenticeship standard. https://skillsengland.education.gov.uk/media/5813/st0808_marine-electrician_l3_ap-for-publication-180122.pdf
  - Quote: "K10: The mathematical techniques, formulae, and calculations that underpin marine electrical and electronic work."
- **Marine electrician standard: test AC power systems**
  - Source: End-point assessment plan for Marine Electrician integrated apprenticeship standard. https://skillsengland.education.gov.uk/media/5813/st0808_marine-electrician_l3_ap-for-publication-180122.pdf
  - Quote: "S22 Check, test, and diagnose battery condition and alternating current (ac) power systems and record results."
- **Power protection and commissioning standard names transformers**
  - Source: Electrical power protection and plant commissioning engineer / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0157-v1-0
  - Quote: "undertake testing, commissioning and maintenance activities on electrical power systems and equipment. This could include transformers, switchgear, conductors, battery systems and ancillary equipment"

My reading: none of the standards names a transformer in its knowledge lines; only ST0157 names it, in its plant skills; the Navy-specific content is
not public and is not guessed here. The brief should say that a choice of "transformers and magnetism" for the Level 3 and
Level 4 route is a **guess**, supported by the MCA lines and by the standards' general wording.

---

### 3.4 Pearson BTEC Higher National units
The Higher Nationals cover it in two places. Engineering Science (unit 4003) lists "the principles and applications of
electromagnetic induction, self and mutual induction, solenoid, relay, transformer, motors, and generators". Electrical Machines
(unit 21 in the 2020 specification, 4021 in 2024) has a whole outcome on transformers: construction, step up, step down and
isolating types, three-phase connections, the equivalent circuit (merit) and efficiency (distinction). Unit 5019 turns to
three-phase network problems.
- **Pearson HN Engineering Science: induction, mutual induction, transformer**
  - Source: Unit 4003: Engineering Science I - UniCourse. https://unicourse.org/wp-content/uploads/2024/06/Engineering-Science.pdf (SECONDARY)
  - Quote: "The principles and applications of electromagnetic induction, self and mutual induction, solenoid, relay, transformer, motors, and generators"
- **Pearson HN Engineering Science: merit criterion on electromagnetic induction in devices**
  - Source: Unit 4003: Engineering Science I - UniCourse. https://unicourse.org/wp-content/uploads/2024/06/Engineering-Science.pdf (SECONDARY)
  - Quote: "M4 Explain the principles and applications of electromagnetic induction in at least three electrical devices and machines."
- **Pearson HN Unit 5019 LO2 is three-phase networks**
  - Source: Unit 5019: Further Electrical, Electronic and Digital Principles. https://unicourse.org/wp-content/uploads/2020/04/Further-Electrical-Electronic-and-Digital-Principles.pdf (SECONDARY)
  - Quote: "LO2 Apply appropriate methods to analyse and solve three-phase network problems"
- **Pearson HN Electrical Machines: transformers change the voltage level of an alternating current**
  - Source: HN-ENG-spec Issue 7.pdf. https://unicourse.org/wp-content/uploads/2020/10/U21-Electrical-Machines.pdf (SECONDARY)
  - Quote: "transformers which change the voltage level of an alternating current; motors which convert electrical energy to mechanical energy; and generators which convert mechanical energy to electrical energy."
- **Pearson HN Electrical Machines: construction, application, characteristics and testing of transformers**
  - Source: HN-ENG-spec Issue 7.pdf. https://unicourse.org/wp-content/uploads/2020/10/U21-Electrical-Machines.pdf (SECONDARY)
  - Quote: "Construction, application, characteristics and testing of transformer types such as: step up, step down, and isolating"
- **Pearson HN Electrical Machines: three-phase transformer connections (pass criterion)**
  - Source: HN-ENG-spec Issue 7.pdf. https://unicourse.org/wp-content/uploads/2020/10/U21-Electrical-Machines.pdf (SECONDARY)
  - Quote: "P3 Discuss the different methods of connections available for three-phase transformers"
- **Pearson HN Electrical Machines: equivalent circuit (merit criterion)**
  - Source: HN-ENG-spec Issue 7.pdf. https://unicourse.org/wp-content/uploads/2020/10/U21-Electrical-Machines.pdf (SECONDARY)
  - Quote: "M1 Illustrate the operation of the transformer, considering the equivalent circuit"
- **Pearson HN Electrical Machines: transformer efficiency (distinction criterion)**
  - Source: HN-ENG-spec Issue 7.pdf. https://unicourse.org/wp-content/uploads/2020/10/U21-Electrical-Machines.pdf (SECONDARY)
  - Quote: "D1 Assess the efficiency of a number of available transformers and make a recommendation for an actual operational requirement"
- **Pearson HN Electrical Machines LO1**
  - Source: HN-ENG-spec Issue 7.pdf. https://unicourse.org/wp-content/uploads/2020/10/U21-Electrical-Machines.pdf (SECONDARY)
  - Quote: "Assess the constructional features and applications of transformers"

My reading: the HN is the level of Dan's next qualification. Its merit and distinction criteria (equivalent circuit, efficiency)
set the depth for lessons 5 and 6: not a derivation, but an equivalent circuit he can draw and use.

---

### 3.5 What Dan's qualifications already covered
EAL Level 3: the unit "Understand Intermediate Electrical Science and Principles" has a learning outcome on magnetism,
electricity, generation and supply (attraction and repulsion, flux against flux density, field from a current, force on a
conductor, emf), and a second unit lists transformer types and operating principles: iron loss, copper loss, turns ratio,
step-up and step-down, kVA rating, and the potential, current, isolating and auto types. BTEC Level 3 Unit 56
(Electrical and Electronic Principles in Engineering) stops at capacitance, inductance and single-phase AC. The BTEC
Advanced Manufacturing Engineering pathway also lists optional units on electrical technology, installation, machines,
three-phase and further electrical principles.
- **BTEC Unit 56 stops at capacitance, inductance and single-phase AC**
  - Source: Unit 56: Electrical and Electronic Principles in Engineering. https://qualifications.pearson.com/content/dam/pdf/new-apprenticeships/sales-at-events/Engineering%20and%20Manufacturing/Unit%204%20E&E%20Principles.pdf
  - Quote: "The unit starts by developing and extending learners ’ understanding of fundamental electrical and electronic principles through analysis of simple direct current (DC) circuits. Learners are then taken through the various properties and parameters associated with capacitance and inductance, before finally considering the application of single-phase alternating current (AC) theory."
- **BTEC Advanced Manufacturing Engineering optional units on electrical technology and installation**
  - Source: BTEC Specialist Advanced Manufacturing Engineering Specification - issue 6. https://qualifications.pearson.com/content/dam/pdf/BTEC-Specialist-Qualifications/advanced-manufacturing-engineering-development-technical-knowledge/2016/specification/adv-man-eng-spec.pdf
  - Quote: "28 Electrical Technology 3 60 Internal 29 Electrical Installation"
- **BTEC Advanced Manufacturing Engineering optional units on machines, motors and further principles**
  - Source: BTEC Specialist Advanced Manufacturing Engineering Specification - issue 6. https://qualifications.pearson.com/content/dam/pdf/BTEC-Specialist-Qualifications/advanced-manufacturing-engineering-development-technical-knowledge/2016/specification/adv-man-eng-spec.pdf
  - Quote: "31 Features and Applications of Electrical Machines 3 60 Internal 32 Three-phase Motors and Drives 3 60 Internal 33 Further Electrical Principles"
- **EAL Level 3 unit: magnetism and the magnetic effects of current**
  - Source: EAL Building Services Engineering (Level 3) - Electrotechnical Installation C00/4278/8 Qualification Manual. https://www.skillsforwales.wales/wp-content/uploads/2021/06/Building-Services-Engineering-Electrotechnical-Installation-Qualification-Handbook.pdf (SECONDARY)
  - Quote: "5.1 The effects of magnetism in terms of attraction and repulsion 5.2 The difference between magnetic flux and flux density 5.3 The magnetic effects of electrical currents in terms of: • production of a magnetic field • force on a current carrying conductor in a magnetic field • electromagnetism • electromotive force"
- **EAL Level 3 unit: gives the reasons for AC transmission and distribution**
  - Source: EAL Building Services Engineering (Level 3) - Electrotechnical Installation C00/4278/8 Qualification Manual. https://www.skillsforwales.wales/wp-content/uploads/2021/06/Building-Services-Engineering-Electrotechnical-Installation-Qualification-Handbook.pdf (SECONDARY)
  - Quote: "The reasons for using alternating current transmission and distribution."
- **EAL Level 3 unit: types, operating principles and limitations of transformers**
  - Source: EAL Building Services Engineering (Level 3) - Electrotechnical Installation C00/4278/8 Qualification Manual. https://www.skillsforwales.wales/wp-content/uploads/2021/06/Building-Services-Engineering-Electrotechnical-Installation-Qualification-Handbook.pdf (SECONDARY)
  - Quote: "2.6 Types of transformers 2.7 The operating principles, applications and limitations of transformers Range: iron loss, copper loss, relationship between current and voltage, primary and secondary windings, step-up and step-down transformers, primary and secondary voltages, primary and secondary current, kVA rating"
- **EAL Level 3 unit: kVA rating, losses and operating principles**
  - Source: EAL Building Services Engineering (Level 3) - Electrotechnical Installation C00/4278/8 Qualification Manual. https://www.skillsforwales.wales/wp-content/uploads/2021/06/Building-Services-Engineering-Electrotechnical-Installation-Qualification-Handbook.pdf (SECONDARY)
  - Quote: "Learners will appreciate the kVA rating of a transformer. The limitations of transformers and the types of losses in transformers. Learners will understand the operating principles of transformers including step-up and step-down and isolating. transformers. The primary and secondary windings, and the relationship between current and voltage."
- **EAL Level 3 unit: turns-ratio calculations**
  - Source: EAL Building Services Engineering (Level 3) - Electrotechnical Installation C00/4278/8 Qualification Manual. https://www.skillsforwales.wales/wp-content/uploads/2021/06/Building-Services-Engineering-Electrotechnical-Installation-Qualification-Handbook.pdf (SECONDARY)
  - Quote: "Learners will be able to determine by calculation the primary and secondary voltages, primary and secondary current, and primary and secondary turns, and the turns ratio."
- **EAL Level 3 unit: identify potential, current, isolating and auto transformers**
  - Source: EAL Building Services Engineering (Level 3) - Electrotechnical Installation C00/4278/8 Qualification Manual. https://www.skillsforwales.wales/wp-content/uploads/2021/06/Building-Services-Engineering-Electrotechnical-Installation-Qualification-Handbook.pdf (SECONDARY)
  - Quote: "Learners will be able to identify transformer types such as: potential transformer, current transformer and isolating transformer, and auto transformer."

My reading: Dan has met the transformer as a black box (ratios, kVA, loss names) and the field as a diagram. He has not met
the B-H curve, saturation, the EMF equation, the equivalent circuit, the two tests, regulation, percentage impedance, vector
groups, paralleling or inrush. So lessons 1 and the ratios half of 4 can move fast, and the new ground starts at the core.
**UNCONFIRMED:** which BTEC optional units Dan took, and the knowledge content of his own NVQ (the EAL manual quoted is the
Level 3 Building Services Engineering qualification manual, hosted by Skills for Wales, so SECONDARY for his exact papers).
Nothing from the Navy's courses or from his SMQ books was used.

---


## 4. The scope to cover, and what research says about each part

### 4.1 Magnetic fields from current
The field round a straight conductor, a loop and a coil, found by the right-hand grip; flux and flux density.
- **Khan: the coil produces a field like a bar magnet's**
  - Source: Electromagnetics | High school physics | Science | Khan Academy. https://www.khanacademy.org/science/highschool-physics/x6679aa2c65c01e53:electromagnetics
  - Quote: "Discover how coiling a current-carrying wire around into a loop or solenoid results in a magnetic field that resembles a bar magnet's field."

My reading: research on students (6.1) says they know a current makes a field but cannot say its shape, and keep "thinking
locally". Teach the whole field, as a picture Dan can drag, before any formula. Hughes 6.1 to 6.5 and the MCA lines give the
order. Faster than for a school learner: he has EAL 5.1 to 5.3.

---

### 4.2 Magnetic circuits: mmf, reluctance, B-H, saturation, hysteresis, laminations
Reluctance and mmf as the magnetic "Ohm's law" (Hughes 7.6; MCA S = F/phi). Why cores are laminated silicon steel.
- **Eddy currents dominate loss in soft iron; cores are laminated and alloyed with silicon**
  - Source: 6.685 Electric Machines, Course Notes 3: Eddy Currents, Surface Impedances and Loss Mechanisms. https://ocw.mit.edu/courses/6-685-electric-machines-fall-2013/73ce73e3a02b085d00df37882e7636fe_MIT6_685F13_chapter3.pdf
  - Quote: "In fact, for almost all applications involving “soft” iron, eddy currents are the dominant source of loss. To reduce the eddy current loss, magnetic circuits of transformers and electric machines are almost invariably laminated, or made up of relatively thin sheets of steel. To further reduce losses the steel is alloyed with elements (often silicon) which poison the electrical conductivity."
- **Silicon steel has higher resistivity, so less eddy current loss**
  - Source: Core Loss Datasheet - 3 percent.indd. https://netl.doe.gov/sites/default/files/netl-file/Core-Loss-Datasheet---3-percent%5B1%5D.pdf
  - Quote: "It has a silicon content up to 3.2 mass %, which increases the electrical resistivity and reduces eddy current losses."
- **OpenStax: laminated ferromagnetic core minimises eddy currents and confines the field**
  - Source: 23.7 Transformers - College Physics | OpenStax. https://openstax.org/books/college-physics/pages/23-7-transformers
  - Quote: "A typical construction of a simple transformer has two coils wound on a ferromagnetic core that is laminated to minimize eddy currents. The magnetic field created by the primary is mostly confined to and increased by the core, which transmits it to the secondary coil."
- **Core losses (hysteresis and eddy current) are no-load losses; winding I squared R is load loss**
  - Source: Transformer Efficiency and Losses. https://www.monolithicpower.com/en/learning/mpscholar/ac-power/transformers/transformer-efficiency-and-losses (SECONDARY)
  - Quote: "Losses that occur in the core due to hysteresis and eddy current are examples of no-load losses. I ² R loss in the windings can be considered the primary component of load losses."
- **Eaton: flux density follows the hysteresis loop**
  - Source: Eaton | Understanding transformer inrush current. https://www.eaton.com/us/en-us/products/low-voltage-power-distribution-control-systems/switchboards/protecting-step-up-transformers/understanding-transformer-inrush-current.html
  - Quote: "In the chart below, the flux density (B) of a transformer in operation follows the hysteresis loop."

My reading: the electrical analogy (mmf as emf, flux as current, reluctance as resistance) is Hughes' own and a good bridge for
Dan. Saturation is the idea he lacks and the one inrush, CT open circuit and V/f drive limits all need (the Motors course
already shows the flux bar level up to base speed). Hysteresis loss and eddy-current loss are both "no-load losses"; lamination
and silicon alloying are what the manufacturer does about eddy loss. I did not find a clean public statement of the Steinmetz
law, so loss formulas stay out; the loss lesson is qualitative plus the two tests.

---

### 4.3 Faraday, Lenz, E = 4.44 f N phi, and why a transformer needs AC
Induced emf is the rate of change of flux linkage; Lenz's law is conservation of energy; with a sinusoidal flux the rms emf
per turn works out to 4.44 f phi. A constant voltage gives no change of flux and so no secondary.
- **Transformers cannot change DC voltages because they rely on Faraday's law**
  - Source: 23.10: Transformers - Physics LibreTexts. https://phys.libretexts.org/Bookshelves/College_Physics/College_Physics_1e_(OpenStax)/23:_Electromagnetic_Induction_AC_Circuits_and_Electrical_Technologies/23.10:_Transformers (SECONDARY)
  - Quote: "The fact that transformers are based on Faraday’s law of induction makes it clear why we cannot use transformers to change DC voltages."
- **The primary opposes the change in flux (Lenz), hence the minus sign**
  - Source: 23.10: Transformers - Physics LibreTexts. https://phys.libretexts.org/Bookshelves/College_Physics/College_Physics_1e_(OpenStax)/23:_Electromagnetic_Induction_AC_Circuits_and_Electrical_Technologies/23.10:_Transformers (SECONDARY)
  - Quote: "Lenz’s law tells us that the primary coil opposes the change in flux caused by the input voltage"
- **Bitesize: transformers can only work with alternating current**
  - Source: Transformers - Transformers - Higher - AQA - GCSE Physics (Single Science) Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z2wh3k7/revision/1
  - Quote: "Transformers can only work with alternating current."
- **Bitesize: the coils are not electrically connected; the iron core carries the field**
  - Source: Transformers - Transformers - Higher - AQA - GCSE Physics (Single Science) Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z2wh3k7/revision/1
  - Quote: "The coils are not electrically connected. Instead, they are wound around an iron core. This is easily magnetised and can carry magnetic fields from the primary coil to the secondary coil."
- **Lenz's law as conservation of energy**
  - Source: Faraday’s Law of Induction: Lenz’s Law – Introductory Physics for the Health and Life Sciences II. https://openbooks.lib.msu.edu/collegephysics2/chapter/faradays-law-of-induction-lenzs-law-2/
  - Quote: "If the induced current strengthened the change in magnetic flux instead of opposing it, the system could generate increasing amounts of electrical energy without any external work."
- **RMS emf from a sinusoidal flux is the average value times the form factor**
  - Source: EMF Equation of a Transformer - Transformer's Power Equation. https://www.electricaltechnology.org/2012/02/emf-equation-of-transformer.html (SECONDARY)
  - Quote: "If the flux Φ m varies sinusoidally , then RMS value of induced EMF is obtained by multiplying the average value by the form factor."

My reading: the number 4.44 is not a constant to memorise: it is 2 pi divided by the square root of 2 (4.443, computed), the
peak emf over root 2. Show that rule and let the 4.44 be computed. Dan has Calculus (derivatives of sin) and AC circuits lesson 1's
turning coil, so this is a reuse, not new maths. E / f = 4.44 N phi is a useful consequence: for a given voltage, flux rises
when frequency falls, which is the V/f rule in Motors and why a 60 Hz transformer on 50 Hz runs hot (inference;
UNCONFIRMED as a quote).

---

### 4.4 The ideal transformer
Voltage ratio equals turns ratio, current ratio is the inverse, power in equals power out, and impedance moves across by the
turns ratio squared.
- **Bitesize: power in equals power out, Vs Is = Vp Ip**
  - Source: What is a transformer? - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z2yjywx
  - Quote: "Input power = output power V s I s = V p I p"
- **Bitesize: more turns on the secondary steps voltage up**
  - Source: What is a transformer? - BBC Bitesize. https://www.bbc.co.uk/bitesize/articles/z2yjywx
  - Quote: "A step-up transformer, which steps-up voltage, has more turns in the secondary than in the primary."
- **Bitesize: voltage ratio equals turns ratio**
  - Source: Potential difference - Transformers - Higher - AQA - GCSE Physics (Single Science) Revision - AQA - BBC Bitesize. https://www.bbc.co.uk/bitesize/guides/z2wh3k7/revision/2
  - Quote: "The ratio of potential differences on the transformer coils matches the ratio of the numbers of turns on the coils."
- **Reflected impedance is the secondary impedance times the turns ratio squared**
  - Source: 14.4: Transformers - Engineering LibreTexts. https://eng.libretexts.org/Courses/Canada_College/Circuits_and_Devices/14:_Advanced_Topic-_Magnetic_Circuits_and_Transformers/14.04:_Transformers (SECONDARY)
  - Quote: "Thus, the impedance seen by the source is the secondary impedance times the square of the turns ratio. This is called the reflected impedance."
- **Moving an impedance to the primary multiplies by the turns ratio squared; to the secondary divides**
  - Source: Chapter 5. https://pages.mtu.edu/~avsergue/EET2233/Lectures/CHAPTER5.pdf (SECONDARY)
  - Quote: "When we move an impedance from the secondary to the primary side of the transformer we multiply by the turns ratio squared. When moving the impedance from the primary to the secondary, we divide it by the turns ratio squared."

My reading: Bitesize states the school version; the "referred impedance" rule comes from engineering lecture notes and the
LibreTexts text, so SECONDARY. It is what lets lesson 5's equivalent circuit be one circuit. Dan has Complex numbers, so the
impedance is a complex number moved by a real factor: a clean reuse. Example numbers must be computed from the shown rule
(440 V to 115 V is a ratio of 3.83, computed).

---

### 4.5 The real transformer: losses, the equivalent circuit, tests, efficiency
Magnetising current (small, a few per cent of full load), iron loss (constant while energised) and copper loss (rises with
the square of the load), the equivalent circuit, the open-circuit and short-circuit tests, and efficiency with its maximum.
- **The open-circuit test finds the shunt (magnetising) branch**
  - Source: ECE 494 - Lab 2: Power Transformer Open and Short Circuit Tests. https://ecelabs.njit.edu/ece494/lab2.php (SECONDARY)
  - Quote: "The open circuit test is used to determine the values of the shunt branch of the equivalent circuit R p and X p"
- **The short-circuit test finds the series branch**
  - Source: ECE 494 - Lab 2: Power Transformer Open and Short Circuit Tests. https://ecelabs.njit.edu/ece494/lab2.php (SECONDARY)
  - Quote: "The short circuit test is used to determine the values R s and X s of the series branch of the equivalent circuit."
- **Two tests give core and copper losses, then efficiency**
  - Source: Open-Circuit and Short-Circuit Tests in Transformers - Technical Articles. https://eepower.com/technical-articles/open-circuit-and-short-circuit-tests-in-transformers (SECONDARY)
  - Quote: "Two tests (open-circuit and short-circuit) are performed to determine core and copper losses in the transformer."
- **No-load current is a small fraction of full-load current**
  - Source: Short Circuit Test and Open Circuit Test of Transformer. https://www.electricaltechnology.org/2022/02/short-circuit-open-circuit-test-transformer.html (SECONDARY)
  - Quote: "No-load current passes through the primary winding that is very small (2 to 5 percent of full-load current)."
- **Maximum efficiency when copper loss equals core loss**
  - Source: Transformer Losses and Efficiency Calculation | Electrical Academia. https://electricalacademia.com/transformer/transformer-losses-efficiency-calculation (SECONDARY)
  - Quote: "The maximum efficiency of a transformer at a given power factor occurs when the copper losses are equal to the core losses."
- **No-load loss is constant; load loss goes with load squared (DOE)**
  - Source: TRANSFORMER LOSS ENERGY SAVINGS FLEXIBILITY. https://downloads.regulations.gov/EERE-2017-BT-TP-0055-0022/attachment_3.pdf
  - Quote: "Transformers have both a no-load loss, that is present whenever the transformer is energized and is independent of the load level, and a load loss that is related to the transformer loading squared."
- **Half the load means a quarter of the copper loss**
  - Source: Transformer Efficiency Interactive Calculator | FIRGELLI. https://www.firgelliauto.com/blogs/calculators/transformer-efficiency-calculator (SECONDARY)
  - Quote: "If load drops to half, copper losses drop by a factor of four."

My reading: the tests are the reason the equivalent circuit is useful: each isolates one branch (open circuit gives the shunt
branch and iron loss, short circuit the series branch and copper loss at rated current). Maximum efficiency at the load where
copper loss equals iron loss is a short derivation Dan can do with his Calculus course (differentiate the efficiency, or set
the losses equal); the load fraction is the square root of iron loss over full-load copper loss (a computed rule). The Pearson
HN criterion "equivalent circuit" and "efficiency" are the target.

---

### 4.6 Regulation, percentage impedance and fault level
Voltage regulation, why the secondary falls more at lagging power factor, percentage impedance from the short-circuit test,
and the fault level it sets.
- **Voltage regulation: lower is better, and it can be negative**
  - Source: Lesson 10: Transformer Performance and Operation. https://www.engr.siu.edu/staff2/spezia/Web332b/Lecture%20Notes/Lesson%2010_et332b.pdf (SECONDARY)
  - Quote: "Lower values of regulation are better. Indicates that there is less voltage drop across the transformer."
- **Negative regulation is possible**
  - Source: Lesson 10: Transformer Performance and Operation. https://www.engr.siu.edu/staff2/spezia/Web332b/Lecture%20Notes/Lesson%2010_et332b.pdf (SECONDARY)
  - Quote: "Negative regulation is possible."
- **Lower impedance gives better regulation but more fault current**
  - Source: Transformer Impedance: Impact on Fault Current & Voltage. https://www.rexpowermagnetics.com/knowledge-hub/impedance-in-transformers-key-concepts-and-calculations (SECONDARY)
  - Quote: "A transformer with lower impedance may provide better voltage regulation. It may also deliver substantially more current into a downstream fault."
- **Percent impedance defined by the short-circuit test**
  - Source: Transformer Impedance: Impact on Fault Current & Voltage. https://www.rexpowermagnetics.com/knowledge-hub/impedance-in-transformers-key-concepts-and-calculations (SECONDARY)
  - Quote: "Percent impedance, normally shown as %Z, describes the voltage required to circulate rated current through the transformer when one winding is short-circuited."
- **Percentage impedance: percentage of rated primary voltage that drives full-load current into a shorted secondary**
  - Source: Basic short-circuit current calculation | EC&M. https://www.ecmweb.com/basics/article/20897056/basic-short-circuit-current-calculation
  - Quote: "This is the percentage of normal rated primary voltage that must be applied to the transformer to cause full-load rated current to flow in the short-circuited secondary."
- **Worked example: 5% of 480 V is 24 V; fault current 20 times full load**
  - Source: Basic short-circuit current calculation | EC&M. https://www.ecmweb.com/basics/article/20897056/basic-short-circuit-current-calculation
  - Quote: "if a 480V/120V transformer has an impedance of 5%, this means that 5% of 480V, or 24V, applied to its primary will cause rated load current flow in its secondary. If 5% of primary voltage will cause such current, then 100% of primary voltage will cause 20 times (100 divided by 5) full-load-rated secondary current to flow through a solid short circuit on its secondary terminals."
- **Lower impedance means more short-circuit current**
  - Source: Basic short-circuit current calculation | EC&M. https://www.ecmweb.com/basics/article/20897056/basic-short-circuit-current-calculation
  - Quote: "Obviously, then, the lower the impedance of a transformer of a given kVA rating, the higher the amount of short-circuit current it can deliver."

My reading: regulation is the AC circuits idea in a new place: a series impedance in the path, so the volt drop adds to the
secondary voltage as a phasor, and a lagging load puts more of the drop along the voltage (so more fall), while a leading load can make
the drop negative (regulation can be negative, SIU). Percentage impedance has two jobs that pull opposite ways: it limits fault
current (I_fault = I_rated x 100 / Z%, a computed rule; 5% gives 20 times) and it worsens regulation. ABB calls "higher
impedance is always better" a misconception, and that is the trap to teach. I did not find a public source for typical Usc
values beyond Schneider's figure G33; do not print a table without reading it.

---

### 4.7 Three-phase transformers: star and delta, vector groups, paralleling
Winding connections, the clock-number name (Dyn11), the phase shift each gives, and the conditions for paralleling.
- **Parallel conditions, convenient and mandatory**
  - Source: Principles of Transformers in Parallel Connection (1). https://electrical-engineering-portal.com/principles-of-transformers-in-parallel-connection-1 (SECONDARY)
  - Quote: "The convenient conditions are: Same voltage Ratio and Turns Ratio, Same Percentage Impedance, Same KVA Rating, Same Position of Tap changer. The mandatory conditions conditions are: Same Phase Angle Shift, Same Polarity, Same Phase Sequence and Same Frequency."
- **Vector groups 1 to 4 by phase displacement**
  - Source: Principles of Transformers in Parallel Connection (1). https://electrical-engineering-portal.com/principles-of-transformers-in-parallel-connection-1 (SECONDARY)
  - Quote: "Group 1: Zero phase displacement (Yy0, Dd0, Dz0) * Group 2: 180° phase displacement (Yy6, Dd6, Dz6) * Group 3: -30° phase displacement (Yd1, Dy1, Yz1) * Group 4: +30° phase displacement (Yd11, Dy11, Yz11)"
- **The HV winding is the reference; other windings shown in clock hours**
  - Source: Understanding Vector Group of Transformer (part 1). https://electrical-engineering-portal.com/understanding-vector-group-transformer-1 (SECONDARY)
  - Quote: "The vector for the high voltage winding is taken as the reference vector. Displacement of the vectors of other windings from the reference vector, with anticlockwise rotation, is represented by the use of clock hour figure."
- **Star-delta and delta-star give a 30 degree phase shift**
  - Source: What is a Transformer Vector Group?. https://metapowersolutions.com/what-is-a-transformer-vector-group (SECONDARY)
  - Quote: "With different primary and secondary winding configurations (star-delta and delta-star), the secondary voltage waveform is 30o out of phase with the primary waveform, and the condition is called a 30-degree phase shift."
- **A phase displacement mismatch puts about half the system voltage across the paralleling point**
  - Source: Transformer Vector Groups: Clock Notation & Phase Shift. https://www.keentelengineering.com/transformer-vector-groups-clock-notation-phase-shift (SECONDARY)
  - Quote: "A mismatch in phase displacement produces a voltage difference across the paralleling point of the order of half the system voltage, and the result is a fault."
- **Dyn11 and Dyn5 differ by 180 degrees and cannot run together**
  - Source: Vector Groups of Power Transformers Explained. https://taishantransformer.com/vector-groups-of-power-transformers (SECONDARY)
  - Quote: "Example: Dyn11 and Dyn5 cannot operate together because they differ by 180°."
- **Simulation: Dyn1 with Dyn5 gives huge circulating current**
  - Source: Transformer Paralleling | Power System Studies. https://powerprojectsindia.com/transformer-paralleling (SECONDARY)
  - Quote: "From simulation results, huge amount of circulating current flows in this condition."

My reading: the clock figure is the angle between the high-voltage and low-voltage line voltages in twelfths of a turn: Dyn11
puts the LV line voltage 30 degrees ahead of the HV, Dyn1 30 degrees behind, Dyn5 150 degrees behind (computed from the
clock: twelfths of a turn, so Dyn11 and Dyn5 are 180 degrees apart). The sources say the same in their groups (Group 4: +30 for Dyn11). Complex numbers gave Dan the
rotation (multiply by e^(j30)); AC circuits gave him line and phase voltage in star and delta. The paralleling rules split
into convenient (ratio, impedance, rating) and mandatory (phase shift, polarity, phase sequence, frequency): a mismatch of
phase shift gives a voltage across the paralleling point of the order of half the system voltage. The chain is: connections,
shift, which pairs can parallel, what happens if they do not. Dyn11 is a name from the public Schneider and manufacturer
guides; no claim is made about any particular boat.

---

### 4.8 Transformers in service: inrush, instrument transformers, isolating and auto-transformers, 440 V to 115 V
Inrush on energising, current and voltage transformers (and the CT rule), isolating and auto-transformers.
- **ABB: inrush peaks of 8 to 30 times full-load current**
  - Source: ABB Dry-type Transformers. https://new.abb.com/docs/librariesprovider68/default-document-library/data-center-forum-2017/dryabb-data-center-forum-2017---dry_transformers_michael_gogioli.pdf
  - Quote: "This inrush current, which appears as an internal fault to the differential relays , may reach instantaneous peaks of 8 to 30 times the full load current."
- **ABB: inrush depends on residual flux**
  - Source: ABB Dry-type Transformers. https://new.abb.com/docs/librariesprovider68/default-document-library/data-center-forum-2017/dryabb-data-center-forum-2017---dry_transformers_michael_gogioli.pdf
  - Quote: "Prior history (residual flux)"
- **ABB: inrush 10 to 20 times rated on the LV side**
  - Source: Click to add webinar title. https://library.e.abb.com/public/870998cf98bfae3385257bf0004e67dc/Transformer%20protection%20fudamentals.pdf
  - Quote: "LV side: magnitude of inrush current is 10-20 times the rated current"
- **Inrush is due to core saturation**
  - Source: Transformer Inrush. https://www.idc-online.com/technical_references/pdfs/electrical_engineering/Transformer_Inrush.pdf (SECONDARY)
  - Quote: "Transformer inrush currents are predominantly due to saturation of the transformer core"
- **Worst case is switching at voltage zero with residual flux in the core**
  - Source: untitled. https://research.engineering.nyu.edu/power/sites/engineering.nyu.edu.power/files/uploads/Elimination%20of%20Residual%20Flux%20in%20Transformers%20by%20the%20Application%20of%20an%20Alternating%20Polarity%20DC%20Voltage%20Source.pdf
  - Quote: "The magnitude of the inrush currents depends on the phase angle of the applied voltage, winding resistance, the saturation in- ductance (frequently called “air-core inductance”) of the ener- gized winding, and the residual flux in the core."
- **Inrush dissipates within a few cycles**
  - Source: Eaton | Understanding transformer inrush current. https://www.eaton.com/us/en-us/products/low-voltage-power-distribution-control-systems/switchboards/protecting-step-up-transformers/understanding-transformer-inrush-current.html
  - Quote: "The peak inrush current that occurs during transformer energization typically dissipates within a few cycles."
- **Schneider: CTs must never be open-circuited when current may pass through the window**
  - Source: What are Current Transformer (CT) shorting blocks used for? Where can they be found? Are there any hazards of having the CT secondary open-circuited? | Schneider Electric USA. https://www.se.com/us/en/faqs/FA125574
  - Quote: "Current Transformers must never be open-circuited when current may pass through their window."
- **Schneider: thousands of volts measured on an open CT secondary**
  - Source: What are Current Transformer (CT) shorting blocks used for? Where can they be found? Are there any hazards of having the CT secondary open-circuited? | Schneider Electric USA. https://www.se.com/us/en/faqs/FA125574
  - Quote: "As much as 4000V on the secondary has been measured on large core CTs with an open-circuited secondary."
- **Open CT secondary can be lethal and flash over**
  - Source: Secondary Equipment Testing Standard. https://www.tasnetworks.com.au/config/getattachment/af323dd3-5ee7-4d1c-9622-1d5ea9a44dc8/Secondary-Equipment-Testing-Standard.pdf
  - Quote: "DO NOT OPEN CIRCUIT CT SECONDARIES IN SERVICE – When CTs are open circuited in service or during injection testing, the resulting high voltages can be lethal."
- **The open CT secondary voltage is limited only by core saturation**
  - Source: TESTING OF OPEN SECONDARY WINDOW-TYPE CURRENT TRANSFORMERS – TEST PLAN. https://downloads.regulations.gov/NRC-2015-0183-0002/content.pdf
  - Quote: "as long as current is flowing in the primary winding of a CT, an open-circuit in a CT’s secondary can cause high voltages on the secondary"
- **ABB: short-circuit the CT secondary when not in use**
  - Source: — Current and Voltage Instrument Transformers Instruction for Installation, Use and Maintenance. https://library.e.abb.com/public/99e352724fc84692aacbf33af87f55f1/Instruction_Current%20and%20Voltage%20Instrument%20Transformers_1VLM000610%20Rev.27%20en.pdf?x-sign=qzEFjis2sf541%2Bj67Q%2F3eqDJBDJGW8Mf%2B6W1riKn%2B9uB%2F8bWmwYzYR%2BAeITgKloi
  - Quote: "which is not currently in use to prevent secondary voltages which may be hazardous to personnel or damaging to the transformer’s secondary."
- **ABB: never short-circuit a voltage transformer secondary**
  - Source: — Current and Voltage Instrument Transformers Instruction for Installation, Use and Maintenance. https://library.e.abb.com/public/99e352724fc84692aacbf33af87f55f1/Instruction_Current%20and%20Voltage%20Instrument%20Transformers_1VLM000610%20Rev.27%20en.pdf?x-sign=qzEFjis2sf541%2Bj67Q%2F3eqDJBDJGW8Mf%2B6W1riKn%2B9uB%2F8bWmwYzYR%2BAeITgKloi
  - Quote: "Never short-circuit the secondary terminal of a voltage transformer even this is not in use. A secondary short-circuit will cause the unit to overheat and fail in a very short period of time."
- **ASME on IEC 61558: isolating transformer has double or reinforced isolation**
  - Source: Design Protocols Via IEC 61558 for Power Supplies - ASME. https://www.asme.org/topics-resources/content/how-does-iec-61558-impact-the-safety-of-transformers-and-power-supplies
  - Quote: "Isolating transformer: double or reinforced isolation"
- **ASME on IEC 61558: an auto transformer gives no isolation**
  - Source: Design Protocols Via IEC 61558 for Power Supplies - ASME. https://www.asme.org/topics-resources/content/how-does-iec-61558-impact-the-safety-of-transformers-and-power-supplies
  - Quote: "Auto transformer: no isolation"
- **Autotransformer: windings connected; isolation transformer: complete separation**
  - Source: Acme Electric | Acme Electric. https://www.hubbell.com/acmeelectric/en/faq-applications
  - Quote: "An autotransformer is a transformer in which the primary (input) and the secondary (output) are electrically connected to each other. An isolation transformer , also known as an insulating transformer, has complete electrical separation between the primary (input) and the secondary (output)."
- **Autotransformers are economical only when the voltage ratio is near one**
  - Source: Transformer Modelling Guide. https://www.aeso.ca/assets/linkfiles/4040.002-Rev02-Transformer-Modelling-Guide.pdf
  - Quote: "In autotransformers there is no electrical isolation between the primary and secondary windings; therefore, autotransformers become more economical as the ratio of secondary voltage to primary voltage approaches unity."
- **An open CT secondary drives the core into saturation (NRC test report)**
  - Source: Rev 0 to "Evaluation of Open Current Transformer Secondary Voltages On Unit 1 & Unit 2 Computer Input Circuits.". https://www.nrc.gov/docs/ML1715/ML17156B503.pdf
  - Quote: "producing sufficient flux to drive the CT into saturation."

My reading: inrush is saturation (4.2) met in service: the core saturates for a few cycles after energising, how far depends on the point on
the voltage wave and the flux left in the core (NYU), and the sources give 8 to 30 times full-load current (ABB dry-type) and
10 to 20 times on the LV side (ABB). The CT rule: a CT's primary current is set by the circuit it measures, not by its secondary, so the secondary
must be shorted or burdened, and an open secondary at rated primary current gives thousands of volts with no current (NRC test;
Schneider 4000 V). A voltage transformer is the reverse: never short its secondary. 440 V to 115 V: the ratio is 3.83 (computed),
beyond the range where an auto-transformer saves much (it becomes economical near a ratio of one), and an auto-transformer gives no
isolation, which matters on an insulated system. **UNCONFIRMED:** a public source for 115 V specifically; the public marine
sources say 220 V or 110 V from 440 V. 115 V is from Dan's own outline in the project instructions and is the example here.

---

## 5. Prerequisites
What the topic leans on, and who owns it:
- **Prerequisite: EAL covers resistance, inductance, capacitance and impedance before transformers**
  - Source: EAL Building Services Engineering (Level 3) - Electrotechnical Installation C00/4278/8 Qualification Manual. https://www.skillsforwales.wales/wp-content/uploads/2021/06/Building-Services-Engineering-Electrotechnical-Installation-Qualification-Handbook.pdf (SECONDARY)
  - Quote: "2.3 The relationship between resistance, inductance, capacitance, and impedance 2.4 Calculation of electrical quantities in alternating current circuits Range: resistance, inductance, inductive reactance, capacitance, capacitive reactance, and impedance 2.5 Operating principles of electro-mechanical components Range: contactors, relays, and solenoids"

**Dan has, from built courses** (briefs read for what they defer): AC circuits (phasors, X_L = 2 pi f L, the back-emf of a coil,
v = L di/dt, power factor, balanced three-phase in star and delta, line and phase voltage; its Edges say "no transformers"; it hands
transformers to this course); Complex numbers (rotation by multiplying by j, which makes a phase shift a number); Vectors;
Calculus (the derivative of a sine, maximising); Insulated systems (the IT supply and the isolating transformer, whose "magnetics"
it explicitly leaves to this course); Electronics and power electronics (leaves to this course the rectifier's input
transformer, a charger's step-down, and the phase-shifting transformers behind 12 and 18-pulse rectifiers); Motors (flux level to
base speed, saturation in the DC series motor).
**Owed to this course:** an isolating transformer's magnetics; the rectifier input transformer and the phase-shift idea behind
12-pulse; why a charger's lower AC comes from a transformer.
**Taught inline:** flux and flux density, mmf and reluctance, the B-H curve and saturation (the EAL unit stops at flux against
flux density); the EMF equation; per cent and per-unit impedance; the clock notation.
**Not here (deferred, say where it goes):** the alternator, AVR, governor, synchronising and load sharing (Generators and
paralleling, built next); motors and drives; HV earthing and IR/PI testing (HV Subsea Cable Testing and later).

---


## 6. Misconceptions and learning science

### 6.1 Misconceptions from research
The strongest sources are physics education research papers on induction.
- **Students barely understand the basic concepts of electromagnetic induction (Zuza et al)**
  - Source: Addressing students' difficulties with Faraday's law: A guided problem solving approach | Phys. Rev. ST Phys. Educ. Res.. https://link.aps.org/doi/10.1103/PhysRevSTPER.10.010122
  - Quote: "In traditional teaching, the fundamental concepts of electromagnetic induction are usually quickly analyzed, spending most of the time solving problems in a more or less rote manner. However, physics education research has shown that the fundamental concepts of the electromagnetic induction theory are barely understood by students."
- **Zuza et al propose an interactive teaching sequence**
  - Source: Addressing students' difficulties with Faraday's law: A guided problem solving approach | Phys. Rev. ST Phys. Educ. Res.. https://link.aps.org/doi/10.1103/PhysRevSTPER.10.010122
  - Quote: "This article proposes an interactive teaching sequence introducing the topic of electromagnetic induction."
- **Students read 'opposes the change' as 'opposite direction'**
  - Source: journals.aps.org. https://journals.aps.org/prper/pdf/10.1103/PhysRevPhysEducRes.13.010112
  - Quote: "Students often seemed to misinterpret the phrase “ opposes the change ” as “ being in the opposite direction, ” when determining the direction of the induced current or induced magnetic field."
- **Over 20% of first-year students blamed the unchanging field**
  - Source: journals.aps.org. https://journals.aps.org/prper/pdf/10.1103/PhysRevPhysEducRes.13.010112
  - Quote: "found that more than 20% of the first-year university students explained induced current or emf as being due to the presence of the (unchanging) magnetic field in that area or space."
- **Students confuse magnetic flux with magnetic field**
  - Source: journals.aps.org. https://journals.aps.org/prper/pdf/10.1103/PhysRevPhysEducRes.13.010112
  - Quote: "Magnetic flux seems to be a difficult concept that students tend to confuse with the magnetic field."
- **Listed difficulty: magnetic flux identified with magnetic field**
  - Source: journals.aps.org. https://journals.aps.org/prper/pdf/10.1103/PhysRevPhysEducRes.13.010112
  - Quote: "flux and identifying magnetic flux with the magnetic field;"
- **Students struggle to see induced emf when no current flows**
  - Source: journals.aps.org. https://journals.aps.org/prper/pdf/10.1103/PhysRevPhysEducRes.13.010112
  - Quote: "Students were found also to have difficulties recognizing the induced emf when there was no induced current"
- **Misconception: the core stores and carries the energy**
  - Source: [1107.2684] Coils and transformers - often used but seldomly explained correctly. https://arxiv.org/abs/1107.2684
  - Quote: "(4) The cores of coils and transformers are used for their ability to store energy. Energy is transported from the primary to the secondary coil within the magnetic core."
- **Misconceptions: load current saturates; more primary turns means more flux**
  - Source: [1107.2684] Coils and transformers - often used but seldomly explained correctly. https://arxiv.org/abs/1107.2684
  - Quote: "(6) The higher the load current, the easier a transformer goes into saturation. > (7) The higher the number of turns at the primary coil, the larger the magnetic flux in the core."

My reading, by skill. **Field from a current:** students know a current makes a field but cannot describe its shape and reason
locally (PRPER 2017), so teach the whole picture. **Flux:** flux is confused with field, and the cause of induction is taken to be
the field, not its change (20% of first-year students in one study; "difficulty recognizing the induced emf when there was no induced
current"). So make flux a quantity Dan sets and sees (the number of lines through the coil) and make the change the control.
**Lenz:** "opposes the change" is read as "opposite direction", and the law takes many reasoning steps (PRPER 2017); show it as
conservation of energy and as a prediction task. **Transformers:** the Lenz and Schmidt paper lists real textbook errors: the core
stores and carries the energy (the paper marks this wrong; I did not see its full correction, so the correction is **UNCONFIRMED**), higher load current saturates the core (it does not;
the flux is set by voltage, frequency and turns), more primary turns means more flux (the opposite: more turns, less flux for the same
volts, from E = 4.44 f N phi). These are the misconceptions an electrician is most likely to carry from textbooks.

---

### 6.2 Misconceptions from examiners and manufacturers
No AQA or OCR A-level examiner report on transformers was found; the GCSE and IGCSE reports and a manufacturer are the evidence.
- **OCR examiners: candidates think step-down transformers decrease the current**
  - Source: GCSE (9-1) Gateway Science Physics A - J249/04 - Summer 2024. https://www.ocr.org.uk/Images/727454-examiners-report-paper-4.pdf
  - Quote: "Lower-achieving candidates demonstrated less knowledge of both the use of each type of transformer (often thinking that step-down transformers decreased the current), and the reason for its use."
- **Edexcel examiners: effects of transformer efficiency were often confused**
  - Source: Exam Materials. https://qualifications.pearson.com/content/dam/pdf/International%20GCSE/Physics/2011/Exam%20materials/4PH0_2P_pef_20160303.pdf
  - Quote: "The factors which allow the cables and transformers to increase their efficiency (MP6 and MP7) were rarely included in answers and if they were the effects were often confused."

My reading: OCR's report says lower-achieving candidates think a step-down transformer decreases the current (it raises it); Edexcel's
says efficiency effects were "often confused"; ABB names "higher impedance is always better" as a misconception. BBC Bitesize's
"Key fact" (transformers only work with ac) is the school rule; the brief should add the reason (4.3). No named Bitesize "common
mistake" was found. NCTM does not apply to this topic.

---

### 6.3 Learning science for this topic
Three sources for the method: testing beats restudying on delayed tests though restudying feels better; a review of 31 studies of
PhET simulations on conceptual understanding; the PhET Faraday lab's own learning goals.
- **Testing beats restudying on delayed tests, though restudying feels better**
  - Source: Test-enhanced learning: taking memory tests improves long-term retention - PubMed. https://pubmed.ncbi.nlm.nih.gov/16507066
  - Quote: "on the delayed tests, prior testing produced substantially greater retention than studying, even though repeated studying increased students' confidence in their ability to remember the material."
- **A review of 31 studies of PhET simulations and conceptual understanding**
  - Source: Effect of integrating physics education technology simulations on students' conceptual understanding in physics: A review of literature | Phys. Rev. Phys. Educ. Res.. https://journals.aps.org/prper/abstract/10.1103/PhysRevPhysEducRes.17.023108
  - Quote: "This paper describes a comprehensive review of 31 quasi or experimental research studies from the past decade on the effect of PhET simulations on students’ conceptual understanding of physics."
- **PhET Faraday's law lab: predict how the induced current will change**
  - Source: Simulations | PhET Simulations. https://phet.colorado.edu/en/simulations/faraday
  - Quote: "Predict how the induced current will change when the experimental conditions are varied."

My reading: the PhET sim's goals ("Predict how the induced current will change when the experimental conditions are varied") are the
predict-then-play pattern the project already uses. The retrieval evidence is general (reading passages), not specific to
transformers. No source on worked examples was found for this topic, so none is cited.

---

## 7. Where it is used by an electrician going into marine engineering
Each of these was found on a reachable page. They are public and general; none is a statement of how the Royal Navy or a boat
does it.
- **Ship lighting supplies are stepped down from 440 V by transformers**
  - Source: Ship Electrical System Maintenance: Generator & Safety Guide. https://marineinspection.app/blog/ship-electrical-system-maintenance-generator-switchboard-motor (SECONDARY)
  - Quote: "Most commercial vessels operate at 440V three-phase 60Hz, stepped down via transformers to 220V or 110V for lighting and low-power signal equipment."
- **Step-down transformers feed bridge equipment, navigation lights and radio**
  - Source: How Is Power Generated And Supplied On A Ship. https://www.amnautical.com/blogs/the-mariners-blog/how-is-power-generated-and-supplied-on-a-ship (SECONDARY)
  - Quote: "Step-down transformers reduce 440V to 220V for bridge equipment, navigation lights, and radio communications."
- **A transformer secondary can be a separate system: IEEE 45**
  - Source: IEEE Std 45-2002 IEEE Recommended Practice for Electrical Installations on Shipboard. https://imlive.s3.amazonaws.com/Federal%20Government/ID124552272918263419272917492654902250151/IEEE.pdf (SECONDARY)
  - Quote: "power or lighting distribution systems that are isolated from the ship service or emergency power and lighting system by transformers, motor-generators, or other devices."
- **IEEE 45: CT secondaries are not fused and go through shorting blocks**
  - Source: IEEE Std 45-2002 IEEE Recommended Practice for Electrical Installations on Shipboard. https://imlive.s3.amazonaws.com/Federal%20Government/ID124552272918263419272917492654902250151/IEEE.pdf (SECONDARY)
  - Quote: "Current transformer (CT) secondary windings shall not be fused. The secondary leads of current transformers shall be wired through current transformer shorting terminal blocks prior to connecting to components or terminal blocks."
- **IEEE 45: voltage transformers keep instrument panels to 240 V**
  - Source: IEEE Std 45-2002 IEEE Recommended Practice for Electrical Installations on Shipboard. https://imlive.s3.amazonaws.com/Federal%20Government/ID124552272918263419272917492654902250151/IEEE.pdf (SECONDARY)
  - Quote: "Potential (voltage) transformers should be used as necessary to ensure a maximum voltage of 240 V on hinged instrument panels."
- **US rule: at least two independent ship's service transformers**
  - Source: 46 CFR 111.10-9 - Ship's service supply transformers; two required.. https://www.govinfo.gov/app/details/CFR-1999-title46-vol4/CFR-1999-title46-vol4-sec111-10-9
  - Quote: "there must be at least two installed, independent power transformers. With the largest transformer out of service, the capacity of the remaining units must be sufficient to supply the ship service loads."
- **IMO shore power: a transformer is part of the ship-side installation**
  - Source: Shore power: GreenVoyage2050 – International Maritime Organization. https://greenvoyage2050.imo.org/technology/shore-power
  - Quote: "On the ship side the following will have to be installed: * Transformer * Power distribution system * Control panel"
- **Wartsila shore power: transformer if the ship grid is low voltage**
  - Source: Shore power solutions for ships | Wärtsilä. https://www.wartsila.com/marine/products/ship-electrification-solutions/shore-power
  - Quote: "The power is often via a transformer (if ship grid is low voltage) connected to the main switchboard"
- **Isolation transformer isolates the vessel from shore power**
  - Source: Isolation Transformer - ASEA Power Systems. https://aseapower.com/product/isolation-transformers
  - Quote: "ASEA’s Isolation Transformer is designed to completely isolate a vessel’s electrical system from shore power, reducing corrosion and improving the performance of on-board equipment."
- **A delta source needs a grounding transformer for high-resistance grounding**
  - Source: Power System Grounding. http://doerry.org/norbert/MarineElectricalPowerSystems/fundamentals/0170/20260204%20Power%20system%20grounding%20presentation.pdf
  - Quote: "A grounding transformer is required if the source is a delta winding."
- **Winding insulation must suit ungrounded systems**
  - Source: Delta and Wye Transformer Connections. https://www.maddox.com/resources/articles/delta-wye-connections
  - Quote: "The winding insulation needs to be insulated for the type of system feeding it. Ungrounded systems require a fully insulated winding."
- **A delta primary isolates the wye secondary from the source**
  - Source: Delta and Wye Transformer Connections. https://www.maddox.com/resources/articles/delta-wye-connections
  - Quote: "The primary Delta winding isolates the secondary Wye from the source feeding the transformer."

My reading: the strongest uses are (1) the step-down from the main 440 V to lighting and small power (several sources, none
naming 115 V); (2) the CT and VT on generator and switchboard metering, with the CT shorting-block rule written into IEEE 45;
(3) a transformer as a way to make a separate system (isolated secondary), which ties to Insulated systems; (4) the delta source
and grounding transformer; (5) shore connection; (6) two independent ship's service transformers so one can fail (a US Coast Guard rule, not a UK one). Hall's
Practical Marine Electrical Knowledge, the usual textbook for the 440 V line, was only reachable on a copy site (pdfcoffee), so it is
**UNCONFIRMED** here.

---

## 8. Size: how many lessons, and which core supports 8
Counts from the benchmarks and syllabi:

Brilliant's Electricity and Magnetism: 9 lessons (all electric, no levels); Brilliant's Circuits: 31 lessons (no magnetism). OpenStax
volume 2: 7 sections each in chapters 11 to 13, 6 in 14, and 15.6. Hughes (10th edition): chapter 6 has 11 sections, chapter 7 has 8,
chapter 34 has 23. MCA Chief Engineer 4.2 has 13 lines; MCA Second Engineer 3.1 has 42. Pearson HN unit 21 has one outcome of four on
transformers.
**Eight lessons are supported**, with a core taken from the Hughes order and the MCA 4.2 lines, in the scope's order: (1) the field
from a current and flux; (2) the magnetic circuit, B-H, saturation, hysteresis and laminations; (3) Faraday, Lenz, E = 4.44 f N phi and
why AC; (4) the ideal transformer and referred impedance; (5) the real transformer: losses, equivalent circuit, the two tests,
efficiency; (6) regulation, percentage impedance and fault level; (7) three-phase transformers: vector groups and paralleling; (8)
in service: inrush, CT and VT, isolating and auto, and 440 V to 115 V. Lessons 1 and the first half of 2 can be quick because Dan has
EAL's magnetism and transformer ratios (3.5). This is a choice for the brief, not a finding.

---
