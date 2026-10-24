# What to build next, and a new way to build and learn it

For Dan, 24 Oct 2026. You asked: "analyse what's left to build and tell me what we should build
next. I also want a new innovative build style and learning style for the next one as a test."

**The short answer.** Build **"Fault-finding: from symptom to cause"** next. Test it with a new
learning style, **Fault Bench**: you find faults on a live drawing instead of being taught the rule
first. It also uses a new build style, **bench-first**. Build lesson 1 alone as the test. All in,
that is about 2.3 to 2.7M tokens: lesson 1 itself about 1.05M, plus the one-off brief, research and
tools. You get a look at it at the taste test, about 1.5 to 1.7M all in, before the costly part. We
stop there if it is not for you. The test needs no app publish.

Nothing was built or changed for this plan. Design and verification lesson 10 has since finished and
is live, so the test can start whenever you say go.

---

## 1. What is left to build

Ranked by value to you. Costs are rough, at about 1.0M tokens a lesson, which is what recent courses
cost. "Ready" means nothing is stopping it.

| # | Course | Your materials | Value to you | Lessons | Cost | Status |
|---|---|---|---|---|---|---|
| 1 | Fault-finding: from symptom to cause | NVQ fault-finding and H&S slides, HSG85, your motor sheets | Very high. Daily work, and what a leading hand directs | 4 | 4.8M | **Next: the test** |
| 2 | Generators and the ship's switchboard | Almost none | Very high for the Navy path | 4 | 4.6M | Ready. Public sources only |
| 3 | Earth faults at sea | None | High. The biggest shore-to-ship change | 2 or 3 | 2.4–3.4M | Ready. Best after 1 |
| 4 | Transformers | None | Medium. Partly known ground | 4 | 4.4M | Ready |
| 5 | Leading a team (Level 4) | None yet | High | 4 | 4.3M | Waits for your syllabus |
| 6 | Instrumentation and control | None | High, but wide | 4–7 | 4–7M | Ready |
| 7 | Batteries and stored energy | One IET introduction | Medium | 3 | 3.4M | Ready |
| 8 | Mechanical and heat science | None | Unknown | 6–8 | 7–9M | Waits for your Level 3 syllabus |
| 9 | Maths: Vectors, then Differential equations | None | Medium, then later | 6 + 6 | 6.5M each | Ready |
| 10 | Design and verification 11: other supplies | Greenhouse handout, C&G paper 4 | Low. Its generator part fits course 2 | 1 | 1.2M | Optional |
| 11 | EV charging | Two webinar videos | Low. Shore only | 3–4 | 4M | Low priority |
| – | Inspection and testing, 3 courses | The most of any topic | High | 17 | 19M | **On hold** until you say go |
| – | PAT | One mock paper | Medium | 4 | 4M | On hold. Needs your slides |
| – | Amendments 3 and 4; Building Regs | – | – | – | – | Dropped, as you said |
| – | 33 more maths courses | – | Your long-run wish | about 230 | about 230M | Not next |
| – | 42 courses on three other shelves: science 17, computer science 18, data analysis 7 | – | Listed on 7 Oct | – | – | Waits for your pick |
| – | Maintenance: insulation resistance and condition monitoring | – | The rest of the shelf's "Maintenance and fault-finding" | – | Not costed | Not yet planned. See section 6 |

Earth faults at sea moved up one place from the first draft. It is cheap, it is the single biggest
difference between shore work and a ship, and it is the natural course to build after this one. If
lesson 3 of the fault-finding course covers the first earth-fault ideas, it shrinks to 2 lessons.

---

## 2. What to build next, and why

**Fault-finding: from symptom to cause, 4 lessons.** It is your daily work. It is also the work a
leading hand is asked to direct and check. It builds on four live courses: Motors, AC circuits,
Design and verification and Subsea. It uses your own materials. Lesson 1 needs no inspection and
testing material, so the hold is respected.

