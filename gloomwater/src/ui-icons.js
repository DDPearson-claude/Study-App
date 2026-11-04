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
/** A float (bobber) standing on the water: antenna, a hollow cap, a painted lower half. */
function bobber(x, y, s = 1, { ring: rings = true } = {}) {
  const k = (v) => r2(v * s);
  const out = [];
  out.push([brush(`M${x} ${y - k(15)} C${x} ${y - k(13)} ${x} ${y - k(11)} ${x} ${y - k(8.6)}`, { w: 1.5 * s, min: 0.5 * s, peak: 0.7 }), 1]);
  // cap: hollow upper half (ink rim), body: solid lower half; joined by a band
  out.push([`M${r2(x - k(5.4))} ${r2(y - k(1))}C${r2(x - k(5.4))} ${r2(y - k(6.4))} ${r2(x - k(2.6))} ${r2(y - k(9))} ${x} ${r2(y - k(9))}C${r2(x + k(2.6))} ${r2(y - k(9))} ${r2(x + k(5.4))} ${r2(y - k(6.4))} ${r2(x + k(5.4))} ${r2(y - k(1))}Z`, 0.32]);
  out.push([brush(`M${r2(x - k(5.4))} ${r2(y - k(1))} C${r2(x - k(5.4))} ${r2(y - k(6.4))} ${r2(x - k(2.6))} ${r2(y - k(9))} ${x} ${r2(y - k(9))} C${r2(x + k(2.6))} ${r2(y - k(9))} ${r2(x + k(5.4))} ${r2(y - k(6.4))} ${r2(x + k(5.4))} ${r2(y - k(1))}`, { w: 1.4 * s, min: 0.7 * s, peak: 0.5 }), 1]);
  out.push([`M${r2(x - k(5.6))} ${r2(y - k(0.6))}C${r2(x - k(5.6))} ${r2(y + k(4.6))} ${r2(x - k(2.4))} ${r2(y + k(7.6))} ${x} ${r2(y + k(7.6))}C${r2(x + k(2.4))} ${r2(y + k(7.6))} ${r2(x + k(5.6))} ${r2(y + k(4.6))} ${r2(x + k(5.6))} ${r2(y - k(0.6))}Z`, 1]);
  if (rings) {
    out.push([brush(`M${r2(x - k(11))} ${r2(y + k(8.6))} C${r2(x - k(6))} ${r2(y + k(11.6))} ${r2(x + k(6))} ${r2(y + k(11.6))} ${r2(x + k(11))} ${r2(y + k(8.6))}`, { w: 1.3 * s, min: 0.2 * s }), 0.8]);
    out.push([brush(`M${r2(x - k(18))} ${r2(y + k(10))} C${r2(x - k(9))} ${r2(y + k(15.4))} ${r2(x + k(9))} ${r2(y + k(15.4))} ${r2(x + k(18))} ${r2(y + k(10))}`, { w: 0.9 * s, min: 0.15 * s }), 0.45]);
  }
  return out;
}

/** Assemble a symmetric ornament: `half` parts are mirrored about the centre, `mid` parts are not. */
function piece(W, H, half, mid = [], { cls = '', ratio = 'xMidYMid meet' } = {}) {
  const parts = [];
  for (const p of half) {
    if (p.dot) { parts.push([dot(p.dot[0], p.dot[1], p.dot[2]), p.o ?? 1]); parts.push([dot(W - p.dot[0], p.dot[1], p.dot[2]), p.o ?? 1]); continue; }
    parts.push([brush(p.d, p), p.o ?? 1]);
    parts.push([brush(flip(p.d, W), p), p.o ?? 1]);
  }
  for (const p of mid) parts.push(Array.isArray(p) ? p : p.dot ? [dot(p.dot[0], p.dot[1], p.dot[2]), p.o ?? 1] : [p.raw || brush(p.d, p), p.o ?? 1]);
  return { W, H, parts, cls, ratio };
}
const byOpacity = (parts) => {
  const g = new Map();
  for (const [d, o] of parts) { if (!g.has(o)) g.set(o, []); g.get(o).push(d); }
  return [...g].map(([o, ds]) => `<path d="${ds.join('')}"${o < 1 ? ` fill-opacity="${o}"` : ''}/>`).join('');
};
/** Inline SVG markup (ink in currentColor). */
const inline = (pc, cls = pc.cls) => `<svg class="gw-orn ${cls}" viewBox="0 0 ${pc.W} ${pc.H}" preserveAspectRatio="${pc.ratio}" aria-hidden="true" fill="currentColor" fill-rule="evenodd">${byOpacity(pc.parts)}</svg>`;
/** A data: URL of the same drawing, for CSS masks (the colour comes from the element). */
const maskUrl = (pc) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${pc.W} ${pc.H}" preserveAspectRatio="${pc.ratio}" fill="#000" fill-rule="evenodd">${byOpacity(pc.parts)}</svg>`)}")`;

