// progression.js — BASELINE (integrator). Stats from data.STATS bases, fresh runs,
// simple fish creation. The progression author replaces it.
import { uid } from './core.js';

export function create(ctx) {
  const D = () => ctx.data;
  function getStats(run = ctx.state.run) {
    const out = {};
    for (const [k, def] of Object.entries(D().STATS || {})) out[k] = def.base;
    const add = (effects, lvl) => { for (const [k, v] of Object.entries(effects || {})) if (k in out) out[k] += v * lvl; };
    for (const u of D().UPGRADES || []) add(u.effects, run?.upgrades?.[u.id] || 0);
    for (const r of D().RELICS || []) add(r.effects, ctx.state.meta.relics?.[r.id] || 0);
    return out;
  }
  function createRun({ startZone = 'mossmere' } = {}) {
    const s = getStats({ upgrades: {} });
    return {
      active: true, id: uid('run'), seed: (Math.random() * 1e9) | 0, playTime: 0,
      day: 1, phase: 'calm', phaseTime: 0, zone: startZone, zonesUnlocked: [startZone],
      hp: s.maxHp ?? 5, oil: s.maxOil ?? 100, satiety: s.maxSatiety ?? 100,
      shells: 0, bait: {}, equippedBait: null, creel: [], upgrades: {}, legendaries: {}, bounties: [],
      stats: { fishCaught: 0, fishLost: 0, perfectHooks: 0, enemiesSlain: 0, shellsEarned: 0, biggest: null, newSpecies: 0, damageTaken: 0 },
      flags: {},
    };
  }
  function makeFish(speciesId, weight, quality = 'normal') {
    const sp = (D().SPECIES || []).find((s) => s.id === speciesId) || {};
    return { uid: uid('fish'), speciesId, weight, quality, value: sp.value ?? 5, food: sp.food ?? 10, oil: sp.oil ?? 10, caughtDay: ctx.state.run?.day ?? 1 };
  }
  return {
    init() {
      ctx.bus.on('fishing:caught', ({ speciesId, weight, quality }) => {
        const run = ctx.state.run; if (!run) return;
        const fish = makeFish(speciesId, weight, quality);
        run.stats.fishCaught++;
        const species = (D().SPECIES || []).find((s) => s.id === speciesId);
        ctx.bus.emit('fish:landed', { fish, isNew: false, isRecord: false, species });
      });
    },
    update() {},
    getStats, createRun, makeFish,
    summarizeRun(cause) { const r = ctx.state.run || {}; return { cause, day: r.day, zone: r.zone, fishCaught: r.stats?.fishCaught || 0, shellsEarned: 0, newSpecies: 0, enemiesSlain: 0, legendaries: 0, memories: 0, breakdown: [], records: [] }; },
    addToCreel(fish) { const r = ctx.state.run; if (!r || r.creel.length >= getStats().creelSize) return false; r.creel.push(fish); return true; },
    removeFromCreel(id) { const r = ctx.state.run; const i = r?.creel.findIndex((f) => f.uid === id); return i >= 0 ? r.creel.splice(i, 1)[0] : null; },
    fishAction() { return { ok: true, msg: '', gained: {} }; },
    canShop() { return false; },
    shop: { getItems: () => [], buy: () => ({ ok: false, msg: 'baseline' }) },
    getZones: () => (D().ZONES || []).map((z) => ({ ...z, unlocked: z.index === 0, current: z.id === ctx.state.run?.zone, canTravel: false, reason: '' })),
    travel: () => ({ ok: false, msg: 'baseline' }),
    getJournal: () => (D().SPECIES || []).map((s) => ({ species: s, discovered: !!ctx.state.meta.journal?.[s.id], caught: 0, biggest: 0 })),
    getBounties: () => [],
    getRelics: () => (D().RELICS || []).map((r) => ({ ...r, level: 0, nextCost: r.costs?.[0] ?? 0, canBuy: false, maxed: false })),
    buyRelic: () => ({ ok: false, msg: 'baseline' }),
    getWaystones: () => ['mossmere'],
    equipBait: () => ({ ok: false, msg: 'baseline' }),
    getEquippedBait: () => null,
    consumeBait: () => null,
  };
}
