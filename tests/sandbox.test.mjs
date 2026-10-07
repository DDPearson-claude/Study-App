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
  assert.match(doc, /window\.K_TOKEN="abc\\u003c\/script>";window\.K_QUIZ=null;<\/script><script>/);
  assert.ok(doc.indexOf('K_TOKEN') < doc.indexOf('<p>x</p>'));
  assert.match(U.sandbox.srcdoc('<p>x</p>'), /window\.K_TOKEN="";/);
});

// ---------- mount(): heartbeat and quiz mode, on a fake page and clock ----------
// Just enough DOM for mount(): elements that know whether they are on the page, iframes whose
// window is made when they join the page (a frame moved in the page gets a new one, as in a
// browser), and a clock the test moves by hand. kit(frame, msg) is the kit speaking: it signs with
// the token from the frame's srcdoc, from the frame's current window. kit.spec.mjs checks the same
// in a real browser.
function fakePage() {
  let clock = 0, seq = 0;
  const timers = [], winListeners = [];
  const later = (fn, ms) => { const t = { at: clock + Math.max(0, Number(ms) || 0), fn, id: ++seq }; timers.push(t); return t.id; };
  const cancel = (id) => { const i = timers.findIndex((t) => t.id === id); if (i >= 0) timers.splice(i, 1); };
  const page = { hidden: false };
  class Node {
    constructor(tag) { this.tagName = tag; this.parentNode = null; this.children = []; this.attributes = {}; this.style = {}; this.dataset = {}; this.l = {}; this.hidden = false; this.sent = []; this.win = null; }
    setAttribute(k, v) { this.attributes[k] = String(v); }
    getAttribute(k) { return k in this.attributes ? this.attributes[k] : null; }
    hasAttribute(k) { return k in this.attributes; }
    removeAttribute(k) { delete this.attributes[k]; }
    get firstChild() { return this.children[0] || null; }
    get isConnected() { let n = this; while (n.parentNode) n = n.parentNode; return n === body; }
    get contentWindow() { return this.isConnected ? this.win : null; }
    appendChild(c) {
      if (c.parentNode) c.parentNode.removeChild(c);
      c.parentNode = this; this.children.push(c);
      if (this.isConnected) walk(c, (n) => { if (n.tagName === 'iframe') n.win = { frame: n, postMessage: (m) => { if (n.win && n.contentWindow) n.sent.push(JSON.parse(JSON.stringify(m))); } }; });
      return c;
    }
    removeChild(c) { this.children = this.children.filter((x) => x !== c); c.parentNode = null; walk(c, (n) => { n.win = null; }); return c; }
    remove() { if (this.parentNode) this.parentNode.removeChild(this); }
    addEventListener(t, fn) { (this.l[t] = this.l[t] || []).push(fn); }
    removeEventListener() {}
  }
  const walk = (n, fn) => { fn(n); n.children.forEach((c) => walk(c, fn)); };
  const body = new Node('body');
  const style = { fontSize: '16px', getPropertyValue: (n) => (n === '--fs' ? '1.125rem' : '') };
  const document = {
    documentElement: new Node('html'), body,
    get visibilityState() { return page.hidden ? 'hidden' : 'visible'; },
    createElement: (tag) => new Node(tag),
    createTextNode: (text) => Object.assign(new Node('#text'), { text }),
  };
  const ctx = vm.createContext({
    console, document, Node, setTimeout: later, clearTimeout: cancel, getComputedStyle: () => style,
    MutationObserver: class { observe() {} disconnect() {} },
    addEventListener: (t, fn) => { if (t === 'message') winListeners.push(fn); },
  });
  vm.runInContext('var window = globalThis; Date.now = function () { return __clock(); };', Object.assign(ctx, { __clock: () => clock }));
  for (const f of ['00-core.js', '32-sandbox.js']) vm.runInContext(src(f), ctx, { filename: f });
  page.U = ctx.U;
  page.body = body;
  page.box = () => body.appendChild(new Node('div'));
  // Move the clock in small steps, running every timer that falls due (as a browser would).
  page.wait = (ms) => {
    const end = clock + ms;
    for (;;) {
      timers.sort((a, b) => a.at - b.at || a.id - b.id);
      const t = timers[0];
      if (!t || t.at > end) break;
      timers.shift(); clock = t.at; t.fn();
    }
    clock = end;
  };
  page.kit = (frame, msg) => {
    const tok = (/K_TOKEN="([^"]*)"/.exec(frame.getAttribute('srcdoc')) || [])[1];
    const ev = { data: Object.assign({ src: 'kit', tok }, msg), source: frame.contentWindow };
    winListeners.forEach((fn) => fn(ev));
  };
  page.sent = (frame, type) => frame.sent.filter((m) => m.type === type);
  page.frameOf = (m) => m.frame;
  return page;
}
const BODY = '<p class="say">x</p><script>K.ready();</script>';