It is also the one subject where a different way of learning is the natural one. You start from the
fault, not the rule. Every live course runs rule, then example, then check. So this tests something
truly new.

Five designs were drawn up. They are saved in `docs/plans/work/`. Three judges scored each one out of
10: one as you would, one on building it, one on truth and learning. All three put Fault Bench first
(8, 8 and 8). The talk-it-through design came second each time (7, 7 and 7). It is not the cheapest test. The "talk it through"
design can stop at about 1.0M, and the job-aid design costs about 2.0M.

---

## 3. The new learning style: Fault Bench

### What a session feels like

One lesson is one system on the screen, such as a starter's control circuit. It is drawn as a
working diagram, not a photo. You get three jobs on it, about 12 to 15 minutes in all.

- **A report arrives**, the way a job reaches you: "Pump 2 won't start. No click."
- **Your first move.** You pick where to start, then tap Sure or Not sure. Right and sure skips the
  coaching. Wrong or unsure, and the job is coached.
- **Make it safe.** Isolation is always told, never found out by getting it wrong.
- **The test loop.** You pick a test and two points. You say what you expect. Then the meter on the
  drawing shows the real reading for that fault.
- **A short note appears only when it matters.** For example, when a reading you were sure of
  surprises you. If you never need it, you never see it during the job.
- **Name the fault and prove the fix.** Green only comes when the fix is proven.
- **Teach it back** to a new AB once a lesson, in a few sentences. Claude marks it, as in Design and
  verification.
- **Keep this**: a fault card for that system to read before a real job.

No score, no timer, no stars and no streak.

**"Just read it through"** becomes **Watch it found**. You see an expert's short route through the
same jobs as pictures, with one line of thinking beside each reading. It is a real way to learn,
and it is the reference you would open before a job.

### Why it should work for you

- **You already know the field.** Research on experts shows that explaining first can get in the
  way. Problems first works better for people who already know the subject (Kalyuga; Reisslein,
  with circuit analysis).
- **Fault-finding is trained best as a strategy plus a picture of the system in layers, then
  practice on simulated faults.** Technicians trained this way solved twice as many faults, in less
  time (Schaafstal and others, 2000). Across studies, a diagram that behaves correctly carried over
  to the job best overall, especially for less skilled trainees. But more lifelike simulators helped
  trainees with high prior skill, on electronic systems. That is you, so a plain diagram may suit
  you less well. The pilot will show it.
- **A guess before each reading helps it stick.** Questions asked before teaching help (g = 0.54).
  A mistake you were sure about is the one you are most likely to fix for good.
- **Words on the drawing, and no text you don't need.** This is the fix for "too much text after the
  diagrams". For experts, the diagram alone can beat diagram plus text.
- **Explaining it to someone** is one of the best-supported ways to learn (g = 0.55).
- **Safety steps are told, not discovered.** Learning by failing helps ideas, not procedures
  (g = −0.03).

The g numbers measure how big an effect is: about 0.2 is small, 0.5 medium and 0.8 large. No study
has tested an AI-built course for a qualified electrician on his phone. The pilot is how we find
out.

---

## 4. The new build style: bench-first

### The idea

Each lesson is built from **one data file**, the bench. It holds the parts, the faults, every
reading, the expert's route, the short notes and the Keep this card. A checking script,
`bench.mjs`, works out every reading from a stated rule. It refuses a bare number. Where no value
is sourced, the meter shows a class such as "near zero" or "over range", never a made-up figure.

The script also checks the bench is sound before anyone reads it:
- each fault can be told apart from the others;
- the expert's route is safe, with no dead test before proving dead;
- no live test is offered without a sourced reason;
- the writing rules hold: screen length, no narrated sources, no brackets, short sentences, and the
  right answer not always in the same place.

The page reads the bench as data, so words are never retyped. A wording fix needs no rebuild.

### The stages, with models and effort

No stage changes model or effort from your 11 Oct table. One change is yours to make: dropping the
separate plain edit, which is decision 4. Confirm keeps your rule.

