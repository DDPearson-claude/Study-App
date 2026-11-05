// P1 combat acceptance scenario (DESIGN §25.14.2 C1 / C3 / C4 / C6, CONTRACT §13.7 combat), in a browser through playtest
// with the v3 switch on. Needs the P1 build (main's ?v3 switch and startNewRun({nightMode}), progression's createRun
// nightMode / outing, survival's Scorched) — on a branch without them, merge the P1 branches first:
//
//   node build.mjs --dev --out=tools/out/p1-combat-v3.html
//   node tools/playtest.mjs --html=tools/out/p1-combat-v3.html --script=tools/tests/p1-combat.scenario.mjs --width=960 --height=540
//
// Checks, with real modules (seeded where the scenario rolls nothing itself; the swarm's rolls are the game's):
//   C1  run 1 (the First Outing) is still every night: a night 2 spawns nothing; Lantern night 1 spawns nothing, night 2 spawns
//       only between night k 0.05 and 0.50 at difficultyFor() × the Lantern multipliers and withdraws at 0.50; night 4 raises the
//       Warden at hp × 0.75 and it withdraws with the window; fodder contact drains oil and costs no Embers.
//   C6  a scripted hand slam while reeling moves neither the Wick nor the raft and snaps nothing (Lantern), but costs Embers
//       (telegraphed); in Gloomtide the same slam knocks and snaps (today); Embers to 0 in Lantern → Scorched: the swarm
//       withdraws, oil −30, a forced lamp-watch, nothing spawns again that night, no Cinders, Embers mend at dawn, the run goes on.
//   C3  a level-up with a line out or while moving opens no modal and is banked; the next measuring card offers it; the dawn
//       bell offers one; Still offers only Angler-pool Boons.
//   C4  a Grasping Dark snag on the hooked Lantern-Swallower: the hand rises on the line, then the spike, nothing spawns.
export default async function (api) {
  const { page, frames, evalGame: g, log, shot } = api;
  const failures = [];
  let stepName = 'boot';
  const t0 = Date.now();
  const step = (s) => { stepName = s; log(`---- ${s}  (+${((Date.now() - t0) / 1000).toFixed(0)} s)`); };
  const check = (cond, msg, extra) => {
    if (cond) { log('ok  ', msg); return true; }
    failures.push(`[${stepName}] ${msg}${extra !== undefined ? ` :: ${JSON.stringify(extra)}` : ''}`);
    log('FAIL', msg, extra !== undefined ? JSON.stringify(extra) : '');
    return false;
  };
  const waitFor = async (fn, arg, maxFrames = 80) => {
    for (let i = 0; i < maxFrames; i++) { if (await g(fn, arg)) return true; await frames(1); }
    return false;
  };
  const safeShot = async (name) => { for (let i = 0; i < 3; i++) { try { await shot(name); return; } catch (e) { log('shot retry', name, String(e?.message || e).slice(0, 80)); } } };
  const base = page.url().split('?')[0];
  const load = async (query) => {
    await page.goto(base + query, { waitUntil: 'commit', timeout: 240000 });
    await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 240000 });
    await frames(2);
    await g(() => { try { window.__gw.render.setQuality?.('low'); window.__gw.debug.renderScale?.(0.35); } catch { /* optional */ } });
  };
  const recorder = () => g(() => {
    const c = window.__gw;
    window.__cr = [];
    const pick = (e, p) => (e === 'enemy:spawn' ? { id: p?.enemy?.enemyId } : e === 'levelup' ? { banked: !!p?.banked, n: p?.options?.length ?? 0 }
      : e === 'fishing:escaped' ? { reason: p?.reason } : e === 'player:died' ? { cause: p?.cause } : p && typeof p === 'object' ? JSON.parse(JSON.stringify(p, (k, v) => (v && typeof v === 'object' && v.isObject3D ? undefined : v))) : p);
    for (const e of ['enemy:spawn', 'swarm:window', 'levelup', 'levelup:banked', 'legend:snag', 'fishing:snag', 'player:scorched', 'lampwatch:start', 'fishing:escaped', 'player:died', 'enemy:steal']) {
      c.bus.on(e, (p) => { try { window.__cr.push({ e, k: +(c.survival.getPhaseInfo().k || 0).toFixed(4), phase: c.state.run?.phase, day: c.state.run?.day, p: pick(e, p) }); } catch { /* ignore */ } });
    }
  });
  const rec = (e) => g((e) => (window.__cr || []).filter((x) => !e || x.e === e), e);
  const mark = () => g(() => (window.__cr || []).length);
  const since = (n, e) => g(([n, e]) => (window.__cr || []).slice(n).filter((x) => !e || x.e === e), [n, e]);
  // jump the night clock to night k (survival owns run.phaseTime)
  const atK = (k) => g((k) => { const c = window.__gw, r = c.state.run, d = c.survival.getPhaseInfo().duration || 90; r.phaseTime = k * d; return c.survival.getPhaseInfo().k; }, k);
  const night = async (n) => { await pickOpen(); return g((n) => { const c = window.__gw; c.ui.closeAll?.(); c.debug.setDay(n); c.debug.setOil(100); c.debug.setPhase('dusk'); c.debug.setPhase('gloomtide'); return c.survival.getPhaseInfo(); }, n); };
  const runUntilK = async (k, maxFrames = 600, each) => {
    for (let i = 0; i < maxFrames; i++) {
      const s = await g(() => { const c = window.__gw; if ((c.state.run?.oil ?? 100) < 40) c.debug.setOil(100); return { k: c.survival.getPhaseInfo().k, phase: c.state.run?.phase, flow: c.flow }; });
      if (s.phase !== 'gloomtide' || s.k >= k || s.flow !== 'playing') return s;
      if (each) await each(s);
      if (i % 4 === 3) await pickOpen();
      await frames(1);
    }
    return null;
  };
  // a swarm level-up opens its pick at once when the Wick is still with no line out (a modal pauses the game): take it
  const pickOpen = async () => {
    for (let i = 0; i < 12; i++) {
      const m = await g(() => window.__gw.debug.ui?.()?.openModal ?? null);
      if (m !== 'levelup') return i;
      await g(() => { const c = window.__gw, o = c.combat.pendingOptions; if (o?.length) c.combat.chooseBoon(o[0].boonId); });
      await frames(2);
    }
    return 12;
  };
  // clear the water without rewards (no Cinders, no XP): the withdrawal combat uses for a Scorched night
  const quiet = () => g(() => { const c = window.__gw; c.combat.killAll('scorched'); });

  // ------------------------------------------------------------------ boot with v3 on, fresh save
  step('boot (?v3=1, phase 1)');
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 240000 });
  await g(() => window.__gw.game.wipeAll());
  await load('?v3=1&v3phase=1');
  let s = await g(() => ({ en: window.__gw.data.V3_ENABLED, ph: window.__gw.data.V3_PHASE, runs: window.__gw.state.meta.runs, nm: !!window.__gw.data.BALANCE.nightModes }));
  check(s.en === true && s.ph === 1 && s.nm, 'v3 on at phase 1 with BALANCE.nightModes', s);
  check(s.runs === 0, 'a fresh save', s.runs);
  await recorder();

  // ------------------------------------------------------------------ C1: the First Outing is all still
  step('C1 the First Outing');
  s = await g(() => { const c = window.__gw; c.game.startNewRun({ nightMode: 'lantern' }); c.ui.closeAll?.(); c.debug.timeScale?.(4); const r = c.state.run; return { outing: r.outing, mode: r.nightMode, combat: c.combat.nightMode }; });
  check(s.outing === 'first' && s.combat === 'still', 'run 1 is the First Outing and combat plays it still', s);
  let m0 = await mark();
  await night(2);
  await runUntilK(0.6, 400);
  await safeShot('v3-still-night');
  check((await since(m0, 'enemy:spawn')).length === 0, 'night 2 of the First Outing spawns nothing');
  check((await since(m0, 'swarm:window')).length === 0, 'no swarm window');

  // ------------------------------------------------------------------ C1: Lantern
  step('C1 Lantern, run 2');
  s = await g(() => {
    const c = window.__gw;
    c.ui.closeAll?.(); c.game.endRun('debug'); c.ui.closeAll?.();
    c.game.startNewRun({ nightMode: 'lantern' }); c.ui.closeAll?.(); c.debug.timeScale?.(4);
    const r = c.state.run;
    return { outing: r.outing, mode: r.nightMode, combat: c.combat.nightMode, runs: c.state.meta.runs, flow: c.flow };
  });
  check(s.outing === 'normal' && s.mode === 'lantern' && s.combat === 'lantern', 'run 2 plays Lantern', s);
  m0 = await mark();
  await night(1);
  await runUntilK(0.6, 400);
  check((await since(m0, 'enemy:spawn')).length === 0, 'Lantern night 1 (odd) spawns nothing');

  step('C1 Lantern night 2: k 0.05 → 0.50 at the scaled rates');
  m0 = await mark();
  await night(2);
  let diffCheck = null, fodder = null, shotTaken = false;
  await runUntilK(0.56, 900, async (st) => {
    if (!diffCheck && st.k > 0.12) {
      diffCheck = await g(() => {
        const c = window.__gw, v = c.debug.combatV3(), d = c.data;
        // the director's difficulty is refreshed every few frames: compare it with difficultyFor at its own window k
        const raw = d.difficultyFor(v.diff.day ?? v.day, 0, v.diff.k, { nightInZone: v.day });
        const m = d.BALANCE.nightModes.lantern.mult;
        return { v: v.diff, want: { spawnRate: raw.spawnRate * m.spawnRate, hpMult: raw.hpMult * m.hpMult, maxAlive: Math.max(1, Math.round(raw.maxAlive * m.maxAlive)), eliteEvery: raw.heat < 3 ? 0 : raw.eliteEvery * 2 }, open: v.open };
      });
    }
    if (!shotTaken && st.k > 0.2) { shotTaken = true; await safeShot('v3-lantern-swarm'); }
    if (!fodder && st.k > 0.28) {
      // gloomlings put on the raft: their contact must drain oil (survival.addOil < 0 from combat) and take no Embers
      fodder = await g(() => {
        const c = window.__gw, sv = c.survival;
        window.__oilHits = []; window.__dmg = [];
        if (!sv.__wrapped) {
          const ao = sv.addOil.bind(sv), dm = sv.damage.bind(sv);
          sv.addOil = (n, ...r) => { if (n < 0 && window.__oilHits) window.__oilHits.push(n); return ao(n, ...r); };
          sv.damage = (n, src, ...r) => { if (window.__dmg) window.__dmg.push([n, src]); return dm(n, src, ...r); };
          sv.__wrapped = true;
        }
        const hp = c.state.run.hp;
        const made = c.debug.spawn('gloomling', 3, 9) || [];
        for (const e of made) { e.position.set(c.player.position.x + 0.4, 0, c.player.position.z + 0.3); e.spawnT = 0; e.state = 'move'; }
        return { hp, n: made.length };
      });
      for (let i = 0; i < 12; i++) await frames(1);
      const after = await g(() => ({ hp: window.__gw.state.run.hp, oilHits: window.__oilHits.length, oilLost: +window.__oilHits.reduce((a, b) => a + b, 0).toFixed(2), dmg: window.__dmg.filter((x) => /gloomling/.test(String(x[1]))) }));
      await g(() => { window.__oilHits = null; window.__dmg = null; });
      fodder = { before: fodder, after };
    }
  });
  const sp2 = await since(m0, 'enemy:spawn');
  const ks = sp2.map((x) => x.k);
  check(ks.length > 0, `Lantern night 2 spawns (${ks.length})`);
  check(ks.every((k) => k >= 0.05 - 0.01 && k <= 0.5 + 0.01), 'every spawn lies inside night k 0.05 → 0.50', ks.length ? [Math.min(...ks), Math.max(...ks)] : null);
  const win2 = await since(m0, 'swarm:window');
  check(win2.length >= 2 && win2[0].p.state === 'open' && Math.abs(win2[0].k - 0.05) < 0.03 && win2.some((w) => w.p.state === 'close' && Math.abs(w.k - 0.5) < 0.03), 'swarm:window opens at k 0.05 and closes at 0.50', win2.map((w) => [w.p.state, w.k]));
  if (diffCheck) {
    check(diffCheck.open, 'the window was open at k 0.12');
    check(Math.abs(diffCheck.v.spawnRate - diffCheck.want.spawnRate) < 0.02, 'spawnRate = difficultyFor × 0.55', diffCheck);
    check(Math.abs(diffCheck.v.hpMult - diffCheck.want.hpMult) < 0.01 && diffCheck.v.maxAlive === diffCheck.want.maxAlive && diffCheck.v.eliteEvery === diffCheck.want.eliteEvery, 'hpMult × 0.8, maxAlive × 0.6, elites by the Heat-3 rule', diffCheck);
  } else check(false, 'the window opened');
  if (fodder) check(fodder.before.n > 0 && fodder.after.hp === fodder.before.hp && fodder.after.oilHits > 0 && fodder.after.dmg.length === 0, 'fodder contact drains oil and costs no Embers', fodder);
  s = await g(() => ({ alive: window.__gw.combat.enemies.filter((e) => e.alive).length, active: window.__gw.combat.swarmActive, k: window.__gw.survival.getPhaseInfo().k }));
  check(s.alive === 0 && !s.active, 'after k 0.50 the swarm has withdrawn (the quiet tail)', s);

  step('C1 Lantern night 4: the Warden at hp × 0.75, gone with the window');
  await night(4);
  await atK(0.04);
  let boss = null;
  await runUntilK(0.3, 500, async () => {
    if (!boss) boss = await g(() => { const c = window.__gw, b = c.combat.getBoss?.(); if (!b) return null; const raw = c.data.difficultyFor(c.state.run.day, 0, 0.5, { nightInZone: c.state.run.day }); return { id: b.enemyId, hp: b.maxHp, want: c.data.ENEMY_BY_ID[b.enemyId].hp * (raw.bossHpMult ?? raw.hpMult) * c.data.BALANCE.nightModes.lantern.wardens.hpMult }; });
  });
  check(!!boss, 'night 4 raises the lake\'s Warden', boss);
  if (boss) check(Math.abs(boss.hp - boss.want) < 1, 'its hp = hp × bossHpMult × 0.75', boss);
  await atK(0.49);
  await runUntilK(0.56, 200);
  s = await g(() => { const b = window.__gw.combat.getBoss?.(); return { boss: b ? b.state : null, alive: window.__gw.combat.enemies.filter((e) => e.alive && !(e.boss && e.state === 'withdraw')).length }; });
  check(s.boss === null || s.boss === 'withdraw', 'the Warden withdraws when the window closes', s);

  // ------------------------------------------------------------------ C6: the hard rule
  step('C6 a hand slam while reeling (Lantern)');
  await night(2); await atK(0.12); await frames(3);
  const slam = async () => g(async () => {
    const c = window.__gw;
    c.debug.setHp(5);
    c.combat.killAll('scorched');
    c.debug.fishHook('dusk_minnow');
    const p0 = { x: c.player.position.x, z: c.player.position.z }, hp0 = c.state.run.hp, st0 = c.fishing.state;
    const hand = c.debug.spawn('drowned_hand', 1)?.[0] || c.combat.enemies.find((e) => e.enemyId === 'drowned_hand');
    if (hand) { hand.state = 'slam'; hand.stateT = 0.3; hand.n = 0; hand.position.set(c.player.position.x, 0, c.player.position.z); }
    return { p0, hp0, st0, hand: !!hand };
  });
  await pickOpen();
  let sl = await slam();
  m0 = await mark();
  for (let i = 0; i < 6; i++) await frames(1);
  // the lingering hand would push the raft out: hold it at the raft for a few frames
  await g(() => { const c = window.__gw; for (const e of c.combat.enemies) if (e.enemyId === 'drowned_hand') { e.state = 'linger'; e.stateT = 0; e.position.set(c.player.position.x + 0.2, 0, c.player.position.z); } });
  for (let i = 0; i < 6; i++) await frames(1);
  let after = await g(() => { const c = window.__gw; return { x: c.player.position.x, z: c.player.position.z, hp: c.state.run.hp, st: c.fishing.state }; });
  const esc = await since(m0, 'fishing:escaped');
  check(sl.hand && sl.st0 === 'reeling', 'a fish on the line and a hand slamming on the raft', sl);
  check(Math.hypot(after.x - sl.p0.x, after.z - sl.p0.z) < 0.05, 'Lantern: the slam and the lingering hand moved neither the Wick nor the raft', { p0: sl.p0, after });
  check(!esc.some((x) => x.p?.reason === 'snap') && ['reeling', 'landing'].includes(after.st), 'Lantern: the line did not snap', { st: after.st, esc });
  check(after.hp < sl.hp0, 'Lantern: the telegraphed slam cost Embers', { hp0: sl.hp0, hp: after.hp });
  await g(() => { const c = window.__gw; c.combat.killAll('scorched'); c.fishing.cancel?.('debug'); });
  await pickOpen();

  step('C6 the same slam in Gloomtide (today: knock and snap)');
  await g(() => window.__gw.debug.mode('gloomtide'));
  await frames(2);
  await pickOpen();
  await pickOpen();
  sl = await slam();
  m0 = await mark();
  for (let i = 0; i < 6; i++) await frames(1);
  after = await g(() => { const c = window.__gw; return { x: c.player.position.x, z: c.player.position.z, st: c.fishing.state }; });
  const esc2 = await since(m0, 'fishing:escaped');
  check(Math.hypot(after.x - sl.p0.x, after.z - sl.p0.z) > 0.3 || esc2.length > 0, 'Gloomtide: the slam knocks the raft', { p0: sl.p0, after });
  check(esc2.some((x) => x.p?.reason === 'snap') || !['reeling', 'landing'].includes(after.st), 'Gloomtide: the slam snaps a normal line', { st: after.st, esc2 });
  await g(() => { const c = window.__gw; c.combat.killAll('scorched'); c.fishing.cancel?.('debug'); c.debug.mode('lantern'); });
  await pickOpen();

  step('C6 Scorched (Lantern, Embers to 0)');
  await night(2); await atK(0.15); await frames(4); await pickOpen();
  s = await g(() => {
    const c = window.__gw;
    c.combat.killAll('scorched'); c.fishing.cancel?.('debug');
    c.debug.setOil(100);
    c.debug.spawn('gloomling', 4, 10);
    c.debug.setHp(1);
    const hand = c.debug.spawn('drowned_hand', 1)?.[0];
    if (hand) { hand.state = 'slam'; hand.stateT = 0.3; hand.n = 0; hand.position.set(c.player.position.x, 0, c.player.position.z); }
    return { oil: c.state.run.oil, alive: c.combat.enemies.filter((e) => e.alive).length };
  });
  m0 = await mark();
  await waitFor(() => !!window.__gw.state.run?.scorched, null, 30);
  for (let i = 0; i < 5; i++) await frames(1);
  const sc = await g(() => { const c = window.__gw, r = c.state.run; return { scorched: r.scorched, lw: r.lampWatch, oil: r.oil, hp: r.hp, flow: c.flow, alive: c.combat.enemies.filter((e) => e.alive && !(e.boss && e.state === 'withdraw')).length, cinders: c.debug.combat().cinders }; });
  check(!!sc.scorched && sc.flow === 'playing', 'Embers at 0 in Lantern: Scorched, and the run goes on', sc);
  check(sc.alive === 0, 'the swarm withdrew', sc);
  check(s.oil - sc.oil >= 30, 'the lantern lost 30 oil', { before: s.oil, after: sc.oil });
  check(!!sc.lw?.forced, 'a forced lamp-watch holds the Wick', sc.lw);
  const closeSc = (await since(m0, 'swarm:window')).find((w) => w.p.state === 'close');
  check(closeSc?.p?.reason === 'scorched', 'swarm:window close (scorched)', closeSc);
  await safeShot('v3-scorched');
  const m1 = await mark();
  await runUntilK(0.48, 300);
  check((await since(m1, 'enemy:spawn')).length === 0, 'nothing spawns again inside the window that night');
  check((await g(() => window.__gw.debug.combat().cinders)) === 0, 'no Cinders on the water');
  await g(() => window.__gw.debug.setPhase('dawn'));
  await frames(4);
  s = await g(() => ({ scorched: window.__gw.state.run.scorched, hp: window.__gw.state.run.hp, flow: window.__gw.flow }));
  check(!s.scorched && s.hp > 0 && s.flow === 'playing', 'at dawn the Embers mend and the Scorched night ends', s);

  // ------------------------------------------------------------------ C3: banked level-ups
  step('C3 banked level-ups');
  await pickOpen();
  await g(() => { const c = window.__gw; c.ui.closeAll?.(); c.debug.setDay(3); c.debug.setPhase('calm'); c.debug.timeScale?.(1); c.debug.setOil(100); });
  await frames(3);
  s = await g(() => { const c = window.__gw; c.debug.forceBite({ speciesId: 'dusk_minnow' }); return c.fishing.state; });
  m0 = await mark();
  await g(() => window.__gw.combat.addXp(80, { modeApplied: true }));
  for (let i = 0; i < 12; i++) await frames(1);
  let lv = await g(() => ({ modal: window.__gw.debug.ui?.()?.openModal ?? null, bank: window.__gw.combat.bankedLevels, po: !!window.__gw.combat.pendingOptions, st: window.__gw.fishing.state }));
  check(s !== 'idle' && lv.modal !== 'levelup' && !lv.po, 'a level-up with a line out opens no modal', { st: s, lv });
  check(lv.bank >= 1 && (await since(m0, 'levelup:banked')).length > 0, 'it is banked (levelup:banked)', lv);
  // moving: sail with W held, a level-up while moving
  await g(() => window.__gw.fishing.cancel?.('debug'));
  await page.keyboard.down('KeyW');
  for (let i = 0; i < 10; i++) await frames(1);
  await g(() => window.__gw.combat.addXp(120, { modeApplied: true }));
  for (let i = 0; i < 8; i++) await frames(1);
  const mv = await g(() => ({ modal: window.__gw.debug.ui?.()?.openModal ?? null, bank: window.__gw.combat.bankedLevels, v: Math.hypot(window.__gw.player.velocity?.x || 0, window.__gw.player.velocity?.z || 0) }));
  await page.keyboard.up('KeyW');
  check(mv.modal !== 'levelup' && mv.bank > lv.bank, 'a level-up while sailing opens no modal and is banked', mv);
  for (let i = 0; i < 30; i++) await frames(1);   // drift to a stop
  // the next measuring card offers the banked pick
  const bank0 = await g(() => window.__gw.combat.bankedLevels);
  await g(() => window.__gw.debug.instantCatch('dusk_minnow'));
  const card = await waitFor(() => window.__gw.debug.ui?.()?.openModal === 'catch', null, 120);
  check(card, 'the catch card opens');
  await g(() => { const b = [...document.querySelectorAll('#ui button')].find((x) => !x.disabled && x.offsetParent !== null && (x.dataset.action === 'keep' || /^Keep/.test(x.textContent.trim()))); b?.click(); });
  const luOpen = await waitFor(() => window.__gw.debug.ui?.()?.openModal === 'levelup', null, 120);
  const lastLu = (await rec('levelup')).pop();
  check(luOpen && lastLu?.p?.banked === true, 'after the card the banked pick opens', { luOpen, lastLu });
  if (luOpen) {
    await page.keyboard.press('Digit1');
    await waitFor(() => window.__gw.debug.ui?.()?.openModal !== 'levelup', null, 60);
    for (let i = 0; i < 4; i++) await frames(1);
  }
  const bank1 = await g(() => window.__gw.combat.bankedLevels);
  check(bank1 < bank0 + 1, 'choosing it spends a banked level', { bank0, bank1 });
  // clear what is left the same way, then the dawn bell
  for (let i = 0; i < 8; i++) {
    const m = await g(() => window.__gw.debug.ui?.()?.openModal ?? null);
    if (m !== 'levelup') break;
    await page.keyboard.press('Digit1'); await frames(4);
  }
  await g(() => { const c = window.__gw; c.debug.forceBite({ speciesId: 'dusk_minnow' }); c.combat.addXp(60, { modeApplied: true }); });
  for (let i = 0; i < 4; i++) await frames(1);
  await g(() => { const c = window.__gw; c.fishing.cancel?.('debug'); c.debug.setPhase('dusk'); c.debug.setPhase('gloomtide'); c.debug.setPhase('dawn'); });
  const dawnLu = await waitFor(() => window.__gw.debug.ui?.()?.openModal === 'levelup', null, 120);
  check(dawnLu && (await rec('levelup')).pop()?.p?.banked === true, 'the dawn bell offers a banked pick');
  for (let i = 0; i < 8; i++) {
    const m = await g(() => window.__gw.debug.ui?.()?.openModal ?? null);
    if (m !== 'levelup') break;
    await page.keyboard.press('Digit1'); await frames(4);
  }

  step('C3 Still offers only Angler-pool Boons');
  s = await g(() => {
    const c = window.__gw, d = c.data;
    c.ui.closeAll?.();
    c.debug.mode('still');
    let all = true, n = 0;
    for (let i = 0; i < 25; i++) {
      c.state.run.levelBank = 1;
      const o = c.combat.offerBanked() || [];
      for (const x of o) { n++; const b = d.BOON_BY_ID[x.boonId]; if (!x.fallback && !(b?.tags || []).includes('angler')) all = false; }
      c.combat.skip();
    }
    c.state.run.levelBank = 0;
    c.ui.closeAll?.();
    c.debug.mode('lantern');
    return { all, n };
  });
  check(s.all && s.n > 0, 'every Still offer is an Angler-pool Boon', s);

  // ------------------------------------------------------------------ C4: Grasping Dark as snags
  step('C4 a Grasping Dark snag on the Lantern-Swallower (Lantern)');
  await night(2); await atK(0.15); await frames(3); await pickOpen();
  s = await g(() => {
    const c = window.__gw;
    c.ui.closeAll?.(); c.combat.killAll('scorched'); c.debug.setHp(5); c.debug.timeScale?.(1);
    c.debug.fishHook('lantern_swallower');
    return { st: c.fishing.state, sp: c.fishing.view?.speciesId };
  });
  check(s.st === 'reeling' && s.sp === 'lantern_swallower', 'the Lantern-Swallower is on the line', s);
  m0 = await mark();
  const r1 = await g(() => window.__gw.debug.snag());
  check(r1?.snag === true, 'Grasping Dark → a snag, not a hand', r1);
  for (let i = 0; i < 6; i++) await frames(1);
  await safeShot('v3-snag-telegraph');
  await waitFor(() => (window.__cr || []).some((x) => x.e === 'legend:snag' && x.p?.phase === 'hit'), null, 120);
  const sn = await since(m0, 'legend:snag');
  const fsn = await since(m0, 'fishing:snag');
  check(sn.length >= 2 && sn[0].p.phase === 'warn' && sn[1].p.phase === 'hit' && sn[1].p.spiked === true, 'the snag warns, then spikes the line', sn.map((x) => x.p));
  check(fsn.some((x) => Math.abs((x.p?.spike ?? 0) - 0.2) < 1e-6), 'fishing took a +0.2 spike', fsn.map((x) => x.p));
  check((await since(m0, 'enemy:spawn')).length === 0, 'nothing spawned (no hand, no swarm while the legend is on)');
  await g(() => { const c = window.__gw; c.fishing.cancel?.('debug'); });

  // ------------------------------------------------------------------ the end
  step('errors');
  const errs = await g(() => window.__gw.errors.slice());
  check(errs.length === 0, 'ctx.errors stays empty', errs);
  return { failures };
}
