// Browser scenario for the v3 Phase 1 progression items (DESIGN §25.14.2 Pg0, Pg12, Pg1) on a v3 build at phase 1.
// Not a node test (check.mjs runs *.test.mjs only). Build a flag-on page, then drive it with playtest:
//   node build.mjs --dev --out=tools/out/p1-progression.html
//   (inject `<script>globalThis.GW_V3=true;globalThis.GW_V3_PHASE=1;</script>` before the module script → tools/out/p1-progression-v3.html,
//    or use main's rollout switch once it lands)
//   node tools/playtest.mjs --html=tools/out/p1-progression-v3.html --script=tools/tests/p1-progression.scenario.mjs --width=960 --height=540 --lean
// Flow: boot (v3 on, meta.v3ids) → Pg0: a v1 save in localStorage, reload, Continue → renamed ids; a second reload changes
// nothing → wipe → Pg12: run 1 is the First Outing (still), run 2 is a normal outing in a mode; Hold (no fight stats) from upgrades →
// Pg1: an Elder Reedjaw (z 2.8) measured once before the card, 127 Shells, class first / Elder Log banked and saved at once,
// a first Elder release banks +8 at once; a real (v1-rolled) catch measured through the compat path; reload keeps the
// records → the death screen: no species row, the nights row at the tally's values, titled Snuffed.
export default async function (api) {
  const { page, wait, frames, evalGame: g, log, shot } = api;
  const failures = [];
  let stepName = 'boot';
  const step = (s) => { stepName = s; log(`---- ${s}`); };
  const check = (cond, msg, extra) => {
    if (cond) { log('ok  ', msg); return true; }
    failures.push(`[${stepName}] ${msg}${extra !== undefined ? ` :: ${JSON.stringify(extra)}` : ''}`);
    log('FAIL', msg, extra !== undefined ? JSON.stringify(extra) : '');
    return false;
  };
  const reload = async () => {   // software GL on a loaded machine: a generous load timeout, then wait for the game object
    await page.reload({ timeout: 240000, waitUntil: 'domcontentloaded' });
    for (let i = 0; i < 120 && !(await g(() => !!window.__gw?.progression && window.__gw.flow !== 'boot').catch(() => false)); i++) await wait(1000);
    await g(() => window.__gw?.debug?.renderScale?.(0.45)).catch(() => {});
    await frames(3);
  };
  const watchBus = () => g(() => {   // listeners once per page; each call resets the counters
    const c = window.__gw;
    window.__p1 = { order: [], measured: 0 };
    if (c.__p1Watch) return;
    c.__p1Watch = true;
    for (const e of ['fish:measured', 'fish:landed', 'memories:change']) c.bus.on(e, (p) => { window.__p1.order.push(e === 'memories:change' ? `mem:${p.source}:${p.delta}` : e); if (e === 'fish:measured') window.__p1.measured++; });
  });
  const errs = async () => { const e = await g(() => window.__gw.errors.slice()); check(e.length === 0, 'ctx.errors stays empty', e); };

  // ------------------------------------------------------------------------------------------------ boot
  step('boot: the v3 build');
  const boot = await g(() => { const c = window.__gw; return { v3: c.data.V3_ENABLED, phase: c.data.V3_PHASE, v3ids: c.state.meta.v3ids, flow: c.flow }; });
  check(boot.v3 === true && boot.phase === 1, 'data.V3_ENABLED at phase 1', boot);
  check(boot.v3ids === true, 'a fresh meta is marked v3ids at boot', boot);

  // ------------------------------------------------------------------------------------------------ Pg0
  step('Pg0: a v1 save loads with the renamed ids');
  await g(() => {
    const meta = {
      memories: 50, memoriesEarnedTotal: 50, relics: {}, runs: 5, deaths: 4, deepestZone: 3, victory: false, victories: 0, totalFish: 60, totalSlain: 0, bestLevel: 9,
      tutorialDone: true, seenTips: {}, challenges: {}, challengeProgress: {}, lastCharacter: 'wick', bestDay: 9,
      journal: { pale_leviathan: { caught: 1, biggest: 212.4, firstDay: 9, firstRun: 5 }, dusk_minnow: { caught: 9, biggest: 0.3, firstDay: 1, firstRun: 1 } },
      unlocks: { 'bait:pale_marrow': true, 'trophy:pale_leviathan': true },
      settings: { master: 0.8, music: 0.6, sfx: 0.9, quality: 'auto', screenShake: true, damageNumbers: true },
    };
    const run = {
      active: true, id: 'run_v1', seed: 7, playTime: 30, character: 'wick', day: 2, phase: 'calm', phaseTime: 10, hp: 5, oil: 90, satiety: 80,
      zone: 'mossmere', zonesUnlocked: ['mossmere'], gateOpen: false, shells: 120, bait: { pale_marrow: 1, mireworm: 3 }, equippedBait: 'pale_marrow',
      creel: [{ uid: 'fish_v1a', speciesId: 'dusk_minnow', weight: 0.2, quality: 'normal', value: 5, food: 8, oil: 9, caughtDay: 2, rarity: 'common', legendary: false, zone: 'mossmere' }],
      upgrades: {}, legendaries: { pale_leviathan: true }, bounties: [], level: 3, xp: 2, xpNext: 9, boons: { drifting_motes: 1 }, rerollsUsed: 0,
      stats: { fishCaught: 3, fishLost: 0, perfectHooks: 0, enemiesSlain: 0, elitesSlain: 0, bossesSlain: 0, shellsEarned: 20, biggest: null, newSpecies: 0, damageTaken: 0, nightsSurvived: 1, nightsNoDamage: 0, maxLevel: 3 },
      flags: { zoneEnteredDay: 1, streak: 0, mercy: 0, heartwax: 0, wounded: {}, nights: 1, records: [], challengesDone: [], ch: {}, visit: { day: 2, sold: 0, supplies: { tide_chart: 1 } } },
    };
    window.__gw.game.save = () => {};   // the reload's pagehide save must not overwrite the planted v1 save
    localStorage.setItem('gloomwater.save.v1', JSON.stringify({ version: 1, savedAt: Date.now(), meta, run }));
  });
  await reload();
  const m0 = await g(() => { const c = window.__gw; const m = c.state.meta; return { j: Object.keys(m.journal), un: Object.keys(m.unlocks), v3ids: m.v3ids, saved: c.game.hasSavedRun() }; });
  check(m0.j.includes('lantern_swallower') && !m0.j.includes('pale_leviathan'), 'the Journal holds the Lantern-Swallower', m0);
  check(m0.un.includes('bait:last_candle') && !m0.un.includes('bait:pale_marrow'), 'the bait unlock is kept under Last Candle', m0);
  check(m0.v3ids === true && m0.saved, 'meta.v3ids; the saved run waits for Continue', m0);
  await g(() => window.__gw.game.continueRun());
  await frames(5);
  const r0 = await g(() => { const c = window.__gw; const r = c.state.run; return { bait: r.bait, eq: r.equippedBait, leg: r.legendaries, mode: r.nightMode, outing: r.outing, sup: r.flags.visit?.supplies, bait2: String(c.progression.getEquippedBait()) }; });
  check(r0.bait.last_candle === 1 && !('pale_marrow' in r0.bait) && r0.eq === 'last_candle' && r0.bait2 === 'last_candle', 'Last Candle in the bag and on the hook', r0);
  check(r0.leg.lantern_swallower === true && !('tide_chart' in (r0.sup || {})), 'run.legendaries renamed; no old supply id left (a new Murk visit may reset the per-visit counts)', r0);
  check(r0.mode === 'gloomtide' && r0.outing === 'normal', 'a v1 run continues under its own rules (Gloomtide)', r0);
  await g(() => window.__gw.game.save());
  const snap = () => g(() => { const s = JSON.parse(localStorage.getItem('gloomwater.save.v1')); return JSON.stringify({ j: s.meta.journal, u: s.meta.unlocks, v: s.meta.v3ids, b: s.run?.bait, e: s.run?.equippedBait, l: s.run?.legendaries }); });
  const before = await snap();
  await reload();
  await g(() => window.__gw.game.save());
  check((await snap()) === before, 'a second load changes nothing');
  await errs();

  // ------------------------------------------------------------------------------------------------ Pg12
  step('Pg12: the First Outing, then a normal outing; Hold from upgrades, no fight stats');
  await g(() => { window.__gw.game.wipeAll(); });
  await frames(3);
  const nm0 = await g(() => window.__gw.progression.getNightModes());
  check(nm0?.firstOuting === true && nm0.modes.length === 0, 'a fresh save is offered only the First Outing', nm0);
  await g(() => window.__gw.game.startNewRun({ nightMode: 'gloomtide' }));
  await frames(5);
  const r1 = await g(() => window.__gw.debug.v3());
  check(r1.outing === 'first' && r1.nightMode === 'still', 'run 1 is the First Outing, still (asked for Gloomtide)', r1);
  check(await g(() => [1, 2, 3, 4].every((n) => !window.__gw.data.swarmTonight(window.__gw.state.run.nightMode, n, window.__gw.state.run.outing))), 'no swarm on any night of run 1');
  // D1′ retired the manual reel's v3 fight stats: owned upgrades add Hold (data.upgradeHold), never shock / pipBonus / absorb / dragAt
  const st = await g(() => { const c = window.__gw; const r = c.state.run; r.upgrades = { rod_ashwood: 3, rod_whalebone: 2, reel_brass: 4, reel_drag: 3 }; c.progression.invalidateStats(); const s = c.progression.getStats(); const out = { shock: s.shock ?? null, pipBonus: s.pipBonus ?? null, absorb: s.absorb ?? null, dragAt: s.dragAt ?? null, reelHold: c.data.upgradeHold(r.upgrades).reel }; r.upgrades = {}; c.progression.invalidateStats(); return out; });
  check(st.shock === null && st.pipBonus === null && st.absorb === null && st.dragAt === null && st.reelHold === 12, 'owned upgrades add Hold (upgradeHold, reel 7/7 → 12), no v3 fight stats on getStats (retired by D1′)', st);
  await shot('p1prog-01-first-outing');
  await g(() => window.__gw.game.endRun('abandoned'));
  await frames(3);
  const nm1 = await g(() => window.__gw.progression.getNightModes());
  check(nm1?.firstOuting === false && nm1.default === 'lantern' && nm1.modes.map((m) => m.id).join() === 'still,lantern,gloomtide', 'run 2 offers three modes with Lantern preselected', nm1);
  await g(() => { window.__gw.ui.closeAll?.(); window.__gw.game.startNewRun({ nightMode: 'lantern' }); });
  await frames(5);
  const r2 = await g(() => window.__gw.debug.v3());
  check(r2.outing === 'normal' && r2.nightMode === 'lantern', 'run 2 is a normal outing in Lantern', r2);
  check(await g(() => window.__gw.progression.createRun({ nightMode: 'gloomtide' }).nightMode === 'gloomtide'), 'createRun honours the chosen mode from run 2');
  await errs();

  // ------------------------------------------------------------------------------------------------ Pg1
  step('Pg1: an Elder Reedjaw measured once, before the card; Memories banked at once');
  await watchBus();
  const pre = await g(() => window.__gw.state.meta.memories);
  const fish = await g(() => { const f = window.__gw.debug.landFish('reedjaw_pike', 2.8); return { uid: f.uid, value: f.value, cls: f.sizeClass, name: f.name, len: f.length, kg: f.weight }; });
  await frames(4);
  const after = await g(() => { const c = window.__gw; const m = c.state.meta; const e = m.journal.reedjaw_pike || {}; return { p1: window.__p1, mem: m.memories, e, log: m.elderLog || [], inCreel: c.state.run.creel.some((f) => f.speciesId === 'reedjaw_pike'), modal: c.debug.ui?.()?.openModal ?? null }; });
  check(Math.abs(fish.value - 127) <= 1 && fish.cls === 'elder' && typeof fish.name === 'string', 'an Elder Reedjaw at z 2.8: 127 ± 1 Shells, named', fish);
  check(after.p1.measured === 1 && after.p1.order.indexOf('fish:measured') < after.p1.order.indexOf('fish:landed'), 'fish:measured fired once, before fish:landed', after.p1.order);
  check(after.e.seals?.elder === true && after.e.pbLength === fish.len && after.log.length === 1 && after.log[0].name === fish.name, 'class seal, PB and the Elder Log line written at the stamp', { e: after.e, log: after.log });
  check(after.p1.order.includes('mem:classFirst:12') && after.p1.order.includes('mem:oldLedger:5') && after.p1.order.includes('mem:journal:3'), 'Elder class first (12), Old Ledger (5), new species (3) bank at once', after.p1.order);
  check(after.mem > pre, 'meta.memories rose before the run ends', { pre, mem: after.mem });
  check(after.inCreel, 'the Fish is in the creel');
  check(after.modal === 'catch', 'the catch card is open', after.modal);
  const saved = await g(() => { const s = JSON.parse(localStorage.getItem('gloomwater.save.v1')); return { seal: s.meta.journal?.reedjaw_pike?.seals?.elder, log: (s.meta.elderLog || []).length, mem: s.meta.memories }; });
  check(saved.seal === true && saved.log === 1, 'saved on the landing (reload keeps the record)', saved);
  await shot('p1prog-02-elder-card');
  const memR = await g(() => window.__gw.state.meta.memories);
  const rel = await g(() => { const b = [...document.querySelectorAll('#ui button')].find((x) => x.dataset.action === 'release' && !x.disabled); if (!b) return false; b.click(); return true; });
  await frames(4);
  const memR2 = await g(() => ({ mem: window.__gw.state.meta.memories, rel: window.__gw.state.meta.journal.reedjaw_pike.released }));
  check(rel && memR2.mem - memR === 8 && memR2.rel?.elder === true, 'releasing the first Elder Reedjaw banks +8 Memories at once', { rel, memR, memR2 });
  await g(() => window.__gw.ui.closeAll?.());

  step('Pg1: a real catch from the fishing module (compat: weight → z), measured once');
  await watchBus();
  const ic = await g(() => window.__gw.debug.instantCatch?.('mossback_perch'));
  await frames(6);
  const real = await g(() => { const c = window.__gw; const f = c.state.run.creel.find((x) => x.speciesId === 'mossback_perch') || c.progression.getPendingCatch?.().find((x) => x.speciesId === 'mossback_perch'); return { p1: window.__p1, f: f && { z: f.z, cls: f.sizeClass, len: f.length, kg: f.weight, value: f.value } }; });
  check(ic !== false && real.p1.measured === 1 && real.f && Number.isFinite(real.f.z) && typeof real.f.cls === 'string', 'a fishing:caught without a Fish is measured once with a size score', real);
  await g(() => window.__gw.ui.closeAll?.());

  step('Pg1: a reload keeps the PB, the seal and the Elder Log');
  await g(() => window.__gw.game.save());
  await reload();
  const kept = await g(() => { const m = window.__gw.state.meta; return { pb: m.journal.reedjaw_pike?.pbLength, seal: m.journal.reedjaw_pike?.seals?.elder, log: (m.elderLog || []).length, rel: m.journal.reedjaw_pike?.released?.elder }; });
  check(kept.pb === fish.len && kept.seal && kept.log === 1 && kept.rel, 'records survive the reload', kept);

  step('the death screen: no species row, nights at the tally values');
  await g(() => window.__gw.game.continueRun());
  await frames(5);
  await g(() => window.__gw.debug.god?.(true));
  for (let n = 0; n < 2; n++) {
    await g(() => window.__gw.debug.setPhase('gloomtide'));
    await frames(3);
    await g(() => window.__gw.debug.setPhase('dawn'));
    await frames(3);
    await g(() => window.__gw.debug.setPhase('calm'));
    await frames(3);
  }
  const nl = await g(() => window.__gw.debug.v3());
  const exp = nl.nightLog.reduce((a, x) => a + (x.kind === 'swarm' ? 4 : x.kind === 'gloom' ? 3 + x.zi : 1), 0);
  await g(() => window.__gw.game.endRun('snuffed'));
  await frames(5);
  const sum = await g(() => { const c = window.__gw; const s = c.progression.summarizeRun('snuffed'); const L = c.data.TEXT.memoryLabels; return { title: s.title, species: s.breakdown.some((x) => x.label === L.species), nights: s.breakdown.find((x) => x.label === L.nights)?.value ?? 0, newSpecies: s.newSpecies, mode: s.nightMode }; });
  check(nl.nightLog.length === 2, 'two nights logged', nl.nightLog);
  check(!sum.species && sum.newSpecies > 0, 'the death screen pays no species row (new species were paid at the stamp)', sum);
  check(sum.nights === exp, `the nights row is the per-night tally (${exp})`, { sum, log: nl.nightLog });
  check(sum.title === 'Snuffed' && sum.mode === 'lantern', 'titled Snuffed; Lantern run', sum);
  await shot('p1prog-03-snuffed');
  await errs();
  return { failures };
}
