export const meta = {
  name: 'shelf-course',
  description: 'One shelf course end to end: brief research, brief, plan, research, then write, fact-check, build, review, fix and confirm every lesson, then guide and assemble',
  phases: [
    { title: 'Brief research', detail: 'benchmarks, syllabus lines, misconceptions and trade uses, every quote checked (Sonnet, high)' },
    { title: 'Brief', detail: 'the course brief, decisions taken for Dan (Opus, high)' },
    { title: 'Plan', detail: 'plan-topic answered to the brief, validated (Opus, high)' },
    { title: 'Research', detail: 'course research with every quote checked (Sonnet, high)' },
    { title: 'Lessons', detail: 'each lesson in order: write, fact-check, plain edit, build, review, fix, confirm' },
    { title: 'Assemble', detail: 'still guides and the assemble (Sonnet, low)' },
  ],
}
// The ready-made course build as a Workflow script (tools/course/RUNBOOK.md is the process; CLAUDE.md sets each
// stage's model and effort). Run it with the Workflow tool: scriptPath this file, args one of tools/course/args/*.json.

const A = args
const ROOT = '/home/user/Study-App'
const SHELF = A.shelf || 'maths'
const D = `${ROOT}/build/${SHELF}/${A.slug}`
const WHERE = A.where || "the Maths shelf's Advanced maths folder"
const CHOSEN = A.chosen || '24 Oct'
const VIZ = A.viz ? ` DATA PICTURES (Dan, 25 Oct: "a really cool, pretty and satisfying way of visualising data"): this course has one visual language for data, chosen by a design contest: ${ROOT}/build/${A.shelf || 'maths'}/${A.slug}/dataviz.md (read it; it binds) with its working prototype dataviz.proto.html. Every picture that shows data uses that language and pastes its "Copy this code" helpers unchanged, so all lessons look and move the same; a lesson's own extras build on them, never replace them.` : ''
const COURSE = A.title
const UPTO = A.upto || 99
const earlier = (A.earlier || []).map((c) => c.title).join(', ') || 'none'
const earlierBriefs = (A.earlier || []).map((c) => `${ROOT}/docs/courses/${c.shelf || SHELF}/${c.slug}/brief.md`).join(', ')
const CONTEXT = `Dan is an electrician and a Royal Navy submariner on the electrical engineering path; next year he does a Level 3 marine engineering course (general engineering first, then submarine and nuclear propulsion). He asked for foundations that see him through any new topic, not a remake of that course (CLAUDE.md). His built maths courses: all of Foundational maths (Fractions, Negative numbers, Percentages, Proportional reasoning, Solving equations, The coordinate plane, Geometry fundamentals), all of Algebra (Linear equations, Straight-line graphs, Linear systems, Powers and roots, Functions and their graphs, Quadratics and polynomials, Exponentials and logarithms, Trigonometry, Complex numbers) Calculus fundamentals, Vectors, Differential equations, Matrices, Linear algebra and Statistics for engineers; and the electrical courses AC circuits (phasors, reactance, three-phase, star and delta), Electronics and power electronics, Design and verification, Motors and HV Subsea Cable Testing; and the engineering science courses Mechanics and materials (forces, moments, stress, motion, energy, rotation, gears, vibration) and Heat and fluids (heat, heat transfer, gases, heat engines, pressure, buoyancy, flow, pumps). ${A.earlier && A.earlier.length ? 'Also built, earlier in this push: ' + earlier + ' (their briefs: ' + earlierBriefs + '). ' : ''}Never teach those again; build on them and use them for examples. This is "${COURSE}" in ${WHERE}, which runs: ${A.folderRuns}. Courses after it (defer their ground and say where it goes): ${(A.later || []).join(', ') || 'none'}.`
const RESUMED = (IID, stage) => A.resumed && A.resumed.iid === IID && A.resumed.stage === stage ? ' NOTE: this build was stopped by a machine restart and resumed at this stage. Files for this lesson left by the stopped run (prompts, drafts, replies, attempt files) belong to this same build: overwrite them. No other session is building this course.' : ''
const ECONOMY = `Work in few, large turns: batch shell commands into one call where you can, write each file once with Write and do not read it back, and read only the pictures a tool's summary names (CLAUDE.md: one contact sheet per check, never single frames). Every turn re-reads your whole context.`
const STYLE = (pic) => `House style: steps lessons (RUNBOOK section 0, item 3; this course is "${A.format}" for teaching visually, ${A.format === 'Yes' ? 'so SHOW screens keep to one to three plain sentences' : 'so SHOW screens may carry up to a short paragraph where the idea needs it'}): about 12 screens alternating SHOW (plain sentences and a picture that demonstrates) and DO (a puzzle with Check, a one-line hint when wrong, Why?, Continue), ending with two or three mixed puzzles. Warm British English, no padding. Exemplars for shape and quality: ${ROOT}/docs/courses/maths/linear-equations/i2.lesson.verified.json and i2.body.final.html, and i5 (a number line with motion). This lesson's picture, per ${D}/brief.md: ${pic}${VIZ}`

