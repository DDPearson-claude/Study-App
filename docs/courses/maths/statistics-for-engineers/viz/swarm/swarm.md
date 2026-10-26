# Swarm: Beads drawn the way Dan's chart draws its data

Dan asked (26 Oct) "Can we visualise our data like this?" of a beeswarm. This adds to `dataviz.md`, which binds but for what follows (pegs, identity,
drag, counted shares, tip and shelf all stay). Prototype `viz/swarm/proto.html`: five self-tests pass at 340, 720, 1040 px, both themes; 149.5 KiB.

## What changes from dataviz.md
- **The rise**: a pour lands on the pile, holds 0.42 s, then rises into the swarm (`B.rise`) from the mean out (0.75 s a bead, 6% overshoot; a press
  adds a soft chime). Other moves go straight to the swarm. Only a landing on the beam splashes; one in mid-air sends a faint ripple.
- **It hugs the beam**: y 232 is the axis; a swarm keeps to y TOPS..227 (70 under a field or brackets, 84 offset, 58 under the ruler, 56 else), its line
  `max(TOPS + up, 225 − R)`, R its reach below (or the bell's peak). The ringed reading goes only above, so the line holds still in a drag.
- **Bead size** (`fitSw`): `r = min(0.52 w, (half − c) ÷ (2c + 1))`, w the column (12.3 units: r 6.4 at most), c = ⌈(k − 1) ÷ 2⌉ for the tallest column
  k; too tall, `B.swarm` shrinks every bead. With the field the narrowest spread sets it (r 4.15), so halving the error shows the swarm taller. A K.check
  walks 60 batches at every setting: no two beads touch, all inside their room, r at least 3.2 (3.26 at least in a 100-batch scratch run).
- **Mean and median**: dashed through the swarm (`bd-mean` ink, `bd-medl` teal), the value bold above ("mean **27.002** V"), after the overshoot.

## The swarm layout rule
- **Readings on the meter's marks (0.01 V) pack as a honeycomb** (`B.comb`): each column's beads take the free places nearest the line, alternately
  above and below (an odd one to the side with fewer so far), and every other column sits half a place up, so neighbours nest. The half place goes to
  whichever columns leave the tallest reach least. Legal while r ≤ 0.536 w, so the cap 0.52 w keeps every bead a unit clear by construction.
- **Other readings** (resistance, means of 2 or 4) go best first (`B.swarmY`): each round the bead whose closest free spot is nearest the line takes it.
  The ringed reading goes last, 6 bigger, only above. A coarse meter's wide columns still stack in bricks.

## The fade (`B.fade`, `B.paint`)
- z SDs from the mean (by factors, of the logs): `cat2` below, `cat1` above, the role itself from 2.6 SD. Light mixes with the page (26% at the mean),
  dark with a neutral grey, ink 30% on the page (14%). Deepest 3.3 and 4.4:1 light, 4.2 and 4.5:1 dark; faintest 1.35 and 1.4:1 light, 2.5 and 2.6:1
  dark (a K.check). The time view's small dots keep 40% (1.6:1). Never `warn`: out of tolerance still shivers and turns warn over it.
- **A deliberate exception to KIT.md**: cat1 and cat2 carry meaning here (below or above the mean); the kit keeps them for telling equal things apart.
  Dan's reference does it, the brief asked for it, and the key says it ("lower ●●●●●● higher · fainter is nearer the mean"). Reviewers: not a slip.
- **Taking the colour**: the navy dims to a ghost, then the colour wells up from the centre in a wash of itself; a swell of 8%; never a ring.

## The bell (`B.mirror`) and the overflow pile (`B.ends`, `B.heap`)
- The outline is read from the beads' own places (the reach within ¾ of a column) and relaxes into the mirrored normal curve. Thinner than a bead, it
  opens round any bead there, so it never runs through one. It lies under the beads (`swCurve` in `G.under`): a taller bead sits over it.
- A reading past an end goes to a pile 24 wide past a 9-unit gap, two across, never clipped, named under it as in the reference ("… 27.10 over"; by
  factors the scale numbers 800). No Pile | Swarm choice: every pour lands as a pile and rises, so each batch shows they are the same readings.

## The five lessons
- **1. Middle and spread** (steps 1-3): pour, pile, rise into a honeycomb on the beam, the mean dashed; halved error, half as wide and twice as tall; a
  far slip lands "over". Resistance by factors is a round swarm about its median; on the even scale it leans, the mean right of the median.
- **2. Trusting a reading** (4-5): means of 2 or 4 fall anywhere yet pack into a smooth swarm round where the meter centres; a coarse meter stacks bricks.
- **3. The normal curve** (6-7): the outline relaxes into the mirrored bell under the beads; the ringed reading rides the top, met by the ruler's pointer.
- **4. Trends over time** (8-9): the swarm tips into a violin and peels off in time order as small dots, keeping its colours, so a drift shows.
  **5. Reliability** (10-11) is unchanged: the fade is for readings about a mean.

## Copy this code
Paste each block after its shared counterpart, unchanged. Lesson side: `layout()`, `zOf`, `fitSw`, `kOf`/`kStep`, `zAt`, the restack (with `.f`),
`B.blooms(beads)`, `swCurve`, the marks in `paint()`, `ovAx`/`ovLab`, `drawTicks`, `fkDots`, `B.chime`.

```css
  /* ==== Swarm: the look's additions (swarm.md, "Copy this code"). Paste unchanged, after the shared look. ==== */
  /* The median's line (the mean keeps .bd-mean); the overflow piles' own short axes; a value the drawing sets bold, which has no tile and hides while Dan answers a check. */
  .bd-scene .bd-medl { stroke: var(--k-accent); stroke-width: 1.6; stroke-dasharray: 1.5 3; stroke-linecap: round; } .bd-scene .bd-ovax { stroke: var(--k-ink); stroke-width: 2.2; stroke-linecap: round; } :root.k-quiz .bd-scene .bd-val { visibility: hidden; }
  /* The colour key under the drawing: a row of beads, deepest to faintest to deepest, between its two words. */ .bd-fig { max-width: 32rem; margin-inline: auto; } .bd-key { justify-content: center; margin: 2px 0 0; } .bd-key svg { display: block; width: 5.4rem; height: auto; }
  .bd-key .bd-kb { stroke: var(--k-bg); stroke-width: 1.2; } .bd-key > span { white-space: nowrap; }
  /* ==== end of the swarm's look ==== */
```

```js
  // ==== Swarm: the shared additions (swarm.md, "Copy this code"). Paste unchanged, after the shared motion. ====
  // Readings as a beeswarm: each bead at its value, packed about one line, coloured by its distance from the mean; past an end, in a pile past a
  // gap. A pour lands as a pile, then rises into it (0.75 s a bead). Beads sit one unit apart; a ringed one keeps 6 more.
  (() => { B.T.rise = 0.75; B.T.dt = 0.032; B.GAP = 1; B.RING = 6;
    // Offsets from the line, best first: each round the bead of ids whose closest free spot is nearest the line takes it (leftmost on a tie); a tie
    // of sides to the one with fewer neighbours; a bigger, ringed bead only above. ys, on: beads placed already.
    B.swarmY = (xs, rs, ids, ys, on) => { ys = ys || []; on = on || []; const r0 = Math.min(...rs), dd = (i, j) => rs[i] + rs[j] + B.GAP, sp = {}, left = ids.slice();
      const find = (i) => { const nb = on.filter((j) => Math.abs(xs[j] - xs[i]) < dd(i, j)), c = [0]; let s = 0;
        nb.forEach((j) => { const h = Math.sqrt(dd(i, j) ** 2 - (xs[j] - xs[i]) ** 2); c.push(ys[j] - h, ys[j] + h); s += Math.sign(ys[j]); });
        const up = s ? s > 0 : i % 2 === 0; c.sort((a, b) => { const k = Math.abs(a) - Math.abs(b); return Math.abs(k) > 1e-6 ? k : up ? a - b : b - a; });
        return c.find((y) => (rs[i] <= r0 || y < 1e-9) && nb.every((j) => (xs[j] - xs[i]) ** 2 + (ys[j] - y) ** 2 >= dd(i, j) ** 2 - 1e-6)); }; left.forEach((i) => { sp[i] = find(i); });
      while (left.length) { let m = 0; left.forEach((i, k) => { const q = Math.abs(sp[i]) - Math.abs(sp[left[m]]); if (q < -1e-6 || (q < 1e-6 && xs[i] < xs[left[m]])) m = k; });
        const i = left.splice(m, 1)[0]; ys[i] = sp[i]; on.push(i); left.forEach((j) => { if ((xs[j] - xs[i]) ** 2 + (sp[j] - ys[i]) ** 2 < dd(i, j) ** 2 - 1e-6) sp[j] = find(j); }); } return ys; };
    // Readings on a meter's marks fall in columns, so they pack as a honeycomb: each column's beads take the places nearest the line, alternately
    // above and below (an odd one to the side with fewer), every other column half a place up (legal while p <= w / 0.866), whichever way // leaves the tallest reach least. -> ys
    B.comb = (col, ids, p) => { const by = {}, ys = []; ids.forEach((i) => { (by[col[i]] = by[col[i]] || []).push(i); }); const cs = Object.keys(by).map(Number).sort((a, b) => a - b);
      const cost = (ph) => Math.max(0, ...cs.map((c) => ((c + ph) % 2 ? Math.ceil(by[c].length / 2) - 0.5 : Math.ceil((by[c].length - 1) / 2)))), ph = cost(1) < cost(0) ? 1 : 0; let bal = 0;
      cs.forEach((c) => { const h = (c + ph) % 2, sd = bal < 0 ? 1 : bal > 0 ? -1 : c % 2 ? 1 : -1;
        by[c].forEach((i, j) => { const y = h ? (j % 2 ? -sd : sd) * (Math.floor(j / 2) + 0.5) : (j % 2 ? sd : -sd) * Math.ceil(j / 2); ys[i] = y * p; bal += Math.sign(y); }); }); return ys; };
    B.alt = (k) => (k % 2 ? -(k + 1) / 2 : k / 2);   // row k of a stack mirrored about a line: 0 on it, then above, below, above...
    // The overflow piles of a scale: w wide, past a gap at each end. rows(): ids stacked `per` across about x, row j at y(j).
    B.ends = (sc, w, gap) => ({ lo: { x0: sc.a0 - gap - w, x1: sc.a0 - gap, dir: -1 }, hi: { x0: sc.a1 + gap, x1: sc.a1 + gap + w, dir: 1 }, a0: sc.a0, a1: sc.a1 });
    const rows = (pos, ids, x, w, p, r, y) => { const per = Math.max(1, Math.floor((w + B.GAP) / p)); ids.forEach((i, j) => { const row = Math.floor(j / per), n = Math.min(per, ids.length - row * per); pos[i] = { x: x + (j % per - (n - 1) / 2) * p, y: y(row), r }; }); };
    // The swarm of vs on sc about y = line, `half` room each way: on the meter's marks a honeycomb, else best first, the ringed one last; a coarse
    // meter's wide column in bricks; past an end, in its pile. Too tall, every bead shrinks. -> {r, pitch, line, pos, ext, over, cnt, per}
    B.swarm = (vs, sc, line, half, fit, ends, ring) => { const w = Math.abs(sc.w), ord = vs.map((v, i) => i).filter((i) => i !== ring).sort((a, b) => sc.at(vs[a]) - sc.at(vs[b]) || a - b).concat(ring >= 0 ? [ring] : []);
      const lay = (r) => { const p = 2 * r + B.GAP, pos = new Array(vs.length), over = { lo: [], hi: [] }, main = [], cnt = {}, brick = !!sc.col && w + B.GAP >= 2 * p;
        ord.forEach((i) => { const o = sc.off(vs[i]); (o < 0 ? over.lo : o > 0 ? over.hi : main).push(i); if (!o && sc.col) cnt[sc.col(vs[i])] = (cnt[sc.col(vs[i])] || 0) + 1; });
        if (brick) { const by = {}; main.forEach((i) => { const c = sc.col(vs[i]); (by[c] = by[c] || []).push(i); });
          Object.keys(by).forEach((c) => { const m = sc.mid(+c), a = Math.max(m - w / 2, ends.a0), b = Math.min(m + w / 2, ends.a1); rows(pos, by[c], (a + b) / 2, b - a, p, r, (k) => line + B.alt(k) * p); }); }
        else { const xs = vs.map((v) => sc.at(v)), rs = vs.map((v, i) => (i === ring ? r + B.RING : r)), ids = main.filter((i) => i !== ring), col = vs.map((v) => sc.col(v));
          const comb = !!sc.col && 0.866 * p <= w + 1e-6 && ids.every((i) => Math.abs(xs[i] - sc.mid(col[i])) < 0.01 * w), on = comb ? ids.slice() : [], ys = comb ? B.comb(col, ids, p) : B.swarmY(xs, rs, ids, [], on);
          if (main.includes(ring)) B.swarmY(xs, rs, [ring], ys, on); main.forEach((i) => { pos[i] = { x: xs[i], y: line + ys[i], r }; }); }
        ['lo', 'hi'].forEach((k) => rows(pos, over[k], (ends[k].x0 + ends[k].x1) / 2, ends[k].x1 - ends[k].x0, p, r, (j) => line + B.alt(j) * p)); let ext = 0; pos.forEach((q) => { ext = Math.max(ext, Math.abs(q.y - line) + q.r); });
        return { r, pitch: p, line, pos, ext, over, cnt, per: brick ? Math.floor((w + B.GAP) / p) : 1 }; };
      const s = lay(fit.r); if (s.ext <= half + 1e-6) return s; let lo = 1, hi = fit.r; for (let k = 0; k < 9; k++) { const m = (lo + hi) / 2; if (lay(m).ext <= half + 1e-6) lo = m; else hi = m; } return lay(lo); };
    // The pile a pour lands on: B.stack's, a reading past an end in that end's pile.
    B.heap = (vs, sc, base, top, fit, ends) => { const on = vs.map((v, i) => i).filter((i) => !sc.off(vs[i])), st = B.stack(on.map((i) => vs[i]), sc, base, top, fit), pos = new Array(vs.length); on.forEach((i, j) => { pos[i] = st.pos[j]; });
      ['lo', 'hi'].forEach((k) => { const e = ends[k]; rows(pos, vs.map((v, i) => i).filter((i) => sc.off(vs[i]) === e.dir), (e.x0 + e.x1) / 2, e.x1 - e.x0, st.pitch, st.r, (j) => base - 1.5 - st.r - j * st.pitch); }); return Object.assign({}, st, { pos }); };
    // The fade: z SDs from the mean, cat2 below and cat1 above, mixed with the page (26% at the mean) or on the dark page a neutral grey (14%), the
    // role itself from 2.6 SD. lo: another share at the mean (small dots).
    B.fade = (z, lo) => { const dk = K.theme.dark; lo = lo == null ? (dk ? 14 : 26) : lo; return 'color-mix(in srgb, var(--k-' + (z < 0 ? 'cat2' : 'cat1') + ') ' + Math.round(lo + (100 - lo) * Math.min(1, Math.abs(z) / 2.6)) + '%, ' + (dk ? 'color-mix(in srgb, var(--k-ink) 30%, var(--k-bg))' : 'var(--k-bg)') + ')'; };
    // B.blooms: a disc under each glint. B.paint: B.draw, k 0..1 of the way to its colour: the old body dims to a ghost (k 0.12 to 0.27), then the
    // colour wells up from the centre in a faint wash of itself (to 0.52; never two hues at once), then a swell of 8% and back; a warning mixes in.
    B.blooms = (bs) => bs.forEach((b) => { b.f = K.svg('circle', { 'pointer-events': 'none' }); b.g.before(b.f); });
    B.paint = (b, d, warn, floor, z, k) => { const s = k > 0 && k < 1 ? 1 + 0.08 * Math.sin(Math.PI * B.c01((k - 0.6) / 0.4)) : 1, u = B.c01((k - 0.27) / 0.25), on = d && d.a > 0.002 && !d.hollow && k > 0.002;
      B.draw(b, d && Object.assign({}, d, { r: d.r * s }), warn, floor); const f = B.fade(z, d && d.r < 3 ? (K.theme.dark ? 24 : 40) : null), c = on && (warn > 0 ? 'color-mix(in srgb, var(--k-warn) ' + Math.round(100 * Math.min(1, warn)) + '%, ' + f + ')' : f);
      if (B.vis(b.f, on && u > 0 && u < 1 ? Math.min(1, d.a) : 0)) { B.set(b.f, { cx: d.x, cy: d.y, r: Math.max(0, d.r * s - 0.6) * K.ease(u) }); b.f.style.fill = c; }
      if (!on) return; const a = Math.min(1, d.a); if (u > 0) { b.c.style.fill = c; if (u < 1) b.c.style.opacity = (a * (0.15 + 0.85 * u)).toFixed(3); } else b.c.style.opacity = (a * (1 - 0.85 * B.c01((k - 0.12) / 0.15))).toFixed(3); b.g.style.opacity = (a * B.lerp(1, 0.2 + 0.8 * Math.min(1, Math.max(warn, Math.abs(z) / 2.6)), k)).toFixed(3); };
    // The swarm's outline, mirrored, v0..v1: the reach of the beads within 3/4 of a column, relaxing 0..1 into expect(v) beads; thinner than a bead,
    // it opens round any bead there (drawn under the beads, so a taller one sits over it). -> {up, dn, area}.
    B.mirror = (sc, sw, expect, v0, v1, relax) => { const a = sc.at(v0), b = sc.at(v1), w = Math.abs(sc.w), n = Math.max(1, Math.ceil(Math.abs(b - a) / (w / 6))), per = sw.per || 1, U = [], D = [];
      const on = sw.pos.filter((q) => q && q.x >= Math.min(sc.a0, sc.a1) && q.x <= Math.max(sc.a0, sc.a1)); for (let k = 0; k <= n; k++) { const x = B.lerp(a, b, k / n); let sky = 0, ring = 0;
        on.forEach((q) => { const dx = Math.abs(q.x - x), dy = Math.abs(q.y - sw.line), c = q.r + 0.8; if (dx < 0.75 * w) sky = Math.max(sky, dy + c); if (dx < c) ring = Math.max(ring, dy + Math.sqrt(c * c - dx * dx)); });
        const bell = expect(sc.val(x)) / per * sw.pitch / 2, h = B.lerp(sky, Math.max(bell, B.lerp(bell, ring, B.c01(2 - 2 * bell / sw.pitch))), relax); U.push(B.r2(x) + ' ' + B.r2(sw.line - h)); D.push(B.r2(x) + ' ' + B.r2(sw.line + h)); }
      return { up: 'M' + U.join('L'), dn: 'M' + D.join('L'), area: 'M' + U.join('L') + 'L' + D.reverse().join('L') + 'Z' }; };
    // The tip's hinge: about the line at ref onto a spine at x1 (value up the page, k), its depth squeezed to `room`.
    B.swarmAnchor = (sw, sc, sv, ref, spine, room) => { const k = Math.abs(sv.w / sc.w); return { x0: sc.at(ref), y0: sw.line, x1: spine, y1: sv.at(ref), k, kh: Math.min(k, room / 2 / Math.max(1, sw.ext)) }; };
    // A pour's pile holds 0.42 s, then rises in a wave from `mid` (the farthest 0.7 s later), 6% overshoot. B.risen -> [bead, k]. B.chime: from a press.
    B.rise = (scene, heap, mid) => { const t0 = Math.max(...scene.land) + 0.42, wave = Math.max(0.35, Math.min(0.7, 4.9 - B.T.rise - t0)), far = Math.max(1, ...heap.map((q) => Math.abs(q.x - mid))); scene.rise = heap.map((q) => t0 + wave * Math.abs(q.x - mid) / far); scene.end = Math.max(scene.end, Math.max(...scene.rise) + B.T.rise); return scene; };
    B.risen = (T, scene, i, q, heap, sw) => { const u = scene.rise ? (T - scene.rise[i]) / B.T.rise : 0; return u <= 0 ? [q, 0] : [B.hop(heap[i], sw[i], u, 0, B.backOut), B.c01(u)]; };
    B.chime = (scene) => K.sound.chord([523, 587, 659, 784, 880, 1047], { at: Math.min(...scene.rise), stagger: 0.14, dur: 0.12, type: 'sine', gain: 0.4 });
  })();
  // ==== end of the swarm's additions ====
```
