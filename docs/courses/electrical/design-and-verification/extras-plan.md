# Design and verification: folding in the Level 4 extras (plan)

Written 24 Oct 2026 for Dan ("D&V extras next"). It is a plan only. No lesson, case file, app code,
database or git was changed. The course stays to BS 7671:2018+A4:2026 (`../bs7671-amendments/dv-audit.md`).

The extras are in `source/extras/`, as OCR text: City & Guilds 2396 practice papers 4 (Dec 2014) and 5
(Mar 2013), the course mock in two parts (with and without answers), and eight group handouts. Every
figure below was worked again by hand from the stated inputs (section 6). Table values were read from
Dan's own BS 7671 Appendix 4 and On-Site Guide pages already in `tools/` (material-bs7671-p441, p443,
p448, p449, p458, p459; material-osg-p142, p145, p218, p220) and the Prysmian BS 5467 data sheet
already harvested (tools/77-web_fetch.json).

---

## 0. The short version

**Recommendation: one new lesson, lesson 10, "A second job: the lathe, start to finish", and no
changes to lessons 1 to 9.** The nine lessons already teach almost everything the extras show, and
teach it correctly. Where a handout and a lesson disagree, the lesson is right (section 6). What is
genuinely new is small and fits one lesson: a whole Section A on a circuit unlike the showroom's (the
course mock's lathe), the question every designer meets ("can the cpc be smaller?"), and the
handout's SWA cases that lesson 7 does not reach (Table 54.7's k1/k2 route, and armour with a copper
core in parallel). It costs about **1.2M tokens**, against 0.9M to 1.5M for patching "More practice"
screens into three built lessons, two of which sit at validator limits already.

**A real decision for Dan:** an optional lesson 11, "Other supplies: a TT outbuilding and a standby
generator" (the greenhouse handout and paper 4's generator question), about **1.2M**. TT and Section
705 are mostly ground his 18th Edition and inspection and testing awards cover. Generators are the
one topic in the extras beyond his awards, and the closest to Navy work. Not recommended by default.

---

## 1. Item by item

"Covered" means read in the built lesson (`iN.lesson.verified.json`, `iN.guide.json`), not just in its plan.

