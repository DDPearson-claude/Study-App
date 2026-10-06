// Tests for the lesson-quality rules in app/src/js/30-prompts.js: the plan, research and
// write-lesson prompts (docs/eval/run2-panel.md changes 1-6, 8-10, 13, 15, 16, 20) and the lesson
// validator's soft judgements and warnings (docs/ARCHITECTURE.md section 5).
// Run: node --test tests/prompts.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => readFileSync(join(root, 'app', 'src', 'js', f), 'utf8');
const fx = (n) => JSON.parse(readFileSync(join(root, 'tests', 'fixtures', n), 'utf8'));
const plain = (x) => JSON.parse(JSON.stringify(x));
const clone = (x) => JSON.parse(JSON.stringify(x));

const PLAN_JET = fx('plan-jet-engines.json');
const PLAN_ROME = fx('plan-roman-republic.json');
const RESEARCH_JET = fx('research-jet-engines.json');
const L_JET2 = fx('lesson-jet-engines-i2.json');

// The builders and validators are pure: 00-core and 30-prompts load in a VM with no DOM at all.
function load() {
  const ctx = { console, Math, JSON, Date };
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const f of ['00-core.js', '30-prompts.js']) vm.runInContext(src(f), ctx, { filename: f });
  return ctx.U;
}
const U = load();
const LR2 = U.prompts.lessonResearch(RESEARCH_JET, 'i2');
const check = (l) => U.validate.lesson(l, { iid: 'i2', sources: LR2.sources });
// Problems matching re, and the guarantee that every new judgement is soft.
function found(problems, re) {
  const all = plain(problems), hits = all.filter((p) => re.test(p));
  for (const h of hits) assert.ok(plain(problems.soft).includes(h), 'soft: ' + h);
  return hits;
}

// =========================================================================================
// Validator: the target check is advice, and answers Dan could copy are soft problems
// =========================================================================================
test('the fixture lesson has no problems and no warnings (the baseline for the cases below)', () => {
  const p = check(L_JET2);
  assert.deepEqual(plain(p), []);
  assert.deepEqual(plain(p.warnings), []);
});

test('a missing target check is a warning, never a problem', () => {
  const l = clone(L_JET2);
  l.checks[0] = { id: 'c1', type: 'choice', q: 'Which engine pushes harder?', options: ['Engine A', 'Engine B', 'Neither'], answer: 2, why: 'They tie.' };
  const p = check(l);
  assert.deepEqual(plain(p), [], 'no problem, so no repair and nothing thrown away');
  assert.equal(p.warnings.length, 1);
  assert.match(p.warnings[0], /^The interactive has outputs and a numeric control but no target check\. That is fine unless reaching some value on it needs the idea/);
  // No interactive, or no readout: nothing to advise.
  const none = clone(l); none.interactive = null;
  assert.deepEqual(plain(check(none).warnings), []);
  const noOut = clone(l); noOut.interactive.outputs = [];
  assert.deepEqual(plain(check(noOut).warnings), []);
  // A target check on a lesson without an interactive is still a hard problem.
  const bad = clone(L_JET2); bad.interactive = null;
  assert.ok(U.validate.hard(check(bad)).some((x) => /target check but the lesson has no interactive/.test(x)));
});

test('a target printed in the reveal or the explanation is a soft problem saying what to change', () => {
  const l = clone(L_JET2);
  l.checks[1].answer = 70; // keep the estimate out of the way
  l.explain.text += ' Speed the air up by 500 m/s and the readout shows 50 kN.';
  const p = check(l);
  const hits = found(p, /^checks\[0\] asks Dan to make thrust reach 50/);
  assert.deepEqual(hits, ['checks[0] asks Dan to make thrust reach 50, but explain.text already prints "50", so he can match that number instead of reasoning: choose a target the lesson never states, or take the number out of explain.text.']);
  assert.deepEqual(plain(U.validate.hard(p)), []);
  // In the reveal, and as the readout rounds it (decimals 1: 12.34 shows 12.3).
  const r = clone(L_JET2);
  r.checks[1].answer = 70;
  r.interactive.outputs[0].decimals = 1;
  r.checks[0].target = 12.34;
  r.predict.reveal += ' You would read about 12.3 kN.';
  assert.equal(found(check(r), /checks\[0\].*predict\.reveal already prints "12\.3"/).length, 1);
  // Other numbers, longer or shorter, never match: 500, 150, 5, 50.5.
  const q = clone(L_JET2);
  q.checks[1].answer = 70;
  q.explain.text += ' At 500 m/s, 150 kg/s or 5 tonnes, it is 50.5 of something else.';
  assert.deepEqual(plain(check(q)), []);
});

test('digit groups count as one number; a small whole number counts only with its unit after it', () => {
  const l = clone(L_JET2);
  l.checks[1].answer = 70;
  l.checks[0].target = 1000;
  l.interactive.controls[1].max = 6000;
  l.explain.text += ' A big engine makes 1,000 kN.';
  assert.equal(found(check(l), /checks\[0\].*"1,000"/).length, 1, 'thousands with a comma');
  const t = clone(l); t.explain.text = L_JET2.explain.text + ' A big engine makes 1 000 kN.';
  assert.equal(found(check(t), /checks\[0\].*explain\.text already prints/).length, 1, 'thousands with a narrow no-break space');
  // Target 2 on a readout in "x": "2 engines" or a footnote [^2] is no answer; "2x" is.
  const s = clone(L_JET2);
  s.checks[1].answer = 70;
  s.interactive.outputs[0].unit = 'x';
  s.checks[0].target = 2;
  s.explain.text += ' Picture 2 engines side by side.';
  assert.deepEqual(plain(check(s)), [], '"2 engines" is not an answer');
  s.explain.text += ' Together they push 2x as hard.';
  assert.equal(found(check(s), /checks\[0\] asks Dan to make thrust reach 2, but explain\.text already prints "2 x"/).length, 1);
  // No unit at all: a small whole number is never reported.
  const n = clone(s); n.interactive.outputs[0].unit = '';
  assert.deepEqual(plain(check(n)), []);
});

test('an estimate answer printed in the reveal or the explanation is a soft problem; other numbers are not', () => {
  const l = clone(L_JET2);
  l.checks[1].answer = 75;
  l.predict.reveal += ' A mid-sized engine makes about 75 kN.';
  const hits = found(check(l), /^checks\[1\] asks Dan to estimate 75/);
  assert.deepEqual(hits, ['checks[1] asks Dan to estimate 75, but predict.reveal already prints "75", so he can recall it instead of reasoning: ask about a case whose answer the lesson never states, or take the number out of predict.reveal.']);
  const ok = clone(L_JET2); ok.checks[1].answer = 75; ok.predict.reveal += ' A mid-sized engine makes about 175 kN, or 7.5 of them.';
  assert.deepEqual(plain(check(ok)), []);
  const small = clone(L_JET2); small.checks[1].answer = 3; small.explain.text += ' Three engines, 3 of them.';
  assert.deepEqual(plain(check(small)), [], 'a small number without its unit');
  small.explain.text += ' Each makes 3 kN.';
  assert.equal(found(check(small), /checks\[1\] asks Dan to estimate 3, but explain\.text already prints "3 kN"/).length, 1);
});

