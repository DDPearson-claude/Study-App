// tools/tests/veilback-brook.test.mjs — LOST-TACKLE §5 (lanes W and C): Veilback Brook, the stream behind the Sluice Veil.
// LT6 and the lanes' own checks, in node: the place and its pool, the reveal (owned, never a map), the cut in the layout (shut, then
// water), the world's banks and view, the art (the ring's mouth, the walls, no rock in its water, the reeds and the lily bed, the Veil
// across the mouth), the bake, Murk's line and the hold, and the Chart's ink. Run: node tools/tests/veilback-brook.test.mjs
import * as THREE from 'three';
import { loadLoopData, freshLoopMeta } from './loop-fixture.mjs';

const sink = () => new Proxy(function () {}, { get: (t, k) => (k === 'data' ? new Uint8ClampedArray(4) : k === 'width' || k === 'height' ? 1 : k === Symbol.toPrimitive ? () => 0 : sink()), apply: () => sink(), set: () => true });
globalThis.Path2D = globalThis.Path2D || class { constructor() {} };
globalThis.document = globalThis.document || { createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => sink(), toDataURL: () => '' }) };

const D = await loadLoopData({ query: 'brook' });
const WL = await import('../../src/world-layout.js');
const { buildArena } = await import('../../src/world-art.js');
const { buildPlaces } = await import('../../src/world-places.js');
const { create: createWorld } = await import('../../src/world.js');
const { createBus } = await import('../../src/core.js');
const PL = await import('../../src/progression-loop.js');
const LF = await import('../../src/loop-finds.js');
const UL = await import('../../src/ui-loop.js');
const UC = await import('../../src/ui-chart.js');
const CG = await import('../../src/chart-gild.js');
const WF = await import('../../src/watercraft-face.js');
const MOSS = await import('../../src/audio-mossmere.js');

let pass = 0, fail = 0;
const ok = (c, m, d) => { if (c) pass++; else { fail++; console.log(`  FAIL: ${m}${d !== undefined ? ` (${typeof d === 'string' ? d : JSON.stringify(d)})` : ''}`); } };
const section = (t) => console.log(`- ${t}`);
const ID = 'veilback_brook', P = D.LOOP.places[ID];

section('the place: secret, free, its own pool and one good bite');
{
  ok(P && P.secret === true && P.price === 0 && P.kind === 'day' && P.revealedBy === 'veil_notebook' && D.LOOP.lostTackle.veil_notebook.reveals === ID, 'Veilback Brook: secret, free, a day place, shown by the Veil Angler\'s Notebook');
  ok(D.goodBitesFor({ kind: 'day', place: ID }) === 1 && D.goodBitesFor({ kind: 'day' }) === D.LOOP.water.good.day && D.goodBitesFor({ kind: 'day', place: ID, wickId: 'tallow' }) === 2, 'LT6: 1 good bite an evening there (Tallow +1, as everywhere); a day place\'s own stays 2');
  const rec = D.loopPlace(ID);
  ok(rec && rec.name === 'Veilback Brook' && rec.area.kind === 'path' && rec.landmark && rec.zone === 'mossmere', 'loopPlace: its geometry record under the loop', rec);
  const allowed = new Set([...P.own, ...Object.keys(P.draws)]);
  for (const ph of ['calm', 'dusk', 'gloomtide']) {
    const pool = D.placePool(D.SPECIES, { placeId: ID, phase: ph });
    ok(pool.place === ID && pool.list.length > 0 && pool.list.every(([s]) => allowed.has(s.id)) && !pool.giant, `its pool at ${ph}: only its own fish and its draws (${pool.list.map(([s]) => s.id).join(', ')})`);
  }
  // its own fish are far waters' guests, found by id whatever their zone (L4 ships their records)
  const guest = { id: 'rosefleck_trout', zone: 'glasswater', rarity: 'uncommon', time: 'calm' };
  const pool = D.placePool([...D.SPECIES, guest], { placeId: ID, phase: 'calm' });
  ok(pool.list.some(([s]) => s.id === 'rosefleck_trout'), 'a guest record of its own fish bites there, whatever its zone');
  ok(!D.placePool([...D.SPECIES, guest], { placeId: 'lily_maze', phase: 'calm' }).list.some(([s]) => s.id === 'rosefleck_trout'), '… and nowhere else');
  ok(typeof D.TEXT_LOOP.murk.brook === 'string' && D.TEXT_LOOP.murk.brook.split(/\s+/).length <= 8 && !/\d/.test(D.TEXT_LOOP.murk.brook), 'Murk\'s brook line: ≤ 8 words, no digit');
}

