// Unit tests for the refresher-lesson pieces that run without a page (docs/ARCHITECTURE.md
// sections 5 and 6, app/kit/REFRESHER.md): the kit's typed-answer grading (app/kit/kit.js, loaded
// in a VM with a stand-in DOM), the written form of the grade prompt and its validator, and the
// validators for lesson.written, lesson.summary and the case file, and the fact-check's fix paths
// for them. kit.spec.mjs, lesson.spec.mjs and dossier.spec.mjs check the same in a browser.
// Run: node --test tests/refresher.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPrompts } from '../tools/eval/prompts.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const plain = (x) => JSON.parse(JSON.stringify(x));

// The kit in a VM: every DOM call answers with a harmless stand-in, so only the pure parts are
// exercised (K.answer.grade and K.answer.read never touch the page).
function kit() {
  function any() {
    const f = function () { return any(); };
    return new Proxy(f, {
      get(t, k) { if (k === Symbol.toPrimitive) return () => ''; if (k === 'length') return 0; if (k === 'readyState') return 'loading'; return any(); },
      apply() { return any(); }, construct() { return any(); }, set() { return true; },
    });
  }
  const Node = { prototype: {} };
  Object.defineProperty(Node.prototype, 'parentNode', { get() { return null; } });
  const ctx = vm.createContext({ console, setTimeout, clearTimeout, document: any(), Node, getComputedStyle: () => any(), matchMedia: () => ({ matches: false }) });
  vm.runInContext('var window = globalThis; window.addEventListener = function () {}; window.parent = window;', ctx);
  vm.runInContext(readFileSync(join(root, 'app', 'kit', 'kit.js'), 'utf8'), ctx, { filename: 'kit.js' });
  return ctx.K;
}
const K = kit();
const U = loadPrompts();

test('K.answer.grade: the course\'s figure within half a unit in its last place, the unrounded one when accepted', () => {
  const spec = { answer: 13.33, accept: [13.32], unit: 'A', slips: [{ value: 23.08, hint: 'That is the line current.' }] };
  const st = (t, s = spec) => K.answer.grade(t, s).state;
  assert.equal(st('13.33'), 'right');
  assert.equal(st('13.334'), 'right', 'within 0.005');
  assert.equal(st('13.336'), 'wrong', 'beyond half a unit in the second place');
  assert.equal(st('13.32'), 'right', 'the answer worked from unrounded figures, accepted');
  assert.equal(K.answer.grade('13.32', spec).accepted, 0);
  assert.equal(st('13.3'), 'wrong', 'one place short is not the course\'s figure');
  assert.equal(st('13,33'), 'right', 'a decimal comma');
  assert.equal(st('13.33 A'), 'right', 'its own unit typed after it');
  assert.equal(st('13.33A'), 'right');
  assert.deepEqual(plain(K.answer.grade('13.33 V', spec)), { state: 'unreadable', unit: true }, 'another unit');
  assert.equal(st(''), 'empty');
  assert.equal(st('   '), 'empty');
  assert.equal(st('about 13'), 'unreadable');
  assert.equal(st('13.33.1'), 'unreadable');
  const slip = plain(K.answer.grade('23.08', spec));
  assert.deepEqual(slip, { state: 'wrong', value: 23.08, slip: 0, hint: 'That is the line current.' });
});

test('K.answer.grade: decimals, tolerance, grouping and signs', () => {
  assert.equal(K.answer.grade('0.44', { answer: 0.436 }).state, 'wrong', 'an answer with three places is held to three');
  assert.equal(K.answer.grade('0.436', { answer: 0.436 }).state, 'right');
  assert.equal(K.answer.grade('30', { answer: 30.01, decimals: 0 }).state, 'right', 'decimals: 0 rounds to the unit');
  assert.equal(K.answer.grade('29.9', { answer: 30, tolerance: 0.2 }).state, 'right', 'an explicit tolerance');
  assert.equal(K.answer.grade('20 000', { answer: 20000 }).state, 'right');
  assert.equal(K.answer.grade('1,000.5', { answer: 1000.5 }).state, 'right');
  assert.equal(K.answer.grade('1,000', { answer: 1000 }).state, 'right', 'a thousands comma');
  assert.equal(K.answer.grade('−4.2', { answer: -4.2 }).state, 'right', 'a true minus sign');
  assert.equal(K.answer.grade('-4.2', { answer: 4.2 }).state, 'wrong');
  assert.deepEqual(plain(K.answer.read('.5 mm²', 'mm²')), { value: 0.5 });
});

