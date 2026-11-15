// The Evenland, as data. Every coordinate, name and line here comes from the loop docs:
//   docs/loop/WORLD.md (the continent: outline, regions, rivers, waters, route, places, the Chart)
//   docs/loop/LORE.md  (the story: the four acts, each water's chapter, Murk's lines)
//   docs/loop/SPEC.md §5.2 (the sixteen waters, their kinds and lushness steps)
//   docs/loop/ROSTER.md §3 (each water's legend and her line)
// Chart units: 1000 x 1400, x east, y south (WORLD.md "Coordinates"). The generator adds a blank
// paper margin of PAD units all round; nothing canon lives in it.

export const SHEET = { W: 1000, H: 1400, PAD: 50 };
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
  // the Rime Sound: mouth (146,333) to its head (290,302), about 145 km, a sill at the mouth
  { id: 'rimeSound', pts: [[128, 340, 8.5], [146, 333, 6.4], [160, 331.5, 5.2], [174, 324, 6.4], [188, 323.5, 5], [200, 318, 6.2], [211, 311.5, 4.8], [222, 312.5, 5.8], [234, 316, 4.4], [246, 312.5, 4.8], [257, 308.5, 4.1], [268, 309, 3.4], [279, 305, 3.6], [291, 302, 2.6]] },
  { id: 'rimeArm', pts: [[198, 320, 2.8], [203, 333, 2.3], [212, 342, 1.9], [215, 353, 1.1]] },
  { id: 'rimeArm2', pts: [[176, 322, 2.4], [170, 310, 2], [174, 299, 1.5], [171, 290, 0.9]] },
  // the Salt Gate: a funnel estuary from the sea in to the fall line
  { id: 'saltGate', pts: [[196, 1005, 15], [212, 1008, 12.5], [226, 1009, 8], [240, 1008, 5.2], [252, 1006.5, 3.2], [262, 1003, 1.9], [269, 997, 1.1]] },
  // the Landing's cove under the outer wall
  { id: 'cove', pts: [[600.5, 176, 3.4], [600.5, 184, 2.6], [600, 189.5, 2.2]] },
  // the lagoon's one tidal inlet through the barrier
  { id: 'tidalInlet', pts: [[846, 985, 1.5], [858, 985.5, 1.5], [870, 986, 2.4]] },
  // the mouth of the west-face stream at (164,471); the fjord coast's other drowned valleys are grown by the
  // seeded generator (terrain.mjs), as WORLD.md §2 only says the coast is "broken into skerries"
  { id: 'fjordD', pts: [[124, 469, 3.2], [140, 471, 2.6], [154, 470.5, 1.8], [166, 471, 1]] },
];
// Water bodies joined to the sea (brackish): cut like inlets, but as blobs.
export const LAGOON = { blobs: [[832.5, 984, 13.5, 26, 5], [825, 968, 9, 10, 0], [839, 1000, 8, 9.5, 0], [822, 991, 8.5, 7, 0], [836, 962, 6, 6, 0]] };
// The lagoon's barrier spit (kept as land whatever the coast noise does) and the Low Horn's spine.
export const KEEP_LAND = [
  { pts: [[870, 936], [862, 952], [857.5, 968], [856, 979]], hw: 2.6 },
  { pts: [[856.5, 992], [859, 1002], [866, 1013]], hw: 2.6 },
  { pts: [[176, 777], [160, 771], [147, 768.5]], hw: 3 }, // the Reef Bay's north headland (the Turn)
  { pts: [[655, 1268], [634, 1298], [616, 1326], [612.5, 1333]], hw: 5 }, // the Low Horn
  { pts: [[812, 158], [840, 146], [856, 136]], hw: 4.5 }, // the Grey Horn
];

// Sea kept open whatever the coast's noise does: the sailed sea ways of the Lamp Road (WORLD.md §5-§6).
export const KEEP_SEA = [
  { pts: [[146, 333], [124, 343], [106, 372], [98, 414], [100, 452], [113, 520], [123, 600], [137, 680], [133, 730], [131, 748], [136, 762]], hw: 7 },
  { pts: [[133, 767], [141, 778], [160, 787], [185, 793], [206, 797]], hw: 6 },
  { pts: [[100, 452], [108, 446]], hw: 16 },
  { pts: [[60, 480], [100, 452]], hw: 6 },
  { pts: [[700, 690], [800, 690], [900, 680], [1000, 660]], hw: 30 }, // the Morning Gulf stays a gulf
];
// How rough the ground is, 0..1.4 [x, y, roughness]: stone highland and ranges high, flats and basins low.
export const ROUGH = [[480, 330, 0.7], [560, 420, 0.7], [420, 420, 0.75], [600, 300, 0.6], [400, 540, 0.14], [440, 590, 0.18], [740, 330, 0.5], [760, 450, 0.55],
  [700, 560, 0.45], [820, 300, 0.4], [820, 500, 0.4], [200, 300, 1.1], [190, 430, 1.2], [200, 560, 1.0], [300, 400, 1.3], [280, 560, 1.3],
  [450, 680, 0.32], [580, 660, 0.32], [330, 690, 0.6], [350, 790, 0.36], [400, 900, 0.36], [300, 930, 0.42], [505, 790, 1.1], [560, 790, 0.9],
  [640, 900, 0.1], [720, 960, 0.07], [600, 1100, 0.05], [760, 1080, 0.04], [450, 1100, 0.07], [300, 1070, 0.07], [880, 1080, 0.03],
  [820, 880, 0.1], [700, 800, 0.3], [400, 1220, 1.1], [480, 1250, 1.0], [340, 1180, 0.8], [600, 1200, 0.35], [720, 1200, 0.22],
  [620, 1290, 0.7], [830, 160, 0.6], [700, 200, 0.5], [500, 200, 0.6], [230, 250, 0.5], [180, 880, 0.3], [220, 1100, 0.3], [250, 1160, 0.5]];

