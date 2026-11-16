// The film's line 3 under the loop (slice-1a PLAN §2.2 item 26; LORE §12): "Its last candles fish from lamp to lamp." on a phone.
// A loop page (?loop=1), the film seeked through its own director (window.__gw.debug.intro('seek', t): a replay held at t,
// its words drawn at once) over line 3's window; at each time the line's box is measured against INTRO.words.band and its rows
// counted, and the frame is shot. `--out=15.2` patches INTRO.lines[2].out first (the cross-file request's timing: A5 at 17.5
// characters a second needs out ≥ 15.19); without it the built 14.85.
//   node build.mjs --dev --out=tools/out/loop-1a/dev.html
//   node tools/playtest.mjs --html=tools/out/loop-1a/dev.html --shots=tools/out/loop-1a/line3 --script=tools/tests/loop-line3.scenario.mjs --mobile [--out=15.2] [--at=14.8,15.0]
export default async function (api) {
  const { page, evalGame: g, log, shot, args } = api;
  const failures = [];
  const out = Number(args.out) > 0 ? Number(args.out) : null;
  await page.addInitScript((o) => {
    if (o) { const iv = setInterval(() => { const I = window.__gw?.data?.INTRO; if (I?.lines?.[2]) { I.lines[2].out = o; clearInterval(iv); } }, 5); }
  }, out);
  await page.goto(page.url().split('?')[0] + '?loop=1&debug=1', { waitUntil: 'load', timeout: 300000 });
  await page.waitForFunction(() => window.__gw && window.__gw.flow === 'title' && !document.getElementById('loader'), null, { timeout: 300000, polling: 250 });
  const info = await g(() => { const c = window.__gw, I = c.data.INTRO; c.render.setQuality?.('low'); return { loop: c.data.LOOP_ENABLED, text: I.text[2], line: { ...I.lines[2] }, fade: I.lineFade, band: I.words.band, maxLines: I.words.maxLines }; });
  log('line 3', JSON.stringify(info));
  if (info.loop !== true) failures.push('the build is not on the loop');
  if (info.text !== 'Its last candles fish from lamp to lamp.') failures.push(`line 3 reads "${info.text}"`);
  const cps = info.text.length / (info.line.out - info.line.at - info.fade);
  log(`A5: ${cps.toFixed(2)} characters a second after the ${info.fade} s fade-in (≤ 17.5)`);
  if (cps > 17.5) failures.push(`A5: line 3 at ${cps.toFixed(2)} characters a second (out ${info.line.out}); out ≥ ${(info.line.at + info.fade + info.text.length / 17.5).toFixed(3)} meets it`);
  const ts = typeof args.at === 'string' ? args.at.split(',').map(Number).filter(Number.isFinite) : [info.line.at + info.fade + 0.05, (info.line.at + info.line.out) / 2, info.line.out - 0.05];
  for (const t of ts) {
    const m = await g((tt) => {
      const c = window.__gw;
      c.debug.intro('seek', tt);
      const el = document.querySelector('.gw-intro-line'), sp = el?.querySelector('span');
      const r = el?.getBoundingClientRect(), s = sp?.getBoundingClientRect(), lh = sp ? parseFloat(getComputedStyle(sp).lineHeight) || parseFloat(getComputedStyle(sp).fontSize) * 1.3 : 0;
      return { t: tt, text: sp?.textContent || '', top: r ? r.top / innerHeight : null, bottom: r ? r.bottom / innerHeight : null, rows: s && lh ? Math.round(s.height / lh) : null, w: s?.width ?? null, vw: innerWidth, view: c.ui?.intro?.debug?.() ?? null };
    }, t);
    await page.waitForTimeout(400);
    await shot(`line3-${t.toFixed(2)}`);
    log(JSON.stringify({ t: m.t, text: m.text, top: m.top?.toFixed(3), bottom: m.bottom?.toFixed(3), rows: m.rows, band: m.view?.band }));
    const band = m.view?.band || { top: info.band.portrait[0], bottom: info.band.portrait[1] };
    if (t < info.line.out && m.text !== info.text) failures.push(`t ${t}: the words on screen are "${m.text}"`);
    if (m.rows !== null && m.rows > info.maxLines) failures.push(`t ${t}: line 3 takes ${m.rows} rows (at most ${info.maxLines})`);
    if (m.top !== null && (m.top < band.top - 0.01 || m.bottom > band.bottom + 0.01)) failures.push(`t ${t}: line 3's box ${m.top.toFixed(3)}–${m.bottom.toFixed(3)} leaves the words band ${band.top}–${band.bottom}`);
  }
  await g(() => window.__gw.debug.intro('stop'));
  return { failures };
}