test('the grade prompt\'s written form: TASK first, the points as a mark scheme, need, wrong, no model answer; pure', () => {
  const say = { prompt: 'State two reasons a designer applies diversity.', rubric: ['Common sense: not every load at once', 'Smaller cables at lower cost'], model: 'Because…', need: 1 };
  const p = U.prompts.grade(say, 'Not everything runs at once.', { attempt: 2, written: true, title: 'Maximum demand' });
  assert.equal(p.split('\n')[0], 'TASK: grade');
  assert.ok(p.includes('a full answer makes any 1 of the 2 points') && p.includes('1. Common sense: not every load at once'));
  assert.ok(p.includes('"got-it" when at least 1 point is met') && p.includes('"wrong": "<one sentence'));
  assert.ok(!p.includes('"model": "…"') && p.includes('Leave out "model"'), 'even on the second go, no model answer from Claude');
  // Five points fit; the say-it-back form is unchanged.
  const five = U.prompts.grade({ prompt: 'q', rubric: ['a', 'b', 'c', 'd', 'e'], model: 'm' }, 'x', { written: true });
  assert.ok(five.includes('"met" has exactly 5 entries') && five.includes('makes every point'));
  const say1 = U.prompts.grade({ prompt: 'q', rubric: ['a', 'b'], model: 'm' }, 'x', { attempt: 2 });
  assert.ok(say1.includes('RUBRIC (what a complete answer contains)') && say1.includes('"model": "…"') && !say1.includes('"wrong"'));
});

test('U.validate.grade: up to five points, need sets got-it, wrong is a string', () => {
  const ok = (o, opts) => plain(U.validate.grade(o, opts));
  assert.deepEqual(ok({ met: [true, true, true, false, false], verdict: 'got-it', nailed: 'x', followUp: '', wrong: '' }, { rubric: 5, need: 3, written: true }), []);
  assert.ok(ok({ met: [true, true, false, false, false], verdict: 'got-it', nailed: 'x', followUp: '' }, { rubric: 5, need: 3, written: true })[0].includes('fewer than 3'));
  assert.ok(ok({ met: [true, false], verdict: 'got-it', nailed: 'x', followUp: '' }, { rubric: 2 })[0].includes('not every rubric point'));
  assert.ok(ok({ met: [true], verdict: 'got-it', nailed: 'x', followUp: '', wrong: 3 }, { rubric: 1, written: true }).some((p) => /wrong must be/.test(p)));
  assert.deepEqual(ok({ met: [true, true, true, true, true], verdict: 'got-it', nailed: 'x', followUp: '' }, {}), [], 'five without a count');
});

const WRITTEN = { b1: { q: 'Explain why Ib is worked at the sub-board\'s voltage.', need: 3, model: 'The board sits below 400 V…',
  points: [{ text: 'The submain drops voltage', cite: 'Slides p.18' }, { text: 'A lower voltage needs more current', cite: 'Slides p.13, 19' },
    { text: 'The device and cable are chosen from Ib', cite: 'Slides p.22' }, { text: '28.87 A at 400 V, 29.38 A at 393 V', cite: 'Slides p.16, 19' }] } };
const CASE = { title: 'The showroom', scenario: { title: 'Your showroom: the motor', text: 'An 11 kW motor…', source: 'Pack p.3, 4' },
  givens: [{ id: 'ze', label: 'Ze', value: 0.1, unit: 'Ω', text: '0.1 Ω', cite: 'Pack p.3' }],
  assumptions: [{ id: 'starter', text: 'The starter is beside the motor (the course\'s own assumption).' }],
  figures: [{ id: '1a', lesson: 'i1', part: '1a', label: 'Design current, Ib', value: 23.08, unit: 'A', text: '23.08 A' }, { id: '1b', lesson: 'i1', part: '1b', label: 'Delta, per cable', value: 13.33, text: '13.33 A' }] };
const SUMMARY = { title: 'Design current, Ib', for: 'The current the circuit carries in normal service.', rule: 'Ib = P ÷ (√3 × UL × eff × pf)\n\nU is the voltage at the board.',
  traps: [{ text: 'Output alone', cite: 'Slides p.17' }], where: 'Slides p.10–19', figures: ['1a', '1b'] };

test('U.validate.written: three to five points, each with its citation; need within them; a model answer', () => {
  assert.deepEqual(plain(U.validate.written(WRITTEN)), []);
  const bad = JSON.parse(JSON.stringify(WRITTEN));
  bad.b1.points[1].cite = '';
  bad.b1.need = 5;
  delete bad.b1.model;
  const p = plain(U.validate.written(bad));
  assert.ok(p.some((x) => /points\[1\]\.cite must say where/.test(x)) && p.some((x) => /need must be/.test(x)) && p.some((x) => /model must be/.test(x)), p.join(' | '));
  const six = { b1: { ...WRITTEN.b1, points: Array.from({ length: 6 }, () => ({ text: 't', cite: 'c' })) } };
  assert.ok(plain(U.validate.written(six)).some((x) => /1-5 points/.test(x)));
  assert.ok(plain(U.validate.written({ 'B 1': WRITTEN.b1 })).some((x) => /id must be/.test(x)));
});