section('LT6: the reveal: never a map, not on the Chart until the notebook is home; then owned, free');
{
  const meta = freshLoopMeta(D), ml = meta.loop;
  ok(!PL.mapCards(D, ml).some((c) => c.placeId === ID) && !UL.chartPlacesOf(meta, D, 'mossmere').some((p) => p.id === ID), 'before: no map card, not on the Chart');
  ok(!PL.catalogueFor(meta, D, 'mossmere').groups.some((g) => g.placeId === ID), 'before: not in the catalogue');
  LF.bookFinds(ml, [{ find: 'veil_notebook' }], D);
  ok(ml.places.revealed.includes(ID) && ml.maps.places.includes(ID), 'the notebook\'s tally: revealed, and owned (maps.places)');
  const cp = UL.chartPlacesOf(meta, D, 'mossmere').find((p) => p.id === ID);
  ok(cp && cp.owned === true && cp.price === null && !PL.mapCards(D, ml).some((c) => c.placeId === ID), 'after: on the Chart, owned, no price; still never a map card');
  ok(PL.liftDue(D, ml).includes(ID), 'its mist lifts on the next trip (the lift beat, as any place\'s first evening)');
  const old = { ...freshLoopMeta(D).loop, places: { revealed: [ID] } };
  LF.fillFinds(old);
  ok(old.maps.places.includes(ID), 'an older save with the brook revealed owns it too (fillFinds)');
  ok(UL.saleLineId({ rows: [{ find: 'veil_notebook', kind: 'tackle' }], said: { firstSale: true } }) === 'brook' && UL.saleLineId({ rows: [{ find: 'veil_notebook', kind: 'tackle' }], said: { firstSale: true, brook: true } }) === 'firstTackle', 'Murk\'s line as home opens: the brook, once');
}

section('LT6: the cut in the layout: shut until its place is owned, then water to its banks');
const Z = D.ZONES[0], L = WL.buildLayout(Z), N = L.notch;
{
  ok(N && N.place === ID && N.open === false && N.end === Z.arena.radius + Z.arena.shoreNotch[0].len, 'the arena\'s shoreNotch is built, shut, for its place', { ...N, ray: undefined });
  const mid = (al, lc = 0) => { const t = (al - N.r0) / (N.end - N.r0), lat = lc + WL.notchBend(N, t); return [al * N.ca - lat * N.sa, al * N.sa + lat * N.ca]; };
  const inner = [62, 66, 70, 74].map((al) => mid(al));
  ok(inner.every(([x, z]) => !WL.isOpenWaterL(L, [], x, z, 0.5)), 'LT6: shut: no water in the cut (a cast lands short, the raft is held at the shore)');
  ok(inner.every(([x, z]) => WL.depthAt(L, x, z) > 0.3 && WL.shoreDist(L, x, z) > 1.5), 'its water is drawn whatever (the depth and the shore\'s distance the bake reads)');
  N.open = true;
  ok(inner.every(([x, z]) => WL.isOpenWaterL(L, [], x, z, 1)), 'LT6: open: water down its length');
  ok(!WL.isOpenWaterL(L, [], ...mid(66, N.hw + 0.6), 0.3) && !WL.isOpenWaterL(L, [], ...mid(N.end + 0.5), 0.3), '… its banks and its head are land');
  N.open = false;
  // inside the lake's own shore nothing moved: the depth is the built lake's
  const L0 = WL.buildLayout(Z); L0.notch = null;
  let same = true;
  for (let x = -60; x <= 60; x += 3) for (let z = -60; z <= 60; z += 3) if (L0.shoreR(Math.atan2(z, x)) - Math.hypot(x, z) > 0 && WL.depthAt(L, x, z) !== WL.depthAt(L0, x, z)) same = false;
  ok(same, 'every depth inside the lake\'s shore is as built (the baked shares stand)');
}