test('a right option sharing four words in a row with the explanation, reveal or model answer is a soft problem', () => {
  const base = clone(L_JET2);
  base.checks[2].options = ['It doubles the push', 'It halves the push', 'Twice the air at half speed', 'It drops to a quarter'];
  assert.deepEqual(plain(check(base)), [], 'no echo yet');
  for (const [field, set, own] of [
    ['explain.text', (l) => { l.explain.text += ' Twice the air at half speed gives the same push.'; }, 'your explanation\'s'],
    ['predict.reveal', (l) => { l.predict.reveal += ' Twice the air at half speed ties.'; }, 'your reveal\'s'],
    ['say.model', (l) => { l.say.model += ' Twice the air at half speed is a tie.'; }, 'your model answer\'s'],
  ]) {
    const l = clone(base); set(l);
    const hits = found(check(l), /^checks\[2\]\.options\[2\] \(the right answer\) repeats/);
    // The repair asks for other wording of the outcome, never other names for things (NAMES AND TERMS).
    assert.deepEqual(hits, [`checks[2].options[2] (the right answer) repeats "twice the air at half speed" from ${field}, so Dan can pick it by recognising your wording: reword the outcome so it is not ${own} sentence, keeping the lesson's names for things.`]);
  }
  // Three words in a row, or four that are only little words, prove nothing.
  const three = clone(base); three.explain.text += ' Twice the air is a lot.';
  assert.deepEqual(plain(check(three)), []);
  const little = clone(base);
  little.checks[2].options = ['It doubles the push', 'It halves the push', 'It is one of the same', 'It drops to a quarter'];
  little.explain.text += ' This is one of the same kind.';
  assert.deepEqual(plain(check(little)), []);
});

test('an echo the wrong options or the question also hold gives nothing away, and the lesson\'s [[terms]] are never an echo', () => {
  // Words every option shares (the explanation states the rule in its general form) give nothing away.
  const shared = clone(L_JET2);
  shared.checks[2] = { id: 'c3', type: 'choice', q: 'Which engine pushes hardest?', answer: 0, why: 'Twice the speed doubles the push, half the air halves it.',
    options: ['Half the gas hurled out twice as fast', 'Twice the gas hurled out twice as fast', 'Twice the gas hurled out half as fast'] };
  shared.explain.text += ' Gas hurled out twice as fast doubles the push.';
  assert.deepEqual(plain(check(shared)), [], 'the run is in a wrong option too');
  // The same echo, when no wrong option shares it, still counts (and says what to change).
  const own = clone(shared);
  own.checks[2].options = ['Half the gas hurled out twice as fast', 'Twice the push from the same engine', 'The push stays just the same'];
  assert.deepEqual(found(check(own), /^checks\[2\]/), ['checks[2].options[0] (the right answer) repeats "gas hurled out twice as fast" from explain.text, so Dan can pick it by recognising your wording: reword the outcome so it is not your explanation\'s sentence, keeping the lesson\'s names for things.']);
  // A run the question already states gives nothing away either.
  const asked = clone(own); asked.checks[2].q = 'Which engine has its gas hurled out twice as fast?';
  assert.deepEqual(plain(check(asked)), []);
  // A term the lesson marks [[like this]] is one name for one thing: it never makes a run.
  const term = clone(L_JET2);
  term.checks[2] = { id: 'c3', type: 'choice', q: 'Throw the air back faster. What happens?', answer: 1, why: 'More speed added, more push.',
    options: ['It halves', 'The jet thrust grows', 'It stays the same', 'It drops to zero'] };
  term.explain.text += ' Throw the air back faster and the jet thrust grows.';
  assert.equal(found(check(term), /^checks\[2\]\.options\[1\] \(the right answer\) repeats "the jet thrust grows"/).length, 1, 'unmarked, the name counts');
  term.explain.text = term.explain.text.replace('the jet thrust grows', 'the [[jet thrust]] grows');
  assert.deepEqual(plain(check(term)), [], 'marked as a term, it does not');
  // A plural of the term is the same name; the words beyond the name still count when they make a run.
  const plural = clone(term); plural.checks[2].options[1] = 'The jet thrusts grow';
  plural.explain.text += ' Push harder and the jet thrusts grow.';
  assert.deepEqual(plain(check(plural)), [], 'the name in the plural');
  const rest = clone(term);
  rest.checks[2].options = ['It shrinks as the engine speeds up', 'Jet thrust climbs with every faster gust', 'It stays exactly where it was', 'It drops away to nothing at all'];
  rest.explain.text += ' Jet thrust climbs with every faster gust.';
  assert.deepEqual(found(check(rest), /^checks\[2\]/), ['checks[2].options[1] (the right answer) repeats "climbs with every faster gust" from explain.text, so Dan can pick it by recognising your wording: reword the outcome so it is not your explanation\'s sentence, keeping the lesson\'s names for things.'], 'the words beyond the name');
});

test('a right option over 1.5 times the others\' average length is a soft problem; short or even options are not', () => {
  const l = clone(L_JET2);
  l.checks[2].options = ['It doubles', 'It halves', 'It stays the same, because twice the air at half speed cancels', 'It drops to a quarter'];
  const hits = found(check(l), /length gives it away/);
  assert.deepEqual(hits, ['checks[2].options[2] (the right answer) is 62 characters and the other options average 13, so its length gives it away: cut it to the outcome alone (its reason belongs in why), or make the wrong options as full.']);
  const even = clone(L_JET2);
  even.checks[2].options = ['It doubles the push', 'It halves the push', 'It stays just the same', 'It drops to a quarter'];
  assert.deepEqual(plain(check(even)), []);
  // Exactly 1.5 times is allowed: 30 characters against an average of 20.
  const edge = clone(L_JET2);
  edge.checks[2].options = ['a'.repeat(20), 'b'.repeat(20), 'it stays the same as before xx', 'c'.repeat(20)];
  assert.equal(edge.checks[2].options[2].length, 30);
  assert.deepEqual(plain(check(edge)), []);
  // A right option under four words never counts, however short the others ("Up", "Down").
  const tiny = clone(L_JET2);
  tiny.checks[2].options = ['Up', 'Down', 'Stays level', 'No'];
  assert.deepEqual(plain(check(tiny)), []);
});

test('a rubric point joining two ideas with ";", or one the say prompt already states, is a soft problem', () => {
  const l = clone(L_JET2);
  l.say.rubric[2] = 'Multiply them; lots of slow air can match a little fast air';
  assert.deepEqual(found(check(l), /^say\.rubric\[2\]/), ['say.rubric[2] holds two ideas (joined by ";"): keep the one at the heart of the lesson, or split it into two points if the rubric then has at most 3.']);
  const given = clone(L_JET2);
  given.say.prompt = 'In your own words: why does an engine that throws more air back each second push harder?';
  given.say.rubric[0] = 'It throws more air back each second';
  assert.deepEqual(found(check(given), /^say\.rubric\[0\]/), ['say.rubric[0] ("It throws more air back each second") only repeats words of say.prompt, so the question gives that point away: ask without stating it, or make the point a step Dan has to supply.']);
  // The fixture's points add something the prompt does not say; a one-word point proves nothing.
  const one = clone(L_JET2);
  one.say.prompt = 'In your own words: why does the engine push?';
  one.say.rubric[0] = 'It pushes';
  assert.deepEqual(plain(check(one)), []);
});

