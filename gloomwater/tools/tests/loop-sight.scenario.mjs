// Silhouettes where they read (16 Nov 2026; the user: "You should be able to see the outline or silhouette of some fish under the lake
// ... The silhouette should be proportionate to the size of the fish"). A look round on the Mossmere under the loop, from the step-2 save:
// at dusk a carp, a Keeper perch at rest and then with the line out, and a pike at a reed edge, each spawned by the
// game's own rule (ctx.debug.sight with no point and force off: the who-is-there water, then placed where its true length reads through
// the live camera, in sight), at night shapes in the lantern's light, and the float at rest (its own water-white ripple). Every shape's
// drawn length is measured through the page's own camera (as fishing-fx draws it) and logged with its screen point (SIGHT_AT lines), so
// the frames can be cropped and judged. One run looks at the page's own size, then (--phone-too) again at 390x844 (the viewport resized;
// the camera, the lens and the rule follow the window). Every shape is placed once the watch has eased in (render-camera.js WATCH:
// the raft at rest on the Mossmere; WATCH lines log the lens).
//   node build.mjs --dev --out=tools/out/mvp-sight/dev.html
//   nice -n 10 node tools/playtest.mjs --html=tools/out/mvp-sight/dev.html --shots=tools/out/mvp-sight/look --script=tools/tests/loop-sight.scenario.mjs --width=960 --height=540 --phone-too
//   (or --mobile alone)
// Prints `LOOP_SIGHT {size, failures, notes}`.
import { makeKit3a, seededSave } from './loop-3a.scenario.mjs';
import { Abort } from './loop-1a.scenario.mjs';

// raft spots on the real layout with clear shallow margin water about them (tools/tests/fishing-wc2.test.mjs reads the same world)
const SPOTS = { margin: [-13, -41], margin2: [-46, -18], stones: [-45, -3], reeds: [-33, -38], reeds2: [-30, -36] };

