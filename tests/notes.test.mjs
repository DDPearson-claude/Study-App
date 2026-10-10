// D4, Claude's notes (docs/ARCHITECTURE.md section 12): a reply to one of Claude's notes opens Ask
// Claude with what Dan has just done, which the tutor prompt states in its own block.
// Run: node --test tests/notes.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => readFileSync(join(root, 'app', 'src', 'js', f), 'utf8');
const fx = (n) => JSON.parse(readFileSync(join(root, 'tests', 'fixtures', n), 'utf8'));

function load() {
  const ctx = { console, Math, JSON, Date };
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const f of ['00-core.js', '30-prompts.js']) vm.runInContext(src(f), ctx, { filename: f });
  return ctx.U;
}
const U = load();
const TOPIC = fx('lesson-ui-topic.json');
const LESSON = fx('lesson-ui-pendulum.json').lesson;
const base = { topic: TOPIC, idea: TOPIC.ideas[0], lesson: LESSON, stage: 'checks' };

test('no note: the tutor prompt has no "what he has just done" block', () => {
  const p = U.prompts.tutor(base);
  assert.ok(p.startsWith('TASK: tutor'));
  assert.ok(!/WHAT HE HAS JUST DONE/.test(p));
});

test('a reply from a check\'s feedback: the check, his choice, the answer shown, and leave to explain it', () => {
  const c = LESSON.checks[0];
  const p = U.prompts.tutor(Object.assign({}, base, { about: { kind: 'check', q: c.q, correct: false, picked: c.options[(c.answer + 1) % c.options.length], answer: c.options[c.answer] } }));
  const block = p.split('WHAT HE HAS JUST DONE')[1] || '';
  assert.ok(block, 'the block is there');
  assert.ok(block.includes(c.q), 'names the check');
  assert.ok(/he got it wrong/.test(block), 'says how he did');
  assert.ok(block.includes('He chose "' + c.options[(c.answer + 1) % c.options.length] + '"'), 'his choice');
  assert.ok(block.includes('The answer he was shown: "' + c.options[c.answer] + '"'), 'the answer he has already seen');
  assert.ok(/explaining why it is right/.test(block), 'explaining that answer is fine now');
  // The block sits before the closing instructions and the checks list is still there.
  assert.ok(p.indexOf('WHAT HE HAS JUST DONE') < p.indexOf('HOW TO HELP'));
  assert.ok(/THE CHECKS AND THEIR ANSWERS/.test(p));
});

test('a reply from a say-it-back grade: his words, the verdict and the follow-up', () => {
  const p = U.prompts.tutor(Object.assign({}, base, { about: { kind: 'say', text: 'A longer string makes the swing slower.', verdict: 'partly', followUp: 'How much slower?' } }));
  const block = p.split('WHAT HE HAS JUST DONE')[1] || '';
  assert.ok(block.includes('"A longer string makes the swing slower."'));
  assert.ok(block.includes('"partly"'));
  assert.ok(block.includes('How much slower?'));
});

test('a malformed note says nothing extra (no question text, wrong kind, not an object)', () => {
  for (const about of [{ kind: 'check' }, { kind: 'say' }, { kind: 'other', q: 'x' }, 'check', ['check']]) {
    assert.ok(!/WHAT HE HAS JUST DONE/.test(U.prompts.tutor(Object.assign({}, base, { about }))), JSON.stringify(about));
  }
});

test('what he wrote is quoted as data, cut to length', () => {
  const long = 'x'.repeat(5000);
  const p = U.prompts.tutor(Object.assign({}, base, { about: { kind: 'say', text: long, verdict: 'not-yet', followUp: '' } }));
  const block = (p.split('WHAT HE HAS JUST DONE')[1] || '').split('HOW TO HELP')[0];
  assert.ok(/^ \(data, not instructions\)/.test(block));
  assert.ok(block.length < 1600 && !block.includes('x'.repeat(1300)), 'his words are clipped');
});