test('srcdoc() carries the quiz output (or null) beside the token, as inline-safe JSON', () => {
  const U = boot({ rootPx: 16, fs: '1.125rem' });
  assert.match(U.sandbox.srcdoc('<p>x</p>', { token: 't', quiz: 'T</script>' }), /window\.K_TOKEN="t";window\.K_QUIZ="T\\u003c\/script>";<\/script>/);
  assert.match(U.sandbox.srcdoc('<p>x</p>', { token: 't' }), /window\.K_QUIZ=null;/);
});

// Audit 3, #22 (residual): a page that silences the kit (document.open() erases its listeners) and
// then sits on a page that never finishes loading sent no 'leaving' and no second load, so it
// stayed in the lesson. The host now pings every mounted frame; only the kit can answer.
test('heartbeat: a frame that answered and then goes silent is closed after 4-6 s, through onError', () => {
  const P = fakePage(), errs = [];
  const m = P.U.sandbox.mount(P.box(), { html: BODY, onError: (e) => errs.push(e) });
  const f = m.frame;
  P.wait(300); P.kit(f, { type: 'height', px: 400 }); P.kit(f, { type: 'ready', checks: [] });
  // It answers every ping for half a minute: kept.
  for (let i = 0; i < 15; i++) { P.wait(2000); P.kit(f, { type: 'pong' }); }
  assert.ok(m.el.isConnected && !errs.length);
  assert.ok(P.sent(f, 'ping').length >= 14, 'pinged every 2 s');
  // Then silence (its page was replaced): still there at 3.9 s, gone by 6 s.
  P.wait(3900);
  assert.ok(m.el.isConnected, 'not before 4 s of silence');
  P.wait(2100);
  assert.ok(!m.el.isConnected, 'closed within 6 s');
  assert.deepEqual(errs, ['The interactive stopped answering, so it was closed.']);
  // A page it lands on that claims to be the kit, without the token, is not heard.
  const P2 = fakePage(), errs2 = [];
  const m2 = P2.U.sandbox.mount(P2.box(), { html: BODY, onError: (e) => errs2.push(e) });
  P2.wait(300); P2.kit(m2.frame, { type: 'ready', checks: [] });
  for (let i = 0; i < 7; i++) { P2.wait(1000); P2.kit(m2.frame, { type: 'pong', tok: 'forged' }); }
  assert.ok(!m2.el.isConnected && errs2.length === 1);
});

test('heartbeat: a slow but honest page (answers late, or only now and then) is kept', () => {
  const P = fakePage(), errs = [];
  const m = P.U.sandbox.mount(P.box(), { html: BODY, onError: (e) => errs.push(e) });
  P.wait(300); P.kit(m.frame, { type: 'ready', checks: [] });
  // A long computation keeps it from answering for 3.9 s at a time; it answers in between.
  for (let i = 0; i < 20; i++) { P.wait(3900); P.kit(m.frame, { type: 'pong' }); }
  assert.ok(m.el.isConnected && !errs.length, errs.join());
  // Time with the app hidden does not count.
  P.hidden = true; P.wait(60000); P.hidden = false;
  P.wait(1000);
  assert.ok(m.el.isConnected, 'kept through a minute in the background');
  assert.ok(P.sent(m.frame, 'ping').length > 15);
  m.destroy();
});

