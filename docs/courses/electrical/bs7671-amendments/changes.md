# BS 7671 Amendments 3 (2024) and 4 (2026): what changed

Compiled 20 Oct 2026 for Dan, for design, verification, inspection and testing, and certification.
Today A4 is the only current edition: BS 7671:2018+A4:2026 was published 15 Apr 2026, and
BS 7671:2018+A2:2022+A3:2024 was withdrawn 15 Oct 2026.

**How to read this.** Each entry says what changed in plain words, the regulation, and the
source keys (listed at the end with URLs). These are summaries by the IET, trade bodies and makers,
not the standard itself. Where only one source says something, or sources disagree, the entry says
so. Single values and regulation numbers only; nothing is copied from the standard's tables. Before
a design relies on an entry, read the regulation in the A4 book.

Confidence: **firm** = the IET, or two or more independent sources, agree. **single** = one source
only. **contested** = sources disagree.

---

## A. Status and dates

1. **A3:2024.** Published 31 Jul 2024 as a free bolt-on to the brown A2 book. It added two
   definitions and one regulation, nothing else (see 4). A4 folds it into the main text.
   Source: A3, IET-press. Firm.
2. **A4:2026 dates.** Published 15 Apr 2026 and usable at once. A2+A3 withdrawn 15 Oct 2026. From
   then, new installations must meet A4. A job designed to A2+A3 before withdrawal may still be
   built and verified to it where the contract agrees. Pick one edition and apply all of it: do not
   mix clauses. An older installation that does not meet A4 is not unsafe for that reason alone.
   Source: EAL-QA, IET-update, NAPIT, SELECT, Hager, ESF. Firm.
3. **No resits.** Existing 18th Edition and inspection and testing qualifications stay valid.
   Source: EAL-QA. Firm.

## B. Part 1 and Part 2: scope and words

4. **Uni- and bidirectional protective devices (A3).** Two new definitions. A bidirectional device
   may have a source connected to either or both sets of terminals. A unidirectional one may have a
   source on one defined set only. Regulation 530.3.201: protective devices are chosen with that in
   mind. RCCBs, RCBOs, circuit-breakers and AFDDs must be marked if unidirectional: "in/out",
   "line/load" or arrows. Reg 530.3.201. Source: A3, Hager, SELECT. Firm.
5. **Scope.** Reg 110.1.1 now covers stationary secondary batteries used for storage and supply,
   and Power over Ethernet. Source: SELECT, Hager, BEAMA-EDA. Firm.
6. **New and changed definitions.** Among them: battery, primary cell, secondary cell, transfer
   switching equipment, balanced cable, protective neutral bonding (PNB), "inherently short-circuit
   proof and earth fault proof", disconnector, switch-disconnector, isolating switch, fire-fighting
   shaft and protected stairway. New abbreviations include EEMS (electrical energy management
   system) and MFET (main functional earthing terminal). Part 2. Source: SELECT, Hager, ESF. Firm.

## C. Part 3: supplies

7. **Protective neutral bonding (PNB).** A recognised variant of TN-C-S. There is one point in the
   network where consumers connect to a single source. The PEN is earthed at an electrode away from
   the transformer, as close as practicable to the consumer's terminals, to limit the voltage rise if
   the PEN breaks. New Figure 3.9B. On a public network, PME conditions may apply, and ESQCR
   regulation 8(4) still bars using the public neutral as a protective conductor. The model forms now
   offer "TN-C-S (PME)" and "TN-C-S (PNB)" as separate earthing boxes. Reg 312.2.1.1. Source: SELECT,
   ESF, NICEIC, IET-EICR, IET-MW. Firm.

## D. Part 4: protection for safety

8. **AFDDs, 421.1.7(a).** "Higher risk residential buildings" became "high-rise residential
   buildings". The change avoids the Building Safety Act's own term, "higher-risk building", which
   would have pulled in more buildings. The other places where AFDDs are required are unchanged:
   HMOs, purpose-built student accommodation, care homes. Elsewhere AFDDs stay recommended for
   single-phase socket circuits up to 32 A. Reg 421.1.7. Source: Hager, BEAMA-EDA, SELECT, IET-slides.
   **Contested wording:** ESF's pocket guide says the regulation now refers to "higher-risk buildings"
   as the Act defines them. The IET, Hager, BEAMA and SELECT all say the reverse. Take the IET's.
