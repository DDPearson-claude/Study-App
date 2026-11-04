// fishing.js — BASELINE (integrator). Idle-only; the fishing author replaces it.
export function create(ctx) {
  return {
    state: 'idle',
    view: { charge: 0, castDist: 0, aim: 0, tension: 0, sweetMin: 0.4, sweetMax: 0.6, danger: false, progress: 0, surge: false, surgeWarn: 0, stamina: 1, biteWindow: 0, speciesId: null, rarity: null, hint: '' },
    bobberPos: null,
    spots: [],
    init() {}, update() {},
    onPointerDown() {}, onPointerMove() {}, onPointerUp() {}, cancel() {},
    isBusy() { return false; },
  };
}
