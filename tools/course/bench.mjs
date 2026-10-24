#!/usr/bin/env node
// Checks a Fault Bench lesson's one data file, $D/iN.bench.json (tools/course/BENCH.md), before any
// reader sees it, and writes it into the course's case file so the lesson page reads it as data.
//
//   node tools/course/bench.mjs --dir <course dir> --idea iN [--research <research.json>]
//        [--emit-case] [--emit-lesson <lesson.json>] [--table <out.json>]
//
// Prints {ok, problems, warnings, readings} and exits 1 when there are problems. It
// - computes every reading from its rule (continuity, voltageToN, voltageAcross, look, play, lookup)
//   and the circuit, and every quantity from its rule and inputs: a bare number with no rule,
//   source or example mark is refused, and an unsourced reading is a class ("near zero");
// - checks every fault differs from healthy and from every other fault on some offered test;
// - walks each job's expert route and every offered route: no dead test before proving dead, no
//   live test without a sourced reason, nothing played while isolated, each "name" pinned down to
//   exactly that fault by the readings so far, and a proof after the last fix;
// - checks the safe-isolation steps are in the sourced order (HSG85: isolate, secure, prove the
//   tester, test dead, prove the tester again) and each carries its source;
// - lints every string Dan reads: at most 90 words a screen (a report 40, a thought 25, a note 90),
//   no narrated sources or page refs, no brackets, sentences mostly under 20 words and none over
//   25, a number with a unit only where a quantity or reading accounts for it, a maker's figure said
//   "for example", and the right option not always in the same place;
// - checks every source id against research.json (by default $D/research.json when it exists).
// --emit-case writes the checked bench, its reading table and its routes into $D/case.json as
// benches.iN (the page reads K.caseFile.benches.iN) and its quantities as figures "iN.<id>"
// (K.figure); --emit-lesson copies the teach-back and Keep this card into the lesson JSON's
// written and summary, so no word is typed twice. Both write only when there are no problems.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const BASE_CLASSES = ['near zero', 'over range', 'coil', 'floating'];
export const STAGES = ['identify', 'isolate', 'lock', 'notice', 'proveTester', 'testDead', 'reproveTester'];
const NEED_STAGES = ['isolate', 'lock', 'proveTester', 'testDead', 'reproveTester'];
const PART_KINDS = ['wire', 'core', 'fuse', 'link', 'nc', 'no', 'aux', 'coil'];
const EFFECTS = ['open', 'short', 'bridge', 'rating'];
const TEST_KINDS = ['continuity', 'voltageToN', 'voltageAcross', 'look', 'play', 'lookup'];
const NEEDS = { continuity: 'dead', voltageToN: 'live', voltageAcross: 'live', look: 'any', play: 'on', lookup: null };
const TRIGGERS = ['wrong', 'notSure', 'pieceByPiece', 'surprise', 'namedWrong', 'askRoute', 'named', 'always'];
const SCREEN_KINDS = ['look', 'choose', 'pickAll', 'chips', 'order', 'loop', 'name', 'proof', 'written', 'keep'];
const RULES = {
  ratio: { n: 2, f: (a, b, unit) => (unit === '%' ? (a / b) * 100 : a / b) },
  product: { n: 2, f: (a, b) => a * b },
  sum: { n: 2, f: (a, b) => a + b },
  difference: { n: 2, f: (a, b) => a - b },
  halvingWorst: { n: 1, count: true, f: (n) => Math.ceil(Math.log2(n)) },
  pieceWorst: { n: 1, count: true, f: (n) => n - 1 },
};
const LIMITS = { report: 40, thought: 25, note: 90, screen: 90, text: 90 };
const MAX_CASE_BYTES = 250 * 1024;