section('LT6: the world: the raft cannot pass the Veil before, can after; the view down the brook');
{
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(46, 16 / 9, 0.1, 500);
  const ctx = { data: D, bus: createBus(), state: { meta: { settings: {} }, run: null }, flow: 'title', isMobile: false, errors: [], debug: {}, render: { scene, camera, isStub: false } };
  const w = createWorld(ctx); w.init(); w.setZone('mossmere', { instant: true });
  const go = (from, to, r = 1.6) => { const p = new THREE.Vector3(from[0], 0, from[1]); for (let i = 0; i <= 60; i++) { p.x += (to[0] - from[0]) / 60; p.z += (to[1] - from[1]) / 60; w.collide(p, r); } return p; };
  const a = go([50, 3.5], [72, 5]);
  ok(a.x * N.ca + a.z * N.sa < N.r0 - 1.2, `before: the raft stops at the Veil (along ${(a.x * N.ca + a.z * N.sa).toFixed(1)} m)`);
  ok(w.viewYaw(66, 4.6) === null, 'before: no view down the brook');
  w.setPlaces({ owned: [ID], lifted: [] });
  const b = go([50, 3.5], [72, 5]);
  ok(b.x * N.ca + b.z * N.sa > 70, `after: it sails in (along ${(b.x * N.ca + b.z * N.sa).toFixed(1)} m)`);
  { // the Sail's glide in clears every obstacle the world holds (the dock posts, wave 2's drowned roofs and rowboat) by the raft's radius
    const G = D.LOOP.places[ID].glide; let worst = Infinity, at = null;
    for (let i = 0; i < G.length - 1; i++) for (let k = 0; k <= 24; k++) { const x = G[i][0] + (G[i + 1][0] - G[i][0]) * k / 24, z = G[i][1] + (G[i + 1][1] - G[i][1]) * k / 24;
      for (const o of w.getObstacles()) { const d = Math.hypot(x - o.x, z - o.z) - o.r; if (d < worst) { worst = d; at = o.kind; } } }
    ok(worst >= 1.6, `the glide in clears every obstacle by the raft's 1.6 m (closest ${worst.toFixed(2)} m, a ${at})`);
  }
  const c = go([66, 4.6], [66, 14]);
  const f = WL.notchFrame(N, c.x, c.z);
  ok(Math.abs(f.lc) <= WL.notchHalfW(N, f.t) - 1.6 + 1e-6, 'its banks hold the raft off by its radius');
  const d = go([70, 5], [90, 6]);
  ok(d.x * N.ca + d.z * N.sa <= N.end - 1.6 + 1e-6, 'its head holds it too');
  const yaw = w.viewYaw(68, 4.8), fx = -Math.sin(yaw), fz = -Math.cos(yaw);
  ok(Number.isFinite(yaw) && fx * N.ca + fz * N.sa > 0.99 && w.viewYaw(30, 0) === null, 'in the brook the lens looks down it (camera behind the raft, along the cut); in the lake the play\'s own');
  ok(w.viewYaw(46, 0.5, true) !== null && w.viewYaw(46, 0.5, false) === null, 'the Sail\'s glide in turns it before the mouth; a raft fishing there keeps the play\'s');
  ok(w.getBakeHalf() >= N.end + 2 && Math.abs(w.getShoreDist(66, 4.6) - WL.shoreDist(L, 66, 4.6)) < 1e-9, 'the bake covers the cut (getBakeHalf, getShoreDist)');
  w.setPlaces({ owned: [], lifted: [] });
  ok(w.getNotch().open === false && go([50, 3.5], [72, 5]).x < N.r0, 'shut again with its place not owned');
}