// ---- lakes [id, level in metres, blobs [x, y, rx, ry, rot]]. kind: 'lake' | 'pan' (seasonal) | 'tarn'
export const LAKES = [
  { id: 'mossmere', level: 300, blobs: [[585, 251, 17, 11.5, -8], [574, 256, 8, 6, 0], [597, 247, 7, 6, 0]] },
  { id: 'sporewood', level: 420, blobs: [[520, 305, 10.5, 7.5, -25], [509, 312.5, 6, 4.6, 10], [531, 298.5, 5.6, 4.4, 0], [524, 314, 4, 3, 0]] },
  { id: 'glasswater', level: 500, blobs: [[457, 366, 19, 10.5, -18], [444, 356, 8, 6, -30]] },
  { id: 'pallid', level: 520, blobs: [[377, 427, 27, 15, -8], [376, 442, 10, 12, 0], [393, 420, 11, 9, 0]] },
  { id: 'icelake', level: 120, blobs: [[230, 210, 6.5, 12, -24]] },
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
];
// the Hundred Tarns (470,455): scattered rock-basin tarns, placed by the seeded generator
export const TARNS = { at: [470, 455], radius: 26, count: 22 };

// ---- natural rivers: [x, y, metres above the sea]. Courses are WORLD.md §4 and §8; heights follow §9.
// meander: [amplitude, wavelength] in chart units; cls sets the drawn weight.
export const RIVERS = [
  { id: 'kingsflow', name: 'the Kingsflow', cls: 'kingdom', meander: [6.5, 26], pins: [0, 2, 4], bank: 5,
    pts: [[476, 360, 500], [495, 335, 462], [520, 305, 420], [550, 280, 362], [585, 250, 300]] },
  { id: 'sluiceRun', name: 'the Sluice Run', cls: 'kingdom', meander: [1.5, 10], bank: 10,
    pts: [[585, 250, 300], [589, 236, 297], [592, 222, 285], [596, 206, 250], [599.5, 193, 20], [600, 189, 0]] },
  { id: 'melt', name: null, cls: 'stream', meander: [4, 18], pins: [0, 5], bank: 9,
    pts: [[330, 280, 1500], [350, 303, 1000], [378, 313, 760], [404, 341, 590], [432, 343, 520], [440, 350, 500]] },
  { id: 'paleRun', name: 'the Pale Run', cls: 'river', meander: [2.8, 14], bank: 20,
    pts: [[350, 418, 520], [338, 409, 500], [325, 400, 470], [305, 385, 400], [282, 360, 250], [262, 336, 90], [256, 314, 0]] },
  { id: 'thinWater', name: 'the Thin Water', cls: 'braided', meander: [1.8, 13], bank: 4,
    pts: [[230, 205, 120], [236, 222, 112], [240, 245, 80], [246, 262, 55], [252, 285, 25], [258, 303, 0]] },
  { id: 'pyre', name: 'the Pyre', cls: 'river', meander: [3.2, 16], bank: 11,
    pts: [[262, 625, 2500], [274, 615, 1900], [285, 605, 1500], [312, 580, 1000], [335, 545, 760], [352, 505, 650], [368, 470, 562], [376, 452, 520]] },
  { id: 'rush', name: 'the Rush', cls: 'river', meander: [4.6, 22], bank: 5,
    pts: [[482, 770, 1150], [450, 790, 900], [410, 815, 760], [372, 835, 680], [352, 845, 645], [322, 852, 640], [272, 822, 640],
      [262, 818, 600], [250, 812, 420], [243, 808, 260], [234, 804, 120], [222, 800, 22], [208, 797.5, 0]] },
  { id: 'sweetwater', name: 'the Sweetwater', cls: 'river', meander: [5, 24], bank: 5,
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
  { id: 'inkwood', name: 'the Inkwood', cls: 'black', meander: [8.5, 27], pins: [0, 5, 6, 8], bank: 1,
    pts: [[560, 830, 140], [580, 850, 80], [600, 872, 50], [645, 912, 30], [688, 950, 19], [712, 975, 14], [740, 1000, 9.5], [756, 1032, 6.5], [758, 1068, 4]] },
  { id: 'monsoonCut', name: 'the Monsoon Cut', cls: 'seasonal', meander: [2, 12], bank: 1,
    pts: [[745, 1002, 9.9], [762, 999, 6.5], [780, 996, 4], [798, 992, 1.6], [814, 990, 0]] },
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
    pts: [[290, 460, 2300], [262, 464, 1200], [220, 470, 420], [185, 471, 120], [164, 471, 0]] },
  { id: 'westStreamB', name: null, cls: 'stream', meander: [2.4, 12], bank: 20,
    pts: [[250, 640, 2500], [230, 651, 1200], [210, 660, 520], [165, 665, 0]] },
];

// ---- the kingdom's canals (works, not rivers: they cross divides at fed summits)
export const CANALS = [
  { id: 'kingsCut', name: "the King's Cut", pts: [[404, 420], [424, 402], [440, 380], [449, 371]], level: 521,
    locks: [[443, 377], [446, 374], [449, 371]] },
  { id: 'straightCanal', name: 'the Straight Canal', pts: [[252, 1010], [280, 1035], [318, 1062], [355, 1080], [398, 1094]], level: 15,
    locks: [[254, 1012], [266, 1022.5], [300, 1049], [338, 1071.5], [366, 1083.5], [390, 1091.4]] },
];

