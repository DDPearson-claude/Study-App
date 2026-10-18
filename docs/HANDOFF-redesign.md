# Handoff: redesigning My University as a course library

Written 18 Oct 2026 for a fresh Claude Code session that will design (and later build) the app's new
UI. Another session is still building course content in this repo at the same time; section 6 says
how not to collide with it.

Read first, in this order: `CLAUDE.md` (product and code rules, Dan's background), this file, then
`docs/ARCHITECTURE.md` sections 4 (data model), 5 (lesson JSON), 9 (module APIs), 10 (navigation),
11 (layout) and 12 (the current look), and `docs/DEPLOY.md` before any publish.

## 1. What changed (Dan, 18 Oct)

My University began as "type any topic and Claude builds you a university on it": an ask box, a
few intake questions, a plan written in the page, lessons generated as you go. Dan is dropping that.
The app becomes a library of **ready-made courses only**, each fully researched, fact-checked and
built before he sees it.

How it must feel, in his words: material and content he can **dive into when he feels like learning
something new or brushing up on something**. Not homework.

He rejected the first set of mockups for feeling like forced homework:
https://claude.ai/artifact/GwybZdYDsGUEvMBA3LF7iR (a "today's job card", a curriculum "route" to
follow, and a "training record" of signed-off competences). Treat them as what to avoid: no job
cards, no sign-off or competence tracking, no route he must follow, nothing framed as due or owed.
Spaced review can stay, but as an offer, never pressure (CLAUDE.md already says: no guilt
mechanics). Browsing, curiosity and picking anything up at any point come first.

Dan wants a few distinct design directions to choose from before anything is built. He uses the app
mostly on his phone (360 px first; laptop equally good).

## 2. Who it is for

Dan: an electrician (BS 7671 design and verification, inspection and testing, subsea cable fault
location) heading into Royal Navy electrical/engineering training. Full list in `CLAUDE.md`, "Dan's
background". The courses serve that path: maths for the HNC now, an electrical engineering shelf
next, leadership later.

## 3. The content the UI must present

All content lives in the live artifact's database (private claude.ai artifact; URL in CLAUDE.md and
docs/DEPLOY.md). The repo keeps copies under `docs/courses/maths/<course>/out/`.

- **Shelves**: `shelves/<sid>` documents; repo copies `docs/shelves-*.json`. A shelf has `folders`,
  each folder has `courses` `{id, title, blurb, tid, from}`. `tid: null` means the course is planned
  but not built ("Coming soon" today). Shelves on file: Maths (7 folders, 50 courses, 17 built),
  Science and technology, Computer science, Data analysis (none built). An Electrical engineering
  shelf is proposed next: circuit analysis, power at sea, machines and drives, instrumentation and
  control, maintenance and fault-finding (about 17 courses).
- **Built maths courses** (all lessons live unless noted): Fractions, Negative numbers, Percentages,
  Proportional reasoning, Solving equations, The coordinate plane, Geometry fundamentals, Linear
  equations, Straight-line graphs, Linear systems, Powers and roots, Functions and their graphs,
  Quadratics and polynomials, Exponentials and logarithms, Calculus fundamentals (10 lessons);
  Trigonometry and Complex numbers are building now, each published lesson by lesson (8 each).
- **A course** = `topics/<tid>` (title, hook, oneBreath, ideas[] = its lessons in order, hue,
  `readyMade`, `overviewChecked`), plus per lesson `topics/<tid>/lessons/<iid>` (a **steps lesson**:
  `format: 'steps'`, about 12 SHOW and DO screens played inside a sandboxed iframe interactive),
  `topics/<tid>/guide/<iid>` (a still re-read guide: each screen's sentence and finished picture, used
  by the dossier), and `topics/<tid>/research/<key>` (checked sources and notes). A course's lessons
  can be live while later ones are still "Coming soon".
- **Dan's own data** is private under `data/users/<id>/...`: profile (prefs, study minutes),
  progress per topic, review cards, his explanations in his own words.
