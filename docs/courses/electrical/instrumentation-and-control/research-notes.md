# Instrumentation and control: research notes

Researched 3 Nov 2026 for the Instrumentation and control course brief (the third course in the Electrical shelf's
Power and machines at sea folder; blurb "How a plant measures itself and keeps itself in line: sensors and the 4-20 mA
loop, control loops and PID, PLC logic, alarms and fail-safe trips."). The brief itself is not written here; these
notes are its evidence. Dan is an electrician and a Royal Navy submariner on the electrical engineering path. He asked
(3 Nov) for whatever is most relevant to his whole path, not only January: a Level 3 marine engineering qualification
next year (general engineering first, then submarine and nuclear propulsion, which this course never teaches), leading
rate engineering qualifications, and electrical work at sea. This course is the largest unbuilt foundation on that
path: every plant system he will meet is measured, controlled, alarmed and tripped by it.

Every finding has its source title, URL and the exact words, copied from a saved tool result by script (the quotes
were not retyped into this file). All of them are listed in `quotes.json` beside this file and were checked with
`node tools/eval/sources.mjs --quotes ... --tools ...` (`failed: 0`). The tool files are in `tools/`.
Findings I could not confirm are marked **UNCONFIRMED**; where only a non-original site said it (a training
provider's copy of a Pearson unit, a trade blog, a lecture-note copy of a textbook, a mapping of an IMO table),
**SECONDARY**. My own readings are marked "My reading" and are not quotes. Mirror and copy sites were avoided.

One limit worth knowing: the research tool's free tier rate-limited me once, and the in-app source checker keeps only
the top of each result, so a few pages I read in full (the Pearson HN Unit 16 text itself, a long PDF) could not be
quoted from the page that holds them. I quote the training provider's workbook of the same unit text instead and
say so.

---

## 1. Benchmark

### 1.1 Brilliant: no course on sensors, feedback or control
Brilliant has no course on this ground. Its science list is Scientific Thinking, Circuits, Digital Circuits and
Quantum Computing. Its technology band is about everyday software and hardware. Three courses sit nearest, so they are
the benchmark for the neighbours, not for this course.

- **Brilliant: its science topics list has Circuits and Digital Circuits and nothing on sensors, feedback or control**
  - Source: Brilliant | Learn Logic: Reasoning, Deduction & More. https://brilliant.org/topics/logic/
  - Quote: "Science: Covered topics * Thinking in Code * Programming with Variables * Thinking in Python * Programming with Functions * Algorithmic Thinking * Computer Science Fundamentals * Introduction to Neural Networks * How AI Works * How Technology Works * Search Engines * Cryptocurrency * Functions in Python * Recursion in Python * Algorithms in Python ... ### Math: Covered topics * Number Theory * Digital Circuits * Probability and Chance * Geometry and Measurement * Real-World Algebra * Vectors * Matrices * Limits * Calculus ... ### Science: Covered topics * Scientific Thinking * Circuits * Digital Circuits * Quantum Computing"
- **Brilliant's Technology band is about everyday software and hardware**
  - Source: Topics | Brilliant | Your Personal Tutor for Math & Coding. https://brilliant.org/courses/
  - Quote: "Deepen your knowledge of how things work"
- **Brilliant's How Technology Works: 15 lessons on algorithms and devices, no sensors or control**
  - Source: Practice How Technology Works | Brilliant. https://brilliant.org/courses/how-computers-work/
  - Quote: "Understand the inner workings of everyday technology from online platforms to computer hardware. 15 Lessons 60 Exercises"
- **Brilliant's Circuits course: 31 lessons**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits
  - Quote: "Explore the physics behind electricity. 31 Lessons 394 Exercises"
- **Brilliant's Circuits levels in order**
  - Source: Practice Circuits | Brilliant. https://brilliant.org/courses/circuits
  - Quote: "Level 1 Circuits Current Loops Short Circuits Choosing Bulbs Splitting Current Level Review Level 2 Current The Path of Least Resistance Bulb Brightness Changing Current Different Bulbs Conserving Current Level Review Level 3 Voltage Voltage Measuring Voltage Voltage Around Paths Branched Voltage Level Review Level 4 Power and Resistance Power and Brightness Deducing Power Resistance Solving for Resistance Level Review Level 5 Circuit Analysis Predicting Current Controlling Current Combining Resistance Dividing Resistance Total Resistance Voltage and Resistance Level 6 Comparing Power Resistance and Brightness Relative Resistance Sharing Amps and Volts Parallel Volt Shares Power and Bulb Pairs Level 7 Analyzing Voltage Subtracting Volts Comparing Points Bulbs with Voltage"
- **Brilliant's Digital Circuits course: 32 lessons**
  - Source: Practice Digital Circuits | Brilliant. https://brilliant.org/courses/digital-circuits/?from_llp=science
  - Quote: "Build simple computers out of logic gates. 32 Lessons 336 Exercises"
- **Brilliant's Digital Circuits levels: logic gates to NAND and NOR**
  - Source: Practice Digital Circuits | Brilliant. https://brilliant.org/courses/digital-circuits/?from_llp=science
  - Quote: "Level 1 Logic Gates AND Gates OR Gates Combining Gates NOT Gates Level Review Level 2 Circuit Design Choosing Components Reversing Outputs Building Circuits Crossing and Connecting Level Review Level 3 Truth Tables Truth Tables Building the Truth Multiple Outputs The Missing Circuits Exclusive OR Equivalent Circuits Level Review Level 4 Binary Addition Bits and Digits Adding Binary Carrying Over Level Review Level 5 Computer Addition A Half Adder Adding Larger Numbers Adding 1s Carrying The Two A Full Adder Combining Adders Level 6 Logical Statements Expressing Logic Logical Statements Combining Statements Building Statements Statements of Truth Level Review Level 7 NAND and NOR NAND Gates Using Only NAND NOR Gates Using NAND and NOR"

My reading: Brilliant's Circuits (31 lessons) teaches current, voltage, resistance and power; its Digital Circuits (32
lessons) teaches gates, truth tables and adders. Neither has a sensor, a feedback loop or a latch that remembers. So
Dan's own built courses (AC circuits, Electronics and power electronics, Motors, Generators) are already ahead of
Brilliant's electrical path, and this course has no Brilliant lesson list to match. The public benchmark below is the
one to use.

### 1.2 The Level 3 benchmark: Pearson BTEC National Engineering, unit 36 (PLCs) and the earlier measurement units
In the part of the current Level 3 National Engineering unit list that I read, no unit is titled instrumentation or
control. The nearest are the 60-hour Programmable Logic Controllers unit (36) and, in the 2010 qualification,
10-credit units on measurement and plant control. A Level 3 learner meets sensors and loops inside those and inside Unit 1, Engineering Principles.

- **Pearson BTEC Level 3 National Unit 36: the unit in brief**
  - Source: Specification - Pearson BTEC Level 3 National Foundation Diploma in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/spec-btec-nat-eng-fdip.pdf
  - Quote: "Learners will apply skills and understanding to develop an industrial Programmable Logic Controller (PLC) system to solve an engineering problem."
- **The Level 3 National Engineering spec lists the PLC unit among 60-hour optional units**
  - Source: Specification - Pearson BTEC Level 3 National Foundation Diploma in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/spec-btec-nat-eng-fdip.pdf
  - Quote: "36 Programmable Logic Controllers 60 O O O O O O O O O O O O O"
- **Earlier Level 3 BTEC (2010) units on the same ground: measurement systems and plant and process control**
  - Source: Pearson BTEC Level 3 in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2010/Specification/9781446934647_BTEC_90c_L3_Eng_Iss4.pdf
  - Quote: "46 Principles and Applications of Engineering Measurement Systems 10 3 47 Industrial Plant and Process Control 10 3"
- **Earlier Level 3 BTEC (2010): Industrial Process Measurement unit, 60 guided learning hours**
  - Source: Unit 24: Industrial Process Measurement | Pearson qualifications. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Mechanical-Engineering/2010/Specification/Unit_24_Industrial_Process_Measurement.pdf
  - Quote: "Unit 24: Industrial Process Measurement Unit code: Y/600/0275"
- **Pearson BTEC National Unit 1: maths and physical science principles for electrical, electronic and mechanical problems**
  - Source: Specification - Pearson BTEC Level 3 National Certificate in Engineering. https://qualifications.pearson.com/content/dam/pdf/BTEC-Nationals/Engineering/2016/specification-and-sample-assessments/btec-nat-eng-cert-spec.pdf
  - Quote: "Learners apply mathematical and physical science principles to solve electrical-, electronic- and mechanical-based engineering problems."

What the Level 3 PLC unit actually lists (read from the same page; its content area A is the features and functions of
PLCs, A3 the internal operation, B the programming skills): inputs and outputs, ladder diagrams, combinational and
sequential logic, timers and counters, number systems, then testing and debugging. The scan (input scan, program scan,
output scan) is named inside A3. See 4.4 for the exact words on the scan and the seal-in.

### 1.3 The Level 4 benchmark: Pearson Higher Nationals Unit 16, Instrumentation and Control Systems
This is the public unit nearest to "a Level 3 instrumentation and control unit" and the one a marine engineering HNC
or HND learner takes. It is an optional 15-credit unit at Level 4 in the HN Engineering suite and in the HNC in
Automation and Control Engineering. Its four learning outcomes, in order, are: identify the instrumentation systems
and devices; investigate process control systems and controllers; analyse the control concepts and technologies;
apply predicted values to ensure stability. The workbook series below follows them, one workbook per outcome.

- **Pearson HN Unit 16 as taught in a workbook series: four workbooks, one per learning outcome **SECONDARY****
  - Source: Pearson BTEC Level 4 HN Engineering Unit 16: Instrumentation and Control Systems, Unit Workbook 1 (UniCourse sample). https://unicourse.org/wp-content/uploads/2020/04/U16-Ready-for-Use-9.pdf
  - Quote: "Pearson BTEC Level 4 Higher Nationals in Engineering (RQF) Unit 16: Instrumentation and Control Systems Unit Workbook 1 in a series of 4 for this unit"
- **Pearson HN Unit 16 LO1: sensors and transducers named **SECONDARY****
  - Source: Pearson BTEC Level 4 HN Engineering Unit 16: Instrumentation and Control Systems, Unit Workbook 1 (UniCourse sample). https://unicourse.org/wp-content/uploads/2020/04/U16-Ready-for-Use-9.pdf
  - Quote: "Sensors and transducers used in instrumentation including resistive, inductive, capacitive, ultrasonic, pressure, semiconductor, thermocouple and optical."
- **Pearson HN Unit 16 LO1: signal terms named **SECONDARY****
  - Source: Pearson BTEC Level 4 HN Engineering Unit 16: Instrumentation and Control Systems, Unit Workbook 1 (UniCourse sample). https://unicourse.org/wp-content/uploads/2020/04/U16-Ready-for-Use-9.pdf
  - Quote: "The importance of instrumentation signal terminology, including accuracy, error, drift, repeatability, reliability, linearity, sensitivity, resolution, range and hysteresis."
- **Pearson HN Unit 16 LO1: conditioning and standard signal ranges **SECONDARY****
  - Source: Pearson BTEC Level 4 HN Engineering Unit 16: Instrumentation and Control Systems, Unit Workbook 1 (UniCourse sample). https://unicourse.org/wp-content/uploads/2020/04/U16-Ready-for-Use-9.pdf
  - Quote: "Conversion and conditioning of signals, including analogue, digital, optical, microprocessor, wireless"
- **Pearson HN Unit 16 LO3: system terms (lags, open and closed loop, feed forward) **SECONDARY****
  - Source: Pearson BTEC Level 4 HN Engineering Unit 16: Instrumentation and Control Systems, Unit Workbook 3 (UniCourse sample). https://unicourse.org/wp-content/uploads/2020/04/U16-WB-3-Ready-for-Use-9.pdf
  - Quote: "Recognise system terminology and concepts, including distance velocity lags, capacity, resistance, static and dynamic gain, stability, feedback types, open and closed loop, feed forward control and control algorithms."
- **Pearson HN Unit 16 LO3: tuning techniques **SECONDARY****
  - Source: Pearson BTEC Level 4 HN Engineering Unit 16: Instrumentation and Control Systems, Unit Workbook 3 (UniCourse sample). https://unicourse.org/wp-content/uploads/2020/04/U16-WB-3-Ready-for-Use-9.pdf
  - Quote: "Investigate system tuning techniques, including Zeigler-Nichols, continuous cycling, reaction curves, decay methods and overshoot tuning."
- **Pearson HN Unit 16 LO3 workbook: the unit's feedback section **SECONDARY****
  - Source: Pearson BTEC Level 4 HN Engineering Unit 16: Instrumentation and Control Systems, Unit Workbook 3 (UniCourse sample). https://unicourse.org/wp-content/uploads/2020/04/U16-WB-3-Ready-for-Use-9.pdf
  - Quote: "Analyse the control concepts used within a process"
- **Where Unit 16 sits in the 2022 HNC Automation and Control Engineering: optional unit bank**
  - Source: Pearson BTEC Higher Nationals in Automation and Control Engineering: specification (Issue 2, June 2026). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/automation-and-control-engineering/2022/specification/9781292441542-btec-hnc-l4-automation-and-control-engineering.pdf
  - Quote: "Optional Unit 4006: Mechatronics* 15 4 Optional Unit 4016: Instrumentation and Control Systems 15 4"
- **In the same HNC the PLC unit is the mandatory specialist unit**
  - Source: Pearson BTEC Higher Nationals in Automation and Control Engineering: specification (Issue 2, June 2026). https://qualifications.pearson.com/content/dam/pdf/BTEC-Higher-Nationals/automation-and-control-engineering/2022/specification/9781292441542-btec-hnc-l4-automation-and-control-engineering.pdf
  - Quote: "Unit 4015: Automation, Robotics and Programmable Logic Controllers (PLCs) 15 4"
- **A college HNC in Instrumentation and Control Engineering: its eight modules**
  - Source: HNC INSTRUMENTATION & CONTROL ENGINEERING | Hartlepool College of Further Education. https://www.hartlepoolfe.ac.uk/courses/explore/hnc-instrumentation-%26-control-engineering
  - Quote: "Learners studying for an HNC in Instrumentation & Control Engineering will complete the following modules: Part One * Engineering Science * Engineering Mathematics * Programmable Logic Controllers * Applications of Pneumatics & Hydraulics Part Two * Engineering Design * Managing a Professional Engineering Project * Control System Principles * Electrical & Electronic Principles"

**SECONDARY** note: UniCourse is a training provider and these are its sample workbooks quoting the Pearson text;
the specification itself (Issue 5, October 2017, Unit 16, about pages 170 to 175, read in a college's copy, saved in
`tools/12-web_fetch.json` and `tools/40-web_fetch.json`) says the same, but the page is longer than the checker keeps,
so its lines are quoted here from the workbooks. Its introduction calls instrumentation and control "measurement
automation" in the sense of the safe control of processes from power stations to a car's cruise control (a
paraphrase, not a quote).

