# Lesson 1 build pack: Design current, what the circuit really draws

For the writer agent of the pilot (Dan, 20 Oct: "9 lessons, build pilot"). It sets out lesson 1
screen by screen: every number with the rule it comes from and where in Dan's materials it is printed,
the recall options and the slip each wrong one stands for, the Section A answers with what is
accepted, the Section B points, and the Keep-this card. The format is `format/refresher.md`
(section 2 is this lesson's plan; section 3 is how written answers are marked); the running case is
`case.json` (lesson 1's figures are `l1.*` there); the look is `format/refresher-mockups/`
(`recall.html`, `reteach.html`, `section-a.html`, `section-b.html`, `summary.html`).

## How to cite, and what is still to research

- **Dan's materials** are in `build/electrical/design-and-verification/source/` and are cited in the
  lesson's words by page, as he knows them: "your slides p.16", "your assignment, question 4". Pages
  are PDF pages:
  - slides: `eal-l4-design-and-verification-spec.pdf`, his course's slide deck;
  - pack: `eal-ed4-assign-01a-learner-pack.pdf` (p.3 the specification and supply, p.4 questions 1 to 5);
  - formula sheet: `circuit-design-formula.pdf`;
  - flowchart: `circuit-design-calculation-process.pdf`.
- **The lesson's `sources`** (web pages with quotes, RUNBOOK section 2) come from the course's
  research stage. Lesson 1 needs a quoted web source for each of these, before it is written:
  1. **The delta relation**: in a balanced delta, line current = √3 × phase current (so the winding
     current = line ÷ √3). Step 8 rests on it. Nothing in Dan's materials states it. The AC circuits
     research holds the star half of it (Kuphaldt, *Lessons in Electric Circuits*, AC chapter 10,
     `build/electrical/ac-circuits/research.json` source 34); research must quote the delta half,
     word for word. **Flag: do not write step 8 without it.**
  2. The definition of design current. The slides quote it (p.11); a web source quoting BS 7671's
     definition backs it.
  3. Three-phase power, P = √3 × UL × IL × cos φ, and power factor as real ÷ apparent power. The
     AC circuits course teaches both (lessons 8 and 10); quote a source.
  4. Efficiency as output ÷ input.
  5. Diversity allowances as guidance in the On-Site Guide's Appendix A (the slides say so, p.10;
     a web source that says the same).
- **Not needed for lesson 1, and not to be stated in it:** how the starter-to-motor cables are sized
  on the delta running conditions (question 4b; the guide points to "section 4.7 of The Electrical
  Installation Guide", guide p.7). That is lesson 3, after research. Step 8 asks only for the
  current in each winding.
- **Edition:** Dan's course is to BS 7671:2018+A2:2022 (flowchart title). Nothing in this lesson
  depends on a table value, so Amendment 3 does not touch it.

## Slips in the source to avoid copying

- Slides p.12 print "Ib - P / V x Eff% x PF". It means Ib = P ÷ (V × Eff × PF).
- The formula sheet's single-phase line (step 1) is P ÷ V, leaving out the efficiency and power
  factor that slides p.12 include. Use the slides' form.
- Slides p.17 call the 20 kW heater "the same pump". It is the heater of p.16.
- Slides p.16 and p.17 print 28.86 A and 41.47 A. Worked from the rule they are 28.87 A and 41.48 A
  (cut short, not rounded). Step 6 says so in one line.
- Slides p.13 give √3 as 1.73. Answers worked with 1.73 land a few hundredths high (28.90 A, 41.53
  A, 29.42 A, 23.10 A, 21.90 A), so typed answers accept them (below).

## Rounding

Each line is worked from the figures shown before it, rounded half up to 2 decimal places (currents,
kW, kVA). A typed answer is accepted inside the range given, which covers unrounded working and
√3 taken as 1.73. Every figure here is in `case.json`.

## The screens

### Step 1. Do you still have it? (recall; mockup `recall.html`)
- Question: "A 20 kW three-phase heater on a 400 V supply, power factor 1, efficiency 100%. What is
  its design current, Ib?"
- Options, in this order: **28.87 A** (right), **50.00 A**, **86.96 A**.
  - 28.87 A: 20 000 ÷ (√3 × 400) = 28.87 A. Slides p.16 (printed 28.86 A).
  - 50.00 A, the slip **√3 left out**: 20 000 ÷ 400. Hint: "Three-phase power is shared by three
    lines: the rule divides by √3 × the line voltage (your slides p.13)."
  - 86.96 A, the slip **the single-phase rule at 230 V**: 20 000 ÷ 230. Hint: "That treats the
    three-phase heater as a single-phase load on 230 V. Use √3 × 400 V (your slides p.13)."
- Right: "Still there." with the working, then: "Your slides' own heater (p.16). The other two are
  the usual slips: 50.00 A leaves out √3, and 86.96 A works it at 230 V." Two buttons: **Refresh the
  why** (to step 2) and **Skip to the practice** (to step 7).
- Wrong: the slip's hint, the right working, then on to step 2 (no skip offered).

### Step 2. What it is for
- Words (plain, two or three sentences): design current is "the magnitude of the current to be
  carried by a circuit in normal service" (your slides p.11). The device, the cable and every check
  after them are chosen from it (Ib ≤ In ≤ Iz, slides p.22; flowchart step 1 comes first).
- **If it is skipped or wrong:** every later step is sized on the wrong current, all in the same
  direction.

### Step 3. The why (interactive; mockup `reteach.html`)
- Words (the lesson's own, as in the mockup): The cable carries what the load draws from the supply,
  not what it gives out. Losses (efficiency) and reactance (power factor) both add to the draw. The
  slides say it this way: some equipment, "such as motors", requires "more than expected current to
  provide the output required, this is due to something called 'reactance'" (p.15), and a design
  without the efficiency or power factor "is based on 28.86A rather than 41.47A" (p.17). Key terms:
  [[efficiency]], [[power factor]].
- The picture: the same 20 kW output at 400 V. Two sliders, both starting at 1.00 and dragged down:
  **Power factor** 0.70 to 1.00, step 0.01; **Efficiency** 0.70 to 1.00, step 0.01.
- Three bars, each with its value: **Output** 20.00 kW (fixed); **Input = output ÷ efficiency**;
  **Apparent = input ÷ power factor** (kVA). A large readout: **Ib = apparent × 1000 ÷ (√3 × 400)**,
  with its working line under it. Each worked from the shown figure above it, 2 decimal places.
- Values to check the build against (`case.json` l1.reteach.*):
  - 1.00 and 1.00: 20.00 kW, 20.00 kVA, Ib 28.87 A.
  - efficiency 0.87, power factor 0.8: 20 ÷ 0.87 = 22.99 kW; 22.99 ÷ 0.8 = 28.74 kVA; 28.74 × 1000
    ÷ (√3 × 400) = **41.48 A** (slides p.17, printed 41.47 A).
  - 0.70 and 0.70: 20 ÷ 0.70 = 28.57 kW; 28.57 ÷ 0.70 = 40.81 kVA; 40.81 × 1000 ÷ (√3 × 400) =
    58.90 A (58.91 A unrounded).
- Under it, as a warning: "If it's skipped: the cable is sized on 28.87 A when the load draws
  [the readout's Ib]", and the slides' words: "this would cause big implications for the operation
  and safety of the circuit" (p.17).
- One line: real, apparent and reactive power are AC circuits' lesson 8; here they only show where
  the extra current comes from. No power triangle (it crowded the phone in the mockups).

### Step 4. Check
- Question: "The same 20 kW heater draws at power factor 0.8 and efficiency 87%. What is Ib?"
- Options: **41.48 A** (right: 20 000 ÷ (√3 × 400 × 0.87 × 0.8), slides p.17), **36.08 A** (slip:
  efficiency left out, 20 000 ÷ (√3 × 400 × 0.8)), **33.18 A** (slip: power factor left out,
  20 000 ÷ (√3 × 400 × 0.87)).
- Hints name the factor left out; Why? gives the rule and slides p.13, p.17.

### Step 5. The voltage at the board, and diversity
- A sub-board measured at 393 V: 20 000 ÷ (√3 × 393) = **29.38 A** (slides p.19), against 28.87 A
  at 400 V. Why: "If … you are given a separate value for voltage (U), then this must be used"; the
  voltage at a sub-board "will be lower than 230V or 400V" because of the submain's voltage drop
  (slides p.18).
- Diversity in one or two lines: the allowances "are only found in the OnSite Guide. This means,
  it's guidance and doesn't have to be applied" (slides p.10); ten 100 W lamps at the OSG's 66% are
  designed at 10 × 100 × 0.66 = **660 W** rather than 1000 W (p.10). Lesson 2 does more.

### Step 6. Worked example
The slides' three cases, revealed line by line:
- 20 kW at 400 V: 20 000 ÷ (√3 × 400) = 28.87 A (p.16).
- the same at power factor 0.8 and 87%: 20 000 ÷ (√3 × 400 × 0.87 × 0.8) = 41.48 A (p.17).
- the same at a 393 V sub-board: 20 000 ÷ (√3 × 393) = 29.38 A (p.19).
- One line: "Your slides print 28.86 A and 41.47 A: cut short, not rounded. Nothing changes."

### Step 7. Section A, question 1 (a) (typed answer)
- Label: "Section A · Question 1". The scenario, said plainly (your assignment, pack p.3 and p.4):
  a 400 V three-phase 11 kW motor in the consultation bay, power factor 0.8 lagging, efficiency 86%,
  on a star-delta starter; cables from the starter to the motor in 90 °C thermosetting singles in
  conduit; supply 400/230 V three-phase four-wire, TN-C-S, Ze 0.1 Ω, prospective fault current 4.6 kA;
  ambient 20 °C. (Only the first line is needed for (a); the rest is the scenario lessons 3, 5, 6
  and 7 carry on.)
- "(a) Determine the design current."
- Answer: 11 000 ÷ (√3 × 400 × 0.86 × 0.8) = **23.08 A** (`case.json` l1.A.1a; rule slides p.13;
  pack question 4a). **Accept 23.05 to 23.11 A** (√3 as 1.73 gives 23.10 A). Unit A.
- Hints for the slips: 15.88 A (efficiency and power factor left out); 18.46 A or 19.85 A (one of
  them left out); 39.97 A (√3 left out); 69.51 A (the single-phase rule at 230 V).

### Step 8. Section A, question 1 (b) (typed answer; mockup `section-a.html`)
- "Carried forward: (a) Design current, Ib 23.08 A" with a tick.
- "(b) Determine the current in each winding when the motor runs in delta."
- Picture: three windings joined in delta, the line current (23.08 A) coming in at one corner, one
  winding marked "?". No more than that.
- Answer: 23.08 ÷ √3 = **13.33 A** (`case.json` l1.A.1b). **Accept 13.30 to 13.36 A** (13.32 A
  from the unrounded Ib; 13.34 A or 13.35 A with √3 as 1.73).
- Feedback: "In delta each winding carries the line current ÷ √3" with the research source (flag
  1 above). Then one line: "Lesson 3 sizes the starter-to-motor cables on it, as question 4b asks."
- Hints: 39.98 A (multiplied by √3 instead of dividing); 7.69 A (divided by 3).
- If he got (a) wrong, (b) still starts from 23.08 A and says so ("carried forward from the course's
  figure").

### Step 9. Section B, short written answer (mockup `section-b.html`)
- Question: "Explain why Ib for a final circuit fed from a sub-board is worked at the voltage at that
  board, not at 400 V."
- Points (`need: 3`, "a full answer makes any three"):
  1. "The submain drops some voltage, so the sub-board sits below 400 V." Cite: slides p.18.
  2. "For the same power, a lower voltage needs more current: Ib = P ÷ (√3 × U)." Cite: slides p.13,
     p.19.
  3. "The device and the cable are chosen from Ib (Ib ≤ In ≤ Iz), so at 400 V both would be picked
     on too small a current." Cite: slides p.22.
  4. "For example, 20 kW is 28.87 A at 400 V but 29.38 A at 393 V." Cite: slides p.16, p.19.
- Model answer: "The submain between the main board and the sub-board drops some voltage, so the
  sub-board sits below 400 V (your slides p.18). For the same power a lower voltage needs more
  current, since Ib = P ÷ (√3 × U): the slides' 20 kW load draws 28.87 A at 400 V but 29.38 A at
  393 V (p.16, 19). The device and the cable are chosen from Ib (Ib ≤ In ≤ Iz, p.22), so working at
  400 V would choose both on too small a current."
- Wrong statements to name in red if he writes them: that the voltage at a sub-board is higher than
  400 V; that a lower voltage means less current for the same power.
- Data for the app's written-answer piece (refresher.md section 7, item 2), as a draft:
  ```json
  { "id": "w1", "q": "Explain why Ib for a final circuit fed from a sub-board is worked at the voltage at that board, not at 400 V.",
    "need": 3,
    "points": [
      { "text": "The submain drops some voltage, so the sub-board sits below 400 V.", "cite": "slides p.18" },
      { "text": "For the same power, a lower voltage needs more current: Ib = P ÷ (√3 × U).", "cite": "slides p.13, 19" },
      { "text": "The device and the cable are chosen from Ib (Ib ≤ In ≤ Iz), so at 400 V both would be picked on too small a current.", "cite": "slides p.22" },
      { "text": "For example, 20 kW is 28.87 A at 400 V but 29.38 A at 393 V.", "cite": "slides p.16, 19" } ],
    "model": "(the model answer above)" }
  ```
  Use the field names the app agent ships if they differ (check `app/kit/KIT.md` and
  `docs/ARCHITECTURE.md` at build time).

### Step 10. Section A, changed numbers (typed answer)
- A C&G question 1 shape with its scenario and numbers changed (City & Guilds 2396 P1 question 1 is
  a three-phase water heater; nothing of its text or numbers is reused): "A three-phase 15 kW water
  heater is fed from a sub-board whose voltage is measured at 396 V. Determine the design current."
- Answer: 15 000 ÷ (√3 × 396) = **21.87 A** (`case.json` l1.A.changed). **Accept 21.84 to 21.90 A**
  (√3 as 1.73 gives 21.90 A).
- Hints: 21.65 A (worked at 400 V, not the board's 396 V, slides p.18); 37.88 A (√3 left out).

### Step 11. Keep this (summary card; mockup `summary.html`)
- **Title:** Design current, Ib.
- **For:** "The current the circuit carries in normal service (slides p.11). The device, the cable
  and every check after them are sized from it."
- **Rule** (in the amber "remember this" box):
  - Single-phase: Ib = P ÷ (U × eff × pf) (slides p.12).
  - Three-phase: Ib = P ÷ (√3 × UL × eff × pf) (slides p.13).
  - "P is the output. U is the voltage at the board when you are given one" (slides p.12, 18).
- **Traps** (each a red tile with its cite):
  - Sizing on the output alone: 28.87 A where the load draws 41.48 A (slides p.17).
  - 230 or 400 V by habit when the board's voltage is given (slides p.18).
  - Diversity treated as a rule: it is guidance, from the On-Site Guide (slides p.10).
- **Where it lives:** your slides p.10 to 19; the formula sheet, step 1; the flowchart, step 1;
  diversity in the On-Site Guide, Appendix A (slides p.10).
- **The showroom so far:** motor Ib 23.08 A; each winding, in delta, 13.33 A.
- "Kept in your Book: chapter I, first page." Then **Finish the lesson** (`K.complete()`).
- Data draft for the summary piece: `{ "title": "Design current, Ib", "for": "…", "rule": ["…", "…",
  "…"], "traps": [{ "text": "…", "cite": "slides p.17" }, { "text": "…", "cite": "slides p.18" },
  { "text": "…", "cite": "slides p.10" }], "where": ["…"], "figures": [{ "label": "Motor Ib",
  "value": "23.08 A" }, { "label": "Each winding, in delta", "value": "13.33 A" }] }`, filled from the
  text above.

## The rest of the lesson document

- **Title:** "Design current: what the circuit really draws". **oneLine** and **skill**: as
  `lessons.json` lesson 1.
- **explain** (for the dossier; the frame carries the teaching): the Step 2 and Step 3 words, with
  the slides cited by page and the research sources as [^n].
- **practice** ("Put it into practice", the dossier's practice page): steps (find the output, the
  efficiency and power factor from the nameplate or the maker's data, slides p.14; the voltage at the
  board; apply the rule), the rule of thumb (the cable carries the input, not the output), the worked
  example (the motor, 23.08 A), and the three traps.
- **Picture for the still guide and the course page:** step 3's bars at 0.87 and 0.8.
- **Words:** plain, warm British English; no colons chaining clauses; key terms marked once; Dan is a
  qualified electrician, so nothing about what a breaker or a nameplate is.

## Checks for the reviewer

- Every number on every screen is one of the figures above (`case.json` l1.*), worked from the rule
  shown, with the slide's printed figure noted where it differs.
- No screen states how the starter-to-motor cables are sized (lesson 3, after research).
- Step 8 cites a quoted source for the delta relation.
- The recall's Skip to the practice lands on step 7, and a wrong recall answer never offers it.
- No marks, no grade, no timer anywhere; written answers show points made and not yet, never a score.
