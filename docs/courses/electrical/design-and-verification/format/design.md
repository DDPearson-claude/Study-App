# Design and verification: a working tool, with an on-ramp

A proposal, written 19 Oct 2026 for Dan. It replaces the *teaching format* of the ten-lesson plan
in `../brief.md` (that brief's research, sources, traps and figures all still stand). Nothing here
is built. The mockups are in `mockups/` beside this file; each is one self-contained page.

**What Dan asked for (19 Oct).** This course does not have to follow the other courses' flow. Then:
"I have no more exams on this, it's just to use as a reference for myself in the real world next
time I'm doing electrical design and installation work." So the course is turned round. It is
first a **tool** he opens on a job and runs his own circuit through, with a **quick reference**
beside it. The teaching is the **on-ramp** that makes him fluent with the tool and refreshes the
thinking behind each step. Review is light and optional. There are no exam papers.

---

## The short version: what a session looks like for Dan

**On a job (most of the time).** He opens the app. On the Library home, one row says "Circuit
design". He taps it, then "New circuit design" (or opens a saved job). He names the job, enters
the supply (earthing, Ze, the voltage he was given) and the circuit (load, length, how it runs,
the device). The sheet then walks his own flowchart, one row per step. Where a step needs a value
from a table, the row tells him exactly where to look ("BS 7671 Table 4D1A · Reference Method B
column · 1.5 mm² row") and he types it in from his own book. Every row shows its rule and its
working, so he can check it on a calculator and copy it into his records. If a check fails, the
row says so in red and sends him round the flowchart's loop ("go back to step 6, bigger CSA"),
with the largest mV/A/m that would pass, so he does not chase one size at a time. When the sheet
is done he reads the **site summary**: one line per check, and what he should read at test. After
testing he switches the summary to **As built**, types his readings, and sees whether they agree
with the design and with each other. "Save a copy" keeps the sheet for his records.

**Checking someone's design.** "Check a design" takes the inputs and the stated results from a
design (his own or a colleague's), works the sheet itself, and marks every row where the two
disagree, before he signs anything off.

**When he wants it fresh.** Eight worked jobs on the same sheet, each adding one twist: a plain
radial, a motor, factors that do not meet, an old board with rewireable fuses, harmonics, a long
submain, Zs too high, and his assignment's showroom. The "why" for a twist arrives at the row that
needs it, as a short interactive (four of them). Three jobs end with a design to check, with one
planted mistake.

**If he turns it on.** "Keep it fresh" sends one design step every week or two, with new numbers
each time, worked from the rule shown. It is off unless he turns it on.

One calm line sits under the sheet, the summary and the reference: *Rules as taught in your
course: BS 7671:2018+A2:2022. An aid to your own design, not a substitute for the regulations or
your sign-off.*

---

## 1. What I changed from the direction, and why

| The direction | This design | Why |
|---|---|---|
| One live design sheet used throughout the course | The sheet is a **tool first**: his own circuits, saved as named jobs, with a site summary and an as-built view. The course's jobs are the sheet in a guided mode. | Dan's update: it is for real work, not an exam. A sheet he only meets inside lessons would not be there on site. |
| The flowchart as a worksheet | His flowchart's **20 steps stay the spine and keep their numbers**, grouped into **13 rows** so a phone shows them as a list. Four checks the flowchart leaves out (overload 1.45, harmonics, live conductors on a short circuit, breaking capacity) are rows marked "added", each citing the slide that teaches it. | He should recognise his own flowchart at a glance, and see which checks come from elsewhere in his slides. |
| A failing check sends you round the loop | It does, and the **rows after it wait** (as the flowchart does: you do not proceed past step 8 until it passes). The voltage-drop loop also gives the **largest mV/A/m that would pass**, worked from the rule, so he can go straight to the right size. The flowchart has no "No" branch at step 14 (Zs); the sheet adds one (bigger cpc, bigger cable, or an RCD) and marks it as added. | Faster on a real job, and honest about which loops are his flowchart's. |
| 6 or 7 jobs, then the showroom | **8 worked jobs**, the showroom being the eighth. Job 1 is his slides' own immersion heater (p.50 to 61), so every figure in it is cited. | The app's plan validator wants 5 to 8 ideas a course; 8 jobs fit it exactly (section 9). |
| Four "why" pieces | Kept, but each sits **inside the job whose twist needs it** (jobs 4 to 7), not as separate lessons. They are reachable from the reference too. Ct and the power-factor drop wait for their formulas to be sourced. | The why lands at the step that needs it, and the course stays at 8 items. |
| "Mark this design" | Kept as practice inside jobs 3, 6 and 8, **and** made a real tool: Check a design compares a design's stated results with the sheet's own. | Checking other people's work before sign-off is a real-world job. |
| The showroom, then "as built" | As built is **part of every saved job**. The summary already says what he should read at test (worked from the design), and As built compares his readings with it. | Verification is what he does after every installation, not once. |
| Spaced review with fresh numbers | **Off by default**, opt-in for the course and per step. One step a card, new numbers each time, the values marked as practice values. | Dan asked for review to be light and optional. |
| Optional timed exam papers | **Dropped.** The City & Guilds papers still give shapes for job 7 and the check exercises, with every number changed. | No more exams. |
| (new) | **Each row works from the figures shown above it**, rounded as shown, so every working line checks on a calculator. | A design record must be checkable by hand. |
| (new) | **His own table values are remembered privately** ("your values") and offered back the next time the same table, column and row comes up. Nothing is ever shipped from a table. | Saves looking up 24.2 mΩ/m for the hundredth time, without copying BS 7671. |

---

## 2. The course map

The course page opens on the **toolbox**, then the **on-ramp**, then the review switch
(mockup `course.html`).

| Part | Purpose | Rough size |
|---|---|---|
| **Toolbox**: New circuit design · Your jobs · Check a design · Quick reference | The tool itself, one tap from the course page and the Library home | 5 screens: job list, new job, sheet, summary (Design / As built), reference |
| **Job 1** A plain radial, start to finish | Learn the sheet: every row once, how a table prompt reads, the summary | about 14 beats |
| **Job 2** A motor: from nameplate to Ib | Power factor, efficiency, starting current, delta running current | about 12 beats |
| **Job 3** Where the factors meet | Factors only where they act together; the worst section sets the cable; then the voltage-drop loop. Ends with a design to check | about 14 beats + 4 |
| **Job 4** An old board with rewireable fuses | The overload row changes; **why piece A: why 1.45, and Cf = 0.725** | about 10 beats + about 8 screens |
| **Job 5** A neutral that carries more than the line | Harmonic content picks line or neutral current; **why piece B: third harmonics add in the neutral** | about 10 + 8 |
| **Job 6** A long submain | Voltage drop from the origin, ÷ √3 for a single-phase final circuit; **why piece C: Ct and the power-factor drop**. Ends with a design to check | about 12 + 8 + 4 |
| **Job 7** Zs too high | The added loop at step 14: bigger cpc or an RCD; the live conductors on a short circuit; **why piece D: Cmin, Cmax and the cpc** | about 12 + 8 |
| **Job 8** The showroom: design, check, as built | His assignment's submain to DBL2 and its longest circuit; a design to check; then as built, the first inspection interval and the handover documents | about 16 + 4 |
| **Keep it fresh** (optional) | One step at a time, fresh numbers | off by default |

About 100 sheet beats, 32 why-piece screens and 12 check screens: a little more than the ten
lessons' 120 screens, but only four of them need a built interactive, because the sheet is the
interactive for the rest.

**Weighting.** In Dan's time: mostly the tool and the reference (on every job), the on-ramp once
and then when he wants it, review only if he turns it on. In build effort: about 45% the tool,
35% the on-ramp, 10% the reference, 5% review, 5% research beyond the brief's.

---

## 3. The design sheet

Mockups: `sheet.html` (his job mid-way, one row open; phone and laptop), `loop.html` (the same
job with the run changed to 85 m).

### 3.1 The rows
Numbers in the first column are his flowchart's steps. "Added" rows come from his slides.

| Row | Flowchart | He enters | Table values he types (from his own books) | Rule shown | Check | Loop when it fails |
|---|---|---|---|---|---|---|
| Design current, Ib | 1 | Load, phases, voltage at the board, pf, efficiency | none | Ib = P ÷ (U × eff × pf); three-phase P ÷ (√3 × UL × eff × pf) (slides p.12, 13) | none | none |
| Protective device, In | 2 | Device standard and type, In | none | Ib ≤ In (Reg 433.1.1, slides p.22) | yes | choose a larger In |
| Rating factors, It | 3–4 | The run in sections, which factors act in each | Ca (Table 4B1), Cg (Table 4C1), Ci, Cf | It ≥ In ÷ (Ca × Cg × Ci × Cf), only the factors that act together; the worst section sets It (slides p.25, 27) | none | none |
| Reference method | 5 | How it is installed | Method from Table 4A2 | Design to the method with the lowest rating on the run (slides p.28) | none | none |
| Conductor, Iz | 6 | CSA (a stepper) | It(tab): the table for his cable type (Tables 4D1A to 4J4A), the column for the method, the row for the size | It(tab) ≥ It; Iz = It(tab) × factors ≥ In | yes | next size up |
| Overload, 1.45 | added (slides p.29 to 32) | (from the device) | none | I2 ≤ 1.45 Iz, with I2 = 1.45 In for most devices (p.30, 32) | yes | Cf, or a larger cable |
| Harmonics | added (slides p.33 to 37) | Third-harmonic %, only when the maker's data gives one (p.37) | Table 4Aa band and factor | Ibn = 3 × h × IL; band picks line or neutral current (p.34, 35) | (feeds Ib and It) | none |
| Voltage drop | 7–8 | Length; drop before this board (from its own circuit on the job); lighting or power | mV/A/m (Tables 4D1B to 4J4B) | VD = mV/A/m × Ib × L ÷ 1000, added to the drop before this board; ≤ 3% or 5% of the voltage given (formula sheet step 7; slides p.38 to 41) | yes | **flowchart**: back to step 6, bigger CSA |
| Protective conductor | 9 | cpc CSA | (Table 54.7: the same as the line up to 16 mm², flowchart step 9) | Suitable first; the minimum comes from step 19 (flowchart note 2) | none | none |
| R1+R2 | 10–12 | (length) | mΩ/m (OSG Table I1, or GN3 B1, or the Design Guide F1); multiplier (OSG Table I3) | R1+R2 = mΩ/m × multiplier × L ÷ 1000 (formula sheet step 12) | none | none |
| Earth fault loop, Zs | 13–14 | Ze, or Zs at the board for a sub-board | Max Zs (Tables 41.2 to 41.4) | Zs = Ze + R1+R2, or Zs at the board + R1+R2 (formula sheet step 13) | yes | **added**: bigger cpc (to 9), bigger cable (to 6), or an RCD (rule to be sourced) |
| Fault current and time | 15–16 | none | Current for the time on the device's curve (Appendix 3); the maximum time (Table 41.1) | If = Uo × Cmin ÷ Zs, Cmin 0.95 (formula sheet step 15; slides p.47, 48) | yes | as for Zs |
| Thermal check | 17–20 | none | k (Tables 54.2 to 54.6) | S = √(I² t) ÷ k, I worked at Cmax 1.1 (formula sheet 18/19; slides p.58 to 62) | yes | **flowchart**: back to step 9, bigger cpc |
| Short circuit, live conductors | added (slides p.63 to 68) | PSCC at the origin | k (Table 43.1), R1+Rn per m and multiplier | Ze(l/n) = U ÷ PSCC; Isc at Cmin opens the device; t = k²S² ÷ I² at Cmax ≥ device time | yes | bigger cable |
| Breaking capacity | added (slides p.69, 70) | IPF at the origin, the device's Icn (marked on it) | none | IPF ≤ Icn | yes | a device with a higher Icn |

Harmonics, the short-circuit row, and the Ct and power-factor refinements of voltage drop
(slides p.43 to 45) are **optional rows**: they appear only when the circuit needs them (three-phase
with a harmonic figure; a PSCC entered; "refine voltage drop" turned on). Ct and the power-factor
drop stay locked until their formulas are quoted from BS 7671 Appendix 4 (section 12).

### 3.2 Row states and colour
- **Worked** (no check in the row): the result in ink, no mark.
- **Check met**: an ink tick in a ring. Not green: green is for finished only.
- **Check fails**: a red outline, a red cross, and the verdict in red ("32.14 V is over the 11.50 V
  limit"). Red only ever marks a mistake or a warning.
- **Needs your value**: an amber band and an amber prompt box ("From your BS 7671 · Table … ·
  column … · row …"). Amber is "what is due": the one thing he has to do next.
- **Waiting**: dashed and muted ("On hold until step 8 passes", "Waits for R1+R2").
- **Design complete**: the whole circuit, once every check is met, gets the flowchart's end box,
  "Design complete", in green. A summary marked verified after testing is green too.
- Teal is for the small labels (step numbers, "FROM YOUR BS 7671", the column names).

A bar of segments, one per check, sits above the rows: ink met, red fails, amber needs a value,
dashed waiting ("3 of 8 checks met · 1 fails · 4 waiting").

### 3.3 Table values: prompted, never shipped
- Each prompt names the **book, the table, the column by its heading (and number once sourced),
  and the row**: "BS 7671 Table 4D1A · Reference Method B, 2 cables single-phase · 1.5 mm² row ·
  current-carrying capacity It(tab)". The app knows which table goes with which cable type and
  method; it never knows the values. The column wording in the mockups is illustrative: the build
  must take each heading from the tables themselves (section 12), and the column *number* is shown
  only once it is confirmed for the edition he uses.
- He types the value. It is kept with the job, and in a private list of **his values** (keyed by
  book, table, column and row), so the next time the same cell comes up the box offers it ("You
  used 17.5 A on 19 Oct"). He can turn this off.
- R1+R2 per metre and its multiplier name the book on his shelf: the OSG (Tables I1, I3), GN3
  (B1, B3) or the IET Design Guide (F1, F3), as his slides list all three (p.51, 52). He picks his
  book once, in settings.
- In the mockups the "typed" values are the figures printed in his slides, each with its page.

### 3.4 Working from the figures shown
Every row is worked from the rounded figures in the rows above it, and its working line shows them.
So "29 × 13.04 × 85 ÷ 1000 = 32.14 V" checks on a calculator exactly. Rounding: currents and volts
to 2 decimal places, impedances to 3, CSA results to 2; a maximum (the most mV/A/m that passes) is
rounded *down*. This can differ in the last place from a calculation carried at full precision:
the assignment motor's delta current is 23.08 ÷ √3 = **13.33 A** worked from the shown Ib, against
13.32 A at full precision. The sheet says so once, under the working: "Each line uses the figures
shown above it."

Where his slides cut a figure short, the sheet works it and the lesson says where the slide
differs. For the immersion heater: R1+R2 0.436 Ω (slide 0.43), Zs 0.646 Ω (0.64), If 338.24 A
(341.4 A), I at Cmax 391.64 A (395.3 A). None changes a pass or fail.

### 3.5 Changing an input, and the loops
Every input change re-works the whole chain at once. The input he changed is marked "changed" on
its key tile. A row whose table value no longer fits
(the CSA changed, so It(tab), mV/A/m and R1+R2 per metre are for the wrong size) goes back to
**needs your value**, unless his values already hold that cell.

When a check fails:
1. The row opens with the verdict and the loop **first**, before its working.
2. A small drawing of the loop: boxes for the steps and a red arrow back ("No: back to step 6,
   bigger CSA"). On a laptop the flowchart rail draws the same arrow in red.
3. A helper where the rule allows one. For voltage drop: "At 85 m the cable needs no more than
   10.37 mV/A/m: 11.50 × 1000 ÷ (13.04 × 85) = 10.375, rounded down." Buttons try the next sizes.
4. The rows after a failing flowchart check wait, as the flowchart does.

The mockup's loop is his slides' own (p.42): 3 kW, 1.5 mm² singles, 85 m, 35 °C: 32.14 V against
11.50 V fails; 6.0 mm² at 7.3 mV/A/m (worked back from the slide's 8.09 V) gives 8.09 V and passes.

### 3.6 Circuits in a chain
A job is a supply and a tree of circuits: the origin, submains, and final circuits from each board.
The voltage drop at a board and Zs at a board pass down the tree:
- A single-phase final circuit from a board fed by a three-phase submain adds the submain's drop
  ÷ √3 (formula sheet step 7 note).
- Zs at the end = Zs at the board + R1+R2 (formula sheet step 13).
- Ib for a final circuit from a sub-board may use the voltage at that board (slides p.18, 19).
So the guide's "sum of all voltage drops from the intake" (project guide p.6) happens by itself.

### 3.7 On a phone, on a laptop
**Phone (360 px up, one-handed, in daylight).** Light mode by default, ink on white, values in a
large mono face. The sheet is one column: the job's key inputs as four tiles (load, run, cable,
device), the checks bar, then the rows. One row open at a time; tapping a key tile opens its row.
A bar floats at the bottom in the tab bar's frame: previous row, "step 7–8 · Voltage drop", next
row, Summary. Every target is at least 44 px, and the inputs, the CSA stepper and the bottom bar
48 to 52 px; numeric fields open the decimal keypad, and the things he presses most (next row, the CSA stepper, the inputs) sit in the lower
half. The engine runs in the page, so a lost signal never stops the sheet; saves wait in the app's
outbox (`mu.outbox`) and go when the signal returns.

**Laptop (1000 px up).** Three columns: his flowchart as a rail on the left (each row a box in its
state, the loops drawn beside it, the one in use in red), the rows in the middle, and the open
row's detail on the right, so the rule and working stay in view while he moves down the rows.

### 3.8 How the "why" attaches to a row
Every row carries one line of **Why** ("The limit is for the whole path from the origin, so every
drop on the way counts.") and a link, **Rule and where it lives**, that opens its card in the
quick reference. Inside the on-ramp, the job whose twist needs a why piece opens it at that row,
and comes back to the same row when it finishes. Outside the on-ramp the why pieces are linked from
the reference cards. Optionally, "Ask about this row" opens Ask Claude with the row's inputs and
working as its context (the app's existing tutor); its answers are Claude's and say so.

### 3.9 Honesty
- One line under the sheet, the summary and the reference: *Rules as taught in your course: BS
  7671:2018+A2:2022. An aid to your own design, not a substitute for the regulations or your
  sign-off.* Not repeated anywhere else.
- Every job records the rule set it was worked to (`rules: "bs7671-2018-a2/dv1"`). If the rules are
  updated (an amendment, a corrected rule), an older job opens with one line saying which rows
  changed, and is worked again only when he asks.
- **Open question, not guessed:** Amendment 3 (2024) is published (brief, Decisions). Whether it
  changes any step, table heading or value that the sheet relies on is unchecked. The reference
  marks each table and regulation it cites "check vs A3" until research has looked.
- BS 7671 is for installations ashore. The tool says once, on the new-job screen, that a ship's
  installation follows other rules (which ones is still UNCONFIRMED in the brief), and never offers
  a ship as a BS 7671 job.

---

## 4. Saved jobs, the site summary and As built

Mockups: `course.html` (Your jobs), `site.html` (Design, then As built).

**Your jobs.** The toolbox lists his jobs, newest first, each with its circuits and its state in
words: "1 value to enter" (amber), "1 check fails" (red), "Verified" (green), "Draft". "All jobs"
opens the full list. A job can be duplicated (same supply, a new circuit) and deleted (with the
app's confirm sheet).

**Site summary** (read on site, so big and plain): what the circuit is (load, device, cable, run),
then one line per check with its result and the figure it was checked against, then **What you
should read at test**, worked from the design: R1+R2 cold = mΩ/m × L ÷ 1000 (the design's figure
before the ×1.2, since his slides' multiplier "corrects the answer to as if the circuit were
operating", p.52), and Zs cold = Ze + that. In the mockup: 24.2 × 15 ÷ 1000 = 0.363 Ω and
0.21 + 0.363 = 0.573 Ω. Two buttons: **Copy the working** (plain text, one line per row, for his
design records) and **Save a copy** (the summary and every row's working as one static page,
through the app's existing downloads, as a dossier's Save a copy does).

**As built.** The same summary, switched. He types Ze at the origin, R1+R2 and Zs at the end of
the circuit (and PFC if he has it). The sheet shows, per circuit:
1. R1+R2 against the design's cold figure, as two bars (in the mockup 0.35 Ω against 0.363 Ω).
2. Whether his readings agree with each other: Ze + R1+R2 against the Zs he measured
   (0.18 + 0.35 = 0.53 Ω, the same).
3. Zs at running temperature against the device's maximum. **The rule for this is not in his
   materials.** The mockup shows an interim method, labelled as such: the design's own multiplier
   applied to the reading (0.18 + 0.35 × 1.2 = 0.600 Ω ≤ 2.73 Ω). Before release, research must
   quote the rule BS 7671 Appendix 3 and GN3 give for comparing a measured Zs, and the sheet uses
   that (brief section 6, the last RESEARCH item; practice papers P1 p.18 and P3 p.4 ask the same).
4. "Mark this circuit verified" (green once done, with the date).
Job 8 adds the two things his assignment asks at handover (question 9, pack p.5): the first
inspection interval and the documents for the client, both research-sourced.

---

## 5. Check a design

Mockup: `check.html` (the planted mistake found).

**As practice** (inside jobs 3, 6 and 8): a finished sheet with one mistake planted. He taps the
row he would query. A right tap shows the designer's working beside the sheet's own, and what the
mistake does to the design. A wrong tap says that row is sound and shows why, then lets him try
again. The three planted mistakes come from the traps his own materials name:
1. **Factors multiplied where they never meet** (job 3): 16 ÷ (0.94 × 0.8 × 0.88) = 24.18 A
   instead of the worse of 21.28 A and 19.34 A (slides p.25 to 27). A larger cable than needed.
2. **The submain's drop left out** (job 6, the mockup): the final circuit's 8.09 V passes alone;
   from the origin it is 10.00 ÷ √3 + 8.09 = 5.77 + 8.09 = 13.86 V, over 11.50 V, so it fails
   (project guide p.6; formula sheet step 7 note). The 10 V is an example figure, as in slides p.41.
3. **A single-phase drop judged against 5% of 400 V** (job 8): 20 V allowed instead of 11.50 V.
   With a stated supply, the same trap at 395 V: 19.8 V passes against 20 V and fails against
   19.75 V (slides p.41).
Others to hold in reserve: R1+R2 without the multiplier (slides p.53); Cmin used for the thermal
check (p.62); the cpc checked but not the live conductors (p.63).

**For real.** "Check a design" makes a job in check mode. He enters the inputs (and the table values,
as for any job) and, for each row, the result the design states. The sheet works every row itself
and marks the rows where the stated result differs by more than rounding (red, "Stated 8.09 V ·
from the origin 13.86 V"). It names the difference; it does not guess the designer's reasoning.

---

## 6. The quick reference

Mockup: `reference.html`. Reached from the toolbox, from every row ("Rule and where it lives"),
and from the Library home's Circuit design row. It needs no lesson to be done first.

- **The edition line** at the top, and a search ("volt drop", "1.45", "Cmin").
- **The process**: his flowchart in five bands (load and device, cable, volt drop, shock, heat and
  fault level), each step a 44 px chip, with the two loops written in ("fails: back to 6",
  "fails: back to 9"). Checks the flowchart leaves out are dashed. It is the app's own drawing,
  credited "after the flowchart in your course materials (Tony Maus, 'representative only')",
  never a copy of the PDF.
- **One card per check**: the rule; the why in a line or two; the traps, each with its source
  (red tiles); **Where it lives**: table and regulation numbers only as his materials print them,
  each tagged "check vs A3" until research confirms it, or "to source" when his materials point
  without giving (Ct, the r and x method). Links: open the sheet at this step; the why piece;
  "Keep this step fresh".
- Content is a build-time doc, fact-checked like a lesson, and quotes are short and exact.

---

## 7. The worked jobs

Every figure below is printed in Dan's materials (cited) or computed from a shown rule; "to
source" marks what research must quote first. Table values in jobs are given one at a time, with
their table number, never as a table.

**Job 1. A plain radial, start to finish.** His slides' immersion heater (p.50 to 61): 3 kW, 15 m,
1.5 mm² singles in conduit, 16 A type B, TN-S, Ze 0.21 Ω; the job adds the 35 °C of p.26 and p.42
so the factors row has something to do (Ca 0.94). Ib 13.04 A; It 16 ÷ 0.94 = 17.02 A; It(tab)
17.5 A (p.42); Iz 17.5 × 0.94 = 16.45 A; I2 23.20 A ≤ 23.85 A; VD 29 × 13.04 × 15 ÷ 1000 = 5.67 V
(2.47%); R1+R2 24.2 × 1.2 × 15 ÷ 1000 = 0.436 Ω; Zs 0.646 Ω ≤ 2.73 Ω (Table 41.3, p.54); If
338.24 A ≥ 80 A (p.55), so 0.1 s ≤ 0.4 s; I at Cmax 391.64 A; S 1.08 mm² ≤ 1.5 mm² (k 115, p.59).
Breaking capacity waits for IPF and Icn, which the slides do not give: the first "needs your value"
he meets. Rows: all. This is the sheet in `sheet.html`.

**Job 2. A motor: from nameplate to Ib.** His assignment's motor (question 4, pack p.4): 400 V,
11 kW, pf 0.8 lagging, 86%, star-delta. Predict first with the slides' 20 kW load: 28.87 A at pf 1
and 100%, 41.48 A at 0.8 and 87% (p.16, 17), and 29.38 A at a 393 V board (p.19). Then Ib =
11 000 ÷ (√3 × 400 × 0.86 × 0.8) = 23.08 A; the delta winding current 23.08 ÷ √3 = 13.33 A (the
rule for sizing star-delta cables on "delta running conditions" is to source; the guide points to
its 4.7, guide p.7). The device type for the starting current (Appendix 3; the B, C and D trip
multiples are to source). 90 °C singles in conduit at 20 °C (pack p.3): Ca above 1 (to source).
Rows: Ib, In, factors, method, conductor.

**Job 3. Where the factors meet.** The slides' 3 kW heater in twin and earth (p.26 to 28): clipped,
then in trunking with another circuit, then through 50 mm of insulation, 35 °C. The run is entered
as three sections; Ca × Cg gives 16 ÷ (0.94 × 0.8) = 21.28 A, Ca × Ci gives 19.34 A, so 21.28 A
sets the cable (slide 21.2, cut short). The reference-method question on p.28 (method B, "column
7") is flagged UNCONFIRMED in the brief and must be settled before this job is written. Then the
same heater at 85 m in singles (p.42): the voltage-drop loop of `loop.html`. Ends with check 1.

**Job 4. An old board with rewireable fuses.** The overload row with a BS 3036 fuse. Why piece A.
Figures: 10 A device, I2 14.5 A (p.30), the 1.0 mm² cable at Iz 13 A (p.31; UNCONFIRMED in the
brief), 1.45 × 13 = 18.85 A (p.32); Cf 0.725 (p.25), so the fuse's factor is 1.45 ÷ 0.725 = 2 and
the cable needs Iz ≥ 10 ÷ 0.725 = 13.79 A. The conventional time ("10,000s" on p.30, 32) is to
check against the standard before any screen states it.

**Job 5. A neutral that carries more than the line.** The slides' 150 A three-phase load at 35%
third harmonic (p.35, 36): Ibn = 3 × 0.35 × 150 = 157.5 A, In 160 A, It = 160 ÷ (0.94 × 0.65 ×
0.86) = 304.50 A (slide 304.4), 240 mm² at 346 A (Table 4D1A, p.36). Why piece B.

**Job 6. A long submain.** A board fed by a three-phase submain, a single-phase final circuit from
it. The supply-voltage trap (395 V: 19.8 V against 19.75 V, p.41) and the ÷ √3 rule (formula
sheet). Why piece C: Ct (the 6.0 mm² cable carrying 13.04 A of its 41 A, p.43) and the r and x
columns from 25 mm² (p.44, 45). Both formulas are to source; until then the piece shows the cause
(a cooler conductor, a current at an angle) without a number. Ends with check 2.

**Job 7. Zs too high.** A long final circuit whose Zs fails, in the shape of the practice papers'
RCD questions (P1 Q5, P3 Q5; every number changed). The added loop at step 14: bigger cpc (back to
step 9), bigger cable, or an RCD (the condition and its current regulation number are to source).
Then the live conductors on a short circuit, from the slides (p.63 to 68): Ze(l/n) 230 ÷ 300 =
0.767 Ω; R1+Rn 14.82 × 1.28 × 25 ÷ 1000 = 0.474 Ω; Zs(l/n) 1.241 Ω; at Cmin 176.07 A, at Cmax
203.87 A; t = 143² × 2.5² ÷ 203.87² = 3.08 s (slides: 0.76, 0.47, 1.23, 177.6 A, 205.6 A, 3.02 s,
all cut short; the pass stands). Why piece D.

**Job 8. The showroom: design, check, as built.** His assignment (pack p.3 to 5): 400 V three-phase
four-wire, TN-C-S, Ze 0.1 Ω, prospective fault current 4.6 kA, 20 °C. The submain from the MDB in
the plant room to DBL2 in the tools and warranty store (about 17 m on plan plus the drops into the
ceiling voids, scaled from the power drawing, approximate), then DBL2's longest lighting circuit
(the split is the designer's choice, said on screen; brief section 2). Voltage drop from the
intake; Zs at DBL2 then at the end; the thermal checks; IPF 4.6 kA against each device's Icn (the
"twice the single-phase value" explanation for 4.6 kA against 230 ÷ 0.1 = 2.3 kA is to source).
Check 3. Then as built, the first inspection interval and the handover documents (question 9).

---

## 8. The four "why" pieces

Each is a short steps lesson in the app's existing format (`format: 'steps'`, a kit page that ends
with `K.complete()`), built and self-tested by the RUNBOOK's section 5, about 8 screens.

| Piece | What he moves | What he sees | Figures | Still to source |
|---|---|---|---|---|
| **A. Why 1.45, and Cf = 0.725** (mockup `why-145.html`) | The device (breaker or rewireable fuse), the cable's Iz, then "Apply Cf" | The device's I2 and the cable's 1.45 Iz as two marks on one current line; the fuse's mark passes the cable's in red; Cf pulls it back | 10 A, 14.50 A, Iz 13 A, 18.85 A (p.30 to 32); Cf 0.725 (p.25); 2 = 1.45 ÷ 0.725; 13.79 A; 20.00 A | The conventional time; the BS 3036 fusing factor quoted, to confirm the derived 2 |
| **B. Third harmonics add in the neutral** | Third-harmonic content, 0 to 60% | Three line currents and their sum; the fundamentals cancel, the thirds line up; the neutral bar passes the line bar at a third; Table 4Aa's four bands on the slider | Ibn = 3 × h × IL (p.35); bands (p.34); 157.5 A against 150 A (p.36) | Table 4Aa's wording (quote) |
| **C. Ct and the power-factor drop** | Ib against It (the conductor cools); the power factor | A conductor's temperature and its drop; the current arrow at an angle, only the parts of the r and x drops along the voltage counting | 13.04 A in a 41 A cable (p.43); the r, x, z columns from 25 mm² (p.45) | Both formulas, from BS 7671 Appendix 4; one r, x row |
| **D. Cmin, Cmax and the cpc** | Zs; Cmin or Cmax | Two bars, the fault's I²t and what the cpc can take (k²S²); Cmin decides whether the device opens in time, Cmax the heat the cpc must take | 341.4 A and 395.3 A at 0.1 s, 0.93 and 1.08 mm² (p.55 to 61; worked here as 0.94 and 1.09 from the slides' own currents); 218.5 V and 253 V (p.48) | A device's time at a low fault current (the "smaller is not always gentler" point; brief section 6) |

---

## 9. Review: "Keep it fresh"

**Off by default.** He turns it on for the course (course page) or for single steps (each reference
card). When on, it adds **step cards** to the app's puzzle box, one step each, scheduled by the
app's FSRS like any card, at most one a day from this course.

**Fresh numbers, faithfully.** Each card names a generator (`vd-origin`, `ib-3ph`, `factors-meet`,
`overload-cf`, `zs-if`, `adiabatic-cmax`, `harmonic-band`, `max-mvam`, …). Each time the card comes
up, the generator draws new inputs from set ranges (seeded by the card and its review count, so a
repeat on another device shows the same numbers), works the answer by the same engine as the sheet,
with the same rounding, and grades within that rounding. The card shows the rule and, after the
answer, the full working. Values a table would give (It(tab), mV/A/m, k) are labelled **"given for
practice, not from BS 7671"**, as an exam paper gives them, so a made-up value is never mistaken for
a real one. Ranges are set so every outcome is plausible (lengths 5 to 120 m, loads that need 6 to
63 A devices) and every generator is unit-tested to produce both passes and fails.

Example (the reference's voltage-drop step): "A three-phase submain drops 7.6 V. The single-phase
circuit from its board drops 6.9 V. Supply 230/400 V, a power circuit. Does it pass?" Working
shown after: 7.6 ÷ √3 = 4.39 V; 4.39 + 6.9 = 11.29 V ≤ 11.50 V; passes. Next time, other numbers.

---

## 10. What the app needs

Nothing below is built; this is what the build would add, in the terms of `docs/ARCHITECTURE.md`.

**10.1 The engine (pure, Node-testable).** `app/src/js/36-dv.js`: `U.dv.compute(job, circuitId) ->
{rows, checks, met, fails, waiting}`, `U.dv.ROWS` (each row's inputs, table prompts, rule text,
working, check, loop), `U.dv.round` (the policy in 3.4), `U.dv.gen` (review generators). No DOM at
load, like the prompt builders, so `tests/dv.test.mjs` runs it in Node. Its tests reproduce every
worked example in Dan's slides and formula sheet (p.16, 17, 19, 26 to 28, 30 to 32, 35, 36, 39, 41,
42, 47, 50 to 61, 63 to 68) and record each place the slide cut a figure short.

**10.2 The screens.** `app/src/js/78-design.js` and `app/src/css/78-design.css`, in the D4 tokens.
Routes (focus mode, D4's focus bar):
```
#/design                 the toolbox (also the top of the course page)
#/design/new             a new job: name, supply, first circuit
#/design/:jobId          a job: its circuits (one circuit: straight to its sheet)
#/design/:jobId/:cid     a circuit's sheet (?row=vd opens a row)
#/design/:jobId/summary  the site summary, Design | As built
#/design/check           a job in check mode
#/design/ref             the quick reference; #/design/ref/:rowId opens a card
```
The Library home (77-library.js) gets a **Circuit design** row (a `.today-row` with a teal tile)
once the course exists, so the tool is one tap from opening the app. The topic page (71-topic.js)
draws the toolbox at the top for a topic with `tool: 'dv-sheet'` (a new optional topic field).

**10.3 Data (private, under `data/users/{uid}/`, through `U.store`).**
```
profile/designs            { jobs: { [jobId]: { name, updatedAt, circuits, state: 'draft'|'needs'|'fails'|'complete'|'verified' } } }
profile/designs/{jobId}    { v: 1, id, name, site?, createdAt, updatedAt, rules: 'bs7671-2018-a2/dv1', mode: 'design'|'check',
                             book: 'osg'|'gn3'|'design-guide',
                             supply: { system: 'TN-S'|'TN-C-S'|'TT', U0, UL, Ze, zeFrom: 'declared'|'measured', ipf_kA?, Ustated? },
                             circuits: [{ id, name, from: 'origin'|<circuitId>, kind: 'final'|'distribution', phases: 1|3,
                               load: { P, pf, eff, harmonicPct? }, device: { std, type, In, Icn_kA? },
                               run: { L, cable, method, sections: [{ label, ambient, Ca, Cg, Ci }], Cf? },
                               csa, cpc, limitPct: 3|5,
                               values: { [cellKey]: number },        // the table values he typed for this circuit
                               stated?: { [rowId]: number },          // check mode: the design's own results
                               built?: { at, Ze, R12, Zs, pfc?, verifiedAt? } }] }
profile/dvvalues           { [cellKey]: { v, at, jobId } }   // his own look-ups, offered back (he can turn it off)
cellKey = book|table|column|row, e.g. "bs7671|4D1A|B-2c-1ph|1.5"
```
Results are never stored, only inputs: every open re-works the job with the engine for its `rules`
version. A job of twenty circuits is about 40 KB, well under the 256 KiB limit; writes go through
`U.store` (serialised, coalesced, held in the outbox when offline).

**10.4 A new lesson format for the jobs: `format: 'sheet'`.** A read lesson, as ready-made lessons
are (ARCHITECTURE section 5), with:
```
lesson.sheet = { v: 1,
  job: <a job, as 10.3>,
  given: { [cellKey]: { value, cite } | { value, example: true } },   // each table value cited, or labelled an example
  beats: [ { kind: 'show', row?, text }                 // a line of explanation pointing at a row
         | { kind: 'predict', row, q, options?, answer } // guess the row's result first
         | { kind: 'fill', row, expect }                  // he works the row; graded to the sheet's rounding
         | { kind: 'change', set: { L: 85 }, text }       // change an input and watch the chain
         | { kind: 'why', row }                           // mounts lesson.interactive (the why piece) here
         | { kind: 'mark', planted: { row, stated }, explain }   // check a design
         | { kind: 'built', readings } ] }                // as built
```
The why piece is the lesson's ordinary `interactive` (a kit body, built and self-tested by
RUNBOOK section 5), mounted at its beat; its `K.complete()` returns to the sheet. `explain`,
`practice` and `sources` stay as in every lesson, so the dossier binds the chapter as before; the
still guide (`tools/course/guide.mjs`) writes each `show` and `fill` beat as a page (the row's rule
and working as text). The validator checks that every beat names a real row, every given value is
cited or labelled, and the engine reproduces every `expect`. The plan has 8 ideas, one for each job,
inside the plan validator's 5 to 8. The lesson screen plays a sheet lesson as it plays a steps lesson: one
step, "Lesson", then the done section.

**10.5 The reference doc.** `topics/{tid}/reference` (shared, written at build time like the guide
doc): `{ v, edition, cards: [{ id, rows: [rowIds], rule, why, traps: [{ text, cite }], where: [{ ref,
cite, status: 'cited'|'check-a3'|'to-source' }] }] }`.

**10.6 Review.** A new card type `step`: `{ type: 'step', spec: { gen, v } }`, made only when Keep it
fresh is on (from the jobs he has finished or the cards he has marked), never from a read lesson by
itself. Grading as for an estimate card; FSRS unchanged. It shares its card-box work with the
pending "puzzles from steps lessons" phase (docs/NEXT.md, phase 6, which waits for Dan's yes).

**10.7 Ask Claude (optional).** "Ask about this row" opens the existing tutor with `context.about =
{ row, inputs, working, verdict }`. Claude's words carry its byline as everywhere else.

---

## 11. Cost and risk against the ten-lesson plan

**Size.** The brief's plan: 10 steps lessons, each with a built interactive, about 11M to 12.5M
tokens at its estimate, or about 16.5M at the measured full process (1.65M a lesson, Fractions
lessons 4 to 8), plus about 0.5M research.

**This design** (rough; the app-work figure has no measured precedent in this repo):

| Part | Estimate |
|---|---|
| Research (the brief's list, plus the column headings, Ct and power-factor formulas, the RCD condition, the measured-Zs rule, A3's changes) | about 0.8M |
| Four why pieces, full process (built interactives) | about 6.6M (4 × 1.65M) |
| Eight worked jobs as sheet data and words (written, fact-checked, read as Dan would; no interactive to build) | about 4M (about 0.5M each) |
| Quick reference cards (about 16, written and fact-checked) and review generators | about 1.5M |
| App: engine and tests, sheet screens, jobs, summary and as built, check mode, reference page, the sheet lesson player and validator, step cards, end-to-end tests and review | about 8M to 10M |
| **Total** | **about 21M to 23M** |

So about 1.3 times the ten-lesson plan at the full rate. The content costs less than the ten lessons
(four built interactives instead of ten); the extra is the tool, which is then used on every job.

**Pilot first** (RUNBOOK's rule): build the tool alone for single-phase final circuits and a
three-phase submain (the engine, the sheet, saved jobs, the summary and the reference), about 5M to
6M, and let Dan run a real circuit through it. Then job 1 and why piece A, then the rest.

**Risks.**
- **A wrong rule in a real-world aid.** Worse than a wrong lesson. The engine is pure and unit-tested
  against every worked example in his materials; every row shows its rule and working so he can see
  any error; each rule's wording is fact-checked like a lesson; rules are versioned.
- **Table structure, not values.** The prompts depend on table and column headings being right for
  his edition. Name columns by heading as well as number; research takes them from the current tables.
- **Edition drift.** A3:2024 is out and his course taught A2:2022. The open question below.
- **Scope.** Three-phase final circuits, harmonics, Ct and power factor, the short circuit and the
  RCD loop each add rows and tests. Staged after the pilot.
- **Copyright.** No table is shipped; his values stay private to him; the flowchart is redrawn and
  credited; quotes are short.
- **Not BS 7671 at sea.** Said once, never implied otherwise.

---

## 12. Open questions for Dan, and what research must still quote

**For Dan:**
1. **Which edition do you design to now?** Your course taught BS 7671:2018+A2:2022; A3 (2024) is
   published. Do you have A3? Whether A3 changes any step is not yet checked, and the tool follows
   whichever you choose.
2. **Which book do you use for R1+R2 per metre and the multipliers:** the On-Site Guide (Tables I1,
   I3), GN3 (B1, B3) or the IET Design Guide (F1, F3)? The prompts name your book's tables.
3. **Remember the table values you type** and offer them back next time (private to you)? Proposed: yes.
4. **Where should the tool live:** a row on the Library home (proposed), or a tab of its own?
5. **What goes in your design records:** the copied working as text, a saved page, or a line per
   circuit for a schedule? (Proposed: the first two.)
6. **Which circuits first:** single-phase final circuits and a three-phase submain in the pilot
   (proposed), then motors and three-phase final circuits, harmonics, Ct and power factor, the short
   circuit, the RCD loop?
7. **Keep it fresh off by default:** right?

**Research (beyond the brief's section 7, which still stands):**
- Each table's column headings for the edition he chooses (4D1A to 4J4A and their B tables, 4B1,
  4C1, 41.2 to 41.4, 54.2 to 54.7, 43.1), so prompts name them exactly. Headings only, no values.
- The Ct formula and the power-factor voltage-drop expression (BS 7671 Appendix 4).
- The rule for comparing a measured Zs with the maximum (BS 7671 Appendix 3, GN3), for As built,
  and the temperature OSG Table I1's mΩ/m values are given at (20 °C is assumed in the mockups).
- The condition for an RCD giving fault protection when Zs is too high, and its regulation number.
- The BS 3036 fusing factor and the conventional times (the "10,000s" of slides p.30).
- The star-delta "delta running conditions" rule (guide p.7); Ca at 20 °C (Table 4B1).
- The B, C and D instantaneous-trip multiples (Appendix 3).
- Which rules govern a ship's installation, for the one line that says BS 7671 does not.
- Amendment 3: every step, heading and value the sheet relies on.

---

## 13. The mockups

All in `mockups/`, self-contained (no external files; the D4 tokens are copied in; fonts fall back
to the system's when Barlow is not installed). Every number is printed in Dan's materials (cited on
the page) or computed from the rule shown; the job names in "Your jobs" and the as-built readings
are example values and say so.

| File | Shows | Figures |
|---|---|---|
| `course.html` | The course page: toolbox, saved jobs, Check a design, Quick reference, the edition line; the eight jobs with the why pieces inside them; Keep it fresh off | none beyond counts |
| `sheet.html` | The sheet on his job, row 6 open with its CSA stepper and table prompt; live (change the length or CSA and it re-works); laptop layout with the flowchart rail | Slides p.42, 50 to 61 (section 7, job 1) |
| `loop.html` | The run changed to 85 m: voltage drop fails, the loop and helper first, the rows after it wait; "Try 6.0 mm²" goes round the loop | 32.14 V, 11.50 V, 10.37 mV/A/m, 8.09 V (slides p.42) |
| `site.html` | The site summary, What you should read at test, then As built with example readings | 0.363 Ω, 0.573 Ω; 0.35 Ω, 0.53 Ω, 0.600 Ω |
| `reference.html` | The quick reference: edition line, search, the flowchart in bands, the voltage-drop card | Slides p.38, 40, 41; guide p.6; formula sheet |
| `why-145.html` | Why piece A: I2 and 1.45 Iz on one line; breaker, rewireable fuse, Cf applied | Slides p.25, 30 to 32 |
| `check.html` | Check a design: the submain's drop left out, found | 8.09 V, 10.00 V (example), 5.77 V, 13.86 V |

Screenshots (360 × 780 at 2x, and the sheet and loop at 1280 × 800) and three contact sheets were
made with Playwright for review; they are not kept in the repo.
