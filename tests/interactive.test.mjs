// Unit tests for the interactive build prompt (app/src/js/33-interactive.js) in Node: the maths a
// page may show at each level (eval run 2, panel change 14) and the advice for a check cited to a
// source whose quote does not say it (change 19). kit.spec.mjs checks the rest of the prompt in a browser build.
// Run: node --test tests/interactive.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => readFileSync(join(root, 'app', 'src', 'js', f), 'utf8');

function boot() {
  const ctx = vm.createContext({ console, setTimeout, clearTimeout });
  vm.runInContext('var window = globalThis;', ctx);
  for (const f of ['00-core.js', '33-interactive.js']) vm.runInContext(src(f), ctx, { filename: f });
  ctx.U.KIT_MD = readFileSync(join(root, 'app', 'kit', 'KIT.md'), 'utf8');
  ctx.U.KIT_EXAMPLES = [];
  return ctx.U;
}

const topic = (level) => ({ title: 'How levers work', level });
const idea = { id: 'i1', title: 'A longer arm lifts more', oneLine: 'Distance trades for force', kind: 'quantity' };
const lesson = {
  interactive: { brief: 'The one thing you should see is the load lifting when you move the pivot', controls: [{ id: 'd', label: 'Arm length', min: 1, max: 4, step: 0.5, value: 2, unit: 'm' }], outputs: [{ id: 'lift', label: 'Load lifted', unit: 'kg' }] },
  sources: [{ n: 1, title: 'Lever', url: 'https://example.org/lever', quote: 'A lever with arms of 2 m and 1 m lifts a 100 kg load with a 50 kg push.' }],
};

test('LEVEL: a new learner gets every rule in words and no formula beyond arithmetic; some: equations only with every symbol labelled', () => {
  const U = boot();
  const p = (level) => U.interactive.prompt(topic(level), idea, lesson);
  assert.match(p('new'), /Dan is new to this topic\. On the page \(caption, labels, \.say\), say every rule in words; no formula beyond simple arithmetic \(no cos, square roots, powers, logs or \|…\|\)\./);
  assert.match(p('some'), /Dan knows a little about this topic\. Show an equation on the page only if every symbol in it is labelled on the picture; otherwise say the rule in words\./);
  assert.match(p('solid'), /Dan is already fairly solid on this topic\./);
  assert.match(p(undefined), /Dan is new to this topic\. On the page/, 'no level reads as new');
  assert.ok(p('new').startsWith('TASK: build-interactive\n'));
});

test('advice: a check cited to a source whose quote holds none of its numbers is pointed out; one that restates the quote is not', () => {
  const U = boot();
  const advice = (checks) => Array.from(U.interactive.advice({ warnings: [], checks }, lesson));
  assert.deepEqual(advice([{ label: 'Arms of 2 m and 1 m lift 100 kg with 50 kg', ok: true, source: 'https://example.org/lever' }]), []);
  const off = advice([{ label: 'A 3 m arm lifts 150 kg', ok: true, source: 'https://www.example.org/lever/' }]);
  assert.equal(off.length, 1);
  assert.match(off[0], /^Advice: The check "A 3 m arm lifts 150 kg" cites \[1\], but none of its numbers is in that source's quote: give a source only to a check that restates the quote/);
  assert.deepEqual(advice([{ label: 'A longer arm lifts more', ok: true, source: 'https://example.org/lever' }]), [], 'no numbers: nothing to compare');
  assert.deepEqual(advice([{ label: 'A 3 m arm lifts 150 kg', ok: true }]), [], 'no source: nothing to say');
  assert.deepEqual(advice([{ label: '1,000 kg', ok: true, source: 'https://example.org/other' }]), [], 'a source the lesson does not list is the foreign-address check\'s business');
});

test('the build prompt asks for each output once, a snap for named settings, and the picture rules', () => {
  const U = boot();
  const p = U.interactive.prompt(topic('new'), idea, lesson);
  assert.ok(p.includes('show it once: as a K.readout with the same id'), 'outputs once');
  assert.ok(p.includes("add it to that slider's snap"), 'snap');
  assert.ok(p.includes('Draw the cause the explanation gives, not only its effect, and let Dan cause it'), 'the cause drawn');
  assert.ok(p.includes("on a check whose label restates what that source's quote says"), 'sources');
  assert.doesNotMatch(p, /vaccin|headphone|rainbow|bronze|copper|refracti/i, 'no example from the run-2 eval topics');
});
