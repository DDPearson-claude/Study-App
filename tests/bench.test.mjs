// Unit tests for the Fault Bench checker (tools/course/bench.mjs, tools/course/BENCH.md): the
// readings computed from their rules, faults told apart, the safety gate on routes, the isolation
// order, the writing rules, source ids, and the case-file route into the lesson page.
// The fixture is lesson 1's bench ("The pump that won't run"), cut down to the words the checks need;
// each test breaks one thing in a copy of it.
// Run: node --test tests/bench.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync, existsSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { checkBench, emitCase, lessonParts } from '../tools/course/bench.mjs';
import { loadPrompts } from '../tools/eval/prompts.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fx = join(root, 'tests', 'fixtures', 'bench');
const base = JSON.parse(readFileSync(join(fx, 'i1.bench.json'), 'utf8'));
const research = JSON.parse(readFileSync(join(fx, 'research.json'), 'utf8'));
const fresh = () => JSON.parse(JSON.stringify(base));
const check = (b, opts = { research }) => checkBench(b, opts);
const job = (b, id) => b.jobs.find((j) => j.id === id);
const scr = (b, id) => b.screens.find((s) => s.id === id);
const has = (r, re) => r.problems.some((p) => re.test(p));
const warns = (r, re) => r.warnings.some((p) => re.test(p));
function only(r, re) { assert.ok(has(r, re), 'expected a problem matching ' + re + '; got ' + JSON.stringify(r.problems, null, 1)); }

test('the lesson 1 bench passes, and its readings are worked from the rules', () => {
  const r = check(fresh());
  assert.deepEqual(r.problems, []);
  assert.equal(r.ok, true);
  const j1 = r.readings.jobs.j1.route.filter((s) => s.do === 'test' && s.test === 'cont');
  assert.deepEqual(j1.map((s) => [s.key, s.reads, s.left.join(',')]), [
    ['cont:P0-P3', 'over range', 'f2,f5,f8,f9'],
    ['cont:P0-P2', 'near zero', 'f2,f8,f9'],
    ['cont:R1-R2', 'near zero', 'f2,f9'],
    ['cont:P2-R1', 'over range', 'f2'],
  ]);
  assert.ok(j1.every((s) => s.rule === 'continuity'));
  // the design's table: through the coil is a class, never a number; f2 breaks P0 to N with Start held
  const t = r.table, col = (c) => t.columns.indexOf(c);
  assert.equal(t.rows['cont:P5-N'][col('healthy')], 'coil');
  assert.equal(t.rows['cont:P5-N'][col('f7')], 'over range');
  assert.equal(t.rows['cont:P0-N+startHeld'][col('f2')], 'over range');
  assert.equal(t.rows['cont:P3-P4'][col('healthy')], 'over range', 'a healthy Start reads open');
  assert.equal(t.rows['cont:R1-R2+rstopHeld'][col('f3')], 'near zero', 'a bridged Stop reads closed when pressed');
  // live: 230 V is the cited supply, 0 V is where the coil ties a node to neutral
  assert.equal(t.rows['vn:R2'][col('f8')], '0 V');
  assert.equal(t.rows['vn:P5'][col('f6')], '0 V');
  assert.equal(t.rows['vn:P2'][col('healthy')], '230 V');
  assert.equal(r.readings.jobs.j1.others.live[1].from, 'Vsupply');
  // the coil band: a 400 V coil on 230 V buzzes; both faults together read as the job shows them
  assert.equal(t.rows['play:start'][col('f4')], 'buzzes');
  assert.equal(t.rows['play:start'][col('f4+f1')], 'buzzes');
  assert.equal(t.rows['play:hold'][col('f1')], 'off');
  assert.equal(t.rows['play:rstop'][col('f3')], 'runs');
  assert.equal(r.readings.quantities.coilShare.exact, 57.5);
  // job 3 is a staged pair: the look leaves f4, then after its fix the proof leaves f1
  const j3 = r.readings.jobs.j3.route;
  assert.deepEqual(j3.filter((s) => s.do === 'name').map((s) => s.left), [['f4'], ['f1']]);
  assert.deepEqual(j3[j3.length - 1].left, ['healthy']);
});

