// WC-2 (WATERCRAFT §5): the Mossmere's tells, pure rules from src/fishing-signs.js on the loop's data.
//   node tools/tests/fishing-signs.test.mjs [--verbose]
// Honest spawning (10,000 spawns per area and light: a kind only where its makers are; fizz never on stones; pin-pricks only in pads
// and the Lily Maze; no cloud or pin-prick at night; fry spray only where the minnow's raw weight is ≥ 1; glow never here, still in the
// flag-off phase table); bed gas never gives a rule; each cast rule's hit and miss geometry, its respond and waitMult; the makers'
// tilt and F17; the answers.
import { loadLoopData } from './loop-fixture.mjs';
import * as SG from '../../src/fishing-signs.js';

const D = await loadLoopData();
let WC = null;
try { WC = await import('../../src/watercraft.js'); } catch { WC = null; }   // WC-1's module, once it is cherry-picked

let pass = 0, fail = 0;
const VERBOSE = process.argv.includes('--verbose');
function ok(cond, msg) { if (cond) { pass++; if (VERBOSE) console.log('  ok:', msg); } else { fail++; console.log('  FAIL:', msg); } }
const section = (s) => console.log(`- ${s}`);
function mul(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// §2.4's raw weights (the test's own copy; watercraft.areaWeight wins when WC-1's module is here)
const RAW = {
  dusk_minnow: [2, 1.8, 1.8, 0.8, 0.5, 2, 1, 0.3, 1.5, 1], mossback_perch: [0.8, 1.3, 1, 2.5, 2, 0.6, 0.6, 0.5, 1.2, 2],
  gutter_crayfish: [1.2, 0.6, 0.4, 3, 0.5, 0.2, 0.3, 0.2, 1.5, 1.5], likely_chub: [1.3, 1.5, 1.2, 2, 0.4, 1.2, 0.5, 0.2, 2.5, 1.5],
  overbold_bass: [1, 1.5, 1.5, 2.5, 1.5, 0.5, 0.5, 0.4, 1.2, 1.5], rustfin_sucker: [1, 0.5, 0.4, 1.2, 0.6, 0.6, 1, 0.8, 3.5, 2.5],
  lampsipper: [1.5, 1.5, 1.8, 0.8, 0.5, 2, 1, 0.4, 1, 0.8], weeping_carp: [2, 2, 2, 0.4, 0.8, 1.8, 1, 0.8, 0.5, 0.5],
  candlefin_koi: [1.5, 1.2, 3, 0.3, 0.3, 0.8, 0.6, 0.2, 0.5, 0.3], milkeye_perch: [0.3, 0.4, 0.3, 1, 2.5, 0.8, 1.3, 2, 0.8, 1.5],
  kissmark_trout: [0.2, 0.2, 0.1, 0.5, 2, 1.5, 1.2, 3, 2.5, 1], reedjaw_pike: [0.8, 3, 2, 1.5, 1.5, 0.4, 0.4, 0.5, 0.5, 1.2],
};
const AREAS = ['margin', 'reeds', 'pads', 'stones', 'dropoff', 'lane', 'open', 'deep', 'inflow', 'outflow'];
const PLACES = ['lily_maze', 'under_the_span', 'buoy_lights', 'bell_pool'];
const PHASE = { day: 'calm', dusk: 'dusk', night: 'gloomtide' };
const rawOf = (id, area) => {
  if (WC?.areaWeight) { const v = WC.areaWeight(id, area, PHASE.dusk); if (Number.isFinite(v)) return v; }
  const r = RAW[id]; return r ? r[AREAS.indexOf(area)] : 1;
};
/** The who-is-there pool's shares at an area and light (placePool, × the area's raw weight in open water), the giant's share in. */
function shareAt(area, light) {
  const phase = PHASE[light];
  const place = PLACES.includes(area) ? area : null;
  if (WC?.loopPool) { /* the game's form lives in fishing.js; the test builds the same steps 3–5 itself */ }
  const pp = D.placePool(D.SPECIES, { placeId: place, phase });
  const m = new Map();
  let tot = 0;
  for (const [sp, w] of pp.list) { const v = w * (place ? 1 : rawOf(sp.id, area)); m.set(sp.id, v); tot += v; }
  if (pp.giant && tot > 0) { const sh = pp.giant.share; if (sh > 0 && sh < 1) { m.set(pp.giant.sp.id, tot * sh / (1 - sh)); tot += tot * sh / (1 - sh); } }
  for (const [k, v] of m) m.set(k, v / tot);
  return m;
}

section('honest spawning: 10,000 spawns per area and light');
{
  const rng = mul(5150);
  let checked = 0;
  for (const area of [...AREAS, ...PLACES]) for (const light of ['day', 'dusk', 'night']) {
    const share = shareAt(area, light);
    const opts = SG.tellOptions(area, light, share, {});
    const seen = {};
    let bad = 0, glow = 0, makerless = 0;
    for (let i = 0; i < 10000; i++) {
      const o = SG.pickTell(opts, rng);
      if (!o) break;
      seen[o.kind + ':' + o.form] = (seen[o.kind + ':' + o.form] || 0) + 1;
      if (o.kind === 'glow') glow++;
      if (o.kind !== 'gas' && !o.makers.some((id) => (share.get(id) || 0) > 0)) makerless++;
      if (o.kind === 'bubbles' && area === 'stones') bad++;
      if (o.kind === 'pinprick' && area !== 'pads' && area !== 'lily_maze') bad++;
      if ((o.kind === 'cloud' || o.kind === 'pinprick') && light === 'night') bad++;
      if (o.form === 'spray' && !PLACES.includes(area) && SG.MINNOW_RAW[area] < 1) bad++;
      checked++;
    }
    ok(!bad && !glow && !makerless, `${area} ${light}: ${Object.entries(seen).map(([k, n]) => `${k} ${(n / 100).toFixed(1)}%`).join(', ') || 'blank'}`);
  }
  ok(checked > 300000, `spawned ${checked}`);
  // a kind whose makers are absent is never offered: no koi, no pin-pricks
  const noKoi = new Map([['dusk_minnow', 0.5], ['weeping_carp', 0.5]]);
  ok(!SG.tellOptions('pads', 'dusk', noKoi).some((o) => o.kind === 'pinprick'), 'no koi in the pool → no pin-pricks');
  ok(!SG.tellOptions('margin', 'dusk', new Map([['dusk_minnow', 1]])).some((o) => o.kind === 'bubbles' || o.kind === 'cloud'), 'no carp or sucker → no fizz, no cloud');
  ok(SG.tellOptions('deep', 'dusk', new Map()).every((o) => o.kind === 'gas'), 'an empty pool offers only bed gas');
  ok(SG.tellOptions('stones', 'day', shareAt('stones', 'day')).every((o) => o.kind !== 'gas'), 'no gas on the stones');
  // the deep middle reads blank: little but a swirl and the gas
  const deep = SG.tellOptions('deep', 'dusk', shareAt('deep', 'dusk'));
  ok(deep.every((o) => o.kind === 'boil' || o.kind === 'gas'), `the deep: ${deep.map((o) => o.kind).join(', ')}`);
  // caps: a fourth rise is never offered, nor a second strike, nor a second gas
  const al = ['rise', 'rise', 'rise', 'strike', 'gas'];
  ok(!SG.tellOptions('reeds', 'dusk', shareAt('reeds', 'dusk'), { alive: al }).some((o) => o.kind === 'rise' || o.kind === 'strike'), 'caps: rise 3, strike 1');
  ok(!SG.tellOptions('margin', 'dusk', shareAt('margin', 'dusk'), { alive: ['gas'] }).some((o) => o.kind === 'gas'), 'caps: gas 1');
  ok(SG.kindCap('pinprick') === 2 && SG.kindCap('cloud') === 2 && SG.kindCap('stems') === 2 && SG.kindCap('boil') === 2 && SG.kindCap('nervous') === 2 && SG.kindCap('bubbles') === 2, 'caps: swirl, nervous, fizz, pin-pricks, cloud, stems 2');
  // the ruffle's maker at night is the Lampsipper; in reeds the stems are the carp alone
  ok(SG.formMakers(SG.MOSS_TELLS.nervous.forms.ruffle, 'open', 'night').join() === 'lampsipper', 'the ruffle at night: the Lampsipper');
  ok(SG.formMakers(SG.MOSS_TELLS.stems.forms.stems, 'reeds', 'dusk').join() === 'weeping_carp', 'stems in reeds: the carp');
  ok(SG.normTells(null) === SG.MOSS_TELLS && SG.normTells({ x: 1 }) === SG.MOSS_TELLS, 'normTells falls back to §5.3');
}

section('glow: never on the Mossmere, kept in the flag-off phase table');
{
  ok(!Object.keys(SG.MOSS_TELLS).includes('glow'), 'no glow in the Mossmere tells');
  const rng = mul(77); let g = 0;
  for (let i = 0; i < 2000; i++) if (SG.pickKind('gloomtide', rng, []) === 'glow') g++;
  ok(g > 600, `flag-off night: glow trails still lead (${g} / 2000)`);
}

// a moss sign that has shown once, at (0, 0), heading +z
function moss(kind, form, extra = {}) {
  const rng = mul(9);
  const s = SG.createSign(kind, 0, 0, 0, { rng, ttl: 60, heading: 0, form, makers: extra.makers || ['weeping_carp'], moss: true });
  for (let t = 0; t < 4 && s.shows < 1; t += 0.05) SG.stepSign(s, 0.05, t + 0.05, rng, {});
  s.position.x = 0; s.position.z = 0; s.head.x = 0; s.head.z = 0; s.lastX = 0; s.lastZ = 0; s.heading = 0;
  return s;
}

section('cast rules: hit and miss geometry, respond, waitMult (§5.3)');
{
  const R = (s, x, z, dt = 0.5) => SG.castRule(s, x, z, s.lastAt + dt, {});
  // the sip: 2.5 m, 3 s, its fish takes; wait × 0.5
  let s = moss('rise', 'sip');
  let r = R(s, 2.4, 0, 2.9);
  ok(r && r.preroll?.chance === 1 && r.waitMult === 0.5 && r.respond === 'rise' && r.form === 'sip' && r.makers.length, 'sip: 2.4 m, 2.9 s → its fish, wait × 0.5, it rises again');
  ok(!R(s, 2.6, 0) && !R(s, 0, 0, 3.1), 'sip: 2.6 m or 3.1 s → nothing');
  s = moss('rise', 'splash');
  ok(R(s, 2.9, 0, 1.9)?.respond === 'splash' && !R(s, 3.1, 0) && !R(s, 0, 0, 2.1), 'splash: 3 m, 2 s; a second slap');
  s = moss('rise', 'roll');
  ok(R(s, 2.4, 0, 2.9)?.respond === 'rise', 'roll: as the sip');
  s = moss('boil', 'swirl');
  r = R(s, 2.9, 0, 7.9);
  ok(r?.preroll?.chance === 0.6 && r.waitMult === 0.65 && r.respond === 'bow' && !R(s, 3.1, 0) && !R(s, 0, 0, 8.1), 'swirl: 3 m, 8 s, 60%, a bow wave, wait × 0.65');
  s = moss('nervous', 'ruffle', { makers: ['dusk_minnow'] });
  const rr = s.radius;
  r = R(s, rr, 0);
  ok(r && r.tilt === 3 && r.waitMult === 0.65 && r.respond === 'ruffle' && r.makers.join() === 'dusk_minnow' && !r.predators && !r.bottom, 'ruffle: at its edge → its makers × 3, wait × 0.65, it drifts over (makers replace the family tilt)');
  ok(R(s, rr * 0.3, 0)?.spook === true && R(s, rr * 0.3, 0).inSign === false, 'ruffle: into its middle → it goes flat (a spook)');
  ok(!R(s, rr + 1.7, 0), 'ruffle: past its edge band → nothing');
  s = moss('nervous', 'spray', { makers: ['reedjaw_pike', 'overbold_bass'] });
  r = R(s, s.radius + 1, 0);
  ok(r?.favour === 0.3 && r.tilt === 3 && r.respond === 'spray' && R(s, 0.2, 0)?.spook, 'fry spray: at the edge favour +0.3, makers × 3; the centre spooks');
  s = moss('strike', 'strike', { makers: ['reedjaw_pike'] });
  r = R(s, 3.9, 0, 9.9);
  ok(r?.favour === 0.6 && r.tilt === 3 && r.respond === 'bow' && r.waitMult === 0.65 && !R(s, 4.2, 0) && !R(s, 0, 0, 10.1), 'strike: 4 m, 10 s, favour +0.6, a bow wave');
  s = moss('bubbles', 'fizz');
  r = R(s, 0, 1.9);
  ok(r?.favour === 0.2 && r.tilt === 3 && r.respond === 'fizz' && r.makers.join() === 'weeping_carp', 'fizz: at the head (ahead 1.9 m) → the carp × 3, favour +0.2, it turns onto the float');
  ok(R(s, 1.9, 0)?.respond === 'fizz', 'fizz: beside the head (1.9 m) → yes');
  ok(!R(s, 0, -1.5) && !R(s, 0, 2.2), 'fizz: behind the head, or 2.2 m off → nothing');
  s = moss('pinprick', 'pinprick', { makers: ['candlefin_koi'] });
  ok(R(s, 1.4, 0)?.respond === 'pinprick' && R(s, 1.4, 0).favour === 0.2 && !R(s, 1.6, 0), 'pin-pricks: within 1.5 m of the patch → the koi × 3; 1.6 m → nothing');
  s = moss('cloud', 'cloud', { makers: ['weeping_carp', 'rustfin_sucker'] });
  const rc = SG.cloudRadius(0.5);
  ok(R(s, 0, rc + 1.5)?.respond === 'cloud' && R(s, 0, rc + 1.5).favour === 0.2, 'cloud: by its freshest edge → its makers × 3, a fresh puff');
  ok(R(s, 0, 0)?.spook === true, 'cloud: into its middle → a spook');
  ok(!R(s, 0, rc + 2.5) && !SG.castRule(s, 0, rc + 1, s.lastAt + 15.5, {}), 'cloud: 2.5 m past the edge, or 15.5 s after it bloomed → nothing');
  s = moss('stems', 'stems', { makers: ['weeping_carp', 'candlefin_koi'] });
  ok(R(s, s.radius + 2.4, 0)?.respond === 'stems' && R(s, s.radius + 2.4, 0).tilt === 3 && R(s, 0.2, 0)?.spook && !R(s, s.radius + 2.6, 0) && !R(s, s.radius, 0, 8.1), 'stems: within 2.5 m of the stems → makers × 3; the middle spooks; 2.6 m or 8.1 s → nothing');
  // bed gas: no rule anywhere, at any time (the cast rolls the pool as anywhere)
  s = moss('gas', 'gas', { makers: [] });
  let any = 0;
  for (let i = 0; i < 400; i++) { const a = i * 0.7, d = (i % 20) * 0.15; if (SG.castRule(s, Math.cos(a) * d, Math.sin(a) * d, s.lastAt + (i % 10) * 0.4, {})) any++; }
  ok(any === 0, 'bed gas never gives a cast rule (it never changes the roll)');
  ok(SG.bestRule([s], 0, 0, s.lastAt + 0.2, {}) === null, 'bestRule over the gas alone → null');
  // gas never travels
  const rng = mul(3); const g = moss('gas', 'gas', { makers: [] });
  for (let t = 0; t < 40; t += 0.1) SG.stepSign(g, 0.1, g.lastAt + t, rng, {});
  ok(g.position.x === 0 && g.position.z === 0 && g.shows > 3, `bed gas stays in one spot and bursts now and then (${g.shows})`);
  // the flag-off rules are unchanged (no moss flag): a nervous edge still gives the family tilt
  const plain = SG.createSign('nervous', 0, 0, 0, { rng: mul(1), ttl: 60 });
  const pr = SG.castRule(plain, plain.radius, 0, 1, {});
  ok(pr?.predators === 3 && !('makers' in pr), 'flag-off: nervous still gives predators × 3');
}

section('the makers tilt and F17');
{
  const share = shareAt('reeds', 'dusk');
  const entries = [...share].filter(([id]) => !['thousandcast_pike'].includes(id)).map(([id, w]) => ({ id, w }));
  ok(SG.makersTiltOk(entries, ['reedjaw_pike', 'overbold_bass'], 3), 'a strike\'s makers × 3 on a reed line keeps the pool from naming a fish');
  ok(!SG.makersTiltOk([{ id: 'a', w: 1 }, { id: 'b', w: 1 }], ['a'], 10), 'a tilt that puts one fish above 80% is dropped (F17)');
  ok(!SG.makersTiltOk([{ id: 'a', w: 1 }], ['a'], 3), 'a single-species pool names its fish (F17)');
}

section('the answers (§5.3): drawn at the float, only when the rule is met');
{
  const bob = { x: 5, z: 5 };
  for (const [kind, form, want] of [['rise', 'sip', 'rise'], ['rise', 'splash', 'splash'], ['boil', 'swirl', 'bow'], ['strike', 'strike', 'bow'],
    ['nervous', 'ruffle', 'ruffle'], ['nervous', 'spray', 'spray'], ['bubbles', 'fizz', 'fizz'], ['pinprick', 'pinprick', 'pinprick'], ['cloud', 'cloud', 'cloud'], ['stems', 'stems', 'stems']]) {
    const s = moss(kind, form);
    const a = SG.answerFor({ respond: SG.RESPOND[form] }, s, bob, mul(4));
    const dist = a ? Math.hypot(a.x - bob.x, a.z - bob.z) : 99;
    ok(a && a.type === want && a.life >= 1 && a.life <= 2 && (want === 'bow' ? Math.hypot(a.x1 - bob.x, a.z1 - bob.z) < 1e-9 : dist < 0.8), `${form}: ${want} (${a?.life?.toFixed(2)} s)`);
  }
  ok(SG.answerFor({ respond: 'rise', spook: true }, moss('rise', 'sip'), bob) === null, 'a spook gets no answer');
  ok(SG.answerFor(null, moss('rise', 'sip'), bob) === null, 'no rule, no answer');
}

console.log(`\nfishing-signs: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
