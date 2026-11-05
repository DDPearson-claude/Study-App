// progression-v3.js — the v3 helpers of progression.js (DESIGN §25, CONTRACT §13). Pure functions of the
// data module and their inputs, so tools/tests can drive them without a ctx:
//   • Pg0  save migration, ids only (RENAMES: pale_leviathan → lantern_swallower, pale_marrow → last_candle,
//          tide_chart → murks_chum in journal keys, unlocks, run.legendaries, run.bait …; meta.v3ids)
//   • Pg1  the v3 Fish figures from the size score z (length, weight, class, value × 0.66, food / oil × 0.784),
//          Elder names, z recovered from a v1 weight (fishing builds that still roll weights)
//   • P1–P2 the interim night tally that replaces memoriesFor's nights row (MEMORIES_V3.interim)
// Nothing here runs unless data.V3_ENABLED is true (progression.js gates every call).

export const v3On = (D) => D?.V3_ENABLED === true;

// =====================================================================================
// Pg0 — ids only (CONTRACT §13.2 "Save schema and migration").
// =====================================================================================
/** old id → new id over RENAMES.pg0's kinds (species, baits, supplies). */
export function renameMap(D) {
  const R = D?.RENAMES || {};
  const out = {};
  for (const kind of R.pg0 || ['species', 'baits', 'supplies']) Object.assign(out, R[kind] || {});
  return out;
}
const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);

/** Move obj[old] to obj[new] for every pair in map; `merge(a, b)` joins two values when both keys exist. */
function renameKeys(obj, map, merge = (a, b) => b ?? a) {
  if (!isObj(obj)) return false;
  let changed = false;
  for (const [from, to] of Object.entries(map)) {
    if (!(from in obj)) continue;
    obj[to] = to in obj ? merge(obj[from], obj[to]) : obj[from];
    delete obj[from];
    changed = true;
  }
  return changed;
}
/** Keys shaped `<prefix>:<id>` (unlocks such as `bait:pale_marrow`, `trophy:pale_leviathan`). */
function renameSuffixKeys(obj, map) {
  if (!isObj(obj)) return false;
  let changed = false;
  for (const key of Object.keys(obj)) {
    const i = key.lastIndexOf(':');
    if (i < 0) continue;
    const to = map[key.slice(i + 1)];
    if (!to) continue;
    const nk = key.slice(0, i + 1) + to;
    if (!(nk in obj)) obj[nk] = obj[key];
    else if (obj[key] && !obj[nk]) obj[nk] = obj[key];
    delete obj[key];
    changed = true;
  }
  return changed;
}
const sumCounts = (a, b) => (Number(a) || 0) + (Number(b) || 0);
function mergeJournal(a = {}, b = {}) {
  const out = { ...a, ...b };
  out.caught = sumCounts(a.caught, b.caught);
  for (const k of ['biggest', 'pbLength', 'pbWeight', 'pbZ']) if (a[k] != null || b[k] != null) out[k] = Math.max(Number(a[k]) || 0, Number(b[k]) || 0);
  for (const k of ['firstDay', 'firstRun']) if (a[k] != null && b[k] != null) out[k] = Math.min(a[k], b[k]);
  return out;
}
function renameNames(text, names) {
  if (typeof text !== 'string') return text;
  let t = text;
  for (const [from, to] of Object.entries(names || {})) t = t.split(from).join(to);
  return t;
}