export default async function (api) {
  const { page, evalGame: g, log, args } = api;
  page.setDefaultTimeout(300000);
  const K = makeKit3a(api, { label: 'sight' });
  /** The watch (render-camera.js WATCH): the lens eases in over the near water once the raft is at rest on the Mossmere; wait for it
   *  (and the rig's ease after it) before a shape is placed by the live camera. With the line out a landscape fish framing is unchanged. */
  const watchSettle = async () => {
    const w = (await K.until('(c.debug.camera?.()?.watch ?? 0) >= 0.99', 8))?.ok === true;
    await K.secs(1.6);
    const cam = await g(() => { const d = window.__gw.debug.camera?.(); return d ? { watch: d.watch, dist: d.cur.dist, fov: d.cur.fov, elev: d.cur.elev, mode: d.mode } : null; });
    log('WATCH', JSON.stringify(cam));
    if (!w) K.note('the watch did not ease in', cam);
    return cam;
  };
  const pose = async (p, sec = 1.6) => { await K.places.pose(p[0], p[1], 0); await K.secs(sec); await watchSettle(); };
  const sight = (id, o) => g(([id, o]) => window.__gw.debug.sight(id, o), [id, o]);
  const sights = () => g(() => window.__gw.debug.fishSights());
  const cancel = async () => { await g(() => { try { window.__gw.fishing.cancel?.('debug'); } catch { /* optional */ } }); await K.until("c.fishing.state === 'idle'", 8); };
  const clearAll = () => g(() => { const c = window.__gw; try { c.fishing.cancel?.('debug'); } catch { /* optional */ } for (const s of c.fishing.signs.slice()) s.ttl = 0; c.debug.sightClear?.(); });
  /** A shape on the screen: its centre, its drawn length (px) through the page's camera as fishing-fx draws it, and the mark here. */
  const measure = (id) => g((id) => {
    const c = window.__gw, f = c.debug.fishSights().find((q) => q.id === id);
    if (!f || !c.THREE?.Vector3 || !c.render?.camera) return null;
    const P = (x, z) => { const v = new c.THREE.Vector3(x, 0, z).project(c.render.camera); return [(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight]; };
    let hx = Math.sin(f.heading) * f.length / 2, hz = Math.cos(f.heading) * f.length / 2;
    // (fishing-fx's look into the water: the footprint eased out along the line of sight, as drawn)
    const cp = c.render.camera.position, tx = cp.x - f.x, ty = cp.y, tz = cp.z - f.z, hl = Math.hypot(tx, tz);
    const st = Math.min(2, Math.max(1, Math.pow(Math.hypot(hl, ty) / Math.max(ty, 1e-3), 0.75))), al = (hx * tx + hz * tz) / hl;
    hx += tx / hl * al * (st - 1); hz += tz / hl * al * (st - 1);
    const a = P(f.x - hx, f.z - hz), b = P(f.x + hx, f.z + hz), m = P(f.x, f.z);
    const raft = c.player?.position;
    return { id, sp: f.speciesId, cm: Math.round(f.length * 100), cx: Math.round(m[0]), cy: Math.round(m[1]), px: +Math.hypot(a[0] - b[0], a[1] - b[1]).toFixed(1),
      mark: innerWidth < innerHeight || Math.min(innerWidth, innerHeight) < 480 ? 24 : 30, d: raft ? +Math.hypot(f.x - raft.x, f.z - raft.z).toFixed(1) : null,
      area: f.area, depth: +f.depth.toFixed(2), vis: +f.vis.toFixed(2), alpha: +f.alpha.toFixed(2), mode: f.mode, screen: `${innerWidth}x${innerHeight}` };
  }, id);
  /** Spawn `id` by the game's rule (no point, force off); a few tries at each spot, each logged. */
  const natural = async (id, spots, o = {}) => {
    for (const s of spots) {
      if (s) await pose(SPOTS[s], 2.2);
      if (o.light) await K.places.light(o.light, 0.3);   // (the evening runs on under the look: its light set again before each try)
      for (let k = 0; k < 6; k++) {
        const f = await sight(id, { force: false, mode: o.mode || 'cruise', speed: o.speed ?? 0.3, life: 300, size: o.size ?? null });
        if (f) { log('spawned', id, 'at', s || 'here', JSON.stringify({ x: +f.x.toFixed(1), z: +f.z.toFixed(1), cm: Math.round(f.length * 100), area: f.area })); return f; }
      }
      K.note(`no ${id} (z ${o.size}) placed where it reads at ${s || 'here'}`);
    }
    return null;
  };
  const shotWith = async (name, ids) => {
    await K.shoot(name);
    for (const id of ids) { const m = await measure(id); log('SIGHT_AT', JSON.stringify({ shot: `${K.shotN}-${name}`, ...m })); }
  };
  let innerW = api.width, innerH = api.height;
  const round = async (tag) => {
    K.step(`${tag} dusk: a Keeper carp, by the game's own rule`);
    await clearAll();
    const carp = await natural('weeping_carp', ['margin', 'margin2', 'stones'], { size: 0.5, speed: 0.28, light: 'dusk' });
    K.check(!!carp, 'a carp placed where it reads', carp);
    await K.secs(2.6);
    if (carp) await shotWith(`${tag}-carp-dusk`, [carp.id]);

    K.step(`${tag} dusk: a Keeper perch at rest (the watch), then the line out and a Prize carp beside it`);
    await clearAll(); await K.secs(0.4);
    const perch = await natural('mossback_perch', ['margin', 'margin2', 'stones'], { size: 0.6, speed: 0.45, light: 'dusk' });
    K.check(!!perch, 'a Keeper perch placed where it reads', perch);
    await K.secs(2.4);
    if (perch) await shotWith(`${tag}-perch-at-rest`, [perch.id]);
    const rp = await g(() => { const p = window.__gw.player.position; return [p.x, p.z]; });
    await g(([x, z]) => window.__gw.debug.castAt(x, z), [rp[0] + 2.5, rp[1] - 7]);
    await K.until("c.fishing.state === 'waiting'", 8);
    await K.secs(1.6);   // (the lens eases to the fish framing)
    await watchSettle();
    const carp2 = await sight('weeping_carp', { force: false, mode: 'cruise', speed: 0.25, life: 300, size: 1.2 });
    await K.secs(2.4);
    const both = [perch?.id, carp2?.id].filter(Boolean);
    if (both.length) await shotWith(`${tag}-perch-and-carp`, both);
    // the float at rest, in the same frame's water: its own ripple, water-white and quiet
    const bob = await g(() => { const c = window.__gw, b = c.fishing.bobberPos; if (!b) return null; const v = new c.THREE.Vector3(b.x, b.y ?? 0, b.z).project(c.render.camera); return [Math.round((v.x + 1) / 2 * innerWidth), Math.round((1 - v.y) / 2 * innerHeight)]; });
    log('FLOAT_AT', JSON.stringify({ shot: `${K.shotN}-${tag}-perch-and-carp`, at: bob }));
    await cancel();

    K.step(`${tag} dusk: a pike at a reed edge, holding`);
    await clearAll(); await K.secs(0.4);
    const pike = await natural('reedjaw_pike', ['reeds', 'reeds2', 'margin'], { mode: 'hold', size: 0.6, light: 'dusk' });
    K.check(!!pike, 'a pike placed where it reads', pike);
    await K.secs(2.6);
    if (pike) await shotWith(`${tag}-pike-dusk`, [pike.id]);

    K.step(`${tag} night: shapes only in the lantern's light`);
    await clearAll(); await K.secs(0.4);
    const nc = await natural('weeping_carp', ['margin', 'margin2'], { size: 0.8, speed: 0.22, light: 'gloomtide' });
    const np = await sight('mossback_perch', { force: false, mode: 'cruise', speed: 0.4, life: 300, size: 1.4 });
    K.check(!!nc, 'a carp in the lantern\'s light', nc);
    await K.secs(2.6);
    const ids = [nc?.id, np?.id].filter(Boolean);
    if (ids.length) await shotWith(`${tag}-night-lantern`, ids);
    const ns = (await sights()).filter((q) => q.area !== 'buoy_lights');   // (over a drowned lamp a shape shows by the lamp's glow, §6.1)
    K.check(ns.every((q) => q.vis <= 0.75 + 1e-6), 'night: no shape in the lantern\'s light brighter than dusk\'s', ns.map((q) => +q.vis.toFixed(2)));
    const off = [];
    for (const q of await sights()) { const m = await measure(q.id); if (m && q.alpha > 0.5 && (m.cx < 0 || m.cy < 0 || m.cx > innerW || m.cy > innerH)) off.push(m); }
    K.check(off.length === 0, 'every shape alive is in view', off);
  };
  try {
    K.step('boot: the step-2 save, the Buoy Lights and the Lily Maze owned and lifted, Mire Worms fitted');
    const own = ['lily_maze', 'buoy_lights'];
    await K.boot(seededSave({ clams: 999, holdSlots: 6, own, lifted: own, over: { fitted: { lure: null, bait: 'mireworm' } } }));
    await g(() => { const L = window.__gw.state.meta.loop; L.bait = { ...(L.bait || {}), mossmere: { ...(L.bait?.mossmere || {}), mireworm: 40 } }; });
    await K.toJetty();
    await K.sail(null);
    await g(() => window.__gw.debug.fishSeed(20261116));
    await round(K.tag);
    if (args['phone-too']) {
      K.step('the same look on a phone held upright (390x844)');
      await page.setViewportSize({ width: 390, height: 844 });
      innerW = 390; innerH = 844;
      await K.settle(600);
      await K.secs(1.5);
      const size = await g(() => [innerWidth, innerHeight]);
      K.check(size[0] === 390 && size[1] === 844, 'the page is phone-sized', size);
      await round('phone');
    }
    await K.noErrors('the look');
  } catch (e) {
    if (e instanceof Abort) K.note('the look stopped', e.message);
    else K.check(false, 'the look threw', String(e?.stack || e).split('\n').slice(0, 4).join(' | '));
  }
  await K.release().catch(() => {});
  log('LOOP_SIGHT', JSON.stringify({ size: K.tag, failures: K.failures, notes: K.notes }));
  return { failures: K.failures };
}
