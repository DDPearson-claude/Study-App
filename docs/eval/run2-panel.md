# Eval run 2: lesson-quality panel

Three judges (a master teacher, a subject expert and a learner advocate) scored each of the eight run-2 lessons 1-5. Workflow lesson-quality-panel; the raw judgements are in run2-panel.json.

## Scores (averages of 24 judgements)

| Part | Score |
| --- | --- |
| overall | 3.13 |
| predict | 2.96 |
| interactive | 3 |
| explain | 3.54 |
| sayItBack | 3.79 |
| checks | 3.17 |
| accuracy | 3.63 |

Per lesson (overall): anc/i1 3.33, anc/i4 3.33, vaccines/i1 3, vaccines/i3 3, rainbows/i1 3.33, rainbows/i4 3.67, bronze/i1 3, bronze/i4 2.33.

## Summary

I synthesised 24 judgements of 8 lessons into the changes below and edited no files. Every lesson scored 3 overall except bronze/i4 (2.33). The weakest parts across all lessons were predict (2.96), interactive (3.00) and checks (3.17). Two parts did better: say-it-back (3.79) and explain (3.54).

Seven causes are shared across most lessons:
1. **The predict answers itself.** This happened in 6 of 8 lessons. Dan sees the idea's title and one-line summary just above the question. The calibration answers and the 'Watch for…' lede (the line above the interactive, built by friendlyBrief) also give it away. The prompt says only 'ask something different', with no rule against stating the mechanism or against straw-man options.
2. **The checks test recall.** This happened in all 8 lessons. The validator forces a target check even when Dan can solve it by dragging until the readout matches.
3. **The interactives show only the effect.** This happened in 7 of 8 lessons. Some are a picker or slideshow, and the cause is never drawn. The only mechanism exemplar, compound-growth.html, is really a quantity page.
4. **Absolute claims are false.** This happened in all 8 lessons. Lessons say 'only', 'never', 'every' or 'just one' when the claim fails at other settings, in everyday life or after a later idea. Review cards then repeat them without the ignores panel.
5. **The explanation skips the causal step.** This happened in 7 of 8 lessons. In vaccines/i3 it gives a reason that is equally true of the first meeting.
6. **Research is too thin for the lesson.** This happened in 7 of 8 lessons. It drops causes and qualifiers and misreads date ranges. lessonResearch passes a lesson only its own notes, the notes of ideas it builds on, and topic notes. So dated facts filed under later ideas never reach the lessons that need them (Egypt c.1177 BC; the headphone small-cavity point).
7. **Labels are hard to read on a phone.** This happened in all 8 lessons. SVG text is about 9.5 px, labels run together, text sits over lines, and an unknown colour role only warns.

Already fixed since the runs (f1add32, 44fc305), and not re-proposed:
- the amber-line colour alias
- the overlap check for touching labels
- default SVG text fill in dark mode
- canvas axis titles shrinking to fit
- K.sound.hold
- K.anim button:false
- the lesson-prompt formula limit for NEW learners

The build-prompt half of that formula limit is still open.

Files the changes touch:
- /home/user/Study-App/app/src/js/30-prompts.js
- /home/user/Study-App/app/src/js/33-interactive.js
- /home/user/Study-App/app/kit/KIT.md
- /home/user/Study-App/app/kit/kit.js
- /home/user/Study-App/app/kit/examples/
- /home/user/Study-App/app/src/js/50-lesson.js
- /home/user/Study-App/app/src/js/41-cards.js
- /home/user/Study-App/tools/eval/render.mjs

Relaxing the required target check also needs an update to docs/ARCHITECTURE.md section 5, which is the contract between modules.

## Ranked changes

### 1. [high] app/src/js/30-prompts.js writeLesson: calibration block (line 397), predict q (line 417), contested predict (line 419), options (line 420), BEFORE YOU REPLY (line 490)

**Why.** Predict is the lowest-scoring part (2.96). It scored 2.33-2.67 in 6 of 8 lessons, and teachers gave it 2.5. In each of those lessons the answer was on screen or already known before Dan committed: the title and oneLine sat above the question, the calibration had just taught it, the lede spelled it out, or the question stated the mechanism. The two rainbows lessons asked about a boundary case or a turning point and scored 4.3-4.7, which shows the target to aim for.

**Change.** PREDICT: stop it being answered before Dan guesses, and aim it at the surprise in the brief's one thing.
(a) Line 397. Current: 'QUESTIONS DAN ANSWERED WHEN HE STARTED THIS TOPIC (ask something different in your predict and checks)', followed by each c.q only. New: 'QUESTIONS DAN ANSWERED WHEN HE STARTED THIS TOPIC. He has seen each right answer and its why, so treat them as known and build on them. Never write a predict or check they already answer (a new case with the same answer is the same question), and never reuse their scenario or wording. If one probes the heart of this idea, test that misconception from a new angle on the interactive.' Print each line as '- <q> Answer: <options[answer]>. <why>'.
(b) After line 417 ('...so the opening screen must not already show the answer.') add: 'He also reads this idea\'s title ("' + idea.title + '") and its one-line summary just above your question, so they must not answer it either. Ask about the brief\'s one thing at the point where intuition fails: how much, how soon, which way, an in-between setting, a changed condition, or the case where nothing happens. Set up the situation without stating the rule or the mechanism. Test: if someone who has read only the title and the question could rule out every wrong option by logic, ask about a different case. Do not ask something most adults already get right.'
(c) Line 420. Current: '- options: 2-4 short choices (at most 12 words each); one is the common intuition, especially where it is wrong. Leave options out only when a free guess works better.' New: '- options: 2-4 short choices (at most 12 words each) that state outcomes only, in the same terms and about the same length. The right one never carries its reason or repeats the rule. One is the common intuition, especially where it is wrong. Every option is something a thoughtful adult might pick: no straw men ("all in the same year", "longer, because the defenders are worn out"). Two options are fine. Leave options out only when a free guess works better.'
(d) Line 419. Current begins: 'For a contested idea, ask instead which view he finds more convincing, or what evidence would settle it.' New: 'When the idea itself is the debate, ask instead which view he finds more convincing, or what evidence would settle it. When only a detail is debated (how long, how many), predict the part the evidence settles and leave the debate to the reveal. No option may be right under one view and wrong under another unless the reveal says so.' Keep the rest.
(e) Line 490. Current: '- explain.text is at most 170 words, and the interactive\'s opening state does not already answer the predict.' New: '- explain.text is at most 170 words. Neither the interactive\'s opening state, the idea\'s title and one line, nor the calibration answers already answer the predict.'
(f) App changes:
- In fillHead, keep the oneLine element (`one`) hidden until the predict is answered or skipped.
- friendlyBrief currently turns the brief into 'Watch for <answer> when you <action>', and renderPlay shows it before play. Before play, match /^the one thing (?:you should|to) see is\s+(.+?)\s+(?:when|as|if|while|once) you\s+(.+)$/i and show 'Try this: ' + m[2]. Show the 'Watch for…' sentence only after the reveal.
Examples:
- anc/i4: 'Delay the second hum by a quarter of a wave. Together, are they bigger or smaller than one hum alone?' The answer is 1.41x.
- vaccines/i3: 'How high will the second rise go compared with the first?'
- bronze/i1: 'Half the tin never reaches the smith. How much bronze can he make now?'
- vaccines/i1: 'A germ with hexagons arrives. How many defenders grab it?'

**Evidence.** anc/i1 teacher (major) and learner: the predict asks what the eardrum does, not the air staying put; the model avoided the heart of the idea because the calibration said 'ask something different' | anc/i4 teacher (major) and learner (major): the title 'Opposite sounds add up to quiet' sits above the question, and the question states the mechanism; the teacher also found friendlyBrief's lede 'Watch for the combined wave shrinking to a flat line...' shown before play | vaccines/i1 teacher (major) and learner (major): the stem states the rule ('each with a different-shaped detector'), and the right option carries its own reason | vaccines/i3 teacher (major), learner (major) and expert: the title 'Memory makes the second time faster' plus calibration c2 answered it; 'worn out' is a straw man | bronze/i1 teacher (major) and learner (major): the zero-tin case follows from the calibration answer 'tin' | bronze/i4 teacher (major) and learner: 'all on the same year' is a straw man, and the right answer depends on which side of the contested duration you take

### 2. [high] app/src/js/30-prompts.js writeLesson checks section (lines 460-465) and validator vLesson (line 917)

**Why.** Every lesson's checks were criticised. Checks averaged 3.17, and teachers gave them 2.5. These cards become Dan's spaced-review deck, so recall-only cards waste months of review. The validator currently forces a target check even when it can only be solved by dragging until the readout matches.

