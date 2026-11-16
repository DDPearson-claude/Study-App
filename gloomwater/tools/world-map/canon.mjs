// The Waxwold, as data. Every coordinate, name and line here comes from the loop docs:
//   docs/loop/WORLD.md (the continent: outline, regions, rivers, waters, route, places, the Chart; v2.1,
//                       the road that only goes forward: §6.1 is the rule, §12 lists what moved)
//   docs/loop/LORE.md  (the story: the four acts, each water's chapter, Murk's lines)
//   docs/loop/SPEC.md §5.2 (the sixteen waters, their kinds and lushness steps)
//   docs/loop/ROSTER.md §3 (each water's legend and her line)
// Chart units: 1000 x 1400, x east, y south (WORLD.md "Coordinates"). The generator adds PAD units
// of sheet all round: open sea out to the neatline (NEAT units in from the sheet's edge), then the
// border band the four reach cartouches sit in, then a plain vellum edge. Nothing canon lives there.

export const SHEET = { W: 1000, H: 1400, PAD: 80, EDGE: 12, NEAT: 46 };
export const SEED = 1611; // 16 waters, 1 road, 1 hearth

// ---- coast (WORLD.md §2 "Outline", clockwise from the north-west cape). The Rime Sound, the Salt
// Gate's funnel, the Landing's cove and the lagoon are cut afterwards (INLETS), so their mouths
// are plain coast here.
export const OUTLINE = [
  [118, 285], [140, 232], [182, 196], [236, 174], [292, 158], [350, 168], [410, 160], [470, 172], [528, 190], [566, 196],
  [586, 184], [600, 181], [614, 184], [636, 196], [690, 182], [748, 166], [800, 150], [858, 132], [872, 160], [846, 210],
  [858, 262], [842, 330], [856, 400], [838, 460], [852, 520],
  [820, 568], [760, 600], [704, 632], [660, 670], [646, 712], [676, 746], [732, 760], [792, 772], [846, 792],
  [880, 832], [888, 880], [876, 930], [862, 952], [858, 985], [866, 1012], [900, 1032], [934, 1050], [948, 1085], [930, 1120],
  [905, 1150], [860, 1190], [800, 1225], [735, 1255], [668, 1270], [640, 1300], [612, 1336], [588, 1300], [548, 1285],
  [470, 1300], [400, 1290], [338, 1262], [285, 1215], [248, 1160], [228, 1100], [214, 1050], [210, 1022], [204, 990],
  [196, 940], [184, 880], [176, 828], [200, 812], [214, 798], [178, 778], [146, 768], [150, 735], [168, 690], [160, 640],
  [150, 590], [138, 530], [130, 470], [140, 410], [148, 362], [146, 342], [140, 318], [128, 300],
];

// [x, y, rx, ry, rotation in degrees]
export const ISLANDS = [
  { id: 'lampRock', at: [110, 440], rx: 3.6, ry: 2.6, rot: 20 },
  { id: 'farIsle', at: [55, 495], rx: 9, ry: 6, rot: -25 },
  { id: 'northIsleA', at: [444, 120], rx: 5, ry: 2.6, rot: 12 },
  { id: 'northIsleB', at: [456, 113], rx: 3, ry: 1.8, rot: -20 },
  { id: 'northIsleC', at: [463, 123], rx: 2, ry: 1.4, rot: 30 },
  { id: 'northIsleD', at: [433, 112], rx: 1.6, ry: 1.2, rot: 0 },
  { id: 'morningIsle', at: [947, 638], rx: 8, ry: 5, rot: 35 },
  { id: 'barrierIsleA', at: [946, 1136], rx: 7, ry: 1.9, rot: 62 },
  { id: 'barrierIsleB', at: [956, 1118], rx: 5, ry: 1.6, rot: 75 },
  { id: 'barrierIsleC', at: [936, 1152], rx: 4.5, ry: 1.5, rot: 50 },
  { id: 'southWestIsle', at: [215, 1242], rx: 7.5, ry: 5, rot: -30 },
  { id: 'reefKeyA', at: [132, 752], rx: 1.9, ry: 1.1, rot: 40 },
  { id: 'reefKeyB', at: [136.5, 757], rx: 1.3, ry: 0.9, rot: 10 },
  { id: 'reefKeyC', at: [129, 760], rx: 1.1, ry: 0.8, rot: -20 },
];

// Sea inlets cut into the land: a centre line with a half-width at each point [x, y, halfWidth].
export const INLETS = [
  // the Rime Sound: mouth (146,333) to its head (290,302), about 145 km, a sill at the mouth. Its old north arm
  // near the mouth is gone: the Thin Water's sand delta (184,306) has filled it
  { id: 'rimeSound', pts: [[128, 340, 8.5], [146, 333, 6.4], [160, 331.5, 5.2], [174, 324, 6.4], [188, 323.5, 5], [200, 318, 6.2], [211, 311.5, 4.8], [222, 312.5, 5.8], [234, 316, 4.4], [246, 312.5, 4.8], [257, 308.5, 4.1], [268, 309, 3.4], [279, 305, 3.6], [291, 302, 2.6]] },
  { id: 'rimeArm', pts: [[198, 320, 2.8], [203, 333, 2.3], [212, 342, 1.9], [215, 353, 1.1]] },
  // the Salt Gate: a funnel estuary from the sea in to the fall line (WORLD.md §2: (212,1020) in to (262,1004), out at (205,992))
  { id: 'saltGate', pts: [[184, 1004, 24], [198, 1006, 17.5], [212, 1008, 13], [226, 1009, 8.2], [240, 1008, 5.4], [252, 1006.5, 3.4], [262, 1003, 2.1], [269, 997, 1.2]] },
  // the Landing's cove under the outer wall
  { id: 'cove', pts: [[600.5, 170, 4.6], [600.5, 179, 3.4], [600.3, 185.5, 2.8], [600, 190, 2.3]] },
  // the lagoon's one tidal inlet through the barrier (856,985)
  { id: 'tidalInlet', pts: [[848, 985, 2.3], [858, 985.5, 2.3], [874, 986.5, 3.6]] },
  // the mouth of the west-face stream at (164,471); the fjord coast's other drowned valleys are grown by the
  // seeded generator (terrain.mjs), as WORLD.md §2 only says the coast is "broken into skerries"
  { id: 'fjordD', pts: [[124, 469, 3.2], [140, 471, 2.6], [154, 470.5, 1.8], [166, 471, 1]] },
  // a firth on the never-charted east coast (the generator's own: the outline only gives its ends)
  { id: 'eastFirth', pts: [[884, 462, 8], [862, 467, 5.6], [842, 472, 4], [824, 479, 2.6], [810, 487, 1.3]] },
];
// Water bodies joined to the sea (brackish): cut like inlets, but as blobs. Lanternroot Lagoon lies close
// behind its barrier spit (860,952), with the one tidal inlet at (856,985).
export const LAGOON = { blobs: [[838, 984, 16, 27, 6], [848, 968, 7.2, 13, 4], [828, 966, 10, 11, 0], [842, 1002, 9, 10, 0], [824, 992, 9, 8, 0], [840, 960, 7, 7, 0]] };
// Land kept whatever the coast noise does: the lagoon's barrier spit, the Turn, the two horns.
export const KEEP_LAND = [
  { pts: [[876, 930], [867, 946], [861.5, 961], [859.5, 974], [859, 980.4]], hw: 2.3 },
  { pts: [[859.4, 990.8], [861, 1001], [866, 1011], [874, 1018]], hw: 2.3 },
  { pts: [[176, 777], [160, 771], [147, 768.5]], hw: 3 }, // the Reef Bay's north headland (the Turn)
  { pts: [[655, 1268], [634, 1298], [616, 1326], [612.5, 1333]], hw: 5 }, // the Low Horn
  { pts: [[812, 158], [840, 146], [856, 136]], hw: 4.5 }, // the Grey Horn
];