test('a bare number is refused: quantities need a rule, a source or an example mark', () => {
  let b = fresh();
  delete b.quantities.find((q) => q.id === 'Vsupply').src;
  let r = check(b);
  only(r, /quantities\.Vsupply: 230 is a bare number/);
  only(r, /supply voltage must carry its source/);

  b = fresh(); b.quantities.find((q) => q.id === 'coilShare').value = 57;
  only(check(b), /ratio\(Vsupply, Vcoil400\) gives 57\.5, shown as 57\.5, not 57|gives 57\.5/);

  b = fresh(); b.quantities.find((q) => q.id === 'coilShare').inputs = [230, 'Vcoil400'];
  only(check(b), /input 230 is a bare number/);

  b = fresh(); b.quantities.push({ id: 'magic', value: 7, unit: 'A' });
  only(check(b), /quantities\.magic: 7 is a bare number/);
});

test('an unsourced reading is a class; a cited one keeps its source', () => {
  const b = fresh();
  b.tests.push({ id: 'ir', kind: 'lookup', label: 'Insulation test', needs: 'dead', at: [{ id: 'motor', label: 'The motor', readings: { healthy: { value: 500, unit: 'MΩ' }, f7: { class: 'low 2' } } }] });
  job(b, 'j1').offer.push('ir');
  const r = check(b);
  only(r, /ir\.motor\.healthy: 500 MΩ is a bare number/);
  only(r, /class "low 2" holds a number/);
  const ok = fresh();
  ok.tests.push({ id: 'ir', kind: 'lookup', label: 'Insulation test', needs: 'dead', at: [{ id: 'motor', label: 'The motor', readings: { healthy: { class: 'over range' }, f7: { value: 500, unit: 'MΩ', src: [60] } } }] });
  job(ok, 'j1').offer.push('ir');
  assert.ok(!has(check(ok), /ir\.motor/));
});