| Stage | Model, effort | What changes |
|---|---|---|
| Brief and plan | Opus high | Adds a fault design per lesson: the system, its faults and three jobs |
| Research | Sonnet high, quote checker | Done once. Motors' checked quotes are reused as they are. Only a named list of gaps is researched |
| Bench author (was Write) | Opus high | Writes the bench and runs the checking script until it is clean |
| Plain edit | Opus high, fresh reader | Kept unless you say yes to decision 4. Then the script's writing rules and the fact-checker do its job |
| Fact-check | Opus high, fresh reader | Reads the final words you will see. Safety first. Hand-checks the script's rules once against sourced answers |
| **Taste test** (new) | Dan, 5 minutes | One picture on your phone: the drawing, the three reports and the expert's route. You say go, or too easy, or stop |
| Build | Opus xhigh, at most 3 attempts | The drawing (made for the taste test), then the player |
| Review | Opus xhigh, fresh reader | Plays every job from one contact sheet a job |
| Fix | Opus high | Mostly data edits. No rebuild, no new attempt |
| Confirm | Sonnet medium | As today: skipped only when just small polish points were found. A safety or fact fix is always re-read |
| Guide and assemble | Sonnet low | Checks every read-through picture before review, not after |

**Gone:** the research top-up every lesson and words typed in three places. The plain edit goes
only if you agree.
**Kept:** the quote checker, fresh fact-check, fresh review, the phone test at 360 px, the three-attempt cap,
and a token report to you.

### What is reused

- About 20 Motors quotes, already checked word for word, plus your DOL sheet.
- Existing kit pieces: choices, drag to order, the written answer, Keep this, the phone layout.
- The existing route that already brings case data into a lesson page. No app change is needed for it.
- The phone self-test, the guide maker, the Book and the review box.
- Later: the player across lessons, and the script's rules across courses. Earth faults at sea,
  Generators, Instrumentation, and Inspection and testing when you say go, can all use benches.

### Tokens per lesson

Reasoned estimates, not measurements. Motors was estimated at 0.7M a lesson and came in at 1.05M,
so the measured figure decides. These are lesson-only figures. They assume the plain edit goes. If
you keep it, add about 0.1M a lesson.

| Stage | Today | Bench lesson 1 | Bench lessons 2–4 |
|---|---|---|---|
| Research top-up | 0.15M | 0 (done once, up front) | 0.02M |
| Write and plain edit | 0.25M | 0.20M | 0.18M |
| Fact-check | 0.10M | 0.10M | 0.09M |
| Build | 0.20–0.38M | 0.45M (drawing 0.15, player 0.30) | 0.18M |
| Review | 0.15M | 0.16M | 0.14M |
| Fix and confirm | 0.15M | 0.10M | 0.08M |
| **Per lesson** | **about 1.0M** | **about 1.05M** | **about 0.7M; expect 0.75–0.85M** |

**The whole course** comes to about 4.8M, within 4.5 to 5.5M. Today's way would be about 4.5M. The
first course pays once for the checking script, so it costs about the same. Each later lesson
should cost about a quarter less, and later bench courses gain the most.

---

## 5. App work the test needs, smallest first

1. **Nothing to play lesson 1.** The bench reaches the page through the existing case-data route.
   The player lives inside lesson 1's own page, built from kit pieces that exist today. 0 tokens.
2. **The guide maker learns two things.** It reads a lesson where jobs branch. It also checks each
   read-through picture before review: drawn from a named step, fitting a 328 px screen, small in size,
   and never showing the answer before the question. About 0.15 to 0.3M.
3. **The checking script, `bench.mjs`.** Build tooling, not app code, so a bug in it cannot touch your
   daily review. About 0.4 to 0.6M, once.

None of this is app code, so the test needs no rebuild or publish of the live app.

**After the test, only if it passes:**
- **An "I did say that" chip** on written answers, used only where a lesson switches it on. If Claude
  misses a point you made in trade words, one tap credits it and we log it. About 0.15M. It is app
  code, so it needs a rebuild and a publish of the live app.

