# Design and verification against A3 and A4: the audit

20 Oct 2026. Every lesson's words (explanation, practice, Section A and B, summary card, checks,
screens as the guide and body draw them) and case.json, read against the changes in
[changes.md](changes.md). Machine-readable copy: [dv-audit.json](dv-audit.json). Nothing was edited.

**must** = now wrong or out of date. **should** = worth adding. Replacements are written in the
lessons' own-words style. The docs/courses copies are byte-identical to the build files, so each fix
applies to both.

## Summary

Audit of the nine Design and verification lessons and case.json against BS 7671 A3:2024 and A4:2026, 20 Oct 2026. No worked figure changes: A4 leaves the maximum Zs tables, disconnection times, Cmin and Cmax, the above-ground current tables and the voltage drop limits as they were. Lessons 1, 3, 4 and 5 need nothing. Three things matter most. Lesson 8: C7's walkway bollards are lighting the public can reach, so the circuit needs a 30 mA RCD (an RCBO), and any buried feed needs armour or an N750 duct; A2 already required the RCD and A4 sharpens it. Lesson 2: A4's 536.4.202 says outright that diversity is never a board's overload protection, so the Section B point that switchgear may be chosen on diversified demand is wrong for boards. Lesson 6: the EV answer should name the RDC-PD that A4 accepts in place of the RCD, say no AFDD is needed, and drop its "check the amendment" hedge. Smaller: lesson 7 names 434.2.1 for the motor leg, lesson 9 asks for PME or PNB, and case.json's edition line is out of date.

| Lesson | must | should |
|---|---|---|
| i1 Design current | 0 | 0 |
| i2 Maximum demand | 2 | 3 |
| i3 Device and cable | 0 | 0 |
| i4 A neutral that carries more than the line | 0 | 0 |
| i5 Voltage drop from the intake | 0 | 0 |
| i6 Shock protection and Zs | 0 | 3 |
| i7 Surviving the fault | 0 | 1 |
| i8 The showroom, end to end | 1 | 2 |
| i9 Verification and handover | 0 | 1 |
| case.json | 1 | 2 |

## i1: Design current

Nothing changes. Design current, power factor, efficiency, the board voltage and diversity as guidance: nothing in A3 or A4 touches them. Its EAL scenario says TN-C-S; the PME note belongs to the case file.

## i2: Maximum demand

### 1. MUST: 536.4.202 (A4 redraft); 536.4.3.2

- **Where:** build/electrical/design-and-verification/i2.lesson.verified.json, written.b1.points[3].text (Section B point, also in the Book)
- **Now:** You can choose the supply, submains and switchgear for the demand they will really carry, not for every load at once.
- **Replace with:** You can choose the supply and submains for the demand they will really carry, not for every load at once. A board is different. Its rating must cover the device that feeds it, or its whole connected load taken at 100%. Otherwise load management must cap its demand.
- **Note:** Add to the point's cite: "BS 7671:2018+A4:2026 Regulation 536.4.202".
- **Source:** https://select.org.uk/common/uploaded%20files/Technical/FreeDownloads/2026_Amendment_4_Whats_New.pdf ; https://assets.sc.hager.com/uk/-/media/project/hagerdeep/united-kingdom/hager/b2b-uk/support/amendment-2-18th-edition/amendment-4/bitesize-guide-amd4-digital.pdf ; https://electrical.theiet.org/bs-7671-18th-edition-wiring-regulations/faqs/consumer-units-and-protective-devices-faqs

### 2. MUST: 536.4.202

- **Where:** build/electrical/design-and-verification/i2.lesson.verified.json, written.b1.model (Section B model answer, step "Section B", also in the Book)
- **Now:** It also lets you choose the supply, submains and switchgear for the demand they will really carry.
- **Replace with:** It also lets you choose the supply and submains for the demand they will really carry. A board's own rating is not cut by diversity. It must cover the device that feeds it, or its whole connected load, unless load management caps the demand.
- **Source:** https://select.org.uk/common/uploaded%20files/Technical/FreeDownloads/2026_Amendment_4_Whats_New.pdf ; https://assets.sc.hager.com/uk/-/media/project/hagerdeep/united-kingdom/hager/b2b-uk/support/amendment-2-18th-edition/amendment-4/bitesize-guide-amd4-digital.pdf

### 3. SHOULD: 536.4.202

