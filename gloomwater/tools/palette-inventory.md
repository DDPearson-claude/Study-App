# GLOOMWATER colour-source inventory (palette rework prep)

Snapshot of branch `gw-palette` at `41b9c39` (after the UI merge). Line numbers are for that
commit. Hue bands follow `tools/hue-report.mjs`: GREEN 65–160°, TEAL 160–195°.
"G/T" marks a literal that reads green/teal/mint/lime. Hash/luma constants that only look like
colours (`vec3(0,1,0)` lattice offsets in `models-kit.js:11-15` / `world-fx.js:11-12`, the Rec.709
luma `vec3(0.2126, 0.7152, 0.0722)` in `render-grade.js:46` / `water-shader.js:368`) are not colours
and are left out.

Counts (all of `src/`): about 1,525 colour literals, of which 95 are in the green band and 91 in
the teal band. Where those 186 sit: `data.js` 46, UI files 45 (`ui.css` 18, `ui-icons.js` 16,
`ui-screens.js` 4, `ui-hud.js` 3, `ui-fishart.js` 2, `template.html` 2), `world-art.js` 19,
`actors-merchant.js` 15, `world.js` 14, `water.js` 9, `fishing.js` 6, `models-creatures.js` 5,
`fishing-fx.js` 4, and a few each in combat, render and toon. Those totals include the fake
colours (hash/luma constants) listed above.

## 0. How colour reaches the screen (read this first)

The Mossmere's green does not live in one place. It enters through five channels, and each one
needs its own fix:

1. **Zone palette (`data.js` ZONES[].palette).** `world.js` turns it into fog, hemisphere and
   directional light, the water palette and the grade. `world-art.js` turns it into rim light,
   ring/dome/mist colours, prop glows, accent lights and particles. `water.js` and the water
   shader use it for the base, sky reflection, foam and glow. `fishing-fx.js` uses it for the
   feeding-spot motes. The UI uses it for `--zone-glow`, the day-arc "calm" segment, the gate
   marker and zone cards.
2. **Grade tint (`data.js` ZONES[].grade.tint, default `0x2e6b63`).** `render-grade.js` mixes
   the tint into every pixel's **shadows**
   (`col = mix(col, l*tintN, sh*tintAmount*1.6)`). It also adds it to the ink lift and the vignette.
   At tintAmount 0.18 this paints the whole Mossmere frame teal, including the raft and the swarm.
   `world.js:213` lerps it toward NIGHT_TINT (blue) at night and DAWN_TINT (orange) at dawn.
3. **Hard-coded Mossmere fallbacks.** Copies of the Mossmere palette sit in `world.js:14`,
   `world-art.js:34`, `water.js:61-65,133-134`, `render.js:49,82`, `render-grade.js:17`,
   `fishing-fx.js:404,580`, `fishing.js:1385,1419`, `ui.css:16`, `ui-hud.js:667-669` and
   `ui-screens.js:275,918`. They are only visible for a frame or two, or when data is missing,
   but they must change together with ZONES or old mint will show through on boot and title.
4. **Per-theme material kit (`world-art.js:16` KIT.mossmere).** Rock, moss and organic vertex
   colours for islands, cliffs, roots, reeds and moss beards are all green-teal.
5. **Content colours in every lake.** Species models, enemy eye colours, Old Murk (a mossy toad
   with a green lamp), the depth-band "shallow" teal, the "uncommon"/"Fine" teal and the vortex
   weapon. These carry mint/teal into the other lakes too.

Phase moods (`world.js:44`) are already off-green: COLD `0x0a1430`, NIGHT_TINT `0x1a2c5c`
(blue), WARM `0xffc49a`, DAWN_TINT `0xff9a5a` (amber). Night therefore reads blue and dawn
amber in every lake. Only the calm base look of the Mossmere (and, from the same palette, its
dusk) is green.

By area, the measured Mossmere green (section 11) is mostly **teal from fog, water and the grade
tint** (channels 1 and 2), about 50 of the roughly 55 points. The mint/lime glows, moss kit and
Murk are the bright accents on top (4–9 points of true green).

## 1. data.js (single source of truth; change here first)

