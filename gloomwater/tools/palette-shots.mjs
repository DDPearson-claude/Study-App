// Palette mockup set — a tools/playtest.mjs scenario that renders the standard frames used
// to judge the colour scheme (pair it with tools/hue-report.mjs).
//
//   node build.mjs --dev --out=tools/out/palette.html
//   node tools/playtest.mjs --html=tools/out/palette.html --shots=tools/out/palette-shots \
//        --script=tools/palette-shots.mjs --width=960 --height=540
//   node tools/hue-report.mjs tools/out/palette-shots
//
// Frames (file names are stable, whatever order they are taken in):
//   p01-title                 title camera
//   p02-mossmere-calm  p03-sporewood-calm  p04-glasswater-calm  p05-paleabyss-calm   (sail camera)
//   p06-mossmere-gloomtide  p07-mossmere-flare  p08-glasswater-gloomtide  p09-glasswater-flare
//                             (~40 enemies around the raft, then a lantern flare)
//   p10-fishing-aim  p11-fishing-reel   (Mossmere close-ups: charging the cast, then a hooked fight)
//   p12-murk-moored           Old Murk's barge moored in the Mossmere, raft ~8.5 m south of it
//   p13-sporewood-dusk        Sporewood at ~70% through the dusk
//
// Extra frames (only with PALETTE_EXTRA=1, or when PALETTE_ONLY names them; prefix x):
//   x-<lake>-dusk / x-<lake>-gloomtide / x-<lake>-dawn   every lake at three phases, no swarm
//   x20-swarm-closeup         Mossmere gloomtide swarm, centre crop (gloomling eyes vs motes)
//   x21-catch-uncommon-glass  catch card of an uncommon fish in Glasswater (rarity colour check)
//   x22-catch-uncommon-moss   the same in the Mossmere
//   x23-vortex                Little Maelstrom (vortex weapon) at the Mossmere gloomtide
//
// Env knobs: PALETTE_ONLY=p02,p13 (substring match on frame names) runs a subset;
// PALETTE_HIDE_UI=1 hides the whole DOM UI overlay (judge world colour only);
// PALETTE_TRANSIENTS=1 keeps banners/toasts/first-run tips (hidden by default: they depend on
// timing, cover the world and would make before/after numbers noisy; the HUD always stays);
// PALETTE_SETTLE=6 seconds of simulated mood/grade/camera easing before each frame.
//
// Every frame is wrapped in try/catch: a failure is logged and the rest still render. The
// scenario never throws, so playtest's own summary (page errors / ctx.errors) still prints.
//
// Lake switching: a new run starts in the Mossmere; other lakes are entered by setting
// run.zone (+ zonesUnlocked) and emitting zone:change with prev:null, which every module
// treats as a fresh arrival (instant palette/grade, arena rebuilt, raft respawned, enemies
// cleared). Mood/grade/camera easing runs on real dt (capped at 0.05 s a frame), which at
// 2-8 fps in software GL would take ages, so settle() pumps the non-gameplay modules'
// update() in 0.05 s steps without rendering, then snaps the camera.
//
// Other things this scenario pins so frames are comparable run to run: quality 'high'
// (meta.settings too, so render's settings poll does not undo it), god mode, full oil/food,
// run.xpNext = 1e9 (no boon modal), every first-run tip marked seen, blocking modals closed
// before each frame. The sail camera's yaw is fixed (screen-up = world -Z), so anything you
// want in frame must be north (smaller z) of the raft: teleport the player, not the camera.

const ONLY = (process.env.PALETTE_ONLY || '').split(',').map((s) => s.trim()).filter(Boolean);
const HIDE_UI = /^(1|true|yes)$/i.test(process.env.PALETTE_HIDE_UI || '');
const SETTLE = Number(process.env.PALETTE_SETTLE || 6);
const TRANSIENTS = /^(1|true|yes)$/i.test(process.env.PALETTE_TRANSIENTS || '');
const EXTRA = /^(1|true|yes)$/i.test(process.env.PALETTE_EXTRA || '');

