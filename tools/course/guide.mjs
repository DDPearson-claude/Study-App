#!/usr/bin/env node
// A steps lesson as a still guide to re-read, for its dossier chapter (Dan, 11 Oct: "a re-read guide
// with visuals, not a test to move on"). Mounts the lesson as the app does (light, reduced motion, so
// every demonstration opens finished) and walks its STEPS:
//   SHOW step -> {kind: 'show', text, svg, alt}: its sentence and its finished picture;
//   DO step   -> {kind: 'example', task, answer, why, svg?, alt?}: the puzzle as a worked example. When
//                its answer is a button on screen (or a typed answer, K.answer, typed into its field),
//                the tool presses it and Check, and keeps the solved picture; otherwise the example
//                is words only.
// A refresher lesson (lesson.summary, lesson.written; app/kit/REFRESHER.md) also gets its Keep this
// card as the guide's FIRST page, {kind: 'summary', title, for, rule, traps, where, figures:
// [{label, value}]} (case-file figures written out from <dir>/case.json), which the dossier's
// chapter opens on. Its Keep this step (kind 'summary') is left out of the walk, and a written
// step (kind 'written', written: id) becomes an example: the question and its model answer.
// The lesson is <dir>/<iid>.lesson.verified.json (else .lesson.final.json); its page is mounted with
// the lesson's written questions, summary and the case file, as the app mounts it.
// Pictures are the lesson's own <svg id="scene">, cloned with every computed style inlined, so they
// draw the same as a plain image (no script, no lesson CSS). Lesson markup *term* becomes [[term]].
// A step that shows more than its scene (drawn in HTML: a panel, a worked example's lines, a recall
// question's options, a Section A scenario and the parts carried forward) is kept as still HTML
// instead ({html}; alt: the words it shows): a copy of the step's area as it looks finished (a
// worked example's lines all shown, a demonstration at its end, a puzzle answered right), with its
// controls, inputs and its own sentence left out, no script and no handler, a canvas as its picture.
// The app draws it in a sandboxed frame on the kit's styles (53-read.js), in light, so it reads
// like the lesson and scales with the text size. A step whose STEPS entry has `read` (a sentence for
// reading it through, when its own words ask him to do something) takes that as its text.
//   node tools/course/guide.mjs --dir build/maths/fractions [--idea i3] [--app tests/out/kit-d4.html]
// Writes <dir>/<iid>.guide.json for each idea with a body.final.html (or just --idea).
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { openApp } from '../harness/page.mjs';

