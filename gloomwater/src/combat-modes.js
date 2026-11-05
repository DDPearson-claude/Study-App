// combat-modes.js — v3 night modes for combat (DESIGN §25.5, CONTRACT §13.7 combat). Pure helpers: no THREE, no ctx,
// no module state, so tools/tests can drive them directly. Helper of combat.js / combat-levels.js / combat-enemies.js.
//
// Which mode a run plays (Still / Lantern / Gloomtide; the First Outing is all still), tonight's swarm window (Lantern
// night k 0.05 → 0.50 on even nights, Gloomtide the whole night, Still never), the Lantern multipliers on
// difficultyFor(), the Warden cadence (Lantern: every 2nd swarm night at hp × 0.75), the threat model (fodder → oil,
// Embers only from telegraphed hits, nothing that costs a hooked fish), the Angler pool and its Still-rate cap, banked
// level-ups and when a pick may open as a modal, and XP per mode.
//
// Every helper answers "v1" (null / unchanged / true) when the data carries no BALANCE.nightModes (the flag-off build)
// or the run is The Long Descent (`outing: 'descent'`, CONTRACT §13.0), so a flag-off build behaves exactly as before.

/** Fishing states with a fish on the line (CONTRACT §13.7: the hard rule applies while state ∈ {reeling, landing}). */
export const HOOKED_STATES = new Set(['reeling', 'landing']);
/** Fishing states with no line in the water (anything else counts as "a line out" for level-up modals). */
export const LINE_FREE_STATES = new Set(['idle', 'lost']);

const num = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : d);

/** BALANCE.nightModes when the v3 data is merged (P1+), else null. */
export function nightModes(B) {
  const n = B?.nightModes;
  return n && typeof n === 'object' && n.lantern && n.still ? n : null;
}

/** The mode this run plays: 'still' | 'lantern' | 'gloomtide', or null for v1 rules (flag off, no run, The Long Descent). */
export function modeOf(run, B) {
  const NM = nightModes(B);
  if (!NM || !run || run.outing === 'descent') return null;
  if (run.outing === 'first') return typeof NM.firstOuting === 'string' && NM[NM.firstOuting] ? NM.firstOuting : 'still';
  const m = run.nightMode;
  return typeof m === 'string' && NM[m] && typeof NM[m] === 'object' ? m : 'gloomtide';   // a run without a mode played v1's nights
}
export function modeCfg(mode, B) { return mode ? nightModes(B)?.[mode] || null : null; }
/** Modes with a swarm (Lantern, Gloomtide). */
export const combatMode = (mode) => mode === 'lantern' || mode === 'gloomtide';

// ---------------------------------------------------------------- the hard rule (DESIGN §25.5.3)
/** May a combat slam snap a line? Still / Lantern: never. */
export function slamSnaps(mode, B) {
  if (!mode) return true;
  if (mode === 'still') return false;
  return modeCfg(mode, B)?.threat?.slamSnaps !== false;
}
/** May knockback, a slam knock, a Bulwark shove or a pull move the Wick / raft while a fish is hooked? Still / Lantern: no. */
export function knockWhileHooked(mode, B) {
  if (!mode) return true;
  if (mode === 'still') return false;
  const t = modeCfg(mode, B)?.threat;
  return !(t && (t.knockWhileHooked === false || t.whileHooked === false));
}
/** Does combat take a tap (zap) while a fish is hooked? Still / Lantern: no, the tap is ignored by combat. */
export function tapsWhileHooked(mode, B) {
  if (!mode) return true;
  if (mode === 'still') return false;
  const t = modeCfg(mode, B)?.threat;
  return !(t && (t.zapReleasesReel === false || t.whileHooked === false));
}
/** May a creelsnatch act (surface, leap, steal) while a fish is hooked? Still / Lantern: never. */
export function creelsnatchWhileHooked(mode, B) {
  if (!mode) return true;
  if (mode === 'still') return false;
  return modeCfg(mode, B)?.threat?.whileHooked !== false;
}
/**
 * Does this hit cost Embers? Lantern (`threat.embersFrom: 'telegraphed'`): only telegraphed hits (a hand slam, a Warden's
 * telegraphed abilities); fodder contact, Warden body contact and untelegraphed hazards drain oil only.
 */