// ---------------------------------------------------------------- the ornament family
const P_ = {};
// Selection twin (left of an item; the right one is the same drawing flipped): a scroll of line
// curls off a swelling cast of fishing line that ends at a float standing beside the item.
P_.twin = piece(64, 30, [], [
  { d: 'M17 16 C11 16 6 14.4 6 11 C6 8 9.4 6.8 11.2 8.4 C12.6 9.7 11.8 11.8 10 11.6', w: 2, min: 0.35, peak: 0.25 },
  { d: 'M17 16 C26 15 36 16.8 46 15.6', w: 1.7, min: 0.55, peak: 0.45 },
  { d: 'M27 15.6 C25.4 12.6 22.6 10.4 19.6 9.4', w: 1.3, min: 0.1, peak: 0.35, o: 0.75 },
  { dot: [3, 15.4, 1.1], o: 0.7 },
  ...bobber(52.5, 15.6, 0.92).map(([raw, o]) => ({ raw, o })),
]);
// Heading crest: a float hangs on its line; slack line sweeps out to both sides and curls into
// scrolls, reeds rise off it, and the line runs out to a bead.
P_.crest = piece(320, 46, [
  { d: 'M150 24 C136 27 124 21 110 21 C97 21 90 28.5 94.5 33 C98 36.4 103.8 33.4 101.4 29.6', w: 2.8, min: 0.4, peak: 0.32 },
  { d: 'M110 21 C84 20.4 54 24.6 20 24.4', w: 1.5, min: 0.2, peak: 0.12 },
  { d: 'M126 23.4 C122.6 17.6 116.4 12.6 108.4 9.6', w: 1.9, min: 0.1, peak: 0.35, o: 0.85 },
  { d: 'M131.5 24.6 C131 19 132.4 14.6 135.4 11', w: 1.3, min: 0.1, peak: 0.4, o: 0.7 },
  { dot: [16, 24.4, 1.5] },
  { dot: [62, 22.6, 1.1], o: 0.8 },
], [
  { d: 'M160 1 C160 4 160 7 160 10', w: 1.1, min: 0.25, peak: 0.9, o: 0.7 },
  ...bobber(160, 25, 1.25).map(([raw, o]) => ({ raw, o })),
]);
// Closing flourish: a drop falls into rings; line runs out to each side and lifts into a curl.
P_.flourish = piece(320, 30, [
  { d: 'M136 17 C114 14 92 13.4 70 15.6 C58 16.8 50 13.6 52 9.6 C53.6 6.6 58.4 7.2 57.8 10.4', w: 2.2, min: 0.3, peak: 0.22 },
  { d: 'M70 15.6 C52 17.6 34 18 16 17', w: 1.1, min: 0.15, peak: 0.1 },
  { dot: [12, 17, 1.2] },
], [
  { raw: 'M160 3.2C161.6 6.2 163.6 7.8 163.6 10.2A3.6 3.6 0 0 1 156.4 10.2C156.4 7.8 158.4 6.2 160 3.2Z', o: 1 },
  { d: 'M146 16 C150.6 21.4 169.4 21.4 174 16', w: 1.7, min: 0.25 },
  { d: 'M148 15 C152 11.6 168 11.6 172 15', w: 0.8, min: 0.2, o: 0.45 },
  { d: 'M132 18 C140 26.6 180 26.6 188 18', w: 1.2, min: 0.15, o: 0.6 },
]);
// Section rule: a single tapered stroke (stretched to fit; thick at the label, thin outward).
P_.taper = { W: 200, H: 8, parts: [['M0 4C60 3.95 150 3.1 200 2.9L200 5.1C150 4.9 60 4.05 0 4Z', 1]], cls: '', ratio: 'none' };
// Swash: a short brushed underline (primary actions, the active tab).
P_.swash = piece(120, 12, [], [
  { d: 'M6 7.4 C28 4.6 46 8.4 60 6.2 C74 4 92 8.2 114 5.6', w: 2.2, min: 0.25, peak: 0.5 },
  { dot: [3.2, 7.6, 1] }, { dot: [116.8, 5.4, 1] },
]);
// Medallion ring (level-up cards, the HUD level, the journal plate).
P_.ring = { W: 100, H: 100, cls: '', ratio: 'xMidYMid meet', parts: [
  [ring(50, 50, 44, 44, { w: 4.2, min: 1, nib: -0.75 }), 1],
  [ring(50, 50, 38.5, 38.5, { w: 1, min: 0.5, nib: -0.75 }), 0.35],
  [dot(50, 3.2, 2.1), 1], [dot(50, 96.8, 2.1), 1],
  [brush('M50 94 C50 98 48 99.6 46.4 99', { w: 1.2, min: 0.2 }), 0.8],
] };
// Water ripple under a chosen tile / a leaping fish.
P_.ripple = piece(200, 30, [], [
  { d: 'M60 13 C78 22.4 122 22.4 140 13', w: 2.2, min: 0.2 },
  { d: 'M66 11.6 C84 5.2 116 5.2 134 11.6', w: 0.9, min: 0.15, o: 0.4 },
  { d: 'M26 15 C60 31 140 31 174 15', w: 1.5, min: 0.1, o: 0.6 },
  { d: 'M4 17.6 C50 34 150 34 196 17.6', w: 0.9, min: 0.05, o: 0.3 },
]);
// Wax seal (the NEW / RECORD stamps): a wobbly disc with two drips and an inner rim.
P_.seal = (() => {
  const n = 64, R = 30, pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = R * (1 + 0.045 * Math.sin(a * 5 + 0.6) + 0.03 * Math.sin(a * 9 + 2.1) + 0.02 * Math.sin(a * 13));
    pts.push([36 + r * Math.cos(a), 34 + r * Math.sin(a)]);
  }
  const disc = `M${pts.map(pt2).join('L')}Z`;
  const drips = 'M23 56C22.6 62 24.4 66 26.2 66C28 66 28.6 61.6 28 57.4ZM44.6 59C44.6 64.4 46 70 48 70C50 70 50.6 64 49.6 58Z';
  return { W: 72, H: 72, cls: '', ratio: 'xMidYMid meet', parts: [[disc + ring(36, 34, 23.5, 23.5, { w: 1.6, min: 0.6, nib: -0.6 }), 1], [drips, 0.99]] };
})();
// The title lock-up: a lantern-float hangs from a long line above the name; reeds and rings
// mark the waterline below it, where the name is mirrored.
P_.titleCrest = piece(560, 96, [
  { d: 'M266 66 C236 76 196 80 156 75 C124 71 106 62 111 52 C115 44.6 125.6 46.6 123.2 54', w: 3.2, min: 0.4, peak: 0.3 },
  { d: 'M156 75 C120 79 80 80.4 30 78', w: 1.6, min: 0.2, peak: 0.12 },
  { d: 'M196 77.4 C190 68 180.6 60 168 54.4', w: 2.1, min: 0.1, peak: 0.35, o: 0.85 },
  { d: 'M204.6 77.8 C204.4 69 207 61.6 212 55.6', w: 1.5, min: 0.1, peak: 0.4, o: 0.7 },
  { d: 'M88 79.4 C85.6 73.4 81.4 69.4 76 67', w: 1.2, min: 0.1, peak: 0.4, o: 0.6 },
  { dot: [25, 78, 1.8] }, { dot: [56, 79.2, 1.2], o: 0.8 },
], [
  { d: 'M280 0 C280 12 280 24 280 33', w: 1.3, min: 0.4, peak: 0.95, o: 0.75 },
  // lantern: bail, cap, glass (the flame is drawn by the page), base, and a hook below
  { d: 'M272.4 40 C272.4 33.4 287.6 33.4 287.6 40', w: 1.6, min: 0.6 },
  { raw: 'M270 44.4L290 44.4L287 40L273 40Z', o: 1 },
  { d: 'M272 45 C271 52 271 61 272 68', w: 1.8, min: 0.9 },
  { d: 'M288 45 C289 52 289 61 288 68', w: 1.8, min: 0.9 },
  { raw: 'M269 68L291 68L288.4 72.6L271.6 72.6Z', o: 1 },
  { d: 'M280 72.6 C280 78 280 82 280 86 C280 91.4 274 92 273.4 88 C273.2 86.6 274.4 85.4 275.6 86', w: 1.7, min: 0.3, peak: 0.6 },
]);
P_.waterline = piece(560, 46, [
  { d: 'M280 18 C200 17.4 110 17 26 18.4', w: 1.8, min: 0.2, peak: 0.02 },
  { d: 'M54 18.6 C52 12 47 5.6 38.6 1.4', w: 2.2, min: 0.1, peak: 0.3, o: 0.9 },
  { d: 'M62 18.4 C62 11 64 5 68 0.4', w: 1.8, min: 0.1, peak: 0.3, o: 0.8 },
  { d: 'M70 18.2 C71.6 13.4 75 9.6 79.6 7', w: 1.4, min: 0.1, peak: 0.35, o: 0.65 },
  { d: 'M46 18.8 C42 14.6 37 12.4 31.4 12', w: 1.2, min: 0.1, peak: 0.4, o: 0.55 },
  { dot: [20, 18.6, 1.6] },
], [
  { d: 'M252 22 C262 30.4 298 30.4 308 22', w: 1.9, min: 0.2 },
  { d: 'M232 24 C246 37 314 37 328 24', w: 1.3, min: 0.12, o: 0.6 },
  { d: 'M206 26 C230 44 330 44 354 26', w: 0.9, min: 0.06, o: 0.32 },
]);

