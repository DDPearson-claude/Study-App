#!/usr/bin/env node
// Prints the exact prompt the app would send for one generation step, so evals can run the
// app's real prompts through Claude outside the page.
//
//   node tools/eval/prompts.mjs plan-topic   --query "how tides work" [--level new]
//   node tools/eval/prompts.mjs write-lesson --topic topic.json --idea i2 [--research research.json] [--prior i1.lesson.json,...]
//   node tools/eval/prompts.mjs verify-lesson --topic topic.json --idea i2 --lesson lesson.json [--research research.json]
//   node tools/eval/prompts.mjs build-interactive --topic topic.json --idea i2 --lesson lesson.json
//   node tools/eval/prompts.mjs repair-interactive --topic t.json --idea i2 --lesson l.json --html body.html --report report.json
//   node tools/eval/prompts.mjs grade --lesson lesson.json --answer "..." [--attempt 1]
//   node tools/eval/prompts.mjs verdict --lesson lesson.json --html body.html --report a1-report.json [--app tests/out/kit.html]
//
// topic.json is the plan plus the topic's "query" and "level" (as the app stores it); --level
// fills in a missing level. --prior takes the earlier lessons of the topic (in order) and passes
// them through U.prompts.priorSummary, exactly as the app does. `verify-lesson` is the fact-check
// the app runs on a written lesson (34-verify.js); --lesson takes the lesson JSON or a saved lesson
// doc ({status, lesson, …}), and --research the same research as write-lesson. `verdict` adds to a render.mjs
// self-test report what the app's builder checks on top (the lesson's ids, web addresses other
// than the lesson's sources, and, in the browser, whether each target check can be reached) and
// prints {ok, reachChecked, problems, report}; give that `report` to repair-interactive.
//
// Loads app/src/js/00-core.js, 30-prompts.js, 33-interactive.js and 34-verify.js into a VM, with the build's
// placeholders filled in the same way tools/build.mjs fills them.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const app = join(root, 'app');

export function loadPrompts() {
  const read = (p) => readFileSync(p, 'utf8');
  const kitDir = join(app, 'kit');
  const examples = existsSync(join(kitDir, 'examples'))
    ? readdirSync(join(kitDir, 'examples')).filter((f) => f.endsWith('.html')).sort().map((f) => {
      const body = read(join(kitDir, 'examples', f));
      const m = body.match(/<!--\s*kind:\s*([a-z-]+)\s*-->/i);
      return { name: f.replace(/\.html$/, ''), kind: m ? m[1] : 'concept', body };
    })
    : [];
  const fill = (src) => src
    .split('"@@KIT_JS@@"').join(JSON.stringify(existsSync(join(kitDir, 'kit.js')) ? read(join(kitDir, 'kit.js')) : ''))
    .split('"@@KIT_CSS@@"').join(JSON.stringify(existsSync(join(kitDir, 'kit.css')) ? read(join(kitDir, 'kit.css')) : ''))
    .split('"@@KIT_MD@@"').join(JSON.stringify(existsSync(join(kitDir, 'KIT.md')) ? read(join(kitDir, 'KIT.md')) : ''))
    .split('"@@KIT_EXAMPLES@@"').join(JSON.stringify(examples))
    .split('"@@BUILD@@"').join('"eval"');
  const ctx = { console, setTimeout, clearTimeout, Promise, Date, Math, JSON };
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const f of ['00-core.js', '30-prompts.js', '33-interactive.js', '34-verify.js']) {
    const p = join(app, 'src', 'js', f);
    if (existsSync(p)) vm.runInContext(fill(read(p)), ctx, { filename: f });
  }
  return ctx.U;
}

function arg(name, dflt) { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : dflt; }
function json(name) { const p = arg(name); return p ? JSON.parse(readFileSync(p, 'utf8')) : null; }
// A lesson, given as the lesson JSON itself or as a saved lesson doc ({status, lesson, …}).
export function lessonOf(x) { return x && x.lesson && typeof x.lesson === 'object' && !Array.isArray(x.lesson) && 'status' in x ? x.lesson : x; }

// In the browser: which target checks the body can't reach (needs U.sandbox.reach from the kit host).
async function unreachable(lesson, html, appFile) {
  const { openApp } = await import('../harness/page.mjs');
  const page = await openApp({ width: 360, height: 800, file: appFile });
  try {
    await page.page.goto(page.url('#/'));
    return await page.page.evaluate(async ([l, h]) => {
      await U.rt.ready;
      const available = !!(U.sandbox && typeof U.sandbox.reach === 'function');
      return { available, unreachable: available ? await U.interactive.unreachable(h, l) : [] };
    }, [lesson, html]);
  } finally { await page.close(); }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const U = loadPrompts();
  const step = process.argv[2];
  const topic = json('topic');
  if (topic && !topic.level) {
    if (arg('level')) topic.level = arg('level');
    else if (step === 'write-lesson' || step === 'build-interactive') console.error('warning: topic.json has no "level", so the prompt says NEW. Keep "level" in topic.json (or pass --level).');
  }
  const idea = topic && arg('idea') ? topic.ideas.find((i) => i.id === arg('idea')) : null;
  const prior = arg('prior') ? U.prompts.priorSummary(arg('prior').split(',').filter(Boolean).map((p) => JSON.parse(readFileSync(p.trim(), 'utf8')))) : [];
  let out;
  switch (step) {
    case 'plan-topic': out = U.prompts.planTopic(arg('query'), { level: arg('level', 'new'), known: [] }); break;
    case 'research': out = U.prompts.research(topic, { ideas: topic.ideas }); break;
    case 'write-lesson': out = U.prompts.writeLesson(topic, idea, { research: json('research'), known: [], prior }); break;
    case 'verify-lesson': out = U.prompts.verifyLesson(topic, idea, lessonOf(json('lesson')), { research: json('research') }); break;
    case 'build-interactive': out = U.interactive.prompt(topic, idea, json('lesson'), {}); break;
    case 'repair-interactive': out = U.interactive.repairPrompt(topic, idea, json('lesson'), readFileSync(arg('html'), 'utf8'), json('report')); break;
    case 'grade': out = U.prompts.grade(json('lesson').say, arg('answer'), { attempt: Number(arg('attempt', '1')) }); break;
    case 'verdict': {
      const lesson = json('lesson'), html = readFileSync(arg('html'), 'utf8');
      let report = json('report') || {};
      if (report.report) report = report.report; // render.mjs writes {report, shots}
      const r = await unreachable(lesson, html, resolve(arg('app', join(root, 'tests', 'out', 'kit.html'))));
      report = { ...report, foreign: U.interactive.foreignUrls(html, lesson, report), unreachable: r.unreachable };
      const problems = U.interactive.problems(report, lesson, html);
      out = JSON.stringify({ ok: !!report.ok && !problems.length, reachChecked: r.available, problems, report }, null, 2) + '\n';
      break;
    }
    default: console.error('unknown step ' + step); process.exit(2);
  }
  process.stdout.write(out);
}
