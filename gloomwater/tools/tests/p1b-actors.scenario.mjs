// P1 actors (DESIGN §25.14.2 A1 A2 A3 A10; CONTRACT §13.7 models / actors) with v3 on at phase 1, in a browser:
//
//   node build.mjs --dev --out=tools/out/p1b-actors.html
//   node tools/playtest.mjs --html=tools/out/p1b-actors.html --shots=tools/out/p1b-actors --script=tools/tests/p1b-actors.scenario.mjs --width=960 --height=540
//   (--only=scale,poses,auto,hue,murk runs a part, --poses=palm,hang a subset of the poses; --mobile --width=390 --height=844
//   for the phone frames, named m-*)
//
// scale (A1): createFish(species, {z}) builds the true length L50·e^(σz + 0.06·max(0, z − 1.04)²) in metres: a Dusk Minnow at
//   z 0.4 measures 0.231 m and at z 3.0 0.397 m in the scene (bounding box ± 3%), every P1 species at z 0.4 / 3.0 too; a v3
//   weight sizes the same fish; a forced 0.08 m Cupbearer measures 0.08 m, and nothing goes under 0.04 m.
// poses (A2): forced catches at 0.2 / 0.6 / 1.5 / 3.0 m (and the 2.6 m Matriarch, the 8.5 m Lantern-Swallower) play
//   measurePalm / measureArms / measureHang / measureAlongside; the knotted cord spans the fish's length (± 3%) from the snout
//   to the tail tip; close-ups from the trophy framing (clamp(1.2 + 1.6L, 1.6, 16) m, craned to 50° above 4 m).
// auto: the ceremony driven only by fishing.view.measure (scoop → pose → cord → banners → card → null) and setPose / showCord.
// hue (A3): Mossmere and Glasswater catch close-ups ≤ 2% green-teal chroma (tools/hue-report.mjs on the frames named hue-*).
// sil (v3 auto-fishing): FishVisual.setSilhouette hides every species colour / pattern / glow / eye while the size reads, and
//   gives it all back at the landing; createFish('minnow', {lengthCm}) is a nameless shape at an exact length.
// murk (A10): Old Murk moored next to the raft (hue report on murk-moored); his lamp light is #ffe2b0; the tip reads "Sail to
//   his lantern".
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

