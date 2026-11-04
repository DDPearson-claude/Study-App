// ui.js — BASELINE (integrator). Minimal debug HUD; the ui author replaces it.
export function create(ctx) {
  const root = document.getElementById('ui');
  const hud = document.createElement('div');
  hud.style.cssText = 'position:absolute;left:12px;top:10px;font:14px Georgia,serif;color:#e8f1f2;text-shadow:0 1px 2px #000;white-space:pre';
  root.appendChild(hud);
  let acc = 0;
  return {
    init() {},
    update(dt) {
      acc += dt; if (acc < 0.2) return; acc = 0;
      const r = ctx.state.run;
      hud.textContent = r ? `Day ${r.day} · ${r.phase}\nHP ${r.hp}  Oil ${r.oil.toFixed(0)}  Food ${r.satiety.toFixed(0)}\nShells ${r.shells}  Fishing: ${ctx.fishing.state}` : `flow: ${ctx.flow}`;
    },
    isBlocking() { return false; }, isShopOpen() { return false; }, handleKey() { return false; },
    showTitle() {}, showDeath() {}, showVictory() {}, openShop() {}, openCreel() {}, openJournal() {}, openShrine() {}, openSettings() {}, openPause() {}, closeAll() {},
    showCatch() {}, toast() {}, floatText() {}, banner() {},
  };
}
