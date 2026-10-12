// An idea Dan has just finished (cards made, first review tomorrow) is painted "New: not learned
// yet" on the Map: ideaBands() reports 'new' for unreviewed cards and that overrides progress.
import { open, report, sleep, P, TODAY, addDays, NOW, topic, lesson } from './lib.mjs';
const db = { 'topics/tA': topic('tA'), 'topics/tA/lessons/i1': lesson('i1'),
  [P('profile/progress/tA')]: { updatedAt: NOW, lastIdea: 'i1', ideas: { i1: { stage: 'done', startedAt: NOW, doneAt: NOW } } },
  [P('profile/cards/tA')]: { cards: { i1_c1: { id: 'i1_c1', tid: 'tA', iid: 'i1', type: 'choice', spec: lesson('i1').lesson.checks[0], createdAt: NOW, learnedAt: NOW,
    s: { due: addDays(TODAY, 1), stability: 0, difficulty: 0, reps: 0, lapses: 0, last: null }, hist: [] } } },
  [P('profile')]: { prefs: {}, days: {} } };
const app = await open({ db, sample: () => '{}' });
const { page } = app;
await page.goto(app.url('#/map'));
await page.waitForSelector('.map-node');
const labels = await page.$$eval('.map-node', (a) => a.map((x) => x.getAttribute('aria-label')));
const head = (await page.textContent('.map-topic-text')).replace(/\s+/g, ' ');
report('a finished idea shows as "new / not learned yet" on the Map', /pressure wave, new/.test(labels[0]), 'nodes: ' + JSON.stringify(labels) + '; header: "' + head + '"');
await app.close();