**Change.** CHECKS: make each one test reasoning, not recall or readout-scrubbing.
(a) Line 460. Current: '- Test understanding, not recall of your wording. At least one applies the idea to a new case he has not seen in this lesson. Each must make sense alone weeks later: no "as you saw above".' New: '- Test understanding, not recall: not of your wording, a source\'s phrase, or a number the lesson or a readout stated.
- Each check tests a different side of the idea from the predict, the say-it-back and the other checks: the why; its limit (where it stops applying, e.g. memory of measles does nothing against chickenpox); a new case.
- At least two apply the idea to a case the interactive did not show; a case it already showed does not count. At least one asks him to compare or reason about amounts, not only the all-or-nothing case.
- None restates the predict, a calibration question or the say-it-back.
- A check draws only on this idea and the ideas it builds on, never a later idea in THE COURSE. Every step its right answer needs is in your explanation or visible on the interactive.
- Each must make sense alone weeks later: no "as you saw above".'
(b) Line 462. Current sentence: 'Wrong options are real misconceptions or near-miss related examples.' New: 'Wrong options are misconceptions real people hold, or near-miss related examples, in the same terms as the right one. If you cannot say who believes an option, replace it. The right option never reuses the takeaway, four or more words in a row of your explanation, or the question\'s own words. The question never states a fact that rules out an option.'
(c) Line 463. Current: '- order: 3-6 items (at most 10 words each) in the CORRECT order; the app shuffles them. For sequences, processes and chronology.' New: '...For sequences, processes and chronology where the order is something he could get wrong (a hidden cause before a visible effect, a step people misplace). Each item stands alone: no "it", "that" or "then" pointing at another item, and never the interactive\'s own step names. If the wording, or left-to-right on the picture, gives the order away, write a choice check instead.'
(d) Line 464, estimate: add 'a number he can reason his way to from the idea, which the lesson has not already stated'.
(e) Line 465. Current ending: 'Every other control stays at its opening value: do the arithmetic, so the target is reachable within that control\'s range and steps. Include one whenever the interactive has outputs and such a control.' New: '...do the arithmetic. If the output shows decimals, some step of the control must display the target exactly at those decimals; otherwise write "about Z". Name every setting that works in why. Include a target check only when reaching it needs the idea: a value the lesson has not paired with its setting, ideally one past a turning point or one that two settings give, so the naive direction fails. Never use a number from predict.reveal, explain or the rubric. While Dan answers, the app hides that readout and the .say line, so he steers by the picture and the rule. Choose a target and tolerance he can hit that way ("Tilt the torch until the beam turns by about 20°, give or take 3°").'
(f) Validator changes:
- Line 917: make the required-target rule advice, not a failure, and update ARCHITECTURE section 5 to match.
- Add a problem when a target check's target, rounded to the output's decimals, or an estimate check's answer appears in predict.reveal or explain.text.
- Add a problem when a choice check's right option shares 4 or more consecutive words with explain.text, predict.reveal or say.model.
- Add a problem when the right option is more than 1.5x the average length of the others.
(g) App and kit: mount target checks, both in the lesson and as review cards in 41-cards.js, with {quiz: {hide: output}}. The kit shows that readout as '?' (reusing the afterMove mechanism) and hides .say until 'Check my setting'. U.sandbox.reach should also report whether any step displays the target exactly.

**Evidence.** anc/i1 teacher and learner: order check c2 runs left to right and each item leads into the next | anc/i4 teacher: the target check is slider-hunting; anc/i4 expert: no setting shows '1.00' (33% gives 1.02, 34% gives 0.96) | vaccines/i1 teacher (major) and learner: every right answer is the 'fits one shape' slogan, and c3's wrong options are beliefs nobody holds | vaccines/i3 teacher (major) and learner (major): c1 replays the stage names, c2 repeats the predict and calibration c2, c3 tests i2's idea | rainbows/i1 teacher (major): the 19° target is solved by scrubbing with the readout visible | rainbows/i4 teacher (major), expert and learner: c1's 42.5° is stated three times, c3's 15° is recall, and c2 needs i5 | bronze/i1 teacher (major) and learner: c2 is solved by sliding until the readout shows 5.0, and c3's stem rules out its own wrong options | bronze/i4 teacher, expert and learner: c3's right answer copies 'last significant New Kingdom ruler'

### 3. [high] app/src/js/30-prompts.js KIND_PLAY (lines 255-259), controls rule (line 430), ranges (line 434), brief (lines 427-428), BEFORE YOU REPLY

**Why.** Interactive averaged 3.0 and had majors in 7 of 8 lessons. Each was a switch-and-watch, a picker, a slideshow, or a picture of the result with the cause the explanation teaches never drawn. Dan was then graded on a mechanism he never saw. The builder's only 'mechanism' exemplar is a quantity page, so it has no model of a hands-on mechanism.

**Change.** INTERACTIVE: draw the cause, let Dan cause it, and show both sides of the rule.
(a) KIND_PLAY.mechanism. Current: 'a moving diagram of the cause and effect: his control is the cause, and he watches the effect happen (arrows growing, parts turning, particles speeding up).' New: 'a moving diagram he drives with his own hand, in which the cause itself is drawn. Whatever your explanation\'s "because" says happens on the picture (one edge of a wide beam slowing first, squashed air pushing back, a shape slotting into a notch), and his control makes it happen (a "Give one push" or "Send it in" button, a drag, a switch). Prefer an action he performs over a switch he flips and then watches. Include the setting where the cause does not produce the effect (nothing fits, nothing flows), so he sees both sides of the rule.'
(b) KIND_PLAY.quantity: append ' When the idea is that things crowd, pile up or spread out (brightness, density, a distribution), also show the pile itself: send many evenly spaced cases (50 or more) through the rule and show how many land in each band (bars, or a strip that darkens).'
(c) KIND_PLAY.process: append ' Draw the thing that carries the change (the cells left behind, the stock built up), not only its effect. If the point is that an earlier stage changes a later one, add a switch for that cause beside the stepper, as the bill example does. A stepper alone is a slideshow.' Line 430: after 'one. Add a second only if the idea cannot be seen without it' add ', or, for a process whose point is what one stage does to a later one, a switch for that cause'.
(d) KIND_PLAY.history. Current: 'a timeline he steps through (documented dates and events only), or a named choice between causes or views that shows what each one explains.' New: 'a timeline he acts on, not a slideshow: he drags through the years and dated events appear, or he picks a cause or view by name and the timeline shows, as a labelled sketch, the pattern that view expects beside the documented dates (documented dates and events only). Use a stepper only when every step changes the drawing.'
(e) Brief, after the Bad/Good line (428), add: '  For a mechanism, the brief names the cause as well as the effect, and the heart of the idea rather than a step towards it. Bad: "the beam\'s kink growing when you tilt the torch". Good: "the near edge of the beam slowing first and the beam swinging round when you tilt the torch". If the idea is that light piles up at one angle, the thing to see is the pile, not the curve that causes it.'
(f) Line 434, after 'Numeric ranges are wide enough that the effect is unmistakable.' add: ' They stay on the side of the effect the idea is about; run past a turning point only when the turning point is the lesson. When the idea reads "X, so Y", the picture links both halves. When it turns on where things are, use a sketch map with places in their true relative positions, labelled "sketch map", with no invented distances.'
(g) BEFORE YOU REPLY: add '- Every consequence your explanation states, and the cause its why names, can be seen on some setting of the interactive.'
(h) KIT.md, after line 147, add: '- If the explanation gives a reason (X because Y), draw Y so Dan can watch it. Draw the mechanism as it physically works: parts that fit are drawn fitting (a bump slotting into a matching notch), never two identical icons joined by a line. Whatever the rule text says happens (drifts, grabs, multiplies) happens on screen.' Line 164: replace 'use `K.stepper`, `K.choice`, a timeline slider or a sorter' with 'prefer a timeline slider, a named choice, a sorter or a drag; use `K.stepper` only when every step changes the drawing'.
(i) Kit:
- Add a true mechanism exemplar: a pushable or draggable source with K.anim({button: false}) and K.reveal() on drag.
- Re-tag compound-growth.html as `kind: quantity`. It is three sliders, four readouts and a plot, and its caption repeats a power formula and the ignores text.
- Add K.drag(el, {control, toValue(x, y)}): touch-action none, pointer capture, a 44 px target, keeps the slider in step, calls K.reveal().

**Evidence.** anc/i1 learner (major): a toy he switches on and watches; he can never make one squeeze himself; the only mechanism exemplar is compound-growth.html | vaccines/i1 teacher (major) and learner (major): a picker in which every germ gets caught, so 'no single defender can catch everything' is never shown; teacher, expert and learner all flag matching by identical icons rather than fit | vaccines/i3 teacher (major), expert and learner (major x2): memory cells are never drawn ('a few memory cells on watch' floats over empty space); a five-click slideshow | rainbows/i1 teacher (major), expert and learner (major): the beam is a zero-width line, and the edge-first slowing is never drawn | rainbows/i4 teacher (major) and learner (major): the curve is shown but not the pile-up of light | bronze/i1 teacher (major): 'found far apart' is two text labels; learner (major): a thin min() bar chart | bronze/i4 learner (major): press Next five times; the Egypt step changes nothing

### 4. [high] app/src/js/30-prompts.js writeLesson: reveal (line 421), ignores (line 437), explain takeaway (line 444), checks (line 460), BEFORE YOU REPLY (lines 489-495)

**Why.** This was the main source of factual errors. All 8 lessons contained an absolute or general claim that their own interactive, everyday experience or a later lesson contradicts. These claims become review cards Dan sees for months, with the caveat left behind in an ignores panel the cards never show. Experts gave accuracy 3.25.