const PLAIN = `PLAIN WRITING (Dan, 20 Oct: "you need to be using the content to explain in your own words to me, you don't need to cite everything and tell me where everything comes from"). Teach in your own words as a good instructor would. Never tell him where something comes from in the text ("Brilliant's course says", "(HELM p.4)", "one textbook warns"): sources stay in research.json and are fact-checked, but the words just explain. A [^n] footnote only on a rule or value he might look up, at most a few a lesson, never several in one sentence. One idea per sentence, mostly under 20 words; active voice; no chains of clauses on semicolons; no asides in brackets mid-sentence; never talk about the course itself. Lead with the point, then the working. Every instruction to act on the screen ("Drag", "tap") has a read sentence that makes sense in a read-through with no controls (RUNBOOK 6b). SHORT SCREENS (Dan, 21 Oct: "a bit too much text after the diagrams"): every SHOW screen's text is at most about 90 words; PHONE: any row of three or more readouts or buttons wraps at 360 px (RUNBOOK 5), so no word ever splits.`

const S = {
  pre: { type: 'object', properties: { kept: { type: 'number' }, failed: { type: 'number' }, summary: { type: 'string' } }, required: ['kept', 'failed', 'summary'] },
  brief: { type: 'object', properties: { lessons: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, picture: { type: 'string' } }, required: ['title', 'picture'] } }, decisions: { type: 'array', items: { type: 'string' } } }, required: ['lessons', 'decisions'] },
  plan: { type: 'object', properties: { ideas: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, title: { type: 'string' } }, required: ['id', 'title'] } }, hook: { type: 'string' }, valid: { type: 'boolean' } }, required: ['ideas', 'hook', 'valid'] },
  research: { type: 'object', properties: { kept: { type: 'number' }, dropped: { type: 'number' }, ideasCovered: { type: 'array', items: { type: 'string' } } }, required: ['kept', 'dropped', 'ideasCovered'] },
  written: { type: 'object', properties: { valid: { type: 'boolean' }, problems: { type: 'array', items: { type: 'string' } }, title: { type: 'string' }, screens: { type: 'number' } }, required: ['valid', 'problems', 'title', 'screens'] },
  checked: { type: 'object', properties: { status: { type: 'string' }, applied: { type: 'number' }, notes: { type: 'number' }, overview: { type: 'string' } }, required: ['status', 'applied', 'notes'] },
  built: { type: 'object', properties: { ok: { type: 'boolean' }, attempts: { type: 'number' }, lookAt: { type: 'array', items: { type: 'string' } }, blocked: { type: 'string' } }, required: ['ok', 'attempts', 'lookAt'] },
  review: { type: 'object', properties: { scores: { type: 'object', properties: { lands: { type: 'number' }, why: { type: 'number' }, cause: { type: 'number' }, trade: { type: 'number' }, honest: { type: 'number' }, pleasure: { type: 'number' } }, required: ['lands', 'why', 'cause', 'trade', 'honest', 'pleasure'] }, findings: { type: 'array', items: { type: 'object', properties: { severity: { type: 'string', enum: ['fix', 'polish'] }, where: { type: 'string' }, what: { type: 'string' } }, required: ['severity', 'where', 'what'] } } }, required: ['scores', 'findings'] },
  fixed: { type: 'object', properties: { fixed: { type: 'array', items: { type: 'string' } }, notFixed: { type: 'array', items: { type: 'string' } }, ok: { type: 'boolean' } }, required: ['fixed', 'notFixed', 'ok'] },
  confirmed: { type: 'object', properties: { confirmed: { type: 'boolean' }, open: { type: 'array', items: { type: 'string' } } }, required: ['confirmed', 'open'] },
  assembled: { type: 'object', properties: { ok: { type: 'boolean' }, tid: { type: 'string' }, docs: { type: 'number' }, problems: { type: 'array', items: { type: 'string' } }, lessons: { type: 'string' } }, required: ['ok', 'tid', 'docs', 'problems', 'lessons'] },
}

