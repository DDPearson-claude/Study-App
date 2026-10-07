// Unit tests for the data layer (app/src/js/20-store.js) over the real runtime stub's db
// (tools/harness/claude-stub.js), with faults injected between the page and the db. Each "page"
// is its own VM context; pages can share one db (two devices) and one localStorage and Web Locks
// (two tabs, or a reload). Checks: what the outbox keeps, for how long and which page sends it,
// subscriptions that outlive a dead bridge, study minutes from two tabs, private writes made
// before the runtime is ready, and review cards made at the next open for an idea finished while
// they could not be saved.
// Run: node --test tests/*.test.mjs
import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(cond, ms = 5000) { const end = Date.now() + ms; while (!cond()) { if (Date.now() > end) throw new Error('timed out waiting'); await sleep(10); } }
const plain = (o) => JSON.parse(JSON.stringify(o));
const UNAV = () => ({ code: 'unavailable', message: 'bridge not responding' });
const quiet = { log() {}, info() {}, warn() {}, error() {}, debug() {} };
// Page timers are unref'd (see page()), so a test that fails part-way never leaves the process
// running; this keeps it alive while a test is still going.
let keepAlive = null;
beforeEach(() => { keepAlive = setInterval(() => {}, 1000); });
afterEach(() => { clearInterval(keepAlive); });

// One db that several pages talk to (the platform's store).
async function server() {
  const ctx = vm.createContext({ console: quiet, setTimeout, clearTimeout, JSON, Math, Promise, Date });
  vm.runInContext('var window = globalThis;', ctx);
  vm.runInContext(read('tools/harness/claude-stub.js'), ctx, { filename: 'claude-stub.js' });
  const db = await vm.runInContext('window.claude.use("db")', ctx);
  const stub = vm.runInContext('window.__CLAUDE_STUB__', ctx);
  return { db, seed: (p, d) => stub.seed(p, d), get: (p) => { const d = stub.get(p); return d === undefined ? null : plain(d); } };
}

// A browser's Web Locks (navigator.locks), shared by its tabs: a page's locks go when it closes.
function lockManager() {
  const held = new Map();   // name -> page tag
  return {
    forPage(tag) {
      return {
        request(name, cb) { held.set(name, tag); return Promise.resolve().then(() => cb({ name })); },
        query() { return Promise.resolve({ held: [...held.keys()].map((name) => ({ name, mode: 'exclusive' })), pending: [] }); },
      };
    },
    release(tag) { for (const [k, v] of [...held]) if (v === tag) held.delete(k); },
    names: () => [...held.keys()],
  };
}

// A browser's localStorage (shared by its tabs and kept across reloads).
function storage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => { m.set(k, String(v)); }, removeItem: (k) => { m.delete(k); },
    key: (i) => [...m.keys()][i] ?? null, get length() { return m.size; }, _map: m,
  };
}

// A page of the app (00-core, 10-runtime, 20-store) over `srv`, with fault injection:
//   F.fault(op, path) -> error | null       for get/set/update/delete
//   F.snapFault(path) -> error | null       for a new subscription
//   F.kill(path, e)                         ends the live listeners of a doc with e
// opts.uidGate: a promise the user id waits for (the runtime is not ready until it resolves).
// opts.locks: the browser's lockManager() (without it the page has no navigator.locks).
// opts.review: also load the review module (40-fsrs, 60-today), with a bare document.
async function page(srv, { uid = 'u1', local = storage(), uidGate = null, wait = true, locks = null, review = false } = {}) {
  const F = { fault: null, snapFault: null, live: [], subscribes: 0 };
  function wrapRef(ref, path) {
    const w = { id: ref.id, path: ref.path };
    for (const op of ['get', 'set', 'update', 'delete']) {
      w[op] = (...a) => {
        const e = F.fault && F.fault(op, path, a[0]);
        if (e) return new Promise((_, rej) => setTimeout(() => rej(e), 1));
        return ref[op](...a);
      };
    }
    w.acquire = (...a) => ref.acquire(...a);
    w.onSnapshot = (next, error) => {
      F.subscribes++;
      const e = F.snapFault && F.snapFault(path);
      if (e) { setTimeout(() => error && error(e), 5); return () => {}; }
      const off = ref.onSnapshot(next, error);
      const rec = { path, error, off };
      F.live.push(rec);
      return () => { off(); F.live = F.live.filter((r) => r !== rec); };
    };
    return w;
  }
  F.kill = (path, e) => {
    F.live.filter((r) => r.path === path).forEach((r) => { r.off(); F.live = F.live.filter((x) => x !== r); if (r.error) r.error(e); });
  };
  const db = {
    doc: (p) => wrapRef(srv.db.doc(p), p),
    collection: (p) => {
      const c = srv.db.collection(p);
      const wrapQ = (q) => ({
        orderBy: (...a) => wrapQ(q.orderBy(...a)), where: (...a) => wrapQ(q.where(...a)), limit: (...a) => wrapQ(q.limit(...a)),
        get: () => { const e = F.fault && F.fault('list', p); return e ? Promise.reject(e) : q.get(); },
        onSnapshot: (...a) => q.onSnapshot(...a),
        doc: (id) => wrapRef(c.doc(id), p + '/' + id),
      });
      return wrapQ(c);
    },
  };
  const user = { id: () => (uidGate ? uidGate.then(() => uid) : Promise.resolve(uid)) };
  const win = new EventTarget();
  // The page's timers (the outbox's resends, a parked subscription) never keep the test process
  // alive on their own (keepAlive does while a test runs).
  const later = (f, ms, ...a) => { const t = setTimeout(f, ms, ...a); if (t.unref) t.unref(); return t; };
  const ctx = vm.createContext({
    console: quiet, setTimeout: later, clearTimeout, setInterval: (f, ms) => { const t = setInterval(f, ms); if (t.unref) t.unref(); return t; }, clearInterval, JSON, Math, Promise, Date,
    crypto: globalThis.crypto, localStorage: local,
    navigator: locks ? { locks: locks.forPage(F) } : {},
    claude: { use: (name) => Promise.resolve(name === 'db' ? db : name === 'user' ? user : null) },
    addEventListener: win.addEventListener.bind(win), removeEventListener: win.removeEventListener.bind(win),
  });
  if (review) ctx.document = { hidden: false, getElementById: () => null, addEventListener() {}, removeEventListener() {} };
  vm.runInContext('var window = globalThis;', ctx);
  const files = ['00-core.js', '10-runtime.js', '20-store.js'].concat(review ? ['40-fsrs.js', '60-today.js'] : []);
  for (const f of files) vm.runInContext(read('app/src/js/' + f), ctx, { filename: f });
  const U = ctx.U;
  const toasts = [];
  U.toast = (t, o) => toasts.push({ text: String(t), kind: o && o.kind });
  if (wait) await U.rt.ready;
  // Ends this page as closing the app would: nothing more reaches the db from it.
  const close = () => { F.fault = () => ({ code: 'unavailable', message: 'page closed' }); F.snapFault = F.fault; if (locks) locks.release(F); };
  return { U, F, toasts, local, close, online: () => win.dispatchEvent(new Event('online')) };
}