**Change.** CLAIMS: make every claim true across the whole range, in everyday life, after later ideas, and on a review card read without the ignores panel.
(a) Line 421, append to the reveal: ' If the tempting answer is true in other cases (other settings of the interactive, or everyday life), say when it holds ("usually true, but not when ..."). Never call an intuition wrong in general because it fails in this one case. Words about timing ("in step", "at once", "instantly") must be literally true: anything passed along arrives later, with the same rhythm.'
(b) Line 437. Current: '- ignores (at most 50 words): what this model deliberately leaves out, honestly. Shown to Dan as "What this model ignores".' New: '- ignores (at most 50 words): what this model deliberately leaves out, honestly. Start with anything a newcomer would wrongly conclude from the picture: a stage drawn empty that is not, a quantity drawn reaching zero that does not, a time scale shortened or slowed (say by roughly how much). Include anything a curious adult may already know that the picture seems to contradict, and any real-world way round the effect (a substitute, recycling). It carries no footnotes, so every claim in it is textbook-certain. A condition the main result depends on (only at one spot, only for equal strengths, only once-reflected light) is not an omission: state it wherever the result is stated. Shown to Dan as "What this model ignores".'
(c) Checks: add '- Checks, the say rubric and the model answer come back as review cards for months without your ignores panel. Each must be true alone, of the real world as well as your model, and stay true after Dan has learned every later idea in THE COURSE. Keep a research note\'s qualifiers ("after one reflection", "B cells", "in this model") in the option itself. If a lesson word covers only part of something ("defenders" meaning the shape-matching kind), use the narrower name. Never mark as wrong a belief that is true of what the model leaves out. When later ideas reuse this one in a new setting, one check applies it there.'
(d) Line 444. Current: 'Close with the one-sentence takeaway.' New: 'Close with the one-sentence takeaway, footnoted when a source supports it and limited to the places and period the sources describe. If none supports it, word it as what follows from the steps above, and no stronger.'
(e) BEFORE YOU REPLY, add:
'- Every general claim in reveal, explain, rubric, misconception lines and whys ("only when", "always", "never", "must", "every", "just one") holds across the interactive\'s whole range (test it with your rule at both ends and the middle), in the everyday case, and against every later idea\'s oneLine.'
'- Every sentence about what the picture does (direction, timing, size) is true of a faithful model at every moment.'
'- Each rule is stated in the general form later ideas will need ("the line square to the surface where the light crosses", not "straight down").'
(f) Plan line 108. Current: '- oneLine: one sentence (at most 25 words) saying what he will understand, in plain words.' New: '... in plain words, true as stated and as a textbook would put it: hedged where reality is graded ("fits one shape, or ones very like it"), naming the narrower kind when it covers only one kind. Later lessons treat it as the learning goal.'

**Evidence.** anc/i1 expert (major): the reveal says the eardrum moves 'in step with the speaker cone'; it lags, about 160° out of phase | anc/i4 teacher, expert and learner (all major): the reveal says two sounds are louder 'only' when in step, while its own readout says 1.41x at 75%; expert (major): cancelling taught as 'the sound goes quiet', which is true only at one spot | vaccines/i1 teacher (major), expert (major x2) and learner (major): 'defenders' overgeneralised, absolute one-shape specificity, 'a single detector' | vaccines/i3 expert (major): 'no wait at all', and antibody drawn falling to zero | rainbows/i1 expert (major): 'swings towards straight down' is false for a curved drop; c1 ignores the critical angle | rainbows/i4 expert (major): c2's 'never wider than 42°' is false once i7 teaches the second bow | bronze/i1 expert: the takeaway says 'every bronze-making kingdom'; c1 says bronze-making 'stops' | bronze/i4 expert (major): overlapping date ranges presented as evidence of spread

### 5. [high] app/src/js/30-prompts.js writeLesson explain section (lines 442 and 444)

**Why.** 7 of 8 lessons skipped the step that makes the mechanism make sense. In vaccines/i3 the explanation gave a reason that is equally true of the first meeting, and the rubric rewards it. In bronze/i4 half the idea (timing as a clue to causes) was never taught, yet a check tested it.

**Change.** EXPLAIN: build the real why from first principles.
(a) Line 442. Current: '- Start from what playing shows, written as something he can do or check, never as something he did:' Append ' Use one or two sentences; do not retell every setting.' at the end of that bullet.
(b) Line 444. Current opening: '- Then the why, from first principles, one step per sentence.' New: '- Then the why, from first principles, one step per sentence.
- The first step is something he already knows or has felt (squash the air in a bike pump and it pushes back; a cell has no eyes, so it notices only what touches it). Name what makes each step happen, including the step that links his control to the effect (why this setting produces it), and cover every part the picture shows.
- When the idea says a later case differs from an earlier one, name what is physically different, and check that your reason does not equally describe the earlier case. A sharp friend would ask: "but weren\'t those cells there the first time too?"
- When the payoff is read off a curve (a flat top, a turn), give that reading its own everyday sentence ("each slice of the drop catches the same sunlight; squeeze a slice\'s light into fewer degrees and each degree gets more").
- For a history idea, the why is how we know (what the evidence is and how it is dated, so why a date is a window) and what the pattern rules in or out.
- If your analogy\'s breaks names part of the mechanism, the explanation explains that part.
- Teach every part of "What Dan should come away understanding".
- For a new learner, use at most two numbers, the ones the picture shows; a spread between sources goes in ignores.
- Give the version of the why a specialist accepts as true at this level. If you use a teaching model (a rigid beam, a ball), say so in one clause and set confidence to "simplified". If RESEARCH does not support the why, offer it as "One way to picture it: ...".'
Keep the rest of the bullet; Change 8 rewrites its terms sentence.

**Evidence.** anc/i1 teacher (major): never says why air comes back (it is springy) or how a stretch is passed on | anc/i4 teacher (major): never says why a half-wave delay lines a squeeze up with a stretch | vaccines/i1 teacher (major): asserts recognition by shape without the reason (no eyes; molecules notice by fitting) | vaccines/i3 teacher (major) and expert (major): 'already waiting' was equally true the first time; the real reasons (more cells, quicker switch-on, stronger antibody) were in the tool returns | rainbows/i1 learner (major) and expert: the edge-first why is unsourced and presented as settled, though it is a teaching model | rainbows/i4 teacher: skips the step from crowded rays to bright | bronze/i4 teacher (major): lists six date ranges, never says how dates are known, and never links timing to cause, yet c2 tests that link

### 6. [high] app/src/js/30-prompts.js research(): steps 1, 3 and 5 (lines 171-176), SOURCES (line 181), claim line (line 202)

**Why.** Several of the experts' accuracy errors begin in research.json. A cause found by the tools never reached the notes. A figure description ('no lag time') was picked over the page's own summary. A qualifier was dropped (B to all lymphocytes). A pottery-phase date was read as a span of destructions. Facts filed under a later idea never reached the earlier lesson, because lessonResearch passes only the idea's own notes, the notes of ideas it builds on, and topic notes.

**Change.** RESEARCH: gather causes and qualifiers, read dates correctly, and get each fact to every lesson that needs it.
(a) Step 1, line 171. After '...then for the ideas whose facts, mechanisms or numbers a lesson will lean on (typical values, constants, dates, who did what).' add: ' Include the basic principle each idea\'s interactive will compute ("the pressures of two sounds add at each moment"), from a textbook page wherever one exists. Search for every claim in each idea\'s oneLine. If one finds no source, add a note saying so, so the lesson can drop it.'
(b) Step 3, line 173. Current: '3. For each idea, write 1-4 claim notes: the facts, mechanisms and numbers a lesson on that idea will need, each backed by at least one source.' New: '3. For each idea, write 1-6 claim notes (up to 8 for a history idea a timeline will show), each backed by at least one source, in this order:
- what causes the idea\'s headline: what is physically different, step by step, from a page that explains it, not one that only says it happens (for "the second time is faster": what is different about the cells the second time);
- the conclusion in the oneLine\'s "so ...";
- why it mattered to people then, when a source says so;
- the facts and numbers.
For every constant an interactive computes with, quote one sentence that defines it (n = speed in vacuum ÷ speed in the material) as well as one that gives its value. For a history idea about timing or order, give dated events across the whole period, earliest to latest, from at least five places.' Extend the next sentence: 'Put facts shared by several ideas in topic.notes, with every constant, named case (a ship, a site) and dated event more than one idea uses. File each claim under the idea that teaches it. List a fact under every idea whose main claim it limits (the small cavity under headphones limits "two sounds cancel").'
(c) SOURCES, line 181. After 'Pick a quote that supports the claim citing it on its own, read cold by someone who has not seen the page.' add: ' Keep in the quote any date, place or qualifier that limits the claim; never cut a sentence so it reads wider than it was. Prefer a page\'s general statement to its description of one figure. A date range in brackets after a name (a period, a pottery phase, a reign) dates that name, not the event in the sentence; if it is not clear which, do not use the number. If a quote\'s numbers and words disagree (125 years called "two centuries"), leave it out. Avoid quotes that state a known misconception as fact ("denser" for refraction); if none better exists, word the claim correctly and add "(source\'s wording is loose: ...)". When a quote describes a case without naming it ("the cargo"), add a quote that names and dates it. For a site or event, prefer the excavators\' or a specialist\'s account over an encyclopedia summary.'
(d) Line 202. Current: 'claim: one plain sentence (at most 40 words) that the cited quotes actually support. Use only the idea ids listed above.' New: 'claim: one plain sentence (at most 40 words) that the cited quotes actually support, and no more strongly. Name exactly what the quote names (B cells, not "lymphocytes"). Never add "only", "always", "all", "never", "no", or a stronger verb ("is switched on" for "can react"), beyond what the quote uses. Quote an absolute ("no lag") only when no page you were shown says something weaker ("a shorter lag"); otherwise give the spread. Use only the idea ids listed above.'
(e) Code, lessonResearch: also pass, after the idea's own notes, every note from any other idea whose claim holds a date (always for kind 'history'), and every note that names this idea's id or limits its main claim. Mark them '(from another idea in this course)'.

