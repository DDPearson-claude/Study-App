// Unit tests for main's v3 pieces that live in core.js as pure helpers (DESIGN §25.14.2 M1, CONTRACT §13.0–§13.2, §13.6):
// the rollout switch (GW_V3 / GW_V3_PHASE), the raw save envelope and its normalisation, the slow-motion owner of
// time.timeScale, and the run options of startNewRun({character, nightMode}).   node tools/tests/main-v3.test.mjs
import * as core from '../../src/core.js';

let pass = 0, fail = 0;
const failures = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; failures.push(msg); console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const near = (a, b, msg, eps = 1e-9) => ok(Math.abs(a - b) <= eps, `${msg} (got ${a}, want ${b})`);
const section = (s) => console.log(`- ${s}`);

// ------------------------------------------------------------------ rollout switch
section('rollout switch (CONTRACT §13.0)');
{
  // importing core in node must never touch the globals (tools set their own flags before importing data)
  eq(core.V3_FLAGS.apply, false, 'node import: the switch writes nothing');
  eq(globalThis.GW_V3, undefined, 'node import: GW_V3 untouched');
  eq(globalThis.GW_V3_PHASE, undefined, 'node import: GW_V3_PHASE untouched');
  eq(core.V3_ROLLOUT.on, false, 'shipped default: v3 off until the phase gate');
  eq(core.V3_ROLLOUT.phase, 1, 'shipped phase: 1 (not raised yet)');

  const R = core.resolveV3Flags;
  eq(R({}).on, false, 'no URL, no storage → off');
  eq(R({}).apply, false, 'off writes nothing');
  eq(R({ search: '?v3=1' }), { on: true, phase: 1, source: 'url', apply: true }, '?v3=1 → on at phase 1');
  eq(R({ search: '?v3' }).on, true, 'a bare ?v3 → on');
  eq(R({ search: '?v3=on&v3phase=2' }).phase, 2, '?v3phase=2 picks the phase');
  eq(R({ search: '?v3=1&v3phase=9' }).phase, 1, 'an out-of-range phase falls back to the rollout phase');
  eq(R({ search: '?v3=banana' }).on, false, 'an unreadable value is ignored');
  eq(R({ stored: { on: true, phase: 3 } }), { on: true, phase: 3, source: 'storage', apply: true }, 'localStorage {on, phase}');
  eq(R({ stored: 1 }).on, true, 'localStorage "1"');
  eq(R({ stored: { on: true }, search: '?v3=0' }).on, false, 'the URL beats localStorage (off)');
  eq(R({ stored: { on: false }, search: '?v3=1' }).on, true, 'the URL beats localStorage (on)');
  eq(R({ stored: { on: true, phase: 2 }, search: '?v3=1' }).phase, 2, 'the stored phase stays when the URL names none');
  eq(R({ preset: { v3: true, phase: 2 }, search: '?v3=0' }), { on: true, phase: 2, source: 'preset', apply: false }, 'preset globals win and are left alone');
  eq(R({ preset: { v3: true } }).phase, 4, 'preset without a phase reports data\'s default 4');
  eq(R({ preset: { v3: false }, search: '?v3=1' }).on, false, 'a preset off is respected');
  eq(R({ rollout: { on: true, phase: 1 } }), { on: true, phase: 1, source: 'default', apply: true }, 'the gate commit flips V3_ROLLOUT.on');

  // applyV3Flags against a fake page global
  const saveLS = globalThis.localStorage;
  const store = new Map();
  globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
  const page = (search) => ({ document: {}, location: { search } });
  let g = page('?v3=1');
  let r = core.applyV3Flags(g);
  ok(g.GW_V3 === true && g.GW_V3_PHASE === 1, 'apply: ?v3=1 sets GW_V3 = true, GW_V3_PHASE = 1');
  eq(r.source, 'url', 'apply: source url');
  g = page('');
  core.applyV3Flags(g);
  ok(!('GW_V3' in g) && !('GW_V3_PHASE' in g), 'apply: off writes no globals');
  core.setV3Flag(true, 2);
  eq(JSON.parse(store.get(core.V3_FLAG_KEY)), { on: true, phase: 2 }, 'setV3Flag stores {on, phase}');
  g = page('');
  core.applyV3Flags(g);
  ok(g.GW_V3 === true && g.GW_V3_PHASE === 2, 'apply: the stored switch turns v3 on at its phase');
  g = page('?v3=0');
  core.applyV3Flags(g);
  ok(!('GW_V3' in g), 'apply: ?v3=0 overrides the stored switch');
  g = { document: {}, location: { search: '?v3=1' }, GW_V3: false };
  core.applyV3Flags(g);
  eq(g.GW_V3, false, 'apply: a preset GW_V3 is never overwritten');
  ok(!('GW_V3_PHASE' in g), 'apply: a preset leaves the phase alone');
  g = { location: { search: '?v3=1' } };
  core.applyV3Flags(g);
  ok(!('GW_V3' in g), 'apply: no document (a node tool) → nothing read, nothing written');
  core.setV3Flag(null);
  ok(!store.has(core.V3_FLAG_KEY), 'setV3Flag(null) clears the stored switch');

  // ------------------------------------------------------------------ save envelope
  section('save envelope (CONTRACT §13.1 Boot, §13.2)');
  store.clear();
  let env = core.loadSave();
  eq({ version: env.version, meta: env.meta, run: env.run }, { version: 0, meta: {}, run: null }, 'no save → {version 0, meta {}, run null}');
  ok(!('schema' in env.meta), 'the empty envelope supplies no schema');
  let n = core.normalizeSave(env);
  eq(n.meta, core.defaultMeta(), 'normalize(no save) = defaultMeta()');
  ok(!('schema' in n.meta), 'defaultMeta never supplies schema');
  eq(n.run, null, 'normalize(no save): no run');

  const v1meta = { runs: 3, memories: 12, journal: { pale_leviathan: { caught: 1, biggest: 400 } }, settings: { music: 0.2 } };
  const v1run = { active: true, id: 'run_x', day: 2, bait: { pale_marrow: 2 }, legendaries: { pale_leviathan: true } };
  store.set(core.SAVE_KEY, JSON.stringify({ version: 1, savedAt: 1234, meta: v1meta, run: v1run }));
  env = core.loadSave();
  eq(env.version, 1, 'envelope: version as stored');
  eq(env.savedAt, 1234, 'envelope: savedAt as stored');
  eq(env.meta, v1meta, 'envelope: meta is the raw stored meta (no defaults merged)');
  ok(!('relics' in env.meta) && !('settings' in env.meta && 'master' in env.meta.settings), 'envelope: nothing from defaultMeta()');
  eq(env.run, v1run, 'envelope: the stored run');
  n = core.normalizeSave(env);
  eq(n.meta.runs, 3, 'normalize: saved meta kept');
  eq(n.meta.relics, {}, 'normalize: defaults filled');
  eq(n.meta.settings, { ...core.defaultMeta().settings, music: 0.2 }, 'normalize: settings merged key by key');
  eq(n.run.id, 'run_x', 'normalize: an active run kept');
  // exactly v1's loadSave semantics (what main had before the envelope)
  const v1Load = (raw) => {
    const meta = Object.assign(core.defaultMeta(), raw?.meta || {});
    meta.settings = Object.assign(core.defaultMeta().settings, raw?.meta?.settings || {});
    return { meta, run: raw?.run && raw.run.active ? raw.run : null };
  };
  for (const raw of [null, { version: 1, meta: v1meta, run: v1run }, { version: 1, meta: { runs: 1 }, run: { active: false, id: 'dead' } }, { version: 1, meta: { runs: 2 } }]) {
    if (raw) store.set(core.SAVE_KEY, JSON.stringify(raw)); else store.clear();
    eq(core.normalizeSave(core.loadSave()), v1Load(raw), `flag-off parity: normalizeSave(loadSave()) == v1 loadSave (${raw ? JSON.stringify(Object.keys(raw)) : 'empty'})`);
  }
  store.set(core.SAVE_KEY, '"not an object"');
  eq(core.loadSave().meta, {}, 'a corrupt save reads as empty');
  store.set(core.SAVE_KEY, '{broken json');
  eq(core.loadSave().version, 0, 'unparseable JSON reads as no save');
  // round trip through writeSave
  store.clear();
  core.writeSave({ meta: { ...core.defaultMeta(), runs: 5 }, run: { active: true, id: 'r5', nightMode: 'lantern', outing: 'normal' } });
  env = core.loadSave();
  eq([env.version, env.meta.runs, env.run.nightMode, env.run.outing], [core.VERSION, 5, 'lantern', 'normal'], 'writeSave → loadSave keeps the run\'s night mode and outing');
  core.writeSave({ meta: core.defaultMeta(), run: { active: false } });
  eq(core.loadSave().run, null, 'an inactive run is never written');
  globalThis.localStorage = saveLS;
}