// Sea kept open whatever the coast's noise does: the sailed sea ways of the Lamp Road (WORLD.md §5-§6: out
// over the Sound's sill, down the fjord coast to the bight off the Pyre's mouth, into the bight to the mouth
// itself, and on down the Long Coast), the open sea outside the lagoon's spit, and the Morning Gulf to its
// head at (660,670) (646,712). A point may carry its own half-width.
export const KEEP_SEA = [
  { pts: [[146, 333], [124, 343], [106, 372], [98, 414], [100, 452], [113, 520], [130, 560], [136, 574], [128, 606], [137, 680], [133, 730], [131, 748], [136, 762]], hw: 7 },
  { pts: [[136, 574, 7], [150, 573, 5.6], [160, 572.4, 4.2], [167, 572, 2.8]] },
  { pts: [[133, 767], [141, 778], [160, 787], [185, 793], [206, 797]], hw: 6 },
  { pts: [[100, 452], [108, 446]], hw: 16 },
  { pts: [[60, 480], [100, 452]], hw: 6 },
  { pts: [[886, 934], [873, 950], [866.6, 966], [865.4, 986], [868.4, 1001], [878, 1011]], hw: 5 },
  { pts: [[1070, 664, 110], [960, 668, 100], [880, 672, 92], [820, 676, 84], [760, 683, 64], [712, 690, 44], [684, 697, 30], [664, 693, 13]] },
];
// Bays cut into the land and capes added to it, [x, y, rx, ry, rotation]. WORLD.md §2 gives the outline as
// a run of points to be drawn "as ink, not as a polygon"; these give the long stretches between the canon
// points their bights and headlands. None is near a water, a river mouth or a named place, and most lie on
// the never-charted east and south coasts.
export const COAST = {
  bays: [
    [160, 214, 14, 9, -40], [492, 184, 18, 12, 15], [716, 180, 20, 13, -12], [860, 222, 16, 14, 0], [846, 345, 26, 18, -10],
    [944, 1097, 9, 8, 0], [936, 1054, 5.5, 5, 0], [872, 1178, 20, 12, -35], [716, 1273, 34, 21, -12], [540, 1300, 30, 18, 10],
    [362, 1286, 18, 11, 25], [232, 1128, 12, 16, 0], [186, 912, 13, 20, 8], [152, 712, 9, 14, 0], [158, 566, 14, 18, 0],
  ],
  capes: [
    [420, 151, 26, 12, -8], [772, 151, 16, 9, -20], [872, 292, 22, 12, 20], [874, 412, 24, 11, -15], [868, 528, 18, 10, 30],
    [874, 786, 18, 9, 20], [947, 1071, 11, 5, 8], [934, 1124, 10, 5, 35], [925, 1038, 9, 4.5, -25], [806, 1232, 22, 10, -25],
    [440, 1303, 26, 10, 4], [262, 1196, 20, 11, 50], [174, 858, 12, 9, 0], [158, 632, 11, 8, 0],
  ],
};
// How rough the ground is, 0..1.4 [x, y, roughness]: stone highland and ranges high, flats and basins low.
export const ROUGH = [[480, 330, 0.7], [560, 420, 0.7], [420, 420, 0.75], [600, 300, 0.6], [400, 540, 0.14], [440, 590, 0.18], [740, 330, 0.5], [760, 450, 0.55],
  [700, 560, 0.45], [820, 300, 0.4], [820, 500, 0.4], [200, 300, 1.1], [190, 430, 1.2], [200, 560, 1.0], [300, 400, 1.3], [280, 560, 1.3],
  [450, 680, 0.32], [580, 660, 0.32], [330, 690, 0.6], [350, 790, 0.36], [400, 900, 0.36], [300, 930, 0.42], [505, 790, 1.1], [560, 790, 0.9],
  [640, 900, 0.1], [720, 960, 0.07], [600, 1100, 0.05], [760, 1080, 0.04], [450, 1100, 0.07], [300, 1070, 0.07], [880, 1080, 0.03],
  [820, 880, 0.1], [700, 800, 0.3], [400, 1220, 1.1], [480, 1250, 1.0], [340, 1180, 0.8], [600, 1200, 0.35], [720, 1200, 0.22],
  [620, 1290, 0.7], [830, 160, 0.6], [700, 200, 0.5], [500, 200, 0.6], [230, 250, 0.5], [180, 880, 0.3], [220, 1100, 0.3], [250, 1160, 0.5]];

// ---- lakes [id, level in metres, blobs [x, y, rx, ry, rot]]. kind: 'lake' | 'pan' (seasonal) | 'tarn' | 'mere'
export const LAKES = [
  { id: 'mossmere', level: 300, blobs: [[585, 251, 17, 11.5, -8], [574, 256, 8, 6, 0], [597, 247, 7, 6, 0]] },
  { id: 'sporewood', level: 420, blobs: [[520, 305, 10.5, 7.5, -25], [509, 312.5, 6, 4.6, 10], [531, 298.5, 5.6, 4.4, 0], [524, 314, 4, 3, 0]] },
  { id: 'glasswater', level: 500, blobs: [[457, 366, 19, 10.5, -18], [444, 356, 8, 6, -30]] },
  { id: 'pallid', level: 520, blobs: [[377, 427, 27, 15, -8], [376, 442, 10, 12, 0], [393, 420, 11, 9, 0]] },
  { id: 'icelake', level: 120, blobs: [[214, 218, 6.5, 12, 15]] },
  { id: 'reservoir', level: 640, blobs: [[286, 830, 15, 7.5, 28], [305, 841, 14, 9.5, 24], [322, 852, 12.5, 10, 10], [296, 847, 6, 5, 0], [312, 832, 6, 4.5, 0], [278, 824, 7, 5.5, 20], [330, 862, 6, 5, 0]] },
  { id: 'slough', level: 15, blobs: [[318, 1062, 7.5, 4.2, 30], [326, 1066.5, 4, 2.6, 10]] },
  { id: 'highTarn', level: null, blobs: [[660, 262, 6, 3.8, 15]] },
  { id: 'crater', level: null, blobs: [[730, 330, 5.6, 5.2, 0]], crater: true },
  { id: 'hillLake', level: null, blobs: [[520, 770, 5.2, 3.4, -20]] },
  { id: 'southLake', level: null, blobs: [[430, 1210, 7, 4.2, 25]] },
  { id: 'pans1', level: null, kind: 'pan', blobs: [[397, 929, 9.5, 5, -12]] },
  { id: 'pans2', level: null, kind: 'pan', blobs: [[413, 941, 6, 3.4, 20]] },
  { id: 'pans3', level: null, kind: 'pan', blobs: [[384, 943, 4, 2.6, 0]] },
  { id: 'pans4', level: null, kind: 'pan', blobs: [[428, 928, 3.4, 2.2, 30]] },
  // black meres in the flooded forest of the Orchard Basin (the generator's own; WORLD.md §5.16 speaks of
  // creeks that lead to hidden ponds)
  { id: 'mere1', level: null, kind: 'mere', blobs: [[676, 934, 3.4, 2.3, 20]] },
  { id: 'mere2', level: null, kind: 'mere', blobs: [[622, 904, 2.8, 1.9, -10]] },
  { id: 'mere3', level: null, kind: 'mere', blobs: [[736, 946, 2.6, 1.9, 40]] },
  { id: 'mere4', level: null, kind: 'mere', blobs: [[760, 925, 3.1, 2.1, 0]] },
  { id: 'mere5', level: null, kind: 'mere', blobs: [[612, 962, 2.7, 2.0, 15]] },
  { id: 'mere6', level: null, kind: 'mere', blobs: [[700, 1014, 2.4, 1.7, -30]] },
];
// the Hundred Tarns (470,455): scattered rock-basin tarns, placed by the seeded generator
export const TARNS = { at: [470, 455], radius: 26, count: 22 };