### ZONES palettes and grades
| line | key | value | band | what it colours |
|---|---|---|---|---|
| 354 | mossmere.fog | `0x1a3436` | T | scene FogExp2 colour → `world.js:181-183` (night/dawn mixes), water sky/fresnel (`uSky`), mist, ring mist, dome mid |
| 354 | mossmere.water | `0x1f3d3b` | T | water shallow base (`world.js:235` → `water.setPalette.shallow`) |
| 354 | mossmere.waterDeep | `0x081719` | T | water deep base, hemisphere ground colour, gate vortex deep |
| 354 | mossmere.foam | `0xbfe3d4` | G (pale mint) | water foam lines and pool lines, shore foam, gate spiral foam |
| 355 | mossmere.glow | `0x6ff5c8` | **G (mint), the brightest source** | prop glows (lamps, orbs, buoys, candles), the two accent point lights and the water lights, ring "lit windows" (G channel of `world-paint.js`), dome worm-glow, motes, dock halos, gate (glyphs/vortex/column/spiral/flash), water caustics and pool glow (`uGlow`), feeding-spot motes, UI `--zone-glow` |
| 355 | mossmere.accent | `0xd6f59a` | G (lime) | mote colour B, lily glow-buds (`world-art.js:744`), crystal/cap tips |
| 355 | mossmere.ambient | `0x3d6662` | T | hemisphere sky colour (`world.js:198`) |
| 355 | mossmere.ink | `0x050c0d` | T (near-black) | ring/dome ink, near silhouettes |
| 355 | mossmere.far | `0x5a9488` | T | rim-light colour of every rock/cliff/hero (`world-art.js:67,134,226,670`), far ring luminance, dome horizon |
| 355 | mossmere.light | `0xcff7e6` | G (pale mint) | directional light, light shafts, ceiling crack, rim mix, statue eyes, mote colour A mix |
| 356 | mossmere.grade.tint | `0x2e6b63` | **T, applied to all shadows** | split-tone shadows, ink lift, vignette (channel 2 above) |
| 389-391 | sporewood | fog `0x2b1b30`, water `0x2a1a2e`, glow `0xffb46a`, accent `0xff7fb0`, ambient `0x5b3f63`, far `0x80588a`, light `0xffd9c4`, tint `0x6b3a6e` | plum/amber/pink | no green |
| 423-425 | glasswater | fog `0x131a3c`, water `0x131c3e`, foam `0xc9e8ff`, **glow `0x5ff2ff` (h185, inside TEAL)**, accent `0xb48cff`, ambient `0x2f3a78`, far `0x5062b0`, light `0xd8e8ff`, tint `0x2a3a8a` | indigo/cyan | its glow is aqua, not ice-blue: it counts as teal and reads green-cyan next to the mint |
| 454-456 | paleabyss | fog `0x1c1b18`, glow `0xe8c66a`, accent `0xeae4d3`, far `0xa8a18c`, light `0xf0dca0`, tint `0x5a4e2a` | bone/gold | no green |

### SPECIES models (fish bodies on the hook and in spots, and the UI fish art)
| line | species (zone) | colours | band |
|---|---|---|---|
| 516 | dusk_minnow (mossmere, common) | body `0x6f8f86`, belly `0xd9e8dc`, fin `0x34544f` | T |
| 521 | mossback_perch (mossmere, common) | body `0x4f6b4a`, belly `0xc9d6a8`, fin `0x8a9f5a` | G |
| 531 | weeping_carp (mossmere, uncommon) | body `0x5d6e66`, fin `0x3a4a45` | G/T (greyed) |
| 541 | reedjaw_pike (mossmere, rare) | body `0x3e5a4c`, belly `0xc4d1b0`, fin `0x253a30` | G |
| 546 | gloam_eel (mossmere, rare) | body `0x14302c`, belly `0x5fa392`, fin `0x0b1c1a`, **glow `0x6ff5c8`** | T + mint glow |
| 562 | belled_matriarch (mossmere legendary) | body `0x4a5e4f`, fin `0x6e8a5c`, **glow `0x9ff0c0`** | G + mint glow |
| 626 | prism_minnow (glasswater) | fin/glow `0x5ff2ff` | T (aqua) |
| 652 | shardspine_eel (glasswater) | fin/glow `0x5ff2ff` | T (aqua) |
| 674 | glass_sovereign (glasswater legendary) | fin/glow `0x5ff2ff` | T (aqua) |

### ENEMIES (eye colours are the main readable feature of the ink swarm)
| line | enemy | colour | band |
|---|---|---|---|
| 912 | inkmite eyeColor | `0xd6f59a` | G (lime) |
| 913 | inkmite.variants.glasswater (Shard Mite) eye | `0x5ff2ff` | T |
| 918 | duskmantle eyeColor | `0x9fe8ff` | T/cyan (h194) |
| 925 | creelsnatch eyeColor | `0xd6f59a` | G (lime) |
| 926 | creelsnatch.variants.glasswater (Prism Eel) eye | `0x5ff2ff` | T |
| 961 | drowned_hand.variants.glasswater eye | `0x5ff2ff` | T |
| 976 | the_wickeater (Mossmere Warden) tint `0x050c0d`, eyeColor `0x6ff5c8` | T + mint ("teal-lit maw" in its desc and in DESIGN §19) |
| 997 | the_shard_abbot eyeColor | `0x5ff2ff` | T |

### Gameplay readability colours (must stay legible)
| line | constant | value | note |
|---|---|---|---|
| 1315 | QUALITY.fine.color | `0x9fe8d8` | **T.** Fine catch quality (UI `.gw-q--fine` in `ui.css:77`) |
| 1331 | RARITY_COLORS | common `0xd8d2c0`, **uncommon `0x9fe8d8` (T)**, rare `0xb48cff`, epic `0xff8fc0`, legendary `0xe8c66a` | uncommon teal shows on cards, boons and fish (`ui.js:66`) |
| 1214/1220/1226 | CHARACTERS[].look | flame `0xffb347` / `0xffd27a` / `0xfff0a8`, cloaks `0x4a2e24`/`0x34404a`/`0x5a3a1e` | the warm lantern |
| 1352 | TIPS merchant text | "Sail to his green lamp." | text: update it if Murk's lamp changes colour (DESIGN.md §19.1, §21.2 edge markers and §21.5 tips say "green lamp" too) |

