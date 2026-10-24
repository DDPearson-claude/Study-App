#!/usr/bin/env node
// Turns a pre-built course's build folder into the exact db documents the app reads, so a Claude
// Code session can write them with the ArtifactData tool (see tools/course/RUNBOOK.md).
//
//   node tools/course/assemble.mjs finalise --dir build/maths/fractions --idea i3
//       Finalises the written lesson (<dir>/i3.lesson.json, the validated reply) the way the app
//       does before it fact-checks and saves it (U.gen._finaliseLesson: sources renumbered in order
//       of first citation against the idea's own research numbering, read mode's predict/say/checks
//       dropped, mode stamped) and writes <dir>/i3.lesson.final.json. Prints the validator's result.
//
//   node tools/course/assemble.mjs docs --dir build/maths/fractions [--tid fractions-ab12c] [--partial]
//       --partial: lessons not built yet are left out (listed as missing) instead of failing; the app
//       shows them as Coming soon for a ready-made topic. <dir>/shelf.json ({shelf, course}) marks
//       the topic readyMade.
//       Reads topic.json, research.json and, for every idea, <iid>.lesson.verified.json (else
//       .lesson.final.json), <iid>.verify.result.json, <iid>.body.final.html, <iid>.verdict.final.json
//       and <iid>.attempts.txt (and <iid>.guide.json, the dossier's still guide, when there is one),
//       plus overview.check.json (the hook and In one breath checked: the topic gets overviewChecked), and
//       case.json for a refresher course (the case file every lesson's page reads: checked with
//       U.validate.caseFile and written as topics/{tid}/case/file), and
//       writes <dir>/out/: topic.json, research-topic.json,
//       research-<iid>.json, lesson-<iid>.json and manifest.json (collection, doc_id, file per
//       document). The tid is read from <dir>/tid.txt, or made (U.slug(query) + '-' + 5 random
//       characters) and saved there. Fails when any lesson does not pass the app's final validation.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
function arg(name, dflt) { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : dflt; }

// The app's core, runtime, prompts, generator and fact-check, as tools/eval/sources.mjs loads them.
function load() {
  const noop = () => {};
  const ctx = { console: { log: noop, warn: noop, error: console.error }, setTimeout, clearTimeout, Promise, Date, Math, JSON, URL };
  ctx.window = ctx;
  ctx.addEventListener = noop;
  vm.createContext(ctx);
  for (const f of ['00-core.js', '10-runtime.js', '30-prompts.js', '31-generate.js', '34-verify.js']) {
    vm.runInContext(readFileSync(join(root, 'app', 'src', 'js', f), 'utf8'), ctx, { filename: f });
  }
  return ctx.U;
}
const U = load();
const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const lessonOf = (x) => x && x.lesson && typeof x.lesson === 'object' && 'status' in x ? x.lesson : x;

const cmd = process.argv[2];
const dir = arg('dir');
if (!cmd || !dir) { console.error('usage: assemble.mjs finalise|docs --dir <build dir> [--idea iN] [--tid tid]'); process.exit(2); }
const topic = read(join(dir, 'topic.json'));
const research = existsSync(join(dir, 'research.json')) ? read(join(dir, 'research.json')) : null;
const mode = U.prompts.modeOf(topic.mode);
// The validators return a list of problems (with .soft); an older caller read .problems off it.
const listOf = (v) => (Array.isArray(v) ? v : (v && v.problems) || []);
// A refresher course's case file (RUNBOOK section 8): givens, assumptions and the figures each
// lesson works out, one doc every lesson's page reads.
const caseFile = existsSync(join(dir, 'case.json')) ? read(join(dir, 'case.json')) : null;

function finalise(iid) {
  const idea = (topic.ideas || []).find((i) => i.id === iid);
  if (!idea) throw new Error('no idea ' + iid + ' in topic.json');
  const raw = lessonOf(read(join(dir, iid + '.lesson.json')));
  const lr = research ? U.prompts.lessonResearch(research, iid, idea.deps, topic.ideas) : null;
  const lesson = U.gen._finaliseLesson(raw, iid, lr, mode);
  const v = U.validate.lesson(lesson, { iid, sources: lr && lr.sources.length ? lr.sources : null, final: true, mode, kind: idea.kind, caseFile });
  const problems = listOf(v);
  return { lesson, problems, soft: Array.from(problems.soft || []), warnings: Array.from((v && v.warnings) || []) };
}