function arg(name, dflt) { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : dflt; }
// A line drawn point by point (M then L, as plotted curves are) rewritten with relative steps to a
// tenth of a unit: each point is rounded first and the steps taken between rounded points, so the
// error never adds up. A path with any other command is left as it is.
function compactPath(d) {
  if (!/^\s*M[-\d.\s,eL]*$/.test(d)) return d;
  const toks = d.match(/[ML]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
  const num = (v) => {
    let s = (Math.round(v * 10) / 10).toFixed(1).replace(/\.?0+$/, '');
    if (s === '-0' || s === '') s = '0';
    return s.replace(/^(-?)0\./, '$1.');
  };
  let out = '', cmd = null, mode = null, px = 0, py = 0;
  for (let i = 0; i < toks.length;) {
    if (toks[i] === 'M' || toks[i] === 'L') { cmd = toks[i++]; continue; }
    if (i + 1 >= toks.length || !cmd) return d;
    const x = Math.round(+toks[i] * 10) / 10, y = Math.round(+toks[i + 1] * 10) / 10; i += 2;
    const pair = (a, b) => { const sa = num(a), sb = num(b); return sa + (sb[0] === '-' ? '' : ' ') + sb; };
    if (cmd === 'M') { out += 'M' + pair(x, y); mode = 'M'; cmd = 'L'; }
    else { const p = pair(x - px, y - py); out += mode === 'l' ? (p[0] === '-' ? '' : ' ') + p : 'l' + p; mode = 'l'; }
    px = x; py = y;
  }
  return out;
}
function compactSvg(svg) {
  const hex = (n) => Number(n).toString(16).padStart(2, '0');
  return svg
    .replace(/ d="([^"]*)"/g, (m, d) => ' d="' + compactPath(d) + '"')
    .replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g, (m, r, g, b) => {
      const h = hex(r) + hex(g) + hex(b);
      return '#' + (h[0] === h[1] && h[2] === h[3] && h[4] === h[5] ? h[0] + h[2] + h[4] : h);
    })
    .replace(/>\s+</g, '><')
    .replace(/^(<svg\b[^>]*>)([\s\S]*)$/, (m, open, rest) => {
      // Each style used more than once becomes a class in one <style> inside the picture.
      const seen = {};
      rest.replace(/ style="([^"]*)"/g, (x, st) => { seen[st] = (seen[st] || 0) + 1; return x; });
      const names = {}, css = [];
      Object.keys(seen).filter((st) => seen[st] > 1).forEach((st, k) => { names[st] = 's' + k.toString(36); css.push('.' + names[st] + '{' + st + '}'); });
      if (!css.length) return m;
      const body = rest.replace(/(<[a-zA-Z][^>]*?) style="([^"]*)"/g, (x, tag, st) => (names[st] && !/\sclass="/.test(tag) ? tag + ' class="' + names[st] + '"' : x));
      return open + '<style>' + css.join('').replace(/&quot;/g, '"') + '</style>' + body;
    });
}
const dir = arg('dir');
if (!dir) { console.error('usage: guide.mjs --dir <build dir> [--idea iN] [--app kit.html]'); process.exit(2); }
const appFile = resolve(arg('app', 'tests/out/kit-d4.html'));
const ideas = arg('idea') ? [arg('idea')] : readdirSync(dir).filter((f) => /^i\d+\.body\.final\.html$/.test(f)).map((f) => f.split('.')[0]).sort((a, b) => +a.slice(1) - +b.slice(1));
const terms = (s) => String(s || '').replace(/\*\*([^*\n]+)\*\*/g, '\u0000$1\u0001').replace(/\*([^*\n]+)\*/g, '[[$1]]').replace(/\u0000([^\u0001]*)\u0001/g, '**$1**');
const readJson = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null);
const lessonIn = (x) => (x && x.lesson && typeof x.lesson === 'object' && 'status' in x ? x.lesson : x);
const caseFile = readJson(join(dir, 'case.json'));
// The summary card as the guide's first page: figures named by case-file id written out.
function summaryPage(sum) {
  if (!sum || typeof sum !== 'object' || !sum.title) return null;
  const all = caseFile ? [].concat(caseFile.givens || [], caseFile.figures || []) : [];
  const figures = (Array.isArray(sum.figures) ? sum.figures : []).map((f) => {
    if (typeof f !== 'string') return { label: String(f.label || ''), value: String(f.text || f.value || '') };
    const c = all.find((x) => x && x.id === f);
    if (!c) throw new Error('summary figure "' + f + '" is not in ' + join(dir, 'case.json'));
    return { label: String(c.label), value: c.text ? String(c.text) : String(c.value) + (c.unit ? ' ' + c.unit : '') };
  });
  const out = { kind: 'summary', title: sum.title, for: sum.for || '', rule: sum.rule || '', traps: (sum.traps || []).map((t) => ({ text: t.text, cite: t.cite || '' })), where: sum.where || '', figures };
  if (sum.figuresLabel || (caseFile && caseFile.title && figures.length)) out.figuresLabel = sum.figuresLabel || caseFile.title + ' so far';
  return out;
}

