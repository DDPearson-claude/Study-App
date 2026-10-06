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
  for (const [field, set] of [
    ['explain.text', (l) => { l.explain.text += ' Twice the air at half speed gives the same push.'; }],
    ['predict.reveal', (l) => { l.predict.reveal += ' Twice the air at half speed ties.'; }],
    ['say.model', (l) => { l.say.model += ' Twice the air at half speed is a tie.'; }],
  ]) {
    const l = clone(base); set(l);
    const hits = found(check(l), /^checks\[2\]\.options\[2\] \(the right answer\) repeats/);
    assert.deepEqual(hits, [`checks[2].options[2] (the right answer) repeats "twice the air at half speed" from ${field}, so Dan can pick it by recognising your wording: say it in other words, as an outcome he has to reason to.`]);
  }
  // Three words in a row, or four that are only little words, prove nothing.
  const three = clone(base); three.explain.text += ' Twice the air is a lot.';
  assert.deepEqual(plain(check(three)), []);
  const little = clone(base);
  little.checks[2].options = ['It doubles the push', 'It halves the push', 'It is one of the same', 'It drops to a quarter'];
  little.explain.text += ' This is one of the same kind.';
  assert.deepEqual(plain(check(little)), []);
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
  for (const s of ['Neither that screen nor this idea\'s title and one line, which he has read, may give the answer.',
    'where intuition fails (how much, how soon, which way, an in-between setting, a changed condition, the case where nothing happens)',
    'without stating the rule or the mechanism',
    'If the title and question alone let him rule out every wrong option, or most adults would get it right, ask about another case.',
    '(it gives the rule)',
    'in the same terms and about the same length, with no reason attached to any',
    'no straw men',
    'When only a detail is debated (how long, how many), predict what the evidence settles and leave the debate to the reveal, so no option is right under one view and wrong under another.',
    '- Neither the interactive\'s opening state, the idea\'s title and one line, nor the calibration answers already answer the predict.',
    'Dan sees the "when you ___" half before he plays: it must not give the answer away.'])
    assert.ok(p.includes(s), s);
});

test('write-lesson: checks test reasoning; a target check is optional, quizzed with its readout hidden', () => {
  const p = lessonFor(PLAN_JET, 'i1');
  for (const s of ['the why; its limit, such as memory of measles doing nothing against chickenpox; a new case',
    'not recall of a wording, a source\'s phrase or a number the lesson stated',
    'At least two are set in a case the interactive did not show, and at least one asks him to compare or reason about amounts',
    'A target check is answered on the interactive, so a lesson with one has three checks.',
    'never a later idea',
    'if you cannot say who believes one, replace it',
    'four words in a row of your explanation, reveal or model answer',
    'the question states no fact that rules an option out',
    'Only for an order he could get wrong',
    'no "it" or "then" pointing at another, never the interactive\'s own step names',
    'which he can reason his way to and the lesson never states',
    'which hides that readout and the sentence under the picture while he answers',
    'Write one only when reaching it needs the idea: a value the lesson never prints',
    'some step of the control must show the target exactly at the readout\'s decimals (else ask for "about Z"); why names every setting that works'])
    assert.ok(p.includes(s), s);
  assert.ok(!/Include one whenever|must have a target|include one check of type "target"/i.test(p), 'no rule left that forces a target check');
});

test('write-lesson: the interactive draws the cause, and its form follows the kind', () => {
  const kinds = {
    mechanism: ['with the cause drawn', 'set off by an action he performs', 'Include a setting where the cause does not produce the effect'],
    quantity: ['also show the pile: send 50 or more evenly spaced cases through the rule'],
    process: ['Draw the thing that carries the change', 'a stepper alone is a slideshow', 'controls: one. Add a second only if the idea cannot be seen without it (a switch for an earlier stage\'s cause counts)'],
    history: ['a timeline he acts on, not a slideshow', 'A stepper only when every step changes the drawing.'],
  };
  for (const [kind, says] of Object.entries(kinds)) {
    const plan = clone(PLAN_JET); plan.ideas[1].kind = kind;
    const p = lessonFor(plan, 'i2');
    for (const s of says) assert.ok(p.includes(s), kind + ': ' + s);
  }
  const p = lessonFor(PLAN_JET, 'i1');
  for (const s of ['at the heart of the idea rather than a step towards it', 'for a mechanism, the cause as well as the effect', '(no cause) Good: "…the near edge of the beam slowing first',
    'stay on the side of it the idea is about (past a turning point only when the turning point is the lesson)', 'labelled "sketch map"',
    '- Every consequence your explanation states, and the cause its why names, can be seen on some setting of the interactive.'])
    assert.ok(p.includes(s), s);
});

