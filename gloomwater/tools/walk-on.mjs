// tools/walk-on.mjs — import this FIRST (before any data.js import) to evaluate data.js with the walking build on.
// data.js reads `globalThis.GW_WALK` once, at module evaluation (WALK_ENABLED). v2 tools import data as
// '../src/data.js?walk' so the v1 instance ('../src/data.js') and the v2 instance can coexist in one process.
globalThis.GW_WALK = true;