if (cmd === 'finalise') {
  const iid = arg('idea');
  const r = finalise(iid);
  writeFileSync(join(dir, iid + '.lesson.final.json'), JSON.stringify(r.lesson, null, 2) + '\n');
  console.log(JSON.stringify({ ok: r.problems.length === 0, problems: r.problems, soft: r.soft, warnings: r.warnings, file: join(dir, iid + '.lesson.final.json') }, null, 2));
  process.exit(U.validate.hard(r.problems).length ? 1 : 0);
}

if (cmd === 'docs') {
  const out = join(dir, 'out');
  mkdirSync(out, { recursive: true });
  let tid = arg('tid') || (existsSync(join(dir, 'tid.txt')) ? readFileSync(join(dir, 'tid.txt'), 'utf8').trim() : '');
  if (!tid) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let r = ''; for (let i = 0; i < 5; i++) r += chars[Math.floor(Math.random() * chars.length)];
    tid = U.slug(topic.query || topic.title) + '-' + r;
    writeFileSync(join(dir, 'tid.txt'), tid + '\n');
  }
  if (!U.validId(tid)) throw new Error('bad tid ' + tid);
  const now = U.now();
  const by = { device: 'claude-code', tab: 'course-build', page: 'course-build', holder: 'claude-code/course-build' };
  const manifest = [];
  const problems = [];

  // The research docs, as runResearch writes them: per key, its notes and the sources they cite.
  const ids = (topic.ideas || []).map((i) => i.id);
  const allSources = (research && research.sources) || [];
  function researchDoc(notes) {
    const used = {};
    (notes || []).forEach((n) => (n.sourceIds || []).forEach((i) => { used[i] = 1; }));
    return { notes: notes || [], sources: allSources.filter((s) => used[s.n]), at: now };
  }
  if (research) {
    const t = researchDoc(research.topic && research.topic.notes);
    writeFileSync(join(out, 'research-topic.json'), JSON.stringify(t, null, 2) + '\n');
    manifest.push({ collection: 'topics/' + tid + '/research', doc_id: 'topic', file: join(out, 'research-topic.json') });
    ids.forEach((iid) => {
      const d = researchDoc(research.ideas && research.ideas[iid] && research.ideas[iid].notes);
      if (!d.notes.length) return;
      writeFileSync(join(out, 'research-' + iid + '.json'), JSON.stringify(d, null, 2) + '\n');
      manifest.push({ collection: 'topics/' + tid + '/research', doc_id: iid, file: join(out, 'research-' + iid + '.json') });
    });
  }

  // The lesson docs, whole: ready, with the checked lesson and the tested interactive (or the note).
  // Every course built here is a ready-made shelf course: without <dir>/shelf.json the topic is not
  // marked readyMade, so the app would write or rebuild its lessons in the page (the Algebra folder's
  // eight courses went live that way on 17-18 Oct). Never assemble one without it.
  if (!existsSync(join(dir, 'shelf.json'))) problems.push('no ' + join(dir, 'shelf.json') + ': write {"shelf": "<shelf id>", "course": "<course id>"} so the topic is marked readyMade');
  const summary = [], missing = [], formats = {}, guideVs = [];
  ids.forEach((iid) => {
    const idea = topic.ideas.find((i) => i.id === iid);
    const vf = join(dir, iid + '.lesson.verified.json'), ff = join(dir, iid + '.lesson.final.json');
    if (!existsSync(vf) && !existsSync(ff)) { if (process.argv.includes('--partial')) { missing.push(iid); return; } problems.push(iid + ': no lesson (expected ' + vf + ' or ' + ff + ')'); return; }
    const lesson = lessonOf(read(existsSync(vf) ? vf : ff));
    const lr = research ? U.prompts.lessonResearch(research, iid, idea.deps, topic.ideas) : null;
    const v = U.validate.lesson(lesson, { iid, sources: lr && lr.sources.length ? lr.sources : null, final: true, mode, kind: idea.kind, caseFile });
    const hard = U.validate.hard(listOf(v));
    if (hard.length) { problems.push(iid + ': ' + hard.join(' | ')); return; }
    if (lesson.mode !== mode) { problems.push(iid + ': lesson.mode is ' + lesson.mode + ', the course is ' + mode + ' (run finalise)'); return; }
    // A steps lesson that lost its format plays as a long reading lesson (Trigonometry 3-8 and Linear
    // systems 5-6, 18 Oct): a lesson with a still guide (only steps lessons get one) must say so, and
    // a course's lessons are all steps or none (checked after the loop).
    if (lesson.format !== 'steps' && existsSync(join(dir, iid + '.guide.json'))) { problems.push(iid + ': it has a still guide (a steps lesson) but lesson.format is not "steps", so the app would play it as a reading lesson; set it in ' + (existsSync(vf) ? vf : ff)); return; }
    formats[iid] = lesson.format === 'steps' ? 'steps' : 'reading';
    const vr = existsSync(join(dir, iid + '.verify.result.json')) ? read(join(dir, iid + '.verify.result.json')) : null;
    const verified = vr
      ? { status: vr.status || 'done', at: vr.at || now, applied: vr.applied || [], notes: vr.notes || [] }
      : { status: 'skipped', at: now, applied: [], notes: [] };
    let interactive = null, note = null;
    if (lesson.interactive) {
      const hf = join(dir, iid + '.body.final.html'), rf = join(dir, iid + '.verdict.final.json');
      if (!existsSync(hf)) { problems.push(iid + ': the lesson has an interactive brief but no ' + hf); return; }
      const html = readFileSync(hf, 'utf8');
      if (Buffer.byteLength(html, 'utf8') > 150 * 1024) { problems.push(iid + ': interactive body over 150 KB'); return; }
      const verdict = existsSync(rf) ? read(rf) : null;
      if (!verdict || verdict.ok !== true) { problems.push(iid + ': no passing verdict in ' + rf); return; }
      // A refresher lesson: its typed answers were graded by the self-test that passed (a verdict
      // from before the kit knew K.answer has none), and its written questions are on the page.
      const rep = verdict.report || verdict, answers = Array.isArray(rep.answers) ? rep.answers : [];
      if (/\bK\.answer\s*\(/.test(html) && (!answers.length || answers.some((a) => !a.ok))) { problems.push(iid + ': the page has typed answers (K.answer) that the passing verdict did not self-test, or that failed it: run attempt.mjs again'); return; }
      const missingW = Object.keys(lesson.written || {}).filter((w) => !(rep.written || []).includes(w));
      if (missingW.length) { problems.push(iid + ': lesson.written ' + missingW.join(', ') + ' never shown on the page (K.written), by the passing verdict'); return; }
      // The first line: "7", or "3 + 2" after a brief fix and a fresh count (RUNBOOK section 5), the
      // total either way. Anything after the first line is a builder's note and is not counted.
      const attempts = existsSync(join(dir, iid + '.attempts.txt')) ? ((readFileSync(join(dir, iid + '.attempts.txt'), 'utf8').split('\n')[0]).match(/\d+/g) || []).map(Number).reduce((a, b) => a + b, 0) || 1 : 1;
      interactive = { html, title: lesson.interactive.title || idea.title, brief: lesson.interactive.brief || '', selftest: verdict.report || verdict, attempts };
    } else {
      note = existsSync(join(dir, iid + '.note.txt')) ? readFileSync(join(dir, iid + '.note.txt'), 'utf8').trim() : 'This idea is taught without an interactive.';
    }
    const doc = {
      status: 'ready', updatedAt: now, startedAt: now, by,
      lesson, sourced: Array.isArray(lesson.sources) && lesson.sources.length > 0,
      interactive, note, avoid: null, feedback: null, request: null, verified, error: null, flags: {},
    };
    const text = JSON.stringify(doc, null, 1);
    if (Buffer.byteLength(text, 'utf8') > 250 * 1024) { problems.push(iid + ': lesson doc over 250 KB'); return; }
    writeFileSync(join(out, 'lesson-' + iid + '.json'), text + '\n');
    manifest.push({ collection: 'topics/' + tid + '/lessons', doc_id: iid, file: join(out, 'lesson-' + iid + '.json') });
    // The still guide for its dossier chapter (tools/course/guide.mjs), when the build made one. A
    // lesson with a summary card needs one whose first page is that card (the chapter opens on it).
    const gf = join(dir, iid + '.guide.json');
    if (lesson.summary && (!existsSync(gf) || (read(gf).pages || [])[0]?.kind !== 'summary')) { problems.push(iid + ': lesson.summary is not the first page of ' + gf + ': run guide.mjs --dir ' + dir + ' --idea ' + iid); return; }
    if (existsSync(gf)) {
      const g = readFileSync(gf, 'utf8').trim();
      if (Buffer.byteLength(g, 'utf8') > 250 * 1024) { problems.push(iid + ': guide over 250 KB'); return; }
      guideVs.push(Number(JSON.parse(g).v) || 1);
      writeFileSync(join(out, 'guide-' + iid + '.json'), g + '\n');
      manifest.push({ collection: 'topics/' + tid + '/guide', doc_id: iid, file: join(out, 'guide-' + iid + '.json') });
    }
    summary.push({ iid, title: lesson.title, sources: (lesson.sources || []).length, interactive: !!interactive, attempts: interactive ? interactive.attempts : 0, verified: verified.status, soft: Array.from(((v && v.problems) || {}).soft || []) });
  });

  // The case file (a refresher course): checked, then written beside the lessons that read it.
  if (caseFile) {
    const cp = U.validate.hard(listOf(U.validate.caseFile(caseFile)));
    if (cp.length) problems.push('case.json: ' + cp.join(' | '));
    else {
      const doc = { v: 1, ...caseFile, updatedAt: now };
      // Indented to read, compact when that is what keeps it under the db's limit (the store keeps
      // documents compact anyway, so the limit is on the compact size).
      let text = JSON.stringify(doc, null, 1);
      if (Buffer.byteLength(text, 'utf8') > 250 * 1024) text = JSON.stringify(doc);
      if (Buffer.byteLength(text, 'utf8') > 250 * 1024) problems.push('case.json over 250 KB, even written compact');
      else {
        writeFileSync(join(out, 'case.json'), text + '\n');
        manifest.push({ collection: 'topics/' + tid + '/case', doc_id: 'file', file: join(out, 'case.json') });
      }
    }
  }

  // The topic doc, as createTopic + the plan + research leave it.
  const plan = {};
  ['title', 'hook', 'oneBreath', 'ideas', 'calibration'].forEach((k) => { plan[k] = topic[k]; });
  const topicDoc = {
    id: tid, title: plan.title, query: topic.query || plan.title, createdAt: now, updatedAt: now, plannedAt: now,
    status: 'ready', error: null, hook: plan.hook, oneBreath: plan.oneBreath,
    level: topic.level || 'new', hue: U.hash(plan.title) % 360, mode, intake: topic.intake || null,
    ideas: plan.ideas, calibration: plan.calibration,
    readyMade: existsSync(join(dir, 'shelf.json')) ? read(join(dir, 'shelf.json')) : undefined,
    // The hook and In one breath, checked by a fresh reader against the research and the verified
    // lessons (RUNBOOK section 4, <dir>/overview.check.json): the topic page then says they were
    // checked instead of calling them Claude's unchecked overview.
    overviewChecked: existsSync(join(dir, 'overview.check.json')) && read(join(dir, 'overview.check.json')).status === 'done' ? true : undefined,
    // The oldest version among its lessons' guides (tools/course/guide.mjs), from 2: every worked
    // example says how it is asked, so the app makes puzzles from them (60-today.js mendPuzzles,
    // which reads no guide of a course without it). A newer version gives lessons already
    // finished their puzzles again (unchanged ones keep their schedule).
    guideV: guideVs.length && Math.min(...guideVs) >= 2 ? Math.min(...guideVs) : undefined,
    research: research
      ? { status: 'done', at: now, sources: allSources.length, dropped: 0, error: null, reason: null, tries: 0 }
      : { status: 'failed', at: now, sources: 0, error: null, reason: 'none_confirmed', tries: 1 },
  };
  // A ready-made course follows its approved brief, which may have more than the page's 8 ideas.
  const pv = U.validate.plan(plan, existsSync(join(dir, 'shelf.json')) ? { maxIdeas: 12 } : undefined);
  if (pv && pv.problems && U.validate.hard(pv.problems).length) problems.push('plan: ' + U.validate.hard(pv.problems).join(' | '));
  writeFileSync(join(out, 'topic.json'), JSON.stringify(topicDoc, null, 1) + '\n');
  manifest.unshift({ collection: 'topics', doc_id: tid, file: join(out, 'topic.json') });
  writeFileSync(join(out, 'manifest.json'), JSON.stringify({ tid, docs: manifest }, null, 2) + '\n');
  const kinds = Object.keys(formats).reduce((m, k) => { (m[formats[k]] = m[formats[k]] || []).push(k); return m; }, {});
  if (kinds.steps && kinds.reading) problems.push('mixed lesson formats: steps ' + kinds.steps.join(', ') + '; reading ' + kinds.reading.join(', ') + ' (a course is all steps lessons or none: RUNBOOK section 0, item 3)');
  console.log(JSON.stringify({ ok: problems.length === 0, tid, problems, missing, docs: manifest.length, lessons: summary }, null, 2));
  process.exit(problems.length ? 1 : 0);
}

console.error('unknown command ' + cmd);
process.exit(2);
