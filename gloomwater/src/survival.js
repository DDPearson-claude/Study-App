// survival.js — the day clock, lantern oil, satiety, Embers (health), damage, healing,
// darkness & starvation, the light radius, warnings and death (survival author).
// CONTRACT §7 survival · DESIGN §6 (+ §8.1 light radius, §2.3 day table).
//
// Public API (contract):
//   getPhaseInfo() -> {phase, day, time, duration, k, isNight, nextPhase}
//   damage(n, source) ; heal(n) ; addOil(n) ; addSatiety(n) ; isInvulnerable() ; lightRadius
// Optional extras (read with ?.):
//   damage(n, source, {oil, ignoreArmor, ignoreIframes}) -> Embers lost (oil drained with the hit,
//     halved during i-frames, still drained when warded). `source` may be a string or an enemy
//     object ({enemyId|id|kind, boss}); boss hits are capped at BALANCE.damage.bossHitCap.
//   drainOil(n, source) -> oil actually removed (moth latch / grip drains; addOil(-n) also works)
//   setLightMod(id, mult, duration = Infinity) / clearLightMod(id)   — extra light dims. Π dims is
//     floored at BALANCE.light.dimFloor. When combat publishes `lightMult` (Π its dims × flare boost)
//     and `lightAdd` (Gutsfire, m) they are folded in and `appliesCombatLight` tells combat so;
//     otherwise survival applies the flare boost (on `flare`), Gutsfire (on fish:action render), the
//     ink slick (player.inSlick) and an optional numeric `combat.lightDim` itself.
//   grantIframes(s) / addIframes(s)   — e.g. the flare's 0.3 s (also granted on the `flare` event)
//   lanternOut (bool), starving (bool), oilFrac (0..1), iframes (s left), isGod()
//   getVitals() -> {hp, maxHp, oil, maxOil, satiety, maxSatiety, oilRate, satietyRate, lanternOut, starving, lightRadius}
//   reviveInfo -> {available}   (Second Wick fallback state when progression.tryRevive is absent)
// Events emitted: phase:change, day:start, resource:low, player:damage, player:heal, player:died,
//   lantern:out, lantern:lit, toast; extras: player:warded {source}, player:burst {position, radius,
//   push, stun, damage}, player:revive {}, lantern:flicker {oil}.
// Gutter-burst (DESIGN §6.4): on every Ember lost survival emits player:damage (combat knocks its
//   gloomlings on it) plus player:burst {position, radius, push, stun, damage}; survival draws the
//   ring only if combat does not (no lightMult).
// run.stats.damageSources {source: Embers} is kept for the death screen's "top damage source".
import * as THREE from 'three';
import { clamp, damp, rand } from './core.js';
import { createSurvivalFx } from './survival-fx.js';

const ORDER = ['calm', 'dusk', 'gloomtide', 'dawn'];
const ENV_SOURCES = new Set(['darkness', 'starvation']);
const FALLBACK = {
  phases: { calm: 120, dusk: 14, gloomtide: 90, dawn: 8 },
  oilPhase: { calm: 1.0, dusk: 1.3, gloomtide: 1.8, dawn: 0.5 },
  light: { floorRadius: 0.55, floorAura: 0.3, emberGlow: 2.5, dimFloor: 0.5, slick: 0.8 },
  damage: {
    iframes: 1.2, iframeOilMult: 0.5, armorCap: 0.6, bossHitCap: 3,
    gutterBurst: { radius: 4, push: 5, stun: 0.5 },
    starvation: { grace: 5, interval: 20, reelMult: 0.75, windowMult: 0.85 },
    darkness: { grace: 3, interval: 8, lastFlickerOil: 12 },
  },
  heal: { wellFed: 1, wellFedAt: 0.7 },
  low: { oil: 0.25, oilRearm: 0.35, satiety: 0.2, satietyRearm: 0.3, hp: 2 },
  flare: { lightBoost: 1.4, boostTime: 3, iframes: 0.3 },
  revive: { oil: 40, iframes: 2 },
  stats: { maxHp: 5, maxOil: 100, maxSatiety: 100, oilDrain: 0.14, satietyDrain: 0.1, lightRadius: 8, armor: 0, dawnHeal: 1 },
};
const WARM = 0xffb347, HURT = 0xff6a3d, WARD = 0xcfe6ff, MEND = 0xffd9a0, GOLD = 0xffd27a;
const GUTTER = 0xa2c8ff, WAX = 0xe9dfc6;   // darkness ticks gutter pale blue; starvation ticks are wax

const num = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const real = (m) => !!m && !m.isStub;