9. **Protected escape routes, 422.2.** New 422.2.201: no cables or electrical equipment in a
   fire-fighting shaft or a protected stairway, except for essential fire safety systems, general
   lighting, and sockets for cleaning or maintenance. New 422.2.202: fire-rated cables inside a
   suitably fire-resisting enclosure count as outside the protected escape route. 422.2.1 lists the
   cables allowed in protected escape routes. Appendix 13 rewritten to match. Reg 422.2.1, 422.2.201,
   422.2.202. Source: SELECT, ESF, IET-slides. Firm on substance. **Numbering:** the IET slides call
   the enclosure rule "422.2.2", SELECT "422.2.202". Check the book.
10. **Overload, 433.3.1.** Redrafted to set out more clearly how conductors are protected against
    overload, including when overload protection may be left out. The summaries give no new
    numbers or conditions. Reg 433.3.1. Source: ESF. Single on detail.
11. **Fault current, 434.2.** Redrafted. Overload and fault protection are kept clearly separate.
    434.2.1, on where the fault protective device sits when the conductor gets smaller, now uses the
    defined term "inherently short-circuit proof and earth fault proof". A note says a
    non-combustible enclosure such as metal conduit or trunking lowers the risk. Reg 434.2, 434.2.1.
    Source: SELECT, ESF. Firm that it changed; the exact conditions need the book.
12. **Chapter 41 tables: no change reported.** Disconnection times (Table 41.1), the maximum Zs
    tables (41.2 to 41.4) and Table 41.5 are unchanged, and Cmin stays 0.95. Source: bs7671a4-site;
    none of SELECT, Hager, ESF or the IET lists a change. Firm by absence. **One trade calculator site
    (ECalPro) claims a 32 A type C limit "reduced from 0.72 to 0.68 Ω" in A4. That is wrong: 0.68 Ω
    has been the figure since 2015, and the same page invents a "Chapter 72" and "Table 72A".
    Do not use it.**

## E. Part 5: selection and erection

13. **Table 51, conductor identification.** Adds symbols and identification for functional earthing
    and bonding conductors, and for combined protective and functional ones. Pink identifies
    functional earth by colour (pink replaced cream in A2). Green-and-yellow stays restricted to
    protective conductors. Table 51. Source: SELECT, ESF. Firm.
14. **Premature collapse, 521.10.202.** A note gives its intent: stop wiring collapsing in a fire and
    hindering escape, rescue or firefighters. It is not about keeping circuits working in a fire;
    that is Chapter 56 and the fire alarm, emergency lighting and fire-fighting codes. Reg 521.10.202.
    Source: SELECT, IET-slides, ESF. Firm.
15. **Cables concealed in walls, 522.6.** A new table brings the existing rules together by wall type
    (with or without metal parts) and depth (under or over 50 mm): a prescribed zone with 30 mA RCD
    additional protection, or the mechanical protection of 522.6.204. The 150 mm zones are unchanged.
    Reg 522.6.202 to 522.6.204. Source: SELECT, IET-slides. Firm on substance. **Numbering:** SELECT
    calls it Table 52.1, but A4's own quick-reference lists Table 52.1 as cable operating temperatures,
    as before. Check the number in the book.
16. **Buried cables, 522.8.10.** Unchanged rule: armour or metal sheath, earthed, unless in conduit or
    duct giving equal protection; marked by cable covers or tape; deep enough. New note: underground
    conduit with impact rating N750 to BS EN 50626-1 or BS EN 61386-24 counts as equal protection.
    Reg 522.8.10. Source: SELECT, IET-slides. Firm.
17. **Connections, 526.2 and 526.9.1.** Conductor class (1 solid, 2 stranded, 5 flexible, 6 very
    flexible) must be taken into account when choosing the terminal. Fine-wire ends must not splay:
    use suitable terminals or treat the ends, a crimp or ferrule for example. New conductor class
    table. Reg 526.2, 526.9.1. Source: SELECT, IET-slides. Firm.
18. **RCDs in series, 531.3.3.** New note: every RCD in series must suit the residual current the
    loads and faults can make. New Figure A53.2: a Type AC should not sit upstream of A, F or B; an A
    not upstream of F or B; an F not upstream of B; unless the maker declares the pairing suitable.
    The worry is "blinding" of the upstream RCD. Reg 531.3.3. Source: SELECT, Hager, IET-slides. Firm.