- **"One more go" in review**: a puzzle you miss comes back once at the end of the same session,
  without moving its schedule. Your Sure or Not sure tap is saved with it. It suits every course.
  It touches the Today screen, so it is built and tested on its own. About 0.3M.
- **The player moves into the kit**, so later lessons only draw a bench and write data. About 1M.
- **An offline copy** of the fault cards: the Book's saved copy already does this today.

---

## 6. The pilot

### The course: Fault-finding, 4 lessons

| # | Lesson | Its jobs |
|---|---|---|
| 1 | **The pump that won't run.** A DOL starter's control circuit | No click; a Stop that won't stop; after a contactor change. Coached, then solo |
| 2 | **The motor that hums, trips or runs hot.** The power circuit, with a clamp meter and insulation tester | Single-phasing from a burnt contact; trips after a while, a binding pump or an overload set wrong; trips after standing wet. The two insulation minimums that disagree are shown side by side, as contested |
| 3 | **The earth fault that doesn't trip.** An insulated 440 V ship's board with earth lamps | Which line; find it section by section, keeping essential services on; a second earth, and why that one is dangerous. One note card first, because this is new ground. Public sources. It never claims how the Royal Navy does it |
| 4 | **A watch's defects.** The whole task | Three reports across the first three benches, solo, in your order. It ends: brief the next watch in four lines. Claude marks it. No new drawing, so it is cheaper |
| – | Waiting | RCD trips that come and go, and readings that tell a story: a broken ring, polarity, an open PEN. Both use your inspection and testing handouts, so they wait for your go |

**The test is lesson 1 alone.** Lessons 2 to 4 are built only if you pass it.

**Where it goes on the shelf.** The Electrical engineering shelf already lists "Maintenance and
fault-finding": "Systematic fault-finding, insulation resistance and condition monitoring". This
course covers the fault-finding. Insulation resistance is only partly in lesson 2, and your subsea
course covers IR and PI. Condition monitoring is not in it. My proposal: rename that entry
"Fault-finding: from symptom to cause", and its tid goes there. Add a new planned entry,
"Maintenance and condition monitoring", with no tid. As with the Inspection and testing proposal,
the shelf file changes only when you agree. That is decision 5.

### Lesson 1, screen by screen: "The pump that won't run"

**Re-pitched above Motors.** Motors lesson 2 already taught the hold-in fault and the 400 V coil on
230 V. So the hold-in fault is now a 20-second warm-up, not a job. The wrong coil is only the first
half of job 3. The jobs teach what Motors did not: half-splitting, a Stop that won't stop, testing a
contact the way it is used, and a proof that finds a second fault.

**The bench.** The control circuit is drawn as a ladder, top to bottom, which suits a phone. Top to
bottom it runs: supply, test point P0, control fuse, P1, panel Stop, P2, then a two-core cable to the
pump. At the pump are R1, the pump's Stop and R2, with the cable's repair joint along the way. Then
come P3, Start with the hold-in contact across it, P4, the overload contact, P5, the coil, and
neutral. That is 8 test points, each 44 px. The motor is drawn faint beside it. Two switches sit
under the drawing: "Hold Start in" and "Hold the pump's Stop pressed".

**Before writing starts, these must be sourced or the screen or line is cut:** the isolation and
lock-off order (HSG85, your H&S slides); when live tracing is defensible (Electricity at Work
Regulations, regulation 14, and HSG85); half-splitting and proving the fix (your NVQ fault-finding
slides); a joint that bridges the remote Stop as a real fault after a cable repair (job 2); a Stop
that doesn't work means the equipment stays off until it's found (job 2); and "Many electricians
trace control faults live" (S5).

**A rule for the build brief: Ask Claude.** Ask Claude sees the lesson and the bench's live state,
and can search the web. The hidden fault stays out of that state until you name it. Otherwise it
could give the fault away, or suggest a live trace that the bench says is wrong. Ask Claude's
replies are not part of the checked content.

