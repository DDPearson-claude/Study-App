# A4 for the Inspection and testing builders

20 Oct 2026. What A3:2024 and A4:2026 change for initial verification, periodic inspection and
the forms, so the Inspection and testing course (`docs/courses/electrical/inspection-and-testing/`)
teaches A4 and says once what changed. Each line carries its regulation and a source key from
[changes.md](changes.md), which has the URLs and the confidence notes. Teach from the IET's free A4
forms and the A4 book; quote the forms word for word in research, never these notes.

## 1. Which edition

- From 16 Oct 2026 only BS 7671:2018+A4:2026 is current. A2+A3 was withdrawn 15 Oct 2026.
  (EAL-QA, NAPIT)
- A job designed to A2+A3 before then may be finished and verified to it if the contract says so.
  Otherwise new work is certified to A4. Use one edition throughout; never mix clauses. (SELECT,
  Hager)
- Certificates say "BS 7671:2018 as amended to ..." with a date. For A4 work that is the A4 date.
  (IET-EIC)
- An existing installation is not unsafe just because it does not meet A4. Code by danger, not by
  edition. (A3 intro, SELECT)
- Dan's inspection and testing awards stay valid; nobody resits. (EAL-QA)

## 2. Initial verification (Chapter 64)

**The tests do not change.** Same sequence, same Table 64 insulation test voltages and minimum
values, RCD effectiveness proved by an AC test at IΔn, as A2. (SELECT, IET-EIC)

**The limits do not change.** Tables 41.2 to 41.4 are unchanged, so the 0.8 × Table 41.3 rule for
measured Zs, and the On-Site Guide's Appendix B values, stand. Use the A4 editions of the OSG and
GN3 for page and table numbers. (bs7671a4-site; IET publications page)

**What is new to inspect on new work:**
- **PNB supplies.** Recognise a TN-C-S supply with protective neutral bonding: the PEN is earthed at
  an electrode near the consumer's terminals, one consumer connection per source. Record it as
  TN-C-S (PNB), not PME. 312.2.1.1. (SELECT, ESF, NICEIC)
- **Back-fed devices.** Where a source can feed back (PV, battery, V2G), each protective device must
  suit the direction of flow. Unidirectional devices are marked "in/out", "line/load" or with arrows.
  The A4 inspection schedule cites 530.3.201 against the fault protection item. (A3, IET-EIC)
- **Sources and RCDs.** A source must not sit on the load side of an RCD where 551.7.1(d) forbids it.
  A generating set, and a battery, which counts as one, connects on the supply side of every final
  circuit device in the board. 551.7.1, 551.7.2.1. (Hager, IET-slides)
- **Board ratings.** The board's rated current InA, and any RCCB's Inc, must be at least the
  device feeding it, unless load curtailment caps the demand or the full connected load fits.
  Diversity is never the overload protection. With a generator in parallel, check the 551.7.2.2
  options; where the "total connected load" option is used, look for the notice stating the
  limit. 536.4.202, 551.7.2.2. (SELECT, Hager)
- **Batteries, Chapter 57.** Location (PAS 63100 in dwellings, fire strategy elsewhere), ventilation
  to the maker's instructions, Type B RCD on the AC side unless the PCE gives separation or its maker
  says otherwise, AC and DC isolation, notices at the origin, at the meter if remote, at every board a
  battery feeds, and on the PCE. 570.6.2.2, 570.6.3, 570.6.7.203, 570.6.8.201, 570.6.8.203.
  (IET-slides, Hager)
- **RCDs in series.** Each must suit the residual current it may see: no Type AC upstream of A, F or
  B; no A upstream of F or B; no F upstream of B; unless the maker declares the pair. For
  selectivity, upstream Type S, at least 3:1, and the downstream RCD switching the neutral too.
  531.3.3, Figure A53.2, 536.4.1.4. (SELECT, Hager)
- **Concealed and buried cables.** The 522.6 table: zone plus 30 mA RCD, or the 522.6.204
  protection, by wall type and depth. Buried cable armoured and earthed, or in a duct of equal
  strength, N750 counting. 522.6, 522.8.10. (SELECT)
- **Terminations.** Fine-wire conductor ends treated so strands cannot splay; terminal suited to the
  conductor class. 526.2, 526.9.1. (SELECT)
- **Colours.** Functional earth and bonding conductors identified by the Table 51 symbols, or pink;
  green-and-yellow for protective conductors only. Table 51. (SELECT, ESF)
- **Isolation.** A disconnector is off-load only; a switch-disconnector (isolating switch) is
  on-load. Check the device does the job asked of it. Table 537.4. (SELECT, Hager)
- **Firefighter's switches** where the fire strategy asks for them. 537.4.2. (SELECT, ESF)
- **Escape routes.** Nothing in a fire-fighting shaft or protected stairway beyond fire safety
  systems, general lighting and cleaning sockets; cables in a fire-resisting enclosure count as
  outside the route. 422.2.201, 422.2.202. (SELECT)