19. **RCD selectivity, 536.4.1.4.** New note: for selectivity on both line-earth and neutral-earth
    faults, the downstream RCD must switch every live conductor, neutral included. The existing
    conditions stay: upstream Type S or suitably delayed, ratio at least 3 to 1. Source: Hager. Single.
20. **Board overload, 536.4.202.** Redrafted. A board, consumer unit or other assembly is protected
    against overload in one of three ways: (a) the device feeding it is rated no higher than the
    board's rated current, InA, and any outgoing unit's, Inc, such as an RCCB; (b) load curtailment
    limits its demand; or (c) its whole connected load, without diversity, is within InA and Inc. It
    states outright that diversity is not a means of load curtailment, load control or overload
    protection. Inc is the outgoing unit's rating inside that assembly, which can be lower than the
    device's own marked rating, and should be in the maker's documents. A2 already said overload
    protection must not rest on diversity alone. Regulation 536.4.3.2 still lets an RCCB's rating be
    chosen with diversity, provided it is protected against overload. Reg 536.4.202, 536.4.3.2.
    Source: SELECT, Hager, ESF, IET-FAQ, IET-EVC. Firm.
21. **Isolation devices, Table 537.4.** Now names the disconnector (off-load) and the
    switch-disconnector (on-load, the isolating switch) as well as the isolating switch. Table 537.4.
    Source: SELECT, Hager, IET-slides. Firm.
22. **Firefighter's switches, 537.4.2.** Redrafted: required where the building's fire strategy,
    set by the fire engineer, calls for them. Examples given: high-voltage outdoor lighting and
    low-voltage indoor discharge lighting. Reg 537.4.2. Source: SELECT, ESF. Firm.
23. **SPD assembly, Figure 534.5.** The key now says the second overcurrent device is needed only
    "where specified by the SPD manufacturer". SPD selection rules otherwise unchanged in the
    summaries. Source: Hager. Single.
24. **ICT functional earthing, new Section 545.** Functional earthing and functional equipotential
    bonding for ICT: minimum sizes, identification, continuity, a main functional earthing terminal
    (MFET), bonding ring conductors. Ties to 444 (electromagnetic disturbances). Source: SELECT, ESF,
    IET-slides, IET-press. Firm.
25. **Generating sets, 551.7.1.** New indent (c): a suitable protective device where energy flows
    both ways. New indent (d): a source must not be connected on the load side of an RCD under
    certain conditions. Reg 551.7.1. Source: SELECT, Hager, ESF. Firm on substance; the conditions in
    (d) need the book.
26. **Generating sets, 551.7.2.1 and 551.7.2.2.** A generating set goes on the supply side of every
    final-circuit protective device in a board. A stationary battery counts as a generating set, not
    a load. Where a generator runs in parallel through a board, the board's InA must be at least one
    of: the incoming device plus the generators' output; a single device all supplies pass through;
    the maximum an export and import limitation scheme allows (ENA G100); or the total connected load
    without diversity, with a notice on the board giving that limit. Reg 551.7.2.1, 551.7.2.2.
    Source: IET-slides, Hager, SELECT. Firm.
27. **Batteries moved.** The A2 battery group 551.8 is deleted; batteries now sit in Chapter 57.
    Source: WM-DPC (proposal), Hager. Firm.
28. **Safety services, 560.6.** Uses the new terms primary and stationary secondary batteries. Central
    safety power supply systems to BS EN 50171. Source: SELECT. Single.
29. **New Chapter 57, stationary secondary batteries.** Over 18 regulations. Out of scope: batteries
    built into products with their own standards, such as plug-in UPSs, fire alarm and emergency
    lighting systems. Covers the battery, the power conversion equipment (PCE) and the energy
    management system; earthing; shock protection; DC-side fault protection; isolation; ventilation
    to the maker's instructions (570.6.3); location: in dwellings by the maker's instructions and
    PAS 63100, elsewhere by the fire strategy (570.6.7.203); RCD on the AC side Type B unless the PCE
    gives at least simple separation, or a transformer does, or the PCE maker says Type B is not
    needed (570.6.2.2); notices at the origin, at the meter if remote, and at every board a battery
    feeds (570.6.8.201), and on PCE to isolate both AC and DC sides (570.6.8.203). Source: IET-slides,
    Hager, SELECT, ESF, IET-press. Firm.

