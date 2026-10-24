# Walk me through it: a tutor who talks back

One of five independent designs answering Dan's request of 24 Oct 2026: "analyse what's left to build
and tell me what we should build next. I also want a new innovative build style and learning style for
the next one as a test." The angle given to this design: a tutor who talks back.

Analysis only. Nothing in the repository was changed, built or published. Read for it: the four reports
beside this file (`inventory.md`, `build-process.md`, `platform.md`, `learning-research.md`), CLAUDE.md,
`docs/ARCHITECTURE.md` sections 5 and 12, and the code a talk style would sit on: `app/kit/kit.js`
(`K.written`), `app/src/js/30-prompts.js` (the grade and tutor prompts), `31-generate.js`
(`markWritten`), `32-sandbox.js` (the `written` message), `50-lesson.js` (the written-answer host),
`51-tutor.js`, `52-notes.js`, `53-read.js`, `60-today.js` (puzzles and written cards from a guide),
`73-book.js` and `tools/eval/RUNNER.md`. Two web searches checked that public sources exist for the
pilot's claims; what they found is listed in 4.3 as leads, not as checked quotes. The other designers'
files were not read.

---

## 0. The short version

| | |
|---|---|
| **Key** | `conversation` |
| **Name** | Walk me through it |
| **One line** | Claude asks, Dan answers in his own words, and Claude probes and corrects from a fact-checked knowledge pack. Lessons are built as data, not as pages. |
| **Pilot** | Earth faults at sea: the insulated neutral. 4 lessons, the second half of the shelf's "Three-phase power systems at sea". |
| **Cost** | About 0.6M tokens a lesson (0.5 to 0.8M), against 1.0M today and 1.65M for the full process. Plus about 0.65M once per course for the brief and research. The app work is paid once: about 1.5M, a guess. The whole pilot is about 4.4M, about what this course would cost the usual way. Each sitting costs Dan about 25k tokens of his own Claude use. |

- **The learning style.** Each lesson is three or four questions, then "say it to someone", then
  Keep this. Every question starts from what Dan already knows ("Start ashore, on TN-S…"). He answers
  in a sentence or two. He can type, or use his phone keyboard's microphone. Claude replies in at most
  about 45 words. It says what he got right, in his own words, and asks one more question if something
  is missing. If he is still stuck, a checked hint comes next, then a checked answer card. If he knows
  it, the question takes thirty seconds and nothing is taught. If he doesn't, the teaching arrives at
  the moment he needs it. "Just tell me" is always there. "Just read it" turns the same pack into
  today's read-through.
- **What keeps it faithful.** The tutor never brings facts of its own. Each turn sees one question's
  card from the pack: the points a good answer makes, the usual slips with their checked corrections,
  the hints and the answer card. It returns ids: which points he made, which slip he showed, what to do
  next. Every correction, hint and answer Dan reads comes from the fact-checked pack, shown as "from
  the lesson". Claude's own words are limited to crediting him and asking. A runtime check throws out
  any reply with a number the pack and his answer do not hold. Questions outside the card go to the
  existing Ask Claude sheet, which is clearly Claude talking.
- **Why it should work.** It puts the best-supported moves for an expert re-learner at the centre.
  Questions come before teaching (prequestions, g = 0.54). Explaining "why" in his own words beats
  picking an explanation from a list (conceptual self-explanation prompts, g = 0.87; multiple-choice
  self-explanation not significant). Saying what he expects before the reveal, and how sure he is,
  helps most when the answer surprises him (prediction, hypercorrection). And it skips what he already
  knows, which matters because worked explanations can hurt experts (expertise reversal). Today's
  lessons make him read fixed screens. A conversation adapts in seconds.
- **The build style.** The bespoke 35 to 70 KB lesson page goes. In its place is one knowledge pack a
  lesson. The pack is the single source of words: it holds the questions, points, slips, hints,
  answer cards, teach-back, Keep this and a question bank. Research is done once per course, with
  quotes checked as today. One writer writes the packs with a writing lint in its loop. A fresh
  fact-checker reads the exact words Dan will see. A small picture page is built only where an idea can
  be manipulated, at Opus xhigh with the three-attempt cap. A new cheap stage, Rehearse, runs the real
  tutor prompt over scripted answers before Dan ever meets it. CLAUDE.md's models and effort table
  stands as it is.
- **App work.** One new module, a talk player (`54-talk.js`), with one new prompt (`TASK: talk-turn`)
  and its validator and guard. A pack compiles into the lesson doc and guide formats the app already
  reads. So the read-through, the Book, the puzzle box and the written review cards all work with no
  change. No steps engine, fault sandbox, branching step or new card type is needed for the test.
- **The pilot.** Earth faults at sea, four lessons: why the first earth fault doesn't trip; living with
  one earth fault; watching the insulation; finding the earth. It is the single biggest difference
  between shore work under BS 7671 and a ship. Every course Dan holds assumes an earthed system, so
  every question can start from his own knowledge and turn it over. That is exactly where a
  conversation beats a screen. It touches no standing instruction: no Inspection and testing material,
  no Building Regs, no amendments. Lesson 1 is written out in 4.4.

---

## 1. The learning style

### 1.1 What a lesson is

A lesson is a short guided conversation built around a few pictures:

1. **Three or four questions.** Each one opens from something Dan already knows, asks him to predict or
   explain, and ends when he has made the points that matter. It ends sooner if he says "Just tell me".
2. **Say it to someone.** He explains the lesson's idea to a named listener, such as a new AB on his
   watch or a chief who asks why. Claude plays the listener for one follow-up question, then steps out
   and marks the answer against the lesson's points. Explaining is part of leading, so this also
   serves his Level 4.
3. **Keep this.** Today's card: what it is for, the rule, the traps, where it applies. His teach-back
   answer goes beside it in the Book, in his own words.

Inside one question, the conversation climbs a short ladder and stops as soon as he has it:

| Rung | What Dan sees | Who wrote it |
|---|---|---|
| 0. Ask | A picture and a question of at most 40 words | the pack (checked) |
| 1. Probe | Claude credits what he said, in his words, and asks one question about what is missing | Claude, live; no new facts |
| 2. Hint | Claude's line, then a checked hint card of at most 35 words that gives one fact and asks again. If he showed a known slip, its checked correction appears here. | the pack (checked) |
| 3. Show | The answer card (at most 90 words) and the key line | the pack (checked) |

Most questions end at rung 0 or 1 for Dan, because he knows most of the shore side. The ladder never
has more than three Claude turns a question.

### 1.2 A typical session, screen by screen

On a 360 px phone, light mode, about 10 to 15 minutes:

1. **Lesson start.** The eyebrow in mono ("EARTH FAULTS AT SEA · LESSON 1 OF 4"), the title, one line
   on what it is about, "4 questions · about 12 minutes". Two buttons: **Walk me through it** (ink) and
   **Just read it** (outline). A small line: "Answer in a sentence or two. Your keyboard's microphone
   works too."
2. **Question 1.** A teal label "QUESTION 1 OF 4". The picture (a still on a white well, or a small
   live picture he can play with). The question. An answer box. Two send buttons, **I'm sure** and
   **I'm guessing**, so rating his confidence costs no extra tap. A chip: **Just tell me**.
