// Claude's notes (D4): what Claude wrote, shown as a comment card with its avatar, and a way to
// answer it. Used by the check and review cards (41-cards.js: the feedback on an answer), the
// say-it-back verdict (50-lesson.js), Learn's notes (70-learn.js) and Today's (60-today.js).
//
//   U.notes.avatar(who)                      who: 'claude' | 'app'   -> span.note-av (decorative)
//   U.notes.byline(who, context?)            -> div.note-by: avatar, "Claude" (or "My University"), context
//   U.notes.reply({chips, placeholder, label, onAsk(text, chip)}) -> div.note-reply
//        chips Dan can tap (sent as they are) and a "Reply to Claude…" box; onAsk opens the Ask
//        Claude sheet with that question asked (U.tutor.open(context, {ask, chip})). Typed
//        replies are his own questions (saved like any he types there); chips are not.
//   U.notes.card({who, context, title?, text?, body?, actions?, cls?}) -> article.note
//        text: Claude-written words, drawn with U.rich (never as HTML); body: app-built nodes.
//        actions: [{label, href} | {label, onClick}]
//   U.notes.list({title, id?, notes:[Element]}) -> section.notes (null when there are none)
//
// Who wrote it is always honest: 'claude' only for words Claude wrote (a lesson's explanation of
// an answer, a grade, a reply); the app's own notices (reviews due) carry the app's mark.
(function () {
  var h = U.h;
  var CLAUDE = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M10.4 4.1a4.4 4.4 0 1 0 0 5.8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>';
  var APP = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 4 3 10.5 16 17l13-6.5L16 4Z" fill="currentColor"/><path d="M8 14.2v6.3c0 2.2 3.6 4.5 8 4.5s8-2.3 8-4.5v-6.3L16 18.2 8 14.2Z" fill="currentColor" opacity=".55"/></svg>';
  var NAME = { claude: 'Claude', app: 'My University' };

  function avatar(who) {
    who = who === 'app' ? 'app' : 'claude';
    return h('span', { class: 'note-av is-' + who, 'aria-hidden': 'true' }, U.svg(who === 'app' ? APP : CLAUDE));
  }
  function byline(who, context) {
    who = who === 'app' ? 'app' : 'claude';
    return h('div', { class: 'note-by' }, avatar(who),
      h('span', { class: 'note-name' }, NAME[who]),
      context ? h('span', { class: 'note-ctx' }, context) : null);
  }

  function reply(o) {
    o = o || {};
    var onAsk = typeof o.onAsk === 'function' ? o.onAsk : function () {};
    var id = U.id('note-r');
    var input = h('input', { class: 'note-input', id: id, type: 'text', maxlength: '2000', autocomplete: 'off', enterkeyhint: 'send', placeholder: o.placeholder || 'Reply to Claude…' });
    var send = h('button', { class: 'note-send', type: 'submit', 'aria-label': 'Send to Claude', disabled: true }, U.icon('arrow'));
    input.addEventListener('input', function () { send.disabled = !input.value.trim(); });
    var form = h('form', { class: 'note-form', novalidate: true, on: { submit: function (e) {
      e.preventDefault();
      var text = input.value.replace(/\s+/g, ' ').trim();
      if (!text) return;
      input.value = '';
      send.disabled = true;
      onAsk(text, false);
    } } }, h('label', { class: 'visually-hidden', for: id }, o.label || 'Reply to Claude'), input, send);
    var chips = (o.chips || []).filter(Boolean);
    return h('div', { class: 'note-reply' },
      chips.length ? h('div', { class: 'note-chips', role: 'group', 'aria-label': 'Ask Claude' }, chips.map(function (c) {
        return h('button', { class: 'chip note-chip', type: 'button', on: { click: function () { onAsk(c, true); } } }, c);
      })) : null,
      form);
  }

  function card(o) {
    o = o || {};
    var who = o.who === 'app' ? 'app' : 'claude';
    var acts = (o.actions || []).filter(Boolean).map(function (a) {
      return a.href ? h('a', { class: 'note-act', href: a.href }, a.label, U.icon('arrow'))
        : h('button', { class: 'note-act', type: 'button', on: { click: a.onClick } }, a.label, U.icon('arrow'));
    });
    return h('article', { class: 'note is-' + who + (o.cls ? ' ' + o.cls : '') },
      byline(who, o.context),
      o.title ? h('h3', { class: 'note-title' }, o.title) : null,
      o.text ? h('div', { class: 'note-text' }, U.rich(String(o.text))) : null,
      o.body || null,
      acts.length ? h('div', { class: 'note-acts' }, acts) : null);
  }

  function list(o) {
    o = o || {};
    var notes = (o.notes || []).filter(Boolean);
    if (!notes.length) return null;
    var hid = o.id || U.id('notes-h');
    return h('section', { class: 'notes' + (o.cls ? ' ' + o.cls : ''), 'aria-labelledby': hid },
      h('div', { class: 'notes-head' }, h('h2', { id: hid, class: 'notes-h' }, o.title || 'Claude\'s notes'),
        h('span', { class: 'notes-n', 'aria-hidden': 'true' }, String(notes.length))),
      h('div', { class: 'notes-list' }, notes));
  }

  U.notes = { avatar: avatar, byline: byline, reply: reply, card: card, list: list };
})();