test('numbers on screen must be accounted for, and a maker\'s figure is said "for example"', () => {
  let b = fresh();
  b.tests.find((t) => t.id === 'look').targets.find((x) => x.id === 'plate').shows.f4 = 'Coil 415 V AC';
  only(check(b), /"415 V" is a bare number/);

  b = fresh();
  const n4 = b.notes.find((n) => n.id === 'N4');
  n4.words = n4.words.replace('a band, for example 85%', 'a band of 85%');
  only(check(b), /"85%" is one maker's figure; say it "for example"/);

  b = fresh();
  b.notes.find((n) => n.id === 'N4').words += ' That is 0.6 of it.';
  only(check(b), /"0\.6" is a bare number/);
});

test('every fault must differ from healthy and from every other fault on some offered test', () => {
  let b = fresh();
  b.faults.push({ id: 'f10', part: 'coreA2', effect: 'open', kind: 'Open circuit', name: 'Core out, past the joint', role: 'distractor' });
  let r = check(b);
  only(r, /f10 and f2 read the same|f2 and f10 read the same/);
  b.alike = [{ faults: ['f2', 'f10'], why: 'Ja is not a test point.' }];
  r = check(b);
  assert.ok(!has(r, /read the same/), JSON.stringify(r.problems));
  assert.ok(warns(r, /bench\.alike says this is meant/));
  only(r, /j1\.route\[5\]: the readings so far leave f2, f10, not exactly f2/); // the route still has to pin its own fault down

  b = fresh();
  b.faults.push({ id: 'f11', part: 'coil', effect: 'rating', rating: 'Vcoil230', kind: 'Wrong part fitted', name: 'The coil', role: 'distractor' });
  only(check(b), /f11 reads like a healthy circuit on every offered test/);

  // without the look, f1 hides from every dead test and f4 from every test but the play
  b = fresh();
  b.jobs.forEach((j) => { j.offer = j.offer.filter((t) => t !== 'look' && t !== 'play'); j.route = j.route.filter((s) => !(s.test === 'look' || s.test === 'play')); });
  only(check(b), /f1 reads like a healthy circuit/);
});

test('the safety gate: no dead test before proving dead, no live test without a sourced reason', () => {
  let b = fresh();
  job(b, 'j1').route.shift();
  only(check(b), /j1\.route\[0\]: cont tests dead before the circuit is isolated/);

  b = fresh();
  delete b.tests.find((t) => t.id === 'vn').reason;
  let r = check(b);
  only(r, /jobs\.j1 offers the live test vn without a sourced reason/);
  only(r, /others\.live\[0\]: vn is a live test with no sourced reason/);
  // a job-level reason will do
  job(b, 'j1').liveReason = { src: ['material:hsg85#p8'] };
  job(b, 'j3').liveReason = { src: ['material:hsg85#p8'] };
  assert.ok(!has(check(b), /sourced reason/));

  b = fresh();
  job(b, 'j1').route = job(b, 'j1').route.filter((s) => s.do !== 'restore');
  only(check(b), /j1\.route\[\d+\]: play operates the plant while it is isolated/);

  b = fresh();
  job(b, 'j1').others[0].route.unshift({ do: 'safe' });
  only(check(b), /others\.live\[1\]: vn is a live test on an isolated circuit/);

  b = fresh();
  const j3 = job(b, 'j3').route;
  j3.splice(j3.findIndex((s, i) => i > 0 && s.do === 'safe'), 1);
  only(check(b), /j3\.route\[\d+\]: fixes f1 while the circuit is not isolated/);

  b = fresh();
  job(b, 'j2').route[1] = { do: 'test', test: 'look', target: 'joint' };
  job(b, 'j2').route.shift();
  only(check(b), /look tests dead before the circuit is isolated/);
});

test('each name is pinned down by the readings, the stated reads match the rule, and the fix is proven', () => {
  let b = fresh();
  job(b, 'j1').route.splice(4, 1);
  only(check(b), /j1\.route\[4\]: the readings so far leave f2, f9, not exactly f2/);

  b = fresh();
  job(b, 'j1').route[1].reads = 'near zero';
  only(check(b), /says cont reads "near zero" here, but its rule gives "over range"/);

  b = fresh();
  job(b, 'j1').route[5].kind = 'Short circuit';
  only(check(b), /f2 is "Open circuit", not "Short circuit"/);

  b = fresh();
  job(b, 'j1').route = job(b, 'j1').route.slice(0, 7);
  only(check(b), /j1\.route: no proof after the last fix/);

  b = fresh();
  job(b, 'j3').route = job(b, 'j3').route.slice(0, 7);
  only(check(b), /j3\.route: the route leaves f1 unfixed/);

  b = fresh();
  job(b, 'j1').route.push({ do: 'test', test: 'cont', a: 'P0', b: 'X9' });
  only(check(b), /the leads must go on test points/);
});

test('safe isolation: every step sourced, in the sourced order, dealt out of order', () => {
  let b = fresh();
  const s = b.isolation.steps;
  [s[2], s[3]] = [s[3], s[2]];
  b.isolation.shown = ['iso', 'lock', 'prove1', 'dead', 'prove2'];
  only(check(b), /isolation: "prove1" \(proveTester\) comes after "dead" \(testDead\)/);

  b = fresh(); delete b.isolation.steps[1].src;
  only(check(b), /isolation\.lock carries no source/);

  b = fresh(); b.isolation.steps = b.isolation.steps.filter((x) => x.stage !== 'reproveTester'); b.isolation.shown = b.isolation.shown.filter((x) => x !== 'prove2');
  only(check(b), /missing its "reproveTester" step/);

  b = fresh(); b.isolation.shown = ['iso', 'lock', 'prove1', 'dead', 'prove2'];
  only(check(b), /deals the steps already in order/);

  b = fresh(); b.screens = b.screens.filter((x) => x.kind !== 'order');
  only(check(b), /first to isolate, but no order screen teaches the steps/);
});

test('the writing rules on every string Dan reads', () => {
  let b = fresh();
  scr(b, 's0').text = Array(20).fill('Read the meter and say it.').join(' ');
  only(check(b), /screens\.s0 shows \d+ words with its longest feedback; at most 90/);

  b = fresh(); scr(b, 's6').hint = 'Your slides say to split it in half.';
  only(check(b), /narrates where it comes from: "Your slides say"/);
  b = fresh(); b.notes[0].words += ' One site warns about this.';
  only(check(b), /narrates where it comes from: "One site warns"/);
  b = fresh(); b.keep.where = 'Any DOL starter, as on p.16.';
  only(check(b), /keep\.where gives a page reference/);
  b = fresh(); b.keep.where = 'Anything in the course.';
  only(check(b), /talks about the course/);
  b = fresh(); scr(b, 's6').text = 'Pick a test (any two points) and read it.';
  only(check(b), /s6\.text has brackets/);
  b = fresh(); scr(b, 's6').text = 'Pick a test and read it [12].';
  only(check(b), /shows a citation marker/);
  b = fresh(); scr(b, 's6').text = 'Pick a [[test]] and read it.';
  assert.ok(!has(check(b), /s6\.text/), 'a key term in [[ ]] is not a bracket');

  b = fresh(); scr(b, 's6').hint = 'Try a test that clears half of what is left whichever way it reads and then test across half of what remains after that one too.';
  only(check(b), /s6\.hint: a sentence of 2[6-9] words/);

  b = fresh(); job(b, 'j1').report = 'Report: ' + Array(9).fill('Pump 2 will not start.').join(' ');
  only(check(b), /jobs\.j1\.report has \d+ words; at most 40/);
  b = fresh(); job(b, 'j1').route[1].thought = Array(6).fill('The break is up there.').join(' ');
  only(check(b), /route\[1\]\.thought has 30 words; at most 25/);
  b = fresh(); b.notes[0].words = Array(24).fill('Start feeds the coil.').join(' ');
  only(check(b), /notes\.N0\.words has 96 words; at most 90/);

  // the right option always in the same place
  b = fresh();
  for (const s of b.screens) for (const set of [s.options, s.review && s.review.options]) {
    if (!set || s.kind === 'chips' || s.kind === 'pickAll' || set.length < 3) continue;
    const k = set.findIndex((o) => o.right); const [o] = set.splice(k, 1); set.unshift(o);
  }
  only(check(b), /The right option is always in place 1/);
});

test('source ids: research numbers or material locators, never "to be sourced"', () => {
  let b = fresh(); b.parts[2].src = [999];
  only(check(b), /parts\[2\]\.src: source 999 is not in research\.json/);
  b = fresh(); b.parts[2].src = ['TBS: a stop control rule'];
  only(check(b), /still to be sourced/);
  b = fresh(); b.parts[2].src = ['material:hsg85#p99'];
  only(check(b), /"material:hsg85#p99" is not a checked source/);
  b = fresh(); b.parts[2].src = ['HSG85 p.16'];
  only(check(b), /is not a source id/);
  const r = check(fresh(), {});
  assert.equal(r.ok, true);
  assert.ok(warns(r, /source ids were not checked/));
});

test('notes, the teach-back and the Keep this card', () => {
  let b = fresh(); b.notes[0].trigger = { on: 'whenever' };
  only(check(b), /notes\.N0: trigger .* must be/);
  b = fresh(); b.notes[0].trigger = { on: 'wrong', screen: 's99' };
  only(check(b), /trigger screen "s99" is not in screens/);
  b = fresh(); delete b.notes[1].uses;
  only(check(b), /notes\.N1 carries no source and names no rule/);
  b = fresh(); b.written.b1.points = b.written.b1.points.slice(0, 2);
  only(check(b), /three to five points/);
  b = fresh(); delete b.written.b1.points[0].src;
  only(check(b), /written\.b1\.points\[0\] carries no source/);
  b = fresh(); delete b.keep.traps[0].src;
  only(check(b), /keep\.traps\[0\] must be \{text, src\}/);
  b = fresh(); scr(b, 's8').options[1].src = [];
  only(check(b), /s8\.options\[1\] is a safety warning without its source/);
});

test('the case file carries the bench to the page, and the lesson gets its written and summary', () => {
  const U = loadPrompts();
  const b = fresh(), r = check(b);
  const before = { title: 'Fault-finding', givens: [], assumptions: [], figures: [{ id: 'other', lesson: 'i2', label: 'Kept', value: 1 }] };
  let kase = emitCase(b, r, before, 'i1');
  assert.deepEqual(Array.from(U.validate.caseFile(kase)), []);
  assert.equal(kase.benches.i1.table.rows['cont:P0-P3'].length, kase.benches.i1.table.columns.length);
  assert.equal(kase.benches.i1.jobs[0].route[1].reads, 'over range');
  const share = kase.figures.find((f) => f.id === 'i1.coilShare');
  assert.equal(share.text, '58%');
  assert.match(share.work, /ratio\(Vsupply, Vcoil400\) = 57\.5%, shown as 58%/);
  assert.ok(kase.figures.find((f) => f.id === 'other'), 'another lesson\'s figure is kept');
  kase = emitCase(b, r, kase, 'i1');
  assert.equal(kase.figures.filter((f) => f.id === 'i1.coilShare').length, 1, 'a second emit replaces, never duplicates');
  const parts = lessonParts(b);
  assert.deepEqual(Array.from(U.validate.written(parts.written)), []);
  assert.deepEqual(Array.from(U.validate.summary(parts.summary)), []);
  assert.equal(parts.written.b1.points[0].cite, '[248]');
});

test('the command: prints {ok, problems, warnings, readings}, writes only a clean bench', () => {
  const dir = mkdtempSync(join(tmpdir(), 'bench-'));
  copyFileSync(join(fx, 'i1.bench.json'), join(dir, 'i1.bench.json'));
  copyFileSync(join(fx, 'research.json'), join(dir, 'research.json'));
  writeFileSync(join(dir, 'lesson.json'), JSON.stringify({ title: 'The pump that won\'t run' }));
  const run = (...a) => spawnSync(process.execPath, [join(root, 'tools', 'course', 'bench.mjs'), '--dir', dir, '--idea', 'i1', ...a], { encoding: 'utf8' });
  let p = run('--emit-case', '--emit-lesson', join(dir, 'lesson.json'));
  let out = JSON.parse(p.stdout);
  assert.equal(p.status, 0, p.stdout);
  assert.equal(out.ok, true);
  assert.deepEqual(Object.keys(out).slice(0, 4), ['ok', 'problems', 'warnings', 'readings']);
  const kase = JSON.parse(readFileSync(join(dir, 'case.json'), 'utf8'));
  assert.ok(kase.benches.i1 && kase.figures.some((f) => f.id === 'i1.Vsupply'));
  assert.ok(!JSON.stringify(kase).includes('"_needs"'));
  const lesson = JSON.parse(readFileSync(join(dir, 'lesson.json'), 'utf8'));
  assert.ok(lesson.written.b1 && lesson.summary.traps.length === 3);
  // a broken bench: exit 1, and nothing is written
  const bad = fresh(); job(bad, 'j1').route.shift();
  writeFileSync(join(dir, 'i1.bench.json'), JSON.stringify(bad));
  const dir2 = mkdtempSync(join(tmpdir(), 'bench-'));
  writeFileSync(join(dir2, 'i1.bench.json'), JSON.stringify(bad));
  p = spawnSync(process.execPath, [join(root, 'tools', 'course', 'bench.mjs'), '--dir', dir2, '--idea', 'i1', '--research', join(fx, 'research.json'), '--emit-case'], { encoding: 'utf8' });
  out = JSON.parse(p.stdout);
  assert.equal(p.status, 1);
  assert.equal(out.ok, false);
  assert.ok(!existsSync(join(dir2, 'case.json')));
});
