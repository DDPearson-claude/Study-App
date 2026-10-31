// Pen and paper (Dan, 31 Oct: "Build 1 2 4 8"): three helps for working a course on paper.
//
// 1. Check my working: after a problem in a problem set (54-problems.js) he photographs his paper
//    and Claude reads it (U.prompts.checkWorking, the photo through sample's images): the method
//    sound, one slip, or the wrong method, with the first line that goes wrong. Shown only where
//    sample.limits() says this view can send images. The photo is shrunk on the device first
//    (longest side 1600 px, JPEG) and kept nowhere.
// 2. New numbers: the same problems with fresh values (U.prompts.newNumbers). Claude gives each
//    problem's formula with named values, and the app trusts none of its arithmetic: the formula
//    with the old values must give the lesson's own answer (U.calc, graded to the course's
//    rounding), the new task must carry each new value, and the new answer is the app's own sum,
//    rounded as the original was. A problem that fails any check keeps the lesson's numbers.
// 3. Formula sheet (#/sheet/:tid): one page of the course's rules, formulas with their symbols
//    and units, and traps, lesson by lesson, written by Claude from the course's own lessons
//    (U.prompts.formulaSheet) when he asks, then kept (U.store.sheet: topics/{tid}/sheet/main) and
//    shown at once next time. Said plainly to be Claude's summary. Save a copy gives a standalone
//    HTML file he can print outside the app (the viewer blocks printing).
//
//   U.practice.photoPanel({title, task, answer, why, said, correct}) -> Element   (hidden without images)
//   U.practice.variants(cards) -> Promise<{[cardId]: spec}>   new-numbers specs for the cards that pass
//   U.practice.makeVariant(card, entry) -> spec | null         pure: one entry checked and computed
//   U.practice.sheetHref(tid) -> '#/sheet/<tid>'
(function () {
  'use strict';
  var h = U.h;
  function str(v) { return typeof v === 'string' ? v : v == null ? '' : String(v); }
  function isObj(v) { return !!v && typeof v === 'object' && !Array.isArray(v); }
  function clip(v, n) { var t = str(v).replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t; }
  var NB = ' ';

  // ---------- 1. Check my working ----------
  var limitsP = null;
  function imageLimits() {
    if (!limitsP) {
      limitsP = Promise.resolve(U.rt && U.rt.ready).then(function () {
        var sm = U.rt && U.rt.sample;
        return sm && typeof sm.limits === 'function' ? sm.limits() : null;
      }).then(function (l) { return l && l.images ? l.images : null; }).catch(function () { return null; });
    }
    return limitsP;
  }
  // A phone photo is several megabytes: drawn again at most 1600 px on its longest side, as JPEG.
  function shrink(file) {
    if (typeof createImageBitmap !== 'function') return Promise.resolve(file);
    return createImageBitmap(file).then(function (bm) {
      var k = Math.min(1, 1600 / Math.max(bm.width, bm.height));
      var cv = document.createElement('canvas');
      cv.width = Math.max(1, Math.round(bm.width * k)); cv.height = Math.max(1, Math.round(bm.height * k));
      cv.getContext('2d').drawImage(bm, 0, 0, cv.width, cv.height);
      if (bm.close) bm.close();
      return new Promise(function (res) { cv.toBlob(function (b) { res(b || file); }, 'image/jpeg', 0.85); });
    }).catch(function () { return file; });
  }
  var VERDICTS = {
    sound: { title: 'Your method is sound', cls: 'good' },
    slip: { title: 'One slip to put right', cls: 'mid' },
    method: { title: 'The method needs another look', cls: 'bad' },
    unclear: { title: 'That photo could not be read', cls: 'mid' },
  };
  function vWorking(r) {
    var p = [];
    if (!isObj(r)) return ['Reply with one JSON object.'];
    if (!VERDICTS[r.verdict]) p.push('verdict must be one of sound, slip, method, unclear.');
    if (typeof r.note !== 'string' || !r.note.trim()) p.push('note must be one or two sentences.');
    if (typeof r.line !== 'string') p.push('line must be a string ("" when none).');
    if (typeof r.next !== 'string') p.push('next must be a string ("" when none).');
    return p;
  }
  function photoPanel(ctx) {
    var input = h('input', { type: 'file', accept: 'image/*', capture: 'environment', class: 'visually-hidden', tabindex: '-1', 'aria-hidden': 'true' });
    var btn = h('button', { class: 'btn secondary pr-photo-btn', type: 'button' }, 'Check my working from a photo');
    var out = h('div', { class: 'pr-photo-out', 'aria-live': 'polite' });
    var box = h('div', { class: 'pr-photo', hidden: true },
      h('p', { class: 'qc-label' }, 'Your working'),
      h('p', { class: 'muted small pr-photo-lede' }, 'Photograph your paper and Claude will read your method and point to any line that goes wrong.'),
      btn, input, out);
    imageLimits().then(function (l) {
      if (!l) return;
      if (Array.isArray(l.mediaTypes) && l.mediaTypes.length) input.accept = l.mediaTypes.join(',');
      box.hidden = false;
    });
    btn.addEventListener('click', function () { input.value = ''; input.click(); });
    input.addEventListener('change', function () {
      var f = input.files && input.files[0];
      if (!f) return;
      btn.disabled = true;
      U.clear(out).appendChild(h('p', { class: 'muted small', role: 'status' }, h('span', { class: 'v-dot', 'aria-hidden': 'true' }), 'Claude is reading your working…'));
      shrink(f).then(function (img) {
        return U.ask(U.prompts.checkWorking(ctx), { tier: 'default', json: true, images: [img], label: 'check-working', schema: vWorking, priority: 'foreground' });
      }).then(function (r) {
        var v = VERDICTS[r.verdict];
        U.clear(out).appendChild(h('div', { class: 'pr-photo-res is-' + v.cls },
          h('p', { class: 'pr-photo-v' }, v.title),
          r.verdict !== 'sound' && r.verdict !== 'unclear' && r.line.trim() ? h('p', { class: 'pr-photo-line' }, h('span', { class: 'muted' }, 'Where it goes wrong: '), h('code', null, clip(r.line, 100))) : null,
          h('p', null, clip(r.note, 500)),
          r.next.trim() ? h('p', { class: 'pr-photo-next' }, clip(r.next, 200)) : null,
          h('p', { class: 'muted small' }, 'Claude, reading your photo. It is not kept.')));
        btn.textContent = 'Check another photo';
      }, function (e) {
        var code = e && e.code;
        U.clear(out).appendChild(h('p', { class: 'small pr-photo-err', role: 'status' },
          code === 'not_granted' ? 'Asking Claude is not allowed on this page, so the photo cannot be read.'
            : code === 'images_unavailable' ? 'This view cannot send photos to Claude.'
              : code === 'rate_limited' ? 'Claude is busy just now. Try again in a minute.'
                : 'The photo could not be read just now. Try again, or check your working against the lesson\'s.'));
        if (code === 'images_unavailable') box.hidden = true;
      }).then(function () { btn.disabled = false; });
    });
    return box;
  }

  // ---------- 2. New numbers ----------
  var NAME = /^[A-Za-z][A-Za-z0-9_]{0,15}$/;
  // A value as the calculator reads it: E for a power of ten (a lowercase e is the constant).
  function calcNum(v) { return '(' + String(v).replace(/e/i, 'E') + ')'; }
  function fill(formula, vars, which) {
    var bad = false;
    var t = formula.replace(/\{([A-Za-z][A-Za-z0-9_]{0,15})\}/g, function (_, n) {
      if (!vars[n]) { bad = true; return '0'; }
      return calcNum(vars[n][which]);
    });
    return bad || /[{}]/.test(t) ? null : t;
  }
  // The figure as the original printed it: its decimals, its unit (a computed value of 0 or a
  // flipped sign is no new version of the same problem).
  function asPrinted(v, f) {
    var t = Math.abs(v).toFixed(f.decimals);
    return (v < 0 ? '−' : '') + t + (f.unit ? NB + f.unit : '');
  }
  // The value as a whole number in the text ("150", not the 5 in it; "1,500" or "1 500" read as 1500).
  function numberIn(text, v) {
    var t = str(text).replace(/(\d)[,   ](?=\d{3}(?!\d))/g, '$1');
    var forms = [String(v), v.toFixed(2).replace(/\.?0+$/, ''), v.toFixed(3).replace(/\.?0+$/, '')];
    return forms.some(function (x) {
      return x && new RegExp('(^|[^\\d.])' + x.replace(/[.\-]/g, '\\$&') + '(?!\\.?\\d)').test(t);
    });
  }
  function makeVariant(card, e) {
    var sp = card && card.spec;
    if (!sp || !isObj(e) || e.skip || !U.cards || !U.calc) return null;
    var f = U.cards.figureOf(sp.answer);
    if (!f) return null;
    var vars = isObj(e.vars) ? e.vars : null, formula = str(e.formula);
    if (!vars || !formula || formula.length > 300) return null;
    var names = Object.keys(vars);
    if (!names.length || names.length > 8) return null;
    var changed = [];
    for (var i = 0; i < names.length; i++) {
      var v = vars[names[i]];
      if (!NAME.test(names[i]) || !isObj(v) || typeof v.was !== 'number' || typeof v.now !== 'number' || !isFinite(v.was) || !isFinite(v.now)) return null;
      if (formula.indexOf('{' + names[i] + '}') < 0) return null;
      if (v.now !== v.was) changed.push(v.now);
    }
    if (!changed.length) return null;
    var was = fill(formula, vars, 'was'), now = fill(formula, vars, 'now');
    if (!was || !now) return null;
    var a = U.calc.evaluate(was, { angle: 'deg' }), b = U.calc.evaluate(now, { angle: 'deg' });
    if (!a.ok || !b.ok || !isFinite(a.value) || !isFinite(b.value)) return null;
    // The formula with the old values must give the lesson's own answer, to its rounding.
    if (U.cards.gradeTyped(String(Math.round(a.value * 1e9) / 1e9), { answer: sp.answer }).state !== 'right') return null;
    var nv = b.value, ov = f.value;
    if (nv === 0 || (ov !== 0 && Math.sign(nv) !== Math.sign(ov))) return null;
    if (ov !== 0 && (Math.abs(nv / ov) > 20 || Math.abs(nv / ov) < 0.05)) return null;
    var task = clip(e.task, 900), why = str(e.why).trim();
    if (!task || task === clip(sp.q, 900) || !changed.every(function (x) { return numberIn(task, x); })) return null;
    var answer = asPrinted(nv, f);
    if (U.cards.figureOf(answer) === null || Number(Math.abs(nv).toFixed(f.decimals)) === 0) return null;
    why = why.indexOf('{answer}') >= 0 ? why.replace(/\{answer\}/g, answer) : (why ? why + ' So the answer is ' + answer + '.' : 'The answer is ' + answer + '.');
    return { q: task, answer: answer, why: clip(why, 1500), input: 'typed', fresh: true, name: sp.name };
  }
  function vNumbers(r) {
    if (!isObj(r) || !Array.isArray(r.problems)) return ['Reply with {"problems": [...]}, one entry per problem.'];
    var p = [];
    r.problems.forEach(function (x, i) { if (!isObj(x) || typeof x.id !== 'string') p.push('problems[' + i + '] needs an "id".'); });
    return p;
  }
  function variants(cards) {
    var list = (cards || []).filter(function (c) { return c && c.spec; });
    if (!list.length) return Promise.resolve({});
    var probs = list.map(function (c) { return { id: c.id, task: c.spec.q, answer: c.spec.answer, why: c.spec.why }; });
    return U.ask(U.prompts.newNumbers(probs), { tier: 'default', json: true, label: 'new-numbers', schema: vNumbers, priority: 'foreground' }).then(function (r) {
      var out = {};
      r.problems.forEach(function (e) {
        var c = list.filter(function (x) { return x.id === e.id; })[0];
        var v = c ? makeVariant(c, e) : null;
        if (v) out[c.id] = v;
      });
      return out;
    });
  }

  // ---------- 3. Formula sheet ----------
  function sheetHref(tid) { return '#/sheet/' + encodeURIComponent(tid); }
  function vSheet(r, n) {
    if (!isObj(r) || !Array.isArray(r.sections) || !r.sections.length) return ['Reply with {"sections": [...]}, one per lesson.'];
    var p = [];
    r.sections.forEach(function (sx, i) {
      var at = 'sections[' + i + ']';
      if (!isObj(sx)) { p.push(at + ' must be an object.'); return; }
      if (!Number.isInteger(sx.lesson) || sx.lesson < 1 || sx.lesson > n) p.push(at + '.lesson must be a lesson number from 1 to ' + n + '.');
      if (typeof sx.title !== 'string' || !sx.title.trim()) p.push(at + '.title is needed.');
      if (!Array.isArray(sx.rules)) p.push(at + '.rules must be a list.');
      else sx.rules.forEach(function (rl, k) { if (!isObj(rl) || typeof rl.name !== 'string' || typeof rl.formula !== 'string') p.push(at + '.rules[' + k + '] needs a name and a formula.'); });
      if (sx.traps != null && !Array.isArray(sx.traps)) p.push(at + '.traps must be a list.');
    });
    return p;
  }
  // Only what the page needs, each field cut to a sheet's length (the model's words, shown as text).
  function cleanSheet(r) {
    return r.sections.map(function (sx) {
      return {
        lesson: sx.lesson, title: clip(sx.title, 120),
        rules: (sx.rules || []).slice(0, 10).map(function (rl) { return { name: clip(rl.name, 80), formula: clip(rl.formula, 160), symbols: clip(rl.symbols, 300), note: clip(rl.note, 200) }; })
          .filter(function (rl) { return rl.name || rl.formula; }),
        traps: (sx.traps || []).slice(0, 3).map(function (t) { return clip(t, 200); }).filter(Boolean),
      };
    }).sort(function (a, b) { return a.lesson - b.lesson; });
  }
  function esc(t) { return str(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  // A standalone page to print outside the app: plain HTML, every word escaped.
  function sheetHtml(title, doc) {
    var css = 'body{font:15px/1.45 system-ui,-apple-system,"Segoe UI",Arial,sans-serif;color:#1f2937;max-width:46rem;margin:24px auto;padding:0 16px}' +
      'h1{font-size:1.5rem;margin:0 0 4px}h2{font-size:1.05rem;margin:22px 0 8px;border-bottom:1px solid #ddd;padding-bottom:4px}' +
      '.r{margin:0 0 10px}.n{font-weight:700}.f{font:600 1.05rem/1.4 ui-monospace,Menlo,Consolas,monospace;margin:2px 0}.s,.o{color:#5b6573;font-size:.9rem}' +
      '.t{color:#9f3038;font-size:.92rem;margin:4px 0}.m{color:#5b6573;font-size:.85rem;margin-top:28px}@media print{body{margin:0}h2{break-after:avoid}.r{break-inside:avoid}}';
    var body = '<h1>' + esc(title) + '</h1><p class="o">Formula sheet</p>' + doc.sections.map(function (sx) {
      return '<h2>Lesson ' + sx.lesson + ': ' + esc(sx.title) + '</h2>' + sx.rules.map(function (rl) {
        return '<div class="r"><div class="n">' + esc(rl.name) + '</div>' + (rl.formula ? '<div class="f">' + esc(rl.formula) + '</div>' : '') +
          (rl.symbols ? '<div class="s">' + esc(rl.symbols) + '</div>' : '') + (rl.note ? '<div class="o">' + esc(rl.note) + '</div>' : '') + '</div>';
      }).join('') + sx.traps.map(function (t) { return '<p class="t">Trap: ' + esc(t) + '</p>'; }).join('');
    }).join('') + '<p class="m">Written by Claude from the course\'s lessons for My University. Check anything you rely on against the lesson.</p>';
    return '<!doctype html>\n<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' +
      esc(title) + ' · Formula sheet</title><style>' + css + '</style></head><body>' + body + '</body></html>\n';
  }

  U.practice = { photoPanel: photoPanel, variants: variants, makeVariant: makeVariant, sheetHref: sheetHref, imageLimits: imageLimits, sheetHtml: sheetHtml, cleanSheet: cleanSheet, vSheet: vSheet };
  if (!U.routes) return;

  function sheetScreen(params, ctx) {
    var tid = params.tid, topicHref = '#/t/' + encodeURIComponent(tid);
    var root = h('div', { class: 'lsn rd fs' });
    ctx.view.appendChild(root);
    var back = U.lesson && U.lesson.backLink ? U.lesson.backLink(tid) : h('a', { class: 'icon-btn lsn-close lsn-back', href: topicHref, 'aria-label': 'Back to the course' }, U.icon('back'));
    root.appendChild(h('div', { class: 'lsn-bar rd-bar' }, back, h('span', { class: 'rd-bar-label' }, 'Formula sheet'), U.calcSheet ? U.calcSheet.button('rd-calc') : h('span')));
    var body = h('div', { class: 'rd-body fs-body' }, h('p', { class: 'muted rd-wait', role: 'status' }, 'Opening the formula sheet…'));
    root.appendChild(body);
    var st = { topic: null, sheet: null, busy: false };
    U.rt.ready.then(function () { return Promise.all([U.store.topic.get(tid), U.store.sheet.get(tid).catch(function () { return null; })]); }).then(function (r) {
      if (!ctx.alive()) return;
      st.topic = r[0]; st.sheet = r[1];
      if (!st.topic) { U.replaceHash(topicHref); return; }
      U.setTitle((st.topic.title || 'Course') + ' · Formula sheet');
      draw();
    }).catch(function (e) { if (ctx.alive()) U.fail(body, e); });

    function head() {
      return h('header', { class: 'lsn-head rd-head' },
        h('p', { class: 'eyebrow lsn-eb is-filled' }, h('span', { class: 'lsn-eb-topic' }, st.topic.title || 'Course'), h('span', { class: 'lsn-eb-n' }, 'Formula sheet')),
        h('h1', { class: 'lsn-title', tabindex: '-1' }, 'Formula sheet'));
    }
    function draw(note) {
      U.clear(body);
      body.appendChild(head());
      var doc = st.sheet && Array.isArray(st.sheet.sections) ? st.sheet : null;
      if (!doc) {
        body.appendChild(h('section', { class: 'fs-make' },
          h('p', null, 'One page of this course\'s rules, formulas with their symbols and units, and the traps each lesson warns about, lesson by lesson, to keep beside your paper.'),
          h('p', { class: 'muted small' }, 'Claude writes it once from the course\'s own lessons, and it is kept here for next time.'),
          note ? h('p', { class: 'small pr-photo-err', role: 'status' }, note) : null,
          h('button', { class: 'btn lsn-main', type: 'button', on: { click: make } }, 'Write the formula sheet')));
        return;
      }
      body.appendChild(h('div', { class: 'fs-sheet' }, doc.sections.map(function (sx) {
        return h('section', { class: 'fs-sec' },
          h('h2', { class: 'fs-h' }, h('span', { class: 'fs-n' }, 'Lesson ' + sx.lesson), sx.title),
          h('ul', { class: 'fs-rules' }, sx.rules.map(function (rl) {
            return h('li', { class: 'fs-rule' },
              h('p', { class: 'fs-name' }, rl.name),
              rl.formula ? h('p', { class: 'fs-f' }, rl.formula) : null,
              rl.symbols ? h('p', { class: 'fs-sym' }, rl.symbols) : null,
              rl.note ? h('p', { class: 'fs-note' }, rl.note) : null);
          })),
          sx.traps.length ? h('div', { class: 'fs-traps' }, h('p', { class: 'qc-label bad' }, 'Traps'), sx.traps.map(function (t) { return h('p', { class: 'fs-trap' }, t); })) : null);
      })));
      body.appendChild(h('section', { class: 'rd-end fs-end' },
        h('p', { class: 'muted small' }, 'Written by Claude from this course\'s lessons' + (doc.madeAt && U.views && U.views.day ? ' on ' + U.views.day(doc.madeAt) : '') + (doc.lessons ? ', covering ' + doc.lessons + (doc.lessons === 1 ? ' lesson' : ' lessons') : '') + '. Check anything you rely on against the lesson.'),
        note ? h('p', { class: 'small pr-photo-err', role: 'status' }, note) : null,
        h('div', { class: 'pb-go' },
          h('button', { class: 'btn lsn-main', type: 'button', on: { click: save } }, 'Save a copy to print'),
          h('button', { class: 'btn secondary', type: 'button', on: { click: make } }, 'Write it again')),
        h('a', { class: 'linkish', href: topicHref }, 'Back to the course')));
    }
    function save() { U.saveFile(U.slug(st.topic.title || 'course') + '-formula-sheet.html', sheetHtml(st.topic.title || 'Course', st.sheet), 'text/html'); }
    function make() {
      if (st.busy) return;
      st.busy = true;
      U.clear(body);
      body.appendChild(head());
      body.appendChild(h('p', { class: 'muted', role: 'status' }, h('span', { class: 'v-dot', 'aria-hidden': 'true' }), 'Claude is reading the lessons and writing your formula sheet. This takes a minute or so.'));
      var ideas = Array.isArray(st.topic.ideas) ? st.topic.ideas : [];
      Promise.all(ideas.map(function (idea) { return U.store.lesson.get(tid, idea.id).catch(function () { return null; }); })).then(function (docs) {
        var lessons = [];
        docs.forEach(function (d, k) {
          var L = d && d.status === 'ready' && d.lesson;
          if (!L) return;
          lessons.push({ n: k + 1, title: str(L.title || ideas[k].title), explain: str(L.explain && L.explain.text), practice: str(L.practice && L.practice.text), examples: [] });
        });
        if (!lessons.length) throw { code: 'empty', message: 'No lessons of this course are ready yet.' };
        var n = ideas.length;
        return U.ask(U.prompts.formulaSheet({ title: st.topic.title, lessons: lessons }), {
          tier: 'default', json: true, label: 'formula-sheet', priority: 'foreground', schema: function (r) { return vSheet(r, n); },
        }).then(function (r) {
          var doc = { v: 1, title: str(st.topic.title), sections: cleanSheet(r), madeAt: U.now(), lessons: lessons.length };
          st.sheet = doc;
          return U.store.sheet.set(tid, U.clone(doc)).catch(function () { /* shown now; kept next time if the save goes through */ });
        });
      }).then(function () {
        st.busy = false;
        if (ctx.alive()) draw();
      }, function (e) {
        st.busy = false;
        if (!ctx.alive()) return;
        var code = e && e.code;
        draw(code === 'empty' ? e.message : code === 'not_granted' ? 'Asking Claude is not allowed on this page, so the sheet cannot be written.'
          : code === 'rate_limited' ? 'Claude is busy just now. Try again in a minute.' : 'The formula sheet could not be written just now. Try again in a moment.');
      });
    }
  }
  // #/sheet/:tid, not #/t/:tid/sheet: that address is a lesson's (#/t/:tid/:iid, registered first).
  U.routes.add('#/sheet/:tid', sheetScreen, { focus: true, title: 'Formula sheet', screen: 'lesson' });
})();
