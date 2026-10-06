// Unit tests for the data layer (app/src/js/20-store.js) over the real runtime stub's db
// (tools/harness/claude-stub.js), with faults injected between the page and the db. Each "page"
// is its own VM context; pages can share one db (two devices) and one localStorage and Web Locks
// (two tabs, or a reload). Checks: what the outbox keeps, for how long and which page sends it,
// subscriptions that outlive a dead bridge, study minutes from two tabs, and private writes made
// before the runtime is ready.
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
async function page(srv, { uid = 'u1', local = storage(), uidGate = null, wait = true, locks = null } = {}) {
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
  vm.runInContext('var window = globalThis;', ctx);
  for (const f of ['00-core.js', '10-runtime.js', '20-store.js']) vm.runInContext(read('app/src/js/' + f), ctx, { filename: f });
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
