# Maths: the build queue (Dan, 24 Oct 2026: "Let's work through the maths section first")

**Updated 25 Oct (Dan): "Add electronics to the queue after linear algebra and pause vector calculus", then "Put our
shorter statistics course before electronics."** After Linear algebra comes Statistics for engineers (one 5-lesson course,
Probability, statistics and data folder), then Electronics and power electronics (Electrical shelf, Electrical
principles folder), then stop. Vector calculus is paused (kept on the shelf, not built). Group theory is dropped and
off the shelf. Items 7 to 10 below are not to be started without his say.

Built: all of Foundational maths, all of Algebra, Calculus fundamentals. Removed as overlaps (24 Oct): Limits,
Derivatives, Calculus in a nutshell, Introduction to linear algebra.

Order (one course at a time, each published when it passes; about 6 to 8M tokens a course):

1. Vectors (live 25 Oct, about 8.2M tokens)
2. Differential equations (live 25 Oct, about 9.2M tokens; the most useful foundation after Vectors: anything that changes over time)
3. Matrices (live 25 Oct, about 8.5M tokens)
4. Linear algebra (live 26 Oct, about 8.9M tokens)
4a. Statistics for engineers: measurements, trends and reliability (live 26 Oct, about 7.2M tokens plus 5.1M for the
    design contest; 5 lessons; maths shelf,
    first in the data folder; instead of the 7-course data folder, which stays unbuilt)
    Its data pictures come from a design contest first (Dan, 25 Oct: "Make sure on the data section an agent comes up
    with a really cool, pretty and satisfying way of visualising data"): three prototype styles, three judges, one
    merged language in dataviz.md that every lesson's brief, build and review must follow.
4b. Electronics and power electronics (live 26 Oct, about 10.2M tokens; Electrical shelf). The queue is now empty:
    wait for Dan.
5. Vector calculus (paused, 25 Oct)
6. ~~Group theory~~ (dropped, 25 Oct)
7. Probability, statistics and data: Descriptive statistics, Probability fundamentals, Conditional probability,
   Expected value, Data visualisation, Regression and prediction, Bayesian reasoning
8. Logical reasoning: Digital circuits first, then Logic, Reasoning with logic, Truth and lies
9. Everyday maths: Geometry and measurement, Real-world algebra, Everyday statistics, Probability and chance
10. Puzzles and enrichment: the eight courses, last

Each course uses scratchpad vectors-course.js (the Advanced maths build: brief research, brief, plan, research,
then per lesson write, fact-check, plain edit, build, review, fix, confirm; guides and assemble), with its
folder and earlier courses set per course. Dan can reorder or stop at any point.

## Next: engineering and electrical foundations (Dan, 26 Oct)

Asked "Have we built everything we need?", Dan was given this list, most useful first, and said "Start with
engineering science." It is a new shelf, Engineering science (docs/shelves-engineering.json), with two courses
built side by side, each about 8 lessons and 8 to 10M tokens:

1. Engineering science: Heat and fluids and Mechanics and materials (both live 27 Oct, about 9 to 10M tokens each)
2. Insulated systems and earth faults (Dan, 27 Oct: "Create them all"; Supply systems folder; live 27 Oct, about
   9.7M tokens, topic insulated-systems-and-earth-faults-al99a)
3. Batteries: cells, charging, hydrogen (Supply systems folder; live 27 Oct, about 9.8M tokens, topic batteries-ui8aw)
4. Generators and paralleling (Power and machines folder)
5. Transformers and magnetism (Electrical principles folder; live 29 Oct, about 10M tokens with the work lost to a
   machine restart, topic transformers-and-magnetism-vlbpr; the first course built with typed answers)
Built in two pairs: 2 with 3, then 5 with 4 (Transformers owns the magnetism Generators uses). The first
pair is live. Dan, 28 Oct: "Move ahead with typed answers, transformers and then generators. Stop after
that." Transformers is live; Generators is built next, on top of it, then the queue stops.
PAUSED again (Dan, 29 Oct: "Pause for now I might need my tokens today"): Generators stopped during
lesson 1's build. Its brief research (246 quotes checked), brief, plan and course research (26
sources) are done and saved in docs/courses/electrical/generators/; lesson 1 was written, fact-checked
and plain-edited. To carry on in the same session, resume workflow run wf_97d9f905-f01 (cached stages
replay). In a new session, copy docs/courses/electrical/generators/ back to build/electrical/generators/
and run the workflow with tools/course/args/generators.json (date 2026-10-29): it redoes the research
stages unless the script is taught to skip them.
Lower: Control and instrumentation with digital logic; Distribution and protection at sea.

Hidden on 27 Oct (Dan: "Hide everyday maths, computer science and any other folders we aren't immediately
using"): the Science, Computer science and Data analysis shelves; Logical reasoning, Everyday maths and Puzzles;
Vector calculus and the unplanned statistics courses; the unplanned Electrical courses. hidden: true in the
shelf docs; unhiding is one write. Everything is taught from public sources as general engineering, never as how
the Navy or a particular boat does it (CLAUDE.md).

### How a session builds them (27 Oct)

The build is a Workflow script kept in the repo: tools/course/shelf-course.workflow.js, with each course's
settings in tools/course/args/<slug>.json (insulated-systems, batteries, transformers, generators). It needs
the Parallel Search connector (the research quotes are harvested from its results; this machine cannot reach
the web directly). For each course:
1. Workflow with scriptPath tools/course/shelf-course.workflow.js and args the course's JSON (run two at a
   time: insulated-systems with batteries, then transformers with generators).
2. When it finishes: read its journal for unfixed points and failed confirms; fix small ones by hand
   (attempt.mjs --attempt 16 --reply ... --film none, then copy the .x.html to body.final.html).
3. node tools/course/guide.mjs --dir build/electrical/<slug> --app tests/out/kit.html, then
   node tools/course/assemble.mjs docs --dir build/electrical/<slug>; every example should have a picture.
4. Write out/manifest.json's docs to the db in batches under about 900 KB (topic doc last), set the course's
   tid in docs/shelves-electrical.json and the live shelves/electrical doc (if_version pinned).
5. python3 tools/course/tocopy.py <slug> i1,...,i8 --shelf electrical; commit; push to both branches.

### Lessons from the first pair (27 Oct), and what the tools now do about them
- guide.mjs reads a lesson's answers from a global `S` (the step states) and sets each `still` key with
  the app's control setter. It now keeps the picture when `S` is not the states (a drawing helper of
  that name had cost Insulated systems lesson 2 all seven example pictures), and warns, instead of
  crashing, on a `still` key that is not a control (Batteries lessons 7 and 8).
- guide.mjs gives no picture for a step that hides its scene (a puzzle about another board than the
  one drawn), so a review card never shows the wrong circuit.
- assemble.mjs refuses a research.json with two sources sharing one n, and the workflow's fix stage
  is told to append with the next unused n (a duplicate had made lesson 5 cite the wrong source).
- A lesson whose fix round ran out of attempts can be finished by hand, then the run resumed with
  args.fixedByHand: ["iN"].
- After assembling, look at the DO screens whose picture is not their own subject (another board,
  another voltage) and at any readout that shows a wrong option's value before the answer.