- **Where:** build/electrical/design-and-verification/i2.lesson.verified.json, summary.rule (Keep this card), after the line "Diversity figures are guidance, not a rule. Use them only where common sense allows."
- **Now:** (no line on boards)
- **Replace with:** A board is never sized by diversity. The device feeding it is no bigger than its rating, or its full connected load fits, or load management caps it.
- **Source:** https://select.org.uk/common/uploaded%20files/Technical/FreeDownloads/2026_Amendment_4_Whats_New.pdf ; https://assets.sc.hager.com/uk/-/media/project/hagerdeep/united-kingdom/hager/b2b-uk/support/amendment-2-18th-edition/amendment-4/bitesize-guide-amd4-digital.pdf

### 4. SHOULD: 536.4.202

- **Where:** build/electrical/design-and-verification/i2.lesson.verified.json, summary.traps (Keep this card), add a sixth trap
- **Now:** (five traps, none on boards)
- **Replace with:** {"text": "Counting on diversity to keep a board, or an RCCB inside it, from overload. The device feeding it must be no bigger than its rating, unless load management caps the demand or the full connected load fits.", "cite": "BS 7671:2018+A4:2026 Regulation 536.4.202"}
- **Source:** https://select.org.uk/common/uploaded%20files/Technical/FreeDownloads/2026_Amendment_4_Whats_New.pdf ; https://assets.sc.hager.com/uk/-/media/project/hagerdeep/united-kingdom/hager/b2b-uk/support/amendment-2-18th-edition/amendment-4/bitesize-guide-amd4-digital.pdf ; https://electrical.theiet.org/bs-7671-18th-edition-wiring-regulations/faqs/webinar-questions-and-answers/electrical-diversity-and-load-curtailment-evc-webinar/

### 5. SHOULD: 536.4.202

- **Where:** build/electrical/design-and-verification/i2.lesson.verified.json, practice.text, a new last bullet
- **Now:** (ends: "Then compare the heaviest phase with the supply.")
- **Replace with:** - Check each board against the device that feeds it. The board's rating must be at least that device's, or its full connected load must fit. Diversity sizes the supply and submains, never the board.
- **Source:** https://select.org.uk/common/uploaded%20files/Technical/FreeDownloads/2026_Amendment_4_Whats_New.pdf ; https://assets.sc.hager.com/uk/-/media/project/hagerdeep/united-kingdom/hager/b2b-uk/support/amendment-2-18th-edition/amendment-4/bitesize-guide-amd4-digital.pdf


## i3: Device and cable

Nothing changes. Ib ≤ In ≤ Iz, I2 ≤ 1.45 Iz (433.1.1, 433.1.201), the rating factors and Tables 4B1, 4C1, 4D5 and 4E1A are not reported changed. The motor leg protected only against fault current by the upstream breaker is picked up in lesson 7.

## i4: A neutral that carries more than the line

Nothing changes. Table 4Aa and Regulation 523.6.1 are not reported changed.

## i5: Voltage drop from the intake

Nothing changes. mV/A/m × Ib × L, the 3% and 5% limits (Table 4Ab), Ct and the r, x method are not reported changed.

## i6: Shock protection and Zs

### 1. SHOULD: 722.531.3.101

- **Where:** build/electrical/design-and-verification/i6.lesson.verified.json, written.b2.points[3].text (Section B (2) point, also in the Book)
- **Now:** Each charging point needs RCD protection, including protection against DC fault currents over 6 mA. That means a Type B RCD, or a Type A or F RCD with a device that detects them, unless the charger provides it.
- **Replace with:** Each charging point needs its own RCD of 30 mA or less, Type A, F or B. A device to BS IEC 62955 called an RDC-PD may take its place. Each point also needs protection against DC fault current of 6 mA or more. That is a Type B RCD, or a Type A or F RCD with a device that detects DC, unless the charger provides it.
- **Note:** Add to the cite: "BS 7671:2018+A4:2026 Regulation 722.531.3.101".
- **Source:** source/eal-iet-a4-master-slides.txt (EAL/IET webinar, 16 Apr 2026, slide 21) ; https://www.eda.org.uk/wp-content/uploads/2026/08/Requirements-for-electrical-installations-18th-Edition-amendment-4_April-2026.pdf ; https://electrical.theiet.org/wiring-matters/years/2024/100-may-2024/rcds-for-electric-vehicle-supply-equipment-evse