## F. Part 6: inspection and testing

30. **Chapter 64, initial verification: no substantive change.** Same tests and order, Table 64
    insulation test voltages, RCDs proved by an AC test at IΔn. Source: SELECT ("very little change",
    only Chapter 65), InspectElec. Firm by absence.
31. **Chapter 65, the EICR.** 653.1: the report follows the Appendix 6 model and takes account of
    its notes for the person producing it, which are rewritten. 653.2: the report includes guidance
    for its recipients, also redrafted. A note allows photographs and thermal images to be appended.
    The signatures must be those of the people who did the inspection and testing and who authorise
    the report. Reg 653.1, 653.2. Source: SELECT, ESF, WM-DPC, InspectElec. Firm.
32. **EICR codes and outcome.** Section K is split in two. Part one holds C1 and C2 observations,
    which make the report unsatisfactory. Part two holds C3 and FI, which are advisory and do not
    affect the overall outcome. FI now reads "further investigation is advised"; "without delay"
    is gone. Under A3, an FI made the report unsatisfactory. FI is only for an apparent deficiency
    that the inspection's limits stopped you identifying, and which might prove C1 or C2. It is not for
    an unidentified circuit or an insulation reading below the Table 64 minimum; those get a code.
    Appendix 6, Section K. Source: NICEIC, WM-FI, IET-EICR, ESF, WM-DPC. Firm.
33. **Model forms, Appendix 6.** Minor changes to the EIC and minor works certificate, major changes
    to the EICR. Seen on the IET's A4 forms: separate TN-C-S (PME) and TN-C-S (PNB) boxes; the minor
    works form records Zdb, the loop impedance at the board feeding the final circuit; notes that not
    every AFDD has a test button and not every SPD shows its state; the inspection schedule cites
    433.1 and 533.2.1 for coordination of conductors and overload devices, and 411.3 and 530.3.201
    for fault protection devices; a maximum Zs taken from anywhere but the Chapter 41 tables is
    sourced in the remarks column. A trade blog adds a new inspection item for prosumer installations
    (single, check). Source: IET-EIC, IET-EICR, IET-MW, SELECT-forms, NICEIC; grafter for the prosumer
    item.
34. **Medical locations schedule.** New Annex B710 records each supplementary bonding conductor's
    resistance, at initial verification (710.64) and periodically (710.65). Source: IET-press,
    SELECT, IET-slides. Firm.

## G. Part 7: special installations

35. **702, pools.** Scope adds religious and ceremonial pools and outdoor hot tubs. 702.55.5: hot tubs
    to BS EN 60335-2-60. Source: SELECT. Single.
36. **709, marinas.** 709.313.1.101: isolating transformer to BS EN 61558-2-4 between the hull and
    shore metalwork; the supply's protective conductor is not connected to the earth terminal of the
    socket feeding the vessel. It stops galvanic currents and corrosion. Source: SELECT. Single.
37. **710, medical locations, major revision.** Groups 0, 1 and 2. Group 2 needs two independent
    supplies (BS 8519) and a UPS (710.313.1.102). In TT with RCD fault protection, the condition uses
    25 V, not 50 V (710.41). No RCD additional protection on medical IT circuits. Medical IMD rules
    (710.411.6.3.101). Supplementary bonding accepted where automatic disconnection is not feasible
    (710.419.201). No AFDDs in Group 0, 1 or 2 locations, nor on medical IT circuits (710.421.1.7,
    710.421.1.7.101). Source: IET-slides, SELECT, IET-press. Firm.
38. **714, outdoor lighting.** Scope clarified: highway power supplies and street furniture, traffic
    signals included, are in. 714.411.3.4 gains two notes: "lighting" includes luminaires, control
    gear and wiring; lighting is inaccessible only if out of reach or in a locked enclosure of at
    least IK08. The 30 mA RCD rule for lighting the public can reach, unless SELV, was already in A2.
    Source: SELECT, Hager, CIBSE-A2. Firm.