// ---- natural rivers: [x, y, metres above the sea]. Courses are WORLD.md §4 and §8; heights follow §9.
// meander: [amplitude, wavelength] in chart units; cls sets the drawn weight.
export const RIVERS = [
  { id: 'lockwater', name: 'the Lockwater', cls: 'kingdom', w: [1.1, 1.7], meander: [6.5, 26], pins: [0, 2, 4], bank: 5,
    pts: [[476, 360, 500], [495, 335, 462], [520, 305, 420], [550, 280, 362], [585, 250, 300]] },
  { id: 'sluiceRun', name: 'the Sluice Run', cls: 'kingdom', w: [1.6, 1.7], meander: [1.5, 10], bank: 10,
    pts: [[585, 250, 300], [589, 236, 297], [592, 222, 285], [596, 206, 250], [599.5, 193, 20], [600, 189, 0]] },
  { id: 'melt', name: null, cls: 'stream', meander: [4, 18], pins: [0, 5], bank: 9,
    pts: [[330, 280, 1500], [350, 303, 1000], [378, 313, 760], [404, 341, 590], [432, 343, 520], [440, 350, 500]] },
  { id: 'fallway', name: 'the Fallway', cls: 'river', w: [1.2, 1.7], meander: [2.8, 14], bank: 20,
    pts: [[350, 418, 520], [338, 409, 500], [325, 400, 470], [305, 385, 400], [282, 360, 250], [262, 336, 90], [256, 314, 0]] },
  // the ice-lake (214,216), the old weir (210,232), down its sand valley to the delta's upper bars (186,300), where
  // the Chart pins the water, the delta (184,306) and its mouth (178,322) on the Rime Sound's north shore
  { id: 'thinWater', name: 'the Thin Water', cls: 'braided', meander: [1.8, 13], bank: 4,
    pts: [[214, 216, 120], [210, 232, 112], [204, 250, 84], [200, 268, 58], [192, 288, 30], [186, 300, 15], [184, 306, 9], [178, 322, 0]] },
  // the Pyre Peaks' west icefall (250,615), the snow temple (240,607), Pyrefall Gorge (228,601), the gorge mouth
  // (200,589), the fan (182,580) and the mouth in the bight (166,572): west down the Spine's wet face to the sea.
  // Its banks are steep (`bank`): between the two spurs of RANGES below, its valley is the gorge's notch
  { id: 'pyre', name: 'the Pyre', cls: 'river', w: [0.5, 1.6], meander: [3.2, 16], bank: 19,
    pts: [[250, 615, 2400], [240, 607, 1150], [228, 601, 640], [214, 595, 330], [200, 589, 140], [182, 580, 36], [166, 572, 0]] },
  { id: 'rush', name: 'the Rush', cls: 'river', w: [0.5, 1.7], meander: [4.6, 22], bank: 5,
    pts: [[482, 770, 1150], [450, 790, 900], [410, 815, 760], [372, 835, 680], [352, 845, 645], [322, 852, 640], [272, 822, 640],
      [262, 818, 600], [250, 812, 420], [243, 808, 260], [234, 804, 120], [222, 800, 22], [208, 797.5, 0]] },
  { id: 'sweetwater', name: 'the Sweetwater', cls: 'river', w: [1.0, 1.8], meander: [5, 24], bank: 5,
    pts: [[322, 858, 640], [318, 872, 632], [305, 915, 520], [290, 955, 330], [277, 984, 60], [272, 993, 30], [269, 997, 0]] },
  { id: 'siltway', name: 'the Siltway', cls: 'great', meander: [10, 44], bank: 1,
    pts: [[300, 1175, 520], [320, 1152, 220], [340, 1130, 90], [372, 1105, 24], [398, 1094, 10], [450, 1092, 9.2], [510, 1108, 8.4],
      [575, 1112, 7.4], [640, 1095, 6.4], [700, 1072, 5.4], [745, 1066, 4.4], [758, 1068, 4], [775, 1092, 3.5], [805, 1085, 2.8],
      [842, 1070, 2], [872, 1064, 1.2], [905, 1062, 0.6], [942, 1070, 0]] },
  { id: 'northArm', name: null, cls: 'arm', meander: [2.2, 13], bank: 1,
    pts: [[842, 1070, 2.2], [847, 1055, 1.6], [848, 1040, 1.1], [843, 1024, 0.6], [838, 1010, 0]] },
  { id: 'southArm', name: null, cls: 'arm', meander: [2.8, 15], bank: 1,
    pts: [[842, 1070, 2.2], [866, 1084, 1.5], [890, 1100, 0.9], [912, 1112, 0.4], [930, 1121, 0]] },
  { id: 'midArm', name: null, cls: 'arm', meander: [2, 12], bank: 1,
    pts: [[872, 1064, 1.4], [886, 1054, 0.9], [902, 1046, 0.4], [920, 1041, 0]] },
  // east through the flooded forest to the drowned orchard (780,906), the Parting (798,930), then its shoal
  // lower reach south behind the lagoon to the Seam (758,1068)
  { id: 'inkwood', name: 'the Inkwood', cls: 'black', meander: [8.5, 27], pins: [0, 5, 6, 10], bank: 1,
    pts: [[560, 830, 140], [600, 858, 70], [645, 880, 40], [690, 894, 24], [735, 900, 15], [780, 906, 10], [798, 930, 8.5], [794, 962, 7], [784, 998, 5.8], [772, 1034, 4.8], [758, 1068, 4]] },
  // from the Parting east into the lagoon's north end (838,956); its head is a sill above the Inkwood: an overflow
  { id: 'monsoonCut', name: 'the Monsoon Cut', cls: 'seasonal', meander: [2, 12], bank: 1,
    pts: [[798.6, 930.4, 9.4], [801.4, 932, 9.2], [805, 934.6, 8.2], [812, 940, 5.6], [826, 948, 2.2], [838, 956, 0]] },
  { id: 'clearRiver', name: 'the clear river', cls: 'clear', meander: [5, 22], pins: [0, 4], bank: 3,
    pts: [[470, 880, 520], [476, 920, 260], [482, 960, 120], [500, 1040, 26], [520, 1104, 8.3]] },
  { id: 'southRiver', name: null, cls: 'river', meander: [3.4, 17], pins: [0, 3], bank: 4,
    pts: [[470, 1250, 760], [484, 1215, 380], [500, 1180, 160], [540, 1112, 7.9]] },
  { id: 'gulfRiver', name: null, cls: 'river', meander: [3, 16], pins: [0, 4], bank: 5,
    pts: [[540, 760, 900], [565, 748, 520], [590, 735, 280], [640, 705, 24], [649, 711, 0]] },
  { id: 'forestRiver', name: null, cls: 'river', meander: [5.5, 22], pins: [0, 4], bank: 1.5,
    pts: [[640, 830, 80], [680, 823, 55], [720, 815, 36], [800, 800, 10], [862, 810, 0]] },
  { id: 'downsRiver', name: null, cls: 'river', meander: [5, 22], pins: [0, 4], bank: 4,
    pts: [[648, 304, 520], [680, 380, 470], [712, 470, 380], [735, 560, 170], [749, 608, 0]] },
  { id: 'northStream', name: null, cls: 'stream', meander: [2.2, 12], pins: [0, 2], bank: 6,
    pts: [[700, 250, 400], [720, 210, 210], [741, 169, 0]] },
  { id: 'westStreamA', name: null, cls: 'stream', meander: [2.4, 12], bank: 22,
    pts: [[290, 460, 2300], [274, 467, 1500], [260, 463, 1150], [243, 472, 700], [222, 468, 430], [203, 476, 230], [185, 471, 120], [164, 471, 0]] },
  { id: 'westStreamB', name: null, cls: 'stream', meander: [2.4, 12], bank: 20,
    pts: [[250, 640, 2500], [238, 650, 1500], [226, 648, 1050], [212, 660, 560], [196, 657, 300], [180, 667, 120], [165, 665, 0]] },
  // the Pyre Peaks' north-east icefall (276,610), out of the foothills at (335,545), across the Shingle Flats to
  // the Pallid Deep's south end (376,452): the same snow as the Pyre's, on the far side of the divide. No leg
  // of the road. (Last in the list, so every older river keeps its own seeded meanders.)
  { id: 'flourwater', name: 'the Flourwater', cls: 'river', w: [0.5, 1.6], meander: [3.2, 16], bank: 11,
    pts: [[276, 610, 2100], [290, 598, 1420], [304, 590, 1110], [314, 578, 1000], [322, 563, 880], [335, 545, 760], [352, 505, 650], [368, 470, 562], [376, 452, 520]] },
];

// ---- the kingdom's canals (works, not rivers: they cross divides at fed summits)
export const CANALS = [
  { id: 'summitCut', name: 'the Summit Cut', pts: [[404, 420], [424, 402], [440, 380], [449, 371]], level: 521,
    locks: [[443, 377], [446, 374], [449, 371]] },
  // from the gate lock on the Salt Gate's south bank (241,1014), seaward of the sweet pool; `rise` is its water's
  // height at each point (it climbs to its summit at Lampmoss Slough and falls to the Canal Mouth)
  { id: 'straightCanal', name: 'the Straight Canal', pts: [[241, 1014], [262, 1027], [280, 1035], [318, 1062], [355, 1080], [398, 1094]], level: 15,
    rise: [1.5, 5, 8, 15, 13, 10.6], locks: [[243.4, 1015.5], [271, 1031], [300, 1049], [338, 1071.5], [366, 1083.5], [390, 1091.4]] },
];