phase('Brief research')
const pre = await agent(`RESEARCH-RUN ${A.slug}-${A.date}

You are the research stage for a course brief in the repo ${ROOT} (read CLAUDE.md, then tools/course/RUNBOOK.md sections 0 and 2, especially the paragraph "A course brief's research works the same way"). The course is "${COURSE}" in ${WHERE} (docs/shelves-${SHELF}.json: blurb "${A.blurb}"; benchmark ${A.from}). ${CONTEXT}

Work in ${D} (mkdir -p it, and write ${D}/shelf.json = {"shelf": "${SHELF}", "course": "${A.slug}"} first, so assemble marks the topic ready-made). Write there:
1. research-notes.md, in the same shape as docs/courses/maths/linear-equations/research-notes.md (read its first 80 lines): numbered sections, each finding with source title, URL and the exact words copied from the page, UNCONFIRMED or SECONDARY where you could not see the exact words.
2. quotes.json: a JSON array of {section, claim, title, url, quote} for every quote in the notes, the quote copied word for word from a tool result.

Use the Parallel Search connector's web_search and web_fetch tools for every lookup (load them with ToolSearch "select:mcp__Parallel_Search__web_search,mcp__Parallel_Search__web_fetch" first). Never retype a result: every quote must be text that appeared in a tool result. Syllabus pages already fetched for earlier courses may sit in build/maths/calculus-fundamentals/tools (if this machine has it) and docs/courses/maths/linear-equations/tools (files {tool, input, output}); you may copy any you need into ${D}/tools unchanged before harvesting, and quote them. Aim for 12 to 16 kept sources.

What the brief needs to know (the sections of your notes):
1. Benchmark: ${A.from}: levels and lesson list in order, description, and where it sits in its path. Pages move; if a course is gone, say so and use what is reachable.
2. Other courses' order for the same ground: ${A.others || "Khan Academy, BBC Bitesize or SQA Higher Maths, the HELM workbooks (Loughborough) and Bird's Engineering Mathematics contents"}. Lesson or chapter lists in exact words.
3. ${A.syllabi || 'What a marine engineering HNC actually uses of this topic: the SQA HN Engineering Mathematics units, Pearson BTEC HN Unit 4002 Engineering Maths, and the MCA engineer officer syllabus lines (Applied Mathematics, General Engineering Science)'}. Exact lines.
4. The scope to cover, and what research says about each part: ${A.scope}
5. Prerequisites: what this topic leans on, which of it Dan has from the built courses, and what must be taught inline.
6. Misconceptions and learning science for each skill, with sources (research papers, NCTM or AQA/OCR examiner reports, Bitesize's named mistakes).
7. Where it is used for an electrician going into marine engineering, each with a quote from a reachable page.
8. Size: how many lessons the benchmarks spend, and which core supports ${A.lessons} lessons for Dan.

When the notes and quotes.json are written, harvest your own tool calls and check every quote, exactly as the runbook says:
  node tools/course/harvest.mjs --marker "RESEARCH-RUN ${A.slug}-${A.date}" --out ${D}/tools
  node tools/eval/sources.mjs --quotes ${D}/quotes.json --tools ${D}/tools
Fix every quote it reports as failed (re-copy from the saved tool file, or drop the finding) and run both again until it prints failed: 0. A quote that cannot be made to pass is marked UNCONFIRMED in the notes and removed from quotes.json. Do not write the brief itself.
Return the kept count, the failed count from the last check, and a summary under 200 words: the benchmark's lesson list in one line, the best syllabus lines, the strongest misconception sources, the trade uses with sources, and anything unconfirmed.`,
  { model: 'sonnet', effort: 'high', phase: 'Brief research', label: 'brief research', schema: S.pre })
