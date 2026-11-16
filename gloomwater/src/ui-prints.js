// ui-prints.js — M1 step 5b (lane 5b-home): the ink prints on screen (docs/loop/SPEC.md §6.3, §6.4, §8.8; M1.md §2.6, §2.8, §4 step 5b).
// Built only under the loop (ui-loop and ui-screens call it there). Drowned Filigree: ink on a feathered pool of night, no boxes;
// the one warm light the candles under the frames. Every word is a name, a weight (pounds), a length in cm (the print's small line,
// SPEC §6.4), a place or water name or "Evening N"; never a number of odds.
//
//   renderPrintsPage({h, content, view, phone, D, onPick})   the Journal's Prints page (printsView's cards), into `content`
//   createGalleryView({K, D, loop, report})                  the cabin's gallery behind [data-tile=wall]: wing I's frames at true size
//                                                            along the port wall, each on its painted ruler with a candle under it, the
//                                                            giants in gold frames; Back (or Escape, or the scrim) returns home
//   GALLERY_SCALE                                            px a cm (desktop, phone): one scale for every frame, so they read true
import { drawFishInk } from './ui-fishart.js';
import { sealSvg } from './ui-icons.js';

const arr = (v) => (Array.isArray(v) ? v : []);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const GALLERY_SCALE = Object.freeze({ desktop: 2.6, phone: 1.7 });
const SEAL = { prize: 'inkStamp', trophy: 'oxbloodWax', elder: 'blackWaxRibbon' };
/** A fish's height for its length on the wall (its shape's own aspect, roughly: an eel is long and thin, a carp deep). */
export function printAspect(sp) {
  const s = sp?.model?.shape || sp?.shape || '';
  return /eel|lamprey/.test(s) ? 0.2 : /crayfish/.test(s) ? 0.5 : /carp|koi|perch|bass/.test(s) ? 0.46 : /catfish|sturgeon|pike/.test(s) ? 0.3 : 0.38;
}

