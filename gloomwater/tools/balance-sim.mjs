#!/usr/bin/env node
// tools/balance-sim.mjs — seeded Monte-Carlo pacing simulation for GLOOMWATER (hybrid design).
//
//   node tools/balance-sim.mjs                 full report (≈ 4 min)
//   node tools/balance-sim.mjs --quick         smaller samples (≈ 2 min)
//   node tools/balance-sim.mjs --runs=800 --campaigns=60 --len=14 --seed=7
//   node tools/balance-sim.mjs --trace=skilled  one annotated run, day by day
//   node tools/balance-sim.mjs --reel          species fight table (P(land), time) at on-curve gear
//   node tools/balance-sim.mjs --json          machine-readable summary on stdout
//
// Model (all numbers from src/data.js, all rules from DESIGN.md):
//  • Fishing: per-frame reel model (tools/sim/reel.mjs) driven by a bot angler with human limits;
//    cast/wait/nibble/hook timings, depth-band species picks, rarity weights, spots, bait, quality,
//    weight; catch decisions (eat < 40% satiety, render < 40% oil, else keep → sell to Murk).
//  • Economy: Murk trip each calm, greedy gear purchases by value/Shell, supplies, legend bait,
//    tolls, bounties (expected value), elite/Warden Shells.
//  • Night: 0.25 s time-stepped damage race. Enemy cohorts spawn from difficultyFor() and walk in
//    from the 22–34 m ring; aura (auraDps × oil fraction) burns everything inside the light;
//    weapon boons, zaps and flares add damage; leaks become contact hits (i-frames, armor,
//    Gutter-burst); hands, Wardens, formations, moths, eels, inkwells, ticks, choir; cinders → XP
//    → levels → boon picks; oil/satiety drains, Last Flicker, darkness, starvation, Burn-a-fish.
//  • Meta: memoriesFor() + challenge rewards → greedy relic purchases; challenge unlocks feed the
//    boon pool. Relic profiles are snapshots of simulated campaigns after 0 / 3 / 8 / 12 runs.
//  • Players: tools/sim/model.mjs SKILLS (average, skilled) + a "learner" who starts average and
//    closes 6% of the gap to skilled per run (cap 60%). All skill assumptions are listed there.
import * as D from '../src/data.js';
import { SKILLS, blendSkill, newMeta, simulateRun, bankRun, spendMemories, mulberry32 } from './sim/model.mjs';
import { fightStats } from './sim/reel.mjs';

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const QUICK = !!args.quick;
const RUNS = +(args.runs ?? (QUICK ? 200 : 500));
const CAMPAIGNS = +(args.campaigns ?? (QUICK ? 24 : 48));
const LEN = +(args.len ?? 13);
const SEED = +(args.seed ?? 20261104);
const SNAPS = [0, 3, 8, 12].filter((s) => s < LEN);
const clone = (o) => structuredClone(o);

const pct = (arr, p) => { if (!arr.length) return NaN; const s = arr.slice().sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.max(0, Math.round(p * (s.length - 1))))]; };
const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : NaN);
const f1 = (v) => (Number.isFinite(v) ? v.toFixed(1) : '—');
const f0 = (v) => (Number.isFinite(v) ? Math.round(v).toString() : '—');
const pc = (v) => (Number.isFinite(v) ? `${Math.round(v * 100)}%` : '—');
function table(head, rows) {
  const w = head.map((h, i) => Math.max(h.length, ...rows.map((r) => String(r[i]).length)));
  const line = (r) => '| ' + r.map((c, i) => String(c).padEnd(w[i])).join(' | ') + ' |';
  return [line(head), '|' + w.map((x) => '-'.repeat(x + 2)).join('|') + '|', ...rows.map(line)].join('\n');
}

// ===================================================================================== --reel
if (args.reel) {
  const curve = [{ LS: 1, RS: 1, SZ: 0.16 }, { LS: 1.15, RS: 1.15, SZ: 0.17 }, { LS: 1.3, RS: 1.3, SZ: 0.18 }, { LS: 1.45, RS: 1.45, SZ: 0.2 }];
  const rows = [];
  for (const sp of D.SPECIES) {
    const z = D.ZONE_BY_ID[sp.zone].index;
    const g = { ...curve[z], slackTime: 1.6 };
    if (sp.final) g.LS = 1.9;
    const a = fightStats(sp, g, SKILLS.average.reel), s = fightStats(sp, g, SKILLS.skilled.reel);
    rows.push([sp.id, sp.rarity, sp.behavior, `${g.LS}/${g.RS}`, pc(a.pLand), f1(a.time), pc(s.pLand), f1(s.time)]);
  }
  console.log(table(['species', 'rarity', 'behaviour', 'LS/RS', 'avg land', 'avg s', 'skilled land', 'skilled s'], rows));
  process.exit(0);
}

