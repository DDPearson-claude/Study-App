// world-art.js — builds one zone's lake arena visuals from a layout (world author).
// Static geometry is merged per material (rock / organic / glow) with ink outlines;
// repeats are instanced; atmosphere (rings, vault, shafts, mist, particles, halos)
// lives in shaders. Everything created here is tracked in a bin and disposed on swap.
import * as THREE from 'three';
import { glowMaterial, INK } from './toon.js';
import { makeRng } from './core.js';
import { TAU, prep, merge, mat, rockGeo, taperTube, latheGeo, crystalGeo, wobble, lin, mixArr, scaleArr, fbm3, vnoise3, makeRingNoise, ringNoise } from './world-geo.js';
import { inkToon, outlineMat, ringMaterial, domeMaterial, createParticles, createHalos, createShafts, mistMaterial, vortexMaterial, columnMaterial, createSpiral, createShoreRings, createMistSheets } from './world-fx.js';
import { paintRing } from './world-paint.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);

// Per-theme material colours (linear arrays built at runtime from hex).
const KIT = {
  mossmere: { rock: 0x182222, rockHi: 0x2a3835, moss: 0x2b4a35, mossHi: 0x4d7650, wood: 0x2e241b, woodHi: 0x4a3a2a, stone: 0x3b4845, iron: 0x121616, bone: 0x8f9a86, organic: 0x2f4a33 },
  sporewood: { rock: 0x221824, rockHi: 0x3c2a3e, moss: 0x4a2c4e, mossHi: 0x7a4a72, wood: 0x2a1c22, stone: 0x4a3a4c, iron: 0x140e14, bone: 0xb9a2a6, organic: 0x9a8794, cap: 0x3c2242, capHi: 0x6a3a5c },
  glasswater: { rock: 0x11152a, rockHi: 0x1f2542, moss: 0x262f58, mossHi: 0x3c4a82, wood: 0x1c1d2c, stone: 0x404a70, iron: 0x0c0e1a, bone: 0x8a96c0, organic: 0x2a3466 },
  paleabyss: { rock: 0x191815, rockHi: 0x2c2a25, moss: 0x48443a, mossHi: 0x8a8370, wood: 0x231f1a, stone: 0x5a564c, iron: 0x111010, bone: 0xd9d0bb, organic: 0xcfc6ae },
};

export function domeY(L, r) {
  const A = L.domeA, B = L.domeB;
  const q = Math.min(1, Math.abs(r) / A);
  return L.domeY0 + B * Math.pow(Math.max(0, 1 - q * q * q * q), 0.25);
}

/**
 * Build the visual arena. opts: { quality: 'low'|'medium'|'high', far: camera far plane }
 * Returns { group, update(dt,t,focus,env), applyMood(env), setGate(state, instant), anchors, dispose() }
 */
