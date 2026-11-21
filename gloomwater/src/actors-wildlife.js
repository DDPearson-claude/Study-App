// actors-wildlife.js — the Mossmere's wildlife under the loop (the user, 18 Nov 2026: "Could we add some wildlife that lives on this lake
// that we dont interact with but they just go about their own business"; the look audit's three picks). Art only: nothing here reads
// the catch, the odds or the ledger; nothing takes a bait, blocks a cast or the raft, or stands over a home target. LOOP.wildlife holds
// the counts, speeds, colours and places; ?wild=0 (core.js) turns it all off. On the Mossmere under the loop (faceOn), at home and on
// trips; hidden on low and in a cinematic (the catch show's close-up, a lift's shot).
//   Wick-moths  one InstancedMesh of two-quad wings (4 tris a moth, 48 on high, 24 on medium): the orbit on a wobbling ellipse, the
//               settle on the post, the flutter to the next lamp and the flap all run in the vertex shader from aPh and the lamp slots
//               (one uniform array: the raft's lantern, the barge's rail lanterns, the bollards, buoy-lamps, gate slits and the Buoy
//               Lights' caps nearest the raft, re-picked twice a second; a dimmed lamp's moths drift to the nearest lit one). Lit only by
//               the lamp they circle: no glow of their own.
//   Lampbills   8 round little diving birds in pairs and threes (one InstancedMesh, ~80 tris a bird; paddle, dip, dive-tail and sleep
//               blend in its vertex stage), a faint dark V-wake and a matte dimple where one goes down or comes up (never a ring). The
//               state machine is pure and seeded (createLampbills / stepLampbills), the bob reads the water's height.
//   (the heron is actors-heron.js's, made to count there)
//   mothWake(phase, k, home)          → {wake, doze}: the share of the moths awake and the share dozing on their posts
//   lampSlots(cands, at, prev, o)     → {slots, next}: the lamps the moths fly (slot 0 the raft's lantern), stable as the raft moves
//   createLampbills(D, rng) / stepLampbills(B, o)   the birds (pure; the tests drive them)
//   attachWildlife(ctx)               main's line: {update(dt), state(), dispose()} or null
import * as THREE from 'three';
import { toonMaterial, setupSurface } from './toon.js';
import { prep, merge, mat, lin } from './world-geo.js';
import { faceOn, faceRng, lightOf } from './watercraft-face.js';

const TAU = Math.PI * 2;
const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

/** The wildlife's data (LOOP.wildlife) when it is on, else null. */
export function wildOn(D) { return D?.LOOP_ENABLED === true && D?.LOOP?.wildlife?.on === true ? D.LOOP.wildlife : null; }
/** How many of each this tier draws (low: none). */
export function wildCount(D, which, tier = 'high') { const c = wildOn(D)?.[which]?.count; return Math.max(0, num(c?.[tier], 0) | 0); }

// ------------------------------------------------------------------ wick-moths (pure parts)
/** The share of the moths awake and dozing: they wake at dusk (k ≥ 0.5) and thicken at gloomtide; a few doze in late day; at home
 *  (the Jetty's first light) the last of the night's are still at the rail lanterns. */
export function mothWake(phase, k = 0, home = false) {
  if (home) return { wake: 0.42, doze: 0.2 };
  const kk = clamp01(num(k));
  if (phase === 'dusk') return kk >= 0.5 ? { wake: 0.3 + 0.35 * (kk - 0.5) / 0.5, doze: 0.15 } : { wake: 0, doze: 0.15 };
  if (lightOf(phase) === 'night') return { wake: 0.75 + 0.25 * Math.min(1, kk / 0.15), doze: 0 };
  if (phase === 'dawn') return { wake: 0.6 * (1 - kk), doze: 0.15 };
  return { wake: 0, doze: kk >= 0.6 ? 0.12 : 0 };
}
/**
 * The lamps the moths fly: slot 0 is the raft's lantern (the candidate keyed 'raft'), the rest the nearest lit candidates (k > 0.2)
 * within `reach` m of `at`, a slot keeping its lamp while that lamp stays among them (so the moths are not shuffled as the raft moves);
 * an empty slot holds the raft's lantern. next[i]: the nearest other slot with a different lamp within `nextR` m (where its moths
 * flutter to), else i. cands: [{key, x, y, z, k}]; prev: the last call's slots. → {slots, next}
 */
export function lampSlots(cands, at, prev = [], { n = 8, reach = 45, nextR = 9 } = {}) {
  const raft = (cands || []).find((c) => c && c.key === 'raft') || null;
  const ax = num(at?.x), az = num(at?.z);
  const d2 = (c) => (c.x - ax) ** 2 + (c.z - az) ** 2;
  const lit = (cands || []).filter((c) => c && c.key !== 'raft' && num(c.k) > 0.2 && Number.isFinite(c.x) && d2(c) <= reach * reach).sort((a, b) => d2(a) - d2(b)).slice(0, n - 1);
  const slots = [raft];
  const keep = [];
  for (let i = 1; i < n; i++) { const p = prev[i]; keep[i] = p && p.key !== 'raft' ? lit.find((c) => c.key === p.key) || null : null; }
  const used = new Set(keep.filter(Boolean).map((c) => c.key));
  const free = lit.filter((c) => !used.has(c.key));
  for (let i = 1; i < n; i++) slots.push(keep[i] || free.shift() || raft);
  const next = slots.map((c, i) => {
    let best = i, bd = nextR * nextR;
    slots.forEach((o, j) => { if (j === i || !o || !c || o.key === c.key) return; const dd = (o.x - c.x) ** 2 + (o.z - c.z) ** 2; if (dd < bd) { bd = dd; best = j; } });
    return best;
  });
  return { slots, next };
}