## 2. World (world.js, world-art.js, world-paint.js, world-fx.js)

| file:line | literal / source | band | what it colours |
|---|---|---|---|
| world.js:14 | FALLBACK_ZONE.palette (copy of the Mossmere palette) | G/T | used when `ZONES` is missing; keep in sync with data |
| world.js:23 | HemisphereLight `0x8fb8c0` / ground `0x0a1012` | T | initial value only; overwritten each frame by `applyAtmosphere` |
| world.js:24 | DirectionalLight `0xcff7e6` | G | initial value only; overwritten from `zc.light` |
| world.js:44 | COLD `0x0a1430`, WARM `0xffc49a`, NIGHT_TINT `0x1a2c5c`, DAWN_TINT `0xff9a5a` | blue/amber | phase mood: night fog/light/grade, dawn warmth |
| world.js:181-183 | fog = zone.fog lerp night (×0.3 → COLD) / dawn (→ WARM) | from palette | scene fog |
| world.js:198 / 201 | hemi = ambient + light, dir = light (+WARM/COLD) | from palette | scene lighting colour |
| world.js:213 | grade tint fallback `0x2e6b63` | T | used when the zone has no grade.tint |
| world.js:232-237 | sendPalette → water deep/shallow/foam/glow/fogColor | from palette | water colours |
| world.js:275 | MERCHANT_LAMP `0x9fe08a` | **G** | Murk's lamp as a water light (reflection pool on the water) |
| world.js:318 | dock halos = `zc.glow` × 0.8 / 1.6 | from palette (mint) | dock buoy halos; brighter where Murk is moored |
| world.js:405 | gate-open flash = `zc.glow` | from palette | screen flash when the gate opens |
| world-art.js:16 | KIT.mossmere rock `0x182222`, rockHi `0x2a3835`, moss `0x2b4a35`, mossHi `0x4d7650`, stone `0x3b4845`, iron `0x121616`, bone `0x8f9a86`, organic `0x2f4a33` (wood `0x2e241b`/`0x4a3a2a` is brown) | **G/T** | vertex colours of islands, cliffs, columns, roots, reeds, moss beards, lily pads |
| world-art.js:17-19 | KIT.sporewood / glasswater / paleabyss | plum / indigo / bone | no green |
| world-art.js:34 | default `pal` (copy of the Mossmere palette) | G/T | fallback; keep in sync |
| world-art.js:67 | rimC = mix(far, light, 0.45) | from palette | rim light on rock and organic materials |
| world-art.js:134, 226, 670 | rimColor: pal.far (cliffs, ring rocks, heroes); 226 fallback rock `0x1b2626` (T) | from palette | rim light |
| world-art.js:313-315 | lamp(): head glow `PL.glow` ×2.4 + accent-light anchor | palette glow | island lamps (mint in the Mossmere) |
| world-art.js:377-406 | mushroom gills/cap spots/pods/crystals `PL.glow`/`PL.accent` | palette | Sporewood/Glasswater props |
| world-art.js:421, 438, 442-444 | obelisk runes `PL.glow`; statue eyes `PL.light`; statue orb `PL.glow` + anchor | palette | statues (the Mossmere has three statue pillars) |
| world-art.js:472, 481 | coral tips, candle flames `PL.glow` | palette | Pallid Deep props |
| world-art.js:502, 522, 541, 553 | island/stalk/shelf anchors and glow discs `pal.glow` | palette | accent lights and water lights |
| world-art.js:698-699 | buoy rim `pal.light`, buoy glow `pal.glow` | palette | lantern buoys and docks (all lakes) |
| world-art.js:741-744 | lily pad rim `pal.far`, flower buds `pal.accent` ×2.4 | palette (lime) | lily pads in the Mossmere shallows |
| world-art.js:776-779 | candle rim `pal.light`, flame `pal.glow` ×3 | palette | candles |
| world-art.js:825-843 | gate glyphs, vortex uGlow/uFoam/uDeep, column, spiral, gate anchor = `pal.glow`/`pal.foam` | palette (mint) | Descent Gate (Moss Sluice) |
| world-art.js:910-911 | PCFG.mossmere motes: A = mix(light, glow, 0.3), B = accent; 80 big motes glow/accent | palette (mint/lime) | about 460 drifting motes over the Mossmere |
| world-art.js:914-923 | other lakes' particle configs; 923 Pallid embers B `0xffd890` | palette/amber | |
| world-art.js:941 | mood base: cold `0x0a1430`, warm `0xffc49a`, mistWarm `0xc08a6a` | blue/amber | ring/dome/shaft night and dawn mixing |
| world-art.js:945-978 | applyMood: rings uColor/uMist/uRim from ink→far, ring uGlow = glow, dome horizon/mid/zenith from far/fog/ink, dome uWorm = glow, crack/shafts = light, mist/sheets = fog+far, foam = pal.foam | palette | all atmosphere shaders |
| world-paint.js:24-25 | INK `#ff0000` / GLOW `#00ff00` | (mask channels, not colours) | R = silhouette, G = glow mask; the glow is tinted by ring `uGlow` = zone glow (windows, lanterns, crystal tips) |
| world-fx.js:46 | outlineMat default `0x07080d` | ink | outlines |
| world-fx.js:65-94, 171-218, 315-534 | ring, particle, shaft, mist, vortex, column, spiral and sheet shaders | uniforms only | no hard-coded hue; all fed by world-art |