const isObj = (o) => o != null && typeof o === 'object' && !Array.isArray(o);
const isStr = (s) => typeof s === 'string' && s.trim().length > 0;
const list = (x) => (Array.isArray(x) ? x : x == null ? [] : [x]);
const srcOf = (o) => (isObj(o) ? list(o.src).filter((s) => s !== '' && s != null) : []);
export const words = (s) => (String(s || '').match(/[A-Za-z0-9][A-Za-z0-9'’.%²-]*/g) || []).length;
const fmtNum = (v) => String(Math.round(v * 1e6) / 1e6);
const normUnit = (u) => (/^ohms?$/i.test(u || '') ? 'Ω' : u || '');

// ---------- the circuit ----------
function uf() {
  const p = new Map();
  const find = (x) => { if (!p.has(x)) p.set(x, x); while (p.get(x) !== x) { p.set(x, p.get(p.get(x))); x = p.get(x); } return x; };
  return { find, union: (a, b) => p.set(find(a), find(b)), same: (a, b) => find(a) === find(b) };
}

function partMode(ctx, part, active, held, seated) {
  const f = active.find((x) => x.part === part.id && (x.effect === 'open' || x.effect === 'short'));
  if (f) return f.effect === 'open' ? 'open' : 'link';
  const on = (ctx.togglesByPart[part.id] || []).some((t) => held.has(t.id));
  switch (part.kind) {
    case 'coil': return 'coil';
    case 'nc': return on ? 'open' : 'link';
    case 'no': return on ? 'link' : 'open';
    case 'aux': return seated.has(part.with) ? 'link' : 'open';
    default: return 'link';
  }
}

function network(ctx, active, held, seated) {
  const links = uf(), coils = [];
  for (const part of ctx.parts) {
    const m = partMode(ctx, part, active, held, seated);
    if (m === 'link') links.union(part.a, part.b);
    else if (m === 'coil') coils.push([part.a, part.b]);
  }
  for (const f of active) if (f.effect === 'bridge' && Array.isArray(f.nodes)) links.union(f.nodes[0], f.nodes[1]);
  return { links, coils };
}

// Can a and b be joined through the coils' windings, the link groups being single nodes?
function joinedVia(net, a, b, avoid) {
  const start = net.links.find(a), goal = net.links.find(b);
  const seen = new Set([start]), queue = [start];
  while (queue.length) {
    const cur = queue.shift();
    if (cur === goal) return true;
    for (const [x, y] of net.coils) {
      const cx = net.links.find(x), cy = net.links.find(y);
      for (const [from, to] of [[cx, cy], [cy, cx]]) if (from === cur && !seen.has(to) && to !== avoid) { seen.add(to); queue.push(to); }
    }
  }
  return false;
}

function coilRating(ctx, coil, active) {
  const f = active.find((x) => x.part === coil.id && x.effect === 'rating');
  return ctx.q[(f && f.rating) || coil.rating];
}

// The contactors with the supply on: a coil fed from line to neutral seats when its share of its
// rating is inside the band (rule coilBand), buzzes below it; a seated coil closes its aux contacts.
function settle(ctx, active, held, seated0) {
  let seated = new Set(seated0 || []);
  let out = null;
  for (let i = 0; i < 8; i++) {
    const net = network(ctx, active, held, seated);
    const status = {}, next = new Set();
    for (const c of ctx.coils) {
      if (partMode(ctx, c, active, held, seated) === 'open') { status[c.id] = 'off'; continue; }
      const L = ctx.line, N = ctx.neutral;
      const fed = (net.links.same(L, c.a) && net.links.same(c.b, N)) || (net.links.same(L, c.b) && net.links.same(c.a, N));
      if (!fed) { status[c.id] = 'off'; continue; }
      const st = band(ctx, coilRating(ctx, c, active));
      status[c.id] = st;
      if (st === 'runs' || st === 'over') next.add(c.id);
    }
    out = { seated: next, status, net, short: net.links.same(ctx.line, ctx.neutral) };
    if (next.size === seated.size && [...next].every((x) => seated.has(x))) return out;
    seated = next;
  }
  return out;
}

function band(ctx, rating) {
  const v = ctx.q[ctx.supplyVolts];
  if (!v || !rating) return 'unknown';
  const share = (v.value / rating.value) * 100;
  if (!ctx.band) return Math.abs(share - 100) < 1e-9 ? 'runs' : 'noBand';
  if (share < ctx.band.lo - 1e-9) return 'buzzes';
  if (share > ctx.band.hi + 1e-9) return 'over';
  return 'runs';
}

function nodeVolts(ctx, net, node) {
  const v = ctx.q[ctx.supplyVolts];
  if (net.links.same(node, ctx.line)) return { value: v ? v.value : NaN, unit: 'V', rule: 'voltageToN', from: ctx.supplyVolts };
  if (net.links.same(node, ctx.neutral) || joinedVia(net, node, ctx.neutral, net.links.find(ctx.line))) return { value: 0, unit: 'V', rule: 'voltageToN' };
  return { class: 'floating', rule: 'voltageToN' };
}

const key = (r) => (r.class != null ? r.class : r.status != null ? r.status : r.text != null ? r.text : fmtNum(r.value) + ' ' + r.unit);

// One reading of one test instance under a set of active faults.
export function reading(ctx, inst, active) {
  const t = ctx.tests[inst.test];
  const held = new Set(inst.hold || []);
  switch (t.kind) {
    case 'continuity': {
      const net = network(ctx, active, held, new Set());
      if (net.links.same(inst.a, inst.b)) return { class: 'near zero', rule: 'continuity' };
      if (joinedVia(net, inst.a, inst.b)) return { class: 'coil', rule: 'continuity' };
      return { class: 'over range', rule: 'continuity' };
    }
    case 'voltageToN':
    case 'voltageAcross': {
      const s = settle(ctx, active, held, new Set());
      if (s.short) return { class: 'short', rule: t.kind };
      const va = nodeVolts(ctx, s.net, inst.a);
      if (t.kind === 'voltageToN') return va;
      const vb = nodeVolts(ctx, s.net, inst.b);
      if (va.class || vb.class) return { class: 'floating', rule: 'voltageAcross' };
      return { value: Math.abs(va.value - vb.value), unit: 'V', rule: 'voltageAcross', from: ctx.supplyVolts };
    }
    case 'look': {
      const target = (t.targets || []).find((x) => x.id === inst.target) || {};
      const shows = target.shows || {};
      const hits = active.filter((f) => shows[f.id] != null).map((f) => textOf(shows[f.id]));
      const uniq = [...new Set(hits)];
      if (uniq.length > 1) return { text: uniq.join(' / '), rule: 'look', conflict: true };
      return { text: uniq.length ? uniq[0] : textOf(shows.healthy), rule: 'look' };
    }
    case 'play': {
      const check = (t.checks || []).find((x) => x.id === inst.check) || { seq: [] };
      let seated = new Set(), heldNow = new Set(), s = null;
      s = settle(ctx, active, heldNow, seated);
      for (const [act, tog] of check.seq || []) {
        if (act === 'on') heldNow.add(tog); else heldNow.delete(tog);
        s = settle(ctx, active, heldNow, s.seated);
      }
      const coil = t.coil || (ctx.coils[0] && ctx.coils[0].id);
      const status = s.short ? 'short' : s.status[coil] || 'off';
      const w = Object.assign({}, t.words || {}, check.words || {});
      return { status, text: w[status], rule: 'play' };
    }
    case 'lookup': {
      const at = (t.at || []).find((x) => x.id === inst.target) || {};
      const r = at.readings || {};
      const f = active.find((x) => r[x.id] != null);
      const got = f ? r[f.id] : r.healthy;
      if (!isObj(got)) return { class: 'missing', rule: 'lookup' };
      return got.class != null ? { class: got.class, rule: 'lookup' } : { value: got.value, unit: normUnit(got.unit), rule: 'lookup', src: got.src };
    }
  }
  return { class: 'unknown', rule: '?' };
}
const textOf = (x) => (isObj(x) ? x.text : x);

// ---------- the context: the bench indexed, with its quantities computed ----------
function build(b, P, W) {
  const ctx = { b, parts: list(b.parts), coils: [], togglesByPart: {}, tests: {}, q: {}, faults: {}, points: list(b.points).map((p) => p && p.id) };
  ctx.line = (b.supply || {}).line; ctx.neutral = (b.supply || {}).neutral; ctx.supplyVolts = (b.supply || {}).volts;
  const nodes = new Set([ctx.line, ctx.neutral]);
  const seenIds = new Set();
  const uniq = (id, p) => { if (!isStr(id)) P.push(p + ' needs an id.'); else if (seenIds.has(id)) P.push(p + ': the id "' + id + '" is used twice.'); else seenIds.add(id); };
  if (!isObj(b.supply) || !isStr(ctx.line) || !isStr(ctx.neutral) || !isStr(ctx.supplyVolts)) P.push('supply must be {line, neutral, volts: a quantity id}.');
  ctx.parts.forEach((p, k) => {
    uniq(p && p.id, 'parts[' + k + ']');
    if (!isObj(p)) return;
    if (!PART_KINDS.includes(p.kind)) P.push('parts.' + p.id + ': kind "' + p.kind + '" is not one of ' + PART_KINDS.join(', ') + '.');
    if (!isStr(p.a) || !isStr(p.b)) P.push('parts.' + p.id + ' must join two nodes, a and b.');
    nodes.add(p.a); nodes.add(p.b);
    if (p.kind === 'coil') { ctx.coils.push(p); if (!isStr(p.rating)) P.push('parts.' + p.id + ': a coil needs its rating, a quantity id.'); }
    if (p.kind === 'aux' && !isStr(p.with)) P.push('parts.' + p.id + ': an aux contact names the coil it closes with ("with").');
  });
  ctx.nodes = nodes;
  ctx.points.forEach((id, k) => { if (!isStr(id)) P.push('points[' + k + '] needs an id.'); else if (!nodes.has(id)) P.push('points.' + id + ' is not a node of any part.'); });
  list(b.toggles).forEach((t, k) => {
    uniq(t && t.id, 'toggles[' + k + ']');
    if (!isObj(t)) return;
    const part = ctx.parts.find((p) => p && p.id === t.part);
    if (!part) P.push('toggles.' + t.id + ' operates part "' + t.part + '", which is not in parts.');
    else if (!['nc', 'no'].includes(part.kind)) P.push('toggles.' + t.id + ': only a normally closed or normally open contact can be held.');
    (ctx.togglesByPart[t.part] = ctx.togglesByPart[t.part] || []).push(t);
  });
  ctx.toggles = list(b.toggles).filter(isObj);
  // quantities: each from its rule, its source or a case example; never a bare number.
  const qs = list(b.quantities);
  qs.forEach((q, k) => { uniq(q && q.id, 'quantities[' + k + ']'); if (isObj(q) && isStr(q.id)) ctx.q[q.id] = q; });
  const done = new Set(), computed = {};
  for (let pass = 0; pass < qs.length + 1; pass++) {
    for (const q of qs) {
      if (!isObj(q) || done.has(q.id)) continue;
      const p = 'quantities.' + q.id;
      if (typeof q.value !== 'number' || !isFinite(q.value)) { P.push(p + ': value must be a number.'); done.add(q.id); continue; }
      if (typeof q.unit !== 'string') { P.push(p + ': unit must be a text ("V", "%", or "" for a count).'); }
      if (!q.compute) {
        if (!srcOf(q).length && q.example !== true) P.push(p + ': ' + q.value + ' is a bare number. Give its rule (compute and inputs), its source (src), or mark it a case example (example: true).');
        done.add(q.id); continue;
      }
      const rule = RULES[q.compute];
      if (!rule) { P.push(p + ': compute "' + q.compute + '" is not a rule bench.mjs knows (' + Object.keys(RULES).join(', ') + ').'); done.add(q.id); continue; }
      const ins = list(q.inputs);
      if (ins.length !== rule.n) { P.push(p + ': ' + q.compute + ' takes ' + rule.n + ' input(s).'); done.add(q.id); continue; }
      if (ins.some((x) => typeof x === 'string' && ctx.q[x] && !done.has(x))) continue; // wait for its inputs
      const vals = [];
      let bad = false;
      for (const x of ins) {
        if (typeof x === 'number') { if (!rule.count) { P.push(p + ': input ' + x + ' is a bare number; name a quantity id (only a count may be written as a number).'); bad = true; } else vals.push(x); }
        else if (ctx.q[x] && typeof ctx.q[x].value === 'number') vals.push(ctx.q[x].value);
        else { P.push(p + ': input "' + x + '" is not a quantity.'); bad = true; }
      }
      done.add(q.id);
      if (bad) continue;
      const exact = rule.f(...vals, q.unit);
      const places = q.round != null ? q.round : ((String(q.value).split('.')[1] || '').length);
      const shown = Math.round(Number(exact.toFixed(9)) * 10 ** places) / 10 ** places;
      computed[q.id] = { value: q.value, unit: q.unit, rule: q.compute, inputs: ins, exact: Math.round(exact * 1e6) / 1e6 };
      if (Math.abs(shown - q.value) > 1e-9) P.push(p + ': ' + q.compute + '(' + ins.join(', ') + ') gives ' + fmtNum(exact) + ', shown as ' + fmtNum(shown) + ', not ' + q.value + '.');
    }
  }
  qs.forEach((q) => { if (isObj(q) && !done.has(q.id)) P.push('quantities.' + q.id + ': its inputs go round in a circle.'); });
  ctx.computed = computed;
  if (ctx.supplyVolts && !ctx.q[ctx.supplyVolts]) P.push('supply.volts "' + ctx.supplyVolts + '" is not a quantity.');
  else if (ctx.q[ctx.supplyVolts] && !srcOf(ctx.q[ctx.supplyVolts]).length) P.push('supply.volts: the supply voltage must carry its source.');
  ctx.coils.forEach((c) => { if (c.rating && !ctx.q[c.rating]) P.push('parts.' + c.id + ': rating "' + c.rating + '" is not a quantity.'); });
  if (isObj(b.coilBand)) {
    const lo = ctx.q[b.coilBand.lo], hi = ctx.q[b.coilBand.hi];
    if (!lo || !hi) P.push('coilBand must name two quantities, lo and hi, in % of the coil\'s rating.');
    else {
      if (!srcOf(lo).length || !srcOf(hi).length) P.push('coilBand: the pull-in band must be sourced.');
      ctx.band = { lo: lo.value, hi: hi.value };
    }
  } else if (ctx.coils.length) W.push('No coilBand: a coil fed anything but its rating cannot be computed.');
  // faults
  list(b.faults).forEach((f, k) => {
    uniq(f && f.id, 'faults[' + k + ']');
    if (!isObj(f)) return;
    ctx.faults[f.id] = f;
    const p = 'faults.' + f.id;
    if (!EFFECTS.includes(f.effect)) P.push(p + ': effect "' + f.effect + '" is not one of ' + EFFECTS.join(', ') + '.');
    if (f.effect === 'bridge') { if (!Array.isArray(f.nodes) || f.nodes.length !== 2 || !f.nodes.every((n) => nodes.has(n))) P.push(p + ': a bridge joins two nodes of the circuit ("nodes").'); }
    else if (!ctx.parts.find((x) => x && x.id === f.part)) P.push(p + ': part "' + f.part + '" is not in parts.');
    if (f.effect === 'rating') {
      const part = ctx.parts.find((x) => x && x.id === f.part);
      if (!part || part.kind !== 'coil') P.push(p + ': a wrong rating is on a coil.');
      if (!ctx.q[f.rating]) P.push(p + ': rating "' + f.rating + '" is not a quantity.');
    }
    if (list(b.kinds).length && !list(b.kinds).includes(f.kind)) P.push(p + ': kind "' + f.kind + '" is not one of the kinds Dan picks from (' + list(b.kinds).join(', ') + ').');
  });
  // tests
  list(b.tests).forEach((t, k) => {
    uniq(t && t.id, 'tests[' + k + ']');
    if (!isObj(t)) return;
    const p = 'tests.' + t.id;
    if (!TEST_KINDS.includes(t.kind)) { P.push(p + ': kind "' + t.kind + '" is not one of ' + TEST_KINDS.join(', ') + '.'); return; }
    ctx.tests[t.id] = t;
    t._needs = t.needs || NEEDS[t.kind];
    if (!t._needs) P.push(p + ': say whether it needs the circuit dead or live ("needs").');
    list(t.hold).forEach((h) => { if (!ctx.toggles.find((x) => x.id === h)) P.push(p + ': hold "' + h + '" is not a toggle.'); });
    if (t.kind === 'look') list(t.targets).forEach((x, j) => {
      if (!isObj(x) || !isStr(x.id)) { P.push(p + '.targets[' + j + '] needs an id.'); return; }
      if (!isObj(x.shows) || x.shows.healthy == null) P.push(p + '.' + x.id + ': shows needs what a healthy one looks like ("healthy").');
      else Object.keys(x.shows).forEach((fid) => { if (fid !== 'healthy' && !list(b.faults).find((f) => f && f.id === fid)) P.push(p + '.' + x.id + ': shows names "' + fid + '", which is not a fault.'); });
    });
    if (t.kind === 'play') {
      if (!ctx.coils.length) P.push(p + ': there is no coil to play.');
      list(t.checks).forEach((c, j) => {
        if (!isObj(c) || !isStr(c.id) || !Array.isArray(c.seq)) { P.push(p + '.checks[' + j + '] must be {id, label, seq: [["on"|"off", toggle id]]}.'); return; }
        c.seq.forEach((s) => { if (!Array.isArray(s) || !['on', 'off'].includes(s[0]) || !ctx.toggles.find((x) => x.id === s[1])) P.push(p + '.' + c.id + ': step ' + JSON.stringify(s) + ' must be ["on" or "off", a toggle id].'); });
      });
    }
    if (t.kind === 'lookup') list(t.at).forEach((x, j) => {
      if (!isObj(x) || !isStr(x.id) || !isObj(x.readings) || !x.readings.healthy) { P.push(p + '.at[' + j + '] must be {id, label, readings: {healthy, <fault id>...}}.'); return; }
      Object.entries(x.readings).forEach(([fid, r]) => {
        const pp = p + '.' + x.id + '.' + fid;
        if (!isObj(r)) { P.push(pp + ' must be {class} or {value, unit, src}.'); return; }
        if (r.class != null) { if (/\d/.test(String(r.class))) P.push(pp + ': class "' + r.class + '" holds a number; a class is words ("near zero", "over range").'); }
        else if (typeof r.value === 'number') { if (!srcOf(r).length) P.push(pp + ': ' + r.value + ' ' + (r.unit || '') + ' is a bare number. Cite it (src) or read it as a class.'); }
        else P.push(pp + ' must be {class} or {value, unit, src}.');
      });
    });
  });
  return ctx;
}

// Every instance of every offered test: what the page can ask the meter.
function instances(ctx, offered) {
  const out = [];
  const pts = ctx.points.filter(isStr);
  const drawn = ctx.toggles.filter((t) => t.drawn !== false).map((t) => t.id).sort().slice(0, 4);
  const subsets = [[]];
  drawn.forEach((t) => { const n = subsets.length; for (let i = 0; i < n; i++) subsets.push(subsets[i].concat(t)); });
  for (const id of offered) {
    const t = ctx.tests[id];
    if (!t) continue;
    const pairs = [];
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) pairs.push([pts[i], pts[j]]);
    const hold = list(t.hold).slice().sort();
    if (t.kind === 'continuity') pairs.forEach(([a, b]) => subsets.forEach((h) => out.push({ test: id, a, b, hold: h, key: id + ':' + a + '-' + b + (h.length ? '+' + h.join('+') : '') })));
    if (t.kind === 'voltageToN') pts.forEach((a) => out.push({ test: id, a, hold, key: id + ':' + a }));
    if (t.kind === 'voltageAcross') pairs.forEach(([a, b]) => out.push({ test: id, a, b, hold, key: id + ':' + a + '-' + b }));
    if (t.kind === 'look') list(t.targets).forEach((x) => isObj(x) && out.push({ test: id, target: x.id, key: id + ':' + x.id }));
    if (t.kind === 'lookup') list(t.at).forEach((x) => isObj(x) && out.push({ test: id, target: x.id, key: id + ':' + x.id }));
    if (t.kind === 'play') list(t.checks).forEach((c) => isObj(c) && out.push({ test: id, check: c.id, key: id + ':' + c.id }));
  }
  return out;
}

// The key the page looks a step up by: points in the bench's order, held toggles sorted.
export function instKey(ctx, step) {
  const t = ctx.tests[step.test];
  if (!t) return null;
  if (t.kind === 'look' || t.kind === 'lookup') return step.test + ':' + step.target;
  if (t.kind === 'play') return step.test + ':' + step.check;
  if (t.kind === 'voltageToN') return step.test + ':' + step.a;
  let [a, b] = [step.a, step.b];
  if (ctx.points.indexOf(a) > ctx.points.indexOf(b)) [a, b] = [b, a];
  const h = t.kind === 'continuity' ? list(step.hold).slice().sort() : [];
  return step.test + ':' + a + '-' + b + (h.length ? '+' + h.join('+') : '');
}

// ---------- the routes ----------
function walk(ctx, job, route, label, expert, P, W) {
  const all = Object.keys(ctx.faults);
  const pool = list(job.candidates).length ? list(job.candidates) : all;
  let active = list(job.faults).map((id) => ctx.faults[id]).filter(Boolean);
  let state = 'live', fixed = [], named = [], cands = pool.slice(), lastFix = -1, proofAfter = new Set(), proofBad = [];
  const out = [];
  const offered = list(job.offer).length ? list(job.offer) : Object.keys(ctx.tests);
  const hasReason = (t) => srcOf(t.reason).length > 0 || srcOf(job.liveReason).length > 0;
  list(route).forEach((step, i) => {
    const p = label + '[' + i + ']';
    if (!isObj(step)) { P.push(p + ' must be an object {do, ...}.'); return; }
    const rec = { step: i + 1, do: step.do };
    if (step.do === 'safe') { if (state === 'dead') W.push(p + ': already isolated.'); state = 'dead'; }
    else if (step.do === 'restore') { if (state !== 'dead') W.push(p + ': restore while not isolated.'); if (!isObj(ctx.b.restore) || !srcOf(ctx.b.restore).length) P.push(p + ': putting the supply back needs bench.restore with its source.'); state = 'live'; }
    else if (step.do === 'test') {
      const t = ctx.tests[step.test];
      if (!t) { P.push(p + ': test "' + step.test + '" is not in tests.'); return; }
      if (!offered.includes(t.id)) P.push(p + ': test "' + t.id + '" is not offered in ' + job.id + '.');
      let needs = t._needs;
      if (t.kind === 'look') {
        const target = list(t.targets).find((x) => x && x.id === step.target);
        if (!target) { P.push(p + ': look target "' + step.target + '" is not in ' + t.id + '.'); return; }
        needs = target.needs || needs;
      }
      if (t.kind === 'lookup') { const at = list(t.at).find((x) => x && x.id === step.target); if (!at) { P.push(p + ': "' + step.target + '" is not in ' + t.id + '.at.'); return; } needs = at.needs || needs; }
      if (t.kind === 'play' && !list(t.checks).find((c) => c && c.id === step.check)) { P.push(p + ': play check "' + step.check + '" is not in ' + t.id + '.'); return; }
      if (['continuity', 'voltageToN', 'voltageAcross'].includes(t.kind)) {
        if (!ctx.points.includes(step.a) || (t.kind !== 'voltageToN' && !ctx.points.includes(step.b))) { P.push(p + ': the leads must go on test points (' + ctx.points.join(', ') + ').'); return; }
      }
      if (needs === 'dead' && state !== 'dead') P.push(p + ': ' + t.id + ' tests dead before the circuit is isolated and proved dead.');
      if (needs === 'live' && state === 'dead') P.push(p + ': ' + t.id + ' is a live test on an isolated circuit; restore first.');
      if (needs === 'live' && !hasReason(t)) P.push(p + ': ' + t.id + ' is a live test with no sourced reason (test.reason or job.liveReason with src).');
      if (needs === 'on' && state === 'dead') P.push(p + ': ' + t.id + ' operates the plant while it is isolated; restore first (locks off, people told, supply back).');
      const inst = { test: t.id, a: step.a, b: step.b, hold: t.kind === 'continuity' ? list(step.hold) : list(step.hold).length ? list(step.hold) : list(t.hold), target: step.target, check: step.check };
      list(inst.hold).forEach((h) => { if (!ctx.toggles.find((x) => x.id === h)) P.push(p + ': hold "' + h + '" is not a toggle.'); });
      const r = reading(ctx, inst, active);
      if (r.conflict) P.push(p + ': two active faults show different things at ' + step.target + '.');
      const k = key(r);
      cands = cands.filter((c) => key(reading(ctx, inst, c === 'healthy' ? [] : [ctx.faults[c]])) === k);
      Object.assign(rec, { test: t.id, key: instKey(ctx, step) }, step.a ? { a: step.a } : {}, step.b ? { b: step.b } : {}, inst.hold.length ? { hold: inst.hold } : {}, step.target ? { target: step.target } : {}, step.check ? { check: step.check } : {});
      rec.reads = k; rec.rule = r.rule; if (r.text && t.kind === 'play') rec.text = r.text;
      if (r.from) rec.from = r.from;
      rec.left = cands.slice();
      if (step.reads != null && String(step.reads) !== k) P.push(p + ': the bench says ' + t.id + ' reads "' + step.reads + '" here, but its rule gives "' + k + '".');
      if (t.kind === 'play' && lastFix >= 0 && !active.length) {
        proofAfter.add(step.check);
        const healthy = key(reading(ctx, inst, []));
        if (k !== healthy) proofBad.push(step.check);
      }
    } else if (step.do === 'name') {
      const f = ctx.faults[step.fault];
      if (!f) { P.push(p + ': "' + step.fault + '" is not a fault.'); return; }
      if (expert) {
        if (!active.includes(f)) P.push(p + ': names ' + f.id + ', which is not the fault left in ' + job.id + '.');
        if (!(cands.length === 1 && cands[0] === f.id)) P.push(p + ': the readings so far leave ' + (cands.length ? cands.join(', ') : 'no fault') + ', not exactly ' + f.id + '.');
        if (step.kind != null && step.kind !== f.kind) P.push(p + ': ' + f.id + ' is "' + f.kind + '", not "' + step.kind + '".');
      }
      named.push(f.id); Object.assign(rec, { fault: f.id, left: cands.slice() });
    } else if (step.do === 'fix') {
      const f = ctx.faults[step.fault];
      if (!f) { P.push(p + ': "' + step.fault + '" is not a fault.'); return; }
      if (state !== 'dead') P.push(p + ': fixes ' + f.id + ' while the circuit is not isolated.');
      if (expert && !named.includes(f.id)) W.push(p + ': fixes ' + f.id + ' before naming it.');
      active = active.filter((x) => x !== f); fixed.push(f.id); lastFix = i;
      cands = ['healthy'].concat(pool.filter((c) => !fixed.includes(c)));
      proofAfter = new Set(); proofBad = [];
      rec.fault = f.id;
    } else P.push(p + ': do "' + step.do + '" is not one of safe, test, name, fix, restore.');
    if (step.thought != null) rec.thought = step.thought;
    out.push(rec);
  });
  if (expert) {
    if (active.length) P.push(label + ': the route leaves ' + active.map((f) => f.id).join(', ') + ' unfixed.');
    else if (lastFix < 0) P.push(label + ': the route never fixes anything.');
    else if (!proofAfter.size) P.push(label + ': no proof after the last fix: restore, then play it. Green only comes when the fix is proven.');
    else {
      if (proofBad.length) P.push(label + ': the proof after the last fix does not read healthy on ' + proofBad.join(', ') + '.');
      const play = Object.values(ctx.tests).find((t) => t.kind === 'play');
      const missing = play ? list(play.checks).map((c) => c.id).filter((c) => !proofAfter.has(c)) : [];
      if (missing.length) W.push(label + ': the proof leaves out ' + missing.join(', ') + '.');
    }
  }
  return out;
}

// ---------- the words ----------
const NARRATE = [
  [/\b(your|the|my|his|these|those)\s+(slides?|notes?|sheets?|handouts?|pack|book|guide|course|syllabus|lecturer|tutor|textbook|sources?|materials?)\s+(say|says|said|show|shows|tell|tells|warn|warns|state|states|give|gives|puts?|calls?|explains?|mentions?)\b/i, 'narrates where it comes from'],
  [/\b(one|a|another|this|that)\s+(site|website|source|article|maker|study|paper|guide|page|document|handbook)\s+(says|said|warns|notes|states|suggests|shows|puts|tells)\b/i, 'narrates where it comes from'],
  [/\b(according to|as (?:stated|shown|noted) (?:in|by))\b/i, 'narrates where it comes from'],
  [/\bpp?\.\s?\d+/i, 'gives a page reference'],
  [/\bpages?\s+\d+/i, 'gives a page reference'],
  [/¶|\bpara(graph)?s?\s+\d+/i, 'gives a paragraph reference'],
  [/\b(the|this|our|your) course\b/i, 'talks about the course'],
];
const NUM_UNIT = /(?<![A-Za-z0-9.])(\d+(?:\.\d+)?)\s?(%|kVA|VA|kV|mV|V|kA|mA|A|MΩ|kΩ|Ω|ohms?|Hz|kW|W|ms|s|°C|mm²|mm|m)(?![A-Za-z0-9²])/g;
const BARE_DEC = /(?<![A-Za-z0-9.])(\d+\.\d+)(?![\d.]|\s?(?:%|kVA|VA|kV|mV|V|kA|mA|A|MΩ|kΩ|Ω|ohms?|Hz|kW|W|ms|s|°C|mm²|mm|m)(?![A-Za-z0-9²]))/g;
export const sentences = (s) => String(s || '').split(/(?<=[.!?])\s+|\n+/).map((x) => x.trim()).filter((x) => words(x) > 0);

function lintText(ctx, path, s, limit, P, W, stats) {
  if (s == null) return;
  if (typeof s !== 'string') { P.push(path + ' must be text.'); return; }
  const n = words(s);
  if (limit && n > limit) P.push(path + ' has ' + n + ' words; at most ' + limit + '.');
  for (const [re, why] of NARRATE) if (re.test(s)) P.push(path + ' ' + why + ': "' + s.match(re)[0] + '". Say it in your own words.');
  if (/\[\^\d+\]/.test(s)) W.push(path + ' has a footnote; keep them for figures he would look up on a job.');
  const bare = s.replace(/\[\^\d+\]/g, '').replace(/\[\[[^\]\n]+\]\]/g, 'x').replace(/\{[a-z][A-Za-z]*\}/g, 'x');
  if (/\[\d+(?:[,–-]\s?\d+)*\]/.test(bare)) P.push(path + ' shows a citation marker; sources stay as ids in src, never on the page.');
  else if (/[()[\]{}]/.test(bare)) P.push(path + ' has brackets: "' + s + '". Make the aside its own sentence or cut it.');
  if (/;/.test(s)) W.push(path + ' chains clauses with a semicolon; split it into sentences.');
  for (const sen of sentences(s)) {
    const w = words(sen);
    stats.total++;
    if (w > 20) stats.long++;
    if (w > 25) P.push(path + ': a sentence of ' + w + ' words, "' + sen + '". Keep each under 20.');
    else if (w > 20) W.push(path + ': a sentence of ' + w + ' words; most should be under 20.');
  }
  // numbers: each with a unit must be a quantity or a reading's value
  for (const m of s.matchAll(NUM_UNIT)) {
    const v = Number(m[1]), u = normUnit(m[2]);
    const hits = ctx.numbers.filter((x) => Math.abs(x.value - v) < 1e-9 && normUnit(x.unit) === u);
    if (!hits.length) P.push(path + ': "' + m[0] + '" is a bare number. Make it a quantity with its rule, source or example mark.');
    else if (hits.every((x) => x.sayAsExample)) {
      const sen = sentences(s).find((x) => x.includes(m[0])) || s;
      if (!/\b(for example|such as|e\.g\.|for instance)\b/i.test(sen)) P.push(path + ': "' + m[0] + '" is one maker\'s figure; say it "for example".');
    }
    hits.forEach((x) => { x.used = true; });
  }
  for (const m of s.matchAll(BARE_DEC)) {
    const v = Number(m[1]);
    if (!ctx.numbers.some((x) => Math.abs(x.value - v) < 1e-9)) P.push(path + ': "' + m[1] + '" is a bare number. Make it a quantity with its rule.');
  }
}

function lintAll(ctx, P, W) {
  const b = ctx.b, stats = { total: 0, long: 0 };
  const T = (path, s, limit) => lintText(ctx, path, s, limit == null ? LIMITS.text : limit, P, W, stats);
  T('title', b.title);
  list(b.points).forEach((p) => isObj(p) && T('points.' + p.id + '.label', p.label));
  list(b.parts).forEach((p) => isObj(p) && T('parts.' + p.id + '.name', p.name));
  list(b.toggles).forEach((t) => isObj(t) && T('toggles.' + t.id + '.label', t.label));
  Object.entries(b.classes || {}).forEach(([k, v]) => T('classes.' + k, v));
  list(b.kinds).forEach((k, i) => T('kinds[' + i + ']', k));
  list(b.faults).forEach((f) => isObj(f) && T('faults.' + f.id + '.name', f.name));
  list(b.tests).forEach((t) => {
    if (!isObj(t)) return;
    T('tests.' + t.id + '.label', t.label);
    if (isObj(t.reason)) T('tests.' + t.id + '.reason.words', t.reason.words);
    list(t.targets).forEach((x) => { if (!isObj(x)) return; T('tests.' + t.id + '.' + x.id + '.label', x.label); Object.entries(x.shows || {}).forEach(([f, v]) => T('tests.' + t.id + '.' + x.id + '.shows.' + f, textOf(v))); });
    list(t.at).forEach((x) => isObj(x) && T('tests.' + t.id + '.' + x.id + '.label', x.label));
    Object.entries(t.words || {}).forEach(([k, v]) => T('tests.' + t.id + '.words.' + k, v));
    list(t.checks).forEach((c) => { if (!isObj(c)) return; T('tests.' + t.id + '.' + c.id + '.label', c.label); Object.entries(c.words || {}).forEach(([k, v]) => T('tests.' + t.id + '.' + c.id + '.words.' + k, v)); });
  });
  if (isObj(b.intro)) { T('intro.text', b.intro.text); list(b.intro.buttons).forEach((x, i) => T('intro.buttons[' + i + ']', x)); }
  if (isObj(b.isolation)) { list(b.isolation.steps).forEach((s) => isObj(s) && T('isolation.' + s.id, s.text)); T('isolation.asBefore', b.isolation.asBefore); }
  if (isObj(b.restore)) T('restore.text', b.restore.text);
  list(b.jobs).forEach((j) => {
    if (!isObj(j)) return;
    T('jobs.' + j.id + '.title', j.title);
    T('jobs.' + j.id + '.report', j.report, LIMITS.report);
    if (isObj(j.liveReason)) T('jobs.' + j.id + '.liveReason.words', j.liveReason.words);
    list(j.route).forEach((s, i) => isObj(s) && T('jobs.' + j.id + '.route[' + i + '].thought', s.thought, LIMITS.thought));
    list(j.others).forEach((o) => { if (!isObj(o)) return; T('jobs.' + j.id + '.others.' + o.id + '.label', o.label); list(o.route).forEach((s, i) => isObj(s) && T('jobs.' + j.id + '.others.' + o.id + '[' + i + '].thought', s.thought, LIMITS.thought)); });
  });
  list(b.notes).forEach((n) => { if (!isObj(n)) return; T('notes.' + n.id + '.title', n.title); T('notes.' + n.id + '.words', n.words, LIMITS.note); });
  list(b.screens).forEach((s) => {
    if (!isObj(s)) return;
    const p = 'screens.' + s.id;
    T(p + '.text', s.text); T(p + '.after', s.after); T(p + '.hint', s.hint);
    list(s.buttons).forEach((x, i) => T(p + '.buttons[' + i + ']', x));
    list(s.options).forEach((o, i) => { if (!isObj(o)) return; T(p + '.options[' + i + ']', o.text); T(p + '.options[' + i + '].why', o.why); T(p + '.options[' + i + '].slip', o.slip); });
    if (isObj(s.review)) { T(p + '.review.text', s.review.text); list(s.review.options).forEach((o, i) => isObj(o) && T(p + '.review.options[' + i + ']', o.text)); }
  });
  if (isObj(b.written)) Object.entries(b.written).forEach(([id, w]) => { if (!isObj(w)) return; T('written.' + id + '.q', w.q); list(w.points).forEach((x, i) => isObj(x) && T('written.' + id + '.points[' + i + ']', x.text)); T('written.' + id + '.model', w.model, LIMITS.screen); });
  if (isObj(b.keep)) { const k = b.keep; T('keep.title', k.title); T('keep.for', k.for); T('keep.rule', k.rule); list(k.traps).forEach((x, i) => isObj(x) && T('keep.traps[' + i + ']', x.text)); T('keep.where', k.where); }
  if (stats.total >= 5 && stats.long / stats.total > 0.2) P.push('Sentences: ' + stats.long + ' of ' + stats.total + ' run over 20 words; most must be under 20.');
  ctx.numbers.filter((x) => x.example && !x.used).forEach((x) => W.push('quantities.' + x.id + ' is a case example that no screen names.'));
}

// Screen word counts and the place of the right option.
function screens(ctx, P, W) {
  const b = ctx.b, jobs = {};
  list(b.jobs).forEach((j) => { if (isObj(j)) jobs[j.id] = j; });
  const positions = [];
  const seen = new Set();
  list(b.screens).forEach((s, k) => {
    if (!isObj(s) || !isStr(s.id)) { P.push('screens[' + k + '] needs an id.'); return; }
    if (seen.has(s.id)) P.push('screens.' + s.id + ' is used twice.'); seen.add(s.id);
    const p = 'screens.' + s.id;
    if (!SCREEN_KINDS.includes(s.kind)) P.push(p + ': kind "' + s.kind + '" is not one of ' + SCREEN_KINDS.join(', ') + '.');
    if (s.job != null && !jobs[s.job]) P.push(p + ': job "' + s.job + '" is not in jobs.');
    if (s.kind === 'order' && !isObj(b.isolation)) P.push(p + ': an order screen needs bench.isolation.');
    if (s.kind === 'written' && !isObj(b.written)) P.push(p + ': a written screen needs bench.written.');
    if (s.kind === 'keep' && !isObj(b.keep)) P.push(p + ': a keep screen needs bench.keep.');
    const opts = list(s.options).filter(isObj);
    let n = words(s.text) + (s.report && jobs[s.job] ? words(jobs[s.job].report) : 0) + list(s.buttons).reduce((a, x) => a + words(x), 0) + opts.reduce((a, o) => a + words(o.text), 0);
    if (s.kind === 'order' && isObj(b.isolation)) n += list(b.isolation.steps).reduce((a, x) => a + words(isObj(x) && x.text), 0);
    const fb = Math.max(words(s.after), words(s.hint), ...opts.map((o) => Math.max(words(o.why), words(o.slip))), 0);
    if (n + fb > LIMITS.screen) P.push(p + ' shows ' + (n + fb) + ' words with its longest feedback; at most ' + LIMITS.screen + ' a screen.');
    const right = opts.map((o, i) => (o.right ? i : -1)).filter((i) => i >= 0);
    if ((s.kind === 'choose' || s.kind === 'name') && opts.length) {
      if (right.length !== 1) P.push(p + ': a choice has exactly one right option (it has ' + right.length + ').');
      else if (opts.length >= 3) positions.push([p, right[0]]);
      opts.forEach((o, i) => { if (!o.right && !isStr(o.why) && !isStr(o.slip)) W.push(p + '.options[' + i + '] is wrong but says nothing about why.'); });
    }
    if ((s.kind === 'pickAll' || s.kind === 'chips') && opts.length && !right.length) P.push(p + ': pick-all needs at least one right option.');
    opts.forEach((o, i) => { if (o.warn && !srcOf(o).length) P.push(p + '.options[' + i + '] is a safety warning without its source.'); });
    if (isObj(s.review)) {
      const ro = list(s.review.options).filter(isObj), rr = ro.map((o, i) => (o.right ? i : -1)).filter((i) => i >= 0);
      if (ro.length && rr.length !== 1) P.push(p + '.review: exactly one right option (it has ' + rr.length + ').');
      else if (ro.length >= 3) positions.push([p + '.review', rr[0]]);
      const rn = words(s.review.text) + ro.reduce((a, o) => a + words(o.text), 0);
      if (rn > LIMITS.screen) P.push(p + '.review shows ' + rn + ' words; at most ' + LIMITS.screen + '.');
    }
  });
  if (positions.length >= 3) {
    const at = {};
    positions.forEach(([, i]) => { at[i] = (at[i] || 0) + 1; });
    const top = Math.max(...Object.values(at));
    if (top === positions.length) P.push('The right option is always in place ' + (positions[0][1] + 1) + ' (' + positions.map((x) => x[0]).join(', ') + '); move some.');
    else if (positions.length >= 4 && top / positions.length > 0.5) W.push('The right option sits in one place in ' + top + ' of ' + positions.length + ' questions.');
  }
  return positions.map(([p, i]) => ({ screen: p, right: i + 1 }));
}

function isolation(ctx, P, W) {
  const iso = ctx.b.isolation;
  if (!isObj(iso)) return;
  const steps = list(iso.steps).filter(isObj);
  const idx = steps.map((s) => STAGES.indexOf(s.stage));
  steps.forEach((s, i) => {
    if (!isStr(s.id)) P.push('isolation.steps[' + i + '] needs an id.');
    if (idx[i] < 0) P.push('isolation.' + s.id + ': stage "' + s.stage + '" is not one of ' + STAGES.join(', ') + '.');
    if (!srcOf(s).length) P.push('isolation.' + s.id + ' carries no source; every safety step is sourced.');
  });
  NEED_STAGES.forEach((st) => { if (!steps.some((s) => s.stage === st)) P.push('isolation is missing its "' + st + '" step.'); });
  for (let i = 1; i < idx.length; i++) if (idx[i] >= 0 && idx[i - 1] >= 0 && idx[i] < idx[i - 1]) P.push('isolation: "' + steps[i].id + '" (' + steps[i].stage + ') comes after "' + steps[i - 1].id + '" (' + steps[i - 1].stage + '); the sourced order is ' + STAGES.join(', ') + '.');
  if (!isStr(iso.asBefore)) W.push('isolation.asBefore: the one-tap line later jobs use ("Isolate and prove dead, as before").');
  if (iso.shown != null) {
    const ids = steps.map((s) => s.id);
    if (!Array.isArray(iso.shown) || iso.shown.length !== ids.length || !ids.every((x) => iso.shown.includes(x))) P.push('isolation.shown must deal every step once.');
    else if (iso.shown.every((x, i) => x === ids[i])) P.push('isolation.shown deals the steps already in order.');
  } else W.push('isolation.shown: give the dealt order so the puzzle does not start solved.');
}

function notes(ctx, P, W) {
  const b = ctx.b;
  const jobs = new Set(list(b.jobs).map((j) => j && j.id)), scr = new Set(list(b.screens).map((s) => s && s.id));
  list(b.notes).forEach((n, k) => {
    if (!isObj(n) || !isStr(n.id)) { P.push('notes[' + k + '] needs an id.'); return; }
    const p = 'notes.' + n.id;
    if (!isStr(n.title) || !isStr(n.words)) P.push(p + ' needs a title and its words.');
    if (!srcOf(n).length && !list(n.uses).length) P.push(p + ' carries no source and names no rule or quantity it rests on (src or uses).');
    list(n.uses).forEach((u) => { if (!ctx.q[u] && !ctx.tests[u]) P.push(p + ': uses "' + u + '", which is not a quantity or a test.'); });
    const trig = list(n.trigger);
    if (!trig.length) P.push(p + ' has no trigger: say when it opens.');
    trig.forEach((t) => {
      if (!isObj(t) || !TRIGGERS.includes(t.on)) { P.push(p + ': trigger ' + JSON.stringify(t) + ' must be {on: ' + TRIGGERS.join('|') + ', ...}.'); return; }
      if (t.job != null && !jobs.has(t.job)) P.push(p + ': trigger job "' + t.job + '" is not in jobs.');
      if (t.screen != null && !scr.has(t.screen)) P.push(p + ': trigger screen "' + t.screen + '" is not in screens.');
      if (t.test != null && !ctx.tests[t.test]) P.push(p + ': trigger test "' + t.test + '" is not in tests.');
      [t.a, t.b].forEach((x) => { if (x != null && !ctx.points.includes(x)) P.push(p + ': trigger point "' + x + '" is not a test point.'); });
      if (t.on === 'pieceByPiece' && !(Number.isInteger(t.count) && t.count >= 2)) P.push(p + ': pieceByPiece needs a count of 2 or more.');
      if ((t.on === 'wrong' || t.on === 'notSure') && t.screen == null) P.push(p + ': ' + t.on + ' names the screen.');
    });
  });
  list(b.jobs).forEach((j) => list(isObj(j) && j.notes).forEach((id) => { if (!list(b.notes).find((n) => n && n.id === id)) P.push('jobs.' + j.id + ': note "' + id + '" is not in notes.'); }));
}

function teachAndKeep(ctx, P, W) {
  const b = ctx.b;
  if (isObj(b.written)) Object.entries(b.written).forEach(([id, w]) => {
    const p = 'written.' + id;
    if (!isObj(w)) { P.push(p + ' must be {q, points, need, model}.'); return; }
    if (!isStr(w.q) || !isStr(w.model)) P.push(p + ' needs its question and model answer.');
    const pts = list(w.points);
    if (pts.length < 3 || pts.length > 5) P.push(p + ': three to five points make a mark scheme (it has ' + pts.length + ').');
    pts.forEach((x, i) => { if (!isObj(x) || !isStr(x.text)) P.push(p + '.points[' + i + '] must be {text, src}.'); else if (!srcOf(x).length && !x.plain) P.push(p + '.points[' + i + '] carries no source (or mark a plain-words point "plain": true).'); });
  });
  else W.push('No written: the teach-back question and its points.');
  if (isObj(b.keep)) {
    const k = b.keep;
    ['title', 'for', 'rule', 'where'].forEach((f) => { if (!isStr(k[f])) P.push('keep.' + f + ' is missing.'); });
    const traps = list(k.traps);
    if (traps.length < 1 || traps.length > 5) P.push('keep.traps: one to five traps.');
    traps.forEach((x, i) => { if (!isObj(x) || !isStr(x.text) || !srcOf(x).length) P.push('keep.traps[' + i + '] must be {text, src}, with its source.'); });
  } else W.push('No keep: the Keep this card.');
}

// Every src anywhere: a research source number, or a material page locator; never "TBS".
function sources(ctx, research, P, W) {
  const ns = research ? new Set(list(research.sources).map((s) => s && s.n)) : null;
  const urls = research ? new Set(list(research.sources).map((s) => s && s.url)) : null;
  const seen = [];
  (function visit(o, path) {
    if (Array.isArray(o)) { o.forEach((x, i) => visit(x, path + '[' + i + ']')); return; }
    if (!isObj(o)) return;
    for (const [k, v] of Object.entries(o)) {
      if (k === 'src') list(v).forEach((id) => seen.push([path, id]));
      else visit(v, path ? path + '.' + k : k);
    }
  })(ctx.b, '');
  for (const [path, id] of seen) {
    const p = (path || 'bench') + '.src';
    if (typeof id === 'string' && /^\s*TBS\b/i.test(id)) { P.push(p + ': "' + id + '" is still to be sourced. Research finds a checked quote, or the line is cut.'); continue; }
    if (typeof id === 'number') { if (!Number.isInteger(id) || id < 1) P.push(p + ': ' + id + ' is not a source number.'); else if (ns && !ns.has(id)) P.push(p + ': source ' + id + ' is not in research.json.'); continue; }
    if (typeof id === 'string' && /^material:[a-z0-9-]+#p\d+$/.test(id)) { if (urls && !urls.has(id)) P.push(p + ': "' + id + '" is not a checked source in research.json.'); continue; }
    P.push(p + ': "' + id + '" is not a source id (a research.json number, or "material:<slug>#p<page>").');
  }
  if (!research) W.push('No research.json given: source ids were not checked against it.');
}

// ---------- the whole check ----------
export function checkBench(bench, opts = {}) {
  const P = [], W = [];
  if (!isObj(bench)) return { ok: false, problems: ['The bench must be one JSON object (tools/course/BENCH.md).'], warnings: [], readings: null };
  const ctx = build(bench, P, W);
  // Every number the screens may show: quantities, their unrounded rule outputs, and every numeric reading.
  ctx.numbers = Object.values(ctx.q).filter((q) => typeof q.value === 'number').map((q) => ({ id: q.id, value: q.value, unit: q.unit || '', example: q.example === true, sayAsExample: q.sayAsExample === true }));
  Object.entries(ctx.computed).forEach(([id, c]) => { if (c.exact !== c.value) ctx.numbers.push({ id, value: c.unit === '%' ? c.exact / 100 : c.exact, unit: '' }); });
  ctx.numbers.push({ id: 'zero', value: 0, unit: 'V' });
  isolation(ctx, P, W);
  if (isObj(bench.restore) && !srcOf(bench.restore).length) P.push('restore: putting the supply back carries no source.');
  // offered tests and their live reasons
  const jobs = list(bench.jobs).filter(isObj);
  if (!jobs.length) P.push('jobs: a bench has at least one job.');
  const offered = new Set();
  jobs.forEach((j) => {
    const p = 'jobs.' + j.id;
    if (!isStr(j.id)) P.push('A job needs an id.');
    if (!isStr(j.report)) P.push(p + ' needs its report.');
    if (!list(j.faults).length) P.push(p + ' hides no fault.');
    list(j.faults).forEach((f) => { if (!ctx.faults[f]) P.push(p + ': fault "' + f + '" is not in faults.'); });
    list(j.candidates).forEach((f) => { if (!ctx.faults[f]) P.push(p + ': candidate "' + f + '" is not in faults.'); });
    const off = list(j.offer).length ? list(j.offer) : Object.keys(ctx.tests);
    off.forEach((id) => {
      const t = ctx.tests[id];
      if (!t) { P.push(p + ': offers test "' + id + '", which is not in tests.'); return; }
      offered.add(id);
      if (t._needs === 'live' && !srcOf(t.reason).length && !srcOf(j.liveReason).length) P.push(p + ' offers the live test ' + id + ' without a sourced reason.');
    });
  });
  const inst = instances(ctx, [...offered]);
  // columns: healthy, each fault, and each set of faults a job hides together
  const cols = [{ id: 'healthy', set: [] }].concat(Object.values(ctx.faults).map((f) => ({ id: f.id, set: [f] })));
  jobs.forEach((j) => { const fs = list(j.faults).map((id) => ctx.faults[id]).filter(Boolean); if (fs.length > 1) cols.push({ id: fs.map((f) => f.id).join('+'), set: fs }); });
  const rows = {}, sig = {};
  for (const i of inst) {
    rows[i.key] = cols.map((c) => { const r = reading(ctx, i, c.set); if (r.class === 'short') P.push(i.key + ' under ' + c.id + ' shorts line to neutral.'); if (r.status === 'noBand' || r.status === 'unknown') P.push(i.key + ' under ' + c.id + ': the coil is fed off its rating and no coilBand says what it does.'); return key(r); });
    cols.forEach((c, k) => { (sig[c.id] = sig[c.id] || []).push(rows[i.key][k]); });
  }
  // classes the meter can show need a label Dan reads
  const shownClasses = new Set();
  inst.forEach((i) => { const t = ctx.tests[i.test]; if (['continuity', 'voltageToN', 'voltageAcross', 'lookup'].includes(t.kind)) rows[i.key].forEach((v) => { if (!/^\d/.test(v)) shownClasses.add(v); }); });
  shownClasses.forEach((c) => { if (!isObj(bench.classes) || !isStr(bench.classes[c])) P.push('classes: the meter can read "' + c + '", which needs the words Dan sees (classes["' + c + '"]).'); });
  Object.keys(bench.classes || {}).forEach((c) => { if (/\d/.test(c)) P.push('classes: "' + c + '" holds a number; a class is words.'); });
  inst.filter((i) => ctx.tests[i.test].kind === 'play').forEach((i) => rows[i.key].forEach((v, k) => {
    const r = reading(ctx, i, cols[k].set);
    if (!isStr(r.text)) P.push(i.key + ': no words for "' + v + '" (tests.' + i.test + '.words or the check\'s words).');
  }));
  // every fault differs from healthy and from every other
  const alike = list(bench.alike).filter(isObj).map((a) => list(a.faults).slice().sort().join('|'));
  const singles = cols.filter((c) => c.set.length <= 1);
  for (let x = 0; x < singles.length; x++) for (let y = x + 1; y < singles.length; y++) {
    const A = singles[x].id, B = singles[y].id;
    if ((sig[A] || []).join('\u0001') !== (sig[B] || []).join('\u0001')) continue;
    const pair = [A, B].sort().join('|');
    if (alike.includes(pair)) W.push(A + ' and ' + B + ' read the same on every offered test (bench.alike says this is meant).');
    else if (A === 'healthy') P.push(B + ' reads like a healthy circuit on every offered test: no test can find it.');
    else P.push(A + ' and ' + B + ' read the same on every offered test: no test tells them apart.');
  }
  // routes
  const routes = {};
  jobs.forEach((j) => {
    routes[j.id] = { faults: list(j.faults), route: walk(ctx, j, j.route, 'jobs.' + j.id + '.route', true, P, W) };
    if (!list(j.route).length) P.push('jobs.' + j.id + ' has no expert route.');
    list(j.others).forEach((o, k) => {
      if (!isObj(o) || !isStr(o.id)) { P.push('jobs.' + j.id + '.others[' + k + '] needs an id.'); return; }
      (routes[j.id].others = routes[j.id].others || {})[o.id] = walk(ctx, j, o.route, 'jobs.' + j.id + '.others.' + o.id, false, P, W);
    });
  });
  // safety told, not discovered: the first job that isolates has the order screen
  const firstSafe = jobs.find((j) => list(j.route).some((s) => s && s.do === 'safe'));
  if (firstSafe && !isObj(bench.isolation)) P.push('A route isolates, but bench.isolation (the safe-isolation steps) is missing.');
  else if (firstSafe && !list(bench.screens).some((s) => s && s.kind === 'order' && s.job === firstSafe.id)) P.push('jobs.' + firstSafe.id + ' is the first to isolate, but no order screen teaches the steps there.');
  notes(ctx, P, W);
  teachAndKeep(ctx, P, W);
  const positions = screens(ctx, P, W);
  lintAll(ctx, P, W);
  sources(ctx, opts.research || null, P, W);
  list(bench.faults).forEach((f) => { if (isObj(f) && f.role !== 'distractor' && !jobs.some((j) => list(j.faults).includes(f.id))) W.push('faults.' + f.id + ' is in no job; mark it role: "distractor" if that is meant.'); });
  const quantities = {};
  Object.values(ctx.q).forEach((q) => { quantities[q.id] = Object.assign({ value: q.value, unit: q.unit, text: qText(q) }, ctx.computed[q.id] ? { rule: q.compute, inputs: q.inputs, exact: ctx.computed[q.id].exact } : srcOf(q).length ? { src: srcOf(q) } : { example: true }); });
  const table = { columns: cols.map((c) => c.id), rows };
  const readings = { quantities, jobs: routes, positions, table: { columns: table.columns.length, rows: Object.keys(rows).length } };
  return { ok: P.length === 0, problems: [...new Set(P)], warnings: [...new Set(W)], readings, table };
}

const qText = (q) => fmtNum(q.value) + (q.unit ? (q.unit === '%' ? '%' : ' ' + q.unit) : '');
const strip = (o) => JSON.parse(JSON.stringify(o, (k, v) => (k === 'note' || k === '_comment' || k === '_needs' ? undefined : v)));
const cite = (x) => srcOf(x).map((s) => (typeof s === 'number' ? '[' + s + ']' : s)).join(', ') || 'plain words';

// The teach-back and Keep this card in the lesson's own shapes (K.written, K.summary).
export function lessonParts(bench) {
  const out = {};
  if (isObj(bench.written)) {
    out.written = {};
    Object.entries(bench.written).forEach(([id, w]) => { out.written[id] = Object.assign({ q: w.q, points: list(w.points).map((p) => ({ text: p.text, cite: cite(p) })), model: w.model }, w.need != null ? { need: w.need } : {}); });
  }
  if (isObj(bench.keep)) {
    const k = bench.keep;
    out.summary = { title: k.title, for: k.for, rule: k.rule, traps: list(k.traps).map((t) => ({ text: t.text, cite: cite(t) })), where: k.where };
  }
  return out;
}

// The course's case file with this bench in it: benches.iN for the page, quantities as figures.
export function emitCase(bench, result, caseFile, iid, title) {
  const kase = isObj(caseFile) ? JSON.parse(JSON.stringify(caseFile)) : { title: title || bench.title || 'Fault bench', givens: [], assumptions: [], figures: [] };
  kase.givens = list(kase.givens); kase.assumptions = list(kase.assumptions); kase.figures = list(kase.figures);
  kase.figures = kase.figures.filter((f) => !(isObj(f) && f.lesson === iid && String(f.id).startsWith(iid + '.')));
  for (const q of list(bench.quantities)) {
    if (!isObj(q)) continue;
    const c = result.readings.quantities[q.id] || {};
    const fig = { id: iid + '.' + q.id, lesson: iid, label: String(q.label || q.id).slice(0, 80), value: q.value, unit: q.unit || '', text: qText(q) };
    if (q.compute) { fig.rule = q.compute; fig.work = q.compute + '(' + list(q.inputs).join(', ') + ') = ' + fmtNum(c.exact != null ? c.exact : q.value) + (q.unit === '%' ? '%' : q.unit ? ' ' + q.unit : '') + ', shown as ' + qText(q); }
    if (srcOf(q).length) fig.src = srcOf(q);
    if (q.example) fig.example = true;
    kase.figures.push(fig);
  }
  const b = strip(bench);
  (b.jobs || []).forEach((j) => { const r = result.readings.jobs[j.id]; if (r) { j.route = r.route; if (r.others) (j.others || []).forEach((o) => { o.route = r.others[o.id] || o.route; }); } });
  b.table = result.table;
  kase.benches = Object.assign({}, isObj(kase.benches) ? kase.benches : {}, { [iid]: b });
  return kase;
}

// ---------- the command ----------
function arg(name, dflt) { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : dflt; }
async function main() {
  const dir = arg('dir'), iid = arg('idea');
  if (!dir || !/^i\d+$/.test(iid || '')) { console.error('usage: bench.mjs --dir <course dir> --idea iN [--research research.json] [--emit-case] [--emit-lesson lesson.json] [--table out.json]'); process.exit(2); }
  const file = join(dir, iid + '.bench.json');
  const read = (f) => JSON.parse(readFileSync(f, 'utf8'));
  let bench;
  try { bench = read(file); } catch (e) { console.log(JSON.stringify({ ok: false, problems: ['could not read ' + file + ': ' + e.message], warnings: [], readings: null }, null, 2)); process.exit(1); }
  const rfile = arg('research') || (existsSync(join(dir, 'research.json')) ? join(dir, 'research.json') : null);
  const research = rfile ? read(rfile) : null;
  const r = checkBench(bench, { research });
  const extra = {};
  if (arg('table')) writeFileSync(arg('table'), JSON.stringify(r.table, null, 1) + '\n');
  if ((process.argv.includes('--emit-case') || arg('emit-lesson')) && !r.ok) r.warnings.push('Nothing written: fix the problems first.');
  else {
    let U = null;
    try { U = (await import(pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), '..', 'eval', 'prompts.mjs')).href)).loadPrompts(); } catch (e) { r.warnings.push('The app\'s validators did not load, so the case file and lesson parts were not checked by them: ' + e.message); }
    if (process.argv.includes('--emit-case')) {
      const cf = join(dir, 'case.json');
      const topic = existsSync(join(dir, 'topic.json')) ? read(join(dir, 'topic.json')) : {};
      const kase = emitCase(bench, r, existsSync(cf) ? read(cf) : null, iid, topic.title);
      const text = JSON.stringify(kase, null, 1) + '\n';
      const vp = U ? Array.from(U.validate.caseFile(kase) || []) : [];
      if (vp.length) r.problems.push(...vp.map((x) => 'case file: ' + x));
      else if (Buffer.byteLength(text) > MAX_CASE_BYTES) r.problems.push('case file would be ' + Math.round(Buffer.byteLength(text) / 1024) + ' KB; a db document stays under 250 KB.');
      else { writeFileSync(cf, text); extra.caseFile = { path: cf, bytes: Buffer.byteLength(text), figures: kase.figures.filter((f) => f.lesson === iid).length }; }
    }
    if (arg('emit-lesson')) {
      const lf = arg('emit-lesson');
      const lesson = read(lf);
      const parts = lessonParts(bench);
      const vp = U ? [].concat(parts.written ? Array.from(U.validate.written(parts.written) || []) : [], parts.summary ? Array.from(U.validate.summary(parts.summary) || []) : []) : [];
      if (vp.length) r.problems.push(...vp.map((x) => 'lesson parts: ' + x));
      else { Object.assign(lesson, parts); writeFileSync(lf, JSON.stringify(lesson, null, 1) + '\n'); extra.lesson = { path: lf, written: !!parts.written, summary: !!parts.summary }; }
    }
    r.ok = r.problems.length === 0;
  }
  console.log(JSON.stringify(Object.assign({ ok: r.ok, problems: r.problems, warnings: r.warnings, readings: r.readings }, extra), null, 2));
  process.exit(r.ok ? 0 : 1);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
