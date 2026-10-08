# Next version: what is left

Version 8 (published 6 Oct 2026, commit 1a777ee) shipped: the course dossier (field-journal
Library, chapters bound as ideas finish, kept on delete, save a copy), the fact-check step
(verify-lesson), quiz mode on target checks, the "Try this" lede, the run-2 panel's prompt
changes (de-overfit, research routing), the kit audit (sandbox heartbeat, legibility, K.drag,
a hands-on mechanism exemplar, history timelines) and the v8 lesson-screen and views fixes.

Version 9 (published 7 Oct 2026, commit e935fae): "Just teach me" courses, the intake questions,
"Put it into practice", and dossiers without test questions.
Version 10: course pictures through Dan's Hugging Face connector (Claude MCP, Z-Image Turbo).

## Measure first
1. Eval round 3 with the three-judge panel on fresh topics with live research (tools/eval/
   RUNNER.md, now with the verify-lesson step a2). Compare with run 2's overall 3.13; the two
   fresh-topic mini-evals scored about 4 (seasons) and 3-4 (Roman Republic).

## Known small issues (release check and checkers)
2. Dossier: on a laptop a lone shelf book's caption sits at the far left; the answer loop in
   Field tests can cross the last letter of a long answer; at XL the "Chapter complete" stamp
   touches the key term; the bibliography's page-turn label wraps mid-word on a phone.
3. Review target card: after a wrong Check the readout still shows "?" while the hint gives the
   reading.
4. Today's Light day offers "Just 5 cards" when only 4 are due.
5. Learn it again across devices: a screen following another device's newer request has no
   timeout if that device never writes; a back-forward-cache tab copy's in-flight job keeps the
   old holder.
6. Learn/Today opened during a real outage: Learn's progress read is not retried after recovery;
   Today has no calm reconnecting state; a refused topic read says "Saving is not allowed".
7. Ask Claude: an intro line followed directly by a list (no blank line) renders as one
   paragraph with dashes.
8. Prompt craft: the write-lesson rules are about a third longer than before the panel; trim
   further once eval round 3 shows which rules earn their place.
9. Course pictures: the 'making' claim is a fresh read then a set, not an atomic lock (db
   `acquire`); two devices that take the same new course in the same second can each draw it
   (the later picture wins). Rare, and costs one extra picture.
10. Course pictures in the live viewer: confirm on Dan's phone that the data-URL pictures show
    inside the covers (the artifact's image policy was not testable here; the drawn cover stays
    underneath if they do not).

## Saturday (Dan's credits reset): build every ready-made Maths course
Dan: "Generate absolutely every single one of these as an entire course I can actively browse at
my leisure, fully built end to end as an off-the-shelf course." The shelf is the db doc
shelves/maths (docs/shelves-maths.json): 7 folders, 58 courses, each with a title and a one-line
blurb. The first version (7 Oct) had 6 folders and 39 courses; later that day Dan asked for every
Brilliant course to be listed, so the shelf gained Brilliant's remaining maths courses, an Everyday
maths folder, and three more shelves alongside it: shelves/science (docs/shelves-science.json),
shelves/computer-science (docs/shelves-computer-science.json) and shelves/data-analysis
(docs/shelves-data-analysis.json). Each course's `from` field names the Brilliant course it mirrors
and says "(retired)" when Brilliant no longer offers it. Dan decides which of these to build and
when; the Saturday order below is for the Maths shelf. For each course: plan it, research it, write and build every lesson
(the v12 rules: overall explanation, the key concept, the interactive, what cements it, a recap;
no word limits; his background as an electrician), save the topic and its lessons to the db as
'ready' (mode 'read' unless he says otherwise), then set that course's `tid` in shelves/maths so
it shows "Ready to browse". Order: folder by folder, as listed.

## Research (8 Oct): how to teach the pre-built courses
Dan: the off-the-shelf courses need not follow the organic lesson flow. Research only, no course
writing yet: how Brilliant structures and teaches a lesson; what the learning science says about
ordering explanation, examples, interactives, practice and review for adult self-study on a phone;
how Khan Academy, Math Academy, Duolingo, the Open University and MOOCs structure courses;
Gagne, Merrill, 4C/ID, Rosenshine and UK electrical training; and the app's own current flow and
limits, for contrast. Done 8 Oct: the report is docs/research/how-to-teach-pre-built-courses.md
(its notes in docs/research/pre-built-courses-notes/). Its recommendation, for Dan to accept or
change: levelled courses of short explain-first lessons (orient, one skippable prediction, named
rule with a worked example, a goal-wrapped interactive, faded practice feeding review, say it back,
recap), with a mixed closed-book Level Review after every 4-8 lessons. Nothing is built from it yet.