// ===================================================================================== --trace
if (args.trace) {
  const sk = SKILLS[args.trace === true ? 'average' : args.trace] || SKILLS.average;
  const meta = newMeta();
  const run = simulateRun(meta, sk, {}, mulberry32(SEED));
  console.log(`trace: ${sk.id}, fresh profile — ${run.dead ? `died day ${run.day} (${run.cause})` : run.won ? `WON day ${run.day}` : 'timeout'}; zone ${run.zone}; level ${run.level}`);
  for (const n of run.nightLog) console.log(`  night ${n.day} z${n.zone} H${n.heat}: kills ${n.kills}, Embers lost ${n.emberLost}, oil net ${f0(n.oilNet)}, level → ${n.level}${n.boss ? `, Warden ${n.bossKilled ? `killed in ${f0(n.bossKillTime)} s` : 'survived'}` : ''}`);
  console.log('  boons:', JSON.stringify(run.boons), '\n  upgrades:', JSON.stringify(run.upgrades), '\n  fish', run.stats.fishCaught, 'lost', run.stats.fishLost, 'shells earned', run.stats.shellsEarned, 'legendaries', Object.keys(run.legendaries).join(',') || '—');
  process.exit(0);
}

// ===================================================================================== campaigns
const t0 = Date.now();
// "learner": starts with the average player's skill and closes 6% of the gap to "skilled" per run (max 60%).
const learnerSkill = (r) => blendSkill(Math.min(0.6, 0.06 * r));
function campaign(sk, rng, strat = {}) {
  const meta = newMeta();
  const snaps = {};
  const runs = [];
  for (let r = 0; r < LEN; r++) {
    if (SNAPS.includes(r)) snaps[r] = clone(meta);
    const run = simulateRun(meta, sk === 'learner' ? learnerSkill(r) : sk, strat, rng);
    const bank = bankRun(meta, run);
    spendMemories(meta);
    runs.push({ day: run.day, zone: run.zone, won: run.won, dead: run.dead, cause: run.cause, memories: bank.memories, relicLevels: Object.values(meta.relics).reduce((a, b) => a + b, 0), level: run.stats.maxLevel, completed: bank.completed.length });
  }
  return { snaps, runs, meta };
}
const campaigns = {};
for (const key of ['average', 'skilled', 'learner']) {
  const rng = mulberry32(SEED ^ ({ average: 0x1b873593, skilled: 0x5bd1e995, learner: 0x27d4eb2f })[key]);
  campaigns[key] = [];
  for (let c = 0; c < CAMPAIGNS; c++) campaigns[key].push(campaign(key === 'learner' ? 'learner' : SKILLS[key], rng));
}

