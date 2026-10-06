// Book (#/book): Dan's own words. For every idea he has explained back ("say it back" in a
// lesson), it shows his first explanation and his latest, with dates, so he can see how his
// understanding grew, plus the questions he asked Claude. Exports as Markdown or JSON.
// Reads progress.ideas[iid].say and progress.questions, each either a keyed map
// ({[key]: {text, at, verdict}} / {[key]: {q, iid, at}}) or, in older data, an array; both are read
// with U.list, oldest first (see 20-store.js for the shapes).
(function () {
  'use strict';
  var V = U.views;

  // Collect topics with at least one say-it-back answer or question, ideas in path order.
  function collect(topics, progress) {
    return topics.map(function (t) {
      var pr = progress[t.id] || {}, pi = pr.ideas || {};
      var all = Array.isArray(t.ideas) ? t.ideas : [];
      var ideas = all.map(function (idea) {
        var say = U.list(pi[idea.id] && pi[idea.id].say).filter(function (s) { return String(s.text || '').trim(); });
        return say.length ? { id: idea.id, title: idea.title, say: say } : null;
      }).filter(Boolean);
      var questions = U.list(pr.questions).filter(function (q) { return String(q.q || '').trim(); }).map(function (q) {
        var idea = q.iid ? all.filter(function (i) { return i.id === q.iid; })[0] : null;
        return { q: String(q.q).trim(), iid: q.iid || null, idea: idea ? idea.title : null, at: q.at || null };
      });
      return ideas.length || questions.length ? { id: t.id, title: t.title || t.query, topic: t, ideas: ideas, questions: questions } : null;
    }).filter(Boolean);
  }

  function longDate(iso) {
    var d = new Date(iso);
    return isNaN(d) ? '' : d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function toMarkdown(book) {
    var out = ['# My Book', '', '_Your own explanations, exported from My University on ' + longDate(U.now()) + '._', ''];
    book.forEach(function (t) {
      out.push('## ' + t.title, '');
      t.ideas.forEach(function (i) {
        var first = i.say[0], latest = i.say[i.say.length - 1];
        out.push('### ' + i.title, '');
        out.push('**' + (i.say.length > 1 ? 'First' : 'In my words') + (first.at ? ', ' + longDate(first.at) : '') + '**', '');
        out.push(quote(first.text), '');
        if (i.say.length > 1) {
          out.push('**Latest' + (latest.at ? ', ' + longDate(latest.at) : '') + '**', '');
          out.push(quote(latest.text), '');
        }
      });
      if (t.questions.length) {
        out.push('### Questions I asked', '');
        t.questions.forEach(function (q) { out.push('- ' + q.q.replace(/\s+/g, ' ') + (q.at ? ' _(' + longDate(q.at) + ')_' : '')); });
        out.push('');
      }
    });
    return out.join('\n');
  }
  function quote(text) { return String(text).trim().split(/\n/).map(function (l) { return '> ' + l; }).join('\n'); }

  function toJson(book) {
    return JSON.stringify({
      app: 'My University', kind: 'book', version: 1, exportedAt: U.now(),
      topics: book.map(function (t) {
        return { id: t.id, title: t.title, ideas: t.ideas.map(function (i) {
          return { id: i.id, title: i.title, say: i.say.map(function (s) { return { text: s.text, at: s.at || null, verdict: s.verdict || null }; }) };
        }), questions: t.questions.map(function (q) { return { q: q.q, iid: q.iid, at: q.at }; }) };
      }),
    }, null, 2);
  }

  function entry(t, i) {
    var first = i.say[0], latest = i.say[i.say.length - 1], many = i.say.length > 1;
    function words(label, s, cls) {
      return U.h('div', { class: 'book-words ' + cls },
        U.h('p', { class: 'book-when' }, U.h('span', null, label), s.at ? U.h('span', { class: 'book-date' }, ' · ' + V.day(s.at)) : null),
        U.h('p', { class: 'book-text' }, String(s.text).trim()));
    }
    // Only a first try that has a later one beside it is drawn quieter; a lone explanation is
    // his current one and reads at full strength.
    return U.h('article', { class: 'book-entry' },
      U.h('h3', { class: 'book-idea' }, U.h('a', { href: '#/t/' + encodeURIComponent(t.id) + '/' + encodeURIComponent(i.id) }, i.title)),
      words(many ? 'First' : 'In your words', first, many ? 'is-first' : 'is-only'),
      many ? words('Latest', latest, 'is-latest') : null,
      i.say.length > 2 ? U.h('p', { class: 'muted small book-count' }, 'You have explained this ' + i.say.length + ' times.') : null);
  }

  function questions(t) {
    if (!t.questions.length) return null;
    var list = t.questions.slice().reverse(); // newest first
    return U.h('div', { class: 'book-qs' },
      U.h('h3', { class: 'book-qs-h' }, 'Questions you asked'),
      U.h('ul', { class: 'book-q-list' }, list.map(function (q) {
        return U.h('li', null,
          U.h('p', { class: 'book-q' }, q.q),
          U.h('p', { class: 'muted small' }, [q.idea ? 'About “' + q.idea + '”' : null, q.at ? V.day(q.at) : null].filter(Boolean).join(' · ')));
      })));
  }

  U.routes.add('#/book', function (params, ctx) {
    var book = [];
    // Export lives quietly at the end, after his words.
    var actions = U.h('section', { class: 'book-actions', hidden: true, 'aria-labelledby': 'book-save-h' },
      U.h('h2', { id: 'book-save-h' }, 'Keep a copy'),
      U.h('p', { class: 'muted small' }, 'Markdown opens in any notes app. A full copy keeps every explanation, not just the first and latest, as a file to keep safe.'),
      U.h('div', { class: 'book-save' },
        U.h('button', { class: 'btn secondary small', type: 'button', on: { click: function () {
          U.saveFile('my-book-' + U.today() + '.md', toMarkdown(book), 'text/markdown');
        } } }, 'Save as Markdown'),
        U.h('button', { class: 'btn secondary small', type: 'button', on: { click: function () {
          U.saveFile('my-book-' + U.today() + '.json', toJson(book), 'application/json');
        } } }, 'Save a full copy')));
    var body = U.h('div', { class: 'book-body' }, U.h('div', { class: 'skeleton book-sk' }));
    ctx.view.appendChild(U.h('div', { class: 'book' },
      U.h('header', { class: 'page-head' },
        U.h('p', { class: 'eyebrow' }, 'Book'),
        U.h('h1', null, 'In your own words'),
        U.h('p', { class: 'muted' }, 'Every idea you have explained back. Your first try and your latest sit together, so you can see how far you have come.')),
      body, actions));

    Promise.all([U.store.topics.list(), U.store.progress.all()]).then(function (r) {
      if (!ctx.alive()) return;
      book = collect(r[0] || [], r[1] || {});
      U.clear(body);
      actions.hidden = !book.length;
      if (!book.length && U.rt.savedLate()) { body.appendChild(V.savedLate('your Book')); return; }
      if (!book.length) {
        body.appendChild(V.empty({
          art: U.h('div', { class: 'v-empty-art book-empty-art', 'aria-hidden': 'true' }, U.icon('book')),
          title: 'Your Book fills as you explain ideas',
          text: 'At the end of each idea you put it into your own words. Those explanations collect here, first try and latest side by side, so you can watch your understanding grow.',
          action: { href: '#/', label: 'Go to Learn' },
        }));
        return;
      }
      book.forEach(function (t) {
        body.appendChild(U.h('section', { class: 'book-topic' },
          U.h('a', { class: 'book-topic-head', href: '#/t/' + encodeURIComponent(t.id) },
            U.h('span', { class: 'book-thumb' }, V.cover(t.topic)),
            U.h('span', { class: 'book-topic-text' }, U.h('h2', null, t.title),
              U.h('span', { class: 'muted small' }, t.ideas.length === 1 ? '1 idea in your words' : t.ideas.length ? t.ideas.length + ' ideas in your words' : 'Your questions'))),
          t.ideas.map(function (i) { return entry(t, i); }),
          questions(t)));
      });
    }, function (e) {
      if (ctx.alive()) U.clear(body).appendChild(V.loadError('Your Book', e, false));
    });
  }, { tab: 'book', title: 'Book' });

  U.book = { collect: collect, toMarkdown: toMarkdown, toJson: toJson };
})();
