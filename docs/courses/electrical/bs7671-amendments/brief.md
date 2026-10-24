> **Dropped (Dan, 24 Oct 2026):** "I don't want a course on what changed in amendment 3 and 4, that's pointless." Not to be built. The A3/A4 changes live in the courses themselves instead: Design and verification is corrected to A4 (dv-audit.md), and Inspection and testing will be built to A4 (a4-for-inspection-and-testing.md).

# Amendments 3 and 4: what changed. The course brief

Written 20 Oct 2026 for Dan, answering the course brief in `tools/course/RUNBOOK.md` section 0. A plan
only: nothing is researched in full, written or built. I took the decisions for you and listed them in
section 9. Change any you like.

**Why this course.** Your Design and verification course was built to BS 7671:2018+A2:2022, from your
Level 4 materials. A4:2026 was published on 15 April 2026, and the A2+A3 book was withdrawn on
15 October. Today A4 is the only current edition. I audited Design and verification against A3 and A4
(`dv-audit.md`) and listed every change that touches design, verification, inspection, testing and
certification (`changes.md`, 44 entries). This course teaches those changes, briefly, to someone who
already knows A2 well.

**How the lessons read.** In your own-words style (Dan, 20 Oct): the sources are for getting it right,
not for showing. No lesson says where something comes from. A regulation number appears where you
would look it up on a job, which is most screens here, because this course is a map of the new book.

**The format.** The light format of the Motors course: steps lessons of about eight screens, one
interactive picture each, choice checks, and a Keep this card. No case file, no Section A or B, no
typed calculations, no written answers.

---

## The short version

**Five lessons, grouped by what you do with them:**

| # | Unit | Lesson | The one interactive picture |
|---|---|---|---|
| 1 | Supplies and sources | Two-way power: PNB, bidirectional devices and sources | A board fed by the grid and a battery: flip import to export and watch which devices are fed backwards, and where a source may connect |
| 2 | Supplies and sources | Boards and batteries: what can overload an assembly | A 100 A board: drag the incoming device, add circuits, switch on diversity, load management or PV, and see which of the three routes holds |
| 3 | Selection and erection | Fire, walls and wiring | A wall elevation: drag a cable route, toggle depth and metal parts, and see what the run needs |
| 4 | Selection and erection | New and changed installations: PoE, ICT earthing, EV, outdoor lighting, medical, marinas | Power over Ethernet: drag the power per port and choose two or four pairs, and see the current in each conductor against 750 mA |
| 5 | Verification | Inspection, testing and the EICR | An EICR: sort observations into C1/C2 and C3/FI, then flip between A3 and A4 rules and watch the outcome |

**Every lesson has the same light shape,** about eight screens: a recall opener on what you knew under
A2; what changed, in a few plain sentences; the picture; a check; a second group of changes; a check;
what did not change, so you stop worrying about it; Keep this.

**What your documents give and lack.** Your five Drive files are summaries: Electrical Safety First's
domestic pocket guide, EAL's Q&A fact sheet, the EAL/IET webinar slides (the qualification slides are
scrambled), a page index of the A4 book, and the free A3 bolt-on. They name the changes well and give
almost no detail. The web filled most of it (SELECT, Hager, BEAMA, NICEIC, the IET's free A4 forms and
Wiring Matters). Research must quote each change word for word before a lesson teaches it (section 6).
The A4 book itself would settle the rest: if you have the orange book, photographs of the pages in
section 6 would make this course exact.

**Cost:** about 3.7M tokens for research and five lessons (section 8), roughly 0.74M a lesson with
research.

---

## 1. The overall topic

What BS 7671 Amendment 3 (2024) and Amendment 4 (2026) changed, for a designer and inspector trained
on A2:2022. It covers every change that alters a design decision, an inspection item, a test, a form
or a code. It also says plainly what did not change: the maximum Zs tables, disconnection times, Cmin
and Cmax, the current tables above ground, the voltage drop limits.

**Edges.** In: A3's bidirectional devices; A4's PNB, definitions, Chapters 42, 43, 51 to 57, Part 6
and Appendix 6, the new Sections 545 and 716, the Part 7 changes that touch your work (709, 710, 714,
722; 702 in one line), Chapter 81 in one line. Out: teaching any topic from scratch (Design and
verification, and Inspection and testing, do that), battery chemistry, PoE network design, medical
location design beyond what an inspector meets, the Building Safety Act itself.