**Evidence.** vaccines/i3 teacher (major) and expert (major x2): the cause of the faster response was in tools/03 and 06 but not in the notes; 'no lag' came from one figure description while the same page says 'shorter' | vaccines/i1 expert (major): a note merges 'B and T lymphocytes' with a B-only quote; 'switched on only when' is stronger than the quote's 'can react' | rainbows/i1 learner (major) and teacher: the mechanism is unsourced; expert: n defined vaguely, and the quotes teach 'denser' | anc/i4 expert: superposition is unsourced; n18 (small cavity) was filed under i6, so i4 never saw it | rainbows/i4 expert: 'sky brighter inside the bow' was filed under i4 but belongs to i5 | bronze/i1 teacher, expert and learner: the takeaway is unsourced although n10 and n13 existed; Uluburun was filed under i2; the Central Asia quote was cut from a dated sentence | bronze/i4 teacher (major), expert (major x2) and learner (major): only three city dates; Drake's 1315-1190 BCE misread; Egypt c.1177 BC filed under i6 and never reached i4

### 7. [high] app/kit/KIT.md Drawings (lines 118-121) and Colour

**Why.** All 8 lessons had labels that were too small, ran together, sat on lines or arrows, or never drew at all. Their self-tests passed every one. Text at about 9.5 px beside 17 px body text breaks 'phone first'.

**Change.** LEGIBILITY: make SVG text readable on a phone, and let the self-test fail what Dan can't read.
(a) KIT.md line 118. Current: 'Give an `<svg>` a viewBox about 340 wide, `width="100%"`, text 11-14 units,' New: '... text 13-16 units, never under 12 (a 340-unit drawing shows at about 0.85x on a phone, so 13 units is about 11 px). A row of N labels gets about 300/N units each; label only what differs ("grabs it" under the lit ones, not "ignores it" five times).'
(b) KIT.md lines 120-121. Current: 'nudging each off other text and inside the drawing: use it for labels that move.' New: '... use it for labels that move or appear at a later step or setting, and pass the lines a label must stay off as `avoid`. Hand-placed text is for fixed axis titles only. Put an angle\'s label inside its wedge, beyond the arc, centred, and hide it while the wedge is too narrow.' Document `size?` on line 113.
(c) kit.js changes:
- K.labels defaults 'font-size' to it.size || 13 and gains `avoid: [elements]`.
- The self-test fails, as clip-style errors, on SVG text rendered under 11 CSS px in the 340 px frame, and on text boxes crossing stroked lines, paths or arrowheads (marker-end).
- It warns when same-row labels are less than about 4 px apart; the current test needs ix > 2.
- An unknown K.color role, or any invalid stroke or fill, becomes an error instead of a warning, so the repair round fixes it.
- Check SVG text contrast of at least 3:1 against --k-bg and --k-panel in both themes.
Already done and kept: the dark-mode default fill via kit.css `:where(svg:not([fill]))`, the touching-label overlap check, the amber-line alias and text halos.

**Evidence.** anc/i1 learner and anc/i4 learner: labels at 9.5-10.5 CSS px | vaccines/i1 learner (major): 'ignores it ignores it ignores it' runs together at 360 px with clipped: [] | vaccines/i3 teacher, expert and learner (major): 'germ arrivesame germ returns' overlap (since fixed in kit) | rainbows/i1 expert and learner (major): beams strike through '40°', '29°', '41°' and '48°' at every width | rainbows/i4 teacher, expert and learner (major): amber arc invisible because 'amber-line' was unknown; '17.2°' sits on the drop's outline | bronze/i1 teacher (major), expert and learner: labels near-black in dark mode (since fixed); 'runs out first' sits on the arrow tip | bronze/i4 learner (major): timeline labels at about 9.5 px

### 8. [medium] app/src/js/30-prompts.js writeLesson explain (line 444, term sentence), priorBlock (line 309), analogy (line 451), DAN jargon line (line 49), BEFORE YOU REPLY

**Why.** 7 of 8 lessons had naming problems. Some used several names for one thing (six names in one anc/i4 sentence), some brought in source vocabulary unearned, some used compound terms before their parts were explained, and one swapped the lock-and-key roles between sections. A NEW learner ends up carrying two vocabularies.

**Change.** NAMES: one name per thing; earned terms only; consistent analogies.
(a) Line 444. Current: 'Name a key term only after the reader understands the thing: mark it [[like this]] the first time (at most 3 new terms). A term the picture needs may appear on it before this; mark it here where you explain it. Call each thing by the name the course plan and earlier lessons use.' New: 'Name a key term only after the reader understands the thing: mark it [[like this]] the first time (at most 3 new terms, at most 2 at level NEW, and only a term a later part of this lesson or a later idea uses).
- A term of two or more words ("pressure wave") comes only once each of its words is explained.
- Define a term as the research notes define it, whole-topic notes included, never narrowed to fit this picture.
- Give each thing one name in this lesson (the plain word the picture and readouts use) and one verb for one event. An earlier lesson\'s term may appear once, as a reminder ("a squeeze, the compression you met before").
- Say a source\'s point in your own words; do not borrow its vocabulary (peak, trough).
- When a name is a modern label rather than the period\'s own word (Sea Peoples), say so. A period, dynasty or title (New Kingdom) gets a few plain words or stays out; [[ ]] is for ideas, not proper names.
- A term the picture needs may appear on it before this; mark it here where you explain it.'
(b) Line 309. Current: 'Use these terms exactly as they were introduced, without defining them again,' New: 'Use these terms exactly as they were introduced, without defining them again; pick one name for each new thing in this lesson and use only that name in every part,'
(c) Line 451. Current: '- text (at most 45 words): a comparison to everyday life or to the ideas Dan already knows that genuinely matches the mechanism.' New: '... that matches how it works, not only the outcome it produces (a firm keeping a trained team on standby, not a person getting practised). Prefer the comparison textbooks use when one fits. If the explanation or plan already uses an image, map it identically (say which part is the key and which the lock), or choose a new comparison that adds something; otherwise use null. "breaks" must itself be correct science.'
(d) BEFORE YOU REPLY: add '- Any comparison maps the same parts to the same things everywhere in the lesson, and no word carries two meanings ("scarce" for short in the recipe and rare in the ground).'

**Evidence.** anc/i1 teacher and expert: 'pressure wave' is defined without pressure; three terms arrive in two sentences | anc/i4 teacher (major) and learner: compression, rarefaction, squeeze, stretch, peak and trough all appear in one sentence | vaccines/i1 teacher and learner: lock and key flip between explain and analogy; 'lymphocytes' is never used again; five verbs for one event; expert: 'antigens' defined as the epitope | vaccines/i3 teacher: memory cells get four names; the wardrobe analogy explains speed by practice | anc/i1 expert: the analogy's breaks says air 'pulls' | bronze/i1 teacher: 'scarce' carries two meanings | bronze/i4 teacher, expert and learner: 'Sea Peoples' presented as Egypt's own term; 'New Kingdom' unexplained

### 9. [medium] app/src/js/30-prompts.js writeLesson say section (lines 455-456)

**Why.** 6 of 8 lessons had rubric problems: points that overlapped, that bundled two claims, that the question gave away, that required something not asked, or that rewarded a non-reason. Grading is got-it only when every point is met, so an unfair rubric marks a good answer 'partly' and schedules the card as Hard.

**Change.** SAY-IT-BACK: make the rubric fair and diagnostic.
(a) Line 455. Current: '- prompt (at most 30 words): an open "why" or "how" question in plain words: "In your own words: why …?" It asks for the heart of the idea, not a definition.' Append: ' Prefer a why that makes him use the rule on a consequence over a how he can copy from the takeaway. The prompt sets out the situation and never states a rubric point ("...if the air itself doesn\'t travel?" gives one away).'
(b) Line 456. Current: '- rubric: 2-3 points his answer should contain, each a single idea in plain words (at most 15 words). Never require jargon: "squash" meets "compress".' New: '- rubric: 2-3 points his answer should contain.
- Each is a different step of the idea\'s chain, so no sentence of the takeaway meets two of them. Each is a single idea in plain words (at most 15 words; no ";" or "and" joining two claims), and the last is the conclusion the prompt asks for.
- Each point is part of the heart of the idea, never a detail of method, a number or a name. It is true of this idea and not equally of the earlier idea it builds on.
- A full, correct answer to the prompt exactly as worded meets every point: never require a case the question does not ask about. Each point restates a sentence of your explanation.
- Never require jargon: "squash" meets "compress".'
(c) Validator changes:
- A rubric point containing ';' gets: 'say.rubric[n] holds two ideas; split it or keep the one at the heart of the lesson.'
- Flag a rubric point whose content words all appear in say.prompt.

