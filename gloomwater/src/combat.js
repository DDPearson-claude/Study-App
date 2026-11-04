// combat.js — BASELINE (integrator). Inert; the combat author replaces it.
export function create(ctx) {
  return {
    enemies: [],
    pendingOptions: null,
    get level() { return ctx.state.run?.level || 1; },
    get xp() { return ctx.state.run?.xp || 0; },
    get xpNext() { return ctx.state.run?.xpNext || 10; },
    init() {}, update() {},
    onPointerDown() { return false; },
    flare() { return false; }, flareReady() { return 1; },
    addXp() {}, chooseBoon() {}, reroll() { return null; },
    getBoons() { return []; }, killAll() {},
  };
}