**Who it is for.** You: L3 18th Edition (Feb 2025, so A2, perhaps with the A3 bolt-on), L4 Design and
Verification, and the three Level 3 inspection and testing awards (Oct 2025), all on A2 material. You
do not need to resit anything. Your qualifications stay valid.

**Starting point.** Nothing in A2 is re-taught. Each lesson names the A2 rule you know and then the
change: "You know 536.4.202 says overload protection must not rest on diversity alone. A4 now says
it outright and gives three routes."

**Your aim.** Royal Navy electrical engineering, leading rate and Level 3 marine engineering. Lesson 4
carries the one marine change (709, marinas: the isolating transformer). Battery storage and two-way
power, lessons 1 and 2, are the changes most like ship's systems: several sources on one board.

---

## 2. The lessons, in the order they build

**The order.** Sources first, because PNB and two-way power change how you read every board. Then
what those sources do to board ratings and batteries. Then the selection and erection changes, then
the special installations, then inspection and the EICR, where all of it is checked and recorded.

**Each lesson's screens:**

| Step | Screen | Kind |
|---|---|---|
| 0 | Do you still have it? An A2 rule, as you learned it | DO, choice, the wrong options are the usual slips |
| 1 | What changed: three to five plain sentences, with the regulation numbers | SHOW |
| 2 | The picture | SHOW, interactive |
| 3 | Check on the change | DO, choice |
| 4 | The second group of changes | SHOW |
| 5 | Check | DO, choice |
| 6 | What did not change | SHOW |
| 7 | Keep this | the summary card |

### Unit 1: Supplies and sources

**1. Two-way power: PNB, bidirectional devices and sources**
- Recall: "Under A2, which TN-C-S arrangements did the certificate list?" One TN-C-S box / PME and
  PNB / TN-C only.