**Evidence.** anc/i1 teacher: the prompt states rubric point 3 | vaccines/i1 teacher: two of three points are the same idea | vaccines/i3 teacher and expert: point 2 is equally true of the first meeting; point 3 restates the question | rainbows/i1 teacher (major) and learner: point 3 joins two claims with ';' and requires the head-on case the question never asks | bronze/i1 teacher: points 1 and 2 overlap, and there is no point for the trade conclusion | bronze/i4 teacher: point 2 rewards a dating-method detail

### 10. [medium] app/src/js/30-prompts.js THE NUMBER RULE (lines 474-479)

**Why.** 5 of 8 lessons mislabelled numbers. A real 220 Hz tone was hedged 'for example'. An assumed '10 times' appeared bare. Unlisted decay constants contradicted the sources. Three different 'top angles' were never reconciled. A rounding choice made the real Uluburun cargo look tin-short.

**Change.** NUMBERS: honest labels, real cases that stay true, and model values reconciled with real ones.
(a) Line 475. Current: '- computed: worked out from the rule in whatAmILookingAt;' New: '- computed: worked out from the rule in whatAmILookingAt. A peak, crossing or threshold comes from the rule itself, not the slider steps: if it falls between steps, write "near 85%", never "at 85%";'
(b) Line 476 constant: append 'Its label says only what its quote says (no colour, place or condition the quote lacks). In whatAmILookingAt, say what the constant physically is. A zero, "none" or "at once" is a constant only when no source in RESEARCH says otherwise. When you apply a rounded constant ("around 10 per cent") to a real, documented case, work out what your rule then says about that case. If it shows something no source says (a real cargo leaving a ton of copper idle), pick a value inside the stated range that keeps the real case true, and say you chose it.'
(c) Line 477. Current: '- assumed: a value chosen for the example (a £1,000 pot, a village of 100), shown as "for example", never as a finding. A sketched curve\'s shape (when it peaks, how much higher the second rise is) chosen inside what the sources say is assumed too, and the caption says it is a sketch;' New: '- assumed: a value chosen for the example (a £1,000 pot, a village of 100), worded so he can tell it was chosen, not found ("say a £1,000 pot", "drawn 10 times higher here"). A setting the interactive itself uses (the pitch it plays) is stated plainly as its choice ("this hum is 220 squeezes a second"). A sketched curve\'s shape (when it starts and peaks, how much higher the second rise is, how fast each part falls) chosen inside what the sources say is assumed too. List it in numbers, make it follow every shape fact in RESEARCH (what stays high, what falls back), describe it as drawn in whatAmILookingAt, and have the caption say it is a sketch;'
(d) After line 479 ('...never give false precision.') add: ' When the model\'s result and a cited real value describe the same thing but differ (42.5° against about 42°), say why in one clause and use one real value in explain, checks and whys. Use metric units: a source\'s "tons" for a metric amount becomes "tonnes". Write each number in explain exactly as its readout shows it.'
(e) 33-interactive.js line 197. Current: 'Show assumed values as examples ("for example, £1,000").' New: 'Every label, caption or .say sentence that shows an assumed value marks it as chosen in that same label or sentence ("drawn 10 times higher here"). A setting the page itself uses is stated plainly. Every constant in your script that shapes the picture (a rise or fall time) is one of the numbers listed above. Write a constant the way the lesson does (10 tonnes, not 10.0).' Line 153: replace 'shown as "for example"' with 'worded as chosen, not found'. Mirror the same in KIT.md line 151.
(f) Kit: K.fmt(v, {decimals, trim: true}) lets whole values read whole.

**Evidence.** anc/i1 teacher, expert and learner: 'squeezes the air, for example, 220 times a second' | anc/i4 learner: 'for example' repeated mid-sentence in the caption and the Sounding line | vaccines/i3 expert (major): decay times 4 and 12 are not in numbers and contradict the IgG source; '10 times' shown bare; '0 days' listed as a constant | rainbows/i4 teacher, expert and learner: 42.5°, 42° and 42.7° unreconciled; 'red light' label not in the quote; expert: the peak is at 86.2%, not '85%' | bronze/i1 teacher, expert (major) and learner: the exact 9:1 recipe shows the real cargo with 1 t of copper unused; '10.0 tons' vs '10 tons'; tons vs tonnes

### 11. [medium] app/src/js/33-interactive.js rulesSection (lines 192-200)

**Why.** In 5 lessons the drawing failed to show the thing the explanation and checks were about. The bend was never marked. A band shaded the wrong axis. A label floated over empty space. Two dashed grey lines meant different things. An unexplained graph sat beside the picture, and the 'drifts past them all' motion was never drawn.

**Change.** PICTURE: mark on the drawing what the lesson talks about.
(a) Add to rulesSection:
'- Mark the brief\'s one quantity on the picture itself, labelled with its readout\'s value (an arc between the no-bend path and the beam reading "11°").'
'- Every label sits on, or points to, something drawn; a label over empty space means a mark is missing.'
'- A shaded band states something true of the axis it spans: inputs across x, outputs across y. To show many inputs giving nearly the same output, shade the narrow output band (regions {y0, y1}).'
'- Draw every comparison the explanation makes (this band against that one, the first wait against the second) the same way, in the same place, on the axis where the effect happens. A time period is a bracket or thin band along the time axis, not a tall block.'
'- Give each reference line its own look and a label beside it, never two lines in the same style; every styled line is in the key or labelled on the drawing.'
'- Draw only what the lesson names in its brief, whatAmILookingAt or explanation. Any extra figure carries a plain label saying how to read it, and every graph says on itself what its line stands for ("the air at one spot near your ear") and which way is which.'
(b) Line 436. Current: '- whatAmILookingAt (at most 120 words; aim for about 100): the rule the model follows, in plain words first,' After 'in plain words first' add ' (the rule, not choreography the builder may not draw). Name every part the picture needs (reference lines, any graph beside it, what each axis direction means) in the terms later lessons will use, so the builder and the explanation use the same names.'
(c) KIT.md: document a line legend item, `<span><i class="swatch line dash"></i>where it would go with no bend</span>`.

**Evidence.** rainbows/i1 teacher and learner: the change of direction the brief and target check ask about is never marked; two identical dashed grey lines; broken legend | rainbows/i4 teacher, expert and learner (major): the 'rays crowd here' band spans x (inputs) while the crowding is in y; the 2.4° vs 8.6° comparison is not drawn | vaccines/i3 teacher, expert and learner: 'memory cells' label over empty space; no 'no wait' mark at day 30 | anc/i1 teacher: the eardrum trace is never named, and its 'up' contradicts i4's | anc/i4 learner: the waves never say what they show | vaccines/i1 teacher and learner: whatAmILookingAt promises the germ 'drifts past them all'; it only slides in

### 12. [medium] app/kit/KIT.md line 147 and The self-test (line 170)

**Why.** In anc/i1 all three judges raised it as a major. The first squeeze reached the eardrum about 6.9 s after the switch, so the thing Dan predicted was the last thing to appear, and on a phone he would likely scroll on. The 'ten seconds' rule allowed it, and no automated shot caught it.

**Change.** TIMING: the answer appears within about 3 seconds of Dan's first move.
KIT.md line 147. Current: '- One idea, visible within ten seconds of play. One or two controls, three at most.' New: '- One idea. The answer to Dan\'s prediction is on screen within about 3 seconds of his first move. When something must travel or build up first (a wave, a pulse, a queue), choose distances and speeds so it arrives within 2-3 s, and add a K.check that it does. Make the change unmistakable at 340 px, and keep transitions under 400 ms in total. It is still worth a second and third try: something Dan causes, and at least one case that surprises. One or two controls, three at most.'
The lesson's ignores already says by how much the picture is slowed (Change 4).
Self-test: play each K.anim for 3 s of model time; it currently plays 60 frames at 1/30 s, about 2 s.
render.mjs line 86 currently waits `info.actions.length ? 1500 : 500`. Wait 3000 ms after any set or press before the moved shot, and have the verdict confirm the predicted answer is visible in that shot.

**Evidence.** anc/i1 teacher (major), expert (major) and learner (major): V=40 over a 276-unit path gives a 6.9 s travel; the moved shot at 1.5 s shows a flat eardrum; only the extra 9 s shot shows the answer | vaccines/i1 learner: the lock-on line fades in after 0.45 s + 0.3 s; render.mjs shoots after 500 ms, so the line is nearly invisible

### 13. [medium] app/src/js/30-prompts.js line 425

**Why.** Both sound lessons were criticised by all three judges. The hum was decoration with no link to a picture slowed a hundredfold. It played at 220 Hz, a pitch phone speakers barely produce. In anc/i4 the button changed a volume rather than letting Dan hear cancelling, and at 50% it played nothing, which looks broken.