test('a listed source nothing cites is a soft problem before renumbering, and stays hard in final form', () => {
  const l = clone(L_JET2);
  const extra = LR2.sources.find((x) => x.n !== l.sources[0].n);
  l.sources.push(clone(extra));
  const p = check(l);
  assert.deepEqual(found(p, /nothing in the lesson cites it/), [`sources lists [${extra.n}], but nothing in the lesson cites it: put [^${extra.n}] straight after the words its quote supports, or take it out of sources.`]);
  assert.deepEqual(plain(U.validate.hard(p)), []);
  // Cited in the text, or by a number: no problem.
  const cited = clone(l); cited.explain.text += ` More air, more push.[^${extra.n}]`;
  assert.deepEqual(plain(check(cited)), []);
  const byNumber = clone(l); byNumber.interactive.numbers.find((x) => x.kind === 'control').kind = 'constant'; byNumber.interactive.numbers.find((x) => x.kind === 'constant').source = extra.n;
  assert.deepEqual(plain(check(byNumber)).filter((x) => /cites it/.test(x)), []);
  // Final form is the renumbered lesson: an uncited source there is a hard problem, as before.
  const fin = clone(L_JET2); fin.sources.push({ ...clone(extra), n: 2 });
  assert.ok(U.validate.hard(U.validate.lesson(fin, { iid: 'i2', final: true })).some((x) => /source \[2\] is listed but never cited/.test(x)));
});

test('the new judgements never make a lesson fail: after its repair, only soft problems are left', () => {
  const l = clone(L_JET2);
  l.checks[1].answer = 75;
  l.explain.text += ' Twice the air at half speed: 50 kN, or 75 kN.';
  l.checks[2].options = ['It doubles', 'It halves', 'Twice the air at half speed cancels out exactly', 'It drops'];
  l.say.rubric[2] = 'Multiply them; slow air can match fast air';
  l.sources.push(clone(LR2.sources.find((x) => x.n !== 1)));
  const p = check(l);
  assert.ok(p.length >= 5, JSON.stringify(plain(p)));
  assert.deepEqual(plain(p.soft), plain(p));
  assert.deepEqual(plain(U.validate.hard(p)), []);
});

test('the eval validator prints the warnings beside the problems', () => {
  const dir = mkdtempSync(join(tmpdir(), 'mu-prompts-'));
  const l = clone(L_JET2);
  l.checks[0] = { id: 'c1', type: 'choice', q: 'Which engine pushes harder?', options: ['Engine A', 'Engine B', 'Neither'], answer: 2, why: 'They tie.' };
  writeFileSync(join(dir, 'reply.txt'), 'Here is the lesson:\n' + JSON.stringify(l));
  const r = spawnSync(process.execPath, [join(root, 'tools', 'eval', 'validate.mjs'), 'lesson', join(dir, 'reply.txt'), '--iid', 'i2'], { cwd: root, encoding: 'utf8' });
  if (r.status !== 0 && /33-interactive/.test(r.stderr)) return; // the eval loader also needs 33-interactive.js
  assert.equal(r.status, 0, r.stderr);
  const out = JSON.parse(r.stdout);
  assert.equal(out.ok, true);
  assert.equal(out.warnings.length, 1);
  assert.match(out.warnings[0], /no target check/);
});

// =========================================================================================
// The write-lesson prompt
// =========================================================================================
const lessonFor = (plan, iid, opts = {}) => U.prompts.writeLesson(plan, plan.ideas.find((i) => i.id === iid), opts);
const count = (text, s) => text.split(s).length - 1;
const rulesOf = (p) => p.slice(p.indexOf('WRITING EACH PART'));
const wordsOf = (t) => t.split(/\s+/).filter(Boolean).length;
const withKind = (plan, iid, kind) => ({ ...clone(plan), ideas: plan.ideas.map((i) => (i.id === iid ? { ...i, kind } : i)) });

test('write-lesson: Dan has seen each calibration answer and why, so the predict and checks build on them', () => {
  const p = lessonFor({ ...PLAN_JET, level: 'new' }, 'i1', { research: RESEARCH_JET });
  for (const c of PLAN_JET.calibration) {
    assert.ok(p.includes('- ' + c.q + ' Answer: ' + c.options[c.answer].replace(/[.!?]+$/, '') + '. Why: ' + c.why), 'printed with its answer and why: ' + c.q);
  }
  for (const s of ['He has seen each right answer and its why, so treat them as known and build on them.',
    'Never write a predict or check they already answer (a new case with the same answer is the same question), and never reuse their scenario or wording.',
    'If one probes the heart of this idea, test that misconception from a new angle on the interactive.'])
    assert.ok(p.includes(s), s);
  assert.ok(!p.includes('ask something different in your predict and checks'), 'the old weak rule is gone');
  // A calibration question without a usable answer still prints, without "Answer:".
  const odd = clone(PLAN_JET); odd.calibration[0].answer = 9;
  assert.ok(lessonFor(odd, 'i1').includes('- ' + odd.calibration[0].q + ' Why: '));
});

test('write-lesson: the predict is not given away and aims where intuition fails', () => {
  const p = lessonFor(PLAN_JET, 'i1');
  for (const s of ['He has read this idea\'s title and one line and sees that screen, so none may give the answer',
    'aim where intuition fails, at what they leave open (how much, how soon, which way, an in-between setting, the case where nothing happens), without stating the rule or mechanism',
    'If most adults would get it right, ask about another case.',
    '"How long does it take to boil?" (the screen shows it)',
    'in the same terms and of about the same length, no reasons attached',
    'no straw men such as "longer, because the water gets tired"',
    'reading well whatever he chose',
    '- None of the title, the one line, the opening screen and the calibration answers gives the predict\'s answer away.'])
    assert.ok(p.includes(s), s);
  // The debate rule goes only to an idea that is itself argued about: its title or one line says
  // so, or its own research flags a contested note.
  const rule = 'If the idea itself is debated, ask which view he finds more convincing, naming no winner; if only a detail is (how long, how many), predict what the evidence settles.';
  assert.ok(!p.includes('which view he finds more convincing'), 'not a debated idea');
  assert.ok(lessonFor(PLAN_ROME, 'i5').includes(rule), 'historians still argue about how much Marius changed');
  assert.ok(!lessonFor(PLAN_ROME, 'i4').includes(rule));
  const flagged = clone(RESEARCH_JET); flagged.ideas.i1.notes.push({ claim: 'Who first explained it is disputed.', sourceIds: [1], contested: 'Two textbooks credit different people.' });
  assert.ok(lessonFor(PLAN_JET, 'i1', { research: flagged }).includes(rule), 'its research flags a debate');
});

