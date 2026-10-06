// Unit tests for the kit host's theme (app/src/js/32-sandbox.js): the interactive follows the
// app's Text size. The page's getComputedStyle is faked the way a browser answers it: a custom
// property comes back as written ("1.125rem"), the root's font-size in px. kit.spec.mjs checks the
// same against the real CSS in a browser.
// Run: node --test tests/sandbox.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => readFileSync(join(root, 'app', 'src', 'js', f), 'utf8');

// rootPx: the root font size the Text size setting gives (10-base.css); fs: --fs as written.
function boot({ rootPx, fs, scheme = 'light' }) {
  const vars = { '--fs': fs, 'color-scheme': scheme };
  const style = { fontSize: rootPx + 'px', getPropertyValue: (n) => (n in vars ? vars[n] : '') };
  const ctx = vm.createContext({ console, setTimeout, clearTimeout, document: { documentElement: {} }, getComputedStyle: () => style });
  vm.runInContext('var window = globalThis;', ctx);
  for (const f of ['00-core.js', '32-sandbox.js']) vm.runInContext(src(f), ctx, { filename: f });
  return ctx.U;
}

test('theme().size follows Text size: 16, 18 and 20 px at M, L and XL', () => {
  // S, M, L, XL set the root to 93.75%, 100%, 112.5% and 125% of 16 px; --fs stays 1.125rem.
  const sizes = [15, 16, 18, 20].map((rootPx) => boot({ rootPx, fs: '1.125rem' }).sandbox.theme().size);
  assert.deepEqual(sizes, [16, 16, 18, 20]);
});

test('theme().size reads --fs in px too, and falls back to the default when it is missing', () => {
  assert.equal(boot({ rootPx: 16, fs: ' 22px' }).sandbox.theme().size, 20);
  assert.equal(boot({ rootPx: 20, fs: '' }).sandbox.theme().size, 16);
  assert.equal(boot({ rootPx: 20, fs: '1.125rem', scheme: 'dark' }).sandbox.theme().dark, true);
});

// merge() (audit 3, #43): a width whose page never ran (it timed out at 340 px on a slow phone)
// has no ids and no checks. The merged report takes them from a width that ran, so the repair
// prompt doesn't say that ids the page has are missing, or that checks it passed failed; the
// timeout still fails it.
test('merge() takes ids, inputs and checks from the widths whose page ran', () => {
  const U = boot({ rootPx: 16, fs: '1.125rem' });
  const own = (v) => JSON.parse(JSON.stringify(v));   // out of the vm's realm, to compare
  const ran = (width) => ({ ok: true, errors: [], overflow: false, clipped: [], checks: [{ label: 'r = 10 gives 48.2%', ok: true, source: 'https://example.org/a' }],
    sweep: { ok: true, problems: [] }, controls: ['r'], readouts: ['eff'], outputs: ['eff'], inputs: [{ id: 'r', kind: 'control' }], actions: ['Play'], ready: true, warnings: [], width });
  const timedOut = { ok: false, errors: ['The self-test did not finish within 8 s.'], overflow: false, clipped: [], checks: [], sweep: { ok: false, problems: [] }, controls: [], readouts: [], ready: false, warnings: [], width: 340 };
  const m = own(U.sandbox.merge([timedOut, ran(720), ran(1040)]));
  assert.deepEqual([m.controls, m.readouts, m.outputs, m.actions], [['r'], ['eff'], ['eff'], ['Play']]);
  assert.deepEqual(m.inputs.map((i) => i.id), ['r']);
  assert.deepEqual(m.checks, [{ label: 'r = 10 gives 48.2%', ok: true, source: 'https://example.org/a' }]);
  assert.equal(m.ok, false);
  assert.deepEqual(m.errors, ['The self-test did not finish within 8 s. [at 340 px wide]']);
  // A check that fails at a width that ran still fails the merge.
  const bad = ran(1040);
  bad.checks = [{ label: 'r = 10 gives 48.2%', ok: false, error: 'returned false' }];
  const m2 = own(U.sandbox.merge([timedOut, ran(720), bad]));
  assert.deepEqual(m2.checks[0].ok, false);
  assert.equal(m2.checks[0].error, 'returned false');
  // With no width that ran, the first report stands.
  assert.deepEqual(own(U.sandbox.merge([timedOut, Object.assign({}, timedOut, { width: 720 })]).controls), []);
});

// Every frame gets its own token in its srcdoc (audit 3, #22): the kit signs its messages with it,
// so a page the frame is navigated to (which can't know it) is not believed.
test('srcdoc() puts the frame\'s token beside the theme, as inline-safe JSON', () => {
  const U = boot({ rootPx: 16, fs: '1.125rem' });
  const doc = U.sandbox.srcdoc('<p>x</p>', { token: 'abc</script>' });
  assert.match(doc, /window\.K_TOKEN="abc\\u003c\/script>";<\/script><script>/);
  assert.ok(doc.indexOf('K_TOKEN') < doc.indexOf('<p>x</p>'));
  assert.match(U.sandbox.srcdoc('<p>x</p>'), /window\.K_TOKEN="";/);
});