// ------------------------------------------------------------------ slowmo
section('slowmo owns time.timeScale (CONTRACT §13.1)');
{
  const time = { timeScale: 1 };
  const sm = core.createSlowmo(time);
  ok(sm.start(0.25, 0.35), 'the leap reveal starts');
  near(time.timeScale, 0.35, 'time scale 0.35 during the reveal');
  ok(sm.active, 'active during the reveal');
  for (let i = 0; i < 4; i++) sm.tick(0.05);
  near(time.timeScale, 0.35, 'still slow after 0.2 s');
  sm.tick(0.05);
  eq(time.timeScale, 1, 'restored to 1 after 0.25 s of running time');
  ok(!sm.active, 'inactive after the reveal');

  time.timeScale = 4; // a test's debug.timeScale(4)
  sm.start(0.25, 0.35);
  near(time.timeScale, 1.4, 'the beat scales the base (4 × 0.35)');
  sm.tick(0.3);
  eq(time.timeScale, 4, 'restores the base it found (4)');

  time.timeScale = 1;
  sm.start(0.25, 0.35);
  sm.start(0.1, 0.5);
  near(time.timeScale, 0.35, 'overlap keeps the slower scale');
  sm.tick(0.2);
  ok(sm.active, 'overlap keeps the longer remainder');
  sm.tick(0.06);
  eq(time.timeScale, 1, 'overlap restores 1 at the end');

  sm.start(0.25, 0.35);
  sm.setBase(2);
  near(time.timeScale, 0.7, 'setBase during the beat reapplies the factor');
  sm.tick(1);
  eq(time.timeScale, 2, 'and restores to the new base');

  time.timeScale = 1;
  sm.start(0.25, 0.35);
  time.timeScale = 3; // someone else rewrote it mid-beat
  sm.tick(1);
  eq(time.timeScale, 3, 'an outside rewrite is left alone at the restore');

  time.timeScale = 1;
  sm.start(0.25, 0.35);
  sm.cancel();
  eq(time.timeScale, 1, 'cancel restores at once');
  eq(sm.start(0, 0.35), false, 'a zero-length beat does nothing');
  eq(time.timeScale, 1, 'zero-length: time scale untouched');
  sm.start(1, 0);
  near(time.timeScale, 0.01, 'scale clamps to ≥ 0.01');
  sm.cancel();
  sm.start(1, 7);
  eq(time.timeScale, 1, 'scale clamps to ≤ 1 (slow motion never speeds up)');
  sm.cancel();
  sm.setBase(1.5);
  eq(time.timeScale, 1.5, 'setBase with no beat is a plain timeScale write (debug.timeScale parity)');
}