test('write-lesson: the brief\'s second half is all Dan sees before play, so it names the action, never the answer', () => {
  const p = lessonFor(PLAN_JET, 'i2');
  assert.ok(p.includes('- brief (one sentence, at most 40 words): "The one thing you should see is ___ when you ___.": one visible change at the heart of the idea (not a step towards it), caused by one action. It drives the build. Before play the app shows only "Try this: " and your "when you" half (the whole sentence after the reveal), so that half names the action, never the answer.'));
  assert.ok(!p.includes('Dan sees the "when you ___" half before he plays'), 'the old wording is gone');
  assert.ok(lessonFor(PLAN_JET, 'i1').includes('caused by one action, naming the cause as well as the change.'), 'a mechanism names its cause');
});

test('write-lesson: three checks, one per side; amounts only where the idea has them; a target only where a readout can be real', () => {
  const p = lessonFor(PLAN_JET, 'i2');
  for (const s of ['checks (3; 2 only when a third would repeat the predict or the say-it-back)',
    '- One per side: the why; the limit (where the rule stops holding: a lever lets you push less hard, but further); and a new case the interactive did not show, comparing amounts where the idea involves how much, how many or how long (a target check can be this one).',
    'not recall of a wording or number', 'needs only this idea and those it builds on', 'makes sense alone weeks later',
    'if you cannot say who believes one, replace it',
    'four words in a row of your explanation, reveal or model answer (names for things aside)',
    'the question states no fact that rules an option out',
    'only for an order he could get wrong', 'no "it" or "then", never the interactive\'s step names',
    'which he can reason his way to and the lesson never states',
    '- target: "Set X so that Y reaches Z" on this interactive',
    'Write one only when reaching it needs the idea: a value the lesson never prints, ideally past a turning point.',
    'some step must show the target exactly at the readout\'s decimals (else ask for "about Z"); why names every setting that works',
    'each marked answer is right and each target reachable', '"type": "target"'])
    assert.ok(p.includes(s), s);
  // Gone: the over-constrained third check, and a promise about the screen the app does not keep.
  for (const s of ['At least two are set in a case', 'at least one asks him to compare or reason about amounts', 'hides that readout', 'so a lesson with one has three checks'])
    assert.ok(!p.includes(s), 'gone: ' + s);
  assert.ok(!/Include one whenever|must have a target|include one check of type "target"/i.test(p), 'no rule left that forces a target check');
  // History, structure and concept ideas have no readout a real rule computes: no target check at all.
  for (const [plan, iid] of [[PLAN_ROME, 'i4'], [PLAN_ROME, 'i1'], [PLAN_ROME, 'i7']]) {
    const q = lessonFor(plan, iid);
    assert.ok(!q.includes('- target:') && !q.includes('"type": "target"') && !q.includes('target reachable') && !q.includes('target check'), plan.ideas.find((i) => i.id === iid).kind + ': no target');
    assert.ok(q.includes('{ "id": "c1", "type": "choice"') && q.includes('{ "id": "c3", "type": "estimate"'), 'its check examples are numbered in order');
  }
});

test('write-lesson: the interactive draws the cause, its form follows the kind, and a timeline runs forwards', () => {
  const kinds = {
    mechanism: ['with the cause drawn', 'set off by an action he performs', 'Include a setting where the cause does not produce the effect'],
    quantity: ['also show the pile: 50 or more evenly spaced cases sent through the rule'],
    process: ['drawing the thing that carries the change', 'a stepper alone is a slideshow', 'controls: one. Add a second only if the idea cannot be seen without it (a switch for an earlier stage\'s cause counts)'],
    history: ['a timeline he moves through, not a slideshow: a numeric control in years after the first date ("Years after 500 BC") or a named stepper of dates in time order, each documented event appearing at its date', 'A stepper only when every step changes the drawing.'],
  };
  for (const [kind, says] of Object.entries(kinds)) {
    const p = lessonFor(withKind(PLAN_JET, 'i2', kind), 'i2');
    for (const s of says) assert.ok(p.includes(s), kind + ': ' + s);
  }
  assert.ok(!lessonFor(PLAN_JET, 'i2').includes('he drags through the years'), 'no timeline the kit cannot build');
  // A slider's numbers rise to the right: in a history course, years BC are counted forwards.
  const bc = 'its numbers rise as it moves right (never a slider whose numbers fall, as years BC do: count years after the first date)';
  assert.ok(lessonFor(PLAN_ROME, 'i4').includes(bc) && lessonFor(PLAN_ROME, 'i1').includes(bc), 'history course');
  assert.ok(!lessonFor(PLAN_JET, 'i2').includes('years BC'), 'not elsewhere');
  const p = lessonFor(PLAN_JET, 'i2');
  for (const s of ['stay on the side of it the idea is about (past a turning point only when that is the lesson)', 'zero when zero is the real case',
    '- The consequence your brief names, and the cause your why gives for it, can be seen on some setting of the interactive.'])
    assert.ok(p.includes(s), s);
  assert.ok(!p.includes('Every consequence your explanation states'), 'the unfollowable check is gone');
  assert.ok(!p.includes('sketch map') && lessonFor(PLAN_ROME, 'i1').includes('sketch map'), 'maps where places matter');
});

test('write-lesson: the explanation does what it must within 170 words; the rest only if words remain', () => {
  const p = lessonFor(PLAN_JET, 'i2', { research: RESEARCH_JET });
  for (const s of ['explain (at most 170 words; aim for about 150): within that, it must',
    '- Open with what playing shows, in one or two sentences, as something he can do or check, never as something he did',
    'never by its shade (dark mode swaps them)', 'from something he knows or has felt', 'naming what makes each step happen, his control\'s effect included',
    'name what is physically different, so the reason does not equally fit the earlier case',
    '- Teach every part of "What Dan should come away understanding" (with care where RESEARCH does not back it).',
    'Name a teaching model (an ideal case) as one in a clause, with confidence "simplified"', '"One way to picture it: …"',
    'footnoted when a source supports it and no wider than the places and period its sources describe'])
    assert.ok(p.includes(s), s);
  for (const s of ['and of the picture,', 'any part of the mechanism your analogy', 'Just before the takeaway, one sentence'])
    assert.ok(!p.includes(s), 'no longer an obligation: ' + s);
  // The puzzle sentence goes to the first and last ideas only, and only if words remain.
  const puzzle = 'one sentence on the part this idea plays in answering the course\'s puzzle';
  assert.ok(lessonFor(PLAN_JET, 'i1').includes('- Only if words remain, also: just before the takeaway, ' + puzzle + ', without teaching the next idea.'), 'first idea');
  assert.ok(lessonFor(PLAN_JET, 'i6').includes('- Only if words remain, also: just before the takeaway, ' + puzzle + '.'), 'last idea');
  assert.ok(!p.includes(puzzle) && !p.includes('Only if words remain'), 'a middle idea has neither');
  const noHook = clone(PLAN_JET); delete noHook.hook;
  assert.ok(!lessonFor(noHook, 'i1').includes(puzzle) && !lessonFor(noHook, 'i1').includes('Puzzle the course answers'), 'no puzzle, no puzzle sentence');
  assert.ok(lessonFor(PLAN_JET, 'i1').includes('Puzzle the course answers: ' + PLAN_JET.hook + '\n'), 'the hook, as the puzzle');
  // A history idea: why it mattered to people then is also optional; its why is how we know.
  const rome4 = lessonFor(PLAN_ROME, 'i4');
  assert.ok(rome4.includes('- Only if words remain, also: why it mattered to people then, from a source.'));
  assert.ok(rome4.includes('For this history idea, the why is how we know: the evidence and how it was dated, as far as the quotes say'));
  assert.ok(!lessonFor(PLAN_ROME, 'i1').includes('why it mattered to people then'), 'not for a structure idea');
});