// ---- relief. Base heights are blended (inverse-distance) from these [x, y, metres, radius?] and the
// ranges are added on top. Figures follow WORLD.md §2's region table.
export const HEIGHTS = [
  // the Cold Coast and the north-west
  [180, 215, 180], [210, 190, 140], [150, 262, 260], [165, 300, 220], [204, 252, 74, 14], [188, 292, 34, 14], [236, 256, 260], [246, 290, 400],
  [262, 185, 800], [300, 176, 1300], [350, 186, 1300], [410, 180, 720], [470, 190, 460], [528, 206, 345], [566, 209, 325],
  [600, 206, 312], [640, 212, 322], [690, 200, 290], [748, 186, 220], [800, 170, 200], [838, 160, 240], [856, 142, 160],
  // the highland (the old kingdom), 300-550 m, falling north-east to the Mossmere
  [585, 250, 306, 16], [640, 272, 362], [662, 262, 352, 12], [620, 332, 432], [560, 302, 404], [520, 305, 426, 16], [484, 300, 520],
  [457, 366, 506, 18], [500, 382, 524], [560, 392, 500], [612, 420, 484], [640, 470, 480], [540, 452, 545], [470, 455, 566],
  [425, 398, 545, 12], [377, 428, 524, 22], [350, 446, 640], [404, 472, 575], [430, 338, 640], [382, 300, 1000], [400, 252, 900],
  [440, 230, 660], [500, 240, 455], [600, 500, 520], [520, 522, 585], [640, 545, 500], [560, 580, 540],
  // the Shingle Flats, 560-700 m
  [400, 530, 640], [362, 500, 606], [440, 582, 682], [372, 572, 690], [470, 520, 625], [420, 612, 650], [350, 536, 720],
  // the Eastern Downs, 400-900 m
  [700, 300, 520], [760, 300, 620], [820, 280, 420], [730, 334, 660], [700, 400, 700], [780, 400, 780], [830, 400, 440],
  [740, 480, 690], [800, 500, 520], [690, 520, 570], [760, 560, 400], [720, 592, 300], [820, 540, 280], [660, 600, 440],
  // the fjord coast: the Spine's wet west face (the range itself is added below)
  [240, 400, 700], [200, 420, 430], [170, 400, 240], [220, 350, 560], [180, 300, 260], [240, 450, 800], [190, 470, 380],
  [160, 500, 280], [220, 520, 900], [180, 560, 480], [200, 612, 700], [170, 640, 380], [190, 680, 460], [170, 722, 260],
  [240, 330, 700], [200, 360, 420], [160, 352, 200],
  // the Fold and the waist
  [420, 660, 560], [500, 650, 520], [580, 640, 470], [640, 640, 280], [330, 662, 760], [330, 722, 830], [420, 722, 790],
  [520, 712, 700], [600, 700, 330], [300, 690, 900], [620, 660, 200],
  // the Terrace, 650-900 m (the Great Step drops its west edge to the coast)
  [300, 760, 840], [360, 770, 860], [430, 760, 900], [300, 800, 760], [400, 850, 800], [350, 900, 780], [420, 880, 800],
  [460, 900, 690], [400, 932, 706, 16], [440, 962, 640], [350, 962, 600], [300, 920, 560], [300, 876, 660], [268, 872, 660],
  [262, 932, 430], [272, 976, 170], [330, 1002, 300], [400, 1002, 380], [452, 1012, 260], [240, 760, 820], [240, 850, 700],
  [220, 800, 780], [200, 900, 600], [215, 960, 300],
  // the Middle Hills, about 1,400 m
  [505, 790, 1400, 22], [470, 770, 1150], [545, 775, 1150], [510, 832, 950], [560, 800, 800], [482, 852, 760],
  [620, 770, 340], [690, 782, 120], [760, 802, 60], [830, 822, 36], [600, 742, 480],
  // the Orchard Basin: a flat, low, flooded basin
  [580, 852, 120], [640, 862, 70], [700, 878, 45], [600, 922, 56], [660, 946, 40], [720, 958, 30], [752, 934, 26],
  [800, 896, 26], [850, 882, 18], [790, 1004, 12], [700, 1012, 26], [640, 1002, 36], [580, 982, 60], [540, 932, 130],
  [540, 1022, 60], [860, 902, 14], [870, 852, 20], [824, 922, 15], [748, 1000, 16],
  // the Siltway's lowland and delta
  [398, 1094, 14], [450, 1086, 16], [510, 1100, 14], [575, 1106, 12], [640, 1090, 10], [700, 1070, 9], [760, 1076, 7],
  [810, 1086, 5], [860, 1076, 3.5], [900, 1070, 2.5], [880, 1120, 4], [820, 1132, 10], [740, 1132, 18], [660, 1152, 30],
  [580, 1152, 30], [500, 1150, 44], [450, 1140, 80], [400, 1130, 60], [350, 1100, 26], [900, 1092, 2], [925, 1070, 1.5], [910, 1130, 3],
  // the Low Gap, a saddle a few metres high
  [300, 1070, 17, 14], [270, 1045, 10, 14], [332, 1076, 17, 12], [250, 1040, 12], [290, 1102, 44], [250, 1100, 60], [262, 1160, 200],
  // the Southern Hills, about 1,200 m, and the south coast
  [300, 1200, 500], [340, 1182, 650], [400, 1222, 1200, 24], [460, 1250, 1000], [380, 1256, 600], [520, 1222, 500],
  [440, 1190, 700], [500, 1270, 400], [580, 1202, 180], [650, 1202, 120], [720, 1192, 80], [790, 1182, 50], [850, 1152, 25],
  [700, 1242, 60], [780, 1216, 30],
  // the Low Horn and the Grey Horn
  [625, 1286, 420], [612, 1316, 260], [600, 1252, 350],
];

// Ranges: [x, y, metres added, half-width]. The Spine (WORLD.md §2), the Southern Hills and the horns.
export const RANGES = [
  { id: 'spine', pts: [[292, 165, 1300, 15], [298, 200, 1900, 19], [300, 235, 2100, 22], [304, 270, 2200, 22], [306, 310, 2400, 19],
    [305, 350, 2300, 17], [305, 375, 2200, 15], [305, 395, 2300, 15], [300, 430, 2500, 17], [298, 460, 2600, 19], [292, 500, 2700, 19],
    [288, 530, 2800, 19], [276, 580, 3000, 21], [262, 628, 3500, 24], [258, 665, 2000, 19], [250, 700, 1000, 15], [245, 728, 260, 12]] },
  // the Pyre Peaks' two last spurs, one on each side of the Pyre, run down to the bight: the gorge is a notch between
  // real walls from the temple (240,607) to the gorge mouth (200,589), and the range comes down to the sea there
  // (WORLD.md §5.8, LORE.md Act II)
  { id: 'pyreNorth', pts: [[258, 597, 1500, 10], [245, 593, 1350, 10], [232, 588, 1500, 9.5], [218, 582, 1150, 8.5], [205, 575, 1080, 8.5], [193, 566, 640, 7.5], [182, 557, 440, 7], [173, 549, 200, 6]] },
  { id: 'pyreSouth', pts: [[251, 631, 1700, 10], [240, 622, 1450, 10], [226, 615, 1520, 9.5], [212, 609, 1120, 8.5], [199, 603.5, 1060, 8.5], [187, 599, 660, 7.5], [176, 596, 420, 7], [166, 595, 200, 6]] },
  { id: 'southern', pts: [[330, 1186, 260, 13], [400, 1222, 420, 16], [470, 1250, 360, 15], [522, 1236, 160, 13]] },
  { id: 'greyHorn', pts: [[790, 172, 120, 9], [830, 156, 150, 8], [858, 138, 110, 6]] },
  { id: 'lowHorn', pts: [[640, 1262, 180, 10], [622, 1296, 160, 8], [612, 1326, 100, 6]] },
  { id: 'downs', pts: [[700, 320, 140, 26], [770, 400, 200, 30], [740, 500, 160, 28]] },
];
// The White Crown ice field, about 2,800 m, on the Spine's north end: it reaches the Cold Coast as ice
// cliffs between (292,158) and (350,168), and sends tongues down to the Sound's head, the ice-lake and
// the melt streams (WORLD.md §2). The Pyre Peaks' snow is found from the heights.
export const ICE = { crown: { poly: [[258, 190], [278, 171], [298, 158], [330, 158], [353, 166], [351, 196], [349, 224], [344, 262], [334, 290], [308, 297], [286, 296], [262, 280], [250, 246], [250, 212]], top: 2800 },
  tongues: [
    { pts: [[297, 286, 6], [294, 295, 4.8], [292, 301, 3.8]] }, // the tidewater glacier at the Sound's head
    { pts: [[252, 222, 5.6], [238, 219.5, 4.8], [224, 217.5, 3.8]] }, // the west outlet glacier to the ice-lake
    { pts: [[341, 262, 4.6], [336.5, 275, 3.7], [332, 281.5, 2.6]] }, // the east melt
    { pts: [[347, 208, 4.6], [358, 202, 3.6], [367, 197, 2.3]] },
    { pts: [[262, 266, 4.2], [254, 275, 3.2], [249, 281, 2]] },
  ] };
// The Great Step: a 600 m escarpment along the west coast, dying out into the Low Gap (WORLD.md §2).
export const STEP = [[250, 694], [245, 720], [238, 780], [246, 850], [255, 920], [268, 985], [277, 1012]];

// ---- the sixteen waters (SPEC §5.2 order; WORLD.md §5 places and §10 land words; LORE.md §3 chapters and
// Murk's buy lines; ROSTER §3 legends). `vg` is where the water's landmark vignette stands.
export const HOME = {
  name: 'The Landing', at: [600, 190], lat: '51.0°N', kind: 'home, a sea cave under the outer wall', land: 'cold stone, and one warm hearth', vg: [600, 183],
  story: 'An old landing in a sea cave at the foot of the kingdom’s outer wall, under the Sluice Run’s fall. When the capital drowned, its window candles were carried out on the rising water and came ashore here. Now and then one wakes.',
  more: 'Every evening starts and ends here, under the broken arch. Sixteen Waystones sit on the sill in four arcs, one arc for each reach. A stone lights when its map is bought, and a lit Waystone remembers the way.',
};

export const ACTS = [
  { n: 'I', title: 'What Fell', reach: 'the old kingdom', hand: 'court surveyors’ sheets' },
  { n: 'II', title: 'The Cold Road', reach: 'the cold rim', hand: 'the sea-road wardens’ sheets' },
  { n: 'III', title: 'Where They Turned', reach: 'the falls and the gate', hand: 'harbour-masters’ sheets' },
  { n: 'IV', title: 'The Way Back', reach: 'the green heart', hand: 'barge pilots’ sheets, and one old orchard plan' },
];

