// tools/sim/sporewood.mjs — LAKE 2, lane D2 (docs/loop/LAKE2.md §8, §9; the user's answers of 17 Nov 2026): Sporewood Pools' arc for
// `node tools/sim/clams.mjs --shipped=sporewood`. The Mossmere's shipped arc to its empty shelf (clams.mjs's own pacing run), the
// Sporewood map, the tow (the game's own carry and reset: src/loop-carry.js on the Mossmere's end), then Sporewood under the loop as lane
// D1's data ships it (clams.mjs shipSporewood: its fish, places, hook table, caps and items as the game's), its first evenings under
// LOOP.arrival, and the walk along its shelf to the empty shelf. Prints the figures and checks LAKE2 §8.1's targets and the user's answer 2.
// No data import here (clams.mjs sets the loop's flags before it imports data.js; it hands its module in): `api` carries what it needs.
import { applyTow, carryAdd, raftLevels, arrivalOf, freshCarry } from '../../src/loop-carry.js';

/** The arc. api: {D, run, POL, pacing, shipSporewood, WATER, SP, listStudy, listFor, legendP, clamsFor, baitTin, LOOP, QUICK, argOf}. → exit code. */
export function sporewoodReport(api) {
  const { D, run, POL, pacing, shipSporewood, WATER, SP, listStudy, legendP, clamsFor, LOOP, QUICK, argOf } = api;
  const fails = [], warns = [];
  const check = (ok, label) => { console.log(`${ok ? 'ok  ' : 'FAIL'}  ${label}`); if (!ok) fails.push(label); };
  const warn = (ok, label) => { console.log(`${ok ? 'ok  ' : 'warn'}  ${label}`); if (!ok) warns.push(label); };
  const title = (s) => console.log(`\n==================== ${s}\n`);
  const table = (head, rows) => {
    const w = head.map((h, i) => Math.max(String(h).length, ...rows.map((r) => String(r[i]).length)));
    const line = (r) => r.map((c, i) => (i === 0 ? String(c).padEnd(w[i]) : String(c).padStart(w[i]))).join('  ');
    console.log(line(head)); console.log(w.map((n) => '-'.repeat(n)).join('  ')); for (const r of rows) console.log(line(r)); console.log('');
  };
  const f0 = (v) => Math.round(v).toLocaleString('en-US'), f1 = (v) => v.toFixed(1), f2 = (v) => v.toFixed(2), pc = (v) => `${Math.round(v * 100)}%`;
  const num = (k, d) => { const v = argOf(k); return v != null && Number.isFinite(+v) ? +v : d; };
  const P = LOOP.player, FAC = Number(D.LOOP.cost.factor) || 1, cost = (b, o) => D.loopCost(b, o);
  const N = num('n', QUICK ? 1200 : 3000);

  // ---- the knobs (each the shipped data's value unless a flag tunes it for a comparison row; the shipped figures use none)
  const share = argOf('share'), ease = argOf('ease'), fightAdd = num('fight', 0);
  if (share != null) D.LOOP.carry.share = +share;
  if (ease != null) D.LOOP.arrival.fight = ease.split(',').map(Number);
  if (argOf('evenings') != null) D.LOOP.arrival.evenings = num('evenings', 3);
  if (argOf('cap') === 'off') D.LOOP.arrival.cap = null;
  if (fightAdd) D.CATCH_V3.lake.sporewood += fightAdd;
  if (argOf('lt') != null) D.LOOP.gearCap.lineAt.sporewood.trophy = num('lt', 4);
  if (argOf('le') != null) D.LOOP.gearCap.lineAt.sporewood.elder = num('le', 7);
  const G = D.LOOP.gear.sporewood, priceKnob = { h5: [G.hold.ladder, 1], h6: [G.hold.ladder, 2], h7: [G.hold.ladder, 3] };
  for (const [k, [lad, i]] of Object.entries(priceKnob)) if (argOf(k) != null) lad[i].price = num(k, lad[i].price);
  for (const [k, part, lv] of [['o1', 'oars', 0], ['o2', 'oars', 1], ['k1', 'keel', 0], ['k2', 'keel', 1], ['l1', 'lantern', 0], ['l2', 'lantern', 1]]) if (argOf(k) != null) G.raft[part].prices[lv] = num(k, 0);
  for (const [k, slot] of [['t1', 'rod'], ['t1', 'line'], ['t1', 'reel']]) if (argOf(k) != null) G[slot][1].price = num(k, G[slot][1].price);

  // ---- 1. the Mossmere's arc (M1's shipped run, its own pacing player): its end, banked, its last trips' pace
  const R0 = pacing({ shipped: 'mossmere', step: 5, track: true });
  const end = R0.log[R0.log.length - 1], mossTrip = end.perTrip, mossMin = end.min, mossRate = mossTrip / mossMin;
  const mapPrice = cost(D.LOOP.waters.sporewood.lake), toMap = Math.max(0, mapPrice - R0.banked) / mossRate;
  title('S1. The Mossmere\'s end, the Sporewood map and the tow (LAKE2 §5, §6.1, §8.1)');
  console.log(`The Mossmere's empty shelf at ${f2(R0.doneH)} h (${R0.trips} trips), ${f0(R0.banked)} clams banked; its last trips ${f0(mossTrip)} clams in ${f1(mossMin)} min (${f1(mossRate)} a minute).`);
  console.log(`The Sporewood map at ${f0(mapPrice)} (base ${f0(D.LOOP.waters.sporewood.lake)}): ${f0(toMap)} min of that income after the empty shelf; the tow at ${f2(R0.doneH + toMap / 60)} h.`);
  // the Mossmere's end as a save would hold it (the pacing run's own state) and the tow on it, by the game's code
  const st0 = R0.state, homeOrders = st0.orders | 0, bed = st0.baitBed | 0;
  const ml = { tackle: { rod: st0.rod, line: st0.line, reel: st0.reel }, holdSlots: st0.hold, raft: { oars: st0.oars, keel: st0.keel, lantern: st0.lantern },
    carry: freshCarry(), gearWater: 'mossmere', fit: { rod: null, line: null, reel: null }, lures: [], bait: {}, fitted: { lure: null, bait: null },
    barge: { water: 'mossmere', towed: ['mossmere'] }, eveningsAt: {} };
  const add = carryAdd(D, ml);
  applyTow(D, ml, 'sporewood');
  ml.barge.towed.push('sporewood');
  const C = ml.carry, R = raftLevels(ml);
  console.log(`The tow (src/loop-carry.js on the end: T${st0.rod}/${st0.line}/${st0.reel}, Hold ${st0.hold}, Oars ${st0.oars} · Keel ${st0.keel} · Lantern ${st0.lantern}): a share of ${f2(D.LOOP.carry.share)} carried, `
    + `+${add.rod} / +${add.line} / +${add.reel} Hold, +${add.cast} m cast, Hold ${ml.holdSlots}, the raft ${f2(R.oars)} · ${f2(R.keel)} · ${f2(R.lantern)} of a level. `
    + `The home's own items travel: Order Board ${homeOrders}, Bait Bed ${bed}. Banked at the tow: ${f0(Math.max(0, R0.banked + toMap * mossRate - mapPrice))}.`);

  // ---- 2. Sporewood as the game ships it
  const W = shipSporewood();
  if (argOf('tier') != null) { W.base = num('tier', W.base); D.LOOP.waters.sporewood.tier = W.base; }
  title('S2. Sporewood Pools under the loop (lane D1\'s data, the game\'s pools; LAKE2 §2, §3.2, §7.1)');
  console.log(`Its fish: ${W.species.map((s) => s.name + (s.legend ? ' (legend)' : s.giant ? ' (giant)' : '')).join(', ')}.`);
  console.log(`Its places: ${W.places.map((p) => `${p.name} ${p.inLake ? '(the lake map)' : f0(cost(p.price))}`).join(' · ')}. Its list: ${api.listFor('sporewood').length} fish on ${W.plainBait}.`);
  {   // the sim's records are the game's (as the Mossmere's check): rarity, style, family, L50, hours, bait, giant, place, the sale at six sizes
    const bad = [];
    for (const s of W.species.filter((x) => !x.legend)) {
      const g = D.SPECIES_BY_ID[s.id];
      if (!g) { bad.push(`${s.id} not in SPECIES`); continue; }
      const diffs = [['rarity', s.rarity, g.rarity], ['style', s.style, g.style], ['family', s.family, g.family], ['bait', s.bait ?? null, g.bait ?? null], ['giant', !!s.giant, !!g.giant],
        ['place', s.placeId || s.ownPlace || null, g.place || null], ['L50', s.L50, D.sizeL50(g, 'sporewood')], ['hours', JSON.stringify(s.hours), JSON.stringify(D.loopHours(g).map((h) => h))]].filter(([, a, b]) => a !== b);
      for (const zz of [-1.2, 0, 0.4, 1.4, 2.2, 2.95]) if (clamsFor(s, zz) !== D.fishClams(g, zz, { zone: 'sporewood' })) diffs.push([`clams z ${zz}`, clamsFor(s, zz), D.fishClams(g, zz, { zone: 'sporewood' })]);
      if (diffs.length) bad.push(`${s.id}: ${diffs.map(([k, a, b]) => `${k} ${a} vs ${b}`).join(', ')}`);
    }
    check(!bad.length, `the sim's Sporewood fish are the game's records (${W.species.length}: rarity, style, family, L50, hours, bait, giant, place, the sale at six sizes)${bad.length ? `: ${bad.slice(0, 4).join('; ')}` : ''}`);
  }

  // ---- 3. the first evenings and the walk along the shelf
  const tinK = FAC, places0 = W.places.filter((p) => p.inLake && !p.legend).map((p) => p.id);
  const st = { clams: Math.max(0, R0.banked + toMap * mossRate - mapPrice), sec: 0, trips: 0, rod: 0, line: 0, reel: 0, hold: ml.holdSlots, raft: { oars: 0, keel: 0, lantern: 0 },
    places: places0.slice(), lures: new Set(ml.lures.filter((id) => D.LOOP.lures[id]?.water === 'sporewood')) };
  const kitOf = (lure, bait, ev) => {
    const a = arrivalOf(D, { barge: ml.barge, eveningsAt: { sporewood: ev } }, 'sporewood');
    const rl = raftLevels({ raft: st.raft, carry: C });
    return { water: 'sporewood', gear: 'sporewood', carry: { rod: C.rod, line: C.line, reel: C.reel }, rod: st.rod, line: st.line, reel: st.reel, hold: st.hold,
      lure, bait, places: st.places.slice(), oars: rl.oars, keel: rl.keel, lantern: rl.lantern, ...(a ? { ease: a.fight, soft: a.cap } : {}) };
  };
  const cache = new Map(); let seedN = 0;
  const evalKit = (k) => {
    const key = JSON.stringify(k);
    if (!cache.has(key)) {
      const x = run(k, POL.natural(), N, 31000 + (seedN++), { tinK });
      const tin = api.baitTin(k.bait || 'spore_cake', 'sporewood') * tinK / LOOP.tinSize;   // (a bait's price: its tin's, at Murk's factor)
      const bedFree = k.bait && k.bait !== 'cut_strip' && LOOP.bait[k.bait] ? Math.min(x.baitUsed, [0, 3, 6, 10][bed] || 0) * tin : 0;
      cache.set(key, { x, c: (x.clams + bedFree) * P.clams * (1 + P.orderGain * homeOrders), mn: x.min * P.time, lostShare: x.hooks ? x.lost / x.hooks : 0, capShare: x.hooks ? x.capLost / x.hooks : 0, giants: x.giantLanded });
    }
    return cache.get(key);
  };
  const hooks = () => [[null, null], [null, 'spore_cake'], [null, 'amber_larvae'], [null, 'cut_strip'], ...[...st.lures].map((l) => [l, null])];
  const best = (ev) => hooks().map(([l, b]) => [l, b, evalKit(kitOf(l, b, ev))]).sort((a, b) => b[2].c / b[2].mn - a[2].c / a[2].mn)[0];
  const hookName = (e) => D.TEXT_LOOP.gearItems[e[0] || e[1]] || (e[1] === 'cut_strip' ? 'Cut Strip' : 'the bare hook');
  title('S3. Sporewood\'s first evenings (the arrival kit: the start pieces on the carry, the Seedpod Twirl, a tin of Spore Cake; LOOP.arrival)');
  const evRows = [];
  for (let ev = 0; ev <= D.LOOP.arrival.evenings; ev++) {
    const e = best(ev), a = arrivalOf(D, { barge: ml.barge, eveningsAt: { sporewood: ev } }, 'sporewood');
    evRows.push({ ev, a, e });
  }
  table(['evening', 'the rule', 'best hook', 'clams a trip', 'of the Mossmere\'s', 'min', 'a minute', 'of its', 'lost of hooked', 'over the cap'],
    evRows.map(({ ev, a, e }) => [ev < D.LOOP.arrival.evenings ? ev + 1 : `${ev + 1}+`, a ? `cap lands, Fight ${a.fight}` : 'whole', hookName(e), f0(e[2].c), pc(e[2].c / mossTrip), f1(e[2].mn), f1(e[2].c / e[2].mn), pc(e[2].c / e[2].mn / mossRate), pc(e[2].lostShare), pc(e[2].capShare)]));
  const e1 = evRows[0].e[2];
  check(e1.lostShare <= 0.2 + 0.005, `the user's answer 2: on the first evening at Sporewood ${pc(e1.lostShare)} of hooked fish get away (target: at most about one in five)`);
  check(e1.c >= 0.6 * mossTrip, `the user's answer 2: the first evening earns ${f0(e1.c)} clams a trip, ${pc(e1.c / mossTrip)} of the Mossmere's last ${f0(mossTrip)} (target: at least about 60%; a minute ${pc(e1.c / e1.mn / mossRate)})`);
  if (argOf('walk') === '0') { console.log(fails.length ? `\n${fails.length} check(s) FAILED` : '\nall checks passed'); return fails.length ? 1 : 0; }

  // the walk: LAKE2 §8.3's order, each buy as soon as the clams are there; every trip fishes the best hook it owns
  const DEF = 'line:1,hold:5,rod:1,reel:1,oars:1,lure:ember_minnow,hold:6,keel:1,lure:root_jig,lantern:1,place:veilwater,lure:spore_moth,lure:sporelamp_fly,oars:2,line:2,reel:2,keel:2,rod:2,lantern:2,place:mothers_cup,legend,hold:7';
  const ORDER = (argOf('order') || DEF).split(',');
  const priceOf = (id) => {
    const [k, a] = id.split(':');
    if (k === 'rod' || k === 'line' || k === 'reel') return cost(G[k][+a].price);
    if (k === 'hold') return cost(G.hold.ladder.find((s) => s.slots === +a).price);
    if (k === 'oars' || k === 'keel' || k === 'lantern') return cost(G.raft[k].prices[+a - 1]);
    if (k === 'lure') return cost(D.LOOP.lures[a].price);
    if (k === 'place') return cost(D.LOOP.places[a].price);
    throw new Error(id);
  };
  const log = []; let firstBuy = null, longest = { min: 0, id: null }, giantAt = null, giants = 0, backAt = null, maxTrip = 0;
  const trip = () => {
    const ev = st.trips, [, , e] = best(ev);
    st.clams += e.c; st.sec += e.mn * 60; st.trips++; giants += e.giants; maxTrip = Math.max(maxTrip, e.mn);
    if (giantAt === null && giants >= 1) giantAt = st.sec / 3600;
    if (backAt === null && ev >= D.LOOP.arrival.evenings && e.c >= mossTrip) backAt = { trip: st.trips, h: st.sec / 3600 };
  };
  for (const id of ORDER) {
    const t0 = st.sec;
    if (id === 'legend') {
      let alive = 1, tries = 0; const kit = { gear: 'sporewood', carry: C, rod: st.rod, line: st.line, reel: st.reel };
      for (let k = 0; k < 12 && alive > 0.02; k++) { tries += alive; alive *= 1 - legendP('drifting_grove', kit, k); }
      const need = Math.round(tries * D.LOOP.legendBait.sporewood.price);
      while (st.clams < need) trip();
      st.clams -= need; st.clams += cost(D.LOOP.waters.sporewood.prices.crown);
      log.push({ id: 'the Grove\'s hunt', h: st.sec / 3600, trips: st.trips, price: need, note: `${f1(tries)} tries of the Glowcap Bulb; her first landing pays ${f0(cost(D.LOOP.waters.sporewood.prices.crown))}` });
      continue;
    }
    const need = priceOf(id);
    while (st.clams < need) trip();
    st.clams -= need;
    if ((st.sec - t0) / 60 > longest.min) longest = { min: (st.sec - t0) / 60, id };
    if (!firstBuy) firstBuy = { trip: st.trips, h: st.sec / 3600 };
    const [k, a] = id.split(':');
    if (k === 'rod' || k === 'line' || k === 'reel') st[k] = +a; else if (k === 'hold') st.hold = Math.max(st.hold, +a);
    else if (k === 'oars' || k === 'keel' || k === 'lantern') st.raft[k] = +a; else if (k === 'lure') st.lures.add(a); else if (k === 'place') st.places.push(a);
    const b = best(st.trips);
    log.push({ id, h: st.sec / 3600, trips: st.trips, price: need, per: b[2].c, mn: b[2].mn, hook: hookName(b) });
  }
  const emptyH = st.sec / 3600;
  title('S4. The walk along Sporewood\'s shelf (LAKE2 §7.1, §8.3\'s order; prices as Murk asks)');
  table(['buy', 'price', 'hour there', 'trip', 'then a trip', 'min', 'of the Mossmere\'s', 'best hook'],
    log.map((l) => [l.id, f0(l.price), f2(l.h), l.trips, l.per != null ? f0(l.per) : l.note, l.mn != null ? f1(l.mn) : '', l.per != null ? pc(l.per / mossTrip) : '', l.hook || '']));
  console.log(`The empty shelf at ${f2(emptyH)} h at Sporewood (${st.trips} trips); the whole arc ${f2(R0.doneH + toMap / 60 + emptyH)} h. The first buy after trip ${firstBuy.trip} (${f2(firstBuy.h)} h); the longest wait ${f0(longest.min)} min (${longest.id}).`);
  console.log(`Back to the Mossmere's clams a trip: ${backAt ? `trip ${backAt.trip} (${f2(backAt.h)} h)` : 'not by the empty shelf'}. The first giant home (the run's expectation): ${giantAt != null ? `hour ${f2(giantAt)}` : 'not by the empty shelf'}.`);
  // the list (the next water's catch key, LAKE2 §8.1): the slow player in twenty on the kit the water opens with (the arrival kit, after the
  // first evenings), on the Journal route with the pull, turning through the hooks that bring a missing fish (Cut Strip for the hunter)
  const L = listStudy(W, kitOf(null, W.plainBait, 99), QUICK ? 400 : 1000);
  console.log(`Sporewood's list (${L.toLand} fish on ${W.plainBait}, the arrival kit): p50 ${f0(L.p50)} min, p95 ${f0(L.p95)}, p99 ${f0(L.p99)}.`);

  title('S5. LAKE2 §8.1\'s targets');
  check(toMap <= 40, `the Sporewood map ${f0(toMap)} min of the Mossmere's last income after its empty shelf (target ≤ 40)`);
  check(firstBuy.trip >= 2 && firstBuy.trip <= 4, `the first purchase after trip ${firstBuy.trip} (target: after trip 2–4)`);
  check(longest.min <= 40, `the longest wait for one purchase ${f0(longest.min)} min (target ≤ 40)`);
  check(emptyH >= 3 && emptyH <= 5, `the empty shelf at ${f2(emptyH)} h at Sporewood (target 3–5 h)`);
  // (the list is Glasswater's catch key, which does not ship yet: a warning, for the Glasswater lane, until then)
  warn(L.p95 <= 60 && L.p99 <= 75, `the list: p95 ${f0(L.p95)} min, p99 ${f0(L.p99)} (target p95 ≤ 60, p99 ≤ 75; Glasswater's catch key: the Lostsea Mackerel, a rare hunter that takes no Spore Cake, and the night's Mildew Angler are the slow two)`);
  check(maxTrip <= 6, `trips stay short: at most ${f1(maxTrip)} min with the visit home (target ≤ 6)`);
  warn(giantAt != null && giantAt >= 0.5 && giantAt <= 2, `the first giant at Sporewood at hour ${giantAt != null ? f2(giantAt) : '—'} (target 0.5–2)`);
  warn(e1.c / e1.mn >= mossRate * 0.5 && evRows[1].e[2].c >= 0.5 * mossTrip, `the first evenings stay in the target band (50–70%+ of the Mossmere's clams a trip: ${evRows.map(({ e }) => pc(e[2].c / mossTrip)).join(' · ')})`);
  warn(backAt != null && backAt.trip <= 6, `back to the Mossmere's clams a trip within the first 6 trips (${backAt ? `trip ${backAt.trip}` : 'not reached'}; with the hold and the raft left behind too, the user's answer 1, this comes later by design)`);
  console.log(fails.length ? `\n${fails.length} check(s) FAILED${warns.length ? `, ${warns.length} warning(s)` : ''}` : `\nall checks passed${warns.length ? ` (${warns.length} warning(s))` : ''}`);
  void SP;
  return fails.length ? 1 : 0;
}