test('write-lesson: claims stay true on a review card, zeros are literal, and an unsourced fact is labelled', () => {
  const p = lessonFor(PLAN_JET, 'i2', { research: RESEARCH_JET });
  for (const s of ['CLAIMS THAT STAY TRUE', 'return as review cards for months, without your ignores panel',
    'Never call a belief wrong in general because it fails here', '(try both ends and the middle)',
    'Words of time and size, and any zero in your model, are literally true as a specialist would put it: a simplified figure\'s "instant" or "none" usually means "much quicker" or "very little"',
    'Keep a note\'s or quote\'s qualifiers, in plain words if their name is jargon ("most" never becomes "all"; "the kind of fat that is solid at room temperature" for saturated fat)',
    'State each rule in the general form later ideas need', 'Never say a source lacks something', 'nothing picked to exaggerate the effect',
    'first what the picture would wrongly suggest', 'A condition the result needs goes with the result, not here.',
    'Put [^n] straight after the words its quote supports', 'split a sentence that adds reasoning the quote lacks', 'showing people acting on the rule',
    '- A fact RESEARCH does not support appears only if a standard textbook states it: no footnote, said as "textbooks add that …", and never the only support for the predict\'s answer.'])
    assert.ok(p.includes(s), s);
  assert.ok(!p.includes('is a constant only if no source says otherwise'), 'the zero loophole is closed');
  assert.ok(!lessonFor(PLAN_ROME, 'i1').includes('textbooks add that'), 'an unsourced lesson is labelled as a whole');
  // The same rules, word for word, for anything that later checks a lesson against them.
  const rules = U.prompts.truthRules({ sources: true, history: false });
  assert.ok(rules.startsWith('CLAIMS THAT STAY TRUE\n') && rules.includes('\n\nTHE NUMBER RULE\n'));
  assert.ok(p.includes(rules), 'writeLesson carries truthRules verbatim');
  assert.ok(lessonFor(PLAN_ROME, 'i4').includes(U.prompts.truthRules({ sources: false, history: true })));
});

test('write-lesson: names, analogy, say-it-back and numbers', () => {
  const p = lessonFor(PLAN_JET, 'i2', { research: RESEARCH_JET });
  for (const s of ['One name for each thing in every part', 'one verb for one event, no word with two meanings', 'a two-word term once both words are explained',
    'meaning what RESEARCH says, not narrowed to this picture', 'a source\'s point in your own words, not its vocabulary',
    'not only its outcome', 'keeps the same mapping', 'in correct science',
    'setting out the situation without stating any rubric point', 'no ";" or "and" joining two claims', 'the last the conclusion the prompt asks for',
    'true of this idea but not equally of the one it builds on',
    'never a number, a method detail (unless how we know is the idea\'s point) or a name (unless the name is the idea)',
    'with no case it does not ask about and no jargon ("soaks up" meets "absorbs")',
    '"near 85%", never "at 85%"', 'labelled with nothing its quote lacks', 'worded as chosen', 'faithful to every shape fact in RESEARCH',
    'in metric units ("tonnes", not "tons")', 'When your model\'s result and a cited real value differ'])
    assert.ok(p.includes(s), s);
  // A new learner meets at most two new terms and two numbers; a learner who knows a little, three terms.
  const fresh = lessonFor({ ...PLAN_JET, level: 'new' }, 'i1');
  assert.ok(fresh.includes('at most 2 new terms') && fresh.includes('at most two numbers, ones the picture shows'));
  const some = lessonFor({ ...PLAN_JET, level: 'some' }, 'i1');
  assert.ok(some.includes('at most 3 new terms') && !some.includes('at most two numbers'));
  // No sources: no talk of quotes in the number rule.
  assert.ok(!lessonFor(PLAN_ROME, 'i1').includes('labelled with nothing its quote lacks'));
});

test('write-lesson: contested views come from scholars, and too few of them make it "simplified"', () => {
  const debated = lessonFor(PLAN_ROME, 'i5');
  for (const s of ['answering the same question, each from a named scholar or a peer-reviewed or university source, not an encyclopedia',
    'If fewer than two such views remain, set "simplified" and say in one sentence what is still argued and by whom.'])
    assert.ok(debated.includes(s), s);
  const plain2 = lessonFor(PLAN_JET, 'i1');
  assert.ok(plain2.includes('"contested": experts genuinely disagree about something central here') && plain2.includes('the interactive, rubric and checks take no side'));
  assert.ok(!plain2.includes('If fewer than two such views remain'), 'only where the idea is argued about');
});

test('write-lesson: a later debated idea is described neutrally; history rules reach history courses only', () => {
  // Rome: i3 and i5 say historians argue. Lessons before them stay neutral; i7, after them all, need not.
  assert.ok(lessonFor(PLAN_ROME, 'i1').includes('Where a later idea is a debate, describe its subject neutrally here and leave the verdict to that lesson ("the extinction of the dinosaurs", not "the asteroid that wiped them out").'));
  assert.ok(!lessonFor(PLAN_ROME, 'i7').includes('Where a later idea is a debate'));
  assert.ok(!lessonFor(PLAN_JET, 'i1').includes('Where a later idea is a debate'), 'no debate in the jet course');
  // History: date windows, period names and forward timelines for every lesson of a course with a
  // history idea; the "how we know" why and the bunched-dates check for a history idea itself.
  const rome4 = lessonFor(PLAN_ROME, 'i4'), rome1 = lessonFor(PLAN_ROME, 'i1'), jet = lessonFor(PLAN_JET, 'i1');
  for (const s of ['"sometime between 520 and 510 BC"', 'Say when a name is a modern label (the Dark Ages)', 'count years after the first date']) {
    assert.ok(rome4.includes(s) && rome1.includes(s), 'history course: ' + s);
    assert.ok(!jet.includes(s), 'not in the jet course: ' + s);
  }
  for (const s of ['For this history idea, the why is how we know',
    '- Placed on your axis, the dates show the change your brief names. If they bunch, the brief, predict, takeaway and rubric follow what the dates show, and the explanation says in one sentence which part of the one line this lesson cannot yet show.',
    'No date or span would surprise a specialist (drop a source number that would).']) {
    assert.ok(rome4.includes(s), 'history idea: ' + s);
    assert.ok(!rome1.includes(s), 'not a structure idea: ' + s);
  }
});