39. **New Section 716, Power over Ethernet.** ELV DC power over balanced data cables (Category 5 to
    8.2). Sources (716.414.1.1): power sourcing equipment to BS EN 62368-1 and BS EN 60950-22 with
    IEEE 802.3 interoperability, or a 414.3 source of not more than 60 V ripple-free DC in dry places
    and 15 V elsewhere. 716.414.3.4: BS EN 62368-3 energy-source classes may not meet SELV. Design
    current in any conductor not over 750 mA (716.523.3.101); connectors rated 750 mA per contact.
    Source: IET-slides, SELECT, ESF, IET-press. Firm.
40. **722, EV charging.** No AFDD needed on circuits to EV equipment to BS EN 61851 with BS EN IEC
    62196-2 sockets or connectors (722.421.1.7.201). 722.531.3.101 now lists an RDC-PD to BS IEC
    62955 as an alternative to the 30 mA RCD; Type A, F or B RCDs are named. DC fault protection, by a
    Type B or a Type A or F with an RDC-DD, is retained unless the charger provides it. Source:
    IET-slides, BEAMA-EDA, SELECT, WM100 (the A2 text). Firm on RDC-PD and AFDD. **Single:** a trade
    site reports A4 deleted the "reasonably practicable" exception in 722.411.4.1 (PME for outdoor
    charge points). Check the book.

## H. Part 8 and appendices

41. **New Chapter 81, energy efficiency.** Informative: points to the Building Regulations (Section 6
    in Scotland) and BS HD 60364-8-1. Appendix 17 removed. Chapter 82 (prosumers) stays. Source:
    SELECT, ESF, Hager. Firm.
42. **Appendix 1** retitled to cover standards and other documents referred to. Source: SELECT.
43. **Appendix 4, buried cables.** Data added for buried cables. SELECT reports new installation
    methods 72 and 73 and a reference method D2, used in Tables 4D4A, 4E4A, 4H4A and 4J4A; the IET's
    2024 consultation note says "data for buried cables in ducts". **Contested:** a certification
    software firm says A4 changed no reference method or current table, and D1 and D2 appeared
    before A4. Above-ground tables (4D1A, 4D5, 4E1A, 4E4A in air) and voltage drop limits (Table 4Ab)
    are not reported changed. Source: SELECT, WM-DPC, ProCerts, bs7671a4-site.
44. **Appendix 13** rewritten (escape routes and fire protection), Appendix 15 note: a twin 13 A
    socket to BS 1363-2 is taken as not over 20 A design current. Source: SELECT, Hager. Firm.

## I. Not changed, as far as the sources show

Maximum Zs tables, disconnection times, Cmin and Cmax, RCD rules for sockets up to 32 A
(411.3.3), the earthing types other than PNB, current-carrying capacity tables above ground,
voltage drop limits, Type AC limited to fixed loads with no DC (A2), the I2 ≤ 1.45 Iz rule
(433.1.1). Source: bs7671a4-site, ProCerts, and their absence from SELECT, Hager, ESF and the
IET slides.

**Total: 44 numbered entries** (3 on status, 41 technical: A3's one change and A4's forty).

---

## Sources

Dan's own files (`source/`):
- **A3** `bs7671-amendment-3-2024.txt`: the IET's free A3 PDF (front matter, introduction, the two
  definitions and 530.3.201).
- **ESF** `a4-pocket-guide.txt`: Electrical Safety First, "BS 7671:2018 + A4:2026 and Domestic
  Installations", v1.0, Apr 2026. https://www.electricalsafetyfirst.org.uk/media/buyp0p2k/esf_pocket_guide_bs7671_am4_2026_digital_v1-0-3.pdf
- **EAL-QA** `a4-qa-fact-sheet.txt`: EAL, Amendment 4 Q&A fact sheet.
- **IET-slides** `eal-iet-a4-master-slides.txt`: EAL and IET webinar, 16 Apr 2026 (Mark Coles).
- **QR** `amd4-quick-reference.txt`: docs-store A4 page index.

Web (searched 20 Oct 2026; 11 searches, 4 fetches):
- **SELECT**: SELECT, "So what's new? Overview of BS 7671:2018+A4:2026".
  https://select.org.uk/common/uploaded%20files/Technical/FreeDownloads/2026_Amendment_4_Whats_New.pdf
- **SELECT-forms**: SELECT, A4 certificates and report forms.
  https://select.org.uk/common/uploaded%20files/Technical/FreeDownloads/2026_A4_Certification_Guide.pdf