// Runs in the lesson frame: the scene as a standalone SVG string with computed styles inlined.
const SNAP = `(() => {
  const src = document.getElementById('scene');
  if (!src) return null;
  const props = ['fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'opacity', 'font-family', 'font-size', 'font-weight', 'font-style', 'letter-spacing', 'text-anchor', 'dominant-baseline', 'paint-order', 'visibility', 'display'];
  const keep = { 'fill-opacity': '1', 'stroke-opacity': '1', opacity: '1', 'font-style': 'normal', 'letter-spacing': 'normal', 'stroke-linecap': 'butt', 'stroke-linejoin': 'miter', 'stroke-dasharray': 'none', 'paint-order': 'normal', visibility: 'visible', 'dominant-baseline': 'auto' };
  const copy = src.cloneNode(true), a = [src].concat([...src.querySelectorAll('*')]), b = [copy].concat([...copy.querySelectorAll('*')]);
  a.forEach((el, i) => {
    const cs = getComputedStyle(el), out = b[i];
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) { out.remove(); return; }
    // Inherited settings are written only where they differ from the parent's, which keeps a picture small.
    const pcs = el === src ? null : getComputedStyle(el.parentElement);
    const style = props.filter((p) => p !== 'display' && p !== 'visibility').map((p) => [p, cs.getPropertyValue(p)])
      .filter(([p, v]) => v && keep[p] !== v && !(pcs && p !== 'opacity' && pcs.getPropertyValue(p) === v))
      .map(([p, v]) => p + ':' + v.replace(/(\d+\.\d{2})\d+/g, '$1')).join(';');
    ['class', 'style', 'tabindex', 'role', 'aria-pressed', 'aria-label', 'id', 'focusable'].forEach((k) => out.removeAttribute(k));
    if (style) out.setAttribute('style', style);
  });
  const vb = src.viewBox && src.viewBox.baseVal;
  copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  if (vb && vb.width) { copy.setAttribute('viewBox', [vb.x, vb.y, vb.width, vb.height].join(' ')); copy.setAttribute('width', vb.width); copy.setAttribute('height', vb.height); }
  copy.querySelectorAll('rect.hit, [fill="transparent"]').forEach((n) => n.remove());
  // Nothing left to see (a step whose picture is all HTML, as a refresher's recall question is): no picture.
  if (!copy.querySelector('path, rect, circle, ellipse, line, polyline, polygon, text, image, use')) return null;
  // XMLSerializer, not outerHTML: outerHTML writes &nbsp;, which a standalone SVG image cannot parse.
  const svg = new XMLSerializer().serializeToString(copy).replace(/\\s{2,}/g, ' ').replace(/(\\d+\\.\\d{2})\\d+/g, '$1');
  const bad = new DOMParser().parseFromString(svg, 'image/svg+xml').querySelector('parsererror');
  if (bad) throw new Error('picture is not valid SVG: ' + bad.textContent.slice(0, 120));
  return { svg, alt: src.getAttribute('aria-label') || '' };
})()`;