let styled = false;
function injectStyle() {
  if (styled || typeof document === 'undefined') return;
  styled = true;
  const st = document.createElement('style');
  st.dataset.gw = 'prints';
  st.textContent = `
.gw-prints{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px;padding:6px 4px 18px}
.gw-print{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;min-height:44px;padding:10px 8px 12px;border:0;border-radius:14px;
  background:radial-gradient(120% 90% at 50% 40%,rgba(226,220,252,.08),rgba(20,14,34,0) 70%);color:#ece8f4;font:inherit;font-size:16px;cursor:pointer;text-align:center}
.gw-print:focus-visible,.gw-print:hover{background:radial-gradient(120% 90% at 50% 40%,rgba(240,162,60,.14),rgba(20,14,34,0) 72%);outline:none}
.gw-print canvas{display:block}
.gw-print-name{font-size:17px;letter-spacing:.02em}
.gw-print-w{font-size:18px;color:#f1d9a4}
.gw-print-sm{font-size:16px;color:rgba(226,220,252,.7)}
.gw-print .gw-seal{width:26px;height:26px;position:absolute;right:10px;top:8px}
.gw-print--gold .gw-print-name,.gw-print--gold .gw-print-w{color:#f1d7a0}
.gw-print--gold{box-shadow:inset 0 0 0 1.5px rgba(214,170,84,.55)}
.gw-prints-none{padding:30px 10px;text-align:center;color:rgba(226,220,252,.55);font-size:18px}
.gw-p-gallery{width:min(1100px,96vw);max-width:none}
.gw-gallery{position:relative;height:min(62vh,460px);min-height:300px;border-radius:18px;overflow:hidden;
  background:linear-gradient(180deg,rgba(10,6,16,.0),rgba(10,6,16,.55) 88%),repeating-linear-gradient(90deg,#3b2a25 0 46px,#33241f 46px 47px,#45342c 47px 92px,#2a1e1a 92px 93px);
  box-shadow:inset 0 30px 60px rgba(8,4,14,.7),inset 0 -40px 60px rgba(8,4,14,.6)}
.gw-gallery::before{content:'';position:absolute;inset:0;background:radial-gradient(60% 50% at 50% 70%,rgba(255,170,90,.16),rgba(0,0,0,0) 70%);pointer-events:none}
.gw-gwall{position:absolute;inset:0;overflow-x:auto;overflow-y:hidden;display:flex;align-items:center;gap:var(--gap,46px);padding:0 40px;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch}
.gw-gframe{flex:none;position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;scroll-snap-align:center;border:0;background:none;color:#ece8f4;font:inherit;min-height:44px;cursor:pointer;padding:0}
.gw-gpaper{position:relative;padding:12px 14px;background:linear-gradient(180deg,#e9e1d4,#d9d0bf);border-radius:3px;box-shadow:0 0 0 5px #2a1f1c,0 0 0 6px rgba(141,131,153,.55),0 10px 22px rgba(4,2,10,.7)}
.gw-gframe--gold .gw-gpaper{box-shadow:0 0 0 5px #8a6a2a,0 0 0 7px #d6aa54,0 0 18px rgba(240,190,90,.35),0 10px 22px rgba(4,2,10,.7)}
.gw-gruler{height:12px;background:repeating-linear-gradient(90deg,rgba(59,46,68,.85) 0 1px,transparent 1px var(--cm10,26px)),linear-gradient(180deg,#c7bca6,#b2a68e);border-radius:2px;box-shadow:0 2px 4px rgba(4,2,10,.5)}
.gw-gcandle{width:8px;height:22px;margin-top:4px;background:linear-gradient(180deg,#efe3c8,#cbb994);border-radius:2px;position:relative}
.gw-gcandle::before{content:'';position:absolute;left:50%;top:-14px;width:9px;height:14px;transform:translateX(-50%);border-radius:50% 50% 45% 45%;
  background:radial-gradient(circle at 50% 70%,#fff3c8 0 25%,#ffb347 45%,rgba(255,140,50,0) 72%);animation:gw-gflick 2.6s ease-in-out infinite;filter:blur(.2px)}
.gw-gcandle::after{content:'';position:absolute;left:50%;top:-30px;width:46px;height:46px;transform:translateX(-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,180,90,.28),rgba(255,180,90,0) 70%);pointer-events:none}
@keyframes gw-gflick{0%,100%{transform:translateX(-50%) scale(1,1)}40%{transform:translateX(-52%) scale(.92,1.08)}70%{transform:translateX(-48%) scale(1.04,.95)}}
.gw-rm .gw-gcandle::before{animation:none}
.gw-gw{font-size:16px;color:#f1d9a4;text-shadow:0 1px 3px rgba(4,2,10,.9)}
.gw-gname{font-size:16px;color:#ece8f4;text-shadow:0 1px 3px rgba(4,2,10,.9)}
.gw-gbare{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(226,220,252,.0)}
@media (max-width:700px){.gw-prints{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.gw-gallery{height:min(58vh,420px)}.gw-gwall{padding:0 22px}}
`;
  document.head.appendChild(st);
}

/** One print card (the Prints page): its ink drawing, its name, its weight, its length in cm, where and which evening, its seal. */
function printCard(h, c, sp, phone, onPick) {
  const b = h('button', `gw-print${c.giant || c.legend ? ' gw-print--gold' : ''}`);
  b.type = 'button';
  b.dataset.print = c.id;
  b.setAttribute('aria-label', c.name);
  const w = phone ? 140 : 180, hh = phone ? 70 : 88;
  const cv = document.createElement('canvas');
  cv.className = 'gw-fishart';
  try { drawFishInk(cv, sp, { w, h: hh, pad: 0.07, gain: 6.2, color: c.giant || c.legend ? '#f1d9a4' : '#ece8f4' }); } catch { /* an ink blot is no reason to fail */ }
  b.appendChild(cv);
  const seal = SEAL[c.cls] ? sealSvg(SEAL[c.cls]) : '';
  b.insertAdjacentHTML('beforeend', `${seal}<span class="gw-print-name">${c.giant || c.legend ? '★ ' : ''}${esc(c.name)}</span>${c.weight ? `<b class="gw-print-w">${esc(c.weight)}</b>` : ''}<span class="gw-print-sm">${esc(`${c.length} cm`)}</span>${c.where ? `<span class="gw-print-sm">${esc(c.where)}</span>` : ''}${c.evening ? `<span class="gw-print-sm">${esc(`Evening ${c.evening}`)}</span>` : ''}`);
  if (onPick) b.addEventListener('click', (e) => { e.stopPropagation(); onPick(c.id); });
  return b;
}
/** The Journal's Prints page: every print in the catalogue's order; a tap opens the fish's own page. */
export function renderPrintsPage({ h, content, view, phone = false, D, onPick = null } = {}) {
  injectStyle();
  const scroll = h('div', 'gw-cat-scroll gw-cat-scroll--prints');
  const grid = h('div', 'gw-prints');
  grid.dataset.loop = 'prints';
  const spOf = (id) => D?.SPECIES_BY_ID?.[id] || arr(D?.SPECIES).find((s) => s?.id === id) || null;
  for (const c of arr(view?.cards)) grid.appendChild(printCard(h, c, spOf(c.id), phone, onPick));
  scroll.appendChild(grid);
  content.appendChild(scroll);
  return grid;
}