export default async function (api) {
  const { page, shot, wait, evalGame, log, width, height } = api;
  page.setDefaultTimeout(180000);   // software GL screenshots at quality high can be slow
  const ok = [], failed = [], skipped = [];
  const want = (name) => (name.startsWith('x')
    ? (EXTRA && !ONLY.length) || ONLY.some((s) => name.includes(s))
    : !ONLY.length || ONLY.some((s) => name.includes(s)));
  const g = (fn, a) => evalGame(fn, a);

  // ------------------------------------------------------------------ in-page helpers
  async function installHelpers() {
    await g(({ hideUi, transients }) => {
      const c = window.__gw;
      if (!c) throw new Error('window.__gw missing');
      const H = (window.__pal = {});
      H.quality = () => {
        try { c.state.meta.settings = c.state.meta.settings || {}; c.state.meta.settings.quality = 'high'; } catch { /* meta optional */ }
        c.render.setQuality?.('high');
      };
      H.hideUi = () => {
        // first-run tips: mark every tip seen so none queue up
        try { const m = c.state.meta; m.seenTips = m.seenTips || {}; for (const t of c.data.TIPS || []) if (t?.id) m.seenTips[t.id] = true; } catch { /* optional */ }
        const css = [];
        if (hideUi) css.push('#ui { display: none !important; }');
        if (!transients) css.push('.gw-banner, .gw-banner-layer, .gw-toast { display: none !important; }');
        if (!css.length || document.getElementById('pal-hide-ui')) return;
        const s = document.createElement('style');
        s.id = 'pal-hide-ui';
        s.textContent = css.join('\n');
        document.head.appendChild(s);
      };
      // pump non-gameplay modules so mood, grade, water palette, flash and camera settle
      H.settle = (sec = 6) => {
        const names = ['actors', 'models', 'world', 'water', 'render'];
        const steps = Math.max(1, Math.round(sec / 0.05));
        let t = c.time.t;
        for (let i = 0; i < steps; i++) {
          t += 0.05;
          for (const n of names) {
            const m = c[n];
            if (!m || m.isStub || typeof m.update !== 'function') continue;
            try { m.update(0.05, t); } catch (e) { /* keep pumping */ }
          }
        }
        return steps;
      };
      // drop blocking modals (catch cards, boon offers, notices) so the world is visible and time runs
      H.clearUi = () => {
        if (c.flow !== 'playing') return 0;
        for (let i = 0; i < 12 && c.combat?.pendingOptions; i++) { try { c.combat.skip?.(); } catch { break; } }
        try { if (c.ui?.isBlocking?.()) c.ui.closeAll?.(); } catch { /* optional */ }
        return c.ui?.isBlocking?.() ? 1 : 0;
      };
      H.snap = () => { try { c.render.snapCamera?.(); } catch { /* optional */ } };
      H.ensureRun = () => {
        if (!c.state.run || c.flow !== 'playing') { c.game.startNewRun({}); H.clearUi(); }
        try { c.debug.god?.(true); } catch { /* optional */ }
        // no level-ups: the boon modal would cover later frames and pause the game
        if (c.state.run) c.state.run.xpNext = 1e9;
        return c.state.run;
      };
      H.goZone = (zone) => {
        const r = H.ensureRun();
        if (!c.data.ZONE_BY_ID?.[zone] && !(c.data.ZONES || []).some((z) => z.id === zone)) throw new Error('unknown zone ' + zone);
        try { c.debug.unlockZone?.(zone); } catch { /* optional */ }
        if (!(r.zonesUnlocked || []).includes(zone)) r.zonesUnlocked = [...(r.zonesUnlocked || []), zone];
        try { c.combat.killAll?.('debug'); } catch { /* optional */ }
        if (r.zone !== zone) {
          r.zone = zone;
          r.gateOpen = false;
          // prev:null = fresh arrival: instant palette/grade, no black fade, raft to the lake's spawn
          c.bus.emit('zone:change', { zone, prev: null });
        }
        // always start a frame from the lake's spawn (an earlier frame may have teleported the raft)
        try { const sp = c.world.getSpawn?.(); if (sp?.position) c.player.teleport?.(sp.position, sp.yaw || 0); } catch { /* optional */ }
        return r.zone;
      };
      // set a phase and how far through it we are (k 0..1); calm at k~0.35 is the pure lake palette
      H.phase = (name, k = 0.35) => {
        const r = H.ensureRun();
        if (r.phase !== name) c.debug.setPhase?.(name);   // re-entering the same phase would re-fire its banner
        const info = c.survival.getPhaseInfo?.();
        if (info && info.duration > 0) r.phaseTime = info.duration * k;
        try { c.debug.setOil?.(1000); c.debug.setSatiety?.(1000); c.debug.setHp?.(99); } catch { /* optional */ }
        return c.survival.getPhaseInfo?.();
      };
      H.spawnSwarm = (target = 40) => {
        const kinds = ['gloomling', 'gloomling', 'inkmite', 'duskmantle', 'gloomling', 'creelsnatch'];
        let i = 0, guard = 0;
        while ((c.combat.enemies?.length || 0) < target && guard++ < 60) {
          try { c.debug.spawn?.(kinds[i++ % kinds.length], 1, 6 + (i % 4)); } catch { /* keep going */ }
        }
        return c.combat.enemies?.length || 0;
      };
      H.flare = () => {
        try { c.debug.flareReset?.(); c.debug.setOil?.(1000); } catch { /* optional */ }
        return c.combat.flare?.();
      };
      H.info = () => {
        const r = c.state.run;
        return {
          flow: c.flow, zone: r?.zone, phase: c.survival?.getPhaseInfo?.()?.phase, k: +(c.survival?.getPhaseInfo?.()?.k ?? 0).toFixed(2),
          cam: c.render?.getCameraMode?.(), quality: c.render?.quality, fishing: c.fishing?.state,
          enemies: c.combat?.enemies?.length ?? 0, merchant: !!c.actors?.merchant?.present,
        };
      };
    }, { hideUi: HIDE_UI, transients: TRANSIENTS });
  }

  async function frame(name, fn) {
    if (!want(name)) { skipped.push(name); return; }
    const t0 = Date.now();
    try {
      await fn();
      ok.push(name);
      log(`ok   ${name} (${((Date.now() - t0) / 1000).toFixed(1)}s) ${JSON.stringify(await g(() => window.__pal.info()).catch(() => ({})))}`);
    } catch (e) {
      failed.push(`${name}: ${e?.message || e}`);
      log(`FAIL ${name}: ${e?.stack || e}`);
    }
  }
  // settle the look, snap the camera, let a few real frames render, snap again, shoot
  async function settleShot(name, { settle = SETTLE, renderWait = 2500 } = {}) {
    await g((s) => { window.__pal.clearUi(); window.__pal.settle(s); window.__pal.snap(); }, settle);
    await wait(renderWait);
    await g(() => { window.__pal.clearUi(); window.__pal.settle(0.5); window.__pal.snap(); });
    await wait(700);
    await shot(name);
  }

  // ------------------------------------------------------------------ run
  try {
    await installHelpers();
    await g(() => { window.__pal.quality(); window.__pal.hideUi(); });
  } catch (e) {
    failed.push('setup: ' + (e?.message || e));
    log('FAIL setup', e?.stack || e);
    return;
  }

  await frame('p01-title', async () => {
    await wait(1500);
    await settleShot('p01-title', { settle: 4 });
  });

  // ---- Mossmere block
  const calm = (zone, file) => frame(file, async () => {
    await g((z) => { window.__pal.goZone(z); window.__pal.phase('calm', 0.35); window.__pal.quality(); }, zone);
    await wait(2000);   // arena rebuild + shader compiles
    await settleShot(file);
  });
  await calm('mossmere', 'p02-mossmere-calm');

  await frame('p10-fishing-aim', async () => {
    await g(() => { window.__pal.goZone('mossmere'); window.__pal.phase('calm', 0.35); });
    await wait(1200);
    await g((s) => { window.__pal.clearUi(); window.__pal.settle(s); window.__pal.snap(); }, SETTLE);
    await page.mouse.move(width * 0.5, height * 0.5);
    await wait(600);
    await page.mouse.move(width * 0.56, height * 0.47);
    await page.mouse.down();
    await wait(900);   // meter ping-pongs; reticle, range ring and arc are up
    await shot('p10-fishing-aim');
    await page.mouse.up();
  });

  await frame('p11-fishing-reel', async () => {
    const st0 = await g(() => window.__gw.fishing?.state);
    await g(() => window.__pal.clearUi());
    if (st0 === 'idle' || st0 === 'charging' || !st0) {
      await page.mouse.move(width * 0.56, height * 0.47);
      await page.mouse.down(); await wait(500); await page.mouse.up();
    }
    await wait(1500);
    let bit = false;
    for (let i = 0; i < 6 && !bit; i++) {
      bit = await g(() => window.__gw.fishing?.forceBite?.() ?? window.__gw.debug.forceBite?.());
      if (!bit) await wait(700);
    }
    if (!bit) throw new Error('forceBite never reached the bite state (' + (await g(() => window.__gw.fishing?.state)) + ')');
    await page.mouse.down(); await wait(120); await page.mouse.up();   // hook
    await wait(300);
    // slow the fight so the fish cannot slip away while the camera settles
    await g(() => window.__gw.debug.timeScale?.(0.35));
    for (let i = 0; i < 10; i++) {
      const v = await g(() => ({ s: window.__gw.fishing?.state, t: window.__gw.fishing?.view?.tension ?? 0, surge: window.__gw.fishing?.view?.surge }));
      if (v.s !== 'reeling') break;
      if (v.t < 0.55 && !v.surge) { await page.mouse.down(); await wait(250); await page.mouse.up(); } else await wait(250);
    }
    const s = await g(() => window.__gw.fishing?.state);
    if (s !== 'reeling' && s !== 'landing') log(`fishing state at reel shot: ${s}`);
    await g((sec) => { window.__pal.settle(sec); window.__pal.snap(); }, Math.min(3, SETTLE));
    await page.mouse.down();   // hold the line taut for the frame
    await wait(900);
    await shot('p11-fishing-reel');
    await page.mouse.up();
    await g(() => { window.__gw.debug.timeScale?.(1); window.__gw.debug.instantCatch?.(); });
    await wait(400);
    await g(() => { document.querySelector('#ui [data-action="keep"], #ui [data-action="release"]')?.click(); window.__gw.ui?.closeAll?.(); });
  });

  await frame('p12-murk-moored', async () => {
    const where = await g(() => {
      const c = window.__gw, P = window.__pal;
      P.goZone('mossmere'); P.phase('calm', 0.4);
      try { c.debug.timeScale?.(1); c.ui?.closeAll?.(); } catch { /* optional */ }
      try { if (c.fishing?.state && c.fishing.state !== 'idle') c.fishing.cancel?.('moved'); } catch { /* optional */ }
      c.debug.summonMerchant?.();
      // the camera's yaw is fixed (screen-up = world -Z) and sits ~14 m south of the raft and
      // ~9 m up, so the barge must be north of the raft with open water behind it. Every dock lies
      // against a shore (south of a dock is usually cliff), so fall back to open-water moorings.
      const docks = (c.world.getDocks?.() || []).map((k) => ({ x: k.position.x, z: k.position.z, yaw: k.yaw || 0, dock: true }));
      const spots = [[0, 22], [0, 14], [-8, 18], [8, 18], [-12, 26], [12, 26], [0, 6]].map(([x, z]) => ({ x, z, yaw: 0, dock: false }));
      const open = (x, z, r) => !c.world.isOpenWater || c.world.isOpenWater(x, z, r);
      let d = null, px = 0, pz = 0;
      for (const k of [...docks.sort((a, b) => a.z - b.z), ...spots]) {
        const x = k.x + 1.5, z = k.z + 8.5;
        let clear = open(x, z, 1.6) && (k.dock || open(k.x, k.z, 3));
        for (let s = 2; clear && s <= 18; s += 2) clear = open(x, z + s, 2.5);
        if (clear) { d = k; px = x; pz = z; break; }
      }
      if (!d) throw new Error('no mooring with open water to its south');
      c.actors.merchant?.arrive?.({ x: d.x, y: 0, z: d.z }, d.yaw, { instant: true });
      const yaw = 0;   // face screen-up
      c.player.teleport?.({ x: px, y: 0, z: pz }, yaw);
      return { moor: { x: d.x, z: d.z, dock: d.dock }, at: { x: +px.toFixed(1), z: +pz.toFixed(1) }, yaw: +yaw.toFixed(2) };
    });
    log('murk', JSON.stringify(where));
    await wait(1500);
    await settleShot('p12-murk-moored', { settle: Math.max(SETTLE, 8) });
  });

  const gloom = (zone, swarmFile, flareFile) => async () => {
    await g((z) => { window.__pal.goZone(z); window.__pal.phase('gloomtide', 0.3); window.__pal.quality(); }, zone);
    await wait(2000);
    await g((s) => { window.__pal.settle(s); window.__pal.snap(); }, SETTLE);
    const n = await g(() => window.__pal.spawnSwarm(40));
    log(`${zone}: ${n} enemies`);
    await wait(2500);   // let them close on the light for a few real frames
    await g(() => { window.__pal.clearUi(); window.__pal.spawnSwarm(40); window.__pal.settle(1); window.__pal.snap(); });
    await wait(1200);
    if (want(swarmFile)) await shot(swarmFile);
    if (!want(flareFile)) return;
    try {
      const fl = await g(() => { window.__pal.clearUi(); return window.__pal.flare(); });
      log(`${zone}: flare -> ${fl}`);
      await wait(500);
      await shot(flareFile);
      ok.push(flareFile);
    } catch (e) {
      failed.push(`${flareFile}: ${e?.message || e}`);
      log(`FAIL ${flareFile}: ${e?.stack || e}`);
    }
  };
  await frame('p06-mossmere-gloomtide', gloom('mossmere', 'p06-mossmere-gloomtide', 'p07-mossmere-flare'));

  // ---- Sporewood block
  await calm('sporewood', 'p03-sporewood-calm');
  await frame('p13-sporewood-dusk', async () => {
    await g(() => { window.__pal.goZone('sporewood'); window.__pal.phase('dusk', 0.7); });
    await wait(1200);
    await settleShot('p13-sporewood-dusk', { settle: Math.max(SETTLE, 8) });
  });

  // ---- Glasswater block
  await calm('glasswater', 'p04-glasswater-calm');
  await frame('p08-glasswater-gloomtide', gloom('glasswater', 'p08-glasswater-gloomtide', 'p09-glasswater-flare'));

  // ---- Pallid Deep
  await calm('paleabyss', 'p05-paleabyss-calm');

  // ---- extra frames: every lake at dusk / gloomtide / dawn (no swarm), plus readability checks
  const PHASES = [['dusk', 0.45], ['gloomtide', 0.35], ['dawn', 0.3]];
  for (const zone of ['mossmere', 'sporewood', 'glasswater', 'paleabyss']) {
    for (const [ph, k] of PHASES) {
      const file = `x-${zone}-${ph}`;
      await frame(file, async () => {
        await g(({ z, ph, k }) => { const P = window.__pal; P.goZone(z); try { window.__gw.combat.killAll?.('debug'); } catch { /* optional */ } P.phase(ph, k); P.quality(); }, { z: zone, ph, k });
        await wait(1500);
        await g(() => { try { window.__gw.combat.killAll?.('debug'); } catch { /* optional */ } });
        await settleShot(file, { settle: Math.max(SETTLE, 8) });
      });
    }
  }
  await frame('x20-swarm-closeup', async () => {
    await g(() => { const P = window.__pal; P.goZone('mossmere'); P.phase('gloomtide', 0.3); P.quality(); });
    await wait(1500);
    await g((s) => { window.__pal.settle(s); window.__pal.snap(); }, SETTLE);
    await g(() => window.__pal.spawnSwarm(40));
    await wait(2500);
    await g(() => { window.__pal.clearUi(); window.__pal.spawnSwarm(40); window.__pal.settle(1); window.__pal.snap(); });
    await wait(1200);
    const full = await shot('x20-swarm-full');   // then the centre crop, for eyes vs motes at night
    await page.screenshot({ path: full.replace('x20-swarm-full', 'x20-swarm-closeup'), clip: { x: Math.round(width * 0.2), y: Math.round(height * 0.12), width: Math.round(width * 0.6), height: Math.round(height * 0.6) } });
  });
  const catchCard = (zone, file, species) => frame(file, async () => {
    await g((z) => { const P = window.__pal; P.goZone(z); P.phase('calm', 0.35); P.quality(); }, zone);
    await wait(1500);
    await g((s) => { window.__pal.clearUi(); window.__pal.settle(s); window.__pal.snap(); }, SETTLE);
    const ok = await g((id) => window.__gw.debug.instantCatch?.(id), species);
    if (!ok) throw new Error('instantCatch failed for ' + species);
    await wait(2200);
    await g(() => { window.__pal.settle(1); });
    await wait(600);
    await shot(file);
    await g(() => { document.querySelector('#ui [data-action="release"], #ui [data-action="keep"]')?.click(); window.__gw.ui?.closeAll?.(); });
    await wait(400);
  });
  await catchCard('glasswater', 'x21-catch-uncommon-glass', 'mirror_pike');
  await catchCard('mossmere', 'x22-catch-uncommon-moss', 'weeping_carp');
  await frame('x23-vortex', async () => {
    await g(() => { const P = window.__pal; P.goZone('mossmere'); P.phase('gloomtide', 0.3); P.quality(); window.__gw.debug.giveBoon?.('little_maelstrom', 5); });
    await wait(1500);
    await g((s) => { window.__pal.settle(s); window.__pal.snap(); }, SETTLE);
    // the whirlpool opens on the densest crowd as soon as one is in range and lasts 3 s of game time;
    // slow the game so it stays open across a few real (2-8 fps) frames, then shoot three times
    // software GL runs ~0.1 game-s per real second, so pump combat (CPU only) past the 9 s cooldown
    await g(() => {
      const c = window.__gw, P = window.__pal;
      const pump = (sec) => { let t = c.time.t; for (let i = 0; i < Math.round(sec / 0.05); i++) { t += 0.05; try { c.combat.update(0.05, t); } catch { /* keep pumping */ } } };
      P.spawnSwarm(30); pump(6); P.spawnSwarm(30); pump(3.4);
      c.debug.timeScale?.(0.3);
    });
    await wait(600);
    await g(() => { window.__pal.clearUi(); window.__pal.settle(0.5); window.__pal.snap(); });
    await wait(800);
    await shot('x23-vortex');
    await wait(1500);
    await shot('x23-vortex-b');
    await wait(1500);
    await shot('x23-vortex-c');
    await g(() => window.__gw.debug.timeScale?.(1));
  });

  // a flare frame requested on its own (PALETTE_ONLY=p07) still needs the swarm set up
  for (const [f, z, sw] of [['p07-mossmere-flare', 'mossmere', 'p06-mossmere-gloomtide'], ['p09-glasswater-flare', 'glasswater', 'p08-glasswater-gloomtide']]) {
    if (!want(f) || want(sw)) continue;
    const t0 = Date.now();
    try { await gloom(z, sw, f)(); log(`ok   ${f} (${((Date.now() - t0) / 1000).toFixed(1)}s)`); } catch (e) { failed.push(`${f}: ${e?.message || e}`); log(`FAIL ${f}: ${e?.stack || e}`); }
  }

  await g(() => { try { window.__gw.debug.timeScale?.(1); } catch { /* ignore */ } }).catch(() => {});
  log(`palette frames: ${ok.length} ok, ${failed.length} failed${skipped.length ? `, ${skipped.length} skipped` : ''}`);
  for (const f of failed) log('  failed', f);
}
