#!/usr/bin/env node
// A steps lesson as a still guide to re-read, for its dossier chapter (Dan, 11 Oct: "a re-read guide
// with visuals, not a test to move on"). Mounts the lesson as the app does (light, reduced motion, so
// every demonstration opens finished) and walks its STEPS:
//   SHOW step -> {kind: 'show', text, svg, alt}: its sentence and its finished picture;
//   DO step   -> {kind: 'example', task, answer, why, svg?, alt?}: the puzzle as a worked example. When
//                its answer is a button on screen, the tool presses it and Check, and keeps the solved
//                picture; otherwise the example is words only.
// Pictures are the lesson's own <svg id="scene">, cloned with every computed style inlined, so they
// draw the same as a plain image (no script, no lesson CSS). Lesson markup *term* becomes [[term]].
//   node tools/course/guide.mjs --dir build/maths/fractions [--idea i3] [--app tests/out/kit-d4.html]
// Writes <dir>/<iid>.guide.json for each idea with a body.final.html (or just --idea).
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { openApp } from '../harness/page.mjs';

function arg(name, dflt) { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : dflt; }
const dir = arg('dir');
if (!dir) { console.error('usage: guide.mjs --dir <build dir> [--idea iN] [--app kit.html]'); process.exit(2); }
const appFile = resolve(arg('app', 'tests/out/kit-d4.html'));
const ideas = arg('idea') ? [arg('idea')] : readdirSync(dir).filter((f) => /^i\d+\.body\.final\.html$/.test(f)).map((f) => f.split('.')[0]).sort((a, b) => +a.slice(1) - +b.slice(1));
const terms = (s) => String(s || '').replace(/\*([^*\n]+)\*/g, '[[$1]]');

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
  // XMLSerializer, not outerHTML: outerHTML writes &nbsp;, which a standalone SVG image cannot parse.
  const svg = new XMLSerializer().serializeToString(copy).replace(/\\s{2,}/g, ' ').replace(/(\\d+\\.\\d{2})\\d+/g, '$1');
  const bad = new DOMParser().parseFromString(svg, 'image/svg+xml').querySelector('parsererror');
  if (bad) throw new Error('picture is not valid SVG: ' + bad.textContent.slice(0, 120));
  return { svg, alt: src.getAttribute('aria-label') || '' };
})()`;

const app = await openApp({ width: 390, height: 900, file: appFile });
await app.page.emulateMedia({ reducedMotion: 'reduce' });
await app.page.goto(app.url('#/__eval'));
for (const iid of ideas) {
  const body = readFileSync(join(dir, iid + '.body.final.html'), 'utf8');
  await app.page.evaluate(async (html) => {
    await U.rt.ready;
    document.documentElement.dataset.muTheme = 'light';
    const shell = document.getElementById('app'); if (shell) shell.style.display = 'none';
    document.querySelectorAll('.guide-host').forEach((n) => n.remove());
    const box = document.createElement('div'); box.className = 'guide-host'; box.style.cssText = 'max-width:390px;margin:0 auto';
    document.body.appendChild(box);
    window.__g = U.sandbox.mount(box, { html });
    await Promise.race([window.__g.ready, new Promise((r) => setTimeout(r, 8000))]);
  }, body);
  const frame = () => app.page.frames().find((f) => f !== app.page.mainFrame());
  // A puzzle names its answer either as `want` (the right option's words) or as `opts`, a list of
  // option keys in button order with 'right' marking the answer (the calculus lessons' way, where
  // the words are worked out at render time).
  const steps = await frame().evaluate(() => STEPS.map((d) => ({ show: !!d.show, text: d.text || '', task: d.task || d.ask || '', why: d.why || '', want: d.want, name: d.name || '', rightIndex: Array.isArray(d.opts) ? d.opts.indexOf('right') : -1 })));
  const pages = [];
  for (let i = 0; i < steps.length; i++) {
    const d = steps[i];
    await app.page.evaluate((v) => window.__g.set('step', v), i);
    await app.page.waitForTimeout(400);
    if (d.show) {
      const snap = await frame().evaluate(SNAP);
      pages.push({ kind: 'show', name: d.name, text: terms(d.text), svg: snap && snap.svg, alt: snap ? snap.alt : '' });
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
    pages.push({ kind: 'example', name: d.name, task: terms(d.task), answer, why: terms(d.why), svg: snap && snap.svg, alt: snap ? snap.alt : '' });
  }
  const guide = { v: 1, iid, pages };
  const bytes = Buffer.byteLength(JSON.stringify(guide));
  writeFileSync(join(dir, iid + '.guide.json'), JSON.stringify(guide) + '\n');
  console.log(iid, 'pages', pages.length, 'show', pages.filter((p) => p.kind === 'show').length, 'examples with pictures', pages.filter((p) => p.kind === 'example' && p.svg).length, 'of', pages.filter((p) => p.kind === 'example').length, 'bytes', bytes);
}
if (app.errors.length) console.log('page errors:', app.errors.slice(0, 5).join('\n'));
await app.close();