section('the art: the ring\'s mouth, the banks, no rock in its water, the reeds, the lily bed, the Veil and the culvert');
{
  const ctx = { data: D, render: { isStub: true }, state: { meta: { settings: {} } } };
  const A = buildArena(ctx, L, { quality: 'high', far: 500, redress: true, loop: true });
  let cl = null; A.group.traverse((o) => { if (o.name === 'cliffs') cl = o; });
  const Pp = cl.geometry.attributes.position, I = cl.geometry.index;
  let inWater = 0, cutTris = 0;
  for (let t = 0; t < I.count; t += 3) {
    const v = [I.getX(t), I.getX(t + 1), I.getX(t + 2)].map((k) => [Pp.getX(k), Pp.getY(k), Pp.getZ(k)]);
    const cx = (v[0][0] + v[1][0] + v[2][0]) / 3, cy = (v[0][1] + v[1][1] + v[2][1]) / 3, cz = (v[0][2] + v[1][2] + v[2][2]) / 3;
    const sd = WL.notchSdf(N, cx, cz), al = cx * N.ca + cz * N.sa;
    if (al > N.r0 + 1 && sd > 0.6 && cy > -0.2) inWater++;
    if (al > N.r0 + 3 && sd > -8) cutTris++;
  }
  ok(inWater === 0, `no rock face stands in the cut's water above the surface (${inWater})`);
  ok(cutTris > 500, `the cut's banks and head are built (${cutTris} triangles beside it)`);
  const st = A.stats().buildMs;
  ok(st.cutReeds >= 40 && st.cutReeds <= 90 && st.cutPads === 8, `the reed banks (${st.cutReeds} stems) and one lily bed of 8 pads`);
  ok(A.statics.length === buildArena(ctx, (() => { const L2 = WL.buildLayout(Z); L2.notch = null; return L2; })(), { quality: 'high', far: 500, redress: true, loop: true }).statics.length, 'no new static: all of it merged into the meshes there were');
  const places = D.loopPlaceIds('mossmere').map((id) => D.loopPlace(id));
  const V = buildPlaces({ data: D, bus: createBus() }, L, A, { places, quality: 'high', mist: D.LOOP.mist, giantBack: D.LOOP.giantBack, redress: true });
  let veil = null; V.group.traverse((o) => { if (o.name === 'sluiceVeil') veil = o; });
  ok(!!veil, 'the Sluice Veil is built');
  const vp = veil.geometry.attributes.position;
  let lo = Infinity, hi = -Infinity, foot = 0;
  for (let k = 0; k < vp.count; k++) {
    const x = vp.getX(k), z = vp.getZ(k), al = x * N.ca + z * N.sa;
    if (al < N.r0 + 3) { const lat = -x * N.sa + z * N.ca; lo = Math.min(lo, lat); hi = Math.max(hi, lat); } else if (al > N.end - 2) foot++;
  }
  ok(hi - lo >= 6.3 && lo <= -N.hw && hi >= N.hw, `the Veil spans the cut's mouth (${(hi - lo).toFixed(1)} m across)`);
  ok(foot > 0, 'the culvert\'s small spill rides in the same mesh (one call)');
  ok(V.readout().banks.some((b) => b.id === ID && b.op === 1), 'the brook\'s mist bank stands behind the Veil until its lift');
  const an = V.placeAnchor(ID);
  ok(an && an.side[0] < -0.9 && an.dist > 8 && an.dist < 13, 'the lift\'s shot looks down the cut from its mouth', an);
  ok(MOSS.WATER_VOICES.culvert && Math.hypot(MOSS.WATER_VOICES.culvert.x - (N.end - 0.6) * N.ca, MOSS.WATER_VOICES.culvert.z - (N.end - 0.6) * N.sa) < 1.5, 'the culvert\'s trickle where it spills');
}

section('the water\'s face: the seam slides down the cut');
{
  const at = (al) => WF.faceMasks(al * N.ca, al * N.sa + WL.notchBend(N, (al - N.r0) / (N.end - N.r0)), { fromShore: (x, z) => WL.shoreDist(L, x, z), notch: N }).seam;
  ok(at(64) > 0.2 && at(72) > 0.2 && WF.faceMasks(66, 14, { fromShore: (x, z) => WL.shoreDist(L, x, z), notch: N }).seam === 0, 'a seam band down its middle, none on its banks');
}