// ------------------------------------------------------------------ run options
section('startNewRun options (CONTRACT §13.0, DESIGN §25.5.1 / §25.5.8)');
{
  globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
  const D = await import('../../src/data.js?v3p1');
  delete globalThis.GW_V3; delete globalThis.GW_V3_PHASE;
  ok(D.V3_ENABLED === true && D.V3_PHASE === 1, 'data evaluated with v3 on at phase 1');
  const NM = D.BALANCE.nightModes;
  ok(!!NM && Array.isArray(NM.order), 'BALANCE.nightModes merged at P1');
  const O = core.v3RunOptions;
  eq(O({ runs: 0 }, {}, NM), { outing: 'first', nightMode: 'still' }, 'run 1 (meta.runs 0): the First Outing, every night still');
  eq(O({ runs: 0 }, { nightMode: 'gloomtide' }, NM), { outing: 'first', nightMode: 'still' }, 'run 1 ignores a mode choice');
  eq(O({ runs: 1 }, {}, NM), { outing: 'normal', nightMode: 'lantern' }, 'run 2 with no choice: Lantern (the default)');
  eq(O({ runs: 1 }, { nightMode: 'still' }, NM).nightMode, 'still', 'run 2: Still when chosen');
  eq(O({ runs: 7 }, { nightMode: 'gloomtide' }, NM).nightMode, 'gloomtide', 'later run: Gloomtide when chosen');
  eq(O({ runs: 2 }, { nightMode: 'bogus' }, NM).nightMode, 'lantern', 'an unknown mode falls back to the default');
  eq(O({}, {}, NM).outing, 'first', 'a meta without runs counts as run 1');
  eq(O({ runs: 1 }, {}, { ...NM, offeredFrom: 3 }).nightMode, 'still', 'runs before offeredFrom stay still');
  eq(O({ runs: 1 }, {}, null), { outing: 'normal', nightMode: 'lantern' }, 'no nightModes table: built-in order and Lantern');
  ok(NM.order.includes(O({ runs: 3 }, {}, NM).nightMode), 'the mode is always one of nightModes.order');
}

console.log(`\nmain-v3: ${pass} passed, ${fail} failed`);
if (fail) { console.log(failures.map((f) => '  - ' + f).join('\n')); process.exit(1); }