if (!pre || pre.failed) throw new Error('brief research left failing quotes: ' + JSON.stringify(pre))
log(`Brief research: ${pre.kept} sources, failed ${pre.failed}`)

phase('Brief')
const brief = await agent(`Write the course brief for "${COURSE}" (${WHERE}: "${A.blurb}"), answering tools/course/RUNBOOK.md section 0 (read it first). Work in ${D}. ${CONTEXT}
Read ${D}/research-notes.md and ${D}/quotes.json (cite findings by their notes section numbers), and ${A.models || 'docs/courses/maths/linear-equations/brief.md and docs/courses/maths/calculus-fundamentals/brief.md'} as the models for shape and voice.
Dan chose this course next (${CHOSEN}) and approved the build, so take the decisions for him and write them up under "Decisions taken for you" so he can change them later: ${A.lessons} lessons; the scope: ${A.scope}; format "${A.format}" for teaching visually (RUNBOOK section 0, item 3). Teach inline only what he lacks; never re-teach the earlier courses; defer the later courses' ground and say where it goes. Every "where it is used" claim cited. Mark UNCONFIRMED what the notes mark so. Name the misconceptions each lesson catches with their sources. Give every lesson one main picture he moves with his finger that shows the cause, chosen from what the research supports, and say why.${VIZ ? ' Take each lesson\'s picture from dataviz.md\'s lesson list, adapting it only where the research or the lesson split needs, and say so.' + VIZ : ''} Include the lessons table (number, title, what it teaches with note citations) as the calculus brief does.
Write ${D}/brief.md. Also write ${D}/intake.json in the app's shape (copy the three questions exactly from docs/courses/maths/linear-equations/intake.json, rewording q1's first option to name ${COURSE.toLowerCase()}; pick: understand and work with it; on the job and in everyday life; hands-on with the why explained in full).
Return the lessons (title and the picture each uses) and the decisions.`,
  { model: 'opus', effort: 'high', phase: 'Brief', label: 'brief', schema: S.brief })
if (!brief || !brief.lessons.length) throw new Error('the brief returned no lessons')
log(`Brief: ${brief.lessons.length} lessons: ${brief.lessons.map((l) => l.title).join('; ')}`)

phase('Plan')
const plan = await agent(`Plan the course "${COURSE}" as tools/course/RUNBOOK.md section 1 says (read it, and ${D}/brief.md, the agreed shape: one idea per lesson, in its order, titles exactly: ${JSON.stringify(brief.lessons.map((l) => l.title))}).
1. node tools/eval/prompts.mjs plan-topic --query "${COURSE}" --level some --mode read --intake ${D}/intake.json > ${D}/plan.prompt.txt
2. Answer it yourself (model hat: the exact JSON it demands, obeying every rule in it), following the brief's lessons exactly, each idea's oneLine stating the skill, deps as the brief's "builds on", kinds as fit. The hook is a question from Dan's trade that this course answers; oneBreath sums up the whole course in plain words. Save the reply as ${D}/plan.reply.txt.
3. node tools/eval/validate.mjs plan ${D}/plan.reply.txt  (fix and re-run until it reports no hard problems)
4. Write ${D}/topic.json = the validated plan object plus "query": "${COURSE}", "level": "some", "mode": "read", "intake": the contents of ${D}/intake.json (as docs/courses/maths/linear-equations/topic.json is shaped).
Return the ideas (id and title), the hook, and whether the plan validated.`,
  { model: 'opus', effort: 'high', phase: 'Plan', label: 'plan', schema: S.plan })
if (!plan || !plan.valid) throw new Error('the plan did not validate')
log(`Plan: ${plan.ideas.map((i) => i.id + ' ' + i.title).join('; ')}`)

