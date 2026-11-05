// End-to-end autoplay regression for the whole loop. Exits nonzero (via playtest) on any failed
// invariant, page error, console error or ctx.errors entry.
//
//   node build.mjs --dev --out=tools/out/run.html
//   node tools/playtest.mjs --html=tools/out/run.html --script=tools/scenario-run.mjs --width=960 --height=540
//   (or --html=index.html for the minified build; add --mobile for the touch layout)
//
// Flow: title → New Descent (UI) → cast with the mouse, hook, land (catch card pauses the game) →
// keep → Old Murk: trade by E, sell → dusk/Gloomtide: swarm, level-ups through the picker (pauses
// the game) → dawn clears the swarm → descend to Sporewood through the debug gate → death →
// summary → Shrine (buy a relic) → second descent (run reset) → reload → Continue (run restored,
// an undecided catch survives the reload) → pause. Keeps to a few screenshots so it runs in a few
// minutes even on slow software GL.
export default async function (api) {
  const { page, wait, frames, evalGame: g, log, shot, width, height } = api;
  const failures = [];
  let stepName = 'boot';
  const t0 = Date.now();
  const step = (s) => { stepName = s; log(`---- ${s}  (+${((Date.now() - t0) / 1000).toFixed(0)} s)`); };
  const check = (cond, msg, extra) => {
    if (cond) return true;
    failures.push(`[${stepName}] ${msg}${extra !== undefined ? ` :: ${JSON.stringify(extra)}` : ''}`);
    log('FAIL', msg, extra !== undefined ? JSON.stringify(extra) : '');
    return false;
  };
  const S = () => g(() => {
    const c = window.__gw, r = c.state.run;
    return {
      flow: c.flow, paused: c.paused, modal: c.debug.ui?.()?.openModal ?? null, blocking: !!c.ui.isBlocking?.(),
      fishing: c.fishing?.state, phase: r?.phase, day: r?.day, zone: r?.zone, hp: r?.hp, level: r?.level,
      creel: r?.creel?.length, shells: r?.shells, runId: r?.id, active: r?.active, errs: c.errors.slice(),
      alive: (c.combat?.enemies || []).filter((e) => e?.alive).length,
    };
  });
  const noErrors = async () => { const e = await g(() => window.__gw.errors.slice()); check(e.length === 0, 'ctx.errors stays empty', e); };
  const clickButton = (label, scope = '#ui') => g(([label, scope]) => {
    const root = document.querySelector(scope) || document;
    const text = (x) => (x.querySelector(':scope > span')?.textContent || x.textContent).replace(/\s+/g, ' ').trim();
    const b = [...root.querySelectorAll('button')].find((x) => !x.disabled && x.offsetParent !== null && (x.dataset.action === label.toLowerCase() || text(x).startsWith(label)));
    if (!b) return false;
    b.click();
    return true;
  }, [label, scope]);
  const waitFor = async (fn, arg, maxFrames = 80) => {
    for (let i = 0; i < maxFrames; i++) {
      if (await g(fn, arg)) return true;
      await frames(1);
    }
    return false;
  };
  /** The game clock must not move while a blocking modal is open (CONTRACT §2 gameDt). */
  const assertPaused = async (what) => {
    const a = await g(() => ({ gameT: window.__gw.time.gameT, pt: window.__gw.state.run?.phaseTime }));
    await frames(5);
    const b = await g(() => ({ gameT: window.__gw.time.gameT, pt: window.__gw.state.run?.phaseTime, dt: window.__gw.time.gameDt }));
    check(a.gameT === b.gameT && a.pt === b.pt && b.dt === 0, `${what} pauses the game clock`, { a, b });
  };
  const pickAllLevelUps = async () => {
    for (let i = 0; i < 10; i++) {
      const m = await g(() => window.__gw.debug.ui().openModal);
      if (m === 'catch') { await clickButton('Keep'); await frames(3); continue; }
      if (m !== 'levelup') break;
      await page.keyboard.press('Digit1');
      await frames(4);
      await waitFor(() => window.__gw.debug.ui().openModal !== 'levelup' || !document.querySelector('.gw-m-levelup.gw-choosing'), null, 20);
    }
  };

  // ------------------------------------------------------------------ title
  step('title');
  let s = await S();
  check(s.flow === 'title', 'boots to the title', s.flow);
  check(s.modal === 'title', 'title screen is open', s.modal);
  check(await g(() => window.__gw.game.hasSavedRun()) === false, 'fresh profile has no saved run');
  // render well below CSS resolution: invariants, not beauty (keeps the run fast on software GL)
  const lean = () => g(() => { window.__gw.render.setQuality?.('low'); window.__gw.debug.renderScale?.(0.35); });
  await lean();
  await g(() => { window.__ev = {}; for (const e of ['run:start', 'run:end', 'zone:change', 'phase:change', 'levelup', 'boon:chosen', 'fish:landed', 'shop:buy', 'enemy:slain', 'xp:gain', 'player:died']) window.__gw.bus.on(e, () => { window.__ev[e] = (window.__ev[e] || 0) + 1; }); });

  // ------------------------------------------------------------------ new descent (UI path)
  step('new-descent');
  check(await clickButton('New Descent', '.gw-m-title'), 'title has a New Descent button');
  await frames(3);
  check(await g(() => window.__gw.debug.ui().openModal) === 'newdescent', 'New Descent opens the character / Waystone picker');
  check(await clickButton('Descend as'), 'picker has a Descend button');
  await waitFor(() => window.__gw.flow === 'playing');
  await frames(4);
  s = await S();
  const run1 = s.runId;
  check(s.flow === 'playing' && !s.blocking, 'descent starts unblocked', s);
  check(s.day === 1 && s.phase === 'calm' && s.zone === 'mossmere', 'day 1, calm, the Mossmere', s);
  check(s.creel === 0 && s.level === 1, 'empty creel, level 1', s);
  const w = await g(() => { const c = window.__gw; return { obs: c.world.getObstacles().length, kinds: [...new Set(c.world.getObstacles().map((o) => o.kind))], zone: c.world.getZone()?.id, spawn: c.player.position.z, runs: c.state.meta.runs, gate: c.world.getGateState?.() }; });
  check(w.zone === 'mossmere' && w.obs >= 16 && w.kinds.includes('island'), 'the Mossmere is built with its islands and pillars', w);
  check(Math.abs(w.spawn - 46) < 3, 'raft spawns at the authored south spawn', w.spawn);
  check(w.runs === 1 && w.gate === 'sealed', 'meta.runs counted, gate sealed', w);
  await g(() => { window.__gw.ui.closeAll(); window.__gw.debug.god(true); });

  // ------------------------------------------------------------------ fish: cast by mouse, hook, land
  step('fish');
  await page.mouse.move(width * 0.5, height * 0.36);
  await page.mouse.down();
  const charged = await waitFor(() => window.__gw.fishing.state === 'charging', null, 30);
  check(charged, 'holding the mouse on the water charges a cast', await g(() => window.__gw.fishing.state));
  await frames(6);
  await page.mouse.up();
  const cast = await waitFor(() => ['casting', 'waiting'].includes(window.__gw.fishing.state), null, 30);
  check(cast, 'releasing casts the line', await g(() => window.__gw.fishing.state));
  await waitFor(() => window.__gw.fishing.state === 'waiting', null, 60);
  await g(() => window.__gw.debug.forceBite());
  await waitFor(() => window.__gw.fishing.state === 'bite', null, 40);
  await page.mouse.click(width * 0.5, height * 0.36);
  const hooked = await waitFor(() => ['reeling', 'landing'].includes(window.__gw.fishing.state), null, 30);
  check(hooked, 'a click during the bite sets the hook', await g(() => window.__gw.fishing.state));
  await g(() => window.__gw.debug.instantCatch());
  const card = await waitFor(() => window.__gw.debug.ui().openModal === 'catch', null, 80);
  check(card, 'landing a fish opens the catch card');
  if (card) {
    await assertPaused('the catch card');
    check(await clickButton('Keep'), 'catch card has Keep');
  }
  await frames(3);
  await pickAllLevelUps();   // the catch's cinders may level the Wick up straight away
  await waitFor(() => !window.__gw.ui.isBlocking(), null, 30);
  s = await S();
  check(s.creel === 1, 'the kept fish is in the creel', s.creel);
  check(!s.blocking, 'back in play after the catch', s.modal);

  // ------------------------------------------------------------------ trade with Old Murk
  step('trade');
  const shellsBefore = s.shells;
  await g(() => { const c = window.__gw; c.debug.summonMerchant(); });
  await frames(4);
  await g(() => { const c = window.__gw; const m = c.actors.merchant.position; c.player.teleport(new c.THREE.Vector3(m.x + 2.5, 0, m.z + 2.5), 0); });
  await waitFor(() => window.__gw.progression.canShop?.() === true, null, 40);
  check(await g(() => window.__gw.player.interactable?.id) === 'merchant', 'beside Murk the Trade prompt appears');
  await page.keyboard.press('KeyE');
  const shop = await waitFor(() => window.__gw.debug.ui().openModal === 'shop', null, 20);
  check(shop, 'E opens the shop');
  if (shop) await assertPaused('the shop');
  const sold = await g(() => { const c = window.__gw; const f = c.state.run.creel[0]; return f ? c.progression.shop.buy('sell:' + f.uid) : { ok: false, msg: 'no fish' }; });
  check(sold?.ok, 'selling the fish succeeds', sold);
  s = await S();
  check(s.shells > shellsBefore && s.creel === 0, 'selling pays Shells and empties the creel', { before: shellsBefore, after: s.shells, creel: s.creel });
  await page.keyboard.press('Escape');
  await waitFor(() => !window.__gw.ui.isBlocking());
  await g(() => { const c = window.__gw; if (c.ui.isBlocking()) c.ui.closeAll(); });

  // ------------------------------------------------------------------ dusk → Gloomtide: swarm + level-ups
  step('night');
  for (let i = 0; i < 3 && (await g(() => window.__gw.state.run.phase)) !== 'gloomtide'; i++) { await g(() => window.__gw.debug.skipPhase()); await frames(2); }
  s = await S();
  check(s.phase === 'gloomtide', 'phases run calm → dusk → gloomtide', s.phase);
  await g(() => { const d = window.__gw.debug; d.spawn('wisp', 6, 12); d.spawn('mite', 4, 14); });
  await frames(6);
  s = await S();
  check(s.alive >= 6, 'the swarm spawns', s.alive);
  const night = await g(() => ({ calls: window.__gw.render.renderer.info.render.calls, light: window.__gw.survival.lightRadius, aura: window.__gw.combat.auraRadius }));
  check(night.calls > 0 && night.calls < 260, 'draw calls inside the CONTRACT §10 budget', night.calls);
  check(Math.abs(night.aura - night.light) < 0.6, 'combat aura matches the visible light radius', night);
  await shot('run-02-night');
  const lvl0 = s.level;
  await g(() => window.__gw.combat.addXp(60));
  const lu = await waitFor(() => window.__gw.debug.ui().openModal === 'levelup', null, 40);
  check(lu, 'XP opens the level-up picker');
  if (lu) {
    await assertPaused('the level-up picker');
    const before = await g(() => Object.values(window.__gw.state.run.boons || {}).reduce((a, b) => a + b, 0));
    await pickAllLevelUps();
    const after = await g(() => Object.values(window.__gw.state.run.boons || {}).reduce((a, b) => a + b, 0));
    check(after > before, 'picking a card grants a boon', { before, after });
  }
  s = await S();
  check(s.level > lvl0 && !s.blocking, 'levelled up and back in play', s);

  // ------------------------------------------------------------------ dawn clears the swarm
  step('dawn');
  await g(() => window.__gw.debug.skipPhase());
  await frames(4);
  s = await S();
  check(s.phase === 'dawn', 'the Gloomtide ends at dawn', s.phase);
  check(s.alive === 0, 'every gloomling dissolves at dawn', s.alive);
  check(await g(() => window.__gw.state.run.stats.nightsSurvived) >= 1, 'night survived is counted');

  // ------------------------------------------------------------------ descend via the debug gate
  step('descend');
  const tr = await g(() => { const c = window.__gw; c.debug.openGate(); c.debug.addShells(1000); return c.progression.travel('sporewood'); });
  check(tr?.ok, 'travel through the open gate works at dawn', tr);
  await frames(6);
  s = await S();
  const w2 = await g(() => { const c = window.__gw; return { world: c.world.getZone()?.id, gate: c.world.getGateState?.(), z: c.player.position.z, obs: c.world.getObstacles().length }; });
  check(s.zone === 'sporewood' && w2.world === 'sporewood', 'the run and the world are in Sporewood', { s, w2 });
  check(w2.gate === 'sealed' && Math.abs(w2.z - 50) < 3 && w2.obs >= 15, 'new lake: sealed gate, south spawn, islands', w2);
  await noErrors();

  // ------------------------------------------------------------------ death → summary → Shrine
  step('death');
  // v3 runs (the oil table in the build): only oil snuffs in Still and Lantern, so the run ends Snuffed (DESIGN §25.3.3);
  // flag off (and The Long Descent) it is today's Embers death
  await g(() => { const c = window.__gw; c.ui.closeAll(); c.debug.god(false); if (c.data.BALANCE.oil?.context && c.state.run?.outing !== 'descent' && c.debug.snuff) c.debug.snuff(); else c.survival.damage(99, 'gloom'); });
  await waitFor(() => window.__gw.flow === 'dead', null, 30);
  await waitFor(() => window.__gw.debug.ui().openModal === 'death', null, 40);
  s = await S();
  const dm = await g(() => ({ deaths: window.__gw.state.meta.deaths, best: window.__gw.state.meta.bestDay, banner: !!document.querySelector('.gw-banner'), btns: [...document.querySelectorAll('.gw-death-btns button')].map((b) => (b.querySelector(':scope > span')?.textContent || b.textContent).trim()) }));
  check(s.flow === 'dead' && s.modal === 'death' && s.active === false, 'death ends the run and shows the summary', s);
  check(dm.deaths === 1 && dm.best >= 1 && !dm.banner, 'meta.deaths counted once; no banner over the summary', dm);
  check(dm.btns.includes('Shrine') && dm.btns.includes('New Descent'), 'summary offers Shrine and New Descent', dm.btns);
  await wait(1800);   // let the summary fade in
  await shot('run-03-death');
  await g(() => window.__gw.debug.addMemories(2000));
  check(await clickButton('Shrine', '.gw-m-death'), 'Shrine button works');
  check(await waitFor(() => window.__gw.debug.ui().openModal === 'shrine', null, 20), 'the Shrine opens over the summary');
  const relic = await g(() => { const c = window.__gw; const r = (c.progression.getRelics() || []).find((x) => x.canBuy !== false && (x.level || 0) < (x.maxLevel || 1)); if (!r) return null; const res = c.progression.buyRelic(r.id); return { id: r.id, res, lvl: c.state.meta.relics[r.id] }; });
  check(relic && relic.res?.ok !== false && relic.lvl >= 1, 'a relic can be bought with Memories', relic);
  await page.keyboard.press('Escape');
  await frames(3);

  // ------------------------------------------------------------------ second descent: a clean run
  step('second-run');
  if (await g(() => window.__gw.debug.ui().openModal) === 'shrine') await g(() => window.__gw.ui.closeAll());
  if (!(await clickButton('New Descent', '.gw-m-death'))) await g(() => window.__gw.ui.openNewDescent());
  await frames(3);
  check(await clickButton('Descend as'), 'second descent from the summary');
  await waitFor(() => window.__gw.flow === 'playing');
  await frames(4);
  s = await S();
  check(s.runId !== run1, 'a new run object', { run1, run2: s.runId });
  check(s.day === 1 && s.phase === 'calm' && s.zone === 'mossmere' && s.level === 1 && s.creel === 0 && s.hp > 0, 'the new run starts clean in the Mossmere', s);
  check(s.alive === 0 && s.fishing === 'idle' && !s.blocking, 'no leftovers from the dead run', s);
  check(await g(() => window.__gw.state.meta.runs) === 2, 'meta.runs = 2');
  check(await g(() => window.__gw.world.getZone()?.id) === 'mossmere', 'world rebuilt the Mossmere');

  const ev = await g(() => window.__ev);
  log('events', JSON.stringify(ev));
  check((ev['run:start'] || 0) >= 2 && (ev['zone:change'] || 0) >= 3 && ev['levelup'] >= 1 && ev['fish:landed'] >= 1 && ev['xp:gain'] >= 1, 'core events emitted (run:start, zone:change, levelup, fish:landed, xp:gain)', ev);
  await noErrors();

  // ------------------------------------------------------------------ save → reload → Continue
  step('reload');
  await g(() => { const c = window.__gw; c.ui.closeAll(); c.debug.giveFish(); c.debug.addShells(77); });
  const saved = await g(() => { const c = window.__gw; c.debug.instantCatch(); return { id: c.state.run.id, creel: c.state.run.creel.length, shells: c.state.run.shells, day: c.state.run.day }; });
  await waitFor(() => window.__gw.debug.ui().openModal === 'catch', null, 60);
  await g(() => window.__gw.game.save());
  await page.reload();
  await waitFor(() => !!window.__gw && window.__gw.flow === 'title', null, 200);
  await lean();
  await frames(2);
  check(await g(() => window.__gw.game.hasSavedRun()), 'the reloaded title offers Continue');
  check(await clickButton('Continue', '.gw-m-title'), 'Continue button');
  await waitFor(() => window.__gw.flow === 'playing');
  await frames(6);
  s = await S();
  check(s.runId === saved.id && s.day === saved.day, 'Continue restores the same run', { s, saved });
  check(s.creel === saved.creel + 1, 'the catch left on the card survives the reload (in the creel)', { creel: s.creel, before: saved.creel });
  check(s.shells >= saved.shells, 'Shells survive the reload', { s: s.shells, saved: saved.shells });

  // ------------------------------------------------------------------ pause
  step('pause');
  await pickAllLevelUps();   // a pick saved with the run reopens on Continue (it blocks the pause menu by design)
  await g(() => { if (window.__gw.ui.isBlocking() && !window.__gw.combat.pendingOptions) window.__gw.ui.closeAll(); });
  await waitFor(() => !window.__gw.ui.isBlocking(), null, 20);
  await frames(2);
  await page.keyboard.press('Escape');
  await frames(3);
  s = await S();
  check(s.paused && s.modal === 'pause', 'Esc pauses with the pause menu', s);
  await assertPaused('the pause menu');
  await page.keyboard.press('Escape');
  await frames(3);
  s = await S();
  check(!s.paused && !s.blocking, 'Esc resumes', s);
  await noErrors();

  log(failures.length ? `${failures.length} FAILED` : 'ALL INVARIANTS HOLD');
  return { failures };
}