**Change.** SOUND: tie it to the picture and control, use pitches a phone can play, and never leave a silent button.
(a) Line 425. Current: '- An idea about sound or music lets him hear it: a Play button that sounds what the picture shows.' New: '- An idea about sound or music lets him hear it when hearing teaches something the picture can\'t (two pitches, two loudnesses, a hum that fades as waves cancel). Use a sound he keeps playing while he moves the control (K.sound.hold), so he hears the change itself, with one button to start and stop it. When the picture is slowed down, say so plainly ("the real hum repeats this 220 times a second"). Leave sound out when it only decorates.'
(b) KIT.md lines 103-104. Current: 'Phone speakers can\'t play below about 150 Hz: use 200 to 2,000 Hz for anything Dan must hear, and say so when the real sound is lower.' New: 'Phone speakers barely play pure tones below about 300 Hz. Use 300 to 1,000 Hz for a demonstration tone (or type \'triangle\', whose harmonics carry), and a gain near 1 for the loudest case. Say on the page when the real sound is lower (headphones help). When two sounds add or cancel, let him hear the second arrive: start one hum alone with K.sound.hold, then follow the slider. A Play button always makes or stops a sound he expects; never one whose result is silence without saying so. Clear any "Sounding" line when the sound stops.'
(c) Kit:
- Raise the warning threshold in kit.js from 150 to 300 Hz for sine.
- tone() returns a promise or takes onend.
- Add K.sound.pair(hz, {offset, gain2}): two real oscillators with a phase offset, so cancelling happens in the audio.
- Change the repair hint '(200 to 2,000 for anything Dan must hear on a phone)' to 300 to 1,000.

**Evidence.** anc/i1 teacher, expert and learner: a 2 s 220 Hz sine cut off from the picture; probably faint on an Android speaker; the 'Sounding' line never clears | anc/i4 teacher, expert and learner (major): one tone at gain 0.12 x combined; silence at 50%; the 2x vs 1.41x difference (about 3 dB) may be inaudible

### 14. [medium] app/src/js/33-interactive.js LEVEL (line 22)

**Why.** The lesson prompt now limits formulas for NEW learners (line 436), but the build prompt doesn't. So trigonometry still reached a NEW learner's caption. Elsewhere, captions named unearned laws, repeated the panel, or added claims the lesson never made (the 'cave record').

**Change.** CAPTION AND MATHS: keep them at Dan's level, and keep the caption a short restatement.
(a) Line 22. Current: "LEVEL = { new: 'Dan is new to this topic.', some: 'Dan knows a little about this topic.', ..." New new: 'Dan is new to this topic: on the page (caption, labels, .say), say every rule in words; no formula beyond simple arithmetic (no cos, square roots, powers, logs or |...|).' New some: 'Dan knows a little about this topic: show an equation on the page only if every symbol in it is labelled on the picture; otherwise say the rule in words.'
(b) KIT.md step 5. Current: '5. `<p class="caption">`: at most two short sentences (the rule, where constants come from). The app shows what the model leaves out.' New: '5. `<p class="caption">`: one short sentence, at most 20 words: where the numbers come from ("A sketch, not measured data; timings from the lesson\'s sources"), or the rule in the explanation\'s words at Dan\'s level. It restates the lesson in fewer words and never adds a claim. It names no law or term (Snell\'s law, refractive index) the explanation does not teach. The app shows the full rule and what the model leaves out.' Update the KIT example and compound-growth.html captions to match. The compound-growth caption currently also lists what it leaves out, against the kit's own rule.
(c) Line 436. After 'in plain words first,' add 'built from steps he can see in the picture (what each step adds or takes away: "the bounce adds 2β, each bend takes away α − β"),'. Then add: 'Name a law or term here only if the explanation earns it too. Explain a function by what it does in the picture, not by a calculator key.'

**Evidence.** anc/i4 teacher, expert and learner: '2 x |cos(180° x d)|' under every state for a NEW learner | rainbows/i1 teacher: 'Snell\'s law ... refractive index' in the caption; never taught | rainbows/i4 teacher and learner: '4β − 2α' with α and β never explained on the page | vaccines/i3 learner: the caption repeats whatAmILookingAt and the say lines | bronze/i4 learner (major): the caption repeats the false 'cave record' claim on every step

### 15. [medium] app/src/js/30-prompts.js THE NUMBER RULE date line (line 478), confidence 'contested' (line 470), BEFORE YOU REPLY

**Why.** bronze/i4 was the lowest-scoring lesson (overall 2.33, accuracy 2.67), and all three judges raised these as majors. Every history idea timeline is exposed to the same failures: date windows read as durations, a timeline whose dates bunch against the line it claims to break, an invented dating method, a false 'no date in our sources', and unequal 'views'.

**Change.** HISTORY: treat dates, timelines and debates honestly.
(a) Line 478. Current: '- date: a historical date or documented historical fact, with "source": n when a source above states it.' Append: ' A date range is uncertainty about when one event happened, not how long it took. Word it "sometime between 1200 and 1180 BC", never use overlapping ranges as evidence that events were spread out, and keep it apart from anything that truly lasted years. A city emptying over decades is shown as a process, never a point. Say how a date was found (pottery, texts, radiocarbon, a cave record) only if the quote says so. Convert years before present to BC or AD.'
(b) Line 470. Current ends: 'Give 2 or more views, each { label: who holds it, text: the view fairly stated in at most 50 words }.' Append: ' Each view comes from a named scholar or a peer-reviewed or university source, and all views answer the same question. A general encyclopedia states the mainstream; it is not one side of a debate. When two sources\' dates do not fit together, say so in one plain sentence.'
(c) BEFORE YOU REPLY, add:
'- Place each date on the axis you plan: the change your brief names is really visible with these numbers at that scale. If the dates bunch, rewrite the brief to what they show and say in ignores what is missing.'
'- Never tell Dan a source lacks something ("our sources give no date"); say "this lesson does not show it".'
'- Every date and span squares with what a specialist knows; drop a source number that would surprise one.'
(d) rulesSection, add: '- On a timeline, draw a dating window differently from a span that really lasted (a faded window against a solid bar), and say which is which. Text that appears at a later step goes in the .say line or below the controls, never inside the stage above them, and never repeats the .say sentence.'
(e) Sweep: warn when the first control's top moves more than 40 px across stepper or choice values.

**Evidence.** bronze/i4 teacher (major x2), expert (major) and learner (major): three city dates within 20 years of 1200; 'a range of years, not a single day' treats uncertainty as duration | bronze/i4 expert, learner (major) and teacher: 'Pylos\'s date comes from a cave record' | bronze/i4 teacher (major), expert (major) and learner: 'Our sources give no date for the battle' while the research has c.1177 BC | bronze/i4 expert: WHE set against a peer-reviewed paper; Hattusa drawn as an instant 'destroyed' tick | bronze/i4 teacher and learner: the Egypt box pushes Back/Next about 400 px down

### 16. [medium] app/src/js/30-prompts.js writeLesson THE COURSE block (lines 380-388)

**Why.** writeLesson never receives the hook. The first rainbows lesson never mentions rain, a drop or a rainbow. The bronze lessons never say what bronze was for, and bronze/i4 settled i6's debate in advance.

**Change.** COURSE THREAD: link each lesson to the course's puzzle and to the lessons around it.
Add the line: 'Puzzle the course answers: ' + data(topic.hook, 320).
Lines 386-388. Current: 'Teach only this idea; the others get their own lessons. ' + (idx <= 0 ? 'This is the first idea.' ...). New: 'Teach only this idea; the others get their own lessons. Just before the takeaway, add one sentence on what part this idea plays in answering the puzzle (for a history idea, also why it mattered to people then, from a source), without teaching the next idea. When a later idea is a debate (its oneLine says people argue), describe its subject neutrally here and leave the verdict to that lesson ("groups Egyptian records describe arriving by sea", not "raiders"). ' + (idx <= 0 ? ...)

**Evidence.** rainbows/i1 teacher and learner (major): no 'rain', 'drop', 'sun' or 'rainbow' anywhere; the hook is not in the prompt | bronze/i1 learner and teacher: no stakes, and the ship is unnamed | bronze/i4 teacher and expert: 'the raiders its records call the Sea Peoples' prejudges i6 ('raiders or refugees?')

### 17. [low] app/kit/KIT.md K.anim docs (lines 81-82)

**Why.** In anc/i1 'Speaker on', 'Run' and 'Play the hum' all started the same thing, and Run silently flipped the switch. button:false is now documented, but nothing makes it the rule or catches the duplicate.

**Change.** ONE CONTROL PER ACTION.
Current: '`anim` adds a Play button (text `label`; `button: false` when your own control calls `play()` and `pause()`); `reset` adds Reset.' Append: ' When a K.toggle or K.button starts the motion, always pass `button: false` and call play() from that control: one control per action. Add a separate "Freeze" button only when a still frame teaches something.'
Self-test: warn when a page has a K.toggle or K.button and a K.anim Play button, and the anim's step sets that toggle: 'A switch already starts this motion: use K.anim({button: false}).'

**Evidence.** anc/i1 teacher, expert and learner: three controls for one switch's worth of idea; Run sets speakerOn

### 18. [low] app/kit/kit.js afterMoveAdvice (lines 1924-1925) and K.stage/K.plot

**Why.** A 350 px blank hole shipped because hole-detection only warns, and warnings reach the model only in a repair round. Duplicate readouts pushed the live sentence below the phone fold. On laptops the narration sat far from the controls.