/** Rename the ids in meta (journal keys, unlock keys, per-key challenge progress). Returns true when anything moved. */
export function migrateMetaIds(meta, map) {
  if (!isObj(meta)) return false;
  let changed = renameKeys(meta.journal, map, mergeJournal);
  changed = renameSuffixKeys(meta.unlocks, map) || changed;
  changed = renameSuffixKeys(meta.challengeProgress, map) || changed;
  return changed;
}
/** Rename the ids in a saved run (idempotent: a run without old ids is left untouched). */
export function migrateRunIds(run, map, names = {}) {
  if (!isObj(run)) return false;
  let changed = false;
  const swap = (o, k) => { if (o && typeof o[k] === 'string' && map[o[k]]) { o[k] = map[o[k]]; changed = true; } };
  changed = renameKeys(run.legendaries, map, (a, b) => !!(a || b)) || changed;
  changed = renameKeys(run.bait, map, sumCounts) || changed;
  swap(run, 'equippedBait');
  for (const f of Array.isArray(run.creel) ? run.creel : []) swap(f, 'speciesId');
  const fl = run.flags;
  if (isObj(fl)) {
    swap(fl, 'prevBait');
    for (const f of Array.isArray(fl.pendingCatch) ? fl.pendingCatch : []) swap(f, 'speciesId');
    for (const x of Array.isArray(fl.records) ? fl.records : []) swap(x, 'speciesId');
    changed = renameKeys(fl.wounded, map, (a, b) => Math.max(Number(a) || 0, Number(b) || 0)) || changed;
    changed = renameKeys(fl.visit?.supplies, map, sumCounts) || changed;
  }
  if (isObj(run.stats?.biggest)) swap(run.stats.biggest, 'speciesId');
  for (const b of Array.isArray(run.bounties) ? run.bounties : []) {
    if (!isObj(b)) continue;
    swap(b, 'target');
    swap(b, 'speciesId');
    const t = renameNames(b.text, names);
    if (t !== b.text) { b.text = t; changed = true; }
  }
  return changed;
}
/**
 * Pg0 (P1): `migrateSave(save) -> save` on the envelope {version, meta, run} (core.loadSave), in place.
 * If !meta.v3ids: rename the ids in meta and set meta.v3ids. The run is renamed whenever it still holds an
 * old id (idempotent), so a run continued later is migrated too. Flag off: the save is returned untouched.
 */
export function migrateSave(D, save) {
  if (!v3On(D) || !save || typeof save !== 'object') return save;
  const map = renameMap(D);
  if (isObj(save.meta) && !save.meta.v3ids) {
    migrateMetaIds(save.meta, map);
    save.meta.v3ids = true;
  }
  if (isObj(save.run)) migrateRunIds(save.run, map, D?.RENAMES?.names);
  // the First Evening's legacy rule: a separate, idempotent step after Pg0 (Pg0 runs only when !meta.v3ids; this one runs only while
  // meta.firstEvening is undefined, so a P1-era v3 save gets it too)
  if (isObj(save.meta)) firstEveningLegacy(D, save.meta);
  return save;
}

// =====================================================================================
// FE-Pg1 — the First Evening's save flag (DESIGN §25.4.8 "Skip, resume, returning players, replay"; CONTRACT §13.2, §13.12).
// =====================================================================================
/** The cove's species (the Landing's one fish, the Quayling): COVE.fishing.species, plus any species whose zone is the cove. */
export function coveSpecies(D) {
  const out = new Set(D?.COVE?.fishing?.species || []);
  for (const s of D?.SPECIES_V3 || D?.SPECIES || []) if (s?.cove || s?.zone === 'cove') out.add(s.id);
  return out;
}
/** A new meta.firstEvening record: {done, step, skipped, legacy} (offerSeen is added when the legacy ribbon is used or dismissed). */
export const freshFirstEvening = (legacy = false) => (legacy ? { done: true, step: null, skipped: false, legacy: true } : { done: false, step: null, skipped: false, legacy: false });
/**
 * The legacy rule (a separate, idempotent step; not part of Pg0): only while meta.firstEvening is undefined, a save that has
 * played (meta.runs > 0) or holds a journal entry for any non-cove species is a returning player's → {done: true, legacy: true}
 * (no prologue; the title offers "A new first evening" once); anything else → {done: false, step: null}. A mid-First-Evening save
 * holds a Quayling entry, which is not legacy. Also called when the First Evening starts. Defensive extension: a record that
 * was never started ({done: false, step: null}, not skipped, not legacy) on a save that has runs can only come from a build without
 * the First Evening (an FE build never starts a run before `done`), so it is treated as undefined. Returns true when it wrote.
 */