---

**S0. The bench** (look)
"Three jobs on one starter. Each starts with a report. You choose the tests and say what you
expect. Then read the meter. Name the fault and prove it fixed. Theory turns up when a reading
surprises you." (38 words)
Buttons: Job 1 · Job 2 · Job 3.

**S1. Warm-up** (choose)
"Quick one first. Pump 2 runs only while someone holds Start. Let go and it stops. What do you
check?"
Options: the hold-in contact and its wire (right) · the overload · the coil · the motor's
insulation. Then Sure · Not sure.
Right and sure: "Yes. The coil pulls in, so its whole path works. Only the path that keeps it fed
after Start springs back is in doubt."
Otherwise: a short note, "What keeps the coil fed", with a moving picture of the current path.
Review card: a choice puzzle.

**Job 1: No click**

**S2. Report and first move** (choose)
"Report: Pump 2 won't start from the panel. No click from the starter. The overload hasn't tripped.
What's your first move?"
Options: isolate, then test along the coil's circuit (right) · reset the overload and try again ·
fit a new coil · insulation test the motor. Then Sure · Not sure.
Wrong picks get one line each. For example, the new coil: "Nothing points at the coil yet. Swapping
parts before testing is guessing."
Right and sure goes straight to the test loop, without coaching. Review card: a choice puzzle.

**S3. Suspects** (coached only)
"Tap every part that could cause this." Chips sit on the drawing.
Then: "Anything in the coil's path could. The hold-in contact can't, because with Start held it
plays no part. The overload flag makes a trip unlikely, but its contact or wires could still be
open." Suspects left: 6.

**S4. Make it safe** (put in order, first job only)
"Before you touch a terminal, make it dead and prove it. Put the steps in order."
Isolate · Lock off and tag · Prove the tester on a known supply · Test dead where you'll work ·
Prove the tester again.
"That's the order. A tester that fails can show dead on a live circuit, so prove it before and
after." Later jobs take this in one tap. Review card: an order card.

**S5. Live or dead?** (choose)
"How will you trace it?" Dead: "Good. A dead test will find an open circuit, so there's no reason to
work live." Live, as a warning: "Many electricians trace control faults live. The law allows live
work only when it's unreasonable for the circuit to be dead. Here a dead continuity test will find
it, so working live can't be justified. Isolate instead?"

**S6. The test loop** (the heart of it)
"Pick a test and two points. Say what you expect, then read it."
You pick "near zero, a path" or "over range, open", and Sure or Not sure. Then the meter reads,
with its leads on your two points. Coached jobs ask which parts that reading clears.
The expert's short route, each a picture in the read-through:
1. P0 to P3 reads over range. "The break is in the top half: the fuse, the panel Stop or the pump's
   Stop loop."
2. P0 to P2 reads near zero. "Fuse and panel Stop are whole. It's in the pump's Stop loop."
3. R1 to R2, across the pump's Stop, reads near zero. "The Stop is fine, so a core is open."
4. P2 to R1 reads over range. "The core out to the pump is open."

*Note: Split it in half.* It opens after three piece-by-piece tests in a row. "Six places could hold
the break. Test across the top three. Whichever way it reads, you've cleared three. Test across half
of what's left and you're down to one or two. Piece by piece can take six tests. Halving takes three
at most."
*Note: A healthy open contact.* It opens if you blame Start after testing it without holding it in.

**S7. Name it, fix it, prove it**
You tap the place, then pick the kind: open circuit, short circuit, wrong part fitted, or high
resistance. If you are wrong, it quotes your own log back: "That doesn't fit test 2. P0 to P2 read
near zero, so the panel Stop is whole."
Then the fix, a spare core or a new cable, and its proof. One line: "Your tests: 5. A short route:
4." The job turns green. Review card: "Where is the break?" from the four readings.

**Job 2: The Stop that won't stop**