section('lane C: the Chart: the sheet knows the cut; the brook inks in once, 1.2 s; reduced motion draws it at once');
{
  const geo = UC.waterGeometry(D, 'mossmere');
  ok(geo.notch && geo.notch.place === ID && geo.notch.ray === null, 'waterGeometry carries the cut');
  const model = { sheets: [{ waterId: 'mossmere', places: [{ id: ID, owned: true }] }] };
  const ml = { places: { revealed: [ID] } }, st = {};
  const a0 = CG.brookStep(ml, model, 1000, st), a1 = CG.brookStep(ml, model, 1600, st), a2 = CG.brookStep(ml, model, 2300, st);
  ok(a0.k === 0 && a0.more && Math.abs(a1.k - 0.5) < 1e-9 && a2.k === 1 && !a2.more && ml.places.inked.includes(ID), 'the ink: 0 → 1 over 1.2 s, then kept as inked');
  ok(CG.brookStep(ml, model, 9000, {}).k === 1, '… once only');
  const r = { places: { revealed: [ID] } };
  ok(CG.brookStep(r, model, 0, {}, true).k === 1 && r.places.inked.includes(ID), 'reduced motion: drawn at once');
  ok(CG.brookStep({ places: { revealed: [] } }, { sheets: [{ waterId: 'mossmere', places: [] }] }, 0, {}).k === 1, 'nothing to ink before it is shown');
  const calls = [];
  const fake = new Proxy({}, { get: (t, k) => (k in t ? t[k] : (...args) => { calls.push(k); }), set: (t, k, v) => { t[k] = v; return true; } });
  const card = { waterId: 'mossmere', lake: { cx: 200, cy: 200, s: 2.5 }, x: 0, y: 0, w: 400, h: 400 };
  ok(CG.brookCard(fake, card, model, 1, { water: { mossmere: geo } }) === true && calls.includes('stroke') && calls.includes('fill'), 'the sheet draws it once owned: its water, its banks, the reeds, the Veil');
  ok(CG.brookCard(fake, card, { sheets: [{ waterId: 'mossmere', places: [] }] }, 1, { water: { mossmere: geo } }) === false, '… and not before');
  ok(UC.placeSites(D, 'mossmere')[ID] && UC.placeSites(D, 'mossmere')[ID].x > N.r0, 'its site on the sheet is the brook\'s, behind the shore (a place mark and its name, as the other four)');
  // its name on the sheet's east edge: wholly on the water or the paper (never across the shore's pen), on the sheet, meeting no other
  // word or target, at a 390 x 844 phone, the 960 x 540 desktop and 1280 x 720 (the sheets' canvases there)
  const CD = await import('../../src/chart-draw.js'), { CHART_ART } = await import('../../src/chart-art.js');
  const t = { measureText(s) { const px = parseFloat(/(\d+(?:\.\d+)?)px/.exec(t.font || '')?.[1] || 13); return { width: String(s).length * px * 0.52 }; }, font: '13px serif' };
  const art = { sheets: CHART_ART.sheets.map((q) => ({ ...q, image: null })), paper: { ...CHART_ART.paper, image: null }, live: CHART_ART.live };
  const meet = (a, b) => a[0] < b[0] + b[2] && a[0] + a[2] > b[0] && a[1] < b[1] + b[3] && a[1] + a[3] > b[1];
  for (const [w, h, name] of [[354, 612, '390 x 844'], [892, 326, '960 x 540'], [1212, 470, '1280 x 720']]) for (const state of ['three', 'all']) {
    const m = UL.chartModel(freshLoopMeta(D), D, { slots: 3 });
    m.sheets[0].places = UC.chartPlaces(D, [...UC.CHART_FIXTURE(D, state), { id: ID, kind: 'day', owned: true }]);
    const view = { w, h, dpr: 1, phone: w < 560, F: UC.CHART_FONTS, water: { mossmere: geo }, sites: UC.placeSites(D, 'mossmere'), fmtWeight: D.fmtWeight, fishGlyph: () => null, words: {},
      measure: (s, f) => { t.font = f; return t.measureText(s).width; } };
    const L = CD.layoutChart(m, art, view), A = L.places.find((p) => p.id === ID), card = L.cards[0];
    const others = [...L.places.filter((p) => p !== A && p.box).map((p) => p.box), ...L.targets.filter((q) => !q.backdrop && q.place !== ID).map((q) => q.rect)];
    ok(A && A.box && A.label && (A.side === 'wet' || A.side === 'dry') && A.box[0] >= card.x + 8 && A.box[0] + A.box[2] <= card.x + card.w - 8 && !others.some((o) => meet(A.box, o)),
      `${name}, ${state}: the brook's name stands clear of the shore's pen, inside the sheet, meeting no other word or target`, A && { box: A.box, side: A.side, card: [card.x, card.w] });
  }
}

console.log(`veilback-brook: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