// =========================================================================================
// The outbox
// =========================================================================================
test('a lesson write that fails is not held for later: a lesson rewritten meanwhile is never undone', async () => {
  const srv = await server();
  const L = 'topics/t1/lessons/i1';
  srv.seed('topics/t1', { id: 't1', title: 'Tides', ideas: [{ id: 'i1' }] });
  srv.seed(L, { status: 'writing', lesson: null, interactive: null, by: { holder: 'phone/tab' } });
  const phone = await page(srv);
  phone.F.fault = (op, p) => (op === 'update' && p === L ? UNAV() : null);
  const e = await phone.U.store.lesson.update('t1', 'i1', { status: 'building', lesson: { title: 'L1, phone' }, sourced: true }).then(() => null, (x) => x);
  assert.equal(e && e.code, 'unavailable', 'the job hears that its write failed');
  assert.ok(!e.queued, 'and is not told it will be sent later (the job owns its retries, under the lease)');
  assert.equal(phone.U.store.waiting(), 0, 'nothing waits in the outbox');
  phone.F.fault = null;

  // The laptop takes the lesson over once the lease lapses and finishes it.
  const ready = { status: 'ready', lesson: { title: 'L2, laptop' }, interactive: { html: '<p>I2</p>' }, by: { holder: 'laptop/tab' } };
  srv.seed(L, ready);
  // Back on the phone: any write that succeeds, the device coming online, or a "Try again" claim.
  await phone.U.store.profile.patch({ prefs: { size: 'l' } });
  phone.online();
  await phone.U.store.lesson.set('t1', 'i1', { status: 'writing', lesson: null, interactive: null, by: { holder: 'phone/tab' } });
  await sleep(300);
  const d = srv.get(L);
  assert.equal(d.status, 'writing', 'only the new claim landed');
  assert.equal(d.lesson, null, 'the stale L1 never came back');
});

test('a whole-document write replaces a patch held for the same document', async () => {
  const srv = await server();
  srv.seed('topics/t1', { id: 't1', status: 'planning', title: 'Tides' });
  const A = await page(srv);
  A.F.fault = (op, p) => (op === 'update' && p === 'topics/t1' ? UNAV() : null);
  const e = await A.U.store.topic.update('t1', { status: 'ready', hook: 'old plan' }).then(() => null, (x) => x);
  assert.ok(e && e.queued, 'a topic patch is held');
  A.F.fault = null;
  await A.U.store.setDoc('topics/t1', { id: 't1', status: 'planning', title: 'Tides, planned again' });
  A.U.store.flush();
  await sleep(300);
  const t = srv.get('topics/t1');
  assert.equal(t.status, 'planning', 'the older patch does not land over the newer document');
  assert.equal(t.hook, undefined);
  assert.equal(A.U.store.waiting(), 0);
});

