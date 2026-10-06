#!/usr/bin/env node
// Validates a model reply with the app's own validators.
//   node tools/eval/validate.mjs plan    reply.json
//   node tools/eval/validate.mjs lesson  reply.json --iid i1 [--sources research.json --topic topic.json]
//   node tools/eval/validate.mjs grade   reply.json [--attempt 1]
//   node tools/eval/validate.mjs verify  reply.json --lesson lesson.json [--out lesson.verified.json]
//     the fact-check's reply (TASK: verify-lesson) against the lesson it checked (the lesson JSON or a
//     saved lesson doc); also prints what U.verify.apply would change (applied) and record (notes),
//     and with --out writes the lesson with every fix applied (what the app saves), unless a hard
//     problem is left (the app would then save the lesson as written, verified.status 'failed').
// Prints {ok, problems, soft, warnings} and exits 1 when there are problems. soft: the length
// problems and the word-matching judgements among them (a plan's calibration answer printed on
// its page; a lesson's check answer printed in its text, a right option echoing its wording or
// standing out by length, a rubric point its prompt gives away, an uncited source: see
// docs/ARCHITECTURE.md section 5); after its one repair the app accepts a reply whose only
// problems are soft. warnings: advice that is never a problem (a lesson whose interactive could
// carry a target check but has none; with --topic, only for a kind that can have one). Replies may
// contain prose or fences around the JSON; the answer is picked the way the app picks it
// (U.parseJson.pick: the last JSON value in the reply that passes the validator).
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { writeFileSync } from 'node:fs';
import { loadPrompts, lessonOf } from './prompts.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
function arg(name, dflt) { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : dflt; }

const U = loadPrompts();
// U.parseJson lives in 10-runtime.js; load just that function's file into the same context.
if (!U.parseJson) {
  const ctx = vm.createContext({ window: { U }, U, console, setTimeout, Promise, JSON, Math, Date });
  ctx.window = ctx; ctx.U = U;
  vm.runInContext(readFileSync(join(root, 'app/src/js/10-runtime.js'), 'utf8'), ctx);
}
const kind = process.argv[2];
const text = readFileSync(process.argv[3], 'utf8');
let problems, warnings = [], verified = null;
try {
  const opts = {};
  if (kind === 'verify') {
    if (!arg('lesson')) throw new Error('verify needs --lesson (the lesson it checked)');
    opts.lesson = lessonOf(JSON.parse(readFileSync(arg('lesson'), 'utf8')));
  }
  if (kind === 'lesson') {
    opts.iid = arg('iid');
    // The lesson's own sources, numbered from 1 for this idea, as the write-lesson prompt numbers
    // them. --topic gives the idea's deps, whose research comes along, and the course's ideas, so
    // the notes it borrows from other ideas (U.prompts.lessonResearch) are numbered the same way.
    const topic = arg('topic') ? JSON.parse(readFileSync(arg('topic'), 'utf8')) : null;
    const idea = topic && (topic.ideas || []).find((i) => i.id === opts.iid);
    // The idea's kind: no target-check advice for a kind write-lesson offers none (history, structure, concept).
    if (idea) opts.kind = idea.kind;
    if (arg('sources')) {
      if (!topic) console.error('warning: no --topic, so the sources are numbered without the notes borrowed from other ideas; pass --topic as for the prompt.');
      const lr = U.prompts.lessonResearch(JSON.parse(readFileSync(arg('sources'), 'utf8')), opts.iid, idea && idea.deps, topic && topic.ideas);
      opts.sources = lr && lr.sources.length ? lr.sources : null;
    }
  }
  if (kind === 'grade') opts.attempt = Number(arg('attempt', '1'));
  const got = U.parseJson.pick(text, (o) => U.validate[kind](o, opts));
  problems = got.problems || [];
  // The advice for the reply the app would keep (its warnings ride on the validator's list).
  if (got.value !== undefined) warnings = Array.from(U.validate[kind](got.value, opts).warnings || []);
  if (kind === 'verify' && got.value !== undefined) {
    const r = U.verify.apply(opts.lesson, got.value);
    verified = { applied: r.applied, notes: r.notes };
    // Only a reply the app would keep (after its one repair it accepts one whose problems are all soft).
    if (arg('out') && !U.validate.hard(problems).length) writeFileSync(arg('out'), JSON.stringify(r.lesson, null, 2) + '\n');
  }
} catch (e) {
  problems = ['could not parse: ' + (e.message || e)];
}
console.log(JSON.stringify({ ok: problems.length === 0, problems, soft: Array.from(problems.soft || []), warnings, ...(verified ? JSON.parse(JSON.stringify(verified)) : {}) }, null, 2));
process.exit(problems.length ? 1 : 0);