// ---- relief. Base heights are blended (inverse-distance) from these [x, y, metres, radius?] and the
// ranges are added on top. Figures follow WORLD.md §2's region table.
export const HEIGHTS = [
  // the Cold Coast and the north-west
  [180, 215, 180], [210, 190, 140], [150, 262, 260], [165, 300, 220], [200, 250, 160], [238, 250, 70, 14], [228, 285, 110, 14],
  [262, 185, 800], [300, 176, 1300], [350, 186, 1300], [410, 180, 720], [470, 190, 460], [528, 206, 345], [566, 209, 325],
  [600, 206, 312], [640, 212, 322], [690, 200, 290], [748, 186, 220], [800, 170, 200], [838, 160, 240], [856, 142, 160],
  // the highland (the old kingdom), 300-550 m, falling north-east to the Mossmere
  [585, 250, 306, 16], [640, 272, 362], [662, 262, 352, 12], [620, 332, 432], [560, 302, 404], [520, 305, 426, 16], [484, 300, 520],
  [457, 366, 506, 18], [500, 382, 524], [560, 392, 500], [612, 420, 484], [640, 470, 480], [540, 452, 545], [470, 455, 566],
  [425, 398, 545, 12], [377, 428, 524, 22], [350, 446, 640], [404, 472, 575], [430, 338, 640], [382, 300, 1000], [400, 252, 900],
  [440, 230, 660], [500, 240, 455], [600, 500, 520], [520, 522, 585], [640, 545, 500], [560, 580, 540],
  // the Pale Flats, 560-700 m
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
  // the Green Heart: a flat, low, flooded basin
  [580, 852, 120], [640, 862, 70], [700, 882, 45], [600, 922, 50], [660, 942, 30], [720, 962, 20], [760, 922, 34],
  [800, 902, 28], [850, 882, 18], [780, 1002, 12], [700, 1012, 22], [640, 1002, 34], [580, 982, 60], [540, 932, 130],
  [540, 1022, 60], [860, 902, 14], [870, 852, 20],
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
  { id: 'southern', pts: [[330, 1186, 260, 13], [400, 1222, 420, 16], [470, 1250, 360, 15], [522, 1236, 160, 13]] },
  { id: 'greyHorn', pts: [[790, 172, 120, 9], [830, 156, 150, 8], [858, 138, 110, 6]] },
  { id: 'lowHorn', pts: [[640, 1262, 180, 10], [622, 1296, 160, 8], [612, 1326, 100, 6]] },
  { id: 'downs', pts: [[700, 320, 140, 26], [770, 400, 200, 30], [740, 500, 160, 28]] },
];
// The White Crown ice field, about 2,800 m, on the Spine's north end, and the Pyre Peaks' snow.
export const ICE = { crown: { poly: [[262, 186], [300, 176], [338, 184], [347, 220], [344, 262], [334, 290], [308, 297], [286, 296], [262, 280], [250, 246], [252, 210]], top: 2800 },
  tongues: [
    { pts: [[296, 290, 5], [293, 297, 4.2], [291.5, 301.5, 3.2]] }, // the tidewater glacier at the Sound's head
    { pts: [[254, 222, 5], [244, 214, 4.5], [237, 209, 3.6]] }, // the west outlet glacier to the ice-lake
    { pts: [[340, 262, 4.5], [336, 276, 3.6], [331, 281, 2.4]] }, // the east melt
  ] };
// The Great Step: a 600 m escarpment, dying out into the Low Gap (WORLD.md §2).
export const STEP = [[250, 694], [245, 720], [238, 780], [246, 850], [255, 920], [268, 985], [277, 1012]];

// ---- the sixteen waters (SPEC §5.2 order; WORLD.md §5 places; LORE.md §3 chapters; ROSTER §3 legends)
export const HOME = {
  name: 'The Landing', at: [600, 190], lat: '51.0°N', kind: 'home, a sea cave under the outer wall',
  story: 'An old ferry landing at the foot of the outer wall, under the Sluice Run’s fall. The capital’s window candles washed ashore here on the night of the drowning, and some of them woke.',
  more: 'Every evening starts and ends here. Out past the ferry gate the channel runs into the mist, and in the mist every remembered water lies one evening from home. Sixteen Waystones sit on the sill in four arcs; one lights for each map bought.',
};

export const ACTS = [
  { n: 'I', title: 'What Fell', reach: 'the old kingdom', hand: 'court surveyors’ sheets' },
  { n: 'II', title: 'The Road of Farewells', reach: 'the cold rim', hand: 'funeral priests’ sheets' },
  { n: 'III', title: 'Where They Turned', reach: 'the falls and the gate', hand: 'harbour-masters’ sheets' },
  { n: 'IV', title: 'The Way Home', reach: 'the green heart', hand: 'barge pilots’ sheets, and Murk’s own' },
];