The college route: an HNC named Instrumentation & Control Engineering runs eight modules: Engineering Science,
Engineering Mathematics, Programmable Logic Controllers, Applications of Pneumatics & Hydraulics, Engineering
Design, Managing a Professional Engineering Project, Control System Principles, and Electrical & Electronic
Principles. Control sits beside PLCs, not inside them.

### 1.4 A second Level 4 benchmark: SQA's HN unit, with hours
- **SQA HN unit: seven outcomes**
  - Source: J6D0 47 Instrumentation and Control Measurement Systems. https://www.sqa.org.uk/files_ccc/j6d0-47-instrumentation-and-control-measurement-systems.pdf
  - Quote: "Learners who complete this unit can: 1. demonstrate knowledge and understanding of pressure measurement systems 2. demonstrate knowledge and understanding of level measurement systems 3. demonstrate knowledge and understanding of temperature measurement systems 4. demonstrate knowledge and understanding of flow measurement systems 5. demonstrate knowledge and understanding of process analysers and fire and gas detectors 6. demonstrate knowledge and understanding of industrial actuators 7. demonstrate knowledge and understanding of complex control systems"
- **SQA HN unit: PID is delivered last because it builds on the rest**
  - Source: J6D0 47 Instrumentation and Control Measurement Systems. https://www.sqa.org.uk/files_ccc/j6d0-47-instrumentation-and-control-measurement-systems.pdf
  - Quote: "We suggest you deliver outcome 7 last, as it builds on knowledge from earlier outcomes."
- **SQA HN unit: about 17 hours an outcome**
  - Source: J6D0 47 Instrumentation and Control Measurement Systems. https://www.sqa.org.uk/files_ccc/j6d0-47-instrumentation-and-control-measurement-systems.pdf
  - Quote: "we suggest you spend approximately 17 hours on each outcome, including assessment."
- **SQA HN unit: 120 notional hours**
  - Source: J6D0 47 Instrumentation and Control Measurement Systems. https://www.sqa.org.uk/files_ccc/j6d0-47-instrumentation-and-control-measurement-systems.pdf
  - Quote: "the notional design length is 120 hours."
- **SQA HN unit: the PID control parameters taught**
  - Source: J6D0 47 Instrumentation and Control Measurement Systems. https://www.sqa.org.uk/files_ccc/j6d0-47-instrumentation-and-control-measurement-systems.pdf
  - Quote: "Demonstrate knowledge and understanding of the PID control parameters ### including gain, integral action time (IAT) and derivative action time (DAT)."