export const WATERS = [
  { n: 1, name: 'The Mossmere', at: [585, 250], kind: 'lake', detail: 'the capital’s moat', lat: '50.9°N', land: 'bare drowned stone', vg: [585, 238],
    story: 'The drowned capital’s moat, under the Sunken Gate. The great lantern hung over this water. When its old chain wore through, the great sluice dropped shut and the lake rose over the city to the arches.',
    legend: 'The Belled Matriarch', legendLine: 'A bell grew into her skull. She has tolled for the drowned ever since.',
    from: 'From the Landing, south and up the Sluice Run by the sluice locks: about 15 km and 300 m of climb.',
    murk: null },
  { n: 2, name: 'Sporewood Pools', at: [520, 305], kind: 'lake', detail: 'a warm volcanic hollow', lat: '50.8°N', land: 'moss under giant caps', vg: [512, 297],
    story: 'The gardens, kept mild by warm springs in the cold highland. The fungi went on growing after the gardeners stopped. A bee skep is carved over one garden door.',
    legend: 'The Drifting Grove', legendLine: 'A whole meadow rides on her back. It blooms where no one sees.',
    from: 'Up the Lockwater from the Mossmere’s south end, through a short reach of rapids and one kingdom lock: about 20 km, 120 m up.',
    murk: 'Gardeners. Tidy to the last. Mind the spores.' },
  { n: 3, name: 'Glasswater Vault', at: [455, 368], kind: 'lake', detail: 'a granite and crystal basin', lat: '50.7°N', land: 'crystal, granite, a little moss', vg: [462, 356],
    story: 'Where the kingdom shelved light in crystal, like books. Its chandelier fell the same night as the lantern and still glows on the floor.',
    legend: 'The Glass Sovereign', legendLine: 'Each scale is a window with no one behind it.',
    from: 'Up the Lockwater again through a narrow granite throat, about 20 km and 80 m up, to the head lake of the river you have been climbing.',
    murk: 'They kept light on shelves there. Like jam.' },
  { n: 4, name: 'The Pallid Deep', at: [378, 428], kind: 'deep lake', detail: 'a glacial trough, floor below the sea', lat: '50.6°N', land: 'sage moss on bone, cedar spires', vg: [386, 417],
    story: 'The kingdom’s one quiet place of remembrance: the requiem garden and the Long Pier of Names. Two kneeling statues hold out a dark lantern. Below them is the Bottomless, the deepest water in the kingdom.',
    legend: 'The Lantern-Swallower', legendLine: 'The great lantern went down. Still going.',
    from: 'West over the Summit Cut: up the Stilled Cascade’s lock flight to the summit pound, then level across the kingdom’s divide, about 20 km.',
    murk: 'Down there’s the oldest thing I know. Be polite.' },
  { n: 5, name: 'The Rime Sound', at: [220, 312], kind: 'sound', detail: 'a fjord with ice at its head', lat: '50.4°N', land: 'spruce and fern on the fjord walls', vg: [286, 300],
    story: 'The first water outside the walls, and the first open sea road. Frozen bell-buoys mark the kingdom’s way out through the fjord, and someone small still fishes the ice at its head by lantern.',
    legend: 'The Long Winter', legendLine: 'It was old when the kingdom was built. It has not hurried once since.',
    from: 'Down the Fallway, west through the Spine Gap and past its falls by the old slipway, about 110 km and 520 m down to the sea, then a short way west down the fjord.',
    murk: 'Someone fishes the ice up there. Not me.' },
  { n: 6, name: 'The Thin Water', at: [186, 300], kind: 'river', detail: 'a braided sand river', lat: '50.5°N', land: 'willows on pale sand bars', vg: [210, 232],
    story: 'Below the broken old weir the river spreads wide and thin over pale sand. The sluice lamp still burns, and on the first evening it brightens once as the raft passes.',
    legend: 'The Buried Moon', legendLine: 'A moon that comes down to see the water and stays for the sand. Nobody can talk her back.',
    from: 'West down the Sound on the way out, about 45 km, to the Thin Water’s mouth on the north shore, then north up over its sand delta onto the bars below the old weir: about 25 km of river, and the same river back.',
    murk: 'That lamp’s never gone out. Don’t ask me why.' },
  { n: 7, name: 'The Last Light', at: [100, 452], kind: 'open sea', detail: 'under the lighthouse on the Lamp Rock', lat: '49.6°N', land: 'turf and fern on the sea rocks', vg: [110, 440],
    story: 'The kingdom’s last lighthouse, on the outer rock, lit for ships on the sea road. Beyond it lies the Far Sea, never charted. Nothing is drawn past the far isle.',
    legend: 'The Jetsam Shark', legendLine: 'It has swallowed half the kingdom’s lost things, and kept them all.',
    from: 'Downstream all the way: back down the Thin Water to its mouth, out over the Sound’s sill about 32 km on, then about 125 km south-west on the cold current to the Lamp Rock.',
    murk: 'It turns for ships that left. It’s polite like that.' },
  { n: 8, name: 'Pyrefall Gorge', at: [228, 601], kind: 'river', detail: 'a snowmelt gorge, temple stairs and pyres', lat: '48.4°N', land: 'pines and hanging forest in the spray', vg: [241, 607],
    story: 'The end of the cold road: the snow temple at the head of a gorge where the mountains come down to the sea, the last stop before the long voyage south. Travellers lit a lamp at the temple fires before the skerry passes and the long coast, and left a coin on the water for luck. The fires still burn on the steps with nobody to feed them.',
    legend: 'The Ashen Guest', legendLine: 'Uninvited to every funeral. Never once absent.',
    from: 'On south from the Lamp Rock along the fjord coast on the cold current, about 130 km, into the bight at the Pyre’s mouth, then east up the Pyre over its fan and into the gorge toward the temple: about 70 km.',
    murk: 'Temple fires. Nobody feeds them. They go anyway.' },
  { n: 9, name: 'The Waxen Reef', at: [138, 758], kind: 'reef', detail: 'a drowned harbour town, a drop-off and a wreck', lat: '6.2°N', land: 'palms on the keys, coral below', vg: [130, 764],
    story: 'The first warm water. The kingdom’s west port stood on land won from the sea behind a mole; the sea took it back and coral took the roofs. Its doors and steps are far too tall for a Wick.',
    legend: 'The Waxen Abbot', legendLine: 'It opens its mouth and the reef leans in. It has swallowed bigger than you.',
    from: 'Back down the Pyre to the sea, then south down the Long Coast on the cold current, about 4,600 km through the Fold, until the headland turns the current and the water warms.',
    murk: 'Warm water. You’ll hate it. Then you won’t.' },
  { n: 10, name: 'The Thunder Stair', at: [228, 800], kind: 'river', detail: 'stepped cataracts, a lock stair and two towers', lat: '5.4°N', land: 'green only where the spray falls', vg: [243, 808],
    story: 'Where the Rush comes off the Great Step. The lock stair is broken and the river falls down it. It never rains here, so everything green lives on the spray. The two tower lamps still burn.',
    legend: 'The Last Lock', legendLine: 'Thirty-two teeth and none of them hidden. Nothing passes the lock.',
    from: 'East across the Reef Bay and up the Rush’s short lower course, about 40 km, to the calm reach at the Step’s foot. The reef town and the stair were one port.',
    murk: 'Two lamps on the towers. Wave. They like that.' },
  { n: 11, name: 'Rushlight Fen', at: [322, 852], kind: 'fen', detail: 'a papyrus delta above the great dam', lat: '4.4°N', land: 'papyrus on river water', vg: [272, 822],
    story: 'An inland delta on the dry Terrace, behind a dam that still holds. People fished here by the basketful, laughing. The kingdom was a good place that ended.',
    legend: 'The Long Thunder', legendLine: 'You feel it before you hear it, and it goes on a long time.',
    from: 'Up the Great Step, 600 m in about 20 km: hauled up the towers’ haul-way past the Throat, then lifted through the great dam’s barge lock.',
    murk: 'People laughed there once. Fish remember.' },
  { n: 12, name: 'The Salt Gate', at: [240, 1008], kind: 'river', detail: 'a tidal river mouth and a shipyard', lat: '1.7°N', land: 'mangroves at the sea-gate', vg: [224, 1010],
    story: 'The great sea-gate, left open, and a yard of unfinished hulls: the yard stopped, as everything stopped. Here the people going back left the sea road and turned inland by the canal.',
    legend: 'The Old Shipwright', legendLine: 'Still cutting ribs for a fleet that will never sail.',
    from: 'Down the Sweetwater from the fen’s south channels, about 320 km across the Terrace, past the small fall by its side lock and down the ebb to the gate.',
    murk: 'Shipyard. Somebody’s still at it.' },
  { n: 13, name: 'Lampmoss Slough', at: [318, 1062], kind: 'swamp', detail: 'a canal summit and its lock', lat: '0.7°N', land: 'swamp forest over the canal', vg: [326, 1068],
    story: 'The Straight Canal’s summit pound in the Low Gap, the first country the eastern rains reach. Ordinary things lie on the canal bed below the lock: a kettle, a chair, a lantern, a chest of tools, dropped over the side on the way through.',
    legend: 'The Last Sentry', legendLine: 'Still at his post in full mail. Nobody told him the kingdom drowned.',
    from: 'From inside the sea-gate, south through the gate lock on the south bank into the Straight Canal, then inland and gently up for about 180 km to its summit: the way the people turned for home.',
    murk: 'Last barge through there went south. I poled it.' },
  { n: 14, name: 'The Siltway', at: [760, 1080], kind: 'river', detail: 'the great brown lowland river', lat: '0.4°N', land: 'forest walls and floating meadows', vg: [776, 1093],
    story: 'The barge road, so wide the far bank is a green line, and loud with frogs. White stone mile-posts count down the way the raft is going. At the Seam the black Inkwood pours in and will not mix.',
    legend: 'The Barge-Shadow', legendLine: 'It follows the last barge down the road. The barge sank long ago. It follows anyway.',
    from: 'Down the canal’s eastern locks to the Canal Mouth, then east down the barge road for about 720 km to the Seam and the great bend.',
    murk: 'Loud, isn’t it? That’s what alive sounds like.' },
  { n: 15, name: 'Lanternroot Lagoon', at: [830, 985], kind: 'lagoon', detail: 'a mangrove lagoon behind a barrier spit', lat: '2.1°N', land: 'mangroves through the orchard', vg: [838, 976],
    story: 'Where the orchard met the sea, and where the barge road ended: the people went on through the lagoon and up the Monsoon Cut into the forest beyond. The unbanked delta edge sank and mangroves grew through it. Stilt houses hang lanterns at every dusk, one sage green among the amber: Murk’s kin live here, unseen.',
    legend: 'The Silver Regent', legendLine: 'She rolls at the surface to sip the air, and the whole lagoon hears her sigh.',
    from: 'Downstream past the great bend to the delta head, about 140 km, then 70 km north up the delta’s north arm into the lagoon.',
    murk: 'My lot live there. We don’t talk.' },
  { n: 16, name: 'The Inkwood', at: [780, 906], kind: 'river', detail: 'blackwater through flooded rainforest', lat: '3.5°N', land: 'closed canopy over black water', vg: [772, 896],
    story: 'The drowned orchard forest beyond the lagoon, where the kingdom began and ended. At the top of the Kitchen Stair a stone hearth lies raked over with ash, the way a fire is banked for the night, and never stirred again.',
    legend: 'The Banked Fire', legendLine: 'It must come up for air, like any fire. It burns low and waits for morning.',
    from: 'North through the lagoon to its far end, then west up the Monsoon Cut through the drowned orchard rows to the Parting, about 95 km, and a short way on upstream under the closed canopy.',
    murk: 'Last chart there is. Oldest, too.' },
];