/** The cabin's gallery (the doorway's screen, from wing I): the wall's frames at one true scale, a candle under each. */
export function createGalleryView({ K, D, loop, report = () => {} } = {}) {
  const h = K.h;
  const parts = () => K.screens?.parts || {};
  const reduced = () => K.settings?.().reducedMotion === true;
  function render(entry, body) {
    injectStyle();
    const { panel = null, btn = null } = parts();
    if (!panel || !btn) return;
    const phone = (K.vw || innerWidth) < 700;
    const g = (() => { try { return loop()?.gallery?.(); } catch (e) { report('gallery', e); return null; } })() || { wings: [] };
    const { panel: pn, content, foot } = panel(entry, body, { cls: 'gw-p-wide gw-p-gallery', close: true });
    pn.dataset.loop = 'gallery';
    const wall = h('div', `gw-gallery${reduced() ? ' gw-rm' : ''}`);
    const row = h('div', 'gw-gwall');
    const k = phone ? GALLERY_SCALE.phone : GALLERY_SCALE.desktop;
    row.style.setProperty('--gap', `${Math.round(18 * k)}px`);
    const spOf = (id) => D()?.SPECIES_BY_ID?.[id] || arr(D()?.SPECIES).find((s) => s?.id === id) || null;
    const frames = arr(g.wings?.[0]?.frames);
    for (const f of frames) {
      const sp = spOf(f.id);
      const w = Math.max(24, Math.round(f.length * k)), hh = Math.max(16, Math.round(w * printAspect(sp)));
      const fr = h('button', `gw-gframe${f.gold ? ' gw-gframe--gold' : ''}`);
      fr.type = 'button';
      fr.dataset.frame = f.id;
      fr.setAttribute('aria-label', f.name);
      const paper = h('span', 'gw-gpaper');
      const cv = document.createElement('canvas');
      try { drawFishInk(cv, sp, { w, h: hh, pad: 0.02, gain: 7, color: f.gold ? '#7a5418' : '#2a2436' }); } catch (e) { report('gallery art', e); }
      paper.appendChild(cv);
      fr.appendChild(paper);
      const ruler = h('span', 'gw-gruler');
      ruler.style.width = `${w}px`; ruler.style.setProperty('--cm10', `${(10 * k).toFixed(1)}px`);
      fr.appendChild(ruler);
      fr.insertAdjacentHTML('beforeend', `<span class="gw-gname">${f.gold ? '★ ' : ''}${esc(f.name)}</span>${f.weight ? `<span class="gw-gw">${esc(f.weight)}</span>` : ''}<span class="gw-gcandle" aria-hidden="true"></span>`);
      fr.addEventListener('click', (e) => { e.stopPropagation(); K.sfx?.('ui_click'); K.screens?.openJournal?.({ from: 'wall', sel: f.id }); });
      row.appendChild(fr);
    }
    wall.appendChild(row);
    content.appendChild(wall);
    foot.appendChild(btn(esc(D()?.TEXT_LOOP?.back || 'Back'), { onClick: () => K.closeModal('gallery'), autofocus: true }));
    // (a short wall starts centred; a long one at its first frame)
    requestAnimationFrame(() => { try { if (row.scrollWidth <= row.clientWidth + 2) row.style.justifyContent = 'center'; } catch { /* ignore */ } });
  }
  return {
    open() {
      if (K.has('gallery')) { K.entry('gallery')?.render(); return; }
      K.openModal('gallery', render, { cls: 'gw-m-center gw-m-gallery', onEscape: () => K.closeModal('gallery') });
      try { K.sfx?.('ui_open', { volume: 0.4 }); } catch { /* ignore */ }
    },
    render,
  };
}