- Existing screens that matter to a course-only app: the shelves (`76-shelves.js`), the topic page
  (`71-topic.js`), the lesson player (`50-lesson.js`), the dossier / field guide reader
  (`75-dossier.js`), Today and review (`60-today.js`), the Map (`72-map.js`), the Book of his own
  words (`73-book.js`), settings (`74-settings.js`), Ask Claude (`51-tutor.js`). Routes are listed
  in ARCHITECTURE section 10.

## 4. What can go (confirm with Dan before deleting)

The ask box, example chips, intake questions and planning/failed-planning states on Learn
(`70-learn.js`), and in-page course generation as a user feature. Careful: the course-building
tools load app source in Node and must keep working (section 6), so do not delete
`00-core.js`, `10-runtime.js`, `30-prompts.js`, `31-generate.js`, `32-sandbox.js`,
`33-interactive.js`, `34-verify.js` or anything in `app/kit/`. Unhook features from the UI rather
than deleting those files.

## 5. Constraints that do not change

- Plain JS, no frameworks, one global `U`; never model-written text in `innerHTML` (`U.h` / `U.rich`);
  interactives run only in the sandboxed iframe (`allow-scripts`, never `allow-same-origin`).
- The viewer blocks `alert/confirm/prompt`, `window.print`, blob iframes; downloads via links.
- Light by default, dark mode and text size in settings, 360 px first, 44 px touch targets.
- Colour keeps its meaning unless Dan changes it: ink for progress and controls, green for
  finished only, red for mistakes and warnings, teal for small labels, amber for what is due. Course
  colours: six tones from `V.toneOf` (`70-learn.js`, tokens in `75-dossier.css`), never red or green.
- The kit API (`app/kit/KIT.md`) is a contract: every built lesson's interactive depends on it. Restyle
  around the iframe, do not change what lessons call.
- The current look is "D4, Claude's notes" (`80-d4.css`, ARCHITECTURE section 12). Dan may replace it.

## 6. Working alongside the content session

- **Branches.** All current work is on `linear-equations-lesson-1` (well ahead of `main`; PR #4
  `fold-sources-label-attempts` is still open into `main`). The content session commits and pushes
  to `linear-equations-lesson-1` every time a lesson goes live. Branch from it (for example
  `redesign-course-library`), never push to it, and merge it into your branch when you need newer
  content or tools.
- **Database.** Only the content session writes `topics/*` and `shelves/*`. Do not write those.
  If the new design needs a new field on a topic, lesson or shelf (a course summary, a picture, a
  level, a time estimate), write down exactly what and why and give it to Dan: the content session
  adds it in `tools/course/assemble.mjs` so every course carries it.
- **Course tools.** `tools/course/*` and `tools/eval/*` load `00-core`, `10-runtime`, `30-prompts`,
  `31-generate`, `33-interactive`, `34-verify` and the kit test page built from `32-sandbox` and
  `33-interactive`. Keep their exports working; run `node --test tests/*.test.mjs` after touching any.
- **Publishing.** The content session does not republish the page (its work is db-only), so the
  live page changes only when you publish. Publish only when Dan says so, after every test suite
  passes, keeping the artifact URL and its capabilities (docs/DEPLOY.md). `dist/my-university.html`
  is committed: rebuild it after merging.

## 7. Commands

```
node tools/build.mjs                 # -> dist/my-university.html
node --test tests/*.test.mjs         # unit tests
node tests/e2e/run.mjs               # browser suites (kit, layout, lesson, review, views, dossier, shelves, ...)
node tests/e2e/views.spec.mjs        # one suite
```
Playwright: `/opt/node22/lib/node_modules/playwright/index.mjs`, or `tools/harness/page.mjs`
(`openApp({ width: 360, dark, config: { db } })`, a stubbed claude.ai runtime with a seeded db; the
views seed is `tests/fixtures/views-seed.json`). Web fonts are blocked in that sandbox, so
screenshots use fallback fonts.

## 8. Useful history

- `docs/design/` holds earlier design explorations (the dossier field guide, D4).
- `docs/NEXT.md` lists known small issues in the current screens.
- Dan's look decisions so far: D4 "Claude's notes" (10 Oct), more colour on menus and Learn (14 Oct):
  course tones as bands on cards, see ARCHITECTURE section 12.
