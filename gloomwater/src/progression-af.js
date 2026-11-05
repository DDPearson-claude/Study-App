// progression-af.js — automatic fishing's progression side (DESIGN §25.6, §25.14.2a; CONTRACT §13.2, §13.7, §13.7a).
// Helper of progression.js only (it receives the shared internals object `S`, as progression-market.js does). Every entry
// point is inert unless the build is v3 (data.V3_ENABLED with CATCH_V3 and catchChance): flag off, progression never calls it.
//   Pg13  getLoadout — what catchChance reads for the fish that bit. P1–P2 runs and The Long Descent: hold = data.upgradeHold
//         (every per-run rod, line and reel level counts), the tiers = data.upgradeTiers (words only), item = the ONE bait or run
//         lure on the line AT THE CAST (a swap after the cast changes nothing until the next cast), upgrade = the per-run Glimmer
//         Spoon (never stacks with the item: catchParts takes the larger); P3 expeditions: fitted tiers + the equipped item;
//         run-less (the cove) = T0, no item.
//         getCatchBuffs — the buff context (Well-fed, Boons, owned relics, the Wick's quirk; data.catchBuffHold applies the caps:
//         relics ≤ 3, run buffs ≤ 4, together ≤ 6). getCatchMods — the rest of catchChance's mods for a species (legend wounds and
//         landings, perRun → CATCH_V3.legend.fightRun, the lake, night).
//         The logs (the only place a % is ever shown): getOdds (reference strike, OWNED RELICS IN, no run buffs; "?" until a
//         species is landed or lost), getGearLog (each item's Hold, its emphasis or targets, the compare pinned to the last fish
//         that got away), compareOdds, getTackleRating (catchRating: words, never a %).
//         Legend wounds (meta.legendWounds; run.legendWounds inside The Long Descent) and the got-away side of fish:escaped
//         (F15's progression half): the Glimpsed page, the Got away list, the Elder Log's "still out there", Marked Fish, the pin.
//         The fishing counters (P1–P2: meta.runs ≥ 2 for the hurry, run.outing === 'first' for the strike ring).
//   Pg14  per-run lures: Murk sells every lure at 40% once its lake is lit (AUTOFISH.runLures), kept in run.lures until the run
//         ends; one bait OR one lure on the line (run.equipped); a snapped line never loses it (nothing here ever removes one).
//   S7    Well-fed is +2 Hold, through getCatchBuffs().wellFed (a run buff), never a reel stat.
import { uid } from './core.js';
import { elderName } from './progression-v3.js';

const CLASSES = ['small', 'keeper', 'prize', 'trophy', 'elder', 'ancient'];
const SLOTS = ['rod', 'line', 'reel'];
const LINE_FREE = new Set(['idle', 'charging']);   // fishing states with no line in the water: the cast's item stops counting
const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);

/** The style list a tackle slot counts ×max against (CATCH_V3.emphasis): rod → leapers, line → thrashers / sinkers / sulkers, reel → runners. */
export function slotEmphasis(C, slot) {
  const E = C?.emphasis || {};
  let mult = 1;
  for (const w of Object.values(E)) mult = Math.max(mult, Number(w?.[slot]) || 0);
  const styles = Object.keys(E).filter((s) => (Number(E[s]?.[slot]) || 0) === mult && mult > 1);
  return { mult, styles };
}
/** A got-away length as the note words it (AUTOFISH.gotAway.round: 1 cm under 20 cm, 5 cm under 1 m, 0.1 m above). */
export function approxText(cm, A) {
  const v = Number(cm);
  if (!(v > 0)) return '';
  const steps = A?.gotAway?.round || [[20, 1], [100, 5], [Infinity, 10]];
  const step = (steps.find(([lim]) => v < lim) || steps[steps.length - 1])[1];
  const r = Math.max(step, Math.round(v / step) * step);
  return r < 100 ? `${r} cm` : `${(r / 100).toFixed(1)} m`;
}