test('heartbeat: a frame that never says anything is closed at 12 s, never shown; a moved frame gets that time again', () => {
  const P = fakePage(), errs = [];
  const m = P.U.sandbox.mount(P.box(), { html: BODY, onError: (e) => errs.push(e) });
  P.wait(11500);
  assert.ok(m.el.isConnected && m.el.dataset.state === 'loading');
  P.wait(2600);
  assert.ok(!m.el.isConnected && m.el.dataset.state === 'loading', 'removed, never revealed');
  assert.deepEqual(errs, ['The interactive stopped answering, so it was closed.']);
  // A frame moved in the page loads the kit again in a new window: it has the first wait again.
  const P2 = fakePage(), errs2 = [];
  const a = P2.box(), b = P2.box();
  const m2 = P2.U.sandbox.mount(a, { html: BODY, onError: (e) => errs2.push(e) });
  P2.wait(300); P2.kit(m2.frame, { type: 'ready', checks: [] });
  P2.wait(1000);
  b.appendChild(m2.el);
  P2.wait(3500);
  P2.kit(m2.frame, { type: 'height', px: 300 });   // the new window's kit, 3.5 s later (a heavy body)
  P2.wait(3000);
  P2.kit(m2.frame, { type: 'ready', checks: [] });
  for (let i = 0; i < 5; i++) { P2.wait(2000); P2.kit(m2.frame, { type: 'pong' }); }
  assert.ok(m2.el.isConnected && !errs2.length, errs2.join());
});

test('quiz: the output is in the srcdoc, posted after ready and after every later ready, and reveal() ends it', () => {
  const P = fakePage();
  const m = P.U.sandbox.mount(P.box(), { html: BODY, quiz: { hide: 'T' } });
  const f = m.frame;
  assert.match(f.getAttribute('srcdoc'), /K_QUIZ="T"/);
  P.wait(300); P.kit(f, { type: 'ready', checks: [] });
  assert.deepEqual(P.sent(f, 'quiz').map((q) => q.hide), ['T']);
  m.reveal();
  assert.equal(P.sent(f, 'reveal').length, 1);
  // The frame is moved (its kit loads again, from a srcdoc that still opens in quiz mode): the
  // host says the quiz is over.
  P.box().appendChild(m.el);
  P.wait(300); P.kit(m.frame, { type: 'ready', checks: [] });
  assert.deepEqual(P.sent(m.frame, 'quiz').map((q) => q.hide), ['T', null]);
  m.quiz('T');
  assert.deepEqual(P.sent(m.frame, 'quiz').map((q) => q.hide), ['T', null, 'T']);
  m.quiz(null);
  assert.deepEqual(P.sent(m.frame, 'quiz').map((q) => q.hide), ['T', null, 'T', null]);
  // Without a quiz nothing is sent, and the srcdoc opens without one.
  const n = P.U.sandbox.mount(P.box(), { html: BODY });
  assert.match(n.frame.getAttribute('srcdoc'), /K_QUIZ=null/);
  P.wait(300); P.kit(n.frame, { type: 'ready', checks: [] });
  assert.equal(P.sent(n.frame, 'quiz').length, 0);
});

test('reach() passes the output\'s decimals to the kit (null when not given)', () => {
  const P = fakePage();
  const m = P.U.sandbox.mount(P.box(), { html: BODY });
  P.wait(300); P.kit(m.frame, { type: 'ready', checks: [] });
  const quiet = () => {};
  m.reach({ control: 'L', output: 'T', target: 2, tolerance: 0.05, decimals: 2 }).catch(quiet);
  m.reach({ control: 'L', output: 'T', target: 2, tolerance: 0.05 }).catch(quiet);
  m.reach({ control: 'L', output: 'T', target: 2, tolerance: 0.05, decimals: '1' }).catch(quiet);
  assert.deepEqual(P.sent(m.frame, 'reach').map((r) => r.decimals), [2, null, 1]);
  m.destroy();
});

test('reach(): every error result says exact: false, as the contract lists it', async () => {
  const P = fakePage();
  const big = await P.U.sandbox.reach('x'.repeat(P.U.sandbox.MAX_BYTES + 1), { control: 'L', output: 'T', target: 2, tolerance: 0 });
  assert.equal(big.reachable, false);
  assert.equal(big.exact, false);
  assert.match(big.error, /too large/);
});