export const WATERS = [
  { n: 1, name: 'The Mossmere', at: [585, 250], kind: 'lake', detail: 'the capital’s moat', lat: '50.9°N',
    story: 'The drowned capital’s moat, under the Sunken Gate. The great lantern hung here; when its old chain parted, the great sluice dropped shut and the lake rose over the city.',
    legend: 'The Belled Matriarch', legendLine: 'A bell grew into her skull. She has tolled for the drowned ever since.',
    from: 'From the Landing, south and up the Sluice Run by the ferry stair’s locks: about 15 km and 300 m of climb.',
    murk: null },
  { n: 2, name: 'Sporewood Pools', at: [520, 305], kind: 'lake', detail: 'a warm volcanic hollow', lat: '50.8°N',
    story: 'The royal gardens, kept mild by warm springs in the cold highland. The fungi went on growing after the gardeners stopped. A bee skep is carved over one garden door.',
    legend: 'The Drifting Grove', legendLine: 'A whole meadow rides on her back. It blooms where no one sees.',
    from: 'Up the Kingsflow from the Mossmere’s south end, through a short reach of rapids and one kingdom lock: about 20 km, 120 m up.',
    murk: 'Gardeners. Tidy to the last. Mind the spores.' },
  { n: 3, name: 'Glasswater Vault', at: [455, 368], kind: 'lake', detail: 'a granite and crystal basin', lat: '50.7°N',
    story: 'Where the kingdom shelved light in crystal, like books. Its chandelier fell the same night as the lantern and still burns under the water: the lights were kept, not lost.',
    legend: 'The Glass Sovereign', legendLine: 'Each scale is a window with no one behind it.',
    from: 'Up the Kingsflow again through a narrow granite throat, about 20 km and 80 m up, to the head lake of the river you have been climbing.',
    murk: 'They kept light on shelves there. Like jam.' },
  { n: 4, name: 'The Pallid Deep', at: [378, 428], kind: 'deep lake', detail: 'a glacial trough, floor below the sea', lat: '50.6°N',
    story: 'The funeral lake, where for centuries the dead were set adrift with a candle each. Far down in the Bottomless, a pale fish older than the kingdom keeps the great lantern’s ember warm.',
    legend: 'The Lantern-Swallower', legendLine: 'The great lantern went down. Still going.',
    from: 'West over the King’s Cut: up the Stilled Cascade’s lock flight to the summit pound, then level across the kingdom’s divide, about 20 km.',
    murk: 'Down there’s the oldest thing I know. Be polite.' },
  { n: 5, name: 'The Rime Sound', at: [220, 312], kind: 'sound', detail: 'a fjord with ice at its head', lat: '50.4°N',
    story: 'The first water outside the walls, and the first salt. The kingdom’s funeral road ran out through this fjord, and someone small still fishes the ice at its head by lantern.',
    legend: 'The Long Winter', legendLine: 'It was old when the kingdom was built. It has not hurried once since.',
    from: 'Down the Pale Run, west through the Pale Gap in the Spine and past its falls by the old slipway: about 110 km and 520 m down to the sea.',
    murk: 'Someone fishes the ice up there. Not me.' },
  { n: 6, name: 'The Thin Water', at: [246, 262], kind: 'river', detail: 'a braided sand river', lat: '50.9°N',
    story: 'Below the broken royal weir the river spreads wide and thin over pale sand. The sluice lamp still burns, and on the first evening it brightens once as the raft passes.',
    legend: 'The Buried Moon', legendLine: 'A moon that comes down to see the water and stays for the sand. Nobody can talk her back.',
    from: 'From the Sound’s head, north over the sand delta beside the glacier front and up over the bars toward the weir: about 100 km of river.',
    murk: 'That lamp’s never gone out. Don’t ask me why.' },
  { n: 7, name: 'The Last Light', at: [100, 452], kind: 'open sea', detail: 'under the lighthouse on the Lamp Rock', lat: '49.6°N',
    story: 'The lamp lit to see the dead off, on the outer rock. Beyond it lies the Lampless Sea, the side the sun went down. Nothing is drawn past the far isle.',
    legend: 'The Jetsam Shark', legendLine: 'It has swallowed half the kingdom’s lost things, and kept them all.',
    from: 'Downstream all the way: down the Thin Water, the whole Sound and out over its sill, then about 110 km south-west on the cold current.',
    murk: 'It turns for ships that left. It’s polite like that.' },
  { n: 8, name: 'Pyrefall Gorge', at: [312, 580], kind: 'river', detail: 'a snowmelt gorge, temple stairs and pyres', lat: '49.0°N',
    story: 'Where the cold road begins, in the snow. The kingdom burned its dead on these stairs, and the pyres still gutter though nobody has died for centuries. In one niche a small window candle is still lit.',
    legend: 'The Ashen Guest', legendLine: 'Uninvited to every funeral. Never once absent.',
    from: 'Back up the whole cold road: in past the Sound’s mouth, up the Pale Run, across the Pallid Deep, then about 140 km up the Pyre over the Pale Flats.',
    murk: 'They still light the pyres. Nobody’s died. Habit.' },
  { n: 9, name: 'The Waxen Reef', at: [138, 758], kind: 'reef', detail: 'a drowned harbour town, a drop-off and a wreck', lat: '6.2°N',
    story: 'The first warm water. The kingdom’s west port stood on land won from the sea behind a mole; the sea took it back and coral took the roofs. Its doors and steps are far too tall for a Wick.',
    legend: 'The Waxen Abbot', legendLine: 'It opens its mouth and the reef leans in. It has swallowed bigger than you.',
    from: 'Down the cold road to the sea, then south down the Long Coast on the cold current, about 4,700 km through the Fold, until the headland turns the current and the water warms.',
    murk: 'Warm water. You’ll hate it. Then you won’t.' },
  { n: 10, name: 'The Thunder Stair', at: [228, 800], kind: 'river', detail: 'stepped cataracts, a lock stair and two towers', lat: '5.4°N',
    story: 'Where the Rush comes off the Great Step. The lock stair is broken and the river falls down it; it never rains here, so everything green lives on the spray. The two tower lamps still burn.',
    legend: 'The Last Lock', legendLine: 'Thirty-two teeth and none of them hidden. Nothing passes the lock.',
    from: 'East across the Reef Bay and up the Rush’s short lower course, about 40 km, to the calm reach at the Step’s foot. The reef town and the stair were one port.',
    murk: 'Two lamps on the towers. Wave. They like that.' },
  { n: 11, name: 'Rushlight Fen', at: [322, 852], kind: 'fen', detail: 'a papyrus delta above the great dam', lat: '4.4°N',
    story: 'An inland delta on the dry Terrace, behind a dam that still holds. People fished here by the basketful, laughing. The kingdom was a good place that ended.',
    legend: 'The Long Thunder', legendLine: 'You feel it before you hear it, and it goes on a long time.',
    from: 'Up the Great Step, 600 m in about 20 km: hauled up the towers’ haul-way past the Throat, then lifted through the great dam’s barge lock.',
    murk: 'People laughed there once. Fish remember.' },
  { n: 12, name: 'The Salt Gate', at: [240, 1008], kind: 'river', detail: 'a tidal river mouth and a shipyard', lat: '1.7°N',
    story: 'The great sea-gate, left open, and a yard of unfinished hulls. Here the people began a fleet to follow the sun west, thought better of it, and turned inland for home.',
    legend: 'The Old Shipwright', legendLine: 'Still cutting ribs for a fleet that will never sail.',
    from: 'Down the Sweetwater from the fen’s south channels, about 320 km across the Terrace, past the small fall by its side lock and down the ebb to the gate.',
    murk: 'They built a fleet there. Then they went home.' },
  { n: 13, name: 'Lampmoss Slough', at: [318, 1062], kind: 'swamp', detail: 'a canal summit and its lock', lat: '0.7°N',
    story: 'The Straight Canal’s summit pound in the Low Gap, the first country the eastern rains reach. Chairs, a cradle and empty birdcages lie on the canal bed, fallen from overloaded barges going south.',
    legend: 'The Last Sentry', legendLine: 'Still at his post in full mail. Nobody told him the kingdom drowned.',
    from: 'From inside the sea-gate, by a lock into the Straight Canal and gently up for about 150 km to its summit: the way the people turned for home.',
    murk: 'Last barge through there went south. I poled it.' },
  { n: 14, name: 'The Siltway', at: [760, 1080], kind: 'river', detail: 'the great brown lowland river', lat: '0.4°N',
    story: 'The barge road, so wide the far bank is a green line, and loud with frogs. Pale mile-posts count down toward the forest. At the Seam the black Inkwood pours in and will not mix.',
    legend: 'The Barge-Shadow', legendLine: 'It follows the last barge down the road. The barge sank long ago. It follows anyway.',
    from: 'Down the canal’s eastern locks to the Canal Mouth, then east down the barge road for about 720 km to the Seam and the great bend.',
    murk: 'Loud, isn’t it? That’s what alive sounds like.' },
  { n: 15, name: 'Lanternroot Lagoon', at: [830, 985], kind: 'lagoon', detail: 'a mangrove lagoon behind a barrier spit', lat: '2.1°N',
    story: 'Where the orchard met the sea. The unbanked delta edge sank and mangroves grew through it. Stilt houses hang lanterns at every dusk, one sage green among the amber: Murk’s kin live here, unseen.',
    legend: 'The Silver Regent', legendLine: 'She rolls at the surface to sip the air, and the whole lagoon hears her sigh.',
    from: 'Downstream past the great bend to the delta head, about 140 km, then 70 km north up the delta’s north arm into the lagoon.',
    murk: 'My lot live there. We don’t talk.' },
  { n: 16, name: 'The Inkwood', at: [712, 975], kind: 'river', detail: 'blackwater through flooded rainforest', lat: '2.3°N',
    story: 'The Green Heart, where the kingdom began and ended. The last of the people lived out their days in this forest, and before they were gone they banked their hearth-fire for morning. The water kept it.',
    legend: 'The Banked Fire', legendLine: 'It must come up for air, like any fire. It burns low and waits for morning.',
    from: 'West from the lagoon’s head up the Monsoon Cut, about 140 km through the drowned orchard rows, then upstream under the closed canopy.',
    murk: 'Last chart there is. I drew it myself, after.' },
];