export function createAutofish(S) {
  const { ctx } = S;
  const D = () => ctx.data || {};
  const meta = () => ctx.state.meta;
  const run = () => ctx.state.run;
  const C3 = () => D().CATCH_V3 || null;
  const AF = () => D().AUTOFISH || null;
  const on = () => D().V3_ENABLED === true && !!C3() && typeof D().catchChance === 'function';
  const safe = (fn, fb) => { try { const v = fn(); return v === undefined ? fb : v; } catch (e) { S.report('autofish', e); return fb; } };
  const frame = () => ctx.time?.frame ?? 0;

  // ------------------------------------------------------------------ build shape
  /** P3 expeditions exist (persistent fitted tackle). Until P3's createExpedition lands every run uses per-run UPGRADES. */
  const expeditions = () => (D().V3_PHASE ?? 4) >= 3 && typeof S.createExpedition === 'function';
  /** Tiers come from UPGRADES (P1–P2 runs, The Long Descent): legends use CATCH_V3.legend.fightRun (mods.perRun). */
  const perRunOf = (r = run()) => (r ? r.outing === 'descent' || !expeditions() : !expeditions());
  /** Murk sells lures per run at 40% (AUTOFISH.runLures: P1–P2 runs, not The Long Descent). */
  const runLuresOn = (r = run()) => on() && !!r && r.outing !== 'descent' && !expeditions() && (AF()?.runLures?.phases || [1, 2]).includes(D().V3_PHASE);

  let lureMap = null;
  const lure = (id) => {
    if (!lureMap || lureMap.src !== D().LURES) lureMap = { src: D().LURES, by: Object.fromEntries((D().LURES || []).map((l) => [l.id, l])) };
    return id ? lureMap.by[id] || null : null;
  };
  const isLure = (id) => !!lure(id);
  const ownedLure = (id, r = run()) => !!id && (!!r?.lures?.[id] || !!meta()?.lures?.[id]);

  // ------------------------------------------------------------------ the item on the line (Pg14: one bait OR one lure)
  /** The one item on the line now: a lure (run.equipped, owned) or else the bait (run.equippedBait, v1's field, kept for baits). */
  function equippedItem(r = run()) {
    if (!r) return null;
    if (r.equipped && isLure(r.equipped) && ownedLure(r.equipped, r)) return r.equipped;
    return r.equippedBait ?? null;
  }
  /** Keep run.equipped (CONTRACT §13.2) truthful after any bait change made by the v1 paths. */
  function syncEquipped(r = run()) { if (r && on()) r.equipped = equippedItem(r); }
  /** Pg14: put a lure on the line (the bait comes off: one item at a time). null / 'none' takes a lure off. */
  function equipLure(lureId) {
    const r = run();
    if (!r) return { ok: false, msg: 'There is no descent under way.' };
    if (!on()) return { ok: false, msg: 'No lures in this water.' };
    if (!lureId || lureId === 'none') {
      if (isLure(r.equipped)) { r.equipped = r.equippedBait ?? null; ctx.bus.emit('bait:change', { baitId: r.equippedBait ?? null, lureId: null }); }
      return { ok: true, msg: r.equippedBait ? `${S.bait(r.equippedBait)?.name || 'Bait'} on the hook.` : 'A bare hook.' };
    }
    const L = lure(lureId);
    if (!L) return { ok: false, msg: 'No such lure.' };
    if (!ownedLure(lureId, r)) return { ok: false, msg: `You have no ${L.name}.` };
    r.flags = r.flags || {};
    r.flags.prevBait = null;
    r.equippedBait = null;
    r.equipped = lureId;
    ctx.bus.emit('bait:change', { baitId: null, lureId });
    return { ok: true, msg: `${L.name} on the line.` };
  }
  /** The lure on the line (a LURES record plus its Hold entry), or null. */
  function getEquippedLure() {
    const r = run();
    const id = equippedItem(r);
    const L = isLure(id) ? lure(id) : null;
    return L ? { ...L, hold: C3()?.items?.[id]?.hold ?? 0 } : null;
  }

  // the cast snapshot: the item that counts is the one on the line AT THE CAST (CONTRACT §13.7a); taken when fishing spends the
  // cast's bait (consumeBait runs at the cast, before fishing:cast) or, if it did not, on fishing:cast itself
  let castSnap = null;
  function noteCast({ fromEvent = false } = {}) {
    const r = run();
    if (!r) { castSnap = null; return; }
    if (fromEvent && castSnap && castSnap.runId === r.id && castSnap.frame === frame()) return;   // consumeBait already took it this cast
    castSnap = { item: equippedItem(r), runId: r.id, frame: frame() };
  }
  const lineOut = () => { const st = ctx.fishing?.state; return typeof st === 'string' && !LINE_FREE.has(st); };

  // ------------------------------------------------------------------ Pg13: loadout, buffs, mods
  /** CONTRACT §13.7 getLoadout() -> {rod, line, reel, hold?, item, itemLevel, upgrade?} (+ perRun: legends' per-run Fight). */
  function getLoadout() {
    const r = run();
    if (!r) return { rod: 0, line: 0, reel: 0, item: null, itemLevel: 1, perRun: perRunOf(null), runless: true };
    const item = lineOut() && castSnap?.runId === r.id ? castSnap.item : equippedItem(r);
    if (perRunOf(r)) {
      const ups = r.upgrades || {};
      const t = safe(() => D().upgradeTiers(ups), {}) || {};
      const hold = safe(() => D().upgradeHold(ups), null);
      const out = { rod: t.rod | 0, line: t.line | 0, reel: t.reel | 0, item, itemLevel: 1, perRun: true };
      if (hold) out.hold = { rod: hold.rod, line: hold.line, reel: hold.reel };
      const lv = ups.lure_glimmer | 0;
      if (lv > 0 && C3()?.items?.lure_glimmer) out.upgrade = { id: 'lure_glimmer', level: lv };
      return out;
    }
    const f = meta()?.fitted || {};
    return { rod: f.rod | 0, line: f.line | 0, reel: f.reel | 0, item, itemLevel: 1, perRun: false };
  }
  /** The owned relic levels that give Hold (CATCH_V3.buffs.relics): always with you, so they are in the logs too. */
  function ownedRelics() {
    const out = {};
    const rel = meta()?.relics || {};
    for (const id of Object.keys(C3()?.buffs?.relics || {})) if ((rel[id] | 0) > 0) out[id] = rel[id] | 0;
    return out;
  }
  /** Ashwick's Burned Once: the first fish hooked each night (counted on fishing:hook; the hook of this very frame is still the first). */
  function firstHookTonight(r = run()) {
    if (!r || S.phaseInfo().phase !== 'gloomtide') return false;
    const h = r.flags?.nightHook;
    const day = r.day || 1;
    return !h || h.day !== day || (h.n === 1 && h.frame === frame());
  }
  function noteHook() {
    const r = run();
    if (!r || S.phaseInfo().phase !== 'gloomtide') return;
    r.flags = r.flags || {};
    const day = r.day || 1;
    const h = r.flags.nightHook;
    r.flags.nightHook = h && h.day === day ? { day, n: (h.n | 0) + 1, frame: frame() } : { day, n: 1, frame: frame() };
  }
  /** CONTRACT §13.7 getCatchBuffs(sizeClass?) -> {wellFed, boons, relics, character, firstHookTonight} (data.catchBuffHold caps it). */
  function getCatchBuffs() {
    const r = run();
    const relics = ownedRelics();
    if (!r) return { wellFed: false, boons: {}, relics, character: null, firstHookTonight: false };
    const boons = {};
    for (const id of Object.keys(C3()?.buffs?.boons || {})) {
      const lv = r.boons?.[id] | 0;
      if (lv > 0) boons[id] = Math.min(lv, S.boon(id)?.maxLevel ?? lv);
    }
    return { wellFed: !!S.wellFed(r), boons, relics, character: r.character ?? null, firstHookTonight: firstHookTonight(r) };
  }
  /** The lake a hooked fish fights in: the run's lake, the cove in the hub (Wanderers use the lake they are hooked in). */
  const currentLake = () => run()?.zone || S.hubZone() || undefined;
  /** The rest of catchChance's mods for the fish that bit (fishing adds strike and marked): buffs, wounds, landings, perRun, lake, night. */
  function getCatchMods(speciesId) {
    const sp = S.species(speciesId);
    const legend = sp?.rarity === 'legendary';
    const perRun = perRunOf(run());
    return { buffs: getCatchBuffs(), wounds: legend ? woundsOf(sp.id) : 0, landings: legend && !perRun ? landingsOf(sp.id) : 0, perRun,
      lake: currentLake(), night: S.phaseInfo().phase === 'gloomtide' };
  }

  // ------------------------------------------------------------------ legend wounds (CATCH_V3.legend: +6 Hold per escape, ≤ 3 counted)
  const woundMax = () => Math.max(1, Math.round((C3()?.legend?.woundCap ?? 18) / (C3()?.legend?.woundPerEscape ?? 6)));
  /** Where wounds live: meta.legendWounds, or run.legendWounds inside The Long Descent (woundScope.descent). */
  function woundStore(create = false) {
    const r = run();
    if (r && r.outing === 'descent') { if (create && !isObj(r.legendWounds)) r.legendWounds = {}; return r.legendWounds || {}; }
    const m = meta();
    if (create && !isObj(m.legendWounds)) m.legendWounds = {};
    return m.legendWounds || {};
  }
  const woundsOf = (id) => Math.min(woundMax(), woundStore()[id] | 0);
  const landingsOf = (id) => meta()?.journal?.[id]?.caught | 0;
  function addLegendWound(id) {
    if (!on() || S.isReplay() || S.species(id)?.rarity !== 'legendary') return 0;
    const st = woundStore(true);
    st[id] = Math.min(woundMax(), (st[id] | 0) + 1);
    return st[id];
  }
  function clearLegendWounds(id) {
    if (!on() || S.isReplay()) return;
    const st = woundStore();
    if (st && id in st) delete st[id];
  }

  // ------------------------------------------------------------------ the logs (CONTRACT §13.7 getOdds / getGearLog / compareOdds)
  const known = (id) => { const e = meta()?.journal?.[id]; return e?.caught > 0 ? 'caught' : e?.seen ? 'glimpsed' : 'unseen'; };
  const met = (id) => !!meta()?.journal?.[id] && !!S.species(id);
  /** The log's lake for a species: its home lake, or, for a Wanderer, the run's lake when it can be hooked there. */
  function logLake(sp) {
    const r = run();
    if (Array.isArray(sp?.zones) && r?.zone && sp.zones.includes(r.zone)) return r.zone;
    return undefined;
  }
  /** The log's reference: a Struck strike, the owned relics, no run buffs, no Marked or wound bonus (legends: their wounds). */
  function refMods(sp, extra = {}) {
    const ref = C3()?.display?.reference || {};
    const perRun = perRunOf(run());
    const legend = sp?.rarity === 'legendary';
    const mods = { strike: ref.strike || 'struck', buffs: { relics: ownedRelics() }, perRun, ...extra };
    const lake = logLake(sp);
    if (lake) mods.lake = lake;
    if (legend) { mods.wounds = woundsOf(sp.id); mods.landings = perRun ? 0 : landingsOf(sp.id); }
    return mods;
  }
  /** The log's loadout: the run's tackle Hold and the item on the line now (or the given fitted tiers / item). */
  function logLoadout({ fitted, item } = {}) {
    const lo = { ...getLoadout(), item: item !== undefined ? item : equippedItem(run()) };
    if (isObj(fitted)) { for (const s of SLOTS) lo[s] = Number(fitted[s]) || 0; delete lo.hold; }
    return lo;
  }
  const pct = (odds) => (odds ? Object.fromEntries(Object.entries(odds).map(([k, p]) => [k, D().catchDisplay(p)])) : null);
  /** Every bait and lure the player holds now (baits with a count, run lures, persistent lures): withBest's choices. */
  function ownedItems(r = run()) {
    const items = C3()?.items || {};
    const ids = [];
    if (r) for (const [id, n] of Object.entries(r.bait || {})) if ((n | 0) > 0 && items[id]?.kind === 'bait') ids.push(id);
    for (const src of [r?.lures, meta()?.lures]) for (const id of Object.keys(src || {})) if (src[id] && items[id]?.kind === 'lure' && !ids.includes(id)) ids.push(id);
    return ids;
  }
  /** getOdds(speciesId, {fitted, item}) -> {known, odds, withBest, marked, wounds} (+ pct, the floored whole percents ui prints). */
  function getOdds(speciesId, opts = {}) {
    if (!on()) return null;
    const sp = S.species(speciesId);
    if (!sp) return null;
    const legend = sp.rarity === 'legendary';
    const k = known(sp.id);
    const wounds = legend ? woundsOf(sp.id) : 0;
    const lo = logLoadout(opts);
    const base = { speciesId: sp.id, known: k, legend, wounds, item: lo.item ?? null, reference: C3()?.display?.reference?.strike || 'struck' };
    if (k === 'unseen') return { ...base, odds: null, pct: null, withBest: null, marked: [] };
    const mods = refMods(sp);
    const odds = safe(() => D().catchOdds(sp.id, lo, mods), null);
    let withBest = null;
    if (!legend) {
      const best = safe(() => D().catchBestItem(sp, ownedItems()), { id: null, hold: 0 });
      const cur = lo.item ? safe(() => D().catchItemHold(lo.item, sp), 0) : 0;
      if (best?.id && best.hold > cur && best.id !== lo.item) {
        const bOdds = safe(() => D().catchOdds(sp.id, { ...lo, item: best.id }, mods), null);
        withBest = { item: best.id, hold: best.hold, odds: bOdds, pct: pct(bOdds) };
      }
    }
    const marked = (Array.isArray(meta()?.markedFish) ? meta().markedFish : []).filter((mf) => mf?.speciesId === sp.id && !legend).map((mf) => {
      const cls = D().isAncient?.(mf.z) ? 'ancient' : D().sizeClassOf?.(mf.z ?? 0) || mf.sizeClass;
      const p = safe(() => D().catchChance(sp.id, cls, lo, { ...mods, marked: !mf.rehooked }), null);
      return { id: mf.id, name: mf.name || null, sizeClass: cls, approxLength: mf.approxLength ?? null, zone: mf.zone ?? null, p, pct: D().catchDisplay(p), bonus: !mf.rehooked };
    });
    return { ...base, odds, pct: pct(odds), withBest, marked };
  }
  /** compareOdds(speciesId, sizeClass, loadoutA, loadoutB) -> {a, b}: the gear log's pinned compare, at the log's reference. */
  function compareOdds(speciesId, sizeClass, loadoutA, loadoutB) {
    const sp = S.species(speciesId);
    if (!on() || !sp) return { a: null, b: null };
    const cls = sp.rarity === 'legendary' ? 'legend' : sizeClass;
    const mods = refMods(sp);
    return { a: safe(() => D().catchChance(sp.id, cls, loadoutA || logLoadout(), mods), null), b: safe(() => D().catchChance(sp.id, cls, loadoutB || logLoadout(), mods), null) };
  }
  /** The fish the gear log compares against: the player's pin, else the last fish that got away (auto). */
  function getPinned() {
    const m = meta() || {};
    const pin = isObj(m.gearPin) && S.species(m.gearPin.speciesId) ? { ...m.gearPin, auto: false } : null;
    if (pin) return pin;
    const la = isObj(m.lastAway) && S.species(m.lastAway.speciesId) ? m.lastAway : null;
    return la ? { speciesId: la.speciesId, sizeClass: la.sizeClass, reason: la.reason ?? null, name: la.name ?? null, approxLength: la.approxLength ?? null, auto: true } : null;
  }
  function pinGear(speciesId, sizeClass) {
    if (S.isReplay()) return false;
    const m = meta();
    if (!speciesId) { delete m.gearPin; return true; }
    if (!S.species(speciesId)) return false;
    m.gearPin = { speciesId, sizeClass: sizeClass || 'trophy' };
    return true;
  }
  /** What a gear-log row helps: 'all', {family, met}, {night: true, met}, the giants' named three, or the species met it helps. */
  function targetsOf(itemId) {
    const it = C3()?.items?.[itemId];
    if (!it) return [];
    if (it.all) return 'all';
    const helps = safe(() => D().catchItemTargets(itemId), []).filter((id) => S.species(id));
    if (it.species) return it.species.filter((id) => S.species(id));
    const seen = helps.filter(met);
    if (it.family) return { family: it.family, met: seen };
    if (it.night) return { night: true, met: seen };
    return seen;
  }
  /** Did a proof catch (TACKLE.proofs) happen: a class seal on any species of that lake. */
  function proofDone(proofId) {
    const opts = D().TACKLE?.proofs?.[proofId];
    if (!opts) return true;
    const J = meta()?.journal || {};
    return opts.some((o) => Object.entries(J).some(([id, e]) => S.species(id)?.zone === o.zone && e?.seals?.[o.class]));
  }
  /** Is a lure's lake lit (its onSale lake reached: this run, or in any run, or its Waystone lit)? 'start' always is. */
  function lureLit(L, r = run()) {
    const z = L?.onSale;
    if (!z || z === 'start') return true;
    const m = meta() || {};
    if (m.waystones?.[z]) return true;
    if ((r?.zonesUnlocked || []).includes(z)) return true;
    const zi = S.zone(z) ? S.zoneIndexOf(z) : Infinity;
    return zi <= (m.deepestZone | 0);
  }
  const runLurePrice = (L) => Math.round((Number(L?.price) || 0) * (AF()?.runLures?.priceMult ?? 0.4));
  /** Pg14: the lures Murk has this run (lit lakes) and the ones already bought (run.lures), with their 40% prices. */
  function runLures(r = run()) {
    if (!runLuresOn(r)) return [];
    return (D().LURES || []).filter((L) => lureLit(L, r) || r?.lures?.[L.id]).map((L) => ({ lure: L, price: runLurePrice(L), owned: !!r?.lures?.[L.id], lit: lureLit(L, r) }));
  }
  /** Pg14: buy a lure from Murk for this run (the market checks his mooring and the purse; this does the rest). */
  function grantRunLure(lureId) {
    const r = run();
    const L = lure(lureId);
    if (!r || !L) return false;
    r.lures = isObj(r.lures) ? r.lures : {};
    r.lures[L.id] = true;
    ctx.bus.emit('lure:buy', { lureId: L.id, run: true });
    if (!isLure(equippedItem(r))) equipLure(L.id);   // a fresh lure goes on the line unless another lure is already there
    return true;
  }

  /** getGearLog() -> [{id, kind, name, tier?, hold, emphasis?, targets, price, owned, proof?, …}] with .pinned (and each row's compare). */
  function getGearLog() {
    const out = [];
    if (!on()) { out.pinned = null; return out; }
    const r = run();
    const C = C3();
    const pinned = getPinned();
    const pinSp = pinned ? S.species(pinned.speciesId) : null;
    const pinCls = pinSp?.rarity === 'legendary' ? 'legend' : pinned?.sizeClass;
    const base = logLoadout();
    const mods = pinSp ? refMods(pinSp) : null;
    const chance = (lo) => (pinSp ? safe(() => D().catchChance(pinSp.id, pinCls, lo, mods), null) : null);
    const pA = chance(base);
    const compareWith = (lo) => (pinSp ? { a: pA, b: chance(lo) } : null);
    const ups = r?.upgrades || {};
    if (perRunOf(r)) {
      // P1–P2 runs and The Long Descent: the per-run rod, line and reel upgrades (each level adds Hold: upgradeHold)
      const slots = D().BALANCE?.upgradeTiers?.slots || D().BALANCE_V3?.upgradeTiers?.slots || {};
      const holdNow = safe(() => D().upgradeHold(ups), { rod: 0, line: 0, reel: 0 });
      const tiers = safe(() => D().upgradeTiers(ups), {});
      for (const slot of SLOTS) {
        for (const id of slots[slot] || []) {
          const u = S.upgrade(id);
          if (!u) continue;
          const level = ups[id] | 0;
          const maxLevel = u.maxLevel ?? (u.costs?.length || 1);
          const maxed = level >= maxLevel;
          const nextUps = maxed ? null : { ...ups, [id]: level + 1 };
          const next = nextUps ? safe(() => D().upgradeHold(nextUps)[slot], null) : null;
          const row = { id, kind: slot, upgrade: true, name: u.name, level, maxLevel, maxed, tier: tiers[slot] | 0, hold: holdNow[slot],
            next, gain: next != null ? next - holdNow[slot] : 0, emphasis: slotEmphasis(C, slot), targets: 'all',
            price: maxed ? null : u.costs?.[level] ?? null, owned: level > 0 };
          if (pinSp && nextUps) row.compare = compareWith({ ...base, hold: safe(() => D().upgradeHold(nextUps), base.hold) });
          out.push(row);
        }
      }
      // the per-run Glimmer Spoon: an upgrade, not the item on the line, and never stacked with it
      const gu = S.upgrade('lure_glimmer');
      if (gu && C.items.lure_glimmer) {
        const level = ups.lure_glimmer | 0, maxLevel = gu.maxLevel ?? 3, per = C.items.lure_glimmer.holdPerLevel ?? 2;
        const row = { id: 'lure_glimmer', kind: 'lure', upgrade: true, name: gu.name, level, maxLevel, maxed: level >= maxLevel, hold: per * level,
          next: level < maxLevel ? per * (level + 1) : null, gain: level < maxLevel ? per : 0, targets: targetsOf('lure_glimmer'),
          price: level < maxLevel ? gu.costs?.[level] ?? null : null, owned: level > 0 };
        if (pinSp && level < maxLevel) row.compare = compareWith({ ...base, upgrade: { id: 'lure_glimmer', level: level + 1 } });
        out.push(row);
      }
    } else {
      // P3 expeditions and the hub: the Gear Bench's tiers (kept forever; T2–T4 need a proof catch)
      const m = meta() || {};
      for (const slot of SLOTS) {
        for (const t of D().TACKLE?.[slot] || []) {
          const row = { id: t.id, kind: slot, name: t.name, tier: t.tier, hold: t.hold, emphasis: slotEmphasis(C, slot), targets: 'all', price: t.price,
            owned: (m.tackle?.[slot] | 0) >= t.tier, fitted: (m.fitted?.[slot] | 0) === t.tier, proof: t.proof ? { id: t.proof, done: proofDone(t.proof) } : null };
          if (pinSp) { const lo = { ...base, [slot]: t.tier }; delete lo.hold; row.compare = compareWith(lo); }
          out.push(row);
        }
      }
    }
    // baits (the specific gear: Hold only on the fish they help)
    const zi = r ? S.zoneIndexOf(r.zone) : 0;
    for (const b of D().BAITS || []) {
      const it = C.items[b.id];
      if (!it || b.legend) continue;
      const held = r?.bait?.[b.id] | 0;
      const onSale = (!b.unlock || S.isUnlocked(`bait:${b.id}`)) && (b.zoneMin ?? 0) <= zi;
      if (!held && !onSale) continue;
      const row = { id: b.id, kind: 'bait', name: b.name, hold: it.hold, targets: targetsOf(b.id), price: S.priceOfBait?.(b) ?? b.price, owned: held,
        equipped: equippedItem(r) === b.id, onSale };
      if (pinSp) row.compare = compareWith({ ...base, item: b.id });
      out.push(row);
    }
    // lures: per run at 40% in P1–P2 (run.lures), persistent from P3 (meta.lures); none inside The Long Descent (today's UPGRADES)
    const lureRows = runLuresOn(r)
      ? runLures(r).map((x) => ({ L: x.lure, price: x.price, owned: x.owned, onSale: x.lit }))
      : expeditions() && r?.outing !== 'descent'
        ? (D().LURES || []).filter((L) => lureLit(L, r) || meta()?.lures?.[L.id]).map((L) => ({ L, price: L.price, owned: !!meta()?.lures?.[L.id], onSale: lureLit(L, r) }))
        : [];
    for (const { L, price, owned, onSale } of lureRows) {
      const it = C.items[L.id];
      if (!it) continue;
      const row = { id: L.id, kind: 'lure', name: L.name, hold: it.hold, targets: targetsOf(L.id), price, owned, onSale, equipped: equippedItem(r) === L.id,
        giants: !!it.species, run: runLuresOn(r) };
      if (pinSp) row.compare = compareWith({ ...base, item: L.id });
      out.push(row);
    }
    out.pinned = pinned;
    return out;
  }
  /** CONTRACT §13.7 getTackleRating(zoneId, loadout) -> {reference, held, next, word}: words only (catchRating). P1–P2: the rounded tiers. */
  function ratingLoadout() {
    const lo = getLoadout();
    delete lo.hold;                       // "the rounded tier (upgradeTiers) still gives the tackle rating's words"
    lo.item = equippedItem(run());
    return lo;
  }
  function getTackleRating(zoneId, loadout) {
    if (!on() || typeof D().catchRating !== 'function') return null;
    const zid = zoneId || run()?.zone || 'mossmere';
    return safe(() => D().catchRating(zid, loadout || ratingLoadout(), { buffs: { relics: ownedRelics() }, perRun: perRunOf(run()) }), null);
  }

  // ------------------------------------------------------------------ Marked Fish (CONTRACT §13.2 meta.markedFish; BALANCE.markedFish)
  const MF = () => D().BALANCE?.markedFish || D().BALANCE_V3?.markedFish || { max: 6, perLake: 2 };
  function markedList(create = false) {
    const m = meta();
    if (!Array.isArray(m.markedFish)) { if (!create) return []; m.markedFish = []; }
    return m.markedFish;
  }
  /** getMarkedFish(zoneId?) -> copies of the Marked Fish still out there (in that lake), with their one-time +6 bonus flag. */
  function getMarkedFish(zoneId) {
    return markedList().filter((mf) => mf && (!zoneId || mf.zone === zoneId)).map((mf) => ({ ...mf, bonus: !mf.rehooked }));
  }
  /** addMarkedFish(escape): ≤ max, ≤ perLake (that lake's oldest is replaced); P1 anchors at the escape point (fishing keeps it within 8 m). */
  function addMarkedFish(e = {}) {
    if (!on() || S.isReplay()) return null;
    const sp = S.species(e.speciesId);
    if (!sp || sp.rarity === 'legendary') return null;
    const list = markedList(true);
    const r = run();
    const zone = e.zone || r?.zone || sp.zone || null;
    const cfg = MF();
    const inLake = list.filter((x) => x?.zone === zone);
    if (inLake.length >= (cfg.perLake ?? 2)) list.splice(list.indexOf(inLake[0]), 1);
    while (list.length >= (cfg.max ?? 6)) list.shift();
    const z = Number.isFinite(e.z) ? e.z : null;
    const cls = e.sizeClass || (z != null ? (D().isAncient?.(z) ? 'ancient' : D().sizeClassOf?.(z)) : null);
    const mf = { id: uid('mf'), speciesId: sp.id, z, zone, place: e.place ?? null, x: Number.isFinite(e.x) ? e.x : null, z0: Number.isFinite(e.zPos) ? e.zPos : null,
      expedition: meta().expeditions ?? meta().runs ?? 0, sizeClass: cls, name: e.name || null, approxLength: e.approxLength ?? null, day: r?.day ?? null };
    list.push(mf);
    if (r) { r.flags = r.flags || {}; (r.flags.markedFishCreated = r.flags.markedFishCreated || []).push(mf.id); }
    return mf;
  }
  /** Fishing hooked a Marked Fish: the +6 Hold applies once (its first re-hook). Returns {marked} for catchChance's mods. */
  function markedFishHooked(id) {
    const mf = markedList().find((x) => x?.id === id);
    if (!mf) return { marked: false };
    const marked = !mf.rehooked;
    if (!S.isReplay()) mf.rehooked = true;
    return { marked };
  }
  function removeMarkedFish(id) {
    const list = markedList();
    const i = list.findIndex((x) => x?.id === id);
    if (i >= 0 && !S.isReplay()) list.splice(i, 1);
    return i >= 0;
  }

  // ------------------------------------------------------------------ the got-away side of fish:escaped (F15; DESIGN §25.6.7)
  /** An Elder's generated name at the loss (the same tables as a landed one): "Old Ninefin". */
  function nameElder(speciesId, seed) {
    const sp = S.species(speciesId);
    return sp && sp.rarity !== 'legendary' ? elderName(D(), sp, seed ?? uid('fish'), run()?.zone || sp.zone) : null;
  }
  /** fish:escaped (after the loss and its quiet beat): Glimpsed page, Got away list, the one that got away, Elder Log "still out
   *  there", legend wounds, Marked Fish, the gear log's pin, the run's got-away lines. Nothing is written in a replay. */
  function onEscaped(e = {}) {
    if (!on() || S.isReplay()) return;
    const sp = S.species(e.speciesId);
    if (!sp) return;
    const r = run();
    const m = meta();
    const legend = sp.rarity === 'legendary' || e.legendary === true;
    const z = Number.isFinite(e.z) ? e.z : null;
    const cls = legend ? 'legend' : e.sizeClass || (z != null ? (D().isAncient?.(z) ? 'ancient' : D().sizeClassOf?.(z)) : null);
    const elder = !legend && (cls === 'elder' || cls === 'ancient');
    let name = e.name || null;
    if (elder && !name) { name = nameElder(sp.id, `${e.reason || 'lost'}:${z}:${m.runs | 0}:${r?.day ?? 0}:${frame()}`); if (name) e.name = name; }
    const len = Number(e.approxLength) > 0 ? Number(e.approxLength) : null;
    const lake = r?.zone || S.hubZone() || sp.zone || null;
    // the journal: a Glimpsed page (known, not caught: no Memories), the Got away list (last 5), the one that got away
    m.journal = isObj(m.journal) ? m.journal : {};
    const entry = m.journal[sp.id] || (m.journal[sp.id] = { caught: 0, biggest: 0 });
    const glimpsed = !(entry.caught > 0) && !entry.seen;
    if (!(entry.caught > 0)) entry.seen = true;
    const last = AF()?.gotAway?.journalLast ?? 5;
    const got = { sizeClass: cls, length: len, place: e.place ?? null, zone: lake, day: r?.day ?? null, reason: e.reason || null };
    if (name) got.name = name;
    entry.gotAway = [...(Array.isArray(entry.gotAway) ? entry.gotAway : []), got].slice(-last);
    if (len && (!isObj(entry.escape) || len > (entry.escape.length || 0))) entry.escape = { length: len, sizeClass: cls };
    if (glimpsed) ctx.bus.emit('journal:seen', { speciesId: sp.id });
    // the Elder Log's "still out there"
    if (elder) {
      m.elderLog = Array.isArray(m.elderLog) ? m.elderLog : [];
      m.elderLog.push({ name, speciesId: sp.id, length: len, weight: null, z, ancient: cls === 'ancient', place: e.place ?? null, zone: lake,
        expedition: m.expeditions ?? m.runs ?? 0, day: r?.day ?? null, character: r?.character ?? null, lost: e.reason || 'lost' });
      if (m.elderLog.length > 400) m.elderLog.splice(0, m.elderLog.length - 400);
    }
    // legends: wounded (+6 Hold on the next attempt, ≤ 3 counted); Marked Fish: a re-hooked one stays out there, a new one is marked
    if (legend) addLegendWound(sp.id);
    else if (e.markedFishId && markedList().some((x) => x?.id === e.markedFishId)) { const mf = markedList().find((x) => x.id === e.markedFishId); mf.rehooked = true; }
    else if (e.markedFish) addMarkedFish({ ...e, name, zone: lake });
    // the gear log pins the last fish that got away (not the Landing's Quayling: the gear log is about the lakes)
    if (!S.isCove(sp.id)) m.lastAway = { speciesId: sp.id, sizeClass: cls, reason: e.reason || null, name, approxLength: len, zone: lake };
    if (r) {
      r.flags = r.flags || {};
      r.stats = r.stats || {};
      (r.flags.gotAway = Array.isArray(r.flags.gotAway) ? r.flags.gotAway : []).push({ speciesId: sp.id, ...got });
      if (r.flags.gotAway.length > 24) r.flags.gotAway.splice(0, r.flags.gotAway.length - 24);
    }
    S.requestSave();
  }
  /** The run summary's got-away lines (Prize and bigger): "A Trophy Reedjaw Pike, near 1.1 m, threw the hook, day 3." */
  function gotAwayLines(r = run()) {
    const A = AF();
    const T = A?.text || {};
    const list = Array.isArray(r?.flags?.gotAway) ? r.flags.gotAway : [];
    const big = new Set(['prize', 'trophy', 'elder', 'ancient', 'legend']);
    return list.filter((g) => big.has(g.sizeClass)).slice(-8).map((g) => {
      const sp = S.species(g.speciesId);
      const label = g.sizeClass === 'legend' ? '' : `${S.classLabel(g.sizeClass)} `;
      const art = g.sizeClass === 'legend' ? '' : /^[aeiou]/i.test(label) ? 'An ' : 'A ';
      const who = g.sizeClass === 'legend' ? (sp?.name || g.speciesId) : `${art}${label}${sp?.name || g.speciesId}`;
      const near = g.length ? `, ${A?.gotAway?.word || 'near'} ${approxText(g.length, A)}` : '';
      const cause = T.toastCause?.[g.reason] || 'got away';
      return `${who}${g.name ? ` (${g.name})` : ''}${near}, ${cause}${g.day ? `, day ${g.day}` : ''}.`;
    });
  }

  // ------------------------------------------------------------------ the fishing counters (P1–P2: meta.runs and run.outing)
  /** {runs, expedition, hurry, firstExpedition, strikeRing}: the hurry from the 2nd run, the strike ring on the first outing. */
  function getFishingCounters() {
    const m = meta() || {};
    const r = run();
    const A = AF() || {};
    const expedition = expeditions() ? (m.expeditions | 0) : (m.runs | 0);
    const fromRun = A.play?.inputs?.hurry?.fromRun ?? 2;
    const firstExpedition = r ? r.outing === 'first' : expeditions() ? !m.firstOutingDone : (m.runs | 0) === 0;
    const setting = m.settings?.strikeRing || A.strike?.ring?.default || 'firstExpedition';
    const fe = !!ctx.firstEvening?.isActive?.();
    const strikeRing = setting === 'always' || (setting === 'firstExpedition' && (firstExpedition || fe));
    return { runs: m.runs | 0, expedition, hurry: expedition >= fromRun && r?.outing !== 'first', firstExpedition, strikeRing, setting };
  }

  return {
    on, perRunOf, runLuresOn, expeditions, lure, isLure, ownedLure, lureLit, runLurePrice, runLures, grantRunLure,
    equippedItem, syncEquipped, equipLure, getEquippedLure, noteCast, noteHook,
    getLoadout, getCatchBuffs, getCatchMods, ownedRelics, getOdds, compareOdds, getGearLog, getPinned, pinGear, getTackleRating, targetsOf,
    woundsOf, addLegendWound, clearLegendWounds, getMarkedFish, addMarkedFish, markedFishHooked, removeMarkedFish, nameElder,
    onEscaped, gotAwayLines, getFishingCounters,
  };
}