## 3. Water (water.js, water-shader.js)
| file:line | literal | band | what it colours |
|---|---|---|---|
| water.js:61-65 | uniform defaults uDeep `0x081719`, uShallow `0x1f3d3b`, uFoam `0xbfe3d4`, uGlow `0x6ff5c8`, uSky `0x1a3436` | G/T | boot values before `applyZonePalette` |
| water.js:133-134 | palTgt defaults (same Mossmere copy) | G/T | easing targets before the first palette |
| water.js:359 | ripple colour default `0xffc070` | amber | ripples |
| water.js:571-576 | applyZonePalette(zone): deep/shallow/foam/glow from ZONES | palette | |
| water-shader.js:279-293 | base = mix(uDeep, uShallow); fresnel and strokes mix toward uSky (= fog) | palette | the large teal plane that fills most of every Mossmere frame |
| water-shader.js:347 | caustics `uGlow * caus` | palette glow | faint mint caustics in the shallows |
| water-shader.js:364 | light-pool glow `uGlow` (+ pool colour from lights) | palette glow | glow around the lantern pool and accent lights |
| water-shader.js:369-372 | foam lines `uFoam` | palette foam | |

## 4. Render and grade (render.js, render-grade.js)
| file:line | literal | band | what it colours |
|---|---|---|---|
| render.js:49 | GRADE_DEFAULT.tint `0x2e6b63`, warm `0xffc58c` | **T** / amber | grade defaults before any zone (title boot) |
| render.js:82 | initial fog `0x1a3436` (z0?.fog fallback) | T | first frame |
| render.js:596-604 | applyZoneDefaults → fog colour/density and setGrade(z.grade) | palette | |
| render-grade.js:17 | uTint default `0x2e6b63` | T | shader default |
| render-grade.js:19 | uWarm `0xffc48a` | amber | highlight split-tone |
| render-grade.js:26 | uFlashColor `0xffffff` | | flashes |
| render-grade.js:29 | uDangerColor `0x5a0a14` | red | low-HP crimson edge, a readability colour |
| render-grade.js:83-90 | shadows → `l*tintN` (tintAmount×1.6), ink lift `+uTint*lift`, vignette `+uTint` | tint | why the Mossmere tint colours the whole frame |

## 5. Actors (actors*.js)
| file:line | literal | band | what it colours |
|---|---|---|---|
| actors-merchant.js:25 | barge awning/hull canvas gradient `#4f7a3e` → `#355a2c` → `#22401f` | **G** | Murk's barge texture |
| actors-merchant.js:27, 29 | stroke `rgba(160,200,120,.35)`, mottling `rgba(20,30,15,.25)` | G | barge texture detail |
| actors-merchant.js:39 | barge rim planks `0x2a4a24` | G | barge |
| actors-merchant.js:56 | Murk skin `0x4d5a3f`, belly `0x8f8a5e`, moss `0x5f7d36`, lichen `0xb9c79a` | **G** | Old Murk's toad body (DESIGN §19 specifies #4d5a3f/#b9c79a) |
| actors-merchant.js:77, 79 | mouth `0x0b0d08`, lip `0x5a6448` | G (dark) | face |
| actors-merchant.js:131 | pack jars `0x3a5a3a` | G | jars on his pack |
| actors-merchant.js:156-158 | lamp glow, halo sprite and PointLight `0x8fd47a` | **G** | Murk's lamp: the only green light by design (DESIGN §19.1). The UI marker `ui.css:447` and portrait `ui-icons.js:180-197` follow it |
| actors-raft.js:28-57, 95-109, 155-186 | woods `0x2b1e14`…`0x41301f`, rope `0x8c7552`, awning `0x6e4e3a` | brown | raft |
| actors-raft.js:75-79 | lantern glass `0xffa040`, flame/halo `0xffa64a`, PointLight `0xffb05a` | amber | **the one warm light** |
| actors-raft.js:87-90, 166-167, 191 | brazier coals `0xff5a20`, flame `0xff7a30`, side lantern `0xffb860`/`0xffa64a`, bulbs `0xffc36a` | amber | raft lights |
| actors-raft.js:111 | creel fish-tail `0x8aa098` | G (grey) | tiny prop |
| actors-raft.js:127 | flag cloth `0x6e2020` | red | flag |
| actors.js:23, 36, 73-80 | LANTERN_WARM `0xffa94d`, bobber ring `0xffc27a`, light pool `0xff8a3a`/`0xffe2b0` | amber | lantern light pool on the water |
| actors.js:432-468 | rod tip `0xffb066`/`0xff4a30`/`0xffc070`, bite ring `0xff5a3a` | amber/red | fishing tells (readability) |
| actors-wick.js:21 | DEFAULT_LOOK flame/eyes `0xffb347`, cloak `0x4a2e24`, wax `0xe9dfc6` | amber | the Wick |
| actors-wick.js:271 | flame RED `0xff5a2a`, BLUE `0x9fd8ff`, CORE `0xfff2c8` | | flame states (hurt / low oil) |
| actors-fx.js:42-51, 107, 143, 188 | flame `0xffb347`/`0xfff3d0`, pool `0xff9f45`/`0xffc477`, bobber `0xc8402c`/`0xe8dcc0` | amber/red | flames, light pool, bobber |

