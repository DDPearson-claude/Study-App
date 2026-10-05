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