// ---- the Lamp Road (WORLD.md §5 "Joined", §6 and §6.1). The road only goes forward: a trunk from the Landing
// to the Inkwood, with two short side waters up their own rivers (the Thin Water, Pyrefall Gorge). It is kept
// as PIECES, each drawn once, and each leg is the list of pieces the raft sails (a leading "-" sails a piece
// against its own direction); a side water's spur is sailed in by one leg and back out by the next.
//   { r: riverOrCanalId, from: [x,y], to: [x,y] }  a stretch of a drawn waterway. Rivers are given
//                                                   downstream, so the piece's direction is the water's.
//   { p: [[x,y],...], k: 'lake' | 'sea' }           open water (smoothed)
// k: 'river' (default), 'canal', 'lake', 'sea' (a dotted sailing line), 'haul' (the haul-way up the Step).
export const PIECES = {
  sluiceRun: { r: 'sluiceRun', from: [585, 250], to: [600, 189] },
  lockwaterA: { r: 'lockwater', from: [520, 305], to: [585, 250] },
  lockwaterB: { r: 'lockwater', from: [476, 360], to: [520, 305] },
  glassIn: { p: [[476, 360], [466, 365], [455, 368]], k: 'lake' },
  glassW: { p: [[455, 368], [449, 371]], k: 'lake' },
  summitCut: { r: 'summitCut', from: [449, 371], to: [404, 420], k: 'canal' },
  pallidE: { p: [[404, 420], [391, 425], [378, 428]], k: 'lake' },
  pallidW: { p: [[378, 428], [364, 423], [350, 418]], k: 'lake' },
  fallway: { r: 'fallway', from: [350, 418], to: [256, 314] },
  soundA: { p: [[256, 313.5], [242, 312], [220, 312]], k: 'sea' },
  soundB: { p: [[220, 312], [198, 320], [178, 326]], k: 'sea' }, // west down the Sound to the Thin Water's junction
  thinMouth: { p: [[178, 322], [178, 326]], k: 'sea' }, // the Thin Water's mouth, out to the Sound's sea lane
  thinWater: { r: 'thinWater', from: [186, 300], to: [178, 322] }, // the delta's upper bars down to the mouth
  soundC: { p: [[178, 326], [160, 331], [146, 333]], k: 'sea' }, // on out to the sill
  seaOut: { p: [[146, 333], [124, 343], [106, 372], [98, 414], [100, 452]], k: 'sea' },
  fjordCoast: { p: [[100, 452], [113, 520], [130, 560], [136, 574]], k: 'sea' }, // south on the cold current to the bight
  bight: { p: [[136, 574], [150, 573], [166, 572]], k: 'sea' }, // into the bight, to the Pyre's mouth
  pyre: { r: 'pyre', from: [228, 601], to: [166, 572] },
  longCoast: { p: [[136, 574], [128, 606], [137, 680], [133, 730], [131, 748], [138, 758]], k: 'sea' },
  reefBay: { p: [[138, 758], [133, 767], [141, 778], [160, 787], [185, 793], [208, 797.5]], k: 'sea' },
  rushFoot: { r: 'rush', from: [228, 800], to: [208, 797.5] },
  stair: { r: 'rush', from: [272, 822], to: [228, 800], k: 'haul' },
  reservoir: { p: [[272, 822], [288, 831], [306, 842], [322, 852]], k: 'lake' },
  fenS: { p: [[322, 852], [322, 858]], k: 'lake' },
  sweetwater: { r: 'sweetwater', from: [322, 858], to: [269, 997] },
  saltReach: { p: [[269, 997], [262, 1003], [252, 1006.5], [240, 1008]], k: 'lake' },
  gateLock: { p: [[240, 1008], [240.4, 1011], [241, 1014]], k: 'lake' }, // across the reach to the lock on the south bank
  canalW: { r: 'straightCanal', from: [241, 1014], to: [318, 1062], k: 'canal' },
  canalE: { r: 'straightCanal', from: [318, 1062], to: [398, 1094], k: 'canal' },
  siltwayA: { r: 'siltway', from: [398, 1094], to: [760, 1080] },
  siltwayB: { r: 'siltway', from: [760, 1080], to: [842, 1070] },
  northArm: { r: 'northArm', from: [842, 1070], to: [838, 1010] },
  lagoonS: { p: [[838, 1010], [835, 998], [830, 985]], k: 'lake' },
  lagoonN: { p: [[830, 985], [836, 968], [838, 956]], k: 'lake' }, // north up the lagoon to its far end
  monsoonCut: { r: 'monsoonCut', from: [798, 930], to: [838, 956] },
  inkwoodUp: { r: 'inkwood', from: [780, 906], to: [798, 930] }, // the drowned orchard down to the Parting
};
export const LEGS = [
  { to: 1, via: ['-sluiceRun'] },
  { to: 2, via: ['-lockwaterA'] },
  { to: 3, via: ['-lockwaterB', 'glassIn'] },
  { to: 4, via: ['glassW', 'summitCut', 'pallidE'] },
  { to: 5, via: ['pallidW', 'fallway', 'soundA'] },
  { to: 6, via: ['soundB', '-thinMouth', '-thinWater'] },
  { to: 7, via: ['thinWater', 'thinMouth', 'soundC', 'seaOut'] },
  { to: 8, via: ['fjordCoast', 'bight', '-pyre'] },
  { to: 9, via: ['pyre', '-bight', 'longCoast'] },
  { to: 10, via: ['reefBay', '-rushFoot'] },
  { to: 11, via: ['-stair', 'reservoir'] },
  { to: 12, via: ['fenS', 'sweetwater', 'saltReach'] },
  { to: 13, via: ['gateLock', 'canalW'] },
  { to: 14, via: ['canalE', 'siltwayA'] },
  { to: 15, via: ['siltwayB', 'northArm', 'lagoonS'] },
  { to: 16, via: ['lagoonN', '-monsoonCut', '-inkwoodUp'] },
];

// The route rule (WORLD.md §6.1, binding): the road only goes forward. road.mjs checks it on the canon
// courses and on the drawn road, and a failure stops the build. `side` names the only two side waters and
// the junction where each one's spur leaves the trunk; `stations` are WORLD.md's own figures for each
// water's distance along the trunk, kept here so the build can say whether the chart still agrees with them.
export const ROAD_RULE = {
  side: { 6: [178, 326], 8: [136, 574] },
  clearance: 24, // a leg keeps at least this far from every earlier water but the one it leaves
  spurRatio: 1.1, // a side water's way out is no longer than this many times its way in
  retrace: 6, // the trunk never runs this near to trunk already travelled
  turn: 120, // degrees, water to water; only a side water may turn more
  stations: [0, 62, 147, 240, 341, 551, 595, 767, 895, 1083, 1197, 1305, 1492, 1589, 2055, 2233, 2341],
};

