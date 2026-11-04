// water.js — GLOOMWATER lake surface, ripples, wakes, splashes (render author).
// CONTRACT §7 water. A camera-following grid recentred in grid-sized snaps (waves never
// swim), world-space swell that getHeight() reproduces exactly, and a stylised
// fragment shader (see water-shader.js). Splashes are a pooled Points system.
import * as THREE from 'three';
import { clamp, damp, rand } from './core.js';
import { WATER_VERT, WATER_FRAG, SPLASH_VERT, SPLASH_FRAG } from './water-shader.js';

const MAX_RIP = 32;
const MAX_WAKE = 32;
const MAX_OBS = 32;
const MAX_L = 6;
const WAKE_LIFE = 3.4;
const WAVE_PERIOD = 1200;            // s — every swell frequency is a multiple of 1/period
const GRID_SIZE = 340;               // m — covers a radius-85 arena from any camera spot
const GRID_SEGS = { low: 110, medium: 160, high: 200 };
const MAX_PARTICLES = 640;
const GRAVITY = -13;

// Swell: direction (deg), wavelength (m), amplitude (m), speed factor. Gentle cavern lake.
const SWELL = [
  { dir: 22, len: 24, amp: 0.085, speed: 0.55, phase: 0.0 },
  { dir: 158, len: 13.5, amp: 0.055, speed: 0.6, phase: 1.7 },
  { dir: 262, len: 8.7, amp: 0.034, speed: 0.62, phase: 4.1 },
  { dir: 74, len: 5.9, amp: 0.02, speed: 0.66, phase: 2.6 },
];

const isReal = (m) => !!m && !m.isStub;