### 2. SHOULD: 722.421.1.7.201

- **Where:** build/electrical/design-and-verification/i6.lesson.verified.json, written.b2.points, a new sixth point (need stays "any three")
- **Now:** (no point on AFDDs)
- **Replace with:** {"text": "No AFDD is needed on a circuit to EV charging equipment with standard charging sockets or connectors.", "cite": "BS 7671:2018+A4:2026 Regulation 722.421.1.7.201"}
- **Source:** https://select.org.uk/common/uploaded%20files/Technical/FreeDownloads/2026_Amendment_4_Whats_New.pdf ; https://www.eda.org.uk/wp-content/uploads/2026/08/Requirements-for-electrical-installations-18th-Edition-amendment-4_April-2026.pdf

### 3. SHOULD: 722.531.3.101; 722.421.1.7.201

- **Where:** build/electrical/design-and-verification/i6.lesson.verified.json, written.b2.model (step "Section B (2)", also in the Book): its last four sentences
- **Now:** Each charging point needs RCD protection, including protection against DC fault currents over 6 mA. That means a Type B RCD, or a Type A or F RCD with a detecting device, unless the charger provides it. Load management can be added to bring the maximum demand down, but it is optional. Section 722 has changed in recent amendments. Check it against the amendment you work to.
- **Replace with:** Each charging point needs its own RCD of 30 mA or less, or an RDC-PD in its place. It also needs protection against DC fault current: a Type B RCD, or a Type A or F RCD with a device that detects DC, unless the charger provides it. No AFDD is needed on the charging circuit. Load management can be added to bring the maximum demand down, but it is optional.
- **Source:** source/eal-iet-a4-master-slides.txt (EAL/IET webinar, 16 Apr 2026, slide 21) ; https://www.eda.org.uk/wp-content/uploads/2026/08/Requirements-for-electrical-installations-18th-Edition-amendment-4_April-2026.pdf ; https://select.org.uk/common/uploaded%20files/Technical/FreeDownloads/2026_Amendment_4_Whats_New.pdf


## i7: Surviving the fault

### 1. SHOULD: 434.2.1 (redrafted in A4; new term "inherently short-circuit proof and earth fault proof")

- **Where:** build/electrical/design-and-verification/i7.body.final.html, step "Section A 2(c)", the closing lines after "Its 1.5 mm² cpc holds too."
- **Now:** Take the starter-to-motor leg as 3.0 m for practice. Zs at the motor is then 0.459 Ω. ... Its 1.5 mm² cpc holds too.
- **Replace with:** Add after it: "The 25 A breaker at DBP2 guards this smaller leg against fault current. That works because the leg can take the fault's heat. Regulation 434.2.1 sets the conditions for a device placed upstream of a step down in size."
- **Source:** https://select.org.uk/common/uploaded%20files/Technical/FreeDownloads/2026_Amendment_4_Whats_New.pdf ; source/a4-pocket-guide.txt (ESF pocket guide, section 5.0)


## i8: The showroom, end to end

### 1. MUST: 714.411.3.4 (A2, A4 notes); 522.8.10 (A4 note)

- **Where:** build/electrical/design-and-verification/i8.body.final.html, step "Section A 3(h)" (the AS_3H text, line 240), and the same words in steps 3(i) and 3(j) where they repeat
- **Now:** A 6 A type C breaker protects it, because LED drivers draw a surge at switch-on. ... The bollards are outdoors, so a real design would pick a cable fit for that run. Here, assume the same singles run all the way.
- **Replace with:** A 6 A type C RCBO protects it. Type C, because LED drivers draw a surge at switch-on. An RCBO, because the walkway bollards are lighting the public can reach, so they need a 30 mA RCD unless they run on SELV. Its maximum Zs is the same 3.64 Ω, so the sums do not change. ... The bollards are outdoors. A cable buried to them needs earthed armour, or a duct strong enough to stand in for it. Here, assume the same singles run all the way, to keep the sums simple.
- **Note:** A2 already required the RCD (714.411.3.4); A4 adds that "lighting" includes its wiring and control gear, and that only lighting out of reach or locked away behind IK08 counts as inaccessible. 522.8.10 note: N750 duct counts. No figure changes. In 3(i), "the breaker opens within 0.1 s" stays true of the RCBO's overcurrent part.
- **Source:** https://assets.sc.hager.com/uk/-/media/project/hagerdeep/united-kingdom/hager/b2b-uk/support/amendment-2-18th-edition/amendment-4/bitesize-guide-amd4-digital.pdf ; https://select.org.uk/common/uploaded%20files/Technical/FreeDownloads/2026_Amendment_4_Whats_New.pdf ; https://www.cibse.org/media/esqlg20r/bs_7671_18th-ed-amd-2-cibse-iet-lecture-april-2022-with-additional-notes.pdf