// Sea ways from the Landing (WORLD.md §6): no leg of the Lamp Road, drawn faintly on the sea.
export const SEA_WAYS = [
  [[600, 172], [520, 144], [400, 132], [290, 132], [180, 172], [108, 250], [112, 318], [128, 340]],
  [[600, 172], [690, 144], [760, 128], [884, 112], [906, 200], [900, 450], [930, 560], [940, 720], [916, 850], [962, 1050]],
];

// ---- the Chart's sheets: what each lake map inks when it is bought (WORLD.md §10). Circles [x, y, r]
// and paths { p, w } (a stroke of half-width w). `r` may name a river.
export const SHEETS = [
  /* 1 */ [{ r: 'sluiceRun', w: 24 }, [585, 250, 30], { p: [[520, 188], [600, 176], [686, 184]], w: 24 }],
  /* 2 */ [[520, 305, 32], { r: 'lockwater', from: [585, 250], to: [520, 305], w: 22 }, [618, 300, 34]],
  /* 3 */ [[455, 368, 38], { r: 'lockwater', from: [520, 305], to: [476, 360], w: 22 }, { r: 'melt', w: 18 }, [470, 250, 50], { p: [[440, 176], [470, 178], [520, 190]], w: 18 }],
  /* 4 */ [[378, 428, 44], { p: [[404, 420], [449, 371]], w: 20 }, [470, 455, 34], [530, 410, 92], [590, 470, 60], [600, 360, 50]],
  /* 5 */ [{ p: [[130, 339], [172, 326], [220, 312], [262, 309], [291, 302]], w: 32 }, { r: 'fallway', w: 24 }, [305, 385, 38], [302, 300, 30], [204, 346, 20]],
  /* 6 */ [{ r: 'thinWater', w: 26 }, [216, 212, 30], [296, 236, 58], [246, 248, 36], [252, 204, 22], [228, 280, 18], [172, 242, 50], [146, 276, 34], { p: [[236, 174], [300, 158], [350, 162], [420, 156], [450, 132]], w: 26 }, [450, 118, 24]],
  /* 7 */ [[104, 448, 52], [55, 495, 26], { p: [[146, 333], [124, 343], [106, 372], [98, 414], [100, 452]], w: 34 }, [192, 420, 60], [162, 372, 40], [300, 450, 36]],
  // the Pyre Peaks' sheet: the gorge down their west face to the bight, the fjord coast the road came down, and
  // on their far side the Flourwater over the Shingle Flats (the same snow, WORLD.md §5.8)
  /* 8 */ [{ r: 'pyre', w: 30 }, [228, 601, 40], [262, 628, 48], [290, 530, 44], [190, 505, 46], [172, 574, 42], [226, 562, 34], [268, 568, 24], [178, 610, 24], { p: [[100, 452], [113, 520], [130, 560], [136, 574]], w: 40 }, { r: 'flourwater', w: 30 }, [400, 536, 74]],
  /* 9 */ [{ p: [[136, 574], [128, 606], [137, 680], [133, 730], [138, 758]], w: 42 }, [138, 758, 36], [205, 655, 50]],
  /* 10 */ [[190, 792, 36], [236, 804, 34], { p: [[247, 712], [239, 780]], w: 26 }],
  /* 11 */ [[322, 852, 42], { p: [[272, 822], [330, 852]], w: 26 }, { r: 'rush', from: [352, 845], to: [482, 770], w: 28 }, [360, 780, 66], [500, 790, 50]],
  /* 12 */ [{ r: 'sweetwater', w: 34 }, [230, 1008, 50], { p: [[180, 880], [192, 940], [200, 992]], w: 32 }, { p: [[246, 850], [255, 920], [268, 985]], w: 28 }, [380, 925, 62]],
  /* 13 */ [{ p: [[241, 1014], [262, 1027], [280, 1035], [318, 1062]], w: 28 }, [300, 1070, 46], [236, 1078, 40]],
  /* 14 */ [{ p: [[318, 1062], [355, 1080], [398, 1094]], w: 26 }, { r: 'siltway', from: [300, 1175], to: [775, 1092], w: 44 }, [400, 1192, 58], [500, 1180, 48], { r: 'clearRiver', w: 22 }, { r: 'southRiver', w: 22 }, [262, 1150, 40]],
  /* 15 */ [{ r: 'siltway', from: [775, 1092], to: [942, 1070], w: 40 }, [900, 1086, 70], { r: 'northArm', w: 28 }, [842, 985, 50], [876, 932, 30], [948, 1138, 24]],
  /* 16 */ [{ r: 'monsoonCut', w: 28 }, { r: 'inkwood', w: 48 }, [640, 930, 92], [722, 950, 84], [590, 872, 58], [545, 826, 40], [836, 900, 42], [690, 1006, 62], [600, 990, 56]],
];

// ---- lettering. kind: sea | region | place | river (set along its course) | note.
// `a` is the angle in degrees; `z` the least zoom (screen px per chart unit) at which it may show;
// `sheet` pins the sheet that brings the name; `never` marks a name WORLD.md keeps off every sheet
// (the never-charted east and south): those show only in the design view of the whole world.
export const LABELS = [
  { t: 'The Cold Sea', at: [300, 52], kind: 'sea', a: -2, sheet: 1 },
  { t: 'The Far Sea', at: [10, 640], kind: 'sea', a: -88, sheet: 7 },
  { t: 'The Morning Sea', at: [996, 440], kind: 'sea', a: 88, sheet: 15 },
  { t: 'The Warm Sea', at: [470, 1384], kind: 'sea', a: 0, sheet: 12 },
  { t: 'The Morning Gulf', at: [800, 678], kind: 'sea', a: -6, small: true, never: true },
  { t: 'The Cold Coast', at: [512, 156], kind: 'region', a: -3, z: 0.75, on: 'sea', sheet: 1 },
  { t: 'The Highland', sub: 'the old kingdom', at: [556, 446], kind: 'region' },
  { t: 'The Spine', at: [289, 486], kind: 'region', a: 84 },
  { t: 'The White Crown', at: [300, 226], kind: 'region', z: 0.8, tone: 'ice' },
  { t: 'The Fjord Coast', at: [190, 404], kind: 'region', a: 66, z: 0.9 },
  { t: 'The Shingle Flats', at: [416, 552], kind: 'region', z: 0.7 },
  { t: 'The Eastern Downs', at: [748, 440], kind: 'region', never: true },
  { t: 'The Grey Horn', at: [814, 190], kind: 'region', a: -24, z: 0.9, never: true },
  { t: 'The Fold', sub: 'some 4,500 km of empty coast, folded to a hand’s width', at: [452, 688], kind: 'region', sheet: 9 },
  { t: 'The Long Coast', at: [100, 606], kind: 'sea', a: -80, small: true, z: 0.7, sheet: 9 },
  { t: 'The Great Step', at: [262, 902], kind: 'region', a: 79, z: 0.9 },
  { t: 'The Terrace', at: [380, 772], kind: 'region', z: 0.6 },
  { t: 'The Middle Hills', at: [520, 812], kind: 'region', z: 0.8 },
  { t: 'The Low Gap', at: [292, 1100], kind: 'region', z: 1.0 },
  { t: 'The Orchard Basin', at: [640, 936], kind: 'region' },
  { t: 'The Southern Hills', at: [420, 1240], kind: 'region', z: 0.6 },
  { t: 'The Low Horn', at: [628, 1276], kind: 'region', a: 62, z: 0.9, never: true },
  { t: 'the Lockwater', river: 'lockwater', at: [556, 276], kind: 'river', z: 2.0 },
  { t: 'the Sluice Run', river: 'sluiceRun', at: [593, 218], kind: 'river', z: 4.2 },
  { t: 'the Summit Cut', canal: 'summitCut', at: [426, 398], kind: 'river', z: 3.0 },
  { t: 'the Fallway', river: 'fallway', at: [296, 374], kind: 'river', z: 2.0 },
  { t: 'the Pyre', river: 'pyre', at: [197, 588], kind: 'river', z: 2.2 },
  { t: 'the Flourwater', river: 'flourwater', at: [350, 510], kind: 'river', z: 1.5 },
  { t: 'the Rush', river: 'rush', at: [420, 808], kind: 'river', z: 1.4 },
  { t: 'the Sweetwater', river: 'sweetwater', at: [300, 928], kind: 'river', z: 1.4 },
  { t: 'the Straight Canal', canal: 'straightCanal', at: [358, 1081], kind: 'river', z: 2.0 },
  { t: 'the barge road', river: 'siltway', at: [560, 1110], kind: 'river', z: 1.2 },
  { t: 'the Monsoon Cut', river: 'monsoonCut', at: [818, 944], kind: 'river', z: 3.0 },
  { t: 'the clear river', river: 'clearRiver', at: [486, 980], kind: 'river', z: 1.8 },
  { t: 'the Sunken Gate', at: [585, 236], kind: 'place', z: 3.2 },
  { t: 'the outer wall', at: [652, 203], kind: 'place', z: 2.6 },
  { t: 'the great sluice', at: [596, 207], kind: 'place', z: 5 },
  { t: 'the Hundred Tarns', at: [470, 455], kind: 'place', z: 1.8 },
  { t: 'the Spine Gap', at: [305, 385], kind: 'place', z: 1.8 },
  { t: 'the old weir', at: [210, 232], kind: 'place', z: 2.8 },
  { t: 'the ice-lake', at: [214, 214], kind: 'place', z: 3.2 },
  { t: 'the sand delta', at: [181, 314], kind: 'place', z: 3.4, sheet: 6 },
  { t: 'the Pyre Peaks', at: [262, 632], kind: 'place', z: 1.1 },
  { t: 'the snow temple', at: [240, 607], kind: 'place', z: 3.0 },
  { t: 'the Pyre’s mouth', at: [161, 571], kind: 'place', z: 3.2, on: 'sea', sheet: 8 },
  { t: 'the Lamp Rock', at: [110, 440], kind: 'place', z: 2.4, on: 'sea' },
  { t: 'the far isle', at: [55, 495], kind: 'place', z: 1.2, on: 'sea' },
  { t: 'the northern isles', at: [450, 116], kind: 'place', z: 1.4, on: 'sea' },
  { t: 'the Drift Line', at: [124, 418], kind: 'place', z: 2.4, on: 'sea' },
  { t: 'the Turn', at: [156, 778], kind: 'place', z: 2.6, on: 'sea' },
  { t: 'the Reef Bay', at: [186, 791], kind: 'place', z: 2.2, on: 'sea' },
  { t: 'the lock stair', at: [243, 808], kind: 'place', z: 3.6 },
  { t: 'the great dam', at: [272, 822], kind: 'place', z: 2.8 },
  { t: 'the salt pans', at: [400, 932], kind: 'place', z: 1.6 },
  { t: 'an empty town', at: [418, 912], kind: 'place', z: 2.4, never: true },
  { t: 'the sea-gate', at: [222, 1012], kind: 'place', z: 3.4 },
  { t: 'the Canal Mouth', at: [398, 1094], kind: 'place', z: 2.0 },
  { t: 'the mile-posts', at: [600, 1102], kind: 'place', z: 2.6 },
  { t: 'the Seam', at: [758, 1068], kind: 'place', z: 2.2 },
  { t: 'the Parting', at: [798, 930], kind: 'place', z: 2.6, sheet: 16 },
  { t: 'the great bend', at: [776, 1093], kind: 'place', z: 3.2 },
  { t: 'the delta', at: [902, 1084], kind: 'place', z: 1.3 },
  { t: 'the stilt village', at: [836, 977], kind: 'place', z: 3.8 },
  { t: 'the Morning Isle', at: [947, 638], kind: 'place', z: 1.3, on: 'sea', never: true },
  { t: 'the watchtower', at: [858, 138], kind: 'place', z: 2.2, never: true },
  { t: 'a drowned town', at: [662, 690], kind: 'place', z: 2.0, on: 'sea', never: true },
  { t: 'the crater lake', at: [730, 330], kind: 'place', z: 2.2, never: true },
  { t: 'the arch', at: [600.5, 180], kind: 'place', z: 5.5, on: 'sea' },
  { t: 'the cold current', at: [84, 560], kind: 'note', a: -84, z: 1.5, on: 'sea', sheet: 9 },
  { t: 'about 4,500 km', at: [116, 690], kind: 'note', a: -84, z: 0.55, on: 'sea', sheet: 9, force: true },
  // why the road goes round by the lagoon: the barge pilots' note on the Inkwood's lower reach, above the Seam
  { t: 'shoals and snags', at: [777, 1045], kind: 'note', a: -68, z: 1.7, sheet: 14 },
  { t: 'the warm countercurrent', at: [146, 890], kind: 'note', a: -80, z: 1.5, on: 'sea', sheet: 12 },
];