**S8. Report and first move** (choose)
"Report: Pump 2's cable was damaged and joined yesterday. Now the Stop at the pump doesn't stop it.
The panel Stop does. What's your first move?"
Options: stop it at the panel, isolate, then open the new joint (right) · change the Stop button at
the pump · trace it live while it runs · leave it, the panel Stop works.
"Leave it" gets a warning: "Someone at the pump would press Stop and nothing would happen. It stays
off until it's found."
Right: "Yes. Make it safe, then start with what changed." Review card: a choice puzzle.

**S9. Look, then prove it**
Inside the joint, both cores sit in one connector. "The pump's Stop is joined out. Current goes
straight past it, pressed or not."
Then: "Prove it. Hold the pump's Stop pressed." P2 to P3 reads near zero.
*Note: Test it the way it's used.* "A Stop is normally closed, so it reads near zero at rest. That
proves nothing about the Stop. Hold it pressed and test again. A healthy Stop now reads over range.
Near zero means something bridges it."

**S10. Fix and prove it** (pick all that apply)
Press the pump's Stop: it stops · Press the panel Stop: it stops · Start, then let go: it keeps
running · Insulation test the motor.
"You worked on the control circuit, so prove everything it does: start, hold, and every Stop." Green.

**Job 3: After a contactor change** (solo)

**S11. Report**
"Report: The contactor on Pump 2 was changed yesterday. Now it buzzes when Start is pressed, and the
pump won't run. You're on your own for this one."
There are no suspect chips and no checks between tests. "Show me a short route" is always there.
The expert looks at the coil's plate first: "Coil 400 V AC", an example value named once. "The
circuit feeds the coil from one line and neutral, so 230 V. This coil wants 400 V. Wrong part
fitted."
The note "The right voltage for the wrong coil" opens only if you miss it. It shows 230 ÷ 400, about
58%, against a pull-in band of, for example, 85% to 110%.

**S12. The proof fails**
You choose your proof, and the bench plays it. "Start: it pulls in and runs. Let go: it stops. Your
fix worked, but the job isn't done."
Back to the bench, solo. The expert looks at the new contactor: "Terminal 14 is empty. The hold-in
wire was never moved across from the old contactor."
Fix and prove it. Green. "Two faults from one job. Only the proof showed the second."
Review card: "You fitted the right coil. Start, let go, and it stops. Where now?"

**S13. Teach it back** (written, marked by Claude)
"A new AB on your section asks why Pump 2 buzzed, and why it still wouldn't run after you fixed
that. Tell them in a few plain sentences."
Points: the buzz meant the coil had power · a 400 V coil on a 230 V feed can't pull in · then the
hold-in wire hadn't been moved · prove start, hold and every Stop after any change · plain words a
new hand would follow.
Claude asks one follow-up question, as today. The "I did say that" chip is not in the test. It
comes after, if the test passes.
Then a model answer of about 70 words. Review card: a written card.

**S14. Keep this** (the first page of the read-through and the Book chapter)
For: finding why a DOL starter won't start, won't stop or won't hold.
- Make it safe, then start with what changed.
- No click, overload not tripped: split the coil's path in half, dead.
- Test a contact the way it's used: Start held in, Stop held pressed.
- Runs only while Start is held: the hold-in contact or its wire.
- Buzzes: read the coil's rating, then how it's fed.
- After any control repair, prove start, hold and every Stop.
Traps: a healthy Start reads open, and a bridged Stop reads closed, just like a healthy one. 230 V at
the coil is only right for a 230 V coil. One fix can hide a second fault.

---

**Watch it found** (the read-through): Keep this, then each job's short route as pictures with one
line of thinking each. Every note sits in its place, and every question appears as a worked example
with its answer. About 25 pages, none over 90 words.
**Review box:** 5 choice puzzles, 1 order card, 1 written card.
**Words you read:** about 300 if you know it all, about 800 if you open every note.
**Cut from the first design, to keep the test small:** the "another random fault" button and a
routes screen. They can come back in lesson 2.

