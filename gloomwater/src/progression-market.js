// progression-market.js — Old Murk (DESIGN §13): his mooring schedule, the five shop
// tabs (Sell · Gear · Bait · Supplies · Ledger) and the Ledger bounties (§15).
// v3 automatic fishing (Pg14, DESIGN §25.6.3): in P1–P2 runs a sixth tab, Lures: every lure (the giants' lures included) per run
// at 40% of its price once its lake is lit (AUTOFISH.runLures), kept in run.lures until the run ends.
// Helper of progression.js only (receives the shared internals object `S`).
import { uid, rand } from './core.js';
import { heavyTargetKg } from './progression-v3.js';

const RARITY_RANK = { common: 0, uncommon: 1, rare: 2, legendary: 3 };
const QUALITY_RANK = { normal: 0, fine: 1, perfect: 2 };
const SPECIES_TYPES = new Set(['catchSpecies', 'heavy', 'legend']);

export function createMarket(S) {
  const { ctx } = S;
  const D = () => ctx.data || {};
  const run = () => ctx.state.run;
  const BAL = (k) => D().BALANCE?.[k] || {};
  const lines = (k) => D().MERCHANT_LINES?.[k] || [];
  const line = (k) => { const l = lines(k); return l.length ? l[(rand() * l.length) | 0] : ''; };

  let present = false;            // Murk is moored right now (transient; re-derived after a load)

  const actorsMerchant = () => S.real(ctx.actors?.merchant);
  const flags = () => { const r = run(); if (!r) return null; r.flags = r.flags || {}; return r.flags; };
  const zoneIndex = () => S.zoneIndexOf(run()?.zone);
  const valueMult = () => S.zone(run()?.zone)?.valueMult ?? 1;

  // ================================================================ schedule
  function arriveAt(r) {
    const M = BAL('merchant');
    if (r.day === 1 && !r.flags?.waystoneStart) return M.day1ArriveAt ?? 20;
    return M.arriveAt ?? 0;
  }

  function arrive() {
    const r = run();
    if (!r) return;
    const dock = S.real(ctx.world?.getMerchantDock?.(r.day));
    const pos = dock?.position && typeof dock.position.x === 'number' ? dock.position : null;
    try { actorsMerchant()?.arrive?.(pos, typeof dock?.yaw === 'number' ? dock.yaw : 0); } catch (e) { S.report('merchant.arrive', e); }
    present = true;
    const f = flags();
    const firstToday = f.murkDay !== r.day;
    ctx.bus.emit('merchant:arrive', { day: r.day, position: pos, again: !firstToday });
    if (!firstToday) return;
    f.murkDay = r.day;
    f.visit = { day: r.day, sold: 0, supplies: {} };
    // Murk speaks once per mooring: pity > low oil > Warden night > hello
    const st = S.stats();
    const P = BAL('merchant').pity || {};
    const oilFrac = (r.oil || 0) / Math.max(1, st.maxOil || 100);
    if (!f.pityUsed && (r.shells || 0) < (P.shells ?? 20) && oilFrac < (P.oilFrac ?? 0.25)) {
      f.pityUsed = (f.pityUsed | 0) + 1;
      const give = P.give || { oil: 30, satiety: 30 };
      if (give.oil) ctx.survival?.addOil?.(give.oil);
      if (give.satiety) ctx.survival?.addSatiety?.(give.satiety);
      S.toast(`Old Murk: "${line('pity')}" (+${give.oil || 0} oil, +${give.satiety || 0} satiety)`, 'good');
    } else if (oilFrac < 0.25 && lines('lowOil').length) {
      S.toast(`Old Murk: "${line('lowOil')}"`, 'bad');
    } else if (S.isBossNight() && lines('warden').length) {
      S.toast(`Old Murk: "${line('warden')}"`, 'lore');
    } else if (lines('arrive').length) {
      S.toast(`Old Murk: "${line('arrive')}"`, 'info');
    }
    offerBounties();
  }

  function leave({ quiet = false } = {}) {
    const wasPresent = present;
    present = false;
    try { actorsMerchant()?.leave?.(); } catch (e) { S.report('merchant.leave', e); }
    if (!wasPresent) return;
    ctx.bus.emit('merchant:leave', {});
    if (!quiet && lines('farewell').length) S.toast(`Old Murk: "${line('farewell')}"`, 'lore');
  }

  /** Hard reset (new run / title / zone rebuild): hide the barge without speeches. */
  function reset() {
    present = false;
    try { actorsMerchant()?.leave?.(); } catch { /* optional */ }
  }

  function update() {
    const r = run();
    if (!r || ctx.flow !== 'playing') return;
    const pi = S.phaseInfo();
    if (pi.phase === 'calm') {
      if (!present && pi.time >= arriveAt(r)) arrive();
      const f = flags();
      if (present && pi.k >= (BAL('merchant').warnAt ?? 0.85) && f.murkWarnDay !== r.day) {
        f.murkWarnDay = r.day;
        ctx.audio?.play?.('merchant_bell', { volume: 0.7 });
        if (lines('warn').length) S.toast(`Old Murk: "${line('warn')}"`, 'info');
      }
    } else if (present) {
      leave();
    }
  }

  /** After a descent during the calm Murk follows and re-moors at the new lake's dock. */
  function followDescent() {
    const r = run();
    if (!r) return;
    const wasPresent = present;
    reset();
    if (!wasPresent || S.phaseInfo().phase !== 'calm' || !(BAL('travel').murkFollows ?? true)) return;
    arrive();
    // a new lake, a new visit: fresh per-visit limits and Ledger entries for these waters
    const f = flags();
    f.visit = { day: r.day, sold: 0, supplies: {} };
    offerBounties();
  }

  function isPresent() { return present; }
  function canShop() {
    const r = run();
    if (!r || !present || ctx.flow !== 'playing') return false;
    if (ctx.player?.isNear?.('merchant') === true) return true;
    if (typeof ctx.player?.isNear === 'function' && !ctx.player.isStub) return false;
    // no player module: fall back to a distance check
    const m = actorsMerchant();
    const p = ctx.player?.position;
    if (!m?.position || !p || typeof p.x !== 'number') return false;
    return Math.hypot(m.position.x - p.x, m.position.z - p.z) <= (BAL('move').interactRange ?? 5);
  }
  /** Trading is allowed while Murk is moored and the Wick is beside him (or the shop is open). */
  function canTrade() { return present && !!run() && (canShop() || ctx.ui?.isShopOpen?.() === true); }

  // ================================================================ shop items
  const priceOfBait = (b) => (b.legend ? b.price : Math.round(b.price * ((BAL('economy').baitMult || [1])[zoneIndex()] ?? 1)));
  const priceOfSupply = (s) => Math.round(s.price * ((BAL('economy').supplyMult || [1])[zoneIndex()] ?? 1));
  function baitUnlocked(b) { return !b.unlock || S.isUnlocked(`bait:${b.id}`); }
  function afford(price) { return (run()?.shells || 0) >= price; }
  function poorReason(price) { return `Need ${price - (run()?.shells || 0)} more Shells`; }
  function closedReason() { return present ? '' : 'Old Murk has cast off'; }

  function sellItem(fish) {
    const sp = S.species(fish.speciesId);
    const price = S.sellValue(fish);
    const legendary = sp?.rarity === 'legendary';
    const trophy = legendary ? (BAL('economy').trophyMemories || [])[S.zoneIndexOf(sp.zone)] || 0 : 0;
    return {
      id: `sell:${fish.uid}`, kind: 'sell', category: 'sell', tab: 'sell', name: sp?.name || fish.speciesId,
      desc: legendary
        ? (trophy ? `Trophy or Toll: sell it for the toll, or keep it to the end of the descent and mount it for +${trophy} Memories.` : 'Murk would pay a fortune for it.')
        : `${S.fmtKg(fish.weight)} · ${S.qualityLabel(fish.quality)}`,
      price, level: 0, maxLevel: 0, canBuy: canTrade(), reason: closedReason(),
      fish, legendary, rarity: sp?.rarity || 'common', icon: 'fish', quality: fish.quality,
    };
  }
  function sellAllItem(r) {
    const fishes = r.creel.filter((f) => !S.species(f.speciesId) || S.species(f.speciesId).rarity !== 'legendary');
    if (!fishes.length) return null;
    const price = fishes.reduce((a, f) => a + S.sellValue(f), 0);
    return {
      id: 'sell:all', kind: 'sellAll', category: 'sell', tab: 'sell', name: 'Sell all',
      desc: `Sell every fish except legendaries (${fishes.length}).`, price, level: 0, maxLevel: 0,
      canBuy: canTrade(), reason: closedReason(), count: fishes.length, icon: 'shell',
    };
  }
  function gearItem(u, r) {
    const level = r.upgrades?.[u.id] | 0;
    const maxLevel = u.maxLevel ?? (u.costs?.length || 1);
    const maxed = level >= maxLevel;
    const price = maxed ? 0 : (u.costs?.[level] ?? 0);
    let reason = closedReason();
    if (!reason && maxed) reason = 'Fully upgraded';
    if (!reason && !afford(price)) reason = poorReason(price);
    return {
      id: `gear:${u.id}`, kind: 'upgrade', category: 'gear', tab: 'gear', group: u.category, icon: u.icon,
      name: u.name, desc: u.desc, price, level, maxLevel, maxed, canBuy: !reason, reason,
      effects: u.effects, effectText: S.effectText(u.effects), upgradeId: u.id,
    };
  }
  function baitItem(b, r) {
    const price = priceOfBait(b);
    const owned = r.bait?.[b.id] | 0;
    let reason = closedReason();
    if (!reason && b.legend) {
      const legendId = S.legendaryOfBait(b.id);
      if (legendId && r.legendaries?.[legendId]) reason = 'Already landed this descent';
      else if (owned > 0) reason = 'You already carry one';
    }
    if (!reason && !afford(price)) reason = poorReason(price);
    const legend = b.legend ? S.species(S.legendaryOfBait(b.id)) : null;
    return {
      id: `bait:${b.id}`, kind: 'bait', category: 'bait', tab: 'bait', icon: b.icon, name: b.name,
      desc: b.desc + (legend ? ` Draws ${legend.name}.` : ''), price, level: owned, maxLevel: 0,
      canBuy: !reason, reason, count: b.count ?? 1, owned, legend: !!b.legend, baitId: b.id,
      effectText: S.baitBonusText(b),
      // v3 automatic fishing: the bait's Hold and whom it helps (the gear log's line at Murk's bait rows; never a %)
      ...(S.isV3?.() && D().CATCH_V3?.items?.[b.id] ? { hold: D().CATCH_V3.items[b.id].hold ?? 0, targets: S.af?.targetsOf?.(b.id) ?? [], holdText: S.af?.holdText?.(b.id) || '' } : {}),
    };
  }
  function supplyItem(s, r) {
    const price = priceOfSupply(s);
    const f = flags();
    const bought = f?.visit?.day === r.day ? f.visit.supplies?.[s.id] | 0 : 0;
    const limit = s.limitPerVisit | 0;
    const st = S.stats();
    let reason = closedReason();
    if (!reason && limit && bought >= limit) reason = 'One per visit';
    if (!reason && s.give?.hp && (r.hp || 0) >= (st.maxHp || 5)) reason = 'Your Embers are whole';
    if (!reason && s.give?.oil && !s.give?.satiety && (r.oil || 0) >= (st.maxOil || 100) - 0.5) reason = 'Your lantern is full';
    if (!reason && s.give?.satiety && !s.give?.oil && (r.satiety || 0) >= (st.maxSatiety || 100) - 0.5) reason = 'You are full';
    if (!reason && s.give?.spots && S.phaseInfo().phase !== 'calm') reason = 'Only useful in the calm';
    if (!reason && !afford(price)) reason = poorReason(price);
    return {
      id: `supply:${s.id}`, kind: 'supply', category: 'supplies', tab: 'supplies', icon: s.icon, name: s.name,
      desc: s.desc, price, level: bought, maxLevel: limit, canBuy: !reason, reason, give: s.give, supplyId: s.id,
      effectText: giveText(s.give),
    };
  }
  /** Pg14: a per-run lure row (tab 'lure'): its 40% price, its Hold and whom it helps (the gear log's line; never a %). */
  function lureItem(x, r) {
    const L = x.lure;
    const hold = D().CATCH_V3?.items?.[L.id]?.hold ?? 0;
    let reason = closedReason();
    if (!reason && x.owned) reason = 'Yours for this descent';
    if (!reason && !afford(x.price)) reason = poorReason(x.price);
    return {
      id: `lure:${L.id}`, kind: 'lure', category: 'lure', tab: 'lure', icon: 'lure', name: L.name,
      desc: L.desc || '', price: x.price, level: x.owned ? 1 : 0, maxLevel: 1, owned: x.owned, canBuy: !reason, reason, lureId: L.id,
      hold, targets: S.af?.targetsOf?.(L.id) ?? [], giants: Array.isArray(L.species), equipped: S.af?.equippedItem?.(r) === L.id,
      depth: L.depth || null, holdText: S.af?.holdText?.(L.id) || `+${hold} Hold`, effectText: S.af?.holdText?.(L.id) || `+${hold} Hold`,
    };
  }
  function ledgerItem(b) {
    return {
      id: `bounty:${b.id}`, kind: 'bounty', category: 'ledger', tab: 'ledger', icon: 'ledger', name: b.text,
      desc: `${b.progressText} · due by the end of Day ${b.expiresDay}`, price: b.reward?.shells || 0,
      level: b.progress, maxLevel: b.count, canBuy: false, reason: 'Paid the moment it is done', bounty: b,
    };
  }

  function getItems() {
    const r = run();
    if (!r) return [];
    const zi = zoneIndex();
    const items = [];
    for (const fish of r.creel || []) items.push(sellItem(fish));
    const all = sellAllItem(r);
    if (all) items.push(all);
    for (const u of D().UPGRADES || []) if (!u.zone || (r.zonesUnlocked || []).includes(u.zone)) items.push(gearItem(u, r));
    for (const b of D().BAITS || []) {
      if (!baitUnlocked(b)) continue;
      if (b.legend) { if ((b.zone || null) !== r.zone) continue; }
      else if ((b.zoneMin ?? 0) > zi) continue;
      items.push(baitItem(b, r));
    }
    for (const s of D().SUPPLIES || []) if ((s.zoneMin ?? 0) <= zi) items.push(supplyItem(s, r));
    if (S.af?.runLuresOn?.(r)) for (const x of S.af.runLures(r)) items.push(lureItem(x, r));
    for (const b of getBounties()) items.push(ledgerItem(b));
    return items;
  }

  function buy(itemId) {
    const r = run();
    if (!r) return { ok: false, msg: 'There is no descent under way.' };
    const raw = String(itemId || '');
    const [prefix, ...rest] = raw.split(':');
    const id = rest.join(':');
    if (prefix === 'sell') return id === 'all' ? sellAll() : sellFish(id);
    if (prefix === 'gear') return buyUpgrade(id);
    if (prefix === 'bait') return buyBait(id);
    if (prefix === 'supply') return buySupply(id);
    if (prefix === 'lure') return buyLure(id);
    if (prefix === 'bounty') return { ok: false, msg: 'Bounties pay out the moment they are done.' };
    // bare ids
    if (S.upgrade(raw)) return buyUpgrade(raw);
    if (S.bait(raw)) return buyBait(raw);
    if (S.supply(raw)) return buySupply(raw);
    if (S.af?.isLure?.(raw) && S.af.runLuresOn(r)) return buyLure(raw);
    if (r.creel?.some((f) => f.uid === raw)) return sellFish(raw);
    return { ok: false, msg: 'Murk squints. "Never heard of it."' };
  }

  function denied(msg) { return { ok: false, msg }; }
  function purchased(itemId, item, extra = {}) {
    ctx.bus.emit('shop:buy', { itemId, item });
    return { ok: true, msg: line('buy') || 'Bought.', item, ...extra };
  }

  function buyUpgrade(id) {
    const r = run();
    const u = S.upgrade(id);
    if (!u) return denied('No such gear.');
    if (!canTrade()) return denied('Old Murk is not here.');
    if (u.zone && !(r.zonesUnlocked || []).includes(u.zone)) return denied('Murk keeps that for deeper water.');
    const item = gearItem(u, r);
    if (item.maxed) return denied('Fully upgraded.');
    if (!afford(item.price)) return denied(line('poor') || item.reason);
    S.spendShells(item.price, 'upgrade');
    r.upgrades = r.upgrades || {};
    r.upgrades[u.id] = item.level + 1;
    S.invalidate();
    S.syncRaftLevel();
    return purchased(`gear:${u.id}`, { ...item, level: item.level + 1 }, { level: item.level + 1 });
  }

  function buyBait(id) {
    const r = run();
    const b = S.bait(id);
    if (!b || !baitUnlocked(b)) return denied('Murk has none of that.');
    if (!canTrade()) return denied('Old Murk is not here.');
    if (b.legend ? b.zone !== r.zone : (b.zoneMin ?? 0) > zoneIndex()) return denied('Murk has none of that here.');
    const item = baitItem(b, r);
    if (!item.canBuy) return denied(item.reason.startsWith('Need') ? (line('poor') || item.reason) : item.reason);
    S.spendShells(item.price, 'bait');
    r.bait = r.bait || {};
    r.bait[b.id] = (r.bait[b.id] | 0) + (b.count ?? 1);
    const lureOn = S.isV3?.() && S.af?.isLure?.(S.af.equippedItem(r));   // Pg14: a bought bait never knocks a lure off the line
    if (!lureOn && (!r.equippedBait || (r.bait[r.equippedBait] | 0) <= 0)) S.equipBait(b.legend ? r.equippedBait : b.id, { quiet: true });
    if (b.legend) S.toast(`${b.name}: equip it and cast into the still water of the legend pool.`, 'info');
    return purchased(`bait:${b.id}`, item, { count: r.bait[b.id] });
  }

  function buySupply(id) {
    const r = run();
    const s = S.supply(id);
    if (!s) return denied('Murk has none of that.');
    if (!canTrade()) return denied('Old Murk is not here.');
    if ((s.zoneMin ?? 0) > zoneIndex()) return denied('Murk has none of that here.');
    const item = supplyItem(s, r);
    if (!item.canBuy) return denied(item.reason.startsWith('Need') ? (line('poor') || item.reason) : item.reason);
    S.spendShells(item.price, 'supply');
    const f = flags();
    if (f.visit?.day !== r.day) f.visit = { day: r.day, sold: 0, supplies: {} };
    f.visit.supplies[s.id] = (f.visit.supplies[s.id] | 0) + 1;
    const g = s.give || {};
    if (g.oil) ctx.survival?.addOil?.(g.oil);
    if (g.satiety) ctx.survival?.addSatiety?.(g.satiety);
    if (g.hp) ctx.survival?.heal?.(g.hp);
    if (g.flareCharges) f.flareCharges = (f.flareCharges | 0) + g.flareCharges;
    if (g.spots) {
      f.tideChart = { day: r.day, count: g.spots };
      ctx.fishing?.addSpots?.(g.spots, { rare: true, untilDusk: true, source: 'tide_chart' });
    }
    if (g.chum) ctx.fishing?.armChum?.();   // v3 Murk's Chum (F6): the next cast spawns a 30 s nervous sign at the bobber
    return purchased(`supply:${s.id}`, item);
  }

  /** Pg14: a lure for this run (P1–P2), at 40% once its lake is lit; it goes on the line unless another lure already is. */
  function buyLure(id) {
    const r = run();
    if (!r) return denied('There is no descent under way.');
    const L = S.af?.lure?.(id);
    if (!L || !S.af.runLuresOn(r)) return denied('Murk has none of that.');
    if (!canTrade()) return denied('Old Murk is not here.');
    const x = S.af.runLures(r).find((q) => q.lure.id === L.id);
    if (!x || (!x.lit && !x.owned)) return denied('Murk keeps that for deeper water.');
    const item = lureItem(x, r);
    if (x.owned) return denied('Yours for this descent already.');
    if (!item.canBuy) return denied(item.reason.startsWith('Need') ? (line('poor') || item.reason) : item.reason);
    S.spendShells(item.price, 'lure');
    S.af.grantRunLure(L.id);
    return purchased(`lure:${L.id}`, { ...item, owned: true, level: 1 });
  }

  function sellFish(fishUid) {
    const r = run();
    if (!canTrade()) return denied('Only Old Murk buys fish, and only while he is moored.');
    const res = S.fishAction(fishUid, 'sell');
    return res.ok ? { ...res, msg: line('sell') || res.msg } : res;
  }
  function sellAll() {
    const r = run();
    if (!canTrade()) return denied('Only Old Murk buys fish, and only while he is moored.');
    const fishes = (r.creel || []).filter((f) => S.species(f.speciesId)?.rarity !== 'legendary');
    if (!fishes.length) return denied('Nothing in the creel Murk wants.');
    let total = 0;
    for (const fish of fishes) {
      const res = S.fishAction(fish.uid, 'sell');
      if (res.ok) total += res.gained?.shells || 0;
    }
    return { ok: true, msg: line('sell') || `Sold for ${total} Shells.`, gained: { shells: total } };
  }

  /** progression.fishAction('sell') reports here (per-visit sale counter for bounties). */
  function noteSale() {
    const r = run();
    const f = flags();
    if (!r || !f) return;
    if (f.visit?.day !== r.day) f.visit = { day: r.day, sold: 0, supplies: {} };
    f.visit.sold = (f.visit.sold | 0) + 1;
    bountyEvent('sell', { sold: f.visit.sold });
  }

  function giveText(g = {}) {
    const bits = [];
    if (g.oil) bits.push(`+${g.oil} oil`);
    if (g.satiety) bits.push(`+${g.satiety} satiety`);
    if (g.hp) bits.push(`+${g.hp} Ember`);
    if (g.flareCharges) bits.push(`${g.flareCharges} free flares`);
    if (g.spots) bits.push(`${g.spots} rich spots`);
    if (g.chum) bits.push('nervous water on your next cast');
    return bits.join(' · ');
  }

  // ================================================================ bounties
  function speciesTargets(r, rarities) {
    return (D().SPECIES || []).filter((s) => s.zone === r.zone && !s.bait && s.rarity !== 'legendary'
      && (!rarities || rarities.includes(s.rarity)));
  }
  const pickInt = (v) => (Array.isArray(v) ? v[0] + ((rand() * (v[1] - v[0] + 1)) | 0) : (v | 0) || 1);
  const pick = (arr) => arr[(rand() * arr.length) | 0];
  const midName = (name) => String(name || '').replace(/^The /, 'the ');

  function legendEligible(r) {
    const legendId = S.legendaryOfZone(r.zone);
    if (!legendId || r.legendaries?.[legendId]) return null;
    const baitId = S.species(legendId)?.bait;
    const b = baitId ? S.bait(baitId) : null;
    if (!b) return null;
    if ((r.bait?.[b.id] | 0) <= 0 && (r.shells || 0) < priceOfBait(b)) return null;
    return legendId;
  }

  function makeBounty(t, r) {
    const p = t.params || {};
    const day = r.day || 1;
    const zi = zoneIndex();
    const B = BAL('bounty');
    let reward = Math.round((t.base || 0) * valueMult() * (1 + (B.dayGrowth ?? 0.04) * (day - 1)));
    const b = {
      id: uid('bounty'), templateId: t.id, type: t.type, text: t.text, zone: r.zone, target: null, count: 1, progress: 0,
      reward: { shells: 0 }, expiresDay: day + (B.durationDays ?? 2), offeredDay: day, memories: t.memories || 0,
    };
    const fill = {};
    switch (t.type) {
      case 'catchSpecies': {
        const sp = pick(speciesTargets(r, p.rarities));
        if (!sp) return null;
        b.target = sp.id; b.count = pickInt(p.n); fill.species = sp.name; fill.n = b.count;
        reward += (t.perN || 0) * b.count;
        break;
      }
      case 'heavy': {
        const pool = speciesTargets(r, ['common', 'uncommon']);
        const sp = pick(pool);
        if (!sp) return null;
        const skew = BAL('economy').weightSkew ?? 1.6;
        const tq = Math.pow(p.percentile ?? 0.75, skew);
        const kgV3 = D().V3_ENABLED === true ? heavyTargetKg(D(), sp, p.percentile ?? 0.75, r.zone) : null;   // v3: by size score
        const kg = kgV3 ?? sp.weight[0] + (sp.weight[1] - sp.weight[0]) * tq;
        b.target = sp.id; b.kg = kg < 1 ? Math.round(kg * 100) / 100 : Math.round(kg * 10) / 10;
        fill.species = sp.name; fill.kg = b.kg;
        break;
      }
      case 'catchRarity': b.target = p.rarity || 'uncommon'; b.count = pickInt(p.n); fill.n = b.count; break;
      case 'depthCatch': b.target = p.depthMin ?? 0.75; b.count = pickInt(p.n); fill.n = b.count; break;
      case 'perfectHooks': case 'streak': case 'spotCatch': case 'signCatch': case 'slayElite':
        b.count = pickInt(p.n); fill.n = b.count; break;
      case 'slayNight': {
        const heat = D().heatFor?.(day, zi) ?? (day - 1 + 3 * zi);
        b.count = Math.round((p.nBase ?? 40) + (p.perHeat ?? 12) * heat); fill.n = b.count;
        break;
      }
      case 'sellVisit': b.count = (p.nBase ?? 3); fill.n = b.count; break;
      case 'quality': b.target = p.quality || 'fine'; break;
      case 'legend': {
        const legendId = legendEligible(r);
        if (!legendId) return null;
        b.target = legendId; fill.legend = midName(S.species(legendId)?.name);
        break;
      }
      case 'boss': b.count = pickInt(p.n); b.expiresDay = day; break;   // "a Warden rises tonight"
      default: break;                                                    // unscathed, noFlare, nightFish
    }
    b.reward.shells = Math.max(1, reward);
    b.text = String(t.text || '').replace(/\{(\w+)\}/g, (m, k) => (fill[k] != null ? fill[k] : m));
    return decorate(b);
  }

  function decorate(b) {
    let progressText;
    if (b.type === 'unscathed' || b.type === 'noFlare' || b.type === 'boss' && b.count === 1 || b.type === 'legend' || b.type === 'heavy' || b.type === 'quality' || b.type === 'nightFish') {
      progressText = b.progress >= b.count ? 'Done' : 'Not yet';
    } else progressText = `${Math.min(b.progress, b.count)} / ${b.count}`;
    b.progressText = progressText;
    return b;
  }

  function offerBounties() {
    const r = run();
    if (!r) return [];
    r.bounties = r.bounties || [];
    expireBounties();
    const B = BAL('bounty');
    let slots = Math.min(B.offer ?? 2, (B.maxActive ?? 3) - r.bounties.length);
    if (slots <= 0) return [];
    const zi = zoneIndex();
    const day = r.day || 1;
    const active = new Set(r.bounties.map((b) => b.templateId));
    const bossNight = S.isBossNight();
    const offered = [];
    const add = (t) => {
      const b = makeBounty(t, r);
      if (!b) return false;
      r.bounties.push(b);
      active.add(t.id);
      offered.push(b);
      ctx.bus.emit('bounty:new', { bounty: b });
      slots--;
      return true;
    };
    const templates = (D().BOUNTIES || []).filter((t) => (t.zoneMin ?? 0) <= zi && (t.dayMin ?? 1) <= day && !active.has(t.id)
      && (!t.bossNightOnly || bossNight));
    // the legend hunt is offered (as a priority slot) once its bait is within reach
    const legendT = templates.find((t) => t.type === 'legend');
    if (legendT && slots > 0 && legendEligible(r)) add(legendT);
    let pool = templates.filter((t) => t.type !== 'legend' && (t.weight || 0) > 0);
    while (slots > 0 && pool.length) {
      let total = 0;
      for (const t of pool) total += t.weight;
      let x = rand() * total;
      let chosen = pool[pool.length - 1];
      for (const t of pool) { x -= t.weight; if (x <= 0) { chosen = t; break; } }
      pool = pool.filter((t) => t !== chosen);
      add(chosen);
    }
    if (offered.length) {
      S.toast(offered.length === 1 ? `Murk's Ledger: ${offered[0].text}` : `Murk's Ledger has ${offered.length} new bounties.`, 'info');
    }
    return offered;
  }

  function expireBounties() {
    const r = run();
    if (!r?.bounties?.length) return;
    const day = r.day || 1;
    r.bounties = r.bounties.filter((b) => !(day > (b.expiresDay ?? Infinity)));
  }

  /** Cancel bounties tied to a lake's species when the Wick descends (failing costs nothing). */
  function dropZoneBounties(prevZone) {
    const r = run();
    if (!r?.bounties?.length) return;
    r.bounties = r.bounties.filter((b) => !(SPECIES_TYPES.has(b.type) && b.zone === prevZone));
  }

  function completeBounty(b) {
    const r = run();
    if (!r) return;
    r.bounties = (r.bounties || []).filter((x) => x !== b);
    b.progress = b.count;
    b.done = true;
    decorate(b);
    const f = flags();
    f.bountiesDone = (f.bountiesDone | 0) + 1;
    if (b.memories) f.bountyMemories = (f.bountyMemories | 0) + b.memories;
    (f.bountyLog = f.bountyLog || []).push({ text: b.text, shells: b.reward.shells, day: r.day });
    if (f.bountyLog.length > 12) f.bountyLog.shift();
    S.addShells(b.reward.shells, 'bounty');
    ctx.bus.emit('bounty:complete', { bounty: b });
    S.toast(`Bounty honoured: ${b.text} +${b.reward.shells} Shells`, 'good');
  }

  function step(b, n = 1) {
    b.progress = Math.min(b.count, b.progress + n);
    decorate(b);
    if (b.progress >= b.count) completeBounty(b);
  }
  function setProgress(b, v) {
    b.progress = Math.max(b.progress, Math.min(b.count, v));
    decorate(b);
    if (b.progress >= b.count) completeBounty(b);
  }

  /** Route a gameplay event to every active bounty. */
  function bountyEvent(kind, e = {}) {
    const r = run();
    if (!r?.bounties?.length) return;
    for (const b of r.bounties.slice()) {
      switch (b.type) {
        case 'catchSpecies': if (kind === 'fish' && e.fish?.speciesId === b.target) step(b); break;
        case 'catchRarity': if (kind === 'fish' && (RARITY_RANK[e.species?.rarity] ?? 0) >= (RARITY_RANK[b.target] ?? 1)) step(b); break;
        case 'heavy': if (kind === 'fish' && e.fish?.speciesId === b.target && (e.fish.weight || 0) >= (b.kg || 0)) step(b); break;
        case 'depthCatch': if (kind === 'fish' && e.depth != null && e.depth >= (b.target ?? 0.75)) step(b); break;
        case 'quality': if (kind === 'fish' && (QUALITY_RANK[e.fish?.quality] ?? 0) >= (QUALITY_RANK[b.target] ?? 1)) step(b); break;
        case 'nightFish': if (kind === 'fish' && e.species?.time === 'gloom') step(b); break;
        case 'spotCatch': if (kind === 'fish' && e.inSpot) step(b); break;
        case 'signCatch': if (kind === 'fish' && (e.inSign ?? e.inSpot)) step(b); break;   // v3: "cast inside a sign on the water"
        case 'legend': if (kind === 'fish' && e.fish?.speciesId === b.target) step(b); break;
        case 'perfectHooks': if (kind === 'hook' && e.perfect) step(b); break;
        case 'streak': if (kind === 'hook') setProgress(b, e.streak || 0); break;
        case 'slayElite': if (kind === 'elite') step(b); break;
        case 'boss': if (kind === 'boss') step(b); break;
        case 'slayNight': if (kind === 'slain' || kind === 'dawn') setProgress(b, e.nightSlain || 0); break;
        case 'unscathed': if (kind === 'dawn' && !e.damaged) step(b); break;
        case 'noFlare': if (kind === 'dawn' && !e.flared) step(b); break;
        case 'sellVisit': if (kind === 'sell') setProgress(b, e.sold || 0); break;
        default: break;
      }
    }
  }

  function getBounties() {
    const r = run();
    return (r?.bounties || []).map((b) => decorate(b));
  }

  return {
    update, arrive, leave, reset, followDescent, isPresent, canShop, canTrade,
    shop: { getItems, buy },
    noteSale, offerBounties, expireBounties, dropZoneBounties, bountyEvent, getBounties, completeBounty,
    priceOfBait, buyLure,
  };
}
