// progression.js — GLOOMWATER economy & meta (CONTRACT §7 progression; DESIGN §9, §11–§17).
//
// Owns: getStats (base + Wick + gear + relics + stat boons + journal perks + Heartwax +
// Mercy, clamped), run creation, fish valuation, the creel and catch actions, the journal,
// the Descent Gate & travel, Old Murk and his shop & Ledger (progression-market.js), the
// Trials / unlocks / Wicks / Relics / Waystones (progression-challenges.js), run summaries
// and Memories. Pure logic: everything visible goes out through the bus (toast, events)
// and the contract APIs of world / actors / ui.
import { uid, clamp } from './core.js';
import { createChallenges } from './progression-challenges.js';
import { createMarket } from './progression-market.js';

const QUALITY_RANK = { normal: 0, fine: 1, perfect: 2 };
const BAIT_PREFERENCE = ['mireworm', 'lumen_moss', 'spore_cake', 'ember_roe', 'glass_larva', 'shimmerfly'];
const DAMAGE_TIPS = {
  darkness: 'Render a fish the moment your lantern gutters. Burn (R) works without opening the creel.',
  starvation: 'Eat a common fish each calm; a full belly also mends an extra Ember at dawn.',
  wisp: 'Brighter Wick and the Salt-Glass Lens widen your light, so fewer reach the raft.',
  mite: 'They come in packs. Keep the raft moving and let your light thin them out.',
  moth: 'Moths drink your light. Zap them off the lantern before the dark leaks in.',
  eel: 'An eel bunches up before it leaps. Zap it in the air for double damage.',
  hand: 'Sail off the ink stain, or flare the hand as it breaches to stagger it.',
  warden: 'Wardens telegraph every blow. Kite them, and keep your light wide.',
  gloom: 'Brighter Wick and the Salt-Glass Lens widen your light, so fewer gloomlings reach the raft.',
};