export function embersAllowed(mode, B, o = {}) {
  if (mode !== 'lantern') return true;
  const t = modeCfg(mode, B)?.threat;
  if (!t || t.embersFrom !== 'telegraphed') return true;
  return o.telegraphed === true;
}
/** A fish a creelsnatch or a tipped creel may take: never a legendary, never a fish marked for home (every mode). */
export function stealable(fish, { run, speciesOf } = {}) {
  if (!fish) return false;
  if (speciesOf?.(fish.speciesId)?.rarity === 'legendary') return false;
  if (fish.marked === true) return false;
  const marked = run?.marked;
  if (Array.isArray(marked) && fish.uid != null && marked.some((m) => m && (m.uid === fish.uid || m.fish?.uid === fish.uid))) return false;
  return true;
}
/** Still / Lantern legend fights: the per-species rule (`legendQuiet`), or null (Gloomtide / v1 keep the fight as it is). */
export function legendQuietFor(mode, B, speciesId) {
  if (mode !== 'still' && mode !== 'lantern') return null;
  const LQ = nightModes(B)?.legendQuiet || {};
  const id = speciesId === 'pale_leviathan' ? 'lantern_swallower' : speciesId;   // the pre-rename id (saves migrate; be lenient)
  return LQ[id] ?? null;
}

// ---------------------------------------------------------------- the swarm window
/** Does the swarm come on night n in this mode? (The First Outing never.) Prefers data's helper. */
export function swarmTonight(mode, night, outing, B, data) {
  if (!mode) return true;
  if (outing === 'first') return false;
  if (typeof data?.swarmTonight === 'function') { try { return data.swarmTonight(mode, night, outing || 'normal') === true; } catch { /* fall through */ } }
  const m = modeCfg(mode, B);
  if (!m) return false;
  return m.swarmNights === 'all' || (m.swarmNights === 'even' && (night | 0) % 2 === 0);
}
/**
 * Tonight's swarm window {k0, k1, start, end} in night k (0–1), or null on a still night. `end` is clipped so the last
 * `quietTail` seconds of the night stay quiet (Lantern 45 s). v1 (mode null): the whole night.
 */
export function windowTonight({ mode, night = 1, outing = 'normal', B, data, nightDur = 90 } = {}) {
  if (!mode) return { k0: 0, k1: 1, start: 0, end: 1 };
  if (!swarmTonight(mode, night, outing, B, data)) return null;
  let w = null;
  if (typeof data?.swarmWindow === 'function') { try { w = data.swarmWindow(mode, night, outing || 'normal'); } catch { w = null; } }
  if (!Array.isArray(w)) w = modeCfg(mode, B)?.window;
  if (!Array.isArray(w) || w.length < 2) return null;
  const k0 = Math.max(0, num(w[0], 0)), k1 = Math.min(1, num(w[1], 1));
  const end = Math.min(k1, quietTailK(mode, B, nightDur));
  if (!(end > k0)) return null;
  return { k0, k1, start: k0, end };
}
/** The night k after which the night stays quiet (1 when the mode has no quiet tail). */
export function quietTailK(mode, B, nightDur) {
  const q = num(modeCfg(mode, B)?.quietTail, 0);
  return q > 0 && nightDur > 0 ? Math.max(0, 1 - q / nightDur) : 1;
}
/**
 * A lamp-watch was left (> 10 m) during the night: the swarm window starts at the current k (DESIGN §25.5.2). It keeps
 * its length and never runs into the quiet tail. Returns the new window or null (too late tonight).
 */