test('write-lesson: claims stay true on a review card, and the explanation gives the real why', () => {
  const p = lessonFor(PLAN_JET, 'i2', { research: RESEARCH_JET });
  for (const s of ['CLAIMS THAT STAY TRUE', 'return as review cards for months, without your ignores panel',
    'Never call a belief wrong in general because it fails here', '(try both ends and the middle)', 'Words of time and size',
    '"one type of receptor" never becomes "a single detector"', 'State each rule in the general form later ideas need',
    'Never say a source lacks something',
    'First what the picture would wrongly suggest', 'A condition the result needs (only at one spot) is not an omission: state it with the result.',
    'The first step is something he already knows or has felt', 'make sure your reason does not equally describe the earlier case',
    'If you use a teaching model (a rigid beam), say so in a clause and set confidence to "simplified"', '"One way to picture it: …"',
    'footnoted when a source supports it and no wider than the places and period the sources describe',
    'Put [^n] straight after the words its quote supports', 'so the footnote sits only on the supported part', 'shows real people acting on the rule'])
    assert.ok(p.includes(s), s);
  // The same rules, word for word, for anything that later checks a lesson against them.
  const rules = U.prompts.truthRules({ sources: true, history: false });
  assert.ok(rules.startsWith('CLAIMS THAT STAY TRUE\n') && rules.includes('\n\nTHE NUMBER RULE\n'));
  assert.ok(p.includes(rules), 'writeLesson carries truthRules verbatim');
  assert.ok(lessonFor(PLAN_ROME, 'i4').includes(U.prompts.truthRules({ sources: false, history: true })));
});

test('write-lesson: names, analogy, say-it-back and numbers', () => {
  const p = lessonFor(PLAN_JET, 'i2', { research: RESEARCH_JET });
  for (const s of ['One name for each thing in every part', 'one verb for one event, and no word with two meanings', 'A term of two words ("pressure wave") comes only once both words are explained',
    'not only its outcome', 'keep its mapping the same everywhere (which part is the key, which the lock)', 'in correct science',
    'set out the situation without stating any rubric point', 'no ";" or "and" joining two claims', 'the last being the conclusion the prompt asks for',
    'true of this idea but not equally of the one it builds on', 'never require a case it does not ask about',
    '"near 85%", never "at 85%"', 'labelled with nothing its quote lacks', 'worded so he can tell it was chosen', 'faithful to every shape fact in RESEARCH',
    'in metric units ("tonnes", not "tons")', 'When your model\'s result and a cited real value differ'])
    assert.ok(p.includes(s), s);
  // A new learner meets at most two new terms and two numbers; a learner who knows a little, three terms.
  assert.ok(lessonFor({ ...PLAN_JET, level: 'new' }, 'i1').includes('at most 2 new terms') && lessonFor({ ...PLAN_JET, level: 'new' }, 'i1').includes('use at most two numbers'));
  const some = lessonFor({ ...PLAN_JET, level: 'some' }, 'i1');
  assert.ok(some.includes('at most 3 new terms') && !some.includes('use at most two numbers'));
  // No sources: no talk of quotes in the number rule.
  assert.ok(!lessonFor(PLAN_ROME, 'i1').includes('labelled with nothing its quote lacks'));
});

test('write-lesson: the course puzzle is in THE COURSE, and the lesson links to it', () => {
  const p = lessonFor(PLAN_JET, 'i1');
  assert.ok(p.includes('Puzzle the course answers: ' + PLAN_JET.hook + '\n'), 'the hook, as the puzzle');
  assert.ok(p.includes('one sentence on the part this idea plays in answering the course\'s puzzle'));
  assert.ok(p.includes('Ideas, in teaching order (id, title — one line, [kind]):'), 'the "one line" the rules name is defined');
  const noHook = clone(PLAN_JET); delete noHook.hook;
  assert.ok(!lessonFor(noHook, 'i1').includes('Puzzle the course answers'), 'no empty puzzle line');
});

test('write-lesson: a later debated idea is described neutrally; history rules reach history courses only', () => {
  // Rome: i3 and i5 say historians argue. Lessons before them stay neutral; i7, after them all, need not.
  assert.ok(lessonFor(PLAN_ROME, 'i1').includes('Where a later idea is a debate, describe its subject neutrally here and leave the verdict to that lesson'));
  assert.ok(!lessonFor(PLAN_ROME, 'i7').includes('Where a later idea is a debate'));
  assert.ok(!lessonFor(PLAN_JET, 'i1').includes('Where a later idea is a debate'), 'no debate in the jet course');
  // History: date windows and period names for every lesson of a course with a history idea; the
  // "how we know" why and the axis check for a history idea itself.
  const rome4 = lessonFor(PLAN_ROME, 'i4'), rome1 = lessonFor(PLAN_ROME, 'i1'), jet = lessonFor(PLAN_JET, 'i1');
  for (const s of ['"sometime between 1200 and 1180 BC"', 'Say when a name is a modern label', 'also why it mattered to people then, from a source']) {
    assert.ok(rome4.includes(s) && rome1.includes(s), 'history course: ' + s);
    assert.ok(!jet.includes(s), 'not in the jet course: ' + s);
  }
  for (const s of ['For this history idea, the why is how we know', 'Placed on the axis you plan, your dates really show the change your brief names']) {
    assert.ok(rome4.includes(s), 'history idea: ' + s);
    assert.ok(!rome1.includes(s), 'not a structure idea: ' + s);
  }
});