| Item | Fits | Already covered? | What it would add | Decision |
|---|---|---|---|---|
| **Mock part 1** (lathe: 12.5 kW, pf 0.91, eff 94%, 90 °C singles in trunking, 25 °C, three circuits, type C, board 3% down) | i1, i3, i5, i7 | Each step is taught (i1 board voltage, i3 factors and table, i5 drop from the intake, i7 suitable cpc). Never as one job on a second circuit. Ca above 1 (1.02 at 25 °C) is shown nowhere. | A whole Section A in one sitting, on new figures | **Lesson 10, Section A 5(a) to 5(f)** |
| **Mock part 2** (Zdb 0.4 Ω, cpc cut to 2.5 mm², ADS and adiabatic) | i6, i7 | The method is i7's Section B ("suitable against minimum cpc") in words. Never worked as numbers. | The minimum cpc worked, and why the loop, not the heat, sets it here | **Lesson 10, the why, 5(g), 5(h), Section B** |
| **SWA as cpc** handout | i7 3(f), i8 3(g) | Armour by the adiabatic, with Cmax, k 46 and the maker's 1 s rating: yes. Table 54.7's k1 ÷ k2 × S route, a copper core in parallel with the armour, and what to do when armour falls short: no. | Those three | **Lesson 10, worked example** |
| **Chasing the volt drop** (Ct about 0.96) | i5 | Fully: the same 85 m heater, 32.14 V, 12.19 V, 8.09 V, and Ct 0.90 for 4.0 mm², which then passes. The handout's Ct is wrong (section 6). | Nothing. Its slip could become a trap card later. | **Drop** |
| **Actual Zs less than calculated** (parallel paths) | i9 | Yes: summary line and trap ("A direct Zs usually reads lower… parallel earth paths"), part 4(c). | Nothing | **Drop** |
| **Summing 3-phase into 1-phase drop** (20 V → 11.54 V + 9.2 V) | i5, i8 | Yes: ÷ √3 rule, trap, i5's changed-numbers item, i8's check. | Nothing (percentages add directly, since 400 ÷ √3 ≈ 230: a one-liner, not worth a rebuild) | **Drop** |
| **PSCC example** | i7 | Yes: it is the slides' short-circuit example, worked in i7 at Cmax (203.87 A, 3.08 s). The handout uses Cmin. | Nothing | **Drop** |
| **Power factor explanation** (beer analogy, 5.5 kW three ways) | i1 (and AC circuits lesson 8) | Yes: i1's why picture stretches output to input to apparent power. | Nothing | **Drop** |
| **3-phase cable design** (30 kW: 75 A against 43.3 A) | i1 | Yes: i1's recall opener is this very slip (no √3). | The cost of the slip; its prices are unsourced | **Drop** |
| **Greenhouse scenario** (Section 705, TT, Ra 73 Ω) | none | No lesson covers TT, earth electrodes or special locations. The brief left them out as Level 3 ground. | TT fault protection by RCD, RA × IΔn, 705's RCD tiers | **Optional lesson 11** (Dan's choice) |
| **Paper 4, Section A** (100 A three-phase distribution circuit, drop limit 4 V, cpc from design Zs and 543.1.3) | i3, i5, i6, i7, i8 | Shapes all covered. New element: a drop limit set in volts, and a cpc found from design Zs and the heat together. | Those two shapes | **Lesson 10**: changed-numbers item (volts limit, new numbers) and 5(g) to 5(h) |
| **Paper 5, Section A** (12 kW heater, BS 88-2, separate cpc; effect of steel trunking on R1+R2) | i1, i3, i5, i6, i7, i9 | Yes; the trunking question is i9's parallel paths. | Nothing | **Drop** |
| Papers, B: max Zs of a 45 A type C; 0.4 s and 5 s circuits; RCD when Zs is too high; short circuit 434.5.2 | i6, i7 | Yes (rule Uo × Cmin ÷ Ia; Table 41.5; t = k²S² ÷ I²) | Nothing | **Drop** |
| Papers, B: third harmonic of 20% | i4 | Yes (Table 4Aa bands) | Nothing | **Drop** |
| Papers, B: pf correction to voltage drop, ≤ 16 mm² and > 16 mm² | i5 | Half: i5 teaches r cos φ + x sin φ for 25 mm² and up only. | The ≤ 16 mm² rule (tabulated mV/A/m × cos φ) | **Lesson 10, a note in 5(e)'s reveal**, if research quotes Appendix 4 |
| Papers, B: reasons for dividing into circuits (314.1), both papers | i2 nearby | Not asked anywhere. A list his 18th Edition covers. | One written question | **Not taken** (could be lesson 10's second Section B for about 0.05M; Dan to say) |
| Papers, B: generator sets (sources, switched alternative, kVA not kW) | none | No. Beyond his awards; Navy-relevant. | A topic | **Optional lesson 11** |
| Papers, B: protective measures, basic and additional protection, RCD requirements and tests, isolation and switching, undervoltage, Class II, reduced low voltage, supplementary bonding, CA2/BD4, schedule of inspections, earth electrode test, Sections 701, 706, 708, 709, equipment compatibility, maintainability, accessibility | none | His Level 3 awards cover them; the brief left them out on purpose (brief §5 "From the C&G papers") | Nothing new for real design work | **Drop** (decision unchanged) |

---

## 2. The shape of the additions

**(a) "More practice" screens inside built lessons.** The extras' new practice would land in i1
(board voltage from a percentage), i5 (the ≤ 16 mm² pf rule, the Ct slip) and i7 (minimum cpc as
numbers, armour with a core). Each needs the page re-built, re-filmed, re-reviewed and the lesson
re-fact-checked: about 0.3 to 0.5M each, 0.9 to 1.5M for three. i7's description already ran into
its 13 800-character limit during the A4 fixes (`a4-applied.md`), and i8's summary rule into its
limit, so more there means cutting what is there. It also spreads one job thinly over three lessons.

**(b) One new lesson.** A second whole job, in unit 5 beside the showroom capstone. Dan gets a full
Section A on figures he has not seen, the cpc decision worked as numbers, and the SWA cases in one
place, with a Keep this card that reads as a one-pass checklist for a real job. Lessons 1 to 9 are
untouched. About 1.2M.

**(c) A mix.** Lesson 10 plus patches gives nothing (b) does not, at twice the cost.

**Recommended: (b), lesson 10.** Optional: lesson 11, if Dan wants generators (section 7).
Light reading holds: lesson 10 is mostly typed answers; each text screen is kept under about 90 words.

---

## 3. Lesson 10: the brief entry

### In `brief.md` / `format/refresher.md` style

**10. A second job: the lathe, start to finish** (unit 5, The whole job)
- **Sources:** the course mock, parts 1 and 2 (the lathe circuit, with answers); the SWA-as-cpc handout;
  his BS 7671 Appendix 4 pages (Tables 4B1, 4C1, 4E1A, 4E1B, 4D1A, 4D1B) and On-Site Guide pages
  (Tables I1, I3, B6). C&G: a whole Section A, question 1 parts (a) to (g) and question 2 (cpc from
  design Zs and thermal constraints) as in papers 4 and 5, shapes only; the changed-numbers item takes
  paper 4's distribution-circuit shape with every figure changed.
- **Recalls:** "The lathe's cpc is cut from 4 mm² to 2.5 mm². Which checks must you work again?"
  Right: *Zs against the breaker's maximum, and the heat check*. Slips: *only the heat check* ("A
  thinner cpc has more resistance. Zs rises from 0.719 Ω to 0.815 Ω."); *the current rating and the
  voltage drop* ("The cpc carries no load current, so neither changes."). Right gives "Still there",
  the working, Refresh the why or Skip to the practice.
- **Re-teaches:** nothing new in the chain (i1 to i7). The why: the smallest cpc is set by
  whichever check fails first, and on this circuit it is the loop, not the heat. Then the cpc that is
  not a copper core: armour by Table 54.7's k1 ÷ k2 × S, armour and a core in parallel, and the two
  fixes when armour falls short.
- **Practises:** A, the lathe as one question, 5(a) to 5(h) (below), each part carried forward.
  B, the cpc judgement. Changed numbers: a distribution circuit with its drop limit given in volts.
- **Main picture:** the lathe circuit from DB2 with a cpc chooser (1.5, 2.5, 4 mm²) and a length slider
  (10 to 40 m). Two bars: Zs against its 0.87 Ω line, and the least cpc the heat needs against the cpc
  fitted. A readout gives the Cmin current against Ia 250 A and the longest run.
- **Keep this card:** a one-pass checklist with the cpc choices (below).
- **To source:** section 5.

### Screens (13; text screens under about 90 words; numbers from section 4)

| Step | Screen | What happens |
|---|---|---|
| 1 | **Do you still have it?** | The recall above (pick). |
| 2 | **What it is for** | Draft: "One whole job in one pass, on a circuit unlike the showroom's. A lathe motor, fed from a board below 400 V. Its cable shares trunking with two other circuits. Then a question every designer meets. Can the cpc be smaller than the table's size? Yes, if two checks still pass. Zs must stay within the breaker's maximum. And the cpc must take the fault's heat." Under it, in red, if it is skipped: a thinner cpc raises Zs, and the breaker may not open in time. |
| 3 | **The why** (interactive) | Draft: "At 27 m, a 2.5 mm² cpc gives Zs 0.815 Ω, within 0.87 Ω. For the heat it needs only 0.69 mm². A 1.5 mm² cpc gives 0.977 Ω and fails. So here the loop, not the heat, sets the smallest cpc. The 2.5 mm² cpc allows up to 30.5 m, the 4 mm² up to 39.8 m." `still`: cpc 2.5 mm², 27 m. |
| 4 | Check | "With the 2.5 mm² cpc, the lathe moves and the run becomes 32 m. Is it acceptable?" *No: Zs 0.892 Ω is over 0.87 Ω* (right) / *Yes: the cpc needs only 0.69 mm²* (heat only) / *Yes: R1+R2 0.492 Ω is within 0.87 Ω* (Zs at the board left out). |
| 5 | **Worked example**: steel armour as the cpc | Text: "Steel armour can be the cpc. A core in the same cable can share the job. Both are worked here, a step at a time." Lines revealed one at a time (section 4, SWA). Notes where the figures differ from the ones he may have written down: 49.73 cut short, 0.52 and 0.10 cut short; the heat at the Cmax current. |
| 6 | **Section A 5(a)** | Scenario panel, the lathe (`K.scenario` with the lesson's own title and text). "Determine the design current." Typed 21.74 A. |
| 7 | **5(b) to (d)** | In 25 A, Ca 1.02 and Cg 0.70 shown as working; "(d) Determine the minimum tabulated current, It." Typed 35.01 A; the reveal reads 4 mm² from Table 4E1A column 5 (37 A; 2.5 mm² is 28 A). A line on the terminals: rated at 90 °C here, an assumption. |
| 8 | **5(e)** | "Determine the voltage drop from the intake to the lathe, and whether it complies." Typed 17.87 V, inside 20.00 V. Reveal adds, if sourced: with a known power factor and conductors of 16 mm² or less, the drop may be taken as 5.87 × 0.91 = 5.34 V. |
| 9 | **5(f) and (g)** | Suitable cpc from Table 54.7: 4 mm² (shown). "The client asks for a 2.5 mm² cpc. (g) Determine Zs at the lathe." Typed 0.815 Ω; then the call: within 0.87 Ω, 268.10 A ≥ 250 A, so it opens within 0.1 s. |
| 10 | **5(h)** | "Determine the minimum cpc for the thermal constraints." Typed 0.69 mm² ≤ 2.5 mm². |
| 11 | **Section B** | b1 below (`K.written`). |
| 12 | Changed numbers | Below; typed 60.79 A. |
| 13 | **Keep this** | `K.summary()`, Finish. |

### Section B (b1)

**Q:** "The client asks for the lathe's cpc to be cut to 2.5 mm² to save copper. Explain whether you
would agree, and what the inspector must be told." `need`: any three.
1. Zs at the lathe is 0.815 Ω, within the 25 A type C breaker's 0.87 Ω, so the Cmin current of 268.10 A opens it within 0.1 s. (Table 41.3's figure and Cmin, as i6 cites them.)
2. The cpc needs only 0.69 mm² for the heat at the Cmax current, so 2.5 mm² passes 543.1.3. (slides p.58 to 62; Table 54.3's k 143.)
3. The margin is thin. With 2.5 mm², the run can be no longer than about 30.5 m, so a longer route or a later extension fails. (the longest-run rule on i6's Keep this card.)
4. A cold test reads about 0.725 Ω. That is over the 0.680 Ω rule-of-thumb limit for a 90 °C cable at 20 °C, though the circuit complies. So hand the inspector the expected reading and the corrected limit. (OSG p.139; i9's sources for the 320 rule.)
5. Table 54.7's 4 mm² is the suitable size; a smaller cpc is allowed only when the calculation shows it. (flowchart note 2; research 441.)

Model answer, from the points: it complies, but I would keep 4 mm², or fit 2.5 mm² only with the
expected test readings handed over.

### Keep this card (summary)

- **title:** A second job: the lathe, start to finish
- **for:** One pass through a whole design. Work Ib at the board's own voltage. Choose the device,
  then the cable for where it runs. Add every drop from the intake. Then choose the cpc. The table's
  size is safe. A smaller one is fine only when Zs and the heat check both pass.
- **rule** (under 600 characters):
  ```
  U at the board = U × (1 − the upstream drop)
  It ≥ In ÷ (Ca × Cg): Ca is above 1 below 30 °C
  Drop from the intake = upstream + mV/A/m × Ib × L ÷ 1000
  Smaller cpc: Zs ≤ the maximum, and S ≥ √(I² × t) ÷ k at Cmax
  Longest run = (max Zs − Zs at the board) × 1000 ÷ (mΩ/m × multiplier)
  Armour as cpc: at least k1 ÷ k2 × S (Table 54.7), or the adiabatic with k2
  Armour with a core: R2 = 1 ÷ (1 ÷ Ra + 1 ÷ Rc)

  Short of armour? Use a cable with an extra core, or run a cpc alongside.
  ```
- **traps** (five, each cited): checking only the heat when the cpc is cut (Zs rises); the heat
  check at the Cmin current; calling Table 54.7's size the minimum; a cpc that passes by a hair and
  then reads over the inspector's limit when cold; working Ct with the It the device needs, not the
  tabulated It of the cable chosen (cite Appendix 4 via i5's sources).
- **where:** Section 543 and Table 54.7; Appendix 4; Table 41.3.
- **figures:** 5a, 5c, 5e, 5g, 5h, l10.lmax25; **figuresLabel:** "The lathe so far" (the kit, the read
  view and the dossier all honour `summary.figuresLabel`; the validator lets it through).

### The changed-numbers item

C&G paper 4's shape, every figure changed: "A 40 A BS 88-2 fuse-switch feeds a 63 A TP&N workshop
board through a 26 m distribution circuit. After diversity it carries 32 A per phase. It is 70 °C
thermoplastic singles in trunking with two other circuits, at 35 °C. The drop must not exceed 6 V.
Determine the minimum tabulated current, It." Typed **60.79 A**. Reveal: 16 mm² (Table 4D1A column 5,
68 A; 10 mm² is 50 A); drop 2.4 × 32 × 26 ÷ 1000 = 2.00 V, inside 6 V. The board's 63 A rating is at
least its 40 A feed, as 536.4.202 now asks.

### `lessons.json` entry

```json
{
  "n": 10,
  "unit": "The whole job",
  "title": "A second job: the lathe, start to finish",
  "oneLine": "A whole design in one pass on a circuit unlike the showroom's, then the cpc: the table's size is safe, a smaller one passes only if Zs and the heat check both still hold, and steel armour, alone or with a core in parallel, can do the job.",
  "skill": "Design a motor circuit end to end at a board below 400 V; decide whether a smaller cpc can be used and what sets the smallest; justify armour as the cpc by Table 54.7 or the adiabatic, alone or in parallel with a core.",
  "specRefs": ["EAL ED4-01 checklist (eal-ed4-assign-01a-learner-pack.pdf p.8; QM p.13): 2.2, 3.0, 4.1, 4.2"],
  "materialRefs": [
    "extras/mock-part1-answers, mock-part2-answers (the course mock: the lathe circuit)",
    "extras/swa-as-cpc (three SWA cases)",
    "bs7671 p.441 (4B1), p.443 (4C1), p.448 (4D1A), p.449 (4D1B), p.458 (4E1A), p.459 (4E1B); OSG p.218 (I1), p.220 (I3), p.145 (B6)",
    "C&G 2396 papers 4 and 5, Section A shapes only, numbers changed",
    "case.json lesson 10"
  ],
  "picture": "The lathe circuit from DB2: choose the cpc (1.5, 2.5, 4 mm²) and drag the length; Zs against 0.87 Ω and the least cpc for the heat against the cpc fitted; at 27 m 1.5 mm² fails on Zs (0.977 Ω), 2.5 mm² passes (0.815 Ω, needs 0.69 mm²); longest runs 21.9, 30.5 and 39.8 m.",
  "builds_on": [1, 3, 5, 6, 7, 8, 9]
}
```

Also add the idea to `topic.json` (the plan; `assemble.mjs` allows up to 12 ideas for a shelf course)
and the shelf entry, as for i1 to i9.

---

## 4. Case-file additions (all checked by hand; course rounding: each line from the rounded figures before it, Ω to 3 places)

The scenario is the lesson's own, given through `K.scenario({title, text})`; the case keeps the
showroom as its scenario. Ids `5a` to `5h` continue the Section A numbering (1 and 2 the motor, 3 DBL2,
4 verification).

**Givens** (cite "mock p.1" or "mock 2 p.1" once the mock is a material; the C&G papers are not cited for figures):
`g.lathe.P` 12.5 kW; `g.lathe.pf` 0.91; `g.lathe.eff` 94%; `g.lathe.L` 27 m; `g.lathe.amb` 25 °C;
`g.lathe.group` two other circuits in the trunking; `g.lathe.cable` 90 °C thermosetting singles,
non-armoured, in trunking; `g.lathe.dev` type C, BS EN 60898; `g.lathe.up` the board's submain drops 3%;
`g.lathe.zdb` Zs at DB2 0.4 Ω (part 2); `g.lathe.ze` 0.12 Ω; `g.lathe.ipf` 8 kA; `g.lathe.supply`
TN-C-S, 400 V. Table values: `g.ca.25.90` 1.02 (p.441); `g.cg.3` 0.70 (p.443); `g.4e1a.4.c5` 37 A and
`g.4e1a.25.c5` 28 A (p.458, as corrected); `g.4e1b.4.c6` 10 mV/A/m (p.459); `g.r12.4_25` 12.02 mΩ/m and
`g.r12.4_15` 16.71 mΩ/m (OSG p.218: 4.61 + 7.41 and 4.61 + 12.10; check the rows on the page image,
the OCR dropped them); `g.zmax.C25` 0.87 Ω (held for i6); `g.ia.C25` 250 A (10 × In, held for i6/i7).
SWA: `g.swa6.4c.armour` 36 mm²; `g.swa25.5c.armourR` 1.8 Ω/km and `g.swa25.5c.armour` 88 mm²;
`g.swa25.4c.armour` 70 mm² (Prysmian, tools/77); `g.r.25` 0.727 mΩ/m; `g.k2.steel90` 46; `g.k1.cu90` 143.
Changed numbers: `g.ca.35.70` 0.94 (p.441); `g.4d1a.10.c5` 50 A and `g.4d1a.16.c5` 68 A (p.448);
`g.4d1b.16.c6` 2.4 mV/A/m (p.449).

**Assumptions** (said as the course's own):
- `a.lathe.zdb`: Zs at DB2 is taken as 0.4 Ω. Part 1 of the mock gives 0.97 Ω; with that, no 25 A type C could pass (Zs at least 1.289 Ω even with a 4 mm² cpc).
- `a.lathe.method`: the trunking is on a wall, so Reference Method B; the two other circuits are loaded.
- `a.lathe.terminals`: the lathe's terminals and the breaker allow 90 °C; on a real job, check the maker's data (Table 4E1A note 1).
- `a.lathe.cpc`: the cpc is a single core in the same trunking: k 143 (Table 54.3) and the 1.28 multiplier.
- `a.lathe.t`: at the Cmax current the breaker opens within 0.1 s (310.43 A is past 10 × 25 A).
- `a.swa.t`: the 40 A BS 88-2 fuse in the SWA example clears within 0.1 s at over 2 kA (to source from a maker's curve or Fig 3A3(b)); the 1.28 multiplier is used on the armour too, as in i7 (`a.armourR`).

**Figures**

| id | label | rule | work | text |
|---|---|---|---|---|
| l10.recall.r44 / .zs44 | 4 mm² cpc: R1+R2, Zs | mΩ/m × 1.28 × L ÷ 1000; Zdb + R1+R2 | 9.22 × 1.28 × 27 ÷ 1000 = 0.319 Ω; 0.4 + 0.319 = 0.719 Ω | 0.719 Ω |
| l10.U | Voltage at DB2 | 400 × (1 − 0.03) | 400 × 0.97 = 388 V | 388.00 V |
| **5a** | Lathe's design current | P ÷ (√3 × U × eff × pf) | √3 × 388 = 672.04; × 0.91 = 611.56; × 0.94 = 574.87; 12 500 ÷ 574.87 = 21.74 A | 21.74 A; accept 21.7 (mock), 21.77 (√3 as 1.73); slips 21.09 (400 V), 20.44 (eff left out), 19.79 (pf left out), 37.66 (no √3) |
| **5b** | Breaker rating | smallest standard In ≥ Ib, type C for starting | 25 A ≥ 21.74 A | 25 A; slip 20 A |
| l10.f | Factors together | Ca × Cg | 1.02 × 0.70 = 0.714 | 0.714 |
| **5c** | Minimum It | In ÷ (Ca × Cg) | 25 ÷ 0.714 = 35.01 A | 35.01 A; slips 35.71 (Ca left out), 24.51 (Cg left out), 30.45 (from Ib) |
| **5d** | CSA | Table 4E1A col 5 | 2.5 mm² 28 A < 35.01; 4 mm² 37 A ≥ 35.01; Iz = 37 × 0.714 = 26.42 A ≥ 25 A | 4 mm² |
| l10.vd | The lathe circuit's own drop | mV/A/m × Ib × L ÷ 1000 | 10 × 21.74 × 27 ÷ 1000 = 5.87 V | 5.87 V |
| **5e** | Drop from the intake | upstream + circuit, three-phase throughout | 12.00 + 5.87 = 17.87 V ≤ 20.00 V | 17.87 V; accept 17.86 (mock's 21.7 A), 17.88 (1.73); slips 5.87 (circuit only), 12.80 (÷ √3 wrongly) |
| l10.vd.pf | Drop with the known pf (≤ 16 mm²), only if sourced | tabulated × cos φ | 5.87 × 0.91 = 5.34 V; total 17.34 V | 5.34 V |
| **5f** | Suitable cpc | Table 54.7, S ≤ 16 mm² | same as the line | 4 mm² |
| l10.r12.25 | R1+R2 with a 2.5 mm² cpc | 12.02 × 1.28 × L ÷ 1000 | 12.02 × 1.28 × 27 ÷ 1000 = 0.415 Ω | 0.415 Ω |
| **5g** | Zs at the lathe, 2.5 mm² cpc | Zdb + R1+R2 | 0.4 + 0.415 = 0.815 Ω ≤ 0.87 Ω | 0.815 Ω; accept 0.81 (mock); slips 0.725 (multiplier left out), 0.535 (Ze for Zdb), 0.719 (4 mm² kept) |
| l10.imin | Cmin current | 230 × 0.95 ÷ Zs | 218.5 ÷ 0.815 = 268.10 A ≥ 250 A | 268.10 A |
| l10.imax | Cmax current | 230 × 1.1 ÷ Zs | 253 ÷ 0.815 = 310.43 A | 310.43 A |
| **5h** | Minimum cpc, thermal | √(I² × t) ÷ k | √(310.43² × 0.1) ÷ 143 = 0.69 mm² ≤ 2.5 mm² | 0.69 mm²; slips 0.59 (Cmin), 1.37 (t 0.4 s), 0.85 (k 115) |
| l10.why.15 | 1.5 mm² cpc at 27 m | as above | 16.71 × 1.28 × 27 ÷ 1000 = 0.577 Ω; Zs 0.977 Ω > 0.87 Ω; Cmin 223.64 A < 250 A; S at Cmax 258.96 A = 0.57 mm² | fails on Zs |
| l10.why.4 | 4 mm² cpc: heat | as above | Cmin 303.89 A; Cmax 351.88 A; S = 0.78 mm² | 0.78 mm² |
| l10.lmax15 / 25 / 4 | Longest run | (0.87 − 0.4) × 1000 ÷ (mΩ/m × 1.28) | 470 ÷ 21.39 = 21.97, 470 ÷ 15.39 = 30.54, 470 ÷ 11.80 = 39.83; each rounded down | 21.9 m, 30.5 m, 39.8 m |
| l10.check | Zs at 32 m, 2.5 mm² cpc | as above | 12.02 × 1.28 × 32 ÷ 1000 = 0.492 Ω; 0.4 + 0.492 = 0.892 Ω > 0.87 Ω | 0.892 Ω |
| l10.cold | Expected cold Zs, 20 °C | Zdb + R1+R2 at 20 °C | 12.02 × 27 ÷ 1000 = 0.325 Ω; 0.4 + 0.325 = 0.725 Ω; with 4 mm²: 0.4 + 0.249 = 0.649 Ω | 0.725 Ω |
| l10.cold.lim | Rule-of-thumb limit, 90 °C cable, 20 °C | Table 41.3 × (t + 230) ÷ 320 (i9) | 0.87 × 250 ÷ 320 = 0.680 Ω | 0.680 Ω |
| l10.swa.a | Armour needed, 6 mm² four-core | k1 ÷ k2 × S | 143 × 6 ÷ 46 = 18.65 mm² ≤ 36 mm² | 18.65 mm² |
| l10.swa.b | Armour needed, 25 mm² four-core | k1 ÷ k2 × 16 (16 < S ≤ 35) | 143 × 16 ÷ 46 = 49.74 mm² ≤ 70 mm² | 49.74 mm² |
| l10.swa.par | Core and armour in parallel | 1 ÷ (1 ÷ Rc + 1 ÷ Ra) | 1 ÷ (1 ÷ 0.727 + 1 ÷ 1.8) = 0.518 mΩ/m | 0.518 mΩ/m |
| l10.swa.r12 | R1+R2, 26 m | (0.727 + 0.518) × 1.28 × 26 ÷ 1000 | = 0.041 Ω | 0.041 Ω |
| l10.swa.zs | Zs | 0.06 + 0.041 | = 0.101 Ω | 0.101 Ω |
| l10.swa.imax | Cmax current | 253 ÷ 0.101 | = 2504.95 A | 2504.95 A |
| l10.swa.sa / .sc | Each path alone, 0.1 s | √(I² × 0.1) ÷ k | ÷ 46 = 17.22 mm² ≤ 88 mm²; ÷ 143 = 5.54 mm² ≤ 25 mm² | 17.22, 5.54 mm² |
| l10.changed | Changed numbers: It | In ÷ (Ca × Cg) | 0.94 × 0.70 = 0.658; 40 ÷ 0.658 = 60.79 A → 16 mm² (68 A); drop 2.4 × 32 × 26 ÷ 1000 = 2.00 V ≤ 6 V | 60.79 A; slips 42.55 (Cg left out), 57.14 (Ca left out), 48.63 (from Ib) |

Not asked, on purpose: breaking capacity at DB2. The mock gives 8 kA at the origin only, so DB2's
own fault level cannot be worked from what is given.

---

## 5. Sources

**His materials** (RUNBOOK §2). Convert each `source/extras/*.txt` to a one-page text PDF, as was done
for `build/electrical/motors/source/handouts` (each `.txt` beside its `.pdf`), then:
```
node tools/course/material.mjs --file $D/source/extras/mock-part1-answers.pdf --title "Course mock: the lathe circuit, part 1 (worked)" --slug mock-1 --out $D/tools
node tools/course/material.mjs --file $D/source/extras/mock-part2-answers.pdf --title "Course mock: the lathe circuit, part 2 (worked)" --slug mock-2 --out $D/tools
node tools/course/material.mjs --file $D/source/extras/swa-as-cpc.pdf --title "Group handout: SWA as the cpc" --slug swa-cpc --out $D/tools
```
and the same for the other handouts (cheap, and on record for the Book) and for papers 4 and 5 (cited
as shapes only, "numbers changed", as P1 to P3 are). The OCR text is noisy; quote only clean lines. A
garbled line can be corrected (`input.corrected`) only from the photo, which is not in the repo, so
ask Dan for the photos of the whiteboard handouts and the mock.

**Already held** (research.json, tool files): Tables 4B1, 4C1, 4D1A, 4D1B, 4E1A, 4E1B (his pages,
digits checked against the page images); OSG Tables I1 and I3 (p.218, 220), B6 (p.145), p.139 (measured
Zs at 10 °C); 0.87 Ω and Ia for a 25 A type C (i6); Cmin and Cmax, k 143 (slides p.47, 58 to 62, 68);
ABB's C band, 5 to 10 × In (source 234); Prysmian BS 5467 armour areas and resistances (sources
384 to 391, tools/77 for the 25 mm² row); k 46 for steel armour of 90 °C cable (sources 394, 437);
Table 54.7 as an alternative to calculation (441); i9's correction rules (the 320 rule).

**To research** (Sonnet, high; quotes checked word for word):
1. Table 54.7's rule for a cpc of another material: k1 ÷ k2 × S, and × 16 for 16 < S ≤ 35 mm² (NICEIC/ELECSA "Armouring of a cable as a protective conductor", source 439's page, refetch for the formula).
2. Armour and a core used together as the cpc, in parallel, and the fixes when armour falls short (an extra core, or a separate cpc alongside, 543.1 / 544 context): IET Wiring Matters or NICEIC.
3. Appendix 4 section 6.2: with a known power factor, conductors of 16 mm² or less, the drop may be taken as tabulated × cos φ (source 312's page may say it). Leave 5(e)'s note out if not quoted.
4. A BS 88-2 gG 40 A fuse's time at about 2 kA (a maker's time-current data), for the SWA example's 0.1 s.
5. Regulation 543.1.1 / 543.1.3: a cpc sized by calculation in place of Table 54.7 (if i7's flowchart note 2 citation is not enough for point 5).

---

## 6. Every handout figure re-derived, and the flags

**Flags (wrong, old, or unreadable)**

1. **Chasing the volt drop: Ct is wrong, and the conclusion flips.** It puts It = 17.02 A (the It the
   16 A device needs, 16 ÷ 0.94) into Ct. Ct needs the tabulated It of the cable being checked:
   4.0 mm² is 32 A (Table 4D1A col 4). Then Ct = (300 − (0.8836 − 13.04² ÷ 32²) × 40) ÷ 300 = 0.90,
   and 4.0 mm² drops 12.19 × 0.90 = 10.97 V (11.03 V unrounded), inside 11.50 V. So 4.0 mm² passes;
   the handout's "6 mm² still required" (Ct 0.96, 11.70 V) is wrong. Lesson 5 already has it right.
   Its 2.5 mm² line reads 19.90 V: 18 × 13.04 × 85 ÷ 1000 = 19.95 V (could be the OCR).
2. **SWA as cpc.** (a) R1+R2 of the 25 mm² four-core: printed 0.092 Ω; its own inputs give
   2.827 × 1.28 × 26 ÷ 1000 = 0.094 Ω (or an OCR misread). (b) Its armour data, 80 mm² and 2.1 mΩ/m
   from "Table F7C/F7A" in "the design book", differ from Prysmian's BS 5467 sheet for 25 mm² four-core
   circular (70 mm², 2.3 Ω/km); either way the armour is enough (49.74 mm² needed), and R1+R2 becomes
   0.101 Ω on Prysmian's figure. Its 36 mm² (6 mm² four-core) and 1.8 Ω/km (25 mm² five-core) match
   Prysmian. Use the maker's data for the cable bought. (c) "Max Zs 1.13 Ω (Table 41.4)" for a 40 A
   BS 88-2 at 5 s does not match his On-Site Guide: Table B3 gives 1.0 Ω maximum measured for 40 A
   (checked on the page image), which is 80% of the Table 41.4 figure, about 1.25 Ω. Check Table 41.4
   in his book. The conclusion stands (Zs 0.10 Ω). (d) The heat check uses the Cmin current, 2185 A
   (15.02 and 4.83 mm²). The course rule is Cmax: 2530 A gives 17.39 and 5.59 mm². Still a pass.
   (e) Cut short, not wrong: 49.73 (49.74), 0.52 (0.518), 0.04 and 0.10 (0.041, 0.101).
   (f) "Fig 3A3(b)… 0.1 s (400 A = Ia)" could not be checked (his Appendix 3 pages are not in the repo).
   (g) The 1.28 multiplier on armour is a simplification, as in lesson 7; armour runs cooler.
3. **PSCC example: heat at the Cmin current.** t = 143² × 2.5² ÷ 177.6² = 4.05 s is right
   arithmetic, but the course checks the heat at Cmax: 230 × 1.1 ÷ 1.23 = 205.69 A gives 3.02 s (the
   slides' figure); from the unrounded 1.241 Ω, 203.87 A and 3.08 s (lesson 7). Ze(l/n) 0.76 is
   0.767 cut short; Zs(l/n) 1.23 is 1.241. The conclusion (far longer than 0.1 s) stands.
4. **Mock part 1.** Zs at DB2 is 0.97 Ω here but 0.4 Ω in part 2. With 0.97 Ω no 25 A type C can pass
   (1.289 Ω even with a 4 mm² cpc, against 0.87 Ω), so take 0.4 Ω. Part (f) reads "dropped 5.59" in
   the OCR; the total 17.859 V means 5.859 V. Part (g) calls Table 54.7's 4 mm² "the minimum allowed
   cpc": it is the suitable size, not the minimum (lesson 7's trap). Ib printed 21.7 A (21.74 A).
5. **Mock part 2.** All right in substance; cut short along the way: R1+R2 0.41 (0.415), Zs 0.81
   (0.815), 269.7 A (268.10 A from 0.815 Ω), 312.3 A (310.43 A); S 0.69 mm² either way. "270x11" in
   the OCR is 230 × 1.1. It does not note how thin the margin is (30.5 m at most) or that a cold test
   would read about 0.725 Ω, over the 0.680 Ω rule of thumb. Lesson 10 makes both points.
6. **Summing three-phase into single-phase.** 11.54 V and 20.74 V are cut short (11.55 V, 20.75 V).
   Its example totals 9% from the origin, 20.75 V, far over the 11.50 V a single-phase power circuit
   may drop. It shows the method; it is not a compliant design, and it never says so. "Line to live"
   means line to line.
7. **Power factor.** Example 3: 5500 ÷ (230 × 0.96) = 24.91 A, not 24.94 A (could be the OCR).
   Example 2's 54.34 A is 54.35 A cut short. "pf between 0.01 and 0.99": a resistive load such as a
   heater has a power factor of 1.
8. **Three-phase cable design.** 75 A (30 000 ÷ 400) is the no-√3 slip, set against 43.30 A on
   purpose. But its two It's imply different factors (100 ÷ 108 = 0.926; 45 ÷ 56.4 = 0.798), the inputs
   are not stated, and 108 A on Table 4D1A column 5 is 35 mm² (110 A), not 50 mm², unless another
   method applies. 56.4 A gives 16 mm² (68 A), right. The prices (£2100, £635) are unsourced and dated.
9. **Greenhouse.** Its 705.411.1 summary leaves out the middle tier (socket-outlets over 32 A on an
   RCD of 100 mA or less); check against the A4 text. 705.522.16 (AF4, AG3), "422.3.202" and "test
   method E1" could not be checked here. The Ra of 73 Ω is never actually checked: 73 × 0.03 = 2.19 V
   and 73 × 0.3 = 21.90 V, both within 50 V (411.5.3). 411.3.4 applies to domestic premises only.
10. **Actual Zs less than calculated.** Nothing wrong; its 0.64 Ω is the slides' 0.646 Ω cut short.
11. **Old values.** No handout uses the 0.8 rule, and none uses a pre-2018 value: 0.87 Ω and Cmin 0.95
    are 18th Edition, and every Appendix 4 value they use (4B1 1.02, 4C1 0.70, 4E1A 37 A, 4E1B 10,
    4D1A 32 and 41 A, 4D1B 29, 18, 11 and 7.3) matches his A2 copy, which A4 left unchanged
    (`dv-audit.md`). The only suspect table value is the 1.13 Ω above. Papers 4 and 5 are 17th Edition
    (2013, 2014): any answers keyed to them would carry old values (a 25 A type C was 0.92 Ω, 230 ÷ 250,
    before Cmin). Their figures are not reused.
12. **Unreadable OCR.** Paper 4: "Z at this point… 0.03", "Ipf 17 kA Z=0.023 Ω", "Regulation 411.44204"
    (probably 411.4.204), "17 NADA". Paper 5: the order of questions 6 and 7 and several marks are
    jumbled. Mock: "FIRE CIRCUIT CROPPED 5.59", "Rithe of Fame CIRCUIT" (R1+R2 of the final circuit).
    Handouts: the Ct working lines ("(0.44-)", "0.29"), "Table F7C/F7A" sources, "B3/F3/13". None of
    these is needed for lesson 10's figures, which are all re-worked from the stated inputs.

**Re-derived and right** (to the course's rounding): mock 1 Ib 21.74 A, In 25 A, Ca 1.02, Cg 0.70,
It 35.01 A, 4 mm² (37 A), drop 5.87 V, total 17.87 V ≤ 20 V; mock 2 R1+R2 0.415 Ω, Zs 0.815 Ω ≤ 0.87 Ω,
Ia 250 A (Fig 3A5), k 143, S 0.69 mm²; SWA 18.65 mm², 36 mm², 49.74 mm², 0.518 mΩ/m, 0.041 Ω; PSCC
R1+Rn 0.474 Ω, Ia 100 A (20 A type B, Fig 3A4); chasing 32.14 V, 12.19 V, 8.09 V, 17.02 A, 41 A;
summing 20 V, 9.2 V; power factor 23.91 A; three-phase 43.30 A.

---

## 7. Optional lesson 11: other supplies, a TT outbuilding and a standby generator

Only if Dan wants it. Sketch:
- **Recall:** a TT circuit with a 30 mA RCD and Ra 73 Ω: is RA × IΔn within 50 V? 2.19 V, yes.
- **Why:** on TT the fault current is too small for a breaker, so an RCD gives fault protection; a
  generator's fault current is small too, which is why its circuits lean on RCDs, and why a set is
  rated in kVA (the alternator's heating follows its current whatever the load's power factor).
- **Section A:** the greenhouse (his handout's Ra 73 Ω, his own material): RA × IΔn at 30 mA and
  300 mA (2.19 V, 21.90 V); the largest Ra a 100 mA RCD allows (500 Ω, then the stability guidance);
  the kVA a standby set needs for a known load at a known power factor.
- **Section B:** paper 4's shapes: what to consider when a generator is a switched alternative to the
  public supply (551); why sets are rated in kVA.
- **To source:** 705.411.1 and 411.5.3 in A4 wording; GN3/OSG electrode guidance; Section 551 rules;
  a maker's generator fault-current data. Ship generators follow other rules; a screen may say so
  only where research quotes the difference (brief decision).
- **Cost:** about 1.2M (more web research than lesson 10).

---

## 8. Cost

| Piece | Tokens |
|---|---|
| Handouts and papers to PDF and tool files (material.mjs) | about 0.02M |
| Research for lesson 10 (section 5, five quotes) | about 0.1 to 0.15M |
| Lesson 10: write, fact-check, build and test the interactive, review, fix, confirm (a refresher lesson) | about 1.0M |
| Case file, lessons.json, topic.json, brief entry, assemble, db write, shelf | about 0.05M |
| **Recommended total** | **about 1.2M** |
| Instead, option (a): "More practice" in i1, i5 and i7 | 0.9 to 1.5M, and it reopens three passed lessons |
| Optional lesson 11 | about 1.2M more |

For comparison, the measured full process was about 1.65M a lesson (Fractions 4 to 8).

## 9. Build order (when Dan says go)

1. Convert and harvest the materials (section 5); research the five quotes; `sources.mjs` to failed 0.
2. Add the givens, assumptions and figures (section 4) to `case.json`; `validate.mjs case`.
3. Add lesson 10 to `lessons.json`, `topic.json` and `brief.md`'s short version.
4. RUNBOOK §3 to §8 for i10 with `--prior` (models and effort per CLAUDE.md; at most three attempts at
   the interactive). Validate with `--case`.
5. Assemble, write to the db, mark the shelf; report the token cost.

## 10. For Dan

1. Lesson 10 as above: go?
2. Lesson 11 (TT outbuilding and standby generator): yes or no?
3. "Reasons for dividing an installation into circuits" as a second written question in lesson 10:
   yes or no (about 0.05M)?
4. Do you still have the photos of the whiteboard handouts and the mock? Garbled lines can then be
   corrected and quoted. Which book is "Table F7A/F7C, the design book"?