export function restartWindow(win, kNow, mode, B, nightDur) {
  if (!win) return null;
  const len = Math.max(0, win.k1 - win.k0);
  const start = Math.max(win.k0, num(kNow, 0));
  const end = Math.min(start + len, 1, quietTailK(mode, B, nightDur));
  return end > start ? { ...win, start, end } : null;
}
/** Night k → progress through tonight's window (0 at its start, 1 at its end). */
export function windowK(win, k) {
  if (!win) return 0;
  const span = Math.max(1e-6, win.end - win.start);
  return Math.min(1, Math.max(0, (k - win.start) / span));
}

/** How many swarm nights the run has had up to and including night n (Lantern Warden cadence). */
export function swarmIndex(mode, night, outing, B, data) {
  let n = 0;
  for (let d = 1; d <= Math.max(0, night | 0); d++) if (swarmTonight(mode, d, outing, B, data)) n++;
  return n;
}
/** Is tonight a Warden night? Gloomtide: data's cadence (difficultyFor's boss); Lantern: every 2nd swarm night (4, 8…). */
export function wardenTonight(mode, night, outing, B, data, rawBoss) {
  if (!mode) return !!rawBoss;
  const W = modeCfg(mode, B)?.wardens;
  if (!W || !swarmTonight(mode, night, outing, B, data)) return false;
  if (W.everySwarmNight > 0) { const i = swarmIndex(mode, night, outing, B, data); return i > 0 && i % W.everySwarmNight === 0; }
  return !!rawBoss;
}

/**
 * difficultyFor() × BALANCE.nightModes[mode].mult (CONTRACT §13.7): Lantern spawnRate × 0.55, hpMult × 0.8, maxAlive × 0.6,
 * elite interval × 2 (no elites below Heat 3), one formation per swarm, the Warden on every 2nd swarm night at hp × 0.75.
 * Returns a new object; v1 / Gloomtide return the input unchanged.
 */
export function scaleDiff(raw, { mode, B, data, night = 1, outing = 'normal', zoneWarden = null } = {}) {
  const cfg = modeCfg(mode, B);
  if (!raw || !cfg || mode === 'gloomtide') return raw;
  const m = cfg.mult || {};
  const d = { ...raw };
  d.spawnRate = +(num(raw.spawnRate, 0) * num(m.spawnRate, 1)).toFixed(4);
  d.hpMult = +(num(raw.hpMult, 1) * num(m.hpMult, 1)).toFixed(4);
  d.maxAlive = Math.max(1, Math.round(num(raw.maxAlive, 30) * num(m.maxAlive, 1)));
  d.eliteEvery = raw.eliteEvery > 0 ? raw.eliteEvery * num(m.eliteEvery, 1) : 0;
  if (cfg.firstEliteHeat != null && num(raw.heat, 0) < cfg.firstEliteHeat) d.eliteEvery = 0;
  if (cfg.formationsPerSwarm != null) d.formationAt = (raw.formationAt || []).slice(0, Math.max(0, cfg.formationsPerSwarm | 0));
  const W = cfg.wardens;
  const isW = wardenTonight(mode, night, outing, B, data, raw.boss);
  d.boss = isW ? (raw.boss || zoneWarden || null) : null;
  if (d.boss && W?.hpMult != null) d.bossHpMult = +(num(raw.bossHpMult, num(raw.hpMult, 1)) * W.hpMult).toFixed(4);
  return d;
}

// ---------------------------------------------------------------- levels and Boons (DESIGN §25.5.4)
export function isAngler(b, data) {
  if (!b) return false;
  return (Array.isArray(b.tags) && b.tags.includes('angler')) || (Array.isArray(data?.ANGLER_POOL) && data.ANGLER_POOL.includes(b.id));
}
/** Cumulative Still level-ups by the end of day `day` (xpModes.levelsPerDay.still, last value repeating): the Angler cap. */
export function anglerAllowance(day, B) {
  const L = B?.xpModes?.levelsPerDay?.still;
  if (!Array.isArray(L) || !L.length) return Infinity;
  let s = 0;
  for (let d = 1; d <= Math.max(1, day | 0); d++) s += num(L[Math.min(d, L.length) - 1], 0);
  return s;
}
/** Angler Boon levels the run has picked (the Wick's start boon does not count: it was never an offer). */
export function anglerPicks(run, data, BY) {
  let n = 0;
  const by = BY || data?.BOON_BY_ID || {};
  const start = run?.character ? (data?.CHARACTER_BY_ID?.[run.character]?.startBoon || null) : null;
  for (const [id, lv] of Object.entries(run?.boons || {})) {
    if (!(lv > 0) || !isAngler(by[id], data)) continue;
    n += Math.max(0, (lv | 0) - (id === start ? 1 : 0));
  }
  return n;
}
/**
 * The offer rule for this run (null = v1, no filter): Still (and the First Outing) offers the Angler pool only; Lantern
 * offers no weapons before its first swarm night; combat modes cap Angler picks at the Still rate; Kindling Draft levels
 * take non-Angler offers only; Kindles only in combat modes.
 */