export function firstEveningLegacy(D, meta) {
  if (!v3On(D) || !isObj(meta)) return false;
  const fe = meta.firstEvening;
  const runs = Number(meta.runs) || 0;
  const neverStarted = isObj(fe) && fe.done === false && fe.step == null && !fe.skipped && !fe.legacy && runs > 0;
  if (fe !== undefined && !neverStarted) return false;
  const cove = coveSpecies(D);
  const nonCove = Object.keys(isObj(meta.journal) ? meta.journal : {}).some((id) => !cove.has(id));
  meta.firstEvening = freshFirstEvening(runs > 0 || nonCove);
  return true;
}

// =====================================================================================
// Pg1 — the v3 Fish (DESIGN §25.7.1, §25.7.3; CONTRACT §13.2 Fish).
// =====================================================================================
/** Size score z of a v1-rolled weight (kg): inverse of W = k·L³ and L = L50·e^(σz + tail·max(0, z − tailFrom)²). */
export function zFromWeight(D, sp, kg, zone = null) {
  const SZ = D.BALANCE_V3?.size;
  if (!sp?.size || !SZ || !(kg > 0)) return 0;
  const L = Math.cbrt((kg * 1000) / sp.size.k);
  const target = Math.log(L / D.sizeL50(sp, zone));
  const tail = sp.rarity === 'legendary' ? 0 : SZ.tail;
  const f = (z) => sp.size.sigma * z + tail * Math.max(0, z - SZ.tailFrom) ** 2;
  let lo = SZ.z.min, hi = SZ.z.max;
  if (target <= f(lo)) return lo;
  if (target >= f(hi)) return hi;
  for (let i = 0; i < 48; i++) { const m = (lo + hi) / 2; if (f(m) < target) lo = m; else hi = m; }
  return Math.round(((lo + hi) / 2) * 1e4) / 1e4;
}

/**
 * The figures of a fish of size score z: {z, sizeClass, ancient, length (cm), weight (kg), value, food, oil}.
 * value = data.fishValueV3 (species.value × 0.66 × clamp(e^0.45z) × class bonus × quality × streak),
 * food / oil = data.fishYieldV3 (× 0.784 × clamp(e^0.3z) × quality). Legendaries are single authored individuals
 * (σ 0.02): their length and weight follow z, but value and yields are today's species means (the size factors
 * and 0.66 normalise the sold-fish mix, which never includes a legend).
 * opts: {quality: QUALITY entry, streak: multiplier ≥ 1, zone: catch lake id (Pilgrim Salmon L50, valueByLake)}.
 */
export function fishFigures(D, sp, z, opts = {}) {
  const SZ = D.BALANCE_V3.size;
  const zz = Math.max(SZ.z.min, Math.min(SZ.z.max, Number.isFinite(z) ? z : 0));
  const Q = opts.quality || { valueMult: 1, yieldMult: 1 };
  const streak = opts.streak ?? 1;
  const length = D.sizeLength(sp, zz, opts.zone);
  const weight = D.sizeWeight(sp, length);
  const legend = sp.rarity === 'legendary';
  let value, food, oil;
  if (legend) {
    const lakeMult = sp.valueByLake ? (D.ZONES?.find((q) => q.id === opts.zone)?.valueMult ?? 1) : 1;
    value = Math.round((sp.value ?? 5) * lakeMult * (Q.valueMult ?? 1) * streak);
    food = Math.round((sp.food ?? 10) * (Q.yieldMult ?? 1));
    oil = Math.round((sp.oil ?? 10) * (Q.yieldMult ?? 1));
  } else {
    value = D.fishValueV3(sp, zz, { zone: opts.zone, quality: Q.valueMult ?? 1, streak });
    food = Math.round(D.fishYieldV3(sp, zz, 'food', { quality: Q.yieldMult ?? 1 }));
    oil = Math.round(D.fishYieldV3(sp, zz, 'oil', { quality: Q.yieldMult ?? 1 }));
  }
  return {
    z: Math.round(zz * 1e4) / 1e4, sizeClass: D.sizeClassOf(zz), ancient: D.isAncient(zz),
    length: Math.round(length * 10) / 10,
    weight: weight < 1 ? Math.round(weight * 1000) / 1000 : Math.round(weight * 100) / 100,
    value: Math.max(1, value), food: Math.max(1, food), oil: Math.max(1, oil),
  };
}

