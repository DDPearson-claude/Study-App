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
//   node tools/course/assemble.mjs docs --dir build/maths/fractions [--tid fractions-ab12c]
//       Reads topic.json, research.json and, for every idea, <iid>.lesson.verified.json (else
//       .lesson.final.json), <iid>.verify.result.json, <iid>.body.final.html, <iid>.verdict.final.json
//       and <iid>.attempts.txt, and writes <dir>/out/: topic.json, research-topic.json,
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

function finalise(iid) {
  const idea = (topic.ideas || []).find((i) => i.id === iid);
  if (!idea) throw new Error('no idea ' + iid + ' in topic.json');
  const raw = lessonOf(read(join(dir, iid + '.lesson.json')));
  const lr = research ? U.prompts.lessonResearch(research, iid, idea.deps, topic.ideas) : null;
  const lesson = U.gen._finaliseLesson(raw, iid, lr, mode);
  const v = U.validate.lesson(lesson, { iid, sources: lr && lr.sources.length ? lr.sources : null, final: true, mode, kind: idea.kind });
  const problems = (v && v.problems) || [];
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
  const summary = [];
  ids.forEach((iid) => {
    const idea = topic.ideas.find((i) => i.id === iid);
    const vf = join(dir, iid + '.lesson.verified.json'), ff = join(dir, iid + '.lesson.final.json');
    if (!existsSync(vf) && !existsSync(ff)) { problems.push(iid + ': no lesson (expected ' + vf + ' or ' + ff + ')'); return; }
    const lesson = lessonOf(read(existsSync(vf) ? vf : ff));
    const lr = research ? U.prompts.lessonResearch(research, iid, idea.deps, topic.ideas) : null;
    const v = U.validate.lesson(lesson, { iid, sources: lr && lr.sources.length ? lr.sources : null, final: true, mode, kind: idea.kind });
    const hard = U.validate.hard((v && v.problems) || []);
    if (hard.length) { problems.push(iid + ': ' + hard.join(' | ')); return; }
    if (lesson.mode !== mode) { problems.push(iid + ': lesson.mode is ' + lesson.mode + ', the course is ' + mode + ' (run finalise)'); return; }
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
      const attempts = existsSync(join(dir, iid + '.attempts.txt')) ? Number(readFileSync(join(dir, iid + '.attempts.txt'), 'utf8').trim()) || 1 : 1;
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
    summary.push({ iid, title: lesson.title, sources: (lesson.sources || []).length, interactive: !!interactive, attempts: interactive ? interactive.attempts : 0, verified: verified.status, soft: Array.from(((v && v.problems) || {}).soft || []) });
  });

  // The topic doc, as createTopic + the plan + research leave it.
  const plan = {};
  ['title', 'hook', 'oneBreath', 'ideas', 'calibration'].forEach((k) => { plan[k] = topic[k]; });
  const topicDoc = {
    id: tid, title: plan.title, query: topic.query || plan.title, createdAt: now, updatedAt: now, plannedAt: now,
    status: 'ready', error: null, hook: plan.hook, oneBreath: plan.oneBreath,
    level: topic.level || 'new', hue: U.hash(plan.title) % 360, mode, intake: topic.intake || null,
    ideas: plan.ideas, calibration: plan.calibration,
    research: research
      ? { status: 'done', at: now, sources: allSources.length, dropped: 0, error: null, reason: null, tries: 0 }
      : { status: 'failed', at: now, sources: 0, error: null, reason: 'none_confirmed', tries: 1 },
  };
  const pv = U.validate.plan(plan);
  if (pv && pv.problems && U.validate.hard(pv.problems).length) problems.push('plan: ' + U.validate.hard(pv.problems).join(' | '));
  writeFileSync(join(out, 'topic.json'), JSON.stringify(topicDoc, null, 1) + '\n');
  manifest.unshift({ collection: 'topics', doc_id: tid, file: join(out, 'topic.json') });
  writeFileSync(join(out, 'manifest.json'), JSON.stringify({ tid, docs: manifest }, null, 2) + '\n');
  console.log(JSON.stringify({ ok: problems.length === 0, tid, problems, docs: manifest.length, lessons: summary }, null, 2));
  process.exit(problems.length ? 1 : 0);
}

console.error('unknown command ' + cmd);
process.exit(2);
