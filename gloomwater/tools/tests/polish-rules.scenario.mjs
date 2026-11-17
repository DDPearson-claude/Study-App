// Lake 1 polish, batch 2 (the standing rules in 3D: never a ring or a disc round the raft, no glitter on the water): one short walk
// from a fresh save through the opening's glide in, the first trip's still water and the gate, at the desktop size it is run at and
// then at a near-square phone frame (820x900, the viewport changed in the same page), each glide in shot mid-way.
//
//   node build.mjs --dev --out=<dir>/dev.html
//   node tools/playtest.mjs --html=<dir>/dev.html --shots=<dir>/shots --script=tools/tests/polish-rules.scenario.mjs --width=960 --height=540
//   options: --probe (also shoots the glide in with the water's lights, the raft's light pool and the ripples / wakes turned off, and
//            prints the water's light list)   --nophone
// Prints POLISH_RULES {failures, notes, frames}.
import { makeKit, Abort } from './loop-1a.scenario.mjs';

export default async function (api) {
  const { page, evalGame: g, log, args } = api;
  page.setDefaultTimeout(300000);
  const failures = [], notes = [], frames = [];
  /** A click on the first visible match through the page (no touch input: the phone pass runs in a desktop context). */
  const click = (sel) => g((s) => { const e = [...document.querySelectorAll(s)].find((x) => x.offsetParent !== null) || document.querySelector(s); if (!e) return false; e.click(); return true; }, sel);
  const lights = () => g(() => {
    const c = window.__gw, U = c.water.material.uniforms, n = U.uLN.value, lp = U.uLP.value, lc = U.uLC.value, p = c.player.position, m = c.actors.merchant;
    const out = [];
    for (let i = 0; i < n; i++) out.push({ x: +lp[i * 4].toFixed(1), y: +lp[i * 4 + 1].toFixed(1), z: +lp[i * 4 + 2].toFixed(1), R: +lp[i * 4 + 3].toFixed(1), rgb: [lc[i * 4], lc[i * 4 + 1], lc[i * 4 + 2]].map((v) => +v.toFixed(3)), w: lc[i * 4 + 3] });
    return { raft: [+p.x.toFixed(1), +p.z.toFixed(1)], murk: m?.position ? [+m.position.x.toFixed(1), +m.position.z.toFixed(1)] : null, lights: out, rip: U.uRipN.value, wake: U.uWakeN.value, obs: U.uObsN.value };
  });
  /** Shoot with something turned off for this one frame (the water mesh's onBeforeRender runs after every update). */
  const shootWith = async (K, name, what) => {
    await g((w) => {
      const c = window.__gw, wm = c.water.mesh, U = c.water.material.uniforms, pool = c.actors.lightPool;
      wm.userData.__probe = wm.onBeforeRender;
      wm.onBeforeRender = function () { if (w === 'lights') U.uLN.value = 0; if (w === 'rings') { U.uRipN.value = 0; U.uWakeN.value = 0; } if (w === 'obs') U.uObsN.value = 0; };
      if (w === 'pool' && pool) pool.onBeforeRender = function () { this.material.uniforms.uK.value = 0; };
    }, what);
    await K.shoot(name);
    await g(() => { const c = window.__gw, wm = c.water.mesh, pool = c.actors.lightPool; wm.onBeforeRender = wm.userData.__probe || (() => {}); if (pool) pool.onBeforeRender = () => {}; });
  };

  async function walk(K, size) {
    const tow = () => g(() => window.__gw.debug.loop?.tow?.()?.phase ?? null);
    K.step(`${size}: a fresh save, Start with no film`);
    await K.load({ fresh: true });
    await K.titleReady();
    await g(() => { window.__lp.ev.length = 0; window.__lp.sim = 0; window.__gw.game.beginIntro({ character: 'taper' }); });
    K.need((await K.until("c.debug.loop.tow().phase === 'arrive'", 4)).ok, 'the Landing');
    await K.steps(3);
    await g(() => window.__gw.debug.loop.tow('tap'));   // the arrive
    await K.steps(4);
    await g(() => window.__gw.debug.loop.tow('tap'));   // the wake: the tow begins
    await K.secs(0.8);
    await g(() => window.__gw.debug.loop.tow('tap'));   // the leg inked at once
    K.need((await K.until("c.debug.loop.tow().phase === 'glide'", 3)).ok, 'the glide in', await tow());
    await K.secs(1.2);
    await K.settle(400);
    await K.shoot('glide-in');
    const L = await lights();
    log('LIGHTS', size, JSON.stringify(L));
    const cam = await g(() => { const c = window.__gw, cm = c.render.camera, o = c.actors.raft || c.actors.wick; cm.updateMatrixWorld(); const v = o.getWorldPosition(new c.THREE.Vector3()).project(cm); return { ndc: [+v.x.toFixed(2), +v.y.toFixed(2)], aspect: +cm.aspect.toFixed(2) }; });
    frames.push({ size, raftNdc: cam.ndc, aspect: cam.aspect });
    if (size === 'phone') { const ok = Math.abs(cam.ndc[0]) < 0.92 && Math.abs(cam.ndc[1]) < 0.92; (ok ? notes : failures).push(`phone glide in: the raft at ndc ${cam.ndc}`); }
    if (args.probe) {
      await shootWith(K, 'glide-in-nolights', 'lights');
      await shootWith(K, 'glide-in-nopool', 'pool');
      await shootWith(K, 'glide-in-norings', 'rings');
      await shootWith(K, 'glide-in-noobs', 'obs');
    }
    await K.secs(0.9);
    await K.shoot('glide-in-late');
    K.need((await K.until("c.debug.ui().openModal === 'chart'", 6)).ok, 'the chart beat');
    await K.secs(0.6);
    await K.settle(500);
    K.need(await click('[data-loop=chart] [data-action=sail]'), 'Sail');
    K.need((await K.until("c.flow === 'playing'", 8)).ok, 'the first trip');
    await K.secs(2.5);
    await K.settle(400);
    await K.shoot('water');
    // (a short moving-water capture: the same still water a half second and a second on)
    for (const n of ['water-b', 'water-c']) { await K.secs(0.5); await K.shoot(n); }
    if (args.probe) { log('LIGHTS water', JSON.stringify(await lights())); await shootWith(K, 'water-nolights', 'lights'); }
    const gate = await g(() => { const gi = window.__gw.world.getGate?.(); return gi?.position ? { x: gi.position.x, z: gi.position.z, r: gi.radius ?? 4.5 } : null; });
    if (gate) {
      const gd = Math.hypot(gate.x, gate.z) || 1, off = Math.min(2, 0.4 * gate.r);
      await g(([p]) => window.__gw.player.teleport({ x: p.x, z: p.z }, 0), [{ x: gate.x - (gate.x / gd) * off, z: gate.z - (gate.z / gd) * off }]);
      await K.secs(1.5);
      await K.settle(400);
      await K.shoot('gate');
    } else notes.push('no gate');
    const e = await g(() => window.__gw.errors.slice());
    if (e.length) failures.push(`${size}: ctx.errors ${JSON.stringify(e.slice(0, 4))}`);
  }

  try {
    const K = makeKit(api, { label: 'rules' });
    await walk(K, 'desk');
    failures.push(...K.failures); notes.push(...K.notes);
  } catch (e) { failures.push(`desk: ${e instanceof Abort ? e.message : String(e?.stack || e).split('\n').slice(0, 3).join(' | ')}`); }
  if (!args.nophone) {
    try {
      await page.setViewportSize({ width: 820, height: 900 });
      const K = makeKit({ ...api, width: 820, height: 900 }, { label: 'rules' });
      await walk(K, 'phone');
      failures.push(...K.failures); notes.push(...K.notes);
    } catch (e) { failures.push(`phone: ${e instanceof Abort ? e.message : String(e?.stack || e).split('\n').slice(0, 3).join(' | ')}`); }
  }
  log('POLISH_RULES', JSON.stringify({ failures, notes, frames }));
  // (the frames go back to the page's own clock: the harness's closing fps probe waits on requestAnimationFrame)
  await g(() => window.__lp?.release?.()).catch(() => {});
  return { failures };
}