test('U.validate.summary and caseFile: every trap and given cited, figures from the case file, each worked figure tied to its lesson', () => {
  assert.deepEqual(plain(U.validate.summary(SUMMARY, { caseFile: CASE })), []);
  assert.deepEqual(plain(U.validate.caseFile(CASE)), []);
  const s2 = { ...SUMMARY, traps: [{ text: 'x' }], figures: ['1a', 'zz', { label: 'Ze', value: '0.1 Ω' }] };
  const p = plain(U.validate.summary(s2, { caseFile: CASE }));
  assert.ok(p.some((x) => /traps\[0\]\.cite/.test(x)) && p.some((x) => /"zz", which is not in the case file/.test(x)) && p.length === 2, p.join(' | '));
  const c2 = JSON.parse(JSON.stringify(CASE));
  delete c2.givens[0].cite;
  c2.figures[1].lesson = 'lesson one';
  c2.figures.push({ id: '1a', lesson: 'i1', label: 'again', value: 1 });
  const q = plain(U.validate.caseFile(c2));
  assert.ok(q.some((x) => /givens\[0\]\.cite/.test(x)) && q.some((x) => /figures\[1\]\.lesson/.test(x)) && q.some((x) => /"1a" is used twice/.test(x)), q.join(' | '));
});

test('U.validate.lesson checks a lesson\'s written questions and summary when it has them', () => {
  const L = JSON.parse(readFileSync(join(root, 'tests', 'fixtures', 'lesson-jet-engines-i1.json'), 'utf8'));
  const base = plain(U.validate.lesson(L, { iid: L.iid })).length;
  const withBoth = { ...L, written: WRITTEN, summary: SUMMARY };
  assert.equal(plain(U.validate.lesson(withBoth, { iid: L.iid, caseFile: CASE })).length, base, 'a good written question and summary add nothing');
  const bad = { ...L, written: { b1: { ...WRITTEN.b1, points: [{ text: 'no cite' }] } }, summary: { ...SUMMARY, traps: [{ text: 'no cite' }] } };
  const p = plain(U.validate.lesson(bad, { iid: L.iid, caseFile: CASE }));
  assert.ok(p.some((x) => /written\.b1\.points\[0\]\.cite/.test(x)) && p.some((x) => /summary\.traps\[0\]\.cite/.test(x)));
  assert.ok(U.validate.hard(U.validate.lesson(bad, { iid: L.iid, caseFile: CASE })).some((x) => /cite/.test(x)), 'a missing citation is a hard problem');
});

test('the fact-check may fix a written point, a model answer and the summary\'s words, and lists them only for such a lesson', () => {
  const L = JSON.parse(readFileSync(join(root, 'tests', 'fixtures', 'lesson-jet-engines-i1.json'), 'utf8'));
  const R = { ...L, written: WRITTEN, summary: SUMMARY };
  const r = U.verify.apply(R, { issues: [
    { path: 'written.b1.points[3].text', problem: 'slide 19 says 393 V', severity: 'fix', now: '28.87 A at 400 V against 29.38 A at 393 V' },
    { path: 'summary.rule', problem: 'say the board', severity: 'fix', now: 'Ib = P ÷ (√3 × U × eff × pf), U at the board' },
    { path: 'written.b1.points[0].cite', problem: 'frozen', severity: 'fix', now: 'p.19' },
  ] });
  assert.equal(r.lesson.written.b1.points[3].text, '28.87 A at 400 V against 29.38 A at 393 V');
  assert.equal(r.lesson.summary.rule, 'Ib = P ÷ (√3 × U × eff × pf), U at the board');
  assert.deepEqual(plain(r.notes).map((n) => n.path), ['written.b1.points[0].cite'], 'a citation is not rewritten by the check');
  const pr = U.prompts.verifyLesson ? U.prompts.verifyLesson : U.verify.prompt;
  const topic = JSON.parse(readFileSync(join(root, 'tests', 'fixtures', 'plan-jet-engines.json'), 'utf8'));
  const idea = topic.ideas.find((i) => i.id === L.iid);
  assert.ok(pr(topic, idea, R, {}).includes('written.*.points[i].text') && !pr(topic, idea, L, {}).includes('written.*'), 'listed only for a refresher lesson');
});