## 6. Models (models*.js, toon.js)
| file:line | literal | band | what it colours |
|---|---|---|---|
| models-creatures.js:12 | GLOOM_RIM `0x8a76bd` | violet | swarm rim light (keeps enemies apart from the water) |
| models-creatures.js:15, 17 | KIND_DEFAULTS mite/eel eye `0xd6f59a` | **G (lime)** | default eye colour when data has none |
| models-creatures.js:16 | moth eye `0x9fe8ff` | T/cyan | |
| models-creatures.js:19 | warden tint `0x050c0d`, eye `0x6ff5c8` | **T + mint** | Warden default |
| models-fish.js:588 | DEFAULT_MODEL body `0x6f8f86`, belly `0xd9e8dc`, fin `0x34544f` | T | fallback fish |
| models-fish.js:604, 694 | glow fallbacks `0xffd9a0`, bone `0xeae4d3` | warm | |
| models.js:62, 131 | smoke `0x101018`, puff `0xffc070`/`0x14121c` | | |
| toon.js:7-8 | INK `0x07080d`, PALE `0xe8f1f2` | neutral | outlines, bone-white highlight |
| toon.js:141 | glowSprite default `0x9fe8ff` | T/cyan | used when a caller omits the colour |
| toon.js:153 | glowMaterial default `0x9fe8ff` | T/cyan | same |

## 7. Fishing (fishing.js, fishing-fx.js)
| file:line | literal | band | what it colours |
|---|---|---|---|
| fishing-fx.js:19 | COL.shallow `0x9fe8d8` | **T** | depth band "shallow" reticle ring and label (DESIGN §6: "shallow pale teal"); mid `0xffc27a`, deep `0xb48cff`, deepRim `0xe8c66a` |
| fishing-fx.js:20-22 | rareA `0xb48cff`, rareB `0xffd98a`, legend `0xffd27a`/`0xfff0c0`, blocked `0xff7a6a`, anchor `0x8d9aa0`, bone `0xe9e2cf` | | spot / legend / blocked readability |
| fishing-fx.js:404 | spot uColA default `0x6ff5c8` | **G** | feeding-spot mote columns; set per zone to palette.glow (mint in the Mossmere) |
| fishing-fx.js:472 | spot fish-silhouette rim `0x9fd8c8` | **T** | rim on the shadow fish inside feeding spots (all lakes) |
| fishing-fx.js:580 | setZoneColor fallback `0x6ff5c8` | G | |
| fishing.js:414 | spot pulse `0x9fe8d8` (rare `0xffd98a`) | **T** | pulse ring when the bobber lands in a spot |
| fishing.js:589 | Belled Matriarch surge-bell pulse `0x9ff0c0` | **G** | legendary tell |
| fishing.js:592 | Glass Sovereign surge pulse `0x5ff2ff` | T | legendary tell |
| fishing.js:1124 | cast arc colour by depth key; default (shallow) `0x9fe8d8` | **T** | cast arc |
| fishing.js:1385, 1419 | `fx.setZoneColor(palette.glow ?? 0x6ff5c8)` | G fallback | spots follow the zone glow |

## 8. Combat (combat*.js)
| file:line | literal | band | what it colours |
|---|---|---|---|
| combat.js:36-38 | zap `0xfff1cf`/`0xffc870`, flare `0xffd9a0`/`0xfff4dc`/`0xffb860`, burn `0xffa040`, grip/gold `0xe8c66a` | amber/gold | lantern zap and flare |
| combat.js:310 | recovered-fish burst `0x9fe8d8` | T | stolen fish recovered |
| combat.js:368 | immune-hit burst `0x9fe8ff` | T/cyan | "no effect" sparkle |
| combat-enemies.js:18-21 | ember `0xffa040`, pale `0xe9e2cf`, gold `0xe8c66a`, spore `0xffb46a`/`0x6b3a5e`, glass `0xc9e8ff`, oil `0xffb347`, **fishGlow `0x9fe8d8` (T)** | | fishGlow is the dropped stolen fish (ring and glow, `combat-enemies.js:784-785`) |
| combat-enemies.js:123 | eye fallback `0xe8f1f2` | pale | |
| combat-levels.js:10-13 | Cinders small `0xff9a3a`, bright `0xffd36a`, great `0xfff0c0`, oil `0xffb347` | amber | **Cinder XP glow (readability)** |
| combat-warden.js:10-12 | pale, amber `0xffb04a`, **glass `0x9fe8ff`, glassDim `0x5ff2ff` (T)**, gold `0xe8c66a`, spore `0xffb46a` | | Shard Abbot shards and mirror decoys (Glasswater) |
| combat-weapons.js:10-16 | coal `0xff8a2a`…, spark `0xbfe4ff`/`0x8fc8ff`, frost `0xcfe8ff`, **vortex `0x6ff5e0`, vortexHot `0xb8fff0` (T)**, beam `0xfff2d0` | | vortex = Little Maelstrom weapon spiral, dash ring, sparks (`combat-weapons.js:562-572`) |
| combat-fx.js:122, 543 | shader warm `vec3(1.0,0.45,0.2)`, INK_SMOKE `0x0b0a12` | | |

