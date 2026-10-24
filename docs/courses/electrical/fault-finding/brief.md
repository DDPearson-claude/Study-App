# Fault-finding: from symptom to cause — the course brief

Written 24 Oct 2026 for Dan, in the shape of `tools/course/RUNBOOK.md` section 0. It is a plan. Nothing
is researched in full, written or built yet. It follows `docs/plans/next-build.md` and the full
design in `docs/plans/work/design-fault-finding.md`, with your five decisions of 24 Oct ("Go ahead with
all five recommendations").

**The short version.** Four lessons, each a live drawing of one system with hidden faults. You find
them yourself. This is the first course in the **Fault Bench** learning style and the
**bench-first** build style. **Lesson 1 is built alone as the test**, and the build stops at a
taste test before the costly part. Lesson 1's bench, readings and routes are in `i1.bench-design.md`.

| # | Lesson | The bench | Its jobs |
|---|---|---|---|
| 1 | The pump that won't run | A DOL starter's control circuit | Warm-up; no click; a Stop that won't stop; after a contactor change |
| 2 | The motor that hums, trips or runs hot | The motor's power circuit | A burnt contact pole; trips after a while; trips after standing wet |
| 3 | The earth fault that doesn't trip | An insulated 440 V ship's board | Which line; find it section by section; the second earth |
| 4 | A watch's defects | The first three benches | Three reports, solo, in your order; brief the next watch |

---

## 1. The overall topic

How a qualified electrician gets from a report to a proven cause, quickly and safely. The method is
taught inside the faults, never as a list. Start with what changed. Make it safe. Predict each
reading. Choose tests that clear half of what's left. Test each part the way it is used. Read a
rating against how the part is fed. Prove the fix, because one fix can hide a second fault.

**Edges.** In: control circuits, motor power circuits and an insulated ship's board, plus one
lesson that runs them together. Out: teaching any test procedure, because your Level 3 awards
cover it. The lessons name a test and say what its reading means. Also out: inspection and testing
material, RCD faults and ring final readings, which stay on hold. So are amendments and the Building
Regulations, and any claim about how the Royal Navy does things. Condition monitoring is a separate
shelf entry.

## 2. What is useful to teach, in order

1. **The first move and the safe start.** Read the report, start with what changed, isolate and
   prove dead in order. Judge live against dead: live testing is taught as a judgement, never a habit.
2. **Halving.** Each test should clear about half of what is left, whichever way it reads.
3. **Test it the way it's used.** A healthy open contact reads open. A bridged Stop reads closed,
   just like a healthy one.
4. **Read the rating.** The right voltage for the wrong part.
5. **Prove the fix.** Start, hold and every Stop. The proof finds the second fault.
6. **Which layer?** Lesson 2: the click splits a starter into control and power. The current
   pattern splits contact, load and insulation.
7. **Sectionalising.** Lesson 3: the ship's version of halving, keeping essential services on.
8. **Choosing and handing over.** Lesson 4: order by danger, leave it safe, brief the next watch.

## 3. How it is taught: Fault Bench

Your rules of 18 and 21 Oct apply. Never re-teach your qualifications, keep screens to about 90 words
at most, and tell safety, never let you discover it.

- One lesson is one drawing of one system, with about three jobs in 12 to 15 minutes. A report
  arrives. You pick your first move, then tap Sure or Not sure. Right and sure skips the coaching.
- **Make it safe** is told, as a put-in-order card, the first time in a lesson. After that it takes
  one tap.
- **The test loop.** Pick a test and two points. Say what you expect, then read the meter. Every
  reading comes from a stated rule. Where no value is sourced, it shows a class such as "near zero"
  or "over range", never a made-up number.
- **A short note appears only when a reading surprises you**, or when you name the wrong part.
  It always appears in the read-through.
- **Name the fault and prove the fix.** Green only when the fix is proven. Then teach it back to a new
  AB once a lesson, marked by Claude. Then **Keep this**, a fault card for that system.
- No score, timer, stars or streak. "Show me a short route" is always there.
- **Watch it found** is the read-through: Keep this, then each job's short route as pictures, with one
  line of thinking beside each reading.
- **Format.** Every lesson in the course is a steps lesson, `format: 'steps'`, with the bench player
  inside its page. The read-through spine is the Watch it found order. The course is never mixed with
  reading lessons, because `assemble.mjs` refuses that.
- **Ask Claude** sees the lesson and the bench's state, but never the hidden fault until you name it.
  Its replies are not checked content.

## 4. How it is built: bench-first

Each lesson is one data file, `bench.json`. It holds the parts, faults, readings, routes, notes,
teach-back and Keep this. `tools/course/bench.mjs` computes every reading from its rule. It checks
that each fault can be told apart, that each short route leaves exactly one fault, and that the route
is safe: no dead test before proving dead, and no live test without a sourced reason. It also checks
the writing rules: screen length, no narrated sources, no brackets, short sentences, and the right
answer not always in the same place. The page reads the bench through the case file, so wording fixes
need no rebuild. Stages, models and effort are as CLAUDE.md's 11 Oct table, with Write renamed
**Bench author** (Opus high). A **taste test** follows the bench and its drawing: one picture on your
phone of the drawing, the three reports and the expert's route. You say go, too easy, or stop. The
build has at most three attempts.

## 5. The lessons

### Lesson 1: The pump that won't run (the test)

Pitched above Motors lesson 2. The hold-in fault is a 20-second warm-up, and the wrong coil is
only the first half of job 3. The bench is a ladder, top to bottom: supply, P0, control fuse, P1,
panel Stop, P2, a two-core cable with a repair joint out to the pump's Stop between R1 and R2, P3,
Start with the hold-in contact across it, P4, the overload contact, P5, the coil, neutral. Toggles:
"Hold Start in" and "Hold the pump's Stop pressed".

- **S0 The bench.** **S1 Warm-up**: runs only while Start is held, so check the hold-in contact.
- **Job 1, No click** (coached): S2 report and first move; S3 suspects, 6 left; S4 make it safe,
  in order; S5 live or dead; S6 the test loop, with the expert's four tests. They are P0-P3 over
  range, P0-P2 near zero, R1-R2 near zero, P2-R1 over range: the core out to the pump is open. Notes
  "Split it in half" and "A healthy open contact". S7 name it, fix it, prove it.
- **Job 2, A Stop that won't stop** (coached): S8 the cable was joined yesterday, so stop it at the
  panel, isolate and open the joint. S9 both cores sit in one connector, which bridges the pump's
  Stop. Prove it with the Stop held pressed, note "Test it the way it's used". S10 prove start, hold
  and every Stop.
- **Job 3, After a contactor change** (solo): S11 it buzzes. The coil's plate says 400 V, fed 230 V
  from one line and neutral, so the wrong part was fitted. S12 the proof fails: it runs only while
  Start is held, because terminal 14 is empty. Two faults from one job.
- **S13 Teach it back** to a new AB, with five points. **S14 Keep this.**
- About 300 words read if you know it all, about 800 with every note open. The review box holds 5
  choice puzzles, 1 order card and 1 written card.

### Lesson 2: The motor that hums, trips or runs hot

The power circuit: supply, main contacts, overload and motor terminals, with a clamp on each line,
line-to-line voltage and an insulation tester. Job 1, coached: it hums, won't turn, then trips, from
a burnt main contact pole. That is single-phasing: the remaining two lines carry about 173% of
normal current. Job 2, solo: it trips after running a while, from a binding pump, against an
overload set wrong. Job 3, solo: it trips at once after standing wet, from low insulation
resistance on the windings. New idea: which layer? The click splits control from power. The
insulation minimums in use disagree: IEEE 43's 1 megohm plus 1 per kV, a maker's 5 megohms, and
1 megohm as the usual line on shore. They are shown side by side, as a disagreement. The jobs need
the motor running for the clamp readings, so live testing is judged again, as in lesson 1.

### Lesson 3: The earth fault that doesn't trip

An insulated 440 V three-wire ship's board with earth lamps or an insulation monitor and six
outgoing circuits, some essential. This is new ground for you, so one note card comes first: why one
earth gives an alarm and not a trip, against automatic disconnection ashore. Job 1, coached: a lamp
goes dim, so which line? Job 2, solo: switch sections off one at a time to find it, keeping
essential services on. Job 3, solo: a second earth on another line, and why that one is dangerous.
Public sources only. It says general marine practice and never claims how the Royal Navy does it. It
covers the first earth-fault ideas, so "Earth faults at sea" can shrink to 2 lessons later.

### Lesson 4: A watch's defects

No new drawing. Three reports arrive across the first three benches, solo, and you choose the order.
The most dangerous is made safe first. Anything unfinished is left safe and reported. It ends with a
four-line brief to the next watch, which Claude marks. Your RCD and ring-final handouts stay on hold
with Inspection and testing, so this lesson replaces the RCD lesson. It is cheaper, since no drawing
is built.

## 6. What your materials give and lack

| Material | Gives | Lacks |
|---|---|---|
| NVQ "Fault finding and rectification" slides, 7 pages | A method: symptoms, data, drawings, records, experience, inspect and test. The questions to ask, including what led to the fault. Visual inspection first. Fault kinds: open, short, high resistance. The right instrument for each. Leaving safe and reporting in writing. C1 to Fi codes | Half-splitting. Testing a contact the way it is used. Motor control circuits. Proving the fix by a functional test. Anything marine |
| NVQ "Health & Safety (1)" slides, 8 pages | Safe re-energisation: loads disconnected so nothing starts unexpectedly. Regulations list. Shock response | The isolation steps themselves, which it leaves to another book. Nothing on live work |
| HSE HSG85 (2013), 25 pages | The dead working sequence: identify, disconnect, lock off, notices, prove dead, prove the tester before and after. Two-pole testers, not multimeters, for proving dead. Regulation 14's three conditions for live work, with fault-finding named as a case where dead may be unreasonable. Accidents during fault-finding under pressure | Control circuit detail. Marine systems |
| S plan and Y plan "no heating" charts | Your own step-by-step live voltage trace, a piece-by-piece route to contrast with halving. Not shown | The text is flattened with no arrows, and it is a heating system, not a motor |
| Motors course, checked quotes | The DOL wiring facts: [42], [45], [46], [48], [49], [50], [52], [60], [61], [62], [67], [78], [262]. The coil band [245], one maker's figure. Buzzing causes [248]. GS38 on proving the tester [260]. For lesson 2: [32], [34], [106], [227] to [232] | A general source for the coil band. Half-splitting |

## 7. Sources to find before lesson 1 is written

Each is sourced or its screen or line is cut, as the plan says.

1. **The isolation and lock-off order.** HSG85 paras 46 to 55 hold it, with GS38 [260]. Your H&S
   slides add re-energisation. *Have it. To check:* the plan's five steps start "Isolate", while HSG85
   starts with identifying the circuit.
2. **When live tracing is defensible.** Regulation 14 through HSG85 paras 23 and 24. *Have it.* It
   is contested by design: HSG85 names fault-finding as a case where dead may be unreasonable, so
   the lesson says why dead is right *here*.
3. **Half-splitting, and proving the fix.** Not in your NVQ slides. *To find:* a public
   troubleshooting text, such as Kuphaldt's open textbooks. Also a source for a functional test of
   controls after repair.
4. **A joint that bridges the remote Stop after a cable repair** (job 2). *To find:* a source that a
   connection error at a joint can bypass a stop control. If none is found, it stays a worked case,
   computed from the drawing, with no claim about how often it happens.
5. **A Stop that doesn't work keeps the equipment off until it's found** (job 2). Your NVQ slides
   cover leaving safe. *To find:* PUWER 1998 regulation 15, stop controls, or its guidance L22.
6. **"Many electricians trace control faults live"** (S5). *Unsourced.* The proposal is to replace
   it with HSG85 para 38: accidents happen during fault-finding when there is pressure to repair.
7. **The coil band** (job 3). Motors [245] gives one maker's 85% to 110%, always said "for
   example". *To find:* a general source, such as the contactor standard's operating limits. Also
   whether a coil at about 58% of its rating buzzes or stays silent. [248] supports buzzing as one
   way it shows.

## 8. The rest of RUNBOOK section 0

- **Benchmark.** No Brilliant course covers trade fault-finding. The model is structured
  troubleshooting training: a strategy plus a layered picture of the system, then simulated faults
  (Schaafstal and others, 2000). Also cognitive apprenticeship: watch, coached, solo, explain.
- **Starting point.** Your BS 7671 design and verification, inspection and testing, and cable fault
  location are ground you already have. So are Motors (lesson 2 is this same starter), AC circuits,
  Design and verification and Subsea. No screen teaches a test procedure.
- **Your aim.** Leading rate and a Level 3 marine engineering qualification. Fault-finding is the work
  a leading hand directs and checks, hence the teach-back to a new AB and the brief to the next watch.
- **The mistakes to catch,** each met by a job or a note:
  - blaming a healthy normally open contact that reads open;
  - trusting a Stop because it reads closed at rest;
  - taking 230 V at the coil as healthy without reading the coil's rating;
  - swapping parts before testing, or resetting what hasn't tripped;
  - tracing live by habit;
  - testing piece by piece from the top;
  - proving only the part you fixed;
  - an unproved tester.
- **Where it is used.** Any DOL starter: pumps, fans and compressors [67]. Motor power circuits. A
  ship's insulated board.
- **Size and cost.** From the plan: lesson 1 about 1.05M. The taste test comes at about 1.5 to 1.7M
  all in, including this brief, the research and `bench.mjs`. Lessons 2 to 4 cost about 0.7 to 0.85M
  each, and the whole course about 4.8M, in a band of 4.5 to 5.5M. We stop and report if lesson 1's
  own stages pass 1.5M. Tokens are reported stage by stage.
- **Pilot first.** Lesson 1 alone. Lessons 2 to 4 are built only if it passes your three questions.

## 9. Your decisions, and what is open

Decided 24 Oct:
1. Build lesson 1 alone as the test, stopping at a taste test before the costly build.
2. The RCD and ring-final handouts stay on hold with Inspection and testing. Lesson 4 is "A watch's
   defects" on the first three benches.
3. Lesson 3 is "The earth fault that doesn't trip": an insulated ship's board, public sources, never
   how the Royal Navy does it.
4. No separate plain-English edit for bench lessons in this test. `bench.mjs` checks the writing rules
   on every screen, and the fact-checker reads the final words. If the reviewer finds writing the
   script missed, the edit comes back.
5. The shelf entry is now "Fault-finding: from symptom to cause". Done.

Open:
- **Syllabi.** When you can, share the leading rate and Level 3 marine engineering syllabi.
  Lessons 2 to 4 would be pitched at them. The test does not wait.
- **The plan validator wants 5 to 8 ideas.** This course has 4. `validate.mjs plan` reports
  that one hard problem and nothing else, and `assemble.mjs` will report it too. A small tooling
  change is needed before assembly: a minimum to sit beside the ready-made course's `maxIdeas`.
  The alternative is adding the waiting lesson, which your decision 2 rules out.
- **Two small corrections to the plan's lesson 1,** made in `i1.bench-design.md`. The two-core cable
  has no spare core, so job 1's fix is a new cable or a proper joint. Piece by piece over six places
  takes up to five tests, not six.