phase('Research')
const research = await agent(`RESEARCH-RUN ${A.slug}-build-${A.date}
Do the course research for "${COURSE}" exactly as tools/course/RUNBOOK.md section 2 says (read it). Topic: ${D}/topic.json. The brief's research already saved tool files in ${D}/tools and checked quotes in ${D}/quotes.json with notes in ${D}/research-notes.md: start from those, and search (Parallel Search web_search and web_fetch, loaded with ToolSearch "select:mcp__Parallel_Search__web_search,mcp__Parallel_Search__web_fetch") only for what the ideas still lack. Every idea needs notes, and every number a lesson will state (a rule, a constant, a syllabus line, a trade formula) needs a source.
1. node tools/eval/prompts.mjs research --topic ${D}/topic.json > ${D}/research.prompt.txt
2. Answer it (model hat) in exactly the format it demands, every quote copied word for word from a tool result (the saved files or your own calls), never retyped. Save as ${D}/research.reply.txt.
3. node tools/course/harvest.mjs --marker "RESEARCH-RUN ${A.slug}-build-${A.date}" --out ${D}/tools
4. node tools/eval/sources.mjs --reply ${D}/research.reply.txt --tools ${D}/tools --topic ${D}/topic.json --out ${D}/research.json
Fix every dropped source (re-copy the quote from its tool file, or replace the source) and repeat 3 and 4 until none is dropped. Aim for 12 to 18 kept sources with notes for every idea.
Return the kept and dropped counts and which ideas have notes.`,
  { model: 'sonnet', effort: 'high', phase: 'Research', label: 'research', schema: S.research })
if (!research) throw new Error('the research stage returned nothing')
log(`Research: ${research.kept} sources kept, ${research.dropped} dropped; notes for ${research.ideasCovered.join(', ')}`)

