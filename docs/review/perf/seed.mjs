// Seeded data that looks like a few months of use: N topics x M ideas, ready lessons with
// interactives, research docs, progress, review cards with history, and a profile.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FX, UID, ROOT } from './harness.mjs';

const EX = ['brayton-efficiency', 'compound-growth', 'bill-to-law'].map((n) => readFileSync(join(ROOT, 'app', 'kit', 'examples', n + '.html'), 'utf8'));
const iso = (d) => new Date(Date.UTC(2026, 9, 5) - d * 864e5).toISOString();
const day = (d) => iso(d).slice(0, 10);

export function makeSeed(o = {}) {
  const T = o.topics ?? 12, M = o.ideas ?? 6, stage = o.stage || null; // stage: force every idea's progress stage
  const db = {};
  const P = `data/users/${UID}/profile`;
  db[P] = { prefs: { size: 'm', easy: false, theme: 'light', cap: 15, light: false }, days: Object.fromEntries(Array.from({ length: 60 }, (_, i) => [day(i), 12])), createdAt: iso(90) };
  for (let t = 0; t < T; t++) {
    const tid = 'topic-' + t;
    const ideas = Array.from({ length: M }, (_, i) => ({ id: 'i' + (i + 1), title: 'Idea ' + (i + 1) + ' of topic ' + t + ': ' + FX.pendTopic.ideas[i % 5].title, oneLine: FX.pendTopic.ideas[i % 5].oneLine, deps: i ? ['i' + i] : [], kind: 'quantity' }));
    db['topics/' + tid] = Object.assign({}, FX.pendTopic, { id: tid, title: 'Topic ' + t + ': ' + FX.pendTopic.title, query: 'topic ' + t, ideas, createdAt: iso(80 - t), updatedAt: iso(40 - t), hue: (t * 37) % 360,
      calibration: [{ id: 'c1', q: 'Which swings slower?', options: ['A long pendulum', 'A short pendulum'], answer: 0, why: 'Length sets the beat.', iid: 'i1' }] });
    const prog = { updatedAt: iso(40 - t), lastIdea: 'i1', calibration: { c1: 0 }, ideas: {} };
    const cards = {};
    ideas.forEach((idea, i) => {
      const l = JSON.parse(JSON.stringify(FX.pendulum));
      l.lesson.iid = idea.id;
      l.updatedAt = iso(40 - t);
      if (i % 4 !== 0) l.interactive.html = EX[i % 3];  // a mix of real kit bodies (4-8 KB) and the animated pendulum
      db[`topics/${tid}/lessons/${idea.id}`] = l;
      db[`topics/${tid}/research/${idea.id}`] = { notes: [{ claim: 'A claim with a source.', sourceIds: [1] }], sources: l.lesson.sources, at: iso(80 - t) };
      const done = stage ? stage === 'done' : i < M / 2;
      prog.ideas[idea.id] = stage && stage !== 'done'
        ? { stage, startedAt: iso(30), predict: { answer: 'It slows down', at: iso(30) } }
        : done ? { stage: 'done', startedAt: iso(30), doneAt: iso(29), predict: { answer: 'x', at: iso(30) }, say: [{ text: 'A longer string swings more slowly because it has further to go.', at: iso(29), verdict: 'partly', met: [true, false, false] }], checks: { c1: { correct: true, at: iso(29) }, c2: { correct: false, at: iso(29) }, c3: { correct: true, at: iso(29) } } } : {};
      if (done) {
        l.lesson.checks.forEach((c) => {
          const id = idea.id + '_' + c.id;
          cards[id] = { id, tid, iid: idea.id, type: c.type, spec: c, createdAt: iso(29), learnedAt: iso(29), s: { due: day(-((i + t) % 5) + 1), stability: 4, difficulty: 5, reps: 3, lapses: 0, last: day(3) }, hist: Array.from({ length: 12 }, (_, k) => ({ at: iso(29 - k), grade: 3, ok: true })) };
        });
        cards[idea.id + '_say'] = { id: idea.id + '_say', tid, iid: idea.id, type: 'recall', spec: { prompt: l.lesson.say.prompt, rubric: l.lesson.say.rubric, model: l.lesson.say.model, mine: 'A longer string swings more slowly.' }, createdAt: iso(29), learnedAt: iso(29), s: { due: day(-1), stability: 3, difficulty: 5, reps: 2, lapses: 0, last: day(3) }, hist: [] };
      }
    });
    db['topics/' + tid + '/research/topic'] = { notes: [{ claim: 'Topic claim', sourceIds: [1] }], sources: FX.pendulum.lesson.sources, at: iso(80 - t) };
    db[`${P}/progress/${tid}`] = prog;
    if (Object.keys(cards).length) db[`${P}/cards/${tid}`] = { cards };
  }
  return db;
}