## 9. Survival (survival.js, survival-fx.js)
| file:line | literal | band | what it colours |
|---|---|---|---|
| survival.js:51-52 | WARM `0xffb347`, HURT `0xff6a3d`, WARD `0xcfe6ff`, MEND `0xffd9a0`, GOLD `0xffd27a`, GUTTER `0x9fd8ff`, WAX `0xe9dfc6` | | survival VFX rings and motes; no green |
| survival-fx.js:99, 113, 168 | ring and mote default `0xffb347` | amber | |

## 10. UI (do not edit; produce tokens instead). Green/teal sources the UI author will need to swap
| file:line | literal | what it colours |
|---|---|---|
| ui.css:16 | `--zone-glow: #6ff5c8` (overwritten at runtime from palette.glow, `ui-hud.js:667-669`) | day-arc calm segment (`ui.css:298`), gate marker (`:448`), zone accents |
| ui.css:73 | `.gw-chip.gw-pos` `#d3f0de`, border `rgba(160,230,190,.32)` | positive stat chips |
| ui.css:77 | `.gw-q--fine` `#a8eedd`, border `rgba(159,232,216,.5)` | Fine quality badge (QUALITY.fine) |
| ui.css:128 | panel radial `rgba(70,96,96,.18)` | panel/modal background haze |
| ui.css:209, 680 | lore toast title, shop kicker `#b9e6c8` | lore text accents |
| ui.css:214 | `.gw-banner` glow `rgba(140,230,215,…)` | banner title halo |
| ui.css:447 | `.gw-mk-merchant` `#a6ffbe` / `rgba(120,255,160,.4)` | Murk edge marker (green lamp) |
| ui.css:448 | `.gw-mk-gate` glow `rgba(140,240,220,.45)` | gate edge marker |
| ui.css:452 | `.gw-mk-spot` `#c6f2ff` | spot marker (cyan) |
| ui.css:471 | `.gw-charge-depth[data-depth=shallow]` `#a6efdf` | shallow depth label |
| ui.css:499 | `.gw-reel-shard` `#6fe8ff` | Glass Sovereign reel shards |
| ui.css:533 | `.gw-logotype` glow `rgba(140,230,215,…)` ×2 | title logotype halo |
| ui.css:814-817 | zone card `--zc`/`--zf` | zone cards (palette glow and fog) |
| ui-hud.js:667-669 | `--zone-glow`/`--zone-accent` fallbacks `#6ff5c8`/`#d6f59a` | |
| ui-screens.js:275, 918 | `--zc` fallback `#6ff5c8`, `--zf` `#1a3436`, accent `#d6f59a` | waystones, zone cards |
| ui-icons.js:180-197 | Murk portrait: lamp gradient `#b8ff9a`/`#5fd38a`, flame `#c8ffb0`, body `#1c2419`/`#232c1f`/`#0d0f0c`, strokes `rgba(160,190,140)`, `rgba(190,230,170)` | shop and merchant portrait |
| ui-fishart.js:512 | fish art fallback body `#5f716c`, fin `#34433f` | journal/catch art fallback (otherwise uses SPECIES model colours) |
| ui.js:66 | rarity → CSS from `RARITY_COLORS` (uncommon teal) | |
| template.html:21, 23 | loader background `#0d1a1e`, loader title glow `rgba(160,230,220,…)` | boot screen |

Non-green UI tokens (`ui.css:6-15`): `--bone #e9e2cf`, `--ink #06080c`, `--amber #ffb347`,
`--amber-hi #ffd98a`, `--ember #ff8a3d`, `--blood #e0533d`. These already match the warm-lantern
direction.

## 11. Baseline measurements (tools/out/palette-baseline, build 41b9c39, 960×540, quality high)

The numbers are `tools/hue-report.mjs` green+teal shares (% of chromatic weight, s>0.10, v>0.06,
weight s×v). "UI" is the frame as the player sees it with the HUD. "World" is the same frame with
`PALETTE_HIDE_UI=1`.

| frame | UI g+t | world g+t | notes |
|---|---|---|---|
| p01-title | 63.2 | 47.8 | Mossmere title vista; the title text covers part of the teal |
| p02-mossmere-calm | 54.8 | 58.8 | almost all teal (51–55); green only 3.7 |
| p10-fishing-aim | 57.9 | 60.7 | |
| p11-fishing-reel | 44.0 | 40.0 | the lantern pool fills more of the close-up frame (orange 49–54) |
| p12-murk-moored | 61.5 | 63.5 | Murk's barge, body and lamp add about 4–5 points of *green* (green 7.9–9.0 vs 3.7 in p02) |
| p06-mossmere-gloomtide | 1.3 | 2.0 | the night is already blue (blue 69–71) |
| p07-mossmere-flare | 0.2 | 0.3 | amber white-out |
| p03-sporewood-calm | 0.1 | 0.0 | red/orange/magenta |
| p13-sporewood-dusk | 0.2 | 0.0 | violet/magenta |
| p04-glasswater-calm | 2.1 | 2.5 | blue 68; the aqua glow `0x5ff2ff` shows up as teal 2–2.5 + cyan 5.6–7.1 |
| p08-glasswater-gloomtide / p09 flare | 0.8 / 0.3 | 0.1 / 0.0 | |
| p05-paleabyss-calm | 0.9 | 0.7 | orange/yellow (bone-gold) |
| **all 13, pooled** | **19.6** | **20.8** | mean per image 22.1 (UI) / 21.3 (world) |
| **Mossmere day frames (p01, p02, p10, p11, p12), pooled** | **55.0** | **53.9** | green 5.8 + teal 49.2 (UI) |
| **other lakes and nights (p03–p06, p08, p13), pooled** | **1.1** | **1.2** | |