### How we judge the test

**We compare it with Motors lesson 2, "The DOL starter".** It is the same starter, taught today's way.

**After lesson 1 we ask you three things:**
1. Did finding it teach you more than being told it?
2. Too easy, about right, or too hard?
3. Would you open the Keep this card before a real job?

**It passes** if you say yes to 1 and 3, and "about right" or "too easy" to 2. "Too easy" means harder
jobs, not a different style. **It fails** if it felt slow, fiddly on the phone, or like a game.

**What we also look at:**
- You play all three jobs, in about 12 to 15 minutes.
- Your teach-back gets at least 4 of its 5 points.
- Your review grades at one and three weeks, on these cards against Motors lesson 2's cards. This
  is a small sample, so it is a hint, not proof.
- The build: lesson 1's own stages at or under 1.3M tokens, not counting the brief, research and
  tools. At most two attempts, review scores of 4 or more,
  nothing reaching the reviewer that the script should have caught, and no blank or giveaway
  pictures in Watch it found.

**Then:**
- **Go:** build lessons 2 to 4.
- **Adjust:** if you like it but it feels slow, cut to two jobs a lesson.
- **Stop:** keep the bench as an optional "Practise on a fault" at the end of normal lessons.

---

## 7. Risks, and the decisions for you

### Risks, and what keeps them small

- **Teaching something unsafe.** Safety facts are sourced before writing, or the screen is cut. The
  script refuses an unsafe order. A fresh fact-checker and a fresh reviewer both read it. Every
  safety slip in past builds was caught that way.
- **Too easy for you.** Known faults take 20 seconds, not a job. You see the three reports at the
  taste test and can say "too easy" before the costly build.
- **Fiddly on the phone, or the build blocked at 360 px.** The ladder runs top to bottom, with at most
  8 test points and rows that wrap. If it is blocked after three attempts, lesson 1 ships as a normal
  steps lesson with the same jobs as questions. The checked content still reaches you.
- **Cost.** Stop if you say no at the taste test, at about 1.5 to 1.7M all in. Stop and report if
  lesson 1's own stages pass 1.5M, not counting the brief, research and tools. Tokens are reported
  stage by stage.
- **Claude marking you down for trade words.** The marking already accepts the same point in other
  words. If it still misses trade words in the test, that is the case for the "I did say that" chip.
- **Ask Claude giving the fault away.** The hidden fault stays out of what Ask Claude sees until you
  name it. Its replies are not checked content.

### Five decisions

1. **Build lesson 1 as the test?**
   *Recommended: yes.* Start after Design and verification lesson 10 finishes. Run to the taste
   test, about 1.5 to 1.7M all in, then finish lesson 1 if you say go, about 0.8 to 1.0M more.
2. **Your RCD and ring-final handouts sit with the held inspection and testing material. Use them
   now as fault cases?**
   *Recommended: no, keep them on hold.* Lesson 4 becomes "A watch's defects" on the first three
   benches. The RCD lesson waits with inspection and testing.
3. **Put "the earth fault that doesn't trip" in this course as lesson 3?**
   *Recommended: yes.* It makes the course about the ship, not just shore starters. Earth faults
   at sea then shrinks to 2 lessons later.
4. **Drop the separate plain edit for bench lessons?** It was added on 20 Oct after "horribly
   written", following the 1.67M rewrite. In a bench, the script checks the writing rules on every
   screen, and the fact-checker reads the final words.
   *Recommended: yes, for this test only.* If the reviewer finds writing the script missed, it comes
   back. Saying no adds about 0.1M a lesson.
5. **Rename the shelf's "Maintenance and fault-finding" entry** to "Fault-finding: from symptom to
   cause", and add "Maintenance and condition monitoring" as a new planned entry?
   *Recommended: yes.*

**One ask, no decision needed:** when you can, share the syllabi for the leading rate engineering
qualifications and the Level 3 marine engineering qualification. Lessons 2 to 4 would be pitched at
them. The test does not wait for them.