// ---- the Lamp Road, leg by leg (WORLD.md §5 "Joined" and §6). Each leg is a list of pieces:
//   { r: riverOrCanalId, from: [x,y], to: [x,y] }  a stretch of a drawn waterway, between the nearest points
//   { p: [[x,y],...], k: 'lake' | 'sea' }             open water (smoothed)
// k overrides the drawn kind: 'river' (default), 'canal', 'lake', 'sea' (dotted sailing line), 'haul' (the haul-way).
const SOUND = [[256, 313], [242, 312], [220, 312], [198, 320], [172, 326], [146, 333]];
const SEA_OUT = [[146, 333], [124, 343], [106, 372], [98, 414], [100, 452]];
const rev = (a) => a.slice().reverse();
export const LEGS = [
  { to: 1, pieces: [{ r: 'sluiceRun', from: [600, 189], to: [585, 250] }] },
  { to: 2, pieces: [{ r: 'kingsflow', from: [585, 250], to: [520, 305] }] },
  { to: 3, pieces: [{ r: 'kingsflow', from: [520, 305], to: [476, 360] }, { p: [[476, 360], [466, 365], [455, 368]], k: 'lake' }] },
  { to: 4, pieces: [{ p: [[455, 368], [449, 371]], k: 'lake' }, { r: 'kingsCut', from: [449, 371], to: [404, 420], k: 'canal' }, { p: [[404, 420], [391, 425], [378, 428]], k: 'lake' }] },
  { to: 5, pieces: [{ p: [[378, 428], [362, 422], [350, 418]], k: 'lake' }, { r: 'paleRun', from: [350, 418], to: [256, 314] }, { p: [[256, 314], [242, 312], [220, 312]], k: 'sea' }] },
  { to: 6, pieces: [{ p: [[220, 312], [242, 311.5], [254, 308], [258, 303]], k: 'sea' }, { r: 'thinWater', from: [258, 303], to: [246, 262] }] },
  { to: 7, pieces: [{ r: 'thinWater', from: [246, 262], to: [258, 303] }, { p: [[258, 303], [254, 308], ...SOUND.slice(1), ...SEA_OUT.slice(1)], k: 'sea' }] },
  { to: 8, pieces: [{ p: [...rev(SEA_OUT), ...rev(SOUND).slice(1)], k: 'sea' }, { r: 'paleRun', from: [256, 314], to: [350, 418] },
    { p: [[350, 418], [364, 432], [376, 452]], k: 'lake' }, { r: 'pyre', from: [376, 452], to: [312, 580] }] },
  { to: 9, pieces: [{ r: 'pyre', from: [312, 580], to: [376, 452] }, { p: [[376, 452], [364, 432], [350, 418]], k: 'lake' },
    { r: 'paleRun', from: [350, 418], to: [256, 314] },
    { p: [...SOUND, ...SEA_OUT.slice(1), [113, 520], [123, 600], [137, 680], [133, 730], [131, 748], [138, 758]], k: 'sea' }] },
  { to: 10, pieces: [{ p: [[138, 758], [133, 767], [141, 778], [160, 787], [185, 793], [208, 797.5]], k: 'sea' }, { r: 'rush', from: [208, 797.5], to: [228, 800] }] },
  { to: 11, pieces: [{ r: 'rush', from: [228, 800], to: [272, 822], k: 'haul' }, { p: [[272, 822], [288, 831], [306, 842], [322, 852]], k: 'lake' }] },
  { to: 12, pieces: [{ p: [[322, 852], [322, 858]], k: 'lake' }, { r: 'sweetwater', from: [322, 858], to: [269, 997] }, { p: [[269, 997], [262, 1003], [252, 1006.5], [240, 1008]], k: 'lake' }] },
  { to: 13, pieces: [{ p: [[240, 1008], [247, 1008.5], [252, 1010]], k: 'lake' }, { r: 'straightCanal', from: [252, 1010], to: [318, 1062], k: 'canal' }] },
  { to: 14, pieces: [{ r: 'straightCanal', from: [318, 1062], to: [398, 1094], k: 'canal' }, { r: 'siltway', from: [398, 1094], to: [760, 1080] }] },
  { to: 15, pieces: [{ r: 'siltway', from: [760, 1080], to: [842, 1070] }, { r: 'northArm', from: [842, 1070], to: [838, 1010] }, { p: [[838, 1010], [835, 998], [830, 985]], k: 'lake' }] },
  { to: 16, pieces: [{ p: [[830, 985], [822, 988], [814, 990]], k: 'lake' }, { r: 'monsoonCut', from: [814, 990], to: [745, 1002] }, { r: 'inkwood', from: [745, 1002], to: [712, 975] }] },
];
// Sea ways from the Landing (WORLD.md §6): not part of any leg, drawn faintly on the whole-world view.
export const SEA_WAYS = [
  [[600, 178], [520, 150], [400, 143], [290, 138], [180, 176], [112, 250], [118, 318], [130, 339]],
  [[600, 178], [690, 150], [760, 136], [880, 118], [895, 200], [880, 450], [900, 700], [912, 850], [950, 1050]],
];