- **Hager**: Hager, "18th Edition Amendment 4" bitesize guide, May 2026.
  https://assets.sc.hager.com/uk/-/media/project/hagerdeep/united-kingdom/hager/b2b-uk/support/amendment-2-18th-edition/amendment-4/bitesize-guide-amd4-digital.pdf
- **BEAMA-EDA**: BEAMA presentation, Requirements for Electrical Installations A4, Apr 2026.
  https://www.eda.org.uk/wp-content/uploads/2026/08/Requirements-for-electrical-installations-18th-Edition-amendment-4_April-2026.pdf
- **NICEIC**: NICEIC, Understanding BS 7671:2018 + Amendment 4:2026. https://niceic.com/amendment-four/
- **WM-FI**: IET Wiring Matters 110, July 2026, M Peace, "Further investigation".
  https://electrical.theiet.org/wiring-matters/years/2026/110-july-2026/further-investigation
- **WM-DPC**: IET Wiring Matters 102, Sept 2024, G Cronshaw, draft proposals for A4.
  https://electrical.theiet.org/wiring-matters/years/2024/102-september-2024/the-impact-of-amendment-42026-on-the-18th-edition-of-the-iet-wiring-regulations
- **WM100**: IET Wiring Matters 100, May 2024, RCDs for EVSE (the A2 text of 722.531.3.101).
  https://electrical.theiet.org/wiring-matters/years/2024/100-may-2024/rcds-for-electric-vehicle-supply-equipment-evse
- **IET-EIC / IET-EICR / IET-MW**: IET A4 model forms, 15 Apr 2026.
  https://electrical.theiet.org/media/tqxkkscw/bs7671_eic_a4.pdf ,
  https://electrical.theiet.org/media/jp2fl3ia/bs7671_eicr_a4.pdf ,
  https://electrical.theiet.org/media/f0hlqxq1/bs7671_meiwc_a4.pdf
- **IET-press**: IET press release, 15 Apr 2026.
  https://www.theiet.org/media/press-releases/press-releases-2026/press-releases-2026-april-june/15-april-2026-iet-bsi-officially-publish-amendment-4-2026-to-bs-76712018-iet-wiring-regulations
- **IET-update**: IET edition checker. http://www.theiet.org/updates
- **IET-FAQ**: IET FAQs, consumer units and protective devices (A2's 536.4.202).
  https://electrical.theiet.org/bs-7671-18th-edition-wiring-regulations/faqs/consumer-units-and-protective-devices-faqs
- **IET-EVC**: IET webinar Q&A, electrical diversity and load curtailment (536.4.3.2).
  https://electrical.theiet.org/bs-7671-18th-edition-wiring-regulations/faqs/webinar-questions-and-answers/electrical-diversity-and-load-curtailment-evc-webinar/
- **NAPIT**: NAPIT, A4 takes full effect, 15 Oct 2026.
  https://www.napit.org.uk/news/amendment-4-to-bs-7671-takes-full-effect-from-today-october-15/
- **CIBSE-A2**: CIBSE/IET A2 lecture, Apr 2022 (714.411.3.4 already in A2).
  https://www.cibse.org/media/esqlg20r/bs_7671_18th-ed-amd-2-cibse-iet-lecture-april-2022-with-additional-notes.pdf
- **InspectElec**: Inspect Electrical, "Does an FI code still fail an EICR?", May 2026 (trade).
  https://inspectelectrical.co.uk/electrical-advice/bs-7671-amendment-4-eicr-fi-code/
- **bs7671a4-site**: Prekon, "BS 7671 Amendment 4: what's changed" (a tool vendor; says what stays
  the same). https://www.bs7671amendment4.co.uk/
- **ProCerts**: Pro Certs Software, reference methods, updated Oct 2026 (trade).
  https://www.procertssoftware.com/blog/bs-7671-reference-methods/
- **Elec-Mate-722**: Elec-Mate, Section 722 A4 changes (trade app; used only for the single claim
  flagged in 40). https://www.elec-mate.com/guides/section-722-ev-charging-a4-2026-changes
- **grafter**: grafter.ly, A4 certificates (trade blog; single claim in 33).
  https://grafter.ly/blog/bs-7671-amendment-4-certificates
- Rejected: ECalPro, https://ecalpro.com/standards/bs-7671/amendment-4-2026 (wrong on Zs, invents
  regulation numbers; see 12).