// ---- small drawn things at their true places: the kingdom's works and ruins (WORLD.md §8). g names a
// glyph in the bake. The one landmark vignette of each water (WORLD.md §10) is not here: the page draws
// those live, so they stay legible at the whole-world view (src/chart-draw.js VIGNETTES, shared with the game).
export const LANDMARKS = [
  { g: 'wall', pts: [[522, 199], [546, 203], [566, 204.5], [586, 198], [594, 197.5]], s: 1 },
  { g: 'wall', pts: [[607, 197.5], [616, 198], [638, 204], [662, 198], [688, 192]], s: 1 },
  { g: 'sluice', at: [596.2, 204.5], s: 1 },
  { g: 'stair', pts: [[601.5, 192], [599, 202], [596, 214], [593.5, 226]], s: 0.9 },
  { g: 'city', at: [585, 252], rx: 14, ry: 8.5, rot: -8 }, // the lower city under the Mossmere
  { g: 'ruins', at: [565, 240], n: 14, r: 9 }, { g: 'ruins', at: [607, 239], n: 13, r: 8 }, { g: 'ruins', at: [602, 265], n: 11, r: 8 }, { g: 'ruins', at: [565, 267], n: 10, r: 7 },
  { g: 'lock', at: [552, 278.5], s: 1, rot: -40 },
  { g: 'caps', at: [520, 305], n: 14, r: 15 },
  { g: 'garden', at: [535, 314], s: 1 }, { g: 'garden', at: [505, 297], s: 1 },
  { g: 'crystals', at: [455, 368], n: 12, r: 21 },
  { g: 'ribs', at: [377, 428], n: 7, rx: 20, ry: 10, rot: -8 },
  { g: 'weir', at: [210, 232], s: 1, rot: 16 },
  { g: 'slipway', pts: [[286, 366], [276, 354], [268, 344]], s: 1 },
  { g: 'reefTown', at: [138, 760], s: 1 },
  { g: 'stair', pts: [[232, 804.5], [240, 808.5], [250, 813.5], [261, 819]], s: 1 },
  { g: 'dam', pts: [[270.5, 816], [273, 828]], s: 1 },
  { g: 'town', at: [418, 912], n: 9, r: 4.5 },
  { g: 'hulls', at: [226.5, 1019.2], n: 6, s: 1 }, // the shipyard, seaward of the gate lock on the same bank
  { g: 'posts', river: 'siltway', from: [398, 1094], to: [842, 1070], every: 20 },
  { g: 'barge', at: [776, 1094.5], s: 1, rot: 30 },
  { g: 'stilts', at: [836, 980], n: 7, r: 5 },
  { g: 'rows', at: [760, 893], w: 28, h: 11, rot: 7 }, { g: 'rows', at: [809, 949], w: 16, h: 8, rot: 31 }, // the drowned orchard's dikes: by the Kitchen Stair, and in the fork below the Parting, beside the Monsoon Cut
  { g: 'snags', river: 'inkwood', from: [797, 944], to: [760, 1062], every: 6.5 }, // the Inkwood's shoal, snag-choked lower reach (WORLD.md §6)
  { g: 'tower', at: [858, 136.5], s: 1 },
  { g: 'drowned', at: [662, 690], n: 8, r: 6 },
  { g: 'oxbow', at: [560, 1125], s: 1, rot: 200 }, { g: 'oxbow', at: [650, 1112], s: 1.1, rot: 160 }, { g: 'oxbow', at: [468, 1104], s: 0.8, rot: 20 }, { g: 'oxbow', at: [702, 1084], s: 0.8, rot: 150 },
  { g: 'wreck', at: [130, 765], s: 1, rot: 30 },
  { g: 'buoys', pts: [[232, 314], [206, 319], [180, 325], [154, 332], [128, 344], [108, 372]] },
  { g: 'driftLine', pts: [[112, 404], [118, 414], [122, 425], [120, 436]] },
  // the harbour-masters' soundings (reach III) and the tide arrows at the gate
  { g: 'soundings', pts: [[170, 786, 9], [186, 800, 6], [158, 796, 14], [198, 790, 4], [146, 782, 22], [176, 806, 11], [205, 1000, 7], [192, 1010, 12], [214, 1012, 5], [228, 1006, 4], [184, 996, 16], [198, 1022, 9]] },
  { g: 'tide', at: [208, 1004], rot: 8 },
];

// The cold current, the warm countercurrent and the east-coast warm current (WORLD.md §3).
export const CURRENTS = [
  { tone: 'cold', pts: [[86, 380], [78, 430], [82, 500], [90, 570], [100, 640], [110, 700], [106, 742], [86, 772], [60, 790]] },
  { tone: 'cold', pts: [[64, 300], [60, 360], [62, 420]] },
  { tone: 'warm', pts: [[190, 1170], [168, 1090], [156, 1010], [148, 930], [142, 860], [132, 806], [114, 786]] },
  { tone: 'warm', pts: [[972, 1200], [990, 1100], [980, 990], [952, 880], [932, 800], [912, 740], [860, 706], [790, 714]] },
];

// The Fold (WORLD.md §1): the band the chart-makers folded 4,500 km into.
export const FOLD = { y0: 644, y1: 736 };