test('write-lesson: sound only for a topic or idea about something heard', () => {
  const rule = 'Sound only when hearing teaches what the picture cannot';
  assert.ok(!lessonFor(PLAN_JET, 'i1').includes(rule));
  assert.ok(!lessonFor({ ...PLAN_JET, title: 'How the heart pumps blood' }, 'i1').includes(rule), '"heart" is not "hear"');
  const box = clone(PLAN_JET); box.title = 'How a music box plays a tune';
  assert.ok(lessonFor(box, 'i1').includes(rule + ' (two notes beating): one button starts a sound that plays on while he moves the control. Say how much a slowed picture is slowed.'));
});

test('write-lesson: one place per rule, and no blank lines inside a section', () => {
  for (const p of [lessonFor(PLAN_ROME, 'i4', {}), lessonFor(PLAN_ROME, 'i5', {}), lessonFor(PLAN_JET, 'i1', { research: RESEARCH_JET })]) {
    for (const s of ['four words in a row', 'review cards', 'One name for each thing', 'no straw men', 'Never invent probabilities', 'qualifiers',
      'a stepper alone is a slideshow', 'at most 170 words;', 'Never say a source lacks', 'how we know is', '"tonnes", not "tons"', 'where intuition fails',
      'Try this', 'textbooks add that', 'which view he finds', 'years BC', 'If they bunch', 'exaggerate', 'puzzle;', 'instant'])
      assert.ok(count(p, s) <= 1, s + ' is said once (' + count(p, s) + ')');
    // Sections are separated by one blank line; a rule left out never leaves a hole inside one.
    const sections = p.split('\n\n').map((b) => b.split('\n')[0]);
    for (const h of ['predict', 'interactive', 'explain (at most 170 words; aim for about 150): within that, it must', 'analogy (optional)', 'say (say it back)',
      'checks (3; 2 only when a third would repeat the predict or the say-it-back)', 'confidence', 'CLAIMS THAT STAY TRUE', 'NAMES AND TERMS', 'THE NUMBER RULE', 'SOURCES', 'BEFORE YOU REPLY, CHECK'])
      assert.ok(sections.includes(h), 'section ' + h + ' starts after a blank line');
    assert.ok(!/\n\n- /.test(p.slice(p.indexOf('WRITING EACH PART'), p.indexOf('OUTPUT'))), 'no bullet starts a block on its own');
  }
});

test('write-lesson: the rules stay short (they were 3,600 words; the eval asked for about 2,600)', () => {
  // Words from WRITING EACH PART to the end of the prompt, as the eval counted them. Every rule
  // that applies to the idea is in; the ones that do not (history, sound, debate, targets) are out.
  for (const [plan, iid, opts] of [[PLAN_JET, 'i1', { research: RESEARCH_JET }], [PLAN_JET, 'i2', { research: RESEARCH_JET }], [{ ...PLAN_JET, level: 'new' }, 'i3', {}],
    [PLAN_ROME, 'i1', {}], [PLAN_ROME, 'i4', {}], [PLAN_ROME, 'i5', {}], [PLAN_ROME, 'i7', {}]]) {
    const n = wordsOf(rulesOf(lessonFor(plan, iid, opts)));
    assert.ok(n <= 2850, plan.title + ' ' + iid + ': ' + n + ' words of rules');
  }
});

// Examples in the prompts come from outside the subjects of the run-2 eval (vaccines, noise-cancelling
// headphones, rainbows, the Bronze Age collapse), so the next eval on those topics is fair.
const EVAL_SET = ['measles', 'chickenpox', 'memory cell', 'cells left', 'worn out', 'defender', 'lymphocyte', 'B cells', 'receptor', 'antibod', 'vaccin', 'germ',
  'no lag', 'no wait', 'trained team', 'standby', 'lock and key', 'a lock', 'headphone', 'noise', 'squeez', 'squash', 'pressure wave', 'trough', 'two pitches', 'hum fading',
  'rainbow', 'raindrop', 'torch', 'beam', 'refract', 'denser', 'prism', '42', 'line square to the surface',
  'Sea Peoples', 'New Kingdom', 'Egypt', 'bronze', 'cargo', 'pottery', '1200', '1180', '1250', 'raider', 'city emptying'];
test('prompts carry no examples lifted from the run-2 eval lessons', () => {
  // A neutral course, so every word found comes from the prompt's own text.
  const course = (kind, extra = {}) => ({
    title: 'How kites stay up', hook: 'A kite has no engine. What keeps it in the sky?', oneBreath: 'Wind pushes on a tilted kite. The string holds it at an angle.', level: 'new',
    ideas: ['mechanism', 'quantity', 'process', 'structure', kind, 'concept', 'skill'].map((k, i) => ({ id: 'i' + (i + 1), title: 'Idea ' + (i + 1) + ' about kites', oneLine: 'Kites fly when wind pushes them.', kind: k, deps: i ? ['i' + i] : [] })),
    calibration: [{ id: 'c1', iid: 'i1', q: 'What lifts a kite?', options: ['Wind', 'Magic', 'String'], answer: 0, why: 'Wind pushes on it.' }, { id: 'c2', iid: 'i2', q: 'Longer string?', options: ['Higher', 'Lower', 'Same'], answer: 0, why: 'It can climb.' }],
    ...extra,
  });
  const research = { sources: [{ n: 1, title: 'Kites — Example', url: 'https://example.org/kites', quote: 'Wind pushes on the kite.' }],
    topic: { notes: [] }, ideas: { i1: { notes: [{ claim: 'Wind pushes on the kite.', sourceIds: [1], contested: 'Some argue about lift.' }] } } };
  const prompts = [U.prompts.planTopic('kites', { level: 'new' }), U.prompts.research(course('history'), { ideas: course('history').ideas }),
    U.prompts.grade({ prompt: 'Why does a kite fly?', rubric: ['Wind pushes it', 'The string holds it'], model: 'Wind pushes it up.' }, 'wind', { attempt: 2 }),
    U.prompts.tutor({ topic: course('history'), idea: course('history').ideas[0], tools: true })];
  for (const kind of ['history', 'mechanism']) {
    for (const level of ['new', 'solid']) {
      const t = course(kind, { level, title: kind === 'history' ? 'How kites spread, and the sound they make' : 'How kites stay up' });
      t.ideas[6].title = 'Why people argue about the first kite';
      for (const i of t.ideas) prompts.push(lessonFor(t, i.id, { research }), lessonFor(t, i.id, {}));
    }
  }
  for (const p of prompts) for (const w of EVAL_SET) assert.ok(!p.toLowerCase().includes(w.toLowerCase()), 'eval phrase in a prompt: "' + w + '" in ' + p.split('\n')[0]);
});