const MOTH_VERT = /* glsl */`
#include <common>
#include <fog_pars_vertex>
uniform float uTime, uWake, uDoze, uMinY, uAmb;
uniform vec4 uLamp[8];    // the orbit's centre (the lamp lifted), k (how lit)
uniform vec4 uFrom[8];    // the centre its moths drift from, the drift's start time
uniform vec4 uShape[8];   // orbit radius, rest radius, rest height under the centre, next slot
uniform vec3 uLampCol;
attribute vec4 aPh;       // x: the cycle's phase, y: home slot, z: seed, w: wake rank
attribute float aHind;    // 0 the forewing's leading edge .. 1 the hindwing's trailing edge
varying float vHind; varying vec3 vLit;
vec3 lampC(int i) { return mix(uFrom[i].xyz, uLamp[i].xyz, smoothstep(uFrom[i].w, uFrom[i].w + 3.0, uTime)); }
vec3 orbitAt(int i, float t, float s) {
  vec3 C = lampC(i); float r = uShape[i].x;
  float w = mix(1.9, 3.3, fract(s * 7.31)) * (fract(s * 3.7) > 0.5 ? 1.0 : -1.0);
  float a = t * w + s * 40.0;
  vec2 e = vec2(cos(a) * r * mix(0.75, 1.0, fract(s * 5.3)), sin(a) * r * mix(0.5, 0.85, fract(s * 9.1)));
  float ro = s * 25.0;
  e = vec2(e.x * cos(ro) - e.y * sin(ro), e.x * sin(ro) + e.y * cos(ro));
  e += 0.07 * vec2(sin(t * 7.3 + s * 61.0), cos(t * 6.1 + s * 47.0));
  return C + vec3(e.x, 0.13 * sin(a * 2.0 + s * 9.0) + 0.05 * sin(t * 9.7 + s * 13.0), e.y);
}
vec3 restAt(int i, float s) { float a = s * 6.2831; return lampC(i) + vec3(cos(a) * uShape[i].y, uShape[i].z, sin(a) * uShape[i].y); }
// where the moth is at t (xyz) and how hard it flies (w: 1 flying, 0 settled); lamp: the slot whose lamp lights it
vec4 mothAt(float t, out int lamp) {
  float s = aPh.z;
  float cyc = t / mix(14.0, 22.0, fract(s * 11.3)) + aPh.x;
  float n = floor(cyc), u = cyc - n;
  int home = int(aPh.y + 0.5), nx = int(uShape[home].w + 0.5);
  bool odd = mod(n, 2.0) > 0.5;
  int ia = odd ? nx : home, ib = odd ? home : nx;
  lamp = ia;
  if (aPh.w >= uWake) { lamp = home; return vec4(restAt(home, s), 0.0); }   // dozing on its post
  if (u < 0.6) return vec4(orbitAt(ia, t, s), 1.0);
  if (u < 0.65) { float m = smoothstep(0.6, 0.65, u); return vec4(mix(orbitAt(ia, t, s), restAt(ia, s), m), 1.0 - m); }
  if (u < 0.85) return vec4(restAt(ia, s), 0.0);
  float m = smoothstep(0.85, 1.0, u);
  if (m > 0.5) lamp = ib;
  return vec4(mix(restAt(ia, s), orbitAt(ib, t, s), m) + vec3(0.0, sin(m * 3.14159) * 0.25, 0.0), 1.0);
}
void main() {
  int lamp; int l2;
  vec4 A = mothAt(uTime, lamp);
  vec4 B = mothAt(uTime + 0.05, l2);
  // (hidden while its own slot or the lamp it is at holds no lamp: an empty slot is dark, not piled on the raft's lantern)
  bool hide = aPh.w >= uWake + uDoze || uLamp[lamp].w < 0.05 || uLamp[int(aPh.y + 0.5)].w < 0.05;
  vec3 d = B.xyz - A.xyz;
  float yaw = length(d.xz) > 1e-4 ? atan(d.x, d.z) : aPh.z * 6.2831;
  // the wings flap about the body's long axis; settled, they lie in a low tent
  float beat = 0.2 + 1.0 * (0.5 + 0.5 * sin(uTime * 44.0 + aPh.z * 80.0));
  float flap = mix(0.12, beat, A.w);
  float ax = abs(position.x);
  vec3 q = vec3(sign(position.x) * ax * cos(flap), ax * sin(flap), position.z - ax * 0.25 * (1.0 - A.w));
  float cy = cos(yaw), sy = sin(yaw);
  vec3 w = vec3(q.x * cy + q.z * sy, q.y, -q.x * sy + q.z * cy) + A.xyz;
  w.y = max(w.y, uMinY);
  vec4 mvPosition = modelViewMatrix * vec4(w, 1.0);
  gl_Position = hide ? vec4(2.0, 2.0, 2.0, 1.0) : projectionMatrix * mvPosition;
  float dd = distance(w, lampC(lamp));
  vLit = uLampCol * (uLamp[lamp].w * 1.6 / (1.0 + dd * dd * 5.0)) + vec3(uAmb);
  vLit = min(vLit, vec3(0.9));   // (pale wax by the lamp, never a white spark)
  vHind = aHind;
  #include <fog_vertex>
}`;
const MOTH_FRAG = /* glsl */`
#include <common>
#include <fog_pars_fragment>
uniform vec3 uFore, uHind;
varying float vHind; varying vec3 vLit;
void main() {
  gl_FragColor = vec4(mix(uFore, uHind, smoothstep(0.35, 0.65, vHind)) * vLit, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;

function buildMoths(C, max, rng) {
  // one moth: two wing quads in its local frame (x across, +z forward), the forewing's edge at the front
  const h = num(C.span, 0.08) / 2;
  const P = [], H = [], I = [];
  for (const s of [-1, 1]) {
    const b = P.length / 3;
    P.push(s * 0.004, 0, 0.014, s * h, 0, 0.006, s * h * 0.8, 0, -0.024, s * 0.004, 0, -0.02);
    H.push(0, 0, 1, 1);
    I.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('aHind', new THREE.Float32BufferAttribute(H, 1));
  g.setIndex(I);
  // per moth: phase, home slot (about a third at the raft's lantern), seed, wake rank
  const ph = new Float32Array(max * 4);
  let other = 0;
  const share = num(C.raftShare, 0.34), slots = Math.max(2, num(C.slots, 8) | 0);
  for (let i = 0; i < max; i++) {
    const atRaft = (i % Math.max(2, Math.round(1 / share))) === 0;
    const slot = atRaft ? 0 : 1 + (other++ % (slots - 1));
    ph.set([rng(), slot, rng(), rng()], i * 4);
  }
  g.setAttribute('aPh', new THREE.InstancedBufferAttribute(ph, 4));
  const vec = () => Array.from({ length: slots }, () => new THREE.Vector4(0, -50, 0, 0));
  const u = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    uTime: { value: 0 }, uWake: { value: 0 }, uDoze: { value: 0 }, uMinY: { value: num(C.minY, 0.65) }, uAmb: { value: num(C.amb, 0.07) },
    uLampCol: { value: new THREE.Color(C.lampCol ?? 0xffb46a) }, uFore: { value: new THREE.Color(C.fore ?? 0xece4cf) }, uHind: { value: new THREE.Color(C.hind ?? 0x8a7fa3) },
  }]);
  u.uLamp = { value: vec() }; u.uFrom = { value: vec() }; u.uShape = { value: vec() };
  const m = new THREE.ShaderMaterial({ uniforms: u, vertexShader: MOTH_VERT, fragmentShader: MOTH_FRAG, side: THREE.DoubleSide, fog: true });
  const mesh = new THREE.InstancedMesh(g, m, max);
  mesh.name = 'wickMoths'; mesh.frustumCulled = false; mesh.visible = false;
  return { mesh, u, g, m };
}

// ------------------------------------------------------------------ lampbills (pure)
const clampTo = (g, R, x, z) => { const dx = x - g.x, dz = z - g.z, d = Math.hypot(dx, dz); return d <= R ? [x, z] : [g.x + (dx / d) * R, g.z + (dz / d) * R]; };
/** The birds at their beats (LOOP.wildlife.lampbills.groups), seeded; `n` caps the count. → B {birds, groups, C, t} */
export function createLampbills(D, rng = Math.random, n = null, C = wildOn(D)?.lampbills) {   // (C: another water's birds' data, LAKE 2's frogs)
  if (!C) return { birds: [], groups: [], C: null, t: 0 };
  const groups = (C.groups || []).map((g, i) => ({ ...g, i, R: num(g.r) + num(g.range, num(C.range, 1.5)), th: rng() * TAU, dir: rng() < 0.5 ? -1 : 1 }));
  const birds = [];
  const cap = n == null ? Infinity : n;
  for (const g of groups) for (let j = 0; j < g.n && birds.length < cap; j++) {
    const a = g.th - g.dir * j * 0.5;
    birds.push({ g: g.i, j, x: g.x + Math.cos(a) * g.r, z: g.z + Math.sin(a) * g.r, yaw: a + g.dir * Math.PI / 2, mode: 'paddle', t: 0, act: C.act[0] + rng() * (C.act[1] - C.act[0]),
      cool: 0, dur: 0, from: null, to: null, dip: 0, tuck: 0, dive: 0, wake: 0, dimple: 0, dives: 0, flees: 0, events: [] });
  }
  return { birds, groups, C, t: 0 };
}
/** Where a bird surfaces: 3–5 m off in its area, or (fleeing) the far side of its area from the raft. */
function diveTo(B, b, raft, flee, rng) {
  const C = B.C, g = B.groups[b.g];
  if (flee && raft) {
    const ax = b.x - raft.x, az = b.z - raft.z, l = Math.hypot(ax, az) || 1, d = C.fleeFar[0] + rng() * (C.fleeFar[1] - C.fleeFar[0]);
    const p1 = clampTo(g, g.R, b.x + (ax / l) * d, b.z + (az / l) * d);
    const gx = g.x - raft.x, gz = g.z - raft.z, gl = Math.hypot(gx, gz) || 1;
    const p2 = [g.x + (gx / gl) * g.R * 0.85, g.z + (gz / gl) * g.R * 0.85];
    const far = (p) => Math.hypot(p[0] - raft.x, p[1] - raft.z);
    return far(p1) >= far(p2) ? p1 : p2;
  }
  const a = rng() * TAU, d = C.surface[0] + rng() * (C.surface[1] - C.surface[0]);
  return clampTo(g, g.R, b.x + Math.cos(a) * d, b.z + Math.sin(a) * d);
}
/**
 * One step: o = {dt, raft: {x, z}, phase, rng}. By day and dusk each bird paddles its group's slow loop (a faint V-wake), dips its head
 * now and then and dives for 3–6 s, coming up 3–5 m off; the raft within `flee` m sends it under to the far side of its area (and it
 * stays down while the raft is over where it would come up); at night it swims to its roost slot and sleeps head-tucked, back at
 * first light. Every bird stays within its group's area (r + range). Events this step: 'dip', 'dive', 'flee', 'surface', 'sleep', 'wake'.
 */
export function stepLampbills(B, { dt = 0.016, raft = null, phase = 'calm', rng = Math.random } = {}) {
  const C = B.C;
  if (!C) return B;
  const night = lightOf(phase) === 'night';
  B.t += dt;
  for (const g of B.groups) g.th += g.dir * (C.speed / Math.max(0.8, g.r)) * dt;
  for (const b of B.birds) {
    b.events = []; b.t += dt; b.cool = Math.max(0, b.cool - dt);
    b.dimple = Math.max(0, b.dimple - dt * 0.8);
    const g = B.groups[b.g];
    const rd = raft ? Math.hypot(raft.x - b.x, raft.z - b.z) : Infinity;
    // its place on the water: in the group's loop by day, its slot in the roost at night; never inside the raft's flee ring
    let tx, tz;
    if (night) { const a = b.j * 2.1 + g.i; tx = g.roost.x + Math.cos(a) * (0.35 + 0.3 * b.j); tz = g.roost.z + Math.sin(a) * (0.35 + 0.3 * b.j); }
    else { const a = g.th - g.dir * b.j * 0.5, rr = g.r + (b.j - 1) * 0.25; tx = g.x + Math.cos(a) * rr; tz = g.z + Math.sin(a) * rr; }
    if (raft) { const dx = tx - raft.x, dz = tz - raft.z, d = Math.hypot(dx, dz); if (d < C.flee) { const s = C.flee / Math.max(0.01, d); tx = raft.x + dx * s; tz = raft.z + dz * s; } }
    [tx, tz] = clampTo(g, g.R, tx, tz);
    const startDive = (flee) => {
      b.mode = 'dive'; b.t = 0; b.checked = false; b.dur = C.dive[0] + rng() * (C.dive[1] - C.dive[0]); b.from = { x: b.x, z: b.z };
      const p = diveTo(B, b, raft, flee, rng); b.to = { x: p[0], z: p[1] };
      b.dimple = Math.max(b.dimple, 0.6); b.dives++; b.events.push('dive');
      if (flee) { b.flees++; b.events.push('flee'); }
    };
    if (b.mode !== 'dive' && (rd < num(C.keep, 3) || (rd < C.flee && b.cool <= 0))) { startDive(true); continue; }
    if (b.mode === 'dive') {
      const k = b.t;
      b.dive = k < 0.5 ? smooth(0, 0.5, k) : k > b.dur - 0.5 ? 1 - smooth(b.dur - 0.5, b.dur, k) : 1;
      const e = smooth(0.5, Math.max(0.6, b.dur - 0.5), k);
      b.x = b.from.x + (b.to.x - b.from.x) * e; b.z = b.from.z + (b.to.z - b.from.z) * e;
      if (b.to && Math.abs(b.to.x - b.from.x) + Math.abs(b.to.z - b.from.z) > 0.05) b.yaw = Math.atan2(b.to.x - b.from.x, b.to.z - b.from.z);
      // (the raft is over where it would come up: it stays down and swims on)
      if (!b.checked && k >= b.dur - 0.6) {
        b.checked = true;
        if (raft && Math.hypot(raft.x - b.to.x, raft.z - b.to.z) < C.flee * 0.6) {
          b.from = { x: b.x, z: b.z }; const p = diveTo(B, b, raft, true, rng); b.to = { x: p[0], z: p[1] }; b.t = 0.5; b.dur = Math.max(b.dur, 3); b.checked = false;
        }
      }
      if (k >= b.dur) { b.mode = 'paddle'; b.dive = 0; b.dimple = 1; b.cool = C.cool; b.t = 0; b.act = C.act[0] + rng() * (C.act[1] - C.act[0]); b.events.push('surface'); }
      b.wake = 0;
      continue;
    }
    // paddling (or swimming to the roost, or asleep there)
    const dx = tx - b.x, dz = tz - b.z, dl = Math.hypot(dx, dz);
    const sp = b.mode === 'sleep' ? 0.05 : C.speed * (dl > 1 ? 1.6 : 0.6 + dl * 0.4);
    const stepL = Math.min(dl, sp * dt);
    if (dl > 1e-4) { b.x += (dx / dl) * stepL; b.z += (dz / dl) * stepL; }
    [b.x, b.z] = clampTo(g, g.R, b.x, b.z);
    if (dl > 0.05 && b.mode !== 'sleep') { const want = Math.atan2(dx, dz); b.yaw += Math.atan2(Math.sin(want - b.yaw), Math.cos(want - b.yaw)) * Math.min(1, dt * 2.5); }
    b.wake += ((b.mode === 'sleep' ? 0 : clamp01(stepL / Math.max(1e-4, dt) / C.speed)) - b.wake) * Math.min(1, dt * 2);
    if (night) {
      if (b.mode !== 'sleep' && dl < 0.4) { b.mode = 'sleep'; b.events.push('sleep'); }
      b.tuck += ((b.mode === 'sleep' ? 1 : 0) - b.tuck) * Math.min(1, dt * 1.5);
      b.dip = Math.max(0, b.dip - dt * 3);
      if (b.mode === 'sleep') b.yaw += Math.sin(B.t * 0.13 + b.j) * dt * 0.05;
      continue;
    }
    if (b.mode === 'sleep') { b.mode = 'paddle'; b.events.push('wake'); }
    b.tuck = Math.max(0, b.tuck - dt);
    if (b.mode === 'dip') {
      b.dip = Math.sin(Math.PI * clamp01(b.t / b.dur));
      if (b.t >= b.dur) { b.mode = 'paddle'; b.dip = 0; b.t = 0; }
      continue;
    }
    b.act -= dt;
    if (b.act <= 0) {
      b.act = C.act[0] + rng() * (C.act[1] - C.act[0]);
      if (rng() < C.diveP) startDive(false);
      else { b.mode = 'dip'; b.t = 0; b.dur = C.dip[0] + rng() * (C.dip[1] - C.dip[0]); b.events.push('dip'); }
    }
  }
  return B;
}

// ------------------------------------------------------------------ the lampbill model (one geometry; the pose in the vertex stage)
function lampbillGeo(C) {
  const body = lin(C.body ?? 0x4f4a68), shield = lin(C.shield ?? 0xe6dcc4), feet = lin(C.feet ?? 0x8d8a99), ink = lin(0x0c0b16);
  const part = (g, v) => { g.setAttribute('aPart', new THREE.Float32BufferAttribute(typeof v === 'function' ? Array.from({ length: g.attributes.position.count }, (_, i) => v(g, i)) : new Array(g.attributes.position.count).fill(v), 1)); return g; };
  const parts = [];
  // the body: a round low float, darker on the back
  parts.push(part(prep(new THREE.SphereGeometry(0.12, 6, 4), { matrix: mat(0, 0.02, 0, 0, 0, 0, [1, 0.78, 1.35]), colorFn: (x, y) => (y > 0.06 ? body.map((c) => c * 0.8) : body) }), 0));
  // the head, its pale candle-wax shield on the brow, and the bill
  parts.push(part(prep(new THREE.SphereGeometry(0.064, 5, 3), { matrix: mat(0, 0.135, 0.13), color: body.map((c) => c * 0.7) }), 1));
  parts.push(part(prep(new THREE.SphereGeometry(0.032, 4, 3), { matrix: mat(0, 0.16, 0.172, 0, 0, 0, [1.55, 1.25, 0.8]), color: shield }), 1));
  const bill = new THREE.ConeGeometry(0.022, 0.065, 4); bill.rotateX(Math.PI / 2);
  parts.push(part(prep(bill, { matrix: mat(0, 0.125, 0.215), color: shield }), 1));
  // lobed grey feet trailing under the tail (they show as it tips up to dive)
  for (const s of [-1, 1]) { const f = new THREE.PlaneGeometry(0.05, 0.08); f.rotateX(-Math.PI / 2 + 0.3); parts.push(part(prep(f, { matrix: mat(s * 0.035, -0.05, -0.19), color: feet }), 2)); }
  // the V-wake: two thin arms from the breast spreading back over the water (3 at the bird, 3.9 at their ends)
  {
    const P = [], I = [], A = [], y = 0.012;
    for (const s of [-1, 1]) { const b = P.length / 3; P.push(s * 0.03, y, 0.05, s * 0.08, y, 0.03, s * 0.5, y, -1.0, s * 0.62, y, -0.96); A.push(3, 3, 3.9, 3.9); I.push(b, b + 2, b + 1, b + 1, b + 2, b + 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setIndex(I); g.computeVertexNormals();
    prep(g, { color: ink }); g.setAttribute('aPart', new THREE.Float32BufferAttribute(A, 1)); parts.push(g);
  }
  // the dimple: a soft dark spot (dark in its middle, gone at its edge: never a ring)
  { const d = new THREE.CircleGeometry(0.26, 8); d.rotateX(-Math.PI / 2); d.translate(0, 0.014, 0); prep(d, { color: ink }); part(d, (g, i) => (i === 0 ? 4 : 4.9)); parts.push(d); }
  return merge(parts);
}
const BILL_PARS = /* glsl */`
attribute float aPart;
attribute vec4 iPose;     // dip, tuck, dive, wake
attribute float iMark;    // the dimple
varying float vMarkA; varying float vMark;
vec3 lbRotX(vec3 v, float a) { float c = cos(a), s = sin(a); return vec3(v.x, v.y * c - v.z * s, v.y * s + v.z * c); }
float lbPitch() { return smoothstep(0.0, 0.5, iPose.z) * 1.3; }
`;
const BILL_NORMAL = /* glsl */`
if (aPart < 2.5) objectNormal = lbRotX(objectNormal, lbPitch());
`;
const BILL_POSE = /* glsl */`
vMarkA = 1.0; vMark = 0.0;
if (aPart > 0.5 && aPart < 1.5) {   // the head: dips forward and down, or tucks back onto the back
  vec3 pv = vec3(0.0, 0.07, 0.08);
  transformed = pv + lbRotX(transformed - pv, iPose.x * 1.2 + iPose.y * 0.55) + vec3(0.0, -0.035, -0.11) * iPose.y;
}
if (aPart < 2.5) {                  // the dive: head down, tail and feet up, then under
  transformed = lbRotX(transformed, lbPitch());
  transformed.y -= smoothstep(0.35, 1.0, iPose.z) * 0.5;
} else if (aPart < 3.95) {          // the wake: as strong as it paddles, fading along its arms
  vMark = 1.0; vMarkA = iPose.w * 0.5 * (1.0 - (aPart - 3.0) / 0.9);
} else {                            // the dimple: spreads a little as it fades
  vMark = 1.0; vMarkA = iMark * 0.5 * (1.0 - (aPart - 4.0) / 0.9);
  transformed.xz *= 0.7 + 0.6 * (1.0 - iMark);
}
`;
function buildLampbills(C, max, geoOf = lampbillGeo, name = 'lampbills') {
  const g = geoOf(C);
  g.setAttribute('iPose', new THREE.InstancedBufferAttribute(new Float32Array(max * 4), 4));
  g.setAttribute('iMark', new THREE.InstancedBufferAttribute(new Float32Array(max), 1));
  const m = toonMaterial({ color: 0xffffff, vertexColors: true, rim: 0.35, rimColor: 0xcfc8ec, steps: 3, transparent: true });
  m.alphaTest = 0.06;   // (the faint ends of a wake and a dimple are discarded, so they write no depth over the mist behind)
  const base = m.onBeforeCompile;
  m.onBeforeCompile = (sh, r) => {
    base(sh, r);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>${BILL_PARS}`)
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>${BILL_NORMAL}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>${BILL_POSE}`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vMarkA; varying float vMark;')
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.a *= vMarkA;')
      .replace('#include <opaque_fragment>', 'outgoingLight = mix(outgoingLight, diffuseColor.rgb * 0.6, vMark);\n#include <opaque_fragment>');
  };
  m.customProgramCacheKey = () => 'gwToonSurf:lampbill';
  const mesh = new THREE.InstancedMesh(g, m, max);
  mesh.name = name; mesh.frustumCulled = false; mesh.visible = false;
  setupSurface(mesh, { cast: false, reflect: false });
  return { mesh, g, m };
}

// ------------------------------------------------------------------ the lily frog (LAKE 2, lane W2: Sporewood's; the lampbill's parts and pose)
/** A squat frog 12 cm long (× its scale): a moss-green back, a cream throat, amber eyes; its hind legs (the "feet") show as it dives; its
 *  V-wake and dimple as the lampbill's. The parts keep the lampbill's aPart codes, so its pose stage drives it unchanged. */
function frogGeo(C) {
  const body = lin(C.body ?? 0x566e48), throat = lin(C.throat ?? 0xf0e2c8), eye = lin(C.eye ?? 0xe8ac4c), ink = lin(0x0c0b16);
  const back = body.map((c) => c * 0.72);
  const part = (g, v) => { g.setAttribute('aPart', new THREE.Float32BufferAttribute(typeof v === 'function' ? Array.from({ length: g.attributes.position.count }, (_, i) => v(g, i)) : new Array(g.attributes.position.count).fill(v), 1)); return g; };
  const parts = [];
  // the body: a squat dome, dark down the back, the cream throat under its chin (it sits on a pad: its belly at the water's skin)
  parts.push(part(prep(new THREE.SphereGeometry(0.06, 7, 5), { matrix: mat(0, 0.045, 0, 0, 0, 0, [1.05, 0.62, 1.2]), colorFn: (x, y, z) => (y < 0.035 && z > 0.02 ? throat : y > 0.07 ? back : body) }), 0));
  // the head: the brow and the two eye bumps, amber with a dark slit
  parts.push(part(prep(new THREE.SphereGeometry(0.042, 6, 4), { matrix: mat(0, 0.06, 0.055, 0, 0, 0, [1.25, 0.7, 0.9]), colorFn: (x, y) => (y < 0.05 ? throat : body) }), 1));
  for (const s of [-1, 1]) parts.push(part(prep(new THREE.SphereGeometry(0.016, 5, 3), { matrix: mat(s * 0.026, 0.082, 0.068), colorFn: (x, y, z) => (z > 0.078 ? ink : eye) }), 1));
  // the folded hind legs either side (they kick up as it dives)
  for (const s of [-1, 1]) parts.push(part(prep(new THREE.SphereGeometry(0.03, 5, 3), { matrix: mat(s * 0.055, 0.025, -0.035, 0, s * 0.4, 0, [0.7, 0.5, 1.4]), color: back }), 2));
  // the V-wake and the dimple, as the lampbill's
  {
    const P = [], I = [], A = [], y = 0.012;
    for (const s of [-1, 1]) { const b = P.length / 3; P.push(s * 0.02, y, 0.04, s * 0.05, y, 0.025, s * 0.35, y, -0.7, s * 0.45, y, -0.66); A.push(3, 3, 3.9, 3.9); I.push(b, b + 2, b + 1, b + 1, b + 2, b + 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setIndex(I); g.computeVertexNormals();
    prep(g, { color: ink }); g.setAttribute('aPart', new THREE.Float32BufferAttribute(A, 1)); parts.push(g);
  }
  { const d = new THREE.CircleGeometry(0.2, 8); d.rotateX(-Math.PI / 2); d.translate(0, 0.014, 0); prep(d, { color: ink }); part(d, (g, i) => (i === 0 ? 4 : 4.9)); parts.push(d); }
  return merge(parts);
}

// ------------------------------------------------------------------ main's line
/** Under the loop with the wildlife on: the moths and the lampbills on the Mossmere (high and medium; none on low). → {update, state, dispose} or null */
export function attachWildlife(ctx) {
  const W = wildOn(ctx?.data);
  const scene = ctx?.render?.scene;
  if (!W || !scene || ctx.render.isStub) return null;
  const MC = W.moths, BC = W.lampbills;
  const mothMax = Math.max(wildCount(ctx.data, 'moths', 'high'), wildCount(ctx.data, 'moths', 'medium'));
  const birdMax = Math.max(wildCount(ctx.data, 'lampbills', 'high'), wildCount(ctx.data, 'lampbills', 'medium'));
  const M = mothMax > 0 ? buildMoths(MC, mothMax, faceRng(0x3077a5)) : null;
  const L = birdMax > 0 ? buildLampbills(BC, birdMax) : null;
  if (M) scene.add(M.mesh);
  if (L) scene.add(L.mesh);
  const birdRng = faceRng(0x1a3b11);
  const B = createLampbills(ctx.data, birdRng, birdMax);
  // (LAKE 2, lane W2: another water's own life, LOOP.wildlife[water]: Sporewood's spore moths (the moths in its colours, round its
  // glowcaps) and its lily frogs (the lampbills' ways on the lily rafts))
  const FC = W.sporewood?.frogs || null;
  const frogMax = FC ? Math.max(num(FC.count?.high, 0), num(FC.count?.medium, 0)) | 0 : 0;
  const Fm = frogMax > 0 ? buildLampbills(FC, frogMax, frogGeo, 'lilyFrogs') : null;
  if (Fm) scene.add(Fm.mesh);
  const frogRng = faceRng(0xf209a5);
  const FB = Fm ? createLampbills(ctx.data, frogRng, frogMax, FC) : null;
  const fsc = new THREE.Vector3().setScalar(Math.max(0.5, num(FC?.scale, 1)));
  const mothCol = { fore: new THREE.Color(), hind: new THREE.Color(), zone: null };
  const S = { t: 0, pick: 0, slots: [], next: [], keys: [], on: false, wake: 0, doze: 0 };
  const raftLamp = { key: 'raft', kind: 'raft', x: 0, y: -50, z: 0, k: 1 };
  const v = new THREE.Vector3(), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(1, 1, 1), up = new THREE.Vector3(0, 1, 0);
  sc.setScalar(Math.max(0.5, num(BC?.scale, 1)));   // (the lampbills drawn at LOOP.wildlife.lampbills.scale)
  const zoneId = () => { try { return ctx.world?.getZone?.()?.id ?? ctx.state?.run?.zone ?? null; } catch { return null; } };
  const phaseInfo = () => { try { return ctx.survival?.getPhaseInfo?.() || null; } catch { return null; } };
  const kindOf = (k) => MC.kinds?.[k] || MC.kinds?.post || [0.2, 0.5, 0.1, 0];
  function candidates() {
    const out = [raftLamp];
    try { const h = ctx.actors?.home?.lamps?.(); if (h) h.pts.forEach((p, i) => out.push({ key: `barge${i}`, kind: 'barge', x: p[0], y: p[1], z: p[2], k: h.k })); } catch { /* optional */ }
    try { for (const l of ctx.world?.getLampSpots?.() || []) out.push(l); } catch { /* optional */ }
    return out;
  }
  const centreOf = (i) => { const a = M.u.uFrom.value[i], b = M.u.uLamp.value[i]; const t = smooth(a.w, a.w + 3, S.t); return [a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t]; };
  function setSlot(i, c, first) {
    const K = kindOf(c.kind), L4 = M.u.uLamp.value[i], F = M.u.uFrom.value[i];
    const x = c.x, y = c.y + K[0], z = c.z;
    if (first || (i > 0 && S.keys[i] === 'raft')) F.set(x, y, z, -10); else if (S.keys[i] !== c.key) { const p = centreOf(i); F.set(p[0], p[1], p[2], S.t); }
    L4.set(x, y, z, Math.min(1, num(c.k, 1)));
    M.u.uShape.value[i].set(K[1], K[2], K[3], S.next[i] ?? i);
    S.keys[i] = c.key;
  }
  function pickLamps(at, first = false) {
    const r = lampSlots(candidates(), at, S.slots, { n: M.u.uLamp.value.length, reach: num(MC.reach, 45), nextR: num(MC.next, 9) });
    S.slots = r.slots; S.next = r.next;
    r.slots.forEach((c, i) => setSlot(i, c || raftLamp, first));
  }
  function update(dt = 0.016, { show = false } = {}) {
    const q0 = ctx.render?.quality || 'high';
    const flow = ctx.flow, home = flow === 'home';
    // (hidden through the whole catch show: main's `show` from the reveal close-up at T0, ctx.cinematic from the lift)
    const zid = zoneId(), here = zid && zid !== 'mossmere' ? W[zid] || null : null;
    const on = q0 !== 'low' && (faceOn(ctx.data, zid) || !!here) && (flow === 'playing' || home) && !ctx.cinematic && !show;
    S.on = on;
    if (M) M.mesh.visible = on;
    if (L) L.mesh.visible = on && !here;
    if (Fm) Fm.mesh.visible = on && zid === 'sporewood';
    if (M && mothCol.zone !== zid) {   // (each water's moths in its own colours)
      mothCol.zone = zid;
      M.u.uFore.value.set(here?.moths?.fore ?? MC.fore ?? 0xece4cf); M.u.uHind.value.set(here?.moths?.hind ?? MC.hind ?? 0x8a7fa3);
      S.slots = [];
    }
    if (!on) return;
    const d = Math.min(0.1, Math.max(0, num(dt, 0)));
    S.t += d;
    const p = ctx.player?.position;
    const raft = p ? { x: p.x, z: p.z } : null;
    const pi = phaseInfo();
    const phase = pi?.phase || ctx.state?.run?.phase || 'calm';
    // ---- the moths
    if (M) {
      M.mesh.count = wildCount(ctx.data, 'moths', q0);
      try { const ll = ctx.actors?.lanternLight; if (ll?.getWorldPosition) { ll.getWorldPosition(v); raftLamp.x = v.x; raftLamp.y = v.y; raftLamp.z = v.z; } } catch { /* optional */ }
      S.pick -= d;
      if (S.pick <= 0 || !S.slots.length) { S.pick = 0.5; pickLamps(raft || raftLamp, !S.slots.length); }
      // (the raft's lantern rides with the raft every frame in slot 0; a later slot with no lamp of its own is dark, its moths hidden)
      const KR = kindOf('raft');
      S.slots.forEach((c, i) => { if (c === raftLamp || !c) M.u.uLamp.value[i].set(raftLamp.x, raftLamp.y + KR[0], raftLamp.z, i === 0 ? 1 : 0); });
      const wk = mothWake(phase, pi?.k, home);
      S.wake = wk.wake; S.doze = wk.doze;
      M.u.uWake.value = wk.wake; M.u.uDoze.value = wk.doze; M.u.uTime.value = S.t;
    }
    // ---- the lily frogs (Sporewood)
    if (Fm && Fm.mesh.visible) {
      const n = Math.min(FB.birds.length, Math.max(0, num(FC.count?.[q0], 0) | 0));
      stepLampbills(FB, { dt: d, raft, phase, rng: frogRng });
      const iP = Fm.g.attributes.iPose, iM = Fm.g.attributes.iMark;
      for (let i = 0; i < n; i++) {
        const b = FB.birds[i];
        let wy = 0;
        try { wy = ctx.water && !ctx.water.isStub ? num(ctx.water.getHeight?.(b.x, b.z), 0) : 0; } catch { wy = 0; }
        q.setFromAxisAngle(up, b.yaw);
        Fm.mesh.setMatrixAt(i, m4.compose(v.set(b.x, wy * 0.4 + 0.03, b.z), q, fsc));
        iP.setXYZW(i, b.dip, b.tuck, b.dive, b.wake);
        iM.setX(i, b.dimple);
        if (b.events.length && b.events.includes('dive')) { try { ctx.bus?.emit?.('wild:frogDive', { x: b.x, z: b.z }); } catch { /* optional */ } }   // (LAKE 2, lane A: its plop)
      }
      Fm.mesh.count = n;
      Fm.mesh.instanceMatrix.needsUpdate = true; iP.needsUpdate = true; iM.needsUpdate = true;
    }
    // ---- the lampbills
    if (L && L.mesh.visible) {
      const n = Math.min(B.birds.length, wildCount(ctx.data, 'lampbills', q0));
      stepLampbills(B, { dt: d, raft, phase, rng: birdRng });
      const iP = L.g.attributes.iPose, iM = L.g.attributes.iMark;
      for (let i = 0; i < n; i++) {
        const b = B.birds[i];
        let wy = 0;
        try { wy = ctx.water && !ctx.water.isStub ? num(ctx.water.getHeight?.(b.x, b.z), 0) : 0; } catch { wy = 0; }
        q.setFromAxisAngle(up, b.yaw);
        L.mesh.setMatrixAt(i, m4.compose(v.set(b.x, wy + Math.sin(S.t * 1.7 + i) * 0.01, b.z), q, sc));
        iP.setXYZW(i, b.dip, b.tuck, b.dive, b.wake);
        iM.setX(i, b.dimple);
      }
      L.mesh.count = n;
      L.mesh.instanceMatrix.needsUpdate = true; iP.needsUpdate = true; iM.needsUpdate = true;
    }
  }
  return {
    update,
    state: () => ({ on: S.on, moths: M ? { count: M.mesh.count, wake: +S.wake.toFixed(2), doze: +S.doze.toFixed(2), lamps: S.slots.map((c) => c?.key ?? null) } : null,
      lampbills: B.birds.map((b) => ({ g: b.g, mode: b.mode, x: +b.x.toFixed(2), z: +b.z.toFixed(2), dives: b.dives, flees: b.flees })),
      frogs: FB ? FB.birds.map((b) => ({ g: b.g, mode: b.mode, x: +b.x.toFixed(2), z: +b.z.toFixed(2), dives: b.dives, flees: b.flees })) : [] }),
    calls: () => (S.on ? (M ? 1 : 0) + (L?.mesh.visible ? 1 : 0) + (Fm?.mesh.visible ? 1 : 0) : 0),
    frogs: () => (FB ? FB.birds.map((b) => ({ g: b.g, mode: b.mode, x: +b.x.toFixed(2), z: +b.z.toFixed(2), dives: b.dives, flees: b.flees })) : []),
    dispose() { for (const o of [M, L, Fm]) if (o) { scene.remove(o.mesh); o.g.dispose(); o.m.dispose(); } },
  };
}