What this says:
- The complaint is entirely the Mossmere in daylight (calm; Mossmere dusk was not shot). There, about 55 % of all
  colour is teal (hue 160–195: fog `0x1a3436` h184, water `0x1f3d3b` h176, grade tint `0x2e6b63`
  h172, far `0x5a9488` h168). The bright mint/lime (glow `0x6ff5c8` h160, accent `0xd6f59a` h80,
  KIT moss) adds 4–9 points of true green. Almost everything else in those frames is the
  lantern's orange (30–50 %).
- Nights, flares and the other three lakes are already free of green. The Gloomtide grade (blue
  NIGHT_TINT) and the warm lantern do their job and need no change for this complaint.
- Glasswater's aqua glow is the next-largest teal source (2–7 % teal+cyan). Once the Mossmere
  moves off teal, it will be the main aqua left in the game. Moving it to h≥200 (for example
  `0x6cc8ff`…`0x8ab8ff`) would keep the lakes apart and make it read as ice instead of mint.
- Content teal that appears in every lake: uncommon/Fine `0x9fe8d8`, the shallow depth band
  `0x9fe8d8`, the spot silhouette rim `0x9fd8c8`, the vortex `0x6ff5e0`, Murk's green and the
  UI glows. Each covers few pixels, but they are bright, saturated and in the HUD focus areas.

## 12. Resolution: the "Moonlit slate" pass (branch `gw-palette`)

Every entry above was revisited; the palette rule is now in DESIGN §19.1 (green/teal only as rare
trace accents). Where each channel ended up:

1. **Zone palette:** Mossmere fog `0x262f40`, water `0x232b3a`, waterDeep `0x080b12`, foam
   `0xd6deee`, glow `0xa9b9f0` (periwinkle moon-silver), accent `0xc4b8ec` (lilac-silver), new
   optional `lamp` `0xc8d2f0` (island lamps, buoys, statue orbs, lit ring windows, dock halos; other
   lakes fall back to `glow`), ambient `0x46526a`, far `0x8292b4`, light `0xdae2f4`. Glasswater glow
   `0x5cbcff` (hue 205, ice not aqua). Sporewood and Pallid Deep unchanged.
2. **Grade:** Mossmere tint `0x4c5278` ×0.18, saturation 0.9, exposure 1.02. Night keeps a fifth of
   each lake's tint (`world.js sendGrade`: lerp to NIGHT_TINT by 0.8·night). The grade keeps its
   cold shadow tint off clearly warm pixels (`render-grade.js` warmPx), so the lantern pool does not
   muddy to rose. Dawn tints shadows only 20% toward DAWN_TINT (no extra tintAmount) and warms the highlights instead
   (warmAmount +0.16), so dawn is warm light over cool water rather than orange mud in every lake.
3. **Fallback copies:** `world.js`, `world-art.js`, `water.js`, `render.js`, `render-grade.js`,
   `fishing-fx.js`, `fishing.js` all carry the new Mossmere values. (UI fallbacks are for the UI
   author: see DESIGN §21.1 colour tokens.)
4. **KIT.mossmere:** slate rock, pewter stone, grey/dun lichen (moss `0x3a3836`, mossHi
   `0x67625a`, organic `0x3c3a38`).
5. **Content:** Mossmere and Glasswater fish off mint/aqua; inkmite/creelsnatch eyes pale cold rose
   `0xf2b6c8`; duskmantle `0xb8ccff`; Wickeater `0xdbe2ff`; uncommon/Fine pale moonstone `0xa6c6e6` (apart from Glasswater's ice-blue); shallow band
   and cast arc `0xa8c8f0`; spot pulse and recovered fish lilac-moon `0xd0c8f4`; Mossmere motes
   silver-grey (big motes periwinkle/lilac); vortex `0x9aa6ff`/`0xdcdfff`; PALE `0xecf0f6`;
   toon glow defaults `0xc6d2f0`; Wick guttering flame `0xa2c8ff`. Old Murk is an umber toad
   (`0x575047`, rust-moss `0x7a5838`, ochre `0xa87e40`, lichen `0xc8bca2`) on a withered bronze pad;
   his sage lamp `0xa6d4a0` is the one deliberate green trace, and its water reflection is a short
   dim pinpoint (streak 0.45, intensity 1.5).
6. **Water shader and lantern pool:** the lantern's light-pool decal fill leans gold (`actors.js`, lerp
   to `0xffc46a`); warm lights lean gold on the water; inside a light pool the cold base drains to
   warm grey (poolK ×20, cap 0.92); mist strokes and crests carry a silver sheen lifted toward foam.
