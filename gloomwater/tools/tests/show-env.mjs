// A fake game ctx around the real src/actors.js and src/models.js (no renderer), for the show's numeric tests. Not a test on
// its own (no .test.mjs suffix): tools/tests/show-poses.test.mjs uses it.
//
//   const env = await makeShowEnv();                                  // v3 phase-1 data, the default Wick, the play camera
//   env.show({ speciesId: 'reedjaw_pike', z: 2.4 });                  // ctx.debug.showPose
//   env.run(1.2);  env.info()                                         // step the game 1.2 s at 30 fps; ctx.debug.showPoseInfo()
//   env.camera({ dist: 2.1, elev: 10, yawDeg: 20 })                   // put the lens somewhere else (it looks at the Wick's chest)
import * as THREE from 'three';

globalThis.GW_DEBUG = true;
// models and toon paint canvas textures at creation: a canvas that swallows every call is enough in node
const sink = () => new Proxy(function () {}, { get: (t, k) => (k === 'data' ? new Uint8ClampedArray(4) : k === 'width' || k === 'height' ? 1 : k === Symbol.toPrimitive ? () => 0 : sink()), apply: () => sink(), set: () => true });
globalThis.Path2D = globalThis.Path2D || class { constructor() {} };
globalThis.document = globalThis.document || { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => sink(), toDataURL: () => '' }) };