### 2. SHOULD: 536.4.202

- **Where:** build/electrical/design-and-verification/i8.body.final.html, the "Before you call the design done" checklist (step "What it is for", and ticked again in step 3(j))
- **Now:** Every length of the run ... Breaking capacity at each device.
- **Replace with:** Add a line after "Breaking capacity at each device.": "Each board rated at least the device that feeds it." Ticked in 3(j) as: "DBL2 on a 10 A breaker, far inside its rating."
- **Source:** https://select.org.uk/common/uploaded%20files/Technical/FreeDownloads/2026_Amendment_4_Whats_New.pdf ; https://assets.sc.hager.com/uk/-/media/project/hagerdeep/united-kingdom/hager/b2b-uk/support/amendment-2-18th-edition/amendment-4/bitesize-guide-amd4-digital.pdf

### 3. SHOULD: 714.411.3.4

- **Where:** build/electrical/design-and-verification/i8.lesson.verified.json, summary.rule (Keep this card), after "Icn ≥ the fault level at the device"
- **Now:** (no line on RCDs)
- **Replace with:** Lighting the public can reach: a 30 mA RCD as well, unless it is SELV.
- **Source:** https://assets.sc.hager.com/uk/-/media/project/hagerdeep/united-kingdom/hager/b2b-uk/support/amendment-2-18th-edition/amendment-4/bitesize-guide-amd4-digital.pdf ; https://select.org.uk/common/uploaded%20files/Technical/FreeDownloads/2026_Amendment_4_Whats_New.pdf


## i9: Verification and handover

### 1. SHOULD: 312.2.1.1; Appendix 6 forms (TN-C-S (PME) and TN-C-S (PNB) boxes)

- **Where:** build/electrical/design-and-verification/i9.lesson.verified.json, written.b2.points[4].text and written.b2.model; summary.for; and i9.body.final.html step "Handing over" (the list item "The supply's characteristics.")
- **Now:** The supply's characteristics, such as the declared Ze. / ... and the supply's characteristics, such as the declared Ze of 0.1 Ω.
- **Replace with:** Point: "The supply's characteristics: the declared Ze, and the earthing. On a TN-C-S supply, say whether it is PME or PNB." Model: "And I would give the supply's characteristics: the declared Ze of 0.1 Ω, and whether the TN-C-S supply is PME or PNB." Handing over list: "The supply's characteristics, including PME or PNB."
- **Source:** https://electrical.theiet.org/media/tqxkkscw/bs7671_eic_a4.pdf ; https://niceic.com/amendment-four/ ; https://select.org.uk/common/uploaded%20files/Technical/FreeDownloads/2026_Amendment_4_Whats_New.pdf


## case.json

### 1. MUST: (edition status: A2+A3 withdrawn 15 Oct 2026)

- **Where:** build/electrical/design-and-verification/case.json, "edition" (and docs/courses copy)
- **Now:** BS 7671:2018+A2:2022, as Dan's course taught it (flowchart title). Whether A3:2024 changes anything here is not checked.
- **Replace with:** Worked to BS 7671:2018+A2:2022, as Dan's course taught it (flowchart title). Checked against A3:2024 and A4:2026 on 20 Oct 2026 (build/electrical/bs7671-amendments/dv-audit.md): no figure changes; word fixes in lessons 2, 6, 7, 8 and 9.
- **Source:** source/a4-qa-fact-sheet.txt ; https://www.napit.org.uk/news/amendment-4-to-bs-7671-takes-full-effect-from-today-october-15/

### 2. SHOULD: 312.2.1.1

- **Where:** build/electrical/design-and-verification/case.json, assumptions: add a.pme
- **Now:** (g.supply says only "Three phase four wire 400 V, TN-C-S", pack p.3)
- **Replace with:** {"id": "a.pme", "text": "The course's own assumption: the TN-C-S supply is PME, the usual public supply. The pack says only TN-C-S. The certificate now asks whether TN-C-S is PME or PNB."}
- **Source:** https://select.org.uk/common/uploaded%20files/Technical/FreeDownloads/2026_Amendment_4_Whats_New.pdf ; https://electrical.theiet.org/media/tqxkkscw/bs7671_eic_a4.pdf