3. **Claude's reply.** A note card in the D4 look: Claude's avatar, "Claude", at most about 45 words.
   - If he has it: "Spot on: …" and the key line appears in amber. **Next question**.
   - If something is missing: one question, and the box again.
   - If he shows a known slip, he gets a probe first. A second miss brings the checked correction,
     on a card marked "Claude · from the lesson".
   - Chips under the reply: **Just tell me**, and **I did say that**, which credits the point at
     once with no argument and logs it for us.
4. **Repeat** for questions 2 to 4. Each finished question folds to one line: an ink tick and its key
   line. Only the question he is on is open, so the screen never fills with chat.
5. **Say it to someone.** A short setup ("A new AB on your watch asks…"), his answer, one follow-up
   from the "AB", his reply, then the points ticked in ink (made) or a dashed ring (not yet). Then a
   one-line note in his words of what he did well, and **A model answer**. This is today's `K.written`
   result, drawn by the app.
6. **Keep this**, then done: "4 puzzles go in the box for your next study day." This is today's text
   and today's code.

If Claude cannot be reached, or the call is rate limited or too slow (20 s), the question shows its
answer card and the points as a list he ticks himself, as `K.written` does today. The rest of the
lesson carries on as reading, with the line "Claude can't be reached just now, so here's the short
version." Nothing is lost and nothing nags.

On a desktop the picture sits beside the conversation from 860 px, as `K.stage` does for a lesson
today.

### 1.3 Across a course

- **Each lesson** is one sitting of 10 to 15 minutes. A question he already knows costs him one answer
  and thirty seconds. That is the diagnose-first design the research asks for, done by conversation
  rather than by a separate test.
- **Between lessons**, the puzzle box does what it does today. Each question's opener comes back as a
  written card, marked against the same points, with his own last answer shown after he answers
  (`60-today.js` already does this for `lesson.written`). The pack's question bank becomes choice and
  typed puzzles. This is spaced retrieval of what he answered, in recall form, with elaborated
  feedback.
- **The last lesson ends with a mixed round**: three openers drawn from the earlier lessons, closed
  book. That is interleaving where the skill is telling cases apart. It is three more questions in
  lesson 4's pack, not new app code.
- **The Book** binds each lesson's Keep this card and, under "In your own words", his teach-back:
  first and latest. Dan uses these courses "as a reference for myself in the real world", so the
  reference grows in his own words, beside the checked rule.

### 1.4 The tutor's rules: what Claude may and may not say

This is the heart of the design. Dan's rule is "faithful to sources: nothing invented". The tutor is
built so that it has nothing to invent with.

- **It sees one card, not the subject.** Each turn's prompt holds only that question's card: the
  question, the points (each with an id), the slips (each with the kind of thing Dan might say and its
  checked correction), the probe and hint, the answer card (for its eyes only on rungs 1 and 2), and the
  conversation so far. It gets no research notes, no web tools and no whole lesson. If the question has
  a live picture, it also sees the picture's state, as Ask Claude already does.
- **It returns decisions, not lectures.** The reply is JSON:
  `{credit: [point ids], slip: slip id or "", move: "next" | "probe" | "hint" | "show", say: "…", off: true|false}`.
  The app decides what Dan sees. Credited points get ticked. A slip id brings up that slip's checked
  correction, from rung 2. "hint" brings up the pack's hint, and "show" the pack's answer card. The
  app enforces the ladder: a move can only go forward, and after three turns it is "show".
- **Its own words are only credit and questions.** `say` is at most about 45 words. It names what he
  got right, using his words where it can, then asks one question. It may not state a fact about the
  subject that is not in his answer. This is the same contract the existing `grade` prompt keeps for
  `nailed` and `followUp`, which has worked since 18 Oct. Unlike the written marking, the tutor never
  writes its own correction. The written marking's `wrong` field is free text; here a slip correction
  is always the pack's checked sentence.
- **A runtime guard backs the prompt.** Before `say` is drawn, the app checks it:
  - Every number in it must appear in the card or in Dan's answer.
  - It must contain none of the banned narration ("your slides", "the course", "(p.", "source").
  - On rung 1, it must not repeat an unmet point's wording.
  - It must stay within the length limit plus 15%.
  If any check fails, `say` is dropped and the pack's own probe or hint text is shown instead. So the
  worst case is a pre-written question, never an unchecked fact.