/** z of the standard normal at percentile p (0 < p < 1), e.g. 0.75 → 0.674: a "top quarter at μ 0" fish. */
export function zAtPercentile(p) {
  const q = Math.min(0.9999, Math.max(0.0001, Number(p) || 0.5));
  const erf = (x) => { const t = 1 / (1 + 0.3275911 * Math.abs(x)); const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
  let lo = -5, hi = 5;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (0.5 * (1 + erf(m / Math.SQRT2)) < q) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
/** v3 "heavy" bounty weight (kg): the species' weight at the percentile's size score (v1 used a share of the weight range,
 *  which under the stretched size model would sit deep in Elder sizes that open water never rolls). */
export function heavyTargetKg(D, sp, percentile = 0.75, zone = null) {
  if (!sp?.size) return null;
  return D.sizeWeight(sp, D.sizeLength(sp, zAtPercentile(percentile), zone));
}

/** A small stable hash (FNV-1a) for seeded picks. */
export function hash32(str) {
  let h = 0x811c9dc5;
  const s = String(str);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}
/** An Elder's generated name from ELDER_NAMES ("Old Ninefin"): prefix · lake core (or any) + body suffix. */
export function elderName(D, sp, seed, zoneId = null) {
  const N = D.ELDER_NAMES;
  if (!N || !sp) return null;
  const h = hash32(`${sp.id}:${seed}`);
  const pre = N.pre[h % N.pre.length];
  const cores = [...(N.core?.[zoneId || sp.zone] || []), ...(N.core?.any || [])];
  const core = cores.length ? cores[(h >>> 7) % cores.length] : 'Ink';
  const suf = N.suffix?.[sp.model?.shape] || ['fin', 'tail'];
  return `${pre} ${core}${suf[(h >>> 15) % suf.length]}`;
}

// =====================================================================================
// P1–P2 — the interim night tally (MEMORIES_V3.interim; DESIGN §25.10.4 "P1–P2").
// =====================================================================================
/** Memories for one endured night: Still / a still Lantern night / a lamp-watch 1, a Lantern swarm night 4, Gloomtide v1's base + zone. */
export function nightMemories(D, kind, zoneIndex = 0) {
  const N = D.MEMORIES_V3?.interim?.nights || {};
  const M = D.BALANCE?.memories || {};
  if (kind === 'swarm') return N.lanternSwarm ?? 4;
  if (kind === 'gloom') return (M.nightBase ?? 3) + (M.nightPerZone ?? 1) * Math.max(0, zoneIndex | 0);
  return kind === 'lanternStill' ? (N.lanternStill ?? 1) : (N.still ?? 1);
}
/** The kind of a night that just ended, from what was seen during it (mode, planned swarm, window opened, lamp-watch, Scorched). */
export function nightKind(mode, seen = {}) {
  if (mode === 'gloomtide') return 'gloom';
  if (mode !== 'lantern') return 'still';
  if (seen.scorched) return 'lanternStill';            // the swarm won: it is not a night endured against the swarm
  if (seen.opened) return 'swarm';
  return seen.planned && !seen.watch ? 'swarm' : 'lanternStill';
}