export default async function (api) {
  const { page, frames, evalGame: g, log, shot, wait } = api;
  const failures = [];
  const only = api.args?.only ? String(api.args.only).toLowerCase().split(',') : null;
  const want = (x) => !only || only.includes(x);
  const mobile = !!api.args?.mobile;
  const pre = mobile ? 'm-' : '';
  let stepName = 'boot';
  const t0 = Date.now();
  const step = (s) => { stepName = s; log(`---- ${s}  (+${((Date.now() - t0) / 1000).toFixed(0)} s)`); };
  const check = (cond, msg, extra) => {
    if (cond) { log('ok  ', msg, extra !== undefined ? JSON.stringify(extra) : ''); return true; }
    failures.push(`[${stepName}] ${msg}${extra !== undefined ? ` :: ${JSON.stringify(extra)}` : ''}`);
    log('FAIL', msg, extra !== undefined ? JSON.stringify(extra) : '');
    return false;
  };
  // frames are grabbed straight off the WebGL canvas right after one render of our own (no compositor wait: page screenshots
  // time out on a loaded machine); the DOM ui is not in these frames, the close-ups are world-only on purpose
  const shotsDir = resolve(process.cwd(), String(api.args?.shots || 'tools/out/p1b-actors'));
  mkdirSync(shotsDir, { recursive: true });
  const safeShot = async (name) => {
    for (let i = 0; i < 3; i++) {
      try {
        const url = await g(() => { const c = window.__gw; c.render.render(); return c.render.renderer.domElement.toDataURL('image/png'); });
        const file = join(shotsDir, pre + name + '.png');
        writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
        log('frame', file);
        return;
      } catch (e) { log('frame retry', name, String(e?.message || e).slice(0, 80)); }
    }
  };

  // ------------------------------------------------------------------ boot: v3 phase 1, a fresh save, a run in the Mossmere
  step('boot (?v3=1&v3phase=1)');
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 240000 });
  await g(() => window.__gw.game.wipeAll());
  await page.goto(page.url().split('?')[0] + '?v3=1&v3phase=1', { waitUntil: 'commit', timeout: 240000 });
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 240000 });
  await frames(2);
  let s = await g(() => { const d = window.__gw.data; return { en: d.V3_ENABLED, ph: d.V3_PHASE, cer: !!d.BALANCE.ceremony }; });
  check(s.en === true && s.ph === 1 && s.cer, 'v3 phase-1 data in the build', s);

  await g((mobile) => {
    const c = window.__gw, H = (window.__pa = {});
    H.hideUi = (all) => {
      try { const m = c.state.meta; m.seenTips = m.seenTips || {}; for (const t of c.data.TIPS || []) if (t?.id) m.seenTips[t.id] = true; } catch { /* optional */ }
      let el = document.getElementById('pa-hide');
      if (!el) { el = document.createElement('style'); el.id = 'pa-hide'; document.head.appendChild(el); }
      el.textContent = (all ? '#ui { display: none !important; }\n' : '') + '.gw-banner, .gw-banner-layer, .gw-toast { display: none !important; }';
    };
    H.settle = (sec = 1) => {
      const names = ['actors', 'models', 'world', 'water', 'render'];
      let t = c.time.t;
      for (let i = 0; i < Math.max(1, Math.round(sec / 0.05)); i++) { t += 0.05; for (const n of names) { const m = c[n]; if (m && !m.isStub && m.update) { try { m.update(0.05, t); } catch { /* keep pumping */ } } } }
    };
    H.clearUi = () => { try { if (c.ui?.isBlocking?.()) c.ui.closeAll?.(); } catch { /* optional */ } };
    // the trophy framing (DESIGN §25.6.8, R2): distance clamp(1.2 + 1.6L, 1.6, 16) m, 50° above 4 m, around the actors' focus
    H.cam = null;
    if (!c.render.__paWrapped) {
      const up = c.render.update.bind(c.render);
      c.render.update = (dt, t) => {
        up(dt, t);
        const o = H.cam; if (!o) return;
        const cam = c.render.camera, V = c.THREE.Vector3;
        const mf = c.actors.getMeasureFocus?.();
        const f = o.focus ? new V(o.focus.x, o.focus.y, o.focus.z) : mf ? mf.center : c.actors.getWickPos(new V());
        const el = o.elev * Math.PI / 180;
        cam.position.set(f.x + Math.sin(o.yaw) * Math.cos(el) * o.dist, f.y + Math.sin(el) * o.dist, f.z + Math.cos(o.yaw) * Math.cos(el) * o.dist);
        cam.up.set(0, 1, 0); cam.lookAt(f.x, f.y + (o.aimY || 0), f.z);
        cam.fov = o.fov || 42; cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
      };
      c.render.__paWrapped = true;
    }
    H.trophy = (L, yawOff = 0) => {
      const p = c.player.position, h = Number(c.player.heading) || 0;
      const dist = Math.min(16, Math.max(1.6, 1.2 + 1.6 * L));
      // in front of the raft and a little to its side, looking back at the Wick (the subject faces the camera)
      H.cam = { yaw: h + Math.PI + 0.55 + yawOff, elev: L > 4 ? 50 : L > 1.6 ? 24 : L < 0.3 ? 19 : 15, dist: mobile ? dist * 1.25 : dist, aimY: L < 0.3 ? 0.04 : 0.1, fov: mobile ? 52 : 40 };
      // place a provisional camera now, so actors sees it when it picks the alongside side
      const cam = c.render.camera, el = H.cam.elev * Math.PI / 180;
      cam.position.set(p.x + Math.sin(H.cam.yaw) * Math.cos(el) * dist, 1 + Math.sin(el) * dist, p.z + Math.cos(H.cam.yaw) * Math.cos(el) * dist);
      cam.updateMatrixWorld();
      return dist;
    };
    H.fish = (id, size) => { const sp = typeof id === 'object' ? id : c.data.SPECIES_BY_ID[id] || c.data.SPECIES_V3.find((x) => x.id === id); return c.models.createFish(sp, size); };
    H.held = null;
    H.catch = (id, size) => { const fv = H.fish(id, size); H.held = fv; c.actors.showCatch(fv); return fv; };
    H.release = () => { c.actors.showCatch(null); try { H.held?.dispose?.(); } catch { /* ignore */ } H.held = null; };
    // the cord's laid span against the held fish's snout and tail tip (world)
    H.span = () => {
      const fv = H.held, ci = c.actors.getCordInfo?.();
      if (!fv || !ci) return null;
      const b = fv.bounds, o = fv.object3d; o.updateMatrixWorld();
      const mid = (b.top + b.bottom) / 2;
      const nose = new c.THREE.Vector3(0, mid, b.noseZ).applyMatrix4(o.matrixWorld), tail = new c.THREE.Vector3(0, mid, b.tailZ).applyMatrix4(o.matrixWorld);
      const ax = tail.clone().sub(nose).normalize();
      const along = ci.end.clone().sub(ci.start).dot(ax);
      return { L: fv.length, cordLen: ci.length, along: +along.toFixed(4), startOff: +ci.start.clone().sub(nose).dot(ax).toFixed(4), endOff: +ci.end.clone().sub(tail).dot(ax).toFixed(4), k: +ci.k.toFixed(3), r: +ci.radius.toFixed(4) };
    };
  }, mobile);
  await g(() => { const c = window.__gw; c.state.meta.runs = 1; c.game.startNewRun({ character: 'wick', nightMode: 'still' }); });
  await page.waitForFunction(() => window.__gw.flow === 'playing', null, { timeout: 120000 });
  await g(() => {
    const c = window.__gw, H = window.__pa;
    H.clearUi(); H.hideUi(false);
    try { c.debug.god?.(true); } catch { /* optional */ }
    if (c.state.run) c.state.run.xpNext = 1e9;
    c.render.setQuality?.('high');
    try { c.debug.setOil?.(1000); c.debug.setSatiety?.(1000); } catch { /* optional */ }
  });
  // the Starlit night: the big-fish hour, the lantern doing the lighting
  const night = async () => g(() => {
    const c = window.__gw, r = c.state.run;
    if (r.phase !== 'gloomtide') { c.debug.setPhase('dusk'); c.debug.setPhase('gloomtide'); }
    const d = c.survival.getPhaseInfo().duration || 90; r.phaseTime = d * 0.3;
    try { c.debug.setOil?.(1000); } catch { /* optional */ }
    window.__pa.clearUi();
    return c.survival.getPhaseInfo().phase;
  });
  const goZone = (zone) => g((zone) => {
    const c = window.__gw, r = c.state.run;
    if (!(r.zonesUnlocked || []).includes(zone)) r.zonesUnlocked = [...(r.zonesUnlocked || []), zone];
    if (r.zone !== zone) { r.zone = zone; r.gateOpen = false; c.bus.emit('zone:change', { zone, prev: null }); }
    const sp = c.world.getSpawn?.(); if (sp?.position) c.player.teleport?.(sp.position, sp.yaw || 0);
    c.player.velocity?.set?.(0, 0, 0);
    window.__pa.clearUi();
    return r.zone;
  }, zone);
  const settleShot = async (name, sec = 1.2) => {
    await g((sec) => { window.__pa.clearUi(); window.__pa.settle(sec); }, sec);
    await frames(1);
    await safeShot(name);
  };

  // ------------------------------------------------------------------ A1: honest stretched scale
  if (want('scale')) {
    step('A1: createFish(species, {z}) at true length');
    s = await g(() => {
      const c = window.__gw, H = window.__pa, d = c.data, T = c.THREE;
      // the fish's body in the scene: body + fins (a ray's tail and a jelly's arms too); claws, barbels and lure stalks reach past
      const box = (fv) => {
        const o = fv.object3d, b = new T.Box3(), extra = fv.shape === 'ray' || fv.shape === 'jelly';
        o.position.set(0, -50, 0); o.rotation.set(0, 0, 0); c.render.scene.add(o); o.updateMatrixWorld(true);
        o.traverse((m) => { if (m.isMesh && (m.name === 'body' || m.name === 'fins' || (extra && m.name === 'extras'))) { m.geometry.computeBoundingBox(); b.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld)); } });
        o.parent.remove(o); return b;
      };
      const boxAll = (fv) => { const o = fv.object3d; o.position.set(0, -50, 0); o.rotation.set(0, 0, 0); c.render.scene.add(o); o.updateMatrixWorld(true); const b = new T.Box3(); o.traverse((m) => { if (m.isMesh) { m.geometry.computeBoundingBox(); b.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld)); } }); o.parent.remove(o); return b; };
      const len = (fv) => { const b = box(fv); return b.max.z - b.min.z; };
      const m04 = H.fish('dusk_minnow', { z: 0.4 }), m30 = H.fish('dusk_minnow', { z: 3.0 });
      const all = (fv) => { const b = boxAll(fv); return b.max.z - b.min.z; };
      const out = { m04: +all(m04).toFixed(4), m30: +all(m30).toFixed(4), L04: m04.length, L30: m30.length, trueScale: m04.trueScale };
      const sp = d.SPECIES_BY_ID.dusk_minnow, kg = d.sizeWeight(sp, d.sizeLength(sp, 3.0, 'mossmere'));
      out.byWeight = +H.fish('dusk_minnow', kg).length.toFixed(4);
      const cup = d.SPECIES_V3.find((x) => x.id === 'cupbearer');
      out.cup = +len(H.fish(cup, { lengthCm: 8 })).toFixed(4);
      out.floor = +H.fish('dusk_minnow', { lengthCm: 1.5 }).length.toFixed(4);
      out.all = [];
      for (const x of d.SPECIES) for (const z of [0.4, 3.0]) {
        const fv = H.fish(x.id, { z }), want = d.sizeLength(x, z, x.zone) / 100, got = len(fv);
        out.all.push({ id: x.id, z, shape: x.model?.shape, want: +want.toFixed(3), got: +got.toFixed(3), err: +((got - want) / want).toFixed(4) });
        fv.dispose();
      }
      return out;
    });
    check(Math.abs(s.m04 - 0.231) / 0.231 <= 0.03, 'a Dusk Minnow at z 0.4 measures 0.231 m in the scene (± 3%)', { bbox: s.m04, L: s.L04 });
    check(Math.abs(s.m30 - 0.397) / 0.397 <= 0.03, 'a Dusk Minnow at z 3.0 measures 0.397 m in the scene (± 3%)', { bbox: s.m30, L: s.L30 });
    check(s.trueScale === true, 'a v3 species is built at true scale (FishVisual.trueScale)');
    check(Math.abs(s.byWeight - 0.397) / 0.397 <= 0.01, 'a v3 weight sizes the same fish (L = ∛(W/k))', s.byWeight);
    check(Math.abs(s.cup - 0.08) / 0.08 <= 0.03, 'a forced 0.08 m Cupbearer measures 0.08 m (P2 species)', s.cup);
    check(s.floor === 0.04, 'the only floor is 0.04 m', s.floor);
    const bad = s.all.filter((x) => Math.abs(x.err) > 0.03);
    check(bad.length === 0, `every P1 species at z 0.4 and 3.0 measures its true length (± 3%; ${s.all.length} fish)`, bad.slice(0, 6));
    log('worst', JSON.stringify(s.all.sort((a, b) => Math.abs(b.err) - Math.abs(a.err)).slice(0, 4)));
  }

  // ------------------------------------------------------------------ A2: the measuring poses and the knotted cord
  const POSES = [
    { name: 'palm', id: 'dusk_minnow', size: { z: -0.794 }, L: 0.2, pose: 'measurePalm' },
    { name: 'arms', id: 'reedjaw_pike', size: { z: -1.028 }, L: 0.6, pose: 'measureArms' },
    { name: 'hang', id: 'reedjaw_pike', size: { z: 3.2 }, L: 1.5, pose: 'measureHang' },
    { name: 'alongside', id: 'gilt_eyed_eel', size: { lengthCm: 300 }, L: 3.0, pose: 'measureAlongside' },
    { name: 'legend', id: 'belled_matriarch', size: { z: 0 }, L: 2.6, pose: 'measureAlongside' },
    { name: 'swallower', id: 'lantern_swallower', size: { z: 0 }, L: 8.5, pose: 'measureAlongside' },
  ];
  if (want('poses')) {
    await goZone('mossmere');
    await night();
    const pick = api.args?.poses ? String(api.args.poses).split(',') : null;   // --poses=palm,hang (a subset, e.g. for the phone frames)
    for (const P of POSES.filter((x) => !pick || pick.includes(x.name))) {
      step(`A2: ${P.name} (${P.L} m → ${P.pose})`);
      await g((L) => window.__pa.trophy(L), P.L);
      const fvL = await g(([id, size]) => window.__pa.catch(id, size).length, [P.id, P.size]);
      check(Math.abs(fvL - P.L) / P.L <= 0.02, `the ${P.id} is ${P.L} m`, +fvL.toFixed(3));
      await g(() => window.__pa.settle(0.9));
      s = await g(() => ({ m: window.__gw.actors.measurePose, p: window.__gw.actors.pose }));
      check(s.m === P.pose && s.p === P.pose, `a ${P.L} m fish plays ${P.pose}`, s);
      await settleShot(`a2-${P.name}-pose`, 0.3);
      // the cord: half laid, then fully laid (explicit showCord, as fishing's ceremony drives it)
      await g((L) => { const c = window.__gw; c.actors.showCord(L, 0); window.__pa.settle(0.15); c.actors.showCord(L, 0.55); window.__pa.settle(0.4); }, fvL);
      if (P.name === 'hang' || P.name === 'alongside') await settleShot(`a2-${P.name}-cord-mid`, 0.05);
      await g((L) => { const c = window.__gw; c.actors.showCord(L, 1); window.__pa.settle(0.6); }, fvL);
      s = await g(() => window.__pa.span());
      check(!!s && Math.abs(s.along - s.L) / s.L <= 0.03 && Math.abs(s.startOff) <= s.L * 0.03 && Math.abs(s.endOff) <= s.L * 0.03 && s.k === 1,
        'the knotted cord spans the fish from snout to tail tip (± 3%)', s);
      await settleShot(`a2-${P.name}-cord`, 0.1);
      await g(() => window.__pa.release());
      await g(() => window.__pa.settle(0.6));
      s = await g(() => ({ m: window.__gw.actors.measurePose, cord: window.__gw.actors.getCordInfo() }));
      check(!s.m && !s.cord, 'releasing the catch ends the pose and rolls the cord away', s);
    }
    await g(() => { window.__pa.cam = null; });
  }

  // ------------------------------------------------------------------ the ceremony from fishing.view.measure alone
  if (want('auto')) {
    step('auto: fishing.view.measure drives the pose and the cord');
    await goZone('mossmere');
    await g(() => window.__pa.trophy(1.4));
    s = await g(() => {
      const c = window.__gw, H = window.__pa, v = c.fishing.view, out = {};
      const fv = H.fish('reedjaw_pike', { z: 3.0 });   // an Elder Reedjaw, 1.38 m
      v.measure = { phase: 'scoop', length: fv.length * 100, sizeClass: 'elder', seal: 'blackWaxRibbon' };
      H.held = fv; c.actors.showCatch(fv); H.settle(0.3);
      out.scoop = c.actors.measurePose;
      v.measure = { ...v.measure, phase: 'pose' }; H.settle(0.6); out.pose = c.actors.measurePose; out.cord0 = c.actors.getCordInfo();
      v.measure = { ...v.measure, phase: 'cord', cordDur: 1.0 }; H.settle(0.5); out.k5 = c.actors.cordK;
      H.settle(0.7); out.k12 = c.actors.cordK;
      v.measure = { ...v.measure, phase: 'banners' }; H.settle(0.3); out.kb = c.actors.cordK;
      v.measure = { ...v.measure, phase: 'card' }; H.settle(0.3); out.kc = c.actors.cordK; out.span = H.span();
      v.measure = null; H.release(); H.settle(0.6);
      out.after = { m: c.actors.measurePose, cord: c.actors.getCordInfo() };
      // explicit setPose wins over the view and over the fish's own; a one-shot does not end it
      const small = H.fish('dusk_minnow', { z: 0 }); H.held = small; c.actors.showCatch(small);
      v.measure = { phase: 'pose', length: small.length * 100, sizeClass: 'keeper' };
      c.actors.setPose('measureArms'); H.settle(0.4); out.explicit = c.actors.measurePose;
      c.actors.setPose('celebrate'); H.settle(0.1); out.afterOneShot = c.actors.measurePose;
      c.actors.setPose(null); H.settle(0.1); out.cleared = c.actors.measurePose;
      v.measure = null; H.release(); H.settle(0.3);
      return out;
    });
    check(s.scoop === 'measureHang', 'a v3 fish handed over by showCatch takes its pose by length at once (1.38 m → hang)', s.scoop);
    check(s.pose === 'measureHang' && !s.cord0, 'view.measure pose: the pose by length, no cord yet', { pose: s.pose, cord: s.cord0 });
    check(s.k5 > 0.6 && s.k5 < 0.9 && s.k12 > 0.99, 'view.measure cord: the cord unrolls on audio\'s ease-out clock (k(0.5) = 0.75)', { k5: s.k5, k12: s.k12 });
    check(s.kb === 1 && s.kc === 1 && s.span && Math.abs(s.span.along - s.span.L) / s.span.L <= 0.03, 'banners / card: the cord stays laid along the fish', { kb: s.kb, kc: s.kc, span: s.span });
    check(!s.after.m && !s.after.cord, 'measure null + release: the Wick lets go, the cord rolls up', s.after);
    check(s.explicit === 'measureArms' && s.afterOneShot === 'measureArms' && s.cleared === 'measurePalm', 'explicit setPose wins; a one-shot keeps it; setPose(null) falls back to the view', s);
    await g(() => { window.__pa.cam = null; });
  }

  // ------------------------------------------------------------------ v3 auto-fishing: the unidentified fish (models setSilhouette)
  if (want('sil')) {
    step('silhouette: the hooked fish shows its size, never its species');
    await goZone('mossmere');
    await night();
    s = await g(() => {
      const c = window.__gw, H = window.__pa, T = c.THREE, out = {};
      const mats = (fv) => { const a = []; fv.object3d.traverse((o) => { if (o.isMesh) a.push(o); }); return a; };
      const lum = (col) => 0.2126 * col.r + 0.7152 * col.g + 0.0722 * col.b;
      for (const [id, z] of [['reedjaw_pike', 1.5], ['gloam_eel', 1.0], ['candlefin_koi', 0.5]]) {
        const fv = H.fish(id, { z });
        const before = mats(fv).map((m) => m.material.color?.getHexString?.() + ':' + m.visible);
        fv.setSilhouette(1);
        const lit = mats(fv).filter((m) => m.visible && m.material.isMeshToonMaterial);
        const glowShown = mats(fv).filter((m) => m.visible && (m.name === 'glow' || (m.material.isMeshBasicMaterial && m.material.toneMapped === false)));
        const sprites = []; fv.object3d.traverse((o) => { if (o.isSprite && o.visible && o.material.opacity > 0.001) sprites.push(o); });
        out[id] = { L: +fv.length.toFixed(3), maxLum: +Math.max(...lit.map((m) => lum(m.material.color))).toFixed(3),
          emissive: +Math.max(...lit.map((m) => m.material.emissiveIntensity * lum(m.material.emissive))).toFixed(3), glowShown: glowShown.length, sprites: sprites.length };
        fv.setSilhouette(0);
        out[id].restored = JSON.stringify(mats(fv).map((m) => m.material.color?.getHexString?.() + ':' + m.visible)) === JSON.stringify(before);
        fv.dispose();
      }
      // a nameless shape at an exact length (nothing of any species): createFish('minnow', {lengthCm})
      const anon = c.models.createFish('minnow', { lengthCm: 120 });
      const o = anon.object3d; o.position.set(0, -50, 0); c.render.scene.add(o); o.updateMatrixWorld(true);
      const b = new T.Box3(); o.traverse((m) => { if (m.isMesh && (m.name === 'body' || m.name === 'fins')) { m.geometry.computeBoundingBox(); b.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld)); } });
      out.anon = { L: anon.length, bbox: +(b.max.z - b.min.z).toFixed(3), species: anon.speciesId, trueScale: anon.trueScale };
      anon.dispose();
      return out;
    });
    for (const id of ['reedjaw_pike', 'gloam_eel', 'candlefin_koi']) {
      const r = s[id];
      check(r.maxLum < 0.03 && r.emissive < 0.003 && r.glowShown === 0 && r.sprites === 0, `${id}: the silhouette shows no colour, pattern, glow or eye of its species`, r);
      check(r.restored, `${id}: setSilhouette(0) gives every part back exactly (the landing reveals it)`);
    }
    check(Math.abs(s.anon.bbox - 1.2) / 1.2 <= 0.03 && s.anon.trueScale, "a nameless shape at an exact length: createFish('minnow', {lengthCm: 120}) is 1.2 m", s.anon);
    // a frame: a big dark shape and a small one at the surface beside the raft, size readable, species not
    await g((mobile) => {
      const c = window.__gw, H = window.__pa, p = c.player.position, h = Number(c.player.heading) || 0;
      H.sil = [['reedjaw_pike', { z: 3.0 }, 2.6, 0.4], ['dusk_minnow', { z: 0 }, 2.2, -1.3]].map(([id, size, d, side]) => {
        const fv = H.fish(id, size); fv.setSilhouette(1);
        const yaw = h + side;
        const wy = c.water?.getHeight?.(p.x + Math.sin(yaw) * d, p.z + Math.cos(yaw) * d) ?? 0;   // at the surface, as fishing holds a hooked fish
        fv.object3d.position.set(p.x + Math.sin(yaw) * d, wy - 0.01 * fv.length, p.z + Math.cos(yaw) * d); fv.object3d.rotation.y = yaw + 1.9;
        c.render.scene.add(fv.object3d); return fv;
      });
      if (!c.models.__paSilUpd) { const up = c.models.update.bind(c.models); c.models.update = (dt, t) => { up(dt, t); for (const fv of H.sil || []) fv.update(dt, t, { swim: 0.9, struggle: 0.5 }); }; c.models.__paSilUpd = true; }
      const fx = (H.sil[0].object3d.position.x + H.sil[1].object3d.position.x) / 2, fz = (H.sil[0].object3d.position.z + H.sil[1].object3d.position.z) / 2;
      H.cam = { focus: { x: fx, y: 0, z: fz }, yaw: Math.atan2(fx - p.x, fz - p.z) + 0.35, elev: 34, dist: mobile ? 7.5 : 5.5, fov: 44 };
    }, mobile);
    await settleShot('sil-hooked-shapes', 1.0);
    await g(() => { const H = window.__pa; for (const fv of H.sil || []) fv.dispose(); H.sil = []; H.cam = null; });
  }

  // ------------------------------------------------------------------ A3: catch close-ups for the hue report
  if (want('hue')) {
    for (const [zone, id, size, L] of [['mossmere', 'reedjaw_pike', { z: 2.0 }, 1.07], ['mossmere', 'gloam_eel', { z: 1.2 }, 0.89], ['glasswater', 'shardspine_eel', { z: 1.6 }, 1.13], ['glasswater', 'prism_minnow', { z: 0.6 }, 0.25]]) {
      step(`A3: ${zone} catch close-up (${id})`);
      await goZone(zone);
      await night();
      await g((L) => window.__pa.trophy(L), L);
      await g(([id, size]) => window.__pa.catch(id, size), [id, size]);
      await g(() => { const c = window.__gw, H = window.__pa; H.settle(0.8); c.actors.showCord(H.held.length, 1); H.settle(0.8); });
      await settleShot(`hue-${zone}-${id}`, 0.2);
      await g(() => window.__pa.release());
    }
    await g(() => { window.__pa.cam = null; });
  }

  // ------------------------------------------------------------------ A10: Old Murk off green
  if (want('murk')) {
    step('A10: Old Murk moored');
    await goZone('mossmere');
    // a calm first (a new day's schedule would send him off again, so the phase changes before he moors)
    await g(() => { const c = window.__gw; try { if (c.state.run.phase !== 'calm') c.debug.setPhase('calm'); c.state.run.phaseTime = 20; } catch { /* optional */ } window.__pa.clearUi(); window.__pa.settle(0.3); });
    s = await g(() => {
      const c = window.__gw, d = c.data, H = window.__pa;
      const tip = (d.TIPS || []).find((t) => t.id === 'merchant')?.text;
      // a ceremony while he is away borrows his dark lamp light as the candle fill: it must come back exactly as it was
      c.actors.merchant.leave({ instant: true }); H.settle(1.0);   // (a fill still fading out from an earlier catch ends first)
      const before = c.actors.merchant.light?.color?.getHexString?.();
      H.catch('dusk_minnow', { z: 0 }); H.settle(0.8);
      const during = c.actors.merchant.light?.color?.getHexString?.();
      H.release(); H.settle(1.2);
      const after = c.actors.merchant.light?.color?.getHexString?.();
      const p = c.player.position;
      c.actors.merchant.arrive({ x: p.x - 4.2, y: 0, z: p.z - 5.5 }, 0.4, { instant: true });
      window.__pa.settle(0.2);
      const col = c.actors.merchant.light?.color?.getHexString?.();
      return { tip, col, look: d.COVE?.murkLook, fill: { before, during, after } };
    });
    check(s.fill.before === 'ffe2b0' && s.fill.during !== s.fill.before && s.fill.after === s.fill.before, 'the ceremony borrows his lamp light as a candle fill and gives it back unchanged', s.fill);
    check(/Sail to his lantern\.$/.test(s.tip || ''), 'the merchant tip reads "Sail to his lantern"', s.tip);
    check(s.col === 'ffe2b0', "Murk's lamp PointLight is #ffe2b0", s.col);
    await g((mobile) => {
      const c = window.__gw, H = window.__pa, p = c.player.position, h = Number(c.player.heading) || 0;
      // from the raft's side of the barge, a little off-axis: his face, lichen and lamp, with the raft's light behind us
      const m = c.actors.merchant.position;
      H.cam = { focus: { x: m.x, y: 1.5, z: m.z }, yaw: Math.atan2(p.x - m.x, p.z - m.z) + 0.55, elev: 14, dist: mobile ? 9 : 6.5, fov: 42 };
    }, mobile);
    await settleShot('murk-moored-calm', 1.5);
    await night();
    s = await g(() => {   // the night may send him home: moor him again where he was
      const c = window.__gw, p = c.player.position;
      c.actors.merchant.arrive({ x: p.x - 4.2, y: 0, z: p.z - 5.5 }, 0.4, { instant: true });
      window.__pa.settle(0.2);
      return { visible: !!c.actors.merchant.object3d?.visible, col: c.actors.merchant.light?.color?.getHexString?.() };
    });
    check(s.visible && s.col === 'ffe2b0', 'at night his lamp is still #ffe2b0', s);
    await settleShot('murk-moored-night', 1.5);
    await g(() => { window.__pa.cam = null; window.__gw.actors.merchant.leave({ instant: true }); });
  }

  const errs = await g(() => window.__gw.errors.slice());
  check(errs.length === 0, 'ctx.errors stays empty', errs.slice(0, 4));
  log(`done in ${((Date.now() - t0) / 1000).toFixed(0)} s, ${failures.length} failure(s)`);
  return { failures };
}
