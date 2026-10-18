# My University

A personal learning app for Dan. He types any topic; Claude, running inside a private claude.ai
artifact, maps it into ideas and teaches each one through a bespoke interactive he can play
with, then keeps what he learned alive with spaced review. Read `docs/ARCHITECTURE.md` before
changing code; it is the contract between modules.

## Product rules (from Dan's Design Brief v2)
- First principles, warm plain words, starting from what Dan already knows. Jargon only once earned, always explained.
- Faithful to sources: nothing invented; numbers are controls, computed from a shown rule, or cited constants.
  Contested points are taught as contested. Unsourced content is labelled as such, never dressed up.
- Learn by doing: every idea that can be manipulated gets an interactive. A visual earns its place by teaching.
- Learning that sticks: predict, play, explain, say it back, quick checks, spaced review of what he answered.
- Calm reading: narrow column, generous space, key terms highlighted in amber, colour only for meaning
  (ink = progress/controls, green = finished only, red = warnings/mistakes, teal = small labels,
  amber = what is due). The look is D4, "Claude's notes" (Dan's choice, 10 Oct): docs/ARCHITECTURE.md section 12.
- Light mode by default; dark mode and text size live in reading settings. Phone first (360 px), desktop equally good.
- Nothing ever gets in the way: today's study is one tap away; no guilt mechanics.

## Dan's background (Dan, 18 Oct 2026)
Every course brief starts from this: never re-teach what these cover, pitch above it, and use it for examples.
- Electrician, now committed to the electrical and electrical engineering path in the Royal Navy. Next: leading rate
  engineering qualifications, a level 3 marine engineering qualification and a level 4 management and leadership
  qualification (at HMS Drake / HMS Collingwood). Educationally qualified for Upper Yardman and Senior Upper Yardman.
- Electrical (EAL): NVQ L3 Electrical Installation; L3 18th Edition BS 7671:2018 (Feb 2025); L3 Building Regulations
  for Electrical Installations in Dwellings (May 2025); L3 Initial Verification and Certification, L3 Periodic
  Inspection, Testing and Certification, L3 In-Service Inspection and Testing (PAT) and L2 Fundamental Inspection,
  Testing and Initial Verification (all Oct 2025); L4 Design and Verification.
- Other: BTEC L3 Diploma in Advanced Manufacturing Engineering; City & Guilds Assured Subsea Cable Testing and Fault
  Location (Sept 2026); a Navy Advanced Apprenticeship with Maths and English proxies.
- So an electrical course assumes BS 7671 design and verification (cable sizing, voltage drop, earth fault loop
  impedance, protective devices, inspection and test) and cable fault location; it adds what marine and naval work
  needs beyond them. Ask him for his course syllabi and build to them when he shares them.

## Code rules
- Plain JS, no frameworks, no dependencies in the shipped page. One global namespace `U`.
- Never put model-written text into `innerHTML`; use `U.h()` / `U.rich()`. Model-written HTML runs only
  inside the sandboxed iframe (`sandbox="allow-scripts"`, never `allow-same-origin`).
- The viewer blocks `alert/confirm/prompt`, downloads via links, `window.print`, blob: iframes.
- Prompt builders stay pure (no DOM at load) so evals can run them in Node. Every prompt's first line is `TASK: <name>`.
- Keep db documents under 256 KiB; writes go through `U.store` (serialised and coalesced).

## Commands
- Build: `node tools/build.mjs` -> `dist/my-university.html`
- Unit tests: `node --test tests/*.test.mjs`
- Browser tests: `node tests/e2e/run.mjs` (Playwright via the global install; uses `tools/harness/claude-stub.js`)
- Playwright import path: `/opt/node22/lib/node_modules/playwright/index.mjs` (or use `tools/harness/page.mjs`)

## Building ready-made courses: models and effort per stage
Dan approved this on 11 Oct 2026, so set each workflow agent's `model` and `effort` like this. Dan
does not switch models between stages; one workflow does them all. His own session runs Opus at
high with ultracode off; a course build runs as a workflow when he asks for one.

| Stage | Model | Effort |
|---|---|---|
| Research | Sonnet | high (the quote checker verifies every quote word for word) |
| Course brief and plan | Opus | high |
| Build | Opus | xhigh (Dan, 11 Oct) |
| Fact-check | Opus | high |
| Review (teaching and motion in one) | Opus | xhigh |
| Fix | Opus | high |
| Confirm | Sonnet | medium; skipped when only small polish points were found |

Build: at most three attempts per interactive, then stop and fix the brief before trying again
(Dan, 12 Oct; `tools/course/RUNBOOK.md` section 5).
Agents look at one contact sheet per check rather than many single frames. Report each build's
token cost to Dan, so the setup can be compared with the measured full process (about 1.65M tokens
a lesson for Fractions lessons 4-8). The process itself is in `tools/course/RUNBOOK.md`.

## Publishing
The live app is a private claude.ai artifact: https://claude.ai/artifact/XV69hX3x3kQfSUuCgyED2d
Publish `dist/my-university.html` with the Artifact tool, keeping that URL (see `docs/DEPLOY.md`). Capabilities: db, user, sample, downloads,
mcp (Parallel Search: web_search, web_fetch; Claude MCP: gr1_z_image_turbo_generate, for course pictures).
