// fishing.js — the skill-fishing core (fishing author). CONTRACT §7 fishing, DESIGN §5.
//
// States: idle → charging → casting → waiting → bite → reeling → landing → idle, with
// 'lost' as the short reel-in after any failure. Owns: aim + ping-pong cast meter, the
// ballistic cast, species/weight rolls, nibbles/feints/tells, the hook window, the per-
// frame tension model (fishing-reel.js), legendary boss phases, catch quality, feeding
// spots + the legend pool, the hooked fish visual, and every fishing:* event.
// Visuals live in fishing-fx.js (reticle, range ring, cast arc, spots, pulses, particles).
//
// Optional extras beyond the contract (read with ?.):
//   view.surgeKind 'pull'|'leap'|'dive', view.decoyMin/decoyMax, view.shards [{min,max}×2],
//   view.bandsHidden, view.phaseName, view.legendary, view.enraged, view.inSpot, view.tell
//   ('gold'|'grey'|null), view.anchoring, view.holding, view.lightMult, view.snapAt
//   lightMult (getter; 0.5 during the Leviathan's Eclipse — survival may scale the light)
//   legendPool -> {position, radius, active, dim} | null   (for edge markers)
//   slam()                     a hand slam hit the raft (snaps a normal line, spikes a legendary)
//   addSpots(n, {rare, untilDusk})   e.g. Tide Chart (also handled via shop:buy tide_chart)
//   fishing:caught extras {legendary, final, perfect, inSpot, rareSpot, depth, night, zone}
//   fishing:escaped {cut:true} when the line is cut by sailing away mid-fight
//   fishing:hook extras {legendary, name, epithet}; fishing:nibble {tell, feint}
// Debug: forceBite(), instantCatch(id?), plus fishHook(id), fishSpot(rare), fishing().
//
// v3 (DESIGN §25.6–§25.7, CONTRACT §13.7; feature-detected: the v3 build merges BALANCE.size / favour / nightModes and gives
// species `size`, otherwise every v3 path is skipped and fishing is exactly v1 / v2):
//   F1  the size score z ~ N(μ, 1) truncated [−2, 3.6] replaces rollWeight; μ is the favour stack by family (BALANCE.favour, cap
//       1.8); classes Small … Elder (Ancient z ≥ 3.2); caps: species / place maxClass, a top Trophy outside giant water (holdsGiants
//       places, the stopgap arena.giantSpots / world.getGiantSpots()), giantsKept lifts both for its kept species; pressure −0.12
//       per catch at a place (or stopgap giant water) today, floor −0.6, reset at dawn
//   F2  size scales species.difficulty before createReel (fishing-reel.js scaleDifficultyV3: Elder age per lake, step × 1.08,
//       stamina g^1.3) and the reel gets its v3 edits (reelOptsV3: fatigue, easing by load, the old trick, drag absorb / slip and
//       Spooled from stats.absorb / dragAt, Rod shock, pips + stats.pipBonus)
//   F4  class bite tells (view.biteTell, fishing:tell, fishing:bite + {sizeClass, biteTell}), Prize+ hold the bait 10% longer,
//       let it pass (a lapsed bite with no tap: progression.refundBait + favour +0.15 for the next cast within 6 m / in the same
//       place, cap 0.3, reset on a hook or after 60 s; fishing:miss {reason: 'passed'}), hook-hold pips (view.pips, fishing:pip)
//   F13 view.favour {mu, notches, terms, quiet}: the float's μ (species-independent terms + each species-specific term as the max
//       over the bait's eligible pool), so it never reveals the rolled species; quiet at pressure ≤ −0.36
//   F7  Night Rise +0.25 on every night cast; in Still and Lantern (run.nightMode; the First Outing too) slams never snap
//       (slam(), cancel('snap') ignored), lineBroken() ignores raft displacement that no paddling caused (knockback, shoves,
//       pulls) and so does a cancel('moved') with no paddling behind it; isHooked() for combat's no-knock / no-creelsnatch rules;
//       the Lantern-Swallower's Grasping Dark becomes two telegraphed snags (snag(): warning, then +0.2 tension; legendQuiet)
//   events (additive): fishing:caught + {z, sizeClass, ancient, length (cm), favours, place, mu}; fishing:hook + {pips};
//   fishing:surge + {trick}; fishing:oldTrick {speciesId, kind, style}; fishing:pip {n, max}; fishing:tell {speciesId, sizeClass,
//   biteTell, lead}; fishing:snag {state: 'warn'|'hit', lead, spike}; fishing:miss {reason: 'passed', refunded, favour};
//   fishing:escaped reasons + 'thrown' (pips) / 'spooled'; fish:escaped-big (Prize+).  API: isHooked(), lineBroken(), snag(opts),
//   rollSize(species, mu, {place, maxClass, giant}), favourAt(point, species?).  Debug: forceBite({speciesId, z, place, wait}),
//   instantCatch(id, {z}), fishHook(id, {z}), setFavour(mu|null), fishSeed(n|null), fishPressure(), fishReel().
import * as THREE from 'three';
import { clamp, lerp, damp, smoothstep, TAU } from './core.js';
import { createReel, scaleDifficultyV3, reelOptsV3, rollZ, capZ, inGiantSpot, floatFavour, sumFavour, classIndex } from './fishing-reel.js';
import { createFishingFx, MAX_SLOTS } from './fishing-fx.js';