7. **UI (merge branch `gw-merge-palette`):** `ui.css` defines every DESIGN §21.1 token on `.gw-ui`
   and the Fine badge, positive chips, lore toast title, shop kicker, banner/logotype glows, panel
   haze, gate/spot/merchant markers, depth labels and reel shards read them; `ui-hud.onZone` sets
   `--zone-glow/-accent/-fog/-lamp` (and the per-lake gate marker) with Moonlit slate fallbacks;
   `ui-screens` waystone/zone-card fallbacks, `ui-icons` Murk portrait (umber body, sage lamp),
   `ui-fishart` fallback colours and the `template.html` loader moved too. The only greens left in
   the UI are the merchant marker and the portrait's lamp/flame.

## 13. The "Starlit" pass (branch `gw-starlit`, from the user's colour reference)

The user's reference (four screenshots: indigo-violet starry sky over ruins, lavender mist, a pink
nebula, candle amber, autumn gold, pale stone, reflective water; mood only) replaces Moonlit slate.
Reference palette: night ink #0A0C19, deep indigo #1D245D, violet dusk #433E74, lavender mist
#7E81B4, nebula pink #D296AE, candle amber #ED9E3B, pale gold #E8BE77, autumn ochre #B8893A, pale
stone #D6D6E4. Every value moved through the §12 sources; DESIGN §19.2 holds the full table.

1. **Zone palette:** new signatures per lake (Mossmere "starlit moat", Sporewood "ember garden",
   Glasswater "sapphire orrery", Pallid Deep "candle requiem"); new optional keys `candle` (warm
   pinpoints on stone: ring windows, landmark windows/braziers, lamp heads, statue orbs, candles on
   ruins; falls back to `lamp`), `nebula` (vault nebula, its haze on the far rings and its water
   reflection) and `stars` (starlight brightness/density). `lamp` now means cold lamps ON THE WATER
   only (buoys, dock halos). `validate-data` rejects any palette colour in hue 65–195°.
2. **Grade and moods:** lake tints moved to indigo / violet-magenta / sapphire / violet-black;
   NIGHT_TINT #1e2466, COLD #0b0d2e, WARM #f2cfa4, DAWN_TINT #b898c0 (rose-lavender), new DAWN_MIST
   #9a92c8; the grade's warm split-tone colour is sent by world (#f4cc96, #f0c8a8 at dawn) and its
   base amount drops to 0.07 (stars, foam and pale stone stay cool-white).
3. **Fallback copies:** world.js, world-art.js, water.js, render.js, render-grade.js, fishing-fx.js,
   fishing.js and models-creatures.js (Warden tint) carry the Starlit Mossmere values.
4. **KIT:** indigo-slate rock, violet-grey lichen, pale stone (#8a8ca8) in the Mossmere with dun-ochre
   reeds and lily pads; Sporewood caps autumn ochre (#5e3c1e → #b8893a) on pale stalks; Glasswater
   sapphire; the Pallid Deep bone stone with a violet cast.
5. **Starlight** (`src/starlight-glsl.js`): the vault dome and the water share the star/nebula GLSL;
   ring materials take a nebula haze uniform. No new draw calls.
6. **Lantern ring removed:** `actors-fx.js` light pool (uRing/uRadius, notches, lip, stepped spill,
   concentric ripple lines gone) and the water shader's reach-ring term; world/water no longer send
   `ring`. The bobber's idle ripple ring is pale gold-stone (#ead6a8).
7. **UI (not touched here; the UI lead owns `ui.css`, `ui*.js`, `template.html`):** the runtime
   `--zone-glow/-accent/-fog/-lamp` tokens follow the new palettes automatically; the DESIGN §21.1
   fallback values named the Moonlit slate Mossmere; since the integration merge §21.1 lists the
   v2 interface's lavender fallbacks (#9fa2d8 / #b9b0e6 / #1d245d / #c9c7ee) from `ui.css`.
8. **Round 4 (distinct lakes, readable nights, the flare):** the Mossmere moved to violet dusk (fog
   #3a3070, water #2e2664, tint #40347e, hue ≈ 248°) and Glasswater to cobalt sapphire (fog #172a7c,
   water #10226e, tint #203ca8, hue ≈ 228°), so the two blue lakes no longer share a hue; the Pallid
   Deep's fog/water/ambient lifted a step (#2c2448 / #1e183c / #463e6c). Night keeps each lake's own
   hue (fog ×0.38 with 22% of COLD, grade tint 35% to NIGHT_TINT, tintAmount → 0.28, water ×0.66) and
   thins the water's stars (brightness ×(1 − 0.32n), density ×(1 − 0.38n)); the reflected stars stay
   round (chop nudge 0.035). The flare has no full-screen flash (a local pale-gold GLOW decal instead),
   light flashes mix in sqrt space in the grade, survival's event rings are pale gold #f0d49c, and the
   orbit weapon's persistent dashed ring and combat's "cinder line" fallback ring are gone.
9. **Round 5:** night luminance floors (fog and water linear 0.014, deep 0.002, hue kept: lifts the
   Pallid Deep and Sporewood Gloomtides; the night vignette is capped at 0.58) and a per-lake dawn mist (half #9a92c8, half the lake's `far`).