test('write-lesson: sound only for a topic or idea about something heard', () => {
  const rule = 'Sound only when hearing teaches what the picture cannot';
  assert.ok(!lessonFor(PLAN_JET, 'i1').includes(rule));
  assert.ok(!lessonFor({ ...PLAN_JET, title: 'How the heart pumps blood' }, 'i1').includes(rule), '"heart" is not "hear"');
  const anc = clone(PLAN_JET); anc.title = 'How noise-cancelling headphones work';
  assert.ok(lessonFor(anc, 'i1').includes(rule + ' (two pitches, a hum fading as waves cancel): one button starts a sound that keeps playing while he moves the control. If the picture is slowed down, say by how much.'));
});

test('write-lesson: one place per rule, and no blank lines inside a section', () => {
  const p = lessonFor(PLAN_ROME, 'i4', {});
  for (const s of ['four words in a row', 'review cards', 'One name for each thing', 'sketch map', 'no straw men', 'Never invent probabilities', 'Keep a note\'s or quote\'s qualifiers',
    'a stepper alone is a slideshow', 'at most 170 words;', 'Never say a source lacks', 'how we know', '"tonnes", not "tons"', 'the answer must not', 'where intuition fails'])
    assert.ok(count(p, s) <= 1, s + ' is said once (' + count(p, s) + ')');
  // Sections are separated by one blank line; a rule left out never leaves a hole inside one.
  const sections = p.split('\n\n').map((b) => b.split('\n')[0]);
  for (const h of ['predict', 'interactive', 'explain (at most 170 words; aim for about 150)', 'analogy (optional)', 'say (say it back)', 'checks (2-3)', 'confidence', 'CLAIMS THAT STAY TRUE', 'NAMES AND TERMS', 'THE NUMBER RULE', 'SOURCES', 'BEFORE YOU REPLY, CHECK'])
    assert.ok(sections.includes(h), 'section ' + h + ' starts after a blank line');
  assert.ok(!/\n\n- /.test(p.slice(p.indexOf('WRITING EACH PART'), p.indexOf('OUTPUT'))), 'no bullet starts a block on its own');
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
// The research and plan prompts
// =========================================================================================
test('research: causes first, every one-line claim searched, qualifiers and dates kept, claims no stronger than quotes', () => {
  const p = U.prompts.research(PLAN_ROME, { ideas: PLAN_ROME.ideas });
  for (const s of ['Ideas (id, title — one line, [kind]):',
    'Search for every claim in each idea\'s one line, and for the basic principle each idea\'s interactive will compute',
    'A claim you find no source for gets no note',
    'write 1-6 claim notes (up to 8 for a history idea a timeline will show)',
    '- what causes the idea\'s headline: what is physically different, step by step, from a page that explains it',
    '- the conclusion in the one line\'s "so …";', '- why it mattered to people then, when a source says so;',
    'quote one sentence that defines it (n = speed in vacuum ÷ speed in the material) as well as one that gives its value',
    'dated events across the whole period, earliest to latest, from at least five places',
    'also under every idea whose main claim it limits', 'named case (a ship, a site) and dated event more than one idea uses',
    'Keep in it any date, place or qualifier that limits the claim; never cut a sentence so it reads wider than it was.',
    'Prefer a page\'s general statement to its description of one figure.',
    'A date range in brackets after a name (a period, a pottery phase, a reign) dates that name, not the event in the sentence',
    '(125 years called "two centuries")', '(source\'s wording is loose: …)', 'add a quote that names and dates it',
    'prefer the excavators\' or a specialist\'s account to an encyclopedia summary',
    'that the cited quotes actually support, and no more strongly', 'Name exactly what the quote names (B cells, not "lymphocytes")',
    'Never add "only", "always", "all", "never", "no" or a stronger verb', 'State an absolute ("no lag") only when no page you were shown says something weaker'])
    assert.ok(p.includes(s), s);
  // Its contract is unchanged: every note cites a source unless contested (a claim without one is left out).
  assert.ok(!/note saying so|no source found/i.test(p));
});

test('plan: each one line is true as a textbook would put it; the adult, whole-field and calibration rules stay', () => {
  const p = U.prompts.planTopic('Maths', { level: 'new' });
  assert.ok(p.includes('- oneLine: one sentence (at most 25 words) saying what he will understand, in plain words, true as stated and as a textbook would put it: hedged where reality is graded ("fits one shape, or ones very like it"), and naming the narrower kind when it covers only one kind ("B cells", not "your defenders"). Each lesson treats it as its learning goal.'));
  for (const s of ['NEW to this subject, not to life', 'A whole field ("Maths", "Physics", "History", "Music")', 'so the answer must not appear in the title, hook, oneBreath or any idea\'s title or oneLine'])
    assert.ok(p.includes(s), 'kept: ' + s);
});
