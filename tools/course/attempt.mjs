#!/usr/bin/env node
// One command for one build attempt of a course lesson's interactive (RUNBOOK section 5), so the
// builder spends one turn per attempt instead of six: extract the body from the reply, self-test
// and screenshot it (render.mjs), add the app's own checks (verdict), film every step's motion
// (filmstrip.mjs), and, when it fails, write the report-only JSON and the repair prompt. Prints
// one compact summary naming the few pictures worth looking at.
//
//   node tools/course/attempt.mjs --dir build/maths/<course> --idea i3 --attempt 2
//        [--lesson <file>]   the lesson JSON (default <dir>/<idea>.lesson.verified.json, else .lesson.final.json)
//        [--reply <file>]    the reply holding the body (default <dir>/<idea>.body<N>.html)
//        [--app <file>]      the kit test page (default tests/out/kit.html; built here if missing)
//        [--film all|moved|none]  film every step (default), only steps whose first frames change, or none
//        [--with-body]       quote the failed body in the repair prompt (the page's way); by default the
//                            prompt says the builder already has it, which is true in a build session
//
// Writes, as the runbook names them: <idea>.body<N>.x.html, <idea>.a<N>-*.png and -report.json,
// <idea>.a<N>.verdict.json, <idea>.a<N>.film-s<K>.png and .film.json, and on failure
// <idea>.a<N>.report-only.json and <idea>.repair<N>.prompt.txt. Exit 0 when the verdict is ok.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { loadPrompts, lessonOf } from '../eval/prompts.mjs';
import { renderBody } from '../eval/render.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
function arg(name, dflt) { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : dflt; }
const dir = arg('dir'), iid = arg('idea'), n = Number(arg('attempt'));
if (!dir || !iid || !n) { console.error('usage: attempt.mjs --dir <build dir> --idea iN --attempt N [--lesson f] [--reply f] [--app f] [--film all|moved|none] [--with-body]'); process.exit(2); }
const D = resolve(dir);
const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const pick = (...ps) => ps.find((p) => existsSync(p));
const lessonFile = arg('lesson') || pick(join(D, iid + '.lesson.verified.json'), join(D, iid + '.lesson.final.json'));
const replyFile = arg('reply') || join(D, `${iid}.body${n}.html`);
if (!lessonFile || !existsSync(replyFile)) { console.error('missing ' + (lessonFile ? replyFile : 'lesson JSON') ); process.exit(2); }
const topic = read(join(D, 'topic.json'));
const idea = (topic.ideas || []).find((i) => i.id === iid);
if (!idea) { console.error('no idea ' + iid + ' in topic.json'); process.exit(2); }
const lesson = lessonOf(read(lessonFile));

// The kit test page, built once.
let app = resolve(arg('app', join(root, 'tests', 'out', 'kit.html')));
if (!existsSync(app)) {
  mkdirSync(dirname(app), { recursive: true });
  const b = spawnSync(process.execPath, [join(root, 'tools', 'build.mjs'), '--only', '32,33', '--out', app], { stdio: 'inherit' });
  if (b.status !== 0) process.exit(b.status || 1);
}

const U = loadPrompts();
// 1. Extract.
const body = U.interactive.extract(readFileSync(replyFile, 'utf8'));
const bodyFile = join(D, `${iid}.body${n}.x.html`);
writeFileSync(bodyFile, body);

// 2. Render: self-test at three widths, screenshots at 360 and 1280, light and dark, opening, moved and end.
const out = join(D, `${iid}.a${n}`);
const rendered = await renderBody(body, out, app, {});

// 3. Verdict: the app's own checks on top (foreign addresses, unreachable targets), as prompts.mjs does.
async function unreachable() {
  const { openApp } = await import('../harness/page.mjs');
  const page = await openApp({ width: 360, height: 800, file: app });
  try {
    await page.page.goto(page.url('#/'));
    return await page.page.evaluate(async ([l, h]) => {
      await U.rt.ready;
      const available = !!(U.sandbox && typeof U.sandbox.reach === 'function');
      return { available, unreachable: available ? await U.interactive.unreachable(h, l) : [] };
    }, [lesson, body]);
  } finally { await page.close(); }
}
const r = await unreachable();
const report = { ...rendered.report, foreign: U.interactive.foreignUrls(body, lesson, rendered.report), unreachable: r.unreachable };
const problems = U.interactive.problems(report, lesson, body);
const verdict = { ok: !!report.ok && !problems.length, reachChecked: r.available, problems, report };
writeFileSync(`${out}.verdict.json`, JSON.stringify(verdict, null, 2) + '\n');

// 4. Film: every step's motion on one contact sheet per step (a steps lesson's "step" control).
const filmMode = arg('film', 'all');
let film = null;
if (filmMode !== 'none') {
  const f = spawnSync(process.execPath, [join(root, 'tools', 'eval', 'filmstrip.mjs'), bodyFile, '--out', `${out}.film`, '--app', app], { encoding: 'utf8' });
  if (f.status === 0 && existsSync(`${out}.film.json`)) {
    film = read(`${out}.film.json`);
  } else {
    film = { none: (f.stderr || '').trim().split('\n').pop() || 'no film (no "step" control?)' };
  }
}

// 5. On failure, the report-only JSON and the repair prompt (without the body unless asked).
let repairPrompt = null;
if (!verdict.ok) {
  const reportOnly = { ok: false, errors: problems, sweep: report.sweep || { ok: false, problems: [] } };
  writeFileSync(`${out}.report-only.json`, JSON.stringify(reportOnly, null, 2) + '\n');
  repairPrompt = join(D, `${iid}.repair${n}.prompt.txt`);
  writeFileSync(repairPrompt, U.interactive.repairPrompt(topic, idea, lesson, body, verdict.report, { noBody: !process.argv.includes('--with-body'), bodyFile }));
}

// 6. One summary: what to look at, and no more (CLAUDE.md: one contact sheet per check).
const checks = report.checks || report.results || null;
const checkLine = Array.isArray(checks) ? `${checks.filter((c) => c.ok !== false && c.passed !== false).length} of ${checks.length} checks` : (report.passed === false ? 'self-test failed' : 'self-test ok');
// A demonstration moves for a second or more; a puzzle's arrival settles well under that and its
// sheet shows nothing a still does not.
const DEMO_S = 1;
const moved = film && Array.isArray(film.steps) ? film.steps.filter((s) => (s.settled || 0) >= DEMO_S).map((s) => s.step) : [];
const still = film && Array.isArray(film.steps) ? film.steps.filter((s) => (s.settled || 0) < DEMO_S).map((s) => s.step) : [];
const lookAt = [
  `${out}-360-light.png`, `${out}-360-light-moved.png`, `${out}-360-light-end.png`, `${out}-360-dark-moved.png`, `${out}-1280-light-end.png`,
].filter((p) => existsSync(p)).concat(moved.map((s) => `${out}.film-s${s}.png`));
const summary = {
  attempt: n, ok: verdict.ok, checks: checkLine, problems,
  moved: rendered.moved,
  film: film && film.steps ? { steps: film.steps.length, settledBy: Object.fromEntries(film.steps.map((s) => [s.step, s.settled])), demonstrations: moved, settleUnderASecond: still, errors: film.errors || null } : film,
  lookAt,
  note: 'Read the lookAt pictures once each (the moved and end states, dark, the laptop end state, and one contact sheet per demonstration step, one that moves for a second or more); nothing else.',
  repairPrompt,
  bodyFile, verdictFile: `${out}.verdict.json`,
};
console.log(JSON.stringify(summary, null, 2));
process.exit(verdict.ok ? 0 : 1);
