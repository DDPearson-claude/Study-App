#!/usr/bin/env node
// Validates a model reply with the app's own validators.
//   node tools/eval/validate.mjs plan    reply.json
//   node tools/eval/validate.mjs lesson  reply.json --iid i1 [--sources research.json]
//   node tools/eval/validate.mjs grade   reply.json [--attempt 1]
// Prints {ok, problems, soft} and exits 1 when there are problems. soft: the length problems
// (and a plan's calibration answer printed above its question) among them (docs/ARCHITECTURE.md
// section 5); after its one repair the app accepts a reply whose only problems are soft. Replies may contain prose or fences around the JSON; they are parsed
// the way the app parses them (U.parseJson).
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { loadPrompts } from './prompts.mjs';

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
let obj, problems;
try {
  obj = U.parseJson(text);
  const opts = {};
  if (kind === 'lesson') {
    opts.iid = arg('iid');
    // The lesson's own sources, numbered from 1 for this idea, as the app hands them over.
    // --topic gives the idea's deps, whose research comes along as the app passes it.
    const topic = arg('topic') ? JSON.parse(readFileSync(arg('topic'), 'utf8')) : null;
    const idea = topic && (topic.ideas || []).find((i) => i.id === opts.iid);
    if (arg('sources')) { const lr = U.prompts.lessonResearch(JSON.parse(readFileSync(arg('sources'), 'utf8')), opts.iid, idea && idea.deps); opts.sources = lr && lr.sources.length ? lr.sources : null; }
  }
  if (kind === 'grade') opts.attempt = Number(arg('attempt', '1'));
  problems = U.validate[kind](obj, opts);
} catch (e) {
  problems = ['could not parse: ' + (e.message || e)];
}
console.log(JSON.stringify({ ok: problems.length === 0, problems, soft: Array.from(problems.soft || []) }, null, 2));
process.exit(problems.length ? 1 : 0);
