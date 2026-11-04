// survival.js — BASELINE (integrator). Phase clock and simple drains; the survival author replaces it.
const ORDER = ['calm', 'dusk', 'gloomtide', 'dawn'];

export function create(ctx) {
  const P = () => ctx.data.BALANCE?.phases || { calm: 150, dusk: 15, gloomtide: 75, dawn: 10 };
  const stats = () => { const s = ctx.progression.getStats?.(); return s && !s.isStub ? s : { maxHp: 5, maxOil: 100, maxSatiety: 100, oilDrain: 0.4, satietyDrain: 0.3, lightRadius: 9 }; };
  function info() {
    const run = ctx.state.run; const phase = run?.phase || 'calm'; const duration = P()[phase] || 60; const time = run?.phaseTime || 0;
    return { phase, day: run?.day || 1, time, duration, k: Math.min(1, time / duration), isNight: phase === 'gloomtide', nextPhase: ORDER[(ORDER.indexOf(phase) + 1) % 4] };
  }
  return {
    enemies: [],
    init() {},
    update(dt) {
      const run = ctx.state.run; if (!run || !dt) return;
      const s = stats();
      run.phaseTime += dt;
      const dur = P()[run.phase] || 60;
      if (run.phaseTime >= dur) {
        const prev = run.phase; const i = (ORDER.indexOf(prev) + 1) % 4; run.phase = ORDER[i]; run.phaseTime = 0;
        if (run.phase === 'calm') { run.day++; ctx.bus.emit('day:start', { day: run.day }); }
        ctx.bus.emit('phase:change', { phase: run.phase, prev, day: run.day });
      }
      run.oil = Math.max(0, run.oil - s.oilDrain * dt * (run.phase === 'gloomtide' ? 1.6 : 1));
      run.satiety = Math.max(0, run.satiety - s.satietyDrain * dt);
      ctx.actors.setLanternLevel?.(run.oil / s.maxOil);
      ctx.actors.setLightRadius?.(s.lightRadius);
      ctx.actors.setVitality?.(run.hp / s.maxHp);
    },
    getPhaseInfo: info,
    damage(n) { const r = ctx.state.run; if (!r) return; r.hp -= n; ctx.bus.emit('player:damage', { amount: n, source: 'baseline' }); if (r.hp <= 0) ctx.bus.emit('player:died', { cause: 'gloom' }); },
    heal(n) { const r = ctx.state.run; if (r) r.hp = Math.min(stats().maxHp, r.hp + n); },
    addOil(n) { const r = ctx.state.run; if (r) r.oil = Math.min(stats().maxOil, r.oil + n); },
    addSatiety(n) { const r = ctx.state.run; if (r) r.satiety = Math.min(stats().maxSatiety, r.satiety + n); },
    flare() { return false; },
    onPointerDown() { return false; },
  };
}