test('prompt builders stay pure and start with their TASK line', () => {
  assert.equal(typeof globalThis.document, 'undefined');
  const all = {
    'plan-topic': U.prompts.planTopic('how sound travels', { level: 'new' }),
    research: U.prompts.research(PLAN_JET, { ideas: PLAN_JET.ideas }),
    'write-lesson': lessonFor(PLAN_ROME, 'i4', { prior: [] }),
  };
  for (const [task, p] of Object.entries(all)) {
    assert.ok(p.startsWith('TASK: ' + task + '\n'), task);
    assert.equal(count(p, '\nTASK:'), 0, task + ' has one TASK line');
    assert.ok(!/undefined|\[object Object\]|NaN|^null$/m.test(p), task + ' leaks nothing');
  }
});

// =========================================================================================
// Research routing: lessonResearch lends a lesson the notes filed under other ideas
// =========================================================================================
const page = (n) => ({ n, title: 'Page ' + n, url: 'https://example.org/p' + n, quote: 'an exact quote number ' + n });
const COURSE = [
  { id: 'i1', kind: 'structure', deps: [] }, { id: 'i2', kind: 'history', deps: ['i1'] }, { id: 'i3', kind: 'process', deps: [] },
  { id: 'i4', kind: 'history', deps: [] }, { id: 'i5', kind: 'concept', deps: [] }, { id: 'i6', kind: 'history', deps: [] },
].map((i) => ({ ...i, title: 'Idea ' + i.id, oneLine: 'One line of ' + i.id }));
const ROUTED = {
  sources: Array.from({ length: 9 }, (_, i) => page(i + 1)),
  topic: { notes: [{ claim: 'The town lies on a river.', sourceIds: [9] }] },
  ideas: {
    i1: { notes: [{ claim: 'The council met in the hall.', sourceIds: [1] }, { claim: 'The town wall was built in 1350 BC.', sourceIds: [2] }] },
    i2: { notes: [{ claim: 'The mill was built in AD 1086.', sourceIds: [3] }] },
    i3: { notes: [{ claim: 'Floods came every spring.', sourceIds: [4] }, { claim: 'The harbour silted up during the 14th century.', sourceIds: [5] },
      { claim: 'The records cover only the town centre, which limits i2.', sourceIds: [6] }] },
    i4: { notes: [{ claim: 'The bridge opened c. 1450.', sourceIds: [7] }] },
    i5: { notes: [{ claim: 'Historians dispute a date of 1300 BC.', sourceIds: [], contested: 'Two schools disagree.' }] },
    i6: { notes: [{ claim: 'The castle fell in 1644.', sourceIds: [8] }, { claim: 'The mill was built in AD 1086.', sourceIds: [3] }] },
  },
};
const view = (lr) => plain(lr.notes).map((n) => [n.scope, n.claim, n.sourceIds]);

test('lessonResearch: a history lesson borrows other ideas\' dated notes, nearest ideas first, after its own', () => {
  const lr = U.prompts.lessonResearch(ROUTED, 'i2', ['i1'], COURSE);
  assert.deepEqual(view(lr), [
    ['idea', 'The mill was built in AD 1086.', [1]],
    // i3 (next door): a dated note, and one that names i2; then i4; i5's only note has no source; i6's
    // copy of i2's own note is not repeated. i1 is an idea i2 builds on: all its notes come as 'earlier'.
    ['other', 'The harbour silted up during the 14th century.', [5]],
    ['other', 'The records cover only the town centre, which limits i2.', [6]],
    ['other', 'The bridge opened c. 1450.', [7]],
    ['other', 'The castle fell in 1644.', [8]],
    ['earlier', 'The council met in the hall.', [2]],
    ['earlier', 'The town wall was built in 1350 BC.', [3]],
    ['topic', 'The town lies on a river.', [4]],
  ]);
  // Borrowed sources are numbered after all the others, so those keep the numbers they have
  // without the course (as 31-generate numbers them today, from the docs it loads).
  const bare = U.prompts.lessonResearch(ROUTED, 'i2', ['i1']);
  assert.deepEqual(view(bare).map((n) => n[0]), ['idea', 'earlier', 'earlier', 'topic'], 'without the course, nothing is borrowed');
  assert.deepEqual(plain(lr.sources).slice(0, 4), plain(bare.sources));
  assert.deepEqual(plain(lr.sources).slice(4).map((x) => x.url), ['https://example.org/p5', 'https://example.org/p6', 'https://example.org/p7', 'https://example.org/p8']);
  // Ties go to the earlier idea: for i4, i3 comes before i5, i2 before i6.
  assert.deepEqual(view(U.prompts.lessonResearch(ROUTED, 'i4', [], COURSE)).filter((n) => n[0] === 'other').map((n) => n[1]),
    ['The harbour silted up during the 14th century.', 'The mill was built in AD 1086.', 'The castle fell in 1644.', 'The town wall was built in 1350 BC.']);
});

test('lessonResearch: any lesson borrows a note that names it; only a history lesson borrows dates', () => {
  // i3 is a process idea: no dated notes come; i5 too, but a note naming i5 does.
  assert.deepEqual(view(U.prompts.lessonResearch(ROUTED, 'i3', [], COURSE)).map((n) => n[0]), ['idea', 'idea', 'idea', 'topic']);
  const named = clone(ROUTED); named.ideas.i1.notes.push({ claim: 'For i5: the hall was also a market (not i50).', sourceIds: [1] });
  named.ideas.i6.notes.push({ claim: 'Mentions i50 only.', sourceIds: [8] });
  assert.deepEqual(view(U.prompts.lessonResearch(named, 'i5', [], COURSE)).filter((n) => n[0] === 'other').map((n) => n[1]), ['For i5: the hall was also a market (not i50).']);
  // What counts as a date: an era, a century, "c.", a year after "in" or "by", "years ago".
  for (const claim of ['Founded in 753 BC.', 'Buried by AD 79.', 'Built in the 1950s.', 'In the 14th to 13th centuries BCE.', 'About 3,200 years ago.', 'Dated c.1177.', 'Rebuilt in 1815.']) {
    const r = { sources: [page(1)], topic: { notes: [] }, ideas: { i1: { notes: [{ claim, sourceIds: [1] }] }, i2: { notes: [] } } };
    assert.equal(U.prompts.lessonResearch(r, 'i2', [], COURSE).notes.length, 1, 'dated: ' + claim);
  }
  for (const claim of ['It weighs about 1500 kg.', 'Up to 1,000 people lived there.', 'The 12 gates opened at dawn.']) {
    const r = { sources: [page(1)], topic: { notes: [] }, ideas: { i1: { notes: [{ claim, sourceIds: [1] }] }, i2: { notes: [] } } };
    assert.equal(U.prompts.lessonResearch(r, 'i2', [], COURSE), null, 'not dated: ' + claim);
  }
});

