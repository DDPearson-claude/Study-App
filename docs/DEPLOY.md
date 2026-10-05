# Deploying My University

The live app is one private claude.ai artifact, built from this repo.

## Build and test first
```
node tools/build.mjs                 # -> dist/my-university.html
node --test tests/*.test.mjs         # unit tests
node tests/e2e/run.mjs               # browser suites (kit, layout, lesson, review, views)
```
Publish only when every suite passes.

## Publish
Use the Artifact tool's publish action with `file_path: dist/my-university.html`.

- **First publish** (already done once; see the URL below): pass `icon: "graduation"` and the capabilities below.
- **Every later publish from another session:** pass the artifact `url` below so the same link updates
  in place (read it first with the Artifact tool's read action, as the tool requires). Omit `capabilities`
  to keep the stored declaration, unless you are changing it.

Capabilities (full declaration):
```json
{
  "db": {},
  "user": { "scopes": ["profile"] },
  "sample": {},
  "downloads": true,
  "mcp": { "servers": [ { "server": "Parallel Search", "tools": ["web_search", "web_fetch"] } ] }
}
```
- `db` + `user`: topics and lessons (shared docs) and Dan's private progress, cards and profile
  (`data/users/<id>/…`). Default rules are right for a private, single-person artifact. The
  `profile` scope lets Learn greet Dan by his first name; nothing else uses it and no name is stored.
- `sample`: Claude in the page, on Dan's usage (planning, lessons, interactives, grading, tutor).
- `mcp` Parallel Search: live research with real pages. Optional; the app labels content
  "not yet source-checked" when it is not connected.
- `downloads`: Book and backup exports.

## Live artifact
URL: (filled in after the first publish)

## After publishing
Ask Dan to open it once on his phone. The app works on its own; there is no server, routine or
background session to keep alive.