export function create(ctx) {
  // ---------------------------------------------------------------- swell constants
  const waves = SWELL.map((w) => {
    const a = w.dir * Math.PI / 180;
    const k = (Math.PI * 2) / w.len;
    const omegaRaw = Math.sqrt(9.81 * k) * w.speed;
    const step = (Math.PI * 2) / WAVE_PERIOD;
    const omega = Math.max(1, Math.round(omegaRaw / step)) * step;   // loops seamlessly
    return { dx: Math.cos(a), dz: Math.sin(a), k, amp: w.amp, omega, phase: w.phase };
  });
  const waveA = new Float32Array(16);
  const waveB = new Float32Array(8);
  waves.forEach((w, i) => {
    waveA.set([w.dx, w.dz, w.k, w.amp], i * 4);
    waveB.set([w.omega, w.phase], i * 2);
  });
  const waveTime = () => ((ctx.time?.t || 0) % WAVE_PERIOD);

  // ---------------------------------------------------------------- material
  const rip = new Float32Array(MAX_RIP * 4);
  const wakeU = new Float32Array(MAX_WAKE * 4);
  const wakeD = new Float32Array(MAX_WAKE * 2);
  const obsU = new Float32Array(MAX_OBS * 3);
  const lpU = new Float32Array(MAX_L * 4);
  const lcU = new Float32Array(MAX_L * 4);

  const uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    uTime: { value: 0 },
    uWaveT: { value: 0 },
    uWaveA: { value: waveA },
    uWaveB: { value: waveB },
    uDeep: { value: new THREE.Color(0x080b12) },
    uShallow: { value: new THREE.Color(0x232b3a) },
    uFoam: { value: new THREE.Color(0xd6deee) },
    uGlow: { value: new THREE.Color(0xa9b9f0) },
    uSky: { value: new THREE.Color(0x262f40) },
    uArenaR: { value: 60 },
    uRip: { value: rip },
    uRipN: { value: 0 },
    uWake: { value: wakeU },
    uWakeD: { value: wakeD },
    uWakeN: { value: 0 },
    uWakeB: { value: new THREE.Vector3(0, 0, 0) },
    uObs: { value: obsU },
    uObsN: { value: 0 },
    uLP: { value: lpU },
    uLC: { value: lcU },
    uLN: { value: 0 },
    uRaft: { value: new THREE.Vector4(0, 0, 0, 0) },
    uDepthTex: { value: null },
    uDepthScale: { value: 1 / 140 },
    uDepthOn: { value: 0 },
  }]);
  // merge() clones values — re-point the typed arrays so writes land in the live uniforms
  uniforms.uWaveA.value = waveA; uniforms.uWaveB.value = waveB;
  uniforms.uRip.value = rip; uniforms.uWake.value = wakeU; uniforms.uWakeD.value = wakeD; uniforms.uObs.value = obsU;
  uniforms.uLP.value = lpU; uniforms.uLC.value = lcU;
  const U = uniforms;

  const material = new THREE.ShaderMaterial({
    name: 'GloomwaterWater',
    uniforms,
    vertexShader: WATER_VERT,
    fragmentShader: WATER_FRAG,
    defines: { MAX_RIP, MAX_WAKE, MAX_OBS, MAX_L },
    fog: true,
    lights: false,
  });

  let tier = 'high';
  let gridStep = GRID_SIZE / GRID_SEGS.high;
  function buildGeometry(name) {
    const segs = GRID_SEGS[name] || GRID_SEGS.medium;
    const geo = new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE, segs, segs);
    geo.rotateX(-Math.PI / 2);
    geo.deleteAttribute('normal');
    geo.deleteAttribute('uv');
    geo.computeBoundingSphere();
    gridStep = GRID_SIZE / segs;
    return geo;
  }
  const mesh = new THREE.Mesh(buildGeometry('high'), material);
  mesh.name = 'water';
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;          // opaque & big: draw early so it occludes cheaply
  mesh.matrixAutoUpdate = false;

  function setTier(name) {
    if (!GRID_SEGS[name] || name === tier) return;
    tier = name;
    const old = mesh.geometry;
    mesh.geometry = buildGeometry(name);
    old.dispose();
    const low = name === 'low';
    const d = material.defines;
    const want = low ? { MAX_RIP: 20, MAX_WAKE: 24, MAX_OBS: 32, MAX_L: 4 } : { MAX_RIP, MAX_WAKE, MAX_OBS, MAX_L };
    Object.assign(d, want);
    if (low) d.GW_LOW = 1; else delete d.GW_LOW;
    material.needsUpdate = true;
  }

  // ---------------------------------------------------------------- palette
  const palTgt = {
    deep: new THREE.Color(0x080b12), shallow: new THREE.Color(0x232b3a), foam: new THREE.Color(0xd6deee),
    glow: new THREE.Color(0xa9b9f0), fogColor: null,
  };
  const skyTgt = new THREE.Color();
  let fogColorAt = -999;
  function setColor(target, v) {
    if (v === undefined || v === null) return false;
    try { if (v.isColor) target.copy(v); else target.set(v); return true; } catch { return false; }
  }
  function setPalette(p = {}, opts = {}) {
    if (!p || typeof p !== 'object') return;
    setColor(palTgt.deep, p.deep ?? p.waterDeep);
    setColor(palTgt.shallow, p.shallow ?? p.water);
    setColor(palTgt.foam, p.foam);
    setColor(palTgt.glow, p.glow);
    // fogColor overrides the fresnel/mist tint for a few seconds (callers easing a palette keep
    // refreshing it); otherwise the water always tracks scene.fog so night fog never mismatches
    if (p.fogColor === null) palTgt.fogColor = null;
    else if (p.fogColor !== undefined) {
      palTgt.fogColor = palTgt.fogColor || new THREE.Color();
      if (!setColor(palTgt.fogColor, p.fogColor)) palTgt.fogColor = null;
      fogColorAt = ctx.time?.t || 0;
    }
    if (opts.instant) {
      U.uDeep.value.copy(palTgt.deep); U.uShallow.value.copy(palTgt.shallow);
      U.uFoam.value.copy(palTgt.foam); U.uGlow.value.copy(palTgt.glow);
      if (palTgt.fogColor) U.uSky.value.copy(palTgt.fogColor);
    }
  }

  // ---------------------------------------------------------------- ripples
  const rips = [];   // ring buffer of {x, z, t0, s}
  for (let i = 0; i < MAX_RIP; i++) rips.push({ x: 0, z: 0, t0: -999, s: 0 });
  let ripHead = 0;
  const nowT = () => (ctx.time?.t || 0) % 3600;
  function addRipple(x, z, strength = 1, delay = 0) {
    x = Number(x); z = Number(z);
    if (!isFinite(x) || !isFinite(z)) return;
    const s = clamp(Number(strength) || 1, 0.05, 3);
    const t = nowT() + Math.max(0, Number(delay) || 0);
    // recycle the oldest/finished slot
    let slot = ripHead;
    for (let i = 0; i < MAX_RIP; i++) {
      const r = rips[(ripHead + i) % MAX_RIP];
      if (t - r.t0 > 1.5 + r.s * 1.1) { slot = (ripHead + i) % MAX_RIP; break; }
    }
    const r = rips[slot];
    r.x = x; r.z = z; r.t0 = t; r.s = s;
    ripHead = (slot + 1) % MAX_RIP;
  }
  function packRipples(t) {
    let n = 0;
    const max = material.defines.MAX_RIP;
    for (let i = 0; i < MAX_RIP && n < max; i++) {
      const r = rips[i];
      const age = t - r.t0;
      if (age < -2 || age > 1.5 + r.s * 1.1) continue;
      rip[n * 4] = r.x; rip[n * 4 + 1] = r.z; rip[n * 4 + 2] = r.t0; rip[n * 4 + 3] = r.s;
      n++;
    }
    U.uRipN.value = n;
  }

  // ---------------------------------------------------------------- wakes
  const wakes = [];
  for (let i = 0; i < MAX_WAKE; i++) wakes.push({ x: 0, z: 0, t0: -999, dx: 0, dz: 1, s: 0 });
  let wakeHead = 0;
  let lastWake = null;
  let lastExternalWake = -999;
  function writeWake(x, z, dx, dz, s, t) {
    const w = wakes[wakeHead];
    w.x = x; w.z = z; w.t0 = t; w.dx = dx; w.dz = dz; w.s = s;
    wakeHead = (wakeHead + 1) % MAX_WAKE;
    lastWake = w;
  }
  function pushWake(x, z, dirX, dirZ, strength, t) {
    const l = Math.hypot(dirX, dirZ);
    if (l < 1e-4) return;
    const s = clamp(Number(strength) || 0, 0, 1);
    if (s < 0.02) return;
    const dx = dirX / l, dz = dirZ / l;
    if (lastWake) {
      const age = t - lastWake.t0;
      const dist = Math.hypot(x - lastWake.x, z - lastWake.z);
      if (age >= 0 && age < 0.3 && dist < 0.7) { lastWake.s = Math.max(lastWake.s, s); return; }
      // sparse callers: fill the gap so the trail stays one continuous brush stroke
      if (age >= 0 && age < 0.6 && dist > 0.95 && dist < 6) {
        const n = Math.min(4, Math.ceil(dist / 0.75) - 1);
        const x0 = lastWake.x, z0 = lastWake.z, t0 = lastWake.t0, s0 = lastWake.s;
        for (let i = 1; i <= n; i++) {
          const k = i / (n + 1);
          writeWake(x0 + (x - x0) * k, z0 + (z - z0) * k, dx, dz, s0 + (s - s0) * k, t0 + (t - t0) * k);
        }
      }
    }
    writeWake(x, z, dx, dz, s, t);
  }
  function addWake(x, z, dirX = 0, dirZ = 1, strength = 1) {
    x = Number(x); z = Number(z); dirX = Number(dirX); dirZ = Number(dirZ);
    if (!isFinite(x) || !isFinite(z) || !isFinite(dirX) || !isFinite(dirZ)) return;
    lastExternalWake = ctx.time?.t || 0;
    pushWake(x, z, dirX, dirZ, strength, nowT());
  }
  function packWakes(t) {
    let n = 0, cx = 0, cz = 0;
    const max = material.defines.MAX_WAKE;
    for (let i = 0; i < MAX_WAKE && n < max; i++) {
      const w = wakes[i];
      const age = t - w.t0;
      if (age < 0 || age > WAKE_LIFE) continue;
      wakeU[n * 4] = w.x; wakeU[n * 4 + 1] = w.z; wakeU[n * 4 + 2] = w.t0; wakeU[n * 4 + 3] = w.s;
      wakeD[n * 2] = w.dx; wakeD[n * 2 + 1] = w.dz;
      cx += w.x; cz += w.z; n++;
    }
    U.uWakeN.value = n;
    if (n) {
      cx /= n; cz /= n;
      let r = 0;
      for (let i = 0; i < n; i++) r = Math.max(r, Math.hypot(wakeU[i * 4] - cx, wakeU[i * 4 + 1] - cz));
      U.uWakeB.value.set(cx, cz, r + 6.5);
    }
  }

  // ---------------------------------------------------------------- obstacles
  let obstaclesDirty = true;
  let obstacleCheckAt = 0;
  let obstacleSrc = null, obstacleSrcLen = -1;
  let manualObstacles = null;
  const obsTmp = [];
  function packObstacles(list, px, pz) {
    obsTmp.length = 0;
    if (Array.isArray(list)) {
      for (const o of list) {
        if (!o) continue;
        const x = Number(o.x ?? o.position?.x), z = Number(o.z ?? o.position?.z), r = Number(o.r ?? o.radius);
        if (isFinite(x) && isFinite(z) && isFinite(r) && r > 0.2) obsTmp.push({ x, z, r, d: Math.hypot(x - px, z - pz) - r });
      }
    }
    if (obsTmp.length > MAX_OBS) obsTmp.sort((a, b) => a.d - b.d);
    const n = Math.min(MAX_OBS, obsTmp.length);
    for (let i = 0; i < n; i++) { obsU[i * 3] = obsTmp[i].x; obsU[i * 3 + 1] = obsTmp[i].z; obsU[i * 3 + 2] = obsTmp[i].r; }
    U.uObsN.value = n;
    return list?.length > MAX_OBS;
  }
  let obstaclesNeedNearest = false;
  function refreshObstacles(px, pz, force) {
    let list = manualObstacles;
    if (!list && isReal(ctx.world)) {
      try { list = ctx.world.getObstacles?.(); } catch { list = null; }
      if (list && list.isStub) list = null;
    }
    const changed = list !== obstacleSrc || (list?.length ?? -1) !== obstacleSrcLen;
    if (force || changed || obstaclesNeedNearest) {
      obstaclesNeedNearest = packObstacles(list, px, pz);
      obstacleSrc = list; obstacleSrcLen = list?.length ?? -1;
    }
    let r = Number(ctx.world?.bounds?.radius);
    if (!isFinite(r) || r <= 0) {
      const z = (ctx.data?.ZONES || []).find((q) => q.id === ctx.state?.run?.zone);
      r = z?.arena?.radius || 60;
    }
    U.uArenaR.value = r;
  }

  // ---------------------------------------------------------------- depth field
  // world.getDepth() baked into a small texture over the arena, a few rows per frame so a
  // zone change never hitches. Shallows read lighter, trenches and pools read as ink.
  const DEPTH_RES = 128;
  const depthData = new Uint8Array(DEPTH_RES * DEPTH_RES);
  const depthTex = new THREE.DataTexture(depthData, DEPTH_RES, DEPTH_RES, THREE.RedFormat, THREE.UnsignedByteType);
  depthTex.minFilter = depthTex.magFilter = THREE.LinearFilter;
  depthTex.wrapS = depthTex.wrapT = THREE.ClampToEdgeWrapping;
  depthTex.generateMipmaps = false;
  U.uDepthTex.value = depthTex;
  const depthJob = { row: -1, half: 70, wait: 0, again: 0 };
  function startDepthBake(delay = 0.05) { depthJob.row = 0; depthJob.wait = delay; }
  function stepDepthBake(dt) {
    if (depthJob.again > 0) { depthJob.again -= dt; if (depthJob.again <= 0) startDepthBake(0); }
    if (depthJob.row < 0) return;
    if (depthJob.wait > 0) { depthJob.wait -= dt; return; }
    const w = isReal(ctx.world) ? ctx.world : null;
    if (!w || typeof w.getDepth !== 'function') { depthJob.row = -1; U.uDepthOn.value = 0; return; }
    if (depthJob.row === 0) {
      depthJob.half = Math.max(20, (Number(U.uArenaR.value) || 60) + 8);
      U.uDepthScale.value = 1 / (2 * depthJob.half);
    }
    const S = depthJob.half;
    const end = Math.min(DEPTH_RES, depthJob.row + 24);
    try {
      for (let r = depthJob.row; r < end; r++) {
        const z = ((r + 0.5) / DEPTH_RES) * 2 * S - S;
        for (let c = 0; c < DEPTH_RES; c++) {
          const x = ((c + 0.5) / DEPTH_RES) * 2 * S - S;
          let d = Number(w.getDepth(x, z));
          if (!isFinite(d)) d = 1;
          depthData[r * DEPTH_RES + c] = Math.round(clamp(d, 0, 1) * 255);
        }
      }
    } catch (err) {
      depthJob.row = -1; U.uDepthOn.value = 0;
      console.warn('[water] depth bake failed', err);
      return;
    }
    depthJob.row = end;
    if (end >= DEPTH_RES) {
      depthJob.row = -1;
      depthTex.needsUpdate = true;
      U.uDepthOn.value = 1;
    }
  }

  // ---------------------------------------------------------------- lights
  let externalLights = null;
  let lightsSetAt = -999;
  const lightTmp = new THREE.Vector3();
  const colTmp = new THREE.Color();
  let merchantLight = null, merchantScanAt = -10, merchantScanObj = null;
  function setLights(list) {
    externalLights = Array.isArray(list) ? list : null;
    lightsSetAt = ctx.time?.t || 0;
  }
  function writeLight(n, x, y, z, color, intensity, radius, streak, ring) {
    if (n >= material.defines.MAX_L) return n;
    const inten = Number(intensity);
    if (!isFinite(inten) || inten <= 0.001) return n;
    if (!isFinite(x) || !isFinite(z)) return n;
    try { color?.isColor ? colTmp.copy(color) : colTmp.set(color ?? 0xffc070); } catch { colTmp.setRGB(1, 0.7, 0.4); }
    const k = 1 - Math.exp(-inten / 5);      // soft-saturating brightness from any intensity scale
    lpU[n * 4] = x; lpU[n * 4 + 1] = isFinite(y) ? y : 2; lpU[n * 4 + 2] = z;
    lpU[n * 4 + 3] = clamp(Number(radius) || 10, 1, 40);
    lcU[n * 4] = colTmp.r * k * 0.5; lcU[n * 4 + 1] = colTmp.g * k * 0.5; lcU[n * 4 + 2] = colTmp.b * k * 0.5;
    // w packs streak gain (integer part, ×100) and rim-ring strength (fraction)
    const sg = (typeof streak === 'number' && isFinite(streak) ? clamp(streak, 0, 4) : 1) * 2.4;
    lcU[n * 4 + 3] = Math.floor(sg * 100) + clamp(Number(ring) || 0, 0, 0.99);
    return n + 1;
  }
  function lanternReach() {
    const r = isReal(ctx.survival) ? Number(ctx.survival.lightRadius) : NaN;
    return isFinite(r) && r > 0.5 ? r : null;
  }
  function writeLightObject(n, L, streak, ring, radius) {
    if (!L || !L.isLight || L.visible === false) return n;
    L.getWorldPosition(lightTmp);
    const isLantern = isReal(ctx.actors) && L === ctx.actors.lanternLight;
    let r = Number(radius);
    if (!isFinite(r) || r <= 0) r = isLantern ? (lanternReach() ?? (L.distance > 0 ? L.distance * 0.75 : 9)) : (L.distance > 0 ? L.distance * 0.75 : 10);
    return writeLight(n, lightTmp.x, lightTmp.y, lightTmp.z, L.color, L.intensity, r, streak, ring ?? (isLantern ? 0.5 : 0));
  }
  function packLights(t) {
    let n = 0;
    const external = externalLights && t - lightsSetAt < 1.5;
    if (external) {
      for (const it of externalLights) {
        if (!it) continue;
        if (it.isLight) { n = writeLightObject(n, it, 1); continue; }
        if (it.light?.isLight) { n = writeLightObject(n, it.light, it.streak, it.ring, it.radius); continue; }
        const p = it.position;
        if (!p) continue;
        n = writeLight(n, Number(p.x), Number(p.y), Number(p.z), it.color, it.intensity ?? 1,
          it.radius ?? it.distance, it.streak, it.ring);
      }
    } else {
      // fallback until world feeds us: the lantern, and the merchant's lamp if we can find it
      const lantern = isReal(ctx.actors) ? ctx.actors.lanternLight : null;
      if (lantern?.isLight) n = writeLightObject(n, lantern, 1.2, 0.5);
      const m = isReal(ctx.actors) ? ctx.actors.merchant : null;
      if (m && m.present === true && m.object3d?.traverse) {
        if (merchantScanObj !== m.object3d || t - merchantScanAt > 3) {
          merchantScanAt = t; merchantScanObj = m.object3d; merchantLight = null;
          m.object3d.traverse((o) => { if (!merchantLight && o.isPointLight) merchantLight = o; });
        }
        if (merchantLight) n = writeLightObject(n, merchantLight, 0.8);
      }
    }
    U.uLN.value = n;
  }

  // ---------------------------------------------------------------- splashes (pooled Points)
  const pPos = new Float32Array(MAX_PARTICLES * 3);
  const pCol = new Float32Array(MAX_PARTICLES * 3);
  const pSize = new Float32Array(MAX_PARTICLES);
  const pAlpha = new Float32Array(MAX_PARTICLES);
  const pVel = new Float32Array(MAX_PARTICLES * 3);
  const pLife = new Float32Array(MAX_PARTICLES);
  const pMax = new Float32Array(MAX_PARTICLES);
  const pBase = new Float32Array(MAX_PARTICLES);
  const pFlag = new Uint8Array(MAX_PARTICLES);     // 1 = drip: ripples on impact
  let live = 0;
  const pGeo = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(pPos, 3).setUsage(THREE.DynamicDrawUsage);
  const colAttr = new THREE.BufferAttribute(pCol, 3).setUsage(THREE.DynamicDrawUsage);
  const sizeAttr = new THREE.BufferAttribute(pSize, 1).setUsage(THREE.DynamicDrawUsage);
  const alphaAttr = new THREE.BufferAttribute(pAlpha, 1).setUsage(THREE.DynamicDrawUsage);
  pGeo.setAttribute('position', posAttr);
  pGeo.setAttribute('aColor', colAttr);
  pGeo.setAttribute('aSize', sizeAttr);
  pGeo.setAttribute('aAlpha', alphaAttr);
  pGeo.setDrawRange(0, 0);
  const pMat = new THREE.ShaderMaterial({
    name: 'GloomwaterSplash',
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uViewH: { value: 720 } }]),
    vertexShader: SPLASH_VERT,
    fragmentShader: SPLASH_FRAG,
    transparent: true,
    depthWrite: false,
    fog: true,
  });
  const points = new THREE.Points(pGeo, pMat);
  points.name = 'water-splashes';
  points.frustumCulled = false;
  points.renderOrder = 5;
  const splashCol = new THREE.Color();
  const litCol = new THREE.Color();
  /** Approximate light-pool colour at (x, z) from the packed light uniforms. */
  function lightAt(x, z, out) {
    out.setRGB(0, 0, 0);
    const n = U.uLN.value;
    for (let i = 0; i < n; i++) {
      const dx = x - lpU[i * 4], dz = z - lpU[i * 4 + 2], h = Math.max(lpU[i * 4 + 1], 0.35), R = lpU[i * 4 + 3];
      const d2 = dx * dx + dz * dz;
      if (d2 > R * R) continue;
      const att = (h * h) / (d2 + h * h) * (1 - Math.sqrt(d2) / R);
      out.r += lcU[i * 4] * att * 2.2; out.g += lcU[i * 4 + 1] * att * 2.2; out.b += lcU[i * 4 + 2] * att * 2.2;
    }
    return out;
  }
  const drawSize = new THREE.Vector2();

  function spawnParticle(x, y, z, vx, vy, vz, size, life, color, bright, flag) {
    if (live >= MAX_PARTICLES) return;
    const i = live++;
    pPos[i * 3] = x; pPos[i * 3 + 1] = y; pPos[i * 3 + 2] = z;
    pVel[i * 3] = vx; pVel[i * 3 + 1] = vy; pVel[i * 3 + 2] = vz;
    pCol[i * 3] = color.r * bright; pCol[i * 3 + 1] = color.g * bright; pCol[i * 3 + 2] = color.b * bright;
    pSize[i] = size; pLife[i] = 0; pMax[i] = life; pBase[i] = 1; pAlpha[i] = 1; pFlag[i] = flag || 0;
  }
  function killParticle(i) {
    const j = --live;
    if (i === j) return;
    pPos[i * 3] = pPos[j * 3]; pPos[i * 3 + 1] = pPos[j * 3 + 1]; pPos[i * 3 + 2] = pPos[j * 3 + 2];
    pVel[i * 3] = pVel[j * 3]; pVel[i * 3 + 1] = pVel[j * 3 + 1]; pVel[i * 3 + 2] = pVel[j * 3 + 2];
    pCol[i * 3] = pCol[j * 3]; pCol[i * 3 + 1] = pCol[j * 3 + 1]; pCol[i * 3 + 2] = pCol[j * 3 + 2];
    pSize[i] = pSize[j]; pLife[i] = pLife[j]; pMax[i] = pMax[j]; pBase[i] = pBase[j]; pAlpha[i] = pAlpha[j]; pFlag[i] = pFlag[j];
  }

  function splash(x, z, opts = {}) {
    x = Number(x); z = Number(z);
    if (!isFinite(x) || !isFinite(z)) return;
    const size = clamp(Number(opts.size) || 1, 0.1, 4);
    const count = Math.round(clamp(Number(opts.count) || 14 + size * 20, 1, 160));
    if (opts.color !== undefined && opts.color !== null) {
      try { opts.color.isColor ? splashCol.copy(opts.color) : splashCol.set(opts.color); } catch { splashCol.copy(U.uFoam.value); }
    } else splashCol.copy(U.uFoam.value);
    const y0 = api.getHeight(x, z);
    const sq = Math.sqrt(size);
    // droplets catch the nearby lights: pale ink in the dark, warm sparks in the lantern's pool
    lightAt(x, z, litCol);
    splashCol.multiplyScalar(0.32).add(litCol);
    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2;
      const crown = rand() < 0.7;      // a ring crown, plus a central column
      const lat = crown ? (0.8 + rand() * 1.5) * sq : rand() * 0.45 * sq;
      const up = crown ? (2.0 + rand() * 2.4) * sq : (3.4 + rand() * 3.4) * sq;
      const r0 = crown ? 0.18 * sq : 0.05;
      spawnParticle(
        x + Math.cos(a) * r0, y0 + 0.05, z + Math.sin(a) * r0,
        Math.cos(a) * lat, up, Math.sin(a) * lat,
        (0.035 + rand() * 0.055) * (0.75 + sq * 0.3), 0.6 + rand() * 0.6, splashCol, 0.6 + rand() * 0.8, 0,
      );
    }
    addRipple(x, z, size);
    if (size > 0.6) addRipple(x, z, size * 0.6, 0.18);
    if (size > 1.6) addRipple(x, z, size * 0.4, 0.42);
  }

  function updateParticles(dt) {
    if (!live) { pGeo.setDrawRange(0, 0); return; }
    for (let i = live - 1; i >= 0; i--) {
      pLife[i] += dt;
      const k = pLife[i] / pMax[i];
      pVel[i * 3 + 1] += GRAVITY * dt;
      const drag = 1 - Math.min(1, 0.6 * dt);
      pVel[i * 3] *= drag; pVel[i * 3 + 2] *= drag;
      pPos[i * 3] += pVel[i * 3] * dt;
      pPos[i * 3 + 1] += pVel[i * 3 + 1] * dt;
      pPos[i * 3 + 2] += pVel[i * 3 + 2] * dt;
      const x = pPos[i * 3], y = pPos[i * 3 + 1], z = pPos[i * 3 + 2];
      const falling = pVel[i * 3 + 1] < 0;
      const h = falling ? api.getHeight(x, z) : -10;
      if (k >= 1 || (falling && y <= h)) {
        if (pFlag[i] === 1 && y <= h + 0.2) {
          addRipple(x, z, 0.32);
          const c = U.uFoam.value;
          for (let j = 0; j < 3; j++) {
            const a = rand() * Math.PI * 2;
            spawnParticle(x, h + 0.02, z, Math.cos(a) * 0.5, 1.4 + rand() * 1.2, Math.sin(a) * 0.5, 0.045, 0.35, c, 0.6, 0);
          }
        }
        killParticle(i);
        continue;
      }
      pAlpha[i] = pFlag[i] === 1 ? 0.75 : (1 - k * k);
    }
    pGeo.setDrawRange(0, live);
    posAttr.needsUpdate = true; colAttr.needsUpdate = true; sizeAttr.needsUpdate = true; alphaAttr.needsUpdate = true;
  }

  // ---------------------------------------------------------------- ambience: drips & rising fish
  let nextDrip = 2, nextPlip = 3.5;
  function ambience(dt, px, pz) {
    if (!isReal(ctx.render)) return;
    nextDrip -= dt; nextPlip -= dt;
    const cam = ctx.render.camera;
    // bias toward what the camera sees (ahead of it, roughly around the focus)
    const yaw = Number(ctx.render.getYaw?.()) || 0;
    const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
    if (nextDrip <= 0) {
      nextDrip = 0.9 + rand() * 2.6;
      const d = 4 + rand() * 18, a = (rand() - 0.5) * 2.4;
      const x = px + (fx * Math.cos(a) - fz * Math.sin(a)) * d;
      const z = pz + (fz * Math.cos(a) + fx * Math.sin(a)) * d;
      if (!isOpen(x, z)) return;
      const y = 6 + rand() * 5;
      spawnParticle(x, y, z, 0, -3, 0, 0.05, 4, U.uFoam.value, 0.9, 1);
    }
    if (nextPlip <= 0) {
      nextPlip = 1.6 + rand() * 3.5;
      const d = 8 + rand() * 26, a = rand() * Math.PI * 2;
      const x = px + Math.cos(a) * d, z = pz + Math.sin(a) * d;
      if (cam && isOpen(x, z)) addRipple(x, z, 0.35 + rand() * 0.35);
    }
  }
  function isOpen(x, z) {
    if (!isReal(ctx.world) || !ctx.world.isOpenWater) return Math.hypot(x, z) < U.uArenaR.value - 2;
    try { return ctx.world.isOpenWater(x, z, 0.5) === true; } catch { return true; }
  }

  // ---------------------------------------------------------------- zone defaults
  function applyZonePalette(zoneId, instant) {
    const z = (ctx.data?.ZONES || []).find((q) => q.id === zoneId);
    const p = z?.palette;
    if (!p) return;
    setPalette({ deep: p.waterDeep, shallow: p.water, foam: p.foam, glow: p.glow }, { instant });
  }

  const center = new THREE.Vector3();
  const camFwd = new THREE.Vector3();

  const api = {
    mesh, points, material,
    init() {
      const scene = ctx.render?.scene;
      if (scene && !ctx.render.isStub) { scene.add(mesh); scene.add(points); }
      applyZonePalette(ctx.state?.run?.zone || ctx.data?.ZONES?.[0]?.id, true);
      startDepthBake(0.2);
      ctx.bus?.on('zone:change', (e) => {
        try {
          applyZonePalette(e?.zone, !e?.prev);
          obstaclesDirty = true;
          manualObstacles = null;
          startDepthBake(0.05);
          depthJob.again = 1.5;   // re-bake once more in case the world builds lazily
          // the old lake's rings and trails do not follow us down
          for (const r of rips) r.t0 = -999;
          for (const w of wakes) w.t0 = -999;
          lastWake = null;
          live = 0;
        } catch (err) { console.error('[water] zone:change', err); }
      });
    },

    update(dt) {
      dt = Math.min(Math.max(Number(dt) || 0, 0), 0.1);
      const t = nowT();
      U.uTime.value = t;
      U.uWaveT.value = waveTime();

      const q = ctx.render?.quality;
      if (typeof q === 'string') setTier(q);

      // recentre the grid ahead of the camera, snapped to whole cells
      const cam = ctx.render?.camera;
      if (cam) {
        cam.getWorldDirection(camFwd);
        camFwd.y = 0;
        if (camFwd.lengthSq() < 1e-6) camFwd.set(0, 0, -1);
        camFwd.normalize();
        center.set(cam.position.x + camFwd.x * 50, 0, cam.position.z + camFwd.z * 50);
        mesh.position.set(Math.round(center.x / gridStep) * gridStep, 0, Math.round(center.z / gridStep) * gridStep);
        mesh.updateMatrix();
        mesh.updateMatrixWorld(true);
      }

      // palette easing
      const a = 1 - Math.exp(-1.4 * dt);
      U.uDeep.value.lerp(palTgt.deep, a);
      U.uShallow.value.lerp(palTgt.shallow, a);
      U.uFoam.value.lerp(palTgt.foam, a);
      U.uGlow.value.lerp(palTgt.glow, a);
      const fog = ctx.render?.scene?.fog;
      const override = palTgt.fogColor && (ctx.time?.t || 0) - fogColorAt < 3;
      if (override) skyTgt.copy(palTgt.fogColor);
      else if (fog) skyTgt.copy(fog.color);
      U.uSky.value.lerp(skyTgt, override ? a : Math.max(a, 0.25));

      // player-relative bits
      const pl = isReal(ctx.player) ? ctx.player : null;
      const pp = pl?.position && typeof pl.position.x === 'number' ? pl.position : null;
      const px = pp ? pp.x : 0, pz = pp ? pp.z : 0;
      const realT = ctx.time?.t || 0;
      if (pp && ctx.state?.run && ctx.flow === 'playing') {
        const v = pl.velocity;
        const sp = v && typeof v.x === 'number' ? Math.hypot(v.x, v.z) : 0;
        U.uRaft.value.set(px, pz, 1.55, clamp(sp / 6, 0, 1));
        // fallback wake until the player module feeds addWake itself
        if (realT - lastExternalWake > 1 && sp > 0.6 && (ctx.time?.gameDt || 0) > 0) {
          const nx = v.x / sp, nz = v.z / sp;
          pushWake(px - nx * 1.5, pz - nz * 1.5, nx, nz, clamp(sp / 6, 0.15, 1), t);
        }
      } else {
        U.uRaft.value.set(px, pz, 0, 0);
      }

      if (obstaclesDirty || realT > obstacleCheckAt) {
        refreshObstacles(px, pz, obstaclesDirty);
        obstaclesDirty = false;
        obstacleCheckAt = realT + 0.5;
      }

      stepDepthBake(dt);
      packRipples(t);
      packWakes(t);
      packLights(realT);
      if (ctx.flow === 'playing' || ctx.flow === 'title') ambience(dt, px, pz);
      updateParticles(dt);

      const r = ctx.render?.renderer;
      if (r) { r.getDrawingBufferSize(drawSize); pMat.uniforms.uViewH.value = drawSize.y; }
    },

    /** Swell height at world (x, z) — identical to the vertex shader's displacement. */
    getHeight(x, z) {
      const t = waveTime();
      let h = 0;
      for (let i = 0; i < 4; i++) {
        const w = waves[i];
        h += w.amp * Math.sin(w.k * (w.dx * x + w.dz * z) + w.omega * t + w.phase);
      }
      return h;
    },
    /** Surface normal of the swell at (x, z) (extra; handy for tilting floating things). */
    getNormal(x, z, out = new THREE.Vector3()) {
      const t = waveTime();
      let gx = 0, gz = 0;
      for (let i = 0; i < 4; i++) {
        const w = waves[i];
        const c = w.amp * w.k * Math.cos(w.k * (w.dx * x + w.dz * z) + w.omega * t + w.phase);
        gx += c * w.dx; gz += c * w.dz;
      }
      return out.set(-gx, 1, -gz).normalize();
    },
    addRipple,
    addWake,
    splash,
    setPalette,
    setLights,
    /** Optional override of the foam circles (default: world.getObstacles()). null = back to world. */
    setObstacles(list) { manualObstacles = Array.isArray(list) ? list : null; obstaclesDirty = true; },
    /** Drip from the cavern roof at (x, z) (extra): a falling droplet that rings on impact. */
    drip(x, z, height = 8) { spawnParticle(Number(x) || 0, Number(height) || 8, Number(z) || 0, 0, -3, 0, 0.05, 4, U.uFoam.value, 0.9, 1); },
  };
  return api;
}
