// Silhouettes spawn where they read (16 Nov 2026; the user: "The silhouette should be proportionate to the size of the fish", and the
// lead's call over WATERCRAFT §6.3's bands): every Lake 1 silhouette species at its smallest and its biggest length, on the four screens
// the game is judged on (desktop 960x540 and 1280x720, a phone 390x844 and 358x664), through the real play camera (three.js's own
// projection; the sail framing the player looks for fish under, and the fish framing with the line out, as render.js places them), is
// put where its TRUE length draws at least the mark (24 px on a phone, 30 on a desktop) when any spot in the open part of the frame
// lets it; where the camera cannot draw a fish that big anywhere in view, where it draws biggest; and under the floor it is not seen.
// Never inside its own 3–5 m off the raft, never off the open frame, never drawn bigger than the fish. Prints the table.
//   node tools/tests/fishing-sight-read.test.mjs [--verbose]
import * as THREE from 'three';
import { loadLoopData } from './loop-fixture.mjs';
import * as SI from '../../src/fishing-sight.js';
import { portraitFit, portraitK, WATCH } from '../../src/render-camera.js';

const D = await loadLoopData();
let pass = 0, fail = 0;
const VERBOSE = process.argv.includes('--verbose');
function ok(cond, msg) { if (cond) { pass++; if (VERBOSE) console.log('  ok:', msg); } else { fail++; console.log('  FAIL:', msg); } }
const section = (s) => console.log(`- ${s}`);
function mul(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const DEG = Math.PI / 180;
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** The play camera as render.js places it (fillTargets → render-camera.js portraitFit: a screen narrower than 1.25 widens the fov
 *  up to +22°, steps back ×1.38 and tilts down 7°; on the Mossmere under the loop, the raft at rest, the watch (w) eases in over it;
 *  the lens orbits the raft at elev / dist, yaw 0 (south of it), looking at aim metres ahead and aimY up). */
function playCamera(W, H, preset, raft = { x: 0, z: 0 }, mode = 'sail', w = 0) {
  const t = portraitFit({ ...preset }, W / H, mode, w);
  const { elev, dist, aim, aimY, fov } = t, a = W / H;
  const cam = new THREE.PerspectiveCamera(fov, a, 0.1, 400);
  cam.position.set(raft.x, dist * Math.sin(elev * DEG), raft.z + dist * Math.cos(elev * DEG));
  cam.lookAt(raft.x, aimY, raft.z - aim);
  cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  return cam;
}
const CAMS = D.BALANCE.cameras;
const ROBUST = { ...SI.READ, inset: { x: SI.READ.inset.x + 0.02, y: SI.READ.inset.y + 0.02 } };
const SCREENS = [[960, 540], [1280, 720], [390, 844], [358, 664]];
// sail: sailing (or the first moment at rest); watch: at rest on the Mossmere (the sail framing under the watch); fish: the line out,
// the first moment; fishW: the line out, at rest (on a phone, the fish framing under the watch's softer widening; landscape: = fish).
const FRAMINGS = { sail: [CAMS.sail, 'sail', 0], watch: [CAMS.sail, 'sail', 1], fish: [CAMS.fish, 'fish', 0], fishW: [CAMS.fish, 'fish', 1] };
const SP = (id) => D.SPECIES.find((s) => s.id === id);
const LAKE1 = Object.keys(SI.OUTLINE_OF).filter((id) => SP(id)?.zone === 'mossmere');
const zMin = D.BALANCE_V3.size.z.min;

section('the lens: the pure projection is three.js\'s own');
{
  const cam = playCamera(960, 540, CAMS.sail);
  const lens = SI.lensOf(cam, 960, 540);
  let worst = 0, back = 0;
  const rng = mul(3);
  for (let i = 0; i < 400; i++) {
    const x = (rng() - 0.5) * 50, z = (rng() - 0.5) * 50 - 8;
    const s = SI.toScreen(lens, x, 0, z), v = new THREE.Vector3(x, 0, z).project(cam);
    if (!s) continue;
    worst = Math.max(worst, Math.hypot(s.x - (v.x + 1) / 2 * 960, s.y - (1 - v.y) / 2 * 540));
    const w = SI.fromScreen(lens, s.x, s.y);
    if (w) back = Math.max(back, Math.hypot(w.x - x, w.z - z));
  }
  ok(worst < 1e-6 && back < 1e-6, `toScreen = Vector3.project (worst ${worst.toExponential(1)} px); fromScreen inverts it (${back.toExponential(1)} m)`);
  ok(Math.abs(SI.projectedLength(1, { x: 0, z: 3 }, lens) - SI.projectedLength(1, { x: 0, z: 3 }, lens, Math.PI / 2)) < 1e-9, 'broadside to a lens due south is a fish heading east or west');
  let worstEnd = 0, eased = 0;
  for (const [x, z] of [[0, 3], [5, -6], [-8, 10], [2, -18]]) {
    const across = SI.projectedLength(1, { x, z }, lens), b = SI.broadside(lens, x, z);
    for (let k = 0; k <= 12; k++) worstEnd = Math.max(worstEnd, SI.projectedLength(1, { x, z }, lens, b + k * Math.PI / 12) / across);
    const k2 = SI.lookStretch(lens, x, 0, z);
    if (k2.s > 1 && k2.s <= 2) eased++;
  }
  ok(worstEnd <= 1 + 1e-6 && SI.projectedLength(1, { x: 0, z: 3 }, lens, 0) < SI.projectedLength(1, { x: 0, z: 3 }, lens), `the look into the water eases the shape out along the line of sight (1×–2×), and no heading draws it longer than across the view (worst ${worstEnd.toFixed(3)})`);
  ok(eased === 4, 'the play camera\'s low angle is eased everywhere in view');
  ok(SI.readPx(960, 540) === 30 && SI.readPx(1280, 720) === 30 && SI.readPx(390, 844) === 24 && SI.readPx(358, 664) === 24 && SI.readPx(844, 390) === 24, 'the mark: 30 px on a desktop, 24 on a phone (either way up)');
  ok(SI.lensOf(null, 960, 540) === null && SI.lensOf(cam, 0, 0) === null, 'no camera or no screen: no lens (the fallback table)');
}

section('every Lake 1 silhouette species, smallest and biggest, on four screens, as it spawns');
const rows = [];
{
  const raft = { x: 0, z: 0 };
  let n = 0, reads = 0, short = 0, unseen = 0, badFrame = 0, badKeep = 0, badReads = 0, badShort = 0, badUnseen = 0, badPx = 0;
  for (const [W, H] of SCREENS) for (const [fr, [preset, md, ww]] of Object.entries(FRAMINGS)) {
    const cam = playCamera(W, H, preset, raft, md, ww), lens = SI.lensOf(cam, W, H), need = SI.readPx(W, H), floor = need * SI.READ.floor;
    for (const id of LAKE1) for (const [end, z] of [['min', zMin], ['max', D.maxZFor(SP(id))]]) {
      const L = D.sizeLength(SP(id), z, 'mossmere') / 100;
      for (const seed of [1, 2, 3]) {
        const keepOff = SI.keepOffFor(L, seed / 4);
        // (the most it can draw, 2% inside where a spawn may go: a sliver at the frame's very corner is no place to look for a fish)
        const best = SI.bestReadPx(L, lens, raft, keepOff + 0.4, SI.READ.maxD, ROBUST);
        const at = SI.readableSpot(L, { lens, raft, keepOff, rng: mul(seed * 97 + W + L * 1000) });
        n++;
        const status = !at ? 'unseen' : at.reads ? 'reads' : 'short';
        if (status === 'reads') reads++; else if (status === 'short') short++; else unseen++;
        if (at) {
          if (!SI.inFrame(lens, at.x, at.z)) badFrame++;
          if (at.d < keepOff + 0.4 - 1e-9) badKeep++;
          if (Math.abs(SI.projectedLength(L, at, lens, at.heading) - at.px) > 1e-6) badPx++;
        }
        // where the camera can draw it at the mark, it is drawn at the mark; where it cannot, it is put where it draws (near) biggest
        if (best >= need * 1.1 && status !== 'reads') { badReads++; if (process.env.SIGHT_DEBUG) console.log('   read?', W, H, fr, id, end, L.toFixed(2), 'best', best.toFixed(1), 'need', need, at && at.px.toFixed(1)); }
        if (status === 'short' && !(at.px >= Math.min(need, best * 0.9) && at.px >= floor)) badShort++;
        if (status === 'unseen' && best >= floor * 1.1) { badUnseen++; if (process.env.SIGHT_DEBUG) console.log('   seen?', W, H, fr, id, end, L.toFixed(2), 'best', best.toFixed(1), 'floor', floor); }
        rows.push({ scr: `${W}x${H}`, fr, id, end, cm: Math.round(L * 100), need, best: Math.round(best), px: at ? Math.round(at.px) : 0, d: at ? at.d.toFixed(1) : '-', status, seed, W, H });
      }
    }
  }
  ok(badReads === 0, `wherever the camera can draw it at the mark it spawns at the mark (${reads} of ${n} spawns read)`);
  ok(badShort === 0, `where it cannot, it spawns where it draws biggest (≥ 90% of the best in view, ≥ the floor): ${short} such`);
  ok(badUnseen === 0, `a fish is left unseen only when nothing in view draws it at the floor (${unseen})`);
  ok(badFrame === 0 && badKeep === 0 && badPx === 0, 'every spawn in the open frame, past its own distance off the raft, its drawn length as measured');
  // the framing the player watches from (16 Nov 2026, the review's bar): at rest on the Mossmere every screen sees every Lake 1
  // silhouette species, its smallest at least at the floor, and its biggest at about the mark (at least 0.9 of it: 22 px on a phone,
  // 27 on a desktop; most draw far past it), wherever it spawns. One exception, by the camera's reach: on the smallest desktop
  // (960x540, a 30 px mark) the two hand-long species at their very smallest (the 16 cm crayfish, the 17 cm minnow shoal) draw at most
  // 15–17 px, under the floor, and are not shown there (from about 18 cm they are); a nearer landscape watch would leave a big fish no
  // water past its own distance off the raft
  const watch = rows.filter((r) => r.fr === 'watch');
  const unseenW = watch.filter((r) => r.status === 'unseen'), shortMax = watch.filter((r) => r.end === 'max' && !(r.px >= r.need * 0.9));
  const unseenBad = unseenW.filter((r) => !(r.scr === '960x540' && r.end === 'min' && r.cm < 18));
  ok(watch.length === 4 * 3 * LAKE1.length * 2 && unseenBad.length === 0, `every screen at rest (the watch): every species, smallest and biggest, is seen (${unseenBad.map((r) => `${r.scr} ${r.id} ${r.end} ${r.cm} cm ${r.best} px`).join('; ') || 'all'}; not shown, as written: ${[...new Set(unseenW.filter((r) => !unseenBad.includes(r)).map((r) => `${r.scr} ${r.id} ${r.cm} cm ${r.best} px`))].join(', ') || 'none'})`);
  const nearMax = watch.filter((r) => r.end === 'max' && r.status !== 'reads');
  ok(shortMax.length === 0, `every screen at rest: every species at its biggest draws at about the mark (${shortMax.map((r) => `${r.scr} ${r.id} ${r.cm} cm ${r.px} px`).join('; ') || 'all'}; just under the mark: ${nearMax.map((r) => `${r.scr} ${r.id} ${r.cm} cm ${r.px} px`).join(', ') || 'none'})`);
  const minW = watch.filter((r) => r.end === 'min' && r.status === 'short');
  ok(minW.every((r) => r.px >= Math.floor(r.need * SI.READ.floor)), `every screen at rest: a fish too small for the mark is still drawn past the floor (${minW.length} short, the least ${Math.min(...minW.map((r) => r.px / r.need), 9).toFixed(2)} of the mark)`);
  // with the line out on a phone (the softer widening keeps the float framed) the medium and big fish read too
  const fishP = rows.filter((r) => r.W < r.H && r.fr === 'fishW' && r.end === 'max' && r.cm >= 55);
  ok(fishP.every((r) => r.status === 'reads'), `phones with the line out at rest: every species at its biggest from 55 cm reads (${fishP.filter((r) => r.status !== 'reads').map((r) => `${r.scr} ${r.id} ${r.px}`).join('; ') || 'all'})`);
  // landscape screens keep their framings: the watch is a phone's only
  ok(portraitK(960 / 540) === 0 && portraitK(1280 / 720) === 0 && portraitK(390 / 844) === 1 && WATCH.sail.dist < CAMS.sail.dist * 1.38 && WATCH.land.dist < CAMS.sail.dist,
    'the watch stands nearer than the sail framing on every screen (a phone\'s own pose, a landscape one)');
  const fw = portraitFit({ ...CAMS.fish }, 16 / 9, 'fish', 1), f0 = portraitFit({ ...CAMS.fish }, 16 / 9, 'fish', 0);
  ok(['elev', 'dist', 'aim', 'aimY', 'fov'].every((k) => fw[k] === f0[k]), 'a landscape fish framing is the same under the watch (already near)');
  // the brief's examples: a Keeper perch on the camera's side, near; big fish may stand farther, as they read
  const cam = playCamera(1280, 720, CAMS.sail), lens = SI.lensOf(cam, 1280, 720);
  const perch = D.sizeLength(SP('mossback_perch'), 0.6, 'mossmere') / 100, carp = D.sizeLength(SP('weeping_carp'), 2.4, 'mossmere') / 100;
  const pd = [], cd = [];
  let side = 0;
  for (let i = 0; i < 200; i++) {
    const p = SI.readableSpot(perch, { lens, raft, keepOff: SI.keepOffFor(perch), rng: mul(500 + i) });
    const c = SI.readableSpot(carp, { lens, raft, keepOff: SI.keepOffFor(carp), rng: mul(900 + i) });
    if (p) { pd.push(Math.hypot(p.x - cam.position.x, p.z - cam.position.z)); if (p.z > 0) side++; }   // (its distance from the lens)
    if (c) cd.push(Math.hypot(c.x - cam.position.x, c.z - cam.position.z));
  }
  const mean = (a) => a.reduce((s, v) => s + v, 0) / Math.max(1, a.length);
  ok(pd.length > 150 && side / pd.length > 0.9 && mean(cd) > mean(pd) + 1, `1280x720: a Keeper perch (${Math.round(perch * 100)} cm) comes near, on the camera's side of the raft (${Math.round(side / pd.length * 100)}%; ${mean(pd).toFixed(1)} m from the lens), a Trophy carp (${Math.round(carp * 100)} cm) may lie farther (${mean(cd).toFixed(1)} m)`);
}
section('at night, only in the lantern\'s light, and readable there');
{
  const raft = { x: 0, z: 0 }, R = SI.lanternRadius({});
  let bad = 0, seen = 0, tot = 0;
  for (const [W, H] of SCREENS) {
    const lens = SI.lensOf(playCamera(W, H, CAMS.sail, raft), W, H);
    for (const id of ['weeping_carp', 'mossback_perch', 'gutter_crayfish', 'milkeye_perch', 'reedjaw_pike']) for (const z of [zMin, 0, 1.5]) {
      const L = D.sizeLength(SP(id), z, 'mossmere') / 100, keepOff = SI.keepOffFor(L);
      const accept = (x, z2) => SI.canSpawnAt({ area: 'margin', depth: 0.3, light: 'night', raftDist: Math.hypot(x, z2), lanternR: R });
      const at = SI.readableSpot(L, { lens, raft, keepOff, accept, rng: mul(77 + W + z * 10) });
      tot++;
      if (at) { seen++; if (!accept(at.x, at.z) || at.px < SI.readPx(W, H) * SI.READ.floor - 1e-9) bad++; }
    }
  }
  ok(bad === 0, `every night shape inside the lantern's light (≥ 0.25) and at least the floor (${seen} of ${tot} seen)`);
}
section('in sight: never behind a rock, the bank or the raft');
{
  const eye = { x: 0, y: 6, z: 14 };
  ok(SI.sightBlocked(0, 0, eye, [{ x: 0, z: 5, r: 2, h: 3.5 }]) && !SI.sightBlocked(0, 0, eye, [{ x: 6, z: 5, r: 2, h: 3.5 }]), 'a rock between the lens and the fish hides it; one aside does not');
  ok(!SI.sightBlocked(0, 0, eye, [{ x: 0, z: 10, r: 1, h: 1 }]), 'a low rock under a high line of sight does not');
  ok(SI.sightBlocked(0, 0, eye, [], (x, z) => z > 3 && z < 4) && !SI.sightBlocked(0, 0, eye, [], (x, z) => z > 10), 'the shore\'s boulders hide what lies behind them, low; not where the line of sight is already over them');
  // readableSpot with a blocker on the camera's side: it finds another spot, in sight
  const cam = playCamera(1280, 720, CAMS.sail), lens = SI.lensOf(cam, 1280, 720), e2 = { x: cam.position.x, y: cam.position.y, z: cam.position.z };
  const rock = [{ x: -4, z: 5, r: 3, h: 3.5 }];
  let bad = 0, got = 0;
  for (let i = 0; i < 100; i++) {
    const at = SI.readableSpot(0.5, { lens, raft: { x: 0, z: 0 }, keepOff: 4, rng: mul(300 + i), accept: (x, z) => !SI.sightBlocked(x, z, e2, rock) });
    if (at) { got++; if (SI.sightBlocked(at.x, at.z, e2, rock)) bad++; }
  }
  ok(got > 90 && bad === 0, `with a rock on the camera's side every spot is still in sight (${got} of 100 placed)`);
}
section('the whole drawn shape in sight, clear of posts and lamps; the phone frame clear of the thumb');
{
  const cam = playCamera(390, 844, CAMS.sail, { x: 0, z: 0 }, 'sail', 1), lens = SI.lensOf(cam, 390, 844);
  const eye = { x: cam.position.x, y: cam.position.y, z: cam.position.z };
  // a 1.5 m pike lying across the view with a dock post (its blocker: r 0.2 + 0.3, as fishing.js has it) on the line of sight to its
  // head, not its centre: hidden
  const L = 1.5, x = 0, z = 6, h = SI.broadside(lens, x, z), hp = SI.shapePoints(L, x, z, h, lens)[1];
  const t = 0.1, post = [{ x: hp[0] + (eye.x - hp[0]) * t, z: hp[1] + (eye.z - hp[1]) * t, r: 0.5, h: 3.2 }];
  ok(!SI.sightBlocked(x, z, eye, post) && SI.shapeBlocked(L, x, z, h, eye, post, null, lens), 'a post before the head hides the shape though its centre is in sight');
  ok(SI.shapePoints(L, x, z, h, lens, { x: 0.1, z: -0.1 }).length === 6, 'the head, tail and centre, and the same of its shadow, are tested');
  const across = SI.drawnHalf(L, lens, x, z, h), endOn = SI.drawnHalf(L, lens, x, z, h + Math.PI / 2);
  ok(Math.abs(across - L / 2) < 1e-6 && endOn > L / 2 && endOn <= L + 1e-9 && SI.drawnHalf(L, null, x, z) === L, `the drawn half-length: across the view its own (${across.toFixed(2)} m), end on eased out (${endOn.toFixed(2)} m, at most 2×)`);
  const rects = SI.frameRects(lens, SI.READ, false);
  ok(rects.length === 2 && rects[1].x[0] >= 0.45 && rects[0].y[1] <= 0.72 + 1e-9 && SI.frameRects(SI.lensOf(playCamera(960, 540, CAMS.sail), 960, 540)).length === 1,
    'a phone held upright: the open frame stops above the thumb\'s ring on the left and reaches lower on the right; a desktop frame is one rect');
  let low = 0;
  for (let i = 0; i < 200; i++) { const at = SI.readableSpot(0.5, { lens, raft: { x: 0, z: 0 }, keepOff: 4, rng: mul(800 + i) }); if (at) { const s2 = SI.toScreen(lens, at.x, 0, at.z); if (s2.y / 844 > 0.72 && s2.x / 390 < 0.45) low++; } }
  ok(low === 0, 'no spawn in the thumb\'s corner');
}
section('the fallback (no camera): its length\'s band, on the camera\'s side');
{
  const rng = mul(41);
  let bad = 0;
  for (let i = 0; i < 2000; i++) {
    const L = 0.15 + rng() * 1.3, k = SI.keepOffFor(L, rng()), band = SI.spawnRange(L, { light: 'day', keepOff: k });
    const p = SI.spawnPoint({ x: 0, z: 0 }, band, () => true, rng, 6, { a: Math.PI / 2, w: SI.spawnSide(L) });
    const off = Math.abs(Math.atan2(Math.sin(Math.atan2(p.z, p.x) - Math.PI / 2), Math.cos(Math.atan2(p.z, p.x) - Math.PI / 2)));
    if (p.d < k + 0.4 - 1e-9 || p.d > band[1] + 1e-9 || off > SI.spawnSide(L) + 1e-9) bad++;
  }
  ok(bad === 0, 'every fallback spawn inside its band, past its own distance, within its lean of the camera\'s bearing');
}

// the table: what each screen draws (the lead reads it; "short" = the camera cannot draw that fish at the mark anywhere in view)
console.log('   screen    framing species           end   cm  need best spawn  d(m)  status');
for (const r of rows) if (r.seed === 1 && (VERBOSE || r.status !== 'reads')) console.log(`   ${r.scr.padEnd(9)} ${r.fr.padEnd(7)} ${r.id.padEnd(17)} ${r.end.padEnd(4)} ${String(r.cm).padStart(4)} ${String(r.need).padStart(5)} ${String(r.best).padStart(4)} ${String(r.px).padStart(5)} ${String(r.d).padStart(5)}  ${r.status}`);
const by = {};
for (const r of rows) { if (r.seed !== 1) continue; const k = `${r.scr} ${r.fr}`; by[k] = by[k] || { reads: 0, short: 0, unseen: 0 }; by[k][r.status]++; }
console.log('   per screen and framing (species × min/max):', Object.entries(by).map(([k, v]) => `${k}: ${v.reads} read, ${v.short} short, ${v.unseen} unseen`).join('; '));

console.log(`\nfishing-sight-read: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
