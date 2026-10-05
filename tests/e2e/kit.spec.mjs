#!/usr/bin/env node
// Kit, sandbox host and interactive builder tests (app/kit, 32-sandbox.js, 33-interactive.js).
// A plain node script: builds a partial page (core + 32 + 33), drives it with Playwright through
// tools/harness, and exits non-zero on any failure. Screenshots of every exemplar at 360 / 1280 px,
// light and dark, land in tests/out/kit/ for review by eye.
//   node tests/e2e/kit.spec.mjs
import { openApp, taskOf, ROOT } from '../../tools/harness/page.mjs';
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
expect('KIT.md is at most 1800 words (' + words + ')', words <= 1800);
const exDir = join(ROOT, 'app', 'kit', 'examples');
const examples = readdirSync(exDir).filter((f) => f.endsWith('.html')).sort().map((f) => {
  const body = readFileSync(join(exDir, f), 'utf8');
  const m = body.split('\n')[0].match(/<!--\s*kind:\s*([a-z-]+)\s*-->/i);
  return { name: f.replace(/\.html$/, ''), kind: m && m[1], body };
});
expect('exemplars declare their kind on line 1', examples.length >= 3 && examples.every((e) => e.kind), examples.map((e) => e.name + ':' + e.kind));
expect('exemplars cover quantity, process and mechanism', ['quantity', 'process', 'mechanism'].every((k) => examples.some((e) => e.kind === k)));
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
expect('a history idea gets the process exemplar', p2.status === 0 && p2.stdout.includes('kind: process -->'), p2.stderr);
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

// ---------- broken bodies are caught (their own errors are expected, so a separate page) ----------
section('self-test catches broken bodies');
{
  const app = await openApp({ width: 360, height: 800, file: PAGE });
  await app.page.goto(app.url('#/'));
  await app.page.evaluate(() => U.rt.ready);
  const test = (html, o) => app.page.evaluate(([h, opts]) => U.sandbox.test(h, opts), [html, o || {}]);
  const has = (list, re) => (list || []).some((m) => re.test(m));

  let r = await test(body(plain));
  expect('a small correct body passes', r.ok && r.checks.length === 3 && r.widths.length === 2, r);
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
  await app.close();
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
    const r = await test(ex.body, { widths: [340, 720] });
    expect(ex.name + ' passes at 340 and 720 (' + (Date.now() - t0) + ' ms)', r.ok && r.widths.every((w) => w.ok) && !r.overflow && r.sweep.ok && !r.errors.length, r);
    expect(ex.name + ': 3+ checks, all pass, one cites a source', r.checks.length >= 3 && r.checks.every((c) => c.ok) && r.checks.some((c) => /^https:\/\//.test(c.source || '')), r.checks);
    expect(ex.name + ': no warnings', !(r.warnings || []).length, r.warnings);
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
  const st = await app.page.evaluate(() => __m.selftest());
  expect('selftest() on a mounted frame returns a passing report', st.ok && st.checks.length === 5, st);
  await app.page.evaluate(() => __m.destroy());
  const gone = await app.page.evaluate(() => __m.get().then(() => 'resolved', (e) => e.code + ':' + !!document.querySelector('#host .kit-frame')));
  expect('destroy() removes the frame and later requests reject', gone === 'gone:false', gone);

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
        const m = U.sandbox.mount(box, { html, title: 'exemplar' });
        const c = await Promise.race([m.ready, new Promise((r) => setTimeout(r, 6000))]);
        await new Promise((r) => setTimeout(r, 500));
        return c;
      }, ex.body);
      const path = join(SHOTS, `${ex.name}-${width}-${theme}.png`);
      await app.page.screenshot({ path, fullPage: true });
      const scroll = await app.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
      expect(`${ex.name} ${width} ${theme}: mounted, checks pass, no page errors, no sideways scroll`, Array.isArray(checks) && checks.every((c) => c.ok) && !app.errors.length && scroll, app.errors);
      await app.close();
    }
  }
}

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) { console.log(failures.map((f) => ' - ' + f).join('\n')); process.exit(1); }