export function create(ctx) {
  const D = () => ctx.data || {};
  const B = () => D().BALANCE || {};
  const cfgDamage = () => B().damage || FALLBACK.damage;
  const cfgLight = () => B().light || FALLBACK.light;
  const cfgLow = () => B().low || FALLBACK.low;
  const cfgHeal = () => B().heal || FALLBACK.heal;
  const cfgFlare = () => B().combat?.flare || FALLBACK.flare;
  const cfgRevive = () => Object.assign({}, FALLBACK.revive, B().revive || {});
  const order = () => (Array.isArray(B().phaseOrder) && B().phaseOrder.length === 4 ? B().phaseOrder : ORDER);

  const fx = createSurvivalFx(ctx);
  const _v = new THREE.Vector3();
  const _v2 = new THREE.Vector3();

  // ---------------------------------------------------------------- transient state (not saved)
  const T = {
    iframes: 0, flareBoost: 0, gutsT: 0, gutsBonus: 0,
    god: false, dead: false, light: 8, snapLight: true, starving: false,
    oilRate: 0, satRate: 0, runRef: null, flickerClock: 0,
  };
  const lightMods = [];   // [{id, mult, ttl}]

  // ---------------------------------------------------------------- stats (cached, refreshed on events)
  let baseStatsCache = null;
  function baseStats() {
    if (baseStatsCache) return baseStatsCache;
    const out = Object.assign({}, FALLBACK.stats);
    const S = D().STATS || {};
    for (const k in S) if (typeof S[k]?.base === 'number') out[k] = S[k].base;
    baseStatsCache = out;
    return out;
  }
  let statsCache = null, statsAge = 99;
  function readStats() {
    let s = null;
    try { s = real(ctx.progression) ? ctx.progression.getStats?.(ctx.state.run || undefined) : null; } catch (e) { s = null; }
    if (!s || s.isStub || typeof s !== 'object') s = baseStats();
    return s;
  }
  function stats() {
    if (!statsCache || statsAge > 0.25) { statsCache = readStats(); statsAge = 0; }
    return statsCache;
  }
  function freshStats() { statsCache = readStats(); statsAge = 0; return statsCache; }
  const maxHp = (s = stats()) => Math.max(1, num(s.maxHp, 5));
  const maxOil = (s = stats()) => Math.max(1, num(s.maxOil, 100));
  const maxSat = (s = stats()) => Math.max(1, num(s.maxSatiety, 100));

  // ---------------------------------------------------------------- zone & difficulty (cached per day/zone)
  function zoneData(run = ctx.state.run) {
    const id = run?.zone;
    const d = D();
    return (id && (d.ZONE_BY_ID?.[id] || (d.ZONES || []).find((z) => z.id === id))) || null;
  }
  function zoneIndex(run) {
    const z = zoneData(run);
    if (!z) return 0;
    if (typeof z.index === 'number') return z.index;
    const i = (D().ZONES || []).indexOf(z);
    return i < 0 ? 0 : i;
  }
  let diffKey = '';
  const diffCache = { drainMult: 1, damageMult: 1, heat: 0 };
  function nightInZone(run) {
    // nights spent in the current lake (linger Heat, DESIGN §7.2) — same rule as combat's director
    const p = ctx.progression;
    if (real(p) && typeof p.getNightInZone === 'function') {
      try { const n = Number(p.getNightInZone()); if (Number.isFinite(n) && n > 0) return n | 0; } catch { /* fall through */ }
    }
    const entered = run?.flags?.zoneEnteredDay;
    if (Number.isFinite(entered)) return Math.max(1, (run.day || 1) - entered + 1);
    return Math.max(1, run?.day || 1);
  }
  function diff(run) {
    const zi = zoneIndex(run);
    const niz = nightInZone(run);
    const key = `${run.day | 0}|${zi}|${niz}`;
    if (key !== diffKey) {
      diffKey = key;
      let d = null;
      try { d = D().difficultyFor?.(run.day | 0 || 1, zi, 0.5, { nightInZone: niz }); } catch { d = null; }
      diffCache.drainMult = num(d?.drainMult, 1);
      diffCache.damageMult = num(d?.damageMult, 1);
      diffCache.heat = num(d?.heat, 0);
    }
    return diffCache;
  }

  // ---------------------------------------------------------------- phase clock
  function phaseDuration(phase, day) {
    const P = B().phases || FALLBACK.phases;
    if (phase === 'gloomtide') {
      const f = D().gloomtideLength;
      if (typeof f === 'function') { try { return Math.max(1, num(f(day), P.gloomtide || 90)); } catch { /* fall through */ } }
      return Math.max(1, num(P.gloomtide, 90));
    }
    return Math.max(0.5, num(P[phase], FALLBACK.phases[phase] || 60));
  }
  function nextOf(phase) { const o = order(); return o[(o.indexOf(phase) + 1) % 4] || 'calm'; }

  function getPhaseInfo() {
    const run = ctx.state.run;
    const phase = run && ORDER.includes(run.phase) ? run.phase : 'calm';
    const day = Math.max(1, (run?.day | 0) || 1);
    const duration = phaseDuration(phase, day);
    const time = clamp(num(run?.phaseTime, 0), 0, duration);
    return {
      phase, day, time, duration, k: duration > 0 ? clamp(time / duration) : 0,
      isNight: phase === 'gloomtide', nextPhase: nextOf(phase),
      // extras
      remaining: Math.max(0, duration - time), isDark: phase === 'dusk' || phase === 'gloomtide',
    };
  }

  // ---------------------------------------------------------------- per-run owned bookkeeping (saved with the run)
  function sv(run) {
    let s = run.surv;
    if (!s || typeof s !== 'object') {
      s = run.surv = { flickerDay: 0, nightHurt: false, nightEmbers: 0, starveT: 0, darkT: 0, out: false, lowOil: true, lowSat: true, lowHp: true, secondWickUsed: false };
    }
    return s;
  }
  function validate(run) {
    const s = stats();
    if (!ORDER.includes(run.phase)) run.phase = 'calm';
    if (!(run.day >= 1)) run.day = 1;
    if (!Number.isFinite(run.phaseTime) || run.phaseTime < 0) run.phaseTime = 0;
    if (!Number.isFinite(run.hp)) run.hp = maxHp(s);
    if (!Number.isFinite(run.oil)) run.oil = maxOil(s);
    if (!Number.isFinite(run.satiety)) run.satiety = maxSat(s);
    if (run.hp > maxHp(s)) run.hp = maxHp(s);
    if (run.oil > maxOil(s)) run.oil = maxOil(s);
    if (run.satiety > maxSat(s)) run.satiety = maxSat(s);
    if (!run.stats || typeof run.stats !== 'object') run.stats = {};
    sv(run);
  }

  // ---------------------------------------------------------------- helpers
  const emit = (e, p) => ctx.bus.emit(e, p);
  const toast = (text, kind = 'info') => emit('toast', { text, kind });
  function playerPos(out = _v) {
    const p = ctx.player?.position;
    if (real(ctx.player) && p && Number.isFinite(p.x)) return out.set(p.x, 0, p.z);
    return out.set(0, 0, 0);
  }
  function headPos(out = _v2) {
    const a = ctx.actors;
    if (real(a) && typeof a.getHeadPos === 'function') {
      try { const r = a.getHeadPos(out); if (r && Number.isFinite(r.x)) return r; } catch { /* fall through */ }
    }
    playerPos(out); out.y = 1.5; return out;
  }
  function lanternPos(out = _v2) {
    const a = ctx.actors;
    if (real(a) && typeof a.getLanternPos === 'function') {
      try { const r = a.getLanternPos(out); if (r && Number.isFinite(r.x)) return r; } catch { /* fall through */ }
    }
    playerPos(out); out.y = 2.0; return out;
  }
  function character(run) {
    const id = run?.character;
    const d = D();
    return (id && (d.CHARACTER_BY_ID?.[id] || (d.CHARACTERS || []).find((c) => c.id === id))) || null;
  }
  function vibrate(ms) { if (ctx.isMobile) { try { navigator.vibrate?.(ms); } catch { /* ignore */ } } }
  function normSource(source) {
    if (source == null) return 'unknown';
    if (typeof source === 'string') return source;
    if (typeof source === 'object') return String(source.enemyId || source.id || source.kind || source.source || 'gloom');
    return String(source);
  }
  const causeFor = (src) => (ENV_SOURCES.has(src) ? src : 'gloom');
  const playing = (run) => ctx.flow === 'playing' && !!run && run.active !== false;

  // ---------------------------------------------------------------- phase transitions
  function enterPhase(phase, prev, run) {
    const s = sv(run);
    if (phase === 'dusk') duskForecast(run);
    else if (phase === 'gloomtide') { s.nightHurt = false; s.nightEmbers = 0; }
    else if (phase === 'dawn') {
      if (prev === 'gloomtide') {
        run.stats.nightsSurvived = (run.stats.nightsSurvived | 0) + 1;
        if (!s.nightHurt) run.stats.nightsNoDamage = (run.stats.nightsNoDamage | 0) + 1;
      }
      dawnMend(run);
    }
  }

  function advancePhase(run) {
    const prev = run.phase;
    const next = nextOf(prev);
    if (next === 'calm') run.day = (run.day | 0) + 1;
    run.phase = next;
    enterPhase(next, prev, run);
    if (next === 'calm') emit('day:start', { day: run.day });
    emit('phase:change', { phase: next, prev, day: run.day });
  }

  function setPhase(name, run = ctx.state.run) {
    if (!run || !ORDER.includes(name)) return run?.phase ?? null;
    if (name === nextOf(run.phase)) { run.phaseTime = 0; advancePhase(run); return run.phase; }
    const prev = run.phase;
    run.phase = name;
    run.phaseTime = 0;
    enterPhase(name, prev, run);
    emit('phase:change', { phase: name, prev, day: run.day });
    return name;
  }

  function duskForecast(run) {
    const s = stats();
    const z = zoneData(run);
    const L = phaseDuration('gloomtide', run.day);
    const op = (B().drain?.oilPhase || FALLBACK.oilPhase).gloomtide ?? 1.8;
    const pad = num(B().drain?.duskForecastPad, 10);
    const need = num(s.oilDrain, 0.14) * op * num(z?.drain?.oil, 1) * diff(run).drainMult * L + pad;
    if (run.oil < need) toast("Your lantern won't last the Gloomtide.", 'bad');
  }

  function dawnMend(run) {
    const s = freshStats();
    const H = cfgHeal();
    const wellFed = run.satiety / maxSat(s) >= num(H.wellFedAt, 0.7);
    const amount = Math.max(0, Math.floor(num(s.dawnHeal, 1))) + (wellFed ? Math.max(0, num(H.wellFed, 1)) : 0);
    const gained = amount > 0 ? heal(amount, 'dawn') : 0;
    if (gained > 0) {
      const e = gained === 1 ? 'Ember' : 'Embers';
      toast(wellFed ? `Well-fed. Dawn mends ${gained} ${e}.` : `Dawn mends ${gained} ${e}.`, 'good');
    } else if (wellFed && run.hp >= maxHp(s)) {
      toast('Well-fed, and whole.', 'good');
    }
  }

  // ---------------------------------------------------------------- lantern (oil 0 → Last Flicker → out)
  function checkLantern(run) {
    const s = sv(run);
    if (run.oil <= 1e-4 && !s.out) {
      run.oil = 0;
      if (s.flickerDay !== run.day) {
        s.flickerDay = run.day;
        const add = num(cfgDamage().darkness?.lastFlickerOil, 12);
        run.oil = Math.min(maxOil(), add);
        toast('The brazier coughs. One last flicker of oil.', 'info');
        emit('lantern:flicker', { oil: add });
        const p = lanternPos();
        fx.motes(p.x, p.y, p.z, { count: 34, color: WARM, speed: 4.2, spread: 0.45, life: 1.2, size: 0.19, gravity: -4.5, damping: 1.2, shape: 'cough' });
        fx.motes(p.x, p.y, p.z, { count: 10, color: 0xfff0c8, speed: 1.2, spread: 1, life: 0.5, size: 0.3, gravity: 0, damping: 3, shape: 'burst', intensity: 0.8 });
        fx.ring(p.x, p.z, { radius: 3.2, color: WARM, duration: 0.7, width: 0.15, opacity: 0.9, breakup: 0.7, wash: 0.25 });
        ctx.render?.flash?.(0xffb347, 0.08, 0.35);
      } else {
        s.out = true;
        s.darkT = 0;
        emit('lantern:out', {});
        if (!real(ctx.ui)) toast('Darkness. Burn a fish to relight your lantern.', 'bad');   // ui owns this message (tip, then toast)
        vibrate(40);
      }
    } else if (s.out && run.oil > 0) {
      s.out = false;
      s.darkT = 0;
      emit('lantern:lit', {});
      const p = lanternPos();
      fx.motes(p.x, p.y, p.z, { count: 16, color: WARM, speed: 2.4, spread: 0.5, life: 0.9, size: 0.15, gravity: -1.5, shape: 'cough' });
      fx.ring(p.x, p.z, { radius: 3, color: WARM, duration: 0.55, width: 0.12, opacity: 0.7, breakup: 0.4 });
    }
  }

  function drainOil(n, source) {
    const run = ctx.state.run;
    n = num(Number(n), 0);
    if (!run || n <= 0 || T.god || T.dead) return 0;
    const before = run.oil;
    run.oil = Math.max(0, run.oil - n);
    checkLantern(run);
    return before - run.oil;
  }

  // ---------------------------------------------------------------- damage
  function iframesFor(run) {
    const base = num(cfgDamage().iframes, 1.2);
    return base + Math.max(0, num(character(run)?.quirk?.iframes, 0));
  }

  function gutterBurst(run, big = false, src = '') {
    const G = cfgDamage().gutterBurst || FALLBACK.damage.gutterBurst;
    const q = character(run)?.quirk || {};
    const radius = num(G.radius, 4) * Math.max(1, num(q.burstRadiusMult, 1)) * (big ? 1.5 : 1);
    const p = playerPos(new THREE.Vector3());
    const payload = { position: p, radius, push: num(G.push, 5), stun: num(G.stun, 0.5), damage: !!q.burstDamage || big, source: big ? 'revive' : 'gutter' };
    const c = ctx.combat;
    emit('player:burst', payload);
    // a full combat module draws the Gutter-burst knock itself (on player:damage); avoid a doubled ring
    if (!big && real(c) && 'lightMult' in c) return;
    const col = big ? GOLD : src === 'darkness' ? GUTTER : src === 'starvation' ? WAX : WARM;
    const dim = src === 'darkness' ? 0.6 : 1;
    fx.ring(p.x, p.z, { radius, color: col, duration: big ? 0.9 : 0.42, width: big ? 0.1 : 0.13, opacity: dim, breakup: 0.55, wash: 0.28 });
    fx.ring(p.x, p.z, { radius: radius * 0.82, color: 0xfff1d6, duration: big ? 0.8 : 0.36, width: 0.05, opacity: 0.5 * dim, breakup: 0.8, wash: 0, delay: 0.05 });
    fx.motes(p.x, 0.45, p.z, { count: big ? 34 : 16, color: col, speed: radius * 2.1, life: big ? 0.7 : 0.45, size: 0.14, gravity: -4, damping: 3.2, shape: 'ring', radius: 1.2, intensity: dim });
  }

  function hurtFeedback(embers, src) {
    const env = ENV_SOURCES.has(src);
    // render shakes on player:damage and ui-hud vibrates on touch; survival only adds the red flash
    ctx.render?.flash?.(0x7a140a, Math.min(0.3, (env ? 0.1 : 0.14) + 0.05 * embers), 0.32);
    ctx.actors?.setPose?.('hurt');
    // wax and cinders knocked off the flame
    const h = headPos();
    fx.motes(h.x, h.y + 0.1, h.z, { count: 7 + 3 * embers, color: src === 'darkness' ? GUTTER : HURT, speed: 5, spread: 0.5, life: 0.6, size: 0.1, gravity: -7, damping: 1.4, shape: 'burst', intensity: 0.75 });
  }

  function damage(n, source, opts = null) {
    const run = ctx.state.run;
    if (!playing(run) || T.dead) return 0;
    n = num(Number(n), 0);
    const src = normSource(source);
    const env = ENV_SOURCES.has(src) || opts?.env === true;
    const oil = Math.max(0, num(Number(opts?.oil), 0));
    if (T.god) return 0;
    const Dm = cfgDamage();
    if (n <= 0) { if (oil) drainOil(oil, src); return 0; }
    if (!env && T.iframes > 0 && !opts?.ignoreIframes) {
      if (oil) drainOil(oil * num(Dm.iframeOilMult, 0.5), src);
      return 0;
    }
    const s = freshStats();
    if (!env && !opts?.ignoreArmor) {
      const armor = clamp(num(s.armor, 0), 0, num(Dm.armorCap, 0.6));
      if (armor > 0 && rand() < armor) {
        if (oil) drainOil(oil, src);
        const p = playerPos();
        ctx.ui?.floatText?.(_v2.set(p.x, 2.4, p.z), 'Warded', 'ward');
        fx.ring(p.x, p.z, { radius: 2.4, color: WARD, duration: 0.4, width: 0.1, opacity: 0.75, breakup: 0.3, wash: 0.1 });
        T.iframes = Math.max(T.iframes, 0.35);   // a ward shrugs the blow off; brief grace so a pile-up can't re-roll every frame
        emit('player:warded', { source: src });
        return 0;
      }
    }
    let embers = Math.max(1, Math.floor(n));
    if (source && typeof source === 'object' && source.boss) embers = Math.min(embers, num(Dm.bossHitCap, 3));
    run.hp = Math.max(0, run.hp - embers);
    T.iframes = iframesFor(run);
    const st = run.stats;
    st.damageTaken = (st.damageTaken | 0) + embers;
    if (!st.damageSources || typeof st.damageSources !== 'object') st.damageSources = {};
    st.damageSources[src] = (st.damageSources[src] | 0) + embers;
    const w = sv(run);
    if (run.phase === 'gloomtide') { w.nightHurt = true; w.nightEmbers += embers; }
    emit('player:damage', { amount: embers, source: src });
    hurtFeedback(embers, src);
    if (oil) drainOil(oil, src);
    if (run.hp <= 0) { die(causeFor(src), run); return embers; }
    gutterBurst(run, false, src);
    lowEdges(run, s);
    return embers;
  }

  function tryRevive(run) {
    const p = ctx.progression;
    if (real(p) && typeof p.tryRevive === 'function') {
      try { return !!p.tryRevive(); } catch (e) { console.error('[survival] tryRevive threw', e); return false; }
    }
    // fallback: the Second Wick relic, once per run (bookkeeping lives in run.surv)
    const lvl = num(ctx.state.meta?.relics?.second_wick, 0);
    const w = sv(run);
    if (lvl > 0 && !w.secondWickUsed) { w.secondWickUsed = true; return true; }
    return false;
  }

  function revive(run) {
    const R = cfgRevive();
    run.hp = 1;
    run.oil = Math.max(run.oil, Math.min(maxOil(), num(R.oil, 40)));
    checkLantern(run);
    T.iframes = Math.max(T.iframes, num(R.iframes, 2));
    const c = ctx.combat;
    if (real(c)) {
      try {
        if (typeof c.freeFlare === 'function') c.freeFlare();
        else {
          const before = run.oil;
          c.flare?.({ free: true, force: true });
          if (run.oil < before) { run.oil = before; checkLantern(run); }   // refund: the Second Wick's flare is free
        }
      } catch (e) { console.error('[survival] revive flare threw', e); }
    }
    gutterBurst(run, true);
    ctx.render?.flash?.(0xffd9a0, 0.12, 0.6);
    ctx.render?.shake?.(0.35, 0.5);
    const h = headPos();
    fx.motes(h.x, h.y, h.z, { count: 40, color: GOLD, speed: 2.4, spread: 0.4, life: 1.5, size: 0.16, gravity: 0.6, damping: 1.2, shape: 'rise', radius: 1.6 });
    toast('Second Wick. The flame catches again.', 'good');
    emit('player:revive', {});
    lowEdges(run, stats());
  }

  function die(cause, run) {
    if (T.dead) return;
    if (tryRevive(run)) { revive(run); return; }
    T.dead = true;
    run.hp = 0;
    ctx.actors?.setPose?.('die');
    emit('player:died', { cause });
  }

  function heal(n, source = 'heal') {
    const run = ctx.state.run;
    if (!run || run.active === false || T.dead) return 0;
    n = Math.max(0, num(Number(n), 0));
    if (n <= 0) return 0;
    const s = freshStats();
    const before = run.hp;
    run.hp = Math.min(maxHp(s), run.hp + n);
    const gained = run.hp - before;
    if (gained > 0) {
      emit('player:heal', { amount: gained, source });
      const h = headPos();
      fx.motes(h.x, h.y - 1.0, h.z, { count: 10 + 7 * gained, color: MEND, speed: 1.7, spread: 0.5, life: 1.5, size: 0.17, gravity: 0.5, damping: 0.9, shape: 'rise', radius: 1.4 });
      const p = playerPos();
      fx.ring(p.x, p.z, { radius: 3, color: MEND, duration: 1.0, width: 0.1, opacity: 0.85, breakup: 0.35, wash: 0.22 });
      lowEdges(run, s);
    }
    return gained;
  }

  function addOil(n) {
    const run = ctx.state.run;
    n = num(Number(n), 0);
    if (!run || run.active === false || n === 0) return 0;
    if (n < 0) return -drainOil(-n, 'drain');
    const before = run.oil;
    run.oil = Math.min(maxOil(freshStats()), run.oil + n);
    checkLantern(run);
    return run.oil - before;
  }

  function addSatiety(n) {
    const run = ctx.state.run;
    n = num(Number(n), 0);
    if (!run || run.active === false || n === 0) return 0;
    const before = run.satiety;
    run.satiety = clamp(run.satiety + n, 0, maxSat(n > 0 ? freshStats() : stats()));
    return run.satiety - before;
  }

  // ---------------------------------------------------------------- warnings (edge-triggered, hysteresis)
  function lowEdges(run, s) {
    const L = cfgLow();
    const w = sv(run);
    const of = run.oil / maxOil(s), sf = run.satiety / maxSat(s);
    if (w.lowOil && of <= num(L.oil, 0.25)) { w.lowOil = false; emit('resource:low', { resource: 'oil' }); }
    else if (!w.lowOil && of > num(L.oilRearm, 0.35)) w.lowOil = true;
    if (w.lowSat && sf <= num(L.satiety, 0.2)) { w.lowSat = false; emit('resource:low', { resource: 'satiety' }); }
    else if (!w.lowSat && sf > num(L.satietyRearm, 0.3)) w.lowSat = true;
    const hpLine = num(L.hp, 2);
    if (w.lowHp && run.hp <= hpLine && run.hp > 0) { w.lowHp = false; emit('resource:low', { resource: 'hp' }); }
    else if (!w.lowHp && run.hp > hpLine) w.lowHp = true;
  }

  // ticks at t = grace, grace + interval, …  → count of ticks in (a, b]
  function ticksBetween(a, b, grace, interval) {
    const f = (t) => (t < grace ? 0 : Math.floor((t - grace) / Math.max(0.1, interval)) + 1);
    return f(b) - f(a);
  }

  // ---------------------------------------------------------------- light mods
  function setLightMod(id, mult, duration = Infinity) {
    if (id == null) return;
    const m = num(Number(mult), 1);
    const ttl = duration == null ? Infinity : num(Number(duration), Infinity);
    for (const l of lightMods) if (l.id === id) { l.mult = m; l.ttl = ttl; return; }
    lightMods.push({ id, mult: m, ttl });
  }
  function clearLightMod(id) {
    for (let i = lightMods.length - 1; i >= 0; i--) if (lightMods[i].id === id) lightMods.splice(i, 1);
  }

  function targetLight(run, s) {
    const L = cfgLight();
    const w = run ? sv(run) : null;
    if (!run) return num(s.lightRadius, 8);
    if (w.out || run.oil <= 0) return num(L.emberGlow, 2.5);
    const of = clamp(run.oil / maxOil(s));
    const fr = num(L.floorRadius, 0.55);
    const radius = num(s.lightRadius, 8) * (fr + (1 - fr) * of);
    let mods = 1;
    for (let i = 0; i < lightMods.length; i++) mods *= lightMods[i].mult;
    const c = real(ctx.combat) ? ctx.combat : null;
    const cm = c ? c.lightMult : undefined;
    if (typeof cm === 'number' && Number.isFinite(cm) && cm > 0) {
      // combat tracks the dims it causes (moths, slick, veils, Eclipse, Hush…), the flare boost and
      // Gutsfire's surge; survival folds them in so every reader of lightRadius agrees.
      const dims = Math.max(num(L.dimFloor, 0.5), mods);
      const add = num(c.lightAdd, 0);
      return Math.max(0.5, radius * cm * dims + add);
    }
    // fallback (combat publishes nothing): survival applies the dims it can observe itself
    let dims = mods;
    const cd = c ? c.lightDims : undefined;
    if (typeof cd === 'number' && Number.isFinite(cd) && cd > 0) dims *= cd;
    if (real(ctx.player) && ctx.player.inSlick === true) dims *= num(L.slick, 0.8);
    const fm = real(ctx.fishing) ? ctx.fishing.lightMult : undefined;   // legendary Eclipse (combat folds it in when present)
    if (typeof fm === 'number' && fm > 0 && fm < 1) dims *= fm;
    dims = Math.max(num(L.dimFloor, 0.5), dims);
    const F = cfgFlare();
    const boostMax = num(F.lightBoost, 1.4);
    const boost = T.flareBoost > 0 ? 1 + (boostMax - 1) * Math.min(1, T.flareBoost / 0.5) : 1;
    const guts = T.gutsT > 0 ? T.gutsBonus : 0;
    return Math.max(0.5, radius * dims * boost + guts);
  }

  /**
   * DESIGN §5.6: a gloom-time legendary fight holds the Gloomtide open until it resolves. The
   * clock still runs into the hush (k ≥ 0.93, nothing spawns) and waits there instead of
   * breaking to dawn under the fight.
   */
  function holdsGloomtide(run) {
    if (run.phase !== 'gloomtide') return false;
    const f = ctx.fishing;
    if (!real(f)) return false;
    const st = f.state;
    if (st !== 'reeling' && st !== 'landing') return false;
    const v = f.view;
    if (!v || v.rarity !== 'legendary') return false;
    const sp = D().SPECIES_BY_ID?.[v.speciesId];
    return !sp || sp.time !== 'calm';
  }

  // ---------------------------------------------------------------- simulation
  function simulate(dt, run) {
    const s = stats();
    const w = sv(run);
    T.iframes = Math.max(0, T.iframes - dt);
    T.flareBoost = Math.max(0, T.flareBoost - dt);
    T.gutsT = Math.max(0, T.gutsT - dt);
    for (let i = lightMods.length - 1; i >= 0; i--) {
      const l = lightMods[i];
      if (l.ttl !== Infinity) { l.ttl -= dt; if (l.ttl <= 0) lightMods.splice(i, 1); }
    }

    // clock
    run.phaseTime += dt;
    let dur = phaseDuration(run.phase, run.day);
    if (holdsGloomtide(run)) run.phaseTime = Math.min(run.phaseTime, Math.max(0, dur - 0.05));
    let guard = 0;
    while (run.phaseTime >= dur && guard++ < 8) {
      run.phaseTime -= dur;
      advancePhase(run);
      if (T.dead || ctx.state.run !== run) return;
      dur = phaseDuration(run.phase, run.day);
    }

    // drains: oil/s = oilDrain × oilPhase × zone × drainMult ; satiety/s = satietyDrain × zone × drainMult
    const z = zoneData(run);
    const dm = diff(run).drainMult;
    const op = (B().drain?.oilPhase || FALLBACK.oilPhase)[run.phase] ?? 1;
    T.oilRate = Math.max(0, num(s.oilDrain, 0.14) * op * num(z?.drain?.oil, 1) * dm);
    T.satRate = Math.max(0, num(s.satietyDrain, 0.1) * num(z?.drain?.satiety, 1) * dm);
    if (!T.god) {
      if (!w.out) run.oil = Math.max(0, run.oil - T.oilRate * dt);
      run.satiety = Math.max(0, run.satiety - T.satRate * dt);
    }
    run.hp = Math.min(run.hp, maxHp(s));
    run.oil = Math.min(run.oil, maxOil(s));
    run.satiety = Math.min(run.satiety, maxSat(s));
    checkLantern(run);

    const Dm = cfgDamage();
    // darkness: grace, then 1 Ember every interval
    if (w.out && !T.god) {
      const g = num(Dm.darkness?.grace, 3), iv = num(Dm.darkness?.interval, 8);
      const a = w.darkT; w.darkT += dt;
      const n = ticksBetween(a, w.darkT, g, iv);
      for (let i = 0; i < n && !T.dead; i++) damage(1, 'darkness', { env: true });
      if (T.dead) return;
    } else if (!w.out) w.darkT = 0;

    // starvation: grace, then 1 Ember every interval (reel/hook penalties read via survival.starving)
    if (run.satiety <= 0) {
      if (!T.starving) { T.starving = true; toast('Starving. Eat something from your creel.', 'bad'); }
      if (!T.god) {
        const g = num(Dm.starvation?.grace, 5), iv = num(Dm.starvation?.interval, 20);
        const a = w.starveT; w.starveT += dt;
        const n = ticksBetween(a, w.starveT, g, iv);
        for (let i = 0; i < n && !T.dead; i++) damage(1, 'starvation', { env: true });
        if (T.dead) return;
      }
    } else { T.starving = false; w.starveT = 0; }

    lowEdges(run, s);
  }

  // ---------------------------------------------------------------- visuals pushed to actors
  function pushVisuals(rdt, run) {
    const s = stats();
    const target = targetLight(run, s);
    if (T.snapLight || !Number.isFinite(T.light)) { T.light = target; T.snapLight = false; }
    else T.light = damp(T.light, target, target > T.light ? 12 : 7, rdt);
    api.lightRadius = T.light;

    const a = ctx.actors;
    if (!a || a.isStub) return;
    let lantern = 1, vit = 1;
    if (run) {
      const w = sv(run);
      lantern = w.out ? 0 : clamp(run.oil / maxOil(s));
      vit = clamp(run.hp / maxHp(s));
      if (T.iframes > 0 && !T.dead) {
        // the Wick's flame flickers while it is untouchable
        T.flickerClock += rdt;
        const reduced = ctx.state.meta?.settings?.reducedFlashing === true;
        const on = Math.floor(T.flickerClock / 0.07) % 2 === 0;
        vit *= on ? 1 : (reduced ? 0.85 : 0.55);
      } else T.flickerClock = 0;
    } else {
      lantern = 1; vit = 1;
    }
    a.setLanternLevel?.(lantern);
    a.setLightRadius?.(T.light);
    a.setVitality?.(vit);
  }

  function resetTransient() {
    T.iframes = 0; T.flareBoost = 0; T.gutsT = 0; T.gutsBonus = 0;
    T.dead = false; T.starving = false; T.snapLight = true;
    lightMods.length = 0;
    statsCache = null; diffKey = '';
    fx.clear();
  }

  // ---------------------------------------------------------------- api
  const api = {
    lightRadius: 8,
    appliesCombatLight: true,   // lightRadius already includes combat.lightMult / lightAdd
    grantIframes(seconds) { T.iframes = Math.max(T.iframes, Math.max(0, num(Number(seconds), 0))); return T.iframes; },
    get lanternOut() { const r = ctx.state.run; return !!(r && r.surv?.out); },
    get starving() { return T.starving; },
    get oilFrac() { const r = ctx.state.run; return r ? clamp(r.oil / maxOil()) : 1; },
    get iframes() { return T.iframes; },
    get reviveInfo() {
      const r = ctx.state.run;
      const owned = num(ctx.state.meta?.relics?.second_wick, 0) > 0;
      return { available: owned && !(r?.surv?.secondWickUsed) };
    },
    fx,

    init() {
      const scene = ctx.render?.scene;
      if (scene && !ctx.render.isStub && scene.isObject3D) scene.add(fx.group);
      const bus = ctx.bus;
      bus.on('run:start', ({ continued } = {}) => {
        const run = ctx.state.run;
        resetTransient();
        if (!run) return;
        T.runRef = run;
        validate(run);
        const w = sv(run);
        if (!continued) {
          w.flickerDay = 0; w.nightHurt = false; w.nightEmbers = 0; w.starveT = 0; w.darkT = 0;
          w.lowOil = w.lowSat = w.lowHp = true; w.secondWickUsed = false;
        }
        w.out = run.oil <= 0 && w.flickerDay === run.day;
        T.starving = run.satiety <= 0;
      });
      bus.on('zone:change', () => { diffKey = ''; statsCache = null; });
      bus.on('flare', () => {
        const F = cfgFlare();
        T.flareBoost = num(F.boostTime, 3);
        T.iframes = Math.max(T.iframes, num(F.iframes, 0.3));
      });
      bus.on('fish:action', ({ action } = {}) => {
        if (action !== 'render') return;
        const run = ctx.state.run;
        const lvl = num(run?.boons?.gutsfire, 0);
        if (!run || lvl <= 0) return;
        const levels = (D().BOON_BY_ID?.gutsfire || (D().BOONS || []).find((b) => b.id === 'gutsfire'))?.proc?.levels;
        const L = Array.isArray(levels) && levels.length ? levels[Math.min(levels.length, lvl) - 1] : null;
        if (!L) return;
        T.gutsT = num(L.time, 6);
        T.gutsBonus = num(L.lightRadius, 1);
      });
      for (const e of ['boon:chosen', 'shop:buy', 'relic:buy', 'levelup', 'journal:new', 'day:start', 'boss:slain', 'unlock']) {
        bus.on(e, () => { statsCache = null; });
      }
      bus.on('flow:change', ({ flow } = {}) => {
        if (flow === 'title') { T.dead = false; T.snapLight = true; fx.clear(); }
      });

      Object.assign(ctx.debug, {
        skipPhase() {
          const run = ctx.state.run;
          if (!run) return null;
          run.phaseTime = 0;
          advancePhase(run);
          return run.phase;
        },
        god(on = true) { T.god = !!on; return T.god; },
        setPhase(name) { return setPhase(name); },
        // extras
        setOil(n) { const r = ctx.state.run; if (!r) return null; r.oil = clamp(num(n, 0), 0, maxOil(freshStats())); checkLantern(r); return r.oil; },
        setSatiety(n) { const r = ctx.state.run; if (!r) return null; r.satiety = clamp(num(n, 0), 0, maxSat(freshStats())); return r.satiety; },
        setHp(n) { const r = ctx.state.run; if (!r) return null; r.hp = clamp(Math.round(num(n, 1)), 0, maxHp(freshStats())); if (r.hp <= 0) die('gloom', r); return r.hp; },
        hurt(n = 1, source = 'debug') { return damage(n, source, { ignoreIframes: true, ignoreArmor: true }); },
        setDay(n) { const r = ctx.state.run; if (!r) return null; r.day = Math.max(1, num(n, 1) | 0); diffKey = ''; return r.day; },
        survival() {
          const r = ctx.state.run;
          return {
            phase: getPhaseInfo(), god: T.god, iframes: T.iframes, light: T.light, oilRate: T.oilRate, satRate: T.satRate,
            starving: T.starving, dead: T.dead, mods: lightMods.map((l) => ({ ...l })), surv: r?.surv ? { ...r.surv } : null,
            hp: r?.hp, oil: r?.oil, satiety: r?.satiety,
          };
        },
      });
    },

    update(dt, t) {
      const rdt = Math.min(0.1, num(ctx.time?.dt, 0));
      statsAge += rdt;
      const run = ctx.state.run;
      if (run && T.runRef !== run) {
        // a run object appeared without run:start (defensive): adopt it
        T.runRef = run;
        resetTransient();
        validate(run);
      }
      if (run) {
        validate(run);
        if (playing(run) && dt > 0 && !T.dead) simulate(dt, run);
      } else T.runRef = null;
      pushVisuals(rdt, ctx.state.run);
      fx.update(rdt, real(ctx.player) ? ctx.player.position : null);
    },

    getPhaseInfo,
    damage,
    heal,
    addOil,
    addSatiety,
    drainOil,
    isInvulnerable() {
      const run = ctx.state.run;
      return T.god || T.iframes > 0 || T.dead || !playing(run);
    },
    isGod: () => T.god,
    /** Jump the clock to a phase (e.g. the Pale Leviathan landing ends the Gloomtide). */
    setPhase(name) { return setPhase(name); },
    get holdingGloomtide() { const r = ctx.state.run; return !!r && holdsGloomtide(r); },
    addIframes(seconds) { return api.grantIframes(seconds); },
    setLightMod,
    clearLightMod,
    getVitals() {
      const run = ctx.state.run;
      const s = stats();
      return {
        hp: run?.hp ?? maxHp(s), maxHp: maxHp(s), oil: run?.oil ?? maxOil(s), maxOil: maxOil(s),
        satiety: run?.satiety ?? maxSat(s), maxSatiety: maxSat(s), oilRate: T.oilRate, satietyRate: T.satRate,
        lanternOut: !!run?.surv?.out, starving: T.starving, lightRadius: T.light, iframes: T.iframes,
      };
    },
    dispose() { fx.dispose(); },
  };
  return api;
}