export function offerRule({ mode, B, data, run, item, day } = {}) {
  const cfg = modeCfg(mode, B);
  if (!cfg) return null;
  const XM = B?.xpModes || {};
  const anglerOnly = cfg.pool === 'angler';
  const weapons = !anglerOnly && (mode !== 'lantern' || !!run?.flags?.swarmSeen);
  const capped = !anglerOnly && cfg.anglerCap === 'still' && anglerPicks(run, data) >= anglerAllowance(day ?? run?.day ?? 1, B);
  const draftNoAngler = item?.type === 'draft' && XM.draftNonAngler !== false;
  const kindles = cfg.kindles !== false && weapons;
  return {
    anglerOnly, weapons, capped, kindles,
    allow(b, { kindle = false } = {}) {
      if (!b) return false;
      if (kindle) return kindles;
      const ang = isAngler(b, data);
      if (anglerOnly) return ang;
      if (b.kind === 'weapon' && !weapons) return false;
      if (ang && (capped || draftNoAngler)) return false;
      return true;
    },
  };
}
/** "A line out" for the level-up rule: any fishing state but idle / lost (a missing fishing module has none). */
export function lineOut(state) { return typeof state === 'string' && !LINE_FREE_STATES.has(state); }
/** May a level-up pick open as a modal now? Never while moving, with a line out or during the ceremony. */
export function mayOpenModal({ line = false, moving = false, cinematic = false } = {}) { return !line && !moving && !cinematic; }

/**
 * Fish XP in this mode when progression did not apply it (`opts.modeApplied`): Still × 1.4 with no zone factor.
 * `n` is v1's fishXpFor(rarity, zoneIndex) × multipliers; the zone factor is divided back out exactly.
 */
export function fishXpForMode(n, { mode, B, data, rarity = 'common', zoneIndex = 0 } = {}) {
  const X = modeCfg(mode, B)?.xp;
  if (!X || !(n > 0)) return n;
  let v = n * num(X.fishMult, 1);
  if (X.zoneFactor === false && zoneIndex > 0 && typeof data?.fishXpFor === 'function') {
    const withZone = data.fishXpFor(rarity, zoneIndex), flat = data.fishXpFor(rarity, 0);
    if (withZone > 0 && flat > 0) v *= flat / withZone;
  }
  return Math.max(1, Math.round(v));
}
/**
 * Discovery XP with the daily cap (xpModes.discovery: species 2, place 4, classFirst 2, ≤ 12 a day). Shares progression's
 * log (`run.flags.discoveryXp = {day, n}`) so the cap holds across both modules. Returns the XP granted (mutates the log).
 */
export function discoveryXp(kind, run, B) {
  const DISC = B?.xpModes?.discovery;
  if (!DISC || !run) return 0;
  const want = num(DISC[kind], 0);
  if (!(want > 0)) return 0;
  run.flags = run.flags || {};
  const day = run.day || 1;
  const log = run.flags.discoveryXp?.day === day ? run.flags.discoveryXp : (run.flags.discoveryXp = { day, n: 0 });
  const got = Math.max(0, Math.min(want, num(DISC.dailyCap, 12) - num(log.n, 0)));
  log.n = num(log.n, 0) + got;
  return got;
}