**Change.** LAYOUT.
(a) kit.js line 1925. Current: `if (hole) report.warnings.push(hole);` New: `if (hole) report.errors.push(hole);`, so the repair round fixes a blank opening hole. Also give K.plot series and marks an `afterMove: true` option that draws the axes in the opening view and reveals only the curve and dot.
(b) KIT.md line 12. Current: '3. Readouts in <div class="k-readouts">, then <p class="say">: one sentence that changes with the state.' New: '3. <p class="say"> straight under the stage (one sentence that changes with the state), then readouts only for numbers the drawing does not already label.' When K.stage lays the visual and controls side by side, move .k-readouts and .say into the controls column.
(c) 33-interactive.js line 143. Current: 'Outputs (return each from K.model under exactly this key, and show it with K.readout using the same id' New: '... and show it once: as a K.readout, or as a label on the drawing when the drawing already shows it, never both (target checks read K.model, not the tile)'.

**Evidence.** anc/i4 teacher, expert and learner (major): about 350 px blank opening card at 360 and 1280 px | bronze/i1 learner: readouts repeat the bar labels and push .say about 735 px down | vaccines/i3 learner, rainbows/i1 learner, rainbows/i4 learner: on a laptop the say and readouts sit far below the slider, with an empty column under the controls

### 19. [low] app/kit/KIT.md Rules (lines 157-158), mirrored in the build prompt

**Why.** Self-tests reported a modelling choice or a tautology as backed by a source, which hides model errors behind citations.

**Change.** K.CHECK SOURCES.
Current: '`source` may ONLY be a URL from the lesson\'s own sources; if it has none, omit `source`.' New: '`source` may ONLY be a URL from the lesson\'s own sources, and only on a check whose label restates what that source\'s quote says. A result you worked out from the rule, or a fact about your own drawing (how many cells), takes no source. If the sources hold no checkable fact, use a worked example instead.' Optionally warn when no number in a sourced check's label appears in that source's quote.

