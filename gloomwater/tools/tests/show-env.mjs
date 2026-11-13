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
    ctx, data, actors, models, camera, events, THREE,
    /** The lens: dist m from the Wick's chest along world yaw `yawDeg` (0 = +z), `elev` degrees above it. */
    camera({ dist = 9.3, elev = 38, yawDeg = 0, fov = 46, aim = null } = {}) {
      const w = actors.getWickPos(new THREE.Vector3()); w.y += 0.6;
      const a = aim ? new THREE.Vector3(aim.x, aim.y, aim.z) : w, y = yawDeg * Math.PI / 180, e = elev * Math.PI / 180;
      camera.position.set(a.x + Math.sin(y) * Math.cos(e) * dist, a.y + Math.sin(e) * dist, a.z + Math.cos(y) * Math.cos(e) * dist);
      camera.fov = fov; camera.up.set(0, 1, 0); camera.lookAt(a); camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
      return env;
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