### 3. SHOULD: 714.411.3.4; 522.8.10

- **Where:** build/electrical/design-and-verification/case.json, assumptions: add a.c7rcd, and extend a.lightCable
- **Now:** a.lightCable: "...the longest lighting circuit (C7) is 1.5 mm² 90 °C thermosetting singles in conduit..." (no RCD, no buried section)
- **Replace with:** {"id": "a.c7rcd", "text": "The course's own assumption: C7's walkway bollards are lighting the public can reach and are not SELV, so C7 is on a 6 A type C RCBO with a 30 mA residual rating. Its maximum Zs is the same 3.64 Ω. Any buried length to the bollards would be armoured cable or in a duct of equal strength; the sums take the singles all the way, for simplicity."}
- **Source:** https://assets.sc.hager.com/uk/-/media/project/hagerdeep/united-kingdom/hager/b2b-uk/support/amendment-2-18th-edition/amendment-4/bitesize-guide-amd4-digital.pdf ; https://select.org.uk/common/uploaded%20files/Technical/FreeDownloads/2026_Amendment_4_Whats_New.pdf ; https://www.cibse.org/media/esqlg20r/bs_7671_18th-ed-amd-2-cibse-iet-lecture-april-2022-with-additional-notes.pdf


## Regulation, table and page numbers the lessons cite

- **Regulations 311.1, 411.3.2, 433.1.1, 433.1.201, 434.5.1, 434.5.2, 523.6.1, 543.1.3, 652.1, 722.311.201, 722.531.3.101; Tables 41.1 to 41.5, 43.1, 54.2 to 54.7, 4Aa, 4Ab, 4B1, 4C1 (notes 5 and 9), 4D1A, 4D1B, 4D5, 4E1A, 4E1B, 4E4A.** None is reported moved or renumbered by A3 or A4. 722.531.3.101 keeps its number but its content changed (RDC-PD; i6 fix). 434.2 beside 434.5 was redrafted, 434.5 itself is not reported changed. The summaries do not list every renumbering, so confirm in the A4 book.
- **"Your copy" page numbers: p.443, 448, 449, 458, 459, 464, 465 (i3 summary.traps[4].cite; i5 written.b1.points[4].cite; source titles "Your copy of BS 7671:2018+A2:2022").** Right for Dan's A2 pages. An A4 book paginates differently: its Appendix 4 starts on p.448 (source/amd4-quick-reference.txt), so the tables sit later. If he moves to the A4 book, drop the page numbers and keep the table names.
- **On-Site Guide page and table references: OSG p.90, 124, 136, 139, 140, 145, 146, 170, 189, 217 to 220; Tables I1, I2, I3, B6, B8; Appendix A, B, I.** His OSG is the A2 edition. The IET has published an A4 edition. Values tied to unchanged tables (maximum measured Zs = 0.8 × Table 41.3) should not change, but page numbers may. Check before citing an A4 OSG.
- **IET Guidance Note 3 Table 3.2 (inspection intervals; i9 written.b1.points[3].cite; case a.interval, g.interval.gn3).** GN3 has been updated to A4. The 5-year commercial figure is not reported changed; the table number is unchecked.
- **Not cited by the lessons, for completeness.** A2 551.8 (batteries) deleted, now Chapter 57; A2 Appendix 17 (energy efficiency) removed, now Chapter 81.

## What was checked and found unchanged

Maximum Zs (25 A type C 0.87 Ω, 6 A type C 3.64 Ω, 10 A type C 2.19 Ω, 6 A type B 7.28 Ω), Table 41.5's
1667 Ω at 30 mA, the 0.4 s and 5 s times, Cmin 0.95 and Cmax 1.1, the 80% rule for measured Zs, k values,
the adiabatic check, Icn ≥ IPF, the 3% and 5% voltage drop limits, the Table 4Aa rows, the 30% grouping
note, 722.311.201 load curtailment, the PME rule for outdoor charge points (one trade source reports A4
dropped a "reasonably practicable" exception the lesson never used), the 5-year commercial interval, and
the EIC's next-inspection and maximum-Zs-source wording, which the A4 form keeps.