// ===================================================================================== profile evaluation
function evaluate(sk, metas, n, rng, strat = {}, opt = {}) {
  const res = { deaths: [], nights: [], zones: [0, 0, 0, 0], wins: 0, mem: [], memRun: [], causes: {}, levels: [], shells: [0, 0, 0, 0], days: [0, 0, 0, 0],
    hitsByNight: [], oilByNight: [], cadence: [], warden: { nights: 0, kills: 0, times: [] }, legend: [0, 0, 0, 0], n, reachDay: [[], [], [], []], wonDay: [], winLevel: [], minutes: [], relicBought: [], hitSrc: {} };
  for (let i = 0; i < n; i++) {
    const meta = clone(metas[i % metas.length]);
    const run = simulateRun(meta, sk, strat, rng, opt);
    const bank = bankRun(meta, run);
    res.mem.push(bank.memories); res.memRun.push(bank.fromRun);
    let secs = 0; for (let d = 1; d <= run.day; d++) secs += D.BALANCE.phases.calm + D.BALANCE.phases.dusk + D.gloomtideLength(d) + D.BALANCE.phases.dawn;
    res.minutes.push(secs / 60);
    const before = Object.values(meta.relics).reduce((a, b) => a + b, 0); spendMemories(meta); res.relicBought.push(Object.values(meta.relics).reduce((a, b) => a + b, 0) - before);
    for (let z = 0; z <= run.zone; z++) res.zones[z]++;
    if (run.won) { res.wins++; res.wonDay.push(run.day); res.winLevel.push(run.level); }
    else { res.deaths.push(run.day); res.causes[run.cause] = (res.causes[run.cause] || 0) + 1; }
    res.nights.push(run.stats.nightsSurvived);
    res.levels.push(run.stats.maxLevel);
    for (let z = 0; z < 4; z++) { res.shells[z] += run.shellsByZone[z]; res.days[z] += run.daysByZone[z]; }
    for (const id of Object.keys(run.legendaries)) res.legend[D.ZONE_BY_ID[D.SPECIES_BY_ID[id].zone].index]++;
    run.nightLog.forEach((nl, j) => {
      (res.hitsByNight[j] ||= []).push(nl.emberLost);
      for (const [k, v] of Object.entries(nl.hitSrc || {})) { const g = k.startsWith('contact:') ? 'swarm contact' : k === 'glob' ? 'inkwell glob' : k === 'slam' ? 'hand slam' : k; res.hitSrc[g] = (res.hitSrc[g] || 0) + v; }
      if (!nl.dead) (res.oilByNight[j] ||= []).push(nl.oilNet);
      const prevLvl = j ? run.nightLog[j - 1].level : null;
      if (j < 3 && prevLvl != null && nl.level > prevLvl && !nl.dead) res.cadence.push(D.gloomtideLength(nl.day) / (nl.level - prevLvl));
      if (nl.boss) { res.warden.nights++; if (nl.bossKilled) { res.warden.kills++; res.warden.times.push(nl.bossKillTime); } }
    });
  }
  return res;
}
const profiles = [];
for (const key of ['average', 'skilled']) {
  for (const s of SNAPS) {
    const rng = mulberry32(SEED + s * 101 + (key === 'skilled' ? 7 : 3));
    const metas = campaigns[key].map((c) => c.snaps[s]);
    const relicLv = mean(metas.map((m) => Object.values(m.relics).reduce((a, b) => a + b, 0)));
    profiles.push({ key, snap: s, relicLv, res: evaluate(SKILLS[key], metas, RUNS, rng) });
  }
}

// ===================================================================================== degenerate-strategy probes
const probes = [];
{
  const fresh = [newMeta()];
  const mid = campaigns.skilled.map((c) => c.snaps[Math.min(8, Math.max(...SNAPS))]);
  const n = QUICK ? 80 : Math.max(150, Math.round(RUNS / 2));
  const base = (metas, key, label, strat) => { const r = evaluate(SKILLS[key], metas, n, mulberry32(SEED + label.length * 977), strat, { maxDay: 30 }); probes.push({ label, key, metas: metas === fresh ? 'fresh' : '8 runs', r }); };
  base(fresh, 'skilled', 'baseline', {});
  base(fresh, 'skilled', 'render every fish', { renderAll: true });
  base(fresh, 'skilled', 'all Shells → Searing Mantle', { shopOnly: 'lantern_mantle' });
  base(fresh, 'skilled', 'zap spam ×3', { zapMult: 3 });
  base(fresh, 'skilled', 'never descend (camp)', { descend: 'never' });
  base(mid, 'skilled', 'baseline', {});
  base(mid, 'skilled', 'never descend (camp)', { descend: 'never' });
  base(mid, 'skilled', 'all Shells → Searing Mantle', { shopOnly: 'lantern_mantle' });
}

