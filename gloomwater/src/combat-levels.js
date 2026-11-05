// combat-levels.js — Cinders (XP pickups), levelling and Boon offers (DESIGN §10.1–10.2, §10.4).
// Cinders merge into small / bright / great motes, glide to the raft inside stats.pickupRadius,
// fade after cinderLife and all fly home at dawn. Level-ups queue; each pick builds a 1-of-3
// (4 for The Wick's first pick of a night) weighted offer that respects unlocks, slots, maxLevel,
// luck, the first-pick / weapon-pity guarantees and Kindles. Helper of combat.js.
// v3 (combat.js decides through C.bankLevel / C.modalOk / C.offerRule / C.noCinders, all inert in v1): level-ups earned
// outside a swarm go to run.levelBank (levelup:banked) and are offered later through offerBanked(); a pick never opens
// as a modal while moving, with a line out or in the ceremony; offers follow the mode's pool (Still: Angler only) and
// the Angler cap; no Cinders drop during a lamp-watch or a Scorched night.
import { DECAL, lin } from './combat-fx.js';

const TAU = Math.PI * 2;
const RANK = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
const COL = {
  small: lin(0xff9a3a, 2.6), smallHalo: lin(0xff7a20, 1.1), bright: lin(0xffd36a, 3.2), brightHalo: lin(0xffb040, 1.4),
  great: lin(0xfff0c0, 3.8), greatHalo: lin(0xffd890, 1.8), oil: lin(0xffb347, 3), pick: lin(0xffe0a0, 2.6),
};