// ---- the Chart's sheets: what each lake map inks when it is bought (WORLD.md §10). Circles [x, y, r]
// and paths { p, w } (a stroke of half-width w). `r` may name a river.
export const SHEETS = [
  /* 1 */ [{ r: 'sluiceRun', w: 24 }, [585, 250, 30], { p: [[520, 188], [600, 180], [686, 186]], w: 20 }],
  /* 2 */ [[520, 305, 32], { r: 'kingsflow', from: [585, 250], to: [520, 305], w: 22 }, [618, 300, 34]],
  /* 3 */ [[455, 368, 38], { r: 'kingsflow', from: [520, 305], to: [476, 360], w: 22 }, { r: 'melt', w: 18 }, [470, 250, 50], { p: [[440, 176], [470, 178], [520, 190]], w: 18 }],
  /* 4 */ [[378, 428, 44], { p: [[404, 420], [449, 371]], w: 20 }, [470, 455, 34], [530, 410, 92], [590, 470, 60], [600, 360, 50]],
  /* 5 */ [{ p: [[130, 339], [172, 326], [220, 312], [262, 309], [291, 302]], w: 32 }, { r: 'paleRun', w: 24 }, [305, 385, 38], [302, 300, 30]],
  /* 6 */ [{ r: 'thinWater', w: 26 }, [230, 208, 28], [296, 236, 58], [172, 242, 50], { p: [[236, 174], [300, 162], [350, 166], [420, 162], [450, 138]], w: 22 }, [450, 118, 24]],
  /* 7 */ [[104, 448, 52], [55, 495, 24], { p: [[146, 333], [124, 343], [106, 372], [98, 414], [100, 452]], w: 32 }, [192, 420, 60], [162, 372, 40], [300, 450, 36]],
  /* 8 */ [{ r: 'pyre', w: 30 }, [400, 536, 74], [262, 628, 48], [290, 530, 44], [312, 580, 40], [190, 505, 46]],
  /* 9 */ [{ p: [[100, 452], [113, 520], [123, 600], [137, 680], [133, 730], [138, 758]], w: 40 }, [138, 758, 34], [205, 655, 46]],
  /* 10 */ [[190, 792, 36], [236, 804, 34], { p: [[247, 712], [239, 780]], w: 24 }],
  /* 11 */ [[322, 852, 42], { p: [[272, 822], [330, 852]], w: 26 }, { r: 'rush', from: [352, 845], to: [482, 770], w: 28 }, [360, 780, 66], [500, 790, 50]],
  /* 12 */ [{ r: 'sweetwater', w: 34 }, [234, 1008, 46], { p: [[184, 880], [196, 940], [205, 992]], w: 28 }, { p: [[246, 850], [255, 920], [268, 985]], w: 28 }, [380, 925, 62]],
  /* 13 */ [{ p: [[252, 1010], [280, 1035], [318, 1062]], w: 28 }, [300, 1070, 46], [236, 1078, 38]],
  /* 14 */ [{ p: [[318, 1062], [355, 1080], [398, 1094]], w: 26 }, { r: 'siltway', from: [300, 1175], to: [775, 1092], w: 44 }, [400, 1192, 58], [500, 1180, 48], { r: 'clearRiver', w: 22 }, { r: 'southRiver', w: 22 }],
  /* 15 */ [{ r: 'siltway', from: [775, 1092], to: [942, 1070], w: 40 }, [896, 1086, 66], { r: 'northArm', w: 28 }, [836, 985, 46], [872, 932, 28], [948, 1138, 22]],
  /* 16 */ [{ r: 'monsoonCut', w: 28 }, { r: 'inkwood', w: 48 }, [640, 930, 92], [722, 930, 78], [590, 872, 58], [545, 826, 40]],
];