phase('Lessons')
const results = []
for (let k = 0; k < Math.min(plan.ideas.length, UPTO); k++) {
  const IID = plan.ideas[k].id, TITLE = plan.ideas[k].title
  const pic = (brief.lessons[k] && brief.lessons[k].picture) || 'as the brief says for this lesson'
  const PH = `${IID} ${TITLE}`
  const priors = plan.ideas.slice(0, k).map((i) => `${D}/${i.id}.lesson.final.json`).join(',')
  const priorArg = priors ? ` --prior ${priors}` : ''

  const written = await agent(`Write lesson ${IID} ("${TITLE}") of "${COURSE}" exactly as tools/course/RUNBOOK.md section 3 says (read it, and ${D}/brief.md for this lesson's skill, picture and the misconceptions it catches). ${CONTEXT} ${STYLE(pic)} ${ECONOMY}
1. node tools/eval/prompts.mjs write-lesson --topic ${D}/topic.json --idea ${IID} --research ${D}/research.json${priorArg} > ${D}/${IID}.lesson.prompt.txt
2. Model hat: draft 1 (${D}/${IID}.lesson.draft1.txt, the exact JSON the prompt demands, a steps lesson); critique it against the seven faults and the recommended shape (${D}/${IID}.critique.json); rewrite as ${D}/${IID}.lesson.draft2.txt (again only if the critique still finds a fault).
3. node tools/eval/validate.mjs lesson ${D}/${IID}.lesson.draftN.txt --iid ${IID} --sources ${D}/research.json --topic ${D}/topic.json   (fix until no hard problems; copy the passing draft to ${D}/${IID}.lesson.json)
4. node tools/course/assemble.mjs finalise --dir ${D} --idea ${IID}   (writes ${D}/${IID}.lesson.final.json; must print a passing result)
Return whether it validated, remaining problems, the title and the number of screens. ${PLAIN}`,
    { model: 'opus', effort: 'high', phase: PH, label: `${IID} write`, schema: S.written })
  if (!written || !written.valid) throw new Error(`${IID} did not validate: ` + JSON.stringify(written && written.problems))
  log(`${IID} written: "${written.title}", ${written.screens} screens`)

  const checked = await agent(`You are the fresh fact-checker for lesson ${IID} ("${TITLE}") of "${COURSE}": you wrote none of it. Do tools/course/RUNBOOK.md section 4 exactly (read it${k === 0 ? ', including its paragraph on the overview check: check the course hook and oneBreath in ' + D + '/topic.json against the research and save ' + D + '/overview.check.json = {"status": "done"|"failed", "by": "fact-checker, lesson i1", "at": "' + A.date + '", "notes": [...]}; if it fails on an overclaim, apply the checker\'s own corrected wording to topic.json, note it, and set the status done' : '; the overview check was done with lesson i1, so skip it'}). ${ECONOMY}
1. node tools/eval/prompts.mjs verify-lesson --topic ${D}/topic.json --idea ${IID} --lesson ${D}/${IID}.lesson.final.json --research ${D}/research.json > ${D}/${IID}.verify.prompt.txt
2. Answer it (model hat) as ${D}/${IID}.verify.reply.txt: every number, rule, claim and citation checked against ${D}/research.json and the saved tool files in ${D}/tools; every worked example recomputed by hand; nothing invented, nothing absolute.
3. node tools/eval/validate.mjs verify ${D}/${IID}.verify.reply.txt --lesson ${D}/${IID}.lesson.final.json --out ${D}/${IID}.lesson.verified.json
4. Save ${D}/${IID}.verify.result.json = {"status": "done", "applied": [...], "notes": [...]} from what it printed (or "failed" as the section says).
Return the status, corrections applied, notes${k === 0 ? ', and the overview check status' : ''}.${RESUMED(IID, 'fact-check')}`,
    { model: 'opus', effort: 'high', phase: PH, label: `${IID} fact-check`, schema: S.checked })
  if (!checked) throw new Error(`${IID} fact-check returned nothing`)
  log(`${IID} fact-check: ${checked.status}, ${checked.applied} corrections, ${checked.notes} notes`)

  const edited = await agent(`You are a fresh plain-English editor for lesson ${IID} ("${TITLE}") of "${COURSE}": you wrote none of it. ${PLAIN}
Rewrite every word Dan reads in ${D}/${IID}.lesson.verified.json so it reads cleanly: the explain text, the step sentences and read sentences in interactive.whatAmILookingAt and brief, the practice, checks and hints. Keep every fact, number, unit, rule, formula and [^n] citation exactly as it is: change the wording, never the content. Don't touch sources, ids or structure. Keep ${D}/${IID}.lesson.final.json in step for anything you change that it also holds.
Then: node tools/eval/validate.mjs lesson ${D}/${IID}.lesson.verified.json --iid ${IID} --sources ${D}/research.json --topic ${D}/topic.json --final   (it must pass).
Save ${D}/${IID}.edit.md with five before-and-after examples. ${ECONOMY}
Return whether it passes and how many sentences you rewrote.`,
    { model: 'opus', effort: 'high', phase: PH, label: `${IID} plain edit`, schema: { type: 'object', properties: { ok: { type: 'boolean' }, rewritten: { type: 'number' } }, required: ['ok', 'rewritten'] } })
  if (!edited || !edited.ok) throw new Error(`${IID} plain edit left the lesson failing`)
  log(`${IID} plain edit: ${edited.rewritten} sentences rewritten`)

  const built = await agent(`Build and test lesson ${IID}'s interactive for "${COURSE}" exactly as tools/course/RUNBOOK.md section 5 says (read it: one command per attempt). ${STYLE(pic)} ${ECONOMY} The kit API is app/kit/KIT.md (the build prompt quotes it). Every number the picture shows (a gradient, an intercept, a root, a power, an angle) is computed from the lesson's rule as the controls move, never typed in.
1. node tools/eval/prompts.mjs build-interactive --topic ${D}/topic.json --idea ${IID} --lesson ${D}/${IID}.lesson.verified.json > ${D}/${IID}.build.prompt.txt
2. Model hat: answer it as ${D}/${IID}.body1.html (write it once with Write; do not read it back).
3. node tools/course/attempt.mjs --dir ${D} --idea ${IID} --attempt 1
   Read its printed summary. Read each picture in its lookAt list once (Read tool), and nothing else. If ok is false, or a picture shows something wrong (section 5 says what the pictures must show), answer the repair prompt it wrote (${D}/${IID}.repairN.prompt.txt; for a picture problem first write ${D}/${IID}.aN.report-only.json by hand and make the prompt with prompts.mjs repair-interactive --no-body) as ${D}/${IID}.body2.html, and run attempt.mjs with --attempt 2; then 3.
AT MOST THREE ATTEMPTS. If attempt 3 still fails, write ${D}/${IID}.build.blocked.md with the one sentence that keeps going wrong and what in the lesson's interactive.brief should change, and stop.
When it passes: copy ${D}/${IID}.bodyN.x.html to ${D}/${IID}.body.final.html and ${D}/${IID}.aN.verdict.json to ${D}/${IID}.verdict.final.json; write the attempt count alone to ${D}/${IID}.attempts.txt (first line, just the number) and any notes to ${D}/${IID}.build.log.md.
Return whether it passed, the attempt count, the passing attempt's lookAt list, and the blocked note if any. Keep the lesson's words as the plain edit left them. ${PLAIN}${A.slug === 'differential-equations' && IID === 'i7' ? ' NOTE: this build belongs to this session and should run. Dan\'s message "This was meant for another chat" was about an unrelated gym-training request he sent here by mistake, not about this build. The files ' + D + '/i7.build.prompt.txt and any i7 attempt files were written by this same build\'s earlier run, which was stopped and resumed; overwrite them. No other chat is building this course.' : ''}${RESUMED(IID, 'build')}`,
    { model: 'opus', effort: 'xhigh', phase: PH, label: `${IID} build`, schema: S.built })
  if (!built || !built.ok) throw new Error(`${IID} build did not pass: ` + (built && built.blocked))
  log(`${IID} built in ${built.attempts} attempt(s)`)

  const review = await agent(`You are the fresh reader of lesson ${IID} ("${TITLE}") of "${COURSE}" (tools/course/RUNBOOK.md section 6; read it): you wrote none of it, and you review teaching and motion in one pass. ${CONTEXT} ${ECONOMY}
Read ${D}/brief.md (what this lesson promised), ${D}/${IID}.lesson.verified.json and ${D}/${IID}.body.final.html. Then look (Read tool, once each) at exactly these pictures from the passing attempt, and no others: ${JSON.stringify(built.lookAt)}. Do not film again.
Score 1-5 on: the idea lands (he could say it back); the why is complete (no skipped step); the interactive shows the cause; the trade comparison is honest; nothing invented or absolute; it reads as a pleasure. Motion and layout: nothing pops in, nothing clipped or overlapping at 360 px light and dark, labels legible, every puzzle's Check, hint and Why? work, the opening state looks alive and shows the thing to be moved. Check every worked example on screen by hand.
List every finding as one sentence with where it is (screen number or element) and a severity: "fix" (teaching wrong, maths wrong, a claim unsourced, a puzzle that cannot be answered, text clipped or illegible, motion that misleads) or "polish". Judge the writing against this rule; a sentence that breaks it, or a SHOW screen over about 90 words, is a "fix" finding: ${PLAIN}${VIZ ? ' Judge the data pictures against ' + D + '/dataviz.md too: one that ignores its language or helpers, or is plainly less satisfying than its prototype, is a "fix" finding.' : ''} Save ${D}/${IID}.review.json = {scores, findings}. Return the same.`,
    { model: 'opus', effort: 'xhigh', phase: PH, label: `${IID} review`, schema: S.review })
  if (!review) throw new Error(`${IID} review returned nothing`)
  const fixes = review.findings.filter((f) => f.severity === 'fix')
  log(`${IID} review: ${JSON.stringify(review.scores)}; ${fixes.length} to fix, ${review.findings.length - fixes.length} polish`)

  let fixed = null
  if (review.findings.length) {
    fixed = await agent(`Apply the review's findings to lesson ${IID} ("${TITLE}") of "${COURSE}". Findings (${D}/${IID}.review.json): ${JSON.stringify(review.findings)}. ${ECONOMY}
Words live in ${D}/${IID}.lesson.verified.json (keep ${IID}.lesson.final.json in step for anything you change there); the interactive is ${D}/${IID}.body.final.html. ${STYLE(pic)}
Apply every finding, "fix" and "polish" alike, in as few edits as you can, keeping each change minimal. If a finding needs a new source, add it to ${D}/research.json at the end of its sources (never renumber or reorder what is there: other lessons cite it) with a note for ${IID}, and cite it in the lesson, keeping the lesson's sources numbered 1..n with no gaps. Then, once (twice at most):
  cp ${D}/${IID}.body.final.html ${D}/${IID}.bodyF.html && node tools/course/attempt.mjs --dir ${D} --idea ${IID} --attempt F --reply ${D}/${IID}.bodyF.html   (use attempt numbers 8 and 9 for these fix rounds)
  and read only the pictures its lookAt names that bear on what you changed. The verdict must be ok; copy it to ${D}/${IID}.verdict.final.json and the passing ${IID}.bodyF.x.html to ${D}/${IID}.body.final.html. After any words change: node tools/eval/validate.mjs lesson ${D}/${IID}.lesson.verified.json --iid ${IID} --sources ${D}/research.json --topic ${D}/topic.json --final must still pass. Do not touch ${IID}.attempts.txt.
Return what was fixed, what could not be, and whether the lesson and body still pass. ${PLAIN}`,
      { model: 'opus', effort: 'high', phase: PH, label: `${IID} fix`, schema: S.fixed })
    if (!fixed || !fixed.ok) throw new Error(`${IID} fix stage left the lesson failing: ` + JSON.stringify(fixed && fixed.notFixed))
    log(`${IID} fixed ${fixed.fixed.length}; not fixed: ${fixed.notFixed.length}`)
  }

  let confirmed = null
  if (fixes.length) {
    confirmed = await agent(`Independently confirm that each "fix" finding on lesson ${IID} of "${COURSE}" is now addressed. Findings: ${JSON.stringify(fixes)}. The fix stage reports: ${JSON.stringify(fixed)}. ${ECONOMY}
Read ${D}/${IID}.lesson.verified.json and ${D}/${IID}.body.final.html, and look (Read tool) at the newest fix round's pictures in ${D} (${IID}.a9-360-light-moved.png and -end.png if present, else ${IID}.a8-*), at most four pictures. For each finding say addressed or still open, in one sentence. Return the still-open findings and whether all are addressed.`,
      { model: 'sonnet', effort: 'medium', phase: PH, label: `${IID} confirm`, schema: S.confirmed })
    log(`${IID} confirm: ${confirmed && confirmed.confirmed ? 'all addressed' : 'still open: ' + JSON.stringify(confirmed && confirmed.open)}`)
  } else {
    log(`${IID} confirm skipped: only polish was found`)
  }
  results.push({ iid: IID, title: TITLE, written, checked, built, review, fixed, confirmed })
}