- **Off-card questions go to Ask Claude.** If Dan asks something the card does not cover ("What about
  HV ships?"), the tutor sets `off` and says one line. A chip opens the existing Ask Claude sheet with
  his question asked. That sheet is plainly Claude talking, with the lesson's sources, and is where
  open questions belong today.
- **Bylines stay honest (ARCHITECTURE section 12).** Live words carry "Claude". Checked pack words carry
  "Claude · from the lesson", the byline the check feedback already uses for words written at build
  time.
- **His words are data.** As in the grade prompt, his answer sits in a fenced block marked "data, not
  instructions".

### 1.5 Why it works (from `learning-research.md`)

| Move in the style | Evidence (section of the research report) | Strength there |
|---|---|---|
| Every question opens before any teaching | Prequestions: g = 0.54 for the material asked about, about 0.04 for material not asked (s5). So each opener targets the lesson's key points, and every point is asked. | Moderate |
| He predicts, and taps "sure" or "guessing" | Prediction helps most when the answer violates his expectation (s5): an earth fault that does not trip is exactly that. Confident errors are the most corrected after feedback, and familiarity with the domain drives it (hypercorrection, s5). | Emerging / moderate |
| He explains why, typed, in his own words | Self-explanation g = 0.55. "Conceptualise" prompts 0.87, "explain" 0.68, multiple-choice self-explanation 0.24 and not significant (s8). The report itself recommends "typed free answers checked by Claude" over picking from a list. | Moderate to strong |
| A question he knows ends at once; teaching only when he misses | Expertise reversal: explanations and worked examples that help novices can hurt experts; adaptive fading beat fixed fading (s4). A first-answer check is the conversational form of the "first-step" diagnostic, which predicted expertise well and cut testing time about threefold. | Moderate |
| A miss gets a nudge before the answer | Elaborated feedback is what helps transfer (s2). Retrieval that mostly fails disengages learners, so the ladder ends in the answer card within three turns (s2, the 2025 study). | Strong (retrieval), moderate (transfer) |
| Productive struggle only on "why" questions | Problem-first helps conceptual knowledge (g = 0.36 to 0.58) and not procedures (s5). Procedures in the pilot, such as the order of a search for an earth, are asked as "picture yourself doing it", which suits experts (s4). | Moderate, contested |
| Teach it back to a named listener | Articulation and reflection are steps of cognitive apprenticeship, the model behind Sherlock's coached fault-finding practice (s6), plus the self-explanation evidence above. | Moderate |
| Little text, on or beside the picture, only when needed | Split attention g = 0.63; redundancy and seductive details hurt; for experts the diagram alone can be best (s9). Most of a lesson's words are never shown unless he needs them. | Strong |
| Openers return in the puzzle box, recalled and marked | Retrieval and spacing are the only "high utility" techniques; recall beats recognition; successive relearning d = 1.52 to 4.19 (s2). | Strong |
| A mixed round at the end of the course | Interleaving g = 0.42, best where the skill is telling look-alike cases apart (s3). | Moderate |

**Two studies from outside the four reports**, which should be checked before they are quoted to Dan.
Both bear directly on whether an AI tutor helps or harms:

- Bastani and colleagues (2024, high-school maths): students given a plain GPT-4 chat did worse on a
  later exam without it. A version built to give hints rather than answers largely removed the harm.
- Kestin and colleagues (2024 to 2025, Harvard physics): a tutor built from pre-written, structured
  content beat an active-learning class.

Both point the same way as this design. Script the tutor from checked content, hint before telling,
and never hand over the answer on the first miss.

**Honesty.** No study looks at an AI tutor for a qualified electrician refreshing after a gap (report
s15). The pilot is one learner, so it gives signals, not proof.

### 1.6 How it keeps Dan's rules

| Rule (CLAUDE.md, his feedback) | How the style keeps it |
|---|---|
| Plain own words, no narrated sources (20 Oct) | Pack text passes a mechanical lint: words per card, narration patterns, brackets, semicolons, sentence length. The live `say` is short by contract and guarded for narration. No footnotes on screen at all; citations stay as data. |
| Faithful to sources; contested taught as contested | Every fact Dan reads is a checked pack card, and the tutor only picks ids (1.4). A contested question is marked in the pack: its points are the trade-offs, and any reasoned choice is credited. |
| At most about 90 words a screen (21 Oct) | Opener ≤ 40, Claude's line ≤ 45, hint ≤ 35, correction ≤ 40, answer card ≤ 90. Never more than about 90 new words on screen at once. Most questions show 40 to 80. |
| Calm reading, colour for meaning | One open question at a time. Earlier ones fold to a line. Ink ticks and progress; green only on the finished lesson; red only on a slip's "Not quite" label; teal labels; amber key terms. |
| Light by default; dark and text size in settings | The conversation is drawn by the app with the app's own CSS, so it follows the theme and Text size XL with nothing to self-test. Stills sit on a white well, as read-through and dossier plates do today. |
| Phone first, desktop equally good | One column at 360 px with 44 px chips. The question stays above the answer box when the keyboard is up. Beside-picture layout from 860 px. |
| Nothing in the way, no guilt | "Just tell me" on every question. No marks, no scores, no streaks. Skipping is never counted. "Just read it" is always one tap. |
| "Quiz me through" and "just read it" | Walk me through it is the quiz way. Just read it is today's read-through, compiled from the same pack: picture, question, answer card, key line, then the model teach-back and Keep this. |
| A visual earns its place | Stills for what is a picture; one small live picture per lesson where an idea can be manipulated (the CLAUDE.md rule), built and self-tested as today. |
| Not a job card; a refresher he can use on the job | The Book chapter is the reference: Keep this and his own explanation. The conversation is how it gets into his head. |

### 1.7 How it improves on today's lessons

1. **It stops teaching him what he knows.** Today every screen is read in a fixed order. The recall
   opener's "Skip to the practice" is all or nothing. Here each question costs him one answer when he
   knows it.
2. **He explains far more often than he taps.** A steps lesson today is mostly picture puzzles and
   choice questions (recognition), with one Section B written answer in refresher lessons. Here every
   question is a recall-and-explain.
3. **The text complaint goes away at the root.** On 21 Oct the problem was "a bit too much text after
   the diagrams". Here, text appears only when he misses something, and only the card for what he
   missed.
4. **Mistakes are met at the moment they happen,** with a checked correction (the platform report's
   Khanmigo note: tutoring helps only when it is offered at the mistake).
5. **His reference is in his own words,** which is what made the Level 4 stick: "I'll never forget that
   now."
6. **Builds get cheaper and steadier** (section 2): one source of words, no 35 to 70 KB body, and no
   page text to break at 360 px.

### 1.8 Where it does not fit (so it stays one format among several)

- **Calculation drills** (cable sizing, design current): typed numbers with named slips, as
  `K.answer` does, are better than talk. A talk lesson can still carry such puzzles in its bank.
- **Running a system** (a switchboard you synchronise): a simulator teaches that. Talk can sit around
  it but not replace it.
- **Procedures he has never done:** tell first, then ask. Productive failure does not help procedures.
- **New ground with no anchor in what he knows:** a conversation needs something to start from. The
  pilot was chosen because every question has one.

---

## 2. The build style

### 2.1 The knowledge pack: one source of words

Each lesson is one JSON pack (`build/electrical/<course>/pack-iN.json`), checked by
`validate.mjs pack`. In outline:

```
pack = {
  iid, title, oneLine,                              // as lessons.json today
  qs: [ {                                           // 3-4 questions (a mixed round adds up to 3)
    id, ask,                                        // <= 40 words, starts from what Dan knows
    kind: 'what-happens' | 'why' | 'walk-through' | 'which' | 'contested',
    picture: { still: '<svg>' } | { live: true, state: {...} },
    points: [ { id, text, cite } ],                 // 2-4, each <= 25 words; need: how many make it
    need,
    slips: [ { id, sounds: 'what he might say', fix, cite } ],   // 1-3; fix <= 40 words, checked
    probe,                                          // <= 25 words, a question, no new fact
    hint,                                           // <= 35 words, one fact from the points + a question
    show,                                           // <= 90 words: the answer, in plain own words
    key,                                            // <= 20 words, the line he keeps, [[term]] in amber
    rehearse: [ { says, credit: [ids], slip } ]     // 5-7 scripted answers; build only, never shipped
  } ],
  back: { role, asks, followUps: [..], points, need, model },   // say it to someone
  bank: [ ...choice and typed puzzles with answer and why ],     // the review box
  summary: { title, for, rule, traps, where, figures },          // Keep this, as today
  sources: [ ...cut from the course research by id, quotes never retyped ]
}
```

`tools/course/pack.mjs` compiles one pack into what the app already reads:

- **The lesson doc**, with `format: 'talk'` and `talk` (the questions without `rehearse`).
  - `written`: each opener as a written question, its answer card as the model. So review cards come
    for free.
  - `summary`, `sources`, and `explain` and `practice` for the dossier.
- **The guide** (`topics/{tid}/guide/{iid}`):
  - a `show` page per question (picture, question, answer card, key line);
  - an `example` page per bank item;
  - the teach-back model;
  - the summary first.

  So the read-through, the Book chapter and the puzzles need no change.

### 2.2 Stages, models and effort

CLAUDE.md's table is kept as it is. Two stages shrink, one merges and one cheap stage is added.

| Stage | Model, effort | What it does now | Gate |
|---|---|---|---|
| **Course brief and plan** (once) | Opus high (as today) | Lesson list. For each lesson: its questions, what each starts from in Dan's background (CLAUDE.md), the shore slips expected, and which idea, if any, gets a live picture and why. Dan agrees it. | `validate.mjs plan`; Dan's yes |
| **Research** (once, fully) | Sonnet high, quote checker (as today) | The whole course's sources in one pass, from the brief's "to find" list per question. Checked quotes reused by id where they hold (AC circuits' marine quotes). **No per-lesson top-up.** | `sources.mjs`: a quote kept only if it is on the cited page; `harvest.mjs` |
| **Pack write** (replaces Write and Plain edit) | Opus high (the Write stage's setting today) | One writer for the course, so one voice, lesson by lesson, with `--prior`. Reads only `TALK.md` (≤ 8 KB), the lesson's cut of the research and an exemplar pack. The writing lint runs in its loop. | `validate.mjs pack` (lint, ids, cites, word caps, every number a cite or a shown rule) |
| **Fact-check** | Opus high, fresh (as today) | Every point, fix, hint, answer card, key line, Keep this line and bank answer against its quote; numbers recomputed. It now reads the **final words**, since nothing changes them afterwards. It also reads the slips: is each "fix" true, and is each "sounds like" a real shore habit? | `validate.mjs verify --final` |
| **Build: pictures** | Opus xhigh (Dan, 11 Oct), at most three attempts | Stills as plain SVG, plus at most one live picture page a lesson: controls, the drawing, `K.check`, named states. No words, no stepper, no Keep this; the app draws all of those. `attempt.mjs` self-test at 340/720/1040 px, XL, both themes; one contact sheet. | the verdict; three attempts, then fix the brief (RUNBOOK section 5) |
| **Rehearse** (new) | Sonnet medium, as the model hat in `tools/eval/RUNNER.md` | `prompts.mjs talk-turn` builds the real tutor prompt for each scripted answer. The agent answers it as the in-app model would. `validate.mjs talk` then checks every reply: schema; credits against the writer's expected key; slip ids; no foreign numbers; length; no narration; no giving away on rung 1. It writes one transcript a lesson, the "contact sheet" of the conversation. If the app's default tier runs a different model, rehearse with that model. | key agreement of 90% or more; zero guard failures after the guard |
| **Review** (teaching and motion in one) | Opus xhigh, fresh (as today) | Reads the lesson as Dan would read it through, the rehearsal transcript and the picture contact sheet. Scores six counts, retuned: plain words; faithful; pitched above what he knows; probes that make him think rather than guess; pictures that teach; phone fit. Word counts are already done by the lint. | scores of 4 or more |
| **Fix** | Opus high (as today) | Edits the pack, which is data, so no page is rebuilt unless a picture was at fault. Re-runs the lint and the rehearsal for the questions it touched. | lint and rehearsal pass |
| **Confirm** | Sonnet medium (as today) | Only for teaching or safety fixes. Skipped when only polish was found, or when the fix touched data and the lint and rehearsal pass. | the reader's word |
| **Assemble and publish** | Sonnet low; Dan's session publishes | `pack.mjs` compiles; `assemble.mjs docs`; one ArtifactData batch; the token cost reported to Dan. | `assemble.mjs` refusals as today |

The three-attempt rule (Dan, 12 Oct) stays for every picture page. Its spirit carries to packs too: if a
question fails rehearsal twice, the question or the brief is wrong. We fix that rather than keep
retrying.

### 2.3 What stays, what goes, what is new

- **Stays:** the brief Dan agrees; research with every quote checked word for word on its page and
  harvested from the transcript; a fresh fact-check; picture builds self-tested at 360 px in both
  themes and at XL, with three attempts; a fresh review at xhigh; fix; confirm when needed; assemble;
  publishing from Dan's session; the token report; a pilot lesson Dan tries on his phone first.
- **Goes:**
  - the per-lesson research top-up (about 15% of today's cost);
  - the separate plain edit (about 0.1M a lesson);
  - the 35 to 70 KB steps body and its repeated machinery;
  - stills reverse-engineered from a live page;
  - "keep final.json in step";
  - the reviewer fact-checking a second time, because the fact-check now reads the final words.
- **New:** the pack contract and lint, the Rehearse stage, and `TALK.md`, a short format guide in
  place of 63 KB of RUNBOOK and `refresher.md` in every agent's reading.

### 2.4 What is reused

- **Across every talk course:** the talk player, the `talk-turn` prompt and guard, `pack.mjs`, the
  lint, the rehearsal harness, `TALK.md` and the exemplar pack.
- **A "what Dan knows" map:** his background from CLAUDE.md turned into named anchors (ADS and Zs,
  RCDs, IR and PI testing, half-split fault-finding, BS 7671 earthing systems, motor faults). Every
  brief picks its openers from it.
- **A slips library:** shore habits that mislead at sea ("an earth fault always trips", "the hull is
  live"). The fact-checker checks it once, and it is reused by every marine course: Generators,
  Transformers, Instrumentation.
- **Picture parts:** one set of one-line pieces (generator star point, busbar, breaker, hull bar,
  frame, fault flash) shared by all four pilot lessons. The earth-lamp picture is shared by lessons 2
  and 3, and again by Generators and the switchboard later.
- **Sources:** checked quotes by id across courses (AC circuits' insulated-neutral quotes, Design and
  verification's IEC 60364-4-41 quotes).

### 2.5 Tokens per lesson

A reasoned estimate, not a measurement. Estimates have run low before: Motors was estimated at 0.7M and
measured 1.05M, because reading, review and fix do not shrink with the screen count. This style cuts
exactly those fixed costs (a short format guide, a per-lesson source cut, no body to rebuild), but read
the top of each range as the likely figure.

| Per lesson | Today (refresher, about 1.0M) | Walk me through it |
|---|---|---|
| Research top-up | about 0.15M | 0 (research done once per course) |
| Write and plain edit | about 0.25M | about 0.15M (pack writer, lint in the loop) |
| Fact-check | about 0.10M | about 0.09M (on the final words) |
| Build | about 0.20 to 0.30M | about 0.08 to 0.12M (stills and at most one small live picture) |
| Rehearse | none | about 0.05M |
| Review | about 0.15M | about 0.10M |
| Fix and confirm | about 0.15M | about 0.06M |
| Assemble (share) | about 0.02M | about 0.02M |
| **Total** | **about 1.0M** | **about 0.6M (0.5 to 0.8M)** |

- **Once per course:** brief and plan about 0.2M, research about 0.45M. For a four-lesson course that
  adds about 0.16M a lesson, so about 0.75M a lesson all in. Compare 1.09M for AC circuits all in, and
  1.65M for the full process.
- **On Dan's own allowance:** each tutor turn is about 3k tokens in and 150 out. A typical sitting
  is 6 to 9 turns: about 25k tokens, never more than about 50k, because there are at most 14 calls a
  lesson. "Just tell me" makes no call. A written review card costs about 3k, as today. One lesson
  built today (1.0M) equals about 40 sittings.

### 2.6 Failure modes it removes and adds

**Removed or shrunk** (`build-process.md`, section 3):

- **Blocked builds at 360 px.** All three builds that reached a third attempt failed on a width in page
  text or readout rows. Words are now drawn by the app, so only a picture can fail a self-test, and a
  picture page is small.
- **Words in three places,** and the fact-check reading words that later change. There is now one
  source, and the fact-check reads it last.
- **Narrated sources and over-long screens.** The lint catches them mechanically, before any reader.
- **A step behind a number never shown.** Each point carries its own cite and rule, and a hint or
  answer card must show the rule behind any number.
- **Blank or misleading read-through stills.** Stills come from the pack's own SVG, at its own state.
  Nothing is reverse-engineered.
- **Guide warnings found after review.** `pack.mjs` compiles the guide before review, so the warnings
  are seen in time.

**Added, with their guard:**

- **Live words nobody fact-checked.** Guarded by the one-card prompt, id-only corrections, the number
  and narration guard, rehearsal, honest bylines and Ask Claude for off-card questions (1.4).
- **Marking an expert's answer wrongly.** Trade wording ("no return path so no ADS") must be credited.
  Guarded by the grade prompt's "accept equivalent" rules, rehearsal answers written in trade words,
  and the "I did say that" chip.
- **A tutor that feels like an interrogation.** Guarded by tone rules, no marks, "Just tell me", and at
  most three turns a question.
- **Behaviour drifting when the app's model changes.** The rehearsal transcripts become regression
  evals, re-run as `tools/eval` runs today.
- **A new kind of review: talk questions.** Rehearse is the place to catch a bad question before Dan
  does. The reviewer reads its transcript.

---

## 3. App work needed

### 3.1 The smallest set

| # | Piece | Where | What | Size (a guess) |
|---|---|---|---|---|
| 1 | **Talk player** `U.talk.mount(holder, {topic, lesson, guide, ip})` | new `app/src/js/54-talk.js` (about 500 lines) | Draws the questions one at a time with `U.notes.card`. Stills via `U.readThrough.pic`/`still`; the live picture via `U.sandbox.mount` (its `change` messages give the state). Holds the ladder and the fallbacks. Calls `U.gen.talkTurn`. Saves each opener's tries as `ip.written[qid]` (today's shape, so review cards carry `mine`), the teach-back as an `ip.say` entry (so the Book's "In your own words" shows it), and small stats as `ip.talk`. At the end it calls `U.review.puzzlesFor`, as a steps lesson does. | M, about 0.7M |
| 2 | **Talk turn** `U.prompts.talkTurn(card, turns, opts)` (`TASK: talk-turn`, pure), `U.validate.talkTurn`, `U.validate.talk(lesson.talk)`, `U.gen.talkTurn` with the guard | `30-prompts.js`, `31-generate.js` | One question's card, the turns so far, the rung, sure or guessing, the picture state. Default tier, JSON with the usual one repair, a 20 s budget, then the fallback. | S to M, about 0.35M |
| 3 | **Route and labels** | `50-lesson.js`, `71-topic.js` | `format: 'talk'` goes to the talk player and keeps the done section. The course page's two ways read "Walk me through it" and "Just read it" for a talk lesson. | S, about 0.1M |
| 4 | **Course tools** | `tools/course/pack.mjs`, `tools/eval/validate.mjs` (`pack`, `talk`), `tools/eval/prompts.mjs` (`talk-turn`), `tools/course/TALK.md` | Lint and compile; rehearsal prompts and checks; the format guide. | S to M, about 0.3M |
| 5 | **Tests and docs** | unit tests for the prompt, validators, guard and compile; an e2e run with `tools/harness/claude-stub.js` scripting turns, a time-out, a rate limit and a guard trip; ARCHITECTURE sections 5 and 9 | | inside the sizes above |
| | **Total** | | | **about 1.5M (1.2 to 1.8M), a guess.** No app-work estimate here has ever been measured. |

Nothing else is needed for the test. The read-through, the Book, the dossier, the puzzle box, written
review cards, FSRS, Ask Claude and the notes cards are reused as they are.

### 3.2 The talk turn, concretely

The prompt carries:

- `TASK: talk-turn`;
- the `DAN` background block the prompts already share;
- THE QUESTION;
- POINTS (id and text);
- SLIPS (id and "what he might say"; the checked fix is not sent, since the app shows it);
- the PROBE and HINT ids and texts;
- the ANSWER CARD, "for your eyes only: never quote or paraphrase it" (as the grade prompt keeps the
  model answer);
- the TURNS SO FAR;
- the rung and his sure or guessing tap;
- his latest answer in a fenced data block.

Its rules, in short:

- Credit generously in any words, exactly as `grade` does.
- Name one slip only if his words show it.
- `say` is at most 45 words: first what he got right, in his words, then at most one question.
- No fact that is not in his answer, no numbers, no sources, no praise without a reason.
- Use `off` when he asks about something outside the card.
- Reply with JSON only.

The app owns everything else: the ladder, the caps, which checked card appears, and the guard.

### 3.3 Deliberately not built for the test

- **The kit steps engine** (L): talk lessons do not need one.
- **`K.ask` inside the frame** (M): the conversation lives in the host, which can already reach Claude,
  and draws model text with `U.rich`, never in a frame.
- **Branching steps, the fault sandbox, fresh-number cards:** not needed.
- **Voice in the app:** the phone keyboard's own dictation gives speech-in with no microphone
  permission. Voice out is not needed.
- **Confidence-driven FSRS changes:** the sure or guessing tap is saved, but it does not move the
  schedule in the pilot.

### 3.4 A cheaper route considered and turned down

Extending `K.written` inside each lesson page (hide the points, three goes, slip ids) would be about
0.4M of kit work. It is turned down for three reasons:

- Every lesson would stay a bespoke kit page, so the build saving would be lost.
- Model text would still pass through the frame.
- The read-through would still be reverse-engineered from a live page.

The host-side player costs more once and less on every lesson after it.

---

## 4. The pilot: Earth faults at sea

### 4.1 Why this course

- **Dan would value it.** It is the single biggest difference between shore work under BS 7671 and a
  ship (`inventory.md` rank 4). Every course he holds assumes an earthed system. He is heading for
  ships' electrical plant on the Navy path.
- **It suits the style better than anything else on the list.** Every question has a strong anchor in
  what he knows: ADS, loop impedance, IT systems in BS 7671 411.6, which he will have read and probably
  never installed. Then the answer at sea surprises him: the first fault doesn't trip. That surprise is
  where prediction and hypercorrection pay off. It is mostly "why" knowledge, where self-explanation
  and problem-first questions work. The one procedure, finding the earth, builds on half-split
  fault-finding he already does.
- **It fits the size and touches no standing instruction.** Four lessons. No Inspection and testing
  material is used, which avoids the question `inventory.md` raises for Fault-finding. IR testing
  appears only as something he already does. No Building Regs, no amendments.
- **The style removes its old dependency.** The inventory said this course was "better built after
  rank 2 so the switchboard carries over". A conversation needs no switchboard simulator. It also
  takes the "faults at sea" lesson the inventory parked from Fault-finding.
- **The honest weakness:** it rests on public sources only, and none are Royal Navy material. So no
  screen may say how the Royal Navy does anything. Where practice differs between ships, it is taught
  as "practice varies; your ship's drawings and orders decide". Dan should be asked for any Navy notes
  on ship's electrical systems before research starts.

### 4.2 The lessons

| # | Lesson | Questions (openers in short) | Live picture (at most one) |
|---|---|---|---|
| 1 | **Why the first earth fault doesn't trip** | Ashore on TN-S, a line touches a frame: what happens? · Same fault, star point floating: does it trip? · Why would a ship choose that? · A second fault on another line: what now? · Say it to a new AB. | One-line diagram: star point "earthed / not connected", faults "none / L1 / L1 and L2"; the current path drawn and the breaker open or shut. Qualitative, no numbers. |
| 2 | **Living with one earth fault** | Before the fault, what does each line read to the hull? (440 V ÷ √3 ≈ 254 V, a shown rule) · After a solid fault on L1, what do L2 and L3 read to the hull, and why does that matter for insulation? · If nothing trips, does any current flow at all? (capacitance) · Contested: why do many HV ships earth the star point through a resistor instead? · Say it to the chief. | Line-to-hull voltages against fault resistance. Each line's voltage to hull is computed with one shown rule (Millman's theorem), using labelled example values for anything assumed. |
| 3 | **Watching the insulation** | Three lamps from the lines to the hull: one goes dark. Which line, and how do you know? · What does an insulation monitor measure, and when does it alarm? · The reading has dropped slowly all week: what do you do, and why not wait? · Say it to a new AB. | The earth-lamp board: the same picture as lesson 2, now with lamps. Reused. |
| 4 | **Finding the earth** | The insulation alarm is up on a 440 V board: walk me through how you'd find which circuit. · You can't open the steering gear's breaker. What now? · You've found the circuit: what's different about testing it dead here? · Mixed round: three openers from lessons 1 to 3 · Say it to the EOOW. | A board with six outgoing ways. He opens a way and the monitor reading changes. Readings come from a fixed table worked by hand and fact-checked: the cheap "evidence table" from `platform.md` 3.4. |

About 0.6M a lesson, so 2.4M for the four, plus 0.65M for the brief and research.

### 4.3 Sources found so far (leads for the research stage, not checked quotes)

Already quote-checked in AC circuits' research (`docs/courses/electrical/ac-circuits/research-notes.md`
6.1), reusable by id:
- the JEE129 marine electrical notes: "The majority of ships have a 3 phase, 3 wire, 440V insulated
  neutral system. This means that the neutral point of star connected generators is not earthed to the
  ship's hull."
- an IMarEST paper on neutral earthing, about warships: "particularly because of the need for
  high-integrity supplies generally in warships, these systems were operated without any connection to
  the ship's hull."
- the MCA ETO syllabus lines 3.13 "Insulated and earthed neutral systems" and 3.15 "Earth fault
  detection" (for the brief, not for teaching).

Found on 24 Oct by search. Each is still to be fetched, quoted on its page and checked by `sources.mjs`:
- **IEC 60364-4-41, 411.6** (public samples on standards.iteh.ai and old PDFs). In IT systems, live
  parts are insulated from earth or earthed through a high impedance. The fault current is low on a
  first fault, so automatic disconnection is not imperative. There are conditions for a second fault
  on a different live conductor. 411.6.3 lists insulation monitoring devices. BS 7671 follows the same
  numbering, which Dan knows.
- **IEC TR 63436:2026** (sample): an IT system "used for reasons of continuity of supply" uses an
  insulation monitoring device to indicate the first fault; for marine use, exposed-conductive-parts go
  to the hull.
- **SOLAS II-1, regulation 45.4** (transcribed on electrotechnicalofficer.com and in a Danish Maritime
  Authority text). With no connection to earth, "a device capable of continuously monitoring the
  insulation level to earth and of giving an audible or visual indication of abnormally low insulation
  values shall be provided". The research should find an official IMO text if it can.
- **US Navy NSTM chapter 320**, Electric Power Distribution Systems (public on man.fas.org). Ground
  fault detectors use three lights from each phase to the hull. A ground fault lowers the faulted
  phase's voltage to ground and raises the other two, and a solid fault turns the faulted phase's light
  dark. US practice, so it is taught as general marine practice, never as Royal Navy practice.
- **IRS Guidelines on Earthing Systems for Ships** (2024, a classification society): "the system
  design should allow for continuity of service under single-line-to-earth fault"; high-resistance
  earthed systems limited to 5 A with continuous earth fault monitoring (lesson 2's contested question).
- **IACS UR E11:** in high-impedance earthed systems that do not isolate feeders on an earth fault,
  insulation must be designed for the phase-to-phase voltage (lesson 2).
- **Bender, a maker** (its own products only, as the research rules allow): in a fault the crew must
  find the first fault before a second one, or the fuses of two distributors would trip (lessons 1 and
  4); how an insulation monitor measures (lesson 3).

Enough exists for lessons 1 to 3. Lesson 4's search procedure is the thinnest. If the research cannot
source a general sectionalising method, lesson 4 becomes the "evidence table" questions plus the
contested "you can't drop that breaker" question, taught as "practice varies".

### 4.4 Lesson 1, screen by screen

**Why the first earth fault doesn't trip.** About 12 minutes, 4 questions and a teach-back. Source
status uses the 4.3 labels: [AC] = checked in AC circuits' research; [lead] = found, to be quote-checked;
[DV] = in Design and verification's checked research; [to find] = still to be sourced; [example] = an
illustration, labelled as one. Claude's lines below are examples of what the live tutor might say. They
are not stored text.

**Screen 0: start.**
- EARTH FAULTS AT SEA · LESSON 1 OF 4 (mono, teal)
- **Why the first earth fault doesn't trip**
- "Ashore, an earth fault opens the breaker. On most ships it doesn't. Four questions on why, and what
  it costs you." (24 words)
- "4 questions · about 12 minutes"
- [Walk me through it] [Just read it]
- "Answer in a sentence or two. Your keyboard's microphone works too."

**Screen 1: Question 1, the warm-up from what he knows.**
- *Picture (still):* a supply transformer with its star point bonded to earth, a line to a motor frame,
  the protective conductor back, a red flash at the frame.
- QUESTION 1 OF 4
- **Ask:** "Start ashore, on a TN-S supply. A line conductor touches a motor's metal frame. Walk me
  through what happens, and why the breaker opens." (25 words)
- [answer box] [I'm sure] [I'm guessing] · chip [Just tell me]
- *Points (need 2):*
  - p1: current runs from the line through the frame and protective conductor back to the earthed star
    point;
  - p2: the loop impedance is low, so the current is large;
  - p3: the protective device sees it and disconnects automatically. [DV: the IEC 60364-4-41 and BS
    7671 ADS quotes]
- *Expected:* he makes all three in one answer, marked sure.
- *Claude (move next):* "Spot on. A low-impedance loop back to the earthed star point, so a big current,
  and the device opens. Hold on to that way home. Next, we take it away."
- *Key line (amber term):* "Ashore, the **earthed star point** is the way home for fault current."
- About 30 seconds. Nothing he knows was taught to him.

**Screen 2: Question 2, the surprise.**
- *Picture (live):* the one-line diagram. Star point [earthed | not connected], set to not connected.
  Fault [none | L1 to frame]. The breaker reads SHUT or OPEN. A loop is drawn red where current can
  flow. The result is hidden until he has answered (`k-after-move` today).
- QUESTION 2 OF 4
- **Ask:** "Now a ship. The same fault, but the generator's star point connects to nothing: not the
  hull, not earth. The frame is bonded to the hull. Does the breaker open? Say what you expect first."
  (37 words)
- *Points (need 2):*
  - p1: there is no path from the hull back to the star point, so no large fault current flows;
  - p2: the breaker sees only the normal load current, so it stays shut and the motor runs on;
  - p3: a tiny current still leaks back through the cables' insulation and capacitance.

  [lead: IEC 411.6.1 "fault current is then low", NSTM 320; p3 to find]
- *Slips:*
  - s1 "It trips, an earth fault is an earth fault." Fix: "With the star point floating, the hull
    isn't connected to the generator. There's no loop for a big current to flow round, so the
    breaker sees nothing unusual." (31 words)
  - s2 "The frame is now live at 440 V." Fix: "The faulted line is pulled to the hull's voltage, and
    the frame is bonded to the hull. So frame and deck sit at about the same voltage. What changed is
    the other two lines: lesson 2." (38 words)

  [lead: NSTM 320 for the faulted phase falling; the touch claim to find]
- *Probe:* "Follow the current to the hull. Where does it go from there to get back to the generator?"
- *Hint:* "On a ship like this, the hull has no connection to the generator's star point at all. So
  what does the breaker see?" (one fact, then a question)
- *An example run, with a confident slip:*
  - **Dan** (I'm sure): "It'll trip. Earth fault's an earth fault, the CPC takes it to earth."
  - **Claude** (slip s1, probe): "You're following the shore loop, and ashore that's exactly right.
    Take the current as far as the hull. Where does it go from there to get back to the generator?"
  - **Dan:** "Nowhere, the star point's not connected. So it won't really flow… it won't trip?"
  - **Claude** (credit p1 and p2, next): "That's it. No way home, so no big current, and the breaker
    stays shut. Now try the switches and watch the loop."
  - He flips the star point to earthed and back, and sees the loop appear and vanish.
  - Because the slip was confident, his opener comes back in the puzzle box on its normal schedule.
    He will meet it again, recalled, not reread.
- *Key line:* "With a **floating star point**, the first earth fault has no way home, so nothing trips."

**Screen 3: Question 3, the why (problem first, conceptual).**
- *Picture (still):* a switchboard feeding three services, labelled as examples: steering gear, fire
  pump, lighting. A red flash on the steering gear feed. All three still running. [example]
- QUESTION 3 OF 4
- **Ask:** "So a ship can run for hours with one line touching the hull, and nothing trips. Why design it
  that way, when ashore we make sure it does trip?" (30 words)
- *Points (need 2):*
  - p1: the supply stays on through one earth fault, so essential services keep running (continuity
    of supply) [lead: IRS guidelines; IEC TR 63436];
  - p2: an alarm or indicator shows the fault instead, so the crew can find and clear it at a safe
    moment [lead: SOLAS II-1/45.4; IEC 411.6.3];
  - p3: in warships this was done above all for supplies that must keep going [AC: IMarEST].
- *Slips:*
  - s1 "To save copper, it's three wires not four." Fix: "Three wires instead of four is a side
    effect. The reason given for warships is a supply that keeps going after one fault." (27 words)
  - s2 "Because it's safer for people." Fix: "Not simply. One fault gives very little current, which
    helps. But it leaves the system one fault away from a short circuit. That's the next question."
    (31 words)
- *Probe:* "Think about the steering gear. What would you lose if its breaker opened every time a cable
  chafed onto the hull?"
- *Hint:* "Ship designers aim to keep the supply going through one earth fault. If nothing trips,
  what has to tell the crew it's there?"
- *Example:*
  - **Dan:** "So you don't lose steering when something chafes."
  - **Claude** (credit p1, probe): "Yes, that's the heart of it: the supply rides through one fault.
    But if nothing trips, how does anyone know the fault is there?"
  - **Dan:** "Alarm. Earth lamps on the board."
  - **Claude** (credit p2, next): "Right. Something tells you, and you choose when to find it, not the
    breaker. Warships lean on this hardest."
- *Key line:* "Ships float the star point for **continuity of supply**: one fault, no trip, an alarm
  instead."

**Screen 4: Question 4, the catch.**
- *Picture (live):* the same diagram, now with a second fault switch: [none | L2 to another frame].
- QUESTION 4 OF 4
- **Ask:** "L1 is still on the hull somewhere and nobody has found it. Now L2 chafes onto a different
  frame. What happens?" (22 words)
- *Points (need 2):*
  - p1: the hull now joins L1 to L2, which is a short circuit between lines;
  - p2: a large current flows and protective devices open, perhaps on both circuits, so the
    continuity is lost;
  - p3: so the first fault has to be found and cleared quickly.

  [lead: IEC 411.6.4 second fault; Bender maritime; electrotechnicalofficer.com as a weaker lead]
- *Slip:* s1 "Still nothing, the neutral's floating." Fix: "The hull is now joined to two different
  lines. Between L1 and L2 is the full line voltage and a low-impedance path, so a short-circuit
  current flows." (33 words)
- *Expected:* right first time.
  - *Claude (next):* "Exactly. L1, hull, L2: a short circuit, and something trips, maybe two
    things. Which is why that first fault can't be left."
- *Key line:* "A **second earth fault** on another line is a short circuit through the hull. Find the
  first one fast."

**Screen 5: Say it to someone.**
- SAY IT TO SOMEONE
- "A new AB on your watch has done some house wiring. He asks: 'Ashore, an earth fault trips the
  breaker. Why doesn't ours? Isn't that dangerous?' Answer him the way you'd say it on watch."
  (36 words)
- *Points (need 3):*
  - no way back to the generator, so no big current and no trip;
  - the ship keeps its supply through one fault;
  - an alarm or lamps show the fault;
  - a second fault on another line is a short circuit, so the first is found fast.
- *The AB's follow-up,* chosen by Claude from the pack's list to match what he left out. For example,
  if he skipped the second fault: "So if one's harmless, why does the chief go mad when an earth lamp
  dims?"
- *Then the mark:* points ticked in ink or ringed, one line on what he did well in his own words, and
  [A model answer]. The model answer (69 words): "On a ship the generator's star point isn't
  connected to the hull. So if a line touches a frame, there's no way for a big current to get back,
  and nothing trips. That's on purpose: the steering and pumps keep running. The lamps or the monitor
  tell us it's there. But if a second line goes to the hull too, that's a short circuit. So we find
  the first one quickly."
- His answer is saved as his explanation for the Book.

**Screen 6: Keep this.** (`summary`, drawn as today)
- *For:* knowing why a ship's main supply doesn't trip on an earth fault, and why that isn't the end of
  it.
- *Rule:* with a floating star point, the first earth fault has no way back to the generator. Little
  current flows, nothing trips, and an indicator shows it. A second fault on another line is a short
  circuit through the hull.
- *Traps:* "Nothing tripped" is not "nothing's wrong". Don't expect shore ADS behaviour at sea. A dark
  or dim earth lamp is a fault to find, not one to live with.
- *Where:* most ships' 440 V systems [AC: JEE129]. Practice varies by ship; your ship's drawings
  decide. High-voltage systems are often earthed through a resistor instead (lesson 2).
- *Then:* "4 puzzles go in the box for your next study day."

**Question bank for lesson 1** (becomes puzzles):
- A choice: on a 440 V insulated system with an earth fault on L3, what does L3's breaker do? It trips
  at once / it stays shut, with no way home for a big current / it trips after a delay.
- A choice: a second earth fault, on L1, joins the first. What is it now? Nothing new / a short circuit
  between lines through the hull / a second harmless fault.
- A typed answer: the openers of questions 2 and 3, as written cards (automatic).

**Words Dan reads if he knows it all:** about 160, across four questions and the teach-back. If he
needs every card: about 700, never more than 90 at once.

### 4.5 The same lesson, "Just read it"

`pack.mjs` compiles six pages for the existing read-through:

- four question pages, each with the picture (the live picture as a still at its key state), the
  question as its heading, the answer card and the key line;
- the teach-back page, with the AB's question and the model answer;
- Keep this.

Two of the answer cards, as they would read (each under 90 words):
- Question 2: "At sea the generator's star point usually connects to nothing. The frame is bonded to the hull,
  but the hull has no connection back to the generator. So when a line touches the frame, there's no
  loop for a big current to flow round. Only a tiny current leaks back through the cables' insulation
  and capacitance. The breaker sees normal load current and stays shut. The motor runs on." (66 words)
- Question 4: "A floating star point buys you one fault, not two. If L1 is already on the hull and L2 then
  touches it somewhere else, the hull joins L1 to L2. That's a short circuit between lines, through
  the ship's structure. A large current flows and protective devices open, maybe on both circuits. The
  continuity you were counting on is gone. That's why the first fault is hunted down quickly."
  (68 words)

### 4.6 Gates and cost

| Gate | What is done | Tokens (about) | Dan's part |
|---|---|---|---|
| 0. Taste test | Course brief, research for the whole course, lesson 1's pack, fact-check and rehearsal. Three rehearsed conversations shown to Dan as a screenshot on his phone: one where he knows it, one with a slip, one "just tell me". | 1.0M | Agree the brief and say whether that voice is one he'd learn from. If not, stop here: about 1.0M spent, and the research still serves a usual-style build. |
| 1. Lesson 1 live | App work (3.1) and lesson 1's picture, review, fix and assemble | 1.5M + 0.3M | Play lesson 1 on his phone, both ways if he likes. |
| 2. Lessons 2 to 4 | Packs, pictures, rehearsal, review, for three lessons | 1.6 to 2.0M | Play them over a week or two; the puzzles do the rest. |
| **Total** | | **about 4.4M (3.8 to 5.0M)** | |

For comparison, `inventory.md` puts this course at 3.4M for three lessons the usual way, or about
4.4M for four, plus 0.5 to 1.0M for any new style. So the pilot costs about what the usual way would.
The app work is paid once, and each later course costs about 0.6 to 0.75M a lesson all in. If later
courses come in near that, Transformers (4 lessons) would cost about 2.9M instead of 4.4M, and
Generators and the switchboard about 3.0M instead of 4.6M. Inspection and testing stays on hold.

### 4.7 How we judge whether the test worked

**What Dan says and does** (the real test):
- After lesson 1, we ask him two questions: "Did talking it through teach you more than the screens
  do?" and "Next lesson: this way, or the usual way?" **It worked if he picks this way** and says
  nothing like "makes no sense" or "too much text".
- He finishes lesson 1 by talking, rather than switching to reading within the first two questions.
- He comes back for lesson 2 within a week without being asked.
- He says something about the subject, not the app: a question about his ship, or "I didn't know
  that".

**What the app records** (in `ip.talk`; we read it from his progress doc):

| Measure | Healthy | A warning |
|---|---|---|
| Turns a question (median) | 1 to 2 | 3 every time: pitched too high, or the probes are poor |
| First answer credited in full | 30 to 70% of questions | above 90%: he knows it, so pitch higher; below 20%: too hard |
| Confident misses a lesson | at least 1 | 0 across lessons: we are teaching what he knows |
| "Just tell me" taps a lesson | 0 to 1 | 3 or more: the conversation is in his way |
| "I did say that" taps a lesson | 0 to 1 | 2 or more: the marking is mean; fix the prompt or the points |
| Minutes a lesson | 8 to 15 | over 20: typing is too heavy |
| Calls a lesson; fallbacks | 6 to 9; 0 to 1 | rate limits or time-outs: cost or latency problem |
| Guard trips (say replaced) | rare | frequent: the prompt needs tightening, which the rehearsal should have caught |

**Retention, about a week later.** Compare his first review of the talk openers (written cards marked
against the same points) with his first reviews of Design and verification's written cards, which his
progress already holds. Got-it on the first try, and the share of points made. One learner: a signal,
not proof.

**Cost.** Measured build tokens a lesson against the 1.0M baseline and this file's per-stage figures,
reported to Dan as CLAUDE.md asks. Success is 0.8M or less by lesson 3, with the app work reported
separately.

**Stop rule.** If after lesson 1 Dan says the screens teach him better, stop. The player stays in the
app for this one lesson. Its research and Keep this cards can feed a usual-style build of lessons 2 to
4. Nothing else in the app changes, because a talk lesson is only ever used by a talk course.

---

## 5. Risks and how to keep them small

| Risk | How it is kept small |
|---|---|
| **The tutor states something untrue** | One-card prompt, no tools. Corrections, hints and answers only from checked cards, chosen by id. A guard on numbers, narration and giving the answer away, falling back to pre-written text. Rehearsal at build time, including off-card and slip answers. Honest bylines. Off-card questions to Ask Claude. The pilot keeps Claude's lines in `ip.talk` so we can audit every word he saw. |
| **It marks an expert wrongly**, missing a point made in trade words or being stingy | The grade prompt's "accept equivalent" rules, which already work for written answers. Rehearsal answers written in shore and trade slang. "I did say that" credits at once and logs it. No score is ever shown, so a miss costs him nothing. |
| **Typing on a phone is a chore** | Openers ask for "a sentence or two". The keyboard's dictation button. "Just tell me". At most three turns a question. If minutes run high, the next lesson shortens its openers. |
| **Latency** (about 2 to 5 s a turn) | "Claude is reading…", as `K.written` shows today. A 20 s budget, then the checked card. Pre-written fallbacks appear at once. "Just tell me" makes no call. |
| **His weekly limit** (hit on 21 Oct) | About 25k tokens a sitting and never more than 14 calls a lesson. A rate limit turns the rest of the lesson into reading, with a calm line. In-app turns are tiny next to builds, and the build saving is far larger. |
| **It feels like an exam** | Tone rules from the grade prompt (warm, plain, specific praise, no exclamation marks). Credit comes first. No marks, streaks or "due". The ladder ends in the answer within three turns. Reading is always one tap away. |
| **The app work overruns** (estimates have run low) | Build only 3.1. No streaming, branching, voice or engine. Gate 0 is spent before any app code. Cap the app job like a build: if the player is not passing its e2e test after the planned work, stop and rethink rather than grind. |
| **Thin marine sources; no Navy material** | Research first, at Gate 0. Leads for lessons 1 to 3 are found (4.3). Nothing is ever said about Royal Navy practice. "Practice varies; your ship decides" is taught as such. Ask Dan for any Navy notes before research. Lesson 4 has a fallback shape (4.3). |
| **The rehearsal model is not the app's model** | Rehearse with the model the app's default tier runs, where known. The structured output and guard limit what any model can do wrong. Re-run the rehearsals as regression evals when the app's model changes. |
| **A talk course feels samey across lessons** | Openers vary in kind (what happens, why, walk me through, which, contested). The teach-back listener changes (an AB, the chief, the EOOW). One live picture where it teaches. |
| **The read-through is thinner than a steps lesson's** | Each page carries the picture, the question and an answer card, which is what Dan asked for on 20 Oct: "visuals and text", plainly written. Lesson 1 reads in about four minutes. |
| **Scope creep into a general chat app** | The tutor is bound to the card. Ask Claude stays the one open chat. A talk lesson is a format chosen in the brief, course by course, not a replacement for steps lessons. |

---

## 6. Questions for Dan before Gate 0

1. Is "Earth faults at sea" a course you'd want next? Or would you rather test this style on
   Fault-finding or Transformers?
2. Do you hold any Navy notes on ships' electrical systems: insulated neutrals, earth lamps, insulation
   monitors, finding earths? Even a page would let the course say what your ships do.
3. Would you answer by typing, or by your keyboard's microphone? That decides how long the questions
   can be.
4. Is it all right for the app to keep the tutor's lines from your lesson 1 sittings, so we can check
   every word it said to you?
