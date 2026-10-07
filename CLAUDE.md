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
  (navy = progress/controls, green = finished only, red = warnings/mistakes, teal = small labels).
- Light mode by default; dark mode and text size live in reading settings. Phone first (360 px), desktop equally good.
- Nothing ever gets in the way: today's study is one tap away; no guilt mechanics.

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

## Publishing
The live app is a private claude.ai artifact: https://claude.ai/artifact/XV69hX3x3kQfSUuCgyED2d
Publish `dist/my-university.html` with the Artifact tool, keeping that URL (see `docs/DEPLOY.md`). Capabilities: db, user, sample, downloads,
mcp (Parallel Search: web_search, web_fetch; Claude MCP: gr1_z_image_turbo_generate, for course pictures).