**Evidence.** vaccines/i1 expert: 'no two share a shape' cited to OpenStax Bio 42.2, which does not say it (clones share receptors) | bronze/i1 expert (and the cause of expert major #1): 'make 10 tons of bronze, with 1 ton of copper spare' cited to the wreck paper, which never says it

### 20. [low] app/src/js/30-prompts.js writeLesson citation bullet (line 446) and SOURCES (line 486)

**Why.** Footnotes sat on reasoning their quotes do not contain. Qualifiers were lost when facts were restated, and the best evidence on offer went unused.

**Change.** FOOTNOTE PLACEMENT.
Line 446. Current: '- Cite with [^n] straight after the sentence a source supports, using only the source numbers listed under RESEARCH. Every fact or number a source covers gets its footnote.' New: '- Put [^n] straight after the words its quote supports, using only the source numbers listed under RESEARCH. If a sentence adds reasoning the quote does not contain, split it so the footnote sits only on the supported part. Every fact or number a source covers gets its footnote. When two sources support a point, cite the one whose quote uses no loose terms or unexplained jargon. If a quote names one kind of thing, your sentence names that kind; if you widen it, say in ignores which members work differently. When you restate a cited fact elsewhere (reveal, misconception, rubric), keep the quote\'s qualifiers ("one type of receptor" never becomes "a single detector"). If a source shows real people acting on the rule (a cargo packed in the recipe\'s ratio), use it.'
Validator: report a listed-but-uncited source as a problem in the write step rather than dropping it silently in finaliseLesson. In the eval, add a quote-vs-claim judge that compares each footnoted clause with its quote.

**Evidence.** rainbows/i1 expert: [^4] sits after eye-traces-it-back reasoning the quote lacks | anc/i4 expert: [^1] sits on 'stays still'; the quote says only 'cancel each other' | vaccines/i1 expert: 'one type of receptor' becomes 'a single detector' in the reveal, whatAmILookingAt and c1 | rainbows/i4 expert: source [4] listed but never cited | bronze/i1 teacher, expert and learner: [8] ('intended to be alloyed with the copper on board') offered and unused

### 21. [low] app/kit/kit.js K.control

**Why.** Exact settings were hard to hit on a phone (50 taps to reach 50%). Colours fought the real metals, and fading 'unused' copper read as 'the copper is gone'.

**Change.** CONTROL ERGONOMICS AND MATERIAL COLOURS.
(a) Add K.control({..., snap: [values]}): a drag within 2% of the range of a listed value lands on it. Make − / + repeat while held. The build prompt passes the predict's setting as a snap.
(b) KIT.md after 'cat1 and cat2 first.' add: ' When the things drawn are materials or objects with a familiar colour, never give one another thing\'s colour (a blue copper, an orange tin): use the nearest role (copper as cat2, tin or silver as muted, gold or bronze as fill2) and label it. What is still there stays solid: mark a state such as unused with a label or bracket, not by fading the thing, and give any dashed or faint style a key.'

**Evidence.** anc/i4 learner: about 1.6 px per step on a 160 px track, and the answer appears only at exactly 50 | bronze/i1 learner: copper drawn blue and tin orange-red; the whole copper stack turns into a faint dashed box at zero tin

## Accuracy errors the subject experts found

- anc/i1: the predict reveal says the eardrum rocks 'in step with the speaker cone'. Correct: it has the same rhythm but lags, by distance ÷ speed. In this model it lags 3.45 cycles, so it swings about 160° out of phase with the cone. Source [2] supports only 'the same frequency'.
- anc/i1: the analogy's breaks says 'Air also passes on stretches, the pull back after each squeeze'. Correct: a gas cannot pull. A stretch travels because the air beyond pushes less hard than usual. People with hands on shoulders can also pass pulls, so that is not the real limit; a slinky passes both.
- anc/i1: 'pressure wave' is defined as 'a disturbance passed outward from its source, not air flowing'. That defines a wave, not pressure. Correct: a squeeze is higher pressure and a stretch lower pressure, as source [2] says; this is dropped although i2 and i4 rely on it.
- anc/i1: the lesson frames sound as passed only 'through the air', yet c3 relies on solids passing squeezes (helmets), a fact never taught or cited. Correct: sound travels through any matter (water, wood, plastic), per source [1]'s 'disturbance of matter'.
- anc/i4: the reveal says two sounds are louder than one 'only when they're in step'. Correct: by the model's own rule the pair is bigger than one hum at any delay under a third or over two thirds of a wave (1.41x at 25% and 75%, as the page itself says). Unrelated everyday sounds add in intensity, about +3 dB, so cancelling is the special case.
- anc/i4: cancelling is taught as 'the sound goes quiet' / 'the hum vanishes' for two speakers. Correct: two out-of-step speakers cancel only at spots where the arrivals meet equal and opposite. Most of a room still hears sound. That cancelling works only in a small space is why headphones can do it.
- anc/i4: the plan, reveal, explain ('the air never moves'), rubric and say line say cancelled sound leaves 'still air'. Correct: equal squeeze plus stretch leaves the pressure at normal. It does not in general stop air motion: where waves meet from different directions, pressure nodes are where the air moves most. [^1] is attached to 'stays still', which its quote does not support.
- anc/i4: check c2 asks Dan to make the readout show '1.00'. No setting does: 33% shows 1.02 and 34% shows 0.96. Its why names only 'about a third of a wave', though two thirds works too.
- vaccines/i1: 'A defender switches on only when its detector fits a shape on the germ' is applied to all lymphocytes, the cells the lesson names. Correct: that is B cells. T cells never bind the germ's surface; they recognise protein fragments the body's own cells display on MHC.
- vaccines/i1: absolute one-shape specificity ('Just one', 'fits just one shape', 'Each kind's detector fits only one particular shape'). Correct: receptors cross-react, several receptors can fit one shape, many identical cells share each receptor, and the real repertoire runs to millions. i5's 'old memory fits less well' needs partial fit.
- vaccines/i1: 'each carries a single detector' (reveal, whatAmILookingAt, c1 misconception, drawing). Correct: each lymphocyte carries many thousands of copies of one kind of receptor; source [2] says 'one type of antigen receptor'.
- vaccines/i1: 'Those surface shapes are called antigens'. Correct: that describes an epitope. An antigen is any substance the immune system responds to, which can be a whole killed or weakened germ (WHO, used in i4). Source [3] itself says 'epitopes of an antigen'.
- vaccines/i1: a fitting detector means the defender 'grabs it' and is switched on. Correct: activation usually also needs a second go-ahead signal (help from other immune cells), and a fit without it can silence the cell. The research note overstated the quote's 'can react'.
- vaccines/i1: ignores says general-purpose defenders 'attack many germs without matching shapes'. Correct: innate cells also recognise shapes, through pattern-recognition receptors that fit molecular patterns many germs share.
- vaccines/i1: c1 and the reveal mark 'all defenders attack anything foreign' as simply wrong. Correct: innate (general-purpose) defenders do attack a broad range of invaders; the claim is wrong only for the shape-matching lymphocytes.
- vaccines/i1: the picture shows recognition as identical icons (a triangle detector for triangle bumps). Correct: binding is complementary (a pocket shaped to fit the bump), as the lesson's own lock-and-key analogy implies. The lock and key also swap roles between explain and analogy.
- vaccines/i1: K.check 'Each defender carries one detector, and no two share a shape' cites OpenStax Bio 42.2. The source does not say this, and in reality clones of a cell share the same receptor (i2's subject).
- vaccines/i1: whatAmILookingAt says the germ 'drifts past them all'. On the page it only slides in from the left and parks above the row.
- vaccines/i3: the explanation's reason for the faster second response ('a few are left ... already waiting') is equally true of the first meeting. Correct: afterwards there are far more matching cells than before. Memory cells are a separately trained set that switch on faster, with less of the germ and less help, and secondary antibodies bind more strongly (OpenStax, OpenLearn in the tool returns).
- vaccines/i3: 'There is no wait this time', 'rises straight away', and 'Days with no antibody after the second meeting: 0' (constant); the drawing reaches the first peak's height 6 hours after the germ returns. Correct: the secondary lag is shorter, a few days (standard texts give 1-3 days). The same source's summary says 'The lag time ... is shorter'.
- vaccines/i3: the drawn falls contradict the sources. The first response is at 6% of peak on day 21, which [9] says is about when IgG usually peaks; whatAmILookingAt promises 'a slow fall'. The second response halves in about 10 days, but the source says secondary IgG 'has not declined' 12 days later and is 'maintained for longer'.
- vaccines/i3: the predict says 'your defence takes about 4 days to get going'. Correct: source [5] says IgM antibody appears after about 4 days. The body's first-line (innate) defences act within hours; the adaptive response takes days.
- vaccines/i3: the picture shows antibody back at zero before the second meeting, and the gap as 20 days. Correct: leftover antibody often persists for years (for measles, the course hook, decades), and the gap is usually months or years. Ignores mentions neither.
- vaccines/i3: '10 times the first peak' is shown bare on the chart and in the say line. Correct: it is an assumed drawing value. The returned sources put the ratio anywhere from about 3x (OpenStax figure) to about 100x (OpenLearn IgG 50 to several thousand units).
- vaccines/i3: 'the main antibody's first peak'. 'main' is not in quote [9], and it implies several antibody kinds that are never explained.
- vaccines/i3: the flat-pack wardrobe analogy puts the speed down to the same person getting practised. Correct: memory is kept as a larger, separately trained population of cells. The analogy also says nothing about the response being bigger.
- rainbows/i1: the rule is stated as 'a slanted beam always swings towards the upright line' / 'towards straight down' (rubric, model, labels). Correct: light bends towards the normal, the line square to the surface where it crosses, which points straight down only for flat water. In a raindrop, light entering the lower half bends upward, towards the centre. Source [2] says 'towards the normal'.
- rainbows/i1: the edge-first (cart-axle) why is taught as settled fact and required by the rubric. Correct: refraction is a wave effect. Each wavefront slows one end first and swings round; even a hair-thin beam bends the same amount, which the beam-edge story cannot explain. Confidence should be 'simplified'.
- rainbows/i1: refractive index is defined as 'a number for how strongly it bends light'. Correct: n = speed of light in vacuum ÷ speed in the material, so 1.33 means light travels 1.33 times slower in water. Bending also depends on angle and on the other material.
- rainbows/i1: footnote quotes [1] and [2] teach that light bends passing into something 'denser'. Correct: mass density does not set refraction. Cooking oil is less dense than water but slows light more (n about 1.47 vs 1.33).
- rainbows/i1: [^4] is placed after 'light ... changes direction on its way out, and your eye traces it back along the wrong line', but the quote says only that a pencil in water is a classic observation of refraction.
- rainbows/i1: c1 says a beam leaving the water at a slant swings away from the upright line. This is true only below the critical angle, asin(1/1.33) ≈ 48.8°; beyond it the light is totally reflected and none leaves the water.
- rainbows/i4: c2's right answer 'Drops send light back at angles up to about 42°, never wider', and its why 'drops just outside send you none'. Correct: that holds only for once-reflected light. Twice-reflected light forms the secondary bow at about 50-54°, and light reflects off the outside of every drop; i7 teaches the wider bow.
- rainbows/i4: 42.7° is labelled 'Widest angle for real drops, red light'. Source [3] names no colour; Stull's 0-42.7° is the spread over all colours. Red is about 42.4° (n = 1.331 gives 42.37°; St Andrews' 137.6° minimum deviation gives 42.4°). The lesson's 42.5°, 'about 42°' and 42.7° are never reconciled.
- rainbows/i4: the peak is said to be 'at 85%' and filed as a control value. Correct: for n = 1.33 the true peak is 42.52° at about 86.2%; 85% is only the nearest slider step, and the value is a computed result.
- rainbows/i4: c3 treats a ray grazing the top edge as leaving at about 15°. Correct: in reality almost all of a grazing ray's light glances off the outside of the drop, so almost none leaves at 15°. Ignores also omits wave effects (small drops smear the bow and add supernumerary bands).
- rainbows/i4: the 'rays crowd here' band spans entry heights 75-90% on the x-axis, implying more light enters there. Correct: light enters evenly. The crowding is in the output, the narrow 40.1-42.5° band of exit angle on the y-axis.
- bronze/i1: the opening state shows the real wreck's 10 t copper and 1 t tin making 10.0 t of bronze with 1.0 t of copper unused, and a K.check cites the wreck source for this. Correct: experts describe the Uluburun cargo as matched at about 10:1, enough for about 11 t of bronze. Source [8] says the tin was 'most likely intended to be alloyed with the copper on board'.
- bronze/i1: tin origins are given as 'Central Asia, or Cornwall and Devon'. Correct: the Central Asia quote is cut from a sentence about the late third millennium BC. The cited paper references work rejecting Central Asia (Mušiston) for the Uluburun tin. Powell et al. 2022 assign about two-thirds to Kestel in Anatolia, which is missing, and Berger et al. 2023 and the 2025 Antiquity paper favour Cornwall and Devon. Quote [9] 'still an unsolved problem' is one cargo's pre-results framing, used for 'most of it'.
- bronze/i1: the takeaway says 'every bronze-making kingdom depended on long trade routes'. Correct: no source says 'every'. Britain, Iberia, Brittany and the Erzgebirge had local tin, and Anatolia may have had Kestel.
- bronze/i1: c1's answer and the reveal say bronze-making 'stops' and 'with no tin the copper just sits there'. Correct: smiths routinely re-melted scrap bronze (e.g. the Cape Gelidonya cargo), and plain or arsenical copper was still worked.
- bronze/i1: 'tons' is used for amounts the sources give in metric tonnes ('11 metric tons'); in UK English a ton is the imperial ton.
- bronze/i4: '1315-1190 BCE' (Drake 2012) is presented as the span of palace destructions, so collapse lasted 'a century, or two'. Correct: in that paper 1315-1190 BCE dates the LH IIIB pottery phase, the height of the palaces. Destructions ran from the 13th to the 11th century BC, and no specialist dates palace falls to the 1310s BC. 1315-1190 is also 125 years, not 'two centuries'.
- bronze/i4: Pylos (about 1200-1180), Hattusa (around 1200) and Ugarit (1190-1185) are presented as 'separate date ranges spread along the timeline', and the rubric says 'The dates are ranges spread over years'. Correct: a range is uncertainty about when one event happened, not how long it took. Overlapping ranges fit simultaneous falls just as well. Real evidence of spread runs from Merneptah c.1208 to Lachish VI and Megiddo VIIA c.1130.
- bronze/i4: 'Our sources give no date for the battle' (the Egypt note, step 6 and ignores). Correct: the course's own research dates Ramesses III's year 8 to probably c.1177 BCE (Livius), and Merneptah reigned 1213-1203; it was filed under i6.
- bronze/i4: 'the raiders its records call the Sea Peoples'. Correct: 'Sea Peoples' is a 19th-century scholars' label (de Rougé, Maspero). Egyptian texts name separate groups (Peleset, Tjeker, Shekelesh, Denyen, Weshesh, Sherden), and 'raiders' prejudges i6's question.
- bronze/i4: 'Pylos's date comes from a cave record counted in years before 1950' (whatAmILookingAt and the caption on every step). Correct: the destruction is dated by the LH IIIB to LH IIIC pottery transition (archaeological chronology: ceramics cross-dated with Egyptian fixed points and radiocarbon). The cave stalagmite records rainfall.
- bronze/i4: Hattusa is labelled 'destroyed' and drawn as an instant tick on 1200. Correct: excavations (Seeher) found the court left in an orderly way with its valuables, and fire hit only some buildings, possibly later. 'Abandoned around 1200 BC, emptying over decades' fits better, and the reveal and explain give the order inconsistently.
- bronze/i4: the contested views are not like for like. A general reference site (World History Encyclopedia, dating the whole collapse) is set against a peer-reviewed paper's date for a Greek pottery phase, as 'Experts date the whole collapse differently'.
- bronze/i4: c3's misconception for 'grew into the region's new great power' gives no reason it is wrong. Correct: Egypt lost its empire in Canaan within decades of the collapse, and the New Kingdom ended in the 11th century BC (the 'shrank' the plan promised and research never sourced).
- bronze/i4: the climate band ends at 1190 BC ('palaces fell 1315-1190') while the Pylos band runs to 1180 and Ugarit sits at 1190-1185. The lesson never explains this clash between differently dated studies.