export function createLevels(C) {
  const { ctx, fx } = C;
  const raft = C.raft;
  const X = () => ctx.data.BALANCE?.xp || {};

  // ---------------------------------------------------------------- cinders
  const MAXC = 320;
  const cinders = [];
  for (let i = 0; i < MAXC; i++) cinders.push({ on: false, x: 0, y: 0, z: 0, v: 0, t: 0, mag: false, sp: 0, seed: 0, vx: 0, vz: 0, pop: 0 });
  let liveCinders = 0;
  const oilMotes = [];
  for (let i = 0; i < 24; i++) oilMotes.push({ on: false, x: 0, y: 0, z: 0, x0: 0, y0: 0, z0: 0, t: 0, amount: 0 });

  function drop(x, z, value, { spread = 0.6, great = false } = {}) {
    if (!(value > 0)) return;
    if (C.noCinders?.()) return;
    const mr = X().mergeRadius ?? 1.5;
    // merge into a nearby resting cinder to keep counts low
    if (!great) {
      for (let i = 0; i < MAXC; i++) {
        const c = cinders[i];
        if (!c.on || c.mag) continue;
        const dx = c.x - x, dz = c.z - z;
        if (dx * dx + dz * dz < mr * mr) { c.v += value; c.t = Math.min(c.t, 2); c.pop = 1; return; }
      }
    }
    let c = null;
    for (let i = 0; i < MAXC; i++) if (!cinders[i].on) { c = cinders[i]; break; }
    if (!c) {
      // pool full: fold into the oldest resting cinder
      let old = null;
      for (const q of cinders) if (q.on && !q.mag && (!old || q.t > old.t)) old = q;
      if (old) { old.v += value; old.pop = 1; }
      return;
    }
    const a = Math.random() * TAU, r = Math.random() * spread;
    c.on = true; c.x = x + Math.cos(a) * r; c.z = z + Math.sin(a) * r; c.y = 0.9; c.v = value; c.t = 0; c.mag = false; c.sp = 0;
    c.seed = Math.random(); c.vx = Math.cos(a) * 1.5; c.vz = Math.sin(a) * 1.5; c.pop = 1;
    liveCinders++;
  }
  function pullCinders(x, z, r) {
    for (const c of cinders) if (c.on && Math.hypot(c.x - x, c.z - z) < r) c.mag = true;
  }
  function collectAll() { for (const c of cinders) if (c.on) c.mag = true; }
  function clearCinders() { for (const c of cinders) c.on = false; for (const m of oilMotes) m.on = false; liveCinders = 0; }

  function oilMote(x, y, z, amount) {
    const m = oilMotes.find((q) => !q.on);
    if (!m) { C.addOil(amount, true); return; }
    m.on = true; m.x0 = x; m.y0 = y; m.z0 = z; m.t = 0; m.amount = amount;
  }

  let xpAcc = 0, xpEmitT = 0;
  function updateCinders(dt, t) {
    const S = C.stats;
    const pr = Math.max(0.5, S.pickupRadius ?? 4);
    const life = X().cinderLife ?? 20;
    const mag = X().magnetSpeed ?? 14;
    const L = C.lantern;
    liveCinders = 0;
    for (let i = 0; i < MAXC; i++) {
      const c = cinders[i];
      if (!c.on) continue;
      liveCinders++;
      c.t += dt;
      c.pop = Math.max(0, c.pop - dt * 3);
      const dx = raft.x - c.x, dz = raft.z - c.z, d = Math.hypot(dx, dz);
      if (!c.mag && d < pr) c.mag = true;
      if (c.mag) {
        c.sp = Math.min(mag * 1.6, c.sp + dt * 34 + 2 * dt);
        const step = Math.min(d, Math.max(c.sp, 3) * dt);
        if (d > 1e-3) { c.x += dx / d * step; c.z += dz / d * step; }
        c.y += ((L.y - 0.4) - c.y) * Math.min(1, dt * 5);
        if (d < 0.9) {
          c.on = false;
          const v = c.v * (S.xpMult ?? 1);
          addXp(v);
          xpAcc += v;
          fx.burst(raft.x, 1.2, raft.z, COL.pick, c.v >= 5 ? 6 : 3, 2.2, 0.1, 0.35, 1.5, -2);
          continue;
        }
      } else {
        c.vx *= Math.exp(-3 * dt); c.vz *= Math.exp(-3 * dt);
        c.x += c.vx * dt; c.z += c.vz * dt;
        const wy = ctx.water?.getHeight?.(c.x, c.z) ?? 0;
        c.y += ((wy + 0.42 + Math.sin(t * 2.4 + c.seed * 20) * 0.08) - c.y) * Math.min(1, dt * 4);
        if (c.t > life) { c.on = false; fx.sparks.emit(c.x, c.y, c.z, 0, 0.5, 0, 0.6, 0.3, 0.1, 0.2, 0.5, 0.6, 0, 1, 0); continue; }
      }
      // visuals by tier
      const fade = c.mag ? 1 : Math.min(1, (life - c.t) / 3);
      const blink = c.t > life - 3 && !c.mag ? (Math.sin(c.t * 16) > 0 ? 1 : 0.35) : 1;
      const a = fade * blink;
      const pop = 1 + c.pop * 0.6;
      const tw = 0.85 + 0.15 * Math.sin(t * 9 + c.seed * 30);
      if (c.v >= 25) {
        fx.glows.add(c.x, c.y, c.z, COL.great.r, COL.great.g, COL.great.b, 0.55 * pop * tw, a);
        fx.glows.add(c.x, c.y, c.z, COL.greatHalo.r, COL.greatHalo.g, COL.greatHalo.b, 2.2 * pop, 0.55 * a);
        if (!c.mag) fx.decalsG.add(c.x, c.z, 0.9, 0.9, 0, DECAL.DASHRING, COL.greatHalo.r * 0.6, COL.greatHalo.g * 0.6, COL.greatHalo.b * 0.6, 0.6 * a, 0.12, 6, t * 1.5 + c.seed * 6);
      } else if (c.v >= 5) {
        fx.glows.add(c.x, c.y, c.z, COL.bright.r, COL.bright.g, COL.bright.b, 0.42 * pop * tw, a);
        fx.glows.add(c.x, c.y, c.z, COL.brightHalo.r, COL.brightHalo.g, COL.brightHalo.b, 1.4 * pop, 0.5 * a);
      } else {
        fx.glows.add(c.x, c.y, c.z, COL.small.r, COL.small.g, COL.small.b, 0.3 * pop * tw, a);
        fx.glows.add(c.x, c.y, c.z, COL.smallHalo.r, COL.smallHalo.g, COL.smallHalo.b, 0.9 * pop, 0.4 * a);
      }
      if (c.mag && Math.random() < dt * 25) fx.sparks.emit(c.x, c.y, c.z, 0, 0.2, 0, COL.small.r, COL.small.g * 0.8, COL.small.b * 0.5, 0.12, 0.25, 0.8, -0.2, 2, 0);
    }
    // oil drips fly to the lantern
    for (const m of oilMotes) {
      if (!m.on) continue;
      m.t += dt;
      const k = Math.min(1, m.t / 0.7);
      const e = k * k * (3 - 2 * k);
      m.x = m.x0 + (L.x - m.x0) * e; m.z = m.z0 + (L.z - m.z0) * e; m.y = m.y0 + (L.y - m.y0) * e + Math.sin(k * Math.PI) * 2.2;
      fx.glows.add(m.x, m.y, m.z, COL.oil.r, COL.oil.g, COL.oil.b, 0.7, 1);
      if (Math.random() < 0.6) fx.sparks.emit(m.x, m.y, m.z, 0, 0, 0, COL.oil.r, COL.oil.g * 0.8, COL.oil.b * 0.5, 0.14, 0.3, 0.8, -0.2, 2, -1);
      if (k >= 1) {
        m.on = false;
        C.addOil(m.amount, true);
        fx.burst(L.x, L.y, L.z, COL.oil, 8, 2.5, 0.14, 0.4, 1, -3);
        C.floatText(L.clone(), `+${Math.round(m.amount)} oil`, 'oil');
      }
    }
    // aggregated xp:gain (≤ 10/s)
    xpEmitT -= dt;
    if (xpAcc > 0 && xpEmitT <= 0) {
      xpEmitT = 0.1;
      ctx.bus.emit('xp:gain', { amount: Math.round(xpAcc * 10) / 10, total: C.run?.xp ?? 0 });
      xpAcc = 0;
    }
  }

  // ---------------------------------------------------------------- XP & levels
  const queue = [];        // {type:'level'|'gift'|'draft', level}
  let pendingOptions = null, current = null;
  let curiousUsed = false;
  let pendingHeal = 0;
  let uiDriven = false;      // v3: the ui presents banked picks itself (it called offerBanked)
  /** run.flags.pendingPicks: queued + the open pick (a banked pick lives in run.levelBank instead). */
  function syncPending(run = C.run) { if (run?.flags) run.flags.pendingPicks = queue.length + (pendingOptions && !current?.banked ? 1 : 0); }
  function emitBanked(added) {
    const run = C.run;
    ctx.bus.emit('levelup:banked', { count: run?.levelBank | 0, level: run?.level || 1, added });
  }

  function ensureRunFields(run) {
    if (!run) return;
    if (!(run.level >= 1)) run.level = 1;
    if (!(run.xp >= 0)) run.xp = 0;
    if (!(run.xpNext > 0)) run.xpNext = ctx.data.xpForLevel?.(run.level) ?? 5;
    if (!run.boons || typeof run.boons !== 'object') run.boons = {};
    if (!(run.rerollsUsed >= 0)) run.rerollsUsed = 0;
    if (!run.stats) run.stats = {};
    if (!run.flags) run.flags = {};
  }
  function addXp(n) {
    const run = C.run;
    if (!run || !(n > 0)) return;
    ensureRunFields(run);
    run.xp += n;
    let guard = 0;
    let banked = 0;
    while (run.xp >= run.xpNext && guard++ < 200) {
      run.xp -= run.xpNext;
      run.level++;
      run.xpNext = ctx.data.xpForLevel?.(run.level) ?? Math.round(run.xpNext * 1.2 + 3);
      run.stats.maxLevel = Math.max(run.stats.maxLevel || 1, run.level);
      // v3: outside a swarm the level-up is banked (offered on the next measuring card or at the dawn bell)
      if (C.bankLevel?.()) { run.levelBank = (run.levelBank | 0) + 1; banked++; }
      else queue.push({ type: 'level', level: run.level });
    }
    syncPending(run);
    if (banked) emitBanked(banked);
  }
  function levelUp(n = 1) {
    const run = C.run;
    if (!run) return;
    ensureRunFields(run);
    for (let i = 0; i < n; i++) addXp(Math.max(0.001, run.xpNext - run.xp));
  }

  function characterDef() { const id = C.run?.character; return id ? ctx.data.CHARACTER_BY_ID?.[id] || (ctx.data.CHARACTERS || []).find((c) => c.id === id) : null; }
  function unlocked(b) {
    if (!b.unlock) return true;
    const run = C.run;
    if (run?.boons?.[b.id]) return true;
    if (characterDef()?.startBoon === b.id) return true;
    const key = 'boon:' + b.id;
    try { if (ctx.progression?.isUnlocked?.(key) === true) return true; } catch { /* optional */ }
    const meta = ctx.state.meta || {};
    return !!(meta.unlocks?.[key] || meta.challenges?.[b.unlock]);
  }

  function optionFor(b, lvl, { kindle = false } = {}) {
    if (kindle) {
      const k = b.kindle;
      const passive = ctx.data.BOON_BY_ID?.[k.requires];
      return {
        boonId: b.id, name: k.name, desc: k.desc, rarity: 'legendary', level: 6, isNew: false, icon: b.icon, kind: 'weapon', weapon: b.weapon,
        tags: b.tags || [], note: `${b.name} + ${passive?.name || k.requires}`, lore: k.lore || '', isKindle: true, kindle: true, fuses: k.requires, fusesIcon: passive?.icon || null,
      };
    }
    const next = lvl + 1;
    return {
      boonId: b.id, name: b.name, desc: b.desc, rarity: b.rarity, level: next, isNew: lvl === 0, icon: b.icon, kind: b.kind, weapon: b.weapon || null,
      tags: b.tags || [], note: b.kind === 'weapon' ? (b.levels?.[next - 1]?.note || '') : effectNote(b), lore: b.lore || '', isKindle: false, maxLevel: b.maxLevel,
    };
  }
  function effectNote(b) {
    const S = ctx.data.STATS || {};
    const parts = [];
    for (const [k, v] of Object.entries(b.effects || {})) {
      const def = S[k];
      if (!def || !v) continue;
      const sign = v > 0 ? '+' : '−';
      const av = Math.abs(v);
      const val = def.fmt === 'pct' ? `${Math.round(av * 100)}%` : def.fmt === 'x' ? `${Math.round(av * 100)}%` : def.fmt === 'm' ? `${av} m` : def.fmt === 's' ? `${av} s` : `${av}`;
      parts.push(`${sign}${val} ${def.label}`);
    }
    return parts.join(', ');
  }
  function fallbackOptions(n, used) {
    const out = [];
    for (const f of X().fallback || []) {
      if (out.length >= n) break;
      if (used.has(f.id)) continue;
      out.push({ boonId: f.id, name: f.name, desc: f.desc, rarity: 'common', level: 1, isNew: false, icon: f.give?.oil ? 'oil' : f.give?.hp ? 'ember' : 'shell', kind: 'fallback', tags: [], note: '', lore: '', isKindle: false, fallback: true });
    }
    return out;
  }

  function buildOffer(item) {
    const run = C.run;
    const data = ctx.data;
    const xp = X();
    const S = C.stats;
    const boons = run.boons || {};
    const BOONS = data.BOONS || [];
    const BY = data.BOON_BY_ID || {};
    const night = C.phase === 'dusk' || C.phase === 'gloomtide';
    const quirk = characterDef()?.quirk;
    let choices = xp.choices ?? 3;
    // the Wick's Curious is a combat half: combat modes only (DESIGN §25.5.5)
    if (item.type === 'level' && quirk?.id === 'curious' && night && !curiousUsed && C.mode !== 'still') { choices = quirk.choices || 4; curiousUsed = true; }
    // v3: the mode's pool (Still: Angler only), Lantern's weapons from its first swarm night, the Angler cap, Draft rules
    const rule = C.offerRule?.(item) || null;
    const rw = xp.rarityWeights || { common: 60, rare: 28, epic: 10, legendary: 2 };
    const ls = xp.luckShift || { common: 0, rare: 0.6, epic: 1.2, legendary: 2 };
    const luck = S.luck || 0;
    const weightOf = (r) => (rw[r] ?? rw.common ?? 60) * (1 + luck * (ls[r] ?? 0));
    let wOwned = 0, pOwned = 0;
    for (const [id, l] of Object.entries(boons)) { const b = BY[id]; if (!b || !(l > 0)) continue; if (b.kind === 'weapon') wOwned++; else pOwned++; }
    const maxW = xp.maxWeapons ?? 4, maxP = xp.maxPassives ?? 6;
    const cands = [];
    const kindles = [];
    for (const b of BOONS) {
      const lvl = boons[b.id] || 0;
      if (!unlocked(b)) continue;
      if (rule && !(b.kind === 'weapon' && lvl >= (b.maxLevel || 5)) && !rule.allow(b)) continue;
      if (b.kind === 'weapon') {
        if (lvl >= (b.maxLevel || 5)) {
          if (b.kindle && lvl < 6 && (boons[b.kindle.requires] || 0) > 0 && (!rule || rule.allow(b, { kindle: true }))) kindles.push({ b, lvl, w: weightOf('legendary') * (xp.kindleWeight ?? 3), kindle: true, weapon: true });
          continue;
        }
        if (!lvl && wOwned >= maxW) continue;
      } else {
        if (lvl >= (b.maxLevel || 1)) continue;
        if (!lvl && pOwned >= maxP) continue;
      }
      if (item.type === 'gift' && (RANK[b.rarity] ?? 0) < RANK.rare) continue;
      cands.push({ b, lvl, w: weightOf(b.rarity) * (lvl > 0 ? (xp.ownedWeight ?? 1.4) : 1), kindle: false, weapon: b.kind === 'weapon' });
    }
    const out = [];
    const used = new Set();
    const take = (pool, filter) => {
      let tot = 0;
      for (const c of pool) if (!used.has(c.b.id + (c.kindle ? '*' : '')) && (!filter || filter(c))) tot += c.w;
      if (tot <= 0) return false;
      let r = Math.random() * tot;
      for (const c of pool) {
        if (used.has(c.b.id + (c.kindle ? '*' : '')) || (filter && !filter(c))) continue;
        r -= c.w;
        if (r <= 0) { used.add(c.b.id + (c.kindle ? '*' : '')); used.add(c.b.id); out.push(optionFor(c.b, c.lvl, { kindle: c.kindle })); return true; }
      }
      return false;
    };
    // guarantees
    const flags = run.flags || (run.flags = {});
    if (kindles.length) {
      if ((flags.kindleMiss || 0) >= (xp.kindleForceAfter ?? 2) || item.type === 'gift') take(kindles);
    }
    if (!flags.firstPickDone && item.type === 'level') {
      for (let i = 0; i < (xp.firstLevelWeapons ?? 2); i++) take(cands, (c) => c.weapon);
    }
    if (item.type === 'level' && run.level >= (xp.weaponPityLevel ?? 6) && wOwned <= 1 && !out.some((o) => o.kind === 'weapon')) take(cands, (c) => c.weapon);
    // weighted fill (kindles compete at ×kindleWeight)
    const all = cands.concat(kindles);
    while (out.length < choices) {
      // a weapon id and its kindle are never offered side by side
      if (!take(all, (c) => !used.has(c.b.id))) break;
    }
    if (kindles.length) {
      if (out.some((o) => o.isKindle)) flags.kindleMiss = 0;
      else flags.kindleMiss = (flags.kindleMiss || 0) + 1;
    }
    if (out.length < choices) out.push(...fallbackOptions(choices - out.length, used));
    return out.slice(0, Math.max(choices, 1));
  }

  function canOpen() {
    if (!C.run || ctx.flow !== 'playing' || ctx.paused) return false;
    try { if (ctx.ui?.isBlocking?.() === true) return false; } catch { /* ignore */ }
    if (C.modalOk && !C.modalOk()) return false;   // v3: never while moving, with a line out or in the ceremony
    return true;
  }
  function openNext() {
    if (pendingOptions || !queue.length || !canOpen()) return;
    const item = queue.shift();
    current = item;
    pendingOptions = buildOffer(item);
    syncPending();
    ctx.bus.emit('levelup', { level: item.type === 'gift' ? C.run.level : item.level, options: pendingOptions, gift: item.type === 'gift', draft: item.type === 'draft', remaining: queue.length });
    if (item.type === 'gift') ctx.bus.emit('toast', { text: "A Warden's Gift. Choose what it leaves you.", kind: 'good' });
  }
  function give(opt) {
    const g = (X().fallback || []).find((f) => f.id === opt.boonId)?.give || {};
    const z = C.zoneIndex || 0;
    if (g.shells) C.giveShells(g.shells * (g.perZone ? 1 + z : 1));
    if (g.hp) pendingHeal += g.hp;
    if (g.oil) C.addOil(g.oil, true);
  }
  function chooseBoon(boonId) {
    const run = C.run;
    if (!run || !pendingOptions) return false;
    const opt = pendingOptions.find((o) => o.boonId === boonId);
    if (!opt) return false;
    ensureRunFields(run);
    const wasBanked = !!current?.banked;
    if (opt.fallback) {
      give(opt);
    } else {
      const b = ctx.data.BOON_BY_ID?.[boonId];
      if (!b) return false;
      run.boons[boonId] = opt.isKindle ? 6 : Math.min(b.maxLevel || 5, opt.level);
      if (b.onPick?.heal) pendingHeal += b.onPick.heal;
      C.onBoonsChanged();
      if (opt.isKindle) {
        const kb = ctx.data.TEXT?.kindleBanner || ['{name}', 'The flame remembers'];
        ctx.ui?.banner?.(kb[0].replace('{name}', b.kindle.name), kb[1]);
        fx.timedDecal({ x: raft.x, z: raft.z, r0: 1, r1: 12, life: 1.2, color: lin(0xe8c66a, 2.4), p1: 0.06, p2: 0.1 });
      }
      ctx.bus.emit('boon:chosen', { boonId, level: run.boons[boonId], kindle: !!opt.isKindle, kind: b.kind });
    }
    flags(run).firstPickDone = true;
    pendingOptions = null; current = null;
    run.flags.pendingPicks = queue.length;
    if (wasBanked) consumeBank();
    return true;
  }
  function consumeBank() {
    const run = C.run;
    if (!run) return;
    run.levelBank = Math.max(0, (run.levelBank | 0) - 1);
    emitBanked(-1);
  }
  /**
   * v3: the next banked pick as an offer (the measuring card, the dawn bell). Idempotent while that offer is open; null
   * when nothing is banked or another pick is open. `ui: true` marks the ui as the one presenting banked picks.
   */
  function offerBanked({ ui = false } = {}) {
    const run = C.run;
    if (!run) return null;
    if (ui) uiDriven = true;
    if (pendingOptions) return current?.banked ? pendingOptions : null;
    if (!((run.levelBank | 0) > 0)) return null;
    ensureRunFields(run);
    const item = { type: 'level', level: run.level, banked: true };
    current = item;
    pendingOptions = buildOffer(item);
    syncPending(run);
    ctx.bus.emit('levelup', { level: run.level, options: pendingOptions, gift: false, draft: false, banked: true, remaining: queue.length + Math.max(0, (run.levelBank | 0) - 1) });
    return pendingOptions;
  }
  /** v3: queued level picks that never opened (the swarm ended) move to the bank. Gifts and Draft levels stay queued. */
  function bankQueued() {
    const run = C.run;
    if (!run || !queue.length) return 0;
    let n = 0;
    for (let i = queue.length - 1; i >= 0; i--) if (queue[i].type === 'level') { queue.splice(i, 1); n++; }
    if (!n) return 0;
    run.levelBank = (run.levelBank | 0) + n;
    syncPending(run);
    emitBanked(n);
    return n;
  }
  const flags = (run) => run.flags || (run.flags = {});
  function reroll() {
    const run = C.run;
    if (!run || !pendingOptions || !current) return null;
    const free = current.type === 'draft';
    const max = C.stats.rerolls ?? 1;
    if (!free && (run.rerollsUsed || 0) >= max) return null;
    if (!free) run.rerollsUsed = (run.rerollsUsed || 0) + 1;
    pendingOptions = buildOffer(current);
    return pendingOptions;
  }
  function skip() {
    const run = C.run;
    if (!run || !pendingOptions) return false;
    if (current?.type !== 'gift') C.giveShells((X().skipShells ?? 8) * (1 + (C.zoneIndex || 0)));
    const wasBanked = !!current?.banked;
    pendingOptions = null; current = null;
    run.flags.pendingPicks = queue.length;
    if (wasBanked) consumeBank();
    return true;
  }
  function getBoons() {
    const run = C.run;
    if (!run?.boons) return [];
    const BY = ctx.data.BOON_BY_ID || {};
    const out = [];
    for (const [id, level] of Object.entries(run.boons)) { const boon = BY[id]; if (boon && level > 0) out.push({ boon, level, kindled: level >= 6, name: level >= 6 ? boon.kindle?.name || boon.name : boon.name }); }
    out.sort((a, b) => (a.boon.kind === 'weapon' ? 0 : 1) - (b.boon.kind === 'weapon' ? 0 : 1));
    return out;
  }
  function queueGift() { queue.unshift({ type: 'gift', level: C.run?.level || 1 }); syncPending(); }
  function queueDraft(n) {
    const run = C.run;
    if (!run) return;
    ensureRunFields(run);
    for (let i = 0; i < n; i++) {
      run.level++;
      run.xpNext = ctx.data.xpForLevel?.(run.level) ?? run.xpNext;
      run.stats.maxLevel = Math.max(run.stats.maxLevel || 1, run.level);
      queue.push({ type: 'draft', level: run.level });
    }
    run.xp = 0;
    run.flags.pendingPicks = queue.length;
  }
  function restorePending(n) { for (let i = 0; i < n; i++) queue.push({ type: 'level', level: C.run?.level || 1 }); }
  function reset() { queue.length = 0; pendingOptions = null; current = null; curiousUsed = false; pendingHeal = 0; xpAcc = 0; uiDriven = false; }

  function update(dt, t) {
    if (pendingHeal > 0 && C.run) { const h = pendingHeal; pendingHeal = 0; ctx.survival?.heal?.(h); }
    openNext();
    if (dt > 0) updateCinders(dt, t);
  }

  return {
    drop, pullCinders, collectAll, clearCinders, oilMote, addXp, levelUp,
    /** XP from outside the cinder magnet (fish cinders): also feeds the aggregated xp:gain event. */
    gainXp(n) { if (n > 0) { addXp(n); xpAcc += n; } }, chooseBoon, reroll, skip, getBoons, queueGift, queueDraft,
    restorePending, reset, update, ensureRunFields, offerBanked, bankQueued,
    get uiDriven() { return uiDriven; }, get queuedCount() { return queue.length; },
    get pendingOptions() { return pendingOptions; }, get pendingCount() { return queue.length + (pendingOptions ? 1 : 0); },
    get cinderCount() { return liveCinders; },
    newNight() { curiousUsed = false; },
    get current() { return current; },
  };
}