// ---- lettering. kind: sea | region | place | river (set along its course) | note.
// `a` is the angle in degrees; `z` the least zoom (screen px per chart unit) at which it may show.
export const LABELS = [
  { t: 'The Cold Sea', at: [318, 92], kind: 'sea', a: -3 },
  { t: 'The Lampless Sea', at: [42, 640], kind: 'sea', a: -86 },
  { t: 'The Morning Sea', at: [958, 392], kind: 'sea', a: 86 },
  { t: 'The Warm Sea', at: [395, 1362], kind: 'sea', a: 2 },
  { t: 'The Morning Gulf', at: [770, 690], kind: 'sea', a: -8, small: true },
  { t: 'The Cold Coast', at: [742, 138], kind: 'region', a: -15, z: 0.75 },
  { t: 'The Highland', sub: 'the old kingdom', at: [560, 440], kind: 'region' },
  { t: 'The Spine', at: [287, 492], kind: 'region', a: 84 },
  { t: 'The White Crown', at: [300, 232], kind: 'region', z: 0.8, tone: 'ice' },
  { t: 'The Fjord Coast', at: [196, 404], kind: 'region', a: 62, z: 0.9 },
  { t: 'The Pale Flats', at: [408, 548], kind: 'region', z: 0.7 },
  { t: 'The Eastern Downs', at: [748, 440], kind: 'region' },
  { t: 'The Grey Horn', at: [822, 186], kind: 'region', a: -24, z: 0.9 },
  { t: 'The Fold', sub: 'some 4,500 km, folded to a hand’s width', at: [452, 690], kind: 'region' },
  { t: 'The Long Coast', at: [106, 610], kind: 'sea', a: -80, small: true, z: 0.7 },
  { t: 'The Great Step', at: [262, 902], kind: 'region', a: 79, z: 0.9 },
  { t: 'The Terrace', at: [372, 778], kind: 'region', z: 0.6 },
  { t: 'The Middle Hills', at: [532, 816], kind: 'region', z: 0.8 },
  { t: 'The Low Gap', at: [292, 1096], kind: 'region', z: 1.0 },
  { t: 'The Green Heart', at: [646, 886], kind: 'region' },
  { t: 'The Southern Hills', at: [420, 1240], kind: 'region', z: 0.6 },
  { t: 'The Low Horn', at: [628, 1276], kind: 'region', a: 62, z: 0.9 },
  { t: 'the Kingsflow', river: 'kingsflow', at: [556, 276], kind: 'river', z: 2.4 },
  { t: 'the Sluice Run', river: 'sluiceRun', at: [593, 218], kind: 'river', z: 4.2 },
  { t: 'the King’s Cut', canal: 'kingsCut', at: [426, 398], kind: 'river', z: 3.2 },
  { t: 'the Pale Run', river: 'paleRun', at: [290, 368], kind: 'river', z: 2.2 },
  { t: 'the Pyre', river: 'pyre', at: [350, 510], kind: 'river', z: 1.6 },
  { t: 'the Rush', river: 'rush', at: [420, 808], kind: 'river', z: 1.4 },
  { t: 'the Sweetwater', river: 'sweetwater', at: [300, 928], kind: 'river', z: 1.4 },
  { t: 'the Straight Canal', canal: 'straightCanal', at: [358, 1081], kind: 'river', z: 2.2 },
  { t: 'the barge road', river: 'siltway', at: [560, 1110], kind: 'river', z: 1.2 },
  { t: 'the Monsoon Cut', river: 'monsoonCut', at: [780, 996], kind: 'river', z: 2.6 },
  { t: 'the clear river', river: 'clearRiver', at: [486, 980], kind: 'river', z: 1.8 },
  { t: 'the Sunken Gate', at: [585, 238], kind: 'place', z: 3.0 },
  { t: 'the outer wall', at: [652, 203], kind: 'place', z: 2.6 },
  { t: 'the great sluice', at: [596, 207], kind: 'place', z: 5 },
  { t: 'the Hundred Tarns', at: [470, 455], kind: 'place', z: 1.8 },
  { t: 'the Pale Gap', at: [305, 385], kind: 'place', z: 1.8 },
  { t: 'the royal weir', at: [236, 222], kind: 'place', z: 2.6 },
  { t: 'the ice-lake', at: [229, 204], kind: 'place', z: 3.2 },
  { t: 'the Pyre Peaks', at: [262, 632], kind: 'place', z: 1.1 },
  { t: 'the Lamp Rock', at: [110, 440], kind: 'place', z: 2.2, on: 'sea' },
  { t: 'the far isle', at: [55, 495], kind: 'place', z: 1.2, on: 'sea' },
  { t: 'the northern isles', at: [450, 116], kind: 'place', z: 1.4, on: 'sea' },
  { t: 'the Drift Line', at: [124, 418], kind: 'place', z: 2.4, on: 'sea' },
  { t: 'the Turn', at: [156, 778], kind: 'place', z: 2.6, on: 'sea' },
  { t: 'the Reef Bay', at: [186, 791], kind: 'place', z: 2.2, on: 'sea' },
  { t: 'the lock stair', at: [243, 808], kind: 'place', z: 3.4 },
  { t: 'the great dam', at: [272, 822], kind: 'place', z: 2.6 },
  { t: 'the salt pans', at: [400, 932], kind: 'place', z: 1.6 },
  { t: 'an empty town', at: [418, 912], kind: 'place', z: 2.4, never: true },
  { t: 'the sea-gate', at: [222, 1012], kind: 'place', z: 3.2 },
  { t: 'the Canal Mouth', at: [398, 1094], kind: 'place', z: 2.0 },
  { t: 'the mile-posts', at: [600, 1102], kind: 'place', z: 2.6 },
  { t: 'the Seam', at: [758, 1068], kind: 'place', z: 2.2 },
  { t: 'the great bend', at: [776, 1093], kind: 'place', z: 3.0 },
  { t: 'the delta', at: [902, 1084], kind: 'place', z: 1.3 },
  { t: 'the stilt village', at: [836, 977], kind: 'place', z: 3.6 },
  { t: 'the Morning Isle', at: [947, 638], kind: 'place', z: 1.3, on: 'sea' },
  { t: 'the watchtower', at: [858, 138], kind: 'place', z: 2.2 },
  { t: 'a drowned town', at: [662, 690], kind: 'place', z: 2.0, on: 'sea' },
  { t: 'the crater lake', at: [730, 330], kind: 'place', z: 2.2 },
  { t: 'the ferry gate', at: [600.5, 183], kind: 'place', z: 5.5, on: 'sea' },
  { t: 'the cold current', at: [92, 560], kind: 'note', a: -84, z: 1.5, on: 'sea' },
  { t: 'the warm countercurrent', at: [150, 880], kind: 'note', a: -82, z: 1.5, on: 'sea' },
];