for (const withLocks of [true, false]) {
test(`held writes to Dan's own records outlive the page: the next time the app opens they are sent (${withLocks ? 'with' : 'without'} Web Locks)`, async () => {
  const srv = await server();
  const local = storage();
  const locks = withLocks ? lockManager() : null;
  srv.seed('topics/t1', { id: 't1', ideas: [{ id: 'i1' }] });
  const A = await page(srv, { local, locks });
  await A.U.store.progress.patch('t1', { ideas: { i1: { round: 0, stage: 'done', doneAt: A.U.now() } } });
  // "Idea learned": the bridge drops just before the review cards are written.
  A.F.fault = (op, p) => (/\/profile\/cards\//.test(p) || /^topics\/t1$/.test(p) ? UNAV() : null);
  const card = { id: 'i1_c1', tid: 't1', iid: 'i1', type: 'choice', spec: { q: 'Q?' }, s: { due: '2026-10-06' }, hist: [] };
  const e = await A.U.store.cards.patch('t1', { cards: { i1_c1: card } }).then(() => null, (x) => x);
  assert.ok(e && e.queued, 'the cards write waits in the outbox');
  const t = await A.U.store.topic.update('t1', { hook: 'held in memory only' }).then(() => null, (x) => x);
  assert.ok(t && t.queued);
  const keys = [...local._map.keys()].filter((k) => k.startsWith('mu.outbox.u1.'));
  assert.equal(keys.length, 1, 'mirrored on this device, per user');
  const kept = JSON.parse(local.getItem(keys[0]));
  assert.ok(kept.docs['data/users/u1/profile/cards/t1'], 'the cards patch is on the device');
  assert.equal(kept.docs['topics/t1'], undefined, 'shared docs are not: another device may have rewritten them by the next visit');
  const notice = A.toasts.find((x) => x.kind === 'bad');
  assert.ok(notice && !/kept here/.test(notice.text) && /keep the app open/i.test(notice.text), 'the notice does not promise what a closed page cannot keep: ' + (notice && notice.text));

  A.close();   // Dan closes the app before the connection is back.
  const B = await page(srv, { local, locks });
  await sleep(400);
  const cards = srv.get('data/users/u1/profile/cards/t1');
  assert.ok(cards && cards.cards.i1_c1 && cards.cards.i1_c1.type === 'choice', 'the review card exists after the next open');
  assert.equal([...local._map.keys()].filter((k) => k.startsWith('mu.outbox.')).length, 0, 'and the device copy is gone once it landed');
  assert.equal(B.U.store.waiting(), 0);
});
}

test('a tab still open sends its own held writes: a page opening beside it leaves them alone until it closes', async () => {
  const srv = await server();
  const local = storage(), locks = lockManager();
  srv.seed('data/users/u1/profile', { prefs: { size: 'm', theme: 'light' }, days: {} });
  const A = await page(srv, { local, locks });
  let down = true;
  A.F.fault = (op, p) => (down && op !== 'get' && /\/profile$/.test(p) ? UNAV() : null);
  const e = await A.U.store.profile.patch({ prefs: { size: 'l' } }).then(() => null, (x) => x);
  assert.ok(e && e.queued);
  const aKey = [...local._map.keys()].find((k) => k.startsWith('mu.outbox.u1.'));
  assert.ok(aKey, 'A keeps its held write on the device');

  // Tab B opens while A is still open (and still offline).
  const B = await page(srv, { local, locks });
  await sleep(300);
  assert.ok(local.getItem(aKey), 'B leaves the open tab\'s copy where it is');
  assert.equal(B.U.store.waiting(), 0, 'and holds nothing of it');
  assert.equal(srv.get('data/users/u1/profile').prefs.size, 'm');

  // A closes before its write lands; the next page to open (C) sends it.
  A.close();
  const C = await page(srv, { local, locks });
  await sleep(400);
  assert.equal(srv.get('data/users/u1/profile').prefs.size, 'l', 'the closed tab\'s write arrives');
  assert.equal(local.getItem(aKey), null);
  assert.equal(C.U.store.waiting(), 0);
  void B;
});

test('what an earlier page left goes out under this page\'s own newer writes, never after them', async () => {
  const srv = await server();
  const local = storage(), locks = lockManager();
  srv.seed('data/users/u1/profile', { prefs: { size: 'm', theme: 'light' }, days: {} });
  // A page closed during an outage left a size and a theme on the device.
  local.setItem('mu.outbox.u1.pGone1', JSON.stringify({ at: '2026-10-06T08:00:00Z', docs: { 'data/users/u1/profile': { prefs: { size: 'l', theme: 'dark' } } } }));
  let release;
  const gate = new Promise((r) => { release = r; });
  const B = await page(srv, { local, locks, uidGate: gate, wait: false });
  // Dan picks extra large while the app is still opening.
  const saved = B.U.store.profile.patch({ prefs: { size: 'xl' } });
  release();
  await saved;
  await sleep(300);
  const prefs = srv.get('data/users/u1/profile').prefs;
  assert.equal(prefs.size, 'xl', 'his newer choice stands');
  assert.equal(prefs.theme, 'dark', 'and the older page\'s other change still arrives');
  assert.equal(local.getItem('mu.outbox.u1.pGone1'), null);
});

test('when Dan\'s user id answers only after the app opened, what earlier pages left is sent then', async () => {
  const srv = await server();
  const local = storage();
  srv.seed('data/users/u1/profile', { prefs: { size: 'm' }, days: {} });
  local.setItem('mu.outbox.u1.pGone2', JSON.stringify({ at: '2026-10-06T08:00:00Z', docs: { 'data/users/u1/profile': { prefs: { size: 'l', theme: 'dark' } } } }));
  const A = await page(srv, { local, uid: null });
  await sleep(200);
  assert.equal(srv.get('data/users/u1/profile').prefs.size, 'm', 'nothing can be sent without the user id');
  assert.ok(local.getItem('mu.outbox.u1.pGone2'), 'and nothing is lost');
  A.U.rt.uid = 'u1';
  const mine = A.U.store.profile.patch({ prefs: { size: 'xl' } });   // this page's own, newer
  A.U.emit('rt-late', 'uid');
  await mine;
  await sleep(400);
  const prefs = srv.get('data/users/u1/profile').prefs;
  assert.equal(prefs.theme, 'dark', 'the older page\'s write arrives');
  assert.equal(prefs.size, 'xl', 'under this page\'s newer one, not after it');
  assert.equal(local.getItem('mu.outbox.u1.pGone2'), null);
  assert.equal([...local._map.keys()].filter((k) => k.startsWith('mu.outbox.')).length, 0);
});

test('a held write that lands is dropped from the device copy; one for another user is left alone', async () => {
  const srv = await server();
  const local = storage();
  local.setItem('mu.outbox.someone-else.p1', JSON.stringify({ at: '2026-10-01T00:00:00Z', docs: { 'data/users/someone-else/profile': { prefs: { size: 'xl' } } } }));
  const A = await page(srv, { local });
  let down = true;
  A.F.fault = (op, p) => (down && op !== 'get' && /^data\/users\/u1\/profile$/.test(p) ? UNAV() : null);
  const e = await A.U.store.profile.patch({ prefs: { size: 'l' } }).then(() => null, (x) => x);
  assert.ok(e && e.queued);
  assert.equal([...local._map.keys()].filter((k) => k.startsWith('mu.outbox.u1.')).length, 1);
  down = false;
  A.online();
  await sleep(400);
  assert.equal(srv.get('data/users/u1/profile').prefs.size, 'l');
  assert.equal([...local._map.keys()].filter((k) => k.startsWith('mu.outbox.u1.')).length, 0, 'sent, so no longer kept');
  assert.ok(local.getItem('mu.outbox.someone-else.p1'), 'another account\'s copy is not touched');
  assert.equal(srv.get('data/users/someone-else/profile'), null);
});

// A phone, offline, finishes an idea (a new review card), picks the dark theme and gets Today's
// "learn it again" flag; none of it lands before the app is closed. `between` runs before the
// phone opens again (another device's work, or nothing).
async function heldOnPhone(between) {
  const srv = await server();
  const CARDS = 'data/users/u1/profile/cards/t1', PROF = 'data/users/u1/profile', PROG = 'data/users/u1/profile/progress/t1';
  srv.seed('topics/t1', { id: 't1', ideas: [{ id: 'i1' }] });
  srv.seed(PROF, { prefs: { theme: 'light', size: 'm' }, days: {} });
  srv.seed(PROG, { updatedAt: '2026-10-01T10:00:00.000Z', ideas: { i1: { round: 0, stage: 'done', doneAt: '2026-10-01T10:00:00.000Z' } } });
  const local = storage(), locks = lockManager();
  const A = await page(srv, { local, locks });
  A.F.fault = (op, p) => ((op === 'update' || op === 'set') && [CARDS, PROF, PROG].includes(p) ? UNAV() : null);
  const at = A.U.now();
  const card = (id) => ({ id, tid: 't1', iid: 'i1', type: 'choice', spec: { q: id + '?', options: ['a', 'b'], answer: 0 }, createdAt: at, learnedAt: at, s: { due: '2026-10-07', reps: 0, stability: 1 }, hist: [] });
  const held = await Promise.all([
    A.U.store.cards.patch('t1', { cards: { i1_c1: card('i1_c1'), i1_c2: card('i1_c2') } }),
    A.U.store.profile.patch({ prefs: { theme: 'dark' } }),
    A.U.store.progress.patch('t1', { ideas: { i1: { relearn: true } } }),
  ].map((w) => w.then(() => 'landed', (e) => (e && e.queued ? 'held' : 'failed'))));
  assert.deepEqual(held, ['held', 'held', 'held']);
  A.close();
  await sleep(10);
  await between(srv, card);
  const C = await page(srv, { local, locks });   // the phone opens again
  await sleep(500);
  return { srv, C, local, cards: () => (srv.get(CARDS) || { cards: {} }).cards, prefs: () => srv.get(PROF).prefs, i1: () => srv.get(PROG).ideas.i1 };
}

test('an old held write sent at the next open never undoes what another device did since', async () => {
  const r = await heldOnPhone(async (srv, card) => {
    // The laptop, days later: Dan learns i1 again there (a new round; this lesson has only c1),
    // reviews its card a few times and picks the light theme again.
    const B = await page(srv);
    const t = B.U.now();
    await B.U.store.progress.patch('t1', { ideas: { i1: { round: 1, stage: 'predict', startedAt: t, againAt: t, relearn: false, predict: null, checks: null, doneAt: null } } });
    const hist = [1, 2, 3, 4].map((n) => ({ at: new Date(Date.now() + n).toISOString(), grade: 3, ok: true }));
    await B.U.store.cards.patch('t1', { cards: { i1_c1: { ...card('i1_c1'), learnedAt: t, s: { due: '2026-11-20', reps: 4, stability: 30 }, hist } } });
    await sleep(5);
    await B.U.store.profile.patch({ prefs: { theme: 'light', size: 'xl' } });
  });
  const c1 = r.cards().i1_c1;
  assert.equal(c1.s.reps, 4, 'the reviewed card keeps its schedule: ' + JSON.stringify(c1.s));
  assert.equal(c1.s.due, '2026-11-20');
  assert.equal(c1.hist.length, 4, 'and its history');
  assert.equal(r.cards().i1_c2, undefined, 'a card of the old lesson is not made again: its idea was learned again since');
  assert.equal(r.prefs().theme, 'light', 'the theme chosen since stands');
  assert.equal(r.prefs().size, 'xl');
  assert.equal(r.i1().round, 1, 'the new round stands');
  assert.equal(r.i1().relearn, false, 'and the old "learn it again" flag does not start yet another one');
  assert.equal([...r.local._map.keys()].filter((k) => k.startsWith('mu.outbox.')).length, 0, 'the old copy is dealt with, not kept');
});

test('a held write sent at the next open lands whole when nothing newer was written meanwhile', async () => {
  const r = await heldOnPhone(async () => {});
  assert.deepEqual(Object.keys(r.cards()).sort(), ['i1_c1', 'i1_c2'], 'both review cards are made');
  assert.equal(r.cards().i1_c1.type, 'choice');
  assert.equal(r.prefs().theme, 'dark', 'the theme he picked arrives');
  assert.equal(r.i1().relearn, true, 'and so does the flag');
  assert.equal([...r.local._map.keys()].filter((k) => k.startsWith('mu.outbox.')).length, 0);
});

test('a held write left on the device weeks ago is dropped, not sent', async () => {
  const srv = await server();
  const local = storage();
  srv.seed('data/users/u1/profile', { prefs: { theme: 'light', size: 'm' }, days: {} });
  const old = new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString();
  const recent = new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString();
  local.setItem('mu.outbox.u1.pOld', JSON.stringify({ at: old, docs: { 'data/users/u1/profile': { prefs: { theme: 'dark' } } } }));
  local.setItem('mu.outbox.u1.pRecent', JSON.stringify({ at: recent, docs: { 'data/users/u1/profile': { prefs: { size: 'l' } } } }));
  await page(srv, { local });
  await sleep(400);
  assert.equal(srv.get('data/users/u1/profile').prefs.theme, 'light', 'the 20-day-old setting is not sent');
  assert.equal(srv.get('data/users/u1/profile').prefs.size, 'l', 'a two-day-old one still is');
  assert.equal(local.getItem('mu.outbox.u1.pOld'), null, 'and the old copy is cleared away');
  assert.equal(local.getItem('mu.outbox.u1.pRecent'), null);
});

test('a held write that cannot be sent at the next open stays on the device and goes once the db answers', async () => {
  const srv = await server();
  const local = storage();
  srv.seed('data/users/u1/profile', { prefs: { theme: 'light', size: 'm' }, days: {} });
  local.setItem('mu.outbox.u1.pGone3', JSON.stringify({ at: new Date().toISOString(), docs: { 'data/users/u1/profile': { prefs: { size: 'l' } } } }));
  let down = true;
  const B = await page(srv, { local, wait: false });
  B.F.fault = (op, p) => (down && /\/profile$/.test(p) ? UNAV() : null);
  await B.U.rt.ready;
  await sleep(1500);   // read, one retry, given up for now
  assert.equal(srv.get('data/users/u1/profile').prefs.size, 'm');
  assert.ok(local.getItem('mu.outbox.u1.pGone3'), 'still on the device');
  down = false;
  B.online();
  await sleep(300);
  assert.equal(srv.get('data/users/u1/profile').prefs.size, 'l', 'sent once the db answers');
  assert.equal(local.getItem('mu.outbox.u1.pGone3'), null);
});

// =========================================================================================
// Review cards an idea never got
// =========================================================================================
const CARDS1 = 'data/users/u1/profile/cards/t1', PROG1 = 'data/users/u1/profile/progress/t1';
const CHECKS = [
  { id: 'c1', type: 'choice', q: 'Which swings slower?', options: ['Long', 'Short'], answer: 0, why: 'Longer strings swing slower.' },
  { id: 'c2', type: 'order', q: 'Put these in order', items: ['a', 'b', 'c'], why: 'Shortest first.' },
  { id: 'c3', type: 'target', q: 'Make one swing take 2 s', control: 'L', output: 'T', target: 2, tolerance: 0.1, why: 'About a metre.' },
];
const SAY = { prompt: 'Why does a longer string swing slower?', rubric: ['further to fall'], model: 'It has further to go.' };
function lessonDoc(startedAt, checks = CHECKS) { return { status: 'ready', startedAt, lesson: { title: 'Pendulums', checks, say: SAY }, interactive: { html: '<p>a pendulum</p>' } }; }
function finished(o = {}) {
  return { round: 0, stage: 'done', startedAt: '2026-10-01T09:30:00.000Z', doneAt: '2026-10-01T10:00:00.000Z',
    checks: { c1: { correct: true, at: '2026-10-01T09:58:00.000Z' }, c2: { correct: false, at: '2026-10-01T09:59:00.000Z' } },
    say: { k1: { text: 'It has further to swing.', verdict: 'partly', round: 0, at: '2026-10-01T09:50:00.000Z' } }, ...o };
}
async function topicWith(progress, lesson, cards) {
  const srv = await server();
  srv.seed('topics/t1', { id: 't1', title: 'Pendulums', ideas: [{ id: 'i1' }, { id: 'i2' }] });
  srv.seed(PROG1, { ideas: progress });
  for (const [iid, doc] of Object.entries(lesson)) srv.seed('topics/t1/lessons/' + iid, doc);
  if (cards) srv.seed(CARDS1, { cards });
  return srv;
}

test('an idea finished while its review cards could not be saved gets them the next time the app opens', async () => {
  const srv = await topicWith({ i1: finished() }, { i1: lessonDoc('2026-10-01T09:00:00.000Z') });
  // Dan finishes i1; the bridge fails every call on the cards doc, then he closes the app.
  const A = await page(srv, { review: true });
  A.F.fault = (op, p) => (p === CARDS1 ? UNAV() : null);
  const outcome = { checks: { c1: { correct: true }, c2: { correct: false } }, say: { text: 'It has further to swing.', verdict: 'partly' } };
  const e = await A.U.review.addFromLesson('t1', 'i1', lessonDoc().lesson, outcome, { round: 0 }).then(() => null, (x) => x);
  assert.ok(e && e.queued, 'the cards wait in this page only');
  A.close();
  assert.equal(srv.get(CARDS1), null);
  assert.equal(srv.get(PROG1).ideas.i1.stage, 'done', 'while the idea is saved as learned');

  const B = await page(srv, { review: true });
  const made = await B.U.review.mendCards();
  assert.deepEqual(plain(made), [{ tid: 't1', iid: 'i1' }]);
  const cards = srv.get(CARDS1).cards;
  assert.deepEqual(Object.keys(cards).sort(), ['i1_c1', 'i1_c2', 'i1_say'], 'a card for each check he answered and his say-it-back (not the target he never reached)');
  assert.equal(cards.i1_c2.spec.q, 'Put these in order');
  assert.equal(cards.i1_say.spec.mine, 'It has further to swing.', 'his own words, as stored');
  assert.equal(cards.i1_c1.s.reps, 0);
  assert.equal(cards.i1_c1.learnedAt, '2026-10-01T10:00:00.000Z', 'learned when he finished, not now');
  assert.equal(srv.get(PROG1).ideas.i1.cardsRound, 0, 'and the round is recorded');

  const before = srv.get(CARDS1);
  assert.deepEqual(plain(await B.U.review.mendCards(true)), [], 'run again: nothing to do');
  assert.deepEqual(srv.get(CARDS1), before, 'and nothing rewritten');
});

test('finishing an idea records the round its cards were made for; that record never goes back', async () => {
  const srv = await topicWith({ i1: finished({ round: 2 }) }, {});
  const A = await page(srv, { review: true });
  await A.U.review.addFromLesson('t1', 'i1', lessonDoc().lesson, { checks: { c1: { correct: true } }, say: null }, { round: 2 });
  assert.equal(srv.get(PROG1).ideas.i1.cardsRound, 2);
  assert.ok(srv.get(CARDS1).cards.i1_c1);
  await A.U.store.progress.patch('t1', { ideas: { i1: { cardsRound: 1 } } });   // a late write
  await sleep(50);
  assert.equal(srv.get(PROG1).ideas.i1.cardsRound, 2);
});

// Learn it again on two devices: both open the fresh lesson at the same moment and both start
// the new round. The first start stands (with what Dan has done in it since); the second, late,
// loses its round fields, so his guess is not wiped and the round does not move twice.
test('two devices starting the same new round: the first start stands, the second changes nothing', async () => {
  const open = finished({ relearn: true, relearnId: 'rqA', relearnAt: '2026-10-05T10:00:00.000Z' });
  const srv = await topicWith({ i1: open }, {});
  const A = await page(srv), B = await page(srv);
  const start = (at) => ({ ideas: { i1: { round: 1, stage: 'predict', startedAt: at, againAt: at, relearn: false, relearnId: null, relearnAt: null, relearnNote: null,
    predict: null, checks: null, doneAt: null, past: { 0: { stage: 'done', at } } } } });
  await A.U.store.progress.patch('t1', start('2026-10-05T10:05:00.000Z'));
  await A.U.store.progress.patch('t1', { ideas: { i1: { round: 1, predict: { answer: 'Huygens', at: '2026-10-05T10:05:30.000Z' }, stage: 'play' } } });
  await B.U.store.progress.patch('t1', start('2026-10-05T10:05:01.000Z'));   // read the doc before A's start landed
  await sleep(50);
  const i1 = srv.get(PROG1).ideas.i1;
  assert.equal(i1.round, 1, 'one new round, not two');
  assert.equal(i1.againAt, '2026-10-05T10:05:00.000Z', 'the first start stands');
  assert.equal(i1.predict && i1.predict.answer, 'Huygens', 'his guess in the round is kept');
  assert.equal(i1.stage, 'play', 'and how far he has got');
  assert.ok(!i1.relearn && !i1.relearnId, 'the request is closed');
  // The same start sent again (a resend) is not a second start.
  await A.U.store.progress.patch('t1', { ideas: { i1: { round: 1, againAt: '2026-10-05T10:05:00.000Z', relearn: false } } });
  await sleep(50);
  assert.equal(srv.get(PROG1).ideas.i1.predict.answer, 'Huygens');
});

test('making missing cards never resets a schedule, never makes a card twice, and never uses a rewritten lesson', async () => {
  const reviewed = (id, q, learnedAt) => ({ id, tid: 't1', iid: id.split('_')[0], type: 'choice', spec: { ...CHECKS[0], id: id.split('_')[1], q }, createdAt: '2026-09-01T10:00:00.000Z', learnedAt,
    s: { due: '2026-11-01', stability: 25, difficulty: 5, reps: 3, lapses: 0, last: '2026-10-02' }, hist: [{ at: '2026-09-10T10:00:00.000Z', grade: 3, ok: true }, { at: '2026-09-20T10:00:00.000Z', grade: 3, ok: true }, { at: '2026-10-02T10:00:00.000Z', grade: 4, ok: true }] });
  // i1: finished by an older version (no record of its cards), whose cards were made and reviewed.
  // i2: learned again (round 1, done); its cards are still the first round's: c1 asks the same
  //     question, c2 a different one, c9 one the new lesson no longer has.
  const i2 = finished({ round: 1, startedAt: '2026-10-03T09:00:00.000Z', againAt: '2026-10-03T09:00:00.000Z', doneAt: '2026-10-03T10:00:00.000Z', cardsRound: 0,
    checks: { c1: { correct: true }, c2: { correct: true } }, say: { k1: { text: 'old words', round: 0, at: '2026-09-01T10:00:00.000Z' }, k2: { text: 'new words', round: 1, at: '2026-10-03T09:50:00.000Z' } } });
  const legacy = { ...reviewed('i1_c1', CHECKS[0].q, '2026-10-01T10:00:01.000Z'), spec: CHECKS[0] };
  const old = { i2_c1: { ...reviewed('i2_c1', CHECKS[0].q, '2026-09-01T10:00:00.000Z'), spec: CHECKS[0] }, i2_c2: reviewed('i2_c2', 'An older question', '2026-09-01T10:00:00.000Z'), i2_c9: reviewed('i2_c9', 'Gone', '2026-09-01T10:00:00.000Z') };
  const srv = await topicWith({ i1: finished(), i2 }, { i1: lessonDoc('2026-10-01T09:00:00.000Z'), i2: lessonDoc('2026-10-03T09:01:00.000Z', CHECKS.slice(0, 2)) }, { i1_c1: legacy, ...old });
  const A = await page(srv, { review: true });
  const made = await A.U.review.mendCards();
  assert.deepEqual(plain(made), [{ tid: 't1', iid: 'i2' }], 'only the idea whose cards were never made');
  const cards = srv.get(CARDS1).cards, prog = srv.get(PROG1).ideas;
  assert.deepEqual(cards.i1_c1, legacy, 'cards made when he finished are left exactly as they are');
  assert.equal(prog.i1.cardsRound, 0, 'and only recorded');
  assert.deepEqual(cards.i2_c1.s, old.i2_c1.s, 'the same question keeps its schedule');
  assert.equal(cards.i2_c1.hist.length, 3, 'and its history');
  assert.equal(cards.i2_c2.s.reps, 0, 'a changed question starts afresh');
  assert.equal(cards.i2_c2.spec.q, 'Put these in order');
  assert.ok(!cards.i2_c9, 'a question the new lesson does not ask is removed (null: deleted)');
  assert.equal(cards.i2_say.spec.mine, 'new words', 'his say-it-back from this round');
  assert.equal(prog.i2.cardsRound, 1);

  // A lesson rewritten after he finished (Learn it again under way elsewhere) is not what he
  // answered: no cards are made from it, and the idea is looked at again next time.
  const srv2 = await topicWith({ i1: finished() }, { i1: lessonDoc('2026-10-02T08:00:00.000Z') });
  const B = await page(srv2, { review: true });
  assert.deepEqual(plain(await B.U.review.mendCards()), []);
  assert.equal(srv2.get(CARDS1), null);
  assert.equal(srv2.get(PROG1).ideas.i1.cardsRound, undefined);
});

// =========================================================================================
// Subscriptions
// =========================================================================================
test('a subscription ended by a dead bridge keeps trying, says so once, and recovers by itself', async () => {
  const srv = await server();
  srv.seed('topics/t1', { id: 't1', status: 'planning' });
  const A = await page(srv);
  A.U.store.WATCH_RETRY_MS = 20;      // quick resubscribes: 20, 40, 80 ms
  A.U.store.WATCH_PARK_MS = 400;      // then a slow one
  const seen = [], errs = [];
  const stop = A.U.store.topic.watch('t1', (t) => seen.push(t && t.status), (e, info) => errs.push(e.code + ' retrying=' + info.retrying));
  await sleep(50);
  let down = true;
  A.F.snapFault = () => (down ? UNAV() : null);
  A.F.kill('topics/t1', UNAV());
  await sleep(2400);   // the quick tries (each up to 300 ms later, at random) and slow ones, all failing
  assert.deepEqual(errs, ['unavailable retrying=true', 'unavailable retrying=true', 'unavailable retrying=true', 'unavailable retrying=false'], 'the view hears it once it has given up the quick tries, and only once');
  assert.ok(A.F.subscribes >= 6, 'it went on trying slowly: ' + A.F.subscribes);

  // The bridge answers again; the plan finishes meanwhile.
  down = false;
  srv.seed('topics/t1', { id: 't1', status: 'ready', ideas: [{ id: 'i1' }] });
  await sleep(600);
  assert.equal(seen[seen.length - 1], 'ready', 'the page sees the plan without being reopened: ' + JSON.stringify(seen));
  assert.equal(A.F.live.length, 1, 'one live listener again');
  stop();
});

test('a parked subscription comes back at once when a write succeeds or the device comes online', async () => {
  const srv = await server();
  srv.seed('topics/t1', { id: 't1', status: 'planning' });
  const A = await page(srv);
  A.U.store.WATCH_RETRY_MS = 10;
  A.U.store.WATCH_PARK_MS = 60000;    // the slow timer never fires in this test
  const seen = [], errs = [];
  const stop = A.U.store.topic.watch('t1', (t) => seen.push(t && t.status), (e, info) => errs.push(info.retrying));
  await sleep(50);
  let down = true;
  A.F.snapFault = () => (down ? UNAV() : null);
  A.F.kill('topics/t1', UNAV());
  await until(() => errs.includes(false));   // the quick tries are over: parked
  down = false;
  srv.seed('topics/t1', { id: 't1', status: 'ready' });
  await sleep(100);
  assert.notEqual(seen[seen.length - 1], 'ready', 'still parked');
  await A.U.store.profile.patch({ prefs: { size: 'l' } });   // a write that works: the bridge is back
  await sleep(100);
  assert.equal(seen[seen.length - 1], 'ready', 'woken by a successful write');

  down = true;
  errs.length = 0;
  A.F.kill('topics/t1', UNAV());
  await until(() => errs.includes(false));
  down = false;
  srv.seed('topics/t1', { id: 't1', status: 'failed' });
  await sleep(50);
  A.online();
  await sleep(100);
  assert.equal(seen[seen.length - 1], 'failed', 'woken by the device coming online');
  stop();
  const n = A.F.subscribes;
  A.online();
  await sleep(50);
  assert.equal(A.F.subscribes, n, 'a stopped subscription stays stopped');
});

test('a parked subscription whose next try is refused tells the view, instead of ending silently', async () => {
  const srv = await server();
  srv.seed('topics/t1', { id: 't1', status: 'planning' });
  const A = await page(srv);
  A.U.store.WATCH_RETRY_MS = 10;
  A.U.store.WATCH_PARK_MS = 60000;
  const errs = [];
  const stop = A.U.store.topic.watch('t1', () => {}, (e, info) => errs.push(e.code + ' retrying=' + info.retrying));
  await sleep(50);
  A.F.snapFault = () => UNAV();
  A.F.kill('topics/t1', UNAV());
  await until(() => errs.includes('unavailable retrying=false'));   // parked; the view was told once
  A.F.snapFault = () => ({ code: 'permission_denied', message: 'no access' });
  A.online();                                                      // the next try is refused
  await until(() => errs.length > 4, 2000).catch(() => {});
  assert.deepEqual(errs.slice(3), ['unavailable retrying=false', 'permission_denied retrying=false'], 'the view hears the refusal: ' + JSON.stringify(errs));
  const n = A.F.subscribes;
  A.online();
  await sleep(50);
  assert.equal(A.F.subscribes, n, 'and it is not tried again');
  stop();
});

// =========================================================================================
// Study minutes
// =========================================================================================
test('two tabs of one browser add up their study minutes instead of overwriting each other', async () => {
  const srv = await server();
  const local = storage();
  const A = await page(srv, { local });
  const B = await page(srv, { local });
  assert.equal(A.U.device(), B.U.device(), 'one browser, one device id');
  const day = A.U.today();
  const total = () => A.U.store.minutesOn((srv.get('data/users/u1/profile') || { days: {} }).days[day]);
  for (let i = 0; i < 5; i++) await A.U.logStudy(2);     // tab A: 10 min
  assert.equal(total(), 10);
  await B.U.logStudy(2); await B.U.logStudy(2);          // tab B: 4 min
  assert.equal(total(), 14);
  await A.U.logStudy(2);                                 // tab A again: 2 min
  assert.equal(total(), 16, 'every minute from both tabs counts');
  await B.U.logStudy(2);
  assert.equal(total(), 18);
  const keys = Object.keys(srv.get('data/users/u1/profile').days[day]);
  assert.deepEqual(keys, [A.U.device()], 'still one count per device (the profile does not grow per page load)');
});

test('study minutes start from the saved count on a new day, and from a number left by an old version', async () => {
  const srv = await server();
  const local = storage();
  const day = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(new Date().getDate()).padStart(2, '0');
  local.setItem('mu.device', 'dPhone');
  srv.seed('data/users/u1/profile', { prefs: {}, days: { [day]: { dPhone: 6, dLaptop: 3 } } });
  const A = await page(srv, { local });
  await A.U.logStudy(2);
  assert.deepEqual(srv.get('data/users/u1/profile').days[day], { dPhone: 8, dLaptop: 3 }, 'this device carries on from its saved count; the other is untouched');
  const srv2 = await server();
  srv2.seed('data/users/u1/profile', { prefs: {}, days: { [day]: 5 } });
  const B = await page(srv2, { local: storage() });
  await B.U.logStudy(2);
  const rec = srv2.get('data/users/u1/profile').days[day];
  assert.equal(rec.legacy, 5);
  assert.equal(B.U.store.minutesOn(rec), 7);
});

// =========================================================================================
// Before the runtime is ready
// =========================================================================================
for (const after of [30, 600]) {
  test(`a private write asked for while the app is still opening reaches Dan's profile (runtime ready after ${after} ms)`, async () => {
    const srv = await server();
    srv.seed('data/users/u1/profile', { prefs: { size: 'm', theme: 'light' }, days: {} });
    let release;
    const gate = new Promise((r) => { release = r; });
    const A = await page(srv, { uidGate: gate, wait: false });
    assert.equal(A.U.rt.uid, null, 'not ready yet');
    const saved = A.U.store.profile.patch({ prefs: { size: 'xl' } }).then(() => 'ok', (e) => 'rejected: ' + (e && (e.code || e.name)) + ' ' + (e && e.message));
    await sleep(after);
    release();
    assert.equal(await saved, 'ok');
    await sleep(50);
    assert.equal(srv.get('data/users/u1/profile').prefs.size, 'xl', 'saved under Dan\'s user id');
    assert.equal(srv.get('data/users/u1/profile').prefs.theme, 'light');
    assert.deepEqual(A.toasts, [], 'no error was shown');
    assert.equal((await A.U.memdb.doc('local/me/profile').get()).exists, false, 'nothing went to the in-memory stand-in');
  });
}

test('a refused write forgets its held time, so a later held write is not taken for an older one', async () => {
  const PROG = 'data/users/u1/profile/progress/t1';
  const srv = await server();
  srv.seed('topics/t1', { id: 't1', ideas: [{ id: 'i1' }, { id: 'i2' }, { id: 'i3' }] });
  srv.seed(PROG, { updatedAt: '2026-10-01T00:00:00.000Z', lastIdea: 'i1', ideas: {} });
  const local = storage(), locks = lockManager();
  const A = await page(srv, { local, locks });
  let mode = 'unav';
  A.F.fault = (op, p) => (p === PROG && (op === 'update' || op === 'set') ? (mode === 'unav' ? UNAV() : mode === 'denied' ? { code: 'permission_denied', message: 'no' } : null) : null);
  await A.U.store.progress.patch('t1', { lastIdea: 'i1' }).catch(() => {});   // held
  mode = 'denied';
  await A.U.store.progress.patch('t1', { lastIdea: 'i1' }).catch(() => {});   // refused: what it carried is dropped
  await sleep(30);
  const B = await page(srv);
  await B.U.store.progress.patch('t1', { lastIdea: 'i2' });                    // another device, later
  await sleep(30);
  mode = 'unav';
  await A.U.store.progress.patch('t1', { lastIdea: 'i3' }).catch(() => {});   // later still: held, then the app closes
  A.close();
  await page(srv, { local, locks });
  await sleep(600);
  assert.equal(srv.get(PROG).lastIdea, 'i3', 'the newest choice wins');
});
