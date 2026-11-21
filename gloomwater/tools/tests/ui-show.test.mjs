// Unit tests for the ui's side of the show (docs/v3/show/SPEC.md §2.9, §2.10): src/ui-measure.js, which after the measuring
// overlay's retirement keeps one duty: it knows when the show holds the screen (from the fish breaking the surface until the
// catch card), so ui.js keeps the HUD, toasts, tips, banners and every modal off the picture, and where the card unfolds from.
//   node tools/tests/ui-show.test.mjs   (or node tools/check.mjs)
import { createBus } from '../../src/core.js';
import { createMeasure } from '../../src/ui-measure.js';

let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg); } }
const section = (s) => console.log(`- ${s}`);
if (typeof globalThis.performance === 'undefined') globalThis.performance = { now: () => Date.now() };

function make({ v3 = true } = {}) {
  const bus = createBus();
  const ctx = { bus, fishing: { view: { show: null, measure: null }, hurried: 0, hurryShow() { this.hurried++; return !!this.view.show && this.view.show.phase !== 'card'; } } };
  const D = { V3_ENABLED: v3 };
  return { ctx, bus, M: createMeasure({ ctx, D: () => D }) };
}

section('the show holds the screen from T0 until its card');
{
  const { ctx, M } = make();
  ok(M.holding() === false && M.active() === false && M.phase() === null && M.debug() === null, 'no show: nothing held');
  for (const phase of ['reveal', 'lift', 'hold', 'pause']) {
    ctx.fishing.view.show = { phase, cls: 'keeper' };
    ok(M.holding() === true && M.active() === true && M.phase() === phase, `${phase}: the screen is the show's (the card, pickers, toasts, tips and banners wait; the HUD is off the picture)`);
  }
  ctx.fishing.view.show = { phase: 'card', cls: 'keeper' };
  ok(M.holding() === false && M.phase() === 'card', 'card: the card may open; the HUD comes back behind it');
  ctx.fishing.view.show = null;
  ok(M.holding() === false, 'the card closed: nothing held');
  ctx.fishing.view.show = 'nonsense';
  ok(M.holding() === false, 'a malformed view never holds the screen');
  ctx.fishing = { isStub: true, view: { show: { phase: 'hold' } } };
  ok(M.holding() === false, 'a stub fishing never holds the screen');
}

section('a tap on the picture hurries the show; the overlay\'s old calls do nothing');
{
  const { ctx, M } = make();
  ok(M.skip() === false && ctx.fishing.hurried === 1, 'no show: skip() asks fishing and answers false');
  ctx.fishing.view.show = { phase: 'hold' };
  ok(M.skip() === true && ctx.fishing.hurried === 2, 'in the show: fishing.hurryShow()');
  ok(M.show({ phase: 'scoop' }) === undefined && M.onMeasured({ length: 30, speciesId: 'x' }) === undefined && M.onLanded({}) === undefined && M.holding() === true, 'showMeasure / onMeasured / onLanded are no-ops (the overlay is retired)');
}

section('the card unfolds from where the fish is held (fishing:show {phase: \'card\', origin})');
{
  const { bus, M } = make();
  ok(M.takeOrigin() === null, 'no show: the card opens from the centre');
  bus.emit('fishing:show', { phase: 'card', origin: { x: 480, y: 300 }, uid: 'f1' });
  ok(M.takeOrigin('other') === null, 'another fish\'s card does not take it');
  bus.emit('fishing:show', { phase: 'card', origin: { x: 480, y: 300 }, uid: 'f1' });
  const o = M.takeOrigin('f1');
  ok(o && o.x === 480 && o.y === 300 && M.takeOrigin('f1') === null, 'its own card takes it, once');
  bus.emit('fishing:show', { phase: 'card', origin: { x: 10, y: 20 }, uid: 'f2' });
  bus.emit('fishing:show', { phase: 'lift', uid: 'f3' });
  ok(M.takeOrigin('f2') === null, 'a new show clears a stale origin');
  bus.emit('fishing:show', { phase: 'card', origin: null, uid: 'f4' });
  ok(M.takeOrigin('f4') === null, 'no origin (no camera): the centre');
  bus.emit('fishing:show', { phase: 'card', origin: { x: NaN, y: 2 }, uid: 'f5' });
  ok(M.takeOrigin('f5') === null, 'a broken origin is dropped');
  bus.emit('fishing:show', { phase: 'card', origin: { x: 1, y: 2 }, uid: 'f6' });
  M.reset();
  ok(M.takeOrigin('f6') === null, 'reset (run over) clears it');
}

section('flag off: there is no show');
{
  const { ctx, M } = make({ v3: false });
  ctx.fishing.view.show = { phase: 'hold' };
  ok(M.holding() === false && M.phase() === null, 'v1: never held');
}

console.log(`\nui-show: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