// ===================================================================================== report
const out = [];
const P = (s = '') => out.push(s);
const label = (p) => `${p.key} · ${p.snap === 0 ? 'fresh' : `after ${p.snap} runs`}`;
P(`GLOOMWATER balance simulation — seed ${SEED}, ${RUNS} runs/profile, ${CAMPAIGNS} campaigns × ${LEN} runs per skill (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
P();
P('## Outcomes by profile (relic profile = simulated campaign snapshot)');
P(table(['profile', 'relic lv', 'death day med (p10–p90)', 'nights med', 'reach Spore / Glass / Pallid', 'win %', 'Memories/run (mean)', 'level med', 'deaths: gloom / dark / starve'],
  profiles.map((p) => { const r = p.res, nd = r.deaths.length || 1; return [label(p), f1(p.relicLv), `${f0(pct(r.deaths, 0.5))} (${f0(pct(r.deaths, 0.1))}–${f0(pct(r.deaths, 0.9))})`, f0(pct(r.nights, 0.5)),
    `${pc(r.zones[1] / r.n)} / ${pc(r.zones[2] / r.n)} / ${pc(r.zones[3] / r.n)}`, pc(r.wins / r.n), f0(mean(r.mem)), f0(pct(r.levels, 0.5)),
    `${pc((r.causes.gloom || 0) / nd)} / ${pc((r.causes.darkness || 0) / nd)} / ${pc((r.causes.starvation || 0) / nd)}`]; })));
P();
P('## Shells per day by lake (all Shell income: sales, bounties, drops, Wardens)');
P(table(['profile', 'Mossmere', 'Sporewood', 'Glasswater', 'Pallid Deep'], profiles.map((p) => [label(p), ...[0, 1, 2, 3].map((z) => (p.res.days[z] > 20 ? f0(p.res.shells[z] / p.res.days[z]) : '—'))])));
P();
P('## Night pacing (fresh profiles)');
for (const p of profiles.filter((x) => x.snap === 0)) {
  const r = p.res;
  P(`- ${label(p)}: Embers lost per night N1–N6 = ${[0, 1, 2, 3, 4, 5].map((j) => f1(mean(r.hitsByNight[j] || []))).join(' / ')}; oil net per survived night N1–N5 = ${[0, 1, 2, 3, 4].map((j) => f0(mean(r.oilByNight[j] || []))).join(' / ')}; level-up every ${f0(pct(r.cadence, 0.5))} s on nights 2–3; Warden killed on ${pc(r.warden.kills / Math.max(1, r.warden.nights))} of boss nights (median ${f0(pct(r.warden.times, 0.5))} s)`);
}
P();
P('## Where Embers are lost (share of all Embers lost at night)');
P(table(['profile', 'swarm contact', 'hand slam', 'inkwell glob', 'warden', 'eel', 'darkness'], profiles.filter((p) => p.snap === 0 || p.snap === 8).map((p) => { const h = p.res.hitSrc, tot = Object.values(h).reduce((a, b) => a + b, 0) || 1; return [label(p), ...['swarm contact', 'hand slam', 'inkwell glob', 'warden', 'eel', 'dark'].map((k) => pc((h[k] || 0) / tot))]; })));
P();
P('## Campaign trajectory (share of campaigns that have ever reached a lake / won by run N)');
const traj = [];
for (const key of ['average', 'learner', 'skilled']) {
  const cs = campaigns[key];
  for (const r of [1, 2, 3, 5, 8, 10, 13].filter((x) => x <= LEN)) {
    const ever = (z) => cs.filter((c) => c.runs.slice(0, r).some((x) => x.zone >= z)).length / cs.length;
    const won = cs.filter((c) => c.runs.slice(0, r).some((x) => x.won)).length / cs.length;
    traj.push([key, r, f1(mean(cs.map((c) => c.runs[r - 1].day))), pc(ever(1)), pc(ever(2)), pc(ever(3)), pc(won), f0(mean(cs.map((c) => c.runs[r - 1].memories))), f1(mean(cs.map((c) => c.runs[r - 1].relicLevels)))]);
  }
}
P(table(['skill', 'run', 'end day (mean)', 'ever Sporewood', 'ever Glasswater', 'ever Pallid', 'ever won', 'Memories that run', 'relic levels after'], traj));
P();
const firstReach = (key, z) => { const cs = campaigns[key]; const idx = cs.map((c) => { const i = c.runs.findIndex((x) => (z === 4 ? x.won : x.zone >= z)); return i < 0 ? Infinity : i + 1; }); const m = pct(idx, 0.5); return Number.isFinite(m) ? m : NaN; };
for (const key of ['average', 'learner', 'skilled']) P(`First reach (median run #, "—" = not within ${LEN} runs) · ${key}: Sporewood ${f0(firstReach(key, 1))}, Glasswater ${f0(firstReach(key, 2))}, Pallid ${f0(firstReach(key, 3))}, victory ${f0(firstReach(key, 4))}`);
P();
P('## Degenerate-strategy probes (skilled player)');
const memPerMin = (r) => mean(r.mem) / mean(r.minutes);
P(table(['meta', 'strategy', 'death day med', 'reach Spore / Glass / Pallid', 'win %', 'Memories/run', 'Memories/min'], probes.map((x) => [x.metas, x.label, f0(pct(x.r.deaths, 0.5)), `${pc(x.r.zones[1] / x.r.n)} / ${pc(x.r.zones[2] / x.r.n)} / ${pc(x.r.zones[3] / x.r.n)}`, pc(x.r.wins / x.r.n), f0(mean(x.r.mem)), f1(memPerMin(x.r))])));
P();
// targets
const get = (key, snap) => profiles.find((p) => p.key === key && p.snap === snap)?.res;
const checks = [];
const chk = (name, val, ok) => checks.push([name, val, ok ? 'PASS' : 'MISS']);
{
  const a0 = get('average', 0), s0 = get('skilled', 0), s8 = get('skilled', 8), a3 = get('average', 3);
  chk('fresh average: median death day 3–6', f0(pct(a0.deaths, 0.5)), pct(a0.deaths, 0.5) >= 3 && pct(a0.deaths, 0.5) <= 6);
  chk('fresh average: rarely past Sporewood (Glasswater < 5%)', pc(a0.zones[2] / a0.n), a0.zones[2] / a0.n < 0.05);
  chk('fresh skilled: median death day 6–8 (task 6–10 ∩ 5–8)', f0(pct(s0.deaths, 0.5)), pct(s0.deaths, 0.5) >= 6 && pct(s0.deaths, 0.5) <= 8);
  if (s8) chk('skilled after ~8 runs: win 10–40%', pc(s8.wins / s8.n), s8.wins / s8.n >= 0.10 && s8.wins / s8.n <= 0.40);
  chk('average: relic levels bought per run, run 1 / after 3 runs ≈ 1–3 (run 1 may pop one-time challenges)', `${f1(mean(a0.relicBought))} / ${a3 ? f1(mean(a3.relicBought)) : '—'}`, mean(a0.relicBought) <= 4 && (!a3 || (mean(a3.relicBought) >= 1 && mean(a3.relicBought) <= 3)));
  const camp = probes.find((x) => x.label.startsWith('never') && x.metas === 'fresh'), basep = probes.find((x) => x.label === 'baseline' && x.metas === 'fresh');
  chk('camping is not immortal (fresh skilled camper median death ≤ day 16)', f0(pct(camp.r.deaths, 0.5)), pct(camp.r.deaths, 0.5) <= 16);
  chk('camping earns fewer Memories/min than descending', `${f1(memPerMin(camp.r))} vs ${f1(memPerMin(basep.r))}`, memPerMin(camp.r) < memPerMin(basep.r));
  const rend = probes.find((x) => x.label === 'render every fish');
  chk('render-everything is not dominant (≤ baseline + 1 day)', `${f0(pct(rend.r.deaths, 0.5))} vs ${f0(pct(basep.r.deaths, 0.5))}`, pct(rend.r.deaths, 0.5) <= pct(basep.r.deaths, 0.5) + 1);
  const mant = probes.find((x) => x.label.startsWith('all Shells') && x.metas === 'fresh');
  chk('single upgrade does not trivialise (mantle-only ≤ baseline + 1 day)', `${f0(pct(mant.r.deaths, 0.5))} vs ${f0(pct(basep.r.deaths, 0.5))}`, pct(mant.r.deaths, 0.5) <= pct(basep.r.deaths, 0.5) + 1);
  const fr = (z) => firstReach('learner', z);
  chk('learner (typical player): first Sporewood ≤ run 6, first Glasswater ≤ run 10', `${f0(fr(1))} / ${f0(fr(2))}`, fr(1) <= 6 && fr(2) <= 10);
  const zs = probes.find((x) => x.label.startsWith('zap'));
  chk('zap spam is not dominant (≤ baseline + 1 day)', `${f0(pct(zs.r.deaths, 0.5))} vs ${f0(pct(basep.r.deaths, 0.5))}`, pct(zs.r.deaths, 0.5) <= pct(basep.r.deaths, 0.5) + 1);
}
P('## Targets');
P(table(['target', 'sim', 'result'], checks));
if (args.json) console.log(JSON.stringify({ profiles: profiles.map((p) => ({ key: p.key, snap: p.snap, relicLv: p.relicLv, deathMed: pct(p.res.deaths, 0.5), win: p.res.wins / p.res.n, zones: p.res.zones.map((z) => z / p.res.n), mem: mean(p.res.mem) })), checks }, null, 1));
else console.log(out.join('\n'));
