// The catch card's name never runs past its column (src/ui-screens.js fitCatchName; the user's play-test of 2026-11-16:
// "Bridgechain" cut at the card's edge on a near-square phone). A fake element whose widest word grows with its font size:
// the type steps down 2 px at a time until the word fits, never below 20 px, and only past that floor may the word break.
//   node tools/tests/catch-name-fit.test.mjs   (or node tools/check.mjs)
import { fitCatchName, nameOverflow } from '../../src/ui-screens.js';

let pass = 0, fail = 0;
function ok(cond, msg, extra) { if (cond) pass++; else { fail++; console.log('  FAIL:', msg, extra !== undefined ? JSON.stringify(extra) : ''); } }

const BASE = 54;
globalThis.getComputedStyle = (el) => (el.__cs ? el.__cs : { fontSize: el.style.fontSize || `${BASE}px` });
// a name whose longest word is k em wide, in a column cw px wide
const mk = (cw, k, connected = true) => {
  const style = { fontSize: '', overflowWrap: '' };
  return { isConnected: connected, style, clientWidth: cw, get scrollWidth() { return Math.max(cw, Math.round((parseFloat(style.fontSize) || BASE) * k)); } };
};
const fit = (el) => { fitCatchName({ querySelector: (sel) => (sel === '.gw-catch-name' ? el : null) }, null); return el.style; };

{
  const s = fit(mk(300, 6));   // 54 px → 324 px wide: two steps down
  ok(s.fontSize === '50px' && !s.overflowWrap, 'a word too wide steps the type down until it fits (54 → 50 px), unbroken', s);
}
{
  const s = fit(mk(400, 6));
  ok(s.fontSize === '' && !s.overflowWrap, 'a name that fits keeps the card\'s own size', s);
}
{
  const s = fit(mk(100, 6));
  ok(s.fontSize === '20px' && s.overflowWrap === 'anywhere', 'never below 20 px; past the floor the word may break rather than be cut', s);
}
{
  const s = fit(mk(0, 6));
  ok(s.fontSize === '' && !s.overflowWrap, 'a card not yet laid out is left alone (it is measured again on the next frame)', s);
}
{
  const s = fit(mk(300, 6, false));
  ok(s.fontSize === '', 'a card off the page is left alone', s);
}
{
  const el = mk(300, 6); fit(el); el.clientWidth = 600; fit(el);
  ok(el.style.fontSize === '' && !el.style.overflowWrap, 'measured again on a wider card, the name goes back to its own size', el.style);
}
{
  ok(fitCatchName(null, null) === undefined && fitCatchName({ querySelector: () => null }, null) === undefined, 'no card or no name: nothing happens');
}

// the card's own edge (a column wider than the card can hold): the name's box is wide enough, but its words run past the card's
// inner edge; with the card still scaled by its rise (a transform), the overflow is measured in the card's own px
for (const scale of [1, 0.5]) {
  const el = mk(400, 6);
  el.__x0 = 60;   // the name's left edge inside the card, card px
  const pn = { offsetWidth: 370, __cs: { paddingRight: '20px' }, getBoundingClientRect: () => ({ width: 370 * scale, right: 370 * scale }) };
  globalThis.document = { createRange: () => {
    let node = null;
    return { selectNodeContents: (n) => { node = n; }, getClientRects: () => {
      const fs = parseFloat(node.style.fontSize) || BASE;
      return [{ width: fs * 6 * scale, right: (node.__x0 + fs * 6) * scale }];
    } };
  } };
  ok(Math.round(nameOverflow(el, pn)) === 34, `scale ${scale}: the overflow past the card's inner edge is measured in card px (60 + 324 - 350 = 34)`, nameOverflow(el, pn));
  fitCatchName({ querySelector: () => el }, null);
  ok(el.style.fontSize === '', `scale ${scale}: without the card, the name's own box (400 px) holds it`, el.style);
  fitCatchName({ querySelector: () => el }, pn);
  ok(el.style.fontSize === '48px' && !el.style.overflowWrap, `scale ${scale}: with the card, the type steps down until the word ends inside the card's inner edge (54 → 48 px)`, el.style);
  delete globalThis.document;
}

console.log(`catch-name-fit: ${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
