// Unit tests for this tab's id (U.tab in app/src/js/00-core.js): kept through a reload, never
// shared by two open tabs. Each "page" is its own VM context with a sessionStorage of its own
// (a tab's), window events (pagehide, pageshow) and a BroadcastChannel shared by every page of
// the browser. "Duplicate tab" is a new page given a copy of the other tab's sessionStorage.
// Run: node --test tests/*.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../app/src/js/00-core.js', import.meta.url), 'utf8');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function session(init = {}) {
  const m = new Map(Object.entries(init));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k),
    copy: () => session(Object.fromEntries(m)), dump: () => Object.fromEntries(m),
  };
}
// One browser's BroadcastChannel: a message reaches every other open channel of that name.
function browser() {
  const open = new Set();
  class BC {
    constructor(name) { this.name = name; this.onmessage = null; open.add(this); }
    postMessage(data) {
      const copy = JSON.parse(JSON.stringify(data));
      for (const c of open) if (c !== this && c.name === this.name) setTimeout(() => c.onmessage && c.onmessage({ data: copy }), 1);
    }
    close() { open.delete(this); }
  }
  // A page in the back-forward cache is frozen: its channels hear nothing until it comes back.
  return { BC, closeAll: (page) => page.channels.forEach((c) => c.close()), freeze: (page) => page.channels.forEach((c) => open.delete(c)), thaw: (page) => page.channels.forEach((c) => open.add(c)) };
}
function page(store, br) {
  const win = new EventTarget(), channels = [];
  const BC = br ? class extends br.BC { constructor(n) { super(n); channels.push(this); } } : undefined;
  const ctx = vm.createContext({ console, setTimeout, clearTimeout, crypto: globalThis.crypto, sessionStorage: store, BroadcastChannel: BC,
    addEventListener: win.addEventListener.bind(win), removeEventListener: win.removeEventListener.bind(win) });
  vm.runInContext('var window = globalThis;', ctx);
  vm.runInContext(src, ctx, { filename: '00-core.js' });
  const fire = (type, persisted) => { const e = new Event(type); e.persisted = !!persisted; win.dispatchEvent(e); };
  return { U: ctx.U, store, channels, hide: () => fire('pagehide'), show: () => fire('pageshow', true) };
}

test('a reload keeps the tab id', () => {
  const store = session();
  const a = page(store);
  const id = a.U.tab();
  assert.match(id, /^t/);
  a.hide();                                  // the page goes (reload)
  const a2 = page(store);
  assert.equal(a2.U.tab(), id, 'the same tab, the same id');
});

test('"Duplicate tab" gets an id of its own; the tab it was copied from keeps its id', async () => {
  const br = browser();
  const a = page(session(), br);
  const id = a.U.tab();
  const copy = a.store.copy();               // the duplicate starts with a copy of the session
  assert.equal(copy.getItem('mu.tab'), id);
  const b = page(copy, br);
  assert.notEqual(b.U.tab(), id, 'the duplicate takes a fresh id');
  assert.equal(copy.getItem('mu.tab'), b.U.tab(), 'and keeps it for its own reloads');
  assert.equal(a.U.tab(), id, 'the original keeps its id');
  await sleep(20);
  assert.notEqual(a.U.tab(), b.U.tab(), 'no two open tabs share an id');
  assert.equal(a.U.tab(), id, 'and the hello changes neither');
  // The duplicate reloads: it keeps its own new id.
  b.hide();
  assert.equal(page(copy, br).U.tab(), b.U.tab());
});

test('a copy made while the open mark was missing takes a fresh id once the hello is answered', async () => {
  const br = browser();
  const a = page(session(), br);
  const id = a.U.tab();
  a.hide();                                  // e.g. the page was in the back-forward cache when copied
  const copy = a.store.copy();
  a.show();                                  // and came back
  await sleep(5);
  const c = page(copy, br);
  assert.equal(c.U.tab(), id, 'the copy could not tell at once');
  await sleep(20);
  assert.notEqual(c.U.tab(), id, 'the newcomer takes a fresh id');
  assert.equal(copy.getItem('mu.tab'), c.U.tab(), 'and keeps it for its own reloads');
  assert.equal(a.U.tab(), id, 'the tab it was copied from keeps its id');
  // The other way round: the copy is open first, then the page comes back from the cache and
  // says hello. The page that has held the id longer keeps it.
  const br2 = browser();
  const a2 = page(session(), br2);
  const id2 = a2.U.tab();
  a2.hide(); br2.freeze(a2);
  await sleep(5);
  const c2 = page(a2.store.copy(), br2);
  await sleep(20);
  assert.equal(c2.U.tab(), id2, 'alone, the copy keeps the id');
  br2.thaw(a2); a2.show();
  await sleep(20);
  assert.equal(a2.U.tab(), id2, 'the page that took the id first keeps it');
  assert.notEqual(c2.U.tab(), id2, 'the copy takes a fresh one');
});

test('without session storage every page has an id of its own', () => {
  const broken = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() {} };
  const a = page(broken), b = page(broken);
  assert.notEqual(a.U.tab(), b.U.tab());
});