- What changed: the old book is withdrawn, so new work is A4 (dates in one line, and "do not mix
  editions"). PNB is now a recognised TN-C-S variant: one consumer per source, the PEN earthed at an
  electrode close to your terminals. ESQCR 8(4) still applies on a public network. The forms have
  separate PME and PNB boxes (312.2.1.1). A3's two definitions: unidirectional and bidirectional
  protective devices, chosen to suit the flow (530.3.201), with "line/load", "in/out" or arrows on
  unidirectional ones.
- Picture: a board with a grid supply, a battery and PV. A switch flips import to export. Arrows show
  current through each device. A unidirectional RCBO fed from its load side turns red; a bidirectional
  one stays green. A second control moves the battery's connection: on the supply side of the final
  circuit devices (green) or onto a final circuit like a load (red, 551.7.2.1), or on the load side of
  an RCD (flagged, 551.7.1(d)). No currents are given, only directions.
- Check 1: "PV exports through an RCBO marked line and load, connected the usual way round. Is that
  right?" Only if the RCBO is bidirectional / yes, any RCBO / only with a Type B.
- Second group: 551.7.1(c), a suitable device where energy flows both ways; a stationary battery is a
  generating set, not a load (551.7.2.1); new words you will meet: disconnector (off-load),
  switch-disconnector (on-load), transfer switching equipment, inherently short-circuit and earth
  fault proof.
- Check 2: "A battery is added to a house. Where may it connect?" Supply side of all the final circuit
  devices / on the kitchen radial / on the load side of an RCD.
- Not changed: earthing types other than PNB; the PME rules for outdoor EV points in substance.
- Keep this: rule lines "PNB: TN-C-S, one consumer per source, PEN earthed near you. Record it as
  PNB", "530.3.201: choose devices for the direction of flow", "551.7.2.1: a battery is a generating
  set; supply side of the final circuit devices". Traps: "PNB recorded as PME", "a unidirectional
  device back-fed", "a battery wired in like a load", "a source on the load side of an RCD".

**2. Boards and batteries: what can overload an assembly**
- Recall: "Under A2, could diversity alone protect an RCCB in a consumer unit against overload?" No /
  yes / only below 63 A.
- What changed: 536.4.202 redrafted. A board (InA) and any outgoing unit such as an RCCB (Inc) is
  protected by one of three routes: the feeding device no bigger than InA and Inc; load curtailment
  capping the demand; or the whole connected load, with no diversity, within InA and Inc. Diversity is
  never load curtailment, load control or overload protection. Inc can be below the device's own
  marked rating: it is in the board maker's papers.
- Picture: a board with InA 100 A (an example value). Drag the incoming device: 60, 80, 100, 125 A.
  Add circuits from a palette. Switches: "apply diversity", "load management at 100 A", "PV export".
  Three route lamps show which holds. Diversity changes the maximum demand figure but never lights a
  route. With PV on, the 551.7.2.2 panel appears: InA against the incoming device plus the
  generator's output, a single device, an export limit scheme, or the full connected load. All sums
  are shown and computed from these rules.
- Check 1: "A 100 A board fed by a 125 A fuse. Its circuits add to 140 A, 70 A with diversity. Does it
  comply?" Not unless load management caps it / yes, diversity takes it to 70 A / yes, the circuits
  are protected.
- Second group: Chapter 57, stationary batteries: in dwellings, a location by the maker's instructions
  and PAS 63100, elsewhere by the fire strategy; ventilation; Type B RCD on the AC side unless the PCE
  gives separation or its maker says otherwise; notices at the origin, the meter, every board it
  feeds, and on the PCE (isolate AC and DC). Out of scope: plug-in UPSs, fire alarm and emergency
  lighting batteries. The old 551.8 group is gone.
- Check 2: "A home battery's PCE gives no separation and the maker says nothing about RCDs. Which RCD
  on its AC side?" Type B / Type A / Type AC.
- Not changed: 536.4.3.2 still lets an RCCB's rating be chosen with diversity, if it is protected
  against overload.
- Keep this: the three routes as three lines; 551.7.2.2's four options in one line each; Chapter 57's
  four checks. Traps: "diversity used to rate a board", "a board's InA read off its main switch",
  "a battery's RCD left at Type A without the maker's word", "notices missed at sub-boards".

### Unit 2: Selection and erection

**3. Fire, walls and wiring**
- Recall: "Under A2, where were AFDDs required?" Higher risk residential buildings, HMOs, student
  accommodation and care homes / every dwelling / nowhere.
- What changed: 421.1.7(a) now says high-rise residential buildings, to keep clear of the Building
  Safety Act's "higher-risk building"; the rest of the list is unchanged. Escape routes: nothing in a
  fire-fighting shaft or protected stairway beyond fire safety systems, general lighting and cleaning
  sockets (422.2.201); fire-rated cables in a fire-resisting enclosure count as outside the route
  (422.2.202). Premature collapse (521.10.202) is about wiring falling on people escaping and
  firefighters, not keeping circuits alive.
- Picture: a wall elevation, 2.4 m by 3 m, with a socket and a switch. Drag a cable route. The 150 mm
  zones shade in. Toggles: depth under or over 50 mm, wall with or without metal parts, 30 mA RCD
  present. The panel says what the run needs: in a zone with an RCD, or the 522.6.204 protection, or
  nothing extra. A "bury it" toggle moves the scene outside: the run then needs earthed armour or an
  N750 duct (522.8.10).
- Check 1: "A cable 30 mm deep, outside every zone, in a stud wall with metal parts, with RCD
  protection. Enough?" Not unless it has the 522.6.204 protection / yes, the RCD covers it / yes,
  30 mm is deep enough.
- Second group: Table 51, functional earth identified by symbols or pink, green-and-yellow only for
  protective conductors; conductor class at terminals, fine-wire ends treated (526.2, 526.9.1); RCDs
  in series, each suited to the residual current, no Type A above a Type B, and so on (531.3.3,
  Figure A53.2); selectivity needs the downstream RCD to switch the neutral too (536.4.1.4);
  firefighter's switches where the fire strategy asks (537.4.2); the SPD assembly's second fuse only
  where its maker says (Figure 534.5).
- Check 2: "A Type A RCCB feeds a Type B RCBO for a heat pump. Any problem?" Yes, the Type A may be
  blinded unless the maker declares the pair / no, Type A is the better type / no, an RCBO is
  separate.
- Not changed: the 150 mm zones, the 50 mm depth, Type AC only for fixed loads with no DC.
- Keep this: the escape route rules in two lines; the concealed-cable decision in three; Table 51's
  pink; the RCD series order. Traps: "HRRB read as every higher-risk building", "premature collapse
  read as fire survival", "a Type A above a Type B", "flexible tails bare in a screw terminal".

**4. New and changed installations: PoE, ICT earthing, EV, outdoor lighting, medical, marinas**
- Recall: "Under A2, what did BS 7671 say about Power over Ethernet?" Nothing; it was outside scope /
  it was SELV so exempt / Section 715 covered it.
- What changed: PoE is now in scope (110.1.1, Section 716). A compliant power sourcing equipment, or a
  source of not more than 60 V DC in dry places and 15 V elsewhere; product energy classes may not be
  SELV (716.414.3.4); not more than 750 mA in any conductor (716.523.3.101). Section 545: functional
  earthing and bonding for ICT, with a main functional earthing terminal and bonding ring conductors.
- Picture: a PoE run. Drag the power delivered at the port; choose two or four pairs and the source
  voltage. The current per conductor is P ÷ V shared over the conductors carrying each polarity,
  computed and shown, against a 750 mA line; a bundle-size slider shows only that grouped cables run
  warmer, with no invented temperatures. The source-voltage choice turns red over 60 V, or over 15 V
  when "wet location" is ticked.
- Check 1: "90 W over four pairs at 50 V. Within 750 mA a conductor?" Yes: 1.80 A over four
  conductors each way is 0.45 A (computed) / no, 1.80 A is over 750 mA / yes, PoE is SELV so no limit.
- Second group: EV (722): each point on its own 30 mA RCD, Type A, F or B, or an RDC-PD in its place;
  DC fault protection unless the charger has it; no AFDD on EV circuits (722.421.1.7.201). Outdoor
  lighting (714.411.3.4): lighting the public can reach needs a 30 mA RCD unless SELV; "lighting"
  includes wiring and gear; inaccessible means out of reach or locked away at IK08 or better. Medical
  (710): groups 0 to 2, no AFDDs there or on medical IT circuits, a new schedule for supplementary
  bonding resistances. Marinas (709.313.1.101): an isolating transformer between hull and shore, the
  supply PE kept off the socket's earth. Hot tubs outdoors now fall under 702.
- Check 2: "Walkway bollards in a car park, 230 V. Which protection is required besides the
  breaker?" A 30 mA RCD / none, they are outdoors but fixed / an AFDD.
- Not changed: 722's ban on a PEN in the charging circuit, and the open-PEN measures for PME.
- Keep this: PoE's two numbers (60 V or 15 V; 750 mA); 545 in one line; EV in two; 714 in one; 710
  and 709 in one each. Traps: "PoE left to the IT contractor", "an AFDD fitted on an EV circuit",
  "public lighting on a plain MCB", "a ship's PE taken straight to the shore socket".

### Unit 3: Verification

**5. Inspection, testing and the EICR**
- Recall: "Under A2 and A3, what did one FI code do to an EICR?" Made it unsatisfactory / nothing /
  only with a C3.
- What changed: Chapter 64 tests did not change. The EICR did. 653.1: the report follows the Appendix
  6 model and its notes for the person producing it, rewritten; 653.2: it carries guidance for the
  recipient; photographs and thermal images may be appended; the signatures are those of the people
  who inspected, tested and authorised. Section K is in two parts: C1 and C2, which make it
  unsatisfactory; C3 and FI, which are advisory. FI is "advised", no longer "without delay".
- Picture: an EICR's Section K. Eight observation cards (example findings, each labelled as such):
  drag each into part one or part two and give it a code. A switch flips "A3 rules / A4 rules": the
  overall outcome changes on the FI cards only. Two cards are traps: an unidentified circuit and a
  0.6 MΩ insulation reading. Put either in FI and the card explains why it needs a code instead.
- Check 1: "An A4 EICR: one C3, two FI, no C1 or C2. The outcome?" Satisfactory / unsatisfactory /
  it cannot be issued.
- Second group: the forms. EIC and minor works: minor changes: PNB box, Zdb on the minor works form,
  AFDD test button and SPD indicator notes, the maximum Zs source note. The inspection schedule
  cites 530.3.201 for fault protection devices. Annex B710 for medical bonding.
- Check 2: "A circuit is not labelled at the board. Code it FI?" No, it breaks 514.8.1, so code it /
  yes, it needs investigation / yes, if you could not trace it.
- Not changed: the tests, Table 64, RCD testing at IΔn, maximum Zs and the 80% rule for measured
  values, the next-inspection box.
- Keep this: "C1, C2: unsatisfactory. C3, FI: advisory"; "FI only for what the limits hid, which
  might be C1 or C2"; "653.1 notes, 653.2 recipient guidance, photos allowed"; "record PNB". Traps:
  "FI as a parking place", "an A3 report read with A4 rules", "PNB ticked as PME", "signing for
  someone else's tests".

---

## 3. Can it be taught mostly visually, through interaction?

**Partly.** Most changes are rules, not mechanisms. Each lesson has one picture where the rule is a
decision you can play with (back-feeding, board routes, the wall, the PoE current, the EICR outcome).
The rest is short SHOW text with regulation numbers, and choice checks whose wrong options are the
mistakes an A2-trained electrician will make. So: steps lessons, `format: 'steps'`, about eight
screens, SHOW screens of up to a short paragraph.

## 4. What else

- **Benchmark.** There is no Brilliant course. The comparable courses are the bodies' A4 update
  courses (NICEIC, NAPIT, the EAL award, City & Guilds 2382-26). They are lecture courses grouped by
  Part. This course groups by what you do instead, and adds what they lack: the outcome flip from A3
  to A4 shown live, and the board routes worked as numbers.
- **The mistakes to catch** (each caught by a check): FI still treated as failing a report; diversity
  used to rate a board; PNB recorded as PME; a unidirectional device back-fed; a battery wired like a
  load; HRRB read as the Building Safety Act's higher-risk building; premature collapse read as fire
  survival; Type A above Type B; PoE treated as not electrical; an AFDD on an EV circuit; public
  lighting without an RCD; "the Zs tables changed" (they did not).
- **Where it is used.** Every design, EIC and EICR you write from now on. Lessons 1 and 2 most on
  domestic and commercial PV and battery jobs; lesson 5 on every periodic inspection.
- **Links to your other courses.** Design and verification lessons 2, 6, 8 and 9 carry small fixes
  from the audit; this course's lessons 2, 4 and 5 are where those changes are taught. Inspection and
  testing is to be taught to A4 from the start (`a4-for-inspection-and-testing.md`).

## 5. What your documents cover

| Document | Gives | Lacks |
|---|---|---|
| ESF pocket guide (A4, domestic) | Every headline change with its regulation: PNB, 421.1.7, 422.2, 433.3.1, 434.2, 536.4.202, Table 51, 551, Chapter 57, 716, 81, 537.4.2, 545, Chapter 65 and FI | Detail and numbers. Its 421.1.7 wording is the reverse of the IET's (section 7) |
| EAL/IET webinar slides | Chapter 42 and 52 items, 536.4.202 load curtailment, Figure A53.2, 545, 551.7.2, 716's 750 mA, Chapter 57 regulations, 710, 722.531.3.101's new wording | The Part 6 and form changes; its qualification slides are scrambled |
| EAL Q&A fact sheet | Dates; no resits | Technical content |
| A4 quick reference | Page numbers in the A4 book | Content |
| A3 bolt-on | The two A3 definitions and 530.3.201 | Nothing missing: A3 is that small |

## 6. What research must add (public sources first)

Quote each change word for word before a lesson teaches it. The sources found on 20 Oct are listed in
`changes.md` with URLs:
- SELECT, "So what's new?": most of Parts 1 to 8 and the appendices, with regulation numbers.
- Hager's A4 bitesize guide: 536.4.202's three routes, 551.7.2.2's four options, 531.3.3 and
  536.4.1.4 notes, Chapter 57's RCD rule and notices, 714.411.3.4's notes.
- The IET's free A4 EIC, minor works and EICR forms: every form change, quoted from the form.
- IET Wiring Matters 110 (July 2026), "Further investigation": the FI change, its history and the two
  misuse examples.
- NICEIC's A4 page: the two-part Section K and PNB on the forms.
- BEAMA's A4 presentation: RDC-PD in 722.531.3.101, AFDDs on EV circuits.
- For PoE (lesson 4's picture): the IEEE 802.3 source voltages and pair counts, from a maker's
  application note, so the example powers are real.
- **From the A4 book, if you can photograph them** (the summaries describe these only in outline):
  551.7.1(c) and (d), 433.3.1, 434.2.1, the 522.6 table and its number, 422.2.201 and 422.2.202 (the
  numbering differs between sources), 716.414.1.1, 722.531.3.101 and 722.411.4.1, and Appendix 6's
  Section K notes.

## 7. Errors and gaps in the sources (said kindly)

- **ESF's pocket guide** says 421.1.7 now refers to "higher-risk buildings" as the Building Safety
  Act defines them. The IET's own slides, Hager, BEAMA and SELECT say the reverse: the wording moved
  to "high-rise residential buildings" to avoid the Act's term. Teach the IET's.
- **Numbering differs** for the escape-route enclosure rule (the IET slides "422.2.2", SELECT
  "422.2.202") and the concealed-cable table (SELECT "Table 52.1", while the A4 page index still lists
  Table 52.1 as cable operating temperatures). Settle from the book.
- **Appendix 4's buried cables** are contested: SELECT reports new methods 72 and 73 and reference
  method D2; a software firm says no reference method or table changed. It does not touch this
  course's pictures; one line at most, once settled.
- **ECalPro**, a calculator site, claims A4 cut a 32 A type C maximum Zs from 0.72 to 0.68 Ω. It is
  wrong (0.68 Ω has stood since 2015) and the page invents regulation numbers. Never cite it.
- **One trade site** reports A4 deleted a "reasonably practicable" exception in 722.411.4.1. Not in
  any other source: check the book before teaching it.

## 8. Size and cost

Five lessons of about eight screens, one interactive each, no case file, no Section A or B.

| Item | Estimate |
|---|---|
| Research, once (quoting each change; forms are free; the book pages if you send them) | about 0.45M |
| Lessons 1 and 2 (live two-way flows; board routes with sums) | about 0.75M each, 1.5M |
| Lessons 3 to 5 | about 0.6M each, 1.8M |
| **Total** | **about 3.7M** (0.74M a lesson with research) |
| Against the measured full process (1.65M a lesson, Fractions 4-8) | 8.25M for five; this is under half |

A four-lesson version, folding lesson 4's special installations into lessons 3 and 5 as one screen
each, would cost about 3.1M but lose the PoE picture. The pilot: research and lesson 5 (the EICR),
about 1.05M, because it changes your work most often. Stages and models as in `CLAUDE.md` (research
on Sonnet at high, build on Opus at xhigh, at most three attempts per interactive). No new app work:
the Keep this card is `lesson.summary`, drawn with no case file, as Motors does.

## 9. Decisions taken for you

1. **Five lessons by what you do:** sources, boards and batteries, selection and erection, special
   installations, verification.
2. **Light format,** as Motors: about eight screens, one picture, choice checks, Keep this.
3. **Every recall opener is an A2 rule,** so each lesson starts from what you know.
4. **Each lesson ends on "what did not change",** so you stop doubting the Zs tables.
5. **Regulation numbers on screen,** because this course is a map of the new book.
6. **A3 is one screen in lesson 1:** it is only two definitions and one regulation.
7. **Example values only where labelled,** such as a 100 A board; every sum is computed from a
   shown rule.
8. **Pilot lesson 5,** the EICR, because the FI change touches every periodic inspection.

## 10. Questions for you

1. Do you have the A4 orange book, or access to it? Photographs of the pages in section 6 would
   make the course exact.
2. Five lessons, or four with the special installations folded in?
3. Pilot lesson 5 first, or lesson 1 as usual?
4. Should the Design and verification fixes in `dv-audit.md` be made before this course is built?
   They are small, and the course can point back to them.