/** The ornaments as inline SVG (currentColor). */
export const ORN = {
  crest: inline(P_.crest, 'gw-orn-crest'),
  divider: inline(P_.crest, 'gw-orn-crest'),
  flourish: inline(P_.flourish, 'gw-orn-flourish'),
  twin: inline(P_.twin, 'gw-orn-twin'),
  swash: inline(P_.swash, 'gw-orn-swash'),
  ring: inline(P_.ring, 'gw-orn-ring'),
  ripple: inline(P_.ripple, 'gw-orn-ripple'),
  seal: inline(P_.seal, 'gw-orn-seal'),
  titleTop: `<svg class="gw-orn gw-title-orn" viewBox="0 0 560 96" aria-hidden="true" fill="currentColor" fill-rule="evenodd"><defs><radialGradient id="gwOrnGlow"><stop offset="0" stop-color="#ffb347" stop-opacity=".6"/><stop offset=".45" stop-color="#ff9a3c" stop-opacity=".18"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient></defs><circle cx="280" cy="56" r="40" fill="url(#gwOrnGlow)" class="gw-orn-glow"/>${byOpacity(P_.titleCrest.parts)}<path class="gw-orn-flame" d="M280 49c2 3 4.4 4.8 4.4 8.2a4.4 4.4 0 0 1-8.8 0c0-3.4 2.4-5.2 4.4-8.2z"/></svg>`,
  titleBottom: inline(P_.waterline, 'gw-title-water'),
  corner: '',
  rule: inline(P_.taper, 'gw-rule'),
};
/** CSS custom properties holding the same drawings as mask images (appended to ui.css). */
export function ornamentCss() {
  const v = Object.entries({ twin: P_.twin, crest: P_.crest, flourish: P_.flourish, taper: P_.taper, swash: P_.swash, ring: P_.ring, ripple: P_.ripple, seal: P_.seal })
    .map(([k, pc]) => `--orn-${k}:${maskUrl(pc)};`).join('');
  return `\n.gw-ui{${v}}\n`;
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
  const rim = locked ? `<path d="${cloakPath}" fill="none" stroke="rgba(233,226,207,.18)" stroke-width="1"/>` : `<path d="M${50 + 15 * wide} ${top + 24} C${50 + 20 * wide} 72 ${50 + 25 * wide} 90 ${50 + 26 * wide} 112" fill="none" stroke="rgba(233,226,207,.45)" stroke-width="1.2"/>`;
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
    <path d="M62 64 h20" stroke="rgba(233,226,207,.25)" stroke-width="1.2"/>
    <path d="M22 106 c10 -20 30 -32 50 -34" fill="none" stroke="rgba(233,226,207,.22)" stroke-width="1.2"/>
    <path d="M62 14 C76 9 92 14 96 30 L98 70" fill="none" stroke="rgba(200,180,150,.5)" stroke-width="1.2"/>
    <path d="M98 70 C120 74 132 96 126 118" fill="none" stroke="rgba(200,180,150,.46)" stroke-width="1.2"/></svg>`;
}

/** A small drowned lantern for the Shrine; lit = 0..1 (level / maxLevel). */
export function relicLantern(lit = 0, { hidden = false, color = '#ffc46b', uid = 'r' } = {}) {
  const k = Math.max(0, Math.min(1, lit));
  const id = `rl${uid}`;
  const glass = hidden ? '#0b0d11' : k > 0 ? `url(#${id}g)` : '#12161c';
  return `<svg class="gw-relic-lantern" viewBox="0 0 48 72" aria-hidden="true">
    <defs><radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${0.15 + 0.6 * k}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1d10"/><stop offset="1" stop-color="${color}" stop-opacity="${0.25 + 0.55 * k}"/></linearGradient></defs>
    ${k > 0 && !hidden ? `<circle cx="24" cy="40" r="${16 + 8 * k}" fill="url(#${id})" class="gw-relic-glow"/>` : ''}
    <path d="M24 0 v10" stroke="rgba(233,226,207,.35)" stroke-width="1" stroke-dasharray="2 2"/>
    <circle cx="24" cy="12" r="3" fill="none" stroke="rgba(233,226,207,.55)" stroke-width="1.2"/>
    <path d="M15 20 h18 l-3 -5 h-12 z" fill="#14171d" stroke="#07080d" stroke-width="1.2"/>
    <path d="M14 20 h20 l-2 4 v22 l2 4 h-20 l2 -4 v-22 z" fill="${glass}" stroke="${hidden ? 'rgba(233,226,207,.18)' : 'rgba(233,226,207,.6)'}" stroke-width="1.2"/>
    <path d="M20 24 v22 M28 24 v22" stroke="rgba(7,8,13,.8)" stroke-width="1.2"/>
    ${k > 0 && !hidden ? `<g transform="translate(24 45) scale(${0.7 + 0.7 * k})"><path d="M0 -10 C2.5 -6 5 -4 5 -0.5 A5 5 0 0 1 -5 -0.5 C-5 -4 -2.5 -6 0 -10z" fill="${color}" class="gw-relic-flame"/><path d="M0 -4 C1 -2.6 2 -1.8 2 -0.4 A2 2 0 0 1 -2 -0.4 C-2 -1.8 -1 -2.6 0 -4z" fill="#fff3d6"/></g>` : `<path d="M24 41 v3" stroke="rgba(233,226,207,.25)" stroke-width="1.2"/>`}
    <path d="M14 50 h20 l-3 5 h-14 z" fill="#14171d" stroke="#07080d" stroke-width="1.2"/>
    ${hidden ? '<text x="24" y="42" text-anchor="middle" class="gw-relic-q">?</text>' : ''}</svg>`;
}
