// Unit tests for the hash router's address handling (U.go, U._home in app/src/js/00-core.js), with
// a stand-in `location` that either refuses fragment changes (the case U._memHash exists for) or
// accepts them and fires hashchange as a browser does. U._route is replaced by a recorder.
// Run: node --test tests/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../app/src/js/00-core.js', import.meta.url), 'utf8');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function load({ refuse, start = '#/', href = 'about:srcdoc' }) {
  let hash = start;
  const replaced = [];
  const location = {
    get href() { return href + hash; },
    replace(url) {
      replaced.push(url);
      if (refuse) return;
      const i = url.indexOf('#');
      if (url.slice(0, i) !== href) throw new Error('navigated away to ' + url);   // what a bare '#/' does in a srcdoc frame
      set(url.slice(i));
    },
  };
  Object.defineProperty(location, 'hash', { get: () => hash, set: (v) => { if (!refuse) set(v); } });
  const ctx = vm.createContext({ console, setTimeout, clearTimeout, crypto: globalThis.crypto, location });
  vm.runInContext('var window = globalThis;', ctx);
  vm.runInContext(src, ctx, { filename: '00-core.js' });
  const U = ctx.U;
  const routed = [];
  U._route = () => routed.push(U.currentHash());
  // A browser fires hashchange (boot's listener clears the memory route and routes) a moment later.
  function set(v) { if (v === hash) return; hash = v; setTimeout(() => { U._memHash = null; U._route(); }, 0); }
  return { U, routed, replaced, location };
}

test('a frame that refuses fragment changes: going back to the address it holds takes one tap', async () => {
  const { U, routed, location } = load({ refuse: true });
  U.go('#/map');
  assert.deepEqual(routed, ['#/map']);
  assert.equal(U._memHash, '#/map', 'kept in memory');
  U.go('#/');
  assert.deepEqual(routed, ['#/map', '#/'], 'Learn is drawn on the first tap');
  assert.equal(U._memHash, null);
  assert.equal(location.hash, '#/');
  U.go('#/book'); U.go('#/');
  assert.deepEqual(routed.slice(2), ['#/book', '#/']);
});

test('a frame that takes fragment changes draws each address once, from hashchange', async () => {
  const { U, routed } = load({ refuse: false });
  U.go('#/map');
  await sleep(5);
  U.go('#/');
  await sleep(5);
  assert.deepEqual(routed, ['#/map', '#/'], 'no address is drawn twice');
  U.go('#/');
  assert.deepEqual(routed, ['#/map', '#/', '#/'], 'the same address again draws it again');
});

test('home goes to this document\'s own #/, never a bare #/ resolved against the host page', async () => {
  const ok = load({ refuse: false, start: '#/nowhere' });
  ok.U._home();
  await sleep(5);
  assert.deepEqual(ok.replaced, ['about:srcdoc#/']);
  assert.deepEqual(ok.routed, ['#/']);

  // Refused, from an unknown address kept in memory while the frame still holds '#/'.
  const no = load({ refuse: true });
  no.U._memHash = '#/nowhere';
  no.U._home();
  await sleep(5);
  assert.equal(no.U._memHash, null);
  assert.deepEqual(no.routed, ['#/'], 'Learn is drawn, not a blank screen');
});
