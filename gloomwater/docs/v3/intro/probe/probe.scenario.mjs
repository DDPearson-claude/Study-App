// Lead's probe (untracked): camera poses for the intro spec, with a placeholder great lantern.
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
export default async function (api) {
  const { page, wait, evalGame: g, log, args, width, height } = api;
  page.setDefaultTimeout(300000);
  const shotsDir = resolve(process.cwd(), String(args.shots || 'tools/out/intro/probe'));
  mkdirSync(shotsDir, { recursive: true });
  const quality = typeof args.quality === 'string' ? args.quality : (width < height ? 'medium' : 'high');
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title', null, { timeout: 300000 });
  await g(() => window.__gw.game.wipeAll());
  await page.goto(page.url().split('?')[0] + '?v3=1&v3phase=1', { waitUntil: 'load', timeout: 300000 });
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title' && !document.getElementById('loader'), null, { timeout: 300000, polling: 500 });
  const info = await g(({ quality }) => {
    const c = window.__gw, T = c.THREE;
    c.state.meta.settings = c.state.meta.settings || {}; c.state.meta.settings.quality = quality;
    c.render.setQuality(quality);
    const C = (window.__pr = { cam: null });
    const raf = window.requestAnimationFrame.bind(window);
    let held = null;
    window.requestAnimationFrame = (cb) => { if (held) { held.push(cb); return 0; } return raf(cb); };
    C.hold = () => { held = held || []; };
    C.release = () => { const q = held || []; held = null; for (const cb of q) raf(cb); };
    const ru = c.render.update;
    c.render.update = (dt, t) => { ru(dt, t); C.applyCam(); };
    C.applyCam = () => {
      const k = C.cam; if (!k) return;
      const cam = c.render.camera;
      cam.position.set(...k.pos); cam.up.set(0, 1, 0); cam.lookAt(...k.look);
      if (k.fov && Math.abs(cam.fov - k.fov) > 1e-3) { cam.fov = k.fov; cam.updateProjectionMatrix(); }
      cam.updateMatrixWorld();
    };
    C.pump = (sec) => {
      const order = ['actors', 'models', 'world', 'water', 'render'];
      let t = c.time.t;
      for (let i = 0, n = Math.max(1, Math.round(sec / 0.05)); i < n; i++) {
        t += 0.05; c.time.t = t; c.time.dt = 0.05;
        for (const name of order) { const m = c[name]; if (!m || m.isStub || typeof m.update !== 'function') continue; try { m.update(0.05, t); } catch (e) { /* keep */ } }
      }
    };
    C.hideUi = () => { const s = document.createElement('style'); s.textContent = '#ui { opacity: 0 !important; }'; document.head.appendChild(s); };
    C.render = () => { c.render.render(); return c.render.renderer.domElement.toDataURL('image/png'); };
    // the Sunken Gate's place (world-art.js: at(ga, 16))
    const gate = c.world.getGate().position;
    const ga = Math.hypot(gate.x, gate.z) < c.world.bounds.radius * 0.2 ? -Math.PI / 2 : Math.atan2(gate.z, gate.x);
    const r = c.world.getShoreRadius(ga) + 16;
    const hx = Math.cos(ga) * r, hz = Math.sin(ga) * r;
    // placeholder great lantern + windows
    const grp = new T.Group(); grp.name = 'probe';
    const body = new T.Mesh(new T.CylinderGeometry(2.2, 2.6, 5.5, 8), new T.MeshBasicMaterial({ color: new T.Color(0xed9e3b).multiplyScalar(2.6), toneMapped: false, fog: true }));
    const cap = new T.Mesh(new T.ConeGeometry(3.2, 2.2, 8), new T.MeshBasicMaterial({ color: 0x0a0818, fog: true }));
    cap.position.y = 3.8;
    const base = new T.Mesh(new T.CylinderGeometry(2.8, 2.0, 0.8, 8), new T.MeshBasicMaterial({ color: 0x0a0818, fog: true }));
    base.position.y = -3.1;
    const halo = new T.Sprite(new T.SpriteMaterial({ map: (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d'); const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128); return new T.CanvasTexture(cv); })(), color: 0xed9e3b, transparent: true, opacity: 0.55, blending: T.AdditiveBlending, depthWrite: false, fog: true }));
    halo.scale.setScalar(26);
    const lan = new T.Group(); lan.add(body, cap, base, halo);
    grp.add(lan);
    // windows: 3 columns x 9 rows per tower
    const wg = new T.BoxGeometry(0.8, 1.8, 0.4), wm = new T.MeshBasicMaterial({ color: new T.Color(0xed9e3b).multiplyScalar(2.0), toneMapped: false, fog: true });
    const wins = new T.InstancedMesh(wg, wm, 2 * 3 * 9); let wi = 0; const M4 = new T.Matrix4();
    for (const sd of [-1, 1]) for (let col = -1; col <= 1; col++) for (let row = 0; row < 9; row++) {
      const y = 4 + row * 3.4, rr = 5.2 - (y / 38) * 1.0 + 0.2;
      M4.makeTranslation(hx + sd * 13 + col * 2.0, y, hz + rr - Math.abs(col) * 0.5); wins.setMatrixAt(wi++, M4);
    }
    grp.add(wins);
    grp.traverse((o) => o.layers.enable(1));
    c.render.scene.add(grp);
    C.lan = (x, y, z, on = true) => { lan.position.set(hx + x, y, hz + z); grp.visible = on; };
    C.lan(0, 20, 0, false);
    const sp = c.world.getSpawn().position;
    return { hero: [hx, hz], gate: [gate.x, gate.z], R: c.world.bounds.radius, spawn: [sp.x, sp.z], player: [c.player.position.x, c.player.position.z], tier: c.render.quality, refl: c.water.reflection };
  }, { quality });
  log('info ' + JSON.stringify(info));
  const [hx, hz] = info.hero, [sx, sz] = info.spawn;
  const only = typeof args.only === 'string' ? args.only.split(',') : null;
  const phone = width < height;
  const F = phone ? [
    ['m01-far46-then', { pos: [sx, 2.2, sz - 12], look: [hx, 2.5, hz], fov: 46 }, [0, 20, 47.6]],
    ['m02-far62-then', { pos: [sx, 2.2, sz - 12], look: [hx, 4.0, hz], fov: 62 }, [0, 20, 47.6]],
    ['m03-far62-fall', { pos: [sx, 2.2, sz - 12], look: [hx, 4.0, hz], fov: 62 }, [0, 5, 47.6]],
    ['m04-shoulder', { pos: [sx + 1.5, 2.6, sz + 5.4], look: [sx - 0.2, 3.4, sz - 30], fov: 52 }, null],
  ] : [
    ['d01-far46-over-lake', { pos: [sx, 2.2, sz - 12], look: [hx, 2.5, hz], fov: 46 }, [0, 20, 47.6]],
    ['d02-far46-fall', { pos: [sx, 2.2, sz - 12], look: [hx, 2.5, hz], fov: 46 }, [0, 6, 47.6]],
    ['d03-far40-over-lake', { pos: [sx, 2.0, sz - 20], look: [hx, 4.5, hz], fov: 40 }, [0, 22, 47.6]],
  ];

  await g(() => { window.__pr.hideUi(); window.__pr.hold(); });
  await wait(600);
  for (const [name, cam, lan] of F) {
    if (only && !only.some((o) => name.includes(o))) continue;
    const url = await g(({ cam, lan }) => {
      const C = window.__pr; C.cam = cam;
      if (lan) C.lan(lan[0], lan[1], lan[2], true); else C.lan(0, 20, 0, false);
      C.pump(1.5);
      return C.render();
    }, { cam, lan });
    writeFileSync(resolve(shotsDir, `${name}.png`), Buffer.from(url.split(',')[1], 'base64'));
    const st = await g(() => { const c = window.__gw, cam = c.render.camera; return { pos: [cam.position.x, cam.position.y, cam.position.z].map((x) => +x.toFixed(1)), fov: cam.fov, calls: c.render.renderer.info.render.calls, tris: c.render.renderer.info.render.triangles, refl: c.water.reflection }; });
    log(`${name} ${JSON.stringify(st)}`);
  }
  await g(() => window.__pr.release());
  return { failures: [] };
}
