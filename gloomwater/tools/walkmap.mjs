#!/usr/bin/env node
// tools/walkmap.mjs — ASCII map + walk times of a walking lake, generated from src/data.js (DESIGN §24.6).
// Usage: node tools/walkmap.mjs <sporewood|glasswater|paleabyss> [--open]   (--open = all shortcuts opened)
import * as D from '../src/data.js';
import * as WL from './walk-lib.mjs';

const id = process.argv[2] || 'sporewood';
const zone = D.ZONE_BY_ID[id];
if (!zone?.arena?.walk) { console.log(`${id}: no walk layout (raft-only lake)`); process.exit(0); }
const A = zone.arena, F = D.WALK_FLAGS, R = A.radius;
const open = process.argv.includes('--open') ? WL.openAll(zone) : {};
const G = D.walkGridFor(zone, { open });
const seeds = WL.footSeeds(G, zone);
const dist = WL.walkDistances(G, zone, seeds);
const RM = WL.raftMask(G);

const marks = [];
const mark = (p, ch) => p && isFinite(p.x) && marks.push([p.x, p.z, ch]);
(A.docks || []).forEach((d) => mark(d, 'M'));
(A.moorings || []).forEach((m) => mark(m.slot, 'R'));
(A.deeds || []).forEach((d) => (d.points || [d.at]).forEach((p) => mark(p, '*')));
(A.lamps || []).forEach((l) => mark(l, 'L'));
(A.places || []).forEach((p, i) => mark(p.stand || p.raftStand || { x: (p.water.x ?? 0), z: (p.water.z ?? 0) }, String.fromCharCode(97 + i)));
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
    else if (f & F.GROUND) { const y = G.top[k]; c = (f & F.BRIDGE) ? '=' : y < 2.2 ? '.' : y < 5.5 ? ':' : '^'; }
    else if (f & F.POOL) c = 'o';
    else if (f & F.WATER) c = '~';
    s += c;
  }
  rows.push(s.replace(/\s+$/, ''));
}
console.log(rows.join('\n'));
console.log("legend: ~ open water  o enclosed pool  . walkway < 2.2 m  : 2.2–5.5 m  ^ ≥ 5.5 m  = bridge  @ obstacle  # cliff");
console.log('        S spawn  G gate  R raft mooring  M Murk dock  L Waylamp  * deed  a… places (in data order)');
const W = D.BALANCE.walk, v = D.STATS.moveSpeed.base * W.speedMult;
const t = (d) => (d === Infinity ? '—' : `${(d / v).toFixed(1)} s`);
const at = (p) => dist[G.idx(p.x, p.z)];
console.log(`\nwalk times from ${A.spawnMode === 'foot' ? 'the spawn' : 'the nearest mooring'} at ${v.toFixed(1)} m/s (${Object.keys(open).length ? 'shortcuts open' : 'shortcuts closed'}):`);
(A.places || []).forEach((p, i) => console.log(`  ${String.fromCharCode(97 + i)} ${p.name.padEnd(28)} ${p.stand ? t(at(p.stand)) : '(raft / roaming)'}`));
(A.lamps || []).forEach((l) => console.log(`  L ${l.name.padEnd(28)} ${t(at(l))}`));
const pd = (a, b) => { const dd = WL.walkDistances(G, zone, [G.idx(a.x, a.z)]); return dd[G.idx(b.x, b.z)]; };
const P = Object.fromEntries((A.places || []).filter((p) => p.stand).map((p) => [p.id, p.stand]));
const pairs = (A.places || []).filter((p) => p.stand);
console.log('\nplace ↔ place (s):');
for (let i = 0; i < pairs.length; i++) {
  const row = pairs.map((q, j) => (j <= i ? '' : t(pd(pairs[i].stand, q.stand)))).filter(Boolean);
  if (row.length) console.log(`  ${pairs[i].id.padEnd(20)} → ${pairs.slice(i + 1).map((q, j) => `${q.id} ${row[j]}`).join(', ')}`);
}
let wk = 0, pl = 0, tot = 0;
for (let k = 0; k < G.n * G.n; k++) { const f = G.flags[k]; if (f & F.VOID) continue; tot++; if (WL.isWalk(G, k)) wk++; else if (f & F.POOL) pl++; }
console.log(`\nshares: walkable ${(100 * wk / tot).toFixed(0)}%, enclosed pools ${(100 * pl / tot).toFixed(1)}%, water ${(100 * (tot - wk - pl) / tot).toFixed(0)}%; raft cells ${RM.reduce((a, b) => a + b, 0)}`);
void P;