export async function makeShowEnv({ phase = 1, character = 'wick', heading = 0, raftLevel = 0 } = {}) {
  globalThis.GW_V3 = true; globalThis.GW_V3_PHASE = phase;
  const data = await import(`../../src/data.js?show${phase}`);
  delete globalThis.GW_V3; delete globalThis.GW_V3_PHASE;
  const { createBus } = await import('../../src/core.js');
  const { create: createActors } = await import('../../src/actors.js');
  const { create: createModels } = await import('../../src/models.js');
  const bus = createBus(), events = [];
  const emit0 = bus.emit.bind(bus);
  bus.emit = (e, p = {}) => { events.push({ e, p, t: ctx.time.t }); emit0(e, p); };
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(46, 16 / 9, 0.1, 500);
  const ctx = {
    THREE, bus, data, flow: 'playing', paused: false, errors: [], debug: {}, isMobile: false, cinematic: false,
    state: { meta: { settings: {}, lastCharacter: character }, run: { character, zone: 'mossmere', upgrades: {}, creel: [] } },
    time: { dt: 1 / 30, t: 0, frame: 0 },
    render: { scene, camera, isStub: false },
    water: { isStub: false, getHeight: () => 0, splash() {}, addRipple() {} },
    player: { isStub: false, position: new THREE.Vector3(30, 0, 30), heading, velocity: new THREE.Vector3() },
    fishing: { isStub: false, state: 'idle', view: {} },
    survival: { isStub: true }, combat: { isStub: true },
  };
  const models = createModels(ctx); ctx.models = models;
  const actors = createActors(ctx); ctx.actors = actors;
  actors.init();
  actors.setCharacter(character); actors.setRaftLevel(raftLevel);
  const env = {
    ctx, data, actors, models, cam: camera, events, THREE,
    /** The lens: dist m from the Wick's chest along world yaw `yawDeg` (0 = +z), `elev` degrees above it. */
    camera({ dist = 9.3, elev = 38, yawDeg = 0, fov = 46, aim = null } = {}) {
      const w = actors.getWickPos(new THREE.Vector3()); w.y += 0.6;
      const a = aim ? new THREE.Vector3(aim.x, aim.y, aim.z) : w, y = yawDeg * Math.PI / 180, e = elev * Math.PI / 180;
      camera.position.set(a.x + Math.sin(y) * Math.cos(e) * dist, a.y + Math.sin(e) * dist, a.z + Math.cos(y) * Math.cos(e) * dist);
      camera.fov = fov; camera.up.set(0, 1, 0); camera.lookAt(a); camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
      return env;
    },
    /**
     * The presenting camera: SPEC §2.6's fit of actors.getShowFocus() (the pose's fov and elevation from AUTOFISH.show.camera, the
     * smallest distance that keeps every listed point inside the safe area), on the heading `yawDeg` (world, from the picture to
     * the lens). aspect < 1 is an upright phone. Returns {d, fov, elev} or null outside a show.
     */
    showCamera({ yawDeg = 0, aspect = 16 / 9 } = {}) {
      const f = actors.getShowFocus(); if (!f) return null;
      const A = data.AUTOFISH.show.camera, row = A.pose[f.id], portrait = aspect < 1;
      let fov = portrait ? row.fovPortrait : row.fov, elev = row.elev, yaw = yawDeg * Math.PI / 180;
      if (f.id === 'pinch' && f.fish.length < 0.15 && !portrait) fov = row.tinyFov || fov;
      if (f.id === 'alongside' && f.fish.length > (row.craneAbove || 4)) elev = row.craneElev || 40;
      if (f.id === 'alongside' && portrait && f.fish.length > (row.rakeAbove || 3.2)) { elev = row.craneElev || 40; yaw += (row.rake || 55) * Math.PI / 180 * (f.fish.axis.x * Math.cos(yaw) - f.fish.axis.z * Math.sin(yaw) >= 0 ? 1 : -1); }
      const e = elev * Math.PI / 180, m = portrait ? A.margin.portrait : A.margin.landscape, V = THREE.Vector3;
      const back = new V(Math.sin(yaw) * Math.cos(e), Math.sin(e), Math.cos(yaw) * Math.cos(e)), fwd = back.clone().negate();
      const right = new V(Math.cos(yaw), 0, -Math.sin(yaw)), up = new V().crossVectors(right, fwd).normalize();
      const pts = []; for (const k of row.keep) for (const p of (f.keep[k] || [])) pts.push(p);
      const tv = Math.tan(fov * Math.PI / 360), sx = tv * aspect * (1 - 2 * m), sy = tv * (1 - 2 * m);
      const P = pts.map((p) => ({ x: p.dot(right), y: p.dot(up), z: p.dot(fwd) })), zc = f.fish.center.dot(fwd);
      let cx = (Math.min(...P.map((p) => p.x)) + Math.max(...P.map((p) => p.x))) / 2, cy = (Math.min(...P.map((p) => p.y)) + Math.max(...P.map((p) => p.y))) / 2, d = 0;
      for (let pass = 0; pass < 3; pass++) {
        d = 0;
        for (const p of P) d = Math.max(d, Math.abs(p.x - cx) / sx - (p.z - zc), Math.abs(p.y - cy) / sy - (p.z - zc));
        d = Math.max(d, A.minLens + Math.max(...P.map((p) => zc - p.z)));
        const u = P.map((p) => ({ u: (p.x - cx) / (d + p.z - zc), v: (p.y - cy) / (d + p.z - zc) }));
        cx += (Math.min(...u.map((q) => q.u)) + Math.max(...u.map((q) => q.u))) / 2 * d; cy += (Math.min(...u.map((q) => q.v)) + Math.max(...u.map((q) => q.v))) / 2 * d;
      }
      const look = right.clone().multiplyScalar(cx).addScaledVector(up, cy).addScaledVector(fwd, zc), pos = look.clone().addScaledVector(back, d);
      if (pos.y < A.floor) pos.y = A.floor;
      camera.position.copy(pos); camera.fov = fov; camera.aspect = aspect; camera.up.set(0, 1, 0); camera.lookAt(look); camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
      return { d, fov, elev };
    },
    /** What the frame holds (S1): the fish's bent box and the Wick, as shares of the frame. */
    frame() {
      const px = (v) => { const p = v.clone().project(camera); return { x: p.x * 0.5 + 0.5, y: 0.5 - p.y * 0.5, z: p.z }; };
      const f = actors.getShowFocus(), H = ctx.debug.showPoseHull();
      if (!f || !H.length) return null;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const v of H) { const p = px(v); x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
      const feet = px(f.feet), fl = px(f.head.flame), hc = px(f.head.center);
      return { w: x1 - x0, h: y1 - y0, diag: Math.hypot((x1 - x0) * camera.aspect, y1 - y0) / Math.hypot(camera.aspect, 1), edge: Math.min(x0, y0, 1 - x1, 1 - y1), wick: Math.abs(feet.y - fl.y),
        headIn: hc.x > 0 && hc.x < 1 && hc.y > 0 && hc.y < 1, flameIn: fl.x > 0 && fl.x < 1 && fl.y > 0 && fl.y < 1 };
    },
    step(dt = 1 / 30) { ctx.time.dt = dt; ctx.time.t += dt; ctx.time.frame++; actors.update(dt, ctx.time.t); models.update(dt); scene.updateMatrixWorld(true); },
    run(sec, dt = 1 / 30) { const n = Math.max(1, Math.round(sec / dt)); for (let i = 0; i < n; i++) env.step(dt); return env; },
    show(o) { return ctx.debug.showPose(o); },
    info() { return ctx.debug.showPoseInfo(); },
    focus() { return actors.getShowFocus(); },
  };
  env.step();          // (the raft takes its place under the player before the lens is set)
  env.camera();
  env.run(0.5);
  return env;
}
