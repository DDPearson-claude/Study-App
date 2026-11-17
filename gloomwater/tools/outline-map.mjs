// tools/outline-map.mjs — a top-down debug render of an outline water (docs/loop/LAKE2.md §9, lane W1): the shore and the islands from
// the distance field, the depth in the water, the ground's height on the land, the places' footprints, the docks, the mooring's hulls,
// the spawn and every glide out, drawn on one PNG (north up). Pure node: no browser.
//   node tools/outline-map.mjs [--water=sporewood] [--px=4] [--out=path.png]
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

globalThis.GW_V3 = true; globalThis.GW_LOOP = true;
const D = await import('../src/data.js');
const WL = await import('../src/world-layout.js');
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const water = arg('water', 'sporewood'), PX = Math.max(1, Number(arg('px', 4)) || 4);
const out = arg('out', `outline-${water}.png`);

const Z = D.ZONE_BY_ID[water];
const t0 = performance.now();
const L = WL.buildLayout(Z);
const ms = performance.now() - t0;
if (!L.outline) { console.error(`${water}: no outline shore in this build`); process.exit(1); }
const B = L.outline.bbox, M = 10;
const x0 = Math.floor(B.x0 - M), x1 = Math.ceil(B.x1 + M), z0 = Math.floor(B.z0 - M), z1 = Math.ceil(B.z1 + M);
const W = (x1 - x0) * PX, H = (z1 - z0) * PX;
const img = new Uint8Array(W * H * 3);
const set = (px, py, r, g, b) => { if (px < 0 || py < 0 || px >= W || py >= H) return; const i = (py * W + px) * 3; img[i] = r; img[i + 1] = g; img[i + 2] = b; };
const toPx = (x, z) => [Math.round((x - x0) * PX), Math.round((z - z0) * PX)];
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
// the field: water by depth (pale shallows to ink deep), land by height (low mud to high bank), the shore's line where the field crosses 0
for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
  const x = x0 + (px + 0.5) / PX, z = z0 + (py + 0.5) / PX, s = WL.shoreDist(L, x, z);
  let c;
  if (s > 0) { const d = WL.depthAt(L, x, z); c = mix([150, 146, 210], [22, 18, 60], d); if (Math.abs(d - 0.35) < 0.006 || Math.abs(d - 0.75) < 0.006) c = mix(c, [255, 255, 255], 0.35); }
  else { const g = WL.groundAt(L, x, z); c = mix([92, 104, 70], [196, 186, 150], Math.min(1, g / 14)); if (Math.abs((g % 2 + 2) % 2 - 1) < 0.05) c = mix(c, [40, 40, 30], 0.25); }
  if (Math.abs(s) < 0.6 / PX + 0.12) c = [10, 8, 20];
  set(px, py, ...c);
}
const disc = (x, z, r, col, fill = false) => {
  const [cx, cy] = toPx(x, z), R = r * PX;
  for (let a = 0; a < 720; a++) { const t = (a / 720) * Math.PI * 2; set(Math.round(cx + Math.cos(t) * R), Math.round(cy + Math.sin(t) * R), ...col); }
  if (fill) for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) if (dx * dx + dy * dy <= R * R) set(Math.round(cx + dx), Math.round(cy + dy), ...col);
};
const line = (a, b, col) => { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * PX * 2) + 1; for (let k = 0; k <= n; k++) { const [px, py] = toPx(a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n); set(px, py, ...col); } };
// the places (gold), the legend's water (amber), the docks (white), the spawn (cyan), the mooring's hulls (rust) and its lane, every glide out (red)
for (const id of D.loopPlaceIds(water)) { const p = D.loopPlace(id); if (p?.area?.kind === 'disc') { disc(p.area.x, p.area.z, p.area.r, [240, 200, 80]); disc(p.area.x, p.area.z, p.area.r + 1.5, [170, 140, 70]); } }
if (L.legendPool) disc(L.legendPool.x, L.legendPool.z, L.legendPool.r, [255, 150, 40]);
for (const d of L.docks) { disc(d.x, d.z, 0.8, [255, 255, 255], true); for (const p of d.posts || []) disc(p.x, p.z, p.r + 0.2, [255, 255, 255], true); }
disc(L.spawn.x, L.spawn.z, 1.2, [80, 230, 240], true);
const Mo = D.loopMooring?.(water, L.docks);
if (Mo) { for (const c of Mo.circles) disc(c.x, c.z, c.r, c.kind === 'murk' ? [120, 200, 120] : [200, 90, 60]); for (const q of Mo.lane) disc(q.x, q.z, 0.6, [200, 90, 60], true); }
const plans = [D.sailPlan(L.docks[0], { x: 0, z: 0 }, D.LOOP.tutorial, water), ...D.loopPlaceIds(water).map((id) => D.loopSailPlan(L.docks[0], { water, place: id }))];
for (const g of plans) for (let i = 1; i < g.path.length; i++) line([g.path[i - 1].x, g.path[i - 1].z], [g.path[i].x, g.path[i].z], [230, 60, 60]);
// the PNG
const raw = Buffer.alloc((W * 3 + 1) * H);
for (let y = 0; y < H; y++) { raw[y * (W * 3 + 1)] = 0; Buffer.from(img.buffer, y * W * 3, W * 3).copy(raw, y * (W * 3 + 1) + 1); }
const crc = (buf) => { let c = ~0; for (const b of buf) { c ^= b; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); } return ~c >>> 0; };
const chunk = (type, data) => { const t = Buffer.from(type), len = Buffer.alloc(4), c = Buffer.alloc(4); len.writeUInt32BE(data.length); c.writeUInt32BE(crc(Buffer.concat([t, data]))); return Buffer.concat([len, t, data, c]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
writeFileSync(out, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
const O = L.outline;
console.log(`${water}: the layout in ${ms.toFixed(1)} ms; shore ${O.len.toFixed(0)} m, water ${O.area.toFixed(0)} m² inside the shore, grid ${O.grid.nx} × ${O.grid.nz}; R ${L.R}; ${W} × ${H} px → ${out}`);
