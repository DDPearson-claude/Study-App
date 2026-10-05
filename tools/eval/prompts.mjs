#!/usr/bin/env node
// Prints the exact prompt the app would send for one generation step, so evals can run the
// app's real prompts through Claude outside the page.
//
//   node tools/eval/prompts.mjs plan-topic   --query "how jet engines work" [--level new]
//   node tools/eval/prompts.mjs write-lesson --topic topic.json --idea i2 [--research research.json]
//   node tools/eval/prompts.mjs build-interactive --topic topic.json --idea i2 --lesson lesson.json
//   node tools/eval/prompts.mjs repair-interactive --topic t.json --idea i2 --lesson l.json --html body.html --report report.json
//   node tools/eval/prompts.mjs grade --lesson lesson.json --answer "..." [--attempt 1]
//
// Loads app/src/js/00-core.js, 30-prompts.js and 33-interactive.js into a VM, with the build's
// placeholders filled in the same way tools/build.mjs fills them.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
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
  for (const f of ['00-core.js', '30-prompts.js', '33-interactive.js']) {
    const p = join(app, 'src', 'js', f);
    if (existsSync(p)) vm.runInContext(fill(read(p)), ctx, { filename: f });
  }
  return ctx.U;
}

function arg(name, dflt) { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : dflt; }
function json(name) { const p = arg(name); return p ? JSON.parse(readFileSync(p, 'utf8')) : null; }

if (import.meta.url === `file://${process.argv[1]}`) {
  const U = loadPrompts();
  const step = process.argv[2];
  const topic = json('topic');
  const idea = topic && arg('idea') ? topic.ideas.find((i) => i.id === arg('idea')) : null;
  let out;
  switch (step) {
    case 'plan-topic': out = U.prompts.planTopic(arg('query'), { level: arg('level', 'new'), known: [] }); break;
    case 'research': out = U.prompts.research(topic, { ideas: topic.ideas }); break;
    case 'write-lesson': out = U.prompts.writeLesson(topic, idea, { research: json('research'), known: [] }); break;
    case 'build-interactive': out = U.interactive.prompt(topic, idea, json('lesson'), {}); break;
    case 'repair-interactive': out = U.interactive.repairPrompt(topic, idea, json('lesson'), readFileSync(arg('html'), 'utf8'), json('report')); break;
    case 'grade': out = U.prompts.grade(json('lesson').say, arg('answer'), { attempt: Number(arg('attempt', '1')) }); break;
    default: console.error('unknown step ' + step); process.exit(2);
  }
  process.stdout.write(out);
}