export function create(ctx) {
  const D = () => ctx.data || {};
  const meta = () => ctx.state.meta;
  const run = () => ctx.state.run;
  const BAL = (k) => D().BALANCE?.[k] || {};
  const real = (v) => (v && !v.isStub ? v : null);
  const report = (where, err) => { console.error(`[progression] ${where}`, err); ctx.errors?.push?.(`progression.${where}: ${err?.message || err}`); };

  // ------------------------------------------------------------------ lookups
  const lookup = (map, arr, id) => (id == null ? null : D()[map]?.[id] || (D()[arr] || []).find((x) => x.id === id) || null);
  const species = (id) => lookup('SPECIES_BY_ID', 'SPECIES', id);
  const zone = (id) => lookup('ZONE_BY_ID', 'ZONES', id);
  const upgrade = (id) => lookup('UPGRADE_BY_ID', 'UPGRADES', id);
  const relic = (id) => lookup('RELIC_BY_ID', 'RELICS', id);
  const bait = (id) => lookup('BAIT_BY_ID', 'BAITS', id);
  const supply = (id) => lookup('SUPPLY_BY_ID', 'SUPPLIES', id);
  const boon = (id) => lookup('BOON_BY_ID', 'BOONS', id);
  const character = (id) => lookup('CHARACTER_BY_ID', 'CHARACTERS', id);
  const enemyDef = (id) => lookup('ENEMY_BY_ID', 'ENEMIES', id);
  const zoneIndexOf = (id) => { const z = zone(id); return z ? (z.index ?? (D().ZONES || []).indexOf(z)) : 0; };
  const zoneByIndex = (i) => (D().ZONES || []).find((z) => (z.index ?? -1) === i) || (D().ZONES || [])[i] || null;
  const legendaryOfZone = (zid) => D().LEGENDARY_BY_ZONE?.[zid] || zone(zid)?.legendary
    || (D().SPECIES || []).find((s) => s.zone === zid && s.rarity === 'legendary')?.id || null;
  const legendaryOfBait = (bid) => (D().SPECIES || []).find((s) => s.rarity === 'legendary' && s.bait === bid)?.id || null;

  // ------------------------------------------------------------------ small helpers
  const toast = (text, kind = 'info') => { if (text) ctx.bus.emit('toast', { text, kind }); };
  const fmtKg = (kg) => { const v = Number(kg) || 0; return (v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : Math.round(v).toString()) + ' kg'; };
  const qualityLabel = (q) => D().QUALITY?.[q]?.label || 'Common';
  const round2 = (v) => Math.round(v * 100) / 100;
  let saveQueued = false;
  function requestSave() {
    if (saveQueued) return;
    saveQueued = true;
    Promise.resolve().then(() => { saveQueued = false; try { ctx.game?.save?.(); } catch (e) { report('save', e); } });
  }

  function phaseInfo() {
    const r = run();
    const pi = real(ctx.survival?.getPhaseInfo?.());
    if (pi && typeof pi.phase === 'string') return pi;
    const phase = r?.phase || 'calm';
    const duration = BAL('phases')?.[phase] || 60;
    const time = r?.phaseTime || 0;
    return { phase, day: r?.day || 1, time, duration, k: Math.min(1, time / duration), isNight: phase === 'gloomtide' };
  }
  /** Gloomtides since the Wick entered this lake, counting tonight (1-based). */
  function nightInZone(r = run()) {
    if (!r) return 1;
    return Math.max(1, (r.day || 1) - (r.flags?.zoneEnteredDay || 1) + 1);
  }
  function isBossNight(r = run()) {
    const every = BAL('combat')?.director?.bossEvery ?? 3;
    return !!zone(r?.zone)?.warden && nightInZone(r) % every === 0;
  }

  // ------------------------------------------------------------------ stats (CONTRACT §7, DESIGN §23.1)
  let statsVersion = 0;
  const cache = { run: undefined, frame: -1, version: -1, out: {} };
  function invalidate() { statsVersion++; }
  function computeStats(out, r) {
    const STATS = D().STATS || {};
    const m = meta() || {};
    for (const k in STATS) out[k] = STATS[k].base ?? 0;
    const add = (effects, lvl) => {
      if (!effects || !lvl) return;
      for (const k in effects) { const v = effects[k]; if (typeof v === 'number' && k in out) out[k] += v * lvl; }
    };
    if (r) {
      add(character(r.character)?.effects, 1);
      const ups = r.upgrades || {};
      for (const id in ups) add(upgrade(id)?.effects, ups[id] | 0);
      const bn = r.boons || {};
      for (const id in bn) { const b = boon(id); if (b?.effects) add(b.effects, Math.min(bn[id] | 0, b.maxLevel ?? 99)); }
      const f = r.flags || {};
      if (f.heartwax && 'maxHp' in out) out.maxHp += f.heartwax;
      if (f.mercy && 'rarityBonus' in out) out.rarityBonus += f.mercy;
    }
    const rel = m.relics || {};
    for (const id in rel) add(relic(id)?.effects, rel[id] | 0);
    const perks = D().JOURNAL_PERKS || {};
    const un = m.unlocks || {};
    for (const z in perks) if (un[`perk:${z}`]) add(perks[z].effects, 1);
    for (const k in STATS) {
      const s = STATS[k];
      let v = Math.round(out[k] * 1e6) / 1e6;
      if (s.min != null && v < s.min) v = s.min;
      if (s.max != null && v > s.max) v = s.max;
      out[k] = v;
    }
    return out;
  }
  /** Cached once per frame for the live run (invalidated on every change we make or hear of). */
  function getStats(r = run()) {
    if (r === run()) {
      const frame = ctx.time?.frame ?? 0;
      if (cache.run === r && cache.frame === frame && cache.version === statsVersion) return cache.out;
      computeStats(cache.out, r);
      cache.run = r; cache.frame = frame; cache.version = statsVersion;
      return cache.out;
    }
    return computeStats({}, r);
  }

  function effectText(effects) {
    if (!effects) return '';
    const STATS = D().STATS || {};
    const bits = [];
    for (const k in effects) {
      const v = effects[k];
      if (typeof v !== 'number' || !STATS[k]) continue;
      const s = STATS[k];
      const sign = v > 0 ? '+' : '−';
      const a = Math.abs(v);
      let txt;
      switch (s.fmt) {
        case 'pct': txt = `${sign}${round2(a * 100)}%`; break;
        case 'x': txt = `${sign}${round2(a * 100)}%`; break;
        case 'm': txt = `${sign}${round2(a)} m`; break;
        case 's': txt = `${sign}${round2(a)} s`; break;
        default: txt = `${sign}${round2(a)}`;
      }
      bits.push(`${txt} ${s.label}`);
    }
    return bits.join(' · ');
  }
  function baitBonusText(b) {
    if (!b) return '';
    if (b.legend) return 'Legend bait · spent only when the legend is hooked';
    const bonus = { ...(b.bonus || {}) };
    const extra = [];
    if (bonus.weightBias) extra.push(`+${Math.round(bonus.weightBias * 100)}% heavier fish`);
    if (bonus.shimmer) extra.push(`+${Math.round(bonus.shimmer * 100)}% shimmer`);
    if (bonus.gloomDraw) extra.push('draws the Gloom');
    delete bonus.attract; delete bonus.weightBias; delete bonus.shimmer; delete bonus.gloomDraw;
    return [effectText(bonus), ...extra].filter(Boolean).join(' · ');
  }

  // ------------------------------------------------------------------ shared internals for helpers
  const S = {
    ctx, real, report, toast, requestSave, invalidate, phaseInfo, isBossNight, nightInZone,
    species, zone, upgrade, relic, bait, supply, boon, character, zoneIndexOf, legendaryOfZone, legendaryOfBait,
    fmtKg, qualityLabel, effectText, baitBonusText,
    stats: () => getStats(),
    isUnlocked: (key) => challenges.isUnlocked(key),
    addShells: (n, source) => addShells(n, source),
    spendShells: (n, source) => spendShells(n, source),
    addMemories: (n, source) => addMemories(n, source),
    sellValue: (fish) => sellValue(fish),
    fishAction: (f, a) => fishAction(f, a),
    equipBait: (id, o) => equipBait(id, o),
    syncRaftLevel: () => syncRaftLevel(),
    runSlain: () => runSlain(),
  };
  const challenges = createChallenges(S);
  const market = createMarket(S);

  // ------------------------------------------------------------------ currencies
  function addShells(n, source = 'misc') {
    const r = run();
    n = Math.round(Number(n) || 0);
    if (!r || !n) return r?.shells || 0;
    if (n < 0) return spendShells(-n, source);
    r.shells = (r.shells || 0) + n;
    r.stats = r.stats || {};
    r.stats.shellsEarned = (r.stats.shellsEarned || 0) + n;
    ctx.bus.emit('shells:change', { shells: r.shells, delta: n, source });
    challenges.evaluate(['shells']);
    return r.shells;
  }
  function spendShells(n, source = 'spend') {
    const r = run();
    n = Math.round(Number(n) || 0);
    if (!r || n <= 0) return r?.shells || 0;
    r.shells = Math.max(0, (r.shells || 0) - n);
    ctx.bus.emit('shells:change', { shells: r.shells, delta: -n, source });
    return r.shells;
  }
  function addMemories(n, source = 'misc') {
    const m = meta();
    n = Math.round(Number(n) || 0);
    if (!m || !n) return m?.memories || 0;
    m.memories = Math.max(0, (m.memories || 0) + n);
    if (n > 0) m.memoriesEarnedTotal = (m.memoriesEarnedTotal || 0) + n;
    ctx.bus.emit('memories:change', { memories: m.memories, delta: n, source });
    return m.memories;
  }

  // ------------------------------------------------------------------ runs
  function freshRunStats() {
    return { fishCaught: 0, fishLost: 0, perfectHooks: 0, enemiesSlain: 0, elitesSlain: 0, bossesSlain: 0, shellsEarned: 0,
      biggest: null, newSpecies: 0, damageTaken: 0, nightsSurvived: 0, nightsNoDamage: 0, maxLevel: 1 };
  }
  function characterUsable(id) {
    const c = character(id);
    return !!c && (!c.unlock || challenges.isUnlocked(`character:${c.id}`));
  }
  function createRun({ startZone = 'mossmere', character: charId = null } = {}) {
    const data = D();
    const zones = data.ZONES || [];
    const econ = BAL('economy');
    const chars = data.CHARACTERS || [];
    const cid = characterUsable(charId) ? charId : (chars.find((c) => !c.unlock)?.id || chars[0]?.id || null);
    const ch = character(cid);
    const waystones = challenges.getWaystones();
    const zid = zone(startZone) && waystones.includes(startZone) ? startZone : (zones[0]?.id || 'mossmere');
    const zi = zoneIndexOf(zid);
    const kitLevel = challenges.specialSum('startKit');

    let shells = (econ.startShells ?? 20) + challenges.specialSum('startShells') + (ch?.startKit?.shells || 0);
    if (zi > 0) shells += econ.waystonePurse?.[zid] || 0;
    const baitBag = {};
    const addBait = (id, n) => { if (bait(id) && n > 0) baitBag[id] = (baitBag[id] || 0) + n; };
    for (const [id, n] of Object.entries(ch?.startKit?.bait || {})) addBait(id, n);
    if (kitLevel >= 1) { addBait('mireworm', 8); addBait('lumen_moss', 3); }
    if (kitLevel >= 2) { const lb = species(legendaryOfZone(zid))?.bait; if (lb) addBait(lb, 1); }

    const r = {
      active: true, id: uid('run'), seed: (Math.random() * 1e9) | 0, playTime: 0, character: cid,
      day: 1, phase: 'calm', phaseTime: 0, hp: 5, oil: 100, satiety: 100,
      zone: zid, zonesUnlocked: zones.filter((z) => (z.index ?? zones.indexOf(z)) <= zi).map((z) => z.id), gateOpen: false,
      shells, bait: baitBag, equippedBait: null, creel: [], upgrades: {}, legendaries: {}, bounties: [],
      level: 1, xp: 0, xpNext: data.xpForLevel?.(1) ?? 5, boons: {}, rerollsUsed: 0,
      stats: freshRunStats(),
      flags: {
        zoneEnteredDay: 1, streak: 0, mercy: 0, heartwax: 0, wounded: {},
        nights: 0, nightActive: false, nightSlain: 0, maxNightSlain: 0, nightCatch: 0, maxNightCatch: 0,
        nightDamaged: false, nightFlares: 0, perfectHooks: 0, bestStreak: 0, slain: 0, elites: 0, bosses: 0, landed: 0,
        deepestEndured: -1, bountiesDone: 0, bountyMemories: 0, challengesDone: [], records: [], ch: {},
        startDeepest: meta()?.deepestZone || 0,
      },
    };
    if (ch?.startBoon) r.boons[ch.startBoon] = 1;
    if (zi > 0) {
      r.flags.waystoneStart = zid;
      r.flags.bankedLevels = econ.waystoneLevels?.[zid] || 0;
    }
    r.equippedBait = firstGeneralBait(r);
    const st = computeStats({}, r);
    r.hp = st.maxHp ?? 5; r.oil = st.maxOil ?? 100; r.satiety = st.maxSatiety ?? 100;
    return r;
  }

  // ------------------------------------------------------------------ fish & creel (DESIGN §9)
  function makeFish(speciesId, weight, quality = 'normal') {
    const sp = species(speciesId);
    const econ = BAL('economy');
    const Qs = D().QUALITY || {};
    const Q = Qs[quality] || Qs.normal || { id: 'normal', valueMult: 1, yieldMult: 1 };
    const [wMin, wMax] = sp?.weight || [1, 1];
    let w = Number(weight);
    if (!(w > 0)) w = (wMin + wMax) / 2;
    const t = wMax > wMin ? clamp((w - wMin) / (wMax - wMin), 0, 1) : 0.5;
    const sk = econ.sizeK || [0.75, 1.25];
    const sizeK = sk[0] + (sk[1] - sk[0]) * t;
    const st = econ.streak || {};
    const streak = Math.min(run()?.flags?.streak || 0, st.maxSteps ?? 5);
    const value = Math.max(1, Math.round((sp?.value ?? 5) * sizeK * (Q.valueMult ?? 1) * (1 + (st.perStep ?? 0.1) * streak)));
    const food = Math.max(1, Math.round((sp?.food ?? 10) * sizeK * (Q.yieldMult ?? 1)));
    const oil = Math.max(1, Math.round((sp?.oil ?? 10) * sizeK * (Q.yieldMult ?? 1)));
    return {
      uid: uid('fish'), speciesId, weight: w < 1 ? Math.round(w * 1000) / 1000 : round2(w), quality: Q.id || quality,
      value, food, oil, caughtDay: run()?.day ?? 1,
      rarity: sp?.rarity || 'common', legendary: sp?.rarity === 'legendary', zone: sp?.zone || null,
    };
  }
  const sellValue = (fish) => Math.max(1, Math.round((fish?.value || 0) * (getStats().sellMult ?? 1)));
  /** What each catch action would yield right now (for the catch card / creel UI). */
  function fishYield(fishOrUid) {
    const fish = resolveFish(fishOrUid)?.fish;
    if (!fish) return null;
    const st = getStats();
    const M = BAL('economy').mercy || {};
    return {
      shells: sellValue(fish), satiety: Math.round(fish.food * (st.foodMult ?? 1)), oil: Math.round(fish.oil * (st.oilYieldMult ?? 1)),
      mercy: M.perRelease ?? 0.02, canSell: market.canTrade(),
    };
  }

  const pending = new Map();        // landed fish awaiting a catch-card decision: uid -> {fish, t}
  /** Mirror undecided catches into the saved run so a reload with the catch card open keeps them. */
  function syncPending() {
    const r = run();
    if (!r?.flags) return;
    if (pending.size) r.flags.pendingCatch = [...pending.values()].map((p) => p.fish);
    else if (r.flags.pendingCatch) delete r.flags.pendingCatch;
  }
  /** On Continue: catches that were still on the card when the page closed go into the creel. */
  function restorePending() {
    const r = run();
    const list = Array.isArray(r?.flags?.pendingCatch) ? r.flags.pendingCatch : [];
    delete r?.flags?.pendingCatch;
    for (const fish of list) {
      if (!fish?.uid || (r.creel || []).some((f) => f.uid === fish.uid)) continue;
      const name = species(fish.speciesId)?.name || 'fish';
      if (addToCreel(fish)) toast(`The ${name} you landed waits in your creel.`, 'info');
      else toast(`${D().TEXT?.creelFull || 'Your creel is full.'} The ${name} slips back into the water.`, 'bad');
    }
  }
  const gone = new Set();           // uids eaten / rendered / sold / released / stolen (never act on them twice)
  function creelSize() { return Math.max(0, getStats().creelSize | 0); }
  function addToCreel(fish) {
    const r = run();
    if (!r || !fish) return false;
    r.creel = r.creel || [];
    if (r.creel.some((f) => f.uid === fish.uid)) return true;
    if (r.creel.length >= creelSize()) return false;
    r.creel.push(fish);
    pending.delete(fish.uid);
    gone.delete(fish.uid);           // e.g. a stolen fish recovered from its thief
    return true;
  }
  function removeFromCreel(fishUid) {
    const r = run();
    if (!r?.creel?.length) return null;
    let i;
    if (fishUid) i = r.creel.findIndex((f) => f.uid === fishUid);
    else {
      const proof = BAL('economy').legendTheftProof ?? true;
      const idx = [];
      r.creel.forEach((f, k) => { if (!proof || species(f.speciesId)?.rarity !== 'legendary') idx.push(k); });
      if (!idx.length) return null;
      i = idx[(Math.random() * idx.length) | 0];
    }
    const out = i >= 0 ? r.creel.splice(i, 1)[0] : null;
    if (out) gone.add(out.uid);
    return out;
  }
  function resolveFish(fishOrUid) {
    const r = run();
    if (!r || fishOrUid == null) return null;
    const id = typeof fishOrUid === 'object' ? fishOrUid.uid : fishOrUid;
    const inCreel = r.creel?.find((f) => f.uid === id);
    if (inCreel) return { fish: inCreel, inCreel: true };
    if (pending.has(id)) return { fish: pending.get(id).fish, inCreel: false };
    if (typeof fishOrUid === 'object' && fishOrUid.speciesId && !gone.has(id)) return { fish: fishOrUid, inCreel: false };
    return null;
  }

  function fishAction(fishOrUid, action) {
    const r = run();
    if (!r) return { ok: false, msg: 'There is no descent under way.', gained: {} };
    const res = resolveFish(fishOrUid);
    if (!res) return { ok: false, msg: 'That fish is gone.', gained: {} };
    const { fish, inCreel } = res;
    const sp = species(fish.speciesId);
    const st = getStats();
    const act = action === 'burn' ? 'render' : action;
    const done = (gained, msg) => {
      if (act !== 'keep' && inCreel) removeFromCreel(fish.uid);
      if (act !== 'keep') gone.add(fish.uid);
      pending.delete(fish.uid);
      ctx.bus.emit('fish:action', { action: act, fish, gained });
      return { ok: true, msg, gained };
    };
    switch (act) {
      case 'keep': {
        if (inCreel) return { ok: true, msg: 'Already in the creel.', gained: {} };
        if (!addToCreel(fish)) return { ok: false, full: true, msg: D().TEXT?.creelFull || 'Your creel is full.', gained: {} };
        return done({}, `${sp?.name || 'The fish'} goes into the creel.`);
      }
      case 'eat': {
        const satiety = Math.max(1, Math.round(fish.food * (st.foodMult ?? 1)));
        ctx.survival?.addSatiety?.(satiety);
        floatAtRaft(`+${satiety} Satiety`, 'satiety');
        return done({ satiety }, `+${satiety} satiety`);
      }
      case 'render': {
        const oil = Math.max(1, Math.round(fish.oil * (st.oilYieldMult ?? 1)));
        ctx.survival?.addOil?.(oil);
        floatAtRaft(`+${oil} Oil`, 'oil');
        return done({ oil }, `+${oil} oil`);
      }
      case 'sell': {
        if (!market.canTrade()) return { ok: false, msg: 'Only Old Murk buys fish, and only while he is moored.', gained: {} };
        const shells = sellValue(fish);
        if (inCreel) removeFromCreel(fish.uid);
        gone.add(fish.uid);
        pending.delete(fish.uid);
        addShells(shells, 'sell');
        market.noteSale();
        ctx.bus.emit('fish:action', { action: 'sell', fish, gained: { shells } });
        return { ok: true, msg: `+${shells} Shells`, gained: { shells } };
      }
      case 'release': {
        const M = BAL('economy').mercy || {};
        const before = r.flags.mercy || 0;
        r.flags.mercy = Math.min(M.cap ?? 0.1, before + (M.perRelease ?? 0.02));
        const luck = round2(r.flags.mercy - before);
        invalidate();
        return done({ luck }, luck > 0 ? 'The water remembers your mercy.' : 'It slips away. Your luck is already as kind as it gets today.');
      }
      default:
        return { ok: false, msg: `Unknown action "${action}".`, gained: {} };
    }
  }
  /** Burn-a-fish (DESIGN §8.6): the lowest-value non-legendary fish in the creel. */
  function getBurnCandidate() {
    const r = run();
    let best = null;
    for (const f of r?.creel || []) {
      if (species(f.speciesId)?.rarity === 'legendary') continue;
      if (!best || f.value < best.value || (f.value === best.value && f.oil > best.oil)) best = f;
    }
    return best;
  }
  function burnFish() {
    const f = getBurnCandidate();
    return f ? fishAction(f.uid, 'render') : { ok: false, msg: 'Nothing in the creel to burn.', gained: {} };
  }
  function getMerchantLine(kind = 'browse') {
    const l = D().MERCHANT_LINES?.[kind] || [];
    return l.length ? l[(Math.random() * l.length) | 0] : '';
  }
  function floatAtRaft(text, css) {
    const p = ctx.player?.position;
    if (!p || typeof p.x !== 'number' || !ctx.THREE) return;
    try { ctx.ui?.floatText?.(new ctx.THREE.Vector3(p.x, 2.6, p.z), text, css); } catch { /* optional */ }
  }

  // ------------------------------------------------------------------ bait
  function firstGeneralBait(r) {
    const bag = r?.bait || {};
    for (const id of BAIT_PREFERENCE) if ((bag[id] | 0) > 0 && !bait(id)?.legend) return id;
    for (const id in bag) if ((bag[id] | 0) > 0 && !bait(id)?.legend) return id;
    return null;
  }
  function equipBait(id, { quiet = false } = {}) {
    const r = run();
    if (!r) return { ok: false, msg: 'There is no descent under way.' };
    if (!id || id === 'none') {
      r.equippedBait = null;
      if (!quiet) ctx.bus.emit('bait:change', { baitId: null });
      return { ok: true, msg: 'A bare hook.' };
    }
    const b = bait(id);
    if (!b) return { ok: false, msg: 'No such bait.' };
    if ((r.bait?.[id] | 0) <= 0) return { ok: false, msg: `You have no ${b.name}.` };
    if (b.legend && r.equippedBait && !bait(r.equippedBait)?.legend) r.flags.prevBait = r.equippedBait;
    r.equippedBait = id;
    ctx.bus.emit('bait:change', { baitId: id });
    return { ok: true, msg: `${b.name} on the hook.` };
  }
  /** HUD helper: cycle bare hook → owned baits. Returns the new bait id (or null). */
  function cycleBait() {
    const r = run();
    if (!r) return null;
    const owned = (D().BAITS || []).filter((b) => (r.bait?.[b.id] | 0) > 0).map((b) => b.id);
    const order = [...owned, null];
    const i = order.indexOf(r.equippedBait ?? null);
    const next = order[(i + 1) % order.length] ?? null;
    equipBait(next);
    return next;
  }
  let baitView = { key: '', obj: null };
  function getEquippedBait() {
    const r = run();
    const id = r?.equippedBait;
    const n = id ? r.bait?.[id] | 0 : 0;
    const b = id ? bait(id) : null;
    if (!b || n <= 0) return null;
    const key = `${id}:${n}`;
    if (baitView.key !== key) {
      // a bait record that also behaves like its id (`${bait}`, BAIT_BY_ID[bait], bait == 'mireworm')
      baitView = { key, obj: { ...b, count: n, toString() { return id; }, valueOf() { return id; } } };
    }
    return baitView.obj;
  }
  function afterBaitSpent(id) {
    const r = run();
    if ((r.bait?.[id] | 0) > 0) return;
    if (r.bait) delete r.bait[id];
    if (r.equippedBait !== id) return;
    const prev = r.flags.prevBait;
    r.equippedBait = prev && (r.bait?.[prev] | 0) > 0 ? prev : firstGeneralBait(r);
    r.flags.prevBait = null;
    ctx.bus.emit('bait:change', { baitId: r.equippedBait });
    const b = bait(id);
    if (b && !b.legend) toast(`Out of ${b.name}.${r.equippedBait ? ` ${bait(r.equippedBait)?.name} on the hook.` : ' A bare hook it is.'}`, 'info');
  }
  /** Called by fishing once per cast. Legend baits are spent only when their legend is hooked. */
  function consumeBait() {
    const r = run();
    if (!r) return null;
    const id = r.equippedBait;
    if (!id) return null;
    const b = bait(id);
    const n = r.bait?.[id] | 0;
    if (!b || n <= 0) { afterBaitSpent(id); return null; }
    if (b.legend) return id;
    r.bait[id] = n - 1;
    afterBaitSpent(id);
    return id;
  }

  // ------------------------------------------------------------------ landing a fish (fishing:caught)
  let lastCast = { depth: null, inSpot: false };
  function castInfoAt(pos) {
    if (!pos || typeof pos.x !== 'number') return { depth: null, inSpot: false };
    let depth = null;
    try { const d = ctx.world?.getDepth?.(pos.x, pos.z); if (typeof d === 'number') depth = d; } catch { /* optional */ }
    let inSpot = false;
    const R = BAL('spots').radius ?? 2.6;
    for (const s of ctx.fishing?.spots || []) {
      const sp = s?.position;
      if (sp && typeof sp.x === 'number' && Math.hypot(sp.x - pos.x, sp.z - pos.z) <= (s.radius || R)) { inSpot = true; break; }
    }
    return { depth, inSpot };
  }

  function landFish(e = {}) {
    const r = run();
    if (!r || r.active === false) return null;
    const sp = species(e.speciesId);
    if (!sp) return null;
    const m = meta();
    const fish = makeFish(sp.id, e.weight, e.quality || 'normal');
    const f = r.flags;

    // journal (meta.journal) ------------------------------------------------
    m.journal = m.journal || {};
    const prev = m.journal[sp.id];
    const isNew = !(prev?.caught > 0);
    const isRecord = !isNew && fish.weight > (prev.biggest || 0);
    const entry = prev || { caught: 0, biggest: 0, firstDay: r.day, firstRun: m.runs || 1 };
    entry.caught = (entry.caught || 0) + 1;
    entry.biggest = Math.max(entry.biggest || 0, fish.weight);
    if (isNew) { entry.firstDay = r.day; entry.firstRun = m.runs || 1; }
    m.journal[sp.id] = entry;
    if (isRecord) f.records.push({ speciesId: sp.id, weight: fish.weight, prev: prev.biggest || 0 });

    // counters ---------------------------------------------------------------
    r.stats.fishCaught = (r.stats.fishCaught || 0) + 1;
    f.landed = (f.landed | 0) + 1;
    if (!r.stats.biggest || fish.weight > (r.stats.biggest.weight || 0)) r.stats.biggest = { speciesId: sp.id, weight: fish.weight };
    m.totalFish = (m.totalFish || 0) + 1;
    const pi = phaseInfo();
    if (pi.phase === 'gloomtide') { f.nightCatch = (f.nightCatch | 0) + 1; f.maxNightCatch = Math.max(f.maxNightCatch | 0, f.nightCatch); }
    if (sp.rarity === 'legendary') r.legendaries[sp.id] = true;

    // first catch rewards (DESIGN §16) ----------------------------------------
    const econ = BAL('economy');
    const J = BAL('journal');
    let firstShells = 0;
    if (isNew) {
      r.stats.newSpecies = (r.stats.newSpecies || 0) + 1;
      if (sp.rarity !== 'legendary' || econ.newSpeciesLegendary !== false) firstShells = Math.round((econ.newSpeciesShells ?? 1.5) * (sp.value || 0));
      if (firstShells > 0) addShells(firstShells, 'journal');
    }
    // XP: fish cinders (DESIGN §10.1) -----------------------------------------
    const quirkMult = character(r.character)?.quirk?.fishXpMult ?? 1;
    const xp = Math.max(1, Math.round((D().fishXpFor?.(sp.rarity, zoneIndexOf(sp.zone)) ?? 3) * (getStats().xpMult ?? 1) * quirkMult));

    // the catch card (then the cinders, so a level-up picker queues behind it) ----
    pending.set(fish.uid, { fish, t: 0 });
    syncPending();
    ctx.bus.emit('fish:landed', { fish, isNew, isRecord, species: sp, firstShells, xp, mastered: entry.caught === (J.masteryAt ?? 10) });
    try { ctx.combat?.addXp?.(xp); } catch (err) { report('combat.addXp', err); }

    // aftermath: journal milestones, bounties, trials, gate, victory ------------
    if (isNew) {
      ctx.bus.emit('journal:new', { speciesId: sp.id });
      const mem = J.newSpeciesMemories ?? 3;
      toast(`New in the Journal: ${sp.name}${firstShells ? ` · +${firstShells} Shells` : ''} · +${mem} Memories`, 'good');
      journalMilestones(sp.zone);
    }
    if (entry.caught === (J.masteryAt ?? 10)) {
      addMemories(J.masteryMemories ?? 2, 'mastery');
      toast(`${sp.name}: the Journal page is inked in gold · +${J.masteryMemories ?? 2} Memories`, 'good');
    }
    if (sp.rarity === 'legendary' && market.isPresent()) {
      const l = D().MERCHANT_LINES?.legendary || [];
      if (l.length) toast(`Old Murk: "${l[(Math.random() * l.length) | 0]}"`, 'lore');
    }
    const cast = e.depth != null || e.spot != null || e.inSpot != null
      ? { depth: e.depth ?? lastCast.depth, inSpot: !!(e.inSpot ?? e.spot ?? lastCast.inSpot) } : lastCast;
    market.bountyEvent('fish', { fish, species: sp, depth: cast.depth, inSpot: cast.inSpot });
    challenges.hooks.fish(fish, sp);
    evaluateGate();
    if (sp.final && !f.victory && (!sp.zone || sp.zone === r.zone)) {   // only in its own (final) lake
      f.victory = true;
      f.firstVictory = !m.victory;
      requestSave();
      challenges.hooks.victory();
      ctx.bus.emit('victory', { speciesId: sp.id });
    }
    return fish;
  }

  function journalMilestones(zoneId) {
    const m = meta();
    const all = (D().SPECIES || []).filter((s) => s.zone === zoneId);
    const have = all.filter((s) => (m.journal?.[s.id]?.caught || 0) > 0).length;
    const J = BAL('journal');
    const z = zone(zoneId);
    if (have === (J.halfZone ?? 4) && all.length > have) {
      addMemories(J.halfZoneMemories ?? 10, 'journal');
      toast(`Half of ${z?.name || 'this lake'} is named · +${J.halfZoneMemories ?? 10} Memories`, 'good');
    }
    if (all.length && have === all.length) {
      const key = `perk:${zoneId}`;
      const perk = D().JOURNAL_PERKS?.[zoneId];
      m.unlocks = m.unlocks || {};
      if (perk && !m.unlocks[key]) {
        m.unlocks[key] = true;
        invalidate();
        ctx.bus.emit('unlock', { key, label: perk.label, kind: 'perk', text: `Journal perk: ${perk.label}` });
        toast(`Every fish of ${z?.name || 'this lake'} is named. ${perk.label}: ${perk.desc}`, 'good');
        requestSave();
      }
    }
  }

  // ------------------------------------------------------------------ zones & the Descent Gate (DESIGN §14)
  const nextZoneOf = (zid) => zoneByIndex(zoneIndexOf(zid) + 1);
  function requirementDone(req, r) {
    switch (req?.type) {
      case 'legendary': return !!r.legendaries?.[req.id];
      case 'species': return (meta()?.journal?.[req.id]?.caught || 0) > 0;
      case 'shells': return (r.shells || 0) >= (req.n || 0);
      case 'day': return (r.day || 1) >= (req.n || 0);
      case 'level': return (r.level || 1) >= (req.n || 0);
      default: return false;
    }
  }
  function gateRequirements(r = run()) {
    const nz = r ? nextZoneOf(r.zone) : null;
    if (!nz) return [];
    return (nz.unlock?.requires || []).map((q) => ({
      label: q.label || (q.type === 'legendary' ? `Land ${species(q.id)?.name || q.id}` : String(q.type)),
      done: requirementDone(q, r), type: q.type, id: q.id,
    }));
  }
  let gateSynced = null;   // last state pushed to world ('sealed'|'open'|'hidden') for the current zone
  function syncGateVisual(instant) {
    const r = run();
    if (!r) return;
    const state = !nextZoneOf(r.zone) ? 'hidden' : r.gateOpen ? 'open' : 'sealed';
    if (gateSynced === state && !instant) return;
    gateSynced = state;
    try { ctx.world?.setGateState?.(state, !!instant); } catch (err) { report('world.setGateState', err); }
  }
  function openGate({ forced = false } = {}) {
    const r = run();
    const nz = r ? nextZoneOf(r.zone) : null;
    if (!r || !nz || r.gateOpen) return false;
    r.gateOpen = true;
    if (forced) r.flags.gateForced = r.zone;
    syncGateVisual(false);
    ctx.bus.emit('gate:open', { zone: nz.id, from: r.zone });
    const toll = nz.unlock?.shells || 0;
    toast(`${D().TEXT?.gateOpenToast || 'The Descent Gate churns open.'}${toll ? ` Its toll: ${toll} Shells.` : ''}`, 'good');
    requestSave();
    return true;
  }
  function evaluateGate() {
    const r = run();
    if (!r || r.active === false) return;
    if (r.gateOpen) return;
    const reqs = gateRequirements(r);
    if (!nextZoneOf(r.zone)) return;
    if (reqs.every((q) => q.done)) openGate();
  }
  function getGateInfo() {
    const r = run();
    const nz = r ? nextZoneOf(r.zone) : null;
    const requirements = gateRequirements(r);
    const toll = nz?.unlock?.shells || 0;
    const phase = phaseInfo().phase;
    const phaseOk = (BAL('travel').phases || ['calm', 'dawn']).includes(phase);
    const tollPaid = !!nz && (r?.zonesUnlocked || []).includes(nz.id);
    const cost = tollPaid ? 0 : toll;
    const canAfford = (r?.shells || 0) >= cost;
    let reason = '';
    if (!r) reason = 'There is no descent under way.';
    else if (!nz) reason = 'There is no deeper water. Only the Well.';
    else if (!r.gateOpen) reason = (D().TEXT?.gateSealed || 'The Gate is sealed. {requirement}').replace('{requirement}', requirements.find((q) => !q.done)?.label || '');
    else if (!phaseOk) reason = 'The Gate sleeps through the dusk and the Gloomtide.';
    else if (!canAfford) reason = `The toll is ${cost} Shells. You are ${cost - (r.shells || 0)} short.`;
    return {
      open: !!r?.gateOpen, nextZone: nz, nextZoneId: nz?.id || null, zone: r?.zone || null, requirements, toll: cost,
      canAfford, phaseOk, canDescend: !!r && !!nz && !!r.gateOpen && phaseOk && canAfford, reason,
      prompt: nz ? (D().TEXT?.descendPrompt || 'Feed the whirlpool {toll} Shells and sink to {zone}?').replace('{toll}', cost).replace('{zone}', nz.name) : '',
      heatWarning: nz ? `The Gloom grows: +${BAL('combat')?.director?.heatPerZone ?? 3} Heat.` : '',
      gate: real(ctx.world?.getGate?.()) || null,
    };
  }
  function getZones() {
    const r = run();
    const m = meta() || {};
    const curIdx = r ? zoneIndexOf(r.zone) : -1;
    const info = getGateInfo();
    return (D().ZONES || []).map((z) => {
      const i = z.index ?? 0;
      const unlocked = r ? (r.zonesUnlocked || []).includes(z.id) : i <= (m.deepestZone || 0);
      const current = !!r && z.id === r.zone;
      const isNext = !!r && i === curIdx + 1;
      let reason = '';
      if (!r) reason = unlocked ? 'Reached before' : 'Not yet reached';
      else if (current) reason = 'You are here';
      else if (i < curIdx) reason = 'The current only runs down';
      else if (isNext) reason = info.canDescend ? `Toll: ${info.toll} Shells` : info.reason;
      else reason = 'Beyond the next gate';
      return { ...z, unlocked, current, canTravel: isNext && info.canDescend, reason, toll: z.unlock?.shells || 0, visited: unlocked };
    });
  }
  function travel(target) {
    const r = run();
    if (!r) return { ok: false, msg: 'There is no descent under way.' };
    const zid = typeof target === 'object' && target ? target.id : target;
    const nz = zone(zid);
    if (!nz) return { ok: false, msg: 'No such water.' };
    const curIdx = zoneIndexOf(r.zone);
    const idx = zoneIndexOf(nz.id);
    if (nz.id === r.zone) return { ok: false, msg: 'You are already here.' };
    if (idx !== curIdx + 1) return { ok: false, msg: idx < curIdx ? 'The current only runs down.' : 'One gate at a time.' };
    const info = getGateInfo();
    if (!r.gateOpen) return { ok: false, msg: info.reason };
    if (!info.phaseOk) return { ok: false, msg: info.reason };
    if (!info.canAfford) return { ok: false, msg: info.reason };
    if (info.toll > 0) spendShells(info.toll, 'toll');
    const prev = r.zone;
    const firstVisit = !(r.zonesUnlocked || []).includes(nz.id);
    if (firstVisit) {
      r.zonesUnlocked = [...(r.zonesUnlocked || []), nz.id];
      ctx.bus.emit('zone:unlock', { zone: nz.id });
    }
    r.zone = nz.id;
    r.gateOpen = false;
    r.flags.gateForced = null;
    r.flags.zoneEnteredDay = phaseInfo().phase === 'dawn' ? (r.day || 1) + 1 : (r.day || 1);
    const m = meta();
    if (idx > (m.deepestZone || 0)) { m.deepestZone = idx; r.flags.deepestRecord = idx; }
    market.dropZoneBounties(prev);
    gateSynced = null;
    ctx.bus.emit('zone:change', { zone: nz.id, prev });
    market.followDescent();
    return { ok: true, msg: `You sink toward ${nz.name}.`, toll: info.toll, zone: nz.id };
  }

  // ------------------------------------------------------------------ journal / bounties / misc getters
  function journalHint(sp) {
    if (sp.hint) return sp.hint;
    const bits = [];
    if (sp.time === 'gloom') bits.push('Rises only in the Gloomtide');
    else if (sp.time === 'calm') bits.push('Rises only in the calm');
    const [a = 0, b = 1] = sp.depth || [];
    bits.push(a >= 0.55 ? 'deep water' : b <= 0.6 ? 'shallow water' : 'open water');
    if (sp.bait) bits.push(`answers ${bait(sp.bait)?.name || sp.bait}`);
    return bits.join(' · ');
  }
  function getJournal() {
    const j = meta()?.journal || {};
    const masteryAt = BAL('journal').masteryAt ?? 10;
    return (D().SPECIES || []).map((sp) => {
      const e = j[sp.id];
      const discovered = (e?.caught || 0) > 0;
      return {
        species: sp, id: sp.id, zone: sp.zone, rarity: sp.rarity, discovered,
        caught: e?.caught || 0, biggest: e?.biggest || 0, firstDay: e?.firstDay ?? null, firstRun: e?.firstRun ?? null,
        mastered: (e?.caught || 0) >= masteryAt, hint: discovered ? '' : journalHint(sp),
        name: discovered ? sp.name : '???',
      };
    });
  }
  function getJournalSummary() {
    const j = meta()?.journal || {};
    const un = meta()?.unlocks || {};
    return (D().ZONES || []).map((z) => {
      const all = (D().SPECIES || []).filter((s) => s.zone === z.id);
      const named = all.filter((s) => (j[s.id]?.caught || 0) > 0).length;
      const perk = D().JOURNAL_PERKS?.[z.id] || null;
      return { zone: z.id, name: z.name, named, total: all.length, perk, perkUnlocked: !!un[`perk:${z.id}`] };
    });
  }
  function getTrophies() {
    const un = meta()?.unlocks || {};
    return Object.keys(un).filter((k) => k.startsWith('trophy:') && un[k]).map((k) => k.slice(7));
  }

  // ------------------------------------------------------------------ run summary & Memories (DESIGN §17)
  function runSlain(r = run()) { return Math.max(r?.stats?.enemiesSlain || 0, r?.flags?.slain || 0); }
  function records() {
    const m = meta();
    m.unlocks = m.unlocks || {};
    const rec = m.unlocks.records && typeof m.unlocks.records === 'object' ? m.unlocks.records : {};
    m.unlocks.records = rec;
    return rec;
  }
  let lastSummary = null;
  function summarizeRun(cause = 'unknown') {
    const r = run();
    const m = meta();
    const preview = cause === 'victory-preview';
    if (!r) return lastSummary || { cause, day: 0, zone: null, memories: 0, breakdown: [], records: [], challengesCompleted: [] };
    if (!preview && r.flags?.summarized && lastSummary?.runId === r.id) return lastSummary;
    const data = D();
    const f = r.flags || {};
    const zi = zoneIndexOf(r.zone);
    const econ = BAL('economy');
    if (!preview) challenges.evaluate();
    const legendaries = Object.keys(r.legendaries || {}).filter((k) => r.legendaries[k]);
    const trophySpecies = (r.creel || []).map((fish) => species(fish.speciesId)).filter((s) => s?.rarity === 'legendary');
    const trophies = trophySpecies.map((s) => zoneIndexOf(s.zone));
    const input = {
      day: r.day || 1, zoneIndex: zi, fishCaught: r.stats?.fishCaught || 0, newSpecies: r.stats?.newSpecies || 0,
      legendaries, bountiesDone: f.bountiesDone || 0, enemiesSlain: runSlain(r),
      nightsSurvived: Math.max(f.nights || 0, r.stats?.nightsSurvived || 0),
      deepestEnduredIndex: f.deepestEndured ?? -1,
      elitesSlain: Math.max(r.stats?.elitesSlain || 0, f.elites || 0),
      bossesSlain: Math.max(r.stats?.bossesSlain || 0, f.bosses || 0),
      trophies, memMult: challenges.specialSum('memMult'), victory: !!f.victory, firstVictory: f.firstVictory !== false,
    };
    const mem = data.memoriesFor?.(input) || { total: 0, breakdown: [] };
    let total = mem.total || 0;
    const breakdown = (mem.breakdown || []).map((row) => ({ ...row }));
    const extra = f.bountyMemories || 0;
    if (extra > 0) {
      const lbl = data.TEXT?.memoryLabels?.bounties || 'Bounties honoured';
      const row = breakdown.find((x) => x.label === lbl);
      if (row) row.value += extra; else breakdown.push({ label: lbl, value: extra });
      total += extra;
      if (input.memMult > 0) {
        const add = Math.round(extra * input.memMult);
        const rl = data.TEXT?.memoryLabels?.remembrance || 'Remembrance';
        const rrow = breakdown.find((x) => x.label === rl);
        if (rrow) rrow.value += add;
        total += add;
      }
    }

    // records broken this run (compare against the meta values before banking)
    const rec = records();
    const T = data.TEXT?.records || {};
    const lines = [];
    for (const x of f.records || []) {
      const sp = species(x.speciesId);
      lines.push((T.biggest || 'Biggest catch: {name}, {kg} kg').replace('{name}', sp?.name || x.speciesId).replace('{kg}', fmtKg(x.weight).replace(' kg', '')));
    }
    const beat = (key, value, prevValue, text) => { if (value > (prevValue || 0) && (prevValue || 0) > 0) lines.push(text); if (!preview && value > (rec[key] || 0)) rec[key] = value; };
    beat('bestDay', r.day || 1, Math.max(m.bestDay || 0, rec.bestDay || 0), `Longest descent: Day ${r.day}`);
    if ((f.deepestRecord || 0) > (f.startDeepest || 0)) lines.push((T.deepest || 'Deepest descent: {zone}').replace('{zone}', zone(r.zone)?.name || r.zone));
    if (!preview) rec.deepestZone = Math.max(rec.deepestZone || 0, m.deepestZone || 0);
    beat('mostShells', r.stats?.shellsEarned || 0, rec.mostShells, `Most Shells in a descent: ${r.stats?.shellsEarned || 0}`);
    beat('highestLevel', r.level || 1, Math.max(rec.highestLevel || 0, f.startBestLevel || 0), (T.level || 'Highest flame: level {n}').replace('{n}', r.level || 1));
    beat('mostKillsNight', f.maxNightSlain || 0, rec.mostKillsNight, `Most gloomlings in one night: ${f.maxNightSlain || 0}`);
    beat('longestStreak', f.bestStreak || 0, rec.longestStreak, `Longest perfect-hook streak: ${f.bestStreak || 0}`);

    const summary = {
      runId: r.id, cause, day: r.day || 1, zone: r.zone, zoneName: zone(r.zone)?.name || r.zone, zoneIndex: zi,
      character: r.character, characterName: character(r.character)?.name || '', level: r.level || 1,
      fishCaught: input.fishCaught, shellsEarned: r.stats?.shellsEarned || 0, newSpecies: input.newSpecies,
      enemiesSlain: input.enemiesSlain, elitesSlain: input.elitesSlain, bossesSlain: input.bossesSlain,
      nightsSurvived: input.nightsSurvived, legendaries: legendaries.length, legendaryIds: legendaries,
      bountiesDone: input.bountiesDone, memories: total, breakdown, records: lines,
      challengesCompleted: (f.challengesDone || []).map((id) => challenges.challengeById(id)).filter(Boolean),
      victory: !!f.victory, title: deathTitle(cause), epitaph: epitaph(cause), flavour: flavour(r.day || 1),
      nearMiss: nearMisses(r, total), ...damageReport(r),
      trophies: trophySpecies.map((s) => s.id),
    };

    if (!preview) {
      addMemories(total, 'run');
      summary.memoriesBanked = total;
      summary.memoriesTotal = m.memories || 0;
      m.bestLevel = Math.max(m.bestLevel || 0, r.level || 1);
      m.deepestZone = Math.max(m.deepestZone || 0, zi);
      for (const s of trophySpecies) { m.unlocks = m.unlocks || {}; m.unlocks[`trophy:${s.id}`] = true; }
      f.summarized = true;
      lastSummary = summary;
    }
    return summary;
  }
  function pickText(arr) { return arr?.length ? arr[(Math.random() * arr.length) | 0] : ''; }
  function deathTitle(cause) {
    if (cause === 'victory' || cause === 'victory-preview') return D().TEXT?.victoryTitle || 'The Light Comes Up';
    const t = D().TEXT?.deathTitle || {};
    return t[cause] || t.default || 'Extinguished';
  }
  function epitaph(cause) { const E = D().EPITAPHS || {}; return pickText(E[cause] || E.default); }
  function flavour(day) { return (D().TEXT?.summaryFlavour || []).find((x) => day <= x.maxDay)?.text || ''; }
  function nearMisses(r, earned) {
    const out = [];
    const nz = nextZoneOf(r.zone);
    if (nz) {
      const toll = nz.unlock?.shells || 0;
      if (r.gateOpen && (r.shells || 0) < toll) out.push(`${nz.name} toll: ${toll - (r.shells || 0)} Shells away.`);
      else if (!r.gateOpen) {
        const legendId = legendaryOfZone(r.zone);
        const wound = r.flags?.wounded?.[legendId];
        if (legendId && wound > 0) out.push(`${species(legendId)?.name} slipped away at ${Math.round(Math.min(1, wound / (BAL('legend').woundedCarry ?? 0.5)) * 100)}%.`);
      }
    }
    const memAfter = (meta()?.memories || 0) + earned;
    const relicNext = challenges.getRelics().filter((x) => x.revealed && !x.maxed).sort((a, b) => a.nextCost - b.nextCost)[0];
    if (relicNext) out.push(memAfter >= relicNext.nextCost ? `The Shrine can relight ${relicNext.name} (${relicNext.nextCost} Memories).` : `${relicNext.name}: ${relicNext.nextCost - memAfter} Memories to go.`);
    const lockedWick = challenges.getCharacters().filter((c) => !c.unlocked && c.challenge).sort((a, b) => (b.challenge.progress / b.challenge.target) - (a.challenge.progress / a.challenge.target))[0];
    if (lockedWick) out.push(`${lockedWick.name}: ${lockedWick.challenge.name} ${Math.min(lockedWick.challenge.progress, lockedWick.challenge.target)} / ${lockedWick.challenge.target}.`);
    return out;
  }
  /** Death screen: the top damage source with one actionable tip (DESIGN §6.8). */
  function damageReport(r) {
    const by = r.flags?.damageBy || {};
    const cat = { gloom: 0, darkness: 0, starvation: 0 };
    let topEnemy = null;
    for (const k in by) {
      const c = /dark/.test(k) ? 'darkness' : /starv|hunger/.test(k) ? 'starvation' : 'gloom';
      cat[c] += by[k];
      if (c === 'gloom' && (!topEnemy || by[k] > by[topEnemy])) topEnemy = k;
    }
    const top = Object.keys(cat).reduce((a, b) => (cat[b] > cat[a] ? b : a), 'gloom');
    const n = cat[top];
    if (!n) return { topDamage: null, tip: '' };
    const times = (k) => `${k} time${k === 1 ? '' : 's'}`;
    if (top === 'darkness') return { topDamage: { source: 'darkness', count: n }, tip: `The dark bit you ${times(n)}. ${DAMAGE_TIPS.darkness}` };
    if (top === 'starvation') return { topDamage: { source: 'starvation', count: n }, tip: `Hunger took ${n} Ember${n === 1 ? '' : 's'}. ${DAMAGE_TIPS.starvation}` };
    const def = enemyDef(topEnemy);
    const k = by[topEnemy] || n;
    const who = def ? (def.boss ? def.name : /s$/.test(def.name) ? def.name : `${def.name}s`) : 'Gloomlings';
    return { topDamage: { source: topEnemy || 'gloom', count: k, total: n }, tip: `${who} reached you ${times(k)}. ${DAMAGE_TIPS[def?.model] || DAMAGE_TIPS.gloom}` };
  }

  /** Optional extension for combat: claim a Warden's Heartwax (+1 max Ember for the run).
   *  The caller mends the Ember. Returns true when handled (also when this Warden already
   *  gave its Heartwax this run and BALANCE.heal.heartwaxOnce forbids another). */
  function grantHeartwax(wardenId) {
    const r = run();
    if (!r) return false;
    const f = r.flags;
    const id = wardenId || zone(r.zone)?.warden || 'warden';
    f.heartwaxFrom = f.heartwaxFrom || {};
    const once = BAL('heal').heartwaxOnce ?? true;
    if (once && f.heartwaxFrom[id]) return true;
    f.heartwaxFrom[id] = (f.heartwaxFrom[id] | 0) + 1;
    f.heartwax = (f.heartwax | 0) + 1;
    invalidate();
    requestSave();
    return true;
  }

  // ------------------------------------------------------------------ Second Wick (optional extension, DESIGN §6.7)
  function tryRevive() {
    const r = run();
    if (!r || r.flags.secondWickUsed || challenges.specialSum('secondWick') <= 0) return false;
    r.flags.secondWickUsed = true;      // survival performs the revive (and its toast)
    requestSave();
    return { hp: 1, oil: 40, flare: true, iframes: 2 };
  }

  // ------------------------------------------------------------------ raft cosmetics & character look
  function syncRaftLevel() {
    const r = run();
    if (!r) return;
    let lv = 0;
    for (const id in r.upgrades || {}) if (upgrade(id)?.category === 'raft') lv += r.upgrades[id] | 0;
    try { ctx.actors?.setRaftLevel?.(Math.min(3, Math.floor(lv / 2))); } catch (e) { report('actors.setRaftLevel', e); }
  }
  function syncCharacter(id) {
    const c = character(id);
    if (c) try { ctx.actors?.setCharacter?.(c); } catch (e) { report('actors.setCharacter', e); }
  }

  // ------------------------------------------------------------------ bus wiring
  function onRunStart({ continued } = {}) {
    const r = run();
    pending.clear();
    gone.clear();
    lastCast = { depth: null, inSpot: false };
    lastSummary = null;
    expects.length = 0; extLedger.length = 0;
    seenTotalSlain = meta()?.totalSlain || 0;
    invalidate();
    if (!r) return;
    // saves from older builds may lack fields
    r.flags = r.flags || {};
    for (const [k, v] of Object.entries({ streak: 0, mercy: 0, heartwax: 0, wounded: {}, records: [], challengesDone: [], ch: {}, nights: 0, slain: 0, landed: 0, perfectHooks: 0, bestStreak: 0, deepestEndured: -1, bountiesDone: 0, bountyMemories: 0, zoneEnteredDay: 1 })) {
      if (r.flags[k] == null) r.flags[k] = Array.isArray(v) ? [] : (v && typeof v === 'object' ? {} : v);
    }
    r.stats = Object.assign(freshRunStats(), r.stats || {});
    r.creel = r.creel || []; r.bait = r.bait || {}; r.upgrades = r.upgrades || {}; r.legendaries = r.legendaries || {}; r.bounties = r.bounties || [];
    r.boons = r.boons || {};
    if (!continued) r.flags.startBestLevel = meta()?.bestLevel || 0;
    if (continued) restorePending(); else delete r.flags.pendingCatch;
    market.reset();
    gateSynced = null;
    syncGateVisual(true);
    evaluateGate();
    syncRaftLevel();
    syncCharacter(r.character);
    challenges.hooks.zone(r.zone, r.character);
    market.update();
  }

  function onPhaseChange({ phase } = {}) {
    const r = run();
    if (!r) return;
    const f = r.flags;
    if (phase === 'gloomtide') {
      f.nightActive = true; f.nightSlain = 0; f.nightCatch = 0; f.nightDamaged = false; f.nightFlares = 0;
    } else if (phase === 'dawn' && f.nightActive) {
      f.nightActive = false;
      f.nights = (f.nights | 0) + 1;
      f.deepestEndured = Math.max(f.deepestEndured ?? -1, zoneIndexOf(r.zone));
      f.maxNightSlain = Math.max(f.maxNightSlain | 0, f.nightSlain | 0);
      const day = r.day || 1;
      market.bountyEvent('dawn', { damaged: !!f.nightDamaged, flared: (f.nightFlares | 0) > 0, nightSlain: f.nightSlain | 0 });
      challenges.hooks.dawn({ damaged: !!f.nightDamaged, day });
    }
    if (phase !== 'calm') market.update();
  }

  function onDayStart() {
    const r = run();
    if (!r) return;
    if (r.flags.mercy) { r.flags.mercy = 0; invalidate(); }
    market.expireBounties();
  }

  // Elite / Warden Shells and meta.totalSlain may also be handled by combat (it pays
  // through addShells and counts kills itself). Count and pay exactly once either way:
  // rewards progression expects are only paid if no matching external payment shows up.
  const frameNow = () => ctx.time?.frame ?? 0;
  const extLedger = [];   // recent external addShells payments {n, frame}
  const expects = [];     // rewards we will pay unless someone else does {n, frame, source, pos}
  function noteExternalShells(n) {
    const i = expects.findIndex((e) => Math.abs(e.n - n) <= 1);
    if (i >= 0) { expects.splice(i, 1); return; }
    extLedger.push({ n, frame: frameNow() });
    if (extLedger.length > 8) extLedger.shift();
  }
  function expectReward(n, source, pos) {
    const i = extLedger.findIndex((e) => Math.abs(e.n - n) <= 1 && frameNow() - e.frame <= 1);
    if (i >= 0) { extLedger.splice(i, 1); return; }
    expects.push({ n, frame: frameNow(), source, pos: pos && typeof pos.x === 'number' ? { x: pos.x, y: pos.y || 0, z: pos.z } : null });
  }
  function settleRewards() {
    for (let i = expects.length - 1; i >= 0; i--) {
      const e = expects[i];
      if (frameNow() - e.frame < 2) continue;
      expects.splice(i, 1);
      addShells(e.n, e.source);
      floatAt(e.pos, `+${e.n} Shells`, 'shells');
    }
  }
  let seenTotalSlain = null;
  function countLifetimeKill() {
    const m = meta();
    const total = m.totalSlain || 0;
    if (seenTotalSlain == null || total <= seenTotalSlain) m.totalSlain = total + 1;   // nobody else counted it
    seenTotalSlain = m.totalSlain;
  }

  function onEnemySlain({ enemy } = {}) {
    const r = run();
    if (!r || !enemy) return;
    const f = r.flags;
    f.slain = (f.slain | 0) + 1;
    countLifetimeKill();
    if (phaseInfo().phase === 'gloomtide' || f.nightActive) {
      f.nightSlain = (f.nightSlain | 0) + 1;
      if (f.nightSlain > (f.maxNightSlain | 0)) f.maxNightSlain = f.nightSlain;
      market.bountyEvent('slain', { nightSlain: f.nightSlain });
    }
    if (enemy.elite && !enemy.boss) {
      f.elites = (f.elites | 0) + 1;
      const def = enemyDef(enemy.enemyId || enemy.id);
      const shells = Math.max(1, Math.round((def?.shells ?? 6) * (zone(r.zone)?.valueMult ?? 1)));
      expectReward(shells, 'elite', enemy.position);
      market.bountyEvent('elite', {});
      challenges.hooks.elite();
    }
    challenges.hooks.slain();
  }

  function onBossSlain({ enemy } = {}) {
    const r = run();
    if (!r) return;
    const f = r.flags;
    f.bosses = (f.bosses | 0) + 1;
    const wardenId = enemy?.enemyId || zone(r.zone)?.warden || enemy?.id || 'warden';
    const def = enemyDef(wardenId);
    const shells = def?.shells ?? [40, 80, 140, 220][zoneIndexOf(r.zone)] ?? 40;
    if (shells > 0) expectReward(shells, 'warden', enemy?.position);
    // Heartwax (+1 max Ember for the run, mend 1). Combat normally claims it through
    // grantHeartwax(); if nobody did for this Warden, progression grants it here.
    f.heartwaxFrom = f.heartwaxFrom || {};
    if (!f.heartwaxFrom[wardenId]) {
      const claimedElsewhere = (f.heartwax | 0) > Object.keys(f.heartwaxFrom).length;   // flag bumped directly
      f.heartwaxFrom[wardenId] = 1;
      if (!claimedElsewhere) {
        f.heartwax = (f.heartwax | 0) + 1;
        invalidate();
        ctx.survival?.heal?.(BAL('heal').heartwax ?? 1);
        toast(`Heartwax: ${def?.name || 'the Warden'}'s wax seals around your flame · +1 Ember for this descent`, 'good');
      }
    }
    market.bountyEvent('boss', {});
    challenges.hooks.boss(def ? def.id : wardenId);
    requestSave();
  }
  function floatAt(pos, text, css) {
    if (!pos || typeof pos.x !== 'number' || !ctx.THREE) return;
    try { ctx.ui?.floatText?.(new ctx.THREE.Vector3(pos.x, (pos.y || 0) + 2.2, pos.z), text, css); } catch { /* optional */ }
  }

  function onHook({ speciesId, perfect } = {}) {
    const r = run();
    if (!r) return;
    const f = r.flags;
    if (perfect) {
      f.streak = (f.streak | 0) + 1;
      f.perfectHooks = (f.perfectHooks | 0) + 1;
      f.bestStreak = Math.max(f.bestStreak | 0, f.streak);
    } else f.streak = 0;
    market.bountyEvent('hook', { perfect: !!perfect, streak: f.streak });
    challenges.evaluate(['perfectHooks']);
    // a legend bait is spent the moment its legend is hooked
    const sp = species(speciesId);
    if (sp?.rarity === 'legendary' && sp.bait && (r.bait?.[sp.bait] | 0) > 0) {
      r.bait[sp.bait] -= 1;
      afterBaitSpent(sp.bait);
    }
  }

  function onBoonChosen({ boonId, level } = {}) {
    invalidate();
    const r = run();
    if (!r) return;
    if (level && boonId) challenges.hooks.boon(boonId, level | 0);
    else challenges.evaluate(['boonLevel', 'kindle']);
  }

  function onLevelUp({ level } = {}) {
    const r = run();
    if (!r) return;
    const lv = level || r.level || 1;
    r.flags.maxLevel = Math.max(r.flags.maxLevel | 0, lv);
    const m = meta();
    m.bestLevel = Math.max(m.bestLevel || 0, lv);
    challenges.evaluate(['level']);
  }

  function onZoneChange({ zone: zid, prev } = {}) {
    const r = run();
    if (!r || !zid) return;
    const m = meta();
    const idx = zoneIndexOf(zid);
    if (idx > (m.deepestZone || 0)) { m.deepestZone = idx; r.flags.deepestRecord = idx; }
    gateSynced = null;
    syncGateVisual(true);
    evaluateGate();
    challenges.hooks.zone(zid, r.character);
    if (prev === null) market.reset();     // main's run start / continue: the barge re-moors via update()
  }

  function init() {
    const on = (evt, fn) => ctx.bus.on(evt, (p) => { try { fn(p || {}); } catch (e) { report(`on(${evt})`, e); } });
    on('fishing:caught', landFish);
    on('fishing:land', ({ position }) => { lastCast = castInfoAt(position); });
    on('fishing:hook', onHook);
    on('fishing:miss', ({ reason }) => { const r = run(); if (r && reason !== 'moved') r.flags.streak = 0; });
    on('fishing:escaped', () => { const r = run(); if (r?.stats) r.stats.fishLost = (r.stats.fishLost | 0) + 1; });
    on('enemy:slain', onEnemySlain);
    on('boss:slain', onBossSlain);
    on('player:damage', ({ amount, source }) => {
      const r = run();
      if (!r || !(amount > 0)) return;
      if (r.flags.nightActive || phaseInfo().phase === 'gloomtide') r.flags.nightDamaged = true;
      const by = (r.flags.damageBy = r.flags.damageBy || {});
      const k = String(source || 'gloom');
      by[k] = (by[k] | 0) + 1;
    });
    on('flare', () => { const r = run(); if (r && (r.flags.nightActive || phaseInfo().phase === 'gloomtide')) r.flags.nightFlares = (r.flags.nightFlares | 0) + 1; });
    on('levelup', onLevelUp);
    on('boon:chosen', onBoonChosen);
    on('phase:change', onPhaseChange);
    on('day:start', onDayStart);
    on('zone:change', onZoneChange);
    on('run:start', onRunStart);
    on('run:end', () => { pending.clear(); });
    on('flow:change', ({ flow }) => {
      if (flow === 'title') { market.reset(); pending.clear(); syncCharacter(meta()?.lastCharacter); invalidate(); }
    });
    registerDebug();
    syncCharacter(meta()?.lastCharacter);
  }

  // ------------------------------------------------------------------ per-frame
  let gateTimer = 0;
  const AUTO_KEEP_AFTER = 6;   // s of un-blocked game time with an unanswered catch → keep it (or let it go)
  function update(dt) {
    const r = run();
    if (!r || ctx.flow !== 'playing' || r.active === false) return;
    market.update(dt);
    if (expects.length) settleRewards();
    gateTimer -= dt;
    if (gateTimer <= 0) { gateTimer = 0.5; evaluateGate(); }
    if ((r.flags?.pendingCatch?.length || 0) !== pending.size) syncPending();
    if (pending.size && dt > 0 && ctx.ui?.isBlocking?.() !== true) {
      for (const [id, p] of pending) {
        p.t += dt;
        if (p.t < AUTO_KEEP_AFTER) continue;
        pending.delete(id);
        if (!addToCreel(p.fish)) toast(`${D().TEXT?.creelFull || 'Your creel is full.'} The ${species(p.fish.speciesId)?.name || 'fish'} slips back into the water.`, 'bad');
        else ctx.bus.emit('fish:action', { action: 'keep', fish: p.fish, gained: {}, auto: true });
      }
    }
  }

  // ------------------------------------------------------------------ debug (CONTRACT §11)
  function registerDebug() {
    const dbg = ctx.debug || (ctx.debug = {});
    Object.assign(dbg, {
      addShells(n = 100) { return addShells(n, 'debug'); },
      addMemories(n = 100) { return addMemories(n, 'debug'); },
      unlockZone(id) {
        const z = zone(id);
        if (!z) return false;
        const idx = zoneIndexOf(z.id);
        const r = run();
        if (r) {
          const set = new Set(r.zonesUnlocked || []);
          for (const x of D().ZONES || []) if ((x.index ?? 0) <= idx) set.add(x.id);
          r.zonesUnlocked = [...set];
        }
        const m = meta();
        m.deepestZone = Math.max(m.deepestZone || 0, idx);
        invalidate();
        return true;
      },
      giveFish(id, weight, quality = 'normal') {
        const r = run();
        const sid = species(id) ? id : (D().SPECIES || []).find((s) => s.zone === r?.zone && s.rarity === 'common')?.id || D().SPECIES?.[0]?.id;
        const fish = makeFish(sid, weight, quality);
        return addToCreel(fish) ? fish : null;
      },
      landFish(id, weight, quality = 'normal') { return landFish({ speciesId: id || D().SPECIES?.[0]?.id, weight, quality }); },
      openGate() { return openGate({ forced: true }); },
      completeChallenge(id) { return challenges.complete(id); },
      unlockAll() { for (const c of D().CHALLENGES || []) challenges.complete(c.id, { silent: true }); return true; },
      summonMerchant() { market.arrive(); return true; },
      offerBounties() { return market.offerBounties(); },
      progression: () => ({ stats: { ...getStats() }, run: run(), gate: getGateInfo(), merchant: market.isPresent(), pending: [...pending.keys()] }),
    });
  }

  return {
    init, update,
    getStats, createRun, summarizeRun, makeFish, addToCreel, removeFromCreel, fishAction, fishYield,
    canShop: () => market.canShop(), shop: market.shop,
    getZones, travel, getGateInfo,
    getJournal, getJournalSummary, getBounties: () => market.getBounties(),
    getRelics: () => challenges.getRelics(), buyRelic: (id) => challenges.buyRelic(id),
    getCharacters: () => challenges.getCharacters(), getChallenges: () => challenges.getChallenges(),
    getWaystones: () => challenges.getWaystones(), equipBait, getEquippedBait, consumeBait, cycleBait,
    isUnlocked: (key) => challenges.isUnlocked(key),
    // optional extensions (read with ?.)
    getLockReason: (key) => challenges.getLockReason(key),
    addShells: (n, source = 'external') => { const v = Math.round(Number(n) || 0); if (v > 0) noteExternalShells(v); return addShells(v, source); },
    spendShells, tryRevive, grantHeartwax, getTrophies, getBurnCandidate, burnFish, getMerchantLine, getNightInZone: () => nightInZone(), isBossNight: () => isBossNight(),
    isMerchantPresent: () => market.isPresent(), getPendingCatch: () => [...pending.values()].map((p) => p.fish),
    getBountyLog: () => run()?.flags?.bountyLog || [], getRecords: () => ({ ...(meta()?.unlocks?.records || {}) }),
    invalidateStats: invalidate,
  };
}