const BUSY = new Set(['charging', 'casting', 'waiting', 'bite', 'reeling', 'landing']);
const LEGEND_SLOT = MAX_SLOTS - 2;   // slot for the legend pool's golden column
const SPOT_SLOTS = MAX_SLOTS - 2;    // feeding spots use slots 0..7
const FALLBACK_DIFF = { power: 0.6, surgeEvery: 6.5, surgeTime: 0.7, stamina: 5, sweet: 1.3, erratic: 0.05, window: 1.1 };
const num = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const isReal = (m) => !!m && !m.isStub;
const TELL_LEAD = 0.6;               // v3: the size is rolled and the class's bite tell starts this long before the bite
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export function create(ctx) {
  const D = () => ctx.data || {};
  const BAL = (k) => D().BALANCE?.[k] || {};
  const fx = createFishingFx(ctx);
  const fishHolder = new THREE.Group(); fishHolder.name = 'fishing-fish';
  fx.group.add(fishHolder);

  // ---------------------------------------------------------------- view (UI contract)
  const view = {
    charge: 0, castDist: 0, aim: 0, tension: 0, sweetMin: 0.42, sweetMax: 0.58, danger: 0, progress: 0,
    surge: false, surgeWarn: 0, stamina: 1, biteWindow: 0, speciesId: null, rarity: null, hint: '',
    // optional extensions
    surgeKind: null, decoyMin: null, decoyMax: null, shards: null, bandsHidden: false, phaseName: '',
    legendary: false, enraged: false, inSpot: false, tell: null, anchoring: false, holding: false, lightMult: 1, snapAt: 1,
    safeMin: 0.15, safeMax: 0.85, depth: 0,
    // v3 (CONTRACT §13.7; null / false in v1 builds)
    favour: null, sizeClass: null, ancient: false, pips: null, biteTell: null, slip: 0, place: null, drag: null, lure: null, measure: null, cove: false,
  };

  // ---------------------------------------------------------------- internal state
  let state = 'idle';
  const S = {
    clock: 0, stateT: 0,
    // aim & meter
    pressT: 0, meterT: -1, charge: 0, hasAim: false, aimYaw: 0, band: 'shallow', blocked: false,
    // cast / bobber
    castDist: 0, flightT: 0, flightDur: 0.5, arcH: 1, clean: false, castBait: null,
    depth: 0, spot: null, rareSpot: false, legendCast: false,
    // waiting
    waitDur: 5, events: [], evIdx: 0, dipT: 0, dipKind: '', species: null, weight: 1,
    // bite
    window: 1, wounded: 0,
    // reel
    reel: null, holding: false, perfect: false, hookDist: 8, fishLen: 0.5, moveHold: 0, bannerT: -1,
    summons: [], gearT: 0, strainPose: false, quality: 'normal', qScore: 0,
    // lost
    lostDur: 0.6, lostLine: true,
    // catch display / fleeing fish
    catchFv: null, catchT: 0, catchSeenBlock: false, flee: null,
    // spots
    spotTimers: [], spotDesired: 3, spotSeq: 0, lastPhase: '', legendDimUntil: -1, legendToastDay: -1, legendK: 0,
    tideAt: -10, slamAt: -10,
    stats: null, statsT: -1,
    // v3: size, favour, tells, let it pass, pressure, mode rules
    rng: null, cast: null, z: null, zRolled: false, sizeClass: null, ancient: false, lengthCm: 0, mu: 0, favourTerms: [],
    tell: null, tellStart: 0, tellPops: 0, tellDir: new THREE.Vector3(1, 0, 0), hookTried: false, revealed: false,
    letPass: null, pressure: {}, floatT: 0, favourOverride: null, forceZ: null, forceSpecies: null, forcePlace: null,
    extShift: new THREE.Vector3(), lastRaft: new THREE.Vector3(), lastRaftOk: false, snags: [],
  };
  const V = {
    raft: new THREE.Vector3(), aimDir: new THREE.Vector3(0, 0, -1), aimPoint: new THREE.Vector3(), target: new THREE.Vector3(),
    from: new THREE.Vector3(), to: new THREE.Vector3(), bob: new THREE.Vector3(), lineDir: new THREE.Vector3(0, 0, -1),
    fish: new THREE.Vector3(), fishVel: new THREE.Vector3(), mouth: new THREE.Vector3(), lineEnd: new THREE.Vector3(),
    tmp: new THREE.Vector3(), tmp2: new THREE.Vector3(), tip: new THREE.Vector3(), perp: new THREE.Vector3(),
  };
  const F = {   // hooked fish motion
    fv: null, lat: 0, latV: 0, latTarget: 0, dash: 0, dist: 8, y: 0, yaw: 0, splashT: 0, wakeT: 0, rippleT: 0,
    leap: false, leapT: 0, leapDur: 1, leapH: 1, leapCount: 0, roll: 0, phase: Math.random() * 10,
    landFrom: new THREE.Vector3(), landing: false,
  };
  const bobberPosV = new THREE.Vector3();
  const legendPoolInfo = { position: new THREE.Vector3(), radius: 3.2, active: false, dim: false };

  // ---------------------------------------------------------------- helpers: game state
  const run = () => ctx.state?.run || null;
  const playing = () => ctx.flow === 'playing' && !!run() && run().active !== false;
  const emit = (e, p) => { try { ctx.bus?.emit?.(e, p); } catch (err) { console.error('[fishing] emit', e, err); } };
  const call = (fn) => { try { return fn(); } catch (e) { report(e); return undefined; } };
  let reported = 0;
  function report(e) { if (reported++ < 5) { console.error('[fishing]', e); ctx.errors?.push?.(`fishing: ${e?.message || e}`); } }

  // non-allocating actor / water helpers for per-frame paths (pre-built argument objects)
  const LINE = { visible: false, end: null, tension: 0, slack: 0 };
  const BOB = { visible: false, position: null, state: 'floating' };
  const FOPT = { swim: 1, struggle: 0, flop: 0 };
  function aLine(visible, end = null, tension = 0, slack = 0) {
    const a = ctx.actors; if (!a || typeof a.setLine !== 'function') return;
    LINE.visible = visible; LINE.end = end; LINE.tension = tension; LINE.slack = slack;
    try { a.setLine(LINE); } catch (e) { report(e); }
  }
  function aBob(visible, position = null, st = 'floating') {
    const a = ctx.actors; if (!a || typeof a.setBobber !== 'function') return;
    BOB.visible = visible; BOB.position = position; BOB.state = st;
    try { a.setBobber(BOB); } catch (e) { report(e); }
  }
  function aCall(name, x, y) {
    const a = ctx.actors; const f = a && a[name]; if (typeof f !== 'function') return;
    try { f.call(a, x, y); } catch (e) { report(e); }
  }
  function waterH(x, z) {
    const w = ctx.water; if (!w || typeof w.getHeight !== 'function') return 0;
    try { const v = w.getHeight(x, z); return typeof v === 'number' && Number.isFinite(v) ? v : 0; } catch { return 0; }
  }
  function fishUpd(fv, dt, t, swim, struggle, flop = 0) {
    if (!fv || typeof fv.update !== 'function') return;
    FOPT.swim = swim; FOPT.struggle = struggle; FOPT.flop = flop;
    try { fv.update(dt, t, FOPT); } catch (e) { report(e); }
  }

  function stats() {
    if (S.stats && S.clock - S.statsT < 0.5) return S.stats;
    const base = {};
    for (const [k, def] of Object.entries(D().STATS || {})) base[k] = def.base;
    let s = null;
    try { s = ctx.progression?.getStats?.(); } catch (e) { report(e); }
    S.stats = s && !s.isStub && typeof s === 'object' ? { ...base, ...s } : base;
    // v3: a progression without the P1 fight stats (no v3 API, or no absorb in its stats) → shock / pipBonus / absorb / dragAt
    // from the effective tiers of the run's upgrades (data.upgradeTiers → data.tackleStats), as CONTRACT §13.7 getStats does
    // for P1–P2 runs. (A v1 getStats copies every STATS key, so the v3 keys are present there at their T0 base.)
    const v3prog = typeof prog()?.measure === 'function' && !!s && typeof s === 'object' && 'absorb' in s;
    if (v3on() && !v3prog && run()?.upgrades && typeof D().tackleStats === 'function' && typeof D().upgradeTiers === 'function') {
      try {
        const t = D().tackleStats(D().upgradeTiers(run().upgrades));
        Object.assign(S.stats, { shock: t.shock, pipBonus: t.pipBonus, absorb: t.absorb, dragAt: t.dragAt });
      } catch (e) { report(e); }
    }
    S.statsT = S.clock;
    return S.stats;
  }
  const stat = (k, d) => num(stats()[k], d);

  function raftPos() {
    const p = isReal(ctx.player) ? ctx.player.position : null;
    if (p && Number.isFinite(p.x)) V.raft.set(p.x, 0, p.z);
    return V.raft;
  }
  function raftSpeed() {
    const pl = ctx.player;
    if (!isReal(pl)) return 0;
    if (Number.isFinite(pl.speed)) return pl.speed;
    const v = pl.velocity;
    return v && Number.isFinite(v.x) ? Math.hypot(v.x, v.z) : 0;
  }
  function phaseNow() {
    let p = null;
    try { p = ctx.survival?.getPhaseInfo?.()?.phase; } catch { /* optional */ }
    return typeof p === 'string' ? p : (run()?.phase || 'calm');
  }
  function zoneData() {
    let z = null;
    try { z = ctx.world?.getZone?.(); } catch { /* optional */ }
    if (z && !z.isStub && z.id) return z;
    const id = run()?.zone;
    return D().ZONE_BY_ID?.[id] || (D().ZONES || []).find((q) => q.id === id) || (D().ZONES || [])[0] || null;
  }
  const speciesById = (id) => (id && (D().SPECIES_BY_ID?.[id] || (D().SPECIES || []).find((s) => s.id === id))) || null;
  const baitById = (id) => (id && (D().BAITS || []).find((b) => b.id === id)) || null;
  function equippedBaitId() {
    let b = null;
    try { b = ctx.progression?.getEquippedBait?.(); } catch { /* optional */ }
    if (b && typeof b === 'object' && !b.isStub) b = b.id;
    if (typeof b !== 'string') b = run()?.equippedBait;
    return typeof b === 'string' ? b : null;
  }
  const baitBonus = (id, k) => num(baitById(id)?.bonus?.[k], 0);
  function depthAt(x, z) {
    let d = null;
    try { d = ctx.world?.getDepth?.(x, z); } catch { /* optional */ }
    return clamp(num(d, 0.5), 0, 1);
  }
  function openWater(x, z, r) {
    if (!isReal(ctx.world) || typeof ctx.world.isOpenWater !== 'function') return true;
    try { const v = ctx.world.isOpenWater(x, z, r); return v === true || (v && !v.isStub && v !== false); } catch { return true; }
  }
  function bandOf(d) {
    const B = D().DEPTH_BANDS || { shallow: [0, 0.35], mid: [0.35, 0.75], deep: [0.75, 1] };
    if (d < num(B.shallow?.[1], 0.35)) return 'shallow';
    if (d < num(B.mid?.[1], 0.75)) return 'mid';
    return 'deep';
  }
  const timeOk = (sp, phase) => { const t = sp?.time || 'any'; return t === 'calm' ? phase !== 'gloomtide' : t === 'gloom' ? phase === 'gloomtide' : true; };
  function starving() {
    if (v3on() && BAL('wellFed').starvation === false) return false;   // v3: no starvation, ever (Well-fed instead)
    const r = run(); return !!r && num(r.satiety, 1) <= 0;
  }
  function pity() {
    const r = run(); if (!r) return false;
    const P = BAL('bite').pity || {};
    return num(r.hp, 9) <= num(P.hp, 2) || num(r.oil, 100) <= num(P.oilFrac, 0.15) * stat('maxOil', 100);
  }
  function relicShimmer() {
    let s = 0;
    const rel = ctx.state?.meta?.relics || {};
    for (const r of D().RELICS || []) {
      const lv = rel[r.id] || 0;
      if (!lv || typeof r.special !== 'string') continue;
      const m = /^shimmer:([\d.]+)/.exec(r.special);
      if (m) s += parseFloat(m[1]) * lv;
    }
    return s;
  }
  const U = (a, b) => a + (b - a) * Math.random();
  function expRand(mean) { return -Math.log(1 - Math.random() * 0.999) * mean; }

  // ---------------------------------------------------------------- v3: size, favour, places, night modes
  const v3on = () => !!BAL('size').fight && Array.isArray(D().SIZE_CLASSES);
  const spV3 = (sp) => !!sp?.size && v3on();
  const rnd = () => (S.rng || Math.random)();
  const prog = () => (isReal(ctx.progression) ? ctx.progression : null);
  const round2 = (v) => Math.round(v * 100) / 100;
  function nightMode() {
    const m = run()?.nightMode;
    if (typeof m === 'string') return m;
    const c = isReal(ctx.combat) ? ctx.combat.nightMode : null;
    return typeof c === 'string' ? c : null;
  }
  /** Still and Lantern (and the all-still First Outing): combat never costs a hooked fish (the hard rule, DESIGN §25.5.3;
   *  BALANCE.nightModes[mode].threat). Gloomtide and The Long Descent keep today's slams. */
  function hookSafe() {
    if (!v3on()) return false;
    const r = run();
    if (r?.outing === 'first') return true;
    if (r?.outing === 'descent') return false;
    const m = nightMode(), NM = m ? BAL('nightModes')[m] : null;
    if (!NM) return false;
    return m === 'still' || NM.threat?.slamSnaps === false;
  }
  function moveInput() {
    const i = ctx.input;
    return i ? Math.hypot((i.move?.x || 0) + (i.joy?.x || 0), (i.move?.y || 0) + (i.joy?.y || 0)) > 0.15 : false;
  }
  /** The place whose water holds (x, z), from the places in THIS build (data.placeAtV3 over the zone's arena.places), or null. */
  function placeAt(x, z) {
    const zd = zoneData(), list = zd?.arena?.places;
    if (S.forcePlace) { const f = (list || []).find((p) => p.id === S.forcePlace) || D().PLACE_V3_BY_ID?.[S.forcePlace]; if (f) return f; }   // debug
    if (!Array.isArray(list) || !list.length) return null;
    try { const p = D().placeAtV3?.(zd.id, x, z); if (p && list.some((q) => q.id === p.id)) return p; } catch (e) { report(e); }
    const pc = D().placeContains;
    if (typeof pc === 'function') for (const p of list) if (pc(p, x, z)) return p;
    return null;
  }
  /** The stopgap's giant water in a lake whose places are not in the build (world.getGiantSpots(), else arena.giantSpots). */
  function giantSpots() {
    let g = null;
    try { g = ctx.world?.getGiantSpots?.(); } catch { /* optional */ }
    if (Array.isArray(g) && !g.isStub) return g;
    return zoneData()?.arena?.giantSpots || [];
  }
  // a holdsGiants place gated by a place state (giantsWhile / giantsDuring) reads as ungated only once the P2 place kit owns it
  const placeHoldsGiants = (p) => !!p?.holdsGiants && !p.giantsWhile && !p.giantsDuring;
  /** What the water at (x, z) is: {place, giantSpot, giant (Elders may roll), pressureKey}. */
  function waterInfo(x, z) {
    const place = placeAt(x, z);
    let gs = null;
    if (!place) for (const g of giantSpots()) if (inGiantSpot(g, x, z)) { gs = g; break; }
    return { place, giantSpot: gs, giant: place ? placeHoldsGiants(place) : !!gs, pressureKey: place?.id || gs?.id || null };
  }
  /** Pressure at a place (or stopgap giant water): −0.12 per catch there today, floor −0.6 (progression's getPressure when it has one). */
  function pressureFavour(key) {
    if (!key) return 0;
    const F = BAL('favour').pressure || {};
    const local = Math.max(num(F.floor, -0.6), num(F.perCatch, -0.12) * (S.pressure[key] || 0));
    let pv = 0;
    try { const v = prog()?.getPressure?.(key); if (Number.isFinite(v)) pv = v; } catch { /* optional */ }
    return Math.min(local, pv, 0);
  }
  function condition() {
    try {
      const c = prog()?.getCondition?.(zoneData()?.id);
      return typeof c === 'string' ? c : (c && typeof c === 'object' ? (c.id ?? c.archetype ?? null) : null);
    } catch { return null; }
  }
  function todaysRumour() {
    try { const r = prog()?.getTodaysRumour?.(); return r && typeof r === 'object' && !r.isStub ? r : null; } catch { return null; }
  }
  function placeAstir(id) {
    try { const ps = prog()?.getPlaces?.(zoneData()?.id); return Array.isArray(ps) && !!ps.find((p) => p.id === id)?.astir; } catch { return false; }
  }
  function equippedLure() {
    const id = run()?.lure;
    return typeof id === 'string' ? (D().LURES || []).find((l) => l.id === id) || null : null;
  }
  function lineTier() {
    try { const t = prog()?.getTackle?.(); if (Number.isFinite(t?.fitted?.line)) return t.fitted.line; } catch { /* optional */ }
    try { return D().upgradeTiers?.(run()?.upgrades || {})?.line ?? 0; } catch { return 0; }
  }
  function dragName(at) {
    const P = D().TACKLE?.drag?.presets || {};
    let best = null, bd = Infinity;
    for (const [k, v] of Object.entries(P)) if (Math.abs(v - at) < bd) { bd = Math.abs(v - at); best = k; }
    return best;
  }
  /** The species-independent favour terms of a cast (DESIGN §25.7.2): place, hour, a bait's or lure's base term, Clean Cast,
   *  clear water, signs, let it pass, pressure. */
  function baseTerms(info) {
    const Fv = BAL('favour'), T = Fv.tackle || {}, H = Fv.hour || {}, out = [];
    if (info.place) {
      out.push(placeAstir(info.place.id) ? { family: 'place', id: 'astir', value: num(Fv.place?.astir, 0.35) }
        : { family: 'place', id: 'inside', value: num(Fv.place?.inside, 0.15) });
    }
    const ph = info.phase;
    if (ph === 'dusk') out.push({ family: 'hour', id: 'dusk', value: num(H.dusk, 0.2) });
    else if (ph === 'dawn') out.push({ family: 'hour', id: 'dawn', value: num(H.dawn, 0.2) });
    else if (ph === 'gloomtide') out.push({ family: 'hour', id: 'nightRise', value: num(H.nightRise, 0.25) });   // every night mode
    if (info.condition === 'hush') out.push({ family: 'hour', id: 'hush', value: num(H.hush, 0.2) });
    let fw = null;
    try { fw = prog()?.getFarWater?.(); } catch { /* optional (P3) */ }
    const fwv = Math.min(num(H.farWaterCap, 0.24), num(fw?.favour, 0));
    if (fwv > 0) out.push({ family: 'hour', id: 'farWater', value: fwv });
    if (info.baitId) {
      const bv = num(T.bait?.[info.baitId], num(baitById(info.baitId)?.bonus?.weightBias, 0));   // a bait's weightBias is favour now
      if (bv) out.push({ family: 'tackle', id: info.baitId, value: bv });
    }
    const lure = info.lure;
    if (lure && !lure.family && (!lure.night || ph === 'gloomtide') && num(T.lure?.[lure.id], num(lure.favour, 0))) {
      out.push({ family: 'tackle', id: lure.id, value: num(T.lure?.[lure.id], num(lure.favour, 0)) });
    }
    if (info.clean) out.push({ family: 'tackle', id: 'cleanCast', value: num(T.cleanCast, 0.1) });
    const CW = D().TACKLE?.clearWater;
    if (CW && CW.zones?.includes(zoneData()?.id) && lineTier() < num(CW.belowLineTier, 3)) out.push({ family: 'tackle', id: 'clearWater', value: num(CW.favour, -0.1) });
    const sk = info.sign?.kind;
    if (sk && num(Fv.signs?.[sk], 0)) out.push({ family: 'signs', id: sk, value: num(Fv.signs[sk], 0) });
    if (info.letPass > 0) out.push({ family: 'signs', id: 'letItPass', value: info.letPass });
    const pr = pressureFavour(info.pressureKey);
    if (pr < 0) out.push({ family: 'pressure', id: 'pressure', value: round2(pr) });
    return out;
  }
  /** The species-specific favour terms (depth lower third, family lure, Cut Strip, the field-note condition, today's rumour). */
  function speciesTerms(sp, info) {
    const Fv = BAL('favour'), T = Fv.tackle || {}, out = [];
    const d = sp?.depth;
    if (Array.isArray(d) && d[1] > d[0] && info.depth >= d[0] + (d[1] - d[0]) * (2 / 3) && info.depth <= d[1]) {
      out.push({ family: 'tackle', id: 'depthLowerThird', value: num(T.depthLowerThird, 0.25) });
    }
    if (info.baitId === 'cut_strip' && sp.family === 'predator') out.push({ family: 'tackle', id: 'cutStrip', value: num(T.cutStrip, 0.3) });
    const lure = info.lure;
    if (lure?.family && lure.family === sp.family) out.push({ family: 'tackle', id: lure.id, value: num(T.lure?.[lure.id], num(lure.favour, 0)) });
    if (info.condition && sp.prefers === info.condition) out.push({ family: 'match', id: 'condition', value: num(Fv.match?.condition, 0.3) });
    const tr = info.rumour;
    if (tr?.speciesId === sp.id && (!tr.place || tr.place === info.place?.id) && (!tr.zone || tr.zone === zoneData()?.id)) {
      out.push({ family: 'match', id: 'rumour', value: num(Fv.match?.rumour, 0.3) });
    }
    return out.filter((t) => t.value);
  }
  /** Cast context for the favour formula at the bobber (refreshed: the hour, the condition and the rumour can change). */
  function castInfo(x, z, depth) {
    const w = waterInfo(x, z);
    return { x, z, depth, ...w, baitId: S.castBait, clean: !!S.clean, lure: equippedLure(), sign: null, letPass: 0,
      phase: phaseNow(), condition: condition(), rumour: todaysRumour() };
  }
  function refreshInfo(info) { info.phase = phaseNow(); info.condition = condition(); info.rumour = todaysRumour(); return info; }
  /** favourAt (CONTRACT §13.7): with a species its full μ (the roll); without, the float's μ. */
  function favourAt(info, sp = null) {
    const cap = num(BAL('favour').cap, 1.8);
    if (S.favourOverride != null) return { mu: S.favourOverride, terms: [{ family: 'debug', id: 'setFavour', value: S.favourOverride }] };
    const base = baseTerms(info);
    if (sp) { const terms = [...base, ...speciesTerms(sp, info)]; return { mu: sumFavour(terms, cap), terms }; }
    const pool = speciesPool(info.depth, info.baitId, info.phase).filter((q) => q.size);
    const pref = info.rumour?.speciesId ? pool.find((q) => q.id === info.rumour.speciesId) : null;
    return floatFavour(base, pool.map((q) => speciesTerms(q, info)), cap, pref ? speciesTerms(pref, info) : null);
  }
  function refreshFloat() {
    const info = S.cast;
    if (!info || !v3on()) { view.favour = null; return; }
    refreshInfo(info);
    const f = favourAt(info);
    const quietAt = num(BAL('favour').pressure?.quietAt, -0.36);
    view.favour = { mu: round2(f.mu), notches: num(D().favourNotches?.(f.mu), 0), terms: f.terms, quiet: pressureFavour(info.pressureKey) <= quietAt };
  }
  /** Roll the size score of the hooked species (F1): z ~ N(μ, 1) truncated to the cast's cap; legends are authored (μ 0). */
  function rollSize(sp = S.species, info = S.cast) {
    if (!spV3(sp)) return;
    const SZ = BAL('size');
    const zone = zoneData()?.id || run()?.zone || null;
    if (!info) info = castInfo(V.bob.x, V.bob.z, S.depth);
    refreshInfo(info);
    let z;
    if (sp.rarity === 'legendary') {
      z = S.forceZ != null ? S.forceZ : rollZ(0, rnd, { min: num(SZ.z?.min, -2), max: num(SZ.z?.max, 3.6), sd: num(SZ.z?.sd, 1) });
      S.mu = 0; S.favourTerms = [];
    } else {
      const f = favourAt(info, sp);
      const cap = capZ({ species: sp, place: info.place, giantWater: info.giant, size: SZ });
      z = S.forceZ != null ? S.forceZ : rollZ(f.mu, rnd, { min: num(SZ.z?.min, -2), max: num(SZ.z?.max, 3.6), sd: num(SZ.z?.sd, 1), cap });
      S.mu = f.mu; S.favourTerms = f.terms.filter((t) => t.value);
    }
    S.forceZ = null;
    S.z = Math.round(z * 1e4) / 1e4; S.zRolled = true;
    S.sizeClass = D().sizeClassOf(S.z);
    S.ancient = S.sizeClass === 'elder' && !!D().isAncient?.(S.z);
    S.lengthCm = D().sizeLength(sp, S.z, zone);
    const kg = D().sizeWeight(sp, S.lengthCm);
    S.weight = kg < 1 ? Math.round(kg * 1000) / 1000 : Math.round(kg * 100) / 100;
  }
  const classOf = (id) => (D().SIZE_CLASSES || []).find((c) => c.id === id) || null;

  let legendCache = { zone: undefined, info: null };
  function legendInfo() {
    const z = zoneData();
    if (legendCache.zone === (z?.id ?? null)) return legendCache.info;
    const lp = z?.arena?.legendPool;
    const sp = speciesById(z?.legendary);
    legendCache = { zone: z?.id ?? null, info: (!lp || !sp || !Number.isFinite(lp.x)) ? null
      : { x: lp.x, z: lp.z, r: num(lp.r, num(BAL('spots').legend?.radius, 3.2)), species: sp, baitId: sp.bait } };
    return legendCache.info;
  }

  // ---------------------------------------------------------------- state machine
  function setState(next) {
    if (next === state) return;
    const prev = state;
    state = next; api.state = next; S.stateT = 0;
    emit('fishing:state', { state: next, prev });
    // explicit poses AFTER the state event (actors resets its explicit pose on fishing:state)
    if (next === 'charging') call(() => ctx.actors?.setPose?.('charge'));
    else if (next === 'waiting') call(() => ctx.actors?.setPose?.('wait'));
    else if (next === 'reeling') { S.strainPose = false; call(() => ctx.actors?.setPose?.('reel')); }
    else if (next === 'landing') call(() => ctx.actors?.setPose?.('catch'));
  }

  function resetView() {
    view.charge = 0; view.tension = 0; view.danger = 0; view.progress = 0; view.surge = false; view.surgeWarn = 0;
    view.stamina = 1; view.biteWindow = 0; view.speciesId = null; view.rarity = null; view.hint = '';
    view.surgeKind = null; view.decoyMin = null; view.decoyMax = null; view.shards = null; view.bandsHidden = false;
    view.phaseName = ''; view.legendary = false; view.enraged = false; view.tell = null; view.anchoring = false;
    view.holding = false; view.lightMult = 1; view.snapAt = 1; view.inSpot = false;
    view.favour = null; view.sizeClass = null; view.ancient = false; view.pips = null; view.biteTell = null; view.slip = 0; view.place = null;
    S.cast = null; S.tell = null;
  }

  /** Silent reset (death, zone change, run end, title). No miss/escape events. */
  function hardReset(clearCatch = true) {
    disposeHooked(false);
    if (S.flee) { disposeFv(S.flee.fv); S.flee = null; }
    if (clearCatch) releaseCatch();
    S.reel = null; S.holding = false; S.summons.length = 0; S.snags.length = 0; S.bannerT = -1;
    api.bobberPos = null;
    resetView();
    fx.hideTransient();
    fx.setShadow(false);
    aLine(false);
    aBob(false);
    aCall('setAim', null);
    aCall('setCharge', 0);
    aCall('setReel', 0, 0);
    if (state !== 'idle') setState('idle');
  }

  function toLost(dur, keepLine = true) {
    S.lostDur = dur; S.lostLine = keepLine;
    S.reel = null; S.holding = false; S.snags.length = 0;
    resetView();
    setState('lost');
  }

  // ---------------------------------------------------------------- pointer
  function onPointerDown() {
    if (!playing()) return;
    const tm = !!ctx.state?.meta?.settings?.reelToggle;
    switch (state) {
      case 'idle':
        startCharge();
        break;
      case 'lost':
        if (S.stateT > 0.25) startCharge();
        break;
      case 'waiting':
        // spook: tapping the water before the plunge
        emit('fishing:miss', { reason: 'early' });
        fx.pulse(V.bob.x, V.bob.z, { color: 0x8e96a4, r0: 0.2, r1: 1.4, duration: 0.6, alpha: 0.6 });
        call(() => ctx.water?.addRipple?.(V.bob.x, V.bob.z, 0.6));
        toLost(num(BAL('cast').spookReelIn, 1.5));
        break;
      case 'bite':
        S.hookTried = true;   // any tap in the window is a hook attempt (no "let it pass")
        hook();
        break;
      case 'reeling':
        S.holding = tm ? !S.holding : true;
        break;
      default: break;
    }
  }
  function inputBlocked() {
    if (ctx.paused) return true;
    try { return ctx.ui?.isBlocking?.() === true; } catch { return false; }
  }
  function onPointerUp() {
    const tm = !!ctx.state?.meta?.settings?.reelToggle;
    if (state === 'charging') { if (inputBlocked() || !playing()) setState('idle'); else release(); }
    else if (state === 'reeling' && !tm) S.holding = false;
  }
  function onPointerMove(ndc) { if (state === 'charging') updateAim(ndc); }

  function updateAim(ndc) {
    const n = ndc || ctx.input?.ndc;
    if (!n) return;
    let p = null;
    try { p = ctx.render?.groundPoint?.(n, 0); } catch { /* optional */ }
    if (p && !p.isStub && Number.isFinite(p.x)) { V.aimPoint.set(p.x, 0, p.z); S.hasAim = true; }
    const raft = raftPos();
    if (S.hasAim) {
      V.tmp.set(V.aimPoint.x - raft.x, 0, V.aimPoint.z - raft.z);
      if (V.tmp.lengthSq() > 0.04) V.aimDir.copy(V.tmp.normalize());
    }
    S.aimYaw = Math.atan2(-V.aimDir.x, -V.aimDir.z);
  }

  function startCharge() {
    if (S.catchFv) releaseCatch();
    if (state === 'lost') {   // a new cast interrupts the reel-in
      api.bobberPos = null;
      aBob(false);
      aLine(false);
    }
    S.pressT = S.clock;
    S.meterT = -1; S.charge = 0;
    S.hasAim = false;
    // default aim: straight up-screen (away from the camera) until the pointer says otherwise
    const cy = num(call(() => ctx.render?.getYaw?.()), 0);
    V.aimDir.set(-Math.sin(cy), 0, -Math.cos(cy));
    updateAim(ctx.input?.ndc);
    setState('charging');
  }

  /** Resolve the cast target along the aim ray (DESIGN §5.1). Writes V.target, returns distance or 0. */
  function resolveTarget(dist) {
    const raft = raftPos();
    const minD = num(BAL('cast').minDist, 3);
    let d = Math.max(minD, dist);
    for (let guard = 0; guard < 200; guard++) {
      const x = raft.x + V.aimDir.x * d, z = raft.z + V.aimDir.z * d;
      if (openWater(x, z, 0.5)) { V.target.set(x, 0, z); return d; }
      d -= 0.5;
      if (d < minD) break;
    }
    return 0;
  }

  function release() {
    const C = BAL('cast');
    const held = S.clock - S.pressT;
    if (held < num(C.tapIgnore, 0.12) || S.meterT < 0) { setState('idle'); return; }
    const castMax = stat('castMax', 16);
    const want = Math.max(num(C.minDist, 3), S.charge * castMax);
    const d = resolveTarget(want);
    if (!d) {
      emit('toast', { text: 'No open water there.', kind: 'info' });
      setState('idle');
      return;
    }
    beginCast(d, S.charge);
  }

  function beginCast(dist, power, instant = false) {
    const C = BAL('cast');
    S.castDist = dist;
    S.extShift.set(0, 0, 0);   // raft displacement no paddling caused, since this cast (lineBroken in Still / Lantern)
    S.clean = power >= num(C.cleanAt, 0.92);
    // bait: one general charge per cast; legend baits are spent by progression on hook
    const eq = equippedBaitId();
    let consumed = null;
    try { consumed = ctx.progression?.consumeBait?.(); } catch (e) { report(e); }
    if (consumed && typeof consumed === 'object' && !consumed.isStub) consumed = consumed.id;
    if (typeof consumed !== 'string') consumed = null;
    const eqB = baitById(eq);
    S.castBait = consumed || (eqB?.legend && num(run()?.bait?.[eq], 1) > 0 ? eq : null);
    // flight
    let tip = null;
    try { tip = ctx.actors?.getRodTip?.(); } catch { /* optional */ }
    if (tip && !tip.isStub && Number.isFinite(tip.x)) V.from.copy(tip);
    else V.from.set(raftPos().x, 1.8, raftPos().z);
    V.to.copy(V.target);
    S.flightDur = num(C.flightBase, 0.45) + num(C.flightPerM, 0.03) * dist;
    S.arcH = num(C.arcHeight, 0.25) * dist;
    S.flightT = 0;
    V.bob.copy(V.from);
    api.bobberPos = bobberPosV.copy(V.target);
    view.castDist = dist; view.charge = power;
    fx.hideTransient();
    setState('casting');
    emit('fishing:cast', { power, target: V.target.clone() });
    aCall('setCharge', 0);
    if (instant) land();
  }

  // ---------------------------------------------------------------- landing the bobber & rolls
  function land() {
    V.bob.copy(V.to);
    const x = V.bob.x, z = V.bob.z;
    call(() => ctx.water?.splash?.(x, z, { size: 0.45, count: 10 }));
    call(() => ctx.water?.addRipple?.(x, z, 0.9));
    fx.pulse(x, z, { color: 0xe9e2cf, r0: 0.15, r1: 1.3, duration: 0.8, alpha: 0.7 });
    emit('fishing:land', { position: V.bob.clone() });
    S.depth = depthAt(x, z);
    view.depth = S.depth;
    // spot?
    S.spot = null; S.rareSpot = false;
    const sr = num(BAL('spots').radius, 2.6);
    let best = Infinity;
    for (const s of api.spots) {
      const dd = Math.hypot(s.position.x - x, s.position.z - z);
      if (dd <= Math.max(sr, s.radius || sr) && dd < best && s.strength > 0.15) { best = dd; S.spot = s; }
    }
    if (S.spot) {
      S.rareSpot = !!S.spot.rare;
      fx.pulse(x, z, { color: S.rareSpot ? 0xffd98a : 0xd0c8f4, r0: 0.3, r1: 2.8, duration: 1.2, alpha: 1, width: 0.12 });   // lilac-moon: apart from motes and enemy eyes
    }
    view.inSpot = !!S.spot;
    if (S.clean) {
      call(() => ctx.ui?.floatText?.(V.bob.clone().setY(0.6), 'Clean Cast', 'clean'));
      fx.burst(x, 0.15, z, { color: 0xffe2a8, color2: 0xe9e2cf, count: 14, spread: 1.6, up: 2.2, gravity: 4, size: 0.07, life: 0.9 });
    }
    if (v3on()) {
      S.cast = castInfo(x, z, S.depth);
      const LP = BAL('bite').letItPass || {};
      if (S.letPass && S.clock - S.letPass.at > num(LP.resetAfter, 60)) S.letPass = null;
      if (S.letPass && (Math.hypot(S.letPass.x - x, S.letPass.z - z) <= num(LP.sameWater?.radius, 6)
        || (S.letPass.place && S.letPass.place === S.cast.place?.id))) S.cast.letPass = S.letPass.value;
      view.place = S.cast.place?.id || null;
      refreshFloat(); S.floatT = 0.5;
    }
    rollBite();
    setState('waiting');
  }

  /** The species that can bite here (zone, hour, depth band, bait), with today's fallbacks. */
  function speciesPool(depth, baitId, phase) {
    const z = zoneData();
    const zoneId = z?.id || run()?.zone;
    const all = (D().SPECIES || []).filter((s) => s.zone === zoneId && s.rarity !== 'legendary');
    let pool = all.filter((s) => timeOk(s, phase) && depth >= num(s.depth?.[0], 0) && depth <= num(s.depth?.[1], 1) && (!s.bait || s.bait === baitId));
    if (!pool.length) pool = all.filter((s) => !s.bait && timeOk(s, phase));
    if (!pool.length) pool = all.length ? all : (D().SPECIES || []).filter((s) => s.rarity !== 'legendary');
    return pool;
  }
  function rollSpecies(depth, rb, baitId) {
    const phase = phaseNow();
    const W = D().RARITY_WEIGHTS || { common: 70, uncommon: 24, rare: 6 };
    const attract = baitById(baitId)?.bonus?.attract || [];
    const pool = speciesPool(depth, baitId, phase);
    if (!pool.length) return null;
    let total = 0;
    const w = pool.map((s) => {
      let v = num(W[s.rarity], 10);
      if (s.rarity === 'uncommon') v *= 1 + 2 * rb;
      else if (s.rarity === 'rare') v *= 1 + 4 * rb;
      if (attract.includes(s.id)) v *= 2.5;
      if (s.bait && s.bait === baitId) v *= 1.5;
      total += v; return v;
    });
    let r = Math.random() * total;
    for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) return pool[i]; }
    return pool[pool.length - 1];
  }

  function rollWeight(sp, baitId) {
    const E = BAL('economy');
    const [a, b] = Array.isArray(sp?.weight) ? sp.weight : [0.5, 1.5];
    const t = Math.pow(Math.random(), num(E.weightSkew, 1.6) / (1 + baitBonus(baitId, 'weightBias')));
    return Math.round((a + (b - a) * t) * 100) / 100;
  }

  function rollBite() {
    const Bt = BAL('bite'), SP = BAL('spots'), C = BAL('cast'), L = BAL('legend');
    const st = stats();
    const baitId = S.castBait;
    const phase = phaseNow();
    const gloom = phase === 'gloomtide';
    const isPity = pity();
    // legend rule
    S.legendCast = false;
    const lg = legendInfo();
    if (lg && baitId && baitId === lg.baitId && timeOk(lg.species, phase) && S.clock >= S.legendDimUntil
      && Math.hypot(V.bob.x - lg.x, V.bob.z - lg.z) <= lg.r) S.legendCast = true;
    let sp;
    if (S.forceSpecies) { sp = S.forceSpecies; S.forceSpecies = null; S.legendCast = sp.rarity === 'legendary'; }   // debug forceBite({speciesId})
    else if (S.legendCast) sp = lg.species;
    else {
      const rb = num(st.rarityBonus, 0) + baitBonus(baitId, 'rarityBonus')
        + (S.spot ? (S.rareSpot ? num(SP.rareRarity, 0.25) : num(SP.rarity, 0.1)) : 0)
        + (S.clean ? num(C.cleanRarity, 0.05) : 0) + (isPity ? num(Bt.pity?.rarity, 0.1) : 0);
      sp = rollSpecies(S.depth, rb, baitId);
    }
    S.species = sp;
    S.zRolled = false; S.z = null; S.sizeClass = null; S.ancient = false; S.tell = null; S.hookTried = false; S.revealed = false;
    if (spV3(sp)) S.weight = 1;   // v3: the size score is rolled when the bite begins (rollSize), not here
    else S.weight = sp ? rollWeight(sp, baitId) : 1;
    // wait
    const biteSpeed = Math.max(0.1, num(st.biteSpeed, 1) + baitBonus(baitId, 'biteSpeed'));
    let W = (num(Bt.waitBase, 3) + expRand(num(Bt.waitMean, 5.5)))
      / (biteSpeed * (S.spot ? 1 / num(SP.waitMult, 0.55) : 1) * (gloom ? num(Bt.gloomMult, 1.15) : 1))
      * (S.clean ? num(C.cleanBiteMult, 0.85) : 1) * (isPity ? num(Bt.pity?.waitMult, 0.7) : 1);
    W = clamp(W, num(Bt.waitMin, 2), num(Bt.waitMax, 25));
    if (S.legendCast) W *= num(SP.legend?.waitMult, 0.7);
    S.waitDur = W;
    // nibbles, feints, tells
    let n;
    if (S.legendCast) n = num(L.nibbles, 2);
    else {
      const P = Bt.nibbles || [0.2, 0.35, 0.3, 0.15];
      let r = Math.random(); n = P.length - 1;
      for (let i = 0; i < P.length; i++) { r -= P[i]; if (r <= 0) { n = i; break; } }
      if (sp && sp.rarity !== 'common') n += 1;
      n = Math.min(4, n);
    }
    const tells = num(st.nibbleTells, 0) + baitBonus(baitId, 'nibbleTells');
    const zoneIdx = num(zoneData()?.index, 0);
    const feint = !S.legendCast && sp?.rarity === 'rare' && zoneIdx >= num(Bt.feintZoneMin, 2) && Math.random() < num(Bt.feintChance, 0.3);
    const gap = num(Bt.nibbleGap, 0.7), lead = num(Bt.lastNibbleLead, 0.6), t0 = 0.5;
    const evs = [];
    for (let i = 0; i < n; i++) evs.push({ type: 'nibble' });
    if (feint) evs.splice(Math.floor(Math.random() * (evs.length + 1)), 0, { type: 'feint' });
    if (tells >= 1) {
      // real bites get an early tell: the last nibble becomes a gold double-dip
      if (evs.length && evs[evs.length - 1].type === 'nibble') evs[evs.length - 1].type = 'tell';
      else evs.push({ type: 'tell' });
    }
    const span = W - lead - t0;
    const fit = span >= 0 ? Math.floor(span / gap) + 1 : 0;
    while (evs.length > fit) evs.shift();
    if (evs.length) {
      const extra = Math.max(0, span - (evs.length - 1) * gap);
      const wts = evs.map(() => Math.random()); wts.push(Math.random() * 0.6);
      const tot = wts.reduce((a, b) => a + b, 0) || 1;
      let tt = t0;
      for (let i = 0; i < evs.length; i++) { tt += (i ? gap : 0) + extra * wts[i] / tot; evs[i].t = tt; }
    }
    S.events = evs; S.evIdx = 0; S.dipT = 0; S.dipKind = '';
    S.tells = tells;
  }

  // ---------------------------------------------------------------- bite & hook
  function bite() {
    const Bt = BAL('bite'), L = BAL('legend');
    const sp = S.species;
    if (!sp) { toLost(0.6); return; }
    const r = run();
    const wounded = sp.rarity === 'legendary' ? num(r?.flags?.wounded?.[sp.id], 0) : 0;
    S.wounded = wounded;
    const hw = Math.max(0.1, stat('hookWindow', 1) + baitBonus(S.castBait, 'hookWindow'));
    S.window = clamp(num(sp.difficulty?.window, 1) * hw * (starving() ? 0.85 : 1) + (wounded > 0 ? num(L.windowBonus, 0.1) : 0),
      num(Bt.windowMin, 0.35), num(Bt.windowMax, 1.4));
    const v3 = spV3(sp);
    if (v3) {
      if (!S.zRolled) rollSize();
      if (!S.tell) S.tell = sp.rarity === 'legendary' ? 'dome' : classOf(S.sizeClass)?.bite || 'plunge';
      // Prize+ fish hold the bait 10% longer (DESIGN §25.6.4)
      if (classIndex(S.sizeClass) >= classIndex(Bt.holdMultFrom || 'prize')) S.window *= num(Bt.holdMult, 1.1);
      view.biteTell = S.tell;
    }
    const x = V.bob.x, z = V.bob.z;
    call(() => ctx.water?.splash?.(x, z, { size: v3 ? 0.5 + 0.12 * Math.max(0, classIndex(S.sizeClass) - 1) : 0.5, count: 12 }));
    call(() => ctx.water?.addRipple?.(x, z, 1.2));
    fx.pulse(x, z, { color: 0xff8a5a, r0: 0.2, r1: 1.2, duration: 0.45, width: 0.07, alpha: 1 });
    fx.pulse(x, z, { color: 0xffc27a, r0: 0.4, r1: 2.0, duration: 0.8, width: 0.05, alpha: 0.6 });
    view.tell = null;
    setState('bite');
    emit('fishing:bite', v3 ? { speciesId: sp.id, sizeClass: S.sizeClass, biteTell: S.tell } : { speciesId: sp.id });
  }

  /** The class's bite tell (F4): the size is rolled now and the bobber shows it before the "!" (readable with sound off). */
  function beginTell() {
    rollSize();
    const sp = S.species;
    S.tell = sp?.rarity === 'legendary' ? 'dome' : classOf(S.sizeClass)?.bite || 'plunge';
    const dur = { doublePop: 0.36, plunge: 0, dragUnder: num(BAL('bite').dragUnder, 0.4), flatSlide: 0.5, dome: 0.6 }[S.tell] ?? 0;
    S.tellStart = Math.max(S.stateT, S.waitDur - dur);
    S.tellPops = 0;
    V.tmp.set(V.bob.x - V.raft.x, 0, V.bob.z - V.raft.z);
    if (V.tmp.lengthSq() > 1e-4) V.tmp.normalize(); else V.tmp.set(0, 0, -1);
    S.tellDir.set(-V.tmp.z, 0, V.tmp.x).multiplyScalar(Math.random() < 0.5 ? -1 : 1);   // a sideways slide for the flat tell
    view.biteTell = S.tell;
    emit('fishing:tell', { speciesId: sp?.id || null, sizeClass: S.sizeClass, biteTell: S.tell, lead: Math.max(0, S.waitDur - S.stateT) });
  }
  /** The tell's bobber pose at its progress k (0 → 1): {dip (m below the surface), slide (m), state}. */
  function tellPose(k) {
    const x = V.bob.x, z = V.bob.z;
    switch (S.tell) {
      case 'doublePop': {   // Small: a quick double pop
        const pop = (k < 0.22) || (k >= 0.5 && k < 0.72);
        const n = k >= 0.5 ? 2 : 1;
        if (S.tellPops < n) { S.tellPops = n; fx.pulse(x, z, { color: 0xe9e2cf, r0: 0.1, r1: 0.55, duration: 0.3, alpha: 0.7 }); }
        return { dip: pop ? 0.08 : 0, slide: 0, state: pop ? 'nibble' : 'floating' };
      }
      case 'dragUnder': {   // Prize: a slow drag-under
        if (!S.tellPops) { S.tellPops = 1; fx.pulse(x, z, { color: 0xe9e2cf, r0: 0.2, r1: 1.6, duration: 0.9, width: 0.06, alpha: 0.75 }); }
        return { dip: num(BAL('bite').plunge, 0.25) * smoothstep(0, 1, k), slide: 0.25 * k, state: 'nibble' };
      }
      case 'flatSlide': {   // Trophy: the bobber lies flat, then slides away
        if (!S.tellPops) { S.tellPops = 1; fx.pulse(x, z, { color: 0xb0483c, r0: 0.25, r1: 1.4, duration: 0.8, width: 0.07, alpha: 0.8 }); }
        if (k > 0.3) call(() => ctx.water?.addWake?.(x, z, S.tellDir.x, S.tellDir.z, 0.35));
        return { dip: -0.03, slide: 0.7 * smoothstep(0.3, 1, k), state: 'floating' };
      }
      case 'dome': {        // Elder: a dome of water bulges up under the bobber first
        if (S.tellPops < 1) { S.tellPops = 1; fx.pulse(x, z, { color: 0x1a1f2c, r0: 0.3, r1: 2.6, duration: 1.0, width: 0.14, alpha: 0.9 }); call(() => ctx.water?.addRipple?.(x, z, 1.6)); }
        if (S.tellPops < 2 && k > 0.55) { S.tellPops = 2; fx.pulse(x, z, { color: 0xd8d0ff, r0: 0.4, r1: 3.2, duration: 0.8, width: 0.05, alpha: 0.55 }); call(() => ctx.water?.addRipple?.(x, z, 2.2)); }
        return { dip: -0.18 * smoothstep(0, 0.8, k), slide: 0, state: 'floating' };
      }
      default: return { dip: 0, slide: 0, state: 'floating' };
    }
  }
  /** Let it pass (F4): the lapsed bite's general bait comes back and the next cast in the same water gets +0.15 favour (cap 0.3). */
  function letItPass() {
    const LP = BAL('bite').letItPass || {};
    const b = S.castBait ? baitById(S.castBait) : null;
    let refunded = false;
    if (b && !b.legend) { try { refunded = prog()?.refundBait?.(S.castBait) === true; } catch (e) { report(e); } }
    const prev = S.letPass && S.clock - S.letPass.at <= num(LP.resetAfter, 60) ? S.letPass.value : 0;
    S.letPass = { value: Math.min(num(LP.cap, 0.3), round2(prev + num(LP.favour, 0.15))), x: V.bob.x, z: V.bob.z, place: S.cast?.place?.id || null, at: S.clock };
    return refunded;
  }

  function hook() {
    const sp = S.species;
    if (!sp) return;
    const Bt = BAL('bite');
    const reaction = S.stateT;
    if (reaction > S.window) return;   // update() turns this into a late miss
    const perfect = reaction <= Math.max(num(Bt.perfectMin, 0.25), num(Bt.perfectFrac, 0.4) * S.window);
    S.perfect = perfect;
    // (the perfect-hook streak lives in run.flags.streak and is kept by progression from fishing:hook / fishing:miss)
    const legendary = sp.rarity === 'legendary';
    // reel model (v3: size scales the species before createReel, and the reel gets its v3 edits)
    const st = stats();
    let diff = sp.difficulty || FALLBACK_DIFF, v3opts;
    if (spV3(sp)) {
      if (!S.zRolled) rollSize();
      const SZ = BAL('size');
      const zone = sp.zone && SZ.fight?.elderAge?.[sp.zone] != null ? sp.zone : (zoneData()?.id || run()?.zone);
      diff = scaleDifficultyV3(diff, sp.behavior || 'steady', legendary ? num(SZ.fight?.legendZ, 0) : S.z, zone, SZ, BAL('reel'));
      v3opts = reelOptsV3({ size: SZ, bite: BAL('bite'), stats: st, z: S.z, legendary, perfect, style: sp.style || sp.behavior, sizeClass: S.sizeClass });
      S.letPass = null;   // a hook resets let it pass
    }
    S.reel = createReel({
      R: BAL('reel'), sp: diff, behavior: sp.behavior || 'steady', boss: sp.boss || null, legendary,
      LS: num(st.lineStrength, 1), RS: num(st.reelSpeed, 1) * (starving() ? 0.75 : 1), sweetZone: num(st.sweetZone, 0.16),
      slackTime: num(st.slackTime, 1.6), perfect, startP: S.wounded, onEvent: onReelEvent,
      ...(v3opts ? { v3: v3opts, rng: S.rng || undefined } : {}),
    });
    view.pips = v3opts && S.reel.pipsMax ? { n: S.reel.pips, max: S.reel.pipsMax } : null;
    if (v3opts) { view.favour = null; view.biteTell = null; }   // the float and its tell are gone once the fish is on (the card lists the favours)
    S.holding = true;   // the hook tap is the start of the hold
    S.moveHold = 0; S.gearT = 0; S.summons.length = 0; S.snags.length = 0;
    S.hookDist = Math.max(2.5, Math.hypot(V.bob.x - raftPos().x, V.bob.z - raftPos().z));
    V.lineDir.set(V.bob.x - V.raft.x, 0, V.bob.z - V.raft.z);
    if (V.lineDir.lengthSq() < 1e-4) V.lineDir.set(0, 0, -1); else V.lineDir.normalize();
    view.speciesId = sp.id; view.rarity = sp.rarity; view.legendary = legendary;
    // the fish appears at the bobber
    spawnHooked(sp);
    const x = V.bob.x, z = V.bob.z;
    call(() => ctx.water?.splash?.(x, z, { size: 0.6 + S.fishLen * 0.4, count: 16 }));
    fx.pulse(x, z, { color: perfect ? 0xffe2a8 : 0xe9e2cf, r0: 0.2, r1: perfect ? 1.9 : 1.3, duration: 0.55, width: 0.05, alpha: 0.7 });
    if (perfect) fx.burst(x, 0.3, z, { color: 0xffe2a8, color2: 0xffffff, count: 16, spread: 2, up: 3, gravity: 5, size: 0.07, life: 0.8 });
    setState('reeling');
    emit('fishing:hook', v3opts ? { speciesId: sp.id, perfect, legendary, name: sp.name, epithet: sp.epithet || '', pips: S.reel.pipsMax ? S.reel.pips : null }
      : { speciesId: sp.id, perfect, legendary, name: sp.name, epithet: sp.epithet || '' });
    if (legendary) {
      S.bannerT = num(BAL('legend').bannerDelay, 0.4);
      view.phaseName = S.reel.phaseName;
      if (sp.final) emit('toast', { text: D().TEXT?.victoryHooked || 'The water goes very still.', kind: 'lore' });
    }
  }

  function onReelEvent(type, p) {
    const sp = S.species;
    switch (type) {
      case 'surgeWarn':
        if (sp?.boss && sp.id === 'belled_matriarch') {
          // a bell tolls beneath the raft before every surge
          call(() => ctx.audio?.play?.('dusk_toll', { volume: 0.55, pitch: 1.35 }));
          fx.pulse(V.raft.x, V.raft.z, { color: 0xd8e0ff, r0: 0.6, r1: 7, duration: 1.4, width: 0.09, alpha: 0.8 });
        } else if (sp?.boss && sp.id === 'glass_sovereign') {
          call(() => ctx.audio?.play?.('charge_ping', { volume: 0.7, pitch: 0.55 }));
          fx.pulse(F.fv ? V.fish.x : V.bob.x, F.fv ? V.fish.z : V.bob.z, { color: 0x5cbcff, r0: 0.4, r1: 4, duration: 0.9, width: 0.05, alpha: 0.8 });
        }
        if (ctx.isMobile) call(() => navigator.vibrate?.(25));
        break;
      case 'surge':
        emit('fishing:surge', p.trick ? { strength: p.strength, kind: p.kind, trick: true } : { strength: p.strength, kind: p.kind });
        onSurgeVisual(p.kind, p.duration);
        break;
      case 'oldTrick':   // every Elder, once past 55%: a short-warning surge whose kind must be read (DESIGN §25.6.5)
        emit('fishing:oldTrick', { speciesId: sp?.id || null, kind: p.kind, style: p.style || null });
        fx.pulse(V.fish.x, V.fish.z, { color: 0x1a1f2c, r0: 0.5, r1: 4.2, duration: 0.9, width: 0.12, alpha: 0.85 });
        call(() => ctx.render?.shake?.(0.12, 0.3));
        break;
      case 'pip':        // a hook-hold pip lost (tension dipped below 0.15 in a surge)
        view.pips = { n: p.n, max: p.max };
        emit('fishing:pip', { n: p.n, max: p.max });
        fx.burst(V.mouth.x, Math.max(0.2, V.mouth.y + 0.2), V.mouth.z, { color: 0xe9e2cf, color2: 0xffe2a8, count: 6, spread: 1.2, up: 1.6, gravity: 6, size: 0.05, life: 0.5 });
        break;
      case 'surgeEnd': break;
      case 'phase':
        view.phaseName = p.name || '';
        if (p.index > 0) {
          emit('toast', { text: `${sp?.name || 'It'}: ${p.name}`, kind: 'bad' });
          call(() => ctx.render?.shake?.(0.18, 0.4));
          fx.pulse(V.fish.x, V.fish.z, { color: 0xffd27a, r0: 0.5, r1: 5, duration: 1.2, width: 0.1, alpha: 0.9 });
        }
        if (p.mechanic === 'summon') {
          const ph = p.phase || {};
          const cnt = num(ph.count, 2), gap = num(ph.gap, 4);
          for (let i = 0; i < cnt; i++) S.summons.push({ at: S.reel.time + 0.6 + i * gap, enemy: ph.enemy || 'drowned_hand', zoneMod: ph.zoneMod || null });
        }
        break;
      case 'enrage':
        view.enraged = true;
        emit('toast', { text: `${sp?.name || 'The fish'} is enraged.`, kind: 'bad' });
        call(() => F.fv?.setGlow?.(1.8));
        break;
      case 'dive':
        // Leviathan: slack makes it dive instead of escaping
        call(() => ctx.water?.splash?.(V.fish.x, V.fish.z, { size: 1.6, count: 22 }));
        fx.pulse(V.fish.x, V.fish.z, { color: 0x2a3040, r0: 0.5, r1: 4, duration: 1, width: 0.12, alpha: 0.9 });
        call(() => ctx.render?.shake?.(0.2, 0.4));
        break;
      default: break;   // snap / slack / landed are handled after step()
    }
  }

  function onSurgeVisual(kind, duration) {
    const x = V.fish.x, z = V.fish.z, L = S.fishLen;
    if (kind === 'leap') {
      if (S.zRolled && !S.revealed && S.species?.rarity !== 'legendary' && classIndex(S.sizeClass) >= classIndex('prize')) { S.revealed = true; view.sizeClass = S.sizeClass; view.ancient = S.ancient; }
      F.leap = true; F.leapT = 0; F.leapCount = 0;
      F.leapDur = clamp(Math.min(duration, 0.7 + L * 0.25), 0.5, 1.6);
      F.leapH = clamp(0.7 + L * 0.55, 0.8, 3.2);
      leapSplash(x, z);
    } else {
      call(() => ctx.water?.splash?.(x, z, { size: 0.5 + L * 0.5, count: 14 }));
      F.dash = (Math.random() < 0.5 ? -1 : 1) * (1.2 + L * 0.6) * (S.species?.behavior === 'darter' ? 1.6 : 1);
    }
  }
  function leapSplash(x, z) {
    const L = S.fishLen;
    call(() => ctx.water?.splash?.(x, z, { size: 0.6 + L * 0.6, count: 18 }));
    if (S.species?.id === 'drifting_grove') {
      fx.burst(x, 0.4, z, { color: 0xffb46a, color2: 0xff8fc0, count: 26, spread: 2.2, up: 2.4, gravity: -0.4, drag: 1.6, size: 0.1, life: 2.2, radius: 0.8 });
    } else if (S.species?.model?.glow) {
      fx.burst(x, 0.3, z, { color: S.species.model.glow, count: 10, spread: 1.4, up: 2.6, gravity: 5, size: 0.06, life: 0.7 });
    }
  }

  // ---------------------------------------------------------------- hooked fish visual
  function disposeFv(fv) { if (!fv) return; try { fv.dispose?.(); } catch { /* ignore */ } try { fv.object3d?.parent?.remove(fv.object3d); } catch { /* ignore */ } }
  function spawnHooked(sp) {
    disposeHooked(false);
    let fv = null;
    try { fv = ctx.models?.createFish?.(sp.id, S.weight); } catch (e) { report(e); }
    F.lat = 0; F.latV = 0; F.dash = 0; F.leap = false; F.splashT = 0; F.wakeT = 0; F.rippleT = 0; F.landing = false;
    F.dist = S.hookDist; F.y = -0.1; F.roll = 0; F.yaw = Math.atan2(V.lineDir.x, V.lineDir.z);
    if (fv && !fv.isStub && fv.object3d) {
      F.fv = fv;
      // small fish read better a little larger mid-fight (actors resets scale on showCatch)
      const L0 = clamp(num(fv.length, 0.5), 0.12, 6);
      const boost = clamp(1.6 - L0 * 0.3, 1, 1.45);
      fv.object3d.scale.setScalar(boost);
      S.fishLen = L0 * boost;
      fishHolder.add(fv.object3d);
    } else { F.fv = null; S.fishLen = 0.5; }
    V.fish.copy(V.bob);
  }
  function disposeHooked(flee) {
    if (!F.fv) return;
    if (flee) {
      if (S.flee) disposeFv(S.flee.fv);
      S.flee = { fv: F.fv, t: 0, dir: V.lineDir.clone(), pos: V.fish.clone(), yaw: F.yaw };
    } else disposeFv(F.fv);
    F.fv = null;
  }

  function updateHooked(dt, t) {
    const raft = raftPos();
    const reel = S.reel;
    const L = S.fishLen;
    const sp = S.species || {};
    const er = num(sp.difficulty?.erratic, 0.1);
    F.phase += dt;
    // distance shrinks with progress
    const minD = 2.2 + L * 0.5;
    const P = reel ? reel.P : 1;
    F.dist = damp(F.dist, lerp(S.hookDist, minD, clamp(P, 0, 1)), 2.5, dt);
    // lateral swimming + dashes
    const surging = !!reel?.surge, warn = reel?.surgeWarn || 0;
    F.dash = damp(F.dash, 0, 1.4, dt);
    const sway = Math.sin(F.phase * (0.55 + er) + 1.3) * (0.6 + F.dist * 0.07) + Math.sin(F.phase * 1.7) * 0.25 * er;
    F.latTarget = sway + F.dash;
    const prevLat = F.lat;
    F.lat = damp(F.lat, F.latTarget, surging ? 4 : 2, dt);
    F.latV = dt > 0 ? (F.lat - prevLat) / dt : 0;
    V.perp.set(-V.lineDir.z, 0, V.lineDir.x);
    const px = raft.x + V.lineDir.x * F.dist + V.perp.x * F.lat;
    const pz = raft.z + V.lineDir.z * F.dist + V.perp.z * F.lat;
    const ox = V.fish.x, oz = V.fish.z;
    // vertical: riding the surface with its back out; thrash in pull surges; leap arcs
    const wy = waterH(px, pz);
    let y = wy - 0.01 * L + Math.sin(F.phase * 3.1) * 0.015 * (1 + warn * 2);
    let pitch = 0;
    if (F.leap) {
      F.leapT += dt;
      const u = F.leapT / F.leapDur;
      if (u >= 1) {
        leapSplash(px, pz);
        F.leapCount++;
        // long leap surges hop again
        if (surging && reel.surgeKind === 'leap' && F.leapCount < 3) { F.leapT = 0; F.leapH *= 0.7; F.leapDur *= 0.8; }
        else F.leap = false;
      } else {
        y = wy + 4 * F.leapH * u * (1 - u) - 0.05 * L;
        pitch = (1 - 2 * u) * 0.9;
      }
    } else if (surging) {
      y = wy + Math.abs(Math.sin(F.phase * 9)) * 0.06 * Math.max(1, L);
      F.splashT -= dt;
      if (F.splashT <= 0) { F.splashT = U(0.14, 0.26); call(() => ctx.water?.splash?.(px, pz, { size: 0.3 + L * 0.35, count: 6 })); }
    }
    V.fish.set(px, y, pz);
    // heading: away from the raft, bent by lateral motion
    const dx = px - ox, dz = pz - oz;
    const awayX = V.lineDir.x, awayZ = V.lineDir.z;
    const latK = clamp(F.latV * 0.35, -1.2, 1.2);
    const hx = awayX + V.perp.x * latK, hz = awayZ + V.perp.z * latK;
    const targetYaw = Math.atan2(hx, hz);
    let dy = targetYaw - F.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    F.yaw += dy * (1 - Math.exp(-6 * dt));
    if (F.fv) {
      const o = F.fv.object3d;
      o.position.copy(V.fish);
      o.rotation.set(-pitch, F.yaw, 0, 'YXZ');
      const struggle = surging ? 1.4 : warn > 0 ? 0.5 + warn * 0.6 : 0.25 + (reel?.T || 0) * 0.4;
      fishUpd(F.fv, dt, t, 1.2, struggle);
    }
    // wake & ripples
    const speed = dt > 0 ? Math.hypot(dx, dz) / dt : 0;
    F.wakeT -= dt;
    if (!F.leap && speed > 0.8 && F.wakeT <= 0) { F.wakeT = 0.14; call(() => ctx.water?.addWake?.(px, pz, -hx, -hz, clamp(speed / 4, 0.2, 1) * (0.5 + L * 0.3))); }
    F.rippleT -= dt;
    if (!F.leap && F.rippleT <= 0) { F.rippleT = surging ? 0.25 : warn > 0 ? 0.3 : 0.9; call(() => ctx.water?.addRipple?.(px, pz, 0.35 + L * 0.2 + warn * 0.4)); }
    // mouth / line end
    const fwdX = Math.sin(F.yaw), fwdZ = Math.cos(F.yaw);
    V.mouth.set(px + fwdX * L * 0.45, y + 0.04, pz + fwdZ * L * 0.45);
    const wig = Math.sin(F.phase * (surging ? 16 : 7 + warn * 6)) * (surging ? 1 : 0.45 + warn * 0.4);
    fx.setShadow(true, px, pz, Math.max(0.5, L * 1.3), F.yaw, F.leap ? 0.16 : 0.42, wig, F.leap ? 0.05 : 0.25 + warn * 0.45);
  }

  function updateFlee(dt, t) {
    const f = S.flee;
    if (!f) return;
    f.t += dt;
    const k = f.t / 1.2;
    if (k >= 1 || !f.fv) { disposeFv(f.fv); S.flee = null; fx.setShadow(false); return; }
    f.pos.x += f.dir.x * dt * 6; f.pos.z += f.dir.z * dt * 6;
    f.pos.y = -0.1 - k * 1.2;
    const o = f.fv.object3d;
    o.position.copy(f.pos);
    o.rotation.set(0.4 * k, Math.atan2(f.dir.x, f.dir.z), 0, 'YXZ');
    fishUpd(f.fv, dt, t, 2, 0.3);
    if (state === 'lost' || state === 'idle') fx.setShadow(true, f.pos.x, f.pos.z, S.fishLen * 1.2, Math.atan2(f.dir.x, f.dir.z), 0.42 * (1 - k));
  }

  // ---------------------------------------------------------------- outcomes
  function computeQuality() {
    const SP = BAL('spots');
    const QB = BAL('quality');
    let q = S.reel ? S.reel.qualityScore(QB) : 0;
    if (!S.reel && S.perfect) q += num(QB.perfectHookBonus, 0.15);
    q += S.spot ? (S.rareSpot ? num(SP.rareQuality, 0.15) : num(SP.quality, 0.08)) : 0;
    q += baitBonus(S.castBait, 'shimmer') + relicShimmer();
    const Q = D().QUALITY || {};
    const tP = num(Q.perfect?.threshold, 0.78), tF = num(Q.fine?.threshold, 0.45);
    let tier = q >= tP ? 'perfect' : q >= tF ? 'fine' : 'normal';
    if (tier === 'normal' && Math.random() < num(Q.fine?.chance, 0.05)) tier = 'fine';
    else if (tier === 'fine' && Math.random() < num(Q.perfect?.chance, 0.01)) tier = 'perfect';
    S.qScore = q;
    return tier;
  }

  function startLanding() {
    S.quality = computeQuality();
    if (S.zRolled && S.species?.rarity !== 'legendary') { view.sizeClass = S.sizeClass; view.ancient = S.ancient; S.revealed = true; }   // legends carry no class
    F.landing = true;
    F.landFrom.copy(V.fish);
    S.holding = false;
    setState('landing');
    call(() => ctx.water?.splash?.(V.fish.x, V.fish.z, { size: 0.5 + S.fishLen * 0.4, count: 12 }));
  }

  function updateLanding(dt, t) {
    const dur = num(BAL('reel').landingTime, 1.2);
    const k = clamp(S.stateT / dur, 0, 1);
    const raft = raftPos();
    const L = S.fishLen;
    const nearD = 1.3 + L * 0.35;
    const tx = raft.x + V.lineDir.x * nearD, tz = raft.z + V.lineDir.z * nearD;
    const e = k * k * (3 - 2 * k);
    const lift = smoothstep(0.55, 1, k);
    let tipY = 1.8;
    if (lift > 0) { try { const tp = ctx.actors?.getRodTip?.(); if (tp && Number.isFinite(tp.y)) tipY = tp.y; } catch { /* optional */ } }
    const lx = lerp(F.landFrom.x, tx, e), lz = lerp(F.landFrom.z, tz, e);
    const wy = waterH(lx, lz);
    V.fish.set(lx, lerp(wy - 0.02 * L, Math.max(0.6, tipY - L * 0.6), lift) + Math.abs(Math.sin(S.stateT * 10)) * 0.06 * (1 - lift), lz);
    if (F.fv) {
      const o = F.fv.object3d;
      o.position.copy(V.fish);
      const yaw = Math.atan2(-V.lineDir.x, -V.lineDir.z);
      o.rotation.set(-0.6 * lift, yaw, Math.sin(S.stateT * 12) * 0.3 * (1 - lift), 'YXZ');
      fishUpd(F.fv, dt, t, 1, 1.2 + lift * 0.5);
    }
    view.tension = damp(view.tension, 0.3, 4, dt);
    view.progress = 1; view.stamina = 0;
    V.mouth.copy(V.fish).setY(V.fish.y + 0.05);
    fx.setShadow(lift < 0.9, V.fish.x, V.fish.z, L * 1.2, F.yaw, 0.4 * (1 - lift));
    F.splashT -= dt;
    if (F.splashT <= 0 && lift < 0.7) { F.splashT = U(0.18, 0.3); call(() => ctx.water?.splash?.(V.fish.x, V.fish.z, { size: 0.3 + L * 0.3, count: 6 })); }
    if (k >= 1) caught();
  }

  function caught(opts = {}) {
    const sp = opts.species || S.species;
    if (!sp) { hardReset(); return; }
    const weight = num(opts.weight, S.weight);
    const quality = opts.quality || S.quality || 'normal';
    const phase = phaseNow();
    const v3 = spV3(sp) && S.zRolled;
    const v3x = v3 ? { z: S.z, sizeClass: S.sizeClass, ancient: S.ancient, length: Math.round(S.lengthCm * 10) / 10, favours: S.favourTerms.map((t) => ({ ...t })),
      place: S.cast?.place?.id || null, mu: round2(S.mu) } : null;
    if (v3 && S.cast?.pressureKey && sp.rarity !== 'legendary') S.pressure[S.cast.pressureKey] = (S.pressure[S.cast.pressureKey] || 0) + 1;   // pressure: −0.12 per catch here today
    const fv = F.fv; F.fv = null;
    fx.setShadow(false);
    if (fv) {
      if (quality === 'perfect') call(() => fv.setGlow?.(1.6));
      S.catchFv = fv; S.catchT = 0; S.catchSeenBlock = false;
    }
    // depletes a spot it came from
    if (S.spot && api.spots.includes(S.spot)) { S.spot.ttl = Math.min(S.spot.ttl, 8); S.spot.depleted = true; }
    call(() => ctx.water?.splash?.(V.fish.x, V.fish.z, { size: 0.8 + S.fishLen * 0.5, count: 18 }));
    if (quality === 'perfect') fx.burst(V.fish.x, V.fish.y + 0.2, V.fish.z, { color: 0xffe2a8, color2: 0xffffff, count: 24, spread: 1.8, up: 2.2, gravity: 2, size: 0.07, life: 1.3, radius: 0.3 });
    const legendary = sp.rarity === 'legendary';
    S.reel = null; S.holding = false;
    api.bobberPos = null;
    resetView();
    aLine(false);
    aBob(false);
    aCall('setReel', 0, 0);
    setState('idle');
    if (fv) { fv.object3d.scale.setScalar(1); call(() => ctx.actors?.showCatch?.(fv)); }
    emit('fishing:caught', {
      speciesId: sp.id, weight, quality,
      legendary, final: !!sp.final, perfect: !!S.perfect, inSpot: !!S.spot, rareSpot: !!S.rareSpot,
      depth: S.depth, night: phase === 'gloomtide', zone: zoneData()?.id || run()?.zone || null,
      ...(v3x || {}),
    });
    if (legendary) {
      const r = run();
      if (r?.flags?.wounded?.[sp.id]) delete r.flags.wounded[sp.id];
      if (sp.final) {
        // landing the Pale Leviathan ends the Gloomtide (DESIGN §5.6); progression emits victory
        call(() => ctx.combat?.killAll?.('dawn'));
        if (phaseNow() === 'gloomtide') {
          if (isReal(ctx.survival) && typeof ctx.survival.setPhase === 'function') call(() => ctx.survival.setPhase('dawn'));
          else call(() => ctx.debug?.setPhase?.('dawn'));
        }
      }
    }
    S.spot = null; S.rareSpot = false; S.perfect = false;
  }

  function escaped(reason, extra = {}) {
    const sp = S.species;
    const P = S.reel ? S.reel.P : 0;
    if (sp?.rarity === 'legendary') {
      const L = BAL('legend');
      const r = run();
      if (r) {
        r.flags = r.flags || {};
        r.flags.wounded = r.flags.wounded || {};
        r.flags.wounded[sp.id] = Math.min(num(L.woundedMax, 0.4), Math.max(num(r.flags.wounded[sp.id], 0), num(L.woundedCarry, 0.5) * P));
      }
      S.legendDimUntil = S.clock + num(L.rebiteDelay, 20);
    }
    const x = V.fish.x, z = V.fish.z;
    if (reason === 'snap') {
      call(() => ctx.water?.splash?.(x, z, { size: 0.7, count: 14 }));
      fx.burst(V.mouth.x, Math.max(0.2, V.mouth.y + 0.4), V.mouth.z, { color: 0xe9e2cf, count: 12, spread: 2.4, up: 2.5, gravity: 7, size: 0.05, life: 0.6 });
    } else call(() => ctx.water?.splash?.(x, z, { size: 0.4, count: 8 }));
    disposeHooked(true);
    fx.setShadow(false);
    if (spV3(sp) && S.zRolled && sp.rarity !== 'legendary' && classIndex(S.sizeClass) >= classIndex(BAL('ceremony').nearMiss?.fromClass || 'prize')) {
      emit('fish:escaped-big', { speciesId: sp.id, z: S.z, sizeClass: S.sizeClass, length: Math.round(S.lengthCm * 10) / 10, progress: P,
        cause: reason === 'snap' || reason === 'thrown' || reason === 'spooled' ? reason : 'slack', place: S.cast?.place?.id || null, markedFish: false });
    }
    emit('fishing:escaped', { speciesId: sp?.id || null, reason, ...extra });
    toLost(reason === 'snap' ? 0.35 : num(BAL('cast').reelInTime, 0.6), reason !== 'snap');
    if (reason !== 'snap') V.bob.set(x, 0, z);
  }

  // ---------------------------------------------------------------- cancel / slam
  function cancel(reason = 'moved') {
    if (reason === 'snap' && hookSafe()) return;   // Still / Lantern: a slam never snaps the line (DESIGN §25.5.3)
    // Still / Lantern: a "the raft was dragged away from the bobber" cancel with no paddling behind it is combat displacement
    // (a knock, a shove, a pull); fishing's own lineBroken() discounts it, so the line stays out (CONTRACT §13.7 the hard rule)
    if (reason === 'moved' && (state === 'casting' || state === 'waiting' || state === 'bite') && hookSafe() && !moveInput() && !lineBroken()) return;
    if (reason === 'snap') {   // e.g. a hand slam (combat) snaps a non-legendary line
      if (state === 'reeling' || state === 'landing') { if (S.reel) S.reel.done = true; escaped('snap'); }
      else if (state === 'bite') {
        emit('fishing:escaped', { speciesId: S.species?.id || null, reason: 'snap' });
        fx.burst(V.bob.x, 0.4, V.bob.z, { color: 0xe9e2cf, count: 10, spread: 2, up: 2.4, gravity: 7, size: 0.05, life: 0.6 });
        toLost(0.35, false);
      } else if (state === 'casting' || state === 'waiting') toLost(0.35, false);
      else if (state === 'charging') setState('idle');
      return;
    }
    switch (state) {
      case 'charging':
        setState('idle');
        break;
      case 'casting': case 'waiting': case 'bite':
        if (reason === 'moved') {
          emit('fishing:miss', { reason: 'moved' });
            toLost(num(BAL('cast').reelInTime, 0.6));
        } else hardReset();
        break;
      case 'reeling':
        if (reason === 'moved') escaped('slack', { cut: true });
        else hardReset();
        break;
      case 'landing':
        if (reason !== 'moved') hardReset();
        break;
      default:
        if (reason !== 'moved') hardReset();
        break;
    }
  }

  function slam() {
    if (S.clock - S.slamAt < 0.3) return;
    S.slamAt = S.clock;
    if (state !== 'reeling' || !S.reel) return;
    if (hookSafe()) return;   // Still / Lantern: a slam neither snaps nor spikes a hooked line
    if (S.species?.rarity === 'legendary') S.reel.spike(0.25);
    else { S.reel.done = true; escaped('snap', { slam: true }); }
  }
  /** A telegraphed snag on a hooked line (Still / Lantern legend fights, DESIGN §25.5.6; combat may call it too): a dark shape
   *  rises under the water at the fish, and `lead` s later the line takes +spike tension. Released through, it is a surge;
   *  it never snaps a line by itself. Returns false when nothing is hooked. */
  function snag({ lead = 1, spike = 0.2 } = {}) {
    if (state !== 'reeling' || !S.reel) return false;
    const l = Math.max(0, num(lead, 1)), sp = clamp(num(spike, 0.2), 0, 0.6);
    S.snags.push({ at: S.reel.time + l, spike: sp });
    fx.pulse(V.fish.x, V.fish.z, { color: 0x14161e, r0: 0.3, r1: 2.4, duration: Math.max(0.4, l), width: 0.16, alpha: 0.9 });
    call(() => ctx.water?.addRipple?.(V.fish.x, V.fish.z, 1.4));
    emit('fishing:snag', { state: 'warn', lead: l, spike: sp });
    return true;
  }

  // ---------------------------------------------------------------- catch display
  function releaseCatch() {
    const fv = S.catchFv;
    if (!fv) return;
    S.catchFv = null;
    // only clear the hold-up if actors is still showing OUR fish (someone else may have replaced it)
    const par = fv.object3d?.parent;
    if (par && par !== fishHolder) call(() => ctx.actors?.showCatch?.(null));
    disposeFv(fv);
  }
  function updateCatch(realDt, t) {
    const fv = S.catchFv;
    if (!fv) return;
    S.catchT += realDt;
    const blocking = (() => { try { return ctx.ui?.isBlocking?.() === true; } catch { return false; } })();
    if (blocking) S.catchSeenBlock = true;
    // the catch card closing (or no card at all) ends the display
    if ((S.catchSeenBlock && !blocking && S.catchT > 0.4) || (!S.catchSeenBlock && S.catchT > 3.2) || S.catchT > 90) { releaseCatch(); return; }
    // actors took it (showCatch reparents) — otherwise hang it from the rod tip ourselves
    if (fv.object3d?.parent === fishHolder) {
      let tip = null;
      try { tip = ctx.actors?.getRodTip?.(); } catch { /* optional */ }
      const raft = raftPos();
      const tx = tip && Number.isFinite(tip.x) ? tip.x : raft.x, ty = tip && Number.isFinite(tip.y) ? tip.y : 1.8, tz = tip && Number.isFinite(tip.z) ? tip.z : raft.z;
      fv.object3d.position.set(tx, ty - fv.length * 0.55, tz);
      fv.object3d.rotation.set(-Math.PI / 2 + Math.sin(t * 3) * 0.1, Math.sin(t * 0.8) * 0.6, 0, 'YXZ');
      fishUpd(fv, realDt, t, 0.4, 0.4 + Math.max(0, Math.sin(t * 2)) * 0.4);
    }
  }

  // ---------------------------------------------------------------- spots
  function spotRange() {
    const P = BAL('spots');
    return phaseNow() === 'gloomtide' ? (P.gloomCount || [1, 2]) : (P.calmCount || [2, 4]);
  }
  function pickDesired() { const r = spotRange(); S.spotDesired = Math.round(U(num(r[0], 2), num(r[1], 4))); }
  function freeSlot() {
    for (let i = 0; i < SPOT_SLOTS; i++) if (!api.spots.some((s) => s.slot === i)) return i;
    return -1;
  }
  function spawnSpot({ rare = null, untilDusk = false } = {}) {
    const slot = freeSlot();
    if (slot < 0 || !isReal(ctx.world)) return null;
    const P = BAL('spots');
    const raft = raftPos();
    let pos = null;
    for (let tries = 0; tries < 6; tries++) {
      let p = null;
      try {
        p = ctx.world.randomWaterPoint?.({ from: raft, minDist: num(P.minDist, 10), maxDist: num(P.maxDist, 45), depthMin: num(P.depthMin, 0.2), clearance: 3 });
      } catch (e) { report(e); }
      if (!p || p.isStub || !Number.isFinite(p.x)) continue;
      const clash = api.spots.some((s) => Math.hypot(s.position.x - p.x, s.position.z - p.z) < 9);
      const lg = legendInfo();
      const nearLegend = lg && Math.hypot(lg.x - p.x, lg.z - p.z) < lg.r + 3;
      pos = new THREE.Vector3(p.x, 0, p.z);
      if (!clash && !nearLegend) break;
    }
    if (!pos) return null;
    const isRare = rare === null ? Math.random() < num(P.rareChance, 0.15) : !!rare;
    const ttl = untilDusk ? Infinity : U(num(P.ttl?.[0], 45), num(P.ttl?.[1], 75));
    const s = { id: ++S.spotSeq, position: pos, radius: num(P.radius, 2.6), strength: 0, ttl, maxTtl: ttl, rare: isRare, age: 0, slot, untilDusk, depleted: false, rippleT: Math.random() * 2 };
    api.spots.push(s);
    return s;
  }
  function addSpots(n = 2, opts = {}) {
    if (!playing()) return 0;
    if (opts.source === 'tide_chart' && S.clock - S.tideAt < 1) return 0;
    if (opts.source === 'tide_chart') S.tideAt = S.clock;
    let k = 0;
    for (let i = 0; i < n; i++) if (spawnSpot({ rare: opts.rare ?? true, untilDusk: opts.untilDusk ?? true })) k++;
    return k;
  }
  function clearSpots() { api.spots.length = 0; S.spotTimers.length = 0; fx.clearSlots(); }
  function seedSpots() {
    clearSpots();
    pickDesired();
    for (let i = 0; i < S.spotDesired; i++) { const s = spawnSpot(); if (s) s.age = -i * 0.4; }
  }

  function updateSpots(dt) {
    const phase = phaseNow();
    if (phase !== S.lastPhase) {
      const prev = S.lastPhase;
      S.lastPhase = phase;
      if (prev) {
        pickDesired();
        // dusk ends the Tide Chart spots; the gloomtide thins the rest
        for (const s of api.spots) if (s.untilDusk && phase !== 'calm') { s.untilDusk = false; s.ttl = Math.min(s.ttl, 5); }
        const normal = api.spots.filter((s) => !s.untilDusk && s.ttl > 5);
        for (let i = S.spotDesired; i < normal.length; i++) normal[i].ttl = Math.min(normal[i].ttl, 5);
      }
    }
    for (let i = api.spots.length - 1; i >= 0; i--) {
      const s = api.spots[i];
      s.age += dt;
      if (s.ttl !== Infinity) s.ttl -= dt;
      const fadeIn = clamp(s.age / 1.5, 0, 1), fadeOut = s.ttl === Infinity ? 1 : clamp(s.ttl / 5, 0, 1);
      s.strength = fadeIn * fadeOut;
      if (s.ttl <= 0) {
        api.spots.splice(i, 1);
        fx.clearSlot(s.slot);
        if (!s.untilDusk) S.spotTimers.push(U(num(BAL('spots').respawn?.[0], 8), num(BAL('spots').respawn?.[1], 16)));
        continue;
      }
      // a little real surface disturbance now and then (spots near the player only)
      s.rippleT -= dt;
      if (s.rippleT <= 0) {
        s.rippleT = U(1.6, 3.2);
        if (Math.hypot(s.position.x - V.raft.x, s.position.z - V.raft.z) < 50) call(() => ctx.water?.addRipple?.(s.position.x + U(-1, 1), s.position.z + U(-1, 1), 0.35 * s.strength));
      }
    }
    for (let i = S.spotTimers.length - 1; i >= 0; i--) {
      S.spotTimers[i] -= dt;
      if (S.spotTimers[i] <= 0) {
        S.spotTimers.splice(i, 1);
        if (liveSpots() < S.spotDesired) spawnSpot();
      }
    }
    if (liveSpots() + S.spotTimers.length < S.spotDesired) S.spotTimers.push(U(num(BAL('spots').respawn?.[0], 8), num(BAL('spots').respawn?.[1], 16)) * 0.5);
  }

  function liveSpots() {
    let n = 0;
    for (let i = 0; i < api.spots.length; i++) { const s = api.spots[i]; if (!s.untilDusk && s.ttl > 5) n++; }
    return n;
  }

  function drawSpots() {
    const hiX = state === 'charging' ? V.target.x : NaN, hiZ = state === 'charging' ? V.target.z : NaN;
    for (const s of api.spots) {
      const hi = Number.isFinite(hiX) && Math.hypot(s.position.x - hiX, s.position.z - hiZ) <= s.radius ? 1 : 0;
      fx.setSlot(s.slot, s.position.x, s.position.z, s.strength, s.rare ? 1 : 0, hi, s.radius, s.rare ? 7 : 6);
    }
    // legend pool: always a faint ring of still water; a golden column when it is listening
    const lg = legendInfo();
    if (!lg) { fx.setLegendPool(false); fx.clearSlot(LEGEND_SLOT); legendPoolInfo.active = false; api.legendPool = null; return; }
    const r = run();
    const own = !!lg.baitId && num(r?.bait?.[lg.baitId], 0) > 0;
    const dim = S.clock < S.legendDimUntil;
    const active = own && timeOk(lg.species, phaseNow()) && !dim;
    if (active && S.legendToastDay !== (r?.day ?? 0)) {
      S.legendToastDay = r?.day ?? 0;
      emit('toast', { text: D().TEXT?.legendPoolToast || 'A golden stillness gathers far out…', kind: 'lore' });
    }
    S.legendK = damp(S.legendK, active ? 1 : 0, 1.5, Math.max(ctx.time?.dt || 0.016, 0.001));
    fx.setLegendPool(true, lg.x, lg.z, lg.r, S.legendK, dim ? 0.35 : 1);
    if (S.legendK > 0.01) fx.setSlot(LEGEND_SLOT, lg.x, lg.z, S.legendK, 2, 0, lg.r * 0.8, 13);
    else fx.clearSlot(LEGEND_SLOT);
    legendPoolInfo.position.set(lg.x, 0, lg.z); legendPoolInfo.radius = lg.r; legendPoolInfo.active = active; legendPoolInfo.dim = dim;
    api.legendPool = legendPoolInfo;
  }

  // ---------------------------------------------------------------- per-state updates
  function updateCharging(dt) {
    const C = BAL('cast');
    updateAim(ctx.input?.ndc);
    const slow = raftSpeed() < num(C.maxRaftSpeed, 2);
    if (S.meterT < 0 && slow) S.meterT = S.clock;
    view.anchoring = S.meterT < 0;
    if (S.meterT >= 0) {
      const period = Math.max(0.2, num(C.period, 1.6));
      const ph = ((S.clock - S.meterT) % period) / period;
      S.charge = ph < 0.5 ? 2 * ph : 2 - 2 * ph;
    } else S.charge = 0;
    const castMax = stat('castMax', 16);
    const minD = num(C.minDist, 3);
    const want = Math.max(minD, S.charge * castMax);
    const d = resolveTarget(want);
    S.blocked = !d;
    if (!d) { const raft = raftPos(); V.target.set(raft.x + V.aimDir.x * want, 0, raft.z + V.aimDir.z * want); }
    S.castDist = d || want;
    S.band = bandOf(depthAt(V.target.x, V.target.z));
    view.charge = S.charge; view.castDist = S.castDist; view.aim = S.aimYaw;
    view.hint = view.anchoring ? 'anchoring' : S.band;
    aCall('setAim', S.aimYaw);
    aCall('setCharge', S.charge);
    // visuals
    const raft = raftPos();
    const clean = S.charge >= num(C.cleanAt, 0.92) ? 1 : 0;
    const key = view.anchoring ? 'anchoring' : S.blocked ? 'blocked' : S.band;
    const size = (1.05 + 0.045 * S.castDist) / 0.74;
    fx.setReticle(true, V.target.x, V.target.z, size, key, clean, view.anchoring ? 0.55 : 1, S.clock * 0.6);
    fx.setRange(true, raft.x, raft.z, castMax, V.aimDir.x, V.aimDir.z, 0.55);
    let tip = null;
    try { tip = ctx.actors?.getRodTip?.(); } catch { /* optional */ }
    if (!(tip && Number.isFinite(tip.x))) tip = V.tip.set(raft.x, 1.8, raft.z);
    const col = key === 'mid' ? 0xffc27a : key === 'deep' ? 0xb48cff : key === 'blocked' ? 0xff7a6a : key === 'anchoring' ? 0x8e96a4 : 0xa8c8f0;
    fx.setArc(!view.anchoring, tip, V.target.x, V.target.z, num(C.arcHeight, 0.25) * S.castDist, col, 0.75);
  }

  function updateCasting(dt) {
    S.flightT += dt;
    const u = clamp(S.flightT / S.flightDur, 0, 1);
    V.bob.set(lerp(V.from.x, V.to.x, u), lerp(V.from.y, 0, u) + 4 * S.arcH * u * (1 - u), lerp(V.from.z, V.to.z, u));
    aBob(true, V.bob, 'flying');
    aLine(true, V.bob, 0.1, 0.15);
    aCall('setAim', S.aimYaw);
    if (u >= 1) land();
  }

  function lineBroken() {
    const raft = raftPos();
    let x = raft.x, z = raft.z;
    // Still / Lantern: distance that combat added (knockback, shoves, pulls: raft motion with no paddling) never breaks the line
    if (hookSafe()) { x -= S.extShift.x; z -= S.extShift.z; }
    return Math.hypot(V.bob.x - x, V.bob.z - z) > S.castDist + num(BAL('cast').lineBreakDist, 4);
  }

  function updateWaiting(dt) {
    const Bt = BAL('bite');
    if (lineBroken()) { cancel('moved'); return; }
    // nibble / feint / tell events
    let bobState = 'floating';
    S.dipT -= dt;
    const ev = S.events[S.evIdx];
    if (ev && S.stateT >= ev.t) {
      S.evIdx++;
      const x = V.bob.x, z = V.bob.z;
      if (ev.type === 'feint') {
        S.dipKind = 'feint'; S.dipT = 0.32;
        const grey = S.tells >= 2;
        view.tell = grey ? 'grey' : null;
        fx.pulse(x, z, { color: grey ? 0x6a7276 : 0xe9e2cf, r0: 0.2, r1: 1.4, duration: 0.6, alpha: grey ? 0.8 : 0.7 });
        call(() => ctx.water?.addRipple?.(x, z, 0.6));
        emit('fishing:nibble', { feint: true });
      } else if (ev.type === 'tell') {
        S.dipKind = 'tell'; S.dipT = 0.56;   // gold double-dip
        view.tell = 'gold';
        fx.pulse(x, z, { color: 0xffd27a, r0: 0.15, r1: 0.9, duration: 0.45, alpha: 1 });
        fx.pulse(x, z, { color: 0xffd27a, r0: 0.15, r1: 1.3, duration: 0.7, alpha: 0.8 });
        emit('fishing:nibble', { tell: true });
      } else {
        S.dipKind = 'nibble'; S.dipT = num(Bt.nibbleDur, 0.22);
        view.tell = null;
        fx.pulse(x, z, { color: 0xe9e2cf, r0: 0.15, r1: 0.8, duration: 0.45, alpha: 0.55 });
        emit('fishing:nibble', {});
      }
    }
    let dip = 0;
    if (S.dipT > 0) {
      bobState = 'nibble';
      if (S.dipKind === 'tell') { const k = S.dipT; dip = (k > 0.34 || (k < 0.22 && k > 0)) ? num(Bt.nibbleDip, 0.06) : 0; if (k > 0.22 && k <= 0.34) bobState = 'floating'; }
      else dip = S.dipKind === 'feint' ? num(Bt.feintDip, 0.12) : num(Bt.nibbleDip, 0.06);
    } else view.tell = null;
    // v3: the class's bite tell plays over the last moments before the bite
    let slide = 0;
    if (spV3(S.species)) {
      if (!S.zRolled && S.stateT >= S.waitDur - TELL_LEAD) beginTell();
      if (S.tell && S.stateT >= S.tellStart) {
        const span = Math.max(1e-3, S.waitDur - S.tellStart);
        const tp = tellPose(clamp((S.stateT - S.tellStart) / span, 0, 1));
        dip = tp.dip; bobState = tp.state; slide = tp.slide;
      }
    }
    let ox = 0, oz = 0;
    if (slide && S.tell === 'flatSlide') { ox = S.tellDir.x * slide; oz = S.tellDir.z * slide; }   // slides sideways
    else if (slide && S.tell === 'dragUnder') {                                                    // dragged away from the raft
      const dx = V.bob.x - V.raft.x, dz = V.bob.z - V.raft.z, l = Math.hypot(dx, dz) || 1;
      ox = (dx / l) * slide; oz = (dz / l) * slide;
    }
    const h = waterH(V.bob.x, V.bob.z);
    V.tmp.set(V.bob.x + ox, h - dip, V.bob.z + oz);
    aBob(true, V.tmp, bobState);
    aLine(true, V.tmp, 0.05, 0.7);
    aCall('setAim', Math.atan2(-(V.bob.x - V.raft.x), -(V.bob.z - V.raft.z)));
    if (S.stateT >= S.waitDur) {
      if (slide && (S.tell === 'flatSlide' || S.tell === 'dragUnder')) V.bob.set(V.tmp.x, 0, V.tmp.z);   // the bite happens where the tell left the float
      bite();
    }
  }

  function updateBite(dt) {
    if (lineBroken()) { cancel('moved'); return; }
    view.biteWindow = clamp(1 - S.stateT / S.window, 0, 1);
    const h = waterH(V.bob.x, V.bob.z);
    V.tmp.set(V.bob.x, h - num(BAL('bite').plunge, 0.25), V.bob.z);
    aBob(true, V.tmp, 'bite');
    aLine(true, V.tmp, 0.4, 0.1);
    if (S.stateT > S.window) {
      const passed = spV3(S.species) && !S.hookTried;   // v3: a bite left alone is a choice, not a miss (let it pass)
      if (passed) { const refunded = letItPass(); emit('fishing:miss', { reason: 'passed', refunded, favour: S.letPass?.value ?? 0 }); }
      else emit('fishing:miss', { reason: 'late' });
      call(() => ctx.water?.addRipple?.(V.bob.x, V.bob.z, 0.5));
      toLost(num(BAL('cast').reelInTime, 0.6));
    }
  }

  function updateReeling(dt, t) {
    const reel = S.reel;
    if (!reel) { hardReset(); return; }
    // refresh gear a few times a second (boons/upgrades can change mid-fight)
    S.gearT -= dt;
    if (S.gearT <= 0) {
      S.gearT = 0.5;
      const st = stats();
      reel.setGear({ LS: num(st.lineStrength, 1), RS: num(st.reelSpeed, 1) * (starving() ? 0.75 : 1), sweetZone: num(st.sweetZone, 0.16), slackTime: num(st.slackTime, 1.6),
        absorb: num(st.absorb, NaN), dragAt: num(st.dragAt, NaN), shock: num(st.shock, NaN) });
      if (v3on()) { view.drag = dragName(num(st.dragAt, 0.8)); view.lure = run()?.lure ?? null; }
    }
    // cut line: holding movement for 0.6 s (fallback if player.js doesn't call cancel)
    const mv = ctx.input ? Math.hypot((ctx.input.move?.x || 0) + (ctx.input.joy?.x || 0), (ctx.input.move?.y || 0) + (ctx.input.joy?.y || 0)) : 0;
    S.moveHold = mv > 0.1 ? S.moveHold + dt : 0;
    if (S.moveHold >= 0.6) { escaped('slack', { cut: true }); return; }
    reel.step(dt, S.holding);
    // banner (legendary), scripted summons
    if (S.bannerT >= 0) {
      S.bannerT -= dt;
      if (S.bannerT < 0) {
        const sp = S.species;
        call(() => ctx.ui?.banner?.(sp?.name || '', sp?.epithet || ''));
      }
    }
    for (let i = S.summons.length - 1; i >= 0; i--) {
      const s = S.summons[i];
      if (reel.time >= s.at) { S.summons.splice(i, 1); summon(s); }
    }
    for (let i = S.snags.length - 1; i >= 0; i--) {   // telegraphed snags: the spike lands `lead` s after the warning
      const s = S.snags[i];
      if (reel.time >= s.at) { S.snags.splice(i, 1); reel.spike(s.spike); emit('fishing:snag', { state: 'hit', spike: s.spike }); call(() => ctx.render?.shake?.(0.1, 0.25)); }
    }
    if (reel.done) {
      if (reel.result === 'landed') startLanding();
      else if (reel.result === 'snap') escaped('snap');
      else if (reel.result === 'slack') escaped('slack');
      else if (reel.result === 'thrown') escaped('thrown');     // v3: hook-hold pips ran out
      else if (reel.result === 'spooled') escaped('spooled');   // v3: progress 0 after the drag slipped
      return;
    }
    updateHooked(dt, t);
    // view
    view.tension = reel.T; view.sweetMin = reel.sweetMin; view.sweetMax = reel.sweetMax; view.danger = reel.danger;
    view.progress = reel.P; view.stamina = 1 - reel.P; view.surge = reel.surge; view.surgeWarn = reel.surgeWarn;
    view.surgeKind = reel.surge || reel.surgeWarn > 0 ? reel.surgeKind : null;
    view.decoyMin = reel.decoyMin; view.decoyMax = reel.decoyMax; view.shards = reel.shards; view.bandsHidden = reel.bandsHidden;
    view.phaseName = reel.phaseName; view.enraged = reel.enraged; view.holding = S.holding; view.lightMult = reel.lightMult;
    view.snapAt = reel.snapAt || 1;
    view.hint = S.species?.rarity === 'legendary' ? reel.phaseName : '';
    view.slip = reel.slipped || 0;
    // actors
    const leaping = F.leap;
    if (leaping) V.lineEnd.copy(V.mouth);
    else {
      V.tmp.set(V.raft.x - V.mouth.x, 0, V.raft.z - V.mouth.z);
      const l = V.tmp.length() || 1;
      V.lineEnd.set(V.mouth.x + V.tmp.x / l * 0.15, 0, V.mouth.z + V.tmp.z / l * 0.15);
    }
    bobberPosV.set(V.lineEnd.x, 0, V.lineEnd.z);
    api.bobberPos = bobberPosV;
    const slack = reel.T < 0.15 ? (0.15 - reel.T) / 0.15 : 0;
    aBob(!leaping, bobberPosV, 'hooked');
    aLine(true, V.lineEnd, reel.T, slack);
    aCall('setReel', S.holding ? 0.4 + 0.6 * clamp(reel.T, 0, 1) : 0, clamp(F.lat / 3, -1, 1));
    aCall('setAim', Math.atan2(-(V.fish.x - V.raft.x), -(V.fish.z - V.raft.z)));
    const strain = reel.T > 0.85 || (reel.surge && S.holding);
    if (strain !== S.strainPose) { S.strainPose = strain; call(() => ctx.actors?.setPose?.(strain ? 'strain' : 'reel')); }
  }

  function summon(s) {
    // v3, Still and Lantern: the Lantern-Swallower's Grasping Dark summons no hands; each becomes a telegraphed snag instead
    // (BALANCE.nightModes.legendQuiet: a hand silhouette under the water `lead` s ahead, then +spike tension; DESIGN §25.5.6)
    const LQ = hookSafe() ? BAL('nightModes').legendQuiet?.[S.species?.id] : null;
    if (LQ && typeof LQ === 'object' && LQ.snags) { snag({ lead: num(LQ.lead, 1), spike: num(LQ.spike, 0.2) }); return; }
    // the Pale Leviathan's Grasping Dark: scripted Ringed Grasp hands with full telegraphs
    const pos = raftPos().clone();
    const opts = { force: true, zoneMod: s.zoneMod, scripted: true, source: 'legendary' };
    let ok = false;
    for (const owner of [ctx.combat, ctx.survival]) {
      if (!isReal(owner) || typeof owner.spawnEnemy !== 'function') continue;
      try { const r = owner.spawnEnemy(s.enemy, pos, opts); if (r && !r.isStub) { ok = true; break; } } catch (e) { report(e); }
    }
    if (!ok) call(() => ctx.debug?.spawn?.(s.enemy));
  }

  function updateLost(dt) {
    const k = clamp(S.stateT / Math.max(0.05, S.lostDur), 0, 1);
    if (S.lostLine) {
      let tip = null;
      try { tip = ctx.actors?.getRodTip?.(); } catch { /* optional */ }
      const tx = tip && Number.isFinite(tip.x) ? tip.x : V.raft.x, ty = tip && Number.isFinite(tip.y) ? tip.y : 1.6, tz = tip && Number.isFinite(tip.z) ? tip.z : V.raft.z;
      const e = k * k;
      V.tmp.set(lerp(V.bob.x, tx, e), lerp(0, ty, e * e), lerp(V.bob.z, tz, e));
      const vis = k < 0.97;
      aBob(vis, V.tmp, k < 0.3 ? 'floating' : 'flying');
      aLine(vis, V.tmp, 0.15, 0.3 * (1 - k));
    } else {
      aBob(false);
      aLine(false);
    }
    if (k >= 1) {
      api.bobberPos = null;
      aBob(false);
      aLine(false);
      aCall('setAim', null);
      setState('idle');
    }
  }

  // ---------------------------------------------------------------- debug
  /** forceBite() / forceBite({speciesId, z, place, wait}) (CONTRACT §13.11): the next bite now, optionally of a species, a size
   *  score (used as-is, past every cap) and as if cast inside a place. `wait` (s, or true = 1.5 s) lands the bobber and lets the
   *  short wait and the class's bite tell play out instead of jumping to the bite. */
  function debugForceBite(opts = {}) {
    if (!playing()) return false;
    if (state === 'reeling' || state === 'landing') return false;
    const o = opts && typeof opts === 'object' ? opts : {};
    const fsp = o.speciesId ? speciesById(o.speciesId) : null;
    if (o.speciesId && !fsp) return false;
    if (state === 'bite') {
      if (fsp || o.z != null) {
        if (fsp) S.species = fsp;
        if (spV3(S.species)) { S.forceZ = o.z ?? null; S.zRolled = false; S.tell = null; rollSize(); S.tell = S.species.rarity === 'legendary' ? 'dome' : classOf(S.sizeClass)?.bite || 'plunge'; view.biteTell = S.tell; }
      }
      S.stateT = 0; return true;
    }
    S.forceSpecies = fsp; S.forceZ = o.z ?? null; S.forcePlace = o.place || null;
    if (state === 'idle' || state === 'charging' || state === 'lost') {
      const raft = raftPos();
      if (state !== 'charging') {
        // aim where the camera looks (up-screen), or keep the pointer aim
        V.aimDir.set(0, 0, -1);
        updateAim(ctx.input?.ndc);
      }
      const d = resolveTarget(Math.max(6, stat('castMax', 16) * 0.55));
      if (!d) { V.target.set(raft.x + V.aimDir.x * 4, 0, raft.z + V.aimDir.z * 4); }
      S.aimYaw = Math.atan2(-V.aimDir.x, -V.aimDir.z);
      beginCast(d || 4, 0.6, true);
    } else if (state === 'casting') land();
    if (state === 'waiting') {
      if (fsp && S.species !== fsp) { S.species = fsp; S.zRolled = false; }
      if (o.z != null && spV3(S.species)) { S.forceZ = o.z; S.zRolled = false; }
      S.events.length = 0;
      if (o.wait) { S.waitDur = Math.max(TELL_LEAD + 0.1, o.wait === true ? 1.5 : num(o.wait, 1.5)); S.stateT = 0; }
      else bite();
    }
    S.forceSpecies = null; S.forcePlace = null;
    return o.wait ? state === 'waiting' : state === 'bite';
  }
  function debugInstantCatch(speciesId, opts = {}) {
    if (!playing()) return false;
    let sp = speciesById(speciesId);
    if (!sp) sp = S.species && BUSY.has(state) && state !== 'charging' ? S.species : null;
    if (!sp) sp = rollSpecies(depthAt(raftPos().x, raftPos().z - 8), stat('rarityBonus', 0), equippedBaitId()) || (D().SPECIES || [])[0];
    if (!sp) return false;
    let weight;
    if (spV3(sp)) {   // v3: the size score (forced, the one already rolled, or rolled now at the raft)
      const zf = opts && typeof opts === 'object' ? opts.z : undefined;
      if (zf != null || !(sp === S.species && S.zRolled)) {
        const r0 = raftPos();
        if (!S.cast) S.cast = castInfo(r0.x, r0.z, depthAt(r0.x, r0.z));
        S.forceZ = zf ?? null;
        S.species = sp; rollSize(sp, S.cast);
      }
      weight = S.weight;
    } else weight = sp === S.species ? S.weight : rollWeight(sp, equippedBaitId());
    const quality = state === 'reeling' && S.reel ? computeQuality() : 'normal';
    S.reel = null;
    if (!F.fv || S.species !== sp) {
      S.species = sp; S.weight = weight;
      if (!F.fv) { V.lineDir.copy(V.aimDir); V.bob.copy(raftPos()).addScaledVector(V.aimDir, 3); spawnHooked(sp); }
    }
    V.fish.copy(V.raft).addScaledVector(V.lineDir, 1.6);
    caught({ species: sp, weight, quality });
    return true;
  }
  function debugHook(speciesId, opts = {}) {
    if (!playing()) return false;
    const sp = speciesById(speciesId);
    if (!sp) return false;
    if (state === 'reeling' || state === 'landing') hardReset();
    if (state !== 'bite') debugForceBite();
    if (state !== 'bite') return false;
    S.species = sp;
    if (spV3(sp)) { S.forceZ = opts?.z ?? null; S.zRolled = false; rollSize(); } else S.weight = rollWeight(sp, null);
    S.window = 99; S.stateT = 0;
    hook();
    return state === 'reeling';
  }

  // ---------------------------------------------------------------- api
  const api = {
    state: 'idle',
    view,
    bobberPos: null,
    spots: [],
    legendPool: null,
    get lightMult() { return state === 'reeling' && S.reel ? S.reel.lightMult : 1; },
    onPointerDown() { try { onPointerDown(); } catch (e) { report(e); } },
    onPointerMove(ndc) { try { onPointerMove(ndc); } catch (e) { report(e); } },
    onPointerUp() { try { onPointerUp(); } catch (e) { report(e); } },
    cancel(reason) { try { cancel(reason); } catch (e) { report(e); } },
    isBusy() { return BUSY.has(state); },
    slam() { try { slam(); } catch (e) { report(e); } },
    addSpots(n, opts) { try { return addSpots(n, opts || {}); } catch (e) { report(e); return 0; } },
    // v3 (CONTRACT §13.7)
    isHooked() { return state === 'reeling' || state === 'landing'; },
    snag(opts) { try { return snag(opts || {}); } catch (e) { report(e); return false; } },
    lineBroken() { try { return (state === 'casting' || state === 'waiting' || state === 'bite') && lineBroken(); } catch (e) { report(e); return false; } },
    /** z for a species at favour μ: z ~ N(μ, 1) truncated to the cap (species / place maxClass, a top Trophy outside giant water). */
    rollSize(species, mu = 0, { place = null, maxClass = null, giant = false } = {}) {
      try {
        const sp = typeof species === 'string' ? speciesById(species) : species;
        const SZ = BAL('size');
        if (!sp || !SZ.z) return null;
        let cap = capZ({ species: sp, place, giantWater: giant, size: SZ });
        if (maxClass && SZ.classMaxZ?.[maxClass] != null) cap = Math.min(cap, SZ.classMaxZ[maxClass]);
        return rollZ(num(mu, 0), rnd, { min: num(SZ.z.min, -2), max: num(SZ.z.max, 3.6), sd: num(SZ.z.sd, 1), cap });
      } catch (e) { report(e); return null; }
    },
    /** favourAt({x, z}, species?) -> {mu, terms}: with a species its full μ, without it the float's μ (CONTRACT §13.7). */
    favourAt(point, species = null) {
      try {
        if (!v3on() || !point || !Number.isFinite(point.x)) return null;
        const info = castInfo(point.x, point.z, depthAt(point.x, point.z));
        const sp = typeof species === 'string' ? speciesById(species) : species;
        const f = favourAt(info, sp || null);
        return { mu: round2(f.mu), terms: f.terms };
      } catch (e) { report(e); return null; }
    },

    init() {
      if (ctx.render?.scene && !ctx.render.isStub) ctx.render.scene.add(fx.group);
      const bus = ctx.bus;
      if (bus) {
        bus.on('zone:change', () => { hardReset(); clearSpots(); S.lastPhase = ''; S.legendDimUntil = -1; S.zonePending = 0.35; });
        bus.on('run:start', () => { hardReset(); clearSpots(); S.lastPhase = ''; S.legendDimUntil = -1; S.legendToastDay = -1; S.zonePending = 0.35; S.pressure = {}; S.letPass = null; });
        bus.on('phase:change', ({ phase } = {}) => { if (phase === 'dawn') S.pressure = {}; });   // v3: pressure resets at dawn
        bus.on('run:end', () => { hardReset(); clearSpots(); });
        bus.on('player:died', () => hardReset());
        bus.on('flow:change', ({ flow } = {}) => { if (flow !== 'playing') { hardReset(); if (flow === 'title') clearSpots(); } });
        // the Tide Chart's spots arrive through fishing.addSpots(), which progression calls on purchase
        bus.on('player:damage', ({ source } = {}) => { if (typeof source === 'string' && /hand|grasp|slam/i.test(source)) slam(); });
        bus.on('fish:action', () => { if (S.catchFv) S.catchT = Math.max(S.catchT, 90 - 0.6); });
        bus.on('ui:modal', ({ open } = {}) => { if (open === false && S.catchFv && S.catchT > 0.3) releaseCatch(); });
      }
      try {
        const z = zoneData();
        fx.setZoneColor(z?.palette?.glow ?? 0xa9b9f0);
      } catch { /* optional */ }
      Object.assign(ctx.debug || (ctx.debug = {}), {
        forceBite: (opts) => { try { return debugForceBite(opts); } catch (e) { report(e); return false; } },
        instantCatch: (id, opts) => { try { return debugInstantCatch(id, opts); } catch (e) { report(e); return false; } },
        fishHook: (id, opts) => { try { return debugHook(id, opts); } catch (e) { report(e); return false; } },
        // v3 (CONTRACT §13.11)
        setFavour: (mu = null) => { S.favourOverride = Number.isFinite(mu) ? mu : null; if (S.cast) refreshFloat(); return S.favourOverride; },
        fishSeed: (seed = null) => { S.rng = Number.isFinite(seed) ? mulberry32(seed | 0) : null; return !!S.rng; },
        fishPressure: () => ({ ...S.pressure }),
        fishReel: () => S.reel,   // the live reel (tests drive pips / drag through it)
        fishSurge: () => { if (S.reel) { S.reel.forceSurge(); return true; } return false; },
        fishSpot: (rare = false) => { try { const s = spawnSpot({ rare }); return s ? { x: s.position.x, z: s.position.z } : null; } catch (e) { report(e); return null; } },
        fishing: () => ({ state, species: S.species?.id || null, weight: S.weight, depth: S.depth, wait: S.waitDur, events: S.events.map((e) => e.type), spot: !!S.spot, legend: S.legendCast,
          reel: S.reel ? { T: S.reel.T, P: S.reel.P, phase: S.reel.phaseName, surge: S.reel.surge, kind: S.reel.surgeKind, pips: S.reel.pips, slipped: S.reel.slipped, trick: S.reel.trick, trickDone: S.reel.trickDone, mode: S.reel.surgeMode, stamina: S.reel.stamina, power: S.reel.species?.power } : null,
          spots: api.spots.length, quality: S.quality, q: S.qScore,
          // v3
          z: S.z, sizeClass: S.sizeClass, ancient: S.ancient, length: S.lengthCm ? Math.round(S.lengthCm * 10) / 10 : null, mu: S.mu, terms: S.favourTerms, tell: S.tell,
          place: S.cast?.place?.id || null, giant: !!S.cast?.giant, pressureKey: S.cast?.pressureKey || null, letPass: S.letPass ? { ...S.letPass } : null,
          extShift: { x: S.extShift.x, z: S.extShift.z }, hookSafe: hookSafe(), nightMode: nightMode(), v3: v3on() }),
      });
    },

    update(dt, t) {
      const realDt = ctx.time?.dt || 0;
      fx.update(realDt, t);
      updateCatch(realDt, t);
      if (!playing()) {
        if (state !== 'idle' || api.bobberPos) hardReset(false);
        if (api.spots.length && ctx.flow !== 'playing') { /* keep spots while paused/dead overlay */ }
        if (S.flee) updateFlee(realDt, t);
        drawSpotsSafe();
        return;
      }
      if (dt > 0) {
        S.clock += dt;
        S.stateT += dt;
      }
      raftPos();
      // raft motion with no paddling (knockback, shoves, pulls) since the cast: lineBroken() ignores it in Still / Lantern
      if (S.lastRaftOk && (state === 'casting' || state === 'waiting' || state === 'bite') && !moveInput()) {
        S.extShift.x += V.raft.x - S.lastRaft.x; S.extShift.z += V.raft.z - S.lastRaft.z;
      }
      S.lastRaft.copy(V.raft); S.lastRaftOk = true;
      if (S.cast && dt > 0 && (state === 'waiting' || state === 'bite')) {   // the float's favour follows the hour, signs and pressure
        S.floatT -= dt;
        if (S.floatT <= 0) { S.floatT = 0.5; try { refreshFloat(); } catch (e) { report(e); } }
      }
      // zone settle: (re)seed spots once the world has rebuilt
      if (S.zonePending > 0 && dt > 0) {
        S.zonePending -= dt;
        if (S.zonePending <= 0) {
          S.zonePending = 0;
          try { fx.setZoneColor(zoneData()?.palette?.glow ?? 0xa9b9f0); } catch { /* optional */ }
          seedSpots();
          S.lastPhase = phaseNow();
        }
      }
      if (dt > 0) {
        try { updateSpots(dt); } catch (e) { report(e); }
        try {
          switch (state) {
            case 'charging': updateCharging(dt); break;
            case 'casting': updateCasting(dt); break;
            case 'waiting': updateWaiting(dt); break;
            case 'bite': updateBite(dt); break;
            case 'reeling': updateReeling(dt, t); break;
            case 'landing': updateLanding(dt, t); break;
            case 'lost': updateLost(dt); break;
            default: break;
          }
        } catch (e) { report(e); hardReset(); }
        if (S.flee) updateFlee(dt, t);
      }
      if (state !== 'charging') { fx.setReticle(false); fx.setRange(false); fx.setArc(false); }
      if (state !== 'reeling' && state !== 'landing' && !S.flee) fx.setShadow(false);
      if (state === 'idle') view.hint = '';
      drawSpotsSafe();
    },
  };
  function drawSpotsSafe() { try { if (playing() || ctx.flow === 'dead') drawSpots(); else { fx.clearSlots(); fx.setLegendPool(false); } } catch (e) { report(e); } }
  S.zonePending = 0;
  return api;
}
