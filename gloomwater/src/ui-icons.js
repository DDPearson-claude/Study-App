// ui-icons.js — hand-inked SVG glyphs, ornaments and little portraits for the UI.
// Imported only by ui.js / ui-*.js. Every glyph is drawn on a 24×24 grid with thin,
// round-capped strokes in currentColor so CSS controls the colour (bone, amber, rarity…).

const P = (d, extra = '') => `<path d="${d}"${extra}/>`;
const C = (cx, cy, r, extra = '') => `<circle cx="${cx}" cy="${cy}" r="${r}"${extra}/>`;
const F = ' fill="currentColor" stroke="none"';
const FO = (o) => ` fill="currentColor" fill-opacity="${o}" stroke="none"`;

const FLAME = 'M12 3c1.2 3.2 5 5.4 5 10a5 5 0 0 1-10 0c0-2.6 1.4-3.8 2.4-5.4.3 1.6 1 2.4 1.8 2.8C11 8 11 5.4 12 3z';
const FLAME_IN = 'M12 13.2c.9 1 1.8 1.8 1.8 3.2a1.8 1.8 0 0 1-3.6 0c0-1.2.9-2 1.8-3.2z';
const SPIRAL = 'M11 12a1 1 0 0 1 2 0a2.5 2.5 0 0 1-5 0a4 4 0 0 1 8 0a5.5 5.5 0 0 1-11 0a7 7 0 0 1 14 0';
const SMALL_FLAME = (x, y, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0-4c.8 1.2 1.9 2 1.9 3.4a1.9 1.9 0 0 1-3.8 0C-1.9-2-.8-2.8 0-4z"/>`;

export const ICONS = {
  // ---------------------------------------------------------------- vitals / currencies
  flame: P(FLAME) + P(FLAME_IN, FO(0.55)),
  oil: P('M12 3.2C9.4 7 6.8 10 6.8 13.6a5.2 5.2 0 0 0 10.4 0C17.2 10 14.6 7 12 3.2z') + P('M9.7 14.4a2.5 2.5 0 0 0 2 2.3', ' stroke-opacity=".7"'),
  ember: P('M12 4c1 2.6 4 4.3 4 8a4 4 0 0 1-8 0c0-2 1.1-3 1.9-4.3.3 1.2.8 1.9 1.4 2.2C11 8.2 11.1 6 12 4z') + P('M7 20.5h10'),
  shell: P('M12 19.2 3.6 12.6C4.6 7.6 8 5 12 5s7.4 2.6 8.4 7.6z') + P('M12 19.2 8.4 6.3M12 19.2V5M12 19.2l3.6-12.9M12 19.2 5.4 9.2M12 19.2l6.6-10', ' stroke-opacity=".6"') + P('M10 20.4h4'),
  memory: P('M12 3c3.5 4 6 7 6 10.5a6 6 0 0 1-12 0C6 10 8.5 7 12 3z') + P('M12 15.2a1 1 0 1 1 1-1 2.2 2.2 0 1 1-2.2-2.2', ' stroke-opacity=".75"'),
  xp: P('M12 3l5 9-5 9-5-9z') + P('M12 8.5l2 3.5-2 3.5-2-3.5z', F),
  scallop: P('M12 3.2C4.8 5.9 3 13 5.6 19.4h12.8C21 13 19.2 5.9 12 3.2z') + P('M12 3.2v16.2M7.9 6.2l1.3 13.2M16.1 6.2l-1.3 13.2', ' stroke-opacity=".8"'),
  book: P('M3.6 4.7C7.3 3.8 10.2 4.7 12 6.6c1.8-1.9 4.7-2.8 8.4-1.9v14.6c-3.7-.9-6.6 0-8.4 1.9-1.8-1.9-4.7-2.8-8.4-1.9z') + P('M12 6.6v14.6'),
  coin: C(12, 12, 7.5) + C(12, 12, 5, ' stroke-opacity=".5"') + P('M12 9v6'),
  // ---------------------------------------------------------------- hud buttons
  creel: P('M5 9.5h14l-1.5 10h-11z') + P('M5.6 13.2h12.8M6.1 16.5h11.8M9.4 9.5l.5 10M14.6 9.5l-.5 10', ' stroke-opacity=".6"') + P('M8 9.5c0-3 1.8-4.8 4-4.8s4 1.8 4 4.8'),
  journal: P('M5 4.5h10.5a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2z') + P('M5 18a2 2 0 0 1 2-2h10.5') + P('M8.5 8.5h5.5M8.5 11h4', ' stroke-opacity=".6"') + P('M14 4.5V9l1-.8 1 .8V4.5', ' stroke-opacity=".8"'),
  pause: P('M9 6.5v11M15 6.5v11', ' stroke-width="2.2"'),
  close: P('M6.5 6.5l11 11M17.5 6.5l-11 11'),
  check: P('M5 12.5l4.5 4.5L19 7'),
  lock: P('M7 11h10v9H7z') + P('M9 11V8a3 3 0 0 1 6 0v3') + C(12, 15.3, 1.2, F),
  quill: P('M20 3C13 4 8 9 6.5 16.5') + P('M20 3c-1 6-5 9.5-10.5 10.8', ' stroke-opacity=".7"') + P('M6.5 16.5 4 21M9.2 12.4l3.4.3', ''),
  eye: P('M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z') + C(12, 12, 2.6, F),
  gate: P(SPIRAL),
  spot: P('M8 19.5V12M12 19.5V5.5M16 19.5V10', ' stroke-opacity=".85"') + C(8, 9.5, 0.9, F) + C(16, 7.5, 0.9, F) + C(12, 3.2, 1, F) + P('M4 20.5c2.6 1 5.3 1 8 0s5.4-1 8 0', ' stroke-opacity=".6"'),
  fish: P('M3 12c3-4 7.5-5.5 11.5-3.5L20 5v14l-5.5-3.5C10.5 17.5 6 16 3 12z') + C(7.6, 11.2, 0.9, F),
  star: P('M12 3l1.8 6.2L20 12l-6.2 2.8L12 21l-1.8-6.2L4 12l6.2-2.8z'),
  trophy: P('M8 4h8v5a4 4 0 0 1-8 0z') + P('M8 6H5c0 3 1.5 4.5 3.5 4.5M16 6h3c0 3-1.5 4.5-3.5 4.5M12 13v4M8.5 20h7M10 17h4'),
  anchor: C(12, 5, 1.8) + P('M12 6.8V20M8 10h8M5 14c0 3.5 3 6 7 6s7-2.5 7-6'),
  // ---------------------------------------------------------------- boons (weapons)
  orbit: C(12, 12, 2.2) + C(12, 12, 7.5, ' stroke-dasharray="2.2 2.8" stroke-opacity=".7"') + C(19.5, 12, 1.7, F) + C(8.25, 5.5, 1.7, F) + C(8.25, 18.5, 1.7, F),
  motes: C(7, 15.5, 2, F) + C(12.5, 9, 1.6, F) + C(17.5, 14.5, 1.3, F) + P('M3.5 19.5c1.6-.4 2.4-1.2 2.9-2.2M9 12.5c1-.6 1.8-1.4 2.3-2.2M14.5 17c1-.3 1.8-.9 2.3-1.6', ' stroke-opacity=".6"'),
  trail: P('M3 17.5c2.4 0 2.4-2 4.8-2s2.4 2 4.8 2 2.4-2 4.8-2 2.4 2 3.6 2') + SMALL_FLAME(7, 12.5, 1.1) + SMALL_FLAME(12.6, 11, 1.4) + SMALL_FLAME(18, 12.5, 1),
  hook: P('M14.5 5.2v8.3a4.5 4.5 0 1 1-9 0V11l2.6 2.2') + C(14.5, 3.6, 1.5) + P('M17 9.5c1.6.4 2.8 1.6 3.2 3.2', ' stroke-opacity=".55"'),
  spark: P('M13.5 2.5 6.5 13h5l-1.5 8.5 7.5-11.5h-5z'),
  bell: P('M12 3.5a1.2 1.2 0 0 1 1.2 1.2v.6c2.8.7 4.3 3 4.3 6v3.4l1.5 2.3H5l1.5-2.3v-3.4c0-3 1.5-5.3 4.3-6v-.6A1.2 1.2 0 0 1 12 3.5z') + P('M10 19.2a2 2 0 0 0 4 0') + P('M20.5 7.5c.8 1.2 1.2 2.6 1.2 4M3.5 7.5c-.8 1.2-1.2 2.6-1.2 4', ' stroke-opacity=".5"'),
  nova: C(12, 12, 3.4) + P('M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M5.5 18.5l2.1-2.1M16.4 7.6l2.1-2.1', ' stroke-opacity=".75"') + C(12, 12, 1.2, F),
  mines: C(12, 13.5, 4) + P('M12 9.5V5M12 5c-1.6-1.1-3.2-1-4.2.2', '') + P('M16.6 13.5h1.6M5.8 13.5h1.6M15.3 17l1.1 1.1M7.6 9.9l1.1 1.1M15.3 10l1.1-1.1M7.6 18.1l1.1-1.1', ' stroke-opacity=".7"') + C(12, 13.5, 1.3, F),
  vortex: P(SPIRAL),
  beam: P('M4.5 20h5M7 20v-4.5M5.3 15.5h3.4l-.6-3.2H5.9z') + P('M8.6 12 20.5 5M8.6 14.2l11.9 3.3', ' stroke-opacity=".8"') + P('M20.5 5v12.5', ' stroke-opacity=".35" stroke-dasharray="1.5 2"'),
  // ---------------------------------------------------------------- boons (passives)
  light: P('M10 21h4v-6.5h-4z') + P('M12 14.5V13') + P('M12 6.5c.9 1.2 1.9 2 1.9 3.3a1.9 1.9 0 0 1-3.8 0c0-1.3 1-2.1 1.9-3.3z', F) + P('M12 2.5v1.6M5.8 5.2l1.1 1.1M18.2 5.2l-1.1 1.1M4 10.5h1.6M18.4 10.5H20', ' stroke-opacity=".6"'),
  damage: P('M12 2.5 15 9l3-2.2-1 7.2a5 5 0 0 1-10 0L6 6.8 9 9z') + P('M12 12l1.4 2.6-1.4 2.6-1.4-2.6z', F),
  cooldown: P('M7 3.5h10M7 20.5h10') + P('M8 3.5c0 4.5 4 5.5 4 8.5s-4 4-4 8.5M16 3.5c0 4.5-4 5.5-4 8.5s4 4 4 8.5') + P('M10 18.6h4l-2-2.2z', F),
  oar: P('M4.5 19.5 14.6 9.4') + P('M13.9 10.1l1.9-4.4c.8-1.3 2.5-2 3.8-1.6.4 1.3-.3 3-1.6 3.8z') + P('M3.5 20.5l2-2', ' stroke-width="2.2"'),
  magnet: P('M6.5 4v8.2a5.5 5.5 0 0 0 11 0V4h-3.4v8.2a2.1 2.1 0 0 1-4.2 0V4z') + P('M6.5 7.2h3.4M14.1 7.2h3.4', ' stroke-opacity=".7"'),
  ward: P('M12 3 5 6v5.5c0 4.2 3 7.5 7 9.5 4-2 7-5.3 7-9.5V6z') + P('M12 7v10M8.5 11h7', ' stroke-opacity=".55"'),
  flare: P('M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4M5.3 5.3l2.8 2.8M15.9 15.9l2.8 2.8M5.3 18.7l2.8-2.8M15.9 8.1l2.8-2.8') + C(12, 12, 2.6, F),
  zap: P('M12.5 3 8 11h3.6l-1.1 6.2L15.4 9h-3.6z') + C(18.2, 18.2, 2.6, ' stroke-opacity=".55" stroke-dasharray="1.6 1.6"'),
  reel: C(11, 12, 6.2) + C(11, 12, 1.6, F) + P('M11 5.8v2.4M17.2 12h3M20.2 12v3.4', '') + P('M6.6 7.6l1.6 1.6', ' stroke-opacity=".5"'),
  bite: P('M12 3v8.2a3 3 0 0 1-6 0V9.6l1.8 1.5') + P('M3 17.5c3 1.4 6 1.4 9 0s6-1.4 9 0M6 20.8c2 .8 4 .8 6 0', ' stroke-opacity=".65"'),
  luck: P('M8 12c-2.2 0-4-1.6-4-3.6S5.8 4.8 8 4.8c3.6 0 4.4 7.2 8 7.2 2.2 0 4 1.6 4 3.6S18.2 19.2 16 19.2c-3.6 0-4.4-7.2-8-7.2z'),
  gut: P('M3 16c2.6-3 6-3.8 9-2.4l3-2.6v8.2l-3-2.4c-3 1.4-6.4.6-9-.8z') + C(6.6, 15.6, 0.8, F) + P('M15.5 3c.8 1.6 2.6 2.6 2.6 4.8a2.6 2.6 0 0 1-5.2 0c0-1.2.6-1.8 1.1-2.6.2.6.5 1 .8 1.2-.2-1.2.1-2.2.7-3.4z'),
  nightline: P('M14.5 3.5a6 6 0 1 0 6 9.2A5 5 0 0 1 14.5 3.5z') + P('M5 3v11.5', ' stroke-opacity=".8"') + P('M5 14.5v3a2 2 0 1 0 2 2', ''),
  moon: P('M15.5 3.5A8.5 8.5 0 1 0 20.5 15 6.5 6.5 0 0 1 15.5 3.5z') + C(19, 5, 0.8, F) + C(21, 9, 0.6, F),
  gold: P('M13.5 6.2v7.3a4 4 0 1 1-8 0v-2l2.3 2') + C(13.5, 4.6, 1.5) + P('M18.5 3v4M16.5 5h4M19 14.5v2.6M17.7 15.8h2.6', ' stroke-opacity=".8"'),
  // ---------------------------------------------------------------- baits & items
  worm: P('M3.5 15.5c2-3.2 4-3.2 5.6 0s3.6 3.2 5.6 0 3.6-3.2 5.3 0') + C(19.6, 15.2, 0.9, F),
  moss: P('M5 19.5c1-4 2-6 2-9M9.5 19.5c0-4 1.6-7 3-10M14.5 19.5c.5-3.5 2-6 4-8M3.5 19.5h17') + C(7, 9.5, 1, F) + C(12.6, 8.4, 1.1, F) + C(18.6, 10.4, 1, F),
  cake: P('M5 11.5h14v7H5z') + P('M5 11.5c1-3 4-4.6 7-4.6s6 1.6 7 4.6') + P('M8 15h8', ' stroke-opacity=".55"'),
  roe: C(9, 10, 2.4) + C(14.4, 9.2, 2.2) + C(11.8, 14.6, 2.5) + C(16.8, 14.2, 1.9) + C(7.2, 15.4, 1.8) + C(9, 10, 0.7, F) + C(11.8, 14.6, 0.7, F),
  larva: P('M7.5 17a5.2 5.2 0 1 1 8.8 2.6') + P('M8.6 11.8l1.6 1.4M11.6 9.8l.4 2M15 10l-.8 1.8M17 12.7l-1.8.8', ' stroke-opacity=".6"') + C(17.2, 19.6, 1, F),
  fly: P('M12 9.5v9') + P('M12 10.5C9 6.5 4.5 7 5 10s4.5 3 7 1.5M12 10.5c3-4 7.5-3.5 7-.5s-4.5 3-7 1.5', ' stroke-opacity=".8"') + C(12, 7.6, 1.5),
  heart: P('M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z'),
  cap: P('M3.8 12.5a8.2 6.4 0 0 1 16.4 0z') + P('M9.6 12.5v6.2a2.4 1.3 0 0 0 4.8 0v-6.2') + C(9, 9.6, 0.9, F) + C(14.6, 8.8, 1.1, F),
  moth: P('M12 7.5v11') + P('M12 9.5C8 4.5 3 6.5 4.5 10.5s5.5 2.5 7.5 1M12 9.5c4-5 9-3 7.5 1s-5.5 2.5-7.5 1M12 13.5c-3 0-6 2-5 4s4 .5 5-1.5M12 13.5c3 0 6 2 5 4s-4 .5-5-1.5') + P('M11 7.5c-.6-1.6-1.6-2.6-3-3M13 7.5c.6-1.6 1.6-2.6 3-3', ' stroke-opacity=".6"'),
  bone: P('M8.6 15.4l6.8-6.8') + C(6.6, 15.4, 1.8) + C(8.6, 17.4, 1.8) + C(15.4, 6.6, 1.8) + C(17.4, 8.6, 1.8),
  rod: P('M4 20.5 18.5 4') + C(7.6, 16.8, 1.7) + P('M18.5 4c1.4 3 1.5 6.2 1 9.3', ' stroke-opacity=".6"') + P('M19.5 13.3c0 1.3-1.7 1.3-1.7 0', ''),
  line: P('M7 5h10M7 19h10M8.5 5v14M15.5 5v14') + P('M8.5 8.5l7-1.3M8.5 12l7-1.3M8.5 15.5l7-1.3', ' stroke-opacity=".6"'),
  lantern: P('M9 4.2h6M12 2.5v1.7') + P('M8.2 6.5h7.6l-1 1.6v8l1 1.6H8.2l1-1.6v-8z') + P('M9 18.6h6l-.6 2H9.6z') + P('M12 10c.8 1 1.4 1.6 1.4 2.6a1.4 1.4 0 0 1-2.8 0c0-1 .6-1.6 1.4-2.6z', F),
  lens: C(11, 11, 6.5) + P('M7.6 9.8a3.8 3.8 0 0 1 3.2-2.6', ' stroke-opacity=".7"') + P('M15.8 15.8l4.2 4.2', ' stroke-width="2"'),
  brazier: P('M5 12.5h14l-2.5 4.5h-9z') + P('M9 17l-1.5 3.8M15 17l1.5 3.8') + SMALL_FLAME(9.5, 10, 1) + SMALL_FLAME(12.5, 9, 1.35) + SMALL_FLAME(15.5, 10, 1),
  hull: P('M3 13.5h18l-2.6 5H5.6z') + P('M12 13.5V3.5M12 4.8l5.2 6.6H12'),
  hearth: P('M5 20V11a7 7 0 0 1 14 0v9M3.5 20h17') + P('M12 11.5c1.1 1.5 2.4 2.4 2.4 4.2a2.4 2.4 0 0 1-4.8 0c0-1.6 1.1-2.6 2.4-4.2z', FO(0.6)),
  lure: P('M12 3c3 2 3.6 7 0 12-3.6-5-3-10 0-12z') + P('M12 15v2.8M12 17.8c0 2-1.9 2.4-2 .9') + P('M11 7c.4-.6.9-1 1.5-1.2', ' stroke-opacity=".6"'),
  feather: P('M18.5 3.5C11.5 4.5 6.5 10 6 20.5') + P('M18.5 3.5c.5 6-3 11-9.4 12.4') + P('M8.8 13.2l4-1M9.9 10.2l4-1M11.9 7.4l3-.8', ' stroke-opacity=".6"'),
  food: P('M4 14.5c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5v3H4z') + P('M8.5 10l1 2.5M12 9v3M15.5 10l-1 2.5', ' stroke-opacity=".6"'),
  map: P('M5 6.2l4.5-2 5 2 4.5-2v14l-4.5 2-5-2-4.5 2z') + P('M9.5 4.2v14M14.5 6.2v14', ' stroke-opacity=".5"') + P('M11 10.5l2 2M13 10.5l-2 2'),
  spoon: P('M14.6 3.5c1.8 0 3 1.8 3 4s-1.2 4-3 4-3-1.8-3-4 1.2-4 3-4z') + P('M13.4 11.2 6 20.5'),
  bundle: P('M7.4 9.5c-2 2-2.5 5-1.6 8 .7 2 2.8 3 6.2 3s5.5-1 6.2-3c.9-3 .4-6-1.6-8z') + P('M8.2 9.5c1-1.6 2.4-2 3.8-2s2.8.4 3.8 2M10 6l2 1.4L14 6'),
  scale: P('M5 9c0 6 3 10 7 12 4-2 7-6 7-12-2-3-4.5-4.5-7-4.5S7 6 5 9z') + P('M8 10c2.6-1.4 5.4-1.4 8 0M9 14c2-1 4-1 6 0', ' stroke-opacity=".55"'),
  bobber: C(12, 13, 4.5) + P('M7.5 13h9') + P('M12 8.5V4M12 4l2.2-1', '') + P('M3 20.2c2 .8 4 .8 6 0M15 20.2c2 .8 4 .8 6 0', ' stroke-opacity=".5"'),
  ledger: P('M6 3h9l3 3v15H6z') + P('M15 3v3h3') + P('M9 10h6M9 13h6M9 16h3.5', ' stroke-opacity=".6"'),
  reroll: P('M19 8.2a7.5 7.5 0 0 0-13.6 1.4M5 15.8a7.5 7.5 0 0 0 13.6-1.4') + P('M19 3.6v4.6h-4.6M5 20.4v-4.6h4.6'),
  revive: P('M9 21h6v-7.5H9z') + P('M12 13.5V12') + P('M12 5.5c.9 1.2 1.9 2 1.9 3.3a1.9 1.9 0 0 1-3.8 0c0-1.3 1-2.1 1.9-3.3z', F) + P('M17.5 3.5c.6.8 1.2 1.4 1.2 2.2a1.2 1.2 0 0 1-2.4 0c0-.8.6-1.4 1.2-2.2z', ' stroke-opacity=".7"'),
  waystone: P('M8 21l-1-11 3-6.2h4L17 10l-1 11z') + P('M11 9.5l2 2-2 2M12 15.8v1.4', ' stroke-opacity=".8"'),
  map_pin: C(12, 10, 3) + P('M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z'),
  sun: C(12, 12, 4) + P('M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4', ' stroke-opacity=".7"'),
  wave: P('M3 10c2.4 0 2.4-2 4.8-2s2.4 2 4.8 2 2.4-2 4.8-2 2.4 2 3.6 2M3 15c2.4 0 2.4-2 4.8-2s2.4 2 4.8 2 2.4-2 4.8-2 2.4 2 3.6 2', ''),
  hand: P('M7 21v-6.5L5 11a1.4 1.4 0 0 1 2.4-1.4L9 12V5a1.4 1.4 0 0 1 2.8 0v5.5V3.8a1.4 1.4 0 0 1 2.8 0v6.7V5.4a1.4 1.4 0 0 1 2.8 0V15c0 3-1.6 6-4.6 6z'),
  // ---------------------------------------------------------------- v3 HUD (DESIGN §25.5.7, §25.5.2)
  // Well-fed: a warm bowl with two curls of steam (replaces the satiety bar)
  wellfed: P('M3.8 12.6h16.4c-.4 4.2-3.8 7-8.2 7s-7.8-2.8-8.2-7z') + P('M9 19.2 8.2 21h7.6L15 19.2', ' stroke-opacity=".7"')
    + P('M9.6 9.6c-1.1-1.2.9-2.2-.1-3.6M14.4 9.6c-1.1-1.2.9-2.2-.1-3.6', ' stroke-opacity=".8"') + P('M7.2 15.2c1.3 1.2 2.9 1.8 4.8 1.8', ' stroke-opacity=".45"'),
  // a dock buoy-lamp on the water (the watch-lamp)
  watchlamp: P('M8.6 15.4h6.8l-1.1 3.6H9.7z') + P('M12 15.4v-5') + P('M10 6.4h4v4h-4z') + P('M9.4 6.4 12 4.2l2.6 2.2')
    + C(12, 8.5, 0.95, F) + P('M3 20.6c2 .8 4 .8 6 0M15 20.6c2 .8 4 .8 6 0', ' stroke-opacity=".55"'),
};
const ALIASES = { food_loaf: 'food', gear: 'rod', bait: 'worm', supplies: 'oil', sell: 'shell', heartmoss: 'heart', default: 'star' };

/** Inline SVG markup for a glyph. */
export function icon(name, { size = null, cls = '', title = '' } = {}) {
  const key = ICONS[name] ? name : ICONS[ALIASES[name]] ? ALIASES[name] : 'star';
  const sz = size ? ` width="${size}" height="${size}"` : '';
  return `<svg class="gw-ico ${cls}" viewBox="0 0 24 24"${sz} fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${title ? `<title>${title}</title>` : ''}${ICONS[key]}</svg>`;
}
export const hasIcon = (name) => !!(ICONS[name] || ALIASES[name]);

// ---------------------------------------------------------------- the ink brush
// "Drowned Filigree": every ornament is pale ink drawn with a pen, not a hairline. A centre line
// (absolute M/C path) is turned into a filled outline whose width swells and tapers, so each
// stroke has thick and thin and pointed ends. The left half of a symmetric piece is authored
// once and mirrored. Motifs: fishing line, hooks, floats, reeds, water rings and wax.
const nums = (d) => d.match(/-?\d*\.?\d+(?:e-?\d+)?/g).map(Number);
function segsOf(d) {
  const v = nums(d);
  const out = [];
  let x = v[0], y = v[1];
  for (let i = 2; i + 5 < v.length; i += 6) { out.push([x, y, v[i], v[i + 1], v[i + 2], v[i + 3], v[i + 4], v[i + 5]]); x = v[i + 4]; y = v[i + 5]; }
  return out;
}
const bz = (s, t) => { const u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, e = t * t * t; return [a * s[0] + b * s[2] + c * s[4] + e * s[6], a * s[1] + b * s[3] + c * s[5] + e * s[7]]; };
const bzd = (s, t) => { const u = 1 - t; return [3 * u * u * (s[2] - s[0]) + 6 * u * t * (s[4] - s[2]) + 3 * t * t * (s[6] - s[4]), 3 * u * u * (s[3] - s[1]) + 6 * u * t * (s[5] - s[3]) + 3 * t * t * (s[7] - s[5])]; };
const r2 = (v) => Math.round(v * 100) / 100;
const pt2 = (q) => `${r2(q[0])} ${r2(q[1])}`;
/** Mirror a centre line (all coordinates are x,y pairs) about x = W / 2. */
const flip = (d, W) => { let i = 0; return d.replace(/-?\d*\.?\d+(?:e-?\d+)?/g, (m) => (i++ % 2 === 0 ? r2(W - Number(m)) : m)); };

/** A pen stroke along `d`: width `w` at its fullest, `min` at the ends, fullest at `peak` (0..1). */
export function brush(d, { w = 2, min = 0.3, peak = 0.5, pow = 1, n = 16 } = {}) {
  const segs = segsOf(d);
  const P = [];
  segs.forEach((s, si) => {
    for (let i = si ? 1 : 0; i <= n; i++) {
      const t = i / n, p = bz(s, t);
      let [dx, dy] = bzd(s, t);
      if (Math.abs(dx) + Math.abs(dy) < 1e-6) [dx, dy] = bzd(s, t < 0.5 ? t + 0.01 : t - 0.01);
      const L = Math.hypot(dx, dy) || 1;
      P.push([p[0], p[1], -dy / L, dx / L]);
    }
  });
  const len = [0];
  for (let i = 1; i < P.length; i++) len.push(len[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const total = len[len.length - 1] || 1;
  const pk = Math.max(0.001, Math.min(0.999, peak));
  const A = [], B = [];
  P.forEach((p, i) => {
    const t = len[i] / total;
    const s = t < pk ? 0.5 * t / pk : 0.5 + 0.5 * (t - pk) / (1 - pk);
    const hw = (min + (w - min) * Math.pow(Math.sin(Math.PI * s), pow)) / 2;
    A.push([p[0] + p[2] * hw, p[1] + p[3] * hw]);
    B.push([p[0] - p[2] * hw, p[1] - p[3] * hw]);
  });
  return `M${A.map(pt2).join('L')}L${B.reverse().map(pt2).join('L')}Z`;
}
/** A filled dot (a bead, a drop of wax, a rivet). */
const dot = (x, y, r) => `M${r2(x - r)} ${r2(y)}A${r} ${r} 0 1 0 ${r2(x + r)} ${r2(y)}A${r} ${r} 0 1 0 ${r2(x - r)} ${r2(y)}Z`;
/** A closed calligraphic ring: a broad nib held at `nib` radians makes it thick and thin. */
function ring(cx, cy, rx, ry, { w = 3, min = 0.8, nib = -0.7, n = 72 } = {}) {
  const A = [], B = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
    const tx = -rx * Math.sin(a), ty = ry * Math.cos(a), L = Math.hypot(tx, ty) || 1;
    const nx = ty / L, ny = -tx / L;
    const hw = (min + (w - min) * Math.abs(Math.sin(Math.atan2(ty, tx) - nib))) / 2;
    A.push([x + nx * hw, y + ny * hw]); B.push([x - nx * hw, y - ny * hw]);
  }
  return `M${A.map(pt2).join('L')}ZM${B.reverse().map(pt2).join('L')}Z`;
}
// ---------------------------------------------------------------- the ornament family (UI style v2)
// Pale-ink line ornaments (currentColor) from the approved "Drowned Filigree" mockup: the
// filigree crest (hook curls, a cast line and reeds with a float in the centre) above headings,
// the flourish below, the hook curl that draws itself in beside a chosen item, the line-and-curl
// rule of the HUD and of section heads. They live once in an SVG sprite (spriteSvg(), injected
// into #ui) with the catch card's ink-wash and brush filters, and again as CSS mask images
// (--orn-*, ornamentCss()) for pseudo-elements. The brushed ring and ripple stay pen-drawn.
const SP = (d, w = 1.6, o = 1) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${o < 1 ? ` stroke-opacity="${o}"` : ''}/>`;
const MP = (d, w = 1.6, o = 1) => `<path d="${d}" fill="none" stroke="#000" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${o < 1 ? ` stroke-opacity="${o}"` : ''}/>`;
/** Each drawing: viewBox size and a list of [d, strokeWidth, opacity] strokes, plus raw fills. */
const FIL_HALF = [
  ['M244 26 C258 26 266 14 280 16 C294 18 292 34 280 33 C272 32 273 23 280 24', 1.6, 1],
  ['M286 26 L460 26', 1.6, 1],
  ['M460 26 C474 26 480 36 472 41 C464 46 456 38 462 33', 1.6, 1],
  ['M330 26 C340 14 356 12 364 20 M372 26 C380 36 396 38 404 30', 1.6, 0.8],
  ['M300 26 C304 18 312 16 316 20', 1.6, 0.6],
];
const DRAW = {
  crest: { W: 520, H: 52, strokes: [...FIL_HALF, ...FIL_HALF.map(([d, w, o]) => [flip(d, 520), w, o]),
    ['M260 16 L260 4 M253 27 L267 27', 1.6, 1], ['M267 27 C267 33 264 38 260 38 C256 38 253 33 253 27 C253 21 256 16 260 16 C264 16 267 21 267 27 Z', 1.6, 1]],
    fills: [dot(260, 44, 2)] },
  flourish: { W: 320, H: 28, strokes: [
    ['M172 14 L280 14 C290 14 296 8 304 10 C312 12 310 20 302 19', 1.5, 1], [flip('M172 14 L280 14 C290 14 296 8 304 10 C312 12 310 20 302 19', 320), 1.5, 1],
    ['M204 14 C210 8 218 7 222 10', 1.3, 0.6], [flip('M204 14 C210 8 218 7 222 10', 320), 1.3, 0.6],
    ['M148 19 C152 24 168 24 172 19', 1.3, 0.7]],
    fills: ['M160 2 C162.2 6.2 164.4 8.4 164.4 11.2 A4.4 4.4 0 0 1 155.6 11.2 C155.6 8.4 157.8 6.2 160 2 Z'] },
  rule: { W: 190, H: 16, strokes: [['M2 8 L150 8 C160 8 166 2 174 4 C182 6 180 14 172 13', 1.4, 1]], fills: [] },
  hook: { W: 64, H: 32, strokes: [['M60 16 L26 16 C14 16 8 7 14 3 C20 0 25 6 21 10', 1.8, 1], ['M26 16 C20 22 20 28 26 29', 1.8, 1]], fills: [dot(61.5, 16, 2)] },
  brush: { W: 100, H: 14, strokes: [['M3 9 C30 4 70 4 97 8', 5, 1]], fills: [] },
};
const strokesSvg = (dw, P = SP) => dw.strokes.map(([d, w, o]) => P(d, w, o)).join('') + dw.fills.map((d) => `<path d="${d}" fill="${P === SP ? 'currentColor' : '#000'}" stroke="none"/>`).join('');
/** The sprite: every line ornament as a <symbol>, plus the filters (one per page, in #ui). */
export function spriteSvg() {
  const sym = (id, dw) => `<symbol id="gw-${id}" viewBox="0 0 ${dw.W} ${dw.H}">${strokesSvg(dw)}</symbol>`;
  return `<svg class="gw-sprite" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden"><defs>
    ${sym('crest', DRAW.crest)}${sym('flourish', DRAW.flourish)}${sym('rule', DRAW.rule)}
    <filter id="gw-ink-edge" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="1.6"/></filter>
    <filter id="gw-brush" x="-8%" y="-40%" width="116%" height="180%"><feTurbulence type="fractalNoise" baseFrequency="0.06 0.5" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5"/></filter>
    <filter id="gw-brush-fx" x="-4%" y="-8%" width="108%" height="116%"><feTurbulence type="fractalNoise" baseFrequency="0.045 0.32" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="gw-stamp" x="-12%" y="-30%" width="124%" height="160%"><feTurbulence type="fractalNoise" baseFrequency="0.62" numOctaves="2" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="d"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -2.6 0 0 0 2.25" result="m"/><feComposite in="d" in2="m" operator="in"/></filter>
  </defs></svg>`;
}
const use = (id, dw, cls) => `<svg class="gw-orn ${cls}" viewBox="0 0 ${dw.W} ${dw.H}" aria-hidden="true" focusable="false"><use href="#gw-${id}"/></svg>`;
/** A hook curl drawn inline (each stroke its own path, so stroke-dashoffset can draw it in). */
const hookSvg = (side) => `<svg class="gw-hk gw-hk-${side}" viewBox="0 0 64 32" aria-hidden="true" focusable="false">${DRAW.hook.strokes.map(([d]) => `<path pathLength="100" d="${d}"/>`).join('')}<circle cx="61.5" cy="16" r="2"/></svg>`;
/** A brushed underline (the catch card's chosen action). */
const brushSvg = `<svg class="gw-brushline" viewBox="0 0 100 14" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path pathLength="100" filter="url(#gw-brush)" d="${DRAW.brush.strokes[0][0]}"/></svg>`;
// Medallion ring (level-up medals, the HUD level, edge markers, the joystick).
const RING = { W: 100, H: 100, ratio: 'xMidYMid meet', parts: [
  [ring(50, 50, 44, 44, { w: 3.2, min: 0.9, nib: -0.75 }), 1],
  [ring(50, 50, 38.5, 38.5, { w: 0.9, min: 0.45, nib: -0.75 }), 0.35],
  [dot(50, 3.6, 1.9), 1], [dot(50, 96.4, 1.9), 1],
] };
// Water ripple under a chosen tile / a leaping fish.
const RIPPLE = { W: 200, H: 30, ratio: 'xMidYMid meet', parts: [
  [brush('M60 13 C78 22.4 122 22.4 140 13', { w: 2, min: 0.2 }), 1],
  [brush('M66 11.6 C84 5.2 116 5.2 134 11.6', { w: 0.9, min: 0.15 }), 0.4],
  [brush('M26 15 C60 31 140 31 174 15', { w: 1.4, min: 0.1 }), 0.6],
  [brush('M4 17.6 C50 34 150 34 196 17.6', { w: 0.9, min: 0.05 }), 0.3],
] };
const byOpacity = (parts) => {
  const g = new Map();
  for (const [d, o] of parts) { if (!g.has(o)) g.set(o, []); g.get(o).push(d); }
  return [...g].map(([o, ds]) => `<path d="${ds.join('')}"${o < 1 ? ` fill-opacity="${o}"` : ''}/>`).join('');
};
const inlineFill = (pc, cls) => `<svg class="gw-orn ${cls}" viewBox="0 0 ${pc.W} ${pc.H}" aria-hidden="true" fill="currentColor" fill-rule="evenodd">${byOpacity(pc.parts)}</svg>`;
const enc = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
const maskFill = (pc) => enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${pc.W} ${pc.H}" preserveAspectRatio="${pc.ratio}" fill="#000" fill-rule="evenodd">${byOpacity(pc.parts)}</svg>`);
const maskStroke = (dw, ratio = 'xMidYMid meet') => enc(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dw.W} ${dw.H}" preserveAspectRatio="${ratio}">${strokesSvg(dw, MP)}</svg>`);

/** The ornaments as markup. */
export const ORN = {
  crest: use('crest', DRAW.crest, 'gw-orn-crest'),
  divider: use('crest', DRAW.crest, 'gw-orn-crest'),
  flourish: use('flourish', DRAW.flourish, 'gw-orn-flourish'),
  rule: use('rule', DRAW.rule, 'gw-orn-rule'),
  hookL: hookSvg('l'),
  hookR: hookSvg('r'),
  brush: brushSvg,
  ring: inlineFill(RING, 'gw-orn-ring'),
  ripple: inlineFill(RIPPLE, 'gw-orn-ripple'),
  titleTop: use('crest', DRAW.crest, 'gw-orn-crest gw-title-orn'),
  titleBottom: '',
  corner: '',
};
/** CSS custom properties holding the same drawings as mask images (appended to ui.css). */
export function ornamentCss() {
  const v = {
    crest: maskStroke(DRAW.crest), flourish: maskStroke(DRAW.flourish), rule: maskStroke(DRAW.rule, 'xMaxYMid meet'),
    hook: maskStroke(DRAW.hook), brush: maskStroke(DRAW.brush, 'none'), ring: maskFill(RING), ripple: maskFill(RIPPLE),
  };
  return `\n.gw-ui{${Object.entries(v).map(([k, u]) => `--orn-${k}:${u};`).join('')}}\n`;
}


// ---------------------------------------------------------------- class seals (DESIGN §25.6.8)
// Prize = a bone-white ink stamp of a knotted cord · Trophy = an oxblood wax seal · Elder = a black wax seal with a ribbon
// (Ancient: a gold thread round it). Drawn on a 40×40 grid; the knot is the same cord loop on all three.
const KNOT = 'M12.5 21.5c3.2-.2 5.2-2.6 5.2-5.1s-1.8-4-3.8-4-3.6 1.6-3.2 3.7c.5 2.9 4.4 5 9.3 5.4 4.4.3 8.2-1.3 8.6-4.1.3-2.1-1.4-3.7-3.4-3.6-2.3.1-3.6 2.4-2.9 4.8.9 3.3 4.4 5 7.2 5.6';
const WAX = 'M20 4.6c3.3-.6 5.3 1.4 7.6 2.2 2.4.8 5.3.7 6.4 3.3 1 2.4-.6 4.7-.2 7.2.4 2.6 2.3 4.6 1.4 7.2-1 2.7-3.9 3.2-5.6 5.2-1.7 2-2.3 4.9-5 5.9-2.6.9-4.8-1.2-7.4-1.4-2.7-.2-5.4 1.4-7.7.1-2.3-1.4-2.1-4.3-3.4-6.5-1.3-2.2-3.9-3.6-3.9-6.4 0-2.7 2.6-4 3.6-6.3 1-2.4.5-5.4 2.6-6.9 2.2-1.6 5-.2 7.6-.8z';
export function sealSvg(seal, { ancient = false, cls = '' } = {}) {
  const box = (inner) => `<svg class="gw-seal ${cls}" viewBox="0 0 40 40" aria-hidden="true" focusable="false">${inner}</svg>`;
  if (seal === 'inkStamp') {
    return box(`<g class="gw-seal-ink" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" filter="url(#gw-stamp)">
      <circle cx="20" cy="20" r="16.4" stroke-width="2.4"/><circle cx="20" cy="20" r="13.2" stroke-width="1" stroke-dasharray="1.6 2.2"/>
      <path d="${KNOT}" stroke-width="2" transform="translate(0 2)"/></g>`);
  }
  const ribbon = seal === 'blackWaxRibbon'
    ? '<path class="gw-seal-rib" d="M14 28 9.5 38.5l3.6-1.4 2 3.2L19 30M26 28l4.5 10.5-3.6-1.4-2 3.2L21 30"/>' : '';
  const thread = ancient ? '<circle class="gw-seal-gold" cx="20" cy="20" r="18.2" fill="none" stroke-width="1.3" stroke-dasharray="3.2 1.4"/>' : '';
  const wax = seal === 'oxbloodWax' ? 'gw-seal-ox' : 'gw-seal-black';
  return box(`${ribbon}<path class="gw-seal-wax ${wax}" d="${WAX}"/><circle class="gw-seal-rim" cx="20" cy="20" r="11.6" fill="none" stroke-width="1.2"/>
    <path class="gw-seal-knot" d="${KNOT}" fill="none" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 2)"/>${thread}`);
}

// ---------------------------------------------------------------- portraits
const hex = (n, d = '#888') => (typeof n === 'number' && isFinite(n) ? '#' + (n >>> 0).toString(16).padStart(6, '0').slice(-6) : (typeof n === 'string' ? n : d));

/** A small candle-creature portrait drawn from a character's `look`. */
export function wickPortrait(look = {}, { locked = false, uid = 'w' } = {}) {
  const flame = hex(look.flame, '#ffb347'), cloak = hex(look.cloak, '#4a2e24'), eyes = hex(look.eyes, '#ffb347');
  const wax = hex(look.wax, '#e9dfc6');
  const s = Math.max(0.75, Math.min(1.2, Number(look.scale) || 1));
  const hat = look.hat || 'none';
  const wide = s > 1.12 ? 1.18 : s < 0.85 ? 0.92 : 1;      // Tallow broad, Stub small
  const tall = hat === 'tall' ? 16 : 0;
  const ink = '#07080d';
  const inkFill = locked ? ink : null;
  const bodyW = 30 * wide, bodyX = 50 - bodyW / 2;
  const top = 46 - tall + (s < 0.85 ? 8 : 0);
  const flameScale = s < 0.85 ? 1.45 : hat === 'hood' && wide > 1.1 ? 0.8 : 1;
  const g = `g${uid}`;
  const cloakPath = `M${50 - 26 * wide} 112 C${50 - 25 * wide} 90 ${50 - 20 * wide} 72 ${50 - 15 * wide} ${top + 24} L${50 + 15 * wide} ${top + 24} C${50 + 20 * wide} 72 ${50 + 25 * wide} 90 ${50 + 26 * wide} 112 l-6 -4 -5 5 -6 -5 -5 5 -6 -5 -6 5 -6 -5 -5 5 -6 -5 -6 5z`;
  const hood = hat === 'hood' ? `<path d="M${50 - 19 * wide} ${top + 30} C${50 - 22 * wide} ${top + 4} ${50 - 10} ${top - 6} 50 ${top - 7} C${50 + 10} ${top - 6} ${50 + 22 * wide} ${top + 4} ${50 + 19 * wide} ${top + 30} Z" fill="${inkFill || cloak}" stroke="${ink}" stroke-width="2.2"/>` : '';
  const candle = `<path d="M${bodyX} ${top + 6} q0 -6 6 -6 h${bodyW - 12} q6 0 6 6 v${30 + tall * 0.2} h-${bodyW} z" fill="${inkFill || wax}" stroke="${ink}" stroke-width="2.2"/>
    <path d="M${bodyX + 5} ${top + 1} q2 7 4 0 q3 9 6 1 q2 6 4 -1" fill="none" stroke="${locked ? '#1a1d24' : 'rgba(0,0,0,.18)'}" stroke-width="1.6"/>`;
  const face = `<ellipse cx="50" cy="${top + 19}" rx="${10 * wide}" ry="8" fill="${locked ? '#0f1116' : '#120d0c'}"/>
    <ellipse cx="${50 - 4.2 * wide}" cy="${top + 19}" rx="2.3" ry="3" fill="${locked ? '#2a2d34' : eyes}" class="gw-eye"/>
    <ellipse cx="${50 + 4.2 * wide}" cy="${top + 19}" rx="2.3" ry="3" fill="${locked ? '#2a2d34' : eyes}" class="gw-eye"/>`;
  const fl = `<g transform="translate(50 ${top - 2}) scale(${flameScale})">
    <path d="M0 -26 C5 -16 12 -10 12 -1 A12 12 0 0 1 -12 -1 C-12 -8 -7 -12 -4 -17 C-3 -12 -1 -10 1 -9 C-1 -15 -1 -20 0 -26z" fill="${locked ? '#191b21' : flame}" stroke="${locked ? '#2a2d34' : 'none'}" stroke-width="1.2" class="gw-pflame"/>
    ${locked ? '' : `<path d="M0 -10 C2.5 -6 5 -4 5 -0.5 A5 5 0 0 1 -5 -0.5 C-5 -4 -2.5 -6 0 -10z" fill="#fff6dc" opacity=".9"/>`}
    <path d="M0 0v3" stroke="${ink}" stroke-width="1.6"/></g>`;
  const glow = locked ? '' : `<radialGradient id="${g}"><stop offset="0" stop-color="${flame}" stop-opacity=".55"/><stop offset="1" stop-color="${flame}" stop-opacity="0"/></radialGradient>`;
  const rim = locked ? `<path d="${cloakPath}" fill="none" stroke="rgba(214,214,228,.18)" stroke-width="1"/>` : `<path d="M${50 + 15 * wide} ${top + 24} C${50 + 20 * wide} 72 ${50 + 25 * wide} 90 ${50 + 26 * wide} 112" fill="none" stroke="rgba(214,214,228,.45)" stroke-width="1.2"/>`;
  return `<svg class="gw-portrait" viewBox="0 0 100 120" aria-hidden="true"><defs>${glow}</defs>
    ${locked ? '' : `<circle cx="50" cy="${top - 14}" r="34" fill="url(#${g})" class="gw-pglow"/>`}
    <ellipse cx="50" cy="114" rx="${30 * wide}" ry="4" fill="rgba(0,0,0,.45)"/>
    <path d="M${50 - 9 * wide} 108 v6 M${50 + 9 * wide} 108 v6" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>
    ${candle}${fl}${hood}<path d="${cloakPath}" fill="${inkFill || cloak}" stroke="${ink}" stroke-width="2.2" stroke-linejoin="round"/>${rim}${face}
    ${locked ? '<text x="50" y="92" text-anchor="middle" class="gw-portrait-q">?</text>' : ''}</svg>`;
}

/** Old Murk: a hunched umber toad under a towering pack, a dim sage lamp (the UI's one green trace). */
export function murkPortrait() {
  return `<svg class="gw-murk" viewBox="0 0 140 120" aria-hidden="true">
    <defs><radialGradient id="murkLamp"><stop offset="0" stop-color="#d2ecc8" stop-opacity=".8"/><stop offset=".4" stop-color="#8fbf88" stop-opacity=".25"/><stop offset="1" stop-color="#8fbf88" stop-opacity="0"/></radialGradient></defs>
    <circle cx="112" cy="40" r="30" fill="url(#murkLamp)" class="gw-murk-glow"/>
    <path d="M34 88 C30 50 40 22 62 14 C76 9 92 14 96 30 L98 88 Z" fill="#0f0c0a" stroke="#07080d" stroke-width="2"/>
    <path d="M44 30 h44 M42 46 h50 M40 62 h54 M40 76 h56" stroke="rgba(200,180,150,.2)" stroke-width="2"/>
    <path d="M62 14 c-2 -8 4 -12 10 -10" fill="none" stroke="rgba(200,180,150,.34)" stroke-width="1.5"/>
    <path d="M96 30 q14 -18 16 -4 v8" fill="none" stroke="#2c2722" stroke-width="2.4"/>
    <path d="M106 34 h12 l-2 4 h-8 z M108 38 h8 l1.5 9 h-11 z" fill="#1d1916" stroke="#07080d" stroke-width="1.2"/>
    <circle cx="112" cy="43" r="3.2" fill="#e0f4d6" class="gw-murk-flame"/>
    <path d="M14 118 C10 94 22 74 46 70 C58 54 86 54 98 70 C120 74 132 96 126 118 Z" fill="#2a241e" stroke="#07080d" stroke-width="2.2"/>
    <path d="M30 96 c8 -4 14 -2 18 2 M92 98 c6 -5 14 -4 20 1 M58 108 c4 -3 10 -3 14 0" fill="none" stroke="rgba(200,180,150,.26)" stroke-width="2"/>
    <ellipse cx="54" cy="74" rx="11" ry="8" fill="#1e1a16" stroke="#07080d" stroke-width="2"/><ellipse cx="90" cy="74" rx="11" ry="8" fill="#1e1a16" stroke="#07080d" stroke-width="2"/>
    <path d="M45 75 q9 -6 18 0 q-9 3 -18 0z" fill="#e8d66a" class="gw-murk-eye"/><path d="M81 75 q9 -6 18 0 q-9 3 -18 0z" fill="#e8d66a" class="gw-murk-eye"/>
    <path d="M47 72 q7 -3 14 0 M83 72 q7 -3 14 0" stroke="#2a241e" stroke-width="3" fill="none"/>
    <path d="M34 92 q38 14 76 0" fill="none" stroke="#07080d" stroke-width="2.4"/>
    <path d="M62 64 h20" stroke="rgba(214,214,228,.25)" stroke-width="1.2"/>
    <path d="M22 106 c10 -20 30 -32 50 -34" fill="none" stroke="rgba(214,214,228,.22)" stroke-width="1.2"/>
    <path d="M62 14 C76 9 92 14 96 30 L98 70" fill="none" stroke="rgba(200,180,150,.5)" stroke-width="1.2"/>
    <path d="M98 70 C120 74 132 96 126 118" fill="none" stroke="rgba(200,180,150,.46)" stroke-width="1.2"/></svg>`;
}

/** A small drowned lantern for the Shrine; lit = 0..1 (level / maxLevel). */
export function relicLantern(lit = 0, { hidden = false, color = '#f0a64c', uid = 'r' } = {}) {
  const k = Math.max(0, Math.min(1, lit));
  const id = `rl${uid}`;
  const glass = hidden ? '#0b0d11' : k > 0 ? `url(#${id}g)` : '#12161c';
  return `<svg class="gw-relic-lantern" viewBox="0 0 48 72" aria-hidden="true">
    <defs><radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${0.15 + 0.6 * k}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1d10"/><stop offset="1" stop-color="${color}" stop-opacity="${0.25 + 0.55 * k}"/></linearGradient></defs>
    ${k > 0 && !hidden ? `<circle cx="24" cy="40" r="${16 + 8 * k}" fill="url(#${id})" class="gw-relic-glow"/>` : ''}
    <path d="M24 0 v10" stroke="rgba(214,214,228,.35)" stroke-width="1" stroke-dasharray="2 2"/>
    <circle cx="24" cy="12" r="3" fill="none" stroke="rgba(214,214,228,.55)" stroke-width="1.2"/>
    <path d="M15 20 h18 l-3 -5 h-12 z" fill="#14171d" stroke="#07080d" stroke-width="1.2"/>
    <path d="M14 20 h20 l-2 4 v22 l2 4 h-20 l2 -4 v-22 z" fill="${glass}" stroke="${hidden ? 'rgba(214,214,228,.18)' : 'rgba(214,214,228,.6)'}" stroke-width="1.2"/>
    <path d="M20 24 v22 M28 24 v22" stroke="rgba(7,8,13,.8)" stroke-width="1.2"/>
    ${k > 0 && !hidden ? `<g transform="translate(24 45) scale(${0.7 + 0.7 * k})"><path d="M0 -10 C2.5 -6 5 -4 5 -0.5 A5 5 0 0 1 -5 -0.5 C-5 -4 -2.5 -6 0 -10z" fill="${color}" class="gw-relic-flame"/><path d="M0 -4 C1 -2.6 2 -1.8 2 -0.4 A2 2 0 0 1 -2 -0.4 C-2 -1.8 -1 -2.6 0 -4z" fill="#fff3d6"/></g>` : `<path d="M24 41 v3" stroke="rgba(214,214,228,.25)" stroke-width="1.2"/>`}
    <path d="M14 50 h20 l-3 5 h-14 z" fill="#14171d" stroke="#07080d" stroke-width="1.2"/>
    ${hidden ? '<text x="24" y="42" text-anchor="middle" class="gw-relic-q">?</text>' : ''}</svg>`;
}

// ---------------------------------------------------------------- night-mode vignettes (New Descent, DESIGN §25.5.1, U17)
// Small pen-and-ink scenes (160×64) for the mode cards: pale ink in currentColor, one warm or cool accent each. Still: a
// crescent and its broken reflection on flat water; Lantern: a lantern on a crooked pole, a few far motes of Gloom with
// pink eyes; Gloomtide: Gloom rising in tendrils from a rough sea, many eyes; First Outing: the little raft, its candle and a
// cast line under a crescent.
const VB = (inner, cls = '') => `<svg class="gw-vig-svg ${cls}" viewBox="0 0 160 64" aria-hidden="true" focusable="false">${inner}</svg>`;
const BP = (d, o = {}, extra = '') => `<path d="${brush(d, o)}" fill="currentColor"${extra}/>`;
const waterLines = (o = 1) => BP('M10 50 C40 49 80 49 112 50', { w: 1.6, min: 0.2 }, o < 1 ? ` fill-opacity="${o}"` : '')
  + BP('M30 55 C60 54.4 96 54.4 140 55.2', { w: 1.3, min: 0.2 }, ` fill-opacity="${0.7 * o}"`) + BP('M54 59.6 C80 59.2 110 59.2 132 59.8', { w: 1, min: 0.15 }, ` fill-opacity="${0.45 * o}"`);
/** A crescent: the disc at (x, y) less the same disc moved right by 0.72 r (the arcs meet at the two cusps). */
const crescent = (x, y, r, fill, op = 1) => {
  const d = r * 0.72, cx = x + d / 2, hh = Math.sqrt(r * r - (d * d) / 4);
  return `<path d="M${r2(cx)} ${r2(y - hh)}A${r} ${r} 0 1 0 ${r2(cx)} ${r2(y + hh)}A${r} ${r} 0 0 1 ${r2(cx)} ${r2(y - hh)}Z" fill="${fill}" fill-opacity="${op}"/>`;
};
const star = (x, y, r = 0.9, op = 0.8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="currentColor" fill-opacity="${op}"/>`;
const glow = (x, y, r, color, op) => [1, 0.66, 0.38].map((k, i) => `<circle cx="${x}" cy="${y}" r="${r * k}" fill="${color}" fill-opacity="${op * (0.35 + i * 0.32)}"/>`).join('');
const eyes = (x, y, s = 1) => `<circle cx="${x - 1.6 * s}" cy="${y}" r="${0.85 * s}" fill="#e7a3bd"/><circle cx="${x + 1.6 * s}" cy="${y}" r="${0.85 * s}" fill="#e7a3bd"/>`;
export function modeVignette(id) {
  if (id === 'still') {
    return VB(`${star(34, 14)}${star(56, 26, 0.7, 0.6)}${star(20, 30, 0.8, 0.5)}${star(76, 10, 0.6, 0.55)}${star(142, 30, 0.7, 0.5)}
      ${glow(112, 20, 13, '#e8be77', 0.08)}${crescent(112, 20, 8.5, '#efd7a4')}
      ${waterLines()}${BP('M104 53 C108 52.6 114 52.6 118 53', { w: 1.6, min: 0.3 }, ' style="fill:#e8be77" fill-opacity=".55"')}
      ${BP('M107 57.4 C110 57.1 113 57.1 116 57.4', { w: 1.2, min: 0.2 }, ' style="fill:#e8be77" fill-opacity=".35"')}
      ${BP('M18 60 C19 50 20 42 24 33', { w: 1.3, min: 0.2 }, ' fill-opacity=".7"')}${BP('M24 60 C25 52 27 46 31 40', { w: 1.1, min: 0.2 }, ' fill-opacity=".5"')}`, 'gw-vig-still');
  }
  if (id === 'lantern') {
    return VB(`${star(22, 12, 0.7, 0.5)}${star(128, 8, 0.7, 0.45)}
      ${BP('M30 62 C34 40 44 22 66 12 C72 9.6 78 10 80 14', { w: 1.9, min: 0.5, peak: 0.3 })}${BP('M80 14 C80 16 80 18 80 20', { w: 1, min: 0.6 })}
      ${glow(80, 30, 15, '#ed9e3b', 0.12)}
      <path d="M75.4 22h9.2l-1.4 2.2v9.6l1.4 2.2h-9.2l1.4-2.2v-9.6z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M80 26.2c1.3 1.6 2.2 2.6 2.2 4a2.2 2.2 0 0 1-4.4 0c0-1.4.9-2.4 2.2-4z" fill="#f2b45a"/>
      ${waterLines()}${BP('M74 52.4 C78 52 82 52 86 52.4', { w: 1.6, min: 0.3 }, ' style="fill:#ed9e3b" fill-opacity=".5"')}
      <g class="gw-vig-gloom" fill-opacity=".55">${BP('M124 40 C120 34 126 30 130 32 C134 34 132 40 128 42', { w: 2.6, min: 0.4 }, ' style="fill:#7d73b8"')}${eyes(128, 35.5, 0.8)}
      ${BP('M142 30 C139 25 144 22 147 24 C150 26 148 31 145 32', { w: 2.2, min: 0.4 }, ' style="fill:#7d73b8"')}${eyes(145.5, 26.6, 0.65)}
      ${BP('M110 22 C108 18 112 16 114 17.4 C116 19 114 22 112 23', { w: 1.7, min: 0.3 }, ' style="fill:#7d73b8"')}</g>`, 'gw-vig-lantern');
  }
  if (id === 'gloomtide') {
    return VB(`${crescent(30, 16, 7, '#efd7a4', 0.35)}
      ${BP('M8 48 C18 42 26 46 34 48 C44 51 50 42 62 44 C72 46 78 50 90 46 C102 42 110 48 122 46 C134 44 142 48 152 46', { w: 1.8, min: 0.3 })}
      ${BP('M14 55 C30 51 44 56 60 53 C76 50 92 56 108 53 C124 50 138 55 150 53', { w: 1.3, min: 0.2 }, ' fill-opacity=".6"')}
      ${BP('M18 60.4 C50 58.6 100 59.2 142 60', { w: 1, min: 0.15 }, ' fill-opacity=".4"')}
      <g style="fill:#8b80c8" fill-opacity=".72">${BP('M58 46 C52 34 64 26 60 14 C58 8 64 6 66 10', { w: 3.2, min: 0.5, peak: 0.25 })}${BP('M92 45 C98 34 86 26 94 16 C98 11 104 13 102 18', { w: 3, min: 0.5, peak: 0.25 })}
      ${BP('M120 45 C116 36 126 30 122 22', { w: 2.4, min: 0.4, peak: 0.3 })}${BP('M40 46 C36 38 44 34 42 26', { w: 2.2, min: 0.4, peak: 0.3 })}</g>
      ${eyes(62, 24, 1)}${eyes(95, 26, 1.1)}${eyes(122, 32, 0.8)}${eyes(42, 34, 0.75)}${eyes(76, 36, 0.7)}${eyes(108, 18, 0.6)}${eyes(136, 26, 0.6)}`, 'gw-vig-gloomtide');
  }
  // the First Outing: the raft, its candle, a cast line to a float, under a crescent
  return VB(`${star(26, 12, 0.8, 0.6)}${star(48, 22, 0.6, 0.5)}${star(140, 14, 0.7, 0.5)}${glow(118, 18, 11, '#e8be77', 0.07)}${crescent(118, 18, 7, '#efd7a4')}
    ${glow(60, 38, 9, '#ed9e3b', 0.13)}
    <path d="M44 47h32l-3 3.6H47z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M52 47v3.4M60 47v3.4M68 47v3.4" stroke="currentColor" stroke-width=".9" stroke-opacity=".6"/>
    <path d="M58.4 40.6h3.2v6.4h-3.2z" fill="currentColor" fill-opacity=".85"/><path d="M60 35.2c1 1.3 1.7 2 1.7 3.1a1.7 1.7 0 0 1-3.4 0c0-1.1.7-1.8 1.7-3.1z" fill="#f2b45a"/>
    ${BP('M64 46 C72 34 84 26 98 22', { w: 1.3, min: 0.3, peak: 0.2 })}<path d="M98 22 C106 30 112 40 116 49" fill="none" stroke="currentColor" stroke-width=".6" stroke-opacity=".55"/>
    <circle cx="116.4" cy="49.6" r="1.6" fill="#e05a48"/>
    ${waterLines()}`, 'gw-vig-first');
}