// Runs in the lesson frame (after the step is set and finished): hides what is not to be read
// (controls, inputs, the step's own words), and says whether the step shows anything beyond its
// scene, and where. -> {need, rect: {x, y, width, height} in the frame, alt}. __gRestore() undoes it.
const CAPTURE = `(([texts, show, sceneEmpty]) => {
  const norm = (x) => String(x || '').replace(/\\*\\*?|\\[\\[|\\]\\]/g, '').replace(/\\s+/g, ' ').trim().toLowerCase();
  const own = texts.map(norm).filter(Boolean);
  const CTRL = /^(check|why\\??|back|continue|next|replay|play|pause|carry on|spin|start again|done|finish( the lesson)?|show me|refresh the why|skip to the practice|another go|model answer|check my answer|show the next step|show the next line)$/i;
  const gone = [];
  const hide = (el) => { if (!el || el.dataset.gHid) return; el.dataset.gHid = el.style.getPropertyValue('display') || '-'; el.style.setProperty('display', 'none', 'important'); gone.push(el); };
  window.__gRestore = () => { gone.forEach((el) => { const v = el.dataset.gHid; delete el.dataset.gHid; if (v === '-') el.style.removeProperty('display'); else el.style.setProperty('display', v); }); };
  const seen = (el) => !!el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
  document.querySelectorAll('.k-stepper, .k-field, .k-controls, .k-answer, .k-written, .k-summary, .k-kept, input, textarea, select, .caption, .lead').forEach(hide);
  document.querySelectorAll('button').forEach((b) => { if (show || CTRL.test(b.textContent.replace(/\\s+/g, ' ').trim())) hide(b); });
  // The step's own words are the guide page's text; a step counter is the read-through's own.
  [...document.body.querySelectorAll('*')].forEach((el) => {
    if (!seen(el) || el.closest('svg')) return;
    const t = norm(el.textContent);
    if (t && (own.includes(t) || /^(step|lesson|screen) \\d+ of \\d+\\b/.test(t))) hide(el);
  });
  // A row of controls left empty goes too, so no blank band is kept.
  document.querySelectorAll('.row, .k-anim').forEach((el) => { if (seen(el) && ![...el.querySelectorAll('*')].some((x) => seen(x) && (x.children.length === 0 ? (x.textContent.trim() || /^(svg|img|canvas)$/i.test(x.tagName)) : false))) hide(el); });
  const scene = document.getElementById('scene');
  let extra = false, any = false, box = null;
  const add = (r) => { if (!r.width || !r.height) return; box = box ? { l: Math.min(box.l, r.left), t: Math.min(box.t, r.top), r: Math.max(box.r, r.right), b: Math.max(box.b, r.bottom) } : { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    const el = n.parentElement;
    if (!n.textContent.trim() || !el || !seen(el) || el.closest('script, style')) continue;
    if (el.closest('svg') && scene && scene.contains(el)) continue;
    const range = document.createRange(); range.selectNodeContents(n);
    [...range.getClientRects()].forEach(add);
    any = true;
    if (!el.closest('[aria-live], .why, button')) extra = true;
  }
  // Pictures and panels: graphics other than an empty scene, and boxes with a fill or a border.
  [...document.body.querySelectorAll('*')].forEach((el) => {
    if (!seen(el) || el.closest('script, style')) return;
    if (/^(svg|img|canvas)$/i.test(el.tagName) && !el.closest('svg svg')) { if (!(el === scene && sceneEmpty)) { add(el.getBoundingClientRect()); if (el !== scene && !el.closest('#scene')) extra = true; } return; }
    const cs = getComputedStyle(el);
    if (el.closest('svg')) return;
    if ((cs.backgroundColor && !/rgba\\(0, 0, 0, 0\\)|transparent/.test(cs.backgroundColor) && el !== document.body) || parseFloat(cs.borderTopWidth) > 0) add(el.getBoundingClientRect());
  });
  const need = !!box && (show ? (sceneEmpty ? any : extra) : (sceneEmpty ? any : extra));
  const W = document.documentElement.clientWidth, pad = 8;
  const rect = box ? { x: Math.max(0, box.l - pad), y: Math.max(0, box.t - pad), width: Math.min(W, box.r + pad) - Math.max(0, box.l - pad), height: box.b - box.t + 2 * pad } : null;
  let html = '';
  if (need) {
    // The step as still HTML: a copy of what is shown, nothing else (another step's parts, what was
    // hidden above), no script and no handler; a canvas becomes its picture. The app draws it in a
    // sandboxed frame on the kit's styles (53-read.js), never in its own page.
    const src = [document.body].concat([...document.body.querySelectorAll('*')]);
    const copy = document.body.cloneNode(true), dst = [copy].concat([...copy.querySelectorAll('*')]), drop = [];
    src.forEach((el, i) => {
      const out = dst[i], tag = el.tagName.toLowerCase();
      if (tag === 'script' || tag === 'noscript' || tag === 'template' || tag === 'iframe' || tag === 'style') { drop.push(out); return; }
      if (el !== document.body && !el.closest('svg') && !el.getClientRects().length) { drop.push(out); return; }
      if (tag === 'canvas') {
        try {
          const r = el.getBoundingClientRect(), im = document.createElement('img');
          im.src = el.toDataURL('image/png'); im.alt = el.getAttribute('aria-label') || '';
          im.setAttribute('style', 'display:block;width:' + Math.round(r.width) + 'px;height:' + Math.round(r.height) + 'px;max-width:100%');
          drop.push([out, im]);
        } catch (e) { drop.push(out); }
        return;
      }
      [...out.attributes].forEach((a) => { const n = a.name.toLowerCase(); if (n.indexOf('on') === 0 || n === 'tabindex' || n === 'data-g-hid' || n === 'contenteditable' || n === 'href') out.removeAttribute(a.name); });
      if (tag === 'button' || tag === 'a') out.setAttribute('tabindex', '-1');
    });
    drop.forEach((x) => { if (Array.isArray(x)) x[0].replaceWith(x[1]); else x.remove(); });
    html = copy.innerHTML.replace(/<!--[\\s\\S]*?-->/g, '').replace(/>\\s+</g, '><').trim();
  }
  return { need, rect, html, alt: need ? document.body.innerText.replace(/\\s+/g, ' ').trim().slice(0, 900) : '' };
})`;
// A step finished as the lesson shows it at its end: every "Show…" button pressed until none is left.
const FINISH = `(async () => {
  for (let k = 0; k < 24; k++) {
    const b = [...document.querySelectorAll('button')].find((x) => x.offsetParent !== null && !x.disabled && /^(show|reveal)\\b/i.test(x.textContent.trim()) && !/^show me$/i.test(x.textContent.trim()));
    if (!b) break;
    b.click();
    await new Promise((r) => setTimeout(r, 120));
  }
})()`;

