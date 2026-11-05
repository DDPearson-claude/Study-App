// ui-screens.js — every modal and full screen (DESIGN §21.4): title, New Descent
// (Wicks + Waystones), catch card, level-up picker, Old Murk's shop, creel, journal,
// Shrine of Drowned Lanterns, trials (challenges), settings, pause, Descend, death and
// victory. Built on the modal stack in ui.js. Imported only by ui.js.
import { loadSave } from './core.js';
import { wickPortrait, murkPortrait, relicLantern, sealSvg } from './ui-icons.js';
import { drawFish, drawFishInk } from './ui-fishart.js';
import { classInfo, fmtLength, favourGroups, favourMu, notchesFor } from './ui-v3.js';

const RARITY_LABEL = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

export function createScreens(K) {
  const { ctx, h, esc, fill, fmt, fmtKg, num, arr, safe, D, stat, run, meta, icon, ORN, sfx } = K;
  let uidN = 0;
  const uid = () => (++uidN).toString(36);

  // ------------------------------------------------------------------ building blocks
  // UI style v2 (DESIGN §21.6): no box. A panel is a pool of night ink under its content, a
  // filigree crest above the title and a flourish closing it (drawn by CSS).
  function panel(entry, body, { title = '', sub = '', cls = '', close = true, kicker = '' } = {}) {
    const p = h('div', `gw-panel ${cls}`);
    p.innerHTML = `${close ? `<button class="gw-x" type="button" aria-label="Close" title="Close (Esc)">${icon('close')}</button>` : ''}
      ${title ? `<header class="gw-ph"><div class="gw-pdiv">${ORN.crest}</div>${kicker ? `<div class="gw-kicker">${kicker}</div>` : ''}<h2>${esc(title)}</h2>${sub ? `<div class="gw-psub">${sub}</div>` : ''}</header>` : ''}
      <div class="gw-pc"></div><footer class="gw-pf"></footer>`;
    body.appendChild(p);
    p.querySelector('.gw-x')?.addEventListener('click', () => { sfx('ui_click'); K.userEscape(entry); });
    return { panel: p, content: p.querySelector('.gw-pc'), foot: p.querySelector('.gw-pf') };
  }
  function btn(label, opts = {}) {
    const b = h('button', `gw-btn ${opts.cls || ''}`);
    b.type = 'button';
    // the label span carries the twin hook curls that draw in when the item is chosen (or, on the
    // catch card, a brushed underline); the first direct <span> stays the plain label
    const deco = opts.hooks === false ? [opts.brush ? ORN.brush : '', ''] : [ORN.hookL, ORN.hookR];
    b.innerHTML = `${opts.key ? `<kbd>${esc(opts.key)}</kbd>` : ''}${opts.icon ? icon(opts.icon) : ''}<span>${deco[0]}${label}${deco[1]}</span>${opts.sub ? `<small>${opts.sub}</small>` : ''}`;
    if (opts.title) b.title = opts.title;
    if (opts.action) b.dataset.action = opts.action;
    if (opts.disabled) b.disabled = true;
    if (opts.autofocus) b.dataset.autofocus = '1';
    if (opts.onClick) b.addEventListener('click', (e) => { e.stopPropagation(); if (b.disabled) return; if (opts.sound !== false) sfx('ui_click'); opts.onClick(e); });
    b.addEventListener('pointerenter', () => { if (!b.disabled && !K.isTouch) sfx('ui_hover', { volume: 0.35 }); });
    return b;
  }
  function tabs(list, current, onPick) {
    const t = h('div', 'gw-tabs');
    t.setAttribute('role', 'tablist');
    for (const it of list) {
      const b = h('button', `gw-tab${it.id === current ? ' gw-on' : ''}`, `${it.icon ? icon(it.icon) : ''}<span>${esc(it.label)}</span>${it.badge ? `<i class="gw-badge">${esc(it.badge)}</i>` : ''}`);
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', it.id === current ? 'true' : 'false');
      b.addEventListener('click', () => { if (it.id !== current) { sfx('ui_click'); onPick(it.id); } });
      t.appendChild(b);
    }
    return t;
  }
  const tabKeys = (entry, ids, get, set) => (code) => {
    if (code !== 'BracketLeft' && code !== 'BracketRight' && code !== 'ArrowLeft' && code !== 'ArrowRight') return false;
    if (code.startsWith('Arrow') && document.activeElement?.type === 'range') return false;
    const i = ids.indexOf(get());
    const d = code === 'BracketLeft' || code === 'ArrowLeft' ? -1 : 1;
    set(ids[(i + d + ids.length) % ids.length]);
    sfx('ui_click');
    entry.render();
    return true;
  };
  function fishCanvas(species, w, hgt, opts = {}) {
    const c = h('canvas', 'gw-fishart');
    c.style.width = w + 'px'; c.style.height = hgt + 'px';
    try { drawFish(c, species, { w, h: hgt, ...opts }); } catch (e) { K.report('fishart', e); }
    return c;
  }
  const pips = (lv, max) => { let s = ''; for (let i = 0; i < max; i++) s += `<b class="${i < lv ? 'on' : ''}"></b>`; return `<span class="gw-lvpips">${s}</span>`; };
  const shellTag = (n) => `<span class="gw-price">${icon('shell')}${fmt(n)}</span>`;
  const memTag = (n) => `<span class="gw-price gw-price--mem">${icon('memory')}${fmt(n)}</span>`;
  const bar = (k, cls = '') => `<span class="gw-bar ${cls}"><i style="width:${(Math.max(0, Math.min(1, k)) * 100).toFixed(1)}%"></i></span>`;

  function confirm(text, { yes = 'Yes', no = 'No', danger = false, onYes, sub = '' } = {}) {
    K.openModal('confirm', (entry, body) => {
      const { content, foot } = panel(entry, body, { title: text, sub, cls: 'gw-p-confirm', close: false });
      content.remove();
      foot.appendChild(btn(no, { onClick: () => K.closeModal('confirm'), autofocus: true }));
      foot.appendChild(btn(yes, { cls: danger ? 'gw-btn--danger' : 'gw-btn--primary', onClick: () => { K.closeModal('confirm'); onYes?.(); } }));
    }, { dismissable: true, state: { titleChild: true } });
  }

  // ------------------------------------------------------------------ data normalisers
  function characters() {
    const got = safe(() => ctx.progression?.getCharacters?.(), null);
    const m = meta();
    return arr(D().CHARACTERS).map((c) => {
      const g = Array.isArray(got) ? got.find((x) => x?.id === c.id) : null;
      const unlocked = g && typeof g.unlocked === 'boolean' ? g.unlocked : (!c.unlock || !!m.unlocks?.['character:' + c.id] || !!m.challenges?.[c.unlock]);
      return { ...c, ...(g || {}), look: c.look, unlocked, reason: g?.reason || '' };
    });
  }
  function challenges() {
    const got = safe(() => ctx.progression?.getChallenges?.(), null);
    const m = meta();
    return arr(D().CHALLENGES).map((c) => {
      const g = Array.isArray(got) ? got.find((x) => x?.id === c.id) : null;
      const target = num(g?.target, num(c.params?.n, 1)) || 1;
      const done = g && typeof g.done === 'boolean' ? g.done : !!m.challenges?.[c.id];
      const progress = done ? target : num(g?.progress, num(m.challengeProgress?.[c.id], 0));
      return { ...c, ...(g || {}), done, progress: Math.min(progress, target), target };
    });
  }
  function relicRevealed(r) {
    const m = meta();
    if (r.unlock && !m.challenges?.[r.unlock] && !m.unlocks?.['relic:' + r.id]) return false;
    const q = r.requires || {};
    if (q.bestDay && num(m.bestDay) < q.bestDay) return false;
    if (q.runs && num(m.runs) < q.runs) return false;
    if (q.deepestZone && num(m.deepestZone) < q.deepestZone) return false;
    if (q.bestLevel && num(m.bestLevel) < q.bestLevel) return false;
    return true;
  }
  function relicRevealText(r) {
    if (r.unlock) { const c = D().CHALLENGE_BY_ID?.[r.unlock]; return c ? `Revealed by the trial “${c.name}”: ${c.desc}` : 'Revealed by a trial.'; }
    const q = r.requires || {};
    if (q.bestDay) return `Revealed once you see day ${q.bestDay}.`;
    if (q.runs) return `Revealed after ${q.runs} descents.`;
    if (q.deepestZone) return `Revealed once you reach ${arr(D().ZONES)[q.deepestZone]?.name || 'deeper water'}.`;
    if (q.bestLevel) return `Revealed once your flame reaches level ${q.bestLevel}.`;
    return '';
  }
  function relics() {
    const got = safe(() => ctx.progression?.getRelics?.(), null);
    const m = meta();
    return arr(D().RELICS).map((r) => {
      const g = Array.isArray(got) ? got.find((x) => x?.id === r.id) : null;
      const level = num(g?.level, num(m.relics?.[r.id], 0));
      const max = num(r.maxLevel, 1);
      const maxed = level >= max;
      const nextCost = maxed ? 0 : num(g?.nextCost, num(r.costs?.[level], 0));
      const revealed = typeof g?.revealed === 'boolean' ? g.revealed : typeof g?.visible === 'boolean' ? g.visible : relicRevealed(r);
      const canBuy = typeof g?.canBuy === 'boolean' ? g.canBuy && revealed && !maxed : revealed && !maxed && num(m.memories) >= nextCost;
      const reason = maxed ? 'Fully lit' : !revealed ? (g?.reason || 'Not yet revealed') : !canBuy ? (g?.reason || (num(m.memories) < nextCost ? `Needs ${fmt(nextCost - num(m.memories))} more Memories` : 'Unavailable')) : '';
      return { ...r, level, max, maxed, nextCost, revealed, canBuy, reason };
    });
  }
  function zoneOf(z) { return typeof z === 'string' ? K.zoneData(z) : z?.id ? (K.zoneData(z.id) || z) : null; }
  function hintFor(sp, always = false) {
    if (sp.hint && !always) return sp.hint;
    const parts = [];
    if (sp.time === 'gloom') parts.push('rises only in the Gloomtide'); else if (sp.time === 'calm') parts.push('feeds while the water is calm'); else parts.push('bites at any hour');
    const [d0, d1] = arr(sp.depth).length ? sp.depth : [0, 1];
    parts.push(d0 >= 0.75 ? 'deep water' : d0 >= 0.35 ? (d1 >= 0.99 ? 'mid to deep water' : 'mid water') : d1 <= 0.36 ? 'the shallows' : d1 <= 0.76 ? 'shallow to mid water' : 'any depth');
    if (sp.bait) parts.push(`answers only ${K.baitData(sp.bait)?.name || sp.bait}`);
    return cap(parts.join(' · '));
  }
  const fishYields = (f) => ({
    sell: Math.round(num(f?.value) * stat('sellMult')),
    food: Math.round(num(f?.food) * stat('foodMult')),
    oil: Math.round(num(f?.oil) * stat('oilYieldMult')),
  });
  const qualityOf = (q) => D().QUALITY?.[q] || { label: cap(q || 'normal') };
  /** Quality pill: only Fine / Shimmering get one (a plain catch's label would read like a rarity). */
  const qPill = (q) => (!q || q === 'normal' ? '' : `<span class="gw-q gw-q--${esc(q)}">${q === 'perfect' ? icon('star') : ''}${esc(qualityOf(q).label)}</span>`);

  function doFishAction(fish, action) {
    const res = safe(() => ctx.progression?.fishAction?.(fish?.uid && arr(run()?.creel).includes(fish) ? fish.uid : fish, action), null);
    if (res && res.ok === false) { K.toast(res.msg || 'That will not do.', 'bad'); sfx('denied'); return false; }
    if (action === 'release') K.toast((res && res.msg) || 'It slips away. The water remembers kindness.', 'lore', { dur: 2600 });
    K.hud?.dirtyStats?.();
    return true;
  }

  // ================================================================== TITLE
  function showTitle() {
    K.closeAll();
    K.openModal('title', (entry, body) => {
      const m = meta();
      const T = D().TEXT || {};
      const saved = safe(() => loadSave()?.run, null);
      const hasRun = !!safe(() => ctx.game?.hasSavedRun?.(), false);
      const zDeep = arr(D().ZONES)[num(m.deepestZone, 0)];
      const named = Object.keys(m.journal || {}).length;
      const total = arr(D().SPECIES).length;
      if (!entry.state.tagline) entry.state.tagline = Math.random() < 0.55 ? (T.tagline || '') : (K.pick(T.taglineAlts) || T.tagline || '');
      const wrap = h('div', 'gw-title');
      const name = T.title || 'GLOOMWATER';
      const meta1 = m.runs ? [`${named} of ${total} species named`, `${fmt(m.memories || 0)} Memories`, `${fmt(m.runs)} descent${m.runs === 1 ? '' : 's'}`, `deepest ${esc(zDeep?.name || 'The Mossmere')}`, `best day ${fmt(m.bestDay || 0)}`]
        : ['No Wick has gone down yet', `${named} of ${total} species named`];
      if (m.victories) meta1.push(`${m.victories} light${m.victories > 1 ? 's' : ''} raised`);
      wrap.innerHTML = `<div class="gw-title-veil"></div>
        <div class="gw-title-inner">
          <div class="gw-logo"><h1 class="gw-logotype" aria-label="${esc(name)}">${[...name].map((c, i) => `<span style="--i:${i}">${esc(c)}</span>`).join('')}</h1>
            <div class="gw-title-fil">${ORN.crest}</div>
            <p class="gw-tagline">${esc(entry.state.tagline)}</p></div>
          <nav class="gw-title-menu"></nav>
          <div class="gw-title-lower">
            ${!m.runs ? `<p class="gw-title-premise">${esc(T.premise || '')}</p>` : ''}
            <div class="gw-title-meta">${meta1.map((x, i) => `<span${i > 1 ? ' class="gw-meta-x"' : ''}>${x}</span>`).join('')}</div>
          </div>
        </div>`;
      body.appendChild(wrap);
      const nav = wrap.querySelector('.gw-title-menu');
      // quiet words in a column; only Continue keeps a line beneath it (the others say theirs on hover)
      const add = (label, sub, fn, opts = {}) => { const b = btn(label, { cls: 'gw-tbtn', onClick: fn, ...opts }); if (sub) b.title = sub.replace(/&amp;/g, '&'); nav.appendChild(b); return b; };
      if (hasRun) {
        const z = K.zoneData(saved?.zone);
        add('Continue', '', () => { K.closeAll(); ctx.game?.continueRun?.(); }, { autofocus: true, cls: 'gw-tbtn gw-tbtn--main', sub: saved ? `Day ${saved.day || 1} · ${esc(z?.name || '')}` : '' });
      }
      add('New Descent', hasRun ? 'Begins a new descent and abandons the waiting one' : '', () => openNewDescent(), { autofocus: !hasRun, cls: hasRun ? 'gw-tbtn' : 'gw-tbtn gw-tbtn--main' });
      add('Journal', `${named} / ${total} named`, () => openJournal());
      add('Shrine', `${fmt(m.memories || 0)} Memories`, () => openShrine());
      add('Trials', `${challenges().filter((c) => c.done).length} / ${arr(D().CHALLENGES).length} complete`, () => openChallenges());
      add('Settings', 'Sound and picture', () => openSettings({ titleChild: true }));
    }, { screen: true, blocking: false, onEscape: () => {}, onKey: menuArrows });
  }
  function menuArrows(code) {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(code)) return false;
    const t = K.top();
    const btns = [...(t?.el.querySelectorAll('.gw-tbtn:not([disabled]), .gw-mbtn:not([disabled])') || [])];
    if (!btns.length) return false;
    const i = btns.indexOf(document.activeElement);
    const d = code === 'ArrowUp' || code === 'KeyW' || code === 'ArrowLeft' || code === 'KeyA' ? -1 : 1;
    btns[(i + d + btns.length) % btns.length].focus();
    sfx('ui_hover', { volume: 0.3 });
    return true;
  }

  // ================================================================== NEW DESCENT
  function openNewDescent() {
    const m = meta();
    const chars = characters();
    const st = { sel: null, zone: 'mossmere', titleChild: true };
    st.sel = (chars.find((c) => c.id === m.lastCharacter && c.unlocked) || chars.find((c) => c.unlocked) || chars[0])?.id;
    K.openModal('newdescent', (entry, body) => {
      const s = entry.state;
      const list = characters();
      const { content, foot } = panel(entry, body, { title: 'A New Descent', sub: 'Choose the Wick who goes down, and where the water begins.', cls: 'gw-p-wide gw-p-descent' });
      const grid = h('div', 'gw-chars');
      list.forEach((c, i) => {
        const b = h('button', `gw-char${c.id === s.sel ? ' gw-on' : ''}${c.unlocked ? '' : ' gw-locked'}`);
        b.type = 'button';
        b.innerHTML = `${wickPortrait(c.look, { locked: !c.unlocked, uid: 'c' + i + uid() })}<span class="gw-char-name">${c.unlocked ? esc(c.name) : 'Unknown Wick'}</span>`;
        b.addEventListener('click', () => { s.sel = c.id; sfx('ui_click'); entry.render(); });
        grid.appendChild(b);
      });
      content.appendChild(grid);
      const c = list.find((x) => x.id === s.sel) || list[0];
      const det = h('div', 'gw-char-detail');
      if (c) {
        if (c.unlocked) {
          const sb = K.boonData(c.startBoon);
          const kit = [];
          for (const [bid, n] of Object.entries(c.startKit?.bait || {})) kit.push(`${n} ${esc(K.baitData(bid)?.name || bid)}`);
          if (num(c.startKit?.shells)) kit.push(`+${c.startKit.shells} Shells`);
          const eff = K.effectLines(c.effects);
          det.innerHTML = `<div class="gw-cd-portrait">${wickPortrait(c.look, { uid: 'd' + uid() })}</div>
            <div class="gw-cd-text"><h3>${esc(c.name)}</h3><div class="gw-cd-title">${esc(c.title || '')}</div>
            <p class="gw-cd-desc">${esc(c.desc || '')}</p>
            ${eff.length ? `<div class="gw-chips">${eff.map((e) => `<span class="gw-chip ${e.startsWith('−') ? 'gw-neg' : 'gw-pos'}">${esc(e)}</span>`).join('')}</div>` : '<div class="gw-chips"><span class="gw-chip">Balanced in all things</span></div>'}
            <div class="gw-cd-rows">
              ${sb ? `<div class="gw-cd-row"><span class="gw-cd-ico" style="--rc:${K.rarityCss(sb.rarity)}">${icon(sb.icon)}</span><div><b>Starts with ${esc(sb.name)}</b><small>${esc(sb.desc || '')}</small></div></div>` : ''}
              ${c.quirk ? `<div class="gw-cd-row"><span class="gw-cd-ico">${icon('flame')}</span><div><b>${esc(c.quirk.name)}</b><small>${esc(c.quirk.desc || '')}</small></div></div>` : ''}
              ${kit.length ? `<div class="gw-cd-row"><span class="gw-cd-ico">${icon('bundle')}</span><div><b>Kit</b><small>${kit.join(' · ')}</small></div></div>` : ''}
            </div>
            ${c.lore ? `<p class="gw-lore">${esc(c.lore)}</p>` : ''}</div>`;
        } else {
          const ch = challenges().find((x) => x.id === c.unlock);
          det.innerHTML = `<div class="gw-cd-portrait">${wickPortrait(c.look, { locked: true, uid: 'l' + uid() })}</div>
            <div class="gw-cd-text"><h3>A Wick not yet kindled</h3><div class="gw-cd-title">${icon('lock')} Locked</div>
            <p class="gw-cd-desc">${ch ? `Unlocked by the trial <b>${esc(ch.name)}</b>: ${esc(ch.desc)}` : esc(c.reason || 'Complete a trial to light this Wick.')}</p>
            ${ch ? `<div class="gw-cd-prog">${bar(ch.progress / ch.target)}<span>${fmt(ch.progress)} / ${fmt(ch.target)}</span></div>` : ''}</div>`;
        }
      }
      content.appendChild(det);
      // waystones
      const ways = arr(safe(() => ctx.progression?.getWaystones?.(), ['mossmere'])).map((w) => (typeof w === 'string' ? w : w?.id)).filter(Boolean);
      if (!ways.includes('mossmere')) ways.unshift('mossmere');
      if (!ways.includes(s.zone)) s.zone = 'mossmere';
      if (ways.length > 1) {
        const econ = D().BALANCE?.economy || {};
        const ws = h('div', 'gw-ways');
        ws.innerHTML = `<div class="gw-ways-head">${icon('waystone')}<span>${esc(D().TEXT?.waystoneText || 'Begin where a Waystone remembers.')}</span></div>`;
        const row = h('div', 'gw-ways-row');
        for (const zid of ways) {
          const z = K.zoneData(zid);
          const b = h('button', `gw-way${zid === s.zone ? ' gw-on' : ''}`);
          b.type = 'button';
          const purse = num(econ.waystonePurse?.[zid]), lv = num(econ.waystoneLevels?.[zid]);
          b.innerHTML = `<b>${esc(z?.name || zid)}</b><small>${zid === 'mossmere' ? 'The first water' : `${fmt(purse)} Shells · ${lv} banked levels`}</small>`;
          b.style.setProperty('--zc', K.cssHex(z?.palette?.glow, '#9fa2d8'));
          b.addEventListener('click', () => { s.zone = zid; sfx('ui_click'); entry.render(); });
          row.appendChild(b);
        }
        ws.appendChild(row);
        content.appendChild(ws);
      }
      content.classList.add('gw-scroll');
      foot.appendChild(btn('Back', { onClick: () => K.closeModal('newdescent') }));
      foot.appendChild(btn(c?.unlocked ? `Descend as ${esc(c.name)}` : 'Locked', {
        cls: 'gw-btn--primary', disabled: !c?.unlocked, autofocus: true, icon: 'flame',
        onClick: () => { const zone = s.zone, ch = s.sel; K.closeAll(); ctx.game?.startNewRun?.({ startZone: zone, character: ch }); },
      }));
    }, { state: st, onKey: (code) => {
      if (code === 'ArrowLeft' || code === 'ArrowRight') {
        const list = characters(); const t = K.top(); const s = t.state;
        const i = list.findIndex((x) => x.id === s.sel);
        s.sel = list[(i + (code === 'ArrowLeft' ? -1 : 1) + list.length) % list.length].id; sfx('ui_hover', { volume: 0.3 }); t.render(); return true;
      }
      if (code === 'Enter') { const b = K.top()?.el.querySelector('.gw-pf .gw-btn--primary:not([disabled])'); if (b && document.activeElement?.tagName !== 'BUTTON') { b.click(); return true; } }
      return false;
    } });
  }

  // ================================================================== CATCH CARD
  // Direction C, "Ink-Wash Field Journal" (DESIGN §21.6): a feathered patch of ink instead of a
  // box; the fish as a pale ink sketch derived from its own illustration, a measuring line and a
  // handwritten note built from the real catch; the species name in IM Fell English SC, a red
  // rubber stamp for its class, handwritten length / weight / worth, one lore line and the
  // actions as words with a brush stroke under the chosen one. One column on a phone.
  // condition factor K (weight g = K · length cm³ / 100) per body shape, for the length estimate
  const SHAPE_K = { minnow: 1.0, perch: 1.3, crayfish: 2.2, carp: 1.8, koi: 1.5, pike: 0.68, eel: 0.18, puffer: 3.2, ray: 1.6, angler: 2.6, jelly: 0.9, ghost: 0.55, leviathan: 0.85 };
  function fishLength(sp, kg) {
    const k = SHAPE_K[sp?.model?.shape] || 1.1;
    const cm = Math.cbrt((100 * Math.max(0.001, num(kg)) * 1000) / k);
    return cm >= 100 ? `${(cm / 100).toFixed(2)} m` : `${Math.max(1, Math.round(cm))} cm`;
  }
  function sizeClass(sp, kg) {
    const [w0, w1] = arr(sp?.weight).length ? sp.weight : [0, 1];
    const t = w1 > w0 ? (num(kg) - w0) / (w1 - w0) : 0.5;
    return t >= 0.86 ? 'trophy' : t >= 0.6 ? 'large' : t < 0.2 ? 'small' : 'fair';
  }
  const PHASE_WHEN = { calm: 'in the calm', dusk: 'at dusk', gloomtide: 'in the Gloomtide', dawn: 'at grey dawn' };
  const firstSentence = (t) => { const m = /^(.+?[.!?])(\s|$)/.exec(String(t || '').trim()); return m ? m[1] : String(t || '').trim(); };
  // v3 (DESIGN §25.6.8, §25.14.2 U2): the card prints the measured fish — its class as the stamp (and its seal), length in
  // cm, weight in kg, an Elder's name, and the favours that applied, as the float showed them (notches + plain words)
  const CLASS_PHRASE = { small: 'only a little one.', keeper: 'a keeper.', prize: 'a prize!', trophy: 'a real trophy!', elder: 'an Elder!' };
  const isV3Fish = (fish) => !!D().V3_ENABLED && typeof fish?.sizeClass === 'string' && num(fish?.length) > 0;
  function catchNotesV3(p, sp, fish) {
    const r = run();
    const legend = sp.rarity === 'legendary';
    const ci = classInfo(D(), fish.sizeClass, fish.ancient) || { id: 'keeper', label: 'Keeper', seal: null, rank: 1 };
    const recs = arr(p.records);
    const classFirst = !p.isNew && recs.some((x) => x?.kind === 'classFirst' && !x.ancient);
    const z = K.zoneData(sp.zone) || K.zoneData(r?.zone);
    const zn = (z?.name || '').replace(/^The /, 'the ');
    const stamp = legend ? 'Legend' : ci.label;
    const kicker = legend ? `A legend of ${zn || 'the deep'}` : p.isRecord ? 'A new personal best' : p.isNew ? 'A new name for the journal'
      : classFirst ? `Your first ${ci.label}` : `${RARITY_LABEL[sp.rarity] || 'Common'} · ${z?.name || ''}`;
    const len = fmtLength(fish.length, D());
    const phrase = legend ? 'the legend itself!' : ci.ancient ? 'an Ancient, older than the lake!' : ci.id === 'elder' ? CLASS_PHRASE.elder
      : p.isRecord ? 'biggest yet!' : ci.id === 'trophy' ? CLASS_PHRASE.trophy : p.isNew ? 'a first!' : CLASS_PHRASE[ci.id] || '';
    // the bait it took: the cast's own (its favour term names it) before whatever is equipped now
    const castBait = arr(fish.favours).map((t) => (t?.family === 'tackle' ? K.baitData(t.id) : null)).find(Boolean);
    const eq = safe(() => ctx.progression?.getEquippedBait?.(), r?.equippedBait ?? null);
    const bait = castBait || K.baitData(typeof eq === 'object' && eq ? eq.id : eq);
    const ph = K.phaseInfo()?.phase || r?.phase || 'calm';
    const night = ph === 'gloomtide' && r?.nightMode && r.nightMode !== 'gloomtide' && !safe(() => ctx.combat?.swarmActive, false) ? 'on a still night' : PHASE_WHEN[ph];
    const more = `took ${bait ? `the ${bait.name.toLowerCase()}` : 'a bare hook'} ${night || ''}${r?.day ? `, day ${r.day}` : ''}`;
    const favours = arr(fish.favours);
    const mu = favourMu(favours, D());
    return { stamp, kicker, len, phrase, more, legend, size: ci.id, cls: ci, name: fish.name || '', favours, groups: favourGroups(favours, D()), notches: notchesFor(mu, D()), v3: true };
  }
  /** The catch as the journal records it: stamp, kicker, note, numbers. */
  function catchNotes(p, sp, fish) {
    if (isV3Fish(fish)) return catchNotesV3(p, sp, fish);
    const r = run();
    const legend = sp.rarity === 'legendary';
    const size = sizeClass(sp, fish.weight);
    const q = fish.quality || 'normal';
    const stamp = legend ? 'Legend' : p.isRecord ? 'Record' : p.isNew ? 'New' : q === 'perfect' ? 'Shimmering' : q === 'fine' ? 'Fine' : cap(size);
    const z = K.zoneData(sp.zone) || K.zoneData(r?.zone);
    const zn = (z?.name || '').replace(/^The /, 'the ');
    const kicker = legend ? `A legend of ${zn || 'the deep'}` : p.isRecord ? 'A new personal best' : p.isNew ? 'A new name for the journal' : `${RARITY_LABEL[sp.rarity] || 'Common'} · ${z?.name || ''}`;
    const len = fishLength(sp, fish.weight);
    const phrase = legend ? 'the legend itself!' : p.isRecord ? 'biggest yet!' : p.isNew ? 'a first!' : q === 'perfect' ? 'it shimmers!'
      : q === 'fine' ? 'a fine one.' : size === 'trophy' ? 'a real trophy!' : size === 'large' ? 'a good one.' : size === 'small' ? 'only a little one.' : '';
    const eq = safe(() => ctx.progression?.getEquippedBait?.(), r?.equippedBait ?? null);
    const bait = K.baitData(typeof eq === 'object' && eq ? eq.id : eq);
    const ph = K.phaseInfo()?.phase || r?.phase || 'calm';
    const more = `took ${bait ? `the ${bait.name.toLowerCase()}` : 'a bare hook'} ${PHASE_WHEN[ph] || ''}${r?.day ? `, day ${r.day}` : ''}`;
    return { stamp, kicker, len, phrase, more, legend, size };
  }
  function showCatch(p) {
    const fish = p?.fish;
    if (!fish) return;
    const sp = p.species || K.speciesData(fish.speciesId) || { id: fish.speciesId, name: fish.speciesId, rarity: 'common' };
    K.openModal('catch', (entry, body) => {
      const r = run();
      const s = entry.state;
      const legend = sp.rarity === 'legendary';
      const y = fishYields(fish);
      const cs = Math.round(stat('creelSize'));
      const inCreel = arr(r?.creel).includes(fish);
      const full = !inCreel && arr(r?.creel).length >= cs;
      const N = s.notes || (s.notes = catchNotes(p, sp, fish));
      const phone = K.vw < 700;
      const { panel: pn, content, foot } = panel(entry, body, { cls: `gw-p-catch gw-cc r-${sp.rarity || 'common'}${legend ? ' gw-legend' : ''}${p.isNew ? ' gw-new' : ''}${p.isRecord ? ' gw-record' : ''}${N.v3 ? ` gw-cc-v3 gw-cls-${N.cls.id}` : ''}`, close: false });
      pn.style.setProperty('--rc', K.rarityCss(sp.rarity));
      // the feathered ink patch (its edge is displaced by turbulence; preserveAspectRatio none lets it fill the card)
      const wash = phone ? 'M20 30 C120 14 250 16 350 30 C360 200 356 420 346 610 C240 626 120 626 24 612 C12 420 14 200 20 30 Z'
        : 'M50 50 C300 20 700 24 930 60 C960 200 950 420 920 570 C640 600 320 600 60 576 C30 420 34 200 50 50 Z';
      pn.insertAdjacentHTML('afterbegin', `<svg class="gw-cc-wash" viewBox="0 0 ${phone ? '370 640' : '980 620'}" preserveAspectRatio="none" aria-hidden="true">${legend ? `<path class="gw-cc-gild" filter="url(#gw-ink-edge)" d="${wash}"/>` : ''}<path filter="url(#gw-ink-edge)" d="${wash}"/></svg>`);
      // v3: the favours that applied, as the float showed them (notches) and in plain words by family
      const ticks = (n) => `<svg class="gw-cc-ticks" viewBox="0 0 64 24" aria-hidden="true">${[7, 19, 31, 43, 55].map((x, i) => `<path class="${i < n ? 'gw-lit' : ''}" d="M${x - 3.2} 20.5 C${x - 1.6} 15 ${x + 1.6} 9 ${x + 3.6} 3.5"/>`).join('')}</svg>`;
      const favRow = N.v3 && !legend ? `<dt>favour</dt><dd class="gw-cc-fav">${ticks(N.notches)}${N.groups.length
        ? `<span class="gw-cc-favw">${N.groups.map((g) => `<i><b>${esc(g.label)}</b> ${esc(g.words.map((w) => w.text).join(', '))}</i>`).join('')}</span>`
        : '<span class="gw-cc-favw gw-none"><i>nothing in its favour: open water</i></span>'}</dd>` : '';
      // v3: the stamp is the class, so a Fine or Shimmering catch says so beside its worth
      const qWord = N.v3 && fish.quality === 'perfect' ? ', shimmering' : N.v3 && fish.quality === 'fine' ? ', fine' : '';
      const stats = `<dl class="gw-cc-stats"><dt>length</dt><dd>${esc(N.len)}</dd><dt>weight</dt><dd>${esc(fmtKg(fish.weight))}</dd><dt>worth</dt><dd>${fmt(y.sell)} shells${qWord}</dd>${favRow}</dl>`;
      const lore = firstSentence(sp.lore) || hintFor(sp);
      content.innerHTML = `<div class="gw-cc-grid">
          <div class="gw-cc-left">
            <div class="gw-cc-art"></div>
            <svg class="gw-cc-measure" viewBox="0 0 400 36" preserveAspectRatio="none" aria-hidden="true"><g filter="url(#gw-brush)"><path d="M8 18 H392" stroke-width="2"/><path d="M8 8 V28 M392 8 V28" stroke-width="2.4"/><path d="M56 14 V22 M104 14 V22 M152 14 V22 M200 12 V24 M248 14 V22 M296 14 V22 M344 14 V22" stroke-width="1.3" opacity=".6"/></g></svg>
            <p class="gw-cc-note">${N.name ? `${esc(N.name)}, ` : ''}${esc(N.len)}${N.phrase ? `, ${esc(N.phrase)} ` : ''}<span class="gw-cc-note-more">${N.phrase ? '' : ', '}${esc(N.more)}</span></p>
          </div>
          <div class="gw-cc-right">
            <div class="gw-cc-kicker">${esc(N.kicker)}</div>
            <h2 class="gw-catch-name">${esc(sp.name)}</h2>
            ${N.name ? `<div class="gw-cc-epithet gw-cc-elder">“${esc(N.name)}”</div>` : sp.epithet ? `<div class="gw-cc-epithet">${esc(sp.epithet)}</div>` : ''}
            <div class="gw-cc-stamp gw-cc-stamp--${esc(N.stamp.toLowerCase())}"><span>${esc(N.stamp)}</span>${N.v3 && !legend && N.cls.seal ? sealSvg(N.cls.seal, { ancient: N.cls.ancient, cls: 'gw-cc-seal' }) : ''}</div>
            ${stats}
            <p class="gw-cc-lore">${esc(lore)}</p>
            ${full ? `<div class="gw-catch-full">${esc(D().TEXT?.creelFull || 'Your creel is full.')} <button type="button" class="gw-link" data-room>${s.room ? 'Hide the creel' : 'Make room…'}</button></div>` : ''}
          </div>
        </div>`;
      const art = content.querySelector('.gw-cc-art');
      const aw = phone ? 300 : 400, ah = phone ? 120 : 170;
      const c = h('canvas', 'gw-fishart gw-fish-ink');
      try { drawFishInk(c, sp, { w: aw, h: ah, pad: 0.05, color: legend ? '#efd9a6' : '#ece8f4' }); } catch (e) { K.report('fishart', e); }
      art.appendChild(c);
      content.querySelector('[data-room]')?.addEventListener('click', () => { s.room = !s.room; sfx('ui_click'); entry.render(); });
      const right = content.querySelector('.gw-cc-right');
      if (full && s.room) {
        pn.classList.add('gw-cc-rooming');
        const list = h('div', 'gw-room');
        for (const f of arr(r?.creel)) {
          const fsp = K.speciesData(f.speciesId);
          const fy = fishYields(f);
          const row = h('div', 'gw-room-row');
          row.appendChild(fishCanvas(fsp, 56, 30));
          row.insertAdjacentHTML('beforeend', `<span class="gw-room-name">${esc(fsp?.name || f.speciesId)}<small>${fmtKg(f.weight)}</small></span>`);
          row.appendChild(btn(`Eat <em>+${fy.food}</em>`, { cls: 'gw-btn--sm gw-cc-act', hooks: false, brush: true, onClick: () => { if (doFishAction(f, 'eat')) entry.render(); } }));
          row.appendChild(btn(`Render <em>+${fy.oil}</em>`, { cls: 'gw-btn--sm gw-cc-act', hooks: false, brush: true, onClick: () => { if (doFishAction(f, 'render')) entry.render(); } }));
          list.appendChild(row);
        }
        right.appendChild(list);
      }
      const act = (a) => () => { if (s.locked) return; if (doFishAction(fish, a)) { s.locked = true; K.closeModal('catch'); } };
      foot.classList.add('gw-catch-actions');
      right.appendChild(foot);
      const A = { hooks: false, brush: true };
      foot.appendChild(btn(legend ? 'Keep as trophy' : 'Keep', { ...A, key: '1', action: 'keep', cls: 'gw-cc-act gw-btn--primary', disabled: full, title: full ? 'Your creel is full' : 'Keep it to sell, eat or burn later', onClick: act('keep'), autofocus: !full }));
      foot.appendChild(btn(`Eat <em>+${fmt(y.food)}</em>`, { ...A, key: '2', action: 'eat', cls: 'gw-cc-act', title: `+${fmt(y.food)} satiety`, onClick: act('eat'), autofocus: full }));
      foot.appendChild(btn(`Render <em>+${fmt(y.oil)}</em>`, { ...A, key: '3', action: 'render', cls: 'gw-cc-act', title: `+${fmt(y.oil)} oil`, onClick: act('render') }));
      if (!legend) foot.appendChild(btn('Release', { ...A, key: '4', action: 'release', cls: 'gw-cc-act', title: '+2% rare-fish luck until tomorrow', onClick: act('release') }));
    }, { dismissable: false, onEscape: () => {}, cls: 'gw-m-center gw-m-catch',
      onKey: (code) => {
        const map = { Digit1: 'keep', Digit2: 'eat', Digit3: 'render', Digit4: 'release', Numpad1: 'keep', Numpad2: 'eat', Numpad3: 'render', Numpad4: 'release' };
        if (map[code]) { K.top()?.el.querySelector(`[data-action="${map[code]}"]:not([disabled])`)?.click(); return true; }
        // the actions read left to right: arrows move the brush stroke along them
        if (code === 'ArrowLeft' || code === 'ArrowRight' || code === 'ArrowUp' || code === 'ArrowDown') {
          const btns = [...(K.top()?.el.querySelectorAll('.gw-catch-actions .gw-btn:not([disabled])') || [])];
          if (!btns.length) return false;
          const i = btns.indexOf(document.activeElement);
          const d = code === 'ArrowLeft' || code === 'ArrowUp' ? -1 : 1;
          btns[(i + d + btns.length) % btns.length].focus();
          sfx('ui_hover', { volume: 0.3 });
          return true;
        }
        return false;
      } });
  }

  // ================================================================== LEVEL-UP PICKER
  function openLevelUp(options) {
    let opts = Array.isArray(options) && options.length ? options : safe(() => ctx.combat?.pendingOptions, null);
    if (!Array.isArray(opts) || !opts.length) return;
    const lu = K.openModal('levelup', (entry, body) => {
      const s = entry.state;
      const r = run();
      const list = s.options;
      const rerollsLeft = Math.max(0, Math.round(stat('rerolls') - num(r?.rerollsUsed)));
      const canSkip = typeof ctx.combat?.skipBoon === 'function' || typeof ctx.combat?.skip === 'function';
      const lp = K.lastLevelUp && (K.lastLevelUp.options === s.ref || K.lastLevelUp.options === list) ? K.lastLevelUp : null;
      const draft = !!(lp?.draft || s.draft || safe(() => ctx.combat?.levelUpKind, null) === 'draft');
      const gift = !!lp?.gift;
      const remaining = Math.max(0, Math.round(num(lp?.remaining, 0)));
      const wrap = h('div', 'gw-lu');
      wrap.innerHTML = `<div class="gw-lu-head"><div class="gw-kicker">${gift ? 'The Warden falls silent' : `Level ${fmt(num(lp?.level, num(r?.level, 1)))}`}${remaining ? ` · ${remaining} more to choose` : ''}</div><h2>${gift ? "A Warden's Gift" : draft ? 'The Kindling Draft' : 'Your Flame Grows'}</h2>
        <div class="gw-pdiv">${ORN.divider}</div><p>${esc(gift ? 'Choose what it leaves you.' : draft ? (D().TEXT?.kindlingDraft || 'Choose what the Waystone carried.') : 'Choose a boon. It lasts the whole descent.')}</p></div>
        <div class="gw-lu-cards"></div><div class="gw-lu-foot"></div>`;
      body.appendChild(wrap);
      const cards = wrap.querySelector('.gw-lu-cards');
      cards.style.setProperty('--n', list.length);
      wrap.classList.toggle('gw-lu--many', list.length >= 4);
      list.forEach((o, i) => {
        const b = K.boonData(o.boonId) || {};
        const kindle = !!o.kindle || (num(o.level) >= 6 && !!b.kindle);
        const rarity = kindle ? 'legendary' : (o.rarity || b.rarity || 'common');
        const name = o.name || (kindle ? b.kindle?.name : b.name) || o.boonId;
        const desc = o.desc || (kindle ? b.kindle?.desc : b.desc) || '';
        const note = o.note || (!kindle ? b.levels?.[num(o.level, 1) - 1]?.note : '') || '';
        const isNew = o.isNew ?? !num(r?.boons?.[o.boonId]);
        const kindLabel = kindle ? 'Kindle' : (o.kind || b.kind) === 'weapon' ? 'Weapon' : (o.fallback || String(o.boonId || '').startsWith('fallback')) ? 'A small mercy' : 'Passive';
        const pair = kindle ? K.boonData(o.fuses || b.kindle?.requires) : null;
        const tags = arr(o.tags || b.tags).slice(0, 3);
        const card = h('button', `gw-card r-${rarity}${kindle ? ' gw-kindle' : ''}`);
        card.type = 'button';
        card.dataset.i = i;
        card.style.setProperty('--rc', K.rarityCss(rarity));
        card.style.setProperty('--i', i);
        card.innerHTML = `<i class="gw-card-frame"></i><span class="gw-card-key">${i + 1}</span><span class="gw-card-kind">${kindLabel}</span>
          <span class="gw-card-medal">${icon(o.icon || b.icon || 'star')}${pair ? `<span class="gw-card-fuse">${icon(pair.icon || 'star')}</span>` : ''}</span>
          <span class="gw-card-name">${esc(name)}</span>
          <span class="gw-card-lv">${kindle ? 'Kindled · Lv 6' : isNew ? '<b>New</b>' : `Lv ${num(o.level, 2) - 1} → ${num(o.level, 2)}`}</span>
          <span class="gw-card-desc">${esc(desc)}</span>
          ${note && note !== desc ? `<span class="gw-card-note">${esc(note)}</span>` : ''}
          ${tags.length ? `<span class="gw-card-tags">${tags.map((t) => `<i>${esc(t)}</i>`).join('')}</span>` : ''}
          <span class="gw-card-rarity">${esc(RARITY_LABEL[rarity] || cap(rarity))}</span>`;
        card.addEventListener('click', () => choose(entry, i));
        card.addEventListener('pointerenter', () => { if (!K.isTouch) sfx('ui_hover', { volume: 0.3 }); });
        cards.appendChild(card);
      });
      const foot = wrap.querySelector('.gw-lu-foot');
      foot.appendChild(btn(`Reroll <em>${rerollsLeft}</em>`, { key: 'R', icon: 'reroll', disabled: rerollsLeft <= 0 && !draft, onClick: () => reroll(entry) }));
      if (canSkip) foot.appendChild(btn(`Skip <em>+${fmt(num(D().BALANCE?.combat?.skipShells ?? D().BALANCE?.xp?.skipShells, 8) * (1 + K.zoneIndex()))}</em>`, { key: 'S', icon: 'shell', onClick: () => skip(entry) }));
      if (draft) foot.appendChild(btn('Auto-draft', { icon: 'flame', onClick: () => autoDraft(entry) }));
    }, { dismissable: false, onEscape: () => {}, cls: 'gw-m-center gw-m-levelup', state: { options: opts, ref: opts, locked: false },
      onKey: (code) => {
        const t = K.top();
        const m = /^(?:Digit|Numpad)([1-4])$/.exec(code);
        if (m) { choose(t, Number(m[1]) - 1); return true; }
        if (code === 'KeyR') { reroll(t); return true; }
        if (code === 'KeyS') { skip(t); return true; }
        return false;
      } });
    // stay in step with combat when a pick is resolved or rerolled elsewhere (debug, auto-draft, API)
    if (lu && !K.isStub(ctx.combat)) {
      lu.tick = () => {
        const s = lu.state;
        if (s.locked) return;
        const po = safe(() => ctx.combat?.pendingOptions, null);
        if (!Array.isArray(po) || !po.length) { K.markResolved(K.optionsSig(s.options), s.ref); K.closeModal('levelup'); return; }
        if (po !== s.ref) { s.options = po; s.ref = po; lu.render(); }
      };
    }
  }
  function choose(entry, i) {
    const s = entry?.state;
    if (!s || s.locked) return;
    const o = s.options?.[i];
    if (!o) return;
    s.locked = true;
    const sig = K.optionsSig(s.options);
    const card = entry.el.querySelector(`.gw-card[data-i="${i}"]`);
    card?.classList.add('gw-chosen');
    entry.el.classList.add('gw-choosing');
    sfx('ui_click');
    const ref = s.ref;
    setTimeout(() => {
      K.markResolved(sig, ref);
      if (ctx.flow !== 'playing' || !run()) { K.closeModal('levelup'); return; }
      try { ctx.combat?.chooseBoon?.(o.boonId); } catch (e) { K.report('chooseBoon', e); }
      K.hud?.dirtyBoons?.();
      K.closeModal('levelup');
    }, 300);
  }
  function reroll(entry) {
    const s = entry?.state;
    if (!s || s.locked) return;
    const r = run();
    const left = Math.round(stat('rerolls') - num(r?.rerollsUsed));
    if (left <= 0) { K.toast('No rerolls left this descent.', 'bad'); sfx('denied'); return; }
    const res = safe(() => ctx.combat?.reroll?.(), null);
    if (Array.isArray(res) && res.length) { s.options = res; s.ref = res; sfx('ui_open', { volume: 0.5 }); entry.render(); }
    else { K.toast('The flame will not be swayed.', 'bad'); sfx('denied'); }
  }
  function skip(entry) {
    const s = entry?.state;
    if (!s || s.locked) return;
    const fn = ctx.combat?.skipBoon || ctx.combat?.skip;
    if (typeof fn !== 'function') return;
    s.locked = true;
    K.markResolved(K.optionsSig(s.options), s.ref);
    try { fn.call(ctx.combat); } catch (e) { K.report('skip', e); }
    K.closeModal('levelup');
  }
  function autoDraft(entry) {
    const s = entry?.state;
    if (!s?.options?.length) return;
    const score = (o) => (['common', 'uncommon', 'rare', 'epic', 'legendary'].indexOf(o.rarity) + 1) * 2 + (o.isNew ? 0 : 3) + (K.boonData(o.boonId)?.kind === 'weapon' ? 1 : 0);
    let best = 0;
    s.options.forEach((o, i) => { if (score(o) > score(s.options[best])) best = i; });
    choose(entry, best);
  }

  // ================================================================== SHOP (Old Murk)
  function itemCategory(it) {
    const d = D();
    const id = String(it?.id || '');
    const bare = id.includes(':') ? id.split(':').pop() : id;
    const c = String(it?.category || '').toLowerCase();
    const tab = String(it?.tab || '').toLowerCase();
    if (tab === 'sell' || c === 'sell' || tab === 'ledger' || c === 'ledger' || it?.kind === 'sell' || it?.kind === 'sellAll' || it?.kind === 'bounty') return null;
    if (tab === 'gear' || tab === 'bait' || tab === 'supplies') return { tab, bare, data: tab === 'gear' ? d.UPGRADE_BY_ID?.[bare] : tab === 'bait' ? d.BAIT_BY_ID?.[bare] : d.SUPPLY_BY_ID?.[bare] };
    if (d.UPGRADE_BY_ID?.[bare] || ['rod', 'line', 'reel', 'lantern', 'creel', 'raft', 'lure', 'gear', 'upgrade', 'upgrades'].includes(c)) return { tab: 'gear', bare, data: d.UPGRADE_BY_ID?.[bare] };
    if (d.BAIT_BY_ID?.[bare] || c === 'bait' || c === 'baits') return { tab: 'bait', bare, data: d.BAIT_BY_ID?.[bare] };
    if (d.SUPPLY_BY_ID?.[bare] || ['supply', 'supplies', 'consumable'].includes(c)) return { tab: 'supplies', bare, data: d.SUPPLY_BY_ID?.[bare] };
    return { tab: 'gear', bare, data: null };
  }
  function giveText(give) {
    const out = [];
    for (const [k, v] of Object.entries(give || {})) {
      if (k === 'oil') out.push(`+${v} oil`); else if (k === 'satiety') out.push(`+${v} satiety`); else if (k === 'hp') out.push(`mends ${v} Ember${v > 1 ? 's' : ''}`);
      else if (k === 'flareCharges') out.push(`${v} free flares`); else if (k === 'spots') out.push(`${v} rich spots`); else out.push(`+${v} ${k}`);
    }
    return out.join(' · ');
  }
  function murkSay(entry, kind) {
    const line = K.pick(D().MERCHANT_LINES?.[kind]);
    if (!line) return;
    entry.state.line = line; entry.state.lineT = 0;
    const el = entry.el.querySelector('.gw-murk-line');
    if (el) { el.classList.remove('gw-in'); void el.offsetWidth; el.textContent = `“${line}”`; el.classList.add('gw-in'); }
  }
  function openShop() {
    const r = run();
    if (!r) return;
    const st = { tab: arr(r.creel).length ? 'sell' : 'gear', line: '', lineT: 0 };
    const oilLow = num(r.oil) / Math.max(1, stat('maxOil')) < 0.25;
    const pi = K.phaseInfo();
    st.line = K.pick(D().MERCHANT_LINES?.[oilLow ? 'lowOil' : pi?.phase === 'calm' && num(pi?.k) > 0.85 ? 'warn' : 'arrive']) || '';
    const entry = K.openModal('shop', (entry, body) => renderShop(entry, body), { state: st, cls: 'gw-m-shop',
      onKey: (code) => tabKeys(entry, ['sell', 'gear', 'bait', 'supplies', 'ledger'], () => entry.state.tab, (v) => { entry.state.tab = v; })(code) });
    entry.tick = (dt) => {
      entry.state.lineT += dt;
      if (entry.state.lineT > 11) murkSay(entry, 'browse');
    };
  }
  function renderShop(entry, body) {
    const s = entry.state;
    const r = run();
    if (!r) { K.closeModal('shop'); return; }
    const shells = num(r.shells);
    const { panel: pn, content, foot } = panel(entry, body, { cls: 'gw-p-wide gw-p-shop' });
    const head = h('div', 'gw-shop-head');
    head.innerHTML = `<div class="gw-murk-wrap">${murkPortrait()}</div><div class="gw-shop-say"><div class="gw-kicker">Old Murk's Barge</div><div class="gw-murk-line gw-in">“${esc(s.line || '…')}”</div></div><div class="gw-purse">${icon('shell')}<b>${fmt(shells)}</b><small>Shells</small></div>`;
    pn.insertBefore(head, content);
    const items = arr(safe(() => ctx.progression?.shop?.getItems?.(), []));
    const by = { gear: [], bait: [], supplies: [] };
    const sellPrice = new Map();
    for (const it of items) {
      if (it?.fish?.uid && typeof it.price === 'number') sellPrice.set(it.fish.uid, it.price);
      const c = itemCategory(it);
      if (c) by[c.tab].push({ it, c });
    }
    const bounties = arr(safe(() => ctx.progression?.getBounties?.(), []));
    const T = [
      { id: 'sell', label: 'Sell', icon: 'shell', badge: arr(r.creel).length || '' },
      { id: 'gear', label: 'Gear', icon: 'rod' },
      { id: 'bait', label: 'Bait', icon: 'worm' },
      { id: 'supplies', label: 'Supplies', icon: 'oil' },
      { id: 'ledger', label: 'Ledger', icon: 'ledger', badge: bounties.filter((b) => !b.done && !b.complete).length || '' },
    ];
    pn.insertBefore(tabs(T, s.tab, (id) => { s.tab = id; entry.render(); }), content);
    content.classList.add('gw-scroll', 'gw-shop-list');
    const buy = (it) => {
      const res = safe(() => ctx.progression?.shop?.buy?.(it.id), null);
      if (res && res.ok !== false) { murkSay(entry, 'buy'); K.hud?.dirtyStats?.(); entry.render(); }
      else {
        sfx('denied');
        if (num(it.price) > num(run()?.shells)) murkSay(entry, 'poor');
        K.toast(res?.msg || it.reason || 'Old Murk shakes his head.', 'bad');
      }
    };
    const itemRow = ({ it, c }) => {
      const d = c.data || {};
      const row = h('div', `gw-item${it.canBuy === false ? ' gw-cant' : ''}`);
      const lv = num(it.level, 0), max = num(it.maxLevel, num(d.maxLevel, 0));
      let fx = typeof it.effectText === 'string' && it.effectText ? it.effectText : '';
      if (fx) { /* provided by progression */ }
      else if (c.tab === 'gear') fx = K.effectLines(d.effects).join(' · ');
      else if (c.tab === 'bait') {
        if (d.legend) { const leg = arr(D().SPECIES).find((x) => x.bait === d.id && x.rarity === 'legendary'); fx = leg ? `Draws ${leg.name} to its pool` : 'Legend bait'; }
        else { const parts = K.effectLines(d.bonus); const req = arr(D().SPECIES).filter((x) => x.bait === d.id && x.rarity !== 'legendary').map((x) => x.name); if (req.length) parts.push(`Needed for ${req.join(', ')}`); fx = parts.join(' · '); }
        if (d.count && d.count > 1) fx = `${d.count} per bundle${fx ? ' · ' + fx : ''}`;
      } else if (c.tab === 'supplies') fx = giveText(d.give);
      const maxed = it.maxed === true || (c.tab === 'gear' && max > 0 && lv >= max);
      row.innerHTML = `<span class="gw-item-ico${d.legend ? ' gw-legend' : ''}">${icon(d.icon || (c.tab === 'bait' ? 'worm' : c.tab === 'supplies' ? 'oil' : 'rod'))}</span>
        <div class="gw-item-text"><div class="gw-item-name">${esc(it.name || d.name || it.id)}${max > 1 ? pips(lv, max) : ''}${c.tab === 'bait' && num(run()?.bait?.[d.id || c.bare]) ? `<span class="gw-own">own ${num(run()?.bait?.[d.id || c.bare])}</span>` : ''}</div>
        <div class="gw-item-desc">${esc(it.desc || d.desc || '')}</div>${fx ? `<div class="gw-item-fx">${esc(fx)}</div>` : ''}
        ${it.canBuy === false && it.reason && !maxed ? `<div class="gw-item-why">${esc(it.reason)}</div>` : ''}</div>`;
      const b = btn(maxed ? 'Owned' : shellTag(num(it.price)), { cls: 'gw-buy', disabled: maxed || it.canBuy === false, title: it.reason || '', onClick: () => buy(it), sound: false });
      row.appendChild(b);
      return row;
    };
    if (s.tab === 'sell') {
      const creel = arr(r.creel);
      if (!creel.length) content.innerHTML = `<p class="gw-empty">Your creel is empty. “Nothing to sell? Then buy something.”</p>`;
      for (const f of creel) {
        const sp = K.speciesData(f.speciesId);
        const y = fishYields(f);
        if (sellPrice.has(f.uid)) y.sell = sellPrice.get(f.uid);
        const row = h('div', `gw-item gw-fishrow r-${sp?.rarity || 'common'}`);
        row.style.setProperty('--rc', K.rarityCss(sp?.rarity));
        row.appendChild(fishCanvas(sp, 74, 40));
        row.insertAdjacentHTML('beforeend', `<div class="gw-item-text"><div class="gw-item-name">${esc(sp?.name || f.speciesId)}${qPill(f.quality)}</div><div class="gw-item-desc">${fmtKg(f.weight)}${sp?.rarity === 'legendary' ? ' · Trophy or Toll: its price pays the way down, or keep it to mount for Memories.' : ''}</div></div>`);
        row.appendChild(btn(`Sell ${shellTag(y.sell)}`, { cls: 'gw-buy', onClick: () => { if (doFishAction(f, 'sell')) { murkSay(entry, sp?.rarity === 'legendary' ? 'legendary' : 'sell'); entry.render(); } }, sound: false }));
        content.appendChild(row);
      }
      const sellable = creel.filter((f) => K.speciesData(f.speciesId)?.rarity !== 'legendary');
      if (sellable.length > 1) {
        const total = sellable.reduce((a, f) => a + (sellPrice.has(f.uid) ? sellPrice.get(f.uid) : fishYields(f).sell), 0);
        foot.appendChild(btn(`Sell all but legends ${shellTag(total)}`, { cls: 'gw-btn--primary', onClick: () => {
          let n = 0; for (const f of [...sellable]) if (doFishAction(f, 'sell')) n++;
          if (n) { murkSay(entry, 'sell'); entry.render(); }
        } }));
      }
    } else if (s.tab === 'ledger') {
      if (!bounties.length) content.innerHTML = `<p class="gw-empty">The ledger is blank today. “Come back tomorrow. Murk always has a job for small hands.”</p>`;
      for (const b of bounties) {
        const sp = K.speciesData(b.target?.speciesId || b.target?.species || b.speciesId);
        const text = fill(b.text || '', { n: b.count, species: sp?.name || 'fish', kg: b.target?.kg ?? '', legend: sp?.name || 'the legend' });
        const cnt = Math.max(1, num(b.count, 1)), prog = Math.min(cnt, num(b.progress));
        const done = !!(b.done || b.complete || b.completed) || prog >= cnt;
        const row = h('div', `gw-item gw-bounty${done ? ' gw-done' : ''}`);
        row.innerHTML = `<span class="gw-item-ico">${icon(done ? 'check' : 'ledger')}</span><div class="gw-item-text"><div class="gw-item-name">${esc(text)}</div>
          <div class="gw-bounty-prog">${bar(prog / cnt)}<span>${fmt(prog)} / ${fmt(cnt)}</span></div>
          <div class="gw-item-desc">${done ? 'Honoured.' : b.expiresDay ? `Due by the end of day ${b.expiresDay}.` : ''}</div></div><span class="gw-bounty-rew">${shellTag(num(b.reward?.shells))}</span>`;
        content.appendChild(row);
      }
    } else {
      const list = by[s.tab];
      if (!list.length) content.innerHTML = `<p class="gw-empty">“Sold out of that. Or never had it. Murk forgets.”</p>`;
      if (s.tab === 'gear') {
        const order = ['rod', 'line', 'reel', 'lantern', 'creel', 'raft', 'lure'];
        const groups = new Map();
        for (const x of list) { const g = x.it.group || x.c.data?.category || x.it.category || 'gear'; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(x); }
        const keys = [...groups.keys()].sort((a, b) => (order.indexOf(a) + 99) % 99 - (order.indexOf(b) + 99) % 99);
        for (const g of keys) { content.insertAdjacentHTML('beforeend', `<div class="gw-group">${esc(cap(g))}</div>`); for (const x of groups.get(g)) content.appendChild(itemRow(x)); }
      } else for (const x of list) content.appendChild(itemRow(x));
    }
    foot.appendChild(btn('Leave', { onClick: () => K.closeModal('shop'), autofocus: s.tab !== 'sell' }));
  }

  // ================================================================== CREEL
  function openCreel(extra = {}) {
    if (!run()) return;
    K.openModal('creel', (entry, body) => {
      const r = run();
      if (!r) return;
      const creel = arr(r.creel);
      const cs = Math.round(stat('creelSize'));
      const canSell = !!safe(() => ctx.progression?.canShop?.(), false);
      const { content, foot } = panel(entry, body, { title: 'The Creel', sub: `${creel.length} of ${cs} slots · your only oil when the dark comes`, cls: 'gw-p-creel' });
      content.classList.add('gw-scroll');
      const slots = h('div', 'gw-slots');
      for (let i = 0; i < cs; i++) slots.insertAdjacentHTML('beforeend', `<i class="${i < creel.length ? 'on' : ''}"></i>`);
      content.appendChild(slots);
      if (!creel.length) content.insertAdjacentHTML('beforeend', '<p class="gw-empty">Empty. Every fish is food, oil or Shells; this is where you keep the ones you have not decided about.</p>');
      for (const f of creel) {
        const sp = K.speciesData(f.speciesId);
        const y = fishYields(f);
        const row = h('div', `gw-item gw-fishrow r-${sp?.rarity || 'common'}`);
        row.style.setProperty('--rc', K.rarityCss(sp?.rarity));
        row.appendChild(fishCanvas(sp, 80, 44));
        row.insertAdjacentHTML('beforeend', `<div class="gw-item-text"><div class="gw-item-name">${esc(sp?.name || f.speciesId)}${qPill(f.quality)}</div><div class="gw-item-desc">${fmtKg(f.weight)} · worth ${fmt(y.sell)} Shells</div></div>`);
        const acts = h('div', 'gw-fish-acts');
        acts.appendChild(btn(`Eat <em>+${y.food}</em>`, { cls: 'gw-btn--sm', icon: 'food', onClick: () => { if (doFishAction(f, 'eat')) entry.render(); } }));
        acts.appendChild(btn(`Render <em>+${y.oil}</em>`, { cls: 'gw-btn--sm', icon: 'oil', onClick: () => { if (doFishAction(f, 'render')) entry.render(); } }));
        if (canSell) acts.appendChild(btn(`Sell <em>${y.sell}</em>`, { cls: 'gw-btn--sm', icon: 'shell', onClick: () => { if (doFishAction(f, 'sell')) entry.render(); } }));
        if (sp?.rarity !== 'legendary') acts.appendChild(btn('Release', { cls: 'gw-btn--sm gw-btn--ghost', onClick: () => { if (doFishAction(f, 'release')) entry.render(); } }));
        row.appendChild(acts);
        content.appendChild(row);
      }
      // bait
      const owned = arr(D().BAITS).filter((b) => num(r.bait?.[b.id]) > 0);
      const eq = safe(() => ctx.progression?.getEquippedBait?.(), r.equippedBait ?? null);
      const eqId = typeof eq === 'object' && eq ? eq.id : eq;
      const bait = h('div', 'gw-baits');
      bait.innerHTML = `<div class="gw-group">Bait</div>`;
      const row = h('div', 'gw-bait-row');
      const chip = (id, label, count, ic, legend) => {
        const b = h('button', `gw-baitchip${(eqId || null) === id ? ' gw-on' : ''}${legend ? ' gw-legend' : ''}`, `${icon(ic)}<span>${esc(label)}</span>${count !== null ? `<em>×${count}</em>` : ''}`);
        b.type = 'button';
        b.addEventListener('click', () => { const res = safe(() => ctx.progression?.equipBait?.(id), null); if (res && res.ok === false && res.msg) K.toast(res.msg, 'bad'); sfx('ui_click'); K.hud?.dirtyStats?.(); entry.render(); });
        return b;
      };
      row.appendChild(chip(null, 'Bare hook', null, 'hook', false));
      for (const b of owned) row.appendChild(chip(b.id, b.name, num(r.bait[b.id]), b.icon || 'worm', b.legend));
      bait.appendChild(row);
      content.appendChild(bait);
      foot.appendChild(btn('Close', { onClick: () => K.closeModal('creel'), autofocus: true }));
    }, { state: { ...extra } });
  }

  // ================================================================== JOURNAL
  function openJournal(extra = {}) {
    const zones = arr(D().ZONES);
    const cur = run()?.zone || 'mossmere';
    K.openModal('journal', (entry, body) => {
      const s = entry.state;
      const m = meta();
      const J = m.journal || {};
      const T = D().TEXT || {};
      const allSp = arr(D().SPECIES);
      const named = allSp.filter((x) => J[x.id]).length;
      const { panel: pn, content, foot } = panel(entry, body, { title: T.journalTitle || 'Journal', sub: `${named} of ${allSp.length} names written`, cls: 'gw-p-wide gw-p-journal' });
      const tabList = zones.map((z) => { const sps = allSp.filter((x) => x.zone === z.id); const n = sps.filter((x) => J[x.id]).length; return { id: z.id, label: z.name.replace(/^The /, ''), badge: `${n}/${sps.length}` }; });
      pn.insertBefore(tabs(tabList, s.zone, (id) => { s.zone = id; s.sel = null; entry.render(); }), content);
      const z = K.zoneData(s.zone);
      const sps = allSp.filter((x) => x.zone === s.zone);
      const nZ = sps.filter((x) => J[x.id]).length;
      const perk = D().JOURNAL_PERKS?.[s.zone];
      const wrap = h('div', 'gw-jr');
      const grid = h('div', 'gw-jr-grid gw-scroll');
      if (!s.sel || !sps.some((x) => x.id === s.sel)) s.sel = (sps.find((x) => J[x.id]) || sps[0])?.id;
      for (const sp of sps) {
        const known = !!J[sp.id];
        const mastery = known && num(J[sp.id].caught) >= num(D().BALANCE?.journal?.masteryAt, 10);
        const c = h('button', `gw-jr-card r-${sp.rarity}${known ? '' : ' gw-unknown'}${sp.id === s.sel ? ' gw-on' : ''}${mastery ? ' gw-gold' : ''}`);
        c.type = 'button';
        c.style.setProperty('--rc', K.rarityCss(sp.rarity));
        c.appendChild(fishCanvas(sp, 116, 62, { silhouette: !known }));
        c.insertAdjacentHTML('beforeend', `<span class="gw-jr-name">${known ? esc(sp.name) : '· · ·'}</span><span class="gw-jr-rar">${esc(RARITY_LABEL[sp.rarity] || '')}</span>`);
        c.addEventListener('click', () => { s.sel = sp.id; sfx('ui_click'); entry.render(); });
        grid.appendChild(c);
      }
      wrap.appendChild(grid);
      const sp = sps.find((x) => x.id === s.sel);
      const det = h('div', 'gw-jr-detail');
      if (sp) {
        const rec = J[sp.id];
        const known = !!rec;
        const art = h('div', 'gw-jr-art');
        art.style.setProperty('--rc', K.rarityCss(sp.rarity));
        art.appendChild(fishCanvas(sp, K.vw < 700 ? 240 : 300, K.vw < 700 ? 120 : 150, { silhouette: !known }));
        det.appendChild(art);
        if (known) {
          det.insertAdjacentHTML('beforeend', `<h3>${esc(sp.name)}</h3>${sp.epithet ? `<div class="gw-catch-epithet">${esc(sp.epithet)}</div>` : ''}
            <div class="gw-kicker" style="--rc:${K.rarityCss(sp.rarity)}">${esc(RARITY_LABEL[sp.rarity] || '')}</div>
            <p class="gw-lore">${esc(sp.lore || '')}</p>
            <dl class="gw-facts"><div><dt>Biggest</dt><dd>${rec.biggest ? fmtKg(rec.biggest) : '—'}</dd></div><div><dt>Caught</dt><dd>${fmt(rec.caught || 0)}</dd></div>
            <div><dt>First</dt><dd>${rec.firstDay ? `Day ${rec.firstDay}` : '—'}${rec.firstRun ? `, descent ${rec.firstRun}` : ''}</dd></div><div><dt>Weight</dt><dd>${arr(sp.weight).length ? `${sp.weight[0]}–${sp.weight[1]} kg` : '—'}</dd></div></dl>
            <p class="gw-jr-where">${icon('map_pin')}${esc(hintFor(sp, true))}</p>`);
        } else {
          det.insertAdjacentHTML('beforeend', `<h3 class="gw-dim">Unnamed</h3><p class="gw-lore">${esc(T.journalUnknown || '')}</p><p class="gw-jr-where">${icon('quill')}${esc(hintFor(sp))}</p>`);
        }
      }
      wrap.appendChild(det);
      content.appendChild(wrap);
      foot.insertAdjacentHTML('beforeend', `<div class="gw-jr-foot"><span>${esc(z?.name || '')}: ${nZ} / ${sps.length} named</span>${perk ? `<span class="${nZ >= sps.length ? 'gw-earned' : ''}">${icon(nZ >= sps.length ? 'check' : 'lock')} ${esc(perk.label)} — ${esc(perk.desc)}</span>` : ''}</div>`);
      foot.appendChild(btn('Close', { onClick: () => K.closeModal('journal'), autofocus: true }));
    }, { state: { zone: zones.some((z) => z.id === cur) ? cur : 'mossmere', sel: null, titleChild: ctx.flow !== 'playing', ...extra },
      onKey: (code) => { const t = K.top(); return tabKeys(t, zones.map((z) => z.id), () => t.state.zone, (v) => { t.state.zone = v; t.state.sel = null; })(code); } });
  }

  // ================================================================== SHRINE
  function openShrine() {
    K.openModal('shrine', (entry, body) => {
      const s = entry.state;
      const m = meta();
      const T = D().TEXT || {};
      const list = relics();
      const { panel: pn, content, foot } = panel(entry, body, { title: T.shrineTitle || 'Shrine', sub: esc(T.shrineSubtitle || ''), cls: 'gw-p-wide gw-p-shrine' });
      const purse = h('div', 'gw-shrine-purse', `${icon('memory')}<b>${fmt(m.memories || 0)}</b><small>Memories</small>`);
      pn.insertBefore(purse, content);
      const wrap = h('div', 'gw-shrine');
      const grid = h('div', 'gw-shrine-grid gw-scroll');
      if (!s.sel) s.sel = (list.find((r) => r.canBuy) || list.find((r) => r.revealed && !r.maxed) || list[0])?.id;
      list.forEach((r, i) => {
        const c = h('button', `gw-relic${r.revealed ? '' : ' gw-hidden'}${r.maxed ? ' gw-maxed' : ''}${r.canBuy ? ' gw-can' : ''}${r.id === s.sel ? ' gw-on' : ''}`);
        c.type = 'button';
        c.innerHTML = `${relicLantern(r.revealed ? r.level / r.max : 0, { hidden: !r.revealed, uid: 'r' + i + uid() })}<span class="gw-relic-name">${r.revealed ? esc(r.name) : 'Unlit lantern'}</span>${r.revealed && r.max > 1 ? pips(r.level, r.max) : ''}`;
        c.addEventListener('click', () => { s.sel = r.id; sfx('ui_click'); entry.render(); });
        grid.appendChild(c);
      });
      wrap.appendChild(grid);
      const r = list.find((x) => x.id === s.sel);
      const det = h('div', 'gw-shrine-detail');
      if (r) {
        if (r.revealed) {
          const eff = K.effectLines(r.effects);
          det.innerHTML = `<div class="gw-sd-lantern">${relicLantern(r.level / r.max, { uid: 'sd' + uid() })}</div><h3>${esc(r.name)}</h3>
            <div class="gw-kicker">${r.maxed ? 'Fully lit' : `Level ${r.level} of ${r.max}`}</div>${r.max > 1 ? pips(r.level, r.max) : ''}
            <p class="gw-item-desc">${esc(r.desc || '')}</p>${eff.length ? `<div class="gw-chips">${eff.map((e) => `<span class="gw-chip gw-pos">${esc(e)} / level</span>`).join('')}</div>` : ''}`;
          const b = btn(r.maxed ? 'Fully lit' : `Relight ${memTag(r.nextCost)}`, { cls: 'gw-btn--primary', disabled: !r.canBuy, autofocus: true, title: r.reason, sound: false, onClick: () => {
            const res = safe(() => ctx.progression?.buyRelic?.(r.id), null);
            if (res && res.ok !== false) { K.toast(`${r.name} relit.`, 'good', { icon: 'flame' }); entry.render(); }
            else { sfx('denied'); K.toast(res?.msg || r.reason || 'The lantern will not take.', 'bad'); }
          } });
          det.appendChild(b);
          if (!r.canBuy && !r.maxed && r.reason) det.insertAdjacentHTML('beforeend', `<div class="gw-item-why">${esc(r.reason)}</div>`);
        } else {
          det.innerHTML = `<div class="gw-sd-lantern">${relicLantern(0, { hidden: true, uid: 'sh' + uid() })}</div><h3 class="gw-dim">An unlit lantern</h3><p class="gw-lore">${esc(relicRevealText(r))}</p>`;
        }
      }
      wrap.appendChild(det);
      content.appendChild(wrap);
      foot.appendChild(btn('Close', { onClick: () => K.closeModal('shrine') }));
    }, { state: { sel: null, titleChild: true } });
  }

  // ================================================================== CHALLENGES (Trials)
  function openChallenges() {
    K.openModal('challenges', (entry, body) => {
      const list = challenges();
      const T = D().TEXT || {};
      const done = list.filter((c) => c.done).length;
      const { content, foot } = panel(entry, body, { title: T.challengesTitle || 'Trials', sub: `${done} of ${list.length} complete`, cls: 'gw-p-wide gw-p-trials' });
      content.classList.add('gw-scroll');
      const tiers = [...new Set(list.map((c) => c.tier || 1))].sort();
      for (const tier of tiers) {
        const group = list.filter((c) => (c.tier || 1) === tier);
        const sec = h('section', 'gw-trial-tier');
        sec.innerHTML = `<div class="gw-group">${esc(T.challengeTiers?.[tier] || `Tier ${tier}`)}<span>${group.filter((c) => c.done).length} / ${group.length}</span></div>`;
        for (const c of group) {
          const rew = [];
          if (c.reward?.unlock) rew.push(K.unlockLabel(c.reward.unlock));
          if (c.reward?.memories) rew.push(`${c.reward.memories} Memories`);
          const row = h('div', `gw-trial${c.done ? ' gw-done' : ''}`);
          row.innerHTML = `<span class="gw-trial-mark">${c.done ? icon('flame') : icon('ember')}</span>
            <div class="gw-trial-text"><div class="gw-trial-name">${esc(c.name)}</div><div class="gw-item-desc">${esc(c.desc)}</div>
            ${!c.done && c.target > 1 ? `<div class="gw-trial-prog">${bar(c.progress / c.target)}<span>${fmt(c.progress)} / ${fmt(c.target)}</span></div>` : ''}</div>
            <div class="gw-trial-rew">${rew.map((x) => `<span>${esc(x)}</span>`).join('')}</div>`;
          sec.appendChild(row);
        }
        content.appendChild(sec);
      }
      foot.appendChild(btn('Close', { onClick: () => K.closeModal('challenges'), autofocus: true }));
    }, { state: { titleChild: true } });
  }

  // ================================================================== SETTINGS
  function openSettings(extra = {}) {
    K.openModal('settings', (entry, body) => {
      const S = K.settings();
      const { content, foot } = panel(entry, body, { title: 'Settings', cls: 'gw-p-settings' });
      content.classList.add('gw-scroll');
      const apply = () => { safe(() => ctx.audio?.applySettings?.(), null); safe(() => ctx.game?.save?.(), null); };
      const slider = (key, label, def) => {
        const row = h('label', 'gw-set-row');
        const v = Math.round(num(S[key], def) * 100);
        row.innerHTML = `<span class="gw-set-label">${esc(label)}</span><input type="range" min="0" max="100" step="1" value="${v}" aria-label="${esc(label)}"><output>${v}</output>`;
        const inp = row.querySelector('input'), out = row.querySelector('output');
        const set = (val) => { val = Math.max(0, Math.min(100, Math.round(val))); inp.value = val; out.textContent = val; inp.style.setProperty('--v', val + '%'); S[key] = val / 100; apply(); };
        inp.style.setProperty('--v', v + '%');
        inp.addEventListener('input', () => set(Number(inp.value)));
        inp.addEventListener('change', () => sfx('ui_click', { volume: 0.6 }));
        inp.addEventListener('keydown', (e) => {
          const d = e.code === 'ArrowRight' || e.code === 'ArrowUp' ? 5 : e.code === 'ArrowLeft' || e.code === 'ArrowDown' ? -5 : 0;
          if (d) { e.preventDefault(); set(Number(inp.value) + d); sfx('ui_hover', { volume: 0.3 }); }
        });
        return row;
      };
      const toggleRow = (key, label, def, sub = '') => {
        const row = h('div', 'gw-set-row');
        const on = S[key] === undefined ? def : !!S[key];
        row.innerHTML = `<span class="gw-set-label">${esc(label)}${sub ? `<small>${esc(sub)}</small>` : ''}</span>`;
        const b = h('button', `gw-toggle${on ? ' gw-on' : ''}`, '<i></i>');
        b.type = 'button';
        b.setAttribute('role', 'switch');
        b.setAttribute('aria-checked', on ? 'true' : 'false');
        b.setAttribute('aria-label', label);
        b.addEventListener('click', () => { S[key] = !(S[key] === undefined ? def : !!S[key]); sfx('ui_click'); apply(); entry.render(); });
        row.appendChild(b);
        return row;
      };
      content.insertAdjacentHTML('beforeend', '<div class="gw-group">Sound</div>');
      content.appendChild(slider('master', 'Master', 0.8));
      content.appendChild(slider('music', 'Music', 0.6));
      content.appendChild(slider('sfx', 'Effects', 0.9));
      content.insertAdjacentHTML('beforeend', '<div class="gw-group">Picture</div>');
      const qrow = h('div', 'gw-set-row');
      qrow.innerHTML = '<span class="gw-set-label">Quality</span>';
      const seg = h('div', 'gw-seg');
      for (const qv of ['auto', 'low', 'medium', 'high']) {
        const b = h('button', `gw-seg-b${(S.quality || 'auto') === qv ? ' gw-on' : ''}`, cap(qv));
        b.type = 'button';
        b.addEventListener('click', () => { S.quality = qv; safe(() => ctx.render?.setQuality?.(qv), null); sfx('ui_click'); apply(); entry.render(); });
        seg.appendChild(b);
      }
      qrow.appendChild(seg);
      content.appendChild(qrow);
      content.appendChild(toggleRow('screenShake', 'Screen shake', true));
      content.appendChild(toggleRow('damageNumbers', 'Damage numbers', true));
      content.appendChild(toggleRow('reducedFlashing', 'Reduced flashing', false, 'Softer flares and hit flashes'));
      content.insertAdjacentHTML('beforeend', '<div class="gw-group">Fishing</div>');
      content.appendChild(toggleRow('reelToggle', 'Tap to reel', false, 'Tap once to start reeling, tap again to ease'));
      if (D().V3_ENABLED) content.appendChild(toggleRow('favourDetails', 'Favour details', false, "Always list what the water favours beside the float, not only on a long press"));
      content.insertAdjacentHTML('beforeend', '<div class="gw-group">The Long Dark</div>');
      const rrow = h('div', 'gw-set-row');
      rrow.innerHTML = '<span class="gw-set-label">Forget everything<small>Memories, relics, trials, the Journal. There is no undo.</small></span>';
      rrow.appendChild(btn('Erase', { cls: 'gw-btn--danger gw-btn--sm', onClick: () => confirm('Forget everything?', { sub: 'Every Memory, relic, trial and name in the Journal will be lost.', yes: 'Forget', danger: true, onYes: () => confirm('Truly?', { sub: 'The water will not remember you.', yes: 'Erase it all', danger: true, onYes: () => { K.closeAll(); safe(() => ctx.game?.wipeAll?.(), null); } }) }) }));
      content.appendChild(rrow);
      foot.appendChild(btn('Done', { onClick: () => K.closeModal('settings'), autofocus: true }));
    }, { state: { ...extra } });
  }

  // ================================================================== PAUSE
  function resume() { K.closeModal('pause'); K.closeAll((m) => m.state?.pauseChild); safe(() => ctx.game?.resume?.(), null); if (ctx.paused) ctx.paused = false; }
  function openPause() {
    if (ctx.flow !== 'playing') return;
    if (K.has('pause')) return;
    K.openModal('pause', (entry, body) => {
      const r = run();
      const z = K.zoneData(r?.zone);
      const ch = D().CHARACTER_BY_ID?.[r?.character];
      const { content, foot } = panel(entry, body, { title: 'The Water Waits', sub: r ? `Day ${r.day || 1} · ${esc(z?.name || '')} · Level ${r.level || 1}${ch ? ` · ${esc(ch.name)}` : ''}` : '', cls: 'gw-p-pause', close: false });
      const menu = h('nav', 'gw-pause-menu');
      menu.appendChild(btn('Resume', { cls: 'gw-mbtn gw-btn--primary', icon: 'flame', autofocus: true, onClick: resume }));
      menu.appendChild(btn('Journal', { cls: 'gw-mbtn', icon: 'journal', onClick: () => openJournal({ pauseChild: true }) }));
      menu.appendChild(btn('Settings', { cls: 'gw-mbtn', icon: 'sun', onClick: () => openSettings({ pauseChild: true }) }));
      menu.appendChild(btn('Return to Title', { cls: 'gw-mbtn', icon: 'gate', title: 'Your descent will wait for you', onClick: () => { K.closeAll(); safe(() => ctx.game?.toTitle?.(), null); } }));
      menu.appendChild(btn('Abandon Descent', { cls: 'gw-mbtn gw-btn--danger', icon: 'close', onClick: () => confirm('Abandon this descent?', { sub: 'The run ends here. Memories are still banked.', yes: 'Let the flame go', danger: true, onYes: () => { K.closeAll(); safe(() => ctx.game?.resume?.(), null); safe(() => ctx.game?.endRun?.('abandoned'), null); } }) }));
      content.appendChild(menu);
      content.insertAdjacentHTML('beforeend', '<p class="gw-pause-note">Returning to the title keeps this descent waiting.</p>');
      const boons = arr(safe(() => ctx.combat?.getBoons?.(), null));
      const list = boons.length ? boons.map((g) => ({ b: g.boon || K.boonData(g.boonId || g.id), level: num(g.level, 1) })).filter((x) => x.b)
        : Object.entries(r?.boons || {}).map(([id, l]) => ({ b: K.boonData(id), level: num(l, 1) })).filter((x) => x.b);
      if (list.length) {
        const bl = h('div', 'gw-pause-boons');
        bl.innerHTML = `<div class="gw-group">Your flame</div>` + list.map((x) => `<div class="gw-pb" style="--rc:${K.rarityCss(x.level >= 6 ? 'legendary' : x.b.rarity)}" title="${esc(x.b.desc || '')}">${icon(x.b.icon || 'star')}<span>${esc(x.level >= 6 && x.b.kindle ? x.b.kindle.name : x.b.name)}</span><em>${x.level}</em></div>`).join('');
        content.appendChild(bl);
      }
      foot.remove();
    }, { dismissable: true, onEscape: resume, cls: 'gw-m-center', onKey: menuArrows });
  }

  // ================================================================== DESCEND
  function openDescend() {
    if (!run()) return;
    K.openModal('descend', (entry, body) => {
      const r = run();
      const info = safe(() => ctx.progression?.getGateInfo?.(), null) || {};
      const next = zoneOf(info.nextZone) || arr(D().ZONES).find((z) => z.index === K.zoneIndex() + 1);
      const T = D().TEXT || {};
      const { content, foot } = panel(entry, body, { title: K.zoneData(r?.zone)?.gateName || 'The Descent Gate', sub: info.open ? 'The whirlpool churns, waiting.' : 'The whirlpool is sealed.', cls: 'gw-p-descend' });
      if (!next) { content.innerHTML = '<p class="gw-lore">There is no deeper water. Only the Well, and what breathes in it.</p>'; foot.appendChild(btn('Back', { onClick: () => K.closeModal('descend'), autofocus: true })); return; }
      const toll = num(info.toll, num(next.unlock?.shells, 0));
      const shells = num(r?.shells);
      const phase = K.phaseInfo()?.phase || r?.phase;
      const okPhase = arr(D().BALANCE?.travel?.phases || ['calm', 'dawn']).includes(phase);
      content.innerHTML = `<div class="gw-zone-card" style="--zc:${K.cssHex(next.palette?.glow, '#9fa2d8')};--zf:${K.cssHex(next.palette?.fog, '#1d245d')};--za:${K.cssHex(next.palette?.accent, '#b9b0e6')}">
          <div class="gw-zone-sky"></div><div class="gw-kicker">Below lies</div><h3>${esc(next.name)}</h3><div class="gw-catch-epithet">${esc(next.subtitle || '')}</div>
          <p class="gw-lore">${esc(next.description || '')}</p></div>`;
      if (info.open) {
        content.insertAdjacentHTML('beforeend', `<p class="gw-descend-q">${esc(info.prompt || fill(T.descendPrompt || 'Feed the whirlpool {toll} Shells and sink to {zone}?', { toll: fmt(toll), zone: next.name }))}</p>
          <div class="gw-descend-warn">${icon('eye')}<span>The Gloom grows hungrier below (+3 Heat). The way is one-way. Boons, creel, gear and Shells come with you.</span></div>
          <div class="gw-descend-purse">You carry ${shellTag(shells)}${shells < toll ? ` · <b class="gw-neg">${fmt(toll - shells)} short</b>` : ''}</div>
          ${okPhase ? '' : '<div class="gw-item-why">The gate sleeps through dusk and the Gloomtide.</div>'}`);
      } else {
        const reqs = arr(info.requirements);
        content.insertAdjacentHTML('beforeend', `<ul class="gw-reqs">${reqs.length ? reqs.map((q) => `<li class="${q.done ? 'gw-done' : ''}">${icon(q.done ? 'check' : 'lock')}<span>${esc(q.label || '')}</span></li>`).join('') : `<li>${icon('lock')}<span>${esc(fill(T.gateSealed || 'The Gate is sealed.', { requirement: '' }))}</span></li>`}</ul>
          <div class="gw-descend-purse">Toll: ${shellTag(toll)} · you carry ${shellTag(shells)}</div>`);
      }
      foot.appendChild(btn('Not yet', { onClick: () => K.closeModal('descend'), autofocus: !info.open }));
      if (info.open) foot.appendChild(btn(toll ? `Descend ${shellTag(toll)}` : 'Descend', { cls: 'gw-btn--primary', icon: 'gate', disabled: info.canDescend === false || shells < toll || !okPhase, title: info.reason || '', autofocus: true, onClick: () => {
        const res = safe(() => ctx.progression?.travel?.(next.id), null);
        if (res && res.ok !== false) K.closeModal('descend');
        else { sfx('denied'); K.toast(res?.msg || 'The whirlpool refuses you.', 'bad'); }
      } }));
    }, { cls: 'gw-m-center' });
  }

  // ================================================================== DEATH / RUN SUMMARY
  const TIPS_BY_KIND = {
    wisp: 'Brighter Wick widens your light: the aura burns them before they reach you.',
    mite: 'Islands break inkmite packs. Keep moving and drag them through your light.',
    moth: 'A flare clears every latched moth, and zapping one refunds oil.',
    eel: 'Zap eels mid-leap for double damage.',
    hand: 'Sail off the ink stain before the hand breaches, then flare it.',
    warden: "Watch a Warden's tells, kite it, and keep your light wide.",
    darkness: 'Keep a fish for the night: Burn (R) renders it into oil without stopping.',
    starvation: 'Eat a fish each day. A full belly also mends an Ember at dawn.',
  };
  function topDamage() {
    let best = null, n = 0;
    const tally = run()?.stats?.damageSources;   // survival's persistent per-run tally (survives Continue)
    const src = tally && typeof tally === 'object' && Object.keys(tally).length ? Object.entries(tally) : (K.dmgSources || []);
    for (const [k, v] of src) if (v > n) { best = k; n = v; }
    if (!best) return null;
    const e = D().ENEMY_BY_ID?.[best];
    const kind = e?.model || best;
    const tip = TIPS_BY_KIND[kind] || TIPS_BY_KIND[best] || 'Flare when they crowd you: it knocks everything back.';
    let line;
    if (best === 'darkness') line = `The dark bit you ${n} time${n > 1 ? 's' : ''}.`;
    else if (best === 'starvation') line = `Hunger took ${n} Ember${n > 1 ? 's' : ''}.`;
    else { const nm = e?.name || { wisp: 'Gloomling', mite: 'Inkmite', moth: 'Moth', eel: 'Eel', hand: 'Drowned Hand', warden: 'Warden', gloom: 'Gloomling' }[best] || 'The Gloom'; line = `${nm}${/s$/.test(nm) ? '' : 's'} reached you ${n} time${n > 1 ? 's' : ''}.`; }
    return { line, tip };
  }
  function nearMisses(summary) {
    const out = [];
    const r = run();
    const m = meta();
    const z = K.zoneData(summary?.zone || r?.zone);
    if (z && r) {
      const next = arr(D().ZONES).find((x) => x.index === z.index + 1);
      const legId = z.legendary || D().LEGENDARY_BY_ZONE?.[z.id];
      const leg = K.speciesData(legId);
      if (next && leg) {
        if (r.legendaries?.[legId]) { const short = num(next.unlock?.shells) - num(r.shells); out.push(short > 0 ? `${next.name.replace(/^The /, '')} toll: ${fmt(short)} Shells away.` : `The way to ${next.name} lay open.`); }
        else if (r.flags?.wounded?.[legId]) out.push(`${leg.name} escaped wounded. It will remember the hook.`);
        else out.push(`${leg.name} still waits in ${z.arena?.legendPool?.name || 'the deep'}.`);
      }
    }
    const rel = relics().filter((x) => x.revealed && !x.maxed).sort((a, b) => a.nextCost - b.nextCost)[0];
    if (rel) { const need = rel.nextCost - num(m.memories); out.push(need > 0 ? `${rel.name}: ${fmt(need)} more Memories at the Shrine.` : `The Shrine can relight ${rel.name} now.`); }
    const lockedWick = characters().find((c) => !c.unlocked && c.unlock);
    if (lockedWick) { const ch = challenges().find((c) => c.id === lockedWick.unlock); if (ch) out.push(`A Wick waits behind “${ch.name}”: ${fmt(ch.progress)} / ${fmt(ch.target)}.`); }
    return out.slice(0, 4);
  }
  function showDeath(summary = {}) {
    K.closeAll();
    const S = summary || {};
    K.openModal('death', (entry, body) => {
      const T = D().TEXT || {};
      const cause = S.cause || 'gloom';
      const victory = cause === 'victory';
      const title = victory ? (T.victoryTitle || 'The Light Comes Up') : cause === 'abandoned' ? 'The Flame Let Go' : (T.deathTitle?.[cause] || T.deathTitle?.default || 'Extinguished');
      if (!entry.state.epitaph) entry.state.epitaph = victory ? (T.victorySubtitle || '') : K.pick(D().EPITAPHS?.[cause]) || K.pick(D().EPITAPHS?.default) || '';
      const z = K.zoneData(S.zone);
      const ch = D().CHARACTER_BY_ID?.[S.character];
      const flav = arr(T.summaryFlavour).find((f) => num(S.day, 1) <= num(f.maxDay, 999));
      const legends = typeof S.legendaries === 'number' ? S.legendaries : Array.isArray(S.legendaries) ? S.legendaries.length : S.legendaries && typeof S.legendaries === 'object' ? Object.keys(S.legendaries).length : 0;
      const wrap = h('div', `gw-death${victory ? ' gw-victory' : ''}`);
      wrap.innerHTML = `<div class="gw-death-veil"></div><div class="gw-death-inner gw-scroll">
        <div class="gw-death-head"><div class="gw-death-candle"><i></i></div><h1>${esc(title)}</h1><p class="gw-epitaph">${esc(entry.state.epitaph)}</p>
        <div class="gw-death-line">${[`Day ${fmt(S.day || 1)}`, esc(z?.name || ''), `Level ${fmt(S.level || 1)}`, ch ? esc(ch.name) : ''].filter(Boolean).map((x) => `<span>${x}</span>`).join(' · ')}</div>${flav ? `<p class="gw-death-flav">${esc(flav.text)}</p>` : ''}
        <div class="gw-pdiv">${ORN.flourish}</div></div>
        <div class="gw-death-cols">
          <section class="gw-death-mem"><h2>${esc(T.memoriesHeader || 'What the Water Remembers')}</h2><div class="gw-mem-rows"></div>
            <div class="gw-mem-total">${'<span>'}${icon('memory')}<b class="gw-mem-n">0</b></span><small>Memories banked · ${fmt(meta().memories || 0)} held</small></div></section>
          <section class="gw-death-side">
            <div class="gw-death-stats">
              <div><b>${fmt(S.fishCaught || 0)}</b><small>fish landed</small></div><div><b>${fmt(S.enemiesSlain || 0)}</b><small>gloomlings dispersed</small></div>
              <div><b>${fmt(S.shellsEarned || 0)}</b><small>Shells earned</small></div><div><b>${fmt(S.newSpecies || 0)}</b><small>new names</small></div>
              ${legends ? `<div><b>${fmt(legends)}</b><small>legends hauled</small></div>` : ''}</div>
            <div class="gw-death-lists"></div></section>
        </div>
        <nav class="gw-death-btns"></nav></div>`;
      body.appendChild(wrap);
      const rows = wrap.querySelector('.gw-mem-rows');
      const bd = arr(S.breakdown).filter((b) => b && num(b.value) !== 0);
      bd.forEach((b, i) => {
        const row = h('div', 'gw-mem-row', `<span>${esc(b.label)}</span><i></i><b>0</b>`);
        row.style.setProperty('--i', i);
        rows.appendChild(row);
        if (!entry.state.counted) K.tween(row.querySelector('b'), 0, num(b.value), 0.7, 0.5 + i * 0.22, (v) => '+' + fmt(v));
        else row.querySelector('b').textContent = '+' + fmt(b.value);
      });
      if (!bd.length) rows.innerHTML = '<p class="gw-empty">The water barely noticed. Next time, go deeper.</p>';
      const totalEl = wrap.querySelector('.gw-mem-n');
      if (!entry.state.counted) K.tween(totalEl, 0, num(S.memories), 1.4, 0.5 + bd.length * 0.22, fmt); else totalEl.textContent = fmt(S.memories);
      entry.state.counted = true;
      const lists = wrap.querySelector('.gw-death-lists');
      const recs = arr(S.records);
      if (recs.length) lists.insertAdjacentHTML('beforeend', `<div class="gw-dl"><div class="gw-group">${esc(T.newRecord || 'New record!')}</div>${recs.map((x) => `<div class="gw-dl-row">${icon('star')}<span>${esc(x)}</span></div>`).join('')}</div>`);
      const chs = arr(S.challengesCompleted);
      if (chs.length) lists.insertAdjacentHTML('beforeend', `<div class="gw-dl"><div class="gw-group">Trials completed</div>${chs.map((c) => `<div class="gw-dl-row gw-good">${icon('check')}<span><b>${esc(c?.name || c)}</b>${c?.reward ? `<small>${esc([c.reward.unlock ? K.unlockLabel(c.reward.unlock) : '', c.reward.memories ? `+${c.reward.memories} Memories` : ''].filter(Boolean).join(' · '))}</small>` : ''}</span></div>`).join('')}</div>`);
      const nm = nearMisses(S);
      const td = !victory ? topDamage() : null;
      if (nm.length || td) lists.insertAdjacentHTML('beforeend', `<div class="gw-dl"><div class="gw-group">So close</div>${nm.map((x) => `<div class="gw-dl-row">${icon('quill')}<span>${esc(x)}</span></div>`).join('')}${td ? `<div class="gw-dl-row gw-bad">${icon('eye')}<span>${esc(td.line)}<small>${esc(td.tip)}</small></span></div>` : ''}</div>`);
      const nav = wrap.querySelector('.gw-death-btns');
      nav.appendChild(btn('Shrine', { icon: 'memory', sub: `${fmt(meta().memories || 0)} Memories`, onClick: () => openShrine() }));
      nav.appendChild(btn('New Descent', { cls: 'gw-btn--primary', icon: 'flame', autofocus: true, onClick: () => openNewDescent() }));
      nav.appendChild(btn('Title', { icon: 'gate', onClick: () => { K.closeAll(); safe(() => ctx.game?.toTitle?.(), null); if (ctx.flow !== 'title') showTitle(); } }));
    }, { screen: true, blocking: false, onEscape: () => {}, state: { titleChild: true } });
  }

  // ================================================================== VICTORY
  function showVictory(summary = {}) {
    K.openModal('victory', (entry, body) => {
      const T = D().TEXT || {};
      const wrap = h('div', 'gw-victory-card');
      wrap.innerHTML = `<div class="gw-victory-rays"></div>${ORN.titleTop}<h1>${esc(T.victoryTitle || 'The Light Comes Up')}</h1><div class="gw-catch-epithet">${esc(T.victorySubtitle || '')}</div>
        <div class="gw-victory-lines">${arr(T.victory).map((l, i) => `<p style="--i:${i}">${esc(l)}</p>`).join('')}</div><nav class="gw-death-btns"></nav>`;
      body.appendChild(wrap);
      const nav = wrap.querySelector('nav');
      nav.appendChild(btn(T.victoryButtons?.endless || 'Keep Drifting', { onClick: () => K.closeModal('victory') }));
      nav.appendChild(btn(T.victoryButtons?.title || 'Return to the Surface', { cls: 'gw-btn--primary', icon: 'sun', autofocus: true, onClick: () => { K.closeAll(); safe(() => ctx.game?.endRun?.('victory'), null); } }));
    }, { dismissable: false, onEscape: () => {}, cls: 'gw-m-center gw-m-victory', state: { summary } });
  }

  function refreshIfOpen(id) {
    const entry = K.entry?.(id);
    if (entry && !entry.state?.locked) entry.render?.();
  }

  return {
    showTitle, openNewDescent, showCatch, openLevelUp, openShop, openCreel, openJournal, openShrine,
    openChallenges, openSettings, openPause, openDescend, showDeath, showVictory, confirm, refreshIfOpen,
  };
}