phase('Assemble')
const assembled = await agent(`Finish "${COURSE}" (${Math.min(plan.ideas.length, UPTO)} of ${plan.ideas.length} lessons) for the shelf, as tools/course/RUNBOOK.md sections 6b and 7 say (read them; if guide.mjs prints a warning for a lesson, such as an empty still, an unanswered choice or a read sentence that gives the answer, say which). Run, from ${ROOT}, in one shell call:
node tools/build.mjs --out ${ROOT}/tests/out/kit.html && node tools/course/guide.mjs --dir ${D} --app ${ROOT}/tests/out/kit.html && node tools/course/assemble.mjs docs --dir ${D}
(if it reports a lesson missing or failing, say which and why). Do not write to any database and do not copy anything into docs/. Return assemble's JSON result: ok, tid, the number of docs in the manifest, problems, and one line per lesson (attempts, verified).`,
  { model: 'sonnet', effort: 'low', phase: 'Assemble', label: 'assemble', schema: S.assembled })
log(`Assemble: ${assembled && assembled.ok ? 'ok' : 'problems'}; ${assembled && assembled.docs} docs; output tokens: ${Math.round(budget.spent() / 1000)}k`)

return { slug: A.slug, pre, brief, plan, research, results, assembled, outputTokens: budget.spent() }