- **AFDDs.** Required in high-rise residential buildings, HMOs, purpose-built student accommodation
  and care homes; not required on EV circuits; not allowed in medical locations of groups 0 to 2 or on
  medical IT circuits. 421.1.7, 722.421.1.7.201, 710.421.1.7. (Hager, SELECT, IET-slides)
- **EV charging.** Each point on its own 30 mA RCD of Type A, F or B, or an RDC-PD in its place; DC
  fault protection unless the charger has it. 722.531.3.101. (IET-slides, BEAMA-EDA)
- **PoE.** Design current per conductor not over 750 mA; source not over 60 V DC in dry places, 15 V
  elsewhere, or a compliant PSE. 716.414.1.1, 716.523.3.101. (IET-slides, SELECT)
- **Outdoor lighting.** Lighting the public can reach needs a 30 mA RCD unless SELV; the A4 notes
  count wiring and control gear as lighting, and only out-of-reach or IK08-locked kit as
  inaccessible. 714.411.3.4. (Hager, SELECT)
- **Medical locations.** New Annex B710 schedule for each supplementary bonding conductor's
  resistance, at initial verification and periodically. 710.64, 710.65. (SELECT, IET-press)
- **Marinas** (worth a line for Dan): an isolating transformer between hull and shore metalwork, the
  supply PE not taken to the socket's earth. 709.313.1.101. (SELECT)

## 3. Periodic inspection (Chapter 65)

- **653.1.** The EICR follows the Appendix 6 model and takes account of its notes for the person
  producing it. The notes are rewritten to explain what periodic inspection is for and what to
  record. (SELECT, WM-DPC)
- **653.2.** The report includes guidance for its recipients, also redrafted. (SELECT)
- **Evidence.** Photographs and thermal images may be appended. (SELECT, ESF)
- **Signatures.** Those of the people who did the inspection and testing and who authorise the
  report. (WM-DPC, InspectElec)

## 4. The codes and the outcome (the change that bites)

- Section K is in two parts. **Part one: C1 and C2.** Either makes the report unsatisfactory.
  **Part two: C3 and FI.** Advisory; neither affects the overall outcome. (NICEIC, IET-EICR, WM-FI)
- The codes: C1 danger present, immediate remedial action; C2 potentially dangerous, urgent remedial
  action; C3 improvement recommended; FI further investigation is **advised**. "Without delay" has
  gone from FI. (NICEIC, WM-FI)
- **Under A3 an FI made the report unsatisfactory. Under A4 it does not.** An EICR written to A3
  before 16 Oct 2026 reads FI the old way; say which edition the report is to. (NICEIC)
- FI is only for an apparent deficiency the agreed limits stopped you identifying, which might turn
  out to be C1 or C2. It is not a parking place: an unidentified circuit breaks 514.8.1 and gets a
  code; an insulation reading under the Table 64 minimum fails and gets a code. Finding why is fault
  finding, not inspection. (WM-FI)
- The codes live on the form and in GN3; BS 7671 governs the form and its notes. (InspectElec)

## 5. The forms (Appendix 6)

- **EIC and minor works: minor changes.** Earthing boxes split into TN-C-S (PME) and TN-C-S (PNB).
  The minor works form asks for Zdb, the loop impedance at the board feeding the circuit. Notes
  that not every AFDD has a test button and not every SPD shows its state. A maximum Zs from
  anywhere but the Chapter 41 tables is sourced in the remarks column. The designer's
  next-inspection box is unchanged. (IET-EIC, IET-MW, NICEIC)
- **Schedule of inspections** cites 433.1 and 533.2.1 (conductors and overload devices) and 411.3
  and 530.3.201 (fault protection devices). One trade blog reports a new item for prosumer
  installations: confirm on the IET form before teaching it. (IET-EICR; grafter)
- **EICR: major changes.** The two-part Section K, the rewritten notes and recipient guidance, the
  outcome wording (C3 and FI "advisory and does not affect the overall assessment"). (IET-EICR,
  SELECT)

## 6. Still to settle in research (not in these sources)

- GN3's A4 edition: its RCD test regime (whether the half-IΔn check is still advised), table
  numbers for inspection intervals, and its coding guidance under A4.
- Best Practice Guide 4's A4 revision on coding, and whether it changes examples the slides use.
- The A4 OSG's Table B6 values and page numbers (expected unchanged; A2's 6 A type B misprint,
  noted in the I&T brief, may or may not be fixed).
- The exact wording of 551.7.1(d), 433.3.1 and 434.2.1, which the summaries describe only in
  outline.
- Whether the schedule of test results columns are renumbered (the A4 form still runs 1 to 31).
