#!/usr/bin/env node
// tools/walkmap.mjs — ASCII map + walk times of a walking lake, generated from src/data.js (DESIGN §24.6).
// Usage: node tools/walkmap.mjs <sporewood|glasswater|paleabyss> [--open] [--variant=<id>]
//   --open = all shortcuts opened; --variant = one of the lake's per-descent variants (walk.variants).
// Walk times are measured on the body-eroded grid (the Wick's radius), at the base foot speed.
import * as WL from './walk-lib.mjs';

const D = WL.D;
const id = process.argv[2] || 'sporewood';
const zone = D.ZONE_BY_ID[id];
if (!zone?.arena?.walk) { console.log(`${id}: no walk layout (raft-only lake)`); process.exit(0); }
const A = zone.arena, F = D.WALK_FLAGS, R = A.radius;
const open = process.argv.includes('--open') ? WL.openAll(zone) : {};
const variant = (process.argv.find((a) => a.startsWith('--variant=')) || '').split('=')[1] || null;
const G = D.walkGridFor(zone, { open, variant }), M = WL.erode(G);
const dist = WL.walkDistances(G, zone, WL.footSeeds(G, zone, M), M);
const RM = WL.raftMask(G);

const marks = [];
const mark = (p, ch) => p && isFinite(p.x) && marks.push([p.x, p.z, ch]);
(A.docks || []).forEach((d) => mark(d, 'M'));
(A.moorings || []).forEach((m) => mark(m.slot, 'R'));
(A.deeds || []).forEach((d) => (d.points || [d.at]).forEach((p) => mark(p, '*')));
(A.lamps || []).forEach((l) => mark(l, 'L'));
(A.places || []).forEach((p, i) => { mark(p.stand || p.raftStand || { x: (p.water.x ?? 0), z: (p.water.z ?? 0) }, String.fromCharCode(97 + i)); if (p.altStand) mark(p.altStand, String.fromCharCode(97 + i)); });
if (A.gate) mark(A.gate, 'G');
mark(A.spawn, 'S');
const CX = 2.5, CZ = 4, rows = [];
rows.push(`x: ${-R} (left) … ${R} (right); one char = ${CX} m, one row = ${CZ} m; north (−z) is up-screen`);
for (let z = -R; z <= R + 0.01; z += CZ) {
  let s = String(Math.round(z)).padStart(4) + ' ';
  for (let x = -R; x <= R + 0.01; x += CX) {
    const m = marks.slice().reverse().find(([mx, mz]) => Math.abs(mx - x) <= CX / 2 && Math.abs(mz - z) <= CZ / 2);
    if (m) { s += m[2]; continue; }
    const k = G.idx(x, z), f = G.flags[k];
    let c = ' ';
    if (k < 0 || (f & F.VOID)) c = Math.hypot(x, z) < R + 2 ? '#' : ' ';
    else if (f & F.BLOCK) c = '@';
    else if (f & F.GROUND) { const y = G.top[k]; c = (f & F.BRIDGE) ? '=' : (f & F.SILL) ? ',' : y < 2.2 ? '.' : y < 5.5 ? ':' : '^'; }
    else if (f & F.POOL) c = 'o';
    else if (f & F.WATER) c = '~';
    s += c;
  }
  rows.push(s.replace(/\s+$/, ''));
}
console.log(rows.join('\n'));
console.log("legend: ~ open water  o enclosed pool  . walkway < 2.2 m  : 2.2–5.5 m  ^ ≥ 5.5 m  , low sill  = bridge  @ obstacle  # cliff");
console.log('        S spawn  G gate  R raft mooring  M Murk dock  L sister-candle  * deed  a… places (in data order; a second letter = alt stand)');
const v = WL.footSpeed();
const t = (d) => (d === Infinity ? '—' : `${(d / v).toFixed(1)} s`);
const at = (p) => { const k = WL.snap(G, M, p.x, p.z, 2.0); return k >= 0 ? dist[k] : Infinity; };
console.log(`\nwalk times from ${A.spawnMode === 'foot' ? 'the spawn' : 'the nearest mooring'} at ${v.toFixed(1)} m/s (${Object.keys(open).length ? 'shortcuts open' : 'shortcuts closed'}${variant ? `, variant ${variant}` : ''}):`);
(A.places || []).forEach((p, i) => console.log(`  ${String.fromCharCode(97 + i)} ${p.name.padEnd(28)} ${p.stand && p.access !== 'raft' ? t(at(p.stand)) : '(raft / roaming)'}${p.altStand ? `   (${p.altStand.name} ${t(at(p.altStand))})` : ''}`));
(A.lamps || []).forEach((l) => console.log(`  L ${WL.lampName(zone, l).padEnd(28)} ${t(at(l))}`));
const pd = (a, b) => { const k = WL.snap(G, M, a.x, a.z, 2.0); const dd = WL.walkDistances(G, zone, [k], M); return at.call(null, b) === Infinity ? Infinity : dd[WL.snap(G, M, b.x, b.z, 2.0)]; };
const pairs = (A.places || []).filter((p) => p.stand && p.access !== 'raft');
console.log('\nplace ↔ place (s):');
for (let i = 0; i < pairs.length; i++) {
  const row = pairs.slice(i + 1).map((q) => `${q.id} ${t(pd(pairs[i].stand, q.stand))}`);
  if (row.length) console.log(`  ${pairs[i].id.padEnd(20)} → ${row.join(', ')}`);
}
let wk = 0, pl = 0, tot = 0;
for (let k = 0; k < G.n * G.n; k++) { const f = G.flags[k]; if (f & F.VOID) continue; tot++; if (WL.isWalk(G, k)) wk++; else if (f & F.POOL) pl++; }
console.log(`\nshares: walkable ${(100 * wk / tot).toFixed(0)}%, enclosed pools ${(100 * pl / tot).toFixed(1)}%, water ${(100 * (tot - wk - pl) / tot).toFixed(0)}%; raft cells ${RM.reduce((a, b) => a + b, 0)}`);