test('lessonResearch: borrowing is capped, and works on the stored docs too', () => {
  // At most 8 borrowed notes, bringing at most 12 new sources between them.
  const many = { sources: Array.from({ length: 40 }, (_, i) => page(i + 1)), topic: { notes: [] }, ideas: { i2: { notes: [] }, i6: { notes: [] } } };
  for (let k = 0; k < 12; k++) many.ideas.i6.notes.push({ claim: 'Event ' + k + ' happened in AD ' + (1000 + k) + '.', sourceIds: [k + 1] });
  const a = U.prompts.lessonResearch(many, 'i2', [], COURSE);
  assert.equal(a.notes.length, 8);
  const wide = clone(many);
  wide.ideas.i6.notes = Array.from({ length: 8 }, (_, k) => ({ claim: 'Event ' + k + ' happened in AD ' + (1000 + k) + '.', sourceIds: [2 * k + 1, 2 * k + 2] }));
  const b = U.prompts.lessonResearch(wide, 'i2', [], COURSE);
  assert.equal(b.notes.length, 6, 'the seventh would bring a 13th and 14th source');
  assert.equal(b.sources.length, 12);
  // The pipeline's stored docs: the other ideas' docs come as `others`, keyed by idea id.
  const docs = { idea: { notes: [{ claim: 'Own fact', sourceIds: [1] }], sources: [page(1)] }, earlier: [], topic: null,
    others: { i4: { notes: [{ claim: 'The bridge opened c. 1450.', sourceIds: [1] }], sources: [{ ...page(7), n: 1 }] }, i3: { notes: [{ claim: 'Floods came every spring.', sourceIds: [1] }], sources: [page(4)] } } };
  assert.deepEqual(view(U.prompts.lessonResearch(docs, 'i2', [], COURSE)), [['idea', 'Own fact', [1]], ['other', 'The bridge opened c. 1450.', [2]]]);
  assert.deepEqual(view(U.prompts.lessonResearch(docs, 'i2', [])), [['idea', 'Own fact', [1]]], 'without the course, nothing is borrowed');
});

test('lessonResearch: the lesson prompt marks borrowed notes, and the eval validator numbers sources the same way', () => {
  const topic = { title: 'A river town', oneBreath: 'A town grew by a river.', level: 'some', ideas: COURSE, calibration: [] };
  const p = lessonFor(topic, 'i2', { research: ROUTED });
  assert.ok(p.includes('- The bridge opened c. 1450. [7]  (from another idea in this course)'), 'marked, with its own number');
  assert.ok(p.includes('[7] Page 7 — https://example.org/p7'));
  // tools/eval/validate.mjs, given --topic, accepts a lesson citing a borrowed source by that number.
  const dir = mkdtempSync(join(tmpdir(), 'mu-route-'));
  const lr = U.prompts.lessonResearch(ROUTED, 'i2', ['i1'], COURSE);
  const l = clone(L_JET2);
  l.iid = 'i2';
  l.sources = [clone(lr.sources[0]), clone(lr.sources[6])];
  l.explain.text = l.explain.text.replace('[^1]', '[^1][^7]');
  l.interactive.numbers.forEach((x) => { if (x.source != null) x.source = 1; });
  writeFileSync(join(dir, 'reply.json'), JSON.stringify(l));
  writeFileSync(join(dir, 'research.json'), JSON.stringify(ROUTED));
  writeFileSync(join(dir, 'topic.json'), JSON.stringify(topic));
  const run = (...extra) => spawnSync(process.execPath, [join(root, 'tools', 'eval', 'validate.mjs'), 'lesson', join(dir, 'reply.json'), '--iid', 'i2', '--sources', join(dir, 'research.json'), ...extra], { cwd: root, encoding: 'utf8' });
  const r = run('--topic', join(dir, 'topic.json'));
  if (r.status !== 0 && /33-interactive/.test(r.stderr)) return; // the eval loader also needs 33-interactive.js
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(JSON.parse(r.stdout).ok, true);
  const without = run();
  assert.ok(/not one of the supplied research sources/.test(without.stdout) && /warning: no --topic/.test(without.stderr), 'without the course, [7] is not a source of this lesson');
});

// =========================================================================================
// The research and plan prompts
// =========================================================================================
test('research: causes first, budget spent in order, dated events filed under every history idea that needs them', () => {
  const p = U.prompts.research(PLAN_ROME, { ideas: PLAN_ROME.ideas });
  for (const s of ['Ideas (id, title — one line, [kind]):',
    'The budget will not cover everything below, so spend it in this order: what causes each idea\'s headline; the claim in each idea\'s one line; the principle and constants each interactive computes with; the dated events a history idea\'s timeline shows; then the rest.',
    'A claim you find no source for gets no note',
    'write 1-6 claim notes (up to 8 for a history idea)',
    '- what causes the idea\'s headline: what is physically different, step by step, from a page that explains it',
    '(for "ice floats": how the molecules are packed in ice)',
    '- the conclusion in the one line\'s "so …";', '- why it mattered to people then, when a source says so;',
    'quote one sentence that defines it (density = mass ÷ volume) as well as one that gives its value',
    'dated events across its whole period, earliest to latest, from as many places as the budget allows (aim for five)',
    'for each dated event, also quote how it was dated (a dated document, coins, tree rings, radiocarbon) when the page says so',
    'File each claim under the idea that teaches it and under every other idea whose lesson needs it: a dated event under every history idea whose period it falls in, a fact that limits a claim under that idea.',
    'Keep in it any date, place or qualifier that limits the claim; never cut a sentence so it reads wider than it was.',
    'Prefer a page\'s general statement to its description of one figure.',
    'A date range in brackets after a name (a period, a dynasty, a reign) dates that name, not the event in the sentence',
    '(60 years called "a century")', '(source\'s wording is loose: …)', 'add a quote that names and dates it',
    'prefer the excavators\' or a specialist\'s account to an encyclopedia summary',
    'that the cited quotes actually support, and no more strongly', 'Name exactly what the quote names (Atlantic hurricanes, not "storms")',
    'Never add "only", "always", "all", "never", "no" or a stronger verb ("causes" for "is linked to")', 'State an absolute ("none", "instant") only when no page you were shown says something weaker'])
    assert.ok(p.includes(s), s);
  // The old filing rule (only under ideas whose claim it limits) is gone.
  assert.ok(!p.includes('also under every idea whose main claim it limits'));
  // Its contract is unchanged: every note cites a source unless contested (a claim without one is left out).
  assert.ok(!/note saying so|no source found/i.test(p));
});

test('plan: each one line is true as a textbook would put it; the adult, whole-field and calibration rules stay', () => {
  const p = U.prompts.planTopic('Maths', { level: 'new' });
  assert.ok(p.includes('- oneLine: one sentence (at most 25 words) saying what he will understand, in plain words, true as stated and as a textbook would put it: hedged where reality is graded ("much slower", not "stops"), and naming the narrower kind when it covers only one kind ("flowering plants", not "plants"). Each lesson treats it as its learning goal.'));
  for (const s of ['NEW to this subject, not to life', 'A whole field ("Maths", "Physics", "History", "Music")', 'so the answer must not appear in the title, hook, oneBreath or any idea\'s title or oneLine'])
    assert.ok(p.includes(s), 'kept: ' + s);
});