const app = await openApp({ width: 390, height: 900, file: appFile });
await app.page.emulateMedia({ reducedMotion: 'reduce' });
await app.page.goto(app.url('#/__eval'));
for (const iid of ideas) {
  const body = readFileSync(join(dir, iid + '.body.final.html'), 'utf8');
  const lesson = lessonIn(readJson(join(dir, iid + '.lesson.verified.json')) || readJson(join(dir, iid + '.lesson.final.json')) || {});
  const ctx = { kase: caseFile, lesson: lesson.written || lesson.summary ? { written: lesson.written || null, summary: lesson.summary || null } : null };
  await app.page.evaluate(async ([html, c]) => {
    await U.rt.ready;
    document.documentElement.dataset.muTheme = 'light';
    const shell = document.getElementById('app'); if (shell) shell.style.display = 'none';
    document.querySelectorAll('.guide-host').forEach((n) => n.remove());
    const box = document.createElement('div'); box.className = 'guide-host'; box.style.cssText = 'max-width:390px;margin:0 auto';
    document.body.appendChild(box);
    window.__g = U.sandbox.mount(box, { html, kase: c.kase, lesson: c.lesson });
    await Promise.race([window.__g.ready, new Promise((r) => setTimeout(r, 8000))]);
  }, [body, ctx]);
  const frame = () => app.page.frames().find((f) => f !== app.page.mainFrame());
  // A puzzle names its answer either as `want` (the right option's words) or as `opts`, a list of
  // option keys in button order with 'right' marking the answer (the calculus lessons' way, where
  // the words are worked out at render time).
  const steps = await frame().evaluate(() => STEPS.map((d) => ({ show: !!d.show, text: d.text || '', task: d.task || d.ask || '', part: d.part || '', why: d.why || '', want: d.want, name: d.name || '', rightIndex: Array.isArray(d.opts) ? d.opts.indexOf('right') : -1, kind: d.kind || '', written: d.written || '', read: typeof d.read === 'string' ? d.read : '' })));
  // Kept as an image when the step shows more than its scene (see CAPTURE).
  async function capture(d, show, sceneEmpty) {
    const c = await frame().evaluate(CAPTURE + '(' + JSON.stringify([[d.text, d.task, d.read, d.part], show, sceneEmpty]) + ')');
    await frame().evaluate(() => window.__gRestore && window.__gRestore());
    if (!c.need || !c.html || !c.rect || c.rect.height < 12) return null;
    if (/<script|\son[a-z]+=/i.test(c.html)) throw new Error(d.name + ': its still HTML kept a script or a handler');
    return { html: c.html, alt: c.alt };
  }
  const pages = [];
  const sp = summaryPage(lesson.summary);
  if (sp) pages.push(sp);
  for (let i = 0; i < steps.length; i++) {
    const d = steps[i];
    // A refresher lesson's Keep this step is the summary page above; a written step is its
    // question with the model answer, in words.
    if (d.kind === 'summary') continue;
    if (d.kind === 'written' || d.written) {
      const w = (lesson.written || {})[d.written];
      if (w) pages.push({ kind: 'example', name: d.name, task: terms(w.q), answer: '', why: terms('A model answer: ' + w.model), svg: null, alt: '' });
      continue;
    }
    await app.page.evaluate((v) => window.__g.set('step', v), i);
    await app.page.waitForTimeout(400);
    if (d.show) {
      await frame().evaluate(FINISH);
      await app.page.waitForTimeout(300);
      const snap = await frame().evaluate(SNAP), shot = await capture(d, true, !snap);
      const page = { kind: 'show', name: d.name, text: terms(d.read || d.text), svg: shot ? null : snap && snap.svg, alt: shot ? shot.alt : snap ? snap.alt : '' };
      if (shot) page.html = shot.html;
      pages.push(page);
      continue;
    }
    let answer = typeof d.want === 'string' || typeof d.want === 'number' ? String(d.want) : '';
    let snap = null;
    if (answer || d.rightIndex >= 0) {
      // Press the button that says the answer (or the right one by position), then Check, and keep
      // the solved picture; the button's words become the example's answer.
      const f = frame();
      const pressed = await f.evaluate(([ans, idx]) => {
        const norm = (s) => String(s).replace(/\s+/g, ' ').trim();
        const CTRL = /^(Check|Why\?|Back|Continue|Play again|Start again|Done|Finish)$/;
        const all = [...document.querySelectorAll('button')].filter((b) => b.offsetParent !== null);
        let btn = ans ? all.find((b) => norm(b.textContent) === norm(ans) || norm(b.getAttribute('aria-label') || '') === norm(ans)) : null;
        if (!btn && idx >= 0) {
          const picks = [...document.querySelectorAll('#picks button')].filter((b) => b.offsetParent !== null);
          const pool = picks.length ? picks : all.filter((b) => !CTRL.test(norm(b.textContent)));
          btn = pool[idx] || null;
        }
        // A typed answer (K.answer): the answer typed into its field, then Check.
        const field = !btn && ans ? [...document.querySelectorAll('.k-answer-input')].find((x) => x.offsetParent !== null) : null;
        if (field) {
          field.value = String(ans).replace(/\s*[A-Za-zΩ°%²]+$/, '');
          field.dispatchEvent(new Event('input', { bubbles: true }));
          const check = all.find((b) => norm(b.textContent) === 'Check');
          if (check) check.click();
          return norm(ans);
        }
        if (!btn) return null;
        btn.click();
        const check = all.find((b) => norm(b.textContent) === 'Check');
        if (check) check.click();
        return norm(btn.textContent);
      }, [answer, d.rightIndex]);
      if (pressed && !answer) answer = pressed;
      // Only a picture the lesson itself marked right (S[i].res): an answer that needed more than a
      // button (colouring first, say) stays an example in words.
      if (pressed) {
        await app.page.waitForTimeout(500);
        const right = await f.evaluate((k) => { try { return S[k] && S[k].res === 'right'; } catch (e) { return false; } }, i);
        if (right) snap = await f.evaluate(SNAP);
      }
    }
    const shot = await capture(d, false, !snap);
    const ex = { kind: 'example', name: d.name, task: terms(d.read || d.task), answer, why: terms(d.why), svg: shot ? null : snap && snap.svg, alt: shot ? shot.alt : snap ? snap.alt : '' };
    if (shot) {
      ex.html = shot.html;
      // The lesson's own feedback already says why (it is in the still): not said twice.
      const flat = (x) => String(x || '').replace(/\[\[|\]\]|\*/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (ex.why && flat(shot.alt).includes(flat(ex.why))) ex.why = '';
    }
    pages.push(ex);
  }
  // The pictures carry the page's computed styles inline: the same colours in rgb() on every label.
  // Written as hex, with no spaces between tags, a guide stays under the db's document limit
  // (assemble.mjs: 250 KB) without changing what is drawn; plotted curves are written as short relative steps.
  for (const p of pages) if (p.svg) p.svg = compactSvg(p.svg);
  // A page must read as words: a figure the lesson looked up but never got prints as undefined or NaN.
  const broken = pages.filter((p) => /\bundefined\b|\bNaN\b/.test([p.text, p.task, p.answer, p.why, p.title].join(' ')));
  if (broken.length) { console.error(iid, 'pages reading "undefined" or "NaN":', broken.map((p) => p.name || p.kind).join(', ')); process.exitCode = 1; }
  // The lesson's own styles, once for every page kept as still HTML.
  const style = pages.some((p) => p.html) ? await frame().evaluate(() => [...document.body.querySelectorAll('style')].map((x) => x.textContent).join('\n').replace(/\s+/g, ' ').trim()) : '';
  const guide = style ? { v: 1, iid, style, pages } : { v: 1, iid, pages };
  const bytes = Buffer.byteLength(JSON.stringify(guide));
  writeFileSync(join(dir, iid + '.guide.json'), JSON.stringify(guide) + '\n');
  console.log(iid, 'still HTML', pages.filter((p) => p.html).length, 'bytes', pages.reduce((a, p) => a + (p.html ? p.html.length : 0), 0), 'pages', pages.length, 'summary', pages.filter((p) => p.kind === 'summary').length, 'show', pages.filter((p) => p.kind === 'show').length, 'examples with pictures', pages.filter((p) => p.kind === 'example' && p.svg).length, 'of', pages.filter((p) => p.kind === 'example').length, 'bytes', bytes);
}
if (app.errors.length) console.log('page errors:', app.errors.slice(0, 5).join('\n'));
await app.close();