export function buildArena(ctx, L, opts = {}) {
  const zone = L.zone || {};
  const pal = Object.assign({ fog: 0x1a3436, fogDensity: 0.016, water: 0x1f3d3b, waterDeep: 0x081719, foam: 0xbfe3d4, glow: 0x6ff5c8, accent: 0xd6f59a, ambient: 0x3d6662, ink: 0x050c0d, far: 0x5a9488, light: 0xcff7e6 }, zone.palette || {});
  const theme = L.theme;
  const K = {}; for (const [k, v] of Object.entries(KIT[theme] || KIT.mossmere)) K[k] = lin(v);
  const PL = {}; for (const [k, v] of Object.entries(pal)) if (typeof v === 'number' && k !== 'fogDensity') PL[k] = lin(v);
  const quality = opts.quality || 'high';
  const low = quality === 'low';
  const rng = makeRng(L.artSeed);
  const R = L.R;

  // ---------------------------------------------------------- bin (disposal tracking)
  const bin = { geos: new Set(), mats: new Set(), texs: new Set() };
  const G = (g) => { if (g) bin.geos.add(g); return g; };
  const M = (m) => { if (m) bin.mats.add(m); return m; };
  const T = (t) => { if (t) bin.texs.add(t); return t; };

  const group = new THREE.Group();
  group.name = 'arena:' + (zone.id || theme);
  const prof = {}; let pt = performance.now();
  const mark = (k) => { const n = performance.now(); prof[k] = Math.round(n - pt); pt = n; };

  // vault geometry (superellipse dome) scaled to fit inside the camera far plane
  const farPlane = opts.far || 500;
  const want = R + 205;
  const fit = Math.max(0.55, Math.min(1, (farPlane * 0.86 - R - 15) / want));
  L.domeA = want * fit; L.domeB = 105; L.domeY0 = -8;
  L.ringScale = fit;

  const halos = createHalos(low ? 260 : 420);
  M(halos.mat); G(halos.geo);
  const anchors = [];  // big glows for accent / water lights: {x,y,z,color:Color,intensity,distance,boost}
  const addAnchor = (x, y, z, hex, intensity = 4, distance = 14) => { const a = { x, y, z, color: new THREE.Color(hex), intensity, distance, boost: 1 }; anchors.push(a); return a; };

  // ---------------------------------------------------------- shared materials
  const rimC = mixHex(pal.far, pal.light, 0.45);
  const rockMat = M(inkToon({ color: 0xffffff, vertexColors: true, flatShading: true, rim: 0.32, rimColor: rimC, rimPower: 0.56, steps: 3 }, { fogScale: 0.9, fogMax: 1 }));
  const orgMat = M(inkToon({ color: 0xffffff, vertexColors: true, rim: 0.3, rimColor: rimC, rimPower: 0.56, steps: 3 }, { fogScale: 0.9, fogMax: 1 }));
  const glowMat = M(new THREE.MeshBasicMaterial({ vertexColors: true, fog: true, toneMapped: false }));
  const olRock = M(outlineMat(0.11, INK));
  const olOrg = M(outlineMat(0.06, INK));

  const kit = { rock: [], org: [], glow: [] };
  const colorRock = (mossAmt = 1, wet = true) => (x, y, z, nx, ny, nz) => {
    const n = fbm3(x * 0.35, y * 0.35, z * 0.35, 2);
    let c = mixArr(K.rock, K.rockHi, n * 0.9);
    if (mossAmt > 0) {
      const m = Math.max(0, Math.min(1, (ny - 0.45) / 0.35)) * mossAmt * (0.6 + 0.6 * vnoise3(x * 0.8, y * 0.8, z * 0.8));
      c = mixArr(c, mixArr(K.moss, K.mossHi, n), Math.min(1, m));
    }
    if (wet && y < 0.45) c = scaleArr(c, 0.55 + 0.45 * Math.max(0, y / 0.45));
    return c;
  };

  // ==================================================================== CLIFFS
  {
    const segA = low ? 150 : 210, segY = 13;
    const crest = makeRingNoise(rng, [3, 5, 8, 13, 21, 34, 55], (k) => 1 / Math.pow(k, 0.65));
    const saddles = [];
    for (let i = 0; i < 4; i++) saddles.push({ a: rng() * TAU, w: rng.range(0.1, 0.22), d: rng.range(0.35, 0.6) });
    const ox = rng() * 40, oz = rng() * 40;
    const pos = [], col = [], idx = [];
    const inkL = mixArr(PL.ink, K.rock, 0.55), crestC = mixArr(K.rockHi, PL.far, 0.35);
    const heights = [];
    let sumN = 0; for (const t of crest) sumN += t.amp;
    for (let i = 0; i <= segA; i++) {
      const a = (i / segA) * TAU;
      let hN = 0.5 + 0.5 * ringNoise(crest, a) / sumN;
      let H = 6 + 13 * hN;
      for (const s of saddles) { let da = Math.abs(((a - s.a + Math.PI) % TAU + TAU) % TAU - Math.PI); H *= 1 - s.d * Math.exp(-(da * da) / (s.w * s.w)); }
      heights.push(H);
    }
    for (let i = 0; i <= segA; i++) {
      const a = (i / segA) * TAU, ca = Math.cos(a), sa = Math.sin(a);
      const H = heights[i];
      const base = L.shoreR(a) + 2.4;
      for (let j = 0; j <= segY; j++) {
        const v = j / segY;
        let y = -4 + (H + 4) * Math.pow(v, 0.92);
        const n1 = fbm3(ca * 6 + ox, y * 0.09, sa * 6 + oz, 3);
        const n2 = vnoise3(ca * 22 + oz, y * 0.25, sa * 22 + ox);
        let r = base + (n1 - 0.5) * 7 + (n2 - 0.5) * 1.6 + 1.5 - Math.pow(v, 2) * H * 0.18;
        if (j === segY) { y += (n2 - 0.4) * 3.5; r += 1.2; }
        if (j === 0) r += 1.5;
        pos.push(ca * r, y, sa * r);
        let c = mixArr(inkL, K.rockHi, n1 * 0.55);
        if (y > 0.4 && y < 5) c = mixArr(c, K.moss, 0.45 * (1 - Math.abs(y - 2.2) / 2.8) * n2);
        if (y < 0.8) c = scaleArr(c, 0.6);
        c = mixArr(c, crestC, Math.pow(v, 3) * 0.8);
        col.push(c[0], c[1], c[2]);
      }
    }
    for (let i = 0; i < segA; i++) for (let j = 0; j < segY; j++) {
      const A = i * (segY + 1) + j, B = (i + 1) * (segY + 1) + j, C = A + 1, D = B + 1;
      idx.push(A, B, C, B, D, C);
    }
    const g = G(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    const cliffMat = M(inkToon({ color: 0xffffff, vertexColors: true, flatShading: true, rim: 0.5, rimColor: pal.far, rimPower: 0.5, steps: 3 }, { fogScale: 0.62, fogMax: 0.82 }));
    const cliffs = new THREE.Mesh(g, cliffMat);
    cliffs.name = 'cliffs';
    group.add(cliffs);
    // boulders along the base + spires on the crest (merged into the rock mesh)
    const nB = Math.round(R * (low ? 0.6 : 0.95));
    for (let i = 0; i < nB; i++) {
      const a = rng() * TAU, s = rng.range(1.2, 3.4);
      const r = L.shoreR(a) + rng.range(0.2, 1.2) + s * 1.15;
      kit.rock.push(prep(rockGeo(rng, { r: s, h: s * rng.range(0.6, 1.1), detail: 1, rough: 0.35 }), { matrix: mat(Math.cos(a) * r, s * 0.15, Math.sin(a) * r, 0, rng() * TAU, 0), colorFn: colorRock(0.8) }));
    }
    const nS = low ? 16 : 30;
    for (let i = 0; i < nS; i++) {
      const ii = (rng() * segA) | 0, a = (ii / segA) * TAU;
      const H = heights[ii], r = L.shoreR(a) + 6 + rng() * 6, s = rng.range(1.6, 3.2);
      kit.rock.push(prep(rockGeo(rng, { r: s, h: s * rng.range(2.5, 6.5), detail: 1, rough: 0.3, flare: 0.1 }), { matrix: mat(Math.cos(a) * r, H * 0.7, Math.sin(a) * r, rng.range(-0.15, 0.15), rng() * TAU, rng.range(-0.15, 0.15)), colorFn: colorRock(0.3, false) }));
    }
  }

  mark('cliffs');
  // ==================================================================== VAULT DOME
  let domeMat;
  {
    const prof = [];
    const n = 40;
    prof.push(new THREE.Vector2(L.domeA, L.domeY0 - 30));
    for (let i = 0; i <= n; i++) {
      const q = 1 - i / n; const r = L.domeA * q;
      prof.push(new THREE.Vector2(Math.max(0.01, r), domeY(L, r)));
    }
    const g = G(new THREE.LatheGeometry(prof, low ? 48 : 72));
    domeMat = M(domeMaterial());
    const dome = new THREE.Mesh(g, domeMat);
    dome.name = 'vault';
    dome.renderOrder = 50; // drawn after other opaques so early-z skips hidden pixels
    dome.frustumCulled = false;
    group.add(dome);
  }

  // ==================================================================== PARALLAX RINGS
  const rings = [];
  {
    const dists = low ? [18, 50, 100, 170] : [16, 40, 72, 118, 180];
    const nR = dists.length;
    for (let i = 0; i < nR; i++) {
      const r = R + dists[i] * L.ringScale;
      const yBot = -10, yTop = domeY(L, r) + 8;
      const ringH = yTop - yBot;
      const H = low ? 256 : 512;
      const W = (low ? 1024 : 2048) >> (i >= 3 ? 1 : 0);
      const circ = TAU * r;
      const my = H / ringH;
      const repeat = Math.max(1, Math.round((circ * my) / W));
      const mx = (W * repeat) / circ;
      const t = i / (nR - 1);
      const scale = Math.min(1.25, (ringH * (0.36 + 0.14 * t)) / 40);
      const hangScale = (ringH * (0.4 - 0.22 * t)) / 45;
      const painted = paintRing({ theme, layer: i, layers: nR, W, H, yTop, yBot, mx, scale, hangScale, hang: 1 - 0.6 * t, blur: i >= 3 ? (i - 2) * 0.9 : 0 }, makeRng(L.artSeed + i * 7919));
      prof['ring' + i] = painted.ms;
      const tex = T(new THREE.DataTexture(painted.data, W, H, THREE.RGFormat, THREE.UnsignedByteType));
      tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.magFilter = THREE.LinearFilter; tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.generateMipmaps = true; tex.anisotropy = 4;
      tex.needsUpdate = true;
      const m = M(ringMaterial(tex, { repeat, offset: rng(), texelY: 1 / H }));
      m.uniforms.uMistBot.value = -6; m.uniforms.uMistTop.value = r * (0.2 + 0.08 * t);
      m.uniforms.uMistAmt.value = 0.25 + 0.6 * t;
      m.uniforms.uRimAmt.value = 0.95 - 0.7 * t;
      m.uniforms.uTopDark.value = 0.7;
      m.uniforms.uVaultLo.value = ringH * 0.32; m.uniforms.uVaultHi.value = ringH * 0.8; m.uniforms.uVaultAmt.value = 0.25 + 0.6 * t;
      const g = G(new THREE.CylinderGeometry(r, r, ringH, low ? 72 : 120, 1, true));
      g.translate(0, (yTop + yBot) / 2, 0);
      const mesh = new THREE.Mesh(g, m);
      mesh.name = 'ring' + i;
      mesh.renderOrder = -20 + (nR - 1 - i);
      mesh.frustumCulled = false;
      group.add(mesh);
      rings.push({ mesh, mat: m, t });
    }
  }

  mark('rings');
  // ==================================================================== STALACTITES
  {
    const count = low ? 50 : 110;
    const base = new THREE.ConeGeometry(1, 1, 6, 4);
    base.translate(0, -0.5, 0);
    base.rotateX(Math.PI);
    base.translate(0, 0, 0);
    // cone now points down with its base at y=0
    wobble(base, 0.12, 2.2, 3);
    const g = G(base);
    const m = M(inkToon({ color: mixHex(pal.ink, KIT[theme]?.rock ?? 0x1b2626, 0.6), rim: 0.6, rimColor: pal.far, steps: 3, flatShading: true }, { fogScale: 0.45, fogMax: 0.7 }));
    const im = new THREE.InstancedMesh(g, m, count);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), e = new THREE.Euler();
    for (let i = 0; i < count; i++) {
      const a = rng() * TAU, r = Math.sqrt(rng()) * (R + 70);
      const len = (r > R * 0.8 ? rng.range(10, 34) : rng.range(5, 18)) * (0.6 + rng() * 0.6);
      const w = len * rng.range(0.12, 0.2);
      p.set(Math.cos(a) * r, domeY(L, r) + 1.5, Math.sin(a) * r);
      e.set(rng.range(-0.08, 0.08), rng() * TAU, rng.range(-0.08, 0.08));
      q.setFromEuler(e); s.set(w, len, w);
      im.setMatrixAt(i, m4.compose(p, q, s));
    }
    im.instanceMatrix.needsUpdate = true;
    im.frustumCulled = false;
    im.name = 'stalactites';
    group.add(im);
  }

  // ==================================================================== LIGHT SHAFTS
  const shaftList = L.cracks.map((c) => {
    const r0 = Math.hypot(c.x, c.z);
    const topY = domeY(L, r0) - 3;
    return {
      bottom: V(c.x, 0, c.z),
      top: V(c.x + L.lightDir.x * c.lean * topY, topY, c.z + L.lightDir.z * c.lean * topY),
      wTop: c.width * 0.45, wBottom: c.width * 1.5, phase: c.phase, power: c.power,
    };
  });
  const shafts = createShafts(shaftList);
  shafts.geos.forEach(G); shafts.mats.forEach(M);
  group.add(shafts.mesh, shafts.pools);
  shaftList.forEach((s, i) => { if (i < 4) domeMat.uniforms.uCracks.value[i].set(s.top.x, s.top.y, s.top.z, s.power); });
  const crackTop = shaftList[0]?.top.clone() || V(0, 80, 0), crackBottom = shaftList[0]?.bottom.clone() || V(0, 0, 0);

  mark('stal+shafts');
  // ==================================================================== ISLANDS
  const islandRock = (o, mossAmt = 1) => {
    kit.rock.push(prep(rockGeo(rng, { r: o.r, h: o.h, detail: 2, rough: 0.3 }), { matrix: mat(o.x, o.h * 0.22 - 0.25, o.z, 0, o.rot, 0), colorFn: colorRock(mossAmt) }));
    const k = 2 + ((rng() * 3) | 0);
    for (let i = 0; i < k; i++) {
      const a = o.rot + (i / k) * TAU + rng.range(-0.4, 0.4), d = o.r * rng.range(0.55, 0.85), s = o.r * rng.range(0.22, 0.4);
      kit.rock.push(prep(rockGeo(rng, { r: s, h: s * rng.range(0.6, 1.3), detail: 1, rough: 0.35 }), { matrix: mat(o.x + Math.cos(a) * d, s * 0.2, o.z + Math.sin(a) * d, 0, rng() * TAU, 0), colorFn: colorRock(mossAmt * 0.8) }));
    }
  };
  const topOf = (o, f = 0.55) => o.h * f + 0.2; // approximate surface height near island centre

  // ---------------- theme prop builders
  const P = {
    column(x, z, r, h, broken = true) {
      const hh = h;
      const g = new THREE.CylinderGeometry(r * 0.82, r, hh, 12, 6, false);
      const pp = g.attributes.position;
      for (let i = 0; i < pp.count; i++) {
        const y = pp.getY(i), a = Math.atan2(pp.getZ(i), pp.getX(i));
        const flute = 1 - 0.06 * (0.5 + 0.5 * Math.cos(a * 12));
        let yy = y;
        if (broken && y > hh * 0.49) yy = y - vnoise3(Math.cos(a) * 3 + x, 0, Math.sin(a) * 3 + z) * hh * 0.25;
        pp.setXYZ(i, pp.getX(i) * flute, yy, pp.getZ(i) * flute);
      }
      g.computeVertexNormals();
      kit.rock.push(prep(g, { matrix: mat(x, hh / 2 - 0.4, z, rng.range(-0.05, 0.05), rng() * TAU, rng.range(-0.05, 0.05)), colorFn: (px, py) => mixArr(K.stone, K.moss, py < 1.6 ? 0.55 : py > hh * 0.75 ? 0.25 : 0.05) }));
      if (!broken) kit.rock.push(prep(new THREE.BoxGeometry(r * 2.3, r * 0.5, r * 2.3), { matrix: mat(x, hh - 0.2, z, 0, rng() * TAU, 0), color: K.stone }));
    },
    lamp(x, y, z, h = 3.2, light = true) {
      const post = new THREE.CylinderGeometry(0.07, 0.11, h, 6);
      kit.org.push(prep(post, { matrix: mat(x, y + h / 2, z), color: K.iron }));
      const arm = taperTube([V(0, h - 0.1, 0), V(0.35, h + 0.25, 0), V(0.75, h + 0.1, 0)], () => 0.045, 5, 8);
      const ry = rng() * TAU;
      kit.org.push(prep(arm, { matrix: mat(x, y, z, 0, ry, 0), color: K.iron }));
      const lx = x + Math.cos(-ry) * 0.75, lz = z + Math.sin(-ry) * 0.75, ly = y + h - 0.35;
      kit.org.push(prep(new THREE.ConeGeometry(0.26, 0.22, 6), { matrix: mat(lx, ly + 0.3, lz), color: K.iron }));
      if (light) {
        kit.glow.push(prep(new THREE.OctahedronGeometry(0.17, 0), { matrix: mat(lx, ly, lz, 0, 0, 0, [1, 1.4, 1]), color: scaleArr(PL.glow, 2.4) }));
        halos.add(lx, ly, lz, scaleArr(PL.glow, 1.3), 2.6);
        addAnchor(lx, ly, lz, pal.glow, 3.5, 12);
      }
    },
    reeds(x, z, n = 5, h = 1.6) {
      for (let i = 0; i < n; i++) {
        const a = rng() * TAU, d = rng() * 0.7, hh = h * rng.range(0.6, 1.2);
        const g = new THREE.ConeGeometry(0.05, hh, 4);
        kit.org.push(prep(g, { matrix: mat(x + Math.cos(a) * d, hh / 2 - 0.1, z + Math.sin(a) * d, rng.range(-0.2, 0.2), 0, rng.range(-0.2, 0.2)), color: mixArr(K.organic, K.mossHi, rng() * 0.4) }));
      }
    },
    pilings(x, z, r) {
      const n = 3 + ((rng() * 3) | 0);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + rng() * 0.6, d = r * rng.range(0.25, 0.75), h = rng.range(1.6, 4.4), w = rng.range(0.18, 0.28);
        const g = new THREE.CylinderGeometry(w * 0.85, w, h, 7, 2);
        wobble(g, 0.03, 3, i);
        kit.org.push(prep(g, { matrix: mat(x + Math.cos(a) * d, h / 2 - 0.5, z + Math.sin(a) * d, rng.range(-0.18, 0.18), rng() * TAU, rng.range(-0.18, 0.18)), colorFn: (px, py) => mixArr(K.wood, K.moss, py < 0.5 ? 0.5 : 0) }));
      }
      kit.org.push(prep(new THREE.TorusGeometry(r * 0.55, 0.05, 4, 16), { matrix: mat(x, 1.0, z, Math.PI / 2 + rng.range(-0.1, 0.1), 0, 0), color: mixArr(K.wood, K.bone, 0.3) }));
    },
    wreck(x, z, r, rot) {
      // half-sunken rowboat, bow lifted out of the water, broken mast
      const hull = new THREE.SphereGeometry(1, 12, 6, 0, TAU, Math.PI / 2, Math.PI / 2);
      const hp = hull.attributes.position;
      for (let i = 0; i < hp.count; i++) { const zz = hp.getZ(i); hp.setX(i, hp.getX(i) * (1 - 0.35 * zz * zz)); hp.setY(i, hp.getY(i) * (1 - 0.2 * zz * zz)); }
      hull.computeVertexNormals();
      const rx = -0.42, rz = rng.range(-0.3, 0.3);
      const hm = mat(x, 0.25, z, rx, rot, rz, [r * 0.55, r * 0.5, r * 1.25]);
      const plank = (px, py, pz) => { const k = 0.5 + 0.5 * Math.sin((py - 0.25) * 9.0); return mixArr(mixArr(K.wood, K.woodHi || K.wood, k * 0.8), K.moss, py < 0.25 ? 0.5 : 0.05); };
      kit.org.push(prep(hull, { matrix: hm, colorFn: plank }));
      // dark deck / interior lid just below the gunwale
      const lid = new THREE.CircleGeometry(0.92, 12).rotateX(-Math.PI / 2).translate(0, -0.08, 0);
      const lp = lid.attributes.position;
      for (let i = 0; i < lp.count; i++) { const zz = lp.getZ(i); lp.setX(i, lp.getX(i) * (1 - 0.35 * zz * zz)); }
      kit.org.push(prep(lid, { matrix: hm, color: scaleArr(K.wood, 0.45) }));
      // gunwale ribs
      for (let i = 0; i < 4; i++) {
        const t = (i / 3 - 0.5) * 1.4;
        const rib = taperTube([V(-0.95 * (1 - 0.35 * t * t), 0, t), V(-0.75, -0.6, t), V(0, -0.98, t), V(0.75, -0.6, t), V(0.95 * (1 - 0.35 * t * t), 0, t)], () => 0.06, 4, 10);
        kit.org.push(prep(rib, { matrix: hm, color: scaleArr(K.wood, 1.3) }));
      }
      // snapped mast
      const mh = r * rng.range(1.4, 2.2);
      const mast = new THREE.CylinderGeometry(0.1, 0.14, mh, 6).translate(0, mh / 2, 0);
      kit.org.push(prep(mast, { matrix: mat(x, 0.2, z, rx * 0.4 + rng.range(-0.25, 0.25), rot, rz + rng.range(0.2, 0.5)), color: K.wood }));
    },
    mushroom(x, y, z, h, capR, opts2 = {}) {
      const bend = opts2.bend ?? rng.range(-0.25, 0.25), ry = rng() * TAU;
      const sr = opts2.stalkR ?? capR * 0.16;
      const pts = [V(0, -0.3, 0), V(bend * h * 0.3, h * 0.4, 0), V(bend * h * 0.55, h * 0.8, 0), V(bend * h * 0.6, h, 0)];
      const stalk = taperTube(pts, (t) => sr * (1.35 - t * 0.45 + (t < 0.08 ? 0.4 * (1 - t / 0.08) : 0)), 8, 12);
      kit.org.push(prep(stalk, { matrix: mat(x, y, z, 0, ry, 0), colorFn: (px, py) => mixArr(K.organic, K.bone, 0.2 + 0.25 * Math.sin(py * 2.2)) }));
      const top = pts[3];
      const cx = x + Math.cos(-ry) * top.x, cz = z + Math.sin(-ry) * top.x, cy = y + top.y;
      const ch = capR * rng.range(0.35, 0.55);
      const cap = latheGeo([[0.01, 0], [capR * 0.5, -ch * 0.02], [capR * 0.92, -ch * 0.06], [capR, ch * 0.08], [capR * 0.85, ch * 0.55], [capR * 0.45, ch * 0.92], [0, ch]], 16);
      wobble(cap, capR * 0.04, 1.4, x);
      const tilt = bend * 0.6;
      kit.org.push(prep(cap, { matrix: mat(cx, cy, cz, tilt, ry, 0), colorFn: (px, py) => mixArr(K.cap || K.moss, K.capHi || K.mossHi, Math.max(0, (py - cy) / ch) * 0.8) }));
      // glowing gill underside
      const gill = latheGeo([[capR * 0.2, -ch * 0.05], [capR * 0.6, -ch * 0.08], [capR * 0.94, -ch * 0.03]], 16);
      const gc = opts2.gillColor || PL.glow;
      kit.glow.push(prep(gill, { matrix: mat(cx, cy - 0.02, cz, tilt, ry, 0), color: scaleArr(gc, 1.6) }));
      // cap spots
      const spots = (rng() * 5) | 0;
      for (let i = 0; i < spots; i++) {
        const a = rng() * TAU, d = capR * rng.range(0.2, 0.7);
        kit.glow.push(prep(new THREE.SphereGeometry(capR * 0.05, 5, 4), { matrix: mat(cx + Math.cos(a) * d, cy + ch * (1 - (d / capR) * 0.6) * 0.95, cz + Math.sin(a) * d), color: scaleArr(PL.accent, 2) }));
      }
      halos.add(cx, cy - ch * 0.3, cz, scaleArr(gc, 0.7), capR * 2.6);
      return { x: cx, y: cy, z: cz };
    },
    pod(x, y, z, s) {
      const n = 3 + ((rng() * 3) | 0);
      for (let i = 0; i < n; i++) {
        const a = rng() * TAU, d = s * rng.range(0.2, 0.9), h = s * rng.range(0.8, 2.6), rr = s * rng.range(0.35, 0.6);
        const px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d;
        kit.org.push(prep(taperTube([V(0, -0.3, 0), V(rng.range(-0.3, 0.3), h * 0.6, 0), V(0, h, 0)], (t) => rr * 0.22 * (1 - t * 0.4), 6, 8), { matrix: mat(px, y, pz, 0, rng() * TAU, 0), color: K.organic }));
        const gc = rng() < 0.5 ? PL.accent : PL.glow;
        const pg = new THREE.SphereGeometry(rr, 8, 6); wobble(pg, rr * 0.08, 3, i);
        kit.glow.push(prep(pg, { matrix: mat(px, y + h + rr * 0.6, pz, 0, 0, 0, [1, 1.25, 1]), colorFn: (qx, qy) => scaleArr(gc, 0.9 + 0.9 * Math.max(0, Math.min(1, (qy - (y + h)) / (rr * 1.6)))) }));
        halos.add(px, y + h + rr * 0.6, pz, scaleArr(gc, 0.6), rr * 5);
      }
    },
    crystals(x, y, z, s, n = 6, colors = [PL.glow, PL.accent], spread = s * 0.5) {
      const tint = colors[(rng() * colors.length) | 0];
      for (let i = 0; i < n; i++) {
        const h = s * rng.range(0.6, 1.8) * (i === 0 ? 1.4 : 1), r = h * rng.range(0.1, 0.16);
        const a = rng() * TAU, d = i === 0 ? 0 : spread * rng.range(0.3, 1);
        const g = crystalGeo(r, h, 6, 0.3);
        const base = mixArr(PL.ink, tint, 0.25);
        kit.glow.push(prep(g, { matrix: mat(x + Math.cos(a) * d, y, z + Math.sin(a) * d, rng.range(-0.45, 0.45) * (i ? 1 : 0.3), rng() * TAU, rng.range(-0.45, 0.45) * (i ? 1 : 0.3)), colorFn: (px, py) => mixArr(base, scaleArr(tint, 2.2), Math.max(0, Math.min(1, (py - y) / (h * 0.95))) ** 1.4) }));
      }
      halos.add(x, y + s * 0.9, z, scaleArr(tint, 0.55), s * 3.2);
      return tint;
    },
    obelisk(x, z, r, h) {
      const g = new THREE.CylinderGeometry(r * 0.55, r, h, 4, 1);
      const ry = rng() * TAU;
      kit.rock.push(prep(g, { matrix: mat(x, h / 2 - 0.4, z, rng.range(-0.06, 0.06), ry, rng.range(-0.06, 0.06)), colorFn: (px, py) => mixArr(K.rock, K.rockHi, 0.3 + 0.2 * Math.sin(py)) }));
      kit.rock.push(prep(new THREE.ConeGeometry(r * 0.62, r * 1.2, 4), { matrix: mat(x, h - 0.4 + r * 0.55, z, 0, ry, 0), color: K.rockHi }));
      // rune lines on each face
      for (let f = 0; f < 4; f++) {
        const a = ry + Math.PI / 4 + (f * Math.PI) / 2;
        for (let k = 0; k < 3; k++) {
          const yy = h * (0.25 + k * 0.2), rr = r * (1 - (yy / h) * 0.45) * 0.72;
          kit.glow.push(prep(new THREE.BoxGeometry(0.06, h * 0.12, 0.02), { matrix: mat(x + Math.cos(a) * rr, yy, z - Math.sin(a) * rr, 0, a + Math.PI / 2, 0), color: scaleArr(PL.glow, 2) }));
        }
      }
      halos.add(x, h * 0.5, z, scaleArr(PL.glow, 0.35), r * 4);
    },
    statue(x, z, s, sunk = 0.3) {
      const ry = rng() * TAU;
      const body = latheGeo([[s * 0.95, -s * 0.5], [s * 0.9, s * 0.4], [s * 0.7, s * 1.2], [s * 0.45, s * 1.75], [s * 0.42, s * 2.05], [s * 0.01, s * 2.3]], 12);
      wobble(body, s * 0.05, 1.5, x);
      const y0 = -sunk * s * 2;
      kit.rock.push(prep(body, { matrix: mat(x, y0, z, rng.range(-0.08, 0.08), ry, rng.range(-0.1, 0.1)), colorFn: (px, py) => mixArr(K.stone, K.moss, py < 0.6 ? 0.5 : 0.1) }));
      // hood + void face
      kit.rock.push(prep(new THREE.SphereGeometry(s * 0.5, 10, 8, 0, TAU, 0, Math.PI * 0.62), { matrix: mat(x, y0 + s * 2.0, z, 0.25, ry, 0), color: K.stone }));
      // two glowing eyes in the hood shadow
      const fx = Math.sin(ry), fz = Math.cos(ry);
      for (const sd of [-1, 1]) {
        const ex = x + fx * s * 0.42 + Math.cos(ry) * sd * s * 0.12, ez = z + fz * s * 0.42 - Math.sin(ry) * sd * s * 0.12;
        kit.glow.push(prep(new THREE.SphereGeometry(s * 0.05, 5, 4), { matrix: mat(ex, y0 + s * 2.02, ez), color: scaleArr(PL.light, 2.5) }));
      }
      // cradled orb of light
      const ox = x + fx * s * 0.9, oz = z + fz * s * 0.9, oy = y0 + s * 1.2;
      kit.glow.push(prep(new THREE.IcosahedronGeometry(s * 0.2, 1), { matrix: mat(ox, oy, oz), color: scaleArr(PL.glow, 2.4) }));
      halos.add(ox, oy, oz, scaleArr(PL.glow, 0.9), s * 3);
      addAnchor(ox, oy, oz, pal.glow, 4, 14);
    },
    rib(x, z, r, h, rot) {
      const span = h * rng.range(0.35, 0.6);
      const pts = [V(0, -1, 0), V(span * 0.1, h * 0.45, 0), V(span * 0.45, h * 0.9, 0), V(span * 0.9, h * 1.0, 0), V(span * 1.2, h * 0.86, 0)];
      const g = taperTube(pts, (t) => r * (0.62 - t * 0.42) * (1 + 0.15 * Math.sin(t * 30)), 8, 18);
      kit.org.push(prep(g, { matrix: mat(x, 0, z, 0, rot, 0), colorFn: (px, py) => mixArr(scaleArr(K.bone, 0.75), K.bone, Math.min(1, py / h)) }));
    },
    vertebra(x, z, r, h) {
      const segs = Math.max(4, Math.round(h / (r * 1.1)));
      for (let i = 0; i < segs; i++) {
        const y = (i / segs) * h - 0.3, sh = h / segs;
        const w = r * (1 - (i / segs) * 0.35);
        const disc = new THREE.CylinderGeometry(w * 0.85, w * 0.95, sh * 0.62, 10, 1);
        kit.org.push(prep(disc, { matrix: mat(x, y + sh * 0.31, z, 0, i * 0.4, 0), color: mixArr(K.bone, scaleArr(K.bone, 0.7), (i % 2) * 0.4) }));
        const spur = new THREE.ConeGeometry(w * 0.22, w * 1.5, 5);
        kit.org.push(prep(spur, { matrix: mat(x, y + sh * 0.45, z, 0, i * 0.9, Math.PI / 2 + 0.3), color: K.bone }));
      }
    },
    coral(x, y, z, s, depth = 3) {
      const branch = (p, dir, len, w, depth) => {
        const end = p.clone().addScaledVector(dir, len);
        const mid = p.clone().lerp(end, 0.5).add(V(rng.range(-0.2, 0.2) * len, 0, rng.range(-0.2, 0.2) * len));
        kit.org.push(prep(taperTube([p, mid, end], (t) => w * (1 - t * 0.45), 4, 3), { colorFn: (px, py) => mixArr(scaleArr(K.organic, 0.6), K.organic, Math.min(1, Math.max(0, py / (s * 2)))) }));
        if (depth > 0) for (let k = 0; k < 2; k++) {
          const d2 = dir.clone().add(V(rng.range(-0.7, 0.7), rng.range(0.2, 0.6), rng.range(-0.7, 0.7))).normalize();
          branch(end, d2, len * 0.7, w * 0.62, depth - 1);
        }
        else if (rng() < 0.4) { kit.glow.push(prep(new THREE.SphereGeometry(w * 1.1, 5, 4), { matrix: mat(end.x, end.y, end.z), color: scaleArr(PL.glow, 1.8) })); }
      };
      const n = 2 + ((rng() * 2) | 0);
      for (let i = 0; i < n; i++) branch(V(x + rng.range(-0.4, 0.4) * s, y - 0.4, z + rng.range(-0.4, 0.4) * s), V(rng.range(-0.3, 0.3), 1, rng.range(-0.3, 0.3)).normalize(), s * rng.range(0.8, 1.2), s * 0.16, depth);
    },
    candle(x, y, z, s = 1, lit = true) {
      const h = 0.25 * s * rng.range(0.6, 1.4);
      kit.org.push(prep(new THREE.CylinderGeometry(0.06 * s, 0.07 * s, h, 6), { matrix: mat(x, y + h / 2, z), color: K.bone }));
      if (lit) {
        kit.glow.push(prep(new THREE.ConeGeometry(0.035 * s, 0.12 * s, 5), { matrix: mat(x, y + h + 0.07 * s, z), color: scaleArr(PL.glow, 3) }));
        halos.add(x, y + h + 0.08 * s, z, scaleArr(PL.glow, 0.5), 0.9 * s);
      }
    },
  };

  // ---------------- islands per theme
  for (const o of L.islands) {
    islandRock(o, theme === 'paleabyss' ? 0.6 : 1);
    const top = topOf(o);
    if (theme === 'mossmere') {
      if (o.big) { P.column(o.x + o.r * 0.25, o.z - o.r * 0.1, 0.55, 4.2 + rng() * 2, true); P.column(o.x - o.r * 0.3, o.z + o.r * 0.2, 0.5, 2.4, true); }
      if (o.big || rng() < 0.55) P.lamp(o.x + rng.range(-0.3, 0.3) * o.r, top * 0.9, o.z + rng.range(-0.3, 0.3) * o.r, rng.range(2.8, 3.8));
      const nr = 3 + ((rng() * 4) | 0);
      for (let i = 0; i < nr; i++) { const a = rng() * TAU, d = o.r * rng.range(1.05, 1.35); P.reeds(o.x + Math.cos(a) * d, o.z + Math.sin(a) * d, 4 + ((rng() * 4) | 0), rng.range(1.0, 1.9)); }
    } else if (theme === 'sporewood') {
      const nm = o.big ? 3 : 1 + ((rng() * 2) | 0);
      for (let i = 0; i < nm; i++) {
        const a = rng() * TAU, d = o.r * rng.range(0, 0.45);
        const cap = rng.range(1.8, 3.6) * (o.big && i === 0 ? 1.6 : 1);
        const m = P.mushroom(o.x + Math.cos(a) * d, top * 0.8, o.z + Math.sin(a) * d, cap * rng.range(1.6, 2.6), cap, { gillColor: rng() < 0.7 ? PL.glow : PL.accent });
        if (i === 0) addAnchor(m.x, m.y - 0.6, m.z, pal.glow, 3.2, 13);
      }
      const np = (rng() * 3) | 0;
      for (let i = 0; i < np; i++) { const a = rng() * TAU, d = o.r * rng.range(0.4, 0.8); P.pod(o.x + Math.cos(a) * d, top * 0.5, o.z + Math.sin(a) * d, rng.range(0.5, 0.9)); }
    } else if (theme === 'glasswater') {
      const nc = o.big ? 3 : 1 + ((rng() * 2) | 0);
      for (let i = 0; i < nc; i++) {
        const a = rng() * TAU, d = o.r * rng.range(0, 0.55);
        const tint = P.crystals(o.x + Math.cos(a) * d, top * 0.7, o.z + Math.sin(a) * d, rng.range(1.6, 3.4) * (o.big && i === 0 ? 1.6 : 1), 5 + ((rng() * 4) | 0));
        if (i === 0) addAnchor(o.x + Math.cos(a) * d, top + 2, o.z + Math.sin(a) * d, new THREE.Color().setRGB(tint[0], tint[1], tint[2]).getHex(), 3.5, 13);
      }
      if (o.big) P.statue(o.x - o.r * 0.2, o.z + o.r * 0.15, 1.3, 0.05);
    } else {
      const nc = 1 + ((rng() * 3) | 0);
      for (let i = 0; i < nc; i++) { const a = rng() * TAU, d = o.r * rng.range(0.1, 0.6); P.coral(o.x + Math.cos(a) * d, top * 0.7, o.z + Math.sin(a) * d, rng.range(0.9, 1.6), 2); }
      const nb = 1 + ((rng() * 2) | 0);
      for (let i = 0; i < nb; i++) { const a = rng() * TAU, d = o.r * rng.range(0.2, 0.7); P.rib(o.x + Math.cos(a) * d, o.z + Math.sin(a) * d, 0.35, rng.range(2.5, 4.5), rng() * TAU); }
      const nk = 3 + ((rng() * 6) | 0);
      for (let i = 0; i < nk; i++) { const a = rng() * TAU, d = o.r * rng.range(0.15, 0.75); P.candle(o.x + Math.cos(a) * d, top * (0.95 - d / o.r * 0.6), o.z + Math.sin(a) * d, 1.3, rng() < 0.6); }
      if (o.big) addAnchor(o.x, top + 1.5, o.z, pal.glow, 3, 12);
    }
  }

  // ---------------- pillars / wrecks
  for (const p of L.pillars) {
    const s = p.h;
    switch (p.kind) {
      case 'column': P.column(p.x, p.z, p.r * 0.95, rng.range(4, 9) * s, rng() < 0.7); break;
      case 'pilings': P.pilings(p.x, p.z, p.r); break;
      case 'wreck': P.wreck(p.x, p.z, p.r * 0.85, p.rot); break;
      case 'lamp':
        kit.rock.push(prep(rockGeo(rng, { r: p.r * 1.1, h: 0.9, detail: 1, rough: 0.25 }), { matrix: mat(p.x, 0.1, p.z, 0, p.rot, 0), colorFn: colorRock(1) }));
        P.lamp(p.x, 0.5, p.z, rng.range(3.5, 4.8));
        break;
      case 'stalk': {
        const cap = rng.range(3.2, 6.2) * s;
        const m = P.mushroom(p.x, 0, p.z, rng.range(8, 15) * s, cap, { stalkR: p.r * 0.75, bend: rng.range(-0.18, 0.18), gillColor: rng() < 0.65 ? PL.glow : PL.accent });
        addAnchor(m.x, m.y - 0.8, m.z, pal.glow, 4, 16);
        break;
      }
      case 'pod': P.pod(p.x, 0, p.z, p.r * 0.9); break;
      case 'shelf': {
        const h = rng.range(4, 7);
        const trunk = taperTube([V(0, -0.5, 0), V(0.3, h * 0.5, 0), V(-0.2, h, 0)], (t) => p.r * (0.75 - t * 0.35), 8, 10);
        kit.org.push(prep(trunk, { matrix: mat(p.x, 0, p.z, 0, p.rot, 0), color: K.wood }));
        for (let i = 0; i < 4; i++) {
          const yy = h * rng.range(0.2, 0.85), a = rng() * TAU, rr = p.r * rng.range(0.9, 1.6);
          const sh = latheGeo([[rr, 0], [rr * 0.6, 0.18], [0.01, 0.22]], 10);
          kit.org.push(prep(sh, { matrix: mat(p.x + Math.cos(a) * p.r * 0.5, yy, p.z + Math.sin(a) * p.r * 0.5, 0, 0, 0, [1, 1, 0.7]), color: K.cap || K.moss }));
          kit.glow.push(prep(new THREE.CircleGeometry(rr * 0.85, 10).rotateX(Math.PI / 2), { matrix: mat(p.x + Math.cos(a) * p.r * 0.5, yy - 0.02, p.z + Math.sin(a) * p.r * 0.5, 0, 0, 0, [1, 1, 0.7]), color: scaleArr(PL.glow, 1.3) }));
        }
        halos.add(p.x, h * 0.5, p.z, scaleArr(PL.glow, 0.5), 5);
        break;
      }
      case 'spire': {
        const tint = P.crystals(p.x, -0.4, p.z, rng.range(5, 9) * s, 4 + ((rng() * 3) | 0), undefined, p.r * 0.75);
        addAnchor(p.x, 3, p.z, new THREE.Color().setRGB(tint[0], tint[1], tint[2]).getHex(), 4, 15);
        break;
      }
      case 'obelisk': P.obelisk(p.x, p.z, p.r, rng.range(6, 10) * s); break;
      case 'statue': P.statue(p.x, p.z, p.r * 0.85, rng.range(0.15, 0.4)); break;
      case 'rib': P.rib(p.x, p.z, p.r * 0.9, rng.range(8, 14) * s, p.rot); break;
      case 'vertebra': P.vertebra(p.x, p.z, p.r, rng.range(5, 9) * s); break;
      case 'coral': P.coral(p.x, 0, p.z, p.r * 1.4); P.candle(p.x + p.r, 0.25, p.z, 1.6, true); break;
      default: P.column(p.x, p.z, p.r, 5, true);
    }
  }

  // ---------------- dock posts
  for (const d of L.docks) {
    for (const p of d.posts) {
      const h = rng.range(1.8, 2.4);
      const g = new THREE.CylinderGeometry(0.16, 0.2, h + 0.8, 7, 2);
      wobble(g, 0.02, 3, p.x);
      kit.org.push(prep(g, { matrix: mat(p.x, (h + 0.8) / 2 - 0.8, p.z, rng.range(-0.08, 0.08), rng() * TAU, rng.range(-0.08, 0.08)), colorFn: (px, py) => mixArr(K.wood, K.moss, py < 0.4 ? 0.5 : 0) }));
      kit.org.push(prep(new THREE.TorusGeometry(0.2, 0.05, 4, 10), { matrix: mat(p.x, h * 0.6, p.z, Math.PI / 2, 0, 0), color: mixArr(K.wood, K.bone, 0.4) }));
    }
  }

  // ---------------- hero landmarks just beyond the cliffs (real 3D parallax against the rings)
  const hero = { ink: [], glow: [] };
  {
    const ga = Math.atan2(L.gate.z, L.gate.x); // landmarks rise behind the Descent Gate
    const at = (a, extra) => { const r = L.shoreR(a) + extra; return [Math.cos(a) * r, Math.sin(a) * r]; };
    const inkC = mixArr(PL.ink, K.rock, 0.6);
    if (theme === 'mossmere') {
      // the Sunken Gate: twin towers and a broken arch
      const [x, z] = at(ga, 16);
      const face = Math.atan2(-x, -z);
      const fx = Math.cos(face), fz = -Math.sin(face);
      for (const sd of [-1, 1]) {
        const tx = x + fx * sd * 13, tz = z + fz * sd * 13;
        const body = new THREE.CylinderGeometry(4.2, 5.2, 38, 8, 3);
        hero.ink.push(prep(body, { matrix: mat(tx, 15, tz, 0, face, sd * 0.03), color: inkC }));
        hero.ink.push(prep(new THREE.ConeGeometry(5.6, 14 + (sd > 0 ? 0 : 6), 8), { matrix: mat(tx, 34 + 7 + (sd > 0 ? 0 : 3), tz, 0, face, 0), color: inkC }));
        hero.glow.push(prep(new THREE.BoxGeometry(0.7, 2.2, 0.3), { matrix: mat(tx - Math.sin(face) * -4.3, 22, tz - Math.cos(face) * -4.3, 0, face, 0), color: scaleArr(PL.glow, 1.6) }));
      }
      const arch = taperTube([V(-13, 26, 0), V(-8, 33, 0), V(0, 35.5, 0), V(6, 34, 0)], () => 1.6, 6, 16);
      hero.ink.push(prep(arch, { matrix: mat(x, 0, z, 0, face, 0), color: inkC }));
    } else if (theme === 'sporewood') {
      for (let i = 0; i < 4; i++) {
        const a = ga + (i - 1.5) * 0.42 + rng.range(-0.08, 0.08);
        const [x, z] = at(a, rng.range(8, 16));
        const h = rng.range(34, 56), cr = rng.range(12, 20), ry = rng() * TAU;
        const st = taperTube([V(0, -2, 0), V(rng.range(-3, 3), h * 0.5, 0), V(rng.range(-5, 5), h, 0)], (t) => 2.6 * (1.3 - t * 0.5), 8, 12);
        hero.ink.push(prep(st, { matrix: mat(x, 0, z, 0, ry, 0), color: inkC }));
        const ch = cr * 0.4;
        const cap = latheGeo([[0.01, 0], [cr * 0.5, -ch * 0.02], [cr * 0.92, -ch * 0.06], [cr, ch * 0.08], [cr * 0.85, ch * 0.55], [cr * 0.45, ch * 0.92], [0, ch]], 18);
        hero.ink.push(prep(cap, { matrix: mat(x, h, z, rng.range(-0.1, 0.1), ry, rng.range(-0.1, 0.1)), color: mixArr(inkC, K.cap, 0.4) }));
        const gill = latheGeo([[cr * 0.2, -ch * 0.05], [cr * 0.6, -ch * 0.08], [cr * 0.94, -ch * 0.03]], 18);
        hero.glow.push(prep(gill, { matrix: mat(x, h - 0.15, z, 0, ry, 0), color: scaleArr(i % 2 ? PL.accent : PL.glow, 0.9) }));
      }
    } else if (theme === 'glasswater') {
      for (let i = 0; i < 5; i++) {
        const a = ga + (i - 2) * 0.33 + rng.range(-0.06, 0.06);
        const [x, z] = at(a, rng.range(8, 18));
        const h = rng.range(30, 62), r = h * rng.range(0.09, 0.13);
        const g = crystalGeo(r, h, 6, 0.25);
        const tint = i % 2 ? PL.accent : PL.glow;
        hero.glow.push(prep(g, { matrix: mat(x, -2, z, rng.range(-0.18, 0.18), rng() * TAU, rng.range(-0.18, 0.18)), colorFn: (px, py) => mixArr(mixArr(PL.ink, tint, 0.12), scaleArr(tint, 1.1), Math.max(0, Math.min(1, py / h)) ** 2.2) }));
      }
    } else {
      // colossal ribs arching overhead across the northern lake, broken tips, spine beyond the west shore
      const ux = Math.cos(ga), uz = Math.sin(ga);        // toward the gate
      const vx = -uz, vz = ux;                            // across the lake
      const side = rng() < 0.5 ? -1 : 1;
      const ribs = [0.05, 0.3, 0.55, 0.78];
      const roots = [];
      for (let i = 0; i < ribs.length; i++) {
        const d = ribs[i] * R;
        const half = Math.sqrt(Math.max(1, R * R - d * d));
        const peak = rng.range(30, 40) * (1 - ribs[i] * 0.25);
        const cx = ux * d, cz = uz * d;
        const P2 = (t, y) => V(cx + vx * side * t * half, y, cz + vz * side * t * half);
        const tip = rng.range(0.35, 0.75);
        const pts = [P2(-1.25, 16), P2(-1.0, peak * 0.85), P2(-0.45, peak), P2(0.05, peak * 0.97), P2(tip, peak * 0.72)];
        roots.push(pts[0]);
        const rib = taperTube(pts, (t) => 2.6 * (1 - t * 0.62) * (1 + 0.08 * Math.sin(t * 40)), 8, 26);
        hero.ink.push(prep(rib, { colorFn: (px, py) => mixArr(inkC, scaleArr(K.bone, 0.5), Math.min(1, py / peak) * 0.75) }));
      }
      const first = roots[0], last = roots[roots.length - 1];
      const ext0 = first.clone().addScaledVector(first.clone().sub(roots[1]).normalize(), 18);
      const ext1 = last.clone().addScaledVector(last.clone().sub(roots[roots.length - 2]).normalize(), 22);
      ext1.y -= 8;
      const spine = taperTube([ext0, ...roots, ext1], (t) => 3.6 * (1 - t * 0.45), 8, 22);
      hero.ink.push(prep(spine, { color: inkC }));
    }
  }
  mark('props');
  // ---------------- merge statics
  const statics = [];
  const addStatic = (list, material, outline, name) => {
    const g = merge(list);
    if (!g) return null;
    G(g);
    const mesh = new THREE.Mesh(g, material);
    mesh.name = name;
    if (outline) { const o = new THREE.Mesh(g, outline); o.name = name + ':outline'; o.renderOrder = -1; mesh.add(o); }
    group.add(mesh);
    statics.push(mesh);
    return mesh;
  };
  addStatic(kit.rock, rockMat, olRock, 'rocks');
  addStatic(kit.org, orgMat, olOrg, 'organics');
  addStatic(kit.glow, glowMat, null, 'glows');
  const heroMat = M(inkToon({ color: 0xffffff, vertexColors: true, flatShading: true, rim: 0.6, rimColor: pal.far, rimPower: 0.5, steps: 3 }, { fogScale: 0.5, fogMax: 0.72 }));
  addStatic(hero.ink, heroMat, null, 'landmarks');
  addStatic(hero.glow, glowMat, null, 'landmarkGlows');

  mark('merge');
  // ==================================================================== FLOATERS
  const floaters = [];  // {mesh, i, x, z, y, ry, s, bob, hover, spin, halo, dx, dz, ph}
  const floatMeshes = [];
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e4 = new THREE.Euler(), s4 = new THREE.Vector3(), p4 = new THREE.Vector3();
  const makeFloatType = (geo, material, max, name) => {
    const im = new THREE.InstancedMesh(G(geo), material, max);
    im.count = 0; im.frustumCulled = false; im.name = name;
    group.add(im); floatMeshes.push(im);
    return im;
  };
  const addFloater = (types, x, z, o2 = {}) => {
    const f = { x, z, ry: o2.ry ?? rng() * TAU, s: o2.s ?? 1, hover: o2.hover ?? 0, bob: o2.bob ?? 1, spin: o2.spin ?? 0, ph: rng() * TAU, drift: o2.drift ?? 0, idx: [], halo: -1, haloY: o2.haloY ?? 0.5, ox: x, oz: z };
    for (const im of types) { if (im.count < im.instanceMatrix.count) { f.idx.push([im, im.count]); im.count++; } }
    if (o2.halo) f.halo = halos.add(x, 0.5, z, o2.halo, o2.haloSize ?? 1.5);
    floaters.push(f);
    return f;
  };
  // lantern buoy (all themes; used for docks + decor)
  const buoyBody = latheGeo([[0.01, -0.5], [0.32, -0.35], [0.38, 0.0], [0.3, 0.18], [0.08, 0.25], [0.06, 1.15], [0.01, 1.2]], 8);
  prep(buoyBody, { colorFn: (x, y) => (y < 0.2 ? mixArr(K.wood, K.rockHi, 0.3) : K.iron) });
  const buoyGlass = new THREE.OctahedronGeometry(0.16, 0);
  buoyGlass.scale(1, 1.5, 1); buoyGlass.translate(0, 1.0, 0);
  prep(buoyGlass, { color: [1, 1, 1] });
  const buoyMat = M(inkToon({ color: 0xffffff, vertexColors: true, rim: 0.5, rimColor: pal.light, steps: 3 }, { fogScale: 0.9 }));
  const buoyGlowMat = M(glowMaterial(pal.glow, 2.2));
  const nDecorBuoys = theme === 'paleabyss' ? 4 : 6;
  const buoyT = makeFloatType(buoyBody, buoyMat, L.docks.length + nDecorBuoys, 'buoys');
  const buoyG = makeFloatType(buoyGlass, buoyGlowMat, L.docks.length + nDecorBuoys, 'buoyLamps');
  const dockBuoys = [];
  for (const d of L.docks) dockBuoys.push(addFloater([buoyT, buoyG], d.buoy.x, d.buoy.z, { halo: scaleArr(PL.glow, 0.9), haloSize: 2.4, haloY: 1.0, bob: 0.8 }));
  const openPts = (n, minD, test) => {
    const out = [];
    for (let tries = 0; tries < n * 40 && out.length < n; tries++) {
      const a = rng() * TAU, d = Math.sqrt(rng()) * (R - 4);
      const x = Math.cos(a) * d, z = Math.sin(a) * d;
      if (!test(x, z)) continue;
      if (out.some((p) => Math.hypot(p.x - x, p.z - z) < minD)) continue;
      out.push({ x, z });
    }
    return out;
  };
  const clusterPts = (n, nClusters, spread, minD, test) => {
    const centres = openPts(nClusters, R * 0.35, (x, z) => test(x, z));
    const out = [];
    for (let tries = 0; tries < n * 30 && out.length < n && centres.length; tries++) {
      const c = centres[tries % centres.length];
      const a = rng() * TAU, d = Math.sqrt(rng()) * spread;
      const x = c.x + Math.cos(a) * d * 1.6, z = c.z + Math.sin(a) * d * 0.7;
      if (!test(x, z)) continue;
      if (out.some((p) => Math.hypot(p.x - x, p.z - z) < minD)) continue;
      out.push({ x, z });
    }
    return out;
  };
  const clearOf = (x, z, pad) => {
    if (Math.hypot(x, z) > L.shoreR(Math.atan2(z, x)) - pad) return false;
    for (const o of L.obstacles) if (Math.hypot(x - o.x, z - o.z) < o.r + pad) return false;
    if (Math.hypot(x - L.gate.x, z - L.gate.z) < L.gate.radius + 3 + pad) return false;
    return true;
  };
  for (const p of openPts(nDecorBuoys, 14, (x, z) => clearOf(x, z, 3) && Math.hypot(x - L.spawn.x, z - L.spawn.z) > 6)) {
    addFloater([buoyT, buoyG], p.x, p.z, { halo: scaleArr(PL.glow, 0.8), haloSize: 2.2, haloY: 1.0, bob: 0.8 });
  }
  if (theme === 'mossmere') {
    const pad = new THREE.CylinderGeometry(0.55, 0.55, 0.04, 12, 1, false, 0.3, TAU - 0.6);
    prep(pad, { colorFn: (x, y, z) => scaleArr(mixArr(K.moss, K.mossHi, 0.15 + 0.35 * vnoise3(x * 3, 0, z * 3)), 0.75) });
    const padMat = M(inkToon({ color: 0xffffff, vertexColors: true, rim: 0.18, rimColor: pal.far, steps: 3 }, { fogScale: 0.9 }));
    const flowerG = new THREE.ConeGeometry(0.1, 0.16, 6); flowerG.translate(0.1, 0.1, 0.05);
    prep(flowerG, { color: [1, 1, 1] });
    const flowerMat = M(glowMaterial(pal.accent, 2.4));
    const nP = low ? 40 : 75;
    const padT = makeFloatType(pad, padMat, nP, 'lilypads');
    const flT = makeFloatType(flowerG, flowerMat, 18, 'lilyflowers');
    // lily pads cluster in shallows around islands and the shore
    let placed = 0;
    for (let tries = 0; tries < 800 && placed < nP; tries++) {
      let x, z;
      if (rng() < 0.65 && L.islands.length) { const o = rng.pick(L.islands); const a = rng() * TAU, d = o.r + rng.range(0.6, 4); x = o.x + Math.cos(a) * d; z = o.z + Math.sin(a) * d; }
      else { const a = rng() * TAU, d = L.shoreR(a) - rng.range(1.5, 7); x = Math.cos(a) * d; z = Math.sin(a) * d; }
      if (!clearOf(x, z, 0.6)) continue;
      const withFlower = rng() < 0.22 && flT.count < 18;
      addFloater(withFlower ? [padT, flT] : [padT], x, z, { s: rng.range(0.6, 1.4), bob: 0.4, halo: withFlower ? scaleArr(PL.accent, 0.5) : null, haloSize: 0.8, haloY: 0.15 });
      placed++;
    }
  } else if (theme === 'sporewood') {
    const capG = latheGeo([[0.01, 0], [0.2, -0.02], [0.34, 0.02], [0.22, 0.12], [0.01, 0.16]], 10);
    prep(capG, { colorFn: (x, y) => (y < 0.01 ? scaleArr(PL.glow, 1.6) : mixArr(K.cap, K.capHi, y * 4)) });
    const capMat = M(new THREE.MeshBasicMaterial({ vertexColors: true, fog: true, toneMapped: false }));
    const n = low ? 22 : 40;
    const capT = makeFloatType(capG, capMat, n, 'floatcaps');
    for (const p of clusterPts(n, 5, 8, 2, (x, z) => clearOf(x, z, 1))) addFloater([capT], p.x, p.z, { s: rng.range(0.7, 1.6), bob: 0.5, drift: rng.range(0.6, 1.8), halo: rng() < 0.5 ? scaleArr(rng() < 0.5 ? PL.glow : PL.accent, 0.35) : null, haloSize: 1.1, haloY: 0.05 });
  } else if (theme === 'glasswater') {
    const shG = crystalGeo(0.16, 0.9, 6, 0.35); shG.translate(0, -0.45, 0);
    prep(shG, { colorFn: (x, y) => mixArr(mixArr(PL.ink, PL.glow, 0.3), scaleArr(PL.glow, 2.2), Math.max(0, Math.min(1, (y + 0.45) / 0.9))) });
    const shMat = M(new THREE.MeshBasicMaterial({ vertexColors: true, fog: true, toneMapped: false }));
    const n = low ? 10 : 16;
    const shT = makeFloatType(shG, shMat, n, 'floatshards');
    for (const p of openPts(n, 8, (x, z) => clearOf(x, z, 1.5))) addFloater([shT], p.x, p.z, { s: rng.range(0.8, 1.8), hover: rng.range(0.8, 2.4), spin: rng.range(0.2, 0.6) * (rng() < 0.5 ? -1 : 1), halo: scaleArr(PL.glow, 0.45), haloSize: 2.0, haloY: 0 });
  } else {
    const candG = new THREE.CylinderGeometry(0.06, 0.075, 0.26, 6); candG.translate(0, 0.08, 0);
    prep(candG, { colorFn: (x, y) => (y < -0.02 ? mixArr(K.wood, K.bone, 0.3) : K.bone) });
    const candMat = M(inkToon({ color: 0xffffff, vertexColors: true, rim: 0.4, rimColor: pal.light, steps: 3 }, { fogScale: 0.9 }));
    const flG = new THREE.ConeGeometry(0.035, 0.12, 5); flG.translate(0, 0.28, 0);
    prep(flG, { color: [1, 1, 1] });
    const flMat = M(glowMaterial(pal.glow, 3));
    const n = low ? 45 : 80;
    const cT = makeFloatType(candG, candMat, n, 'candles');
    const fT = makeFloatType(flG, flMat, n, 'candleflames');
    for (const p of clusterPts(n, 6, 9, 1.4, (x, z) => clearOf(x, z, 0.8))) {
      const lit = rng() < 0.42;
      addFloater(lit ? [cT, fT] : [cT], p.x, p.z, { s: rng.range(0.9, 1.6), bob: 0.6, drift: rng.range(0.4, 1.4), halo: lit ? scaleArr(PL.glow, 0.42) : null, haloSize: 0.9, haloY: 0.3 });
    }
  }
  halos.commit();

  mark('floaters');
  // ==================================================================== GATE
  const gate = buildGate();
  function buildGate() {
    const gg = new THREE.Group();
    gg.name = 'descentGate';
    gg.position.set(L.gate.x, 0, L.gate.z);
    const rad = L.gate.radius;
    const stones = [], glyphs = [];
    // flat rune ring at the waterline
    const ring = new THREE.TorusGeometry(rad + 0.55, 0.5, 6, 40);
    ring.rotateX(Math.PI / 2); ring.scale(1, 0.45, 1); ring.translate(0, 0.02, 0);
    stones.push(prep(ring, { colorFn: (x, y, z) => mixArr(K.stone, K.rock, 0.4 + 0.3 * vnoise3(x, y, z)) }));
    const nG = 24;
    for (let i = 0; i < nG; i++) {
      const a = (i / nG) * TAU;
      const g = new THREE.BoxGeometry(0.08, 0.02, i % 3 === 0 ? 0.5 : 0.3);
      glyphs.push(prep(g, { matrix: mat(Math.cos(a) * (rad + 0.55), 0.24, Math.sin(a) * (rad + 0.55), 0, -a + (i % 2 ? 0.5 : -0.4), 0), color: [1, 1, 1] }));
    }
    // standing stones with glyphs on their inner faces
    for (const s of L.gate.stones) {
      const lx = s.x - L.gate.x, lz = s.z - L.gate.z;
      const slab = rockGeo(rng, { r: 0.75, h: s.h * 0.5, detail: 1, rough: 0.22, flare: 0.15 });
      slab.scale(1, 1, 0.6);
      const face = Math.atan2(-lx, -lz);
      stones.push(prep(slab, { matrix: mat(lx, s.h * 0.42 - 0.3, lz, s.lean, face, s.lean * 0.5), colorFn: (x, y, z) => mixArr(K.stone, K.moss, y < 0.5 ? 0.45 : 0.1 * vnoise3(x * 2, y * 2, z * 2)) }));
      const fx = -lx / Math.hypot(lx, lz), fz = -lz / Math.hypot(lx, lz);
      for (let k = 0; k < 3; k++) {
        const yy = s.h * (0.35 + k * 0.17);
        glyphs.push(prep(new THREE.BoxGeometry(k === 1 ? 0.42 : 0.1, k === 1 ? 0.07 : 0.32, 0.03), { matrix: mat(lx + fx * 0.47, yy, lz + fz * 0.47, 0, face, k === 2 ? 0.6 : 0), color: [1, 1, 1] }));
      }
    }
    const stoneMesh = new THREE.Mesh(G(merge(stones)), rockMat);
    stoneMesh.name = 'gateStones';
    const sol = new THREE.Mesh(stoneMesh.geometry, olRock); sol.renderOrder = -1; stoneMesh.add(sol);
    const glyphMat = M(new THREE.MeshBasicMaterial({ color: new THREE.Color(pal.glow), fog: true, toneMapped: false }));
    const glyphMesh = new THREE.Mesh(G(merge(glyphs)), glyphMat);
    const vort = M(vortexMaterial());
    vort.uniforms.uGlow.value.set(pal.glow); vort.uniforms.uFoam.value.set(pal.foam); vort.uniforms.uDeep.value.set(pal.waterDeep);
    const disc = new THREE.Mesh(G(new THREE.CircleGeometry(rad + 0.2, 64).rotateX(-Math.PI / 2)), vort);
    disc.position.y = 0.09; disc.renderOrder = 1;
    const colM = M(columnMaterial()); colM.uniforms.uColor.value.set(pal.glow);
    const column = new THREE.Mesh(G(new THREE.CylinderGeometry(rad * 0.55, rad * 0.95, 30, 32, 1, true).translate(0, 15, 0)), colM);
    column.renderOrder = 5;
    const spiral = createSpiral(low ? 70 : 140, rad, rng);
    G(spiral.geo); M(spiral.mat);
    spiral.uniforms.uColor.value.set(pal.glow); spiral.uniforms.uFoam.value.set(pal.foam);
    gg.add(stoneMesh, glyphMesh, disc, column, spiral.points);
    group.add(gg);
    const haloI = halos.add(L.gate.x, 1.2, L.gate.z, [0, 0, 0], rad * 4.5);
    halos.commit();
    const anchor = addAnchor(L.gate.x, 1.5, L.gate.z, pal.glow, 0, 22);
    anchor.gate = true;
    const glowC = lin(pal.glow);
    const st = { state: 'sealed', open: 0, seal: 1, vis: 1, burst: 0 };
    return {
      group: gg, anchor,
      set(state, instant) {
        const prev = st.state;
        st.state = state;
        if (instant) { st.open = state === 'open' ? 1 : 0; st.vis = state === 'hidden' ? 0 : 1; st.burst = 0; }
        else if (state === 'open' && prev !== 'open') st.burst = 1;
      },
      get state() { return st.state; },
      get openK() { return st.open; },
      update(dt, t, env) {
        const tOpen = st.state === 'open' ? 1 : 0, tVis = st.state === 'hidden' ? 0 : 1;
        st.open += (tOpen - st.open) * Math.min(1, dt * (tOpen ? 0.9 : 2.5));
        st.vis += (tVis - st.vis) * Math.min(1, dt * 3);
        st.burst = Math.max(0, st.burst - dt * 0.6);
        gg.visible = st.vis > 0.02;
        if (!gg.visible) { halos.setColor(haloI, 0, 0, 0); anchor.intensity = 0; return; }
        const o = st.open, glowAmt = (0.18 + 0.82 * o + st.burst * 1.2) * env.glowK;
        glyphMat.color.setRGB(glowC[0] * (0.4 + 2.2 * o) * glowAmt, glowC[1] * (0.4 + 2.2 * o) * glowAmt, glowC[2] * (0.4 + 2.2 * o) * glowAmt);
        vort.uniforms.uTime.value = t; vort.uniforms.uOpen.value = o * st.vis; vort.uniforms.uSeal.value = st.vis * (1 - o);
        colM.uniforms.uTime.value = t; colM.uniforms.uOpen.value = o * (0.8 + st.burst);
        column.visible = o > 0.01;
        spiral.uniforms.uTime.value = t; spiral.uniforms.uOpen.value = o;
        spiral.points.visible = o > 0.01;
        const hk = (0.08 + 1.1 * o + st.burst) * env.glowK;
        halos.setColor(haloI, glowC[0] * hk, glowC[1] * hk, glowC[2] * hk);
        halos.touchColors();
        anchor.intensity = 7 * o + 10 * st.burst;
        gg.scale.setScalar(0.6 + 0.4 * st.vis);
      },
      viewH(h) { spiral.uniforms.uViewH.value = h; },
    };
  }

  // ==================================================================== MIST + PARTICLES
  const mist = M(mistMaterial());
  {
    const g = G(new THREE.CylinderGeometry(R + 1.5, R + 1.5, 11, low ? 64 : 128, 1, true));
    g.translate(0, 4.5, 0);
    const m = new THREE.Mesh(g, mist);
    m.renderOrder = -2; m.frustumCulled = false; m.name = 'shoreMist';
    mist.uniforms.uRep.value = Math.round(R / 3);
    group.add(m);
  }
  // foam/ripple rings hugging every island, pillar and gate stone
  const ringSrc = [];
  for (const o of L.islands) ringSrc.push({ x: o.x, z: o.z, r: o.r * 1.08 + 0.1, seed: o.seed });
  for (const p of L.pillars) ringSrc.push({ x: p.x, z: p.z, r: p.r * 0.9, seed: p.seed });
  for (const s of L.gate.stones) ringSrc.push({ x: s.x, z: s.z, r: s.r * 0.9, seed: s.a * 10 });
  for (const d of L.docks) for (const p of d.posts) ringSrc.push({ x: p.x, z: p.z, r: 0.25, seed: p.x });
  const foam = createShoreRings(ringSrc);
  G(foam.geo); M(foam.mat);
  group.add(foam.mesh);
  // low mist sheets drifting over the water
  const sheetSrc = [];
  for (let i = 0; i < (low ? 8 : 16); i++) {
    const a = rng() * TAU, d = Math.sqrt(rng()) * R * 0.9;
    sheetSrc.push({ x: Math.cos(a) * d, y: rng.range(0.35, 1.6), z: Math.sin(a) * d, size: rng.range(14, 28), phase: rng() * TAU, drift: rng.range(0.5, 1.5) });
  }
  const sheets = createMistSheets(sheetSrc);
  G(sheets.geo); M(sheets.mat);
  group.add(sheets.mesh);

  const PCFG = {
    mossmere: [
      { count: 380, box: [64, 14, 64], yMin: 0.2, size: 0.11, vel: [0.12, 0.06, 0.05], sway: 0.9, twinkle: 0.8, colorA: mixHex(pal.light, pal.glow, 0.3), colorB: pal.accent },
      { count: 80, box: [76, 5, 76], yMin: 0.4, size: 0.24, vel: [0.05, 0.02, -0.04], sway: 1.8, twinkle: 2.4, colorA: pal.glow, colorB: pal.accent },
    ],
    sporewood: [
      { count: 440, box: [64, 16, 64], yMin: 0.0, size: 0.13, vel: [0.05, 0.32, 0.03], sway: 1.0, twinkle: 0.6, colorA: pal.glow, colorB: pal.accent },
      { count: 60, box: [80, 18, 80], yMin: 1.5, size: 0.55, vel: [0.04, 0.12, 0.02], sway: 1.6, twinkle: 0, colorA: pal.accent, colorB: pal.glow, opacity: 0.45 },
    ],
    glasswater: [
      { count: 380, box: [64, 16, 64], yMin: 0.0, size: 0.09, vel: [0.02, -0.14, 0.03], sway: 0.5, twinkle: 5.0, colorA: pal.glow, colorB: pal.accent },
      { count: 60, box: [80, 16, 80], yMin: 1.0, size: 0.42, vel: [0.06, 0.03, -0.02], sway: 1.2, twinkle: 0.4, colorA: pal.accent, colorB: pal.light, opacity: 0.5 },
    ],
    paleabyss: [
      { count: 520, box: [64, 16, 64], yMin: 0.0, size: 0.12, vel: [0.12, -0.38, 0.06], sway: 0.6, twinkle: 0, colorA: mixHex(pal.accent, pal.fog, 0.35), colorB: pal.accent, additive: false, opacity: 0.45, flake: true },
      { count: 70, box: [64, 12, 64], yMin: 0.0, size: 0.13, vel: [0.02, 0.45, 0.0], sway: 0.7, twinkle: 3.0, colorA: pal.glow, colorB: 0xffd890 },
    ],
  };
  const particles = (PCFG[theme] || PCFG.mossmere).map((c) => {
    const cfg = { ...c, count: Math.round(c.count * (low ? 0.5 : 1)) };
    const p = createParticles(cfg, rng);
    G(p.geo); M(p.mat);
    p.base = { a: new THREE.Color(cfg.colorA), b: new THREE.Color(cfg.colorB) };
    group.add(p.points);
    return p;
  });

  mark('gate+fx');
  // ==================================================================== mood colours
  const tmpA = new THREE.Color(), tmpB = new THREE.Color(), tmpC = new THREE.Color();
  const C = (hex) => new THREE.Color(hex);
  const base = {
    ink: C(pal.ink), fog: C(pal.fog), far: C(pal.far), light: C(pal.light), glow: C(pal.glow), ambient: C(pal.ambient),
    cold: C(0x0a1430), warm: C(0xffc49a), mistWarm: C(0xc08a6a),
  };
  const farLum = new THREE.Color(), inkNear = new THREE.Color(), mistC = new THREE.Color();

  function applyMood(env) {
    // env: { night 0..1, warm 0..1, fog: Color (final fog colour), glowK, shaftK, partK }
    const n = env.night, w = env.warm;
    farLum.copy(base.far).lerp(base.light, 0.12).multiplyScalar(1.12);
    farLum.lerp(tmpA.copy(base.far).multiplyScalar(0.24).lerp(base.cold, 0.4), n * 0.92);
    farLum.lerp(tmpA.copy(farLum).lerp(base.warm, 0.42).multiplyScalar(1.25), w * 0.65);
    inkNear.copy(base.ink).lerp(env.fog, 0.1);
    const nR = rings.length;
    for (let i = 0; i < nR; i++) {
      const r = rings[i], t = r.t, u = r.mat.uniforms;
      const f = 0.04 + 0.84 * Math.pow(t, 1.35);
      u.uColor.value.copy(inkNear).lerp(farLum, f);
      u.uMist.value.copy(inkNear).lerp(env.fog, 0.5 + 0.5 * t).lerp(farLum, 0.15 + 0.65 * t);
      u.uRim.value.copy(farLum).lerp(base.light, 0.45).multiplyScalar((1.25 - 0.6 * t) * (1 - 0.55 * n));
      u.uGlow.value.copy(base.glow).multiplyScalar((1.7 - 0.7 * t) * env.glowK);
      u.uVault.value.copy(base.ink).lerp(env.fog, 0.3 + 0.25 * t);
    }
    const du = domeMat.uniforms;
    du.uHorizon.value.copy(farLum).lerp(env.fog, 0.25);
    du.uMid.value.copy(env.fog).lerp(base.ink, 0.5);
    du.uZenith.value.copy(base.ink).lerp(env.fog, 0.12);
    du.uWorm.value.copy(base.glow).multiplyScalar(1.4 * env.glowK);
    du.uCrack.value.copy(base.light).lerp(base.warm, w * 0.5).multiplyScalar(1.2 * env.shaftK + 0.15);
    shafts.uniforms.uColor.value.copy(base.light).lerp(base.warm, w * 0.65);
    shafts.uniforms.uIntensity.value = env.shaftK;
    mist.uniforms.uColor.value.copy(env.fog).lerp(farLum, 0.5);
    mist.uniforms.uAmt.value = 0.5 * (1 - 0.35 * n);
    foam.uniforms.uColor.value.set(pal.foam).multiplyScalar(0.22 * (1 - 0.45 * n));
    sheets.uniforms.uColor.value.copy(env.fog).lerp(farLum, 0.22 - 0.12 * n);
    sheets.uniforms.uAmt.value = 0.55 + 0.5 * n;
    halos.uniforms.uBright.value = env.glowK;
    for (const p of particles) p.uniforms.uBright.value = env.partK;
    // ink outlines pick up a hint of fog at distance automatically (fog:true)
  }

  // ==================================================================== per-frame
  const _v = new THREE.Vector3();
  let viewH = 720;
  function update(dt, t, focus, env) {
    const wh = ctx.water?.getHeight;
    const hasWater = typeof wh === 'function' && !ctx.water.isStub;
    domeMat.uniforms.uTime.value = t;
    shafts.uniforms.uTime.value = t;
    mist.uniforms.uTime.value = t;
    foam.uniforms.uTime.value = t;
    sheets.uniforms.uTime.value = t;
    halos.uniforms.uTime.value = t;
    halos.uniforms.uFogD.value = env.fogDensity;
    for (let i = 0; i < rings.length; i++) rings[i].mat.uniforms.uTime.value = t;
    const r = ctx.render?.renderer;
    if (r && r.getDrawingBufferSize) { r.getDrawingBufferSize(_v2); viewH = _v2.y || viewH; }
    halos.uniforms.uViewH.value = viewH;
    for (const p of particles) {
      const u = p.uniforms;
      u.uTime.value = t; u.uViewH.value = viewH; u.uFogD.value = env.fogDensity;
      if (focus) u.uCenter.value.set(focus.x, 0, focus.z);
    }
    gate.viewH(viewH);
    gate.update(dt, t, env);
    // floaters bob on the water
    let touched = false;
    for (let i = 0; i < floaters.length; i++) {
      const f = floaters[i];
      let x = f.ox, z = f.oz;
      if (f.drift) { x += Math.sin(t * 0.05 * f.drift + f.ph) * f.drift * 1.5; z += Math.cos(t * 0.043 * f.drift + f.ph * 1.7) * f.drift * 1.5; }
      f.x = x; f.z = z;
      let h = 0, tx = 0, tz = 0;
      if (hasWater) {
        h = wh(x, z) || 0;
        tx = ((wh(x + 0.6, z) || 0) - h) * 1.2 * f.bob; tz = ((wh(x, z + 0.6) || 0) - h) * 1.2 * f.bob;
      } else { h = Math.sin(t * 1.3 + f.ph) * 0.04; }
      const y = h * f.bob + f.hover + (f.hover ? Math.sin(t * 0.9 + f.ph) * 0.25 : 0);
      const ry = f.ry + t * f.spin;
      e4.set(-tz + (f.hover ? Math.sin(t * 0.7 + f.ph) * 0.15 : 0), ry, tx, 'YXZ');
      q4.setFromEuler(e4);
      s4.setScalar(f.s);
      m4.compose(p4.set(x, y, z), q4, s4);
      for (let k = 0; k < f.idx.length; k++) f.idx[k][0].setMatrixAt(f.idx[k][1], m4);
      if (f.halo >= 0) { halos.setPos(f.halo, x, y + f.haloY * f.s, z); touched = true; }
    }
    for (const im of floatMeshes) im.instanceMatrix.needsUpdate = true;
    if (touched) halos.touchPositions();
  }
  const _v2 = new THREE.Vector2();

  group.add(halos.points);

  function dispose() {
    group.parent?.remove(group);
    for (const g of bin.geos) g.dispose();
    for (const m of bin.mats) m.dispose();
    for (const t of bin.texs) t.dispose();
    bin.geos.clear(); bin.mats.clear(); bin.texs.clear();
  }

  return {
    group, anchors, update, applyMood, dispose, rings, statics,
    crackTop, crackBottom, dockBuoys, halos,
    setGate: (s, instant) => gate.set(s, instant),
    get gateState() { return gate.state; },
    get gateOpenK() { return gate.openK; },
    gateAnchor: gate.anchor,
    stats() { return { rings: rings.length, anchors: anchors.length, halos: halos.count, floaters: floaters.length, buildMs: prof }; },
  };
}

function mixHex(a, b, t) { return new THREE.Color(a).lerp(new THREE.Color(b), t).getHex(); }
