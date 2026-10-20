# Where HV Subsea Cable Testing sits on the Electrical engineering shelf

Written 20 Oct 2026 with `brief.md`. A proposal only: `docs/shelves-electrical.json` is not changed.

## The proposal

- **Shelf:** Electrical engineering (`docs/shelves-electrical.json`).
- **Folder:** `power-and-machines`, "Power and machines at sea". The cables join offshore turbines to
  their substation and bring the power ashore, so this is power at sea. The folder already plans
  "Maintenance and fault-finding" ("Systematic fault-finding, insulation resistance and condition
  monitoring"), the course nearest to this one.
- **Place:** directly before `maintenance-and-fault-finding`, the last course in the folder now.
  This course teaches the HV test methods on a cable; Maintenance and fault-finding can then build on
  them for a ship's plant, not teach them again.
- **Course:** id `subsea-cable-testing`, title **HV Subsea Cable Testing** (Dan's name, 20 Oct).
- **Blurb (one line):** "Your subsea cable testing course taught back to you: make the cable safe,
  then DLRO, IR and PI, sheath, VLF, TDR and LIRA on one 66 kV wind farm cable, until the fault is
  found."

The entry, for when Dan agrees:

```json
{
 "id": "subsea-cable-testing",
 "title": "HV Subsea Cable Testing",
 "blurb": "Your subsea cable testing course taught back to you: make the cable safe, then DLRO, IR and PI, sheath, VLF, TDR and LIRA on one 66 kV wind farm cable, until the fault is found.",
 "tid": null
}
```

**Why not a folder of its own,** as Design and verification has? That course needed one because it
teaches one shore standard's design method, which does not apply to ships. This one teaches test
methods that hold on any HV cable, and it sits naturally beside the fault-finding course. If Dan
would rather keep his own qualifications together, the other choice is a new folder, "Your courses,
refreshed", holding this and Design and verification. I have not proposed that, since it would move a
course he already has.

## How it relates to the other courses

- **AC circuits** (built). Capacitance and reactance (lesson 5), impedance (lesson 6), resonance
  (lesson 7) and three-phase voltages (lesson 10) are used, not taught again: a core's capacitance
  and charging current in lessons 1 and 5, the line's impedance in lesson 6, LIRA's resonances in
  lesson 7. Best taken after AC circuits; each borrowed idea gets a one-line reminder, so it does not
  have to wait.
- **Design and verification** (on the shelf). Same refresher format and the same app pieces. No
  overlap in content: that course is LV design to BS 7671, this one HV cable testing. Both use the
  idea that a reading is compared with an expected value corrected to the same temperature (lesson 2
  here, lesson 9 there).
- **Maintenance and fault-finding** (planned, not briefed). The overlap to settle when it is
  planned: insulation resistance with PI and DAR (lesson 3 here), and the fault location methods this
  course leaves out (Murray loop, surge and acoustic pinpointing, A-frame sheath pinpointing; brief
  section 13). The proposal: Maintenance and fault-finding treats IR, PI, DAR and TDR as already seen,
  and teaches them on a ship's machines and cables, with the methods left out here.
- **Three-phase power systems at sea** (planned). No overlap: earthing systems and earth fault
  detection on a ship are not part of this course.
