// FE-N1 / FE-M1 / M2 unit tests (DESIGN §25.4.8, §25.14.2b; CONTRACT §13.1, §13.11, §13.12): the First Evening director
// (src/first-evening.js) driven by a scripted bus — the reference player visits every step in order in ≈ 54.5 s of reference
// time with the First Outing card by 50 s; three losses jump to `gate` with the deferred lessons set; one line of each kind at a
// time and nothing but `fe_strike` in the strike window; every Murk line plays out before its step ends; two Skip taps reach the
// card from every step and grant nothing; resume lands on `cast` (Murk's wake line, no framing) before the catch and on `gate`
// after it; a replay writes nothing to meta. Plus core.js's debug switch, the legacy step and the resume rule.
//   node tools/tests/first-evening.test.mjs
globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = 1;
const D = await import('../../src/data.js');
const core = await import('../../src/core.js');
const FEmod = await import('../../src/first-evening.js');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; failures.push(msg); console.log('  FAIL:', msg); } }
function eq(a, b, msg) { ok(Object.is(a, b) || JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
const near = (a, b, eps, msg) => ok(Math.abs(a - b) <= eps, `${msg} (got ${a}, want ${b} ± ${eps})`);
const section = (s) => console.log(`- ${s}`);
const FE = D.FIRST_EVENING;

// ------------------------------------------------------------------ a fake game around the director
function harness({ meta = {}, mobile = false, player = true } = {}) {
  const bus = core.createBus();
  const log = [];
  const ctx = { bus, data: D, state: { meta, run: null }, isMobile: mobile, errors: [], flow: 'hub' };
  const calls = { tutorial: [], lantern: [], wake: 0, mooring: 0, post: 0, card: 0, ember: 0, cancel: 0 };
  ctx.fishing = { state: 'idle', setTutorial(o) { calls.tutorial.push(o); }, hardReset() { calls.cancel++; } };
  ctx.actors = { setLantern(k, over) { calls.lantern.push([k, over]); }, playWake() { calls.wake++; } };
  ctx.world = { setEmber() { calls.ember++; }, getMode: () => 'raft' };
  ctx.ui = { showFirstOuting() { calls.card++; } };
  let glide = null;
  if (player) ctx.player = {
    toMooring() { calls.mooring++; }, toPost() { calls.post++; },
    setOutFromPost({ onLine }) { glide = { t: 0, onLine }; return Promise.resolve(true); },
  };
  const fe = FEmod.create(ctx);
  ctx.firstEvening = fe;
  fe.init();
  let t = 0;
  for (const e of ['firstEvening:step', 'firstEvening:line', 'firstEvening:done', 'firstEvening:beat', 'firstEvening:card', 'firstEvening:skip', 'tip:show']) {
    bus.on(e, (p) => log.push({ e, t: +t.toFixed(3), p: { ...p } }));
  }
  const tick = (sec, dt = 0.05) => {
    const n = Math.round(sec / dt);
    for (let i = 0; i < n; i++) {
      t += dt;
      fe.update(dt);
      if (glide) { glide.t += dt; if (glide.t >= 6 && glide.onLine) { const f = glide.onLine; glide = null; f(); } }
    }
  };
  const emit = (e, p = {}) => bus.emit(e, p);
  return { ctx, fe, bus, log, calls, tick, emit, get t() { return t; }, steps: () => log.filter((x) => x.e === 'firstEvening:step').map((x) => x.p.id) };
}
/** The reference player (FIRST_EVENING.stepSec): acts at the end of each step's reference time. */
function playReference(H, { lose = 0, openLog = false } = {}) {
  const S = FE.stepSec;
  H.fe.start();
  H.tick(S.framing + S.wake);                       // framing 9 + wake 8
  let losses = 0;
  for (;;) {
    H.tick(S.cast); H.emit('fishing:cast', { power: 0.8 });
    H.tick(0.6); H.emit('fishing:land', {});
    H.tick(S.wait - 0.6); H.emit('fishing:bite', { sizeClass: 'small', biteTell: 'doublePop' });
    H.tick(S.strike); H.emit('fishing:strike', { grade: 'clean', sizeClass: 'small' }); H.emit('fishing:hook', { grade: 'clean', perfect: true, sizeClass: 'small' });
    H.tick(S.play);
    if (losses < lose) {
      losses++;
      H.emit('fishing:escaped', { reason: 'spat', sizeClass: 'small' });
      H.tick(0.6);
      H.emit('fish:escaped', { speciesId: 'quayling', sizeClass: 'small', reason: 'spat' });
      H.tick(0.8 + 6.5);   // the toast, then Murk's loss line plays out before anything moves on
      if (H.fe.step === 'gate') return;
      continue;
    }
    H.emit('fishing:caught', { speciesId: 'quayling', sizeClass: 'small' });
    break;
  }
  H.tick(1.0); H.emit('fish:landed', { measured: true });
  H.tick(S.measure - 1.0); H.emit('fish:action', { action: 'release' });
  if (openLog) { H.tick(1.0); H.emit('ui:screen', { id: 'journal', open: true }); H.tick(2); H.emit('ui:screen', { id: 'journal', open: false }); }
}

// ------------------------------------------------------------------ core helpers
section('core: debug switch (M2), the legacy step, the resume rule');
{
  const R = core.resolveDebug;
  eq(R({}), false, 'no URL, no storage, no preset → debug off (a release build)');
  eq(R({ search: '?debug=1' }), true, '?debug=1 → on');
  eq(R({ stored: '1' }), true, 'localStorage gw.debug = "1" → on');
  eq(R({ preset: true }), true, 'GW_DEBUG = true (the scenario runner) → on');
  eq(R({ preset: true, search: '?debug=0' }), false, '?debug=0 beats the preset');
  eq(R({ stored: '0' }), false, 'gw.debug "0" → off');
  eq(core.debugEnabled({}), false, 'node / no document: off');
  eq(core.debugEnabled({ GW_DEBUG: true }), true, 'GW_DEBUG read live');
  ok(['fishChance', 'fishPlan', 'fishOutcome', 'fishSeed', 'preroll', 'fishing'].every((k) => core.HIDDEN_DEBUG_HOOKS.includes(k)), 'the hidden-state hooks of CONTRACT §13.11 are on the strip list');
  ok(core.inWorld({ flow: 'hub' }) && core.inWorld({ flow: 'playing' }) && !core.inWorld({ flow: 'title' }) && !core.inWorld({ flow: 'dead' }), 'inWorld: playing || hub');

  const L = (m) => { core.firstEveningLegacy(m, ['quayling']); return m.firstEvening; };
  eq(L({ runs: 0, journal: {} }), { done: false, step: null, skipped: false, legacy: false }, 'a fresh save → {done: false, step: null}');
  eq(L({ runs: 3, journal: {} }), { done: true, step: null, skipped: false, legacy: true }, 'a v1 save with runs → legacy, done');
  eq(L({ runs: 0, journal: { dusk_minnow: { caught: 2 } } }).legacy, true, 'a lake fish in the journal → legacy');
  eq(L({ runs: 0, journal: { quayling: { caught: 1 } } }).legacy, false, 'a mid-First-Evening save with a Quayling is not legacy');
  const m = { runs: 5, firstEvening: { done: false, step: 'cast' } };
  ok(core.firstEveningLegacy(m) === false && m.firstEvening.step === 'cast', 'idempotent: an existing meta.firstEvening is never rewritten');
  const S = FE.steps;
  eq(['framing', 'wake', 'cast', 'wait', 'strike', 'play'].map((s) => core.firstEveningResumeStep(s, S)), ['cast', 'cast', 'cast', 'cast', 'cast', 'cast'], 'before the catch → cast');
  eq(['measure', 'odds', 'gate', 'plan', 'setout'].map((s) => core.firstEveningResumeStep(s, S)), ['gate', 'gate', 'gate', 'gate', 'gate'], 'after the catch → gate');
  eq(core.firstEveningResumeStep(null, S), null, 'no step → no resume');
}

// ------------------------------------------------------------------ helpers of the director
section('lines: Murk holds 2.4 s + 0.05 s per character; the lore schedule fits the framing');
{
  near(FEmod.murkHold(FE.text.murkWake, FE.lines), 2.4 + 0.05 * FE.text.murkWake.length, 1e-9, 'murkHold(murkWake)');
  const L = FEmod.loreSchedule(FE);
  eq(L.length, 3, 'three lore lines');
  eq(L.map((x) => x.at), [0, 3, 6.2], 'the lines start with the shot keyframes');
  ok(L.every((x, i) => i === L.length - 1 || x.end <= L[i + 1].at + 1e-9), 'no two lore lines overlap');
  ok(L[L.length - 1].end <= FE.stepSec.framing + 1e-9, 'the last lore line has faded by the end of the framing (9 s)');
  ok(L.every((x) => x.hold >= 2.4), 'each line holds ≥ 2.4 s');
}

// ------------------------------------------------------------------ the reference player
section('the reference player: every step in order, ≈ 54.5 s, the card by 50 s');
{
  const H = harness({ meta: { runs: 0, journal: {}, seenTips: {} } });
  core.firstEveningLegacy(H.ctx.state.meta);
  playReference(H);
  const S = FE.stepSec;
  // odds: Murk's line (5.8 s) plays out
  H.tick(S.odds);
  eq(H.fe.step, 'gate', 'odds → gate when Murk\'s line has played out');
  H.tick(3.5); H.emit('interact:change', { id: 'station:map_table', label: 'Plan' });
  H.tick(S.gate - 3.5); H.emit('station:open', { id: 'map_table' });
  H.tick(0.05);
  eq(H.fe.step, 'plan', 'the Plan pill opens the First Outing card');
  const cardAt = H.log.find((x) => x.e === 'firstEvening:card' && x.p.open)?.t;
  ok(cardAt !== undefined && cardAt <= FE.budget.toCard, `the First Outing card by ${FE.budget.toCard} s (at ${cardAt} s)`);
  eq(H.calls.card, 1, 'ui.showFirstOuting called once');
  H.tick(S.plan); H.fe.onPlan({ zone: 'mossmere' });
  eq(H.fe.step, 'setout', 'Set Out → setout');
  H.tick(6.2);
  const done = H.log.filter((x) => x.e === 'firstEvening:done');
  eq(done.length, 1, 'firstEvening:done fires once');
  const doneAt = done[0]?.t;
  near(doneAt, FE.budget.reference, 1.0, 'the arch crossing at ≈ the reference 54.5 s');
  ok(doneAt <= FE.budget.toLake, `the lake (the arch crossing) by ${FE.budget.toLake} s`);
  eq(H.steps(), FE.steps, 'every step, in order, once');
  eq(done[0].p, { skipped: false, replay: false, losses: 0 }, 'done payload');
  const m = H.ctx.state.meta.firstEvening;
  ok(m.done === true && m.step === null && !m.skipped, 'meta.firstEvening.done = true at the arch crossing');
  ok(FE.marksSeen.every((id) => H.ctx.state.meta.seenTips[id] === true), 'cast_basics, nibble_wait, miss_early, miss_late, sail_basics marked seen');
  ok(!H.fe.isActive() && H.fe.step === null, 'the director is idle after the arch');
  // the tutorial seam: waits and presentation only
  const opts = H.calls.tutorial.find((o) => o);
  ok(!!opts && Object.keys(opts).every((k) => FE.tutorialApi.accepts.includes(k)), 'setTutorial gets only the accepted keys', opts);
  ok(!!opts && FE.tutorialApi.rejects.every((k) => !(k in opts)), 'setTutorial never passes an outcome, class, chance, z or species');
  eq(H.calls.tutorial.at(-1), null, 'setTutorial(null) at setout');
  ok(H.calls.lantern.some(([k]) => k === 0.7) && H.calls.lantern.some(([k, o]) => k === 1 && o === 0.8), 'the lantern at 0.7, then 1.0 over 0.8 s at Set Out');
  ok(H.calls.wake === 1 && H.calls.mooring >= 1 && H.calls.ember === 1, 'the wake plays once, the wipe moors the raft, the ember pulses once');
  // the lines
  const lines = H.log.filter((x) => x.e === 'firstEvening:line');
  const murk = lines.filter((x) => x.p.kind === 'murk' && x.p.key);
  eq(murk.map((x) => x.p.key), ['murkWake', 'murkOdds', 'murkGate', 'murkFirstOil'], 'Murk\'s lines on the reference path');
  ok(lines.every((x) => x.p.kind !== 'murk' || !x.p.text || x.p.text.length <= FE.lines.maxChars), 'every line ≤ 90 characters');
  ok(lines.every((x) => !/[%!]/.test(x.p.text || '')), 'no % and no exclamation marks');
  const tips = lines.filter((x) => x.p.kind === 'tip' && x.p.key).map((x) => x.p.key);
  eq(tips, ['fe_cast', 'fe_wait', 'fe_strike', 'fe_play', 'fe_sail'], 'one tip per teaching step, in order');
  eq(lines.find((x) => x.p.key === 'fe_strike')?.p.text, 'Now. Click.', 'desktop strike wording');
  // the strike window: from the bite to the strike, no lore or Murk line, and only fe_strike as a tip
  const stepAt = (id) => H.log.find((x) => x.e === 'firstEvening:step' && x.p.id === id)?.t;
  const biteT = stepAt('strike'), strikeT = stepAt('play');
  ok(Number.isFinite(biteT) && strikeT > biteT, 'the strike window is found in the log');
  let murkUp = null, loreUp = null;
  for (const x of lines) {
    if (x.t >= strikeT) break;
    if (x.p.kind === 'murk') murkUp = x.p.key ? x : null;
    if (x.p.kind === 'lore') loreUp = x.p.key ? x : null;
    if (x.t >= biteT && x.p.kind === 'tip' && x.p.key) ok(x.p.key === 'fe_strike', `only fe_strike in the strike window (${x.p.key})`);
  }
  const murkEnd = murkUp ? murkUp.t + murkUp.p.hold : -1;
  ok(murkEnd < biteT && !loreUp, 'no lore or Murk line is up in the strike window');
}

section('a step never ends before its Murk line; the director never cuts a line short');
{
  const H = harness({ meta: { runs: 0, journal: {} } });
  playReference(H);
  // the player taps Plan at once, while Murk's gate line is still playing
  H.tick(0.05);
  let guard = 0;
  while (H.fe.step !== 'gate' && guard++ < 400) H.tick(0.05);
  H.emit('interact:change', { id: 'station:map_table' }); H.emit('station:open', { id: 'map_table' });
  H.tick(0.5);
  eq(H.fe.step, 'gate', 'Plan during Murk\'s gate line waits for the line');
  H.tick(FEmod.murkHold(FE.text.murkGate, FE.lines));
  eq(H.fe.step, 'plan', '… and opens the card once it has played out');
  const ends = H.log.filter((x) => x.e === 'firstEvening:line' && x.p.kind === 'murk' && !x.p.key && x.p.ended);
  ok(ends.length >= 2, 'Murk\'s lines end on their own clock (ended events)');
}

section('three losses: jump to gate, the deferred lessons set; the loss lines');
{
  const H = harness({ meta: { runs: 0, journal: {} } });
  playReference(H, { lose: 3 });
  eq(H.fe.step, 'gate', 'the third loss moves straight to gate');
  eq(H.fe.losses, 3, 'three losses counted');
  eq(H.ctx.state.meta.firstEvening.deferred, { measure: true, odds: true }, 'the measuring lesson and Murk\'s odds line are deferred to the lake');
  const murk = H.log.filter((x) => x.e === 'firstEvening:line' && x.p.kind === 'murk' && x.p.key).map((x) => x.p.text);
  ok(FE.text.murkLost.every((l) => murk.includes(l)), 'Murk\'s three loss lines, in order');
  const st = H.steps();
  ok(!st.includes('measure') && !st.includes('odds') && st.at(-1) === 'gate', 'no measure / odds steps after three losses', st);
  eq(st.filter((s) => s === 'cast').length, 3, 'two retries (cast three times)');
  // one loss: back to cast, and a fresh bite after a recast
  const H2 = harness({ meta: { runs: 0, journal: {} } });
  playReference(H2, { lose: 1 });
  ok(H2.steps().filter((s) => s === 'cast').length === 2 && H2.steps().includes('measure'), 'one loss → recast → the catch');
}

section('spooked nibble and a passed bite: Murk, then back to cast; input held while he speaks');
{
  const H = harness({ meta: { runs: 0, journal: {} } });
  H.fe.start();
  H.tick(17);
  H.emit('fishing:cast', {}); H.tick(0.5);
  H.emit('fishing:miss', { reason: 'spooked' });
  H.tick(0.1);
  ok(H.fe.locksInput(), 'the world takes no tap while Murk says "Too keen…"');
  H.tick(FEmod.murkHold(FE.text.murkSpooked, FE.lines));
  eq(H.fe.step, 'cast', 'back to cast after the line');
  ok(!H.fe.locksInput(), 'input back');
  H.emit('fishing:cast', {}); H.tick(1); H.emit('fishing:bite', {}); H.tick(0.7);
  H.emit('fishing:miss', { reason: 'passed', refunded: true });
  H.tick(0.1);
  eq(H.log.filter((x) => x.e === 'firstEvening:line' && x.p.key === 'murkPassed').length, 1, 'a passed bite: "It let go. Bait\'s still on. Again."');
  H.tick(5);
  eq(H.fe.step, 'cast', 'back to cast');
  ok(H.fe.state.fumbled, 'a fumbled tutorial strike is remembered (af_strikeReminder at the first lake bite)');
}

section('Skip: two taps reach the First Outing card from every step and grant nothing');
{
  for (const stop of ['framing', 'wake', 'cast', 'wait', 'strike', 'play', 'measure', 'odds', 'gate']) {
    const H = harness({ meta: { runs: 0, journal: {}, memories: 0 } });
    H.fe.start();
    if (stop !== 'framing') H.fe.debugJump(stop);
    H.tick(0.3);
    const t0 = H.t;
    const first = H.fe.skipWord();
    H.tick(0.4);
    const second = H.fe.skipWord();
    H.tick(0.05);
    ok(H.fe.step === 'plan' && H.t - t0 <= 1, `from ${stop}: two Skip taps → plan within 1 s (${first}, ${second})`);
    ok(H.ctx.state.meta.firstEvening.skipped === true && H.ctx.state.meta.memories === 0, `from ${stop}: skipped = true, nothing granted`);
    ok(H.calls.post >= 1, `from ${stop}: the raft waits in the post's reach`);
  }
  // one tap in the framing skips the framing only
  const H = harness({ meta: { runs: 0, journal: {} } });
  H.fe.start(); H.tick(1);
  eq(H.fe.skipWord(), 'framing', 'the first Skip tap in the framing jumps to the wake');
  eq(H.fe.step, 'wake', '… the wake');
  H.tick(3);
  eq(H.fe.skipConfirm, false, 'the confirm lapses after 2.5 s');
  ok(H.log.some((x) => x.e === 'firstEvening:skip' && x.p.confirm === true), 'the confirm ("Skip the first evening?") was offered');
  // closing the card returns to gate
  const H2 = harness({ meta: { runs: 0, journal: {} } });
  H2.fe.start(); H2.fe.skipWord(); H2.fe.skipWord(); H2.tick(0.1);
  H2.fe.onCardClosed();
  eq(H2.fe.step, 'gate', 'closing the card without Set Out returns to gate');
  H2.emit('station:open', { id: 'map_table' }); H2.tick(6);
  eq(H2.fe.step, 'plan', 'the post opens it again');
}

section('resume (a quit First Evening) and allowsTip');
{
  const H = harness({ meta: { runs: 0, journal: {}, firstEvening: { done: false, step: 'wait', skipped: false, legacy: false } } });
  H.fe.resume();
  eq(H.fe.step, 'wake', 'before the catch: the wake beat (Murk\'s wake line) …');
  ok(H.log.some((x) => x.e === 'firstEvening:line' && x.p.key === 'murkWake'), '… Murk\'s wake line once more');
  ok(!H.steps().includes('framing') && H.calls.wake === 0, 'no framing and no candle animation on a resume');
  H.tick(FEmod.murkHold(FE.text.murkWake, FE.lines) + 0.1);
  eq(H.fe.step, 'cast', '… then cast');
  const H2 = harness({ meta: { runs: 0, journal: {}, firstEvening: { done: false, step: 'odds', skipped: false, legacy: false } } });
  H2.fe.resume();
  eq(H2.fe.step, 'gate', 'after the catch: gate');
  ok(H2.fe.allowsTip('fe_sail') && !H2.fe.allowsTip('cast_basics') && !H2.fe.allowsTip('v3_favour'), 'allowsTip: only the current step\'s tip while active');
  H2.fe.stop();
  ok(H2.fe.allowsTip('v3_favour') && !H2.fe.isActive(), 'inactive: every tip passes');
}

section('replay: a sandbox that writes nothing (the director\'s side), ends at the Map Table post');
{
  const meta = { runs: 4, journal: { dusk_minnow: { caught: 3 } }, memories: 12, firstEvening: { done: true, step: null, skipped: false, legacy: true, offerSeen: true } };
  const before = JSON.stringify(meta);
  const H = harness({ meta });
  H.fe.start({ replay: true });
  ok(H.fe.sandbox && H.fe.replay, 'sandbox flag on');
  H.tick(17);
  H.emit('fishing:cast', {}); H.tick(2); H.emit('fishing:bite', {}); H.tick(0.4); H.emit('fishing:strike', { grade: 'struck' });
  H.tick(2); H.emit('fishing:caught', {}); H.tick(2); H.emit('fish:action', { action: 'release' });
  H.tick(6.5);
  eq(H.fe.step, 'gate', 'the replay reaches gate');
  H.tick(6); H.emit('station:open', { id: 'map_table' });
  H.tick(0.1);
  ok(H.log.some((x) => x.e === 'firstEvening:line' && x.p.key === 'murkReplay'), 'Murk: "Same as it ever was…"');
  H.tick(5);
  const done = H.log.filter((x) => x.e === 'firstEvening:done');
  ok(done.length === 1 && done[0].p.replay === true, 'firstEvening:done {replay: true} at the post');
  eq(JSON.stringify(meta), before, 'the director wrote nothing to meta during the replay');
  eq(H.steps().filter((s) => s === 'framing').length, 1, 'the replay starts with the framing');
}

section('after the First Evening: directed tips at the first lake bite, Murk\'s deferred odds line');
{
  const H = harness({ meta: { runs: 1, journal: {}, firstEvening: { done: true, step: null, legacy: true, fumbled: true, deferred: { odds: true, measure: true } } } });
  H.ctx.state.run = { zone: 'mossmere' }; H.ctx.flow = 'playing';
  H.emit('fishing:bite', { sizeClass: 'keeper' });
  H.emit('fishing:bite', { sizeClass: 'keeper' });
  eq(H.log.filter((x) => x.e === 'tip:show').map((x) => x.p.id), ['af_changed', 'af_strikeReminder'], 'a legacy save\'s first v3 bite: af_changed; a fumbled tutorial strike: af_strikeReminder (once each)');
  H.emit('merchant:arrive', {});
  ok(H.log.some((x) => x.e === 'firstEvening:line' && x.p.key === 'murkOdds' && x.p.deferred), 'Murk\'s first in-lake visit says the odds line');
  ok(H.ctx.state.meta.firstEvening.deferred.odds === false, '… once');
  H.emit('fish:measured', { cove: false });
  ok(H.log.some((x) => x.e === 'firstEvening:beat' && x.p.id === 'deferredMeasure'), 'the deferred measuring lesson at the first lake landing');
}

section('no player glide in the build: the setout step still ends (6 s), never stalls');
{
  const H = harness({ meta: { runs: 0, journal: {} }, player: false });
  H.fe.start(); H.fe.skipWord(); H.fe.skipWord(); H.tick(0.1);
  H.fe.onPlan({});
  H.tick(6.2);
  eq(H.log.filter((x) => x.e === 'firstEvening:done').length, 1, 'done after the step\'s 6 s');
}

console.log(`first-evening: ${pass} passed, ${fail} failed`);
if (fail) { for (const f of failures) console.log('  - ' + f); process.exit(1); }