### 1.5 The lesson list a benchmark gives, in one line
Measurement first (pressure, level, temperature, flow, or a general measurement chain), then actuators, then the
control loop, with PID last because it builds on the rest (SQA's own advice, 1.4). Pearson's Unit 16 puts it the same
way: instrumentation, signal terms and conditioning, process control and its terms, system concepts and tuning, then
stability by simulation. PLCs are a separate unit in every route (Unit 15 or 36 at Level 3 and 4; Unit 42 further).

---

## 2. Other courses' order for the same ground

### 2.1 Degree and open-course orders (to see the shape, not the depth)
- **Edinburgh Control and Instrumentation Engineering: instrumentation comes first**
  - Source: Course Catalogue - Control and Instrumentation Engineering (SCEE09002). https://www.drps.ed.ac.uk/26-27/dpt/cxscee09002.htm
  - Quote: "Instrumentation (3 lectures): main types of transducers including flow, pressure, temperature, position, force, velocity and acceleration transducers; signal conditioning and interfacing."
- **Edinburgh: then models of dynamic systems, open and closed loop**
  - Source: Course Catalogue - Control and Instrumentation Engineering (SCEE09002). https://www.drps.ed.ac.uk/26-27/dpt/cxscee09002.htm
  - Quote: "Mathematical Models of Dynamic Systems (5 lectures): open and closed-loop systems; static and dynamic response; modelling of linear systems; linearisation; Laplace transform; transfer functions;"
- **MIT 10.450: single-loop feedback is the first aim**
  - Source: Syllabus | Process Dynamics, Operations, and Control | Chemical Engineering | MIT OpenCourseWare. https://ocw.mit.edu/courses/10-450-process-dynamics-operations-and-control-spring-2006/pages/syllabus/
  - Quote: "Single-loop feedback control of processes - concepts, terminology, methods, and performance"
- **MIT 10.450: hardware named**
  - Source: Syllabus | Process Dynamics, Operations, and Control | Chemical Engineering | MIT OpenCourseWare. https://ocw.mit.edu/courses/10-450-process-dynamics-operations-and-control-spring-2006/pages/syllabus/
  - Quote: "An overview of sensors, valves, transducers, controllers - both hardware and performance considerations"
- **Astrom and Hagglund: the set point and the control error**
  - Source: PID Control. https://www.isa.org/getmedia/fb0e41bc-e4f3-422a-9f67-b9bd31340e16/Advanced-PID-Control_AstromHagglund_Chapter1-Introduction.pdf
  - Quote: "The desired value of the process variable is called the set point (SP) or the reference value. It is denoted by ysp . The control error e is the difference between the set point and the process variable, i.e., e = ysp − y ."

My reading: the two course lists (Edinburgh, MIT) go measurement, then the dynamic model of the plant, then feedback,
then the PID controller.
Dan does not need Laplace transforms, transfer functions or Bode plots (the degree courses lean on them), and the
course must not claim he does. What he needs from this order is the picture of a loop and the feel of P, I and D,
which Differential equations and Exponentials and logarithms already support (section 5).

### 2.2 Lesson 1: the measurement chain, terms, calibration
These are the plain definitions, in the standards bodies' and a university's wording.

- **McMaster instrumentation glossary: accuracy**
  - Source: 5.0 Terminology. http://www.pc-education.mcmaster.ca/Instrumentation/terminology.htm
  - Quote: "Degree of conformance of a value to a recognized, accepted standard value."
- **McMaster glossary: span**
  - Source: 5.0 Terminology. http://www.pc-education.mcmaster.ca/Instrumentation/terminology.htm
  - Quote: "The difference between the upper and lower limits of range."
- **McMaster glossary: span and range**
  - Source: 5.0 Terminology. http://www.pc-education.mcmaster.ca/Instrumentation/terminology.htm
  - Quote: "The region within which a value is measured, received or transmitted, expressed as lower and upper range values."
- **McMaster glossary: dead band**
  - Source: 5.0 Terminology. http://www.pc-education.mcmaster.ca/Instrumentation/terminology.htm
  - Quote: "The range through which an input can be varied, upon reversal of direction, without causing an effect in the output signal."
- **McMaster glossary: hysteresis**
  - Source: 5.0 Terminology. http://www.pc-education.mcmaster.ca/Instrumentation/terminology.htm
  - Quote: "The property that the output depends on the history of the input and current direction of change."
- **McMaster glossary: repeatability**
  - Source: 5.0 Terminology. http://www.pc-education.mcmaster.ca/Instrumentation/terminology.htm
  - Quote: "The closeness of agreement among consecutive measurements of the output for the same value of the input under the same operating conditions and approaching from the same direction. It is usually reported as non-repeatability in percent of span and does not include hysteresis."
- **McMaster glossary: response time**
  - Source: 5.0 Terminology. http://www.pc-education.mcmaster.ca/Instrumentation/terminology.htm
  - Quote: "Time required for an output to reach a specified percentage of its final value as a result of a step change in input."
- **ISA: span defined**
  - Source: CALIBRATION PRINCIPLES - International Society of Automation. https://www.isa.org/getmedia/a9356c34-5956-4952-9888-d6df8dd3e7ba/calabration-principles-chapter1.pdf
  - Quote: "Span is defined as the algebraic difference between the upper and lower range values."
- **ISA: zero adjustment shifts the line, span adjustment changes the slope**
  - Source: CALIBRATION PRINCIPLES - International Society of Automation. https://www.isa.org/getmedia/a9356c34-5956-4952-9888-d6df8dd3e7ba/calabration-principles-chapter1.pdf
  - Quote: "The zero adjustment is used to produce a parallel shift of the input-output curve. The span adjustment is used to change the slope of the input-output curve."
- **ISA: instrument range versus calibration range, with the 4 to 20 mA output**
  - Source: CALIBRATION PRINCIPLES - International Society of Automation. https://www.isa.org/getmedia/a9356c34-5956-4952-9888-d6df8dd3e7ba/calabration-principles-chapter1.pdf
  - Quote: "the engineer has determined the instrument will be calibrated for 0-to-300 psig = 4-to-20 mA"

My reading for lesson 1: the chain is sensor, transmitter, signal, display and controller; the numbers on it are range
(lower and upper range values), span, accuracy, resolution, repeatability and error; and the check is zero and span.
A zero error shifts the whole line up or down; a span error changes its slope. Both are things Dan can see on a
graph he already draws (Straight-line graphs). The standard 0-300 psig = 4-20 mA example (above) is a clean worked
case.

### 2.3 Lesson 2: temperature (PT100, thermocouple)
- **Texas Instruments: a PT100 is 100 ohms at 0 C**
  - Source: A Basic Guide to RTD Measurements (Rev. A). https://www.ti.com/lit/pdf/sbaa275
  - Quote: "For a PT100 RTD, R0 is 100 Ω."
- **Texas Instruments: IEC 60751 defines the PT100 curve coefficients**
  - Source: A Basic Guide to RTD Measurements (Rev. A). https://www.ti.com/lit/pdf/sbaa275
  - Quote: "The coefficients in the Callendar-Van Dusen equations are defined by the IEC-60751 standard."
- **Atlas of Engineering: a Pt100 rises about 0.385 ohm per degree (SECONDARY, an exercise page) **SECONDARY****
  - Source: Thermocouple, RTD and Temperature Sensor Exercises | Atlas. https://atlasofengineering.com/engineering-physics/thermocouple-rtd-and-temperature-sensor-exercises/
  - Quote: "Pt100 resistance should rise by about 0.385"
- **Texas Instruments: two-wire lead resistance cannot be separated**
  - Source: A Basic Guide to RTD Measurements (Rev. A). https://www.ti.com/lit/an/sbaa275a/sbaa275a.pdf?ref_url=https%253A%252F%252Fwww.google.com%252F&ts=1789313596252
  - Quote: "In the two-wire configuration, the RTD is connected through two wires connected to either end of the RTD. In this configuration, the lead wire resistances cannot be separated from the RTD resistance, adding an error that cannot be separated from the RTD measurement."
- **Atlas of Engineering: two-wire RTD **SECONDARY****
  - Source: Thermocouple, RTD and Temperature Sensor Exercises | Atlas. https://atlasofengineering.com/engineering-physics/thermocouple-rtd-and-temperature-sensor-exercises/
  - Quote: "Two-wire RTDs are poor for accurate remote measurement unless lead resistance is known and stable."
- **Texas Instruments: three-wire compensation assumes matched leads**
  - Source: A Basic Guide to RTD Measurements (Rev. A). https://www.ti.com/lit/an/sbaa275a/sbaa275a.pdf?ref_url=https%253A%252F%252Fwww.google.com%252F&ts=1789313596252
  - Quote: "In the three-wire configuration, the RTD is connected to a single lead wire on one end and two lead wires on the opposite end. Using different circuit topologies and measurements, lead resistance effects can effectively be cancelled, reducing the error in three-wire RTD measurements. Compensation for lead wire resistance assumes that the lead resistances match."
- **Texas Instruments: four-wire**
  - Source: A Basic Guide to RTD Measurements (Rev. A). https://www.ti.com/lit/an/sbaa275a/sbaa275a.pdf?ref_url=https%253A%252F%252Fwww.google.com%252F&ts=1789313596252
  - Quote: "In the four-wire configuration, two lead wires are connected to either end of the RTD. In this configuration, the RTD resistance may be measured with a four-wire resistive measurement with superior accuracy."
- **Atlas of Engineering: thermocouple against RTD trade-offs **SECONDARY****
  - Source: Thermocouple, RTD and Temperature Sensor Exercises | Atlas. https://atlasofengineering.com/engineering-physics/thermocouple-rtd-and-temperature-sensor-exercises/
  - Quote: "Thermocouples are robust and broad-range, but they depend on cold-junction compensation, polarity, extension wire and thermal-gradient control. RTDs are usually more accurate at moderate temperatures, but lead resistance, excitation current and self-heating can dominate installed error."
- **Fluke: cold junction compensation**
  - Source: What Is Cold Junction Compensation in Thermocouples? | Fluke. https://www.fluke.com/en-my/learn/blog/calibration/what-is-cold-junction-compensation-in-thermocouples
  - Quote: "Cold junction compensation, or reference junction compensation, is the process of adjusting the calculation of a thermocouple’s voltage measurement to properly account for what the voltage would be if the cold junction was at the ice point, 0 °C."
- **Fluke: never use copper as thermocouple extension wire**
  - Source: How to Calibrate a Thermocouple: App Notes Series, 4 of 4 | Fluke. https://www.fluke.com/en-in/learn/blog/temperature-calibration/thermocouple-app-notes-series-part-4
  - Quote: "Never use copper for the extension wire, since errors will result."
- **Eltec: extension cable is the same material as the thermocouple**
  - Source: Compensation T C Extension Cables. https://static.elteccable.be/wp-content/uploads/Compensation_T_C_Extension_cables.pdf
  - Quote: "Thermocouple Extension cables T/C extension cables are connecting cables with conductors made of the same element material as the thermocouple."
- **Eltec: thermocouple cable tolerances follow IEC 60584**
  - Source: Compensation T C Extension Cables. https://static.elteccable.be/wp-content/uploads/Compensation_T_C_Extension_cables.pdf
  - Quote: "Cable temperature and tolerances to IEC 60584 / DIN 43722."
- **Atlas of Engineering: IEC 60584-1 named for thermocouple reference functions (SECONDARY) **SECONDARY****
  - Source: Thermocouple, RTD and Temperature Sensor Exercises | Atlas. https://atlasofengineering.com/engineering-physics/thermocouple-rtd-and-temperature-sensor-exercises/
  - Quote: "for thermocouple ITS-90 EMF reference functions and tolerances"
- **Atlas of Engineering: IEC 60751 named for platinum resistance (SECONDARY) **SECONDARY****
  - Source: Thermocouple, RTD and Temperature Sensor Exercises | Atlas. https://atlasofengineering.com/engineering-physics/thermocouple-rtd-and-temperature-sensor-exercises/
  - Quote: "for industrial platinum-resistance temperature relationships and requirements"

The "about 0.385 ohm per degree" figure: the only page I could quote for it is an exercise page (SECONDARY above, which
uses alpha = 0.00385 per degree Celsius, so a Pt100 at 80 degrees reads 130.8 ohm by the linear screen). Texas
Instruments' note gives R0 = 100 ohm at 0 degrees and says the curve's coefficients come from IEC 60751, but the IEC
60751 table values (138.5 ohm at 100 degrees, and so on) and the IEC 60584 millivolt tables themselves are
**UNCONFIRMED**: those standards are paid, I saw only their titles and what they cover, and I quote no table value
from them. For a course that gives "numbers as controls, computed from a shown rule, or cited constants", the safe
rule is R = 100 x (1 + 0.00385 x T) as a linear screen, labelled as that, with the lead-error sum
(extra ohms divided by 0.385 gives the bias in degrees) as the typed puzzle.
Thermistors and temperature switches: **UNCONFIRMED** (no page I could quote; they are one line in the lesson).

### 2.4 Lesson 3: pressure, level and flow
- **McMaster: the Bourdon tube**
  - Source: 2.3 Pressure Measurement. http://www.pc-education.mcmaster.ca/Instrumentation/pressure.htm
  - Quote: "A bourbon tube is a curved, hollow tube with the process pressure applied to the fluid in the tube."
- **WIKA: gauge pressure**
  - Source: Introduction to Differential Pressure Measurement - WIKA blog. https://blog.wika.com/us/products/pressure-products/introduction-to-differential-pressure-measurement
  - Quote: "The most common type of pressure measurement is gauge pressure , with reference to atmospheric pressure."
- **WIKA: absolute pressure**
  - Source: Introduction to Differential Pressure Measurement - WIKA blog. https://blog.wika.com/us/products/pressure-products/introduction-to-differential-pressure-measurement
  - Quote: "Absolute pressure , with reference to a full vacuum, measures pressure independently of changes in atmospheric pressure."
- **control.com: hydrostatic pressure rho g h in a tank**
  - Source: Alternate Uses for Differential Pressure Measurements - Technical Articles. https://control.com/technical-articles/alternate-uses-for-differential-pressure-measurements
  - Quote: "Hydrostatic pressure is governed by the equation below:"
- **control.com: tank width does not matter**
  - Source: Alternate Uses for Differential Pressure Measurements - Technical Articles. https://control.com/technical-articles/alternate-uses-for-differential-pressure-measurements
  - Quote: "Notice that volume does not enter this equation at all—the hydrostatic pressure is the same at the bottom of a thin, deep tank as it is a very large tank with the same height."
- **WIKA: level in a sealed tank needs a differential reading**
  - Source: Introduction to Differential Pressure Measurement - WIKA blog. https://blog.wika.com/us/products/pressure-products/introduction-to-differential-pressure-measurement
  - Quote: "In an open vessel where nothing is pressurized, a simple pressure gauge is sufficient for calculating the liquid level. But in a sealed tank with liquid and gas phases , the only way to monitor that liquid level is to deduct the low-pressure side (gas or vapor) from the high-pressure side (liquid)."
- **Endress+Hauser: radar level is time of flight**
  - Source: Continuous level measurement in liquids. https://www.uk.endress.com/_storage/asset/7792226/storage/master/file/24418706/download/Level%20eBook.pdf
  - Quote: "Radar level measurement is based on the Time- of-Flight principle"
- **Endress+Hauser: capacitance level**
  - Source: Continuous level measurement in liquids. https://www.uk.endress.com/_storage/asset/7792226/storage/master/file/24418706/download/Level%20eBook.pdf
  - Quote: "The probe and the tank wall form a capacitor where the capacitance is dependent on the amount of product in the tank: an empty tank has a lower capacitance, whilst a filled tank a higher capacitance."
- **Michigan encyclopedia: float level**
  - Source: Level Measurement – Visual Encyclopedia of Chemical Engineering Equipment. https://encyclopedia.che.engin.umich.edu/level-measurement
  - Quote: "Floats can be used to indicate or control the level of a liquid."
- **Processing magazine: DP across a constriction goes as flow squared**
  - Source: Pressure measurement, Part 4: Differential pressure flow measurement | Processing Magazine. https://www.processingmagazine.com/process-control-automation/instrumentation/article/55351400/pressure-measurement-part-4-differential-pressure-flow-measurement
  - Quote: "The pressure difference between the upstream and downstream sides of the constriction is proportional to the square of the flow rate of the fluid."
- **Processing magazine: square root extraction**
  - Source: Pressure measurement, Part 4: Differential pressure flow measurement | Processing Magazine. https://www.processingmagazine.com/process-control-automation/instrumentation/article/55351400/pressure-measurement-part-4-differential-pressure-flow-measurement
  - Quote: "Square root extraction, or square root scaling, is necessary to determine a flow rate using a differential pressure measurement."
- **control.com textbook: a DP gauge doubles flow and reads four times**
  - Source: Flow Measurement from Differential Pressure | Signal Characterization in Control Systems | Textbook. https://control.com/textbook/signal-characterization/flow-measurement-from-differential-pressure
  - Quote: "In other words, it will go from reading 20% to reading 80%, which is definitely not an accurate indication of the flow increase."
- **Atlas of Engineering: a fixed DP error is a big flow error at low flow**
  - Source: Orifice Plate Flow Measurement, Beta Ratio and DP Checks | Atlas. https://atlasofengineering.com/mechanical-engineering/orifice-plate
  - Quote: "That square-root relationship means a fixed absolute differential-pressure error becomes a large relative flow error near the bottom of range."
- **USBR: magnetic flowmeter principle**
  - Source: USBR Water Measurement Manual - Chapter 14 - MEASUREMENTS IN PRESSURE CONDUITS, Section 6. Magnetic Flowmeters. https://www.usbr.gov/tsc/techreferences/mands/wmm/chap14_06.html
  - Quote: "The operation of magnetic flowmeters is based upon the principle that a voltage is induced in an electrical conductor moving through a magnetic field."
- **ifm: magnetic flow meter follows Faraday's law**
  - Source: Measuring principles of ifm flow sensors and flow meters - ifm. https://www.ifm.com/na/en/shared/technologies/flow-sensors/technology/measuring-principles-of-ifm-flow-sensors-and-flow-meters
  - Quote: "The SM type flow meter operates according to Faraday’s law of induction."

Strain-gauge and capacitive pressure transducers: the McMaster page has a one-line principle for each (a wire's
resistance changes with strain; a diaphragm's movement changes a capacitance), but those lines were cut from the part
of the page the checker keeps, so they are **UNCONFIRMED** here (saved page `tools/26-web_search.json`). Turbine
meters: **UNCONFIRMED**. The checks Dan can
compute (p = rho g h, and flow from the square root of differential pressure) are in the pages above.

### 2.5 Lesson 4: the 4-20 mA loop
- **Acromag: live zero lets the loop power a two-wire transmitter**
  - Source: Introduction to the Two-Wire Transmitter and the 4-20mA Current Loop. https://www.acromag.com/wp-content/uploads/2019/08/Acromag_Intro_TwoWire_Transmitters_4_20mA_Current_Loop_904A.pdf
  - Quote: "A “Live Zero” of 4mA also permits the two-wire current loop to power the transmitter, simplifying installation and reducing costs."
- **Acromag: live zero is fail-safe**
  - Source: Introduction to the Two-Wire Transmitter and the 4-20mA Current Loop. https://www.acromag.com/wp-content/uploads/2019/08/Acromag_Intro_TwoWire_Transmitters_4_20mA_Current_Loop_904A.pdf
  - Quote: "The 4mA “Zero-Offset”, “Live Zero”, or “Positive-Zero” is Failsafe."
- **Unitest: a two-wire transmitter takes its power from the loop **SECONDARY****
  - Source: The 4-20 mA Current Loop Explained | Unitest. https://theuniteststandard.com/articles/4-20ma-loop-explained.html
  - Quote: "Two-wire loop-powered transmitters draw their operating power from the 4-20 mA loop itself."
- **BAPI: what a 250 ohm resistor drops at 4, 12 and 20 mA**
  - Source: Designing 4 to 20 mA Current Loops - Application Note - BAPI. https://www.bapihvac.com/application_note/designing-4-to-20-ma-current-loops-application-note
  - Quote: "At 4 mA, a 250Ω resistor drops 1 volt; at 12 mA, a 250-Ohm resistor drops 3 volts and at 20 mA, a 250-Ohm resistor drops 5 volts."
- **Toolgrit: reading the loop as a voltage across 250 ohms **SECONDARY****
  - Source: 4-20 mA Current Loop Guide. https://www.toolgrit.com/guides/4-20-ma-signal-explained
  - Quote: "A reading of 3.00 VDC across a 250-ohm resistor means 12.0 mA."
- **Toolgrit: use the mA range when breaking the loop **SECONDARY****
  - Source: 4-20 mA Current Loop Guide. https://www.toolgrit.com/guides/4-20-ma-signal-explained
  - Quote: "If you must break the loop to insert a milliamp meter in series, use the mA function on your multimeter, not the amp function."
- **Sparky Tools: LRV, URV and the 16 mA span **SECONDARY****
  - Source: 4-20 mA Loop Explained: Scaling, Wiring, Testing. https://sparkytools.net/apprentice/fourth-year/instrumentation-4-20ma
  - Quote: "The transmitter is ranged with a lower range value (LRV, at 4 mA) and upper range value (URV, at 20 mA)."
- **Dreiym: percent of span from loop current **SECONDARY****
  - Source: 4-20 mA Current Loop Explained, With a Live Simulator. https://www.dreiym.com/2026/10/03/4-20-ma-current-loop
  - Quote: "The measured value is then % of span = (I − 4 mA) ÷ 16 mA × 100."
- **EpiSensor: loop headroom worked example **SECONDARY****
  - Source: Commissioning 4-20 mA and 0-10 V monitoring | EpiSensor. https://episensor.com/knowledge-base/analogue-signal-commissioning
  - Quote: "24 V − 10.5 V − 20 mA × 270 Ω = 8.1 V of headroom"
- **EpiSensor: fault limits below 3.6 mA and above 21 mA (NAMUR NE 43) **SECONDARY****
  - Source: Commissioning 4-20 mA and 0-10 V monitoring | EpiSensor. https://episensor.com/knowledge-base/analogue-signal-commissioning
  - Quote: "Treat 3.6 mA or below and 21 mA or above as faults (NAMUR NE 43), and check which way the transmitter is set to fail."
- **EpiSensor: 0-10 V cannot tell a broken wire from zero **SECONDARY****
  - Source: Commissioning 4-20 mA and 0-10 V monitoring | EpiSensor. https://episensor.com/knowledge-base/analogue-signal-commissioning
  - Quote: "Plain 0-10 V cannot tell a broken wire from a zero reading"
- **Sparky Tools: HART in a line **SECONDARY****
  - Source: 4-20 mA Loop Explained: Scaling, Wiring, Testing. https://sparkytools.net/apprentice/fourth-year/instrumentation-4-20ma
  - Quote: "A digital signal superimposed on the 4–20 mA as a small tone, which lets a handheld communicator or the control system read and set the transmitter’s range, units and diagnostics over the same two wires, without disturbing the analog value."
- **Dreiym: opening a running loop **SECONDARY****
  - Source: 4-20 mA Current Loop Explained, With a Live Simulator. https://www.dreiym.com/2026/10/03/4-20-ma-current-loop
  - Quote: "Opening a running loop sends the control system 0 mA, and that can move a valve or trip an interlock."

My reading for lesson 4: the live zero, the 250 ohm resistor (4 mA gives 1 V, 20 mA gives 5 V), scaling by subtracting
4 first, loop headroom (24 V less the transmitter's minimum less 20 mA times the loop resistance) and how to put a
meter in the loop without breaking it. The worked 4-20 mA sums are all straight-line algebra and percentages that
Dan has built (Linear equations, Straight-line graphs, Percentages). 0-10 V is one line (it cannot tell a broken
wire from zero) and HART is one line (a digital signal riding on the loop).

---

## 3. What a marine or naval engineering technician on the electrical path actually uses of this topic

### 3.1 STCW: the Code's competence lines on control systems (Table A-III/1 and A-III/6)
- **STCW A-III/1: PID control characteristics**
  - Source: STCW Table A-III/1. https://weh.maritime.edu/stcw/2018/tables/31.html
  - Quote: "Proportional-Integral-Derivative (PID) control characteristics and associated system devices for process control"
- **STCW A-III/1: control equipment methodologies**
  - Source: STCW Table A-III/1. https://weh.maritime.edu/stcw/2018/tables/31.html
  - Quote: "various automatic control methodologies and characteristics"
- **STCW A-III/1: control systems for machinery items**
  - Source: STCW Table A-III/1. https://weh.maritime.edu/stcw/2018/tables/31.html
  - Quote: "functions, characteristics and features of control systems for machinery items, including main propulsion plant operation control and steam boiler automatic controls"
- **STCW A-III/1: sequential control circuits**
  - Source: STCW Table A-III/1. https://weh.maritime.edu/stcw/2018/tables/31.html
  - Quote: "sequential control circuits and associated system devices"
- **STCW A-III/1: function and performance tests of monitoring, control and protective devices**
  - Source: STCW Table A-III/1. https://weh.maritime.edu/stcw/2018/tables/31.html
  - Quote: "Function and performance tests of the following equipment and their configuration: 1. monitoring systems 2. automatic control devices 3. protective devices"
- **STCW A-III/6 (electro-technical officer): automation and instrumentation lines **SECONDARY****
  - Source: COMPETENCY MAPPING Title Table A – III / 6 STCW Table Specifications of minimum standards of competence for electro-technical officers. https://marina.gov.ph/wp-content/uploads/2020/12/ANNEX-VI-Competency-Mapping-Electro-Technical-Officers_11202020.pdf
  - Quote: "C1.5 Fundamentals of automation, automatic control systems and technology C1.6 Instrumentation, alarm and monitoring systems"
- **STCW A-III/6: the two monitoring competences **SECONDARY****
  - Source: Assessment Guidelines for STCW Code TABLE A-III/6 Electro-Technical Officer. https://downloads.regulations.gov/USCG-2012-0980-0003/attachment_1.pdf
  - Quote: "Monitor the operation of electrical, electronic and control systems; 2. Monitor the operation of automatic control systems of propulsion and auxiliary machinery;"
- **STCW A-III/6: maintenance and repair of automation and control systems **SECONDARY****
  - Source: COMPETENCY MAPPING Title Table A – III / 6 STCW Table Specifications of minimum standards of competence for electro-technical officers. https://marina.gov.ph/wp-content/uploads/2020/12/ANNEX-VI-Competency-Mapping-Electro-Technical-Officers_11202020.pdf
  - Quote: "C9 Maintenance and repair of automation and control systems of main propulsion and auxiliary machinery"

These are Table A-III/1 (officer in charge of an engineering watch, function: electrical, electronic and control
engineering at the operational level) from a maritime academy's copy of the IMO table (SECONDARY: a maritime academy's copy) and Table A-III/6
(electro-technical officer) through two national mappings of it (SECONDARY). The wording is the IMO's. Both name PID
control, automatic control methodologies, sequential control circuits, monitoring systems, automatic control devices
and protective devices, and the A-III/6 lines add "instrumentation, alarm and monitoring systems".

### 3.2 The public apprenticeship standards
- **Same Level 2 standard: employed in the Royal Navy and Merchant Navy**
  - Source: Maritime mechanical and electrical mechanic / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0276-v1-1
  - Quote: "Maritime mechanical and electrical mechanic are employed in the Royal Navy and Merchant Navy."
- **Same Level 2 standard: the work is testing, fault diagnosis and maintenance on ships and submarines**
  - Source: Maritime mechanical and electrical mechanic / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0276-v1-1
  - Quote: "undertake the testing, fault diagnosis and maintenance of electrical, mechanical and fluid power equipment on ships and submarines."
- **Skills England, Maritime mechanical and electrical mechanic (Level 2, Royal Navy and Merchant Navy): what the work includes**
  - Source: Maritime mechanical and electrical mechanic / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0276-v1-1
  - Quote: "This can include propulsion machinery, weapons, sensors, reactors and auxiliary systems (such as water, air conditioning, electronic equipment including programmable logic controllers, power generation and distribution)."
- **Same standard: daily rounds**
  - Source: Maritime mechanical and electrical mechanic / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0276-v1-1
  - Quote: "They will be responsible for completing daily rounds and checking machinery to ensure the ship remains operational."
- **Skills England, Control and instrumentation engineering maintenance technician (Level 3): the work**
  - Source: Engineering maintenance technician - single discipline - Control and instrumentation engineering maintenance technician / Skills England. https://skillsengland.education.gov.uk/occupations/OCC1426A-v1-0
  - Quote: "Control and instrumentation engineering maintenance technicians' work focuses on the control and instrumentation aspects of plant, equipment and systems. For example, programmable logic controllers, flow meters, heat exchangers and safety controls."
- **Same standard: maintenance duty including calibration**
  - Source: Engineering maintenance technician - single discipline - Control and instrumentation engineering maintenance technician / Skills England. https://skillsengland.education.gov.uk/occupations/OCC1426A-v1-0
  - Quote: "Conduct planned, preventative, and reactive maintenance on control and instrumentation aspects of plant, control and instrumentation equipment, and control systems including calibration."
- **Same standard: fault diagnosis duty**
  - Source: Engineering maintenance technician - single discipline - Control and instrumentation engineering maintenance technician / Skills England. https://skillsengland.education.gov.uk/occupations/OCC1426A-v1-0
  - Quote: "Conduct fault diagnosis and problem solving on control and instrumentation equipment and control systems."
- **Same standard: job titles include Maintenance and operations engineering technician**
  - Source: Engineering maintenance technician - single discipline - Control and instrumentation engineering maintenance technician / Skills England. https://skillsengland.education.gov.uk/occupations/OCC1426A-v1-0
  - Quote: "Control and instrumentation craftsperson Control and instrumentation maintenance technician Control, instrumentation and automation technician Electrical craftsperson Electrical maintenance technician Engineering maintenance technician Engineering technician Maintenance and operations engineering technician"
- **Royal Navy apprenticeship advert (Engineering Technician, Marine Engineering): test and adjust**
  - Source: The Royal Navy - Marine Engineering - Maritime Mechanical & Electrical Mechanic Apprenticeship – Find an apprenticeship – GOV.UK. https://www.findapprenticeship.service.gov.uk/apprenticeship/reference/2000041637
  - Quote: "Undertake testing, inspection and diagnostic activities on components, equipment and systems, making adjustments where applicable"
- **Skills England Marine engineer ST0364 (boats, Level 3): where it applies**
  - Source: Marine engineer / Skills England. https://skillsengland.education.gov.uk/apprenticeship-standards/st0364-v1-0
  - Quote: "Marine engineers work on boats such as yachts, commercial craft and superyachts."

What I found and did not find: the standard that fits Dan's route most closely, in public wording, is the Level 3
"Engineering maintenance technician - single discipline", control and instrumentation option (the occupation page I
read lists its duties, 14 to 18, and the job title "Maintenance and operations engineering technician" is one of its
titles). The list of knowledge and skills (K46 to K60, S38 to S51) loads by script and was not in the page text I got,
so the individual lines are **UNCONFIRMED**. The Royal Navy's own naval engineering technician standard, and the
"Engineering technician (electrical or control and instrumentation)" standard, I did not reach, so they are
**UNCONFIRMED** too. The Marine engineer standard I could read (ST0364) is for boats (yachts, commercial craft,
superyachts), not naval; the Level 2 Maritime mechanical and electrical mechanic standard is the one that names
the Royal Navy and submarines, and its profile mentions reactors and sensors. This course never touches reactor
instrumentation or protection, and says nothing about how the Navy does anything.

### 3.3 The Pearson lines
The Pearson Level 3 and Level 4 lines are in section 1 (1.2 and 1.3). In one sentence: Level 3 asks a learner to
program a PLC and fault-find it (Unit 36, and Unit 1's physical science principles), and Level 4 asks them to name
sensors and signal terms, explain on-off and PID control, and tune a loop (Unit 16).

My reading, where a choice is a guess: Dan has no syllabus for the Navy courses ahead. The public lines above agree on
one core: sensors and signals, the loop, PID, logic and sequence control, and alarms with protective devices. That is
the core I planned against. Where I choose a weight (for instance one lesson on the 4-20 mA loop, because a technician
meets it daily) that is my judgement.

---

## 4. The scope to cover, and what research says about each part

The eight lessons, in order: (1) the measurement chain; (2) temperature; (3) pressure, level and flow; (4) the 4-20 mA
loop; (5) control loops; (6) PID; (7) logic and PLCs; (8) alarms, trips and fail-safe design. Lessons 1 to 4 are
evidenced in 2.2 to 2.5. Lessons 5 to 8 are evidenced here.

### 4.1 Lesson 5: control loops (open and closed, set point, error, on/off, lag and dead time)
- **ASHRAE: no feedback means open loop**
  - Source: CHAPTER 7 FUNDAMENTALS OF CONTROL. https://handbook.ashrae.org/Handbooks/F21/IP/F21_Ch07/F21_Ch07_ip.aspx
  - Quote: "Because there is no feedback on the controlled variable (space temperature), the control is an open loop."
- **Astrom and Hagglund: on-off control oscillates**
  - Source: PID Control. https://www.isa.org/getmedia/fb0e41bc-e4f3-422a-9f67-b9bd31340e16/Advanced-PID-Control_AstromHagglund_Chapter1-Introduction.pdf
  - Quote: "On-off control often succeeds in keeping the process variable close to the set point, but it will typically result in a system where the variables oscillate."
- **Astrom and Hagglund: hysteresis or a dead zone added to on-off control**
  - Source: PID Control. https://www.isa.org/getmedia/fb0e41bc-e4f3-422a-9f67-b9bd31340e16/Advanced-PID-Control_AstromHagglund_Chapter1-Introduction.pdf
  - Quote: "It is common to have some modifications either by introducing hysteresis or a dead zone"
- **ASHRAE: time constant**
  - Source: CHAPTER 7 FUNDAMENTALS OF CONTROL. https://handbook.ashrae.org/Handbooks/F21/IP/F21_Ch07/F21_Ch07_ip.aspx
  - Quote: "The time constant is the unit of measure used to describe first-order lags and is defined as the time it takes for the controlled variable of a first-order, linear system to reach 63.2% of its final value when a step change in the input occurs."
- **ASHRAE: dead time**
  - Source: CHAPTER 7 FUNDAMENTALS OF CONTROL. https://handbook.ashrae.org/Handbooks/F21/IP/F21_Ch07/F21_Ch07_ip.aspx
  - Quote: "Dead time (or time lag) is the time from when a change in the controller output is made to when the controlled variable exhibits a measurable response."
- **ASHRAE: thermostat differential and hysteresis**
  - Source: CHAPTER 7 FUNDAMENTALS OF CONTROL. https://handbook.ashrae.org/Handbooks/F21/IP/F21_Ch07/F21_Ch07_ip.aspx
  - Quote: "The operating differential may be greater because of thermostat lag or hysteresis"

My reading for lesson 5: a feedback loop is "measure, compare, act". The kettle thermostat and the cooling water
temperature loop are the first examples; the generator's governor and AVR (Dan's Generators course, lessons 2 and 4)
are the same loop with names he knows, and this course only points at them, it does not teach them again. A first-order
lag is the exponential he built in Exponentials and logarithms; dead time is a different thing and the loop acts on a
reading that is already old.

### 4.2 Lesson 6: PID (proportional offset, integral and its windup, derivative, tuning)
- **Eurotherm: proportional-only control sits off the setpoint**
  - Source: Principles of PID Control and Tuning | Eurotherm Limited. https://www.eurotherm.com/us/temperature-control-us/principles-of-pid-control-and-tuning
  - Quote: "Proportional only controllers will not, in general, control precisely at setpoint, but with an offset corresponding to the point at which the output power equals the heat loss from the system."
- **Astrom and Hagglund: proportional control deviates from the set point**
  - Source: PID Control. https://www.isa.org/getmedia/fb0e41bc-e4f3-422a-9f67-b9bd31340e16/Advanced-PID-Control_AstromHagglund_Chapter1-Introduction.pdf
  - Quote: "Proportional control has the drawback that the process variable often deviates from the set point."
- **Astrom and Murray: proportional alone never reaches the reference**
  - Source: Astrom and Murray, Feedback Systems, Chapter Ten: PID Control. https://www.cds.caltech.edu/~murray/books/AM08/pdf/am08-pid_04Mar10.pdf
  - Quote: "In the absence of a feedforward term, the output never reaches the reference, and hence we are left with nonzero steady-state error."
- **Astrom and Murray: proportional alone leaves a 50% error, integral removes it**
  - Source: Astrom and Murray, Feedback Systems, Chapter Ten: PID Control. https://www.cds.caltech.edu/~murray/books/AM08/pdf/am08-pid_04Mar10.pdf
  - Quote: "The steady-state error is eliminated when integral gain action is used."
- **Eurotherm: integral removes the offset**
  - Source: Principles of PID Control and Tuning | Eurotherm Limited. https://www.eurotherm.com/us/temperature-control-us/principles-of-pid-control-and-tuning
  - Quote: "The Integral term removes steady state control offsets by ramping the output up or down in proportion to the amplitude and duration of the error signal."
- **Eurotherm: integral time must be longer than the process time constant**
  - Source: Principles of PID Control and Tuning | Eurotherm Limited. https://www.eurotherm.com/us/temperature-control-us/principles-of-pid-control-and-tuning
  - Quote: "The ramp rate (Integral time constant) must be longer than the time constant of the process to avoid oscillations."
- **Astrom and Murray: derivative damps**
  - Source: Astrom and Murray, Feedback Systems, Chapter Ten: PID Control. https://www.cds.caltech.edu/~murray/books/AM08/pdf/am08-pid_04Mar10.pdf
  - Quote: "Figure 10.2c illustrates the effect of derivative action: the system is oscillatory when no derivative action is used, and it becomes more damped as the derivative gain is increased."
- **Eurotherm: derivative against overshoot**
  - Source: Principles of PID Control and Tuning | Eurotherm Limited. https://www.eurotherm.com/us/temperature-control-us/principles-of-pid-control-and-tuning
  - Quote: "The Derivative term is proportional to the rate of change of the temperature or process value. It is used to prevent overshoot and undershoot of the setpoint"
- **Astrom and Murray: derivative amplifies measurement noise**
  - Source: Astrom and Murray, Feedback Systems, Chapter Ten: PID Control. https://www.cds.caltech.edu/~murray/books/AM08/pdf/am08-pid_04Mar10.pdf
  - Quote: "This means that high-frequency measurement noise will generate large variations in the control signal."
- **Zurich Instruments: derivative is often left out because of noise**
  - Source: Principles of PID Controllers | Zurich Instruments. https://www.zhinst.com/en/resources/principles-of-pid-controllers
  - Quote: "In real-world implementations of PIDs, the derivative action is sometimes omitted due to its high sensitivity to the quality of the input signal."
- **Zurich Instruments: too much integral oscillates (windup)**
  - Source: Principles of PID Controllers | Zurich Instruments. https://www.zhinst.com/en/resources/principles-of-pid-controllers
  - Quote: "However, increasing the integral term too much can lead to an oscillating output if too much error is accumulated"
- **Astrom and Murray: windup defined**
  - Source: Astrom and Murray, Feedback Systems, Chapter Ten: PID Control. https://www.cds.caltech.edu/~murray/books/AM08/pdf/am08-pid_04Mar10.pdf
  - Quote: "The control signal will then remain saturated even when the error changes, and it may take a long time before the integrator and the controller output come inside the saturation range. The consequence is that there are large transients. This situation is referred to as _integrator windup"
- **Astrom: windup**
  - Source: Astrom and Hagglund, PID Control (course chapter 6, Caltech CDS 101). https://www.cds.caltech.edu/~murray/courses/cds101/fa02/caltech/astrom-ch6.pdf
  - Quote: "The consequence is that any controller with integral action may give large transients when the actuator saturates."
- **Zurich Instruments: PI is common for slow plant such as an oven**
  - Source: Principles of PID Controllers | Zurich Instruments. https://www.zhinst.com/en/resources/principles-of-pid-controllers
  - Quote: "For instance, the use of a PI controller is common in applications that prioritize steady-state error elimination and stability, rather than fast response times"
- **Astrom and Murray: PID called three-term controllers**
  - Source: Chapter Ten - PID Control. https://www.cds.caltech.edu/~murray/books/AM08/pdf/am08-pid_04Mar10.pdf
  - Quote: "For this reason PID controllers were originally called three-term controllers"

Tuning: the Unit 16 line (1.3) names Ziegler-Nichols, continuous cycling, reaction curves, decay methods and overshoot
tuning. My reading: a live loop with three sliders, tuned by feel, is the teaching device; no recipe is given as the
way any particular plant is tuned, and the ultimate-gain table that the Zurich Instruments note prints is left out.

### 4.3 Lesson 7: logic and PLCs (relay to ladder, the scan, latches, timers, interlocks)
- **Bolton: ladder diagram read left to right, top to bottom **SECONDARY****
  - Source: Ladder and Functional Block Programming - TalTech. https://www.tud.ttu.ee/im/Andres.Rahni/Automaatika%20alused/77511_05_LAD_and_FBD.pdf
  - Quote: "A ladder diagram is read from left to right and from top to bottom."
- **Bolton: outputs are updated together at the end of the scan **SECONDARY****
  - Source: Ladder and Functional Block Programming - TalTech. https://www.tud.ttu.ee/im/Andres.Rahni/Automaatika%20alused/77511_05_LAD_and_FBD.pdf
  - Quote: "program is scanned, the outputs are not updated instantly, but the results stored in memory and all the outputs are updated simultaneously at the end of the program scan"
- **Lecture notes: latching defined **SECONDARY****
  - Source: Programming Logic Controllers (EEE436 lecture notes, Istanbul Technical University). https://web.itu.edu.tr/yalcinme/files/courses/MMG/ch19_1%20PLC.pdf
  - Quote: "The term latching is used for the circuit that able to hold the output energized even though the input which energizing it ceases."
- **PLC Practice: seal-in is the output's own contact in parallel with start **SECONDARY****
  - Source: Start/Stop Seal-In Circuit | PLC Ladder Logic Lesson. https://www.plcpractice.com/learn/core-patterns/start-stop-seal-in
  - Quote: "Seal-in = output's own contact in parallel with START (provides memory)"
- **PLC Practice: the Boolean model of a seal-in **SECONDARY****
  - Source: Start/Stop Seal-In Circuit | PLC Ladder Logic Lesson. https://www.plcpractice.com/learn/core-patterns/start-stop-seal-in
  - Quote: "Boolean model: Output = (START OR Output) AND STOP"
- **PLC Practice: stop buttons are wired normally closed **SECONDARY****
  - Source: Start/Stop Seal-In Circuit | PLC Ladder Logic Lesson. https://www.plcpractice.com/learn/core-patterns/start-stop-seal-in
  - Quote: "In a real control panel, the physical STOP button is usually wired normally closed."
- **Instrumentation Tools: a seal-in start/stop leaves the operator without control after an open wire **SECONDARY****
  - Source: Contacts and Coils in PLC Ladder Logic | PLC Training | PLC Tutorials. https://instrumentationtools.com/plc-ladder-logic-contacts-coils/
  - Quote: "A potential problem with this system as it is designed is that the human operator loses control of the motor in the event of an “open” wiring failure in either pushbutton switch circuit."
- **Contact and Coil: use the overload contact to make a fault that breaks the run rung **SECONDARY****
  - Source: Start/Stop Circuit | Contact and Coil. https://www.contactandcoil.com/patterns-of-ladder-logic-programming/startstop-circuit
  - Quote: "It’s definitely useful to bring the auxiliary contact off the motor overload into the PLC. Use that to create a Fault, use the Fault to break the Run rung, and also report the Fault as an alarm for diagnostics."
- **IMD: relay logic is parallel, PLC logic is scan-based **SECONDARY****
  - Source: Relay Logic vs PLC Logic: Compare Architecture, Scan & | IMD. https://industrialmonitordirect.com/blogs/knowledgebase/relay-logic-vs-plc-logic-engineering-comparison-and-migration
  - Quote: "Relay logic is event-driven and operates in true parallel; PLC logic is scan-based and operates in apparent parallelism bounded by the scan period."
- **IMD: the three scan phases **SECONDARY****
  - Source: Relay Logic vs PLC Logic: Compare Architecture, Scan & | IMD. https://industrialmonitordirect.com/blogs/knowledgebase/relay-logic-vs-plc-logic-engineering-comparison-and-migration
  - Quote: "Input scan - read physical inputs into process image input table (PII) 2. Program execution - execute user logic top to bottom using current PII and process image output (PIQ)"
- **IMD: the common relay-to-ladder mistake **SECONDARY****
  - Source: Relay Logic vs PLC Logic: Compare Architecture, Scan & | IMD. https://industrialmonitordirect.com/blogs/knowledgebase/relay-logic-vs-plc-logic-engineering-comparison-and-migration
  - Quote: "The most common mistake is converting the wiring one-to-one without considering the scan-based execution."
- **Bolton: the five IEC 61131-3 languages **SECONDARY****
  - Source: Ladder and Functional Block Programming. https://pogoni.etf.bg.ac.rs/VezbeRP/W.Boltorn%20Ladder%20and%20FBD%2001-Ch11.pdf
  - Quote: "The IEC 1131-3 programming languages are ladder diagrams (LAD), instruction list (IL), sequential function charts (SFC), structured text (ST), and function block diagrams (FBD)."
- **Pearson HN Unit 15 (PLCs): what a PLC system is described by **SECONDARY****
  - Source: U15 Automation Robotics And Plcs. https://unicourse.org/wp-content/uploads/2020/10/U15-Automation-Robotics-and-PLCs.pdf
  - Quote: "Characteristics, including speed, memory, scan time, voltage and current limits"
- **Pearson HN Unit 15: logic functions and the elements a first PLC program uses **SECONDARY****
  - Source: U15 Automation Robotics And Plcs. https://unicourse.org/wp-content/uploads/2020/10/U15-Automation-Robotics-and-PLCs.pdf
  - Quote: "Logic functions (AND, OR, XOR) Associated elements (timers, counters, latches)"

### 4.4 Lesson 8: alarms, trips and fail-safe design
- **HSE: what an alarm system is for**
  - Source: HSE Human Factors Briefing Note No 9 - Alarm Handling. https://www.nost.edu.au/icms_docs/143971_HSE_Human_Factors_09_Alarm_Handling.pdf
  - Quote: "Alarm systems alert operators to plant conditions, such as deviation from normal operating limits and to abnormal events, which require timely action or assessment."
- **HSE: too many alarms, poorly prioritised**
  - Source: Better alarm handling - Chemical Sheet No 6 - chis6. https://www.hse.gov.uk/PuBns/chis6.pdf
  - Quote: "There were too many alarms and they were poorly prioritised."
- **HSE: three priorities, 5 / 15 / 80 per cent**
  - Source: Better alarm handling - Chemical Sheet No 6 - chis6. https://www.hse.gov.uk/PuBns/chis6.pdf
  - Quote: "Prioritise proportionately, eg 5% high priority, 15% medium, and 80% low."
- **HSE: deadbands and hysteresis against nuisance alarms**
  - Source: HSE Human Factors Briefing Note No 9 - Alarm Handling. https://www.nost.edu.au/icms_docs/143971_HSE_Human_Factors_09_Alarm_Handling.pdf
  - Quote: "Change set points, hysteresis or dead bands to make the system less sensitive to short duration unimportant fluctuations."
- **HSE chis6: adjust deadbands on repeating alarms**
  - Source: Better alarm handling - Chemical Sheet No 6 - chis6. https://www.hse.gov.uk/PuBns/chis6.pdf
  - Quote: "adjust ‘deadbands’ on repeating alarms."
- **HSE: alarm processing techniques named**
  - Source: Control systems - HSE. https://www.hse.gov.uk/comah/sragtech/techmeascontsyst.htm
  - Quote: "A number of alarm processing techniques include filtering, deadband, debounce timers, and shelving, are described in EEMUA 191"
- **HSE: shelving must return alarms to active**
  - Source: Control systems - HSE. https://www.hse.gov.uk/comah/sragtech/techmeascontsyst.htm
  - Quote: "Care should be taken in the use of shelving or suppression to ensure that controls exist to ensure that alarms are returned to an active state when they are relevant to plant operation."
- **HSE: de-energise to trip named**
  - Source: Control systems - HSE. https://www.hse.gov.uk/comah/sragtech/techmeascontsyst.htm
  - Quote: "Use of positively actuated switches operating in a positive mode together with idle current (de-energise to trip);"
- **Kenexis: de-energise to trip, fail-safe by design**
  - Source: Comparison of Voting Arrangements in SIS. https://www.kenexis.com/wp-content/uploads/2018/11/Comparison-of-2oo3-voting-and-2oo2-voting.pdf
  - Quote: "In SIS, we typically employ a de-energize-to-trip, fail-safe circuit design."
- **GM International: what de-energise to trip means**
  - Source: SAFETY INSTRUMENTED SYSTEMS - G.M. International. https://gminternational.com/inc/inc_getfile.cfm?ID=MSD0142&w=MSD
  - Quote: "The majority of SIS are based on the “de-energize to trip” concept, meaning that, in normal working conditions, input and output are energized and the programmed action to prevent or mitigate the dangerous event consists in the opening of a connection by de-energizing an electric circuit. This action is called “trip”."
- **Kenexis: energise-to-trip defined**
  - Source: Safety Instrumented Systems Engineering Handbook. https://www.kenexis.com/wp-content/uploads/2018/12/SIS-Engineering-Handbook-letter-size.pdf
  - Quote: "DTT Deenergize-To-Trip means SIS outputs and devices are energized under normal operation. Removal of the source of power (e.g., electricity, air) causes a trip."
- **Kenexis handbook: a sensor bypass allows maintenance without a shutdown**
  - Source: Safety Instrumented Systems Engineering Handbook. https://www.kenexis.com/wp-content/uploads/2018/12/SIS-Engineering-Handbook-letter-size.pdf
  - Quote: "There is recognized value in being able to temporarily place a sensing element in bypass."
- **Instrument Society paper: a blown fuse or open circuit makes a de-energise-to-trip system trip**
  - Source: Energise or De-Energise to Trip?. https://journals.sagepub.com/doi/pdf/10.1177/002029400804100903
  - Quote: "failure of the signal itself, say through a blown fuse or by cable open circuit damage will also lead to a low signal and fail safe trip operation on a de-energise to trip system."
- **IMarEST/Lloyd's paper discussion: a contested view on shutdown circuits**
  - Source: UNATTENDED MACHINERY SPACES IN SHIPS— THE ESSENTIAL SAFETY FEATURES. https://library.imarest.org/nanna/record/1969/files/1996.pdf?withWatermark=0&withMetadata=0&registerDownload=1&version=1
  - Quote: "One possible solution was to adopt a normally deenergized shutdown system (i.e. not “fail safe”) backed up by a normally energized alarm system which was truly “fail safe”."
- **Kenexis: 1oo2 voting trips twice as often spuriously**
  - Source: Comparison of Voting Arrangements in SIS. https://www.kenexis.com/wp-content/uploads/2018/11/Comparison-of-2oo3-voting-and-2oo2-voting.pdf
  - Quote: "while 1oo2 voting improves safety, the spurious trip rate is twice as high."
- **Kenexis handbook: 2oo3 is the compromise**
  - Source: Safety Instrumented Systems Engineering Handbook. https://www.kenexis.com/wp-content/uploads/2018/12/SIS-Engineering-Handbook-letter-size.pdf
  - Quote: "Finally, 2oo3 offers a compromise between 1oo2 and 2oo2. This arrangement has both lower PFDavg and lower spurious trip rate than a single device, but is neither as safe as 1oo2 nor as spurious trip resistant as 2oo2."
- **Kenexis handbook: 2oo2 against 1oo2**
  - Source: Safety Instrumented Systems Engineering Handbook. https://www.kenexis.com/wp-content/uploads/2018/12/SIS-Engineering-Handbook-letter-size.pdf
  - Quote: "As a result, its PFDavg is twice that of a single component (i.e., more dangerous), but has a nuisance trip rate that is an order of magnitude lower."
- **Kenexis handbook: bypassing and human factors in major accidents**
  - Source: Safety Instrumented Systems Engineering Handbook. https://www.kenexis.com/wp-content/uploads/2018/12/SIS-Engineering-Handbook-letter-size.pdf
  - Quote: "When establishing bypass philosophy, the end user should take into account human factors; in most major accidents accidental or intentional bypassing are cited as key contributing factors."
- **Kenexis handbook: bypass and defeat in accident histories**
  - Source: Safety Instrumented Systems Engineering Handbook. https://www.kenexis.com/wp-content/uploads/2018/12/SIS-Engineering-Handbook-letter-size.pdf
  - Quote: "If an output is bypassed, it is effectively bypassing ALL of this critical interlocks simultaneously."

A point the sources do not agree on, taught as contested: de-energise to trip is the public default (HSE names it; the
Kenexis voting paper calls it typical in SIS; the G.M. International text says most SIS use it). An older discussion in
the Institute of Marine Engineers paper (7.1) put the other view for a ship: shutdown circuits normally de-energised and alarm circuits normally energised, so
that a faulty contact cannot stop the main engine. The 2008 Measurement and Control paper (above) is titled
"Energise or de-energise to trip?" (my reading: because the answer depends on the failure you fear most). The course states which
circuit does what and why, and never says which one a boat uses.

**UNCONFIRMED**: first-up (first-out) annunciator sequences, and "permissives" in the PLC sense, have no page I could
quote; they come from the brief's own scope, are one short screen each, and should be written as such. An alarm versus
a trip, in the sources' own words, is: an alarm alerts a person (the HSE briefing note, first finding in 4.4); a trip acts without one (the SIS pages).

---

## 5. Prerequisites: what this topic leans on, what Dan has, what must be taught inline

Dan has, from the built courses (read in their briefs, not quoted):
- Foundational maths and Algebra: Percentages and Proportional reasoning (percent of span), Linear equations and
  Straight-line graphs (scaling 4-20 mA to a value and back, zero and span errors as a shift and a slope), Powers and
  roots (the square-root law), Functions and their graphs, Exponentials and logarithms (the first-order lag and the
  63.2% time constant), Trigonometry only lightly.
- Calculus fundamentals and Differential equations: the idea of rate of change and of a time constant; no Laplace.
- Statistics for engineers: repeatability and error as spread (so "accuracy against precision" is already half known).
- Mechanics and materials and Heat and fluids: pressure, p = rho g h, flow, pumps; heat transfer for the temperature
  loops; strain for the strain gauge.
- AC circuits, Electronics and power electronics, Motors, Generators: Ohm's law and bridges, the comparator and op amp
  idea, contactors and start/stop circuits, and the governor and AVR (so lesson 5 uses them as the loop he already knows).
- Insulated systems and earth faults, Batteries: 24 V DC systems and why a floating loop matters.

What the sources assume, and so what to teach inline:
- **SQA unit: the numeracy it leans on**
  - Source: J6D0 47 Instrumentation and Control Measurement Systems. https://www.sqa.org.uk/files_ccc/j6d0-47-instrumentation-and-control-measurement-systems.pdf
  - Quote: "Learners develop their numeracy skills when performing calculations related to the measurement systems and PID controllers."
- **Sparky Tools: what an electrician's course on the 4-20 mA loop comes after **SECONDARY****
  - Source: 4-20 mA Loop Explained: Scaling, Wiring, Testing. https://sparkytools.net/apprentice/fourth-year/instrumentation-4-20ma
  - Quote: "Before this: Intro to PLCs · Percent in the trade"
- **Edinburgh: what the degree course assumes (above what Dan needs)**
  - Source: Course Catalogue - Control and Instrumentation Engineering (SCEE09002). https://www.drps.ed.ac.uk/26-27/dpt/cxscee09002.htm
  - Quote: "Familiarity with dynamic mechanical systems (kinematics and oscillatory systems), and/or electrical systems (DC/AC analysis of circuits)."

Must be taught inline (not in a built course): what a transducer or transmitter is (words, one screen); Boolean logic
(AND, OR, NOT as series and parallel contacts, which an electrician's circuits already are); the idea of the scan as
"read, think, write" (nothing to prerequisite); what a first-order step response looks like (picture only). Not taught
here: Laplace transforms, transfer functions, Bode plots, state space (all in the degree courses, none in Dan's route).

---

## 6. Misconceptions and learning science for each skill, with sources

### 6.1 Measurement: accuracy, precision and resolution
- **UNC lab guide: accuracy defined**
  - Source: Studio Measurement and Uncertainty Analysis. https://users.physics.unc.edu/~deardorf/uncertainty/UNCguide.pdf
  - Quote: "Accuracy is the closeness of agreement between a measured value and a true or accepted value."
- **UNC lab guide: precision defined**
  - Source: Studio Measurement and Uncertainty Analysis. https://users.physics.unc.edu/~deardorf/uncertainty/UNCguide.pdf
  - Quote: "Precision is a measure of how well a result can be determined (without reference to a theoretical or true value)."
- **ASEE: bias is accuracy, precision is scatter**
  - Source: Unified approach to teaching uncertainty across a three-course mechanical engineering laboratory sequence. https://peer.asee.org/unified-approach-to-teaching-uncertainty-across-a-three-course-mechanical-engineering-laboratory-sequence.pdf
  - Quote: "Bias uncertainty quantifies the accuracy of a measurement, which is affected by systematic errors, while precision uncertainty quantifies the random errors."
- **Physical Review PER: students conflate uncertainty, systematic effects and mistakes**
  - Source: Introductory physics lab instructors’ perspectives on measurement uncertainty. https://journals.aps.org/prper/pdf/10.1103/PhysRevPhysEducRes.17.010133
  - Quote: "found that students conflate measurement uncertainty, systematic effects, and measurement mistakes."
- **UNC: accuracy cited beyond the resolution is an error**
  - Source: Studio Measurement and Uncertainty Analysis. https://users.physics.unc.edu/~deardorf/uncertainty/UNCguide.pdf
  - Quote: "It would therefore be incorrect to assert the answer as 2.460 ± 0.005 g, because the accuracy cited far exceeds the resolution of the instrument."

My reading: Dan's Statistics for engineers course gives him spread and bias; the lesson turns them into the three
words on a transmitter data sheet. A typed puzzle "which number can you not trust to the last digit" is the test.

### 6.2 Control loops: the valve theory of the thermostat
The best-documented misconception in this ground. People think the dial sets how much heat comes out, not what the
room temperature should be. Kempton's study is Cognitive Science, 1986; a 2014 UK case study could place its users' models on Kempton's feedback
theory and found the other theories ambiguous.

- **Kempton 1986: the valve theory of the thermostat is common**
  - Source: Two theories of home heat control - ScienceDirect.com. https://www.sciencedirect.com/science/article/pii/S036402138680009X
  - Quote: "The valve theory is inconsistent with engineering knowledge, but is estimated to be held by 25% to 50% of Americans."
- **Kempton 1986: what the valve theory says **SECONDARY****
  - Source: Two Theories of Home Heat Control. https://qwern.net/doc/science/physics/1986-kempton.pdf
  - Quote: "To summarize the valve theory as described by Bill, the thermostat controls the rate at which the furnace generates heat."
- **Kempton 1986: the move from valve to feedback is a conversion, not an addition **SECONDARY****
  - Source: Two Theories of Home Heat Control. https://qwern.net/doc/science/physics/1986-kempton.pdf
  - Quote: "By contrast, arriving from the valve theory requires a conversion-at some point the learner will say something like, “Oh, I see, it’s not a valve, it’s an automatic switch."
- **Revell and Stanton 2014: inaccurate mental models of heating controls**
  - Source: Case studies of mental models in home heat control: Searching for feedback, valve, timer and switch theories - ScienceDirect. https://www.sciencedirect.com/science/article/pii/S0003687013001117
  - Quote: "Distinct, inaccurate mental models of the heating system, as well as thermostat devices in isolation, were described."
- **ACEEE: the thermostat as a dimmer switch for heat**
  - Source: How People Actually Use Thermostats. https://www.aceee.org/files/proceedings/2010/data/papers/1963.pdf
  - Quote: "Thermostat is a dimmer switch for heat (valve theory)"
- **ACEEE: thermostat as simply an on/off switch**
  - Source: How People Actually Use Thermostats. https://www.aceee.org/files/proceedings/2010/data/papers/1963.pdf
  - Quote: "Thermostat is simply an on/off switch"

My reading: because the valve theory works well enough in daily life, it does not break until a learner meets a loop
with a lag, so lesson 5 should start with a loop he can feel (turn the setpoint and watch the output stay on or off),
then the rule. The sources show that moving from valve to feedback is a conversion, not an addition: the learner has
to say "it is a switch with a comparison", so a predict-first screen ("turn the dial to maximum: does the room warm
faster?") is the right opening.

### 6.3 Concept inventory evidence for control as a subject
- **Bristow et al 2012: a control systems concept inventory exists**
  - Source: ERIC - EJ982741 - A Control Systems Concept Inventory Test Design and Assessment, IEEE Transactions on Education, 2012-May. https://eric.ed.gov/?id=EJ982741
  - Quote: "Any meaningful initiative to improve the teaching and learning in introductory control systems courses needs a clear test of student conceptual understanding"
- **Bristow et al 2012: gains of 23 to 34 per cent**
  - Source: ERIC - EJ982741 - A Control Systems Concept Inventory Test Design and Assessment, IEEE Transactions on Education, 2012-May. https://eric.ed.gov/?id=EJ982741
  - Quote: "Students demonstrated an improvement from pre- to post-test scores, showing gains of 23%-34% in understanding of new concepts learned."

(These are about an introductory control course at degree level, and say nothing about PLC logic; in the pages I
searched I found no published misconception inventory for PLC scan logic or alarm design.)

### 6.4 Skill by skill: the named mistakes
- 4-20 mA scaling and wiring:
- **Dreiym: the common 4-20 mA mistake **SECONDARY****
  - Source: 4-20 mA Current Loop Explained, With a Live Simulator. https://www.dreiym.com/2026/10/03/4-20-ma-current-loop
  - Quote: "Common mistake. Taking 0 mA for a zero reading. Zero is 4 mA, the live zero, so 0 mA means a broken wire or a dead transmitter."
- **Sparky Tools: forgetting to subtract the 4 mA **SECONDARY****
  - Source: 4-20 mA Loop Explained: Scaling, Wiring, Testing. https://sparkytools.net/apprentice/fourth-year/instrumentation-4-20ma
  - Quote: "Forgetting to subtract the 4 mA before scaling."
- **Sparky Tools: loop wiring slips **SECONDARY****
  - Source: 4-20 mA Loop Explained: Scaling, Wiring, Testing. https://sparkytools.net/apprentice/fourth-year/instrumentation-4-20ma
  - Quote: "Leaving the meter leads in the mA jacks and then measuring voltage — that is a short."
- **Sparky Tools: opening a loop that is controlling a live process **SECONDARY****
  - Source: 4-20 mA Loop Explained: Scaling, Wiring, Testing. https://sparkytools.net/apprentice/fourth-year/instrumentation-4-20ma
  - Quote: "Opening a loop that is controlling a live process without warning anyone."
- **Sparky Tools: two supplies in one loop **SECONDARY****
  - Source: 4-20 mA Loop Explained: Scaling, Wiring, Testing. https://sparkytools.net/apprentice/fourth-year/instrumentation-4-20ma
  - Quote: "Two loop supplies in one loop (a powered transmitter into a powered input)."
- **Sparky Tools: PLC scaling not matching the transmitter's range **SECONDARY****
  - Source: 4-20 mA Loop Explained: Scaling, Wiring, Testing. https://sparkytools.net/apprentice/fourth-year/instrumentation-4-20ma
  - Quote: "Scaling in the PLC not matching the range set in the transmitter."
- **Sparky Tools: wiring a powered transmitter into an input that also supplies loop power **SECONDARY****
  - Source: 4-20 mA Loop Explained: Scaling, Wiring, Testing. https://sparkytools.net/apprentice/fourth-year/instrumentation-4-20ma
  - Quote: "Wiring a four-wire (active) transmitter into an input that also supplies loop power is a common commissioning mistake."
- Square-root flow: the DP gauge that reads 20% at one flow reads 80% at double (2.4), and the low-flow error is large
  (2.4). A typed puzzle on "double the flow, what does the DP do" is the test.
- PID: P alone never reaches the set point (4.2); integral too strong oscillates and winds up (4.2); derivative on a
  noisy signal is the one most often left out (4.2).
- PLC: converting wiring one for one without the scan (4.3); the seal-in having to be in parallel with start and the
  stop in series (4.3).
- Alarms: alarm floods, nuisance alarms and deadbands (4.4), and a bypass as an accident cause (4.4):
- **Kenexis: contacts welded closed is the dangerous failure of a de-energise-to-trip switch**
  - Source: Comparison of Voting Arrangements in SIS. https://www.kenexis.com/wp-content/uploads/2018/11/Comparison-of-2oo3-voting-and-2oo2-voting.pdf
  - Quote: "For switches in this configuration the failure mode of “contacts welded closed” is a dangerous failure"

Learning science, in one line each (my reading; none of it is new to the app, whose product rules already say
predict, play, explain and say it back): the valve-theory finding says to open with a prediction; the concept
inventory finding says control is learned in steps and tested on concepts, not on sums; the measurement-uncertainty
findings say learners mix up uncertainty, systematic error and mistakes, so each term gets its own picture.

---

## 7. Where it is used for an electrician going into marine engineering, each with a quote from a reachable page

### 7.1 The unattended machinery space: alarms and monitoring are the electrician's daily work
- **Unattended machinery space: a ship's alarms tell the duty engineer**
  - Source: Key procedures for Unattended Machinery Spaces - SAFETY4SEA. https://safety4sea.com/cm-key-procedures-for-unattended-machinery-spaces
  - Quote: "UMS operation of Engine Room is a first step to Automation."
- **IMarEST/Lloyd's paper: self-monitoring so an open circuit gives an alarm**
  - Source: UNATTENDED MACHINERY SPACES IN SHIPS— THE ESSENTIAL SAFETY FEATURES. https://library.imarest.org/nanna/record/1969/files/1996.pdf?withWatermark=0&withMetadata=0&registerDownload=1&version=1
  - Quote: "Systems should be self-monitoring so that an open circuit would cause an alarm condition."
- **IMarEST/Lloyd's paper: the essential features of an unattended machinery space**
  - Source: UNATTENDED MACHINERY SPACES IN SHIPS— THE ESSENTIAL SAFETY FEATURES. https://library.imarest.org/nanna/record/1969/files/1996.pdf?withWatermark=0&withMetadata=0&registerDownload=1&version=1
  - Quote: "v) An alarm system on the bridge and in the accommo­ dation to give warning of faults in the essential machinery."
- **IMO code on alarms: unattended spaces call the engineer to the machinery space**
  - Source: IMO Resolution A.686(17): Code on Alarms and Indicators, 1991. https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/AssemblyDocuments/A.686(17).pdf
  - Quote: "to inform the engineer officer on watch of any alarm situation which requires immediate presence in the machinery space/engine control room"
- **IMO code on alarms: fail-to-safety, open detection circuit gives an alarm**
  - Source: IMO Resolution A.686(17): Code on Alarms and Indicators, 1991. https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/AssemblyDocuments/A.686(17).pdf
  - Quote: "Required alarm systems should, as far as is practicable, be designed on the fail-to-safety principle, e.g., an open detection circuit should cause an audible and visual alarm"
- **IMO code on alarms: personnel alarm for the engineer alone in the machinery space**
  - Source: IMO Resolution A.686(17): Code on Alarms and Indicators, 1991. https://wwwcdn.imo.org/localresources/en/KnowledgeCentre/IndexofIMOResolutions/AssemblyDocuments/A.686(17).pdf
  - Quote: "Personnel alarm. An alarm to confirm the safety of the engineer on duty when alone in the machinery spaces"
- **US Coast Guard guideline: testing a sensor by creating the alarm condition**
  - Source: MSC Guidelines for Periodic Safety Test Procedures (US Coast Guard Marine Safety Center). https://www.dco.uscg.mil/Portals/9/MSC/PRG/PRG.E2-17.2016.11.09.Periodic_Safety_Test_Procedures.pdf
  - Quote: "An unacceptable test for a pressure sensor is reducing the sensor’s alarm set point until the ambient pressure in the system causes an alarm state."
- **US Coast Guard: alarms and controls must be fail-safe with two power sources**
  - Source: MSC Guidelines for Periodic Safety Test Procedures (US Coast Guard Marine Safety Center). https://www.dco.uscg.mil/Portals/9/MSC/PRG/PRG.E2-17.2016.11.09.Periodic_Safety_Test_Procedures.pdf
  - Quote: "all automatic control, remote control safety control, instrumentation, and alarm systems must be of a failsafe design with two sources of power."

### 7.2 Which alarms a ship must have
- **US regulation: required machinery alarms, low lube-oil pressure**
  - Source: eCFR :: 46 CFR Part 130 Subpart D -- Automation of Unattended Machinery Spaces. https://www.ecfr.gov/current/title-46/chapter-I/subchapter-L/part-130/subpart-D
  - Quote: "Low lube-oil pressure for each main propulsion engine and each prime mover of a generator."
- **US regulation: high jacket-water temperature alarm**
  - Source: eCFR :: 46 CFR Part 130 Subpart D -- Automation of Unattended Machinery Spaces. https://www.ecfr.gov/current/title-46/chapter-I/subchapter-L/part-130/subpart-D
  - Quote: "High jacket-water temperature."
- **US regulation: alarms must be self-monitoring for a break in the circuit**
  - Source: eCFR :: 46 CFR Part 130 Subpart D -- Automation of Unattended Machinery Spaces. https://www.ecfr.gov/current/title-46/chapter-I/subchapter-L/part-130/subpart-D
  - Quote: "must be of the self-monitoring type that will both show visibly and sound audibly upon an opening or break in"

My reading: a low lube-oil pressure alarm, a high jacket-water temperature alarm and a high bilge-level alarm are
the three plant examples the course uses: each is a transducer, a limit, an alarm, and (for lube oil) a trip. These
are public rule texts for vessels in general (a US coast guard rule and the IMO's Code on Alarms and Indicators), not
a statement about any navy or boat. The "a compressor's start and stop" example is lesson 7's seal-in; "a 440 V
generator's governor and AVR as loops" is lesson 5's pointer to the Generators course.

---

## 8. Size: how many lessons the benchmarks spend, and which core supports 8 lessons for Dan

- Brilliant spends no lessons on this ground; its nearest electrical courses are 31 (Circuits) and 32 (Digital
  Circuits) lessons (1.1).
- Pearson Level 4 Unit 16 is one 15-credit unit in four outcomes (1.3); SQA's HN unit is 120 notional hours in
  seven outcomes at about 17 hours each (1.4). The Level 3 PLC unit is 60 guided learning hours (1.2).
- Four workbooks for Unit 16, one per outcome (1.3), plus a PLC unit (Unit 15 or 36), plus the alarms and protection
  material that the public sources spread across HSE and the IMO code (4.4, 7.1) is the shape of the public core.

My reading, which core supports 8 lessons: (1) the measurement chain and (2) to (4) three measured quantities with
the 4-20 mA loop cover Unit 16's outcome 1 and SQA's outcomes 1 to 4 in four lessons; (5) and (6) control loops and
PID cover outcome 2 and 3 and SQA's outcome 7 in two lessons (PID last, as SQA advises); (7) logic and PLCs cover
the PLC unit's core of ladder, scan, latches, timers and counters in one lesson; (8) alarms and fail-safe design
covers the STCW "monitoring systems, automatic control devices and protective devices" lines and the HSE alarm
pages in one lesson. Eight lessons of "a puzzle, then the rule, then typed puzzles" is smaller than any
single benchmark unit, which is intended: Dan asked for foundations that see him through new topics, not a remake of
the Level 3 or Level 4 unit. A ninth lesson, if wanted, would split lesson 3 (pressure, level, flow) in two, because
it is the densest; a seventh could merge 7 and 8 only by dropping the voting arithmetic.

### Courses after this one (defer their ground)
- Fault-finding: from symptom to cause (same shelf): finding faults on control circuits and the board. This course
  gives him the loop and the logic; fault-finding walks from symptom to cause.
- Maintenance and condition monitoring (same shelf): trends that catch a fault before it happens. This course
  stops at the alarm limit; trending is there.

## Unconfirmed, in one place
- IEC 60751 and IEC 60584 table values (only titles and what they cover were seen).
- Thermistors and temperature switches; turbine flowmeters; strain-gauge and capacitive pressure transducer lines on
  a quotable page.
- The apprenticeship KSB lines K46 to K60 and S38 to S51; the Royal Navy naval engineering technician standard; the
  Engineering technician (electrical, control and instrumentation) standard.
- First-up (first-out) annunciator sequences; "permissive" interlocks in PLC use.
- Instrument makers' own handbooks from Rosemount, Yokogawa, ABB, Siemens and Rockwell: not reached through the tool
  in a quotable form (a Siemens ladder manual was found but cut short).