// ---- small drawn things: the kingdom's works and ruins (WORLD.md §8). g names a glyph in the bake.
export const LANDMARKS = [
  { g: 'gate', at: [585, 238.4], s: 2 },
  { g: 'wall', pts: [[522, 199], [546, 203], [566, 204.5], [586, 198], [594, 197.5]], s: 1 },
  { g: 'wall', pts: [[607, 197.5], [616, 198], [638, 204], [662, 198], [688, 192]], s: 1 },
  { g: 'sluice', at: [596.2, 204.5], s: 1 },
  { g: 'stair', pts: [[601.5, 192], [599, 202], [596, 214], [593.5, 226]], s: 0.9 },
  { g: 'city', at: [585, 251], rx: 15, ry: 9.5, rot: -8 }, // the lower city under the Mossmere
  { g: 'ruins', at: [565, 240], n: 14, r: 9 }, { g: 'ruins', at: [607, 239], n: 13, r: 8 }, { g: 'ruins', at: [602, 265], n: 11, r: 8 }, { g: 'ruins', at: [565, 267], n: 10, r: 7 },
  { g: 'bridge', pts: [[572, 251], [583, 251.5]], s: 1 },
  { g: 'lock', at: [552, 278.5], s: 1, rot: -40 },
  { g: 'caps', at: [520, 305], n: 16, r: 15 },
  { g: 'garden', at: [535, 314], s: 1 }, { g: 'garden', at: [505, 297], s: 1 },
  { g: 'monolith', at: [446, 371], s: 1 }, { g: 'monolith', at: [468, 356], s: 1 }, { g: 'monolith', at: [460, 379], s: 1 },
  { g: 'crystals', at: [455, 368], n: 12, r: 21 },
  { g: 'ribs', at: [377, 428], n: 9, rx: 22, ry: 11, rot: -8 },
  { g: 'weir', at: [236, 222], s: 1, rot: 70 },
  { g: 'lighthouse', at: [110, 439.2], s: 1 },
  { g: 'slipway', pts: [[286, 366], [276, 354], [268, 344]], s: 1 },
  { g: 'pyreStairs', at: [312, 580], s: 1, rot: -35 },
  { g: 'reefTown', at: [138, 760], s: 1 },
  { g: 'towers', at: [243, 807.5], s: 1, rot: 15 },
  { g: 'stair', pts: [[232, 804.5], [240, 808.5], [250, 813.5], [261, 819]], s: 1 },
  { g: 'dam', pts: [[270.5, 816], [273, 828]], s: 1 },
  { g: 'town', at: [418, 912], n: 9, r: 4.5 },
  { g: 'seaGate', at: [222, 1010.5], s: 1 },
  { g: 'hulls', at: [236, 1016.5], n: 6, s: 1 },
  { g: 'posts', river: 'siltway', from: [398, 1094], to: [842, 1070], every: 20 },
  { g: 'barge', at: [776, 1094.5], s: 1, rot: 30 },
  { g: 'stilts', at: [834, 979], n: 7, r: 5 },
  { g: 'hearth', at: [709, 972], s: 1 },
  { g: 'tower', at: [858, 136.5], s: 1 },
  { g: 'drowned', at: [662, 690], n: 8, r: 6 },
  { g: 'oxbow', at: [560, 1125], s: 1, rot: 200 }, { g: 'oxbow', at: [650, 1112], s: 1.1, rot: 160 }, { g: 'oxbow', at: [468, 1104], s: 0.8, rot: 20 }, { g: 'oxbow', at: [702, 1084], s: 0.8, rot: 150 },
  { g: 'wreck', at: [130, 765], s: 1, rot: 30 },
  { g: 'buoys', pts: [[232, 314], [206, 319], [180, 325], [154, 332]] },
  { g: 'driftLine', pts: [[112, 404], [118, 414], [122, 425], [120, 436]] },
];

// The cold current, the warm countercurrent and the east-coast warm current (WORLD.md §3).
export const CURRENTS = [
  { tone: 'cold', pts: [[92, 380], [84, 430], [88, 500], [96, 570], [106, 640], [116, 700], [112, 742], [92, 772], [66, 790]] },
  { tone: 'cold', pts: [[70, 300], [66, 360], [68, 420]] },
  { tone: 'warm', pts: [[196, 1160], [176, 1090], [164, 1010], [156, 930], [150, 860], [140, 806], [122, 786]] },
  { tone: 'warm', pts: [[962, 1200], [978, 1100], [968, 990], [940, 880], [920, 800], [900, 740], [850, 708], [780, 716]] },
];

// The wash stops short of these corners so the title, the compass and the scale sit on bare paper.
export const CORNERS = { title: [62, 1378, 168], rose: [984, 12, 104], scale: [940, 1404, 140] };
