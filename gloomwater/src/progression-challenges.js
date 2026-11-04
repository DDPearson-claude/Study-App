// progression-challenges.js — Trials of the Wick (DESIGN §12), unlock keys, the five
// Wicks (§11), the Shrine's Relics (§17.2) and Waystones (§17.3).
// Helper of progression.js only: it receives the shared internals object `S` and never
// touches another gameplay module except through S / ctx with optional chaining.

const KIND_LABEL = { character: 'New Wick', boon: 'New Boon', relic: 'Relic revealed', bait: 'New Bait', perk: 'Journal perk' };

export function createChallenges(S) {
  const { ctx } = S;
  const D = () => ctx.data || {};
  const meta = () => ctx.state.meta;
  const run = () => ctx.state.run;

  let byTypeCache = null;
  let byTypeSrc = null;
  function list() { return D().CHALLENGES || []; }
  function ofType(type) {
    const src = list();
    if (byTypeSrc !== src) {
      byTypeSrc = src;
      byTypeCache = {};
      for (const c of src) (byTypeCache[c.type] || (byTypeCache[c.type] = [])).push(c);
    }
    return byTypeCache[type] || [];
  }
  const challengeById = (id) => D().CHALLENGE_BY_ID?.[id] || list().find((c) => c.id === id) || null;

  function ensureMeta() {
    const m = meta();
    if (!m) return null;
    m.challenges = m.challenges || {};
    m.challengeProgress = m.challengeProgress || {};
    m.unlocks = m.unlocks || {};
    return m;
  }
  function runCh() {
    const r = run();
    if (!r) return null;
    r.flags = r.flags || {};
    return (r.flags.ch = r.flags.ch || {});
  }

  // ---------------------------------------------------------------- progress model
  function journalCount() {
    const j = meta()?.journal || {};
    let n = 0;
    for (const k in j) if ((j[k]?.caught || 0) > 0) n++;
    return n;
  }
  function boonMaxLevel(kind) {
    const r = run();
    let best = 0;
    for (const id in r?.boons || {}) {
      const b = S.boon(id);
      if (!b || (kind && b.kind !== kind)) continue;
      best = Math.max(best, r.boons[id] | 0);
    }
    return best;
  }
  function kindledCount() {
    const r = run();
    let n = 0;
    for (const id in r?.boons || {}) {
      const b = S.boon(id);
      if (b?.kind === 'weapon' && (r.boons[id] | 0) > (b.maxLevel ?? 5)) n++;
    }
    return n;
  }
  /** Counter-type challenges live in run.flags.ch (run scope) or meta.challengeProgress (total). */
  function counterGet(c) {
    if (c.scope === 'run') return runCh()?.[c.id] || 0;
    return ensureMeta()?.challengeProgress[c.id] || 0;
  }
  function counterBump(c, n = 1) {
    if (meta()?.challenges?.[c.id]) return;
    if (c.scope === 'run') { const ch = runCh(); if (ch) ch[c.id] = (ch[c.id] || 0) + n; return; }
    const m = ensureMeta();
    if (m) m.challengeProgress[c.id] = (m.challengeProgress[c.id] || 0) + n;
  }
  function setKey(c, sub) {
    const m = ensureMeta();
    if (m) m.challengeProgress[`${c.id}:${sub}`] = 1;
  }
  function setCount(c) {
    const cp = meta()?.challengeProgress || {};
    const pre = `${c.id}:`;
    let n = 0;
    for (const k in cp) if (k.startsWith(pre) && cp[k]) n++;
    return n;
  }

  /** Live {progress, target} of a challenge (run-scope ones fall back to the best run). */
  function progressOf(c) {
    const p = c.params || {};
    const r = run();
    const m = meta() || {};
    const best = m.challengeProgress?.[c.id] || 0;
    const target = Math.max(1, p.n ?? (c.type === 'boonLevel' ? p.level ?? 5 : 1));
    if (c.scope === 'run' && !r && !COUNTER.has(c.type)) return { progress: best, target };
    let progress = 0;
    switch (c.type) {
      case 'catch': progress = c.scope === 'run' ? r?.stats?.fishCaught || 0 : m.totalFish || 0; break;
      case 'journal': progress = journalCount(); break;
      case 'nights': progress = Math.max(r?.flags?.nights || 0, r?.stats?.nightsSurvived || 0); break;
      case 'level': progress = Math.max(r?.level || 1, r?.flags?.maxLevel || 0); break;
      case 'slay': progress = c.scope === 'run' ? S.runSlain() : m.totalSlain || 0; break;
      case 'slayNight': progress = Math.max(r?.flags?.maxNightSlain || 0, r?.flags?.nightSlain || 0); break;
      case 'nightCatch': progress = Math.max(r?.flags?.maxNightCatch || 0, r?.flags?.nightCatch || 0); break;
      case 'perfectHooks': progress = Math.max(r?.flags?.perfectHooks || 0, r?.stats?.perfectHooks || 0); break;
      case 'shells': progress = r?.stats?.shellsEarned || 0; break;
      case 'boonLevel': progress = boonMaxLevel(p.kind); break;
      case 'kindle': progress = Math.max(kindledCount(), counterGet(c)); break;
      case 'reachZone': progress = (m.deepestZone || 0) >= S.zoneIndexOf(p.zone) ? 1 : 0; break;
      case 'bossDistinct': return { progress: setCount(c), target: Math.max(1, (p.ids || []).length) };
      case 'reachZoneCharacters': progress = setCount(c); break;
      default: progress = counterGet(c); // slayElite, boss, quality, weight, victory, nightNoDamage …
    }
    if (c.scope === 'run' && !r) progress = best;
    return { progress, target };
  }
  const COUNTER = new Set(['slayElite', 'boss', 'quality', 'weight', 'victory', 'nightNoDamage']);

  // ---------------------------------------------------------------- evaluation
  function evaluate(types = null) {
    const m = ensureMeta();
    if (!m) return [];
    const r = run();
    const done = [];
    const pool = types ? types.flatMap((t) => ofType(t)) : list();
    for (const c of pool) {
      if (m.challenges[c.id]) continue;
      if (c.scope === 'run' && !r) continue;
      const { progress, target } = progressOf(c);
      if (c.scope === 'run') {
        if (!COUNTER.has(c.type) && c.type !== 'kindle') { const ch = runCh(); if (ch) ch[c.id] = progress; }
        m.challengeProgress[c.id] = Math.max(m.challengeProgress[c.id] || 0, progress);
      } else if (!COUNTER.has(c.type)) {
        m.challengeProgress[c.id] = progress;
      }
      if (progress >= target && complete(c.id)) done.push(c);
    }
    return done;
  }

  function complete(id, { silent = false } = {}) {
    const c = challengeById(id);
    const m = ensureMeta();
    if (!c || !m || m.challenges[c.id]) return false;
    m.challenges[c.id] = true;
    const { target } = progressOf(c);
    if (c.scope !== 'run' || (m.challengeProgress[c.id] || 0) < target) m.challengeProgress[c.id] = Math.max(m.challengeProgress[c.id] || 0, target);
    const mem = c.reward?.memories | 0;
    if (mem > 0) S.addMemories(mem, 'challenge');
    const r = run();
    if (r) { r.flags = r.flags || {}; (r.flags.challengesDone = r.flags.challengesDone || []).push(c.id); }
    ctx.bus.emit('challenge:complete', { challenge: c });
    const key = c.reward?.unlock || null;
    let label = '';
    if (key) {
      m.unlocks[key] = true;
      label = unlockLabel(key);
      ctx.bus.emit('unlock', { key, label, kind: key.split(':')[0], text: unlockText(key) });
    }
    if (!silent) {
      const bits = [`Trial complete: ${c.name}`];
      if (mem > 0) bits.push(`+${mem} Memories`);
      if (key) bits.push(unlockText(key));
      S.toast(bits.join(' · '), 'good');
    }
    S.invalidate();
    S.requestSave();
    return true;
  }

  // ---------------------------------------------------------------- bus-driven hooks
  // (progression.js routes bus events here; counters first, then evaluation)
  const hooks = {
    fish(fish, species) {
      for (const c of ofType('quality')) if (fish.quality === (c.params?.quality || 'perfect')) counterBump(c);
      for (const c of ofType('weight')) {
        const p = c.params || {};
        if (p.excludeLegendary && species?.rarity === 'legendary') continue;
        if ((fish.weight || 0) > (p.kg ?? 8)) counterBump(c);
      }
      evaluate(['catch', 'journal', 'quality', 'weight', 'nightCatch', 'level']);
    },
    elite() { for (const c of ofType('slayElite')) counterBump(c); evaluate(['slayElite']); },
    slain() { evaluate(['slay', 'slayNight']); },
    boss(wardenId) {
      for (const c of ofType('boss')) counterBump(c);
      for (const c of ofType('bossDistinct')) if (wardenId && (c.params?.ids || []).includes(wardenId)) setKey(c, wardenId);
      evaluate(['boss', 'bossDistinct']);
    },
    dawn({ damaged, day }) {
      for (const c of ofType('nightNoDamage')) if (!damaged && day >= (c.params?.minDay ?? 1)) counterBump(c);
      evaluate(['nights', 'nightNoDamage', 'slayNight']);
    },
    zone(zoneId, character) {
      const zi = S.zoneIndexOf(zoneId);
      for (const c of ofType('reachZoneCharacters')) if (character && zi >= S.zoneIndexOf(c.params?.zone)) setKey(c, character);
      evaluate(['reachZone', 'reachZoneCharacters']);
    },
    boon(boonId, level) {
      const b = S.boon(boonId);
      const kindled = level > (b?.maxLevel ?? 5) && (b?.kind === 'weapon' || !b);
      if (kindled) for (const c of ofType('kindle')) counterBump(c);
      evaluate(['boonLevel', 'kindle']);
    },
    victory() { for (const c of ofType('victory')) counterBump(c); evaluate(['victory']); },
  };

  // ---------------------------------------------------------------- unlock keys
  function isUnlocked(key) {
    if (!key) return true;
    const m = meta() || {};
    if (m.unlocks?.[key] === true) return true;
    const [kind, id] = String(key).split(':');
    let def = null;
    if (kind === 'character') def = S.character(id);
    else if (kind === 'boon') def = S.boon(id);
    else if (kind === 'relic') return relicRevealed(S.relic(id));
    else if (kind === 'bait') def = S.bait(id);
    else return !!m.unlocks?.[key];
    if (!def) return false;
    return !def.unlock || !!m.challenges?.[def.unlock];
  }
  function unlockLabel(key) {
    const [kind, id] = String(key).split(':');
    const def = kind === 'character' ? S.character(id) : kind === 'boon' ? S.boon(id)
      : kind === 'relic' ? S.relic(id) : kind === 'bait' ? S.bait(id)
        : kind === 'perk' ? D().JOURNAL_PERKS?.[id] : null;
    return def?.name || def?.label || id || key;
  }
  function unlockText(key) {
    const kind = String(key).split(':')[0];
    return `${KIND_LABEL[kind] || 'Unlocked'}: ${unlockLabel(key)}`;
  }
  function rewardText(c) {
    const bits = [];
    if (c.reward?.unlock) bits.push(unlockText(c.reward.unlock));
    if (c.reward?.memories) bits.push(`${c.reward.memories} Memories`);
    return bits.join(' + ');
  }
  function lockReason(challengeId) {
    const c = challengeById(challengeId);
    if (!c) return 'Locked';
    const { progress, target } = progressOf(c);
    const prog = target > 1 ? ` (${Math.min(progress, target)}/${target})` : '';
    return `Unlocked by: ${c.name} — ${c.desc}${prog}`;
  }

  /** "Unlocked by: <trial> — <goal> (p/t)" for any locked 'character:' / 'boon:' / 'relic:' / 'bait:' key. */
  function getLockReason(key) {
    if (isUnlocked(key)) return '';
    const [kind, id] = String(key).split(':');
    const def = kind === 'character' ? S.character(id) : kind === 'boon' ? S.boon(id) : kind === 'bait' ? S.bait(id) : kind === 'relic' ? S.relic(id) : null;
    if (kind === 'relic' && def) return revealText(def);
    if (def?.unlock) return lockReason(def.unlock);
    const owner = list().find((c) => c.reward?.unlock === key);
    return owner ? lockReason(owner.id) : 'Locked';
  }

  // ---------------------------------------------------------------- lists for the UI
  function getChallenges() {
    const m = meta() || {};
    const tiers = D().TEXT?.challengeTiers || {};
    return list().map((c) => {
      const done = !!m.challenges?.[c.id];
      const { progress, target } = progressOf(c);
      return {
        ...c, done, progress: done ? target : Math.min(progress, target), target,
        tierName: tiers[c.tier] || '', rewardText: rewardText(c),
        rewardLabel: c.reward?.unlock ? unlockLabel(c.reward.unlock) : null,
      };
    });
  }
  function getCharacters() {
    return (D().CHARACTERS || []).map((ch) => {
      const unlocked = !ch.unlock || isUnlocked(`character:${ch.id}`);
      const c = ch.unlock ? challengeById(ch.unlock) : null;
      const pr = c ? progressOf(c) : null;
      return {
        ...ch, unlocked, reason: unlocked ? '' : lockReason(ch.unlock),
        challenge: c ? { id: c.id, name: c.name, desc: c.desc, progress: Math.min(pr.progress, pr.target), target: pr.target } : null,
      };
    });
  }

  // ---------------------------------------------------------------- relics
  const relicLevel = (id) => meta()?.relics?.[id] | 0;
  function parseSpecial(r) {
    if (!r?.special) return null;
    const s = String(r.special);
    const i = s.indexOf(':');
    if (i < 0) return { key: s, value: 1, raw: s };
    const v = s.slice(i + 1);
    const num = Number(v);
    return { key: s.slice(0, i), value: Number.isFinite(num) ? num : v, raw: s };
  }
  /** Σ special value × level for numeric specials (startShells, shimmer, memMult); level for flags. */
  function specialSum(key) {
    let sum = 0;
    for (const r of D().RELICS || []) {
      const sp = parseSpecial(r);
      if (!sp || sp.key !== key) continue;
      const lvl = relicLevel(r.id);
      if (!lvl) continue;
      sum += typeof sp.value === 'number' ? sp.value * lvl : lvl;
    }
    return sum;
  }
  function relicRevealed(r) {
    if (!r) return false;
    const m = meta() || {};
    if (relicLevel(r.id) > 0) return true;
    if (m.unlocks?.[`relic:${r.id}`]) return true;
    if (r.unlock) return !!m.challenges?.[r.unlock];
    const q = r.requires;
    if (!q) return true;
    if (q.bestDay != null && (m.bestDay || 0) < q.bestDay) return false;
    if (q.runs != null && (m.runs || 0) < q.runs) return false;
    if (q.deepestZone != null && (m.deepestZone || 0) < q.deepestZone) return false;
    if (q.bestLevel != null && (m.bestLevel || 0) < q.bestLevel) return false;
    return true;
  }
  function revealText(r) {
    if (r.unlock) {
      const c = challengeById(r.unlock);
      return c ? `Revealed by: ${c.name} — ${c.desc}` : 'Hidden';
    }
    const q = r.requires || {};
    const zones = D().ZONES || [];
    if (q.deepestZone != null) return `Revealed when you reach ${zones[q.deepestZone]?.name || 'deeper water'}.`;
    if (q.bestDay != null) return `Revealed when a Wick sees Day ${q.bestDay}.`;
    if (q.runs != null) return `Revealed after ${q.runs} descents.`;
    if (q.bestLevel != null) return `Revealed when your flame reaches level ${q.bestLevel}.`;
    return 'Hidden';
  }
  function getRelics() {
    const m = meta() || {};
    const memories = m.memories || 0;
    return (D().RELICS || []).map((r) => {
      const level = relicLevel(r.id);
      const maxLevel = r.maxLevel ?? (r.costs?.length || 1);
      const maxed = level >= maxLevel;
      const revealed = relicRevealed(r);
      const nextCost = maxed ? 0 : (r.costs?.[level] ?? 0);
      let reason = '';
      if (!revealed) reason = revealText(r);
      else if (maxed) reason = 'Fully relit';
      else if (memories < nextCost) reason = `Needs ${nextCost - memories} more Memories`;
      const sp = parseSpecial(r);
      return {
        ...r, level, maxLevel, maxed, revealed, nextCost,
        canBuy: revealed && !maxed && memories >= nextCost, reason,
        effectText: S.effectText(r.effects) || '',
        specialKey: sp?.key || null,
      };
    });
  }
  function buyRelic(id) {
    const r = S.relic(id);
    const m = meta();
    if (!r || !m) return { ok: false, msg: 'No such relic.' };
    const level = relicLevel(r.id);
    const maxLevel = r.maxLevel ?? (r.costs?.length || 1);
    if (!relicRevealed(r)) return { ok: false, msg: revealText(r) };
    if (level >= maxLevel) return { ok: false, msg: 'This lantern already burns as bright as it can.' };
    const cost = r.costs?.[level] ?? 0;
    if ((m.memories || 0) < cost) return { ok: false, msg: `Needs ${cost - (m.memories || 0)} more Memories.` };
    m.memories = (m.memories || 0) - cost;
    m.relics = m.relics || {};
    m.relics[r.id] = level + 1;
    S.invalidate();
    ctx.bus.emit('relic:buy', { relicId: r.id, level: level + 1, relic: r });
    return { ok: true, msg: `${r.name} relights${maxLevel > 1 ? ` (${toRoman(level + 1)})` : ''}.`, level: level + 1 };
  }

  // ---------------------------------------------------------------- waystones
  function waystoneOwned(zoneId) {
    for (const r of D().RELICS || []) {
      const sp = parseSpecial(r);
      if (sp?.key === 'waystone' && sp.value === zoneId && relicLevel(r.id) > 0) return true;
    }
    return false;
  }
  function getWaystones() {
    const zones = D().ZONES || [];
    const deepest = meta()?.deepestZone || 0;
    const out = [];
    for (const z of zones) {
      const i = z.index ?? zones.indexOf(z);
      if (i === 0) out.push(z.id);
      else if (i <= deepest && waystoneOwned(z.id)) out.push(z.id);
    }
    if (!out.length && zones[0]) out.push(zones[0].id);
    return out;
  }

  return {
    evaluate, complete, hooks, progressOf, isUnlocked, unlockLabel, unlockText, lockReason, getLockReason,
    getChallenges, getCharacters, challengeById,
    getRelics, buyRelic, relicLevel, relicRevealed, specialSum, parseSpecial, getWaystones, waystoneOwned,
  };
}

function toRoman(n) { return ['', 'I', 'II', 'III', 'IV', 'V', 'VI'][n] || String(n); }
