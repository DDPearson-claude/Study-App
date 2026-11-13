# Clear Night — the clarity and realism pass (spec for both build lanes)

Status: audit done on `9bc3e35` (branch `gw-clarity`). This document is what LANE A ("air & lens") and LANE B ("light &
surfaces") build from. Numbers marked **target** are to be hit; numbers marked *start* are tuning starts that the lane may
move while it keeps the gate (§4) green and the rules (§9) intact.

The user, today: *"I want you to work heavily on graphics now. I think the colour pallet but it feels too misty. I want the
world to feel more sharp, and slightly more real but keep a fantasy hue of the lavender."* and then *"Can we use ray tracing?"*

Read: the palette is liked. The haze and the softness are the problem. **Clear Night** = clear air (you can see across the
lake; depth comes from tone, light and layering, not from blanket fog), crisp edges (no smear from bloom, fringe, grain, paper,
lifted blacks or low resolution), light and materials that behave a little more like the real thing (cast shadows and contact,
believable falloff, wet stone and wood, water with defined reflections, glints and depth), all of it still lavender: violet
shadows and ambient, a lavender horizon and starlight, amber the one warm light.

## 0. "Can we use ray tracing?" — the honest answer, and what ships

No hardware ray tracing: a browser game on WebGL2 (three.js 0.170 `WebGLRenderer`, GLSL) has no access to it, and a full path
tracer is not real-time. What a ray tracer would buy this game is three things, and each has a real-time equivalent that
gives the same picture where it matters:

| a ray tracer gives | we ship | tier | lane |
|---|---|---|---|
| true mirror reflections in the lake | **planar reflection**: the water is a flat plane, so the scene rendered mirrored about it into a reduced target and sampled with ripple distortion and Fresnel is *exactly* what a ray tracer returns for a mirror (ruins, islands, the raft, the Wick, lanterns, lamps and the star vault really reflected). It replaces the analytic dark bands (`water-shader.js:421–449`) and the painted-on mirrored stars (`:656–677`) | medium, high (low keeps the analytic version) | B |
| shadow rays to the key light | **one shadow map** from the moon / vault key light, received by stone, wood, actors and the water | medium, high | B |
| contact shadows and ambient occlusion | **screen-space ray marching**: short depth-buffer marches toward the lantern and the key light plus AO, one pass. Stretch goal: it ships only if it is clean and stable (§5.6) | high only | A |

## 1. The clarity set and the tools

Fixed frames, re-runnable (`tools/tests/clarity-shots.scenario.mjs`; UI hidden unless noted; the v3 phase-1 game on a Still
night). Static frames are pinned: the page's `requestAnimationFrame` is held, `Math.random` is re-seeded per frame name,
`ctx.time.t` is set to the frame's slot, the look modules are pumped 7 s in 0.05 s steps, the camera is placed from the rig's
settled parameters without its hand-held sway, and the canvas is rendered and read in one task. A re-shoot of the same build
repeats every metric within ±1 % (not to the bit: the film grain runs on the renderer's private clock). c14, c15 and c17 are
live (signs, the ceremony and the swarm run on the game's clocks): same framing and state, not the same pixels. `--flagoff`
shoots the flag-off game; its night frames use v1's night overview camera, so they compare only with a flag-off baseline.

| frame | what | judged for |
|---|---|---|
| `c01`–`c04` mossmere calm / dusk / night / dawn | sail framing from the spawn | the look across the phases |
| `c05-raft-lantern` | 5.7 m off the bow quarter, the Wick's face and lantern, Mossmere night | lantern light, contact, wood, hull-on-water |
| `c06` / `c07` far-ruins calm / night | low over the water, 60–100 m to the Drowned Gatehouse | "you can see across the lake" |
| `c08`–`c13` sporewood / glasswater / paleabyss, calm and night | sail framing | every lake keeps its hue |
| `c14-signs` | five fish signs at the sail framing (v3, live) | signs read at least as well |
| `c15-catch-reveal` | the ceremony's climax, the fish revealed (v3, live) | the payoff shot |
| `c16-hud` | Mossmere calm with the DOM on (page screenshot) | HUD legibility |
| `c17-swarm-overview` | a Lantern night with the swarm up: the night overview camera, 21 enemies round the raft (v3) | enemies and telegraphs read at least as well |
| `m01`–`m03` | Mossmere calm / night / raft close-up at 390×844, quality medium | the phone |

```
node build.mjs --dev --out=tools/out/clarity/dev.html
node tools/playtest.mjs --html=tools/out/clarity/dev.html --shots=tools/out/clarity/after --script=tools/tests/clarity-shots.scenario.mjs --width=960 --height=540 [--perf]
node tools/playtest.mjs --html=tools/out/clarity/dev.html --shots=tools/out/clarity/after --script=tools/tests/clarity-shots.scenario.mjs --mobile [--perf]
node tools/clarity-report.mjs tools/out/clarity/after --baseline=docs/v3/clarity/baseline-metrics.json --gate
node tools/hue-report.mjs tools/out/clarity/after
```

`--only=c03,c06` shoots a subset (≈ 15 s a frame in software GL; the whole desktop set ≈ 5 min, with `--isolate` ≈ 10 min).
`--knobs='{…}'` applies a what-if set to every frame and `--isolate` sweeps the audit's knob sets against one frozen frame
(the knob list is in the scenario's header). Baseline records, committed beside this file: `baseline-metrics.json` (every
metric of the 20 frames), `baseline-iso.json` (the sweep), `baseline-perf.json`, `baseline-frames.json` (fog, exposure, bloom,
grade and camera behind each frame). The baseline PNGs are in `tools/out/clarity/before/` (not committed; re-shoot on
`9bc3e35` to regenerate).

`tools/clarity-report.mjs` metrics (all on the 8-bit sRGB frame; Y′ = Rec.709 luma, 0–255):

- **sharp** — edge sharpness: Laplacian variance of the 3×3-median-filtered Y′ (the median deletes film grain and one-pixel
  specks, so grain cannot fake sharpness; the vault's stars are two pixels and more and still count: `domestars-0` takes 34 %
  of it away, so do not move the stars to move this number). **lapVar** is the raw score.
- **acut** — mean gradient of the strongest 2 % of pixels of the 2×2-averaged frame. **eWidth** — median edge spread in pixels
  (1.0 = a perfect one-pixel step; blur, upscaling, bloom smear and fringe widen it; haze does not).
- **tileRms** — local contrast: mean σ(Y′) over tiles of short side ÷ 15. **farRms** — the same over the top 40 % of the frame.
- **darkCh** — haze: mean dark channel (min of R, G, B over a short side ÷ 36 patch). **hazeR** = darkCh ÷ mean Y′.
- **p1 / p50 / p99**, **stops** — black point, median, white point, dynamic range in stops.
- **noise** — per-pixel noise σ (grain + paper). **speck / speckLo** — % of pixels more than 12 levels over their 3×3 median,
  whole frame / the lower 35 % (open water: the mirrored-star "snow").
- **sat**, **lav** (hue 230–290°), **vio** (210–300°), **gt** (65–195°), **amb** (15–65°) — saturation and hue shares, same
  chromatic test as `tools/hue-report.mjs`.

## 2. Baseline (9bc3e35, quality high at 960×540; phone set at medium, 390×844)

| frame | sharp | acut | eWidth | tileRms | farRms | darkCh | hazeR | p1 | p50 | p99 | stops | noise | speckLo | sat | lav | vio | gt | amb |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| c01-mossmere-calm | 200.6 | 25.61 | 1.75 | 19.42 | 24.23 | 35.5 | 0.566 | 13 | 50 | 190 | 6.83 | 1.76 | 0.99 | 0.567 | 90.9 | 92.6 | 0.14 | 2.9 |
| c02-mossmere-dusk | 170.8 | 22.94 | 1.77 | 17.00 | 20.63 | 24.8 | 0.528 | 6 | 35 | 174 | 7.51 | 1.67 | 1.15 | 0.612 | 91.2 | 92.8 | 0.25 | 2.3 |
| c03-mossmere-night | 161.3 | 21.13 | 1.74 | 15.23 | 17.68 | 15.1 | 0.464 | 2 | 20 | 167 | 8.45 | 1.33 | 0.93 | 0.671 | 88.2 | 89.8 | 0.49 | 3.9 |
| c04-mossmere-dawn | 114.9 | 21.21 | 1.74 | 15.81 | 18.54 | 48.4 | 0.659 | 15 | 70 | 178 | 6.40 | 2.29 | 0.36 | 0.445 | 89.2 | 90.8 | 0.06 | 3.1 |
| c05-raft-lantern | 128.5 | 21.87 | 1.51 | 12.87 | 10.34 | 29.6 | 0.604 | 0 | 36 | 217 | 10.44 | 1.64 | 0.42 | 0.513 | 46.2 | 47.9 | 0.04 | 25.4 |
| c06-far-ruins-calm | 224.6 | 25.71 | 1.67 | 21.58 | 24.45 | 50.8 | 0.636 | 14 | 70 | 205 | 6.96 | 2.07 | 1.52 | 0.500 | 88.7 | 91.6 | 0.25 | 1.9 |
| c07-far-ruins-night | 233.2 | 22.27 | 1.75 | 18.48 | 26.66 | 32.7 | 0.593 | 5 | 40 | 199 | 8.15 | 2.04 | 1.14 | 0.545 | 82.3 | 84.3 | 0.58 | 2.9 |
| c08-sporewood-calm | 232.9 | 29.77 | 1.73 | 22.77 | 31.54 | 27.4 | 0.455 | 7 | 45 | 196 | 7.72 | 1.57 | 0.91 | 0.565 | 59.0 | 67.5 | 0.08 | 10.7 |
| c09-sporewood-night | 126.0 | 21.96 | 1.88 | 15.70 | 20.83 | 16.5 | 0.444 | 2 | 24 | 176 | 8.62 | 1.39 | 0.74 | 0.637 | 67.9 | 74.0 | 0.17 | 6.5 |
| c10-glasswater-calm | 254.8 | 28.22 | 1.71 | 22.47 | 32.00 | 26.0 | 0.413 | 11 | 51 | 206 | 7.33 | 1.39 | 1.50 | 0.703 | 56.0 | 96.7 | 0.22 | 1.5 |
| c11-glasswater-night | 169.6 | 24.30 | 1.75 | 17.08 | 23.07 | 17.4 | 0.423 | 3 | 27 | 197 | 8.63 | 1.36 | 1.17 | 0.742 | 78.2 | 95.7 | 0.20 | 2.5 |
| c12-paleabyss-calm | 238.4 | 29.03 | 1.68 | 18.14 | 28.58 | 23.6 | 0.499 | 3 | 32 | 185 | 8.43 | 1.79 | 0.91 | 0.490 | 78.3 | 80.4 | 0.37 | 8.9 |
| c13-paleabyss-night | 110.2 | 18.53 | 1.78 | 11.27 | 15.20 | 10.8 | 0.447 | 1 | 15 | 128 | 8.07 | 1.39 | 0.70 | 0.637 | 87.2 | 88.6 | 0.49 | 5.0 |
| c14-signs | 207.2 | 25.63 | 1.71 | 19.73 | 24.36 | 35.5 | 0.563 | 13 | 51 | 190 | 6.83 | 1.76 | 0.93 | 0.566 | 90.9 | 92.6 | 0.14 | 3.0 |
| c15-catch-reveal | 255.8 | 27.48 | 1.52 | 19.58 | 22.61 | 46.1 | 0.592 | 4 | 71 | 210 | 8.56 | 1.92 | 0.80 | 0.460 | 55.0 | 58.5 | 0.16 | 20.1 |
| c16-hud | 226.7 | 24.89 | 1.69 | 19.07 | 23.12 | 33.4 | 0.561 | 13 | 50 | 181 | 6.68 | 1.70 | 1.17 | 0.565 | 92.5 | 94.0 | 0.10 | 2.3 |
| c17-swarm-overview | 63.7 | 15.17 | 1.78 | 8.15 | 8.33 | 9.7 | 0.492 | 1 | 12 | 132 | 8.17 | 0.96 | 0.78 | 0.762 | 92.1 | 92.8 | 0.03 | 4.1 |
| m01-mossmere-calm | 208.5 | 22.29 | 1.59 | 16.48 | 21.77 | 39.9 | 0.642 | 16 | 51 | 186 | 6.43 | 1.73 | 1.07 | 0.571 | 91.7 | 93.1 | 0.05 | 2.6 |
| m02-mossmere-night | 153.1 | 21.84 | 1.86 | 13.15 | 17.06 | 16.9 | 0.542 | 4 | 20 | 155 | 7.58 | 1.33 | 0.98 | 0.675 | 88.7 | 89.8 | 0.22 | 3.2 |
| m03-raft-lantern | 223.4 | 22.29 | 1.27 | 11.43 | 6.03 | 40.7 | 0.621 | 0 | 49 | 233 | 10.67 | 1.79 | 0.24 | 0.473 | 18.0 | 18.8 | 0.08 | 54.3 |
| **POOLED** | **185.2** | **23.61** | **1.69** | **16.77** | **20.85** | **29.0** | **0.537** | **7** | **41** | **185** | **7.92** | **1.64** | **0.92** | **0.585** | **77.7** | **84.8** | **0.20** | **6.5** |

Reading it as the user would: the dark channel sits at 41–66 % of each frame's own brightness (a clear picture is well under
30 %), the dawn (c04) and the far view (c06) are the mistiest, and the phone frames are no sharper than the desktop ones
before the phone's own upscale is counted. Green-teal is a trace (0.20 % pooled) and must stay one.

Cost of a frame today (`--perf`, software GL, DPR 1; ms = min of 4 synchronous frames; passes: `RenderPass` → `UnrealBloomPass`
(1 high-pass + 10 blurs + 1 composite) → grade → `OutputPass`, no shadow map, no other scene render):

| tier | 960×540 calm / night: draw calls | triangles | ms | 390×844 (mobile, no MSAA) calm / night: draw calls | triangles | ms |
|---|---:|---:|---:|---:|---:|---:|
| low | 118 / 108 | 86 270 / 83 918 | 488 / 608 | 108 / 108 | 83 920 | 249 / 341 |
| medium | 119 / 109 | 127 822 / 125 472 | 1069 / 1380 | 109 / 109 | 125 468 | 374 / 394 |
| high | 119 / 109 | 156 622 / 154 270 | 1483 / 1759 | 109 / 109 | 154 268 | 435 / 467 |

(The swarm overview c17, 21 enemies up, is 124 draw calls and 172 152 triangles on high.)

## 3. What makes it soft, hazy and flat — ranked, with the measurement

Method: each cause was switched off (or scaled) against the same frozen frame on c01, c03, c06 and c07; the table gives the
mean of knob ÷ base (`baseline-iso.json`). p1 / p50 are differences in luma levels.

| # | cause | where | measured |
|---:|---|---|---|
| 1 | **Pixel-ratio caps**: a phone at DPR 3 renders at pr 1.5 (medium) or 1.0 (low) and the browser upscales 2–3×; high caps at 2.8 MP, so a 1440p or 4K monitor is upscaled too | `render.js:35–39` (TIERS), `:173–179` | at ½ scale: sharp ×0.17, eWidth ×1.69, acut ×0.83; at ⅓ scale: sharp ×0.09, eWidth ×2.07, acut ×0.73. The largest single loss, on exactly the devices that show it most |
| 2 | **Scene fog**: FogExp2 at 0.012–0.022, ×1.5 at night; 60 m of Mossmere air is 60 % fog by day and 87 % at night | `data.js:355, 392, 428, 461`; `world.js:230`; `render.js:115`; `world-fx.js:18–27` | fog off: sharp ×1.50, tileRms ×1.22, farRms ×1.25, stops ×1.20, p1 −6.5; fog halved: ×1.26 / ×1.13 / ×1.14; the night multiplier alone (night frames): sharp ×1.13, tileRms ×1.09 |
| 3 | **The fog is doing the lighting's job**: stone is near-ink (rock #181a2e ≈ 1–3 % reflectance), the rim is an unlit additive, and at night the ambient (0.55) outweighs the key (0.42), so light barely registers | `world-art.js:17–22` (KIT); `world.js:248–252`; `toon.js:57–61` | ambient ×0.6: the frame changes by 0.3 levels on average (max 12); ambient ×0.6 with key ×1.5: 0.6 levels. Fog off changes 23 % of the pixels by more than 8 levels. Take the fog away without lighting the stone and the far shore goes black (probe `c07…__clear-night`) |
| 4 | **Chromatic fringe** at rest (0.4, on medium / high) | `render-grade.js:69–76`; `render.js:75, :836` | off: sharp ×1.27 (raw lapVar ×1.36), eWidth ×0.96 |
| 5 | **MSAA softening with no sharpen** (4× on high) | `render.js:36–38, :154` | the low tier's render side (no MSAA, no fringe): sharp ×1.79, eWidth ×0.88; less fringe's ×1.27 that leaves ≈ ×1.4 for MSAA. MSAA stays (jaggies are not sharpness); a sharpen pays it back |
| 6 | **Bloom as a veil**: threshold 0.65–0.72 with a 0.22 knee blooms every rim-lit edge, radius 0.55–0.8, +15 % at night | `render.js:74, :126–127`; `data.js:358, 395, 431, 464`; `world.js:270–272` | off: sharp ×1.17, darkCh ×0.83, p50 −5.8, sat ×1.06; threshold 1.0 alone gets most of it (×1.10, darkCh ×0.87); radius 0.2 alone ×1.01; a harder knee alone ×0.96 |
| 7 | **Vignette** 0.35–0.5, +0.16 at night (cap 0.58) | `render-grade.js:102–104`; `world.js:276` | off: p50 +8.8, p1 +5.3, sharp ×1.15, tileRms ×1.08 — it buries about a third of the frame |
| 8 | **Mirrored-star "snow"**: the analytic star reflection is painted over all the water at 45–100 % strength, whatever the view angle | `water-shader.js:656–677`; `world.js:312` | off: speckLo ×0.44, sharp ×0.91. It gets *worse* as the haze lifts (lane A alone: speckLo ×1.32) |
| 9 | **Film grain** 0.04–0.07, +0.02 at night | `render-grade.js:126–129`; `world.js:278` | noise σ 1.7 levels; off: noise ×0.14, raw lapVar ×0.89 (sharp ×0.99: it is noise, not detail) |
| 10 | **The water's own fog and mist mirror**: full scene fog on the surface, the fresnel mixed to the fog colour, painted mist strokes | `water-shader.js:744, :579–592` | water fog off: sharp ×1.07, tileRms ×1.05; mist mirror halved: darkCh ×0.97, p50 −2.5 |
| 11 | **No cast shadows, no contact**: nothing casts or receives (`castShadow` appears only as `false` on outlines), the raft sits on the water without a footprint, the deck is evenly lit | `toon.js:94–95`; `water-shader.js:421–449` (the fake bands); c05, c15 | not separable by a knob; visible in c05 / c15 (see §6) |
| 12 | **Mist, shafts, motes** | `world-fx.js:412–431, :576–621, :314–409, :178–248`; amounts `world-art.js:1068–1075`, `world.js:233–235` | mist off: 3.4 % of pixels move > 8 levels, metrics ×1.00; shafts off: 5.4 % of pixels, darkCh ×0.98; motes off: 0.2 % of pixels. Small by day; the dawn is the exception (c04: the lowest sharp, the highest darkCh of the sail frames) |

Not causes (measured, so nobody spends time there): **lift** 0.6 (`render-grade.js:96`; off: at most 1 level — the blacks are
lifted by the fog colour and the bloom, not by the lift); **paper** 0.5 (`:117–124`; 0.6 levels mean, a ±4 % blotch — cut it
anyway, it is free); **tone mapping** (ACES at exposure 1.32, `render.js:31, :106`: Neutral darkens the frame 13 levels and
pushes saturation ×1.22, AgX flattens it — sharp ×0.57, sat ×0.74; either would be a repaint, so ACES stays); **outlines**
(`world-art.js:93–94`, 0.11 / 0.06 m; off: sharp ×0.98 — they are identity, keep them); the **toon ramp** (`toon.js:12–26`,
NearestFilter: hard bands already); the **far rings' mist** (`world-fx.js:92–93`; 0.08 % of pixels in the sail framing, the
rings are mostly behind the cliffs); **star size** (`starlight-glsl.js:40–41`, never under 0.75 px radius: crisp already).

Two probes show the direction (knobs only, nothing built): `tools/out/clarity/before/iso/*__clear-air.png` (lane A alone:
sharp ×2.21, eWidth ×0.88, tileRms ×1.28, farRms ×1.32, noise ×0.31) and `tools/out/clarity/probe/iso/*__clear-night-lit.png`
(the same air with the stone's reflectance ×2.4 and a stronger key: sharp ×2.08, farRms ×1.31, p50 ×0.97).

## 4. The gate (`tools/clarity-report.mjs --baseline=… --gate`)

Pooled over the frames shared with the baseline, after ÷ baseline:

| metric | target | why this number |
|---|---|---|
| sharp | **≥ 2.0×** | the air-and-lens probe alone reaches 2.2× with MSAA unchanged |
| acut | ≥ 1.2× | probe 1.24 before any sharpen or shadow edge |
| eWidth | ≤ 0.92× | probe 0.88 |
| tileRms | ≥ 1.2× | probe 1.24–1.28 |
| farRms | ≥ 1.3× | probe 1.31–1.34: the far shore has form |
| darkCh | **≤ 0.85×** (goal 0.7×) | half was tried: the dark channel of this picture is mostly the open water and the sky, which are *meant* to stay lavender; the probes reach 0.81–0.89 and halving it needs a darker frame, which the brief forbids |
| noise | ≤ 0.5× | grain to a dither |
| speckLo | ≤ 0.7× | the mirrored-star snow goes; needs lane B's water |
| stops | ≥ 1.1× | |
| p50 | 0.85–1.15× | clearer, not darker |
| lav | 0.85–1.15× (pooled 77.7 % → 66–89 %) | the lavender stays |
| sat | 0.95–1.2× | a relight, not a repaint |
| amb | 0.6–1.6× | amber stays the one warm light, neither drowned nor flooding |
| gt | ≤ 1.0 % pooled | |

Every frame: sharp ≥ 1.3× its baseline; p50 ≥ 0.8× its baseline and ≥ 12; black point 2 ≤ p1 ≤ 14 (close-ups c05 / m03 / c15
and the swarm overview c17 excepted): above the night floor, below a veil; vio no more than 8 points under its baseline; gt ≤ 2 %.

The merged build must pass the whole gate. A lane on its own is judged on its half:

- **Lane A alone**: sharp ≥ 1.8×, eWidth ≤ 0.92×, noise ≤ 0.5×, farRms ≥ 1.25×, stops ≥ 1.1×, lav, sat, gt; it may miss
  darkCh and speckLo, and p50 may fall to 0.8× (the far shore darkens until lane B lights it). Preview lane B's light with
  `--knobs='{"albedo":2.4,"hemi":0.63,"key":1.4}'` (night frames: `{"albedo":2.4,"hemi":0.81,"key":2.26}`).
- **Lane B alone**: it develops and shoots under lane A's target air, emulated with
  `--knobs='{"fog":0.34,"ringMist":0.5,"bloom":0.47,"bloomRadius":0.3,"bloomThreshold":0.92,"bloomKnee":0.1,"lift":0.3,"fringe":0,"paper":0,"grain":0.012,"vignette":0.65,"vignetteMul":1,"contrast":1.08}'`
  and is judged there on tileRms ≥ 1.2×, farRms ≥ 1.3×, darkCh ≤ 0.85×, speckLo ≤ 0.7×, p50, p1, lav, sat, amb, gt.

What the numbers cannot see, so look: shimmer (shoot a frame three times 0.05 s apart with `--settle=7`, `7.05`, `7.1`; rock,
deck and shadow edges must not crawl), rings round the raft, the hooked fish staying a dark shape, HUD legibility in c16.

## 5. LANE A — air & lens

Owns `src/render.js`, `src/render-grade.js`, `src/world.js`, `src/world-fx.js`, `src/starlight-glsl.js` and the palette / fog
/ grade numbers in `src/data.js`. It does not edit `src/world-art.js`: the air amounts that file sets (`:1068–1075`, the
particle table `:997–1015`) are scaled inside lane A's own builders and shaders in `world-fx.js` (a small `AIR` table there,
driven per frame from `world.js`).

### 5.1 Fog (`data.js` ZONES `palette.fogDensity`, `world.js:230`)

FogExp2 stays (a thin exponential-squared fog is the aerial tint: almost nothing near, lavender far). Fog colours do not
change. f(d) = 1 − exp(−(D·d)²).

| | The Mossmere | Sporewood | Glasswater | The Pallid Deep |
|---|---|---|---|---|
| `fogDensity` | 0.016 → **0.0055** | 0.019 → **0.0065** | 0.012 → **0.0042** | 0.022 → **0.0072** |
| fog at 60 m, day (was → is) | 60 % → 10 % | 73 % → 14 % | 40 % → 6 % | 82 % → 17 % |
| fog at 100 m, day | 92 % → 26 % | 97 % → 34 % | 76 % → 16 % | 99 % → 40 % |
| fog at 100 m, night | 99.7 % → 33 % | 100 % → 43 % | 96 % → 21 % | 100 % → 50 % |
| fog at 250 m (the far rings' own tint takes over there) | 85 % | 93 % | 67 % | 96 % |

- Night multiplier **1.5 → 1.15**: `density = fogDensity · (1 + 0.15·n − 0.1·w) · (1 + fogPush)`. Night fog colour, the night
  floors (`world.js:55`) and the dawn fog colour are unchanged.
- `FALLBACK_ZONE` (`world.js:15`), the arena default (`world-art.js:48`, lane B's file: leave it, it is overridden by data)
  and the cove's palette (`data.js:4286`, 0.014 → 0.005 when the cove is built) follow.
- This changes the v1 exports `ZONES` and `ZONE_BY_ID`: refresh the flag-off fingerprint on purpose
  (`node tools/validate-data.mjs --refresh-fingerprint`, and `--walk --refresh-fingerprint`) and name those two exports in the
  commit. Update the `fogDensity` row of DESIGN §19.2 and §19.1 "Mist" / "Layered depth" / "Phase response".

### 5.2 Mist, shafts, motes, stars (`world-fx.js`, `world.js:233–240`)

Mist becomes a dawn event, not a standing condition. `AIR` factors multiply what `world-art.js` already sets:

| effect | today | **target** |
|---|---|---|
| shore mist ring (`mistMaterial`) | amount 0.5·(1 − 0.35n) | × (0.30 + 0.55·w): thin by day and night, a real band at dawn |
| mist sheets (`createMistSheets`) | 12 (6 on low), amount 0.55 + 0.5n (thicker at night) | 6 (3 on low); × (0.25 − 0.10·n + 0.55·w); fade-in distance 4–14 m → 10–26 m (none in the lens) |
| light shafts (`createShafts`) | intensity shaftK = (1 − 0.9n)(1 + 0.35w) | × 0.45: thin moonbeams; pools × 0.6 |
| motes (`createParticles`) | 380 + 80 (Mossmere), per-lake tables | count × 0.6; motes of size ≥ 0.4 m at × 0.5 opacity; near fade 0.6–2.5 m → 1.5–5 m. Each lake keeps its own mote (spores, shards, ash) |
| far rings' bottom haze (`ringMaterial`) | uMistAmt 0.25–0.85, uVaultAmt 0.25–0.85 | × 0.5 in the shader |
| vault stars (`starlight-glsl.js`) | brightness 0.22 + 1.7·hb³; three layers | unchanged in number; *start*: 0.14 + 2.0·hb⁴ (fewer faint ones, the bright ones kept) — only if c03 / c07 then read cleaner; the gate's sharp must not be bought with stars |

### 5.3 Bloom (`data.js` zone `grade`, `render.js:74, :126–138`, `world.js:270–272`)

Only emitters bloom: the flame, the lantern glass, lit windows, lamp heads, the brightest glints, the gate. Not rim light,
not pale stone, not foam.

| | The Mossmere | Sporewood | Glasswater | The Pallid Deep |
|---|---|---|---|---|
| strength | 0.9 → **0.42** | 1.0 → **0.48** | 1.15 → **0.52** | 0.95 → **0.45** |
| radius | 0.6 → **0.30** | 0.75 → **0.34** | 0.55 → **0.28** | 0.8 → **0.36** |
| threshold | 0.7 → **0.92** | 0.68 → **0.90** | 0.65 → **0.90** | 0.7 → **0.92** |

Knee (`smoothWidth`) 0.22 → **0.10**. Night / dawn factor `(1 + 0.15n + 0.1w)` → **`(1 + 0.05w)`**. `GRADE_DEFAULT` follows the
Mossmere. The HDR clamp (`uBloomClamp`) stays. *Start*: mip weights toward the small mips (1.0, 0.7, 0.4, 0.2, 0.08). Event
pulses (`pulse({bloom})`) keep working on top.

### 5.4 Grade (`render-grade.js`, `render.js:70–77, :801–842`, `world.js:260–288`, zone `grade`)

| | today | **target** |
|---|---|---|
| exposure | zone 1.04 / 1.03 / 1.06 / 0.97, night × (1 − 0.14n) | zone unchanged; night × (1 − 0.11n). `BASE_EXPOSURE` 1.32 and ACES unchanged |
| contrast | 1.04 | **1.08** |
| saturation | 1.0 / 0.92 / 1.0 / 0.85, night × (1 − 0.1n) | **1.04 / 0.96 / 1.02 / 0.90**, night × (1 − 0.06n) |
| tint, tintAmount | zone tint × 0.2 → 0.28 at night | unchanged: the violet in the shadows is the fantasy cast |
| lift | 0.6 | 0.3 (it does nothing measurable; the blacks stay tinted) |
| vignette | 0.38 / 0.40 / 0.35 / 0.50; night + 0.16n, cap 0.58 | **0.24 / 0.26 / 0.22 / 0.32**; night + 0.08n, cap 0.40 |
| grain | 0.05 / 0.05 / 0.04 / 0.07; night + 0.02n | **0.012 / 0.012 / 0.010 / 0.016**; night + 0.004n: a dither against banding in the night sky, no more |
| chromatic fringe | 0.4 at rest on medium / high | **0 at rest**. Hits still fringe: `uFringe = fringe + 0.4·fringePulse + 0.3·danger` (today the pulse multiplies the resting value, so a zero would silence it) |
| paper | 0.5 on medium / high | **0, compiled out on every tier** (`GW_PAPER` 0) |
| sharpen (new, `uSharpen`) | — | **0.30** medium / high, 0.22 low. Five taps (centre + cross) on the bloomed HDR input *before* the grade and the grain: `col = clamp(col + (col − mean4)·2.2·uSharpen, min5, max5)`. Clamped to the neighbourhood's own range, so it steepens edges and cannot ring or halo, even round HDR-hot pixels |

### 5.5 Resolution and tiers (`render.js:35–39`)

| | low | medium | high |
|---|---|---|---|
| max pixel ratio | 1.0 (unchanged) | 1.5 → **1.75** | 2.0 |
| pixel budget `maxPx` | 1.0 MP | 1.9 → **2.1 MP** (1080p is native) | 2.8 → **3.7 MP** (1440p is native) |
| MSAA | 0 | 2 (0 on mobile) | 4 |
| bloom buffer scale | 0.5 → **0.4** | 0.75 → **0.5** | 1.0 → **0.75** (a tight bloom needs less) |
| bloom mips | 5 → **3** (`nMips`, weights of the last two 0) | 5 | 5 |
| paper / resting fringe | 0 / 0 | 0 / 0 | 0 / 0 |
| sharpen | 0.22 | 0.30 | 0.30 |
| screen-space pass | — | — | 1 (§5.6, stretch) |
| shadow map (lane B) | — | 1024², refreshed every second frame | 2048², every frame |
| planar reflection (lane B) | — (analytic) | ⅓ of the drawing buffer, every frame | ½ of the drawing buffer, every frame |

A phone at 390×844 DPR 3 on medium goes from 585×1266 (0.74 MP) to 682×1477 (1.0 MP). Low keeps its pixel count; what makes
it crisper is the air, the lens and the pre-upscale sharpen, paid for with the smaller bloom (if the measured low frame is not
cheaper than today's, drop its sharpen to 0).

### 5.6 The screen-space pass (high only, stretch)

One full-screen pass between `RenderPass` and the bloom, reading the HDR target's depth (a `DepthTexture` on the composer's
targets; check that the 4× MSAA target resolves its depth in three 0.170 — if it does not, the pass is dropped: a second
scene render for depth is not in the budget). Per pixel, from depth-reconstructed view positions and normals:

- contact shadow toward the lantern: 10 steps along the screen-space segment to the lantern's projected position, world
  length ≤ 0.6 m, thickness test 0.15 m; darkens only the lantern's share (weight = how warm the pixel is);
- contact shadow toward the key light: 8 steps, ≤ 1.0 m, fades out where the shadow map already shadows;
- ambient occlusion: 6 taps on a spiral, radius 0.5 m, in the creases (plank gaps, the Wick on the deck, rock on water).

Output multiplies the colour toward the zone's violet tint (never toward black), strength ≤ 0.55, interleaved-gradient noise
with a 4-tap depth-aware blur. It ships only if: no halo round the Wick or the rod against the water, no crawl in the three
0.05 s-apart shots, nothing on the sky, and it holds the budget (§10). If any of those fail, it is left out and the gate
still passes without it.

## 6. Depth without fog

1. **Tonal layering.** Near: full contrast, ink outlines, the amber pool. Mid lake (20–60 m): lit faces at about today's
   apparent value, shadow faces two toon steps down, their shadows lying on the water. Far shore and ruins (60–160 m): the
   same forms 10–40 % toward lavender (the thin fog), windows still amber. Beyond the cliffs: the parallax rings keep their
   pre-mixed ink → luminous-`far` ladder and melt into the lavender horizon.
2. **Lavender aerial tint only at distance**: §5.1's curve — under 3 % at 30 m, 10–17 % at 60 m, 16–40 % at 100 m.
3. **Rim light with a direction**: the pale rim sits on the side facing the key (§7), so a silhouette separates from the
   water behind it by a lit edge, not by a veil.
4. **The water carries distance too**: near water is deep and dark with crisp glints, far water mirrors the shore and the
   sky (Fresnel), so the lake has a near, a middle and a far.

## 7. The lighting model (LANE B)

| light | today | **target** |
|---|---|---|
| **Key**: the moon / vault glow, `DirectionalLight` | "crack light", almost straight down (lean 0.12–0.22 on a random azimuth), 1.5·(1 − 0.72n)·(1 + 0.25w): 0.42 at night | a fixed three-quarter back key per lake, **2.1·(1 − 0.55n)·(1 + 0.15w)**: 2.1 calm, ≈ 1.5 mid-dusk, **0.95 at night**. Colour: the lake's `light` 25 % toward lavender #c4b8ff, at night 30 % toward #0b0d2e as now, at dawn 55 % toward #f2cfa4 |
| key direction (azimuth from north, + east; elevation) | random per lake | *start*: Mossmere −62° / 36°, Sporewood −48° / 42°, Glasswater −70° / 30°, the Pallid Deep −38° / 50° (toward-light vector (sin az·cos el, sin el, −cos az·cos el); Mossmere = (−0.71, 0.59, −0.38)). From upper left behind the scene: rims on the left and top, shadows falling toward the camera and to the right, the glitter path up-left. ±12° is the lane's to tune. The light shafts lean along the same azimuth |
| **Ambient**: `HemisphereLight` | sky = `ambient` 35 % toward `light`, 1.15·(1 − 0.52n)·(1 + 0.15w): 0.55 at night | sky = `ambient` 20 % toward `light` (more violet), ground unchanged; **0.72·(1 − 0.38n)·(1 + 0.15w)**: 0.45 at night. Key : fill goes from 1.3 : 1 (day) and 0.76 : 1 (night) to 2.9 : 1 and 2.1 : 1 |
| **Lantern**: `PointLight` #ffb05a | 9.5, decay 1.45 | the one warm light, unchanged in colour and reach; decay **2** (inverse square) with the intensity raised so the deck at 1.5 m is lit as today (≈ 11.9); no shadow map of its own |
| accents (2 point lights) | as is | unchanged |

**Cast shadow** (medium, high): one map from the key. Orthographic box of half-size 42 m (high) / 34 m (medium) around the
camera's focus pushed 12 m up-screen, snapped to whole texels in light space; `PCFSoftShadowMap` on high, `PCFShadowMap` on
medium; *start* bias −0.0004, normalBias 0.04; shadow intensity 0.85 (a shadow keeps 15 % of the key and all of the violet
ambient: violet, never black). Casters: islands, pillars, statues, docks and props inside the box, the raft and everything
on it, the Wick, Murk's barge, enemies. Not casters: outlines, the dome, the rings, particles, the water. Receivers: every
toon material, and the water (§8.2).

**Night stays readable**: the night floors stay; the key never falls under 0.9 and the ambient never under 0.42 while a run
is on; a shadow at night never renders under luma 12.

## 8. Materials and water (LANE B)

Owns `src/toon.js`, `src/world-art.js`, `src/water.js`, `src/water-shader.js`, `src/models*.js`, `src/actors*.js`; plus marked
blocks in `render.js` and one in `world.js` (§11). Stylised, hand-made shapes stay: no new realistic meshes.

### 8.1 Stone, wood, actors

- **Reflectance, so light can register** (`world-art.js:17–22` KIT; hue kept, scaled in linear RGB; *start*): rock × 2.6,
  rockHi × 2.0, moss × 1.6, mossHi × 1.3, wood × 1.4; stone, bone, cap and iron unchanged. The target is on screen, in the
  sail frames, a 9×9 px patch: a key-lit rock face at 25–40 m reads luma 95–140 at calm and 45–75 at night (where today's
  fog-lifted faces sit: ±15 % luma, hue ±8°); its shadow side 35–60 / 16–30; a cast shadow on lit stone is at least two toon
  steps under the lit value.
- **Toon ramp** (`toon.js:12–26`): three hard steps stay. The rim (`:57–61`) takes the key's direction:
  rim × mix(0.25, 1, smoothstep(−0.2, 0.6, N·L_key)) (`directionalLights[0].direction` is already in the shader).
- **Wet stone and wood**: inside 0.6 m of the waterline (the band `colorRock` already darkens) a one-step specular glint from
  the key (and from the lantern within 8 m): `step(0.9, pow(N·H, 64))` × 0.35; the deck takes a fainter one (× 0.15) and a
  ±8 % value variation per plank.
- **Contact**: the Wick, the bucket, the brazier and the mast cast on the deck (the shadow map); on high the screen-space pass
  adds the creases.
- **Outlines**: weights unchanged; they are not drawn into the shadow map or the reflection.
- Per-material fog taming (`inkToon` fogScale / fogMax at `world-art.js:90–91, 156, 270, 749`) stays as it is.

### 8.2 Water

Medium and high (`GW_LOW` keeps today's analytic path, with the mirrored stars × 0.4 and only on grazing water,
`smoothstep(0.55, 0.85, 1 − N·V)`):

- **Planar reflection.** A virtual camera mirrored about y = 0 (position, target and up reflected; an oblique near plane at
  the water; three's `Reflector` is the reference), rendered once a frame before the main render (hook §11) into a target of ½
  (high) or ⅓ (medium) of the drawing buffer, half-float, no MSAA. Drawn into it (a `layers` bit set by lane B on what it
  builds): the vault dome, the parallax rings, the cliffs, islands, pillars and the hero architecture, the raft and the
  Wick, Murk's barge, lamp heads, halos and other emissive sprites. Not drawn: the water, outlines, motes, mist, shafts,
  foam, fishing line and float, the hooked fish's shape, enemies (high may add them), UI anchors. Budget ≤ 50 draw calls.
- **Sampling.** Projective lookup at the fragment's flat-plane position, offset by the ripple normal:
  `uv += N.xz · vec2(1.0, 2.2) · 0.045 · clamp(8 / camDist, 0.15, 1)` (*start*: taller than wide, so reflections smear
  vertically as they do on real ripples); a mirrored tower must still read as a tower, the smear ≤ 12 px at 20 m at 960×540.
- **Fresnel, unbanded.** F = 0.03 + 0.97·(1 − N·V)⁵, lifted for the art: `clamp(1.5·F + 0.03, 0, 0.9)` — ≈ 11 % under the
  sail camera at the raft, ≈ 29 % in the close-up, 90 % toward the far shore. `col = mix(body, reflection × 0.85, F)`.
- **Body.** Deep → shallow by the depth map as now; with reflections weak near the camera the near water shows its deep
  colour: by day, outside the lantern pool, it reads ≤ 0.65× today's luma. **At the Gloomtide the water keeps today's
  floor** (`NIGHT_WATER_MIN` / `NIGHT_DEEP_MIN`, `world.js:55, :293–296`; near-water luma within ±10 % of the baseline in c03
  and c17): an ink-black gloomling has to stay a silhouette on it. Night depth comes from reflections and glints, not from
  darker water. The fog-colour sky mix (`:579–581`) and the mist strokes
  (`:584–592`) go on this path; the caustic and the depth read stay.
- **Glints.** A specular from the key on the ripple normals, `pow(max(dot(reflect(−L, N), V), 0), 180)` cut hard
  (`smoothstep(0.55, 0.75, s)`), key-coloured, absent in cast shadow: a broken glitter path toward the key. The lantern does
  the same in amber within 10 m. The dashed streak fake (`:628–647`) is replaced by the true reflection of the lantern and
  its flame plus these glints.
- **Shadows on the water.** The key's shadow map is sampled in the water shader: in shadow the glints go and the body
  darkens × 0.8, so islands, ruins and the raft lay their shapes on the lake.
- **The hull.** Under the raft a filled, feathered footprint (darkest at the hull, gone within 0.9 m), never a band or a
  ring round it.
- The mirrored-star term (`:656–677`), the dark-band reflections and the cliff band (`:434–449`) leave this path: the
  reflection carries the real ones. Signs, ripples, wakes, foam, the Glowtide and the light pools are unchanged.

## 9. What must not change

- **Never a ring around the raft or the player** — no reach ring, no banded pool, no circular reflection or shadow artefact,
  no ringed contact footprint. Check c05, c15, m03 after every water or light change (c15's soft pool edge at ≈ 5 m is the
  existing feathered reach and must not gain a rim).
- **Green and teal (hue 65–195°) stay a rare trace**: `tools/hue-report.mjs` ≤ 1 % pooled, ≤ 2 % a frame. No new light,
  glint, shadow tint or reflection tint may sit in that band.
- **The Starlit hues stay recognisably the same**: no palette hex in `ZONES` changes except `fogDensity` and the `grade`
  numbers of §5; each lake keeps its hue at every phase (DESIGN §19.2); the lavender share holds (§4).
- **The UI is untouched.** Neither lane edits `src/ui*.js` or `src/ui.css`. If c16 or a phone frame shows HUD text losing
  contrast over the brighter, sharper water, report the frame to the integrator; the only allowed fix is a text-shadow or
  veil tweak in the HUD's CSS.
- **The fish on the line stays a hidden dark shape until landed** (v3 automatic fishing): no light, glint, shadow, reflection
  or sharpen may make it identifiable; it is not drawn into the reflection.
- **Gameplay readability, at 390×844 and at 960×540**: the raft, the float, the fish signs (c14), enemies and telegraphs
  (c17) read at least as well as today. Nights get clearer, not darker (§4 floors). In c17 today the swarm's eyes compete
  with the mirrored-star specks all over the water; with those gone the eyes must be the brightest specks on the lake.
- **Stylised shapes.** "Slightly more real" is light, shadow, material response and water — not new meshes, not PBR.
- **The flag-off game shares the look**; nothing here goes behind `V3_ENABLED`.
- Hollow Knight and Elden Ring are inspiration only: no asset, shape or UI of either.

## 10. Performance budget

| tier | passes after | draw calls (all passes) | frame time in software GL vs today |
|---|---|---|---|
| low | the same four; bloom with 3 mips; **no** shadow map, **no** reflection, **no** extra pass | ≤ today (118 / 108) | **≤ 1.0×** (488 / 608 ms at 960×540; 249 / 341 ms at 390×844) |
| medium | + shadow map (1024², every second frame, ≤ 45 calls) + reflection (⅓ res, ≤ 45 calls) | ≤ 210 | ≤ 1.35× |
| high | + shadow map (2048², ≤ 55 calls) + reflection (½ res, ≤ 50 calls) + at most one screen-space pass | ≤ 230 | ≤ 1.5× |

Report before → after per tier from `--perf` (`perf.json`, `perf-phone.json`): draw calls, triangles, the pass list and
msSoftwareGL, against `baseline-perf.json`.

## 11. Ownership and seams

| | LANE A — air & lens | LANE B — light & surfaces |
|---|---|---|
| files | `src/render.js`, `src/render-grade.js`, `src/world.js`, `src/world-fx.js`, `src/starlight-glsl.js`; fog / grade numbers in `src/data.js`; DESIGN §19 text for them | `src/toon.js`, `src/world-art.js`, `src/water.js`, `src/water-shader.js`, `src/models*.js`, `src/actors*.js` |
| also | the optional screen-space pass (it lives in the post chain) | marked blocks in `render.js`, one marked block in `world.js` |

Lane B's blocks are fenced `// >>> CLARITY LANE B: <name>` … `// <<< CLARITY LANE B` and lane A edits nothing inside them:

1. `render.js`, by the renderer setup (`:102–110`): **shadow map** — `renderer.shadowMap` on / type / refresh per tier.
2. `render.js`, its own table next to `TIERS` (`:35–39`): **tier settings** — `const TIERS_B = { low: { shadow: 0, reflect: 0 },
   medium: { shadow: 1024, shadowEvery: 2, reflect: 1 / 3 }, high: { shadow: 2048, shadowEvery: 1, reflect: 0.5 } }`, applied
   from `applyTier` by one call. Lane A owns `TIERS` itself and adds its own keys there (`sharpen`, `ssPass`, bloom mips).
3. `render.js`, in `api.render()` (`:967–971`), before `composer.render`: **the planar-reflection hook** — one call,
   `ctx.water?.renderReflection?.(renderer, scene, camera, tierB)`; the water module owns the target, the virtual camera and
   the layer mask. `renderer.info.reset()` stays before it, so the frame's counters include it.
4. `world.js`: **the key light** — the light creation (`:26–31`) and a function `applyKeyLight(n, w, zc, focus)` that sets the
   hemisphere and the directional light (colour, intensity, direction, shadow box); `applyAtmosphere`'s `// lights` lines
   (`:247–252`) become that one call and `buildVisuals` no longer points the light down the crack (`:152–154`). Lane A leaves
   those three places alone and keeps `hemi` / `dir` out of its edits.

Seams the lanes share without touching each other's files: the fog is `scene.fog` (lane A sets it, lane B's shaders read
it); `env` (`world.js:51`) keeps its fields (`night`, `warm`, `fog`, `fogDensity`, `glowK`, `shaftK`, `partK`, star and
nebula values) — lane A may add fields, never rename; the water palette call (`world.js:291–315`) keeps its shape.

## 12. Acceptance

A lane's commit, and the merged build, pass when all of this holds:

1. `node tools/check.mjs`; `node tools/validate-data.mjs` and `--walk`, `--v3` (fingerprint refreshed only for the deliberate
   fog / grade change, the exports named in the commit).
2. `tools/scenario-run.mjs` via `tools/playtest.mjs` on the flag-off minified build and on the v3 build: ALL INVARIANTS HOLD,
   0 page / console / ctx errors.
3. The clarity set re-shot (desktop and phone), `tools/clarity-report.mjs --baseline=docs/v3/clarity/baseline-metrics.json
   --gate` green for the lane's half (§4) — the whole gate for the merge — and `tools/hue-report.mjs` ≤ 1 % pooled.
4. `--perf` within §10, reported before → after per tier.
5. The frames looked at, as the user would: across the lake by day and by night (c06, c07), the raft by lantern light (c05,
   m03), the four lakes still themselves (c08–c13), signs and the catch (c14, c15), the HUD (c16), the swarm (c17), the phone (m01–m03); no
   ring, no green, no identifiable hooked fish, no shimmer.
6. DESIGN §19 updated where its numbers moved (§19.1 Mist / Layered depth / Phase response, §19.2 table); CONTRACT only if an
   API changed (`water.renderReflection` is new).

## 13. The merged build (stager's record)

`gw-clarity` = lane A (`gw-clarity-air`) + lane B (`gw-clarity-surf`), then harmonised by eye against the user's words over
three rounds of the clarity set. What the combination needed, beyond both lanes' own numbers:

| what the merge showed | change |
|---|---|
| two floors stacked (lane A's ink floor in the grade under lane B's violet floor on every surface): lifted blacks | `lift` 0.3 → **0.22**; the toon floor at night (0.18 + 0.66n) → **(0.18 + 0.56n)** |
| the near water's mirror broke into value-noise cells ("scales"), the glitter into flakes | the fine ripples are four warped wavelet trains (`fineGrad`); the base lookup nudge 0.062 → **0.05**; glints are tight lobes (110 / 90) on the wavelets' normals inside sparse patches: short strokes strung toward the light |
| the near lake a flat dark fill on a phone frame | the water body takes the key light on the faces of its chop and ripples (±20–34 %), and is ×1.2 fuller by day |
| the far water under a mirrored cliff near black at night (c07 median 0.78×) | the mirror image takes the lake's night floor back where it is dark |
| fish signs lost against the mirrored shore (c14: two of four) | a sign's ink, rings and slick stop the mirror; strokes ×2.8, slick sheen ×0.2 |
| the dawn a veil (black point 18) | dawn hemisphere warms 25 % → **10 %**, its boost 15 % → 5 %; water's dawn mist 0.3w → 0.2w; grade contrast +0.09·w |
| straight swell fronts striping the lake under the new water shading | the lean shading takes 30 % of the swell |

The low tier shares what costs nothing: the fuller day water (`base` × 1.2 by day) and the mood uniform (`uMood`) are on
every tier.

The screen-space pass (§5.6) is left out (lane A measured it: not clean in the close-up, invisible at the sail camera).

Cost of the merged build against `9bc3e35` (`tools/tests/clarity-perf.scenario.mjs`, which now keeps the shadow map's beat;
the Mossmere from the spawn, calm / Gloomtide; CPU ms per frame in software GL, the same machine, base and merged run in turn):

| tier | draw calls 960×540 | triangles | passes | frame time 960×540 | frame time 390×844 |
|---|---|---|---|---|---|
| low | 112 / 108 → 107 / 103 | 84 k → 84 k | scene → bloom (3 mips) → grade; no `OutputPass`, no shadow map, no mirror | 1.01× / 0.97× (three interleaved pairs, spread ± 6 %) | 0.95× / 0.92× |
| medium | 110 / 109 → 186 / 172 (147 / 146 between shadow refreshes) | 125 k → 207 k / 199 k | shadow map 1024² every second frame → mirror (⅓ res, 38 calls, 44 k triangles) → scene → bloom → grade | 1.08× / 1.11× | 1.05× / 0.83× |
| high | 110 / 109 → 186 / 172 | 154 k → 236 k / 227 k | shadow map 2048² every frame → mirror (½ res, 38 calls, 44 k triangles) → scene → bloom → grade | 1.02× / 1.04× | 1.09× / 1.09× |
Gate on the merged build: see the commit and `tools/out/clarity/after/metrics.json` (misses, with the reason: `stops` — the
baseline's night blacks were 0–2, under this gate's own floor of 2; `darkCh` — the true mirror lays the bright vault on the
lake; the per-frame median on the two phone frames whose baseline median was fog and bloom).
